/**
 * Firestore document for admin-editable plan (collection: plans).
 * Document id should match plan key (e.g. starter, business, enterprise).
 */
export interface PlanDoc {
  name: string;
  /** Monthly price per seat (0 for starter, set for business). */
  pricePerSeat: number | null;
  /** Annual price per seat. */
  annualPricePerSeat: number | null;
  maxFeedbackPerMonth: number | null;
  maxMembers: number | null;
  insightsEnabled: boolean;
  customBranding: boolean;
  prioritySupport: boolean;
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
