import type { DocumentReference } from "firebase/firestore";
export type {
  Feedback,
  FeedbackPriority,
  FeedbackStatus,
  StructuredFeedback,
} from "@/lib/domain/feedback";
import type {
  FeedbackPriority,
  FeedbackStatus,
  StructuredFeedback,
  Feedback,
} from "@/lib/domain/feedback";
import {
  addFeedbackRepo,
  deleteFeedbackRepo,
  getSessionFeedbackRepo,
  updateFeedbackRepo,
} from "@/lib/repositories/feedbackRepository";

/* ================================
   TYPES
================================ */

// Types live in `lib/domain/feedback.ts` and are re-exported above.

/* ================================
   ADD FEEDBACK
================================ */

export async function addFeedback(
  sessionId: string,
  userId: string,
  data: StructuredFeedback,
  feedbackId?: string
): Promise<DocumentReference> {
  return await addFeedbackRepo(sessionId, userId, data, feedbackId);
}

/* ================================
   UPDATE FEEDBACK
================================ */

export async function updateFeedback(
  feedbackId: string,
  data: Partial<{
  title: string;
  description: string;
  type: string;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  screenshotUrl: string | null;
}>
) {
  await updateFeedbackRepo(feedbackId, data);
}

/* ================================
   GET SESSION FEEDBACK
================================ */

export async function getSessionFeedback(
  sessionId: string,
  max?: number
): Promise<Feedback[]> {
  return await getSessionFeedbackRepo(sessionId, max);
}

/* ================================
   DELETE FEEDBACK
================================ */

export async function deleteFeedback(feedbackId: string) {
  await deleteFeedbackRepo(feedbackId);
}