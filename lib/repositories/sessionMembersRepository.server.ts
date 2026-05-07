import "server-only";

import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { SharedSessionMembership } from "@/lib/domain/session";

import {
  sessionMembersPath,
  sessionMemberDocPath,
  sessionInvitesPath,
} from "./sessionPaths";

import type { SessionMember } from "@/lib/domain/sessionMember";
import type { SessionInvite } from "@/lib/domain/sessionInvite";
import {
  createActivityEvent,
  resolveActorForActivityEvent,
  sessionTitleForActivityEvent,
} from "@/lib/repositories/activityEventsRepository.server";
import { getUserByIdRepo } from "@/lib/repositories/usersRepository.server";
import {
  writeSessionAccessDoc,
  deleteSessionAccessDoc,
} from "@/lib/repositories/sessionAccessRepository.server";
import { composeFullName } from "@/lib/utils/nameSplit";

function userComposedName(u: { firstName?: unknown; lastName?: unknown } | null | undefined): string {
  if (!u) return "";
  return composeFullName(
    typeof u.firstName === "string" ? u.firstName : null,
    typeof u.lastName === "string" ? u.lastName : null
  );
}

export async function getSessionMember(
  sessionId: string,
  userId: string
): Promise<SessionMember | null> {
  const ref = adminDb.doc(sessionMemberDocPath(sessionId, userId));
  const snap = await ref.get();

  if (!snap.exists) return null;

  const data = snap.data()!;

  return {
    userId: data.userId,
    email: data.email,
    access: data.access,
    addedBy: data.addedBy,
    createdAt: data.createdAt?.toDate?.() ?? new Date(0),
  };
}

export async function listSessionMembers(
  sessionId: string
): Promise<SessionMember[]> {
  const ref = adminDb.collection(sessionMembersPath(sessionId));
  const snap = await ref.get();

  return snap.docs.map((doc) => {
    const data = doc.data();

    return {
      userId: data.userId,
      email: data.email,
      access: data.access,
      addedBy: data.addedBy,
      createdAt: data.createdAt?.toDate?.() ?? new Date(0),
    };
  });
}

export type AddSessionMemberSource =
  | "invite_api"
  | "access_request"
  | "invite_redemption";

export type UpdateSessionMemberAccessSource = "access_change_api";
export type RemoveSessionMemberSource = "remove_api" | "leave_self";

