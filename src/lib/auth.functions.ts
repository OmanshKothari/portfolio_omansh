import { createServerFn, createMiddleware } from "@tanstack/react-start";
import { z } from "zod";

// NOTE: module-level code here ships to the client, so the node:crypto-backed
// helpers live in ./auth.server and are pulled in via dynamic import inside the
// server-only callbacks below.

/** Gate for any admin-only server function. Throws unless a valid session cookie is present. */
export const requireAdmin = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const { isAuthenticated } = await import("./auth.server");
  if (!isAuthenticated()) throw new Error("Unauthorized");
  return next({ context: { admin: true } });
});

// Brute-force protection: max 5 failed attempts per email per 15-minute window.
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

/** Sign in the single admin. Succeeds only for the configured ADMIN_EMAIL + password. */
export const login = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().email(), password: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { credentialsMatchAdmin, startSession } = await import("./auth.server");
    const { checkRateLimit, resetRateLimit } = await import("./rate-limit.server");

    const key = `login:${data.email.trim().toLowerCase()}`;
    const limit = checkRateLimit(key, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS);
    if (!limit.allowed) {
      const minutes = Math.ceil(limit.retryAfterMs / 60_000);
      throw new Error(`Too many attempts. Try again in ${minutes} minute(s).`);
    }

    if (!credentialsMatchAdmin(data.email, data.password)) {
      throw new Error("Invalid email or password.");
    }

    // Successful login clears the throttle so the admin isn't penalised next time.
    resetRateLimit(key);
    startSession();
    return { ok: true as const };
  });

/** Clear the admin session. */
export const logout = createServerFn({ method: "POST" }).handler(async () => {
  const { endSession } = await import("./auth.server");
  endSession();
  return { ok: true as const };
});

/** Current auth status — used by the route guard and the auth context. */
export const me = createServerFn({ method: "GET" }).handler(async () => {
  const { isAuthenticated } = await import("./auth.server");
  const isAdmin = isAuthenticated();
  return { isAdmin, email: isAdmin ? process.env.ADMIN_EMAIL ?? null : null };
});
