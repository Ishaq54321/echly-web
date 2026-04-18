"use client";

export function DiscussionSidebarHeading({
  filteredThreadCount,
  openThreadCount,
  statsLoading,
}: {
  filteredThreadCount: number;
  openThreadCount: number;
  statsLoading: boolean;
}) {
  return (
    <div className="px-4 pt-4 pb-3 shrink-0 border-b border-neutral-100">
      <h2 className="text-sm font-semibold text-discussion-title leading-tight">
        Discussions
      </h2>
      <p className="text-[12px] text-meta mt-1 tabular-nums leading-snug">
        {statsLoading
          ? "Loading…"
          : `${filteredThreadCount} thread${filteredThreadCount !== 1 ? "s" : ""} · ${openThreadCount} open`}
      </p>
    </div>
  );
}
