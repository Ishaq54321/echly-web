# Echly Chrome Extension — Full System Audit Diagnostic Report

**Date:** 2025-03-14  
**Scope:** Authentication and UI flow. No code changes; diagnostic only.  
**Reference behavior:** Loom-style — icon click → background checks auth → if authenticated open tray, if not open login tab; tray must never show “Sign in” state; tray only when authenticated; auth only in background.

---

## AUDIT SECTION 1 — AUTH ENTRY POINTS

Every place authentication is triggered:

| FILE | FUNCTION | WHY IT IS CALLED | WHEN IT IS TRIGGERED |
|------|----------|------------------|----------------------|
| **echly-extension/src/background.ts** | `getTokenFromPage()` | Get Firebase ID token from a dashboard tab via content script → page bridge | Called by `checkBackendSession()`, `getValidToken()`, `prewarmAuthSession()` |
| **echly-extension/src/background.ts** | `getValidToken()` | Ensure a valid token exists; throws `NOT_AUTHENTICATED` if none | Called by `checkBackendSession()`, `initializeSessionState()`, message handlers for `ECHLY_SET_ACTIVE_SESSION`, `ECHLY_GET_TOKEN`, `ECHLY_UPLOAD_SCREENSHOT`, `ECHLY_PROCESS_FEEDBACK`, and `echly-api` |
| **echly-extension/src/background.ts** | `checkBackendSession()` | Single source of truth: token + GET /api/auth/session | Icon click (`chrome.action.onClicked`), `ECHLY_GET_AUTH_STATE` message handler, `refreshExtensionAuth()` |
| **echly-extension/src/background.ts** | `prewarmAuthSession()` | Warm sessionCache when a dashboard tab exists | `chrome.runtime.onStartup`, `chrome.runtime.onInstalled`, `chrome.tabs.onUpdated` (dashboard tab `status === "complete"`) |
| **echly-extension/src/background.ts** | `refreshExtensionAuth()` | Update sessionCache after login | When background receives `ECHLY_EXTENSION_LOGIN_COMPLETE` |
| **echly-extension/src/background.ts** | `validateSessionWithBackend()` (deprecated) | Legacy session check | Not called in current flows; deprecated in favor of `checkBackendSession()` |
| **echly-extension/src/background.ts** | Message handler `ECHLY_GET_AUTH_STATE` | Answer content/popup auth state request | When any context sends `chrome.runtime.sendMessage({ type: "ECHLY_GET_AUTH_STATE" })` (content does **not** send this; comment says “no ECHLY_GET_AUTH_STATE”) |
| **echly-extension/src/requestTokenFromPage.ts** | `requestTokenFromPage()` | Request token from page via postMessage to bridge | When background sends `ECHLY_GET_TOKEN_FROM_PAGE` to a tab; content script handler calls this and responds with `{ token }` |
| **echly-extension/src/pageTokenBridge.js** | (inline) message listener | Read `window.firebase.auth().currentUser`, call `user.getIdToken()`, respond with token | When content script sends `ECHLY_REQUEST_TOKEN` on negotiated channel (dashboard origins only) |
| **echly-extension/src/contentAuthFetch.ts** | `authFetch()` / `apiFetch()` | Proxy API calls through background with Bearer token | Content script API calls (sessions, feedback, tickets, etc.); background resolves token via `getValidToken()` in `echly-api` handler |
| **app/(auth)/login/page.tsx** | `handleGoogle` / `handleEmail` | After Firebase sign-in, send extension login complete | After successful sign-in when `isExtension` (from `?extension=true`); sends `ECHLY_EXTENSION_LOGIN_COMPLETE` then redirects to `/dashboard` |
| **lib/authFetch.ts** (web app) | Uses `auth.currentUser`, `getCachedIdToken(user)` | Dashboard API calls with Bearer token | All authenticated dashboard API requests |
| **components/EchlyExtensionTokenProvider.tsx** (web) | `user.getIdToken()` | Provide token to extension bridge context | Web app only; bridge uses `window.firebase.auth().currentUser.getIdToken()` |

