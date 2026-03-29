"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/authFetch";
import type { Session } from "@/lib/domain/session";
import { sessionsArrayFromApiPayload } from "@/lib/domain/session";
import type { SessionFeedbackCounts } from "@/lib/repositories/feedbackRepository";
import {
  assertIdentityResolved,
  useWorkspace,
} from "@/lib/client/workspaceContext";
import { SESSION_FEEDBACK_PATH } from "@/utils/getSessionLink";

const SESSIONS_CACHE_PREFIX = "echly_sessions";

/** Dashboard session list limit — must match GET /api/sessions ordering/limit (30). */
const SESSION_LIST_LIMIT = 30;

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

/** Session list from GET /api/sessions (permission and scoping enforced on the server). */
export function useWorkspaceOverviewState(viewMode: ViewMode = "all") {
  const { claimsReady, authUid, isIdentityResolved } = useWorkspace();
  const router = useRouter();
  const userIdRef = useRef<string | null>(null);
  const allSessionsRef = useRef<Session[]>([]);
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [awaitingSessions, setAwaitingSessions] = useState(false);
  const sessionsSourceUserRef = useRef<string | null>(null);
  const userId = authUid;

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    allSessionsRef.current = allSessions;
  }, [allSessions]);

  const archivedOnly = viewMode === "archived";

  const refreshSessions = useCallback(async () => {
    const uid = userIdRef.current;
    if (!uid) return;
    setAwaitingSessions(true);
    try {
      const res = await authFetch("/api/sessions", { cache: "no-store" });
      if (!res?.ok) {
        setAwaitingSessions(false);
        return;
      }
      const data = await res.json().catch(() => ({}));
      const list = sessionsArrayFromApiPayload(data).slice(0, SESSION_LIST_LIMIT);
      const next = list.map((s) => {
        const archived = (s.archived ?? s.isArchived) === true;
        return { ...s, archived, isArchived: archived };
      });
      sessionsSourceUserRef.current = uid;
      setAllSessions(next);
      writeCachedSessions(uid, next);
    } catch (e) {
      console.error("[ECHLY] refreshSessions failed", e);
    } finally {
      setAwaitingSessions(false);
    }
  }, []);

  useEffect(() => {
    if (!userId) {
      sessionsSourceUserRef.current = null;
      setAwaitingSessions(false);
      return;
    }
    sessionsSourceUserRef.current = userId;
    const cached = readCachedSessions(userId);
    if (Array.isArray(cached) && cached.length > 0) {
      setAllSessions(cached);
    } else {
      setAllSessions([]);
    }
    setAwaitingSessions(true);
    let cancelled = false;

    void (async () => {
      try {
        const res = await authFetch("/api/sessions", { cache: "no-store" });
        if (cancelled) return;
        if (!res?.ok) {
          setAwaitingSessions(false);
          return;
        }
        const data = await res.json().catch(() => ({}));
        const list = sessionsArrayFromApiPayload(data).slice(0, SESSION_LIST_LIMIT);
        const next = list.map((s) => {
          const archived = (s.archived ?? s.isArchived) === true;
          return { ...s, archived, isArchived: archived };
        });
        sessionsSourceUserRef.current = userId;
        setAllSessions(next);
        writeCachedSessions(userId, next);
      } catch (e) {
        if (!cancelled) console.error("[ECHLY] GET /api/sessions failed", e);
      } finally {
        if (!cancelled) setAwaitingSessions(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const overviewDataAligned =
    Boolean(userId) && sessionsSourceUserRef.current === userId;

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

        const newSessionId = data.session?.id;
        if (!newSessionId) {
          setAllSessions((prev) => prev.filter((s) => s.id !== tempSessionId));
          return;
        }

        setAllSessions((prev) =>
          prev.map((s) =>
            s.id === tempSessionId
              ? {
                  ...s,
                  id: newSessionId,
                  isOptimistic: false,
                  updatedAt: new Date(),
                }
              : s
          )
        );

        router.push(`${SESSION_FEEDBACK_PATH}/${newSessionId}`);
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

  const uidForCache = () => userIdRef.current;

  const setSessionArchived = useCallback(async (sessionId: string, archived: boolean) => {
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
      if (uid) writeCachedSessions(uid, next);
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
            if (uid) writeCachedSessions(uid, next);
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
          if (uid) writeCachedSessions(uid, next);
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
      const uid = uidForCache();
      setAllSessions((prev) => {
        const next = prev.filter((s) => s.id !== sessionId);
        if (uid) writeCachedSessions(uid, next);
        return next;
      });
      try {
        const res = await authFetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
        if (!res) {
          setAllSessions((prev) => {
            const next = [session, ...prev];
            if (uid) writeCachedSessions(uid, next);
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
          if (uid) writeCachedSessions(uid, next);
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
    handleCreateSession,
    refreshSessions,
    updateSession,
    setSessionArchived,
    removeSession,
    deleteSession,
  };
}
