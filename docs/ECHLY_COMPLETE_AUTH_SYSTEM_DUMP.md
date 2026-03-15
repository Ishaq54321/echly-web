# Echly Complete Auth System Dump

**Purpose:** Export every line of code involved in Echly authentication and extension login flow for external review. No code modifications — diagnostic only.

**Generated:** For use in repairing the extension authentication architecture.

---

## PART 1 — Extension Background Script

**File:** `echly-extension/src/background.ts` (full file, sections labeled)

### Labeled sections

- **chrome.action.onClicked** — Extension icon click handler (opens tray, triggers token fetch, opens login on failure)
- **getValidToken** — Returns in-memory token or fetches from dashboard tab
- **fetchExtensionToken** — (Not present by name; token is fetched via **fetchExtensionTokenFromDashboard**)
- **fetchExtensionTokenFromDashboard** — Requests token from dashboard tab via ECHLY_REQUEST_EXTENSION_TOKEN
- **clearAuthState** — Clears in-memory token, legacy storage keys, tray state
- **openOrFocusLoginTab** — Opens or focuses a tab with /login
- **ensureDashboardTab** — Ensures a dashboard tab exists (find or create, background)
- **findDashboardTab** — Finds existing tab on echly-web.vercel.app
- **echly-api handler** — Message handler that proxies fetch with Bearer token

### Full file content

