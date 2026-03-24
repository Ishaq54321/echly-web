import { db } from "@/lib/firebase";
import {
  collection,
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
  skipped: number;
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
  const skipped = (sessionRow.skippedCount as number) ?? 0;
  const isConsistent = total === open + resolved + skipped;

  if (isConsistent) {
    const data: ResolvedSessionFeedbackCounts = {
      total,
      open,
      resolved,
      skipped,
    };
    setCachedCounts(sessionId, data);
    return data;
  }

  let realTotal = 0;
  let realOpen = 0;
  let realResolved = 0;
  let realSkipped = 0;

  const snapshot = await getDocs(
    query(collection(db, "feedback"), where("sessionId", "==", sessionId))
  );

  snapshot.forEach((docSnap) => {
    if (docSnap.data().isDeleted === true) return;
    realTotal++;
    const status = docSnap.data().status;

    if (status === "open") realOpen++;
    else if (status === "resolved") realResolved++;
    else if (status === "skipped") realSkipped++;
  });

  const sessionRef = doc(db, "sessions", sessionId);
  updateDoc(sessionRef, {
    totalCount: realTotal,
    openCount: realOpen,
    resolvedCount: realResolved,
    skippedCount: realSkipped,
  }).catch(() => {});

  console.warn("[ECHLY COUNT FALLBACK USED]", {
    sessionId,
    before: { total, open, resolved, skipped },
    after: {
      total: realTotal,
      open: realOpen,
      resolved: realResolved,
      skipped: realSkipped,
    },
  });

  const data: ResolvedSessionFeedbackCounts = {
    total: realTotal,
    open: realOpen,
    resolved: realResolved,
    skipped: realSkipped,
  };
  setCachedCounts(sessionId, data);
  return data;
}
