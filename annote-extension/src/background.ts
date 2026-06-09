/**
 * Extension background (service worker). Centralizes auth + token handling.
 * Uses backend session: POST /api/extension/session (credentials: include) for extensionToken.
 * Content scripts never hold tokens; all API requests go through background with Bearer token.
 */
import { ECHLY_DEBUG } from "../../lib/utils/logger";
import { echlyLog } from "../../lib/debug/echlyLogger";
import { setExtensionToken, apiFetch } from "../utils/apiFetch";
import { API_BASE, WEB_APP_URL } from "../config";
import { requireApiSuccessData } from "@/lib/api/apiEnvelope";
import { buildFeedbackPayload } from "@/utils/buildFeedbackPayload";
import { ECHLY_STRICT_MODE } from "@/lib/guardrails";
import type { ConsoleLogEntry, ExceptionEntry } from "./console/types";
import type { NetworkRequestEntry } from "./network/types";
import type { UserAction } from "./actions/types";

const LOGIN_URL = `${WEB_APP_URL}/login`;
/**
 * Extension token TTL. The backend signs the JWT with `.setExpirationTime("15m")`
 * (app/api/extension/session/route.ts), so 15m is a HARD server-side ceiling — the
 * server 401s the token the moment its `exp` passes. We treat it as valid for 14 min
 * (1-min skew margin) and MUST NOT raise past 15m: a longer client TTL would make us
 * present an already-expired JWT and every API call would 401. (The 55-min figure used
 * by the web app's authFetch is its Firebase ID token — a different token, 1h lifetime —
 * not this extension JWT.) To extend this, change `setExpirationTime` server-side first.
 */
const EXTENSION_TOKEN_TTL_MS = 14 * 60 * 1000;

/**
 * chrome.storage.local key holding the persisted extension token + its absolute expiry.
 * chrome.storage.local is extension-private (only this extension's contexts can read it),
 * so persisting the short-lived (≤15m) extension token here matches the web app's
 * precedent of caching its own short-lived token client-side. Persisting lets a cold
 * service-worker restart rehydrate the token from storage instead of doing a blocking
 * network refresh on the widget-open path (see the startup IIFE + getOrRefreshToken).
 */
const PERSISTED_TOKEN_KEY = "echlyExtensionToken";

/**
 * Persisted-user shape. We store the SAME minimal fields the session endpoint / broker
 * supply (the only ones ever populated: name and photoURL are always null from those
 * sources). Restoring this on rehydrate is essential — hydrateAuthState gates auth on
 * sw.currentUser?.uid, so a token-only rehydrate would read as UNauthenticated and pop a
 * spurious login tab for a genuinely-signed-in user on the first open after a cold SW.
 */
type PersistedUser = { uid: string; email: string | null; workspaceName: string | null };
type PersistedToken = { token: string; expiresAt: number; user: PersistedUser | null };

/**
 * Mirror the in-memory token (and the user it authenticates) to chrome.storage.local.
 * `expiresAt` is the absolute mint-time expiry (already ≤ the JWT's 15m exp because mint
 * happens right after the server signs it), so a later rehydrate respects the real
 * remaining lifetime rather than resetting the clock. Fire-and-forget — never block a
 * token mint on the write.
 */
function persistTokenToStorage(token: string, expiresAt: number, user: PersistedUser | null): void {
  const value: PersistedToken = { token, expiresAt, user };
  chrome.storage.local.set({ [PERSISTED_TOKEN_KEY]: value }).catch((err) => {
    if (ECHLY_DEBUG) console.debug("[ECHLY] persist token failed", err);
  });
}

/** Derive the persisted-user payload from the current in-memory user (null if none). */
function persistedUserFromCurrent(): PersistedUser | null {
  const u = sw.currentUser;
  if (!u?.uid) return null;
  return { uid: u.uid, email: u.email ?? null, workspaceName: u.workspaceName ?? null };
}

/**
 * Remove the persisted token. MUST be called at every in-memory invalidation site
 * (sign-out / auth-invalid / workspace-switch / refresh failure) so a signed-out or
 * de-authed user cannot have a live token resurrected from storage on the next SW boot.
 */
function clearPersistedToken(): void {
  chrome.storage.local.remove(PERSISTED_TOKEN_KEY).catch((err) => {
    if (ECHLY_DEBUG) console.debug("[ECHLY] clear persisted token failed", err);
  });
}

/**
 * Adopt a persisted token into the in-memory module vars at startup, IF it is well-formed
 * and not yet expired (with the same 1-min skew margin used everywhere else, so we never
 * adopt a token that's about to die on the very next request). An expired/garbage entry is
 * ignored (and proactively cleared) so getOrRefreshToken falls through to a fresh refresh.
 * Note: `value` is `unknown` because it comes straight from storage — validate before trust.
 */
function rehydratePersistedToken(value: unknown): void {
  const SKEW_MS = 60 * 1000;
  if (
    value &&
    typeof value === "object" &&
    typeof (value as PersistedToken).token === "string" &&
    (value as PersistedToken).token.length > 0 &&
    typeof (value as PersistedToken).expiresAt === "number"
  ) {
    const { token, expiresAt, user } = value as PersistedToken;
    if (Date.now() < expiresAt - SKEW_MS) {
      extensionToken = token;
      extensionTokenExpiresAt = expiresAt;
      setExtensionToken(token);
      sw.extensionToken = token;
      // Restore the user too, so hydrateAuthState (which requires sw.currentUser?.uid)
      // reports authenticated on the warm path without a network refresh. Without this,
      // the rehydrated token is useless and every cold-start open would still hit /session.
      if (user && typeof user.uid === "string" && user.uid.length > 0) {
        sw.currentUser = {
          uid: user.uid,
          name: null,
          email: user.email ?? null,
          photoURL: null,
          workspaceName: user.workspaceName ?? null,
        };
        cachedSessionUser = sw.currentUser;
      }
      if (ECHLY_DEBUG) {
        console.log(
          `[ECHLY] rehydrated extension token + user from storage (~${Math.round((expiresAt - Date.now()) / 1000)}s left)`
        );
      }
      return;
    }
  }
  // Nothing usable — make sure no stale entry lingers.
  if (value) clearPersistedToken();
}

/**
 * ── Open-path latency instrumentation ──────────────────────────────────────────
 * Six marks from the perf-audit measurement recipe, emitted only when ECHLY_DEBUG.
 * `perfMark` logs the delta from the run's t0 (handler entry) so a warm/cold/cold-token
 * open can be read off the console without external tooling. Zero cost when debug is off.
 */
function perfMark(label: string, t0: number): void {
  if (!ECHLY_DEBUG) return;
  // performance.now() is monotonic and available in SW; falls back to 0 offset if absent.
  const now = typeof performance !== "undefined" ? performance.now() : t0;
  console.log(`[ECHLY PERF] ${label} +${(now - t0).toFixed(1)}ms`);
}
function perfNow(): number {
  return typeof performance !== "undefined" ? performance.now() : 0;
}

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
  // Wipe the storage copy too, so a cold SW boot can't rehydrate a token the
  // server just rejected / a signed-out user no longer owns.
  clearPersistedToken();
}

function logMessageDeliveryError(context: string, error: unknown): void {
  console.error(`[ECHLY MESSAGE] ${context} failed`, error);
}

/* In-memory mirror of chrome.storage.local.echlyActive — avoids 10-50ms async I/O
   on every tab switch / page load. Kept in sync with every storage write below. */
let cachedEchlyActive = false;

/* Tabs known to have the content script loaded. Lets us skip the executeScript probe
   (50-150ms) on subsequent activations of the same tab. Cleared on navigation/removal. */
const injectedTabs = new Set<number>();

/* Tabs known to have the MAIN-world capture scripts (mainWorld.js + mainWorldNetwork.js
   + mainWorldActions.js) injected. Sibling to injectedTabs but tracked independently —
   capture is now session-gated and injected programmatically (Phase M1 migration), so a
   tab can have bootstrap without capture, and vice versa is impossible. Cleared on
   navigation/removal so the next inject call after navigation re-installs into the new
   page realm. */
const captureInjectedTabs = new Set<number>();

/** Send a runtime message with bounded retries to handle the brief window
 *  where the content script's listener isn't registered yet. Silent on final failure
 *  (tab may have navigated away). */
async function sendMessageWithRetry(
  tabId: number,
  message: unknown,
  maxRetries = 3,
  delayMs = 100
): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await chrome.tabs.sendMessage(tabId, message);
      return;
    } catch {
      if (i < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
      }
    }
  }
}

/**
 * Fix 3.1: fire-and-forget "the widget is opening" ping. Sent as the VERY FIRST thing on
 * every explicit-open entry point — before requireAuthForExplicitOpen and every await — so
 * bootstrap can paint a static skeleton within a frame of the click, while the SW is still
 * resolving auth and the widget bundle is still downloading. Errors (tab has no bootstrap,
 * chrome:// page, tab gone) are swallowed silently: this is pure best-effort UI warming.
 */
