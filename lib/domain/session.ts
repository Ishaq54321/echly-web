import type { Timestamp } from "firebase/firestore";

export interface SessionCreatedBy {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export interface Session {
  id: string;
  userId: string;
  title: string;
  archived?: boolean;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
  /** Set at creation. Creator profile for card display. */
  createdBy?: SessionCreatedBy | null;
  /** Loom-style unique view count (one per viewer per session). */
  viewCount?: number;
  /** Total comment count across all feedback in this session. */
  commentCount?: number;
  /** Optional session-level AI insight summary (plain text). */
  aiInsightSummary?: string | null;
  /** Feedback count at the time aiInsightSummary was generated. */
  aiInsightSummaryFeedbackCount?: number;
  /** Timestamp when aiInsightSummary was last generated. */
  aiInsightSummaryUpdatedAt?: Timestamp | null;
  /** Denormalized: total open feedback (WAVE 1 structural). */
  openCount?: number;
  /** Denormalized: total resolved feedback (WAVE 1 structural). */
  resolvedCount?: number;
  /** Denormalized: total feedback count (WAVE 1 structural). */
  feedbackCount?: number;
}

