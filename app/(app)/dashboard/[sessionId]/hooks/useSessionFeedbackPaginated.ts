"use client";

import { useState, useEffect, useLayoutEffect, useCallback, useRef, useMemo } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  type DocumentSnapshot,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { useWorkspace } from "@/lib/client/workspaceContext";
import type { Feedback } from "@/lib/domain/feedback";
import { getTicketStatus } from "@/lib/domain/feedback";
import { normalizeTicketStatus } from "@/lib/domain/normalizeTicketStatus";
import {
  getCounts,
  setCounts as setStoreCounts,
  subscribeCounts,
  type Counts,
} from "@/lib/state/sessionCountsStore";
import { fetchCountsDedup } from "@/lib/state/fetchCountsDedup";

const ZERO_COUNTS: Counts = {
  total: 0,
  open: 0,
  resolved: 0,
};

function mapDocToFeedback(docSnap: DocumentSnapshot): Feedback | null {
  const data = docSnap.data() ?? {};
  if (data.isDeleted === true) return null;
  const status = data.status === "resolved" ? "resolved" : "open";
  const isResolved = data.isResolved === true || status === "resolved";
  return {
    id: docSnap.id,
    workspaceId: typeof data.workspaceId === "string" ? data.workspaceId : undefined,
    sessionId: data.sessionId as string,
    userId: data.userId as string,
    title: (data.title as string) ?? "",
    instruction: ((data.instruction as string) ?? (data.description as string)) ?? "",
    description: (data.description as string) ?? "",
    suggestion: (data.suggestion as string) ?? "",
    type: (data.type as string) ?? "Feedback",
    isResolved,
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
    screenshotStatus: data.screenshotStatus ?? null,
    status,
    commentCount: typeof data.commentCount === "number" ? data.commentCount : 0,
    lastCommentPreview: typeof data.lastCommentPreview === "string" ? data.lastCommentPreview : undefined,
    lastCommentAt: (data.lastCommentAt ?? null) as Timestamp | null,
    isDeleted: data.isDeleted ?? false,
  };
}

export interface UseSessionFeedbackPaginatedResult {
  /** Canonical ticket list from Firestore `onSnapshot` (newest first). */
  canonicalFeedback: Feedback[];
  /** Canonical list filtered to normalized "open" status. */
  openFeedback: Feedback[];
  /** Canonical list filtered to normalized "resolved" status. */
  resolvedFeedback: Feedback[];
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
  /** Kept for compatibility with TicketList prop surface. */
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
}

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

function normalizeFeedbackItemStatus(item: Feedback): Feedback {
  const rawStatus =
    typeof item.status === "string" ? item.status : item.isResolved ? "resolved" : "open";
  const normalizedStatus = normalizeTicketStatus(rawStatus);
  return {
    ...item,
    status: normalizedStatus,
    isResolved: normalizedStatus === "resolved",
  };
}

/**
 * Full session feedback via Firestore `onSnapshot` (single source of truth).
 * Counts still come from `/api/feedback/counts` via sessionCountsStore.
 */
