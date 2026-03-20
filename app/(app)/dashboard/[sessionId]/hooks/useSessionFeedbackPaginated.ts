"use client";

import { authFetch } from "@/lib/authFetch";
import { cachedFetch } from "@/lib/client/requestCache";
import { useState, useEffect, useLayoutEffect, useCallback, useRef, useMemo } from "react";
import type { Feedback } from "@/lib/domain/feedback";
import {
  getCounts,
  setCounts as setStoreCounts,
  subscribeCounts,
  type Counts,
} from "@/lib/state/sessionCountsStore";
import { fetchCountsDedup } from "@/lib/state/fetchCountsDedup";
import {
  subscribeFeedbackSession,
  useFeedbackRealtimeStore,
} from "@/lib/realtime/feedbackStore";

const PAGE_SIZE = 20;
/** Client-side read cap: stop loading more after this many items (cost protection). */
const FEEDBACK_LOAD_CAP = 200;

const ZERO_COUNTS: Counts = {
  total: 0,
  open: 0,
  resolved: 0,
  skipped: 0,
};

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
  /** While true, counts are still loading from `/api/feedback/counts`. */
  countsLoading: boolean;
  loading: boolean;
  hasMore: boolean;
  hasReachedLimit: boolean;
  loadingMore: boolean;
  fetchNextPage: () => Promise<void>;
  refetchFirstPage: () => Promise<void>;
  /** Ref to attach to sentinel div for intersection observer. */
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
}

const SCROLL_THRESHOLD_PX = 150;

/**
 * Infinite scroll: first page only on mount; next pages only when user scrolls near bottom.
 * Uses scroll-container ref to avoid triggering load on initial paint.
 * scrollReady: increment when scroll container has mounted (so observer can attach).
 */
