import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import type { Workspace } from "@/lib/domain/workspace";
import { getWorkspaceEntitlements } from "./getWorkspaceEntitlements";
import { UPGRADE_PLAN, type PlanId } from "./plans";

export type PlanLimitMetric = "maxMembers" | "maxFeedbackPerMonth";

export interface PlanLimitError extends Error {
  code: "PLAN_LIMIT_REACHED";
  metric: PlanLimitMetric;
  upgradePlan: PlanId | null;
}

function makePlanLimitError(
  message: string,
  metric: PlanLimitMetric,
  upgradePlan: PlanId | null
): PlanLimitError {
  const err = new Error(message) as PlanLimitError;
  err.code = "PLAN_LIMIT_REACHED";
  err.metric = metric;
  err.upgradePlan = upgradePlan;
  return err;
}

/**
 * Returns the 1st-of-current-month as "YYYY-MM-DD".
 */
function currentMonthResetDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

/**
 * Checks whether feedbackResetDate is from a previous month compared to today.
 * If so, resets feedbackCreatedThisMonth to 0 in Firestore and returns 0.
 * Otherwise returns the current count.
 */
async function resolveMonthlyTicketCount(workspace: Workspace): Promise<number> {
  const resetDate = workspace.usage?.feedbackResetDate ?? "";
  const expected = currentMonthResetDate();

  if (resetDate !== expected) {
    // New month — reset counter
    await adminDb.doc(`workspaces/${workspace.id}`).update({
      "usage.feedbackCreatedThisMonth": 0,
      "usage.feedbackResetDate": expected,
    });
    return 0;
  }

  return workspace.usage?.feedbackCreatedThisMonth ?? 0;
}

/**
 * Checks that the workspace has not exceeded its monthly feedback ticket limit.
 * If the monthly period has rolled over, resets the counter first.
 * Throws PlanLimitError with upgradePlan = "business" when limit is reached.
 */
export async function checkFeedbackTicketLimit(workspace: Workspace): Promise<void> {
  const entitlements = await getWorkspaceEntitlements(workspace);
  const limit = entitlements.maxFeedbackPerMonth;

  if (limit === null) return; // unlimited

  const used = await resolveMonthlyTicketCount(workspace);

  if (used < limit) return;

  const plan = (workspace.billing?.plan ?? "starter") as PlanId;
  const upgradePlan = UPGRADE_PLAN[plan] ?? null;

  throw makePlanLimitError(
    "Monthly feedback ticket limit reached",
    "maxFeedbackPerMonth",
    upgradePlan
  );
}

/**
 * Checks that current usage does not exceed the plan limit for member count.
 * Only used to block NEW invitations. Never prunes existing members.
 */
export async function checkPlanLimit(params: {
  workspace: Workspace;
  metric: "maxMembers";
  currentUsage: number;
}): Promise<void> {
  const entitlements = await getWorkspaceEntitlements(params.workspace);
  const limit = entitlements.maxMembers;
  if (limit == null) return; // unlimited
  if (params.currentUsage < limit) return;

  const plan = (params.workspace.billing?.plan ?? "starter") as PlanId;
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);
  const upgradePlan = UPGRADE_PLAN[plan] ?? null;

  throw makePlanLimitError(
    `Member limit reached for ${planLabel} plan`,
    "maxMembers",
    upgradePlan
  );
}
