"use client";

import { authFetch } from "@/lib/authFetch";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { Feedback } from "@/lib/domain/feedback";

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 150;
/** Client-side read cap: stop loading more after this many items (cost protection). */
const FEEDBACK_LOAD_CAP = 200;

export interface UseSessionFeedbackPaginatedResult {
  feedback: Feedback[];
  setFeedback: React.Dispatch<React.SetStateAction<Feedback[]>>;
  /** Total count from server (first page); stable, not derived from loaded items. */
  total: number;
  /** Active (open) count from server (first page only); do not derive from items. */
  activeCount: number;
  /** Resolved count from server (first page only); do not derive from items. */
  resolvedCount: number;
  /** Setters for counts so callers can update locally (e.g. after resolve toggle, delete, create without refetch). */
  setTotal: React.Dispatch<React.SetStateAction<number>>;
  setActiveCount: React.Dispatch<React.SetStateAction<number>>;
  setResolvedCount: React.Dispatch<React.SetStateAction<number>>;
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
  const [total, setTotal] = useState<number>(0);
  const [activeCount, setActiveCount] = useState<number>(0);
  const [resolvedCount, setResolvedCount] = useState<number>(0);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const hasReachedLimit = items.length >= FEEDBACK_LOAD_CAP;

  const loadMore = useCallback(async () => {
    if (!sessionId || !initialLoadDone || !hasMore || loadingMore || hasReachedLimit) return;

    setLoadingMore(true);
    try {
      const url = `/api/feedback?sessionId=${encodeURIComponent(sessionId)}&cursor=${encodeURIComponent(cursor ?? "")}&limit=${PAGE_SIZE}`;
      const res = await authFetch(url);
      const data = (await res.json()) as {
        feedback?: Feedback[];
        nextCursor?: string | null;
        hasMore?: boolean;
        total?: number;
        activeCount?: number;
        resolvedCount?: number;
      };

      if (data.feedback?.length) {
        setItems((prev) => [...prev, ...data.feedback!]);
        setCursor(data.nextCursor ?? null);
        setHasMore(data.hasMore ?? false);
        // Do not update total/activeCount/resolvedCount on scroll; keep from initial load
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
      setTotal(0);
      setActiveCount(0);
      setResolvedCount(0);
      setCursor(null);
      setHasMore(true);
      setInitialLoadDone(false);
      setInitialLoading(false);
      return;
    }

    const sessionLoadStart = performance.now();
    console.log("[Session load] Session feedback fetch started", { sessionId });
    let cancelled = false;
    setInitialLoading(true);
    setInitialLoadDone(false);

    console.log("[Session load] GET /api/feedback starting");
    authFetch(
      `/api/feedback?sessionId=${encodeURIComponent(sessionId)}&cursor=&limit=${PAGE_SIZE}`
    )
      .then((res) => {
        console.log("[Session load] GET /api/feedback response arrived in", performance.now() - sessionLoadStart);
        return res.json();
      })
      .then((data: { feedback?: Feedback[]; nextCursor?: string | null; hasMore?: boolean; total?: number; activeCount?: number; resolvedCount?: number }) => {
        if (cancelled) return;
        if (typeof data.total === "number") setTotal(data.total);
        if (typeof data.activeCount === "number") setActiveCount(data.activeCount);
        if (typeof data.resolvedCount === "number") setResolvedCount(data.resolvedCount);
        if (data.feedback?.length) {
          console.log("[Session load] setItems running, count:", data.feedback.length);
          setItems(data.feedback);
          setCursor(data.nextCursor ?? null);
          setHasMore(data.hasMore ?? false);
        } else {
          setItems([]);
          setCursor(null);
          setHasMore(false);
        }
        setInitialLoadDone(true);
        console.log("[Session load] Total session load time:", performance.now() - sessionLoadStart);
      })
      .finally(() => {
        if (!cancelled) setInitialLoading(false);
        if (!cancelled) console.log("[Session load] Page state updated (render will follow)");
      });

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const refetchFirstPage = useCallback(async () => {
    if (!sessionId) return;
    const refetchStart = performance.now();
    console.log("[Refetch] refetchFirstPage called at", refetchStart);
    try {
      const res = await authFetch(
        `/api/feedback?sessionId=${encodeURIComponent(sessionId)}&cursor=&limit=${PAGE_SIZE}`
      );
      const data = (await res.json()) as {
        feedback?: Feedback[];
        nextCursor?: string | null;
        hasMore?: boolean;
        total?: number;
        activeCount?: number;
        resolvedCount?: number;
      };
      if (typeof data.total === "number") setTotal(data.total);
      if (typeof data.activeCount === "number") setActiveCount(data.activeCount);
      if (typeof data.resolvedCount === "number") setResolvedCount(data.resolvedCount);
      if (data.feedback?.length) {
        setItems(data.feedback);
        setCursor(data.nextCursor ?? null);
        setHasMore(data.hasMore ?? false);
      } else {
        setItems([]);
        setCursor(null);
        setHasMore(false);
      }
      console.log("[Refetch] refetchFirstPage finished in", performance.now() - refetchStart);
    } finally {
      // Do not set initialLoading: keep loading only for first mount and loadMore
    }
  }, [sessionId]);

  return {
    feedback: items,
    total,
    activeCount,
    resolvedCount,
    setFeedback: setItems,
    setTotal,
    setActiveCount,
    setResolvedCount,
    loading: initialLoading,
    hasMore,
    hasReachedLimit,
    loadingMore,
    fetchNextPage: loadMore,
    refetchFirstPage,
    loadMoreRef,
  };
}
