import type { Timestamp } from "firebase/firestore";

export interface StructuredFeedback {
  title: string;
  description: string;
  suggestion?: string;
  type: string;

  // Structuring (V2)
  contextSummary?: string;
  actionSteps?: string[];
  suggestedTags?: string[];

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
  createdAt: Timestamp | null;

  // Structuring (V2)
  contextSummary?: string | null;
  actionSteps?: string[] | null;
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

