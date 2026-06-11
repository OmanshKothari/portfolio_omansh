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
              {p.cover_url && (
                <img
                  src={p.cover_url}
                  alt=""
                  className="mb-4 h-32 w-full rounded-md border border-border object-cover"
                />
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
