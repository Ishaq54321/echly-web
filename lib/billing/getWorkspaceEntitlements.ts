import type { Workspace } from "@/lib/domain/workspace";
import type { PlanId } from "./plans";
import { getPlanCatalog } from "./getPlanCatalog";

export interface WorkspaceEntitlements {
  maxFeedbackPerMonth: number | null;
  maxMembers: number | null;
  insightsAccess: boolean;
  customBranding: boolean;
  prioritySupport: boolean;
  integrations: boolean;
}

/**
 * Returns effective entitlements for a workspace.
 *
 * Plan catalog is the source of truth. workspace.entitlements holds only
 * explicit overrides (e.g. from admin override actions).
 * If a value is missing from entitlements, the current plan catalog value is used.
 *
 * Effective limit: workspace.entitlements.maxFeedbackPerMonth ?? catalog[plan].maxFeedbackPerMonth
 */
export async function getWorkspaceEntitlements(
  workspace: Workspace
): Promise<WorkspaceEntitlements> {
  const plan = (workspace.billing?.plan ?? "starter") as PlanId;

  const catalog = await getPlanCatalog();
  const entry = catalog[plan] ?? catalog.starter;

  const overrides = workspace.entitlements ?? {};

  return {
    maxFeedbackPerMonth:
      overrides.maxFeedbackPerMonth !== undefined
        ? overrides.maxFeedbackPerMonth
        : entry.maxFeedbackPerMonth,
    maxMembers:
      overrides.maxMembers !== undefined ? overrides.maxMembers : entry.maxMembers,
    insightsAccess:
      overrides.insightsAccess !== undefined ? overrides.insightsAccess : entry.insightsEnabled,
    customBranding:
      overrides.customBranding !== undefined ? overrides.customBranding : entry.customBranding,
    prioritySupport:
      overrides.prioritySupport !== undefined ? overrides.prioritySupport : entry.prioritySupport,
    integrations:
      overrides.integrations !== undefined ? overrides.integrations : false,
  };
}
