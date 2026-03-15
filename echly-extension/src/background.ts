/**
 * Extension background (service worker). Centralizes auth + token handling.
 * Uses backend session: POST /api/extension/session (credentials: include) for extensionToken.
 * Content scripts never hold tokens; all API requests go through background with Bearer token.
 */
import { ECHLY_DEBUG, warn } from "../../lib/utils/logger";
import { echlyLog } from "../../lib/debug/echlyLogger";
import { setExtensionToken, apiFetch } from "../utils/apiFetch";
import { API_BASE, WEB_APP_URL } from "../config";

const LOGIN_URL = `${WEB_APP_URL}/login`;
console.log("ECHLY background script loaded");
if (ECHLY_DEBUG) console.log("[EXTENSION] Using API_BASE:", API_BASE);

chrome.action.onClicked.addListener(() => {
  void openWidgetInActiveTab();
});

type StoredUser = { uid: string; name: string | null; email: string | null; photoURL: string | null };

/** Global message-router API: single source for extension token, user, capture mode (used by message handler). */
const sw = globalThis as typeof globalThis & {
  extensionToken: string | null;
  currentUser: StoredUser | null;
  captureMode: "voice" | "text";
};
sw.extensionToken = null;
sw.currentUser = null;
sw.captureMode = "voice";

let activeSessionId: string | null = null;

/** In-memory extension token from POST /api/extension/session. Cleared on 401. */
let extensionToken: string | null = null;
/** Cached user from last successful session response; used for ECHLY_GET_AUTH_STATE. */
let cachedSessionUser: StoredUser | null = null;

