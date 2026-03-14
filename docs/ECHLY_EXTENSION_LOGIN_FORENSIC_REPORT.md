# Echly Extension Login — Full Forensic Audit Report

**Scope:** Extension authentication and login flow. No code was modified; this is a diagnostic report only.

**Expected flow:**
1. Click extension → If logged in → tray opens immediately; if not → login tab opens.
2. User logs in → Login tab becomes dashboard → Dashboard stays open.
3. User is switched back to the original tab → Extension tray opens automatically.

**Reported problems:**
- New duplicate tabs instead of switching tabs
- Dashboard opens repeatedly
- Extension tray does not open after login
- Login loops
- Extension keeps opening dashboard

---

## PART 1 — Extension Icon Click Flow

**File:** `echly-extension/src/background.ts`

### Handler registration

- **Line 430:** `chrome.action.onClicked.addListener((tab) => { ... })`

### Step-by-step execution

1. **Guard (line 431)**  
   - If `authCheckInProgress === true`, handler returns immediately. No tray, no login tab.

2. **Store origin tab (line 432)**  
   - `originTabId = tab?.id ?? null`  
   - `tab` is the tab where the user clicked the icon (active tab at click time). This is the only place `originTabId` is set.

3. **Session cache fast path (lines 434–439)**  
   - If `sessionCache.authenticated === true` and `(Date.now() - sessionCache.checkedAt) < SESSION_CACHE_TTL_MS` (30s):  
     - Sets `globalUIState.visible = true`, `globalUIState.expanded = true`  
     - `persistUIState()`  
     - `broadcastUIState()`  
     - Returns (no backend call, no tab creation).

4. **Full auth path (lines 441–472)**  
   - `authCheckInProgress = true`  
   - Async IIFE:
     - **Line 424:** `const session = await checkBackendSession()`  
       - `checkBackendSession()` (lines 309–338):  
         - `getValidToken()` (from extension storage: `echlyIdToken`, `echlyRefreshToken`, `echlyTokenTime`; refresh via `refreshIdToken()` if older than 50 min)  
         - If no token or refresh fails → `clearAuthState()`, return `{ authenticated: false }`  
         - `fetch(\`${API_BASE}/api/auth/session\`, { headers: { Authorization: Bearer <token> } })`  
         - If 401/403 → `clearAuthState()`, return `{ authenticated: false }`  
         - Else return session JSON with `authenticated` and `user`
     - **Line 446:** `sessionCache = { authenticated: session.authenticated, checkedAt: Date.now() }`
     - **If authenticated (lines 448–454):**  
       - `globalUIState.user = session.user ?? null`  
       - `globalUIState.visible = true`, `globalUIState.expanded = true`  
       - `persistUIState()`, `broadcastUIState()`  
     - **If not authenticated (lines 455–461):**  
       - `globalUIState.user = null`  
       - Build `loginUrl = ECHLY_LOGIN_BASE + "?extension=true" + (returnUrl ? "&returnUrl=" + encodeURIComponent(returnUrl) : "")`  
       - `returnUrl = typeof tab?.url === "string" ? tab.url : ""` (current tab URL)  
       - **`chrome.tabs.create({ url: loginUrl })`** — one new login tab
     - **On catch (lines 462–469):** same: build login URL, **`chrome.tabs.create({ url: loginUrl })`**
     - **Finally (line 470):** `authCheckInProgress = false`

### Summary

- **Authentication:** Determined by `checkBackendSession()`: stored tokens + `GET ${API_BASE}/api/auth/session`. No dashboard tab or page token bridge used for icon click.
- **Session cache:** Used on click. If cache is valid (authenticated and &lt; 30s), tray opens without calling the backend.
- **When login tab is opened:** When `session.authenticated === false` or when the async auth path throws.
- **When tray is opened:** When cache is valid or when `checkBackendSession()` returns authenticated.
- **Multiple tabs from this path:** Only one login tab per click; `authCheckInProgress` blocks concurrent runs. Duplicate tabs do not come from repeated `onClicked` during one check.

---

## PART 2 — Tab Creation Logic

### All `chrome.tabs.create` / `chrome.tabs.update` / `chrome.tabs.query` usages

**File:** `echly-extension/src/background.ts`

