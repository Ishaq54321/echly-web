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
  getSessionFeedbackPageRepo,
  updateFeedbackRepo,
} from "@/lib/repositories/feedbackRepository";
import type { FeedbackPageCursor, FeedbackPageResult } from "@/lib/repositories/feedbackRepository";
export type { FeedbackPageCursor, FeedbackPageResult } from "@/lib/repositories/feedbackRepository";

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
   GET SESSION FEEDBACK (paginated)
================================ */

/** Fetches one page of feedback; use for cursor-based pagination. */
export async function getSessionFeedbackPage(
  sessionId: string,
  pageSize: number = 20,
  cursor?: FeedbackPageCursor | null
): Promise<FeedbackPageResult> {
  return getSessionFeedbackPageRepo(sessionId, pageSize, cursor ?? undefined);
}

/** First page only; for callers that need a single batch (e.g. CaptureWidget). Cost protection: always limited. */
export async function getSessionFeedback(
  sessionId: string,
  max: number = 50
): Promise<Feedback[]> {
  const { feedback } = await getSessionFeedbackPageRepo(sessionId, max);
  return feedback;
}

/* ================================
   DELETE FEEDBACK
================================ */

export async function deleteFeedback(feedbackId: string) {
  await deleteFeedbackRepo(feedbackId);
}