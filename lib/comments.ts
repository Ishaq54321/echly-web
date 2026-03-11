// lib/comments.ts

export type { Comment, CommentAttachment, CommentPosition, CommentTextRange, CommentType } from "@/lib/domain/comment";
import type { CommentAttachment, CommentPosition, CommentTextRange } from "@/lib/domain/comment";
import {
  addCommentRepo,
  getSessionRecentCommentsRepo,
  updateCommentPositionRepo,
  updateCommentRepo,
  deleteCommentRepo,
  type AddCommentData,
  type UpdateCommentData,
} from "@/lib/repositories/commentsRepository";
import { resolveFeedbackRepo } from "@/lib/repositories/feedbackRepository";
import { updateSessionUpdatedAtRepo } from "@/lib/repositories/sessionsRepository";

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

export async function addComment(
  workspaceId: string,
  sessionId: string,
  feedbackId: string,
  data: AddCommentOptions
): Promise<string> {
  return addCommentRepo(workspaceId, sessionId, feedbackId, data as AddCommentData);
}

export async function updatePinPosition(
  commentId: string,
  position: { xPercent: number; yPercent: number }
): Promise<void> {
  await updateCommentPositionRepo(commentId, position);
}

export async function resolveFeedback(feedbackId: string, sessionId?: string) {
  await resolveFeedbackRepo(feedbackId);
  if (sessionId) await updateSessionUpdatedAtRepo(sessionId);
}

export type { UpdateCommentData };

export async function updateComment(
  commentId: string,
  data: UpdateCommentData
): Promise<void> {
  await updateCommentRepo(commentId, data);
}

export async function deleteComment(commentId: string): Promise<void> {
  await deleteCommentRepo(commentId);
}

/** Recent comments for a session (overview activity feed). Limited. */
export async function getSessionRecentComments(
  sessionId: string,
  max: number = 10
) {
  return getSessionRecentCommentsRepo(sessionId, max);
}