| Location | API | Purpose |
|---------|-----|--------|
| 87 | `chrome.tabs.query({}, ...)` | End session idle: broadcast `ECHLY_RESET_WIDGET` to all tabs |
| 361 | `chrome.tabs.query({}, ...)` | `broadcastUIState()`: send `ECHLY_GLOBAL_STATE` to every tab |
| 461 | `chrome.tabs.create({ url: loginUrl })` | Icon click, not authenticated |
| 469 | `chrome.tabs.create({ url: loginUrl })` | Icon click, catch block (auth error) |
| 517 | `chrome.tabs.update(originTabId, { active: true })` | After `ECHLY_EXTENSION_AUTH_SUCCESS`: focus origin tab |
| 678 | `chrome.tabs.create({ url })` | `ECHLY_OPEN_TAB` message |
| 743 | `chrome.tabs.query({}, ...)` | `ECHLY_SESSION_MODE_END`: broadcast reset to all tabs |
| 783 | `chrome.tabs.create({ url: loginUrl })` | `ECHLY_OPEN_POPUP` (e.g. “Sign in” in tray) |
| 794 | `chrome.tabs.create({ url: loginUrl })` | `ECHLY_SIGN_IN` / `ECHLY_START_LOGIN` / `LOGIN` |
| 1028 | `chrome.tabs.query({}, ...)` | After `ECHLY_PROCESS_FEEDBACK`: broadcast `ECHLY_FEEDBACK_CREATED` to all tabs |

### Why duplicate tabs can appear

1. **Multiple login tabs**  
   - Icon click (not authenticated) → `chrome.tabs.create(loginUrl)` (line 461 or 469).  
   - Same user clicking “Sign in” in the tray (or equivalent) → `ECHLY_OPEN_POPUP` or `ECHLY_SIGN_IN` / `ECHLY_START_LOGIN` / `LOGIN` → another `chrome.tabs.create(loginUrl)` (783, 794).  
   - So: one tab from icon, another from tray “Sign in” = two login tabs.

2. **returnUrl and login URL**  
   - Login URL is built with `returnUrl = tab?.url` (icon click) or `sender.tab?.url` (message handlers).  
   - Used only as query param for the web app; extension does not create a tab per returnUrl.  
   - Incorrect or missing `returnUrl` does not by itself create duplicate tabs; it affects where the web app redirects.

3. **No “dashboard tab” creation in extension**  
   - There is no `chrome.tabs.create({ url: dashboardUrl })` in the current background script.  
   - “Dashboard opens repeatedly” is not caused by the extension creating dashboard tabs; it is the login tab navigating to `/dashboard` after login. Repeated dashboard “opens” are likely repeated redirects to dashboard after each login (e.g. after a loop back to login).

4. **originTabId**  
   - Set only on icon click. Used only in `ECHLY_EXTENSION_AUTH_SUCCESS` to call `chrome.tabs.update(originTabId, { active: true })`.  
   - If the user never clicked the icon (e.g. only used “Sign in” in tray), `originTabId` can still be from an earlier click or null; then we do not switch tabs after login.

### Conclusion on duplicate tabs

- Duplicate **login** tabs: possible when both icon click and tray “Sign in” (or other login messages) are used, or when the same message type is sent multiple times from multiple tabs.  
- Duplicate **browser** tabs from the dashboard: the dashboard page can open `returnUrl` in a **new** tab via `window.open(decoded)` in `DashboardReturnUrlHandler` (`app/(app)/dashboard/page.tsx` lines 294–309). In the current extension flow the login page redirects to `/dashboard` without `returnUrl`, so the dashboard often has no `returnUrl`; if it ever does (e.g. from another flow), that would create an extra tab with the same URL as the original tab.

---

## PART 3 — Login Handoff

**File:** `app/(auth)/login/page.tsx`

### After Firebase login succeeds

1. **Google (handleGoogle, lines 86–99)**  
   - If `isExtension`:  
     - `user.getIdToken()`, `(user as any).refreshToken ?? ""`  
     - `window.chrome.runtime.sendMessage({ type: "ECHLY_EXTENSION_AUTH_SUCCESS", idToken, refreshToken })` (no callback, no await)  
     - `window.location.href = "/dashboard"`  
     - Return (no `checkUserWorkspace` in extension path).