function sendOpeningSignal(tabId: number | undefined): void {
  if (typeof tabId !== "number") return;
  chrome.tabs.sendMessage(tabId, { type: "ECHLY_OPENING" }).catch(() => { /* no bootstrap / restricted page */ });
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

async function startSessionInActiveTab(): Promise<void> {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tabId = tabs[0]?.id;
  if (!tabId) return;
  const injected = await ensureContentScriptInjected(tabId);
  if (!injected) return;
  chrome.tabs
    .sendMessage(tabId, { type: "ECHLY_START_SESSION" })
    .catch((error) => logMessageDeliveryError("ECHLY_START_SESSION", error));
}

chrome.action.onClicked.addListener((tab) => {
  // onClicked hands us the clicked tab directly — no tabs.query needed (Fix 4.1).
  const tabId = tab?.id;
  if (typeof tabId === "number") sw.lastUserTabId = tabId;

  // trayOpen is a synchronous module flag, so we can branch open-vs-close before any
  // await. On the OPEN path, fire ECHLY_OPENING as the very first thing so bootstrap
  // paints the skeleton immediately, in parallel with auth + the widget bundle load.
  if (!trayOpen) {
    sendOpeningSignal(tabId);
    void openRecorderUI(tabId);
    return;
  }

  // CLOSE path (tray was open): toggle off. No skeleton involved.
  void (async () => {
    globalUIState.visible = false;
    globalUIState.expanded = false;
    trayOpen = false;
    cachedEchlyActive = false;
    /* Stage 2 — TRAY-CLOSE stop-signal (icon-toggle-off path). The user fully
       closed the tray, so they are no longer engaged: stop capture and purge the
       engagement buffer (memory + storage). Per the locked design we deliberately
       LEAVE any active session as-is (orphaned, matching today's behavior) rather
       than auto-ending it. */
    stopAndPurgeCapture();
    await chrome.storage.local.set({ echlyActive: false });
    broadcastUIState();
    if (typeof tabId === "number") {
      chrome.tabs
        .sendMessage(tabId, { type: "ECHLY_CLOSE_WIDGET" })
        .catch((error) => logMessageDeliveryError("ECHLY_CLOSE_WIDGET", error));
    }
  })();
});

type StoredUser = { uid: string; name: string | null; email: string | null; photoURL: string | null; workspaceName: string | null };
type FeedbackApiItem = { id: string; title?: string; description?: string; type?: string; screenshotId?: string | null; tags?: string[]; pageArea?: string | null; userAgent?: string | null; viewportWidth?: number | null; viewportHeight?: number | null; devicePixelRatio?: number | null; createdAt?: string | null };
type FeedbackListResponse = {
  feedback?: FeedbackApiItem[];
  nextCursor?: string | null;
  hasMore?: boolean;
};

function parseFeedbackListResponse(raw: unknown): FeedbackListResponse {
  const inner = requireApiSuccessData<{
    feedback: FeedbackApiItem[];
    nextCursor?: string | null;
    hasMore?: boolean;
  }>(raw);
  if (!Array.isArray(inner.feedback)) {
    throw new Error("parseFeedbackListResponse: feedback must be an array");
  }
  return {
    feedback: inner.feedback,
    nextCursor: typeof inner.nextCursor === "string" ? inner.nextCursor : null,
    hasMore: inner.hasMore === true,
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

/**
 * In-memory extension token (from auth broker page or /api/extension/session).
 * ALSO mirrored to chrome.storage.local under PERSISTED_TOKEN_KEY (extension-private)
 * so a cold service-worker restart can rehydrate it without a blocking network refresh
 * on the widget-open path. Every mint writes through; every invalidation clears both.
 */
let extensionToken: string | null = null;
/** When the in-memory token expires (absolute timestamp, ms). Persisted alongside the token. */
let extensionTokenExpiresAt: number | null = null;
/** Cached user from last successful session response; used for ECHLY_GET_AUTH_STATE. */
let cachedSessionUser: StoredUser | null = null;

let cachedBillingUsage: {
  feedbackTicketsUsed?: number;
  feedbackTicketsLimit?: number | null;
  canCreateFeedback?: boolean;
} | null = null;
let billingUsageCachedAt = 0;
const BILLING_USAGE_CACHE_TTL = 5 * 60 * 1000;

/** Tray toggle state: icon click opens when false, closes when true (Loom-style). */
let trayOpen = false;

/** Minimal ticket shape for global tray; matches StructuredFeedback. */
type StructuredFeedback = { id: string; title: string; description?: string; type?: string; screenshotId?: string | null; tags?: string[]; pageArea?: string | null; userAgent?: string | null; viewportWidth?: number | null; viewportHeight?: number | null; devicePixelRatio?: number | null; createdAt?: string | number | null };
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
  feedbackLimitReached: boolean;
  feedbackLimitMessage: string | null;
  feedbackUpgradePlan: string | null;
  feedbackJobs: Array<{ id: string; status: string; createdAt: number; errorMessage?: string }>;
  editPauseTooltipVisible: boolean;
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
  feedbackLimitReached: boolean;
  feedbackLimitMessage: string | null;
  feedbackUpgradePlan: string | null;
  feedbackJobs: Array<{ id: string; status: string; createdAt: number; errorMessage?: string }>;
  editPauseTooltipVisible: boolean;
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
  feedbackLimitReached: false,
  feedbackLimitMessage: null,
  feedbackUpgradePlan: null,
  feedbackJobs: [],
  editPauseTooltipVisible: false,
};

function mapFeedbackToPointers(feedback: FeedbackApiItem[]): StructuredFeedback[] {
  return feedback.map((item) => ({
    id: item.id,
    title: item.title ?? "",
    description: item.description ?? "",
    type: item.type ?? "Feedback",
    screenshotId: item.screenshotId ?? null,
    tags: item.tags ?? [],
    pageArea: item.pageArea ?? null,
    userAgent: item.userAgent ?? null,
    viewportWidth: item.viewportWidth ?? null,
    viewportHeight: item.viewportHeight ?? null,
    devicePixelRatio: item.devicePixelRatio ?? null,
    createdAt: item.createdAt ?? null,
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
  globalUIState.sessionLoading = sessionChanged || mode === "forced_recovery" || globalUIState.pointers.length === 0;
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
      if (counts.title != null) {
        globalUIState.sessionTitle = counts.title;
      }
      const now = Date.now();
      globalUIState.lastSyncedAt = now;
      globalUIState.lastPaginationAt = null;
      // Bail if session was ended while we were fetching
      if (activeSessionId === null) {
        globalUIState.sessionLoading = false;
        return;
      }
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
    setTimeout(() => {
      if (activeSessionId === sessionId && globalUIState.sessionId === sessionId) {
        void drainAllFeedbackPages(sessionId);
      }
    }, 5000);
  }
}

async function fetchFeedbackCountFresh(sessionId: string): Promise<SessionCounts & { title: string | null }> {
  const res = await apiFetch(`${API_BASE}/api/sessions/${encodeURIComponent(sessionId)}`);
  if (!res.ok) {
    throw new Error("session_meta_failed_" + res.status);
  }
  const raw = await res.json();
  const inner = requireApiSuccessData<{ session: Record<string, unknown> }>(raw);
  const s = inner.session;
  if (!s || typeof s !== "object") {
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
  const title = typeof s.title === "string" ? s.title : null;
  return { total, open, resolved, title };
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
  if (activeSessionId === null) return;
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
  chrome.alarms.clear("echly-keepalive");
  /* Stage 2 — SESSION-END stop-signal (IDLE end). Idle is a session-end, so stop
     capture and purge the engagement buffer. See ECHLY_SESSION_MODE_END for the
     lingering-wrappers limitation. */
  stopAndPurgeCapture();
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
  globalUIState.feedbackJobs = [];
  cachedEchlyActive = false;
  chrome.storage.local.set({
    activeSessionId: null,
    sessionModeActive: false,
    sessionPaused: false,
    echlyActive: false,
  });
  broadcastUIState(true);
  setTimeout(() => {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, { type: "ECHLY_RESET_WIDGET" }).catch(() => {});
        }
      });
    });
  }, 150);
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

/**
 * Hydrate session state from already-read storage values. The caller (startup IIFE)
 * batches activeSessionId/sessionModeActive/sessionPaused into its single storage.get
 * (Fix 4.2) and passes them here, so this no longer does its own redundant read.
 */
async function initializeSessionState(result: {
  activeSessionId?: string;
  sessionModeActive?: boolean;
  sessionPaused?: boolean;
}): Promise<void> {
  activeSessionId =
    typeof result.activeSessionId === "string" ? result.activeSessionId : null;

  globalUIState.sessionId = activeSessionId;
  globalUIState.sessionModeActive = result.sessionModeActive === true;
  globalUIState.sessionPaused = result.sessionPaused === true;

  const isColdStartRestart = activeSessionId != null && globalUIState.lastSyncedAt == null;
  const shouldReloadPointers = isColdStartRestart;

  if (shouldReloadPointers) {
    await rehydrateSession(activeSessionId!).catch(() => { /* logged in rehydrateSession */ });
    return;
  }

  globalUIState.sessionModeActive = false;
  globalUIState.totalCount = 0;
  globalUIState.openCount = 0;
  globalUIState.resolvedCount = 0;
  resetPaginationState();
  globalUIState.lastSyncedAt = null;
  globalUIState.lastPaginationAt = null;
}

chrome.runtime.onInstalled.addListener(() => {
  if (ECHLY_DEBUG) console.log("[ECHLY] extension installed or updated");
});

self.addEventListener("activate", () => {
  if (ECHLY_DEBUG) console.log("[ECHLY] service worker activated");
});

// Keep SW alive while sessions are active via port connection
const keepalivePorts = new Set<chrome.runtime.Port>();

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "echly-keepalive") {
    keepalivePorts.add(port);
    port.onDisconnect.addListener(() => {
      keepalivePorts.delete(port);
    });
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "echly-keepalive") {
    // No-op — just keeps the SW alive
  } else if (alarm.name === ENGAGEMENT_FLUSH_ALARM) {
    /* Stage 3 safety-net: coarse periodic poke of the active engaged tab to pull a
       live snapshot, so a tab killed without a visibilitychange/beforeunload event
       still contributes its tail to the engagement buffer. Only meaningful while
       engaged; harmless otherwise (no tab handler responds, or the merge no-ops). */
    if (!cachedEchlyActive || currentEngagementId == null) return;
    void (async () => {
      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const tabId = tabs[0]?.id;
        if (typeof tabId === "number") {
          chrome.tabs
            .sendMessage(tabId, { type: "ECHLY_REQUEST_CAPTURE_FLUSH" })
            .catch(() => {});
        }
      } catch {
        // ignore
      }
    })();
  }
});

(async () => {
  try {
    // Fix 4.2: one batched read for everything startup needs — the token rehydrate
    // (Fix 1.2), the engagement/tray flags, and the session keys that
    // initializeSessionState used to fetch in a second round-trip.
    const stored = await chrome.storage.local.get([
      "echlyActive",
      "activeSessionId",
      "sessionModeActive",
      "sessionPaused",
      PERSISTED_TOKEN_KEY,
    ]);

    // Fix 1.2: rehydrate the extension token into the module vars BEFORE anything on
    // the open path can call getOrRefreshToken. Only adopt it if still unexpired — an
    // expired persisted token must fall through to a fresh network refresh, not be
    // trusted. After this, a warm-ish cold SW returns the token instantly (no fetch).
    rehydratePersistedToken(stored?.[PERSISTED_TOKEN_KEY]);

    cachedEchlyActive = !!stored?.echlyActive;
    if (stored?.echlyActive) {
      trayOpen = true;
      globalUIState.visible = true;
      globalUIState.expanded = true;
    }

    await initializeSessionState({
      activeSessionId: typeof stored?.activeSessionId === "string" ? stored.activeSessionId : undefined,
      sessionModeActive: stored?.sessionModeActive === true,
      sessionPaused: stored?.sessionPaused === true,
    });

    broadcastUIState();

    /* Stage 1: cold-start re-arm. If the SW restarted while the user was engaged
       (tray open/minimized or session paused/active), cachedEchlyActive is restored
       from storage but the MAIN-world capture scripts in any pre-restart tab were lost
       (captureInjectedTabs was zeroed) and so were the in-memory engagement buffers.
       Gate on cachedEchlyActive (was session). Restore the persisted (claimed) engagement
       buffer if one exists so a ticket filed post-restart keeps its pre-restart journey;
       otherwise mint a fresh engagement. Then re-inject into the active tab.
       Stale-tab safety: ensureCaptureInjected swallows executeScript failures
       (restricted pages, dead tab IDs) without throwing or polluting the cache. */
    if (cachedEchlyActive) {
      // Resolve the active tab defensively — a tabs.query rejection must not skip
      // establishing the engagement below (else currentEngagementId stays null while
      // cachedEchlyActive=true and every flush is silently dropped).
      let rehydrateTabId: number | undefined;
      try {
        const activeTabs = await chrome.tabs.query({ active: true, currentWindow: true });
        rehydrateTabId = activeTabs[0]?.id;
      } catch (e) {
        if (ECHLY_DEBUG) console.debug("[ECHLY] cold-start active-tab query failed", e);
      }
      try {
        const restored = await restorePersistedEngagement(rehydrateTabId);
        if (restored == null) {
          beginEngagement(rehydrateTabId);
        }
        if (typeof rehydrateTabId === "number") {
          void ensureCaptureInjected(rehydrateTabId);
        }
      } catch (e) {
        if (ECHLY_DEBUG) console.debug("[ECHLY] cold-start capture rehydrate failed", e);
      }
    }

    if (ECHLY_DEBUG) console.log("[ECHLY] service worker initialized");
  } catch (err) {
    console.warn("[ECHLY] worker startup recovery failed", err);
  }
})();

/**
 * Single-flight guard for the network token refresh. When the open path resolves auth
 * in parallel (Fix 2) the widget's own GET_AUTH_STATE can land while requireAuthForExplicitOpen
 * is still mid-refresh; without this guard a cold SW would fire two POST /api/extension/session
 * round-trips. Both callers now await the same in-flight promise. Cleared in `finally`.
 */
let tokenRefreshInFlight: Promise<string> | null = null;

/**
 * Single token path:
 * - valid in-memory token -> return
 * - expired/missing token -> refresh from extension session endpoint (single-flight)
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

  // Coalesce concurrent refreshes into one network round-trip.
  if (tokenRefreshInFlight) return tokenRefreshInFlight;
  tokenRefreshInFlight = refreshTokenFromServer().finally(() => {
    tokenRefreshInFlight = null;
  });
  return tokenRefreshInFlight;
}

/** Network token refresh. Only ever invoked via getOrRefreshToken's single-flight guard. */
async function refreshTokenFromServer(): Promise<string> {
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
      user?: { uid: string; email?: string | null; workspaceName?: string | null };
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
      workspaceName: payload.user.workspaceName ?? null,
    };
    cachedSessionUser = sw.currentUser;
  }
  // Persist token + user together (after currentUser is set) so a cold-SW rehydrate
  // restores both and reads as authenticated without a network refresh.
  persistTokenToStorage(token, extensionTokenExpiresAt, persistedUserFromCurrent());
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

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type JsonObject = { [key: string]: JsonValue };

const STATE_BROADCAST_DEBOUNCE_MS = 120;
let pendingBroadcastTimer: ReturnType<typeof setTimeout> | null = null;
let pendingBroadcastState: CanonicalGlobalState | null = null;
let pendingBroadcastToAllTabs = false;
let lastBroadcastState: CanonicalGlobalState | null = null;

function isPlainObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function jsonEquals(a: JsonValue | undefined, b: JsonValue | undefined): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function buildStatePatch(
  prev: CanonicalGlobalState | null,
  next: CanonicalGlobalState
): Record<string, unknown> {
  if (!prev) return next as unknown as Record<string, unknown>;

  const diff = (before: JsonValue | undefined, after: JsonValue): JsonValue | undefined => {
    if (jsonEquals(before, after)) return undefined;
    if (!isPlainObject(after)) return after;
    if (!isPlainObject(before)) return after;

    const out: JsonObject = {};
    for (const key of Object.keys(after)) {
      const nested = diff(before[key], after[key]);
      if (nested !== undefined) out[key] = nested;
    }
    return Object.keys(out).length > 0 ? out : undefined;
  };

  const patch: Record<string, unknown> = {};
  for (const key of Object.keys(next) as Array<keyof CanonicalGlobalState>) {
    const changed = diff(
      prev[key] as unknown as JsonValue | undefined,
      next[key] as unknown as JsonValue
    );
    if (changed !== undefined) patch[key] = changed;
  }
  return patch;
}

