/**
 * One-time: recompute openCount / resolvedCount / totalCount / feedbackCount on each session
 * from the feedback collection (non-deleted only; status open | resolved).
 *
 * Run: npx tsx scripts/rebuildSessionCounts.ts
 * Dry run: npx tsx scripts/rebuildSessionCounts.ts --dry-run
 */
import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldPath, FieldValue } from "firebase-admin/firestore";

const DRY_RUN = process.argv.includes("--dry-run");
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
  let sessionsSeen = 0;
  let updated = 0;
  let skippedNoWorkspace = 0;

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

    const batch = adminDb.batch();
    let ops = 0;

    for (const docSnap of snap.docs) {
      sessionsSeen += 1;
      const row = docSnap.data() as Record<string, unknown>;
      const workspaceId =
        typeof row.workspaceId === "string" ? row.workspaceId.trim() : "";
      if (!workspaceId) {
        skippedNoWorkspace += 1;
        continue;
      }

      const before = {
        openCount: typeof row.openCount === "number" ? row.openCount : 0,
        resolvedCount: typeof row.resolvedCount === "number" ? row.resolvedCount : 0,
        totalCount: typeof row.totalCount === "number" ? row.totalCount : 0,
        feedbackCount: typeof row.feedbackCount === "number" ? row.feedbackCount : 0,
      };

      const { open, resolved, total } = await countFeedbackForSession(
        docSnap.id,
        workspaceId
      );

      if (
        before.openCount === open &&
        before.resolvedCount === resolved &&
        before.totalCount === total &&
        before.feedbackCount === total
      ) {
        continue;
      }

      console.log(`session ${docSnap.id}`, {
        before,
        after: { openCount: open, resolvedCount: resolved, totalCount: total, feedbackCount: total },
      });

      if (!DRY_RUN) {
        batch.set(
          docSnap.ref,
          {
            openCount: open,
            resolvedCount: resolved,
            totalCount: total,
            feedbackCount: total,
            skippedCount: FieldValue.delete(),
            updatedAt: new Date(),
          },
          { merge: true }
        );
        ops += 1;
      }
      updated += 1;
    }

    if (!DRY_RUN && ops > 0) {
      await batch.commit();
    }

    last = snap.docs[snap.docs.length - 1];
    if (snap.size < PAGE) break;
  }

  console.log(
    DRY_RUN ? "[DRY RUN] No writes committed." : "Rebuild committed."
  );
  console.log(`Sessions scanned: ${sessionsSeen}`);
  console.log(`Sessions updated: ${updated}`);
  console.log(`Skipped (no workspaceId): ${skippedNoWorkspace}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