2. **Email (handleEmail, lines 127–139)**  
   - Same: send `ECHLY_EXTENSION_AUTH_SUCCESS` with `idToken` and `refreshToken`, then `window.location.href = "/dashboard"`.

3. **onAuthStateChanged (useEffect, lines 37–65)**  
   - When `user` is set (e.g. already logged in on load):  
     - If `isExtension`: same `sendMessage(ECHLY_EXTENSION_AUTH_SUCCESS, idToken, refreshToken)` then `window.location.href = "/dashboard"`.  
     - Else: redirect to `/dashboard` or `/dashboard?extension=true&returnUrl=...` (with params when not extension path).

### Messages sent to the extension

- **Single message:** `ECHLY_EXTENSION_AUTH_SUCCESS` with `idToken` and `refreshToken`.  
- ID token and refresh token are both sent.  
- No other extension-specific messages are sent from the login page.

### Does `chrome.runtime.sendMessage` succeed?

- The page does **not** wait for a response: it calls `sendMessage(...)` and then immediately does `window.location.href = "/dashboard"`.  
- So the message is fire-and-forget. Chrome typically delivers the message to the background before the page unloads, so the background usually receives it.  
- The background handler returns `true` to keep the message channel open for async `sendResponse`. If the page has already navigated, the response is dropped; the background still runs (store tokens, session check, broadcast, tab switch).

### Redirect after login

- Extension path: **always** `window.location.href = "/dashboard"` (no query params, no `returnUrl` in URL).  
- So the login tab becomes the dashboard tab; the dashboard loads without `returnUrl` in `searchParams` in the current extension flow.

### Exact sequence (login success → dashboard)

1. User completes Google or email login on login page.  
2. Login page: `sendMessage(ECHLY_EXTENSION_AUTH_SUCCESS, idToken, refreshToken)`.  
3. Login page: `window.location.href = "/dashboard"` (same tick).  
4. Background receives message (async): stores tokens, `GET ${API_BASE}/api/auth/session`, then either:  
   - Success: sets `sessionCache`, `globalUIState.user`, `globalUIState.visible = true`, `broadcastUIState()`, `chrome.tabs.update(originTabId, { active: true })`, `sendResponse({ success: true })`.  
   - Failure (e.g. !res.ok or 401/403): `clearAuthState()`, `sendResponse({ success: false })`.  
5. Login tab navigates to `/dashboard` and becomes the dashboard tab.

---

## PART 4 — Extension Auth Storage

**File:** `echly-extension/src/background.ts`

### Does the extension store tokens?

Yes. Tokens are stored in **extension storage** (no dependency on the dashboard tab for token storage).

### Where and which keys

- **Storage:** `chrome.storage.local`  
- **Keys (lines 195, 225):**  
  - `echlyIdToken`  
  - `echlyRefreshToken`  
  - `echlyTokenTime`  
- **Legacy keys removed on clear (lines 199–205):**  
  - `auth_idToken`, `auth_refreshToken`, `auth_expiresAtMs`, `auth_user`

### Refresh token

- Present: `echlyRefreshToken` is stored when the login page sends it and in `refreshIdToken()` (new refresh_token from Firebase is stored if returned).

### Token expiration / refresh logic

- **Token age (lines 297–304):** `getValidToken()` uses `echlyTokenTime`. If `(Date.now() - tokenTime) > TOKEN_MAX_AGE_MS` (50 minutes), it calls `refreshIdToken()`.  
- **Refresh (lines 252–288):** `refreshIdToken()` POSTs to `https://securetoken.googleapis.com/v1/token` with `grant_type=refresh_token&refresh_token=...`, then writes new `echlyIdToken`, `echlyRefreshToken`, `echlyTokenTime` to `chrome.storage.local`.  
- **Clear:** `clearAuthState()` (lines 212–219) removes `ECHLY_TOKEN_KEYS` and legacy keys and clears session cache and tray state.

---

## PART 5 — Session Cache

**File:** `echly-extension/src/background.ts`

### Is sessionCache used?

Yes.

- **Declaration (lines 24–27):**  
  `sessionCache = { authenticated: boolean; checkedAt: number }`, initial `{ authenticated: false, checkedAt: 0 }`.
