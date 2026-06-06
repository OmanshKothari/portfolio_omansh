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
