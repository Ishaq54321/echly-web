"use client";

import { CanvasEmptyState } from "@/components/empty/CanvasEmptyState";
import { ArchivedEmptyIllu } from "@/components/empty/canvasIllustrations";

export function ArchiveEmptyState() {
  return (
    <div className="w-full pt-16 pb-12">
      <CanvasEmptyState
        illustration={<ArchivedEmptyIllu />}
        title="No archived sessions"
        description="Sessions you archive will appear here for reference."
      />
    </div>
  );
}