async function getActiveTabIdForBroadcast(): Promise<number | null> {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const activeTabId = tabs[0]?.id;
    if (typeof activeTabId === "number") return activeTabId;
  } catch (error) {
    console.warn("[ECHLY] active tab query failed for broadcast", error);
  }
  if (typeof activeOwnerTabId === "number") return activeOwnerTabId;
  if (typeof sw.lastUserTabId === "number") return sw.lastUserTabId;
  return null;
}

async function flushBroadcastUIState(): Promise<void> {
  pendingBroadcastTimer = null;
  const state = pendingBroadcastState ?? getCanonicalGlobalState();
  const toAllTabs = pendingBroadcastToAllTabs;
  pendingBroadcastState = null;
  pendingBroadcastToAllTabs = false;

  const patch = buildStatePatch(lastBroadcastState, state);
  if (Object.keys(patch).length === 0) return;

  echlyLog("BACKGROUND", "broadcast global state", { patch, toAllTabs });
  try {
    if (toAllTabs) {
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, { type: "ECHLY_GLOBAL_STATE", state, patch }).catch(() => {});
        }
      }
    } else {
      const activeTabId = await getActiveTabIdForBroadcast();
      if (typeof activeTabId === "number") {
        chrome.tabs.sendMessage(activeTabId, { type: "ECHLY_GLOBAL_STATE", state, patch }).catch(() => {});
      }
    }
  } catch {}

  lastBroadcastState = state;
}

function broadcastUIState(toAllTabs = false): void {
  pendingBroadcastState = getCanonicalGlobalState();
  if (toAllTabs) pendingBroadcastToAllTabs = true;
  if (pendingBroadcastTimer != null) return;
  pendingBroadcastTimer = setTimeout(() => {
    void flushBroadcastUIState();
  }, STATE_BROADCAST_DEBOUNCE_MS);
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
    feedbackLimitReached: globalUIState.feedbackLimitReached,
    feedbackLimitMessage: globalUIState.feedbackLimitMessage,
    feedbackUpgradePlan: globalUIState.feedbackUpgradePlan,
    feedbackJobs: [...globalUIState.feedbackJobs],
    editPauseTooltipVisible: globalUIState.editPauseTooltipVisible,
  };
}

/**
 * Ensure the bootstrap content script is loaded in the given tab.
 * Bootstrap is registered statically via manifest content_scripts (runs at document_start on every page),
 * so this should normally be a no-op. The fallback executeScript handles edge cases where the static
 * registration didn't fire (extension just installed, race conditions). Bootstrap then lazy-loads
 * widget.js on demand — background only needs bootstrap to be present.
 */
async function ensureContentScriptInjected(tabId: number): Promise<boolean> {
  if (injectedTabs.has(tabId)) return true;
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => (window as Window & { __ECHLY_BOOTSTRAP_LOADED__?: boolean }).__ECHLY_BOOTSTRAP_LOADED__ === true,
    });
    if (results?.[0]?.result === true) {
      injectedTabs.add(tabId);
      return true;
    }
  } catch (error) {
    console.warn("[ECHLY] Pre-injection probe failed", { tabId, error });
    // Page may not allow script execution (e.g. chrome://) or bootstrap not yet running.
  }
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["bootstrap.js"],
    });
    injectedTabs.add(tabId);
    return true;
  } catch (e) {
    console.warn("[ECHLY] Failed to inject bootstrap", e);
    return false;
  }
}

/**
 * Ensure the MAIN-world capture scripts (mainWorld.js + mainWorldNetwork.js
 * + mainWorldActions.js) are loaded in the given tab. Phase M1 of the
 * session-driven injection migration: capture is no longer declarative —
 * callers (session-start, tab activation during an active session, etc.)
 * trigger this explicitly. Restricted pages (chrome://, the Web Store)
 * silently fail and are not added to the cache so a later retry on a normal
 * URL can succeed. mainWorldActions.js (Phase A3) inherits the same
 * lifecycle for free — there is no separate gating needed.
 */
async function ensureCaptureInjected(tabId: number): Promise<boolean> {
  if (captureInjectedTabs.has(tabId)) return true;
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      world: "MAIN",
      files: ["mainWorld.js", "mainWorldNetwork.js", "mainWorldActions.js"],
      injectImmediately: true,
    });
    captureInjectedTabs.add(tabId);
    return true;
  } catch (e) {
    if (ECHLY_DEBUG) console.debug("[ECHLY] Failed to inject capture scripts", { tabId, error: e });
    return false;
  }
}

/** Drop a tab from the capture-injected cache. Used on navigation (the old MAIN-world
 *  realm dies, so the next inject call must re-install) and session teardown (M3). */
function clearCaptureInjection(tabId: number): void {
  captureInjectedTabs.delete(tabId);
}

/* ═══════════════════════════════════════════════════════════════════════════
   ENGAGEMENT BUFFER (Stages 3 + 4 — "capture follows Annote engagement")

   The per-page MAIN-world ring buffers die on navigation (the realm is torn
   down). To give a filed ticket the FULL multi-page journey, each engaged tab
   forwards its flush-pushes to the service worker, where they accumulate in a
   long-lived "engagement buffer" keyed by an engagement id. The engagement id
   is minted at tray-open and changes on every re-open / soft-end re-arm, so a
   fresh engagement always starts from a clean buffer (no stale cross-engagement
   bleed).

   Privacy (Stage 4): the buffer lives in SW MEMORY ONLY until the engagement's
   session is CLAIMED (ECHLY_SESSION_MODE_START). Only after a claim do we mirror
   to chrome.storage.local — so activity captured before the user commits to a
   session never touches disk. Both stop-signals (tray-close, every session-end)
   fully purge the in-memory buffer AND any storage mirror.

   The buffer only ever holds ALREADY-REDACTED entries: network-body redaction
   (redactNetwork.ts) and element privacy (privacy.ts) run at capture time, in
   the MAIN world, upstream of every flush-push. The SW never sees raw data.
   ═══════════════════════════════════════════════════════════════════════════ */

/** ~last 10 minutes survive: a bug reported a few minutes after it happened is
 *  kept, but a multi-hour paused session can't grow unbounded. */
const ENGAGEMENT_BUFFER_MAX_AGE_MS = 10 * 60 * 1000;
/** Per-surface entry cap (console logs, console exceptions, network, actions are
 *  each capped independently). Cross-page aggregate; the per-page MAIN buffers
 *  cap at 50, so 200 holds ~4 pages' worth before age/count eviction kicks in. */
const ENGAGEMENT_BUFFER_MAX_ENTRIES_PER_SURFACE = 200;
/** Total serialized-byte cap across all four surfaces for one engagement. Evict
 *  oldest-across-surfaces until under cap. Mirrors the per-page byte caps. */
const ENGAGEMENT_BUFFER_MAX_TOTAL_BYTES = 256 * 1024;
/** chrome.storage.local key prefix for the persisted (post-claim) mirror. */
const ENGAGEMENT_STORAGE_PREFIX = "echlyEngagementBuffer:";
/** Coarse safety-net alarm: pokes the active engaged tab to pull a live snapshot
 *  so a tab killed without an unload event still contributes its tail. Runs only
 *  while engaged (created in beginEngagement, cleared in stopAndPurgeCapture). */
const ENGAGEMENT_FLUSH_ALARM = "echly-engagement-flush";
/** chrome.alarms minimum period is ~1 minute; that's an acceptable coarse net. */
const ENGAGEMENT_FLUSH_PERIOD_MIN = 1;

type EngagementConsoleLog = ConsoleLogEntry;
type EngagementException = ExceptionEntry;
type EngagementNetwork = NetworkRequestEntry;
type EngagementAction = UserAction;

/**
 * Per-engagement ACTIONS WATERMARK (userActions only). Within one engagement, each
 * filed ticket's userActions should contain ONLY the actions that occurred AFTER the
 * previous successfully-filed ticket — so ticket 2+ doesn't repeat ticket 1's journey.
 *
 * This is a FILTER applied at the file-time merge, NOT a buffer-clear: the SW
 * engagement buffer's `actions` array and the MAIN-world ActionBuffer are left intact
 * (console/network are deliberately NOT watermarked — they keep the full engagement
 * window). The watermark advances ONLY after a ticket is successfully created; a failed
 * submission leaves it untouched so a retry re-includes the same actions.
 *
 * `timestamp` is the max timestamp among the actions included in the last filed ticket.
 * `includedIds` are the UUIDs of those included actions whose timestamp EQUALS the
 * watermark timestamp — the millisecond-collision tiebreak so same-ms actions filed in
 * the previous ticket aren't re-emitted while same-ms actions that arrived later still
 * pass. Capped small (it only needs same-ms ids).
 *
 * null = no watermark yet → the engagement's first ticket keeps full history. A fresh
 * engagement (tray re-open, soft-end re-arm) starts with a new buffer whose watermark is
 * null, and the watermark is purged for free when the engagement buffer is purged.
 */
interface ActionsWatermark {
  timestamp: number;
  includedIds: Set<string>;
}

/** Cap on the same-ms tiebreak id set; a single millisecond can only realistically hold
 *  a handful of distinct actions, so this is generous. */
const ACTIONS_WATERMARK_MAX_IDS = 32;

interface EngagementBuffer {
  logs: EngagementConsoleLog[];
  exceptions: EngagementException[];
  network: EngagementNetwork[];
  actions: EngagementAction[];
  /** True once ECHLY_SESSION_MODE_START claimed this engagement; gates persistence. */
  claimed: boolean;
  /** Per-engagement userActions watermark; null until the first ticket is filed. NOT
   *  persisted to storage — see persistEngagementBuffer / restorePersistedEngagement. */
  actionsWatermark: ActionsWatermark | null;
}

/** tabId → engagement id. One engagement per engaged tray; all tabs the user
 *  visits during that engagement share the same id (set on tab activation /
 *  navigation re-arm so every engaged tab forwards into the same buffer). */
const tabEngagementIds = new Map<number, string>();
/**
 * Buffer key → accumulated buffer (memory-resident).
 *
 * PRIVACY-CRITICAL KEY SHAPE: the key is `${engagementId}:${tabId}`, NOT the
 * engagement id alone. Each engaged tab gets its OWN bucket so a ticket filed
 * on tab B never inherits tab A's actions/logs/requests (the cross-tab leak fix
 * — Fix A). Same-tab cross-navigation continuity is preserved for free because
 * a tab keeps its id across navigation, so an X→Y journey in ONE tab keeps one
 * bucket (the engagement id is stable across navigation; it only changes on a
 * tray re-open or soft-end re-arm). Buckets are minted lazily on first flush;
 * `beginEngagement` no longer pre-creates one under the bare engagement id.
 *
 * SW-MEMORY NOTE: eviction caps (count/byte/age) now apply per-tab-bucket, so
 * total resident capture memory ≈ (per-surface caps) × (engaged tabs in the
 * engagement). With the 200-entry / 256 KiB-per-bucket caps that is bounded and
 * acceptable for realistic engaged-tab counts.
 */
const engagementBuffers = new Map<string, EngagementBuffer>();

/** The per-tab bucket key. Engagement id + tab id — see engagementBuffers. */
function bufferKey(engagementId: string, tabId: number): string {
  return `${engagementId}:${tabId}`;
}

/** Prefix that matches every per-tab bucket key of one engagement. Used by the
 *  purge sweep and by per-engagement fan-outs (claim/persist). The trailing ":"
 *  prevents `eng-1` from matching `eng-12`'s keys. */
function engagementKeyPrefix(engagementId: string): string {
  return `${engagementId}:`;
}

/** All live bucket keys belonging to one engagement (any tab). */
function bucketKeysForEngagement(engagementId: string): string[] {
  const prefix = engagementKeyPrefix(engagementId);
  const out: string[] = [];
  for (const key of engagementBuffers.keys()) {
    if (key.startsWith(prefix)) out.push(key);
  }
  return out;
}
/** The engagement id for the CURRENT tray engagement. Minted at tray-open,
 *  re-minted on soft-end re-arm; null when no tray is engaged. */
let currentEngagementId: string | null = null;

/**
 * Engagement ids that have been CLAIMED (session committed → persistable).
 * Claim is an engagement-level property, but buckets are now per-tab and minted
 * lazily (Fix A), so a tab whose first flush lands AFTER session-start would
 * otherwise miss the one-shot claim and never persist. Tracking the claim here
 * lets every bucket — current or future — of a claimed engagement inherit
 * `claimed: true` at creation/merge time. Cleared per engagement on purge.
 */
const claimedEngagementIds = new Set<string>();

function genEngagementId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    // ignore
  }
  return "eng-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}

function emptyEngagementBuffer(): EngagementBuffer {
  return { logs: [], exceptions: [], network: [], actions: [], claimed: false, actionsWatermark: null };
}

