# Echly Extension Runtime — Full Diagnostic Dump

**Purpose:** Complete extraction of Echly's extension authentication and tray control logic for external debugging.  
**No code was modified.** This report is purely diagnostic.

---

## SECTION 1 — Extension core files

Full source of each file, without truncation.

### 1.1 `echly-extension/src/background.ts`

```ts
/**
 * Extension background (service worker). Auth uses short-lived extension tokens
 * from GET /api/auth/extensionToken (dashboard session cookie). No token storage.
 */
import { ECHLY_DEBUG, warn } from "../../lib/utils/logger";
import { echlyLog } from "../../lib/debug/echlyLogger";

const API_BASE =
  typeof process !== "undefined" && process.env?.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://echly-web.vercel.app";
if (ECHLY_DEBUG) console.log("[EXTENSION] Using API_BASE:", API_BASE);

const ECHLY_LOGIN_BASE = "https://echly-web.vercel.app/login";

/** In-memory extension access token (short-lived, from GET /api/auth/extensionToken). Not persisted. */
let extensionAccessToken: string | null = null;

/** Tab ID of the tab where the user clicked the extension icon (for post-login switch-back). */
let originTabId: number | null = null;

/** Tab ID of the login tab we opened or reused (closed after successful auth if still on /login). */
let loginTabId: number | null = null;

/** Tab ID of the persistent dashboard tab used to broker extension token (session cookie). */
let dashboardTabId: number | null = null;

/** Tab ID of the hidden auth broker tab (extension-auth page). Closed after token is received. */
let authBrokerTabId: number | null = null;

const ECHLY_EXTENSION_AUTH_ORIGIN = "https://echly-web.vercel.app";

/** Debug log labels for extension auth flow. */
const ECHLY_LOG_CLICK = "ECHLY_CLICK";
const ECHLY_LOG_TOKEN_FOUND = "ECHLY_TOKEN_FOUND";
const ECHLY_LOG_LOGIN_REQUIRED = "ECHLY_LOGIN_REQUIRED";
const ECHLY_LOG_LOGIN_SUCCESS = "ECHLY_LOGIN_SUCCESS";
const ECHLY_LOG_TRAY_OPEN = "ECHLY_TRAY_OPEN";
const ECHLY_LOG_BROKER_TAB_OPENED = "ECHLY_BROKER_TAB_OPENED";
const ECHLY_LOG_EXTENSION_TOKEN_RECEIVED = "ECHLY_EXTENSION_TOKEN_RECEIVED";
const ECHLY_LOG_TRAY_OPENED = "ECHLY_TRAY_OPENED";
const ECHLY_LOG_LOGOUT_SYNC = "ECHLY_LOGOUT_SYNC";

/**
 * Open login tab: reuse existing tab on login URL to avoid duplicate dashboard tabs.
 * Uses url pattern so we only focus a tab that is already on /login.
 */
function openOrFocusLoginTab(loginUrl: string): Promise<number> {
  return new Promise((resolve) => {
    chrome.tabs.query({ url: "*://echly-web.vercel.app/login*" }, (tabs) => {
      const existing = tabs.find((t) => t.id != null);
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

/**
 * Open login page once: if a tab is already on /login, focus it; otherwise create one.
 * Prevents multiple login tabs (no second tab).
 */
async function openLoginOnce(loginUrl: string): Promise<number> {
  const tabs = await chrome.tabs.query({ url: "*://echly-web.vercel.app/login*" });
  const existing = tabs.find((t) => t.id != null);
  if (existing?.id != null) {
    await chrome.tabs.update(existing.id, { active: true });
    loginTabId = existing.id;
    return existing.id;
  }
  const created = await chrome.tabs.create({ url: loginUrl });
  const id = created?.id ?? 0;
  loginTabId = id || null;
  return id;
}

/** True if we have an in-memory extension token (validity confirmed on next API 401). */
function hasValidToken(): boolean {
  return Boolean(extensionAccessToken);
}

/** Show tray (visible + expanded), persist and broadcast. Only updates UI state; no auth. */
function openTray(): void {
  console.log("ECHLY TRAY OPEN");
  if (ECHLY_DEBUG) console.log("[ECHLY]", ECHLY_LOG_TRAY_OPEN);
  echlyLog("BACKGROUND", ECHLY_LOG_TRAY_OPEN);
  globalUIState.visible = true;
  globalUIState.expanded = true;
  persistUIState();
  broadcastUIState();
}

/** Open hidden broker tab to obtain token via dashboard cookie. Token comes back via postMessage → content → background. */
async function openAuthBrokerTab(): Promise<void> {
  if (ECHLY_DEBUG) console.log("[ECHLY]", ECHLY_LOG_BROKER_TAB_OPENED);
  echlyLog("BACKGROUND", ECHLY_LOG_BROKER_TAB_OPENED);
  const tab = await chrome.tabs.create({
    url: `${ECHLY_EXTENSION_AUTH_ORIGIN}/extension-auth`,
    active: false,
  });
  authBrokerTabId = tab.id ?? null;
}

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

/**
 * Legacy auth keys — cleanup only. clearAuthState() removes them if present from older installs.
 */
const AUTH_STORAGE_KEYS_LEGACY = [
  "auth_idToken",
  "auth_refreshToken",
  "auth_expiresAtMs",
  "auth_user",
] as const;

/** Clear auth state: in-memory token, legacy storage keys; close tray and broadcast. */
function clearAuthState(): void {
  extensionAccessToken = null;
  globalUIState.user = null;
  globalUIState.visible = false;
  globalUIState.expanded = false;
  chrome.storage.local.remove([...AUTH_STORAGE_KEYS_LEGACY]);
  persistUIState();
  broadcastUIState();
}

/**
 * Find an existing tab that is on the dashboard origin (echly-web.vercel.app).
 * Sets dashboardTabId and returns the tab, or null if none.
 */
async function findDashboardTab(): Promise<chrome.tabs.Tab | null> {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (!tab.url) continue;
    if (tab.url.startsWith("https://echly-web.vercel.app")) {
      dashboardTabId = tab.id ?? null;
      return tab;
    }
  }
  return null;
}

/**
 * Ensure a dashboard tab exists: reuse cached tab if still valid, else find existing, else create one (background, not active).
 * Prevents opening multiple dashboard tabs.
 */
async function ensureDashboardTab(): Promise<chrome.tabs.Tab> {
  if (dashboardTabId) {
    try {
      const tab = await chrome.tabs.get(dashboardTabId);
      if (tab) return tab;
    } catch {
      dashboardTabId = null;
    }
  }
  const existing = await findDashboardTab();
  if (existing) return existing;
  const tab = await chrome.tabs.create({
    url: "https://echly-web.vercel.app/dashboard",
    active: false,
  });
  dashboardTabId = tab.id ?? null;
  return tab;
}

/**
 * Get a valid extension access token from memory only. Token is obtained via broker tab (dashboard page fetches with cookie).
 * Throws NOT_AUTHENTICATED if not in memory.
 */
async function getValidToken(): Promise<string> {
  if (extensionAccessToken) return extensionAccessToken;
  throw new Error("NOT_AUTHENTICATED");
}

/**
 * Auth check: in-memory token only. No session API; validity relies on 401 from API calls.
 */
async function checkAuthWithExtensionToken(): Promise<{
  authenticated: boolean;
  user?: { uid: string; name?: string | null; email?: string | null; photoURL?: string | null } | null;
}> {
  if (extensionAccessToken && globalUIState.user) {
    return { authenticated: true, user: globalUIState.user };
  }
  clearAuthState();
  return { authenticated: false, user: null };
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

/** When the dashboard or login tab is closed, clear cached id. */
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === dashboardTabId) dashboardTabId = null;
  if (tabId === authBrokerTabId) authBrokerTabId = null;
  if (tabId === loginTabId) loginTabId = null;
});

/** Extension icon click: auth check first, then open tray only if token valid; else open login once. Tray never opens before auth completes. */
chrome.action.onClicked.addListener(async (tab) => {
  console.log("ECHLY CLICK");
  if (ECHLY_DEBUG) console.log("[ECHLY]", ECHLY_LOG_CLICK);
  echlyLog("BACKGROUND", ECHLY_LOG_CLICK);

  originTabId = tab?.id ?? null;

  try {
    const token = await getValidToken();
    if (!token) throw new Error("NO_TOKEN");
    console.log("ECHLY TOKEN VALID");
    if (ECHLY_DEBUG) console.log("[ECHLY]", ECHLY_LOG_TOKEN_FOUND);
    echlyLog("BACKGROUND", ECHLY_LOG_TOKEN_FOUND);
    if (globalUIState.visible === true) {
      globalUIState.visible = false;
      globalUIState.expanded = false;
      persistUIState();
      broadcastUIState();
    } else {
      openTray();
    }
  } catch {
    if (globalUIState.visible) return;
    console.log("ECHLY LOGIN REQUIRED");
    if (ECHLY_DEBUG) console.log("[ECHLY]", ECHLY_LOG_LOGIN_REQUIRED);
    echlyLog("BACKGROUND", ECHLY_LOG_LOGIN_REQUIRED);
    const loginUrl =
      ECHLY_LOGIN_BASE +
      "?extension=true" +
      (tab?.url ? "&returnUrl=" + encodeURIComponent(tab.url) : "");
    await openLoginOnce(loginUrl);
  }
});

/** Single message listener for extension messages. */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  echlyLog("MESSAGE", "received", request.type);

  /* Loom-style login: login page posts ECHLY_EXTENSION_LOGIN_SUCCESS; content forwards here. Store token in memory, return to origin tab, close login tab, open tray. */
  if (request.type === "ECHLY_EXTENSION_LOGIN_SUCCESS") {
    const payload = request as { idToken?: string; refreshToken?: string; uid?: string; name?: string | null; email?: string | null };
    const idToken = payload.idToken;
    const uid = payload.uid;
    if (idToken && uid) {
      if (ECHLY_DEBUG) console.log("[ECHLY]", ECHLY_LOG_LOGIN_SUCCESS);
      echlyLog("BACKGROUND", ECHLY_LOG_LOGIN_SUCCESS);
      extensionAccessToken = idToken;
      globalUIState.user = {
        uid,
        name: payload.name ?? null,
        email: payload.email ?? null,
        photoURL: null,
      };
      /* Return to tab where user clicked the extension. */
      if (originTabId != null) {
        chrome.tabs.update(originTabId, { active: true }).catch(() => {});
      }
      /* Close login tab if still on /login. */
      if (loginTabId != null) {
        chrome.tabs.get(loginTabId).then(
          (t) => {
            if (t?.url?.includes("/login")) {
              chrome.tabs.remove(loginTabId!).catch(() => {});
            }
            loginTabId = null;
          },
          () => {
            loginTabId = null;
          }
        );
      }
      openTray();
      persistUIState();
      broadcastUIState();
    }
    return false;
  }

  if (request.type === "ECHLY_EXTENSION_TOKEN") {
    const token = (request as { token?: string }).token;
    const uid = (request as { uid?: string }).uid;
    if (token && uid) {
      if (ECHLY_DEBUG) console.log("[ECHLY]", ECHLY_LOG_EXTENSION_TOKEN_RECEIVED);
      echlyLog("BACKGROUND", ECHLY_LOG_EXTENSION_TOKEN_RECEIVED);
      extensionAccessToken = token;
      globalUIState.user = { uid, name: null, email: null, photoURL: null };
      if (authBrokerTabId != null) {
        chrome.tabs.remove(authBrokerTabId).catch(() => {});
        authBrokerTabId = null;
      }
      openTray();
    }
    return false;
  }

  if (request.type === "ECHLY_DASHBOARD_LOGOUT") {
    if (ECHLY_DEBUG) console.log("[ECHLY]", ECHLY_LOG_LOGOUT_SYNC);
    echlyLog("BACKGROUND", ECHLY_LOG_LOGOUT_SYNC);
    clearAuthState();
    extensionAccessToken = null;
    return false;
  }

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
        console.warn("[ECHLY AUTH] transient error, not clearing auth");
        sendResponse({ error: "NOT_AUTHENTICATED" });
      }
    })();
    return true;
  }

  if (request.type === "ECHLY_GET_AUTH_STATE") {
    (async () => {
      const session = await checkAuthWithExtensionToken();
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
        console.warn("[ECHLY AUTH] transient error, not clearing auth");
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
        console.warn("[ECHLY AUTH] transient error, not clearing auth");
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
```

