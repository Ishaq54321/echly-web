"use client";

import { authFetch } from "@/lib/authFetch";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addFeedback, deleteFeedback } from "@/lib/feedback";
import { recordSessionViewIfNew } from "@/lib/sessions";
import { getViewerId } from "@/lib/viewerId";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { uploadScreenshot, generateFeedbackId } from "@/lib/screenshot";
import { SessionPremiumLoader } from "@/components/session/SessionPremiumLoader";
import { FeedbackPremiumLoader } from "@/components/session/FeedbackPremiumLoader";
import { useFeedbackDetailController } from "./hooks/useFeedbackDetailController";
import { useSessionFeedbackPaginated } from "./hooks/useSessionFeedbackPaginated";
import type { Feedback } from "@/lib/domain/feedback";
import type { Session } from "@/lib/domain/session";
import { log, warn } from "@/lib/utils/logger";
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
};

/** Response shape from POST /api/session-insight. */
type SummaryResponse = {
  summary?: string;
};

/** Ticket shape returned by GET/PATCH /api/tickets/:id (DB source of truth). */
type TicketFromApi = {
  id: string;
  title: string;
  description: string;
  type: string;
  isResolved?: boolean;
  actionSteps?: string[] | null;
  suggestedTags?: string[] | null;
  screenshotUrl?: string | null;
  [key: string]: unknown;
};

