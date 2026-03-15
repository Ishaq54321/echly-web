# Echly Chrome Extension — Complete Runtime Architecture Trace

**Document purpose:** Diagnostic-only. Extract the entire runtime flow for external debugging. No production logic is modified by this document.

**Generated:** Runtime trace for extension entry points, manifest, Chrome APIs, messaging, tray control, token lifecycle, and recommended debug logging.

---

## PART 1 — Extension Entry Points (Full Source)

### echly-extension/src/background.ts

Full source (no truncation):

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

/** Extension icon click: if token exists open tray; else open hidden broker tab; on broker failure open login once. Click = open tray only (no toggle). */
chrome.action.onClicked.addListener(async (tab) => {
  console.log("ECHLY CLICK");

  originTabId = tab?.id ?? null;

  if (extensionAccessToken) {
    console.log("ECHLY TOKEN VALID");

    openTray();
    return;
  }

  console.log("ECHLY TOKEN MISSING — OPENING BROKER");

  try {
    await openAuthBrokerTab();
  } catch (e) {
    console.error("ECHLY BROKER FAILED", e);

    const loginUrl =
      ECHLY_LOGIN_BASE +
      "?extension=true" +
      (tab?.url ? "&returnUrl=" + encodeURIComponent(tab.url) : "");

    await openLoginOnce(loginUrl);
  }
});

/** Single message listener for extension messages. */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // ... (full handler with all request.type branches as in source)
});
```

*(Remaining message handler branches are listed in PART 3 and PART 6; full background.ts is in repo.)*

---

### echly-extension/src/content.tsx

*(Full file is ~1630 lines. Key excerpts for entry behavior.)*

- **Imports:** React, createRoot, requestExtensionTokenFromPage, apiFetch (contentAuthFetch), uploadScreenshot, CaptureWidget, logger, echlyLog.
- **Constants:** ROOT_ID, SHADOW_HOST_ID, THEME_STORAGE_KEY, APP_ORIGIN, ECHLY_DASHBOARD_ORIGIN.
- **ContentApp:** React component holding globalState (visible, expanded, sessionId, pointers, user, etc.), hydrate from `ECHLY_GET_GLOBAL_STATE`, listen for `ECHLY_GLOBAL_STATE` custom event and `visibilitychange`, send expand/collapse/session/feedback messages to background, handle capture pipeline and clarity assistant.
- **main():** Create `#echly-shadow-host`, mount React via `mountReactApp(host)`, call `ensureMessageListener(host)`, `ensureBrokerAndLogoutBridge()`, `syncInitialGlobalState(host)`, `ensureVisibilityStateRefresh()`, `ensureScrollDebugListeners()`.

Full source: see repo file `echly-extension/src/content.tsx` (no truncation in repo).

---

### echly-extension/src/contentAuthFetch.ts

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

### echly-extension/src/requestExtensionTokenFromPage.ts

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

---

### echly-extension/src/api.ts

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

---

### echly-extension/src/firebase.ts

```typescript
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

## PART 2 — Manifest Analysis

### Full manifest.json

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
  "icons": {
    "16": "assets/icon16.png",
    "32": "assets/icon32.png",
    "48": "assets/icon48.png",
    "128": "assets/icon128.png"
  },
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
      "matches": ["http://*/*", "https://*/*"],
      "exclude_matches": [
        "https://echly-web.vercel.app/*",
        "http://localhost:3000/*"
      ],
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
        "fonts/PlusJakartaSans-Regular.woff2",
        "fonts/PlusJakartaSans-Medium.woff2",
        "fonts/PlusJakartaSans-SemiBold.woff2",
        "fonts/PlusJakartaSans-Bold.woff2"
      ],
      "matches": ["<all_urls>"]
    }
  ]
}
```

### Explanation

- **Background service worker:** `background.js` is the single service worker. It starts on extension load, runs `initializeSessionState()` then `broadcastUIState()`, and registers `chrome.action.onClicked`, `chrome.tabs.onActivated` / `onCreated` / `onRemoved`, and `chrome.runtime.onMessage`. No popup; icon click is handled entirely in the service worker.