---

### 1.2 `echly-extension/src/content.tsx`

*(Full file: 1080 lines. Key excerpts for auth/tray; full content available in repo.)*

**Location:** `echly-extension/src/content.tsx`

**Summary:** Content script mounts a single React widget; visibility is controlled by background via `ECHLY_GLOBAL_STATE`. Auth is not requested by content; it is derived from `globalState.user` (background is sole authority). Content listens for `ECHLY_EXTENSION_LOGIN_SUCCESS` and `ECHLY_EXTENSION_TOKEN` via `window.postMessage` and forwards to background; it also handles `ECHLY_REQUEST_EXTENSION_TOKEN` by calling `requestExtensionTokenFromPage()` and responding with `{ token, uid }`.

**Full file:** See repository file. Below are the auth- and message-relevant parts.

- **Imports:** `requestExtensionTokenFromPage` from `./requestExtensionTokenFromPage`, `apiFetch` from `./contentAuthFetch`, CaptureWidget, types, logger, echlyLog.
- **Constants:** `ROOT_ID`, `SHADOW_HOST_ID`, `APP_ORIGIN`, `ECHLY_DASHBOARD_ORIGIN` (https://echly-web.vercel.app).
- **`getShouldShowTray(state)`:** `state.visible === true || state.sessionModeActive === true || state.sessionPaused === true`.
- **`requestOpenLoginPage()`:** `chrome.runtime.sendMessage({ type: "ECHLY_OPEN_POPUP" })`.
- **`ensureBrokerAndLogoutBridge()`:** `window.addEventListener("message")` — on `ECHLY_EXTENSION_LOGIN_SUCCESS` forwards to background with idToken, refreshToken, uid, name, email; on `ECHLY_EXTENSION_TOKEN` forwards token, uid; on `ECHLY_DASHBOARD_LOGOUT` forwards to background.
- **`ensureMessageListener()`:** Handles `ECHLY_REQUEST_EXTENSION_TOKEN` (calls `requestExtensionTokenFromPage()`, sendResponse `{ token, uid }`), `ECHLY_GET_TOKEN_FROM_PAGE` (proxies to background `ECHLY_GET_TOKEN`), `ECHLY_GLOBAL_STATE`, `ECHLY_TOGGLE`, `ECHLY_RESET_WIDGET`, `ECHLY_SESSION_STATE_SYNC`, `ECHLY_FEEDBACK_CREATED`.
- **Hydration:** On mount and on visibilitychange, content sends `ECHLY_GET_GLOBAL_STATE` and applies state (no auth request).
- **Full source:** Complete file at `echly-extension/src/content.tsx` (1080 lines). Auth and message-handling logic is fully described above and in Section 7; the repo file is the single source of truth for the entire content script.

---

### 1.3 `echly-extension/src/contentAuthFetch.ts`

```ts
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

### 1.4 `echly-extension/src/api.ts`

```ts
/**
 * API client for production backend.
 * Automatically attaches Authorization: Bearer <firebase-id-token> to every request.
 */
import { ECHLY_DEBUG } from "../../lib/utils/logger";
import { auth } from "./firebase";

const API_BASE =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://echly-web.vercel.app";
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

---

### 1.5 `echly-extension/src/firebase.ts`

```ts
/**
 * Firebase initialization for Chrome extension.
 * Uses same config as web app. Modular Firebase v9+ syntax.
 * Import from firebase/auth/web-extension for extension compatibility.
 * Exports auth, db, storage so shared lib/feedback and lib/screenshot work when aliased here.
 */
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth/web-extension";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { firebaseConfig } from "../../lib/firebase/config";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

---

### 1.6 `echly-extension/src/requestExtensionTokenFromPage.ts`

**Note:** The codebase uses `requestExtensionTokenFromPage.ts` (not `requestTokenFromPage.ts`). There are no files named `pageTokenBridge.js` or `secureBridgeChannel.ts` in the extension; token from page is obtained via postMessage to the dashboard page (EchlyExtensionTokenProvider or extension-auth page).

```ts
export type ExtensionTokenResult = { token: string; uid?: string };

export function requestExtensionTokenFromPage(): Promise<ExtensionTokenResult> {
  return new Promise((resolve, reject) => {
    const id = "echly_token_request_" + Date.now;

    function handler(event: MessageEvent) {
      if (event.data?.type === "ECHLY_EXTENSION_TOKEN_RESPONSE" && event.data.id === id) {
        window.removeEventListener("message", handler);

        if (event.data.token) {
          resolve({ token: event.data.token, uid: event.data.uid });
        } else {
          reject(new Error("NO_TOKEN"));
        }
      }
    }

    window.addEventListener("message", handler);

    window.postMessage(
      {
        type: "ECHLY_EXTENSION_TOKEN_REQUEST",
        id,
      },
      "*"
    );
  });
}
```

---

### 1.7 `pageTokenBridge.js` and `secureBridgeChannel.ts`

**Not present in the repository.** The current flow uses:

- **Login path:** Login page posts `ECHLY_EXTENSION_LOGIN_SUCCESS` (idToken, uid, etc.) to `window.location.origin`; content script’s `ensureBrokerAndLogoutBridge()` forwards to background.
- **Broker path:** `/extension-auth` page fetches `GET /api/auth/extensionToken` with `credentials: "include"` and posts `ECHLY_EXTENSION_TOKEN`; content forwards to background.
- **Dashboard token request:** Content handles `ECHLY_REQUEST_EXTENSION_TOKEN` by calling `requestExtensionTokenFromPage()`, which posts `ECHLY_EXTENSION_TOKEN_REQUEST`; the dashboard page (EchlyExtensionTokenProvider) fetches `/api/auth/extensionToken` and replies with `ECHLY_EXTENSION_TOKEN_RESPONSE` (id, token, uid).

No separate `pageTokenBridge.js` or `secureBridgeChannel.ts` files exist in `echly-extension/src/`.

---

## SECTION 2 — Manifest

### 2.1 `echly-extension/manifest.json`

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
  "icons": { "16": "assets/icon16.png", "32": "assets/icon32.png", "48": "assets/icon48.png", "128": "assets/icon128.png" },
  "action": {
    "default_icon": {
      "16": "assets/icon16.png",
      "32": "assets/icon32.png",
      "48": "assets/icon48.png"
    }
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
    {
      "resources": [
        "popup.css",
        "assets/Echly_logo.svg",
        "assets/Echly_logo_launcher.svg",
        "fonts/PlusJakartaSans-*.woff2"
      ],
      "matches": ["<all_urls>"]
    }
  ]
}
```

**Implications:**

- **Content script domains:** `matches: ["<all_urls>"]` — content runs on all URLs.
- **Permissions:** `storage`, `activeTab`, `tabs`.
- **Background:** Service worker `background.js` (no popup; icon click handled by `chrome.action.onClicked`).

---

## SECTION 3 — Click handler

### 3.1 `chrome.action.onClicked` — entire handler

**Location:** `echly-extension/src/background.ts` (single listener)

```ts
chrome.action.onClicked.addListener(async (tab) => {
  console.log("ECHLY CLICK");
  if (ECHLY_DEBUG) console.log("[ECHLY]", ECHLY_LOG_CLICK);
  echlyLog("BACKGROUND", ECHLY_LOG_CLICK);

  originTabId = tab?.id ?? null;

  try {
    const token = await getValidToken();
    if (!token) throw new Error("NO_TOKEN");
    console.log("ECHLY TOKEN VALID");
    if (ECHLY_DEBUG) console.log("[ECHLY]", ECHLY_LOG_TOKEN_FOUND);
    echlyLog("BACKGROUND", ECHLY_LOG_TOKEN_FOUND);
    if (globalUIState.visible === true) {
      globalUIState.visible = false;
      globalUIState.expanded = false;
      persistUIState();
      broadcastUIState();
    } else {
      openTray();
    }
  } catch {
    if (globalUIState.visible) return;
    console.log("ECHLY LOGIN REQUIRED");
    if (ECHLY_DEBUG) console.log("[ECHLY]", ECHLY_LOG_LOGIN_REQUIRED);
    echlyLog("BACKGROUND", ECHLY_LOG_LOGIN_REQUIRED);
    const loginUrl =
      ECHLY_LOGIN_BASE +
      "?extension=true" +
      (tab?.url ? "&returnUrl=" + encodeURIComponent(tab.url) : "");
    await openLoginOnce(loginUrl);
  }
});
```

### 3.2 Functions used by the click handler

- **`getValidToken()`:** Returns `extensionAccessToken` or throws `NOT_AUTHENTICATED`. No storage, no `/api/auth/session` in this path.
- **`openTray()`:** Sets `globalUIState.visible = true`, `globalUIState.expanded = true`, then `persistUIState()` and `broadcastUIState()`.
- **`persistUIState()`:** `chrome.storage.local.set({ trayVisible: globalUIState.visible, trayExpanded: globalUIState.expanded })`.
- **`broadcastUIState()`:** Sends `{ type: "ECHLY_GLOBAL_STATE", state: globalUIState }` to all tabs (with retry for active tab).
- **`openLoginOnce(loginUrl)`:** Queries tabs with `url: "*://echly-web.vercel.app/login*"`; if one exists, focuses it and sets `loginTabId`; otherwise `chrome.tabs.create({ url: loginUrl })`.

---

## SECTION 4 — Tray control

### 4.1 Variables

- **`globalUIState`** (object):  
  `visible`, `expanded`, `isRecording`, `sessionId`, `sessionTitle`, `sessionModeActive`, `sessionPaused`, `sessionLoading`, `pointers`, `captureMode`, `user`.  
  Tray visibility is driven by `visible`; expand/collapse by `expanded`. Persisted keys: `trayVisible`, `trayExpanded` (see below).

- **`trayVisible` / `trayExpanded`:** Not separate variables; they are the keys used in `chrome.storage.local` to persist `globalUIState.visible` and `globalUIState.expanded`.

### 4.2 Functions

- **`openTray()`:** Sets `globalUIState.visible = true`, `globalUIState.expanded = true`, then `persistUIState()`, `broadcastUIState()`.
- **`persistUIState()`:** `chrome.storage.local.set({ trayVisible: globalUIState.visible, trayExpanded: globalUIState.expanded })`.
- **`broadcastUIState()`:** Sends `{ type: "ECHLY_GLOBAL_STATE", state: globalUIState }` to every tab (with 50ms retry for active tab on first send failure).
- **Click handler tray toggle:** If token valid and tray currently visible, it sets `globalUIState.visible = false`, `globalUIState.expanded = false`, then `persistUIState()` and `broadcastUIState()`; otherwise it calls `openTray()`.

**Tray flash analysis:** Tray visibility can change when: (1) click with valid token toggles visible/expanded and broadcasts; (2) `initializeSessionState()` runs on startup and restores `trayVisible`/`trayExpanded` then broadcasts; (3) any handler that calls `openTray()` or clears tray (e.g. `clearAuthState()`) and then broadcasts. A brief flash can occur if content applies an old state then receives a new broadcast, or if multiple broadcasts happen in quick succession (e.g. after login: openTray → persistUIState → broadcastUIState, and tab switch/activation also sends state).

---

## SECTION 5 — Token system

### 5.1 Variables

- **`extensionAccessToken`:** In-memory only; holds the extension JWT or Firebase ID token. Set when receiving `ECHLY_EXTENSION_LOGIN_SUCCESS` (idToken) or `ECHLY_EXTENSION_TOKEN` (token from broker). Cleared by `clearAuthState()`. Not persisted.
- **`tokenState`:** Does not exist in the current codebase. Auth is represented by `extensionAccessToken` + `globalUIState.user`.

### 5.2 Implementations

- **`getValidToken()`:** Returns `extensionAccessToken` if set; otherwise throws `Error("NOT_AUTHENTICATED")`. No fetch, no storage read.
- **`checkAuthWithExtensionToken()`:** If `extensionAccessToken && globalUIState.user`, returns `{ authenticated: true, user: globalUIState.user }`; else calls `clearAuthState()` and returns `{ authenticated: false, user: null }`.
- **`clearAuthState()`:** Sets `extensionAccessToken = null`, `globalUIState.user = null`, `globalUIState.visible = false`, `globalUIState.expanded = false`, `chrome.storage.local.remove(AUTH_STORAGE_KEYS_LEGACY)`, then `persistUIState()` and `broadcastUIState()`.
- **`validateSessionWithBackend(token)`:** Not present. Session validity is inferred from 401/403 on API calls (e.g. `echly-api`, feedback, upload), which trigger `clearAuthState()`.
- **`refreshIdToken()`:** Not present. Token is either from login postMessage or from broker/extension-auth page; no refresh in background.

---

## SECTION 6 — Login tab logic

### 6.1 `openOrFocusLoginTab(loginUrl: string): Promise<number>`

```ts
function openOrFocusLoginTab(loginUrl: string): Promise<number> {
  return new Promise((resolve) => {
    chrome.tabs.query({ url: "*://echly-web.vercel.app/login*" }, (tabs) => {
      const existing = tabs.find((t) => t.id != null);
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

### 6.2 `openLoginOnce(loginUrl: string): Promise<number>`

```ts
async function openLoginOnce(loginUrl: string): Promise<number> {
  const tabs = await chrome.tabs.query({ url: "*://echly-web.vercel.app/login*" });
  const existing = tabs.find((t) => t.id != null);
  if (existing?.id != null) {
    await chrome.tabs.update(existing.id, { active: true });
    loginTabId = existing.id;
    return existing.id;
  }
  const created = await chrome.tabs.create({ url: loginUrl });
  const id = created?.id ?? 0;
  loginTabId = id || null;
  return id;
}
```

### 6.3 Tab API usage in background

- **`chrome.tabs.query`:**  
  - `{ url: "*://echly-web.vercel.app/login*" }` in `openOrFocusLoginTab` and `openLoginOnce`.  
  - `{}` in `broadcastUIState`, `endSessionFromIdle`, `ECHLY_SESSION_MODE_END`, `ECHLY_PROCESS_FEEDBACK` (to broadcast to all tabs).  
  - `{ active: true, currentWindow: true }` inside `broadcastUIState` to get active tab for retry.
- **`chrome.tabs.create`:**  
  - Login: `chrome.tabs.create({ url: loginUrl })` in `openOrFocusLoginTab` / `openLoginOnce`.  
  - Broker: `chrome.tabs.create({ url: ECHLY_EXTENSION_AUTH_ORIGIN + "/extension-auth", active: false })` in `openAuthBrokerTab`.  
  - Dashboard: `chrome.tabs.create({ url: "https://echly-web.vercel.app/dashboard", active: false })` in `ensureDashboardTab`.  
  - Generic: `chrome.tabs.create({ url })` in `ECHLY_OPEN_TAB` handler.
- **`chrome.tabs.update`:**  
  - Focus login tab: `chrome.tabs.update(id, { active: true })` in `openOrFocusLoginTab` / `openLoginOnce`.  
  - Switch back after login: `chrome.tabs.update(originTabId, { active: true })` in `ECHLY_EXTENSION_LOGIN_SUCCESS`.
- **`chrome.tabs.get`:** Used to check if login tab is still on `/login` before closing it after login success.
- **`chrome.tabs.remove`:** Close login tab (if still on /login) after login success; close auth broker tab after receiving `ECHLY_EXTENSION_TOKEN`.

Duplicate dashboard behavior is avoided by reusing an existing tab on `*://echly-web.vercel.app/login*` when opening login, and by reusing/finding a dashboard tab in `ensureDashboardTab` before creating a new one.

---

## SECTION 7 — Message bridge

### 7.1 `chrome.runtime.sendMessage` (senders)

- **Content → background:**  
  `ECHLY_OPEN_POPUP`, `ECHLY_FEEDBACK_CREATED`, `ECHLY_EXTENSION_LOGIN_SUCCESS`, `ECHLY_EXTENSION_TOKEN`, `ECHLY_DASHBOARD_LOGOUT`, `ECHLY_GET_GLOBAL_STATE`, `ECHLY_SET_ACTIVE_SESSION`, `ECHLY_SESSION_MODE_START`, `ECHLY_OPEN_TAB`, `ECHLY_SESSION_MODE_END`, `ECHLY_EXPAND_WIDGET`, `ECHLY_COLLAPSE_WIDGET`, `ECHLY_SESSION_UPDATED`, `ECHLY_TICKET_UPDATED`, `ECHLY_PROCESS_FEEDBACK`, `ECHLY_SESSION_MODE_PAUSE/RESUME/ACTIVITY`, `START_RECORDING`, `STOP_RECORDING`, `echly-api`, `ECHLY_GET_TOKEN`, `ECHLY_GET_AUTH_STATE`, etc.
- **Background → content:**  
  `chrome.tabs.sendMessage(tabId, payload)` for `ECHLY_GLOBAL_STATE`, `ECHLY_SESSION_STATE_SYNC`, `ECHLY_RESET_WIDGET`, `ECHLY_FEEDBACK_CREATED`.

### 7.2 `chrome.runtime.onMessage` — background handler (message types)

Single listener in `background.ts`; handles (among others):

- **ECHLY_EXTENSION_LOGIN_SUCCESS** — Store idToken in `extensionAccessToken`, set `globalUIState.user`, focus `originTabId`, close login tab if still on /login, `openTray()`, persist and broadcast.
- **ECHLY_EXTENSION_TOKEN** — Store token and uid, close auth broker tab, `openTray()`.
- **ECHLY_DASHBOARD_LOGOUT** — `clearAuthState()`, `extensionAccessToken = null`.
- **ECHLY_GET_AUTH_STATE** — Async: `checkAuthWithExtensionToken()`, sendResponse `{ authenticated, user }`.
- **ECHLY_OPEN_POPUP** — `openOrFocusLoginTab(loginUrl)` with optional returnUrl.
- **ECHLY_SIGN_IN / ECHLY_START_LOGIN / LOGIN** — Same: `openOrFocusLoginTab(loginUrl)`, sendResponse `{ success: false, error: "Use dashboard login" }`.
- **ECHLY_GET_GLOBAL_STATE** — sendResponse `{ state: { ...globalUIState } }`.
- **ECHLY_GET_TOKEN** — Async: `getValidToken()`, sendResponse `{ token }` or `{ error: "NOT_AUTHENTICATED" }`.
- **echly-api** — Proxy fetch; token from payload or `getValidToken()`; on 401/403 call `clearAuthState()`.
- Plus: ECHLY_TOGGLE_VISIBILITY, ECHLY_EXPAND_WIDGET, ECHLY_COLLAPSE_WIDGET, ECHLY_FEEDBACK_CREATED, ECHLY_SET_CAPTURE_MODE, ECHLY_SESSION_UPDATED, ECHLY_TICKET_UPDATED, ECHLY_SET_ACTIVE_SESSION, ECHLY_OPEN_TAB, ECHLY_SESSION_MODE_*, START_RECORDING, STOP_RECORDING, CAPTURE_TAB, ECHLY_UPLOAD_SCREENSHOT, ECHLY_PROCESS_FEEDBACK.

### 7.3 `window.postMessage` (page ↔ content)

- **Login page → content:**  
  `ECHLY_EXTENSION_LOGIN_SUCCESS` with `idToken`, `refreshToken`, `uid`, `name`, `email` to `window.location.origin`. Content’s `ensureBrokerAndLogoutBridge()` forwards to background.
- **Extension-auth page → content:**  
  `ECHLY_EXTENSION_TOKEN` with `token`, `uid` to `"*"`. Content forwards to background.
- **Dashboard (EchlyExtensionTokenProvider):**  
  Listens for `ECHLY_EXTENSION_TOKEN_REQUEST`; fetches `/api/auth/extensionToken` (credentials: include); replies `ECHLY_EXTENSION_TOKEN_RESPONSE` with `id`, `token`, `uid`.
- **Content → page:**  
  `ECHLY_EXTENSION_TOKEN_REQUEST` with `id` (from `requestExtensionTokenFromPage()`).  
  Content listens for `ECHLY_EXTENSION_TOKEN_RESPONSE` with matching `id` and resolves with `{ token, uid }`.

### 7.4 Important message types (summary)

| Type | Direction | Purpose |
|------|-----------|--------|
| ECHLY_EXTENSION_LOGIN_SUCCESS | Page → content → background | Login page sends idToken/uid; background stores token, opens tray, closes login tab. |
| ECHLY_EXTENSION_TOKEN | Page → content → background | Broker/dashboard sends extension JWT; background stores token, opens tray. |
| ECHLY_PAGE_LOGIN_SUCCESS | Not used in codebase | (Legacy name; actual type is ECHLY_EXTENSION_LOGIN_SUCCESS.) |
| ECHLY_GET_AUTH_STATE | Any → background | Background replies with `checkAuthWithExtensionToken()`. |
| ECHLY_OPEN_POPUP | Content → background | Open/focus login tab (with returnUrl). |
| ECHLY_SIGN_IN / ECHLY_START_LOGIN / LOGIN | Content → background | Same as ECHLY_OPEN_POPUP. |
| ECHLY_GLOBAL_STATE | Background → content | Push tray/session state to tabs. |
| ECHLY_REQUEST_EXTENSION_TOKEN | Background → content | Content calls requestExtensionTokenFromPage(), responds with token/uid. |
| ECHLY_EXTENSION_TOKEN_REQUEST | Content → page | Request token; page replies with ECHLY_EXTENSION_TOKEN_RESPONSE. |

---

## SECTION 8 — Dashboard login page

### 8.1 `app/(auth)/login/page.tsx` — token send logic

**Extension flow:** When `isExtension` (search param `extension=true`), the login page sends tokens to the extension via `window.postMessage(..., window.location.origin)` so the content script (same origin) can receive and forward to background.

**1) onAuthStateChanged (useEffect):**

