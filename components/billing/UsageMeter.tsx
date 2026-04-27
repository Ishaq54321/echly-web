"use client";

import { MinimalLoader } from "@/components/ui/MinimalLoader";
import { useWorkspace } from "@/lib/client/workspaceContext";
import { useWorkspaceUsageRealtime } from "@/lib/hooks/useWorkspaceUsageRealtime";
import { useBillingStore } from "@/lib/store/billingStore";

export type { BillingUsageData as BillingUsage } from "@/lib/hooks/useBillingUsage";

const PLAN_LABEL: Record<string, string> = {
  starter: "Starter",
  business: "Business",
  enterprise: "Enterprise",
};

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
  const showWarning = atLimit || nearLimit;

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-[var(--text-secondary)]">{label}</span>
        <span
          className={`tabular-nums font-medium ${showWarning ? "text-amber-600" : "text-[var(--text-heading)]"}`}
        >
          {limit == null ? `${used} used` : `${used} / ${limit}`}
        </span>
      </div>
      {limit != null && limit > 0 && (
        <div className="h-1.5 w-full rounded-full bg-[var(--surface-hover)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(100, (used / limit) * 100)}%`,
              backgroundColor: atLimit ? "#dc2626" : nearLimit ? "#d97706" : "#1775E0",
            }}
          />
        </div>
      )}
      {limit == null && (
        <p className="text-xs text-[var(--text-secondary)]">{unlimitedLabel}</p>
      )}
    </div>
  );
}

export function UsageMeter() {
  const { isIdentityReady, workspaceId } = useWorkspace();
  const workspaceGateReady =
    isIdentityReady && workspaceId != null && workspaceId.trim() !== "";
  const { data: realtimeUsage, loading: realtimeLoading, error: realtimeError } =
    useWorkspaceUsageRealtime({ enabled: workspaceGateReady });
  const { feedbackTicketsLimit, plan: cachedPlan, isLoaded: isBillingLoaded } = useBillingStore();

  if (!workspaceGateReady || realtimeLoading || !isBillingLoaded) {
    return (
      <div
        className="flex min-h-[120px] items-center justify-center rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm"
        aria-busy="true"
        aria-live="polite"
      >
        <MinimalLoader compact label="Loading usage…" />
      </div>
    );
  }

  if (realtimeError || realtimeUsage == null) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-white p-4 text-sm text-[var(--text-secondary)]">
        {realtimeError ? `Usage unavailable: ${realtimeError}` : "Usage unavailable"}
      </div>
    );
  }

  const plan = cachedPlan ?? realtimeUsage.plan;
  const planLabel = PLAN_LABEL[plan] ?? plan;
  const ticketsUsed = realtimeUsage.feedbackCreatedThisMonth;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-[var(--text-heading)]">Usage</span>
        <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
          {planLabel}
        </span>
      </div>
      <div className="space-y-3">
        <MeterRow
          label="Feedback tickets this month"
          used={ticketsUsed}
          limit={feedbackTicketsLimit}
          unlimitedLabel="No monthly limit"
        />
      </div>
    </div>
  );
}
