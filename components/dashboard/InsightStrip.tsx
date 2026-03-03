"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/authFetch";

export interface DashboardMetrics {
  totalOpen: number;
  totalResolved: number;
  totalSessions: number;
  sessionsWithOpen: number;
}

function SkeletonItem() {
  return (
    <span className="inline-block h-3.5 w-10 rounded bg-neutral-100 animate-pulse" />
  );
}

export function InsightStrip() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    authFetch("/api/dashboard/metrics")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: DashboardMetrics | null) => {
        if (!cancelled && data) setMetrics(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <span
      className="flex flex-wrap items-center gap-x-5 gap-y-0 text-[12px]"
      aria-label="Dashboard metrics"
    >
      {loading ? (
        <>
          <span className="text-[hsl(var(--text-tertiary))]">Open</span>
          <SkeletonItem />
          <span className="text-[hsl(var(--text-tertiary))]">Resolved</span>
          <SkeletonItem />
          <span className="text-[hsl(var(--text-tertiary))]">Sessions</span>
          <SkeletonItem />
          <span className="text-[hsl(var(--text-tertiary))]">Active</span>
          <SkeletonItem />
        </>
      ) : metrics ? (
        <>
          <span className="text-[hsl(var(--text-tertiary))]">Open</span>
          <span className="text-[hsl(var(--text-secondary-soft))] tabular-nums font-medium">{metrics.totalOpen}</span>
          <span className="text-[hsl(var(--text-tertiary))]">Resolved</span>
          <span className="text-[hsl(var(--text-secondary-soft))] tabular-nums font-medium">{metrics.totalResolved}</span>
          <span className="text-[hsl(var(--text-tertiary))]">Sessions</span>
          <span className="text-[hsl(var(--text-secondary-soft))] tabular-nums font-medium">{metrics.totalSessions}</span>
          <span className="text-[hsl(var(--text-tertiary))]">Active</span>
          <span className="text-[hsl(var(--text-secondary-soft))] tabular-nums font-medium">{metrics.sessionsWithOpen}</span>
        </>
      ) : null}
    </span>
  );
}
