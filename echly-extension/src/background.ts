/**
 * Extension background (service worker). Centralizes auth + token handling.
 * Content scripts request tokens and auth state via messages.
 */
const API_BASE = "https://echly-web.vercel.app";
const IDP_API_KEY = "AIzaSyBgQxRYAksD35D6m1OEPjSnfiOLxUABqnM";

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

let globalUIState: {
  visible: boolean;
  expanded: boolean;
  isRecording: boolean;
  sessionId: string | null;
} = {
  visible: false,
  expanded: false,
  isRecording: false,
  sessionId: null,
};

chrome.storage.local.get(["activeSessionId"], (result) => {
  activeSessionId = result.activeSessionId ?? null;
  globalUIState.sessionId = activeSessionId;
});

chrome.storage.local.get(["auth_idToken", "auth_refreshToken", "auth_expiresAtMs", "auth_user"], (result) => {
  tokenState.idToken = typeof result.auth_idToken === "string" ? result.auth_idToken : null;
  tokenState.refreshToken = typeof result.auth_refreshToken === "string" ? result.auth_refreshToken : null;
  tokenState.expiresAtMs = typeof result.auth_expiresAtMs === "number" ? result.auth_expiresAtMs : 0;
  tokenState.user = (result.auth_user as StoredUser | undefined) ?? null;
});

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
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { type: "ECHLY_GLOBAL_STATE", state: globalUIState }).catch(() => {});
      }
    });
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "ECHLY_TOGGLE_VISIBILITY") {
    globalUIState.visible = !globalUIState.visible;
    broadcastUIState();
    sendResponse({ ok: true });
    return false;
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
    sendResponse(globalUIState);
    return true;
  }

  if (request.type === "ECHLY_GET_STATE") {
    sendResponse({
      echlyEnabled: globalUIState.visible,
      isRecording: globalUIState.isRecording,
      sessionId: globalUIState.sessionId,
    });
    return true;
  }

  if (request.type === "ECHLY_SET_ACTIVE_SESSION") {
    activeSessionId = (request.sessionId as string | undefined) ?? null;
    globalUIState.sessionId = activeSessionId;
    chrome.storage.local.set({ activeSessionId });
    broadcastUIState();
    sendResponse({ ok: true });
    return false;
  }

  if (request.type === "ECHLY_GET_ACTIVE_SESSION") {
    sendResponse({ sessionId: activeSessionId });
    return true;
  }

  if (request.type === "ECHLY_GET_TOKEN") {
    getValidToken()
      .then((token) => sendResponse({ token }))
      .catch(() => sendResponse({ error: "NOT_AUTHENTICATED" }));
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
    chrome.tabs.captureVisibleTab(
      sender.tab!.windowId,
      { format: "png" },
      (dataUrl) => {
        if (chrome.runtime.lastError) {
          sendResponse({ success: false });
          return;
        }
        sendResponse({ success: true, image: dataUrl });
      }
    );
    return true;
  }

  if (request.type === "ECHLY_PROCESS_FEEDBACK") {
    const payload = request.payload as {
      transcript: string;
      screenshot: string | null;
      sessionId: string;
      context?: {
        url?: string;
        viewportWidth?: number;
        viewportHeight?: number;
        domPath?: string | null;
        nearbyText?: string | null;
      } | null;
    };
    const { transcript, sessionId, context } = payload;
    if (!sessionId) {
      console.error("[ECHLY_PROCESS_FEEDBACK] sessionId is null/empty:", sessionId);
    }
    if (!transcript?.trim() || !sessionId) {
      console.warn("[Echly BG] Invalid payload: missing transcript or sessionId", {
        hasTranscript: !!transcript?.trim(),
        hasSessionId: !!sessionId,
      });
      sendResponse({ success: false, error: "Missing transcript or sessionId" });
      return true;
    }
    function normalizePriority(s: string | undefined): "low" | "medium" | "high" | "critical" {
      const v = (s ?? "medium").toLowerCase();
      if (v === "low" || v === "medium" || v === "high" || v === "critical") return v;
      return "medium";
    }
    (async () => {
      try {
        const token = await getValidToken();
        const screenshot = payload.screenshot ?? null;
        if (screenshot) {
          // Screenshot upload is intentionally disabled in the service worker to avoid SDK/XHR usage.
          console.warn("[ECHLY_PROCESS_FEEDBACK] screenshot provided but upload is disabled in background");
        }

        const structurePayload = context ? { transcript, context } : { transcript };
        const structurePromise = fetch(`${API_BASE}/api/structure-feedback`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(structurePayload),
        });
        const [structureRes] = await Promise.all([structurePromise]);
        const screenshotUrl: string | null = null;

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
            contextSummary?: string;
            suggestedTags?: string[];
            actionItems?: string[];
            impact?: string | null;
            suggestedPriority?: string;
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
            contextSummary: transcript,
            actionItems: [],
            impact: null,
            suggestedPriority: "medium",
            suggestedTags: ["Feedback"],
          });
        }

        let firstCreated: { id: string; title: string; description: string; type: string } | undefined;
        for (let i = 0; i < tickets.length; i++) {
          const t = tickets[i];
          const body = {
            sessionId,
            title: t.title ?? "",
            description: t.contextSummary ?? t.title ?? "",
            type: Array.isArray(t.suggestedTags) && t.suggestedTags[0] ? t.suggestedTags[0] : "Feedback",
            contextSummary: t.contextSummary ?? null,
            actionItems: t.actionItems ?? [],
            impact: t.impact ?? null,
            suggestedTags: t.suggestedTags,
            priority: normalizePriority(t.suggestedPriority),
            screenshotUrl: i === 0 ? screenshotUrl : null,
            metadata: { clientTimestamp: Date.now() },
          };

          console.log("[CREATE] Using sessionId:", sessionId);
          console.log("[CREATE] Sending body:", body);
          const feedbackRes = await fetch(`${API_BASE}/api/feedback`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(body),
          });
          console.log("[CREATE] Status:", feedbackRes.status);
          const raw = await feedbackRes.text();
          console.log("[CREATE] Raw response:", raw);

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
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[Echly BG] Processing error:", err);
        sendResponse({ success: false, error: message });
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
    const doFetch = (resolvedToken: string | undefined) => {
      const h = { ...headers };
      if (resolvedToken) h["Authorization"] = `Bearer ${resolvedToken}`;
      fetch(url, {
        method: method || "GET",
        headers: h,
        body: body ?? undefined,
      })
        .then(async (res) => {
          const text = await res.text();
          const out: Record<string, string> = {};
          res.headers.forEach((v, k) => {
            out[k] = v;
          });
          sendResponse({ ok: res.ok, status: res.status, headers: out, body: text });
        })
        .catch((err) => {
          sendResponse({ ok: false, status: 0, headers: {}, body: String(err?.message ?? err) });
        });
    };
    if (token) {
      doFetch(token);
    } else {
      getValidToken()
        .then(doFetch)
        .catch(() => sendResponse({ ok: false, status: 401, headers: {}, body: "Not authenticated" }));
    }
    return true;
  }

  return false;
});
