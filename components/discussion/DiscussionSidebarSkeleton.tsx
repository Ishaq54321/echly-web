"use client";

import { SkeletonBase } from "@/components/ui/skeletons";

export function DiscussionSidebarSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-1.5" aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-2.5 rounded-lg px-3 py-2">
          <SkeletonBase className="h-4 w-4 shrink-0 rounded" />
          <SkeletonBase className="h-4 flex-1 max-w-[80%] rounded-md" />
        </div>
      ))}
    </div>
  );
}
