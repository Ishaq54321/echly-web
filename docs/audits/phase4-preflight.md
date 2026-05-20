# Phase 4 — Stripe webhook + remaining backend pre-flight audit

Read-only snapshot. Captures only what Phase 1, the Paddle-migration audit, and Phase 3 didn't cover. All line numbers are anchored to the files as they exist today.

---

## Section 1 — Stripe provider stub state

### 1.1 `lib/billing/payments/stripe.ts` (full contents, post Phase 3)

```ts
  1  import Stripe from "stripe";
  2  import type {
  3    PaymentProvider,
  4    CheckoutParams,
  5    CheckoutResult,
  6    PortalParams,
  7    PortalResult,
  8    WebhookEvent,
  9    SubscriptionData,
 10    TransactionSummary,
 11    ProrationMode,
 12  } from "./types";
 13
 14  // ────────────────────────────────────────────────────────────────────
 15  // SDK SINGLETON
 16  // ────────────────────────────────────────────────────────────────────
 17
 18  let _stripe: Stripe | null = null;
 19
 20  function getStripe(): Stripe {
 21    if (_stripe) return _stripe;
 22    const key = process.env.STRIPE_SECRET_KEY;
 23    if (!key) {
 24      throw new Error(
 25        "[stripe] STRIPE_SECRET_KEY env var is not set. Did you copy .env.example to .env.local?"
 26      );
 27    }
 28    _stripe = new Stripe(key, {
 29      // Pin the API version explicitly — never let Stripe upgrade your responses underneath you.
 30      // Sourced from the SDK's exported ApiVersion constant (stripe@22.1.1).
 31      apiVersion: "2026-04-22.dahlia",
 32      appInfo: {
 33        name: "Annote",
 34        url: "https://annote.ai",
 35      },
 36      typescript: true,
 37    });
 38    return _stripe;
 39  }
 40
 41  // ────────────────────────────────────────────────────────────────────
 42  // PROVIDER IMPLEMENTATION
 43  // ────────────────────────────────────────────────────────────────────
 44
 45  export class StripeProvider implements PaymentProvider {
 46    readonly signatureHeaderName = "stripe-signature";
 47    readonly name = "stripe";
 48
 49    resolveBusinessPriceId(billingCycle: "monthly" | "annual"): string {
 50      const id =
 51        billingCycle === "annual"
 52          ? process.env.STRIPE_BUSINESS_PRICE_ANNUAL_ID
 53          : process.env.STRIPE_BUSINESS_PRICE_MONTHLY_ID;
 54      if (!id) {
 55        throw new Error(
 56          `[stripe] Missing STRIPE_BUSINESS_PRICE_${billingCycle === "annual" ? "ANNUAL" : "MONTHLY"}_ID env var.`
 57        );
 58      }
 59      return id;
 60    }
 61
 62    async createCheckoutSession(params: CheckoutParams): Promise<CheckoutResult> {
 63      const stripe = getStripe();
 64      const priceId = this.resolveBusinessPriceId(params.billingCycle);
 65
 66      // Customer identification:
 67      // - If we have an existing Stripe customer ID for this workspace, pass `customer`
 68      // - Otherwise pass `customer_email` and let Stripe create a Customer on checkout completion
 69      const customerParam:
 70        | { customer: string }
 71        | { customer_email: string } =
 72        params.existingCustomerId
 73          ? { customer: params.existingCustomerId }
 74          : { customer_email: params.ownerEmail };
 75
 76      // Metadata propagation:
 77      // - On the Session: searchable in the Stripe dashboard, available in checkout.session.* events
 78      // - On the Subscription (via subscription_data.metadata): available in customer.subscription.* events (Phase 4 webhook reads this)
 79      // - client_reference_id: convenience for dashboard filtering, no functional dependency
 80      const metadata = {
 81        workspaceId: params.workspaceId,
 82        ownerUid: params.ownerUid,
 83      };
 84
 85      const session = await stripe.checkout.sessions.create({
 86        mode: "subscription",
 87        line_items: [
 88          {
 89            price: priceId,
 90            quantity: params.seatCount,
 91          },
 92        ],
 93        ...customerParam,
 94        success_url: params.successUrl,
 95        cancel_url: params.cancelUrl,
 96        metadata,
 97        subscription_data: {
 98          metadata,
 99        },
 100        client_reference_id: params.workspaceId,
 101        // Allow card payments by default; Stripe enables Apple Pay / Google Pay / Link automatically
 102        payment_method_types: ["card"],
 103        // Always collect billing address — useful for tax compliance later, low friction
 104        billing_address_collection: "auto",
 105        // Allow promo codes (you can disable in Phase 5 if not using)
 106        allow_promotion_codes: true,
 107      });
 108
 109      if (!session.url) {
 110        throw new Error("[stripe] Checkout session created but url is null");
 111      }
 112
 113      return { url: session.url };
 114    }
 115
 116    async createPortalSession(_params: PortalParams): Promise<PortalResult> {
 117      // PHASE 4: implementation.
 118      throw new Error(
 119        "[stripe] createPortalSession is not yet implemented (Phase 4)."
 120      );
 121    }
 122
 123    async parseWebhookEvent(
 124      _body: string | Buffer,
 125      _signature: string
 126    ): Promise<WebhookEvent> {
 127      // PHASE 4: implementation will use stripe.webhooks.constructEvent and normalize to WebhookEvent union.
 128      throw new Error(
 129        "[stripe] parseWebhookEvent is not yet implemented (Phase 4)."
 130      );
 131    }
 132
 133    async getSubscriptionData(_subscriptionId: string): Promise<SubscriptionData> {
 134      // PHASE 4: implementation.
 135      throw new Error(
 136        "[stripe] getSubscriptionData is not yet implemented (Phase 4)."
 137      );
 138    }
 139
 140    async updateSubscriptionSeats(
 141      _subscriptionId: string,
 142      _newSeatCount: number
 143    ): Promise<void> {
 144      // PHASE 4: implementation.
 145      throw new Error(
 146        "[stripe] updateSubscriptionSeats is not yet implemented (Phase 4)."
 147      );
 148    }
 149
 150    async updateSubscriptionPlan(
 151      _subscriptionId: string,
 152      _newPriceId: string,
 153      _prorationMode?: ProrationMode
 154    ): Promise<void> {
 155      // PHASE 4: implementation.
 156      throw new Error(
 157        "[stripe] updateSubscriptionPlan is not yet implemented (Phase 4)."
 158      );
 159    }
 160
 161    async cancelSubscription(
 162      _subscriptionId: string,
 163      _atPeriodEnd: boolean
 164    ): Promise<void> {
 165      // PHASE 4: implementation.
 166      throw new Error(
 167        "[stripe] cancelSubscription is not yet implemented (Phase 4)."
 168      );
 169    }
 170
 171    async resumeSubscription(_subscriptionId: string): Promise<void> {
 172      // PHASE 4: implementation.
 173      throw new Error(
 174        "[stripe] resumeSubscription is not yet implemented (Phase 4)."
 175      );
 176    }
 177
 178    async listTransactions(_customerId: string): Promise<TransactionSummary[]> {
 179      // PHASE 4: implementation (uses stripe.invoices.list).
 180      throw new Error(
 181        "[stripe] listTransactions is not yet implemented (Phase 4)."
 182      );
 183    }
 184
 185    async getInvoicePdfUrl(_transactionId: string): Promise<string | null> {
 186      // PHASE 4: implementation (uses stripe.invoices.retrieve → invoice_pdf).
 187      throw new Error(
 188        "[stripe] getInvoicePdfUrl is not yet implemented (Phase 4)."
 189      );
 190    }
 191
 192    async getTransactionCustomerId(_transactionId: string): Promise<string | null> {
 193      // PHASE 4: implementation.
 194      throw new Error(
 195        "[stripe] getTransactionCustomerId is not yet implemented (Phase 4)."
 196      );
 197    }
 198  }
 199
```

**Stub vs implemented matrix:**

| Method | Line | State |
|---|---|---|
| `signatureHeaderName` / `name` | 46–47 | implemented (`"stripe-signature"` / `"stripe"`) |
| `resolveBusinessPriceId` | 49–60 | implemented |
| `createCheckoutSession` | 62–114 | implemented |
| `createPortalSession` | 116–121 | **stub** — throws |
| `parseWebhookEvent` | 123–131 | **stub** — throws |
| `getSubscriptionData` | 133–138 | **stub** — throws |
| `updateSubscriptionSeats` | 140–148 | **stub** — throws |
| `updateSubscriptionPlan` | 150–159 | **stub** — throws |
| `cancelSubscription` | 161–169 | **stub** — throws |
| `resumeSubscription` | 171–176 | **stub** — throws |
| `listTransactions` | 178–183 | **stub** — throws |
| `getInvoicePdfUrl` | 185–190 | **stub** — throws |
| `getTransactionCustomerId` | 192–197 | **stub** — throws |

SDK singleton (`getStripe`) at lines 18–39 reads `STRIPE_SECRET_KEY` and pins API version `"2026-04-22.dahlia"` (stripe@22.1.1).

---

## Section 2 — Webhook route (post Phase 1, current state)

### 2.1 `app/api/billing/webhook/route.ts` (full contents)

