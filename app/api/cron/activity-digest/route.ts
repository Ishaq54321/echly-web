// Daily activity-digest cron.
//
// Scheduled once daily via vercel.json ("0 8 * * *" — 08:00 UTC). This is the
// ONLY notification-category email path after the digest cutover; all instant
// notification emails were retired.
//
// Serverless design (Vercel Hobby): a single daily trigger must drain ALL users
// with un-digested notifications without exceeding the function timeout. We do
// this with BATCH + CURSOR + SELF-CHAINING:
//   - Each invocation processes ONE bounded discovery page (<= USER page size)
//     of distinct users with un-digested notifications.
//   - Each user is rendered + sent independently (Promise.allSettled), so one
//     user's failure never aborts the batch. digestedAt is stamped ONLY on a
//     confirmed send, transactionally, on exactly the rendered docs.
//   - If more users remain (cursor non-null) AND we're under MAX_CHAIN_DEPTH
//     AND under the soft time budget, the invocation fires a non-awaited fetch
//     to its OWN URL with the next cursor + incremented depth. The chain
//     continues until the cursor drains or the depth cap is hit.
//
// All state (cursor, depth, digestedAt) lives in the URL / Firestore — no
// in-memory state survives between invocations, as required on serverless.

import {
  getUsersWithUndigestedNotificationsPage,
  getUndigestedNotificationsForUser,
  stampNotificationsDigested,
} from "@/lib/repositories/notificationDigestRepository.server";
import { sendActivityDigestEmail } from "@/lib/email/digest/sendDigestEmail";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";

export const dynamic = "force-dynamic";

// Vercel Hobby allows a function maxDuration up to 60s. We set the ceiling to
// 60 as a safety net, but each invocation targets a SOFT time budget well under
// the old 10s baseline (see TIME_BUDGET_MS) and self-chains rather than running
// long — so the function never actually approaches this ceiling.
export const maxDuration = 60;

/** Soft wall-clock budget per invocation. When exceeded we stop pulling new
 * users and hand off to the next chained invocation. Kept well under the 10s
 * Hobby baseline so even a slow batch finishes comfortably. */
const TIME_BUDGET_MS = 8000;

/** Max self-chain hops from a single daily trigger. A backstop against a
 * runaway chain (e.g. a cursor that never advances). At USER_PAGE_DEFAULT (25)
 * users/page this drains up to ~1,250 users/day, far beyond current scale; bump
 * if the user base grows past that. */
const MAX_CHAIN_DEPTH = 50;

interface DigestRunResult {
  depth: number;
  usersInBatch: number;
  sent: number;
  skipped: number;
  failed: number;
  stamped: number;
  chained: boolean;
  drained: boolean;
}

function bearerFrom(req: Request): string | null {
  const authHeader = req.headers.get("authorization");
  return authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
}

/** Resolve this deployment's own origin for the self-chain fetch. Prefer the
 * explicit public app URL; fall back to the Vercel-provided host. */
function selfOrigin(req: Request): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  // Last resort: derive from the incoming request URL.
  try {
    return new URL(req.url).origin;
  } catch {
    return "";
  }
}

export async function GET(req: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  const bearer = bearerFrom(req);
  if (!secret || bearer !== secret) {
    return apiError({ code: "UNAUTHORIZED", message: "Unauthorized", status: 401 });
  }

  const url = new URL(req.url);
  const cursorParam = url.searchParams.get("cursor");
  const cursor = cursorParam && cursorParam.length > 0 ? cursorParam : null;
  const depth = Math.max(0, Number.parseInt(url.searchParams.get("depth") ?? "0", 10) || 0);

  const startedAt = Date.now();

  try {
    const result = await runDigestBatch({ req, secret, cursor, depth, startedAt });
    return apiSuccess(result);
  } catch (err) {
    console.error("[activity-digest] Cron error:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Cron job failed", status: 500 });
  }
}