- **Read (lines 434–435):** On icon click, if `sessionCache.authenticated === true` and `(Date.now() - sessionCache.checkedAt) < SESSION_CACHE_TTL_MS` (30s), tray is opened without calling `checkBackendSession()`.
- **Written:**  
  - After `checkBackendSession()` in icon click (line 446).  
  - In `ECHLY_EXTENSION_AUTH_SUCCESS` after session validation (line 508).  
  - Cleared in `clearSessionCache()` / `clearAuthState()` (line 206).

### Does the 30-second optimization work?

Yes. When the cache is valid, the click handler opens the tray immediately and does not call the backend or touch storage for a token.

### Can sessionCache cause login loops?

Not by itself. The cache only short-circuits the **full** auth check when it is already valid. If the cache is invalid or expired, the handler runs `checkBackendSession()`; it does not force a login. Loops are caused by session validation failing (e.g. backend unreachable or returning 401) and the extension clearing auth and opening the login tab again on the next click.

---

## PART 6 — Token Refresh

**File:** `echly-extension/src/background.ts`

### securetoken.googleapis.com and refresh_token

- **Line 14:** `FIREBASE_REFRESH_URL = "https://securetoken.googleapis.com/v1/token"`  
- **Lines 252–288:** `refreshIdToken()`:  
  - Reads `echlyRefreshToken` from storage.  
  - POSTs to `FIREBASE_REFRESH_URL` with `grant_type=refresh_token&refresh_token=...`.  
  - On success: parses `id_token`, `refresh_token` (optional), updates storage with new id token, new or existing refresh token, and `echlyTokenTime`.  
- **Lines 294–305:** `getValidToken()`: if stored token is older than 50 minutes, calls `refreshIdToken()`.

### Does refresh logic exist?

Yes. ID tokens are refreshed when older than 50 minutes via `getValidToken()` → `refreshIdToken()`.

### When token expires

- If no stored tokens or refresh fails, `getValidToken()` throws `NOT_AUTHENTICATED`.  
- Callers (e.g. `checkBackendSession()`) catch, call `clearAuthState()`, and return unauthenticated; the next icon click can open the login tab again.

---

## PART 7 — Login Loop Analysis

### Why the extension can open the dashboard (login tab) repeatedly

- The extension does **not** create dashboard tabs. It only creates **login** tabs with `chrome.tabs.create({ url: loginUrl })`.  
- After the user logs in, the **same** tab navigates to `/dashboard`. So “dashboard opens repeatedly” is the same as: user is sent to login again and again; each time they log in, that tab becomes the dashboard again. So the loop is: **login tab → user logs in → tab becomes dashboard → something causes “not authenticated” again → next action opens login tab again.**

### Why the tray may not open after login

- In `ECHLY_EXTENSION_AUTH_SUCCESS`, the background:  
  - Stores tokens.  
  - Calls `fetch(\`${API_BASE}/api/auth/session\`)` with the new id token.  
- **`API_BASE` is `http://localhost:3000` (line 8).**  
- If the user is on **production** (e.g. `https://echly-web.vercel.app/login`), the backend they use is production, but the extension always calls **localhost** for `/api/auth/session`.  
- If localhost is not running or returns an error/401:  
  - The handler does `clearAuthState()` and `sendResponse({ success: false })`.  
  - It **never** sets `globalUIState.visible = true` or calls `broadcastUIState()` for the tray.  
- So after login, the tray does not open and stored tokens may be cleared. The next icon click sees no valid session and opens the login tab again → **login loop**.

### Why duplicate tabs appear

- Multiple code paths create a login tab:  
  - Icon click when not authenticated (lines 461, 469).  
  - `ECHLY_OPEN_POPUP` (line 783).  
  - `ECHLY_SIGN_IN` / `ECHLY_START_LOGIN` / `LOGIN` (line 794).  
- If the user both clicks the icon and clicks “Sign in” in the tray (or similar), or if multiple tabs send login-related messages, multiple `chrome.tabs.create(loginUrl)` run → multiple login tabs.  
- Additionally, the dashboard’s `DashboardReturnUrlHandler` uses `window.open(returnUrl)` when `returnUrl` is in the URL. In the current extension flow the dashboard often has no `returnUrl`; when it does, that opens another tab (duplicate of the “original” tab).

### Full runtime sequence (concise)