/** Stable dedup key per surface. Network + actions carry their own UUID; console
 *  logs/exceptions have NO id (see console/types.ts) so we synthesize a key from the
 *  immutable capture fields. We include the SECONDARY discriminating fields (args/source
 *  for logs; stack/source/line/column for exceptions) so two genuinely-distinct entries
 *  that happen to share timestamp+level+message — common in error storms, exactly what
 *  capture exists to record — are NOT collapsed. Idempotent re-pushes of the truly-same
 *  entry still share all fields and dedup correctly. */
function consoleLogKey(e: EngagementConsoleLog): string {
  const args = Array.isArray(e.args) ? e.args.join("") : "";
  return `${e.timestamp}|${e.level}|${e.message}|${e.source ?? ""}|${args}`;
}
function exceptionKey(e: EngagementException): string {
  return `${e.timestamp}|${e.type}|${e.message}|${e.stack ?? ""}|${e.source ?? ""}|${e.line ?? ""}|${e.column ?? ""}`;
}

/** Mint (or reset to) a fresh engagement and bind it to the given tab. Returns
 *  the new engagement id. Used at tray-open and soft-end re-arm. */
function beginEngagement(tabId?: number): string {
  const id = genEngagementId();
  currentEngagementId = id;
  // Buckets are keyed per-tab (`${engagementId}:${tabId}`) and minted lazily on
  // the tab's first flush (mergeFlushIntoEngagement) — do NOT pre-create one
  // under the bare engagement id, or it becomes an unreachable orphan that the
  // composite-key reads never find.
  if (typeof tabId === "number") tabEngagementIds.set(tabId, id);
  // Start the coarse safety-net flush alarm for this engagement (idempotent —
  // chrome.alarms.create replaces an existing alarm of the same name).
  try {
    chrome.alarms.create(ENGAGEMENT_FLUSH_ALARM, { periodInMinutes: ENGAGEMENT_FLUSH_PERIOD_MIN });
  } catch {
    // ignore
  }
  return id;
}

/** Bind a tab to the current engagement (called when a new/activated/navigated
 *  tab joins an already-engaged tray, so its flushes land in the same buffer). */
function bindTabToCurrentEngagement(tabId: number): void {
  if (currentEngagementId == null) return;
  tabEngagementIds.set(tabId, currentEngagementId);
}

/**
 * Resolve the engagement a tab belongs to.
 *
 * `requireBound` MUST be true for content-script-originated FLUSH ingestion: a tab
 * that has no explicit binding must NOT fall back to currentEngagementId, otherwise a
 * stale page from a purged engagement (whose binding was removed on close/end, but
 * whose MAIN-world wrapper keeps running per the M3 limitation) would bleed its flush
 * into a freshly-minted engagement after a re-open / soft-end re-arm. With requireBound
 * the unbound flush is dropped, preserving the clean-buffer invariant.
 *
 * Without requireBound (the default) we fall back to currentEngagementId — correct for
 * file-time/no-tab-context resolution where the active tab is, by construction, the
 * current engagement.
 */
function resolveEngagementIdForTab(
  tabId: number | undefined,
  requireBound = false
): string | null {
  if (typeof tabId === "number") {
    const bound = tabEngagementIds.get(tabId);
    if (bound != null) return bound;
  }
  return requireBound ? null : currentEngagementId;
}

/** Age + count + byte eviction for one engagement buffer. Oldest-first within
 *  each surface; the byte sweep then trims the globally-oldest entries across
 *  surfaces until the buffer fits ENGAGEMENT_BUFFER_MAX_TOTAL_BYTES. */
function evictEngagementBuffer(buf: EngagementBuffer): void {
  const now = Date.now();
  const cutoff = now - ENGAGEMENT_BUFFER_MAX_AGE_MS;

  buf.logs = buf.logs.filter((e) => e.timestamp >= cutoff);
  buf.exceptions = buf.exceptions.filter((e) => e.timestamp >= cutoff);
  buf.network = buf.network.filter((e) => e.timestamp >= cutoff);
  buf.actions = buf.actions.filter((e) => e.timestamp >= cutoff);

  const cap = ENGAGEMENT_BUFFER_MAX_ENTRIES_PER_SURFACE;
  if (buf.logs.length > cap) buf.logs = buf.logs.slice(buf.logs.length - cap);
  if (buf.exceptions.length > cap) buf.exceptions = buf.exceptions.slice(buf.exceptions.length - cap);
  if (buf.network.length > cap) buf.network = buf.network.slice(buf.network.length - cap);
  if (buf.actions.length > cap) buf.actions = buf.actions.slice(buf.actions.length - cap);

  // Byte-cap sweep: drop the single globally-oldest entry across all surfaces
  // until the serialized buffer fits. Bounded by total entry count.
  let guard = 0;
  while (engagementBufferBytes(buf) > ENGAGEMENT_BUFFER_MAX_TOTAL_BYTES && guard < 4 * cap) {
    guard += 1;
    const oldest = oldestSurface(buf);
    if (oldest == null) break;
    buf[oldest].shift();
  }
}

function engagementBufferBytes(buf: EngagementBuffer): number {
  try {
    return JSON.stringify({
      logs: buf.logs,
      exceptions: buf.exceptions,
      network: buf.network,
      actions: buf.actions,
    }).length;
  } catch {
    return 0;
  }
}

/** Which surface currently holds the globally-oldest entry (by timestamp). */
function oldestSurface(buf: EngagementBuffer): "logs" | "exceptions" | "network" | "actions" | null {
  let best: "logs" | "exceptions" | "network" | "actions" | null = null;
  let bestTs = Infinity;
  const consider = (surface: "logs" | "exceptions" | "network" | "actions") => {
    const head = buf[surface][0];
    if (head && head.timestamp < bestTs) {
      bestTs = head.timestamp;
      best = surface;
    }
  };
  consider("logs");
  consider("exceptions");
  consider("network");
  consider("actions");
  return best;
}

/** Merge an incoming flush snapshot into the per-tab engagement bucket, deduped
 *  per surface, then evict and (if claimed) persist. The bucket is keyed by
 *  `${engagementId}:${tabId}` so each tab accumulates in isolation (Fix A —
 *  prevents the cross-tab privacy leak). `surface` selects which arrays in the
 *  snapshot are relevant; we tolerate a snapshot carrying any subset. */
function mergeFlushIntoEngagement(
  engagementId: string,
  tabId: number,
  snapshot: {
    logs?: EngagementConsoleLog[];
    exceptions?: EngagementException[];
    requests?: EngagementNetwork[];
    actions?: EngagementAction[];
  }
): void {
  const key = bufferKey(engagementId, tabId);
  let buf = engagementBuffers.get(key);
  if (!buf) {
    buf = emptyEngagementBuffer();
    engagementBuffers.set(key, buf);
  }
  // A late-arriving tab in an already-claimed engagement must persist too —
  // inherit the engagement's claim so its mirror survives an SW eviction.
  if (!buf.claimed && claimedEngagementIds.has(engagementId)) {
    buf.claimed = true;
  }

  if (Array.isArray(snapshot.logs) && snapshot.logs.length > 0) {
    const seen = new Set(buf.logs.map(consoleLogKey));
    for (const e of snapshot.logs) {
      const k = consoleLogKey(e);
      if (!seen.has(k)) { seen.add(k); buf.logs.push(e); }
    }
    buf.logs.sort((a, b) => a.timestamp - b.timestamp);
  }
  if (Array.isArray(snapshot.exceptions) && snapshot.exceptions.length > 0) {
    const seen = new Set(buf.exceptions.map(exceptionKey));
    for (const e of snapshot.exceptions) {
      const k = exceptionKey(e);
      if (!seen.has(k)) { seen.add(k); buf.exceptions.push(e); }
    }
    buf.exceptions.sort((a, b) => a.timestamp - b.timestamp);
  }
  if (Array.isArray(snapshot.requests) && snapshot.requests.length > 0) {
    const seen = new Set(buf.network.map((e) => e.id));
    for (const e of snapshot.requests) {
      if (e && !seen.has(e.id)) { seen.add(e.id); buf.network.push(e); }
    }
    buf.network.sort((a, b) => a.timestamp - b.timestamp);
  }
  if (Array.isArray(snapshot.actions) && snapshot.actions.length > 0) {
    const seen = new Set(buf.actions.map((e) => e.id));
    for (const e of snapshot.actions) {
      if (e && !seen.has(e.id)) { seen.add(e.id); buf.actions.push(e); }
    }
    buf.actions.sort((a, b) => a.timestamp - b.timestamp);
  }

  evictEngagementBuffer(buf);
  if (buf.claimed) void persistEngagementBuffer(key);
}

/** Mark the current engagement claimed (session committed) and flush its
 *  current memory state to disk. Idempotent. Fans out over EVERY per-tab bucket
 *  of the current engagement so each tab's mirror is independently persistable —
 *  the privacy isolation (Fix A) must survive an SW eviction + cold-start
 *  restore, otherwise a restore would re-merge all tabs into one bucket. */
function claimCurrentEngagement(): void {
  if (currentEngagementId == null) return;
  // Record the engagement-level claim so buckets minted later (a tab whose first
  // flush arrives after session-start) inherit it in mergeFlushIntoEngagement.
  claimedEngagementIds.add(currentEngagementId);
  const keys = bucketKeysForEngagement(currentEngagementId);
  for (const key of keys) {
    const buf = engagementBuffers.get(key);
    if (!buf) continue;
    buf.claimed = true;
    void persistEngagementBuffer(key);
  }
}

/** Persist ONE per-tab bucket. `mapKey` is the composite `${eng}:${tabId}`
 *  engagementBuffers map key; the storage key mirrors it 1:1 under
 *  ENGAGEMENT_STORAGE_PREFIX so a cold-start restore rebuilds the same per-tab
 *  partitioning. */
async function persistEngagementBuffer(mapKey: string): Promise<void> {
  const buf = engagementBuffers.get(mapKey);
  if (!buf || !buf.claimed) return;
  try {
    await chrome.storage.local.set({
      [ENGAGEMENT_STORAGE_PREFIX + mapKey]: {
        logs: buf.logs,
        exceptions: buf.exceptions,
        network: buf.network,
        actions: buf.actions,
      },
    });
  } catch (e) {
    if (ECHLY_DEBUG) console.debug("[ECHLY] persist engagement buffer failed", e);
  }
}

/** Remove a storage key, swallowing BOTH synchronous throws and promise rejections.
 *  chrome.storage.local.remove returns a promise in MV3; a bare `void chrome...remove()`
 *  leaves a rejection unhandled. The purge invariant only needs best-effort cleanup, but
 *  we must not drop the rejection on the floor. */
function removeStorageKey(key: string): void {
  try {
    void chrome.storage.local.remove(key).catch(() => {});
  } catch {
    // chrome.storage unavailable — ignore.
  }
}

/** Split a persisted bucket storage key back into its (engagementId, tabId)
 *  parts. The stored key is `${PREFIX}${engagementId}:${tabId}`; engagement ids
 *  never contain ":" (see genEngagementId), so the LAST ":" separates the tab
 *  id. Returns null for any malformed/legacy key (e.g. a pre-Fix-A key with no
 *  tab segment), so such orphans are dropped rather than mis-adopted. */
function parseBucketStorageKey(
  storageKey: string
): { engagementId: string; tabId: number } | null {
  const composite = storageKey.slice(ENGAGEMENT_STORAGE_PREFIX.length);
  const lastColon = composite.lastIndexOf(":");
  if (lastColon <= 0 || lastColon === composite.length - 1) return null;
  const engagementId = composite.slice(0, lastColon);
  const tabId = Number(composite.slice(lastColon + 1));
  if (!Number.isInteger(tabId)) return null;
  return { engagementId, tabId };
}

/**
 * Cold-start restore (Stage 4 persist-guard companion). In-memory engagement
 * buffers and currentEngagementId are lost when the SW is evicted. Only CLAIMED
 * engagements were ever mirrored to chrome.storage.local, so on restart we adopt
 * the persisted (claimed) buckets — if any exist — as the current engagement so a
 * ticket filed after the restart still carries the pre-restart journey. There is
 * at most one persisted engagement at a time (both stop-signals purge it), but it
 * now spans MULTIPLE per-tab storage keys (Fix A), so we adopt every bucket of the
 * single adopted engagement and keep them partitioned per tab — the cross-tab
 * isolation survives the restore (a restore must NOT collapse tabs into one bucket).
 * Returns the adopted engagement id, or null if nothing was persisted/adoptable.
 *
 * FRESHNESS GATE (defense-in-depth for the rare case a stop-signal's fire-and-forget
 * storage.remove was lost): after eviction, buckets that are entirely empty (every
 * entry aged past the 10-min window — a stale mirror from a long-dead engagement) are
 * dropped. If EVERY bucket of the adopted engagement is empty we adopt nothing and
 * return null so a fresh engagement is minted instead. A recently-ended session's
 * sub-10-min entries would survive eviction, but the in-memory delete on stop is
 * synchronous and the remove is dispatched before the handler returns, so the
 * realistic loss window is negligible.
 */
