import { useState } from "react";
import type { TimelineItem } from "@/lib/portfolio-types";
import { upsertTimelineItem } from "@/lib/timeline.functions";
import { FormRow } from "./primitives";

/** Split a textarea of bullet points (one per line) into a trimmed string array. */
function parsePoints(text: string): string[] {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Modal form for creating or editing a timeline item.
 * `initial` is null when creating, or the item being edited otherwise.
 */
export function TimelineForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: TimelineItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [dates, setDates] = useState(initial?.dates ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [pointsText, setPointsText] = useState((initial?.points ?? []).join("\n"));
  const [sort, setSort] = useState(initial?.sort_order ?? 0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await upsertTimelineItem({
        data: {
          ...(initial ? { id: initial.id } : {}),
          dates,
          company,
          role,
          points: parsePoints(pointsText),
          sort_order: sort,
        },
      });
      onSaved();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-lg space-y-4 rounded-lg border border-border bg-background p-6"
      >
        <h3 className="text-base font-medium text-foreground">
          {initial ? "Edit timeline item" : "New timeline item"}
        </h3>
        <FormRow label="Dates (e.g. Oct 2023 — Present)">
          <input
            required
            value={dates}
            onChange={(e) => setDates(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </FormRow>
        <FormRow label="Company / Institution">
          <input
            required
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </FormRow>
        <FormRow label="Role">
          <input
            required
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </FormRow>
        <FormRow label="Bullet points (one per line)">
          <textarea
            value={pointsText}
            onChange={(e) => setPointsText(e.target.value)}
            rows={5}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </FormRow>
        <FormRow label="Sort order (lower shows first)">
          <input
            type="number"
            value={sort}
            onChange={(e) => setSort(Number(e.target.value))}
            className="w-32 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </FormRow>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
