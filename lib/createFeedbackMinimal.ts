import {
  addDoc,
  collection,
  serverTimestamp,
  type DocumentReference,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { StructuredFeedback } from "@/lib/domain/feedback";

export type CreateFeedbackMinimalData = {
  workspaceId: string;
  sessionId: string;
  userId: string;
  data: StructuredFeedback;
};

function buildPayload(
  workspaceId: string,
  sessionId: string,
  userId: string,
  data: StructuredFeedback
) {
  return {
    workspaceId,
    sessionId,
    userId,
    title: data.title,
    description: data.description,
    suggestion: data.suggestion ?? "",
    type: data.type,
    status: (data as StructuredFeedback & { status?: string }).status ?? "open",
    createdAt: serverTimestamp(),
    commentCount: 0,
    contextSummary: data.contextSummary ?? null,
    actionSteps: data.actionSteps ?? null,
    suggestedTags: data.suggestedTags ?? null,
    url: data.url ?? null,
    viewportWidth: data.viewportWidth ?? null,
    viewportHeight: data.viewportHeight ?? null,
    userAgent: data.userAgent ?? null,
    clientTimestamp: data.timestamp ?? null,
    screenshotUrl: data.screenshotUrl ?? null,
    clarityScore: data.clarityScore ?? null,
    clarityStatus: data.clarityStatus ?? null,
    clarityIssues: data.clarityIssues ?? null,
    clarityConfidence: data.clarityConfidence ?? null,
    clarityCheckedAt:
      data.clarityScore != null || data.clarityStatus != null
        ? serverTimestamp()
        : (data.clarityCheckedAt ?? null),
  };
}

/**
 * Writes only the feedback document. Session/workspace/insights counters
 * should be updated separately (e.g. in a background task).
 */
export async function createFeedbackMinimal(
  params: CreateFeedbackMinimalData
): Promise<DocumentReference> {
  const { workspaceId, sessionId, userId, data } = params;
  const payload = buildPayload(workspaceId, sessionId, userId, data);
  const docRef = await addDoc(collection(db, "feedback"), payload);
  return docRef;
}
