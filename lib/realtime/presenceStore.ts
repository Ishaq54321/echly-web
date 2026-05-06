"use client";

import { useSyncExternalStore } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import {
  recordListenerAttach,
  recordListenerDetach,
  recordListenerError,
  recordListenerUpdate,
} from "@/lib/observability/listenerEvents";

export interface PresentUser {
  userId: string;
  displayName: string;
  photoURL: string | null;
  lastSeen: Timestamp;
}

export interface PresenceState {
  presentUsers: PresentUser[];
  loading: boolean;
  error: Error | null;
  /** Set true when a permission-denied error occurs AFTER initial load — signals mid-view access revocation. */
  accessRevoked: boolean;
  version: number;
}

interface PresenceEntry {
  state: PresenceState;
  unsubscribe: (() => void) | null;
  /** Last raw mapped list from a snapshot, kept so the GC tick can re-filter without a Firestore round-trip. */
  rawList: PresentUser[];
  gcInterval: ReturnType<typeof setInterval> | null;
  retainCount: number;
}

const STALE_MS = 120_000;
const GC_INTERVAL_MS = 15_000;

const initialState = (): PresenceState => ({
  presentUsers: [],
  loading: true,
  error: null,
  accessRevoked: false,
  version: 0,
});

const EMPTY_PRESENCE_LIST: readonly PresentUser[] = Object.freeze([]);
const EMPTY_PRESENCE_STATE: PresenceState = Object.freeze({
  presentUsers: EMPTY_PRESENCE_LIST as PresentUser[],
  loading: true,
  error: null,
  accessRevoked: false,
  version: 0,
}) as PresenceState;

const entries = new Map<string, PresenceEntry>();
const listenersBySession = new Map<string, Set<() => void>>();

function getOrCreateEntry(sessionId: string): PresenceEntry {
  let e = entries.get(sessionId);
  if (!e) {
    e = {
      state: initialState(),
      unsubscribe: null,
      rawList: [],
      gcInterval: null,
      retainCount: 0,
    };
    entries.set(sessionId, e);
  }
  return e;
}

function emitFor(sessionId: string) {
  listenersBySession.get(sessionId)?.forEach((l) => l());
}

function setState(sessionId: string, patch: Partial<PresenceState>) {
  const e = getOrCreateEntry(sessionId);
  e.state = { ...e.state, ...patch, version: e.state.version + 1 };
  emitFor(sessionId);
}

function asTimestamp(value: unknown): Timestamp | null {
  if (value == null) return null;
  if (value instanceof Timestamp) return value;
  if (value instanceof Date) return Timestamp.fromDate(value);
  const v = value as { seconds?: number; nanoseconds?: number };
  if (typeof v.seconds === "number") {
    return new Timestamp(v.seconds, typeof v.nanoseconds === "number" ? v.nanoseconds : 0);
  }
  return null;
}

function mapPresentUserFromSnap(
  snap: QueryDocumentSnapshot<DocumentData>
): PresentUser | null {
  const data = snap.data();
  const userId = typeof data.userId === "string" ? data.userId : snap.id;
  if (!userId) return null;
  const lastSeen = asTimestamp(data.lastSeen);
  if (!lastSeen) return null;
  return {
    userId,
    displayName: typeof data.displayName === "string" ? data.displayName : "",
    photoURL: typeof data.photoURL === "string" ? data.photoURL : null,
    lastSeen,
  };
}

function filterFresh(list: PresentUser[]): PresentUser[] {
  const cutoff = Date.now() - STALE_MS;
  return list.filter((u) => u.lastSeen.toMillis() > cutoff);
}

function listsEqual(a: PresentUser[], b: PresentUser[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].userId !== b[i].userId) return false;
    if (a[i].lastSeen.toMillis() !== b[i].lastSeen.toMillis()) return false;
  }
  return true;
}

