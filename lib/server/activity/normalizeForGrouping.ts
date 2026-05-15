import "server-only";

import type { ActivityEvent } from "./groupEventsServer";

function asRecord(raw: unknown): Record<string, unknown> {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return {};
  return raw as Record<string, unknown>;
}

/**
 * Coerces raw activity rows (e.g. Firestore-backed API shapes) into a strict
 * {@link ActivityEvent} for grouping — no `undefined` leaves, stable primitives.
 */
export function normalizeForGrouping(raw: unknown): ActivityEvent {
  const o = asRecord(raw);
  const actorO = asRecord(o.actor);

  const id = typeof o.id === "string" ? o.id : "";
  const eventType = typeof o.eventType === "string" ? o.eventType : "";
  const workspaceId = typeof o.workspaceId === "string" ? o.workspaceId : "";
  const sessionId = typeof o.sessionId === "string" ? o.sessionId : "";
  const createdAt =
    typeof o.createdAt === "number" && Number.isFinite(o.createdAt) ? o.createdAt : 0;

  const actor: ActivityEvent["actor"] = {
    id: typeof actorO.id === "string" ? actorO.id : "",
  };
  if (typeof actorO.name === "string") {
    actor.name = actorO.name;
  }
  // Preserve the live-resolved photoURL through the grouping pipeline.
  // Without this, the photoURL set by /api/activity-feed's resolveUserAvatars
  // override (route.ts:217-231) gets stripped here and the client only sees
  // actor.id + actor.name, forcing an initials fallback render even when the
  // user has a photo set.
  if (typeof actorO.photoURL === "string") {
    actor.photoURL = actorO.photoURL;
  }

  const event: ActivityEvent = {
    id,
    eventType,
    workspaceId,
    sessionId,
    actor,
    createdAt,
  };

  if (typeof o.feedbackId === "string") {
    event.feedbackId = o.feedbackId;
  }
  if (typeof o.commentId === "string") {
    event.commentId = o.commentId;
  }
  if (typeof o.metadata === "object" && o.metadata !== null && !Array.isArray(o.metadata)) {
    event.metadata = o.metadata as Record<string, unknown>;
  }
  if (typeof o.groupKey === "string") {
    event.groupKey = o.groupKey;
  }

  return event;
}
