import type { Timestamp } from "firebase/firestore";

/** Minimal feedback item shape used by UI subcomponents. */
export interface FeedbackItemShape {
  id: string;
  title: string;
  type: string;
  timestamp?: number;
  isResolved?: boolean;
  screenshotUrl?: string | null;
  /** @deprecated Description layer removed; kept optional for backward compat with existing data. Do not display. */
  description?: string;
  suggestion?: string | null;
  contextSummary?: string | null;
  actionSteps?: string[] | null;
  suggestedTags?: string[] | null;
  /** ISO date string from API or Firestore Timestamp (audit trail). */
  createdAt?: string | Timestamp | null;
  /** ISO date string from API or Firestore Timestamp when available. */
  updatedAt?: string | Timestamp | null;
}
