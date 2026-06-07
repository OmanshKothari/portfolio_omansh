import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./auth.functions";
import type { ContactMessage } from "./portfolio-types";

// Validation schema for contact form submission.
const contactInput = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  message: z.string().min(5, "Message must be at least 5 characters").max(5000),
});

/**
 * Public: submit a contact form message.
 * Stores the message in the database for admin review.
 */
export const submitContactForm = createServerFn({ method: "POST" })
  .inputValidator(contactInput)
  .handler(async ({ data }) => {
    const { getDb, nowIso } = await import("./db.server");
    const { randomUUID } = await import("node:crypto");

    const db = getDb();
    const id = randomUUID();
    const now = nowIso();

    try {
      await db.execute({
        sql: `INSERT INTO contact_messages (id, name, email, message, read, created_at)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [id, data.name, data.email, data.message, 0, now],
      });

      return { success: true, id };
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
    const res = await getDb().execute(
      "SELECT * FROM contact_messages ORDER BY created_at DESC"
    );
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
    await getDb().execute(
      "UPDATE contact_messages SET read = ? WHERE id = ?",
      [data.read ? 1 : 0, data.id]
    );
    return { success: true };
  });
