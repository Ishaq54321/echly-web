import type { Workspace } from "@/lib/domain/workspace";
import { PLANS, type PlanId, type PlanConfig } from "./plans";
import { getPlanCatalog } from "./getPlanCatalog";

export type WorkspaceEntitlements = PlanConfig;

/**
 * Returns effective entitlements for a workspace. If the workspace has no
 * stored entitlements for plan-derived fields, they are derived from the
 * Firestore-backed plan catalog, with PLANS as a safety fallback.
 */
export async function getWorkspaceEntitlements(
  workspace: Workspace
): Promise<WorkspaceEntitlements> {
  const plan = (workspace.billing?.plan ?? "free") as PlanId;

  let fromPlan: PlanConfig;
  try {
    const catalog = await getPlanCatalog();
    const entry = catalog[plan] ?? catalog.free;
    fromPlan = {
      maxSessions: entry.maxSessions,
      maxMembers: entry.maxMembers,
      insightsAccess: entry.insightsEnabled,
    };
  } catch {
    // Safety fallback if catalog resolution fails entirely.
    fromPlan = PLANS[plan] ?? PLANS.free;
  }

  const stored = workspace.entitlements as Partial<PlanConfig> | undefined;
  return {
    maxSessions: stored?.maxSessions ?? fromPlan.maxSessions,
    maxMembers: stored?.maxMembers ?? fromPlan.maxMembers,
    insightsAccess: stored?.insightsAccess ?? fromPlan.insightsAccess,
  };
}
