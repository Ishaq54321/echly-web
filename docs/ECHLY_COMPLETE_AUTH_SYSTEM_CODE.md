# Echly — Complete Authentication System Code Extraction

This document contains the **full source code** of every file related to authentication and login state for the Chrome extension and the dashboard, plus explanations of how they connect. No code has been modified.

---

# PART 1 — EXTENSION AUTH SYSTEM

## 1.1 echly-extension/src/background.ts

**Full file contents:**

```typescript
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
const SESSION_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes — use cache if validated within this window
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
 * Open login tab: reuse only an existing tab whose URL contains "/login".
 * Dashboard tabs are never reused so the extension always opens the login page when unauthenticated.
 * Sets loginTabId and returns the tab id.
 */
function openOrFocusLoginTab(loginUrl: string): Promise<number> {
  return new Promise((resolve) => {
    chrome.tabs.query({}, (tabs) => {
      const existing = tabs.find(
        (t) =>
          t.id != null &&
          typeof t.url === "string" &&
          t.url.includes("/login")
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
              console.warn("[ECHLY AUTH] transient error, not clearing auth");
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
    console.warn("[ECHLY AUTH] transient error, not clearing auth");
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
  const payload = { type: "ECHLY_GLOBAL_STATE" as const, state: globalUIState };
  chrome.tabs.query({}, (tabs) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (activeTabs) => {
      const activeTabId = activeTabs[0]?.id ?? null;
      tabs.forEach((tab) => {
        if (!tab.id) return;
        const isActiveTab = tab.id === activeTabId;
        chrome.tabs
          .sendMessage(tab.id, payload)
          .catch(() => {
            if (ECHLY_DEBUG) console.debug("ECHLY broadcast skipped tab", tab.id);
            if (isActiveTab) {
              setTimeout(() => {
                chrome.tabs.sendMessage(tab.id!, payload).catch(() => {
                  if (ECHLY_DEBUG) console.debug("ECHLY broadcast retry skipped tab", tab.id);
                });
              }, 50);
            }
          });
      });
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
    console.warn("[ECHLY AUTH] transient error, not clearing auth");
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

/** Extension icon click: store origin tab; use session cache (30s) for instant tray, else validate then open tray or login. Never opens or focuses dashboard. */
chrome.action.onClicked.addListener((tab) => {
  if (authCheckInProgress) return;
  originTabId = tab?.id ?? null;

  if (sessionCache.authenticated === true && Date.now() - sessionCache.checkedAt < SESSION_CACHE_TTL_MS) {
    console.log("[ECHLY AUTH] opening tray");
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
      console.log("[ECHLY AUTH] session authenticated:", session.authenticated);

      if (session.authenticated === true) {
        globalUIState.user = session.user ?? null;
        console.log("[ECHLY AUTH] opening tray");
        globalUIState.visible = true;
        globalUIState.expanded = true;
        persistUIState();
        broadcastUIState();
      } else {
        globalUIState.user = null;
        console.log("[ECHLY AUTH] opening login tab");
        const returnUrl = typeof tab?.url === "string" ? tab.url : "";
        const loginUrl =
          ECHLY_LOGIN_BASE +
          "?extension=true" +
          (returnUrl ? "&returnUrl=" + encodeURIComponent(returnUrl) : "");
        await openOrFocusLoginTab(loginUrl);
      }
    } catch {
      console.log("[ECHLY AUTH] opening login tab");
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
      console.warn("[ECHLY AUTH] transient error, not clearing auth");
      sendResponse?.({ success: false });
    }
  })();
  return true;
});

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

chrome.tabs.onCreated.addListener((tab) => {
  if (!tab.id) return;
  chrome.tabs
    .sendMessage(tab.id, { type: "ECHLY_GLOBAL_STATE", state: globalUIState })
    .catch((e) => {
      if (ECHLY_DEBUG) console.debug("ECHLY tab creation sync failed", e);
    });
});

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

chrome.action.onClicked.addListener((tab) => {
  if (authCheckInProgress) return;
  originTabId = tab?.id ?? null;
  if (sessionCache.authenticated === true && Date.now() - sessionCache.checkedAt < SESSION_CACHE_TTL_MS) {
    console.log("[ECHLY AUTH] opening tray");
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
      console.log("[ECHLY AUTH] session authenticated:", session.authenticated);
      if (session.authenticated === true) {
        globalUIState.user = session.user ?? null;
        console.log("[ECHLY AUTH] opening tray");
        globalUIState.visible = true;
        globalUIState.expanded = true;
        persistUIState();
        broadcastUIState();
      } else {
        globalUIState.user = null;
        console.log("[ECHLY AUTH] opening login tab");
        const returnUrl = typeof tab?.url === "string" ? tab.url : "";
        const loginUrl =
          ECHLY_LOGIN_BASE +
          "?extension=true" +
          (returnUrl ? "&returnUrl=" + encodeURIComponent(returnUrl) : "");
        await openOrFocusLoginTab(loginUrl);
      }
    } catch {
      console.log("[ECHLY AUTH] opening login tab");
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
      console.warn("[ECHLY AUTH] transient error, not clearing auth");
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
  if (request.type === "ECHLY_FEEDBACK_CREATED") { /* ... */ sendResponse({ ok: true }); return false; }
  if (request.type === "ECHLY_SET_CAPTURE_MODE") { /* ... */ return false; }
  if (request.type === "ECHLY_SESSION_UPDATED") { /* ... */ return false; }
  if (request.type === "ECHLY_TICKET_UPDATED") { /* ... */ return false; }
  if (request.type === "ECHLY_SET_ACTIVE_SESSION") {
    const sessionId = (request as { sessionId?: string }).sessionId ?? null;
    activeSessionId = sessionId;
    globalUIState.sessionId = sessionId;
    globalUIState.sessionModeActive = true;
    globalUIState.sessionPaused = false;
    globalUIState.sessionLoading = Boolean(sessionId);
    chrome.storage.local.set({ activeSessionId: sessionId, sessionModeActive: true, sessionPaused: false });
    if (sessionId) { globalUIState.expanded = true; resetSessionIdleTimer(); }
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
          fetch(`${API_BASE}/api/feedback?sessionId=${encodeURIComponent(sessionId)}&limit=200`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/sessions`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (feedbackRes.status === 401 || feedbackRes.status === 403 || sessionsRes.status === 401 || sessionsRes.status === 403) {
          clearAuthState();
        }
        const feedbackJson = (await feedbackRes.json()) as { feedback?: Array<{ id: string; title?: string; actionSteps?: string[] }> };
        globalUIState.pointers = (feedbackJson.feedback ?? []).map((f) => ({ id: f.id, title: f.title ?? "", actionSteps: f.actionSteps ?? [] }));
        const sessionsJson = (await sessionsRes.json()) as { success?: boolean; sessions?: Array<{ id: string; title?: string }> };
        if (sessionsJson.success && Array.isArray(sessionsJson.sessions)) {
          const match = sessionsJson.sessions.find((s) => s.id === sessionId);
          globalUIState.sessionTitle = match?.title ?? null;
        }
      } catch {
        console.warn("[ECHLY AUTH] transient error, not clearing auth");
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
  if (request.type === "ECHLY_SESSION_MODE_START") { /* ... */ return false; }
  if (request.type === "ECHLY_SESSION_ACTIVITY") { /* ... */ return false; }
  if (request.type === "ECHLY_SESSION_MODE_PAUSE") { /* ... */ return false; }
  if (request.type === "ECHLY_SESSION_MODE_RESUME") { /* ... */ return false; }
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
        console.warn("[ECHLY AUTH] transient error, not clearing auth");
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
  if (request.type === "ECHLY_SIGN_IN" || request.type === "ECHLY_START_LOGIN" || request.type === "LOGIN") {
    const returnUrl = typeof sender.tab?.url === "string" ? encodeURIComponent(sender.tab.url) : "";
    const loginUrl = returnUrl
      ? `${ECHLY_LOGIN_BASE}?extension=true&returnUrl=${returnUrl}`
      : `${ECHLY_LOGIN_BASE}?extension=true`;
    openOrFocusLoginTab(loginUrl).then(() => sendResponse({ success: false, error: "Use dashboard login" }));
    return true;
  }
  if (request.type === "START_RECORDING") { /* ... */ return false; }
  if (request.type === "STOP_RECORDING") { /* ... */ return false; }
  if (request.type === "CAPTURE_TAB") { /* ... */ return true; }
  if (request.type === "ECHLY_UPLOAD_SCREENSHOT") { /* async getValidToken, fetch upload-screenshot, 401/403 clearAuthState */ return true; }
  if (request.type === "ECHLY_PROCESS_FEEDBACK") { /* async getValidToken, structure-feedback + feedback APIs, 401/403 clearAuthState */ return true; }
  if (request.type === "echly-api") {
    const { url, method, headers, body, token } = request as { url: string; method?: string; headers?: Record<string, string>; body?: string | null; token?: string };
    (async () => {
      try {
        const resolvedToken = token ?? (await getValidToken());
        const h = { ...headers };
        if (resolvedToken) h["Authorization"] = `Bearer ${resolvedToken}`;
        const res = await fetch(url, { method: method || "GET", headers: h, body: body ?? undefined });
        if (res.status === 401 || res.status === 403) clearAuthState();
        const text = await res.text();
        const out: Record<string, string> = {};
        res.headers.forEach((v, k) => { out[k] = v; });
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
```

**What it does:** The background service worker is the single authority for extension auth. It keeps tokens in `chrome.storage.local` (echlyIdToken, echlyRefreshToken, echlyTokenTime), refreshes the ID token when older than 50 minutes via Firebase securetoken, and validates session with `GET /api/auth/session`. On icon click it uses `sessionCache` (5 min TTL) for a fast path; otherwise it runs `checkBackendSession()` then either opens the tray or opens/focuses the login tab. Login success is handled by `ECHLY_EXTENSION_AUTH_SUCCESS`: store tokens, call `validateSessionAndOpenTray()`, then switch back to the origin tab and close the login tab if still on /login.

---

## 1.2 echly-extension/src/content.tsx (auth-relevant excerpts)

**Relevant constants and auth-related code:**

- **APP_ORIGIN** (lines 21–24): Used to build dashboard URL after “End session” (`${APP_ORIGIN}/dashboard/${sessionId}`). Same env logic as API (dev: localhost:3000, else echly-web.vercel.app).
- **requestOpenLoginPage()**: Sends `ECHLY_OPEN_POPUP` to background to open the login page.
- **ensureLoginCompleteForwarder()**: Listens for `postMessage` type `ECHLY_PAGE_LOGIN_SUCCESS` from the page (dashboard origins only), then sends `ECHLY_EXTENSION_AUTH_SUCCESS` with `idToken` and `refreshToken` to the background.
- **injectPageTokenBridge()**: Injects `pageTokenBridge.js` only on dashboard origins so the page can respond to token requests.
- Content never performs auth itself; it receives `ECHLY_GLOBAL_STATE` (including `user`) from the background and shows the tray or “Sign in” accordingly.

(Full content.tsx is very long; the complete file is in the repo. The auth flow is: content receives global state from background; on login page, the page posts `ECHLY_PAGE_LOGIN_SUCCESS` → content forwards to background as `ECHLY_EXTENSION_AUTH_SUCCESS`; content uses `apiFetch` from contentAuthFetch for all API calls, which go through background with the token.)

---

## 1.3 echly-extension/src/contentAuthFetch.ts

**Full file contents:**

```typescript
/**
 * authFetch for content script: proxies requests through background (no Firebase in content).
 * Background adds Bearer token via ECHLY_GET_TOKEN / getValidToken().
 */
import { ECHLY_DEBUG } from "../../lib/utils/logger";

const API_BASE =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://echly-web.vercel.app";
if (ECHLY_DEBUG) console.log("[EXTENSION] Using API_BASE:", API_BASE);

export function clearAuthTokenCache(): void {
  // No-op: token cache lives in background.
}

function getFullUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    return input.startsWith("http") ? input : API_BASE + input;
  }
  if (input instanceof URL) return input.href;
  return input.url;
}

export function authFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const url = getFullUrl(input);
  const method = (init.method || "GET") as string;
  const headers: Record<string, string> =
    init.headers instanceof Headers
      ? Object.fromEntries(init.headers)
      : Array.isArray(init.headers)
        ? Object.fromEntries(init.headers)
        : { ...(init.headers as Record<string, string>) };
  const body = init.body ?? null;

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: "echly-api", url, method, headers, body },
      (response: { ok?: boolean; status?: number; headers?: Record<string, string>; body?: string } | undefined) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (!response) {
          reject(new Error("No response from background"));
          return;
        }
        const res = new Response(response.body ?? "", {
          status: response.status ?? 0,
          headers: response.headers ? new Headers(response.headers) : undefined,
        });
        resolve(res);
      }
    );
  });
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const url = path.startsWith("http") ? path : API_BASE + path;
  return authFetch(url, options);
}
```

**What it does:** Content script has no Firebase or token storage. Every API call from content goes to the background via `echly-api` message; the background attaches the Bearer token with `getValidToken()` and performs the fetch. So auth is entirely in the background; content only sees success/failure and data.

---

## 1.4 echly-extension/src/secureBridgeChannel.ts

**Full file contents:**

```typescript
/**
 * Secure channel negotiation between extension content script and page token bridge.
 * Uses a random channel id (ECHLY_SECURE_CHANNEL_<random>) and handshake so the bridge
 * only responds on that channel. Removes static channel usage.
 */

