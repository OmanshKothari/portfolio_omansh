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
