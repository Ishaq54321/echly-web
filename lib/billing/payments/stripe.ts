import Stripe from "stripe";
import type {
  PaymentProvider,
  CheckoutParams,
  CheckoutResult,
  PortalParams,
  PortalResult,
  WebhookEvent,
  SubscriptionData,
  TransactionSummary,
  ProrationMode,
} from "./types";

// ────────────────────────────────────────────────────────────────────
// SDK SINGLETON
// ────────────────────────────────────────────────────────────────────

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "[stripe] STRIPE_SECRET_KEY env var is not set. Did you copy .env.example to .env.local?"
    );
  }
  _stripe = new Stripe(key, {
    // Pin the API version explicitly — never let Stripe upgrade your responses underneath you.
    // Sourced from the SDK's exported ApiVersion constant (stripe@22.1.1).
    apiVersion: "2026-04-22.dahlia",
    appInfo: {
      name: "Annote",
      url: "https://annote.ai",
    },
    typescript: true,
  });
  return _stripe;
}

// ────────────────────────────────────────────────────────────────────
// PROVIDER IMPLEMENTATION
// ────────────────────────────────────────────────────────────────────

export class StripeProvider implements PaymentProvider {
  readonly signatureHeaderName = "stripe-signature";
  readonly name = "stripe";

  resolveBusinessPriceId(billingCycle: "monthly" | "annual"): string {
    const id =
      billingCycle === "annual"
        ? process.env.STRIPE_BUSINESS_PRICE_ANNUAL_ID
        : process.env.STRIPE_BUSINESS_PRICE_MONTHLY_ID;
    if (!id) {
      throw new Error(
        `[stripe] Missing STRIPE_BUSINESS_PRICE_${billingCycle === "annual" ? "ANNUAL" : "MONTHLY"}_ID env var.`
      );
    }
    return id;
  }

