/**
 * Phase 1 — Firestore alignment (strict workspaceId only).
 *
 * Deletes invalid documents (no migration / no patching):
 * - users: missing or invalid workspaceId (must match workspaces/{id})
 * - feedback: missing workspaceId, unknown workspace, or mismatch vs session.workspaceId
 * - sessions: missing workspaceId or unknown workspace
 * - comments: missing workspaceId
 *
 * Optional checks (report only):
 * - workspaces with no user referencing them
 * - workspaces/{id}/insights/main missing
 *
 * Usage (requires FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY):
 *   npx tsx scripts/phase1AlignFirestore.ts
 *   npx tsx scripts/phase1AlignFirestore.ts --dry-run
 *
 * Or: PHASE1_DRY_RUN=1 npx tsx scripts/phase1AlignFirestore.ts
 */
import { adminDb } from "@/lib/server/firebaseAdmin";
import type { DocumentReference } from "firebase-admin/firestore";

const DRY_RUN =
  process.argv.includes("--dry-run") || process.env.PHASE1_DRY_RUN === "1";

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

async function commitDeletes(refs: DocumentReference[]): Promise<void> {
  const chunk = 500;
  for (let i = 0; i < refs.length; i += chunk) {
    const slice = refs.slice(i, i + chunk);
    if (DRY_RUN) continue;
    const batch = adminDb.batch();
    for (const r of slice) batch.delete(r);
    await batch.commit();
  }
}

async function loadWorkspaceIds(): Promise<Set<string>> {
  const snap = await adminDb.collection("workspaces").get();
  return new Set(snap.docs.map((d) => d.id));
}

async function main(): Promise<void> {
  console.log(
    DRY_RUN ? "[DRY RUN] No writes will be committed.\n" : "[LIVE] Deletes will be committed.\n"
  );

  const workspaceIds = await loadWorkspaceIds();
  console.log(`workspace docs count: ${workspaceIds.size}`);

  const stats = {
    usersDeleted: 0,
    feedbackDeleted: 0,
    sessionsDeleted: 0,
    commentsDeleted: 0,
  };

  const toDeleteUsers: DocumentReference[] = [];
  const usersSnap = await adminDb.collection("users").get();
  const userWorkspaceIds = new Set<string>();

  for (const u of usersSnap.docs) {
    const data = u.data() as Record<string, unknown>;
    const wid = data.workspaceId;
    if (!isNonEmptyString(wid) || !workspaceIds.has(wid.trim())) {
      toDeleteUsers.push(u.ref);
      continue;
    }
    userWorkspaceIds.add(wid.trim());
  }

  if (toDeleteUsers.length) {
    console.log(`users: ${toDeleteUsers.length} invalid → delete`);
    await commitDeletes(toDeleteUsers);
    stats.usersDeleted = toDeleteUsers.length;
  } else {
    console.log("users: all valid");
  }

  // Orphan workspaces (optional report)
  const orphanWorkspaces = [...workspaceIds].filter((id) => !userWorkspaceIds.has(id));
  if (orphanWorkspaces.length) {
    console.log(
      `workspaces (optional): ${orphanWorkspaces.length} with no referenced user workspaceId (not deleted)`
    );
  }

  const sessionCache = new Map<string, { workspaceId?: string } | null | undefined>();

  async function getSessionData(sessionId: string) {
    if (sessionCache.has(sessionId)) return sessionCache.get(sessionId);
    const s = await adminDb.doc(`sessions/${sessionId}`).get();
    const data = s.exists ? s.data() : null;
    sessionCache.set(sessionId, data);
    return data;
  }

  const toDeleteFeedback: DocumentReference[] = [];
  const feedbackSnap = await adminDb.collection("feedback").get();
  for (const docSnap of feedbackSnap.docs) {
    const data = docSnap.data() as Record<string, unknown>;
    const wid = data.workspaceId;
    if (!isNonEmptyString(wid) || !workspaceIds.has(wid.trim())) {
      toDeleteFeedback.push(docSnap.ref);
      continue;
    }
    const sid = data.sessionId;
    if (isNonEmptyString(sid)) {
      const sessionData = await getSessionData(sid.trim());
      if (!sessionData) {
        toDeleteFeedback.push(docSnap.ref);
        continue;
      }
      const sw =
        typeof sessionData.workspaceId === "string"
          ? sessionData.workspaceId.trim()
          : "";
      if (!sw || sw !== wid.trim()) {
        toDeleteFeedback.push(docSnap.ref);
      }
    }
  }
  if (toDeleteFeedback.length) {
    console.log(`feedback: ${toDeleteFeedback.length} invalid → delete`);
    await commitDeletes(toDeleteFeedback);
    stats.feedbackDeleted = toDeleteFeedback.length;
  } else {
    console.log("feedback: all valid");
  }

  const toDeleteSessions: DocumentReference[] = [];
  const sessionsSnap = await adminDb.collection("sessions").get();
  for (const docSnap of sessionsSnap.docs) {
    const data = docSnap.data() as Record<string, unknown>;
    const wid = data.workspaceId;
    if (!isNonEmptyString(wid) || !workspaceIds.has(wid.trim())) {
      toDeleteSessions.push(docSnap.ref);
    }
  }
  if (toDeleteSessions.length) {
    console.log(`sessions: ${toDeleteSessions.length} invalid → delete`);
    await commitDeletes(toDeleteSessions);
    stats.sessionsDeleted = toDeleteSessions.length;
  } else {
    console.log("sessions: all valid");
  }

  const toDeleteComments: DocumentReference[] = [];
  const commentsSnap = await adminDb.collection("comments").get();
  for (const docSnap of commentsSnap.docs) {
    const data = docSnap.data() as Record<string, unknown>;
    const wid = data.workspaceId;
    if (!isNonEmptyString(wid) || !workspaceIds.has(wid.trim())) {
      toDeleteComments.push(docSnap.ref);
    }
  }
  if (toDeleteComments.length) {
    console.log(`comments: ${toDeleteComments.length} invalid → delete`);
    await commitDeletes(toDeleteComments);
    stats.commentsDeleted = toDeleteComments.length;
  } else {
    console.log("comments: all valid");
  }

  // insights/main (optional)
  let missingInsights = 0;
  for (const wid of userWorkspaceIds) {
    const main = await adminDb.doc(`workspaces/${wid}/insights/main`).get();
    if (!main.exists) missingInsights += 1;
  }
  if (missingInsights) {
    console.log(
      `insights: ${missingInsights} workspace(s) missing workspaces/{id}/insights/main (not auto-created)`
    );
  } else {
    console.log("insights: all referenced workspaces have main doc");
  }

  console.log("\nphase1AlignFirestore complete");
  console.log(JSON.stringify({ ...stats, dryRun: DRY_RUN }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
