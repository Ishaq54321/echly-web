import type { Workspace } from "@/lib/domain/workspace";
import { getWorkspaceEntitlements } from "./getWorkspaceEntitlements";
import { UPGRADE_PLAN, type PlanId } from "./plans";

export type PlanLimitMetric = "maxSessions" | "maxMembers";

export interface PlanLimitError extends Error {
  code: "PLAN_LIMIT_REACHED";
  metric: PlanLimitMetric;
  upgradePlan: PlanId | null;
}

/**
 * Checks that current usage does not exceed the plan limit for the given metric.
 * If exceeded, throws an error with code PLAN_LIMIT_REACHED and upgradePlan.
 * Used only to block NEW creation (e.g. POST /api/sessions). Never used to delete or prune existing resources.
 */
export async function checkPlanLimit(params: {
  workspace: Workspace;
  metric: PlanLimitMetric;
  currentUsage: number;
}): Promise<void> {
  const t_check_start = performance.now();
  const t_entitlements_start = performance.now();
  const entitlements = await getWorkspaceEntitlements(params.workspace);
  console.log("[ECHLY PERF] checkPlanLimit.getWorkspaceEntitlements:", performance.now() - t_entitlements_start);
  const limit = entitlements[params.metric];
  if (limit == null) {
    console.log("[ECHLY PERF] checkPlanLimit TOTAL:", performance.now() - t_check_start);
    return; // unlimited
  }
  if (params.currentUsage < limit) {
    console.log("[ECHLY PERF] checkPlanLimit TOTAL:", performance.now() - t_check_start);
    return;
  }

  const plan = (params.workspace.billing?.plan ?? "free") as PlanId;
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);
  const upgradePlan = UPGRADE_PLAN[plan] ?? null;

  const messages: Record<PlanLimitMetric, string> = {
    maxSessions: `Session limit reached for ${planLabel} plan`,
    maxMembers: `Member limit reached for ${planLabel} plan`,
  };

  const err = new Error(messages[params.metric]) as PlanLimitError;
  (err as PlanLimitError).code = "PLAN_LIMIT_REACHED";
  (err as PlanLimitError).metric = params.metric;
  (err as PlanLimitError).upgradePlan = upgradePlan;
  console.log("[ECHLY PERF] checkPlanLimit TOTAL:", performance.now() - t_check_start);
  throw err;
}
