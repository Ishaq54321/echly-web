# Echly Chrome Extension & Dashboard — Full System Audit

**Scope:** Full system audit of extension and dashboard authentication state. No code was modified; this is a diagnostic report only.

**Reported issues under diagnosis:**
- Clicking the extension sometimes redirects to the dashboard even when already logged in
- Extension tray does not always open when dashboard is already open
- Extension authentication state may not match dashboard authentication state
- Extension may not be validating session correctly
- Plan / usage limits may not be synchronized between extension and dashboard

---

## PART 1 — Extension Auth State

**File:** `echly-extension/src/background.ts`

### 1. How the extension determines if the user is authenticated

- **Source of truth:** Backend session check via `GET /api/auth/session` with a valid Bearer token. Stored tokens alone do not imply “authenticated”; the extension treats the user as authenticated only when `checkBackendSession()` returns `{ authenticated: true }` (or when the 30s session cache is valid; see below).
- **Flow:**
  1. **Token source:** Tokens are read from `chrome.storage.local` (`echlyIdToken`, `echlyRefreshToken`, `echlyTokenTime`) via `getStoredTokens()` (lines 256–277). The extension does **not** use the page token bridge or dashboard tab for the icon-click auth check; it uses only extension-stored tokens.
  2. **Valid token:** `getValidToken()` (lines 325–334) returns the stored ID token, or refreshes it via Firebase securetoken if older than 50 minutes (`TOKEN_MAX_AGE_MS`). Throws `NOT_AUTHENTICATED` if no tokens or refresh fails.
  3. **Backend check:** `checkBackendSession()` (lines 341–368) calls `getValidToken()`, then `fetch(API_BASE + '/api/auth/session', { headers: { Authorization: 'Bearer ' + token } })`. On 401/403 or network error it calls `clearAuthState()` and returns `{ authenticated: false }`. On success it returns the JSON body (`authenticated`, `user`).

**Code references:**  
`getStoredTokens` 256–277, `getValidToken` 325–334, `checkBackendSession` 341–368, `clearAuthState` 248–255.

### 2. What tokens are stored in chrome.storage.local

- **Current keys:** `echlyIdToken`, `echlyRefreshToken`, `echlyTokenTime` (see `ECHLY_TOKEN_KEYS` line 230).
- **Legacy (cleaned on clear):** `auth_idToken`, `auth_refreshToken`, `auth_expiresAtMs`, `auth_user` (`AUTH_STORAGE_KEYS_LEGACY` 234–239).
- **Other persisted UI/session:** `trayVisible`, `trayExpanded`, `activeSessionId`, `sessionModeActive`, `sessionPaused` (used by `initializeSessionState` / `persistUIState` / `persistSessionLifecycleState`).

### 3. When tokens are refreshed

- **Condition:** When the ID token is older than 50 minutes (`TOKEN_MAX_AGE_MS` = 50 * 60 * 1000). See `getValidToken()` (lines 325–334): if `Date.now() - stored.tokenTime > TOKEN_MAX_AGE_MS`, it calls `refreshIdToken()`.
- **Mechanism:** `refreshIdToken()` (lines 283–321) POSTs to Firebase `https://securetoken.googleapis.com/v1/token` with `grant_type=refresh_token` and the stored refresh token, then writes the new `id_token` and optional new `refresh_token` plus `echlyTokenTime: Date.now()` to `chrome.storage.local`.

### 4. When tokens are cleared

- **`clearAuthState()`** (248–255): Removes `ECHLY_TOKEN_KEYS` and `AUTH_STORAGE_KEYS_LEGACY` from storage, clears `sessionCache` and `globalUIState.user`, sets tray invisible, persists UI state, and broadcasts. It is called when:
  - `checkBackendSession()` gets 401/403 or throw (350–352, 364–365).
  - `getValidToken()` throws (349).
  - `validateSessionAndOpenTray()` fails (412–414, 417–418, 439–440).
  - Various handlers on 401/403 from API calls (e.g. feedback, sessions, upload-screenshot, structure-feedback, echly-api).
  - `ECHLY_EXTENSION_AUTH_SUCCESS` handler on error (428).
  - `initializeSessionState()` when feedback fetch returns 401/403 (191–194, 207–212).
  - `ECHLY_SET_ACTIVE_SESSION` when feedback/sessions return 401/403 (451–452, 461).

### 5. Whether the extension uses sessionCache correctly

