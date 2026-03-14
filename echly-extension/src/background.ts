/**
 * Extension background (service worker). Stateless auth: token is requested from
 * the dashboard page via content script (postMessage), never stored.
 */
import { ECHLY_DEBUG, warn } from "../../lib/utils/logger";
import { echlyLog } from "../../lib/debug/echlyLogger";

const API_BASE = "http://localhost:3000";
if (ECHLY_DEBUG) console.log("[EXTENSION] Using API_BASE:", API_BASE);

const DASHBOARD_ORIGINS = ["http://localhost:3000", "https://echly-web.vercel.app"];
const TOKEN_REQUEST_TIMEOUT_MS = 6000;
const SESSION_CACHE_TTL_MS = 30 * 1000; // 30 seconds

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
 * Legacy auth keys — cleanup only. Extension is stateless and must NEVER write these again.
 * clearAuthState() removes them if present from older installs.
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
}

/** Clear legacy auth state from storage (removes only legacy keys if present). */
function clearAuthState(): void {
  clearSessionCache();
  chrome.storage.local.remove([...AUTH_STORAGE_KEYS_LEGACY]);
}

/**
 * Pre-warm auth session: if a dashboard tab exists, get token and validate with backend,
 * then update sessionCache. No-op if no dashboard tab. Improves perceived launch time on icon click.
 */
