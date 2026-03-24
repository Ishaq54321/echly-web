"use client";

import { authFetch } from "@/lib/authFetch";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { recordSessionViewIfNew } from "@/lib/sessions";
import { getViewerId } from "@/lib/viewerId";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { FeedbackPremiumLoader } from "@/components/session/FeedbackPremiumLoader";
import { useFeedbackDetailController } from "./hooks/useFeedbackDetailController";
import { useSessionFeedbackPaginated } from "./hooks/useSessionFeedbackPaginated";
import type { Feedback } from "@/lib/domain/feedback";
import { getTicketStatus } from "@/lib/domain/feedback";
import {
  getCounts as getCachedCounts,
  setCounts as setCachedCounts,
  updateCounts as updateCachedCounts,
  type Counts,
} from "@/lib/state/sessionCountsStore";
import type { Session } from "@/lib/domain/session";
import { warn } from "@/lib/utils/logger";
import Image from "next/image";
import {
  TicketList,
  ExecutionView,
  ExecutionModeLayout,
  CommentPanel,
} from "@/components/layout/operating-system";

/** Broadcast ticket update to extension tray so tray stays in sync. */
function broadcastTicketUpdated(ticket: { id: string; title: string; actionSteps?: string[] | null; type?: string }) {
  if (typeof window === "undefined" || !("chrome" in window)) return;
  try {
    (
      window as Window & { chrome?: { runtime?: { sendMessage?: (msg: unknown) => void } } }
    ).chrome?.runtime?.sendMessage?.({
      type: "ECHLY_TICKET_UPDATED",
      ticket: {
        id: ticket.id,
        title: ticket.title,
        actionSteps: ticket.actionSteps ?? [],
        type: ticket.type ?? "Feedback",
      },
    });
  } catch (err) {
    console.error("[ECHLY] broadcastTicketUpdated extension message failed", err);
  }
}

/** Ticket shape returned by GET/PATCH /api/tickets/:id (DB source of truth). */
type TicketFromApi = {
  id: string;
  title: string;
  instruction?: string;
  description?: string;
  type: string;
  isResolved?: boolean;
  isSkipped?: boolean;
  actionSteps?: string[] | null;
  suggestedTags?: string[] | null;
  screenshotUrl?: string | null;
  [key: string]: unknown;
};

function preloadImage(src: string, preloaded: Set<string>) {
  if (!src || typeof window === "undefined") return;
  if (preloaded.has(src)) return;
  preloaded.add(src);
  const img = new window.Image();
  img.src = src;
  console.log("PRELOADING", src);
}

