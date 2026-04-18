import type { NextRequest } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { nanoid } from "nanoid";
import { requireAuth, toAuthorizationResponse } from "@/lib/server/auth/authorize";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { getWorkspace } from "@/lib/repositories/workspacesRepository.server";
import { assertWorkspaceActive } from "@/lib/server/assertWorkspaceActive";
import {
  getWorkspaceMemberRepo,
  getWorkspaceInvitationRepo,
  revokeWorkspaceInvitationRepo,
  createWorkspaceInvitationRepo,
  updateWorkspaceInvitationRepo,
} from "@/lib/repositories/workspaceMembersRepository.server";
import { sendWorkspaceInviteEmail } from "@/lib/email/workspaceEmails";

export const dynamic = "force-dynamic";

export async function POST(
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
      return apiError({ code: "FORBIDDEN", message: "Only workspace owners can resend invitations", status: 403 });
    }

    const invitation = await getWorkspaceInvitationRepo(token);
    if (!invitation) {
      return apiError({ code: "NOT_FOUND", message: "Invitation not found", status: 404 });
    }
    if (invitation.workspaceId !== workspaceId) {
      return apiError({ code: "FORBIDDEN", message: "Invitation does not belong to this workspace", status: 403 });
    }
    if (invitation.status !== "pending") {
      return apiError({ code: "INVALID_INPUT", message: "Invitation is no longer pending", status: 400 });
    }

    const now = Timestamp.now();
    const isExpired =
      invitation.expiresAt &&
      typeof (invitation.expiresAt as { toMillis?: () => number }).toMillis === "function" &&
      (invitation.expiresAt as { toMillis: () => number }).toMillis() < now.toMillis();

    let activeInvitation = invitation;

    if (isExpired) {
      // Revoke old, create new invitation with fresh token + expiry
      await revokeWorkspaceInvitationRepo(token);

      const newToken = nanoid(32);
      const expiresAt = Timestamp.fromMillis(now.toMillis() + 30 * 24 * 60 * 60 * 1000);
      const newInvitation = {
        ...invitation,
        id: newToken,
        status: "pending" as const,
        expiresAt,
        createdAt: now,
        acceptedAt: null,
        acceptedBy: null,
        reminderSentAt: null,
      };
      await createWorkspaceInvitationRepo(newInvitation);
      activeInvitation = newInvitation;
    }

    try {
      await sendWorkspaceInviteEmail({
        to: activeInvitation.email,
        invitedByName: activeInvitation.invitedByName,
        workspaceName: activeInvitation.workspaceName,
        role: activeInvitation.role,
        token: activeInvitation.id,
      });
    } catch (emailErr) {
      console.error("POST .../resend: email send failed", emailErr);
    }

    return apiSuccess({ invitation: activeInvitation });
  } catch (err) {
    console.error("POST /api/workspace/members/invitations/[token]/resend:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to resend invitation", status: 500 });
  }
}
