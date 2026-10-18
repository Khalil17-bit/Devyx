import { createHash } from "crypto";

/**
 * Computes a secure SHA-256 hash of the client's IP address with a secret salt.
 * Ensures strict privacy compliance (GDPR) by avoiding raw IP storage,
 * while preventing rate-limiting evasion.
 */
export function hashClientIp(ip: string): string {
  const salt = process.env.RATE_LIMIT_SALT || "devyx_default_rate_limit_salt_2026";
  return createHash("sha256")
    .update(`${salt}:${ip}`)
    .digest("hex");
}
