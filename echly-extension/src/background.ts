/**
 * Extension background (service worker). Centralizes Firebase Auth and token handling.
 * Content scripts do not use Firebase; they request tokens and auth state via messages.
 */
import { initializeApp } from "firebase/app";
import { getAuth, signInWithCredential, GoogleAuthProvider } from "firebase/auth/web-extension";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBgQxRYAksD35D6m1OEPjSnfiOLxUABqnM",
  authDomain: "echly-b74cc.firebaseapp.com",
  projectId: "echly-b74cc",
  storageBucket: "echly-b74cc.firebasestorage.app",
  messagingSenderId: "609478020649",
  appId: "1:609478020649:web:54cd1ab0dc2b8277131638",
  measurementId: "G-Q0C7DP8QVR",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

let activeSessionId: string | null = null;

async function uploadScreenshotToStorage(
  imageDataUrl: string,
  sessionId: string,
  feedbackId: string
): Promise<string> {
  const path = `sessions/${sessionId}/feedback/${feedbackId}/${Date.now()}.png`;
  const storageRef = ref(storage, path);
  await uploadString(storageRef, imageDataUrl, "data_url", { contentType: "image/png" });
  return getDownloadURL(storageRef);
}

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

let cachedToken: string | null = null;

chrome.storage.local.get(["activeSessionId"], (result) => {
  activeSessionId = result.activeSessionId ?? null;
  globalUIState.sessionId = activeSessionId;
});
let tokenExpiry = 0;

async function getValidToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry) {
    return cachedToken;
  }
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not signed in");
  }
  const token = await user.getIdToken();
  cachedToken = token;
  tokenExpiry = now + 50 * 60 * 1000; // 50 minutes
  return token;
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
    const user = auth.currentUser;
    sendResponse({
      authenticated: !!user,
      user: user
        ? {
            uid: user.uid,
            name: user.displayName ?? null,
            email: user.email ?? null,
            photoURL: user.photoURL ?? null,
          }
        : null,
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
          const url = new URL(responseUrl);
          const idToken =
            url.hash
              .substring(1)
              .split("&")
              .find((p) => p.startsWith("id_token="))
              ?.split("=")[1] ?? null;
          if (!idToken) {
            sendResponse({ success: false, error: "No ID token in response" });
            return;
          }
          const credential = GoogleAuthProvider.credential(idToken);
          const result = await signInWithCredential(auth, credential);
          cachedToken = null;
          tokenExpiry = 0;
          sendResponse({
            success: true,
            user: {
              uid: result.user.uid,
              name: result.user.displayName ?? null,
              email: result.user.email ?? null,
              photoURL: result.user.photoURL ?? null,
            },
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
    const API_BASE = "https://echly-web.vercel.app";
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
        const feedbackId = crypto.randomUUID();

        const structurePayload = context ? { transcript, context } : { transcript };
        const structurePromise = fetch(`${API_BASE}/api/structure-feedback`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(structurePayload),
        });
        const screenshotPromise = screenshot
          ? uploadScreenshotToStorage(screenshot, sessionId, feedbackId)
          : Promise.resolve<string | null>(null);

        const [structureRes, screenshotUrl] = await Promise.all([structurePromise, screenshotPromise]);

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
          const feedbackRes = await fetch(`${API_BASE}/api/feedback`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(body),
          });
          const feedbackText = await feedbackRes.text();
          if (!feedbackRes.ok) {
            console.error("[FEEDBACK FAILED RAW]", feedbackRes.status, feedbackText);
            sendResponse({ success: false, error: "Feedback fetch failed" });
            return;
          }
          const feedbackJson = JSON.parse(feedbackText) as {
            success?: boolean;
            ticket?: { id: string; title: string; description: string; type?: string };
          };
          if (feedbackJson.success && feedbackJson.ticket) {
            const tick = feedbackJson.ticket;
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
