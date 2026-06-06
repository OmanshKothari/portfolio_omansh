-- Turso / libSQL schema for the portfolio.
-- SQLite notes vs the old Postgres schema:
--   * ids are TEXT (UUIDs generated in app code; SQLite has no gen_random_uuid()).
--   * array columns (tags, points) are stored as JSON TEXT.
--   * booleans are INTEGER 0/1.
--   * timestamps are TEXT (ISO-8601), defaulted to CURRENT_TIMESTAMP.

CREATE TABLE IF NOT EXISTS projects (
  id               TEXT PRIMARY KEY,
  slug             TEXT NOT NULL UNIQUE,
  title            TEXT NOT NULL,
  description      TEXT NOT NULL,
  long_description TEXT,
  tags             TEXT NOT NULL DEFAULT '[]',   -- JSON array of strings
  github_url       TEXT,
  demo_url         TEXT,
  cover_url        TEXT,
  sort_order       INTEGER NOT NULL DEFAULT 0,
  created_at       TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id           TEXT PRIMARY KEY,
  slug         TEXT NOT NULL UNIQUE,
  title        TEXT NOT NULL,
  excerpt      TEXT NOT NULL,
  content_html TEXT NOT NULL DEFAULT '',
  topic        TEXT NOT NULL,
  published    INTEGER NOT NULL DEFAULT 1,         -- 0/1
  published_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS timeline_items (
  id         TEXT PRIMARY KEY,
  dates      TEXT NOT NULL,
  company    TEXT NOT NULL,
  role       TEXT NOT NULL,
  points     TEXT NOT NULL DEFAULT '[]',           -- JSON array of strings
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Single-row table holding the editable site identity / profile.
CREATE TABLE IF NOT EXISTS site_settings (
  id            INTEGER PRIMARY KEY CHECK (id = 1),
  name          TEXT NOT NULL DEFAULT '',
  role          TEXT NOT NULL DEFAULT '',
  tagline       TEXT NOT NULL DEFAULT '',
  contact_email TEXT NOT NULL DEFAULT '',
  linkedin_url  TEXT NOT NULL DEFAULT '',
  github_url    TEXT NOT NULL DEFAULT ''
);
