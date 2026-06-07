import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, PageHeader } from "@/components/portfolio/Shell";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, Mail } from "lucide-react";
import type { TimelineItem } from "@/lib/portfolio-types";
import { listProjects, deleteProject } from "@/lib/projects.functions";
import { listAllPosts, deletePost } from "@/lib/blog.functions";
import { listTimeline, upsertTimelineItem, deleteTimelineItem } from "@/lib/timeline.functions";
import { getSiteSettings, updateSiteSettings, DEFAULT_SETTINGS } from "@/lib/settings.functions";
import { listContactMessages, deleteContactMessage, markContactMessageRead } from "@/lib/contact.functions";
import { TableSkeletonList } from "@/components/skeletons/TableSkeletons";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminHome,
});

type Tab = "projects" | "garden" | "timeline" | "messages" | "profile";

function AdminHome() {
  const [tab, setTab] = useState<Tab>("projects");
  return (
    <Shell>
      <PageHeader
        eyebrow="Admin"
        title="Manage content"
        description="Create, edit, and remove projects, garden entries, timeline items, and your profile."
      />
      <div className="mb-6 flex gap-1 border-b border-border">
        {(["projects", "garden", "timeline", "messages", "profile"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              "border-b-2 px-3 py-2 text-sm font-medium transition-colors " +
              (tab === t
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground")
            }
          >
            {t === "garden"
              ? "Digital Garden"
              : t === "messages"
                ? "Messages"
                : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      {tab === "projects" && <ProjectsAdmin />}
      {tab === "garden" && <GardenAdmin />}
      {tab === "timeline" && <TimelineAdmin />}
      {tab === "messages" && <MessagesAdmin />}
      {tab === "profile" && <ProfileAdmin />}
    </Shell>
  );
}

function ProjectsAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: () => listProjects(),
  });

  const del = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    await deleteProject({ data: { id } });
    qc.invalidateQueries({ queryKey: ["admin-projects"] });
  };

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-foreground">Projects</h2>
        <Link
          to="/admin/projects/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-3.5 w-3.5" /> New project
        </Link>
      </div>
      {isLoading ? (
        <TableSkeletonList count={5} />
      ) : data && data.length > 0 ? (
        <ul className="divide-y divide-border rounded-md border border-border">
          {data.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-4 p-3">
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">{p.title}</div>
                <div className="truncate font-mono text-xs text-muted-foreground">/{p.slug}</div>
              </div>
              <div className="flex items-center gap-1">
                <Link
                  to="/admin/projects/$id"
                  params={{ id: p.id }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => del(p.id)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState label="No projects yet." />
      )}
    </section>
  );
}

function GardenAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-garden"],
    queryFn: () => listAllPosts(),
  });

  const del = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    await deletePost({ data: { id } });
    qc.invalidateQueries({ queryKey: ["admin-garden"] });
  };

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-foreground">Digital Garden</h2>
        <Link
          to="/admin/garden/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-3.5 w-3.5" /> New entry
        </Link>
      </div>
      {isLoading ? (
        <TableSkeletonList count={5} />
      ) : data && data.length > 0 ? (
        <ul className="divide-y divide-border rounded-md border border-border">
          {data.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-4 p-3">
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">{p.title}</div>
                <div className="font-mono text-xs text-muted-foreground">
                  {p.topic} · {p.published ? "published" : "draft"}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Link
                  to="/admin/garden/$id"
                  params={{ id: p.id }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => del(p.id)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState label="No garden entries yet." />
      )}
    </section>
  );
}

function TimelineAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-timeline"],
    queryFn: () => listTimeline(),
  });
  const [editing, setEditing] = useState<TimelineItem | null>(null);
  const [creating, setCreating] = useState(false);

  const del = async (id: string) => {
    if (!confirm("Delete this timeline item?")) return;
    await deleteTimelineItem({ data: { id } });
    qc.invalidateQueries({ queryKey: ["admin-timeline"] });
  };

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-foreground">Timeline</h2>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-3.5 w-3.5" /> New entry
        </button>
      </div>
      {isLoading ? (
        <TableSkeletonList count={5} />
      ) : data && data.length > 0 ? (
        <ul className="divide-y divide-border rounded-md border border-border">
          {data.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-4 p-3">
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">{t.company}</div>
                <div className="font-mono text-xs text-muted-foreground">
                  {t.dates} · {t.role}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditing(t)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => del(t.id)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState label="No timeline items yet." />
      )}

      {(creating || editing) && (
        <TimelineForm
          initial={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ["admin-timeline"] });
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </section>
  );
}

function TimelineForm({
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
    const payload = {
      ...(initial ? { id: initial.id } : {}),
      dates,
      company,
      role,
      points: pointsText.split("\n").map((s) => s.trim()).filter(Boolean),
      sort_order: sort,
    };
    try {
      await upsertTimelineItem({ data: payload });
      setBusy(false);
      onSaved();
    } catch (e) {
      setBusy(false);
      setErr(e instanceof Error ? e.message : "Something went wrong.");
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

function ProfileAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => getSiteSettings(),
  });
  const [form, setForm] = useState(DEFAULT_SETTINGS);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setSaved(false);
    try {
      await updateSiteSettings({ data: form });
      qc.invalidateQueries({ queryKey: ["site-settings"] });
      setSaved(true);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <section className="max-w-lg">
      <h2 className="mb-1 text-sm font-medium text-foreground">Profile</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Shown across the site — sidebar, home page hero, and contact page.
      </p>
      <form onSubmit={submit} className="space-y-4">
        <FormRow label="Name">
          <input
            required
            value={form.name}
            onChange={set("name")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </FormRow>
        <FormRow label="Role / headline">
          <input
            value={form.role}
            onChange={set("role")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </FormRow>
        <FormRow label="Tagline">
          <textarea
            value={form.tagline}
            onChange={set("tagline")}
            rows={2}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </FormRow>
        <FormRow label="Contact email">
          <input
            type="email"
            value={form.contact_email}
            onChange={set("contact_email")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </FormRow>
        <FormRow label="LinkedIn URL">
          <input
            value={form.linkedin_url}
            onChange={set("linkedin_url")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </FormRow>
        <FormRow label="GitHub URL">
          <input
            value={form.github_url}
            onChange={set("github_url")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </FormRow>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save profile"}
          </button>
          {saved && <span className="font-mono text-xs text-muted-foreground">Saved.</span>}
        </div>
      </form>
    </section>
  );
}

function MessagesAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: () => listContactMessages(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteContactMessage,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-messages"] });
    },
  });

  const readMutation = useMutation({
    mutationFn: markContactMessageRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-messages"] });
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    await deleteMutation.mutateAsync({ id });
  };

  const handleToggleRead = async (id: string, currentRead: boolean) => {
    await readMutation.mutateAsync({ id, read: !currentRead });
  };

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-sm font-medium text-foreground">Contact Messages</h2>
      </div>
      {isLoading ? (
        <TableSkeletonList count={5} />
      ) : data && data.length > 0 ? (
        <div className="space-y-3">
          {data.map((msg) => (
            <div
              key={msg.id}
              className="rounded-lg border border-border p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-foreground">{msg.name}</div>
                    {!msg.read && (
                      <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">{msg.email}</div>
                  <p className="mt-2 text-sm text-foreground">{msg.message}</p>
                  <div className="mt-2 font-mono text-xs text-muted-foreground">
                    {new Date(msg.created_at).toLocaleDateString()} at{" "}
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleRead(msg.id, msg.read)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                    aria-label={msg.read ? "Mark as unread" : "Mark as read"}
                    title={msg.read ? "Mark as unread" : "Mark as read"}
                  >
                    <Mail className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState label="No messages yet." />
      )}
    </section>
  );
}

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}
