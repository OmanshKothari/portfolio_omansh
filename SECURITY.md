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
- **Session revocation.** Tokens embed a fingerprint of the current
  `ADMIN_PASSWORD_HASH`, so rotating the password (or `SESSION_SECRET`)
  immediately invalidates every outstanding session — a kill switch that needs
  no server-side session store.
- **Login brute-force.** Login is rate limited to 5 attempts per email per
  15-minute sliding window. Buckets are stored in the database
  (`rate_limits` table), so the limit holds across serverless instances and
  cold starts (`src/lib/rate-limit.server.ts`).

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
- **Contact spam.** Contact submissions are rate limited to 3 per IP per
  30-minute window (keyed on IP, not the attacker-controlled email), filtered
  through a honeypot field, and capped by a global unread-backlog ceiling.
  Submissions render in the admin inbox as plain text (React escapes them), so
  they are not an XSS vector.
- **Rich-text HTML.** Admin-authored HTML (garden posts, project write-ups, the
  about bio) is sanitized on write with `sanitize-html` against an allowlist
  matching what the TipTap editor emits (`src/lib/sanitize.server.ts`). Only the
  admin can author this content, so this is defence in depth: a compromised
  session yields defacement, not persistent XSS against visitors.
- **URL fields.** Admin-entered URLs (project links, profile links) must be
  absolute `http(s)` URLs — `javascript:` and other schemes are rejected at
  validation, since these values render into `href`/`src` attributes.

## HTTP headers

`vercel.json` sets `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
`Referrer-Policy`, `Strict-Transport-Security`, and a Content-Security-Policy.
The CSP allows `'unsafe-inline'` scripts because TanStack Start hydration and
the pre-paint theme script are inline; everything else is locked to `'self'`
(plus Google Fonts for styles/fonts and `https:` for images).

## Secrets

`ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`, and the Turso
credentials are server-side only (no `VITE_` prefix) and are never sent to the
browser. Server-only modules (`*.server.ts`) are imported dynamically inside
server handlers so `node:crypto` and secrets stay out of the client bundle.

## Accepted risks

- **Sanitize-on-write, not on read.** Rich-text HTML is sanitized when stored,
  so HTML already in the database is trusted at render time. Rows written
  before sanitization was introduced (or edited outside the app) are rendered
  as-is; all of that content is admin-authored.
- **Encryption at rest.** Contact messages are stored unencrypted in the
  database; confidentiality relies on Turso's storage and HTTPS in transit.
- **Stateless tokens within a password epoch.** Between password rotations a
  stolen token cannot be individually revoked before its 7-day expiry; revoking
  requires rotating the password or `SESSION_SECRET`.

## Reporting

This is a personal project. If you spot an issue, open an issue or email the
address listed on the site's contact page.
