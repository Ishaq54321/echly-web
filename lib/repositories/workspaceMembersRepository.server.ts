import "server-only";
import { adminDb, adminBucket } from "@/lib/server/firebaseAdmin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { WorkspaceMember, WorkspaceMemberRole } from "@/lib/domain/workspaceMember";
import type { WorkspaceInvitation, WorkspaceInvitationStatus } from "@/lib/domain/workspaceInvitation";
import { removeWorkspaceMembershipRepo } from "@/lib/repositories/userMembershipsRepository.server";

// ── Helpers ────────────────────────────────────────────────────────────────

function membersCol(workspaceId: string) {
  return adminDb.collection(`workspaces/${workspaceId}/members`);
}

function memberDoc(workspaceId: string, uid: string) {
  return adminDb.doc(`workspaces/${workspaceId}/members/${uid}`);
}

function invitationsCol() {
  return adminDb.collection("workspaceInvitations");
}

function invitationDoc(token: string) {
  return adminDb.doc(`workspaceInvitations/${token}`);
}

function docToMember(uid: string, data: FirebaseFirestore.DocumentData): WorkspaceMember {
  return {
    uid,
    email: data.email ?? "",
    displayName: data.displayName ?? null,
    avatarUrl: data.avatarUrl ?? null,
    role: (data.role as WorkspaceMemberRole) ?? "MEMBER",
    joinedAt: data.joinedAt as Timestamp,
    invitedBy: data.invitedBy ?? null,
  };
}

function docToInvitation(id: string, data: FirebaseFirestore.DocumentData): WorkspaceInvitation {
  return {
    id,
    workspaceId: data.workspaceId ?? "",
    email: data.email ?? "",
    role: (data.role as WorkspaceMemberRole) ?? "MEMBER",
    status: (data.status as WorkspaceInvitationStatus) ?? "pending",
    invitedBy: data.invitedBy ?? "",
    invitedByName: data.invitedByName ?? "",
    workspaceName: data.workspaceName ?? "",
    expiresAt: data.expiresAt as Timestamp,
    createdAt: data.createdAt as Timestamp,
    acceptedAt: data.acceptedAt ?? null,
    acceptedBy: data.acceptedBy ?? null,
    reminderSentAt: data.reminderSentAt ?? null,
  };
}

// ── Members ────────────────────────────────────────────────────────────────

export async function addWorkspaceMemberRepo(
  workspaceId: string,
  member: WorkspaceMember
): Promise<void> {
  const batch = adminDb.batch();
  batch.set(memberDoc(workspaceId, member.uid), {
    uid: member.uid,
    email: member.email,
    displayName: member.displayName,
    avatarUrl: member.avatarUrl,
    role: member.role,
    joinedAt: member.joinedAt ?? FieldValue.serverTimestamp(),
    invitedBy: member.invitedBy,
  });
  batch.update(adminDb.doc(`workspaces/${workspaceId}`), {
    "usage.members": FieldValue.increment(1),
  });
  await batch.commit();
}

export async function getWorkspaceMembersRepo(
  workspaceId: string
): Promise<WorkspaceMember[]> {
  const snap = await membersCol(workspaceId).get();
  return snap.docs.map((d) => docToMember(d.id, d.data()));
}

export async function getWorkspaceMemberRepo(
  workspaceId: string,
  uid: string
): Promise<WorkspaceMember | null> {
  const snap = await memberDoc(workspaceId, uid).get();
  if (!snap.exists) return null;
  return docToMember(snap.id, snap.data() as FirebaseFirestore.DocumentData);
}

export async function updateWorkspaceMemberRoleRepo(
  workspaceId: string,
  uid: string,
  role: WorkspaceMemberRole
): Promise<void> {
  await memberDoc(workspaceId, uid).update({ role });
}

