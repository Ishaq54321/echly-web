import type {
  NotificationRow,
  NotificationType,
} from "@/lib/domain/notification";

/**
 * PURE digest grouping (no Firestore, no I/O) — unit-testable in isolation.
 *
 * Input: one user's un-digested notifications (NotificationRow[], millis-based).
 * Output: a view-model the activity-digest template renders into one email,
 * sectioned per session, with per-event-type summary lines.
 *
 * Determinism: ordering and summary strings are a pure function of the input,
 * so the same notifications always produce the same email and the same subject.
 */

/** Coarse buckets we summarize per session. Maps the fine-grained
 * NotificationType set onto the handful of lines a human wants to read. */
export type DigestBucket =
  | "comments"
  | "mentions"
  | "resolved"
  | "reopened"
  | "newTickets"
  | "assigned"
  | "shared"
  | "opened"
  | "access"
  | "other";

/** Stable display order for buckets within a session section. */
const BUCKET_ORDER: DigestBucket[] = [
  "mentions",
  "assigned",
  "newTickets",
  "comments",
  "resolved",
  "reopened",
  "shared",
  "opened",
  "access",
  "other",
];

function bucketForType(type: NotificationType | string): DigestBucket {
  switch (type) {
    case "comment.added":
    case "comment.reply":
      return "comments";
    case "comment.mention":
    case "description.mention":
      return "mentions";
    case "feedback.resolved":
      return "resolved";
    case "feedback.reopened":
      return "reopened";
    case "feedback.created":
      return "newTickets";
    case "ticket.assigned":
      return "assigned";
    case "session.shared":
      return "shared";
    case "session.opened":
      return "opened";
    case "access_request.pending":
    case "access_request.approved":
    case "access_request.rejected":
    case "invite.accepted":
    case "invite.sent":
      return "access";
    default:
      return "other";
  }
}

/** A representative ticket/comment within a bucket, used for "links where
 * available". Deduped by feedbackId so we don't list the same ticket twice. */
export interface DigestItem {
  feedbackId: string | null;
  /** Ticket title (entityTitle) or a generic fallback. */
  title: string;
}

export interface DigestBucketSummary {
  bucket: DigestBucket;
  count: number;
  /** Distinct actor display names contributing to this bucket (deduped). */
  actorNames: string[];
  /** Human one-liner, e.g. "12 new comments from 4 people". */
  summary: string;
  /** A few representative items (capped) for optional per-ticket links. */
  items: DigestItem[];
}

export interface DigestSessionSection {
  sessionId: string;
  sessionTitle: string;
  /** Total notifications in this session section (sum of bucket counts). */
  total: number;
  /** Most-recent notification createdAt in this section (for ordering/labels). */
  latestAt: number;
  buckets: DigestBucketSummary[];
}

export interface DigestViewModel {
  /** Total notifications represented across all sections. */
  totalCount: number;
  sessionCount: number;
  sections: DigestSessionSection[];
  /** Distinct actors across the whole digest (deduped display names). */
  actorNames: string[];
  /** Top-line subject line for the email. */
  subject: string;
  /** One-line summary used as the email's preheader + greeting lead. */
  summaryLine: string;
  /** When the loaded set was capped (user had > MAX); render a "+N more" note. */
  truncated: boolean;
}

/** Max representative items kept per bucket (the rest are implied by count). */
const MAX_ITEMS_PER_BUCKET = 3;

function pluralize(n: number, singular: string, plural?: string): string {
  return n === 1 ? singular : plural ?? `${singular}s`;
}

/** "from 4 people" / "from Maya" / "" — deduped, with a friendly small-count
 * rendering and a numeric fallback for larger actor sets. */
function actorPhrase(actorNames: string[]): string {
  const n = actorNames.length;
  if (n === 0) return "";
  if (n === 1) return ` from ${actorNames[0]}`;
  if (n === 2) return ` from ${actorNames[0]} and ${actorNames[1]}`;
  return ` from ${n} people`;
}

function bucketSummaryText(
  bucket: DigestBucket,
  count: number,
  actorNames: string[]
): string {
  const who = actorPhrase(actorNames);
  switch (bucket) {
    case "comments":
      return `${count} new ${pluralize(count, "comment")}${who}`;
    case "mentions":
      return `${count} ${pluralize(count, "mention")}${who}`;
    case "resolved":
      return `${count} ${pluralize(count, "ticket")} resolved${who}`;
    case "reopened":
      return `${count} ${pluralize(count, "ticket")} reopened${who}`;
    case "newTickets":
      return `${count} new ${pluralize(count, "ticket")}${who}`;
    case "assigned":
      return `${count} ${pluralize(count, "assignment")}${who}`;
    case "shared":
      return `${count} ${pluralize(count, "session")} shared${who}`;
    case "opened":
      return `${count} ${pluralize(count, "view", "views")}${who}`;
    case "access":
      return `${count} access ${pluralize(count, "update")}${who}`;
    default:
      return `${count} ${pluralize(count, "update")}${who}`;
  }
}

/** Resolve a stable, non-empty actor display name. */
function actorName(n: NotificationRow): string {
  const name = n.actor?.name;
  return typeof name === "string" && name.trim() ? name.trim() : "Someone";
}

/** Resolve a session title with a stable fallback. */
function sessionTitleOf(rows: NotificationRow[]): string {
  for (const r of rows) {
    if (typeof r.sessionTitle === "string" && r.sessionTitle.trim()) {
      return r.sessionTitle.trim();
    }
  }
  return "a session";
}