```ts
  1  import { NextResponse } from "next/server";
  2  import { FieldValue } from "firebase-admin/firestore";
  3  import { adminDb } from "@/lib/server/firebaseAdmin";
  4  import { getPaymentProvider } from "@/lib/billing/payments";
  5  import { logAdminAction } from "@/lib/admin/adminLogs";
  6  import {
  7    sendSubscriptionConfirmationEmail,
  8    sendSubscriptionCancelledEmail,
  9    sendPaymentFailedEmail,
 10  } from "@/lib/email/billingEmails";
 11  import type { WebhookEvent } from "@/lib/billing/payments/types";
 12
 13  export const runtime = "nodejs";
 14  export const dynamic = "force-dynamic";
 15
 16  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://annote.ai";
 17  const BILLING_PORTAL_URL = `${APP_URL}/settings?tab=billing`;
 18
 19  /**
 20   * Resolve the owner email + workspace name for a workspace. Inlined (rather
 21   * than a shared helper) — billing emails need both `to` and `workspaceName`.
 22   */
 23  async function getWorkspaceContext(
 24    workspaceId: string
 25  ): Promise<{ ownerEmail: string | null; workspaceName: string }> {
 26    try {
 27      const wsSnap = await adminDb.doc(`workspaces/${workspaceId}`).get();
 28      if (!wsSnap.exists) return { ownerEmail: null, workspaceName: "Your workspace" };
 29      const ws = wsSnap.data() as { ownerId?: string; name?: string } | undefined;
 30      const workspaceName = ws?.name ?? "Your workspace";
 31      if (!ws?.ownerId) return { ownerEmail: null, workspaceName };
 32      const userSnap = await adminDb.doc(`users/${ws.ownerId}`).get();
 33      if (!userSnap.exists) return { ownerEmail: null, workspaceName };
 34      const u = userSnap.data() as { email?: string } | undefined;
 35      return { ownerEmail: u?.email ?? null, workspaceName };
 36    } catch {
 37      return { ownerEmail: null, workspaceName: "Your workspace" };
 38    }
 39  }
 40
 41  export async function POST(req: Request) {
 42    // Pre-validation (cheap 400 cases). Signature/body are checked before any
 43    // provider work so a malformed request never reaches the SDK.
 44    const provider = getPaymentProvider();
 45    const signature = req.headers.get(provider.signatureHeaderName) ?? "";
 46    const rawBody = await req.text();
 47
 48    // DEV-ONLY: skip-signature mode for fixture testing. Guarded by NODE_ENV
 49    // AND a shared secret header so it cannot be triggered in production.
 50    const isDev = process.env.NODE_ENV !== "production";
 51    const devTestHeader = req.headers.get("x-echly-webhook-test");
 52    const skipSignature = Boolean(
 53      isDev && devTestHeader && devTestHeader === process.env.CRON_SECRET
 54    );
 55
 56    if (!skipSignature) {
 57      if (!signature) {
 58        return NextResponse.json(
 59          { error: `Missing ${provider.signatureHeaderName} header` },
 60          { status: 400 }
 61        );
 62      }
 63      if (!rawBody) {
 64        return NextResponse.json({ error: "Empty body" }, { status: 400 });
 65      }
 66    }
 67
 68    try {
 69      let event: WebhookEvent;
 70      if (skipSignature) {
 71        // Dev mode: trust the body as an already-normalized fixture.
 72        event = JSON.parse(rawBody) as WebhookEvent;
 73      } else {
 74        event = await provider.parseWebhookEvent(rawBody, signature);
 75      }
 76
 77      // ─── Idempotency check ─────────────────────────────────────────
 78      // Provider-agnostic dedup keyed by eventId. Protects against duplicate
 79      // webhook deliveries (Stripe and Paddle both retry on non-2xx).
 80      // Side-effect free if we've already processed this event.
 81      const idempotencyDocId = `${provider.name}_${event.eventId}`;
 82      const idempotencyRef = adminDb
 83        .collection("webhookEvents")
 84        .doc(idempotencyDocId);
 85      const idempotencySnap = await idempotencyRef.get();
 86      if (idempotencySnap.exists) {
 87        console.log(
 88          `[webhook] Duplicate delivery detected (already processed), eventId=${event.eventId} — skipping`
 89        );
 90        return NextResponse.json({ received: true, deduped: true });
 91      }
 92
 93      switch (event.type) {
 94        case "subscription_started":
 95          await handleSubscriptionStarted(event);
 96          break;
 97        case "subscription_updated":
 98          await handleSubscriptionUpdated(event);
 99          break;
 100        case "subscription_canceled":
 101          await handleSubscriptionCanceled(event);
 102          break;
 103        case "payment_failed":
 104          await handlePaymentFailed(event);
 105          break;
 106        case "unknown":
 107          // No-op — includes transaction.completed and any unhandled type.
 108          console.log(
 109            `[webhook] Unhandled event type (no-op), eventId=${event.eventId}`
 110          );
 111          break;
 112      }
 113
 114      // ─── Record successful processing ──────────────────────────────
 115      // After all side effects succeed, record this event so a redelivery
 116      // is recognized as a duplicate. Includes TTL field for Firestore auto-cleanup
 117      // (configure 30-day TTL on `expiresAt` field in Firebase Console).
 118      const expiresAt = new Date();
 119      expiresAt.setDate(expiresAt.getDate() + 30);
 120      await idempotencyRef.set({
 121        provider: provider.name,
 122        eventId: event.eventId,
 123        eventType: event.type,
 124        processedAt: FieldValue.serverTimestamp(),
 125        expiresAt,
 126      });
 127
 128      return NextResponse.json({ received: true });
 129    } catch (err) {
 130      console.error("[webhook] handler error:", err);
 131      // 500 — Paddle will retry. NOT 400: Paddle has no "stop retrying" status,
 132      // and a 400 on a rotated/expired secret would silently drop events.
 133      return NextResponse.json(
 134        { error: "Internal handler error", received: false },
 135        { status: 500 }
 136      );
 137    }
 138  }
 139
 140  async function handleSubscriptionStarted(
 141    event: Extract<WebhookEvent, { type: "subscription_started" }>
 142  ) {
 143    const provider = getPaymentProvider();
 144
 145    // Resolve workspaceId: primary (customData) → fallback (query by customerId).
 146    let workspaceId = event.data.workspaceId;
 147    if (!workspaceId) {
 148      const snapshot = await adminDb
 149        .collection("workspaces")
 150        .where("billing.customerId", "==", event.data.customerId)
 151        .limit(1)
 152        .get();
 153      if (!snapshot.empty) {
 154        workspaceId = snapshot.docs[0].id;
 155      }
 156    }
 157
 158    if (!workspaceId) {
 159      // Unrecoverable — log and accept (don't 500-loop on a permanently
 160      // unresolvable event).
 161      await logAdminAction({
 162        adminId: "billing-webhook",
 163        action: "webhook_unresolved_workspace",
 224        workspaceId: null,
 165        metadata: {
 166          event: "subscription_started",
 167          customerId: event.data.customerId,
 168          subscriptionId: event.data.subscriptionId,
 169        },
 170      });
 171      console.error(
 172        "[webhook] subscription_started: could not resolve workspace",
 173        event.data
 174      );
 175      return;
 176    }
 177
 178    const wsRef = adminDb.collection("workspaces").doc(workspaceId);
 179    const wsSnap = await wsRef.get();
 180    const ws = wsSnap.data() as
 181      | { name?: string; billing?: { plan?: string; subscriptionId?: string | null; manualOverride?: boolean } }
 182      | undefined;
 183
 184    if (!ws) {
 185      console.error(`[webhook] workspace ${workspaceId} not found`);
 186      return;
 187    }
 188
 189    const wasManualOverride = ws.billing?.manualOverride === true;
 190    const alreadyPaid =
 191      (ws.billing?.plan === "business" || ws.billing?.plan === "enterprise") &&
 192      !!ws.billing?.subscriptionId;
 193
 194    // Idempotency: a genuine duplicate delivery finds the workspace already on
 195    // a paid plan with a real subscription AND not a comp. A comp'd workspace
 196    // must still fall through to write the real IDs and clear the comp flag.
 197    if (alreadyPaid && !wasManualOverride) {
 198      console.log(
 199        `[webhook] subscription_started already applied for workspace ${workspaceId} — skipping (idempotency)`
 200      );
 201      return;
 202    }
 203
 204    const subData = await provider.getSubscriptionData(
 205      event.data.subscriptionId
 206    );
 207
 208    // Real payment supersedes any admin-granted comp.
 209    const startedUpdates: Record<string, unknown> = {
 210      "billing.plan": "business",
 211      "billing.customerId": event.data.customerId,
 212      "billing.subscriptionId": event.data.subscriptionId,
 213      "billing.seats": subData.seatCount,
 214      "billing.billingCycle": subData.billingCycle,
 215      "billing.suspended": false,
 216      "billing.manualOverride": false,
 217      // A fresh subscription is never mid-cancellation — clear any stale flag
 218      // (e.g. cancel-then-resubscribe).
 219      "billing.cancelAt": null,
 220      // Next renewal date for the Current Plan card.
 221      "billing.nextBilledAt": subData.currentPeriodEnd,
 222      updatedAt: FieldValue.serverTimestamp(),
 223    };
 224    // Only write the card when the provider returned one — never clobber an
 225    // existing card with null on a partial event.
 226    if (subData.paymentMethod) {
 227      startedUpdates["billing.paymentMethod"] = subData.paymentMethod;
 228    }
 229    await wsRef.update(startedUpdates);
 230
 231    await logAdminAction({
 232      adminId: "billing-webhook",
 233      action: "subscription_activated",
 234      workspaceId,
 235      metadata: {
 236        customerId: event.data.customerId,
 237        subscriptionId: event.data.subscriptionId,
 238        seatCount: subData.seatCount,
 239        billingCycle: subData.billingCycle,
 240      },
 241    });
 242
 243    if (wasManualOverride) {
 244      await logAdminAction({
 245        adminId: "billing-webhook",
 246        action: "webhook_cleared_manual_override",
 247        workspaceId,
 248        metadata: {
 249          reason: "real_payment_completed",
 250          customerId: event.data.customerId,
 251          subscriptionId: event.data.subscriptionId,
 252        },
 253      });
 254    }
 255
 256    const { ownerEmail, workspaceName } = await getWorkspaceContext(workspaceId);
 257    if (ownerEmail) {
 258      await sendSubscriptionConfirmationEmail({
 259        to: ownerEmail,
 260        workspaceName,
 261        seatCount: subData.seatCount,
 262        billingCycle: subData.billingCycle,
 263        nextBillingDate: subData.currentPeriodEnd,
 264      });
 265    }
 266  }
 267
 268  async function handleSubscriptionUpdated(
 269    event: Extract<WebhookEvent, { type: "subscription_updated" }>
 270  ) {
 271    const provider = getPaymentProvider();
 272
 273    const snapshot = await adminDb
 274      .collection("workspaces")
 275      .where("billing.subscriptionId", "==", event.data.subscriptionId)
 276      .limit(1)
 277      .get();
 278
 279    if (snapshot.empty) {
 280      console.warn(
 281        `[webhook] subscription_updated: no workspace for sub ${event.data.subscriptionId}`
 282      );
 283      return;
 284    }
 285
 286    const wsRef = snapshot.docs[0].ref;
 287    const ws = snapshot.docs[0].data() as
 288      | { billing?: { manualOverride?: boolean } }
 289      | undefined;
 290
 291    // Re-fetch current state from Paddle (convergent — don't trust the delta).
 292    const subData = await provider.getSubscriptionData(
 293      event.data.subscriptionId
 294    );
 295
 296    const shouldSuspend = subData.status === "past_due";
 297    const isManualOverride = ws?.billing?.manualOverride === true;
 298
 299    // Seats/billingCycle are normal changes and apply even to a comp.
 300    const updates: Record<string, unknown> = {
 301      "billing.seats": subData.seatCount,
 302      "billing.billingCycle": subData.billingCycle,
 303      // Keep the renewal date converged with Paddle. The card hides this line
 304      // while a cancel is pending (`cancelAt` set), so it's safe to track the
 305      // real period end here; self-heals if the cancel is reverted.
 306      "billing.nextBilledAt": subData.currentPeriodEnd,
 307      updatedAt: FieldValue.serverTimestamp(),
 308    };
 309
 310    // Track a scheduled cancellation so the UI can show the grace-period
 311    // banner. `cancelAtPeriodEnd` is true while a cancel is scheduled (the sub
 312    // is still active until `currentPeriodEnd`); reverting the cancel via the
 313    // portal flips it back to false → clear the field. Convergent: we re-read
 314    // current state from Paddle above, so this self-heals on reversion.
 315    updates["billing.cancelAt"] = subData.cancelAtPeriodEnd
 316      ? subData.currentPeriodEnd
 317      : null;
 318
 319    // Card may change on a subscription update (customer swapped cards via the
 320    // portal). Only write when present — don't null out a known card.
 321    if (subData.paymentMethod) {
 322      updates["billing.paymentMethod"] = subData.paymentMethod;
 323    }
 324
 325    // Only the suspended field is gated by manualOverride.
 326    if (!isManualOverride) {
 327      updates["billing.suspended"] = shouldSuspend;
 328    } else if (shouldSuspend) {
 329      await logAdminAction({
 330        adminId: "billing-webhook",
 331        action: "webhook_skip_suspend_manual_override",
 332        workspaceId: wsRef.id,
 333        metadata: {
 334          event: "subscription_updated",
 335          subscriptionId: event.data.subscriptionId,
 336        },
 337      });
 338    }
 339
 340    await wsRef.update(updates);
 341  }
 342
 343  async function handleSubscriptionCanceled(
 344    event: Extract<WebhookEvent, { type: "subscription_canceled" }>
 345  ) {
 346    const snapshot = await adminDb
 347      .collection("workspaces")
 348      .where("billing.subscriptionId", "==", event.data.subscriptionId)
 349      .limit(1)
 350      .get();
 351
 352    if (snapshot.empty) {
 353      console.warn(
 354        `[webhook] subscription_canceled: no workspace for sub ${event.data.subscriptionId}`
 355      );
 356      return;
 357    }
 358
 359    const wsRef = snapshot.docs[0].ref;
 360    const ws = snapshot.docs[0].data() as
 361      | { billing?: { plan?: string; manualOverride?: boolean } }
 362      | undefined;
 363
 364    if (ws?.billing?.manualOverride === true) {
 365      console.log(
 366        `[webhook] subscription_canceled on manual-override workspace ${wsRef.id} — skipping downgrade`
 367      );
 368      await logAdminAction({
 369        adminId: "billing-webhook",
 370        action: "webhook_skip_downgrade_manual_override",
 371        workspaceId: wsRef.id,
 372        metadata: {
 373          event: "subscription_canceled",
 374          subscriptionId: event.data.subscriptionId,
 375        },
 376      });
 377      return;
 378    }
 379
 380    // Idempotency guard: only email on a real state transition. A duplicate
 381    // delivery finds the workspace already on starter — skip the email.
 382    const wasOnPaidPlan =
 383      ws?.billing?.plan === "business" || ws?.billing?.plan === "enterprise";
 384
 385    await wsRef.update({
 386      "billing.plan": "starter",
 387      "billing.seats": 1,
 388      "billing.subscriptionId": null,
 389      "billing.billingCycle": "monthly",
 390      // The scheduled cancel has now landed — drop the grace-period flag.
 391      "billing.cancelAt": null,
 392      // No subscription left — clear the renewal date so the card doesn't show
 393      // a stale "Renews on" line.
 394      "billing.nextBilledAt": null,
 395      // A canceled subscription cannot be "suspended" — these are mutually
 396      // exclusive states. Clearing it here prevents the durable divergent
 397      // state (starter + suspended) that produced the dashboard flip-flop.
 398      "billing.suspended": false,
 399      updatedAt: FieldValue.serverTimestamp(),
 400    });
 401
 402    await logAdminAction({
 403      adminId: "billing-webhook",
 404      action: "subscription_cancelled",
 405      workspaceId: wsRef.id,
 406      metadata: {
 407        subscriptionId: event.data.subscriptionId,
 408        previousPlan: ws?.billing?.plan,
 409      },
 410    });
 411
 412    if (wasOnPaidPlan) {
 413      const { ownerEmail, workspaceName } = await getWorkspaceContext(wsRef.id);
 414      if (ownerEmail) {
 415        await sendSubscriptionCancelledEmail({
 416          to: ownerEmail,
 417          workspaceName,
 418        });
 419      }
 420    }
 421  }
 422
 423  async function handlePaymentFailed(
 424    event: Extract<WebhookEvent, { type: "payment_failed" }>
 425  ) {
 426    if (!event.data.subscriptionId) {
 427      console.warn(
 428        "[webhook] payment_failed without subscriptionId — skipping"
 429      );
 430      return;
 431    }
 432
 433    const snapshot = await adminDb
 434      .collection("workspaces")
 435      .where("billing.subscriptionId", "==", event.data.subscriptionId)
 436      .limit(1)
 437      .get();
 438
 439    if (snapshot.empty) {
 440      console.warn(
 441        `[webhook] payment_failed: no workspace for sub ${event.data.subscriptionId}`
 442      );
 443      return;
 444    }
 445
 446    const wsRef = snapshot.docs[0].ref;
 447    const ws = snapshot.docs[0].data() as
 448      | { billing?: { suspended?: boolean; manualOverride?: boolean } }
 449      | undefined;
 450
 451    if (ws?.billing?.manualOverride === true) {
 452      console.log(
 453        `[webhook] payment_failed on manual-override workspace ${wsRef.id} — skipping suspend`
 454      );
 455      await logAdminAction({
 456        adminId: "billing-webhook",
 457        action: "webhook_skip_suspend_manual_override",
 458        workspaceId: wsRef.id,
 459        metadata: {
 460          event: "payment_failed",
 461          subscriptionId: event.data.subscriptionId,
 462        },
 463      });
 464      return;
 465    }
 466
 467    // Idempotency guard: only email + log on the FIRST failure delivery. A
 468    // duplicate delivery finds the workspace already suspended — skip both.
 469    const wasSuspended = ws?.billing?.suspended === true;
 470
 471    await wsRef.update({
 472      "billing.suspended": true,
 473      updatedAt: FieldValue.serverTimestamp(),
 474    });
 475
 476    if (!wasSuspended) {
 477      const { ownerEmail, workspaceName } = await getWorkspaceContext(wsRef.id);
 478      if (ownerEmail) {
 479        await sendPaymentFailedEmail({
 480          to: ownerEmail,
 481          workspaceName,
 482          portalUrl: BILLING_PORTAL_URL,
 483        });
 484      }
 485      await logAdminAction({
 486        adminId: "billing-webhook",
 487        action: "payment_failed",
 488        workspaceId: wsRef.id,
 489        metadata: {
 490          subscriptionId: event.data.subscriptionId,
 491        },
 492      });
 493    }
 494  }
```

