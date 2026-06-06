import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./auth.functions";
import type { BlogPost } from "./portfolio-types";

const blogInput = z.object({
  id: z.string().optional(),
  slug: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().min(1),
  content_html: z.string().default(""),
  topic: z.string().min(1),
  published: z.boolean().default(true),
  published_at: z.string().optional(),
});

/** Public: published garden entries, newest first. */
export const listPublishedPosts = createServerFn({ method: "GET" }).handler(
  async (): Promise<BlogPost[]> => {
    const { getDb, rowToBlogPost } = await import("./db.server");
    const res = await getDb().execute(
      "SELECT * FROM blog_posts WHERE published = 1 ORDER BY published_at DESC",
    );
    return res.rows.map(rowToBlogPost);
  },
);

/** Public: a single published entry by slug, or null. */
export const getPostBySlug = createServerFn({ method: "GET" })
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data }): Promise<BlogPost | null> => {
    const { getDb, rowToBlogPost } = await import("./db.server");
    const res = await getDb().execute({
      sql: "SELECT * FROM blog_posts WHERE slug = ? AND published = 1 LIMIT 1",
      args: [data.slug],
    });
    return res.rows[0] ? rowToBlogPost(res.rows[0]) : null;
  });

/** Admin: all entries (incl. drafts), newest first. */
export const listAllPosts = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async (): Promise<BlogPost[]> => {
    const { getDb, rowToBlogPost } = await import("./db.server");
    const res = await getDb().execute("SELECT * FROM blog_posts ORDER BY published_at DESC");
    return res.rows.map(rowToBlogPost);
  });

/** Admin: a single entry by id (for the edit form). */
export const getPostById = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }): Promise<BlogPost | null> => {
    const { getDb, rowToBlogPost } = await import("./db.server");
    const res = await getDb().execute({
      sql: "SELECT * FROM blog_posts WHERE id = ? LIMIT 1",
      args: [data.id],
    });
    return res.rows[0] ? rowToBlogPost(res.rows[0]) : null;
  });

/** Admin: create or update a garden entry. */
export const upsertPost = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(blogInput)
  .handler(async ({ data }) => {
    const { getDb, nowIso } = await import("./db.server");
    const { randomUUID } = await import("node:crypto");
    const db = getDb();
    const now = nowIso();
    const published = data.published ? 1 : 0;
    if (data.id) {
      await db.execute({
        sql: `UPDATE blog_posts SET slug=?, title=?, excerpt=?, content_html=?, topic=?,
                published=?, published_at=COALESCE(?, published_at), updated_at=? WHERE id=?`,
        args: [
          data.slug, data.title, data.excerpt, data.content_html, data.topic,
          published, data.published_at ?? null, now, data.id,
        ],
      });
      return { id: data.id };
    }
    const id = randomUUID();
    await db.execute({
      sql: `INSERT INTO blog_posts (id, slug, title, excerpt, content_html, topic, published, published_at, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id, data.slug, data.title, data.excerpt, data.content_html, data.topic,
        published, data.published_at ?? now, now, now,
      ],
    });
    return { id };
  });

/** Admin: delete a garden entry. */
export const deletePost = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { getDb } = await import("./db.server");
    await getDb().execute({ sql: "DELETE FROM blog_posts WHERE id = ?", args: [data.id] });
    return { ok: true as const };
  });
