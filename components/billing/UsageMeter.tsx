"use client";

import { useBillingUsageContext } from "@/lib/billing/BillingUsageProvider";

export type { BillingUsageData as BillingUsage } from "@/lib/hooks/useBillingUsage";

const PLAN_LABEL: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  business: "Business",
  enterprise: "Enterprise",
};

/** Threshold (0–1) above which we show a warning. */
const WARNING_THRESHOLD = 0.85;

function MeterRow({
  label,
  used,
  limit,
  unlimitedLabel = "Unlimited",
}: {
  label: string;
  used: number;
  limit: number | null;
  unlimitedLabel?: string;
}) {
  const atLimit = limit != null && used >= limit;
  const nearLimit = limit != null && limit > 0 && used >= limit * WARNING_THRESHOLD && !atLimit;
  const displayLimit = limit == null ? unlimitedLabel : limit;
  const showWarning = atLimit || nearLimit;

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-neutral-600">{label}</span>
        <span className={`tabular-nums font-medium ${showWarning ? "text-amber-600" : "text-neutral-900"}`}>
          {limit == null ? `${used}` : `${used} / ${limit}`}
        </span>
      </div>
      {limit != null && limit > 0 && (
        <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(100, (used / limit) * 100)}%`,
              backgroundColor: atLimit ? "#dc2626" : nearLimit ? "#d97706" : "#155DFC",
            }}
          />
        </div>
      )}
    </div>
  );
}

export function UsageMeter() {
  const { data, loading, error } = useBillingUsageContext();

  if (loading) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="h-4 w-24 rounded bg-neutral-100 animate-pulse mb-3" />
        <div className="space-y-3">
          <div className="h-8 rounded bg-neutral-50 animate-pulse" />
          <div className="h-8 rounded bg-neutral-50 animate-pulse" />
          <div className="h-8 rounded bg-neutral-50 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-500">
        {error ? `Usage unavailable: ${error}` : "Usage unavailable"}
      </div>
    );
  }

  const planLabel = PLAN_LABEL[data.plan] ?? data.plan;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-neutral-900">Usage</span>
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{planLabel}</span>
      </div>
      <div className="space-y-3">
        <MeterRow
          label="Sessions used"
          used={data.usage.activeSessions ?? 0}
          limit={data.limits.maxSessions}
        />
        <MeterRow
          label="Members"
          used={data.usage.members ?? 0}
          limit={data.limits.maxMembers}
        />
      </div>
    </div>
  );
}