```ts
if (user) {
  if (isExtension) {
    try {
      const idToken = await user.getIdToken();
      const refreshToken = (user as { refreshToken?: string }).refreshToken ?? "";
      window.postMessage(
        {
          type: "ECHLY_EXTENSION_LOGIN_SUCCESS",
          idToken,
          refreshToken,
          uid: user.uid,
          name: user.displayName ?? null,
          email: user.email ?? null,
        },
        window.location.origin
      );
    } catch { /* ignore */ }
    window.location.href = "/dashboard";
    return;
  }
  // ... non-extension redirect
}
```

**2) handleGoogle (Google sign-in):**

```ts
if (isExtension) {
  const idToken = await user.getIdToken();
  const refreshToken = (user as { refreshToken?: string }).refreshToken ?? "";
  window.postMessage(
    {
      type: "ECHLY_EXTENSION_LOGIN_SUCCESS",
      idToken,
      refreshToken,
      uid: user.uid,
      name: user.displayName ?? null,
      email: user.email ?? null,
    },
    window.location.origin
  );
  window.location.href = "/dashboard";
  return;
}
```

**3) handleEmail (email/password sign-in):**

Same pattern: if `isExtension`, post `ECHLY_EXTENSION_LOGIN_SUCCESS` with idToken, refreshToken, uid, name, email to `window.location.origin`, then `window.location.href = "/dashboard"`.