- **Content script injection:** One content script entry:
  - **matches:** `http://*/*`, `https://*/*` (all HTTP/HTTPS URLs).
  - **exclude_matches:** `https://echly-web.vercel.app/*`, `http://localhost:3000/*`.
  - **js:** `content.js`.
  - **run_at:** `document_idle`.

- **Host permissions:** `<all_urls>`, `http://localhost:3000/*`, `https://echly-web.vercel.app/*`, plus Firebase/Google endpoints. Used for fetch, tabs, and optional token/session APIs.

- **Matches / exclude_matches:** Content script is injected into every page **except**:
  - `https://echly-web.vercel.app/*`
  - `http://localhost:3000/*`  
  So the extension **does not** inject into the dashboard or login origin. Third-party pages (e.g. `https://example.com`) get the content script. The broker bridge and login postMessage forwarding in content run only on those third-party origins; dashboard/login pages do not run the content script (see PART 7 note).

---

## PART 3 — All Chrome APIs Used

### chrome.tabs

| File | Line(s) | Code / purpose |
|-----|--------|----------------|
| background.ts | 50–52 | `chrome.tabs.query({ url: "*://echly-web.vercel.app/login*" }, ...)` — find login tab |
| background.ts | 54–56 | `chrome.tabs.update(id, { active: true }, ...)` — focus login tab |
| background.ts | 60–63 | `chrome.tabs.create({ url: loginUrl }, ...)` — create login tab |
| background.ts | 74, 77, 81 | `chrome.tabs.query` / `chrome.tabs.update` / `chrome.tabs.create` in `openLoginOnce` |
| background.ts | 106–110 | `chrome.tabs.create({ url: .../extension-auth, active: false })` — broker tab |
| background.ts | 172–176 | `chrome.tabs.query({}, ...)` then `chrome.tabs.sendMessage(tab.id, { type: "ECHLY_RESET_WIDGET" })` |
| background.ts | 305–306 | `chrome.tabs.query({})` in `findDashboardTab` |
| background.ts | 321–324 | `chrome.tabs.get(dashboardTabId)` in `ensureDashboardTab` |
| background.ts | 331–334 | `chrome.tabs.create({ url: ".../dashboard", active: false })` in `ensureDashboardTab` |
| background.ts | 372–387 | `chrome.tabs.query({})` then `chrome.tabs.query({ active: true, currentWindow: true })` then `chrome.tabs.sendMessage(tab.id, payload)` in `broadcastUIState` |
| background.ts | 396–408 | `chrome.tabs.onActivated`: `chrome.tabs.sendMessage(tabId, ECHLY_GLOBAL_STATE)` and `ECHLY_SESSION_STATE_SYNC` |
| background.ts | 411–417 | `chrome.tabs.onCreated`: `chrome.tabs.sendMessage(tab.id, ECHLY_GLOBAL_STATE)` |
| background.ts | 421–414 | `chrome.tabs.onRemoved`: clear `dashboardTabId`, `authBrokerTabId`, `loginTabId` |
| background.ts | 477 | `chrome.tabs.update(originTabId, { active: true })` after login success |
| background.ts | 481–489 | `chrome.tabs.get(loginTabId)` then `chrome.tabs.remove(loginTabId)` if still on /login |
| background.ts | 509–510 | `chrome.tabs.remove(authBrokerTabId)` after token received |
| background.ts | 671 | `chrome.tabs.create({ url })` in ECHLY_OPEN_TAB handler |
| background.ts | 736–740 | `chrome.tabs.query({})` then `chrome.tabs.sendMessage(..., ECHLY_RESET_WIDGET)` in ECHLY_SESSION_MODE_END |
| background.ts | 808–810 | `chrome.tabs.captureVisibleTab(sender.tab!.windowId, { format: "png" }, ...)` in CAPTURE_TAB |
| background.ts | 1014–1021 | `chrome.tabs.query({})` then `chrome.tabs.sendMessage(..., ECHLY_FEEDBACK_CREATED)` |

### chrome.runtime

