"use client";

import { useSyncExternalStore } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import type { Comment } from "@/lib/domain/comment";
import {
  recordListenerAttach,
  recordListenerDetach,
  recordListenerError,
  recordListenerUpdate,
} from "@/lib/observability/listenerEvents";

export interface CommentsState {
  comments: Comment[];
  loading: boolean;
  error: Error | null;
  /** Set true when a permission-denied error occurs AFTER initial load — signals mid-view access revocation. */
  accessRevoked: boolean;
  version: number;
}

interface CommentsEntry {
  state: CommentsState;
  unsubscribe: (() => void) | null;
  retainCount: number;
  workspaceId: string | null;
  sessionId: string;
  feedbackId: string;
}

const initialState = (): CommentsState => ({
  comments: [],
  loading: true,
  error: null,
  accessRevoked: false,
  version: 0,
});

const EMPTY_COMMENTS_LIST: readonly Comment[] = Object.freeze([]);
const EMPTY_COMMENTS_STATE: CommentsState = Object.freeze({
  comments: EMPTY_COMMENTS_LIST as Comment[],
  loading: true,
  error: null,
  accessRevoked: false,
  version: 0,
}) as CommentsState;

/** Entries are keyed by `${sessionId}:${feedbackId}` so each ticket gets its own listener + state. */
const entries = new Map<string, CommentsEntry>();
const listenersByKey = new Map<string, Set<() => void>>();
/** sessionId -> set of entry keys, so session-wide consumers (e.g. accessRevoked watcher) can fan out emits. */
const keysBySession = new Map<string, Set<string>>();
const sessionListeners = new Map<string, Set<() => void>>();

function entryKey(sessionId: string, feedbackId: string): string {
  return `${sessionId}:${feedbackId}`;
}

function getOrCreateEntry(sessionId: string, feedbackId: string): CommentsEntry {
  const key = entryKey(sessionId, feedbackId);
  let e = entries.get(key);
  if (!e) {
    e = {
      state: initialState(),
      unsubscribe: null,
      retainCount: 0,
      workspaceId: null,
      sessionId,
      feedbackId,
    };
    entries.set(key, e);
    let set = keysBySession.get(sessionId);
    if (!set) {
      set = new Set();
      keysBySession.set(sessionId, set);
    }
    set.add(key);
  }
  return e;
}

function emitFor(sessionId: string, feedbackId: string) {
  const key = entryKey(sessionId, feedbackId);
  listenersByKey.get(key)?.forEach((l) => l());
  sessionListeners.get(sessionId)?.forEach((l) => l());
}

