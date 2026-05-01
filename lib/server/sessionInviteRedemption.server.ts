import "server-only";

import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository.server";
import {
  activateInvite,
  addSessionMember,
  getInviteByEmail,
  getSessionMember,
} from "@/lib/repositories/sessionMembersRepository.server";
import {
  createActivityEvent,
  resolveActorForActivityEvent,
  sessionTitleFromSessionRow,
} from "@/lib/repositories/activityEventsRepository.server";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { assert } from "@/lib/utils/assert";
import { fireAndForget } from "@/lib/server/fireAndForget";
import { dispatchNotifications } from "@/lib/server/notificationFanOut.server";

export type RedeemSessionInviteOutcome =
  | "session_not_found"
  | "no_user_email"
  | "no_invite"
  | "skipped_workspace_member"
  | "noop_already_member"
  | "invite_marked_active"
  | "redeemed";

export type RedeemSessionInviteResult = {
  outcome: RedeemSessionInviteOutcome;
  /** True when this call performed at least one Firestore write (member add, activity, or invite update). */
  wrote: boolean;
};

/**
 * Idempotent invite redemption for an authenticated user.
 * Must NOT be called from {@link getAccessContext}; use POST /api/invite/activate (or tests) instead.
 */
export async function redeemSessionInviteForUser(params: {
  sessionId: string;
  userId: string;
}): Promise<RedeemSessionInviteResult> {
  const sid = params.sessionId.trim();
  const userId = params.userId.trim();
  if (!sid || !userId) {
    return { outcome: "session_not_found", wrote: false };
  }

  const session = await getSessionByIdRepo(sid);
  if (!session) {
    return { outcome: "session_not_found", wrote: false };
  }

  const userSnap = await adminDb.doc(`users/${userId}`).get();
  const userData = userSnap.data();
  const userEmail =
    typeof userData?.email === "string" && userData.email.trim() !== ""
      ? userData.email.trim()
      : null;
  if (!userEmail) {
    return { outcome: "no_user_email", wrote: false };
  }

  const userWorkspaceId = (await getUserWorkspaceIdRepo(userId)).trim();
  const sessionWorkspaceId = session.workspaceId.trim();

  const isWorkspaceMember =
    Boolean(userWorkspaceId) &&
    Boolean(sessionWorkspaceId) &&
    userWorkspaceId === sessionWorkspaceId;

  let member = await getSessionMember(sid, userId);
  let invite = await getInviteByEmail(sid, userEmail);

  if (isWorkspaceMember && invite != null) {
    return { outcome: "skipped_workspace_member", wrote: false };
  }

  if (invite == null) {
    if (member) {
      return { outcome: "noop_already_member", wrote: false };
    }
    return { outcome: "no_invite", wrote: false };
  }

  if (member) {
    if (invite.status !== "active") {
      await activateInvite({ sessionId: sid, email: userEmail });
      return { outcome: "invite_marked_active", wrote: true };
    }
    return { outcome: "noop_already_member", wrote: false };
  }

  assert(invite != null, "redeem: invite");
  const redeemerId = userId;

  const existingAfterRace = await getSessionMember(sid, redeemerId);
  let wrote = false;
  if (existingAfterRace) {
    member = existingAfterRace;
  } else {
    await addSessionMember({
      sessionId: sid,
      workspaceId: sessionWorkspaceId,
      userId: redeemerId,
      email: userEmail,
      access: invite.access,
      actorId: redeemerId,
      source: "invite_redemption",
    });
    wrote = true;

    const workspaceId = sessionWorkspaceId;
    const existingAcceptedEvent = await adminDb
      .collection("workspaces")
      .doc(workspaceId)
      .collection("activityEvents")
      .where("eventType", "==", "invite.accepted")
      .where("sessionId", "==", sid)
      .where("actor.id", "==", redeemerId)
      .limit(1)
      .get();

    if (existingAcceptedEvent.empty) {
      const actor = await resolveActorForActivityEvent(redeemerId);
      const sessionTitle = sessionTitleFromSessionRow(session);
      await createActivityEvent({
        workspaceId,
        sessionId: sid,
        eventType: "invite.accepted",
        actorId: redeemerId,
        actorName: actor.actorName,
        actorPhotoURL: actor.actorPhotoURL,
        metadata: { sessionTitle },
      });

      const inviterId =
        typeof invite.invitedBy === "string" ? invite.invitedBy.trim() : "";
      if (inviterId && inviterId !== redeemerId) {
        fireAndForget("notification:invite.accepted", async () => {
          await dispatchNotifications({
            recipientIds: [inviterId],
            workspaceId,
            sessionId: sid,
            sessionTitle: sessionTitle || null,
            type: "invite.accepted",
            actor: {
              id: redeemerId,
              name: actor.actorName,
              photoURL: actor.actorPhotoURL ?? null,
            },
            title: `${actor.actorName} joined "${sessionTitle || "your session"}"`,
            entityTitle: sessionTitle || null,
            body: null,
          });
        });
      }
    }
    await getSessionMember(sid, redeemerId);
  }

  if (invite.status !== "active") {
    await activateInvite({
      sessionId: sid,
      email: userEmail,
    });
    wrote = true;
  }

  return { outcome: "redeemed", wrote };
}