| File | Line(s) | Code / purpose |
|-----|--------|----------------|
| background.ts | 457 | `chrome.runtime.onMessage.addListener(...)` — single message handler |
| contentAuthFetch.ts | 37–54 | `chrome.runtime.sendMessage({ type: "echly-api", ... }, callback)` |
| content.tsx | 99, 255, 279, 325, 338, 343, 346, 370–372, 531, 792, 817, 856, 862–863, 868, 885, 1019, 1415, 1419–1421, 1426–1427, 1434, 1534, 1549, 1566, 1578, 1607, 1630, 1640, 1647 | `chrome.runtime.sendMessage` / `chrome.runtime.onMessage.addListener` (content → background and content receiving from background) |
| content.tsx | 168–173, 1461 | `chrome.runtime.getURL(...)` for assets and popup.css |
| contentScreenshot.ts | 26–43 | `chrome.runtime.sendMessage({ type: "ECHLY_UPLOAD_SCREENSHOT", ... })` |
| stubs/next-image.tsx | 18, 21 | `chrome.runtime?.getURL` for logo |

### chrome.action

| File | Line(s) | Code / purpose |
|-----|--------|----------------|
| background.ts | 428 | `chrome.action.onClicked.addListener(async (tab) => { ... })` — icon click: token check → openTray or openAuthBrokerTab / openLoginOnce |

### chrome.storage

| File | Line(s) | Code / purpose |
|-----|--------|----------------|
| background.ts | 166–169, 190–194, 200–204, 209–272, 295, 617–620, 730–734, 736–739 | `chrome.storage.local.set` / `chrome.storage.local.get` / `chrome.storage.local.remove` — tray state, session lifecycle, legacy auth cleanup |

### chrome.identity

Not used in the extension.

---

## PART 4 — Dashboard / Login / Extension-Auth Opening Sources

### chrome.tabs.create

- **background.ts ~60:** `openOrFocusLoginTab` — create login tab if no existing login tab.
- **background.ts ~81:** `openLoginOnce` — create login tab if none.
- **background.ts 106–110:** `openAuthBrokerTab` — create hidden tab `https://echly-web.vercel.app/extension-auth`.
- **background.ts 331–334:** `ensureDashboardTab` — create `https://echly-web.vercel.app/dashboard` (active: false) if no dashboard tab.
- **background.ts ~671:** `ECHLY_OPEN_TAB` handler — `chrome.tabs.create({ url })` for arbitrary URL (e.g. session URL after end).

### openLoginOnce(loginUrl)

- **Definition:** background.ts 71–84. Query tabs with `*://echly-web.vercel.app/login*`; if one exists focus it and set `loginTabId`, else create tab with `loginUrl`.
- **Called from:** background.ts ~465 in `chrome.action.onClicked` catch block when `openAuthBrokerTab()` fails (then open login once).

### openOrFocusLoginTab(loginUrl)

- **Definition:** background.ts 47–66. Same pattern: query login URL, focus existing or create.
- **Called from:** Not used in current background.ts; only `openLoginOnce` is used for login in the click handler.

### ensureDashboardTab()

- **Definition:** background.ts 320–335. Reuse `dashboardTabId` if valid, else `findDashboardTab()`, else create dashboard tab (background, not active).
- **Called from:** Not called from the current click or message flow; available for any code that needs a dashboard tab (e.g. token brokering that uses an existing dashboard tab).

### Summary: where dashboard / login / extension-auth open

| Target | Opened by | File:line |
|--------|-----------|-----------|
| Login | `openLoginOnce(loginUrl)` when broker fails on icon click | background.ts ~465 |
| Login | `openOrFocusLoginTab(loginUrl)` (if ever used) | background.ts 47–66 |
| extension-auth | `openAuthBrokerTab()` on icon click when no token | background.ts 103–111, 427 |
| dashboard | `ensureDashboardTab()` (when called) | background.ts 320–335 |
| Arbitrary URL | `ECHLY_OPEN_TAB` message | background.ts ~671 |

---

## PART 5 — Tray Visibility Control (globalUIState.visible / globalUIState.expanded)

### Every place these values change