function setState(
  sessionId: string,
  feedbackId: string,
  patch: Partial<CommentsState>
) {
  const e = getOrCreateEntry(sessionId, feedbackId);
  e.state = { ...e.state, ...patch, version: e.state.version + 1 };
  emitFor(sessionId, feedbackId);
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

function getMillis(ts: Timestamp | null): number {
  return ts ? ts.toMillis() : 0;
}

/**
 * Mirror of `serializeCommentRow` in app/api/comments/[sessionId]/route.ts so the
 * listener-emitted Comment matches the REST shape the rest of the app already expects.
 */
function mapCommentFromSnap(snap: QueryDocumentSnapshot<DocumentData>): Comment | null {
  const data = snap.data();
  const id = snap.id;
  const sessionId = typeof data.sessionId === "string" ? data.sessionId : "";
  const feedbackId = typeof data.feedbackId === "string" ? data.feedbackId : "";
  const userId = typeof data.userId === "string" ? data.userId : "";
  if (!id || !sessionId || !feedbackId || !userId) return null;

  const threadIdRaw = data.threadId;
  const threadId =
    threadIdRaw === null || threadIdRaw === undefined
      ? null
      : typeof threadIdRaw === "string"
        ? threadIdRaw
        : null;

  return {
    id,
    workspaceId: typeof data.workspaceId === "string" ? data.workspaceId : undefined,
    sessionId,
    feedbackId,
    userId,
    userName: typeof data.userName === "string" ? data.userName : "",
    userAvatar: typeof data.userAvatar === "string" ? data.userAvatar : "",
    message: typeof data.message === "string" ? data.message : "",
    createdAt: asTimestamp(data.createdAt),
    type:
      data.type === "pin" || data.type === "text" || data.type === "general"
        ? data.type
        : undefined,
    position:
      data.position && typeof data.position === "object"
        ? (data.position as Comment["position"])
        : undefined,
    textRange:
      data.textRange && typeof data.textRange === "object"
        ? (data.textRange as Comment["textRange"])
        : undefined,
    threadId,
    resolved: typeof data.resolved === "boolean" ? data.resolved : undefined,
    attachment:
      data.attachment && typeof data.attachment === "object"
        ? (data.attachment as Comment["attachment"])
        : undefined,
    attachments: Array.isArray(data.attachments)
      ? (data.attachments as Comment["attachments"])
      : undefined,
    reactions:
      data.reactions && typeof data.reactions === "object"
        ? (data.reactions as Comment["reactions"])
        : undefined,
    mentionedUserIds: Array.isArray(data.mentionedUserIds)
      ? (data.mentionedUserIds as unknown[]).filter(
          (s): s is string => typeof s === "string"
        )
      : undefined,
  };
}

function attachListener(sessionId: string, feedbackId: string, workspaceId: string) {
  const e = getOrCreateEntry(sessionId, feedbackId);
  if (e.unsubscribe) return;
  e.workspaceId = workspaceId;

  const q = query(
    collection(db, "comments"),
    where("workspaceId", "==", workspaceId),
    where("sessionId", "==", sessionId),
    where("feedbackId", "==", feedbackId),
    orderBy("createdAt", "asc"),
    limit(200)
  );

  const key = entryKey(sessionId, feedbackId);
  const unsub = onSnapshot(
    q,
    (snap) => {
      try {
        const list: Comment[] = [];
        snap.forEach((doc) => {
          const c = mapCommentFromSnap(doc);
          if (c) list.push(c);
        });
        list.sort((a, b) => {
          const diff = getMillis(a.createdAt) - getMillis(b.createdAt);
          if (diff !== 0) return diff;
          return a.id.localeCompare(b.id);
        });
        setState(sessionId, feedbackId, { comments: list, loading: false, error: null });
        recordListenerUpdate("comments", key, {
          count: list.length,
          fromCache: snap.metadata.fromCache,
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState(sessionId, feedbackId, { error, loading: false });
        recordListenerError("comments", key, error, { workspaceId });
      }
    },
    (err) => {
      const error = err instanceof Error ? err : new Error(String(err));
      const code = (err as { code?: unknown })?.code;
      if (code !== undefined && (error as { code?: unknown }).code === undefined) {
        (error as { code?: unknown }).code = code;
      }
      const wasLoaded = !getOrCreateEntry(sessionId, feedbackId).state.loading;
      const accessRevoked = code === "permission-denied" && wasLoaded;
      setState(sessionId, feedbackId, { error, loading: false, accessRevoked });
      recordListenerError("comments", key, error, { workspaceId });
    }
  );

  e.unsubscribe = unsub;
  recordListenerAttach("comments", key, { workspaceId });
}

function detachListener(sessionId: string, feedbackId: string) {
  const key = entryKey(sessionId, feedbackId);
  const e = entries.get(key);
  if (!e?.unsubscribe) return;
  e.unsubscribe();
  e.unsubscribe = null;
  recordListenerDetach("comments", key);
}

/**
 * D10 lock: tear down every active listener and reset state on sign-out.
 * Consumers' effects re-run when isIdentityReady flips and call retain themselves.
 */
function tearDownAllOnSignOut() {
  for (const [key, e] of Array.from(entries.entries())) {
    if (e.unsubscribe) {
      e.unsubscribe();
      e.unsubscribe = null;
      recordListenerDetach("comments", key);
    }
    e.retainCount = 0;
    e.state = { ...initialState(), version: e.state.version + 1 };
    aggregateCache.delete(e.sessionId);
    listenersByKey.get(key)?.forEach((l) => l());
    sessionListeners.get(e.sessionId)?.forEach((l) => l());
  }
}

if (typeof window !== "undefined") {
  onAuthStateChanged(auth, (user) => {
    if (!user) tearDownAllOnSignOut();
  });
}

/**
 * Increment retain count and ensure the per-ticket `comments` query is listened
 * to. Always call the returned function on unmount.
 */
export function retainCommentsListener(
  sessionId: string,
  feedbackId: string,
  workspaceId: string
): () => void {
  const sid = typeof sessionId === "string" ? sessionId.trim() : "";
  const fid = typeof feedbackId === "string" ? feedbackId.trim() : "";
  const wid = typeof workspaceId === "string" ? workspaceId.trim() : "";
  if (!sid || !fid || !wid) return () => {};

  const e = getOrCreateEntry(sid, fid);
  e.retainCount += 1;
  attachListener(sid, fid, wid);

  let released = false;
  return () => {
    if (released) return;
    released = true;
    const cur = entries.get(entryKey(sid, fid));
    if (!cur) return;
    cur.retainCount = Math.max(0, cur.retainCount - 1);
    if (cur.retainCount === 0) {
      detachListener(sid, fid);
    }
  };
}

export function getCommentsSnapshot(
  sessionId: string,
  feedbackId: string
): CommentsState {
  return entries.get(entryKey(sessionId, feedbackId))?.state ?? EMPTY_COMMENTS_STATE;
}

export function subscribeToComments(
  sessionId: string,
  feedbackId: string,
  listener: () => void
): () => void {
  const key = entryKey(sessionId, feedbackId);
  let set = listenersByKey.get(key);
  if (!set) {
    set = new Set();
    listenersByKey.set(key, set);
  }
  set.add(listener);
  return () => {
    const s = listenersByKey.get(key);
    if (!s) return;
    s.delete(listener);
    if (s.size === 0) listenersByKey.delete(key);
  };
}

/**
 * Session-wide accessRevoked watcher. Used by SessionPageClient's revocation
 * effect — it doesn't care about a specific ticket, it just needs to know if
 * any comments listener for this session has been revoked.
 *
 * Result is cached per-session and only invalidated when the aggregate changes,
 * so `useSyncExternalStore`'s identity check doesn't spin into an infinite loop.
 */
const aggregateCache = new Map<string, CommentsState>();

function getSessionAggregateState(sessionId: string): CommentsState {
  const keys = keysBySession.get(sessionId);
  if (!keys || keys.size === 0) {
    const cached = aggregateCache.get(sessionId);
    if (cached === EMPTY_COMMENTS_STATE) return cached;
    aggregateCache.set(sessionId, EMPTY_COMMENTS_STATE);
    return EMPTY_COMMENTS_STATE;
  }
  let accessRevoked = false;
  let error: Error | null = null;
  let loading = true;
  let version = 0;
  for (const k of keys) {
    const e = entries.get(k);
    if (!e) continue;
    if (e.state.accessRevoked) accessRevoked = true;
    if (e.state.error && !error) error = e.state.error;
    if (!e.state.loading) loading = false;
    version += e.state.version;
  }
  const cached = aggregateCache.get(sessionId);
  if (
    cached &&
    cached.accessRevoked === accessRevoked &&
    cached.error === error &&
    cached.loading === loading &&
    cached.version === version
  ) {
    return cached;
  }
  const next: CommentsState = {
    comments: EMPTY_COMMENTS_LIST as Comment[],
    loading,
    error,
    accessRevoked,
    version,
  };
  aggregateCache.set(sessionId, next);
  return next;
}

/**
 * Per-ticket store hook. Pass a falsy feedbackId to get the empty state (no listener attached).
 */
export function useCommentsStore(
  sessionId: string,
  feedbackId: string | null | undefined
): CommentsState {
  const fid = typeof feedbackId === "string" ? feedbackId : "";
  const subscribe = (l: () => void) =>
    fid ? subscribeToComments(sessionId, fid, l) : () => {};
  const get = () =>
    fid ? getCommentsSnapshot(sessionId, fid) : EMPTY_COMMENTS_STATE;
  return useSyncExternalStore(subscribe, get, get);
}

/**
 * Session-wide aggregate hook — emits when any per-ticket entry for this
 * session changes. Used by SessionPageClient's accessRevoked watcher.
 */
export function useSessionCommentsAggregate(sessionId: string): CommentsState {
  const subscribe = (l: () => void) => {
    let set = sessionListeners.get(sessionId);
    if (!set) {
      set = new Set();
      sessionListeners.set(sessionId, set);
    }
    set.add(l);
    return () => {
      const s = sessionListeners.get(sessionId);
      if (!s) return;
      s.delete(l);
      if (s.size === 0) sessionListeners.delete(sessionId);
    };
  };
  const get = () => getSessionAggregateState(sessionId);
  return useSyncExternalStore(subscribe, get, get);
}