- **Definition:** `sessionCache` (59–62) is in-memory only: `{ authenticated: boolean; checkedAt: number }`. TTL is 30 seconds (`SESSION_CACHE_TTL_MS`).
- **Set to true:** In `validateSessionAndOpenTray()` after a successful `/api/auth/session` (419). In `checkBackendSession()` the caller (icon click handler) sets `sessionCache = { authenticated: session.authenticated, checkedAt: Date.now() }` (446). In `prewarmSessionFromStorage()` when `/api/auth/session` is OK (371–374).
- **Set to false / cleared:** In `clearSessionCache()` (243–246), which is called from `clearAuthState()`. Also in `prewarmSessionFromStorage()` on non-OK or catch (375–378).
- **Usage on icon click (392–396):** If `sessionCache.authenticated === true` and `(Date.now() - sessionCache.checkedAt) < SESSION_CACHE_TTL_MS`, the handler opens the tray immediately (sets visible/expanded, persist, broadcast) and returns **without** calling `checkBackendSession()`. So the cache is used correctly as a short-lived fast path; once it expires (>30s) or is cleared (e.g. 401), the full backend check runs again.

**Caveat:** Prewarm runs only on `chrome.runtime.onStartup` and `onInstalled` (383–389). If the user has been idle >30s and has not triggered another backend check, the first icon click after that will always hit the full auth path (no prewarm when a dashboard tab loads).

---

### Trace: checkBackendSession()

1. **Lines 345–349:** `token = await getValidToken()`. If this throws (no tokens or refresh failed), `clearAuthState()` and return `{ authenticated: false }`.
2. **Lines 351–354:** `fetch(API_BASE + '/api/auth/session', { headers: { Authorization: 'Bearer ' + token } })`.
3. **Lines 355–358:** If `res.status === 401 || res.status === 403`, `clearAuthState()`, return `{ authenticated: false }`.
4. **Lines 359–361:** If `!res.ok`, return `{ authenticated: false }` (no clear).
5. **Lines 362–365:** Parse JSON and return `{ authenticated, user }`. On catch (366–368): `clearAuthState()`, return `{ authenticated: false }`.

**Full authentication flow (icon click, cache miss):**

1. User clicks extension icon → `chrome.action.onClicked` (392).
2. `originTabId = tab?.id`.
3. Session cache check: if valid (authenticated and <30s) → open tray and return.
4. Otherwise `authCheckInProgress = true`, then async:
   - `session = await checkBackendSession()` (get token from storage, optionally refresh, GET /api/auth/session).
   - `sessionCache = { authenticated: session.authenticated, checkedAt: Date.now() }`.
   - If authenticated: set user, visible, expanded, persist, broadcast (tray opens).
   - If not: build `loginUrl`, call `openOrFocusLoginTab(loginUrl)` (see Part 2).
   - On catch: same login tab open.
   - Finally: `authCheckInProgress = false`.

---

## PART 2 — Extension Icon Click Flow

**File:** `echly-extension/src/background.ts`

### chrome.action.onClicked (lines 392–473)

**Step-by-step:**

1. **Guard (393):** If `authCheckInProgress` is true, return immediately. No tray, no tab.
2. **Origin tab (394):** `originTabId = tab?.id ?? null`.
3. **Session cache (396–402):** If `sessionCache.authenticated === true` and `(Date.now() - sessionCache.checkedAt) < SESSION_CACHE_TTL_MS` (30s):
   - Set `globalUIState.visible = true`, `globalUIState.expanded = true`, `persistUIState()`, `broadcastUIState()`, return. No backend call, no tab opened.
4. **Full auth path (441–472):** Set `authCheckInProgress = true`, then async IIFE:
   - **Backend validation:** `session = await checkBackendSession()` (uses stored tokens + GET /api/auth/session). No sessionCache read before this when cache is expired.
   - **Update cache:** `sessionCache = { authenticated: session.authenticated, checkedAt: Date.now() }`.
   - **If authenticated:** Set `globalUIState.user`, `visible`, `expanded`, persist, broadcast → tray opens. No tab is opened.
   - **If not authenticated:** `globalUIState.user = null`, build `loginUrl` (ECHLY_LOGIN_BASE + `?extension=true` + optional `&returnUrl=...`), then **`await openOrFocusLoginTab(loginUrl)`**.
   - **On catch:** Same: build loginUrl, **`await openOrFocusLoginTab(loginUrl)`**.
   - **Finally:** `authCheckInProgress = false`.

