"use client";

import {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
  useMemo,
  type MutableRefObject,
} from "react";
import { Timestamp } from "firebase/firestore";
import type { Feedback } from "@/lib/domain/feedback";
import { getTicketStatus } from "@/lib/domain/feedback";
import { normalizeTicketStatus } from "@/lib/domain/normalizeTicketStatus";

const ZERO_COUNTS = {
  total: 0,
  open: 0,
  resolved: 0,
};

const ZERO_COUNTS_DELTA = {
  open: 0,
  resolved: 0,
  total: 0,
} as const;

export type SessionCountsDelta = {
  open: number;
  resolved: number;
  total: number;
};

function feedbackFromRestApiRow(
  row: Record<string, unknown>,
  sessionIdFallback: string
): Feedback | null {
  if (row.isDeleted === true) return null;
  const id = typeof row.id === "string" ? row.id : "";
  if (!id) return null;
  const sessionId =
    typeof row.sessionId === "string" && row.sessionId.trim() !== ""
      ? row.sessionId
      : sessionIdFallback;
  const rawStatus =
    typeof row.status === "string"
      ? row.status
      : row.isResolved === true
        ? "resolved"
        : "open";
  const normalizedStatus = normalizeTicketStatus(rawStatus);
  const isResolved = normalizedStatus === "resolved";
  let createdAt: Timestamp | null = null;
  if (typeof row.createdAt === "string" && row.createdAt.trim() !== "") {
    const d = new Date(row.createdAt);
    if (!Number.isNaN(d.getTime())) {
      createdAt = Timestamp.fromDate(d);
    }
  }
  let lastCommentAt: Timestamp | null = null;
  const lastRaw = row.lastCommentAt as { seconds?: number } | string | null | undefined;
  if (lastRaw != null && typeof lastRaw === "object" && typeof lastRaw.seconds === "number") {
    lastCommentAt = new Timestamp(lastRaw.seconds, 0);
  } else if (typeof lastRaw === "string" && lastRaw.trim() !== "") {
    const d = new Date(lastRaw);
    if (!Number.isNaN(d.getTime())) {
      lastCommentAt = Timestamp.fromDate(d);
    }
  }

  return {
    id,
    sessionId,
    title: typeof row.title === "string" ? row.title : "",
    instruction:
      (typeof row.instruction === "string" ? row.instruction : "") ||
      (typeof row.description === "string" ? row.description : "") ||
      "",
    description: typeof row.description === "string" ? row.description : "",
    suggestion: "",
    type: typeof row.type === "string" ? row.type : "Feedback",
    isResolved,
    createdAt,
    contextSummary: null,
    actionSteps: Array.isArray(row.actionSteps)
      ? (row.actionSteps as string[]).filter((s) => typeof s === "string")
      : null,
    suggestedTags: Array.isArray(row.suggestedTags)
      ? (row.suggestedTags as unknown[]).filter((s): s is string => typeof s === "string")
      : null,
    url: null,
    viewportWidth: null,
    viewportHeight: null,
    userAgent: null,
    clientTimestamp: null,
    screenshotUrl: typeof row.screenshotUrl === "string" ? row.screenshotUrl : null,
    screenshotStatus:
      row.screenshotStatus === "attached" ||
      row.screenshotStatus === "pending" ||
      row.screenshotStatus === "none" ||
      row.screenshotStatus === "failed"
        ? row.screenshotStatus
        : null,
    status: normalizedStatus,
    commentCount: typeof row.commentCount === "number" ? row.commentCount : 0,
    lastCommentPreview:
      typeof row.lastCommentPreview === "string" ? row.lastCommentPreview : undefined,
    lastCommentAt,
    isDeleted: row.isDeleted === true,
  };
}

