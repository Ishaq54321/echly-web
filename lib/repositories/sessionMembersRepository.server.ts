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
    return;
  }

  await ref.set({
    userId: params.userId,
    email: params.email,
    access: params.access,
    addedBy: actorId,
    createdAt: Timestamp.now(),
  });

  const workspaceId = params.workspaceId.trim();
  if (workspaceId) {
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
      },
    });
  }
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

// IMPORTANT: This query requires a Firestore
// collectionGroup index on the 'members' subcollection.
// Index is defined in firestore.indexes.json.
// If you see "requires an index" error, run:
// firebase deploy --only firestore:indexes
// OR click the link in the Firebase console error.
//
// REQUIRES Firestore index:
// Collection group: members
// Fields: userId ASC, __name__ ASC
// Deploy with: firebase deploy --only firestore:indexes
export async function getSharedSessionMembershipsRepo(
  userId: string,
  userWorkspaceIds: string[]
): Promise<SharedSessionMembership[]> {
  let snap: FirebaseFirestore.QuerySnapshot;
  try {
    snap = await adminDb
      .collectionGroup("members")
      .where("userId", "==", userId)
      .get();
  } catch (err: unknown) {
    const error = err as { message?: string; details?: string };
    console.error("=== FIRESTORE INDEX URL ===");
    console.error("Message:", error?.message);
    console.error("Details:", error?.details);
    console.error(JSON.stringify(err, null, 2));
    console.error("===========================");
    throw err;
  }

  if (snap.empty) return [];

  // Extract sessionIds from paths: sessions/{sessionId}/members/{userId}
  const memberDocsBySessionId = new Map<string, FirebaseFirestore.DocumentData>();
  for (const doc of snap.docs) {
    const sessionId = doc.ref.parent.parent?.id;
    if (sessionId) {
      memberDocsBySessionId.set(sessionId, doc.data());
    }
  }

  const sessionIds = Array.from(memberDocsBySessionId.keys());

  const sessionSnaps = await Promise.all(
    sessionIds.map((id) => adminDb.collection("sessions").doc(id).get())
  );

  type IncludedSession = {
    sessionId: string;
    sessionDoc: FirebaseFirestore.DocumentData;
    memberData: FirebaseFirestore.DocumentData;
  };

  const included: IncludedSession[] = [];
  for (const sessionSnap of sessionSnaps) {
    if (!sessionSnap.exists) continue;
    const data = sessionSnap.data()!;
    const workspaceId =
      typeof data.workspaceId === "string" ? data.workspaceId.trim() : "";
    if (userWorkspaceIds.includes(workspaceId)) continue;
    const memberData = memberDocsBySessionId.get(sessionSnap.id);
    if (!memberData) continue;
    included.push({ sessionId: sessionSnap.id, sessionDoc: data, memberData });
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
      typeof item.memberData.addedBy === "string"
        ? item.memberData.addedBy.trim()
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
    ({ sessionId, sessionDoc, memberData }) => {
      const workspaceId =
        typeof sessionDoc.workspaceId === "string"
          ? sessionDoc.workspaceId.trim()
          : "";
      const addedBy =
        typeof memberData.addedBy === "string"
          ? memberData.addedBy.trim()
          : null;
      const rawTs = memberData.createdAt as
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
        access: memberData.access === "resolve" ? "resolve" : "view",
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