**Summary:** Auth is triggered by icon click (`checkBackendSession()`), prewarm (startup/install/dashboard tab load), login-complete message (`refreshExtensionAuth()`), and any message that needs a token (`ECHLY_GET_AUTH_STATE`, `ECHLY_GET_TOKEN`, `ECHLY_SET_ACTIVE_SESSION`, API proxy, etc.). Content script does not initiate auth checks; it only responds to `ECHLY_GET_TOKEN_FROM_PAGE` (token relay) and uses `apiFetch` (which triggers auth in background).

---

## AUDIT SECTION 2 — EXTENSION MESSAGE SYSTEM

| MESSAGE NAME | SENDER | RECEIVER | PURPOSE |
|--------------|--------|----------|---------|
| **ECHLY_GET_AUTH_STATE** | (any; content does **not** send) | background.ts | Request auth state; background runs `checkBackendSession()` and responds with `{ authenticated, user }`. Content relies on ECHLY_GLOBAL_STATE / ECHLY_AUTH_STATE_UPDATED instead. |
| **ECHLY_GET_TOKEN_FROM_PAGE** | background.ts (to tab) | content.tsx (ensureMessageListener) | Get Firebase token from page; content calls `requestTokenFromPage()` and responds `{ token }`. |
| **ECHLY_GET_GLOBAL_STATE** | content.tsx | background.ts | Request full global UI state (visibility, session, user, etc.); used on mount and on visibilitychange. |
| **ECHLY_GLOBAL_STATE** | background.ts (to all tabs) | content.tsx | Push global UI state (visibility, expanded, sessionId, user, pointers, etc.); content applies and shows/hides tray. |
| **ECHLY_EXTENSION_LOGIN_COMPLETE** | login page (postMessage → content) or content (forward) | background.ts | Notify login done; background runs `refreshExtensionAuth()`. |
| **ECHLY_OPEN_POPUP** | content.tsx (Sign in button) | background.ts | Open login tab; background creates tab with login URL. |
| **ECHLY_SIGN_IN** / **ECHLY_START_LOGIN** / **LOGIN** | (legacy) | background.ts | Same as ECHLY_OPEN_POPUP: open login tab. |
| **ECHLY_TOGGLE_VISIBILITY** | (external/content) | background.ts | Set visible/expanded and broadcast. |
| **ECHLY_EXPAND_WIDGET** / **ECHLY_COLLAPSE_WIDGET** | content.tsx | background.ts | Update expanded state and broadcast. |
| **ECHLY_RESET_WIDGET** | background.ts (to tabs) | content.tsx | Reset widget (e.g. after session end). |
| **ECHLY_SESSION_STATE_SYNC** | background.ts (on tab activation) | content.tsx | Tab focused; content requests ECHLY_GET_GLOBAL_STATE and applies. |
| **ECHLY_SET_ACTIVE_SESSION** | content.tsx | background.ts | Set active session; background may call getValidToken() for feedback/sessions. |
| **ECHLY_OPEN_TAB** | content.tsx | background.ts | Open URL in new tab (e.g. dashboard session URL). |
| **ECHLY_FEEDBACK_CREATED** | content.tsx | background.ts | Notify new feedback ticket for global pointers. |
| **ECHLY_SET_CAPTURE_MODE** | CaptureWidget/content | background.ts | Set voice/text mode. |
| **ECHLY_SESSION_UPDATED** / **ECHLY_TICKET_UPDATED** | content.tsx | background.ts | Sync session title / ticket updates. |
| **ECHLY_SESSION_MODE_START/PAUSE/RESUME/END** | content.tsx | background.ts | Session lifecycle; end clears session and sends ECHLY_RESET_WIDGET to tabs. |
| **ECHLY_UPLOAD_SCREENSHOT** / **ECHLY_PROCESS_FEEDBACK** | content.tsx | background.ts | Upload/process; background uses getValidToken(). |
| **ECHLY_AUTH_STATE_UPDATED** | background.ts (documented in comment) | content.tsx | Content has listener to update `user`; **background never sends this** (see Section 10). |
| **echly-api** | contentAuthFetch.ts | background.ts | Proxy fetch with Bearer token (getValidToken()). |
| **ECHLY_GET_TOKEN** | (any) | background.ts | Get token for caller; getValidToken() in background. |
| **START_RECORDING** / **STOP_RECORDING** | content.tsx | background.ts | Toggle isRecording in global state. |
| **CAPTURE_TAB** | content.tsx | background.ts | Capture visible tab screenshot. |

