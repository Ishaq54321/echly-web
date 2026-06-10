"use client";

import { useSyncExternalStore } from "react";
import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
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

/**
 * Newest-N the realtime listener watches. Chosen so the common case
 * (sessions with ~100+ tickets — see perf audit Q4) is fully covered:
 * a member editing any of their session's tickets still gets realtime
 * within this window, no edit blind spot. The rare 1000+ tail is served
 * by cursor pagination (loadMoreFeedback) for the deep, non-realtime
 * portion. Bounding the listener also caps the per-write re-download
 * that the unbounded query previously incurred on every ticket change.
 */
const FEEDBACK_LISTENER_LIMIT = 500;

interface FeedbackEntry {
  state: FeedbackState;
  unsubscribe: (() => void) | null;
  retainCount: number;
  workspaceId: string | null;
  /** Raw listener-window list (live), kept separate from the composed
   *  state.feedback so re-composing with the tail is deterministic. */
  windowList: Feedback[];
  /** Oldest doc the listener window currently holds — cursor for loadMore. */
  lastWindowDoc: QueryDocumentSnapshot<DocumentData> | null;
  /** True if the listener window is full (count === limit) — more may exist. */
  mayHaveMore: boolean;
  /** Appended pages from loadMoreFeedback (older than the listener window). */
  paginatedTail: Feedback[];
  /** Cursor for the next loadMore page. */
  tailCursor: QueryDocumentSnapshot<DocumentData> | null;
  tailExhausted: boolean;
  /** True once the bundle seeded first paint, so the listener's first
   *  snapshot replaces (not flickers) the seed. */
  bundleSeeded: boolean;
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
    e = {
      state: initialState(),
      unsubscribe: null,
      retainCount: 0,
      workspaceId: null,
      windowList: [],
      lastWindowDoc: null,
      mayHaveMore: false,
      paginatedTail: [],
      tailCursor: null,
      tailExhausted: false,
      bundleSeeded: false,
    };
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
    lastCommentByUid:
      typeof data.lastCommentByUid === "string" ? data.lastCommentByUid : null,
    lastCommentByName:
      typeof data.lastCommentByName === "string" ? data.lastCommentByName : null,
    consoleLogs: Array.isArray(data.consoleLogs)
      ? (data.consoleLogs as Feedback["consoleLogs"])
      : undefined,
    exceptions: Array.isArray(data.exceptions)
      ? (data.exceptions as Feedback["exceptions"])
      : undefined,
    consoleLogCount:
      typeof data.consoleLogCount === "number" ? data.consoleLogCount : undefined,
    exceptionCount:
      typeof data.exceptionCount === "number" ? data.exceptionCount : undefined,
    errorCount: typeof data.errorCount === "number" ? data.errorCount : undefined,
    warningCount:
      typeof data.warningCount === "number" ? data.warningCount : undefined,
    networkRequests: Array.isArray(data.networkRequests)
      ? (data.networkRequests as Feedback["networkRequests"])
      : undefined,
    networkRequestCount:
      typeof data.networkRequestCount === "number" ? data.networkRequestCount : undefined,
    networkErrorCount:
      typeof data.networkErrorCount === "number" ? data.networkErrorCount : undefined,
    userActions: Array.isArray(data.userActions)
      ? (data.userActions as Feedback["userActions"])
      : undefined,
    userActionCount:
      typeof data.userActionCount === "number" ? data.userActionCount : undefined,
    // AI Analysis: this is the path that auto-fills the open ticket's panel. The
    // analyze route writes ai* back to feedback/{id}; this onSnapshot tick maps
    // them onto the live Feedback object a beat after the ticket opens.
    aiSummary: typeof data.aiSummary === "string" ? data.aiSummary : null,
    aiFixSuggestion:
      typeof data.aiFixSuggestion === "string" ? data.aiFixSuggestion : null,
    aiCause: typeof data.aiCause === "string" ? data.aiCause : null,
    aiFixSteps:
      Array.isArray(data.aiFixSteps) &&
      data.aiFixSteps.every((s) => typeof s === "string")
        ? (data.aiFixSteps as string[])
        : null,
    aiConfidence:
      typeof data.aiConfidence === "number" ? data.aiConfidence : null,
    aiAnalysisStatus:
      data.aiAnalysisStatus === "pending" ||
      data.aiAnalysisStatus === "complete" ||
      data.aiAnalysisStatus === "no_fault" ||
      data.aiAnalysisStatus === "error"
        ? data.aiAnalysisStatus
        : null,
    aiGeneratedAt: asTimestamp(data.aiGeneratedAt),
  };
}

/** newest createdAt-desc first, id tiebreaker — single source of order. */
function sortFeedbackDesc(list: Feedback[]): Feedback[] {
  return list.sort((a, b) => {
    const diff = getMillis(b.createdAt) - getMillis(a.createdAt);
    if (diff !== 0) return diff;
    return b.id.localeCompare(a.id);
  });
}

/** Compose the listener window with any paginated older tail, de-duped. */
function composeFeedback(e: FeedbackEntry, windowList: Feedback[]): Feedback[] {
  if (e.paginatedTail.length === 0) return sortFeedbackDesc(windowList);
  const byId = new Map<string, Feedback>();
  // Listener window wins over tail for any overlap (it's the live copy).
  for (const f of e.paginatedTail) byId.set(f.id, f);
  for (const f of windowList) byId.set(f.id, f);
  return sortFeedbackDesc([...byId.values()]);
}

