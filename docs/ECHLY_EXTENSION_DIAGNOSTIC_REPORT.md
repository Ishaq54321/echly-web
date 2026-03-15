# Echly Extension & Backend — Full Architecture Diagnostic Report

**Date:** 2025-03-16  
**Scope:** Chrome extension (echly-extension) + Next.js backend. No code changes; analysis only.  
**Goal:** Identify why the extension no longer behaves like the previous working version after moving to Loom-style (dashboard-cookie → extension token) auth.

---

## 1. Extension Architecture Map

### 1.1 Manifest and entry points

| File | Role |
|------|------|
| `echly-extension/manifest.json` | MV3; `action.default_popup: "popup.html"`; background service worker `background.js`; content script `content.js` on `<all_urls>` at `document_idle`; `sessionRelay.js` on `http://localhost:3000/*`. |

**Critical:** With `default_popup` set, **clicking the extension icon opens the popup**. `chrome.action.onClicked` **does not fire** when a popup is defined. So the only way the widget opens from the icon is: popup opens → popup logic → sends `ECHLY_OPEN_WIDGET` to background.

### 1.2 Icon click and widget-open flow

```
User clicks extension icon
  → Popup opens (popup.html / popup.js from popup.tsx)
  → PopupApp useEffect: getAuthState() → chrome.runtime.sendMessage({ type: "ECHLY_GET_AUTH_STATE" })
  → Background handles ECHLY_GET_AUTH_STATE: sendResponse({ authenticated: !!sw.currentUser, user: sw.currentUser })
  → If authenticated === true: openWidget() → chrome.runtime.sendMessage({ type: "ECHLY_OPEN_WIDGET" }); window.close()
  → If authenticated === false: popup shows "Continue with Google" (widget never opens)
  →
  [When ECHLY_OPEN_WIDGET is sent]
  → Background: openWidgetInActiveTab() — sets globalUIState.visible = true, globalUIState.expanded = true; broadcastUIState(); chrome.tabs.sendMessage(activeTab, { type: "ECHLY_OPEN_WIDGET" })
  → Content script (ensureMessageListener): receives ECHLY_OPEN_WIDGET → window.dispatchEvent(new CustomEvent("ECHLY_OPEN_WIDGET"))
  → Content script: receives ECHLY_GLOBAL_STATE (from broadcast) → setHostVisibility(getShouldShowTray(state)); setGlobalState(mergeWithPointerProtection(prev, state))
  → ContentApp: ECHLY_OPEN_WIDGET listener → chrome.runtime.sendMessage({ type: "ECHLY_EXPAND_WIDGET" })
  → Widget becomes visible in active tab
```

So: **who controls widget open/close** — **background** via `globalUIState.visible` and `broadcastUIState()`. Content script only applies that state (visibility + React state). **Only one component toggles visibility for “open”**: background’s `openWidgetInActiveTab()` (and indirectly popup by sending `ECHLY_OPEN_WIDGET`). No duplicate visibility controllers; content does not set visibility on its own, only from messages.

### 1.3 Message flow summary

| Sender | Message | Handler (background) | Background action |
|--------|---------|----------------------|-------------------|
| Popup / any | `ECHLY_GET_AUTH_STATE` | Yes | Returns `{ authenticated, user }` from memory (no fetch). |
| Popup / any | `ECHLY_OPEN_WIDGET` | Yes | openWidgetInActiveTab(); reply ok. |
| Popup / any | `ECHLY_START_LOGIN` / `ECHLY_SIGN_IN` / `LOGIN` | Yes | Opens dashboard login tab. |
| Content (widget) | `ECHLY_START_SESSION` | Yes | Forwards to active tab: sendMessage(tabId, ECHLY_START_SESSION). |
| Content (widget) | `ECHLY_OPEN_PREVIOUS_SESSIONS` | Yes | Forwards to active tab: sendMessage(tabId, ECHLY_OPEN_PREVIOUS_SESSIONS). |
| Content | `ECHLY_GET_EXTENSION_TOKEN` | Yes | getValidToken() then sendResponse({ token }); async, returns true. |
| Content | `ECHLY_GET_GLOBAL_STATE` | Yes | sendResponse({ state: globalUIState }). |
| Background | (broadcast) | — | ECHLY_GLOBAL_STATE to all tabs; ECHLY_OPEN_WIDGET / ECHLY_START_SESSION / ECHLY_OPEN_PREVIOUS_SESSIONS to active tab only. |

Content script listens with `chrome.runtime.onMessage.addListener` in `ensureMessageListener(host)` (content.tsx). It maps:

