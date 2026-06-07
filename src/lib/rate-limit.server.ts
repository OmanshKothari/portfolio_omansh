// Server-only, dependency-free rate limiting.
//
// Uses a sliding window kept in an in-process Map. This is intentionally simple:
// the site runs a single admin and modest traffic, so we avoid an external store
// (Redis, etc.). State resets on server restart and is per-instance — acceptable
// for a personal portfolio, not for a horizontally-scaled public API.
//
// Import ONLY from inside server-function handlers so it never reaches the client.

type Attempt = { count: number; firstAt: number };

const buckets = new Map<string, Attempt>();

export type RateLimitResult = { allowed: boolean; retryAfterMs: number };

/**
 * Record an attempt for `key` and report whether it is within the allowed budget.
 *
 * @param key       Identifier to throttle on (e.g. "login:user@example.com").
 * @param limit     Max attempts permitted inside the window.
 * @param windowMs  Length of the sliding window in milliseconds.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  // No prior attempts, or the previous window has fully elapsed → start fresh.
  if (!existing || now - existing.firstAt >= windowMs) {
    buckets.set(key, { count: 1, firstAt: now });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (existing.count >= limit) {
    return { allowed: false, retryAfterMs: windowMs - (now - existing.firstAt) };
  }

  existing.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}

/** Clear a key's window — call after a successful login so a user isn't penalised. */
export function resetRateLimit(key: string): void {
  buckets.delete(key);
}
