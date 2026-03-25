/**
 * Permanently deletes every feedback document with status === "skipped" and fixes session counters.
 * Run once: npx tsx scripts/deleteSkippedFeedback.ts
 */
import {
  collection,
  doc,
  getDocs,
  increment,
  limit,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const PAGE = 450;

async function hardDeleteSkippedFeedback(feedbackId: string): Promise<boolean> {
  const feedbackRef = doc(db, "feedback", feedbackId);
  const result = await runTransaction(db, async (tx) => {
    const feedbackSnap = await tx.get(feedbackRef);
    if (!feedbackSnap.exists()) return { deleted: false };
    const data = feedbackSnap.data();
    if (data.isDeleted === true) return { deleted: false };
    const status = (data.status as string) ?? "open";
    if (status !== "skipped") return { deleted: false };

    const sessionId = data.sessionId as string;
    const workspaceId = data.workspaceId as string | undefined;
    const sessionRef = doc(db, "sessions", sessionId);
    const sessionSnap = await tx.get(sessionRef);
    const s = sessionSnap.data() || {};
    const openCount = Math.max(0, (s.openCount as number) ?? 0);
    const resolvedCount = Math.max(0, (s.resolvedCount as number) ?? 0);
    const skippedCount = Math.max(
      0,
      ((s.skippedCount as number) ?? 0) - (status === "skipped" ? 1 : 0)
    );
    const currentTotalCount = (s.totalCount as number) ?? 0;
    const totalCountUpdate = currentTotalCount <= 0 ? 0 : increment(-1);
    const feedbackCount = Math.max(0, ((s.feedbackCount as number) ?? 0) - 1);

    tx.delete(feedbackRef);
    tx.update(sessionRef, {
      openCount,
      resolvedCount,
      skippedCount,
      totalCount: totalCountUpdate,
      feedbackCount,
      updatedAt: serverTimestamp(),
    });
    if (workspaceId) {
      tx.update(doc(db, "workspaces", workspaceId), {
        "stats.updatedAt": serverTimestamp(),
      });
    }
    return { deleted: true };
  });
  return result.deleted === true;
}

async function main() {
  let deleted = 0;
  while (true) {
    const snap = await getDocs(
      query(collection(db, "feedback"), where("status", "==", "skipped"), limit(PAGE))
    );
    if (snap.empty) break;
    for (const d of snap.docs) {
      const ok = await hardDeleteSkippedFeedback(d.id);
      if (ok) {
        deleted += 1;
        console.log("deleted", d.id);
      }
    }
    if (snap.size < PAGE) break;
  }
  console.log(`\nDone. Hard-deleted ${deleted} feedback document(s) with status skipped.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
