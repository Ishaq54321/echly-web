"use client";

import { authFetch } from "@/lib/authFetch";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { recordSessionViewIfNew } from "@/lib/sessions";
import { getViewerId } from "@/lib/viewerId";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { useWorkspace } from "@/lib/client/workspaceContext";
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
import { hasPermission, normalizeAccessLevel } from "@/lib/domain/accessLevel";
import { getEffectiveAccessLevel } from "@/lib/permissions/sessionEffectiveAccess";
import { warn } from "@/lib/utils/logger";
import Image from "next/image";
import {
  TicketList,
  ExecutionView,
  CommentPanel,
} from "@/components/layout/operating-system";
import { TopControlBar } from "@/components/ui/TopControlBar";
import { DeleteSessionModal } from "@/components/dashboard/DeleteSessionModal";

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
}

function SessionPageSkeleton() {
  return (
    <div className="flex h-full min-h-0 overflow-hidden">
      <aside className="w-[280px] h-screen shrink-0 self-start flex flex-col rounded-none bg-[#FAFBFC]">
        <div className="flex-1 min-h-0 overflow-y-auto p-4">
          <div className="space-y-3">
            <div className="h-4 w-40 rounded bg-neutral-200/50 animate-feedback-placeholder-pulse" />
            <div className="h-3 w-56 rounded bg-neutral-100/70 animate-feedback-placeholder-pulse" />
            <div className="h-3 w-52 rounded bg-neutral-100/70 animate-feedback-placeholder-pulse" />
          </div>
        </div>
      </aside>
      <div className="content-divider shrink-0" aria-hidden />
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  /** Tracks the newest ticket id for the highlight animation; cleared after animation ends. */
  const [newTicketId, setNewTicketId] = useState<string | null>(null);

  const { loading: authLoading } = useAuthGuard({ router });
  const { workspaceId, claimsReady, authUid } = useWorkspace();

  const feedbackSessionId =
    claimsReady && workspaceId && authUid && sessionId ? sessionId : undefined;

  const listScrollRef = useRef<HTMLDivElement | null>(null);
  const [listScrollReady, setListScrollReady] = useState(0);
  const [openExpanded, setOpenExpanded] = useState(true);
  const [resolvedExpanded, setResolvedExpanded] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const isSearchMode = searchQuery.trim().length > 0;
  const [searchResults, setSearchResults] = useState<Feedback[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const onOpenExpandedChange = useCallback(() => {
    setOpenExpanded((prev) => {
      const next = !prev;
      if (next) {
        setResolvedExpanded(false);
      }
      return next;
    });
  }, []);

  const onResolvedExpandedChange = useCallback(() => {
    setResolvedExpanded((prev) => {
      const next = !prev;
      if (next) {
        setOpenExpanded(false);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    setOpenExpanded(true);
    setResolvedExpanded(false);
    setSearchQuery("");
    setSearchResults([]);
    setSearchLoading(false);
  }, [sessionId]);

  useEffect(() => {
    const el = listScrollRef.current;
    if (!el) return;
    el.scrollTop = 0;
  }, [sessionId]);

  useEffect(() => {
    if (!isSearchMode) return;
    setOpenExpanded(true);
    setResolvedExpanded(true);
  }, [isSearchMode]);

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    if (!feedbackSessionId) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    let cancelled = false;
    setSearchLoading(true);
    const handle = window.setTimeout(() => {
      void (async () => {
        try {
          const url = `/api/feedback/search?sessionId=${encodeURIComponent(feedbackSessionId)}&query=${encodeURIComponent(q)}`;
          const res = await authFetch(url);
          if (!res) return;
          if (!res.ok) {
            throw new Error(`search ${res.status}`);
          }
          const data = (await res.json()) as { feedback?: Feedback[] };
          if (cancelled) return;
          setSearchResults(data.feedback ?? []);
        } catch (err) {
          console.error("[ECHLY] Session search failed", err);
          if (!cancelled) setSearchResults([]);
        } finally {
          if (!cancelled) setSearchLoading(false);
        }
      })();
    }, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [searchQuery, feedbackSessionId]);

  const {
    canonicalFeedback,
    openFeedback,
    resolvedFeedback,
    feedback,
    setFeedback,
    total: feedbackTotal,
    activeCount: feedbackActiveCount,
    resolvedCount: feedbackResolvedCount,
    countsLoading: feedbackCountsLoading,
    loading: feedbackLoading,
    hasMore: hasMoreFeedback,
    hasReachedLimit: feedbackReachedLimit,
    loadingMore: feedbackLoadingMore,
    isLoadingResolved: feedbackLoadingResolved,
    loadMoreRef: feedbackLoadMoreRef,
  } = useSessionFeedbackPaginated(
    feedbackSessionId,
    listScrollRef,
    listScrollReady,
    (newestTicketId) => {
      setSelectedId(newestTicketId);
      setNewTicketId(newestTicketId);
    },
    resolvedExpanded,
    openExpanded,
    isSearchMode
  );

  const [isTicketNavigatorOpen, setIsTicketNavigatorOpen] = useState(false);
  const [isCommentMode, setIsCommentMode] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteSessionModalOpen, setDeleteSessionModalOpen] = useState(false);
  const [isEditingSessionTitle, setIsEditingSessionTitle] = useState(false);
  const [sessionTitleDraft, setSessionTitleDraft] = useState("");
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
    };
    setCachedCounts(sessionId, seed);
    return seed;
  }, [
    sessionId,
    feedbackTotal,
    feedbackActiveCount,
    feedbackResolvedCount,
  ]);

  const applyCountTransition = useCallback(
    (previousStatus: "open" | "resolved", nextStatus: "open" | "resolved") => {
      if (!sessionId || previousStatus === nextStatus) return;
      ensureCountsSeeded();
      updateCachedCounts(sessionId, (current) => {
        const next = { ...current };
        if (previousStatus === "open") next.open = Math.max(0, next.open - 1);
        if (previousStatus === "resolved") next.resolved = Math.max(0, next.resolved - 1);

        if (nextStatus === "open") next.open += 1;
        if (nextStatus === "resolved") next.resolved += 1;
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
        workspaceId: session.workspaceId,
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
    if (!claimsReady || !authUid || !sessionId || !workspaceId) {
      setSession(null);
      return;
    }

    let cancelled = false;
    const sessionRef = doc(db, "sessions", sessionId);
    getDoc(sessionRef).then((sessionSnap) => {
      if (cancelled) return;
      if (!sessionSnap.exists()) {
        router.push("/dashboard");
        return;
      }
      const data = sessionSnap.data();
      const sw =
        typeof (data as { workspaceId?: string }).workspaceId === "string"
          ? (data as { workspaceId?: string }).workspaceId!.trim()
          : "";
      if (sw !== workspaceId) {
        router.push("/dashboard");
        return;
      }
      const raw = data as { accessLevel?: unknown };
      setSession({
        id: sessionSnap.id,
        ...(data as object),
        accessLevel: normalizeAccessLevel(raw.accessLevel),
      } as Session);
      const viewerId = getViewerId(authUid ?? "");
      if (viewerId) {
        recordSessionViewIfNew(sessionSnap.id, viewerId).catch((err) => {
          console.error("[ECHLY] recordSessionViewIfNew failed", err);
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [sessionId, authUid, authLoading, router, workspaceId, claimsReady]);

  // Deep link: when ?ticket= is present, select that ticket and open detail panel.
  const hasAppliedTicketParam = useRef(false);
  const deepLinkHydrateAttempted = useRef<string | null>(null);
  const deepLinkSidebarExpansionDone = useRef<string | null>(null);

  useEffect(() => {
    deepLinkHydrateAttempted.current = null;
    hasAppliedTicketParam.current = false;
    deepLinkSidebarExpansionDone.current = null;
  }, [sessionId, ticketIdFromUrl]);

  useEffect(() => {
    if (!ticketIdFromUrl || !feedbackSessionId) return;
    if (feedbackLoading) return;
    if (feedback.some((f) => f.id === ticketIdFromUrl)) return;
    if (deepLinkHydrateAttempted.current === ticketIdFromUrl) return;
    deepLinkHydrateAttempted.current = ticketIdFromUrl;

    let cancelled = false;
    void (async () => {
      try {
        const res = await authFetch(`/api/tickets/${ticketIdFromUrl}`);
        if (!res) return;
        const data = (await res.json()) as {
          success?: boolean;
          ticket?: TicketFromApi & { sessionId?: string; status?: string; createdAt?: string | null };
        };
        if (cancelled || !data.success || !data.ticket) return;
        const t = data.ticket;
        if (t.sessionId && t.sessionId !== sessionId) return;
        const isResolved =
          t.isResolved === true || t.status === "resolved";
        if (isResolved) {
          setResolvedExpanded(true);
          setOpenExpanded(false);
        }
        setFeedback((prev) => {
          if (prev.some((f) => f.id === ticketIdFromUrl)) return prev;
          return [...prev, t as unknown as Feedback];
        });
      } catch (err) {
        console.error("[ECHLY] deep link ticket hydrate failed", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    ticketIdFromUrl,
    feedbackSessionId,
    sessionId,
    feedbackLoading,
    feedback,
    setFeedback,
  ]);

  useEffect(() => {
    if (!ticketIdFromUrl || feedback.length === 0 || hasAppliedTicketParam.current) return;
    const exists = feedback.some((f) => f.id === ticketIdFromUrl);
    if (exists) {
      hasAppliedTicketParam.current = true;
      setSelectedId(ticketIdFromUrl);
    }
  }, [ticketIdFromUrl, feedback]);

  // Deep link: expand the sidebar section that contains ?ticket= (once per ticket id; controlled sections).
  useEffect(() => {
    if (!ticketIdFromUrl) return;
    if (deepLinkSidebarExpansionDone.current === ticketIdFromUrl) return;
    const ticket = feedback.find((f) => f.id === ticketIdFromUrl);
    if (!ticket) return;
    deepLinkSidebarExpansionDone.current = ticketIdFromUrl;
    if (getTicketStatus(ticket) === "resolved") {
      setResolvedExpanded(true);
      setOpenExpanded(false);
    } else {
      setOpenExpanded(true);
      setResolvedExpanded(false);
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

  /* ================= SELECTED ITEM (derived from feedback list) ================= */

  const selectedIndex = canonicalFeedback.findIndex((f) => f.id === selectedId);

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

  const contextualPosition = useMemo(() => {
    if (!selectedId) return { index: 0, total: -1 };

    const openIndex = openFeedback.findIndex((ticket) => ticket.id === selectedId);
    if (openIndex >= 0) {
      return {
        index: openIndex + 1,
        total: feedbackCountsLoading ? -1 : Math.max(0, feedbackActiveCount),
      };
    }

    const resolvedIndex = resolvedFeedback.findIndex((ticket) => ticket.id === selectedId);
    if (resolvedIndex >= 0) {
      return {
        index: resolvedIndex + 1,
        total: feedbackCountsLoading ? -1 : Math.max(0, feedbackResolvedCount),
      };
    }

    // Fallback: selected ticket not present in filtered subsets; use canonical/global position.
    const globalIndex = canonicalFeedback.findIndex((ticket) => ticket.id === selectedId);
    if (globalIndex >= 0) {
      return {
        index: globalIndex + 1,
        total: feedbackCountsLoading ? -1 : Math.max(0, feedbackTotal),
      };
    }

    return { index: 0, total: -1 };
  }, [
    selectedId,
    openFeedback,
    resolvedFeedback,
    canonicalFeedback,
    feedbackCountsLoading,
    feedbackTotal,
    feedbackActiveCount,
    feedbackResolvedCount,
  ]);

  const selectedItem = useMemo(() => {
    const ticket = canonicalFeedback.find((t) => t.id === selectedId) ?? null;
    if (!ticket) return null;
    return {
      ...ticket,
      index: Math.max(0, contextualPosition.index),
      total: contextualPosition.total >= 0 ? Math.max(0, contextualPosition.total) : -1,
    };
  }, [canonicalFeedback, selectedId, contextualPosition.index, contextualPosition.total]);

  const sessionActionCaps = useMemo(() => {
    if (!authUid || !session) {
      return { canComment: false, canResolve: false };
    }
    const effective = getEffectiveAccessLevel({
      session,
      viewerWorkspaceId: workspaceId,
      invitedPermission: null,
    });
    return {
      canComment: hasPermission(effective, "comment"),
      canResolve: hasPermission(effective, "resolve"),
    };
  }, [authUid, session, workspaceId]);

  useEffect(() => {
    if (!sessionActionCaps.canComment && isCommentMode) {
      setIsCommentMode(false);
    }
  }, [sessionActionCaps.canComment, isCommentMode]);

  const handleSessionRenameFromMenu = useCallback(
    (updated: { id: string; title: string; updatedAt?: unknown }) => {
      if (updated.id !== sessionId) return;
      setSession((prev) =>
        prev
          ? {
              ...prev,
              title: updated.title,
              updatedAt: updated.updatedAt as Session["updatedAt"],
            }
          : prev
      );
      setSessionTitleDraft(updated.title);
    },
    [sessionId]
  );

  const handleSetSessionArchivedFromMenu = useCallback(
    async (id: string, archived: boolean) => {
      if (id !== sessionId) return;
      const snapshot = session;
      if (snapshot) {
        setSession({ ...snapshot, archived, isArchived: archived });
      }
      try {
        const res = await authFetch(`/api/sessions/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ archived, isArchived: archived }),
        });
        if (!res) return;
        if (!res.ok) {
          const errBody = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(errBody?.error ?? "Archive failed");
        }
        if (archived) {
          router.push("/dashboard");
        }
      } catch (err) {
        console.error("[ECHLY] Session archive from menu failed", err);
        if (snapshot) setSession(snapshot);
      }
    },
    [sessionId, session, router]
  );

  const handleRequestDeleteSessionFromMenu = useCallback((_s: Session) => {
    setDeleteSessionModalOpen(true);
  }, []);

  const confirmDeleteSessionFromMenu = useCallback(async () => {
    if (!sessionId) return;
    const res = await authFetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
    if (!res) return;
    const data = (await res.json()) as { success?: boolean; error?: string };
    if (!res.ok || !data?.success) {
      throw new Error(data?.error ?? "Delete failed");
    }
    router.push("/dashboard");
  }, [sessionId, router]);

  const {
    comments,
    loadingComments,
    sendReply,
    sendPinComment,
    sendTextComment,
    updatePinPosition,
    updateComment,
    deleteComment,
  } = useFeedbackDetailController({
    sessionId,
    feedbackId: selectedId,
    canComment: sessionActionCaps.canComment,
    canResolve: sessionActionCaps.canResolve,
  });

  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  /** Pin whose inline thread popover is open (does not open right panel). */
  const [activePinIdForPopover, setActivePinIdForPopover] = useState<string | null>(null);

  /* ================= SAVE TITLE (optimistic update, then PATCH) ================= */

  const saveTitle = async (newTitle: string): Promise<void> => {
    if (!sessionActionCaps.canResolve || !selectedId || newTitle.trim() === "") return;
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
      if (!res) return;
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
    if (!sessionActionCaps.canResolve || !selectedId) return;
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
      if (!res) return;
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
    if (!sessionActionCaps.canResolve || !selectedId) return;
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
      if (!res) return;
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
    if (!sessionActionCaps.canResolve || !selectedId) return;
    const previousStatus = selectedItem ? getTicketStatus(selectedItem) : "open";
    const nextStatus = isResolved ? "resolved" : "open";
    const previousResolved = Boolean(selectedItem?.isResolved);
    const previousCounts = sessionId ? getCachedCounts(sessionId) : null;

    setFeedback((prev) =>
      prev.map((item) =>
        item.id === selectedId ? { ...item, isResolved } : item
      )
    );
    applyCountTransition(previousStatus, nextStatus);
    try {
      const res = await authFetch(`/api/tickets/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isResolved }),
      });
      if (!res) {
        setFeedback((prev) =>
          prev.map((item) =>
            item.id === selectedId
              ? { ...item, isResolved: previousResolved }
              : item
          )
        );
        if (sessionId && previousCounts) {
          setCachedCounts(sessionId, previousCounts);
        }
        return;
      }
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
            ? { ...item, isResolved: previousResolved }
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
    }
  };

  const handleSessionTitleBlur = useCallback(async () => {
    if (!sessionId || !session) return;
    const trimmed = sessionTitleDraft.trim();
    const prevDisplay = (session.title ?? "").trim() || "Untitled Session";
    const safeTitle = trimmed.length > 0 ? trimmed : "Untitled Session";
    if (safeTitle === prevDisplay) {
      setIsEditingSessionTitle(false);
      setSessionTitleDraft(prevDisplay);
      return;
    }
    const previousTitle = session.title ?? "";
    setSession((prev: Session | null) =>
      prev ? ({ ...prev, title: safeTitle } as Session) : prev
    );
    setSessionTitleDraft(safeTitle);
    setIsEditingSessionTitle(false);
    setSaveSessionTitleSuccess(true);
    setTimeout(() => setSaveSessionTitleSuccess(false), 1200);
    try {
      const res = await authFetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: safeTitle }),
      });
      if (!res) return;
      const data = (await res.json()) as {
        success?: boolean;
        session?: Record<string, unknown>;
      };
      if (data.success && data.session) {
        setSession((prev: Session | null) =>
          prev ? ({ ...prev, ...data.session } as Session) : prev
        );
        const apiTitle = ((data.session.title as string) ?? safeTitle).trim() || "Untitled Session";
        setSessionTitleDraft(apiTitle);
        if (typeof window !== "undefined" && "chrome" in window) {
          try {
            (window as Window & { chrome?: { runtime?: { sendMessage?: (msg: unknown) => void } } }).chrome?.runtime?.sendMessage?.({
              type: "ECHLY_SESSION_UPDATED",
              sessionId,
              title: apiTitle,
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
      setSessionTitleDraft((previousTitle || "").trim() || "Untitled Session");
    }
  }, [sessionId, session, sessionTitleDraft]);

  const handleMarkAllResolved = useCallback(async () => {
    if (!sessionActionCaps.canResolve) return;
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
      const results = await Promise.all(
        active.map((item) =>
          authFetch(`/api/tickets/${item.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isResolved: true }),
            timeout: 60000,
          })
        )
      );
      if (results.some((r) => r == null)) {
        setFeedback(previousFeedback);
        if (sessionId && previousCounts) {
          setCachedCounts(sessionId, previousCounts);
        }
        return;
      }
    } catch (err) {
      warn("Mark all resolved failed:", err);
      setFeedback(previousFeedback);
      if (sessionId && previousCounts) {
        setCachedCounts(sessionId, previousCounts);
      }
      return;
    }
  }, [feedback, sessionId, setFeedback, ensureCountsSeeded, sessionActionCaps.canResolve]);

  const handleMarkAllUnresolved = useCallback(async () => {
    if (!sessionActionCaps.canResolve) return;
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
      const results = await Promise.all(
        resolved.map((item) =>
          authFetch(`/api/tickets/${item.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isResolved: false }),
            timeout: 60000,
          })
        )
      );
      if (results.some((r) => r == null)) {
        setFeedback(previousFeedback);
        if (sessionId && previousCounts) {
          setCachedCounts(sessionId, previousCounts);
        }
        return;
      }
    } catch (err) {
      warn("Mark all unresolved failed:", err);
      setFeedback(previousFeedback);
      if (sessionId && previousCounts) {
        setCachedCounts(sessionId, previousCounts);
      }
      return;
    }
  }, [feedback, sessionId, setFeedback, ensureCountsSeeded, sessionActionCaps.canResolve]);

  const handleDeleteFeedback = async (id: string) => {
    if (!sessionActionCaps.canResolve) return;
    const deletedItem = feedback.find((f) => f.id === id);
    const deletedStatus = deletedItem ? getTicketStatus(deletedItem) : "open";
    const prevFeedback = feedback;
    const prevCounts = sessionId ? getCachedCounts(sessionId) : null;
    const nextSelected =
      selectedId === id
        ? feedback.filter((item) => item.id !== id)[0]?.id ?? null
        : selectedId;
    setFeedback((prev) => prev.filter((item) => item.id !== id));
    ensureCountsSeeded();
    updateCachedCounts(sessionId, (c) => {
      const next = { ...c, total: Math.max(0, c.total - 1) };
      if (deletedStatus === "open") next.open = Math.max(0, next.open - 1);
      if (deletedStatus === "resolved") next.resolved = Math.max(0, next.resolved - 1);
      return next;
    });
    setSelectedId(nextSelected);
    setShowDeleteModal(false);
    try {
      const res = await authFetch(`/api/tickets/${id}`, { method: "DELETE" });
      if (!res) return;
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
        canComment={sessionActionCaps.canComment}
        canResolve={sessionActionCaps.canResolve}
        impactScore={(selectedItem as { impactScore?: number } | null)?.impactScore}
        comments={comments}
        sendPinComment={sessionActionCaps.canComment ? sendPinComment ?? undefined : undefined}
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
        sendTextComment={
          sessionActionCaps.canComment ? sendTextComment ?? undefined : undefined
        }
        onCommentPlaced={() => setIsCommentMode(false)}
        updatePinPosition={sessionActionCaps.canComment ? updatePinPosition ?? undefined : undefined}
        onDelete={
          sessionActionCaps.canResolve ? () => setShowDeleteModal(true) : undefined
        }
      />
    );
  };

  return (
    <>
      <div className="flex h-full min-h-0 overflow-hidden">
        <aside className="sidebar hidden lg:flex w-[300px] h-screen overflow-hidden shrink-0 self-start min-h-0 flex-col sticky top-0">
          <TicketList
            sessionTitle={(session?.title ?? "").trim() || "Untitled Session"}
            counts={{
              total: feedbackTotal,
              open: feedbackActiveCount,
              resolved: feedbackResolvedCount,
            }}
            countsLoading={feedbackCountsLoading}
            isEditingSessionTitle={isEditingSessionTitle}
            sessionTitleDraft={sessionTitleDraft}
            onSessionTitleChange={setSessionTitleDraft}
            onSessionTitleSave={handleSessionTitleBlur}
            onSessionTitleCancel={() => {
              setIsEditingSessionTitle(false);
              setSessionTitleDraft((session?.title ?? "").trim() || "Untitled Session");
            }}
            onSessionTitleEdit={() => {
              setSessionTitleDraft((session?.title ?? "").trim() || "Untitled Session");
              setIsEditingSessionTitle(true);
            }}
            saveSessionTitleSuccess={saveSessionTitleSuccess}
            items={feedback}
            selectedId={selectedId}
            onSelect={setSelectedId}
            newTicketId={newTicketId}
            loadingMore={isSearchMode ? false : feedbackLoadingMore}
            hasMore={isSearchMode ? false : hasMoreFeedback}
            hasReachedLimit={feedbackReachedLimit}
            loadMoreRef={feedbackLoadMoreRef}
            scrollContainerRef={listScrollRef}
            onScrollContainerReady={() => setListScrollReady((n) => n + 1)}
            onMarkAllTicketsResolved={
              sessionActionCaps.canResolve ? handleMarkAllResolved : undefined
            }
            onMarkAllTicketsUnresolved={
              sessionActionCaps.canResolve ? handleMarkAllUnresolved : undefined
            }
            scrollToId={ticketIdFromUrl}
            openExpanded={openExpanded}
            onOpenExpandedChange={onOpenExpandedChange}
            resolvedExpanded={resolvedExpanded}
            onResolvedExpandedChange={onResolvedExpandedChange}
            isLoadingResolved={isSearchMode ? false : feedbackLoadingResolved}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            isSearchMode={isSearchMode}
            searchResults={searchResults}
            searchLoading={searchLoading}
          />
        </aside>

        <div className="content-divider hidden lg:block shrink-0" aria-hidden />

        <div className="main-area flex min-h-0 min-w-0 flex-1 flex-col">
          <TopControlBar
            sessionId={sessionId}
            sessionTitle={session?.title}
            session={session}
            onSessionRenameSuccess={
              sessionActionCaps.canResolve ? handleSessionRenameFromMenu : undefined
            }
            onSetSessionArchived={
              sessionActionCaps.canResolve ? handleSetSessionArchivedFromMenu : undefined
            }
            onRequestDeleteSession={
              sessionActionCaps.canResolve ? handleRequestDeleteSessionFromMenu : undefined
            }
          />
          <div className="flex flex-1 min-h-0 min-w-0">
            <main className="surface-main flex-1 min-h-0 overflow-y-auto flex flex-col min-w-0">
              <div className="h-full flex flex-col min-w-0">
                <div className="z-20 shrink-0 flex items-center gap-2 px-4 py-3 lg:hidden bg-[var(--layer-1-bg)]">
                  <button
                    type="button"
                    onClick={() => setIsTicketNavigatorOpen(true)}
                    className="h-9 inline-flex items-center px-4 rounded-xl border border-[var(--layer-2-border)] bg-[var(--layer-1-bg)] text-[13px] font-medium text-[hsl(var(--text-secondary-soft))] hover:bg-[var(--layer-2-hover-bg)] hover:text-[hsl(var(--text-primary-strong))] transition-colors duration-200"
                  >
                    Tickets
                  </button>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
                  <div className="max-w-[1000px] mx-auto w-full px-6 py-6 flex-1 min-h-0 flex flex-col">
                    {renderExecutionContent()}
                  </div>
                </div>
              </div>
            </main>

            {/* Comment panel: only when a pin/thread is opened (Google Docs style). No permanent sidebar. */}
            <div
              className="shrink-0 flex flex-col min-h-0 bg-[var(--canvas-base)] shadow-[-8px_0_24px_-12px_rgba(15,23,42,0.12)] transition-[width] duration-200 ease-out overflow-hidden"
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
                  currentUserId={authUid}
                  updateComment={updateComment}
                  deleteComment={deleteComment}
                  canComment={sessionActionCaps.canComment}
                  canResolve={sessionActionCaps.canResolve}
                />
              )}
            </div>
          </div>
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
              sessionTitle={(session?.title ?? "").trim() || "Untitled Session"}
              counts={{
                total: feedbackTotal,
                open: feedbackActiveCount,
                resolved: feedbackResolvedCount,
              }}
              countsLoading={feedbackCountsLoading}
              isEditingSessionTitle={isEditingSessionTitle}
              sessionTitleDraft={sessionTitleDraft}
              onSessionTitleChange={setSessionTitleDraft}
              onSessionTitleSave={handleSessionTitleBlur}
              onSessionTitleCancel={() => {
                setIsEditingSessionTitle(false);
                setSessionTitleDraft((session?.title ?? "").trim() || "Untitled Session");
              }}
              onSessionTitleEdit={() => {
                setSessionTitleDraft((session?.title ?? "").trim() || "Untitled Session");
                setIsEditingSessionTitle(true);
              }}
              saveSessionTitleSuccess={saveSessionTitleSuccess}
              items={feedback}
              selectedId={selectedId}
              onSelect={(id) => {
                setSelectedId(id);
                setIsTicketNavigatorOpen(false);
              }}
              newTicketId={newTicketId}
              loadingMore={isSearchMode ? false : feedbackLoadingMore}
              hasMore={isSearchMode ? false : hasMoreFeedback}
              hasReachedLimit={feedbackReachedLimit}
              loadMoreRef={feedbackLoadMoreRef}
              scrollContainerRef={listScrollRef}
              onScrollContainerReady={() => setListScrollReady((n) => n + 1)}
              onMarkAllTicketsResolved={
                sessionActionCaps.canResolve ? handleMarkAllResolved : undefined
              }
              onMarkAllTicketsUnresolved={
                sessionActionCaps.canResolve ? handleMarkAllUnresolved : undefined
              }
              scrollToId={ticketIdFromUrl}
              openExpanded={openExpanded}
              onOpenExpandedChange={onOpenExpandedChange}
              resolvedExpanded={resolvedExpanded}
              onResolvedExpandedChange={onResolvedExpandedChange}
              isLoadingResolved={isSearchMode ? false : feedbackLoadingResolved}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              isSearchMode={isSearchMode}
              searchResults={searchResults}
              searchLoading={searchLoading}
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

      <DeleteSessionModal
        open={deleteSessionModalOpen}
        onClose={() => setDeleteSessionModalOpen(false)}
        sessionTitle={(session?.title ?? "").trim() || "Untitled Session"}
        onConfirm={confirmDeleteSessionFromMenu}
      />

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