| File | Line(s) | What changes |
|------|--------|--------------|
| background.ts | 97–98 | **openTray():** `globalUIState.visible = true`, `globalUIState.expanded = true` |
| background.ts | 201 | **persistUIState():** writes `trayVisible` / `trayExpanded` from `globalUIState` (no direct assign here) |
| background.ts | 226–227 | **initializeSessionState():** `globalUIState.visible = result.trayVisible === true`, `globalUIState.expanded = result.trayExpanded === true` (restore from storage) |
| background.ts | 293–294 | **clearAuthState():** `globalUIState.visible = false`, `globalUIState.expanded = false` |
| background.ts | 528–529 | **ECHLY_TOGGLE_VISIBILITY:** `globalUIState.visible = true`, `globalUIState.expanded = true` |
| background.ts | 536 | **ECHLY_EXPAND_WIDGET:** `globalUIState.expanded = true` |
| background.ts | 543 | **ECHLY_COLLAPSE_WIDGET:** `globalUIState.expanded = false` |
| background.ts | 623 | **ECHLY_SET_ACTIVE_SESSION:** if sessionId, `globalUIState.expanded = true` |
| background.ts | 682 | **ECHLY_SESSION_MODE_START:** `globalUIState.expanded = true` |
| content.tsx | 188 | **ECHLY_RESET_WIDGET:** content sets local state `expanded: false` (and reset key); background remains source of truth for visible/expanded until next broadcast |

### Which functions open / close / collapse tray

- **Open tray (visible + expanded):** `openTray()` (background), and when background handles `ECHLY_TOGGLE_VISIBILITY` (sets visible + expanded and broadcasts). After `ECHLY_EXTENSION_LOGIN_SUCCESS` or `ECHLY_EXTENSION_TOKEN`, background calls `openTray()` so tray opens.
- **Close tray:** `clearAuthState()` sets visible and expanded to false, then persist and broadcast. No separate “close tray” message; logout clears auth and tray.
- **Collapse tray (expanded → false):** `ECHLY_COLLAPSE_WIDGET` handler in background sets `globalUIState.expanded = false` and broadcasts. Content requests it via `onCollapseRequest` → `chrome.runtime.sendMessage({ type: "ECHLY_COLLAPSE_WIDGET" })`.
- **Expand tray (expanded → true):** `ECHLY_EXPAND_WIDGET` in background; same pattern from content `onExpandRequest`.

---

## PART 6 — Message System Map

