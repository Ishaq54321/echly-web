import type { Timestamp } from "firebase/firestore";

export interface StructuredFeedback {
  title: string;
  instruction?: string;
  description?: string;
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
  screenshotStatus?: "attached" | "pending" | "none" | "failed" | null;
  status?: "processing" | "complete" | "open" | "resolved" | "failed";
}

/** Derived status for a ticket. Prefer explicit checks over !isResolved. */
export type TicketStatus = "open" | "resolved";

/**
 * Anchor used to scroll to a specific feedback location in the UI.
 * - `selector`: preferred when present (DOM lookup)
 * - `x`/`y`: fallback absolute page coordinates
 */
export type FeedbackAnchor = {
  selector?: string;
  x?: number;
  y?: number;
};

export interface Feedback {
  id: string;
  /** Workspace scope (primary). */
  workspaceId?: string;
  sessionId: string;
  /** Legacy scope (pre-workspaces). */
  userId?: string;
  title: string;
  instruction?: string;
  description?: string;
  suggestion?: string;
  type: string;
  isResolved: boolean;
  createdAt: Timestamp | null;
  /** Number of comments on this feedback. Used for Discussion feed (conversations only). */
  commentCount?: number;
  /** Truncated last comment message for feed preview. */
  lastCommentPreview?: string;
  /** Timestamp of last comment. */
  lastCommentAt?: Timestamp | null;

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
  screenshotStatus?: "attached" | "pending" | "none" | "failed" | null;
  status?: "processing" | "complete" | "open" | "resolved" | "failed";

  /** Soft delete: when true, row stays in Firestore but is hidden from list/query semantics. */
  isDeleted?: boolean;
}

/** Returns explicit status for a feedback item. Use instead of !isResolved. */
export function getTicketStatus(f: Pick<Feedback, "isResolved">): TicketStatus {
  if (f.isResolved === true) return "resolved";
  return "open";
}