function attachListener(sessionId: string) {
  const e = getOrCreateEntry(sessionId);
  if (e.unsubscribe) return;

  const q = query(
    collection(db, "sessions", sessionId, "presence"),
    orderBy("lastSeen", "desc")
  );

  const unsub = onSnapshot(
    q,
    (snap) => {
      try {
        const raw: PresentUser[] = [];
        snap.forEach((doc) => {
          const u = mapPresentUserFromSnap(doc);
          if (u) raw.push(u);
        });
        e.rawList = raw;
        const fresh = filterFresh(raw);
        setState(sessionId, { presentUsers: fresh, loading: false, error: null });
        recordListenerUpdate("presence", sessionId, {
          count: fresh.length,
          fromCache: snap.metadata.fromCache,
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState(sessionId, { error, loading: false });
        recordListenerError("presence", sessionId, error);
      }
    },
    (err) => {
      const error = err instanceof Error ? err : new Error(String(err));
      const code = (err as { code?: unknown })?.code;
      if (code !== undefined && (error as { code?: unknown }).code === undefined) {
        (error as { code?: unknown }).code = code;
      }
      const wasLoaded = !getOrCreateEntry(sessionId).state.loading;
      const accessRevoked = code === "permission-denied" && wasLoaded;
      setState(sessionId, { error, loading: false, accessRevoked });
      recordListenerError("presence", sessionId, error);
    }
  );

  e.unsubscribe = unsub;
  // Client-side GC: re-filter rawList every 15s so closed-tab ghosts disappear
  // without requiring a Firestore change to fire the snapshot listener.
  e.gcInterval = setInterval(() => {
    const cur = entries.get(sessionId);
    if (!cur) return;
    const fresh = filterFresh(cur.rawList);
    if (!listsEqual(fresh, cur.state.presentUsers)) {
      setState(sessionId, { presentUsers: fresh });
    }
  }, GC_INTERVAL_MS);

  recordListenerAttach("presence", sessionId);
}

function detachListener(sessionId: string) {
  const e = entries.get(sessionId);
  if (!e) return;
  if (e.gcInterval) {
    clearInterval(e.gcInterval);
    e.gcInterval = null;
  }
  if (e.unsubscribe) {
    e.unsubscribe();
    e.unsubscribe = null;
    recordListenerDetach("presence", sessionId);
  }
}

function tearDownAllOnSignOut() {
  for (const sid of Array.from(entries.keys())) {
    detachListener(sid);
    const e = entries.get(sid);
    if (!e) continue;
    e.retainCount = 0;
    e.rawList = [];
    e.state = { ...initialState(), version: e.state.version + 1 };
    emitFor(sid);
  }
}

if (typeof window !== "undefined") {
  onAuthStateChanged(auth, (user) => {
    if (!user) tearDownAllOnSignOut();
  });
}

export function retainPresenceListener(sessionId: string): () => void {
  const sid = typeof sessionId === "string" ? sessionId.trim() : "";
  if (!sid) return () => {};

  const e = getOrCreateEntry(sid);
  e.retainCount += 1;
  attachListener(sid);

  let released = false;
  return () => {
    if (released) return;
    released = true;
    const cur = entries.get(sid);
    if (!cur) return;
    cur.retainCount = Math.max(0, cur.retainCount - 1);
    if (cur.retainCount === 0) {
      detachListener(sid);
    }
  };
}

export function getPresenceSnapshot(sessionId: string): PresenceState {
  return entries.get(sessionId)?.state ?? EMPTY_PRESENCE_STATE;
}

export function subscribeToPresence(
  sessionId: string,
  listener: () => void
): () => void {
  let set = listenersBySession.get(sessionId);
  if (!set) {
    set = new Set();
    listenersBySession.set(sessionId, set);
  }
  set.add(listener);
  return () => {
    const s = listenersBySession.get(sessionId);
    if (!s) return;
    s.delete(listener);
    if (s.size === 0) listenersBySession.delete(sessionId);
  };
}

export function usePresenceStore(sessionId: string): PresenceState {
  const subscribe = (l: () => void) => subscribeToPresence(sessionId, l);
  const get = () => getPresenceSnapshot(sessionId);
  return useSyncExternalStore(subscribe, get, get);
}