export async function addSessionMember(params: {
  sessionId: string;
  workspaceId: string;
  userId: string;
  email: string;
  access: "view" | "resolve";
  /** Authenticated principal responsible for this membership write (inviter, approver, or redeeming user). */
  actorId: string;
  source: AddSessionMemberSource;
}): Promise<void> {
  const actorId = params.actorId.trim();
  if (!actorId) {
    throw new Error("addSessionMember: actorId is required");
  }

  const ref = adminDb.doc(
    sessionMemberDocPath(params.sessionId, params.userId)
  );

  const existing = await getSessionMember(params.sessionId, params.userId);
  if (existing) {
    if (existing.access !== params.access) {
      await ref.update({
        access: params.access,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
    // Always re-assert the sessionAccess mirror so a previously-failed dual-write
    // is recovered on the next member add. Idempotent via get-then-set.
    await writeSessionAccessDoc({
      userId: params.userId,
      sessionId: params.sessionId,
      workspaceId: params.workspaceId,
      accessLevel: params.access,
      addedBy: actorId,
    });
    return;
  }

  await ref.set({
    userId: params.userId,
    email: params.email,
    access: params.access,
    addedBy: actorId,
    createdAt: Timestamp.now(),
  });

  await writeSessionAccessDoc({
    userId: params.userId,
    sessionId: params.sessionId,
    workspaceId: params.workspaceId,
    accessLevel: params.access,
    addedBy: actorId,
  });

  const workspaceId = params.workspaceId.trim();
  if (workspaceId) {
    let targetName: string | null = null;
    if (params.userId) {
      try {
        const targetUser = await getUserByIdRepo(params.userId);
        targetName =
          userComposedName(targetUser) ||
          targetUser?.email?.split("@")[0]?.trim() ||
          null;
      } catch {
        targetName = params.email?.split("@")[0] ?? null;
      }
    }

    const actor = await resolveActorForActivityEvent(actorId);
    const sessionTitle = await sessionTitleForActivityEvent(params.sessionId);
    await createActivityEvent({
      workspaceId,
      sessionId: params.sessionId,
      eventType: "session.member.added",
      actorId,
      actorName: actor.actorName,
      actorPhotoURL: actor.actorPhotoURL,
      metadata: {
        sessionTitle,
        source: params.source,
        targetEmail: params.email ?? null,
        targetUserId: params.userId ?? null,
        targetName,
        accessLevel: params.access ?? null,
      },
    });

    // Notify the recipient that a session has been shared with them.
    // Only fire on direct invites (existing user added via invite UI). Skip
    // invite_redemption (recipient is the actor) and access_request (recipient
    // already gets access_request.approved).
    if (params.source === "invite_api" && params.userId !== actorId) {
      try {
        const { dispatchNotifications } = await import(
          "@/lib/server/notificationFanOut.server"
        );
        await dispatchNotifications({
          recipientIds: [params.userId],
          workspaceId,
          sessionId: params.sessionId,
          sessionTitle: sessionTitle || null,
          type: "session.shared",
          actor: {
            id: actorId,
            name: actor.actorName,
            photoURL: actor.actorPhotoURL ?? null,
          },
          title: `${actor.actorName} shared "${sessionTitle || "a session"}" with you`,
          entityTitle: sessionTitle || null,
          body: null,
        });
      } catch (err) {
        console.error("[NOTIFICATION] session.shared failed:", err);
      }
    }
  }
}

export async function updateSessionMemberAccessRepo(params: {
  sessionId: string;
  userId: string;
  newAccess: "view" | "resolve";
  actorId: string;
  workspaceId: string;
  sessionTitle: string;
  source: UpdateSessionMemberAccessSource;
}): Promise<
  | { ok: true; previousAccess: "view" | "resolve"; targetEmail: string | null }
  | { ok: false; reason: "not_found" }
> {
  const ref = adminDb.doc(
    sessionMemberDocPath(params.sessionId, params.userId)
  );
  const snap = await ref.get();
  if (!snap.exists) return { ok: false, reason: "not_found" };

  const data = snap.data()!;
  const previousAccess: "view" | "resolve" =
    data.access === "resolve" || data.access === "view" ? data.access : "view";
  const targetEmail = typeof data.email === "string" ? data.email : null;

  await ref.update({ access: params.newAccess });

  await writeSessionAccessDoc({
    userId: params.userId,
    sessionId: params.sessionId,
    workspaceId: params.workspaceId,
    accessLevel: params.newAccess,
    addedBy: params.actorId,
  });

  const workspaceId = params.workspaceId.trim();
  const actorId = params.actorId.trim();
  if (workspaceId && actorId) {
    let targetName: string | null = null;
    try {
      const targetUser = await getUserByIdRepo(params.userId);
      targetName =
        userComposedName(targetUser) ||
        targetEmail?.split("@")[0]?.trim() ||
        null;
    } catch {
      targetName = targetEmail?.split("@")[0] ?? null;
    }
    const actor = await resolveActorForActivityEvent(actorId);
    await createActivityEvent({
      workspaceId,
      sessionId: params.sessionId,
      eventType: "session.member.role_changed",
      actorId,
      actorName: actor.actorName,
      actorPhotoURL: actor.actorPhotoURL,
      metadata: {
        sessionTitle: params.sessionTitle,
        previousAccess,
        newAccess: params.newAccess,
        targetUserId: params.userId ?? null,
        targetEmail: targetEmail ?? null,
        targetName,
      },
    });
  }
  return { ok: true, previousAccess, targetEmail };
}

export async function removeSessionMemberRepo(params: {
  sessionId: string;
  userId: string;
  actorId: string;
  workspaceId: string;
  sessionTitle: string;
  source: RemoveSessionMemberSource;
}): Promise<
  | { ok: true; removedEmail: string | null }
  | { ok: false; reason: "not_found" }
> {
  const ref = adminDb.doc(
    sessionMemberDocPath(params.sessionId, params.userId)
  );
  const snap = await ref.get();
  if (!snap.exists) return { ok: false, reason: "not_found" };

  const removedEmail =
    typeof snap.data()?.email === "string"
      ? (snap.data()!.email as string)
      : null;
  await ref.delete();

  await deleteSessionAccessDoc({
    userId: params.userId,
    sessionId: params.sessionId,
  });

  const workspaceId = params.workspaceId.trim();
  const actorId = params.actorId.trim();
  if (workspaceId && actorId) {
    let removedTargetName: string | null = null;
    try {
      const targetUser = await getUserByIdRepo(params.userId);
      removedTargetName =
        userComposedName(targetUser) ||
        removedEmail?.split("@")[0]?.trim() ||
        null;
    } catch {
      removedTargetName = removedEmail?.split("@")[0] ?? null;
    }
    const actor = await resolveActorForActivityEvent(actorId);
    await createActivityEvent({
      workspaceId,
      sessionId: params.sessionId,
      eventType: "session.member.removed",
      actorId,
      actorName: actor.actorName,
      actorPhotoURL: actor.actorPhotoURL,
      metadata: {
        sessionTitle: params.sessionTitle,
        targetUserId: params.userId ?? null,
        targetEmail: removedEmail ?? null,
        targetName: removedTargetName ?? null,
      },
    });
  }
  return { ok: true, removedEmail };
}

export async function getInviteByEmail(
  sessionId: string,
  email: string
): Promise<SessionInvite | null> {
  const ref = adminDb
    .collection(sessionInvitesPath(sessionId))
    .where("email", "==", email)
    .limit(1);

  const snap = await ref.get();

  if (snap.empty) return null;

  const data = snap.docs[0].data();

  return {
    email: data.email,
    access: data.access,
    status: data.status,
    invitedBy: data.invitedBy,
    createdAt: data.createdAt?.toDate?.() ?? new Date(0),
  };
}

export async function createSessionInvite(params: {
  sessionId: string;
  email: string;
  access: "view" | "resolve";
  invitedBy: string;
}) {
  const ref = adminDb.collection(sessionInvitesPath(params.sessionId));

  await ref.add({
    email: params.email,
    access: params.access,
    status: params.access === "view" ? "active" : "pending",
    invitedBy: params.invitedBy,
    createdAt: Timestamp.now(),
  });
}

export async function activateInvite(params: {
  sessionId: string;
  email: string;
}) {
  const ref = adminDb
    .collection(sessionInvitesPath(params.sessionId))
    .where("email", "==", params.email)
    .limit(1);

  const snap = await ref.get();

  if (snap.empty) return;

  const doc = snap.docs[0];

  await doc.ref.update({
    status: "active",
  });
}

// Reads the flat sessionAccess mirror collection (Phase 6b) to find sessions
// the user has been invited to. The legacy collection-group `members.userId`
// query path is retired here; the corresponding fieldOverride in
// firestore.indexes.json is intentionally kept one release cycle for rollback.
//
// Same-workspace memberships are filtered out — this endpoint only surfaces
// CROSS-workspace shares (the Shared with me page).
export async function getSharedSessionMembershipsRepo(
  userId: string,
  userWorkspaceIds: string[]
): Promise<SharedSessionMembership[]> {
  const snap = await adminDb
    .collection("sessionAccess")
    .where("userId", "==", userId)
    .get();

  if (snap.empty) return [];

  const accessDocsBySessionId = new Map<string, FirebaseFirestore.DocumentData>();
  for (const doc of snap.docs) {
    const data = doc.data();
    const sid = typeof data.sessionId === "string" ? data.sessionId.trim() : "";
    if (sid) accessDocsBySessionId.set(sid, data);
  }

  const sessionIds = Array.from(accessDocsBySessionId.keys());

  const sessionSnaps = await Promise.all(
    sessionIds.map((id) => adminDb.collection("sessions").doc(id).get())
  );

  type IncludedSession = {
    sessionId: string;
    sessionDoc: FirebaseFirestore.DocumentData;
    accessData: FirebaseFirestore.DocumentData;
  };

  const included: IncludedSession[] = [];
  for (const sessionSnap of sessionSnaps) {
    if (!sessionSnap.exists) continue;
    const data = sessionSnap.data()!;
    const workspaceId =
      typeof data.workspaceId === "string" ? data.workspaceId.trim() : "";
    if (userWorkspaceIds.includes(workspaceId)) continue;
    const accessData = accessDocsBySessionId.get(sessionSnap.id);
    if (!accessData) continue;
    included.push({ sessionId: sessionSnap.id, sessionDoc: data, accessData });
  }

  if (included.length === 0) return [];

  const workspaceIdSet = new Set<string>();
  const addedBySet = new Set<string>();
  for (const item of included) {
    const wid =
      typeof item.sessionDoc.workspaceId === "string"
        ? item.sessionDoc.workspaceId.trim()
        : "";
    if (wid) workspaceIdSet.add(wid);
    const addedBy =
      typeof item.accessData.addedBy === "string"
        ? item.accessData.addedBy.trim()
        : "";
    if (addedBy) addedBySet.add(addedBy);
  }

  const [workspaceSnaps, userSnaps] = await Promise.all([
    Promise.all(
      Array.from(workspaceIdSet).map((id) =>
        adminDb.doc(`workspaces/${id}`).get()
      )
    ),
    Promise.all(
      Array.from(addedBySet).map((id) => adminDb.doc(`users/${id}`).get())
    ),
  ]);

  const workspaceNameMap = new Map<string, string | null>();
  for (const wSnap of workspaceSnaps) {
    if (wSnap.exists) {
      const d = wSnap.data()!;
      workspaceNameMap.set(
        wSnap.id,
        typeof d.name === "string" ? d.name : null
      );
    } else {
      workspaceNameMap.set(wSnap.id, null);
    }
  }

  const userNameMap = new Map<string, string | null>();
  for (const uSnap of userSnaps) {
    if (uSnap.exists) {
      const d = uSnap.data()!;
      const name =
        typeof d.displayName === "string" && d.displayName.trim()
          ? d.displayName.trim()
          : typeof d.email === "string" && d.email.trim()
            ? d.email.trim()
            : null;
      userNameMap.set(uSnap.id, name);
    } else {
      userNameMap.set(uSnap.id, null);
    }
  }

  const results: SharedSessionMembership[] = included.map(
    ({ sessionId, sessionDoc, accessData }) => {
      const workspaceId =
        typeof sessionDoc.workspaceId === "string"
          ? sessionDoc.workspaceId.trim()
          : "";
      const addedBy =
        typeof accessData.addedBy === "string"
          ? accessData.addedBy.trim()
          : null;
      const rawTs = accessData.createdAt as
        | { seconds: number; nanoseconds: number }
        | null
        | undefined;
      const addedAt =
        rawTs &&
        typeof rawTs.seconds === "number" &&
        typeof rawTs.nanoseconds === "number"
          ? { seconds: rawTs.seconds, nanoseconds: rawTs.nanoseconds }
          : null;

      return {
        sessionId,
        sessionName:
          typeof sessionDoc.title === "string"
            ? sessionDoc.title
            : "Untitled Session",
        workspaceId,
        workspaceName: workspaceNameMap.get(workspaceId) ?? null,
        access: accessData.accessLevel === "resolve" ? "resolve" : "view",
        addedBy: addedBy || null,
        addedByName: addedBy ? (userNameMap.get(addedBy) ?? null) : null,
        addedAt,
        feedbackCount:
          typeof sessionDoc.feedbackCount === "number"
            ? sessionDoc.feedbackCount
            : 0,
        openCount:
          typeof sessionDoc.openCount === "number" ? sessionDoc.openCount : 0,
        resolvedCount:
          typeof sessionDoc.resolvedCount === "number"
            ? sessionDoc.resolvedCount
            : 0,
        generalAccess:
          typeof sessionDoc.generalAccess === "string"
            ? sessionDoc.generalAccess
            : "restricted",
        isArchived:
          sessionDoc.archived === true || sessionDoc.isArchived === true,
      };
    }
  );

  results.sort((a, b) => (b.addedAt?.seconds ?? 0) - (a.addedAt?.seconds ?? 0));

  return results;
}