**postMessage (page ↔ content):**  
- Content → page: handshake (`ECHLY_BRIDGE_HANDSHAKE`), then `ECHLY_REQUEST_TOKEN` (secureBridgeChannel / requestTokenFromPage).  
- Page (pageTokenBridge.js) → content: `ECHLY_BRIDGE_READY`, `ECHLY_TOKEN_RESPONSE` with token.  
- Login page / dashboard: `ECHLY_EXTENSION_LOGIN_COMPLETE` from page; content forwards to background via chrome.runtime.sendMessage.

---

## AUDIT SECTION 3 — TRAY RENDERING LOGIC

- **Which file renders the tray?**  
  **echly-extension/src/content.tsx**. The tray is the shadow host + React root rendered by `mountReactApp(host)` (createRoot + render of `<ContentApp />`). The visible UI is inside `ContentApp`: when `user` is null it renders the “Sign in to capture feedback…” block; when `user` is set it renders the full `CaptureWidget`.

- **What conditions allow tray to render?**  
  - The **host** (shadow host) is shown when `getShouldShowTray(state)` is true:  
    `state.visible === true || state.sessionModeActive === true || state.sessionPaused === true`.  
  - So the tray **container** is visible if the background has set `visible` to true, or session is active/paused.  
  - **Inside** the tray, if `!user` the content script shows the “Sign in” UI; if `user` it shows the main widget.

- **Does tray render before auth check?**  
  Yes, indirectly.  
  - On load: content runs `syncInitialGlobalState(host)` which sends `ECHLY_GET_GLOBAL_STATE` and applies result; `getShouldShowTray(normalized)` drives `host.style.display`. So if persisted `trayVisible` was true (from a previous session), the tray can be shown **before** any new auth check.  
  - On icon click: background runs `checkBackendSession()` first; only if `session.authenticated === true` does it set `globalUIState.visible = true` and broadcast. So for that path the tray is not shown before auth. But the tray **can** already be visible from persisted state or from a previous broadcast with `visible: true` and `user: null`.

- **Is there a “Sign in” UI state inside the tray?**  
  Yes. In **content.tsx** (lines ~1216–1294), when `!user` and `globalState.visible` (and optionally expanded), the component renders:  
  - “Sign in to capture feedback and manage sessions.”  
  - A “Sign in” button that calls `requestOpenLoginPage()` → `ECHLY_OPEN_POPUP` → background opens login tab.  
  So the tray **does** show a “Sign in” state when the tray is visible but `user` is null (architectural violation: tray should not exist when not authenticated).

---

## AUDIT SECTION 4 — LOGIN UI DETECTION (“Sign in to capture feedback”)

- **File:** echly-extension/src/content.tsx  
- **Component:** `ContentApp` (functional component), inside the branch `if (!user) { return ( ... ); }`.  
- **Render condition:**  
  - `user` is null/undefined, **and**  
  - `globalState.visible === true` (and for the expanded panel, `globalState.expanded === true`).  
