"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/authFetch";
import type { UsageStats } from "@/app/api/admin/usage/route";

export default function AdminUsagePage() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    authFetch("/api/admin/usage")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => {
        if (!cancelled) setStats(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-8">Usage</h1>
        <p className="text-sm text-neutral-500">Loading…</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-8">Usage</h1>
        <p className="text-sm text-red-600">Failed to load usage stats.</p>
      </div>
    );
  }

  const cards = [
    { label: "Total workspaces", value: stats.totalWorkspaces },
    { label: "Free users", value: stats.freeWorkspaces },
    { label: "Paid users", value: stats.paidWorkspaces },
    { label: "Total sessions", value: stats.totalSessions },
    { label: "Total feedback captured", value: stats.totalFeedbackCaptured },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Usage</h1>
      <p className="text-sm text-neutral-600 mb-8">
        Platform-wide usage. Charts optional.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-medium text-neutral-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-neutral-900">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