### openOrFocusLoginTab(loginUrl) (lines 33–56)

- **Behavior:** Queries all tabs; if any tab’s URL **includes** `/login` **or** `/dashboard`, that tab is **focused** with `chrome.tabs.update(id, { active: true })` and **not navigated** to `loginUrl`. Only if no such tab exists does it call `chrome.tabs.create({ url: loginUrl })`.
- **Implication:** When the extension believes the user is not authenticated and calls `openOrFocusLoginTab(loginUrl)`:
  - If the user already has a **dashboard** tab open, the extension will **focus that dashboard tab** and **never load the login URL**. The user then sees the dashboard (where they may already be logged in via Firebase) while the extension still has no valid session and no tray. This is the exact scenario that produces “clicking the extension redirects to the dashboard even when already logged in” and “extension believes user is logged out when dashboard shows logged in.”

**Code references:**  
Icon click: 392–473. Session cache check: 396–402. Backend validation: 404–406. Login tab: 455–461, 462–469. `openOrFocusLoginTab`: 33–56.

---

## PART 3 — Tray Open Logic

**File:** `echly-extension/src/content.tsx`

### 1. Messages that trigger the tray to open

- The tray does not “open” on a single message; it becomes visible when the **global state** from the background has `visible === true` (or session state implies show; see below). The content script receives:
  - **`ECHLY_GLOBAL_STATE`** (with `state`): Applied in `ensureMessageListener` (976–981). It calls `setHostVisibility(getShouldShowTray(state))` and dispatches the same state to React and to the `ECHLY_GLOBAL_STATE` custom event.
  - **`ECHLY_GET_GLOBAL_STATE`** response: Used on initial sync (254–271) and on visibility change (276–302); the response is normalized and applied the same way (visibility + state).
  - **`ECHLY_SESSION_STATE_SYNC`**: Handler (993–1003) requests `ECHLY_GET_GLOBAL_STATE` from background and applies the result (visibility + state).

So effectively the messages that can lead to the tray showing are: **`ECHLY_GLOBAL_STATE`** (from background broadcast or tab activation), and the **response to `ECHLY_GET_GLOBAL_STATE`** (from initial load or visibility change).

### 2. globalUIState values that cause the tray to render

- **Visibility of the host:** `setHostVisibility(getShouldShowTray(state))` (e.g. 197, 235, 259, 283, 968, 997). So the tray host is shown when `getShouldShowTray(state)` is true.
- **`getShouldShowTray(state)` (46–48):** Returns true when `state.visible === true || state.sessionModeActive === true || state.sessionPaused === true`. So the tray is shown if the background has set `visible`, or session mode is active or paused.
- **Widget content:** The React tree that contains the actual tray UI is rendered only when `user` is truthy (line 758: `if (!user) return null;`). `user` is derived from `globalState.user` (from background). So for the **content** to show (not just the host), the background must have sent a state with a non-null `user`.

### 3. Whether tray opening depends on dashboard state

- Tray visibility is driven only by background `globalUIState` and its broadcast to all tabs. The background does not check “is the dashboard tab open?” to decide whether to set `visible`. So tray opening does **not** depend on dashboard being open.
- However, the **content script** must be loaded in the tab and receive the broadcast. Content script is injected at `document_idle` on `<all_urls>` (manifest). So when the user is on the dashboard tab, the content script should run and listen. If the broadcast happens before the content script has attached its listener (e.g. very fast click after load), that tab could miss the first broadcast; it would only get state on the next `ECHLY_GET_GLOBAL_STATE` (e.g. visibility change or tab activation) or when the user switches back to that tab (onActivated sends state).

### 4. Whether tray opening could fail when dashboard is open

- **Yes, in these cases:**
  1. **Broadcast timing:** Background sets `visible` and calls `broadcastUIState()`; it sends to all tabs. If the dashboard tab’s content script is not yet ready (e.g. script still loading or listener not registered), `chrome.tabs.sendMessage` can fail (caught in background 386–388). That tab would not get the state until it receives a later push (e.g. tab activation) or pulls via `ECHLY_GET_GLOBAL_STATE` on visibility change.
  2. **User is null:** If the background has not set `globalUIState.user` (e.g. session check returned authenticated but API returns minimal user), or state was cleared, the content script renders `null` at line 758 and the tray host may be visible but empty/minimal.
  3. **Extension considers user not authenticated:** If the extension opens the “login” flow and reuses the dashboard tab via `openOrFocusLoginTab`, the user stays on dashboard; the extension never sets `visible` or broadcasts a logged-in state, so the tray does not open.

