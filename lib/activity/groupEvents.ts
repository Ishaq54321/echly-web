export type ActivityEvent = {
  id: string
  eventType: string
  workspaceId: string
  sessionId: string
  feedbackId?: string
  commentId?: string
  actor: { id: string; name?: string; photoURL?: string }
  metadata?: Record<string, unknown>
  createdAt: number | null
  groupKey?: string
}

export type GroupedActivity =
  | {
      type: "single"
      event: ActivityEvent
    }
  | {
      type: "group"
      /** Stable id from server grouping (`/api/activity-feed`); must match expand fetches. */
      groupId: string
      eventType: string
      actorId: string
      actorName?: string
      sessionId: string
      primaryEventId: string
      count: number
      /** Newest-first preview slice for summary UI (aligned with server). */
      previewEvents: ActivityEvent[]
      createdAt: number | null
    }

const GROUP_WINDOW_MS = 300_000

/** Deterministic id for an adjacency group (aligned with `groupEventsServer`). */
function stableGroupId(params: {
  eventType: string
  actorId: string
  sessionId: string
  primaryEventId: string
  createdAt: number | null
}): string {
  const bucket = Math.floor((params.createdAt ?? 0) / GROUP_WINDOW_MS)
  return `${params.eventType}_${params.actorId}_${params.sessionId}_${bucket}_${params.primaryEventId}`
}

/** Preview events for grouped rows (server summary; required on group rows). */
export function groupPreviewEvents(
  g: Extract<GroupedActivity, { type: "group" }>
): ActivityEvent[] {
  return g.previewEvents
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
    return true
  }
  if (eventType.startsWith("session.member.")) return true
  if (eventType.startsWith("access_request.")) return true
  if (eventType.startsWith("session.settings")) return true
  return false
}

function isGroupableEventType(eventType: string): boolean {
  if (mustNeverGroup(eventType)) return false
  return eventType === "comment.added" || eventType === "feedback.created"
}

function canMergeIntoGroup(event: ActivityEvent): boolean {
  if (!isGroupableEventType(event.eventType)) return false
  if (!event.actor?.id) return false
  if (event.createdAt == null) return false
  return true
}

function toSingle(event: ActivityEvent): GroupedActivity {
  return { type: "single", event }
}

function finalizeBuffer(buffer: ActivityEvent[]): GroupedActivity | null {
  if (buffer.length === 0) return null
  if (buffer.length === 1) return toSingle(buffer[0]!)
  const newest = buffer[0]!
  const events = buffer.slice()
  const primaryEventId = newest.id
  const groupId = stableGroupId({
    eventType: newest.eventType,
    actorId: newest.actor.id,
    sessionId: newest.sessionId,
    primaryEventId,
    createdAt: newest.createdAt,
  })
  return {
    type: "group",
    groupId,
    eventType: newest.eventType,
    actorId: newest.actor.id,
    actorName: buffer[0]!.actor?.name ?? undefined,
    sessionId: newest.sessionId,
    primaryEventId,
    count: events.length,
    previewEvents: events.slice(0, 2),
    createdAt: newest.createdAt,
  }
}

/**
 * Groups adjacent activity events (newest-first / DESC `createdAt`) when they share
 * type, actor, session, and fall within a 5-minute window anchored on the newest
 * event in the group. Does not mutate `events` or any event object.
 */
export function groupEvents(events: ActivityEvent[]): GroupedActivity[] {
  const result: GroupedActivity[] = []
  let buffer: ActivityEvent[] = []

  const flushBuffer = () => {
    const block = finalizeBuffer(buffer)
    if (block) result.push(block)
    buffer = []
  }

  for (const event of events) {
    if (!canMergeIntoGroup(event)) {
      flushBuffer()
      result.push(toSingle(event))
      continue
    }

    if (buffer.length === 0) {
      buffer.push(event)
      continue
    }

    const anchor = buffer[0]!
    const sameCore =
      event.eventType === anchor.eventType &&
      event.actor.id === anchor.actor.id &&
      event.sessionId === anchor.sessionId

    const anchorTime = anchor.createdAt!
    const t = event.createdAt!
    const withinWindow =
      anchorTime - t >= 0 && anchorTime - t <= GROUP_WINDOW_MS

    if (sameCore && withinWindow) {
      buffer.push(event)
    } else {
      flushBuffer()
      buffer.push(event)
    }
  }

  flushBuffer()
  return result
}

export function startOfLocalDayMs(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

export function startOfWeekMonday(reference: Date): Date {
  const s = new Date(reference)
  const day = s.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  s.setDate(s.getDate() + mondayOffset)
  s.setHours(0, 0, 0, 0)
  return s
}

export function groupedActivityTimestamp(item: GroupedActivity): number | null {
  return item.type === "single" ? item.event.createdAt : item.createdAt
}

/**
 * Buckets grouped activity rows by local calendar day (uses each row's `createdAt`).
 */
export function groupEventsByDay(items: GroupedActivity[]): {
  today: GroupedActivity[]
  yesterday: GroupedActivity[]
  earlier: GroupedActivity[]
} {
  const now = new Date()
  const todayStart = startOfLocalDayMs(now)
  const yesterdayStart = todayStart - 86400000

  const today: GroupedActivity[] = []
  const yesterday: GroupedActivity[] = []
  const earlier: GroupedActivity[] = []

  for (const item of items) {
    const t = groupedActivityTimestamp(item)
    if (t == null || !Number.isFinite(t)) {
      earlier.push(item)
      continue
    }
    const dayStart = startOfLocalDayMs(new Date(t))
    if (dayStart === todayStart) today.push(item)
    else if (dayStart === yesterdayStart) yesterday.push(item)
    else earlier.push(item)
  }

  return { today, yesterday, earlier }
}

/** Splits the "earlier than yesterday" bucket into current ISO week vs older. */
export function partitionEarlierByWeek(
  earlier: GroupedActivity[],
  reference: Date = new Date()
): { thisWeek: GroupedActivity[]; rest: GroupedActivity[] } {
  const weekStart = startOfWeekMonday(reference).getTime()
  const thisWeek: GroupedActivity[] = []
  const rest: GroupedActivity[] = []

  for (const item of earlier) {
    const t = groupedActivityTimestamp(item)
    if (t == null || !Number.isFinite(t)) {
      rest.push(item)
      continue
    }
    const dayStart = startOfLocalDayMs(new Date(t))
    if (dayStart >= weekStart) thisWeek.push(item)
    else rest.push(item)
  }

  return { thisWeek, rest }
}
