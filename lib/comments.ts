// lib/comments.ts

export type { Comment } from "@/lib/domain/comment";
import { addCommentRepo } from "@/lib/repositories/commentsRepository";
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