async function prewarmAuthSession(): Promise<void> {
  const tabs = await new Promise<chrome.tabs.Tab[]>((resolve) => {
    chrome.tabs.query({}, (t) => resolve(t));
  });
  const dashboardTab = tabs.find((t) => {
    if (!t.url) return false;
    try {
      return DASHBOARD_ORIGINS.includes(new URL(t.url).origin);
    } catch {
      return false;
    }
  });
  if (!dashboardTab?.id) return;

  const token = await getTokenFromPage();
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/api/auth/session`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      sessionCache = { authenticated: false, checkedAt: Date.now() };
      return;
    }
    const data = (await res.json()) as { authenticated?: boolean };
    sessionCache = {
      authenticated: data.authenticated === true,
      checkedAt: Date.now(),
    };
  } catch {
    sessionCache = { authenticated: false, checkedAt: Date.now() };
  }
}

/**
 * Request a fresh Firebase ID token from a dashboard tab's page (via content script).
 * Tries active tab first, then any tab with dashboard origin. Returns null if none.
 */
async function getTokenFromPage(): Promise<string | null> {
  const tryTab = (tabId: number): Promise<string | null> =>
    new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(null), TOKEN_REQUEST_TIMEOUT_MS);
      chrome.tabs.sendMessage(tabId, { type: "ECHLY_GET_TOKEN_FROM_PAGE" }, (response: { token?: string | null } | undefined) => {
        clearTimeout(timeout);
        if (chrome.runtime.lastError) {
          resolve(null);
          return;
        }
        resolve(typeof response?.token === "string" ? response.token : null);
      });
    });

  const tabs = await new Promise<chrome.tabs.Tab[]>((resolve) => {
    chrome.tabs.query({}, (t) => resolve(t));
  });
  const activeTab = tabs.find((t) => t.active);
  if (activeTab?.id) {
    const token = await tryTab(activeTab.id);
    if (token) return token;
  }
  for (const tab of tabs) {
    if (!tab.id || !tab.url) continue;
    try {
      const u = new URL(tab.url);
      if (!DASHBOARD_ORIGINS.includes(u.origin)) continue;
    } catch {
      continue;
    }
    const token = await tryTab(tab.id);
    if (token) return token;
  }
  return null;
}

/**
 * Get a valid token from the page; throws NOT_AUTHENTICATED if user not signed in on dashboard.
 */
async function getValidToken(): Promise<string> {
  const token = await getTokenFromPage();
  if (!token) throw new Error("NOT_AUTHENTICATED");
  return token;
}

/**
 * Backend session check: single source of truth. Uses GET /api/auth/session with Bearer token.
 * If not ok or no token, clears extension auth and returns { authenticated: false }.
 */
async function checkBackendSession(): Promise<{
  authenticated: boolean;
  user?: { uid: string };
}> {
  let token: string;
  try {
    token = await getValidToken();
  } catch {
    clearAuthState();
    return { authenticated: false };
  }
  if (!token) {
    clearAuthState();
    return { authenticated: false };
  }
  try {
    const res = await fetch(`${API_BASE}/api/auth/session`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      clearAuthState();
      return { authenticated: false };
    }
    return await res.json();
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

/** After login completion (signal from login page), re-validate session and push auth state to all tabs. */
async function refreshExtensionAuth(): Promise<void> {
  try {
    const session = await checkBackendSession();
    sessionCache = {
      authenticated: session.authenticated,
      checkedAt: Date.now(),
    };
    chrome.tabs.query({}, (tabs) => {
      for (const tab of tabs) {
        if (!tab.id) continue;
        chrome.tabs
          .sendMessage(tab.id, {
            type: "ECHLY_AUTH_STATE_UPDATED",
            authenticated: session.authenticated,
            user: session.user ?? null,
          })
          .catch(() => {});
      }
    });
  } catch {}
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

/** Pre-warm session on extension start so first click can open tray instantly. */
chrome.runtime.onStartup.addListener(() => {
  prewarmAuthSession();
});

/** Pre-warm session on install/update so session is ready when user opens dashboard. */
chrome.runtime.onInstalled.addListener(() => {
  prewarmAuthSession();
});

/** When a dashboard tab finishes loading, pre-warm session so it stays warm while dashboard is open. */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;
  try {
    if (DASHBOARD_ORIGINS.includes(new URL(tab.url).origin)) prewarmAuthSession();
  } catch {
    // ignore invalid URLs
  }
});

const ECHLY_LOGIN_BASE = "https://echly-web.vercel.app/login";

/** Extension icon click: always re-check session so login is detected immediately after login. */
chrome.action.onClicked.addListener(async (tab) => {
  const session = await checkBackendSession();
  sessionCache = {
    authenticated: session.authenticated,
    checkedAt: Date.now(),
  };
  if (!session.authenticated) {
    clearAuthState();
    const returnUrl = typeof tab?.url === "string" ? encodeURIComponent(tab.url) : "";
    const loginUrl = returnUrl
      ? `${ECHLY_LOGIN_BASE}?extension=true&returnUrl=${returnUrl}`
      : `${ECHLY_LOGIN_BASE}?extension=true`;
    chrome.tabs.create({ url: loginUrl });
    return;
  }

  globalUIState.visible = !globalUIState.visible;
  if (globalUIState.visible) {
    globalUIState.expanded = false;
  }
  await persistUIState();
  broadcastUIState();
});

chrome.runtime.onMessage.addListener((msg: { type?: string }) => {
  if (msg?.type === "ECHLY_EXTENSION_LOGIN_COMPLETE") {
    refreshExtensionAuth();
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  echlyLog("MESSAGE", "received", request.type);
  if (request.type === "ECHLY_TOGGLE_VISIBILITY") {
    globalUIState.visible = !globalUIState.visible;
    if (globalUIState.visible) {
      globalUIState.expanded = false;
    }
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
      } catch (error) {
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
    chrome.tabs.create({ url: loginUrl });
    sendResponse({ ok: true });
    return false;
  }

  /* Extension relies on dashboard login; in-extension OAuth disabled. Open login page instead. */
  if (request.type === "ECHLY_SIGN_IN" || request.type === "ECHLY_START_LOGIN" || request.type === "LOGIN") {
    const returnUrl = typeof sender.tab?.url === "string" ? encodeURIComponent(sender.tab.url) : "";
    const loginUrl = returnUrl
      ? `${ECHLY_LOGIN_BASE}?extension=true&returnUrl=${returnUrl}`
      : `${ECHLY_LOGIN_BASE}?extension=true`;
    chrome.tabs.create({ url: loginUrl });
    sendResponse({ success: false, error: "Use dashboard login" });
    return false;
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
