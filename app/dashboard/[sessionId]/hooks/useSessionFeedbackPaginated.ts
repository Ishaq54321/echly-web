"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getSessionFeedbackPage,
  type Feedback,
  type FeedbackPageCursor,
} from "@/lib/feedback";

const PAGE_SIZE = 20;
/** Client-side read cap: stop loading more after this many items (cost protection). */
const FEEDBACK_LOAD_CAP = 200;

export interface UseSessionFeedbackPaginatedResult {
  feedback: Feedback[];
  setFeedback: React.Dispatch<React.SetStateAction<Feedback[]>>;
  loading: boolean;
  hasMore: boolean;
  hasReachedLimit: boolean;
  fetchNextPage: () => Promise<void>;
}

/**
 * Manages paginated feedback for a session. Loads first page when sessionId is set;
 * fetchNextPage() appends further pages. Respects FEEDBACK_LOAD_CAP (200 items).
 */
export function useSessionFeedbackPaginated(
  sessionId: string | undefined
): UseSessionFeedbackPaginatedResult {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const lastVisibleDocRef = useRef<FeedbackPageCursor | null>(null);

  const hasReachedLimit = feedback.length >= FEEDBACK_LOAD_CAP;

  // Initial load: first page when sessionId becomes available.
  useEffect(() => {
    if (!sessionId) {
      setFeedback([]);
      lastVisibleDocRef.current = null;
      setHasMore(false);
      setInitialLoadDone(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getSessionFeedbackPage(sessionId, PAGE_SIZE)
      .then(({ feedback: page, lastVisibleDoc: last, hasMore: more }) => {
        if (cancelled) return;
        setFeedback(page);
        lastVisibleDocRef.current = last;
        setHasMore(more);
        setInitialLoadDone(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const fetchNextPage = useCallback(async () => {
    if (!sessionId || !initialLoadDone || loading || !hasMore || hasReachedLimit)
      return;
    if (feedback.length >= FEEDBACK_LOAD_CAP) return;

    const cursor = lastVisibleDocRef.current;
    setLoading(true);
    try {
      const { feedback: page, lastVisibleDoc: last, hasMore: more } =
        await getSessionFeedbackPage(sessionId, PAGE_SIZE, cursor);
      setFeedback((prev) => [...prev, ...page]);
      lastVisibleDocRef.current = last;
      setHasMore(more);
    } finally {
      setLoading(false);
    }
  }, [sessionId, initialLoadDone, loading, hasMore, hasReachedLimit, feedback.length]);

  return {
    feedback,
    setFeedback,
    loading,
    hasMore,
    hasReachedLimit,
    fetchNextPage,
  };
}