**Phase-1 idempotency wrapping landed at lines 77–91 (pre-switch check) and lines 114–126 (post-switch record). The provider-agnostic dedup key is `{provider.name}_{event.eventId}` in collection `webhookEvents`.**

Paddle-residue strings to update in Phase 4:
- Line 291 comment: `"Re-fetch current state from Paddle"`
- Lines 303–305 comment: `"converged with Paddle"`
- Line 314 comment: `"re-read current state from Paddle"`
- Line 131 comment in catch: `"500 — Paddle will retry..."`

---

## Section 3 — Admin actions route

### 3.1 `app/api/admin/workspaces/actions/route.ts` (full contents)

```ts
  1  import { adminDb } from "@/lib/server/firebaseAdmin";
  2  import { FieldValue } from "firebase-admin/firestore";
  3  import { apiError, apiSuccess } from "@/lib/server/apiResponse";
  4  import { requireAdmin } from "@/lib/server/adminAuth";
  5  import { logAdminAction } from "@/lib/admin/adminLogs";
  6  import { getPlanCatalog } from "@/lib/billing/getPlanCatalog";
  7  import { getPaymentProvider } from "@/lib/billing/payments";
  8  import type { PlanId } from "@/lib/billing/plans";
  9
 10  const VALID_PLANS: PlanId[] = ["starter", "business", "enterprise"];
 11
 12  /**
 13   * POST /api/admin/workspaces/actions
 14   * Body: { workspaceId, action, ...actionParams }
 15   *
 16   * Actions:
 17   *   suspend              — set billing.suspended = true
 18   *   resume               — set billing.suspended = false
 19   *   set_plan             — { plan: PlanId } — change workspace plan
 20   *   override_feedback_limit — { feedbackLimit: number } — set entitlements.maxFeedbackPerMonth
 21   *   grant_unlimited_feedback — set entitlements.maxFeedbackPerMonth = null (unlimited)
 22   *   remove_feedback_override — remove entitlements.maxFeedbackPerMonth override
 23   *   set_manual_override    — { plan: PlanId, seats: number } — grant a comp: sets
 24   *                            billing.manualOverride=true, plan, seats, suspended=false,
 25   *                            and clears subscriptionId. Provider webhooks then
 26   *                            skip downgrade/suspend for this workspace.
 27   *   remove_manual_override — sets billing.manualOverride=false. Leaves the workspace on
 28   *                            its current plan until a real billing event mutates it.
 29   */
 30  export async function POST(req: Request) {
 31    let admin;
 32    try {
 33      admin = await requireAdmin(req);
 34    } catch (e) {
 35      return e as Response;
 36    }
 37
 38    let body: Record<string, unknown>;
 39    try {
 40      body = await req.json();
 41    } catch {
 42      return apiError({ code: "INVALID_INPUT", message: "Invalid JSON", status: 400 });
 43    }
 44
 45    const workspaceId = typeof body.workspaceId === "string" ? body.workspaceId.trim() : "";
 46    const action = typeof body.action === "string" ? body.action.trim() : "";
 47
 48    if (!workspaceId) {
 49      return apiError({ code: "INVALID_INPUT", message: "workspaceId is required", status: 400 });
 50    }
 51    if (!action) {
 52      return apiError({ code: "INVALID_INPUT", message: "action is required", status: 400 });
 53    }
 54
 55    const ref = adminDb.doc(`workspaces/${workspaceId}`);
 56
 57    try {
 58      switch (action) {
 59        case "suspend":
 60          await ref.update({ "billing.suspended": true, updatedAt: FieldValue.serverTimestamp() });
 61          await logAdminAction({ adminId: admin.uid, action: "workspace.suspend", metadata: { workspaceId } });
 62          return apiSuccess({ workspaceId, action });
 63
 64        case "resume":
 65          await ref.update({ "billing.suspended": false, updatedAt: FieldValue.serverTimestamp() });
 66          await logAdminAction({ adminId: admin.uid, action: "workspace.resume", metadata: { workspaceId } });
 67          return apiSuccess({ workspaceId, action });
 68
 69        case "set_plan": {
 70          const plan = typeof body.plan === "string" ? body.plan.trim().toLowerCase() : "";
 71          if (!VALID_PLANS.includes(plan as PlanId)) {
 72            return apiError({
 73              code: "INVALID_INPUT",
 74              message: "plan must be one of: starter, business, enterprise",
 75              status: 400,
 76            });
 77          }
 78          const newPlan = plan as PlanId;
 79
 80          // Hybrid logic needs workspace state — was previously a blind .update().
 81          const wsSnap = await ref.get();
 82          const ws = wsSnap.data() as
 83            | {
 84                billing?: {
 85                  plan?: string;
 86                  manualOverride?: boolean;
 87                  subscriptionId?: string | null;
 88                  billingCycle?: string;
 89                };
 90              }
 91            | undefined;
 92
 93          if (!ws) {
 94            return apiError({
 95              code: "NOT_FOUND",
 96              message: "Workspace not found",
 97              status: 404,
 98            });
 99          }
 100
 101          const isManualOverride = ws.billing?.manualOverride === true;
 102          const hasSubscription = !!ws.billing?.subscriptionId;
 103
 104          // Case A: comp adjustment — Firestore-only, never touch the provider.
 105          if (isManualOverride) {
 106            const catalog = await getPlanCatalog();
 107            const entry = catalog[newPlan] ?? catalog.starter;
 108            await ref.update({
 109              "billing.plan": newPlan,
 110              "billing.pricePerSeat": entry.pricePerSeat ?? 0,
 111              updatedAt: FieldValue.serverTimestamp(),
 112            });
 113            await logAdminAction({
 114              adminId: admin.uid,
 115              action: "admin_set_plan_comp",
 116              workspaceId,
 117              metadata: { previousPlan: ws.billing?.plan ?? null, newPlan },
 118            });
 119            return apiSuccess({ workspaceId, action, plan: newPlan, mode: "comp" });
 120          }
 121
 122          // Case B: real paid subscription — sync to the provider. The
 123          // subscription.updated webhook is the single Firestore writer here.
 124          if (hasSubscription) {
 125            // Enterprise has no provider price — comp-only / sales-led.
 126            if (newPlan === "enterprise") {
 127              return apiError({
 128                code: "ENTERPRISE_REQUIRES_MANUAL_OVERRIDE",
 129                message:
 130                  "Enterprise plan has no Paddle price. Use set_manual_override to grant Enterprise access.",
 131                status: 400,
 132              });
 133            }
 134
 135            // Downgrading a paid workspace to Starter means "cancel the
 136            // subscription" — out of scope for set_plan.
 137            if (newPlan === "starter") {
 138              return apiError({
 139                code: "CANNOT_DOWNGRADE_PAID_TO_STARTER",
 140                message:
 141                  "To downgrade a paid workspace to Starter, cancel the subscription instead.",
 142                status: 400,
 143              });
 144            }
 145
 146            // newPlan === "business" — sync to the provider.
 147            const subscriptionId = ws.billing?.subscriptionId as string;
 148            const provider = getPaymentProvider();
 149            const cycle =
 150              ws.billing?.billingCycle === "annual" ? "annual" : "monthly";
 151            const newPriceId = provider.resolveBusinessPriceId(cycle);
 152
 153            try {
 154              await provider.updateSubscriptionPlan(
 155                subscriptionId,
 156                newPriceId,
 157                "prorated_immediately"
 158              );
 159            } catch (err) {
 160              console.error("[admin set_plan] provider update failed:", err);
 161              return apiError({
 162                code: "PROVIDER_UPDATE_FAILED",
 163                message:
 164                  "Failed to update subscription with payment provider",
 165                status: 500,
 166              });
 167            }
 168
 169            // DON'T write Firestore here — the subscription.updated webhook is
 170            // the single writer for paid subscriptions.
 171            await logAdminAction({
 172              adminId: admin.uid,
 173              action: "admin_set_plan_paid_synced",
 174              workspaceId,
 175              metadata: {
 176                previousPlan: ws.billing?.plan ?? null,
 177                newPlan,
 178                subscriptionId,
 179                priceId: newPriceId,
 180              },
 181            });
 182            return apiSuccess({
 183              workspaceId,
 184              action,
 185              plan: newPlan,
 186              mode: "paid_synced",
 187            });
 188          }
 189
 190          // Case C: never paid, no comp — soft-error.
 191          await logAdminAction({
 192            adminId: admin.uid,
 193            action: "admin_set_plan_rejected_never_paid",
 194            workspaceId,
 195            metadata: { attemptedPlan: newPlan },
 196          });
 197          return apiError({
 198            code: "NEVER_PAID_REQUIRES_MANUAL_OVERRIDE",
 198            message:
 199              "This workspace has no subscription. Use set_manual_override to grant a comp plan, or have the user subscribe via the normal upgrade flow.",
 200            status: 400,
 201          });
 202        }
 203
 204        case "set_manual_override": {
 205          const plan = typeof body.plan === "string" ? body.plan.trim().toLowerCase() : "";
 206          if (!VALID_PLANS.includes(plan as PlanId)) {
 207            return apiError({
 208              code: "INVALID_INPUT",
 209              message: "plan must be one of: starter, business, enterprise",
 210              status: 400,
 211            });
 212          }
 213          const seats = body.seats;
 214          if (typeof seats !== "number" || !Number.isInteger(seats) || seats < 1) {
 215            return apiError({
 216              code: "INVALID_INPUT",
 217              message: "seats must be a positive integer",
 218              status: 400,
 219            });
 220          }
 221          const catalog = await getPlanCatalog();
 222          const entry = catalog[plan as PlanId] ?? catalog.starter;
 223          await ref.update({
 224            "billing.manualOverride": true,
 225            "billing.plan": plan,
 226            "billing.seats": seats,
 227            "billing.pricePerSeat": entry.pricePerSeat ?? 0,
 228            "billing.suspended": false,
 229            // Comp has no real subscription — clear any stale legacy sub id so
 230            // provider webhooks for an old sub can't match this workspace.
 231            "billing.subscriptionId": null,
 232            updatedAt: FieldValue.serverTimestamp(),
 233          });
 234          await logAdminAction({
 235            adminId: admin.uid,
 236            action: "workspace.set_manual_override",
 237            metadata: { workspaceId, plan, seats },
 238          });
 239          return apiSuccess({ workspaceId, action, plan, seats });
 240        }
 241
 242        case "remove_manual_override":
 243          await ref.update({
 244            "billing.manualOverride": false,
 245            updatedAt: FieldValue.serverTimestamp(),
 246          });
 247          await logAdminAction({
 248            adminId: admin.uid,
 249            action: "workspace.remove_manual_override",
 250            metadata: { workspaceId },
 251          });
 252          return apiSuccess({ workspaceId, action });
 253
 254        case "override_feedback_limit": {
 255          const feedbackLimit = body.feedbackLimit;
 256          if (typeof feedbackLimit !== "number" || feedbackLimit < 0) {
 257            return apiError({
 258              code: "INVALID_INPUT",
 259              message: "feedbackLimit must be a non-negative number",
 260              status: 400,
 261            });
 262          }
 263          await ref.update({
 264            "entitlements.maxFeedbackPerMonth": feedbackLimit,
 265            updatedAt: FieldValue.serverTimestamp(),
 266          });
 267          await logAdminAction({
 268            adminId: admin.uid,
 269            action: "workspace.override_feedback_limit",
 270            metadata: { workspaceId, feedbackLimit },
 271          });
 272          return apiSuccess({ workspaceId, action, feedbackLimit });
 273        }
 274
 275        case "grant_unlimited_feedback":
 276          await ref.update({
 277            "entitlements.maxFeedbackPerMonth": null,
 278            updatedAt: FieldValue.serverTimestamp(),
 279          });
 280          await logAdminAction({
 281            adminId: admin.uid,
 282            action: "workspace.grant_unlimited_feedback",
 283            metadata: { workspaceId },
 284          });
 285          return apiSuccess({ workspaceId, action });
 286
 287        case "remove_feedback_override":
 288          await ref.update({
 289            "entitlements.maxFeedbackPerMonth": FieldValue.delete(),
 290            updatedAt: FieldValue.serverTimestamp(),
 291          });
 292          await logAdminAction({
 293            adminId: admin.uid,
 294            action: "workspace.remove_feedback_override",
 295            metadata: { workspaceId },
 296          });
 297          return apiSuccess({ workspaceId, action });
 298
 299        case "cancel_subscription": {
 300          const effective =
 301            body.effective === "immediately" ? "immediately" : "next_billing_period";
 302
 303          const wsSnap = await ref.get();
 304          const ws = wsSnap.data() as
 305            | { billing?: { subscriptionId?: string | null; manualOverride?: boolean; plan?: string } }
 306            | undefined;
 307
 308          if (!ws) {
 309            return apiError({ code: "NOT_FOUND", message: "Workspace not found", status: 404 });
 310          }
 311
 312          if (ws.billing?.manualOverride === true) {
 313            return apiError({
 314              code: "INVALID_INPUT",
 315              message: "Workspace has a manual override. Use remove_manual_override first.",
 316              status: 400,
 317            });
 318          }
 319
 320          const subscriptionId = ws.billing?.subscriptionId;
 321          if (!subscriptionId) {
 322            return apiError({
 323              code: "INVALID_INPUT",
 324              message: "Workspace has no subscription to cancel.",
 325              status: 400,
 326            });
 327          }
 328
 329          try {
 330            await getPaymentProvider().cancelSubscription(
 331              subscriptionId,
 332              effective === "next_billing_period"
 333            );
 334          } catch (err) {
 335            console.error("[admin cancel_subscription] provider failed:", err);
 336            return apiError({
 337              code: "INTERNAL_ERROR",
 338              message: "Provider cancellation failed",
 339              status: 500,
 340            });
 341          }
 342
 343          // DON'T write Firestore — the subscription_canceled webhook is the single writer.
 344          await logAdminAction({
 345            adminId: admin.uid,
 346            action: "admin_cancel_subscription",
 347            workspaceId,
 348            metadata: { subscriptionId, effective },
 349          });
 350
 351          return apiSuccess({ workspaceId, action, effective });
 352        }
 353
 354        default:
 355          return apiError({
 356            code: "INVALID_INPUT",
 357            message: `Unknown action: ${action}`,
 358            status: 400,
 359          });
 360      }
 361    } catch (err) {
 362      console.error(`POST /api/admin/workspaces/actions [${action}]:`, err);
 363      return apiError({ code: "INTERNAL_ERROR", message: "Action failed", status: 500 });
 364    }
 365  }
 366
```

