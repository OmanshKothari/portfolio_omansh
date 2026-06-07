import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, Tag } from "@/components/portfolio/Shell";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { listProjects } from "@/lib/projects.functions";
import { listPublishedPosts } from "@/lib/blog.functions";
import { getSiteSettings, DEFAULT_SETTINGS } from "@/lib/settings.functions";
import { FeaturedProjectsSkeleton } from "@/components/skeletons/ProjectSkeletons";
import { GardenListSkeleton } from "@/components/skeletons/GardenSkeletons";
import type { Project, BlogPost } from "@/lib/portfolio-types";
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
  const settingsQ = useQuery({ queryKey: ["site-settings"], queryFn: () => getSiteSettings() });
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
      <Hero settings={settings} />
      {settings.about && <About html={settings.about} />}
      {settings.skills.length > 0 && <Skills groups={settings.skills} />}

      <div className="grid gap-12 md:grid-cols-2">
        <FeaturedProjects data={projectsQ.data} isLoading={projectsQ.isLoading} />
        <LatestFromGarden data={gardenQ.data} isLoading={gardenQ.isLoading} />
      </div>
    </Shell>
  );
}

/** Hero: eyebrow role → bold name → secondary tagline → CTAs. */
function Hero({ settings }: { settings: typeof DEFAULT_SETTINGS }) {
  return (
    <section className="mb-14">
      {settings.role && (
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          {settings.role}
        </p>
      )}
      <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
        Hi, I&apos;m {settings.name}.
      </h1>
      {settings.tagline && (
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          {settings.tagline}
        </p>
      )}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          to="/contact"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Get in touch <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          View projects
        </Link>
      </div>
    </section>
  );
}

/** About: rich-text bio (admin-authored HTML). */
function About({ html }: { html: string }) {
  return (
    <section className="mb-14">
      <SectionTitle>About</SectionTitle>
      <div className="prose-portfolio" dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
}

/** Skills: category blocks in a responsive two-column grid. */
function Skills({ groups }: { groups: typeof DEFAULT_SETTINGS.skills }) {
  return (
    <section className="mb-16">
      <SectionTitle>Skills</SectionTitle>
      <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        {groups.map((group) => (
          <div key={group.category}>
            <h3 className="mb-2.5 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {group.category}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {group.items.map((item) => (
                <Tag key={item}>{item}</Tag>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturedProjects({ data, isLoading }: { data?: Project[]; isLoading: boolean }) {
  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between border-b border-border pb-2">
        <h2 className="text-sm font-medium text-foreground">Featured Projects</h2>
        <Link to="/projects" className="font-mono text-xs text-primary hover:underline">
          all →
        </Link>
      </div>
      {isLoading ? (
        <FeaturedProjectsSkeleton count={2} />
      ) : data && data.length > 0 ? (
        <ul className="space-y-4">
          {data.map((p) => (
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
  );
}

function LatestFromGarden({ data, isLoading }: { data?: BlogPost[]; isLoading: boolean }) {
  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between border-b border-border pb-2">
        <h2 className="text-sm font-medium text-foreground">Latest from the Garden</h2>
        <Link to="/garden" className="font-mono text-xs text-primary hover:underline">
          all →
        </Link>
      </div>
      {isLoading ? (
        <GardenListSkeleton count={3} />
      ) : data && data.length > 0 ? (
        <ul className="divide-y divide-border">
          {data.map((e) => (
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
  );
}

/** Plain section title used by About / Skills. */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 text-sm font-medium text-foreground">{children}</h2>;
}
