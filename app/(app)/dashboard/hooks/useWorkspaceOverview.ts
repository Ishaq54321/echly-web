"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { clearAuthTokenCache, authFetch } from "@/lib/authFetch";
import { onAuthStateChanged } from "firebase/auth";
import { sessionsArrayFromApiPayload, type Session } from "@/lib/domain/session";
import { collection, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { SessionFeedbackCounts } from "@/lib/repositories/feedbackRepository";
import {
  getCounts,
  setCounts as setCachedCounts,
} from "@/lib/state/sessionCountsStore";
import { fetchCountsDedup } from "@/lib/state/fetchCountsDedup";

const SESSIONS_CACHE_KEY = "echly_sessions";
const SESSION_COUNT_CACHE_KEY = "sessionCount";

function filterSessionsByView(sessions: Session[], archivedOnly: boolean): Session[] {
  if (!archivedOnly) return sessions;
  return sessions.filter((s) => (s.isArchived ?? s.archived) === true);
}

function readCachedSessions(): Session[] | null {
  try {
    const cached = sessionStorage.getItem(SESSIONS_CACHE_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    return Array.isArray(parsed) ? (parsed as Session[]) : null;
  } catch {
    return null;
  }
}

function writeCachedSessions(sessions: Session[]) {
  try {
    sessionStorage.setItem(SESSIONS_CACHE_KEY, JSON.stringify(sessions));
  } catch {
    // Ignore cache write errors (private mode/quota).
  }
}

function readCachedSessionCount(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_COUNT_CACHE_KEY);
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  } catch {
    return null;
  }
}

function writeCachedSessionCount(count: number) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSION_COUNT_CACHE_KEY, String(count));
  } catch {
    // Ignore storage write errors.
  }
}

type SessionsLoadPayload = {
  sessions: Session[];
  countsBySessionId: Record<string, SessionFeedbackCounts>;
};

/** One in-flight load (e.g. React Strict Mode double effect) → single GET /api/sessions + counts batch. */
let sessionsLoadInFlight: Promise<SessionsLoadPayload> | null = null;

async function loadSessionsAndCounts(): Promise<SessionsLoadPayload> {
  if (sessionsLoadInFlight) {
    return sessionsLoadInFlight;
  }
  sessionsLoadInFlight = (async () => {
    try {
      const res = await authFetch("/api/sessions");
      if (!res.ok) {
        throw new Error(`Failed to fetch sessions: ${res.status}`);
      }
      const data: unknown = await res.json();
      const sessions = sessionsArrayFromApiPayload(data);
      const countsEntries = await Promise.all(
        sessions.map(async (session): Promise<[string, SessionFeedbackCounts]> => {
          const sessionId = typeof session.id === "string" ? session.id : "";
          if (!sessionId) {
            return [sessionId, { total: 0, open: 0, resolved: 0, skipped: 0 }];
          }
          const cached = getCounts(sessionId);
          if (cached) {
            return [sessionId, cached];
          }
          try {
            const normalizedCounts = await fetchCountsDedup(sessionId);
            setCachedCounts(sessionId, normalizedCounts);
            return [sessionId, normalizedCounts];
          } catch {
            return [sessionId, { total: 0, open: 0, resolved: 0, skipped: 0 }];
          }
        })
      );
      return {
        sessions,
        countsBySessionId: Object.fromEntries(countsEntries),
      };
    } finally {
      sessionsLoadInFlight = null;
    }
  })();
  return sessionsLoadInFlight;
}

export interface SessionWithCounts {
  session: Session;
  counts: SessionFeedbackCounts;
}

export type ViewMode = "all" | "archived";