- **Why this UI appears:**  
  - Background can set `globalUIState.visible = true` only on icon click when authenticated; **but** `visible` is also **persisted** as `trayVisible` and restored in `initializeSessionState()`.  
  - When auth is cleared (e.g. 401, logout, or no token), `clearAuthState()` sets `globalUIState.user = null` and clears session cache; it does **not** set `globalUIState.visible = false`.  
  - So after session expiry or logout, or on a new load with previously persisted `trayVisible === true`, the background can still broadcast (or content can receive via ECHLY_GET_GLOBAL_STATE) `visible: true` and `user: null`.  
  - Content then shows the tray (because `getShouldShowTray` is true) and, because `!user`, shows “Sign in to capture feedback and manage sessions.” So the “Sign in” UI appears whenever the tray is visible and the extension state has no user, which violates “tray should never show Sign in state.”

---

## AUDIT SECTION 5 — EXTENSION CLICK FLOW

**Location:** `chrome.action.onClicked.addListener` in **echly-extension/src/background.ts** (line ~435).

**Exact execution flow:**

1. User clicks extension icon → `chrome.action.onClicked` fires with `(tab)`.
2. **Guard:** If `authCheckInProgress` is true, listener returns immediately (no second concurrent run).
3. Set `authCheckInProgress = true`.
4. **Async block (fire-and-forget):**
   - **Auth:** `const session = await checkBackendSession()`:
     - `getValidToken()` → `getTokenFromPage()`:
       - Query all tabs; try active tab first, then each dashboard-origin tab.
       - For each candidate: `chrome.tabs.sendMessage(tabId, { type: "ECHLY_GET_TOKEN_FROM_PAGE" })` with timeout (TOKEN_REQUEST_TIMEOUT_MS 2000 ms).
       - Content script in that tab runs `requestTokenFromPage()` (handshake + postMessage token request to page; page bridge calls `window.firebase.auth().currentUser.getIdToken()` and responds).
       - Return first non-null token or null.
     - If no token: `clearAuthState()`, return `{ authenticated: false }`.
     - If token: `fetch(API_BASE + "/api/auth/session", { headers: { Authorization: "Bearer " + token } })`; if !res.ok then clearAuthState and return not authenticated; else return session JSON.
   - **Update cache:** `sessionCache = { authenticated: session.authenticated, checkedAt: Date.now() }`.
   - **If authenticated:**
     - Set `globalUIState.user = session.user ?? null`, `globalUIState.visible = true`, `globalUIState.expanded = true`.
     - `persistUIState()` (persist trayVisible, trayExpanded).
     - `broadcastUIState()` → for each tab `chrome.tabs.sendMessage(tabId, { type: "ECHLY_GLOBAL_STATE", state: globalUIState })`.
   - **If not authenticated:**
     - Set `globalUIState.user = null`.
     - Build login URL with returnUrl from `tab?.url`, `chrome.tabs.create({ url: loginUrl })`.
   - **finally:** `authCheckInProgress = false`.

5. **Content script (UI):**  
   - On `ECHLY_GLOBAL_STATE`, content applies state (setHostVisibility(getShouldShowTray(state)), setGlobalState, setUser from state.user).  
   - So **after** the async block, if authenticated the tray appears with user set; if not authenticated no tray is shown and a login tab is opened.  

**Conclusion:** On click, auth is checked first; tray is shown only when authenticated. The violation is not this path but (1) persisted `trayVisible` restoring visible when user is null, and (2) no clearing of `visible` when auth is lost.

---

## AUDIT SECTION 6 — DASHBOARD TAB CREATION

