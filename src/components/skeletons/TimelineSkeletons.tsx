import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton placeholder for a timeline item while loading.
 * Matches the layout of the actual TimelineItem component.
 */
export function TimelineItemSkeleton() {
  return (
    <li className="grid grid-cols-[10rem_1.25rem_1fr] gap-x-4">
      {/* Dates column skeleton */}
      <div className="pt-1">
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Rail + dot column skeleton */}
      <div className="relative flex justify-center">
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border" aria-hidden />
        <div className="relative mt-2 h-2.5 w-2.5 rounded-full border border-border bg-background" />
      </div>

      {/* Content column skeleton */}
      <div className="space-y-2.5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-24" />

        {/* Simulate bullet points */}
        <div className="mt-3 space-y-1.5">
          <div className="flex gap-2">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
            <Skeleton className="h-3 flex-1" />
          </div>
          <div className="flex gap-2">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
            <Skeleton className="h-3 flex-1" />
          </div>
        </div>
      </div>
    </li>
  );
}

/**
 * Container for multiple timeline skeleton items.
 */
export function TimelineSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <ul className="space-y-10">
      {Array.from({ length: count }).map((_, i) => (
        <TimelineItemSkeleton key={i} />
      ))}
    </ul>
  );
}

/**
 * Compact card skeleton for the dashboard "Career Highlights" section
 * (bordered cards: dates, company · role, a couple of bullets).
 */
export function HighlightsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <ul className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="rounded-xl border border-border p-5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-2 h-4 w-1/2" />
          <div className="mt-3 space-y-1.5">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </li>
      ))}
    </ul>
  );
}
