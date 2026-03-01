import type { Timestamp } from "firebase/firestore";

/**
 * Converts Date or Firestore Timestamp to a JavaScript Date.
 */
function toDate(value: Date | Timestamp | null | undefined): Date | null {
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
  if (!d) return "—";

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
