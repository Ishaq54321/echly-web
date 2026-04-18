import "server-only";

/**
 * Server-side copy of `lib/activity/groupEvents.ts` grouping rules (Phase 1).
 * Keep in sync with the client implementation until grouping becomes a single shared module.
 */

export type ActivityEvent = {
  id: string;
  eventType: string;
  workspaceId: string;
  sessionId: string;
  feedbackId?: string;
  commentId?: string;
  actor: { id: string; name?: string; photoURL?: string };
  metadata?: Record<string, unknown>;
  createdAt: number | null;
  groupKey?: string;
};

export type GroupedActivity =
  | {
      type: "single";
      event: ActivityEvent;
    }
  | {
      type: "group";
      groupId: string;
      eventType: string;
      actorId: string;
      actorName?: string;
      sessionId: string;
      primaryEventId: string;
      /** Server-owned count of members in the adjacency group. */
      count: number;
      /** Newest-first preview slice (typically up to 2) for list UI; full members load on expand. */
      previewEvents: ActivityEvent[];
      createdAt: number | null;
    };

/** 5 minutes; same adjacency window as the client `groupEvents` helper. */
export const ACTIVITY_GROUP_WINDOW_MS = 300_000;
const GROUP_WINDOW_MS = ACTIVITY_GROUP_WINDOW_MS;

/** Deterministic id for an adjacency group (stable across reloads for the same anchor row). */
function stableGroupId(params: {
  eventType: string;
  actorId: string;
  sessionId: string;
  primaryEventId: string;
  createdAt: number | null;
}): string {
  const bucket = Math.floor((params.createdAt ?? 0) / GROUP_WINDOW_MS);
  return `${params.eventType}_${params.actorId}_${params.sessionId}_${bucket}_${params.primaryEventId}`;
}

/**
 * Types that must never merge, even if grouping rules expand later.
 * (feedback.resolved, session.member.*, access_request.*, session lifecycle, etc.)
 */
function mustNeverGroup(eventType: string): boolean {
  if (
    eventType === "feedback.resolved" ||
    eventType === "feedback.reopened" ||
    eventType === "session.created" ||
    eventType === "session.archived"
  ) {
    return true;
  }
  if (eventType.startsWith("session.member.")) return true;
  if (eventType.startsWith("access_request.")) return true;
  if (eventType.startsWith("session.settings")) return true;
  return false;
}

function isGroupableEventType(eventType: string): boolean {
  if (mustNeverGroup(eventType)) return false;
  return eventType === "comment.added" || eventType === "feedback.created";
}

function canMergeIntoGroup(event: ActivityEvent): boolean {
  if (!isGroupableEventType(event.eventType)) return false;
  if (!event.actor?.id) return false;
  if (event.createdAt == null) return false;
  return true;
}

function toSingle(event: ActivityEvent): GroupedActivity {
  return { type: "single", event };
}

function finalizeBuffer(buffer: ActivityEvent[]): GroupedActivity | null {
  if (buffer.length === 0) return null;
  if (buffer.length === 1) return toSingle(buffer[0]!);
  const newest = buffer[0]!;
  const events = buffer.slice();
  const primaryEventId = newest.id;
  const groupId = stableGroupId({
    eventType: newest.eventType,
    actorId: newest.actor.id,
    sessionId: newest.sessionId,
    primaryEventId,
    createdAt: newest.createdAt,
  });
  return {
    type: "group",
    groupId,
    eventType: newest.eventType,
    actorId: newest.actor.id,
    actorName: newest.actor?.name ?? undefined,
    sessionId: newest.sessionId,
    primaryEventId,
    count: events.length,
    previewEvents: events.slice(0, 2),
    createdAt: newest.createdAt,
  };
}

/**
 * Groups adjacent activity events (newest-first / DESC `createdAt`) when they share
 * type, actor, session, and fall within a 5-minute window anchored on the newest
 * event in the group. Does not mutate `events` or any event object.
 */
export function groupEventsServer(events: ActivityEvent[]): GroupedActivity[] {
  const result: GroupedActivity[] = [];
  let buffer: ActivityEvent[] = [];

  const flushBuffer = () => {
    const block = finalizeBuffer(buffer);
    if (block) result.push(block);
    buffer = [];
  };

  for (const event of events) {
    if (!canMergeIntoGroup(event)) {
      flushBuffer();
      result.push(toSingle(event));
      continue;
    }

    if (buffer.length === 0) {
      buffer.push(event);
      continue;
    }

    const anchor = buffer[0]!;
    const sameCore =
      event.eventType === anchor.eventType &&
      event.actor.id === anchor.actor.id &&
      event.sessionId === anchor.sessionId;

    const anchorTime = anchor.createdAt!;
    const t = event.createdAt!;
    const withinWindow = anchorTime - t >= 0 && anchorTime - t <= GROUP_WINDOW_MS;

    if (sameCore && withinWindow) {
      buffer.push(event);
    } else {
      flushBuffer();
      buffer.push(event);
    }
  }

  flushBuffer();
  return result;
}

/**
 * Returns full member events (newest-first) for an adjacency `groupId` within the same
 * ordered input used by {@link groupEventsServer} (e.g. activity-group-members window).
 */
export function findAdjacencyGroupMembers(
  events: ActivityEvent[],
  targetGroupId: string
): ActivityEvent[] | null {
  let buffer: ActivityEvent[] = [];

  const flushBuffer = (): ActivityEvent[] | null => {
    if (buffer.length === 0) return null;
    if (buffer.length === 1) {
      buffer = [];
      return null;
    }
    const newest = buffer[0]!;
    const gid = stableGroupId({
      eventType: newest.eventType,
      actorId: newest.actor.id,
      sessionId: newest.sessionId,
      primaryEventId: newest.id,
      createdAt: newest.createdAt,
    });
    const members = buffer.slice();
    buffer = [];
    return gid === targetGroupId ? members : null;
  };

  for (const event of events) {
    if (!canMergeIntoGroup(event)) {
      const hit = flushBuffer();
      if (hit) return hit;
      continue;
    }

    if (buffer.length === 0) {
      buffer.push(event);
      continue;
    }

    const anchor = buffer[0]!;
    const sameCore =
      event.eventType === anchor.eventType &&
      event.actor.id === anchor.actor.id &&
      event.sessionId === anchor.sessionId;

    const anchorTime = anchor.createdAt!;
    const t = event.createdAt!;
    const withinWindow = anchorTime - t >= 0 && anchorTime - t <= GROUP_WINDOW_MS;

    if (sameCore && withinWindow) {
      buffer.push(event);
    } else {
      const hit = flushBuffer();
      if (hit) return hit;
      buffer.push(event);
    }
  }

  return flushBuffer();
}
