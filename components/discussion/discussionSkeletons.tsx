"use client";

import { SkeletonBase } from "@/components/ui/skeletons";

function ListRowSkeleton() {
  return (
    <div className="flex gap-3 border-b border-neutral-200/80 px-3 py-3">
      <div className="w-1 shrink-0 rounded-full bg-neutral-200/60 self-stretch min-h-[48px]" aria-hidden />
      <div className="min-w-0 flex-1 space-y-2">
        <SkeletonBase className="h-4 w-[80%] max-w-[280px] rounded-md" />
        <SkeletonBase className="h-3 w-24 rounded-md" />
        <SkeletonBase className="h-3 w-full max-w-[320px] rounded-md" />
      </div>
    </div>
  );
}

export function DiscussionListSkeleton() {
  return (
    <div className="flex flex-col" aria-busy="true" aria-live="polite">
      {Array.from({ length: 8 }).map((_, i) => (
        <ListRowSkeleton key={i} />
      ))}
    </div>
  );
}

export function DiscussionFeedSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="w-full rounded-xl border border-neutral-200 bg-white p-4 text-left space-y-2"
        >
          <SkeletonBase className="h-4 w-[75%] max-w-[240px] rounded-md" />
          <SkeletonBase className="h-3 w-20 rounded-md" />
          <SkeletonBase className="h-3 w-full max-w-[280px] rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function DiscussionPanelBodySkeleton() {
  return (
    <div className="p-6 space-y-6" aria-busy="true" aria-live="polite">
      <div className="space-y-2">
        <SkeletonBase className="h-6 w-[80%] max-w-md rounded-md" />
        <SkeletonBase className="h-4 w-48 rounded-md" />
      </div>
      <div className="space-y-3">
        <SkeletonBase className="h-3 w-28 rounded-md" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <SkeletonBase className="h-8 w-8 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2 pt-0.5">
              <SkeletonBase className="h-3 w-24 rounded-md" />
              <SkeletonBase className="h-3 w-full rounded-md" />
              <SkeletonBase className="h-3 w-[92%] rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DiscussionThreadBodySkeleton() {
  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden bg-white" aria-busy="true" aria-live="polite">
      <div className="shrink-0 border-b border-neutral-200 px-4 py-4 space-y-2 max-w-[720px] w-full mx-auto">
        <SkeletonBase className="h-7 w-[60%] max-w-lg rounded-md" />
        <SkeletonBase className="h-4 w-40 rounded-md" />
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 px-4 py-6 max-w-[720px] w-full mx-auto space-y-6">
        <SkeletonBase className="h-48 w-full max-w-full rounded-xl" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <SkeletonBase className="h-8 w-8 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <SkeletonBase className="h-3 w-20 rounded-md" />
                <SkeletonBase className="h-3 w-full rounded-md" />
                <SkeletonBase className="h-3 w-[90%] rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TicketDetailsPanelSkeleton() {
  return (
    <div
      className="w-[320px] shrink-0 flex flex-col overflow-hidden border-r border-neutral-200 bg-white"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4">
        <SkeletonBase className="h-6 w-full max-w-[240px] rounded-md" />
        <SkeletonBase className="h-24 w-full rounded-xl" />
        <SkeletonBase className="h-3 w-full rounded-md" />
        <SkeletonBase className="h-3 w-[92%] rounded-md" />
      </div>
    </div>
  );
}