1. User clicks extension (e.g. on Tab A) → `originTabId = A`, `checkBackendSession()` runs.  
2. No valid token or session (e.g. session check to localhost fails) → `chrome.tabs.create(loginUrl)` → Tab B (login).  
3. User logs in on Tab B → sendMessage(ECHLY_EXTENSION_AUTH_SUCCESS), then redirect to `/dashboard`.  
4. Background: store tokens, `fetch(localhost:3000/api/auth/session)`. If that fails or returns 401 → `clearAuthState()`, tray never opened.  
5. Tab B becomes dashboard.  
6. User clicks extension again (e.g. on Tab A or B) → `checkBackendSession()` again; if tokens were cleared or session check still fails → open login tab again (new Tab C or same flow).  
7. Result: repeated login tabs, dashboard “reopening” as the same tab going to dashboard again, and tray not opening when session validation fails.

**Exact cause of the loop:** Session validation after login is done against `API_BASE` (localhost). If the user is on production or localhost is down, validation fails → auth cleared → next click opens login again. Combined with multiple `chrome.tabs.create(loginUrl)` paths, this produces duplicate login tabs and the impression that “dashboard opens repeatedly” and “extension keeps opening dashboard.”

---

## PART 8 — Original Tab Switching

**File:** `echly-extension/src/background.ts`

### Where originTabId is set

- **Only in the icon click listener (line 432):**  
  `originTabId = tab?.id ?? null`  
  `tab` is the tab passed to `chrome.action.onClicked` (the tab where the user clicked the icon).

### Is it persisted?

- No. It is a **module-level variable** (`let originTabId`, line 18). It is not saved to `chrome.storage` or anywhere else.  
- So it is lost on service worker restart and is only the “last” tab from the last icon click.

### Is chrome.tabs.update executed?

- Yes, in the `ECHLY_EXTENSION_AUTH_SUCCESS` handler (lines 515–520):  
  `if (originTabId != null) { await chrome.tabs.update(originTabId, { active: true }); }`  
  So we do try to focus the origin tab after login.

### Why tab switching can fail

1. **originTabId is null:** If the user never clicked the icon (e.g. only used “Sign in” from the tray), or the service worker restarted after the click, `originTabId` can be null → no switch.  
2. **Tab closed:** If the user closed the tab they had clicked from, `chrome.tabs.update(originTabId, ...)` throws; the catch only logs in debug.  
3. **Wrong tab:** Only the **last** icon-click tab is stored; if the user clicked the icon from several tabs, only the most recent one is used.  
4. **Order of operations:** We broadcast state and then switch tab. If the target tab’s content script is not ready, the tray state can still be applied when that tab is activated (e.g. via `chrome.tabs.onActivated`), so this is less likely to be the main cause of “tray not opening” than the session check failure above.

---

## PART 9 — Tray Opening Logic

**File:** `echly-extension/src/content.tsx`

### What message opens the tray

- The tray is shown when the content script receives **`ECHLY_GLOBAL_STATE`** with a state that satisfies “show tray” (see below).  
- That message is sent by the background via:  
  - `broadcastUIState()` → `chrome.tabs.query({})` then `chrome.tabs.sendMessage(tabId, { type: "ECHLY_GLOBAL_STATE", state: globalUIState })`  
  - Or when the user toggles: `ECHLY_TOGGLE_VISIBILITY` → background sets `globalUIState.visible = true` and calls `broadcastUIState()`.

### Which globalUIState values trigger tray rendering

- **Lines 47–49:**  
  `getShouldShowTray(state) = state.visible === true || state.sessionModeActive === true || state.sessionPaused === true`  
- So the tray is shown when **any** of: `visible`, `sessionModeActive`, or `sessionPaused` is true.

### How content applies it

- **Lines 1579–1585:** In `chrome.runtime.onMessage`, when `msg.type === "ECHLY_GLOBAL_STATE"` and `msg.state` is present:  
  - `setHostVisibility(getShouldShowTray(state))`  
  - `__ECHLY_APPLY_GLOBAL_STATE__?.(state)` and `window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE", ...))`  
- **Lines 196–213, 231–249:** React state and listeners update from `ECHLY_GLOBAL_STATE` (and the custom event), and set `visible` (and related) so the tray UI renders.

### Are those values set after login?

