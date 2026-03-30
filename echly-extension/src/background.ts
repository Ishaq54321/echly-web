/**
 * Extension background (service worker). Centralizes auth + token handling.
 * Uses backend session: POST /api/extension/session (credentials: include) for extensionToken.
 * Content scripts never hold tokens; all API requests go through background with Bearer token.
 */
import { ECHLY_DEBUG } from "../../lib/utils/logger";
import { echlyLog } from "../../lib/debug/echlyLogger";
import { setExtensionToken, apiFetch } from "../utils/apiFetch";
import { API_BASE, WEB_APP_URL } from "../config";
import { sessionsArrayFromApiPayload } from "@/lib/domain/session";
import { buildFeedbackPayload } from "@/utils/buildFeedbackPayload";
import { ECHLY_STRICT_MODE } from "@/lib/guardrails";

const LOGIN_URL = `${WEB_APP_URL}/login`;
/** Extension token TTL from backend is 15m; treat as valid for 14 min to avoid edge expiry. */
const EXTENSION_TOKEN_TTL_MS = 14 * 60 * 1000;

async function openOrFocusLoginTab(): Promise<void> {
  const tabs = await chrome.tabs.query({});
  const existing = tabs.find((tab) => tab.url?.includes("/login"));
  if (existing?.id) {
    await chrome.tabs.update(existing.id, { active: true });
    if (typeof existing.windowId === "number") {
      await chrome.windows.update(existing.windowId, { focused: true });
    }
    return;
  }
  await chrome.tabs.create({ url: LOGIN_URL });
}

function clearAuthState(): void {
  extensionToken = null;
  extensionTokenExpiresAt = null;
  sw.extensionToken = null;
  sw.currentUser = null;
  cachedSessionUser = null;
  setExtensionToken(null);
}

function logMessageDeliveryError(context: string, error: unknown): void {
  console.error(`[ECHLY MESSAGE] ${context} failed`, error);
}

if (ECHLY_DEBUG) console.log("[EXTENSION] background ready", API_BASE);

