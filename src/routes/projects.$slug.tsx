import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Shell, Tag } from "@/components/portfolio/Shell";
import { useQuery } from "@tanstack/react-query";
import { getProjectBySlug } from "@/lib/projects.functions";

export const Route = createFileRoute("/projects/$slug")({
  head: () => ({
    meta: [{ title: "Project" }],
  }),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { slug } = useParams({ from: "/projects/$slug" });
  const { data, isLoading } = useQuery({
    queryKey: ["project", slug],
    queryFn: () => getProjectBySlug({ data: { slug } }),
  });

  if (isLoading) {
    return (
      <Shell>
        <p className="text-muted-foreground">Loading…</p>
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
      <Link to="/projects" className="font-mono text-xs text-muted-foreground hover:text-foreground">
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
              <a href={data.github_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                [GitHub]
              </a>
            )}
            {data.demo_url && (
              <a href={data.demo_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
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
          <div className="prose-portfolio mt-8 whitespace-pre-wrap text-sm">
            {data.long_description}
          </div>
        )}
      </article>
    </Shell>
  );
}