- `ECHLY_OPEN_WIDGET` → dispatch `ECHLY_OPEN_WIDGET` custom event
- `ECHLY_GLOBAL_STATE` → set host visibility + apply state + dispatch event
- `ECHLY_START_SESSION` → dispatch `ECHLY_START_SESSION_REQUEST`
- `ECHLY_OPEN_PREVIOUS_SESSIONS` → dispatch `ECHLY_OPEN_PREVIOUS_SESSIONS`
- `ECHLY_TOGGLE` → dispatch `ECHLY_TOGGLE_WIDGET`
- `ECHLY_RESET_WIDGET` → dispatch `ECHLY_RESET_WIDGET`
- `ECHLY_SESSION_STATE_SYNC` → request ECHLY_GET_GLOBAL_STATE and apply

**Note:** There is **no** `ECHLY_TOGGLE_VISIBILITY` in the current codebase (docs still mention it). Popup uses `ECHLY_OPEN_WIDGET`. Any past infinite loop involving `ECHLY_TOGGLE_VISIBILITY` would have been from an older version.

### 1.4 Files and roles

- **echly-extension/background.js** — Built from `src/background.ts`. Single message router; token and global UI state live here.
- **echly-extension/content.js** — Built from `src/content.tsx`. Single mount, message listener, applies background state; no token.
- **echly-extension/popup.js** — Built from `src/popup.tsx`. Auth check + open widget + close.
- **echly-extension/events.js** — Does not exist.

---

## 2. Widget Architecture Map

### 2.1 Components and state

- **components/CaptureWidget/CaptureWidget.tsx** — Shell: header, sidebar, ResumeSessionModal, CaptureLayer, WidgetFooter. Uses `useCaptureWidget` for state and handlers. In extension mode, footer “Start Session” sends `ECHLY_START_SESSION`; “Previous Sessions” uses `handlePreviousSessions` → `ECHLY_OPEN_PREVIOUS_SESSIONS`.
- **components/CaptureWidget/hooks/useCaptureWidget.ts** — Capture state machine, recording, session mode, pointers. `handlers.startSession` (used in non-extension mode) calls `onCreateSession`; in extension mode the footer does **not** call `onCreateSession` directly — it sends `ECHLY_START_SESSION` so that **content script** runs the session-creation flow.

Widget open state:

- **Controlled by background:** `globalUIState.visible`, `globalUIState.expanded` broadcast via `ECHLY_GLOBAL_STATE`.
- **Content (content.tsx):** `getShouldShowTray(state)` = `state.visible || state.sessionModeActive || state.sessionPaused`; that drives `setHostVisibility(getShouldShowTray(state))` and React `globalState`. So widget “open” = tray visible and/or expanded from background state.

### 2.2 Start Session — full flow

1. User sees widget (tray visible, home screen with “Start Session”).
2. User clicks “Start Session” → `CaptureWidget.tsx` (WidgetFooter) → `chrome.runtime.sendMessage({ type: "ECHLY_START_SESSION" })`.
3. Background receives `ECHLY_START_SESSION` → `chrome.tabs.query({ active: true, currentWindow: true })` → `chrome.tabs.sendMessage(tabs[0].id, { type: "ECHLY_START_SESSION" })`.
4. Content script (same tab) receives it in `ensureMessageListener` → `window.dispatchEvent(new CustomEvent("ECHLY_START_SESSION_REQUEST"))`.
5. ContentApp (content.tsx) listener for `ECHLY_START_SESSION_REQUEST` runs: `createSession().then(session => { if (session?.id) { onActiveSessionChange(session.id); chrome.runtime.sendMessage({ type: "ECHLY_SESSION_MODE_START" }); onExpandRequest(); } })`.
6. `createSession()` = `apiFetch("/api/sessions", { method: "POST", ... })` (content’s apiFetch → contentAuthFetch → ECHLY_GET_EXTENSION_TOKEN → background; then fetch with Bearer token).
7. If create succeeds: background gets `ECHLY_SET_ACTIVE_SESSION` and `ECHLY_SESSION_MODE_START`, updates global state and broadcasts; content updates UI and expands.

So Start Session depends on: (1) widget being visible (so popup must have opened it), (2) content script receiving the message in the active tab, (3) `apiFetch` getting a valid token (background must have token).

### 2.3 Previous Sessions — full flow

