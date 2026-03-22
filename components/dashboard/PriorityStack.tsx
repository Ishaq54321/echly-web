"use client";

import React from "react";
import type { SessionWithCounts } from "@/app/(app)/dashboard/hooks/useWorkspaceOverview";

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
    return `${Math.floor(diffHours)}h ago`;
  }
  if (diffDays < 7) return d.toLocaleDateString(undefined, { weekday: "short" });
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export interface PriorityStackProps {
  items: SessionWithCounts[];
  onView: (sessionId: string) => void;
}

export function PriorityStack({ items, onView }: PriorityStackProps) {
  if (items.length === 0) return null;

  return (
    <section
      className="rounded-xl border border-[var(--layer-1-border)] bg-white shadow-[var(--elevation-1)] overflow-hidden"
      aria-label="Needs attention"
    >
      <h2 className="text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--text-tertiary))] px-4 py-3 border-b border-[var(--layer-1-border)]">
        Priority stack — needs attention
      </h2>
      <ul className="divide-y divide-[var(--layer-1-border)]">
        {items.map(({ session, counts }) => {
          const open = counts.open;
          const resolved = counts.resolved;
          const total = counts.total;
          const progressPct = total > 0 ? Math.round((resolved / total) * 100) : 0;
          const urgency = open > 5 ? "High" : open > 2 ? "Medium" : "Low";

          return (
            <li key={session.id}>
              <button
                type="button"
                onClick={() => onView(session.id)}
                className="w-full text-left px-4 py-3 flex items-center gap-4 hover:bg-[var(--structural-gray-ticket)] transition-colors duration-120 focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-operational)] focus-visible:ring-inset"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-medium text-[hsl(var(--text-primary-strong))] truncate">
                      {session.title || "Untitled Session"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 min-w-0 max-w-[160px] h-1.5 rounded-full bg-[var(--layer-2-bg)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--accent-operational)] transition-all duration-200"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-[hsl(var(--text-tertiary))] tabular-nums">
                      {progressPct}%
                    </span>
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-0.5">
                  <span
                    className={`text-[11px] font-medium uppercase ${
                      urgency === "High"
                        ? "text-red-600"
                        : urgency === "Medium"
                          ? "text-amber-600"
                          : "text-[hsl(var(--text-tertiary))]"
                    }`}
                  >
                    {urgency}
                  </span>
                  <span className="text-[11px] text-[hsl(var(--text-tertiary))] tabular-nums">
                    {formatLastActivity(session.updatedAt)}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
