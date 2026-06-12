import { createFileRoute } from "@tanstack/react-router";
import { Shell, PageHeader } from "@/components/portfolio/Shell";
import { useQuery } from "@tanstack/react-query";
import { timelineQuery, siteSettingsQuery } from "@/lib/queries";
import type { TimelineItem as TimelineItemType } from "@/lib/portfolio-types";
import { TimelineSkeletonList } from "@/components/skeletons/TimelineSkeletons";
import { SITE_NAME } from "@/lib/site-config";

export const Route = createFileRoute("/timeline")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(timelineQuery()),
      context.queryClient.ensureQueryData(siteSettingsQuery()),
    ]),
  head: () => ({
    meta: [
      { title: `Career Timeline — ${SITE_NAME}` },
      { name: "description", content: "Roles, education, and key technical accomplishments." },
    ],
  }),
  component: TimelinePage,
});

type CompanyGroup = { company: string; roles: TimelineItemType[] };

/**
 * Collapse consecutive entries at the same company into one group so a
 * promotion track reads as a single tenure with several roles, not three
 * unrelated jobs. Only adjacent entries merge — a return to a previous
 * employer stays a separate chapter.
 */
function groupByCompany(items: TimelineItemType[]): CompanyGroup[] {
  const groups: CompanyGroup[] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.company === item.company) last.roles.push(item);
    else groups.push({ company: item.company, roles: [item] });
  }
  return groups;
}

function TimelinePage() {
  const { data, isLoading } = useQuery(timelineQuery());

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
        <div className="space-y-14">
          {groupByCompany(data).map((group, i) => (
            <CompanySection key={`${group.company}-${i}`} group={group} />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          No timeline items yet.
        </div>
      )}
    </Shell>
  );
}

/** One employer: company header, then a railed list of roles held there. */
function CompanySection({ group }: { group: CompanyGroup }) {
  return (
    <section>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{group.company}</h2>
        {group.roles.length > 1 && (
          <span className="font-mono text-xs text-muted-foreground">
            {group.roles.length} roles
          </span>
        )}
      </div>

      <ol className="relative mt-5 space-y-10">
        {/* Continuous rail connecting the role nodes. */}
        <span aria-hidden className="absolute inset-y-1 left-1.25 w-px bg-border" />
        {group.roles.map((role) => (
          <RoleEntry key={role.id} role={role} />
        ))}
      </ol>
    </section>
  );
}

/** A single role on the rail. The current role (dates ending in "Present") gets a filled accent node. */
function RoleEntry({ role }: { role: TimelineItemType }) {
  const isCurrent = /present/i.test(role.dates);
  return (
    <li className="relative pl-8">
      <span
        aria-hidden
        className={
          "absolute left-0 top-1 h-2.75 w-2.75 rounded-full border-2 " +
          (isCurrent ? "border-primary bg-primary" : "border-primary/50 bg-background")
        }
      />
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <h3 className="text-sm font-medium text-foreground">{role.role}</h3>
        <span className="font-mono text-xs text-muted-foreground">{role.dates}</span>
        {isCurrent && (
          <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
            Current
          </span>
        )}
      </div>
      {role.points.length > 0 && (
        <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          {role.points.map((point, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
