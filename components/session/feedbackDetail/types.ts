/** Minimal feedback item shape used by UI subcomponents. */
export interface FeedbackItemShape {
  id: string;
  title: string;
  type: string;
  timestamp?: number;
  isResolved?: boolean;
  screenshotUrl?: string | null;
  description: string;
  suggestion?: string | null;
  contextSummary?: string | null;
  actionSteps?: string[] | null;
  suggestedTags?: string[] | null;
  /** ISO date string from API (audit trail). */
  createdAt?: string | null;
  /** ISO date string from API when available. */
  updatedAt?: string | null;
}
