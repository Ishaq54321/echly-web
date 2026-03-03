import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository";

/** Firestore batch write limit. We leave one slot for the session update. */
const BATCH_SIZE = 499;

/**
 * Resolves all open feedback in a session. Internal utility only (not exposed to UI).
 * - Verifies session ownership (userId)
 * - Processes in batches to respect Firestore limits
 * - Updates session denormalized counters (openCount, resolvedCount, updatedAt)
 * - Does not depend on pre-loaded feedback
 */
export async function resolveAllOpenFeedbackInSession(
  sessionId: string,
  userId: string
): Promise<{ resolved: number }> {
  const session = await getSessionByIdRepo(sessionId);
  if (!session || session.userId !== userId) {
    throw new Error("Session not found or forbidden");
  }

  const feedbackRef = collection(db, "feedback");
  const sessionRef = doc(db, "sessions", sessionId);
  let totalResolved = 0;

  for (;;) {
    const sessionSnap = await getSessionByIdRepo(sessionId);
    if (!sessionSnap) break;
    const openCount = sessionSnap.openCount ?? 0;
    const resolvedCount = sessionSnap.resolvedCount ?? 0;

    const q = query(
      feedbackRef,
      where("sessionId", "==", sessionId),
      where("status", "==", "open"),
      limit(BATCH_SIZE)
    );
    const snapshot = await getDocs(q);
    const docs = snapshot.docs;
    if (docs.length === 0) break;

    const batch = writeBatch(db);
    for (const d of docs) {
      batch.update(d.ref, { status: "resolved" });
    }
    const n = docs.length;
    batch.update(sessionRef, {
      openCount: Math.max(0, openCount - n),
      resolvedCount: resolvedCount + n,
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
    totalResolved += n;

    if (docs.length < BATCH_SIZE) break;
  }

  return { resolved: totalResolved };
}
