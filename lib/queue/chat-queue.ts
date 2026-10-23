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
const MAX_GLOBAL_CONCURRENT = 4; // Max simultaneous AI requests to preserve rate limits
const AVG_REQUEST_MS = 1_200; // Realistic request latency for sub-second LPU responses

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
 * Attempts to acquire an execution slot for this session.
 * Features an internal micro-wait (up to 350ms) to absorb momentary concurrency spikes
 * before returning a queued state to the client.
 */
export async function acquireChatSlot(sessionId: string): Promise<QueueState> {
  try {
    const redis = await getRedisClient();

    if (redis) {
      // 1. Initial concurrency check
      let currentConcurrent = parseInt((await redis.get(IN_FLIGHT_KEY)) || "0");

      // 2. Micro-wait: if briefly at cap, wait up to 350ms (2x 175ms) for an in-flight turn to finish
      if (currentConcurrent >= MAX_GLOBAL_CONCURRENT) {
        await new Promise((r) => setTimeout(r, 175));
        currentConcurrent = parseInt((await redis.get(IN_FLIGHT_KEY)) || "0");
        if (currentConcurrent >= MAX_GLOBAL_CONCURRENT) {
          await new Promise((r) => setTimeout(r, 175));
          currentConcurrent = parseInt((await redis.get(IN_FLIGHT_KEY)) || "0");
        }
      }

      // 3. If still at max capacity, register in global sorted queue
      if (currentConcurrent >= MAX_GLOBAL_CONCURRENT) {
        const score = Date.now();
        await redis.zadd(GLOBAL_QUEUE_KEY, score, sessionId);

        const rank = await redis.zrank(GLOBAL_QUEUE_KEY, sessionId);
        const position = (rank ?? 0) + 1;
        const waitMs = Math.max(1200, position * AVG_REQUEST_MS);

        return {
          status: "queued",
          position,
          estimatedWaitMs: waitMs,
          globalConcurrent: currentConcurrent,
        };
      }

      // 4. Increment in-flight counter and remove from queue if present
      await redis
        .pipeline()
        .incr(IN_FLIGHT_KEY)
        .expire(IN_FLIGHT_KEY, 120) // Safety TTL: 2 minutes
        .zrem(GLOBAL_QUEUE_KEY, sessionId)
        .exec();

      return { status: "proceed", globalConcurrent: currentConcurrent + 1 };
    }
  } catch {
    // Fall through to memory fallback
  }

  // In-memory fallback with micro-wait
  if (memGlobalConcurrent >= MAX_GLOBAL_CONCURRENT) {
    await new Promise((r) => setTimeout(r, 200));
    if (memGlobalConcurrent >= MAX_GLOBAL_CONCURRENT) {
      return {
        status: "queued",
        position: 1,
        estimatedWaitMs: AVG_REQUEST_MS,
        globalConcurrent: memGlobalConcurrent,
      };
    }
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
