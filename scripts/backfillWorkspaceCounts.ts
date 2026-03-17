/**
 * Backfill sessionCount and archivedCount for ALL existing workspaces.
 * Run once so the app stops using getWorkspaceSessionCountRepo fallback queries.
 *
 * Usage: npx tsx scripts/backfillWorkspaceCounts.ts
 * DO NOT run repeatedly.
 */

import {
  collection,
  doc,
  getCountFromServer,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

async function main() {
  const workspacesSnap = await getDocs(collection(db, "workspaces"));
  const sessionsRef = collection(db, "sessions");

  console.log(`Backfilling ${workspacesSnap.docs.length} workspace(s)...\n`);

  for (const workspaceDoc of workspacesSnap.docs) {
    const workspaceId = workspaceDoc.id;

    const [totalSnap, archivedSnap] = await Promise.all([
      getCountFromServer(
        query(sessionsRef, where("workspaceId", "==", workspaceId))
      ),
      getCountFromServer(
        query(
          sessionsRef,
          where("workspaceId", "==", workspaceId),
          where("archived", "==", true)
        )
      ),
    ]);

    const total = totalSnap.data().count;
    const archived = archivedSnap.data().count;

    const workspaceRef = doc(db, "workspaces", workspaceId);
    await updateDoc(workspaceRef, {
      sessionCount: total,
      archivedCount: archived,
    });

    console.log(workspaceId, total, archived);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
