import type { Timestamp } from "firebase/firestore";

/**
 * Converts Date or Firestore Timestamp (or TimestampLike) to a JavaScript Date.
 */
export function toDate(value: Date | Timestamp | null | undefined): Date | null {
  if (value == null) return null;
  if (value instanceof Date) return value;
  const t = value as { toDate?: () => Date; seconds?: number };
  if (typeof t.toDate === "function") return t.toDate();
  if (typeof t.seconds === "number") return new Date(t.seconds * 1000);
  return null;
}

/**
 * Formats a date for display: "Mar 1, 2026 · 1:30 AM"
 * - Short month (Jan, Feb, Mar)
 * - Day numeric, full year
 * - Dot separator (·)
 * - 12-hour time, uppercase AM/PM
 * - No leading zero on hour
 */
export function formatFullDateTime(date: Date | Timestamp | null | undefined): string {
  const d = toDate(date);
  if (!d) return "";

  const datePart = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);

  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(d)
    .replace(/\b(am|pm)\b/gi, (m) => m.toUpperCase());

  return `${datePart} · ${timePart}`;
}

/** Firestore-like timestamp (toDate() or seconds). */
export type TimestampLike =
  | { toDate?: () => Date; seconds?: number }
  | null
  | undefined;

/**
 * Format for overview/list: medium date (e.g. "Mar 1, 2026").
 */
export function formatOverviewDate(ts: TimestampLike): string {
  const date = toDate(ts as Date | Timestamp | null | undefined);
  if (!date) return "";
  return date.toLocaleDateString(undefined, { dateStyle: "medium" });
}

const sessionDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
});
const sessionTimeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

/**
 * Session created meta: date + time strings for header display.
 */
export function formatSessionCreatedMeta(
  createdAt: TimestampLike | string
): { dateStr: string; timeStr: string } {
  if (createdAt == null) return { dateStr: "", timeStr: "" };
  const date =
    typeof createdAt === "string"
      ? new Date(createdAt)
      : toDate(createdAt as Date | Timestamp | null | undefined);
  if (!date) return { dateStr: "", timeStr: "" };
  return {
    dateStr: sessionDateFormatter.format(date),
    timeStr: sessionTimeFormatter.format(date),
  };
}

/**
 * Relative time for activity (e.g. "5m ago", "Just now").
 */
export function formatActivityTime(date: Date | null): string {
  if (!date) return "";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffM = Math.floor(diffMs / 60000);
  if (diffM < 1) return "Just now";
  if (diffM < 60) return `${diffM}m ago`;
  const diffH = Math.floor(diffM / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return date.toLocaleDateString(undefined, { dateStyle: "short" });
}
