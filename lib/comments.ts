// lib/comments.ts

export type { Comment, CommentAttachment, CommentPosition, CommentTextRange, CommentType } from "@/lib/domain/comment";
import type { Comment, CommentAttachment, CommentPosition, CommentTextRange } from "@/lib/domain/comment";
import {
  getSessionRecentCommentsRepo,
} from "@/lib/repositories/commentsRepository";
import { authFetch } from "@/lib/authFetch";

export interface AddCommentOptions {
  userId: string;
  userName: string;
  userAvatar: string;
  message: string;
  type?: "pin" | "text" | "general";
  position?: CommentPosition;
  textRange?: CommentTextRange;
  threadId?: string | null;
  attachment?: CommentAttachment;
}

export type OptimisticComment = Comment & {
  isOptimistic: true;
  optimisticCreatedAtMs: number;
};

export function createOptimisticComment(args: {
  sessionId: string;
  feedbackId: string;
  data: AddCommentOptions;
}): OptimisticComment {
  const { sessionId, feedbackId, data } = args;
  const optimisticCreatedAtMs = Date.now();
  const tempId = "temp_" + optimisticCreatedAtMs;
  const optimisticDate = new Date(optimisticCreatedAtMs);

  return {
    id: tempId,
    sessionId,
    feedbackId,
    userId: data.userId,
    userName: data.userName,
    userAvatar: data.userAvatar,
    message: data.message,
    createdAt: { toDate: () => optimisticDate } as Comment["createdAt"],
    type: data.type ?? "general",
    position: data.position,
    textRange: data.textRange,
    threadId: data.threadId,
    attachment: data.attachment,
    isOptimistic: true,
    optimisticCreatedAtMs,
  };
}

export async function addComment(
  sessionId: string,
  feedbackId: string,
  data: AddCommentOptions
): Promise<string> {
  const res = await authFetch("/api/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, feedbackId, data }),
  });
  if (!res) throw new Error("Not authenticated");
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || "Failed to add comment");
  }
  const json = (await res.json()) as { id?: string };
  if (!json.id) throw new Error("Missing comment id");
  return json.id;
}

export async function updatePinPosition(
  commentId: string,
  position: { xPercent: number; yPercent: number }
): Promise<void> {
  const res = await authFetch("/api/comments", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ commentId, data: { position } }),
  });
  if (!res) throw new Error("Not authenticated");
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || "Failed to update comment position");
  }
}

export async function resolveFeedback(feedbackId: string, sessionId?: string) {
  const res = await authFetch(`/api/tickets/${feedbackId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isResolved: true }),
  });
  void sessionId;
  if (!res) throw new Error("Not authenticated");
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || "Failed to resolve feedback");
  }
}

export interface UpdateCommentData {
  message?: string;
  resolved?: boolean;
}

export async function updateComment(
  commentId: string,
  data: UpdateCommentData
): Promise<void> {
  const res = await authFetch("/api/comments", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ commentId, data }),
  });
  if (!res) throw new Error("Not authenticated");
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || "Failed to update comment");
  }
}

export async function deleteComment(commentId: string): Promise<void> {
  const res = await authFetch("/api/comments", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ commentId }),
  });
  if (!res) throw new Error("Not authenticated");
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || "Failed to delete comment");
  }
}

/** Recent comments for a session (overview activity feed). Limited. */
export async function getSessionRecentComments(
  workspaceId: string,
  sessionId: string,
  max: number = 10
) {
  return getSessionRecentCommentsRepo(workspaceId, sessionId, max);
}