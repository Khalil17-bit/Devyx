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
    const client = new IORedis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: parseInt(process.env.REDIS_PORT || "6379"),
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
