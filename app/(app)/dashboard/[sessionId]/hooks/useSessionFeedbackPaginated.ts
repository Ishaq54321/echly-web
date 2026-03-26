"use client";

import { authFetch } from "@/lib/authFetch";
import { cachedFetch } from "@/lib/client/requestCache";
import { useState, useEffect, useLayoutEffect, useCallback, useRef, useMemo } from "react";
import type { Feedback } from "@/lib/domain/feedback";
import { getTicketStatus } from "@/lib/domain/feedback";
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
import { ECHLY_STRICT_MODE } from "@/lib/guardrails";

const PAGE_SIZE = 30;
/** Client-side read cap: stop loading more after this many items (cost protection). */
const FEEDBACK_LOAD_CAP = 200;

const ZERO_COUNTS: Counts = {
  total: 0,
  open: 0,
  resolved: 0,
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
  /** While true, counts are still loading from `/api/feedback/counts`. */
  countsLoading: boolean;
  loading: boolean;
  /** True while more open or (when expanded) more resolved pages exist to load. */
  hasMore: boolean;
  hasReachedLimit: boolean;
  loadingMore: boolean;
  /** True after first resolved fetch completes (even if empty). */
  hasLoadedResolved: boolean;
  /** True while the initial resolved page fetch is in flight. */
  isLoadingResolved: boolean;
  /** Ref to attach to sentinel div for intersection observer. */
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
}

const SCROLL_THRESHOLD_PX = 150;

/** ISO string or Firestore `{ seconds }` — single source for sidebar ordering. */
function getTimestamp(item: Feedback): number {
  if (!item) return 0;
  if (typeof item.createdAt === "string") {
    const t = new Date(item.createdAt).getTime();
    return Number.isNaN(t) ? 0 : t;
  }
  if (item.createdAt?.seconds != null && typeof item.createdAt.seconds === "number") {
    return item.createdAt.seconds * 1000;
  }
  return 0;
}

function dedupeFeedbackById(items: Feedback[]): Feedback[] {
  const byId = new Map<string, Feedback>();
  for (const item of items) {
    byId.set(item.id, item);
  }
  return Array.from(byId.values());
}

function feedbackListUrl(
  sessionId: string,
  cursor: string | null,
  limit: number,
  status: "open" | "resolved"
): string {
  return `/api/feedback?sessionId=${encodeURIComponent(sessionId)}&cursor=${encodeURIComponent(cursor ?? "")}&limit=${limit}&status=${status}`;
}

function countLoadedByStatus(items: Feedback[]): { open: number; resolved: number } {
  const seen = new Set<string>();
  let open = 0;
  let resolved = 0;
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    const st = getTicketStatus(item);
    if (st === "open") open += 1;
    else resolved += 1;
  }
  return { open, resolved };
}

/**
 * Open tickets: first page on mount; pagination + viewport fill + scroll.
 * Resolved tickets: fetched only when `resolvedExpanded` is true; separate cursor chain.
 */