export interface UseSessionFeedbackPaginatedResult {
  canonicalFeedback: Feedback[];
  openFeedback: Feedback[];
  resolvedFeedback: Feedback[];
  feedback: Feedback[];
  setFeedback: React.Dispatch<React.SetStateAction<Feedback[]>>;
  total: number;
  activeCount: number;
  resolvedCount: number;
  setCountsDelta: React.Dispatch<React.SetStateAction<SessionCountsDelta>>;
  countsLoading: boolean;
  loading: boolean;
  hasMore: boolean;
  hasReachedLimit: boolean;
  loadingMore: boolean;
  hasLoadedResolved: boolean;
  isLoadingResolved: boolean;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
  isCountsSynced: boolean;
}

/** ISO string or Firestore `{ seconds }` — ordering for sidebar. */
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

export type SessionFeedbackMergeOptions = {
  /**
   * Applied after each REST load before `setState`.
   * Preserves in-flight optimistic fields (e.g. action steps).
   */
  mergeRealtimeListRef?: MutableRefObject<((list: Feedback[]) => Feedback[]) | null>;
  /** When false, wait (e.g. until auth identity is ready). */
  enabled?: boolean;
  shareToken?: string | null;
  /** From GET /api/sessions/:id (same source as session header). */
  restSessionCounts?: { total: number; open: number; resolved: number } | null;
  restFetch?: (url: string) => Promise<Response>;
};

