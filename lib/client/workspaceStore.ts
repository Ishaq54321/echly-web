"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/authFetch";
import type { Session } from "@/lib/domain/session";
import { sessionsListBootstrapFromApiPayload } from "@/lib/domain/session";
import { requireApiSuccessData } from "@/lib/api/apiEnvelope";
import type { SessionFeedbackCounts } from "@/lib/domain/session";
import {
  assertIdentityResolved,
  useWorkspace,
} from "@/lib/client/workspaceContext";
import { SESSION_FEEDBACK_PATH } from "@/utils/getSessionLink";

const SESSIONS_CACHE_PREFIX = "echly_sessions";

/** Skip GET /api/sessions (first page) when a fresh snapshot exists for this uid. */
const WORKSPACE_SESSIONS_TTL_MS = 45_000;

function sessionsCacheKey(uid: string): string {
  return `${SESSIONS_CACHE_PREFIX}:${uid}`;
}

function filterSessionsByView(sessions: Session[], archivedOnly: boolean): Session[] {
  if (!archivedOnly) return sessions;
  return sessions.filter((s) => (s.isArchived ?? s.archived) === true);
}

function readCachedSessions(uid: string): Session[] | null {
  if (!uid) return null;
  try {
    const cached = sessionStorage.getItem(sessionsCacheKey(uid));
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    return Array.isArray(parsed) ? (parsed as Session[]) : null;
  } catch {
    return null;
  }
}

function writeCachedSessions(uid: string, sessions: Session[]) {
  if (!uid) return;
  try {
    sessionStorage.setItem(sessionsCacheKey(uid), JSON.stringify(sessions));
  } catch {
    // Ignore cache write errors (private mode/quota).
  }
}

type SessionsBootstrapResult =
  | { ok: true; sessions: Session[]; hasMore: boolean; nextCursor: string | null }
  | { ok: false };

type ListSnapshot = {
  sessions: Session[];
  hasMore: boolean;
  nextCursor: string | null;
  /** Time of last successful GET /api/sessions (no cursor). Used for TTL only. */
  lastBootstrapFetchAt: number;
};

const listSnapshotByUid = new Map<string, ListSnapshot>();

const sessionsBootstrapPromiseByUid = new Map<string, Promise<SessionsBootstrapResult>>();

let lastSessionsBootstrapUid: string | null = null;

function normalizeSessionList(list: Session[]): Session[] {
  return list.map((s) => {
    const archived = (s.archived ?? s.isArchived) === true;
    return { ...s, archived, isArchived: archived };
  });
}

async function fetchSessionsBootstrapFromNetwork(): Promise<SessionsBootstrapResult> {
  try {
    const res = await authFetch("/api/sessions", { cache: "no-store" });
    if (!res?.ok) return { ok: false };
    const data = await res.json().catch(() => null);
    if (data === null) return { ok: false };
    const { sessions: list, hasMore, nextCursor } = sessionsListBootstrapFromApiPayload(data);
    const next = normalizeSessionList(list);
    return { ok: true, sessions: next, hasMore, nextCursor };
  } catch {
    return { ok: false };
  }
}

async function resolveSessionsBootstrap(
  uid: string,
  force: boolean
): Promise<SessionsBootstrapResult> {
  if (!force) {
    const snap = listSnapshotByUid.get(uid);
    if (
      snap &&
      Date.now() - snap.lastBootstrapFetchAt < WORKSPACE_SESSIONS_TTL_MS &&
      snap.sessions.length > 0
    ) {
      return {
        ok: true,
        sessions: snap.sessions,
        hasMore: snap.hasMore,
        nextCursor: snap.nextCursor,
      };
    }
  }

  const net = await fetchSessionsBootstrapFromNetwork();
  if (net.ok) {
    listSnapshotByUid.set(uid, {
      sessions: net.sessions,
      hasMore: net.hasMore,
      nextCursor: net.nextCursor,
      lastBootstrapFetchAt: Date.now(),
    });
  }
  return net;
}

