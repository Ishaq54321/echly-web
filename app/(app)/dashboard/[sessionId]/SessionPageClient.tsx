"use client";

import { authFetch, type AuthFetchInit } from "@/lib/authFetch";
import { clearShareToken, getActiveShareToken, setShareToken } from "@/lib/client/shareToken";
import {
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
  startTransition,
} from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { recordSessionViewIfNew } from "@/lib/sessions";
import { getViewerId } from "@/lib/viewerId";
import {
  assertIdentityResolved,
  useWorkspace,
} from "@/lib/client/workspaceContext";
import { useStableState } from "@/lib/client/perception/useStableState";
import { getScreenshotUrl } from "@/lib/client/screenshotResolver";
import { useScreenshotUrl } from "@/lib/client/useScreenshotUrl";
import { normalizeTicketStatus } from "@/lib/domain/normalizeTicketStatus";
import { useFeedbackDetailController } from "./hooks/useFeedbackDetailController";
import { useSessionFeedbackPaginated } from "./hooks/useSessionFeedbackPaginated";
import type { Feedback } from "@/lib/domain/feedback";
import { getTicketStatus } from "@/lib/domain/feedback";
import type { Session } from "@/lib/domain/session";
import type { AccessCapabilities } from "@/lib/access/resolveAccess";
import { requireAccessLevel } from "@/lib/domain/accessLevel";
import {
  handlePermissionError,
  notifyPermissionDenied,
  responseIsPermissionDenied,
} from "@/lib/client/permissionError";
import { safeResolveAction } from "@/lib/client/safeResolveAction";
import {
  getSessionDetailCache,
  setSessionDetailCache,
  invalidateSessionDetailCache,
} from "@/lib/client/sessionDetailCache";
import { warn } from "@/lib/utils/logger";
import { requireApiSuccessData } from "@/lib/api/apiEnvelope";
import {
  TicketList,
  ExecutionView,
  CommentPanel,
} from "@/components/layout/operating-system";
import { TopControlBar } from "@/components/ui/TopControlBar";
import { useToast } from "@/components/dashboard/context/ToastContext";
import { ImageViewer } from "@/components/ImageViewer";

const DeleteSessionModal = dynamic(
  () =>
    import("@/components/dashboard/DeleteSessionModal").then((m) => m.DeleteSessionModal),
  { ssr: false }
);

const RequestAccessModal = dynamic(
  () => import("@/components/RequestAccessModal").then((m) => m.RequestAccessModal),
  { ssr: false }
);

const RequestSessionAccessPage = dynamic(
  () =>
    import("@/components/session/RequestSessionAccessPage").then(
      (m) => m.RequestSessionAccessPage
    ),
  { ssr: false }
);

const PendingAccessBanner = dynamic(
  () =>
    import("@/components/session/PendingAccessBanner").then((m) => m.PendingAccessBanner),
  { ssr: false }
);
import { Modal } from "@/components/ui/Modal";

/** Session page: single GET for session + first feedback page. Set false to restore legacy `/api/sessions` + `/api/feedback` first page. */
const USE_BUNDLE = true;

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
  screenshotId?: string | null;
  [key: string]: unknown;
};

function preloadImage(src: string, preloaded: Set<string>) {
  if (!src || typeof window === "undefined") return;
  if (preloaded.has(src)) return;
  preloaded.add(src);
  const img = new window.Image();
  img.src = src;
}

async function authFetchOrAnonCookie(
  url: string,
  init?: AuthFetchInit
): Promise<Response> {
  const res = await authFetch(url, init);
  if (res != null) return res;
  const { timeout: _t, ...rest } = init ?? {};
  return fetch(url, {
    ...rest,
    credentials: "include",
    cache: "no-store",
  });
}

function sameStringArrayContent(
  a: string[] | null | undefined,
  b: string[] | null | undefined
): boolean {
  const aa = Array.isArray(a) ? a : [];
  const bb = Array.isArray(b) ? b : [];
  if (aa.length !== bb.length) return false;
  for (let i = 0; i < aa.length; i++) {
    if (aa[i] !== bb[i]) return false;
  }
  return true;
}

type SessionLoadedInfo = {
  sessionName: string | null;
  workspaceName: string | null;
  createdAt: string | null;
};

