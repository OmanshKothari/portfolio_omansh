// Server-only auth helpers for the single-admin model.
// Import this ONLY via `await import(...)` inside server-fn / middleware
// `.server()` callbacks so node:crypto never leaks into the client bundle.
import { scryptSync, randomBytes, createHmac, timingSafeEqual } from "node:crypto";
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";

const COOKIE_NAME = "admin_session";
const SCRYPT_KEYLEN = 64;
const SESSION_MAX_AGE_S = 60 * 60 * 24 * 7; // 7 days

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

const b64url = (b: Buffer) =>
  b.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

/** Verify a plaintext password against ADMIN_PASSWORD_HASH ("saltHex:keyHex"). */
export function verifyPassword(plain: string): boolean {
  const stored = process.env.ADMIN_PASSWORD_HASH;
  if (!stored || !stored.includes(":")) return false;
  const [saltHex, keyHex] = stored.split(":");
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(keyHex, "hex");
  const derived = scryptSync(plain, salt, expected.length || SCRYPT_KEYLEN);
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

/** Whether the supplied credentials match the single configured admin. */
export function credentialsMatchAdmin(email: string, password: string): boolean {
  const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  if (!adminEmail || email.trim().toLowerCase() !== adminEmail) return false;
  return verifyPassword(password);
}

// --- stateless HMAC-signed session token: "<payloadB64>.<sigB64>" ---
function sign(payloadB64: string): string {
  const secret = requireEnv("SESSION_SECRET");
  return b64url(createHmac("sha256", secret).update(payloadB64).digest());
}

function createToken(): string {
  const payload = { exp: Date.now() + SESSION_MAX_AGE_S * 1000, n: randomBytes(8).toString("hex") };
  const payloadB64 = b64url(Buffer.from(JSON.stringify(payload)));
  return `${payloadB64}.${sign(payloadB64)}`;
}

function verifyToken(token: string | undefined): boolean {
  if (!token || !token.includes(".")) return false;
  const [payloadB64, sig] = token.split(".");
  const expected = sign(payloadB64);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const payload = JSON.parse(
      Buffer.from(payloadB64.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString(),
    );
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

/** True when the current request carries a valid admin session cookie. */
export function isAuthenticated(): boolean {
  return verifyToken(getCookie(COOKIE_NAME));
}

export function startSession(): void {
  setCookie(COOKIE_NAME, createToken(), {
    httpOnly: true, // not readable from JS → mitigates token theft via XSS
    secure: process.env.NODE_ENV === "production", // HTTPS-only in production
    sameSite: "strict", // not sent on cross-site requests → CSRF defence
    path: "/",
    maxAge: SESSION_MAX_AGE_S,
  });
}

export function endSession(): void {
  deleteCookie(COOKIE_NAME, { path: "/" });
}
