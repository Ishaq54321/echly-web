"use client";

import type { SessionWithCounts } from "@/app/(app)/dashboard/hooks/useWorkspaceOverview";

export interface NeedsAttentionSectionProps {
  items: SessionWithCounts[];
  onView: (sessionId: string) => void;
}

/** Relative date: within 24h → "2h ago"; within 7 days → "Mon"; else "Mar 2". */
function formatLastActivity(updatedAt: unknown): string {
  if (updatedAt == null) return "—";
  const sec =
    typeof (updatedAt as { seconds?: number }).seconds === "number"
      ? (updatedAt as { seconds: number }).seconds
      : null;
  if (sec == null) return "—";
  const d = new Date(sec * 1000);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffHours < 24) {
    if (diffHours < 1) {
      const mins = Math.max(0, Math.floor(diffMs / (1000 * 60)));
      return mins <= 1 ? "Just now" : `${mins}m ago`;
    }
    const hours = Math.floor(diffHours);
    return `${hours}h ago`;
  }
  if (diffDays < 7) {
    return d.toLocaleDateString(undefined, { weekday: "short" });
  }
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function NeedsAttentionSection({
  items,
  onView,
}: NeedsAttentionSectionProps) {
  if (items.length === 0) return null;

  return (
    <section
      className="mb-6 rounded-md bg-white border-t border-neutral-200 pt-5 pb-5 px-4"
      aria-label="Needs Attention"
    >
      <h2 className="text-[13px] font-medium text-neutral-600 mb-3">
        Needs Attention
      </h2>
      <ul className="flex flex-col gap-2">
        {items.map(({ session, counts }) => {
          const open = session.openCount ?? counts.open;
          const resolved = session.resolvedCount ?? counts.resolved;
          const total = open + resolved;
          const completionPct = total > 0 ? Math.round((resolved / total) * 100) : 0;
          return (
            <li key={session.id}>
              <button
                type="button"
                onClick={() => onView(session.id)}
                className="w-full text-left px-3 py-2 rounded-md bg-transparent hover:bg-neutral-100 transition-colors duration-120 focus:outline-none focus:ring-1 focus:ring-neutral-300 flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-neutral-900 truncate">
                    {session.title || "Untitled Session"}
                  </div>
                  <div className="text-[12px] text-neutral-500 mt-0.5 tabular-nums">
                    {open} open · {completionPct}% done
                  </div>
                </div>
                <span className="text-[11px] text-neutral-400 shrink-0 tabular-nums">
                  {formatLastActivity(session.updatedAt)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
