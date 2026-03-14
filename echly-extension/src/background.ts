/**
 * Extension background (service worker). Auth uses tokens stored in extension
 * storage (from login page). No dependency on dashboard tab for tokens.
 */
import { ECHLY_DEBUG, warn } from "../../lib/utils/logger";
import { echlyLog } from "../../lib/debug/echlyLogger";

const API_BASE =
  typeof process !== "undefined" && process.env?.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://echly-web.vercel.app";
if (ECHLY_DEBUG) console.log("[EXTENSION] Using API_BASE:", API_BASE);

const ECHLY_LOGIN_BASE = "https://echly-web.vercel.app/login";
const SESSION_CACHE_TTL_MS = 30 * 1000; // 30 seconds — use cache if validated within this window
const TOKEN_MAX_AGE_MS = 50 * 60 * 1000; // 50 minutes — refresh ID token before expiry
const FIREBASE_REFRESH_URL = "https://securetoken.googleapis.com/v1/token";
const FIREBASE_API_KEY = "AIzaSyBgQxRYAksD35D6m1OEPjSnfiOLxUABqnM";

/** Tab ID of the tab where the user clicked the extension icon (for post-login switch-back). */
let originTabId: number | null = null;

/** Tab ID of the login tab we opened or reused (closed after successful auth if still on /login). */
let loginTabId: number | null = null;

/** Guard to prevent concurrent auth checks (Loom-style single authority). */
let authCheckInProgress = false;

/**
 * Open login tab: reuse existing tab with /login or /dashboard, or create new one.
 * Sets loginTabId and returns the tab id.
 */
function openOrFocusLoginTab(loginUrl: string): Promise<number> {
  return new Promise((resolve) => {
    chrome.tabs.query({}, (tabs) => {
      const existing = tabs.find(
        (t) =>
          t.id != null &&
          typeof t.url === "string" &&
          (t.url.includes("/login") || t.url.includes("/dashboard"))
      );
      if (existing?.id != null) {
        const id = existing.id;
        chrome.tabs.update(id, { active: true }, () => {
          loginTabId = id;
          resolve(id);
        });
        return;
      }
      chrome.tabs.create({ url: loginUrl }, (created) => {
        const id = created?.id ?? 0;
        loginTabId = id || null;
        resolve(id);
      });
    });
  });
}

/** In-memory session cache for instant tray open. Not persisted; TTL 30s. */
let sessionCache: { authenticated: boolean; checkedAt: number } = {
  authenticated: false,
  checkedAt: 0,
};

let activeSessionId: string | null = null;

/** Minimal ticket shape for global tray; matches StructuredFeedback. */
type StructuredFeedback = { id: string; title: string; actionSteps: string[]; type?: string };

let globalUIState: {
  visible: boolean;
  expanded: boolean;
  isRecording: boolean;
  sessionId: string | null;
  sessionTitle: string | null;
  sessionModeActive: boolean;
  sessionPaused: boolean;
  sessionLoading: boolean;
  pointers: StructuredFeedback[];
  captureMode: "voice" | "text";
  user: { uid: string; name?: string | null; email?: string | null; photoURL?: string | null } | null;
} = {
  visible: false,
  expanded: false,
  isRecording: false,
  sessionId: null,
  sessionTitle: null,
  sessionModeActive: false,
  sessionPaused: false,
  sessionLoading: false,
  pointers: [],
  captureMode: "voice",
  user: null,
};

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
  globalUIState.pointers = [];
  chrome.storage.local.set({
    activeSessionId: null,
    sessionModeActive: false,
    sessionPaused: false,
  });
  broadcastUIState();
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { type: "ECHLY_RESET_WIDGET" }).catch(() => {});
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

/** Persist tray visibility so background remains source of truth across restarts. */
function persistUIState(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set(
      { trayVisible: globalUIState.visible, trayExpanded: globalUIState.expanded },
      () => resolve()
    );
  });
}