export default function SessionPageClient({
  sessionId,
  isPublicRoute = false,
  onSessionLoaded,
  onAccessBlocked,
}: {
  sessionId: string;
  isPublicRoute?: boolean;
  onSessionLoaded?: (info: SessionLoadedInfo) => void;
  onAccessBlocked?: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticketIdFromUrl = searchParams.get("ticket");

  const [session, setSession] = useState<Session | null>(null);
  /** General-access gate (restricted mode + anonymous): server returned access with canView false. */
  const [accessBlocked, setAccessBlocked] = useState(false);
  /** Set when GET /api/sessions/:id fails after auth is known (anonymous-friendly). */
  const [sessionFetchError, setSessionFetchError] = useState<
    null | "forbidden" | "not_found" | "error"
  >(null);
  /** Capability flags from GET /api/sessions/:id (getAccessContext); never inferred in the UI. */
  const [sessionAccess, setSessionAccess] = useState<AccessCapabilities | null>(null);
  const sessionLoaded = sessionAccess !== null || sessionFetchError !== null;
  const hasSessionCounts = session !== null;
  /** From GET /api/sessions/:id `data.request.pendingResolve` or successful POST /request-access. */
  const [pendingResolveRequest, setPendingResolveRequest] = useState(false);
  /** Status of the current user's access request when accessBlocked is true. */
  const [requestAccessStatus, setRequestAccessStatus] = useState<
    "idle" | "pending" | "submitted" | "already_requested" | "rejected"
  >("idle");
  /** Pending access request count shown as red dot on Share button. */
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  /** True when the current user belongs to the session's workspace (OWNER or WS-MEMBER). */
  const [isWorkspaceMember, setIsWorkspaceMember] = useState(false);
  /** First feedback page from GET /api/session-page-bundle when {@link USE_BUNDLE} is true. */
  const [bundledFirstFeedbackPage, setBundledFirstFeedbackPage] = useState<{
    feedback: Record<string, unknown>[];
    nextCursor?: string | null;
    hasMore?: boolean;
  } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  /** Tracks the newest ticket id for the highlight animation; cleared after animation ends. */
  const [newTicketId, setNewTicketId] = useState<string | null>(null);

  const sessionRef = useRef<Session | null>(null);
  sessionRef.current = session;

  const sessionAccessRef = useRef<AccessCapabilities | null>(null);
  sessionAccessRef.current = sessionAccess;

  const requestResolveAccessInFlightRef = useRef(false);

  /** Per-session latch: invite redemption runs at most once per visit (not on every access refetch). */
  const inviteActivationLatchRef = useRef<string | null>(null);
  /** Invalidates in-flight load work when the effect re-runs (e.g. React Strict Mode). */
  const sessionLoadEffectNonceRef = useRef(0);

  const { authUid, isIdentityResolved, authReady, workspaceName, authEmail } = useWorkspace();
  const authUidRef = useRef<string | null>(null);
  useEffect(() => {
    authUidRef.current = authUid;
  }, [authUid]);
  const { showToast } = useToast();

  const handleRequestResolveAccess = useCallback(async () => {
    const sid = sessionId?.trim();
    if (!sid || !authUid?.trim()) return;
    if (sessionAccessRef.current?.canResolve === true) return;
    if (pendingResolveRequest) return;
    if (requestResolveAccessInFlightRef.current) return;
    requestResolveAccessInFlightRef.current = true;
    try {
      const res = await authFetch(`/api/sessions/${encodeURIComponent(sid)}/request-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access: "resolve" }),
      });
      const raw = (await res?.json().catch(() => ({}))) as {
        success?: boolean;
        data?: { type?: string };
      };
      if (res?.ok && raw.success) {
        const t = raw.data?.type;
        if (t === "request_created" || t === "already_requested") {
          setPendingResolveRequest(true);
          return;
        }
      }
      showToast("Could not submit access request");
    } catch {
      showToast("Could not submit access request");
    } finally {
      requestResolveAccessInFlightRef.current = false;
    }
  }, [sessionId, authUid, pendingResolveRequest, showToast]);

  const handleRequestSessionAccess = useCallback(async () => {
    const sid = sessionId?.trim();
    if (!sid || !authUid?.trim()) return;
    setRequestAccessStatus("pending");
    try {
      const res = await authFetch(`/api/sessions/${encodeURIComponent(sid)}/request-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access: "view" }),
      });
      const raw = (await res?.json().catch(() => ({}))) as {
        success?: boolean;
        data?: { type?: string };
      };
      if (res?.ok && raw.success) {
        const t = raw.data?.type;
        if (t === "request_created") {
          setRequestAccessStatus("submitted");
          return;
        }
        if (t === "already_requested") {
          setRequestAccessStatus("already_requested");
          return;
        }
      }
      setRequestAccessStatus("idle");
      showToast("Could not submit access request");
    } catch {
      setRequestAccessStatus("idle");
      showToast("Could not submit access request");
    }
  }, [sessionId, authUid, showToast]);

  const [requestAccessModalOpen, setRequestAccessModalOpen] = useState(false);
  const [requestAccessSubmitting, setRequestAccessSubmitting] = useState(false);

  const openRequestAccessModal = useCallback(() => {
    setRequestAccessModalOpen(true);
  }, []);

  const confirmRequestResolveAccess = useCallback(async () => {
    setRequestAccessSubmitting(true);
    try {
      await handleRequestResolveAccess();
    } finally {
      setRequestAccessSubmitting(false);
      setRequestAccessModalOpen(false);
    }
  }, [handleRequestResolveAccess]);

  const feedbackSessionId = sessionId || undefined;

  const shareTokenFromUrl =
    searchParams.get("token")?.trim() ||
    searchParams.get("shareToken")?.trim() ||
    "";
  const searchParamsSignature = searchParams.toString();
  /**
   * Effective share token for optional-auth APIs. Must match {@link getActiveShareToken}:
   * signed-in requests only send Firebase Bearer, so restricted share links need `?token=` on the URL.
   */
  const shareTokenForApi =
    typeof window !== "undefined"
      ? getActiveShareToken()?.trim() ?? ""
      : shareTokenFromUrl;
  const shareTokenForApiRef = useRef(shareTokenForApi);
  shareTokenForApiRef.current = shareTokenForApi;
  const isAnonymousViewer = authReady && !authUid;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token") || params.get("shareToken");
    if (token) {
      setShareToken(token);
    } else {
      clearShareToken();
    }
  }, [searchParamsSignature]);

  const restFeedbackFetch = useCallback((url: string) => authFetchOrAnonCookie(url), []);

  const listScrollRef = useRef<HTMLDivElement | null>(null);
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
    setAccessBlocked(false);
    setBundledFirstFeedbackPage(null);
  }, [sessionId]);

  useEffect(() => {
    inviteActivationLatchRef.current = null;
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
          const sp = new URLSearchParams({
            sessionId: feedbackSessionId,
            query: q,
          });
          if (shareTokenForApiRef.current !== "") {
            sp.set("token", shareTokenForApiRef.current);
          }
          const url = `/api/feedback/search?${sp.toString()}`;
          const res = await authFetchOrAnonCookie(url);
          if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
              if (!cancelled) setSearchResults([]);
              return;
            }
            throw new Error(`search ${res.status}`);
          }
          const inner = requireApiSuccessData<{ feedback: Feedback[] }>(await res.json());
          if (cancelled) return;
          if (!Array.isArray(inner.feedback)) {
            throw new Error("Invalid API response: feedback must be an array");
          }
          setSearchResults(inner.feedback);
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
  }, [searchQuery, feedbackSessionId, shareTokenForApi]);

  /** In-flight action steps per ticket — merged onto list updates to avoid flicker. */
  const pendingOptimisticActionStepsRef = useRef(
    new Map<string, { steps: string[] | null }>()
  );
  /** Monotonic save generation per ticket; stale PATCH responses must not overwrite UI. */
  const actionStepsSaveLatestGenRef = useRef(new Map<string, number>());
  const mergeRealtimeFeedbackListRef = useRef<
    ((list: Feedback[]) => Feedback[]) | null
  >(null);

  const mergeRealtimeFeedbackList = useCallback((incoming: Feedback[]) => {
    const pending = pendingOptimisticActionStepsRef.current;
    if (pending.size === 0) return incoming;
    return incoming.map((item) => {
      const row = pending.get(item.id);
      if (!row) return item;
      return { ...item, actionSteps: row.steps };
    });
  }, []);

  mergeRealtimeFeedbackListRef.current = mergeRealtimeFeedbackList;

  useLayoutEffect(() => {
    pendingOptimisticActionStepsRef.current.clear();
    actionStepsSaveLatestGenRef.current.clear();
  }, [sessionId]);

  useLayoutEffect(() => {
    setResolveOptimistic(null);
  }, [sessionId]);

  const sessionRestTotal =
    session == null
      ? -1
      : Math.max(
          0,
          typeof session.totalCount === "number"
            ? session.totalCount
            : typeof session.feedbackCount === "number"
              ? session.feedbackCount
              : 0
        );
  const sessionRestOpen =
    session == null ? -1 : Math.max(0, typeof session.openCount === "number" ? session.openCount : 0);
  const sessionRestResolved =
    session == null ? -1 : Math.max(0, typeof session.resolvedCount === "number" ? session.resolvedCount : 0);

  const feedbackHookOptions = useMemo(
    () => ({
      mergeRealtimeListRef: mergeRealtimeFeedbackListRef,
      enabled: authReady,
      shareToken: shareTokenForApi || null,
      restSessionCounts:
        session != null
          ? { total: sessionRestTotal, open: sessionRestOpen, resolved: sessionRestResolved }
          : null,
      restFetch: restFeedbackFetch,
      awaitBundledFirstFeedback: USE_BUNDLE,
      bundledFirstFeedbackPage: USE_BUNDLE ? bundledFirstFeedbackPage : null,
    }),
    [
      authReady,
      shareTokenForApi,
      restFeedbackFetch,
      session?.id ?? "",
      sessionRestTotal,
      sessionRestOpen,
      sessionRestResolved,
      bundledFirstFeedbackPage,
    ]
  );

  const {
    feedback,
    setFeedback,
    total: feedbackTotal,
    activeCount: feedbackActiveCount,
    resolvedCount: feedbackResolvedCount,
    countsLoading: feedbackCountsLoading,
    loading: feedbackLoading,
    isCountsSynced,
    hasMore: hasMoreFeedback,
    hasReachedLimit: feedbackReachedLimit,
    loadingMore: feedbackLoadingMore,
    isLoadingResolved: feedbackLoadingResolved,
    loadMoreRef: feedbackLoadMoreRef,
    setCountsDelta: setSessionCountsDelta,
  } = useSessionFeedbackPaginated(feedbackSessionId, feedbackHookOptions);

  const feedbackRef = useRef(feedback);
  feedbackRef.current = feedback;

  const deepLinkTicketInList =
    Boolean(ticketIdFromUrl) && feedback.some((f) => f.id === ticketIdFromUrl);

  const deepLinkTicketBucket: "" | "open" | "resolved" = (() => {
    if (!ticketIdFromUrl) return "";
    const t = feedback.find((f) => f.id === ticketIdFromUrl);
    if (!t) return "";
    return getTicketStatus(t) === "resolved" ? "resolved" : "open";
  })();

  const feedbackScoped = useMemo(
    () => feedback.filter((f) => f.sessionId === sessionId),
    [feedback, sessionId]
  );

  /** Instant resolve UI: overlays `isResolved` until list state catches up (see `saveResolved`). */
  const [resolveOptimistic, setResolveOptimistic] = useState<{
    ticketId: string;
    isResolved: boolean;
  } | null>(null);
  const [resolveAffirmationKey, setResolveAffirmationKey] = useState(0);

  const feedbackScopedVisual = useMemo(() => {
    if (!resolveOptimistic) return feedbackScoped;
    return feedbackScoped.map((item) =>
      item.id === resolveOptimistic.ticketId
        ? { ...item, isResolved: resolveOptimistic.isResolved }
        : item
    );
  }, [feedbackScoped, resolveOptimistic]);

  const stableScopedFeedback = useStableState(feedbackScopedVisual, !feedbackLoading, sessionId);
  const stableOpenFeedback = useMemo(
    () =>
      stableScopedFeedback.filter(
        (item) => normalizeTicketStatus(getTicketStatus(item)) === "open"
      ),
    [stableScopedFeedback]
  );
  const stableResolvedFeedback = useMemo(
    () =>
      stableScopedFeedback.filter(
        (item) => normalizeTicketStatus(getTicketStatus(item)) === "resolved"
      ),
    [stableScopedFeedback]
  );
  const stableCanonicalFeedback = stableScopedFeedback;

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const legacyScreenshotUrlKey = `screenshot${"Url"}`;
    const foundLegacyUrl = stableScopedFeedback.find((item) => {
      const row = item as unknown as Record<string, unknown>;
      const raw = row[legacyScreenshotUrlKey];
      return typeof raw === "string" && raw.trim() !== "";
    });
    if (!foundLegacyUrl) return;
    console.error(
      "[ARCHITECTURE VIOLATION] Legacy screenshot URL field detected in UI payload. Use screenshotId + useScreenshotUrl resolver path only.",
      { feedbackId: foundLegacyUrl.id }
    );
  }, [stableScopedFeedback]);

  const prevSessionIdForSelectionRef = useRef(sessionId);
  if (prevSessionIdForSelectionRef.current !== sessionId) {
    prevSessionIdForSelectionRef.current = sessionId;
    setSelectedId(null);
  }

  const effectiveSelectedId = useMemo(() => {
    const url = ticketIdFromUrl;
    if (url) {
      const urlHit = stableScopedFeedback.find((f) => f.id === url);
      if (urlHit) return url;
    }
    if (selectedId) {
      const selHit = stableScopedFeedback.find((f) => f.id === selectedId);
      if (selHit) return selectedId;
    }
    if (stableScopedFeedback.length > 0) {
      return stableScopedFeedback[0]!.id;
    }
    return null;
  }, [ticketIdFromUrl, stableScopedFeedback, selectedId, sessionId]);

  if (stableScopedFeedback.length > 0 && selectedId === null) {
    const url = ticketIdFromUrl;
    if (url && stableScopedFeedback.some((f) => f.id === url)) {
      setSelectedId(url);
    } else {
      const firstOpen = stableScopedFeedback.find(
        (f) => f.status !== "resolved" && f.status !== "processing"
      );
      setSelectedId((firstOpen ?? stableScopedFeedback[0]!).id);
    }
  }

  const [isTicketNavigatorOpen, setIsTicketNavigatorOpen] = useState(false);
  const [isCommentMode, setIsCommentMode] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteSessionModalOpen, setDeleteSessionModalOpen] = useState(false);
  const [isEditingSessionTitle, setIsEditingSessionTitle] = useState(false);
  const [sessionTitleDraft, setSessionTitleDraft] = useState("");
  const [saveSessionTitleSuccess, setSaveSessionTitleSuccess] = useState(false);

  const preloadedScreenshotUrlsRef = useRef<Set<string>>(new Set());

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
  }, [sessionId, session != null]);

  const sessionWorkspaceIdRef = useRef<string | undefined>(undefined);
  sessionWorkspaceIdRef.current = session?.workspaceId;

  /* Local-first: insert ticket immediately when extension creates feedback (no refetch). */
  useEffect(() => {
    if (!sessionId) return;
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{
        ticket: { id: string; title: string; instruction?: string; description?: string; type?: string };
        sessionId: string;
      }>;
      const { ticket, sessionId: evSessionId } = ev.detail ?? {};
      if (evSessionId !== sessionId || !ticket) return;
      const workspaceId = sessionWorkspaceIdRef.current;
      if (workspaceId == null) return;
      const newItem: Feedback = {
        id: ticket.id,
        sessionId: evSessionId,
        workspaceId,
        title: ticket.title,
        instruction: ticket.instruction ?? ticket.description,
        description: ticket.description ?? ticket.instruction,
        type: ticket.type ?? "Feedback",
        isResolved: false,
        createdAt: null,
        clientTimestamp: Date.now(),
        screenshotId: null,
        screenshotStatus: null,
      };
      setFeedback((prev) => [newItem, ...prev.filter((x) => x.id !== newItem.id)]);
      setSelectedId(ticket.id);
      setNewTicketId(ticket.id);
    };
    window.addEventListener("ECHLY_FEEDBACK_CREATED", handler);
    return () => window.removeEventListener("ECHLY_FEEDBACK_CREATED", handler);
  }, [sessionId, session?.workspaceId ?? "", setFeedback]);

  /* ================= LOAD SESSION (optional auth; getAccessContext on server) ================= */
  useEffect(() => {
    if (!authReady) return;
    if (!sessionId) {
      setSession(null);
      setSessionAccess(null);
      setIsWorkspaceMember(false);
      setSessionFetchError(null);
      setAccessBlocked(false);
      setPendingResolveRequest(false);
      setBundledFirstFeedbackPage(null);
      return;
    }

    const effectNonce = ++sessionLoadEffectNonceRef.current;
    let cancelled = false;
    void (async () => {
      setAccessBlocked(false);
      if (authUidRef.current?.trim()) {
        const sid = sessionId.trim();
        if (inviteActivationLatchRef.current !== sid) {
          inviteActivationLatchRef.current = sid;
          void authFetch(`/api/invite/activate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId: sid }),
          }).catch(() => {});
        }
      }
      if (cancelled || effectNonce !== sessionLoadEffectNonceRef.current) return;
      const tok = shareTokenForApiRef.current;
      const qs = tok !== "" ? `?token=${encodeURIComponent(tok)}` : "";

      if (USE_BUNDLE) {
        // PERF R-006: check in-memory cache before issuing a network request —
        // avoids 2 Firestore reads on every back-navigation to the same session.
        const cached = getSessionDetailCache(sessionId.trim());
        if (cached) {
          setSession(cached.session);
          setSessionAccess(cached.sessionAccess);
          setPendingResolveRequest(cached.pendingResolveRequest);
          setBundledFirstFeedbackPage(cached.bundledFirstFeedbackPage);
          setSessionFetchError(null);
          setAccessBlocked(false);
          return;
        }

        const bundleSp = new URLSearchParams({ sessionId: sessionId.trim() });
        if (tok !== "") bundleSp.set("token", tok);
        const bundleUrl = `/api/session-page-bundle?${bundleSp.toString()}`;
        const res = await authFetchOrAnonCookie(bundleUrl);
        if (cancelled || effectNonce !== sessionLoadEffectNonceRef.current) return;
        const body = await res.json().catch(() => null);
        if (cancelled || effectNonce !== sessionLoadEffectNonceRef.current) return;
        if (body === null || typeof body !== "object") {
          setBundledFirstFeedbackPage(null);
          setSessionFetchError("error");
          return;
        }
        const accessRoot = body as {
          access?: { capabilities?: Partial<AccessCapabilities>; isWorkspaceMember?: boolean };
        };
        if (res.status === 403) {
          setBundledFirstFeedbackPage(null);
          const errorBody = body as {
            data?: {
              access?: { capabilities?: Partial<AccessCapabilities> };
              accessRequestStatus?: string | null;
            };
          };
          const cap =
            errorBody.data?.access?.capabilities ??
            (accessRoot.access?.capabilities as Partial<AccessCapabilities> | undefined);
          if (cap && cap.canView === false) {
            setAccessBlocked(true);
            onAccessBlocked?.();
            setSession(null);
            setSessionFetchError(null);
            setPendingResolveRequest(false);
            setSessionAccess({
              canView: false,
              canComment: cap.canComment === true,
              canResolve: cap.canResolve === true,
              canAssign: cap.canAssign === true,
              canDeleteOwnComment: cap.canDeleteOwnComment !== false,
              canDeleteTicket: cap.canDeleteTicket === true,
            });
            const arStatus = errorBody.data?.accessRequestStatus;
            if (arStatus === "rejected") {
              setRequestAccessStatus("rejected");
            } else if (arStatus === "pending") {
              setRequestAccessStatus("already_requested");
            } else {
              setRequestAccessStatus("idle");
            }
            return;
          }
          setAccessBlocked(false);
          setSession(null);
          setSessionAccess(null);
          setPendingResolveRequest(false);
          setSessionFetchError("forbidden");
          return;
        }
        if (res.status === 404) {
          setBundledFirstFeedbackPage(null);
          setAccessBlocked(false);
          setSession(null);
          setSessionAccess(null);
          setPendingResolveRequest(false);
          setSessionFetchError("not_found");
          return;
        }
        if (!res.ok) {
          setBundledFirstFeedbackPage(null);
          setAccessBlocked(false);
          setSession(null);
          setSessionAccess(null);
          setPendingResolveRequest(false);
          setSessionFetchError("error");
          return;
        }
        let sessionPayload: Record<string, unknown>;
        let requestPayload: { pendingResolve?: boolean } | undefined;
        let bundleFeedbackRows: Record<string, unknown>[] = [];
        let bundleNextCursor: string | null = null;
        let bundleHasMore = false;
        let bundleCapabilities: Partial<AccessCapabilities> | undefined;
        let bundleIsWorkspaceMember = false;
        let bundlePendingAccessRequestsCount = 0;
        try {
          const inner = requireApiSuccessData<{
            session: Record<string, unknown>;
            feedback: unknown[];
            nextCursor?: string | null;
            hasMore?: boolean;
            request?: { pendingResolve?: boolean };
            access?: { capabilities?: Partial<AccessCapabilities>; isWorkspaceMember?: boolean };
            pendingAccessRequestsCount?: number;
          }>(body);
          sessionPayload = inner.session;
          requestPayload = inner.request;
          bundleCapabilities = inner.access?.capabilities;
          bundleIsWorkspaceMember = inner.access?.isWorkspaceMember === true;
          bundleFeedbackRows = Array.isArray(inner.feedback)
            ? (inner.feedback as Record<string, unknown>[])
            : [];
          bundleNextCursor =
            typeof inner.nextCursor === "string" || inner.nextCursor === null
              ? inner.nextCursor
              : null;
          bundleHasMore = inner.hasMore === true;
          bundlePendingAccessRequestsCount = typeof inner.pendingAccessRequestsCount === "number" ? inner.pendingAccessRequestsCount : 0;
        } catch {
          setBundledFirstFeedbackPage(null);
          setAccessBlocked(false);
          setSession(null);
          setSessionAccess(null);
          setPendingResolveRequest(false);
          setSessionFetchError("error");
          return;
        }
        if (!sessionPayload) {
          setBundledFirstFeedbackPage(null);
          setAccessBlocked(false);
          setSession(null);
          setSessionAccess(null);
          setPendingResolveRequest(false);
          setSessionFetchError("error");
          return;
        }
        setSessionFetchError(null);
        const raw = sessionPayload as { accessLevel?: unknown };
        const assembledSession = {
          id: sessionId,
          ...(sessionPayload as object),
          accessLevel: requireAccessLevel(raw.accessLevel),
        } as Session;
        setSession(assembledSession);
        onSessionLoaded?.({
          sessionName: typeof assembledSession.title === "string" ? assembledSession.title : null,
          workspaceName: workspaceName ?? null,
          createdAt: typeof (assembledSession as { createdAt?: unknown }).createdAt === "string"
            ? (assembledSession as { createdAt: string }).createdAt
            : null,
        });
        const cap = accessRoot.access?.capabilities ?? bundleCapabilities;
        const assembledAccess: AccessCapabilities | null = cap
          ? {
              canView: cap.canView !== false,
              canComment: cap.canComment === true,
              canResolve: cap.canResolve === true,
              canAssign: cap.canAssign === true,
              canDeleteOwnComment: cap.canDeleteOwnComment !== false,
              canDeleteTicket: cap.canDeleteTicket === true,
            }
          : null;
        setSessionAccess(assembledAccess);
        setIsWorkspaceMember(accessRoot.access?.isWorkspaceMember === true || bundleIsWorkspaceMember);
        const assembledPendingResolve =
          requestPayload !== undefined && requestPayload.pendingResolve === true;
        setPendingResolveRequest(assembledPendingResolve);
        const assembledFeedbackPage = {
          feedback: bundleFeedbackRows,
          nextCursor: bundleNextCursor,
          hasMore: bundleHasMore,
        };
        setBundledFirstFeedbackPage(assembledFeedbackPage);
        // PERF R-006: store in cache so back-navigation skips the network round-trip
        setSessionDetailCache(sessionId.trim(), {
          session: assembledSession,
          sessionAccess: assembledAccess,
          pendingResolveRequest: assembledPendingResolve,
          bundledFirstFeedbackPage: assembledFeedbackPage,
        });

        // Phase 5: pending request count is included in the bundle response
        setPendingRequestsCount(bundlePendingAccessRequestsCount);
        /* View count: recorded server-side in GET /api/session-page-bundle (see recordSessionViewIfNewRepo). */
      } else {
        const url = `/api/sessions/${encodeURIComponent(sessionId)}${qs}`;
        const res = await authFetchOrAnonCookie(url);
        if (cancelled || effectNonce !== sessionLoadEffectNonceRef.current) return;
        const body = await res.json().catch(() => null);
        if (cancelled || effectNonce !== sessionLoadEffectNonceRef.current) return;
        if (body === null || typeof body !== "object") {
          setSessionFetchError("error");
          return;
        }
        const accessRoot = body as {
          access?: { capabilities?: Partial<AccessCapabilities> };
        };
        if (res.status === 403) {
          const cap = accessRoot.access?.capabilities;
          if (cap && cap.canView === false) {
            setAccessBlocked(true);
            onAccessBlocked?.();
            setSession(null);
            setSessionFetchError(null);
            setPendingResolveRequest(false);
            setSessionAccess({
              canView: false,
              canComment: cap.canComment === true,
              canResolve: cap.canResolve === true,
              canAssign: cap.canAssign === true,
              canDeleteOwnComment: cap.canDeleteOwnComment !== false,
              canDeleteTicket: cap.canDeleteTicket === true,
            });
            return;
          }
          setAccessBlocked(false);
          setSession(null);
          setSessionAccess(null);
          setPendingResolveRequest(false);
          setSessionFetchError("forbidden");
          return;
        }
        if (res.status === 404) {
          setAccessBlocked(false);
          setSession(null);
          setSessionAccess(null);
          setPendingResolveRequest(false);
          setSessionFetchError("not_found");
          return;
        }
        if (!res.ok) {
          setAccessBlocked(false);
          setSession(null);
          setSessionAccess(null);
          setPendingResolveRequest(false);
          setSessionFetchError("error");
          return;
        }
        let sessionPayload: Record<string, unknown>;
        let requestPayload: { pendingResolve?: boolean } | undefined;
        try {
          const inner = requireApiSuccessData<{
            session: Record<string, unknown>;
            request?: { pendingResolve?: boolean };
          }>(body);
          sessionPayload = inner.session;
          requestPayload = inner.request;
        } catch {
          setAccessBlocked(false);
          setSession(null);
          setSessionAccess(null);
          setPendingResolveRequest(false);
          setSessionFetchError("error");
          return;
        }
        if (!sessionPayload) {
          setAccessBlocked(false);
          setSession(null);
          setSessionAccess(null);
          setPendingResolveRequest(false);
          setSessionFetchError("error");
          return;
        }
        setSessionFetchError(null);
        const raw = sessionPayload as { accessLevel?: unknown };
        setSession({
          id: sessionId,
          ...(sessionPayload as object),
          accessLevel: requireAccessLevel(raw.accessLevel),
        } as Session);
        const cap = accessRoot.access?.capabilities;
        setSessionAccess(
          cap
            ? {
                canView: cap.canView !== false,
                canComment: cap.canComment === true,
                canResolve: cap.canResolve === true,
                canAssign: cap.canAssign === true,
                canDeleteOwnComment: cap.canDeleteOwnComment !== false,
                canDeleteTicket: cap.canDeleteTicket === true,
              }
            : null
        );
        setPendingResolveRequest(
          requestPayload !== undefined && requestPayload.pendingResolve === true
        );
        // Authenticated: Loom-style view count via Bearer. Anonymous: share link token (sessionStorage / URL) on the request.
        if (authUidRef.current?.trim()) {
          const viewerId = getViewerId(authUidRef.current);
          void recordSessionViewIfNew(sessionId, viewerId).catch((err) => {
            console.warn("[ECHLY] recordSessionViewIfNew failed", err);
          });
        } else {
          const viewUrl = `/api/sessions/${encodeURIComponent(sessionId)}/view`;
          void authFetchOrAnonCookie(viewUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              shareToken:
                shareTokenForApiRef.current !== "" ? shareTokenForApiRef.current : undefined,
            }),
          }).catch(() => {});
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, authReady, shareTokenForApi]);

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
    if (!authReady) return;
    if (!ticketIdFromUrl || !feedbackSessionId) return;
    if (feedbackLoading) return;
    if (feedbackRef.current.some((f) => f.id === ticketIdFromUrl)) return;
    if (deepLinkHydrateAttempted.current === ticketIdFromUrl) return;
    deepLinkHydrateAttempted.current = ticketIdFromUrl;

    let cancelled = false;
    void (async () => {
      try {
        const tok = shareTokenForApiRef.current;
        const qs = tok !== "" ? `?token=${encodeURIComponent(tok)}` : "";
        const url = `/api/tickets/${encodeURIComponent(ticketIdFromUrl)}${qs}`;
        const res = await authFetchOrAnonCookie(url);
        if (res.status === 403 || res.status === 404 || !res.ok) return;
        const rawDeep = await res.json();
        let ticketPayload: TicketFromApi & {
          sessionId?: string;
          status?: string;
          createdAt?: string | null;
        };
        try {
          ticketPayload = requireApiSuccessData<{
            ticket: TicketFromApi & { sessionId?: string; status?: string; createdAt?: string | null };
          }>(rawDeep).ticket;
        } catch {
          return;
        }
        if (cancelled) return;
        const t = ticketPayload;
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
    authReady,
    shareTokenForApi,
    ticketIdFromUrl,
    feedbackSessionId,
    sessionId,
    feedbackLoading,
    setFeedback,
  ]);

  useEffect(() => {
    if (!ticketIdFromUrl || feedbackRef.current.length === 0 || hasAppliedTicketParam.current) return;
    if (!deepLinkTicketInList) return;
    hasAppliedTicketParam.current = true;
    setSelectedId(ticketIdFromUrl);
  }, [ticketIdFromUrl, deepLinkTicketInList]);

  // Deep link: expand the sidebar section that contains ?ticket= (once per ticket id; controlled sections).
  useEffect(() => {
    if (!ticketIdFromUrl) return;
    if (deepLinkSidebarExpansionDone.current === ticketIdFromUrl) return;
    if (deepLinkTicketBucket === "") return;
    deepLinkSidebarExpansionDone.current = ticketIdFromUrl;
    if (deepLinkTicketBucket === "resolved") {
      setResolvedExpanded(true);
      setOpenExpanded(false);
    } else {
      setOpenExpanded(true);
      setResolvedExpanded(false);
    }
  }, [ticketIdFromUrl, deepLinkTicketBucket]);

  // Clear new-ticket highlight after animation completes (1.2s).
  useEffect(() => {
    if (!newTicketId) return;
    const timeout = setTimeout(() => setNewTicketId(null), 1200);
    return () => clearTimeout(timeout);
  }, [newTicketId]);

  /* ================= SELECTED ITEM (derived from feedback list) ================= */

  const selectedIndex = stableCanonicalFeedback.findIndex((f) => f.id === effectiveSelectedId);

  const preloadNextScreenshotId =
    selectedIndex >= 0 ? stableScopedFeedback[selectedIndex + 1]?.screenshotId ?? "" : "";

  // Preload only the immediate next ticket screenshot (single lookahead).
  useEffect(() => {
    const delayMs = 300;
    const handle = window.setTimeout(() => {
      const sid = sessionId?.trim() ?? "";
      if (!preloadNextScreenshotId || !sid) return;
      const nextUrl = getScreenshotUrl(preloadNextScreenshotId, { sessionId: sid });
      if (nextUrl) preloadImage(nextUrl, preloadedScreenshotUrlsRef.current);
    }, delayMs);
    return () => window.clearTimeout(handle);
  }, [selectedIndex, preloadNextScreenshotId, sessionId]);

  const selectedBaseItem = useMemo(
    () => stableCanonicalFeedback.find((t) => t.id === effectiveSelectedId) ?? null,
    [stableCanonicalFeedback, effectiveSelectedId]
  );
  const selectedScreenshotId = selectedBaseItem?.screenshotId ?? null;
  const {
    url: selectedScreenshotUrl,
    loading: selectedScreenshotUrlLoading,
    error: selectedScreenshotUrlError,
  } = useScreenshotUrl(selectedScreenshotId, {
    sessionId: sessionId?.trim() ?? "",
  });

  const contextualPosition = useMemo(() => {
    if (!effectiveSelectedId) return { index: 0, total: -1 };

    const totalForBucket = (n: number) =>
      !isCountsSynced || feedbackCountsLoading ? -1 : Math.max(0, n);

    const openIndex = stableOpenFeedback.findIndex((ticket) => ticket.id === effectiveSelectedId);
    if (openIndex >= 0) {
      return {
        index: openIndex + 1,
        total: totalForBucket(feedbackActiveCount),
      };
    }

    const resolvedIndex = stableResolvedFeedback.findIndex((ticket) => ticket.id === effectiveSelectedId);
    if (resolvedIndex >= 0) {
      return {
        index: resolvedIndex + 1,
        total: totalForBucket(feedbackResolvedCount),
      };
    }

    // Fallback: selected ticket not present in filtered subsets; use canonical/global position.
    const globalIndex = stableCanonicalFeedback.findIndex((ticket) => ticket.id === effectiveSelectedId);
    if (globalIndex >= 0) {
      return {
        index: globalIndex + 1,
        total: totalForBucket(feedbackTotal),
      };
    }

    return { index: 0, total: -1 };
  }, [
    effectiveSelectedId,
    stableOpenFeedback,
    stableResolvedFeedback,
    stableCanonicalFeedback,
    feedbackCountsLoading,
    feedbackTotal,
    feedbackActiveCount,
    feedbackResolvedCount,
    isCountsSynced,
  ]);

  const selectedItem = useMemo(() => {
    if (!selectedBaseItem) return null;
    return {
      ...selectedBaseItem,
      index: Math.max(0, contextualPosition.index),
      total: contextualPosition.total >= 0 ? Math.max(0, contextualPosition.total) : -1,
    };
  }, [selectedBaseItem, contextualPosition.index, contextualPosition.total]);

  const bootstrapFirstTicket = useMemo((): (Feedback & { index: number; total: number }) | null => {
    if (stableScopedFeedback.length > 0) return null;
    if (!bundledFirstFeedbackPage?.feedback?.length) return null;
    const raw = bundledFirstFeedbackPage.feedback[0];
    if (!raw) return null;
    return { ...(raw as unknown as Feedback), index: 1, total: -1 };
  }, [stableScopedFeedback.length, bundledFirstFeedbackPage]);

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
      assertIdentityResolved(isIdentityResolved);
      const snapshot = sessionRef.current;
      if (snapshot) {
        setSession({ ...snapshot, archived, isArchived: archived });
      }
      let permissionDeniedNotified = false;
      try {
        const res = await authFetch(`/api/sessions/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ archived, isArchived: archived }),
        });
        if (!res) {
          if (snapshot) setSession(snapshot);
          showToast("Could not update session");
          return;
        }
        if (!res.ok) {
          const errBody = (await res.json().catch(() => ({}))) as { error?: string };
          if (responseIsPermissionDenied(res)) {
            notifyPermissionDenied(showToast);
            permissionDeniedNotified = true;
          }
          throw new Error(errBody?.error ?? "Archive failed");
        }
        if (archived) {
          router.push("/dashboard");
        }
      } catch (err) {
        console.error("[ECHLY] Session archive from menu failed", err);
        if (!permissionDeniedNotified) showToast("Could not update session");
        if (snapshot) setSession(snapshot);
      }
    },
    [sessionId, router, isIdentityResolved, showToast]
  );

  const handleRequestDeleteSessionFromMenu = useCallback((session: Session) => {
    void session;
    setDeleteSessionModalOpen(true);
  }, []);

  const confirmDeleteSessionFromMenu = useCallback(async () => {
    if (!sessionId) return;
    assertIdentityResolved(isIdentityResolved);
    const res = await authFetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
    if (!res) {
      throw new Error("Delete failed");
    }
    const rawDelete = await res.json();
    if (!res.ok) {
      const errBody = rawDelete as { error?: { message?: string } };
      if (responseIsPermissionDenied(res)) notifyPermissionDenied(showToast);
      throw new Error(
        typeof errBody.error?.message === "string" ? errBody.error.message : "Delete failed"
      );
    }
    requireApiSuccessData<Record<string, never>>(rawDelete);
    router.push("/dashboard");
  }, [sessionId, router, isIdentityResolved, showToast]);

  const {
    comments,
    loadingComments,
    displayCommentThreadCounts,
    refetchComments,
    sendReply,
    sendPinComment,
    sendTextComment,
    updatePinPosition,
    updateComment,
    deleteComment,
  } = useFeedbackDetailController({
    sessionId,
    feedbackId: effectiveSelectedId,
    canResolve: sessionAccess?.canResolve === true,
    onRequestResolveAccess: openRequestAccessModal,
  });

  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  /** Pin whose inline thread popover is open (does not open right panel). */
  const [activePinIdForPopover, setActivePinIdForPopover] = useState<string | null>(null);

  /* ================= SAVE TITLE (optimistic update, then PATCH) ================= */

  const saveTitle = async (newTitle: string): Promise<void> => {
    if (!effectiveSelectedId || newTitle.trim() === "") return;
    assertIdentityResolved(isIdentityResolved);
    const trimmed = newTitle.trim();
    const previousTitle = selectedItem?.title;
    setFeedback((prev) =>
      prev.map((item) =>
        item.id === effectiveSelectedId ? { ...item, title: trimmed } : item
      )
    );
    try {
      const res = await authFetch(`/api/tickets/${effectiveSelectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });
      if (!res) {
        setFeedback((prev) =>
          prev.map((item) =>
            item.id === effectiveSelectedId
              ? { ...item, title: previousTitle ?? trimmed }
              : item
          )
        );
        showToast("Could not save title");
        return;
      }
      const raw = await res.json();
      if (!res.ok) {
        setFeedback((prev) =>
          prev.map((item) =>
            item.id === effectiveSelectedId
              ? { ...item, title: previousTitle ?? trimmed }
              : item
          )
        );
        if (responseIsPermissionDenied(res)) notifyPermissionDenied(showToast);
        else showToast("Could not save title");
        return;
      }
      let ticketPayload: TicketFromApi;
      try {
        ticketPayload = requireApiSuccessData<{ ticket: TicketFromApi }>(raw).ticket;
      } catch {
        setFeedback((prev) =>
          prev.map((item) =>
            item.id === effectiveSelectedId
              ? { ...item, title: previousTitle ?? trimmed }
              : item
          )
        );
        showToast("Could not save title");
        return;
      }
      setFeedback((prev) =>
        prev.map((item) =>
          item.id === effectiveSelectedId ? { ...item, ...ticketPayload } : item
        )
      );
      broadcastTicketUpdated(ticketPayload);
    } catch (err) {
      console.error("[ECHLY] saveTitle failed", err);
      showToast("Could not save title");
      setFeedback((prev) =>
        prev.map((item) =>
          item.id === effectiveSelectedId
            ? { ...item, title: previousTitle ?? trimmed }
            : item
        )
      );
    }
  };

  /* ================= SAVE ACTION STEPS (optimistic update, then PATCH) ================= */

  const saveActionSteps = async (actionSteps: string[]) => {
    if (!effectiveSelectedId) return;
    assertIdentityResolved(isIdentityResolved);
    const ticketId = effectiveSelectedId;
    const currentSteps = selectedItem?.actionSteps ?? null;
    if (sameStringArrayContent(currentSteps, actionSteps)) return;

    const previousSteps = currentSteps;
    const priorGen = actionStepsSaveLatestGenRef.current.get(ticketId) ?? 0;
    const myGen = priorGen + 1;
    actionStepsSaveLatestGenRef.current.set(ticketId, myGen);
    pendingOptimisticActionStepsRef.current.set(ticketId, { steps: actionSteps });

    setFeedback((prev) =>
      prev.map((item) =>
        item.id === ticketId ? { ...item, actionSteps } : item
      )
    );

    void (async () => {
      const rollbackIfLatest = () => {
        if (actionStepsSaveLatestGenRef.current.get(ticketId) !== myGen) return;
        pendingOptimisticActionStepsRef.current.delete(ticketId);
        setFeedback((prev) =>
          prev.map((item) =>
            item.id === ticketId
              ? { ...item, actionSteps: previousSteps }
              : item
          )
        );
      };

      try {
        const res = await authFetch(`/api/tickets/${ticketId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ actionSteps }),
        });
        if (!res) {
          rollbackIfLatest();
          if (actionStepsSaveLatestGenRef.current.get(ticketId) === myGen) {
            showToast("Could not save action items");
          }
          return;
        }
        const raw = await res.json();
        if (!res.ok) {
          rollbackIfLatest();
          if (actionStepsSaveLatestGenRef.current.get(ticketId) === myGen) {
            if (responseIsPermissionDenied(res)) notifyPermissionDenied(showToast);
            else showToast("Could not save action items");
          }
          return;
        }
        let ticketPayload: TicketFromApi;
        try {
          ticketPayload = requireApiSuccessData<{ ticket: TicketFromApi }>(raw).ticket;
        } catch {
          rollbackIfLatest();
          if (actionStepsSaveLatestGenRef.current.get(ticketId) === myGen) {
            showToast("Could not save action items");
          }
          return;
        }
        if (actionStepsSaveLatestGenRef.current.get(ticketId) !== myGen) {
          return;
        }
        pendingOptimisticActionStepsRef.current.delete(ticketId);
        setFeedback((prev) =>
          prev.map((item) =>
            item.id === ticketId ? { ...item, ...ticketPayload } : item
          )
        );
        broadcastTicketUpdated(ticketPayload);
      } catch (err) {
        console.error("[ECHLY] saveActionSteps failed", err);
        rollbackIfLatest();
        if (actionStepsSaveLatestGenRef.current.get(ticketId) === myGen) {
          showToast("Could not save action items");
        }
      }
    })();
  };

  const saveTags = async (suggestedTags: string[]) => {
    if (!effectiveSelectedId) return;
    assertIdentityResolved(isIdentityResolved);
    const nextTags = Array.isArray(suggestedTags) ? suggestedTags : null;
    const previous = selectedItem?.suggestedTags ?? null;
    setFeedback((prev) =>
      prev.map((item) =>
        item.id === effectiveSelectedId ? { ...item, suggestedTags: nextTags } : item
      )
    );
    try {
      const res = await authFetch(`/api/tickets/${effectiveSelectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestedTags }),
      });
      if (!res) {
        setFeedback((prev) =>
          prev.map((item) =>
            item.id === effectiveSelectedId ? { ...item, suggestedTags: previous } : item
          )
        );
        showToast("Could not save tags");
        return;
      }
      const rawTags = await res.json();
      if (!res.ok) {
        setFeedback((prev) =>
          prev.map((item) =>
            item.id === effectiveSelectedId ? { ...item, suggestedTags: previous } : item
          )
        );
        if (responseIsPermissionDenied(res)) notifyPermissionDenied(showToast);
        else showToast("Could not save tags");
        return;
      }
      let ticketPayload: TicketFromApi;
      try {
        ticketPayload = requireApiSuccessData<{ ticket: TicketFromApi }>(rawTags).ticket;
      } catch {
        setFeedback((prev) =>
          prev.map((item) =>
            item.id === effectiveSelectedId ? { ...item, suggestedTags: previous } : item
          )
        );
        showToast("Could not save tags");
        return;
      }
      setFeedback((prev) =>
        prev.map((item) =>
          item.id === effectiveSelectedId ? { ...item, ...ticketPayload } : item
        )
      );
      broadcastTicketUpdated(ticketPayload);
    } catch (err) {
      console.error("[ECHLY] saveTags failed", err);
      showToast("Could not save tags");
      setFeedback((prev) =>
        prev.map((item) =>
          item.id === effectiveSelectedId ? { ...item, suggestedTags: previous } : item
        )
      );
    }
  };

  const saveResolved = (isResolved: boolean): boolean => {
    const ticketId = effectiveSelectedId;
    if (!ticketId) return false;

    return safeResolveAction({
      canResolve: sessionAccessRef.current?.canResolve === true,
      triggerRequestAccessFlow: openRequestAccessModal,
      run: () => {
        const previousResolved = Boolean(
          feedback.find((i) => i.id === ticketId)?.isResolved
        );

        setResolveOptimistic({ ticketId, isResolved });
        if (isResolved) {
          setResolveAffirmationKey((k) => k + 1);
        }

        startTransition(() => {
          setFeedback((prevList) =>
            prevList.map((item) =>
              item.id === ticketId ? { ...item, isResolved } : item
            )
          );
        });

        const countsTransition = previousResolved !== isResolved;
        if (countsTransition) {
          setSessionCountsDelta((prev) => ({
            open: prev.open + (isResolved ? -1 : 1),
            resolved: prev.resolved + (isResolved ? 1 : -1),
            total: prev.total,
          }));
        }

        void (async () => {
          const rollbackResolved = () => {
            setResolveOptimistic(null);
            if (countsTransition) {
              setSessionCountsDelta((prev) => ({
                open: prev.open + (isResolved ? 1 : -1),
                resolved: prev.resolved + (isResolved ? -1 : 1),
                total: prev.total,
              }));
            }
            setFeedback((prevList) =>
              prevList.map((item) =>
                item.id === ticketId
                  ? { ...item, isResolved: previousResolved }
                  : item
              )
            );
          };

          // PERF R-014: guard behind NODE_ENV so localStorage is never read in
          // production builds — eliminates a synchronous localStorage read per resolve.
          const perf =
            process.env.NODE_ENV === "development" &&
            typeof window !== "undefined" &&
            typeof localStorage !== "undefined" &&
            localStorage.getItem("ECHLY_PERF") === "1";
          const t0 = performance.now();
          if (perf) console.log("[ECHLY_PERF] CLIENT START (resolve ticket)", t0);
          try {
            assertIdentityResolved(isIdentityResolved);
            const res = await authFetch(`/api/tickets/${ticketId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ isResolved }),
            });
            if (!res || !res.ok) {
              rollbackResolved();
              if (res && responseIsPermissionDenied(res)) notifyPermissionDenied(showToast);
              else showToast("Failed to update");
              return;
            }
            const rawResolve = await res.json();
            let ticketPayload: TicketFromApi;
            try {
              ticketPayload = requireApiSuccessData<{ ticket: TicketFromApi }>(rawResolve).ticket;
            } catch {
              rollbackResolved();
              showToast("Failed to update");
              return;
            }
            if (perf) {
              const clientTotal = performance.now() - t0;
              console.log("[ECHLY_PERF] CLIENT END (resolve ticket)", clientTotal.toFixed(1), "ms");
              console.log(
                "[ECHLY_PERF] Full breakdown: compare CLIENT total above with authFetch TOKEN/NETWORK lines and server [Resolve] logs for API vs Firestore."
              );
            }
            setResolveOptimistic(null);
            setFeedback((prev) =>
              prev.map((item) =>
                item.id === ticketId ? { ...item, ...ticketPayload } : item
              )
            );
            // PERF R-006: session counters changed — stale cache entry must be
            // evicted so the next navigation re-fetches accurate counts.
            invalidateSessionDetailCache(sessionId);
            broadcastTicketUpdated(ticketPayload);
          } catch (err) {
            console.error("[ECHLY] saveResolved failed", err);
            rollbackResolved();
            showToast("Failed to update");
          }
        })();
      },
    });
  };

  const handleResolvedChange = (isResolved: boolean) => {
    if (!isResolved) {
      saveResolved(false);
      return;
    }
    const ticketId = effectiveSelectedId;
    if (!ticketId || !selectedItem) return;

    /** Next navigation target: forward scan in list order for open tickets, then first other open (wrap). */
    const tickets = stableScopedFeedback;
    const isOpen = (row: (typeof tickets)[number]) =>
      normalizeTicketStatus(getTicketStatus(row)) === "open";
    const currentIndex = tickets.findIndex((t) => t.id === ticketId);
    const nextOpenAfter =
      currentIndex >= 0
        ? tickets.slice(currentIndex + 1).find(isOpen)
        : undefined;
    const firstOtherOpen = tickets.find(
      (t) => t.id !== ticketId && isOpen(t)
    );
    const navigateToId = nextOpenAfter?.id ?? firstOtherOpen?.id;

    if (navigateToId) {
      setSelectedId(navigateToId);
    } else {
      showToast("No more feedback");
    }

    /** Optimistic local updates + PATCH already run inside saveResolved; navigation is immediate (no await). */
    saveResolved(true);
  };

  const handleSessionTitleBlur = useCallback(async () => {
    const s = sessionRef.current;
    if (!sessionId || !s) return;
    const trimmed = sessionTitleDraft.trim();
    const prevDisplay = (s.title ?? "").trim();
    const safeTitle = trimmed;
    if (safeTitle === prevDisplay) {
      setIsEditingSessionTitle(false);
      setSessionTitleDraft(prevDisplay);
      return;
    }
    const previousTitle = s.title ?? "";
    setSession((prev: Session | null) =>
      prev ? ({ ...prev, title: safeTitle } as Session) : prev
    );
    setSessionTitleDraft(safeTitle);
    setIsEditingSessionTitle(false);
    setSaveSessionTitleSuccess(true);
    setTimeout(() => setSaveSessionTitleSuccess(false), 1200);
    try {
      assertIdentityResolved(isIdentityResolved);
      const res = await authFetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: safeTitle }),
      });
      if (!res) {
        setSession((prev: Session | null) =>
          prev ? ({ ...prev, title: previousTitle } as Session) : prev
        );
        setSessionTitleDraft((previousTitle || "").trim());
        showToast("Could not save session name");
        return;
      }
      const rawSessionPatch = await res.json();
      if (!res.ok) {
        if (responseIsPermissionDenied(res)) notifyPermissionDenied(showToast);
        else showToast("Could not save session name");
        setSession((prev: Session | null) =>
          prev ? ({ ...prev, title: previousTitle } as Session) : prev
        );
        setSessionTitleDraft((previousTitle || "").trim());
        return;
      }
      let patchSession: Record<string, unknown>;
      try {
        patchSession = requireApiSuccessData<{ session: Record<string, unknown> }>(
          rawSessionPatch
        ).session;
      } catch {
        showToast("Could not save session name");
        setSession((prev: Session | null) =>
          prev ? ({ ...prev, title: previousTitle } as Session) : prev
        );
        setSessionTitleDraft((previousTitle || "").trim());
        return;
      }
      setSession((prev: Session | null) =>
        prev ? ({ ...prev, ...patchSession } as Session) : prev
      );
      const apiTitle = ((patchSession.title as string) ?? safeTitle).trim();
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
    } catch (err) {
      console.error("[ECHLY] handleSessionTitleBlur PATCH failed", err);
      showToast("Could not save session name");
      setSession((prev: Session | null) =>
        prev ? ({ ...prev, title: previousTitle } as Session) : prev
      );
      setSessionTitleDraft((previousTitle || "").trim());
    }
  }, [sessionId, sessionTitleDraft, isIdentityResolved, showToast]);

  const handleMarkAllResolved = useCallback(() => {
    safeResolveAction({
      canResolve: sessionAccessRef.current?.canResolve === true,
      triggerRequestAccessFlow: openRequestAccessModal,
      run: () => {
        void (async () => {
          assertIdentityResolved(isIdentityResolved);
          const feedbackList = feedbackRef.current;
          const active = feedbackList.filter((item) => getTicketStatus(item) === "open");
          if (active.length === 0) return;
          const previousById = new Map(feedbackList.map((item) => [item.id, item]));
          setFeedback((prev) =>
            prev.map((item) =>
              getTicketStatus(item) === "open" ? { ...item, isResolved: true } : item
            )
          );
          try {
            // PERF R-002: single batch request instead of N individual PATCH requests
            const res = await authFetch(`/api/feedback/batch-resolve`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sessionId,
                feedbackIds: active.map((item) => item.id),
                isResolved: true,
              }),
              timeout: 60000,
            });
            // PERF R-006: invalidate cache after bulk resolve so next navigation re-fetches fresh counters
            invalidateSessionDetailCache(sessionId);
            if (!res || !res.ok) {
              setFeedback((prev) =>
                prev.map((item) => previousById.get(item.id) ?? item)
              );
              if (res != null && responseIsPermissionDenied(res)) notifyPermissionDenied(showToast);
              else showToast("Could not resolve all tickets");
            }
          } catch (err) {
            warn("Mark all resolved failed:", err);
            setFeedback((prev) =>
              prev.map((item) => previousById.get(item.id) ?? item)
            );
            showToast("Could not resolve all tickets");
          }
        })();
      },
    });
  }, [setFeedback, isIdentityResolved, showToast, openRequestAccessModal]);

  const handleMarkAllUnresolved = useCallback(() => {
    safeResolveAction({
      canResolve: sessionAccessRef.current?.canResolve === true,
      triggerRequestAccessFlow: openRequestAccessModal,
      run: () => {
        void (async () => {
          assertIdentityResolved(isIdentityResolved);
          const feedbackList = feedbackRef.current;
          const resolved = feedbackList.filter((item) => getTicketStatus(item) === "resolved");
          if (resolved.length === 0) return;
          const previousById = new Map(feedbackList.map((item) => [item.id, item]));
          setFeedback((prev) =>
            prev.map((item) =>
              getTicketStatus(item) === "resolved"
                ? { ...item, isResolved: false }
                : item
            )
          );
          try {
            // PERF R-002: single batch request instead of N individual PATCH requests
            const res = await authFetch(`/api/feedback/batch-resolve`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sessionId,
                feedbackIds: resolved.map((item) => item.id),
                isResolved: false,
              }),
              timeout: 60000,
            });
            // PERF R-006: invalidate cache after bulk unresolve so next navigation re-fetches fresh counters
            invalidateSessionDetailCache(sessionId);
            if (!res || !res.ok) {
              setFeedback((prev) =>
                prev.map((item) => previousById.get(item.id) ?? item)
              );
              if (res != null && responseIsPermissionDenied(res)) notifyPermissionDenied(showToast);
              else showToast("Could not reopen all tickets");
            }
          } catch (err) {
            warn("Mark all unresolved failed:", err);
            setFeedback((prev) =>
              prev.map((item) => previousById.get(item.id) ?? item)
            );
            showToast("Could not reopen all tickets");
          }
        })();
      },
    });
  }, [setFeedback, isIdentityResolved, showToast, openRequestAccessModal]);

  const handleDeleteFeedback = async (id: string) => {
    assertIdentityResolved(isIdentityResolved);
    const ticket = feedback.find((i) => i.id === id);
    if (!ticket) return;

    const wasResolved = Boolean(ticket.isResolved);
    const selectionBeforeDelete = effectiveSelectedId;
    const prevFeedback = feedback;
    const nextSelected =
      selectionBeforeDelete === id
        ? feedback.filter((item) => item.id !== id)[0]?.id ?? null
        : selectionBeforeDelete;

    setSessionCountsDelta((prev) => ({
      open: prev.open + (wasResolved ? 0 : -1),
      resolved: prev.resolved + (wasResolved ? -1 : 0),
      total: prev.total - 1,
    }));
    setFeedback((prev) => prev.filter((item) => item.id !== id));
    setSelectedId(nextSelected);
    setShowDeleteModal(false);

    const rollbackDelete = () => {
      setSessionCountsDelta((prev) => ({
        open: prev.open + (wasResolved ? 0 : 1),
        resolved: prev.resolved + (wasResolved ? 1 : 0),
        total: prev.total + 1,
      }));
      setFeedback(prevFeedback);
      setSelectedId(selectionBeforeDelete);
    };

    try {
      const res = await authFetch(`/api/tickets/${id}`, { method: "DELETE" });
      if (!res) {
        rollbackDelete();
        showToast("Could not delete ticket");
        return;
      }
      const rawDelTicket = await res.json();
      if (!res.ok) {
        rollbackDelete();
        if (responseIsPermissionDenied(res)) notifyPermissionDenied(showToast);
        else showToast("Could not delete ticket");
        return;
      }
      try {
        requireApiSuccessData<Record<string, never>>(rawDelTicket);
      } catch {
        rollbackDelete();
        showToast("Could not delete ticket");
        return;
      }
      // PERF R-006: invalidate cache so next navigation doesn't serve deleted feedback
      invalidateSessionDetailCache(sessionId);
      const currentPath = window.location.pathname;
      router.push(currentPath);
    } catch (err) {
      console.error("[ECHLY] handleDeleteFeedback failed", err);
      rollbackDelete();
      if (!handlePermissionError(err, showToast)) {
        showToast("Could not delete ticket");
      }
    }
  };

  const canDeleteSelectedTicket =
    Boolean(authUid) && selectedItem != null && sessionAccess?.canDeleteTicket === true;

  if (accessBlocked) {
    return (
      <RequestSessionAccessPage
        sessionId={sessionId}
        sessionName={session?.title ?? null}
        workspaceName={workspaceName ?? null}
        isAuthenticated={!!authUid}
        isPublicRoute={isPublicRoute}
        userEmail={authEmail ?? null}
        requestStatus={requestAccessStatus}
        onRequestAccess={handleRequestSessionAccess}
        onSignIn={() =>
          router.push(
            `/login?returnUrl=${encodeURIComponent(
              window.location.pathname + window.location.search
            )}`
          )
        }
      />
    );
  }

  if (sessionFetchError === "forbidden") {
    return (
      <div className="flex h-full min-h-[50vh] w-full items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h1 className="text-[20px] font-semibold text-[hsl(var(--text-primary-strong))]">
            Access denied
          </h1>
          <p className="mt-3 text-[14px] text-[hsl(var(--text-secondary-soft))]">
            You don&apos;t have permission to view this session.
          </p>
        </div>
      </div>
    );
  }

  if (sessionFetchError === "not_found") {
    return (
      <div className="flex h-full min-h-[50vh] w-full items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h1 className="text-[20px] font-semibold text-[hsl(var(--text-primary-strong))]">
            Session not found
          </h1>
          <p className="mt-3 text-[14px] text-[hsl(var(--text-secondary-soft))]">
            This link may be invalid or the session was removed.
          </p>
        </div>
      </div>
    );
  }

  if (sessionFetchError === "error") {
    return (
      <div className="flex h-full min-h-[50vh] w-full items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h1 className="text-[20px] font-semibold text-[hsl(var(--text-primary-strong))]">
            Couldn&apos;t load session
          </h1>
          <p className="mt-3 text-[14px] text-[hsl(var(--text-secondary-soft))]">
            Check your connection and try again.
          </p>
        </div>
      </div>
    );
  }

  const renderExecutionContent = () => {
    if (stableScopedFeedback.length === 0) {
      if (feedbackLoading) {
        return (
          <ExecutionView
            item={bootstrapFirstTicket}
            setIsImageExpanded={setIsImageExpanded}
            isCommentMode={false}
            comments={[]}
            screenshotUrl={null}
            screenshotUrlLoading={bootstrapFirstTicket?.screenshotId != null}
            screenshotUrlError={null}
          />
        );
      }
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
        resolveAffirmationKey={resolveAffirmationKey}
        onSaveTitle={saveTitle}
        onResolvedChange={handleResolvedChange}
        onSaveActionSteps={isWorkspaceMember ? saveActionSteps : undefined}
        onSaveTags={saveTags}
        setIsImageExpanded={setIsImageExpanded}
        isCommentMode={isCommentMode}
        onOpenComment={() => setIsCommentMode(true)}
        onCloseCommentMode={() => setIsCommentMode(false)}
        impactScore={(selectedItem as { impactScore?: number } | null)?.impactScore}
        comments={comments}
        sendPinComment={sendPinComment}
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
        sendTextComment={sendTextComment}
        onCommentPlaced={() => setIsCommentMode(false)}
        updatePinPosition={updatePinPosition}
        onDelete={
          canDeleteSelectedTicket ? () => setShowDeleteModal(true) : undefined
        }
        readOnly={
          sessionAccess == null
            ? true
            : !sessionAccess.canComment && !sessionAccess.canResolve
        }
        readOnlyPermissions={{
          canComment: sessionAccess?.canComment === true,
          canResolve: sessionAccess?.canResolve === true,
        }}
        accessResolve={
          sessionAccess?.canView &&
          sessionAccess?.canResolve === false
            ? {
                canResolve: false,
                pendingResolve: pendingResolveRequest,
                onRequestAccess: authUid
                  ? openRequestAccessModal
                  : () => {
                      window.location.href = `/login?returnUrl=${encodeURIComponent(
                        window.location.pathname + window.location.search
                      )}`;
                    },
              }
            : undefined
        }
        isAnonymousViewer={isAnonymousViewer}
        accessResolveSubmitting={requestAccessSubmitting}
        screenshotUrl={selectedScreenshotUrl}
        screenshotUrlLoading={selectedScreenshotUrlLoading}
        screenshotUrlError={selectedScreenshotUrlError}
      />
    );
  };

  return (
    <>
      {requestAccessModalOpen ? (
        <RequestAccessModal
          open
          onClose={() => setRequestAccessModalOpen(false)}
          onConfirm={confirmRequestResolveAccess}
          submitting={requestAccessSubmitting}
        />
      ) : null}
      <div className="flex h-full min-h-0 overflow-hidden">
        <aside className="sidebar hidden lg:flex w-[300px] h-screen overflow-hidden shrink-0 self-start min-h-0 flex-col sticky top-0">
          <TicketList
            sessionTitle={session ? (session.title ?? "").trim() : ""}
            counts={{
              total: isCountsSynced ? feedbackTotal : Math.max(0, sessionRestTotal),
              open: isCountsSynced ? feedbackActiveCount : Math.max(0, sessionRestOpen),
              resolved: isCountsSynced ? feedbackResolvedCount : Math.max(0, sessionRestResolved),
            }}
            countsLoading={!hasSessionCounts}
            {...(isAnonymousViewer
              ? {
                  showTicketSearch: sessionAccess?.canView === true,
                  showSessionOverflowMenu: false,
                }
              : {
                  isEditingSessionTitle,
                  sessionTitleDraft,
                  onSessionTitleChange: setSessionTitleDraft,
                  onSessionTitleSave: handleSessionTitleBlur,
                  onSessionTitleCancel: () => {
                    setIsEditingSessionTitle(false);
                    setSessionTitleDraft((session?.title ?? "").trim());
                  },
                  onSessionTitleEdit: () => {
                    setSessionTitleDraft((session?.title ?? "").trim());
                    setIsEditingSessionTitle(true);
                  },
                  saveSessionTitleSuccess,
                  onMarkAllTicketsResolved: handleMarkAllResolved,
                  onMarkAllTicketsUnresolved: handleMarkAllUnresolved,
                })}
            items={stableScopedFeedback}
            selectedId={effectiveSelectedId}
            onSelect={setSelectedId}
            newTicketId={newTicketId}
            loadingMore={isSearchMode ? false : feedbackLoadingMore}
            hasMore={isSearchMode ? false : hasMoreFeedback}
            hasReachedLimit={feedbackReachedLimit}
            loadMoreRef={feedbackLoadMoreRef}
            scrollContainerRef={listScrollRef}
            scrollToId={effectiveSelectedId}
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
          {pendingResolveRequest && sessionAccess?.canResolve === false ? (
            <PendingAccessBanner />
          ) : null}
          {!isPublicRoute && (
            <TopControlBar
              sessionId={sessionId}
              sessionTitle={session ? (session.title ?? "").trim() : ""}
              session={session}
              onSessionRenameSuccess={handleSessionRenameFromMenu}
              onSetSessionArchived={handleSetSessionArchivedFromMenu}
              onRequestDeleteSession={handleRequestDeleteSessionFromMenu}
              publicViewer={isAnonymousViewer}
              canManageShare={sessionAccess?.canResolve === true}
              canManageAccess={sessionAccess?.canDeleteTicket === true}
              isWorkspaceMember={isWorkspaceMember}
              pendingRequestsCount={pendingRequestsCount}
              onShareModalOpen={() => setPendingRequestsCount(0)}
              sessionLoaded={sessionLoaded}
            />
          )}
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
                  threadCounts={displayCommentThreadCounts}
                  onRefreshComments={() => void refetchComments()}
                  sendReply={sendReply}
                  activeThreadId={activeThreadId}
                  onSelectThread={setActiveThreadId}
                  currentUserId={authUid}
                  updateComment={updateComment}
                  deleteComment={deleteComment}
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
              sessionTitle={session ? (session.title ?? "").trim() : ""}
              counts={{
                total: isCountsSynced ? feedbackTotal : Math.max(0, sessionRestTotal),
                open: isCountsSynced ? feedbackActiveCount : Math.max(0, sessionRestOpen),
                resolved: isCountsSynced ? feedbackResolvedCount : Math.max(0, sessionRestResolved),
              }}
              countsLoading={!hasSessionCounts}
              {...(isAnonymousViewer
                ? {
                    showTicketSearch: sessionAccess?.canView === true,
                    showSessionOverflowMenu: false,
                  }
                : {
                    isEditingSessionTitle,
                    sessionTitleDraft,
                    onSessionTitleChange: setSessionTitleDraft,
                    onSessionTitleSave: handleSessionTitleBlur,
                    onSessionTitleCancel: () => {
                      setIsEditingSessionTitle(false);
                      setSessionTitleDraft((session?.title ?? "").trim());
                    },
                    onSessionTitleEdit: () => {
                      setSessionTitleDraft((session?.title ?? "").trim());
                      setIsEditingSessionTitle(true);
                    },
                    saveSessionTitleSuccess,
                    onMarkAllTicketsResolved: handleMarkAllResolved,
                    onMarkAllTicketsUnresolved: handleMarkAllUnresolved,
                  })}
              items={stableScopedFeedback}
              selectedId={effectiveSelectedId}
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

      {isImageExpanded && selectedItem?.screenshotId && selectedScreenshotUrl && (
        <ImageViewer
          imageUrl={selectedScreenshotUrl}
          fileName={`ticket-${selectedItem.id}-screenshot`}
          onClose={() => setIsImageExpanded(false)}
        />
      )}

      {deleteSessionModalOpen ? (
        <DeleteSessionModal
          open
          onClose={() => setDeleteSessionModalOpen(false)}
          sessionTitle={session ? (session.title ?? "").trim() : ""}
          onConfirm={confirmDeleteSessionFromMenu}
        />
      ) : null}

      {showDeleteModal && effectiveSelectedId && (
        <Modal
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          role="alertdialog"
          ariaLabelledBy="delete-ticket-title"
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6 border border-[var(--layer-2-border)] shadow-[var(--layer-2-shadow-hover)]"
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
                onClick={() => handleDeleteFeedback(effectiveSelectedId)}
                className="px-4 py-2 text-[13px] font-medium rounded-xl bg-[#ef4444] text-white hover:bg-[#dc2626] focus:outline-none focus:ring-2 focus:ring-[#ef4444]/40 transition-colors duration-[120ms] cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