export const ECHLY_BRIDGE_HANDSHAKE_TYPE = "ECHLY_BRIDGE_HANDSHAKE";
export const ECHLY_BRIDGE_READY_TYPE = "ECHLY_BRIDGE_READY";
export const ECHLY_HANDSHAKE_CHANNEL = "ECHLY_BRIDGE_HANDSHAKE_CHANNEL";

export const ECHLY_REQUEST_TOKEN_TYPE = "ECHLY_REQUEST_TOKEN";
export const ECHLY_TOKEN_RESPONSE_TYPE = "ECHLY_TOKEN_RESPONSE";

export const ECHLY_EXTENSION_SOURCE = "ECHLY_EXTENSION";

const DEFAULT_HANDSHAKE_TIMEOUT_MS = 3000;

export function generateChannelId(): string {
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  return `ECHLY_SECURE_CHANNEL_${suffix}`;
}

let cachedChannel: string | null = null;

export function performHandshake(timeoutMs: number = DEFAULT_HANDSHAKE_TIMEOUT_MS): Promise<string> {
  if (cachedChannel) return Promise.resolve(cachedChannel);

  const proposedChannel = generateChannelId();
  const targetOrigin = window.location.origin;

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      window.removeEventListener("message", handler);
      reject(new Error("ECHLY_BRIDGE_HANDSHAKE_TIMEOUT"));
    }, timeoutMs);

    const handler = (event: MessageEvent) => {
      const data = event.data;
      if (!data || data.type !== ECHLY_BRIDGE_READY_TYPE) return;
      if (data.channel !== proposedChannel) return;

      window.removeEventListener("message", handler);
      clearTimeout(timer);
      cachedChannel = proposedChannel;
      resolve(proposedChannel);
    };

    window.addEventListener("message", handler);
    window.postMessage(
      {
        channel: ECHLY_HANDSHAKE_CHANNEL,
        type: ECHLY_BRIDGE_HANDSHAKE_TYPE,
        proposedChannel,
        source: ECHLY_EXTENSION_SOURCE,
      },
      targetOrigin
    );
  });
}