export function useWorkspaceOverview(viewMode: ViewMode = "all") {
  const router = useRouter();
  const [user, setUser] = useState<{ uid: string } | null>(null);
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [countsBySessionId, setCountsBySessionId] = useState<
    Record<string, SessionFeedbackCounts>
  >({});
  const [loading, setLoading] = useState(true);
  const expectedCountRef = useRef<number | null>(readCachedSessionCount());
  const userId = user?.uid;

  const archivedOnly = viewMode === "archived";

  const refreshSessions = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    setLoading(true);
    try {
      const { sessions: freshSessions, countsBySessionId: freshCounts } =
        await loadSessionsAndCounts();
      if (freshSessions.length > 0) {
        expectedCountRef.current = freshSessions.length;
        writeCachedSessionCount(freshSessions.length);
      }
      setAllSessions(freshSessions);
      setCountsBySessionId(freshCounts);
      writeCachedSessions(freshSessions);
    } catch (error) {
      console.error("[ECHLY] Failed to refresh sessions", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        clearAuthTokenCache();
        router.push("/login");
        return;
      }
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!userId) return;
    const cachedSessions = readCachedSessions();
    const hasCachedSessions = Array.isArray(cachedSessions);

    if (hasCachedSessions) {
      setAllSessions(cachedSessions);
      const cachedCounts = Object.fromEntries(
        cachedSessions.map((session) => [
          session.id,
          getCounts(session.id) ?? { total: 0, open: 0, resolved: 0, skipped: 0 },
        ])
      );
      setCountsBySessionId(cachedCounts);
      setLoading(true);
    } else {
      setLoading(true);
    }

    (async () => {
      try {
        const { sessions: freshSessions, countsBySessionId: freshCounts } =
          await loadSessionsAndCounts();
        if (freshSessions.length > 0) {
          expectedCountRef.current = freshSessions.length;
          writeCachedSessionCount(freshSessions.length);
        }
        setAllSessions(freshSessions);
        setCountsBySessionId(freshCounts);
        writeCachedSessions(freshSessions);
      } catch (error) {
        console.error("[ECHLY] Failed to load sessions", error);
        if (!hasCachedSessions) {
          setAllSessions([]);
          setCountsBySessionId({});
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  // Realtime sessions sync (Firestore). Keeps UI state correct without refresh.
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, "sessions"),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
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
        setAllSessions((prev) => {
          const optimistic = prev.filter((s) => Boolean(s.isOptimistic) && !dbIds.has(s.id));
          const next = [...optimistic, ...dbSessions];
          writeCachedSessions(next);
          return next;
        });
      },
      (err) => {
        console.error("[ECHLY] Firestore sessions subscription failed", err);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const sessions = filterSessionsByView(allSessions, archivedOnly);

  const sessionsWithCounts: SessionWithCounts[] = sessions.map((session) => ({
    session,
    counts: countsBySessionId[session.id] ?? {
      total: 0,
      open: 0,
      resolved: 0,
      skipped: 0,
    },
  }));

  const handleCreateSession = useCallback(
    async (
      onPlanLimitReached?: (payload: { message: string; upgradePlan: string | null }) => void
    ) => {
      if (!user) return;
      // Optimistic insert: temp session shows up instantly in the UI.
      const tempSessionId = `temp-${Date.now()}`;
      const tempSession: Session = {
        id: tempSessionId,
        title: "Untitled Session",
        createdAt: new Date(),
        updatedAt: new Date(),
        isOptimistic: true,
      };
      setAllSessions((prev) => [tempSession, ...prev]);
      setCountsBySessionId((prev) => ({
        ...prev,
        [tempSessionId]: { total: 0, open: 0, resolved: 0, skipped: 0 },
      }));

      try {
        const res = await authFetch("/api/sessions", { method: "POST" });
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

          // Generic 403 or empty/unparseable body — still show user feedback
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

        // Replace temp session with real one (match by temp id).
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
          const tempCounts = prev[tempSessionId] ?? {
            total: 0,
            open: 0,
            resolved: 0,
            skipped: 0,
          };
          const next: Record<string, SessionFeedbackCounts> = {
            ...prev,
            [sessionId]: tempCounts,
          };
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
    [user, router]
  );

  const updateSession = useCallback((sessionId: string, patch: Partial<Session>) => {
    setAllSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, ...patch } : s))
    );
  }, []);

  const setSessionArchived = useCallback(async (sessionId: string, archived: boolean) => {
    if (!sessionId) return;

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
      writeCachedSessions(next);
      return next;
    });

    try {
      const res = await authFetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived, isArchived: archived }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data && typeof data.error === "string" && data.error) || `Archive update failed: ${res.status}`);
      }
    } catch (err) {
      // Rollback optimistic patch on failure.
      if (hasRollback) {
        setAllSessions((prev) => {
          const next = prev.map((s) =>
            s.id === sessionId ? { ...s, archived: rollbackArchived, isArchived: rollbackArchived } : s
          );
          writeCachedSessions(next);
          return next;
        });
      }
      console.error("[ECHLY] setSessionArchived failed", err);
      throw err;
    }
  }, []);

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
      const sessionId = session.id;
      setAllSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setCountsBySessionId((prev) => {
        const next = { ...prev };
        delete next[sessionId];
        return next;
      });
      try {
        const res = await authFetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
        if (!res.ok) {
          const data = await res.json().catch((err: unknown) => {
            console.error("[ECHLY] JSON parse failed", err);
            return {};
          });
          throw new Error((data && data.error) || "Failed to delete session");
        }
      } catch (err) {
        // Error recovery: reinsert session when delete fails.
        setAllSessions((prev) => [session, ...prev]);
        setCountsBySessionId((prev) => ({
          ...prev,
          [sessionId]: prev[sessionId] ?? { total: 0, open: 0, resolved: 0, skipped: 0 },
        }));
        console.error("[ECHLY] Delete session failed", err);
        throw err;
      }
    },
    []
  );

  return {
    user,
    sessions: sessionsWithCounts,
    loading,
    expectedSessionCount: expectedCountRef.current,
    handleCreateSession,
    refreshSessions,
    updateSession,
    setSessionArchived,
    removeSession,
    deleteSession,
  };
}