1. User clicks “Previous Sessions” → `handlePreviousSessions()` → `chrome.runtime.sendMessage({ type: "ECHLY_OPEN_PREVIOUS_SESSIONS" })`.
2. Background forwards to active tab: `chrome.tabs.sendMessage(tabs[0].id, { type: "ECHLY_OPEN_PREVIOUS_SESSIONS" })`.
3. Content script dispatches `ECHLY_OPEN_PREVIOUS_SESSIONS` custom event.
4. ContentApp listener sets `setOpenResumeModalFromMessage(true)`.
5. CaptureWidget receives `openResumeModal={openResumeModalFromMessage}` and shows `ResumeSessionModal`; `fetchSessions` (content’s apiFetch) loads list.

So Previous Sessions also depends on widget being visible and content script + token working.

---

## 3. Auth Flow

### 3.1 Intended Loom-style flow

- Dashboard cookie (`echly_session`) is source of truth (set after login on dashboard).
- Extension calls `POST /api/extension/session` with `credentials: "include"` (cookie sent).
- Backend returns short-lived extension JWT (`extensionToken`) + user info.
- Extension uses that token as `Authorization: Bearer <token>` for API calls.

### 3.2 Backend

- **app/api/extension/session/route.ts** — POST: `getSessionUser(request)` (reads `echly_session` cookie from `Cookie` header); if no user → 401; else signs JWT (15m, `EXTENSION_TOKEN_SECRET`), returns `{ extensionToken, user: { uid, email } }`.
- **lib/server/session.ts** — `getSessionUser(request)` parses `echly_session` from request cookie, verifies JWT, returns `SessionUser`.
- **lib/server/auth.ts** — `requireAuth(request)`: (1) Bearer token → Firebase ID token or extension token (`verifyExtensionToken`); (2) else session cookie. Used by structure-feedback, feedback, sessions, etc.
- **lib/server/extensionAuth.ts** — `verifyExtensionToken(token)` verifies the short-lived extension JWT.

### 3.3 Extension: where token is obtained and stored

- **background.ts:**  
  - `getExtensionToken()`: `fetch(API_BASE + "/api/extension/session", { method: "POST", credentials: "include" })`. On 401: clear token/user, open login tab, throw. On success: set `extensionToken`, `setExtensionToken(token)` (utils/apiFetch), `sw.extensionToken`, `cachedSessionUser` / `sw.currentUser`.  
  - `getValidToken()`: return cached token or call `getExtensionToken()`.  
  - Token is cached in memory only (not in chrome.storage).
- **utils/apiFetch.ts** (background): `apiFetch` uses `extensionToken` (from `setExtensionToken`) and sends `Authorization: Bearer ${extensionToken}`. Used by background for ECHLY_PROCESS_FEEDBACK, ECHLY_SET_ACTIVE_SESSION, upload-screenshot, etc.
- **contentAuthFetch.ts** (content): `authFetch`/`apiFetch` send `ECHLY_GET_EXTENSION_TOKEN` to background; background runs `getValidToken()` and `sendResponse({ token })` (or on catch `sendResponse({ token: null })`). Content then fetches with `Authorization: Bearer ${token}` (if token) and `credentials: "include"`.

So: extension obtains token in **background** via POST /api/extension/session (or from sessionRelay on dashboard); token is cached in **background** (in-memory + `setExtensionToken` for background’s apiFetch). API calls from **content** get the token via **ECHLY_GET_EXTENSION_TOKEN** and add it to requests. There is no `_t()` helper; the helpers are background `apiFetch` and content `authFetch`/`apiFetch`.

### 3.4 When is the token first set?

- **Session relay (dashboard only):** On `http://localhost:3000/*`, `sessionRelay.js` runs: POST /api/extension/session (credentials: include), then `ECHLY_SET_EXTENSION_TOKEN` to background. So **if the user has a dashboard tab open (or has loaded it this session),** background gets the token and `currentUser` without the popup doing anything.
- **Elsewhere:** Token is only fetched when something calls `getValidToken()` in the background. That happens when:
  - Content does an API call → sends `ECHLY_GET_EXTENSION_TOKEN` → background runs `getValidToken()`.
  - Background handles ECHLY_PROCESS_FEEDBACK, ECHLY_SET_ACTIVE_SESSION, ECHLY_UPLOAD_SCREENSHOT, echly-api, etc.

**Critical:** When the popup runs `getAuthState()`, it only sends `ECHLY_GET_AUTH_STATE`. The background handler **does not** call `getValidToken()` or `getExtensionToken()`. It only returns `{ authenticated: !!sw.currentUser, user: sw.currentUser }`. So:

- If the user **has not** had the dashboard (or sessionRelay) run in this session, `currentUser` is never set.
- So `authenticated` is always false → popup shows “Continue with Google” and never calls `openWidget()`.
- So the widget never opens from the icon click in that scenario.

---

## 4. AI Pipeline Flow

### 4.1 Path: content → structure-feedback → feedback