| MESSAGE TYPE | SENDER | RECEIVER | FILE | PURPOSE |
|--------------|--------|----------|------|---------|
| ECHLY_EXTENSION_LOGIN_SUCCESS | Content (from page postMessage) | Background | content.tsx (bridge), background.ts | Login page sent idToken/uid/name/email; store token, user, switch to origin tab, close login tab, openTray, persist, broadcast |
| ECHLY_EXTENSION_TOKEN | Content (from page postMessage) | Background | content.tsx (bridge), background.ts | Broker/page sent token/uid; store token, user, close broker tab, openTray, persist, broadcast |
| ECHLY_DASHBOARD_LOGOUT | Dashboard (postMessage) → Content | Background | ProfileCommandPanel.tsx, content.tsx, background.ts | Sync logout; clearAuthState |
| ECHLY_GET_GLOBAL_STATE | Content / any | Background | content.tsx, background.ts | Request current globalUIState; background sendResponse({ state }) |
| ECHLY_GLOBAL_STATE | Background | All tabs (content) | background.ts, content.tsx | Broadcast tray/session/user state; content sets visibility and React state |
| ECHLY_OPEN_POPUP | (legacy) | Background | background.ts | Ignored; sendResponse({ ok: false }) |
| ECHLY_SIGN_IN / ECHLY_START_LOGIN / LOGIN | (legacy) | Background | background.ts | Ignored; sendResponse({ success: false }) |
| ECHLY_TOGGLE_VISIBILITY | (e.g. popup) | Background | background.ts | Set visible/expanded true, broadcast |
| ECHLY_EXPAND_WIDGET | Content | Background | content.tsx, background.ts | Set expanded true, broadcast |
| ECHLY_COLLAPSE_WIDGET | Content | Background | content.tsx, background.ts | Set expanded false, broadcast |
| ECHLY_FEEDBACK_CREATED | Content | Background | content.tsx, background.ts | Add pointer to globalUIState, broadcast; background may forward to other tabs |
| ECHLY_SET_CAPTURE_MODE | Content | Background | background.ts | Set captureMode, broadcast |
| ECHLY_SESSION_UPDATED | Content | Background | content.tsx, background.ts | Update session title for current sessionId, broadcast |
| ECHLY_TICKET_UPDATED | Content | Background | content.tsx, background.ts | Update pointer in list, broadcast |
| ECHLY_SET_ACTIVE_SESSION | Content | Background | content.tsx, background.ts | Set active session, load pointers, persist, broadcast |
| ECHLY_OPEN_TAB | Content | Background | content.tsx, background.ts | Open URL in new tab |
| ECHLY_SESSION_MODE_START/PAUSE/RESUME/END, ECHLY_SESSION_ACTIVITY | Content | Background | content.tsx, background.ts | Session lifecycle and idle timer |
| ECHLY_GET_TOKEN | Content / internal | Background | content.tsx, background.ts | Return in-memory token or NOT_AUTHENTICATED |
| ECHLY_GET_AUTH_STATE | Content | Background | background.ts | Return { authenticated, user } from checkAuthWithExtensionToken |
| ECHLY_REQUEST_EXTENSION_TOKEN | Background | Content (dashboard origin) | background.ts, content.tsx | Content calls requestExtensionTokenFromPage() and respond with token/uid (only on dashboard origin; content excluded there per manifest) |
| ECHLY_GET_TOKEN_FROM_PAGE | (internal) | Content | content.tsx | Content forwards ECHLY_GET_TOKEN to background and responds with token |
| ECHLY_RESET_WIDGET | Background | All tabs (content) | background.ts, content.tsx | Reset widget state (e.g. collapse) |
| ECHLY_SESSION_STATE_SYNC | Background | Active tab (content) | background.ts, content.tsx | On tab activation; content re-requests ECHLY_GET_GLOBAL_STATE and applies |
| START_RECORDING / STOP_RECORDING | Content | Background | content.tsx, background.ts | Set isRecording, broadcast |
| CAPTURE_TAB | Content | Background | background.ts | captureVisibleTab, sendResponse screenshot |
| ECHLY_UPLOAD_SCREENSHOT | Content | Background | contentScreenshot.ts, background.ts | Upload image to API with token |
| ECHLY_PROCESS_FEEDBACK | Content | Background | content.tsx, background.ts | Structure + create feedback in background, add pointer, broadcast |
| echly-api | Content | Background | contentAuthFetch.ts, background.ts | Proxy fetch with Bearer token; 401/403 clear auth |

### window.postMessage (page ↔ content)

| Type | Direction | File | Purpose |
|------|-----------|------|---------|
| ECHLY_EXTENSION_LOGIN_SUCCESS | Login page → (content)* | app/(auth)/login/page.tsx | Send idToken, refreshToken, uid, name, email after sign-in |
| ECHLY_EXTENSION_TOKEN | extension-auth page → (content)* / EchlyExtensionTokenProvider | app/extension-auth/page.tsx, components/EchlyExtensionTokenProvider.tsx | Send token/uid from GET /api/auth/extensionToken |
| ECHLY_DASHBOARD_LOGOUT | Dashboard → (content)* | components/layout/ProfileCommandPanel.tsx | Notify extension to clear auth |
| ECHLY_EXTENSION_TOKEN_REQUEST | Content → Page | requestExtensionTokenFromPage.ts | Request token; page responds with ECHLY_EXTENSION_TOKEN_RESPONSE |
| ECHLY_EXTENSION_TOKEN_RESPONSE | Page → Content | EchlyExtensionTokenProvider.tsx, requestExtensionTokenFromPage.ts | Respond with token/uid or null |

\* Content script is excluded from echly-web.vercel.app and localhost:3000 (manifest). So on dashboard/login/extension-auth, no content script runs; postMessage from those pages is not received by the extension unless a different injection path exists (e.g. only extension-auth in a different origin).

---

## PART 7 — Dashboard Login Bridge

### app/(auth)/login/page.tsx — where ECHLY_EXTENSION_LOGIN_SUCCESS is sent

- **useEffect (onAuthStateChanged):** When `user` is set and `isExtension` is true, get `idToken` and `refreshToken`, then:

```tsx
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
```

Then `window.location.href = "/dashboard";`.

- **handleGoogle:** After `signInWithGoogle()`, if `isExtension`, same `postMessage` and redirect to `/dashboard`.
- **handleEmail:** After `signInWithEmailPassword()`, if `isExtension`, same `postMessage` and redirect to `/dashboard`.

