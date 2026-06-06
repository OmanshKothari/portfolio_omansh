// Seed the database with the site identity + a couple of clearly-labeled
// starter rows. Safe to re-run: it only fills empty tables and never overwrites
// edits you've made in the admin panel.
//   npm run db:seed
import { randomUUID } from "node:crypto";
import { createClient } from "@libsql/client";

try {
  process.loadEnvFile(".env");
} catch {
  /* no .env — rely on ambient env */
}

const url = process.env.TURSO_DATABASE_URL || "file:./local.db";
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;
const db = createClient({ url, authToken });

const now = new Date().toISOString();

// --- site_settings (single row, id = 1) ---
await db.execute({
  sql: `INSERT INTO site_settings (id, name, role, tagline, contact_email, linkedin_url, github_url)
        VALUES (1, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO NOTHING`,
  args: [
    "Omansh Kothari",
    "TODO: your role / headline",
    "TODO: one-line tagline about what you build",
    "kothariomansh@gmail.com",
    "TODO: https://www.linkedin.com/in/your-handle",
    "TODO: https://github.com/your-handle",
  ],
});

async function count(table) {
  const r = await db.execute(`SELECT COUNT(*) AS c FROM ${table}`);
  return Number(r.rows[0].c);
}

// --- one starter project ---
if ((await count("projects")) === 0) {
  await db.execute({
    sql: `INSERT INTO projects (id, slug, title, description, long_description, tags, github_url, demo_url, cover_url, sort_order, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      randomUUID(),
      "example-project",
      "Example Project (edit me)",
      "A starter project row. Edit or delete this in the admin panel.",
      "This is placeholder long-form copy. Open the admin panel → Projects to replace it with your real work.",
      JSON.stringify(["TypeScript", "Example"]),
      null,
      null,
      null,
      0,
      now,
      now,
    ],
  });
}

// --- one starter garden entry ---
if ((await count("blog_posts")) === 0) {
  await db.execute({
    sql: `INSERT INTO blog_posts (id, slug, title, excerpt, content_html, topic, published, published_at, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      randomUUID(),
      "hello-world",
      "Hello, world (edit me)",
      "A starter garden entry. Edit or delete this in the admin panel.",
      "<p>This is a placeholder post. Replace it from the admin panel → Digital Garden.</p>",
      "Notes",
      1,
      now,
      now,
      now,
    ],
  });
}

// --- one starter timeline item ---
if ((await count("timeline_items")) === 0) {
  await db.execute({
    sql: `INSERT INTO timeline_items (id, dates, company, role, points, sort_order, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      randomUUID(),
      "2024 — Present",
      "Your Company (edit me)",
      "Your Role",
      JSON.stringify(["A starter timeline bullet — edit in the admin panel."]),
      0,
      now,
      now,
    ],
  });
}

console.log(`Seeded ${url}`);
