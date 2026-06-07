# Security

This is a single-admin personal site. The security model is intentionally
small; this document records what is protected, how, and which risks are
knowingly accepted.

## Authentication & sessions

- **One account.** There is no signup. Only `ADMIN_EMAIL` can sign in, against
  the `ADMIN_PASSWORD_HASH` configured at deploy time.
- **Password storage.** Passwords are hashed with `scrypt` (64-byte key, random
  16-byte salt). Verification uses `timingSafeEqual` to avoid timing leaks.
  See `src/lib/auth.server.ts`.
- **Sessions.** A stateless, HMAC-SHA-256–signed token (signed with
  `SESSION_SECRET`) is stored in a cookie that is `httpOnly`, `Secure` in
  production, and `SameSite=Strict`. Tokens carry a 7-day expiry that is checked
  on every request.
- **Login brute-force.** Login is rate limited to 5 attempts per email per
  15-minute sliding window (`src/lib/rate-limit.server.ts`).

## Authorization

Admin-only server functions are gated by the `requireAdmin` middleware
(`src/lib/auth.functions.ts`), which rejects any request without a valid session
cookie. Public read endpoints (projects, timeline, published blog posts, contact
submit) are intentionally open.

## Input handling

- **Validation.** Every server function validates its input with Zod before
  touching the database.
- **SQL injection.** All queries are parameterized via the libSQL client; no SQL
  is built by string concatenation.
- **Contact spam.** Contact submissions are rate limited to 1 per email per
  30-minute window. Submissions render in the admin inbox as plain text (React
  escapes them), so they are not an XSS vector.

## Secrets

`ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`, and the Turso
credentials are server-side only (no `VITE_` prefix) and are never sent to the
browser. Server-only modules (`*.server.ts`) are imported dynamically inside
server handlers so `node:crypto` and secrets stay out of the client bundle.

## Accepted risks

- **Blog HTML rendering.** Digital-garden posts are stored as HTML and rendered
  with `dangerouslySetInnerHTML` (`src/routes/garden.$slug.tsx`). Because the
  **only** author of that HTML is the authenticated admin, this is self-XSS, not
  a third-party injection vector — sanitizing the admin's own input would
  protect no one. If multi-author or untrusted content is ever added, sanitize
  the HTML (e.g. with `sanitize-html`) before storage and render.
- **In-process rate limiting.** Rate-limit state lives in memory per server
  instance and resets on restart. This is sufficient for a personal site on a
  single instance; a horizontally-scaled deployment would need a shared store
  (e.g. Redis).
- **Encryption at rest.** Contact messages are stored unencrypted in the
  database; confidentiality relies on Turso's storage and HTTPS in transit.

## Reporting

This is a personal project. If you spot an issue, open an issue or email the
address listed on the site's contact page.
