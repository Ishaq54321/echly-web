import "server-only";
import Stripe from "stripe";
import type {
  PaymentProvider,
  CheckoutParams,
  CheckoutResult,
  PortalParams,
  PortalResult,
  WebhookEvent,
  SubscriptionData,
} from "./types";

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
  }
  return _stripe;
}

function getPriceId(billingCycle: "monthly" | "annual"): string {
  const id =
    billingCycle === "annual"
      ? process.env.STRIPE_BUSINESS_ANNUAL_PRICE_ID
      : process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID;
  if (!id) throw new Error(`Missing Stripe price ID for cycle: ${billingCycle}`);
  return id;
}

export class StripeProvider implements PaymentProvider {
  async createCheckoutSession(params: CheckoutParams): Promise<CheckoutResult> {
    const priceId = getPriceId(params.billingCycle);

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: params.seatCount,
        },
      ],
      metadata: {
        workspaceId: params.workspaceId,
        ownerUid: params.ownerUid,
      },
      success_url: `${params.successUrl}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: params.cancelUrl,
      allow_promotion_codes: true,
    };

    if (params.existingCustomerId) {
      sessionParams.customer = params.existingCustomerId;
    } else {
      sessionParams.customer_email = params.ownerEmail;
    }

    const session = await getStripe().checkout.sessions.create(sessionParams);

    if (!session.url) {
      throw new Error("Stripe returned a checkout session with no URL");
    }
    return {
      checkoutUrl: session.url,
      sessionId: session.id,
    };
  }

  async createPortalSession(params: PortalParams): Promise<PortalResult> {
    const session = await getStripe().billingPortal.sessions.create({
      customer: params.customerId,
      return_url: params.returnUrl,
    });
    return { portalUrl: session.url };
  }

  async parseWebhookEvent(body: string | Buffer, signature: string): Promise<WebhookEvent> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET environment variable is not set");
    }
    const event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
    return {
      type: event.type,
      data: event.data.object as unknown as Record<string, unknown>,
    };
  }

  async getSubscriptionData(subscriptionId: string): Promise<SubscriptionData> {
    const sub = await getStripe().subscriptions.retrieve(subscriptionId);

    const item = sub.items.data[0];
    const seatCount = item?.quantity ?? 1;

    const monthlyPriceId = process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID;
    const annualPriceId = process.env.STRIPE_BUSINESS_ANNUAL_PRICE_ID;
    const priceId = item?.price.id;
    const billingCycle: "monthly" | "annual" =
      priceId === annualPriceId && annualPriceId
        ? "annual"
        : priceId === monthlyPriceId && monthlyPriceId
        ? "monthly"
        : "monthly";

    const validStatuses = ["active", "past_due", "canceled", "unpaid"] as const;
    const status = validStatuses.includes(sub.status as (typeof validStatuses)[number])
      ? (sub.status as SubscriptionData["status"])
      : "active";

    return {
      customerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
      subscriptionId: sub.id,
      status,
      seatCount,
      billingCycle,
      currentPeriodEnd: new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    };
  }

  async updateSubscriptionSeats(subscriptionId: string, newSeatCount: number): Promise<void> {
    const sub = await getStripe().subscriptions.retrieve(subscriptionId);
    const itemId = sub.items.data[0]?.id;
    if (!itemId) throw new Error("No subscription item found");

    await getStripe().subscriptions.update(subscriptionId, {
      items: [{ id: itemId, quantity: newSeatCount }],
      proration_behavior: "create_prorations",
    });
  }

  async cancelSubscription(subscriptionId: string, atPeriodEnd: boolean): Promise<void> {
    await getStripe().subscriptions.update(subscriptionId, {
      cancel_at_period_end: atPeriodEnd,
    });
  }

  async resumeSubscription(subscriptionId: string): Promise<void> {
    await getStripe().subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
  }
}