/** Global lock: only one ECHLY_PROCESS_FEEDBACK pipeline at a time to avoid ECONNRESET. */
let aiProcessing = false;

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

        const shouldReloadPointers =
          globalUIState.sessionModeActive === true && activeSessionId != null;

        if (shouldReloadPointers) {
          getValidToken()
            .then(() =>
              apiFetch(
                `${API_BASE}/api/feedback?sessionId=${encodeURIComponent(activeSessionId!)}&limit=200`
              )
            )
            .then((res) => res.json())
            .then((json: { feedback?: Array<{ id: string; title?: string; actionSteps?: string[] }> }) => {
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
 * Fetch extension token from backend. Uses echly_session cookie (credentials: include).
 * On 401 opens dashboard login and throws.
 */
async function getExtensionToken(): Promise<string> {
  console.log("Requesting extension session...");
  const response = await fetch(`${API_BASE}/api/extension/session`, {
    method: "POST",
    credentials: "include",
  });

  if (response.status === 401) {
    extensionToken = null;
    setExtensionToken(null);
    cachedSessionUser = null;
    sw.extensionToken = null;
    sw.currentUser = null;
    chrome.tabs.create({ url: LOGIN_URL });
    throw new Error("NOT_AUTHENTICATED");
  }

  if (!response.ok) {
    throw new Error("Extension session failed");
  }

  const data = (await response.json()) as { extensionToken?: string; user?: { uid?: string; email?: string | null } };
  const token = data.extensionToken;
  console.log("Extension token received", data.extensionToken);
  if (!token) throw new Error("Extension session failed");

  setExtensionToken(token);
  sw.extensionToken = token;

  if (data.user?.uid) {
    cachedSessionUser = {
      uid: data.user.uid,
      name: null,
      email: data.user.email ?? null,
      photoURL: null,
    };
    sw.currentUser = cachedSessionUser;
  }

  return token;
}

/** Returns valid extension token; fetches and caches if missing. Throws NOT_AUTHENTICATED on 401. */
async function getValidToken(): Promise<string> {
  if (extensionToken) return extensionToken;
  extensionToken = await getExtensionToken();
  return extensionToken;
}

/**
 * Lazy auth hydration for popup: ensure currentUser/token are set from dashboard cookie
 * so ECHLY_GET_AUTH_STATE can return authenticated: true without requiring dashboard tab.
 */
async function hydrateAuthState(): Promise<boolean> {
  console.log("[ECHLY] Checking auth state");
  console.log("[ECHLY] currentUser:", sw.currentUser ?? "null");

  if (sw.currentUser && sw.extensionToken) {
    return true;
  }

  try {
    const token = await getValidToken();
    if (token) {
      console.log("[ECHLY] Token fetched:", !!sw.extensionToken);
      return true;
    }
  } catch (err) {
    console.debug("[ECHLY] auth hydration failed", err);
  }

  return false;
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
  } catch {
    // Page may not allow script execution (e.g. chrome://) or script not loaded yet
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

/** Deterministic open: set echlyActive, inject content script if needed, then set visible + expanded and notify active tab (icon click or popup). */
async function openWidgetInActiveTab(): Promise<void> {
  await chrome.storage.local.set({ echlyActive: true });
  globalUIState.visible = true;
  globalUIState.expanded = true;
  broadcastUIState();
  console.log("[ECHLY BG] broadcasted global UI state", globalUIState);
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  const injected = await ensureContentScriptInjected(tab.id);
  if (!injected) {
    console.warn("[ECHLY BG] could not inject into active tab");
    return;
  }
  console.log("[ECHLY BG] sending OPEN_WIDGET to tab", tab.id);
  chrome.tabs.sendMessage(tab.id, { type: "ECHLY_OPEN_WIDGET" }).catch(() => {});
}

/** Loom-style: when user switches tabs and Echly is active, inject content script so widget appears on every tab. */
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const { echlyActive } = await chrome.storage.local.get("echlyActive");
  if (!echlyActive) return;
  try {
    await ensureContentScriptInjected(activeInfo.tabId);
    chrome.tabs
      .sendMessage(activeInfo.tabId, { type: "ECHLY_GLOBAL_STATE", state: globalUIState })
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

/** Loom-style: when a page finishes loading and Echly is active, inject content script so widget appears. */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, _tab) => {
  if (changeInfo.status !== "complete") return;
  const { echlyActive } = await chrome.storage.local.get("echlyActive");
  if (!echlyActive) return;
  try {
    await ensureContentScriptInjected(tabId);
    chrome.tabs.sendMessage(tabId, { type: "ECHLY_GLOBAL_STATE", state: globalUIState }).catch(() => {});
  } catch (e) {
    if (ECHLY_DEBUG) console.debug("ECHLY onUpdated inject failed", tabId, e);
  }
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("[ECHLY] message received:", request.type);
  echlyLog("MESSAGE", "received", request.type);

  if (request.type === "ECHLY_START_SESSION") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "ECHLY_START_SESSION" }).catch(() => {});
      }
    });
    sendResponse({ ok: true });
    return false;
  }

  if (request.type === "ECHLY_OPEN_PREVIOUS_SESSIONS") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "ECHLY_OPEN_PREVIOUS_SESSIONS" }).catch(() => {});
      }
    });
    sendResponse({ ok: true });
    return false;
  }

  if (request.type === "ECHLY_OPEN_WIDGET") {
    console.log("[ECHLY BG] OPEN_WIDGET received");
    openWidgetInActiveTab()
      .then(() => sendResponse({ ok: true }))
      .catch(() => sendResponse({ ok: false }));
    return true; // keep channel open for async sendResponse
  }

  if (request.type === "ECHLY_EXPAND_WIDGET") {
    globalUIState.expanded = true;
    broadcastUIState();
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "ECHLY_WIDGET_EXPAND" }).catch(() => {});
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
        chrome.tabs.sendMessage(tabs[0].id, { type: "ECHLY_WIDGET_COLLAPSE" }).catch(() => {});
      }
    });
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
      sw.captureMode = mode;
      console.log("[ECHLY] capture mode:", mode);
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
        await getValidToken();
        const [feedbackRes, sessionsRes] = await Promise.all([
          apiFetch(`${API_BASE}/api/feedback?sessionId=${encodeURIComponent(sessionId)}&limit=200`),
          apiFetch(`${API_BASE}/api/sessions`),
        ]);
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

  if (request.type === "ECHLY_GET_EXTENSION_TOKEN") {
    (async () => {
      try {
        const token = await getValidToken();
        sw.extensionToken = token;
        sendResponse({ token });
      } catch {
        sendResponse({ token: sw.extensionToken ?? null });
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
    }
    sendResponse({ ok: true });
    return false;
  }

  if (request.type === "ECHLY_GET_AUTH_STATE") {
    (async () => {
      const authenticated = await hydrateAuthState();
      sendResponse({
        authenticated,
        user: sw.currentUser ?? null,
      });
    })();
    return true;
  }

  if (request.type === "ECHLY_OPEN_POPUP") {
    chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") });
    sendResponse({ ok: true });
    return false;
  }

  if (request.type === "ECHLY_SIGN_IN" || request.type === "ECHLY_START_LOGIN" || request.type === "LOGIN") {
    chrome.tabs.create({ url: LOGIN_URL });
    sendResponse({ success: true });
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

        await getValidToken();

        const res = await apiFetch(`${API_BASE}/api/upload-screenshot`, {
          method: "POST",
          body: JSON.stringify({
            screenshotId,
            imageDataUrl,
            sessionId,
          }),
        });

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
    if (aiProcessing) {
      console.warn("[ECHLY] AI already processing, skipping duplicate");
      sendResponse({ success: false, error: "AI already processing" });
      return false;
    }
    aiProcessing = true;

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
      aiProcessing = false;
      warn("[Echly BG] Invalid payload: missing transcript or sessionId", {
        hasTranscript: !!transcript?.trim(),
        hasSessionId: !!sessionId,
      });
      sendResponse({ success: false, error: "Missing transcript or sessionId" });
      return false;
    }
    (async () => {
      try {
        await getValidToken();
        const screenshotUrl: string | null = payload.screenshotUrl ?? null;
        const screenshotId: string | null = payload.screenshotId ?? null;

        console.log("[ECHLY AI] Starting structure step");
        const structurePayload = context ? { transcript, context } : { transcript };
        const structureRes = await apiFetch(`${API_BASE}/api/structure-feedback`, {
          method: "POST",
          body: JSON.stringify(structurePayload),
        });

        if (!structureRes.ok) {
          const raw = await structureRes.text();
          console.error("[STRUCTURE FAILED RAW]", structureRes.status, raw);
          sendResponse({ success: false, error: "Structure fetch failed" });
          return;
        }
        const data = (await structureRes.json()) as {
          success?: boolean;
          tickets?: Array<{
            title?: string;
            description?: string;
            suggestedTags?: string[];
            actionSteps?: string[];
          }>;
          error?: string;
        };
        console.log("[ECHLY AI] structure parsed:", data);
        if (!data || typeof data !== "object") {
          console.error("[ECHLY AI] Invalid structure response", data);
          sendResponse({ success: false, error: "Invalid AI response" });
          return;
        }
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

          console.log("[ECHLY AI] Creating feedback ticket");
          const feedbackRes = await apiFetch(`${API_BASE}/api/feedback`, {
            method: "POST",
            body: JSON.stringify(body),
          });
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
          console.log("[ECHLY AI] Ticket created successfully");
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
      } finally {
        aiProcessing = false;
      }
    })();
    return true;
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
        await getValidToken();
        console.log("API request using extension token");
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
          headers: {},
          body: isAuth ? "Not authenticated" : message,
        });
      }
    })();
    return true;
  }

  return false;
});
