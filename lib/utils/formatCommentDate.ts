import { isToday, isYesterday, format } from "date-fns";

export function formatCommentDate(
  date: Date | string | number | { seconds: number; nanoseconds?: number } | null | undefined
): string {
  if (!date) return "";
  let d: Date;
  if (typeof date === "object" && "seconds" in date) {
    d = new Date((date as { seconds: number }).seconds * 1000);
  } else {
    d = new Date(date as string | number);
  }
  if (isNaN(d.getTime())) return "";

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  if (isYesterday(d)) return "Yesterday";
  if (isToday(d)) return "Today";
  return format(d, "MMM d");
}
