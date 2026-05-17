import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { getPaymentProvider } from "@/lib/billing/payments";
import { logAdminAction } from "@/lib/admin/adminLogs";
import {
  sendSubscriptionConfirmationEmail,
  sendSubscriptionCancelledEmail,
  sendPaymentFailedEmail,
} from "@/lib/email/billingEmails";
import type { WebhookEvent } from "@/lib/billing/payments/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://echly.com";
const BILLING_PORTAL_URL = `${APP_URL}/settings?tab=billing`;

/**
 * Resolve the owner email + workspace name for a workspace. Inlined (rather
 * than a shared helper) — billing emails need both `to` and `workspaceName`.
 */
async function getWorkspaceContext(
  workspaceId: string
): Promise<{ ownerEmail: string | null; workspaceName: string }> {
  try {
    const wsSnap = await adminDb.doc(`workspaces/${workspaceId}`).get();
    if (!wsSnap.exists) return { ownerEmail: null, workspaceName: "Your workspace" };
    const ws = wsSnap.data() as { ownerId?: string; name?: string } | undefined;
    const workspaceName = ws?.name ?? "Your workspace";
    if (!ws?.ownerId) return { ownerEmail: null, workspaceName };
    const userSnap = await adminDb.doc(`users/${ws.ownerId}`).get();
    if (!userSnap.exists) return { ownerEmail: null, workspaceName };
    const u = userSnap.data() as { email?: string } | undefined;
    return { ownerEmail: u?.email ?? null, workspaceName };
  } catch {
    return { ownerEmail: null, workspaceName: "Your workspace" };
  }
}

