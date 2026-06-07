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
async function ensureColumns(table, columns) {
  const info = await db.execute(`PRAGMA table_info(${table})`);
  const existing = new Set(info.rows.map((r) => r.name));
  for (const { name, def } of columns) {
    if (existing.has(name)) continue;
    await db.execute(`ALTER TABLE ${table} ADD COLUMN ${name} ${def}`);
    console.log(`  + ${table}.${name}`);
  }
}

await ensureColumns("site_settings", [
  { name: "about", def: "TEXT NOT NULL DEFAULT ''" },
  { name: "skills", def: "TEXT NOT NULL DEFAULT '[]'" },
]);
console.log("Migrations applied.");
