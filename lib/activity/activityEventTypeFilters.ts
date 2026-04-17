/**
 * Single source of truth for Activity feed “type” filters (API + UI).
 * Resolved = both closed and reopened feedback activity rows.
 */

export const ACTIVITY_FILTER_CATEGORY_IDS = ["comments", "created", "resolved"] as const;
export type ActivityFilterCategoryId = (typeof ACTIVITY_FILTER_CATEGORY_IDS)[number];

/** Maps each UI category to Firestore `eventType` values. */
export const ACTIVITY_FILTER_CATEGORY_TO_EVENT_TYPES: Record<
  ActivityFilterCategoryId,
  readonly string[]
> = {
  comments: ["comment.added"],
  created: ["feedback.created"],
  resolved: ["feedback.resolved", "feedback.reopened"],
};

export const ACTIVITY_FILTER_CATEGORY_LABELS: Record<ActivityFilterCategoryId, string> = {
  comments: "Comments",
  created: "Created",
  resolved: "Resolved",
};

/** Values accepted on `GET /api/activity-feed?eventTypes=`. */
export const ALLOWED_ACTIVITY_FEED_EVENT_TYPES = [
  "comment.added",
  "feedback.created",
  "feedback.resolved",
  "feedback.reopened",
] as const;

export type AllowedActivityFeedEventType = (typeof ALLOWED_ACTIVITY_FEED_EVENT_TYPES)[number];

const ALLOWED_SET = new Set<string>(ALLOWED_ACTIVITY_FEED_EVENT_TYPES);

/** Parsed list length cap (allowed domain has at most 4 distinct types). */
export const ACTIVITY_FEED_EVENT_TYPES_QUERY_MAX = 5;

export function categoriesToEventTypesForApi(categories: ActivityFilterCategoryId[]): string[] {
  const s = new Set<string>();
  for (const c of categories) {
    for (const t of ACTIVITY_FILTER_CATEGORY_TO_EVENT_TYPES[c]) {
      s.add(t);
    }
  }
  return Array.from(s).sort();
}

/**
 * Parses `eventTypes` query: comma-separated, allowlisted, deduped, max length enforced.
 * Extra tokens or unknown values are dropped; if token count exceeds max, returns [] (ignore filter).
 */
export function parseActivityFeedEventTypesParam(raw: string | null | undefined): string[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  const parts = raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length > ACTIVITY_FEED_EVENT_TYPES_QUERY_MAX) return [];
  const out: string[] = [];
  for (const p of parts) {
    if (!ALLOWED_SET.has(p) || out.includes(p)) continue;
    out.push(p);
  }
  return out.sort();
}