```typescript
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

/** Guard to prevent concurrent token fetch on double-click. */
let tokenFetchInProgress = false;

/**
 * [SECTION: openOrFocusLoginTab]
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

/**
 * [SECTION: clearAuthState]
 * Clear auth state: in-memory token, legacy storage keys; close tray and broadcast.
 */
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
 * [SECTION: findDashboardTab]
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
 * [SECTION: ensureDashboardTab]
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
 * [SECTION: fetchExtensionTokenFromDashboard]
 * Request extension token from the persistent dashboard tab (content script → page bridge; dashboard has session cookie).
 * Throws NOT_AUTHENTICATED if no token (do not redirect here; caller opens login on 401).
 */
async function fetchExtensionTokenFromDashboard(): Promise<{ token: string; uid: string }> {
  const tab = await ensureDashboardTab();
  const response = await chrome.tabs.sendMessage(tab.id!, {
    type: "ECHLY_REQUEST_EXTENSION_TOKEN",
  });
  if (!response?.token) {
    throw new Error("NOT_AUTHENTICATED");
  }
  const uid = typeof response.uid === "string" ? response.uid : "";
  return { token: response.token, uid };
}

/**
 * [SECTION: getValidToken]
 * Get a valid extension access token: from memory or by requesting from the dashboard tab (page-context cookie).
 * Throws NOT_AUTHENTICATED if not logged in.
 */
async function getValidToken(): Promise<string> {
  if (extensionAccessToken) return extensionAccessToken;
  const { token, uid } = await fetchExtensionTokenFromDashboard();
  extensionAccessToken = token;
  globalUIState.user = { uid, name: null, email: null, photoURL: null };
  return token;
}

/**
 * Auth check via dashboard tab token request (page context sends cookie).
 * Returns { authenticated, user } or clears state and returns not authenticated.
 */
async function checkAuthWithExtensionToken(): Promise<{
  authenticated: boolean;
  user?: { uid: string; name?: string | null; email?: string | null; photoURL?: string | null } | null;
}> {
  try {
    const { token, uid } = await fetchExtensionTokenFromDashboard();
    extensionAccessToken = token;
    const user = { uid, name: null as string | null, email: null as string | null, photoURL: null as string | null };
    globalUIState.user = user;
    return { authenticated: true, user };
  } catch {
    clearAuthState();
    return { authenticated: false, user: null };
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

/** When the dashboard tab is closed, clear cached id so next token request can find or create one. */
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === dashboardTabId) dashboardTabId = null;
});

/**
 * [SECTION: chrome.action.onClicked]
 * Extension icon click: open tray immediately, then API call with extension token; if 401, open login.
 */
chrome.action.onClicked.addListener((tab) => {
  if (tokenFetchInProgress) return;
  originTabId = tab?.id ?? null;

  // Open tray immediately (toggle if already visible)
  if (globalUIState.visible === true) {
    globalUIState.visible = false;
    globalUIState.expanded = false;
  } else {
    globalUIState.visible = true;
    globalUIState.expanded = true;
  }
  persistUIState();
  broadcastUIState();

  tokenFetchInProgress = true;
  (async () => {
    try {
      await getValidToken();
      broadcastUIState();
    } catch {
      clearAuthState();
      const returnUrl = typeof tab?.url === "string" ? tab.url : "";
      const loginUrl =
        ECHLY_LOGIN_BASE +
        "?extension=true" +
        (returnUrl ? "&returnUrl=" + encodeURIComponent(returnUrl) : "");
      await openOrFocusLoginTab(loginUrl);
    } finally {
      tokenFetchInProgress = false;
    }
  })();
});

/** Single message listener for extension messages. */
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

  /**
   * [SECTION: echly-api handler]
   * Proxies fetch from content script; adds Bearer token from getValidToken().
   */
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

## PART 2 — Extension Content Script

**File:** `echly-extension/src/content.tsx` (full file)

### Message listeners extracted

**chrome.runtime.onMessage** (in `ensureMessageListener` and one useEffect):

1. **ECHLY_REQUEST_EXTENSION_TOKEN** — Content script (on dashboard origin only) calls `requestExtensionTokenFromPage()`, then sends `{ token, uid }` in response.
2. **ECHLY_GET_TOKEN_FROM_PAGE** — Forwards to background `ECHLY_GET_TOKEN`, returns token in response.
3. **ECHLY_FEEDBACK_CREATED** — Dispatches `ECHLY_FEEDBACK_CREATED` CustomEvent with ticket and sessionId.
4. **ECHLY_GLOBAL_STATE** — Applies state, sets host visibility, dispatches `ECHLY_GLOBAL_STATE` CustomEvent.
5. **ECHLY_TOGGLE** — Dispatches `ECHLY_TOGGLE_WIDGET` CustomEvent.
6. **ECHLY_RESET_WIDGET** — Dispatches `ECHLY_RESET_WIDGET` CustomEvent.
7. **ECHLY_SESSION_STATE_SYNC** — Requests `ECHLY_GET_GLOBAL_STATE` from background and applies + dispatches.

Additional **chrome.runtime.onMessage** in React (auth state):

- **ECHLY_AUTH_STATE_UPDATED** — Updates local `user` state from `msg.authenticated` and `msg.user`.

**window.addEventListener("message")** — Not used for token in content.tsx; token request/response is done inside the content script’s chrome.runtime listener that calls `requestExtensionTokenFromPage()`, which itself uses **window.postMessage** / **window.addEventListener("message")** to talk to the page (see requestExtensionTokenFromPage.ts).

**ECHLY_REQUEST_EXTENSION_TOKEN** — Received in content script (ensureMessageListener); only on dashboard origin it calls `requestExtensionTokenFromPage()` and responds with `{ token, uid }`.

**ECHLY_EXTENSION_TOKEN_REQUEST** — Sent by `requestExtensionTokenFromPage.ts` via `window.postMessage` to the page; dashboard page (EchlyExtensionTokenProvider) listens for it.

**ECHLY_EXTENSION_TOKEN_RESPONSE** — Sent by dashboard via `window.postMessage`; `requestExtensionTokenFromPage.ts` listens for it (with matching `id`) and resolves with `{ token, uid }`.

Full content.tsx is ~900 lines; key listener block (verbatim):

```typescript
// ensureMessageListener(host) — content.tsx
chrome.runtime.onMessage.addListener((msg: { type?: string; state?: GlobalUIState; ticket?: { id: string; title: string; description: string; type?: string }; sessionId?: string }, _sender, sendResponse) => {
  if (msg.type === "ECHLY_REQUEST_EXTENSION_TOKEN") {
    if (!location.origin.includes("echly-web.vercel.app")) {
      sendResponse({ token: null });
      return true;
    }
    requestExtensionTokenFromPage()
      .then((result) => sendResponse({ token: result.token, uid: result.uid }))
      .catch(() => sendResponse({ token: null }));
    return true;
  }
  if (msg.type === "ECHLY_GET_TOKEN_FROM_PAGE") {
    chrome.runtime.sendMessage({ type: "ECHLY_GET_TOKEN" }, (response: { token?: string; error?: string }) => {
      sendResponse(response?.token != null ? { token: response.token } : { token: null });
    });
    return true;
  }
  if (msg.type === "ECHLY_FEEDBACK_CREATED" && msg.ticket && msg.sessionId) {
    echlyLog("CONTENT", "dispatch event", { type: "ECHLY_FEEDBACK_CREATED" });
    window.dispatchEvent(new CustomEvent("ECHLY_FEEDBACK_CREATED", { detail: { ticket: msg.ticket, sessionId: msg.sessionId } }));
    return;
  }
  // ... ECHLY_GLOBAL_STATE, ECHLY_TOGGLE, ECHLY_RESET_WIDGET, ECHLY_SESSION_STATE_SYNC
});
```

### Full file: echly-extension/src/content.tsx (verbatim)

See repository file `echly-extension/src/content.tsx` for the complete 901-line file. The following are the exact message/custom-event touchpoints:

- **chrome.runtime.sendMessage** used with: ECHLY_OPEN_POPUP, ECHLY_FEEDBACK_CREATED, ECHLY_GET_GLOBAL_STATE, START_RECORDING, STOP_RECORDING, ECHLY_EXPAND_WIDGET, ECHLY_COLLAPSE_WIDGET, ECHLY_SET_ACTIVE_SESSION, ECHLY_SESSION_MODE_START, ECHLY_OPEN_TAB, ECHLY_PROCESS_FEEDBACK, ECHLY_TICKET_UPDATED, ECHLY_SESSION_UPDATED, ECHLY_SESSION_MODE_END, ECHLY_GET_TOKEN (via ECHLY_GET_TOKEN_FROM_PAGE).
- **chrome.runtime.onMessage.addListener** in ensureMessageListener handles ECHLY_REQUEST_EXTENSION_TOKEN, ECHLY_GET_TOKEN_FROM_PAGE, ECHLY_FEEDBACK_CREATED, ECHLY_GLOBAL_STATE, ECHLY_TOGGLE, ECHLY_RESET_WIDGET, ECHLY_SESSION_STATE_SYNC; another listener in React handles ECHLY_AUTH_STATE_UPDATED.
- **window.addEventListener("message")** — token flow uses postMessage from requestExtensionTokenFromPage (see PART 3); content does not add a separate window message listener for token (page does).
- **window.dispatchEvent** — ECHLY_GLOBAL_STATE, ECHLY_FEEDBACK_CREATED, ECHLY_TOGGLE_WIDGET, ECHLY_RESET_WIDGET (CustomEvents).
- **apiFetch** in content is from contentAuthFetch (echly-api proxy); no direct ECHLY_EXTENSION_TOKEN_REQUEST in content except as the message type sent to the content script by background, which then calls requestExtensionTokenFromPage() that uses ECHLY_EXTENSION_TOKEN_REQUEST / ECHLY_EXTENSION_TOKEN_RESPONSE via window.postMessage.

---

## PART 3 — Extension Token Bridge

### echly-extension/src/requestExtensionTokenFromPage.ts (full)

```typescript
export type ExtensionTokenResult = { token: string; uid?: string };

