/**
 * Devyx Mathematical Hourly Token Budget Economizer
 *
 * Designed to strictly protect provider API quotas (Groq / Gemini) while offering
 * fair, generous allocation to legitimate human visitors.
 *
 * Mathematical allocation:
 *   - Average visitor exchange = ~150 tokens (input prompt + response).
 *   - An active consulting session consumes ~10 to 15 turns / hour ≈ 1,500 - 2,200 tokens.
 *   - Hourly IP Limit = 3,000 tokens / IP / hour.
 *   - Hourly Session Limit = 2,000 tokens / session / hour.
 *   - Resets automatically every 60 minutes on the hour.
 *   - Token estimation heuristic: 1 token ≈ 4 characters.
 */

import { getRedisClient } from "@/lib/redis/client";

// In-memory fallback (keyed by key:hourSlice, resets each hour)
const memoryBudget = new Map<string, number>();

export const HOURLY_IP_TOKEN_LIMIT = 10_000;
export const HOURLY_SESSION_TOKEN_LIMIT = 7_500;

/**
 * Calculates remaining minutes until the next hourly reset (top of the hour).
 */
export function getMinutesUntilHourlyReset(): number {
  const minutes = new Date().getMinutes();
  return Math.max(1, 60 - minutes);
}

/**
 * Estimates token count from raw text length.
 * Uses the standard ~4 chars/token heuristic.
 */
export function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

export interface BudgetCheckResult {
  allowed: boolean;
  reason?: "hourly_limit" | "session_limit";
  hourlyUsed: number;
  sessionUsed: number;
  hourlyRemaining: number;
  sessionRemaining: number;
  hourlyLimit: number;
  resetsInMinutes: number;
  // Aliases for backward compatibility
  dailyRemaining: number;
}

/**
 * Checks token budget and records usage if within limits.
 * Returns { allowed: false } with reason when hourly budget is exceeded.
 */
export async function checkAndRecordTokenBudget(
  ipHash: string,
  sessionId: string,
  messageTokens: number
): Promise<BudgetCheckResult> {
  const hourSlice = new Date().toISOString().slice(0, 13); // e.g. "2026-10-23T17"
  const hourlyKey = `devyx:tokens:hourly:${ipHash}:${hourSlice}`;
  const sessionKey = `devyx:tokens:session:${sessionId}:${hourSlice}`;
  const resetsInMinutes = getMinutesUntilHourlyReset();

  try {
    const redis = await getRedisClient();

    if (redis) {
      // Use Redis INCRBY for atomic counters
      const [[, hourlyUsed], [, sessionUsed]] = (await redis
        .pipeline()
        .incrby(hourlyKey, messageTokens)
        .incrby(sessionKey, messageTokens)
        .exec()) as [Error | null, number][];

      // Set 2-hour TTL so expired keys clean up automatically
      await redis
        .pipeline()
        .expire(hourlyKey, 7_200)
        .expire(sessionKey, 7_200)
        .exec();

      const realHourly = hourlyUsed ?? messageTokens;
      const realSession = sessionUsed ?? messageTokens;

      if (realHourly > HOURLY_IP_TOKEN_LIMIT) {
        // Rollback the over-spend
        await redis
          .pipeline()
          .decrby(hourlyKey, messageTokens)
          .decrby(sessionKey, messageTokens)
          .exec();
        return {
          allowed: false,
          reason: "hourly_limit",
          hourlyUsed: realHourly - messageTokens,
          sessionUsed: realSession - messageTokens,
          hourlyRemaining: 0,
          sessionRemaining: Math.max(0, HOURLY_SESSION_TOKEN_LIMIT - (realSession - messageTokens)),
          hourlyLimit: HOURLY_IP_TOKEN_LIMIT,
          resetsInMinutes,
          dailyRemaining: 0,
        };
      }

      if (realSession > HOURLY_SESSION_TOKEN_LIMIT) {
        await redis
          .pipeline()
          .decrby(hourlyKey, messageTokens)
          .decrby(sessionKey, messageTokens)
          .exec();
        return {
          allowed: false,
          reason: "session_limit",
          hourlyUsed: realHourly - messageTokens,
          sessionUsed: realSession - messageTokens,
          hourlyRemaining: Math.max(0, HOURLY_IP_TOKEN_LIMIT - (realHourly - messageTokens)),
          sessionRemaining: 0,
          hourlyLimit: HOURLY_SESSION_TOKEN_LIMIT,
          resetsInMinutes,
          dailyRemaining: Math.max(0, HOURLY_IP_TOKEN_LIMIT - (realHourly - messageTokens)),
        };
      }

      return {
        allowed: true,
        hourlyUsed: realHourly,
        sessionUsed: realSession,
        hourlyRemaining: Math.max(0, HOURLY_IP_TOKEN_LIMIT - realHourly),
        sessionRemaining: Math.max(0, HOURLY_SESSION_TOKEN_LIMIT - realSession),
        hourlyLimit: HOURLY_IP_TOKEN_LIMIT,
        resetsInMinutes,
        dailyRemaining: Math.max(0, HOURLY_IP_TOKEN_LIMIT - realHourly),
      };
    }
  } catch {
    // Fall through to memory fallback
  }

  // In-memory fallback
  const memHourlyKey = `hourly:${ipHash}:${hourSlice}`;
  const memSessionKey = `session:${sessionId}:${hourSlice}`;
  const hourlyUsed = (memoryBudget.get(memHourlyKey) || 0) + messageTokens;
  const sessionUsed = (memoryBudget.get(memSessionKey) || 0) + messageTokens;

  if (hourlyUsed > HOURLY_IP_TOKEN_LIMIT) {
    return {
      allowed: false,
      reason: "hourly_limit",
      hourlyUsed: hourlyUsed - messageTokens,
      sessionUsed: sessionUsed - messageTokens,
      hourlyRemaining: 0,
      sessionRemaining: Math.max(0, HOURLY_SESSION_TOKEN_LIMIT - (sessionUsed - messageTokens)),
      hourlyLimit: HOURLY_IP_TOKEN_LIMIT,
      resetsInMinutes,
      dailyRemaining: 0,
    };
  }

  if (sessionUsed > HOURLY_SESSION_TOKEN_LIMIT) {
    return {
      allowed: false,
      reason: "session_limit",
      hourlyUsed: hourlyUsed - messageTokens,
      sessionUsed: sessionUsed - messageTokens,
      hourlyRemaining: Math.max(0, HOURLY_IP_TOKEN_LIMIT - (hourlyUsed - messageTokens)),
      sessionRemaining: 0,
      hourlyLimit: HOURLY_SESSION_TOKEN_LIMIT,
      resetsInMinutes,
      dailyRemaining: Math.max(0, HOURLY_IP_TOKEN_LIMIT - (hourlyUsed - messageTokens)),
    };
  }

  memoryBudget.set(memHourlyKey, hourlyUsed);
  memoryBudget.set(memSessionKey, sessionUsed);

  // Periodic memory map purge of old hours
  if (memoryBudget.size > 500) {
    for (const k of memoryBudget.keys()) {
      if (!k.includes(hourSlice)) memoryBudget.delete(k);
    }
  }

  return {
    allowed: true,
    hourlyUsed,
    sessionUsed,
    hourlyRemaining: Math.max(0, HOURLY_IP_TOKEN_LIMIT - hourlyUsed),
    sessionRemaining: Math.max(0, HOURLY_SESSION_TOKEN_LIMIT - sessionUsed),
    hourlyLimit: HOURLY_IP_TOKEN_LIMIT,
    resetsInMinutes,
    dailyRemaining: Math.max(0, HOURLY_IP_TOKEN_LIMIT - hourlyUsed),
  };
}

