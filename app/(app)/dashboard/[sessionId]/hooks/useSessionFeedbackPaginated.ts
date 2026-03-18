"use client";

import { authFetch } from "@/lib/authFetch";
import { cachedFetch } from "@/lib/client/requestCache";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { Feedback } from "@/lib/domain/feedback";

const PAGE_SIZE = 25;
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

const SCROLL_THRESHOLD_PX = 300;

/**
 * Infinite scroll: API pagination is the ONLY source of truth.
 * First page on mount; next pages when user scrolls near bottom.
 */
export function useSessionFeedbackPaginated(
  sessionId: string | undefined,
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>,
  scrollReady?: number
): UseSessionFeedbackPaginatedResult {
  const [apiItems, setApiItems] = useState<Feedback[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [activeCount, setActiveCount] = useState<number>(0);
  const [resolvedCount, setResolvedCount] = useState<number>(0);
  const [skippedCount, setSkippedCount] = useState<number>(0);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const hasFetchedRef = useRef(false);
  const prevSessionIdRef = useRef<string | undefined>(undefined);

  const stateRef = useRef({
    apiItems,
    total,
    cursor,
    hasMore,
    loadingMore,
    initialLoadDone,
    currentRequestId: 0,
  });
  stateRef.current = {
    apiItems,
    total,
    cursor,
    hasMore,
    loadingMore,
    initialLoadDone,
    currentRequestId: stateRef.current.currentRequestId,
  };

  const loadMore = useCallback(async () => {
    if (stateRef.current.loadingMore) return;
    setLoadingMore(true);

    const s = stateRef.current;
    const loadedCount = s.apiItems.length;
    if (!sessionId || !s.initialLoadDone || loadedCount >= FEEDBACK_LOAD_CAP) {
      setLoadingMore(false);
      return;
    }
    if (!s.hasMore) {
      setLoadingMore(false);
      return;
    }

    const requestId = Date.now();
    stateRef.current.currentRequestId = requestId;

    console.log("[FETCH TRIGGERED]", { sessionId, cursor: s.cursor ?? "", source: "loadMore" });
    try {
      const url = `/api/feedback?sessionId=${encodeURIComponent(sessionId)}&cursor=${encodeURIComponent(s.cursor ?? "")}&limit=${PAGE_SIZE}`;
      const res = await cachedFetch(url, () => authFetch(url));
      const data = (await res.json()) as {
        feedback?: Feedback[];
        nextCursor?: string | null;
        hasMore?: boolean;
        totalCount?: number;
        total?: number;
        openCount?: number;
        activeCount?: number;
        resolvedCount?: number;
        skippedCount?: number;
      };

      if (stateRef.current.currentRequestId !== requestId) return;

      if (!data.feedback || data.feedback.length === 0) {
        setHasMore(false);
        setLoadingMore(false);
        return;
      }

      const hasMoreNext = data.hasMore ?? (data.feedback.length === PAGE_SIZE);
      setHasMore(hasMoreNext);
      setApiItems((prev) => {
        const existingIds = new Set(prev.map((i) => i.id));
        const newItems = data.feedback!.filter((i) => !existingIds.has(i.id));
        return [...prev, ...newItems];
      });
      setCursor(data.nextCursor ?? null);
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

  // Sentinel at bottom: when in view, if hasMore && !loadingMore then fetch next page.
  useEffect(() => {
    const sentinel = loadMoreRef.current;
    const scrollEl = scrollContainerRef?.current;
    if (!sentinel || !scrollEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        const s = stateRef.current;
        if (!s.loadingMore && s.hasMore) {
          if (s.apiItems.length < FEEDBACK_LOAD_CAP) debouncedLoadMore();
        }
      },
      { root: scrollEl, rootMargin: `${SCROLL_THRESHOLD_PX}px`, threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [scrollContainerRef, scrollReady, apiItems.length, debouncedLoadMore]);

  // Initial load: API only. When sessionId is set, fetch first page.
  useEffect(() => {
    if (!sessionId) {
      hasFetchedRef.current = false;
      prevSessionIdRef.current = undefined;
      setInitialLoading(false);
      setInitialLoadDone(false);
      setApiItems([]);
      setCursor(null);
      setHasMore(true);
      setTotal(0);
      setActiveCount(0);
      setResolvedCount(0);
      setSkippedCount(0);
      return;
    }

    if (prevSessionIdRef.current !== sessionId) {
      hasFetchedRef.current = false;
      prevSessionIdRef.current = sessionId;
    }
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    setInitialLoading(true);
    setInitialLoadDone(false);
    setApiItems([]);
    setCursor(null);
    setHasMore(true);

    let cancelled = false;
    console.log("[FETCH TRIGGERED]", { sessionId, cursor: "", source: "initial" });
    (async () => {
      try {
        const url = `/api/feedback?sessionId=${encodeURIComponent(sessionId)}&limit=${PAGE_SIZE}`;
        const res = await cachedFetch(url, () => authFetch(url));
        const data = (await res.json()) as {
          feedback?: Feedback[];
          nextCursor?: string | null;
          hasMore?: boolean;
          totalCount?: number;
          total?: number;
          openCount?: number;
          activeCount?: number;
          resolvedCount?: number;
          skippedCount?: number;
        };

        if (cancelled) return;

        setApiItems(data.feedback ?? []);
        setCursor(data.nextCursor ?? null);
        const hasMoreNext = data.hasMore ?? ((data.feedback?.length ?? 0) === PAGE_SIZE);
        setHasMore(hasMoreNext);

        const totalFromApi = typeof data.totalCount === "number" ? data.totalCount : (typeof data.total === "number" ? data.total : 0);
        setTotal(totalFromApi);
        const open = typeof data.openCount === "number" ? data.openCount : typeof data.activeCount === "number" ? data.activeCount : undefined;
        if (typeof open === "number") setActiveCount(open);
        if (typeof data.resolvedCount === "number") setResolvedCount(data.resolvedCount);
        if (typeof data.skippedCount === "number") setSkippedCount(data.skippedCount);
      } catch {
        if (!cancelled) {
          setHasMore(false);
          setCursor(null);
        }
      } finally {
        if (!cancelled) {
          setInitialLoadDone(true);
          setInitialLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const refetchFirstPage = useCallback(async () => {
    if (!sessionId) return;
    if (stateRef.current.loadingMore) return;
    setCursor(null);
    console.log("[FETCH TRIGGERED]", { sessionId, cursor: "", source: "refetch" });
    try {
      const url = `/api/feedback?sessionId=${encodeURIComponent(sessionId)}&cursor=&limit=${PAGE_SIZE}`;
      const res = await cachedFetch(url, () => authFetch(url));
      const data = (await res.json()) as {
        feedback?: Feedback[];
        nextCursor?: string | null;
        hasMore?: boolean;
        totalCount?: number;
        total?: number;
        openCount?: number;
        activeCount?: number;
        resolvedCount?: number;
        skippedCount?: number;
      };
      const totalFromApi = typeof data.totalCount === "number" ? data.totalCount : (typeof data.total === "number" ? data.total : 0);
      setTotal(totalFromApi);
      const open = typeof data.openCount === "number" ? data.openCount : typeof data.activeCount === "number" ? data.activeCount : undefined;
      if (typeof open === "number") setActiveCount(open);
      if (typeof data.resolvedCount === "number") setResolvedCount(data.resolvedCount);
      if (typeof data.skippedCount === "number") setSkippedCount(data.skippedCount);
      setApiItems(data.feedback ?? []);
      setCursor(data.nextCursor ?? null);
      setHasMore(data.hasMore ?? ((data.feedback?.length ?? 0) === PAGE_SIZE));
    } finally {
      // Keep loading only for first mount and loadMore
    }
  }, [sessionId]);

  const hasReachedLimit = apiItems.length >= FEEDBACK_LOAD_CAP;

  return {
    feedback: apiItems,
    total,
    activeCount,
    resolvedCount,
    skippedCount,
    setFeedback: setApiItems,
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