export function useSessionFeedbackPaginated(
  sessionId: string | undefined,
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>,
  scrollReady?: number,
  onNewTicketFromRealtime?: (newestTicketId: string) => void
): UseSessionFeedbackPaginatedResult {
  const feedbackRealtime = useFeedbackRealtimeStore();
  const realtimeItems = useMemo(() => {
    if (!sessionId) return [];
    if (feedbackRealtime.sessionId !== sessionId) return [];
    return feedbackRealtime.items;
  }, [feedbackRealtime.sessionId, feedbackRealtime.items, sessionId]);
  const [apiItems, setApiItems] = useState<Feedback[]>([]);
  const [counts, setCountsState] = useState<Counts>(ZERO_COUNTS);
  const total = counts.total;
  const activeCount = counts.open;
  const resolvedCount = counts.resolved;
  const skippedCount = counts.skipped;
  const [countsLoading, setCountsLoading] = useState<boolean>(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef(false);
  const hasUserScrolledRef = useRef(false);
  const hasFetchedRef = useRef(false);
  const countsLoadedRef = useRef(false);
  const sessionIdRef = useRef<string | undefined>(sessionId);

  // Keep a ref to the latest sessionId so in-flight async pagination
  // can't update state after the user switches sessions.
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  // Reset infinite scroll state when sessionId changes to avoid ghost items.
  useLayoutEffect(() => {
    setApiItems([]);
    setCountsState(ZERO_COUNTS);
    setCursor(null);
    setHasMore(true);
    setLoadingMore(false);
    setInitialLoadDone(false);
    isFetchingRef.current = false;
    hasUserScrolledRef.current = false;
    // Refs (used by the realtime + pagination effects) must also be reset immediately,
    // otherwise in-flight seeding/pagination may update state for the new session.
    hasFetchedRef.current = false;
    countsLoadedRef.current = false;
    previousFeedbackCountRef.current = 0;
  }, [sessionId]);

  /** Track previous snapshot size so we can detect new tickets and auto-select the newest. */
  const previousFeedbackCountRef = useRef(0);
  const onNewTicketFromRealtimeRef = useRef(onNewTicketFromRealtime);
  onNewTicketFromRealtimeRef.current = onNewTicketFromRealtime;

  const getTimestamp = useCallback((item: Feedback): number => {
    if (!item?.createdAt) return 0;

    // ISO string (API)
    if (typeof item.createdAt === "string") {
      const time = new Date(item.createdAt).getTime();
      return Number.isNaN(time) ? 0 : time;
    }

    // Firestore Timestamp (realtime)
    if (item.createdAt?.toMillis) {
      return item.createdAt.toMillis();
    }

    // Legacy fallback
    if ((item.createdAt as { seconds?: number })?.seconds) {
      return (item.createdAt as { seconds: number }).seconds * 1000;
    }

    return 0;
  }, []);

  const items = useMemo(() => {
    // Deterministic source-of-truth merge:
    // 1) Insert realtime window first (authoritative for latest items).
    // 2) Insert API pagination items only if absent.
    // 3) Sort once by normalized createdAt timestamp.
    const byId = new Map<string, Feedback>();
    for (const f of realtimeItems) byId.set(f.id, f);
    for (const f of apiItems) {
      if (!byId.has(f.id)) byId.set(f.id, f);
    }
    const merged = Array.from(byId.values()).sort((a, b) => getTimestamp(b) - getTimestamp(a));
    console.log("MERGE feedback", {
      realtimeCount: realtimeItems.length,
      apiCount: apiItems.length,
      mergedCount: merged.length,
    });
    return merged;
  }, [realtimeItems, apiItems, getTimestamp]);

  const hasReachedLimit = items.length >= FEEDBACK_LOAD_CAP;

  const stateRef = useRef({
    realtimeItems,
    apiItems,
    total,
    cursor,
    hasMore,
    loadingMore,
    initialLoadDone,
  });
  stateRef.current = {
    realtimeItems,
    apiItems,
    total,
    cursor,
    hasMore,
    loadingMore,
    initialLoadDone,
  };

  const loadMore = useCallback(async () => {
    const startedSessionId = sessionId;
    const s = stateRef.current;
    const hasMore = s.hasMore;
    const isLoading = s.loadingMore;
    console.log("LOAD MORE TRIGGERED", { hasMore, isLoading });
    const loadedCount = s.realtimeItems.length + s.apiItems.length;
    if (!sessionId || !s.initialLoadDone || s.loadingMore || isFetchingRef.current || loadedCount >= FEEDBACK_LOAD_CAP) return;
    if (s.total > 0 && loadedCount >= s.total) {
      setHasMore(false);
      return;
    }
    if (!s.hasMore) return;

    // Lock fetches immediately to prevent concurrent triggers from scroll + observer.
    isFetchingRef.current = true;
    stateRef.current.loadingMore = true;
    setLoadingMore(true);
    try {
      const cursor = s.cursor;
      console.log("Fetching next page with cursor:", cursor);
      const url = `/api/feedback?sessionId=${encodeURIComponent(sessionId)}&cursor=${encodeURIComponent(cursor ?? "")}&limit=${PAGE_SIZE}`;
      const res = await cachedFetch(url, () => authFetch(url));
      const data = (await res.json()) as {
        feedback?: Feedback[];
        nextCursor?: string | null;
        hasMore?: boolean;
        total?: number;
        activeCount?: number;
        resolvedCount?: number;
      };

      // If the user switched sessions while this request was in flight, ignore this response.
      if (sessionIdRef.current !== startedSessionId) return;

      const incoming = data.feedback ?? [];
      const pageCursor = data.nextCursor ?? (incoming.length > 0 ? incoming[incoming.length - 1]?.id ?? null : null);
      console.log("LOAD MORE RESULT", {
        cursor,
        returnedCount: incoming.length,
      });

      // De-dupe on the client. The server cursor pagination is correct, but realtime inserts can cause overlap.
      const existingIds = new Set<string>();
      for (const f of s.realtimeItems) existingIds.add(f.id);
      for (const f of s.apiItems) existingIds.add(f.id);
      const uniqueIncoming = incoming.filter((f) => !existingIds.has(f.id));

      if (incoming.length > 0) {
        if (uniqueIncoming.length > 0) {
          setApiItems((prev) => {
            const existingIds = new Set<string>(prev.map((i) => i.id));
            // Also prevent adding items already present in the realtime window.
            for (const f of stateRef.current.realtimeItems) existingIds.add(f.id);
            const newItems = incoming.filter((i) => !existingIds.has(i.id));
            return [...prev, ...newItems];
          });
        }

        setCursor(pageCursor);

        // If total isn't provided by the API, we rely on `data.hasMore`.
        const serverTotal = typeof data.total === "number" ? data.total : s.total;
        const newLen = loadedCount + uniqueIncoming.length;
        setHasMore(serverTotal > 0 ? newLen < serverTotal : data.hasMore ?? false);
      } else {
        setHasMore(false);
        setCursor(pageCursor);
      }
    } finally {
      isFetchingRef.current = false;
      stateRef.current.loadingMore = false;
      setLoadingMore(false);
    }
  }, [sessionId]);

  // On scroll near bottom: trigger load early using threshold + fetch lock.
  useEffect(() => {
    const el = scrollContainerRef?.current;
    if (!el) return;
    let ignoreFirstScrollEvent = true;
    const onScroll = () => {
      // Prevent "auto-loading" if we receive a synthetic scroll event right after mount / observer attach.
      if (ignoreFirstScrollEvent) {
        ignoreFirstScrollEvent = false;
        return;
      }
      hasUserScrolledRef.current = true;
      const s = stateRef.current;
      if (s.loadingMore || isFetchingRef.current) return;
      const loadedCount = s.realtimeItems.length + s.apiItems.length;
      if (loadedCount >= FEEDBACK_LOAD_CAP) return;
      const totalCount = s.total;
      const hasMore = totalCount === 0 ? s.hasMore : loadedCount < totalCount;
      if (!hasMore) return;

      const shouldLoadMore = el.scrollTop + el.clientHeight >= el.scrollHeight - SCROLL_THRESHOLD_PX;
      if (shouldLoadMore) void loadMore();
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
    };
  }, [scrollContainerRef, scrollReady, loadMore]);

  // Sentinel at bottom: when in view, if hasMore && !isLoading then fetch next page. Reattach when items.length changes.
  useEffect(() => {
    const sentinel = loadMoreRef.current;
    const scrollEl = scrollContainerRef?.current;
    if (!sentinel || !scrollEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        console.log("Observer triggered", Boolean(entry?.isIntersecting));
        if (!entry?.isIntersecting) return;
        if (!hasUserScrolledRef.current) return;
        const s = stateRef.current;
        const hasMore =
          s.total === 0 ? s.hasMore : s.realtimeItems.length + s.apiItems.length < s.total;
        console.log("hasMore:", hasMore);
        const isLoading = s.loadingMore || isFetchingRef.current;
        if (!hasMore) return;
        if (isLoading) return;
        const loadedCount = s.realtimeItems.length + s.apiItems.length;
        if (loadedCount >= FEEDBACK_LOAD_CAP) return;
        void loadMore();
      },
      { root: scrollEl, rootMargin: "150px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [scrollContainerRef, scrollReady, items.length, loadMore]);

  // When no sessionId, clear loading so we don't block the list area.
  useEffect(() => {
    if (!sessionId) {
      setInitialLoading(false);
      setInitialLoadDone(false);
      hasFetchedRef.current = false;
      countsLoadedRef.current = false;
      hasUserScrolledRef.current = false;
      previousFeedbackCountRef.current = 0;
      setCountsLoading(false);
      setCountsState(ZERO_COUNTS);
      setApiItems([]);
      setCursor(null);
      setHasMore(true);
      isFetchingRef.current = false;
      return;
    }
    setInitialLoading(true);
    setInitialLoadDone(false);
    hasFetchedRef.current = false;
    countsLoadedRef.current = false;
    const cached = getCounts(sessionId);
    if (cached) {
      setCountsState(cached);
      setCountsLoading(false);
      countsLoadedRef.current = true;
      subscribeFeedbackSession(sessionId);
      return;
    }

    setCountsState(ZERO_COUNTS);
    setCountsLoading(true);
    setApiItems([]);
    setCursor(null);
    setHasMore(true);
    isFetchingRef.current = false;
    countsLoadedRef.current = true;

    let cancelled = false;
    void (async () => {
      try {
        const next = await fetchCountsDedup(sessionId);
        if (cancelled || sessionIdRef.current !== sessionId) return;
        setStoreCounts(sessionId, next);
      } catch {
        if (!cancelled) setCountsLoading(false);
      }
    })();

    subscribeFeedbackSession(sessionId);

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    return subscribeCounts(sessionId, (nextCounts) => {
      setCountsState(nextCounts);
      setCountsLoading(false);
    });
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    if (feedbackRealtime.sessionId !== sessionId) return;
    if (feedbackRealtime.loading) return;

    const effectSessionId = sessionId;
    const snapshotList = realtimeItems;
    const realtimeWindowCount = snapshotList.length;

    if (realtimeWindowCount > previousFeedbackCountRef.current && snapshotList.length > 0) {
      const newestTicketId = snapshotList[0].id;
      onNewTicketFromRealtimeRef.current?.(newestTicketId);
    }
    previousFeedbackCountRef.current = realtimeWindowCount;

    const isFirstSnapshot = !stateRef.current.initialLoadDone;
    if (!isFirstSnapshot) return;

    setInitialLoadDone(true);
    setInitialLoading(false);
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    // Seed pagination + true totals from the API. API items are treated as older pages.
    void (async () => {
      try {
        const url = `/api/feedback?sessionId=${encodeURIComponent(effectSessionId)}&cursor=&limit=${PAGE_SIZE}`;
        const res = await cachedFetch(url, () => authFetch(url));
        const data = (await res.json()) as {
          feedback?: Feedback[];
          nextCursor?: string | null;
          hasMore?: boolean;
          total?: number;
          activeCount?: number;
          resolvedCount?: number;
          skippedCount?: number;
        };
        // Ignore stale API seeding if the user switched sessions.
        if (sessionIdRef.current !== effectSessionId) return;
        const incoming = data.feedback ?? [];
        const pageCursor = data.nextCursor ?? (incoming.length > 0 ? incoming[incoming.length - 1]?.id ?? null : null);
        setCursor(pageCursor);
        setHasMore(data.hasMore ?? false);
        if (incoming.length > 0) {
          setApiItems(() => {
            const seen = new Set<string>();
            for (const f of stateRef.current.realtimeItems) seen.add(f.id);
            const next: Feedback[] = [];
            for (const f of incoming) {
              if (seen.has(f.id)) continue;
              seen.add(f.id);
              next.push(f);
            }
            return next;
          });
          console.log("SEED PAGE RESULT", {
            cursor: pageCursor,
            returnedCount: incoming.length,
          });
        }
      } catch {
        // If API seeding fails, realtime list still works; pagination will remain unavailable.
        setHasMore(false);
        setCursor(null);
      }
    })();
  }, [
    feedbackRealtime.loading,
    feedbackRealtime.sessionId,
    feedbackRealtime.version,
    realtimeItems,
    sessionId,
  ]);

  const refetchFirstPage = useCallback(async () => {
    if (!sessionId) return;
    const startedSessionId = sessionId;
    try {
      const url = `/api/feedback?sessionId=${encodeURIComponent(sessionId)}&cursor=&limit=${PAGE_SIZE}`;
      const res = await cachedFetch(url, () => authFetch(url));
      const data = (await res.json()) as {
        feedback?: Feedback[];
        nextCursor?: string | null;
        hasMore?: boolean;
        total?: number;
        activeCount?: number;
        resolvedCount?: number;
        skippedCount?: number;
      };
      if (sessionIdRef.current !== startedSessionId) return;
      const incoming = data.feedback ?? [];
      const pageCursor = data.nextCursor ?? (incoming.length > 0 ? incoming[incoming.length - 1]?.id ?? null : null);
      if (incoming.length) {
        setApiItems(() => {
          const seen = new Set<string>();
          for (const f of stateRef.current.realtimeItems) seen.add(f.id);
          const next: Feedback[] = [];
          for (const f of incoming) {
            if (seen.has(f.id)) continue;
            seen.add(f.id);
            next.push(f);
          }
          return next;
        });
        setCursor(pageCursor);
        setHasMore(data.hasMore ?? false);
        console.log("REFETCH PAGE RESULT", {
          cursor: pageCursor,
          returnedCount: incoming.length,
        });
      } else {
        setApiItems([]);
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
    countsLoading,
    setFeedback: setApiItems,
    loading: initialLoading,
    hasMore,
    hasReachedLimit,
    loadingMore,
    fetchNextPage: loadMore,
    refetchFirstPage,
    loadMoreRef,
  };
}
