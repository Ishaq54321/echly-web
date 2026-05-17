export interface CheckoutParams {
  workspaceId: string;
  workspaceName: string;
  ownerEmail: string;
  ownerUid: string;
  seatCount: number;
  billingCycle: "monthly" | "annual";
  successUrl: string;
  cancelUrl: string;
  existingCustomerId?: string | null;
}

export interface CheckoutResult {
  priceId: string;
  customData: Record<string, string>; // includes { workspaceId }
  customerEmail: string;
  customerId?: string | null; // pass to Paddle.Checkout.open if existing
}

export interface PortalParams {
  customerId: string;
  returnUrl: string;
}

export interface PortalResult {
  portalUrl: string;
}

export type WebhookEvent =
  | {
      type: "subscription_started";
      eventId: string;
      data: {
        subscriptionId: string;
        customerId: string;
        workspaceId: string | null; // primary: custom_data; fallback: caller queries by customerId
      };
    }
  | {
      type: "subscription_updated";
      eventId: string;
      data: { subscriptionId: string }; // handler re-fetches via getSubscriptionData
    }
  | {
      type: "subscription_canceled";
      eventId: string;
      data: { subscriptionId: string };
    }
  | {
      type: "payment_failed";
      eventId: string;
      data: {
        subscriptionId: string | null;
        customerId: string | null;
        customerEmail?: string;
      };
    }
  | {
      type: "unknown";
      eventId: string;
      data: Record<string, unknown>;
    };

export interface SubscriptionData {
  customerId: string;
  subscriptionId: string;
  status: "active" | "past_due" | "canceled" | "unpaid";
  seatCount: number;
  billingCycle: "monthly" | "annual";
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  /** Card on file, when the provider exposes it on the subscription. */
  paymentMethod?: {
    brand: string;
    last4: string;
  } | null;
}

export type ProrationMode =
  | "prorated_immediately"
  | "prorated_next_billing_period"
  | "full_immediately"
  | "full_next_billing_period"
  | "do_not_bill";

export interface TransactionSummary {
  id: string;
  invoiceNumber: string | null;
  billedAt: string; // ISO date
  total: string; // "$19.00" formatted
  status: "completed" | "paid" | "failed" | "refunded" | "pending";
  invoicePdfUrl: string | null;
}

export interface PaymentProvider {
  createCheckoutSession(params: CheckoutParams): Promise<CheckoutResult>;
  createPortalSession(params: PortalParams): Promise<PortalResult>;
  parseWebhookEvent(body: string | Buffer, signature: string): Promise<WebhookEvent>;
  getSubscriptionData(subscriptionId: string): Promise<SubscriptionData>;
  updateSubscriptionSeats(subscriptionId: string, newSeatCount: number): Promise<void>;
  updateSubscriptionPlan(
    subscriptionId: string,
    newPriceId: string,
    prorationMode?: ProrationMode
  ): Promise<void>;
  cancelSubscription(subscriptionId: string, atPeriodEnd: boolean): Promise<void>;
  resumeSubscription(subscriptionId: string): Promise<void>;
  /** Recent invoice history for a customer (most-recent first, capped). */
  listTransactions(customerId: string): Promise<TransactionSummary[]>;
  /** On-demand invoice PDF URL for a single transaction. */
  getInvoicePdfUrl(transactionId: string): Promise<string | null>;
  /** Customer ID a transaction belongs to (ownership check before PDF fetch). */
  getTransactionCustomerId(transactionId: string): Promise<string | null>;
  // Synchronous — reads env vars only, no SDK call. Keeps callers (e.g. the
  // admin set_plan route) from leaking provider-specific env var names.
  resolveBusinessPriceId(billingCycle: "monthly" | "annual"): string;
}