export async function removeWorkspaceMemberRepo(
  workspaceId: string,
  uid: string
): Promise<void> {
  const batch = adminDb.batch();
  batch.delete(memberDoc(workspaceId, uid));
  batch.update(adminDb.doc(`workspaces/${workspaceId}`), {
    "usage.members": FieldValue.increment(-1),
  });
  await batch.commit();
  await removeWorkspaceMembershipRepo(uid, workspaceId);

  // BUG-3: cascade sessionAccess + per-session member mirror docs so the
  // removed user no longer appears in session member lists or receives
  // session-scoped notifications.
  try {
    const sessionAccessSnap = await adminDb
      .collection("sessionAccess")
      .where("userId", "==", uid)
      .where("workspaceId", "==", workspaceId)
      .get();

    if (!sessionAccessSnap.empty) {
      const docs = sessionAccessSnap.docs;
      for (let i = 0; i < docs.length; i += 500) {
        const cleanupBatch = adminDb.batch();
        for (const doc of docs.slice(i, i + 500)) {
          cleanupBatch.delete(doc.ref);
          const sid = doc.data().sessionId;
          if (typeof sid === "string" && sid) {
            cleanupBatch.delete(adminDb.doc(`sessions/${sid}/members/${uid}`));
          }
        }
        await cleanupBatch.commit();
      }
    }
  } catch (err) {
    console.error(
      `[removeWorkspaceMemberRepo] sessionAccess cleanup failed for uid=${uid} ws=${workspaceId}:`,
      err
    );
  }
}

// ── Invitations ────────────────────────────────────────────────────────────

export async function createWorkspaceInvitationRepo(
  invitation: WorkspaceInvitation
): Promise<void> {
  const { id, ...data } = invitation;
  await invitationDoc(id).set({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
  });
}

export async function getWorkspaceInvitationRepo(
  token: string
): Promise<WorkspaceInvitation | null> {
  const snap = await invitationDoc(token).get();
  if (!snap.exists) return null;
  return docToInvitation(snap.id, snap.data() as FirebaseFirestore.DocumentData);
}

export async function getWorkspacePendingInvitationsRepo(
  workspaceId: string
): Promise<WorkspaceInvitation[]> {
  const snap = await invitationsCol()
    .where("workspaceId", "==", workspaceId)
    .where("status", "==", "pending")
    .get();
  return snap.docs.map((d) => docToInvitation(d.id, d.data()));
}

export async function getWorkspaceInvitationByEmailRepo(
  workspaceId: string,
  email: string
): Promise<WorkspaceInvitation | null> {
  const snap = await invitationsCol()
    .where("workspaceId", "==", workspaceId)
    .where("email", "==", email.toLowerCase())
    .where("status", "==", "pending")
    .limit(1)
    .get();
  if (snap.empty) return null;
  const d = snap.docs[0];
  return docToInvitation(d.id, d.data());
}

export async function updateWorkspaceInvitationRepo(
  token: string,
  updates: Partial<
    Pick<
      WorkspaceInvitation,
      "status" | "acceptedAt" | "acceptedBy" | "reminderSentAt"
    >
  >
): Promise<void> {
  await invitationDoc(token).update(updates as Record<string, unknown>);
}

export async function revokeWorkspaceInvitationRepo(
  token: string
): Promise<void> {
  await invitationDoc(token).update({ status: "revoked" });
}

// ── Ownership ──────────────────────────────────────────────────────────────

export async function transferWorkspaceOwnershipRepo(
  workspaceId: string,
  currentOwnerId: string,
  newOwnerId: string
): Promise<void> {
  const batch = adminDb.batch();
  batch.update(memberDoc(workspaceId, currentOwnerId), { role: "MEMBER" });
  batch.update(memberDoc(workspaceId, newOwnerId), { role: "OWNER" });
  batch.update(adminDb.doc(`workspaces/${workspaceId}`), {
    ownerId: newOwnerId,
    updatedAt: FieldValue.serverTimestamp(),
  });
  await batch.commit();
}

// ── Soft delete ────────────────────────────────────────────────────────────

