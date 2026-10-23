import { createHash, randomBytes } from "crypto";

// Ephemeral runtime random salt generated per server instance if env var is missing
// Completely prevents static rainbow-table precomputation attacks
const runtimeFallbackSalt = randomBytes(32).toString("hex");

/**
 * Computes a secure SHA-256 hash of the client's IP address with a secret salt.
 * Ensures strict privacy compliance (GDPR) by avoiding raw IP storage,
 * while preventing rate-limiting evasion.
 */
export function hashClientIp(ip: string): string {
  const salt = process.env.RATE_LIMIT_SALT?.trim();

  if (!salt) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[Security Warning] RATE_LIMIT_SALT is not configured in production environment. " +
          "Using dynamic runtime entropy to prevent rainbow-table deanonymization."
      );
    }
    return createHash("sha256")
      .update(`${runtimeFallbackSalt}:${ip}`)
      .digest("hex");
  }

  return createHash("sha256")
    .update(`${salt}:${ip}`)
    .digest("hex");
}