async function restorePersistedEngagement(boundTabId?: number): Promise<string | null> {
  try {
    const all = await chrome.storage.local.get(null);
    const keys = Object.keys(all).filter((k) => k.startsWith(ENGAGEMENT_STORAGE_PREFIX));
    if (keys.length === 0) return null;

    // Group persisted bucket keys by engagement id. There should be exactly one
    // engagement; if more slipped through, adopt the first and drop the others'
    // storage keys. Legacy/malformed keys (no tab segment) are dropped outright.
    let adoptedEngagementId: string | null = null;
    const adoptKeys: string[] = [];
    for (const storageKey of keys) {
      const parsed = parseBucketStorageKey(storageKey);
      if (!parsed) {
        removeStorageKey(storageKey);
        continue;
      }
      if (adoptedEngagementId == null) adoptedEngagementId = parsed.engagementId;
      if (parsed.engagementId === adoptedEngagementId) {
        adoptKeys.push(storageKey);
      } else {
        // A second engagement's stale mirror — drop it.
        removeStorageKey(storageKey);
      }
    }
    if (adoptedEngagementId == null || adoptKeys.length === 0) return null;

    let adoptedAny = false;
    for (const storageKey of adoptKeys) {
      const parsed = parseBucketStorageKey(storageKey);
      if (!parsed) continue;
      const raw = all[storageKey] as Partial<EngagementBuffer> | undefined;
      const buf: EngagementBuffer = {
        logs: Array.isArray(raw?.logs) ? raw!.logs! : [],
        exceptions: Array.isArray(raw?.exceptions) ? raw!.exceptions! : [],
        network: Array.isArray(raw?.network) ? raw!.network! : [],
        actions: Array.isArray(raw?.actions) ? raw!.actions! : [],
        claimed: true,
        // Watermark is intentionally NOT persisted (Set isn't JSON-serializable and the
        // cut is a memory-only filter). A cold-start restore therefore begins with no
        // watermark — the first ticket filed post-restart keeps the full restored journey.
        actionsWatermark: null,
      };
      evictEngagementBuffer(buf);
      const isEmpty =
        buf.logs.length === 0 &&
        buf.exceptions.length === 0 &&
        buf.network.length === 0 &&
        buf.actions.length === 0;
      if (isEmpty) {
        // Stale orphan mirror for this tab — drop it.
        removeStorageKey(storageKey);
        continue;
      }
      engagementBuffers.set(bufferKey(adoptedEngagementId, parsed.tabId), buf);
      // Re-bind the tab that produced this bucket so a flush from a still-open
      // page lands back in its own restored bucket rather than minting a new one.
      tabEngagementIds.set(parsed.tabId, adoptedEngagementId);
      adoptedAny = true;
    }

    if (!adoptedAny) return null;
    currentEngagementId = adoptedEngagementId;
    // Adopted buckets were CLAIMED; record the engagement-level claim so a
    // post-restore late-arriving tab also persists (mirrors claimCurrentEngagement).
    claimedEngagementIds.add(adoptedEngagementId);
    if (typeof boundTabId === "number") tabEngagementIds.set(boundTabId, adoptedEngagementId);
    return adoptedEngagementId;
  } catch (e) {
    if (ECHLY_DEBUG) console.debug("[ECHLY] restore persisted engagement failed", e);
    return null;
  }
}

/** Snapshot of ONE TAB's accumulated cross-navigation entries within an
 *  engagement, used at file-time. Reads ONLY the filing tab's bucket
 *  (`${engagementId}:${tabId}`) so the ticket can never inherit a sibling tab's
 *  activity (Fix A — the cross-tab privacy leak). Same-tab navigation history
 *  is fully present because all of that tab's pages share this one bucket. */
function getEngagementSnapshot(
  engagementId: string | null,
  tabId: number | undefined
): {
  logs: EngagementConsoleLog[];
  exceptions: EngagementException[];
  network: EngagementNetwork[];
  actions: EngagementAction[];
} {
  const empty = { logs: [], exceptions: [], network: [], actions: [] };
  if (engagementId == null || typeof tabId !== "number") return empty;
  const buf = engagementBuffers.get(bufferKey(engagementId, tabId));
  if (!buf) return empty;
  evictEngagementBuffer(buf);
  return {
    logs: [...buf.logs],
    exceptions: [...buf.exceptions],
    network: [...buf.network],
    actions: [...buf.actions],
  };
}

/**
 * Stage 3 file-time merge. Union the cross-navigation engagement buffer (all pages
 * this engagement) with the current page's LIVE snapshot — which content.tsx already
 * collected via requestSnapshot and placed on ticket.consoleLogs / exceptions /
 * networkRequests / userActions — deduped by UUID (network/actions) or synthetic key
 * (console — no id field), ordered by timestamp. Returns a NEW ticket object with the
 * four capture surfaces replaced by the merged timeline and the *Count fields
 * recomputed; non-capture ticket fields are passed through untouched.
 *
 * The live page may carry entries the engagement buffer hasn't seen yet (no flush
 * since the last activity) and the buffer carries earlier pages the live snapshot
 * never had — the union is the full timeline. Both inputs are already redacted.
 */
function mergeEngagementIntoTicket(
  engagementId: string | null,
  tabId: number | undefined,
  ticket: Record<string, unknown>
): Record<string, unknown> {
  const eng = getEngagementSnapshot(engagementId, tabId);

  const liveLogs = Array.isArray(ticket.consoleLogs) ? (ticket.consoleLogs as EngagementConsoleLog[]) : [];
  const liveExceptions = Array.isArray(ticket.exceptions) ? (ticket.exceptions as EngagementException[]) : [];
  const liveNetwork = Array.isArray(ticket.networkRequests) ? (ticket.networkRequests as EngagementNetwork[]) : [];
  const liveActions = Array.isArray(ticket.userActions) ? (ticket.userActions as EngagementAction[]) : [];

  const dedupBy = <T,>(items: T[], key: (t: T) => string): T[] => {
    const seen = new Set<string>();
    const out: T[] = [];
    for (const it of items) {
      if (it == null) continue;
      const k = key(it);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(it);
    }
    return out;
  };
  const byTs = <T extends { timestamp: number }>(a: T, b: T) => a.timestamp - b.timestamp;

  const logs = dedupBy([...eng.logs, ...liveLogs], consoleLogKey).sort(byTs);
  const exceptions = dedupBy([...eng.exceptions, ...liveExceptions], exceptionKey).sort(byTs);
  const network = dedupBy([...eng.network, ...liveNetwork], (e) => e.id).sort(byTs);
  const allActions = dedupBy([...eng.actions, ...liveActions], (e) => e.id).sort(byTs);

  /* ACTIONS WATERMARK FILTER (userActions ONLY). Console/network above are untouched —
     they keep the full engagement window. After producing the merged, deduped,
     time-ordered actions list, drop everything at-or-before the previous filed ticket's
     cut: keep actions whose timestamp is AFTER the watermark, plus same-ms actions that
     were NOT already included last time (includedIds tiebreak). No watermark → keep all.
     The watermark only advances on a SUCCESSFUL file (see advanceActionsWatermark at the
     ECHLY_CREATE_FEEDBACK success site), so a failed/retried submission re-includes the
     same actions. */
  const wm =
    engagementId != null && typeof tabId === "number"
      ? engagementBuffers.get(bufferKey(engagementId, tabId))?.actionsWatermark ?? null
      : null;
  const actions = wm == null
    ? allActions
    : allActions.filter(
        (a) => a.timestamp > wm.timestamp || (a.timestamp === wm.timestamp && !wm.includedIds.has(a.id))
      );

  const merged: Record<string, unknown> = { ...ticket };

  if (logs.length > 0 || exceptions.length > 0) {
    merged.consoleLogs = logs;
    merged.exceptions = exceptions;
    merged.consoleLogCount = logs.length;
    merged.exceptionCount = exceptions.length;
    merged.errorCount = logs.filter((l) => l.level === "error").length;
    merged.warningCount = logs.filter((l) => l.level === "warn").length;
  }
  if (network.length > 0) {
    merged.networkRequests = network;
    merged.networkRequestCount = network.length;
    merged.networkErrorCount = network.filter(
      (r) =>
        r.errored === true ||
        (typeof r.status === "number" && r.status >= 400 && r.status < 600)
    ).length;
  }
  // userActions / userActionCount reflect the FILTERED (post-watermark) list. When the
  // filter leaves zero actions (a ticket with no new journey beyond its own filing click,
  // which itself post-dates the watermark and so survives), we still want the ticket to
  // carry an accurate count — but to match the existing console/network passthrough
  // contract we only override when there is something to attach. An empty filtered list
  // means the live ticket already carried the right (small) actions; leaving it as-is is
  // fine because the watermark guarantees the filing click is newer than the cut.
  if (actions.length > 0) {
    merged.userActions = actions;
    merged.userActionCount = actions.length;
  }

  return merged;
}

/**
 * Advance the engagement's actions watermark after a SUCCESSFUL ticket creation.
 * `includedActions` is the exact (filtered) list that was filed. The new watermark
 * timestamp is the max timestamp among those actions, and includedIds is the set of
 * filed-action ids AT that exact timestamp (the same-ms tiebreak). If the filed ticket
 * included zero actions, the watermark does NOT advance. Called only on the success path
 * so a failed/retried submission keeps including the same actions.
 */
function advanceActionsWatermark(
  engagementId: string | null,
  tabId: number | undefined,
  includedActions: EngagementAction[]
): void {
  if (engagementId == null || typeof tabId !== "number") return;
  if (!Array.isArray(includedActions) || includedActions.length === 0) return;
  // Per-tab watermark: the cut advances only for the bucket that was actually
  // filed from, so each tab tracks its own "already filed" boundary (Fix A).
  const buf = engagementBuffers.get(bufferKey(engagementId, tabId));
  if (!buf) return;

  let maxTs = -Infinity;
  for (const a of includedActions) {
    if (a && typeof a.timestamp === "number" && a.timestamp > maxTs) maxTs = a.timestamp;
  }
  if (!Number.isFinite(maxTs)) return;

  const idsAtMax = includedActions
    .filter((a) => a && a.timestamp === maxTs && typeof a.id === "string")
    .map((a) => a.id);
  // Same-ms collisions are rare; cap defensively so a pathological burst can't grow the
  // set unbounded. Keeping the first N is sufficient — the watermark timestamp already
  // excludes everything strictly older.
  const includedIds = new Set(idsAtMax.slice(0, ACTIONS_WATERMARK_MAX_IDS));

  // Never move the watermark backwards (e.g. an out-of-order retry whose merged list is
  // somehow older); only advance.
  if (buf.actionsWatermark != null && maxTs < buf.actionsWatermark.timestamp) return;
  buf.actionsWatermark = { timestamp: maxTs, includedIds };
}

/** Fully purge one engagement: EVERY per-tab in-memory bucket
 *  (`${engagementId}:*`), every tab binding pointing at it, and every persisted
 *  per-tab storage mirror. Used by both stop-signals. Iterating by prefix is
 *  required now that buckets are per-tab (Fix A) — deleting the bare engagement
 *  id would leave each tab's bucket resident and leak into a re-armed engagement. */
function purgeEngagement(engagementId: string | null): void {
  if (engagementId == null) return;
  // Engagement-level claim flag.
  claimedEngagementIds.delete(engagementId);
  // In-memory per-tab buckets.
  for (const key of bucketKeysForEngagement(engagementId)) {
    engagementBuffers.delete(key);
  }
  // Tab bindings.
  for (const [tabId, id] of tabEngagementIds) {
    if (id === engagementId) tabEngagementIds.delete(tabId);
  }
  // Persisted per-tab storage mirrors. We don't know which tab ids were
  // persisted, so enumerate storage keys under this engagement's prefix and
  // remove each. Best-effort + async; the in-memory delete above is the
  // synchronous guarantee the purge invariant relies on.
  try {
    const storagePrefix = ENGAGEMENT_STORAGE_PREFIX + engagementKeyPrefix(engagementId);
    void chrome.storage.local
      .get(null)
      .then((all) => {
        for (const k of Object.keys(all)) {
          if (k.startsWith(storagePrefix)) removeStorageKey(k);
        }
      })
      .catch(() => {});
  } catch {
    // chrome.storage unavailable — ignore.
  }
}

/**
 * The two stop-signals' shared teardown: drop the tab(s) from the capture cache
 * (the existing stop mechanism — wrappers go unread and die on navigation per the
 * documented M3 limitation) AND purge the engagement buffer (memory + storage).
 *
 * Called at BOTH stop-signals: user fully closes the tray, and any session-end
 * (hard / soft / idle). `engagementId` defaults to the current engagement; pass
 * an explicit id at soft-end to purge the ENDED session's buffer before re-arming.
 */
