import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Shell } from "@/components/portfolio/Shell";
import { useQuery } from "@tanstack/react-query";
import { getPostBySlug } from "@/lib/blog.functions";
import { GardenDetailSkeleton } from "@/components/skeletons/GardenSkeletons";

export const Route = createFileRoute("/garden/$slug")({
  head: () => ({ meta: [{ title: "Garden entry" }] }),
  component: GardenDetail,
});

function GardenDetail() {
  const { slug } = useParams({ from: "/garden/$slug" });
  const { data, isLoading } = useQuery({
    queryKey: ["garden", slug],
    queryFn: () => getPostBySlug({ data: { slug } }),
  });

  if (isLoading) {
    return (
      <Shell>
        <GardenDetailSkeleton />
      </Shell>
    );
  }
  if (!data) {
    return (
      <Shell>
        <p className="text-muted-foreground">Entry not found.</p>
        <Link to="/garden" className="text-primary hover:underline">
          ← all entries
        </Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <Link to="/garden" className="font-mono text-xs text-muted-foreground hover:text-foreground">
        ← garden
      </Link>
      <article className="mt-6">
        <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          [{data.topic}]
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{data.title}</h1>
        <time className="mt-2 block font-mono text-xs text-muted-foreground">
          {data.published_at.slice(0, 10)}
        </time>
        <p className="mt-4 text-muted-foreground">{data.excerpt}</p>
        <div
          className="prose-portfolio mt-8"
          dangerouslySetInnerHTML={{ __html: data.content_html }}
        />
      </article>
    </Shell>
  );
}
