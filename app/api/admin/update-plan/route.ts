import {
  requireAuth,
  toAuthorizationResponse,
} from "@/lib/server/auth/authorize";
import { invalidateWorkspaceCache } from "@/lib/server/resolveWorkspaceForUser";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { getWorkspace, updateWorkspacePlanRepo } from "@/lib/repositories/workspacesRepository.server";
import { getPlanCatalog } from "@/lib/billing/getPlanCatalog";
import type { PlanId } from "@/lib/billing/plans";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";

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
  } catch (err) {
    return toAuthorizationResponse(err);
  }

  let body: { newPlan?: string };
  try {
    body = await req.json();
  } catch {
    return apiError({ code: "INVALID_INPUT", message: "Invalid JSON body", status: 400 });
  }

  const newPlan = typeof body.newPlan === "string" ? body.newPlan.trim().toLowerCase() : "";

  let workspaceId: string;
  try {
    workspaceId = await getUserWorkspaceIdRepo(user.uid);
  } catch (err) {
    console.error("POST /api/admin/update-plan: resolve workspace", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Could not resolve workspace for user",
      status: 500,
    });
  }

  if (!VALID_PLANS.includes(newPlan as PlanId)) {
    return apiError({
      code: "INVALID_INPUT",
      message: "newPlan must be one of: free, starter, business, enterprise",
      status: 400,
    });
  }

  const workspace = await getWorkspace(workspaceId);
  if (!workspace) {
    return apiError({ code: "NOT_FOUND", message: "Workspace not found", status: 404 });
  }

  if (workspace.ownerId !== user.uid) {
    return apiError({
      code: "FORBIDDEN",
      message: "Only the workspace owner can change the plan",
      status: 403,
    });
  }

  try {
    await updateWorkspacePlanRepo(workspaceId, newPlan as PlanId);
    invalidateWorkspaceCache(user.uid);
    const catalog = await getPlanCatalog();
    const entry = catalog[newPlan as PlanId] ?? catalog.free;
    return apiSuccess({
      plan: newPlan,
      limits: {
        maxSessions: entry.maxSessions,
        maxMembers: entry.maxMembers,
        insightsAccess: entry.insightsEnabled,
      },
    });
  } catch (err) {
    console.error("POST /api/admin/update-plan:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Failed to update plan",
      status: 500,
    });
  }
}
