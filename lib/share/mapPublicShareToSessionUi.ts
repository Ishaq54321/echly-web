import type { Feedback } from "@/lib/domain/feedback";
import type { FeedbackItemShape } from "@/components/session/feedbackDetail/types";
import type { SanitizedPublicFeedback } from "@/lib/server/publicShareSanitize";
import { normalizeTicketStatus } from "@/lib/domain/normalizeTicketStatus";

export function mapPublicFeedbackToFeedback(
  sessionId: string,
  item: SanitizedPublicFeedback
): Feedback {
  const status = normalizeTicketStatus(item.status);
  return {
    id: item.id,
    sessionId,
    title: item.title,
    instruction: item.description,
    type: "Feedback",
    isResolved: status === "resolved",
    status,
    createdAt: null,
  };
}

export function mapSanitizedToDetailItem(
  item: SanitizedPublicFeedback,
  index: number,
  total: number
): FeedbackItemShape & { index: number; total: number } {
  const fromShot =
    typeof item.screenshotUrl === "string" && item.screenshotUrl.trim() !== ""
      ? item.screenshotUrl
      : item.attachments.find((a) => a.kind === "screenshot")?.url ?? null;
  const status = normalizeTicketStatus(item.status);
  return {
    id: item.id,
    title: item.title?.trim() ? item.title : "Untitled",
    type: "Feedback",
    isResolved: status === "resolved",
    createdAt: item.createdAt ?? undefined,
    screenshotUrl: fromShot,
    actionSteps: item.actionSteps,
    suggestedTags: item.tags,
    instruction: item.description,
    publicAttachments: item.attachments,
    index,
    total,
  };
}