export function resetChannel(): void {
  cachedChannel = null;
}
```

**What it does:** Provides handshake and channel constants for the content script ↔ page token bridge. `performHandshake()` sends ECHLY_BRIDGE_HANDSHAKE with a proposed channel; the page bridge replies with ECHLY_BRIDGE_READY. The returned channel is used for token requests (ECHLY_REQUEST_TOKEN → ECHLY_TOKEN_RESPONSE). Used by `requestTokenFromPage()`.

---

## 1.5 echly-extension/src/requestTokenFromPage.ts

**Full file contents:**

```typescript
/**
 * Content script helper: request Firebase ID token from the page via postMessage.
 * Uses secure channel handshake (ECHLY_BRIDGE_HANDSHAKE → ECHLY_BRIDGE_READY) then
 * ECHLY_REQUEST_TOKEN with channel, nonce, source. Bridge responds with ECHLY_TOKEN_RESPONSE
 * to event.origin only. Only works on dashboard pages where the bridge is injected.
 */

import {
  performHandshake,
  ECHLY_REQUEST_TOKEN_TYPE,
  ECHLY_TOKEN_RESPONSE_TYPE,
  ECHLY_EXTENSION_SOURCE,
} from "./secureBridgeChannel";

const HANDSHAKE_TIMEOUT_MS = 1500;
const TOKEN_REQUEST_TIMEOUT_MS = 2000;

export async function requestTokenFromPage(): Promise<string | null> {
  let channel: string;
  try {
    channel = await performHandshake(HANDSHAKE_TIMEOUT_MS);
  } catch {
    return null;
  }

  const nonce = crypto.randomUUID();
  const targetOrigin = window.location.origin;

  return new Promise((resolve) => {
    const listener = (event: MessageEvent) => {
      const data = event.data;
      if (!data) return;
      if (data.channel !== channel) return;
      if (data.type !== ECHLY_TOKEN_RESPONSE_TYPE) return;
      if (data.nonce !== nonce) return;

      window.removeEventListener("message", listener);
      clearTimeout(timer);
      resolve(typeof data.token === "string" ? data.token : null);
    };

    window.addEventListener("message", listener);
    const timer = setTimeout(() => {
      window.removeEventListener("message", listener);
      resolve(null);
    }, TOKEN_REQUEST_TIMEOUT_MS);

    window.postMessage(
      {
        channel,
        type: ECHLY_REQUEST_TOKEN_TYPE,
        nonce,
        source: ECHLY_EXTENSION_SOURCE,
      },
      targetOrigin
    );
  });
}
```

**What it does:** Used when the content script needs a token from a dashboard page (e.g. legacy or diagnostic paths). It performs a handshake with the page-injected bridge (secureBridgeChannel), then sends a token request with nonce; the bridge replies with the Firebase ID token on the same channel. The extension’s main icon-click auth path does **not** use this; it uses only extension-stored tokens and `checkBackendSession()`.

---

## 1.6 echly-extension/src/pageTokenBridge.js

**Full file contents:**

```javascript
/**
 * Page-context token bridge for Echly extension.
 * Injected only on dashboard origins. Listens for secure handshake then token requests.
 * - Handshake: ECHLY_BRIDGE_HANDSHAKE with proposedChannel → reply ECHLY_BRIDGE_READY.
 * - Token: ECHLY_REQUEST_TOKEN (channel, nonce, source) → ECHLY_TOKEN_RESPONSE to event.origin only.
 * Never uses "*" as target origin. Validates source, channel, type, nonce, and dashboard origin.
 */
