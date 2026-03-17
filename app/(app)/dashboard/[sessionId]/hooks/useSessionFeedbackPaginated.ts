"use client";

import { authFetch } from "@/lib/authFetch";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { onSnapshot, collection, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Feedback } from "@/lib/domain/feedback";
import type { Timestamp, DocumentSnapshot } from "firebase/firestore";

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

/** Maps a Firestore doc to domain Feedback (same shape as feedbackRepository). */
function mapDocToFeedback(docSnap: DocumentSnapshot): Feedback {
  const data = docSnap.data() ?? {};
  const status = (data.status ?? "open") as string;
  const isResolved =
    data.isResolved === true ||
    status === "resolved" ||
    status === "done";
  const isSkipped = status === "skipped";
  return {
    id: docSnap.id,
    workspaceId: typeof data.workspaceId === "string" ? data.workspaceId : undefined,
    sessionId: data.sessionId as string,
    userId: data.userId as string,
    title: (data.title as string) ?? "",
    description: (data.description as string) ?? "",
    suggestion: (data.suggestion as string) ?? "",
    type: (data.type as string) ?? "Feedback",
    isResolved,
    isSkipped: isSkipped || undefined,
    createdAt: (data.createdAt ?? null) as Timestamp | null,
    contextSummary: (data.contextSummary as string | null) ?? null,
    actionSteps: (data.actionSteps ?? data.actionItems ?? null) as string[] | null,
    suggestedTags: (data.suggestedTags as string[] | null) ?? null,
    url: (data.url as string | null) ?? null,
    viewportWidth: (data.viewportWidth as number | null) ?? null,
    viewportHeight: (data.viewportHeight as number | null) ?? null,
    userAgent: (data.userAgent as string | null) ?? null,
    clientTimestamp: (data.clientTimestamp as number | null) ?? null,
    screenshotUrl: (data.screenshotUrl as string | null) ?? null,
    clarityScore: (data.clarityScore as number | null) ?? null,
    clarityStatus: (() => {
      const s = data.clarityStatus;
      return s === "clear" || s === "needs_improvement" || s === "unclear" ? s : null;
    })(),
    clarityIssues: (data.clarityIssues as string[] | null) ?? null,
    clarityConfidence: (data.clarityConfidence as number | null) ?? null,
    clarityCheckedAt: (data.clarityCheckedAt as Timestamp | null) ?? null,
    commentCount: typeof data.commentCount === "number" ? data.commentCount : 0,
    lastCommentPreview: typeof data.lastCommentPreview === "string" ? data.lastCommentPreview : undefined,
    lastCommentAt: (data.lastCommentAt ?? null) as Timestamp | null,
  };
}

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

  /** Track previous snapshot size so we can detect new tickets and auto-select the newest. */
  const previousFeedbackCountRef = useRef(0);
  const onNewTicketFromRealtimeRef = useRef(onNewTicketFromRealtime);
  onNewTicketFromRealtimeRef.current = onNewTicketFromRealtime;

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

  // When no sessionId, clear loading so we don't block the list area.
  useEffect(() => {
    if (!sessionId) {
      setInitialLoading(false);
      setInitialLoadDone(false);
      return;
    }
    setInitialLoading(true);
    setInitialLoadDone(false);

    const feedbackRef = collection(db, "feedback");
    const feedbackQuery = query(
      feedbackRef,
      where("sessionId", "==", sessionId),
      limit(FEEDBACK_LOAD_CAP)
    );

    const unsubscribe = onSnapshot(feedbackQuery, (snapshot) => {
      const snapshotList = snapshot.docs
        .map((d) => mapDocToFeedback(d))
        .sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() ?? a.clientTimestamp ?? 0;
          const tb = b.createdAt?.toMillis?.() ?? b.clientTimestamp ?? 0;
          return tb - ta;
        });
      const totalCount = snapshotList.length;
      const open = snapshotList.filter((f) => !f.isResolved && !f.isSkipped).length;
      const resolved = snapshotList.filter((f) => f.isResolved).length;
      const skipped = snapshotList.filter((f) => f.isSkipped).length;
      setTotal(totalCount);
      setActiveCount(open);
      setResolvedCount(resolved);
      setSkippedCount(skipped);

      if (totalCount > previousFeedbackCountRef.current && snapshotList.length > 0) {
        const newestTicketId = snapshotList[0].id;
        onNewTicketFromRealtimeRef.current?.(newestTicketId);
      }
      previousFeedbackCountRef.current = totalCount;

      const isFirstSnapshot = !stateRef.current.initialLoadDone;
      if (isFirstSnapshot) {
        setItems(snapshotList);
        setInitialLoadDone(true);
        setInitialLoading(false);
        setCursor(null);
        setHasMore(false); // Listener-only: no API pagination; we have up to FEEDBACK_LOAD_CAP from snapshot
      } else {
        const changes = snapshot.docChanges();
        setItems((prev) => {
          let next = [...prev];
          for (const change of changes) {
            const feedback = mapDocToFeedback(change.doc);
            if (change.type === "added") {
              const idx = next.findIndex((t) => t.id === feedback.id);
              if (idx >= 0) next[idx] = feedback;
              else next.push(feedback);
            } else if (change.type === "modified") {
              next = next.map((t) => (t.id === feedback.id ? feedback : t));
            } else if (change.type === "removed") {
              next = next.filter((t) => t.id !== feedback.id);
            }
          }
          return next.sort((a, b) => {
            const ta = a.createdAt?.toMillis?.() ?? a.clientTimestamp ?? 0;
            const tb = b.createdAt?.toMillis?.() ?? b.clientTimestamp ?? 0;
            return tb - ta;
          });
        });
      }
    });

    return () => unsubscribe();
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
