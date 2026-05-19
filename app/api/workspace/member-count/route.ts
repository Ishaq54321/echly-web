import type { NextRequest } from "next/server";
import { requireAuth, toAuthorizationResponse } from "@/lib/server/auth/authorize";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { getWorkspace } from "@/lib/repositories/workspacesRepository.server";
import { assertWorkspaceActive } from "@/lib/server/assertWorkspaceActive";
import { workspaceGuardErrorResponse } from "@/lib/server/workspaceGuardErrorResponse";
import { getWorkspaceMemberCountRepo } from "@/lib/repositories/workspaceMembersRepository.server";

export const dynamic = "force-dynamic";

/**
 * GET /api/workspace/member-count — active member count only.
 *
 * Replaces the dashboard's prior use of GET /api/workspace/members/all (which
 * resolves every member's live avatar + pending invitations) for what the
 * client only consumed as `.totalMembers`. Uses a Firestore `.count()`
 * aggregation: one read unit, no per-member fan-out. Same auth +
 * workspace-active guard as /members/all so suspended-workspace behavior is
 * unchanged.
 */
export async function GET(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return toAuthorizationResponse(err);
  }

  try {
    const workspaceId = await getUserWorkspaceIdRepo(user.uid);
    const workspace = await getWorkspace(workspaceId);
    assertWorkspaceActive(workspace);

    const totalMembers = await getWorkspaceMemberCountRepo(workspaceId);
    return apiSuccess({ totalMembers });
  } catch (err) {
    const guardResponse = workspaceGuardErrorResponse(err);
    if (guardResponse) return guardResponse;

    console.error("GET /api/workspace/member-count:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Failed to load member count",
      status: 500,
    });
  }
}
