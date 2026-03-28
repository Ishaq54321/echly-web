"use client";

import { useEffect, useState, useCallback, useRef, type Dispatch, type SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/authFetch";
import type { Session } from "@/lib/domain/session";
import { collection, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { SessionFeedbackCounts } from "@/lib/repositories/feedbackRepository";
import {
  getCounts,
  setCounts as setCachedCounts,
} from "@/lib/state/sessionCountsStore";
import { fetchCounts } from "@/lib/state/fetchCountsDedup";
import {
  assertIdentityResolved,
  useWorkspace,
} from "@/lib/client/workspaceContext";

const SESSIONS_CACHE_PREFIX = "echly_sessions";
const SESSION_COUNT_CACHE_PREFIX = "echly_session_count";

/** Dashboard session list limit — must match GET /api/sessions ordering/limit (30). */
const SESSION_LIST_LIMIT = 30;

function sessionsCacheKey(workspaceId: string): string {
  return `${SESSIONS_CACHE_PREFIX}:${workspaceId}`;
}

function sessionCountCacheKey(workspaceId: string): string {
  return `${SESSION_COUNT_CACHE_PREFIX}:${workspaceId}`;
}

function filterSessionsByView(sessions: Session[], archivedOnly: boolean): Session[] {
  if (!archivedOnly) return sessions;
  return sessions.filter((s) => (s.isArchived ?? s.archived) === true);
}

function readCachedSessions(workspaceId: string): Session[] | null {
  if (!workspaceId) return null;
  try {
    const cached = sessionStorage.getItem(sessionsCacheKey(workspaceId));
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    return Array.isArray(parsed) ? (parsed as Session[]) : null;
  } catch {
    return null;
  }
}

function writeCachedSessions(workspaceId: string, sessions: Session[]) {
  if (!workspaceId) return;
  try {
    sessionStorage.setItem(sessionsCacheKey(workspaceId), JSON.stringify(sessions));
  } catch {
    // Ignore cache write errors (private mode/quota).
  }
}

function readCachedSessionCount(workspaceId: string): number | null {
  if (typeof window === "undefined" || !workspaceId) return null;
  try {
    const raw = localStorage.getItem(sessionCountCacheKey(workspaceId));
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  } catch {
    return null;
  }
}

function writeCachedSessionCount(workspaceId: string, count: number) {
  if (typeof window === "undefined" || !workspaceId) return;
  try {
    localStorage.setItem(sessionCountCacheKey(workspaceId), String(count));
  } catch {
    // Ignore storage write errors.
  }
}

async function hydrateCountsForSessionIds(
  sessionIds: string[],
  setCountsBySessionId: Dispatch<SetStateAction<Record<string, SessionFeedbackCounts>>>,
  shouldApply?: () => boolean
): Promise<void> {
  await Promise.all(
    sessionIds.map(async (sessionId) => {
      if (!sessionId) return;
      if (shouldApply && !shouldApply()) return;
      const cached = getCounts(sessionId);
      if (cached) {
        if (shouldApply && !shouldApply()) return;
        setCountsBySessionId((prev) =>
          prev[sessionId] ? prev : { ...prev, [sessionId]: cached }
        );
        return;
      }
      try {
        const normalizedCounts = await fetchCounts(sessionId);
        if (shouldApply && !shouldApply()) return;
        setCachedCounts(sessionId, normalizedCounts);
        setCountsBySessionId((prev) => ({ ...prev, [sessionId]: normalizedCounts }));
      } catch {
        if (shouldApply && !shouldApply()) return;
        // Leave counts undefined — no placeholder zeros (UI uses field-level skeletons).
      }
    })
  );
}

export interface SessionWithCounts {
  session: Session;
  /** Undefined until counts are loaded for this session (avoids a fake 0 → N jump). */
  counts?: SessionFeedbackCounts;
}

export type ViewMode = "all" | "archived";

/** Single Firestore subscription; consume via `WorkspaceOverviewProvider` + `useWorkspaceOverview`. */
export function useWorkspaceOverviewState(viewMode: ViewMode = "all") {
  const { workspaceId, claimsReady, authUid, isIdentityResolved } = useWorkspace();
  const router = useRouter();
  const workspaceIdRef = useRef<string | null>(null);
  const allSessionsRef = useRef<Session[]>([]);
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [countsBySessionId, setCountsBySessionId] = useState<
    Record<string, SessionFeedbackCounts>
  >({});
  const [isCountsReady, setIsCountsReady] = useState(false);
  /** True until the first Firestore sessions snapshot for the current workspace (counts never gate this). */
  const [awaitingSessionSnapshot, setAwaitingSessionSnapshot] = useState(false);
  const refreshCountsGenRef = useRef(0);
  const expectedCountRef = useRef<number | null>(
    workspaceId ? readCachedSessionCount(workspaceId) : null
  );
  const sessionsSnapshotGenRef = useRef(0);
  /** Workspace id that `allSessions` / counts state was last committed for (avoids one frame of wrong-workspace UI). */
  const sessionsSourceWorkspaceRef = useRef<string | null>(null);
  const userId = authUid;

  useEffect(() => {
    workspaceIdRef.current = workspaceId;
  }, [workspaceId]);

  useEffect(() => {
    allSessionsRef.current = allSessions;
  }, [allSessions]);

  const archivedOnly = viewMode === "archived";

  const refreshSessions = useCallback(async () => {
    if (!isIdentityResolved || !workspaceIdRef.current || !claimsReady) return;
    const gen = ++refreshCountsGenRef.current;
    const shouldApply = () => refreshCountsGenRef.current === gen;
    const ids = allSessionsRef.current
      .map((s) => s.id)
      .filter((id) => Boolean(id) && !id.startsWith("temp-"));
    if (ids.length === 0) {
      setCountsBySessionId({});
      return;
    }
    void hydrateCountsForSessionIds(ids, setCountsBySessionId, shouldApply).catch((error) => {
      console.error("[ECHLY] Failed to refresh session counts", error);
    });
  }, [claimsReady, isIdentityResolved]);

  useEffect(() => {
    if (!userId || !workspaceId) {
      sessionsSourceWorkspaceRef.current = null;
      setAwaitingSessionSnapshot(false);
      return;
    }
    const wid = workspaceId;
    refreshCountsGenRef.current += 1;
    sessionsSourceWorkspaceRef.current = wid;
    setIsCountsReady(false);
    expectedCountRef.current = readCachedSessionCount(wid);
    const cachedSessions = readCachedSessions(wid);
    if (Array.isArray(cachedSessions) && cachedSessions.length > 0) {
      setAllSessions(cachedSessions);
      const cachedCounts = Object.fromEntries(
        cachedSessions
          .map((session) => [session.id, getCounts(session.id)] as const)
          .filter((entry): entry is [string, SessionFeedbackCounts] => entry[1] != null)
      );
      setCountsBySessionId(cachedCounts);
    } else {
      setAllSessions([]);
      setCountsBySessionId({});
    }
    if (isIdentityResolved) {
      setAwaitingSessionSnapshot(true);
    } else {
      setAwaitingSessionSnapshot(false);
    }
  }, [userId, workspaceId, isIdentityResolved]);

  useEffect(() => {
    if (!isIdentityResolved || !userId || !workspaceId) {
      return;
    }

    const wid = workspaceId;

    const q = query(
      collection(db, "sessions"),
      where("workspaceId", "==", wid),
      orderBy("updatedAt", "desc"),
      limit(SESSION_LIST_LIMIT)
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        sessionsSourceWorkspaceRef.current = wid;
        const dbSessions: Session[] = snap.docs.map((docSnap) => {
          const data = docSnap.data() as Partial<Session> & { archived?: boolean; isArchived?: boolean };
          const archived = (data.isArchived ?? data.archived) === true;
          const title = typeof data.title === "string" ? data.title : "Untitled Session";
          return {
            id: docSnap.id,
            ...data,
            title,
            archived,
            isArchived: archived,
          };
        });

        const dbIds = new Set(dbSessions.map((s) => s.id));
        const snapshotGen = ++sessionsSnapshotGenRef.current;
        setAllSessions((prev) => {
          const optimistic = prev.filter((s) => Boolean(s.isOptimistic) && !dbIds.has(s.id));
          const next = [...optimistic, ...dbSessions];
          writeCachedSessions(wid, next);
          expectedCountRef.current = dbSessions.length;
          writeCachedSessionCount(wid, dbSessions.length);
          return next;
        });

        const ids = dbSessions.map((s) => s.id).filter((id): id is string => Boolean(id));

        setAwaitingSessionSnapshot(false);
        setIsCountsReady(true);

        void hydrateCountsForSessionIds(
          ids,
          setCountsBySessionId,
          () => sessionsSnapshotGenRef.current === snapshotGen && workspaceIdRef.current === wid
        ).catch((error) => {
          console.error("[ECHLY] Failed to hydrate counts after sessions snapshot — non-fatal", error);
        });
      },
      (err) => {
        console.error("[ECHLY] Firestore sessions subscription failed", err);
        setIsCountsReady(true);
        setAwaitingSessionSnapshot(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [isIdentityResolved, userId, workspaceId]);

  const overviewDataAligned =
    Boolean(workspaceId && userId) &&
    sessionsSourceWorkspaceRef.current === workspaceId;

  const allSessionsForView = overviewDataAligned ? allSessions : [];
  const countsForView = overviewDataAligned ? countsBySessionId : {};

  const sessions = filterSessionsByView(allSessionsForView, archivedOnly);

  const sessionsWithCounts: SessionWithCounts[] = sessions.map((session) => ({
    session,
    counts: countsForView[session.id],
  }));

  const handleCreateSession = useCallback(
    async (
      onPlanLimitReached?: (payload: { message: string; upgradePlan: string | null }) => void
    ) => {
      assertIdentityResolved(isIdentityResolved);
      if (!claimsReady || !workspaceIdRef.current) return;
      const tempSessionId = `temp-${Date.now()}`;
      const tempSession: Session = {
        id: tempSessionId,
        title: "Untitled Session",
        createdAt: new Date(),
        updatedAt: new Date(),
        isOptimistic: true,
      };
      setAllSessions((prev) => [tempSession, ...prev]);

      try {
        const res = await authFetch("/api/sessions", { method: "POST" });
        if (!res) {
          setAllSessions((prev) => prev.filter((s) => s.id !== tempSessionId));
          setCountsBySessionId((prev) => {
            const next = { ...prev };
            delete next[tempSessionId];
            return next;
          });
          return;
        }
        const data = await res.json().catch((err: unknown) => {
          console.error("[ECHLY] JSON parse failed", err);
          return {};
        });

        if (res.status === 403) {
          setAllSessions((prev) => prev.filter((s) => s.id !== tempSessionId));
          setCountsBySessionId((prev) => {
            const next = { ...prev };
            delete next[tempSessionId];
            return next;
          });
          if (data.error === "PLAN_LIMIT_REACHED") {
            onPlanLimitReached?.({
              message: data.message ?? "You've reached your plan limit.",
              upgradePlan: data.upgradePlan ?? "starter",
            });
            return;
          }
          if (data.error === "WORKSPACE_SUSPENDED") {
            onPlanLimitReached?.({
              message: data.message ?? "Workspace suspended. Contact support.",
              upgradePlan: null,
            });
            return;
          }

          onPlanLimitReached?.({
            message:
              (data && typeof data.message === "string" && data.message) ||
              "You don't have permission to create a session.",
            upgradePlan: data?.upgradePlan ?? null,
          });
          return;
        }

        if (!res.ok) {
          setAllSessions((prev) => prev.filter((s) => s.id !== tempSessionId));
          setCountsBySessionId((prev) => {
            const next = { ...prev };
            delete next[tempSessionId];
            return next;
          });
          console.error("[ECHLY] Create session failed", res.status, data);
          return;
        }

        const sessionId = data.session?.id;
        if (!sessionId) {
          setAllSessions((prev) => prev.filter((s) => s.id !== tempSessionId));
          setCountsBySessionId((prev) => {
            const next = { ...prev };
            delete next[tempSessionId];
            return next;
          });
          return;
        }

        setAllSessions((prev) =>
          prev.map((s) =>
            s.id === tempSessionId
              ? {
                  ...s,
                  id: sessionId,
                  isOptimistic: false,
                  updatedAt: new Date(),
                }
              : s
          )
        );
        setCountsBySessionId((prev) => {
          const next = { ...prev };
          delete next[tempSessionId];
          return next;
        });

        router.push(`/dashboard/${sessionId}`);
      } catch (err) {
        setAllSessions((prev) => prev.filter((s) => s.id !== tempSessionId));
        setCountsBySessionId((prev) => {
          const next = { ...prev };
          delete next[tempSessionId];
          return next;
        });
        console.error("[ECHLY] Create session failed", err);
      }
    },
    [claimsReady, isIdentityResolved, router]
  );

  const updateSession = useCallback((sessionId: string, patch: Partial<Session>) => {
    setAllSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, ...patch } : s))
    );
  }, []);

  const setSessionArchived = useCallback(async (sessionId: string, archived: boolean) => {
    if (!sessionId) return;
    assertIdentityResolved(isIdentityResolved);
    const wid = workspaceIdRef.current;

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
      if (wid) writeCachedSessions(wid, next);
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
            if (wid) writeCachedSessions(wid, next);
            return next;
          });
        }
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data && typeof data.error === "string" && data.error) || `Archive update failed: ${res.status}`);
      }
    } catch (err) {
      if (hasRollback) {
        setAllSessions((prev) => {
          const next = prev.map((s) =>
            s.id === sessionId ? { ...s, archived: rollbackArchived, isArchived: rollbackArchived } : s
          );
          if (wid) writeCachedSessions(wid, next);
          return next;
        });
      }
      console.error("[ECHLY] setSessionArchived failed", err);
      throw err;
    }
  }, [isIdentityResolved]);

  const removeSession = useCallback((sessionId: string) => {
    setAllSessions((prev) => prev.filter((s) => s.id !== sessionId));
    setCountsBySessionId((prev) => {
      const next = { ...prev };
      delete next[sessionId];
      return next;
    });
  }, []);

  const deleteSession = useCallback(
    async (session: Session) => {
      assertIdentityResolved(isIdentityResolved);
      const sessionId = session.id;
      const wid = workspaceIdRef.current;
      setAllSessions((prev) => {
        const next = prev.filter((s) => s.id !== sessionId);
        if (wid) writeCachedSessions(wid, next);
        return next;
      });
      setCountsBySessionId((prev) => {
        const next = { ...prev };
        delete next[sessionId];
        return next;
      });
      try {
        const res = await authFetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
        if (!res) {
          setAllSessions((prev) => {
            const next = [session, ...prev];
            if (wid) writeCachedSessions(wid, next);
            return next;
          });
          setCountsBySessionId((prev) => {
            const cached = getCounts(sessionId);
            return cached ? { ...prev, [sessionId]: cached } : prev;
          });
          return;
        }
        if (!res.ok) {
          const data = await res.json().catch((err: unknown) => {
            console.error("[ECHLY] JSON parse failed", err);
            return {};
          });
          throw new Error((data && data.error) || "Failed to delete session");
        }
      } catch (err) {
        setAllSessions((prev) => {
          const next = [session, ...prev];
          if (wid) writeCachedSessions(wid, next);
          return next;
        });
        setCountsBySessionId((prev) => {
          const cached = getCounts(sessionId);
          return cached ? { ...prev, [sessionId]: cached } : prev;
        });
        console.error("[ECHLY] Delete session failed", err);
        throw err;
      }
    },
    [isIdentityResolved]
  );

  return {
    sessions: sessionsWithCounts,
    loading: overviewDataAligned ? awaitingSessionSnapshot : true,
    isCountsReady: overviewDataAligned ? isCountsReady : false,
    expectedSessionCount: overviewDataAligned ? expectedCountRef.current : null,
    handleCreateSession,
    refreshSessions,
    updateSession,
    setSessionArchived,
    removeSession,
    deleteSession,
  };
}