function patchListSnapshot(
  uid: string,
  patch: Partial<Pick<ListSnapshot, "sessions" | "hasMore" | "nextCursor">>
) {
  const prev = listSnapshotByUid.get(uid);
  if (!prev) return;
  listSnapshotByUid.set(uid, {
    ...prev,
    ...patch,
  });
}

/** Ticket counts from `sessions/{id}` denormalized fields / API session list. */
export function countsFromSessionFields(session: Session): SessionFeedbackCounts {
  const open = session.openCount ?? 0;
  const resolved = session.resolvedCount ?? 0;
  const total =
    typeof session.totalCount === "number"
      ? session.totalCount
      : typeof session.feedbackCount === "number"
        ? session.feedbackCount
        : 0;
  return { total, open, resolved };
}

export interface SessionWithCounts {
  session: Session;
  counts: SessionFeedbackCounts;
}

export type ViewMode = "all" | "archived";

function useWorkspaceStoreState(viewMode: ViewMode = "all") {
  const { claimsReady, authUid, isIdentityResolved, isIdentityReady } = useWorkspace();
  const router = useRouter();
  const userIdRef = useRef<string | null>(null);
  const allSessionsRef = useRef<Session[]>([]);
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [awaitingSessions, setAwaitingSessions] = useState(false);
  const [hasMoreSessions, setHasMoreSessions] = useState(false);
  const [loadingMoreSessions, setLoadingMoreSessions] = useState(false);
  const sessionsSourceUserRef = useRef<string | null>(null);
  const nextCursorRef = useRef<string | null>(null);
  const bootstrapInFlightRef = useRef<Promise<SessionsBootstrapResult> | null>(null);
  const bootstrapCompletedRef = useRef(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null);
  const userId = authUid;

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    allSessionsRef.current = allSessions;
  }, [allSessions]);

  useEffect(() => {
    bootstrapCompletedRef.current = false;
    bootstrapInFlightRef.current = null;
  }, [userId]);

  const archivedOnly = viewMode === "archived";

  const refreshSessions = useCallback(async () => {
    const uid = userIdRef.current;
    if (!uid || !isIdentityReady) return;
    setAwaitingSessions(true);
    setFetchError(null);
    nextCursorRef.current = null;
    setHasMoreSessions(false);
    setLoadingMoreSessions(false);
    try {
      const result = await resolveSessionsBootstrap(uid, true);
      if (!result.ok) {
        setFetchError("Could not load sessions.");
        setAwaitingSessions(false);
        return;
      }
      nextCursorRef.current = result.hasMore ? result.nextCursor : null;
      setHasMoreSessions(result.hasMore);
      sessionsSourceUserRef.current = uid;
      setAllSessions(result.sessions);
      setLastFetchedAt(Date.now());
      writeCachedSessions(uid, result.sessions);
      sessionsBootstrapPromiseByUid.set(
        uid,
        Promise.resolve({
          ok: true,
          sessions: result.sessions,
          hasMore: result.hasMore,
          nextCursor: result.nextCursor,
        })
      );
    } catch (e) {
      console.error("[ECHLY] refreshSessions failed", e);
      setFetchError("Could not load sessions.");
    } finally {
      setAwaitingSessions(false);
    }
  }, [isIdentityReady]);

  /**
   * Ensures first-page session list is loaded; respects TTL unless `force` is true.
   * Mutations and pagination update in-memory snapshot via the same uid map.
   */
  const fetchSessions = useCallback(
    async (opts?: { force?: boolean }) => {
      const uid = userIdRef.current;
      if (!uid || !isIdentityReady) return;
      const force = opts?.force === true;
      setFetchError(null);
      setAwaitingSessions(true);
      try {
        const result = await resolveSessionsBootstrap(uid, force);
        if (!result.ok) {
          setFetchError("Could not load sessions.");
          return;
        }
        nextCursorRef.current = result.hasMore ? result.nextCursor : null;
        setHasMoreSessions(result.hasMore);
        sessionsSourceUserRef.current = uid;
        setAllSessions(result.sessions);
        setLastFetchedAt(Date.now());
        writeCachedSessions(uid, result.sessions);
      } catch (e) {
        console.error("[ECHLY] fetchSessions failed", e);
        setFetchError("Could not load sessions.");
      } finally {
        setAwaitingSessions(false);
      }
    },
    [isIdentityReady]
  );

  useEffect(() => {
    if (!userId) {
      sessionsBootstrapPromiseByUid.clear();
      lastSessionsBootstrapUid = null;
      sessionsSourceUserRef.current = null;
      setAwaitingSessions(false);
      setHasMoreSessions(false);
      setLoadingMoreSessions(false);
      setFetchError(null);
      setLastFetchedAt(null);
      nextCursorRef.current = null;
      return;
    }

    const uid = userId;

    if (lastSessionsBootstrapUid !== uid) {
      if (lastSessionsBootstrapUid) {
        sessionsBootstrapPromiseByUid.delete(lastSessionsBootstrapUid);
      }
      lastSessionsBootstrapUid = uid;
    }

    if (!isIdentityReady) {
      setAwaitingSessions(true);
      return;
    }

    sessionsSourceUserRef.current = uid;
    const cached = readCachedSessions(uid);
    if (Array.isArray(cached) && cached.length > 0) {
      setAllSessions(cached);
    } else {
      setAllSessions([]);
    }

    if (bootstrapCompletedRef.current) {
      setAwaitingSessions(false);
      return;
    }

    if (bootstrapInFlightRef.current) {
      return;
    }

    let bootstrapPromise = sessionsBootstrapPromiseByUid.get(uid);
    if (!bootstrapPromise) {
      const promise = (async () => {
        try {
          return await resolveSessionsBootstrap(uid, false);
        } catch (e) {
          console.error("[ECHLY] workspace sessions bootstrap failed", e);
          throw e;
        }
      })();
      bootstrapPromise = promise.then((r) => {
        if (!r.ok) sessionsBootstrapPromiseByUid.delete(uid);
        return r;
      });
      sessionsBootstrapPromiseByUid.set(uid, bootstrapPromise);
    }

    bootstrapInFlightRef.current = bootstrapPromise;

    bootstrapPromise
      .then((result) => {
        if (result && result.ok) {
          bootstrapCompletedRef.current = true;
        } else {
          bootstrapInFlightRef.current = null;
        }
      })
      .catch(() => {
        bootstrapInFlightRef.current = null;
      });

    setAwaitingSessions(true);
    setHasMoreSessions(false);
    setLoadingMoreSessions(false);
    nextCursorRef.current = null;

    let cancelled = false;

    void (async () => {
      try {
        const result = await bootstrapPromise;
        if (cancelled) return;
        if (userIdRef.current !== uid) return;
        if (!result.ok) {
          setFetchError("Could not load sessions.");
          setAwaitingSessions(false);
          return;
        }
        setFetchError(null);
        nextCursorRef.current = result.hasMore ? result.nextCursor : null;
        setHasMoreSessions(result.hasMore);
        sessionsSourceUserRef.current = uid;
        setAllSessions(result.sessions);
        setLastFetchedAt(Date.now());
        writeCachedSessions(uid, result.sessions);
      } catch (e) {
        if (cancelled) return;
        console.error("[ECHLY] GET /api/sessions failed", e);
        setFetchError("Could not load sessions.");
        sessionsBootstrapPromiseByUid.delete(uid);
        bootstrapInFlightRef.current = null;
      } finally {
        if (!cancelled) setAwaitingSessions(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, isIdentityReady]);

  const loadMoreSessions = useCallback(async () => {
    const uid = userIdRef.current;
    if (!uid || !isIdentityReady) return;
    if (loadingMoreSessions) return;
    const cursor = nextCursorRef.current;
    if (!cursor) return;
    setLoadingMoreSessions(true);
    try {
      const res = await authFetch(`/api/sessions?cursor=${encodeURIComponent(cursor)}`, {
        cache: "no-store",
      });
      if (!res?.ok) return;
      const data = await res.json().catch(() => null);
      if (data === null) return;
      const { sessions: pageSessions, hasMore: nextHasMoreFlag, nextCursor: nextCursorVal } =
        sessionsListBootstrapFromApiPayload(data);
      const incoming = normalizeSessionList(pageSessions);
      nextCursorRef.current = nextCursorVal;
      setHasMoreSessions(nextHasMoreFlag);
      setAllSessions((prev) => {
        const merged = [...prev, ...incoming];
        const dedupedById = new Map<string, Session>();
        for (const session of merged) {
          dedupedById.set(session.id, session);
        }
        const next = Array.from(dedupedById.values());
        writeCachedSessions(uid, next);
        patchListSnapshot(uid, {
          sessions: next,
          hasMore: nextHasMoreFlag,
          nextCursor: nextCursorVal,
        });
        return next;
      });
    } catch (e) {
      console.error("[ECHLY] loadMoreSessions failed", e);
    } finally {
      setLoadingMoreSessions(false);
    }
  }, [isIdentityReady, loadingMoreSessions]);

  const overviewDataAligned = Boolean(userId) && sessionsSourceUserRef.current === userId;

  const allSessionsForView = overviewDataAligned ? allSessions : [];

  const sessions = filterSessionsByView(allSessionsForView, archivedOnly);

  const sessionsWithCounts: SessionWithCounts[] = sessions.map((session) => ({
    session,
    counts: countsFromSessionFields(session),
  }));

  const handleCreateSession = useCallback(
    async (
      onPlanLimitReached?: (payload: { message: string; upgradePlan: string | null }) => void
    ) => {
      assertIdentityResolved(isIdentityResolved);
      if (!claimsReady || !userIdRef.current) return;
      const uid = userIdRef.current;
      const tempSessionId = `temp-${Date.now()}`;
      const tempSession: Session = {
        id: tempSessionId,
        title: "Untitled Session",
        workspaceId: "",
        createdByUserId: uid,
        accessLevel: "view",
        generalAccess: "restricted",
        createdAt: new Date(),
        updatedAt: new Date(),
        isOptimistic: true,
        openCount: 0,
        resolvedCount: 0,
        totalCount: 0,
        feedbackCount: 0,
      };
      setAllSessions((prev) => {
        const next = [tempSession, ...prev];
        if (uid) {
          writeCachedSessions(uid, next);
          patchListSnapshot(uid, { sessions: next });
        }
        return next;
      });

      try {
        const res = await authFetch("/api/sessions", { method: "POST" });
        if (!res) {
          setAllSessions((prev) => prev.filter((s) => s.id !== tempSessionId));
          return;
        }
        const data = await res.json().catch((err: unknown) => {
          console.error("[ECHLY] JSON parse failed", err);
          return {};
        });

        if (res.status === 403) {
          setAllSessions((prev) => prev.filter((s) => s.id !== tempSessionId));
          const err = data.error as { code?: string; message?: string } | undefined;
          const limitData = data.data as { upgradePlan?: string | null } | null | undefined;
          const isPlanLimit =
            data.success === false &&
            err?.code === "FORBIDDEN" &&
            limitData &&
            "upgradePlan" in limitData;
          if (isPlanLimit) {
            onPlanLimitReached?.({
              message: err?.message ?? "You've reached your plan limit.",
              upgradePlan: limitData.upgradePlan ?? "starter",
            });
            return;
          }
          if (err?.code === "FORBIDDEN" && err?.message === "Workspace suspended") {
            onPlanLimitReached?.({
              message: err.message ?? "Workspace suspended. Contact support.",
              upgradePlan: null,
            });
            return;
          }

          onPlanLimitReached?.({
            message:
              (err && typeof err.message === "string" && err.message) ||
              "You don't have permission to create a session.",
            upgradePlan: limitData?.upgradePlan ?? null,
          });
          return;
        }

        if (!res.ok) {
          setAllSessions((prev) => prev.filter((s) => s.id !== tempSessionId));
          console.error("[ECHLY] Create session failed", res.status, data);
          return;
        }

        let newSessionId: string;
        try {
          const inner = requireApiSuccessData<{ session: { id: string } }>(data);
          newSessionId = inner.session.id;
        } catch {
          setAllSessions((prev) => prev.filter((s) => s.id !== tempSessionId));
          return;
        }
        if (!newSessionId) {
          setAllSessions((prev) => prev.filter((s) => s.id !== tempSessionId));
          return;
        }

        setAllSessions((prev) => {
          const next = prev.map((s) =>
            s.id === tempSessionId
              ? {
                  ...s,
                  id: newSessionId,
                  isOptimistic: false,
                  updatedAt: new Date(),
                }
              : s
          );
          if (uid) {
            writeCachedSessions(uid, next);
            patchListSnapshot(uid, { sessions: next });
          }
          return next;
        });

        router.push(`${SESSION_FEEDBACK_PATH}/${newSessionId}`);
      } catch (err) {
        setAllSessions((prev) => prev.filter((s) => s.id !== tempSessionId));
        console.error("[ECHLY] Create session failed", err);
      }
    },
    [claimsReady, isIdentityResolved, router]
  );

  const updateSession = useCallback((sessionId: string, patch: Partial<Session>) => {
    const uid = userIdRef.current;
    setAllSessions((prev) => {
      const next = prev.map((s) => (s.id === sessionId ? { ...s, ...patch } : s));
      if (uid) {
        writeCachedSessions(uid, next);
        patchListSnapshot(uid, { sessions: next });
      }
      return next;
    });
  }, []);

  const uidForCache = () => userIdRef.current;

  const setSessionArchived = useCallback(
    async (sessionId: string, archived: boolean) => {
      if (!sessionId) return;
      assertIdentityResolved(isIdentityResolved);
      const uid = uidForCache();

      let hasRollback = false;
      let rollbackArchived = false;
      setAllSessions((prev) => {
        const current = prev.find((s) => s.id === sessionId) ?? null;
        if (current) {
          hasRollback = true;
          rollbackArchived = (current.isArchived ?? current.archived) === true;
        }
        const next = prev.map((s) =>
          s.id === sessionId ? { ...s, archived, isArchived: archived } : s
        );
        if (uid) {
          writeCachedSessions(uid, next);
          patchListSnapshot(uid, { sessions: next });
        }
        return next;
      });

      try {
        const res = await authFetch(`/api/sessions/${sessionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ archived, isArchived: archived }),
        });
        if (!res) {
          if (hasRollback) {
            setAllSessions((prev) => {
              const next = prev.map((s) =>
                s.id === sessionId ? { ...s, archived: rollbackArchived, isArchived: rollbackArchived } : s
              );
              if (uid) {
                writeCachedSessions(uid, next);
                patchListSnapshot(uid, { sessions: next });
              }
              return next;
            });
          }
          return;
        }
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const msg =
            data &&
            typeof data === "object" &&
            data.error &&
            typeof (data.error as { message?: string }).message === "string"
              ? (data.error as { message: string }).message
              : null;
          throw new Error(msg || `Archive update failed: ${res.status}`);
        }
      } catch (err) {
        if (hasRollback) {
          setAllSessions((prev) => {
            const next = prev.map((s) =>
              s.id === sessionId ? { ...s, archived: rollbackArchived, isArchived: rollbackArchived } : s
            );
            if (uid) {
              writeCachedSessions(uid, next);
              patchListSnapshot(uid, { sessions: next });
            }
            return next;
          });
        }
        console.error("[ECHLY] setSessionArchived failed", err);
        throw err;
      }
    },
    [isIdentityResolved]
  );

  const removeSession = useCallback((sessionId: string) => {
    const uid = userIdRef.current;
    setAllSessions((prev) => {
      const next = prev.filter((s) => s.id !== sessionId);
      if (uid) {
        writeCachedSessions(uid, next);
        patchListSnapshot(uid, { sessions: next });
      }
      return next;
    });
  }, []);

  const deleteSession = useCallback(
    async (session: Session) => {
      assertIdentityResolved(isIdentityResolved);
      const sessionId = session.id;
      const uid = uidForCache();
      setAllSessions((prev) => {
        const next = prev.filter((s) => s.id !== sessionId);
        if (uid) {
          writeCachedSessions(uid, next);
          patchListSnapshot(uid, { sessions: next });
        }
        return next;
      });
      try {
        const res = await authFetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
        if (!res) {
          setAllSessions((prev) => {
            const next = [session, ...prev];
            if (uid) {
              writeCachedSessions(uid, next);
              patchListSnapshot(uid, { sessions: next });
            }
            return next;
          });
          return;
        }
        if (!res.ok) {
          const data = await res.json().catch((err: unknown) => {
            console.error("[ECHLY] JSON parse failed", err);
            return {};
          });
          const delMsg =
            data &&
            typeof data === "object" &&
            data.error &&
            typeof (data.error as { message?: string }).message === "string"
              ? (data.error as { message: string }).message
              : null;
          throw new Error(delMsg || "Failed to delete session");
        }
      } catch (err) {
        setAllSessions((prev) => {
          const next = [session, ...prev];
          if (uid) {
            writeCachedSessions(uid, next);
            patchListSnapshot(uid, { sessions: next });
          }
          return next;
        });
        console.error("[ECHLY] Delete session failed", err);
        throw err;
      }
    },
    [isIdentityResolved]
  );

  return {
    sessions: sessionsWithCounts,
    loading: overviewDataAligned ? awaitingSessions : true,
    isCountsReady: overviewDataAligned ? true : false,
    hasMoreSessions,
    loadingMoreSessions,
    loadMoreSessions,
    handleCreateSession,
    refreshSessions,
    fetchSessions,
    updateSession,
    setSessionArchived,
    removeSession,
    deleteSession,
    error: fetchError,
    lastFetchedAt,
  };
}

type WorkspaceStoreValue = ReturnType<typeof useWorkspaceStoreState>;

const WorkspaceStoreContext = createContext<WorkspaceStoreValue | null>(null);

/**
 * One session-list subscription for the signed-in app shell (GET /api/sessions once per TTL).
 */
export function WorkspaceStoreProvider({ children }: { children: ReactNode }) {
  const {
    sessions,
    loading,
    isCountsReady,
    hasMoreSessions,
    loadingMoreSessions,
    loadMoreSessions,
    handleCreateSession,
    refreshSessions,
    fetchSessions,
    updateSession,
    setSessionArchived,
    removeSession,
    deleteSession,
    error,
    lastFetchedAt,
  } = useWorkspaceStoreState("all");

  // PERF R-004: memoize context value so consumers only re-render when the
  // specific field they use actually changes, not on every provider render.
  // All function fields are already useCallback-wrapped inside useWorkspaceStoreState,
  // so they are stable references and will not cause spurious re-renders.
  const value = useMemo(
    () => ({
      sessions,
      loading,
      isCountsReady,
      hasMoreSessions,
      loadingMoreSessions,
      loadMoreSessions,
      handleCreateSession,
      refreshSessions,
      fetchSessions,
      updateSession,
      setSessionArchived,
      removeSession,
      deleteSession,
      error,
      lastFetchedAt,
    }),
    [
      sessions,
      loading,
      isCountsReady,
      hasMoreSessions,
      loadingMoreSessions,
      loadMoreSessions,
      handleCreateSession,
      refreshSessions,
      fetchSessions,
      updateSession,
      setSessionArchived,
      removeSession,
      deleteSession,
      error,
      lastFetchedAt,
    ]
  );

  return React.createElement(WorkspaceStoreContext.Provider, { value }, children);
}

export function useWorkspaceStore(): WorkspaceStoreValue {
  const ctx = useContext(WorkspaceStoreContext);
  if (!ctx) {
    throw new Error("useWorkspaceStore must be used within WorkspaceStoreProvider");
  }
  return ctx;
}
