// Server-only Turso / libSQL client + row → domain mappers.
// Import this lazily from inside server-function handlers (await import(...)),
// never from client code — it reads secret env vars.
import { createClient, type Client, type Row } from "@libsql/client";
import type {
  Project,
  BlogPost,
  TimelineItem,
  SiteSettings,
  ContactMessage,
  SkillGroup,
} from "./portfolio-types";

function createDbClient(): Client {
  // Defaults to a local SQLite file for dev; production sets the Turso URL+token.
  const url = process.env.TURSO_DATABASE_URL || "file:./local.db";
  const authToken = process.env.TURSO_AUTH_TOKEN || undefined;
  return createClient({ url, authToken });
}

let _db: Client | undefined;
export function getDb(): Client {
  if (!_db) _db = createDbClient();
  return _db;
}

// --- value coercion helpers (libSQL returns `unknown` per column) ---
const str = (v: unknown): string => (v == null ? "" : String(v));
const nstr = (v: unknown): string | null => (v == null ? null : String(v));
const num = (v: unknown): number => (v == null ? 0 : Number(v));
const parseArr = (v: unknown): string[] => {
  if (v == null) return [];
  try {
    const parsed = JSON.parse(String(v));
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
};

/** Parse a JSON column into validated SkillGroup[]; drops malformed entries. */
const parseSkills = (v: unknown): SkillGroup[] => {
  if (v == null) return [];
  try {
    const parsed = JSON.parse(String(v));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((g): g is { category: unknown; items: unknown } => g && typeof g === "object")
      .map((g) => ({
        category: str(g.category),
        items: Array.isArray(g.items) ? g.items.map(String) : [],
      }));
  } catch {
    return [];
  }
};

export function rowToProject(r: Row): Project {
  return {
    id: str(r.id),
    slug: str(r.slug),
    title: str(r.title),
    description: str(r.description),
    long_description: nstr(r.long_description),
    tags: parseArr(r.tags),
    github_url: nstr(r.github_url),
    demo_url: nstr(r.demo_url),
    cover_url: nstr(r.cover_url),
    sort_order: num(r.sort_order),
    created_at: str(r.created_at),
    updated_at: str(r.updated_at),
  };
}

export function rowToBlogPost(r: Row): BlogPost {
  return {
    id: str(r.id),
    slug: str(r.slug),
    title: str(r.title),
    excerpt: str(r.excerpt),
    content_html: str(r.content_html),
    topic: str(r.topic),
    published: num(r.published) === 1,
    published_at: str(r.published_at),
    created_at: str(r.created_at),
    updated_at: str(r.updated_at),
  };
}

export function rowToTimelineItem(r: Row): TimelineItem {
  return {
    id: str(r.id),
    dates: str(r.dates),
    company: str(r.company),
    role: str(r.role),
    points: parseArr(r.points),
    sort_order: num(r.sort_order),
    created_at: str(r.created_at),
    updated_at: str(r.updated_at),
  };
}

export function rowToSiteSettings(r: Row): SiteSettings {
  return {
    name: str(r.name),
    role: str(r.role),
    tagline: str(r.tagline),
    about: str(r.about),
    contact_email: str(r.contact_email),
    linkedin_url: str(r.linkedin_url),
    github_url: str(r.github_url),
    skills: parseSkills(r.skills),
  };
}

export function rowToContactMessage(r: Row): ContactMessage {
  return {
    id: str(r.id),
    name: str(r.name),
    email: str(r.email),
    message: str(r.message),
    read: num(r.read) === 1,
    created_at: str(r.created_at),
  };
}

export const nowIso = () => new Date().toISOString();
