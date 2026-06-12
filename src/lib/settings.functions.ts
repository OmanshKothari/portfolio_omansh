import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./auth.functions";
import type { SiteSettings } from "./portfolio-types";

export const DEFAULT_SETTINGS: SiteSettings = {
  name: "Your Name",
  role: "",
  tagline: "",
  about: "",
  contact_email: "",
  linkedin_url: "",
  github_url: "",
  resume_url: "",
  skills: [],
  stats: [
    { value: "3+", label: "Years Experience" },
    { value: "Full Stack", label: "React + Spring Boot" },
    { value: "SaaS", label: "Multi-tenant Platforms" },
  ],
};

// Profile links render into hrefs on the public pages, so they must be empty
// or an absolute http(s) URL — never javascript: or other schemes.
const httpUrlOrEmpty = z.union([z.literal(""), z.string().trim().url().startsWith("http")]);

const settingsInput = z.object({
  name: z.string(),
  role: z.string(),
  tagline: z.string(),
  about: z.string(),
  contact_email: z.union([z.literal(""), z.string().trim().email()]),
  linkedin_url: httpUrlOrEmpty,
  github_url: httpUrlOrEmpty,
  resume_url: httpUrlOrEmpty,
  skills: z.array(z.object({ category: z.string(), items: z.array(z.string()) })).default([]),
  stats: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
});

/** Public: the editable site identity / profile. Falls back to defaults if unseeded. */
export const getSiteSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteSettings> => {
    const { getDb, rowToSiteSettings } = await import("./db.server");
    const res = await getDb().execute("SELECT * FROM site_settings WHERE id = 1 LIMIT 1");
    return res.rows[0] ? rowToSiteSettings(res.rows[0]) : DEFAULT_SETTINGS;
  },
);

/** Admin: upsert the single site-settings row. */
export const updateSiteSettings = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(settingsInput)
  .handler(async ({ data }) => {
    const { getDb } = await import("./db.server");
    const { sanitizeRichHtml } = await import("./sanitize.server");
    const about = sanitizeRichHtml(data.about);
    await getDb().execute({
      sql: `INSERT INTO site_settings (id, name, role, tagline, about, contact_email, linkedin_url, github_url, resume_url, skills, stats)
            VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              name=excluded.name, role=excluded.role, tagline=excluded.tagline,
              about=excluded.about, contact_email=excluded.contact_email,
              linkedin_url=excluded.linkedin_url, github_url=excluded.github_url,
              resume_url=excluded.resume_url, skills=excluded.skills, stats=excluded.stats`,
      args: [
        data.name,
        data.role,
        data.tagline,
        about,
        data.contact_email,
        data.linkedin_url,
        data.github_url,
        data.resume_url,
        JSON.stringify(data.skills ?? []),
        JSON.stringify(data.stats ?? []),
      ],
    });
    return { ok: true as const };
  });
