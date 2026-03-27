export type { Feedback, StructuredFeedback } from "@/lib/domain/feedback";
import type { StructuredFeedback, Feedback } from "@/lib/domain/feedback";
import { authFetch } from "@/lib/authFetch";
import {
  getFeedbackByIdsRepo,
  getSessionFeedbackByResolvedRepo,
  getSessionFeedbackPageRepo,
} from "@/lib/repositories/feedbackRepository";
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
    instruction: string;
    description: string;
    type: string;
    isResolved: boolean;
    screenshotUrl: string | null;
    actionSteps: string[] | null;
  }>,
  sessionId?: string
) {
  const res = await authFetch(`/api/tickets/${encodeURIComponent(feedbackId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  void sessionId;
  if (!res) throw new Error("Not authenticated");
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || "Failed to update feedback");
  }
}

/* ================================
   GET SESSION FEEDBACK (paginated)
================================ */

/** Fetches one page of feedback; use for cursor-based pagination. */
export async function getSessionFeedbackPage(
  workspaceId: string,
  sessionId: string,
  pageSize: number = 20,
  cursor?: FeedbackPageCursor | null
): Promise<FeedbackPageResult> {
  return getSessionFeedbackPageRepo(workspaceId, sessionId, {
    limit: pageSize,
    cursor: cursor ?? null,
    status: "all",
  });
}

/** First page only; for callers that need a single batch (e.g. CaptureWidget). Cost protection: always limited. */
export async function getSessionFeedback(
  workspaceId: string,
  sessionId: string,
  max: number = 50
): Promise<Feedback[]> {
  const { feedback } = await getSessionFeedbackPageRepo(workspaceId, sessionId, {
    limit: max,
    status: "all",
  });
  return feedback;
}

/** Up to N feedback items by resolution for overview preview. */
export async function getSessionFeedbackByResolved(
  workspaceId: string,
  sessionId: string,
  isResolved: boolean,
  max: number = 3
): Promise<Feedback[]> {
  return getSessionFeedbackByResolvedRepo(workspaceId, sessionId, isResolved, max);
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
  const res = await authFetch(`/api/tickets/${encodeURIComponent(feedbackId)}`, {
    method: "DELETE",
  });
  if (!res) throw new Error("Not authenticated");
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || "Failed to delete feedback");
  }
}