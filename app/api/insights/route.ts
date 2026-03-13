import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { computeInsights } from "@/lib/analytics/computeInsights";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository";
import { getWorkspace } from "@/lib/repositories/workspacesRepository";
import { getWorkspaceEntitlements } from "@/lib/billing/getWorkspaceEntitlements";
import { planRequiredBody } from "@/lib/billing/planLimitResponse";
import { UPGRADE_PLAN } from "@/lib/billing/plans";
import type { PlanId } from "@/lib/billing/plans";

/**
 * GET /api/insights
 * Returns analytics for the authenticated user (from Firestore).
 * Requires insightsAccess entitlement (paid plans).
 */
export async function GET(req: Request) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }

  const workspaceId = (await getUserWorkspaceIdRepo(user.uid)) ?? user.uid;
  const workspace = await getWorkspace(workspaceId);
  if (workspace) {
    const entitlements = getWorkspaceEntitlements(workspace);
    if (!entitlements.insightsAccess) {
      const plan = (workspace.billing?.plan ?? "free") as PlanId;
      const upgradePlan = UPGRADE_PLAN[plan] ?? "starter";
      return NextResponse.json(planRequiredBody(upgradePlan), { status: 403 });
    }
  }

  const data = await computeInsights(user.uid);
  // Always return both lifetime and last30Days windows, plus additional insights.
  return NextResponse.json(data);
}