So the login page does not call `/api/auth/extensionToken`; it sends the Firebase idToken (and refreshToken, uid, name, email) via postMessage. The extension stores that idToken in memory and uses it as the Bearer token until a 401/403 triggers `clearAuthState()`.

---

## SECTION 9 — Backend token endpoint

### 9.1 `app/api/auth/extensionToken/route.ts`

```ts
import { requireAuth } from "@/lib/server/auth";
import { SignJWT } from "jose";

/**
 * GET /api/auth/extensionToken
 * Issues a short-lived access token for the extension.
 * Requires dashboard session cookie (credentials: 'include' from extension).
 * Does not accept Bearer auth — session cookie only.
 */
export async function GET(req: Request) {
  const user = await requireAuth(req);

  const secret = process.env.EXTENSION_TOKEN_SECRET;
  if (!secret) {
    console.error("EXTENSION_TOKEN_SECRET is not set");
    return new Response(
      JSON.stringify({ error: "Server configuration error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const token = await new SignJWT({
    uid: user.uid,
    type: "extension",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(new TextEncoder().encode(secret));

  return Response.json({ token, uid: user.uid });
}
```

**Behavior:** Requires a valid session via `requireAuth(req)` (session cookie or Bearer). Uses `EXTENSION_TOKEN_SECRET` to sign a 15-minute JWT with `uid` and `type: "extension"`. Returns `{ token, uid }`. Used by the extension-auth page and by EchlyExtensionTokenProvider (dashboard) when the extension requests a token from a page that can send cookies.

