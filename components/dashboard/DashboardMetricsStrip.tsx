"use client";

import React from "react";

export interface DashboardMetricsStripProps {
  open: number;
  inProgress?: number;
  blocked?: number;
  resolved: number;
  avgResolutionTime?: string;
  aiAccuracyPercent?: number;
}

function Metric({
  label,
  value,
  muted,
}: {
  label: string;
  value: string | number;
  muted?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--text-tertiary))]">
        {label}
      </span>
      <span
        className={`text-[18px] font-semibold tabular-nums tracking-[-0.02em] ${
          muted ? "text-[hsl(var(--text-tertiary))]" : "text-[hsl(var(--text-primary-strong))]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export function DashboardMetricsStrip({
  open,
  inProgress = 0,
  blocked = 0,
  resolved,
  avgResolutionTime = "—",
  aiAccuracyPercent,
}: DashboardMetricsStripProps) {
  return (
    <section
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 py-4 px-4 rounded-xl bg-white border border-[var(--layer-1-border)] shadow-[var(--elevation-1)]"
      aria-label="Workspace metrics"
    >
      <Metric label="Open" value={open} />
      <Metric label="In Progress" value={inProgress} />
      <Metric label="Blocked" value={blocked} />
      <Metric label="Resolved" value={resolved} />
      <Metric label="Avg resolution time" value={avgResolutionTime} muted />
      <Metric
        label="AI accuracy"
        value={aiAccuracyPercent != null ? `${aiAccuracyPercent}%` : "—"}
        muted
      />
    </section>
  );
}