export function useSessionFeedbackPaginated(
  sessionId: string | undefined,
  options?: SessionFeedbackMergeOptions
): UseSessionFeedbackPaginatedResult {
  const enabled = options?.enabled !== false;
  const shareTokenRest =
    typeof options?.shareToken === "string" && options.shareToken.trim() !== ""
      ? options.shareToken.trim()
      : "";
  const restSessionCounts = options?.restSessionCounts ?? null;
  const restCountsAbsent = restSessionCounts == null;
  const restCountsTotal = restSessionCounts?.total ?? -1;
  const restCountsOpen = restSessionCounts?.open ?? -1;
  const restCountsResolved = restSessionCounts?.resolved ?? -1;

  const [items, setItems] = useState<Feedback[]>([]);
  const [counts, setCountsState] = useState(ZERO_COUNTS);
  const [countsDelta, setCountsDelta] = useState<SessionCountsDelta>(ZERO_COUNTS_DELTA);
  const total = Math.max(0, counts.total + countsDelta.total);
  const activeCount = Math.max(0, counts.open + countsDelta.open);
  const resolvedCount = Math.max(0, counts.resolved + countsDelta.resolved);
  const [countsLoading, setCountsLoading] = useState<boolean>(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [feedbackSnapshotReady, setFeedbackSnapshotReady] = useState(false);
  const [sessionSnapshotReady, setSessionSnapshotReady] = useState(false);
  const [hasLoadedResolved, setHasLoadedResolved] = useState(false);
  const [isLoadingResolved, setIsLoadingResolved] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const sessionIdRef = useRef<string | undefined>(sessionId);
  const itemsRef = useRef<Feedback[]>([]);

  const mergeRealtimeListOuterRef = useRef(options?.mergeRealtimeListRef);
  mergeRealtimeListOuterRef.current = options?.mergeRealtimeListRef;

  const restFetchRef = useRef(options?.restFetch);
  restFetchRef.current = options?.restFetch;

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

  itemsRef.current = items;

  useLayoutEffect(() => {
    setHasLoadedResolved(false);
    setIsLoadingResolved(true);
    setFeedbackSnapshotReady(false);
    setSessionSnapshotReady(false);
    setCountsDelta(ZERO_COUNTS_DELTA);
  }, [sessionId, enabled]);

  const isCountsSynced = feedbackSnapshotReady && sessionSnapshotReady;

  useEffect(() => {
    if (enabled && sessionId) return;
    setInitialLoading(true);
    setHasLoadedResolved(false);
    setIsLoadingResolved(true);
    setFeedbackSnapshotReady(false);
  }, [enabled, sessionId]);

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

  useEffect(() => {
    if (!sessionId) {
      setCountsState(ZERO_COUNTS);
      setCountsDelta(ZERO_COUNTS_DELTA);
      setCountsLoading(false);
      setSessionSnapshotReady(false);
      return;
    }

    if (!enabled) {
      setSessionSnapshotReady(false);
      setCountsLoading(true);
      return;
    }

    if (restCountsAbsent) {
      setSessionSnapshotReady(false);
      setCountsLoading(true);
      return;
    }

    setCountsState({
      total: Math.max(0, restCountsTotal),
      open: Math.max(0, restCountsOpen),
      resolved: Math.max(0, restCountsResolved),
    });
    setCountsDelta(ZERO_COUNTS_DELTA);
    setCountsLoading(false);
    setSessionSnapshotReady(true);
  }, [
    sessionId,
    enabled,
    restCountsAbsent,
    restCountsTotal,
    restCountsOpen,
    restCountsResolved,
  ]);

  useEffect(() => {
    if (!sessionId || !enabled) {
      return;
    }

    let cancelled = false;
    setInitialLoading(true);
    setHasLoadedResolved(false);
    setIsLoadingResolved(true);
    setFeedbackSnapshotReady(false);

    void (async () => {
      const aggregated: Feedback[] = [];
      let cursor = "";
      try {
        while (!cancelled) {
          const q = new URLSearchParams({
            sessionId,
            limit: "50",
          });
          if (cursor) q.set("cursor", cursor);
          if (shareTokenRest) q.set("shareToken", shareTokenRest);
          const fetchPage =
            restFetchRef.current ?? ((u: string) => fetch(u, { credentials: "include" }));
          const res = await fetchPage(`/api/feedback?${q.toString()}`);
          if (!res.ok) break;
          const data = (await res.json()) as {
            feedback?: Record<string, unknown>[];
            nextCursor?: string | null;
            hasMore?: boolean;
          };
          const rows = Array.isArray(data.feedback) ? data.feedback : [];
          for (const r of rows) {
            const f = feedbackFromRestApiRow(r, sessionId);
            if (f) aggregated.push(f);
          }
          const next = typeof data.nextCursor === "string" ? data.nextCursor : "";
          const hasMore = data.hasMore === true && next.trim() !== "";
          if (!hasMore) break;
          cursor = next;
        }
      } catch (err) {
        console.error("[ECHLY] REST session feedback load failed", err);
      }

      if (cancelled || sessionIdRef.current !== sessionId) return;

      const finalized = finalizeList(aggregated);
      const mergeFn = mergeRealtimeListOuterRef.current?.current;
      const list = mergeFn ? mergeFn(finalized) : finalized;
      itemsRef.current = list;
      setItems(list);
      setInitialLoading(false);
      setHasLoadedResolved(true);
      setIsLoadingResolved(false);
      setFeedbackSnapshotReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId, enabled, shareTokenRest, finalizeList]);

  useEffect(() => {
    if (!sessionId) {
      setInitialLoading(false);
      setCountsLoading(false);
      setCountsState(ZERO_COUNTS);
      setCountsDelta(ZERO_COUNTS_DELTA);
      setFeedbackSnapshotReady(false);
      setSessionSnapshotReady(false);
      setCanonicalFeedback((prev) => (prev.length === 0 ? prev : []));
      return;
    }
  }, [sessionId, setCanonicalFeedback]);

  return {
    canonicalFeedback,
    openFeedback,
    resolvedFeedback,
    feedback: items,
    total,
    activeCount,
    resolvedCount,
    countsLoading,
    setCountsDelta,
    setFeedback: setCanonicalFeedback,
    loading: initialLoading,
    hasMore: false,
    hasReachedLimit,
    loadingMore: false,
    hasLoadedResolved,
    isLoadingResolved,
    loadMoreRef,
    isCountsSynced,
  };
}
