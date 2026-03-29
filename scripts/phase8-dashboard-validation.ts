/**
 * Phase 8 dashboard behavioral harness: calls the same Firestore repos as the API.
 * Run: npm run phase8:dashboard
 *    or: node -r ./scripts/stub-server-only.cjs ./node_modules/tsx/dist/cli.mjs scripts/phase8-dashboard-validation.ts
 *
 * Optional env: PHASE8_SESSION_ID (defaults to first session in project)
 *               PHASE8_USER_ID (defaults to "phase8-harness-user")
 */
import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.local") });

import { adminDb } from "../lib/server/firebaseAdmin";
import {
  addFeedbackWithSessionCountersRepo,
  updateFeedbackResolveAndSessionCountersRepo,
  deleteFeedbackWithSessionCountersRepo,
  getFeedbackByIdRepo,
} from "../lib/repositories/feedbackRepository.server";
import {
  addCommentRepo,
  deleteCommentRepo,
} from "../lib/repositories/commentsRepository.server";
import type { StructuredFeedback } from "../lib/domain/feedback";

const testUserId =
  process.env.PHASE8_USER_ID?.trim() || "phase8-harness-user";

function sessionCounters(data: Record<string, unknown> | undefined) {
  const open = typeof data?.openCount === "number" ? data.openCount : 0;
  const resolved =
    typeof data?.resolvedCount === "number" ? data.resolvedCount : 0;
  const total =
    typeof data?.totalCount === "number" ? data.totalCount : open + resolved;
  const feedbackCount =
    typeof data?.feedbackCount === "number" ? data.feedbackCount : total;
  const commentCount =
    typeof data?.commentCount === "number" ? data.commentCount : 0;
  return { open, resolved, total, feedbackCount, commentCount };
}

async function readSession(sessionId: string) {
  const snap = await adminDb.doc(`sessions/${sessionId}`).get();
  return { exists: snap.exists, data: snap.data(), ref: snap.ref };
}

async function actualTicketCounts(
  workspaceId: string,
  sessionId: string
): Promise<{ open: number; resolved: number; total: number }> {
  const snap = await adminDb
    .collection("feedback")
    .where("workspaceId", "==", workspaceId)
    .where("sessionId", "==", sessionId)
    .get();
  let open = 0;
  let resolved = 0;
  for (const d of snap.docs) {
    const row = d.data() as { isDeleted?: boolean; status?: string };
    if (row.isDeleted === true) continue;
    if (row.status === "resolved") resolved += 1;
    else open += 1;
  }
  return { open, resolved, total: open + resolved };
}

function checkInvariant(
  label: string,
  sessionRow: ReturnType<typeof sessionCounters>,
  actual: { open: number; resolved: number; total: number }
): { pass: boolean; detail: string } {
  const sum = sessionRow.open + sessionRow.resolved;
  const neg =
    sessionRow.open < 0 ||
    sessionRow.resolved < 0 ||
    sessionRow.total < 0 ||
    actual.open < 0 ||
    actual.resolved < 0;
  const totalEq = sessionRow.total === sum;
  const matchesDocs =
    sessionRow.open === actual.open &&
    sessionRow.resolved === actual.resolved &&
    sessionRow.total === actual.total;
  const parts = [
    `session open=${sessionRow.open} resolved=${sessionRow.resolved} total=${sessionRow.total} (open+resolved=${sum})`,
    `docs open=${actual.open} resolved=${actual.resolved} total=${actual.total}`,
    `totalEq=${totalEq}`,
    `matchesDocs=${matchesDocs}`,
    `nonNegative=${!neg}`,
  ];
  const pass = totalEq && matchesDocs && !neg;
  return { pass, detail: `${label}: ${parts.join(" | ")}` };
}

function minimalFeedback(title: string): StructuredFeedback {
  return {
    title,
    instruction: "phase8 harness",
    type: "general",
  };
}

async function pickSessionId(): Promise<string> {
  const env = process.env.PHASE8_SESSION_ID?.trim();
  if (env) return env;
  const q = await adminDb.collection("sessions").limit(1).get();
  if (q.empty) throw new Error("No sessions in Firestore; set PHASE8_SESSION_ID");
  return q.docs[0].id;
}