function stopAndPurgeCapture(engagementId: string | null = currentEngagementId): void {
  // (a) Stop: drop all tabs from the capture-injected cache. The MAIN-world
  // wrappers can't be cleanly uninstalled from the isolated world (M3 limit);
  // they live in the page realm and die on navigation, harmless meanwhile.
  captureInjectedTabs.clear();
  // (b) Purge the engagement buffer (in-memory + persisted mirror + tab bindings).
  purgeEngagement(engagementId);
  if (engagementId === currentEngagementId) {
    currentEngagementId = null;
    // No engagement remains — stop the safety-net alarm. (Soft-end re-arm calls
    // beginEngagement right after, which recreates it.)
    try {
      void chrome.alarms.clear(ENGAGEMENT_FLUSH_ALARM);
    } catch {
      // ignore
    }
  }
}

/**
 * Paint the widget into a known tab: ensure bootstrap is present, then tell it to open.
 * This is the part of an open that produces visible UI (the loading pill / tray). It does
 * NOT commit engagement state or arm capture — that is commitOpenEngagement, gated on auth.
 * Returns the tabId on success so the caller can commit against the same tab, or null if the
 * tab is gone / un-injectable.
 *
 * Fix 4.1: tabId is passed in (onClicked / the message handlers already resolved it) instead
 * of a second tabs.query here.
 */
async function paintWidgetInTab(tabId: number | undefined): Promise<number | null> {
  if (typeof tabId !== "number") {
    console.warn("[ECHLY BG] No active tab to paint widget into");
    return null;
  }
  const injected = await ensureContentScriptInjected(tabId);
  if (!injected) {
    console.warn("[ECHLY BG] Could not inject widget into tab", tabId);
    return null;
  }
  await sendMessageWithRetry(tabId, { type: "ECHLY_OPEN_WIDGET" });
  return tabId;
}

/**
 * Commit the engagement side of an authenticated open: persist the engaged flag and arm
 * capture. Split out of the old openWidgetInActiveTab so it only runs AFTER auth succeeds —
 * preserving today's invariant that capture never arms for an unauthenticated open. The
 * capture inject (ensureCaptureInjected) stays exactly where it was relative to a successful
 * open; nothing about capture timing changes.
 *
 * Fix 4.1: the independent storage write + (already-done) injection no longer serialize — the
 * echlyActive persist is fire-and-forget since nothing here awaits its completion.
 */
function commitOpenEngagement(tabId: number): void {
  cachedEchlyActive = true;
  void chrome.storage.local.set({ echlyActive: true });

  globalUIState.visible = true;
  globalUIState.expanded = true;
  broadcastUIState();

  /* Stage 1 — ARM capture at tray-open. Capture now follows engagement, not the
     session: the moment the tray opens, the user is "engaged" and we install the
     MAIN-world capture scripts via the existing programmatic mechanism (unchanged).
     Stage 3 — mint/bind the engagement that this tab's flush-pushes accumulate into.
     A genuine open (no current engagement) starts a fresh buffer; a re-open while
     still engaged (token refresh, redundant open) binds the active tab to the
     existing engagement so we don't orphan its accumulated entries. The soft-end
     re-arm path mints its own fresh engagement before calling here. */
  if (currentEngagementId == null) {
    beginEngagement(tabId);
  } else {
    bindTabToCurrentEngagement(tabId);
  }
  void ensureCaptureInjected(tabId);
}

/**
 * Explicit-open orchestration (icon click / ECHLY_OPEN_WIDGET / OPEN_RECORDER).
 *
 * Fix 2: the widget does NOT need auth resolved to paint — it mounts to authState
 * "loading" and resolves auth itself via GET_AUTH_STATE. So we:
 *   1. optimistically flip the transient UI flag + start painting (inject + ECHLY_OPEN_WIDGET)
 *      so the widget bundle download overlaps the auth round-trip, and
 *   2. resolve auth IN PARALLEL (requireAuthForExplicitOpen runs without an early await).
 * requireAuthForExplicitOpen still fires the login-tab redirect on failure (unchanged), and
 * its getAuthStateResponse shares the single-flight token refresh with the widget's own
 * GET_AUTH_STATE (Fix 2.3) — cold opens do one network refresh, not two.
 *
 * The engaged flag (echlyActive) + capture are committed ONLY on auth success, so an
 * unauthenticated open neither persists "engaged" nor arms capture — exactly as before.
 */
async function openRecorderUI(tabId?: number): Promise<boolean> {
  // Open-path latency t0 (≈ handler entry). All marks below are deltas from here.
  const t0 = perfNow();
  perfMark("t0 openRecorderUI entry", t0);

  const resolvedTabId =
    typeof tabId === "number" ? tabId : (await getActiveTabIdForBroadcast()) ?? undefined;
  if (typeof resolvedTabId === "number") {
    sw.lastUserTabId = resolvedTabId;
  }

  // Optimistic UI: flip the transient visible/expanded flags and broadcast so the widget,
  // once it mounts, runs its visible-gated GET_AUTH_STATE. This does NOT set cachedEchlyActive
  // (the persistent engaged flag), so no cross-tab auto-mount or capture fires off this alone.
  trayOpen = true;
  globalUIState.visible = true;
  globalUIState.expanded = true;
  broadcastUIState();

  // Kick off auth + paint concurrently. Neither awaits the other.
  perfMark("auth start", t0);
  const authPromise = requireAuthForExplicitOpen().then((r) => {
    // t_authEnd − t_authStart ≈ 0 here means Fix 1's rehydrated token avoided the network
    // refresh (the cold-token win). A non-trivial delta means a real POST /session ran.
    perfMark("auth end", t0);
    return r;
  });
  const paintPromise = paintWidgetInTab(resolvedTabId).then((r) => {
    perfMark("open sent (ECHLY_OPEN_WIDGET → tab)", t0);
    return r;
  });

  const authenticated = await authPromise;
  if (!authenticated) {
    // Unauthenticated: requireAuthForExplicitOpen already opened the login tab — that is
    // EXACTLY today's effect (icon-click while signed-out → login tab, no tray shown). Roll
    // back the optimistic UI so no phantom "engaged" tray persists, and explicitly tear down
    // the skeleton + any widget host the parallel paint mounted (bootstrap's ECHLY_CLOSE_WIDGET
    // handler removes the skeleton AND hides the host) so the ONLY unauth surface is the login
    // tab, matching pre-change behavior. The widget's own "Sign in" pill (content.tsx) still
    // covers any non-gated open path; it just isn't the icon-click path's UX.
    trayOpen = false;
    globalUIState.visible = false;
    globalUIState.expanded = false;
    cachedEchlyActive = false;
    void chrome.storage.local.set({ echlyActive: false });
    broadcastUIState();
    if (typeof resolvedTabId === "number") {
      chrome.tabs
        .sendMessage(resolvedTabId, { type: "ECHLY_CLOSE_WIDGET" })
        .catch(() => { /* tab gone / no bootstrap — nothing to tear down */ });
    }
    return false;
  }

  // Authenticated: make sure the paint landed (resolve the same tab), then commit engagement.
  const paintedTabId = await paintPromise;
  if (paintedTabId == null) return false;
  commitOpenEngagement(paintedTabId);
  return true;
}

/** Loom-style: when user switches tabs and Echly is active, inject content script so widget appears on every tab. */
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  activeOwnerTabId = activeInfo.tabId;
  if (!cachedEchlyActive) return;
  const sessionIdForRehydrate = activeSessionId ?? globalUIState.sessionId;
  if (sessionIdForRehydrate && shouldForceRehydrate(sessionIdForRehydrate)) {
    globalUIState.sessionLoading = true;
    void rehydrateSession(sessionIdForRehydrate);
  } else if (sessionIdForRehydrate && globalUIState.pointers.length === 0) {
    globalUIState.sessionLoading = true;
  }
  try {
    await ensureContentScriptInjected(activeInfo.tabId);
    /* Stage 1: capture now follows ENGAGEMENT across tabs (was session-gated).
       When the user switches tabs while the tray is open/minimized or a session
       is paused/active — i.e. cachedEchlyActive — that tab joins the engagement
       and the widget auto-mounts there, so capture must install too. Bind the tab
       to the current engagement first so its flush-pushes accumulate in the right
       buffer. Idempotent via captureInjectedTabs.has; restricted-page errors swallowed. */
    if (cachedEchlyActive) {
      bindTabToCurrentEngagement(activeInfo.tabId);
      void ensureCaptureInjected(activeInfo.tabId);
    }
    await sendMessageWithRetry(activeInfo.tabId, {
      type: "ECHLY_GLOBAL_STATE",
      state: getCanonicalGlobalState(),
    });
  } catch (e) {
    if (ECHLY_DEBUG) console.debug("ECHLY onActivated inject/sync failed", e);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (activeOwnerTabId === tabId) {
    activeOwnerTabId = null;
  }
  injectedTabs.delete(tabId);
  captureInjectedTabs.delete(tabId);
  /* Stage 3: drop the tab→engagement binding so the map doesn't accumulate dead
     entries (and so a Chrome-reused tab id can't mis-bind to a stale engagement).
     The accumulated buffer entries this tab contributed stay in the engagement
     buffer until the engagement itself is purged — closing a tab is not a stop-signal. */
  tabEngagementIds.delete(tabId);
});

/** Loom-style: only sync global state to the active tab after load completes. */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  /* Page navigation destroys the content script — clear our injected-cache entry
     so the next activation re-injects rather than trusting a stale flag.
     MAIN-world capture realm also dies on navigation, so reset that cache too. */
  if (changeInfo.status === "loading") {
    injectedTabs.delete(tabId);
    captureInjectedTabs.delete(tabId);
  }
  if (changeInfo.status !== "complete") return;
  if (!tab.active) return;
  if (!cachedEchlyActive) return;
  try {
    await ensureContentScriptInjected(tabId);
    const activeSessionForRehydrate = activeSessionId ?? globalUIState.sessionId;
    if (activeSessionForRehydrate && globalUIState.sessionModeActive && globalUIState.pointers.length === 0) {
      globalUIState.sessionLoading = true;
      void rehydrateSession(activeSessionForRehydrate);
    }
    /* Stage 1: re-inject MAIN-world capture after a navigation/reload while engaged.
       Gated on cachedEchlyActive (was session) so capture persists across navigations
       for the whole engagement, not just an active session. The "loading" branch above
       already cleared captureInjectedTabs for this tab, so this call actually re-installs
       (the .has() guard won't short-circuit). The pre-navigation page already flushed its
       buffer to the SW engagement buffer (Stage 3) on visibilitychange/beforeunload, so
       its entries survive into the new realm. Complete-stage injection is later than ideal
       — early requests on the freshly reloaded page are missed — but injecting at "loading"
       into a still-loading page is unreliable, so complete is the pragmatic choice. */
    if (cachedEchlyActive) {
      bindTabToCurrentEngagement(tabId);
      void ensureCaptureInjected(tabId);
    }
    await sendMessageWithRetry(tabId, {
      type: "ECHLY_GLOBAL_STATE",
      state: getCanonicalGlobalState(),
    });
  } catch (e) {
    if (ECHLY_DEBUG) console.debug("ECHLY onUpdated inject failed", tabId, e);
  }
});

/** New tabs will get state on activation; avoid background-tab state broadcasts. */
chrome.tabs.onCreated.addListener((tab) => {
  if (!tab.active) return;
  if (!tab.id) return;
  const tabId = tab.id;
  const activeSessionForRehydrate = activeSessionId ?? globalUIState.sessionId;
  if (activeSessionForRehydrate && globalUIState.sessionModeActive && globalUIState.pointers.length === 0) {
    globalUIState.sessionLoading = true;
    void rehydrateSession(activeSessionForRehydrate);
  }
  void (async () => {
    const injected = await ensureContentScriptInjected(tabId);
    if (!injected) return;
    chrome.tabs
      .sendMessage(tabId, { type: "ECHLY_GLOBAL_STATE", state: getCanonicalGlobalState() })
      .catch((e) => {
        console.error("[ECHLY] ECHLY_GLOBAL_STATE to new tab failed", tabId, e);
      });
  })();
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
    description?: string;
    tags?: string[];
    status?: "open" | "resolved";
    pageArea?: string | null;
    url?: string;
    viewportWidth?: number;
    viewportHeight?: number;
    screenWidth?: number;
    screenHeight?: number;
    devicePixelRatio?: number;
    userAgent?: string;
    // Phase 4: console-log capture fields. The server validates these
    // independently — background just forwards them as part of the body.
    consoleLogs?: unknown[];
    exceptions?: unknown[];
    consoleLogCount?: number;
    exceptionCount?: number;
    errorCount?: number;
    warningCount?: number;
    // Phase N3: network-capture fields. Same passthrough contract as the
    // console fields — server validates; background only forwards.
    networkRequests?: unknown[];
    networkRequestCount?: number;
    networkErrorCount?: number;
    // Phase A4: user-actions capture fields. Same passthrough contract.
    userActions?: unknown[];
    userActionCount?: number;
  };
  screenshotId: string;
}): Promise<Response> {
  const body = buildFeedbackPayload({
    sessionId,
    feedbackId,
    ticket,
    screenshotId,
  });

  const token = await getOrRefreshToken();
  const res = await fetch(`${API_BASE}/api/feedback`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "x-extension-token": token,
    },
    body: JSON.stringify(body),
  });

  return res;
}

