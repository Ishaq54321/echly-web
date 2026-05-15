"use client";

import { authFetch, type AuthFetchInit } from "@/lib/authFetch";
import GlobalRail from "@/components/layout/GlobalRail";
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
  useWorkspace,
} from "@/lib/client/workspaceContext";
import { useStableState } from "@/lib/client/perception/useStableState";
import { getScreenshotUrl } from "@/lib/client/screenshotResolver";
import { useScreenshotUrl } from "@/lib/client/useScreenshotUrl";
import { normalizeTicketStatus } from "@/lib/domain/normalizeTicketStatus";
import { useFeedbackDetailController } from "./hooks/useFeedbackDetailController";
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
  retainSessionListener,
  hydrateSessionFromBundle,
  useSessionStore,
} from "@/lib/realtime/sessionStore";
import {
  retainFeedbackListener,
  useFeedbackStore,
} from "@/lib/realtime/feedbackStore";
import {
  retainPresenceListener,
  usePresenceStore,
} from "@/lib/realtime/presenceStore";
import { retainAccessRequestsListener } from "@/lib/realtime/accessRequestStore";
import { useSessionCommentsAggregate } from "@/lib/realtime/commentsStore";
import { usePresenceHeartbeat } from "@/lib/hooks/usePresenceHeartbeat";
import { Timestamp } from "firebase/firestore";
import { warn } from "@/lib/utils/logger";
import { requireApiSuccessData } from "@/lib/api/apiEnvelope";
import {
  TicketList,
  ExecutionView,
} from "@/components/layout/operating-system";
import { TicketActivityPanel } from "@/components/session/feedbackDetail/TicketActivityPanel";
import { TopControlBar } from "@/components/ui/TopControlBar";
import { Tooltip } from "@/components/ui/Tooltip";
import { useToast } from "@/components/dashboard/context/ToastContext";
import { ImageViewer } from "@/components/ImageViewer";
import { ResolveToast, type ResolveToastState } from "@/components/ui/ResolveToast";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import type { ActionItemsSectionHandle } from "@/components/session/feedbackDetail/ActionItemsSection";

