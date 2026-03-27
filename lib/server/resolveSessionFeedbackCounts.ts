import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export type ResolvedSessionFeedbackCounts = {
  total: number;
  open: number;
  resolved: number;
};

/**
 * Session document counters when consistent; otherwise scans `feedback` and repairs the session doc.
 */
export async function resolveSessionFeedbackCounts(
  sessionId: string,
  workspaceId: string,
  sessionRow: Record<string, unknown>
): Promise<ResolvedSessionFeedbackCounts> {
  const total = (sessionRow.totalCount as number) ?? 0;
  const open = (sessionRow.openCount as number) ?? 0;
  const resolved = (sessionRow.resolvedCount as number) ?? 0;
  const isConsistent = total === open + resolved;

  if (isConsistent) {
    const data: ResolvedSessionFeedbackCounts = {
      total,
      open,
      resolved,
    };
    return data;
  }

  let realTotal = 0;
  let realOpen = 0;
  let realResolved = 0;

  const snapshot = await adminDb
    .collection("feedback")
    .where("sessionId", "==", sessionId)
    .where("workspaceId", "==", workspaceId)
    .get();

  snapshot.forEach((docSnap) => {
    if (docSnap.data().isDeleted === true) return;
    const status = docSnap.data().status;
    if (status === "open") {
      realOpen++;
      realTotal++;
      return;
    }
    if (status === "resolved") {
      realResolved++;
      realTotal++;
    }
  });

  const sessionRef = adminDb.doc(`sessions/${sessionId}`);
  sessionRef.update({
    totalCount: realTotal,
    openCount: realOpen,
    resolvedCount: realResolved,
    skippedCount: FieldValue.delete(),
  }).catch(() => {});

  console.warn("[ECHLY COUNT FALLBACK USED]", {
    sessionId,
    before: { total, open, resolved },
    after: {
      total: realTotal,
      open: realOpen,
      resolved: realResolved,
    },
  });

  const data: ResolvedSessionFeedbackCounts = {
    total: realTotal,
    open: realOpen,
    resolved: realResolved,
  };
  return data;
}
