import type { Timestamp } from "firebase/firestore";

export type FeedbackPriority = "low" | "medium" | "high" | "critical";

export interface StructuredFeedback {
  title: string;
  description: string;
  suggestion?: string;
  type: string;

  // Elite structuring (action-ready ticket fields)
  contextSummary?: string;
  actionItems?: string[];
  impact?: string;
  suggestedTags?: string[];
  priority?: FeedbackPriority;

  // Metadata
  url?: string;
  viewportWidth?: number;
  viewportHeight?: number;
  userAgent?: string;
  timestamp?: number;

  // Screenshot
  screenshotUrl?: string | null;
}

export interface Feedback {
  id: string;
  sessionId: string;
  userId: string;
  title: string;
  description: string;
  suggestion?: string;
  type: string;
  isResolved: boolean;
  priority: FeedbackPriority;
  createdAt: Timestamp | null;

  // Elite structuring
  contextSummary?: string | null;
  actionItems?: string[] | null;
  impact?: string | null;
  suggestedTags?: string[] | null;

  // Metadata
  url?: string | null;
  viewportWidth?: number | null;
  viewportHeight?: number | null;
  userAgent?: string | null;
  clientTimestamp?: number | null;

  // Screenshot
  screenshotUrl?: string | null;
}

