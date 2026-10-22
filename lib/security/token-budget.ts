/**
 * Devyx Token Budget Rate Limiter
 *
 * Tracks approximate token usage per IP hash and per session using Redis.
 * Falls back to an in-memory Map when Redis is unavailable.
 *
 * Budget caps:
 *   - 60,000 tokens / IP / day  (protects API costs for heavy users)
 *   - 8,000 tokens / session (single chat session cap)
 *
 * Token estimation: 1 token ≈ 4 characters (conservative estimate)
 */

import { getRedisClient } from "@/lib/redis/client";

// In-memory fallback (resets on server restart)
const memoryBudget = new Map<string, number>();

const DAILY_TOKEN_LIMIT = 60_000;
const SESSION_TOKEN_LIMIT = 8_000;

/**
 * Estimates token count from raw text length.
 * Uses the standard ~4 chars/token heuristic.
 */
export function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

interface BudgetCheckResult {
  allowed: boolean;
  reason?: "daily_limit" | "session_limit";
  dailyUsed: number;
  sessionUsed: number;
  dailyRemaining: number;
  sessionRemaining: number;
}

/**
 * Checks token budget and records usage if within limits.
 * Returns { allowed: false } with reason when budget is exceeded.
 */
export async function checkAndRecordTokenBudget(
  ipHash: string,
  sessionId: string,
  messageTokens: number
): Promise<BudgetCheckResult> {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const dailyKey = `devyx:tokens:daily:${ipHash}:${today}`;
  const sessionKey = `devyx:tokens:session:${sessionId}`;

  try {
    const redis = await getRedisClient();

    if (redis) {
      // Use Redis INCRBY for atomic counters
      const [[, dailyUsed], [, sessionUsed]] = await redis
        .pipeline()
        .incrby(dailyKey, messageTokens)
        .incrby(sessionKey, messageTokens)
        .exec() as [Error | null, number][];

      // Set TTL on first write
      await redis.pipeline()
        .expire(dailyKey, 86_400) // 24h TTL
        .expire(sessionKey, 3_600) // 1h session TTL
        .exec();

      const realDaily = dailyUsed ?? messageTokens;
      const realSession = sessionUsed ?? messageTokens;

      if (realDaily > DAILY_TOKEN_LIMIT) {
        // Rollback the over-spend
        await redis.pipeline()
          .decrby(dailyKey, messageTokens)
          .decrby(sessionKey, messageTokens)
          .exec();
        return {
          allowed: false,
          reason: "daily_limit",
          dailyUsed: realDaily - messageTokens,
          sessionUsed: realSession - messageTokens,
          dailyRemaining: 0,
          sessionRemaining: Math.max(0, SESSION_TOKEN_LIMIT - (realSession - messageTokens)),
        };
      }

      if (realSession > SESSION_TOKEN_LIMIT) {
        await redis.pipeline()
          .decrby(dailyKey, messageTokens)
          .decrby(sessionKey, messageTokens)
          .exec();
        return {
          allowed: false,
          reason: "session_limit",
          dailyUsed: realDaily - messageTokens,
          sessionUsed: realSession - messageTokens,
          dailyRemaining: Math.max(0, DAILY_TOKEN_LIMIT - (realDaily - messageTokens)),
          sessionRemaining: 0,
        };
      }

      return {
        allowed: true,
        dailyUsed: realDaily,
        sessionUsed: realSession,
        dailyRemaining: Math.max(0, DAILY_TOKEN_LIMIT - realDaily),
        sessionRemaining: Math.max(0, SESSION_TOKEN_LIMIT - realSession),
      };
    }
  } catch {
    // Fall through to memory fallback
  }

  // In-memory fallback
  const dailyKey2 = `daily:${ipHash}`;
  const sessionKey2 = `session:${sessionId}`;
  const dailyUsed = (memoryBudget.get(dailyKey2) || 0) + messageTokens;
  const sessionUsed = (memoryBudget.get(sessionKey2) || 0) + messageTokens;

  if (dailyUsed > DAILY_TOKEN_LIMIT) {
    return {
      allowed: false,
      reason: "daily_limit",
      dailyUsed: dailyUsed - messageTokens,
      sessionUsed: sessionUsed - messageTokens,
      dailyRemaining: 0,
      sessionRemaining: Math.max(0, SESSION_TOKEN_LIMIT - (sessionUsed - messageTokens)),
    };
  }

  if (sessionUsed > SESSION_TOKEN_LIMIT) {
    return {
      allowed: false,
      reason: "session_limit",
      dailyUsed: dailyUsed - messageTokens,
      sessionUsed: sessionUsed - messageTokens,
      dailyRemaining: Math.max(0, DAILY_TOKEN_LIMIT - (dailyUsed - messageTokens)),
      sessionRemaining: 0,
    };
  }

  memoryBudget.set(dailyKey2, dailyUsed);
  memoryBudget.set(sessionKey2, sessionUsed);

  return {
    allowed: true,
    dailyUsed,
    sessionUsed,
    dailyRemaining: Math.max(0, DAILY_TOKEN_LIMIT - dailyUsed),
    sessionRemaining: Math.max(0, SESSION_TOKEN_LIMIT - sessionUsed),
  };
}

/**
 * Returns localized rate limit exceeded message
 */
export function getTokenLimitMessage(reason: "daily_limit" | "session_limit", language: string): string {
  if (reason === "session_limit") {
    if (language === "darija" || language === "ar-MA")
      return "وصلنا للحد الأقصى ديال الرسائل لهاد الجلسة (8,000 توكن). دير جلسة جديدة باش تكمل معانا.";
    if (language === "ar")
      return "تم الوصول إلى الحد الأقصى لجلسة الدردشة (8,000 رمز). يُرجى بدء جلسة جديدة للمتابعة.";
    if (language === "fr")
      return "Limite de session atteinte (8 000 tokens). Veuillez réinitialiser la conversation pour continuer.";
    return "Session token limit reached (8,000 tokens). Please reset the chat to continue.";
  }

  // daily_limit
  if (language === "darija" || language === "ar-MA")
    return "وصلتي للحد اليومي ديال الاستخدام. اتواصل معانا غدا أو عبر واتساب/تيليجرام للمساعدة الفورية.";
  if (language === "ar")
    return "تم استنفاد حصتك اليومية من الاستخدام. يُرجى العودة غداً أو التواصل عبر واتساب للدعم الفوري.";
  if (language === "fr")
    return "Quota journalier d'utilisation atteint. Revenez demain ou contactez-nous directement sur WhatsApp.";
  return "Daily usage quota reached. Please return tomorrow or contact us directly via WhatsApp for immediate support.";
}
