import "server-only";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { Workspace } from "@/lib/domain/workspace";
import { getWorkspaceEntitlements } from "@/lib/billing/getWorkspaceEntitlements";
import { getPlanCatalog } from "@/lib/billing/getPlanCatalog";
import type { PlanId } from "@/lib/billing/plans";
import { getUserByIdRepo } from "@/lib/repositories/usersRepository.server";
import {
  sendPlanLimitApproachingEmail,
  sendPlanLimitHitEmail,
} from "./notificationEmails";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://annote.ai";
const UPGRADE_URL = `${APP_URL}/settings?tab=billing`;

/**
 * Phase 5 — plan-limit email dispatch.
 *
 * Both emails fire at most once per billing cycle. The guard is
 * workspace.planLimitWarnings.{approaching,hit}.lastSentAt: if it predates the
 * current cycle start (usage.feedbackResetDate, the 1st of the month) we may
 * send and then stamp it. The stamp is written in a transaction so concurrent
 * feedback creates can't double-send.
 *
 * Everything here is best-effort: callers invoke inside fireAndForget /
 * .catch(), so a throw never blocks (or fails) feedback creation.
 */

type WarningKind = "approaching" | "hit";

/** "YYYY-MM-DD" (1st of current month) → start-of-cycle millis. */
function cycleStartMillis(workspace: Workspace): number {
  const reset = workspace.usage?.feedbackResetDate ?? "";
  const parsed = Date.parse(`${reset}T00:00:00.000Z`);
  // Missing/garbage reset date → treat as "very old" so we don't permanently
  // suppress the email; the per-cycle dedupe still holds within a cycle via
  // the freshly-stamped timestamp.
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Human reset date for the email body: the 1st of NEXT month, e.g. "June 1, 2026". */
function humanResetDate(workspace: Workspace): string {
  const reset = workspace.usage?.feedbackResetDate ?? "";
  const base = new Date(`${reset}T00:00:00.000Z`);
  const d = Number.isNaN(base.getTime()) ? new Date() : base;
  const next = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
  return next.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Claim the once-per-cycle slot for `kind`. Returns true exactly once per
 * billing cycle (the caller that wins should send the email).
 */
async function claimCycleSlot(
  workspaceId: string,
  kind: WarningKind,
  cycleStart: number
): Promise<boolean> {
  const ref = adminDb.doc(`workspaces/${workspaceId}`);
  return adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return false;
    const lastSent = snap.data()?.planLimitWarnings?.[kind]?.lastSentAt as
      | Timestamp
      | undefined;
    if (lastSent && lastSent.toMillis() >= cycleStart) {
      return false; // already sent this cycle
    }
    tx.set(
      ref,
      {
        planLimitWarnings: {
          [kind]: { lastSentAt: FieldValue.serverTimestamp() },
        },
      },
      { merge: true }
    );
    return true;
  });
}

async function resolvePlanContext(workspace: Workspace): Promise<{
  planName: string;
  planLimit: number | null;
  ownerId: string;
}> {
  const plan = (workspace.billing?.plan ?? "starter") as PlanId;
  const [entitlements, catalog] = await Promise.all([
    getWorkspaceEntitlements(workspace),
    getPlanCatalog(),
  ]);
  const planName = catalog[plan]?.name ?? "your plan";
  return {
    planName,
    planLimit: entitlements.maxFeedbackPerMonth,
    ownerId: workspace.ownerId,
  };
}

/**
 * Fire the "approaching" email iff THIS feedback crossed the 80% threshold
 * (was under 80% before, at/over 80% but under 100% after) and we haven't
 * already sent it this cycle. `postIncrementUsage` is the count AFTER the
 * just-created feedback.
 */
export async function maybeSendPlanLimitApproaching(params: {
  workspace: Workspace;
  postIncrementUsage: number;
}): Promise<void> {
  const { workspace, postIncrementUsage } = params;
  const { planName, planLimit, ownerId } = await resolvePlanContext(workspace);
  if (!planLimit || !Number.isFinite(planLimit) || !ownerId) return;

  const ratioAfter = postIncrementUsage / planLimit;
  const ratioBefore = (postIncrementUsage - 1) / planLimit;
  const crossed80 =
    ratioBefore < 0.8 && ratioAfter >= 0.8 && ratioAfter < 1.0;
  if (!crossed80) return;

  const won = await claimCycleSlot(
    workspace.id,
    "approaching",
    cycleStartMillis(workspace)
  );
  if (!won) return;

  const owner = await getUserByIdRepo(ownerId);
  if (!owner?.email) return;

  const remaining = Math.max(0, planLimit - postIncrementUsage);
  await sendPlanLimitApproachingEmail({
    owner,
    planName,
    usageCount: postIncrementUsage,
    planLimit,
    workspaceName: workspace.name,
    // We don't model a per-day capture rate; surface captures-remaining as a
    // conservative "days" proxy (1 day per remaining capture, min 1).
    daysRemaining: Math.max(1, remaining),
    resetDate: humanResetDate(workspace),
    upgradeUrl: UPGRADE_URL,
  });
}

/**
 * Fire the "hit" email when the workspace is at/over its monthly cap and we
 * haven't already sent it this cycle. Called when checkFeedbackTicketLimit
 * blocks a create with PLAN_LIMIT_REACHED.
 */
export async function maybeSendPlanLimitHit(params: {
  workspace: Workspace;
}): Promise<void> {
  const { workspace } = params;
  const { planLimit, ownerId } = await resolvePlanContext(workspace);
  if (!planLimit || !Number.isFinite(planLimit) || !ownerId) return;

  const won = await claimCycleSlot(
    workspace.id,
    "hit",
    cycleStartMillis(workspace)
  );
  if (!won) return;

  const owner = await getUserByIdRepo(ownerId);
  if (!owner?.email) return;

  await sendPlanLimitHitEmail({
    owner,
    planLimit,
    workspaceName: workspace.name,
    resetDate: humanResetDate(workspace),
    upgradeUrl: UPGRADE_URL,
  });
}