async function initializeSessionState(): Promise<void> {
  return new Promise<void>((resolve) => {
    chrome.storage.local.get(
      ["activeSessionId", "sessionModeActive", "sessionPaused", "trayVisible", "trayExpanded"],
      (result: {
        activeSessionId?: string;
        sessionModeActive?: boolean;
        sessionPaused?: boolean;
        trayVisible?: boolean;
        trayExpanded?: boolean;
      }) => {
        activeSessionId =
          typeof result.activeSessionId === "string"
            ? result.activeSessionId
            : null;

        globalUIState.sessionId = activeSessionId;
        globalUIState.sessionModeActive = result.sessionModeActive === true;
        globalUIState.sessionPaused = result.sessionPaused === true;
        globalUIState.visible = result.trayVisible === true;
        globalUIState.expanded = result.trayExpanded === true;

        const shouldReloadPointers =
          globalUIState.sessionModeActive === true && activeSessionId != null;

        if (shouldReloadPointers) {
          getValidToken()
            .then((token) =>
              fetch(
                `${API_BASE}/api/feedback?sessionId=${encodeURIComponent(activeSessionId!)}&limit=200`,
                { headers: { Authorization: `Bearer ${token}` } }
              )
            )
            .then((res) => {
              if (res.status === 401 || res.status === 403) {
                clearAuthState();
                globalUIState.pointers = [];
                broadcastUIState();
                resolve();
                return null;
              }
              return res.json();
            })
            .then((json: { feedback?: Array<{ id: string; title?: string; actionSteps?: string[] }> } | null) => {
              if (json === null) return;
              globalUIState.pointers = (json.feedback ?? []).map((f) => ({
                id: f.id,
                title: f.title ?? "",
                actionSteps: f.actionSteps ?? [],
              }));
              broadcastUIState();
              resolve();
            })
            .catch(() => {
              clearAuthState();
              globalUIState.pointers = [];
              broadcastUIState();
              resolve();
            });
        } else {
          resolve();
        }
      }
    );
  });
}

(async () => {
  await initializeSessionState();
  broadcastUIState();
})();

/** Extension-stored auth tokens (set on login success, cleared on logout/401). */
const ECHLY_TOKEN_KEYS = ["echlyIdToken", "echlyRefreshToken", "echlyTokenTime"] as const;

/**
 * Legacy auth keys — cleanup only. clearAuthState() removes them if present from older installs.
 */
const AUTH_STORAGE_KEYS_LEGACY = [
  "auth_idToken",
  "auth_refreshToken",
  "auth_expiresAtMs",
  "auth_user",
] as const;

/** Clear in-memory session cache (e.g. on 401). */
function clearSessionCache(): void {
  sessionCache = { authenticated: false, checkedAt: 0 };
  globalUIState.user = null;
}

/** Clear auth state: tokens, legacy keys, session cache; close tray and broadcast. */
function clearAuthState(): void {
  clearSessionCache();
  globalUIState.visible = false;
  globalUIState.expanded = false;
  chrome.storage.local.remove([...ECHLY_TOKEN_KEYS, ...AUTH_STORAGE_KEYS_LEGACY]);
  persistUIState();
  broadcastUIState();
}

/** Get stored tokens from extension storage. Returns null if any key is missing. */
function getStoredTokens(): Promise<{ idToken: string; refreshToken: string; tokenTime: number } | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      ["echlyIdToken", "echlyRefreshToken", "echlyTokenTime"],
      (result: { echlyIdToken?: string; echlyRefreshToken?: string; echlyTokenTime?: number }) => {
        const idToken = result.echlyIdToken;
        const refreshToken = result.echlyRefreshToken;
        const tokenTime = result.echlyTokenTime;
        if (
          typeof idToken === "string" &&
          idToken.length > 0 &&
          typeof refreshToken === "string" &&
          refreshToken.length > 0 &&
          typeof tokenTime === "number"
        ) {
          resolve({ idToken, refreshToken, tokenTime });
          return;
        }
        resolve(null);
      }
    );
  });
}

/**
 * Refresh ID token using Firebase securetoken endpoint. Updates storage with new tokens.
 * Throws on network error or invalid response; on failure caller should clear tokens.
 */
