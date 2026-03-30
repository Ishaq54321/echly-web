/**
 * Reports (and optionally backfills) session documents for owner/workspace alignment.
 *
 *   npx tsx scripts/auditSessionAccessAlignment.ts
 *   npx tsx scripts/auditSessionAccessAlignment.ts --fix-created-by-user-id
 *
 * Requires Firebase admin env (same as other scripts in this repo).
 */
import { adminDb } from "@/lib/server/firebaseAdmin";

const FIX =
  process.argv.includes("--fix-created-by-user-id") ||
  process.env.SESSION_AUDIT_FIX === "1";

function trim(s: unknown): string {
  return typeof s === "string" ? s.trim() : "";
}

async function main(): Promise<void> {
  const mismatches: string[] = [];
  let scanned = 0;
  let backfilled = 0;

  const usersCache = new Map<string, { workspaceId: string } | null>();

  async function userWorkspace(uid: string): Promise<string | null> {
    if (!uid) return null;
    if (usersCache.has(uid)) {
      const row = usersCache.get(uid);
      return row ? row.workspaceId : null;
    }
    const snap = await adminDb.doc(`users/${uid}`).get();
    if (!snap.exists) {
      usersCache.set(uid, null);
      return null;
    }
    const data = snap.data() as Record<string, unknown>;
    const wid = trim(data.workspaceId);
    usersCache.set(uid, wid ? { workspaceId: wid } : null);
    return wid || null;
  }

  const snap = await adminDb.collection("sessions").get();
  for (const doc of snap.docs) {
    scanned++;
    const data = doc.data() as Record<string, unknown>;
    const sessionWs = trim(data.workspaceId);
    const createdByUserId = trim(data.createdByUserId);
    const createdById = trim(
      (data.createdBy as { id?: unknown } | undefined)?.id
    );
    const legacyUserId = trim(data.userId);

    const inferredOwner =
      createdByUserId || createdById || legacyUserId || "";

    if (!createdByUserId && inferredOwner) {
      const msg = `${doc.id}: missing createdByUserId (inferred ${inferredOwner})`;
      mismatches.push(msg);
      if (FIX) {
        await doc.ref.set({ createdByUserId: inferredOwner }, { merge: true });
        backfilled++;
        console.log(`[fix] ${msg}`);
      }
    } else if (
      createdByUserId &&
      createdById &&
      createdByUserId !== createdById
    ) {
      mismatches.push(
        `${doc.id}: createdByUserId (${createdByUserId}) ≠ createdBy.id (${createdById})`
      );
    }

    if (inferredOwner && sessionWs) {
      const ownerWs = await userWorkspace(inferredOwner);
      if (ownerWs && ownerWs !== sessionWs) {
        mismatches.push(
          `${doc.id}: session.workspaceId (${sessionWs}) ≠ creator workspace (${ownerWs})`
        );
      }
    }

    if (!sessionWs) {
      mismatches.push(`${doc.id}: missing or empty workspaceId`);
    }
  }

  console.log(`Scanned ${scanned} session documents.`);
  if (!mismatches.length) {
    console.log("No mismatches.");
    return;
  }
  console.log(`\nIssues (${mismatches.length}):\n${mismatches.join("\n")}`);
  if (FIX) {
    console.log(`\nBackfilled createdByUserId on ${backfilled} documents.`);
  } else {
    console.log(
      "\nRe-run with --fix-created-by-user-id to set missing createdByUserId only."
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
