// lib/comments.ts

export type { Comment } from "@/lib/domain/comment";
import {
  addCommentRepo,
  getSessionRecentCommentsRepo,
} from "@/lib/repositories/commentsRepository";
import { resolveFeedbackRepo } from "@/lib/repositories/feedbackRepository";

export async function addComment(
  sessionId: string,
  feedbackId: string,
  data: {
    userId: string;
    userName: string;
    userAvatar: string;
    message: string;
  }
) {
  return addCommentRepo(sessionId, feedbackId, data);
}

export async function resolveFeedback(feedbackId: string) {
  await resolveFeedbackRepo(feedbackId);
}

/** Recent comments for a session (overview activity feed). Limited. */
export async function getSessionRecentComments(
  sessionId: string,
  max: number = 10
) {
  return getSessionRecentCommentsRepo(sessionId, max);
}