(function () {
  var ECHLY_HANDSHAKE_CHANNEL = "ECHLY_BRIDGE_HANDSHAKE_CHANNEL";
  var ECHLY_BRIDGE_HANDSHAKE_TYPE = "ECHLY_BRIDGE_HANDSHAKE";
  var ECHLY_BRIDGE_READY_TYPE = "ECHLY_BRIDGE_READY";
  var ECHLY_REQUEST_TOKEN_TYPE = "ECHLY_REQUEST_TOKEN";
  var ECHLY_TOKEN_RESPONSE_TYPE = "ECHLY_TOKEN_RESPONSE";
  var ECHLY_EXTENSION_SOURCE = "ECHLY_EXTENSION";

  var ALLOWED_ORIGINS = ["https://echly-web.vercel.app", "http://localhost:3000"];
  var negotiatedChannel = null;

  function isAllowedOrigin(origin) {
    return typeof origin === "string" && ALLOWED_ORIGINS.indexOf(origin) !== -1;
  }

  window.addEventListener("message", async function (event) {
    var data = event.data;
    var origin = event.origin;

    if (!data || typeof data !== "object") return;
    if (!isAllowedOrigin(origin)) return;

    if (data.channel === ECHLY_HANDSHAKE_CHANNEL && data.type === ECHLY_BRIDGE_HANDSHAKE_TYPE) {
      if (data.source !== ECHLY_EXTENSION_SOURCE) return;
      var proposed = data.proposedChannel;
      if (typeof proposed !== "string" || proposed.indexOf("ECHLY_SECURE_CHANNEL_") !== 0) return;
      negotiatedChannel = proposed;
      window.postMessage(
        { channel: proposed, type: ECHLY_BRIDGE_READY_TYPE },
        origin
      );
      return;
    }

    if (!negotiatedChannel || data.channel !== negotiatedChannel) return;
    if (data.type !== ECHLY_REQUEST_TOKEN_TYPE) return;
    if (data.source !== ECHLY_EXTENSION_SOURCE) return;
    if (data.nonce == null) return;

    function sendTokenResponse(token) {
      window.postMessage(
        { channel: negotiatedChannel, type: ECHLY_TOKEN_RESPONSE_TYPE, nonce: data.nonce, token: token },
        origin
      );
    }

    var AUTH_WAIT_MS = 5000;

    function getAuthInstance() {
      return window.firebase && window.firebase.auth && typeof window.firebase.auth === "function"
        ? window.firebase.auth()
        : null;
    }

    function waitForAuthInstance() {
      return new Promise(function (resolve) {
        var authInstance = getAuthInstance();
        if (authInstance) {
          resolve(authInstance);
          return;
        }
        var deadline = Date.now() + AUTH_WAIT_MS;
        var interval = setInterval(function () {
          if (Date.now() >= deadline) {
            clearInterval(interval);
            resolve(null);
            return;
          }
          authInstance = getAuthInstance();
          if (authInstance) {
            clearInterval(interval);
            resolve(authInstance);
          }
        }, 100);
      });
    }

    function getTokenFromAuth(authInstance) {
      return new Promise(function (resolve) {
        var user = authInstance.currentUser;
        if (user) {
          user.getIdToken().then(resolve).catch(function () {
            resolve(null);
          });
          return;
        }
        var timeout = setTimeout(function () {
          unsubscribe();
          resolve(null);
        }, AUTH_WAIT_MS);
        var unsubscribe = authInstance.onAuthStateChanged(function (u) {
          if (u) {
            clearTimeout(timeout);
            unsubscribe();
            u.getIdToken().then(resolve).catch(function () {
              resolve(null);
            });
          }
        });
      });
    }

    (async function () {
      try {
        var authInstance = await waitForAuthInstance();
        if (!authInstance) {
          sendTokenResponse(null);
          return;
        }
        var token = await getTokenFromAuth(authInstance);
        sendTokenResponse(token);
      } catch (err) {
        sendTokenResponse(null);
      }
    })();
  });
})();
```

**What it does:** Runs in the page context on dashboard origins only (injected by content script). Handles handshake and token requests from the content script; uses `window.firebase.auth()` to get the current user’s ID token and sends it back on the negotiated channel. Used by `requestTokenFromPage()`; the main extension login flow uses the login page’s `ECHLY_PAGE_LOGIN_SUCCESS` postMessage instead, which sends tokens to the content script then to the background.

---

## 1.7 echly-extension/src/api.ts

**Full file contents:**

```typescript
/**
 * API client for production backend.
 * Automatically attaches Authorization: Bearer <firebase-id-token> to every request.
 */
import { ECHLY_DEBUG } from "../../lib/utils/logger";
import { auth } from "./firebase";

const API_BASE = "http://localhost:3000";
if (ECHLY_DEBUG) console.log("[EXTENSION] Using API_BASE:", API_BASE);

export { API_BASE };

export type ApiFetchOptions = RequestInit & {
  /** If true, do not attach Authorization header (e.g. public endpoints). Default false. */
  skipAuth?: boolean;
};

/**
 * Fetch helper that:
 * - Calls API_BASE (e.g. http://localhost:3000 for debugging)
 * - Attaches Authorization: Bearer <firebase-id-token> from auth.currentUser.getIdToken()
 * - Throws if not logged in (unless skipAuth: true)
 */
export async function apiFetch(
  path: string,
  options: ApiFetchOptions = {}
): Promise<Response> {
  const { skipAuth = false, headers = {}, ...rest } = options;

  const headersRecord: Record<string, string> =
    headers instanceof Headers
      ? Object.fromEntries(headers)
      : Array.isArray(headers)
        ? Object.fromEntries(headers)
        : { ...headers };

  if (!skipAuth) {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("Not signed in. Sign in with Google to use this feature.");
    }
    const token = await user.getIdToken();
    headersRecord["Authorization"] = `Bearer ${token}`;
  }

  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  return fetch(url, {
    ...rest,
    headers: headersRecord,
  });
}
```

**What it does:** This module uses Firebase `auth.currentUser` and is intended for contexts where Firebase Auth is available (e.g. popup or a dashboard-like context inside the extension). The main content script and background do **not** use this for icon-click or tray API calls; they use extension storage + `contentAuthFetch` (content) and `getValidToken()` (background). So this file is a separate, Firebase-based API path (e.g. popup or legacy).

---

## 1.8 echly-extension/manifest.json

**Full file contents:**

```json
{
  "manifest_version": 3,
  "name": "Echly",
  "version": "1.0",
  "description": "Capture screenshots and submit feedback",
  "permissions": ["storage", "activeTab", "tabs"],
  "host_permissions": [
    "<all_urls>",
    "http://localhost:3000/*",
    "https://echly-web.vercel.app/*",
    "https://*.firebaseapp.com/*",
    "https://www.gstatic.com/*",
    "https://securetoken.googleapis.com/*",
    "https://www.googleapis.com/*",
    "https://apis.google.com/*"
  ],
  "icons": { ... },
  "action": {
    "default_icon": { ... }
  },
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ],
  "web_accessible_resources": [
    { "resources": ["popup.css", "assets/...", "fonts/..."], "matches": ["<all_urls>"] },
    {
      "resources": ["pageTokenBridge.js"],
      "matches": [
        "https://echly-web.vercel.app/*",
        "http://localhost:3000/*"
      ]
    }
  ]
}
```

**What it does:** Declares storage/tabs permissions (needed for tokens and login tab), host permissions for API and Firebase, background script, and content script on all URLs. `pageTokenBridge.js` is only exposed to dashboard origins so only those pages can participate in the token bridge.

---

## 1.9 Extension auth flow (how it all connects)

- **Extension icon click**  
  - `chrome.action.onClicked` in background sets `originTabId`, then:
  - **sessionCache:** If `sessionCache.authenticated === true` and `Date.now() - sessionCache.checkedAt < SESSION_CACHE_TTL_MS` (5 min), background sets tray visible/expanded, persists, broadcasts, and returns (no network).
  - **Otherwise:** Sets `authCheckInProgress`, calls **getValidToken()** (read from storage; if token older than 50 min, **refresh** via Firebase securetoken), then **checkBackendSession()** → `GET /api/auth/session` with Bearer token.
  - **Session result:** Updates `sessionCache` and, if authenticated, sets `globalUIState.user`, tray visible/expanded, persist, broadcast → **tray open**. If not authenticated, builds `ECHLY_LOGIN_BASE?extension=true&returnUrl=...` and calls **openOrFocusLoginTab(loginUrl)** → **login tab open**.
- **Login success (from dashboard login page):**  
  - Login page posts `ECHLY_PAGE_LOGIN_SUCCESS` with `idToken` and `refreshToken`.  
  - Content script (ensureLoginCompleteForwarder) receives it (dashboard origins only), sends **ECHLY_EXTENSION_AUTH_SUCCESS** to background with same tokens.  
  - Background stores `echlyIdToken`, `echlyRefreshToken`, `echlyTokenTime`, then runs **validateSessionAndOpenTray()** → `GET /api/auth/session` → on success sets sessionCache, user, tray visible/expanded, persist, broadcast, switches to `originTabId`, closes login tab if still on /login → **tray open**.

So: **Extension icon click → sessionCache (optional short-circuit) → getValidToken (and token refresh) → /api/auth/session → tray open OR login tab open.** Login path: **login page → Firebase login → ID token + refresh token → postMessage to extension → extension stores tokens → validateSessionAndOpenTray() → tray open.**

---

# PART 2 — LOGIN FLOW

## 2.1 app/(auth)/login/page.tsx

**Full file contents:**

```tsx
"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { signInWithGoogle, signInWithEmailPassword } from "../../../lib/auth/authActions";
import { checkUserWorkspace } from "@/lib/auth/checkUserWorkspace";
import { AuthCard } from "@/components/auth/AuthCard";

