/**
 * One-time backfill: recompute workspace.stats.totalFeedback from the feedback collection.
 *
 * Usage: npx tsx scripts/backfillWorkspaceTotalFeedback.ts
 *
 * Notes:
 * - Only updates workspace.stats.totalFeedback + workspace.stats.updatedAt
 * - Does NOT touch other stats fields
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
  const feedbackColl = collection(db, "feedback");

  console.log(
    `Backfilling stats.totalFeedback for ${workspacesSnap.docs.length} workspace(s)...\n`
  );

  for (const workspaceDoc of workspacesSnap.docs) {
    const workspaceId = workspaceDoc.id;
    const countSnap = await getCountFromServer(
      query(feedbackColl, where("workspaceId", "==", workspaceId))
    );
    const totalFeedback = countSnap.data().count;

    const workspaceRef = doc(db, "workspaces", workspaceId);
    await updateDoc(workspaceRef, {
      "stats.totalFeedback": totalFeedback,
      "stats.updatedAt": serverTimestamp(),
    });

    console.log(workspaceId, { totalFeedback });
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

