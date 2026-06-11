import type { ConsoleLogEntry, ExceptionEntry } from "@/lib/domain/feedback";

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

  // Console-log capture (Phase 4). Pass through when present; omit entirely
  // when the snapshot was null or counts are zero so the persisted doc stays
  // clean of empty arrays. The server route still validates these fields
  // independently — this layer just forwards.
  const consoleLogs: ConsoleLogEntry[] | undefined =
    Array.isArray(ticket?.consoleLogs) && ticket.consoleLogs.length > 0
      ? ticket.consoleLogs
      : undefined;
  const exceptions: ExceptionEntry[] | undefined =
    Array.isArray(ticket?.exceptions) && ticket.exceptions.length > 0
      ? ticket.exceptions
      : undefined;
  const consoleLogCount =
    typeof ticket?.consoleLogCount === "number" && ticket.consoleLogCount > 0
      ? ticket.consoleLogCount
      : undefined;
  const exceptionCount =
    typeof ticket?.exceptionCount === "number" && ticket.exceptionCount > 0
      ? ticket.exceptionCount
      : undefined;
  const errorCount =
    typeof ticket?.errorCount === "number" && ticket.errorCount > 0
      ? ticket.errorCount
      : undefined;
  const warningCount =
    typeof ticket?.warningCount === "number" && ticket.warningCount > 0
      ? ticket.warningCount
      : undefined;

  // Network-capture passthrough (Phase N3). The canonical entry shape lives in
  // annote-extension/src/network/types.ts (Phase N4 moves it to lib/domain).
  // We carry it as unknown[] here — server-side validation is the source of
  // truth for the persisted doc.
  const networkRequests: unknown[] | undefined =
    Array.isArray(ticket?.networkRequests) && ticket.networkRequests.length > 0
      ? ticket.networkRequests
      : undefined;
  const networkRequestCount =
    typeof ticket?.networkRequestCount === "number" && ticket.networkRequestCount > 0
      ? ticket.networkRequestCount
      : undefined;
  const networkErrorCount =
    typeof ticket?.networkErrorCount === "number" && ticket.networkErrorCount > 0
      ? ticket.networkErrorCount
      : undefined;

  // Phase A4: user-actions passthrough. Same contract as console/network —
  // the canonical entry shape lives in annote-extension/src/actions/types.ts
  // (mirrored on the domain side as UserAction in lib/domain/feedback.ts).
  // Server-side validation is the source of truth for the persisted doc.
  const userActions: unknown[] | undefined =
    Array.isArray(ticket?.userActions) && ticket.userActions.length > 0
      ? ticket.userActions
      : undefined;
  const userActionCount =
    typeof ticket?.userActionCount === "number" && ticket.userActionCount > 0
      ? ticket.userActionCount
      : undefined;

  // Element identity passthrough. Compact identity of the element the recorder
  // selected (tag/semanticIdentifier/semanticType/computedStyles/modalContext).
  // Same contract as console/network/actions — keep string sub-fields only,
  // omit the block entirely when nothing survives; the server route's
  // validation (caps + whitelist) is the source of truth for the persisted doc.
  const elementSource =
    ticket?.element && typeof ticket.element === "object" && !Array.isArray(ticket.element)
      ? (ticket.element as Record<string, unknown>)
      : undefined;
  const elementFields: Record<string, string> = {};
  if (elementSource) {
    for (const key of [
      "tag",
      "semanticIdentifier",
      "semanticType",
      "computedStyles",
      "modalContext",
    ] as const) {
      const value = elementSource[key];
      if (typeof value === "string" && value.length > 0) elementFields[key] = value;
    }
  }
  const element: Record<string, string> | undefined =
    Object.keys(elementFields).length > 0 ? elementFields : undefined;

  return {
    sessionId,
    feedbackId,
    title: ticket.title ?? "",
    description: typeof ticket.description === "string" ? ticket.description : "",
    type: Array.isArray(ticket.tags) && ticket.tags[0] ? ticket.tags[0] : "feedback",
    tags: Array.isArray(ticket.tags) ? ticket.tags : [],
    pageArea: typeof ticket.pageArea === "string" ? ticket.pageArea : undefined,
    screenshotId,
    status,
    screenWidth: typeof ticket.screenWidth === "number" ? ticket.screenWidth : undefined,
    screenHeight: typeof ticket.screenHeight === "number" ? ticket.screenHeight : undefined,
    devicePixelRatio:
      typeof ticket.devicePixelRatio === "number" ? ticket.devicePixelRatio : undefined,
    // Capture-window honesty stamp (set by the background file-time merge when a
    // prior ticket's watermark cut this ticket's streams). Server validates.
    captureWindowStartAt:
      typeof ticket.captureWindowStartAt === "number"
        ? ticket.captureWindowStartAt
        : undefined,
    metadata: {
      clientTimestamp: Date.now(),
      url: typeof ticket.url === "string" ? ticket.url : undefined,
      viewportWidth:
        typeof ticket.viewportWidth === "number" ? ticket.viewportWidth : undefined,
      viewportHeight:
        typeof ticket.viewportHeight === "number" ? ticket.viewportHeight : undefined,
      userAgent: typeof ticket.userAgent === "string" ? ticket.userAgent : undefined,
    },
    consoleLogs,
    exceptions,
    consoleLogCount,
    exceptionCount,
    errorCount,
    warningCount,
    networkRequests,
    networkRequestCount,
    networkErrorCount,
    userActions,
    userActionCount,
    element,
  };
}
