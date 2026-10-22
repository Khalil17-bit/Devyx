/**
 * Devyx Chat Request Queue
 *
 * Prevents thundering-herd when multiple users send messages simultaneously.
 * Uses Redis sets/maps for distributed locking; falls back to in-memory Map.
 *
 * Strategy:
 *   - Each session can have ONE in-flight request at a time.
 *   - If a second message arrives while first is processing → queued.
 *   - Returns { status: "queued", position, estimatedWaitMs } so the client
 *     can show a "2 users ahead of you" notification.
 *   - When position reaches 0, a follow-up poll resolves the result.
 *
 * Global concurrency cap: MAX_GLOBAL_CONCURRENT_REQUESTS
 * When global cap is hit, requests queue globally (not just per-session).
 */

import { getRedisClient } from "@/lib/redis/client";

const GLOBAL_QUEUE_KEY = "devyx:chat:global_queue";
const IN_FLIGHT_KEY = "devyx:chat:inflight";
const MAX_GLOBAL_CONCURRENT = 5; // Max simultaneous AI requests
const AVG_REQUEST_MS = 8_000; // Average request latency for wait estimation

// In-memory fallback
const memInFlight = new Set<string>();
let memGlobalConcurrent = 0;

export interface QueueState {
  status: "proceed" | "queued";
  position?: number;
  estimatedWaitMs?: number;
  globalConcurrent?: number;
}

/**
 * Attempts to acquire a "slot" for this session.
 * If global concurrency is at max, returns queued state.
 */
export async function acquireChatSlot(sessionId: string): Promise<QueueState> {
  try {
    const redis = await getRedisClient();

    if (redis) {
      // Check current global concurrent count
      const currentConcurrent = parseInt(await redis.get(IN_FLIGHT_KEY) || "0");

      if (currentConcurrent >= MAX_GLOBAL_CONCURRENT) {
        // Add to queue if not already there
        const score = Date.now();
        await redis.zadd(GLOBAL_QUEUE_KEY, score, sessionId);

        // Calculate position
        const rank = await redis.zrank(GLOBAL_QUEUE_KEY, sessionId);
        const position = (rank ?? 0) + 1;
        const waitMs = position * AVG_REQUEST_MS;

        return { status: "queued", position, estimatedWaitMs: waitMs, globalConcurrent: currentConcurrent };
      }

      // Increment in-flight counter and remove from queue if present
      await redis.pipeline()
        .incr(IN_FLIGHT_KEY)
        .expire(IN_FLIGHT_KEY, 120) // safety: reset after 2 min if server crashes
        .zrem(GLOBAL_QUEUE_KEY, sessionId)
        .exec();

      return { status: "proceed", globalConcurrent: currentConcurrent + 1 };
    }
  } catch {
    // Fall through to memory fallback
  }

  // In-memory fallback
  if (memGlobalConcurrent >= MAX_GLOBAL_CONCURRENT) {
    return { status: "queued", position: 1, estimatedWaitMs: AVG_REQUEST_MS, globalConcurrent: memGlobalConcurrent };
  }

  memGlobalConcurrent++;
  return { status: "proceed", globalConcurrent: memGlobalConcurrent };
}

/**
 * Releases the slot after request completes (success or failure).
 * Must always be called in a finally block.
 */
export async function releaseChatSlot(sessionId: string): Promise<void> {
  try {
    const redis = await getRedisClient();
    if (redis) {
      const current = parseInt(await redis.get(IN_FLIGHT_KEY) || "1");
      if (current > 0) {
        await redis.decr(IN_FLIGHT_KEY);
      }
      return;
    }
  } catch {
    // Fall through
  }
  if (memGlobalConcurrent > 0) memGlobalConcurrent--;
}

/**
 * Returns current queue position (for polling endpoint).
 * Returns 0 if not in queue (can proceed).
 */
export async function getQueuePosition(sessionId: string): Promise<number> {
  try {
    const redis = await getRedisClient();
    if (redis) {
      const rank = await redis.zrank(GLOBAL_QUEUE_KEY, sessionId);
      return rank === null ? 0 : rank + 1;
    }
  } catch {
    // Fall through
  }
  return 0;
}
