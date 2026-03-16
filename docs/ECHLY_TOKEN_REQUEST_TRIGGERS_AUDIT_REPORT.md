# Echly Extension — Token Request Triggers Audit Report

**Scope:** All calls to `getValidToken()`, message handlers that trigger it, automatic vs user-driven triggers, and every code path that can open `/extension-auth`.

**Sources:** `echly-extension/src/background.ts`, `content.tsx`, `popup.tsx`, `api.ts`, `contentAuthFetch.ts`.

---

## 1. All calls to `getValidToken()`

| # | Location | Context |
|---|----------|--------|
| 1 | **background.ts:157** | Inside `initializeSessionState()` when `shouldReloadPointers` is true (session mode was active and `activeSessionId` exists). Used to refetch feedback pointers on background startup. |
| 2 | **background.ts:266** | Inside `getValidToken()` itself — not a direct call; it’s the internal use of `getExtensionToken()` when cache is missed. |
| 3 | **background.ts:266** | `hydrateAuthState()` calls `getValidToken()` (line 266). |
| 4 | **background.ts:569** | Message handler **ECHLY_SET_ACTIVE_SESSION**: before loading feedback + sessions for the selected session. |
| 5 | **background.ts:677** | Message handler **ECHLY_GET_TOKEN**: returns token or NOT_AUTHENTICATED. |
| 6 | **background.ts:689** | Message handler **ECHLY_GET_EXTENSION_TOKEN**: returns token (or null on failure). |
| 7 | **background.ts:803** | Message handler **ECHLY_UPLOAD_SCREENSHOT**: before calling upload API. |
| 8 | **background.ts:867** | Message handler **ECHLY_PROCESS_FEEDBACK**: before structure-feedback + feedback API calls. |
| 9 | **background.ts:1028** | Message handler **echly-api**: before performing the proxied API request. |

**Note:** The only place that opens `/extension-auth` is `getExtensionToken()` (line 213: `chrome.tabs.create({ url: EXTENSION_AUTH_URL })`). `getExtensionToken()` is only called from `getValidToken()` when the in-memory token is missing or expired. So any call to `getValidToken()` when the cache is cold can lead to opening `/extension-auth`.

---

## 2. Message handlers that trigger `getValidToken()`

| Message type | Handler calls | Triggered by |
|--------------|----------------|--------------|
| **ECHLY_SET_ACTIVE_SESSION** | `getValidToken()` | Content script when user selects or creates a session (resume modal, new session, etc.). |
| **ECHLY_GET_TOKEN** | `getValidToken()` | Any sender that explicitly requests a token (e.g. legacy or internal use). |
| **ECHLY_GET_EXTENSION_TOKEN** | `getValidToken()` | `contentAuthFetch.authFetch()` (content script). **Note:** Content script currently uses `api.ts` (echly-api), not `contentAuthFetch`; this path is effectively legacy/unused. |
| **ECHLY_GET_AUTH_STATE** | `hydrateAuthState()` → `getValidToken()` | Popup on open; content script on mount (one-time effect). |
| **ECHLY_UPLOAD_SCREENSHOT** | `getValidToken()` | Content script when uploading a screenshot for feedback. |
| **ECHLY_PROCESS_FEEDBACK** | `getValidToken()` | Content script when submitting voice/text feedback (structure + feedback APIs). |
| **echly-api** | `getValidToken()` | Content script for all API calls via `api.ts` (sessions, feedback, tickets, create session, etc.). |

---

## 3. Does `getValidToken()` run automatically on page load?

**Yes, in two cases:**

1. **Background script load (service worker startup)**  
   The IIFE at the end of the background script runs on every extension load:
   ```ts
   (async () => {
     await initializeSessionState();
     broadcastUIState();
   })();
   ```
   If `sessionModeActive === true` and `activeSessionId != null`, `initializeSessionState()` calls `getValidToken()` to reload feedback pointers. So **on background startup**, with a previously active session, token is requested and `/extension-auth` can open if the cache is cold.