export async function softDeleteWorkspaceRepo(
  workspaceId: string,
  deletedBy: string
): Promise<void> {
  const now = Timestamp.now();
  const purge = new Date(now.toMillis() + 30 * 24 * 60 * 60 * 1000);
  await adminDb.doc(`workspaces/${workspaceId}`).update({
    deletedAt: now,
    deletedBy,
    deleteScheduledPurgeAt: Timestamp.fromDate(purge),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function restoreWorkspaceRepo(
  workspaceId: string
): Promise<void> {
  await adminDb.doc(`workspaces/${workspaceId}`).update({
    deletedAt: null,
    deletedBy: null,
    deleteScheduledPurgeAt: null,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

// ── Hard purge ─────────────────────────────────────────────────────────────

async function batchDelete(docs: FirebaseFirestore.QueryDocumentSnapshot[]): Promise<void> {
  const CHUNK = 500;
  for (let i = 0; i < docs.length; i += CHUNK) {
    const batch = adminDb.batch();
    for (const doc of docs.slice(i, i + CHUNK)) {
      batch.delete(doc.ref);
    }
    await batch.commit();
  }
}

/**
 * Hard-purge a workspace and ALL its data.
 * Called only after 30-day soft-delete window.
 * Order: feedback+comments → sessions → invitations → members → workspace doc
 */
export async function purgeWorkspaceRepo(
  workspaceId: string
): Promise<{ sessionsDeleted: number; feedbackDeleted: number }> {
  const { deleteAllFeedbackForSessionRepo } = await import(
    "@/lib/repositories/feedbackRepository.server"
  );

  let sessionsDeleted = 0;
  let feedbackDeleted = 0;

  try {
    const sessionsSnap = await adminDb
      .collection("sessions")
      .where("workspaceId", "==", workspaceId)
      .get();

    for (const sessionDoc of sessionsSnap.docs) {
      const sid = sessionDoc.id;
      try {
        const count = await deleteAllFeedbackForSessionRepo(sid);
        feedbackDeleted += count;
      } catch (err) {
        console.error(`[PURGE] deleteAllFeedbackForSessionRepo failed for session ${sid}:`, err);
      }

      for (const sub of ["members", "invites", "accessRequests"] as const) {
        try {
          const subSnap = await adminDb.collection(`sessions/${sid}/${sub}`).get();
          await batchDelete(subSnap.docs);
        } catch (err) {
          console.error(`[PURGE] deleting sessions/${sid}/${sub} failed:`, err);
        }
      }

      try {
        await adminDb.doc(`sessions/${sid}`).delete();
        sessionsDeleted++;
      } catch (err) {
        console.error(`[PURGE] deleting session doc ${sid} failed:`, err);
      }
    }
  } catch (err) {
    console.error(`[PURGE] sessions query failed for workspace ${workspaceId}:`, err);
  }

  try {
    const invSnap = await adminDb
      .collection("workspaceInvitations")
      .where("workspaceId", "==", workspaceId)
      .get();
    await batchDelete(invSnap.docs);
  } catch (err) {
    console.error(`[PURGE] deleting invitations failed for workspace ${workspaceId}:`, err);
  }

  for (const collection of ["comments", "activityEvents", "notifications", "sessionAccess"] as const) {
    try {
      const snap = await adminDb
        .collection(collection)
        .where("workspaceId", "==", workspaceId)
        .get();
      await batchDelete(snap.docs);
    } catch (err) {
      console.error(`[PURGE] deleting ${collection} failed for workspace ${workspaceId}:`, err);
    }
  }

  try {
    await adminBucket.deleteFiles({ prefix: `workspaces/${workspaceId}/` });
  } catch (err) {
    console.error(`[PURGE] deleting storage files failed for workspace ${workspaceId}:`, err);
  }

  try {
    const membersSnap = await adminDb
      .collection(`workspaces/${workspaceId}/members`)
      .get();
    await batchDelete(membersSnap.docs);
  } catch (err) {
    console.error(`[PURGE] deleting members subcollection failed for workspace ${workspaceId}:`, err);
  }

  try {
    await adminDb.doc(`workspaces/${workspaceId}`).delete();
  } catch (err) {
    console.error(`[PURGE] deleting workspace doc ${workspaceId} failed:`, err);
  }

  return { sessionsDeleted, feedbackDeleted };
}
