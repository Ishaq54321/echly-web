import type { Workspace } from "@/lib/domain/workspace";

// Northwind Studio — the canonical workspace for marketing demos.
// Conforms to the real Workspace type. Firestore Timestamp fields are
// set to null; mock data must not import firebase/firestore.

export const mockWorkspace: Workspace = {
  id: "ws_northwind_studio",
  name: "Northwind Studio",
  slug: "northwind-studio",
  logoUrl: null,
  brandLogoUrl: null,
  ownerId: "user_sarah",
  createdAt: null,
  updatedAt: null,
  deletedAt: null,
  deletedBy: null,
  deleteScheduledPurgeAt: null,
  appearance: {
    logoOnFeedbackScreen: true,
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
    allowGuestComments: true,
  },
  integrations: {
    slack: { connected: true },
    linear: { connected: true },
    jira: { connected: false },
    zapier: { connected: false },
  },
  billing: {
    plan: "business",
    billingCycle: "monthly",
    seats: 4,
    pricePerSeat: 24,
    customerId: null,
    subscriptionId: null,
    manualOverride: false,
    paymentMethod: null,
  },
  entitlements: {},
  usage: {
    sessionsCreated: 28,
    feedbackCreated: 312,
    feedbackCreatedThisMonth: 87,
    feedbackResetDate: "2026-05-01",
    members: 4,
  },
  sessionCount: 18,
  archivedCount: 10,
};