### How the tray should open after login

- **Intended path:** Login page sends tokens via `ECHLY_PAGE_LOGIN_SUCCESS` → content script forwards to background → background stores tokens and runs `validateSessionAndOpenTray()` → GET /api/auth/session with new token → on success: `sessionCache = { authenticated: true }`, `globalUIState.user = data.user`, `globalUIState.visible = true`, `globalUIState.expanded = true`, `persistUIState()`, `broadcastUIState()`, then switch to `originTabId` and close login tab if still on /login. So the tray opens because background sets visible and broadcasts; the tab that gets focus is the origin tab (where the user clicked the icon). All tabs receive the state; the tray should show on the current tab (origin) and any other tab with content script loaded.

---

## PART 4 — Login Handoff

**Files:** `app/(auth)/login/page.tsx`, `echly-extension/src/content.tsx`

### 1. How Firebase login occurs

- **Login page:** Uses `signInWithGoogle()` or `signInWithEmailPassword()` from `lib/auth/authActions`. On success, the component has the Firebase user.
- **Redirect for extension:** When `isExtension` (search param `extension=true`), after successful sign-in the code gets `user.getIdToken()` and `(user as any).refreshToken`, then does `window.postMessage({ type: 'ECHLY_PAGE_LOGIN_SUCCESS', idToken, refreshToken }, '*')` and redirects with `window.location.href = '/dashboard'` (or dashboard with query). Same pattern in `onAuthStateChanged` (42–45), `handleGoogle` (86–94), and `handleEmail` (122–128).

### 2. How tokens are sent to the extension

- **Page → content script:** The login page (or any dashboard-origin page) posts `ECHLY_PAGE_LOGIN_SUCCESS` with `idToken` and `refreshToken`. The content script runs on all URLs; on dashboard origins it injects the page token bridge and runs **`ensureLoginCompleteForwarder()`** (1045–1062).
- **Forwarder (1048–1062):** Listens for `window.addEventListener('message', ...)`. When `event.data.type === 'ECHLY_PAGE_LOGIN_SUCCESS'` and `event.origin` is in `DASHBOARD_ORIGINS`, it calls `chrome.runtime.sendMessage({ type: 'ECHLY_EXTENSION_AUTH_SUCCESS', idToken: event.data.idToken, refreshToken: event.data.refreshToken })`. So tokens are sent from the **page** to the **content script** via postMessage, then from the **content script** to the **background** via `chrome.runtime.sendMessage`.

### 3. Whether the content script bridge is used

- **For login handoff:** Yes. The content script’s `ensureLoginCompleteForwarder()` is the bridge: it listens for `ECHLY_PAGE_LOGIN_SUCCESS` from the page and forwards to the background as `ECHLY_EXTENSION_AUTH_SUCCESS`. The **pageTokenBridge.js** is used for **token requests** (e.g. getTokenFromPage) on dashboard; it is **not** used for the login-success message. The login page posts directly to the window; the content script (which runs on the same page once it’s loaded) must be present to forward to the background. Because the login page redirects to `/dashboard` immediately after posting, the message is sent from the **login page** document. The content script is injected on the login page (matches `<all_urls>`), so it can receive the postMessage and forward to the background before the page unloads (best-effort; see below).

### 4. Whether the background receives the message

- **Yes.** Background has a listener for `msg.type === 'ECHLY_EXTENSION_AUTH_SUCCESS'` (419–434). It validates idToken/refreshToken, then stores them in `chrome.storage.local` and calls `validateSessionAndOpenTray()`. So the full login handoff sequence is:
  1. User signs in on login page (extension=true).
  2. Login page gets idToken and refreshToken, posts `ECHLY_PAGE_LOGIN_SUCCESS` to window.
  3. Content script (on that page) receives the message, checks origin, sends `ECHLY_EXTENSION_AUTH_SUCCESS` to background.
  4. Background stores tokens, calls `validateSessionAndOpenTray()` (GET /api/auth/session), then sets tray visible, broadcasts, focuses origin tab, closes login tab if still on /login.

