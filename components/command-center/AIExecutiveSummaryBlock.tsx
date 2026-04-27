"use client";

import React from "react";
import { Sparkles, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { AIExecutiveSummary as Summary, MomentumDirection } from "@/lib/domain/signal";

export interface AIExecutiveSummaryBlockProps {
  summary: Summary;
  onSelectSignal?: (id: string, sessionId: string) => void;
}

function MomentumIndicator({ direction }: { direction: MomentumDirection }) {
  const config = {
    improving: { icon: TrendingUp, label: "Improving", className: "text-[var(--color-success)]" },
    stable: { icon: Minus, label: "Stable", className: "text-[var(--text-secondary)]" },
    slowing: { icon: TrendingDown, label: "Slowing", className: "text-[var(--color-warning)]" },
  };
  const { icon: Icon, label, className } = config[direction];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${className}`}>
      <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
      {label}
    </span>
  );
}

export function AIExecutiveSummaryBlock({ summary, onSelectSignal }: AIExecutiveSummaryBlockProps) {
  return (
    <section
      className="border border-[var(--layer-1-border)] bg-white overflow-hidden"
      aria-label="AI Executive Summary"
    >
      <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--layer-1-border)] bg-[var(--structural-gray-ticket)]">
        <h2 className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-wider text-[var(--text-primary-strong)]">
          <Sparkles className="h-4 w-4 text-[var(--accent-operational)]" strokeWidth={1.5} />
          AI Executive Summary
        </h2>
        <MomentumIndicator direction={summary.momentum} />
      </header>
      <div className="p-4 space-y-4">
        {summary.highImpactItems.length > 0 && (
          <div>
            <h3 className="text-[12px] font-medium uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
              High impact (3)
            </h3>
            <ul className="space-y-1">
              {summary.highImpactItems.slice(0, 3).map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelectSignal?.(item.id, item.sessionId)}
                    className="w-full text-left text-[14px] text-[var(--text-primary-strong)] hover:text-[var(--accent-operational)] focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-operational)] rounded px-2 py-1 -mx-2 -my-1"
                  >
                    <span className="tabular-nums text-[var(--text-tertiary)] mr-2">
                      {item.impactScore}
                    </span>
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {summary.riskAlerts.length > 0 && (
          <div>
            <h3 className="text-[12px] font-medium uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
              Risk alerts (2)
            </h3>
            <ul className="space-y-1">
              {summary.riskAlerts.slice(0, 2).map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelectSignal?.(item.id, item.sessionId)}
                    className="w-full text-left text-[14px] text-[var(--text-primary-strong)] hover:text-[var(--accent-operational)] focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-operational)] rounded px-2 py-1 -mx-2 -my-1"
                  >
                    <span className="text-[var(--color-danger)] font-medium text-[12px] uppercase mr-2">
                      {String(item.riskLevel).replace(/^./, (c) => c.toUpperCase())}
                    </span>
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {summary.emergingPattern && (
          <div>
            <h3 className="text-[12px] font-medium uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
              Emerging pattern
            </h3>
            <p className="text-[14px] text-[var(--text-secondary-soft)]">
              {summary.emergingPattern}
            </p>
          </div>
        )}
        {summary.bottleneck && (
          <div>
            <h3 className="text-[12px] font-medium uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
              Bottleneck
            </h3>
            <p className="text-[14px] text-[var(--text-secondary-soft)]">
              {summary.bottleneck}
            </p>
          </div>
        )}
        {summary.highImpactItems.length === 0 &&
          summary.riskAlerts.length === 0 &&
          !summary.emergingPattern &&
          !summary.bottleneck && (
            <p className="text-[14px] text-[var(--text-tertiary)]">
              No signals yet. Open a session to start.
            </p>
          )}
      </div>
    </section>
  );
}