function SessionPageSkeleton() {
  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      <aside className="w-[280px] shrink-0 min-h-0 flex flex-col bg-[var(--structural-gray-ticket)] border-r border-[rgba(0,0,0,0.06)]">
        <div className="flex-1 min-h-0 overflow-y-auto p-4">
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
            <div className="text-[13px] text-neutral-500 flex-shrink-0">
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

  const [session, setSession] = useState<Session | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userPhotoURL, setUserPhotoURL] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  /** Detail panel: always from DB (GET /api/tickets/:id). Do not use memory state. */
  const [detailTicket, setDetailTicket] = useState<TicketFromApi | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

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
    setTotal: setFeedbackTotal,
    setActiveCount: setFeedbackActiveCount,
    setResolvedCount: setFeedbackResolvedCount,
    loading: feedbackLoading,
    hasMore: hasMoreFeedback,
    hasReachedLimit: feedbackReachedLimit,
    loadingMore: feedbackLoadingMore,
    loadMoreRef: feedbackLoadMoreRef,
  } = useSessionFeedbackPaginated(feedbackSessionId, listScrollRef, listScrollReady);

  const [isTicketNavigatorOpen, setIsTicketNavigatorOpen] = useState(false);
  const [executionMode, setExecutionMode] = useState(false);
  const [executionStreak, setExecutionStreak] = useState(0);
  const [preloadedNextTicket, setPreloadedNextTicket] = useState<TicketFromApi | null>(null);
  const [isCommentMode, setIsCommentMode] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [isSavingDescription, setIsSavingDescription] = useState(false);
  const [saveDescriptionSuccess, setSaveDescriptionSuccess] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditingSessionTitle, setIsEditingSessionTitle] = useState(false);
  const [sessionTitleDraft, setSessionTitleDraft] = useState("");
  const [isSavingSessionTitle, setIsSavingSessionTitle] = useState(false);
  const [saveSessionTitleSuccess, setSaveSessionTitleSuccess] = useState(false);
  const [insightRevealed, setInsightRevealed] = useState(false);

  /* Escape exits comment mode (canvas-native: no panel open by default). */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsCommentMode(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
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

  // Select first feedback when first page loads and none selected.
  useEffect(() => {
    if (feedback.length > 0 && selectedId === null) {
      setSelectedId(feedback[0].id);
    }
  }, [feedback, selectedId]);

  /* ================= FETCH DETAIL FROM DB (single source of truth) ================= */

  const fetchDetailTicket = useCallback(async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await authFetch(`/api/tickets/${id}`);
      const data = (await res.json()) as {
        success?: boolean;
        ticket?: TicketFromApi;
      };
      if (data.success && data.ticket) {
        setDetailTicket(data.ticket);
      } else {
        setDetailTicket(null);
      }
    } catch {
      setDetailTicket(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetailTicket(null);
      return;
    }
    if (detailTicket?.id === selectedId) return;
    fetchDetailTicket(selectedId);
  }, [selectedId, fetchDetailTicket, detailTicket?.id]);

  /* Preload next ticket in Execution Mode for instant transition */
  useEffect(() => {
    if (!executionMode || feedback.length === 0) return;
    setPreloadedNextTicket(null);
  }, [selectedId, executionMode, feedback.length]);

  useEffect(() => {
    if (!executionMode || feedback.length === 0) return;
    const idx = feedback.findIndex((f) => f.id === selectedId);
    const nextId = idx >= 0 ? feedback[idx + 1]?.id : undefined;
    if (!nextId) return;
    let cancelled = false;
    authFetch(`/api/tickets/${nextId}`)
      .then((res) => res.json())
      .then((data: { success?: boolean; ticket?: TicketFromApi }) => {
        if (cancelled || !data.success || !data.ticket) return;
        setPreloadedNextTicket(data.ticket);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [executionMode, selectedId, feedback]);

  /* ================= SELECTED ITEM WITH INDEX (from DB) ================= */

  const selectedIndex = feedback.findIndex((f) => f.id === selectedId);

  const selectedItem =
    detailTicket != null
      ? {
          ...detailTicket,
          index: selectedIndex !== -1 ? selectedIndex + 1 : 1,
          total: feedbackTotal > 0 ? feedbackTotal : feedback.length || 1,
        }
      : null;

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
    feedbackId: selectedId,
  });

  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  /** Pin whose inline thread popover is open (does not open right panel). */
  const [activePinIdForPopover, setActivePinIdForPopover] = useState<string | null>(null);

  /* ================= SYNC DESCRIPTION (from DB-backed detail) ================= */

  useEffect(() => {
    if (detailTicket) {
      setDescriptionDraft(detailTicket.description);
      setIsEditingDescription(false);
    }
  }, [selectedId, detailTicket]);

  /* ================= SAVE TITLE (optimistic update, then PATCH) ================= */

  const saveTitle = async (newTitle: string): Promise<void> => {
    if (!selectedId || newTitle.trim() === "") return;
    const trimmed = newTitle.trim();
    const previousTitle = detailTicket?.title;
    setDetailTicket((t) => (t ? { ...t, title: trimmed } : null));
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
        setDetailTicket(data.ticket);
      }
    } catch {
      setDetailTicket((t) =>
        t ? { ...t, title: previousTitle ?? trimmed } : null
      );
      setFeedback((prev) =>
        prev.map((item) =>
          item.id === selectedId
            ? { ...item, title: previousTitle ?? trimmed }
            : item
        )
      );
    }
  };

  /* ================= SAVE DESCRIPTION (optimistic update, then PATCH) ================= */

  const saveDescription = async (): Promise<void> => {
    if (!selectedId || descriptionDraft === detailTicket?.description) {
      setIsEditingDescription(false);
      return;
    }
    const previousDescription = detailTicket?.description ?? "";
    setIsSavingDescription(true);
    setDetailTicket((t) => (t ? { ...t, description: descriptionDraft } : null));
    setFeedback((prev) =>
      prev.map((item) =>
        item.id === selectedId ? { ...item, description: descriptionDraft } : item
      )
    );
    setIsEditingDescription(false);
    setSaveDescriptionSuccess(true);
    setTimeout(() => setSaveDescriptionSuccess(false), 1200);
    try {
      const res = await authFetch(`/api/tickets/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: descriptionDraft }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        ticket?: TicketFromApi;
      };
      if (data.success && data.ticket) {
        setDetailTicket(data.ticket);
        setDescriptionDraft(data.ticket.description);
      }
    } catch {
      setDetailTicket((t) =>
        t ? { ...t, description: previousDescription } : null
      );
      setFeedback((prev) =>
        prev.map((item) =>
          item.id === selectedId
            ? { ...item, description: previousDescription }
            : item
        )
      );
      setDescriptionDraft(previousDescription);
    } finally {
      setIsSavingDescription(false);
    }
  };

  /* ================= SAVE ACTION STEPS (optimistic update, then PATCH) ================= */

  const saveActionSteps = async (actionSteps: string[]) => {
    if (!selectedId) return;
    const previous = detailTicket?.actionSteps ?? null;
    setDetailTicket((t) => (t ? { ...t, actionSteps } : null));
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
      if (data.success && data.ticket) setDetailTicket(data.ticket);
    } catch {
      setDetailTicket((t) => (t ? { ...t, actionSteps: previous } : null));
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
    const previous = detailTicket?.suggestedTags ?? null;
    setDetailTicket((t) => (t ? { ...t, suggestedTags: nextTags } : null));
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
      if (data.success && data.ticket) setDetailTicket(data.ticket);
    } catch {
      setDetailTicket((t) => (t ? { ...t, suggestedTags: previous } : null));
      setFeedback((prev) =>
        prev.map((item) =>
          item.id === selectedId ? { ...item, suggestedTags: previous } : item
        )
      );
    }
  };

  const saveResolved = async (isResolved: boolean) => {
    if (!selectedId) return;
    const previousResolved = Boolean(detailTicket?.isResolved);
    setDetailTicket((t) => (t ? { ...t, isResolved } : null));
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
      if (data.success && data.ticket) setDetailTicket(data.ticket);
    } catch {
      setDetailTicket((t) => (t ? { ...t, isResolved: previousResolved } : null));
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
    const currentIndex = feedback.findIndex((f) => f.id === selectedId);
    if (currentIndex === -1) return;
    let nextIndex = currentIndex + 1;
    if (nextIndex >= feedback.length) nextIndex = 0;
    let next = feedback[nextIndex];
    while (next && (next.isResolved ?? false) && nextIndex < feedback.length - 1) {
      nextIndex += 1;
      next = feedback[nextIndex];
    }
    if (next && (next.isResolved ?? false)) next = null;
    if (next) {
      if (preloadedNextTicket?.id === next.id) {
        setDetailTicket(preloadedNextTicket);
        setPreloadedNextTicket(null);
      }
      setSelectedId(next.id);
      setExecutionStreak((s) => s + 1);
    }
  };

  const handleExecutionDone = async () => {
    if (!selectedId || !selectedItem) return;
    await saveResolved(true);
    const currentIndex = feedback.findIndex((f) => f.id === selectedId);
    if (currentIndex === -1) return;
    let nextIndex = currentIndex + 1;
    if (nextIndex >= feedback.length) nextIndex = 0;
    let next = feedback[nextIndex];
    while (next && (next.isResolved ?? false) && nextIndex < feedback.length - 1) {
      nextIndex += 1;
      next = feedback[nextIndex];
    }
    if (next && (next.isResolved ?? false)) next = null;
    if (next) {
      if (preloadedNextTicket?.id === next.id) {
        setDetailTicket(preloadedNextTicket);
        setPreloadedNextTicket(null);
      }
      setSelectedId(next.id);
      setExecutionStreak((s) => s + 1);
    }
  };

  const handleExecutionSkip = () => {
    setExecutionStreak(0);
    const currentIndex = feedback.findIndex((f) => f.id === selectedId);
    if (currentIndex === -1) return;
    const next = feedback[currentIndex + 1] ?? feedback[0];
    if (next) {
      if (preloadedNextTicket?.id === next.id) {
        setDetailTicket(preloadedNextTicket);
        setPreloadedNextTicket(null);
      }
      setSelectedId(next.id);
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
    const active = feedback.filter((item) => !(item.isResolved ?? false));
    if (active.length === 0) return;
    await Promise.all(
      active.map((item) =>
        authFetch(`/api/tickets/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isResolved: true }),
        })
      )
    );
    setFeedback((prev) => prev.map((item) => ({ ...item, isResolved: true })));
    if (detailTicket && selectedId) {
      setDetailTicket((t) => (t ? { ...t, isResolved: true } : null));
    }
    const activeCountBefore = feedback.filter((f) => !(f.isResolved ?? false))
      .length;
    setFeedbackActiveCount((c) => Math.max(0, c - activeCountBefore));
    setFeedbackResolvedCount((c) => c + activeCountBefore);
  }, [
    feedback,
    detailTicket,
    selectedId,
    setFeedback,
    setFeedbackActiveCount,
    setFeedbackResolvedCount,
  ]);

  const handleMarkAllUnresolved = useCallback(async () => {
    const resolved = feedback.filter((item) => item.isResolved ?? false);
    if (resolved.length === 0) return;
    await Promise.all(
      resolved.map((item) =>
        authFetch(`/api/tickets/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isResolved: false }),
        })
      )
    );
    setFeedback((prev) => prev.map((item) => ({ ...item, isResolved: false })));
    if (detailTicket && selectedId) {
      setDetailTicket((t) => (t ? { ...t, isResolved: false } : null));
    }
    const resolvedCountBefore = feedback.filter((f) => f.isResolved ?? false).length;
    setFeedbackResolvedCount((c) => Math.max(0, c - resolvedCountBefore));
    setFeedbackActiveCount((c) => c + resolvedCountBefore);
  }, [
    feedback,
    detailTicket,
    selectedId,
    setFeedback,
    setFeedbackActiveCount,
    setFeedbackResolvedCount,
  ]);

  /* ================= AI SAVE (Structure Engine V2) ================= */

  const handleTranscript = async (
    transcript: string,
    screenshot: string | null
  ) => {
    const firstFeedbackId = generateFeedbackId();
    const structureCall = authFetch("/api/structure-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    }).then(
      (res) =>
        res.json() as Promise<{
          success?: boolean;
          tickets?: StructureFeedbackTicket[];
          error?: string;
        }>
    );
    const uploadCall = screenshot
      ? uploadScreenshot(screenshot, sessionId, firstFeedbackId)
      : Promise.resolve(null);

    const [data, screenshotUrl] = await Promise.all([structureCall, uploadCall]);
    log("STRUCTURING RESPONSE:", data);

    const tickets = Array.isArray(data.tickets) ? data.tickets : [];
    if (!data.success || tickets.length === 0) {
      warn("No structured tickets returned", data);
      return;
    }

    if (!session) return;

    const effectiveFirstId =
      tickets.length > 0 && screenshotUrl !== null ? firstFeedbackId : null;

    const created: Feedback[] = [];
    for (let i = 0; i < tickets.length; i++) {
      const t = tickets[i] as StructureFeedbackTicket;
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
        screenshotUrl: i === 0 ? screenshotUrl ?? null : null,
        timestamp: Date.now(),
      };

      const docRef = await addFeedback(
        sessionId,
        session.userId,
        payload,
        i === 0 && effectiveFirstId ? effectiveFirstId : undefined
      );
      const newItem: Feedback = {
        id: docRef.id,
        sessionId,
        userId: session.userId,
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
    }

    setFeedback((prev) => [...created, ...prev]);
    setSelectedId(created[0].id);
    setFeedbackTotal((c) => c + created.length);
    setFeedbackActiveCount((c) => c + created.length);

    return created[0];
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
    setDetailTicket(null);
    setSelectedId(nextSelected);
    setShowDeleteModal(false);
    if (nextSelected === null) router.push(`/dashboard/${sessionId}`);
    try {
      await deleteFeedback(id, sessionId);
    } catch {
      setFeedback(prevFeedback);
      setFeedbackTotal((c) => c + 1);
      if (wasResolved) setFeedbackResolvedCount((c) => c + 1);
      else setFeedbackActiveCount((c) => c + 1);
      setSelectedId(selectedId);
      if (selectedId) fetchDetailTicket(selectedId);
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
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <ExecutionModeLayout
            item={selectedItem}
            onExitExecutionMode={() => setExecutionMode(false)}
            onDone={handleExecutionDone}
            onNeedsClarification={() => {
              setExecutionMode(false);
              setExecutionStreak(0);
            }}
            onAssign={() => {}}
            onSkip={handleExecutionSkip}
            onResolveAndNext={handleResolveAndNext}
            onSaveActionSteps={saveActionSteps}
            onExpandImage={() => setIsImageExpanded(true)}
            descriptionDraft={descriptionDraft}
            setDescriptionDraft={setDescriptionDraft}
            saveDescription={saveDescription}
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
    if (detailLoading && selectedId) {
      return (
        <div className="py-12">
          <p className="text-[13px] text-[hsl(var(--text-tertiary))]">
            Loading…
          </p>
        </div>
      );
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
        isEditingDescription={isEditingDescription}
        descriptionDraft={descriptionDraft}
        setIsEditingDescription={setIsEditingDescription}
        setDescriptionDraft={setDescriptionDraft}
        saveDescription={saveDescription}
        isSavingDescription={isSavingDescription}
        saveDescriptionSuccess={saveDescriptionSuccess}
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
      />
    );
  };

  return (
    <>
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <aside className="hidden lg:flex w-[300px] shrink-0 min-h-0 flex-col bg-[var(--canvas-base)] border-r border-[var(--layer-2-border)]">
          <TicketList
            sessionTitle={session?.title ?? "Session"}
            totalCount={feedbackTotal}
            openCount={feedbackActiveCount}
            resolvedCount={feedbackResolvedCount}
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
            loadingMore={feedbackLoadingMore}
            hasMore={hasMoreFeedback}
            hasReachedLimit={feedbackReachedLimit}
            loadMoreRef={feedbackLoadMoreRef}
            scrollContainerRef={listScrollRef}
            onScrollContainerReady={() => setListScrollReady((n) => n + 1)}
            onMarkAllTicketsResolved={handleMarkAllResolved}
            onMarkAllTicketsUnresolved={handleMarkAllUnresolved}
          />
        </aside>

        <main className="surface-main flex-1 min-h-0 flex flex-col min-w-0">
          <div className="shrink-0 flex items-center justify-between gap-2 px-4 py-2 border-b border-[var(--layer-2-border)]">
            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => setIsTicketNavigatorOpen(true)}
                className="h-8 inline-flex items-center px-3 rounded-md border border-[var(--layer-2-border)] bg-white text-[12px] font-medium text-[hsl(var(--text-secondary-soft))]"
              >
                Tickets
              </button>
            </div>
            {feedback.length > 0 && (
              <button
                type="button"
                onClick={() => setExecutionMode(true)}
                className="h-8 inline-flex items-center px-3 rounded-lg border border-[var(--layer-2-border)] bg-white text-[12px] font-medium text-[hsl(var(--text-secondary-soft))] hover:bg-[var(--layer-2-hover-bg)] hover:text-[hsl(var(--text-primary-strong))] transition-colors cursor-pointer"
              >
                Execution Mode
              </button>
            )}
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
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

      {isTicketNavigatorOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 transition-opacity duration-200 cursor-pointer"
            onClick={() => setIsTicketNavigatorOpen(false)}
            aria-hidden
          />
          <div
            className="relative w-full max-w-[300px] h-full min-h-0 bg-[var(--canvas-base)] flex flex-col border-r border-[var(--layer-2-border)]"
            onClick={(e) => e.stopPropagation()}
          >
            <TicketList
              sessionTitle={session?.title ?? "Session"}
              totalCount={feedbackTotal}
              openCount={feedbackActiveCount}
              resolvedCount={feedbackResolvedCount}
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
              loadingMore={feedbackLoadingMore}
              hasMore={hasMoreFeedback}
              hasReachedLimit={feedbackReachedLimit}
              loadMoreRef={feedbackLoadMoreRef}
              scrollContainerRef={listScrollRef}
              onScrollContainerReady={() => setListScrollReady((n) => n + 1)}
              onMarkAllTicketsResolved={handleMarkAllResolved}
              onMarkAllTicketsUnresolved={handleMarkAllUnresolved}
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
              Delete feedback permanently?
            </h2>
            <p className="mt-2 text-[14px] text-neutral-500">
              This action cannot be undone. This will permanently remove this
              feedback and associated activity.
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-[13px] font-medium rounded-md text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:ring-offset-1 transition-colors duration-150 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteFeedback(selectedId)}
                className="px-4 py-2 text-[13px] font-medium rounded-xl bg-[hsl(var(--text-primary-strong))] text-white hover:opacity-92 focus:outline-none focus:ring-1 focus:ring-[var(--ai-accent)] transition-colors duration-[120ms] cursor-pointer"
              >
                Delete permanently
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