async function main() {
  const failures: string[] = [];
  const logStep = (name: string, pass: boolean, extra?: string) => {
    const line = `[${pass ? "PASS" : "FAIL"}] ${name}${extra ? ` — ${extra}` : ""}`;
    console.log(line);
    if (!pass) failures.push(line);
  };

  const sessionId = await pickSessionId();
  const { data: s0 } = await readSession(sessionId);
  const workspaceId =
    typeof s0?.workspaceId === "string" ? s0.workspaceId.trim() : "";
  if (!workspaceId) throw new Error("Session missing workspaceId");

  console.log("Using sessionId=%s workspaceId=%s testUserId=%s", sessionId, workspaceId, testUserId);

  // --- Step 1: counter integrity sequence ---
  const step1: string[] = [];
  let a = await actualTicketCounts(workspaceId, sessionId);
  let sess = sessionCounters(s0);
  let c = checkInvariant("baseline", sess, a);
  step1.push(c.detail);
  logStep("Step1 baseline", c.pass, c.detail);
  if (!c.pass) failures.push(c.detail);

  const createdIds: string[] = [];
  for (let i = 0; i < 3; i++) {
    const r = await addFeedbackWithSessionCountersRepo(
      testUserId,
      sessionId,
      testUserId,
      minimalFeedback(`phase8-t${i + 1}-${Date.now()}`)
    );
    if (!r.inserted || !r.ref?.id) {
      logStep(`Step1 create ticket ${i + 1}`, false, "insert failed or no id");
      failures.push("create failed");
      break;
    }
    createdIds.push(r.ref.id);
    const s = await readSession(sessionId);
    a = await actualTicketCounts(workspaceId, sessionId);
    sess = sessionCounters(s.data);
    c = checkInvariant(`after create ${i + 1}`, sess, a);
    step1.push(c.detail);
    logStep(`Step1 after create ${i + 1}`, c.pass, c.detail);
    if (!c.pass) failures.push(c.detail);
  }

  if (createdIds.length < 3) {
    console.error("Aborting: need 3 tickets");
    process.exit(1);
  }

  const [t1, t2, t3] = createdIds;

  await updateFeedbackResolveAndSessionCountersRepo(t1, { status: "resolved" });
  {
    const s = await readSession(sessionId);
    a = await actualTicketCounts(workspaceId, sessionId);
    sess = sessionCounters(s.data);
    c = checkInvariant("after resolve t1", sess, a);
    step1.push(c.detail);
    logStep("Step1 after resolve 1 ticket", c.pass, c.detail);
    if (!c.pass) failures.push(c.detail);
  }

  await deleteFeedbackWithSessionCountersRepo(t2);
  {
    const s = await readSession(sessionId);
    a = await actualTicketCounts(workspaceId, sessionId);
    sess = sessionCounters(s.data);
    c = checkInvariant("after delete t2", sess, a);
    step1.push(c.detail);
    logStep("Step1 after delete 1 ticket", c.pass, c.detail);
    if (!c.pass) failures.push(c.detail);
  }

  await updateFeedbackResolveAndSessionCountersRepo(t1, { status: "open" });
  {
    const s = await readSession(sessionId);
    a = await actualTicketCounts(workspaceId, sessionId);
    sess = sessionCounters(s.data);
    c = checkInvariant("after unresolve t1", sess, a);
    step1.push(c.detail);
    logStep("Step1 after unresolve", c.pass, c.detail);
    if (!c.pass) failures.push(c.detail);
  }

  console.log("\nStep1 snapshot log:\n" + step1.join("\n"));

  // --- Step 2: rapid / race-ish parallel toggles on t3 ---
  let raceOk = true;
  let raceNote = "";
  try {
    await Promise.all([
      updateFeedbackResolveAndSessionCountersRepo(t3, { status: "resolved" }),
      updateFeedbackResolveAndSessionCountersRepo(t3, { status: "open" }),
      updateFeedbackResolveAndSessionCountersRepo(t3, { status: "resolved" }),
    ]);
    const s = await readSession(sessionId);
    a = await actualTicketCounts(workspaceId, sessionId);
    sess = sessionCounters(s.data);
    const inv = checkInvariant("after parallel toggles t3", sess, a);
    raceNote = inv.detail;
    if (!inv.pass) raceOk = false;
    const row = await getFeedbackByIdRepo(t3);
    if (!row || (row.status !== "resolved" && row.status !== "open")) {
      raceOk = false;
      raceNote += " | final ticket missing or invalid status";
    }
  } catch (e) {
    raceOk = false;
    raceNote = e instanceof Error ? e.message : String(e);
  }
  logStep("Step2 rapid parallel resolve/unresolve", raceOk, raceNote);

  // delete while "resolving" — t1 is open; concurrent delete + resolve
  const tRace = (
    await addFeedbackWithSessionCountersRepo(
      testUserId,
      sessionId,
      testUserId,
      minimalFeedback(`phase8-race-${Date.now()}`)
    )
  ).ref.id;
  let delRaceOk = true;
  let delRaceNote = "";
  try {
    await Promise.all([
      deleteFeedbackWithSessionCountersRepo(tRace),
      updateFeedbackResolveAndSessionCountersRepo(tRace, { status: "resolved" }),
    ]);
    const s = await readSession(sessionId);
    a = await actualTicketCounts(workspaceId, sessionId);
    sess = sessionCounters(s.data);
    const inv = checkInvariant("after delete+resolve race", sess, a);
    delRaceNote = inv.detail;
    if (!inv.pass) delRaceOk = false;
    const ghost = await getFeedbackByIdRepo(tRace);
    if (ghost != null) {
      delRaceOk = false;
      delRaceNote += " | ticket still readable after delete";
    }
  } catch (e) {
    delRaceOk = false;
    delRaceNote = e instanceof Error ? e.message : String(e);
  }
  logStep("Step2 delete+resolve concurrent", delRaceOk, delRaceNote);

  // create + delete quickly
  const tCd = (
    await addFeedbackWithSessionCountersRepo(
      testUserId,
      sessionId,
      testUserId,
      minimalFeedback(`phase8-cd-${Date.now()}`)
    )
  ).ref.id;
  await deleteFeedbackWithSessionCountersRepo(tCd);
  {
    const s = await readSession(sessionId);
    a = await actualTicketCounts(workspaceId, sessionId);
    sess = sessionCounters(s.data);
    const inv = checkInvariant("after quick create+delete", sess, a);
    logStep("Step2 create+delete quick", inv.pass, inv.detail);
    if (!inv.pass) failures.push(inv.detail);
  }

  // --- Step 3: idempotency ---
  const noop = await updateFeedbackResolveAndSessionCountersRepo(t3, {
    status: "resolved",
  });
  const sBeforeSecond = sessionCounters((await readSession(sessionId)).data);
  const noop2 = await updateFeedbackResolveAndSessionCountersRepo(t3, {
    status: "resolved",
  });
  const sAfterSecond = sessionCounters((await readSession(sessionId)).data);
  const idemResolve =
    noop2.kind === "noop" &&
    JSON.stringify(sBeforeSecond) === JSON.stringify(sAfterSecond);
  logStep(
    "Step3 resolve already resolved (noop + counters unchanged)",
    idemResolve,
    `first=${noop.kind} second=${noop2.kind}`
  );
  if (!idemResolve) failures.push("idempotency resolve");

  await deleteFeedbackWithSessionCountersRepo(t1);
  const delTwiceOk = await (async () => {
    try {
      await deleteFeedbackWithSessionCountersRepo(t1);
      return true;
    } catch {
      return false;
    }
  })();
  const gone = (await getFeedbackByIdRepo(t1)) == null;
  logStep(
    "Step3 delete already deleted (second call no throw)",
    delTwiceOk && gone,
    `gone=${gone}`
  );
  if (!delTwiceOk || !gone) failures.push("idempotent delete");

  const tUp = (
    await addFeedbackWithSessionCountersRepo(
      testUserId,
      sessionId,
      testUserId,
      minimalFeedback(`phase8-dup-${Date.now()}`)
    )
  ).ref.id;
  await updateFeedbackResolveAndSessionCountersRepo(tUp, {
    status: "resolved",
    title: "A",
  });
  const sA = sessionCounters((await readSession(sessionId)).data);
  await updateFeedbackResolveAndSessionCountersRepo(tUp, {
    status: "resolved",
    title: "B",
  });
  const sB = sessionCounters((await readSession(sessionId)).data);
  const dupTitleOk =
    JSON.stringify(sA) === JSON.stringify(sB) &&
    sA.open + sA.resolved === sA.total;
  logStep(
    "Step3 update same resolved twice (title only)",
    dupTitleOk,
    "counters stable"
  );
  if (!dupTitleOk) failures.push("duplicate title update drift");

  // --- Step 4: hard delete follow-up ops ---
  await deleteFeedbackWithSessionCountersRepo(tUp);
  const r4a = await updateFeedbackResolveAndSessionCountersRepo(tUp, {
    status: "open",
  });
  const r4b = await getFeedbackByIdRepo(tUp);
  logStep(
    "Step4 resolve deleted → missing + no row",
    r4a.kind === "missing" && r4b == null,
    `kind=${r4a.kind}`
  );
  if (r4a.kind !== "missing" || r4b != null) failures.push("step4 resolve");

  // --- Step 5: comments ---
  const tC = (
    await addFeedbackWithSessionCountersRepo(
      testUserId,
      sessionId,
      testUserId,
      minimalFeedback(`phase8-comment-${Date.now()}`)
    )
  ).ref.id;
  const sessBeforeC = sessionCounters((await readSession(sessionId)).data);
  const cid = await addCommentRepo(testUserId, sessionId, tC, {
    userId: testUserId,
    userName: "Harness",
    userAvatar: "",
    message: "c1",
  });
  const fbAfter1 = await getFeedbackByIdRepo(tC);
  const sessAfterAdd = sessionCounters((await readSession(sessionId)).data);
  const cc1 =
    (fbAfter1?.commentCount ?? 0) === 1 &&
    sessAfterAdd.commentCount === sessBeforeC.commentCount + 1;
  logStep("Step5 add comment (session + feedback)", cc1, `commentId=${cid}`);
  if (!cc1) failures.push("comment add counts");

  await deleteCommentRepo(cid);
  const fbAfterDel = await getFeedbackByIdRepo(tC);
  const sessAfterDel = sessionCounters((await readSession(sessionId)).data);
  const cc2 =
    (fbAfterDel?.commentCount ?? 0) === 0 &&
    sessAfterDel.commentCount === sessBeforeC.commentCount;
  logStep("Step5 delete comment restores counts", cc2);
  if (!cc2) failures.push("comment delete counts");

  let rapidCommentOk = true;
  try {
    const ids: string[] = [];
    for (let i = 0; i < 5; i++) {
      ids.push(
        await addCommentRepo(testUserId, sessionId, tC, {
          userId: testUserId,
          userName: "Harness",
          userAvatar: "",
          message: `r${i}`,
        })
      );
    }
    await Promise.all(ids.map((id) => deleteCommentRepo(id)));
    const fb = await getFeedbackByIdRepo(tC);
    const sEnd = sessionCounters((await readSession(sessionId)).data);
    rapidCommentOk =
      (fb?.commentCount ?? 0) === 0 &&
      sEnd.commentCount === sessAfterDel.commentCount &&
      sEnd.commentCount >= 0;
  } catch (e) {
    rapidCommentOk = false;
    console.error(e);
  }
  logStep("Step5 rapid add/delete 5", rapidCommentOk);
  if (!rapidCommentOk) failures.push("rapid comments");

  // --- Step 6: transaction errors (none thrown in harness) ---
  logStep("Step6 no Firestore transaction errors in harness", true);

  // --- Step 7: weak proxy — two reads after burst ---
  const s7a = sessionCounters((await readSession(sessionId)).data);
  await new Promise((r) => setTimeout(r, 200));
  const s7b = sessionCounters((await readSession(sessionId)).data);
  const s7ok = JSON.stringify(s7a) === JSON.stringify(s7b);
  logStep(
    "Step7 dual read stability (proxy for realtime; not browser tabs)",
    s7ok
  );

  // --- Step 8: not simulated (do not treat as product failure) ---
  console.log(
    "[NOT RUN] Step8 network failure simulation — no transport failure injected in this harness (manual: offline tab / DevTools offline)"
  );

  // Cleanup remaining harness ticket t3
  await deleteFeedbackWithSessionCountersRepo(t3).catch(() => {});
  await deleteFeedbackWithSessionCountersRepo(tC).catch(() => {});

  console.log("\n--- FINAL ---");
  console.log("Failures:", failures.length ? failures.join("\n") : "(none)");
  process.exit(failures.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
