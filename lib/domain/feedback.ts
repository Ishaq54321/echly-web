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

  // Clarity Guard (Phase 5.1)
  clarityScore?: number | null;
  clarityStatus?: "clear" | "needs_improvement" | "unclear" | null;
  clarityIssues?: string[] | null;
  clarityConfidence?: number | null;
  clarityCheckedAt?: Timestamp | null;
}

/** Derived status for a ticket. Prefer explicit checks over !isResolved. */
export type TicketStatus = "open" | "resolved" | "skipped";

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
  description: string;
  suggestion?: string;
  type: string;
  isResolved: boolean;
  /** True when ticket was skipped (e.g. in Execution Mode). Excluded from open count. */
  isSkipped?: boolean;
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

  // Clarity Guard (Phase 5.1)
  clarityScore?: number | null;
  clarityStatus?: "clear" | "needs_improvement" | "unclear" | null;
  clarityIssues?: string[] | null;
  clarityConfidence?: number | null;
  clarityCheckedAt?: Timestamp | null;
}

/** Returns explicit status for a feedback item. Use instead of !isResolved. */
export function getTicketStatus(f: Pick<Feedback, "isResolved" | "isSkipped">): TicketStatus {
  if (f.isSkipped === true) return "skipped";
  if (f.isResolved === true) return "resolved";
  return "open";
}