- **Which code creates dashboard tabs?**  
  - **background.ts:**  
    - `chrome.tabs.create({ url: loginUrl })` when **not** authenticated on icon click (lines ~457, 465).  
    - Same for `ECHLY_OPEN_POPUP` (line ~727) and `ECHLY_SIGN_IN` / `ECHLY_START_LOGIN` / `LOGIN` (lines ~738–739).  
  - Login URL is `ECHLY_LOGIN_BASE + "?extension=true" + (returnUrl ? "&returnUrl=" + encodeURIComponent(returnUrl) : "")` (echly-web.vercel.app/login).  
  - **content.tsx:** Sends `ECHLY_OPEN_TAB` with URL like `${APP_ORIGIN}/dashboard/${sessionId}` (e.g. “Start Session” / open session); background creates tab at that URL (line ~623).

- **Under what conditions?**  
  - Login tab: when user is not authenticated and (1) clicks icon, or (2) clicks “Sign in” in tray (ECHLY_OPEN_POPUP), or (3) legacy sign-in messages.  
  - Dashboard tab: when user chooses to open a session URL via ECHLY_OPEN_TAB (extension does not auto-create dashboard tabs for auth; comment in getTokenFromPage: “Extension must NEVER create dashboard tabs automatically”).

- **Can multiple auth checks create multiple dashboard tabs?**  
  - **Login tabs:** Yes. Each of the following can create a login tab: one icon click (when not authenticated), one ECHLY_OPEN_POPUP (Sign in button), and each of ECHLY_SIGN_IN / ECHLY_START_LOGIN / LOGIN if sent. Rapid double-clicks are partially guarded by `authCheckInProgress`, but if the user clicks “Sign in” in the tray in multiple tabs, each sends ECHLY_OPEN_POPUP and each creates a login tab. So multiple login tabs are possible.  
  - **Dashboard tabs:** Created only via ECHLY_OPEN_TAB (user action in UI). No automatic creation by auth checks.

---

## AUDIT SECTION 7 — CONTENT SCRIPT AUTH BEHAVIOR

Content script must not perform auth checks. Findings:

| FILE | FUNCTION / LOCATION | AUTH LOGIC |
|------|---------------------|------------|
| **content.tsx** | `requestTokenFromPage()` (called from message listener) | Content does **not** decide auth; it only **relays** the token request from background to the page (postMessage) and returns the result. So this is token relay, not “auth check” in the sense of deciding if the user is logged in. |
| **content.tsx** | `apiFetch()` / `contentAuthFetch` | Content calls apiFetch for sessions, feedback, tickets, etc. Auth is performed in the **background** (echly-api handler uses getValidToken()). Content does not check auth before calling. |
| **content.tsx** | `user` state and “Sign in” UI | Content derives `user` from `globalState.user` and from `ECHLY_AUTH_STATE_UPDATED` (see below). It does not call Firebase or check tokens itself. |
| **content.tsx** | No `ECHLY_GET_AUTH_STATE` sent | Comment and code confirm content does not send ECHLY_GET_AUTH_STATE; it uses ECHLY_GET_GLOBAL_STATE and ECHLY_AUTH_STATE_UPDATED for auth-related UI. |

**Verdict:** Content script does not perform auth checks (no Firebase, no session endpoint). It only relays token requests for the background and uses state pushed from the background. The only “auth-related” behavior is reacting to `user` and showing Sign in UI, which is a UI/architecture issue, not an auth check in the content layer.

---

## AUDIT SECTION 8 — TOKEN BRIDGE (pageTokenBridge.js)

- **How extension retrieves Firebase token:**  
  1. Background needs a token → calls `getTokenFromPage()`.  
  2. For a dashboard-origin tab, background sends `ECHLY_GET_TOKEN_FROM_PAGE` to that tab’s content script.  
  3. Content script runs `requestTokenFromPage()`: performHandshake (postMessage ECHLY_BRIDGE_HANDSHAKE → page replies ECHLY_BRIDGE_READY), then postMessage ECHLY_REQUEST_TOKEN with channel/nonce/source.  
  4. **pageTokenBridge.js** (injected only on dashboard origins) listens for messages. On token request it reads `window.firebase && window.firebase.auth && window.firebase.auth().currentUser`; if user exists it calls `user.getIdToken()` and sends ECHLY_TOKEN_RESPONSE with token to `event.origin`; otherwise sends token: null.  
  5. Content script receives the response and sends `{ token }` back to the background.

