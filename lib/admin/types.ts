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
 * Admin action log (collection: adminLogs).
 */
export interface AdminLogDoc {
  adminId: string;
  action: string;
  workspaceId?: string | null;
  metadata?: Record<string, unknown>;
  timestamp: { seconds: number; nanoseconds: number };
}
