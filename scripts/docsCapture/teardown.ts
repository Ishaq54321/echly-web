/**
 * Docs-screenshot TEARDOWN — one-command revert of scripts/docsCapture/seed.ts.
 *
 * Deletes EXACTLY the seeded sandbox: the workspace + session (and all their
 * subcollections via recursiveDelete), every top-level seed doc by id, the
 * Storage screenshot object, and the owner auth user. A final defensive sweep
 * removes any stray doc tagged `_seedTag == SEED_TAG` in the touched
 * collections, so a half-finished seed still cleans up fully.
 *
 * Run:  npx tsx scripts/docsCapture/teardown.ts
 */
import { config } from "dotenv";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

config({ path: ".env.local" });

const SEED_TAG = "docs-capture-v1";
const WS = "zzz-docsseed-ws";
const SESS = "zzz-docsseed-sess";
const SHOT = "zzz-docsseed-shot1";
const OWNER = "zzz-docsseed-u-maya";
const MEMBER_UIDS = [
  "zzz-docsseed-u-maya", "zzz-docsseed-u-sarah", "zzz-docsseed-u-daniel",
  "zzz-docsseed-u-anya", "zzz-docsseed-u-jordan",
];

const app =
  getApps().length === 0
    ? initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      })
    : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);
const bucket = getStorage(app).bucket();

async function delByTag(coll: string) {
  const snap = await db.collection(coll).where("_seedTag", "==", SEED_TAG).get();
  let n = 0;
  for (const d of snap.docs) { await d.ref.delete(); n++; }
  if (n) console.log(`[teardown]   swept ${n} from ${coll}`);
}

async function main() {
  console.log(`\n[teardown] Project: ${process.env.FIREBASE_PROJECT_ID}\n`);

  // 1) Workspace + session, including all subcollections.
  await db.recursiveDelete(db.doc(`workspaces/${WS}`));
  console.log(`[teardown] recursiveDelete workspaces/${WS} (+ members, activityEvents, insights)`);
  await db.recursiveDelete(db.doc(`sessions/${SESS}`));
  console.log(`[teardown] recursiveDelete sessions/${SESS} (+ members, presence, accessRequests)`);

  // 2) Top-level docs by tag (feedback, comments, userProfiles, users, sessionAccess).
  for (const c of ["feedback", "comments", "userProfiles", "users", "sessionAccess", "screenshots", "notifications"]) {
    await delByTag(c);
  }
  // Belt-and-braces explicit removals (in case a doc lacked the tag).
  await db.doc(`sessionAccess/${OWNER}_${SESS}`).delete().catch(() => {});
  for (const uid of MEMBER_UIDS) {
    await db.doc(`userProfiles/${uid}`).delete().catch(() => {});
    await db.doc(`users/${uid}`).delete().catch(() => {});
  }

  // 3) Storage screenshot object.
  await bucket.file(`sessions/${SESS}/screenshots/${SHOT}.png`).delete().catch(() => {});
  console.log(`[teardown] deleted storage sessions/${SESS}/screenshots/${SHOT}.png`);

  // 4) Owner auth user.
  await auth.deleteUser(OWNER).catch(() => {});
  console.log(`[teardown] deleted auth user ${OWNER}`);

  console.log(`\n[teardown] DONE — sandbox removed.\n`);
  process.exit(0);
}

main().catch((e) => { console.error("[teardown] FAILED:", e); process.exit(1); });
