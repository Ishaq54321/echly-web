/**
 * One-time backfill of workspace.stats for existing workspaces.
 * Run after deploying pre-aggregated insights so /api/insights returns correct counts.
 *
 * Usage: npx tsx scripts/backfillWorkspaceStats.ts
 */

import {
  collection,
  doc,
  getCountFromServer,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

async function main() {
  const workspacesSnap = await getDocs(collection(db, "workspaces"));
  const feedbackRef = collection(db, "feedback");
  const commentsRef = collection(db, "comments");
  const sessionsRef = collection(db, "sessions");

  console.log(`Backfilling workspace.stats for ${workspacesSnap.docs.length} workspace(s)...\n`);

  for (const workspaceDoc of workspacesSnap.docs) {
    const workspaceId = workspaceDoc.id;

    const [feedbackSnap, commentsSnap, sessionsSnap] = await Promise.all([
      getCountFromServer(
        query(feedbackRef, where("workspaceId", "==", workspaceId))
      ),
      getCountFromServer(
        query(commentsRef, where("workspaceId", "==", workspaceId))
      ),
      getCountFromServer(
        query(sessionsRef, where("workspaceId", "==", workspaceId))
      ),
    ]);

    const totalFeedback = feedbackSnap.data().count;
    const totalComments = commentsSnap.data().count;
    const totalSessions = sessionsSnap.data().count;

    const workspaceRef = doc(db, "workspaces", workspaceId);
    await updateDoc(workspaceRef, {
      stats: {
        totalFeedback,
        totalComments,
        totalSessions,
        last30DaysFeedback: 0,
        last30DaysComments: 0,
        last30DaysSessions: 0,
        updatedAt: serverTimestamp(),
      },
    });

    console.log(workspaceId, { totalFeedback, totalComments, totalSessions });
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
