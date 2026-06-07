import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton placeholder for an admin table row while loading.
 */
export function TableRowSkeleton() {
  return (
    <li className="flex items-center justify-between gap-4 border-b border-border p-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <Skeleton className="mb-2 h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="flex items-center gap-1">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </li>
  );
}

/**
 * Container for multiple table row skeletons.
 */
export function TableSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <ul className="divide-y divide-border rounded-md border border-border">
      {Array.from({ length: count }).map((_, i) => (
        <TableRowSkeleton key={i} />
      ))}
    </ul>
  );
}
