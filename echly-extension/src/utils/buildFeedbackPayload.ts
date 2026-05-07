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
    pageArea: typeof ticket.pageArea === "string" ? ticket.pageArea : undefined,
    screenshotId,
    status,
    screenWidth: typeof ticket.screenWidth === "number" ? ticket.screenWidth : undefined,
    screenHeight: typeof ticket.screenHeight === "number" ? ticket.screenHeight : undefined,
    devicePixelRatio:
      typeof ticket.devicePixelRatio === "number" ? ticket.devicePixelRatio : undefined,
    metadata: {
      clientTimestamp: Date.now(),
      url: typeof ticket.url === "string" ? ticket.url : undefined,
      viewportWidth:
        typeof ticket.viewportWidth === "number" ? ticket.viewportWidth : undefined,
      viewportHeight:
        typeof ticket.viewportHeight === "number" ? ticket.viewportHeight : undefined,
      userAgent: typeof ticket.userAgent === "string" ? ticket.userAgent : undefined,
    },
  };
}
