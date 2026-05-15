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
import type { Feedback } from "@/lib/domain/feedback";
import { normalizeTicketStatus } from "@/lib/domain/normalizeTicketStatus";
import {
  recordListenerAttach,
  recordListenerDetach,
  recordListenerError,
  recordListenerUpdate,
} from "@/lib/observability/listenerEvents";

export interface DiscussionFeedbackState {
  items: Feedback[];
  loading: boolean;
  error: Error | null;
  accessRevoked: boolean;
  version: number;
}

interface Entry {
  state: DiscussionFeedbackState;
  unsubscribe: (() => void) | null;
  retainCount: number;
}

const initialState = (): DiscussionFeedbackState => ({
  items: [],
  loading: true,
  error: null,
  accessRevoked: false,
  version: 0,
});

const EMPTY_LIST: readonly Feedback[] = Object.freeze([]);
const EMPTY_STATE: DiscussionFeedbackState = Object.freeze({
  items: EMPTY_LIST as Feedback[],
  loading: true,
  error: null,
  accessRevoked: false,
  version: 0,
}) as DiscussionFeedbackState;

const entries = new Map<string, Entry>();
const listenersByWorkspace = new Map<string, Set<() => void>>();

function getOrCreateEntry(workspaceId: string): Entry {
  let e = entries.get(workspaceId);
  if (!e) {
    e = { state: initialState(), unsubscribe: null, retainCount: 0 };
    entries.set(workspaceId, e);
  }
  return e;
}

function emitFor(workspaceId: string) {
  listenersByWorkspace.get(workspaceId)?.forEach((l) => l());
}

function setState(workspaceId: string, patch: Partial<DiscussionFeedbackState>) {
  const e = getOrCreateEntry(workspaceId);
  e.state = { ...e.state, ...patch, version: e.state.version + 1 };
  emitFor(workspaceId);
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

function getMillis(ts: Timestamp | null | undefined): number {
  return ts ? ts.toMillis() : 0;
}

// Mirror of mapFeedbackFromSnap in feedbackStore.ts. Kept in sync so
// listener-emitted Feedback shape matches the REST shape consumers expect.
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
    lastCommentByUid:
      typeof data.lastCommentByUid === "string" ? data.lastCommentByUid : null,
    lastCommentByName:
      typeof data.lastCommentByName === "string" ? data.lastCommentByName : null,
  };
}

function attachListener(workspaceId: string) {
  const e = getOrCreateEntry(workspaceId);
  if (e.unsubscribe) return;

  // Requires composite index: feedback (workspaceId Asc, commentCount Asc, lastCommentAt Desc).
  // commentCount inequality forces orderBy(commentCount) first; we re-sort by
  // lastCommentAt client-side after the snapshot lands.
  const q = query(
    collection(db, "feedback"),
    where("workspaceId", "==", workspaceId),
    where("commentCount", ">", 0),
    orderBy("commentCount"),
    orderBy("lastCommentAt", "desc"),
    limit(100)
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
          const diff = getMillis(b.lastCommentAt) - getMillis(a.lastCommentAt);
          if (diff !== 0) return diff;
          return b.id.localeCompare(a.id);
        });
        setState(workspaceId, { items: list, loading: false, error: null });
        recordListenerUpdate("discussionFeedback", workspaceId, {
          count: list.length,
          fromCache: snap.metadata.fromCache,
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState(workspaceId, { error, loading: false });
        recordListenerError("discussionFeedback", workspaceId, error, { workspaceId });
      }
    },
    (err) => {
      const error = err instanceof Error ? err : new Error(String(err));
      const code = (err as { code?: unknown })?.code;
      if (code !== undefined && (error as { code?: unknown }).code === undefined) {
        (error as { code?: unknown }).code = code;
      }
      const wasLoaded = !getOrCreateEntry(workspaceId).state.loading;
      const accessRevoked = code === "permission-denied" && wasLoaded;
      setState(workspaceId, { error, loading: false, accessRevoked });
      recordListenerError("discussionFeedback", workspaceId, error, { workspaceId });
    }
  );

  e.unsubscribe = unsub;
  recordListenerAttach("discussionFeedback", workspaceId, { workspaceId });
}

function detachListener(workspaceId: string) {
  const e = entries.get(workspaceId);
  if (!e?.unsubscribe) return;
  e.unsubscribe();
  e.unsubscribe = null;
  recordListenerDetach("discussionFeedback", workspaceId);
}

function tearDownAllOnSignOut() {
  for (const wid of Array.from(entries.keys())) {
    detachListener(wid);
    const e = entries.get(wid);
    if (!e) continue;
    e.retainCount = 0;
    e.state = { ...initialState(), version: e.state.version + 1 };
    emitFor(wid);
  }
}

if (typeof window !== "undefined") {
  onAuthStateChanged(auth, (user) => {
    if (!user) tearDownAllOnSignOut();
  });
}

export function retainDiscussionFeedbackListener(workspaceId: string): () => void {
  const wid = typeof workspaceId === "string" ? workspaceId.trim() : "";
  if (!wid) return () => {};

  const e = getOrCreateEntry(wid);
  e.retainCount += 1;
  attachListener(wid);

  let released = false;
  return () => {
    if (released) return;
    released = true;
    const cur = entries.get(wid);
    if (!cur) return;
    cur.retainCount = Math.max(0, cur.retainCount - 1);
    if (cur.retainCount === 0) {
      detachListener(wid);
    }
  };
}

export function getDiscussionFeedbackSnapshot(workspaceId: string): DiscussionFeedbackState {
  return entries.get(workspaceId)?.state ?? EMPTY_STATE;
}

export function subscribeToDiscussionFeedback(
  workspaceId: string,
  listener: () => void
): () => void {
  let set = listenersByWorkspace.get(workspaceId);
  if (!set) {
    set = new Set();
    listenersByWorkspace.set(workspaceId, set);
  }
  set.add(listener);
  return () => {
    const s = listenersByWorkspace.get(workspaceId);
    if (!s) return;
    s.delete(listener);
    if (s.size === 0) listenersByWorkspace.delete(workspaceId);
  };
}

export function useDiscussionFeedback(workspaceId: string | null): DiscussionFeedbackState {
  const wid = workspaceId ?? "";
  const subscribe = (l: () => void) => {
    if (!wid) return () => {};
    return subscribeToDiscussionFeedback(wid, l);
  };
  const get = () => (wid ? getDiscussionFeedbackSnapshot(wid) : EMPTY_STATE);
  return useSyncExternalStore(subscribe, get, get);
}
