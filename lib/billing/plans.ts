/**
 * Plan definitions for SaaS billing. Starter is free, Business is per-seat.
 * null means unlimited.
 */
export type PlanId = "starter" | "business" | "enterprise";

export interface PlanConfig {
  maxFeedbackPerMonth: number | null;
  maxMembers: number | null;
  /** AI improvements allowed per calendar month. null = unlimited. */
  aiImprovementsPerMonth: number | null;
  insightsAccess: boolean;
  customBranding: boolean;
  prioritySupport: boolean;
  integrations: boolean;
}

export interface PlanDisplayLimits {
  sessions: string;
  members: string;
  feedbackTickets: string;
}

export interface PlanDefinition extends PlanConfig {
  id: PlanId;
  name: string;
  description: string;
  /** Flat monthly price (null = per-seat or custom) */
  monthlyPrice: number | null;
  /** Flat annual price (null = per-seat or custom) */
  annualPrice: number | null;
  /** Monthly price per seat (0 for free tier, null for custom) */
  pricePerSeat: number | null;
  /** Annual price per seat — 20% discount off monthly per seat */
  annualPricePerSeat: number | null;
  displayLimits: PlanDisplayLimits;
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  starter: {
    id: "starter",
    name: "Starter",
    description: "For individuals and small teams getting started",
    monthlyPrice: 0,
    annualPrice: 0,
    pricePerSeat: 0,
    annualPricePerSeat: 0,
    maxFeedbackPerMonth: 50,
    maxMembers: 5,
    aiImprovementsPerMonth: 300,
    insightsAccess: false,
    customBranding: false,
    prioritySupport: false,
    integrations: false,
    displayLimits: {
      sessions: "Limited",
      members: "Limited",
      feedbackTickets: "50 / month",
    },
  },
  business: {
    id: "business",
    name: "Business",
    description: "For growing teams that need more power",
    monthlyPrice: null,
    annualPrice: null,
    pricePerSeat: 24,
    annualPricePerSeat: 19,
    maxFeedbackPerMonth: null,
    maxMembers: null,
    aiImprovementsPerMonth: 1500,
    insightsAccess: true,
    customBranding: true,
    prioritySupport: false,
    integrations: true,
    displayLimits: {
      sessions: "Unlimited",
      members: "Unlimited",
      feedbackTickets: "Unlimited",
    },
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations with custom needs",
    monthlyPrice: null,
    annualPrice: null,
    pricePerSeat: null,
    annualPricePerSeat: null,
    maxFeedbackPerMonth: null,
    maxMembers: null,
    aiImprovementsPerMonth: null,
    insightsAccess: true,
    customBranding: true,
    prioritySupport: true,
    integrations: true,
    displayLimits: {
      sessions: "Unlimited",
      members: "Unlimited",
      feedbackTickets: "Unlimited",
    },
  },
};

/** Suggested next plan when a limit is reached (for upgrade prompts). */
export const UPGRADE_PLAN: Record<PlanId, PlanId | null> = {
  starter: "business",
  business: "enterprise",
  enterprise: null,
};
