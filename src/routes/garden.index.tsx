import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, PageHeader } from "@/components/portfolio/Shell";
import { useQuery } from "@tanstack/react-query";
import { postsQuery, siteSettingsQuery } from "@/lib/queries";
import { GardenListSkeleton } from "@/components/skeletons/GardenSkeletons";
import { SITE_NAME } from "@/lib/site-config";
import type { BlogPost } from "@/lib/portfolio-types";

export const Route = createFileRoute("/garden/")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(postsQuery()),
      context.queryClient.ensureQueryData(siteSettingsQuery()),
    ]),
  head: () => ({
    meta: [
      { title: `Digital Garden — ${SITE_NAME}` },
      {
        name: "description",
        content: "Notes, recipes, and references from my engineering practice.",
      },
    ],
  }),
  component: GardenPage,
});

function GardenPage() {
  const { data, isLoading } = useQuery(postsQuery());

  const groups = (data ?? []).reduce<Record<string, BlogPost[]>>((acc, e) => {
    (acc[e.topic] ||= []).push(e);
    return acc;
  }, {});

  return (
    <Shell>
      <PageHeader
        eyebrow="Digital Garden"
        title="A technical cookbook"
        description="Notes I keep for myself, organized by topic."
      />
      {isLoading ? (
        <GardenListSkeleton count={5} />
      ) : Object.keys(groups).length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          No entries yet.
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(groups).map(([topic, entries]) => (
            <section key={topic}>
              <div className="mb-3 flex items-baseline justify-between border-b border-border pb-2">
                <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  [{topic}]
                </h2>
                <span className="font-mono text-xs text-muted-foreground">
                  {entries.length} {entries.length === 1 ? "entry" : "entries"}
                </span>
              </div>
              <ul className="divide-y divide-border">
                {entries.map((e) => (
                  <li key={e.id}>
                    <Link
                      to="/garden/$slug"
                      params={{ slug: e.slug }}
                      className="grid grid-cols-[1fr_auto] items-baseline gap-4 py-3 transition-colors hover:bg-accent/30"
                    >
                      <div>
                        <div className="text-sm text-foreground">{e.title}</div>
                        <p className="mt-1 text-sm text-muted-foreground">{e.excerpt}</p>
                      </div>
                      <time className="font-mono text-xs text-muted-foreground">
                        {e.published_at.slice(0, 10)}
                      </time>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </Shell>
  );
}
