import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./auth.functions";
import type { ContactMessage } from "./portfolio-types";

// Validation schema for contact form submission.
const contactInput = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  message: z.string().min(5, "Message must be at least 5 characters").max(5000),
  // Honeypot: hidden in the UI, so humans leave it empty. Bots that autofill
  // every field reveal themselves here.
  website: z.string().optional(),
});

// Spam throttle: a few submissions per IP per 30-minute window. Keyed on IP
// (not the submitted email) because the email is attacker-controlled — a
// spammer could rotate addresses to bypass an email-keyed limit entirely.
const CONTACT_MAX_SUBMISSIONS = 3;
const CONTACT_WINDOW_MS = 30 * 60 * 1000;

// Storage ceiling: stop accepting messages if the unread backlog is huge —
// at that point new inserts are spam, not conversations.
const CONTACT_MAX_UNREAD = 500;

/**
 * Public: submit a contact form message.
 * Throttled per IP, then stored in the database for admin review.
 */
export const submitContactForm = createServerFn({ method: "POST" })
  .inputValidator(contactInput)
  .handler(async ({ data }) => {
    const { getDb, nowIso } = await import("./db.server");
    const { checkRateLimit, clientIp } = await import("./rate-limit.server");
    const { randomUUID } = await import("node:crypto");

    // Pretend success for honeypot hits — don't teach the bot what failed.
    if (data.website && data.website.trim() !== "") {
      return { success: true };
    }

    const limit = await checkRateLimit(
      `contact:${clientIp()}`,
      CONTACT_MAX_SUBMISSIONS,
      CONTACT_WINDOW_MS,
    );
    if (!limit.allowed) {
      const minutes = Math.ceil(limit.retryAfterMs / 60_000);
      throw new Error(
        `You've already sent a message recently. Please try again in ${minutes} minute(s).`,
      );
    }

    const db = getDb();

    const unread = await db.execute("SELECT COUNT(*) AS n FROM contact_messages WHERE read = 0");
    if (Number(unread.rows[0]?.n ?? 0) >= CONTACT_MAX_UNREAD) {
      throw new Error("The inbox is full right now. Please reach out by email instead.");
    }
    try {
      await db.execute({
        sql: `INSERT INTO contact_messages (id, name, email, message, read, created_at)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [randomUUID(), data.name, data.email, data.message, 0, nowIso()],
      });
      return { success: true };
    } catch (error) {
      console.error("Error submitting contact form:", error);
      throw new Error("Failed to submit contact form. Please try again.");
    }
  });

/**
 * Admin: list all contact messages.
 */
export const listContactMessages = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async (): Promise<ContactMessage[]> => {
    const { getDb, rowToContactMessage } = await import("./db.server");
    const res = await getDb().execute("SELECT * FROM contact_messages ORDER BY created_at DESC");
    return res.rows.map(rowToContactMessage);
  });

/**
 * Admin: delete a contact message.
 */
export const deleteContactMessage = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { getDb } = await import("./db.server");
    await getDb().execute("DELETE FROM contact_messages WHERE id = ?", [data.id]);
    return { success: true };
  });

/**
 * Admin: mark a contact message as read/unread.
 */
export const markContactMessageRead = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(z.object({ id: z.string(), read: z.boolean() }))
  .handler(async ({ data }) => {
    const { getDb } = await import("./db.server");
    await getDb().execute("UPDATE contact_messages SET read = ? WHERE id = ?", [
      data.read ? 1 : 0,
      data.id,
    ]);
    return { success: true };
  });