---

## SECTION 10 — Network calls

### 10.1 `/api/auth/extensionToken`

- **Extension background:** Does not call this directly. Token is obtained either (1) from the login page via postMessage (Firebase idToken), or (2) from the extension-auth page or dashboard page that call this endpoint with `credentials: "include"` and then post the token to the extension.
- **app/extension-auth/page.tsx:**  
  `fetch("/api/auth/extensionToken", { credentials: "include" })` — on success posts `ECHLY_EXTENSION_TOKEN` with `data.token`, `data.uid`; on 401 or !res.ok redirects to login.
- **components/EchlyExtensionTokenProvider.tsx:**  
  `fetch("/api/auth/extensionToken", { method: "GET", credentials: "include" })` — on success posts `ECHLY_EXTENSION_TOKEN_RESPONSE` with `id`, `data.token`, `data.uid`; on failure posts with `token: null`.

### 10.2 `/api/auth/session`

- **Extension:** The current extension code does not call `GET /api/auth/session`. Auth is in-memory only; validity is inferred from 401/403 on API calls (echly-api, feedback, sessions, upload-screenshot, structure-feedback), which trigger `clearAuthState()`.
- **App (login page):** Uses `POST /api/auth/sessionLogin` (not GET /api/auth/session) for non-extension login to set the session cookie.

