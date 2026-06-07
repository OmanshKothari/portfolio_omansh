import { Skeleton } from "@/components/ui/skeleton";

/** A single labelled-field placeholder: mono label + input. */
function FieldSkeleton({ inputClass = "h-9" }: { inputClass?: string }) {
  return (
    <div>
      <Skeleton className="mb-1.5 h-3 w-28" />
      <Skeleton className={"w-full rounded-md " + inputClass} />
    </div>
  );
}

/**
 * Skeleton for the admin edit forms (project / garden entry).
 * Mirrors the PageHeader + `space-y-5` field stack with a tall rich-editor block,
 * so the form area doesn't pop in from a blank "Loading…" line.
 */
export function EditFormSkeleton() {
  return (
    <div>
      {/* PageHeader (eyebrow + title) */}
      <div className="mb-12">
        <Skeleton className="mb-2 h-3 w-16" />
        <Skeleton className="h-8 w-56" />
      </div>

      {/* Form fields */}
      <div className="space-y-5">
        <FieldSkeleton />
        <FieldSkeleton />
        <FieldSkeleton inputClass="h-16" />

        {/* Rich-editor block */}
        <div>
          <Skeleton className="mb-1.5 h-3 w-44" />
          <Skeleton className="h-48 w-full rounded-md" />
        </div>

        <FieldSkeleton />

        {/* Submit button */}
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>
    </div>
  );
}