interface BucketAccumulator {
  count: number;
  actorOrder: string[];
  actorSet: Set<string>;
  items: DigestItem[];
  itemFeedbackIds: Set<string>;
}

/**
 * Build the digest view-model from a user's un-digested notifications.
 *
 * Ordering (documented, deterministic):
 *   - Sessions: most-active first (higher total), tie-broken by most-recent
 *     activity (latestAt desc), then sessionId asc for full determinism.
 *   - Buckets within a session: fixed BUCKET_ORDER (mentions/assignments first
 *     — the action-required items — then new tickets, comments, resolves, …).
 *   - Actor names within a bucket: first-seen order (stable across identical
 *     input), deduped.
 *
 * `truncated` is threaded in from the repository (the per-user fetch caps at
 * MAX_NOTIFICATIONS_PER_USER); when true the template renders a "+N more" note.
 */
export function buildDigestViewModel(
  notifications: NotificationRow[],
  options?: { truncated?: boolean }
): DigestViewModel | null {
  if (!notifications || notifications.length === 0) return null;

  // Group rows by sessionId.
  const bySession = new Map<string, NotificationRow[]>();
  for (const n of notifications) {
    const sid = typeof n.sessionId === "string" ? n.sessionId : "";
    const key = sid || "__no_session__";
    const arr = bySession.get(key);
    if (arr) arr.push(n);
    else bySession.set(key, [n]);
  }

  const globalActorOrder: string[] = [];
  const globalActorSet = new Set<string>();

  const sections: DigestSessionSection[] = [];
  for (const [sid, rows] of bySession) {
    const buckets = new Map<DigestBucket, BucketAccumulator>();
    let latestAt = 0;

    for (const n of rows) {
      const bucket = bucketForType(n.type);
      let acc = buckets.get(bucket);
      if (!acc) {
        acc = {
          count: 0,
          actorOrder: [],
          actorSet: new Set<string>(),
          items: [],
          itemFeedbackIds: new Set<string>(),
        };
        buckets.set(bucket, acc);
      }
      acc.count++;

      const an = actorName(n);
      if (!acc.actorSet.has(an)) {
        acc.actorSet.add(an);
        acc.actorOrder.push(an);
      }
      if (!globalActorSet.has(an)) {
        globalActorSet.add(an);
        globalActorOrder.push(an);
      }

      const fid = typeof n.feedbackId === "string" ? n.feedbackId : null;
      const itemKey = fid ?? `__title__${n.entityTitle ?? n.title}`;
      if (
        acc.items.length < MAX_ITEMS_PER_BUCKET &&
        !acc.itemFeedbackIds.has(itemKey)
      ) {
        acc.itemFeedbackIds.add(itemKey);
        const title =
          (typeof n.entityTitle === "string" && n.entityTitle.trim()) ||
          (typeof n.title === "string" && n.title.trim()) ||
          "a ticket";
        acc.items.push({ feedbackId: fid, title });
      }

      const at = typeof n.createdAt === "number" ? n.createdAt : 0;
      if (at > latestAt) latestAt = at;
    }

    const bucketSummaries: DigestBucketSummary[] = BUCKET_ORDER.filter((b) =>
      buckets.has(b)
    ).map((b) => {
      const acc = buckets.get(b)!;
      return {
        bucket: b,
        count: acc.count,
        actorNames: acc.actorOrder,
        summary: bucketSummaryText(b, acc.count, acc.actorOrder),
        items: acc.items,
      };
    });

    const total = bucketSummaries.reduce((s, b) => s + b.count, 0);

    sections.push({
      sessionId: sid === "__no_session__" ? "" : sid,
      sessionTitle: sessionTitleOf(rows),
      total,
      latestAt,
      buckets: bucketSummaries,
    });
  }

  // Deterministic session ordering: most-active, then most-recent, then id.
  sections.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    if (b.latestAt !== a.latestAt) return b.latestAt - a.latestAt;
    return a.sessionId < b.sessionId ? -1 : a.sessionId > b.sessionId ? 1 : 0;
  });

  const totalCount = sections.reduce((s, sec) => s + sec.total, 0);
  const sessionCount = sections.length;

  const subject = buildDigestSubject({
    totalCount,
    sessionCount,
    sessionTitle: sections[0]?.sessionTitle ?? "a session",
  });

  const summaryLine = buildSummaryLine(totalCount, sessionCount);

  return {
    totalCount,
    sessionCount,
    sections,
    actorNames: globalActorOrder,
    subject,
    summaryLine,
    truncated: options?.truncated === true,
  };
}

/**
 * Subject line generation (pure, exported for unit testing).
 *
 * Single-session  → "Annote: 12 updates in {sessionTitle}"
 * Multi-session   → "Annote: 18 updates across 3 sessions"
 * Singular counts → "1 update", "1 session" handled.
 */
export function buildDigestSubject(args: {
  totalCount: number;
  sessionCount: number;
  sessionTitle: string;
}): string {
  const { totalCount, sessionCount, sessionTitle } = args;
  const updates = `${totalCount} ${pluralize(totalCount, "update")}`;
  if (sessionCount <= 1) {
    return `Annote: ${updates} in ${sessionTitle}`;
  }
  return `Annote: ${updates} across ${sessionCount} ${pluralize(
    sessionCount,
    "session"
  )}`;
}

function buildSummaryLine(totalCount: number, sessionCount: number): string {
  const updates = `${totalCount} ${pluralize(totalCount, "update")}`;
  if (sessionCount <= 1) {
    return `You have ${updates} waiting for you.`;
  }
  return `You have ${updates} across ${sessionCount} ${pluralize(
    sessionCount,
    "session"
  )}.`;
}
