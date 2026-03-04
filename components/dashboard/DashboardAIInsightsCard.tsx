"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export function DashboardAIInsightsCard() {
  return (
    <section
      className="rounded-xl border border-[var(--layer-1-border)] bg-white shadow-[var(--elevation-1)] p-4"
      aria-label="AI insights"
    >
      <h2 className="flex items-center gap-2 text-[12px] font-medium text-[hsl(var(--text-primary-strong))] mb-3">
        <Sparkles className="h-4 w-4 text-[var(--accent-operational)]" strokeWidth={1.5} />
        AI insights
      </h2>
      <ul className="space-y-3 text-[13px]">
        <li className="pl-3 border-l-2 border-[var(--accent-operational-border)] text-[hsl(var(--text-secondary-soft))]">
          <span className="font-medium text-[hsl(var(--text-primary-strong))]">Most recurring:</span>{" "}
          Login flow feedback (3 sessions)
        </li>
        <li className="pl-3 border-l-2 border-transparent text-[hsl(var(--text-secondary-soft))]">
          <span className="font-medium text-[hsl(var(--text-primary-strong))]">Bottleneck:</span>{" "}
          Session &quot;Q1 Review&quot; has 8 open items
        </li>
        <li className="pl-3 border-l-2 border-transparent text-[hsl(var(--text-secondary-soft))]">
          <span className="font-medium text-[hsl(var(--text-primary-strong))]">Delay prediction:</span>{" "}
          No at-risk sessions
        </li>
      </ul>
    </section>
  );
}
