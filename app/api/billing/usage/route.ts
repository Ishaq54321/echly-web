import {
  requireAuth,
  toAuthorizationResponse,
} from "@/lib/server/auth/authorize";
import { getWorkspace } from "@/lib/repositories/workspacesRepository.server";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { getPlanCatalog } from "@/lib/billing/getPlanCatalog";
import { MISSING_USER_WORKSPACE_ERROR } from "@/lib/constants/userWorkspace";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import type { PlanId } from "@/lib/billing/plans";

export const dynamic = "force-dynamic";

/**
 * GET /api/billing/usage
 * Returns plan, ticket usage, and limit for the authenticated user's workspace.
 */
export async function GET(req: Request) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return toAuthorizationResponse(err);
  }

  try {
    const workspaceId = await getUserWorkspaceIdRepo(user.uid);
    const workspace = await getWorkspace(workspaceId);

    if (!workspace) {
      return apiError({ code: "FORBIDDEN", message: "Workspace not found", status: 403 });
    }

    if (!workspace.billing?.plan) {
      return apiError({ code: "INTERNAL_ERROR", message: "Billing plan missing", status: 500 });
    }

    const plan = workspace.billing.plan as PlanId;
    const seats = workspace.billing.seats ?? 1;

    const catalog = await getPlanCatalog();
    const entry = catalog[plan] ?? catalog.starter;

    const overrideFeedback = workspace.entitlements?.maxFeedbackPerMonth;
    const feedbackTicketsLimit =
      overrideFeedback !== undefined ? overrideFeedback : entry.maxFeedbackPerMonth;

    const feedbackTicketsUsed = workspace.usage?.feedbackCreatedThisMonth ?? 0;

    return apiSuccess({
      plan,
      seats,
      feedbackTicketsUsed,
      feedbackTicketsLimit,
      canCreateFeedback: feedbackTicketsLimit === null || feedbackTicketsUsed < feedbackTicketsLimit,
    });
  } catch (err) {
    if (err instanceof Error && err.message === MISSING_USER_WORKSPACE_ERROR) {
      return apiError({ code: "FORBIDDEN", message: "Workspace not found", status: 403 });
    }
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Failed to load billing data",
      status: 500,
    });
  }
}
