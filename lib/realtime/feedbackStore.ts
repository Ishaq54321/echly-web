"use client";

import { useSyncExternalStore } from "react";
import {
  collection,
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
import type { Feedback } from "@/lib/domain/feedback";
import { normalizeTicketStatus } from "@/lib/domain/normalizeTicketStatus";
import {
  recordListenerAttach,
  recordListenerDetach,
  recordListenerError,
  recordListenerUpdate,
} from "@/lib/observability/listenerEvents";

export interface FeedbackState {
  feedback: Feedback[];
  loading: boolean;
  error: Error | null;
  /** Set true when a permission-denied error occurs AFTER initial load — signals mid-view access revocation. */
  accessRevoked: boolean;
  version: number;
}

interface FeedbackEntry {
  state: FeedbackState;
  unsubscribe: (() => void) | null;
  retainCount: number;
  workspaceId: string | null;
}

const initialState = (): FeedbackState => ({
  feedback: [],
  loading: true,
  error: null,
  accessRevoked: false,
  version: 0,
});

const EMPTY_FEEDBACK_LIST: readonly Feedback[] = Object.freeze([]);
const EMPTY_FEEDBACK_STATE: FeedbackState = Object.freeze({
  feedback: EMPTY_FEEDBACK_LIST as Feedback[],
  loading: true,
  error: null,
  accessRevoked: false,
  version: 0,
}) as FeedbackState;

const entries = new Map<string, FeedbackEntry>();
const listenersBySession = new Map<string, Set<() => void>>();

function getOrCreateEntry(sessionId: string): FeedbackEntry {
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

function setState(sessionId: string, patch: Partial<FeedbackState>) {
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
 * Mirror of `feedbackFromRestApiRow` (in the deleted pagination hook) so the listener-emitted
 * Feedback shape matches the REST shape the rest of the app already expects. Any divergence
 * causes a flicker when the listener overrides bundle-seeded data (anonymous viewers).
 */
function mapFeedbackFromSnap(snap: QueryDocumentSnapshot<DocumentData>): Feedback | null {
  const data = snap.data();
  if (data.isDeleted === true) return null;
  const id = snap.id;
  const sessionId = typeof data.sessionId === "string" ? data.sessionId : "";
  const workspaceId = typeof data.workspaceId === "string" ? data.workspaceId : undefined;
  const userId = typeof data.userId === "string" ? data.userId : undefined;
  const rawStatus =
    typeof data.status === "string"
      ? data.status
      : data.isResolved === true
        ? "resolved"
        : "open";
  const normalizedStatus = normalizeTicketStatus(rawStatus);

  return {
    id,
    sessionId,
    workspaceId,
    userId,
    title: typeof data.title === "string" ? data.title : "",
    description: typeof data.description === "string" ? data.description : null,
    type: typeof data.type === "string" ? data.type : "Feedback",
    isResolved: normalizedStatus === "resolved",
    createdAt: asTimestamp(data.createdAt),
    tags: Array.isArray(data.tags)
      ? (data.tags as unknown[]).filter((s): s is string => typeof s === "string")
      : null,
    mentionedUserIds: Array.isArray(data.mentionedUserIds)
      ? (data.mentionedUserIds as unknown[]).filter((s): s is string => typeof s === "string")
      : null,
    pageArea: typeof data.pageArea === "string" ? data.pageArea : null,
    url: typeof data.url === "string" ? data.url : null,
    viewportWidth: typeof data.viewportWidth === "number" ? data.viewportWidth : null,
    viewportHeight: typeof data.viewportHeight === "number" ? data.viewportHeight : null,
    userAgent: typeof data.userAgent === "string" ? data.userAgent : null,
    clientTimestamp:
      typeof data.clientTimestamp === "number" ? data.clientTimestamp : null,
    screenWidth: typeof data.screenWidth === "number" ? data.screenWidth : null,
    screenHeight: typeof data.screenHeight === "number" ? data.screenHeight : null,
    devicePixelRatio:
      typeof data.devicePixelRatio === "number" ? data.devicePixelRatio : null,
    screenshotId: typeof data.screenshotId === "string" ? data.screenshotId : null,
    screenshotStatus:
      data.screenshotStatus === "attached" ||
      data.screenshotStatus === "pending" ||
      data.screenshotStatus === "none" ||
      data.screenshotStatus === "failed"
        ? data.screenshotStatus
        : null,
    status: normalizedStatus,
    commentCount: typeof data.commentCount === "number" ? data.commentCount : 0,
    lastCommentPreview:
      typeof data.lastCommentPreview === "string" ? data.lastCommentPreview : undefined,
    lastCommentAt: asTimestamp(data.lastCommentAt),
    isDeleted: data.isDeleted === true,
    assigneeId: typeof data.assigneeId === "string" ? data.assigneeId : null,
    assigneeName: typeof data.assigneeName === "string" ? data.assigneeName : null,
    assigneeAvatarUrl:
      typeof data.assigneeAvatarUrl === "string" ? data.assigneeAvatarUrl : null,
    priority:
      data.priority === "high" || data.priority === "medium" || data.priority === "low"
        ? (data.priority as "high" | "medium" | "low")
        : null,
    creatorName: typeof data.creatorName === "string" ? data.creatorName : null,
    creatorAvatarUrl:
      typeof data.creatorAvatarUrl === "string" ? data.creatorAvatarUrl : null,
  };
}

function attachListener(sessionId: string, workspaceId: string) {
  const e = getOrCreateEntry(sessionId);
  if (e.unsubscribe) return;
  e.workspaceId = workspaceId;

  const q = query(
    collection(db, "feedback"),
    where("sessionId", "==", sessionId),
    where("workspaceId", "==", workspaceId),
    orderBy("createdAt", "desc")
  );

  const unsub = onSnapshot(
    q,
    (snap) => {
      try {
        const list: Feedback[] = [];
        snap.forEach((doc) => {
          const f = mapFeedbackFromSnap(doc);
          if (f) list.push(f);
        });
        list.sort((a, b) => {
          const diff = getMillis(b.createdAt) - getMillis(a.createdAt);
          if (diff !== 0) return diff;
          return b.id.localeCompare(a.id);
        });
        setState(sessionId, { feedback: list, loading: false, error: null });
        recordListenerUpdate("feedback", sessionId, {
          count: list.length,
          fromCache: snap.metadata.fromCache,
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState(sessionId, { error, loading: false });
        recordListenerError("feedback", sessionId, error, { workspaceId });
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
      recordListenerError("feedback", sessionId, error, { workspaceId });
    }
  );

  e.unsubscribe = unsub;
  recordListenerAttach("feedback", sessionId, { workspaceId });
}

function detachListener(sessionId: string) {
  const e = entries.get(sessionId);
  if (!e?.unsubscribe) return;
  e.unsubscribe();
  e.unsubscribe = null;
  recordListenerDetach("feedback", sessionId);
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
 * Increment retain count and ensure the `feedback` query is listened to for this session.
 * Always call the returned function on unmount so other surfaces (if any) keep the listener alive.
 */
export function retainFeedbackListener(
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

export function getFeedbackSnapshot(sessionId: string): FeedbackState {
  return entries.get(sessionId)?.state ?? EMPTY_FEEDBACK_STATE;
}

export function subscribeToFeedback(
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

export function useFeedbackStore(sessionId: string): FeedbackState {
  const subscribe = (l: () => void) => subscribeToFeedback(sessionId, l);
  const get = () => getFeedbackSnapshot(sessionId);
  return useSyncExternalStore(subscribe, get, get);
}
