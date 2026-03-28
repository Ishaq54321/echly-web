"use client";

import { useMemo } from "react";
import type { SessionWithCounts } from "@/app/(app)/dashboard/hooks/useWorkspaceOverview";
import { formatLastActivity } from "./formatLastActivity";

export interface RecentlyActiveSectionProps {
  sessions: SessionWithCounts[];
  onView: (sessionId: string) => void;
}

const MAX_ITEMS = 5;

export function RecentlyActiveSection({ sessions, onView }: RecentlyActiveSectionProps) {
  const sorted = useMemo(() => {
    return [...sessions]
      .filter((s) => (s.counts?.total ?? 0) > 0)
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
      aria-label="Recently Active"
    >
      <h2 className="text-[16px] font-semibold leading-[1.35] tracking-[-0.01em] text-[hsl(var(--text-primary-strong))] mb-4">
        Recently Active
      </h2>
      <ul className="flex flex-col gap-0.5">
        {sorted.map(({ session, counts }) => {
          const open = counts?.open ?? 0;
          const total = counts?.total ?? 0;
          const pct =
            counts && total > 0 ? Math.round((counts.resolved / total) * 100) : 0;
          const last = formatLastActivity(session.updatedAt);
          const subParts = [
            `${open} open`,
            total > 0 ? `${pct}% done` : null,
          ].filter(Boolean) as string[];
          return (
            <li key={session.id}>
              <button
                type="button"
                onClick={() => onView(session.id)}
                className="w-full text-left px-3 py-2.5 rounded-lg bg-transparent hover:bg-[var(--layer-2-hover-bg)] transition-colors duration-150 ease-out focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-ring)] flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  {session.title?.trim() ? (
                    <div className="text-[14px] font-semibold leading-[1.4] text-[hsl(var(--text-primary-strong))] truncate">
                      {session.title}
                    </div>
                  ) : null}
                  {subParts.length > 0 ? (
                    <div className="text-[12px] text-[hsl(var(--text-tertiary))] mt-0.5 tabular-nums">
                      {subParts.join(" · ")}
                    </div>
                  ) : null}
                </div>
                {last ? (
                  <span className="text-[12px] text-[hsl(var(--text-tertiary))] shrink-0 tabular-nums">
                    {last}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