/** Verify dashboard session (cookie) is still valid. Does not use extension token. */
async function verifyDashboardSession(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/extension/session`, {
      method: "POST",
      cache: "no-store",
      credentials: "include",
    });
    if (res.status === 401) return false;
    return res.ok;
  } catch (err) {
    console.warn("[ECHLY] Session verification failed", err);
    return false;
  }
}

chrome.action.onClicked.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const tab = tabs[0];
    if (tab?.id) sw.lastUserTabId = tab.id;

    if (trayOpen) {
      globalUIState.visible = false;
      globalUIState.expanded = false;
      trayOpen = false;
      await chrome.storage.local.set({ echlyActive: false });
      broadcastUIState();
      if (tab?.id) {
        chrome.tabs
          .sendMessage(tab.id, { type: "ECHLY_CLOSE_WIDGET" })
          .catch((error) => logMessageDeliveryError("ECHLY_CLOSE_WIDGET", error));
      }
      return;
    }

    await openRecorderUI();
  });
});

type StoredUser = { uid: string; name: string | null; email: string | null; photoURL: string | null };
type FeedbackApiItem = { id: string; title?: string; actionSteps?: string[]; type?: string };
type FeedbackListResponse = {
  feedback?: FeedbackApiItem[];
  nextCursor?: string | null;
  hasMore?: boolean;
};

function parseFeedbackListResponse(raw: unknown): FeedbackListResponse {
  if (typeof raw !== "object" || raw === null) return {};
  const o = raw as Record<string, unknown>;
  const inner = o.data;
  if (typeof inner === "object" && inner !== null) {
    const d = inner as Record<string, unknown>;
    return {
      feedback: Array.isArray(d.feedback) ? (d.feedback as FeedbackApiItem[]) : [],
      nextCursor: typeof d.nextCursor === "string" ? d.nextCursor : null,
      hasMore: d.hasMore === true,
    };
  }
  return {
    feedback: Array.isArray(o.feedback) ? (o.feedback as FeedbackApiItem[]) : [],
    nextCursor: typeof o.nextCursor === "string" ? o.nextCursor : null,
    hasMore: o.hasMore === true,
  };
}
type SessionCounts = {
  total: number;
  open: number;
  resolved: number;
};
const processingFeedbackIds = new Set<string>();
const feedbackJobOwners = new Map<string, number>();

async function isFeedbackCompleted(feedbackId: string): Promise<boolean> {
  const data = await chrome.storage.session.get(feedbackId);
  return !!data[feedbackId];
}

async function markFeedbackCompleted(feedbackId: string): Promise<void> {
  await chrome.storage.session.set({ [feedbackId]: true });
}

/** Global message-router API: single source for extension token, user, capture mode (used by message handler). */
const sw = globalThis as typeof globalThis & {
  extensionToken: string | null;
  currentUser: StoredUser | null;
  captureMode: "voice" | "text";
  /** Tab where user clicked the extension icon; used to inject widget after auth broker flow. */
  lastUserTabId: number | null;
};
sw.extensionToken = null;
sw.currentUser = null;
sw.captureMode = "voice";
sw.lastUserTabId = null;

let activeSessionId: string | null = null;
let activeOwnerTabId: number | null = null;

/** In-memory extension token (from auth broker page). Never stored in chrome.storage or localStorage. */
let extensionToken: string | null = null;
/** When the in-memory token expires (timestamp). */
let extensionTokenExpiresAt: number | null = null;
/** Cached user from last successful session response; used for ECHLY_GET_AUTH_STATE. */
let cachedSessionUser: StoredUser | null = null;

/** Tray toggle state: icon click opens when false, closes when true (Loom-style). */
let trayOpen = false;

/** Minimal ticket shape for global tray; matches StructuredFeedback. */
type StructuredFeedback = { id: string; title: string; actionSteps: string[]; type?: string };
type CanonicalGlobalState = {
  visible: boolean;
  expanded: boolean;
  isRecording: boolean;
  sessionTitle: string | null;
  sessionLoading: boolean;
  captureMode: "voice" | "text";
  session: {
    id: string | null;
    status: "idle" | "active" | "paused";
  };
  feedback: {
    items: StructuredFeedback[];
    nextCursor: string | null;
    hasMore: boolean;
    isFetching: boolean;
    recovering: boolean;
    recoveryAttempts: number;
  };
  counts: {
    total: number;
  };
  lastSyncedAt: number | null;
  /** Last successful paginated page fetch; combined with lastSyncedAt for freshness. */
  lastPaginationAt: number | null;
  /** max(lastSyncedAt, lastPaginationAt); null when neither set. */
  lastActivityAt: number | null;
};

const globalUIState: {
  visible: boolean;
  expanded: boolean;
  isRecording: boolean;
  sessionId: string | null;
  sessionTitle: string | null;
  sessionModeActive: boolean;
  sessionPaused: boolean;
  sessionLoading: boolean;
  totalCount: number;
  openCount: number;
  resolvedCount: number;
  pointers: StructuredFeedback[];
  nextCursor: string | null;
  hasMore: boolean;
  isFetching: boolean;
  recovering: boolean;
  recoveryAttempts: number;
  captureMode: "voice" | "text";
  lastSyncedAt: number | null;
  lastPaginationAt: number | null;
} = {
  visible: false,
  expanded: false,
  isRecording: false,
  sessionId: null,
  sessionTitle: null,
  sessionModeActive: false,
  sessionPaused: false,
  sessionLoading: false,
  totalCount: 0,
  openCount: 0,
  resolvedCount: 0,
  pointers: [],
  nextCursor: null,
  hasMore: false,
  isFetching: false,
  recovering: false,
  recoveryAttempts: 0,
  captureMode: "voice",
  lastSyncedAt: null,
  lastPaginationAt: null,
};

function mapFeedbackToPointers(feedback: FeedbackApiItem[]): StructuredFeedback[] {
  return feedback.map((item) => ({
    id: item.id,
    title: item.title ?? "",
    actionSteps: item.actionSteps ?? [],
    type: item.type ?? "Feedback",
  }));
}

function resetPaginationState(): void {
  globalUIState.nextCursor = null;
  globalUIState.hasMore = false;
  globalUIState.isFetching = false;
  globalUIState.recovering = false;
  globalUIState.recoveryAttempts = 0;
}

let rehydrationPromise: Promise<void> | null = null;
const LOAD_MORE_RECOVERY_DELAYS_MS = [0, 500, 1000, 2000, 4000] as const;
let loadMoreRecoveryPromise: Promise<void> | null = null;
const EAGER_THROTTLE_THRESHOLD = 1000;
const EAGER_THROTTLE_DELAY_MS = 40;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** True when there is no list to show for the current in-memory session. */
function isStateEmptyForSession(): boolean {
  return globalUIState.sessionId == null || globalUIState.pointers.length === 0;
}

/**
 * Wall-clock freshness for optional soft-refresh logic: max(lastSyncedAt, lastPaginationAt).
 * Force rehydrate does not use time-only staleness (see shouldForceRehydrate).
 */
function effectiveFreshnessAt(): number {
  return Math.max(globalUIState.lastSyncedAt ?? 0, globalUIState.lastPaginationAt ?? 0);
}

/**
 * Only force a full rehydrate when there is no cached list, the target session differs, or
 * explicit recovery — not purely because lastSyncedAt aged without pagination updating it.
 */
function shouldForceRehydrate(sessionIdForRehydrate: string): boolean {
  if (globalUIState.sessionId != null && globalUIState.sessionId !== sessionIdForRehydrate) {
    return true;
  }
  return isStateEmptyForSession();
}

type RehydrateMode = "cold" | "forced_recovery" | "stale_soft";

function setRehydratingLoadingState(sessionId: string, mode: RehydrateMode = "cold"): void {
  const previousSessionId = globalUIState.sessionId;
  const sessionChanged = previousSessionId !== sessionId;
  activeSessionId = sessionId;
  globalUIState.sessionId = sessionId;
  globalUIState.sessionModeActive = true;
  globalUIState.sessionPaused = false;
  // Same-session refresh: keep list visible; only block full chrome on session change / recovery.
  globalUIState.sessionLoading = sessionChanged || mode === "forced_recovery";
  globalUIState.isFetching = true;
  const clearList = mode === "forced_recovery" || (mode === "cold" && sessionChanged);
  if (clearList) {
    globalUIState.pointers = [];
    globalUIState.totalCount = 0;
    globalUIState.openCount = 0;
    globalUIState.resolvedCount = 0;
    globalUIState.nextCursor = null;
    globalUIState.hasMore = false;
  }
}

async function rehydrateSession(sessionId: string, mode: RehydrateMode = "cold"): Promise<void> {
  if (!sessionId) return;
  if (rehydrationPromise) {
    await rehydrationPromise;
    return;
  }

  rehydrationPromise = (async () => {
    setRehydratingLoadingState(sessionId, mode);
    broadcastUIState();

    try {
      await getOrRefreshToken();
      const [feedbackRes, counts] = await Promise.all([
        apiFetch(`${API_BASE}/api/feedback?sessionId=${encodeURIComponent(sessionId)}&limit=20`),
        fetchFeedbackCountFresh(sessionId),
      ]);

      const feedbackJson = parseFeedbackListResponse(await feedbackRes.json());
      const serverPointers = mapFeedbackToPointers(feedbackJson.feedback ?? []);
      if (mode === "forced_recovery") {
        globalUIState.pointers = serverPointers;
      } else {
        const serverIds = new Set(serverPointers.map((p) => p.id));
        globalUIState.pointers = [
          ...serverPointers,
          ...globalUIState.pointers.filter((p) => !serverIds.has(p.id)),
        ];
      }
      globalUIState.nextCursor =
        typeof feedbackJson.nextCursor === "string" && feedbackJson.nextCursor.length > 0
          ? feedbackJson.nextCursor
          : null;
      globalUIState.hasMore = feedbackJson.hasMore === true;
      globalUIState.totalCount = counts.total;
      globalUIState.openCount = counts.open;
      globalUIState.resolvedCount = counts.resolved;
      const now = Date.now();
      globalUIState.lastSyncedAt = now;
      globalUIState.lastPaginationAt = null;
      globalUIState.sessionModeActive = true;
      globalUIState.sessionPaused = false;
    } catch (error) {
      console.error("[ECHLY] rehydrateSession failed", { sessionId, mode, error });
      if (mode === "stale_soft") {
        // Keep existing list/cursors until a successful fetch replaces them.
      } else {
        globalUIState.pointers = [];
        globalUIState.totalCount = 0;
        globalUIState.openCount = 0;
        globalUIState.resolvedCount = 0;
        globalUIState.nextCursor = null;
        globalUIState.hasMore = false;
        globalUIState.lastSyncedAt = null;
        globalUIState.lastPaginationAt = null;
      }
    } finally {
      globalUIState.isFetching = false;
      globalUIState.sessionLoading = false;
      broadcastUIState();
    }
  })();

  try {
    await rehydrationPromise;
  } finally {
    rehydrationPromise = null;
  }

  if (globalUIState.sessionId === sessionId && globalUIState.hasMore && globalUIState.nextCursor) {
    await drainAllFeedbackPages(sessionId);
  }
}

async function fetchFeedbackCountFresh(sessionId: string): Promise<SessionCounts> {
  const res = await apiFetch(`${API_BASE}/api/sessions/${encodeURIComponent(sessionId)}`);
  if (!res.ok) {
    throw new Error("session_meta_failed_" + res.status);
  }
  const raw = await res.json();
  const json = raw as {
    success?: boolean;
    data?: { session?: Record<string, unknown> };
    session?: Record<string, unknown>;
  };
  const s = json.data?.session ?? json.session;
  if (!s || json.success === false) {
    throw new Error("session_meta_missing");
  }
  const open = typeof s.openCount === "number" ? s.openCount : 0;
  const resolved = typeof s.resolvedCount === "number" ? s.resolvedCount : 0;
  const total =
    typeof s.totalCount === "number"
      ? s.totalCount
      : typeof s.feedbackCount === "number"
        ? s.feedbackCount
        : 0;
  return { total, open, resolved };
}

async function loadMore(): Promise<void> {
  const sessionId = activeSessionId ?? globalUIState.sessionId;
  if (!sessionId) return;
  if (globalUIState.isFetching || !globalUIState.hasMore || !globalUIState.nextCursor) return;

  globalUIState.isFetching = true;
  broadcastUIState();

  try {
    await getOrRefreshToken();
    const res = await apiFetch(
      `${API_BASE}/api/feedback?sessionId=${encodeURIComponent(sessionId)}&cursor=${encodeURIComponent(globalUIState.nextCursor)}&limit=20`
    );
    const json = parseFeedbackListResponse(await res.json());
    const rawItems = json.feedback ?? [];
    const newItems = mapFeedbackToPointers(rawItems);
    const existingIds = new Set(globalUIState.pointers.map((p) => p.id));
    const filteredItems = newItems.filter((item) => !existingIds.has(item.id));
    if (filteredItems.length > 0) {
      globalUIState.pointers = [...globalUIState.pointers, ...filteredItems];
    }
    globalUIState.nextCursor =
      typeof json.nextCursor === "string" && json.nextCursor.length > 0
        ? json.nextCursor
        : null;
    globalUIState.hasMore = json.hasMore === true;
    const now = Date.now();
    globalUIState.lastSyncedAt = now;
    globalUIState.lastPaginationAt = now;
  } catch (error) {
    console.error("[ECHLY] loadMore failed", {
      sessionId,
      cursor: globalUIState.nextCursor,
      error,
    });
    globalUIState.recovering = true;
    globalUIState.recoveryAttempts += 1;
    globalUIState.hasMore = true;
    broadcastUIState();
    void retryRehydrateWithBackoff(sessionId);
  } finally {
    globalUIState.isFetching = false;
    broadcastUIState();
  }
}

async function drainAllFeedbackPages(sessionId: string): Promise<void> {
  if (!sessionId) return;
  while (
    globalUIState.sessionId === sessionId &&
    globalUIState.hasMore === true &&
    globalUIState.nextCursor != null
  ) {
    await loadMore();
    if (
      globalUIState.sessionId !== sessionId ||
      globalUIState.hasMore !== true ||
      globalUIState.nextCursor == null
    ) {
      break;
    }
    if (globalUIState.totalCount > EAGER_THROTTLE_THRESHOLD) {
      await sleep(EAGER_THROTTLE_DELAY_MS);
    }
  }
}

async function retryRehydrateWithBackoff(sessionId: string): Promise<void> {
  if (loadMoreRecoveryPromise) {
    return loadMoreRecoveryPromise;
  }

  loadMoreRecoveryPromise = (async () => {
    for (let attemptIndex = 0; attemptIndex < LOAD_MORE_RECOVERY_DELAYS_MS.length; attemptIndex += 1) {
      const delayMs = LOAD_MORE_RECOVERY_DELAYS_MS[attemptIndex];
      if (delayMs > 0) {
        await sleep(delayMs);
      }

      globalUIState.recovering = true;
      globalUIState.recoveryAttempts = attemptIndex + 1;
      broadcastUIState();

      try {
        await rehydrateSession(sessionId, "forced_recovery");
        if (globalUIState.lastSyncedAt != null && globalUIState.sessionId === sessionId) {
          globalUIState.recovering = false;
          globalUIState.recoveryAttempts = 0;
          broadcastUIState();
          return;
        }
      } catch (rehydrateError) {
        console.error("[ECHLY] loadMore recovery rehydrate failed", {
          sessionId,
          attempt: attemptIndex + 1,
          rehydrateError,
        });
      }
    }

    console.warn("[ECHLY] loadMore recovery exhausted all attempts", {
      sessionId,
      maxAttempts: LOAD_MORE_RECOVERY_DELAYS_MS.length,
    });
    globalUIState.recovering = false;
    broadcastUIState();
  })();

  try {
    await loadMoreRecoveryPromise;
  } finally {
    loadMoreRecoveryPromise = null;
  }
}

/** 30-minute safety timeout: session ends after this much inactivity. */
const SESSION_IDLE_TIMEOUT = 30 * 60 * 1000;
let idleTimer: ReturnType<typeof setTimeout> | null = null;

function clearSessionIdleTimer(): void {
  if (idleTimer != null) {
    clearTimeout(idleTimer);
    idleTimer = null;
  }
}

function endSessionFromIdle(): void {
  echlyLog("BACKGROUND", "session idle timeout — ending session");
  clearSessionIdleTimer();
  activeSessionId = null;
  globalUIState.sessionId = null;
  globalUIState.sessionTitle = null;
  globalUIState.sessionModeActive = false;
  globalUIState.sessionPaused = false;
  globalUIState.sessionLoading = false;
  globalUIState.totalCount = 0;
  globalUIState.openCount = 0;
  globalUIState.resolvedCount = 0;
  globalUIState.pointers = [];
  resetPaginationState();
  globalUIState.lastSyncedAt = null;
  globalUIState.lastPaginationAt = null;
  chrome.storage.local.set({
    activeSessionId: null,
    sessionModeActive: false,
    sessionPaused: false,
  });
  broadcastUIState();
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id) {
        chrome.tabs
          .sendMessage(tab.id, { type: "ECHLY_RESET_WIDGET" })
          .catch((error) => logMessageDeliveryError("ECHLY_RESET_WIDGET", error));
      }
    });
  });
}

function resetSessionIdleTimer(): void {
  if (!globalUIState.sessionModeActive) return;
  clearSessionIdleTimer();
  idleTimer = setTimeout(() => {
    endSessionFromIdle();
  }, SESSION_IDLE_TIMEOUT);
}

function persistSessionLifecycleState(): void {
  chrome.storage.local.set({
    activeSessionId,
    sessionModeActive: globalUIState.sessionModeActive,
    sessionPaused: globalUIState.sessionPaused,
  });
}

async function initializeSessionState(): Promise<void> {
  return new Promise<void>((resolve) => {
    chrome.storage.local.get(
      ["activeSessionId", "sessionModeActive", "sessionPaused"],
      (result: { activeSessionId?: string; sessionModeActive?: boolean; sessionPaused?: boolean }) => {
        activeSessionId =
          typeof result.activeSessionId === "string"
            ? result.activeSessionId
            : null;

        globalUIState.sessionId = activeSessionId;
        globalUIState.sessionModeActive = result.sessionModeActive === true;
        globalUIState.sessionPaused = result.sessionPaused === true;

        const isColdStartRestart = activeSessionId != null && globalUIState.lastSyncedAt == null;
        const shouldReloadPointers = isColdStartRestart;

        if (shouldReloadPointers) {
          void rehydrateSession(activeSessionId!).finally(() => {
            resolve();
          });
        } else {
          globalUIState.sessionModeActive = false;
          globalUIState.totalCount = 0;
          globalUIState.openCount = 0;
          globalUIState.resolvedCount = 0;
          resetPaginationState();
          globalUIState.lastSyncedAt = null;
          globalUIState.lastPaginationAt = null;
          resolve();
        }
      }
    );
  });
}

chrome.runtime.onInstalled.addListener(() => {
  if (ECHLY_DEBUG) console.log("[ECHLY] extension installed or updated");
});

self.addEventListener("activate", () => {
  if (ECHLY_DEBUG) console.log("[ECHLY] service worker activated");
});

(async () => {
  try {
    const stored = await chrome.storage.local.get([
      "echlyActive",
      "activeSessionId",
      "sessionModeActive",
    ]);

    if (stored?.echlyActive) {
      trayOpen = true;
      globalUIState.visible = true;
    }

    await initializeSessionState();

    broadcastUIState();

    if (ECHLY_DEBUG) console.log("[ECHLY] service worker initialized");
  } catch (err) {
    console.warn("[ECHLY] worker startup recovery failed", err);
  }
})();

/**
 * Single token path:
 * - valid in-memory token -> return
 * - expired/missing token -> refresh from extension session endpoint
 * - any failure -> throw NOT_AUTHENTICATED
 */
async function getOrRefreshToken(): Promise<string> {
  const now = Date.now();

  if (
    extensionToken &&
    extensionTokenExpiresAt != null &&
    now < extensionTokenExpiresAt
  ) {
    setExtensionToken(extensionToken);
    sw.extensionToken = extensionToken;
    return extensionToken;
  }

  const res = await fetch(`${API_BASE}/api/extension/session`, {
    method: "POST",
    cache: "no-store",
    credentials: "include",
  });

  if (res.status === 401 || !res.ok) {
    clearAuthState();
    throw new Error("NOT_AUTHENTICATED");
  }

  const envelope = (await res.json()) as {
    data?: {
      extensionToken?: string;
      user?: { uid: string; email?: string | null };
    };
  };
  const payload = envelope?.data;
  const token = payload?.extensionToken;
  if (!token) {
    clearAuthState();
    throw new Error("NOT_AUTHENTICATED");
  }

  extensionToken = token;
  extensionTokenExpiresAt = Date.now() + EXTENSION_TOKEN_TTL_MS;
  setExtensionToken(token);
  sw.extensionToken = token;
  if (payload?.user?.uid) {
    sw.currentUser = {
      uid: payload.user.uid,
      name: null,
      email: payload.user.email ?? null,
      photoURL: null,
    };
    cachedSessionUser = sw.currentUser;
  }
  return token;
}

/**
 * Verify dashboard session only. Never requests tokens or opens login.
 * Used by auth-state requests to report authenticated state from in-memory user/token or session cookie.
 */
async function hydrateAuthState(): Promise<boolean> {
  try {
    await getOrRefreshToken();
    return !!(sw.currentUser?.uid && sw.extensionToken);
  } catch (error) {
    console.error("[ECHLY] hydrateAuthState failed (no stale auth)", error);
    return false;
  }
}

type AuthStateResponse = {
  authenticated: boolean;
  user: StoredUser | null;
  token: string | null;
};

/** Shared auth-state payload used by GET_AUTH_STATE and explicit-open gates. */
async function getAuthStateResponse(): Promise<AuthStateResponse> {
  const authenticated = await hydrateAuthState();
  return {
    authenticated,
    user: authenticated ? sw.currentUser ?? null : null,
    token: authenticated ? sw.extensionToken ?? null : null,
  };
}

/**
 * Explicit open only: icon click / open-widget / open-popup.
 * If unauthenticated, open dashboard login and prevent widget/popup flow.
 */
async function requireAuthForExplicitOpen(): Promise<boolean> {
  const authState = await getAuthStateResponse();
  if (authState.authenticated) return true;
  await chrome.tabs.create({ url: LOGIN_URL });
  return false;
}

function broadcastUIState(): void {
  const state = getCanonicalGlobalState();
  echlyLog("BACKGROUND", "broadcast global state", state);
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id) {
        chrome.tabs
          .sendMessage(tab.id, { type: "ECHLY_GLOBAL_STATE", state })
          .catch((error) => {
            console.error("[ECHLY] broadcast ECHLY_GLOBAL_STATE to tab failed", tab.id, error);
          });
      }
    });
  });
}

function getCanonicalGlobalState(): CanonicalGlobalState {
  const status: "idle" | "active" | "paused" = globalUIState.sessionModeActive
    ? (globalUIState.sessionPaused ? "paused" : "active")
    : "idle";
  return {
    visible: globalUIState.visible,
    expanded: globalUIState.expanded,
    isRecording: globalUIState.isRecording,
    sessionTitle: globalUIState.sessionTitle,
    sessionLoading: globalUIState.sessionLoading,
    captureMode: globalUIState.captureMode,
    session: {
      id: globalUIState.sessionId,
      status,
    },
    feedback: {
      items: globalUIState.pointers,
      nextCursor: globalUIState.nextCursor,
      hasMore: globalUIState.hasMore,
      isFetching: globalUIState.isFetching,
      recovering: globalUIState.recovering,
      recoveryAttempts: globalUIState.recoveryAttempts,
    },
    counts: {
      total: globalUIState.totalCount,
    },
    lastSyncedAt: globalUIState.lastSyncedAt,
    lastPaginationAt: globalUIState.lastPaginationAt,
    lastActivityAt: (() => {
      const t = effectiveFreshnessAt();
      return t === 0 ? null : t;
    })(),
  };
}

/**
 * Ensure content script is loaded in the given tab (inject via scripting API if not).
 * Prevents duplicate injection by checking window.__ECHLY_WIDGET_LOADED__ in the tab.
 * Returns true if content script is present (or was just injected), false if injection failed (e.g. restricted URL).
 */
async function ensureContentScriptInjected(tabId: number): Promise<boolean> {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => (window as Window & { __ECHLY_WIDGET_LOADED__?: boolean }).__ECHLY_WIDGET_LOADED__ === true,
    });
    if (results?.[0]?.result === true) return true;
  } catch (error) {
    console.warn("[ECHLY] Pre-injection probe failed", { tabId, error });
    // Page may not allow script execution (e.g. chrome://) or script not loaded yet.
  }
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"],
    });
    return true;
  } catch (e) {
    console.warn("[ECHLY] Failed to inject content script", e);
    return false;
  }
}

async function openWidgetInActiveTab(): Promise<void> {
  await chrome.storage.local.set({ echlyActive: true });

  globalUIState.visible = true;
  globalUIState.expanded = true;

  broadcastUIState();

  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  const tabId = tabs[0]?.id;

  if (!tabId) {
    console.warn("[ECHLY BG] No active tab found");
    return;
  }

  const injected = await ensureContentScriptInjected(tabId);

  if (!injected) {
    console.warn("[ECHLY BG] Could not inject widget into tab", tabId);
    return;
  }

  chrome.tabs
    .sendMessage(tabId, {
      type: "ECHLY_OPEN_WIDGET",
    })
    .catch((error) => logMessageDeliveryError("ECHLY_OPEN_WIDGET", error));
}

async function openRecorderUI(tabId?: number): Promise<boolean> {
  if (typeof tabId === "number") {
    sw.lastUserTabId = tabId;
  }

  const authenticated = await requireAuthForExplicitOpen();
  if (!authenticated) {
    trayOpen = false;
    globalUIState.visible = false;
    globalUIState.expanded = false;
    await chrome.storage.local.set({ echlyActive: false });
    broadcastUIState();
    return false;
  }

  trayOpen = true;
  await openWidgetInActiveTab();
  return true;
}

/** Loom-style: when user switches tabs and Echly is active, inject content script so widget appears on every tab. */
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const { echlyActive } = await chrome.storage.local.get("echlyActive");
  if (!echlyActive) return;
  const sessionIdForRehydrate = activeSessionId ?? globalUIState.sessionId;
  if (sessionIdForRehydrate && shouldForceRehydrate(sessionIdForRehydrate)) {
    void rehydrateSession(sessionIdForRehydrate);
  }
  try {
    await ensureContentScriptInjected(activeInfo.tabId);
    chrome.tabs
      .sendMessage(activeInfo.tabId, { type: "ECHLY_GLOBAL_STATE", state: getCanonicalGlobalState() })
      .catch((e) => {
        if (ECHLY_DEBUG) console.debug("ECHLY tab activation sync failed", e);
      });
    chrome.tabs
      .sendMessage(activeInfo.tabId, { type: "ECHLY_SESSION_STATE_SYNC" })
      .catch((e) => {
        if (ECHLY_DEBUG) console.debug("ECHLY session state sync failed for tab", activeInfo.tabId, e);
      });
  } catch (e) {
    if (ECHLY_DEBUG) console.debug("ECHLY onActivated inject/sync failed", e);
  }
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  activeOwnerTabId = tabId;
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (activeOwnerTabId === tabId) {
    activeOwnerTabId = null;
  }
});

/** Loom-style: when a page finishes loading and Echly is active, inject content script so widget appears. */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, _tab) => {
  if (changeInfo.status !== "complete") return;
  const { echlyActive } = await chrome.storage.local.get("echlyActive");
  if (!echlyActive) return;
  try {
    await ensureContentScriptInjected(tabId);
    chrome.tabs
      .sendMessage(tabId, { type: "ECHLY_GLOBAL_STATE", state: getCanonicalGlobalState() })
      .catch((error) => logMessageDeliveryError("ECHLY_GLOBAL_STATE", error));
  } catch (e) {
    if (ECHLY_DEBUG) console.debug("ECHLY onUpdated inject failed", tabId, e);
  }
});

/** When a new tab is created, push current session state. Fails silently if content script not yet injected. */
chrome.tabs.onCreated.addListener((tab) => {
  if (!tab.id) return;
  chrome.tabs
    .sendMessage(tab.id, { type: "ECHLY_GLOBAL_STATE", state: getCanonicalGlobalState() })
    .catch((e) => {
      console.error("[ECHLY] ECHLY_GLOBAL_STATE to new tab failed", tab.id, e);
    });
});

async function createFeedbackInternal({
  sessionId,
  feedbackId,
  ticket,
  screenshotId,
}: {
  sessionId: string;
  feedbackId: string;
  ticket: {
    title?: string;
    instruction?: string;
    description?: string;
    suggestedTags?: string[];
    actionSteps?: string[];
    status?: "open" | "resolved";
  };
  screenshotId: string;
}): Promise<Response> {
  const body = buildFeedbackPayload({
    sessionId,
    feedbackId,
    ticket,
    screenshotId,
  });

  const res = await apiFetch(`${API_BASE}/api/feedback`, {
    method: "POST",
    body: JSON.stringify(body),
  });

  return res;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (ECHLY_DEBUG) echlyLog("MESSAGE", "received", request.type);

  if (request.type === "ECHLY_EXTENSION_TOKEN") {
    const token = (request as { token?: string; user?: { uid: string; email?: string | null } }).token;
    const user = (request as { token?: string; user?: { uid: string; email?: string | null } }).user;
    if (typeof token === "string" && token.length > 0) {
      extensionToken = token;
      extensionTokenExpiresAt = Date.now() + EXTENSION_TOKEN_TTL_MS;
      setExtensionToken(token);
      sw.extensionToken = token;
      if (user?.uid) {
        sw.currentUser = {
          uid: user.uid,
          name: null,
          email: user.email ?? null,
          photoURL: null,
        };
        cachedSessionUser = sw.currentUser;
      }
      trayOpen = true;
      globalUIState.visible = true;
      void (async () => {
        const sessionIdForRehydrate = activeSessionId ?? globalUIState.sessionId;
        if (sessionIdForRehydrate) {
          await rehydrateSession(sessionIdForRehydrate);
        }
        await openWidgetInActiveTab();
        broadcastUIState();
      })();
    }
    return false;
  }

  if (request.type === "ECHLY_START_SESSION") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs
          .sendMessage(tabs[0].id, { type: "ECHLY_START_SESSION" })
          .catch((error) => logMessageDeliveryError("ECHLY_START_SESSION", error));
      }
    });
    sendResponse({ ok: true });
    return false;
  }

  if (request.type === "ECHLY_OPEN_PREVIOUS_SESSIONS") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs
          .sendMessage(tabs[0].id, { type: "ECHLY_OPEN_PREVIOUS_SESSIONS" })
          .catch((error) => logMessageDeliveryError("ECHLY_OPEN_PREVIOUS_SESSIONS", error));
      }
    });
    sendResponse({ ok: true });
    return false;
  }

  if (request.type === "ECHLY_OPEN_WIDGET") {
    (async () => {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tabId = tabs[0]?.id;
      const opened = await openRecorderUI(tabId);
      if (!opened) {
        sendResponse({ ok: false, authenticated: false });
        return;
      }
      sendResponse({ ok: true });
    })();
    return true; // keep channel open for async sendResponse
  }

  if (request.type === "OPEN_RECORDER") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      (async () => {
        const opened = await openRecorderUI(tab?.id);
        if (opened && tab?.id) {
          chrome.tabs
            .sendMessage(tab.id, { type: "ECHLY_RECORDER_OPENED" })
            .catch((error) => logMessageDeliveryError("ECHLY_RECORDER_OPENED", error));
        }
        sendResponse({ ok: opened });
      })();
    });
    return true;
  }

  if (request.type === "ECHLY_EXPAND_WIDGET") {
    globalUIState.expanded = true;
    broadcastUIState();
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs
          .sendMessage(tabs[0].id, { type: "ECHLY_WIDGET_EXPAND" })
          .catch((error) => logMessageDeliveryError("ECHLY_WIDGET_EXPAND", error));
      }
    });
    sendResponse({ ok: true });
    return false;
  }

  if (request.type === "ECHLY_COLLAPSE_WIDGET") {
    globalUIState.expanded = false;
    broadcastUIState();
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs
          .sendMessage(tabs[0].id, { type: "ECHLY_WIDGET_COLLAPSE" })
          .catch((error) => logMessageDeliveryError("ECHLY_WIDGET_COLLAPSE", error));
      }
    });
    sendResponse({ ok: true });
    return false;
  }

  if (request.type === "ECHLY_GET_GLOBAL_STATE") {
    sendResponse({ state: getCanonicalGlobalState() });
    void (async () => {
      const stored = await chrome.storage.local.get(["activeSessionId"]);
      const storedSessionId =
        typeof stored.activeSessionId === "string" ? stored.activeSessionId : null;
      const sessionIdForRehydrate = activeSessionId ?? globalUIState.sessionId ?? storedSessionId;
      if (sessionIdForRehydrate && shouldForceRehydrate(sessionIdForRehydrate)) {
        await rehydrateSession(sessionIdForRehydrate);
      }
    })();
    return false;
  }

  if (request.type === "ECHLY_GET_TRAY_STATE") {
    sendResponse({
      trayOpen,
      visible: globalUIState.visible,
    });
    return true;
  }

  if (request.type === "ECHLY_CLOSE_WIDGET") {
    (async () => {
      trayOpen = false;
      globalUIState.visible = false;

      await chrome.storage.local.set({
        echlyActive: false,
      });

      broadcastUIState();

      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (tabs[0]?.id) {
        chrome.tabs
          .sendMessage(tabs[0].id, {
            type: "ECHLY_CLOSE_WIDGET",
          })
          .catch((error) => logMessageDeliveryError("ECHLY_CLOSE_WIDGET", error));
      }
      sendResponse({ ok: true });
    })();
    return true;
  }

  if (request.type === "ECHLY_FEEDBACK_CREATED") {
    const ticket = (request as { ticket?: { id: string; title: string; actionSteps?: string[]; type?: string } }).ticket;
    if (ticket?.id && ticket?.title) {
      const pointer: StructuredFeedback = {
        id: ticket.id,
        title: ticket.title,
        actionSteps: ticket.actionSteps ?? [],
        type: ticket.type ?? "Feedback",
      };
      globalUIState.pointers = [pointer, ...globalUIState.pointers];
      resetSessionIdleTimer();
      broadcastUIState();
      const sid = globalUIState.sessionId;
      if (sid) {
        void (async () => {
          try {
            const c = await fetchFeedbackCountFresh(sid);
            if (globalUIState.sessionId !== sid) return;
            globalUIState.totalCount = c.total;
            globalUIState.openCount = c.open;
            globalUIState.resolvedCount = c.resolved;
            broadcastUIState();
          } catch (err) {
            console.error("[ECHLY] refresh counts after feedback created failed", err);
          }
        })();
      }
    }
    sendResponse({ ok: true });
    return false;
  }

  if (request.type === "ECHLY_REFETCH_FEEDBACK_COUNT") {
    const payload = request as { sessionId?: string };
    const sid =
      typeof payload.sessionId === "string" && payload.sessionId.trim() !== ""
        ? payload.sessionId.trim()
        : globalUIState.sessionId;
    if (sid) {
      void (async () => {
        try {
          const c = await fetchFeedbackCountFresh(sid);
          if (globalUIState.sessionId !== sid) return;
          globalUIState.totalCount = c.total;
          globalUIState.openCount = c.open;
          globalUIState.resolvedCount = c.resolved;
          broadcastUIState();
        } catch (err) {
          console.error("[ECHLY] refresh counts (ECHLY_REFETCH_FEEDBACK_COUNT) failed", err);
        }
      })();
    }
    sendResponse({ ok: true });
    return false;
  }

  if (request.type === "ECHLY_SET_CAPTURE_MODE") {
    const mode = (request as { mode?: "voice" | "text" }).mode;
    if (mode === "voice" || mode === "text") {
      globalUIState.captureMode = mode;
      sw.captureMode = mode;
      broadcastUIState();
    }
    sendResponse({ success: true });
    return true;
  }

  if (request.type === "ECHLY_SESSION_UPDATED") {
    const { sessionId: sid, title: newTitle } = request as { sessionId?: string; title?: string };
    if (sid === globalUIState.sessionId && typeof newTitle === "string") {
      globalUIState.sessionTitle = newTitle;
      broadcastUIState();
    }
    sendResponse({ ok: true });
    return false;
  }

  if (request.type === "ECHLY_TICKET_UPDATED") {
    const ticket = (request as { ticket?: StructuredFeedback }).ticket;
    if (ticket?.id && ticket?.title) {
      globalUIState.pointers = globalUIState.pointers.map((p) =>
        p.id === ticket.id
          ? {
              id: ticket.id,
              title: ticket.title,
              actionSteps: ticket.actionSteps ?? [],
              type: ticket.type ?? p.type,
            }
          : p
      );
      broadcastUIState();
    }
    sendResponse({ ok: true });
    return false;
  }

  if (request.type === "ECHLY_TICKET_DELETED") {
    const ticketId = (request as { ticketId?: string }).ticketId;
    if (typeof ticketId === "string" && ticketId.length > 0) {
      globalUIState.pointers = globalUIState.pointers.filter((p) => p.id !== ticketId);
      resetSessionIdleTimer();
      broadcastUIState();
      const sid = globalUIState.sessionId;
      if (sid) {
        void (async () => {
          try {
            const c = await fetchFeedbackCountFresh(sid);
            if (globalUIState.sessionId !== sid) return;
            globalUIState.totalCount = c.total;
            globalUIState.openCount = c.open;
            globalUIState.resolvedCount = c.resolved;
            broadcastUIState();
          } catch (err) {
            console.error("[ECHLY] refresh counts after ticket deleted failed", err);
          }
        })();
      }
    }
    sendResponse({ ok: true });
    return false;
  }

  if (request.type === "ECHLY_SET_ACTIVE_SESSION") {
    const sessionId = (request as { sessionId?: string }).sessionId ?? null;
    activeSessionId = sessionId;
    globalUIState.sessionId = sessionId;
    globalUIState.sessionModeActive = true;
    globalUIState.sessionPaused = false;
    globalUIState.sessionLoading = Boolean(sessionId);
    globalUIState.totalCount = 0;
    globalUIState.openCount = 0;
    globalUIState.resolvedCount = 0;
    resetPaginationState();
    globalUIState.lastSyncedAt = null;
    globalUIState.lastPaginationAt = null;
    chrome.storage.local.set({
      activeSessionId: sessionId,
      sessionModeActive: true,
      sessionPaused: false,
    });
    if (sessionId) {
      globalUIState.expanded = true;
      resetSessionIdleTimer();
    }
    broadcastUIState();
    (async () => {
      if (!sessionId) {
        globalUIState.pointers = [];
        globalUIState.totalCount = 0;
        globalUIState.openCount = 0;
        globalUIState.resolvedCount = 0;
        resetPaginationState();
        globalUIState.lastSyncedAt = null;
        globalUIState.lastPaginationAt = null;
        globalUIState.sessionLoading = false;
        broadcastUIState();
        sendResponse({ success: true });
        return;
      }
      try {
        await rehydrateSession(sessionId);
        const sessionsRes = await apiFetch(`${API_BASE}/api/sessions`);
        const sessionsPayload: unknown = await sessionsRes.json();
        if (sessionsRes.ok) {
          const sessionsList = sessionsArrayFromApiPayload(sessionsPayload);
          const match = sessionsList.find((s) => s.id === sessionId);
          globalUIState.sessionTitle = match?.title ?? null;
        }
      } catch (error) {
        console.error("[ECHLY] set active session rehydrate failed", { sessionId, error });
        globalUIState.pointers = [];
        globalUIState.totalCount = 0;
        globalUIState.openCount = 0;
        globalUIState.resolvedCount = 0;
        resetPaginationState();
        globalUIState.lastSyncedAt = null;
        globalUIState.lastPaginationAt = null;
      }
      globalUIState.sessionLoading = false;
      broadcastUIState();
      sendResponse({ success: true });
    })();
    return true;
  }

  if (request.type === "ECHLY_LOAD_MORE") {
    const sessionId = activeSessionId ?? globalUIState.sessionId;
    if (sessionId) {
      void drainAllFeedbackPages(sessionId);
    }
    sendResponse({ ok: true });
    return false;
  }

  if (request.type === "ECHLY_OPEN_TAB") {
    const url = (request as { url?: string }).url;
    if (url) {
      chrome.tabs.create({ url });
    }
    sendResponse({ success: true });
    return true;
  }

  if (request.type === "ECHLY_OPEN_DASHBOARD") {
    chrome.tabs.create({ url: `${WEB_APP_URL}/dashboard` });
    sendResponse({ success: true });
    return true;
  }

  if (request.type === "ECHLY_OPEN_BILLING") {
    chrome.tabs.create({ url: `${WEB_APP_URL}/settings/billing` });
    sendResponse({ success: true });
    return true;
  }

  if (request.type === "ECHLY_SESSION_MODE_START") {
    echlyLog("BACKGROUND", "session start broadcast");
    globalUIState.sessionModeActive = true;
    globalUIState.sessionPaused = false;
    globalUIState.sessionId = activeSessionId;
    globalUIState.expanded = true;
    persistSessionLifecycleState();
    broadcastUIState();
    resetSessionIdleTimer();
    sendResponse({ ok: true });
    return false;
  }

  if (request.type === "ECHLY_SESSION_ACTIVITY") {
    resetSessionIdleTimer();
    sendResponse({ ok: true });
    return false;
  }

  if (request.type === "ECHLY_SESSION_MODE_PAUSE") {
    echlyLog("BACKGROUND", "session pause broadcast");
    globalUIState.sessionModeActive = true;
    globalUIState.sessionPaused = true;
    globalUIState.sessionId = activeSessionId;
    persistSessionLifecycleState();
    broadcastUIState();
    resetSessionIdleTimer();
    sendResponse({ ok: true });
    return false;
  }

  if (request.type === "ECHLY_SESSION_MODE_RESUME") {
    echlyLog("BACKGROUND", "session resume broadcast");
    globalUIState.sessionModeActive = true;
    globalUIState.sessionPaused = false;
    globalUIState.sessionId = activeSessionId;
    persistSessionLifecycleState();
    broadcastUIState();
    resetSessionIdleTimer();
    sendResponse({ ok: true });
    return false;
  }

  if (request.type === "ECHLY_SESSION_MODE_END") {
    echlyLog("BACKGROUND", "session end broadcast");
    clearSessionIdleTimer();
    activeSessionId = null;
    globalUIState.sessionId = null;
    globalUIState.sessionTitle = null;
    globalUIState.sessionModeActive = false;
    globalUIState.sessionPaused = false;
    globalUIState.sessionLoading = false;
    globalUIState.totalCount = 0;
    globalUIState.openCount = 0;
    globalUIState.resolvedCount = 0;
    globalUIState.pointers = [];
    resetPaginationState();
    globalUIState.lastSyncedAt = null;
    globalUIState.lastPaginationAt = null;
    chrome.storage.local.set({
      activeSessionId: null,
      sessionModeActive: false,
      sessionPaused: false,
    });
    broadcastUIState();
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs
            .sendMessage(tab.id, { type: "ECHLY_RESET_WIDGET" })
            .catch((error) => logMessageDeliveryError("ECHLY_RESET_WIDGET", error));
        }
      });
    });
    sendResponse({ success: true });
    return true;
  }

  if (request.type === "ECHLY_GET_EXTENSION_TOKEN") {
    (async () => {
      try {
        const token = await getOrRefreshToken();
        sw.extensionToken = token;
        sendResponse({ token });
      } catch (error) {
        console.error("[ECHLY AUTH] Failed to get extension token", error);
        sendResponse({ token: null, error: "NOT_AUTHENTICATED" });
      }
    })();
    return true;
  }

  if (request.type === "ECHLY_SET_EXTENSION_TOKEN") {
    const { extensionToken: tok, user: u } = request as {
      extensionToken?: string;
      user?: { uid?: string; email?: string | null };
    };
    if (tok) {
      extensionToken = tok;
      extensionTokenExpiresAt = Date.now() + EXTENSION_TOKEN_TTL_MS;
      setExtensionToken(tok);
      sw.extensionToken = tok;
      if (u?.uid) {
        cachedSessionUser = {
          uid: u.uid,
          name: null,
          email: u.email ?? null,
          photoURL: null,
        };
        sw.currentUser = cachedSessionUser;
      }
      const sessionIdForRehydrate = activeSessionId ?? globalUIState.sessionId;
      if (sessionIdForRehydrate) {
        void rehydrateSession(sessionIdForRehydrate);
      }
    }
    sendResponse({ ok: true });
    return false;
  }

  if (request.type === "ECHLY_AUTH_INVALID") {
    extensionToken = null;
    extensionTokenExpiresAt = null;
    sw.extensionToken = null;
    sw.currentUser = null;
    cachedSessionUser = null;
    setExtensionToken(null);
    sendResponse({ ok: true });
    return false;
  }

  if (request.type === "ECHLY_GET_AUTH_STATE" || request.type === "GET_AUTH_STATE") {
    (async () => {
      const authState = await getAuthStateResponse();
      sendResponse(authState);
    })();
    return true;
  }

  if (request.type === "ECHLY_VERIFY_DASHBOARD_SESSION") {
    (async () => {
      const valid = await verifyDashboardSession();
      sendResponse({ valid });
    })();
    return true;
  }

  if (request.type === "ECHLY_OPEN_POPUP") {
    (async () => {
      const authenticated = await requireAuthForExplicitOpen();
      sendResponse({ ok: authenticated, authenticated });
    })();
    return true;
  }

  if (request.type === "ECHLY_SIGN_IN" || request.type === "ECHLY_START_LOGIN" || request.type === "LOGIN") {
    chrome.tabs.create({ url: LOGIN_URL });
    sendResponse({ success: true });
    return true;
  }

  if (request.type === "ECHLY_TRIGGER_LOGIN") {
    (async () => {
      try {
        await openOrFocusLoginTab();
        sendResponse({ ok: true });
      } catch (error) {
        console.error("[ECHLY] trigger login failed", error);
        sendResponse({ ok: false });
      }
    })();
    return true;
  }

  if (request.type === "START_RECORDING") {
    if (activeSessionId === null) {
      sendResponse({ ok: false, error: "No active session selected." });
      return false;
    }
    globalUIState.sessionId = activeSessionId;
    globalUIState.isRecording = true;
    broadcastUIState();
    resetSessionIdleTimer();
    sendResponse({ ok: true });
    return false;
  }
  if (request.type === "STOP_RECORDING") {
    globalUIState.isRecording = false;
    broadcastUIState();
    sendResponse({ ok: true });
    return false;
  }

  if (request.type === "CAPTURE_TAB") {
    (async () => {
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          chrome.tabs.captureVisibleTab(sender.tab!.windowId, { format: "png" }, (result) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError?.message ?? "Capture failed"));
              return;
            }
            resolve(result);
          });
        });
        sendResponse({ success: true, screenshot: dataUrl });
      } catch (error) {
        sendResponse({ success: false });
      }
    })();
    return true;
  }

  if (request.type === "ECHLY_UPLOAD_SCREENSHOT") {
    (async () => {
      try {
        const { imageDataUrl, sessionId, screenshotId } = request as {
          imageDataUrl: string;
          sessionId: string;
          screenshotId?: string;
        };

        await getOrRefreshToken();

        const res = await apiFetch(`${API_BASE}/api/upload-screenshot`, {
          method: "POST",
          body: JSON.stringify({
            imageDataUrl,
            sessionId,
            screenshotId,
          }),
        });

        const envelope = (await res.json()) as {
          success?: boolean;
          data?: { screenshotId?: string; url?: string };
          error?: { message?: string };
        };

        if (!res.ok || envelope.success === false) {
          sendResponse({
            error: envelope.error?.message || "Upload failed",
          });
          return;
        }

        sendResponse({
          screenshotId: envelope.data?.screenshotId,
          url: envelope.data?.url,
        });
      } catch (err) {
        console.error("ECHLY_UPLOAD_SCREENSHOT error:", err);
        sendResponse({ error: String(err) });
      }
    })();
    return true;
  }

  if (request.type === "ECHLY_CREATE_FEEDBACK") {
    (async () => {
      if (ECHLY_STRICT_MODE && request.type !== "ECHLY_CREATE_FEEDBACK") {
        console.error("[GUARDRAIL] Invalid create path attempted");
      }
      const { sessionId, feedbackId, ticket, screenshotId } = request.payload as {
        sessionId: string;
        feedbackId: string;
        ticket: {
          title?: string;
          instruction?: string;
          description?: string;
          suggestedTags?: string[];
          actionSteps?: string[];
        };
        screenshotId?: string;
      };
      if (!screenshotId) {
        if (ECHLY_STRICT_MODE) {
          console.error("[GUARDRAIL] Missing screenshotId — blocked");
          sendResponse({ success: false, error: "guardrail_violation" });
          return;
        }

        console.warn("[ECHLY] Missing screenshotId — blocked");
        sendResponse({ success: false, error: "missing_screenshot_id" });
        return;
      }
      const senderTabId = sender?.tab?.id;

      if (!senderTabId) {
        console.warn("[ECHLY] Missing sender tabId for feedback", feedbackId);
        sendResponse({ success: false, error: "missing_tab" });
        return;
      }

      if (!feedbackJobOwners.has(feedbackId)) {
        feedbackJobOwners.set(feedbackId, senderTabId);
      }

      const ownerTabId = feedbackJobOwners.get(feedbackId);

      if (ownerTabId !== senderTabId) {
        console.warn("[ECHLY] Blocked: not job owner", {
          feedbackId,
          senderTabId,
          ownerTabId,
        });

        sendResponse({ success: true, suppressed: true, reason: "not_job_owner" });
        return;
      }

      if (processingFeedbackIds.has(feedbackId)) {
        console.warn("[ECHLY] Duplicate blocked (atomic lock)", feedbackId);
        sendResponse({ success: true, suppressed: true, reason: "locked" });
        return;
      }

      processingFeedbackIds.add(feedbackId);
      try {
        if (await isFeedbackCompleted(feedbackId)) {
          console.warn("[ECHLY] Duplicate blocked (already completed)", feedbackId);
          sendResponse({ success: true, suppressed: true });
          return;
        }

        await getOrRefreshToken();
        const feedbackRes = await createFeedbackInternal({
          sessionId,
          feedbackId,
          ticket,
          screenshotId,
        });

        const data = (await feedbackRes.json()) as {
          success?: boolean;
          error?: { message?: string };
        };

        if (!feedbackRes.ok || data.success === false) {
          sendResponse({
            success: false,
            error: data?.error?.message || "API failed",
          });
          return;
        }

        await markFeedbackCompleted(feedbackId);
        sendResponse({ success: true, data });
      } catch (err) {
        console.error("[ECHLY ERROR] background create failed", err);
        sendResponse({ success: false });
      } finally {
        processingFeedbackIds.delete(feedbackId);
        feedbackJobOwners.delete(feedbackId);
      }
    })();
    return true; // REQUIRED for async response
  }

  if (request.type === "echly-api") {
    const { url, method, headers, body } = request as {
      url: string;
      method?: string;
      headers?: Record<string, string>;
      body?: string | null;
      token?: string;
    };
    (async () => {
      try {
        const token = await getOrRefreshToken();
        if (!token) {
          throw new Error("NOT_AUTHENTICATED");
        }
        const res = await apiFetch(url, {
          method: method || "GET",
          headers: headers ?? {},
          body: body ?? undefined,
        });
        const text = await res.text();
        const out: Record<string, string> = {};
        res.headers.forEach((v, k) => {
          out[k] = v;
        });
        sendResponse({ ok: res.ok, status: res.status, headers: out, body: text });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const isAuth = message === "NOT_AUTHENTICATED" || message.includes("NOT_AUTHENTICATED");
        sendResponse({
          ok: false,
          status: isAuth ? 401 : 0,
          headers: { "content-type": "application/json" },
          body: JSON.stringify(
            isAuth
              ? { error: "NOT_AUTHENTICATED" }
              : { error: "ECHLY_API_PROXY_ERROR", message }
          ),
        });
      }
    })();
    return true;
  }

  return false;
});