- **Does it require dashboard tab to exist?**  
  Yes. Token is only available from a page where the bridge is injected (manifest: pageTokenBridge.js matches echly-web.vercel.app and localhost:3000). So at least one tab with dashboard origin must exist and have the bridge loaded.

- **What happens if dashboard tab does not exist?**  
  `getTokenFromPage()` tries active tab then all tabs; none are dashboard origin → no token is returned. `getValidToken()` throws NOT_AUTHENTICATED, `checkBackendSession()` returns `{ authenticated: false }`. Background does not create a dashboard tab (by design). User must open login (or dashboard) via icon click or “Sign in” button, which opens the login tab; after redirect that tab becomes the dashboard and can then supply the token.

---

## AUDIT SECTION 9 — LOGIN REDIRECT FLOW

- **Login page:** app/(auth)/login/page.tsx. Reads `extension=true` and `returnUrl` from search params.
- **On success (extension flow):**  
  - Sends `window.chrome.runtime.sendMessage({ type: "ECHLY_EXTENSION_LOGIN_COMPLETE" })` (if available).  
  - Then `window.location.href = "/dashboard"` (hardcoded). So **returnUrl is not used** for the redirect when `isExtension` is true; user always goes to /dashboard.
- **Background:** On ECHLY_EXTENSION_LOGIN_COMPLETE, runs `refreshExtensionAuth()` which only updates `sessionCache` (see Section 10). It does **not** update `globalUIState.user` or broadcast ECHLY_AUTH_STATE_UPDATED or ECHLY_GLOBAL_STATE with user. So extension UI state is not updated after login.
- **Dashboard remaining open:** The login tab navigates to /dashboard, so that tab becomes the dashboard tab and stays open. There is no code that closes it. “Dashboard tab not staying open” may refer to user closing it, or to multiple tabs (e.g. multiple login tabs) and confusion about which tab is the “dashboard.”

---

## AUDIT SECTION 10 — CONCURRENCY RISKS

- **authCheckInProgress:** Only one icon-click auth flow runs at a time; second click is ignored while the first is in progress. This prevents double login tabs from double icon clicks.
- **Multiple tabs:**  
  - Each tab has its own content script. When background broadcasts ECHLY_GLOBAL_STATE, all tabs receive it.  
  - If the user has the tray open (visible) in multiple tabs and clicks “Sign in” in each, each sends ECHLY_OPEN_POPUP and the background creates a **new login tab** for each. So **multiple login tabs** can be created by multiple “Sign in” clicks across tabs.
- **Multiple messages triggering auth:**  
  - `ECHLY_GET_AUTH_STATE`: any sender can trigger it; each call runs `checkBackendSession()` (no dedupe).  
  - `ECHLY_EXTENSION_LOGIN_COMPLETE`: can be sent from login page and/or content (postMessage forwarder). Each reception runs `refreshExtensionAuth()`. Multiple receipts → multiple concurrent `checkBackendSession()` and `getTokenFromPage()` runs.  
  - `prewarmAuthSession()` runs on startup, install, and every dashboard tab completion; multiple dashboard tabs loading can trigger multiple prewarms.
- **Tab explosion (multiple login/dashboard tabs):**  
  - **Multiple login tabs:** (1) User clicks icon when not authenticated → one login tab. (2) User sees “Sign in” in tray (because tray is visible with user=null) and clicks “Sign in” → ECHLY_OPEN_POPUP → another login tab. (3) Same in another tab → another login tab. (4) Legacy ECHLY_SIGN_IN / LOGIN could open more.  
  - **Dashboard tabs:** Only created by ECHLY_OPEN_TAB (e.g. opening a session URL). Not created by auth checks. So “multiple dashboard tabs” are from explicit user actions, not from duplicate auth checks.

