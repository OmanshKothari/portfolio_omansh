import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, Tag } from "@/components/portfolio/Shell";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { listProjects } from "@/lib/projects.functions";
import { listPublishedPosts } from "@/lib/blog.functions";
import { listTimeline } from "@/lib/timeline.functions";
import { getSiteSettings, DEFAULT_SETTINGS } from "@/lib/settings.functions";
import { FeaturedProjectsSkeleton } from "@/components/skeletons/ProjectSkeletons";
import { GardenListSkeleton } from "@/components/skeletons/GardenSkeletons";
import { HighlightsSkeleton } from "@/components/skeletons/TimelineSkeletons";
import type { Project, BlogPost, TimelineItem } from "@/lib/portfolio-types";
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

/** Shared hover treatment for every clickable card (brittanychiang.com style). */
const CARD =
  "group block rounded-xl border border-border p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent/40 hover:shadow-sm";

function Dashboard() {
  const settingsQ = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => getSiteSettings(),
  });

  const settings = settingsQ.data ?? DEFAULT_SETTINGS;

  const timelineQ = useQuery({
    queryKey: ["timeline-home"],
    queryFn: async () => (await listTimeline()).slice(0, 3),
  });

  const projectsQ = useQuery({
    queryKey: ["projects-featured"],
    queryFn: async () => (await listProjects()).slice(0, 2),
  });

  const gardenQ = useQuery({
    queryKey: ["garden-latest"],
    queryFn: async () => (await listPublishedPosts()).slice(0, 3),
  });

  const hasHighlights = timelineQ.isLoading || (timelineQ.data?.length ?? 0) > 0;

  return (
    <Shell>
      <Hero settings={settings} />

      {settings.about && (
        <Section title="About">
          <div className="rounded-xl border border-border p-6">
            <div
              className="prose-portfolio max-w-none"
              dangerouslySetInnerHTML={{ __html: settings.about }}
            />
          </div>
        </Section>
      )}

      {hasHighlights && (
        <Section
          title="Career Highlights"
          action={
            <Link
              to="/timeline"
              className="group inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
            >
              View full timeline
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          }
        >
          <CareerHighlights data={timelineQ.data} isLoading={timelineQ.isLoading} />
        </Section>
      )}

      <Section
        title="Featured Projects"
        action={
          <Link
            to="/projects"
            className="group inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
          >
            All projects
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        }
      >
        <FeaturedProjects data={projectsQ.data} isLoading={projectsQ.isLoading} />
      </Section>

      {settings.skills.length > 0 && (
        <Section title="Skills">
          <Skills groups={settings.skills} />
        </Section>
      )}

      <Section
        title="Latest Writing"
        action={
          <Link
            to="/garden"
            className="group inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
          >
            All writing
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        }
      >
        <LatestWriting data={gardenQ.data} isLoading={gardenQ.isLoading} />
      </Section>
    </Shell>
  );
}

/** Hero: eyebrow role → bold name → secondary tagline → CTAs → configurable stats. */
function Hero({ settings }: { settings: typeof DEFAULT_SETTINGS }) {
  return (
    <section className="mb-16">
      {settings.role && (
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
          {settings.role}
        </p>
      )}

      <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-tight md:text-6xl">
        Hi, I'm {settings.name}.
      </h1>

      {settings.tagline && (
        <p className="mt-5 max-w-3xl text-xl leading-relaxed text-muted-foreground">
          {settings.tagline}
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/projects"
          className="group inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          View Projects
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>

        <Link
          to="/contact"
          className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
        >
          Contact
        </Link>
      </div>

      {settings.stats.length > 0 && (
        <dl className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-px overflow-hidden rounded-xl border border-border bg-border">
          {settings.stats.map((stat, i) => (
            <div key={i} className="bg-background px-5 py-4">
              <dt className="text-2xl font-semibold text-foreground">{stat.value}</dt>
              <dd className="mt-0.5 text-sm text-muted-foreground">{stat.label}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

/** Career Highlights: top timeline roles as cards linking to the full timeline. */
function CareerHighlights({ data, isLoading }: { data?: TimelineItem[]; isLoading: boolean }) {
  if (isLoading) return <HighlightsSkeleton count={2} />;
  if (!data || data.length === 0) return null;

  return (
    <ul className="space-y-4">
      {data.map((item) => (
        <li key={item.id}>
          <Link to="/timeline" className={CARD}>
            <div className="font-mono text-xs text-muted-foreground">{item.dates}</div>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
              <h3 className="text-base font-medium text-foreground transition-colors group-hover:text-primary">
                {item.company}
              </h3>
              {item.role && (
                <span className="font-mono text-xs text-muted-foreground">· {item.role}</span>
              )}
            </div>
            {item.points.length > 0 && (
              <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                {item.points.slice(0, 2).map((point, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
                    <span className="line-clamp-2">{point}</span>
                  </li>
                ))}
              </ul>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function FeaturedProjects({ data, isLoading }: { data?: Project[]; isLoading: boolean }) {
  if (isLoading) return <FeaturedProjectsSkeleton count={2} />;
  if (!data || data.length === 0)
    return <p className="text-sm text-muted-foreground">No projects yet.</p>;

  return (
    <ul className="space-y-4">
      {data.map((p) => (
        <li key={p.id}>
          <Link to="/projects/$slug" params={{ slug: p.slug }} className={CARD}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-medium text-foreground transition-colors group-hover:text-primary">
                {p.title}
              </h3>
              <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
            </div>
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
  );
}

/** Skills: category cards in a responsive auto-fit grid (1/2/3 columns by width). */
function Skills({ groups }: { groups: typeof DEFAULT_SETTINGS.skills }) {
  return (
    <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
      {groups.map((group) => (
        <div key={group.category} className="rounded-xl border border-border p-5">
          <h3 className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {group.category}
          </h3>
          <div className="flex flex-wrap gap-2">
            {group.items.map((item) => (
              <Tag key={item}>{item}</Tag>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function LatestWriting({ data, isLoading }: { data?: BlogPost[]; isLoading: boolean }) {
  if (isLoading) return <GardenListSkeleton count={3} />;
  if (!data || data.length === 0)
    return <p className="text-sm text-muted-foreground">No entries yet.</p>;

  return (
    <ul className="space-y-4">
      {data.map((e) => (
        <li key={e.id}>
          <Link to="/garden/$slug" params={{ slug: e.slug }} className={CARD}>
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {e.topic}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {e.published_at.slice(0, 10)}
              </span>
            </div>
            <h3 className="mt-1.5 text-base font-medium text-foreground transition-colors group-hover:text-primary">
              {e.title}
            </h3>
            {e.excerpt && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{e.excerpt}</p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Consistent section frame: one heading scale + optional action, used by every home section. */
function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-16">
      <div className="mb-5 flex items-baseline justify-between gap-4 border-b border-border pb-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
