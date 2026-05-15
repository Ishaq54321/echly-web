import "server-only";

import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getUserByIdRepo } from "@/lib/repositories/usersRepository.server";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository.server";
import { resolveUserName } from "@/lib/utils/nameSplit";
import type { ActivityEvent } from "@/lib/activity/groupEvents";

/** Denormalized fields the activity UI reads; extra keys (e.g. changedFields) are merged in Firestore. */
export type ActivityEventMetadata = {
  feedbackTitle?: string;
  sessionTitle?: string;
  commentPreview?: string;
} & Record<string, unknown>;

export type CreateActivityEventParams = {
  workspaceId: string;
  sessionId: string;
  eventType: string;
  actorId: string;
  actorName: string;
  actorPhotoURL?: string;
  feedbackId?: string;
  commentId?: string;
  metadata?: ActivityEventMetadata;
  /**
   * Optional explicit write time. When omitted, the doc gets
   * `FieldValue.serverTimestamp()` (the default for every existing
   * caller). The consolidation flow passes an explicit `Timestamp`
   * so a fresh event's time matches the millisecond clock it used
   * to decide consolidation.
   */
  createdAt?: Timestamp;
};

function compactMetadata(meta: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

export async function createActivityEvent(params: CreateActivityEventParams): Promise<void> {
  const workspaceId = params.workspaceId.trim();
  const sessionId = params.sessionId.trim();
  const actorId = params.actorId.trim();
  const actorName = params.actorName.trim();

  if (!workspaceId) throw new Error("createActivityEvent: workspaceId required");
  if (!sessionId) throw new Error("createActivityEvent: sessionId required");
  if (!actorId) throw new Error("createActivityEvent: actorId required");
  if (!actorName) throw new Error("createActivityEvent: actorName required");

  const metadata = compactMetadata({ ...(params.metadata ?? {}) });
  const photo = params.actorPhotoURL?.trim();

  const eventRef = adminDb
    .collection("workspaces")
    .doc(workspaceId)
    .collection("activityEvents")
    .doc();

  await eventRef.set({
    eventType: params.eventType,
    workspaceId,
    sessionId,
    feedbackId: params.feedbackId?.trim() ? params.feedbackId.trim() : null,
    commentId: params.commentId?.trim() ? params.commentId.trim() : null,
    actor: {
      id: actorId,
      name: actorName,
      ...(photo ? { photoURL: photo } : {}),
    },
    metadata,
    createdAt: params.createdAt ?? FieldValue.serverTimestamp(),
    groupKey: `${params.eventType}:${actorId}:${sessionId}`,
  });
}

/** Resolve display name + avatar from `users/{uid}` for activity denormalization. */
export async function resolveActorForActivityEvent(actorId: string): Promise<{
  actorName: string;
  actorPhotoURL?: string;
}> {
  const id = actorId.trim();
  if (!id) throw new Error("resolveActorForActivityEvent: actorId required");

  const u = await getUserByIdRepo(id);
  const row = (u ?? {}) as Record<string, unknown>;
  const name = resolveUserName({
    firstName: typeof row.firstName === "string" ? row.firstName : null,
    lastName: typeof row.lastName === "string" ? row.lastName : null,
    authDisplayName:
      typeof row.authDisplayName === "string" ? row.authDisplayName : null,
    email: typeof row.email === "string" ? row.email : null,
  });

  const photoRaw = row.photoURL ?? row.avatarUrl;
  const photo =
    typeof photoRaw === "string" && photoRaw.trim() ? photoRaw.trim() : undefined;

  return { actorName: name, actorPhotoURL: photo };
}

export async function sessionTitleForActivityEvent(sessionId: string): Promise<string> {
  const sid = sessionId.trim();
  if (!sid) return "Untitled Session";
  const s = await getSessionByIdRepo(sid);
  return sessionTitleFromSessionRow(s);
}

export function sessionTitleFromSessionRow(
  session: { title?: string } | null | undefined
): string {
  const t = typeof session?.title === "string" ? session.title.trim() : "";
  return t || "Untitled Session";
}

export function normalizeFeedbackTitleForActivity(raw: unknown): string {
  const t = typeof raw === "string" ? raw.trim() : "";
  return t || "Untitled feedback";
}

export function truncateActivityCommentPreview(message: string, maxLen = 80): string {
  const flattened = message.replace(/@\[([^\]]+)\]\([^)]*\)/g, "@$1");
  const t = flattened.trim();
  if (!t) return "";
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen)}…`;
}

const CONSOLIDATION_WINDOW_MS = 60 * 1000;

/**
 * Writes an activity event with consolidation. If the same actor wrote
 * the same `eventType` for the same `feedbackId` within the last 60s,
 * the existing event is UPDATED in place — its original `metadata.from`
 * is preserved while `metadata.to` and `createdAt` advance — instead of
 * inserting a duplicate.
 *
 * This collapses rapid same-actor adjustments (e.g. priority
 * Low → High → Medium within seconds) into one row showing the true
 * journey (Low → Medium). Different actors are never consolidated:
 * each represents a distinct decision.
 *
 * Requires the composite index
 * `activityEvents (eventType ASC, feedbackId ASC, actor.id ASC, createdAt DESC)`.
 */
export async function maybeWriteConsolidatedEvent(params: {
  workspaceId: string;
  sessionId: string;
  feedbackId: string;
  eventType: string;
  actorId: string;
  actorName: string;
  actorPhotoURL?: string;
  metadata: Record<string, unknown>;
}): Promise<void> {
  const {
    workspaceId,
    sessionId,
    feedbackId,
    eventType,
    actorId,
    actorName,
    actorPhotoURL,
    metadata,
  } = params;

  const nowMs = Date.now();
  // createdAt is stored as a Firestore Timestamp (serverTimestamp() for
  // every other caller), so the lower bound must be a Timestamp too — a
  // raw number would never match a Timestamp field in the query.
  const cutoff = Timestamp.fromMillis(nowMs - CONSOLIDATION_WINDOW_MS);

  const recentSnap = await adminDb
    .collection("workspaces")
    .doc(workspaceId)
    .collection("activityEvents")
    .where("eventType", "==", eventType)
    .where("feedbackId", "==", feedbackId)
    .where("actor.id", "==", actorId)
    .where("createdAt", ">=", cutoff)
    .orderBy("createdAt", "desc")
    .limit(1)
    .get();

  if (!recentSnap.empty) {
    const existing = recentSnap.docs[0]!;
    const existingMetadata =
      (existing.data().metadata as Record<string, unknown> | undefined) ?? {};

    // Preserve the ORIGINAL `from` (the start of this consolidation
    // window); only `to` advances to the latest target.
    const consolidatedMetadata: Record<string, unknown> = {
      ...metadata,
      from:
        "from" in existingMetadata ? existingMetadata.from : metadata.from,
      to: metadata.to,
    };

    await existing.ref.update({
      metadata: consolidatedMetadata,
      createdAt: Timestamp.fromMillis(nowMs),
    });
    return;
  }

  await createActivityEvent({
    workspaceId,
    sessionId,
    feedbackId,
    eventType,
    actorId,
    actorName,
    actorPhotoURL,
    metadata,
    createdAt: Timestamp.fromMillis(nowMs),
  });
}

/**
 * Fetches one page of activity events for a single ticket, newest-first.
 * The panel itself reads live via `lib/realtime/ticketActivityStore.ts`;
 * this exists for tests and any future server-side consumer.
 *
 * Requires the composite index
 * `activityEvents (feedbackId ASC, createdAt DESC, __name__ DESC)`.
 */
export async function getEventsByFeedbackIdRepo(
  workspaceId: string,
  feedbackId: string,
  options: {
    limit?: number;
    cursor?: { createdAtMs: number; docId: string } | null;
  } = {}
): Promise<{
  events: ActivityEvent[];
  nextCursor: { createdAtMs: number; docId: string } | null;
}> {
  const pageSize = options.limit ?? 50;

  let q: FirebaseFirestore.Query = adminDb
    .collection("workspaces")
    .doc(workspaceId)
    .collection("activityEvents")
    .where("feedbackId", "==", feedbackId)
    .orderBy("createdAt", "desc")
    .orderBy("__name__", "desc")
    .limit(pageSize + 1);

  if (options.cursor) {
    q = q.startAfter(
      Timestamp.fromMillis(options.cursor.createdAtMs),
      options.cursor.docId
    );
  }

  const snap = await q.get();
  const docs = snap.docs;
  const hasMore = docs.length > pageSize;
  const eventDocs = hasMore ? docs.slice(0, pageSize) : docs;

  const events: ActivityEvent[] = eventDocs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      eventType: data.eventType,
      workspaceId: data.workspaceId,
      sessionId: data.sessionId,
      feedbackId: data.feedbackId ?? undefined,
      commentId: data.commentId ?? undefined,
      actor: data.actor,
      metadata: data.metadata ?? undefined,
      createdAt: data.createdAt?.toMillis?.() ?? null,
      groupKey: data.groupKey ?? undefined,
    };
  });

  const last = eventDocs[eventDocs.length - 1];
  const lastCreatedAt = events[events.length - 1]?.createdAt;
  const nextCursor =
    hasMore && last && typeof lastCreatedAt === "number"
      ? { createdAtMs: lastCreatedAt, docId: last.id }
      : null;

  return { events, nextCursor };
}
