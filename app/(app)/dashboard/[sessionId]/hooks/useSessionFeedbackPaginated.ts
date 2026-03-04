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
  /** Skipped count from server (first page only); do not derive from items. */
  skippedCount: number;
  /** Setters for counts so callers can update locally (e.g. after resolve/skip, delete, create without refetch). */
  setTotal: React.Dispatch<React.SetStateAction<number>>;
  setActiveCount: React.Dispatch<React.SetStateAction<number>>;
  setResolvedCount: React.Dispatch<React.SetStateAction<number>>;
  setSkippedCount: React.Dispatch<React.SetStateAction<number>>;
  loading: boolean;
  hasMore: boolean;
  hasReachedLimit: boolean;
  loadingMore: boolean;
  fetchNextPage: () => Promise<void>;
  refetchFirstPage: () => Promise<void>;
  /** Ref to attach to sentinel div for intersection observer. */
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
}

const SCROLL_THRESHOLD_PX = 120;

/**
 * Infinite scroll: first page only on mount; next pages only when user scrolls near bottom.
 * Uses scroll-container ref to avoid triggering load on initial paint.
 * scrollReady: increment when scroll container has mounted (so observer can attach).
 */
export function useSessionFeedbackPaginated(
  sessionId: string | undefined,
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>,
  scrollReady?: number
): UseSessionFeedbackPaginatedResult {
  const [items, setItems] = useState<Feedback[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [activeCount, setActiveCount] = useState<number>(0);
  const [resolvedCount, setResolvedCount] = useState<number>(0);
  const [skippedCount, setSkippedCount] = useState<number>(0);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [userHasScrolledList, setUserHasScrolledList] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const hasReachedLimit = items.length >= FEEDBACK_LOAD_CAP;

  const stateRef = useRef({ items, total, cursor, hasMore, loadingMore, initialLoadDone });
  stateRef.current = { items, total, cursor, hasMore, loadingMore, initialLoadDone };

  const loadMore = useCallback(async () => {
    const s = stateRef.current;
    if (!sessionId || !s.initialLoadDone || s.loadingMore || s.items.length >= FEEDBACK_LOAD_CAP) return;
    if (s.total > 0 && s.items.length >= s.total) {
      setHasMore(false);
      return;
    }
    if (!s.hasMore) return;

    setLoadingMore(true);
    try {
      const url = `/api/feedback?sessionId=${encodeURIComponent(sessionId)}&cursor=${encodeURIComponent(s.cursor ?? "")}&limit=${PAGE_SIZE}`;
      const res = await authFetch(url);
      const data = (await res.json()) as {
        feedback?: Feedback[];
        nextCursor?: string | null;
        hasMore?: boolean;
        total?: number;
        activeCount?: number;
        resolvedCount?: number;
      };

      const appended = data.feedback?.length ?? 0;
      const serverTotal = typeof data.total === "number" ? data.total : s.total;
      if (appended > 0) {
        setItems((prev) => [...prev, ...data.feedback!]);
        setCursor(data.nextCursor ?? null);
        const newLen = s.items.length + appended;
        setHasMore(serverTotal > 0 ? newLen < serverTotal : (data.hasMore ?? false));
      } else {
        setHasMore(false);
      }
    } finally {
      setLoadingMore(false);
    }
  }, [sessionId]);

  const debouncedLoadMore = useMemo(() => {
    let timeout: ReturnType<typeof setTimeout>;
    return () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        loadMore();
      }, DEBOUNCE_MS);
    };
  }, [loadMore]);

  // On scroll near bottom: trigger load when !isFetching && loadedCount < totalCount (refs avoid stale closure).
  useEffect(() => {
    const el = scrollContainerRef?.current;
    if (!el) return;
    let scrollTimeout: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      setUserHasScrolledList(true);
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const s = stateRef.current;
        if (s.loadingMore) return;
        const loadedCount = s.items.length;
        const totalCount = s.total;
        const hasMore = totalCount === 0 ? s.hasMore : loadedCount < totalCount;
        if (!hasMore || loadedCount >= FEEDBACK_LOAD_CAP) return;
        const { scrollTop, clientHeight, scrollHeight } = el;
        if (scrollTop + clientHeight >= scrollHeight - SCROLL_THRESHOLD_PX) {
          debouncedLoadMore();
        }
      }, DEBOUNCE_MS);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [scrollContainerRef, debouncedLoadMore]);

  // Sentinel at bottom: when in view, if hasMore && !isLoading then fetch next page. Reattach when items.length changes.
  useEffect(() => {
    const sentinel = loadMoreRef.current;
    const scrollEl = scrollContainerRef?.current;
    if (!sentinel || !scrollEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        const s = stateRef.current;
        if (s.loadingMore) return;
        const loadedCount = s.items.length;
        const totalCount = s.total;
        const hasMore = totalCount === 0 ? s.hasMore : loadedCount < totalCount;
        if (!hasMore) return;
        if (loadedCount >= FEEDBACK_LOAD_CAP) return;
        debouncedLoadMore();
      },
      { root: scrollEl, rootMargin: `${SCROLL_THRESHOLD_PX}px`, threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [scrollContainerRef, scrollReady, items.length, debouncedLoadMore]);

  // Fetch counts immediately so UI never shows 0 while first page loads.
  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    authFetch(`/api/feedback/counts?sessionId=${encodeURIComponent(sessionId)}`)
      .then((res) => res.json())
      .then((data: { total?: number; openCount?: number; resolvedCount?: number; skippedCount?: number }) => {
        if (cancelled) return;
        if (typeof data.total === "number") setTotal(data.total);
        if (typeof data.openCount === "number") setActiveCount(data.openCount);
        if (typeof data.resolvedCount === "number") setResolvedCount(data.resolvedCount);
        if (typeof data.skippedCount === "number") setSkippedCount(data.skippedCount);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  // Initial load: first page when sessionId becomes available.
  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;
    setInitialLoading(true);
    setInitialLoadDone(false);

    authFetch(
      `/api/feedback?sessionId=${encodeURIComponent(sessionId)}&cursor=&limit=${PAGE_SIZE}`
    )
      .then((res) => res.json())
      .then((data: { feedback?: Feedback[]; nextCursor?: string | null; hasMore?: boolean; total?: number; activeCount?: number; resolvedCount?: number; skippedCount?: number }) => {
        if (cancelled) return;
        if (typeof data.total === "number") setTotal(data.total);
        if (typeof data.activeCount === "number") setActiveCount(data.activeCount);
        if (typeof data.resolvedCount === "number") setResolvedCount(data.resolvedCount);
        if (typeof data.skippedCount === "number") setSkippedCount(data.skippedCount);
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
        skippedCount?: number;
      };
      if (typeof data.total === "number") setTotal(data.total);
      if (typeof data.activeCount === "number") setActiveCount(data.activeCount);
      if (typeof data.resolvedCount === "number") setResolvedCount(data.resolvedCount);
      if (typeof data.skippedCount === "number") setSkippedCount(data.skippedCount);
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
      // Do not set initialLoading: keep loading only for first mount and loadMore
    }
  }, [sessionId]);

  return {
    feedback: items,
    total,
    activeCount,
    resolvedCount,
    skippedCount,
    setFeedback: setItems,
    setTotal,
    setActiveCount,
    setResolvedCount,
    setSkippedCount,
    loading: initialLoading,
    hasMore,
    hasReachedLimit,
    loadingMore,
    fetchNextPage: loadMore,
    refetchFirstPage,
    loadMoreRef,
  };
}
