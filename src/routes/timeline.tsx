import { createFileRoute } from "@tanstack/react-router";
import { Shell, PageHeader } from "@/components/portfolio/Shell";
import { useQuery } from "@tanstack/react-query";
import { listTimeline } from "@/lib/timeline.functions";
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
        <p className="text-muted-foreground">Loading…</p>
      ) : data && data.length > 0 ? (
        <ul className="space-y-10">
          {data.map((item) => (
            <li
              key={item.id}
              className="grid grid-cols-[7rem_1.25rem_1fr] gap-x-4"
            >
              {/* Dates column */}
              <div className="pt-1 text-right font-mono text-xs leading-snug text-muted-foreground">
                {item.dates}
              </div>
              {/* Rail + dot column */}
              <div className="relative flex justify-center">
                <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border" aria-hidden />
                <div className="relative mt-2 h-2.5 w-2.5 rounded-full border border-border bg-background" />
              </div>
              {/* Content column */}
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">{item.company}</div>
                <div className="font-mono text-xs text-muted-foreground">{item.role}</div>
                {item.points.length > 0 && (
                  <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                    {item.points.map((p, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
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
