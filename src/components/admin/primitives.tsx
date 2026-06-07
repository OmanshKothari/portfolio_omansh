// Small presentational building blocks shared by the admin tabs.
// Extracted here so each tab stays focused on its data/behaviour rather than
// repeating the same markup for headers, rows, buttons, and empty states.
import { Pencil, Trash2 } from "lucide-react";
import { ICON_BTN, ICON_BTN_DANGER } from "./styles";

/** Section heading with an optional action (e.g. a "New" button) on the right. */
export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-sm font-medium text-foreground">{title}</h2>
      {action}
    </div>
  );
}

/** Bordered, divided list container for admin rows. */
export function AdminList({ children }: { children: React.ReactNode }) {
  return <ul className="divide-y divide-border rounded-md border border-border">{children}</ul>;
}

/** A single admin list row: free-form content on the left, actions on the right. */
export function AdminRow({
  children,
  actions,
}: {
  children: React.ReactNode;
  actions: React.ReactNode;
}) {
  return (
    <li className="flex items-center justify-between gap-4 p-3">
      <div className="min-w-0">{children}</div>
      <div className="flex items-center gap-1">{actions}</div>
    </li>
  );
}

/** Pencil-icon edit action rendered as a <button> (for in-place edits). */
export function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className={ICON_BTN} aria-label="Edit">
      <Pencil className="h-4 w-4" />
    </button>
  );
}

/** Trash-icon delete action. */
export function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className={ICON_BTN_DANGER} aria-label="Delete">
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

/** Pencil icon for an edit action that navigates (paired with `editLinkClass`). */
export function EditIcon() {
  return <Pencil className="h-4 w-4" />;
}

/** Labelled form field wrapper. */
export function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

/** Placeholder shown when a list has no items. */
export function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}
