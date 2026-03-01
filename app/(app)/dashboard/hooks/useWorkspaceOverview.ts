"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { createSession, getUserSessions } from "@/lib/sessions";
import { getSessionFeedbackCountsByStatus } from "@/lib/feedback";
import type { Session } from "@/lib/domain/session";
import type { SessionFeedbackCounts } from "@/lib/repositories/feedbackRepository";

const SESSION_LIMIT = 50;

export interface WorkspaceStats {
  totalSessions: number;
  activeSessions: number;
  totalFeedbackItems: number;
  openIssues: number;
}

export interface SessionWithCounts {
  session: Session;
  counts: SessionFeedbackCounts;
}

export function useWorkspaceOverview() {
  const router = useRouter();
  const [user, setUser] = useState<{ uid: string } | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionCounts, setSessionCounts] = useState<Record<string, SessionFeedbackCounts>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);
      setLoading(true);
      try {
        const userSessions = await getUserSessions(currentUser.uid, SESSION_LIMIT);
        setSessions(userSessions);
        const counts = await Promise.all(
          userSessions.map((s) =>
            getSessionFeedbackCountsByStatus(s.id).then((c) => [s.id, c] as const)
          )
        );
        setSessionCounts(Object.fromEntries(counts));
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const stats: WorkspaceStats = {
    totalSessions: sessions.length,
    activeSessions: sessions.filter((s) => {
      const c = sessionCounts[s.id];
      return c ? c.open + c.in_progress > 0 : false;
    }).length,
    totalFeedbackItems: Object.values(sessionCounts).reduce(
      (acc, c) => acc + c.open + c.in_progress + c.resolved,
      0
    ),
    openIssues: Object.values(sessionCounts).reduce((acc, c) => acc + c.open, 0),
  };

  const sessionsWithCounts: SessionWithCounts[] = sessions.map((session) => ({
    session,
    counts: sessionCounts[session.id] ?? { open: 0, in_progress: 0, resolved: 0 },
  }));

  const handleCreateSession = useCallback(async () => {
    if (!user) return;
    const sessionId = await createSession(user.uid);
    router.push(`/dashboard/${sessionId}`);
  }, [user, router]);

  return {
    user,
    sessions: sessionsWithCounts,
    stats,
    loading,
    handleCreateSession,
  };
}
