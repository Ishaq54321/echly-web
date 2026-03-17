import type { Workspace } from "@/lib/domain/workspace";
import type { PlanId, PlanConfig } from "./plans";
import { getPlanCatalog } from "./getPlanCatalog";

export type WorkspaceEntitlements = PlanConfig;

/**
 * Returns effective entitlements for a workspace.
 *
 * Plan catalog is the source of truth. workspace.entitlements holds only
 * explicit overrides (e.g. from override_session_limit or grant_unlimited_sessions).
 * If a value is missing from entitlements, the current plan catalog value is used.
 * Does not fall back to static PLANS; catalog must be available at runtime.
 *
 * Effective limit: workspace.entitlements.maxSessions ?? catalog[workspace.plan].maxSessions
 */
export async function getWorkspaceEntitlements(
  workspace: Workspace
): Promise<WorkspaceEntitlements> {
  const t_entitlements_start = performance.now();
  const plan = (workspace.billing?.plan ?? "free") as PlanId;

  const t_catalog_start = performance.now();
  const catalog = await getPlanCatalog();
  console.log("[ECHLY PERF] getWorkspaceEntitlements.getPlanCatalog:", performance.now() - t_catalog_start);
  const entry = catalog[plan] ?? catalog.free;
  const fromCatalog: PlanConfig = {
    maxSessions: entry.maxSessions,
    maxMembers: entry.maxMembers,
    insightsAccess: entry.insightsEnabled,
  };

  const overrides = workspace.entitlements as Partial<PlanConfig> | undefined;
  const result = {
    maxSessions: overrides?.maxSessions !== undefined ? overrides.maxSessions : fromCatalog.maxSessions,
    maxMembers: overrides?.maxMembers !== undefined ? overrides.maxMembers : fromCatalog.maxMembers,
    insightsAccess: overrides?.insightsAccess !== undefined ? overrides.insightsAccess : fromCatalog.insightsAccess,
  };
  console.log("[ECHLY PERF] getWorkspaceEntitlements TOTAL:", performance.now() - t_entitlements_start);
  return result;
}
