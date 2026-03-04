"use client";

import React from "react";
import type { SignalHeatmapBucket } from "@/lib/domain/signal";

export interface SignalHeatmapBlockProps {
  buckets: SignalHeatmapBucket[];
  /** Max count for normalizing bar width */
  maxCount?: number;
}

export function SignalHeatmapBlock({ buckets, maxCount: maxProp }: SignalHeatmapBlockProps) {
  const max = maxProp ?? Math.max(1, ...buckets.map((b) => b.count));

  return (
    <section
      className="border border-[var(--layer-1-border)] bg-white overflow-hidden"
      aria-label="Signal Heatmap"
    >
      <header className="px-4 py-3 border-b border-[var(--layer-1-border)] bg-[var(--structural-gray-ticket)]">
        <h2 className="text-[12px] font-medium uppercase tracking-wider text-[hsl(var(--text-primary-strong))]">
          Signal heatmap
        </h2>
      </header>
      <div className="p-4">
        {buckets.length === 0 ? (
          <p className="text-[13px] text-[hsl(var(--text-tertiary))]">
            No cluster data yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {buckets.slice(0, 12).map((b) => (
              <li key={b.label} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-[12px] text-[hsl(var(--text-secondary-soft))] truncate">
                  {b.label}
                </span>
                <div className="flex-1 min-w-0 h-2 rounded-full bg-[var(--layer-2-bg)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--accent-operational)] transition-all duration-200"
                    style={{ width: `${Math.round((b.count / max) * 100)}%` }}
                  />
                </div>
                <span className="w-8 text-right text-[11px] tabular-nums text-[hsl(var(--text-tertiary))]">
                  {b.count}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
