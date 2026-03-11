"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { clearAuthTokenCache } from "@/lib/authFetch";
import { onAuthStateChanged } from "firebase/auth";
import { createSession, getWorkspaceSessions, getUserSessions } from "@/lib/sessions";
import { getSessionFeedbackCounts } from "@/lib/feedback";
import type { Session } from "@/lib/domain/session";
import type { SessionFeedbackCounts } from "@/lib/repositories/feedbackRepository";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository";

const SESSION_LIMIT = 50;

async function loadSessionsAndCounts(
  uid: string,
  archivedOnly?: boolean
): Promise<{
  sessions: Session[];
  counts: Record<string, SessionFeedbackCounts>;
}> {
  const workspaceId = (await getUserWorkspaceIdRepo(uid)) ?? uid;
  const workspaceSessions = await getWorkspaceSessions(workspaceId, SESSION_LIMIT, {
    archivedOnly,
  });
  const userSessions =
    workspaceSessions.length > 0
      ? workspaceSessions
      : await getUserSessions(uid, SESSION_LIMIT, { archivedOnly });
  const counts = await Promise.all(
    userSessions.map((s) =>
      getSessionFeedbackCounts(s.id).then((c) => [s.id, c] as const)
    )
  );
  return { sessions: userSessions, counts: Object.fromEntries(counts) };
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
  const [sessionCounts, setSessionCounts] = useState<Record<string, SessionFeedbackCounts>>({});
  const [loading, setLoading] = useState(true);

  const archivedOnly = viewMode === "archived";

  const refreshSessions = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    setLoading(true);
    try {
      const { sessions: userSessions, counts: newCounts } = await loadSessionsAndCounts(
        currentUser.uid,
        archivedOnly
      );
      setSessions(userSessions);
      setSessionCounts(newCounts);
    } finally {
      setLoading(false);
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
    setLoading(true);
    loadSessionsAndCounts(user.uid, archivedOnly)
      .then(({ sessions: userSessions, counts: newCounts }) => {
        setSessions(userSessions);
        setSessionCounts(newCounts);
      })
      .finally(() => setLoading(false));
  }, [user?.uid, archivedOnly]);

  const sessionsWithCounts: SessionWithCounts[] = sessions.map((session) => ({
    session,
    counts: sessionCounts[session.id] ?? { open: 0, resolved: 0 },
  }));

  const handleCreateSession = useCallback(async () => {
    if (!user) return;
    const workspaceId = (await getUserWorkspaceIdRepo(user.uid)) ?? user.uid;
    const parts = (auth.currentUser?.displayName || "User").trim().split(/\s+/);
    const firstName = parts[0] || "User";
    const lastName = parts.slice(1).join(" ") || "";
    const createdBy = {
      id: user.uid,
      firstName,
      lastName,
      avatarUrl: auth.currentUser?.photoURL ?? undefined,
    };
    const sessionId = await createSession(workspaceId, user.uid, createdBy);
    router.push(`/dashboard/${sessionId}`);
  }, [user, router]);

  const updateSession = useCallback((sessionId: string, patch: Partial<Session>) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, ...patch } : s))
    );
  }, []);

  const removeSession = useCallback((sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    setSessionCounts((prev) => {
      const next = { ...prev };
      delete next[sessionId];
      return next;
    });
  }, []);

  return {
    user,
    sessions: sessionsWithCounts,
    loading,
    handleCreateSession,
    refreshSessions,
    updateSession,
    removeSession,
  };
}
