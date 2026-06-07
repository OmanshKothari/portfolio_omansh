# Portfolio

A personal portfolio site — projects, a career timeline, a writing "digital
garden", and a contact form — with a built-in admin area for editing all
content. Server-rendered, type-safe end to end, and backed by a single SQLite /
Turso database.

## Tech stack

| Concern        | Choice                                              |
| -------------- | --------------------------------------------------- |
| Framework      | [TanStack Start](https://tanstack.com/start) (SSR)  |
| UI             | React 19, Tailwind CSS 4, Radix UI / shadcn         |
| Data fetching  | TanStack Query                                      |
| Routing        | TanStack Router (file-based, in `src/routes`)       |
| Server logic   | TanStack `createServerFn` + Zod input validation    |
| Database       | Turso / libSQL (SQLite); local file in dev          |
| Rich text      | Tiptap (digital-garden editor)                      |
| Build / deploy | Vite + Nitro → Vercel Build Output                  |

## Features

- **Public site** — home, projects, project detail, timeline, digital garden
  (blog), and a contact form.
- **Admin area** (`/admin`, single-account login) — CRUD for projects, garden
  entries, and timeline items; an editable site profile; and an inbox of
  contact-form submissions.
- **Loading states** — skeleton placeholders (not "Loading…" text) on every
  data-backed view.
- **Security** — scrypt-hashed admin password, HMAC-signed session cookie, and
  rate limiting on login and the contact form. See [SECURITY.md](./SECURITY.md).

## Getting started

Requires **Node 22.x**.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
#    then fill in the values (see "Environment variables" below)

# 3. Create the admin password hash and paste it into .env
npm run hash-password -- "your-strong-password"

# 4. Create the database tables and seed starter content
npm run db:push
npm run db:seed

# 5. Run the dev server
npm run dev
```

The site runs at the URL Vite prints (default `http://localhost:8080`). Sign in
at `/auth` with the `ADMIN_EMAIL` / password you configured.

## Environment variables

All variables are **server-side only** (no `VITE_` prefix), so none are exposed
to the browser. See `.env.example` for the annotated template.

| Variable              | Required | Purpose                                                        |
| --------------------- | -------- | -------------------------------------------------------------- |
| `TURSO_DATABASE_URL`  | no       | Database URL. Defaults to `file:./local.db` for local dev.     |
| `TURSO_AUTH_TOKEN`    | prod     | Turso token (`turso db tokens create`). Empty for local file.  |
| `ADMIN_EMAIL`         | yes      | The only account allowed to sign in. There is no signup.       |
| `ADMIN_PASSWORD_HASH` | yes      | `scrypt` hash from `npm run hash-password`. Format `salt:key`. |
| `SESSION_SECRET`      | yes      | Random secret signing the session cookie (≥ 48 random bytes).  |

## Scripts

| Command                  | What it does                                            |
| ------------------------ | ------------------------------------------------------- |
| `npm run dev`            | Start the dev server.                                   |
| `npm run build`          | Production build (Vercel Build Output via Nitro).       |
| `npm run preview`        | Preview the production build locally.                   |
| `npm run lint`           | ESLint.                                                 |
| `npm run format`         | Prettier (writes).                                      |
| `npm run db:push`        | Apply `db/schema.sql` to the target database.           |
| `npm run db:seed`        | Insert starter content.                                 |
| `npm run hash-password`  | Turn a plaintext password into `ADMIN_PASSWORD_HASH`.   |

## Project structure

```
db/schema.sql               SQLite schema (tables are self-documented inline)
scripts/                    db push/seed + password-hash helpers
src/
  routes/                   File-based routes (pages). _authenticated/ is gated.
  components/
    admin/                  Admin dashboard tabs + shared primitives
    skeletons/              Loading-state placeholders
    portfolio/              Site shell, sidebar, theme, rich editor
    ui/                     shadcn / Radix UI primitives
  lib/
    *.functions.ts          Server functions (data + auth), client-importable
    *.server.ts             Server-only modules (DB client, crypto, rate limit)
    portfolio-types.ts      Shared domain types
```

### Server functions: the one rule

Files ending in `.server.ts` (e.g. `db.server.ts`, `auth.server.ts`,
`rate-limit.server.ts`) read secrets or use `node:crypto`. They must only be
reached through a **dynamic `await import(...)` inside a server-function
handler** so they never leak into the client bundle. Follow the existing
patterns in `src/lib/*.functions.ts`.

## Database

A single SQLite/libSQL database. Tables are documented inline in
[`db/schema.sql`](./db/schema.sql); in brief:

- **projects** — portfolio projects (tags stored as JSON text).
- **blog_posts** — digital-garden entries (HTML body, draft/published flag).
- **timeline_items** — career timeline rows (bullet points as JSON text).
- **site_settings** — single editable row of site identity (name, role, links).
- **contact_messages** — contact-form submissions, with a read/unread flag.

Conventions: ids are app-generated UUIDs (`TEXT`), arrays are JSON `TEXT`,
booleans are `INTEGER` 0/1, timestamps are ISO-8601 `TEXT`.

## Deployment

The build targets Vercel's Build Output API (`.vercel/output/`). Set the same
environment variables in your Vercel project, run `npm run db:push` against your
production Turso database once, then deploy. The session cookie is `secure` and
`SameSite=Strict` in production, so the site must be served over HTTPS.
