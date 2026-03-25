import type { Session } from "@/lib/domain/session";

export type SessionsTimeRange = "month" | "3m" | "6m" | "year" | "all";

export function getSessionUpdatedMs(session: Session): number {
  const u = session.updatedAt as unknown;
  if (u == null) return 0;
  if (typeof u === "object" && u !== null && "seconds" in u) {
    const s = (u as { seconds: number }).seconds;
    return typeof s === "number" ? s * 1000 : 0;
  }
  if (typeof u === "string") {
    const t = new Date(u).getTime();
    return Number.isNaN(t) ? 0 : t;
  }
  if (u instanceof Date) return u.getTime();
  return 0;
}

export function sessionPassesTimeRange(
  session: Session,
  range: SessionsTimeRange
): boolean {
  if (range === "all") return true;
  const t = getSessionUpdatedMs(session);
  if (t <= 0) return true;

  const now = Date.now();

  if (range === "month") {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return t >= start.getTime();
  }

  const ms =
    range === "3m"
      ? 90 * 86400000
      : range === "6m"
        ? 180 * 86400000
        : 365 * 86400000;
  return t >= now - ms;
}
