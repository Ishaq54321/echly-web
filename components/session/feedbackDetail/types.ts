import type { Timestamp } from "firebase/firestore";

/** Minimal feedback item shape used by UI subcomponents. */
export interface FeedbackItemShape {
  id: string;
  title: string;
  type: string;
  timestamp?: number;
  isResolved?: boolean;
  screenshotId?: string | null;
  description?: string | null;
  tags?: string[] | null;
  pageArea?: string | null;
  userAgent?: string | null;
  viewportWidth?: number | null;
  viewportHeight?: number | null;
  screenWidth?: number | null;
  screenHeight?: number | null;
  devicePixelRatio?: number | null;
  /** Public share only: sanitized attachment metadata (screenshots + files). */
  publicAttachments?: ReadonlyArray<
    | { kind: "screenshot"; url: string }
    | { kind: "file"; url: string; name?: string; size?: number }
  >;
  /** ISO date string from API or Firestore Timestamp (audit trail). */
  createdAt?: string | Timestamp | null;
  /** ISO date string from API or Firestore Timestamp when available. */
  updatedAt?: string | Timestamp | null;

  assigneeId?: string | null;
  assigneeName?: string | null;
  assigneeAvatarUrl?: string | null;
  priority?: "high" | "medium" | "low" | null;
}
