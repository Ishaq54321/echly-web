"use client";

import { useSyncExternalStore } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
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

export interface AccessRequestItem {
  id: string;
  requesterUserId: string;
  requesterEmail: string;
  requestedAccess: "view" | "resolve";
  status: string;
}

export interface AccessRequestState {
  requests: AccessRequestItem[];
  count: number;
  loading: boolean;
  error: Error | null;
  version: number;
}

interface AccessRequestEntry {
  state: AccessRequestState;
  unsubscribe: (() => void) | null;
  retainCount: number;
}

const initialState = (): AccessRequestState => ({
  requests: [],
  count: 0,
  loading: true,
  error: null,
  version: 0,
});

const EMPTY_REQUESTS: readonly AccessRequestItem[] = Object.freeze([]);
const EMPTY_STATE: AccessRequestState = Object.freeze({
  requests: EMPTY_REQUESTS as AccessRequestItem[],
  count: 0,
  loading: true,
  error: null,
  version: 0,
}) as AccessRequestState;

const entries = new Map<string, AccessRequestEntry>();
const listenersBySession = new Map<string, Set<() => void>>();

function getOrCreateEntry(sessionId: string): AccessRequestEntry {
  let e = entries.get(sessionId);
  if (!e) {
    e = { state: initialState(), unsubscribe: null, retainCount: 0 };
    entries.set(sessionId, e);
  }
  return e;
}

function emitFor(sessionId: string) {
  listenersBySession.get(sessionId)?.forEach((l) => l());
}

function setState(sessionId: string, patch: Partial<AccessRequestState>) {
  const e = getOrCreateEntry(sessionId);
  e.state = { ...e.state, ...patch, version: e.state.version + 1 };
  emitFor(sessionId);
}

function mapFromSnap(
  snap: QueryDocumentSnapshot<DocumentData>
): AccessRequestItem | null {
  const data = snap.data();
  const requestedAccess =
    data.requestedAccess === "resolve" ? "resolve" : "view";
  return {
    id: snap.id,
    requesterUserId:
      typeof data.requesterUserId === "string" ? data.requesterUserId : "",
    requesterEmail:
      typeof data.requesterEmail === "string" ? data.requesterEmail : "",
    requestedAccess,
    status: typeof data.status === "string" ? data.status : "pending",
  };
}

function attachListener(sessionId: string) {
  const e = getOrCreateEntry(sessionId);
  if (e.unsubscribe) return;

  const q = query(
    collection(db, "sessions", sessionId, "accessRequests"),
    where("status", "==", "pending")
  );

  const unsub = onSnapshot(
    q,
    (snap) => {
      try {
        const list: AccessRequestItem[] = [];
        snap.forEach((doc) => {
          const item = mapFromSnap(doc);
          if (item) list.push(item);
        });
        setState(sessionId, {
          requests: list,
          count: list.length,
          loading: false,
          error: null,
        });
        recordListenerUpdate("accessRequests", sessionId, {
          count: list.length,
          fromCache: snap.metadata.fromCache,
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState(sessionId, { error, loading: false });
        recordListenerError("accessRequests", sessionId, error);
      }
    },
    (err) => {
      const error = err instanceof Error ? err : new Error(String(err));
      const code = (err as { code?: unknown })?.code;
      if (code !== undefined && (error as { code?: unknown }).code === undefined) {
        (error as { code?: unknown }).code = code;
      }
      setState(sessionId, {
        error,
        loading: false,
        requests: [],
        count: 0,
      });
      recordListenerError("accessRequests", sessionId, error);
    }
  );

  e.unsubscribe = unsub;
  recordListenerAttach("accessRequests", sessionId);
}

function detachListener(sessionId: string) {
  const e = entries.get(sessionId);
  if (!e?.unsubscribe) return;
  e.unsubscribe();
  e.unsubscribe = null;
  recordListenerDetach("accessRequests", sessionId);
}

function tearDownAllOnSignOut() {
  for (const sid of Array.from(entries.keys())) {
    detachListener(sid);
    const e = entries.get(sid);
    if (!e) continue;
    e.retainCount = 0;
    e.state = { ...initialState(), version: e.state.version + 1 };
    emitFor(sid);
  }
}

if (typeof window !== "undefined") {
  onAuthStateChanged(auth, (user) => {
    if (!user) tearDownAllOnSignOut();
  });
}

export function retainAccessRequestsListener(sessionId: string): () => void {
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

export function getAccessRequestsSnapshot(sessionId: string): AccessRequestState {
  return entries.get(sessionId)?.state ?? EMPTY_STATE;
}

export function subscribeToAccessRequests(
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

export function useAccessRequestsStore(sessionId: string): AccessRequestState {
  const subscribe = (l: () => void) => subscribeToAccessRequests(sessionId, l);
  const get = () => getAccessRequestsSnapshot(sessionId);
  return useSyncExternalStore(subscribe, get, get);
}