/**
 * Returns localized rate limit exceeded message with dynamic minute countdown
 */
export function getTokenLimitMessage(
  reason: "hourly_limit" | "session_limit" | string,
  language: string,
  resetsInMinutes?: number
): string {
  const minutes = resetsInMinutes || getMinutesUntilHourlyReset();

  if (reason === "session_limit") {
    if (language === "darija" || language === "ar-MA")
      return `Wselt l l'plafond ta3 had l'session (${HOURLY_SESSION_TOKEN_LIMIT.toLocaleString()} tokens). D9i9a w y3awed ytfte7 (${minutes} min) wela dirlik session jdida.`;
    if (language === "ar")
      return `تم استنفاد حصة الجلسة الحالية (${HOURLY_SESSION_TOKEN_LIMIT.toLocaleString()} رمز). ستتجدد الحصة خلال ${minutes} دقيقة أو يمكنك بدء محادثة جديدة.`;
    if (language === "fr")
      return `Limite de session atteinte (${HOURLY_SESSION_TOKEN_LIMIT.toLocaleString()} tokens). Réinitialisation dans ${minutes} min ou démarrez une nouvelle session.`;
    return `Session token limit reached (${HOURLY_SESSION_TOKEN_LIMIT.toLocaleString()} tokens). Resets in ${minutes} minutes or click reset to start fresh.`;
  }

  // hourly_limit
  if (language === "darija" || language === "ar-MA")
    return `Wselt l l'plafond ta3 l'heure (${HOURLY_IP_TOKEN_LIMIT.toLocaleString()} tokens). L'quota y3awed ytfte7 direct f ${minutes} d9i9a. T9der t'contactina f [WhatsApp](https://wa.me/213000000000).`;
  if (language === "ar")
    return `لقد استنفدت حصتك المخصصة لهذه الساعة (${HOURLY_IP_TOKEN_LIMIT.toLocaleString()} رمز). ستتجدد الحصة تلقائياً خلال ${minutes} دقيقة. للتواصل الفوري راسلنا عبر [واتساب](https://wa.me/213000000000).`;
  if (language === "fr")
    return `Quota horaire atteint (${HOURLY_IP_TOKEN_LIMIT.toLocaleString()} tokens). Réinitialisation automatique dans ${minutes} minutes. Pour échanger immédiatement, écrivez-nous sur [WhatsApp](https://wa.me/213000000000).`;
  return `Hourly token limit reached (${HOURLY_IP_TOKEN_LIMIT.toLocaleString()} tokens). Quota resets automatically in ${minutes} minutes. Connect directly via [WhatsApp](https://wa.me/213000000000) for immediate consultation.`;
}
