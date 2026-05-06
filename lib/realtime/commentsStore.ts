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

const entries = new Map<string, CommentsEntry>();
const listenersBySession = new Map<string, Set<() => void>>();

function getOrCreateEntry(sessionId: string): CommentsEntry {
  let e = entries.get(sessionId);
  if (!e) {
    e = { state: initialState(), unsubscribe: null, retainCount: 0, workspaceId: null };
    entries.set(sessionId, e);
  }
  return e;
}

function emitFor(sessionId: string) {
  listenersBySession.get(sessionId)?.forEach((l) => l());
}

function setState(sessionId: string, patch: Partial<CommentsState>) {
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

function attachListener(sessionId: string, workspaceId: string) {
  const e = getOrCreateEntry(sessionId);
  if (e.unsubscribe) return;
  e.workspaceId = workspaceId;

  const q = query(
    collection(db, "comments"),
    where("sessionId", "==", sessionId),
    where("workspaceId", "==", workspaceId),
    orderBy("createdAt", "desc"),
    limit(200)
  );

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
        setState(sessionId, { comments: list, loading: false, error: null });
        recordListenerUpdate("comments", sessionId, {
          count: list.length,
          fromCache: snap.metadata.fromCache,
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState(sessionId, { error, loading: false });
        recordListenerError("comments", sessionId, error, { workspaceId });
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
      recordListenerError("comments", sessionId, error, { workspaceId });
    }
  );

  e.unsubscribe = unsub;
  recordListenerAttach("comments", sessionId, { workspaceId });
}

function detachListener(sessionId: string) {
  const e = entries.get(sessionId);
  if (!e?.unsubscribe) return;
  e.unsubscribe();
  e.unsubscribe = null;
  recordListenerDetach("comments", sessionId);
}

/**
 * D10 lock: tear down every active listener and reset state on sign-out.
 * Consumers' effects re-run when isIdentityReady flips and call retain themselves.
 */
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

/**
 * Increment retain count and ensure the `comments` query is listened to for this session.
 * Always call the returned function on unmount so other surfaces (if any) keep the listener alive.
 */
export function retainCommentsListener(
  sessionId: string,
  workspaceId: string
): () => void {
  const sid = typeof sessionId === "string" ? sessionId.trim() : "";
  const wid = typeof workspaceId === "string" ? workspaceId.trim() : "";
  if (!sid || !wid) return () => {};

  const e = getOrCreateEntry(sid);
  e.retainCount += 1;
  attachListener(sid, wid);

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

export function getCommentsSnapshot(sessionId: string): CommentsState {
  return entries.get(sessionId)?.state ?? EMPTY_COMMENTS_STATE;
}

export function subscribeToComments(
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

export function useCommentsStore(sessionId: string): CommentsState {
  const subscribe = (l: () => void) => subscribeToComments(sessionId, l);
  const get = () => getCommentsSnapshot(sessionId);
  return useSyncExternalStore(subscribe, get, get);
}