**Race:** If the page redirects to `/dashboard` before the content script processes the postMessage or before the background finishes `validateSessionAndOpenTray()`, the handoff can still succeed because the message is async and the background persists tokens; the only risk is the origin tab switch and login tab close happening after the redirect.

---

## PART 5 — Dashboard Auth Source

**Files:** `app/(app)/dashboard/page.tsx`, `app/(app)/dashboard/hooks/useWorkspaceOverview.ts`, `app/(app)/layout.tsx`

### 1. How the dashboard detects the authenticated user

- **useWorkspaceOverview** (dashboard data): Uses Firebase only. It subscribes with `onAuthStateChanged(auth, (currentUser) => { ... })` (75–84). If `!currentUser`, it clears auth cache and redirects to `/login`; otherwise it sets local `user` state and loads sessions/counts via `loadSessionsAndCounts(user.uid, ...)`, which call `getWorkspaceSessions`, `getUserSessions`, etc. (server/API or repo layer). So the dashboard **UI** “logged in” state is Firebase `auth.currentUser`.
- **API calls from dashboard:** Use `authFetch` (e.g. from `lib/authFetch`), which attaches the Firebase ID token (from the page) to requests. So the dashboard’s **API** auth is the same Firebase token, validated by the backend (e.g. `requireAuth`).

### 2. Firebase vs backend validation

- **Dashboard:** Does not call `/api/auth/session` for “am I logged in?”. It uses Firebase `onAuthStateChanged` and `auth.currentUser`. Session/list data is loaded via other APIs (sessions, feedback, etc.), which use `requireAuth` on the server. So the dashboard’s “source of truth” for **display** is Firebase; for **API access** it is the same token validated by the backend.

### 3. Whether it calls /api/auth/session

- **No.** The dashboard does not call `/api/auth/session` to determine auth state. Only the extension uses that endpoint for session validation.

### 4. Source of truth

- **Dashboard:** Firebase Auth state (`onAuthStateChanged` / `currentUser`) is the source of truth for “is the user logged in?” in the UI. Backend validates the token on every API call but is not used by the dashboard to decide “show dashboard vs login.”
- **Extension:** Backend session check (`GET /api/auth/session` with stored token) is the source of truth. Stored tokens are refreshed client-side; validity is confirmed by the backend.
- **Mismatch:** Dashboard can show “logged in” (Firebase has a user) while the extension has no tokens or an expired/invalid session (e.g. after clearing storage, or after backend returns 401). Conversely, if the extension has valid tokens and the user logs out in the dashboard (Firebase signOut), the extension is not notified and will only discover invalidity on the next API call or icon click that hits the backend.

---

## PART 6 — Plan / Limit System

**Searched:** plan, subscription, limit, quota, usage across dashboard, API, and extension.

### 1. Where plan limits are stored

- **Backend:** Workspace has `billing?.plan` (e.g. from Firestore). Limits are derived via **`getWorkspaceEntitlements()`** (`lib/billing/getWorkspaceEntitlements.ts`) from workspace and plan catalog. **`checkPlanLimit()`** (`lib/billing/checkPlanLimit.ts`) reads entitlements for `maxSessions` or `maxMembers` and throws `PLAN_LIMIT_REACHED` when `currentUsage >= limit`.
- **Dashboard:** Settings/billing uses `usePlanCatalog()` and displays plan features (e.g. `maxSessions`). Plan limits are not stored in the extension.

### 2. Whether the extension fetches plan limits

- **No.** The extension does not fetch plan catalog or entitlements. It calls `/api/sessions` (GET/POST), `/api/feedback`, `/api/structure-feedback`, `/api/upload-screenshot`, etc., but does not call any plan or usage endpoint for UI or enforcement.

### 3. Whether limits are validated in the backend

- **Yes.** **POST /api/sessions** (`app/api/sessions/route.ts`): Before creating a session, it calls `checkPlanLimit({ workspace, metric: 'maxSessions', currentUsage: currentSessionCount })`. On limit exceeded it returns 403 with `planLimitReachedBody(planErr)`. Other APIs (e.g. feedback, structure-feedback) do not call `checkPlanLimit`; session creation is the only place plan limit is enforced in the audited code.

### 4. Whether the extension can bypass plan limits

- **No.** Session creation from the extension goes through **POST /api/sessions** (content uses `apiFetch('/api/sessions', { method: 'POST', ... })` which is proxied by background with Bearer token). The backend enforces the plan limit on that route. The extension cannot create sessions without going through this API, so it cannot bypass plan limits. It does not show or enforce limits in the UI; the user might only see a 403 or error from the API when the limit is reached.

