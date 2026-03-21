export type { Feedback, StructuredFeedback } from "@/lib/domain/feedback";
import type { StructuredFeedback, Feedback } from "@/lib/domain/feedback";
import {
  deleteFeedbackWithSessionCountersRepo,
  getFeedbackByIdsRepo,
  getSessionFeedbackByResolvedRepo,
  getSessionFeedbackPageRepo,
  updateFeedbackRepo,
  updateFeedbackResolveAndSessionCountersRepo,
} from "@/lib/repositories/feedbackRepository";
import { updateSessionUpdatedAtRepo } from "@/lib/repositories/sessionsRepository";
import type {
  FeedbackPageCursor,
  FeedbackPageResult,
} from "@/lib/repositories/feedbackRepository";
export type {
  FeedbackPageCursor,
  FeedbackPageResult,
} from "@/lib/repositories/feedbackRepository";

/* ================================
   TYPES
================================ */

// Types live in `lib/domain/feedback.ts` and are re-exported above.

/* ================================
   UPDATE FEEDBACK
================================ */

export async function updateFeedback(
  feedbackId: string,
  data: Partial<{
    title: string;
    description: string;
    type: string;
    isResolved: boolean;
    screenshotUrl: string | null;
    actionSteps: string[] | null;
  }>,
  sessionId?: string
) {
  if (typeof (data as { isResolved?: boolean }).isResolved === "boolean") {
    await updateFeedbackResolveAndSessionCountersRepo(feedbackId, data);
  } else {
    await updateFeedbackRepo(feedbackId, data);
    if (sessionId) await updateSessionUpdatedAtRepo(sessionId);
  }
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
  return getSessionFeedbackPageRepo(sessionId, {
    limit: pageSize,
    cursor: cursor ?? null,
    status: "all",
  });
}

/** First page only; for callers that need a single batch (e.g. CaptureWidget). Cost protection: always limited. */
export async function getSessionFeedback(
  sessionId: string,
  max: number = 50
): Promise<Feedback[]> {
  const { feedback } = await getSessionFeedbackPageRepo(sessionId, {
    limit: max,
    status: "all",
  });
  return feedback;
}

/** Up to N feedback items by resolution for overview preview. */
export async function getSessionFeedbackByResolved(
  sessionId: string,
  isResolved: boolean,
  max: number = 3
): Promise<Feedback[]> {
  return getSessionFeedbackByResolvedRepo(sessionId, isResolved, max);
}

/** Fetch feedback by IDs (e.g. for activity titles). Limited. */
export async function getFeedbackByIds(
  feedbackIds: string[],
  max?: number
): Promise<Feedback[]> {
  return getFeedbackByIdsRepo(feedbackIds, max);
}

/* ================================
   DELETE FEEDBACK
================================ */

export async function deleteFeedback(feedbackId: string, _sessionId?: string) {
  await deleteFeedbackWithSessionCountersRepo(feedbackId);
}