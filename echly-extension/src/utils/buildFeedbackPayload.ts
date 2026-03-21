export function buildFeedbackPayload({
  sessionId,
  feedbackId,
  ticket,
  screenshotId,
}: {
  sessionId: string;
  feedbackId: string;
  ticket: any;
  screenshotId?: string;
}) {
  const desc =
    typeof ticket.description === "string"
      ? ticket.description
      : ticket.title ?? "";

  return {
    sessionId,
    feedbackId,
    title: ticket.title ?? "",
    description: desc,
    type:
      Array.isArray(ticket.suggestedTags) && ticket.suggestedTags[0]
        ? ticket.suggestedTags[0]
        : "Feedback",
    contextSummary: desc,
    actionSteps: Array.isArray(ticket.actionSteps)
      ? ticket.actionSteps
      : [],
    suggestedTags: ticket.suggestedTags,
    screenshotId,
    screenshotUrl: null,
    metadata: {
      clientTimestamp: Date.now(),
    },
  };
}
