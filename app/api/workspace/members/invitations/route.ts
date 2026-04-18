import type { NextRequest } from "next/server";
import { requireAuth, toAuthorizationResponse } from "@/lib/server/auth/authorize";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { getWorkspace } from "@/lib/repositories/workspacesRepository.server";
import { assertWorkspaceActive } from "@/lib/server/assertWorkspaceActive";
import {
  getWorkspaceMemberRepo,
  getWorkspacePendingInvitationsRepo,
} from "@/lib/repositories/workspaceMembersRepository.server";

export const dynamic = "force-dynamic";

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

    const callerMember = await getWorkspaceMemberRepo(workspaceId, user.uid);
    if (callerMember?.role !== "OWNER") {
      return apiError({ code: "FORBIDDEN", message: "Only workspace owners can view pending invitations", status: 403 });
    }

    const invitations = await getWorkspacePendingInvitationsRepo(workspaceId);

    return apiSuccess({ invitations });
  } catch (err) {
    console.error("GET /api/workspace/members/invitations:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to load invitations", status: 500 });
  }
}
