/**
 * Display-only status and priority for the issue queue.
 * Backend can later persist these; for now we derive from existing fields.
 */

export type FeedbackStatus = "Open" | "In Progress" | "Blocked" | "Resolved";

export type FeedbackPriority = "Low" | "Medium" | "High" | "Critical";

export function statusFromResolved(isResolved?: boolean): FeedbackStatus {
  return isResolved ? "Resolved" : "Open";
}

export function defaultPriority(): FeedbackPriority {
  return "Medium";
}
