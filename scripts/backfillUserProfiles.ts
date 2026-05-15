/**
 * One-off backfill: seed userProfiles/{uid} from every existing users/{uid}.
 *
 * Phase 25.4. The dual-write (lib/repositories/userProfilesRepository.server.ts)
 * only fires when a user changes their name/avatar or re-auths. Existing
 * comment authors who never do that would stay unresolved (initials) until
 * then. This backfills them so the live-avatar fix is retroactive.
 *
 * SAFE BY DEFAULT — dry-run unless you pass --commit:
 *   npx tsx scripts/backfillUserProfiles.ts            # dry run, writes nothing
 *   npx tsx scripts/backfillUserProfiles.ts --commit   # actually writes
 *
 * This script does NOT import the app's server modules: lib/server/* and
 * *.server.ts carry `import "server-only"`, which throws outside the Next
 * runtime. It self-bootstraps the Admin SDK from the same env vars
 * (FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY) and
 * inlines the resolveUserName + avatarUrl→photoURL ladders so the seeded
 * docs match exactly what the dual-write helper would produce. Keep these
 * two ladders in sync with lib/utils/nameSplit.ts (resolveUserName) and
 * lib/repositories/userProfilesRepository.server.ts (pickAvatar) if either
 * changes.
 *
 * Load env first if not already present, e.g.:
 *   node --env-file=.env.local --import tsx scripts/backfillUserProfiles.ts --commit
 */
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const COMMIT = process.argv.includes("--commit");

const app =
  getApps().length === 0
    ? initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      })
    : getApps()[0];

const db = getFirestore(app);

/** Inlined mirror of resolveUserName (lib/utils/nameSplit.ts). */
function resolveDisplayName(d: Record<string, unknown>): string | null {
  const f = (typeof d.firstName === "string" ? d.firstName : "").trim();
  const l = (typeof d.lastName === "string" ? d.lastName : "").trim();
  const fromFirstLast = f && l ? `${f} ${l}` : f || l || "";
  if (fromFirstLast) return fromFirstLast;
  const fromAuth = (
    typeof d.authDisplayName === "string"
      ? d.authDisplayName
      : typeof d.displayName === "string"
        ? d.displayName
        : ""
  ).trim();
  if (fromAuth) return fromAuth;
  const email = (typeof d.email === "string" ? d.email : "").trim();
  if (email && email.includes("@")) {
    const local = email.split("@")[0];
    if (local) return local;
  }
  return null; // backfill writes null rather than the "Unknown user" sentinel
}

/** Inlined mirror of pickAvatar (userProfilesRepository.server.ts). */
function resolveAvatar(d: Record<string, unknown>): string | null {
  const a = (typeof d.avatarUrl === "string" ? d.avatarUrl : "").trim();
  if (a) return a;
  const p = (typeof d.photoURL === "string" ? d.photoURL : "").trim();
  return p || null;
}

async function main() {
  console.log(
    COMMIT
      ? "[backfillUserProfiles] COMMIT mode — writing userProfiles docs"
      : "[backfillUserProfiles] DRY RUN — pass --commit to write"
  );

  const usersSnap = await db.collection("users").get();
  console.log(`[backfillUserProfiles] ${usersSnap.size} users found`);

  let written = 0;
  let skipped = 0;
  let batch = db.batch();
  let batchCount = 0;

  for (const doc of usersSnap.docs) {
    const uid = doc.id;
    const data = (doc.data() ?? {}) as Record<string, unknown>;
    const displayName = resolveDisplayName(data);
    const avatarUrl = resolveAvatar(data);

    if (!COMMIT) {
      console.log(
        `  would write userProfiles/${uid}  name=${JSON.stringify(
          displayName
        )} avatar=${avatarUrl ? "set" : "null"}`
      );
      skipped++;
      continue;
    }

    batch.set(
      db.doc(`userProfiles/${uid}`),
      { uid, displayName, avatarUrl, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );
    batchCount++;
    written++;

    // Firestore batch hard limit is 500 writes.
    if (batchCount === 400) {
      await batch.commit();
      batch = db.batch();
      batchCount = 0;
      console.log(`  …committed ${written} so far`);
    }
  }

  if (COMMIT && batchCount > 0) await batch.commit();

  console.log(
    `[backfillUserProfiles] done — ${
      COMMIT ? `${written} written` : `${skipped} would be written (dry run)`
    }`
  );
}

main().catch((e) => {
  console.error("[backfillUserProfiles] FAILED", e);
  process.exit(1);
});