async function refreshIdToken(): Promise<string> {
  const stored = await getStoredTokens();
  if (!stored?.refreshToken) throw new Error("NOT_AUTHENTICATED");

  const url = `${FIREBASE_REFRESH_URL}?key=${encodeURIComponent(FIREBASE_API_KEY)}`;
  const body = `grant_type=refresh_token&refresh_token=${encodeURIComponent(stored.refreshToken)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    if (ECHLY_DEBUG) console.debug("[EXTENSION] refresh failed", res.status, text);
    throw new Error("NOT_AUTHENTICATED");
  }

  const data = (await res.json()) as {
    id_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };
  const newIdToken = data.id_token;
  const newRefreshToken = data.refresh_token ?? stored.refreshToken;
  if (!newIdToken) throw new Error("NOT_AUTHENTICATED");

  await new Promise<void>((resolve) => {
    chrome.storage.local.set(
      {
        echlyIdToken: newIdToken,
        echlyRefreshToken: newRefreshToken,
        echlyTokenTime: Date.now(),
      },
      () => resolve()
    );
  });
  return newIdToken;
}

/**
 * Get a valid ID token: from storage, refresh if older than 50 minutes.
 * Throws NOT_AUTHENTICATED if no tokens or refresh fails.
 */
async function getValidToken(): Promise<string> {
  const stored = await getStoredTokens();
  if (!stored) throw new Error("NOT_AUTHENTICATED");

  const age = Date.now() - stored.tokenTime;
  if (age > TOKEN_MAX_AGE_MS) {
    return refreshIdToken();
  }
  return stored.idToken;
}

/**
 * Backend session check: single source of truth. Uses GET /api/auth/session with Bearer token.
 * If 401/403 or no token/refresh failure, clears stored tokens and returns { authenticated: false }.
 */
async function checkBackendSession(): Promise<{
  authenticated: boolean;
  user?: { uid: string; name?: string | null; email?: string | null; photoURL?: string | null };
}> {
  let token: string;
  try {
    token = await getValidToken();
  } catch {
    clearAuthState();
    return { authenticated: false };
  }
  try {
    const res = await fetch(`${API_BASE}/api/auth/session`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401 || res.status === 403) {
      clearAuthState();
      return { authenticated: false };
    }
    if (!res.ok) {
      return { authenticated: false };
    }
    return (await res.json()) as {
      authenticated: boolean;
      user?: { uid: string; name?: string | null; email?: string | null; photoURL?: string | null };
    };
  } catch {
    clearAuthState();
    return { authenticated: false };
  }
}

/**
 * Verify the session with the Echly backend. Returns false if backend returns 401 or 403.
 * @deprecated Prefer checkBackendSession() for single source of truth.
 */
async function validateSessionWithBackend(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/session`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401 || res.status === 403) return false;
    return true;
  } catch {
    return false;
  }
}

function broadcastUIState(): void {
  echlyLog("BACKGROUND", "broadcast global state", globalUIState);
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id) {
        chrome.tabs
          .sendMessage(tab.id, { type: "ECHLY_GLOBAL_STATE", state: globalUIState })
          .catch(() => {
            if (ECHLY_DEBUG) console.debug("ECHLY broadcast skipped tab", tab.id);
          });
      }
    });
  });
}

/**
 * After tokens are in storage: validate with /api/auth/session, then if authenticated
 * set tray visible/expanded, broadcast, and switch back to origin tab.
 */
async function validateSessionAndOpenTray(): Promise<{ success: boolean }> {
  let token: string;
  try {
    token = await getValidToken();
  } catch {
    clearAuthState();
    return { success: false };
  }
  try {
    const res = await fetch(`${API_BASE}/api/auth/session`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401 || res.status === 403) {
      clearAuthState();
      return { success: false };
    }
    if (!res.ok) return { success: false };
    const data = (await res.json()) as {
      authenticated?: boolean;
      user?: { uid: string; name?: string | null; email?: string | null; photoURL?: string | null };
    };
    if (data.authenticated !== true) return { success: false };

    sessionCache = { authenticated: true, checkedAt: Date.now() };
    globalUIState.user = data.user ?? null;
    globalUIState.visible = true;
    globalUIState.expanded = true;
    persistUIState();
    broadcastUIState();

    if (originTabId != null) {
      try {
        await chrome.tabs.update(originTabId, { active: true });
      } catch {
        if (ECHLY_DEBUG) console.debug("[EXTENSION] could not switch to origin tab", originTabId);
      }
    }
    if (loginTabId != null) {
      try {
        const t = await chrome.tabs.get(loginTabId);
        if (t?.url?.includes("/login")) chrome.tabs.remove(loginTabId);
      } catch {
        /* tab may already be closed or invalid */
      }
      loginTabId = null;
    }
    return { success: true };
  } catch {
    clearAuthState();
    return { success: false };
  }
}