export async function POST(req: Request) {
  // Pre-validation (cheap 400 cases). Signature/body are checked before any
  // provider work so a malformed request never reaches the SDK.
  const signature = req.headers.get("paddle-signature") ?? "";
  const rawBody = await req.text();

  // DEV-ONLY: skip-signature mode for fixture testing. Guarded by NODE_ENV
  // AND a shared secret header so it cannot be triggered in production.
  const isDev = process.env.NODE_ENV !== "production";
  const devTestHeader = req.headers.get("x-echly-webhook-test");
  const skipSignature = Boolean(
    isDev && devTestHeader && devTestHeader === process.env.CRON_SECRET
  );

  if (!skipSignature) {
    if (!signature) {
      return NextResponse.json(
        { error: "Missing paddle-signature header" },
        { status: 400 }
      );
    }
    if (!rawBody) {
      return NextResponse.json({ error: "Empty body" }, { status: 400 });
    }
  }

  try {
    let event: WebhookEvent;
    if (skipSignature) {
      // Dev mode: trust the body as an already-normalized fixture.
      event = JSON.parse(rawBody) as WebhookEvent;
    } else {
      const provider = getPaymentProvider();
      event = await provider.parseWebhookEvent(rawBody, signature);
    }

    switch (event.type) {
      case "subscription_started":
        await handleSubscriptionStarted(event);
        break;
      case "subscription_updated":
        await handleSubscriptionUpdated(event);
        break;
      case "subscription_canceled":
        await handleSubscriptionCanceled(event);
        break;
      case "payment_failed":
        await handlePaymentFailed(event);
        break;
      case "unknown":
        // No-op — includes transaction.completed and any unhandled type.
        console.log(
          `[webhook] Unhandled event type (no-op), eventId=${event.eventId}`
        );
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[webhook] handler error:", err);
    // 500 — Paddle will retry. NOT 400: Paddle has no "stop retrying" status,
    // and a 400 on a rotated/expired secret would silently drop events.
    return NextResponse.json(
      { error: "Internal handler error", received: false },
      { status: 500 }
    );
  }
}

async function handleSubscriptionStarted(
  event: Extract<WebhookEvent, { type: "subscription_started" }>
) {
  const provider = getPaymentProvider();

  // Resolve workspaceId: primary (customData) → fallback (query by customerId).
  let workspaceId = event.data.workspaceId;
  if (!workspaceId) {
    const snapshot = await adminDb
      .collection("workspaces")
      .where("billing.customerId", "==", event.data.customerId)
      .limit(1)
      .get();
    if (!snapshot.empty) {
      workspaceId = snapshot.docs[0].id;
    }
  }

  if (!workspaceId) {
    // Unrecoverable — log and accept (don't 500-loop on a permanently
    // unresolvable event).
    await logAdminAction({
      adminId: "billing-webhook",
      action: "webhook_unresolved_workspace",
      workspaceId: null,
      metadata: {
        event: "subscription_started",
        customerId: event.data.customerId,
        subscriptionId: event.data.subscriptionId,
      },
    });
    console.error(
      "[webhook] subscription_started: could not resolve workspace",
      event.data
    );
    return;
  }

  const wsRef = adminDb.collection("workspaces").doc(workspaceId);
  const wsSnap = await wsRef.get();
  const ws = wsSnap.data() as
    | { name?: string; billing?: { plan?: string; subscriptionId?: string | null; manualOverride?: boolean } }
    | undefined;

  if (!ws) {
    console.error(`[webhook] workspace ${workspaceId} not found`);
    return;
  }

  const wasManualOverride = ws.billing?.manualOverride === true;
  const alreadyPaid =
    (ws.billing?.plan === "business" || ws.billing?.plan === "enterprise") &&
    !!ws.billing?.subscriptionId;

  // Idempotency: a genuine duplicate delivery finds the workspace already on
  // a paid plan with a real subscription AND not a comp. A comp'd workspace
  // must still fall through to write the real IDs and clear the comp flag.
  if (alreadyPaid && !wasManualOverride) {
    console.log(
      `[webhook] subscription_started already applied for workspace ${workspaceId} — skipping (idempotency)`
    );
    return;
  }

  const subData = await provider.getSubscriptionData(
    event.data.subscriptionId
  );

  // Real payment supersedes any admin-granted comp.
  const startedUpdates: Record<string, unknown> = {
    "billing.plan": "business",
    "billing.customerId": event.data.customerId,
    "billing.subscriptionId": event.data.subscriptionId,
    "billing.seats": subData.seatCount,
    "billing.billingCycle": subData.billingCycle,
    "billing.suspended": false,
    "billing.manualOverride": false,
    // A fresh subscription is never mid-cancellation — clear any stale flag
    // (e.g. cancel-then-resubscribe).
    "billing.cancelAt": null,
    updatedAt: FieldValue.serverTimestamp(),
  };
  // Only write the card when the provider returned one — never clobber an
  // existing card with null on a partial event.
  if (subData.paymentMethod) {
    startedUpdates["billing.paymentMethod"] = subData.paymentMethod;
  }
  await wsRef.update(startedUpdates);

  await logAdminAction({
    adminId: "billing-webhook",
    action: "subscription_activated",
    workspaceId,
    metadata: {
      customerId: event.data.customerId,
      subscriptionId: event.data.subscriptionId,
      seatCount: subData.seatCount,
      billingCycle: subData.billingCycle,
    },
  });

  if (wasManualOverride) {
    await logAdminAction({
      adminId: "billing-webhook",
      action: "webhook_cleared_manual_override",
      workspaceId,
      metadata: {
        reason: "real_payment_completed",
        customerId: event.data.customerId,
        subscriptionId: event.data.subscriptionId,
      },
    });
  }

  const { ownerEmail, workspaceName } = await getWorkspaceContext(workspaceId);
  if (ownerEmail) {
    await sendSubscriptionConfirmationEmail({
      to: ownerEmail,
      workspaceName,
      seatCount: subData.seatCount,
      billingCycle: subData.billingCycle,
      nextBillingDate: subData.currentPeriodEnd,
    });
  }
}

async function handleSubscriptionUpdated(
  event: Extract<WebhookEvent, { type: "subscription_updated" }>
) {
  const provider = getPaymentProvider();

  const snapshot = await adminDb
    .collection("workspaces")
    .where("billing.subscriptionId", "==", event.data.subscriptionId)
    .limit(1)
    .get();

  if (snapshot.empty) {
    console.warn(
      `[webhook] subscription_updated: no workspace for sub ${event.data.subscriptionId}`
    );
    return;
  }

  const wsRef = snapshot.docs[0].ref;
  const ws = snapshot.docs[0].data() as
    | { billing?: { manualOverride?: boolean } }
    | undefined;

  // Re-fetch current state from Paddle (convergent — don't trust the delta).
  const subData = await provider.getSubscriptionData(
    event.data.subscriptionId
  );

  const shouldSuspend = subData.status === "past_due";
  const isManualOverride = ws?.billing?.manualOverride === true;

  // Seats/billingCycle are normal changes and apply even to a comp.
  const updates: Record<string, unknown> = {
    "billing.seats": subData.seatCount,
    "billing.billingCycle": subData.billingCycle,
    updatedAt: FieldValue.serverTimestamp(),
  };

  // Track a scheduled cancellation so the UI can show the grace-period
  // banner. `cancelAtPeriodEnd` is true while a cancel is scheduled (the sub
  // is still active until `currentPeriodEnd`); reverting the cancel via the
  // portal flips it back to false → clear the field. Convergent: we re-read
  // current state from Paddle above, so this self-heals on reversion.
  updates["billing.cancelAt"] = subData.cancelAtPeriodEnd
    ? subData.currentPeriodEnd
    : null;

  // Card may change on a subscription update (customer swapped cards via the
  // portal). Only write when present — don't null out a known card.
  if (subData.paymentMethod) {
    updates["billing.paymentMethod"] = subData.paymentMethod;
  }

  // Only the suspended field is gated by manualOverride.
  if (!isManualOverride) {
    updates["billing.suspended"] = shouldSuspend;
  } else if (shouldSuspend) {
    await logAdminAction({
      adminId: "billing-webhook",
      action: "webhook_skip_suspend_manual_override",
      workspaceId: wsRef.id,
      metadata: {
        event: "subscription_updated",
        subscriptionId: event.data.subscriptionId,
      },
    });
  }

  await wsRef.update(updates);
}

async function handleSubscriptionCanceled(
  event: Extract<WebhookEvent, { type: "subscription_canceled" }>
) {
  const snapshot = await adminDb
    .collection("workspaces")
    .where("billing.subscriptionId", "==", event.data.subscriptionId)
    .limit(1)
    .get();

  if (snapshot.empty) {
    console.warn(
      `[webhook] subscription_canceled: no workspace for sub ${event.data.subscriptionId}`
    );
    return;
  }

  const wsRef = snapshot.docs[0].ref;
  const ws = snapshot.docs[0].data() as
    | { billing?: { plan?: string; manualOverride?: boolean } }
    | undefined;

  if (ws?.billing?.manualOverride === true) {
    console.log(
      `[webhook] subscription_canceled on manual-override workspace ${wsRef.id} — skipping downgrade`
    );
    await logAdminAction({
      adminId: "billing-webhook",
      action: "webhook_skip_downgrade_manual_override",
      workspaceId: wsRef.id,
      metadata: {
        event: "subscription_canceled",
        subscriptionId: event.data.subscriptionId,
      },
    });
    return;
  }

  // Idempotency guard: only email on a real state transition. A duplicate
  // delivery finds the workspace already on starter — skip the email.
  const wasOnPaidPlan =
    ws?.billing?.plan === "business" || ws?.billing?.plan === "enterprise";

  await wsRef.update({
    "billing.plan": "starter",
    "billing.seats": 1,
    "billing.subscriptionId": null,
    "billing.billingCycle": "monthly",
    // The scheduled cancel has now landed — drop the grace-period flag.
    "billing.cancelAt": null,
    updatedAt: FieldValue.serverTimestamp(),
  });

  await logAdminAction({
    adminId: "billing-webhook",
    action: "subscription_cancelled",
    workspaceId: wsRef.id,
    metadata: {
      subscriptionId: event.data.subscriptionId,
      previousPlan: ws?.billing?.plan,
    },
  });

  if (wasOnPaidPlan) {
    const { ownerEmail, workspaceName } = await getWorkspaceContext(wsRef.id);
    if (ownerEmail) {
      await sendSubscriptionCancelledEmail({
        to: ownerEmail,
        workspaceName,
      });
    }
  }
}

async function handlePaymentFailed(
  event: Extract<WebhookEvent, { type: "payment_failed" }>
) {
  if (!event.data.subscriptionId) {
    console.warn(
      "[webhook] payment_failed without subscriptionId — skipping"
    );
    return;
  }

  const snapshot = await adminDb
    .collection("workspaces")
    .where("billing.subscriptionId", "==", event.data.subscriptionId)
    .limit(1)
    .get();

  if (snapshot.empty) {
    console.warn(
      `[webhook] payment_failed: no workspace for sub ${event.data.subscriptionId}`
    );
    return;
  }

  const wsRef = snapshot.docs[0].ref;
  const ws = snapshot.docs[0].data() as
    | { billing?: { suspended?: boolean; manualOverride?: boolean } }
    | undefined;

  if (ws?.billing?.manualOverride === true) {
    console.log(
      `[webhook] payment_failed on manual-override workspace ${wsRef.id} — skipping suspend`
    );
    await logAdminAction({
      adminId: "billing-webhook",
      action: "webhook_skip_suspend_manual_override",
      workspaceId: wsRef.id,
      metadata: {
        event: "payment_failed",
        subscriptionId: event.data.subscriptionId,
      },
    });
    return;
  }

  // Idempotency guard: only email + log on the FIRST failure delivery. A
  // duplicate delivery finds the workspace already suspended — skip both.
  const wasSuspended = ws?.billing?.suspended === true;

  await wsRef.update({
    "billing.suspended": true,
    updatedAt: FieldValue.serverTimestamp(),
  });

  if (!wasSuspended) {
    const { ownerEmail, workspaceName } = await getWorkspaceContext(wsRef.id);
    if (ownerEmail) {
      await sendPaymentFailedEmail({
        to: ownerEmail,
        workspaceName,
        portalUrl: BILLING_PORTAL_URL,
      });
    }
    await logAdminAction({
      adminId: "billing-webhook",
      action: "payment_failed",
      workspaceId: wsRef.id,
      metadata: {
        subscriptionId: event.data.subscriptionId,
      },
    });
  }
}