---

## CRITICAL BUG: refreshExtensionAuth() does not broadcast auth state

**In background.ts:**

- **Comment (line ~474):** “Runs checkBackendSession then **broadcasts ECHLY_AUTH_STATE_UPDATED** to all tabs.”
- **Actual implementation (lines 378–386):**  
  `refreshExtensionAuth()` only runs `checkBackendSession()` and sets `sessionCache`. It does **not** set `globalUIState.user`, does **not** call `broadcastUIState()`, and does **not** send `ECHLY_AUTH_STATE_UPDATED` to any tab.

**In content.tsx:**

- A listener (lines 354–372) listens for `ECHLY_AUTH_STATE_UPDATED` and updates `user` from `msg.user`. Since the background never sends this message after login, the widget’s `user` is never updated by the login-complete flow. So “login not updating extension state” is directly caused by this missing broadcast (and missing globalUIState.user update) in `refreshExtensionAuth()`.

---

## FINAL SUMMARY

### 1) Architectural violations

- **Tray when logged out:** Tray visibility is driven by `visible` (and session state). `visible` is persisted as `trayVisible` and restored on load. When auth is cleared, `clearAuthState()` does not set `visible = false`. So the tray can remain visible (or reappear on reload) with `user === null`, showing “Sign in” — violating “tray should never show Sign in state” and “tray only when authenticated.”
- **Auth responsibility:** Auth is correctly centralized in the background (checkBackendSession, getTokenFromPage, sessionCache). Content does not perform auth checks. Violation is in **visibility** and **post-login state**: visibility is not tied to authenticated state, and post-login update is missing.

### 2) Duplicate auth checks

- Multiple entry points can run `checkBackendSession()`: icon click, ECHLY_GET_AUTH_STATE, refreshExtensionAuth(), and prewarm (startup/install/tab complete). No single “auth request” deduplication across these.
- `refreshExtensionAuth()` runs on every ECHLY_EXTENSION_LOGIN_COMPLETE; if both login page and content forward the message, it runs twice. Multiple dashboard tabs completing can trigger multiple prewarms.

### 3) Tray rendering bug

- Tray is shown whenever `getShouldShowTray(state)` is true (visible or session active/paused), regardless of `user`. So tray can render with `user === null` when: (1) tray was previously visible and visibility was persisted, or (2) visibility was set true in the past and never cleared when auth was lost. Content then renders “Sign in to capture feedback and manage sessions.” inside the tray. Correct behavior (Loom-style) would be: do not show the tray at all when not authenticated.

### 4) Login redirect issues

- After login, redirect is always to `/dashboard` when `extension=true`; `returnUrl` is not used for that redirect.
- `refreshExtensionAuth()` does not update extension UI state (no globalUIState.user, no broadcast). So after login, widget state is not updated until the user clicks the icon again (which runs checkBackendSession and then sets user and broadcasts).
- If the login tab navigates away before the background runs getTokenFromPage(), token may be null and refreshExtensionAuth() will leave sessionCache unauthenticated; combined with no broadcast, UI stays “not logged in.”

### 5) Extension messaging problems

- **ECHLY_AUTH_STATE_UPDATED:** Documented and listened for in content, but **never sent** by the background. So the “auth state updated” path after login is broken.
- **ECHLY_GET_AUTH_STATE:** Implemented in background but not used by content (content uses ECHLY_GET_GLOBAL_STATE and expects user in state or in ECHLY_AUTH_STATE_UPDATED). Inconsistency between “get auth state” and “get global state” and “auth state updated” leads to missing updates after login.
- **Visibility vs. auth:** Messages carry `visible` and `user` independently; visibility is not automatically cleared when auth is lost, so messaging does not enforce “tray only when authenticated.”

---

**End of diagnostic report. No fixes proposed; for remediation, see follow-up recommendations.**
