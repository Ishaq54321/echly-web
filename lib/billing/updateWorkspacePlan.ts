import { updateWorkspacePlanRepo } from "@/lib/repositories/workspacesRepository";
import type { PlanId } from "./plans";

/**
 * Updates a workspace's plan and syncs entitlements from PLANS.
 * For use by admins or in development/testing (e.g. to test Starter limits).
 *
 * Example (dev):
 *   import { updateWorkspacePlan } from "@/lib/billing/updateWorkspacePlan";
 *   await updateWorkspacePlan(workspaceId, "starter");
 */
export async function updateWorkspacePlan(
  workspaceId: string,
  newPlan: PlanId
): Promise<void> {
  await updateWorkspacePlanRepo(workspaceId, newPlan);
}
