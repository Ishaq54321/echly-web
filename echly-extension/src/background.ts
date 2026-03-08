/**
 * Extension background (service worker). Centralizes auth + token handling.
 * Content scripts request tokens and auth state via messages.
 */
import { firebaseConfig } from "../../lib/firebase/config";
import { warn } from "../../lib/utils/logger";
import { echlyLog } from "../../lib/debug/echlyLogger";

const API_BASE = "http://localhost:3000";
console.log("[EXTENSION] Using API_BASE:", API_BASE);
const IDP_API_KEY = firebaseConfig.apiKey;

let activeSessionId: string | null = null;

type StoredUser = { uid: string; name: string | null; email: string | null; photoURL: string | null };
type TokenState = {
  idToken: string | null;
  refreshToken: string | null;
  /** Epoch ms when token expires (best-effort). */
  expiresAtMs: number;
  user: StoredUser | null;
};

let tokenState: TokenState = {
  idToken: null,
  refreshToken: null,
  expiresAtMs: 0,
  user: null,
};

/** Minimal ticket shape for global tray; matches StructuredFeedback. */
type StructuredFeedback = { id: string; title: string; actionSteps: string[]; type?: string };

let globalUIState: {
  visible: boolean;
  expanded: boolean;
  isRecording: boolean;
  sessionId: string | null;
  sessionModeActive: boolean;
  sessionPaused: boolean;
  pointers: StructuredFeedback[];
} = {
  visible: false,
  expanded: false,
  isRecording: false,
  sessionId: null,
  sessionModeActive: false,
  sessionPaused: false,
  pointers: [],
};

function persistSessionLifecycleState(): void {
  chrome.storage.local.set({
    activeSessionId,
    sessionModeActive: globalUIState.sessionModeActive,
    sessionPaused: globalUIState.sessionPaused,
  });
}

chrome.storage.local.get(
  ["activeSessionId"],
  (result: { activeSessionId?: string }) => {
    const stored = result.activeSessionId;
    activeSessionId = typeof stored === "string" ? stored : null;
    globalUIState.sessionId = activeSessionId;
    globalUIState.sessionModeActive = false;
    globalUIState.sessionPaused = false;
    broadcastUIState();
  }
);

type StoredAuthResult = {
  auth_idToken?: string;
  auth_refreshToken?: string;
  auth_expiresAtMs?: number;
  auth_user?: unknown;
};
function isStoredUser(v: unknown): v is StoredUser {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.uid === "string" &&
    (o.name === null || typeof o.name === "string") &&
    (o.email === null || typeof o.email === "string") &&
    (o.photoURL === null || typeof o.photoURL === "string")
  );
}
chrome.storage.local.get(
  ["auth_idToken", "auth_refreshToken", "auth_expiresAtMs", "auth_user"],
  (result: StoredAuthResult) => {
    tokenState.idToken = typeof result.auth_idToken === "string" ? result.auth_idToken : null;
    tokenState.refreshToken = typeof result.auth_refreshToken === "string" ? result.auth_refreshToken : null;
    tokenState.expiresAtMs = typeof result.auth_expiresAtMs === "number" ? result.auth_expiresAtMs : 0;
    tokenState.user = isStoredUser(result.auth_user) ? result.auth_user : null;
  }
);

function setTokenState(next: Partial<TokenState>): void {
  tokenState = { ...tokenState, ...next };
  chrome.storage.local.set({
    auth_idToken: tokenState.idToken,
    auth_refreshToken: tokenState.refreshToken,
    auth_expiresAtMs: tokenState.expiresAtMs,
    auth_user: tokenState.user,
  });
}

function parseHashParam(urlStr: string, key: string): string | null {
  try {
    const u = new URL(urlStr);
    const hash = u.hash.startsWith("#") ? u.hash.slice(1) : u.hash;
    const params = new URLSearchParams(hash);
    return params.get(key);
  } catch {
    return null;
  }
}