- Yes, in the **background** in the `ECHLY_EXTENSION_AUTH_SUCCESS` handler (lines 509–512):  
  `globalUIState.visible = true`, `globalUIState.expanded = true`, then `persistUIState()` and `broadcastUIState()`.  
- So **if** the auth success handler reaches that point (i.e. session validation succeeds), the tray is set and broadcast. If session validation fails (e.g. localhost call fails), we never set `globalUIState.visible` and may clear state, so the tray never opens.

---

## PART 10 — Final Root Cause Summary

### 1. Why duplicate tabs are created

- **Multiple login tabs:** More than one code path calls `chrome.tabs.create(loginUrl)`: icon click (when not authenticated), `ECHLY_OPEN_POPUP`, and `ECHLY_SIGN_IN` / `ECHLY_START_LOGIN` / `LOGIN`. Using both “extension icon” and “Sign in” in the tray (or multiple tabs sending messages) creates multiple login tabs.  
- **Extra tab from dashboard:** When the dashboard has `returnUrl` in the URL, `DashboardReturnUrlHandler` calls `window.open(returnUrl)`, opening a new tab. In the current extension flow the login page does not pass `returnUrl` to the dashboard, but any flow that does would add a duplicate “original” tab.

### 2. Why the tray does not open

- The tray is opened only when the background sets `globalUIState.visible = true` (and similar) and calls `broadcastUIState()`.  
- After login, that happens only in the `ECHLY_EXTENSION_AUTH_SUCCESS` handler **after** a successful `fetch(\`${API_BASE}/api/auth/session\`)`.  
- **`API_BASE` is hardcoded to `http://localhost:3000`.** If the user is on production or localhost is not running, that request fails or returns 401/403 → handler calls `clearAuthState()` and never sets `globalUIState.visible` → tray never opens.

### 3. Why dashboard redirects keep occurring

- The extension does not redirect the dashboard; it only opens the **login** URL.  
- “Dashboard opens repeatedly” is the same tab (or new login tabs) going: login → dashboard after each login. The “repeat” is the **login loop**: session check fails → auth cleared → next click opens login again → user logs in again → tab becomes dashboard again.

### 4. Does token handoff work?

- **From page to extension:** Yes. The login page sends `ECHLY_EXTENSION_AUTH_SUCCESS` with `idToken` and `refreshToken`, and the background stores them in `chrome.storage.local`.  
- **Usage after handoff:** Fails when **validation** fails. The background validates by calling `GET ${API_BASE}/api/auth/session`. If `API_BASE` is localhost and the app is production (or localhost is down), validation fails and the extension clears the stored tokens and never opens the tray, which drives the login loop.

### 5. Which exact files must be fixed

| File | Issue / fix direction |
|------|------------------------|
| **echly-extension/src/background.ts** | Use correct `API_BASE` for the environment (e.g. production API when user logs in on production). Ensure session validation uses the same backend as the web app. |
| **echly-extension/src/background.ts** | Avoid duplicate login tabs: e.g. check for an existing login/dashboard tab before `chrome.tabs.create(loginUrl)`; or reuse/focus that tab instead of creating a new one for `ECHLY_OPEN_POPUP` / `ECHLY_SIGN_IN` / `ECHLY_START_LOGIN` / `LOGIN`. |
| **echly-extension/src/background.ts** | Persist or more robustly set `originTabId` (e.g. when opening the login tab, store the tab id to switch back to in storage or a dedicated variable that survives restarts), and ensure we only open one login tab per flow. |
| **app/(app)/dashboard/page.tsx** | `DashboardReturnUrlHandler`: opening `returnUrl` in a **new** tab duplicates the original tab. Consider not opening a new tab when coming from the extension (e.g. let the extension switch to the origin tab via `chrome.tabs.update`), or only open `returnUrl` when it’s not the same as the tab the extension will focus. |
| **app/(auth)/login/page.tsx** | Optional: pass `returnUrl` to dashboard when `isExtension` so the dashboard knows the “origin” URL; then dashboard and extension can coordinate so only one tab shows the original page (no duplicate). |

**Primary fix:** Align `API_BASE` (or the session check URL) with the environment the user is actually using (e.g. production API for production login). That will stop the post-login session validation from failing, allow the tray to open, and break the login loop. The other changes address duplicate tabs and tab-switching behavior.

---

*End of forensic report. No code was modified.*