### Summary

- Limits are stored and enforced on the backend (workspace + entitlements; `checkPlanLimit` on session creation).
- The extension does not fetch or display plan/usage; it cannot bypass limits because POST /api/sessions is protected by the same backend check.

---

## PART 7 — Extension API Requests

**Files:** `echly-extension/src/background.ts`, `echly-extension/src/content.tsx`, `echly-extension/src/contentAuthFetch.ts`

### 1. How API requests include authentication

- **Background:** Direct `fetch()` calls use `getValidToken()` and set `headers: { Authorization: 'Bearer ' + token }` (e.g. session, feedback, sessions, upload-screenshot, structure-feedback, feedback POST). The **echly-api** handler (1122–1162) uses `token ?? (await getValidToken())` and sets `h['Authorization'] = 'Bearer ' + resolvedToken`.
- **Content script:** Does not hold tokens. It uses **`apiFetch()`** from `contentAuthFetch.ts`, which sends a message to the background: `{ type: 'echly-api', url, method, headers, body }`. The background’s **echly-api** handler (1122–1162) resolves the token with `getValidToken()`, attaches Authorization, and performs the fetch; it returns status/headers/body to the content script. So all content-script-originated API requests are authenticated by the background with the stored token.

### 2. Whether tokens are attached to requests

- **Yes.** Every backend call from the background uses `getValidToken()` (or the token passed in for echly-api) and sets `Authorization: Bearer <token>`. Content script requests go through the background and get the same treatment.

### 3. Whether requests validate plan limits

- **Only session creation.** Plan limit is checked in **POST /api/sessions** (see Part 6). Other endpoints (feedback, structure-feedback, upload-screenshot, tickets, etc.) use `requireAuth` but do not call `checkPlanLimit`. So extension requests are authenticated; plan limits are enforced only where the backend implements them (session creation).

---

## PART 8 — Dashboard / Extension Sync

### 1. If logging out from dashboard logs out the extension

- **No automatic sync.** The dashboard uses Firebase `signOut()`. The extension does not listen for Firebase auth state. It only discovers invalid sessions when:
  - It calls `checkBackendSession()` (e.g. on icon click) and gets 401/403, or
  - Any API call returns 401/403 and the handler calls `clearAuthState()`.
- So: If the user logs out in the dashboard, the extension keeps its stored tokens until the next backend check or API call that returns 401. Then the extension clears auth and tray. There is no real-time “logout broadcast” from dashboard to extension.

### 2. If logging in from dashboard authenticates the extension

- **Only if the extension receives tokens.** The extension gets tokens when:
  - The user goes through the **login page** with `?extension=true` and the login page posts `ECHLY_PAGE_LOGIN_SUCCESS`; the content script forwards it and the background stores tokens and runs `validateSessionAndOpenTray()`.
- If the user logs in on the dashboard **without** going through the login page with `extension=true` (e.g. normal dashboard login in another tab), the extension never receives tokens. So logging in on the dashboard in the normal way does **not** authenticate the extension.

### 3. If extension session validation depends on dashboard being open

- **No.** The extension uses **stored** tokens and `GET /api/auth/session` for validation. It does not use the page token bridge or dashboard tab for the icon-click auth flow. So extension session validation does not depend on the dashboard being open. (The token bridge is still used in some code paths for token-from-page; the current icon-click path does not use it.)

---

## PART 9 — Failure Scenarios (Root Causes)

### 1. Extension opens dashboard instead of tray

- **Root cause:** When the extension decides the user is not authenticated (cache expired or `checkBackendSession()` returns false or throws), it calls **`openOrFocusLoginTab(loginUrl)`**. That function **reuses any existing tab whose URL contains `/login` or `/dashboard`** and only **focuses** that tab; it does **not** navigate to `loginUrl`. So if a dashboard tab already exists, the user sees the dashboard (and may already be logged in there) instead of the login page. From the user’s perspective, “clicking the extension opened the dashboard” even though they are already logged in on the dashboard.
- **Code:** `echly-extension/src/background.ts` lines 33–56 (`openOrFocusLoginTab`), and 455–461 / 462–469 where it is called when not authenticated.

### 2. Tray fails to open when dashboard tab exists