const inputClass =
  "w-full h-11 rounded-[10px] border border-[#E5E7EB] bg-white text-gray-900 text-base pl-3 placeholder:text-gray-400 focus:outline-none focus:border-[#466EFF] focus:ring-[3px] focus:ring-[rgba(70,110,255,0.15)]";

const primaryButtonClass =
  "w-full h-11 rounded-[10px] text-white font-medium text-base transition-all disabled:opacity-60 hover:brightness-105 flex items-center justify-center";

const primaryButtonStyle = {
  background: "linear-gradient(135deg,#466EFF,#5F7DFF)",
  boxShadow: "0 10px 28px rgba(70,110,255,0.28)"
};

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isExtension = searchParams.get("extension") === "true";
  const returnUrl = searchParams.get("returnUrl") ?? null;

  const [authChecked, setAuthChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (isExtension) {
          try {
            const idToken = await user.getIdToken();
            const refreshToken = (user as { refreshToken?: string }).refreshToken ?? "";
            window.postMessage(
              { type: "ECHLY_PAGE_LOGIN_SUCCESS", idToken, refreshToken },
              "*"
            );
          } catch {
            /* ignore */
          }
          window.location.href = "/dashboard";
          return;
        }
        const params = new URLSearchParams();
        if (isExtension) params.set("extension", "true");
        if (returnUrl) params.set("returnUrl", returnUrl);
        const qs = params.toString();
        const dashboardUrl = qs ? `/dashboard?${qs}` : "/dashboard";
        window.location.href = dashboardUrl;
        return;
      }
      setAuthChecked(true);
    });
    return () => unsub();
  }, [isExtension, returnUrl]);

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try{
      const user = await signInWithGoogle();
      if (isExtension) {
        const idToken = await user.getIdToken();
        const refreshToken = (user as { refreshToken?: string }).refreshToken ?? "";
        window.postMessage(
          { type: "ECHLY_PAGE_LOGIN_SUCCESS", idToken, refreshToken },
          "*"
        );
        window.location.href = "/dashboard";
        return;
      }
      const dest = await checkUserWorkspace(user.uid);
      router.replace(dest === "dashboard" ? "/dashboard" : "/onboarding");
    }
    catch (e: unknown) {
      const err = e as { code?: string; message?: string };
      if (
        err?.code === "auth/popup-closed-by-user" ||
        err?.code === "auth/cancelled-popup-request"
      ) {
        return;
      }
      setError(err?.message ?? (e instanceof Error ? e.message : "Sign in failed"));
    }
    finally{
      setLoading(false);
    }
  };

  const handleEmail = async (e:React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try{
      const user = await signInWithEmailPassword(email,password);
      if (isExtension) {
        const idToken = await user.getIdToken();
        const refreshToken = (user as { refreshToken?: string }).refreshToken ?? "";
        window.postMessage(
          { type: "ECHLY_PAGE_LOGIN_SUCCESS", idToken, refreshToken },
          "*"
        );
        window.location.href = "/dashboard";
        return;
      }
      const dest = await checkUserWorkspace(user.uid);
      router.replace(dest === "dashboard" ? "/dashboard" : "/onboarding");
    }
    catch(e){
      setError(e instanceof Error ? e.message : "Sign in failed");
    }
    finally{
      setLoading(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#f9fafc] flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading…</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#f9fafc] overflow-hidden">
      {/* ... gradient background and header ... */}
      <main className="flex flex-col items-center text-center pt-[16vh] px-6">
        <div className="max-w-[980px] w-full">
          <h1 className="...">Capture Feedback Exactly Where It Happens</h1>
          <p className="...">Turn screenshots into actionable tickets for your team in seconds.</p>
          <div className="max-w-[420px] mx-auto mt-10">
            <AuthCard>
              <h2 className="...">Sign in to Echly</h2>
              <button type="button" onClick={handleGoogle} disabled={loading} className="...">
                <GoogleIcon/> Continue with Google
              </button>
              <div className="relative my-6"> ... OR ... </div>
              <form onSubmit={handleEmail} className="space-y-4">
                <input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} className={inputClass} required />
                <input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} className={inputClass} required />
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button type="submit" disabled={loading} className={primaryButtonClass} style={primaryButtonStyle}>
                  Sign in
                </button>
              </form>
              <p className="mt-6 text-center text-gray-500 text-sm">
                Don't have an account? <Link href="/signup" className="text-[#466EFF] hover:underline font-medium">Sign up</Link>
              </p>
            </AuthCard>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={...}>
      <LoginContent />
    </Suspense>
  );
}

function GoogleIcon(){ ... }
```

**What it does:** Reads `extension` and `returnUrl` from query. Subscribes to **onAuthStateChanged(auth, ...)**. When `user` exists: if `isExtension`, gets **idToken** and **refreshToken**, posts **ECHLY_PAGE_LOGIN_SUCCESS** to window, then redirects to `/dashboard`. Otherwise redirects to dashboard (or onboarding via checkUserWorkspace). **handleGoogle** and **handleEmail** call Firebase sign-in then the same extension vs non-extension branching. So: **Login page → Firebase login → ID token retrieval → postMessage to extension (if extension=true) → redirect to dashboard.**

---

## 2.2 lib/auth/authActions.ts

**Full file contents:**

```typescript
import type { User } from "firebase/auth";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export { auth };

export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signInWithEmailPassword(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signUpWithEmailPassword(email: string, password: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
}
```

**What it does:** Wraps Firebase sign-in (Google popup, email/password, sign-up). Login page uses these; after success the page gets `user.getIdToken()` and `user.refreshToken` and, when `extension=true`, sends them via postMessage for the extension.

---

## 2.3 lib/firebase/config.ts

**Full file contents:**

```typescript
/**
 * Single Firebase config used by web app and extension.
 * Do not move to env in this file; centralization only.
 */
export const firebaseConfig = {
  apiKey: "AIzaSyBgQxRYAksD35D6m1OEPjSnfiOLxUABqnM",
  authDomain: "echly-b74cc.firebaseapp.com",
  projectId: "echly-b74cc",
  storageBucket: "echly-b74cc.firebasestorage.app",
  messagingSenderId: "609478020649",
  appId: "1:609478020649:web:54cd1ab0dc2b8277131638",
  measurementId: "G-Q0C7DP8QVR",
};
```

**What it does:** Single Firebase project config for web app (and any extension code that uses Firebase Auth). Backend verifies ID tokens for project `echly-b74cc`.

---

## 2.4 lib/authFetch.ts

**Full file contents:**

```typescript
import { auth } from "@/lib/firebase";

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

async function getCachedIdToken(user: { getIdToken(): Promise<string>; getIdTokenResult(): Promise<{ expirationTime?: string }> }): Promise<string> {
  const now = Date.now();
  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    return cachedToken;
  }
  const token = await user.getIdToken();
  const result = await user.getIdTokenResult();
  cachedToken = token;
  tokenExpiry = result.expirationTime
    ? new Date(result.expirationTime).getTime() - 60000
    : now + 60000;
  return token;
}

