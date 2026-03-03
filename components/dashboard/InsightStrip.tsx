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
      className="flex flex-wrap items-center gap-x-4 gap-y-0 text-[12px]"
      aria-label="Dashboard metrics"
    >
      {loading ? (
        <>
          <span className="text-neutral-400">Open</span>
          <SkeletonItem />
          <span className="text-neutral-400">Resolved</span>
          <SkeletonItem />
          <span className="text-neutral-400">Sessions</span>
          <SkeletonItem />
          <span className="text-neutral-400">Active</span>
          <SkeletonItem />
        </>
      ) : metrics ? (
        <>
          <span className="text-neutral-400">Open</span>
          <span className="text-neutral-700 tabular-nums">{metrics.totalOpen}</span>
          <span className="text-neutral-400">Resolved</span>
          <span className="text-neutral-700 tabular-nums">{metrics.totalResolved}</span>
          <span className="text-neutral-400">Sessions</span>
          <span className="text-neutral-700 tabular-nums">{metrics.totalSessions}</span>
          <span className="text-neutral-400">Active</span>
          <span className="text-neutral-700 tabular-nums">{metrics.sessionsWithOpen}</span>
        </>
      ) : null}
    </span>
  );
}
