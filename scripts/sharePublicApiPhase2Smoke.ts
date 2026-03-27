/**
 * Phase 2: HTTP smoke for GET /api/public/share/[token].
 *
 * Start dev server, then:
 *   PUBLIC_SHARE_TEST_BASE=http://localhost:3000 SHARE_TEST_SESSION_ID=... SHARE_TEST_USER_ID=... npx tsx scripts/sharePublicApiPhase2Smoke.ts
 *
 * Flags: --expired (expect 410), --inactive (expect 403), --bad (invalid token path only).
 */
import { createShareLink } from "@/lib/repositories/shareLinksRepository";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

function assert(cond: boolean, message: string): void {
  if (!cond) {
    console.error("assert failed:", message);
    process.exit(1);
  }
}

function assertNoLeakyKeys(obj: unknown, path = "root"): void {
  const forbidden = new Set(["workspaceId", "userId"]);
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    for (const k of Object.keys(obj as Record<string, unknown>)) {
      assert(!forbidden.has(k), `forbidden key ${k} at ${path}`);
      assertNoLeakyKeys((obj as Record<string, unknown>)[k], `${path}.${k}`);
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, i) => assertNoLeakyKeys(item, `${path}[${i}]`));
  }
}

async function main() {
  const base = (process.env.PUBLIC_SHARE_TEST_BASE ?? "http://localhost:3000").replace(/\/$/, "");
  const sessionId = process.env.SHARE_TEST_SESSION_ID?.trim();
  const userId = process.env.SHARE_TEST_USER_ID?.trim();
  const wantExpired = process.argv.includes("--expired");
  const wantInactive = process.argv.includes("--inactive");
  const badOnly = process.argv.includes("--bad");

  if (!badOnly && (!sessionId || !userId)) {
    console.error("Set SHARE_TEST_SESSION_ID and SHARE_TEST_USER_ID (or use --bad)");
    process.exit(1);
  }

  if (badOnly) {
    const r = await fetch(`${base}/api/public/share/totally-invalid-token-xxxxxxxxxxxxxxxx`, {
      cache: "no-store",
    });
    assert(r.status === 404, `bad token expects 404, got ${r.status}`);
    console.log("bad token → 404 OK");
    return;
  }

  const { id, token } = await createShareLink(sessionId!, "comment", userId!, {
    expiresAt: wantExpired ? new Date(Date.now() - 60_000) : undefined,
  });
  if (wantInactive) {
    await updateDoc(doc(db, "share_links", id), { isActive: false });
  }

  const url = `${base}/api/public/share/${encodeURIComponent(token)}`;
  const res = await fetch(url, { cache: "no-store" });

  if (wantExpired) {
    assert(res.status === 410, `expired expects 410, got ${res.status}`);
    console.log("expired → 410 OK");
    return;
  }
  if (wantInactive) {
    assert(res.status === 403, `inactive expects 403, got ${res.status}`);
    console.log("inactive → 403 OK");
    return;
  }

  assert(res.status === 200, `valid token expects 200, got ${res.status}`);
  const text = await res.text();
  const json = JSON.parse(text) as {
    session?: { id?: string };
    feedback?: unknown[];
    permissions?: { canView?: boolean; canComment?: boolean; canResolve?: boolean };
  };
  assert(typeof json.session?.id === "string", "session.id present");
  assert(Array.isArray(json.feedback), "feedback array");
  assertNoLeakyKeys(json);
  assert(json.permissions?.canView === true, "canView true");
  assert(json.permissions?.canComment === true, "comment link → canComment");
  console.log("valid token → 200, sanitized shape OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