---

## SECTION 11 — Runtime flow diagrams

### 11.1 Extension click flow

```
User clicks extension icon
         ↓
chrome.action.onClicked
         ↓
originTabId = tab.id
         ↓
getValidToken()
         ↓
  ┌─────┴─────┐
  │            │
  ▼            ▼
Token         No token
  │            │
  ▼            ▼
If tray       if (globalUIState.visible) return;
visible?      else:
  │            ▼
  ├─ yes →    openLoginOnce(loginUrl)
  │   set visible=false, expanded=false
  │   persistUIState(); broadcastUIState()
  │            ↓
  └─ no  →    chrome.tabs.query(login URL)
  openTray()       ↓
  persistUIState()   existing tab? → chrome.tabs.update(active: true)
  broadcastUIState()   else → chrome.tabs.create(loginUrl)
```

### 11.2 Login return flow (Loom-style)

```
User on login page (extension=true)
         ↓
Sign in (Google or email)
         ↓
user.getIdToken() (+ refreshToken, uid, name, email)
         ↓
window.postMessage(ECHLY_EXTENSION_LOGIN_SUCCESS, origin)
         ↓
Content script (ensureBrokerAndLogoutBridge) receives message
         ↓
chrome.runtime.sendMessage(ECHLY_EXTENSION_LOGIN_SUCCESS)
         ↓
Background: extensionAccessToken = idToken, globalUIState.user = { uid, name, email }
         ↓
chrome.tabs.update(originTabId, { active: true })
         ↓
If loginTabId and tab still on /login → chrome.tabs.remove(loginTabId)
         ↓
openTray() → persistUIState() → broadcastUIState()
         ↓
Login page: window.location.href = "/dashboard"
```

