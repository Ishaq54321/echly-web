import type { NextRequest } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { nanoid } from "nanoid";
import { requireAuth, toAuthorizationResponse } from "@/lib/server/auth/authorize";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { getUserWorkspaceIdRepo, getUserByIdRepo, addWorkspaceMembershipRepo } from "@/lib/repositories/usersRepository.server";
import { getWorkspace } from "@/lib/repositories/workspacesRepository.server";
import { assertWorkspaceActive } from "@/lib/server/assertWorkspaceActive";
import {
  getWorkspaceMemberRepo,
  addWorkspaceMemberRepo,
  createWorkspaceInvitationRepo,
  getWorkspaceInvitationByEmailRepo,
} from "@/lib/repositories/workspaceMembersRepository.server";
import { sendWorkspaceInviteEmail } from "@/lib/email/workspaceEmails";
import { adminDb } from "@/lib/server/firebaseAdmin";
import type { WorkspaceMemberRole } from "@/lib/domain/workspaceMember";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return toAuthorizationResponse(err);
  }

  let body: { email?: unknown; role?: unknown };
  try {
    body = (await req.json()) as { email?: unknown; role?: unknown };
  } catch {
    return apiError({ code: "INVALID_INPUT", message: "Invalid JSON body", status: 400 });
  }

  if (typeof body.email !== "string" || !EMAIL_RE.test(body.email)) {
    return apiError({ code: "INVALID_INPUT", message: "Invalid email address", status: 400 });
  }

  const email = body.email.toLowerCase().trim();
  const role: WorkspaceMemberRole =
    body.role === "OWNER" ? "OWNER" : "MEMBER";

  try {
    const workspaceId = await getUserWorkspaceIdRepo(user.uid);
    const workspace = await getWorkspace(workspaceId);
    assertWorkspaceActive(workspace);
    if (!workspace) {
      return apiError({ code: "NOT_FOUND", message: "Workspace not found", status: 404 });
    }

    // WS-004 FIX: check ownerId field first (source of truth),
    // fall back to subcollection role as belt-and-suspenders
    const isOwnerByField = workspace.ownerId === user.uid;
    const callerMember = await getWorkspaceMemberRepo(workspaceId, user.uid);
    const isOwnerByRole = callerMember?.role === "OWNER";

    if (!isOwnerByField && !isOwnerByRole) {
      return apiError({
        code: "FORBIDDEN",
        message: "Only workspace owners can invite members",
        status: 403,
      });
    }

    // Auto-heal: if owner by ownerId but no member doc, create it
    if (isOwnerByField && !callerMember) {
      try {
        const healSnap = await adminDb.doc(`users/${user.uid}`).get();
        const healData = (healSnap.data() ?? {}) as Record<string, unknown>;
        const healAvatarUrl =
          typeof healData.avatarUrl === "string" ? healData.avatarUrl :
          typeof healData.photoURL === "string" ? healData.photoURL : null;
        await addWorkspaceMemberRepo(workspaceId, {
          uid: user.uid,
          email: user.email ?? "",
          displayName: user.displayName ?? null,
          avatarUrl: healAvatarUrl,
          role: "OWNER",
          joinedAt: Timestamp.now(),
          invitedBy: null,
        });
        await addWorkspaceMembershipRepo(user.uid, workspaceId);
      } catch (e) {
        console.error("[WS-004 heal]", e);
      }
    }

    // Check if user with this email already a member
    const existingUserSnap = await adminDb
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();
    if (!existingUserSnap.empty) {
      const existingUid = existingUserSnap.docs[0].id;
      const existingMember = await getWorkspaceMemberRepo(workspaceId, existingUid);
      if (existingMember) {
        return apiError({ code: "INVALID_INPUT", message: "ALREADY_MEMBER", status: 409 });
      }
    }

    // Check for existing pending invitation
    const existingInvite = await getWorkspaceInvitationByEmailRepo(workspaceId, email);
    if (existingInvite) {
      return apiError({ code: "INVALID_INPUT", message: "INVITE_ALREADY_SENT", status: 409 });
    }

    const token = nanoid(32);
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromMillis(now.toMillis() + 30 * 24 * 60 * 60 * 1000);

    const callerProfile = await getUserByIdRepo(user.uid);
    const inviterName =
      callerProfile?.displayName ??
      (callerProfile as Record<string, unknown> | null)?.name as string | null ??
      user.email ??
      "Someone";

    const invitation = {
      id: token,
      workspaceId,
      email,
      role,
      status: "pending" as const,
      invitedBy: user.uid,
      invitedByName: String(inviterName),
      workspaceName: workspace.name,
      expiresAt,
      createdAt: now,
      acceptedAt: null,
      acceptedBy: null,
      reminderSentAt: null,
    };

    await createWorkspaceInvitationRepo(invitation);

    try {
      await sendWorkspaceInviteEmail({
        to: email,
        invitedByName: String(inviterName),
        workspaceName: workspace.name,
        role,
        token,
      });
    } catch (emailErr) {
      console.error("POST /api/workspace/members/invite: email send failed", emailErr);
    }

    return apiSuccess({ invitation });
  } catch (err) {
    console.error("POST /api/workspace/members/invite:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to send invitation", status: 500 });
  }
}
