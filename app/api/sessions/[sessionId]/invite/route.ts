import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/server/apiResponse";
import { tryBuildRequestContext } from "@/lib/server/requestContext";

import { adminDb } from "@/lib/server/firebaseAdmin";

import {
  createSessionInvite,
  addSessionMember,
  getSessionMember,
  getInviteByEmail,
} from "@/lib/repositories/sessionMembersRepository.server";

export const dynamic = "force-dynamic";

type ExistingInviteeUser = {
  uid: string;
  workspaceId?: unknown;
  [key: string]: unknown;
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId: sessionIdRaw } = await params;
  const sessionId = typeof sessionIdRaw === "string" ? sessionIdRaw.trim() : "";
  if (!sessionId) {
    return apiError({
      code: "INVALID_INPUT",
      message: "Missing session id",
      status: 400,
    });
  }

  const built = await tryBuildRequestContext({
    req,
    sessionId,
  });
  if (!built.ok) {
    return built.response;
  }
  const context = built.ctx;

  if (!context.access?.capabilities.canResolve) {
    return apiError({
      code: "FORBIDDEN",
      message: "You do not have permission to invite users",
      status: 403,
    });
  }

  if (!context.session) {
    return apiError({ code: "NOT_FOUND", message: "Not found", status: 404 });
  }

  let body: { email?: unknown; access?: unknown };
  try {
    body = (await req.json()) as { email?: unknown; access?: unknown };
  } catch {
    return apiError({
      code: "INVALID_INPUT",
      message: "Invalid JSON body",
      status: 400,
    });
  }

  const email = typeof body.email === "string" ? body.email?.trim() : "";
  const access = body.access;

  if (!email || !email.includes("@")) {
    return apiError({
      code: "INVALID_INPUT",
      message: "Invalid email address",
    });
  }

  if (access !== "view" && access !== "resolve") {
    return apiError({
      code: "INVALID_INPUT",
      message: "Invalid access level",
    });
  }

  const usersSnap = await adminDb
    .collection("users")
    .where("email", "==", email)
    .limit(1)
    .get();

  const existingUser: ExistingInviteeUser | null = !usersSnap.empty
    ? {
        ...(usersSnap.docs[0].data() as Record<string, unknown>),
        uid: usersSnap.docs[0].id,
      }
    : null;

  if (existingUser && existingUser.uid === context.userId) {
    return apiError({
      code: "INVALID_INPUT",
      message: "You cannot invite yourself",
    });
  }

  const inviteeWorkspaceId =
    existingUser &&
    typeof existingUser.workspaceId === "string" &&
    existingUser.workspaceId.trim() !== ""
      ? existingUser.workspaceId.trim()
      : "";

  const sessionWorkspaceId =
    typeof context.session.workspaceId === "string"
      ? context.session.workspaceId.trim()
      : "";

  if (
    existingUser &&
    inviteeWorkspaceId &&
    sessionWorkspaceId &&
    inviteeWorkspaceId === sessionWorkspaceId
  ) {
    return apiError({
      code: "INVALID_INPUT",
      message: "User is already a workspace member and has access",
    });
  }

  if (existingUser) {
    const existingMember = await getSessionMember(sessionId, existingUser.uid);

    if (existingMember) {
      return apiSuccess({
        type: "already_member",
      });
    }

    await addSessionMember({
      sessionId,
      userId: existingUser.uid,
      email,
      access,
      addedBy: context.session.createdByUserId,
    });

    return apiSuccess({
      type: "member_added",
    });
  }

  const existingInvite = await getInviteByEmail(sessionId, email);

  if (existingInvite) {
    const inviteRef = await adminDb
      .collection(`sessions/${sessionId}/invites`)
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!inviteRef.empty) {
      await inviteRef.docs[0].ref.update({
        access,
      });
    }

    return apiSuccess({
      type: "invite_updated",
    });
  }

  await createSessionInvite({
    sessionId,
    email,
    access,
    invitedBy: context.session.createdByUserId,
  });

  return apiSuccess({
    type: "invite_created",
  });
}
