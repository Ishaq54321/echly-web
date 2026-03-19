"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { clearAuthTokenCache, authFetch } from "@/lib/authFetch";
import { onAuthStateChanged } from "firebase/auth";
import type { Session } from "@/lib/domain/session";
import type { SessionFeedbackCounts } from "@/lib/repositories/feedbackRepository";

export interface PlanLimitReachedPayload {
  message: string;
  upgradePlan: string | null;
}

const SESSIONS_CACHE_KEY = "echly_sessions";

function filterSessionsByView(sessions: Session[], archivedOnly: boolean): Session[] {
  return archivedOnly ? sessions.filter((s) => s.archived) : sessions;
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

async function loadSessionsAndCounts(): Promise<{
  sessions: Session[];
}> {
  const res = await fetch("/api/sessions", {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch sessions: ${res.status}`);
  }
  const data = await res.json();
  const sessions = Array.isArray(data.sessions) ? data.sessions : [];
  return { sessions };
}

export interface SessionWithCounts {
  session: Session;
  counts: SessionFeedbackCounts;
}

export type ViewMode = "all" | "archived";

export function useWorkspaceOverview(viewMode: ViewMode = "all") {
  const router = useRouter();
  const [user, setUser] = useState<{ uid: string } | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const archivedOnly = viewMode === "archived";

  const refreshSessions = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    try {
      const { sessions: freshSessions } = await loadSessionsAndCounts();
      setSessions(filterSessionsByView(freshSessions, archivedOnly));
      writeCachedSessions(freshSessions);
    } catch (error) {
      console.error("Failed to refresh sessions:", error);
    }
  }, [archivedOnly]);

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
    if (!user) return;
    const cachedSessions = readCachedSessions();
    const hasCachedSessions = Array.isArray(cachedSessions);

    if (hasCachedSessions) {
      setSessions(filterSessionsByView(cachedSessions, archivedOnly));
      setLoading(false);
    } else {
      setLoading(true);
    }

    loadSessionsAndCounts()
      .then(({ sessions: freshSessions }) => {
        setSessions(filterSessionsByView(freshSessions, archivedOnly));
        writeCachedSessions(freshSessions);
      })
      .catch((error) => {
        console.error("Failed to load sessions:", error);
        if (!hasCachedSessions) setSessions([]);
      })
      .finally(() => {
        if (!hasCachedSessions) setLoading(false);
      });
  }, [user?.uid, archivedOnly]);

  const sessionsWithCounts: SessionWithCounts[] = sessions.map((session) => ({
    session,
    counts: {
      open: session.openCount ?? 0,
      resolved: session.resolvedCount ?? 0,
      skipped: session.skippedCount ?? 0,
    },
  }));

  const handleCreateSession = useCallback(
    async (onPlanLimitReached?: (payload: PlanLimitReachedPayload) => void) => {
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
      setSessions((prev) => [tempSession, ...prev]);

      try {
        const res = await authFetch("/api/sessions", { method: "POST" });
        const data = await res.json().catch(() => ({}));

        if (res.status === 403) {
          setSessions((prev) => prev.filter((s) => s.id !== tempSessionId));
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
          setSessions((prev) => prev.filter((s) => s.id !== tempSessionId));
          console.error("Create session failed:", res.status, data);
          return;
        }

        const sessionId = data.session?.id;
        if (!sessionId) {
          setSessions((prev) => prev.filter((s) => s.id !== tempSessionId));
          return;
        }

        // Replace temp session with real one (match by temp id).
        setSessions((prev) =>
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
        setSessions((prev) => prev.filter((s) => s.id !== tempSessionId));
        console.error("Create session failed:", err);
      }
    },
    [user, router]
  );

  const updateSession = useCallback((sessionId: string, patch: Partial<Session>) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, ...patch } : s))
    );
  }, []);

  const removeSession = useCallback((sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  }, []);

  const deleteSession = useCallback(
    async (session: Session) => {
      const sessionId = session.id;
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      try {
        const res = await authFetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error((data && data.error) || "Failed to delete session");
        }
      } catch (err) {
        // Error recovery: reinsert session when delete fails.
        setSessions((prev) => [session, ...prev]);
        console.error("Delete session failed:", err);
        throw err;
      }
    },
    []
  );

  return {
    user,
    sessions: sessionsWithCounts,
    loading,
    handleCreateSession,
    refreshSessions,
    updateSession,
    removeSession,
    deleteSession,
  };
}
