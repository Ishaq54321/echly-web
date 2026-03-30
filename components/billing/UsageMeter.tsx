"use client";

import { MinimalLoader } from "@/components/ui/MinimalLoader";
import { useWorkspace } from "@/lib/client/workspaceContext";
import { useWorkspaceUsageRealtime } from "@/lib/hooks/useWorkspaceUsageRealtime";
import { useBillingStore } from "@/lib/store/billingStore";

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
  const { isIdentityReady, workspaceId } = useWorkspace();
  const workspaceGateReady =
    isIdentityReady &&
    workspaceId != null &&
    workspaceId.trim() !== "";
  const { data: realtimeUsage, loading: realtimeLoading, error: realtimeError } =
    useWorkspaceUsageRealtime({
      enabled: workspaceGateReady,
    });
  const { maxSessions, plan: cachedPlan, isLoaded: isBillingLoaded } = useBillingStore();

  if (!workspaceGateReady || realtimeLoading || !isBillingLoaded) {
    return (
      <div
        className="flex min-h-[120px] items-center justify-center rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
        aria-busy="true"
        aria-live="polite"
      >
        <MinimalLoader compact label="Loading usage…" />
      </div>
    );
  }

  if (realtimeError || realtimeUsage == null) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-500">
        {realtimeError ? `Usage unavailable: ${realtimeError}` : "Usage unavailable"}
      </div>
    );
  }

  const plan = cachedPlan ?? realtimeUsage.plan;
  const planLabel = PLAN_LABEL[plan] ?? plan;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-neutral-900">Usage</span>
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{planLabel}</span>
      </div>
      <div className="space-y-3">
        <MeterRow
          label="Sessions used"
          used={realtimeUsage.sessionUsed}
          limit={maxSessions}
        />
      </div>
    </div>
  );
}
