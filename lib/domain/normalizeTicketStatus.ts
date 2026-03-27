export function normalizeTicketStatus(
  rawStatus: string | null | undefined
): "open" | "resolved" {
  if (!rawStatus || rawStatus === "open" || rawStatus === "processing") return "open";
  if (rawStatus === "resolved") return "resolved";
  return "open";
}
