"use client";

import React from "react";

/**
 * Insights — recurring patterns, risk, trends. Analytical, premium. No AI branding.
 */
export default function InsightsPage() {
  return (
    <div className="flex flex-1 min-h-0 flex-col w-full bg-[var(--canvas-base)] overflow-auto">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-6 space-y-8">
        <header>
          <h1 className="text-[22px] font-semibold leading-[1.25] tracking-[-0.02em] text-[hsl(var(--text-primary-strong))]">
            Insights
          </h1>
          <p className="mt-1 text-[13px] text-[hsl(var(--text-tertiary))]">
            Recurring patterns, risk predictions, and trend analysis.
          </p>
        </header>

        {/* Recurring patterns */}
        <section className="border border-[var(--layer-1-border)] bg-white overflow-hidden">
          <h2 className="px-4 py-3 border-b border-[var(--layer-1-border)] text-[12px] font-medium uppercase tracking-wider text-[hsl(var(--text-primary-strong))]">
            Recurring patterns
          </h2>
          <div className="p-4">
            <ul className="space-y-3 text-[13px] text-[hsl(var(--text-secondary-soft))]">
              <li className="pl-3 border-l-2 border-[var(--accent-operational-border)]">
                <span className="font-medium text-[hsl(var(--text-primary-strong))]">Login flow</span> — 3 sessions, 8 signals
              </li>
              <li className="pl-3 border-l-2 border-transparent">
                <span className="font-medium text-[hsl(var(--text-primary-strong))]">Checkout</span> — 2 sessions, 4 signals
              </li>
            </ul>
          </div>
        </section>

        {/* Cross-session overlap */}
        <section className="border border-[var(--layer-1-border)] bg-white overflow-hidden">
          <h2 className="px-4 py-3 border-b border-[var(--layer-1-border)] text-[12px] font-medium uppercase tracking-wider text-[hsl(var(--text-primary-strong))]">
            Cross-session overlap
          </h2>
          <div className="p-4">
            <p className="text-[13px] text-[hsl(var(--text-tertiary))]">
              No significant overlap detected across sessions.
            </p>
          </div>
        </section>

        {/* Escalation risk */}
        <section className="border border-[var(--layer-1-border)] bg-white overflow-hidden">
          <h2 className="px-4 py-3 border-b border-[var(--layer-1-border)] text-[12px] font-medium uppercase tracking-wider text-[hsl(var(--text-primary-strong))]">
            Escalation risk predictions
          </h2>
          <div className="p-4">
            <p className="text-[13px] text-[hsl(var(--text-tertiary))]">
              No high-risk signals. All open items within normal velocity.
            </p>
          </div>
        </section>

        {/* Delayed cluster warnings */}
        <section className="border border-[var(--layer-1-border)] bg-white overflow-hidden">
          <h2 className="px-4 py-3 border-b border-[var(--layer-1-border)] text-[12px] font-medium uppercase tracking-wider text-[hsl(var(--text-primary-strong))]">
            Delayed cluster warnings
          </h2>
          <div className="p-4">
            <p className="text-[13px] text-[hsl(var(--text-tertiary))]">
              No delayed clusters.
            </p>
          </div>
        </section>

        {/* Owner overload */}
        <section className="border border-[var(--layer-1-border)] bg-white overflow-hidden">
          <h2 className="px-4 py-3 border-b border-[var(--layer-1-border)] text-[12px] font-medium uppercase tracking-wider text-[hsl(var(--text-primary-strong))]">
            Owner load
          </h2>
          <div className="p-4">
            <p className="text-[13px] text-[hsl(var(--text-tertiary))]">
              Load balanced. No overload alerts.
            </p>
          </div>
        </section>

        {/* Trend graph placeholder */}
        <section className="border border-[var(--layer-1-border)] bg-white overflow-hidden">
          <h2 className="px-4 py-3 border-b border-[var(--layer-1-border)] text-[12px] font-medium uppercase tracking-wider text-[hsl(var(--text-primary-strong))]">
            Resolution trend
          </h2>
          <div className="p-8 flex items-center justify-center min-h-[200px] bg-[var(--structural-gray-ticket)]">
            <p className="text-[13px] text-[hsl(var(--text-tertiary))]">
              Trend graph — connect to backend time-series data.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
