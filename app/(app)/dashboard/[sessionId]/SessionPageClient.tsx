"use client";

import { authFetch } from "@/lib/authFetch";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addFeedback } from "@/lib/feedback";
import { recordSessionViewIfNew } from "@/lib/sessions";
import { getViewerId } from "@/lib/viewerId";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { uploadScreenshot, generateFeedbackId } from "@/lib/screenshot";
import { SessionPremiumLoader } from "@/components/session/SessionPremiumLoader";
import { FeedbackPremiumLoader } from "@/components/session/FeedbackPremiumLoader";
import { useFeedbackDetailController } from "./hooks/useFeedbackDetailController";
import { useSessionFeedbackPaginated } from "./hooks/useSessionFeedbackPaginated";
import type { Feedback } from "@/lib/domain/feedback";
import { getTicketStatus } from "@/lib/domain/feedback";
import type { Session } from "@/lib/domain/session";
import { ECHLY_DEBUG, log, warn } from "@/lib/utils/logger";
import Image from "next/image";
import {
  TicketList,
  ExecutionView,
  ExecutionModeLayout,
  CommentPanel,
} from "@/components/layout/operating-system";

/** Ticket shape returned by structure-feedback API. */
type StructureFeedbackTicket = {
  title: string;
  description?: string;
  actionSteps?: string[];
  suggestedTags?: string[];
  confidenceScore?: number;
};

/** Context sent with structure-feedback for consistent AI results (visibleText preferred; fallback nearbyText/domPath). */
type StructureFeedbackContext = {
  visibleText?: string | null;
  nearbyText?: string | null;
  domPath?: string | null;
  subtreeText?: string | null;
  url?: string;
  elements?: Array<{ type: string; label?: string | null; text?: string | null }>;
};

/** Structure-feedback API response (includes Clarity Guard and pipeline fields). */
type StructureFeedbackResponse = {
  success?: boolean;
  tickets?: StructureFeedbackTicket[];
  error?: string;
  clarityScore?: number;
  clarityIssues?: string[];
  suggestedRewrite?: string | null;
  confidence?: number;
  needsClarification?: boolean;
  verificationIssues?: string[];
  verificationWarnings?: string[];
  instructionLimitWarning?: string | null;
};

/** Pending state when submission is blocked by low clarity. */
type PendingClaritySubmit = {
  data: StructureFeedbackResponse;
  screenshotUrl: string | null;
  firstFeedbackId: string;
  transcript: string;
  screenshot: string | null;
  clarityScore: number;
  clarityStatus: "clear" | "needs_improvement" | "unclear";
  clarityIssues: string[];
  suggestedRewrite: string | null;
  confidence: number;
  context?: StructureFeedbackContext | null;
};

/** Response shape from POST /api/session-insight. */
type SummaryResponse = {
  summary?: string;
};

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
  } catch {
    // Extension not available
  }
}

/** Ticket shape returned by GET/PATCH /api/tickets/:id (DB source of truth). */
type TicketFromApi = {
  id: string;
  title: string;
  description?: string;
  type: string;
  isResolved?: boolean;
  isSkipped?: boolean;
  actionSteps?: string[] | null;
  suggestedTags?: string[] | null;
  screenshotUrl?: string | null;
  [key: string]: unknown;
};