export function clearAuthTokenCache(): void {
  cachedToken = null;
  tokenExpiry = null;
}

function resolveInput(input: RequestInfo | URL): RequestInfo | URL {
  const base =
    typeof window !== "undefined" &&
    (window as unknown as { __ECHLY_API_BASE__?: string }).__ECHLY_API_BASE__;
  if (!base) return input;
  const path = ...;
  return path.startsWith("http") ? input : base + path;
}

const DEFAULT_TIMEOUT_MS = 25000;

export type AuthFetchInit = RequestInit & { timeout?: number };

export async function authFetch(
  input: RequestInfo | URL,
  init: AuthFetchInit = {}
): Promise<Response> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }
  const token = await getCachedIdToken(user);
  const headers = new Headers(init.headers || {});
  headers.set("Authorization", `Bearer ${token}`);
  // ... timeout and signal handling ...
  const res = await fetch(resolveInput(input), { ...restInit, headers, signal: ... });
  // ... 403 WORKSPACE_SUSPENDED handling ...
  return res;
}
```

**What it does:** Used by the **dashboard** (web app) for authenticated API calls. Uses Firebase `auth.currentUser` and in-memory token cache; clears cache via `clearAuthTokenCache()` (e.g. when useAuthGuard sees null user). Extension content script does not use this; it uses contentAuthFetch → background.

---

## 2.5 Login flow summary

1. **Login page** loads; reads `extension` and `returnUrl` from query.
2. **Google login:** User clicks “Continue with Google” → **signInWithGoogle()** (Firebase popup) → get **user**.
3. **Email/password login:** Form submit → **signInWithEmailPassword()** → get **user**.
4. **Token retrieval:** `user.getIdToken()`, `(user as any).refreshToken`.
5. **Message to extension:** If `extension=true`, `window.postMessage({ type: "ECHLY_PAGE_LOGIN_SUCCESS", idToken, refreshToken }, "*")`. Content script (on dashboard origin) forwards to background as **ECHLY_EXTENSION_AUTH_SUCCESS**.
6. **Extension:** Background stores tokens, calls **validateSessionAndOpenTray()** (GET /api/auth/session), then opens tray, switches to origin tab, closes login tab if on /login.
7. **Dashboard redirect:** Login page does `window.location.href = "/dashboard"` (or router replace for non-extension).

---

# PART 3 — DASHBOARD AUTH SYSTEM

## 3.1 lib/hooks/useAuthGuard.ts

**Full file contents:**

```typescript
"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { clearAuthTokenCache } from "@/lib/authFetch";
import { ensureUserWorkspaceLinkRepo } from "@/lib/repositories/usersRepository";

type UseAuthGuardOptions = {
  router?: { push: (url: string) => void; replace: (url: string) => void };
  useReplace?: boolean;
};

export function useAuthGuard(options: UseAuthGuardOptions = {}): {
  user: User | null;
  loading: boolean;
} {
  const { router, useReplace = false } = options;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser ?? null);
      setLoading(false);
      if (currentUser) {
        ensureUserWorkspaceLinkRepo(currentUser).catch((err) => {
          console.error("Failed to ensure user workspace link:", err);
        });
      }
      if (currentUser == null && router) {
        clearAuthTokenCache();
        if (useReplace) {
          router.replace("/login");
        } else {
          router.push("/login");
        }
      }
    });
    return () => unsubscribe();
  }, [router, useReplace]);

  return { user, loading };
}
```

**What it does:** Subscribes to **Firebase onAuthStateChanged(auth, ...)**. Returns `user` and `loading`. When `currentUser == null` and `router` is provided, clears dashboard token cache and redirects to `/login` (replace or push). So the dashboard “logged in” state is purely Firebase Auth on that origin; no extension tokens involved.

---

## 3.2 app/(app)/layout.tsx

**Full file contents:**

```typescript
import GlobalRail from "@/components/layout/GlobalRail";
import { FloatingUtilityActions } from "@/components/layout/FloatingUtilityActions";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { WorkspaceSuspendedGuard } from "@/components/workspace/WorkspaceSuspendedGuard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceSuspendedGuard>
      <div className="flex flex-1 min-h-0 overflow-hidden relative z-10">
        <GlobalRail />
        <main className="relative flex flex-1 min-h-screen overflow-auto bg-white">
          <FloatingUtilityActions />
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
        ...
      </div>
    </WorkspaceSuspendedGuard>
  );
}
```

**What it does:** App shell for dashboard. **GlobalRail** (and other children) use **useAuthGuard({ router })**; the layout itself does not call useAuthGuard. So redirect to login happens when any of those components see null user.

---

## 3.3 app/(app)/dashboard/page.tsx

**Relevant auth:** Dashboard page does not call useAuthGuard directly; it relies on GlobalRail (and possibly other parents) for auth. It uses Firestore and workspace hooks that assume an authenticated user (from the same origin). Sessions are loaded in dashboard via Firestore/API once the user is considered logged in by useAuthGuard elsewhere (e.g. GlobalRail).

---

## 3.4 app/(app)/dashboard/[sessionId]/page.tsx

**Full file contents:**

```typescript
import SessionPageClient from "./SessionPageClient";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return <SessionPageClient sessionId={sessionId} />;
}
```

**SessionPageClient** (in same folder) uses **useAuthGuard({ router })**. If user is null, it redirects to `/login`. Session data is loaded client-side (authFetch, Firestore, etc.) after auth is confirmed.

---

## 3.5 How the dashboard determines if the user is logged in

- **Firebase onAuthStateChanged:** `useAuthGuard` subscribes to `onAuthStateChanged(auth, (currentUser) => ...)`. So “logged in” = `currentUser != null` on that tab’s origin.
- **Redirect logic:** When `currentUser == null` and a router is passed, `useAuthGuard` calls `clearAuthTokenCache()` and then `router.replace("/login")` or `router.push("/login")`.
- **Where it’s used:** GlobalRail, FloatingUtilityActions, SessionPageClient, dashboard insights, discussion, settings, admin layout, etc. So any visit to an (app) route eventually hits a component that uses useAuthGuard; if not logged in on that origin, user is sent to /login.
- **How dashboard loads sessions:** After auth is established (user non-null), pages use Firestore and/or authFetch to load sessions; no extension session cache involved.

---

# PART 4 — BACKEND AUTH

## 4.1 lib/server/auth.ts

**Full file contents:**

```typescript
import { jwtVerify, createRemoteJWKSet } from "jose";

const PROJECT_ID = "echly-b74cc";

const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
);

export interface DecodedIdToken {
  uid: string;
  [key: string]: unknown;
}

