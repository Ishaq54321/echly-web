/**
 * Hard reset script for feedback status model.
 *
 * Rules:
 * - Keep only status "open" and "resolved"
 * - Normalize status null/undefined -> "open"
 * - Normalize status "processing" -> "open"
 * - Delete every other status permanently, including "failed"
 *
 * Run: npx tsx scripts/hardDeleteInvalidFeedback.ts
 */
import {
  collection,
  deleteDoc,
  doc,
  documentId,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const PAGE_SIZE = 400;

function isInvalidStatus(status: unknown): boolean {
  if (status == null) return false;
  if (status === "processing") return false;
  if (status === "open" || status === "resolved") return false;
  return true;
}

async function main() {
  let scanned = 0;
  let deleted = 0;
  let normalized = 0;
  let last: QueryDocumentSnapshot | undefined;

  while (true) {
    const q = last
      ? query(
          collection(db, "feedback"),
          orderBy(documentId()),
          startAfter(last),
          limit(PAGE_SIZE)
        )
      : query(collection(db, "feedback"), orderBy(documentId()), limit(PAGE_SIZE));
    const snap = await getDocs(q);
    if (snap.empty) break;

    for (const row of snap.docs) {
      scanned += 1;
      const data = row.data() as Record<string, unknown>;
      const status = data.status;

      if (isInvalidStatus(status) || status === "failed") {
        await deleteDoc(doc(db, "feedback", row.id));
        deleted += 1;
        continue;
      }

      if (status == null || status === "processing") {
        await updateDoc(doc(db, "feedback", row.id), { status: "open" });
        normalized += 1;
      }
    }

    last = snap.docs[snap.docs.length - 1];
    if (snap.size < PAGE_SIZE) break;
  }

  console.log("hardDeleteInvalidFeedback complete");
  console.log(`scanned=${scanned}`);
  console.log(`deleted=${deleted}`);
  console.log(`normalized=${normalized}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
