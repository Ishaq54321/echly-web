import type { Timestamp } from "firebase/firestore";

export type NotificationType =
  | "comment.added"
  | "comment.mention"
  | "feedback.created"
  | "feedback.resolved"
  | "feedback.reopened"
  | "invite.sent"
  | "invite.accepted"
  | "access_request.approved"
  | "access_request.rejected"
  | "access_request.pending"
  | "session.shared";

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
  accessRequestId?: string | null;
  requestedAccess?: "view" | "resolve" | null;
  actionStatus?: "pending" | "approved" | "rejected" | null;
  collapseKey?: string | null;
  collapseCount?: number | null;
}