2. **Content script mount (any page where the widget is injected)**  
   When the content script mounts, a `useEffect` with empty deps runs once and sends **ECHLY_GET_AUTH_STATE**:
   ```ts
   // content.tsx ~346–364
   React.useEffect(() => {
     chrome.runtime.sendMessage({ type: "ECHLY_GET_AUTH_STATE" }, ...);
   }, []);
   ```
   The background handler for **ECHLY_GET_AUTH_STATE** calls `hydrateAuthState()` → `getValidToken()`. So **on content script mount**, token is requested and `/extension-auth` can open if not authenticated.

So token request (and thus possible `/extension-auth`) can run automatically on:
- **Background startup** (when restoring session with pointers).
- **Content script mount** (when widget is loaded on a page), via **ECHLY_GET_AUTH_STATE**.

---

## 4. Verification: is `getValidToken()` only from icon click and API requests?

**No.** Current behavior is broader:

| Intended source | Actual behavior |
|-----------------|------------------|
| **Extension icon click** | Icon click runs `openWidgetInActiveTab()` only. It does **not** call `getValidToken()` or `hydrateAuthState()`. Token is first requested when the injected content script runs its mount effect (**ECHLY_GET_AUTH_STATE**) or when the widget does an API call (e.g. `apiFetch("/api/sessions?limit=1")` via **echly-api**). So icon click only **indirectly** triggers token (via content script auth check or API). |
| **API request requiring auth** | **Yes.** All background-side API usage goes through `getValidToken()`: **echly-api**, **ECHLY_SET_ACTIVE_SESSION**, **ECHLY_UPLOAD_SCREENSHOT**, **ECHLY_PROCESS_FEEDBACK**, and **initializeSessionState** (feedback fetch). |

**Additional triggers (beyond “icon click” and “API request”):**

- **Popup open:** Popup calls **ECHLY_GET_AUTH_STATE** on load → `hydrateAuthState()` → `getValidToken()`.
- **Content script mount:** Same **ECHLY_GET_AUTH_STATE** on mount → `getValidToken()`.
- **Background startup:** `initializeSessionState()` can call `getValidToken()` when reloading pointers.

So `getValidToken()` is **not** limited to “extension icon click” and “API request”; it also runs on popup open, content script mount, and background startup (when restoring session).

---

## 5. Calls on content script mount, tab activation, background startup

| Trigger | Calls `getValidToken()`? | Mechanism |
|--------|---------------------------|------------|
| **Content script mount** | **Yes** | Content script `useEffect` sends **ECHLY_GET_AUTH_STATE** once on mount → background `hydrateAuthState()` → `getValidToken()`. If cache is cold, `/extension-auth` can open. |
| **Tab activation** | **No** (directly) | `chrome.tabs.onActivated` only injects content script (if needed) and sends **ECHLY_GLOBAL_STATE** and **ECHLY_SESSION_STATE_SYNC**. It does **not** call `getValidToken()`. **Indirectly:** if injection happens on that tab, the content script mounts and sends **ECHLY_GET_AUTH_STATE**, which then triggers `getValidToken()`. |
| **Background startup** | **Yes** (conditional) | IIFE runs `initializeSessionState()`. If `sessionModeActive && activeSessionId`, it calls `getValidToken()` to reload feedback. So on service worker startup with a saved session, token is requested and `/extension-auth` can open. |

---

## 6. Every code path that can open `/extension-auth`

The only place that opens the broker tab is:

- **background.ts:213** — `getExtensionToken()`: `chrome.tabs.create({ url: EXTENSION_AUTH_URL })`.

`getExtensionToken()` is only called from `getValidToken()` when the in-memory token is missing or expired. So every path below can open `/extension-auth` when the token cache is cold.

