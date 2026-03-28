/**
 * Read-only: compare session doc counters vs recomputed counts from feedback.
 *
 * Run: npx tsx scripts/verifySessionCounts.ts
 */
import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldPath } from "firebase-admin/firestore";

const PAGE = 300;

async function countFeedbackForSession(
  sessionId: string,
  workspaceId: string
): Promise<{ open: number; resolved: number; total: number }> {
  const snap = await adminDb
    .collection("feedback")
    .where("sessionId", "==", sessionId)
    .where("workspaceId", "==", workspaceId)
    .get();
  let open = 0;
  let resolved = 0;
  for (const d of snap.docs) {
    const row = d.data();
    if (row.isDeleted === true) continue;
    const st = row.status;
    if (st === "resolved") resolved += 1;
    else if (st === "open") open += 1;
  }
  return { open, resolved, total: open + resolved };
}

async function main(): Promise<void> {
  let checked = 0;
  let matched = 0;
  const mismatches: string[] = [];

  let last: FirebaseFirestore.QueryDocumentSnapshot | undefined;

  while (true) {
    const q = last
      ? adminDb
          .collection("sessions")
          .orderBy(FieldPath.documentId())
          .startAfter(last.id)
          .limit(PAGE)
      : adminDb.collection("sessions").orderBy(FieldPath.documentId()).limit(PAGE);

    const snap = await q.get();
    if (snap.empty) break;

    for (const docSnap of snap.docs) {
      checked += 1;
      const row = docSnap.data() as Record<string, unknown>;
      const workspaceId =
        typeof row.workspaceId === "string" ? row.workspaceId.trim() : "";
      if (!workspaceId) continue;

      const docOpen = typeof row.openCount === "number" ? row.openCount : 0;
      const docResolved =
        typeof row.resolvedCount === "number" ? row.resolvedCount : 0;
      const docTotal = typeof row.totalCount === "number" ? row.totalCount : 0;
      const docFeedback =
        typeof row.feedbackCount === "number" ? row.feedbackCount : 0;

      const real = await countFeedbackForSession(docSnap.id, workspaceId);
      const ok =
        docOpen === real.open &&
        docResolved === real.resolved &&
        docTotal === real.total &&
        docFeedback === real.total &&
        docTotal === docOpen + docResolved;

      if (ok) {
        matched += 1;
      } else {
        mismatches.push(
          `${docSnap.id}: doc={open:${docOpen},res:${docResolved},tot:${docTotal},fb:${docFeedback}} real={open:${real.open},res:${real.resolved},tot:${real.total}}`
        );
      }
    }

    last = snap.docs[snap.docs.length - 1];
    if (snap.size < PAGE) break;
  }

  const rate = checked === 0 ? 100 : Math.round((matched / checked) * 1000) / 10;
  console.log(`Sessions checked: ${checked}`);
  console.log(`Matches: ${matched} (${rate}%)`);
  console.log(`Mismatches: ${mismatches.length}`);
  for (const line of mismatches.slice(0, 100)) {
    console.log(`  ${line}`);
  }
  if (mismatches.length > 100) {
    console.log(`  ... and ${mismatches.length - 100} more`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
