"use client";

import { useEffect, useState, useRef } from "react";
import { auth } from "@/lib/firebase";
import { addComment, resolveFeedback, type Comment } from "@/lib/comments";
import { listenToCommentsRepo } from "@/lib/repositories/commentsRepository";

/**
 * Controlled realtime comment list: exactly ONE onSnapshot listener at a time.
 * When selectedFeedbackId changes we unsubscribe the previous listener, then
 * subscribe to the new feedback's comments. Cleanup on unmount prevents leaks.
 */
export function useFeedbackDetailController(args: {
  sessionId: string;
  feedbackId: string | null | undefined;
}) {
  const { sessionId, feedbackId } = args;

  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!feedbackId) {
      const t = requestAnimationFrame(() => {
        setComments([]);
        setLoadingComments(false);
      });
      return () => cancelAnimationFrame(t);
    }

    // Prevent multiple listeners: tear down previous before subscribing.
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    let cancelled = false;
    const t = requestAnimationFrame(() => setLoadingComments(true));

    const unsubscribe = listenToCommentsRepo(
      sessionId,
      feedbackId,
      (incomingComments) => {
        if (cancelled) return;
        setComments([...incomingComments]);
        setLoadingComments(false);
      }
    );
    unsubscribeRef.current = unsubscribe;

    return () => {
      cancelAnimationFrame(t);
      cancelled = true;
      unsubscribe();
      unsubscribeRef.current = null;
    };
  }, [sessionId, feedbackId]);

  const sendComment = async (message: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user || !feedbackId) return;

    const trimmed = message.trim();
    if (!trimmed) return;

    const payload = {
      userId: user.uid,
      userName: user.displayName || "User",
      userAvatar: user.photoURL || "",
      message: trimmed,
    };

    addComment(sessionId, feedbackId, payload).catch(console.error);
  };

  const resolve = async () => {
    if (!feedbackId) return;
    await resolveFeedback(feedbackId, sessionId);
  };

  return {
    comments,
    loadingComments,
    sendComment,
    resolve,
  };
}