export function requestExtensionTokenFromPage(): Promise<ExtensionTokenResult> {
  return new Promise((resolve, reject) => {
    const id = "echly_token_request_" + Date.now();

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

### echly-extension/src/contentAuthFetch.ts (full)

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

### echly-extension/src/api.ts (full)

```typescript
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

Note: Content script uses `contentAuthFetch.apiFetch` (proxies via `echly-api`); `api.ts` is used in extension popup/options context where Firebase auth exists, not in injected content.

---

## PART 4 — Dashboard Token Provider

**File:** `components/EchlyExtensionTokenProvider.tsx` (full)

Listens for **ECHLY_EXTENSION_TOKEN_REQUEST** (and legacy ECHLY_REQUEST_TOKEN); responds with token via **ECHLY_EXTENSION_TOKEN_RESPONSE** using cookie-backed GET /api/auth/extensionToken.

```tsx
"use client";

import { useEffect } from "react";
import { auth } from "@/lib/firebase";

const ECHLY_REQUEST_TOKEN = "ECHLY_REQUEST_TOKEN";
const ECHLY_TOKEN_RESPONSE = "ECHLY_TOKEN_RESPONSE";

/**
 * Listens for extension token requests (postMessage) and responds with the current
 * Firebase ID token. Allows the Echly Chrome extension to be stateless: it gets
 * a fresh token from the dashboard page instead of storing refresh tokens.
 */
export function EchlyExtensionTokenProvider() {
  useEffect(() => {
    const handler = async (event: MessageEvent) => {
      if (event.data?.type !== ECHLY_REQUEST_TOKEN) return;

      const user = auth.currentUser;
      if (!user) {
        window.postMessage({ type: ECHLY_TOKEN_RESPONSE, token: null }, "*");
        return;
      }

      try {
        const token = await user.getIdToken();
        window.postMessage({ type: ECHLY_TOKEN_RESPONSE, token }, "*");
      } catch {
        window.postMessage({ type: ECHLY_TOKEN_RESPONSE, token: null }, "*");
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  /* Cookie-bridge: extension content script requests token; we fetch in page context so __session cookie is sent. */
  useEffect(() => {
    async function handler(event: MessageEvent) {
      if (event.data?.type !== "ECHLY_EXTENSION_TOKEN_REQUEST") return;

      const id = event.data.id;

      try {
        const res = await fetch("/api/auth/extensionToken", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) throw new Error("UNAUTH");

        const data = await res.json();

        window.postMessage(
          {
            type: "ECHLY_EXTENSION_TOKEN_RESPONSE",
            id,
            token: data.token,
            uid: data.uid,
          },
          "*"
        );
      } catch {
        window.postMessage(
          {
            type: "ECHLY_EXTENSION_TOKEN_RESPONSE",
            id,
            token: null,
          },
          "*"
        );
      }
    }

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return null;
}
```

---

## PART 5 — Dashboard Login Flow

### app/(auth)/login/page.tsx (full)

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
              window.location.origin
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

  const safeRedirectToReturnUrl = (url: string) => {
    try {
      const decoded = decodeURIComponent(url);
      const u = new URL(decoded);
      if (u.protocol === "http:" || u.protocol === "https:") {
        window.location.href = decoded;
        return true;
      }
    } catch {
      /* ignore invalid URL */
    }
    return false;
  };

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
          window.location.origin
        );
        window.location.href = "/dashboard";
        return;
      }
      const idToken = await user.getIdToken();
      await fetch("/api/auth/sessionLogin", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
        credentials: "include",
      });
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
          window.location.origin
        );
        window.location.href = "/dashboard";
        return;
      }
      const idToken = await user.getIdToken();
      await fetch("/api/auth/sessionLogin", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
        credentials: "include",
      });
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
      {/* ... rest of JSX (header, hero, AuthCard, Google/Email buttons, form) ... */}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f9fafc] flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading…</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

function GoogleIcon(){ /* ... */ }
```

### lib/auth/authActions.ts (full)

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

### lib/authFetch.ts (full)

```typescript
/** In extension context, set window.__ECHLY_API_BASE__ so requests use the API origin. */
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

export type AuthFetchInit = RequestInit & {
  timeout?: number;
};

export async function authFetch(
  input: RequestInfo | URL,
  init: AuthFetchInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers || {});

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
      credentials: "include",
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

### lib/firebase.ts (full)

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

---

## PART 6 — Dashboard Logout Flow

**File:** `components/layout/ProfileCommandPanel.tsx`

### handleSignOut (highlighted)

```typescript
const handleSignOut = async () => {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch (err) {
    console.error("Logout revoke failed", err);
  }
  await signOut(auth);
  onClose();
};
```

Button that triggers it:

```tsx
<button
  type="button"
  onClick={handleSignOut}
  style={{ fontSize: 14, fontWeight: 500, color: "#E54848", marginTop: "auto", paddingTop: 12, paddingBottom: 4, paddingLeft: 10, paddingRight: 10 }}
  className="w-full rounded text-left transition hover:opacity-80 hover:bg-[#FEF2F2]"
>
  Sign out
</button>
```

Full file: 372 lines in `components/layout/ProfileCommandPanel.tsx` (auth flow: sign out → POST /api/auth/logout with credentials → Firebase signOut → close panel).

---

## PART 7 — Backend Extension Token Endpoint

**File:** `app/api/auth/extensionToken/route.ts` (full)

```typescript
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

---

## PART 8 — Backend Auth Middleware

**File:** `lib/server/auth.ts` (full)

Includes **verifyIdToken**, **verifyExtensionToken**, **requireAuth**.

```typescript
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getAdminAuth } from "@/lib/server/firebaseAdmin";

export interface DecodedIdToken {
  uid: string;
  [key: string]: unknown;
}

export async function verifyIdToken(token: string): Promise<DecodedIdToken> {
  const decoded = await getAdminAuth().verifyIdToken(token, true);
  return { ...decoded, uid: decoded.uid } as DecodedIdToken;
}

/** Verify short-lived extension JWT issued by GET /api/auth/extensionToken. */
export async function verifyExtensionToken(
  token: string
): Promise<DecodedIdToken> {
  const secret = process.env.EXTENSION_TOKEN_SECRET;
  if (!secret) {
    throw new Error("EXTENSION_TOKEN_SECRET is not set");
  }
  const { payload } = await jwtVerify(
    token,
    new TextEncoder().encode(secret)
  );
  const uid = payload.uid;
  if (typeof uid !== "string") {
    throw new Error("Invalid extension token payload");
  }
  return { uid, ...payload } as DecodedIdToken;
}

export async function requireAuth(request: Request): Promise<DecodedIdToken> {
  const authHeader = request.headers.get("Authorization");

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split("Bearer ")[1];
    try {
      return await verifyIdToken(token);
    } catch {
      try {
        return await verifyExtensionToken(token);
      } catch (error) {
        console.error("Token verification failed:", error);
        throw new Response(
          JSON.stringify({ error: "Unauthorized - Invalid token" }),
          { status: 401 }
        );
      }
    }
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session")?.value;

  if (sessionCookie) {
    try {
      const decoded = await getAdminAuth().verifySessionCookie(
        sessionCookie,
        true
      );
      return { ...decoded, uid: decoded.uid } as DecodedIdToken;
    } catch (error) {
      console.error("Session cookie verification failed:", error);
      throw new Response(
        JSON.stringify({ error: "Unauthorized - Invalid session" }),
        { status: 401 }
      );
    }
  }

  throw new Response(
    JSON.stringify({ error: "Unauthorized - Missing token or session" }),
    { status: 401 }
  );
}
```

---

## PART 9 — Session Login Endpoint

**File:** `app/api/auth/sessionLogin/route.ts` (full)

```typescript
import { getAdminAuth } from "@/lib/server/firebaseAdmin";

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Missing token" }), {
      status: 401,
    });
  }

  const idToken = authHeader.split("Bearer ")[1];
  const adminAuth = getAdminAuth();

  try {
    await adminAuth.verifyIdToken(idToken);

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: 5 * 24 * 60 * 60 * 1000,
    });

    const headers = new Headers();
    headers.append(
      "Set-Cookie",
      `__session=${sessionCookie}; HttpOnly; Secure; SameSite=None; Path=/`
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers,
    });
  } catch {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401,
    });
  }
}
```

---

## PART 10 — Logout Endpoint

**File:** `app/api/auth/logout/route.ts` (full)

```typescript
import { requireAuth } from "@/lib/server/auth";
import { getAdminAuth } from "@/lib/server/firebaseAdmin";

const clearSessionCookie =
  "__session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=None";

export async function POST(req: Request) {
  const headers = new Headers();
  headers.append("Set-Cookie", clearSessionCookie);

  try {
    const user = await requireAuth(req);
    await getAdminAuth().revokeRefreshTokens(user.uid);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers,
    });
  } catch {
    return new Response(JSON.stringify({ success: false }), {
      status: 401,
      headers,
    });
  }
}
```

---

## PART 11 — Extension Storage Keys

All usages of **chrome.storage.local** in the extension folder:

| Location | Operation | Keys |
|----------|-----------|------|
| background.ts ~114 | set | activeSessionId (null), sessionModeActive (false), sessionPaused (false) |
| background.ts ~136–141 | set | activeSessionId, sessionModeActive, sessionPaused |
| background.ts ~146–150 | set | trayVisible, trayExpanded |
| background.ts ~155–161 | get | activeSessionId, sessionModeActive, sessionPaused, trayVisible, trayExpanded |
| background.ts ~240 | remove | AUTH_STORAGE_KEYS_LEGACY: auth_idToken, auth_refreshToken, auth_expiresAtMs, auth_user |
| background.ts ~387–391 | set | activeSessionId, sessionModeActive (true), sessionPaused (false) |
| background.ts ~418–421 | set | activeSessionId (null), sessionModeActive (false), sessionPaused (false) |
| background.ts ~519–523 | set | activeSessionId, sessionModeActive (true), sessionPaused (false) |

**Keys stored:**

- **activeSessionId** — string | null. Current session id for tray/session mode.
- **sessionModeActive** — boolean. Session mode on/off.
- **sessionPaused** — boolean. Session paused state.
- **trayVisible** — boolean. Tray visibility across restarts.
- **trayExpanded** — boolean. Tray expanded state.
- **auth_idToken, auth_refreshToken, auth_expiresAtMs, auth_user** — legacy; only removed in clearAuthState, never written by current code.

Extension token is **not** stored in chrome.storage; it is in-memory only (`extensionAccessToken` in background).

---

## PART 12 — Extension Messaging Graph

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ MESSAGE TYPES & SENDER → RECEIVER                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

ECHLY_REQUEST_EXTENSION_TOKEN
  Sender: Background (to dashboard tab content script)
  Receiver: Content script (dashboard tab only)
  Flow: background sendMessage(tabId, { type: "ECHLY_REQUEST_EXTENSION_TOKEN" })
        → content script calls requestExtensionTokenFromPage() → postMessage to page
        → page (EchlyExtensionTokenProvider) GET /api/auth/extensionToken (credentials: include)
        → postMessage ECHLY_EXTENSION_TOKEN_RESPONSE → requestExtensionTokenFromPage resolves
        → content script sendResponse({ token, uid }) to background

ECHLY_EXTENSION_TOKEN_REQUEST (window.postMessage)
  Sender: Content script (requestExtensionTokenFromPage)
  Receiver: Page (EchlyExtensionTokenProvider)
  Flow: window.postMessage({ type: "ECHLY_EXTENSION_TOKEN_REQUEST", id })

ECHLY_EXTENSION_TOKEN_RESPONSE (window.postMessage)
  Sender: Page (EchlyExtensionTokenProvider)
  Receiver: Content script (requestExtensionTokenFromPage handler)
  Flow: window.postMessage({ type: "ECHLY_EXTENSION_TOKEN_RESPONSE", id, token, uid })

ECHLY_GET_AUTH_STATE
  Sender: Any (e.g. popup)
  Receiver: Background
  Flow: chrome.runtime.sendMessage({ type: "ECHLY_GET_AUTH_STATE" })
        → background checkAuthWithExtensionToken() → sendResponse({ authenticated, user })

ECHLY_OPEN_POPUP
  Sender: Content script (e.g. Sign in button)
  Receiver: Background
  Flow: openOrFocusLoginTab(loginUrl) → sendResponse({ ok: true })

ECHLY_SIGN_IN / ECHLY_START_LOGIN / LOGIN
  Sender: Content script or popup
  Receiver: Background
  Flow: openOrFocusLoginTab(loginUrl with extension=true&returnUrl) → sendResponse({ success: false, error: "Use dashboard login" })

echly-api
  Sender: Content script (contentAuthFetch.authFetch)
  Receiver: Background
  Flow: chrome.runtime.sendMessage({ type: "echly-api", url, method, headers, body })
        → background getValidToken(), fetch(url, { headers: { Authorization: "Bearer " + token } })
        → sendResponse({ ok, status, headers, body })

Other: ECHLY_GET_GLOBAL_STATE, ECHLY_GLOBAL_STATE, ECHLY_GET_TOKEN, ECHLY_TOGGLE_VISIBILITY, ECHLY_RESET_WIDGET, ECHLY_SESSION_STATE_SYNC, ECHLY_FEEDBACK_CREATED, ECHLY_SET_ACTIVE_SESSION, etc. (see background.ts listener).
```

---

## PART 13 — Extension Click Flow Diagram

```
User clicks extension icon
         │
         ▼
chrome.action.onClicked
         │
         ├─ tokenFetchInProgress? → return (guard)
         ├─ originTabId = tab.id
         ├─ Toggle tray (visible/expanded), persistUIState(), broadcastUIState()
         └─ tokenFetchInProgress = true
         │
         ▼
getValidToken()
         │
         ├─ extensionAccessToken in memory? → return it
         └─ else fetchExtensionTokenFromDashboard()
                    │
                    ▼
              ensureDashboardTab()
                    │
                    ├─ dashboardTabId valid? → chrome.tabs.get(dashboardTabId) → return tab
                    ├─ else findDashboardTab() (query all tabs, find echly-web.vercel.app)
                    └─ else chrome.tabs.create({ url: dashboard, active: false }) → set dashboardTabId
                    │
                    ▼
              chrome.tabs.sendMessage(dashboardTabId, { type: "ECHLY_REQUEST_EXTENSION_TOKEN" })
                    │
                    ▼
              Content script (dashboard tab): requestExtensionTokenFromPage()
                    │
                    ▼
              window.postMessage(ECHLY_EXTENSION_TOKEN_REQUEST)
                    │
                    ▼
              Page: EchlyExtensionTokenProvider → fetch("/api/auth/extensionToken", { credentials: "include" })
                    │
                    ▼
              Backend: GET /api/auth/extensionToken → requireAuth (session cookie) → SignJWT 15m → { token, uid }
                    │
                    ▼
              window.postMessage(ECHLY_EXTENSION_TOKEN_RESPONSE { id, token, uid })
                    │
                    ▼
              Content script sendResponse({ token, uid }) → background
         │
         ▼
extensionAccessToken = token; globalUIState.user = { uid, ... }; broadcastUIState()
         │
         ▼
tokenFetchInProgress = false

─── If getValidToken() throws (NOT_AUTHENTICATED) ───
         │
         ▼
clearAuthState() → openOrFocusLoginTab(loginUrl with extension=true&returnUrl)
         │
         ▼
chrome.tabs.query → find tab with /login else chrome.tabs.create(loginUrl)
```

---

## PART 14 — Broker Tab Logic

Every reference to **dashboardTabId**, **ensureDashboardTab**, **chrome.tabs.query**, **chrome.tabs.create**, **chrome.tabs.sendMessage** in the extension (all in background.ts except where noted).

**dashboardTabId**

- Declared: `let dashboardTabId: number | null = null;`
- Set in findDashboardTab: `dashboardTabId = tab.id ?? null;`
- Set in ensureDashboardTab after create: `dashboardTabId = tab.id ?? null;`
- Cleared in ensureDashboardTab when get fails: `dashboardTabId = null;`
- Cleared in chrome.tabs.onRemoved: `if (tabId === dashboardTabId) dashboardTabId = null;`
- Read in ensureDashboardTab: `if (dashboardTabId) { const tab = await chrome.tabs.get(dashboardTabId); ... }`

**ensureDashboardTab**

- Definition: async function that returns existing cached tab, or findDashboardTab(), or creates dashboard tab (active: false), sets dashboardTabId, returns tab.
- Called from: fetchExtensionTokenFromDashboard() only.

**findDashboardTab**

- `const tabs = await chrome.tabs.query({});` then loop, if tab.url.startsWith("https://echly-web.vercel.app") set dashboardTabId and return tab.

**chrome.tabs.query**

- openOrFocusLoginTab: `chrome.tabs.query({}, (tabs) => { ... });`
- endSessionFromIdle: `chrome.tabs.query({}, (tabs) => { tabs.forEach(... sendMessage ECHLY_RESET_WIDGET); });`
- broadcastUIState: `chrome.tabs.query({}, (tabs) => { chrome.tabs.query({ active: true, currentWindow: true }, ...); });`
- findDashboardTab: `await chrome.tabs.query({});`
- ECHLY_SESSION_MODE_END: `chrome.tabs.query({}, (tabs) => { ... sendMessage ECHLY_RESET_WIDGET });`
- ECHLY_PROCESS_FEEDBACK (after ticket created): `chrome.tabs.query({}, (tabs) => { ... sendMessage ECHLY_FEEDBACK_CREATED });`

**chrome.tabs.create**

- openOrFocusLoginTab: `chrome.tabs.create({ url: loginUrl }, (created) => { ... });`
- ensureDashboardTab: `await chrome.tabs.create({ url: "https://echly-web.vercel.app/dashboard", active: false });`
- ECHLY_OPEN_TAB: `chrome.tabs.create({ url });`

**chrome.tabs.sendMessage**

- fetchExtensionTokenFromDashboard: `chrome.tabs.sendMessage(tab.id!, { type: "ECHLY_REQUEST_EXTENSION_TOKEN" });`
- broadcastUIState: `chrome.tabs.sendMessage(tab.id, payload)` (and retry for active tab)
- onActivated: sendMessage ECHLY_GLOBAL_STATE, ECHLY_SESSION_STATE_SYNC
- onCreated: sendMessage ECHLY_GLOBAL_STATE
- endSessionFromIdle / ECHLY_SESSION_MODE_END: sendMessage ECHLY_RESET_WIDGET to all tabs
- ECHLY_PROCESS_FEEDBACK: sendMessage ECHLY_FEEDBACK_CREATED to all tabs

---

## PART 15 — API Calls Using Extension Token (Authorization: Bearer)

All instances in the extension (echly-extension) where **Authorization: Bearer** is used:

1. **background.ts ~184–185** — initializeSessionState, reload pointers:  
   `fetch(API_BASE + "/api/feedback?sessionId=...", { headers: { Authorization: \`Bearer ${token}\` } })`

2. **background.ts ~407–408, ~411** — ECHLY_SET_ACTIVE_SESSION:  
   `fetch(API_BASE + "/api/feedback?sessionId=...", { headers: { Authorization: \`Bearer ${token}\` } })`  
   `fetch(API_BASE + "/api/sessions", { headers: { Authorization: \`Bearer ${token}\` } })`

3. **background.ts ~453–454** — ECHLY_UPLOAD_SCREENSHOT:  
   `headers: { "Content-Type": "application/json", Authorization: \`Bearer ${token}\` }`

4. **background.ts ~524–525** — ECHLY_PROCESS_FEEDBACK structure-feedback:  
   `headers: { "Content-Type": "application/json", Authorization: \`Bearer ${token}\` }`

5. **background.ts ~582–583** — ECHLY_PROCESS_FEEDBACK feedback POST:  
   `headers: { "Content-Type": "application/json", Authorization: \`Bearer ${token}\` }`

6. **background.ts ~612** — echly-api handler:  
   `if (resolvedToken) h["Authorization"] = \`Bearer ${resolvedToken}\`;` then fetch(url, { headers: h }).

Content script never sets Authorization itself; it uses `contentAuthFetch.apiFetch` → `echly-api` → background adds Bearer.  
`echly-extension/src/api.ts` uses `Bearer ${token}` from Firebase (popup/options context), not from extension token bridge.

---

## PART 16 — Runtime Token Lifecycle

**Where token is created**

- **Dashboard (cookie path):** User signs in on dashboard → POST /api/auth/sessionLogin with Firebase id token → server sets __session cookie.  
- **Extension token (short-lived JWT):** When extension needs a token, dashboard tab’s page runs in page context and calls GET /api/auth/extensionToken with credentials: include (sending __session).  
- **Backend:** `app/api/auth/extensionToken/route.ts` — requireAuth(req) (session cookie), then SignJWT({ uid, type: "extension" }).setExpirationTime("15m").sign(EXTENSION_TOKEN_SECRET).  
- **Code refs:** EchlyExtensionTokenProvider.tsx fetch("/api/auth/extensionToken", { credentials: "include" }); extensionToken/route.ts GET handler.

**Where token is stored**

- **Not in extension storage.** Token is kept only in memory in the background script: `let extensionAccessToken: string | null = null;`  
- **Set:** getValidToken() and checkAuthWithExtensionToken() assign `extensionAccessToken = token` after fetchExtensionTokenFromDashboard().  
- **Code refs:** background.ts top-level `extensionAccessToken`, and the two assignments in getValidToken and checkAuthWithExtensionToken.

**Where token is used**

- **Background:** Every API call that needs auth uses getValidToken() and then adds `Authorization: Bearer ${token}` to fetch (see PART 15).  
- **Content script:** Uses contentAuthFetch.apiFetch() → sends message `echly-api` to background → background getValidToken() and adds Bearer to the request.  
- **Backend:** requireAuth() in lib/server/auth.ts: if Authorization starts with "Bearer ", extracts token, tries verifyIdToken then verifyExtensionToken; extensionToken route uses requireAuth (session only) and does not accept Bearer for that route.

**Where token is cleared**

- **clearAuthState()** in background: `extensionAccessToken = null;` plus globalUIState.user = null, tray visibility false, legacy storage keys removed, persistUIState(), broadcastUIState().  
- **Called when:** getValidToken() throws (NOT_AUTHENTICATED); checkAuthWithExtensionToken() catch; 401/403 on API responses (initializeSessionState, ECHLY_SET_ACTIVE_SESSION, ECHLY_UPLOAD_SCREENSHOT, ECHLY_PROCESS_FEEDBACK, echly-api); echly-api catch when message is NOT_AUTHENTICATED.  
- **Code refs:** background.ts clearAuthState() and every place that calls clearAuthState().

**Summary**

- Created: GET /api/auth/extensionToken (dashboard page context, session cookie).  
- Stored: In-memory only in background (`extensionAccessToken`).  
- Used: All extension-originated API calls that require auth (background adds Bearer; content goes via echly-api).  
- Cleared: clearAuthState() on auth failure or NOT_AUTHENTICATED.

---

*End of diagnostic document. No code was modified; all references are to the current codebase.*