| # | Code path | When it runs |
|---|-----------|----------------|
| 1 | **Background startup** → `initializeSessionState()` → `getValidToken()` → (cache miss) → `getExtensionToken()` → `chrome.tabs.create(EXTENSION_AUTH_URL)` | When the service worker starts and stored state has `sessionModeActive === true` and `activeSessionId != null`. |
| 2 | **Popup open** → `getAuthState()` → **ECHLY_GET_AUTH_STATE** → `hydrateAuthState()` → `getValidToken()` → (cache miss) → `getExtensionToken()` → `chrome.tabs.create(EXTENSION_AUTH_URL)` | Every time the user opens the extension popup. |
| 3 | **Content script mount** → **ECHLY_GET_AUTH_STATE** → `hydrateAuthState()` → `getValidToken()` → (cache miss) → `getExtensionToken()` → `chrome.tabs.create(EXTENSION_AUTH_URL)` | When the content script first runs in a tab (e.g. after icon click and injection, or after tab activation and injection). |
| 4 | **Content: any API call** (sessions, feedback, tickets, create session, etc.) → **echly-api** → `getValidToken()` → (cache miss) → `getExtensionToken()` → `chrome.tabs.create(EXTENSION_AUTH_URL)` | First (or any) content-driven API request when cache is cold. Includes e.g. “Previous Sessions” check (`/api/sessions?limit=1`) when widget becomes visible. |
| 5 | **Content: ECHLY_SET_ACTIVE_SESSION** (select/create session) → `getValidToken()` → (cache miss) → `getExtensionToken()` → `chrome.tabs.create(EXTENSION_AUTH_URL)` | When user selects or creates a session from the widget. |
| 6 | **Content: ECHLY_UPLOAD_SCREENSHOT** → `getValidToken()` → (cache miss) → `getExtensionToken()` → `chrome.tabs.create(EXTENSION_AUTH_URL)` | When user submits feedback with a screenshot. |
| 7 | **Content: ECHLY_PROCESS_FEEDBACK** → `getValidToken()` → (cache miss) → `getExtensionToken()` → `chrome.tabs.create(EXTENSION_AUTH_URL)` | When user submits voice/text feedback. |
| 8 | **Any sender: ECHLY_GET_TOKEN** → `getValidToken()` → (cache miss) → `getExtensionToken()` → `chrome.tabs.create(EXTENSION_AUTH_URL)` | When something explicitly requests a token. |
| 9 | **Content (if using contentAuthFetch): ECHLY_GET_EXTENSION_TOKEN** → `getValidToken()` → (cache miss) → `getExtensionToken()` → `chrome.tabs.create(EXTENSION_AUTH_URL)` | Only if content (or another context) used `contentAuthFetch`; currently content uses `api.ts` (echly-api), so this path is unused. |

---

## Summary

- **All `getValidToken()` call sites:** 9 (including one inside `getValidToken()` via `getExtensionToken()`, and one via `hydrateAuthState()`).
- **Message handlers that trigger it:** ECHLY_SET_ACTIVE_SESSION, ECHLY_GET_TOKEN, ECHLY_GET_EXTENSION_TOKEN, ECHLY_GET_AUTH_STATE (via hydrateAuthState), ECHLY_UPLOAD_SCREENSHOT, ECHLY_PROCESS_FEEDBACK, echly-api.
- **Automatic on “page load”:** Yes — on background startup (when restoring session) and on content script mount (via ECHLY_GET_AUTH_STATE).
- **Icon click:** Does not call `getValidToken()` directly; token is requested when content script runs (ECHLY_GET_AUTH_STATE or subsequent API calls).
- **Content script mount / tab activation / background startup:** Token is requested on content script mount (ECHLY_GET_AUTH_STATE) and on background startup when reloading pointers; tab activation can lead to token request only indirectly (injection → content mount → ECHLY_GET_AUTH_STATE).
- **Paths that can open `/extension-auth`:** All of the above when the extension token cache is cold (no valid in-memory token); the only code that creates the tab is `getExtensionToken()` in background.ts.

---

*Audit date: 2025-03-16. Codebase: echly-extension (background.ts, content.tsx, popup.tsx, api.ts, contentAuthFetch.ts).*
