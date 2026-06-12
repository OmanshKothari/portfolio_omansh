import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, PageHeader, Tag } from "@/components/portfolio/Shell";
import { useQuery } from "@tanstack/react-query";
import { projectsQuery, siteSettingsQuery } from "@/lib/queries";
import { ProjectSkeletonGrid } from "@/components/skeletons/ProjectSkeletons";
import { SITE_NAME } from "@/lib/site-config";

export const Route = createFileRoute("/projects/")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(projectsQuery()),
      context.queryClient.ensureQueryData(siteSettingsQuery()),
    ]),
  head: () => ({
    meta: [
      { title: `Projects — ${SITE_NAME}` },
      { name: "description", content: "Selected backend and systems projects." },
    ],
  }),
  component: ProjectsPage,
});

/**
 * Cover stand-in for projects without an uploaded image: a gradient derived
 * deterministically from the slug (same project → same colors) with the
 * project's initial as a monogram, so coverless cards never look bare.
 */
function CoverPlaceholder({ slug, title }: { slug: string; title: string }) {
  const hash = [...slug].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const hue = hash % 360;
  const hue2 = (hue + 55) % 360;
  return (
    <div
      aria-hidden
      className="mb-4 flex h-32 w-full items-center justify-center rounded-md border border-border"
      style={{
        background: `linear-gradient(135deg, oklch(0.55 0.13 ${hue}) 0%, oklch(0.42 0.15 ${hue2}) 100%)`,
      }}
    >
      <span className="select-none font-mono text-4xl font-semibold text-white/80">
        {title.trim().charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

function ProjectsPage() {
  const { data, isLoading } = useQuery(projectsQuery());

  return (
    <Shell>
      <PageHeader
        eyebrow="Projects"
        title="Selected work"
        description="A small set of systems I built or led."
      />
      {isLoading ? (
        <ProjectSkeletonGrid count={4} />
      ) : data && data.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.map((p) => (
            <Link
              key={p.id}
              to="/projects/$slug"
              params={{ slug: p.slug }}
              className="group rounded-lg border border-border p-5 transition-colors hover:bg-accent/40"
            >
              {p.cover_url ? (
                <img
                  src={p.cover_url}
                  alt=""
                  className="mb-4 h-32 w-full rounded-md border border-border object-cover"
                />
              ) : (
                <CoverPlaceholder slug={p.slug} title={p.title} />
              )}
              <h3 className="text-base font-medium text-foreground">{p.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
              <div className="mt-5 font-mono text-xs text-primary group-hover:underline">
                Read more →
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          No projects yet.
        </div>
      )}
    </Shell>
  );
}