function attachListener(sessionId: string, workspaceId: string) {
  const e = getOrCreateEntry(sessionId);
  if (e.unsubscribe) return;
  e.workspaceId = workspaceId;

  const q = query(
    collection(db, "feedback"),
    where("sessionId", "==", sessionId),
    where("workspaceId", "==", workspaceId),
    orderBy("createdAt", "desc"),
    limit(FEEDBACK_LISTENER_LIMIT)
  );

  const unsub = onSnapshot(
    q,
    (snap) => {
      try {
        const list: Feedback[] = [];
        let lastDoc: QueryDocumentSnapshot<DocumentData> | null = null;
        snap.forEach((doc) => {
          lastDoc = doc;
          const f = mapFeedbackFromSnap(doc);
          if (f) list.push(f);
        });
        sortFeedbackDesc(list);
        // Track the window edge so loadMoreFeedback can page past it, and
        // whether the window is full (more docs may exist beyond it).
        e.windowList = list;
        e.lastWindowDoc = lastDoc;
        e.mayHaveMore = snap.size === FEEDBACK_LISTENER_LIMIT;
        e.bundleSeeded = false; // listener is now authoritative
        setState(sessionId, {
          feedback: composeFeedback(e, list),
          loading: false,
          error: null,
        });
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
    e.windowList = [];
    e.lastWindowDoc = null;
    e.mayHaveMore = false;
    e.paginatedTail = [];
    e.tailCursor = null;
    e.tailExhausted = false;
    e.bundleSeeded = false;
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

/**
 * Phase 2.1 — seed first paint from the session-page bundle for
 * listener-mode viewers (workspace members). Mirrors
 * hydrateSessionFromBundle: it fills the store synchronously so the
 * ticket list paints without waiting for the first onSnapshot tick,
 * then the realtime listener replaces it on attach.
 *
 * Guard: if a listener is already active it is authoritative — don't
 * clobber live data with a (possibly staler) bundle snapshot.
 */
export function hydrateFeedbackFromBundle(
  sessionId: string,
  feedback: Feedback[]
): void {
  const sid = typeof sessionId === "string" ? sessionId.trim() : "";
  if (!sid || !Array.isArray(feedback) || feedback.length === 0) return;
  const e = getOrCreateEntry(sid);
  // Listener already supplying data, or a prior seed present → skip.
  if (e.unsubscribe || e.bundleSeeded || e.state.feedback.length > 0) return;
  e.bundleSeeded = true;
  e.state = {
    ...e.state,
    feedback: sortFeedbackDesc([...feedback]),
    loading: false,
    error: null,
    version: e.state.version + 1,
  };
  emitFor(sid);
}

/**
 * Phase 2.2 — page past the realtime window for the rare deep tail
 * (sessions beyond FEEDBACK_LISTENER_LIMIT). These pages are NOT
 * realtime (the listener only watches the newest window); they are a
 * one-shot read appended below the live window.
 *
 * Returns true if a page was loaded, false if exhausted / unavailable.
 */
export async function loadMoreFeedback(sessionId: string): Promise<boolean> {
  const sid = typeof sessionId === "string" ? sessionId.trim() : "";
  if (!sid) return false;
  const e = entries.get(sid);
  if (!e || !e.workspaceId || e.tailExhausted) return false;

  // Cursor: continue from the last tail page, else from the listener edge.
  const cursorDoc = e.tailCursor ?? e.lastWindowDoc;
  if (!cursorDoc) return false;
  // Nothing beyond the window and we've never paged → no tail to load.
  if (e.tailCursor === null && !e.mayHaveMore) return false;

  const moreQ = query(
    collection(db, "feedback"),
    where("sessionId", "==", sid),
    where("workspaceId", "==", e.workspaceId),
    orderBy("createdAt", "desc"),
    startAfter(cursorDoc),
    limit(FEEDBACK_LISTENER_LIMIT)
  );

  try {
    const snap = await getDocs(moreQ);
    if (snap.empty) {
      e.tailExhausted = true;
      return false;
    }
    const page: Feedback[] = [];
    let last: QueryDocumentSnapshot<DocumentData> | null = null;
    snap.forEach((doc) => {
      last = doc;
      const f = mapFeedbackFromSnap(doc);
      if (f) page.push(f);
    });
    e.tailCursor = last;
    if (snap.size < FEEDBACK_LISTENER_LIMIT) e.tailExhausted = true;

    // Merge into the persisted tail (de-dupe by id), then re-emit the
    // composed list (live window + full tail).
    const tailById = new Map<string, Feedback>();
    for (const f of e.paginatedTail) tailById.set(f.id, f);
    for (const f of page) tailById.set(f.id, f);
    e.paginatedTail = sortFeedbackDesc([...tailById.values()]);

    setState(sid, { feedback: composeFeedback(e, e.windowList) });
    return true;
  } catch {
    return false;
  }
}

/** Whether a deep (non-realtime) tail page may still be loadable. */
export function feedbackHasMoreTail(sessionId: string): boolean {
  const e = entries.get(typeof sessionId === "string" ? sessionId.trim() : "");
  if (!e) return false;
  if (e.tailExhausted) return false;
  return e.mayHaveMore || e.tailCursor !== null;
}
