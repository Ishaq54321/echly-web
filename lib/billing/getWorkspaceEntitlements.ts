import type { Workspace } from "@/lib/domain/workspace";
import { PLANS, type PlanId, type PlanConfig } from "./plans";

export type WorkspaceEntitlements = PlanConfig;

/**
 * Returns effective entitlements for a workspace. If the workspace has no
 * stored entitlements for plan-derived fields, they are derived from PLANS[plan].
 */
export function getWorkspaceEntitlements(workspace: Workspace): WorkspaceEntitlements {
  const plan = (workspace.billing?.plan ?? "free") as PlanId;
  const fromPlan = PLANS[plan] ?? PLANS.free;
  const stored = workspace.entitlements as Partial<PlanConfig> | undefined;
  return {
    maxSessions: stored?.maxSessions ?? fromPlan.maxSessions,
    maxMembers: stored?.maxMembers ?? fromPlan.maxMembers,
    insightsAccess: stored?.insightsAccess ?? fromPlan.insightsAccess,
  };
}