function SessionPageSkeleton() {
  return (
    <div className="flex h-full overflow-hidden">
      <aside className="w-[300px] flex-shrink-0 h-full overflow-hidden flex flex-col rounded-r-[var(--radius-lg)] bg-[var(--layer-1-bg)] shadow-[var(--shadow-level-1)] border-r border-[var(--layer-1-border)]">
        <div className="flex-1 min-h-0 p-4">
          <div className="space-y-3">
            <div className="h-4 w-40 rounded bg-neutral-200/50 animate-feedback-placeholder-pulse" />
            <div className="h-3 w-56 rounded bg-neutral-100/70 animate-feedback-placeholder-pulse" />
            <div className="h-3 w-52 rounded bg-neutral-100/70 animate-feedback-placeholder-pulse" />
          </div>
        </div>
      </aside>
      <main className="surface-main flex-1 min-h-0 flex flex-col">
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
  /** Prevents duplicate refetch after feedback creation (server also invalidates cache). */
  const refetchAfterCreateScheduledRef = useRef(false);

  const {
    feedback,
    setFeedback,
    total: feedbackTotal,
    activeCount: feedbackActiveCount,
    resolvedCount: feedbackResolvedCount,
    skippedCount: feedbackSkippedCount,
    setTotal: setFeedbackTotal,
    setActiveCount: setFeedbackActiveCount,
    setResolvedCount: setFeedbackResolvedCount,
    setSkippedCount: setFeedbackSkippedCount,
    loading: feedbackLoading,
    hasMore: hasMoreFeedback,
    hasReachedLimit: feedbackReachedLimit,
    loadingMore: feedbackLoadingMore,
    loadMoreRef: feedbackLoadMoreRef,
    refetchFirstPage: refetchFeedbackFirstPage,
  } = useSessionFeedbackPaginated(feedbackSessionId, listScrollRef, listScrollReady);

  /** Single refetch after create; delayed to avoid collision with server cache invalidation. */
  const refetchFeedbackFirstPageAfterCreate = useCallback(() => {
    if (refetchAfterCreateScheduledRef.current) return;
    refetchAfterCreateScheduledRef.current = true;
    setTimeout(() => {
      refetchFeedbackFirstPage().catch(() => {}).finally(() => {
        refetchAfterCreateScheduledRef.current = false;
      });
    }, 300);
  }, [refetchFeedbackFirstPage]);

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
  const [insightRevealed, setInsightRevealed] = useState(false);

  /* Clarity Guard (Phase 5.1): block low-clarity submission, show rewrite option */
  const [clarityResult, setClarityResult] = useState<{
    clarityScore: number;
    clarityIssues: string[];
    suggestedRewrite: string | null;
  } | null>(null);
  const [blockSubmit, setBlockSubmit] = useState(false);
  const [pendingClaritySubmit, setPendingClaritySubmit] = useState<PendingClaritySubmit | null>(null);

  /* Escape exits comment mode (canvas-native: no panel open by default). */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsCommentMode(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  /* Lock body scroll so only sidebar and main content scroll (Slack/Notion-style). */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
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
    } catch {
      // Extension not available — silent fail
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
        ticket: { id: string; title: string; description: string; type?: string };
        sessionId: string;
      }>;
      const { ticket, sessionId: evSessionId } = ev.detail ?? {};
      if (evSessionId !== sessionId || !ticket) return;
      const newItem = {
        id: ticket.id,
        sessionId: evSessionId,
        userId: session.userId,
        title: ticket.title,
        description: ticket.description,
        type: ticket.type ?? "Feedback",
        isResolved: false,
        createdAt: null,
        clientTimestamp: Date.now(),
      };
      setFeedback((prev) => [newItem, ...prev]);
      setSelectedId(ticket.id);
      setNewTicketId(ticket.id);
      setFeedbackTotal((c) => c + 1);
      setFeedbackActiveCount((c) => c + 1);
    };
    window.addEventListener("ECHLY_FEEDBACK_CREATED", handler);
    return () => window.removeEventListener("ECHLY_FEEDBACK_CREATED", handler);
  }, [sessionId, session, setFeedback, setFeedbackTotal, setFeedbackActiveCount]);

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
        recordSessionViewIfNew(sessionSnap.id, viewerId).catch(() => {});
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
    if (feedbackActiveCount === 0) {
      setSelectedId(null);
      return;
    }
    const current = selectedId ? feedback.find((f) => f.id === selectedId) : null;
    if (!current || getTicketStatus(current) !== "open") {
      setSelectedId(openFeedback[0].id);
    }
  }, [executionMode, feedbackActiveCount, feedback, selectedId]);

  /* ================= SELECTED ITEM (derived from feedback list) ================= */

  const selectedIndex = feedback.findIndex((f) => f.id === selectedId);
  const selectedIndexInOpen = openFeedback.findIndex((f) => f.id === selectedId);
  const executionModeTotal = feedbackActiveCount;

  const selectedItem = (() => {
    const ticket = feedback.find((t) => t.id === selectedId) ?? null;
    if (!ticket) return null;
    return {
      ...ticket,
      index:
        executionMode && feedbackActiveCount > 0
          ? selectedIndexInOpen !== -1
            ? selectedIndexInOpen + 1
            : 1
          : selectedIndex !== -1
            ? selectedIndex + 1
            : 1,
      total:
        executionMode && feedbackActiveCount > 0
          ? executionModeTotal
          : typeof feedbackTotal === "number"
            ? Math.max(1, feedbackTotal)
            : 1,
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
    } catch {
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
    } catch {
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
    } catch {
      setFeedback((prev) =>
        prev.map((item) =>
          item.id === selectedId ? { ...item, suggestedTags: previous } : item
        )
      );
    }
  };

  const saveResolved = async (isResolved: boolean) => {
    if (!selectedId) return;
    const previousResolved = Boolean(selectedItem?.isResolved);
    setFeedback((prev) =>
      prev.map((item) =>
        item.id === selectedId ? { ...item, isResolved } : item
      )
    );
    if (previousResolved !== isResolved) {
      if (isResolved) {
        setFeedbackActiveCount((c) => Math.max(0, c - 1));
        setFeedbackResolvedCount((c) => c + 1);
      } else {
        setFeedbackActiveCount((c) => c + 1);
        setFeedbackResolvedCount((c) => Math.max(0, c - 1));
      }
    }
    try {
      const res = await authFetch(`/api/tickets/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isResolved }),
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
    } catch {
      setFeedback((prev) =>
        prev.map((item) =>
          item.id === selectedId
            ? { ...item, isResolved: previousResolved }
            : item
        )
      );
      if (previousResolved !== isResolved) {
        if (previousResolved) {
          setFeedbackActiveCount((c) => c + 1);
          setFeedbackResolvedCount((c) => Math.max(0, c - 1));
        } else {
          setFeedbackActiveCount((c) => Math.max(0, c - 1));
          setFeedbackResolvedCount((c) => c - 1);
        }
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
    setExecutionStreak(0);
    const openIdx = openFeedback.findIndex((f) => f.id === selectedId);
    const nextOpen = openIdx >= 0 ? openFeedback[openIdx + 1] ?? openFeedback[0] : undefined;
    const nextOpenId = nextOpen?.id === selectedId ? undefined : nextOpen?.id ?? null;

    setFeedback((prev) =>
      prev.map((item) =>
        item.id === selectedId ? { ...item, isSkipped: true, isResolved: false } : item
      )
    );
    setFeedbackActiveCount((c) => Math.max(0, c - 1));
    setFeedbackSkippedCount((c) => c + 1);
    setSelectedId(nextOpenId ?? null);

    try {
      await authFetch(`/api/tickets/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSkipped: true }),
      });
    } catch {
      setFeedback((prev) =>
        prev.map((item) =>
          item.id === selectedId ? { ...item, isSkipped: false } : item
        )
      );
      setFeedbackActiveCount((c) => c + 1);
      setFeedbackSkippedCount((c) => Math.max(0, c - 1));
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
          } catch {
            // Extension not available
          }
        }
      }
    } catch {
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
      return;
    }
    setFeedback((prev) =>
      prev.map((item) =>
        getTicketStatus(item) === "open" ? { ...item, isResolved: true } : item
      )
    );
    const activeCountBefore = active.length;
    setFeedbackActiveCount((c) => Math.max(0, c - activeCountBefore));
    setFeedbackResolvedCount((c) => c + activeCountBefore);
    await refetchFeedbackFirstPage();
  }, [
    feedback,
    setFeedback,
    setFeedbackActiveCount,
    setFeedbackResolvedCount,
    refetchFeedbackFirstPage,
  ]);

  const handleMarkAllUnresolved = useCallback(async () => {
    const resolved = feedback.filter((item) => getTicketStatus(item) === "resolved");
    if (resolved.length === 0) return;
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
      return;
    }
    setFeedback((prev) =>
      prev.map((item) =>
        getTicketStatus(item) === "resolved"
          ? { ...item, isResolved: false }
          : item
      )
    );
    const resolvedCountBefore = resolved.length;
    setFeedbackResolvedCount((c) => Math.max(0, c - resolvedCountBefore));
    setFeedbackActiveCount((c) => c + resolvedCountBefore);
    await refetchFeedbackFirstPage();
  }, [
    feedback,
    setFeedback,
    setFeedbackActiveCount,
    setFeedbackResolvedCount,
    refetchFeedbackFirstPage,
  ]);

  /* ================= AI SAVE (Structure Engine V2) ================= */

  const buildClarityStatus = (
    score: number
  ): "clear" | "needs_improvement" | "unclear" => {
    if (score >= 85) return "clear";
    if (score >= 60) return "needs_improvement";
    return "unclear";
  };

  const createFeedbackFromTickets = async (
    tickets: StructureFeedbackTicket[],
    screenshotUrl: string | null,
    firstFeedbackId: string,
    clarityMeta: {
      clarityScore: number;
      clarityStatus: "clear" | "needs_improvement" | "unclear";
      clarityIssues: string[];
      clarityConfidence: number;
    } | null
  ): Promise<Feedback[]> => {
    if (!session) return [];
    const workspaceId = session.workspaceId ?? session.userId;
    const createdByUserId = session.userId;
    if (!workspaceId || !createdByUserId) return [];
    const effectiveFirstId =
      tickets.length > 0 && screenshotUrl !== null ? firstFeedbackId : null;

    // Optimistic: add placeholder items immediately so UI updates without waiting.
    const baseTime = Date.now();
    const optimisticItems: (Feedback & { optimistic?: boolean })[] = tickets.map((t, i) => {
      const tempId = `temp-${baseTime}-${i}`;
      return {
        id: tempId,
        workspaceId,
        sessionId,
        userId: createdByUserId,
        title: t.title ?? "",
        description: typeof t.description === "string" ? t.description : (t.title ?? ""),
        type: Array.isArray(t.suggestedTags) && t.suggestedTags[0] ? t.suggestedTags[0] : "Feedback",
        isResolved: false,
        createdAt: null,
        contextSummary: typeof t.description === "string" ? t.description : null,
        actionSteps: Array.isArray(t.actionSteps) && t.actionSteps.length > 0 ? t.actionSteps : null,
        suggestedTags: t.suggestedTags ?? null,
        screenshotUrl: i === 0 ? screenshotUrl : null,
        clientTimestamp: Date.now(),
        optimistic: true,
      } as Feedback & { optimistic?: boolean };
    });
    setFeedback((prev) => [...optimisticItems, ...prev]);
    if (optimisticItems.length > 0) setSelectedId(optimisticItems[0].id);
    setFeedbackTotal((c) => c + optimisticItems.length);
    setFeedbackActiveCount((c) => c + optimisticItems.length);

    const created: Feedback[] = [];
    for (let i = 0; i < tickets.length; i++) {
      const t = tickets[i];
      const tempId = optimisticItems[i]!.id;
      const payload = {
        title: t.title,
        description:
          typeof t.description === "string" ? t.description : (t.title ?? ""),
        type:
          Array.isArray(t.suggestedTags) && t.suggestedTags[0]
            ? t.suggestedTags[0]
            : "Feedback",
        contextSummary: typeof t.description === "string" ? t.description : undefined,
        actionSteps: Array.isArray(t.actionSteps) ? t.actionSteps : [],
        suggestedTags: t.suggestedTags ?? undefined,
        screenshotUrl: i === 0 ? screenshotUrl : null,
        timestamp: Date.now(),
        ...(clarityMeta && {
          clarityScore: clarityMeta.clarityScore,
          clarityStatus: clarityMeta.clarityStatus,
          clarityIssues: clarityMeta.clarityIssues,
          clarityConfidence: clarityMeta.clarityConfidence,
        }),
      };
      try {
        const docRef = await addFeedback(
          workspaceId,
          sessionId,
          createdByUserId,
          payload,
          i === 0 && effectiveFirstId ? effectiveFirstId : undefined
        );
        const newItem: Feedback = {
          id: docRef.id,
          workspaceId,
          sessionId,
          userId: createdByUserId,
          title: payload.title,
          description: payload.description,
          type: payload.type,
          isResolved: false,
          createdAt: null,
          contextSummary: payload.contextSummary ?? null,
          actionSteps: payload.actionSteps?.length ? payload.actionSteps : null,
          suggestedTags: payload.suggestedTags ?? null,
          screenshotUrl: payload.screenshotUrl ?? null,
          clientTimestamp: Date.now(),
        };
        created.push(newItem);
        setFeedback((prev) =>
          prev.map((item) => (item.id === tempId ? newItem : item))
        );
        if (i === 0) {
          setSelectedId(newItem.id);
          setNewTicketId(newItem.id);
        }
      } catch {
        setFeedback((prev) => prev.filter((item) => item.id !== tempId));
        setFeedbackTotal((c) => Math.max(0, c - 1));
        setFeedbackActiveCount((c) => Math.max(0, c - 1));
      }
    }
    return created;
  };

  const handleTranscript = async (
    transcript: string,
    screenshot: string | null,
    context?: StructureFeedbackContext | null
  ) => {
    const firstFeedbackId = generateFeedbackId();
    const structureCall = authFetch("/api/structure-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transcript,
        ...(context != null && Object.keys(context).length > 0 ? { context } : {}),
      }),
    }).then((res) => res.json() as Promise<StructureFeedbackResponse>);
    const uploadCall = screenshot
      ? uploadScreenshot(screenshot, sessionId, firstFeedbackId)
      : Promise.resolve(null);

    const [data, screenshotUrl] = await Promise.all([structureCall, uploadCall]);
    if (ECHLY_DEBUG) {
      console.log("ECHLY CLARITY DEBUG", {
        clarityScore: data.clarityScore,
        clarityIssues: data.clarityIssues,
        suggestedRewrite: data.suggestedRewrite,
        confidence: data.confidence,
        tickets: data.tickets,
      });
    }
    log("STRUCTURING RESPONSE:", data);

    const tickets = Array.isArray(data.tickets) ? data.tickets : [];
    const clarityScore = data.clarityScore ?? 100;
    const clarityIssues = data.clarityIssues ?? [];
    const suggestedRewrite = data.suggestedRewrite ?? null;
    const confidence = data.confidence ?? 0.5;
    if (ECHLY_DEBUG) {
      console.log("CLARITY DEBUG", {
        clarityScore,
        clarityIssues,
        suggestedRewrite,
        confidence,
      });
    }
    const clarityStatus = buildClarityStatus(clarityScore);

    if (!session) return;

    /* Pipeline or verification requested clarification: show clarity UI, do not create raw ticket */
    if (data.needsClarification && tickets.length === 0) {
      const issues = data.verificationIssues ?? data.clarityIssues ?? ["Feedback needs clarification"];
      setClarityResult({
        clarityScore: clarityScore,
        clarityIssues: issues,
        suggestedRewrite: suggestedRewrite,
      });
      setBlockSubmit(true);
      setPendingClaritySubmit({
        data,
        screenshotUrl,
        firstFeedbackId,
        transcript,
        screenshot,
        clarityScore,
        clarityStatus,
        clarityIssues: issues,
        suggestedRewrite,
        confidence,
        context: context ?? undefined,
      });
      return undefined;
    }

    /* Raw fallback when AI fails or returns no tickets (and not needsClarification) */
    if (!data.success || tickets.length === 0) {
      const workspaceId = session.workspaceId ?? session.userId;
      const createdByUserId = session.userId;
      if (!workspaceId || !createdByUserId) return;
      const rawPayload = {
        title: transcript.slice(0, 80),
        description: transcript,
        type: "general",
        contextSummary: transcript,
        actionSteps: [],
        suggestedTags: undefined,
        screenshotUrl: screenshotUrl ?? null,
        timestamp: Date.now(),
        clarityScore: 0,
        clarityStatus: "unclear" as const,
        clarityIssues: ["AI structuring failed"],
        clarityConfidence: 0,
      };
      const tempId = `temp-${Date.now()}`;
      const optimisticItem: Feedback & { optimistic?: boolean } = {
        id: tempId,
        workspaceId,
        sessionId,
        userId: createdByUserId,
        title: rawPayload.title,
        description: rawPayload.description,
        type: rawPayload.type,
        isResolved: false,
        createdAt: null,
        contextSummary: rawPayload.contextSummary ?? null,
        actionSteps: null,
        suggestedTags: null,
        screenshotUrl: rawPayload.screenshotUrl ?? null,
        clientTimestamp: Date.now(),
        optimistic: true,
      };
      setFeedback((prev) => [optimisticItem, ...prev]);
      setSelectedId(tempId);
      setFeedbackTotal((c) => c + 1);
      setFeedbackActiveCount((c) => c + 1);
      try {
        const docRef = await addFeedback(
          workspaceId,
          sessionId,
          createdByUserId,
          rawPayload,
          firstFeedbackId
        );
        const newItem: Feedback = {
          id: docRef.id,
          workspaceId,
          sessionId,
          userId: createdByUserId,
          title: rawPayload.title,
          description: rawPayload.description,
          type: rawPayload.type,
          isResolved: false,
          createdAt: null,
          contextSummary: rawPayload.contextSummary ?? null,
          actionSteps: null,
          suggestedTags: null,
          screenshotUrl: rawPayload.screenshotUrl ?? null,
          clientTimestamp: Date.now(),
        };
        setFeedback((prev) =>
          prev.map((item) => (item.id === tempId ? newItem : item))
        );
        setSelectedId(newItem.id);
        setNewTicketId(newItem.id);
        refetchFeedbackFirstPageAfterCreate();
        return newItem;
      } catch {
        setFeedback((prev) => prev.filter((item) => item.id !== tempId));
        setFeedbackTotal((c) => Math.max(0, c - 1));
        setFeedbackActiveCount((c) => Math.max(0, c - 1));
        return undefined;
      }
    }

    /* Block submission when clarity is too low */
    if (clarityScore < 60) {
      setClarityResult({
        clarityScore,
        clarityIssues,
        suggestedRewrite,
      });
      setBlockSubmit(true);
      setPendingClaritySubmit({
        data,
        screenshotUrl,
        firstFeedbackId,
        transcript,
        screenshot,
        clarityScore,
        clarityStatus,
        clarityIssues,
        suggestedRewrite,
        confidence,
        context: context ?? undefined,
      });
      return undefined;
    }

    const clarityMeta = {
      clarityScore,
      clarityStatus,
      clarityIssues,
      clarityConfidence: confidence,
    };
    const created = await createFeedbackFromTickets(
      tickets,
      screenshotUrl,
      firstFeedbackId,
      clarityMeta
    );
    if (created.length === 0) return undefined;
    refetchFeedbackFirstPageAfterCreate();
    return created[0];
  };

  const handleClarityUseSuggestion = async () => {
    const pending = pendingClaritySubmit;
    if (!pending?.suggestedRewrite?.trim() || !session) return;
    setBlockSubmit(false);
    setPendingClaritySubmit(null);
    setClarityResult(null);

    const structureCall = authFetch("/api/structure-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transcript: pending.suggestedRewrite!.trim(),
        ...(pending.context != null && Object.keys(pending.context).length > 0 ? { context: pending.context } : {}),
      }),
    }).then((res) => res.json() as Promise<StructureFeedbackResponse>);

    const data = (await structureCall) as StructureFeedbackResponse;
    const tickets = Array.isArray(data.tickets) ? data.tickets : [];
    const clarityScore = data.clarityScore ?? 100;
    const clarityStatus = buildClarityStatus(clarityScore);
    const clarityMeta = {
      clarityScore,
      clarityStatus,
      clarityIssues: data.clarityIssues ?? [],
      clarityConfidence: data.confidence ?? 0.5,
    };

    const created = await createFeedbackFromTickets(
      tickets,
      pending.screenshotUrl,
      pending.firstFeedbackId,
      clarityMeta
    );
    if (created.length === 0) return;
    refetchFeedbackFirstPageAfterCreate();
  };

  const handleClaritySubmitAnyway = async () => {
    const pending = pendingClaritySubmit;
    if (!pending || !session) return;
    setBlockSubmit(false);
    setPendingClaritySubmit(null);
    setClarityResult(null);

    const tickets = pending.data.tickets ?? [];
    const clarityMeta = {
      clarityScore: pending.clarityScore,
      clarityStatus: pending.clarityStatus,
      clarityIssues: pending.clarityIssues,
      clarityConfidence: pending.confidence,
    };
    const created = await createFeedbackFromTickets(
      tickets,
      pending.screenshotUrl,
      pending.firstFeedbackId,
      clarityMeta
    );
    if (created.length === 0) return;
    refetchFeedbackFirstPageAfterCreate();
  };

  const handleDeleteFeedback = async (id: string) => {
    const deletedItem = feedback.find((f) => f.id === id);
    const wasResolved = deletedItem?.isResolved ?? false;
    const prevFeedback = feedback;
    const nextList = feedback.filter((item) => item.id !== id);
    const nextSelected = selectedId === id ? nextList[0]?.id ?? null : selectedId;
    setFeedback(nextList);
    setFeedbackTotal((c) => Math.max(0, c - 1));
    if (wasResolved) {
      setFeedbackResolvedCount((c) => Math.max(0, c - 1));
    } else {
      setFeedbackActiveCount((c) => Math.max(0, c - 1));
    }
    setSelectedId(nextSelected);
    setShowDeleteModal(false);
    try {
      const res = await authFetch(`/api/tickets/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data?.success) throw new Error(data?.error ?? "Delete failed");
      await refetchFeedbackFirstPage();
      router.push(`/dashboard/${sessionId}`);
    } catch {
      setFeedback(prevFeedback);
      setFeedbackTotal((c) => c + 1);
      if (wasResolved) setFeedbackResolvedCount((c) => c + 1);
      else setFeedbackActiveCount((c) => c + 1);
      setSelectedId(selectedId);
    }
  };

  // Non-intrusive: fetch session insight after main content renders (no spinners).
  // Must be declared before any conditional returns (React hook ordering).
  useEffect(() => {
    if (authLoading) return;
    if (!authUser || !sessionId) return;
    if (!session) return;
    if (feedbackLoading) return;

    const existing =
      typeof session.aiInsightSummary === "string"
        ? session.aiInsightSummary.trim()
        : "";
    const existingCount =
      typeof session.aiInsightSummaryFeedbackCount === "number"
        ? session.aiInsightSummaryFeedbackCount
        : null;
    const currentCount = typeof feedbackTotal === "number" ? feedbackTotal : 0;

    if (currentCount <= 0) return;

    const shouldFetch =
      !existing || (existingCount != null && existingCount !== currentCount);
    if (!shouldFetch) return;

    let cancelled = false;
    authFetch("/api/session-insight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then(async (res) => (await res.json()) as SummaryResponse)
      .then((data) => {
        if (cancelled) return;
        const summary = data.summary;
        if (typeof summary === "string" && summary.trim() !== "") {
          setSession((prev) =>
            prev
              ? ({
                  ...prev,
                  aiInsightSummary: summary.trim(),
                  aiInsightSummaryFeedbackCount: currentCount,
                } as Session)
              : prev
          );
        }
      })
      .catch(() => {
        // Fail silently
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, authUser, sessionId, session, feedbackLoading, feedbackTotal]);

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
      <div className="flex h-full overflow-hidden">
        <aside className="hidden lg:flex w-[300px] flex-shrink-0 flex-col h-full overflow-hidden">
          <TicketList
            sessionTitle={session?.title ?? "Session"}
            sessionStatus={session?.status}
            totalCount={feedbackTotal}
            openCount={feedbackActiveCount}
            resolvedCount={feedbackResolvedCount}
            skippedCount={feedbackSkippedCount}
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
            loading={feedbackLoading}
            scrollContainerRef={listScrollRef}
            onScrollContainerReady={() => setListScrollReady((n) => n + 1)}
            onMarkAllTicketsResolved={handleMarkAllResolved}
            onMarkAllTicketsUnresolved={handleMarkAllUnresolved}
            scrollToId={ticketIdFromUrl}
          />
        </aside>

        <main className="surface-main flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex-shrink-0 flex items-center justify-between gap-2 px-4 py-3 border-b border-[var(--layer-1-border)] bg-[var(--layer-1-bg)]/80">
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
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="max-w-3xl mx-auto w-full px-6 py-4">
              {renderExecutionContent()}
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

      {/* Clarity Guard: block panel when feedback is unclear */}
      {blockSubmit && clarityResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 cursor-pointer"
          onClick={() => {}}
          role="dialog"
          aria-modal="true"
          aria-labelledby="clarity-guard-title"
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 border border-[var(--layer-2-border)] shadow-[var(--layer-2-shadow-hover)] cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="clarity-guard-title"
              className="text-[18px] font-semibold leading-[1.3] text-[hsl(var(--text-primary-strong))]"
            >
              Feedback needs clarity
            </h2>
            <p className="mt-1 text-[14px] text-[hsl(var(--text-tertiary))]">
              Score: {clarityResult.clarityScore}/100 — below threshold for submission.
            </p>
            {clarityResult.clarityIssues.length > 0 && (
              <ul className="mt-3 list-disc list-inside text-[13px] text-[hsl(var(--text-secondary-soft))] space-y-1">
                {clarityResult.clarityIssues.map((issue, i) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
            )}
            {clarityResult.suggestedRewrite && (
              <div className="mt-3 p-3 rounded-xl bg-[var(--layer-2-hover-bg)] border border-[var(--layer-2-border)]">
                <p className="text-[12px] font-medium text-[hsl(var(--text-tertiary))] mb-1">
                  Suggested rewrite
                </p>
                <p className="text-[14px] text-[hsl(var(--text-primary-strong))]">
                  {clarityResult.suggestedRewrite}
                </p>
              </div>
            )}
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setBlockSubmit(false);
                  setPendingClaritySubmit(null);
                  setClarityResult(null);
                }}
                className="px-4 py-2 text-[13px] font-medium rounded-xl text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary-strong))] hover:bg-[var(--layer-2-hover-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              {clarityResult.suggestedRewrite && (
                <button
                  type="button"
                  onClick={handleClarityUseSuggestion}
                  className="px-4 py-2 text-[13px] font-medium rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] transition-colors cursor-pointer"
                >
                  Use Suggestion
                </button>
              )}
              <button
                type="button"
                onClick={handleClaritySubmitAnyway}
                className="px-4 py-2 text-[13px] font-medium rounded-xl border border-[var(--layer-2-border)] bg-[var(--layer-1-bg)] text-[hsl(var(--text-primary-strong))] hover:bg-[var(--layer-2-hover-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] transition-colors cursor-pointer"
              >
                Submit Anyway
              </button>
            </div>
          </div>
        </div>
      )}

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
              sessionStatus={session?.status}
              totalCount={feedbackTotal}
              openCount={feedbackActiveCount}
              resolvedCount={feedbackResolvedCount}
              skippedCount={feedbackSkippedCount}
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
              loading={feedbackLoading}
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

      {/* Keep legacy full-screen loader available (unused by default) */}
      {false && <SessionPremiumLoader />}
    </>
  );
}