  async createCheckoutSession(params: CheckoutParams): Promise<CheckoutResult> {
    const stripe = getStripe();
    const priceId = this.resolveBusinessPriceId(params.billingCycle);

    // Customer identification:
    // - If we have an existing Stripe customer ID for this workspace, pass `customer`
    // - Otherwise pass `customer_email` and let Stripe create a Customer on checkout completion
    const customerParam:
      | { customer: string }
      | { customer_email: string } =
      params.existingCustomerId
        ? { customer: params.existingCustomerId }
        : { customer_email: params.ownerEmail };

    // Metadata propagation:
    // - On the Session: searchable in the Stripe dashboard, available in checkout.session.* events
    // - On the Subscription (via subscription_data.metadata): available in customer.subscription.* events (Phase 4 webhook reads this)
    // - client_reference_id: convenience for dashboard filtering, no functional dependency
    const metadata = {
      workspaceId: params.workspaceId,
      ownerUid: params.ownerUid,
    };

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: params.seatCount,
        },
      ],
      ...customerParam,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata,
      subscription_data: {
        metadata,
      },
      client_reference_id: params.workspaceId,
      // Allow card payments by default; Stripe enables Apple Pay / Google Pay / Link automatically
      payment_method_types: ["card"],
      // Always collect billing address — useful for tax compliance later, low friction
      billing_address_collection: "auto",
      // Allow promo codes (you can disable in Phase 5 if not using)
      allow_promotion_codes: true,
    });

    if (!session.url) {
      throw new Error("[stripe] Checkout session created but url is null");
    }

    return { url: session.url };
  }

  async createPortalSession(params: PortalParams): Promise<PortalResult> {
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: params.customerId,
      return_url: params.returnUrl,
    });
    return { portalUrl: session.url };
  }

  async parseWebhookEvent(
    body: string | Buffer,
    signature: string
  ): Promise<WebhookEvent> {
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error(
        "[stripe] STRIPE_WEBHOOK_SECRET env var is not set. Cannot verify webhook signature."
      );
    }

    // Use the Stripe SDK's helper — verifies signature, parses body, throws on tamper/expiry/malformed.
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    return normalizeStripeEvent(event);
  }

  async getSubscriptionData(subscriptionId: string): Promise<SubscriptionData> {
    const stripe = getStripe();
    // Expand default_payment_method to get card details without a second roundtrip
    const sub = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["default_payment_method", "items.data.price"],
    });

    return mapStripeSubscriptionToDTO(sub);
  }

  async updateSubscriptionSeats(
    subscriptionId: string,
    newSeatCount: number
  ): Promise<void> {
    const stripe = getStripe();
    // Item-level update via the subscription item ID.
    // Fetch the subscription to get the current item.
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    const item = sub.items.data[0];
    if (!item) {
      throw new Error(`[stripe] Subscription ${subscriptionId} has no items`);
    }
    await stripe.subscriptionItems.update(item.id, {
      quantity: newSeatCount,
      // DEFERRED seat billing: the quantity (and thus access) updates
      // immediately, but the prorated cost is NOT charged now. With
      // "create_prorations" Stripe accrues the proration as line items that are
      // billed on the customer's next renewal invoice — no surprise mid-cycle
      // charge. (Plan upgrades deliberately stay "always_invoice"; see
      // updateSubscriptionPlan.)
      proration_behavior: "create_prorations",
    });
  }

  async previewSeatChange(
    subscriptionId: string,
    newSeatCount: number
  ): Promise<{
    amountCents: number;
    currency: string;
    prorationDate: Date;
    nextBillingDate: Date;
  } | null> {
    const stripe = getStripe();
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const item = subscription.items.data[0];
      if (!item) {
        console.warn(
          `[stripe] previewSeatChange: subscription ${subscriptionId} has no items`
        );
        return null;
      }

      // API 2026-04-22.dahlia uses invoices.createPreview, not the legacy
      // invoices.retrieveUpcoming. Pass the subscription id explicitly along
      // with the new quantity so the preview reflects the proration that would
      // result from updateSubscriptionSeats.
      //
      // Must mirror updateSubscriptionSeats' "create_prorations" so the
      // previewed amount equals what the deferred change actually bills at the
      // next renewal. "always_invoice" would surface the immediate-charge
      // figure, which is no longer how seat adds are billed.
      const preview = await stripe.invoices.createPreview({
        subscription: subscriptionId,
        subscription_details: {
          items: [{ id: item.id, quantity: newSeatCount }],
          proration_behavior: "create_prorations",
        },
      });

      // Sum proration line items (positive seat-add prorations and negative
      // credit prorations should net to the actual incremental charge).
      let prorationCents = 0;
      for (const line of preview.lines.data) {
        if (line.parent?.subscription_item_details?.proration === true) {
          prorationCents += line.amount;
        }
      }
      const amountCents = prorationCents !== 0 ? prorationCents : preview.amount_due ?? 0;

      const periodEndSecs = item.current_period_end;
      const nextBillingDate = periodEndSecs
        ? new Date(periodEndSecs * 1000)
        : new Date();

      return {
        amountCents,
        currency: (preview.currency ?? "usd").toUpperCase(),
        prorationDate: new Date(),
        nextBillingDate,
      };
    } catch (err) {
      console.error("[stripe] previewSeatChange failed:", err);
      return null;
    }
  }

  async updateSubscriptionPlan(
    subscriptionId: string,
    newPriceId: string,
    _prorationMode?: ProrationMode
  ): Promise<void> {
    const stripe = getStripe();
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    const item = sub.items.data[0];
    if (!item) {
      throw new Error(`[stripe] Subscription ${subscriptionId} has no items`);
    }
    // Preserve quantity, swap price
    await stripe.subscriptionItems.update(item.id, {
      price: newPriceId,
      quantity: item.quantity ?? 1,
      proration_behavior: "always_invoice", // Charge customers for the difference immediately
    });
  }

  async cancelSubscription(
    subscriptionId: string,
    atPeriodEnd: boolean
  ): Promise<void> {
    const stripe = getStripe();
    if (atPeriodEnd) {
      // Schedule cancellation at period end — user keeps access until then
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    } else {
      // Cancel immediately — Stripe API method is `cancel`, not `update`
      await stripe.subscriptions.cancel(subscriptionId);
    }
  }

  async resumeSubscription(subscriptionId: string): Promise<void> {
    const stripe = getStripe();
    // For scheduled cancellations: clear the cancel_at_period_end flag
    // For paused subscriptions: a separate API call (pause_collection: null) is needed,
    // but we don't currently use pause anywhere, so this is sufficient.
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
  }

  async listTransactions(customerId: string): Promise<TransactionSummary[]> {
    const stripe = getStripe();
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 50,
    });

    return invoices.data.map((invoice) => ({
      id: invoice.id ?? "",
      invoiceNumber: invoice.number ?? null,
      billedAt: new Date(invoice.created * 1000).toISOString(),
      total: formatStripeMoney(invoice.amount_paid, invoice.currency),
      status: mapStripeInvoiceStatus(invoice.status),
      invoicePdfUrl: invoice.invoice_pdf ?? null,
    }));
  }

  async getInvoicePdfUrl(transactionId: string): Promise<string | null> {
    const stripe = getStripe();
    try {
      const invoice = await stripe.invoices.retrieve(transactionId);
      return invoice.invoice_pdf ?? null;
    } catch (err) {
      console.error("[stripe] Failed to retrieve invoice PDF:", err);
      return null;
    }
  }

  async getTransactionCustomerId(transactionId: string): Promise<string | null> {
    const stripe = getStripe();
    try {
      const invoice = await stripe.invoices.retrieve(transactionId);
      if (typeof invoice.customer === "string") return invoice.customer;
      if (invoice.customer && "id" in invoice.customer) return invoice.customer.id;
      return null;
    } catch (err) {
      console.error("[stripe] Failed to retrieve invoice customer:", err);
      return null;
    }
  }

  async updateCustomerEmail(customerId: string, email: string): Promise<void> {
    const stripe = getStripe();
    await stripe.customers.update(customerId, { email });
  }
}

// ────────────────────────────────────────────────────────────────────
// EVENT NORMALIZATION — Stripe event types → our WebhookEvent union
// ────────────────────────────────────────────────────────────────────