- **Possible causes:**  
  (1) **Broadcast missed:** The tab’s content script was not ready when `broadcastUIState()` ran (e.g. `sendMessage` failed for that tab). The tab would only get state on a later event (tab activation, visibility change, or next broadcast).  
  (2) **Extension not authenticated:** If the extension opened “login” and reused the dashboard tab (above), it never set `visible` or broadcast a logged-in state, so the tray does not open.  
  (3) **User not set:** Content script only renders the tray UI when `user` is truthy (line 758). If the session API returns minimal user info or the background never set `globalUIState.user`, the host might show but the widget returns null.  
  (4) **Auth check in progress:** Rapid double-clicks can leave `authCheckInProgress` true so the second click returns without opening the tray.

### 3. Extension believes user is logged out when dashboard shows logged in

- **Root causes:**  
  (1) **Different sources of truth:** Dashboard uses Firebase; extension uses stored tokens + backend session. If the extension has no tokens (e.g. never logged in via extension flow, or storage cleared) or the backend returns 401 (e.g. token revoked, wrong project), the extension shows “not authenticated” while Firebase still has a user on the dashboard.  
  (2) **Reused dashboard tab:** When the extension tries to “open login” and reuses the dashboard tab without navigating to login, the user stays on the dashboard (logged in there) while the extension never receives new tokens and never sets sessionCache or tray.  
  (3) **Logout only on backend use:** If the user logged out in the dashboard (Firebase signOut), the extension is not notified and keeps tokens until the next 401 from the backend.

---

## PART 10 — Final Diagnostic Summary

### 1. Why extension redirects to dashboard

- **Direct cause:** `openOrFocusLoginTab(loginUrl)` focuses an **existing** tab that contains `/dashboard` (or `/login`) instead of opening a new tab with `loginUrl`. So when the extension thinks the user is not authenticated and “opens login,” it often just focuses the existing dashboard tab. The user never sees the login page and perceives this as “extension redirected me to the dashboard.”

### 2. Why tray sometimes fails to open

- **Main reasons:** (a) Extension not authenticated (e.g. backend failed or tokens missing), so it never sets `visible`/broadcasts; (b) when it does open login, reusing the dashboard tab means no new tokens are stored and tray is never opened; (c) broadcast to the current tab failing (content script not ready); (d) content script requiring `user` to be set for the widget to render.

### 3. Whether auth states are out of sync

- **Yes.** Dashboard auth is Firebase; extension auth is stored tokens + `/api/auth/session`. They are not synchronized: dashboard logout does not clear extension tokens; dashboard login (without extension login flow) does not give the extension tokens; and reusing the dashboard tab when “opening login” leaves the user logged in on the dashboard but the extension still unauthenticated.

### 4. Whether plan/limit checks are secure

- **Yes.** Plan limits are enforced on the backend (POST /api/sessions with `checkPlanLimit`). The extension cannot create sessions without going through this API. The extension does not fetch or enforce limits locally; it cannot bypass them.

### 5. Which files must be modified (to fix the reported issues)

- **echly-extension/src/background.ts**
  - **openOrFocusLoginTab:** Prefer creating a new tab with `loginUrl` when the goal is to show the login page, or only reuse a tab that is actually on `/login` (and optionally navigate to `loginUrl` if needed). Do not reuse a tab that is only on `/dashboard` when the user is not authenticated in the extension, so that the user is taken to the login page and the extension can receive tokens via `ECHLY_PAGE_LOGIN_SUCCESS`.
  - Optionally: When reusing a dashboard tab, consider triggering a token handoff (e.g. ask dashboard tab for token via existing bridge) and re-run session validation so the extension can align with dashboard auth.
- **echly-extension/src/content.tsx**
  - Ensure the content script requests or re-syncs global state when it becomes visible (e.g. on visibilitychange or when the tab is focused) so that a missed broadcast still results in the tray showing once the script is ready.
- **app/api/auth/session/route.ts**
  - Currently returns only `user: { uid }`. If the extension expects `name`, `email`, `photoURL` for the tray UI, the route could return these from Firebase Auth user record (if available) for consistency with `globalUIState.user`.
- **Dashboard ↔ extension sync (optional):**
  - Consider a way for the dashboard to notify the extension when the user logs in or out (e.g. postMessage + content script forward) so the extension can update or clear tokens and tray state and stay in sync with the dashboard.

---

**End of report.** No code was modified during this audit.
