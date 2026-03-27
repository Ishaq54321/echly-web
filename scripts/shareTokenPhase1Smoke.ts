/**
 * Phase 1 manual smoke: create share_links rows and run resolveShareToken in-process.
 *
 * Run: npx tsx scripts/shareTokenPhase1Smoke.ts
 *
 * Env:
 * - SHARE_TEST_SESSION_ID (required) — real session id in Firestore
 * - SHARE_TEST_USER_ID (required) — uid to store as createdBy
 *
 * Flags: --expired (EXPIRED), --inactive (INACTIVE; mutates doc after create).
 */
import { createShareLink } from "@/lib/repositories/shareLinksRepository";
import { resolveShareToken } from "@/lib/server/shareTokenResolver";
import { adminDb } from "@/lib/server/firebaseAdmin";

function assert(cond: boolean, message: string): void {
  if (!cond) {
    console.error("assert failed:", message);
    process.exit(1);
  }
}

async function main() {
  const sessionId = process.env.SHARE_TEST_SESSION_ID?.trim();
  const userId = process.env.SHARE_TEST_USER_ID?.trim();
  if (!sessionId || !userId) {
    console.error("Set SHARE_TEST_SESSION_ID and SHARE_TEST_USER_ID");
    process.exit(1);
  }

  const wantExpired = process.argv.includes("--expired");
  const wantInactive = process.argv.includes("--inactive");

  const short = await resolveShareToken("abc");
  assert(!short.valid && short.reason === "NOT_FOUND", "very short token → NOT_FOUND");

  const { id, token } = await createShareLink(sessionId, "comment", userId, {
    expiresAt: wantExpired ? new Date(Date.now() - 60_000) : undefined,
  });
  console.log("created token:", token.slice(0, 8) + "…", "expired?", wantExpired);

  if (wantInactive) {
    await adminDb.doc(`share_links/${id}`).update({ isActive: false });
  }

  if (!wantExpired && !wantInactive) {
    const ref = adminDb.doc(`share_links/${id}`);
    const snap0 = await ref.get();
    assert(snap0.data()?.lastAccessedAt == null, "lastAccessedAt should be null on create");

    await resolveShareToken(token);
    const snap1 = await ref.get();
    const t1 = snap1.data()?.lastAccessedAt;
    assert(t1 != null && typeof t1.toMillis === "function", "lastAccessedAt after first resolve");

    await new Promise((r) => setTimeout(r, 50));
    await resolveShareToken(token);
    const snap2 = await ref.get();
    const t2 = snap2.data()?.lastAccessedAt;
    assert(t2 != null && typeof t2.toMillis === "function", "lastAccessedAt after second resolve");
    assert(t2.toMillis() >= t1.toMillis(), "second resolve should not move lastAccessedAt backward");
  }

  const resolved = await resolveShareToken(token);
  console.log("resolve same token:", resolved);

  const bad = await resolveShareToken("totally-invalid-token-xxxxxxxxxxxxxxxx");
  console.log("resolve bad token:", bad);

  const empty = await resolveShareToken("   ");
  console.log("resolve empty:", empty);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
