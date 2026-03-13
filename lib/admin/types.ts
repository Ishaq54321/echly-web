/**
 * Firestore document for admin-editable plan (collection: plans).
 * Document id should match plan key (e.g. free, starter, business, enterprise).
 */
export interface PlanDoc {
  name: string;
  priceMonthly: number;
  priceYearly: number;
  maxSessions: number | null;
  maxMembers: number | null;
  insightsEnabled: boolean;
}

/**
 * Firestore document for feature flag (collection: featureFlags).
 */
export interface FeatureFlagDoc {
  name: string;
  enabledGlobally: boolean;
  enabledForWorkspaces: string[]; // workspace IDs where flag is enabled (when not global)
}

/**
 * Admin action log (collection: adminLogs).
 */
export interface AdminLogDoc {
  adminId: string;
  action: string;
  workspaceId?: string | null;
  metadata?: Record<string, unknown>;
  timestamp: { seconds: number; nanoseconds: number };
}
