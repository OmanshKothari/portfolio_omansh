import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router";
import { Shell, PageHeader } from "@/components/portfolio/Shell";
import { useEffect, useState } from "react";
import { slugify, type BlogPost } from "@/lib/portfolio-types";
import { getPostById, upsertPost } from "@/lib/blog.functions";
import { RichEditor } from "@/components/portfolio/RichEditor";

export const Route = createFileRoute("/_authenticated/admin/garden/$id")({
  head: () => ({ meta: [{ title: "Edit entry" }, { name: "robots", content: "noindex" }] }),
  component: EditGardenPage,
});

function EditGardenPage() {
  const { id } = useParams({ from: "/_authenticated/admin/garden/$id" });
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPostById({ data: { id } }).then((p) => {
      setPost(p);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <Shell>
        <p className="text-muted-foreground">Loading…</p>
      </Shell>
    );
  }
  if (!post) {
    return (
      <Shell>
        <p className="text-muted-foreground">Entry not found.</p>
      </Shell>
    );
  }

  return (
    <Shell>
      <PageHeader eyebrow="Admin" title="Edit garden entry" />
      <BlogForm initial={post} onDone={() => navigate({ to: "/admin" })} />
    </Shell>
  );
}

export function BlogForm({
  initial,
  onDone,
}: {
  initial: BlogPost | null;
  onDone: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [topic, setTopic] = useState(initial?.topic ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content_html ?? "");
  const [published, setPublished] = useState(initial?.published ?? true);
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
      topic,
      excerpt,
      content_html: content,
      published,
    };
    try {
      await upsertPost({ data: payload });
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
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Slug">
          <input
            required
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
          />
        </Field>
        <Field label="Topic">
          <input
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Backend optimizations"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </Field>
      </div>
      <Field label="Excerpt">
        <textarea
          required
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </Field>
      <Field label="Content">
        <RichEditor value={content} onChange={setContent} placeholder="Start writing your entry…" />
      </Field>
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4 rounded border-input"
        />
        Published (visible to visitors)
      </label>

      {err && <p className="text-sm text-destructive">{err}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {busy ? "Saving…" : initial ? "Save changes" : "Create entry"}
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