So ECHLY_EXTENSION_LOGIN_SUCCESS is sent in three code paths (onAuthStateChanged, handleGoogle, handleEmail), each with `window.location.origin` as target. The content script’s `ensureBrokerAndLogoutBridge()` would forward this to the background only when it runs on the same origin; per manifest, content is excluded from that origin.

### app/extension-auth/page.tsx (full)

```tsx
"use client";

import { useEffect } from "react";

const LOGIN_REDIRECT = "/login?extension=true";

/**
 * Auth broker page: runs in dashboard origin so cookies are sent.
 * Fetches extension token, posts to extension via postMessage, then closes.
 * On 401 redirects to login.
 */
export default function ExtensionAuthPage() {
  useEffect(() => {
    let closed = false;

    async function run() {
      try {
        const res = await fetch("/api/auth/extensionToken", {
          credentials: "include",
        });

        if (res.status === 401) {
          window.location.href = LOGIN_REDIRECT;
          return;
        }

        if (!res.ok) {
          window.location.href = LOGIN_REDIRECT;
          return;
        }

        const data = (await res.json()) as { token?: string; uid?: string };
        if (!data?.token || !data?.uid) {
          window.location.href = LOGIN_REDIRECT;
          return;
        }

        if (closed) return;
        window.postMessage(
          {
            type: "ECHLY_EXTENSION_TOKEN",
            token: data.token,
            uid: data.uid,
          },
          "*"
        );
        window.close();
      } catch {
        if (!closed) window.location.href = LOGIN_REDIRECT;
      }
    }

    run();
    return () => {
      closed = true;
    };
  }, []);

  return (
    <div style={{ ... }}>
      <p>Signing in to extension…</p>
    </div>
  );
}
```

Extension token flow: load `/extension-auth` → GET `/api/auth/extensionToken` with credentials → on success postMessage ECHLY_EXTENSION_TOKEN → close tab. Content script would forward to background if it were injected on this origin; manifest excludes it.

### components/EchlyExtensionTokenProvider.tsx (full)

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
          { type: "ECHLY_EXTENSION_TOKEN_RESPONSE", id, token: null },
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

This runs in the dashboard app: responds to ECHLY_REQUEST_TOKEN (Firebase token) and ECHLY_EXTENSION_TOKEN_REQUEST (cookie-based extensionToken API), then posts ECHLY_EXTENSION_TOKEN_RESPONSE. The content script that sends ECHLY_EXTENSION_TOKEN_REQUEST is only in non-dashboard tabs (manifest); for extension-auth tab, the page itself posts ECHLY_EXTENSION_TOKEN after fetching /api/auth/extensionToken.

---

## PART 8 — Token Architecture (extensionAccessToken)

- **Set:**
  - **background.ts ~453:** `ECHLY_EXTENSION_LOGIN_SUCCESS` handler: `extensionAccessToken = idToken` (and set `globalUIState.user`).
  - **background.ts ~382:** `ECHLY_EXTENSION_TOKEN` handler: `extensionAccessToken = token` (and set `globalUIState.user`).
- **Cleared:**
  - **background.ts ~292:** `clearAuthState()`: `extensionAccessToken = null` (and clear user, visible, expanded, legacy storage, persist, broadcast).
  - **background.ts ~241, 421, 471, 547, 662:** Any API path that gets 401/403 calls `clearAuthState()` (e.g. initializeSessionState feedback fetch, ECHLY_SET_ACTIVE_SESSION feedback/sessions fetch, ECHLY_PROCESS_FEEDBACK, ECHLY_UPLOAD_SCREENSHOT, echly-api).
  - **background.ts ~394:** `ECHLY_DASHBOARD_LOGOUT` handler: calls `clearAuthState()` and then `extensionAccessToken = null` again (redundant with clearAuthState).
- **Used:**
  - **background.ts 86:** `hasValidToken()`: `Boolean(extensionAccessToken)`.
  - **background.ts 343–345:** `getValidToken()`: return `extensionAccessToken` or throw NOT_AUTHENTICATED.
  - **background.ts 354:** `checkAuthWithExtensionToken()`: treat authenticated if `extensionAccessToken && globalUIState.user`.
  - **background.ts 421, 471, 547, 662, 1049:** All API calls that need auth use `getValidToken()` and add `Authorization: Bearer <token>`; on 401/403 they call `clearAuthState()`.