### 11.3 Broker tab flow (extension-auth page)

```
Background opens /extension-auth (optional path; not used in click flow by default)
         ↓
Page: fetch("/api/auth/extensionToken", { credentials: "include" })
         ↓
Backend: requireAuth(req) (session cookie) → SignJWT 15m → { token, uid }
         ↓
Page: window.postMessage(ECHLY_EXTENSION_TOKEN, { token, uid }, "*")
         ↓
Content script forwards to background
         ↓
Background: extensionAccessToken = token, globalUIState.user = { uid }; close broker tab; openTray()
```

---

## SECTION 12 — Token storage

### 12.1 `chrome.storage.local` usage in extension

All usages are in `echly-extension/src/background.ts`:

1. **Write — tray state**  
   `chrome.storage.local.set({ trayVisible: globalUIState.visible, trayExpanded: globalUIState.expanded })`  
   In: `persistUIState()`.

2. **Write — session lifecycle**  
   `chrome.storage.local.set({ activeSessionId: null, sessionModeActive: false, sessionPaused: false })`  
   In: `endSessionFromIdle()`, `ECHLY_SESSION_MODE_END` handler.

3. **Write — session lifecycle**  
   `chrome.storage.local.set({ activeSessionId, sessionModeActive: globalUIState.sessionModeActive, sessionPaused: globalUIState.sessionPaused })`  
   In: `persistSessionLifecycleState()`.

