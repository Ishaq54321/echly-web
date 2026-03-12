"use client";

import React from "react";
import type { PriorityRadarGroup } from "@/lib/domain/signal";

export interface PriorityRadarBlockProps {
  groups: PriorityRadarGroup[];
  onSelectSignal?: (id: string, sessionId: string) => void;
}

const BUCKET_STYLES: Record<string, string> = {
  Critical: "border-red-200 bg-red-50/50",
  "At Risk": "border-amber-200 bg-amber-50/50",
  Stalled: "border-[hsl(var(--text-tertiary))]/30 bg-[var(--layer-2-bg)]",
  Trending: "border-[var(--accent-operational-border)] bg-[var(--accent-operational-muted)]",
};

export function PriorityRadarBlock({ groups, onSelectSignal }: PriorityRadarBlockProps) {
  return (
    <section
      className="border border-[var(--layer-1-border)] bg-white overflow-hidden"
      aria-label="Priority Radar"
    >
      <header className="px-4 py-3 border-b border-[var(--layer-1-border)] bg-[var(--structural-gray-ticket)]">
        <h2 className="text-[12px] font-medium uppercase tracking-wider text-[hsl(var(--text-primary-strong))]">
          Priority Radar
        </h2>
      </header>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {groups.map((group) => (
          <div
            key={group.bucket}
            className={`rounded-lg border p-3 min-h-[80px] ${BUCKET_STYLES[group.bucket] ?? "border-[var(--layer-2-border)] bg-[var(--layer-2-bg)]"}`}
          >
            <h3 className="text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--text-tertiary))] mb-2">
              {group.bucket}
            </h3>
            <ul className="space-y-1">
              {group.signals.slice(0, 3).map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => onSelectSignal?.(s.id, s.sessionId)}
                    className="w-full text-left text-[12px] text-[hsl(var(--text-primary-strong))] truncate hover:text-[var(--accent-operational)] focus:outline-none focus-visible:ring-1 focus-visible:ring-gray-300 rounded"
                  >
                    {s.title}
                  </button>
                </li>
              ))}
              {group.signals.length > 3 && (
                <li className="text-[11px] text-[hsl(var(--text-tertiary))]">
                  +{group.signals.length - 3} more
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
