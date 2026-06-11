// Server-only rate limiting backed by the database.
//
// State used to live in an in-process Map, but on Vercel serverless that map
// is per-lambda and resets on every cold start, so the limits barely applied
// in production. The buckets now live in a `rate_limits` table in the same
// Turso DB the app already uses — limits hold across instances and restarts.
//
// Import ONLY from inside server-function handlers so it never reaches the client.
import { getRequestHeader } from "@tanstack/react-start/server";
import { getDb } from "./db.server";

export type RateLimitResult = { allowed: boolean; retryAfterMs: number };

/**
 * Best-effort client IP for throttle keys. Vercel's proxy sets x-forwarded-for
 * with the real client first; locally there is no proxy, so fall back to a
 * shared bucket (fine for dev).
 */
export function clientIp(): string {
  const fwd = getRequestHeader("x-forwarded-for");
  return (fwd?.split(",")[0] ?? "").trim() || "unknown";
}

/**
 * Record an attempt for `key` and report whether it is within the allowed budget.
 *
 * The upsert is atomic: it starts a fresh window when the previous one has
 * elapsed, otherwise increments the counter, and RETURNING gives us the state
 * to decide on — no read-modify-write race across instances.
 *
 * @param key       Identifier to throttle on (e.g. "login:user@example.com").
 * @param limit     Max attempts permitted inside the window.
 * @param windowMs  Length of the sliding window in milliseconds.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const db = getDb();
  const now = Date.now();

  const res = await db.execute({
    sql: `INSERT INTO rate_limits (key, count, first_at) VALUES (?, 1, ?)
          ON CONFLICT(key) DO UPDATE SET
            count    = CASE WHEN ? - first_at >= ? THEN 1 ELSE count + 1 END,
            first_at = CASE WHEN ? - first_at >= ? THEN ? ELSE first_at END
          RETURNING count, first_at`,
    args: [key, now, now, windowMs, now, windowMs, now],
  });

  const row = res.rows[0];
  const count = Number(row?.count ?? 1);
  const firstAt = Number(row?.first_at ?? now);

  // Opportunistic cleanup so the table never accumulates dead buckets.
  // ~1% of calls sweep rows older than a day (covers every window we use).
  if (Math.random() < 0.01) {
    const dayMs = 24 * 60 * 60 * 1000;
    db.execute({ sql: "DELETE FROM rate_limits WHERE ? - first_at > ?", args: [now, dayMs] }).catch(
      () => {},
    );
  }

  if (count > limit) {
    return { allowed: false, retryAfterMs: Math.max(0, windowMs - (now - firstAt)) };
  }
  return { allowed: true, retryAfterMs: 0 };
}

/** Clear a key's window — call after a successful login so a user isn't penalised. */
export async function resetRateLimit(key: string): Promise<void> {
  await getDb().execute({ sql: "DELETE FROM rate_limits WHERE key = ?", args: [key] });
}