async function runDigestBatch(args: {
  req: Request;
  secret: string;
  cursor: string | null;
  depth: number;
  startedAt: number;
}): Promise<DigestRunResult> {
  const { req, secret, cursor, depth, startedAt } = args;

  let pageCursor = cursor;
  let usersInBatch = 0;
  let sent = 0;
  let skipped = 0;
  let failed = 0;
  let stamped = 0;
  let drained = false;

  // Drain discovery pages WITHIN this invocation until we approach the soft
  // time budget or the cursor drains. Each page is a bounded set of distinct
  // users; processing several small pages per invocation minimizes the number
  // of (cold) chained invocations while keeping each page's work small. We stop
  // pulling a NEW page once the budget is approached and hand the remaining
  // cursor to the next chained invocation.
  for (;;) {
    const page = await getUsersWithUndigestedNotificationsPage(pageCursor);
    const userIds = page.userIds;
    usersInBatch += userIds.length;

    // Process each user independently. One user's failure (send error,
    // transient Firestore error) must not abort the batch — allSettled isolates.
    const outcomes = await Promise.allSettled(
      userIds.map((userId) => processUser(userId))
    );
    for (const outcome of outcomes) {
      if (outcome.status === "rejected") {
        failed++;
        console.error("[activity-digest] user processing rejected:", outcome.reason);
        continue;
      }
      const r = outcome.value;
      if (r.kind === "sent") {
        sent++;
        stamped += r.stamped;
      } else if (r.kind === "skipped") {
        skipped++;
      } else {
        failed++;
      }
    }

    pageCursor = page.nextCursor;
    if (pageCursor === null) {
      drained = true;
      break;
    }
    // Stop pulling a new page if we're approaching the time budget — hand off.
    if (Date.now() - startedAt >= TIME_BUDGET_MS) break;
  }

  // Self-chain when work remains (cursor non-null), the depth backstop allows
  // it, and we have a valid origin to call. The next hop is a fresh invocation
  // with its own time budget.
  let chained = false;
  if (!drained && pageCursor !== null) {
    if (depth + 1 <= MAX_CHAIN_DEPTH) {
      chained = triggerNextHop({
        req,
        secret,
        nextCursor: pageCursor,
        nextDepth: depth + 1,
      });
      if (!chained) {
        console.error(
          `[activity-digest] could not self-chain (depth=${depth}); remaining users wait for the next daily run`
        );
      }
    } else {
      console.error(
        `[activity-digest] hit MAX_CHAIN_DEPTH=${MAX_CHAIN_DEPTH}; remaining users will be picked up by the next daily run`
      );
    }
  }

  const elapsed = Date.now() - startedAt;
  console.log(
    `[activity-digest] depth=${depth} users=${usersInBatch} sent=${sent} skipped=${skipped} failed=${failed} stamped=${stamped} chained=${chained} drained=${drained} elapsedMs=${elapsed} budgetMs=${TIME_BUDGET_MS}`
  );

  return {
    depth,
    usersInBatch,
    sent,
    skipped,
    failed,
    stamped,
    chained,
    drained,
  };
}

type UserOutcome =
  | { kind: "sent"; stamped: number }
  | { kind: "skipped" }
  | { kind: "failed" };

async function processUser(userId: string): Promise<UserOutcome> {
  try {
    const { rows, truncated } = await getUndigestedNotificationsForUser(userId);
    // Empty window for this user (e.g. only pre-epoch docs matched discovery) →
    // send NOTHING and stamp NOTHING.
    if (rows.length === 0) return { kind: "skipped" };

    const result = await sendActivityDigestEmail({
      userId,
      notifications: rows,
      truncated,
    });

    if (!result.sent) {
      // preference-off / no-email / user-not-found / send-failure: do NOT stamp,
      // so a re-enabled or retried run can still deliver these notifications.
      // (preference-off is effectively permanent until the user re-subscribes;
      // those docs simply remain un-digested — acceptable, they never spam.)
      return { kind: "skipped" };
    }

    // Confirmed send → stamp digestedAt on EXACTLY the rendered docs,
    // transactionally. Any doc already stamped (overlapping run) is skipped.
    const stamped = await stampNotificationsDigested(result.includedIds);
    return { kind: "sent", stamped };
  } catch (err) {
    console.error(`[activity-digest] user=${userId} failed:`, err);
    return { kind: "failed" };
  }
}

/**
 * Fire-and-forget a fetch to this same route with the next cursor + depth. We do
 * NOT await it (the current invocation returns immediately after kicking it
 * off). Returns true if the hop was dispatched.
 *
 * Note: on serverless the runtime may not keep the process alive for a fully
 * un-awaited fetch. We kick it off and intentionally do not block on the
 * response; if the platform drops the in-flight request, the worst case is that
 * the remaining users are simply picked up by the NEXT daily run (their docs
 * are still un-digested). No double-send risk either way (digestedAt gating).
 */
function triggerNextHop(args: {
  req: Request;
  secret: string;
  nextCursor: string;
  nextDepth: number;
}): boolean {
  const { req, secret, nextCursor, nextDepth } = args;
  const origin = selfOrigin(req);
  if (!origin) return false;

  const next = `${origin}/api/cron/activity-digest?cursor=${encodeURIComponent(
    nextCursor
  )}&depth=${nextDepth}`;

  try {
    // Intentionally not awaited — the chain hop runs as its own invocation.
    void fetch(next, {
      method: "GET",
      headers: { authorization: `Bearer ${secret}` },
      // keepalive helps the request survive the current invocation winding down.
      keepalive: true,
    }).catch((err) => {
      console.error("[activity-digest] self-chain fetch failed:", err);
    });
    return true;
  } catch (err) {
    console.error("[activity-digest] self-chain dispatch threw:", err);
    return false;
  }
}