- **Content (content.tsx) handleComplete:**  
  - Uses `apiFetch("/api/structure-feedback", { method: "POST", body: JSON.stringify({ transcript, context }) })` (content’s apiFetch → ECHLY_GET_EXTENSION_TOKEN → Bearer token).  
  - Then, if success and tickets: for each ticket, `apiFetch("/api/feedback", { method: "POST", body })`.  
  - Or if `!data.success || tickets.length === 0`: sends `ECHLY_PROCESS_FEEDBACK` to background; background runs `getValidToken()`, then POST /api/structure-feedback and POST /api/feedback (using background’s apiFetch), then sendResponse({ success, ticket }) or error.
- **Backend:**  
  - **POST /api/structure-feedback** (app/api/structure-feedback/route.ts): `requireAuth(req)`, then `runFeedbackPipeline(client, { transcript, context })`, returns `{ success, tickets, ... }`.  
  - **POST /api/feedback** (app/api/feedback/route.ts): `requireAuth(req)`, creates ticket.

So: voice/text → content or background → /api/structure-feedback → runFeedbackPipeline() → /api/feedback → ticket created.

### 4.2 When “AI processing failed” is shown

In **content.tsx** handleComplete (and related clarity/fallback paths):

- **callbacks.onError()** is used in several places and sets the job to failed with message “AI processing failed.” (or `job.errorMessage`).
- Occurrences:
  - **chrome.runtime.lastError** in the ECHLY_PROCESS_FEEDBACK callback (message to background failed).
  - **response?.success** false or no ticket from ECHLY_PROCESS_FEEDBACK (e.g. structure or feedback API failed, 401, or “No ticket created”).
  - **!data.success || tickets.length === 0** and then ECHLY_PROCESS_FEEDBACK callback reports failure.
  - Direct content path: structure-feedback success but no ticket created from /api/feedback (e.g. all feedback POSTs fail).
  - Any thrown error in the try block (e.g. network, parse, or API error) → catch → set job failed, “AI processing failed.”, callbacks.onError().

So “AI processing failed” is triggered by: (1) runtime message error to background, (2) background returning success: false or no ticket (often 401 or API error), (3) content-side structure/feedback failure or exception. The **condition** that most often causes it after the auth migration is **401 Unauthorized** when the extension token is missing or invalid (e.g. token never obtained or expired and not refreshed).

---

## 5. Detected Bugs and Conflicts

### 5.1 Auth state not hydrated on popup open (primary)

- **What:** Popup calls `ECHLY_GET_AUTH_STATE`; background returns `authenticated: !!sw.currentUser` without ever trying to get a token from the dashboard cookie.
- **Effect:** If the user has not visited the dashboard in this session (or sessionRelay hasn’t run), `currentUser` is null → popup always shows “Continue with Google” and never calls `openWidget()` → **extension appears not to open (widget never shows)**.
- **No infinite loop:** There is no `ECHLY_TOGGLE_VISIBILITY` in code; popup uses `ECHLY_OPEN_WIDGET`. Old docs reference the old message; the previous loop was likely from that older design.

### 5.2 Start Session / Previous Sessions “do nothing”

- **Cause 1:** Widget never opens (due to 5.1), so the user never sees or clicks Start Session / Previous Sessions.
- **Cause 2:** If the widget is visible (e.g. after visiting dashboard so sessionRelay set token), but token is missing or expired when content calls apiFetch (e.g. createSession or fetchSessions), backend returns 401 and the flow fails silently or with a generic error.

### 5.3 AI processing failed

- **Cause:** 401 from /api/structure-feedback or /api/feedback when the extension token is missing or invalid (e.g. never fetched, or 15m expired and not refreshed). Other causes: network errors, pipeline errors, or “No ticket created” from backend.

### 5.4 No duplicate visibility control

- Visibility is driven only by background (`globalUIState.visible` / expanded and broadcasts). Content only applies that state. No second controller toggling visibility.

### 5.5 Possible message delivery failure

