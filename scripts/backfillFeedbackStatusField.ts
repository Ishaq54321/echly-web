/**
 * One-time backfill: set Firestore `status` on feedback docs where it is missing or null.
 * `where("status", "in", ["open", null])` does not match documents with no `status` field.
 *
 * Run: npx tsx scripts/backfillFeedbackStatusField.ts
 *
 * Rules:
 * - isDeleted === true → skip
 * - status already a non-empty string → skip
 * - isResolved === true or legacy resolved-ish → "resolved"
 * - else → "open"
 */
import {
  collection,
  documentId,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  doc,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const PAGE = 400;

function inferStatus(data: Record<string, unknown>): "open" | "resolved" | null {
  const raw = data.status;
  if (typeof raw === "string" && raw.trim() !== "") return null;

  if (data.isResolved === true) return "resolved";
  const s = typeof raw === "string" ? raw : "";
  if (s === "resolved" || s === "done") return "resolved";

  return "open";
}

async function main() {
  let updated = 0;
  let scanned = 0;
  let last: QueryDocumentSnapshot | undefined;

  while (true) {
    const q = last
      ? query(collection(db, "feedback"), orderBy(documentId()), startAfter(last), limit(PAGE))
      : query(collection(db, "feedback"), orderBy(documentId()), limit(PAGE));

    const snap = await getDocs(q);
    if (snap.empty) break;

    for (const d of snap.docs) {
      scanned += 1;
      const data = d.data() as Record<string, unknown>;
      if (data.isDeleted === true) continue;

      const next = inferStatus(data);
      if (next === null) continue;

      await updateDoc(doc(db, "feedback", d.id), { status: next });
      updated += 1;
      console.log("updated", d.id, "→", next);
    }

    last = snap.docs[snap.docs.length - 1];
    if (snap.size < PAGE) break;
  }

  console.log(`\nDone. Scanned ${scanned} doc(s), wrote status on ${updated}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
