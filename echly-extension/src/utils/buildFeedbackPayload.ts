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
  const rawStatus = typeof ticket?.status === "string" ? ticket.status.trim().toLowerCase() : "";
  const status = rawStatus === "resolved" ? "resolved" : "open";
  return {
    sessionId,
    feedbackId,
    title: ticket.title ?? "",
    instruction: ticket.instruction ?? ticket.description ?? "",
    description: "",
    type:
      Array.isArray(ticket.suggestedTags) && ticket.suggestedTags[0]
        ? ticket.suggestedTags[0]
        : "Feedback",
    contextSummary: "",
    actionSteps: Array.isArray(ticket.actionSteps)
      ? ticket.actionSteps
      : [],
    suggestedTags: ticket.suggestedTags,
    screenshotId,
    status,
    screenshotUrl: null,
    metadata: {
      clientTimestamp: Date.now(),
    },
  };
}
