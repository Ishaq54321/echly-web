import type { Timestamp } from "firebase/firestore";

export type WorkspacePlan = "free" | "starter" | "business" | "enterprise";
export type WorkspaceBillingCycle = "monthly" | "annual";

export interface Workspace {
  id: string;
  name: string;
  logoUrl: string | null;
  ownerId: string;
  members: string[];
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;

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

  ai: {
    actionStepsEnabled: boolean;
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
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
  };

  entitlements: {
    brandingControls: boolean;
    integrations: boolean;
  };
}

export type WorkspaceDoc = Omit<Workspace, "id">;

export function defaultWorkspaceDoc(params: {
  ownerId: string;
  name?: string | null;
  logoUrl?: string | null;
}): WorkspaceDoc {
  return {
    name: (params.name ?? "My Workspace").trim() || "My Workspace",
    logoUrl: params.logoUrl ?? null,
    ownerId: params.ownerId,
    members: [params.ownerId],
    createdAt: null,
    updatedAt: null,
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
    ai: {
      actionStepsEnabled: true,
    },
    integrations: {
      slack: { connected: false },
      linear: { connected: false },
      jira: { connected: false },
      zapier: { connected: false },
    },
    billing: {
      plan: "free",
      billingCycle: "monthly",
      seats: 1,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
    },
    entitlements: {
      brandingControls: false,
      integrations: false,
    },
  };
}

