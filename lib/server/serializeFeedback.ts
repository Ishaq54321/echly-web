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
    instruction: ticket.instruction ?? ticket.description ?? null,
    description: ticket.description ?? null,
    suggestion: ticket.suggestion ?? null,
    type: ticket.type,
    actionSteps: ticket.actionSteps ?? null,
    suggestedTags: ticket.suggestedTags ?? null,
    contextSummary: ticket.contextSummary ?? null,
    url: can ? (ticket.url ?? null) : null,
    viewportWidth: can ? (ticket.viewportWidth ?? null) : null,
    viewportHeight: can ? (ticket.viewportHeight ?? null) : null,
    userAgent: can ? (ticket.userAgent ?? null) : null,
    clientTimestamp: can ? (ticket.clientTimestamp ?? null) : null,
    status: ns,
    isResolved: ns === "resolved",
    createdAt: timestampToIso(ticket.createdAt),
    lastCommentAt: lastCommentAtToApiShape(ticket.lastCommentAt),
    commentCount: typeof ticket.commentCount === "number" ? ticket.commentCount : 0,
    lastCommentPreview: ticket.lastCommentPreview ?? null,
    screenshotUrl: ticket.screenshotUrl ?? null,
    screenshotStatus: ticket.screenshotStatus ?? null,
    isDeleted: ticket.isDeleted ?? false,
  };
}

/** Same contract as {@link serializeTicket} (feedback documents are tickets). */
export function serializeFeedback(feedback: Feedback, access: AccessContext): Record<string, unknown> {
  return serializeTicket(feedback, access);
}
