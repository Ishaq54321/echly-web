import { requireAdmin } from "@/lib/server/adminAuth";
import { logAdminAction } from "@/lib/admin/adminLogs";
import { invalidateWorkspaceCache } from "@/lib/server/resolveWorkspaceForUser";
import { getWorkspace, updateWorkspacePlanRepo } from "@/lib/repositories/workspacesRepository.server";
import { getPlanCatalog } from "@/lib/billing/getPlanCatalog";
import type { PlanId } from "@/lib/billing/plans";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";

const VALID_PLANS: PlanId[] = ["starter", "business", "enterprise"];

/**
 * POST /api/admin/update-plan
 * Body: { workspaceId: string, newPlan: PlanId }
 * Changes workspace.billing.plan. Admin-only (Firestore users/{uid}.isAdmin).
 * Every call is recorded in adminLogs.
 */
export async function POST(req: Request) {
  let admin;
  try {
    admin = await requireAdmin(req);
  } catch (e) {
    // requireAdmin throws a Response (via apiError) on auth/authz failure
    return e as Response;
  }

  let body: { workspaceId?: string; newPlan?: string };
  try {
    body = await req.json();
  } catch {
    return apiError({ code: "INVALID_INPUT", message: "Invalid JSON body", status: 400 });
  }

  const workspaceId = typeof body.workspaceId === "string" ? body.workspaceId.trim() : "";
  const newPlan = typeof body.newPlan === "string" ? body.newPlan.trim().toLowerCase() : "";

  if (!workspaceId) {
    return apiError({ code: "INVALID_INPUT", message: "workspaceId is required", status: 400 });
  }

  if (!VALID_PLANS.includes(newPlan as PlanId)) {
    return apiError({
      code: "INVALID_INPUT",
      message: "newPlan must be one of: starter, business, enterprise",
      status: 400,
    });
  }

  const workspace = await getWorkspace(workspaceId);
  if (!workspace) {
    return apiError({ code: "NOT_FOUND", message: "Workspace not found", status: 404 });
  }

  const previousPlan = workspace.billing?.plan;

  try {
    await updateWorkspacePlanRepo(workspaceId, newPlan as PlanId);
    invalidateWorkspaceCache(workspace.ownerId);

    await logAdminAction({
      adminId: admin.uid,
      action: "admin_update_plan",
      workspaceId,
      metadata: { newPlan, previousPlan },
    });

    const catalog = await getPlanCatalog();
    const entry = catalog[newPlan as PlanId] ?? catalog.starter;
    return apiSuccess({
      plan: newPlan,
      feedbackTicketsLimit: entry.maxFeedbackPerMonth,
      maxMembers: entry.maxMembers,
      insightsAccess: entry.insightsAccess,
    });
  } catch (err) {
    console.error("POST /api/admin/update-plan:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to update plan", status: 500 });
  }
}
