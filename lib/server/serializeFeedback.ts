import type { AccessContext } from "@/lib/access/resolveAccess";
import { getTicketStatus, type Feedback } from "@/lib/domain/feedback";
import { normalizeTicketStatus } from "@/lib/domain/normalizeTicketStatus";

function timestampToIso(value: Feedback["createdAt"]): string | null {
  if (value == null) return null;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  const v = value as { toMillis?: () => number; toDate?: () => Date };
  if (typeof v.toMillis === "function") {
    return new Date(v.toMillis()).toISOString();
  }
  if (typeof v.toDate === "function") {
    return v.toDate().toISOString();
  }
  return null;
}

function lastCommentAtToApiShape(value: Feedback["lastCommentAt"]): { seconds: number } | null {
  if (value == null || value === undefined) return null;
  const v = value as { toDate?: () => Date; seconds?: number };
  if (typeof v.toDate === "function") {
    return { seconds: Math.floor(v.toDate().getTime() / 1000) };
  }
  if (typeof v.seconds === "number") {
    return { seconds: v.seconds };
  }
  return null;
}

/** Same {@link Timestamp}→{ seconds } shape as {@link lastCommentAtToApiShape}; used for aiGeneratedAt. */
function timestampToApiShape(value: Feedback["aiGeneratedAt"]): { seconds: number } | null {
  return lastCommentAtToApiShape(value as Feedback["lastCommentAt"]);
}

function normalizedStatus(ticket: Feedback) {
  const raw =
    typeof ticket.status === "string" ? ticket.status : getTicketStatus(ticket);
  return normalizeTicketStatus(raw);
}

/**
 * Single JSON contract for ticket/feedback rows: list, detail, overview, search, and public share.
 * Keys are stable; workspace/user/metadata fields are nulled when !access.capabilities.canResolve.
 */
export function serializeTicket(ticket: Feedback, access: AccessContext): Record<string, unknown> {
  const ns = normalizedStatus(ticket);
  const can = access.capabilities.canResolve;

  return {
    id: ticket.id,
    sessionId: ticket.sessionId,
    workspaceId: can ? (ticket.workspaceId ?? null) : null,
    userId: can ? (ticket.userId ?? null) : null,
    title: ticket.title,
    description: ticket.description ?? null,
    type: ticket.type,
    tags: ticket.tags ?? null,
    pageArea: ticket.pageArea ?? null,
    url: can ? (ticket.url ?? null) : null,
    viewportWidth: can ? (ticket.viewportWidth ?? null) : null,
    viewportHeight: can ? (ticket.viewportHeight ?? null) : null,
    userAgent: can ? (ticket.userAgent ?? null) : null,
    clientTimestamp: can ? (ticket.clientTimestamp ?? null) : null,
    screenWidth: can ? (ticket.screenWidth ?? null) : null,
    screenHeight: can ? (ticket.screenHeight ?? null) : null,
    devicePixelRatio: can ? (ticket.devicePixelRatio ?? null) : null,
    status: ns,
    isResolved: ns === "resolved",
    createdAt: timestampToIso(ticket.createdAt),
    lastCommentAt: lastCommentAtToApiShape(ticket.lastCommentAt),
    commentCount: typeof ticket.commentCount === "number" ? ticket.commentCount : 0,
    lastCommentPreview: ticket.lastCommentPreview ?? null,
    screenshotId: ticket.screenshotId ?? null,
    screenshotStatus: ticket.screenshotStatus ?? null,
    isDeleted: ticket.isDeleted ?? false,
    assigneeId: ticket.assigneeId ?? null,
    assigneeName: ticket.assigneeName ?? null,
    assigneeAvatarUrl: ticket.assigneeAvatarUrl ?? null,
    priority: ticket.priority ?? null,
    creatorName: ticket.creatorName ?? null,
    creatorAvatarUrl: ticket.creatorAvatarUrl ?? null,
    // Phase 4: console-log capture. No access gating — entries are redacted
    // at the extension's capture site before storage, so they're safe to
    // surface to anyone with read access on the ticket. Omit when absent so
    // the API contract stays clean for tickets filed without any console
    // activity (rather than always emitting empty arrays / zero counts).
    ...(ticket.consoleLogs ? { consoleLogs: ticket.consoleLogs } : {}),
    ...(ticket.exceptions ? { exceptions: ticket.exceptions } : {}),
    ...(typeof ticket.consoleLogCount === "number"
      ? { consoleLogCount: ticket.consoleLogCount }
      : {}),
    ...(typeof ticket.exceptionCount === "number"
      ? { exceptionCount: ticket.exceptionCount }
      : {}),
    ...(typeof ticket.errorCount === "number" ? { errorCount: ticket.errorCount } : {}),
    ...(typeof ticket.warningCount === "number" ? { warningCount: ticket.warningCount } : {}),
    // Phase N4: network-request capture. Mirror console: redacted at capture
    // time, safe for all viewers with read access, omit when absent.
    ...(ticket.networkRequests ? { networkRequests: ticket.networkRequests } : {}),
    ...(typeof ticket.networkRequestCount === "number"
      ? { networkRequestCount: ticket.networkRequestCount }
      : {}),
    ...(typeof ticket.networkErrorCount === "number"
      ? { networkErrorCount: ticket.networkErrorCount }
      : {}),
    // Phase A4: user-actions capture. Mirror console/network: redacted at
    // capture time, safe for all viewers with read access, omit when absent.
    ...(ticket.userActions ? { userActions: ticket.userActions } : {}),
    ...(typeof ticket.userActionCount === "number"
      ? { userActionCount: ticket.userActionCount }
      : {}),
    // AI Analysis: read-only second opinion derived from the (already-redacted)
    // capture data + description. Not access-gated for the same reason as the
    // capture fields — safe for any viewer with read access. Omit when absent so
    // tickets that haven't been analyzed yet stay clean of null fields. This is
    // the path that carries the analysis into the session-page bundle (which
    // reuses serializeFeedback → serializeTicket).
    ...(ticket.aiSummary != null ? { aiSummary: ticket.aiSummary } : {}),
    ...(ticket.aiFixSuggestion != null
      ? { aiFixSuggestion: ticket.aiFixSuggestion }
      : {}),
    ...(typeof ticket.aiConfidence === "number"
      ? { aiConfidence: ticket.aiConfidence }
      : {}),
    ...(ticket.aiAnalysisStatus != null
      ? { aiAnalysisStatus: ticket.aiAnalysisStatus }
      : {}),
    ...(ticket.aiGeneratedAt != null
      ? { aiGeneratedAt: timestampToApiShape(ticket.aiGeneratedAt) }
      : {}),
  };
}

/** Same contract as {@link serializeTicket} (feedback documents are tickets). */
export function serializeFeedback(feedback: Feedback, access: AccessContext): Record<string, unknown> {
  return serializeTicket(feedback, access);
}
