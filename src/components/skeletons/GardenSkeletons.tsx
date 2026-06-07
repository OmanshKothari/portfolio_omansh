import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton placeholder for the digital-garden entry list (divide-y rows).
 * Matches the title + excerpt/meta + date layout used on the garden index
 * and the dashboard "Latest from the Garden" section.
 */
export function GardenListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <ul className="divide-y divide-border">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="py-3">
          <div className="flex items-baseline justify-between gap-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-16 shrink-0" />
          </div>
          <Skeleton className="mt-2 h-3 w-24" />
        </li>
      ))}
    </ul>
  );
}

/**
 * Skeleton placeholder for a digital-garden entry detail page.
 * Matches the layout of garden.$slug.tsx (back link, topic, title, date,
 * excerpt, long-form body).
 */
export function GardenDetailSkeleton() {
  return (
    <div>
      {/* Back link */}
      <Skeleton className="h-3 w-20" />

      <div className="mt-6">
        {/* Topic eyebrow */}
        <Skeleton className="h-3 w-24" />

        {/* Title */}
        <Skeleton className="mt-2 h-9 w-3/4" />

        {/* Date */}
        <Skeleton className="mt-2 h-3 w-28" />

        {/* Excerpt */}
        <Skeleton className="mt-4 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-5/6" />

        {/* Long-form body */}
        <div className="mt-8 space-y-2.5">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-11/12" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    </div>
  );
}