- If the active tab is a restricted URL (e.g. chrome://, edge://) or a tab where the content script didn’t inject, `chrome.tabs.sendMessage(activeTabId, ...)` fails (background catches and ignores). So in those tabs the widget never opens and Start Session / Previous Sessions never reach content.

---

## 6. Root Causes (concise)

| Issue | Root cause |
|-------|------------|
| **Extension does not open (widget)** | Popup opens, but `ECHLY_GET_AUTH_STATE` returns `authenticated: false` because background never calls `getExtensionToken()` when answering auth state. So popup never calls `openWidget()`, and background never runs `openWidgetInActiveTab()` for the icon click. |
| **Start Session does nothing** | (1) Widget often not visible (same auth cause). (2) When visible, if token is missing/expired, createSession() (apiFetch) gets 401 and session is not created. |
| **Previous Sessions does nothing** | (1) Widget not visible (same auth cause). (2) When visible, same token risk for fetchSessions; or modal opens but list fails. |
| **AI processing failed** | Token missing or invalid (401) on structure-feedback or feedback; or other API/network/pipeline errors. Most likely after auth migration: token not obtained or expired. |

---

## 7. Exact Files and Lines Responsible

### 7.1 Extension not opening

- **echly-extension/src/background.ts** — ECHLY_GET_AUTH_STATE handler (around 420–424): returns `sendResponse({ authenticated: !!sw.currentUser, user: sw.currentUser })` without calling `getValidToken()` or `getExtensionToken()` first. So auth state is never hydrated from the dashboard cookie when the user only clicks the icon.
- **echly-extension/src/popup.tsx** — Lines 61–70: if `!auth`, popup never calls `openWidget()`; it only calls `openWidget()` when `auth` is true (line 67).

### 7.2 Start Session

- **echly-extension/src/background.ts** — 278–286: ECHLY_START_SESSION forwards to active tab; if that tab has no content script, the message is dropped (catch empty).
- **echly-extension/src/content.tsx** — 271–283: ECHLY_START_SESSION_REQUEST handler runs `createSession()`; 519–531: `createSession()` uses `apiFetch("/api/sessions", ...)` which depends on ECHLY_GET_EXTENSION_TOKEN and thus a valid token.
- **components/CaptureWidget/CaptureWidget.tsx** — 456–462: “Start Session” in extension mode sends only `ECHLY_START_SESSION` (no direct `onCreateSession`).

### 7.3 Previous Sessions

- **echly-extension/src/background.ts** — 288–295: ECHLY_OPEN_PREVIOUS_SESSIONS forwarded to active tab.
- **echly-extension/src/content.tsx** — 285–289: listener sets `openResumeModalFromMessage(true)`; 252–268: `hasPreviousSessions` uses `apiFetch("/api/sessions?limit=1")` (token required).
- **components/CaptureWidget/CaptureWidget.tsx** — 171–177: `handlePreviousSessions` sends `ECHLY_OPEN_PREVIOUS_SESSIONS`.

### 7.4 AI processing failed

- **echly-extension/src/content.tsx** — handleComplete: multiple branches set job to failed and call `callbacks.onError()` with “AI processing failed.” (e.g. lines 379, 516–518, 547–549, 613–615, 620–623, 451–453, etc.).
- **echly-extension/src/background.ts** — ECHLY_PROCESS_FEEDBACK: 451–453, 471–473, 497–499, 504–506, 521–523, 557–559, 563–565, 576–578, 583–585, 594–596, 619–621, 633–635, 661–663, 707, 721–723, 763, 778, 821, 825–827 (sendResponse success: false or error).
- **app/api/structure-feedback/route.ts** — requireAuth (line 68) and runFeedbackPipeline; 401 or pipeline failure leads to failure response.
- **app/api/feedback/route.ts** — requireAuth; 401 leads to failure.

### 7.5 Auth and token

- **app/api/extension/session/route.ts** — POST: getSessionUser (cookie), then issue extension token.
- **lib/server/session.ts** — getSessionUser (cookie parsing and JWT verify).
- **lib/server/auth.ts** — requireAuth: Bearer (Firebase or extension token) or session cookie.
- **echly-extension/utils/apiFetch.ts** — background’s apiFetch with Bearer token.
- **echly-extension/src/contentAuthFetch.ts** — content’s authFetch via ECHLY_GET_EXTENSION_TOKEN.

---

## 8. Recommendations (summary)

1. **Hydrate auth when popup opens:** In the background handler for `ECHLY_GET_AUTH_STATE`, before responding, call `getValidToken()` (or a non-throwing variant). If it succeeds, set `cachedSessionUser`/`sw.currentUser` and return `authenticated: true`. Then the popup will open the widget and close even when the user has not visited the dashboard this session.
2. **Keep sessionRelay** for dashboard tabs so that visiting the dashboard still primes the token.
3. **Optional:** Add token refresh (e.g. on 401 in background apiFetch) and/or proactive refresh before expiry to reduce “AI processing failed” and Start Session/Previous Sessions failures.
4. **Optional:** When `chrome.tabs.sendMessage(activeTabId, ...)` fails (e.g. restricted URL), show a small in-popup message so the user knows to switch to a normal web page and try again.

This report is analysis-only; no code was modified.
