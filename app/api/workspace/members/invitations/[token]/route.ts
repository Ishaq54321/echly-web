import type { NextRequest } from "next/server";
import { requireAuth, toAuthorizationResponse } from "@/lib/server/auth/authorize";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { getWorkspace } from "@/lib/repositories/workspacesRepository.server";
import { assertWorkspaceActive } from "@/lib/server/assertWorkspaceActive";
import {
  getWorkspaceMemberRepo,
  getWorkspaceInvitationRepo,
  revokeWorkspaceInvitationRepo,
} from "@/lib/repositories/workspaceMembersRepository.server";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

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
      return apiError({ code: "FORBIDDEN", message: "Only workspace owners can revoke invitations", status: 403 });
    }

    const invitation = await getWorkspaceInvitationRepo(token);
    if (!invitation) {
      return apiError({ code: "NOT_FOUND", message: "Invitation not found", status: 404 });
    }
    if (invitation.workspaceId !== workspaceId) {
      return apiError({ code: "FORBIDDEN", message: "Invitation does not belong to this workspace", status: 403 });
    }

    await revokeWorkspaceInvitationRepo(token);

    return apiSuccess({ success: true });
  } catch (err) {
    console.error("DELETE /api/workspace/members/invitations/[token]:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to revoke invitation", status: 500 });
  }
}
