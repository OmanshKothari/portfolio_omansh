import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Shell } from "@/components/portfolio/Shell";
import { useQuery } from "@tanstack/react-query";
import { postQuery, siteSettingsQuery } from "@/lib/queries";
import { GardenDetailSkeleton } from "@/components/skeletons/GardenSkeletons";
import { SITE_NAME } from "@/lib/site-config";
import { slugify } from "@/lib/portfolio-types";

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

/** Words-per-minute estimate from the rendered HTML, floored at 1 minute. */
function readingTimeMinutes(html: string): number {
  const words = html
    .replace(/<[^>]+>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

type TocEntry = { id: string; text: string; level: 2 | 3 };

function GardenDetail() {
  const { slug } = useParams({ from: "/garden/$slug" });
  const { data, isLoading } = useQuery(postQuery(slug));
  const articleRef = useRef<HTMLDivElement>(null);
  const [toc, setToc] = useState<TocEntry[]>([]);

  // Post-render enhancement of the raw article HTML: assign heading ids and
  // build the table of contents, then syntax-highlight code blocks. hljs is
  // imported lazily so it never weighs down routes without code.
  useEffect(() => {
    const el = articleRef.current;
    if (!el || !data) return;

    const seen = new Map<string, number>();
    const entries = Array.from(el.querySelectorAll<HTMLElement>("h1, h2, h3")).map((h) => {
      let id = slugify(h.textContent ?? "") || "section";
      const n = (seen.get(id) ?? 0) + 1;
      seen.set(id, n);
      if (n > 1) id = `${id}-${n}`;
      h.id = id;
      return {
        id,
        text: h.textContent ?? "",
        level: h.tagName === "H3" ? (3 as const) : (2 as const),
      };
    });
    setToc(entries.length >= 3 ? entries : []);

    let cancelled = false;
    if (el.querySelector("pre code")) {
      import("highlight.js/lib/common").then(({ default: hljs }) => {
        if (cancelled) return;
        el.querySelectorAll<HTMLElement>("pre code").forEach((block) => {
          hljs.highlightElement(block);
        });
      });
    }
    return () => {
      cancelled = true;
    };
  }, [data]);

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
        <div className="font-mono text-xs uppercase tracking-wider text-primary">
          [{data.topic}]
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{data.title}</h1>
        <div className="mt-2 flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <time>{data.published_at.slice(0, 10)}</time>
          <span aria-hidden>·</span>
          <span>{readingTimeMinutes(data.content_html)} min read</span>
        </div>
        <p className="mt-4 max-w-[70ch] text-muted-foreground">{data.excerpt}</p>

        {toc.length > 0 && (
          <nav
            aria-label="Table of contents"
            className="mt-8 max-w-[70ch] rounded-xl border border-border bg-muted/40 p-5"
          >
            <div className="mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              On this page
            </div>
            <ul className="space-y-1.5 text-sm">
              {toc.map((h) => (
                <li key={h.id} className={h.level === 3 ? "pl-4" : ""}>
                  <a href={`#${h.id}`} className="text-muted-foreground hover:text-primary">
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div
          ref={articleRef}
          className="prose-portfolio mt-8 max-w-[70ch]"
          dangerouslySetInnerHTML={{ __html: data.content_html }}
        />
      </article>
    </Shell>
  );
}
