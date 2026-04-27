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
  checkoutUrl: string;
  sessionId: string;
}

export interface PortalParams {
  customerId: string;
  returnUrl: string;
}

export interface PortalResult {
  portalUrl: string;
}

export interface WebhookEvent {
  type: string;
  data: Record<string, unknown>;
}

export interface SubscriptionData {
  customerId: string;
  subscriptionId: string;
  status: "active" | "past_due" | "canceled" | "unpaid";
  seatCount: number;
  billingCycle: "monthly" | "annual";
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export interface PaymentProvider {
  createCheckoutSession(params: CheckoutParams): Promise<CheckoutResult>;
  createPortalSession(params: PortalParams): Promise<PortalResult>;
  parseWebhookEvent(body: string | Buffer, signature: string): Promise<WebhookEvent>;
  getSubscriptionData(subscriptionId: string): Promise<SubscriptionData>;
  updateSubscriptionSeats(subscriptionId: string, newSeatCount: number): Promise<void>;
  cancelSubscription(subscriptionId: string, atPeriodEnd: boolean): Promise<void>;
  resumeSubscription(subscriptionId: string): Promise<void>;
}