function SessionPageSkeleton() {
  return (
    <div className="flex h-screen overflow-hidden pt-6">
      <aside className="w-[280px] h-full shrink-0 min-h-0 flex flex-col rounded-none bg-[var(--layer-1-bg)] shadow-[var(--shadow-level-1)] border-r border-[var(--layer-1-border)]">
        <div className="flex-1 min-h-0 overflow-y-auto p-4">
          <div className="space-y-3">
            <div className="h-4 w-40 rounded bg-neutral-200/50 animate-feedback-placeholder-pulse" />
            <div className="h-3 w-56 rounded bg-neutral-100/70 animate-feedback-placeholder-pulse" />
            <div className="h-3 w-52 rounded bg-neutral-100/70 animate-feedback-placeholder-pulse" />
          </div>
        </div>
      </aside>
      <main className="surface-main flex-1 h-full overflow-y-auto min-h-0 flex flex-col">
        <div className="h-full flex flex-col min-w-0">
          <div className="max-w-4xl mx-auto w-full px-12 py-9 border-b border-[var(--layer-1-border)] shrink-0">
            <div className="flex justify-between items-center gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-[20px] font-semibold leading-[1.15] tracking-[-0.025em] text-[hsl(var(--text-primary-strong))]">
                  Session
                </h1>
                <p className="text-[13px] text-[hsl(var(--text-tertiary))] mt-2">
                  Loading…
                </p>
              </div>
              <div className="text-[13px] text-secondary flex-shrink-0">
                —
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="max-w-4xl mx-auto w-full px-10 py-8">
              <div className="h-6 w-72 rounded bg-neutral-200/70 animate-feedback-placeholder-pulse" />
              <div className="mt-4 h-28 w-full rounded bg-neutral-100/90 animate-feedback-placeholder-pulse" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SessionPageClient({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticketIdFromUrl = searchParams.get("ticket");

  const [session, setSession] = useState<Session | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userPhotoURL, setUserPhotoURL] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  /** Tracks the newest ticket id for the highlight animation; cleared after animation ends. */
  const [newTicketId, setNewTicketId] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  const { user: authUser, loading: authLoading } = useAuthGuard({ router });

  // Start feedback loading as soon as auth is ready (do not block on session doc).
  const feedbackSessionId =
    !authLoading && authUser && sessionId ? sessionId : undefined;

  const listScrollRef = useRef<HTMLDivElement | null>(null);
  const [listScrollReady, setListScrollReady] = useState(0);

  const {
    feedback,
    setFeedback,
    total: feedbackTotal,
    activeCount: feedbackActiveCount,
    resolvedCount: feedbackResolvedCount,
    skippedCount: feedbackSkippedCount,
    countsLoading: feedbackCountsLoading,
    loading: feedbackLoading,
    hasMore: hasMoreFeedback,
    hasReachedLimit: feedbackReachedLimit,
    loadingMore: feedbackLoadingMore,
    loadMoreRef: feedbackLoadMoreRef,
  } = useSessionFeedbackPaginated(
    feedbackSessionId,
    listScrollRef,
    listScrollReady,
    (newestTicketId) => {
      setSelectedId(newestTicketId);
      setNewTicketId(newestTicketId);
    }
  );

  /** Open tickets only; used for Execution Mode queue and progress. */
  const openFeedback = useMemo(
    () => feedback.filter((f) => getTicketStatus(f) === "open"),
    [feedback]
  );

  const [isTicketNavigatorOpen, setIsTicketNavigatorOpen] = useState(false);
  const [executionMode, setExecutionMode] = useState(false);
  const [executionStreak, setExecutionStreak] = useState(0);
  const [isCommentMode, setIsCommentMode] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditingSessionTitle, setIsEditingSessionTitle] = useState(false);
  const [sessionTitleDraft, setSessionTitleDraft] = useState("");
  const [isSavingSessionTitle, setIsSavingSessionTitle] = useState(false);
  const [saveSessionTitleSuccess, setSaveSessionTitleSuccess] = useState(false);

  const preloadedScreenshotUrlsRef = useRef<Set<string>>(new Set());

  const ensureCountsSeeded = useCallback((): Counts | null => {
    if (!sessionId) return null;
    const existing = getCachedCounts(sessionId);
    if (existing) return existing;
    const seed: Counts = {
      total: feedbackTotal,
      open: feedbackActiveCount,
      resolved: feedbackResolvedCount,
      skipped: feedbackSkippedCount,
    };
    setCachedCounts(sessionId, seed);
    return seed;
  }, [
    sessionId,
    feedbackTotal,
    feedbackActiveCount,
    feedbackResolvedCount,
    feedbackSkippedCount,
  ]);

  const applyCountTransition = useCallback(
    (previousStatus: "open" | "resolved" | "skipped", nextStatus: "open" | "resolved" | "skipped") => {
      if (!sessionId || previousStatus === nextStatus) return;
      ensureCountsSeeded();
      updateCachedCounts(sessionId, (current) => {
        const next = { ...current };
        if (previousStatus === "open") next.open = Math.max(0, next.open - 1);
        if (previousStatus === "resolved") next.resolved = Math.max(0, next.resolved - 1);
        if (previousStatus === "skipped") next.skipped = Math.max(0, next.skipped - 1);

        if (nextStatus === "open") next.open += 1;
        if (nextStatus === "resolved") next.resolved += 1;
        if (nextStatus === "skipped") next.skipped += 1;
        return next;
      });
    },
    [sessionId, ensureCountsSeeded]
  );

  /* Escape exits comment mode (canvas-native: no panel open by default). */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsCommentMode(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    console.log("[SESSION_INSIGHT_REMOVED]", {
      status: "complete",
      tracesRemaining: false,
    });
  }, []);

  /* Sync active session to extension when user opens this session page. */
  useEffect(() => {
    if (!sessionId) return;
    if (typeof window === "undefined") return;
    if (!("chrome" in window)) return;
    try {
      (
        window as Window & {
          chrome?: { runtime?: { sendMessage?: (msg: unknown) => void } };
        }
      ).chrome?.runtime?.sendMessage?.({
        type: "ECHLY_SET_ACTIVE_SESSION",
        sessionId,
      });
    } catch (err) {
      console.error("[ECHLY] ECHLY_SET_ACTIVE_SESSION extension message failed", err);
    }
  }, [sessionId]);

  /* Listen for ECHLY_GLOBAL_STATE from extension: update session title when tray edits it. */
  useEffect(() => {
    if (!sessionId || !session) return;
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{ state?: { sessionId?: string | null; sessionTitle?: string | null } }>;
      const state = ev.detail?.state;
      if (!state || state.sessionId !== sessionId || state.sessionTitle == null) return;
      setSession((prev: Session | null) =>
        prev ? ({ ...prev, title: state.sessionTitle } as Session) : prev
      );
      setSessionTitleDraft(state.sessionTitle);
    };
    window.addEventListener("ECHLY_GLOBAL_STATE", handler as EventListener);
    return () => window.removeEventListener("ECHLY_GLOBAL_STATE", handler as EventListener);
  }, [sessionId, session]);

  /* Local-first: insert ticket immediately when extension creates feedback (no refetch). */
  useEffect(() => {
    if (!sessionId || !session) return;
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{
        ticket: { id: string; title: string; instruction?: string; description?: string; type?: string };
        sessionId: string;
      }>;
      const { ticket, sessionId: evSessionId } = ev.detail ?? {};
      if (evSessionId !== sessionId || !ticket) return;
      const newItem: Feedback = {
        id: ticket.id,
        sessionId: evSessionId,
        userId: session.userId,
        title: ticket.title,
        instruction: ticket.instruction ?? ticket.description,
        description: ticket.description ?? ticket.instruction,
        type: ticket.type ?? "Feedback",
        isResolved: false,
        createdAt: null,
        clientTimestamp: Date.now(),
        screenshotUrl: null,
        screenshotStatus: null,
      };
      setFeedback((prev) => [newItem, ...prev.filter((x) => x.id !== newItem.id)]);
      ensureCountsSeeded();
      updateCachedCounts(evSessionId, (c) => ({
        total: c.total + 1,
        open: c.open + 1,
        resolved: c.resolved,
        skipped: c.skipped,
      }));
      setSelectedId(ticket.id);
      setNewTicketId(ticket.id);
    };
    window.addEventListener("ECHLY_FEEDBACK_CREATED", handler);
    return () => window.removeEventListener("ECHLY_FEEDBACK_CREATED", handler);
  }, [sessionId, session, setFeedback, ensureCountsSeeded]);

  /* ================= AUTH + LOAD SESSION (title/meta only) ================= */
  useEffect(() => {
    if (authLoading) return;
    if (!authUser || !sessionId) {
      setSession(null);
      setSessionLoading(false);
      return;
    }

    setSessionLoading(true);
    let cancelled = false;
    const sessionRef = doc(db, "sessions", sessionId);
    getDoc(sessionRef).then((sessionSnap) => {
      if (cancelled) return;
      if (!sessionSnap.exists()) {
        router.push("/dashboard");
        setSessionLoading(false);
        return;
      }
      const data = sessionSnap.data();
      if ((data as { userId?: string }).userId !== authUser.uid) {
        router.push("/dashboard");
        setSessionLoading(false);
        return;
      }
      setSession({ id: sessionSnap.id, ...(data as object) } as Session);
      setUserName(authUser.displayName || authUser.email || "You");
      setUserPhotoURL(authUser.photoURL ?? null);
      setSessionLoading(false);
      const viewerId = getViewerId(authUser.uid);
      if (viewerId) {
        recordSessionViewIfNew(sessionSnap.id, viewerId).catch((err) => {
          console.error("[ECHLY] recordSessionViewIfNew failed", err);
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [sessionId, authUser, authLoading, router]);

  // Deep link: when ?ticket= is present, select that ticket and open detail panel.
  const hasAppliedTicketParam = useRef(false);
  useEffect(() => {
    if (!ticketIdFromUrl || feedback.length === 0 || hasAppliedTicketParam.current) return;
    const exists = feedback.some((f) => f.id === ticketIdFromUrl);
    if (exists) {
      hasAppliedTicketParam.current = true;
      setSelectedId(ticketIdFromUrl);
    }
  }, [ticketIdFromUrl, feedback]);

  // Select first feedback when first page loads and none selected (no ticket param).
  useEffect(() => {
    if (feedback.length > 0 && selectedId === null && !ticketIdFromUrl) {
      setSelectedId(feedback[0].id);
    }
  }, [feedback, selectedId, ticketIdFromUrl]);

  // Clear new-ticket highlight after animation completes (1.2s).
  useEffect(() => {
    if (!newTicketId) return;
    const timeout = setTimeout(() => setNewTicketId(null), 1200);
    return () => clearTimeout(timeout);
  }, [newTicketId]);

  /* In Execution Mode, ensure selection is an open ticket (open-only queue). */
  useEffect(() => {
    if (!executionMode) return;
    if (openFeedback.length === 0) {
      setSelectedId(null);
      return;
    }
    const current = selectedId ? feedback.find((f) => f.id === selectedId) : null;
    if (!current || getTicketStatus(current) !== "open") {
      setSelectedId(openFeedback[0].id);
    }
  }, [executionMode, openFeedback, feedback, selectedId]);

  /* ================= SELECTED ITEM (derived from feedback list) ================= */

  const selectedIndex = feedback.findIndex((f) => f.id === selectedId);
  const selectedIndexInOpen = openFeedback.findIndex((f) => f.id === selectedId);
  const executionModeTotal = feedbackActiveCount;

  // Preload only the next 1-2 ticket screenshots from the current selection.
  useEffect(() => {
    if (selectedIndex === -1) return;
    const nextItems = [feedback[selectedIndex + 1], feedback[selectedIndex + 2]].filter(Boolean);
    nextItems.forEach((item) => {
      const url = item?.screenshotUrl;
      if (!url) return;
      preloadImage(url, preloadedScreenshotUrlsRef.current);
    });
  }, [selectedIndex, feedback]);

  const selectedItem = (() => {
    const ticket = feedback.find((t) => t.id === selectedId) ?? null;
    if (!ticket) return null;
    return {
      ...ticket,
      index:
        executionMode && openFeedback.length > 0
          ? selectedIndexInOpen !== -1
            ? selectedIndexInOpen + 1
            : 1
          : selectedIndex !== -1
            ? selectedIndex + 1
            : 1,
      total:
        executionMode
          ? executionModeTotal
          : feedbackTotal,
    };
  })();

  const {
    comments,
    loadingComments,
    sendComment,
    sendReply,
    sendPinComment,
    sendTextComment,
    resolve,
    updatePinPosition,
    updateComment,
    deleteComment,
  } = useFeedbackDetailController({
    sessionId,
    workspaceId: session?.workspaceId ?? session?.userId ?? null,
    feedbackId: selectedId,
  });

  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  /** Pin whose inline thread popover is open (does not open right panel). */
  const [activePinIdForPopover, setActivePinIdForPopover] = useState<string | null>(null);

  /* ================= SAVE TITLE (optimistic update, then PATCH) ================= */

  const saveTitle = async (newTitle: string): Promise<void> => {
    if (!selectedId || newTitle.trim() === "") return;
    const trimmed = newTitle.trim();
    const previousTitle = selectedItem?.title;
    setFeedback((prev) =>
      prev.map((item) =>
        item.id === selectedId ? { ...item, title: trimmed } : item
      )
    );
    try {
      const res = await authFetch(`/api/tickets/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        ticket?: TicketFromApi;
      };
      if (data.success && data.ticket) {
        setFeedback((prev) =>
          prev.map((item) =>
            item.id === selectedId ? { ...item, ...data.ticket } : item
          )
        );
        broadcastTicketUpdated(data.ticket);
      }
    } catch (err) {
      console.error("[ECHLY] saveTitle failed", err);
      setFeedback((prev) =>
        prev.map((item) =>
          item.id === selectedId
            ? { ...item, title: previousTitle ?? trimmed }
            : item
        )
      );
    }
  };

  /* ================= SAVE ACTION STEPS (optimistic update, then PATCH) ================= */

  const saveActionSteps = async (actionSteps: string[]) => {
    if (!selectedId) return;
    const previous = selectedItem?.actionSteps ?? null;
    setFeedback((prev) =>
      prev.map((item) =>
        item.id === selectedId ? { ...item, actionSteps } : item
      )
    );
    try {
      const res = await authFetch(`/api/tickets/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionSteps }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        ticket?: TicketFromApi;
      };
      if (data.success && data.ticket) {
        setFeedback((prev) =>
          prev.map((item) =>
            item.id === selectedId ? { ...item, ...data.ticket } : item
          )
        );
        broadcastTicketUpdated(data.ticket);
      }
    } catch (err) {
      console.error("[ECHLY] saveActionSteps failed", err);
      setFeedback((prev) =>
        prev.map((item) =>
          item.id === selectedId ? { ...item, actionSteps: previous } : item
        )
      );
    }
  };

  const saveTags = async (suggestedTags: string[]) => {
    if (!selectedId) return;
    const nextTags = Array.isArray(suggestedTags) ? suggestedTags : null;
    const previous = selectedItem?.suggestedTags ?? null;
    setFeedback((prev) =>
      prev.map((item) =>
        item.id === selectedId ? { ...item, suggestedTags: nextTags } : item
      )
    );
    try {
      const res = await authFetch(`/api/tickets/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestedTags }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        ticket?: TicketFromApi;
      };
      if (data.success && data.ticket) {
        setFeedback((prev) =>
          prev.map((item) =>
            item.id === selectedId ? { ...item, ...data.ticket } : item
          )
        );
        broadcastTicketUpdated(data.ticket);
      }
    } catch (err) {
      console.error("[ECHLY] saveTags failed", err);
      setFeedback((prev) =>
        prev.map((item) =>
          item.id === selectedId ? { ...item, suggestedTags: previous } : item
        )
      );
    }
  };

  const saveResolved = async (isResolved: boolean) => {
    if (!selectedId) return;
    const previousStatus = selectedItem ? getTicketStatus(selectedItem) : "open";
    const nextStatus = isResolved ? "resolved" : "open";
    const previousResolved = Boolean(selectedItem?.isResolved);
    const previousSkipped = Boolean(selectedItem?.isSkipped);
    const previousCounts = sessionId ? getCachedCounts(sessionId) : null;

    // Optimistic update: resolving/unresolving clears skipped state.
    setFeedback((prev) =>
      prev.map((item) =>
        item.id === selectedId ? { ...item, isResolved, isSkipped: false } : item
      )
    );
    applyCountTransition(previousStatus, nextStatus);
    try {
      const res = await authFetch(`/api/tickets/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        // Clear `isSkipped` so status transitions are consistent with counts.
        body: JSON.stringify({ isResolved, isSkipped: false }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        ticket?: TicketFromApi;
      };
      if (data.success && data.ticket) {
        setFeedback((prev) =>
          prev.map((item) =>
            item.id === selectedId ? { ...item, ...data.ticket } : item
          )
        );
        broadcastTicketUpdated(data.ticket);
      }
    } catch (err) {
      console.error("[ECHLY] saveResolved failed", err);
      setFeedback((prev) =>
        prev.map((item) =>
          item.id === selectedId
            ? { ...item, isResolved: previousResolved, isSkipped: previousSkipped }
            : item
        )
      );
      if (sessionId && previousCounts) {
        setCachedCounts(sessionId, previousCounts);
      }
    }
  };

  const handleResolveAndNext = async () => {
    if (!selectedId || !selectedItem) return;
    await saveResolved(true);
    const openIdx = openFeedback.findIndex((f) => f.id === selectedId);
    if (openIdx === -1) return;
    const nextOpen = openFeedback[openIdx + 1] ?? openFeedback[0];
    if (nextOpen && nextOpen.id !== selectedId) {
      setSelectedId(nextOpen.id);
      setExecutionStreak((s) => s + 1);
    }
  };

  const handleExecutionSkip = async () => {
    if (!selectedId) return;
    const previousStatus = selectedItem ? getTicketStatus(selectedItem) : "open";
    const previousResolved = Boolean(selectedItem?.isResolved);
    const previousSkipped = Boolean(selectedItem?.isSkipped);
    const previousCounts = sessionId ? getCachedCounts(sessionId) : null;
    setExecutionStreak(0);
    const openIdx = openFeedback.findIndex((f) => f.id === selectedId);
    const nextOpen = openIdx >= 0 ? openFeedback[openIdx + 1] ?? openFeedback[0] : undefined;
    const nextOpenId = nextOpen?.id === selectedId ? undefined : nextOpen?.id ?? null;

    setFeedback((prev) =>
      prev.map((item) =>
        item.id === selectedId ? { ...item, isSkipped: true, isResolved: false } : item
      )
    );
    applyCountTransition(previousStatus, "skipped");
    setSelectedId(nextOpenId ?? null);

    try {
      await authFetch(`/api/tickets/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSkipped: true }),
      });
    } catch (err) {
      console.error("[ECHLY] handleExecutionSkip PATCH failed", err);
      setFeedback((prev) =>
        prev.map((item) =>
          item.id === selectedId
            ? { ...item, isSkipped: previousSkipped, isResolved: previousResolved }
            : item
        )
      );
      if (sessionId && previousCounts) {
        setCachedCounts(sessionId, previousCounts);
      }
      setSelectedId(selectedId);
    }
  };

  const handleSessionTitleBlur = useCallback(async () => {
    const trimmed = sessionTitleDraft.trim();
    if (!sessionId || !session) return;
    if (trimmed === (session.title ?? "")) {
      setIsEditingSessionTitle(false);
      return;
    }
    const safeTitle =
      trimmed && trimmed.length > 0
        ? trimmed
        : session.title || "Untitled Session";
    const previousTitle = session.title ?? "";
    setSession((prev: Session | null) =>
      prev ? ({ ...prev, title: safeTitle } as Session) : prev
    );
    setSessionTitleDraft(safeTitle);
    setIsSavingSessionTitle(true);
    setIsEditingSessionTitle(false);
    setSaveSessionTitleSuccess(true);
    setTimeout(() => setSaveSessionTitleSuccess(false), 1200);
    try {
      const res = await authFetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: safeTitle }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        session?: Record<string, unknown>;
      };
      if (data.success && data.session) {
        setSession((prev: Session | null) =>
          prev ? ({ ...prev, ...data.session } as Session) : prev
        );
        setSessionTitleDraft((data.session.title as string) ?? safeTitle);
        if (typeof window !== "undefined" && "chrome" in window) {
          try {
            (window as Window & { chrome?: { runtime?: { sendMessage?: (msg: unknown) => void } } }).chrome?.runtime?.sendMessage?.({
              type: "ECHLY_SESSION_UPDATED",
              sessionId,
              title: (data.session.title as string) ?? safeTitle,
            });
          } catch (err) {
            console.error("[ECHLY] ECHLY_SESSION_UPDATED extension message failed", err);
          }
        }
      }
    } catch (err) {
      console.error("[ECHLY] handleSessionTitleBlur PATCH failed", err);
      setSession((prev: Session | null) =>
        prev ? ({ ...prev, title: previousTitle } as Session) : prev
      );
      setSessionTitleDraft(previousTitle);
    } finally {
      setIsSavingSessionTitle(false);
    }
  }, [sessionId, session, sessionTitleDraft]);

  const handleMarkAllResolved = useCallback(async () => {
    const active = feedback.filter((item) => getTicketStatus(item) === "open");
    if (active.length === 0) return;
    const previousFeedback = feedback;
    const previousCounts = sessionId ? getCachedCounts(sessionId) : null;
    setFeedback((prev) =>
      prev.map((item) =>
        getTicketStatus(item) === "open" ? { ...item, isResolved: true } : item
      )
    );
    ensureCountsSeeded();
    if (sessionId) {
      updateCachedCounts(sessionId, (current) => {
        const moved = active.length;
        return {
          ...current,
          open: Math.max(0, current.open - moved),
          resolved: current.resolved + moved,
        };
      });
    }
    try {
      await Promise.all(
        active.map((item) =>
          authFetch(`/api/tickets/${item.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isResolved: true }),
            timeout: 60000,
          })
        )
      );
    } catch (err) {
      warn("Mark all resolved failed:", err);
      setFeedback(previousFeedback);
      if (sessionId && previousCounts) {
        setCachedCounts(sessionId, previousCounts);
      }
      return;
    }
  }, [feedback, sessionId, setFeedback, ensureCountsSeeded]);

  const handleMarkAllUnresolved = useCallback(async () => {
    const resolved = feedback.filter((item) => getTicketStatus(item) === "resolved");
    if (resolved.length === 0) return;
    const previousFeedback = feedback;
    const previousCounts = sessionId ? getCachedCounts(sessionId) : null;
    setFeedback((prev) =>
      prev.map((item) =>
        getTicketStatus(item) === "resolved"
          ? { ...item, isResolved: false }
          : item
      )
    );
    ensureCountsSeeded();
    if (sessionId) {
      updateCachedCounts(sessionId, (current) => {
        const moved = resolved.length;
        return {
          ...current,
          open: current.open + moved,
          resolved: Math.max(0, current.resolved - moved),
        };
      });
    }
    try {
      await Promise.all(
        resolved.map((item) =>
          authFetch(`/api/tickets/${item.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isResolved: false }),
            timeout: 60000,
          })
        )
      );
    } catch (err) {
      warn("Mark all unresolved failed:", err);
      setFeedback(previousFeedback);
      if (sessionId && previousCounts) {
        setCachedCounts(sessionId, previousCounts);
      }
      return;
    }
  }, [feedback, sessionId, setFeedback, ensureCountsSeeded]);

  const handleDeleteFeedback = async (id: string) => {
    const deletedItem = feedback.find((f) => f.id === id);
    const deletedStatus = deletedItem ? getTicketStatus(deletedItem) : "open";
    const prevFeedback = feedback;
    const prevCounts = sessionId ? getCachedCounts(sessionId) : null;
    const nextList = feedback.filter((item) => item.id !== id);
    const nextSelected = selectedId === id ? nextList[0]?.id ?? null : selectedId;
    setFeedback(nextList);
    ensureCountsSeeded();
    updateCachedCounts(sessionId, (c) => {
      const next = { ...c, total: Math.max(0, c.total - 1) };
      if (deletedStatus === "open") next.open = Math.max(0, next.open - 1);
      if (deletedStatus === "resolved") next.resolved = Math.max(0, next.resolved - 1);
      if (deletedStatus === "skipped") next.skipped = Math.max(0, next.skipped - 1);
      return next;
    });
    setSelectedId(nextSelected);
    setShowDeleteModal(false);
    try {
      const res = await authFetch(`/api/tickets/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data?.success) throw new Error(data?.error ?? "Delete failed");
      router.push(`/dashboard/${sessionId}`);
    } catch (err) {
      console.error("[ECHLY] handleDeleteFeedback failed", err);
      setFeedback(prevFeedback);
      if (sessionId && prevCounts) {
        setCachedCounts(sessionId, prevCounts);
      }
      setSelectedId(selectedId);
    }
  };

  // If auth is still settling, keep the UI stable but show a lightweight skeleton.
  if (authLoading) return <SessionPageSkeleton />;

  /* Full-screen Execution Mode: no sidebar, no comment panel, minimal UI only */
  if (executionMode) {
    return (
      <>
        <div className="flex h-screen overflow-hidden">
          <ExecutionModeLayout
            item={selectedItem}
            onExitExecutionMode={() => setExecutionMode(false)}
            onSkip={handleExecutionSkip}
            onNeedsClarification={() => {
              setExecutionMode(false);
              setExecutionStreak(0);
            }}
            onAssign={() => {}}
            onResolveAndNext={handleResolveAndNext}
            onSaveActionSteps={saveActionSteps}
            onExpandImage={() => setIsImageExpanded(true)}
            sessionId={sessionId}
          />
        </div>
        {isImageExpanded && selectedItem?.screenshotUrl && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-10 cursor-pointer"
            onClick={() => setIsImageExpanded(false)}
          >
            <div className="relative w-full h-full max-w-5xl max-h-[90vh]">
              <Image
                src={selectedItem.screenshotUrl}
                alt="Expanded Screenshot"
                fill
                className="object-contain rounded-xl"
              />
            </div>
          </div>
        )}
      </>
    );
  }

  const renderExecutionContent = () => {
    if (feedbackLoading) {
      return <FeedbackPremiumLoader />;
    }
    if (feedback.length === 0) {
      return (
        <div className="mt-16">
          <div className="text-[16px] font-medium text-[hsl(var(--text-primary-strong))]">
            No feedback yet
          </div>
          <div className="mt-2 text-[14px] text-[hsl(var(--text-tertiary))]">
            Capture feedback to start organizing insights.
          </div>
        </div>
      );
    }
    return (
      <ExecutionView
        item={selectedItem}
        onSaveTitle={saveTitle}
        onResolvedChange={saveResolved}
        onSaveActionSteps={saveActionSteps}
        onSaveTags={saveTags}
        setIsImageExpanded={setIsImageExpanded}
        isCommentMode={isCommentMode}
        onOpenComment={() => setIsCommentMode(true)}
        onCloseCommentMode={() => setIsCommentMode(false)}
        onResolveAndNext={handleResolveAndNext}
        impactScore={(selectedItem as { impactScore?: number } | null)?.impactScore}
        comments={comments}
        sendPinComment={sendPinComment ?? undefined}
        sendReply={sendReply}
        activePinIdForPopover={activePinIdForPopover}
        activeThreadId={activeThreadId}
        onPinClick={setActivePinIdForPopover}
        onOpenThreadPanel={(id) => {
          setActiveThreadId(id);
          setActivePinIdForPopover(null);
        }}
        onCloseInlinePopover={() => setActivePinIdForPopover(null)}
        updateComment={updateComment}
        sendTextComment={sendTextComment ?? undefined}
        onCommentPlaced={() => setIsCommentMode(false)}
        updatePinPosition={updatePinPosition ?? undefined}
        onDelete={() => setShowDeleteModal(true)}
      />
    );
  };

  return (
    <>
      <div className="flex h-screen overflow-hidden pt-6">
        <aside className="hidden lg:flex w-[300px] h-full overflow-hidden shrink-0 min-h-0 flex-col">
          <TicketList
            sessionTitle={session?.title ?? "Session"}
            counts={{
              total: feedbackTotal,
              open: feedbackActiveCount,
              resolved: feedbackResolvedCount,
              skipped: feedbackSkippedCount,
            }}
            countsLoading={feedbackCountsLoading}
            isEditingSessionTitle={isEditingSessionTitle}
            sessionTitleDraft={sessionTitleDraft}
            onSessionTitleChange={setSessionTitleDraft}
            onSessionTitleSave={handleSessionTitleBlur}
            onSessionTitleCancel={() => {
              setIsEditingSessionTitle(false);
              setSessionTitleDraft(session?.title ?? "Session");
            }}
            onSessionTitleEdit={() => {
              setSessionTitleDraft(session?.title ?? "Session");
              setIsEditingSessionTitle(true);
            }}
            isSavingSessionTitle={isSavingSessionTitle}
            saveSessionTitleSuccess={saveSessionTitleSuccess}
            items={feedback}
            selectedId={selectedId}
            onSelect={setSelectedId}
            newTicketId={newTicketId}
            loadingMore={feedbackLoadingMore}
            hasMore={hasMoreFeedback}
            hasReachedLimit={feedbackReachedLimit}
            loadMoreRef={feedbackLoadMoreRef}
            scrollContainerRef={listScrollRef}
            onScrollContainerReady={() => setListScrollReady((n) => n + 1)}
            onMarkAllTicketsResolved={handleMarkAllResolved}
            onMarkAllTicketsUnresolved={handleMarkAllUnresolved}
            scrollToId={ticketIdFromUrl}
          />
        </aside>

        <main className="surface-main flex-1 h-full overflow-y-auto min-h-0 flex flex-col min-w-0">
          <div className="h-full flex flex-col min-w-0">
            <div className="z-20 shrink-0 flex items-center justify-between gap-2 px-4 py-3 border-b border-[var(--layer-1-border)] bg-[var(--layer-1-bg)]">
              <div className="lg:hidden">
                <button
                  type="button"
                  onClick={() => setIsTicketNavigatorOpen(true)}
                  className="h-9 inline-flex items-center px-4 rounded-xl border border-[var(--layer-2-border)] bg-[var(--layer-1-bg)] text-[13px] font-medium text-[hsl(var(--text-secondary-soft))] hover:bg-[var(--layer-2-hover-bg)] hover:text-[hsl(var(--text-primary-strong))] transition-colors duration-200"
                >
                  Tickets
                </button>
              </div>
              {feedbackActiveCount > 0 && (
                <button
                  type="button"
                  onClick={() => setExecutionMode(true)}
                  className="h-9 inline-flex items-center px-4 rounded-xl border border-[var(--layer-2-border)] bg-[var(--layer-1-bg)] text-[13px] font-medium text-[hsl(var(--text-secondary-soft))] hover:bg-[var(--layer-2-hover-bg)] hover:text-[hsl(var(--text-primary-strong))] transition-colors duration-200 cursor-pointer"
                >
                  Execution Mode
                </button>
              )}
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
              <div className="max-w-3xl mx-auto w-full px-6 pt-4 pb-4 flex-1 min-h-0 flex flex-col">
                {renderExecutionContent()}
              </div>
            </div>
          </div>
        </main>

        {/* Comment panel: only when a pin/thread is opened (Google Docs style). No permanent sidebar. */}
        <div
          className="shrink-0 flex flex-col min-h-0 border-l border-[var(--layer-2-border)] bg-[var(--canvas-base)] transition-[width] duration-200 ease-out overflow-hidden"
          style={{ width: activeThreadId != null ? 380 : 0 }}
        >
          {activeThreadId != null && (
            <CommentPanel
              variant="sidebar"
              isOpen
              onClose={() => setActiveThreadId(null)}
              comments={comments}
              loading={loadingComments}
              sendReply={sendReply}
              activeThreadId={activeThreadId}
              onSelectThread={setActiveThreadId}
              currentUserId={authUser?.uid ?? null}
              updateComment={updateComment}
              deleteComment={deleteComment}
            />
          )}
        </div>
      </div>

      {isTicketNavigatorOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 transition-opacity duration-200 cursor-pointer"
            onClick={() => setIsTicketNavigatorOpen(false)}
            aria-hidden
          />
          <div
            className="relative w-full max-w-[300px] h-full min-h-0 flex flex-col shadow-[var(--shadow-level-4)]"
            onClick={(e) => e.stopPropagation()}
          >
            <TicketList
              sessionTitle={session?.title ?? "Session"}
              counts={{
                total: feedbackTotal,
                open: feedbackActiveCount,
                resolved: feedbackResolvedCount,
                skipped: feedbackSkippedCount,
              }}
              countsLoading={feedbackCountsLoading}
              isEditingSessionTitle={isEditingSessionTitle}
              sessionTitleDraft={sessionTitleDraft}
              onSessionTitleChange={setSessionTitleDraft}
              onSessionTitleSave={handleSessionTitleBlur}
              onSessionTitleCancel={() => {
                setIsEditingSessionTitle(false);
                setSessionTitleDraft(session?.title ?? "Session");
              }}
              onSessionTitleEdit={() => {
                setSessionTitleDraft(session?.title ?? "Session");
                setIsEditingSessionTitle(true);
              }}
              isSavingSessionTitle={isSavingSessionTitle}
              saveSessionTitleSuccess={saveSessionTitleSuccess}
              items={feedback}
              selectedId={selectedId}
              onSelect={(id) => {
                setSelectedId(id);
                setIsTicketNavigatorOpen(false);
              }}
              newTicketId={newTicketId}
              loadingMore={feedbackLoadingMore}
              hasMore={hasMoreFeedback}
              hasReachedLimit={feedbackReachedLimit}
              loadMoreRef={feedbackLoadMoreRef}
              scrollContainerRef={listScrollRef}
              onScrollContainerReady={() => setListScrollReady((n) => n + 1)}
              onMarkAllTicketsResolved={handleMarkAllResolved}
              onMarkAllTicketsUnresolved={handleMarkAllUnresolved}
              scrollToId={ticketIdFromUrl}
            />
          </div>
        </div>
      )}

      {isImageExpanded && selectedItem?.screenshotUrl && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-10 cursor-pointer"
          onClick={() => setIsImageExpanded(false)}
        >
          <div className="relative w-full h-full max-w-5xl max-h-[90vh]">
            <Image
              src={selectedItem.screenshotUrl}
              alt="Expanded Screenshot"
              fill
              className="object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {showDeleteModal && selectedId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 cursor-pointer"
          onClick={() => setShowDeleteModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-ticket-title"
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6 border border-[var(--layer-2-border)] shadow-[var(--layer-2-shadow-hover)] cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="delete-ticket-title"
              className="text-[18px] font-medium leading-[1.3] text-[hsl(var(--text-primary-strong))]"
            >
              Delete this ticket?
            </h2>
            <p className="mt-2 text-[14px] text-secondary">
              This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-[13px] font-medium rounded-xl text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary-strong))] hover:bg-[var(--layer-2-hover-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] transition-colors duration-[var(--motion-duration)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteFeedback(selectedId)}
                className="px-4 py-2 text-[13px] font-medium rounded-xl bg-[#ef4444] text-white hover:bg-[#dc2626] focus:outline-none focus:ring-2 focus:ring-[#ef4444]/40 transition-colors duration-[120ms] cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

