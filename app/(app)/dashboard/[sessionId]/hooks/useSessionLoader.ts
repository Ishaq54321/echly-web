"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { clearAuthTokenCache } from "@/lib/authFetch";
import { onAuthStateChanged } from "firebase/auth";
import { getSessionFeedback } from "@/lib/feedback";
import { getSessionById, type Session } from "@/lib/sessions";
import type { Feedback } from "@/lib/feedback";

export function useSessionLoader(sessionId: string | string[]) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = Array.isArray(sessionId) ? sessionId[0] : sessionId;
    if (!id) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        clearAuthTokenCache();
        router.push("/login");
        return;
      }
      const sessionData = await getSessionById(id);

      if (!sessionData) {
        router.push("/dashboard");
        return;
      }

      if (sessionData.userId !== currentUser.uid) {
        router.push("/dashboard");
        return;
      }

      setSession(sessionData);

      const feedbackData = await getSessionFeedback(id);
      setFeedback(feedbackData);

      if (feedbackData.length > 0) {
        setSelectedId(feedbackData[0].id);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [sessionId, router]);

  return { session, feedback, setFeedback, selectedId, setSelectedId, loading };
}
