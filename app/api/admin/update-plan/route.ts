import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { invalidateWorkspaceCache } from "@/lib/server/resolveWorkspaceForUser";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { getWorkspace, updateWorkspacePlanRepo } from "@/lib/repositories/workspacesRepository.server";
import { getPlanCatalog } from "@/lib/billing/getPlanCatalog";
import type { PlanId } from "@/lib/billing/plans";

const VALID_PLANS: PlanId[] = ["free", "starter", "business", "enterprise"];

/**
 * POST /api/admin/update-plan
 * Body: { newPlan: PlanId }
 * Workspace is resolved server-side from the authenticated user.
 * Updates workspace.billing.plan. Limits come from plan catalog (source of truth).
 * Only allowed if the authenticated user is the workspace owner.
 */
export async function POST(req: Request) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }

  let body: { newPlan?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const newPlan = typeof body.newPlan === "string" ? body.newPlan.trim().toLowerCase() : "";

  let workspaceId: string;
  try {
    workspaceId = await getUserWorkspaceIdRepo(user.uid);
  } catch (err) {
    console.error("POST /api/admin/update-plan: resolve workspace", err);
    return NextResponse.json(
      { error: "Could not resolve workspace for user" },
      { status: 500 }
    );
  }

  if (!VALID_PLANS.includes(newPlan as PlanId)) {
    return NextResponse.json(
      { error: "newPlan must be one of: free, starter, business, enterprise" },
      { status: 400 }
    );
  }

  const workspace = await getWorkspace(workspaceId);
  if (!workspace) {
    return NextResponse.json(
      { error: "Workspace not found" },
      { status: 404 }
    );
  }

  if (workspace.ownerId !== user.uid) {
    return NextResponse.json(
      { error: "Only the workspace owner can change the plan" },
      { status: 403 }
    );
  }

  try {
    await updateWorkspacePlanRepo(workspaceId, newPlan as PlanId);
    invalidateWorkspaceCache(user.uid);
    const catalog = await getPlanCatalog();
    const entry = catalog[newPlan as PlanId] ?? catalog.free;
    return NextResponse.json({
      success: true,
      plan: newPlan,
      limits: {
        maxSessions: entry.maxSessions,
        maxMembers: entry.maxMembers,
        insightsAccess: entry.insightsEnabled,
      },
    });
  } catch (err) {
    console.error("POST /api/admin/update-plan:", err);
    return NextResponse.json(
      { error: "Failed to update plan" },
      { status: 500 }
    );
  }
}
