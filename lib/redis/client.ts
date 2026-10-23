/**
 * Devyx Redis Client — Singleton for server-side state (queue + token budget)
 * Connects to local n8n_redis Docker container on port 6379
 * Falls back to an in-memory Map when Redis is unavailable (dev without Docker)
 */

import type { Redis } from "ioredis";

let redisClient: Redis | null = null;
let redisAvailable = false;

/**
 * Returns a Redis instance, lazily initialized.
 * Safe to call repeatedly — returns the same singleton.
 */
export async function getRedisClient(): Promise<Redis | null> {
  if (redisClient) return redisClient;

  try {
    // Dynamic import so build works even if ioredis isn't installed
    const { default: IORedis } = await import("ioredis");
    const redisUrl = process.env.REDIS_URL;

    const client = redisUrl
      ? new IORedis(redisUrl, {
          connectTimeout: 3000,
          maxRetriesPerRequest: 1,
          lazyConnect: true,
          enableOfflineQueue: false,
          tls: redisUrl.startsWith("rediss://") ? { rejectUnauthorized: false } : undefined,
        })
      : new IORedis({
          host: process.env.REDIS_HOST || "127.0.0.1",
          port: parseInt(process.env.REDIS_PORT || "6379"),
          password: process.env.REDIS_PASSWORD || undefined,
          connectTimeout: 2000,
          maxRetriesPerRequest: 1,
          lazyConnect: true,
          enableOfflineQueue: false,
        });

    await client.connect();
    await client.ping();
    redisClient = client;
    redisAvailable = true;
    return client;
  } catch {
    redisAvailable = false;
    return null;
  }
}

export function isRedisAvailable() {
  return redisAvailable;
}

export interface StoredChatTurn {
  role: "user" | "assistant";
  content: string;
}

/**
 * Retrieve recent conversation history for a given session from Redis.
 */
export async function getSessionHistory(
  sessionId: string
): Promise<StoredChatTurn[]> {
  if (!sessionId) return [];
  const client = await getRedisClient();
  if (!client) return [];

  try {
    const raw = await client.get(`chat:history:${sessionId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Append a user message and assistant reply to the session history in Redis.
 * Keeps up to the latest 16 turns and sets a 24-hour expiration (86400s).
 */
export async function appendSessionHistory(
  sessionId: string,
  userMessage: string,
  assistantReply: string
): Promise<void> {
  if (!sessionId) return;
  const client = await getRedisClient();
  if (!client) return;

  try {
    const history = await getSessionHistory(sessionId);
    if (userMessage && userMessage.trim()) {
      history.push({ role: "user", content: userMessage.trim().slice(0, 2000) });
    }
    if (assistantReply && assistantReply.trim()) {
      history.push({ role: "assistant", content: assistantReply.trim().slice(0, 2000) });
    }
    const trimmed = history.slice(-16);
    await client.set(`chat:history:${sessionId}`, JSON.stringify(trimmed), "EX", 86400);
  } catch (err) {
    console.warn("[Redis History Append Failed]", err);
  }
}
