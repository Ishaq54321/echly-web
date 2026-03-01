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
}

