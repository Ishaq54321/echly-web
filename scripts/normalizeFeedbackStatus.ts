/**
 * One-time: normalize every feedback doc to status "open" | "resolved" only.
 * Skips isDeleted === true (excluded from counts).
 *
 * Run: npx tsx scripts/normalizeFeedbackStatus.ts
 * Dry run: npx tsx scripts/normalizeFeedbackStatus.ts --dry-run
 */
import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldPath, FieldValue } from "firebase-admin/firestore";

const DRY_RUN = process.argv.includes("--dry-run");
const PAGE = 400;

function targetStatus(data: FirebaseFirestore.DocumentData): "open" | "resolved" {
  const raw = typeof data.status === "string" ? data.status.trim() : "";
  const s = raw.toLowerCase();
  if (s === "processing" || s === "skipped") return "open";
  if (s === "resolved" || s === "done") return "resolved";
  if (s === "open") return "open";
  if (raw !== "") return "open";
  if (data.isResolved === true) return "resolved";
  return "open";
}

function buildPatch(
  data: FirebaseFirestore.DocumentData
): Record<string, unknown> | null {
  if (data.isDeleted === true) return null;
  const desired = targetStatus(data);
  const patch: Record<string, unknown> = {};
  const st = typeof data.status === "string" ? data.status : "";
  if (st !== desired) {
    patch.status = desired;
  }
  if (Object.prototype.hasOwnProperty.call(data, "isResolved")) {
    patch.isResolved = FieldValue.delete();
  }
  if (Object.keys(patch).length === 0) return null;
  return patch;
}

async function main(): Promise<void> {
  let scanned = 0;
  let fixed = 0;
  const anomalies: string[] = [];

  let last: FirebaseFirestore.QueryDocumentSnapshot | undefined;

  while (true) {
    const q = last
      ? adminDb
          .collection("feedback")
          .orderBy(FieldPath.documentId())
          .startAfter(last.id)
          .limit(PAGE)
      : adminDb.collection("feedback").orderBy(FieldPath.documentId()).limit(PAGE);

    const snap = await q.get();
    if (snap.empty) break;

    const batch = adminDb.batch();
    let batchOps = 0;

    for (const docSnap of snap.docs) {
      scanned += 1;
      const data = docSnap.data();
      const raw = typeof data.status === "string" ? data.status : "";
      if (
        raw &&
        raw.toLowerCase() !== "open" &&
        raw.toLowerCase() !== "resolved" &&
        raw.toLowerCase() !== "processing" &&
        raw.toLowerCase() !== "skipped" &&
        raw.toLowerCase() !== "done"
      ) {
        anomalies.push(`${docSnap.id}: status=${JSON.stringify(raw)}`);
      }

      const patch = buildPatch(data);
      if (!patch) continue;
      if (!DRY_RUN) {
        batch.update(docSnap.ref, patch);
        batchOps += 1;
      }
      fixed += 1;
    }

    if (!DRY_RUN && batchOps > 0) {
      await batch.commit();
    }

    last = snap.docs[snap.docs.length - 1];
    if (snap.size < PAGE) break;
  }

  console.log(
    DRY_RUN ? "[DRY RUN] No writes committed." : "Normalization committed."
  );
  console.log(`Total scanned: ${scanned}`);
  console.log(`Total fixed: ${fixed}`);
  if (anomalies.length) {
    console.log(
      `Anomalies (unexpected status strings, sampled): ${anomalies.length}`
    );
    for (const line of anomalies.slice(0, 50)) {
      console.log(`  ${line}`);
    }
    if (anomalies.length > 50) {
      console.log(`  ... and ${anomalies.length - 50} more`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
