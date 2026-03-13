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
 */
export function checkPlanLimit(params: {
  workspace: Workspace;
  metric: PlanLimitMetric;
  currentUsage: number;
}): void {
  const entitlements = getWorkspaceEntitlements(params.workspace);
  const limit = entitlements[params.metric];
  if (limit == null) return; // unlimited
  if (params.currentUsage < limit) return;

  const plan = (params.workspace.billing?.plan ?? "free") as PlanId;
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);
  const upgradePlan = UPGRADE_PLAN[plan] ?? null;

  const messages: Record<PlanLimitMetric, string> = {
    maxSessions: `Session limit reached for ${planLabel} plan`,
    maxMembers: `Member limit reached for ${planLabel} plan`,
  };

  const err = new Error(messages[params.metric]) as PlanLimitError;
  err.code = "PLAN_LIMIT_REACHED";
  err.metric = params.metric;
  err.upgradePlan = upgradePlan;
  throw err;
}
