/**
 * Shared utility for formatting comment/ticket dates.
 * Accepts Firestore timestamp, { seconds: number }, string, or null/undefined.
 */

export interface FormatCommentDateOptions {
  /** Fallback when value is null/undefined or invalid. Default: "Just now" */
  fallback?: string;
  /** Include time (hour, minute). Default: true for comment-style. */
  includeTime?: boolean;
  /** Include year. Default: false. When true and includeTime is false, uses date-only format. */
  includeYear?: boolean;
}

/**
 * Formats a date value for display.
 * Handles Firestore Timestamp, { seconds: number }, ISO string, or null/undefined.
 */
export function formatCommentDate(
  value:
    | { seconds: number }
    | { toDate: () => Date }
    | string
    | null
    | undefined,
  options?: FormatCommentDateOptions
): string {
  const fallback = options?.fallback ?? "Just now";
  if (value == null) return fallback;

  let d: Date;
  if (typeof value === "string") {
    d = new Date(value);
  } else if (
    typeof value === "object" &&
    "seconds" in value &&
    typeof (value as { seconds: number }).seconds === "number"
  ) {
    d = new Date((value as { seconds: number }).seconds * 1000);
  } else if (
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    d = (value as { toDate: () => Date }).toDate();
  } else {
    return fallback;
  }

  if (Number.isNaN(d.getTime())) return fallback;

  if (options?.includeYear && options?.includeTime !== true) {
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  if (options?.includeTime !== false) {
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
