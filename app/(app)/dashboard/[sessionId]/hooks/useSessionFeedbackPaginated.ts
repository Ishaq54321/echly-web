"use client";

import { useState, useEffect, useLayoutEffect, useCallback, useRef, useMemo } from "react";
import {
  collection,
  doc,
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

const ZERO_COUNTS = {
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
  /** From `sessions/{id}` snapshot. */
  total: number;
  /** From `sessions/{id}` snapshot. */
  activeCount: number;
  /** From `sessions/{id}` snapshot. */
  resolvedCount: number;
  /** False once session doc counters have been read. */
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
  /** True after first feedback and session snapshots for this session. */
  isCountsSynced: boolean;
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
 * Session ticket list from Firestore `feedback` query; counts from `sessions/{id}` only.
 */
export function useSessionFeedbackPaginated(
  sessionId: string | undefined,
  onNewTicketFromRealtime?: (newestTicketId: string) => void
): UseSessionFeedbackPaginatedResult {
  const { workspaceId, authUid } = useWorkspace();
  const [items, setItems] = useState<Feedback[]>([]);
  const [counts, setCountsState] = useState(ZERO_COUNTS);
  const total = counts.total;
  const activeCount = counts.open;
  const resolvedCount = counts.resolved;
  const [countsLoading, setCountsLoading] = useState<boolean>(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [feedbackSnapshotReady, setFeedbackSnapshotReady] = useState(false);
  const [sessionSnapshotReady, setSessionSnapshotReady] = useState(false);
  const [hasLoadedResolved, setHasLoadedResolved] = useState(false);
  const [isLoadingResolved, setIsLoadingResolved] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const sessionIdRef = useRef<string | undefined>(sessionId);
  const itemsRef = useRef<Feedback[]>([]);

  const onNewTicketFromRealtimeRef = useRef(onNewTicketFromRealtime);

  const prevIdsRef = useRef<Set<string>>(new Set());
  const firstSnapshotRef = useRef(true);

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
    onNewTicketFromRealtimeRef.current = onNewTicketFromRealtime;
  }, [onNewTicketFromRealtime]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useLayoutEffect(() => {
    firstSnapshotRef.current = true;
    prevIdsRef.current = new Set();
    setHasLoadedResolved(false);
    setIsLoadingResolved(true);
    setFeedbackSnapshotReady(false);
    setSessionSnapshotReady(false);
  }, [sessionId]);

  const isCountsSynced = feedbackSnapshotReady && sessionSnapshotReady;

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

  /** Session document counters (authoritative). */
  useEffect(() => {
    if (!authUid || !sessionId || !workspaceId) {
      setCountsState(ZERO_COUNTS);
      setCountsLoading(false);
      setSessionSnapshotReady(false);
      return;
    }

    setSessionSnapshotReady(false);
    setCountsLoading(true);

    const sessionRef = doc(db, "sessions", sessionId);
    const unsubscribe = onSnapshot(
      sessionRef,
      (snap) => {
        if (sessionIdRef.current !== sessionId) return;
        if (!snap.exists()) {
          setCountsState(ZERO_COUNTS);
          setCountsLoading(false);
          setSessionSnapshotReady(true);
          return;
        }
        const d = snap.data();
        const wid = typeof d.workspaceId === "string" ? d.workspaceId.trim() : "";
        if (wid !== workspaceId) {
          setCountsState(ZERO_COUNTS);
          setCountsLoading(false);
          setSessionSnapshotReady(true);
          return;
        }
        const open = typeof d.openCount === "number" ? d.openCount : 0;
        const resolved = typeof d.resolvedCount === "number" ? d.resolvedCount : 0;
        const totalN =
          typeof d.totalCount === "number"
            ? d.totalCount
            : typeof d.feedbackCount === "number"
              ? d.feedbackCount
              : 0;
        setCountsState({ total: totalN, open, resolved });
        setCountsLoading(false);
        setSessionSnapshotReady(true);
      },
      (err) => {
        console.error("[ECHLY] session onSnapshot (counts) failed", err);
        if (sessionIdRef.current !== sessionId) return;
        setCountsLoading(false);
        setSessionSnapshotReady(true);
      }
    );

    return () => unsubscribe();
  }, [authUid, sessionId, workspaceId]);

  /** Firestore: full session list — real-time updates across tabs. */
  useEffect(() => {
    if (!authUid || !sessionId || !workspaceId) {
      return;
    }

    setInitialLoading(true);
    setHasLoadedResolved(false);
    setIsLoadingResolved(true);
    setFeedbackSnapshotReady(false);

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
          setFeedbackSnapshotReady(true);
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
        setFeedbackSnapshotReady(true);
      },
      (err) => {
        console.error("[ECHLY] feedback onSnapshot failed", err);
        if (sessionIdRef.current !== sessionId) return;
        setInitialLoading(false);
        setHasLoadedResolved(true);
        setIsLoadingResolved(false);
        setFeedbackSnapshotReady(true);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [authUid, sessionId, workspaceId, finalizeList, setCanonicalFeedback]);

  useEffect(() => {
    if (!sessionId) {
      setInitialLoading(false);
      setCountsLoading(false);
      setCountsState(ZERO_COUNTS);
      setFeedbackSnapshotReady(false);
      setSessionSnapshotReady(false);
      setCanonicalFeedback((prev) => (prev.length === 0 ? prev : []));
      return;
    }
    if (!authUid) {
      setCountsLoading(true);
    }
  }, [sessionId, authUid, setCanonicalFeedback]);

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
    isCountsSynced,
  };
}
