import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { getPaymentProvider } from "@/lib/billing/payments";
import { logAdminAction } from "@/lib/admin/adminLogs";
import {
  sendSubscriptionConfirmationEmail,
  sendSubscriptionCancelledEmail,
  sendPaymentFailedEmail,
  sendRenewalReceiptEmail,
  sendUpcomingRenewalReminderEmail,
  sendCardExpiringEmail,
  sendPaymentMethodUpdatedEmail,
} from "@/lib/email/billingEmails";
import type { WebhookEvent } from "@/lib/billing/payments/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://annote.ai";
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
  const provider = getPaymentProvider();
  const signature = req.headers.get(provider.signatureHeaderName) ?? "";
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
        { error: `Missing ${provider.signatureHeaderName} header` },
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
      event = await provider.parseWebhookEvent(rawBody, signature);
    }

    // ─── Idempotency check ─────────────────────────────────────────
    // Dedup keyed by eventId. Protects against duplicate webhook deliveries —
    // Stripe retries on non-2xx responses.
    // Side-effect free if we've already processed this event.
    const idempotencyDocId = `${provider.name}_${event.eventId}`;
    const idempotencyRef = adminDb
      .collection("webhookEvents")
      .doc(idempotencyDocId);
    const idempotencySnap = await idempotencyRef.get();
    if (idempotencySnap.exists) {
      console.log(
        `[webhook] Duplicate delivery detected (already processed), eventId=${event.eventId} — skipping`
      );
      return NextResponse.json({ received: true, deduped: true });
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
        await handleUnknownEvent(event);
        break;
    }

    // ─── Record successful processing ──────────────────────────────
    // After all side effects succeed, record this event so a redelivery
    // is recognized as a duplicate. Includes TTL field for Firestore auto-cleanup
    // (configure 30-day TTL on `expiresAt` field in Firebase Console).
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await idempotencyRef.set({
      provider: provider.name,
      eventId: event.eventId,
      eventType: event.type,
      processedAt: FieldValue.serverTimestamp(),
      expiresAt,
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[webhook] handler error:", err);
    // 500 — provider will retry. NOT 400: a 400 on a rotated/expired secret
    // would silently drop events.
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
    // Next renewal date for the Current Plan card.
    "billing.nextBilledAt": subData.currentPeriodEnd,
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

  // Re-fetch current state from provider (convergent — don't trust the delta).
  const subData = await provider.getSubscriptionData(
    event.data.subscriptionId
  );

  const shouldSuspend = subData.status === "past_due";
  const isManualOverride = ws?.billing?.manualOverride === true;

  // Seats/billingCycle are normal changes and apply even to a comp.
  const updates: Record<string, unknown> = {
    "billing.seats": subData.seatCount,
    "billing.billingCycle": subData.billingCycle,
    // Keep the renewal date converged with the provider. The card hides this
    // line while a cancel is pending (`cancelAt` set), so it's safe to track
    // the real period end here; self-heals if the cancel is reverted.
    "billing.nextBilledAt": subData.currentPeriodEnd,
    updatedAt: FieldValue.serverTimestamp(),
  };

  // Track a scheduled cancellation so the UI can show the grace-period
  // banner. `cancelAtPeriodEnd` is true while a cancel is scheduled (the sub
  // is still active until `currentPeriodEnd`); reverting the cancel via the
  // portal flips it back to false → clear the field. Convergent: we re-read
  // current state from the provider above, so this self-heals on reversion.
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
    // No subscription left — clear the renewal date so the card doesn't show
    // a stale "Renews on" line.
    "billing.nextBilledAt": null,
    // A canceled subscription cannot be "suspended" — these are mutually
    // exclusive states. Clearing it here prevents the durable divergent
    // state (starter + suspended) that produced the dashboard flip-flop.
    "billing.suspended": false,
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

/**
 * Handles Stripe events that aren't part of the normalized WebhookEvent union.
 * Reads the raw Stripe event from event.data.stripeEvent and dispatches to
 * specialized handlers. For provider-agnostic events (none currently), no-op.
 */
async function handleUnknownEvent(
  event: Extract<WebhookEvent, { type: "unknown" }>
) {
  const stripeEventType = event.data.stripeEventType as string | undefined;
  if (!stripeEventType) {
    console.log(`[webhook] Unknown event with no stripeEventType, eventId=${event.eventId}`);
    return;
  }

  switch (stripeEventType) {
    case "invoice.paid":
      await handleInvoicePaid(event);
      break;
    case "invoice.upcoming":
      await handleInvoiceUpcoming(event);
      break;
    case "customer.source.expiring":
    case "payment_method.attached":
      await handlePaymentMethodEvent(event, stripeEventType);
      break;
    default:
      console.log(
        `[webhook] No-op Stripe event ${stripeEventType}, eventId=${event.eventId}`
      );
  }
}

async function handleInvoicePaid(
  event: Extract<WebhookEvent, { type: "unknown" }>
) {
  const stripeEvent = event.data.stripeEvent as {
    data: { object: Record<string, unknown> };
  };
  const invoice = stripeEvent.data.object;
  // Skip the first invoice (subscription creation) — subscription_started handles that.
  // Stripe sends invoice.paid for both first payment AND renewals; filter to renewals only.
  if (invoice.billing_reason !== "subscription_cycle") {
    console.log(`[webhook] invoice.paid skipped — billing_reason=${invoice.billing_reason}`);
    return;
  }

  // API 2026-04-22.dahlia: subscription ref lives on invoice.parent.subscription_details.subscription
  const parent = invoice.parent as
    | { subscription_details?: { subscription?: string | { id: string } } }
    | null
    | undefined;
  const subRef = parent?.subscription_details?.subscription ?? null;
  const subscriptionId =
    typeof subRef === "string" ? subRef : subRef?.id ?? null;
  const customerId = invoice.customer as string;

  if (!subscriptionId) {
    console.warn("[webhook] invoice.paid without subscription — skipping");
    return;
  }
  void customerId;

  const snapshot = await adminDb
    .collection("workspaces")
    .where("billing.subscriptionId", "==", subscriptionId)
    .limit(1)
    .get();

  if (snapshot.empty) {
    console.warn(`[webhook] invoice.paid: no workspace for sub ${subscriptionId}`);
    return;
  }

  const workspaceId = snapshot.docs[0].id;
  const { ownerEmail, workspaceName } = await getWorkspaceContext(workspaceId);
  if (!ownerEmail) {
    console.warn(`[webhook] invoice.paid: no owner email for workspace ${workspaceId}`);
    return;
  }

  // Re-fetch subscription to get current seats, cycle, next billing
  const provider = getPaymentProvider();
  const subData = await provider.getSubscriptionData(subscriptionId);

  const amountInMinorUnits = invoice.amount_paid as number;
  const currency = (invoice.currency as string) ?? "usd";
  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountInMinorUnits / 100);

  await sendRenewalReceiptEmail({
    to: ownerEmail,
    workspaceName,
    amount,
    seatCount: subData.seatCount,
    billingCycle: subData.billingCycle,
    invoiceNumber: (invoice.number as string | null) ?? null,
    invoiceDate: new Date((invoice.created as number) * 1000),
    nextBillingDate: subData.currentPeriodEnd,
    invoicePdfUrl: (invoice.invoice_pdf as string | null) ?? null,
  });
}

async function handleInvoiceUpcoming(
  event: Extract<WebhookEvent, { type: "unknown" }>
) {
  // Stripe sends this ~7 days before renewal (configured in Stripe Dashboard).
  const stripeEvent = event.data.stripeEvent as {
    data: { object: Record<string, unknown> };
  };
  const invoice = stripeEvent.data.object;

  const parent = invoice.parent as
    | { subscription_details?: { subscription?: string | { id: string } } }
    | null
    | undefined;
  const subRef = parent?.subscription_details?.subscription ?? null;
  const subscriptionId =
    typeof subRef === "string" ? subRef : subRef?.id ?? null;

  if (!subscriptionId) {
    console.warn("[webhook] invoice.upcoming without subscription — skipping");
    return;
  }

  const snapshot = await adminDb
    .collection("workspaces")
    .where("billing.subscriptionId", "==", subscriptionId)
    .limit(1)
    .get();

  if (snapshot.empty) {
    console.warn(`[webhook] invoice.upcoming: no workspace for sub ${subscriptionId}`);
    return;
  }

  const workspaceId = snapshot.docs[0].id;
  const ws = snapshot.docs[0].data() as
    | { billing?: { paymentMethod?: { brand: string; last4: string } | null } }
    | undefined;
  const { ownerEmail, workspaceName } = await getWorkspaceContext(workspaceId);
  if (!ownerEmail) return;

  const provider = getPaymentProvider();
  const subData = await provider.getSubscriptionData(subscriptionId);

  const amountInMinorUnits = (invoice.amount_due as number) ?? 0;
  const currency = (invoice.currency as string) ?? "usd";
  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountInMinorUnits / 100);

  await sendUpcomingRenewalReminderEmail({
    to: ownerEmail,
    workspaceName,
    amount,
    seatCount: subData.seatCount,
    billingCycle: subData.billingCycle,
    nextBillingDate: subData.currentPeriodEnd,
    cardBrand: ws?.billing?.paymentMethod?.brand,
    cardLast4: ws?.billing?.paymentMethod?.last4,
  });
}

