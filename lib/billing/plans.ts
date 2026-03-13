/**
 * Plan definitions for SaaS billing. Limits are flexible; change here without rewriting call sites.
 * null means unlimited.
 */
export type PlanId = "free" | "starter" | "business" | "enterprise";

export interface PlanConfig {
  maxSessions: number | null;
  maxMembers: number | null;
  maxFeedbackPerSession: number | null;
  insightsAccess: boolean;
}

export const PLANS: Record<PlanId, PlanConfig> = {
  free: {
    maxSessions: 3,
    maxMembers: 1,
    maxFeedbackPerSession: 50,
    insightsAccess: false,
  },
  starter: {
    maxSessions: 20,
    maxMembers: 5,
    maxFeedbackPerSession: 500,
    insightsAccess: true,
  },
  business: {
    maxSessions: null,
    maxMembers: 20,
    maxFeedbackPerSession: null,
    insightsAccess: true,
  },
  enterprise: {
    maxSessions: null,
    maxMembers: null,
    maxFeedbackPerSession: null,
    insightsAccess: true,
  },
};

/** Suggested next plan when a limit is reached (for upgrade prompts). */
export const UPGRADE_PLAN: Record<PlanId, PlanId | null> = {
  free: "starter",
  starter: "business",
  business: "enterprise",
  enterprise: null,
};
