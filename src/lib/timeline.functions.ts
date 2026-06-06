import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./auth.functions";
import type { TimelineItem } from "./portfolio-types";

const timelineInput = z.object({
  id: z.string().optional(),
  dates: z.string().min(1),
  company: z.string().min(1),
  role: z.string().min(1),
  points: z.array(z.string()).default([]),
  sort_order: z.number().default(0),
});

/** Public + admin: all timeline items, ordered for display. */
export const listTimeline = createServerFn({ method: "GET" }).handler(
  async (): Promise<TimelineItem[]> => {
    const { getDb, rowToTimelineItem } = await import("./db.server");
    const res = await getDb().execute(
      "SELECT * FROM timeline_items ORDER BY sort_order ASC, created_at DESC",
    );
    return res.rows.map(rowToTimelineItem);
  },
);

/** Admin: create or update a timeline item. */
export const upsertTimelineItem = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(timelineInput)
  .handler(async ({ data }) => {
    const { getDb, nowIso } = await import("./db.server");
    const { randomUUID } = await import("node:crypto");
    const db = getDb();
    const now = nowIso();
    const points = JSON.stringify(data.points ?? []);
    if (data.id) {
      await db.execute({
        sql: `UPDATE timeline_items SET dates=?, company=?, role=?, points=?, sort_order=?, updated_at=? WHERE id=?`,
        args: [data.dates, data.company, data.role, points, data.sort_order ?? 0, now, data.id],
      });
      return { id: data.id };
    }
    const id = randomUUID();
    await db.execute({
      sql: `INSERT INTO timeline_items (id, dates, company, role, points, sort_order, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, data.dates, data.company, data.role, points, data.sort_order ?? 0, now, now],
    });
    return { id };
  });

/** Admin: delete a timeline item. */
export const deleteTimelineItem = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { getDb } = await import("./db.server");
    await getDb().execute({ sql: "DELETE FROM timeline_items WHERE id = ?", args: [data.id] });
    return { ok: true as const };
  });
