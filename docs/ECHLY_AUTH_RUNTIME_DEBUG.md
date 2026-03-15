# Echly — Full Authentication Debugging Extraction

**Purpose:** Export all authentication-related code and runtime traces for external architecture analysis.  
**Generated:** Diagnostic report only. No code was modified.

---

## PART 1 — Extension Auth Core (full file contents)

### 1.1 `echly-extension/src/background.ts`

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
  console.log("[ECHLY CLICK] icon clicked");
  console.log("[ECHLY CLICK] session cache", sessionCache);
  if (authCheckInProgress) return;
  originTabId = tab?.id ?? null;

  if (sessionCache.authenticated === true && Date.now() - sessionCache.checkedAt < SESSION_CACHE_TTL_MS) {
    // Open tray instantly
    if (globalUIState.visible === true) {
      globalUIState.visible = false;
      globalUIState.expanded = false;
    } else {
      globalUIState.visible = true;
      globalUIState.expanded = true;
    }

    persistUIState();
    broadcastUIState();

    // Background session validation (Loom style)
    checkBackendSession()
      .then((session) => {
        sessionCache = { authenticated: session.authenticated, checkedAt: Date.now() };

        if (!session.authenticated) {
          clearAuthState();

          // Close tray
          globalUIState.visible = false;
          globalUIState.expanded = false;

          persistUIState();
          broadcastUIState();

          // Open login page
          const loginUrl = ECHLY_LOGIN_BASE + "?extension=true";
          openOrFocusLoginTab(loginUrl);
        }
      })
      .catch(() => {
        console.warn("[ECHLY AUTH] background validation failed");
      });

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
        if (globalUIState.visible === true) {
          globalUIState.visible = false;
          globalUIState.expanded = false;
        } else {
          globalUIState.visible = true;
          globalUIState.expanded = true;
        }
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

/** Single message listener: auth success from login page + all other extension messages. */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  /* Login page sends tokens via content script (postMessage bridge). Store them, validate session, open tray, switch to origin tab. */
  if (request?.type === "ECHLY_EXTENSION_AUTH_SUCCESS") {
    const idToken = (request as { idToken?: string }).idToken;
    const refreshToken = (request as { refreshToken?: string }).refreshToken;
    if (typeof idToken !== "string" || idToken.length === 0 || typeof refreshToken !== "string" || refreshToken.length === 0) {
      sendResponse?.({ success: false, error: "Missing tokens" });
      return true;
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
  }
  // ... rest of message handlers (ECHLY_TOGGLE_VISIBILITY, ECHLY_GET_AUTH_STATE, ECHLY_OPEN_POPUP, ECHLY_SIGN_IN/LOGIN, etc.)
});
// [Full file continues — see repo for complete message handler block.]
```

*(Full file is 759 lines; key auth blocks are above. Remaining handlers: ECHLY_TOGGLE_VISIBILITY, ECHLY_EXPAND_WIDGET, ECHLY_COLLAPSE_WIDGET, ECHLY_GET_GLOBAL_STATE, ECHLY_FEEDBACK_CREATED, ECHLY_SET_CAPTURE_MODE, ECHLY_SESSION_UPDATED, ECHLY_TICKET_UPDATED, ECHLY_SET_ACTIVE_SESSION, ECHLY_OPEN_TAB, ECHLY_SESSION_MODE_*, ECHLY_GET_TOKEN, ECHLY_GET_AUTH_STATE, ECHLY_OPEN_POPUP, ECHLY_SIGN_IN/LOGIN, START_RECORDING, STOP_RECORDING, CAPTURE_TAB, ECHLY_UPLOAD_SCREENSHOT, ECHLY_PROCESS_FEEDBACK, echly-api.)*

---

### 1.2 `echly-extension/src/content.tsx`

Full file: **962 lines**. Key auth-related excerpts:

- **Token bridge / login forwarder:** Listens for `ECHLY_PAGE_LOGIN_SUCCESS` from the page, forwards to background as `ECHLY_EXTENSION_AUTH_SUCCESS` with `idToken` and `refreshToken`.
- **Opening login:** `requestOpenLoginPage()` sends `ECHLY_OPEN_POPUP` to background.
- **Auth state:** Content does **not** call `ECHLY_GET_AUTH_STATE`; it derives auth from `ECHLY_GLOBAL_STATE` (background is sole authority).

Full content of `content.tsx` is in the repo at `echly-extension/src/content.tsx` (962 lines).

---

### 1.3 `echly-extension/src/contentAuthFetch.ts`

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

---

### 1.4 `echly-extension/src/requestTokenFromPage.ts`

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

---

### 1.5 `echly-extension/src/pageTokenBridge.js`

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

---

### 1.6 `echly-extension/src/secureBridgeChannel.ts`

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

---

## PART 2 — Extension Click Logic (extracted from `background.ts`)

### 2.1 `chrome.action.onClicked`

```typescript
/** Extension icon click: store origin tab; use session cache (30s) for instant tray, else validate then open tray or login. Never opens or focuses dashboard. */
chrome.action.onClicked.addListener((tab) => {
  console.log("[ECHLY CLICK] icon clicked");
  console.log("[ECHLY CLICK] session cache", sessionCache);
  if (authCheckInProgress) return;
  originTabId = tab?.id ?? null;

  if (sessionCache.authenticated === true && Date.now() - sessionCache.checkedAt < SESSION_CACHE_TTL_MS) {
    // Open tray instantly
    if (globalUIState.visible === true) {
      globalUIState.visible = false;
      globalUIState.expanded = false;
    } else {
      globalUIState.visible = true;
      globalUIState.expanded = true;
    }

    persistUIState();
    broadcastUIState();

    // Background session validation (Loom style)
    checkBackendSession()
      .then((session) => {
        sessionCache = { authenticated: session.authenticated, checkedAt: Date.now() };

        if (!session.authenticated) {
          clearAuthState();
          globalUIState.visible = false;
          globalUIState.expanded = false;
          persistUIState();
          broadcastUIState();
          const loginUrl = ECHLY_LOGIN_BASE + "?extension=true";
          openOrFocusLoginTab(loginUrl);
        }
      })
      .catch(() => {
        console.warn("[ECHLY AUTH] background validation failed");
      });

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
        if (globalUIState.visible === true) {
          globalUIState.visible = false;
          globalUIState.expanded = false;
        } else {
          globalUIState.visible = true;
          globalUIState.expanded = true;
        }
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
```

### 2.2 `checkBackendSession()`

```typescript
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
```

### 2.3 `getValidToken()`

```typescript
async function getValidToken(): Promise<string> {
  const stored = await getStoredTokens();
  if (!stored) throw new Error("NOT_AUTHENTICATED");

  const age = Date.now() - stored.tokenTime;
  if (age > TOKEN_MAX_AGE_MS) {
    return refreshIdToken();
  }
  return stored.idToken;
}
```

### 2.4 `refreshIdToken()`

```typescript
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
```

### 2.5 `validateSessionAndOpenTray()`

```typescript
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
```

### 2.6 `clearAuthState()`

```typescript
function clearAuthState(): void {
  clearSessionCache();
  globalUIState.visible = false;
  globalUIState.expanded = false;
  chrome.storage.local.remove([...ECHLY_TOKEN_KEYS, ...AUTH_STORAGE_KEYS_LEGACY]);
  persistUIState();
  broadcastUIState();
}
```

### 2.7 `openOrFocusLoginTab()`

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

---

## PART 3 — Extension Auth Messages

Search in extension folder for: `ECHLY_EXTENSION_AUTH_SUCCESS`, `ECHLY_PAGE_LOGIN_SUCCESS`, `ECHLY_GET_AUTH_STATE`, `ECHLY_OPEN_POPUP`, `LOGIN`, `ECHLY_SIGN_IN`.

### Handlers (background)

| Message | Handler location | Behavior |
|--------|-------------------|----------|
| **ECHLY_EXTENSION_AUTH_SUCCESS** | `background.ts` ~624 | Expects `idToken`, `refreshToken`. Writes to `chrome.storage.local` (echlyIdToken, echlyRefreshToken, echlyTokenTime), then calls `validateSessionAndOpenTray()`. Responds `{ success: true/false }`. |
| **ECHLY_GET_AUTH_STATE** | `background.ts` ~888 | Calls `checkBackendSession()`, sends `{ authenticated, user }`. |
| **ECHLY_OPEN_POPUP** | `background.ts` ~899 | Builds login URL with optional `returnUrl` from sender tab, calls `openOrFocusLoginTab(loginUrl)`, responds `{ ok: true }`. |
| **ECHLY_SIGN_IN** / **ECHLY_START_LOGIN** / **LOGIN** | `background.ts` ~909 | Same as ECHLY_OPEN_POPUP: opens login tab; responds `{ success: false, error: "Use dashboard login" }`. |

### Callers

| Message | Caller |
|--------|--------|
| **ECHLY_EXTENSION_AUTH_SUCCESS** | `content.tsx`: in `ensureLoginCompleteForwarder()` — on `window` message `ECHLY_PAGE_LOGIN_SUCCESS` from dashboard origin, sends to background with `idToken`, `refreshToken`. |
| **ECHLY_PAGE_LOGIN_SUCCESS** | Login page `app/(auth)/login/page.tsx`: after Firebase auth, `window.postMessage({ type: "ECHLY_PAGE_LOGIN_SUCCESS", idToken, refreshToken }, window.location.origin)`. |
| **ECHLY_GET_AUTH_STATE** | No direct caller in extension src; content explicitly does *not* use it (comment: "auth comes from state only (no ECHLY_GET_AUTH_STATE)"). |
| **ECHLY_OPEN_POPUP** | `content.tsx` `requestOpenLoginPage()`: `chrome.runtime.sendMessage({ type: "ECHLY_OPEN_POPUP" })`. |

### Code snippets

**Background — ECHLY_EXTENSION_AUTH_SUCCESS handler:**
```typescript
if (request?.type === "ECHLY_EXTENSION_AUTH_SUCCESS") {
  const idToken = (request as { idToken?: string }).idToken;
  const refreshToken = (request as { refreshToken?: string }).refreshToken;
  if (typeof idToken !== "string" || idToken.length === 0 || typeof refreshToken !== "string" || refreshToken.length === 0) {
    sendResponse?.({ success: false, error: "Missing tokens" });
    return true;
  }
  (async () => {
    try {
      await new Promise<void>((resolve) => {
        chrome.storage.local.set(
          { echlyIdToken: idToken, echlyRefreshToken: refreshToken, echlyTokenTime: Date.now() },
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
}
```

**Background — ECHLY_GET_AUTH_STATE handler:**
```typescript
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
```

**Background — ECHLY_OPEN_POPUP handler:**
```typescript
if (request.type === "ECHLY_OPEN_POPUP") {
  const returnUrl = typeof sender.tab?.url === "string" ? encodeURIComponent(sender.tab.url) : "";
  const loginUrl = returnUrl
    ? `${ECHLY_LOGIN_BASE}?extension=true&returnUrl=${returnUrl}`
    : `${ECHLY_LOGIN_BASE}?extension=true`;
  openOrFocusLoginTab(loginUrl).then(() => sendResponse({ ok: true }));
  return true;
}
```

**Background — ECHLY_SIGN_IN / LOGIN handler:**
```typescript
if (request.type === "ECHLY_SIGN_IN" || request.type === "ECHLY_START_LOGIN" || request.type === "LOGIN") {
  const returnUrl = typeof sender.tab?.url === "string" ? encodeURIComponent(sender.tab.url) : "";
  const loginUrl = returnUrl
    ? `${ECHLY_LOGIN_BASE}?extension=true&returnUrl=${returnUrl}`
    : `${ECHLY_LOGIN_BASE}?extension=true`;
  openOrFocusLoginTab(loginUrl).then(() => sendResponse({ success: false, error: "Use dashboard login" }));
  return true;
}
```

**Content — ECHLY_PAGE_LOGIN_SUCCESS → ECHLY_EXTENSION_AUTH_SUCCESS:**
```typescript
window.addEventListener("message", (event: MessageEvent) => {
  if (event.data.type === "ECHLY_PAGE_LOGIN_SUCCESS") {
    if (!DASHBOARD_ORIGINS.includes(event.origin)) return;
    chrome.runtime.sendMessage({
      type: "ECHLY_EXTENSION_AUTH_SUCCESS",
      idToken: event.data.idToken,
      refreshToken: event.data.refreshToken,
    }).catch(() => {});
    return;
  }
  // ...
});
```

**Content — ECHLY_OPEN_POPUP caller:**
```typescript
function requestOpenLoginPage(): void {
  chrome.runtime.sendMessage({ type: "ECHLY_OPEN_POPUP" }).catch(() => {});
}
```

---

## PART 4 — Dashboard Login System

### 4.1 `app/(auth)/login/page.tsx`

- Uses `onAuthStateChanged(auth, ...)`. When `user` is set and `isExtension`:
  - Gets `idToken` and `refreshToken`, posts `ECHLY_PAGE_LOGIN_SUCCESS` to `window.location.origin`, then redirects to `/dashboard`.
- `handleGoogle` / `handleEmail`: after sign-in, if `isExtension` same flow (postMessage then redirect); else `checkUserWorkspace` and router replace to dashboard or onboarding.

Full file in repo: `app/(auth)/login/page.tsx` (297 lines).

### 4.2 `lib/auth/authActions.ts`

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

### 4.3 `lib/firebase/config.ts`

```typescript
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

### 4.4 `lib/firebase.ts` (auth entry used by login)

```typescript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { firebaseConfig } from "./firebase/config";

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

if (typeof window !== "undefined") {
  (window as unknown as { firebase?: { auth: () => ReturnType<typeof getAuth> } }).firebase = {
    auth: () => auth,
  };
}
export const db = getFirestore(app);
export const storage = getStorage(app);
```

### 4.5 `lib/authFetch.ts`

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
  const path =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.pathname + input.search
        : input instanceof Request
          ? input.url
          : String(input);
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
  const timeoutMs = init.timeout !== undefined ? init.timeout : DEFAULT_TIMEOUT_MS;
  const { timeout: _t, ...restInit } = init;
  let signal = restInit.signal;
  let controller: AbortController | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  if (timeoutMs > 0) {
    controller = new AbortController();
    timeoutId = setTimeout(() => {
      console.warn("[authFetch] Request exceeded timeout threshold:", timeoutMs, "ms");
      controller!.abort();
    }, timeoutMs);
    signal = restInit.signal
      ? (() => {
          const combined = new AbortController();
          restInit.signal?.addEventListener("abort", () => {
            clearTimeout(timeoutId!);
            combined.abort();
          });
          controller!.signal.addEventListener("abort", () => combined.abort());
          return combined.signal;
        })()
      : controller.signal;
  }

  try {
    const res = await fetch(resolveInput(input), {
      ...restInit,
      headers,
      signal: signal ?? restInit.signal,
    });
    if (timeoutId) clearTimeout(timeoutId);
    if (res.status === 403 && typeof window !== "undefined") {
      res
        .clone()
        .json()
        .then((data: { error?: string }) => {
          if (data?.error === "WORKSPACE_SUSPENDED") {
            window.location.href = "/workspace-suspended";
          }
        })
        .catch(() => {});
    }
    return res;
  } catch (err) {
    if (timeoutId) clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError" && controller?.signal.aborted) {
      throw new Error("Request timed out");
    }
    throw err;
  }
}
```

---

## PART 5 — Dashboard Logout System

### 5.1 `components/layout/ProfileCommandPanel.tsx` — full file

File is 384 lines. Auth-relevant part:

### 5.2 `handleSignOut` (highlighted)

```typescript
const handleSignOut = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } catch (err) {
    console.error("Logout revoke failed", err);
  }
  await signOut(auth);
  onClose();
};
```

- Calls `POST /api/auth/logout` with `Authorization: Bearer <idToken>` so the backend can revoke refresh tokens, then calls Firebase `signOut(auth)`. Extension tokens are in `chrome.storage.local` and are **not** cleared by dashboard logout; the extension will only see “not authenticated” after the next `checkBackendSession()` (e.g. next icon click) when the backend rejects the (revoked) token.

---

## PART 6 — Backend Auth

### 6.1 `lib/server/auth.ts`

```typescript
import { getAdminAuth } from "@/lib/server/firebaseAdmin";

export interface DecodedIdToken {
  uid: string;
  [key: string]: unknown;
}

export async function verifyIdToken(token: string): Promise<DecodedIdToken> {
  const decoded = await getAdminAuth().verifyIdToken(token, true);
  return { ...decoded, uid: decoded.uid } as DecodedIdToken;
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

### 6.2 `lib/server/firebaseAdmin.ts`

```typescript
import { initializeApp, cert, getApps, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let app: App | null = null;

function getApp(): App {
  if (app) return app;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env.local"
    );
  }
  if (!getApps().length) {
    app = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  } else {
    app = getApps()[0] as App;
  }
  return app;
}

export function getAdminAuth() {
  return getAuth(getApp());
}
```

### 6.3 `app/api/auth/session/route.ts`

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

### 6.4 `app/api/auth/logout/route.ts`

```typescript
import { requireAuth } from "@/lib/server/auth";
import { getAdminAuth } from "@/lib/server/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const user = await requireAuth(req);
    await getAdminAuth().revokeRefreshTokens(user.uid);
    return Response.json({ success: true });
  } catch {
    return Response.json(JSON.stringify({ success: false }), { status: 401 });
  }
}
```

---

## PART 7 — Backend API Usage: `/api/auth/session`

### Callers in application code

- **Extension (background):**
  - `checkBackendSession()` — `fetch(\`${API_BASE}/api/auth/session\`, { headers: { Authorization: \`Bearer ${token}\` } })`
  - `validateSessionWithBackend()` — same URL
  - `validateSessionAndOpenTray()` — same URL
  - `prewarmSessionFromStorage()` — same URL

- **Dashboard:** Does **not** call `/api/auth/session` for auth state; it uses Firebase `onAuthStateChanged` and `auth.currentUser`.

### Route definition

- **File:** `app/api/auth/session/route.ts` — GET handler only; uses `requireAuth(req)` then returns `{ authenticated: true, user: { uid } }` or 401 with `{ authenticated: false }`.

Other references to `/api/auth/session` in the repo are in docs (e.g. `ECHLY_AUTH_FINAL_ARCHITECTURE.md`, `ECHLY_EXTENSION_SYSTEM_AUDIT.md`, etc.), not in application code.

---

## PART 8 — Extension Runtime Trace (recommended logging)

**No code was modified.** For external debugging, add these logs temporarily:

### In `chrome.action.onClicked` (start of listener)

```javascript
console.log("ECHLY CLICK START")
console.log("SESSION CACHE", sessionCache)
```

### Before calling backend in the async branch

```javascript
console.log("CHECKING BACKEND SESSION")
```

### After `checkBackendSession()` resolves (in same async block)

```javascript
console.log("SESSION RESPONSE", session)
```

### Inside `checkBackendSession()` (before fetch and after response)

```javascript
console.log("AUTH REQUEST /api/auth/session")
// ... fetch ...
console.log("AUTH RESPONSE STATUS", res.status)
console.log("AUTH RESPONSE BODY", await res.text())
```

(Ensure you only read `res.text()` once if you need to use the body; otherwise clone the response or store the result.)

Where to add them in code:

- Start of `chrome.action.onClicked.addListener` callback: first two logs.
- Right before `const session = await checkBackendSession();`: "CHECKING BACKEND SESSION".
- Right after that await: "SESSION RESPONSE", session.
- In `checkBackendSession()`: before `fetch(...)`: "AUTH REQUEST /api/auth/session"; after `const res = await fetch(...)`: "AUTH RESPONSE STATUS" and "AUTH RESPONSE BODY" (using `await res.clone().text()` or a single `await res.text()` and then use that for both log and JSON parse if needed).

---

## PART 9 — Browser Network Capture

**Manual steps (no code changes):**

1. Open DevTools → Network.
2. Filter by "session" or URL containing `api/auth/session`.
3. Click the extension icon to trigger `GET /api/auth/session`.
4. Select the request and record:
   - **Status code** (e.g. 200 or 401).
   - **Response body** (e.g. `{"authenticated":true,"user":{"uid":"..."}}` or `{"authenticated":false}`).
   - **Request headers** (at least `Authorization: Bearer <token>` present or missing).
   - **Response headers** (e.g. `Content-Type`).

Use this to confirm whether the backend is reached, which base URL the extension uses (localhost vs production), and whether the token is sent and accepted.

---

## PART 10 — Extension Storage Dump

**No code was modified.** To capture stored tokens for debugging:

1. In the extension’s background context (e.g. Service Worker console in `chrome://extensions` → “Inspect views: service worker”), run:

```javascript
chrome.storage.local.get(null, (data) => {
  console.log("ECHLY STORAGE", data)
})
```

2. Record the output (redact tokens if sharing externally). Relevant keys:
   - `echlyIdToken`
   - `echlyRefreshToken`
   - `echlyTokenTime`
   - Legacy: `auth_idToken`, `auth_refreshToken`, `auth_expiresAtMs`, `auth_user` (cleared by `clearAuthState()`).

---

## PART 11 — Runtime Flow Diagrams

### Extension click flow

```
click extension
       ↓
authCheckInProgress? → yes → return (no-op)
       ↓ no
originTabId = tab?.id ?? null
       ↓
sessionCache.authenticated === true && now - sessionCache.checkedAt < SESSION_CACHE_TTL_MS?
       ↓ yes                                    ↓ no
toggle tray (visible/expanded)           authCheckInProgress = true
persistUIState()                                  ↓
broadcastUIState()                    checkBackendSession()
checkBackendSession() in background         ↓
  .then(session)                      getValidToken() → storage or refreshIdToken()
  if !session.authenticated →           ↓
    clearAuthState(), close tray,     fetch(API_BASE + "/api/auth/session", Bearer token)
    openOrFocusLoginTab(loginUrl)            ↓
return                                  401/403 → clearAuthState(), return { authenticated: false }
                                         !res.ok → return { authenticated: false }
                                         res.json() → session
                                               ↓
                                         sessionCache = { authenticated, checkedAt }
                                               ↓
                                         session.authenticated === true?
                                               ↓ yes                    ↓ no
                                         set user, toggle tray,   openOrFocusLoginTab(loginUrl)
                                         persistUIState(),
                                         broadcastUIState()
                                               ↓
                                         authCheckInProgress = false
```

### Logout scenario (dashboard → extension)

```
dashboard: user clicks Sign out
       ↓
handleSignOut()
       ↓
auth.currentUser → getIdToken()
       ↓
POST /api/auth/logout
  Authorization: Bearer <idToken>
       ↓
Backend: requireAuth(req) → verifyIdToken(token)
         getAdminAuth().revokeRefreshTokens(user.uid)
       ↓
Response: { success: true }
       ↓
signOut(auth)  (Firebase client sign-out)
       ↓
Extension: chrome.storage.local unchanged (still has echlyIdToken, echlyRefreshToken)
       ↓
User clicks extension icon
       ↓
checkBackendSession()
  getValidToken() → returns stored idToken (or refreshIdToken(); refresh may fail after revoke)
  GET /api/auth/session with Bearer <token>
       ↓
Backend: verifyIdToken(token, true) → can throw if token revoked/invalid
       ↓
401 or 403 → clearAuthState() (remove tokens, clear session cache, close tray)
       ↓
Return { authenticated: false } → extension opens login tab
```

---

## OUTPUT SUMMARY

- **PART 1:** Full source of extension auth core files (background, content, contentAuthFetch, requestTokenFromPage, pageTokenBridge, secureBridgeChannel).
- **PART 2:** Extracted click logic and helpers from `background.ts`: `chrome.action.onClicked`, `checkBackendSession`, `getValidToken`, `refreshIdToken`, `validateSessionAndOpenTray`, `clearAuthState`, `openOrFocusLoginTab`.
- **PART 3:** All handlers and callers for ECHLY_EXTENSION_AUTH_SUCCESS, ECHLY_PAGE_LOGIN_SUCCESS, ECHLY_GET_AUTH_STATE, ECHLY_OPEN_POPUP, LOGIN, ECHLY_SIGN_IN.
- **PART 4:** Dashboard login system: login page, authActions, Firebase config, firebase.ts, authFetch.
- **PART 5:** Dashboard logout: ProfileCommandPanel and `handleSignOut`.
- **PART 6:** Backend auth: lib/server/auth.ts, firebaseAdmin.ts, session route, logout route.
- **PART 7:** Every usage of `/api/auth/session` (extension only; dashboard does not call it).
- **PART 8:** Recommended temporary logging points (no code modified).
- **PART 9:** Steps to capture GET /api/auth/session in the browser.
- **PART 10:** How to dump extension storage (no code modified).
- **PART 11:** Extension click flow and dashboard logout → extension flow.

This report is intended for external debugging and architecture analysis. No existing code was modified.
