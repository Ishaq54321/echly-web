import "server-only";
import {
  Environment,
  EventName,
  LogLevel,
  Paddle,
  type EventEntity,
  type PaddleOptions,
  type Subscription,
} from "@paddle/paddle-node-sdk";
import type {
  CheckoutParams,
  CheckoutResult,
  PaymentProvider,
  PortalParams,
  PortalResult,
  ProrationMode,
  SubscriptionData,
  TransactionSummary,
  WebhookEvent,
} from "./types";

let _paddle: Paddle | null = null;

function getPaddle(): Paddle {
  if (_paddle) return _paddle;
  if (!process.env.PADDLE_API_KEY) {
    throw new Error("[billing] PADDLE_API_KEY is not set");
  }
  const options: PaddleOptions = {
    environment:
      process.env.PADDLE_ENVIRONMENT === "production"
        ? Environment.production
        : Environment.sandbox,
    logLevel: LogLevel.error,
  };
  _paddle = new Paddle(process.env.PADDLE_API_KEY, options);
  return _paddle;
}

export class PaddleProvider implements PaymentProvider {
  resolveBusinessPriceId(billingCycle: "monthly" | "annual"): string {
    const priceId =
      billingCycle === "annual"
        ? process.env.PADDLE_BUSINESS_PRICE_ANNUAL_ID
        : process.env.PADDLE_BUSINESS_PRICE_MONTHLY_ID;

    if (!priceId) {
      throw new Error(
        `[billing] Paddle price ID env var missing for billingCycle: ${billingCycle}`
      );
    }

    return priceId;
  }

  async createCheckoutSession(
    params: CheckoutParams
  ): Promise<CheckoutResult> {
    const priceId = this.resolveBusinessPriceId(params.billingCycle);

    return {
      priceId,
      customData: {
        // Keep minimal — only what the webhook needs to resolve the workspace.
        workspaceId: params.workspaceId,
      },
      customerEmail: params.ownerEmail,
      customerId: params.existingCustomerId ?? null,
    };
  }

  async createPortalSession(params: PortalParams): Promise<PortalResult> {
    // subscriptionIds is positional and required; an empty array is valid.
    // returnUrl from PortalParams is accepted-but-unused — Paddle manages its
    // own return flow.
    const session = await getPaddle().customerPortalSessions.create(
      params.customerId,
      []
    );

    return { portalUrl: session.urls.general.overview };
  }

  async parseWebhookEvent(
    body: string | Buffer,
    signature: string
  ): Promise<WebhookEvent> {
    const rawBody = typeof body === "string" ? body : body.toString();

    if (!process.env.PADDLE_WEBHOOK_SECRET) {
      throw new Error("[billing] PADDLE_WEBHOOK_SECRET is not set");
    }

    // unmarshal verifies the signature, parses, and types in one call.
    // Throws on bad signature / expired / malformed body.
    const event = await getPaddle().webhooks.unmarshal(
      rawBody,
      process.env.PADDLE_WEBHOOK_SECRET,
      signature
    );

    return normalizePaddleEvent(event);
  }

  async getSubscriptionData(
    subscriptionId: string
  ): Promise<SubscriptionData> {
    const sub = await getPaddle().subscriptions.get(subscriptionId);
    const dto = mapPaddleSubscriptionToDTO(sub);
    // The subscription entity doesn't carry card metadata. Derive it from the
    // customer's most recent paid transaction (one extra read, no webhook).
    dto.paymentMethod = await fetchLatestCardForCustomer(sub.customerId);
    return dto;
  }

  async listTransactions(customerId: string): Promise<TransactionSummary[]> {
    const transactions: TransactionSummary[] = [];

    const collection = getPaddle().transactions.list({
      customerId: [customerId],
      orderBy: "billed_at[DESC]",
      perPage: 50,
    });

    for await (const tx of collection) {
      const totals = tx.details?.totals;
      transactions.push({
        id: tx.id,
        invoiceNumber: tx.invoiceNumber ?? null,
        billedAt: tx.billedAt ?? tx.createdAt,
        total: formatMoney(totals?.grandTotal, totals?.currencyCode ?? "USD"),
        status: mapTransactionStatus(tx.status),
        invoicePdfUrl: null, // fetched on-demand via getInvoicePdfUrl
      });

      // Cap at 50 — pagination is unnecessary at this scale.
      if (transactions.length >= 50) break;
    }

    return transactions;
  }

  async getInvoicePdfUrl(transactionId: string): Promise<string | null> {
    try {
      const invoice = await getPaddle().transactions.getInvoicePDF(
        transactionId
      );
      return invoice.url ?? null;
    } catch {
      // Draft/uninvoiced transactions have no PDF — treat as unavailable.
      return null;
    }
  }

  async getTransactionCustomerId(
    transactionId: string
  ): Promise<string | null> {
    const tx = await getPaddle().transactions.get(transactionId);
    return tx.customerId ?? null;
  }

  async updateSubscriptionSeats(
    subscriptionId: string,
    newSeatCount: number
  ): Promise<void> {
    // items[] is a FULL REPLACE, not a patch — fetch the existing price first.
    const sub = await getPaddle().subscriptions.get(subscriptionId);
    const priceId = sub.items[0]?.price?.id;
    if (!priceId) {
      throw new Error(
        `[billing] Subscription ${subscriptionId} has no items — cannot update seats`
      );
    }
    await getPaddle().subscriptions.update(subscriptionId, {
      items: [{ priceId, quantity: newSeatCount }],
      prorationBillingMode: "prorated_immediately",
    });
  }

