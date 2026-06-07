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
      <Hero settings={settings} />

      <section className="mb-16">
        <FeaturedProjects data={projectsQ.data} isLoading={projectsQ.isLoading} />
      </section>

      <section className="mb-16 grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        {settings.about && <About html={settings.about} />}

        {settings.skills.length > 0 && <Skills groups={settings.skills} />}
      </section>

      <LatestFromGarden data={gardenQ.data} isLoading={gardenQ.isLoading} />
    </Shell>
  );
}

/** Hero: eyebrow role → bold name → secondary tagline → CTAs. */
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
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          View Projects
          <ArrowRight className="h-4 w-4" />
        </Link>

        <Link
          to="/contact"
          className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium"
        >
          Contact
        </Link>
      </div>

      <div className="mt-10 flex flex-wrap gap-10">
        <div>
          <div className="text-2xl font-semibold">3+</div>
          <div className="text-sm text-muted-foreground">Years Experience</div>
        </div>

        <div>
          <div className="text-2xl font-semibold">Full Stack</div>
          <div className="text-sm text-muted-foreground">React + Spring Boot</div>
        </div>

        <div>
          <div className="text-2xl font-semibold">SaaS</div>
          <div className="text-sm text-muted-foreground">Multi-tenant Platforms</div>
        </div>
      </div>
    </section>
  );
}

/** About: rich-text bio (admin-authored HTML). */
function About({ html }: { html: string }) {
  return (
    <div>
      <SectionTitle>About</SectionTitle>

      <div className="prose-portfolio max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

/** Skills: category blocks in a responsive two-column grid. */
function Skills({ groups }: { groups: typeof DEFAULT_SETTINGS.skills }) {
  return (
    <div>
      <SectionTitle>Skills</SectionTitle>

      <div className="grid gap-4">
        {groups.map((group) => (
          <div key={group.category} className="rounded-xl border border-border p-4">
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
    </div>
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
                className="block rounded-xl border border-border p-5 transition-all hover:bg-accent/40 hover:-translate-y-0.5"
              >
                <h3 className="text-base font-medium text-foreground">{p.title}</h3>
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
