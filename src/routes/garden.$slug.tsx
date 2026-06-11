import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Shell } from "@/components/portfolio/Shell";
import { useQuery } from "@tanstack/react-query";
import { postQuery, siteSettingsQuery } from "@/lib/queries";
import { GardenDetailSkeleton } from "@/components/skeletons/GardenSkeletons";
import { SITE_NAME } from "@/lib/site-config";

export const Route = createFileRoute("/garden/$slug")({
  // Resolve on the server so SSR ships the article (not a skeleton) and the
  // head() below can use the real title for tabs and link unfurls.
  loader: async ({ params, context }) => {
    const [post] = await Promise.all([
      context.queryClient.ensureQueryData(postQuery(params.slug)),
      context.queryClient.ensureQueryData(siteSettingsQuery()),
    ]);
    return post;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — ${SITE_NAME}` },
          { name: "description", content: loaderData.excerpt },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.excerpt },
        ]
      : [{ title: `Garden — ${SITE_NAME}` }],
  }),
  component: GardenDetail,
});

function GardenDetail() {
  const { slug } = useParams({ from: "/garden/$slug" });
  const { data, isLoading } = useQuery(postQuery(slug));

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
