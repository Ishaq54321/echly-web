"use client";

import {
  onSnapshot,
  query,
  collection,
  where,
  orderBy,
  limit as fsLimit,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ActivityEvent } from "@/lib/activity/groupEvents";

/**
 * Per-ticket activity timeline realtime store (Phase 26.1).
 *
 * Mirrors lib/realtime/commentsStore.ts: one Firestore `onSnapshot`
 * subscription per `${workspaceId}:${feedbackId}`, shared across all
 * consumers via ref-counting, torn down when the last consumer leaves.
 *
 * Depends on the firestore.rules `activityEvents` read rule — without
 * it every snapshot fails permission-denied and consumers get `[]`.
 */

type Listener = (events: ActivityEvent[]) => void;

interface Subscription {
  unsubscribe: () => void;
  listeners: Set<Listener>;
  lastValue: ActivityEvent[];
  /** True once the first snapshot (or an error) has resolved. */
  settled: boolean;
}

const subs = new Map<string, Subscription>();

function keyFor(workspaceId: string, feedbackId: string): string {
  return `${workspaceId}:${feedbackId}`;
}

function mapEvent(
  id: string,
  data: Record<string, unknown>
): ActivityEvent {
  const rawCreatedAt = data.createdAt;
  const createdAt =
    rawCreatedAt instanceof Timestamp
      ? rawCreatedAt.toMillis()
      : typeof rawCreatedAt === "number"
        ? rawCreatedAt
        : null;
  return {
    id,
    eventType: data.eventType as string,
    workspaceId: data.workspaceId as string,
    sessionId: data.sessionId as string,
    feedbackId: (data.feedbackId as string | null) ?? undefined,
    commentId: (data.commentId as string | null) ?? undefined,
    actor: data.actor as ActivityEvent["actor"],
    metadata: (data.metadata as Record<string, unknown> | null) ?? undefined,
    createdAt,
    groupKey: (data.groupKey as string | null) ?? undefined,
  };
}

function ensureSubscription(
  workspaceId: string,
  feedbackId: string
): Subscription {
  const key = keyFor(workspaceId, feedbackId);
  const cached = subs.get(key);
  if (cached) return cached;

  const q = query(
    collection(db, `workspaces/${workspaceId}/activityEvents`),
    where("feedbackId", "==", feedbackId),
    orderBy("createdAt", "desc"),
    fsLimit(50)
  );

  const sub: Subscription = {
    unsubscribe: () => {},
    listeners: new Set(),
    lastValue: [],
    settled: false,
  };

  sub.unsubscribe = onSnapshot(
    q,
    (snap) => {
      const events = snap.docs.map((doc) => mapEvent(doc.id, doc.data()));
      sub.lastValue = events;
      sub.settled = true;
      sub.listeners.forEach((l) => l(events));
    },
    (err) => {
      console.warn(
        `[ticketActivityStore] subscription failed for ${key}:`,
        err
      );
      sub.lastValue = [];
      sub.settled = true;
      sub.listeners.forEach((l) => l([]));
    }
  );

  subs.set(key, sub);
  return sub;
}

/**
 * Subscribe to a ticket's activity events. The listener fires on every
 * snapshot. If a snapshot has already resolved (subscription shared with
 * another consumer) the listener is invoked synchronously with the cached
 * value so late subscribers don't wait a full round-trip.
 *
 * Always call the returned cleanup on unmount.
 */
export function subscribeToTicketActivity(
  workspaceId: string,
  feedbackId: string,
  listener: Listener
): () => void {
  const wid = workspaceId.trim();
  const fid = feedbackId.trim();
  if (!wid || !fid) return () => {};

  const sub = ensureSubscription(wid, fid);
  sub.listeners.add(listener);
  if (sub.settled) listener(sub.lastValue);

  let released = false;
  return () => {
    if (released) return;
    released = true;
    sub.listeners.delete(listener);
    if (sub.listeners.size === 0) {
      sub.unsubscribe();
      subs.delete(keyFor(wid, fid));
    }
  };
}

/** Frozen sentinel so getSnapshot returns a stable ref while unsettled. */
const PENDING: readonly ActivityEvent[] = Object.freeze([]);

/**
 * `useSyncExternalStore`-compatible primitives (mirrors commentsStore).
 * `subscribe` takes React's bare notify callback; `getSnapshot` returns
 * the subscription's `lastValue` (only reassigned on a new Firestore
 * snapshot, so its identity is stable between renders) or PENDING until
 * the first snapshot resolves.
 */
export function subscribeToTicketActivitySync(
  workspaceId: string,
  feedbackId: string,
  onStoreChange: () => void
): () => void {
  return subscribeToTicketActivity(workspaceId, feedbackId, () =>
    onStoreChange()
  );
}

export function getTicketActivitySnapshot(
  workspaceId: string,
  feedbackId: string
): readonly ActivityEvent[] | null {
  const wid = workspaceId.trim();
  const fid = feedbackId.trim();
  if (!wid || !fid) return PENDING;
  const sub = subs.get(keyFor(wid, fid));
  if (!sub || !sub.settled) return null;
  return sub.lastValue;
}
