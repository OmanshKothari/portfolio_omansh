import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router";
import { Shell, PageHeader } from "@/components/portfolio/Shell";
import { useEffect, useState } from "react";
import { slugify, type Project } from "@/lib/portfolio-types";
import { getProjectById, upsertProject } from "@/lib/projects.functions";
import { RichEditor } from "@/components/portfolio/RichEditor";
import { EditFormSkeleton } from "@/components/skeletons/FormSkeletons";
import { X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/projects/$id")({
  head: () => ({ meta: [{ title: "Edit project" }, { name: "robots", content: "noindex" }] }),
  component: EditProjectPage,
});

function EditProjectPage() {
  const { id } = useParams({ from: "/_authenticated/admin/projects/$id" });
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjectById({ data: { id } }).then((p) => {
      setProject(p);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <Shell>
        <EditFormSkeleton />
      </Shell>
    );
  }
  if (!project) {
    return (
      <Shell>
        <p className="text-muted-foreground">Project not found.</p>
        <Link to="/admin" className="text-primary hover:underline">
          ← back
        </Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <PageHeader eyebrow="Admin" title="Edit project" />
      <ProjectForm initial={project} onDone={() => navigate({ to: "/admin" })} />
    </Shell>
  );
}

export function ProjectForm({ initial, onDone }: { initial: Project | null; onDone: () => void }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [longDescription, setLongDescription] = useState(initial?.long_description ?? "");
  const [tagsText, setTagsText] = useState((initial?.tags ?? []).join(", "));
  const [github, setGithub] = useState(initial?.github_url ?? "");
  const [demo, setDemo] = useState(initial?.demo_url ?? "");
  const [coverUrl, setCoverUrl] = useState(initial?.cover_url ?? "");
  const [sort, setSort] = useState(initial?.sort_order ?? 0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!initial && title && !slug) setSlug(slugify(title));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const payload = {
      ...(initial ? { id: initial.id } : {}),
      title,
      slug: slug || slugify(title),
      description,
      long_description: longDescription || null,
      tags: tagsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      github_url: github || null,
      demo_url: demo || null,
      cover_url: coverUrl || null,
      sort_order: sort,
    };
    try {
      await upsertProject({ data: payload });
      setBusy(false);
      onDone();
    } catch (e2) {
      setBusy(false);
      setErr(e2 instanceof Error ? e2.message : "Something went wrong.");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <Field label="Title">
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </Field>
      <Field label="Slug">
        <input
          required
          value={slug}
          onChange={(e) => setSlug(slugify(e.target.value))}
          className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
        />
      </Field>
      <Field label="Short description">
        <textarea
          required
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </Field>
      <Field label="Long description (shown on detail page)">
        <RichEditor
          value={longDescription}
          onChange={setLongDescription}
          placeholder="Write a longer write-up — headings, lists, links, and formatting are supported."
        />
      </Field>
      <Field label="Tags (comma separated)">
        <input
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          placeholder="Rust, PostgreSQL, gRPC"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="GitHub URL">
          <input
            type="url"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Demo URL">
          <input
            type="url"
            value={demo}
            onChange={(e) => setDemo(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </Field>
      </div>

      <Field label="Cover image (optional)">
        <div className="space-y-3">
          {coverUrl && (
            <div className="relative inline-block">
              <img
                src={coverUrl}
                alt="cover"
                className="h-32 w-auto rounded-md border border-border object-cover"
              />
              <button
                type="button"
                onClick={() => setCoverUrl("")}
                className="absolute -right-2 -top-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:text-foreground"
                aria-label="Remove cover"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          <input
            type="text"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="/covers/my-project.png  or  https://…"
            className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
          />
          <p className="font-mono text-[11px] text-muted-foreground">
            Commit image files under <code>public/covers/</code> and reference them as{" "}
            <code>/covers/filename.png</code>, or paste any absolute image URL.
          </p>
        </div>
      </Field>

      <Field label="Sort order (lower shows first)">
        <input
          type="number"
          value={sort}
          onChange={(e) => setSort(Number(e.target.value))}
          className="w-32 rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </Field>

      {err && <p className="text-sm text-destructive">{err}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {busy ? "Saving…" : initial ? "Save changes" : "Create project"}
        </button>
        <Link to="/admin" className="font-mono text-xs text-muted-foreground hover:text-foreground">
          Cancel
        </Link>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