async function exchangeGoogleIdToken(googleIdToken: string): Promise<{
  idToken: string;
  refreshToken: string;
  expiresInSec: number;
  user: StoredUser;
}> {
  const body = {
    postBody: `id_token=${encodeURIComponent(googleIdToken)}&providerId=google.com`,
    requestUri: "http://localhost",
    returnIdpCredential: true,
    returnSecureToken: true,
  };
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${IDP_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const raw = await res.text();
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status} ${raw}`);
  const data = JSON.parse(raw) as {
    idToken?: string;
    refreshToken?: string;
    expiresIn?: string;
    localId?: string;
    displayName?: string;
    email?: string;
    photoUrl?: string;
  };
  if (!data.idToken || !data.refreshToken || !data.localId) throw new Error(`Token exchange missing fields: ${raw}`);
  const expiresInSec = Number.parseInt(data.expiresIn ?? "3600", 10);
  return {
    idToken: data.idToken,
    refreshToken: data.refreshToken,
    expiresInSec: Number.isFinite(expiresInSec) ? expiresInSec : 3600,
    user: {
      uid: data.localId,
      name: data.displayName ?? null,
      email: data.email ?? null,
      photoURL: data.photoUrl ?? null,
    },
  };
}

async function refreshIdToken(refreshToken: string): Promise<{ idToken: string; refreshToken: string; expiresInSec: number }> {
  const body = new URLSearchParams();
  body.set("grant_type", "refresh_token");
  body.set("refresh_token", refreshToken);
  const res = await fetch(`https://securetoken.googleapis.com/v1/token?key=${IDP_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const raw = await res.text();
  if (!res.ok) throw new Error(`Token refresh failed: ${res.status} ${raw}`);
  const data = JSON.parse(raw) as { id_token?: string; refresh_token?: string; expires_in?: string };
  if (!data.id_token || !data.refresh_token) throw new Error(`Token refresh missing fields: ${raw}`);
  const expiresInSec = Number.parseInt(data.expires_in ?? "3600", 10);
  return {
    idToken: data.id_token,
    refreshToken: data.refresh_token,
    expiresInSec: Number.isFinite(expiresInSec) ? expiresInSec : 3600,
  };
}

async function getValidToken(): Promise<string> {
  const now = Date.now();
  // Small skew so we don't race expiry.
  if (tokenState.idToken && now < tokenState.expiresAtMs - 30_000) return tokenState.idToken;
  if (!tokenState.refreshToken) throw new Error("NOT_AUTHENTICATED");
  const refreshed = await refreshIdToken(tokenState.refreshToken);
  setTokenState({
    idToken: refreshed.idToken,
    refreshToken: refreshed.refreshToken,
    expiresAtMs: Date.now() + refreshed.expiresInSec * 1000,
  });
  return refreshed.idToken;
}

function broadcastUIState(): void {
  echlyLog("BACKGROUND", "broadcast global state", globalUIState);
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id) {
        chrome.tabs
          .sendMessage(tab.id, { type: "ECHLY_GLOBAL_STATE", state: globalUIState })
          .catch(() => {
            console.debug("ECHLY broadcast skipped tab", tab.id);
          });
      }
    });
  });
}

/** When user switches tabs, push current session state to that tab so every tab receives state when focused. */
chrome.tabs.onActivated.addListener((activeInfo) => {
  const tabId = activeInfo.tabId;
  chrome.tabs
    .sendMessage(tabId, { type: "ECHLY_GLOBAL_STATE", state: globalUIState })
    .catch((e) => {
      console.debug("ECHLY tab activation sync failed", e);
    });
  chrome.tabs
    .sendMessage(tabId, { type: "ECHLY_SESSION_STATE_SYNC" })
    .catch((e) => {
      console.debug("ECHLY session state sync failed for tab", tabId, e);
    });
});