/**
 * Dashboard signaled a workspace switch. Drop the cached extension token so the
 * next request forces /api/extension/session to re-resolve the user's active
 * workspace, and notify active tabs to refresh their in-memory state.
 */
async function handleWorkspaceSwitch(): Promise<void> {
  extensionToken = null;
  extensionTokenExpiresAt = null;
  setExtensionToken(null);
  sw.extensionToken = null;
  // Drop the persisted copy too — the next boot must re-fetch so the token
  // re-resolves to the (possibly switched) active workspace, not the stale one.
  // (currentUser/cachedSessionUser are intentionally kept: same user, new workspace.)
  clearPersistedToken();

  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.id == null) continue;
      chrome.tabs
        .sendMessage(tab.id, { type: "ECHLY_REFRESH_SESSION" })
        .catch(() => {
          /* tab may not have the content script — ignore */
        });
    }
  } catch (err) {
    if (ECHLY_DEBUG) console.warn("[ECHLY] workspace_switch tab broadcast failed", err);
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (ECHLY_DEBUG) echlyLog("MESSAGE", "received", request.type);

  if (request.type === "WORKSPACE_SWITCHED") {
    void handleWorkspaceSwitch();
    sendResponse({ ok: true });
    return false;
  }

  if (request.type === "ECHLY_LOAD_WIDGET") {
    const tabId = sender.tab?.id;
    if (!tabId) {
      sendResponse({ success: false, error: "No tab ID" });
      return;
    }
    // The widget is now an ES module (esbuild format:"esm" + splitting), so
    // it cannot be injected as a classic script via `files`. Instead inject a
    // tiny classic wrapper that dynamically import()s the widget module from
    // the extension origin. The wrapper returns the import promise so
    // executeScript only resolves once the module (and its chunks) finished
    // loading and the widget signalled ECHLY_WIDGET_READY itself.
    const widgetUrl = chrome.runtime.getURL("widget/widget.js");
    chrome.scripting.executeScript({
      target: { tabId },
      // ISOLATED world (default) keeps the widget in the content-script
      // context, same as the previous classic-script injection.
      func: (url: string) => {
        const w = window as Window & { __ECHLY_WIDGET_LOADED__?: boolean };
        if (w.__ECHLY_WIDGET_LOADED__) return;
        return import(url).catch((err) => {
          console.error("[Echly] widget module load failed:", err);
          throw err;
        });
      },
      args: [widgetUrl],
    }).then(() => {
      sendResponse({ success: true });
    }).catch((err) => {
      console.error("[Echly] Failed to inject widget module:", err);
      sendResponse({ success: false, error: err?.message });
    });
    return true;
  }

  if (request.type === "ECHLY_INJECT_CAPTURE") {
    /* Phase M1: programmatic-injection entry point for MAIN-world capture scripts.
       Not yet wired to session-start (M2) or tab-switch (M3) — this handler exists
       so M1 can be verified manually and so later phases have a clean call site. */
    const explicit = (request as { tabId?: number }).tabId;
    const tabId = typeof explicit === "number" ? explicit : sender.tab?.id;
    if (typeof tabId !== "number") {
      sendResponse({ ok: false, error: "No tab ID" });
      return false;
    }
    void (async () => {
      const ok = await ensureCaptureInjected(tabId);
      sendResponse({ ok });
    })();
    return true;
  }

  if (request.type === "ECHLY_CAPTURE_FLUSH") {
    /* Stage 3: a content-script bridge forwarded its page's flush snapshot. Merge it
       into the cross-navigation engagement buffer keyed STRICTLY by the sender tab's
       explicit binding (requireBound), deduped by UUID (network/actions) or synthetic
       key (console — no id field). The snapshot only ever holds already-redacted entries
       (redaction runs at capture time, in the MAIN world, upstream of the flush).
       requireBound is critical: a stale page from a purged engagement (binding removed
       on close/end, but MAIN-world wrapper still running per the M3 limitation) has NO
       binding, so its flush resolves to null and is DROPPED — it must not fall back to
       the current engagement, or it would bleed into a freshly re-armed engagement. */
    const surface = (request as { surface?: string }).surface;
    const snapshot = (request as { snapshot?: unknown }).snapshot;
    const flushTabId = sender.tab?.id;
    const engagementId = resolveEngagementIdForTab(flushTabId, true);
    // requireBound guarantees a bound tab, so flushTabId is a number whenever
    // engagementId != null — but assert it so the per-tab bucket key is sound.
    if (engagementId != null && typeof flushTabId === "number" && snapshot && typeof snapshot === "object") {
      const snap = snapshot as {
        logs?: EngagementConsoleLog[];
        exceptions?: EngagementException[];
        requests?: EngagementNetwork[];
        actions?: EngagementAction[];
      };
      if (surface === "console") {
        mergeFlushIntoEngagement(engagementId, flushTabId, { logs: snap.logs, exceptions: snap.exceptions });
      } else if (surface === "network") {
        mergeFlushIntoEngagement(engagementId, flushTabId, { requests: snap.requests });
      } else if (surface === "actions") {
        mergeFlushIntoEngagement(engagementId, flushTabId, { actions: snap.actions });
      }
    }
    sendResponse({ ok: true });
    return false;
  }

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
          workspaceName: null,
        };
        cachedSessionUser = sw.currentUser;
      }
      persistTokenToStorage(token, extensionTokenExpiresAt, persistedUserFromCurrent());
      trayOpen = true;
      globalUIState.visible = true;
      void (async () => {
        const sessionIdForRehydrate = activeSessionId ?? globalUIState.sessionId;
        if (sessionIdForRehydrate) {
          await rehydrateSession(sessionIdForRehydrate);
        }
        // The token just arrived from the auth broker, so the user is authenticated —
        // no requireAuthForExplicitOpen gate needed. Paint + commit directly (this is
        // the old openWidgetInActiveTab, now split into paint vs engagement-commit).
        const tabId = (await getActiveTabIdForBroadcast()) ?? undefined;
        const paintedTabId = await paintWidgetInTab(tabId);
        if (paintedTabId != null) {
          commitOpenEngagement(paintedTabId);
        }
        broadcastUIState();
      })();
    }
    return false;
  }

  if (request.type === "ECHLY_START_SESSION") {
    void startSessionInActiveTab();
    sendResponse({ ok: true });
    return false;
  }

  if (request.type === "ECHLY_OPEN_PREVIOUS_SESSIONS") {
    void (async () => {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tabId = tabs[0]?.id;
      if (!tabId) return;
      const injected = await ensureContentScriptInjected(tabId);
      if (!injected) return;
      chrome.tabs
        .sendMessage(tabId, { type: "ECHLY_OPEN_PREVIOUS_SESSIONS" })
        .catch((error) => logMessageDeliveryError("ECHLY_OPEN_PREVIOUS_SESSIONS", error));
    })();
    sendResponse({ ok: true });
    return false;
  }

  if (request.type === "ECHLY_OPEN_WIDGET") {
    (async () => {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tabId = tabs[0]?.id;
      // Paint the skeleton the instant the tab is known, before the auth-gated open.
      sendOpeningSignal(tabId);
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
      const isAlreadyOpen = trayOpen === true && globalUIState.visible === true;
      if (isAlreadyOpen && tab?.id) {
        chrome.tabs
          .sendMessage(tab.id, { type: "ECHLY_SHAKE_PILL" })
          .catch((error) => logMessageDeliveryError("ECHLY_SHAKE_PILL", error));
        sendResponse({ ok: true, alreadyOpen: true });
        return;
      }
      // Opening (not already open): paint the skeleton first, then run the gated open.
      sendOpeningSignal(tab?.id);
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

  if (request.type === "RESUME_SESSION" && typeof request.sessionId === "string") {
    const sessionId: string = request.sessionId;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      (async () => {
        const opened = await openRecorderUI(tab?.id);
        if (opened && tab?.id) {
          const injected = await ensureContentScriptInjected(tab.id);
          if (injected) {
            chrome.tabs
              .sendMessage(tab.id, { type: "ECHLY_RESUME_SESSION", sessionId })
              .catch((error) =>
                logMessageDeliveryError("ECHLY_RESUME_SESSION", error)
              );
          }
        }
        sendResponse({ ok: opened });
      })();
    });
    return true;
  }

  if (request.type === "ECHLY_EXPAND_WIDGET") {
    globalUIState.expanded = true;
    broadcastUIState();
    void (async () => {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tabId = tabs[0]?.id;
      if (!tabId) return;
      const injected = await ensureContentScriptInjected(tabId);
      if (!injected) return;
      chrome.tabs
        .sendMessage(tabId, { type: "ECHLY_WIDGET_EXPAND" })
        .catch((error) => logMessageDeliveryError("ECHLY_WIDGET_EXPAND", error));
    })();
    sendResponse({ ok: true });
    return false;
  }

  if (request.type === "ECHLY_COLLAPSE_WIDGET") {
    globalUIState.expanded = false;
    broadcastUIState();
    void (async () => {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tabId = tabs[0]?.id;
      if (!tabId) return;
      const injected = await ensureContentScriptInjected(tabId);
      if (!injected) return;
      chrome.tabs
        .sendMessage(tabId, { type: "ECHLY_WIDGET_COLLAPSE" })
        .catch((error) => logMessageDeliveryError("ECHLY_WIDGET_COLLAPSE", error));
    })();
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
      cachedEchlyActive = false;

      /* Stage 2 — TRAY-CLOSE stop-signal (close-button / ECHLY_CLOSE_WIDGET path).
         Same as the icon-toggle-off path: the user is no longer engaged, so stop
         capture and purge the engagement buffer. The session (if any) is left
         orphaned per the locked design — we do not auto-end it here. */
      stopAndPurgeCapture();

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
    const ticket = (request as { ticket?: { id: string; title: string; description?: string; type?: string; screenshotId?: string | null; tags?: string[]; pageArea?: string | null; userAgent?: string | null; viewportWidth?: number | null; viewportHeight?: number | null; devicePixelRatio?: number | null; createdAt?: string | number | null } }).ticket;
    if (ticket?.id && ticket?.title) {
      const pointer: StructuredFeedback = {
        id: ticket.id,
        title: ticket.title,
        description: ticket.description ?? "",
        type: ticket.type ?? "Feedback",
        screenshotId: ticket.screenshotId ?? null,
        tags: ticket.tags ?? [],
        pageArea: ticket.pageArea ?? null,
        userAgent: ticket.userAgent ?? null,
        viewportWidth: ticket.viewportWidth ?? null,
        viewportHeight: ticket.viewportHeight ?? null,
        devicePixelRatio: ticket.devicePixelRatio ?? null,
        createdAt: ticket.createdAt ?? null,
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
              ...p,
              id: ticket.id,
              title: ticket.title,
              description: ticket.description ?? "",
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
    broadcastUIState(true);
    resetSessionIdleTimer();
    chrome.alarms.create("echly-keepalive", { periodInMinutes: 0.4 });
    /* Stage 4 — CLAIM. Session-start is the privacy claim point: the user has
       committed to a session, so the engagement buffer is now allowed to persist to
       chrome.storage.local (pre-session activity stayed memory-only). Flushes its
       current memory state to disk and marks subsequent merges persistable.
       Stage 1 — the capture inject below is left in place: redundant (capture was
       already armed at tray-open) but safe (idempotent via captureInjectedTabs). We
       bind the session-start tab to the current engagement first so its flushes land
       in the right buffer even if it became active without a prior activation event. */
    const sessionStartTabId = sender.tab?.id;
    if (typeof sessionStartTabId === "number") {
      bindTabToCurrentEngagement(sessionStartTabId);
    }
    claimCurrentEngagement();
    if (typeof sessionStartTabId === "number") {
      void ensureCaptureInjected(sessionStartTabId);
    }
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
    broadcastUIState(true);
    resetSessionIdleTimer();
    sendResponse({ ok: true });
    return false;
  }

  if (request.type === "ECHLY_SET_EDIT_PAUSE_TOOLTIP") {
    globalUIState.editPauseTooltipVisible = request.visible === true;
    broadcastUIState(true);
    if (pendingBroadcastTimer != null) {
      clearTimeout(pendingBroadcastTimer);
      pendingBroadcastTimer = null;
    }
    void flushBroadcastUIState();
    sendResponse({ ok: true });
    return false;
  }

  if (request.type === "ECHLY_SESSION_MODE_RESUME") {
    echlyLog("BACKGROUND", "session resume broadcast");
    globalUIState.sessionModeActive = true;
    globalUIState.sessionPaused = false;
    globalUIState.sessionId = activeSessionId;
    globalUIState.editPauseTooltipVisible = false;
    persistSessionLifecycleState();
    broadcastUIState(true);
    resetSessionIdleTimer();
    sendResponse({ ok: true });
    return false;
  }

  if (request.type === "ECHLY_SESSION_MODE_END") {
    echlyLog("BACKGROUND", "session end broadcast");
    clearSessionIdleTimer();
    chrome.alarms.clear("echly-keepalive");
    /* Stage 2 — SESSION-END stop-signal (HARD end; the tray auto-closes below).
       Stop capture and purge the engagement buffer (memory + storage). The Phase-M3
       lingering-wrappers limitation still applies: the MAIN-world wrappers already
       installed on open pages can't be cleanly uninstalled from the isolated world —
       they live in the page realm and die on navigation. They keep running until the
       page navigates but are harmless: no engagement buffer is reading their pushes. */
    stopAndPurgeCapture();
    activeSessionId = null;
    globalUIState.sessionId = null;
    globalUIState.sessionTitle = null;
    globalUIState.sessionModeActive = false;
    globalUIState.sessionPaused = false;
    globalUIState.sessionLoading = false;
    globalUIState.editPauseTooltipVisible = false;
    globalUIState.totalCount = 0;
    globalUIState.openCount = 0;
    globalUIState.resolvedCount = 0;
    globalUIState.pointers = [];
    resetPaginationState();
    globalUIState.lastSyncedAt = null;
    globalUIState.lastPaginationAt = null;
    globalUIState.feedbackJobs = [];
    cachedEchlyActive = false;
    chrome.storage.local.set({
      activeSessionId: null,
      sessionModeActive: false,
      sessionPaused: false,
      echlyActive: false,
    });
    trayOpen = false;
    globalUIState.visible = false;
    globalUIState.expanded = false;
    broadcastUIState(true);
    setTimeout(() => {
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { type: "ECHLY_RESET_WIDGET" }).catch(() => {});
          }
        });
      });
    }, 150);
    sendResponse({ success: true });
    return true;
  }

  if (request.type === "ECHLY_SESSION_MODE_END_SOFT") {
    echlyLog("BACKGROUND", "session soft-end broadcast");
    clearSessionIdleTimer();
    chrome.alarms.clear("echly-keepalive");
    /* Stage 2 — SESSION-END stop-signal (SOFT end; the tray STAYS open). This is the
       one divergent case: the ended session's engagement buffer is now stale, so we
       stop + purge it — but because the user is still engaged and may file again, we
       immediately RE-ARM a fresh engagement (new clean buffer + re-inject capture into
       the active tab) below. See ECHLY_SESSION_MODE_END for the lingering-wrappers limit. */
    stopAndPurgeCapture();
    activeSessionId = null;
    globalUIState.sessionId = null;
    globalUIState.sessionTitle = null;
    globalUIState.sessionModeActive = false;
    globalUIState.sessionPaused = false;
    globalUIState.sessionLoading = false;
    globalUIState.editPauseTooltipVisible = false;
    globalUIState.totalCount = 0;
    globalUIState.openCount = 0;
    globalUIState.resolvedCount = 0;
    globalUIState.pointers = [];
    resetPaginationState();
    globalUIState.lastSyncedAt = null;
    globalUIState.lastPaginationAt = null;
    globalUIState.feedbackJobs = [];
    cachedEchlyActive = true;
    chrome.storage.local.set({
      activeSessionId: null,
      sessionModeActive: false,
      sessionPaused: false,
      echlyActive: true,
    });
    /* Stage 2 — SOFT-END RE-ARM. The tray stays open, so the user is still engaged.
       stopAndPurgeCapture() above already cleared the old buffer and nulled
       currentEngagementId. Mint the fresh engagement SYNCHRONOUSLY and unconditionally
       FIRST — if it were minted only inside the async tab query and that query rejected,
       currentEngagementId would stay null while cachedEchlyActive=true, and every later
       flush would be silently dropped (capture armed but contributing nothing). Then bind
       + re-inject the active tab once the query resolves. */
    beginEngagement();
    void (async () => {
      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const tabId = tabs[0]?.id;
        if (typeof tabId === "number") {
          bindTabToCurrentEngagement(tabId);
          void ensureCaptureInjected(tabId);
        }
      } catch (e) {
        if (ECHLY_DEBUG) console.debug("[ECHLY] soft-end re-arm failed", e);
      }
    })();
    broadcastUIState(true);
    setTimeout(() => {
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { type: "ECHLY_RESET_WIDGET" }).catch(() => {});
          }
        });
      });
    }, 150);
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
          workspaceName: null,
        };
        sw.currentUser = cachedSessionUser;
      }
      persistTokenToStorage(tok, extensionTokenExpiresAt, persistedUserFromCurrent());
      const sessionIdForRehydrate = activeSessionId ?? globalUIState.sessionId;
      if (sessionIdForRehydrate) {
        void rehydrateSession(sessionIdForRehydrate);
      }
    }
    sendResponse({ ok: true });
    return false;
  }

  if (request.type === "ECHLY_AUTH_INVALID") {
    // Server 401'd the token mid-use (apiFetch forwards this). Full clear, incl. the
    // persisted storage copy via clearAuthState → clearPersistedToken, so the invalid
    // token can't be resurrected on the next SW boot.
    clearAuthState();
    sendResponse({ ok: true });
    return false;
  }

  if (request.type === "ECHLY_GET_AUTH_STATE" || request.type === "GET_AUTH_STATE") {
    (async () => {
      const authState = await getAuthStateResponse();
      let feedbackUsage: number | null = null;
      let feedbackLimit: number | null = null;
      if (authState.authenticated) {
        let usageData = cachedBillingUsage && Date.now() - billingUsageCachedAt < BILLING_USAGE_CACHE_TTL
          ? cachedBillingUsage
          : null;
        if (!usageData) {
          try {
            const usageRes = await apiFetch(`${API_BASE}/api/billing/usage`, {});
            if (usageRes.ok) {
              const usageJson = (await usageRes.json()) as {
                data?: { feedbackTicketsUsed?: number; feedbackTicketsLimit?: number | null; canCreateFeedback?: boolean };
              };
              usageData = usageJson.data ?? null;
              if (usageData) {
                cachedBillingUsage = usageData;
                billingUsageCachedAt = Date.now();
              }
            }
          } catch {
            // Usage fetch is best-effort; degrade gracefully
          }
        }
        if (usageData) {
          feedbackUsage = usageData.feedbackTicketsUsed ?? null;
          feedbackLimit = usageData.feedbackTicketsLimit ?? null;
          if (usageData.canCreateFeedback === false) {
            globalUIState.feedbackLimitReached = true;
            globalUIState.feedbackLimitMessage = "Monthly ticket limit reached";
            globalUIState.feedbackUpgradePlan = globalUIState.feedbackUpgradePlan ?? "business";
            broadcastUIState();
          }
        }
      }
      sendResponse({ ...authState, feedbackUsage, feedbackLimit });
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
          data?: { screenshotId?: string };
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
        });
      } catch (err) {
        console.error("ECHLY_UPLOAD_SCREENSHOT error:", err);
        sendResponse({ error: String(err) });
      }
    })();
    return true;
  }

  if (request.type === "ECHLY_FEEDBACK_JOB_STARTED") {
    const { id, createdAt } = request as { id?: string; createdAt?: number };
    if (typeof id === "string" && id.length > 0) {
      if (!globalUIState.feedbackJobs.some((j) => j.id === id)) {
        globalUIState.feedbackJobs = [...globalUIState.feedbackJobs, {
          id,
          status: "processing",
          createdAt: typeof createdAt === "number" ? createdAt : Date.now(),
        }];
        broadcastUIState(true);
      }
    }
    sendResponse({ success: true });
    return false;
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
          description?: string;
          tags?: string[];
          pageArea?: string | null;
          // Phase 4: console-log capture fields. Forwarded as-is to the API.
          consoleLogs?: unknown[];
          exceptions?: unknown[];
          consoleLogCount?: number;
          exceptionCount?: number;
          errorCount?: number;
          warningCount?: number;
          // Phase N3: network-capture fields. Forwarded as-is to the API.
          networkRequests?: unknown[];
          networkRequestCount?: number;
          networkErrorCount?: number;
          // Phase A4: user-actions capture fields. Forwarded as-is to the API.
          userActions?: unknown[];
          userActionCount?: number;
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
        /* Stage 3 — FILE-TIME MERGE. Union the cross-navigation engagement buffer
           (all pages visited this engagement) with the live snapshot content.tsx
           already attached to the ticket, deduped by UUID/synthetic key and ordered
           by timestamp, so the ticket carries the full multi-page timeline rather than
           just the page the user clicked file on. Resolved from the sender tab's
           engagement; falls through to the live-only ticket if no engagement is bound. */
        const engagementIdForFile = resolveEngagementIdForTab(senderTabId);
        const mergedTicket = mergeEngagementIntoTicket(
          engagementIdForFile,
          senderTabId,
          ticket as unknown as Record<string, unknown>
        );
        const feedbackRes = await createFeedbackInternal({
          sessionId,
          feedbackId,
          ticket: mergedTicket as typeof ticket,
          screenshotId,
        });

        const data = (await feedbackRes.json()) as {
          success?: boolean;
          message?: string;
          error?: { message?: string; code?: string; data?: { upgradePlan?: string } };
          data?: { upgradePlan?: string };
          upgradePlan?: string;
        };

        if (!feedbackRes.ok || data.success === false) {
          const upgradePlan = data?.data?.upgradePlan || data?.upgradePlan || data?.error?.data?.upgradePlan;
          const isLimitError = feedbackRes.status === 403 && (
            !!upgradePlan ||
            (data?.error?.message || "").toLowerCase().includes("limit") ||
            (data?.error?.code || "").includes("FORBIDDEN")
          );
          if (isLimitError) {
            globalUIState.feedbackLimitReached = true;
            globalUIState.feedbackLimitMessage = data?.error?.message || data?.message || "Monthly feedback ticket limit reached";
            globalUIState.feedbackUpgradePlan = upgradePlan || "business";
            globalUIState.feedbackJobs = globalUIState.feedbackJobs.filter((j) => j.id !== feedbackId);
            broadcastUIState(true);
          } else {
            const failMsg = data?.error?.message || data?.message || "Failed to create feedback";
            globalUIState.feedbackJobs = globalUIState.feedbackJobs.map((j) =>
              j.id === feedbackId ? { ...j, status: "failed", errorMessage: failMsg } : j
            );
            broadcastUIState(true);
            setTimeout(() => {
              globalUIState.feedbackJobs = globalUIState.feedbackJobs.filter((j) => j.id !== feedbackId);
              broadcastUIState(true);
            }, 60_000);
          }
          sendResponse({
            success: false,
            error: data?.error?.message || data?.message || "API failed",
            ...(isLimitError ? { limitReached: true, upgradePlan: upgradePlan || "business" } : {}),
          });
          return;
        }

        await markFeedbackCompleted(feedbackId);
        /* ADVANCE the actions watermark — SUCCESS ONLY. The ticket was created, so the
           actions actually filed (mergedTicket.userActions, the post-watermark filtered
           list) become the new cut: ticket N+1 will include only actions after these.
           Reaching this point means the POST succeeded; the failure/catch branches below
           never run this, so a failed-then-retried submission re-includes the same
           actions. A zero-action ticket leaves the watermark unmoved (handled inside). */
        const filedActions = Array.isArray(mergedTicket.userActions)
          ? (mergedTicket.userActions as EngagementAction[])
          : [];
        advanceActionsWatermark(engagementIdForFile, senderTabId, filedActions);
        cachedBillingUsage = null;
        billingUsageCachedAt = 0;
        globalUIState.feedbackJobs = globalUIState.feedbackJobs.filter((j) => j.id !== feedbackId);
        broadcastUIState(true);
        sendResponse({ success: true, data });
      } catch (err) {
        console.error("[ECHLY ERROR] background create failed", err);
        globalUIState.feedbackJobs = globalUIState.feedbackJobs.map((j) =>
          j.id === feedbackId ? { ...j, status: "failed", errorMessage: "Failed to create feedback" } : j
        );
        broadcastUIState(true);
        setTimeout(() => {
          globalUIState.feedbackJobs = globalUIState.feedbackJobs.filter((j) => j.id !== feedbackId);
          broadcastUIState(true);
        }, 60_000);
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
