import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useRef } from "react";
import { Shell, Tag } from "@/components/portfolio/Shell";
import { useQuery } from "@tanstack/react-query";
import { projectQuery, siteSettingsQuery } from "@/lib/queries";
import { ProjectDetailSkeleton } from "@/components/skeletons/ProjectSkeletons";
import { SITE_NAME } from "@/lib/site-config";
import { useRichContent } from "@/components/portfolio/rich-content";

export const Route = createFileRoute("/projects/$slug")({
  // Resolve on the server so SSR ships the article (not a skeleton) and the
  // head() below can use the real title for tabs and link unfurls.
  loader: async ({ params, context }) => {
    const [project] = await Promise.all([
      context.queryClient.ensureQueryData(projectQuery(params.slug)),
      context.queryClient.ensureQueryData(siteSettingsQuery()),
    ]);
    return project;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — ${SITE_NAME}` },
          { name: "description", content: loaderData.description },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.description },
        ]
      : [{ title: `Project — ${SITE_NAME}` }],
  }),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { slug } = useParams({ from: "/projects/$slug" });
  const { data, isLoading } = useQuery(projectQuery(slug));
  const articleRef = useRef<HTMLDivElement>(null);

  // Code highlighting + mermaid diagrams in the long-form write-up.
  useRichContent(articleRef, data?.long_description);

  if (isLoading) {
    return (
      <Shell>
        <ProjectDetailSkeleton />
      </Shell>
    );
  }
  if (!data) {
    return (
      <Shell>
        <p className="text-muted-foreground">Project not found.</p>
        <Link to="/projects" className="text-primary hover:underline">
          ← all projects
        </Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <Link
        to="/projects"
        className="font-mono text-xs text-muted-foreground hover:text-foreground"
      >
        ← projects
      </Link>
      <article className="mt-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{data.title}</h1>
        <p className="mt-3 text-muted-foreground">{data.description}</p>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {data.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>

        {(data.github_url || data.demo_url) && (
          <div className="mt-5 flex gap-4 font-mono text-xs">
            {data.github_url && (
              <a
                href={data.github_url}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                [GitHub]
              </a>
            )}
            {data.demo_url && (
              <a
                href={data.demo_url}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                [Live Demo]
              </a>
            )}
          </div>
        )}

        {data.cover_url && (
          <img
            src={data.cover_url}
            alt={data.title}
            className="mt-8 w-full rounded-lg border border-border"
          />
        )}

        {data.long_description && (
          <div
            ref={articleRef}
            className="prose-portfolio mt-8"
            dangerouslySetInnerHTML={{ __html: data.long_description }}
          />
        )}
      </article>
    </Shell>
  );
}