function formatRelativeTime(timestamp: unknown): string {
  try {
    const date =
      typeof timestamp === "object" &&
      timestamp !== null &&
      "seconds" in timestamp
        ? new Date((timestamp as { seconds: number }).seconds * 1000)
        : new Date(timestamp as string | number);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return "Just now";
  }
}

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
function broadcastTicketUpdated(ticket: { id: string; title: string; description?: string | null; type?: string }) {
  if (typeof window === "undefined" || !("chrome" in window)) return;
  try {
    (
      window as Window & { chrome?: { runtime?: { sendMessage?: (msg: unknown) => void } } }
    ).chrome?.runtime?.sendMessage?.({
      type: "ECHLY_TICKET_UPDATED",
      ticket: {
        id: ticket.id,
        title: ticket.title,
        description: ticket.description ?? "",
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
  description?: string;
  type: string;
  isResolved?: boolean;
  tags?: string[] | null;
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

/**
 * Convert a REST-shaped feedback row (as returned by the bundle for anonymous
 * viewers) into a domain {@link Feedback}. Mirrors the serializer in
 * `lib/server/serializeFeedback.ts` for parity with what the listener emits.
 */
function bundleFeedbackRowToFeedback(
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
  const normalizedStatus =
    rawStatus === "resolved" ? "resolved" : rawStatus === "processing" ? "processing" : "open";
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
    description: typeof row.description === "string" ? row.description : null,
    type: typeof row.type === "string" ? row.type : "Feedback",
    isResolved: normalizedStatus === "resolved",
    createdAt,
    tags: Array.isArray(row.tags)
      ? (row.tags as unknown[]).filter((s): s is string => typeof s === "string")
      : null,
    pageArea: typeof row.pageArea === "string" ? row.pageArea : null,
    url: null,
    viewportWidth: typeof row.viewportWidth === "number" ? row.viewportWidth : null,
    viewportHeight: typeof row.viewportHeight === "number" ? row.viewportHeight : null,
    userAgent: typeof row.userAgent === "string" ? row.userAgent : null,
    clientTimestamp: null,
    screenWidth: typeof row.screenWidth === "number" ? row.screenWidth : null,
    screenHeight: typeof row.screenHeight === "number" ? row.screenHeight : null,
    devicePixelRatio: typeof row.devicePixelRatio === "number" ? row.devicePixelRatio : null,
    screenshotId: typeof row.screenshotId === "string" ? row.screenshotId : null,
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
    assigneeId: typeof row.assigneeId === "string" ? row.assigneeId : null,
    assigneeName: typeof row.assigneeName === "string" ? row.assigneeName : null,
    assigneeAvatarUrl:
      typeof row.assigneeAvatarUrl === "string" ? row.assigneeAvatarUrl : null,
    priority:
      row.priority === "high" || row.priority === "medium" || row.priority === "low"
        ? (row.priority as "high" | "medium" | "low")
        : null,
    creatorName: typeof row.creatorName === "string" ? row.creatorName : null,
    creatorAvatarUrl:
      typeof row.creatorAvatarUrl === "string" ? row.creatorAvatarUrl : null,
  };
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
  onBrandingResolved,
}: {
  sessionId: string;
  isPublicRoute?: boolean;
  onSessionLoaded?: (info: SessionLoadedInfo) => void;
  onAccessBlocked?: () => void;
  /** Fired once the bundle resolves with the session-owner's whitelabel branding info. */
  onBrandingResolved?: (info: { brandLogoUrl: string | null; brandingEnabled: boolean }) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticketIdFromUrl = searchParams.get("ticket");
  const editFromUrl = searchParams.get("edit") === "true";
  const commentIdFromUrl = searchParams.get("comment");

  /**
   * Local optimistic overlay for session-level mutations (rename, archive, title edit).
   * The realtime store ({@link useSessionStore}) is the source of truth; this overlay
   * provides instant feedback and is cleared after the listener catches up.
   */
  const [optimisticSession, setSession] = useState<Session | null>(null);
  const pendingSessionTitleRef = useRef<string | null>(null);
  // Realtime store snapshot for this session id — listener-driven source of truth.
  const sessionStoreState = useSessionStore(sessionId);
  // Subscribe to comments + presence stores so the accessRevoked watcher below
  // sees a permission-denied from any of the four listeners. These hooks only
  // call useSyncExternalStore — they do NOT retain listeners on their own.
  const commentsStoreState = useSessionCommentsAggregate(sessionId);
  const presenceStoreState = usePresenceStore(sessionId);
  /**
   * Effective session = listener data when present, else local optimistic overlay.
   * Listener wins because it's the authoritative server state; overlay covers the
   * window between a local mutation and the listener tick that reflects it.
   */
  const session: Session | null = (() => {
    const base = sessionStoreState.session ?? optimisticSession;
    if (!base) return null;
    if (pendingSessionTitleRef.current !== null) {
      return { ...base, title: pendingSessionTitleRef.current };
    }
    if (optimisticSession) {
      return { ...(sessionStoreState.session ?? {}), ...optimisticSession } as Session;
    }
    return base;
  })();
  useEffect(() => {
    if (
      pendingSessionTitleRef.current &&
      sessionStoreState.session?.title === pendingSessionTitleRef.current
    ) {
      pendingSessionTitleRef.current = null;
    }
  }, [sessionStoreState.session?.title]);
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
  /** True when the current user belongs to the session's workspace (OWNER or WS-MEMBER). */
  const [isWorkspaceMember, setIsWorkspaceMember] = useState(false);
  /**
   * True when the viewer holds a realtime-eligible grant (workspace member, session
   * member doc, or sessionAccess mirror). Drives `canSubscribeToFirestore`. Authed
   * link_view viewers without an explicit grant get false here and use the bundle path.
   */
  const [hasDirectSessionGrant, setHasDirectSessionGrant] = useState(false);
  /**
   * Session-owner whitelabel branding hydrated from the bundle/REST GET. Held separately
   * from `session` because the realtime Firestore listener overwrites `session` with a
   * doc-derived object that lacks these server-hydrated fields.
   */
  const [ownerBrandLogoUrl, setOwnerBrandLogoUrl] = useState<string | null>(null);
  const [ownerBrandingEnabled, setOwnerBrandingEnabled] = useState<boolean>(false);
  const [brandingResolved, setBrandingResolved] = useState(false);
  /** Pagination state for bundle-mode viewers (anon + authed link_view). */
  const [feedbackCursor, setFeedbackCursor] = useState<string | null>(null);
  const [hasMoreFeedbackPaginated, setHasMoreFeedbackPaginated] = useState(false);
  const [feedbackLoadingMorePaginated, setFeedbackLoadingMorePaginated] = useState(false);
  const feedbackLoadMoreRefInternal = useRef<HTMLDivElement | null>(null);
  /**
   * Anonymous-viewer fallback: bundle returns first page of feedback for non-authenticated
   * share-link viewers (they cannot subscribe to the `feedback` collection). For
   * authenticated viewers this stays null and {@link useFeedbackStore} drives the list.
   */
  const [anonymousBundledFeedback, setAnonymousBundledFeedback] = useState<
    Feedback[] | null
  >(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  /** Imperative handle into the active description section, used to guard ticket switches. */
  const actionItemsRef = useRef<ActionItemsSectionHandle | null>(null);
  /** Tracks the newest ticket id for the highlight animation; cleared after animation ends. */
  const [newTicketId, setNewTicketId] = useState<string | null>(null);
  /** Tracks which pin comment should pulse its ring animation; cleared after animation ends. */
  const [animatingPinId, setAnimatingPinId] = useState<string | null>(null);
  const [animatingCommentId, setAnimatingCommentId] = useState<string | null>(null);

  const sessionRef = useRef<Session | null>(null);
  sessionRef.current = session;

  const sessionAccessRef = useRef<AccessCapabilities | null>(null);
  sessionAccessRef.current = sessionAccess;

  const requestResolveAccessInFlightRef = useRef(false);

  /** Per-session latch: invite redemption runs at most once per visit (not on every access refetch). */
  const inviteActivationLatchRef = useRef<string | null>(null);
  /** Invalidates in-flight load work when the effect re-runs (e.g. React Strict Mode). */
  const sessionLoadEffectNonceRef = useRef(0);

  const {
    authUid,
    firstName,
    displayName,
    isIdentityResolved,
    isIdentityReady,
    authReady,
    workspaceId: ctxWorkspaceId,
    workspaceName,
    authEmail,
    authPhotoUrl,
    avatarUrl,
  } = useWorkspace();

  const presenceUser = useMemo(
    () =>
      authUid
        ? {
            uid: authUid,
            displayName: displayName || "User",
            photoURL: authPhotoUrl ?? null,
          }
        : null,
    [authUid, displayName, authPhotoUrl]
  );

  usePresenceHeartbeat({
    sessionId,
    enabled: isIdentityReady && !!authUid,
    user: presenceUser,
  });

  // Single source of truth for which workspace's data we're viewing.
  // Always prefer the session's workspace (this is where writes land,
  // matching the existing listener pattern at the activity feed and
  // other realtime stores). ctxWorkspaceId is the viewer's active
  // workspace — useful as a fallback while session loads, but should
  // never override session.workspaceId once available.
  const effectiveWorkspaceId = useMemo<string | null>(
    () => session?.workspaceId ?? ctxWorkspaceId ?? null,
    [session?.workspaceId, ctxWorkspaceId]
  );

  /**
   * Clear the optimistic overlay only after the listener has had time to catch up
   * to the mutation (500ms grace). Clearing on every listener tick would wipe an
   * in-flight optimistic rename when the listener fires its initial pre-mutation
   * snapshot, causing a visible revert.
   */
  useEffect(() => {
    if (!sessionStoreState.session || !optimisticSession) return;
    const t = setTimeout(() => {
      setSession(null);
    }, 500);
    return () => clearTimeout(t);
  }, [sessionStoreState.version, optimisticSession]);
  const authUidRef = useRef<string | null>(null);
  useEffect(() => {
    authUidRef.current = authUid;
  }, [authUid]);
  const { showToast, dismissToast } = useToast();

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

  const isAnonymousViewer = authReady && !authUid;

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
    setAnonymousBundledFeedback(null);
    setIsWorkspaceMember(false);
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
  }, [searchQuery, feedbackSessionId]);

  /** In-flight description per ticket — merged into the listener-derived list to avoid flicker. */
  const pendingOptimisticDescriptionRef = useRef(
    new Map<string, { description: string | null }>()
  );
  const pendingOptimisticTitleRef = useRef(
    new Map<string, { title: string }>()
  );
  const pendingOptimisticResolvedRef = useRef(
    new Map<string, { isResolved: boolean; generation: number }>()
  );
  const pendingOptimisticAssigneeRef = useRef(
    new Map<string, { assigneeId: string | null; assigneeName: string | null; assigneeAvatarUrl: string | null }>()
  );
  const pendingOptimisticPriorityRef = useRef(
    new Map<string, { priority: "high" | "medium" | "low" | null }>()
  );
  const pendingOptimisticTagsRef = useRef(
    new Map<string, { tags: string[] | null }>()
  );
  /** Monotonic save generation per ticket; stale PATCH responses must not overwrite UI. */
  const descriptionSaveLatestGenRef = useRef(new Map<string, number>());
  const resolveSaveLatestGenRef = useRef(new Map<string, number>());

  // Forward ref so the resolve reconciliation effect (declared above
  // removeResolving) can release the in-flight button lock when the
  // Firestore listener wins the race against the PATCH response.
  const removeResolvingRef = useRef<(id: string) => void>(() => {});

  // Ticket IDs currently being deleted (or just deleted, awaiting listener confirmation).
  // Suppresses listener re-emission of a deleted ticket until the server confirms removal.
  const pendingDeletedTicketIdsRef = useRef(new Set<string>());

  // Per-ID rollback snapshots — preserves the single deleted ticket for restoration.
  const deleteRevertSnapshotsRef = useRef(new Map<string, { ticket: Feedback; index: number }>());

  // Tracks tickets whose deletion has been confirmed by the server (2xx response).
  // Combined with listener absence, gates suppression-set release so we never
  // release based on listener absence alone (which could be a transient blip).
  const confirmedDeletedTicketIdsRef = useRef(new Set<string>());

  // Optimistic-overlay version counter. Refs don't trigger re-renders, so the
  // feedback memo can't observe ref mutations directly. Every ref write that
  // should affect display bumps this counter; the memo lists it as a dep.
  const [optimisticOverlayVersion, setOptimisticOverlayVersion] = useState(0);
  const bumpOverlayVersion = useCallback(() => {
    setOptimisticOverlayVersion((v) => v + 1);
  }, []);

  useLayoutEffect(() => {
    pendingOptimisticDescriptionRef.current.clear();
    pendingOptimisticTitleRef.current.clear();
    pendingOptimisticResolvedRef.current.clear();
    pendingOptimisticAssigneeRef.current.clear();
    pendingOptimisticPriorityRef.current.clear();
    pendingOptimisticTagsRef.current.clear();
    descriptionSaveLatestGenRef.current.clear();
    resolveSaveLatestGenRef.current.clear();
    pendingDeletedTicketIdsRef.current.clear();
    deleteRevertSnapshotsRef.current.clear();
    confirmedDeletedTicketIdsRef.current.clear();
    setOptimisticOverlayVersion((v) => v + 1);
  }, [sessionId]);

  useLayoutEffect(() => {
    setResolveOptimisticMap(new Map());
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

  // Listener-driven feedback list. The realtime store is the source of truth for
  // authenticated viewers; anonymous viewers fall back to the bundle's first page
  // (since they cannot subscribe to Firestore).
  const feedbackStoreState = useFeedbackStore(sessionId);

  /**
   * Per-id optimistic overlay. Each entry is either a `Partial<Feedback>` (field
   * overrides applied on top of listener data) or `null` (treat the id as removed
   * — used for delete optimism). Each entry auto-clears 500ms after it's set so
   * the listener's authoritative value wins shortly after.
   */
  const [optimisticFeedback, setOptimisticFeedback] = useState<
    Map<string, Partial<Feedback> | null>
  >(() => new Map());
  const optimisticTimersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  /** Items that don't yet exist in the listener (extension creates, deep-link hydrate). */
  const [insertedFeedback, setInsertedFeedback] = useState<Feedback[]>([]);

  useLayoutEffect(() => {
    setOptimisticFeedback(new Map());
    setInsertedFeedback([]);
    for (const t of optimisticTimersRef.current.values()) clearTimeout(t);
    optimisticTimersRef.current.clear();
  }, [sessionId]);

  useEffect(() => {
    return () => {
      for (const t of optimisticTimersRef.current.values()) clearTimeout(t);
      optimisticTimersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (pendingOptimisticTitleRef.current.size === 0) return;
    const base = feedbackStoreState?.feedback;
    if (!base) return;
    let didCleanup = false;
    for (const [id, entry] of pendingOptimisticTitleRef.current) {
      const listenerItem = base.find((f: Feedback) => f.id === id);
      if (listenerItem && listenerItem.title === entry.title) {
        pendingOptimisticTitleRef.current.delete(id);
        didCleanup = true;
      }
    }
    if (didCleanup) bumpOverlayVersion();
  }, [feedbackStoreState?.feedback, bumpOverlayVersion]);

  // Release per-ID delete suppression only when BOTH (a) the server confirmed
  // the deletion (2xx response) and (b) the listener no longer has the item.
  // Either alone is insufficient: server-only could race a listener tick still
  // emitting the doc; listener-only could be a transient blip.
  useEffect(() => {
    if (pendingDeletedTicketIdsRef.current.size === 0) return;
    const listenerIds = new Set(
      (feedbackStoreState?.feedback ?? []).map((f: Feedback) => f.id)
    );

    let didCleanup = false;
    for (const id of [...pendingDeletedTicketIdsRef.current]) {
      if (
        confirmedDeletedTicketIdsRef.current.has(id) &&
        !listenerIds.has(id)
      ) {
        pendingDeletedTicketIdsRef.current.delete(id);
        confirmedDeletedTicketIdsRef.current.delete(id);
        deleteRevertSnapshotsRef.current.delete(id);
        didCleanup = true;
      }
    }

    if (didCleanup) bumpOverlayVersion();
  }, [feedbackStoreState?.feedback, bumpOverlayVersion]);

  useEffect(() => {
    if (pendingOptimisticResolvedRef.current.size === 0) return;
    const base = feedbackStoreState?.feedback ?? [];

    let didCleanup = false;
    for (const [id, entry] of pendingOptimisticResolvedRef.current) {
      const latestGen = resolveSaveLatestGenRef.current.get(id);
      const listenerItem = base.find((f: Feedback) => f.id === id);
      if (!listenerItem) continue;

      if (entry.generation === latestGen) {
        // Latest generation owns the overlay — release only when listener
        // catches up to our intent.
        if (listenerItem.isResolved === entry.isResolved) {
          pendingOptimisticResolvedRef.current.delete(id);
          resolveSaveLatestGenRef.current.delete(id);
          // PATCH response will see latestGen=undefined and bail early, so
          // release the in-flight button lock here to avoid stuck-disabled.
          removeResolvingRef.current(id);
          didCleanup = true;
        }
      } else {
        // Stale generation — superseded by a newer click, drop immediately.
        pendingOptimisticResolvedRef.current.delete(id);
        didCleanup = true;
      }
    }

    if (didCleanup) bumpOverlayVersion();
  }, [feedbackStoreState?.feedback, bumpOverlayVersion]);

  useEffect(() => {
    if (pendingOptimisticAssigneeRef.current.size === 0) return;
    const base = feedbackStoreState?.feedback;
    if (!base) return;
    let didCleanup = false;
    for (const [id, entry] of pendingOptimisticAssigneeRef.current) {
      const listenerItem = base.find((f: Feedback) => f.id === id);
      if (listenerItem && listenerItem.assigneeId === entry.assigneeId) {
        pendingOptimisticAssigneeRef.current.delete(id);
        didCleanup = true;
      }
    }
    if (didCleanup) bumpOverlayVersion();
  }, [feedbackStoreState?.feedback, bumpOverlayVersion]);

  useEffect(() => {
    if (pendingOptimisticPriorityRef.current.size === 0) return;
    const base = feedbackStoreState?.feedback;
    if (!base) return;
    let didCleanup = false;
    for (const [id, entry] of pendingOptimisticPriorityRef.current) {
      const listenerItem = base.find((f: Feedback) => f.id === id);
      if (listenerItem && listenerItem.priority === entry.priority) {
        pendingOptimisticPriorityRef.current.delete(id);
        didCleanup = true;
      }
    }
    if (didCleanup) bumpOverlayVersion();
  }, [feedbackStoreState?.feedback, bumpOverlayVersion]);

  useEffect(() => {
    if (pendingOptimisticTagsRef.current.size === 0) return;
    const base = feedbackStoreState?.feedback;
    if (!base) return;
    let didCleanup = false;
    for (const [id, entry] of pendingOptimisticTagsRef.current) {
      const listenerItem = base.find((f: Feedback) => f.id === id);
      if (
        listenerItem &&
        JSON.stringify(listenerItem.tags ?? null) === JSON.stringify(entry.tags)
      ) {
        pendingOptimisticTagsRef.current.delete(id);
        didCleanup = true;
      }
    }
    if (didCleanup) bumpOverlayVersion();
  }, [feedbackStoreState?.feedback, bumpOverlayVersion]);

  useEffect(() => {
    if (pendingOptimisticDescriptionRef.current.size === 0) return;
    const base = feedbackStoreState?.feedback;
    if (!base) return;
    let didCleanup = false;
    for (const [id, entry] of pendingOptimisticDescriptionRef.current) {
      const listenerItem = base.find((f: Feedback) => f.id === id);
      if (
        listenerItem &&
        (listenerItem.description ?? null) === entry.description
      ) {
        pendingOptimisticDescriptionRef.current.delete(id);
        didCleanup = true;
      }
    }
    if (didCleanup) bumpOverlayVersion();
  }, [feedbackStoreState?.feedback, bumpOverlayVersion]);

  const scheduleOptimisticClear = useCallback((id: string) => {
    const existing = optimisticTimersRef.current.get(id);
    if (existing) clearTimeout(existing);
    const handle = setTimeout(() => {
      optimisticTimersRef.current.delete(id);
      setOptimisticFeedback((prev) => {
        if (!prev.has(id)) return prev;
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
    }, 500);
    optimisticTimersRef.current.set(id, handle);
  }, []);

  const setOptimisticOverride = useCallback(
    (id: string, value: Partial<Feedback> | null) => {
      setOptimisticFeedback((prev) => {
        const next = new Map(prev);
        const existing = prev.get(id);
        if (existing && existing !== null && value !== null) {
          next.set(id, { ...existing, ...value });
        } else {
          next.set(id, value);
        }
        return next;
      });
      scheduleOptimisticClear(id);
    },
    [scheduleOptimisticClear]
  );

  // Anonymous bundle feedback is the source list when not authenticated; otherwise
  // the listener supplies it.
  const baseFeedback: Feedback[] = useMemo(() => {
    if (anonymousBundledFeedback != null) return anonymousBundledFeedback;
    return feedbackStoreState.feedback;
  }, [anonymousBundledFeedback, feedbackStoreState.feedback]);

  /**
   * Listener-driven derivation:
   *   inserted (not yet in listener) → base list → per-id overlay → action-step overlay.
   * Sorted by createdAt DESC with id tiebreaker.
   */
  const feedback: Feedback[] = useMemo(() => {
    const baseIds = new Set(baseFeedback.map((f) => f.id));
    const overlay = optimisticFeedback;
    const descriptionOverlay = pendingOptimisticDescriptionRef.current;
    const pendingDeleted = pendingDeletedTicketIdsRef.current;
    const merged: Feedback[] = [];
    const pushItem = (item: Feedback) => {
      if (pendingDeleted.has(item.id)) return; // suppress until server confirms removal
      const ov = overlay.get(item.id);
      if (ov === null) return; // treat as deleted
      let next = ov ? { ...item, ...ov } : item;
      const descRow = descriptionOverlay.get(item.id);
      if (descRow) next = { ...next, description: descRow.description };
      const titleRow = pendingOptimisticTitleRef.current.get(item.id);
      if (titleRow) next = { ...next, title: titleRow.title };
      const resolvedRow = pendingOptimisticResolvedRef.current.get(item.id);
      if (resolvedRow) next = { ...next, isResolved: resolvedRow.isResolved, status: resolvedRow.isResolved ? "resolved" : "open" };
      const assignRow = pendingOptimisticAssigneeRef.current.get(item.id);
      if (assignRow) next = { ...next, assigneeId: assignRow.assigneeId, assigneeName: assignRow.assigneeName, assigneeAvatarUrl: assignRow.assigneeAvatarUrl };
      const priorityRow = pendingOptimisticPriorityRef.current.get(item.id);
      if (priorityRow) next = { ...next, priority: priorityRow.priority };
      const tagsRow = pendingOptimisticTagsRef.current.get(item.id);
      if (tagsRow) next = { ...next, tags: tagsRow.tags };
      merged.push(next);
    };
    for (const ins of insertedFeedback) {
      if (baseIds.has(ins.id)) continue;
      pushItem(ins);
    }
    for (const item of baseFeedback) pushItem(item);
    merged.sort((a, b) => {
      const ams =
        a.createdAt && typeof (a.createdAt as Timestamp).toMillis === "function"
          ? (a.createdAt as Timestamp).toMillis()
          : 0;
      const bms =
        b.createdAt && typeof (b.createdAt as Timestamp).toMillis === "function"
          ? (b.createdAt as Timestamp).toMillis()
          : 0;
      const diff = bms - ams;
      if (diff !== 0) return diff;
      return b.id.localeCompare(a.id);
    });
    return merged;
  }, [baseFeedback, insertedFeedback, optimisticFeedback, optimisticOverlayVersion]);

  /**
   * Shim with the same {@link React.Dispatch} shape that the deleted hook exposed.
   * Translates `(prev) => next` updaters into per-id overlay patches by diffing
   * `next` against the current listener-derived list. Most call sites use the
   * `prev.map((item) => item.id === X ? {...item, fields} : item)` pattern, which
   * this shim turns into a single overlay entry for X.
   */
  const feedbackRef = useRef(feedback);
  feedbackRef.current = feedback;
  const setFeedback: React.Dispatch<React.SetStateAction<Feedback[]>> = useCallback(
    (updater) => {
      const prev = feedbackRef.current;
      const next = typeof updater === "function"
        ? (updater as (p: Feedback[]) => Feedback[])(prev)
        : updater;
      const prevById = new Map(prev.map((p) => [p.id, p]));
      const nextById = new Map(next.map((n) => [n.id, n]));
      // Removed ids → mark as deleted in overlay.
      for (const [id] of prevById) {
        if (!nextById.has(id)) setOptimisticOverride(id, null);
      }
      // Added ids → push into insertedFeedback (not yet in listener).
      for (const [id, item] of nextById) {
        if (!prevById.has(id)) {
          setInsertedFeedback((cur) => {
            if (cur.some((c) => c.id === id)) return cur;
            return [...cur, item];
          });
          continue;
        }
        // Mutated → write overlay diff.
        const before = prevById.get(id)!;
        const diff: Partial<Feedback> = {};
        let changed = false;
        const beforeAny = before as unknown as Record<string, unknown>;
        const itemAny = item as unknown as Record<string, unknown>;
        for (const k of Object.keys(itemAny)) {
          if (itemAny[k] !== beforeAny[k]) {
            (diff as Record<string, unknown>)[k] = itemAny[k];
            changed = true;
          }
        }
        if (changed) setOptimisticOverride(id, diff);
      }
    },
    [setOptimisticOverride]
  );

  // Counts derive from the overlaid list directly — no separate counts state needed.
  const feedbackTotal = feedback.length;
  const feedbackActiveCount = useMemo(
    () => feedback.filter((f) => normalizeTicketStatus(getTicketStatus(f)) === "open").length,
    [feedback]
  );
  const feedbackResolvedCount = useMemo(
    () => feedback.filter((f) => normalizeTicketStatus(getTicketStatus(f)) === "resolved").length,
    [feedback]
  );
  const feedbackLoading =
    anonymousBundledFeedback == null ? feedbackStoreState.loading : false;
  const feedbackCountsLoading = feedbackLoading;
  const isCountsSynced = !feedbackLoading;
  // Bundle-mode pagination: real flags when bundle is the source list, otherwise
  // listener-mode (which has no append-pagination — the listener delivers the
  // whole collection).
  const hasMoreFeedback =
    anonymousBundledFeedback != null ? hasMoreFeedbackPaginated : false;
  const feedbackReachedLimit = false;
  const feedbackLoadingMore = feedbackLoadingMorePaginated;
  const feedbackLoadingResolved = false;
  const feedbackLoadMoreRef: React.RefObject<HTMLDivElement | null> | undefined =
    anonymousBundledFeedback != null ? feedbackLoadMoreRefInternal : undefined;

  // Load-more for bundle-mode viewers. Calls /api/feedback (auth-aware, supports
  // anon share-token via authFetchOrAnonCookie) with the cursor and appends to
  // the bundle list. authFetchOrAnonCookie attaches Bearer for authed viewers
  // and the share-token cookie for anon viewers, so the API capability gate
  // sees the same access context as the bundle did.
  const loadMoreFeedback = useCallback(async () => {
    if (feedbackLoadingMorePaginated) return;
    if (!hasMoreFeedbackPaginated) return;
    if (!feedbackCursor) return;
    const sid = sessionId.trim();
    if (!sid) return;
    setFeedbackLoadingMorePaginated(true);
    try {
      const url = `/api/feedback?sessionId=${encodeURIComponent(sid)}&cursor=${encodeURIComponent(
        feedbackCursor
      )}&limit=50`;
      const res = await authFetchOrAnonCookie(url);
      if (!res || !res.ok) return;
      const body = await res.json().catch(() => null);
      if (body === null || typeof body !== "object") return;
      let parsed: { feedback?: unknown[]; nextCursor?: string | null; hasMore?: boolean };
      try {
        parsed = requireApiSuccessData<{
          feedback?: unknown[];
          nextCursor?: string | null;
          hasMore?: boolean;
        }>(body);
      } catch {
        return;
      }
      const rows = Array.isArray(parsed.feedback)
        ? (parsed.feedback as Record<string, unknown>[])
        : [];
      const mapped: Feedback[] = [];
      for (const row of rows) {
        const f = bundleFeedbackRowToFeedback(row, sid);
        if (f) mapped.push(f);
      }
      setAnonymousBundledFeedback((prev) => {
        const base = prev ?? [];
        const seen = new Set(base.map((b) => b.id));
        const additions = mapped.filter((m) => !seen.has(m.id));
        return [...base, ...additions];
      });
      setFeedbackCursor(typeof parsed.nextCursor === "string" ? parsed.nextCursor : null);
      setHasMoreFeedbackPaginated(parsed.hasMore === true);
    } finally {
      setFeedbackLoadingMorePaginated(false);
    }
  }, [feedbackCursor, feedbackLoadingMorePaginated, hasMoreFeedbackPaginated, sessionId]);

  // IntersectionObserver: fire loadMore when the sentinel scrolls into view.
  // Only active when bundle-mode is the source list AND there is more to load.
  useEffect(() => {
    if (anonymousBundledFeedback == null) return;
    if (!hasMoreFeedbackPaginated) return;
    const node = feedbackLoadMoreRefInternal.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMoreFeedback();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [anonymousBundledFeedback, hasMoreFeedbackPaginated, loadMoreFeedback]);

  // Listener-derived counts auto-update from optimistic overlays, so the deltas
  // the deleted hook tracked are no longer needed.
  const setSessionCountsDelta: React.Dispatch<
    React.SetStateAction<{ open: number; resolved: number; total: number }>
  > = useCallback(() => {}, []);

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
  const [resolveOptimisticMap, setResolveOptimisticMap] = useState<Map<string, boolean>>(() => new Map());
  const [resolveAffirmationKey, setResolveAffirmationKey] = useState(0);
  const [resolvingSet, setResolvingSet] = useState<Set<string>>(() => new Set());
  const [resolveToastState, setResolveToastState] = useState<ResolveToastState>("hidden");
  const [actionToastState, setActionToastState] = useState<ResolveToastState>("hidden");
  /** Tracks which ticket was being resolved so we can navigate back on PATCH failure. */
  const resolvingTicketIdRef = useRef<string | null>(null);

  const addResolving = useCallback(
    (id: string) =>
      setResolvingSet(prev => new Set([...prev, id])),
    []
  );
  const removeResolving = useCallback(
    (id: string) =>
      setResolvingSet(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      }),
    []
  );
  removeResolvingRef.current = removeResolving;
  const feedbackScopedVisual = useMemo(() => {
    if (resolveOptimisticMap.size === 0)
      return feedbackScoped;
    return feedbackScoped.map((item) => {
      const override = resolveOptimisticMap.get(item.id);
      return override !== undefined
        ? { ...item, isResolved: override }
        : item;
    });
  }, [feedbackScoped, resolveOptimisticMap]);

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
    // Default: prefer the first *open* ticket (skip resolved/processing),
    // falling back to the first ticket overall. Derived during render so no
    // setState is needed to seed the selection.
    if (stableScopedFeedback.length > 0) {
      const firstOpen = stableScopedFeedback.find(
        (f) => f.status !== "resolved" && f.status !== "processing"
      );
      return (firstOpen ?? stableScopedFeedback[0]!).id;
    }
    return null;
  }, [ticketIdFromUrl, stableScopedFeedback, selectedId, sessionId]);

  /**
   * Guarded ticket switch. If the description editor on the current ticket is
   * dirty or has an AI improve stream in flight, blocks the switch and shows a
   * toast (with a Discard action for dirty edits). Otherwise calls `commit`.
   */
  const trySwitchToTicket = useCallback(
    (newId: string | null, commit: () => void) => {
      if (newId === effectiveSelectedId) {
        commit();
        return;
      }
      const handle = actionItemsRef.current;
      if (!handle) {
        commit();
        return;
      }
      const result = handle.canLeave();
      if (result.ok) {
        commit();
        return;
      }
      if (result.reason === "streaming") {
        toast.warning("AI is still writing", {
          description: "Wait for it to finish, then try switching again.",
          duration: 4000,
        });
        return;
      }
      // reason === "dirty"
      toast.warning("Unsaved changes", {
        description: "Save your changes or discard them before switching tickets.",
        duration: 8000,
        action: {
          label: "Discard",
          onClick: () => {
            handle.discardAndClose();
            commit();
          },
        },
        cancel: { label: "Cancel", onClick: () => { /* stay on current ticket */ } },
      });
    },
    [effectiveSelectedId],
  );

  const [navPanelOpen, setNavPanelOpen] = useState(false);
  const [isTicketNavigatorOpen, setIsTicketNavigatorOpen] = useState(false);
  const [isCommentMode, setIsCommentMode] = useState(false);
  // Right-rail panel. Phase 26.1: now the per-ticket Activity timeline
  // (was the CommentPanel). Comments live in the middle panel
  // (ExecutionView). The open-triggers below are kept as-is so existing
  // entry points (comment deep-link, image comment mode) still surface
  // the rail.
  const [isActivityPanelOpen, setIsActivityPanelOpen] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [openImageInEditMode, setOpenImageInEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteSessionModalOpen, setDeleteSessionModalOpen] = useState(false);
  const [isEditingSessionTitle, setIsEditingSessionTitle] = useState(false);
  const [sessionTitleDraft, setSessionTitleDraft] = useState("");

  const preloadedScreenshotUrlsRef = useRef<Set<string>>(new Set());

  /* Escape exits comment mode and closes comment panel. */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsCommentMode(false);
        setIsActivityPanelOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  /* Tear down the persistent "tap anywhere…" toast on every comment-mode
     exit (comment placed, cancel, Escape, outside-click) — it's only
     shown on enter via handleTogglePinMode, but exits happen through
     several setIsCommentMode(false) call sites, so centralise the
     dismiss here rather than at each one. */
  useEffect(() => {
    if (!isCommentMode) dismissToast();
  }, [isCommentMode, dismissToast]);

  /* Comment mode auto-dismisses on any click that isn't the screenshot
     itself or the comment compose UI. Clicking another ticket, a header
     button, or empty chrome all drop the user out of comment mode — the
     screenshot canvas ([data-screenshot-canvas]) and the portaled draft
     popover / emoji picker ([data-comment-popover]) plus the Tiptap
     mention dropdown (.mention-dropdown) are the only safe targets. */
  useEffect(() => {
    if (!isCommentMode) return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (
        target.closest?.("[data-screenshot-canvas]") ||
        target.closest?.("[data-comment-popover]") ||
        target.closest?.(".mention-dropdown")
      ) {
        return;
      }
      setIsCommentMode(false);
    };
    // Capture phase so we win the race against React onClick handlers
    // (e.g. ticket-row select) and exit before they run.
    document.addEventListener("mousedown", onPointerDown, true);
    return () => document.removeEventListener("mousedown", onPointerDown, true);
  }, [isCommentMode]);

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
  sessionWorkspaceIdRef.current = effectiveWorkspaceId ?? undefined;

  /* Local-first: insert ticket immediately when extension creates feedback (no refetch). */
  useEffect(() => {
    if (!sessionId) return;
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{
        ticket: { id: string; title: string; description?: string; type?: string };
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
        description: ticket.description ?? null,
        type: ticket.type ?? "Feedback",
        isResolved: false,
        createdAt: null,
        clientTimestamp: Date.now(),
        screenshotId: null,
        screenshotStatus: null,
      };
      setFeedback((prev) => [newItem, ...prev.filter((x) => x.id !== newItem.id)]);
      trySwitchToTicket(ticket.id, () => {
        setSelectedId(ticket.id);
        setNewTicketId(ticket.id);
      });
    };
    window.addEventListener("ECHLY_FEEDBACK_CREATED", handler);
    return () => window.removeEventListener("ECHLY_FEEDBACK_CREATED", handler);
  }, [sessionId, effectiveWorkspaceId ?? "", setFeedback, trySwitchToTicket]);

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
      setAnonymousBundledFeedback(null);
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

      if (USE_BUNDLE) {
        // PERF R-006: cache short-circuit happens synchronously above, before
        // the identity gate. By the time we get here, no cached entry exists.
        const bundleSp = new URLSearchParams({ sessionId: sessionId.trim() });
        if (!authUidRef.current?.trim()) {
          const anonId = getViewerId(null);
          if (anonId) bundleSp.set("viewerId", anonId);
        }
        const bundleUrl = `/api/session-page-bundle?${bundleSp.toString()}`;
        const res = await authFetchOrAnonCookie(bundleUrl);
        if (cancelled || effectNonce !== sessionLoadEffectNonceRef.current) return;
        const body = await res.json().catch(() => null);
        if (cancelled || effectNonce !== sessionLoadEffectNonceRef.current) return;
        if (body === null || typeof body !== "object") {
          setAnonymousBundledFeedback(null);
          setSessionFetchError("error");
          return;
        }
        const accessRoot = body as {
          access?: { capabilities?: Partial<AccessCapabilities>; isWorkspaceMember?: boolean };
        };
        if (res.status === 403) {
          setAnonymousBundledFeedback(null);
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
          setAnonymousBundledFeedback(null);
          setAccessBlocked(false);
          setSession(null);
          setSessionAccess(null);
          setPendingResolveRequest(false);
          setSessionFetchError("not_found");
          return;
        }
        if (!res.ok) {
          setAnonymousBundledFeedback(null);
          setAccessBlocked(false);
          setSession(null);
          setSessionAccess(null);
          setPendingResolveRequest(false);
          setSessionFetchError("error");
          return;
        }
        let sessionPayload: Record<string, unknown>;
        let requestPayload: { pendingResolve?: boolean } | undefined;
        let bundleFeedbackRows: Record<string, unknown>[] | null = null;
        let bundleNextCursor: string | null = null;
        let bundleHasMore = false;
        let bundleCapabilities: Partial<AccessCapabilities> | undefined;
        let bundleIsWorkspaceMember = false;
        let bundleHasDirectSessionGrant = false;
        try {
          const inner = requireApiSuccessData<{
            session: Record<string, unknown>;
            feedback?: unknown[];
            nextCursor?: string | null;
            hasMore?: boolean;
            request?: { pendingResolve?: boolean };
            access?: {
              capabilities?: Partial<AccessCapabilities>;
              isWorkspaceMember?: boolean;
              hasDirectSessionGrant?: boolean;
            };
          }>(body);
          sessionPayload = inner.session;
          requestPayload = inner.request;
          bundleCapabilities = inner.access?.capabilities;
          bundleIsWorkspaceMember = inner.access?.isWorkspaceMember === true;
          bundleHasDirectSessionGrant = inner.access?.hasDirectSessionGrant === true;
          bundleFeedbackRows = Array.isArray(inner.feedback)
            ? (inner.feedback as Record<string, unknown>[])
            : null;
          bundleNextCursor = typeof inner.nextCursor === "string" ? inner.nextCursor : null;
          bundleHasMore = inner.hasMore === true;
        } catch {
          setAnonymousBundledFeedback(null);
          setAccessBlocked(false);
          setSession(null);
          setSessionAccess(null);
          setPendingResolveRequest(false);
          setSessionFetchError("error");
          return;
        }
        if (!sessionPayload) {
          setAnonymousBundledFeedback(null);
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
        const assembledIsWorkspaceMember =
          accessRoot.access?.isWorkspaceMember === true || bundleIsWorkspaceMember;
        setIsWorkspaceMember(assembledIsWorkspaceMember);
        const assembledHasDirectSessionGrant =
          (accessRoot.access as { hasDirectSessionGrant?: boolean } | undefined)?.hasDirectSessionGrant === true
          || bundleHasDirectSessionGrant
          || assembledIsWorkspaceMember;
        setHasDirectSessionGrant(assembledHasDirectSessionGrant);
        const assembledPendingResolve =
          requestPayload !== undefined && requestPayload.pendingResolve === true;
        setPendingResolveRequest(assembledPendingResolve);
        // Bundle-mode viewers (anon + authed link_view) get the first page of feedback
        // for first paint — they cannot subscribe to Firestore. Listener-mode viewers
        // get null here and useFeedbackStore drives the list.
        if (bundleFeedbackRows != null) {
          const mapped: Feedback[] = [];
          for (const row of bundleFeedbackRows) {
            const f = bundleFeedbackRowToFeedback(row, sessionId);
            if (f) mapped.push(f);
          }
          setAnonymousBundledFeedback(mapped);
          setFeedbackCursor(bundleNextCursor);
          setHasMoreFeedbackPaginated(bundleHasMore);
        } else {
          setAnonymousBundledFeedback(null);
          setFeedbackCursor(null);
          setHasMoreFeedbackPaginated(false);
        }
        // First-paint hydration: seed the realtime store synchronously from the bundle
        // so the next render shows session data without waiting for the onSnapshot tick.
        hydrateSessionFromBundle(sessionId.trim(), assembledSession);

        // Whitelabel branding: server-hydrated, kept in dedicated state because the
        // realtime listener will overwrite `session` without these fields.
        const resolvedBrandUrl =
          typeof (assembledSession as { ownerBrandLogoUrl?: unknown }).ownerBrandLogoUrl === "string"
            ? ((assembledSession as { ownerBrandLogoUrl: string }).ownerBrandLogoUrl)
            : null;
        const resolvedBrandEnabled =
          (assembledSession as { ownerBrandingEnabled?: unknown }).ownerBrandingEnabled === true;
        setOwnerBrandLogoUrl(resolvedBrandUrl);
        setOwnerBrandingEnabled(resolvedBrandEnabled);
        setBrandingResolved(true);
        onBrandingResolved?.({ brandLogoUrl: resolvedBrandUrl, brandingEnabled: resolvedBrandEnabled });

        /* View count: recorded server-side in GET /api/session-page-bundle (see recordSessionViewIfNewRepo). */
      } else {
        const url = `/api/sessions/${encodeURIComponent(sessionId)}`;
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
        const assembledLegacySession = {
          id: sessionId,
          ...(sessionPayload as object),
          accessLevel: requireAccessLevel(raw.accessLevel),
        } as Session;
        setSession(assembledLegacySession);
        hydrateSessionFromBundle(sessionId, assembledLegacySession);
        const resolvedBrandUrlLegacy =
          typeof (assembledLegacySession as { ownerBrandLogoUrl?: unknown }).ownerBrandLogoUrl === "string"
            ? ((assembledLegacySession as { ownerBrandLogoUrl: string }).ownerBrandLogoUrl)
            : null;
        const resolvedBrandEnabledLegacy =
          (assembledLegacySession as { ownerBrandingEnabled?: unknown }).ownerBrandingEnabled === true;
        setOwnerBrandLogoUrl(resolvedBrandUrlLegacy);
        setOwnerBrandingEnabled(resolvedBrandEnabledLegacy);
        onBrandingResolved?.({ brandLogoUrl: resolvedBrandUrlLegacy, brandingEnabled: resolvedBrandEnabledLegacy });
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
          const anonId = getViewerId(null);
          void authFetchOrAnonCookie(viewUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              viewerId: anonId || undefined,
            }),
          }).catch(() => {});
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, authReady]);

  // Listener-attach gate: only users with a direct realtime-eligible grant
  // (workspace member, session-member doc, or sessionAccess mirror) may attach
  // listeners. Authed link_view viewers are intentionally excluded — Firestore
  // rules would deny their listener attach. They receive feedback via the
  // bundle (REST mode) instead.
  const canSubscribeToFirestore = hasDirectSessionGrant;

  // Read workspaceId for listeners via a ref so it stays out of the retain-effect
  // dep array. session?.workspaceId hydrates from the bundle after first mount;
  // putting it in the dep array would detach + re-attach the same listener,
  // firing the listener's error path twice on permission-denied.
  const workspaceIdForListenersRef = useRef<string>("");
  useEffect(() => {
    workspaceIdForListenersRef.current = (effectiveWorkspaceId ?? "").trim();
  }, [effectiveWorkspaceId]);

  // Realtime session doc subscription. Gated on identity AND session-level access;
  // auto-detaches on sign-out via the module-init auth observer in sessionStore.
  useEffect(() => {
    if (!isIdentityReady) return;
    if (!canSubscribeToFirestore) return;
    const sid = sessionId?.trim();
    const wid = (workspaceIdForListenersRef.current ?? "").trim();
    if (!sid || !wid) return;
    const release = retainSessionListener(sid, wid);
    return () => release();
  }, [isIdentityReady, canSubscribeToFirestore, sessionId, effectiveWorkspaceId]);

  // Realtime feedback subscription. Same gating as the session listener;
  // anonymous and unauthorized authed viewers fall through to the REST/bundle path.
  useEffect(() => {
    if (!isIdentityReady) return;
    if (!canSubscribeToFirestore) return;
    const sid = sessionId?.trim();
    const wid = (workspaceIdForListenersRef.current ?? "").trim();
    if (!sid || !wid) return;
    const release = retainFeedbackListener(sid, wid);
    return () => release();
  }, [isIdentityReady, canSubscribeToFirestore, sessionId, effectiveWorkspaceId]);

  // Realtime presence subscription. Same gating as the other listeners.
  // The store filters stale heartbeats client-side and runs a 15s GC interval
  // so closed-tab ghosts disappear automatically.
  useEffect(() => {
    if (!isIdentityReady) return;
    if (!canSubscribeToFirestore) return;
    const sid = sessionId?.trim();
    if (!sid) return;
    const release = retainPresenceListener(sid);
    return () => release();
  }, [isIdentityReady, canSubscribeToFirestore, sessionId]);

  // Realtime access-requests subscription — workspace members only. Drives the
  // red-dot badge on the Share button live (no bundle-seeded count, no manual
  // clear on modal open).
  useEffect(() => {
    if (!isIdentityReady) return;
    if (!isWorkspaceMember) return;
    const sid = sessionId?.trim();
    if (!sid) return;
    const release = retainAccessRequestsListener(sid);
    return () => release();
  }, [isIdentityReady, isWorkspaceMember, sessionId]);

  // Deletion detection: redirect to /dashboard once the listener confirms the session
  // doc is gone (exists === false after a successful initial load).
  useEffect(() => {
    if (sessionStoreState.loading) return;
    if (sessionStoreState.exists) return;
    if (sessionStoreState.error) return;
    showToast("Session was deleted");
    router.push("/dashboard");
  }, [
    sessionStoreState.loading,
    sessionStoreState.exists,
    sessionStoreState.error,
    router,
    showToast,
  ]);

  // Track when canView was first confirmed so we can distinguish "just landed
  // on the page during a write propagation race" from "real mid-view revocation."
  const canViewConfirmedAtRef = useRef<number | null>(null);
  useEffect(() => {
    if (sessionAccess?.canView && canViewConfirmedAtRef.current === null) {
      canViewConfirmedAtRef.current = Date.now();
    }
  }, [sessionAccess?.canView]);

  // Mid-view revocation: when any listener detects permission-denied AFTER its
  // initial load, redirect with a toast. If it fires within 2s of canView being
  // confirmed, it is more likely a write-propagation race (member doc + mirror
  // not yet visible to a fresh listener) than a real revocation — show a softer
  // toast and skip the redirect so a refresh recovers.
  useEffect(() => {
    const revoked =
      sessionStoreState.accessRevoked ||
      feedbackStoreState.accessRevoked ||
      commentsStoreState.accessRevoked ||
      presenceStoreState.accessRevoked;
    if (!revoked) return;

    const confirmedAt = canViewConfirmedAtRef.current;
    const isPropagationRace =
      confirmedAt !== null && Date.now() - confirmedAt < 2000;

    if (isPropagationRace) {
      showToast("Access is still propagating. Please refresh in a moment.");
      return;
    }

    showToast("Your access to this session was removed.");
    router.push("/dashboard");
  }, [
    sessionStoreState.accessRevoked,
    feedbackStoreState.accessRevoked,
    commentsStoreState.accessRevoked,
    presenceStoreState.accessRevoked,
    router,
    showToast,
    sessionAccess?.canView,
  ]);

  // Deep link: when ?ticket= is present, select that ticket and open detail panel.
  const hasAppliedTicketParam = useRef(false);
  const hasAppliedEditParam = useRef(false);
  const hasAppliedCommentParam = useRef(false);
  const deepLinkHydrateAttempted = useRef<string | null>(null);
  const deepLinkSidebarExpansionDone = useRef<string | null>(null);

  useEffect(() => {
    deepLinkHydrateAttempted.current = null;
    hasAppliedTicketParam.current = false;
    hasAppliedEditParam.current = false;
    hasAppliedCommentParam.current = false;
    deepLinkSidebarExpansionDone.current = null;
  }, [sessionId, ticketIdFromUrl, commentIdFromUrl]);

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
        const url = `/api/tickets/${encodeURIComponent(ticketIdFromUrl)}`;
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
    if (editFromUrl && !hasAppliedEditParam.current) {
      hasAppliedEditParam.current = true;
      setTimeout(() => {
        setIsImageExpanded(true);
        setOpenImageInEditMode(true);
      }, 300);
    }
  }, [ticketIdFromUrl, deepLinkTicketInList, editFromUrl]);

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
      if (!isIdentityResolved) return;
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
    if (!isIdentityResolved) return;
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
    sendComment,
    sendReply,
    sendPinComment,
    sendTextComment,
    updatePinPosition,
    updateComment,
    deleteComment,
    handleReactionsChanged,
    participants,
  } = useFeedbackDetailController({
    sessionId,
    feedbackId: effectiveSelectedId,
    canResolve: sessionAccess?.canResolve === true,
    canSubscribeToFirestore,
    onRequestResolveAccess: openRequestAccessModal,
  });

  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  /** Pin whose inline thread popover is open (does not open right panel). */
  const [activePinIdForPopover, setActivePinIdForPopover] = useState<string | null>(null);

  // Phase 26.7: clicking a screenshot pin scrolls the matching comment
  // into view in the middle panel and briefly highlights it (instead of
  // opening the right rail). Auto-clears after 2s to match the CSS pulse.
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);
  useEffect(() => {
    if (!highlightedCommentId) return;
    const timer = setTimeout(() => setHighlightedCommentId(null), 2000);
    return () => clearTimeout(timer);
  }, [highlightedCommentId]);

  // Deep link: when ?comment= is present, open the comment panel and focus that thread once the
  // target ticket is selected. Same pattern as the ?ticket= deep link above.
  useEffect(() => {
    if (!commentIdFromUrl) return;
    if (hasAppliedCommentParam.current) return;
    if (!effectiveSelectedId) return;
    if (ticketIdFromUrl && effectiveSelectedId !== ticketIdFromUrl) return;
    hasAppliedCommentParam.current = true;
    setIsActivityPanelOpen(true);
    setActiveThreadId(commentIdFromUrl);
    // Phase 26.7: a shared ?comment= link also scrolls + highlights the
    // comment in the middle panel, matching pin-click navigation.
    setHighlightedCommentId(commentIdFromUrl);
    const url = new URL(window.location.href);
    if (url.searchParams.has("comment")) {
      url.searchParams.delete("comment");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, [commentIdFromUrl, effectiveSelectedId, ticketIdFromUrl]);

  const triggerPinAnimation = useCallback((commentId: string) => {
    setAnimatingPinId(commentId);
    setTimeout(() => setAnimatingPinId(null), 900);
  }, []);

  // Phase 26.8: the Activity button is a toggle — first click opens
  // the rail, second click closes it. Closing also clears any
  // selected thread so the panel doesn't stay open via activeThreadId.
  const handleToggleActivity = useCallback(() => {
    setIsActivityPanelOpen((prev) => {
      const next = !prev;
      if (!next) setActiveThreadId(null);
      return next;
    });
  }, []);

  // Phase 26.7: the MapPin screenshot action toggles click-to-place
  // pin mode. Purely about pin mode — it does NOT open the activity
  // rail (that's the Activity button's job now).
  const handleTogglePinMode = useCallback(() => {
    // Side-effects (showToast/dismissToast each setState on ToastProvider)
    // must run in the event handler, NOT inside the setIsCommentMode
    // updater — React runs updaters during render, so a toast call there
    // is a setState-in-render. It's a plain boolean toggle, so derive
    // `next` from current state directly and fire the toast first.
    const next = !isCommentMode;
    // Same bottom toast as before — but persistent now: it stays up for
    // the whole comment-mode session instead of auto-dismissing after
    // 3s, and is cleared the moment comment mode exits (comment placed,
    // cancelled, Escape, or outside-click — see the dismiss effect).
    if (next) {
      showToast("Tap anywhere on the image to leave a comment", { persist: true });
    } else {
      dismissToast();
    }
    setIsCommentMode(next);
  }, [isCommentMode, showToast, dismissToast]);

  /* ================= SAVE TITLE (optimistic update, then PATCH) ================= */

  const saveTitle = async (newTitle: string): Promise<void> => {
    if (!effectiveSelectedId || newTitle.trim() === "") return;
    if (!isIdentityResolved) return;
    const trimmed = newTitle.trim();
    const previousTitle = selectedItem?.title;
    setFeedback((prev) =>
      prev.map((item) =>
        item.id === effectiveSelectedId ? { ...item, title: trimmed } : item
      )
    );
    pendingOptimisticTitleRef.current.set(effectiveSelectedId, { title: trimmed });
    bumpOverlayVersion();
    try {
      const res = await authFetch(`/api/tickets/${effectiveSelectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });
      if (!res) {
        pendingOptimisticTitleRef.current.delete(effectiveSelectedId);
        bumpOverlayVersion();
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
        pendingOptimisticTitleRef.current.delete(effectiveSelectedId);
        bumpOverlayVersion();
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
        pendingOptimisticTitleRef.current.delete(effectiveSelectedId);
        bumpOverlayVersion();
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
        prev.map((item) => {
          if (item.id !== effectiveSelectedId) return item;
          const { createdAt, updatedAt, ...safePayload } = ticketPayload as Record<string, unknown>;
          return { ...item, ...safePayload };
        })
      );
      broadcastTicketUpdated(ticketPayload);
    } catch (err) {
      console.error("[ECHLY] saveTitle failed", err);
      showToast("Could not save title");
      pendingOptimisticTitleRef.current.delete(effectiveSelectedId);
      bumpOverlayVersion();
      setFeedback((prev) =>
        prev.map((item) =>
          item.id === effectiveSelectedId
            ? { ...item, title: previousTitle ?? trimmed }
            : item
        )
      );
    }
  };

  /* ================= SAVE DESCRIPTION (optimistic update, then PATCH) ================= */

  const saveDescription = async (description: string) => {
    if (!effectiveSelectedId) return;
    if (!isIdentityResolved) return;
    const ticketId = effectiveSelectedId;
    const currentDescription = selectedItem?.description ?? null;
    const nextDescription = description.trim().length > 0 ? description : null;
    if ((currentDescription ?? "") === (nextDescription ?? "")) return;

    const previousDescription = currentDescription;
    const priorGen = descriptionSaveLatestGenRef.current.get(ticketId) ?? 0;
    const myGen = priorGen + 1;
    descriptionSaveLatestGenRef.current.set(ticketId, myGen);
    pendingOptimisticDescriptionRef.current.set(ticketId, { description: nextDescription });
    bumpOverlayVersion();

    setFeedback((prev) =>
      prev.map((item) =>
        item.id === ticketId ? { ...item, description: nextDescription } : item
      )
    );

    await (async () => {
      const rollbackIfLatest = () => {
        if (descriptionSaveLatestGenRef.current.get(ticketId) !== myGen) return;
        pendingOptimisticDescriptionRef.current.delete(ticketId);
        bumpOverlayVersion();
        setFeedback((prev) =>
          prev.map((item) =>
            item.id === ticketId
              ? { ...item, description: previousDescription }
              : item
          )
        );
      };

      try {
        const res = await authFetch(`/api/tickets/${ticketId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: nextDescription ?? "" }),
        });
        if (!res) {
          rollbackIfLatest();
          if (descriptionSaveLatestGenRef.current.get(ticketId) === myGen) {
            showToast("Could not save description");
          }
          return;
        }
        const raw = await res.json();
        if (!res.ok) {
          rollbackIfLatest();
          if (descriptionSaveLatestGenRef.current.get(ticketId) === myGen) {
            if (responseIsPermissionDenied(res)) notifyPermissionDenied(showToast);
            else showToast("Could not save description");
          }
          return;
        }
        let ticketPayload: TicketFromApi;
        try {
          ticketPayload = requireApiSuccessData<{ ticket: TicketFromApi }>(raw).ticket;
        } catch {
          rollbackIfLatest();
          if (descriptionSaveLatestGenRef.current.get(ticketId) === myGen) {
            showToast("Could not save description");
          }
          return;
        }
        if (descriptionSaveLatestGenRef.current.get(ticketId) !== myGen) {
          return;
        }
        setFeedback((prev) =>
          prev.map((item) => {
            if (item.id !== ticketId) return item;
            const { createdAt, updatedAt, ...safePayload } = ticketPayload as Record<string, unknown>;
            // Skip re-writing description if it matches optimistic value, to
            // avoid re-parsing the markdown / hex chips and causing a flicker.
            const { description: serverDescription, ...nonDescriptionFields } =
              safePayload as { description?: string | null } & Record<string, unknown>;
            const shouldUpdateDescription = serverDescription !== item.description;
            return {
              ...item,
              ...nonDescriptionFields,
              ...(shouldUpdateDescription ? { description: serverDescription } : {}),
            };
          })
        );
        broadcastTicketUpdated(ticketPayload);
      } catch (err) {
        console.error("[ECHLY] saveDescription failed", err);
        rollbackIfLatest();
        if (descriptionSaveLatestGenRef.current.get(ticketId) === myGen) {
          showToast("Could not save description");
        }
      }
    })();
  };

  const saveTags = async (tags: string[]) => {
    if (!effectiveSelectedId) return;
    if (!isIdentityResolved) return;
    const ticketId = effectiveSelectedId;
    const nextTags = Array.isArray(tags) ? tags : null;
    const previous = selectedItem?.tags ?? null;
    setFeedback((prev) =>
      prev.map((item) =>
        item.id === ticketId ? { ...item, tags: nextTags } : item
      )
    );
    pendingOptimisticTagsRef.current.set(ticketId, { tags: nextTags });
    bumpOverlayVersion();
    try {
      const res = await authFetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags }),
      });
      if (!res) {
        pendingOptimisticTagsRef.current.delete(ticketId);
        bumpOverlayVersion();
        setFeedback((prev) =>
          prev.map((item) =>
            item.id === ticketId ? { ...item, tags: previous } : item
          )
        );
        showToast("Could not save tags");
        return;
      }
      const rawTags = await res.json();
      if (!res.ok) {
        pendingOptimisticTagsRef.current.delete(ticketId);
        bumpOverlayVersion();
        setFeedback((prev) =>
          prev.map((item) =>
            item.id === ticketId ? { ...item, tags: previous } : item
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
        pendingOptimisticTagsRef.current.delete(ticketId);
        bumpOverlayVersion();
        setFeedback((prev) =>
          prev.map((item) =>
            item.id === ticketId ? { ...item, tags: previous } : item
          )
        );
        showToast("Could not save tags");
        return;
      }
      setFeedback((prev) =>
        prev.map((item) => {
          if (item.id !== ticketId) return item;
          const { createdAt, updatedAt, ...safePayload } = ticketPayload as Record<string, unknown>;
          return { ...item, ...safePayload };
        })
      );
      broadcastTicketUpdated(ticketPayload);
    } catch (err) {
      console.error("[ECHLY] saveTags failed", err);
      showToast("Could not save tags");
      pendingOptimisticTagsRef.current.delete(ticketId);
      bumpOverlayVersion();
      setFeedback((prev) =>
        prev.map((item) =>
          item.id === ticketId ? { ...item, tags: previous } : item
        )
      );
    }
  };

  const saveResolved = (
    isResolved: boolean,
    onSuccess?: () => void,
    onError?: () => void
  ): boolean => {
    const ticketId = effectiveSelectedId;
    if (!ticketId) return false;

    return safeResolveAction({
      canResolve: sessionAccessRef.current?.canResolve === true,
      triggerRequestAccessFlow: openRequestAccessModal,
      run: () => {
        if (!isIdentityResolved) return;
        // Read from listener-source state, not optimistic-merged feedback —
        // rapid clicks must not capture stale optimistic values.
        const serverFeedback = feedbackStoreState?.feedback ?? [];
        const previousResolved = Boolean(
          serverFeedback.find((i) => i.id === ticketId)?.isResolved
        );

        const myGen = (resolveSaveLatestGenRef.current.get(ticketId) ?? 0) + 1;
        resolveSaveLatestGenRef.current.set(ticketId, myGen);

        addResolving(ticketId);
        pendingOptimisticResolvedRef.current.set(ticketId, {
          isResolved,
          generation: myGen,
        });
        bumpOverlayVersion();
        if (isResolved) {
          setResolveAffirmationKey((k) => k + 1);
        }

        // No setFeedback overlay write here — the per-ID ref overlay (above)
        // is the single source of truth for optimistic resolve state and the
        // version counter ensures the memo recomputes. Going through the shim
        // would route through the 500ms scheduleOptimisticClear timer which
        // can race rapid clicks.

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
            if (resolveSaveLatestGenRef.current.get(ticketId) !== myGen) {
              return;
            }
            removeResolving(ticketId);
            pendingOptimisticResolvedRef.current.delete(ticketId);
            bumpOverlayVersion();
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
            const res = await authFetch(`/api/tickets/${ticketId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ isResolved }),
            });
            if (!res || !res.ok) {
              rollbackResolved();
              onError?.();
              if (res && responseIsPermissionDenied(res)) notifyPermissionDenied(showToast);
              return;
            }
            const rawResolve = await res.json();
            let ticketPayload: TicketFromApi;
            try {
              ticketPayload = requireApiSuccessData<{ ticket: TicketFromApi }>(rawResolve).ticket;
            } catch {
              rollbackResolved();
              onError?.();
              return;
            }
            if (perf) {
              const clientTotal = performance.now() - t0;
              console.log("[ECHLY_PERF] CLIENT END (resolve ticket)", clientTotal.toFixed(1), "ms");
              console.log(
                "[ECHLY_PERF] Full breakdown: compare CLIENT total above with authFetch TOKEN/NETWORK lines and server [Resolve] logs for API vs Firestore."
              );
            }
            // Only the latest generation owns cleanup; older PATCHes must not
            // wipe optimistic state for a newer in-flight click.
            if (resolveSaveLatestGenRef.current.get(ticketId) !== myGen) {
              return;
            }
            removeResolving(ticketId);
            setFeedback((prev) =>
              prev.map((item) => {
                if (item.id !== ticketId) return item;
                const { createdAt, updatedAt, ...safePayload } = ticketPayload as Record<string, unknown>;
                return { ...item, ...safePayload };
              })
            );
            broadcastTicketUpdated(ticketPayload);
            onSuccess?.();
          } catch (err) {
            console.error("[ECHLY] saveResolved failed", err);
            rollbackResolved();
            onError?.();
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

    // Store for potential rollback on PATCH failure
    resolvingTicketIdRef.current = ticketId;

    // Navigate immediately (optimistic) before PATCH completes
    if (navigateToId) {
      setSelectedId(navigateToId);
    } else {
      showToast("No more feedback");
    }

    saveResolved(
      true,
      () => {
        // PATCH succeeded — silent (no toast)
      },
      () => {
        // PATCH failed — show error toast and navigate back to original ticket
        setResolveToastState("error");
        const originalId = resolvingTicketIdRef.current;
        if (originalId && originalId === ticketId) {
          setSelectedId(originalId);
          resolvingTicketIdRef.current = null;
        }
      }
    );
  };

  const handleAssigned = useCallback(
    (assigneeId: string | null, assigneeName: string | null, assigneeAvatarUrl: string | null) => {
      const ticketId = effectiveSelectedId;
      if (!ticketId) return;
      setFeedback((prev) =>
        prev.map((item) =>
          item.id === ticketId
            ? { ...item, assigneeId, assigneeName, assigneeAvatarUrl }
            : item
        )
      );
      pendingOptimisticAssigneeRef.current.set(ticketId, {
        assigneeId: assigneeId ?? null,
        assigneeName: assigneeName ?? null,
        assigneeAvatarUrl: assigneeAvatarUrl ?? null,
      });
      bumpOverlayVersion();
    },
    [effectiveSelectedId, setFeedback, bumpOverlayVersion]
  );

  const handlePriorityChanged = useCallback(
    (priority: "high" | "medium" | "low" | null) => {
      const ticketId = effectiveSelectedId;
      if (!ticketId) return;
      setFeedback((prev) =>
        prev.map((item) =>
          item.id === ticketId ? { ...item, priority } : item
        )
      );
      pendingOptimisticPriorityRef.current.set(ticketId, { priority: priority ?? null });
      bumpOverlayVersion();
    },
    [effectiveSelectedId, setFeedback, bumpOverlayVersion]
  );

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
    if (!isIdentityResolved) return;
    const previousTitle = s.title ?? "";
    setSession((prev: Session | null) => {
      const base = prev ?? sessionStoreState.session;
      if (!base) return prev;
      return { ...base, title: safeTitle } as Session;
    });
    pendingSessionTitleRef.current = safeTitle;
    setSessionTitleDraft(safeTitle);
    setIsEditingSessionTitle(false);
    try {
      const res = await authFetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: safeTitle }),
      });
      if (!res) {
        setSession((prev: Session | null) => {
          const base = prev ?? sessionStoreState.session;
          if (!base) return prev;
          return { ...base, title: previousTitle } as Session;
        });
        pendingSessionTitleRef.current = null;
        setSessionTitleDraft((previousTitle || "").trim());
        showToast("Could not save session name");
        return;
      }
      const rawSessionPatch = await res.json();
      if (!res.ok) {
        if (responseIsPermissionDenied(res)) notifyPermissionDenied(showToast);
        else showToast("Could not save session name");
        setSession((prev: Session | null) => {
          const base = prev ?? sessionStoreState.session;
          if (!base) return prev;
          return { ...base, title: previousTitle } as Session;
        });
        pendingSessionTitleRef.current = null;
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
        setSession((prev: Session | null) => {
          const base = prev ?? sessionStoreState.session;
          if (!base) return prev;
          return { ...base, title: previousTitle } as Session;
        });
        pendingSessionTitleRef.current = null;
        setSessionTitleDraft((previousTitle || "").trim());
        return;
      }
      setSession((prev: Session | null) => {
        if (!prev) return prev;
        const { createdAt, updatedAt, ...safePayload } = patchSession as Record<string, unknown>;
        return { ...prev, ...safePayload } as Session;
      });
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
      setSession((prev: Session | null) => {
        const base = prev ?? sessionStoreState.session;
        if (!base) return prev;
        return { ...base, title: previousTitle } as Session;
      });
      pendingSessionTitleRef.current = null;
      setSessionTitleDraft((previousTitle || "").trim());
    }
  }, [sessionId, sessionTitleDraft, isIdentityResolved, showToast, sessionStoreState.session]);

  const handleSidebarRenameTitle = useCallback(async (newTitle: string) => {
    const safeTitle = newTitle.trim();
    if (!safeTitle || safeTitle === session?.title) return;
    const previousTitle = session?.title ?? '';
    setSession((prev: Session | null) => {
      const base = prev ?? sessionStoreState.session;
      if (!base) return prev;
      return { ...base, title: safeTitle } as Session;
    });
    pendingSessionTitleRef.current = safeTitle;
    try {
      const res = await authFetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: safeTitle }),
      });
      if (!res || !res.ok) {
        pendingSessionTitleRef.current = null;
        setSession((prev: Session | null) => {
          const base = prev ?? sessionStoreState.session;
          if (!base) return prev;
          return { ...base, title: previousTitle } as Session;
        });
        showToast('Could not save session name');
        return;
      }
      const raw = await res.json();
      const apiTitle = (raw?.data?.session?.title ?? raw?.session?.title ?? safeTitle) as string;
      setSession((prev: Session | null) => {
        const base = prev ?? sessionStoreState.session;
        if (!base) return prev;
        return { ...base, title: apiTitle } as Session;
      });
    } catch {
      pendingSessionTitleRef.current = null;
      setSession((prev: Session | null) => {
        const base = prev ?? sessionStoreState.session;
        if (!base) return prev;
        return { ...base, title: previousTitle } as Session;
      });
      showToast('Could not save session name');
    }
  }, [sessionId, session?.title, showToast, sessionStoreState.session]);

  const handleMarkAllResolved = useCallback(() => {
    safeResolveAction({
      canResolve: sessionAccessRef.current?.canResolve === true,
      triggerRequestAccessFlow: openRequestAccessModal,
      run: () => {
        if (!isIdentityResolved) return;
        void (async () => {
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
        if (!isIdentityResolved) return;
        void (async () => {
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
    if (!isIdentityResolved) return;

    // Request deduplication — if this ticket is already being deleted, ignore.
    if (pendingDeletedTicketIdsRef.current.has(id)) return;

    // Snapshot from listener-source state (not the optimistic-merged list) so
    // the rollback reflects the true server position.
    const listenerFeedback = feedbackStoreState?.feedback ?? [];
    const ticketIndex = listenerFeedback.findIndex((i: Feedback) => i.id === id);
    const ticket = ticketIndex !== -1 ? listenerFeedback[ticketIndex] : undefined;
    if (!ticket) return;

    const wasResolved = Boolean(ticket.isResolved);
    const selectionBeforeDelete = effectiveSelectedId;

    // Determine next selection BEFORE we mutate the list.
    const nextSelected =
      selectionBeforeDelete === id
        ? feedback.filter((item) => item.id !== id)[0]?.id ?? null
        : selectionBeforeDelete;

    // Add to suppression set FIRST (before any state mutation) so listener ticks
    // mid-flight can't re-emit this ticket.
    pendingDeletedTicketIdsRef.current.add(id);

    // Snapshot ONLY this ticket and its index — not the whole list — so concurrent
    // deletes don't overwrite each other's rollback state.
    deleteRevertSnapshotsRef.current.set(id, { ticket, index: ticketIndex });
    bumpOverlayVersion();

    setSessionCountsDelta((prev) => ({
      open: prev.open + (wasResolved ? 0 : -1),
      resolved: prev.resolved + (wasResolved ? -1 : 0),
      total: prev.total - 1,
    }));
    setFeedback((prev) => prev.filter((item) => item.id !== id));
    setSelectedId(nextSelected);
    setShowDeleteModal(false);

    const rollbackDelete = () => {
      const snapshot = deleteRevertSnapshotsRef.current.get(id);
      if (snapshot) {
        setFeedback((prev) => {
          if (prev.some((item) => item.id === id)) return prev;
          const next = [...prev];
          next.splice(Math.min(snapshot.index, next.length), 0, snapshot.ticket);
          return next;
        });
      }
      setSessionCountsDelta((prev) => ({
        open: prev.open + (wasResolved ? 0 : 1),
        resolved: prev.resolved + (wasResolved ? 1 : 0),
        total: prev.total + 1,
      }));
      setSelectedId(selectionBeforeDelete);
      pendingDeletedTicketIdsRef.current.delete(id);
      confirmedDeletedTicketIdsRef.current.delete(id);
      deleteRevertSnapshotsRef.current.delete(id);
      bumpOverlayVersion();
    };

    try {
      const res = await authFetch(`/api/tickets/${id}`, { method: "DELETE" });
      if (!res) {
        rollbackDelete();
        showToast("Could not delete ticket");
        return;
      }
      // 404 → already deleted server-side; treat as success.
      if (res.status === 404) {
        confirmedDeletedTicketIdsRef.current.add(id);
        deleteRevertSnapshotsRef.current.delete(id);
        bumpOverlayVersion();
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
      // Success: mark server-confirmed and drop the rollback snapshot. The
      // suppression-set entry stays until the listener also drops the doc —
      // the release effect waits on the dual confirmation.
      confirmedDeletedTicketIdsRef.current.add(id);
      deleteRevertSnapshotsRef.current.delete(id);
      bumpOverlayVersion();
    } catch (err) {
      console.error("[ECHLY] handleDeleteFeedback failed", err);
      rollbackDelete();
      if (!handlePermissionError(err, showToast)) {
        showToast("Could not delete ticket");
      }
    }
  };

  const handleScreenshotUpdate = useCallback(
    async (newId: string) => {
      const ticketId = effectiveSelectedId;
      if (!ticketId) return;
      // Optimistic local update so useScreenshotUrl re-resolves the new image
      setFeedback((prev) =>
        prev.map((f) => (f.id === ticketId ? { ...f, screenshotId: newId } : f))
      );
      try {
        await authFetch(`/api/tickets/${ticketId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ screenshotId: newId }),
        });
      } catch {
        // Non-critical — local state is already updated; the screenshotId is persisted
        // in Storage by the upload API regardless. A full reload will sync DB state.
      }
    },
    [effectiveSelectedId, setFeedback]
  );

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
        brandLogoUrl={ownerBrandLogoUrl}
        brandingEnabled={ownerBrandingEnabled}
      />
    );
  }

  if (sessionFetchError === "forbidden") {
    return (
      <div className="flex h-full min-h-[50vh] w-full items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h1 className="text-[20px] font-semibold text-[var(--text-primary-strong)]">
            Access denied
          </h1>
          <p className="mt-3 text-[14px] text-[var(--text-secondary-soft)]">
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
          <h1 className="text-[20px] font-semibold text-[var(--text-primary-strong)]">
            Session not found
          </h1>
          <p className="mt-3 text-[14px] text-[var(--text-secondary-soft)]">
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
          <h1 className="text-[20px] font-semibold text-[var(--text-primary-strong)]">
            Couldn&apos;t load session
          </h1>
          <p className="mt-3 text-[14px] text-[var(--text-secondary-soft)]">
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
          <div className="exec-skeleton" aria-busy="true" aria-label="Loading ticket">
            {/* Eyebrow row: position pill + status pill */}
            <div className="exec-skel-eyebrow">
              <div className="exec-skel-status-pos skel-block" />
              <div className="exec-skel-status-pill skel-block" />
            </div>
            {/* Title */}
            <div className="exec-skel-title skel-block" />
            {/* Action buttons row */}
            <div className="exec-skel-actions">
              <div className="exec-skel-btn exec-skel-btn-1 skel-block" />
              <div className="exec-skel-btn exec-skel-btn-2 skel-block" />
              <div className="exec-skel-btn exec-skel-btn-3 skel-block" />
              <div className="exec-skel-btn exec-skel-btn-4 skel-block" />
              <div className="exec-skel-delete skel-block" />
            </div>
            {/* Screenshot */}
            <div className="exec-skel-screenshot" />
            {/* Action steps */}
            <div className="exec-skel-steps-section">
              <div className="exec-skel-steps-label skel-block" />
              <div className="exec-skel-step-row">
                <div className="exec-skel-step-num skel-block" />
                <div className="exec-skel-step-text exec-skel-step-text-1 skel-block" />
              </div>
              <div className="exec-skel-step-row">
                <div className="exec-skel-step-num skel-block" />
                <div className="exec-skel-step-text exec-skel-step-text-2 skel-block" />
              </div>
              <div className="exec-skel-step-row">
                <div className="exec-skel-step-num skel-block" />
                <div className="exec-skel-step-text exec-skel-step-text-3 skel-block" />
              </div>
              <div className="exec-skel-step-add skel-block" />
            </div>
            {/* Tags */}
            <div className="exec-skel-tags-section">
              <div className="exec-skel-tags-label skel-block" />
              <div className="exec-skel-tags-row">
                <div className="exec-skel-tag exec-skel-tag-1 skel-block" />
                <div className="exec-skel-tag exec-skel-tag-2 skel-block" />
                <div className="exec-skel-tag exec-skel-tag-3 skel-block" />
                <div className="exec-skel-tag exec-skel-tag-4 skel-block" />
              </div>
            </div>
          </div>
        );
      }
      return (
        <div className="mt-16">
          <div className="text-[16px] font-medium text-[var(--text-primary-strong)]">
            No feedback yet
          </div>
          <div className="mt-2 text-[14px] text-[var(--text-tertiary)]">
            Capture feedback to start organizing insights.
          </div>
        </div>
      );
    }
    return (
      <ExecutionView
        item={selectedItem}
        actionItemsRef={actionItemsRef}
        resolveAffirmationKey={resolveAffirmationKey}
        onSaveTitle={isWorkspaceMember ? saveTitle : undefined}
        onResolvedChange={handleResolvedChange}
        resolveSubmitting={resolvingSet.has(effectiveSelectedId ?? "")}
        onSaveDescription={isWorkspaceMember ? saveDescription : undefined}
        onSaveTags={isWorkspaceMember ? saveTags : undefined}
        setIsImageExpanded={setIsImageExpanded}
        onEdit={() => {
          setOpenImageInEditMode(true);
          setIsImageExpanded(true);
        }}
        canEdit={isWorkspaceMember && Boolean(selectedItem?.screenshotId)}
        isCommentMode={isCommentMode}
        onTogglePinMode={handleTogglePinMode}
        onExitCommentMode={() => setIsCommentMode(false)}
        onToggleActivity={handleToggleActivity}
        isActivityPanelOpen={isActivityPanelOpen}
        highlightedCommentId={highlightedCommentId}
        impactScore={(selectedItem as { impactScore?: number } | null)?.impactScore}
        comments={comments}
        loadingComments={loadingComments}
        participants={participants}
        sendPinComment={sendPinComment}
        sendReply={sendReply}
        sendComment={sendComment}
        deleteComment={deleteComment}
        onReactionsChanged={handleReactionsChanged}
        currentUserId={authUid}
        currentUserName={displayName || undefined}
        currentUserInitial={firstName ? firstName.charAt(0).toUpperCase() : "?"}
        currentUserAvatarUrl={avatarUrl || authPhotoUrl || undefined}
        activePinIdForPopover={activePinIdForPopover}
        activeThreadId={activeThreadId}
        onPinClick={(commentId: string) => {
          // Phase 26.7: pin clicks now navigate to the middle-panel
          // comment (scroll + brief highlight) instead of opening the
          // right rail. The pin pulse animation is preserved.
          setActivePinIdForPopover(null);
          setHighlightedCommentId(commentId);
          setAnimatingCommentId(commentId);
          setTimeout(() => setAnimatingCommentId(null), 1100);
        }}
        onOpenThreadPanel={(id) => {
          setActiveThreadId(id);
          setActivePinIdForPopover(null);
        }}
        onCloseInlinePopover={() => setActivePinIdForPopover(null)}
        updateComment={updateComment}
        sendTextComment={sendTextComment}
        onCommentPlaced={(newCommentId?: string) => {
          // Exit comment mode once the comment lands. Do NOT set
          // activeThreadId here — that opens the right Activity rail
          // (see grid/aside gated on `activeThreadId != null`), which
          // the user doesn't want on placement. The pin still pulses.
          setIsCommentMode(false);
          if (newCommentId) {
            setAnimatingCommentId(newCommentId);
            setTimeout(() => setAnimatingCommentId(null), 1100);
          }
        }}
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
        onAssigned={isWorkspaceMember ? handleAssigned : undefined}
        onPriorityChanged={isWorkspaceMember ? handlePriorityChanged : undefined}
        onSaveStateChange={setActionToastState}
        canAssignTicket={sessionAccess?.canResolve === true}
        isWorkspaceMember={isWorkspaceMember}
        animatingPinId={animatingPinId}
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
      <ResolveToast
        state={resolveToastState}
        onDismiss={() => setResolveToastState("hidden")}
      />
      <ResolveToast
        state={resolveToastState !== "hidden" ? "hidden" : actionToastState}
        onDismiss={() => setActionToastState("hidden")}
        errorText="Failed to save"
      />
      <div className="session-page-shell flex flex-col h-full min-h-0 overflow-hidden relative bg-[var(--surface-subtle)]">
        {!isPublicRoute && (
          <TopControlBar
            sessionId={sessionId}
            sessionTitle={session ? (session.title ?? "").trim() : ""}
            session={session}
            ownerBrandLogoUrl={ownerBrandLogoUrl}
            ownerBrandingEnabled={ownerBrandingEnabled}
            brandingResolved={brandingResolved}
            onSessionRenameSuccess={handleSessionRenameFromMenu}
            onSetSessionArchived={handleSetSessionArchivedFromMenu}
            onRequestDeleteSession={handleRequestDeleteSessionFromMenu}
            publicViewer={isAnonymousViewer}
            canManageShare={sessionAccess?.canResolve === true}
            canManageAccess={sessionAccess?.canDeleteTicket === true}
            isWorkspaceMember={isWorkspaceMember}
            sessionLoaded={sessionLoaded}
            openCount={isCountsSynced ? feedbackActiveCount : Math.max(0, sessionRestOpen)}
            resolvedCount={isCountsSynced ? feedbackResolvedCount : Math.max(0, sessionRestResolved)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isEditingTitle={isEditingSessionTitle}
            onTitleClick={() => { setSessionTitleDraft((session?.title ?? "").trim()); setIsEditingSessionTitle(true); }}
            onTitleChange={(v) => setSessionTitleDraft(v)}
            onTitleSave={handleSessionTitleBlur}
            onTitleCancel={() => { setIsEditingSessionTitle(false); setSessionTitleDraft((session?.title ?? "").trim()); }}
            titleDraft={sessionTitleDraft}
            canEditTitle={isWorkspaceMember}
            onToggleNavPanel={() => setNavPanelOpen(true)}
          />
        )}
        <div
          className="grid flex-1 min-h-0 overflow-hidden bg-[var(--surface-subtle)]"
          style={{
            gridTemplateColumns: (isActivityPanelOpen || activeThreadId != null) ? '346px 1fr 360px' : '346px 1fr',
            gap: '14px',
            padding: '0px 14px 14px',
            transition: 'grid-template-columns 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Left card: Ticket list */}
          <aside className="hidden lg:flex flex-col bg-[var(--surface)] rounded-[14px] min-h-0 overflow-hidden" style={{ boxShadow: 'var(--shadow-panel)' }}>
          <TicketList
            counts={{
              total: isCountsSynced ? feedbackTotal : Math.max(0, sessionRestTotal),
              open: isCountsSynced ? feedbackActiveCount : Math.max(0, sessionRestOpen),
              resolved: isCountsSynced ? feedbackResolvedCount : Math.max(0, sessionRestResolved),
            }}
            countsLoading={!hasSessionCounts}
            items={stableScopedFeedback}
            selectedId={effectiveSelectedId}
            onSelect={(id: string) => {
              trySwitchToTicket(id, () => {
                setSelectedId(id);
                const url = new URL(window.location.href);
                if (url.searchParams.has("ticket")) {
                  url.searchParams.delete("ticket");
                  window.history.replaceState({}, "", url.pathname + url.search);
                }
              });
            }}
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
            isSearchMode={isSearchMode}
            searchResults={searchResults}
            searchLoading={searchLoading}
            sessionTitle={session?.title}
            sessionLoaded={session !== null}
            workspaceName={workspaceName || "Workspace"}
            updatedAt={session?.updatedAt}
            viewCount={session?.viewCount ?? 0}
            recentViewers={session?.recentViewers}
            canRenameTitle={isWorkspaceMember}
            onRenameTitle={handleSidebarRenameTitle}
            isWorkspaceMember={isWorkspaceMember}
          />
          </aside>

          {/* Center card: Main content */}
          <section className="flex flex-col bg-[var(--surface)] rounded-[14px] min-h-0 overflow-hidden" style={{ boxShadow: 'var(--shadow-panel)' }}>
          {pendingResolveRequest && sessionAccess?.canResolve === false ? (
            <PendingAccessBanner />
          ) : null}
          <main className="flex-1 min-h-0 overflow-y-auto flex flex-col min-w-0">
            <div className="h-full flex flex-col min-w-0">
              <div className="z-20 shrink-0 flex items-center gap-2 px-4 py-3 lg:hidden bg-[var(--surface)]">
                <button
                  type="button"
                  onClick={() => setIsTicketNavigatorOpen(true)}
                  className="h-[38px] inline-flex items-center px-4 rounded-[var(--radius-btn)] border border-[var(--layer-2-border)] bg-[var(--layer-1-bg)] text-[14px] font-medium text-[var(--text-secondary-soft)] hover:bg-[var(--layer-2-hover-bg)] hover:text-[var(--text-primary-strong)] transition-colors duration-200"
                >
                  Tickets
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
                <div className="max-w-[900px] mx-auto w-full px-8 pt-11 pb-20 flex-1 min-h-0 flex flex-col">
                  {renderExecutionContent()}
                </div>
              </div>
            </div>
          </main>
          </section>

          {/* Right card: per-ticket Activity timeline (Phase 26.1).
              Replaces the old CommentPanel — comments now live in the
              middle panel (ExecutionView). */}
          {(isActivityPanelOpen || activeThreadId != null) &&
            effectiveSelectedId &&
            effectiveWorkspaceId && (
              <aside
                className="flex flex-col min-h-0 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300"
                style={{ animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
              >
                <div className="flex flex-col flex-1 min-h-0 bg-[var(--surface)] rounded-[14px] overflow-hidden" style={{ boxShadow: 'var(--shadow-panel)' }}>
                  <TicketActivityPanel
                    workspaceId={effectiveWorkspaceId as string}
                    feedbackId={effectiveSelectedId}
                    onClose={() => {
                      setActiveThreadId(null);
                      setIsActivityPanelOpen(false);
                      setIsCommentMode(false);
                    }}
                  />
                </div>
              </aside>
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
              counts={{
                total: isCountsSynced ? feedbackTotal : Math.max(0, sessionRestTotal),
                open: isCountsSynced ? feedbackActiveCount : Math.max(0, sessionRestOpen),
                resolved: isCountsSynced ? feedbackResolvedCount : Math.max(0, sessionRestResolved),
              }}
              countsLoading={!hasSessionCounts}
              items={stableScopedFeedback}
              selectedId={effectiveSelectedId}
              onSelect={(id: string) => {
                trySwitchToTicket(id, () => {
                  setSelectedId(id);
                  setIsTicketNavigatorOpen(false);
                  const url = new URL(window.location.href);
                  if (url.searchParams.has("ticket")) {
                    url.searchParams.delete("ticket");
                    window.history.replaceState({}, "", url.pathname + url.search);
                  }
                });
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
              isSearchMode={isSearchMode}
              searchResults={searchResults}
              searchLoading={searchLoading}
              sessionTitle={session?.title}
              sessionLoaded={session !== null}
              viewCount={session?.viewCount ?? 0}
              recentViewers={session?.recentViewers}
              canRenameTitle={isWorkspaceMember}
              onRenameTitle={handleSidebarRenameTitle}
              isWorkspaceMember={isWorkspaceMember}
              />
          </div>
        </div>
      )}

      {isImageExpanded && selectedItem?.screenshotId && selectedScreenshotUrl && (
        <ImageViewer
          imageUrl={selectedScreenshotUrl}
          fileName={`ticket-${selectedItem.id}-screenshot`}
          onClose={() => {
            setIsImageExpanded(false);
            setOpenImageInEditMode(false);
          }}
          screenshotId={selectedItem.screenshotId}
          sessionId={sessionId}
          isWorkspaceMember={isWorkspaceMember}
          hasPins={comments.some((c) => c.type === "pin" || Boolean(c.position))}
          onScreenshotUpdate={handleScreenshotUpdate}
          openInEditMode={openImageInEditMode}
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

      {/* Navigation Overlay Panel */}
      {navPanelOpen && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/15 backdrop-blur-[1px]"
            onClick={() => setNavPanelOpen(false)}
          />
          <div className="fixed top-0 left-0 bottom-0 z-[61] w-[290px] bg-[var(--surface)] animate-in slide-in-from-left duration-200 flex justify-center">
            <GlobalRail
              forceExpanded
              expandedWidthClass="w-[260px]"
              onForceClose={() => setNavPanelOpen(false)}
            />
          </div>
        </>
      )}

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
              className="text-[18px] font-medium leading-[1.3] text-[var(--text-primary-strong)]"
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
                className="px-4 py-2 text-[14px] font-medium rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary-strong)] hover:bg-[var(--layer-2-hover-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] transition-colors duration-[var(--motion-duration)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteFeedback(effectiveSelectedId)}
                className="px-4 py-2 text-[14px] font-medium rounded-xl bg-[var(--color-danger)] text-white hover:bg-[var(--color-danger)] focus:outline-none focus:ring-2 focus:ring-[var(--color-danger)]/40 transition-colors duration-[120ms] cursor-pointer"
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