async function handlePaymentMethodEvent(
  event: Extract<WebhookEvent, { type: "unknown" }>,
  stripeEventType: string
) {
  const stripeEvent = event.data.stripeEvent as {
    data: { object: Record<string, unknown> };
  };
  const obj = stripeEvent.data.object;

  // Find workspace by customer ID
  const customerId =
    typeof obj.customer === "string"
      ? obj.customer
      : (obj.customer as { id?: string } | undefined)?.id;
  if (!customerId) return;

  const snapshot = await adminDb
    .collection("workspaces")
    .where("billing.customerId", "==", customerId)
    .limit(1)
    .get();

  if (snapshot.empty) {
    console.warn(`[webhook] ${stripeEventType}: no workspace for customer ${customerId}`);
    return;
  }

  const workspaceId = snapshot.docs[0].id;
  const { ownerEmail, workspaceName } = await getWorkspaceContext(workspaceId);
  if (!ownerEmail) return;

  if (stripeEventType === "customer.source.expiring") {
    const card = obj as {
      brand?: string;
      last4?: string;
      exp_month?: number;
      exp_year?: number;
    };
    if (!card.brand || !card.last4 || !card.exp_month || !card.exp_year) return;
    await sendCardExpiringEmail({
      to: ownerEmail,
      workspaceName,
      cardBrand: card.brand,
      cardLast4: card.last4,
      expiryMonth: card.exp_month,
      expiryYear: card.exp_year,
    });
  } else if (stripeEventType === "payment_method.attached") {
    const pm = obj as { card?: { brand: string; last4: string } };
    if (!pm.card) return;
    await sendPaymentMethodUpdatedEmail({
      to: ownerEmail,
      workspaceName,
      cardBrand: pm.card.brand,
      cardLast4: pm.card.last4,
    });
  }
}