export function useSessionFeedbackPaginated(
  sessionId: string | undefined,
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>,
  scrollReady?: number,
  onNewTicketFromRealtime?: (newestTicketId: string) => void,
  resolvedExpanded: boolean = false,
  openExpanded: boolean = true,
  isSearchMode: boolean = false
): UseSessionFeedbackPaginatedResult {
  const feedbackRealtime = useFeedbackRealtimeStore();
  const realtimeItems = useMemo(() => {
    if (!sessionId) return [];
    if (feedbackRealtime.sessionId !== sessionId) return [];
    return feedbackRealtime.items;
  }, [feedbackRealtime.sessionId, feedbackRealtime.items, sessionId]);
  const [items, setItems] = useState<Feedback[]>([]);
  const [counts, setCountsState] = useState<Counts>(ZERO_COUNTS);
  const total = counts.total;
  const activeCount = counts.open;
  const resolvedCount = counts.resolved;
  const [countsLoading, setCountsLoading] = useState<boolean>(true);
  const [openCursor, setOpenCursor] = useState<string | null>(null);
  const [resolvedCursor, setResolvedCursor] = useState<string | null>(null);
  const [openHasMore, setOpenHasMore] = useState(true);
  const [resolvedHasMore, setResolvedHasMore] = useState(false);
  const [hasLoadedResolved, setHasLoadedResolved] = useState(false);
  const [isLoadingResolved, setIsLoadingResolved] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  /** One-time pin to top after first load + viewport fill for this session; not used for pagination/loadMore. */
  const hasInitializedScrollRef = useRef(false);
  /** At most one viewport-fill pass per session after initial load (avoids refetch on expand/scrollReady churn). */
  const hasViewportFillCompletedRef = useRef(false);
  const isFetchingRef = useRef(false);
  const hasFetchedRef = useRef(false);
  const countsLoadedRef = useRef(false);
  const sessionIdRef = useRef<string | undefined>(sessionId);
  const itemsRef = useRef<Feedback[]>([]);
  const countsDirtyRef = useRef(false);
  const countsDebounceRef = useRef<number | null>(null);
  const resolvedExpandedRef = useRef(resolvedExpanded);
  resolvedExpandedRef.current = resolvedExpanded;
  const openExpandedRef = useRef(openExpanded);
  openExpandedRef.current = openExpanded;
  const isSearchModeRef = useRef(isSearchMode);
  isSearchModeRef.current = isSearchMode;

  const isLoadingRef = useRef(false);

  const guardMultipleSources = useCallback(
    (apiItems: Feedback[]) => {
      if (ECHLY_STRICT_MODE) {
        if (
          Array.isArray(realtimeItems) &&
          Array.isArray(apiItems) &&
          realtimeItems.length > 0 &&
          apiItems.length > 0
        ) {
          console.warn("[ECHLY] GUARDRAIL multiple sources present (expected during hydration)");
        }
      }

      if (ECHLY_STRICT_MODE) {
        if (!Array.isArray(itemsRef.current)) {
          console.error("[ECHLY] GUARDRAIL canonical items list missing — CRITICAL");
        }
      }
    },
    [realtimeItems]
  );

  const sortByCreatedAtDesc = useCallback((list: Feedback[]): Feedback[] => {
    const deduped = dedupeFeedbackById(list);
    deduped.sort((a, b) => {
      const diff = getTimestamp(b) - getTimestamp(a);
      if (diff !== 0) return diff;
      return b.id.localeCompare(a.id);
    });
    return deduped;
  }, []);

  /** After any merge (realtime + REST), dedupe by id then sort newest first (stable UI). */
  const finalizeList = useCallback(
    (list: Feedback[]): Feedback[] => sortByCreatedAtDesc(list),
    [sortByCreatedAtDesc]
  );

  const setCanonicalFeedback = useCallback(
    (updater: React.SetStateAction<Feedback[]>) => {
      const current = itemsRef.current;
      const next = typeof updater === "function" ? updater(current) : updater;
      const normalized = finalizeList(next);
      itemsRef.current = normalized;
      setItems(normalized);
    },
    [finalizeList]
  );

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    return () => {
      if (countsDebounceRef.current !== null) {
        clearTimeout(countsDebounceRef.current);
        countsDebounceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useLayoutEffect(() => {
    setCanonicalFeedback([]);
    setCountsState(ZERO_COUNTS);
    setOpenCursor(null);
    setResolvedCursor(null);
    setOpenHasMore(true);
    setResolvedHasMore(false);
    setHasLoadedResolved(false);
    setIsLoadingResolved(false);
    setLoadingMore(false);
    setInitialLoadDone(false);
    isFetchingRef.current = false;
    isLoadingRef.current = false;
    hasFetchedRef.current = false;
    countsLoadedRef.current = false;
    previousFeedbackCountRef.current = 0;
    realtimeBootstrapDoneRef.current = false;
    if (countsDebounceRef.current !== null) {
      clearTimeout(countsDebounceRef.current);
      countsDebounceRef.current = null;
    }
    countsDirtyRef.current = false;
    hasInitializedScrollRef.current = false;
    hasViewportFillCompletedRef.current = false;
  }, [sessionId, setCanonicalFeedback]);

  const previousFeedbackCountRef = useRef(0);
  const realtimeBootstrapDoneRef = useRef(false);
  const onNewTicketFromRealtimeRef = useRef(onNewTicketFromRealtime);
  onNewTicketFromRealtimeRef.current = onNewTicketFromRealtime;

  const appendPage = useCallback(
    (incoming: Feedback[]): number => {
      if (incoming.length === 0) return 0;
      const byId = new Map<string, Feedback>(itemsRef.current.map((item) => [item.id, item]));
      let appended = 0;
      for (const item of incoming) {
        if (item.isDeleted === true) continue;
        if (byId.has(item.id)) continue;
        byId.set(item.id, item);
        appended += 1;
      }
      if (appended === 0) return 0;
      const merged = Array.from(byId.values());
      const normalized = finalizeList(merged);
      itemsRef.current = normalized;
      setItems(normalized);
      return appended;
    },
    [finalizeList]
  );

  const hasReachedLimit = items.length >= FEEDBACK_LOAD_CAP;

  const hasMoreCombined = useMemo(() => {
    if (openHasMore) return true;
    if (resolvedExpanded && hasLoadedResolved && resolvedHasMore) return true;
    return false;
  }, [openHasMore, resolvedExpanded, hasLoadedResolved, resolvedHasMore]);

  const stateRef = useRef({
    items,
    total,
    activeCount,
    resolvedCount,
    openCursor,
    resolvedCursor,
    openHasMore,
    resolvedHasMore,
    loadingMore,
    initialLoadDone,
    hasLoadedResolved,
    resolvedExpanded,
    openExpanded,
  });
  stateRef.current = {
    items,
    total,
    activeCount,
    resolvedCount,
    openCursor,
    resolvedCursor,
    openHasMore,
    resolvedHasMore,
    loadingMore,
    initialLoadDone,
    hasLoadedResolved,
    resolvedExpanded,
    openExpanded,
  };

  const fetchOpenPage = useCallback(
    async (startedSessionId: string, cursor: string | null): Promise<void> => {
      const url = feedbackListUrl(startedSessionId, cursor, PAGE_SIZE, "open");
      const bypassCache = cursor != null && cursor !== "";
      const res = await cachedFetch(url, () => authFetch(url), undefined, bypassCache);
      const data = (await res.json()) as {
        feedback?: Feedback[];
        nextCursor?: string | null;
        hasMore?: boolean;
      };
      if (sessionIdRef.current !== startedSessionId) return;
      const apiItems = data.feedback ?? [];
      guardMultipleSources(apiItems);
      const incoming = apiItems;
      const pageCursor = data.nextCursor ?? (incoming.length > 0 ? incoming[incoming.length - 1]?.id ?? null : null);
      const s = stateRef.current;

      if (incoming.length > 0) {
        appendPage(incoming);
        setOpenCursor(pageCursor);
        const newLoadedOpen = countLoadedByStatus(itemsRef.current).open;
        if (s.activeCount > 0) {
          setOpenHasMore((data.hasMore ?? false) && newLoadedOpen < s.activeCount);
        } else {
          setOpenHasMore(data.hasMore ?? false);
        }
      } else {
        setOpenHasMore(false);
        setOpenCursor(pageCursor);
      }
    },
    [appendPage, guardMultipleSources]
  );

  const fetchResolvedPage = useCallback(
    async (startedSessionId: string, cursor: string | null): Promise<void> => {
      if (!resolvedExpandedRef.current) return;
      const url = feedbackListUrl(startedSessionId, cursor, PAGE_SIZE, "resolved");
      const bypassCache = cursor != null && cursor !== "";
      const res = await cachedFetch(url, () => authFetch(url), undefined, bypassCache);
      const data = (await res.json()) as {
        feedback?: Feedback[];
        nextCursor?: string | null;
        hasMore?: boolean;
      };
      if (sessionIdRef.current !== startedSessionId) return;
      const incoming = data.feedback ?? [];
      const pageCursor = data.nextCursor ?? (incoming.length > 0 ? incoming[incoming.length - 1]?.id ?? null : null);
      const s = stateRef.current;

      if (incoming.length > 0) {
        appendPage(incoming);
        setResolvedCursor(pageCursor);
        const newLoadedResolved = countLoadedByStatus(itemsRef.current).resolved;
        if (s.resolvedCount > 0) {
          setResolvedHasMore((data.hasMore ?? false) && newLoadedResolved < s.resolvedCount);
        } else {
          setResolvedHasMore(data.hasMore ?? false);
        }
      } else {
        setResolvedHasMore(false);
        setResolvedCursor(pageCursor);
      }
    },
    [appendPage]
  );

  const loadMore = useCallback(async () => {
    if (isSearchModeRef.current) return;
    if (!openExpandedRef.current && !resolvedExpandedRef.current) return;
    const s = stateRef.current;
    if (!sessionId || !s.initialLoadDone || s.loadingMore || isFetchingRef.current) return;
    if (isLoadingRef.current) return;
    const startedSessionId = sessionId;
    if (s.items.length >= FEEDBACK_LOAD_CAP) return;

    const canOpen = openExpandedRef.current && s.openHasMore;
    const canResolved =
      resolvedExpandedRef.current && s.hasLoadedResolved && s.resolvedHasMore;
    if (!canOpen && !canResolved) return;

    isLoadingRef.current = true;
    isFetchingRef.current = true;
    stateRef.current.loadingMore = true;
    setLoadingMore(true);
    try {
      const live = stateRef.current;
      if (openExpandedRef.current && live.openHasMore) {
        await fetchOpenPage(startedSessionId, live.openCursor);
        return;
      }
      if (
        resolvedExpandedRef.current &&
        live.hasLoadedResolved &&
        live.resolvedHasMore
      ) {
        await fetchResolvedPage(startedSessionId, live.resolvedCursor);
        return;
      }
    } catch (err) {
      console.error("[ECHLY] loadMore failed", err);
    } finally {
      isLoadingRef.current = false;
      isFetchingRef.current = false;
      stateRef.current.loadingMore = false;
      setLoadingMore(false);
    }
  }, [fetchOpenPage, fetchResolvedPage, sessionId]);

  const loadMoreRefStable = useRef(loadMore);
  loadMoreRefStable.current = loadMore;

  /** Viewport fill: only open pages; capped iterations (never touch resolved here). */
  const loadMoreOpenOnly = useCallback(async () => {
    if (isSearchModeRef.current) return;
    if (!openExpanded) return;
    if (!sessionId) return;
    const s = stateRef.current;
    if (!s.initialLoadDone || !s.openHasMore) return;
    if (s.items.length >= FEEDBACK_LOAD_CAP) return;
    if (isFetchingRef.current || isLoadingRef.current) return;
    const startedSessionId = sessionId;
    isLoadingRef.current = true;
    isFetchingRef.current = true;
    stateRef.current.loadingMore = true;
    setLoadingMore(true);
    try {
      await fetchOpenPage(startedSessionId, s.openCursor);
    } catch (err) {
      console.error("[ECHLY] loadMoreOpenOnly failed", err);
    } finally {
      isLoadingRef.current = false;
      isFetchingRef.current = false;
      stateRef.current.loadingMore = false;
      setLoadingMore(false);
    }
  }, [fetchOpenPage, sessionId, openExpanded]);

  const loadMoreOpenOnlyRef = useRef(loadMoreOpenOnly);
  loadMoreOpenOnlyRef.current = loadMoreOpenOnly;

  // After paint: if the list does not scroll yet, keep loading open pages until it does or cap.
  useEffect(() => {
    const el = scrollContainerRef?.current;
    if (!el || !sessionId) return;
    if (!initialLoadDone) return;
    if (!openExpanded) return;
    if (isSearchMode) return;
    if (hasViewportFillCompletedRef.current) return;

    let cancelled = false;

    const run = async () => {
      let safetyCounter = 0;
      const container = el;
      while (
        !cancelled &&
        !isSearchModeRef.current &&
        openExpandedRef.current &&
        stateRef.current.openHasMore &&
        container.scrollHeight <= container.clientHeight + 50 &&
        safetyCounter < 10
      ) {
        await loadMoreOpenOnlyRef.current();
        safetyCounter += 1;
      }
      if (cancelled) return;
      requestAnimationFrame(() => {
        if (cancelled || hasInitializedScrollRef.current) return;
        const c = scrollContainerRef?.current;
        if (!c) return;
        c.scrollTop = 0;
        hasInitializedScrollRef.current = true;
      });
    };

    const id = requestAnimationFrame(() => {
      if (cancelled || hasViewportFillCompletedRef.current) return;
      if (!openExpandedRef.current) return;
      hasViewportFillCompletedRef.current = true;
      void run();
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, [sessionId, initialLoadDone, scrollReady, openExpanded, isSearchMode]);

  useEffect(() => {
    const el = scrollContainerRef?.current;
    if (!el) return;
    const onScroll = () => {
      if (isSearchModeRef.current) return;
      const s = stateRef.current;
      if (isLoadingRef.current || s.loadingMore || isFetchingRef.current) return;
      if (s.items.length >= FEEDBACK_LOAD_CAP) return;

      const canMoreOpen = s.openExpanded && s.openHasMore;
      const canMoreResolved =
        s.resolvedExpanded && s.hasLoadedResolved && s.resolvedHasMore;
      if (!canMoreOpen && !canMoreResolved) return;

      const shouldLoadMore = el.scrollTop + el.clientHeight >= el.scrollHeight - SCROLL_THRESHOLD_PX;
      if (shouldLoadMore) void loadMore();
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
    };
  }, [scrollContainerRef, scrollReady, loadMore, isSearchMode]);

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    const scrollEl = scrollContainerRef?.current;
    if (!sentinel || !scrollEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        if (isSearchModeRef.current) return;
        if (isLoadingRef.current) return;
        const s = stateRef.current;
        if (s.loadingMore || isFetchingRef.current) return;
        if (s.items.length >= FEEDBACK_LOAD_CAP) return;

        const canMoreOpen = s.openExpanded && s.openHasMore;
        const canMoreResolved =
          s.resolvedExpanded && s.hasLoadedResolved && s.resolvedHasMore;
        if (!canMoreOpen && !canMoreResolved) return;

        void loadMore();
      },
      { root: scrollEl, rootMargin: "150px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [scrollContainerRef, scrollReady, items.length, loadMore, isSearchMode]);

  useEffect(() => {
    if (!sessionId) {
      if (countsDebounceRef.current !== null) {
        clearTimeout(countsDebounceRef.current);
        countsDebounceRef.current = null;
      }
      countsDirtyRef.current = false;
      setInitialLoading(false);
      setInitialLoadDone(false);
      hasFetchedRef.current = false;
      countsLoadedRef.current = false;
      previousFeedbackCountRef.current = 0;
      realtimeBootstrapDoneRef.current = false;
      setCountsLoading(false);
      setCountsState(ZERO_COUNTS);
      setCanonicalFeedback([]);
      setOpenCursor(null);
      setResolvedCursor(null);
      setOpenHasMore(true);
      setResolvedHasMore(false);
      setHasLoadedResolved(false);
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
    setCanonicalFeedback([]);
    setOpenCursor(null);
    setResolvedCursor(null);
    setOpenHasMore(true);
    setResolvedHasMore(false);
    setHasLoadedResolved(false);
    isFetchingRef.current = false;
    countsLoadedRef.current = true;

    let cancelled = false;
    void (async () => {
      try {
        const next = await fetchCountsDedup(sessionId);
        if (cancelled || sessionIdRef.current !== sessionId) return;
        setStoreCounts(sessionId, next);
      } catch (err) {
        console.error("[ECHLY] initial counts fetch failed", err);
        if (!cancelled) setCountsLoading(false);
      }
    })();

    subscribeFeedbackSession(sessionId);

    return () => {
      cancelled = true;
    };
  }, [sessionId, setCanonicalFeedback]);

  useEffect(() => {
    if (!sessionId) return;
    return subscribeCounts(sessionId, (nextCounts) => {
      setCountsState(nextCounts);
      setCountsLoading(false);
    });
  }, [sessionId]);

  useEffect(() => {
    if (!resolvedExpanded) {
      setIsLoadingResolved(false);
    }
  }, [resolvedExpanded]);

  // First resolved page: only when user expands — never touches `loadingMore` (open pagination uses that).
  useEffect(() => {
    if (!sessionId || !resolvedExpanded || hasLoadedResolved) return;
    if (isSearchModeRef.current) return;

    let cancelled = false;
    const startedSessionId = sessionId;
    setIsLoadingResolved(true);
    void (async () => {
      try {
        if (cancelled || !resolvedExpandedRef.current) return;
        await fetchResolvedPage(startedSessionId, null);
        if (cancelled || sessionIdRef.current !== startedSessionId) return;
        setHasLoadedResolved(true);
      } catch (err) {
        console.error("[ECHLY] fetchResolved first page failed", err);
        if (!cancelled && sessionIdRef.current === startedSessionId) {
          setResolvedHasMore(false);
          setHasLoadedResolved(true);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingResolved(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId, resolvedExpanded, hasLoadedResolved, fetchResolvedPage, isSearchMode]);

  useEffect(() => {
    if (!sessionId) return;
    if (feedbackRealtime.sessionId !== sessionId) return;
    if (feedbackRealtime.loading) return;

    const effectSessionId = sessionId;
    const snapshotList = realtimeItems;
    const realtimeWindowCount = snapshotList.length;

    if (!realtimeBootstrapDoneRef.current) {
      if (realtimeWindowCount > previousFeedbackCountRef.current && snapshotList.length > 0) {
        const newestTicketId = snapshotList[0].id;
        onNewTicketFromRealtimeRef.current?.(newestTicketId);
      }
      previousFeedbackCountRef.current = realtimeWindowCount;

      if (realtimeItems.length > 0) {
        setCanonicalFeedback(realtimeItems);
      }
      realtimeBootstrapDoneRef.current = true;

      const isFirstSnapshot = !stateRef.current.initialLoadDone;
      if (!isFirstSnapshot) return;

      setInitialLoadDone(true);
      setInitialLoading(false);
      if (hasFetchedRef.current) return;
      hasFetchedRef.current = true;

      // Realtime session query is open-only, limit 30 — a full window matches first REST page.
      if (snapshotList.length >= PAGE_SIZE) {
        const oldestInWindow = snapshotList[snapshotList.length - 1];
        setOpenCursor(oldestInWindow?.id ?? null);
        const s = stateRef.current;
        const loadedOpen = countLoadedByStatus(itemsRef.current).open;
        if (s.activeCount > 0) {
          setOpenHasMore(loadedOpen < s.activeCount);
        } else {
          setOpenHasMore(true);
        }
      } else {
        void (async () => {
          try {
            const url = feedbackListUrl(effectSessionId, null, PAGE_SIZE, "open");
            const res = await cachedFetch(url, () => authFetch(url));
            const data = (await res.json()) as {
              feedback?: Feedback[];
              nextCursor?: string | null;
              hasMore?: boolean;
            };
            if (sessionIdRef.current !== effectSessionId) return;
            const apiItems = data.feedback ?? [];
            guardMultipleSources(apiItems);
            const incoming = apiItems;
            const pageCursor = data.nextCursor ?? (incoming.length > 0 ? incoming[incoming.length - 1]?.id ?? null : null);
            setOpenCursor(pageCursor);
            const s = stateRef.current;
            if (incoming.length > 0) {
              appendPage(incoming);
              const loadedOpen = countLoadedByStatus(itemsRef.current).open;
              if (s.activeCount > 0) {
                setOpenHasMore((data.hasMore ?? false) && loadedOpen < s.activeCount);
              } else {
                setOpenHasMore(data.hasMore ?? false);
              }
            } else {
              setOpenHasMore(false);
            }
          } catch (err) {
            console.error("[ECHLY] bootstrap first-page fetch failed", err);
            setOpenHasMore(false);
            setOpenCursor(null);
          }
        })();
      }
      return;
    }

    const changes = feedbackRealtime.docChanges;
    if (changes.length === 0) return;

    countsDirtyRef.current = true;
    if (countsDebounceRef.current !== null) {
      clearTimeout(countsDebounceRef.current);
    }
    countsDebounceRef.current = window.setTimeout(() => {
      if (!countsDirtyRef.current) return;
      countsDirtyRef.current = false;
      const sid = sessionIdRef.current;
      if (!sid) return;
      void fetchCountsDedup(sid)
        .then((next) => {
          if (sessionIdRef.current !== sid) return;
          setStoreCounts(sid, next);
        })
        .catch((err) => {
          console.error("[ECHLY] counts refresh failed", err);
        });
    }, 500);

    for (const change of changes) {
      if (change.type === "added") {
        if (!itemsRef.current.some((x) => x.id === change.feedback.id)) {
          onNewTicketFromRealtimeRef.current?.(change.feedback.id);
        }
      }
    }

    try {
      setCanonicalFeedback((current) => {
        const removedIds = new Set(
          changes.filter((c) => c.type === "removed").map((c) => c.id)
        );
        let next = current.filter((item) => {
          if (!removedIds.has(item.id)) return true;
          // Open-only listener removes rows when a ticket becomes resolved; keep optimistic resolved rows in memory.
          return getTicketStatus(item) === "resolved";
        });
        for (const change of changes) {
          if (change.type === "removed") continue;
          if (change.type === "modified") {
            const idx = next.findIndex((x) => x.id === change.feedback.id);
            if (idx !== -1) next[idx] = change.feedback;
          } else if (change.type === "added") {
            const idx = next.findIndex((x) => x.id === change.feedback.id);
            if (idx === -1) next.unshift(change.feedback);
            else next[idx] = change.feedback;
          }
        }
        return next;
      });
    } catch (err) {
      console.error("[ECHLY] realtime docChanges apply failed", err);
    }
  }, [
    appendPage,
    feedbackRealtime.loading,
    feedbackRealtime.sessionId,
    feedbackRealtime.version,
    guardMultipleSources,
    realtimeItems,
    sessionId,
    setCanonicalFeedback,
  ]);

  return {
    feedback: items,
    total,
    activeCount,
    resolvedCount,
    countsLoading,
    setFeedback: setCanonicalFeedback,
    loading: initialLoading,
    hasMore: hasMoreCombined,
    hasReachedLimit,
    loadingMore,
    hasLoadedResolved,
    isLoadingResolved,
    loadMoreRef,
  };
}