  async updateSubscriptionPlan(
    subscriptionId: string,
    newPriceId: string,
    prorationMode: ProrationMode = "prorated_immediately"
  ): Promise<void> {
    // Preserve the existing seat quantity across a plan change.
    const sub = await getPaddle().subscriptions.get(subscriptionId);
    const qty = sub.items[0]?.quantity ?? 1;
    await getPaddle().subscriptions.update(subscriptionId, {
      items: [{ priceId: newPriceId, quantity: qty }],
      prorationBillingMode: prorationMode,
    });
  }

  async cancelSubscription(
    subscriptionId: string,
    atPeriodEnd: boolean
  ): Promise<void> {
    await getPaddle().subscriptions.cancel(subscriptionId, {
      effectiveFrom: atPeriodEnd ? "next_billing_period" : "immediately",
    });
  }

  async resumeSubscription(subscriptionId: string): Promise<void> {
    const sub = await getPaddle().subscriptions.get(subscriptionId);
    if (sub.status === "paused") {
      await getPaddle().subscriptions.resume(subscriptionId, {
        effectiveFrom: "immediately",
      });
    } else if (sub.scheduledChange) {
      // Un-schedule a pending cancel/pause.
      await getPaddle().subscriptions.update(subscriptionId, {
        scheduledChange: null,
      });
    }
    // Otherwise: no-op — already active with no scheduled change.
  }
}

function mapPaddleSubscriptionToDTO(sub: Subscription): SubscriptionData {
  const annualId = process.env.PADDLE_BUSINESS_PRICE_ANNUAL_ID;
  const itemPriceId = sub.items[0]?.price?.id;

  // Paddle has more states than our DTO union. paused → past_due preserves
  // the existing "suspend" behavior.
  const statusMap: Record<string, SubscriptionData["status"]> = {
    trialing: "active",
    active: "active",
    past_due: "past_due",
    paused: "past_due",
    canceled: "canceled",
  };

  // currentBillingPeriod can be null (e.g. canceled subs).
  const periodEnd =
    sub.currentBillingPeriod?.endsAt ??
    sub.nextBilledAt ??
    new Date().toISOString();

  return {
    customerId: sub.customerId,
    subscriptionId: sub.id,
    status: statusMap[sub.status] ?? "active",
    seatCount: sub.items[0]?.quantity ?? 1,
    billingCycle: itemPriceId === annualId ? "annual" : "monthly",
    currentPeriodEnd: new Date(periodEnd),
    cancelAtPeriodEnd: sub.scheduledChange?.action === "cancel",
  };
}

/**
 * The card on file for a customer, read from their most recent transaction
 * that has a card payment attempt. Returns null when none is found (e.g. a
 * brand-new subscription whose first transaction hasn't settled, or non-card
 * payment methods).
 */
async function fetchLatestCardForCustomer(
  customerId: string
): Promise<SubscriptionData["paymentMethod"]> {
  try {
    const collection = getPaddle().transactions.list({
      customerId: [customerId],
      orderBy: "billed_at[DESC]",
      perPage: 10,
    });

    let scanned = 0;
    for await (const tx of collection) {
      for (const attempt of tx.payments ?? []) {
        const card = attempt.methodDetails?.card;
        if (card?.last4) {
          return {
            brand: String(card.type ?? "card").toLowerCase(),
            last4: card.last4,
          };
        }
      }
      // Only the few most recent transactions are worth scanning.
      if (++scanned >= 10) break;
    }
  } catch {
    // Card metadata is best-effort — never fail the caller over it.
  }
  return null;
}

function formatMoney(
  amount: string | undefined,
  currencyCode: string
): string {
  if (!amount) return "—";
  // Paddle returns minor units as a string (e.g. "1900" for $19.00).
  const major = Number.parseFloat(amount) / 100;
  if (Number.isNaN(major)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(major);
}

function mapTransactionStatus(
  paddleStatus: string
): TransactionSummary["status"] {
  switch (paddleStatus) {
    case "completed":
      return "completed";
    case "paid":
      return "paid";
    case "billed":
    case "ready":
    case "draft":
      return "pending";
    case "past_due":
      return "failed";
    case "canceled":
      return "refunded";
    default:
      return "pending";
  }
}

function normalizePaddleEvent(event: EventEntity): WebhookEvent {
  const eventId = event.eventId ?? "";

  switch (event.eventType) {
    case EventName.SubscriptionActivated: {
      const data = event.data;
      return {
        type: "subscription_started",
        eventId,
        data: {
          subscriptionId: data.id,
          customerId: data.customerId,
          workspaceId:
            (data.customData as Record<string, unknown> | null)?.[
              "workspaceId"
            ] != null
              ? String(
                  (data.customData as Record<string, unknown>)["workspaceId"]
                )
              : null,
        },
      };
    }

    case EventName.SubscriptionUpdated: {
      return {
        type: "subscription_updated",
        eventId,
        data: { subscriptionId: event.data.id },
      };
    }

    case EventName.SubscriptionCanceled: {
      return {
        type: "subscription_canceled",
        eventId,
        data: { subscriptionId: event.data.id },
      };
    }

    case EventName.TransactionPaymentFailed: {
      const data = event.data;
      return {
        type: "payment_failed",
        eventId,
        data: {
          subscriptionId: data.subscriptionId ?? null,
          customerId: data.customerId ?? null,
          // Not on the transaction notification; the handler resolves the
          // owner email via the workspace instead.
          customerEmail: undefined,
        },
      };
    }

    // transaction.completed is deliberately NOT acted on:
    //  - first payment is covered by subscription.activated
    //  - renewals are covered by subscription.updated
    // Acting here would double-write. Map to 'unknown'.
    case EventName.TransactionCompleted:
    default:
      return {
        type: "unknown",
        eventId,
        data: (event.data ?? {}) as unknown as Record<string, unknown>,
      };
  }
}
