import type { NextRequest } from "next/server";
import { requireAuth, toAuthorizationResponse } from "@/lib/server/auth/authorize";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { getWorkspace } from "@/lib/repositories/workspacesRepository.server";
import { assertWorkspaceActive } from "@/lib/server/assertWorkspaceActive";
import {
  getWorkspaceMemberRepo,
  removeWorkspaceMemberRepo,
} from "@/lib/repositories/workspaceMembersRepository.server";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  const { uid: targetUid } = await params;

  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return toAuthorizationResponse(err);
  }

  if (targetUid === user.uid) {
    return apiError({ code: "INVALID_INPUT", message: "CANNOT_REMOVE_SELF", status: 400 });
  }

  try {
    const workspaceId = await getUserWorkspaceIdRepo(user.uid);
    const workspace = await getWorkspace(workspaceId);
    assertWorkspaceActive(workspace);

    const callerMember = await getWorkspaceMemberRepo(workspaceId, user.uid);
    if (callerMember?.role !== "OWNER") {
      return apiError({ code: "FORBIDDEN", message: "Only workspace owners can remove members", status: 403 });
    }

    const targetMember = await getWorkspaceMemberRepo(workspaceId, targetUid);
    if (!targetMember) {
      return apiError({ code: "NOT_FOUND", message: "Member not found", status: 404 });
    }
    if (targetMember.role === "OWNER") {
      return apiError({ code: "INVALID_INPUT", message: "CANNOT_REMOVE_OWNER", status: 400 });
    }

    await removeWorkspaceMemberRepo(workspaceId, targetUid);

    return apiSuccess({ success: true });
  } catch (err) {
    console.error("DELETE /api/workspace/members/[uid]:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to remove member", status: 500 });
  }
}
