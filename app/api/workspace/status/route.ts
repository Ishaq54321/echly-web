import {
  requireAuth,
  toAuthorizationResponse,
} from "@/lib/server/auth/authorize";
import { apiSuccess } from "@/lib/server/apiResponse";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { getWorkspace } from "@/lib/repositories/workspacesRepository.server";
import { MISSING_USER_WORKSPACE_ERROR } from "@/lib/constants/userWorkspace";

export const dynamic = "force-dynamic";

/**
 * GET /api/workspace/status
 * Returns the real suspension/deletion state for the signed-in user's workspace.
 * Read straight from Firestore so the suspended banner reflects live billing state.
 */
export async function GET(req: Request) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (e) {
    return toAuthorizationResponse(e);
  }

  try {
    const workspaceId = await getUserWorkspaceIdRepo(user.uid);
    const workspace = await getWorkspace(workspaceId);

    if (!workspace) {
      return apiSuccess({ suspended: false, deleted: false, reason: null });
    }

    const suspended = workspace.billing?.suspended === true;

    return apiSuccess({
      suspended,
      deleted: workspace.deletedAt != null,
      reason: suspended ? "payment_failed" : null,
    });
  } catch (err) {
    if (err instanceof Error && err.message === MISSING_USER_WORKSPACE_ERROR) {
      return apiSuccess({ suspended: false, deleted: false, reason: null });
    }
    // Fail-safe: if anything else goes wrong, don't claim suspended
    // (a false negative is better than locking everyone out on a transient error).
    console.error("[workspace status] unexpected error:", err);
    return apiSuccess({ suspended: false, deleted: false, reason: null });
  }
}
