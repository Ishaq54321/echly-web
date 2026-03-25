import { db } from "@/lib/firebase";
import {
  collection,
  deleteField,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  getCachedCounts,
  setCachedCounts,
} from "@/lib/server/cache/feedbackCountsCache";

export type ResolvedSessionFeedbackCounts = {
  total: number;
  open: number;
  resolved: number;
};

/**
 * Session document counters when consistent; otherwise scans `feedback` and repairs the session doc.
 * Same behavior as GET /api/feedback/counts (including TTL cache).
 */
export async function resolveSessionFeedbackCounts(
  sessionId: string,
  sessionRow: Record<string, unknown>
): Promise<ResolvedSessionFeedbackCounts> {
  const cached = getCachedCounts(sessionId);
  if (cached) {
    return cached;
  }

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
    setCachedCounts(sessionId, data);
    return data;
  }

  let realTotal = 0;
  let realOpen = 0;
  let realResolved = 0;

  const snapshot = await getDocs(
    query(collection(db, "feedback"), where("sessionId", "==", sessionId))
  );

  snapshot.forEach((docSnap) => {
    if (docSnap.data().isDeleted === true) return;
    realTotal++;
    const status = docSnap.data().status;

    if (status === "resolved") realResolved++;
    else realOpen++;
  });

  const sessionRef = doc(db, "sessions", sessionId);
  updateDoc(sessionRef, {
    totalCount: realTotal,
    openCount: realOpen,
    resolvedCount: realResolved,
    skippedCount: deleteField(),
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
  setCachedCounts(sessionId, data);
  return data;
}
