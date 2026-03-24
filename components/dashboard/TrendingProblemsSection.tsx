"use client";

import type { SignalHeatmapBucket } from "@/lib/domain/signal";

export interface TrendingProblemsSectionProps {
  /** Sessions with the most feedback (heatmap-style ranking). */
  buckets: SignalHeatmapBucket[];
  onView: (sessionId: string) => void;
}

const MAX_ITEMS = 5;

export function TrendingProblemsSection({
  buckets,
  onView,
}: TrendingProblemsSectionProps) {
  const list = buckets.slice(0, MAX_ITEMS);
  if (list.length === 0) return null;

  return (
    <section
      className="mb-8 rounded-xl border border-[var(--layer-1-border)] bg-[var(--layer-1-bg)] py-5 px-5 shadow-[var(--shadow-level-1)]"
      aria-label="Trending Problems"
    >
      <h2 className="text-[16px] font-semibold leading-[1.35] tracking-[-0.01em] text-[hsl(var(--text-primary-strong))] mb-4">
        Trending Problems
      </h2>
      <ul className="flex flex-col gap-0.5">
        {list.map((b) => (
          <li key={b.sessionId ?? b.label}>
            <button
              type="button"
              onClick={() => b.sessionId && onView(b.sessionId)}
              className="w-full text-left px-3 py-2.5 rounded-lg bg-transparent hover:bg-[var(--layer-2-hover-bg)] transition-colors duration-150 ease-out focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-ring)] flex items-center justify-between gap-4"
            >
              <span className="text-[14px] font-semibold leading-[1.4] text-[hsl(var(--text-primary-strong))] truncate min-w-0">
                {b.label}
              </span>
              <span className="text-[12px] text-[hsl(var(--text-tertiary))] shrink-0 tabular-nums">
                {b.count} signals
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