export async function verifyIdToken(token: string): Promise<DecodedIdToken> {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `https://securetoken.google.com/${PROJECT_ID}`,
    audience: PROJECT_ID,
  });
  return {
    uid: (payload.sub ?? payload.user_id) as string,
    ...payload,
  };
}

export async function requireAuth(request: Request): Promise<DecodedIdToken> {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Response(
      JSON.stringify({ error: "Unauthorized - Missing token" }),
      { status: 401 }
    );
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    return await verifyIdToken(token);
  } catch (error) {
    console.error("Token verification failed:", error);
    throw new Response(
      JSON.stringify({ error: "Unauthorized - Invalid token" }),
      { status: 401 }
    );
  }
}
```

**What it does:**  
- **JWKS verification:** Uses `jose` and Firebase’s public JWKS URL for `securetoken@system.gserviceaccount.com` to verify the JWT (issuer and audience for project `echly-b74cc`).  
- **requireAuth(request):** Reads `Authorization` header, expects `Bearer <token>`, verifies with `verifyIdToken`, returns decoded payload with `uid`; otherwise throws 401 Response.

---

## 4.2 app/api/auth/session/route.ts

**Full file contents:**

```typescript
import { requireAuth } from "@/lib/server/auth";

/**
 * GET /api/auth/session
 * Backend session validation: single source of truth for dashboard and extension.
 * Validates Firebase ID token via existing requireAuth(); returns authenticated user info.
 */
