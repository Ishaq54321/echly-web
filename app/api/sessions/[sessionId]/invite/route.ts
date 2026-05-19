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
import {
  createActivityEvent,
  resolveActorForActivityEvent,
  sessionTitleFromSessionRow,
} from "@/lib/repositories/activityEventsRepository.server";
import { sendSessionInviteEmail } from "@/lib/email/workspaceEmails";
import { resolveUserName } from "@/lib/utils/nameSplit";
import { fireAndForget } from "@/lib/server/fireAndForget";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://annote.ai";

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

  const isWorkspaceMemberInvite = context.access?.isWorkspaceMember === true;
  const isOwnerInvite = context.access?.capabilities.canDeleteTicket === true;
  if (!context.access?.capabilities.canResolve || (!isWorkspaceMemberInvite && !isOwnerInvite)) {
    return apiError({
      code: "FORBIDDEN",
      message: "Only workspace members can invite users",
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

    const inviterId = context.userId?.trim() ?? "";
    if (!inviterId) {
      return apiError({
        code: "UNAUTHORIZED",
        message: "Missing user",
        status: 401,
      });
    }

    await addSessionMember({
      sessionId,
      workspaceId: sessionWorkspaceId,
      userId: existingUser.uid,
      email,
      access,
      actorId: inviterId,
      source: "invite_api",
    });

    const inviterSnap = await adminDb.doc(`users/${inviterId}`).get();
    const inviterData = (inviterSnap.data() ?? {}) as Record<string, unknown>;
    const inviterName = inviterSnap.exists
      ? resolveUserName({
          firstName:
            typeof inviterData.firstName === "string"
              ? inviterData.firstName
              : null,
          lastName:
            typeof inviterData.lastName === "string"
              ? inviterData.lastName
              : null,
          authDisplayName:
            typeof inviterData.authDisplayName === "string"
              ? inviterData.authDisplayName
              : null,
          email:
            typeof inviterData.email === "string" ? inviterData.email : null,
        })
      : "Someone";
    void sendSessionInviteEmail({
      to: email,
      invitedByName: inviterName,
      sessionName: context.session?.title ?? "a session",
      workspaceName: sessionWorkspaceId,
      accessLevel: access,
      sessionUrl: `${APP_URL}/dashboard/${sessionId}`,
    }).catch(() => {});

    // Canonical member row — same shape GET /members produces per item, so the
    // client can reconcile its optimistic row in place without a re-fetch.
    const addedUserSnap = await adminDb.doc(`users/${existingUser.uid}`).get();
    const addedUserData = addedUserSnap.exists ? addedUserSnap.data() : null;
    const avatarUrl =
      (addedUserData?.avatarUrl as string | null | undefined) ??
      (addedUserData?.photoURL as string | null | undefined) ??
      null;

    return apiSuccess({
      type: "member_added",
      item: {
        type: "member" as const,
        id: existingUser.uid,
        email,
        access,
        status: "active" as const,
        avatarUrl,
      },
    });
  }

  const existingInvite = await getInviteByEmail(sessionId, email);

  if (existingInvite) {
    const inviteRef = await adminDb
      .collection(`sessions/${sessionId}/invites`)
      .where("email", "==", email)
      .limit(1)
      .get();

    let updatedStatus: "pending" | "active" = "pending";
    if (!inviteRef.empty) {
      await inviteRef.docs[0].ref.update({
        access,
      });
      const sData = inviteRef.docs[0].data();
      updatedStatus =
        sData.status === "active"
          ? "active"
          : sData.status === "pending"
            ? "pending"
            : "pending";
    }

    return apiSuccess({
      type: "invite_updated",
      item: {
        type: "invite" as const,
        id: email,
        email,
        access,
        status: updatedStatus,
        avatarUrl: null,
      },
    });
  }

  const invitedByUserId = context.userId?.trim() ?? "";
  if (!invitedByUserId) {
    return apiError({
      code: "UNAUTHORIZED",
      message: "Missing user",
      status: 401,
    });
  }

  await createSessionInvite({
    sessionId,
    email,
    access,
    invitedBy: invitedByUserId,
  });

  const workspaceId =
    typeof context.session.workspaceId === "string"
      ? context.session.workspaceId.trim()
      : "";
  if (workspaceId) {
    const sessionTitle = sessionTitleFromSessionRow(context.session);

    // Phase 28.X — the invite doc (createSessionInvite) is already committed
    // above; the response below does not depend on the activity event. Offload
    // it so the invite POST returns without waiting on actor resolution + the
    // activityEvents write. The activity log catches up via the realtime
    // listener. (The invite email is already off-path below.)
    fireAndForget("invite.sent:activityEvent", async () => {
      const actor = await resolveActorForActivityEvent(invitedByUserId);
      await createActivityEvent({
        workspaceId,
        sessionId,
        eventType: "invite.sent",
        actorId: invitedByUserId,
        actorName: actor.actorName,
        actorPhotoURL: actor.actorPhotoURL,
        metadata: { sessionTitle, email, access },
      });
    });

    void (async () => {
      try {
        const inviterSnap2 = await adminDb.doc(`users/${invitedByUserId}`).get();
        const inviterData2 = (inviterSnap2.data() ?? {}) as Record<string, unknown>;
        const inviterName2 = inviterSnap2.exists
          ? resolveUserName({
              firstName:
                typeof inviterData2.firstName === "string"
                  ? inviterData2.firstName
                  : null,
              lastName:
                typeof inviterData2.lastName === "string"
                  ? inviterData2.lastName
                  : null,
              authDisplayName:
                typeof inviterData2.authDisplayName === "string"
                  ? inviterData2.authDisplayName
                  : null,
              email:
                typeof inviterData2.email === "string"
                  ? inviterData2.email
                  : null,
            })
          : "Someone";
        await sendSessionInviteEmail({
          to: email,
          invitedByName: inviterName2,
          sessionName: sessionTitle,
          workspaceName: workspaceId,
          accessLevel: access,
          sessionUrl: `${APP_URL}/dashboard/${sessionId}`,
          requiresAccount: true,
        });
      } catch {
        // email failure must not fail the route
      }
    })();
  }

  // Mirror createSessionInvite's status rule exactly: view-access invites are
  // immediately "active" (link works without acceptance); resolve invites stay
  // "pending" until the invitee accepts.
  const createdStatus: "pending" | "active" =
    access === "view" ? "active" : "pending";

  return apiSuccess({
    type: "invite_created",
    item: {
      type: "invite" as const,
      id: email,
      email,
      access,
      status: createdStatus,
      avatarUrl: null,
    },
  });
}