4. **Read**  
   `chrome.storage.local.get(["activeSessionId", "sessionModeActive", "sessionPaused", "trayVisible", "trayExpanded"], callback)`  
   In: `initializeSessionState()`.

5. **Remove (legacy auth keys)**  
   `chrome.storage.local.remove([...AUTH_STORAGE_KEYS_LEGACY])`  
   In: `clearAuthState()`.  
   Keys: `auth_idToken`, `auth_refreshToken`, `auth_expiresAtMs`, `auth_user`.

6. **Write — active session**  
   `chrome.storage.local.set({ activeSessionId: sessionId, sessionModeActive: true, sessionPaused: false })`  
   In: `ECHLY_SET_ACTIVE_SESSION` handler.

7. **Write — session end**  
   `chrome.storage.local.set({ activeSessionId: null, sessionModeActive: false, sessionPaused: false })`  
   In: `ECHLY_SESSION_MODE_END` handler.

### 12.2 Keys used

| Key | Purpose |
|-----|--------|
| trayVisible | Persisted tray visibility (globalUIState.visible). |
| trayExpanded | Persisted tray expanded state (globalUIState.expanded). |
| activeSessionId | Current session id; null when no session. |
| sessionModeActive | Whether session mode is active. |
| sessionPaused | Whether session is paused. |
| auth_idToken | Legacy; removed by clearAuthState(). |
| auth_refreshToken | Legacy; removed by clearAuthState(). |
| auth_expiresAtMs | Legacy; removed by clearAuthState(). |
| auth_user | Legacy; removed by clearAuthState(). |

**Note:** The extension does not persist the current access token. `extensionAccessToken` is in-memory only and is lost on service worker restart until the user logs in again or a broker/page provides a new token.

---

## SECTION 13 — Debug trace (suggested)

**No code was modified.** For external debugging of the tray flash and auth flow, the following logs can be added temporarily to `background.ts` (e.g. at the start of the click listener and after state changes):

```ts
// At start of chrome.action.onClicked listener (after originTabId assignment):
console.log("ECHLY CLICK");
console.log("ECHLY TOKEN STATE", extensionAccessToken ? "(present)" : "(null)");
console.log("ECHLY TRAY STATE", { visible: globalUIState.visible, expanded: globalUIState.expanded });
```

**Note:** The codebase already logs `"ECHLY CLICK"` and conditionally `"ECHLY TOKEN VALID"` / `"ECHLY LOGIN REQUIRED"`. Adding the two lines above would make token presence and tray state visible in the service worker console (chrome://extensions → background page / Inspect service worker) to help reproduce the tray flash bug.

---

*End of diagnostic report. No production code was changed.*