**Phase-4-relevant locations:**
- **Line 157**: `"prorated_immediately"` hard-coded as `ProrationMode` arg to `updateSubscriptionPlan`. Stripe-native equivalent: `proration_behavior: "always_invoice"` (the closest semantic match). Phase 4 may want to map this string at the provider boundary rather than at this call site.
- **Line 130**: error message contains `"Enterprise plan has no Paddle price."` — Phase 4 should change `Paddle` → `Stripe` (or make it provider-neutral: `"Enterprise plan has no provider price."`).

---

## Section 4 — Other provider method call sites

### 4.1 All `getPaymentProvider()` callers

| # | File:line | Method called | What caller does with the result |
|---|---|---|---|
| 1 | [app/api/billing/checkout/route.ts:76](../../app/api/billing/checkout/route.ts#L76) | `createCheckoutSession({ ... })` (line 77) | Awaits the result, returns `apiSuccess({ url: result.url })` to the client. **Implemented in Stripe.** |
| 2 | [app/api/billing/portal/route.ts:47](../../app/api/billing/portal/route.ts#L47) | `createPortalSession({ customerId, returnUrl })` (line 48) | Awaits, returns `apiSuccess({ portalUrl: result.portalUrl })`. **STUB in Stripe — Phase 4.** |
| 3 | [app/api/billing/history/route.ts:45](../../app/api/billing/history/route.ts#L45) | `listTransactions(customerId)` | Awaits, returns `apiSuccess({ transactions })`. **STUB in Stripe — Phase 4.** |
| 4 | [app/api/billing/invoice/[id]/route.ts:58](../../app/api/billing/invoice/[id]/route.ts#L58) | `getTransactionCustomerId(id)` (line 59), then `getInvoicePdfUrl(id)` (line 68) | First call: cross-checks ownership (`txCustomerId !== customerId` ⇒ 403). Second call: returns `apiSuccess({ url })` to redirect to PDF. **Both STUB in Stripe.** |
| 5 | [app/api/billing/webhook/route.ts:44](../../app/api/billing/webhook/route.ts#L44) | `provider.signatureHeaderName` (line 45), `provider.parseWebhookEvent(rawBody, signature)` (line 74), `provider.name` (line 81, line 121) | Read header name to extract signature; parse normalized `WebhookEvent`; use `provider.name` to build dedup key. **`parseWebhookEvent` STUB in Stripe — Phase 4 critical path.** |
| 6 | [app/api/billing/webhook/route.ts:143](../../app/api/billing/webhook/route.ts#L143) | `getSubscriptionData(subscriptionId)` (line 204) | Re-reads current sub state, then writes `billing.{plan,seats,billingCycle,suspended,cancelAt,nextBilledAt,paymentMethod,manualOverride}`. **STUB in Stripe.** |
| 7 | [app/api/billing/webhook/route.ts:271](../../app/api/billing/webhook/route.ts#L271) | `getSubscriptionData(subscriptionId)` (line 292) | Same convergent re-read pattern, updates `billing.{seats,billingCycle,nextBilledAt,cancelAt,paymentMethod,suspended}`. **STUB in Stripe.** |
| 8 | [app/api/admin/workspaces/actions/route.ts:148](../../app/api/admin/workspaces/actions/route.ts#L148) | `provider.resolveBusinessPriceId(cycle)` (line 151), `provider.updateSubscriptionPlan(subscriptionId, newPriceId, "prorated_immediately")` (line 154) | `resolveBusinessPriceId` implemented in Stripe. `updateSubscriptionPlan` is the Phase-4 stub. On provider error returns 500. Skips Firestore write — relies on webhook. |
| 9 | [app/api/admin/workspaces/actions/route.ts:331](../../app/api/admin/workspaces/actions/route.ts#L331) | `cancelSubscription(subscriptionId, effective === "next_billing_period")` | Awaits; on success skips Firestore (webhook is single writer); on error returns 500. **STUB in Stripe.** |
| 10 | [app/api/workspace/route.ts:52](../../app/api/workspace/route.ts#L52) | `cancelSubscription(workspace.billing.subscriptionId, false)` | Best-effort cancel during workspace soft-delete; swallows errors via `try/catch` and only logs. **STUB in Stripe — but note the `false` flag (cancel immediately, not at period end).** |
| 11 | [app/api/workspace/members/[uid]/route.ts:74](../../app/api/workspace/members/[uid]/route.ts#L74) | `updateSubscriptionSeats(subscriptionId, newSeatCount)` | Called only if `plan === "business" && subscriptionId`. On success follows with `billing.seats` update; on error logs only. **STUB in Stripe.** |
| 12 | [app/api/workspace/invitations/accept/[token]/route.ts:209](../../app/api/workspace/invitations/accept/[token]/route.ts#L209) | `updateSubscriptionSeats(subscriptionId, newSeatCount)` | Identical pattern to #11 — invite-accept path; success → write `billing.seats`; error → log only. **STUB in Stripe.** |

No call to `provider.resumeSubscription(...)` exists outside `paddle.ts` (the stub is dead code in the current codebase — Stripe should still implement it to satisfy the interface).

### 4.2 Reads of `workspace.billing.paymentMethod` (`{ brand, last4, expiryMonth, expiryYear }`)

| # | File:line | Use |
|---|---|---|
| 1 | [components/billing/BillingManagementView.tsx:80](../../components/billing/BillingManagementView.tsx#L80) | `const card = billing?.paymentMethod ?? null;` |
| 2 | [components/billing/BillingManagementView.tsx:277-278](../../components/billing/BillingManagementView.tsx#L277-L278) | Renders `${capitalize(card.brand)} ending in ${card.last4}` in the payment-method card on the Billing tab. Falls back to `"No payment method on file"` when `card` is null. **Does not read `expiryMonth`/`expiryYear`.** |
| 3 | [app/api/billing/webhook/route.ts:226-227](../../app/api/billing/webhook/route.ts#L226-L227) | **Writer.** `subscription_started`: only writes `billing.paymentMethod` when `subData.paymentMethod` is non-null (never clobbers an existing card with null). |
| 4 | [app/api/billing/webhook/route.ts:321-322](../../app/api/billing/webhook/route.ts#L321-L322) | **Writer.** `subscription_updated`: same conditional write — only when present. |

Only consumer is the BillingManagementView card; only writer is the webhook. Phase 4's Stripe `getSubscriptionData` must populate this object in the same shape (`{ brand, last4, expiryMonth?, expiryYear? }`) from Stripe's `default_payment_method` / `payment_settings.default_payment_method` ⇒ PaymentMethod expansion.

---

## Section 5 — Email template components reference

### 5.1 `lib/email/components.ts` (full contents)

```ts
  1  // Shared email visual system — single source of truth for email identity.
  2  //
  3  // Constraints (email clients are not browsers):
  4  //   - NO CSS variables in email HTML (clients don't resolve them).
  5  //   - Hardcoded hex colors, inline CSS only.
  6  //   - Table-based, bulletproof, Outlook-compatible. 560px max-width,
  7  //     single-column. Light mode only.
  8  //
  9  // History: Phase 1 introduced this Anthropic/Stripe-style receipt system
 10  // alongside a legacy generation; Phase 2 migrated all 12 templates onto it
 11  // and deleted the legacy block. The "V2" suffix is retained on exported
 12  // names because templates import them by that name; renaming is a separate,
 13  // mechanical follow-up.
 14
 15  export const EMAIL_COLORS = {
 16    pageBackground: "#F9F8F6",
 17    cardBackground: "#FFFFFF",
 18    textPrimary: "#15101F",
 19    textSecondary: "#54495F",
 20    textFooter: "#54495F",
 21    linkColor: "#5A49BF",
 22    hairline: "#ECECEA",
 23    ctaBackground: "#15101F",
 24    ctaText: "#FFFFFF",
 25    monoBackground: "transparent",
 26  } as const;
 27
 28  export const EMAIL_FONTS = {
 29    body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`,
 30    mono: `'SF Mono', 'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace`,
 31  } as const;
 32
 33  export const EMAIL_SIZES = {
 34    containerMaxWidth: 560,
 35    outerPaddingVertical: 40,
 36    outerPaddingHorizontal: 16,
 37    cardPaddingDesktop: 32,
 38    cardPaddingMobile: 24,
 39    cardBorderRadius: 8,
 40    buttonBorderRadius: 6,
 41    bodyFontSize: 16,
 42    bodyLineHeight: 1.6,
 43    secondaryFontSize: 14,
 44    footerFontSize: 13,
 45  } as const;
 46
 47  // Annote logo — hosted PNG (Gmail strips inline <svg>, so we point at the
 48  // public/email/annote-logo.png asset). Source: public/annote-logo-full.svg
 49  // (gradient icon + wordmark), rasterized at 2x for retina (212x50) and
 50  // displayed at 106x25.
 51  const logoSrc = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://annote.ai"}/email/annote-logo.png`;
 52  const ANNOTE_LOGO_SVG = `<a href="https://annote.ai" style="text-decoration:none;display:inline-block;">
 53    <img src="${logoSrc}" width="106" height="25" alt="Annote" style="display:block;border:0;outline:none;text-decoration:none;" />
 54  </a>`;
 55
 56  interface ShellV2Options {
 57    /** Hidden preview text shown in inbox preview before the body. */
 58    preheader?: string;
 59    /** Inner content — raw HTML, expected to be one or more emailCardV2() blocks. */
 60    content: string;
 61    /**
 62     * Unsubscribe link href. Phase 3 wires this up; for now it's a passthrough.
 63     * Defaults to the placeholder token Phase 3 will substitute.
 64     */
 65    unsubscribeUrl?: string;
 66  }
 67
 68  /**
 69   * V2 email wrapper — Anthropic/Stripe-style receipt layout.
 70   *
 71   * Renders: hidden preheader, page-background outer table, centered 560px
 72   * column, logo header, the content slot, and a centered footer
 73   * (wordmark + tagline + unsubscribe · annote.ai).
 74   */
 75  export function emailShellV2({
 76    preheader,
 77    content,
 78    unsubscribeUrl = "{{UNSUBSCRIBE_URL}}",
 79  }: ShellV2Options): string {
 80    const pre = preheader ?? "";
 81
 82    return `<!DOCTYPE html>
 83  <html lang="en">
 84  <head>
 85    <meta charset="utf-8">
 86    <meta name="viewport" content="width=device-width, initial-scale=1.0">
 87    <meta name="x-apple-disable-message-reformatting">
 88    <meta name="color-scheme" content="light">
 89    <meta name="supported-color-schemes" content="light">
 90    <title>Annote</title>
 91  </head>
 92  <body style="margin:0;padding:0;background-color:${EMAIL_COLORS.pageBackground};font-family:${EMAIL_FONTS.body};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
 93    ${pre ? `<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${pre}</div>` : ""}
 94
 95    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${EMAIL_COLORS.pageBackground};">
 96      <tr>
 97        <td align="center" style="padding:${EMAIL_SIZES.outerPaddingVertical}px ${EMAIL_SIZES.outerPaddingHorizontal}px;">
 98          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${EMAIL_SIZES.containerMaxWidth}" style="width:100%;max-width:${EMAIL_SIZES.containerMaxWidth}px;">
 99
 100            <!-- Header: logo only, 32px gap below -->
 101            <tr>
 102              <td style="padding:0 0 32px 0;">
 103                ${ANNOTE_LOGO_SVG}
 104              </td>
 105            </tr>
 106
 107            <!-- Content slot -->
 108            <tr>
 109              <td>
 110                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
 111                  ${content}
 112                </table>
 113              </td>
 114            </tr>
 115
 116            <!-- Footer: wordmark + tagline + unsubscribe -->
 117            <tr>
 118              <td align="center" style="padding:40px 0 0 0;text-align:center;">
 119                <p style="margin:0;font-size:${EMAIL_SIZES.footerFontSize}px;font-weight:500;color:${EMAIL_COLORS.textFooter};line-height:1.4;">Annote</p>
 120                <p style="margin:4px 0 0 0;font-size:${EMAIL_SIZES.footerFontSize}px;color:${EMAIL_COLORS.textFooter};line-height:1.4;">Capture feedback in a click.</p>
 121                <p style="margin:16px 0 0 0;font-size:${EMAIL_SIZES.footerFontSize}px;color:${EMAIL_COLORS.textFooter};line-height:1.4;">
 122                  <a href="${unsubscribeUrl}" style="color:${EMAIL_COLORS.textFooter};text-decoration:underline;">Unsubscribe</a>
 123                  <span style="color:${EMAIL_COLORS.hairline};">&nbsp;·&nbsp;</span>
 124                  <a href="https://annote.ai" style="color:${EMAIL_COLORS.textFooter};text-decoration:none;">annote.ai</a>
 125                </p>
 126              </td>
 127            </tr>
 128
 129          </table>
 130        </td>
 131      </tr>
 132    </table>
 133  </body>
 134  </html>`;
 135  }
 136
 137  interface CardV2Options {
 138    /** Raw HTML — expected to be `<tr>...</tr>` rows (composed with other V2 helpers). */
 139    content: string;
 140  }
 141
 142  /**
 143   * V2 white card wrapper. Templates compose multiple cards, separating them
 144   * with emailSpacerV2({ height: 16 }) at the content level.
 145   */
 146  export function emailCardV2({ content }: CardV2Options): string {
 147    return `<tr>
 148    <td style="background-color:${EMAIL_COLORS.cardBackground};border-radius:${EMAIL_SIZES.cardBorderRadius}px;padding:${EMAIL_SIZES.cardPaddingDesktop}px;">
 149      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
 150        ${content}
 151      </table>
 152    </td>
 153  </tr>`;
 154  }
 155
 156  interface ButtonV2Options {
 157    label: string;
 158    href: string;
 159    /** "left" (default, body emails) or "full" (transactional, stretches full width). */
 160    align?: "left" | "full";
 161  }
 162
 163  /**
 164   * V2 bulletproof CTA button. Table-cell padding pattern (not <a> padding) so
 165   * it survives Outlook. `align: "full"` stretches the button edge-to-edge.
 166   */
 167  export function emailButtonV2({
 168    label,
 169    href,
 170    align = "left",
 171  }: ButtonV2Options): string {
 172    if (align === "full") {
 173      return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;">
 174    <tr>
 175      <td style="background-color:${EMAIL_COLORS.ctaBackground};border-radius:${EMAIL_SIZES.buttonBorderRadius}px;" align="center">
 176        <a href="${href}" style="display:block;padding:13px 26px;font-size:16px;font-weight:500;color:${EMAIL_COLORS.ctaText};text-decoration:none;line-height:1;text-align:center;">${label}</a>
 177      </td>
 178    </tr>
 179  </table>`;
 180    }
 181
 182    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0">
 183    <tr>
 184      <td style="background-color:${EMAIL_COLORS.ctaBackground};border-radius:${EMAIL_SIZES.buttonBorderRadius}px;">
 185        <a href="${href}" style="display:inline-block;padding:13px 26px;font-size:16px;font-weight:500;color:${EMAIL_COLORS.ctaText};text-decoration:none;line-height:1;">${label}</a>
 186      </td>
 187    </tr>
 188  </table>`;
 189  }
 190
 191  interface InfoRowV2Options {
 192    label: string;
 193    value: string;
 194    /** Render the value in monospace (receipt/invoice numbers, amounts). */
 195    mono?: boolean;
 196  }
 197
 198  /** V2 receipt detail row — label left, value right. */
 199  export function emailInfoRowV2({
 200    label,
 201    value,
 202    mono = false,
 203  }: InfoRowV2Options): string {
 204    return `<tr>
 205    <td style="padding:8px 0;font-size:${EMAIL_SIZES.secondaryFontSize}px;color:${EMAIL_COLORS.textSecondary};line-height:1.4;">${label}</td>
 206    <td align="right" style="padding:8px 0;font-size:${EMAIL_SIZES.secondaryFontSize}px;color:${EMAIL_COLORS.textPrimary};font-weight:500;line-height:1.4;${mono ? `font-family:${EMAIL_FONTS.mono};` : ""}">${value}</td>
 207  </tr>`;
 208  }
 209
 210  /**
 211   * V2 hairline rule. Emits a row whose top border is the divider; the 24px
 212   * top padding is the gap above it. Place between content sections in a card.
 213   */
 214  export function emailDividerV2(): string {
 215    return `<tr>
 216    <td style="padding:24px 0 0 0;border-top:1px solid ${EMAIL_COLORS.hairline};font-size:0;line-height:0;">&nbsp;</td>
 217  </tr>`;
 218  }
 219
 220  interface SpacerV2Options {
 221    height: number;
 222  }
 223
 224  /** V2 pure vertical spacer row. */
 225  export function emailSpacerV2({ height }: SpacerV2Options): string {
 226    return `<tr><td style="height:${height}px;line-height:${height}px;font-size:0;">&nbsp;</td></tr>`;
 227  }
 228
 229  /**
 230   * V2 text helpers — shared row builders so every template renders the same
 231   * heading / paragraph / sign-off treatment. These return `<tr>` rows meant to
 232   * live inside an emailCardV2 content slot.
 233   */
 234
 235  /** V2 card heading row (h1-equivalent). */
 236  export function emailHeadingV2(text: string): string {
 237    return `<tr><td style="font-size:20px;font-weight:600;color:${EMAIL_COLORS.textPrimary};line-height:1.3;padding:0 0 16px 0;">${text}</td></tr>`;
 238  }
 239
 240  interface ParagraphV2Options {
 241    /** Bottom padding below the paragraph. Default 16. Use 0 for the last line before a sign-off. */
 242    spaceAfter?: number;
 243  }
 244
 245  /** V2 body paragraph row. `html` may contain inline markup (links, <strong>). */
 246  export function emailParagraphV2(
 247    html: string,
 248    { spaceAfter = 16 }: ParagraphV2Options = {}
 249  ): string {
 250    return `<tr><td style="font-size:${EMAIL_SIZES.bodyFontSize}px;color:${EMAIL_COLORS.textPrimary};line-height:${EMAIL_SIZES.bodyLineHeight};padding:0 0 ${spaceAfter}px 0;">${html}</td></tr>`;
 251  }
 252
 253  /**
 254   * V2 sign-off row — the "— Name" or "— Name, Founder, Annote" closer.
 255   * Rendered in secondary color, slightly separated from the body above.
 256   */
 257  export function emailSignoffV2(text: string): string {
 258    return `<tr><td style="font-size:${EMAIL_SIZES.bodyFontSize}px;color:${EMAIL_COLORS.textSecondary};line-height:${EMAIL_SIZES.bodyLineHeight};padding:8px 0 0 0;">${text}</td></tr>`;
 259  }
 260
 261  /** Wraps a button block in a row with standard top spacing inside a card. */
 262  export function emailButtonRowV2(buttonHtml: string): string {
 263    return `<tr><td style="padding:8px 0 8px 0;">${buttonHtml}</td></tr>`;
 264  }
 265
 266  /** HTML-escape interpolated user data before it goes into an email body. */
 267  export function escapeEmailHtml(str: string): string {
 268    return str
 269      .replace(/&/g, "&amp;")
 270      .replace(/</g, "&lt;")
 271      .replace(/>/g, "&gt;")
 272      .replace(/"/g, "&quot;");
 273  }
 274
 275  interface PlainTextV2Options {
 276    body: string;
 277    unsubscribeUrl?: string;
 278  }
 279
 280  /** V2 plain-text wrapper with sign-off footer. */
 281  export function plainTextShellV2({
 282    body,
 283    unsubscribeUrl = "{{UNSUBSCRIBE_URL}}",
 284  }: PlainTextV2Options): string {
 285    return `${body}
 286
 287  ---
 288  Capture feedback in a click.
 289  Annote · annote.ai
 290  Unsubscribe: ${unsubscribeUrl}`;
 291  }
```

**Exported helpers Phase 4 templates will use:** `emailShellV2`, `emailCardV2`, `emailButtonV2`, `emailButtonRowV2`, `emailHeadingV2`, `emailParagraphV2`, `emailInfoRowV2`, `emailDividerV2`, `emailSignoffV2`, `emailSpacerV2`, `escapeEmailHtml`, `plainTextShellV2`. All composable into a single `content` string passed to `emailShellV2`.

### 5.2 `lib/email/templates/subscriptionConfirmation.ts` (full contents)

```ts
  1  import {
  2    emailShellV2,
  3    emailCardV2,
  4    emailButtonV2,
  5    emailButtonRowV2,
  6    emailHeadingV2,
  7    emailParagraphV2,
  8    emailInfoRowV2,
  9    emailDividerV2,
 10    emailSignoffV2,
 11    emailSpacerV2,
 12    escapeEmailHtml,
 13    plainTextShellV2,
 14  } from "../components";
 15
 16  interface SubscriptionConfirmationProps {
 17    workspaceName: string;
 18    seatCount: number;
 19    billingCycle: "monthly" | "annual";
 20    nextBillingDate: Date;
 21    settingsUrl: string;
 22    /** Monthly price per seat — from catalog, no hardcoded fallback. */
 23    pricePerSeat: number;
 24    /** Annual price per seat (monthly equivalent) — from catalog, no hardcoded fallback. */
 25    annualPricePerSeat: number;
 26    /** Phase-5 optional: recipient first name for the greeting. Falls back to "there". */
 27    firstName?: string;
 28    /** Phase-5 optional: plan display name. Defaults to "Business" (matches subject + prior copy). */
 29    planName?: string;
 30  }
 31
 32  function formatDate(d: Date): string {
 33    return d.toLocaleDateString("en-US", {
 34      year: "numeric",
 35      month: "long",
 36      day: "numeric",
 37    });
 38  }
 39
 40  /** Derives the human amount string from existing catalog props (no placeholders). */
 41  function computeAmount(props: SubscriptionConfirmationProps): string {
 42    const { seatCount, billingCycle, pricePerSeat, annualPricePerSeat } = props;
 43    if (billingCycle === "annual") {
 44      return `$${(seatCount * annualPricePerSeat * 12).toFixed(2)}/year`;
 45    }
 46    return `$${(seatCount * pricePerSeat).toFixed(2)}/month`;
 47  }
 48
 49  export function subscriptionConfirmationEmailHtml(
 50    props: SubscriptionConfirmationProps
 51  ): string {
 52    const {
 53      workspaceName,
 54      seatCount,
 55      billingCycle,
 56      nextBillingDate,
 57      settingsUrl,
 58      firstName,
 59      planName = "Business",
 60    } = props;
 61
 62    const greetingName = firstName ? escapeEmailHtml(firstName) : "there";
 63    const safeWorkspace = escapeEmailHtml(workspaceName);
 64    const safePlan = escapeEmailHtml(planName);
 65    const cycleLabel = billingCycle === "annual" ? "annual" : "monthly";
 66    const amount = computeAmount(props);
 67    const seatLabel = seatCount === 1 ? "1 seat" : `${seatCount} seats`;
 68
 69    return emailShellV2({
 70      preheader: `${planName}, ${cycleLabel}. Next charge ${formatDate(nextBillingDate)}.`,
 71      content:
 72        emailCardV2({
 73          content: `
 74            ${emailHeadingV2(`You're on Annote ${safePlan} — here's what's next`)}
 75            ${emailParagraphV2(`Hey ${greetingName},`)}
 76            ${emailParagraphV2(
 77              `Thanks for upgrading <strong>${safeWorkspace}</strong> to Annote ${safePlan}. Here's what you're paying for:`
 78            )}
 79            ${emailInfoRowV2({ label: "Plan", value: `${safePlan} (${cycleLabel})` })}
 80            ${emailInfoRowV2({ label: "Seats", value: seatLabel })}
 81            ${emailInfoRowV2({ label: "Next charge", value: formatDate(nextBillingDate) })}
 82            ${emailDividerV2()}
 83            ${emailInfoRowV2({ label: "Amount", value: amount, mono: true })}
 84          `,
 85        }) +
 86        emailSpacerV2({ height: 16 }) +
 87        emailCardV2({
 88          content: `
 89            ${emailParagraphV2(
 90              `You can manage your subscription, download invoices, and change plans anytime from <a href="${settingsUrl}" style="color:#5A49BF;text-decoration:underline;">Billing settings</a>.`
 91            )}
 92            ${emailButtonRowV2(
 93              emailButtonV2({ label: "Open billing settings", href: settingsUrl, align: "full" })
 94            )}
 95            ${emailSpacerV2({ height: 8 })}
 96            ${emailParagraphV2(
 97              "If anything looks off or you have questions, just reply — comes straight to me.",
 98              { spaceAfter: 0 }
 99            )}
 100            ${emailSignoffV2("— Ishaq, Founder, Annote")}
 101          `,
 102        }),
 103    });
 104  }
 105
 106  export function subscriptionConfirmationEmailText(
 107    props: SubscriptionConfirmationProps
 108    ): string {
 109    const {
 110      workspaceName,
 111      seatCount,
 112      billingCycle,
 113      nextBillingDate,
 114      settingsUrl,
 115      firstName,
 116      planName = "Business",
 117    } = props;
 118
 119    const greetingName = firstName ?? "there";
 120    const cycleLabel = billingCycle === "annual" ? "annual" : "monthly";
 121    const seatLabel = seatCount === 1 ? "1 seat" : `${seatCount} seats`;
 122    const amount = computeAmount(props);
 123
 124    return plainTextShellV2({
 125      body: `Hey ${greetingName},
 126
 127  Thanks for upgrading ${workspaceName} to Annote ${planName}. Here's what you're paying for:
 128
 129  Plan: ${planName} (${cycleLabel})
 130  Seats: ${seatLabel}
 131  Next charge: ${formatDate(nextBillingDate)}
 132  Amount: ${amount}
 133
 134  You can manage your subscription, download invoices, and change plans anytime from BillingSettings.
 135
 136  Open billing settings: ${settingsUrl}
 137
 138  If anything looks off or you have questions, just reply — comes straight to me.
 139
 140  — Ishaq, Founder, Annote`,
 141    });
 142  }
```

**Pattern to replicate in Phase 4 new templates:**
1. Import helpers from `../components`.
2. Define `*EmailHtml` and `*EmailText` exports taking a typed props interface.
3. HTML version: `emailShellV2({ preheader, content })` where `content` is a chain of `emailCardV2({ ... }) + emailSpacerV2({ height: 16 }) + emailCardV2({ ... })`.
4. Plain-text version: `plainTextShellV2({ body: ... })`.
5. Always `escapeEmailHtml(...)` user-supplied strings before interpolating into HTML; raw is fine in plain-text.
6. Use `emailInfoRowV2 + emailDividerV2 + emailInfoRowV2 (mono: true)` for receipt-style detail tables.
7. Sign off with `emailSignoffV2("— Ishaq, Founder, Annote")` for founder-voice billing emails.

---

## Section 6 — Stripe dashboard connector files

### 6.1 `app/admin/customers/page.tsx` — `paddleDashboardUrl`

```tsx
 17  function paddleDashboardUrl(path: string): string {
 18    const base =
 19      process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "production"
 20        ? "https://vendors.paddle.com"
 21        : "https://sandbox-vendors.paddle.com";
 22    return `${base}${path}`;
 23  }
```

**Call sites (two, both in the admin detail drawer):**

```tsx
 333  {selected.billing?.customerId && (
 334    <div>
 335      <dt className="text-[var(--text-secondary)]">Customer</dt>
 336      <dd className="font-mono text-xs break-all">
 337        <a
 338          href={paddleDashboardUrl(`/customers/${selected.billing.customerId}`)}
 339          target="_blank"
 340          rel="noopener noreferrer"
 341          className="text-[var(--brand)] hover:underline"
 342        >
 343          {selected.billing.customerId}
 344        </a>
 345      </dd>
 346    </div>
 347  )}
 348  {selected.billing?.subscriptionId && (
 349    <div>
 350      <dt className="text-[var(--text-secondary)]">Subscription</dt>
 351      <dd className="font-mono text-xs break-all">
 352        <a
 353          href={paddleDashboardUrl(`/subscriptions/${selected.billing.subscriptionId}`)}
 354          target="_blank"
 355          rel="noopener noreferrer"
 356          className="text-[var(--brand)] hover:underline"
 357        >
 358          {selected.billing.subscriptionId}
 359        </a>
 360      </dd>
 361    </div>
 362  )}
```

**Phase-4 replacement notes:**
- Function name: `paddleDashboardUrl` → `stripeDashboardUrl`.
- Base host: Stripe's hosted dashboard is `https://dashboard.stripe.com`. Test/live distinction in Stripe is by URL prefix:
  - Live: `https://dashboard.stripe.com/customers/{cus_…}` / `/subscriptions/{sub_…}`
  - Test: `https://dashboard.stripe.com/test/customers/{cus_…}` / `/test/subscriptions/{sub_…}`
- Env var: `NEXT_PUBLIC_PADDLE_ENVIRONMENT` → likely `NEXT_PUBLIC_STRIPE_ENVIRONMENT` (or derive from a published key prefix). Choose explicitly in Phase 4.
- Paths `/customers/{id}` and `/subscriptions/{id}` work as-is in Stripe (modulo the `/test/` prefix).
- Both call sites at lines 338 and 353 only pass the path — the function signature stays identical.

---

## Section 7 — Resend email helper

### 7.1 `lib/email/resend.ts` (full contents)

```ts
  1  import "server-only";
  2  import { Resend } from "resend";
  3
  4  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  5
  6  // WS-007 FIX: explicit guard + dev logging
  7  if (!RESEND_API_KEY) {
  8    console.warn(
  9      "[Resend] RESEND_API_KEY is not set. " +
 10      "Emails will be logged to console in development."
 11    );
 12  }
 13
 14  export const resend = RESEND_API_KEY
 15    ? new Resend(RESEND_API_KEY)
 16    : null;
 17
 18  function extractFirstUrl(html: string): string | null {
 19    const m = html.match(/href="(https?:\/\/[^"]+)"/);
 20    return m?.[1] ?? null;
 21  }
 22
 23  /**
 24   * Email sender configuration.
 25   *
 26   * Behavior:
 27   * - If RESEND_API_KEY is unset, emails are logged to the console (never sent).
 28   * - If EMAIL_DEV_LOG=true (and NODE_ENV !== "production"), emails are logged
 29   *   to the console even when the API key is set. Useful for inspecting outgoing
 30   *   email content during development without sending real emails.
 31   * - Otherwise, emails are sent via Resend (including from localhost).
 32   *
 33   * EMAIL_DEV_LOG is ignored in production (NODE_ENV === "production") as a
 34   * safety guard against accidentally silencing production email.
 35   */
 36  const REPLY_TO = "ishaq@annote.ai";
 37
 38  /**
 39   * From-address variants.
 40   * - "system"  — transactional/system email (password reset, verification,
 41   *   invites, access requests). Impersonal sender so it reads as automated.
 42   * - "founder" — lifecycle/billing email written in the founder's voice
 43   *   (subscription confirmation/cancellation, payment failed, workspace
 44   *   deletion). Sender carries the founder name so replies feel personal.
 45   */
 46  export type FromVariant = "system" | "founder";
 47
 48  function getFromAddress(variant: FromVariant = "system"): string {
 49    const email = "noreply@annote.ai";
 50    return variant === "founder"
 51      ? `Ishaq from Annote <${email}>`
 52      : `Annote <${email}>`;
 53  }
 54
 55  export async function sendEmailOrLog(params: {
 56    to: string;
 57    subject: string;
 58    html: string;
 59    /** Plain-text alternative — sent alongside html for deliverability + accessibility. */
 60    text?: string;
 61    /** Reply-to override. Defaults to ishaq@annote.ai so replies reach a human. */
 62    replyTo?: string;
 63    /**
 64     * Which from-name to send under. Defaults to "system" (transactional).
 65     * Lifecycle/billing emails pass "founder".
 66     */
 67    fromVariant?: FromVariant;
 68  }): Promise<void> {
 69    // Determine if we should log instead of sending.
 70    const isProduction = process.env.NODE_ENV === "production";
 71    const logModeRequested = process.env.EMAIL_DEV_LOG === "true";
 72    const shouldLogOnly = !resend || (logModeRequested && !isProduction);
 73
 74    if (shouldLogOnly) {
 75      const link = extractFirstUrl(params.html);
 76      console.log(
 77        `\n📧 [DEV EMAIL — not sent]\n` +
 78        `   To:      ${params.to}\n` +
 79        `   Subject: ${params.subject}\n` +
 80        (link ? `   🔗 Link: ${link}\n` : `   (no link found in body)\n`)
 81      );
 82      return;
 83    }
 84    // Unreachable when resend is null (that implies shouldLogOnly above),
 85    // but this guard restores TypeScript's non-null narrowing for resend.
 86    if (!resend) return;
 87    const { error } = await resend.emails.send({
 88      from: getFromAddress(params.fromVariant),
 89      to: params.to,
 90      subject: params.subject,
 91      html: params.html,
 92      text: params.text,
 93      replyTo: params.replyTo ?? REPLY_TO,
 94    });
 95    if (error) {
 96      console.error("[Resend] send failed", { to: params.to, subject: params.subject, error });
 97      throw new Error(`Email send failed: ${error.message ?? "unknown"}`);
 98    }
 99  }
```

**`sendEmailOrLog` signature for Phase 4 new sends:**

```ts
sendEmailOrLog(params: {
  to: string;
  subject: string;
  html: string;
  text?: string;          // optional plain-text alt
  replyTo?: string;       // defaults to "ishaq@annote.ai"
  fromVariant?: "system" | "founder";   // defaults to "system"
}): Promise<void>
```

Billing/lifecycle emails should pass `fromVariant: "founder"` (matches subscriptionConfirmation/cancellation/paymentFailed convention).

---

## Output footer

Path: `docs/audits/phase4-preflight.md`.

Summary: Stripe provider has 10 stubs throwing `"not yet implemented (Phase 4)"` (lines 116–197) — all called from 12 sites across 9 routes; the webhook route (with Phase-1 idempotency wrapping at lines 77–91 / 114–126) and admin actions route (with `"prorated_immediately"` hard-coded at line 157 and `"Paddle"` in the error string at line 130) need Phase 4 wiring. Email infrastructure (V2 components, founder-voice `sendEmailOrLog`) and the existing `paddleDashboardUrl` builder (lines 17–23 of `app/admin/customers/page.tsx`, two call sites at 338/353) are ready for direct replacement.
