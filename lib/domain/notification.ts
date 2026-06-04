import type { Timestamp } from "firebase/firestore";

/**
 * Digest cutoff epoch (ms since UNIX). The activity-digest cron only considers
 * notifications whose `createdAt >= DIGEST_EPOCH`, so the first digest after
 * deploy is NOT a giant dump of all historical (pre-digest) notifications.
 *
 * Why a hardcoded constant and not "deploy time": deploy time isn't knowable
 * at runtime without extra plumbing, and a constant is deterministic, testable,
 * and survives redeploys (a moving "now - N days" window would silently change
 * which history is swept in on every deploy). This value is set to the digest
 * system's go-live instant. Notifications created before it are simply never
 * digested (absent `digestedAt` on them is harmless — the query floor excludes
 * them). Bump this only if you intentionally want to re-baseline the window.
 *
 * 2026-06-02T00:00:00.000Z — digest system go-live.
 */
export const DIGEST_EPOCH = 1748822400000;

export type NotificationType =
  | "comment.added"
  | "comment.mention"
  | "description.mention"
  | "feedback.created"
  | "feedback.resolved"
  | "feedback.reopened"
  | "ticket.assigned"
  | "invite.sent"
  | "invite.accepted"
  | "access_request.approved"
  | "access_request.rejected"
  | "access_request.pending"
  | "session.shared"
  | "session.opened";

export interface NotificationActor {
  id: string;
  name: string;
  photoURL?: string | null;
}

export interface Notification {
  id: string;
  userId: string;
  workspaceId: string;
  sessionId: string;
  sessionTitle?: string | null;
  feedbackId?: string | null;
  commentId?: string | null;
  type: NotificationType;
  actor: NotificationActor;
  title: string;
  entityTitle?: string | null;
  body?: string | null;
  read: boolean;
  readAt?: Timestamp | null;
  createdAt: Timestamp | null;
  /**
   * Set when this notification was included in a sent activity digest.
   * Absent/null = not yet digested (the correct go-forward default — nothing
   * is backfilled). Written transactionally at digest flush so overlapping or
   * retried cron runs never double-send or skip. See the activity-digest cron.
   */
  digestedAt?: Timestamp | null;
  accessRequestId?: string | null;
  requestedAccess?: "view" | "resolve" | null;
  actionStatus?: "pending" | "approved" | "rejected" | null;
  collapseKey?: string | null;
  collapseCount?: number | null;
}

export interface NotificationRow {
  id: string;
  userId: string;
  workspaceId: string;
  sessionId: string;
  sessionTitle?: string | null;
  feedbackId?: string | null;
  commentId?: string | null;
  type: NotificationType;
  actor: NotificationActor;
  title: string;
  entityTitle?: string | null;
  body?: string | null;
  read: boolean;
  readAt?: number | null;
  createdAt: number | null;
  /** Millis when included in a sent digest; null = not yet digested. */
  digestedAt?: number | null;
  accessRequestId?: string | null;
  requestedAccess?: "view" | "resolve" | null;
  actionStatus?: "pending" | "approved" | "rejected" | null;
  collapseKey?: string | null;
  collapseCount?: number | null;
}
