import type { SessionFeedbackCounts } from "@/lib/repositories/feedbackRepository";

const pendingRequests: Record<string, Promise<SessionFeedbackCounts>> = {};

export function getPendingRequest(
  sessionId: string
): Promise<SessionFeedbackCounts> | null {
  return pendingRequests[sessionId] ?? null;
}

export function setPendingRequest(
  sessionId: string,
  promise: Promise<SessionFeedbackCounts>
) {
  pendingRequests[sessionId] = promise;
}

export function clearPendingRequest(sessionId: string) {
  delete pendingRequests[sessionId];
}
