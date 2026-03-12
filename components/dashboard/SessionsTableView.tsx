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
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export interface SessionsTableViewProps {
  items: SessionWithCounts[];
  onView: (sessionId: string) => void;
}

export function SessionsTableView({ items, onView }: SessionsTableViewProps) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border border-[var(--layer-1-border)] bg-white shadow-[var(--elevation-1)] overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[var(--layer-1-border)] bg-[var(--structural-gray-ticket)]">
            <th className="text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--text-tertiary))] px-4 py-3">
              Session
            </th>
            <th className="text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--text-tertiary))] px-4 py-3 w-20 text-right">
              Open
            </th>
            <th className="text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--text-tertiary))] px-4 py-3 w-20 text-right">
              Resolved
            </th>
            <th className="text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--text-tertiary))] px-4 py-3 w-24 text-right">
              Progress
            </th>
            <th className="text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--text-tertiary))] px-4 py-3">
              Last activity
            </th>
            <th className="w-24" />
          </tr>
        </thead>
        <tbody>
          {items.map(({ session, counts }) => {
            const open = session.openCount ?? counts.open;
            const resolved = session.resolvedCount ?? counts.resolved;
            const total = open + resolved;
            const progressPct = total > 0 ? Math.round((resolved / total) * 100) : 0;
            return (
              <tr
                key={session.id}
                className="border-b border-[var(--layer-1-border)] last:border-b-0 hover:bg-[#E9ECEB] transition-colors duration-120"
              >
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onView(session.id)}
                    className="text-[14px] font-medium text-[hsl(var(--text-primary-strong))] hover:text-[hsl(var(--text-primary-strong))] focus:outline-none focus-visible:ring-1 focus-visible:ring-gray-300 rounded"
                  >
                    {session.title || "Untitled Session"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right text-[13px] tabular-nums text-[hsl(var(--text-secondary-soft))]">
                  {open}
                </td>
                <td className="px-4 py-3 text-right text-[13px] tabular-nums text-[hsl(var(--text-secondary-soft))]">
                  {resolved}
                </td>
                <td className="px-4 py-3 text-right text-[13px] tabular-nums text-[hsl(var(--text-secondary-soft))]">
                  {progressPct}%
                </td>
                <td className="px-4 py-3 text-[13px] text-[hsl(var(--text-tertiary))]">
                  {formatLastActivity(session.updatedAt)}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onView(session.id)}
                    className="text-[12px] font-medium text-[hsl(var(--text-secondary-soft))] hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-gray-300 rounded"
                  >
                    Open
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