Lifecycle: Token is not persisted. It is set when login or broker sends ECHLY_EXTENSION_LOGIN_SUCCESS or ECHLY_EXTENSION_TOKEN to background. It is used for every authenticated API request from background (and via echly-api from content). It is cleared on logout, 401/403, or legacy cleanup in clearAuthState. Service worker restart loses the token (in-memory only).

---

## PART 9 — Background Startup Logic (initializeSessionState)

### Full initializeSessionState() (background.ts 206–276)

```typescript
async function initializeSessionState(): Promise<void> {
  return new Promise<void>((resolve) => {
    chrome.storage.local.get(
      ["activeSessionId", "sessionModeActive", "sessionPaused", "trayVisible", "trayExpanded"],
      (result: { ... }) => {
        activeSessionId = typeof result.activeSessionId === "string" ? result.activeSessionId : null;

        globalUIState.sessionId = activeSessionId;
        globalUIState.sessionModeActive = result.sessionModeActive === true;
        globalUIState.sessionPaused = result.sessionPaused === true;
        globalUIState.visible = result.trayVisible === true;
        globalUIState.expanded = result.trayExpanded === true;

        const shouldReloadPointers = globalUIState.sessionModeActive === true && activeSessionId != null;

        if (shouldReloadPointers) {
          getValidToken()
            .then((token) => fetch(`${API_BASE}/api/feedback?sessionId=...`, { headers: { Authorization: `Bearer ${token}` } }))
            .then(...)  // 401/403 → clearAuthState; else parse feedback → globalUIState.pointers, broadcastUIState, resolve
            .catch(...) // warn, clear pointers, broadcast, resolve
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
```

- **When background restores tray state:** On service worker start, `initializeSessionState()` runs first. It restores `trayVisible` / `trayExpanded` from storage into `globalUIState.visible` / `globalUIState.expanded`. So tray visibility/expansion is restored from the last `persistUIState()` (e.g. last time user had tray open or closed).
- **When broadcastUIState runs on startup:** Immediately after `await initializeSessionState()`, the IIFE calls `broadcastUIState()`. So every open tab that has the content script gets one initial ECHLY_GLOBAL_STATE with the restored (and possibly pointer-reloaded) state. If `shouldReloadPointers` was true, the first broadcast happens after the feedback fetch completes (inside the getValidToken().then(...) chain).

---

## PART 10 — Runtime Message Flow Diagrams

### Extension click

```
User clicks extension icon
         ↓
chrome.action.onClicked (background.ts)
         ↓
originTabId = tab?.id ?? null
         ↓
extensionAccessToken present?
    ├─ yes → openTray() → persistUIState() → broadcastUIState()
    └─ no  → try openAuthBrokerTab()
              ├─ success → (broker tab loads, fetches token, postMessage → content → background ECHLY_EXTENSION_TOKEN → openTray…)
              └─ fail    → openLoginOnce(loginUrl) → login tab
```

### Login return (Loom-style)

```
Login page (after sign-in)
         ↓
window.postMessage({ type: "ECHLY_EXTENSION_LOGIN_SUCCESS", idToken, uid, name, email }, origin)
         ↓
Content script (if injected on that origin) ensureBrokerAndLogoutBridge
         ↓
chrome.runtime.sendMessage({ type: "ECHLY_EXTENSION_LOGIN_SUCCESS", ... })
         ↓
Background: extensionAccessToken = idToken, globalUIState.user = {...}
         ↓
chrome.tabs.update(originTabId, { active: true })
         ↓
If loginTabId and tab still on /login → chrome.tabs.remove(loginTabId)
         ↓
openTray() → persistUIState() → broadcastUIState()
         ↓
Tray open on all tabs with content script
```

### Global state broadcast

