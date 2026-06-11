// Apply db/schema.sql to the target Turso/libSQL database.
//   npm run db:push
// Uses TURSO_DATABASE_URL (default: file:./local.db) and TURSO_AUTH_TOKEN from .env.
import { readFileSync } from "node:fs";
import { createClient } from "@libsql/client";

try {
  process.loadEnvFile(".env");
} catch {
  /* no .env — rely on ambient env */
}

// Vercel runs this in buildCommand for every deployment, and preview builds
// share the production TURSO_DATABASE_URL — so a schema change on an unmerged
// branch would alter the production DB. Only production builds may migrate.
if (process.env.VERCEL && process.env.VERCEL_ENV !== "production") {
  console.log(`Skipping db:push on Vercel "${process.env.VERCEL_ENV}" build.`);
  process.exit(0);
}

const url = process.env.TURSO_DATABASE_URL || "file:./local.db";
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;
const sql = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");

const db = createClient({ url, authToken });
await db.executeMultiple(sql);
console.log(`Schema applied to ${url}`);

// Idempotent column migrations.
// `CREATE TABLE IF NOT EXISTS` never alters an existing table, so columns added
// to a table after its first deploy must be applied with ALTER TABLE. We only
// add columns that are actually missing, so this is safe to re-run every deploy.
// Returns the set of column names added (so callers can run one-time backfills).
async function ensureColumns(table, columns) {
  const info = await db.execute(`PRAGMA table_info(${table})`);
  const existing = new Set(info.rows.map((r) => r.name));
  const added = new Set();
  for (const { name, def } of columns) {
    if (existing.has(name)) continue;
    await db.execute(`ALTER TABLE ${table} ADD COLUMN ${name} ${def}`);
    console.log(`  + ${table}.${name}`);
    added.add(name);
  }
  return added;
}

const addedSettingsCols = await ensureColumns("site_settings", [
  { name: "about", def: "TEXT NOT NULL DEFAULT ''" },
  { name: "skills", def: "TEXT NOT NULL DEFAULT '[]'" },
  { name: "stats", def: "TEXT NOT NULL DEFAULT '[]'" },
]);

// One-time backfill: when `stats` is first introduced, keep the previously
// hard-coded hero stats on the existing profile row so the live site is
// unchanged until the admin edits them. Runs only at column creation.
if (addedSettingsCols.has("stats")) {
  const defaultStats = JSON.stringify([
    { value: "3+", label: "Years Experience" },
    { value: "Full Stack", label: "React + Spring Boot" },
    { value: "SaaS", label: "Multi-tenant Platforms" },
  ]);
  await db.execute({
    sql: "UPDATE site_settings SET stats = ? WHERE id = 1 AND (stats IS NULL OR stats = '[]')",
    args: [defaultStats],
  });
  console.log("  ↪ backfilled site_settings.stats");
}
console.log("Migrations applied.");
