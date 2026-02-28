"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { addComment, resolveFeedback, type Comment } from "@/lib/comments";
import { listenToCommentsRepo } from "@/lib/repositories/commentsRepository";

export function useFeedbackDetailController(args: {
  sessionId: string;
  feedbackId: string | null | undefined;
}) {
  const { sessionId, feedbackId } = args;

  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    if (!feedbackId) {
      setComments([]);
      setLoadingComments(false);
      return;
    }

    let cancelled = false;
    setLoadingComments(true);

    const unsubscribe = listenToCommentsRepo(
      sessionId,
      feedbackId,
      (incomingComments) => {
        if (cancelled) return;
        setComments([...incomingComments]);
        setLoadingComments(false);
      }
    );

    return () => {
      cancelled = true;
      unsubscribe();
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
    await resolveFeedback(feedbackId);
  };

  return {
    comments,
    loadingComments,
    sendComment,
    resolve,
  };
}

