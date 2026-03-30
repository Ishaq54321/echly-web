"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authFetch } from "@/lib/authFetch";
import type { UsageStats } from "@/app/api/admin/usage/route";

export default function AdminPage() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    authFetch("/api/admin/usage")
      .then((res) => {
        if (!res || !res.ok) throw new Error("Failed to load usage");
        return res.json();
      })
      .then((envelope: { data?: UsageStats | null }) => {
        if (!cancelled) setStats(envelope.data ?? null);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
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
        <h1 className="text-2xl font-semibold text-neutral-900 mb-8">Dashboard</h1>
        <p className="text-sm text-neutral-500">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-8">Dashboard</h1>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  const cards = [
    {
      label: "Total Workspaces",
      value: stats?.totalWorkspaces ?? 0,
      href: null,
    },
    {
      label: "Free Workspaces",
      value: stats?.freeWorkspaces ?? 0,
      href: "/admin/customers?plan=free",
    },
    {
      label: "Paid Workspaces",
      value: stats?.paidWorkspaces ?? 0,
      href: "/admin/customers?plan=paid",
    },
    {
      label: "Total Sessions",
      value: stats?.totalSessions ?? 0,
      href: null,
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Dashboard</h1>
      <p className="text-sm text-neutral-600 mb-8">
        Platform usage at a glance.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const content = (
            <>
              <p className="text-sm font-medium text-neutral-500">{card.label}</p>
              <p className="text-2xl font-semibold text-neutral-900 mt-1">{card.value}</p>
            </>
          );
          const className =
            "rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-neutral-300 " +
            (card.href ? "cursor-pointer hover:bg-neutral-50/50" : "");
          if (card.href) {
            return (
              <Link key={card.label} href={card.href} className={className}>
                {content}
              </Link>
            );
          }
          return (
            <div key={card.label} className={className}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
