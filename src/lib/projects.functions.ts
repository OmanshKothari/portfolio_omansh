import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./auth.functions";
import type { Project } from "./portfolio-types";

const projectInput = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  long_description: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  github_url: z.string().nullable().optional(),
  demo_url: z.string().nullable().optional(),
  cover_url: z.string().nullable().optional(),
  sort_order: z.number().default(0),
});

/** Public: all projects, ordered for display. */
export const listProjects = createServerFn({ method: "GET" }).handler(async (): Promise<Project[]> => {
  const { getDb, rowToProject } = await import("./db.server");
  const res = await getDb().execute(
    "SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC",
  );
  return res.rows.map(rowToProject);
});

/** Public: a single project by slug, or null. */
export const getProjectBySlug = createServerFn({ method: "GET" })
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data }): Promise<Project | null> => {
    const { getDb, rowToProject } = await import("./db.server");
    const res = await getDb().execute({
      sql: "SELECT * FROM projects WHERE slug = ? LIMIT 1",
      args: [data.slug],
    });
    return res.rows[0] ? rowToProject(res.rows[0]) : null;
  });

/** Admin: a single project by id (for the edit form). */
export const getProjectById = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }): Promise<Project | null> => {
    const { getDb, rowToProject } = await import("./db.server");
    const res = await getDb().execute({
      sql: "SELECT * FROM projects WHERE id = ? LIMIT 1",
      args: [data.id],
    });
    return res.rows[0] ? rowToProject(res.rows[0]) : null;
  });

/** Admin: create or update a project. */
export const upsertProject = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(projectInput)
  .handler(async ({ data }) => {
    const { getDb, nowIso } = await import("./db.server");
    const { randomUUID } = await import("node:crypto");
    const db = getDb();
    const now = nowIso();
    const tags = JSON.stringify(data.tags ?? []);
    if (data.id) {
      await db.execute({
        sql: `UPDATE projects SET title=?, slug=?, description=?, long_description=?, tags=?,
                github_url=?, demo_url=?, cover_url=?, sort_order=?, updated_at=? WHERE id=?`,
        args: [
          data.title, data.slug, data.description, data.long_description ?? null, tags,
          data.github_url ?? null, data.demo_url ?? null, data.cover_url ?? null,
          data.sort_order ?? 0, now, data.id,
        ],
      });
      return { id: data.id };
    }
    const id = randomUUID();
    await db.execute({
      sql: `INSERT INTO projects (id, slug, title, description, long_description, tags, github_url, demo_url, cover_url, sort_order, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id, data.slug, data.title, data.description, data.long_description ?? null, tags,
        data.github_url ?? null, data.demo_url ?? null, data.cover_url ?? null,
        data.sort_order ?? 0, now, now,
      ],
    });
    return { id };
  });

/** Admin: delete a project. */
export const deleteProject = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { getDb } = await import("./db.server");
    await getDb().execute({ sql: "DELETE FROM projects WHERE id = ?", args: [data.id] });
    return { ok: true as const };
  });
