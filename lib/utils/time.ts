import type { Timestamp } from "firebase/firestore";

function toDate(value: Date | Timestamp | null | undefined): Date | null {
  if (value == null) return null;
  if (value instanceof Date) return value;
  const t = value as { toDate?: () => Date; seconds?: number };
  if (typeof t.toDate === "function") return t.toDate();
  if (typeof t.seconds === "number") return new Date(t.seconds * 1000);
  return null;
}

/**
 * Formats a date as relative time (e.g. "3 minutes ago", "7 days ago").
 * Uses session.updatedAt for "last activity" display.
 * Rules:
 * - < 1 min → "Just now"
 * - < 60 min → "X minutes ago"
 * - < 24h → "X hours ago"
 * - < 30 days → "X days ago"
 * - < 12 months → "X months ago"
 * - else → "X years ago"
 */
export function formatRelativeTime(
  date: Date | Timestamp | null | undefined
): string {
  const d = toDate(date);
  if (!d) return "—";

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? "" : "s"} ago`;
  if (diffDay < 30) return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
  if (diffMonth < 12) return `${diffMonth} month${diffMonth === 1 ? "" : "s"} ago`;
  return `${diffYear} year${diffYear === 1 ? "" : "s"} ago`;
}
