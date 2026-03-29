import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository.server";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";

/** Firestore batch write limit. We leave one slot for the session update. */
const BATCH_SIZE = 499;

/**
 * Resolves all open feedback in a session. Internal utility only (not exposed to UI).
 * - Verifies session workspace matches the user's workspaceId
 * - Processes in batches to respect Firestore limits
 * - Updates session denormalized counters (openCount, resolvedCount, updatedAt)
 * - Does not depend on pre-loaded feedback
 */
export async function resolveAllOpenFeedbackInSession(
  sessionId: string,
  userId: string
): Promise<{ resolved: number }> {
  const session = await getSessionByIdRepo(sessionId);
  const wid = await getUserWorkspaceIdRepo(userId);
  if (!session || session.workspaceId !== wid) {
    throw new Error("Session not found or forbidden");
  }

  const feedbackRef = adminDb.collection("feedback");
  const sessionRef = adminDb.doc(`sessions/${sessionId}`);
  let totalResolved = 0;

  for (;;) {
    const sessionSnap = await getSessionByIdRepo(sessionId);
    if (!sessionSnap) break;
    const openCount = sessionSnap.openCount ?? 0;
    const resolvedCount = sessionSnap.resolvedCount ?? 0;

    const snapshot = await feedbackRef
      .where("sessionId", "==", sessionId)
      .where("status", "==", "open")
      .limit(BATCH_SIZE)
      .get();
    const docs = snapshot.docs;
    if (docs.length === 0) break;

    const batch = adminDb.batch();
    for (const d of docs) {
      batch.update(d.ref, { status: "resolved" });
    }
    const n = docs.length;
    const newOpenCount = Math.max(0, openCount - n);
    const newResolvedCount = Math.max(0, resolvedCount + n);
    const newTotal = newOpenCount + newResolvedCount;
    batch.update(sessionRef, {
      openCount: newOpenCount,
      resolvedCount: newResolvedCount,
      totalCount: newTotal,
      feedbackCount: newTotal,
      skippedCount: FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    await batch.commit();
    totalResolved += n;

    if (docs.length < BATCH_SIZE) break;
  }

  return { resolved: totalResolved };
}
