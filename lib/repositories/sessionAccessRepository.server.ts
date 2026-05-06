import "server-only";

import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { sessionAccessDocPath } from "./sessionPaths";

const DELETE_SESSION_ACCESS_BATCH_LIMIT = 500;

/**
 * Idempotent upsert of a sessionAccess mirror doc. Composite key `${userId}_${sessionId}`
 * lets Firestore Security Rules verify membership via `exists()` without a `get()`,
 * unlocking realtime listener access for cross-workspace session-invited users.
 *
 * createdAt is only set when the doc is brand new — merge-true would otherwise overwrite
 * it on every accessLevel change.
 */
export async function writeSessionAccessDoc(params: {
  userId: string;
  sessionId: string;
  workspaceId: string;
  accessLevel: "view" | "resolve";
  addedBy: string;
}): Promise<void> {
  const ref = adminDb.doc(sessionAccessDocPath(params.userId, params.sessionId));
  const snap = await ref.get();
  if (snap.exists) {
    await ref.update({
      accessLevel: params.accessLevel,
      workspaceId: params.workspaceId,
    });
    return;
  }
  await ref.set({
    userId: params.userId,
    sessionId: params.sessionId,
    workspaceId: params.workspaceId,
    accessLevel: params.accessLevel,
    addedBy: params.addedBy,
    createdAt: FieldValue.serverTimestamp(),
  });
}

export async function deleteSessionAccessDoc(params: {
  userId: string;
  sessionId: string;
}): Promise<void> {
  await adminDb
    .doc(sessionAccessDocPath(params.userId, params.sessionId))
    .delete();
}

/**
 * Cascade helper: batch-deletes every sessionAccess doc for a session.
 * Mirrors the chunking pattern in deleteAllFeedbackForSessionRepo /
 * deleteAllCommentsForSessionRepo. Returns deletedCount for logging.
 */
export async function deleteAllSessionAccessForSessionRepo(
  sessionId: string
): Promise<{ deletedCount: number }> {
  const sid = sessionId.trim();
  if (!sid) return { deletedCount: 0 };

  const snapshot = await adminDb
    .collection("sessionAccess")
    .where("sessionId", "==", sid)
    .get();

  if (snapshot.empty) return { deletedCount: 0 };

  const docs = snapshot.docs;
  for (let i = 0; i < docs.length; i += DELETE_SESSION_ACCESS_BATCH_LIMIT) {
    const batch = adminDb.batch();
    docs
      .slice(i, i + DELETE_SESSION_ACCESS_BATCH_LIMIT)
      .forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }

  return { deletedCount: docs.length };
}
