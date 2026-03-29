"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/authFetch";
import type { Session } from "@/lib/domain/session";
import { collection, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { SessionFeedbackCounts } from "@/lib/repositories/feedbackRepository";
import {
  assertIdentityResolved,
  useWorkspace,
} from "@/lib/client/workspaceContext";

const SESSIONS_CACHE_PREFIX = "echly_sessions";

/** Dashboard session list limit — must match GET /api/sessions ordering/limit (30). */
const SESSION_LIST_LIMIT = 30;

function sessionsCacheKey(workspaceId: string): string {
  return `${SESSIONS_CACHE_PREFIX}:${workspaceId}`;
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

/** Ticket counts from `sessions/{id}` denormalized fields (Firestore / snapshot). */
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

function mapSessionDoc(docSnap: { id: string; data: () => Record<string, unknown> }): Session {
  const data = docSnap.data() as Partial<Session> & { archived?: boolean; isArchived?: boolean };
  const archived = (data.isArchived ?? data.archived) === true;
  const title = typeof data.title === "string" ? data.title : "Untitled Session";
  const openCount = typeof data.openCount === "number" ? data.openCount : 0;
  const resolvedCount = typeof data.resolvedCount === "number" ? data.resolvedCount : 0;
  const totalCount =
    typeof data.totalCount === "number"
      ? data.totalCount
      : typeof data.feedbackCount === "number"
        ? data.feedbackCount
        : undefined;
  const feedbackCount =
    typeof data.feedbackCount === "number"
      ? data.feedbackCount
      : typeof data.totalCount === "number"
        ? data.totalCount
        : undefined;
  return {
    id: docSnap.id,
    ...data,
    title,
    archived,
    isArchived: archived,
    openCount,
    resolvedCount,
    totalCount,
    feedbackCount,
  };
}

export interface SessionWithCounts {
  session: Session;
  counts: SessionFeedbackCounts;
}

export type ViewMode = "all" | "archived";

/** Single Firestore subscription; consume via `WorkspaceOverviewProvider` + `useWorkspaceOverview`. */
export function useWorkspaceOverviewState(viewMode: ViewMode = "all") {
  const { workspaceId, claimsReady, authUid, isIdentityResolved } = useWorkspace();
  const router = useRouter();
  const workspaceIdRef = useRef<string | null>(null);
  const allSessionsRef = useRef<Session[]>([]);
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  /** True until the first Firestore sessions snapshot for the current workspace. */
  const [awaitingSessionSnapshot, setAwaitingSessionSnapshot] = useState(false);
  /** Workspace id that `allSessions` was last committed for (avoids one frame of wrong-workspace UI). */
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
    // Counts are on session documents; list refreshes via Firestore snapshot only.
  }, []);

  useEffect(() => {
    if (!userId || !workspaceId) {
      sessionsSourceWorkspaceRef.current = null;
      setAwaitingSessionSnapshot(false);
      return;
    }
    const wid = workspaceId;
    sessionsSourceWorkspaceRef.current = wid;
    const cachedSessions = readCachedSessions(wid);
    if (Array.isArray(cachedSessions) && cachedSessions.length > 0) {
      setAllSessions(cachedSessions);
    } else {
      setAllSessions([]);
    }
    if (authUid && workspaceId) {
      setAwaitingSessionSnapshot(true);
    } else {
      setAwaitingSessionSnapshot(false);
    }
  }, [userId, workspaceId, authUid]);

  useEffect(() => {
    if (!authUid || !workspaceId) {
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
        const dbSessions: Session[] = snap.docs.map((docSnap) => mapSessionDoc(docSnap));

        const dbIds = new Set(dbSessions.map((s) => s.id));
        setAllSessions((prev) => {
          const optimistic = prev.filter((s) => Boolean(s.isOptimistic) && !dbIds.has(s.id));
          const next = [...optimistic, ...dbSessions];
          writeCachedSessions(wid, next);
          return next;
        });

        setAwaitingSessionSnapshot(false);
      },
      (err) => {
        console.error("[ECHLY] Firestore sessions subscription failed", err);
        setAwaitingSessionSnapshot(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [authUid, workspaceId]);

  const overviewDataAligned =
    Boolean(workspaceId && userId) &&
    sessionsSourceWorkspaceRef.current === workspaceId;

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
      if (!claimsReady || !workspaceIdRef.current) return;
      const tempSessionId = `temp-${Date.now()}`;
      const tempSession: Session = {
        id: tempSessionId,
        title: "Untitled Session",
        createdAt: new Date(),
        updatedAt: new Date(),
        isOptimistic: true,
        openCount: 0,
        resolvedCount: 0,
        totalCount: 0,
        feedbackCount: 0,
      };
      setAllSessions((prev) => [tempSession, ...prev]);

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
          console.error("[ECHLY] Create session failed", res.status, data);
          return;
        }

        const sessionId = data.session?.id;
        if (!sessionId) {
          setAllSessions((prev) => prev.filter((s) => s.id !== tempSessionId));
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

        router.push(`/dashboard/${sessionId}`);
      } catch (err) {
        setAllSessions((prev) => prev.filter((s) => s.id !== tempSessionId));
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
      try {
        const res = await authFetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
        if (!res) {
          setAllSessions((prev) => {
            const next = [session, ...prev];
            if (wid) writeCachedSessions(wid, next);
            return next;
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
        console.error("[ECHLY] Delete session failed", err);
        throw err;
      }
    },
    [isIdentityResolved]
  );

  return {
    sessions: sessionsWithCounts,
    loading: overviewDataAligned ? awaitingSessionSnapshot : true,
    isCountsReady: overviewDataAligned ? true : false,
    handleCreateSession,
    refreshSessions,
    updateSession,
    setSessionArchived,
    removeSession,
    deleteSession,
  };
}
