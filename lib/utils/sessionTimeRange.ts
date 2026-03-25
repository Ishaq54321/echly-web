import type { Session } from "@/lib/domain/session";

export const DEFAULT_FILTER = "all_time" as const;

export type SessionsTimeRange =
  | "this_week"
  | "this_month"
  | "this_year"
  | "last_year"
  | "all_time";

export const FILTER_LABELS: Record<SessionsTimeRange, string> = {
  this_week: "This week",
  this_month: "This month",
  this_year: "This year",
  last_year: "Last year",
  all_time: "All time",
};

export const FILTER_OPTIONS_ORDER: readonly SessionsTimeRange[] = [
  "this_week",
  "this_month",
  "this_year",
  "last_year",
  "all_time",
];

function timestampFieldToMs(u: unknown): number {
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

/** Prefer `updatedAt`, fall back to `createdAt` (Firestore / API shapes). */
export function getSessionFilterDateMs(session: Session): number {
  const fromUpdated = timestampFieldToMs(session.updatedAt as unknown);
  if (fromUpdated > 0) return fromUpdated;
  return timestampFieldToMs(session.createdAt as unknown);
}

export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getStartOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function getStartOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1);
}

export function getStartOfLastYear(date: Date): Date {
  return new Date(date.getFullYear() - 1, 0, 1);
}

export function getEndOfLastYear(date: Date): Date {
  return new Date(date.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
}

export function sessionPassesTimeRange(
  session: Session,
  range: SessionsTimeRange,
  now: Date = new Date()
): boolean {
  if (range === "all_time") return true;

  const t = getSessionFilterDateMs(session);
  if (t <= 0) return true;

  const itemDate = new Date(t);

  switch (range) {
    case "this_week":
      return itemDate >= getStartOfWeek(now);
    case "this_month":
      return itemDate >= getStartOfMonth(now);
    case "this_year":
      return itemDate >= getStartOfYear(now);
    case "last_year":
      return (
        itemDate >= getStartOfLastYear(now) &&
        itemDate <= getEndOfLastYear(now)
      );
    default:
      return true;
  }
}