/** When user switches tabs, push current session state to that tab so every tab receives state when focused. */
chrome.tabs.onActivated.addListener((activeInfo) => {
  const tabId = activeInfo.tabId;
  chrome.tabs
    .sendMessage(tabId, { type: "ECHLY_GLOBAL_STATE", state: globalUIState })
    .catch((e) => {
      if (ECHLY_DEBUG) console.debug("ECHLY tab activation sync failed", e);
    });
  chrome.tabs
    .sendMessage(tabId, { type: "ECHLY_SESSION_STATE_SYNC" })
    .catch((e) => {
      if (ECHLY_DEBUG) console.debug("ECHLY session state sync failed for tab", tabId, e);
    });
});

/** When a new tab is created, push current session state. Fails silently if content script not yet injected. */
chrome.tabs.onCreated.addListener((tab) => {
  if (!tab.id) return;
  chrome.tabs
    .sendMessage(tab.id, { type: "ECHLY_GLOBAL_STATE", state: globalUIState })
    .catch((e) => {
      if (ECHLY_DEBUG) console.debug("ECHLY tab creation sync failed", e);
    });
});

/** Pre-warm session cache on startup: validate stored token so first icon click can open tray instantly. */
async function prewarmSessionFromStorage(): Promise<void> {
  try {
    const token = await getValidToken();
    if (!token) return;
    const res = await fetch(`${API_BASE}/api/auth/session`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = (await res.json()) as { authenticated?: boolean };
      sessionCache = {
        authenticated: data.authenticated === true,
        checkedAt: Date.now(),
      };
    } else {
      sessionCache = { authenticated: false, checkedAt: Date.now() };
    }
  } catch {
    sessionCache = { authenticated: false, checkedAt: Date.now() };
  }
}

chrome.runtime.onStartup.addListener(() => {
  prewarmSessionFromStorage();
});

chrome.runtime.onInstalled.addListener(() => {
  prewarmSessionFromStorage();
});

/** Extension icon click: store origin tab; use session cache (30s) for instant tray, else validate then open tray or login. */
chrome.action.onClicked.addListener((tab) => {
  if (authCheckInProgress) return;
  originTabId = tab?.id ?? null;

  if (sessionCache.authenticated === true && Date.now() - sessionCache.checkedAt < SESSION_CACHE_TTL_MS) {
    globalUIState.visible = true;
    globalUIState.expanded = true;
    persistUIState();
    broadcastUIState();
    return;
  }

  authCheckInProgress = true;
  (async () => {
    try {
      const session = await checkBackendSession();
      sessionCache = { authenticated: session.authenticated, checkedAt: Date.now() };

      if (session.authenticated === true) {
        globalUIState.user = session.user ?? null;
        globalUIState.visible = true;
        globalUIState.expanded = true;
        persistUIState();
        broadcastUIState();
      } else {
        globalUIState.user = null;
        const returnUrl = typeof tab?.url === "string" ? tab.url : "";
        const loginUrl =
          ECHLY_LOGIN_BASE +
          "?extension=true" +
          (returnUrl ? "&returnUrl=" + encodeURIComponent(returnUrl) : "");
        await openOrFocusLoginTab(loginUrl);
      }
    } catch {
      const returnUrl = typeof tab?.url === "string" ? tab.url : "";
      const loginUrl =
        ECHLY_LOGIN_BASE +
        "?extension=true" +
        (returnUrl ? "&returnUrl=" + encodeURIComponent(returnUrl) : "");
      await openOrFocusLoginTab(loginUrl);
    } finally {
      authCheckInProgress = false;
    }
  })();
});

