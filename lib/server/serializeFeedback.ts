import type { Feedback } from "@/lib/domain/feedback";

/** Make Firestore Timestamp JSON-serializable for API response (same shape as GET /api/tickets/:id). */
export function serializeTicket(ticket: Feedback): Record<string, unknown> {
  const out = { ...ticket } as Record<string, unknown>;
  const createdAt = ticket.createdAt as { toDate?: () => Date } | null;
  if (createdAt != null && typeof createdAt.toDate === "function") {
    out.createdAt = createdAt.toDate().toISOString();
  }
  return out;
}