/** When a new tab is created, push current session state. Fails silently if content script not yet injected. */
chrome.tabs.onCreated.addListener((tab) => {
  if (!tab.id) return;
  chrome.tabs
    .sendMessage(tab.id, { type: "ECHLY_GLOBAL_STATE", state: globalUIState })
    .catch((e) => {
      console.debug("ECHLY tab creation sync failed", e);
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  echlyLog("MESSAGE", "received", request.type);
  if (request.type === "ECHLY_TOGGLE_VISIBILITY") {
    globalUIState.visible = !globalUIState.visible;
    if (globalUIState.visible) {
      globalUIState.expanded = false;
      // Only reset UI lifecycle state; preserve last session id so Resume works.
      globalUIState.sessionModeActive = false;
      globalUIState.sessionPaused = false;
      persistSessionLifecycleState();
      // Reset widget in all tabs so they show command screen.
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { type: "ECHLY_RESET_WIDGET" }).catch(() => {});
          }
        });
      });
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

  if (request.type === "ECHLY_GET_ACTIVE_SESSION") {
    chrome.storage.local.get(["activeSessionId"], (result) => {
      sendResponse({
        sessionId: result.activeSessionId || null,
      });
    });
    return true;
  }

  if (request.type === "ECHLY_SET_ACTIVE_SESSION") {
    const sessionId = (request as { sessionId?: string }).sessionId ?? null;
    activeSessionId = sessionId;
    globalUIState.sessionId = sessionId;
    globalUIState.sessionModeActive = true;
    globalUIState.sessionPaused = false;
    chrome.storage.local.set({
      activeSessionId: sessionId,
      sessionModeActive: true,
      sessionPaused: false,
    });
    (async () => {
      if (!sessionId) {
        globalUIState.pointers = [];
        broadcastUIState();
        sendResponse({ success: true });
        return;
      }
      try {
        const token = await getValidToken();
        const res = await fetch(`${API_BASE}/api/feedback?sessionId=${encodeURIComponent(sessionId)}&limit=200`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = (await res.json()) as { feedback?: Array<{ id: string; title?: string; actionSteps?: string[] }> };
        globalUIState.pointers = (json.feedback ?? []).map((f) => ({
          id: f.id,
          title: f.title ?? "",
          actionSteps: f.actionSteps ?? [],
        }));
      } catch {
        globalUIState.pointers = [];
      }
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
    persistSessionLifecycleState();
    broadcastUIState();
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
    sendResponse({ ok: true });
    return false;
  }

  if (request.type === "ECHLY_SESSION_MODE_END") {
    echlyLog("BACKGROUND", "session end broadcast");
    activeSessionId = null;
    globalUIState.sessionId = null;
    globalUIState.sessionModeActive = false;
    globalUIState.sessionPaused = false;
    globalUIState.pointers = [];
    chrome.storage.local.set({
      activeSessionId: null,
      sessionModeActive: false,
      sessionPaused: false,
    });
    broadcastUIState();
    setTimeout(broadcastUIState, 150);
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
    sendResponse({
      authenticated: !!tokenState.refreshToken,
      user: tokenState.user,
    });
    return true;
  }

  if (request.type === "ECHLY_OPEN_POPUP") {
    chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") });
    sendResponse({ ok: true });
    return false;
  }

  if (request.type === "ECHLY_SIGN_IN" || request.type === "ECHLY_START_LOGIN" || request.type === "LOGIN") {
    const redirectUri = chrome.identity.getRedirectURL();
    const webClientId = "609478020649-0k5ec22m3lvgmcs2icsc6pmabndu85td.apps.googleusercontent.com";
    const authUrl =
      "https://accounts.google.com/o/oauth2/v2/auth" +
      `?client_id=${encodeURIComponent(webClientId)}` +
      "&response_type=id_token" +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      "&scope=openid%20email%20profile" +
      `&nonce=${encodeURIComponent(crypto.randomUUID())}`;

    chrome.identity.launchWebAuthFlow(
      { url: authUrl, interactive: true },
      async (responseUrl?: string) => {
        if (chrome.runtime.lastError || !responseUrl) {
          sendResponse({
            success: false,
            error: chrome.runtime.lastError?.message ?? "Auth flow failed",
          });
          return;
        }
        try {
          const googleIdToken = parseHashParam(responseUrl, "id_token");
          if (!googleIdToken) {
            sendResponse({ success: false, error: "No ID token in response" });
            return;
          }
          const exchanged = await exchangeGoogleIdToken(googleIdToken);
          setTokenState({
            idToken: exchanged.idToken,
            refreshToken: exchanged.refreshToken,
            expiresAtMs: Date.now() + exchanged.expiresInSec * 1000,
            user: exchanged.user,
          });
          sendResponse({
            success: true,
            user: exchanged.user,
          });
        } catch (err) {
          sendResponse({ success: false, error: String(err) });
        }
      }
    );
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