export async function GET(req: Request) {
  try {
    const user = await requireAuth(req);
    return Response.json({
      authenticated: true,
      user: {
        uid: user.uid,
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ authenticated: false }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
}
```

**What it does:** GET /api/auth/session is the single backend check for “is this token valid?”. It uses **requireAuth(req)** (Authorization Bearer + JWKS verification). On success returns `{ authenticated: true, user: { uid } }`; on failure returns 401 with `{ authenticated: false }`. Extension and dashboard both rely on this for session validation; the API does not return name/email/photoURL (only uid).

---

# PART 5 — TOKEN STORAGE

## 5.1 Where echlyIdToken, echlyRefreshToken, echlyTokenTime appear

- **echly-extension/src/background.ts**
  - **Defined as keys:** `ECHLY_TOKEN_KEYS = ["echlyIdToken", "echlyRefreshToken", "echlyTokenTime"]`.
  - **Read:** `getStoredTokens()` uses `chrome.storage.local.get(["echlyIdToken", "echlyRefreshToken", "echlyTokenTime"])`.
  - **Written (login success):** In the `ECHLY_EXTENSION_AUTH_SUCCESS` handler: `chrome.storage.local.set({ echlyIdToken, echlyRefreshToken, echlyTokenTime: Date.now() })`.
  - **Written (refresh):** In `refreshIdToken()`: `chrome.storage.local.set({ echlyIdToken: newIdToken, echlyRefreshToken: newRefreshToken, echlyTokenTime: Date.now() })`.
  - **Cleared:** `clearAuthState()` calls `chrome.storage.local.remove([...ECHLY_TOKEN_KEYS, ...AUTH_STORAGE_KEYS_LEGACY])`.

No other repo files write or read these three keys; docs only reference them.

## 5.2 Summary

- **Written:**  
  - On login handoff: when background receives `ECHLY_EXTENSION_AUTH_SUCCESS` with idToken and refreshToken.  
  - On refresh: when `refreshIdToken()` gets new tokens from Firebase securetoken.
- **Refreshed:** In `getValidToken()` when `(Date.now() - tokenTime) > TOKEN_MAX_AGE_MS` (50 min); then `refreshIdToken()` updates all three in storage.
- **Cleared:** In `clearAuthState()` (on 401/403 from session or other API, or explicit logout path). Also when clearing “legacy” keys; session cache and tray are cleared at the same time.

---

# PART 6 — SESSION CACHE

## 6.1 Code implementing sessionCache and SESSION_CACHE_TTL_MS

**In echly-extension/src/background.ts:**

- **Constant:** `const SESSION_CACHE_TTL_MS = 5 * 60 * 1000;` (5 minutes).
- **Object:** `let sessionCache: { authenticated: boolean; checkedAt: number } = { authenticated: false, checkedAt: 0 };`
- **Set to true:** In `validateSessionAndOpenTray()` after successful GET /api/auth/session: `sessionCache = { authenticated: true, checkedAt: Date.now() };`. Also in the icon-click handler after `checkBackendSession()`: `sessionCache = { authenticated: session.authenticated, checkedAt: Date.now() };`. In `prewarmSessionFromStorage()` when session GET is ok: `sessionCache = { authenticated: data.authenticated === true, checkedAt: Date.now() };`
- **Set to false / cleared:** `clearSessionCache()` sets `sessionCache = { authenticated: false, checkedAt: 0 }` and `globalUIState.user = null`. `clearAuthState()` calls `clearSessionCache()`. `prewarmSessionFromStorage()` sets `sessionCache = { authenticated: false, checkedAt: Date.now() }` when the session request is not ok or throws.
- **Read:** In `chrome.action.onClicked`: if `sessionCache.authenticated === true && Date.now() - sessionCache.checkedAt < SESSION_CACHE_TTL_MS`, open tray immediately and return without calling `checkBackendSession()`.

## 6.2 When cache is set, cleared, and how it affects extension click

- **Set:** After a successful `/api/auth/session` (validateSessionAndOpenTray, icon-click path, prewarm).  
- **Cleared:** On any `clearAuthState()` (e.g. 401/403) or when prewarm fails.  
- **Effect:** Within 5 minutes of a successful validation, the next icon click skips token and backend and opens the tray immediately. After TTL or after clear, the next click runs full getValidToken + checkBackendSession again.

---

# PART 7 — LOGIN TAB HANDLING

## 7.1 openOrFocusLoginTab() — full code

**In echly-extension/src/background.ts:**

```typescript
function openOrFocusLoginTab(loginUrl: string): Promise<number> {
  return new Promise((resolve) => {
    chrome.tabs.query({}, (tabs) => {
      const existing = tabs.find(
        (t) =>
          t.id != null &&
          typeof t.url === "string" &&
          t.url.includes("/login")
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
```

## 7.2 When login tabs are created vs reused

- **Reuse:** If there is already a tab whose `url` includes `"/login"`, that tab is focused and its id is stored in `loginTabId`; no new tab.
- **Create:** If no such tab exists, `chrome.tabs.create({ url: loginUrl })` is called and the new tab’s id is stored in `loginTabId`.
- Dashboard tabs are not considered; only URLs containing `/login` are reused. So unauthenticated users always end up on the login page (reused or new).

## 7.3 Effect on UX

- Fewer duplicate login tabs when the user already has a login tab open.  
- After successful login, the background may close the login tab if it’s still on /login (in `validateSessionAndOpenTray()`), and switches focus back to `originTabId`.

---

# PART 8 — SESSION END FLOW

## 8.1 ECHLY_SESSION_MODE_END (background)

**In echly-extension/src/background.ts:**

```typescript
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
```

So: background clears session state and idle timer, persists to storage, broadcasts state, and sends **ECHLY_RESET_WIDGET** to all tabs. It does **not** call `clearAuthState()`.

## 8.2 ECHLY_OPEN_TAB (background)

**In echly-extension/src/background.ts:**

```typescript
if (request.type === "ECHLY_OPEN_TAB") {
  const url = (request as { url?: string }).url;
  if (url) {
    chrome.tabs.create({ url });
  }
  sendResponse({ success: true });
  return true;
}
```

So: opens one new tab with the given `url`.

## 8.3 Content: End session and dashboard URL

**In echly-extension/src/content.tsx (onSessionModeEnd):**

```typescript
onSessionModeEnd={() => {
  const sessionId = globalState.sessionId;
  (async () => {
    await new Promise<void>((resolve, reject) => {
      chrome.runtime.sendMessage({ type: "ECHLY_SESSION_MODE_END" }, (response) => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        else resolve();
      });
    });
    await new Promise((r) => setTimeout(r, 50));
    if (sessionId) {
      const url = `${APP_ORIGIN}/dashboard/${sessionId}`;
      chrome.runtime.sendMessage({ type: "ECHLY_OPEN_TAB", url }).catch(() => {});
    }
  })().catch(() => {});
}}
```

So: content sends **ECHLY_SESSION_MODE_END** to background, waits for response and 50 ms, then if there was a `sessionId` builds **dashboard URL** as `${APP_ORIGIN}/dashboard/${sessionId}` and sends **ECHLY_OPEN_TAB** with that URL. Background then opens a new tab to that URL.

## 8.4 Full flow

1. User clicks **End** in the tray.  
2. Content sends **ECHLY_SESSION_MODE_END** to background.  
3. Background clears session state, clears idle timer, persists, broadcasts, and sends **ECHLY_RESET_WIDGET** to all tabs; responds to the message.  
4. Content, after a short delay, sends **ECHLY_OPEN_TAB** with `url = `${APP_ORIGIN}/dashboard/${sessionId}``.  
5. Background runs `chrome.tabs.create({ url })` → **dashboard tab opens** at e.g. `https://echly-web.vercel.app/dashboard/<sessionId>` or `http://localhost:3000/dashboard/<sessionId>` depending on APP_ORIGIN.

---

# PART 9 — CONFIGURATION CONSTANTS

## 9.1 APP_ORIGIN

- **echly-extension/src/content.tsx:**  
  `const APP_ORIGIN = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://echly-web.vercel.app";`  
  Used to build the post–End session dashboard URL: `${APP_ORIGIN}/dashboard/${sessionId}`.  
- **Used by:** Extension content script only (for opening dashboard after End).

## 9.2 API_BASE

- **echly-extension/src/background.ts:**  
  `const API_BASE = typeof process !== "undefined" && process.env?.NODE_ENV === "development" ? "http://localhost:3000" : "https://echly-web.vercel.app";`  
  Used for all background fetches (session, feedback, sessions, upload, structure-feedback, etc.).  
- **echly-extension/src/contentAuthFetch.ts:**  
  Same logic (NODE_ENV), used to resolve relative paths when content sends `echly-api` to background.  
- **echly-extension/src/api.ts:**  
  `const API_BASE = "http://localhost:3000";` (hardcoded; used by Firebase-based apiFetch in extension, e.g. popup).  
- **Used by:** Extension background (main auth and API), extension content (via contentAuthFetch), and extension api.ts (Firebase path).

## 9.3 ECHLY_LOGIN_BASE

- **echly-extension/src/background.ts:**  
  `const ECHLY_LOGIN_BASE = "https://echly-web.vercel.app/login";`  
  Used to build login URL: `ECHLY_LOGIN_BASE + "?extension=true" + (returnUrl ? "&returnUrl=" + encodeURIComponent(returnUrl) : "")`.  
- **Used by:** Extension background only (icon click when not authenticated, ECHLY_OPEN_POPUP, ECHLY_SIGN_IN / ECHLY_START_LOGIN / LOGIN).

## 9.4 Summary

| Constant          | Where defined                          | Used by                          |
|------------------|----------------------------------------|----------------------------------|
| APP_ORIGIN       | content.tsx (env-based)                | Extension content (dashboard URL after End) |
| API_BASE         | background.ts, contentAuthFetch.ts (env-based); api.ts (hardcoded localhost) | Extension background, content script, api.ts |
| ECHLY_LOGIN_BASE | background.ts (production login URL)   | Extension background (open login tab) |

---

# PART 10 — FULL AUTH FLOW DIAGRAM

## 10.1 Extension click → token → session → tray

```
Extension icon click
        │
        ▼
  authCheckInProgress? ──yes──► return (ignore)
        │ no
        ▼
  originTabId = tab.id
        │
        ▼
  sessionCache.authenticated && (now - checkedAt) < 5 min? ──yes──► set tray visible/expanded, persist, broadcast ► DONE (tray open)
        │ no
        ▼
  authCheckInProgress = true
        │
        ▼
  getValidToken()
    ├─ getStoredTokens() from chrome.storage.local
    ├─ if (now - tokenTime) > 50 min ► refreshIdToken() (Firebase securetoken) ► update storage
    └─ return idToken (or throw NOT_AUTHENTICATED)
        │
        ▼
  checkBackendSession()
    └─ GET /api/auth/session  Authorization: Bearer <token>
        ├─ 401/403 ► clearAuthState() ► return { authenticated: false }
        └─ ok ► return { authenticated: true, user }
        │
        ▼
  sessionCache = { authenticated, checkedAt: now }
        │
        ├─ authenticated? ──yes──► set user, tray visible/expanded, persist, broadcast ► DONE (tray open)
        │
        └─ no ► build loginUrl = ECHLY_LOGIN_BASE?extension=true&returnUrl=... ► openOrFocusLoginTab(loginUrl) ► DONE (login tab open)
```

## 10.2 Login flow: page → Firebase → token → extension → tray

```
Login page (extension=true)
        │
        ▼
  Firebase login (Google or email/password)
        │
        ▼
  user = result.user
  idToken = user.getIdToken()
  refreshToken = user.refreshToken
        │
        ▼
  window.postMessage({ type: "ECHLY_PAGE_LOGIN_SUCCESS", idToken, refreshToken }, "*")
        │
        ▼
  Content script (ensureLoginCompleteForwarder, dashboard origin only)
        │
        ▼
  chrome.runtime.sendMessage({ type: "ECHLY_EXTENSION_AUTH_SUCCESS", idToken, refreshToken })
        │
        ▼
  Background: chrome.storage.local.set({ echlyIdToken, echlyRefreshToken, echlyTokenTime: Date.now() })
        │
        ▼
  validateSessionAndOpenTray()
    └─ getValidToken() ► GET /api/auth/session
        ├─ !ok / 401/403 ► clearAuthState() ► success: false
        └─ ok ► sessionCache = { authenticated: true }, set user, tray visible/expanded, persist, broadcast
                 ► chrome.tabs.update(originTabId, { active: true })
                 ► if login tab still on /login ► chrome.tabs.remove(loginTabId)
                 ► success: true
        │
        ▼
  Login page: window.location.href = "/dashboard"
```

---

*End of document. No code was modified; this is an extraction for architecture review.*
