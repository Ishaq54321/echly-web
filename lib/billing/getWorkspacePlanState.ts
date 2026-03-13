import { getWorkspace } from "@/lib/repositories/workspacesRepository";
import { getPlanCatalog } from "@/lib/billing/getPlanCatalog";
import { getWorkspaceUsage } from "@/lib/billing/getWorkspaceUsage";
import type { PlanId } from "@/lib/billing/plans";

export type WorkspacePlanState = {
  planId: string;
  pricing: {
    monthly: number;
    yearly: number;
  };
  limits: {
    maxSessions: number | null;
    maxMembers: number | null;
  };
  usage: {
    sessions: number;
    members: number;
  };
  permissions: {
    canCreateSession: boolean;
    canInviteMember: boolean;
  };
};

/**
 * Central plan resolver: returns the current plan state of a workspace including
 * pricing, limits, usage, and permissions. Use this as the canonical source
 * for plan-derived data. Does not modify session limit enforcement.
 */
export async function getWorkspacePlanState(
  workspaceId: string
): Promise<WorkspacePlanState | null> {
  const workspace = await getWorkspace(workspaceId);
  if (!workspace) return null;

  const catalog = await getPlanCatalog();
  const usageResult = await getWorkspaceUsage(workspaceId);

  const planId = (workspace.billing?.plan ?? "free") as PlanId;
  const plan = catalog[planId] ?? catalog.free;

  const limits = {
    maxSessions:
      workspace.entitlements?.maxSessions ?? plan.maxSessions ?? null,
    maxMembers:
      workspace.entitlements?.maxMembers ?? plan.maxMembers ?? null,
  };

  const sessions = usageResult?.sessionCount ?? 0;
  const members = usageResult?.memberCount ?? 0;

  const permissions = {
    canCreateSession:
      limits.maxSessions === null || sessions < limits.maxSessions,
    canInviteMember:
      limits.maxMembers === null || members < limits.maxMembers,
  };

  return {
    planId: plan.id,
    pricing: {
      monthly: plan.priceMonthly,
      yearly: plan.priceYearly,
    },
    limits,
    usage: { sessions, members },
    permissions,
  };
}
