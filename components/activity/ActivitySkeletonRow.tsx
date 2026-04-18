"use client";

/**
 * Calm placeholder rows — same geometry as {@link ActivityItem}, neutral only, no loader chrome.
 */

export function ActivitySkeletonRow() {
  return (
    <div
      className="activity-skeleton-row flex w-full gap-3 py-3 min-h-[4.5rem] items-start"
      aria-hidden
    >
      <div className="relative z-10 flex w-[52px] shrink-0 justify-center pt-0.5">
        <div className="h-9 w-9 shrink-0 rounded-full bg-muted" />
      </div>

      <div className="min-w-0 flex-1 space-y-2.5 pt-0.5">
        <div className="flex w-full min-w-0 items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="h-3.5 w-[60%] max-w-md rounded-sm bg-muted-foreground/15" />
            <div className="h-3 w-[80%] max-w-lg rounded-sm bg-muted-foreground/12" />
          </div>
          <div className="h-3 w-12 shrink-0 rounded-sm bg-muted-foreground/10" />
        </div>
        <div className="h-3 w-[40%] max-w-xs rounded-sm bg-muted-foreground/[0.11]" />
      </div>
    </div>
  );
}

export function ActivitySkeletonStack({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col" role="presentation">
      {Array.from({ length: count }, (_, i) => (
        <ActivitySkeletonRow key={i} />
      ))}
    </div>
  );
}
