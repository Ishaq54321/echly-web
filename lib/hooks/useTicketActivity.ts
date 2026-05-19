"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  subscribeToTicketActivitySync,
  getTicketActivitySnapshot,
} from "@/lib/realtime/ticketActivityStore";
import { useUserAvatars } from "@/lib/hooks/useUserAvatars";
import type { ActivityEvent } from "@/lib/activity/groupEvents";

interface AssignmentParty {
  uid?: string;
  name?: string;
}

/** Stable empty reference so the no-ticket / loading path never re-renders consumers. */
const EMPTY_EVENTS: ActivityEvent[] = [];

/**
 * Per-ticket activity events with live avatar resolution (Phase 26.1).
 *
 * Subscribes to the realtime store, then overrides each actor's
 * `photoURL` (and the from/to user avatars on assignment events) with
 * the live value from `useUserAvatars` — the photoURL frozen onto the
 * event doc at write time goes stale when a user changes their photo
 * (Phase 25.x: there is no fan-out on avatar upload).
 */
export function useTicketActivity(
  workspaceId: string | null | undefined,
  feedbackId: string | null | undefined,
  sessionId: string | null | undefined
): { events: ActivityEvent[]; loading: boolean } {
  const wid = workspaceId?.trim() || "";
  const fid = feedbackId?.trim() || "";
  const sid = sessionId?.trim() || "";
  const active = Boolean(wid && fid && sid);

  // useSyncExternalStore (same pattern as commentsStore) — structurally
  // avoids setState-in-effect. getSnapshot returns the store's stable
  // lastValue ref, or null while the first Firestore snapshot is pending.
  const subscribe = useCallback(
    (onStoreChange: () => void) =>
      active
        ? subscribeToTicketActivitySync(wid, fid, sid, onStoreChange)
        : () => {},
    [active, wid, fid, sid]
  );
  const getSnapshot = useCallback(
    () => (active ? getTicketActivitySnapshot(wid, fid, sid) : EMPTY_EVENTS),
    [active, wid, fid, sid]
  );
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => EMPTY_EVENTS
  );

  const events: ActivityEvent[] =
    snapshot && snapshot !== EMPTY_EVENTS
      ? (snapshot as ActivityEvent[])
      : EMPTY_EVENTS;
  const loading = active ? snapshot === null : false;

  // Every uid whose avatar appears in the timeline: the actor, plus the
  // from/to users on assignment events (they render as mention pills).
  const allUids = useMemo(() => {
    const set = new Set<string>();
    for (const e of events) {
      if (e.actor?.id) set.add(e.actor.id);
      if (e.eventType === "ticket.assignment.changed") {
        const md = (e.metadata ?? {}) as {
          from?: AssignmentParty | null;
          to?: AssignmentParty | null;
        };
        if (md.from?.uid) set.add(md.from.uid);
        if (md.to?.uid) set.add(md.to.uid);
      }
    }
    return Array.from(set);
  }, [events]);

  const liveAvatars = useUserAvatars(allUids);

  const enriched = useMemo(() => {
    return events.map((event) => ({
      ...event,
      actor: {
        ...event.actor,
        photoURL:
          (event.actor?.id ? liveAvatars.get(event.actor.id) : null) ??
          event.actor?.photoURL ??
          undefined,
      },
    }));
  }, [events, liveAvatars]);

  return { events: enriched, loading };
}
