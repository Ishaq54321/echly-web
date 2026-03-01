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
  getFeedbackByIdsRepo,
  getSessionFeedbackByStatusRepo,
  getSessionFeedbackCountsByStatusRepo,
  getSessionFeedbackHighImpactRepo,
  getSessionFeedbackPageRepo,
  getSessionFeedbackTotalCountRepo,
  updateFeedbackRepo,
} from "@/lib/repositories/feedbackRepository";
import { updateSessionUpdatedAtRepo } from "@/lib/repositories/sessionsRepository";
import type {
  FeedbackPageCursor,
  FeedbackPageResult,
  SessionFeedbackCounts,
} from "@/lib/repositories/feedbackRepository";
export type {
  FeedbackPageCursor,
  FeedbackPageResult,
  SessionFeedbackCounts,
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
  const ref = await addFeedbackRepo(sessionId, userId, data, feedbackId);
  await updateSessionUpdatedAtRepo(sessionId);
  return ref;
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
    actionItems: string[] | null;
  }>,
  sessionId?: string
) {
  await updateFeedbackRepo(feedbackId, data);
  if (sessionId) await updateSessionUpdatedAtRepo(sessionId);
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

/** Counts by status for overview. Uses aggregation (no unbounded reads). */
export async function getSessionFeedbackCountsByStatus(
  sessionId: string
): Promise<SessionFeedbackCounts> {
  return getSessionFeedbackCountsByStatusRepo(sessionId);
}

/** Up to N feedback items per status for overview preview. */
export async function getSessionFeedbackByStatus(
  sessionId: string,
  status: FeedbackStatus,
  max: number = 3
): Promise<Feedback[]> {
  return getSessionFeedbackByStatusRepo(sessionId, status, max);
}

/** Total feedback count for session (aggregation). */
export async function getSessionFeedbackTotalCount(
  sessionId: string
): Promise<number> {
  return getSessionFeedbackTotalCountRepo(sessionId);
}

/** Up to N high-impact items for session, newest first. */
export async function getSessionFeedbackHighImpact(
  sessionId: string,
  max: number = 5
): Promise<Feedback[]> {
  return getSessionFeedbackHighImpactRepo(sessionId, max);
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

export async function deleteFeedback(feedbackId: string, sessionId?: string) {
  await deleteFeedbackRepo(feedbackId);
  if (sessionId) await updateSessionUpdatedAtRepo(sessionId);
}