/** Login page sends tokens via content script (postMessage bridge). We store them, validate session, open tray, switch to origin tab. */
chrome.runtime.onMessage.addListener((msg: { type?: string; idToken?: string; refreshToken?: string }, _sender, sendResponse) => {
  if (msg?.type !== "ECHLY_EXTENSION_AUTH_SUCCESS") return;
  const idToken = msg.idToken;
  const refreshToken = msg.refreshToken;
  if (typeof idToken !== "string" || idToken.length === 0 || typeof refreshToken !== "string" || refreshToken.length === 0) {
    sendResponse?.({ success: false, error: "Missing tokens" });
    return;
  }

  (async () => {
    try {
      await new Promise<void>((resolve) => {
        chrome.storage.local.set(
          {
            echlyIdToken: idToken,
            echlyRefreshToken: refreshToken,
            echlyTokenTime: Date.now(),
          },
          () => resolve()
        );
      });
      const result = await validateSessionAndOpenTray();
      sendResponse?.(result.success ? { success: true } : { success: false });
    } catch (e) {
      if (ECHLY_DEBUG) console.debug("[EXTENSION] auth success handler error", e);
      clearAuthState();
      sendResponse?.({ success: false });
    }
  })();
  return true;
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  echlyLog("MESSAGE", "received", request.type);
  if (request.type === "ECHLY_TOGGLE_VISIBILITY") {
    globalUIState.visible = true;
    globalUIState.expanded = true;
    broadcastUIState();
    sendResponse({ success: true });
    return true;
  }

  if (request.type === "ECHLY_EXPAND_WIDGET") {
    globalUIState.expanded = true;
    broadcastUIState();
    sendResponse({ ok: true });
    return false;
  }

  if (request.type === "ECHLY_COLLAPSE_WIDGET") {
    globalUIState.expanded = false;
    broadcastUIState();
    sendResponse({ ok: true });
    return false;
  }

  if (request.type === "ECHLY_GET_GLOBAL_STATE") {
    sendResponse({ state: { ...globalUIState } });
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
    }
    sendResponse({ ok: true });
    return false;
  }

  if (request.type === "ECHLY_SET_CAPTURE_MODE") {
    const mode = (request as { mode?: "voice" | "text" }).mode;
    if (mode === "voice" || mode === "text") {
      globalUIState.captureMode = mode;
      broadcastUIState();
    }
    sendResponse({ ok: true });
    return false;
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

  if (request.type === "ECHLY_SET_ACTIVE_SESSION") {
    const sessionId = (request as { sessionId?: string }).sessionId ?? null;
    activeSessionId = sessionId;
    globalUIState.sessionId = sessionId;
    globalUIState.sessionModeActive = true;
    globalUIState.sessionPaused = false;
    globalUIState.sessionLoading = Boolean(sessionId);
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
        globalUIState.sessionLoading = false;
        broadcastUIState();
        sendResponse({ success: true });
        return;
      }
      try {
        const token = await getValidToken();
        const [feedbackRes, sessionsRes] = await Promise.all([
          fetch(`${API_BASE}/api/feedback?sessionId=${encodeURIComponent(sessionId)}&limit=200`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/sessions`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (feedbackRes.status === 401 || feedbackRes.status === 403 || sessionsRes.status === 401 || sessionsRes.status === 403) {
          clearAuthState();
        }
        const feedbackJson = (await feedbackRes.json()) as { feedback?: Array<{ id: string; title?: string; actionSteps?: string[] }> };
        globalUIState.pointers = (feedbackJson.feedback ?? []).map((f) => ({
          id: f.id,
          title: f.title ?? "",
          actionSteps: f.actionSteps ?? [],
        }));
        const sessionsJson = (await sessionsRes.json()) as { success?: boolean; sessions?: Array<{ id: string; title?: string }> };
        if (sessionsJson.success && Array.isArray(sessionsJson.sessions)) {
          const match = sessionsJson.sessions.find((s) => s.id === sessionId);
          globalUIState.sessionTitle = match?.title ?? null;
        }
      } catch {
        clearAuthState();
        globalUIState.pointers = [];
      }
      globalUIState.sessionLoading = false;
      broadcastUIState();
      sendResponse({ success: true });
    })();
    return true;
  }

  if (request.type === "ECHLY_OPEN_TAB") {
    const url = (request as { url?: string }).url;
    if (url) {
      chrome.tabs.create({ url });
    }
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
    globalUIState.pointers = [];
    chrome.storage.local.set({
      activeSessionId: null,
      sessionModeActive: false,
      sessionPaused: false,
    });
    broadcastUIState();
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, { type: "ECHLY_RESET_WIDGET" }).catch(() => {});
        }
      });
    });
    sendResponse({ success: true });
    return true;
  }

  if (request.type === "ECHLY_GET_TOKEN") {
    (async () => {
      try {
        const token = await getValidToken();
        sendResponse({ token });
      } catch {
        clearAuthState();
        sendResponse({ error: "NOT_AUTHENTICATED" });
      }
    })();
    return true;
  }

  if (request.type === "ECHLY_GET_AUTH_STATE") {
    (async () => {
      const session = await checkBackendSession();
      sendResponse({
        authenticated: session.authenticated,
        user: session.authenticated && session.user ? session.user : null,
      });
    })();
    return true;
  }

  if (request.type === "ECHLY_OPEN_POPUP") {
    const returnUrl = typeof sender.tab?.url === "string" ? encodeURIComponent(sender.tab.url) : "";
    const loginUrl = returnUrl
      ? `${ECHLY_LOGIN_BASE}?extension=true&returnUrl=${returnUrl}`
      : `${ECHLY_LOGIN_BASE}?extension=true`;
    openOrFocusLoginTab(loginUrl).then(() => sendResponse({ ok: true }));
    return true;
  }

  /* Extension relies on dashboard login; in-extension OAuth disabled. Open login page instead. */
  if (request.type === "ECHLY_SIGN_IN" || request.type === "ECHLY_START_LOGIN" || request.type === "LOGIN") {
    const returnUrl = typeof sender.tab?.url === "string" ? encodeURIComponent(sender.tab.url) : "";
    const loginUrl = returnUrl
      ? `${ECHLY_LOGIN_BASE}?extension=true&returnUrl=${returnUrl}`
      : `${ECHLY_LOGIN_BASE}?extension=true`;
    openOrFocusLoginTab(loginUrl).then(() => sendResponse({ success: false, error: "Use dashboard login" }));
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
          screenshotId: string;
        };

        const token = await getValidToken();

        const res = await fetch(`${API_BASE}/api/upload-screenshot`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            screenshotId,
            imageDataUrl,
            sessionId,
          }),
        });

        if (res.status === 401 || res.status === 403) clearAuthState();
        const data = (await res.json()) as { url?: string; error?: string };

        if (!res.ok) {
          sendResponse({ error: data.error || "Upload failed" });
          return;
        }

        sendResponse({ url: data.url });
      } catch (err) {
        console.error("ECHLY_UPLOAD_SCREENSHOT error:", err);
        clearAuthState();
        sendResponse({ error: String(err) });
      }
    })();
    return true;
  }

  if (request.type === "ECHLY_PROCESS_FEEDBACK") {
    const payload = request.payload as {
      transcript: string;
      screenshotUrl: string | null;
      screenshotId: string | null;
      sessionId: string;
      context?: {
        url?: string;
        viewportWidth?: number;
        viewportHeight?: number;
        domPath?: string | null;
        nearbyText?: string | null;
        subtreeText?: string | null;
      } | null;
    };
    const { transcript, sessionId, context } = payload;
    if (!sessionId) {
      console.error("[ECHLY_PROCESS_FEEDBACK] sessionId is null/empty:", sessionId);
    }
    if (!transcript?.trim() || !sessionId) {
      warn("[Echly BG] Invalid payload: missing transcript or sessionId", {
        hasTranscript: !!transcript?.trim(),
        hasSessionId: !!sessionId,
      });
      sendResponse({ success: false, error: "Missing transcript or sessionId" });
      return false;
    }
    (async () => {
      try {
        const token = await getValidToken();
        const screenshotUrl: string | null = payload.screenshotUrl ?? null;
        const screenshotId: string | null = payload.screenshotId ?? null;

        const structurePayload = context ? { transcript, context } : { transcript };
        const structureRes = await fetch(`${API_BASE}/api/structure-feedback`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(structurePayload),
        });

        if (structureRes.status === 401 || structureRes.status === 403) clearAuthState();
        const structureText = await structureRes.text();
        if (!structureRes.ok) {
          console.error("[STRUCTURE FAILED RAW]", structureRes.status, structureText);
          sendResponse({ success: false, error: "Structure fetch failed" });
          return;
        }
        const data = JSON.parse(structureText) as {
          success?: boolean;
          tickets?: Array<{
            title?: string;
            description?: string;
            suggestedTags?: string[];
            actionSteps?: string[];
          }>;
          error?: string;
        };
        if (!data.success) {
          sendResponse({
            success: false,
            error: data.error || "Structure API failed",
          });
          return;
        }

        const tickets = Array.isArray(data.tickets) ? data.tickets : [];
        if (tickets.length === 0) {
          tickets.push({
            title: transcript.slice(0, 80),
            description: transcript,
            actionSteps: [],
            suggestedTags: ["Feedback"],
          });
        }

        let firstCreated: { id: string; title: string; description: string; type: string } | undefined;
        for (let i = 0; i < tickets.length; i++) {
          const t = tickets[i];
          const desc = typeof t.description === "string" ? t.description : (t.title ?? "");
          const body = {
            sessionId,
            title: t.title ?? "",
            description: desc,
            type: Array.isArray(t.suggestedTags) && t.suggestedTags[0] ? t.suggestedTags[0] : "Feedback",
            contextSummary: desc,
            actionSteps: Array.isArray(t.actionSteps) ? t.actionSteps : [],
            suggestedTags: t.suggestedTags,
            screenshotUrl: i === 0 ? screenshotUrl : null,
            screenshotId: i === 0 && screenshotId ? screenshotId : undefined,
            metadata: { clientTimestamp: Date.now() },
          };

          const feedbackRes = await fetch(`${API_BASE}/api/feedback`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(body),
          });
          if (feedbackRes.status === 401 || feedbackRes.status === 403) clearAuthState();
          const raw = await feedbackRes.text();

          if (!feedbackRes.ok) {
            console.error("[CREATE] FAILED:", feedbackRes.status, raw);
            sendResponse({ success: false, error: "Feedback API failed" });
            return;
          }

          let feedbackJson: {
            success?: boolean;
            ticket?: { id: string; title: string; description: string; type?: string };
          };
          try {
            feedbackJson = JSON.parse(raw) as {
              success?: boolean;
              ticket?: { id: string; title: string; description: string; type?: string };
            };
          } catch (err) {
            console.error("[CREATE] JSON parse failed:", err, raw);
            sendResponse({ success: false, error: "Feedback API failed" });
            return;
          }

          // parsed JSON only after ok + parse success
          const typedFeedbackJson = feedbackJson as {
            success?: boolean;
            ticket?: { id: string; title: string; description: string; type?: string };
          };
          if (typedFeedbackJson.success && typedFeedbackJson.ticket) {
            const tick = typedFeedbackJson.ticket;
            if (!firstCreated)
              firstCreated = {
                id: tick.id,
                title: tick.title,
                description: tick.description,
                type: tick.type ?? "Feedback",
              };
          }
        }
        if (firstCreated) {
          const pointer: StructuredFeedback = {
            id: firstCreated.id,
            title: firstCreated.title,
            actionSteps: [],
            type: firstCreated.type,
          };
          globalUIState.pointers = [...globalUIState.pointers, pointer];
          resetSessionIdleTimer();
          broadcastUIState();
          sendResponse({ success: true, ticket: firstCreated });
          chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
              if (tab.id) {
                chrome.tabs.sendMessage(tab.id, {
                  type: "ECHLY_FEEDBACK_CREATED",
                  ticket: firstCreated,
                  sessionId,
                }).catch(() => {});
              }
            });
          });
        } else {
          sendResponse({ success: false, error: "No ticket created" });
        }
      } catch (error) {
        console.error("ECHLY_PROCESS_FEEDBACK error:", error);
        clearAuthState();
        sendResponse({
          success: false,
          error: String(error),
        });
      }
    })();
    return true;
  }

  if (request.type === "echly-api") {
    const { url, method, headers, body, token } = request as {
      url: string;
      method?: string;
      headers?: Record<string, string>;
      body?: string | null;
      token?: string;
    };
    (async () => {
      try {
        const resolvedToken = token ?? (await getValidToken());
        const h = { ...headers };
        if (resolvedToken) h["Authorization"] = `Bearer ${resolvedToken}`;
        const res = await fetch(url, {
          method: method || "GET",
          headers: h,
          body: body ?? undefined,
        });
        if (res.status === 401 || res.status === 403) clearAuthState();
        const text = await res.text();
        const out: Record<string, string> = {};
        res.headers.forEach((v, k) => {
          out[k] = v;
        });
        sendResponse({ ok: res.ok, status: res.status, headers: out, body: text });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const isAuth = message === "NOT_AUTHENTICATED" || message.includes("NOT_AUTHENTICATED");
        if (isAuth) clearAuthState();
        sendResponse({
          ok: false,
          status: isAuth ? 401 : 0,
          headers: {},
          body: isAuth ? "Not authenticated" : message,
        });
      }
    })();
    return true;
  }

  return false;
});
