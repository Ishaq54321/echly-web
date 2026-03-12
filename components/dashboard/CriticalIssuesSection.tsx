"use client";

import type { SessionWithCounts } from "@/app/(app)/dashboard/hooks/useWorkspaceOverview";
import type { AIExecutiveSummary } from "@/lib/domain/signal";

export interface CriticalIssuesSectionProps {
  /** From useCommandCenterData: summary.highImpactItems (session-level). */
  highImpactItems: AIExecutiveSummary["highImpactItems"];
  /** Session lookup for open count. */
  sessionsById: Map<string, SessionWithCounts>;
  onView: (sessionId: string) => void;
}

const MAX_CARDS = 6;

export function CriticalIssuesSection({
  highImpactItems,
  sessionsById,
  onView,
}: CriticalIssuesSectionProps) {
  const items = highImpactItems.slice(0, MAX_CARDS);
  if (items.length === 0) return null;

  return (
    <section
      className="mb-8 rounded-xl border border-[var(--layer-1-border)] bg-[var(--layer-1-bg)] py-5 px-5 shadow-[var(--shadow-level-1)]"
      aria-label="Critical Issues"
    >
      <h2 className="text-[16px] font-semibold leading-[1.35] tracking-[-0.01em] text-[hsl(var(--text-primary-strong))] mb-4">
        Critical Issues
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((item) => {
          const swc = sessionsById.get(item.sessionId);
          const open = swc
            ? swc.session.openCount ?? swc.counts.open
            : 0;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onView(item.sessionId)}
              className="dashboard-card text-left w-full hover:border-[var(--layer-2-hover-border)] focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1"
            >
              <div className="text-[14px] font-semibold leading-[1.4] text-[hsl(var(--text-primary-strong))] truncate">
                {item.title}
              </div>
              <div className="text-[12px] text-[hsl(var(--text-tertiary))] mt-1 tabular-nums">
                {open} open
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
