import type { Timestamp } from "firebase/firestore";

export type FeedbackStatus = "open" | "in_progress" | "resolved";
export type FeedbackPriority = "low" | "medium" | "high" | "critical";

export interface StructuredFeedback {
  title: string;
  description: string;
  suggestion?: string;
  type: string;

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
  status: FeedbackStatus;
  priority: FeedbackPriority;
  createdAt: Timestamp | null;

  // Metadata
  url?: string | null;
  viewportWidth?: number | null;
  viewportHeight?: number | null;
  userAgent?: string | null;
  clientTimestamp?: number | null;

  // Screenshot
  screenshotUrl?: string | null;
}