function normalizeStripeEvent(event: Stripe.Event): WebhookEvent {
  switch (event.type) {
    case "customer.subscription.created": {
      const sub = event.data.object as Stripe.Subscription;
      const workspaceId =
        (sub.metadata?.workspaceId as string | undefined) ?? null;
      return {
        type: "subscription_started",
        eventId: event.id,
        data: {
          subscriptionId: sub.id,
          customerId:
            typeof sub.customer === "string" ? sub.customer : sub.customer.id,
          workspaceId,
        },
      };
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      return {
        type: "subscription_updated",
        eventId: event.id,
        data: { subscriptionId: sub.id },
      };
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      return {
        type: "subscription_canceled",
        eventId: event.id,
        data: { subscriptionId: sub.id },
      };
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      // In API 2026-04-22.dahlia, the subscription ref moved to
      // invoice.parent.subscription_details.subscription.
      const subRef = invoice.parent?.subscription_details?.subscription ?? null;
      const subscriptionId =
        typeof subRef === "string" ? subRef : subRef?.id ?? null;
      const customerId =
        typeof invoice.customer === "string"
          ? invoice.customer
          : invoice.customer?.id ?? null;
      return {
        type: "payment_failed",
        eventId: event.id,
        data: {
          subscriptionId,
          customerId,
          customerEmail: invoice.customer_email ?? undefined,
        },
      };
    }

    // All other events flow through "unknown"; the webhook handler dispatches
    // on event.type using the raw event passed in `data.stripeEvent`.
    default:
      return {
        type: "unknown",
        eventId: event.id,
        data: {
          stripeEventType: event.type,
          stripeEvent: event,
        },
      };
  }
}

// ────────────────────────────────────────────────────────────────────
// MAPPERS / FORMATTERS
// ────────────────────────────────────────────────────────────────────

function mapStripeSubscriptionToDTO(sub: Stripe.Subscription): SubscriptionData {
  // Status normalization — Stripe has more states than our 4-state union
  const statusMap: Record<Stripe.Subscription.Status, SubscriptionData["status"]> = {
    active: "active",
    trialing: "active",
    past_due: "past_due",
    unpaid: "unpaid",
    paused: "past_due",
    canceled: "canceled",
    incomplete: "active", // Awaiting first payment — treat as active until it fails
    incomplete_expired: "canceled",
  };
  const status = statusMap[sub.status] ?? "active";

  const firstItem = sub.items.data[0];

  // Billing cycle — compare price ID against the env-configured annual price.
  const priceId = firstItem?.price.id;
  const annualPriceId = process.env.STRIPE_BUSINESS_PRICE_ANNUAL_ID;
  const billingCycle: "monthly" | "annual" =
    priceId && annualPriceId && priceId === annualPriceId ? "annual" : "monthly";

  const seatCount = firstItem?.quantity ?? 1;

  // current_period_end is on the SubscriptionItem in API 2026-04-22.dahlia,
  // no longer on the Subscription itself.
  const periodEndSecs = firstItem?.current_period_end;
  const currentPeriodEnd = periodEndSecs
    ? new Date(periodEndSecs * 1000)
    : new Date();

  // Pending cancellation detection — Stripe has two schedules:
  //   1. cancel_at_period_end=true (no specific timestamp; cancels at period end)
  //   2. cancel_at=<unix timestamp> (specific scheduled date, used by Customer Portal)
  // Either case = "subscription is pending cancellation." The webhook handler
  // uses this boolean to set billing.cancelAt in Firestore.
  const cancelAtPeriodEnd =
    sub.cancel_at_period_end === true || sub.cancel_at != null;

  // If Stripe has a specific cancel_at date, prefer it over the period end —
  // the webhook handler uses currentPeriodEnd as the value to write to
  // billing.cancelAt, and we want the actual scheduled cancellation date.
  const effectivePeriodEnd =
    cancelAtPeriodEnd && sub.cancel_at
      ? new Date(sub.cancel_at * 1000)
      : currentPeriodEnd;

  // Payment method extraction — default_payment_method is expanded
  let paymentMethod: SubscriptionData["paymentMethod"] = null;
  const pm = sub.default_payment_method;
  if (pm && typeof pm !== "string" && pm.card) {
    paymentMethod = {
      brand: pm.card.brand,
      last4: pm.card.last4,
    };
  }

  return {
    customerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    subscriptionId: sub.id,
    status,
    seatCount,
    billingCycle,
    currentPeriodEnd: effectivePeriodEnd,
    cancelAtPeriodEnd,
    paymentMethod,
  };
}

function formatStripeMoney(amountInMinorUnits: number, currency: string): string {
  // Stripe returns minor units as a number (e.g. 1900 for $19.00, in USD)
  const major = amountInMinorUnits / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(major);
}

function mapStripeInvoiceStatus(
  status: Stripe.Invoice.Status | null
): TransactionSummary["status"] {
  switch (status) {
    case "paid":
      return "paid";
    case "open":
    case "draft":
      return "pending";
    case "uncollectible":
      return "failed";
    case "void":
      return "refunded";
    default:
      return "pending";
  }
}
