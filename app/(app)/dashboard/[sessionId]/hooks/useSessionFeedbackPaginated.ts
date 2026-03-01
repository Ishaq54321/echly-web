"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { Feedback } from "@/lib/domain/feedback";

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 150;
/** Client-side read cap: stop loading more after this many items (cost protection). */
const FEEDBACK_LOAD_CAP = 200;

export interface UseSessionFeedbackPaginatedResult {
  feedback: Feedback[];
  setFeedback: React.Dispatch<React.SetStateAction<Feedback[]>>;
  loading: boolean;
  hasMore: boolean;
  hasReachedLimit: boolean;
  loadingMore: boolean;
  fetchNextPage: () => Promise<void>;
  refetchFirstPage: () => Promise<void>;
  /** Ref to attach to sentinel div for intersection observer. */
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Infinite scroll: GET /api/feedback with 150ms debounce, intersection observer.
 * Append-only; no duplicate fetch; no simultaneous requests.
 */
export function useSessionFeedbackPaginated(
  sessionId: string | undefined
): UseSessionFeedbackPaginatedResult {
  const [items, setItems] = useState<Feedback[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const hasReachedLimit = items.length >= FEEDBACK_LOAD_CAP;

  const loadMore = useCallback(async () => {
    if (!sessionId || !initialLoadDone || !hasMore || loadingMore || hasReachedLimit) return;

    setLoadingMore(true);
    try {
      const url = `/api/feedback?sessionId=${encodeURIComponent(sessionId)}&cursor=${encodeURIComponent(cursor ?? "")}&limit=${PAGE_SIZE}`;
      const res = await fetch(url);
      const data = (await res.json()) as {
        feedback?: Feedback[];
        nextCursor?: string | null;
        hasMore?: boolean;
      };

      if (data.feedback?.length) {
        setItems((prev) => [...prev, ...data.feedback!]);
        setCursor(data.nextCursor ?? null);
        setHasMore(data.hasMore ?? false);
      } else {
        setHasMore(false);
      }
    } finally {
      setLoadingMore(false);
    }
  }, [sessionId, initialLoadDone, cursor, hasMore, loadingMore, hasReachedLimit]);

  const debouncedLoadMore = useMemo(() => {
    let timeout: ReturnType<typeof setTimeout>;
    return () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        loadMore();
      }, DEBOUNCE_MS);
    };
  }, [loadMore]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          debouncedLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [debouncedLoadMore]);

  // Initial load: first page when sessionId becomes available.
  useEffect(() => {
    if (!sessionId) {
      setItems([]);
      setCursor(null);
      setHasMore(true);
      setInitialLoadDone(false);
      return;
    }

    let cancelled = false;
    setInitialLoading(true);
    setInitialLoadDone(false);

    fetch(
      `/api/feedback?sessionId=${encodeURIComponent(sessionId)}&cursor=&limit=${PAGE_SIZE}`
    )
      .then((res) => res.json())
      .then((data: { feedback?: Feedback[]; nextCursor?: string | null; hasMore?: boolean }) => {
        if (cancelled) return;
        if (data.feedback?.length) {
          setItems(data.feedback);
          setCursor(data.nextCursor ?? null);
          setHasMore(data.hasMore ?? false);
        } else {
          setItems([]);
          setCursor(null);
          setHasMore(false);
        }
        setInitialLoadDone(true);
      })
      .finally(() => {
        if (!cancelled) setInitialLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const refetchFirstPage = useCallback(async () => {
    if (!sessionId) return;
    setInitialLoading(true);
    try {
      const res = await fetch(
        `/api/feedback?sessionId=${encodeURIComponent(sessionId)}&cursor=&limit=${PAGE_SIZE}`
      );
      const data = (await res.json()) as {
        feedback?: Feedback[];
        nextCursor?: string | null;
        hasMore?: boolean;
      };
      if (data.feedback?.length) {
        setItems(data.feedback);
        setCursor(data.nextCursor ?? null);
        setHasMore(data.hasMore ?? false);
      } else {
        setItems([]);
        setCursor(null);
        setHasMore(false);
      }
    } finally {
      setInitialLoading(false);
    }
  }, [sessionId]);

  return {
    feedback: items,
    setFeedback: setItems,
    loading: initialLoading,
    hasMore,
    hasReachedLimit,
    loadingMore,
    fetchNextPage: loadMore,
    refetchFirstPage,
    loadMoreRef,
  };
}
