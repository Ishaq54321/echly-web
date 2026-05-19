import type { Timestamp } from "firebase/firestore";

export type WorkspacePlan = "starter" | "business" | "enterprise";
export type WorkspaceBillingCycle = "monthly" | "annual";

/** Pre-aggregated counts for /api/insights. Updated in write-path transactions. */
export interface WorkspaceStats {
  totalFeedback: number;
  totalComments: number;
  totalSessions: number;
  last30DaysFeedback: number;
  last30DaysComments: number;
  last30DaysSessions: number;
  updatedAt: Timestamp | null;
}

export interface Workspace {
  id: string;
  name: string;
  /** Vanity URL slug — unique, lowercase, alphanumeric + hyphens. May be missing on legacy docs. */
  slug?: string | null;
  logoUrl: string | null;
  /** Whitelabel brand logo (rectangular, ~30px tall) shown on session top bars. Paid plans only. */
  brandLogoUrl: string | null;
  ownerId: string;
  // WORKSPACE-MEMBER: member list moved to workspaces/{id}/members subcollection
  members?: string[];
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;

  // Soft-delete fields
  deletedAt?: Timestamp | null;
  deletedBy?: string | null;
  deleteScheduledPurgeAt?: Timestamp | null;

  appearance: {
    logoOnFeedbackScreen: boolean;
    accentColor: string | null;
    removeEchlyBranding: boolean;
  };

  notifications: {
    email: {
      feedbackSubmitted: boolean;
      replyPosted: boolean;
      dailyDigest: boolean;
      commentMentions: boolean;
    };
  };

  automations: {
    autoCreateTicketOnFeedback: boolean;
  };

  permissions: {
    allowGuestComments: boolean;
  };

  integrations: {
    slack: { connected: boolean };
    linear: { connected: boolean };
    jira: { connected: boolean };
    zapier: { connected: boolean };
  };

  billing: {
    plan: WorkspacePlan;
    billingCycle: WorkspaceBillingCycle;
    seats: number;
    /** Monthly price per seat (0 for starter, set for business). */
    pricePerSeat?: number;
    customerId?: string | null;
    subscriptionId?: string | null;
    /**
     * Set when the subscription is scheduled to cancel at period end (the
     * sub is still active until this date). Cleared (null / absent) when no
     * cancellation is pending or after the downgrade lands. Populated from
     * provider `subscription.updated` events.
     */
    cancelAt?: Timestamp | null;
    /**
     * Next renewal/charge date for an active subscription (provider
     * `currentPeriodEnd`). Written on `subscription.started` / `.updated`,
     * nulled on cancel. Absent until the first webhook fires — comp'd and
     * Enterprise workspaces have no standard cycle, so it stays absent.
     */
    nextBilledAt?: Timestamp | null;
    /** Set by admin; when true, workspace cannot use the app. */
    suspended?: boolean;
    /** Admin-granted comp. When true, provider webhooks must not downgrade/suspend this workspace. */
    manualOverride?: boolean;
    /**
     * Card on file, populated from provider subscription events. `null` when
     * unknown (comp'd workspaces, or the provider didn't send card metadata).
     */
    paymentMethod?: {
      brand: string; // "visa", "mastercard", "amex", etc.
      last4: string; // "4242"
      expiryMonth?: number; // optional — provider may omit on subscription events
      expiryYear?: number;
    } | null;
  };

  /** Only explicit overrides. Plan-derived limits come from plan catalog; missing = use catalog. */
  entitlements: {
    /** Override only; if absent, use catalog[plan].maxFeedbackPerMonth */
    maxFeedbackPerMonth?: number | null;
    /** Override only; if absent, use catalog[plan].maxMembers */
    maxMembers?: number | null;
    /** Override only; if absent, use catalog[plan].insightsAccess */
    insightsAccess?: boolean;
    /** Override only; if absent, use catalog[plan].customBranding */
    customBranding?: boolean;
    /** Override only; if absent, use catalog[plan].prioritySupport */
    prioritySupport?: boolean;
    integrations?: boolean;
  };

  /** Counters for billing/limits. Incremented in transactions. */
  usage: {
    sessionsCreated: number;
    feedbackCreated: number;
    /** Resets on the 1st of each month. Checked against maxFeedbackPerMonth. */
    feedbackCreatedThisMonth: number;
    /** ISO date string of last reset (YYYY-MM-DD). Used to detect month boundary. */
    feedbackResetDate: string;
    members: number;
  };

  /** Active session count = sessionCount - archivedCount. Kept in sync on create/archive. */
  sessionCount?: number;
  archivedCount?: number;

  /** Pre-aggregated counts for insights. One workspace doc read replaces 6 count + 3 getDocs. */
  stats?: WorkspaceStats;

  /**
   * Phase 5: per-billing-cycle dedupe for plan-limit emails. `lastSentAt` is
   * the server timestamp of the last send; a send is allowed again only once
   * it predates the current cycle start (usage.feedbackResetDate). Optional —
   * absent means "never sent". Written by lib/email/planLimitDispatch.server.
   */
  planLimitWarnings?: {
    approaching?: { lastSentAt: Timestamp };
    hit?: { lastSentAt: Timestamp };
  };
}

export type WorkspaceDoc = Omit<Workspace, "id">;

export function defaultWorkspaceDoc(params: {
  ownerId: string;
  name?: string | null;
  logoUrl?: string | null;
  slug?: string | null;
}): WorkspaceDoc {
  const now = new Date();
  const resetDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  return {
    name: (params.name ?? "My Workspace").trim() || "My Workspace",
    slug: params.slug ?? null,
    logoUrl: params.logoUrl ?? null,
    brandLogoUrl: null,
    ownerId: params.ownerId,
    // WORKSPACE-MEMBER: member list moved to workspaces/{id}/members subcollection
    createdAt: null,
    updatedAt: null,
    deletedAt: null,
    deletedBy: null,
    deleteScheduledPurgeAt: null,
    appearance: {
      logoOnFeedbackScreen: false,
      accentColor: null,
      removeEchlyBranding: false,
    },
    notifications: {
      email: {
        feedbackSubmitted: true,
        replyPosted: true,
        dailyDigest: false,
        commentMentions: true,
      },
    },
    automations: {
      autoCreateTicketOnFeedback: false,
    },
    permissions: {
      allowGuestComments: false,
    },
    integrations: {
      slack: { connected: false },
      linear: { connected: false },
      jira: { connected: false },
      zapier: { connected: false },
    },
    billing: {
      plan: "starter",
      billingCycle: "monthly",
      seats: 1,
      pricePerSeat: 0,
      customerId: null,
      subscriptionId: null,
      manualOverride: false,
      paymentMethod: null,
    },
    entitlements: {
      // Do not set overrides — plan catalog is source of truth
    },
    usage: {
      sessionsCreated: 0,
      feedbackCreated: 0,
      feedbackCreatedThisMonth: 0,
      feedbackResetDate: resetDate,
      members: 0,
    },
    sessionCount: 0,
    archivedCount: 0,
  };
}