export function useSessionFeedbackPaginated(
  sessionId: string | undefined,
  _scrollContainerRef?: React.RefObject<HTMLDivElement | null>,
  _scrollReady?: number,
  onNewTicketFromRealtime?: (newestTicketId: string) => void,
  _resolvedExpanded: boolean = false,
  _openExpanded: boolean = true,
  _isSearchMode: boolean = false
): UseSessionFeedbackPaginatedResult {
  const { workspaceId, claimsReady } = useWorkspace();
  const [items, setItems] = useState<Feedback[]>([]);
  const [counts, setCountsState] = useState<Counts>(ZERO_COUNTS);
  const total = counts.total;
  const activeCount = counts.open;
  const resolvedCount = counts.resolved;
  const [countsLoading, setCountsLoading] = useState<boolean>(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasLoadedResolved, setHasLoadedResolved] = useState(false);
  const [isLoadingResolved, setIsLoadingResolved] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const sessionIdRef = useRef<string | undefined>(sessionId);
  const itemsRef = useRef<Feedback[]>([]);
  const countsDirtyRef = useRef(false);
  const countsDebounceRef = useRef<number | null>(null);

  const onNewTicketFromRealtimeRef = useRef(onNewTicketFromRealtime);
  onNewTicketFromRealtimeRef.current = onNewTicketFromRealtime;

  const prevIdsRef = useRef<Set<string>>(new Set());
  const firstSnapshotRef = useRef(true);
  const firstSnapshotCountsRef = useRef(true);

  const sortByCreatedAtDesc = useCallback((list: Feedback[]): Feedback[] => {
    const deduped = dedupeFeedbackById(list);
    deduped.sort((a, b) => {
      const diff = getTimestamp(b) - getTimestamp(a);
      if (diff !== 0) return diff;
      return b.id.localeCompare(a.id);
    });
    return deduped;
  }, []);

  const finalizeList = useCallback(
    (list: Feedback[]): Feedback[] => sortByCreatedAtDesc(list.map(normalizeFeedbackItemStatus)),
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
    setCanonicalFeedback((prev) => (prev.length === 0 ? prev : []));
    setCountsState(ZERO_COUNTS);
    firstSnapshotRef.current = true;
    firstSnapshotCountsRef.current = true;
    prevIdsRef.current = new Set();
    setHasLoadedResolved(false);
    setIsLoadingResolved(true);
    if (countsDebounceRef.current !== null) {
      clearTimeout(countsDebounceRef.current);
      countsDebounceRef.current = null;
    }
    countsDirtyRef.current = false;
  }, [sessionId, setCanonicalFeedback]);

  const canonicalFeedback = items;
  const openFeedback = useMemo(
    () => canonicalFeedback.filter((item) => normalizeTicketStatus(getTicketStatus(item)) === "open"),
    [canonicalFeedback]
  );
  const resolvedFeedback = useMemo(
    () => canonicalFeedback.filter((item) => normalizeTicketStatus(getTicketStatus(item)) === "resolved"),
    [canonicalFeedback]
  );

  const hasReachedLimit = false;

  /** Firestore: full session list, ordered newest first — real-time updates across tabs. */
  useEffect(() => {
    // CRITICAL: Do not run query until custom claims + workspace are ready (Firestore rules).
    if (!claimsReady || !sessionId || !workspaceId) return;

    setInitialLoading(true);
    setHasLoadedResolved(false);
    setIsLoadingResolved(true);

    const q = query(
      collection(db, "feedback"),
      where("workspaceId", "==", workspaceId),
      where("sessionId", "==", sessionId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (sessionIdRef.current !== sessionId) return;

        if (snapshot.empty) {
          prevIdsRef.current = new Set();
          setCanonicalFeedback((prev) => (prev.length === 0 ? prev : []));
          setInitialLoading(false);
          setHasLoadedResolved(true);
          setIsLoadingResolved(false);
          firstSnapshotCountsRef.current = false;
          return;
        }

        const raw = snapshot.docs
          .map((d) => mapDocToFeedback(d))
          .filter((item): item is Feedback => item !== null);
        const list = finalizeList(raw);

        if (!firstSnapshotRef.current) {
          for (const item of list) {
            if (!prevIdsRef.current.has(item.id)) {
              onNewTicketFromRealtimeRef.current?.(item.id);
              break;
            }
          }
        }
        firstSnapshotRef.current = false;
        prevIdsRef.current = new Set(list.map((x) => x.id));

        itemsRef.current = list;
        setItems(list);

        setInitialLoading(false);
        setHasLoadedResolved(true);
        setIsLoadingResolved(false);

        if (!firstSnapshotCountsRef.current) {
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
        }
        firstSnapshotCountsRef.current = false;
      },
      (err) => {
        console.error("[ECHLY] feedback onSnapshot failed", err);
        if (sessionIdRef.current !== sessionId) return;
        setInitialLoading(false);
        setHasLoadedResolved(true);
        setIsLoadingResolved(false);
      }
    );

    return () => {
      unsubscribe();
      if (countsDebounceRef.current !== null) {
        clearTimeout(countsDebounceRef.current);
        countsDebounceRef.current = null;
      }
    };
  }, [claimsReady, sessionId, workspaceId, finalizeList, setCanonicalFeedback]);

  useEffect(() => {
    if (!sessionId) {
      if (countsDebounceRef.current !== null) {
        clearTimeout(countsDebounceRef.current);
        countsDebounceRef.current = null;
      }
      countsDirtyRef.current = false;
      setInitialLoading(false);
      setCountsLoading(false);
      setCountsState(ZERO_COUNTS);
      setCanonicalFeedback((prev) => (prev.length === 0 ? prev : []));
      return;
    }
    setInitialLoading(true);
    const cached = getCounts(sessionId);
    if (cached) {
      setCountsState(cached);
      setCountsLoading(false);
      return;
    }

    setCountsState(ZERO_COUNTS);
    setCountsLoading(true);

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

  return {
    canonicalFeedback,
    openFeedback,
    resolvedFeedback,
    feedback: items,
    total,
    activeCount,
    resolvedCount,
    countsLoading,
    setFeedback: setCanonicalFeedback,
    loading: initialLoading,
    hasMore: false,
    hasReachedLimit,
    loadingMore: false,
    hasLoadedResolved,
    isLoadingResolved,
    loadMoreRef,
  };
}
