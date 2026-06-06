import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, Tag } from "@/components/portfolio/Shell";
import { useQuery } from "@tanstack/react-query";
import { listProjects } from "@/lib/projects.functions";
import { listPublishedPosts } from "@/lib/blog.functions";
import { getSiteSettings, DEFAULT_SETTINGS } from "@/lib/settings.functions";
import { SITE_NAME } from "@/lib/site-config";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${SITE_NAME} — Portfolio` },
      { name: "description", content: `${SITE_NAME}'s portfolio.` },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const settingsQ = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => getSiteSettings(),
  });
  const settings = settingsQ.data ?? DEFAULT_SETTINGS;
  const projectsQ = useQuery({
    queryKey: ["projects-featured"],
    queryFn: async () => (await listProjects()).slice(0, 2),
  });
  const gardenQ = useQuery({
    queryKey: ["garden-latest"],
    queryFn: async () => (await listPublishedPosts()).slice(0, 3),
  });

  return (
    <Shell>
      <section className="mb-16">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Dashboard</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
          Hi, I&apos;m {settings.name}.<br />
          <span className="text-muted-foreground">{settings.tagline}</span>
        </h1>
      </section>

      <div className="grid gap-12 md:grid-cols-2">
        <section>
          <div className="mb-4 flex items-baseline justify-between border-b border-border pb-2">
            <h2 className="text-sm font-medium text-foreground">Featured Projects</h2>
            <Link to="/projects" className="font-mono text-xs text-primary hover:underline">
              all →
            </Link>
          </div>
          {projectsQ.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : projectsQ.data && projectsQ.data.length > 0 ? (
            <ul className="space-y-4">
              {projectsQ.data.map((p) => (
                <li key={p.id}>
                  <Link
                    to="/projects/$slug"
                    params={{ slug: p.slug }}
                    className="block rounded-lg border border-border p-4 transition-colors hover:bg-accent/40"
                  >
                    <h3 className="text-sm font-medium text-foreground">{p.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.tags.slice(0, 4).map((t) => (
                        <Tag key={t}>{t}</Tag>
                      ))}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No projects yet.</p>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-baseline justify-between border-b border-border pb-2">
            <h2 className="text-sm font-medium text-foreground">Latest from the Garden</h2>
            <Link to="/garden" className="font-mono text-xs text-primary hover:underline">
              all →
            </Link>
          </div>
          {gardenQ.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : gardenQ.data && gardenQ.data.length > 0 ? (
            <ul className="divide-y divide-border">
              {gardenQ.data.map((e) => (
                <li key={e.id} className="py-3">
                  <Link to="/garden/$slug" params={{ slug: e.slug }} className="block">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-sm text-foreground">{e.title}</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {e.published_at.slice(0, 10)}
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      {e.topic}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No entries yet.</p>
          )}
        </section>
      </div>
    </Shell>
  );
}
