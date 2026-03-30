import {
  requireAuth,
  toAuthorizationResponse,
} from "@/lib/server/auth/authorize";
import { getWorkspace } from "@/lib/repositories/workspacesRepository.server";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { getPlanCatalog } from "@/lib/billing/getPlanCatalog";
import { MISSING_USER_WORKSPACE_ERROR } from "@/lib/constants/userWorkspace";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";

export const dynamic = "force-dynamic";

/**
 * GET /api/billing/usage
 * Returns plan and resolved session limit only.
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
      return apiError({
        code: "INTERNAL_ERROR",
        message: "Billing plan missing",
        status: 500,
      });
    }

    const plan = workspace.billing.plan;
    const override = workspace.entitlements?.maxSessions;
    const catalog = await getPlanCatalog();
    const maxSessions =
      override !== undefined
        ? override // includes null = unlimited
        : catalog[plan]?.maxSessions ?? null;

    return apiSuccess({
      plan,
      limits: {
        maxSessions,
      },
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
