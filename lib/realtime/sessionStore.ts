"use client";

import { useSyncExternalStore } from "react";
import { doc, onSnapshot, Timestamp, type DocumentData } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { requireAccessLevel } from "@/lib/domain/accessLevel";
import { requireGeneralAccess, type Session } from "@/lib/domain/session";
import {
  recordListenerAttach,
  recordListenerDetach,
  recordListenerError,
  recordListenerUpdate,
} from "@/lib/observability/listenerEvents";

export interface SessionState {
  session: Session | null;
  loading: boolean;
  error: Error | null;
  /** True until the listener confirms the doc no longer exists. UI uses this to detect deletion. */
  exists: boolean;
  /** Set true when a permission-denied error occurs AFTER initial load — signals mid-view access revocation. */
  accessRevoked: boolean;
  version: number;
}

interface SessionEntry {
  state: SessionState;
  unsubscribe: (() => void) | null;
  retainCount: number;
  workspaceId: string | null;
}

const initialState = (): SessionState => ({
  session: null,
  loading: true,
  error: null,
  exists: true,
  accessRevoked: false,
  version: 0,
});

const EMPTY_SESSION_STATE: SessionState = Object.freeze({
  session: null,
  loading: true,
  error: null,
  exists: true,
  accessRevoked: false,
  version: 0,
}) as SessionState;

const entries = new Map<string, SessionEntry>();
const listenersBySession = new Map<string, Set<() => void>>();

function getOrCreateEntry(sessionId: string): SessionEntry {
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

function setState(sessionId: string, patch: Partial<SessionState>) {
  const e = getOrCreateEntry(sessionId);
  e.state = { ...e.state, ...patch, version: e.state.version + 1 };
  emitFor(sessionId);
}

function timestampToIso(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Timestamp) return value.toDate().toISOString();
  const v = value as { toMillis?: () => number; toDate?: () => Date };
  if (typeof v.toMillis === "function") return new Date(v.toMillis()).toISOString();
  if (typeof v.toDate === "function") return v.toDate().toISOString();
  return null;
}

function asNumberOrNull(value: unknown): number | null {
  return typeof value === "number" && !Number.isNaN(value) ? value : null;
}

/**
 * Mirror of {@link serializeSession} so the listener-emitted Session matches the bundle exactly.
 * Any divergence here causes a first-tick flicker after the listener attaches over the bundle.
 */
function mapSessionFromSnap(sessionId: string, data: DocumentData): Session {
  const archived = data.isArchived === true || data.archived === true;
  const totalCount =
    typeof data.totalCount === "number"
      ? data.totalCount
      : typeof data.feedbackCount === "number"
        ? data.feedbackCount
        : null;

  return {
    id: sessionId,
    title: typeof data.title === "string" ? data.title : "",
    accessLevel: requireAccessLevel(data.accessLevel),
    generalAccess: requireGeneralAccess(data.generalAccess),
    hasConfiguredShare: data.hasConfiguredShare === true,
    workspaceId: typeof data.workspaceId === "string" ? data.workspaceId : "",
    createdByUserId:
      typeof data.createdByUserId === "string" ? data.createdByUserId : "",
    archived,
    isArchived: archived,
    createdAt: timestampToIso(data.createdAt),
    updatedAt: timestampToIso(data.updatedAt),
    viewCount: asNumberOrNull(data.viewCount) ?? undefined,
    recentViewers: Array.isArray(data.recentViewers) ? data.recentViewers : [],
    commentCount: asNumberOrNull(data.commentCount) ?? undefined,
    openCount: asNumberOrNull(data.openCount) ?? undefined,
    resolvedCount: asNumberOrNull(data.resolvedCount) ?? undefined,
    totalCount: totalCount ?? undefined,
    feedbackCount: asNumberOrNull(data.feedbackCount) ?? undefined,
  } as Session;
}

function attachListener(sessionId: string, workspaceId: string) {
  const e = getOrCreateEntry(sessionId);
  if (e.unsubscribe) return;
  e.workspaceId = workspaceId;

  const unsub = onSnapshot(
    doc(db, "sessions", sessionId),
    (snap) => {
      if (!snap.exists()) {
        setState(sessionId, {
          session: null,
          exists: false,
          loading: false,
          error: null,
        });
        recordListenerUpdate("session", sessionId, { exists: false });
        return;
      }
      try {
        const s = mapSessionFromSnap(sessionId, snap.data());
        setState(sessionId, {
          session: s,
          exists: true,
          loading: false,
          error: null,
        });
        recordListenerUpdate("session", sessionId, { exists: true });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState(sessionId, { error, loading: false });
        recordListenerError("session", sessionId, error);
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
      recordListenerError("session", sessionId, error);
    }
  );

  e.unsubscribe = unsub;
  recordListenerAttach("session", sessionId, { workspaceId });
}

function detachListener(sessionId: string) {
  const e = entries.get(sessionId);
  if (!e?.unsubscribe) return;
  e.unsubscribe();
  e.unsubscribe = null;
  recordListenerDetach("session", sessionId);
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

// Module-init auth observer: closes the race where a sign-out fires while a
// hydrateSessionFromBundle call is in flight before any retain has happened.
if (typeof window !== "undefined") {
  onAuthStateChanged(auth, (user) => {
    if (!user) tearDownAllOnSignOut();
  });
}

/**
 * Increment retain count and ensure `sessions/{sessionId}` is listened to.
 * Always call the returned function on unmount so other surfaces (if any) keep the listener alive.
 */
export function retainSessionListener(
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

/**
 * First-paint hydration: seed the store synchronously from the bundle's session field
 * BEFORE the listener attaches, so back-navigation feels instant.
 * Skipped if a listener is already live and has a session (avoid clobbering fresher data).
 */
export function hydrateSessionFromBundle(
  sessionId: string,
  sessionDoc: Session
): void {
  const sid = typeof sessionId === "string" ? sessionId.trim() : "";
  if (!sid || !sessionDoc) return;
  const e = getOrCreateEntry(sid);
  if (e.unsubscribe && e.state.session) return;
  e.state = {
    ...e.state,
    session: sessionDoc,
    loading: false,
    error: null,
    exists: true,
    version: e.state.version + 1,
  };
  emitFor(sid);
}

export function getSessionSnapshot(sessionId: string): SessionState {
  return entries.get(sessionId)?.state ?? EMPTY_SESSION_STATE;
}

export function subscribeToSession(
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

export function useSessionStore(sessionId: string): SessionState {
  const subscribe = (l: () => void) => subscribeToSession(sessionId, l);
  const get = () => getSessionSnapshot(sessionId);
  return useSyncExternalStore(subscribe, get, get);
}
