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
  about         TEXT NOT NULL DEFAULT '',          -- rich-text bio (HTML)
  contact_email TEXT NOT NULL DEFAULT '',
  linkedin_url  TEXT NOT NULL DEFAULT '',
  github_url    TEXT NOT NULL DEFAULT '',
  skills        TEXT NOT NULL DEFAULT '[]',        -- JSON array of {category, items[]}
  stats         TEXT NOT NULL DEFAULT '[]'         -- JSON array of {value, label} shown in hero
);

-- Sliding-window rate-limit buckets. Stored in the DB (not in-process memory)
-- so limits hold across serverless instances and cold starts.
CREATE TABLE IF NOT EXISTS rate_limits (
  key      TEXT PRIMARY KEY,
  count    INTEGER NOT NULL DEFAULT 1,
  first_at INTEGER NOT NULL                         -- window start, epoch ms
);

-- Contact form submissions from visitors.
CREATE TABLE IF NOT EXISTS contact_messages (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  message    TEXT NOT NULL,
  read       INTEGER NOT NULL DEFAULT 0,           -- 0/1, marks message as read by admin
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
