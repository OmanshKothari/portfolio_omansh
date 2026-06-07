import { createFileRoute } from "@tanstack/react-router";
import { Shell, PageHeader } from "@/components/portfolio/Shell";
import { useQuery } from "@tanstack/react-query";
import { listTimeline } from "@/lib/timeline.functions";
import type { TimelineItem as TimelineItemType } from "@/lib/portfolio-types";
import { TimelineSkeletonList } from "@/components/skeletons/TimelineSkeletons";
import { SITE_NAME } from "@/lib/site-config";

export const Route = createFileRoute("/timeline")({
  head: () => ({
    meta: [
      { title: `Career Timeline — ${SITE_NAME}` },
      { name: "description", content: "Roles, education, and key technical accomplishments." },
    ],
  }),
  component: TimelinePage,
});

function TimelinePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["timeline-all"],
    queryFn: () => listTimeline(),
  });

  return (
    <Shell>
      <PageHeader
        eyebrow="Career"
        title="Timeline"
        description="Roles and education, with the work I'm proudest of."
      />

      {isLoading ? (
        <TimelineSkeletonList count={3} />
      ) : data && data.length > 0 ? (
        <ul className="space-y-10">
          {data.map((item) => (
            <TimelineRow key={item.id} item={item} />
          ))}
        </ul>
      ) : (
        <div className="rounded-md border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          No timeline items yet.
        </div>
      )}
    </Shell>
  );
}

/** A single timeline entry: dates | rail+dot | company/role/bullets. */
function TimelineRow({ item }: { item: TimelineItemType }) {
  return (
    <li className="grid gap-1.5 md:grid-cols-[10rem_1.25rem_1fr] md:gap-x-4 md:gap-y-0">
      {/* Dates — above the content on mobile, right-aligned rail column on md+ */}
      <div className="font-mono text-xs leading-snug text-muted-foreground md:whitespace-nowrap md:pt-1 md:text-right">
        {item.dates}
      </div>

      {/* Vertical rail with a node dot — hidden on mobile (no room for it) */}
      <div className="relative hidden justify-center md:flex">
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border" aria-hidden />
        <div className="relative mt-2 h-2.5 w-2.5 rounded-full border border-border bg-background" />
      </div>

      {/* Content column */}
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground">{item.company}</div>
        <div className="font-mono text-xs text-muted-foreground">{item.role}</div>
        {item.points.length > 0 && (
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            {item.points.map((point, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}
