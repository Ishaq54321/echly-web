"use client";

import { useMemo } from "react";
import type { SessionWithCounts } from "@/app/(app)/dashboard/hooks/useWorkspaceOverview";
import { formatLastActivity } from "./formatLastActivity";

export interface RecentFeedbackSectionProps {
  sessions: SessionWithCounts[];
  onView: (sessionId: string) => void;
}

const MAX_ITEMS = 5;

/**
 * Shows sessions with recent activity (by updatedAt) as a "Recent Feedback" list.
 * Without a cross-session recent-feedback API we show session title + open count + last activity.
 */
export function RecentFeedbackSection({ sessions, onView }: RecentFeedbackSectionProps) {
  const sorted = useMemo(() => {
    return [...sessions]
      .sort((a, b) => {
        const ta = a.session.updatedAt as { seconds?: number } | null | undefined;
        const tb = b.session.updatedAt as { seconds?: number } | null | undefined;
        return (tb?.seconds ?? 0) - (ta?.seconds ?? 0);
      })
      .slice(0, MAX_ITEMS);
  }, [sessions]);

  if (sorted.length === 0) return null;

  return (
    <section
      className="rounded-xl border border-[var(--layer-1-border)] bg-[var(--layer-1-bg)] py-5 px-5 shadow-[var(--shadow-level-1)]"
      aria-label="Recent Feedback"
    >
      <h2 className="text-[16px] font-semibold leading-[1.35] tracking-[-0.01em] text-[hsl(var(--text-primary-strong))] mb-4">
        Recent Feedback
      </h2>
      <ul className="flex flex-col gap-0.5">
        {sorted.map(({ session, counts }) => {
          const open = session.openCount ?? counts.open;
          return (
            <li key={session.id}>
              <button
                type="button"
                onClick={() => onView(session.id)}
                className="w-full text-left px-3 py-2.5 rounded-lg bg-transparent hover:bg-[var(--layer-2-hover-bg)] transition-colors duration-150 ease-out focus:outline-none focus:ring-1 focus:ring-gray-300 flex items-center justify-between gap-4"
              >
                <span className="text-[14px] font-semibold leading-[1.4] text-[hsl(var(--text-primary-strong))] truncate min-w-0">
                  {session.title || "Untitled Session"}
                </span>
                <span className="text-[12px] text-[hsl(var(--text-tertiary))] shrink-0 tabular-nums">
                  {open} open · {formatLastActivity(session.updatedAt)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
