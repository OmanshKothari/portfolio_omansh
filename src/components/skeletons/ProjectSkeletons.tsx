import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton placeholder for a project card while loading.
 * Matches the layout of the actual ProjectCard component.
 */
export function ProjectCardSkeleton() {
  return (
    <div className="rounded-lg border border-border p-5">
      {/* Cover image skeleton */}
      <Skeleton className="mb-4 h-32 w-full rounded-md" />

      {/* Title skeleton */}
      <Skeleton className="h-5 w-3/4" />

      {/* Description skeleton */}
      <div className="mt-2 space-y-1">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>

      {/* Tags skeleton */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        <Skeleton className="h-5 w-12 rounded" />
        <Skeleton className="h-5 w-14 rounded" />
      </div>

      {/* Read more link skeleton */}
      <Skeleton className="mt-5 h-3 w-16" />
    </div>
  );
}

/**
 * Container for multiple project card skeletons in a grid.
 */
export function ProjectSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Compact stacked skeleton for the dashboard "Featured Projects" list
 * (small `p-4` cards, no cover image).
 */
export function FeaturedProjectsSkeleton({ count = 2 }: { count?: number }) {
  return (
    <ul className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="rounded-lg border border-border p-4">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="mt-2 h-3 w-full" />
          <Skeleton className="mt-1 h-3 w-4/5" />
          <div className="mt-3 flex gap-1.5">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        </li>
      ))}
    </ul>
  );
}
