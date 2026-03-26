"use client";

import { Archive } from "lucide-react";
import { EmptyState } from "@/components/empty/EmptyState";

export function ArchiveEmptyState() {
  return (
    <EmptyState
      density="compact"
      icon={Archive}
      iconClassName="h-16 w-16 text-neutral-400"
      emphasis="muted"
      title="Nothing to see here"
      description="Archived sessions will appear here once you archive them."
    />
  );
}
