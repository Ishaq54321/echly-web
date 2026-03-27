import { getTicketStatus, type Feedback } from "@/lib/domain/feedback";
import { normalizeTicketStatus } from "@/lib/domain/normalizeTicketStatus";

/** Make Firestore Timestamp JSON-serializable for API response (same shape as GET /api/tickets/:id). */
export function serializeTicket(ticket: Feedback): Record<string, unknown> {
  const out = { ...ticket } as Record<string, unknown>;
  const rawStatus = typeof ticket.status === "string" ? ticket.status : getTicketStatus(ticket);
  out.status = normalizeTicketStatus(rawStatus);
  const createdAt = ticket.createdAt as { toDate?: () => Date } | null;
  out.createdAt = createdAt != null && typeof createdAt.toDate === "function" ? createdAt.toDate().toISOString() : null;
  return out;
}
