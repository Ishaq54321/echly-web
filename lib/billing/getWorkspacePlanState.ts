import { getWorkspace } from "@/lib/repositories/workspacesRepository.server";
import { getPlanCatalog } from "@/lib/billing/getPlanCatalog";
import { getWorkspaceEntitlements } from "@/lib/billing/getWorkspaceEntitlements";
import { getWorkspaceUsage } from "@/lib/billing/getWorkspaceUsage";
import type { PlanId } from "@/lib/billing/plans";

export type WorkspacePlanState = {
  planId: PlanId;
  pricePerSeat: number | null;
  annualPricePerSeat: number | null;
  seats: number;
  feedbackTicketsUsed: number;
  feedbackTicketsLimit: number | null;
  canCreateFeedback: boolean;
  canAddMember: boolean;
  memberCount: number;
  maxMembers: number | null;
};

/**
 * Central plan resolver: returns the current plan state of a workspace including
 * pricing, ticket usage, and permissions. Limits come from getWorkspaceEntitlements
 * (catalog + override-only), so admin plan changes apply immediately.
 */
export async function getWorkspacePlanState(
  workspaceId: string
): Promise<WorkspacePlanState | null> {
  const workspace = await getWorkspace(workspaceId);
  if (!workspace) return null;

  const [catalog, entitlements, usageResult] = await Promise.all([
    getPlanCatalog(),
    getWorkspaceEntitlements(workspace),
    getWorkspaceUsage(workspaceId, workspace),
  ]);

  const planId = (workspace.billing?.plan ?? "starter") as PlanId;
  const catalogEntry = catalog[planId] ?? catalog.starter;

  const feedbackTicketsLimit = entitlements.maxFeedbackPerMonth;
  const feedbackTicketsUsed = usageResult?.feedbackCreatedThisMonth ?? 0;
  const memberCount = usageResult?.memberCount ?? 0;
  const maxMembers = entitlements.maxMembers;
  const seats = workspace.billing?.seats ?? 1;

  return {
    planId,
    pricePerSeat: catalogEntry.pricePerSeat,
    annualPricePerSeat: catalogEntry.annualPricePerSeat,
    seats,
    feedbackTicketsUsed,
    feedbackTicketsLimit,
    canCreateFeedback: feedbackTicketsLimit === null || feedbackTicketsUsed < feedbackTicketsLimit,
    canAddMember: maxMembers === null || memberCount < maxMembers,
    memberCount,
    maxMembers,
  };
}