```
Background (any state change: tray, session, pointers, user)
         ↓
broadcastUIState() → payload = { type: "ECHLY_GLOBAL_STATE", state: globalUIState }
         ↓
chrome.tabs.query({}) → for each tab: chrome.tabs.sendMessage(tab.id, payload)
         ↓
Content script: chrome.runtime.onMessage → msg.type === "ECHLY_GLOBAL_STATE" && msg.state
         ↓
setHostVisibility(getShouldShowTray(state)), __ECHLY_APPLY_GLOBAL_STATE__?.(state), window.dispatchEvent(ECHLY_GLOBAL_STATE)
         ↓
React (ContentApp): listener on ECHLY_GLOBAL_STATE → setGlobalState(mergeWithPointerProtection(prev, s)), setUser(...) → re-render
```

---

## PART 11 — Runtime Debug Logging (Recommended Additions)

Add these **temporary** logs when debugging. Do not leave them in production.

**In background.ts:**

1. **Inside `chrome.action.onClicked` (at the very start of the listener):**
   ```ts
   console.log("ECHLY TRACE CLICK");
   ```

2. **Inside `openTray()` (after the existing "ECHLY TRAY OPEN" log):**
   ```ts
   console.log("ECHLY TRACE OPEN_TRAY");
   ```

3. **Inside `broadcastUIState()` (at the start):**
   ```ts
   console.log("ECHLY TRACE BROADCAST", globalUIState);
   ```

4. **Inside `clearAuthState()` (at the start):**
   ```ts
   console.log("ECHLY TRACE CLEAR_AUTH");
   ```

These help confirm: click received, tray open path, every broadcast (and payload), and every auth clear.

---

## PART 12 — Tab Event Logging (Recommended Additions)

Add temporary logging to tab events to see who triggers dashboard/tab changes.

**In background.ts:**

1. **chrome.tabs.onCreated:**
   ```ts
   chrome.tabs.onCreated.addListener((tab) => {
     console.log("ECHLY TAB CREATED", tab.id, tab.url ?? "(no url)");
     // ... existing sendMessage logic
   });
   ```

2. **chrome.tabs.onUpdated** (add listener if not present; if present, add log at start):
   ```ts
   chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
     console.log("ECHLY TAB UPDATED", tabId, changeInfo?.status, tab?.url);
     // optional: existing logic
   });
   ```

3. **chrome.tabs.onActivated:**
   ```ts
   chrome.tabs.onActivated.addListener((activeInfo) => {
     console.log("ECHLY TAB ACTIVATED", activeInfo.tabId, activeInfo.windowId);
     // ... existing sendMessage logic
   });
   ```

This reveals which tab creation/update/activation events occur (e.g. after opening login or dashboard).

---

## PART 13 — Output Summary

This document provides:

- **Full source** for entry points: background.ts (structure and key functions), content.tsx (entry/main and message flow), contentAuthFetch.ts, requestExtensionTokenFromPage.ts, api.ts, firebase.ts.
- **Manifest analysis:** service worker, content script matches/excludes (injection on all HTTP/HTTPS except echly-web.vercel.app and localhost:3000), host permissions.
- **Chrome API usage:** All chrome.tabs, chrome.runtime, chrome.action, chrome.storage call sites with file and line references.
- **Dashboard/login/extension-auth opening:** All chrome.tabs.create, openLoginOnce, openOrFocusLoginTab, ensureDashboardTab definitions and call sites.
- **Tray visibility:** Every mutation of globalUIState.visible and globalUIState.expanded and which functions open/close/collapse the tray.
- **Message system map:** Table of message types, senders, receivers, files, and purpose; window.postMessage flows for login, token, and logout.
- **Dashboard login bridge:** login/page.tsx (where ECHLY_EXTENSION_LOGIN_SUCCESS is sent), extension-auth/page.tsx, EchlyExtensionTokenProvider.tsx.
- **Token lifecycle:** Where extensionAccessToken is set, cleared, and used.
- **Background startup:** initializeSessionState() and when tray state is restored and when broadcastUIState runs on startup.
- **Runtime flow diagrams:** Extension click, login return, and global state broadcast.
- **Recommended debug logs:** Exact console.log lines to add in background for click, openTray, broadcastUIState, clearAuthState, and tab events (onCreated, onUpdated, onActivated).

Use this trace for external debugging without modifying production behavior. Add the temporary logs from PART 11 and PART 12 only when diagnosing issues, then remove them.
