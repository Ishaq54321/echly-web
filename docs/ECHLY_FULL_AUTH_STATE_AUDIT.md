# Echly Full Auth State Audit

**Document type:** READ-ONLY architecture audit  
**Scope:** Dashboard authentication, extension authentication, token bridge, widget UI login state, extension click flow, API session validation, login redirect flow, session synchronization, and root cause analysis for the “Sign in” button still appearing after login.  
**No code changes or fixes are proposed.**

---

## SECTION 1 — Dashboard Authentication

### Files inspected

- `lib/firebase.ts`
- `lib/authFetch.ts`
- `lib/auth/authActions.ts`
- `lib/auth/checkUserWorkspace.ts`
- `lib/hooks/useAuthGuard.ts`
- `app/(auth)/login/page.tsx`

### How dashboard login works

1. **Firebase initialization** (`lib/firebase.ts`):
   - Single app via `initializeApp(firebaseConfig)` and `getAuth(app)`.
   - On the web, `window.firebase.auth()` is exposed so the page token bridge can call `window.firebase.auth().currentUser` and `getIdToken()`.

2. **Sign-in methods** (`lib/auth/authActions.ts`):
   - `signInWithGoogle()` uses `signInWithPopup(auth, new GoogleAuthProvider())`.
   - `signInWithEmailPassword()` and `signUpWithEmailPassword()` use Firebase Email/Password.

3. **Token retrieval for API** (`lib/authFetch.ts`):
   - `authFetch()` uses `auth.currentUser`; if null, throws "User not authenticated".
   - Token comes from `getCachedIdToken(user)`: in-memory `cachedToken` / `tokenExpiry` with 1-minute buffer before expiry; otherwise `user.getIdToken()` and `getIdTokenResult()` to refresh and cache.
   - `clearAuthTokenCache()` clears the in-memory cache (used on logout path via `useAuthGuard`).

4. **Authorization header**:
   - Every `authFetch()` call sets `headers.set("Authorization", `Bearer ${token}`)`.
   - Relative URLs are resolved via `resolveInput()`; if `window.__ECHLY_API_BASE__` is set (extension context), requests are sent to that base.

5. **Logout**:
   - No explicit “logout” function in the inspected files. When the user is null, `useAuthGuard` calls `clearAuthTokenCache()` and redirects to `/login` via `router.replace("/login")` or `router.push("/login")`.

6. **After login success** (`app/(auth)/login/page.tsx`):
   - **Extension flow:** If `isExtension && returnUrl`, `safeRedirectToReturnUrl(returnUrl)` runs and the function returns (no dashboard navigation).
   - **Normal flow:** Otherwise `checkUserWorkspace(user.uid)` returns `"dashboard"` or `"onboarding"`, and the app does `router.replace("/dashboard")` or `router.replace("/onboarding")`.

### Dashboard login pipeline (summary)

```
User submits credentials (Google or email/password)
  → Firebase signInWithPopup / signInWithEmailPassword
  → auth.currentUser set
  → If extension + returnUrl: redirect to returnUrl (external URL)
  → Else: checkUserWorkspace(uid) → redirect to /dashboard or /onboarding
  → Protected routes use useAuthGuard → onAuthStateChanged → auth.currentUser
  → API calls use authFetch() → getCachedIdToken(user) → Bearer token → backend
```

---

## SECTION 2 — Extension Background Authentication

### File inspected

- `echly-extension/src/background.ts`

### How the extension determines if the user is authenticated

- **Single source of truth:** `checkBackendSession()`:
  1. Gets a token via `getValidToken()` (which calls `getTokenFromPage()`; throws `NOT_AUTHENTICATED` if no token).
  2. Calls `GET ${API_BASE}/api/auth/session` with `Authorization: Bearer <token>`.
  3. If the response is not OK, calls `clearAuthState()` and returns `{ authenticated: false }`.
  4. Otherwise returns the JSON body (`authenticated`, `user`).

- **In-memory cache:** `sessionCache` exists: `{ authenticated: boolean; checkedAt: number }` with TTL `SESSION_CACHE_TTL_MS` (30 seconds). It is used only to avoid re-running `checkBackendSession()` on every icon click when the cache is still valid.

### What happens when the extension icon is clicked

1. `chrome.action.onClicked` runs.
2. If `sessionCache.authenticated && (Date.now() - sessionCache.checkedAt) < 30_000`, the cache is treated as valid and the tray is toggled (no auth check).
3. Otherwise `checkBackendSession()` is run and `sessionCache` is updated.
4. If `!session.authenticated`: `clearAuthState()` is called and a new tab is opened to `ECHLY_LOGIN_BASE?extension=true&returnUrl=<current tab url>` (then return).
5. If authenticated, `globalUIState.visible` is toggled, UI state is persisted and broadcast to all tabs.

### sessionCache

- Exists in background: `let sessionCache = { authenticated: false; checkedAt: 0 }`.
- Not persisted; TTL 30s. Used only for fast tray open on repeated icon clicks.

### How getTokenFromPage() works

1. Resolves the list of all tabs; picks the active tab first, then any tab whose URL origin is in `DASHBOARD_ORIGINS` (localhost:3000, echly-web.vercel.app).
2. For each candidate tab, sends `chrome.tabs.sendMessage(tabId, { type: "ECHLY_GET_TOKEN_FROM_PAGE" })` with a 6s timeout.
3. The content script in that tab handles the message by calling `requestTokenFromPage()` (which uses the secure bridge with the page). The response is `{ token }`.
4. Returns the first non-null token, or null if none of the tabs returned a token.

So a token is only obtained if at least one tab is a **dashboard** tab and that tab’s page has the token bridge and Firebase auth (i.e. user signed in there).

### How /api/auth/session is called

- By `checkBackendSession()` and `prewarmAuthSession()`: `fetch(\`${API_BASE}/api/auth/session\`, { headers: { Authorization: \`Bearer ${token}\` } })`.
- `API_BASE` is `"http://localhost:3000"` in the inspected code.

### How the login flow is triggered

- **Icon click (not authenticated):** After `checkBackendSession()` returns not authenticated, `chrome.tabs.create({ url: loginUrl })` with `loginUrl = ECHLY_LOGIN_BASE?extension=true&returnUrl=<tab.url>`.
- **ECHLY_OPEN_POPUP:** Same login URL pattern, new tab.
- **ECHLY_SIGN_IN / ECHLY_START_LOGIN / LOGIN:** Same; `sendResponse({ success: false, error: "Use dashboard login" })`.

### When does the extension show login?

- When the user clicks the extension icon and `checkBackendSession()` returns `authenticated: false` (no token from any dashboard tab, or backend returned non-OK).
- When the widget’s “Sign in” button is clicked, it sends `ECHLY_OPEN_POPUP`, which opens the same login URL in a new tab.

---

## SECTION 3 — Token Bridge

### Files inspected

- `echly-extension/src/pageTokenBridge.js` (injected script)
- `echly-extension/src/requestTokenFromPage.ts`
- `echly-extension/src/secureBridgeChannel.ts`

### Handshake flow

1. **Content script** (`secureBridgeChannel.ts`): `performHandshake()` sends a single postMessage to `window.location.origin`:
   - `channel: "ECHLY_BRIDGE_HANDSHAKE_CHANNEL"`, `type: "ECHLY_BRIDGE_HANDSHAKE"`, `proposedChannel: "ECHLY_SECURE_CHANNEL_<random>"`, `source: "ECHLY_EXTENSION"`.
2. **Page bridge** (`pageTokenBridge.js`): Listens for `message`. Only processes if `event.origin` is in `ALLOWED_ORIGINS` (echly-web.vercel.app, localhost:3000). If `data.channel === ECHLY_HANDSHAKE_CHANNEL` and `data.type === ECHLY_BRIDGE_HANDSHAKE` and `data.source === "ECHLY_EXTENSION"` and `proposedChannel` starts with `ECHLY_SECURE_CHANNEL_`, it sets `negotiatedChannel = proposed` and replies with `window.postMessage({ channel: proposed, type: "ECHLY_BRIDGE_READY" }, origin)`.
3. **Content script:** On receiving `ECHLY_BRIDGE_READY` with matching channel, caches the channel and resolves the handshake.

### Token request flow

1. **Content script** (`requestTokenFromPage.ts`): After handshake, sends `window.postMessage({ channel, type: "ECHLY_REQUEST_TOKEN", nonce: crypto.randomUUID(), source: "ECHLY_EXTENSION" }, targetOrigin)`.
2. **Bridge:** Only handles if `data.channel === negotiatedChannel`, `type === ECHLY_REQUEST_TOKEN`, `source === ECHLY_EXTENSION`, and `data.nonce != null`. Then:
   - Reads `user = window.firebase?.auth?.()?.currentUser` (from dashboard’s `lib/firebase.ts`).
   - If no user, replies with `postMessage(..., { ..., token: null }, origin)`.
   - Else `token = await user.getIdToken()`, then replies with same structure and `token`.
3. **Content script:** Listens for `ECHLY_TOKEN_RESPONSE` with matching `channel` and `nonce`, then resolves with `data.token` (or null).

### How the nonce works

- The content script generates a one-time `nonce` (e.g. `crypto.randomUUID()`).
- The bridge echoes the same `nonce` in the token response.
- The listener only accepts a message with that exact `nonce`, then removes the listener and clears the timeout. This ties the response to a single request and avoids replay.

### How the bridge obtains the Firebase token

- Only in the **page context** where the bridge runs (dashboard origin).
- It uses `window.firebase.auth().currentUser` (set by `lib/firebase.ts` in the dashboard app) and `user.getIdToken()`.
- So the token is the Firebase ID token of the user currently signed in on that dashboard page.

### What happens if the user is logged out

- On the dashboard page, `window.firebase.auth().currentUser` is null.
- The bridge still runs and handles the token request; it calls `sendTokenResponse(null)`.
- The content script receives `token: null`. The background then has no token, so `getValidToken()` throws `NOT_AUTHENTICATED` and `checkBackendSession()` returns `{ authenticated: false }`.

---

## SECTION 4 — Widget Login UI

### Files inspected

- `echly-extension/src/content.tsx`
- No separate `echly-extension/src/components/*` login-specific components; the “Sign in” UI is inline in `content.tsx`.

### Where the “Sign in” button is rendered

- In `ContentApp`, after `if (!authChecked) return null;`, the block:

  `if (!user) { return ( <div>... <button onClick={requestOpenLoginPage} ...>Sign in</button> </div> ); }`

- So the “Sign in” button is shown when `user` is null and `authChecked` is true.

### What condition shows this button

- **Condition:** `authChecked === true && user === null`.
- `user` is set only in the single `useEffect` that sends `ECHLY_GET_AUTH_STATE` (empty dependency array `[]`). So it runs once per mount. The response handler sets `setUser(...)` when `response?.authenticated && response.user?.uid`, otherwise `setUser(null)`. Then `setAuthChecked(true)`.

### Which state variable controls login UI

- **Primary:** `user` (AuthUser | null). If null after auth check, the “Sign in” button is shown.
- **Gate:** `authChecked`. Before it is true, the component returns null (no UI). So the login UI is driven by “auth has been checked and the result is no user.”

### Does the widget rely on extension auth state, Firebase, backend, or token bridge?

- **Extension auth state:** Yes. `user` comes only from the background’s response to `ECHLY_GET_AUTH_STATE`, which is `checkBackendSession()` (token from page + GET /api/auth/session). The widget does not read Firebase or storage directly.
- **Firebase state:** Only indirectly: the background gets the token from a dashboard tab via the bridge, and the bridge reads Firebase on that tab. So widget state ultimately depends on “can the background get a valid token from some dashboard tab and does the backend accept it?”
- **Backend validation:** Yes. `checkBackendSession()` uses GET /api/auth/session; if not OK, it returns not authenticated and the widget sees `user === null`.
- **Token bridge:** Yes. The only way the background gets a token is `getTokenFromPage()` → content script in a dashboard tab → `requestTokenFromPage()` → bridge in that tab’s page. So the widget’s “Sign in” vs authenticated state depends on the bridge being present and returning a token from a dashboard tab.

### Why the “Sign in” button appears

- The button appears when the content script has received a response to `ECHLY_GET_AUTH_STATE` with `authenticated` not true or no `user.uid`.
- That happens when:
  1. **No token:** `getTokenFromPage()` returns null (e.g. no dashboard tab, or bridge not injected, or user not signed in on that dashboard tab), so `checkBackendSession()` returns not authenticated; or
  2. **Backend rejects:** GET /api/auth/session returns non-OK (e.g. 401), so again not authenticated.
- The widget does not re-query auth after the initial mount; it only checks once when the component mounts.

---

## SECTION 5 — Extension Click Flow

### Complete pipeline

1. **User clicks extension icon**  
   → `chrome.action.onClicked` fires (background).

2. **Background: auth check**  
   - If `sessionCache` is valid (authenticated and &lt; 30s old): skip to step 6.  
   - Else: run `checkBackendSession()`.

3. **checkBackendSession()**  
   - Call `getValidToken()`:
     - `getTokenFromPage()`: find tabs (active first, then any dashboard-origin tab); for each, `sendMessage(tabId, { type: "ECHLY_GET_TOKEN_FROM_PAGE" })`.
     - Content script in that tab handles message by calling `requestTokenFromPage()`:
       - Handshake with page bridge (postMessage); bridge must be on same origin (dashboard).
       - Token request with nonce; bridge reads `window.firebase.auth().currentUser.getIdToken()` and posts back token (or null).
     - First non-null token is returned; if none, `getValidToken()` throws `NOT_AUTHENTICATED`.
   - If no token: `clearAuthState()`, return `{ authenticated: false }`.
   - Else: `fetch(API_BASE + "/api/auth/session", { headers: { Authorization: "Bearer " + token } })`.
   - If !res.ok: `clearAuthState()`, return `{ authenticated: false }`.
   - Else return session JSON. Background updates `sessionCache` from this result.

4. **If not authenticated**  
   - Open new tab: `ECHLY_LOGIN_BASE?extension=true&returnUrl=<current tab url>`.  
   - Return (tray does not open).

5. **If authenticated**  
   - Toggle `globalUIState.visible`, persist, then `broadcastUIState()`.

6. **Widget render**  
   - All tabs receive `ECHLY_GLOBAL_STATE` (or already have it). Content script updates host visibility and dispatches `ECHLY_GLOBAL_STATE` so the React app’s `globalState` shows tray visible/expanded.  
   - The widget’s **auth** state (`user`) is not updated by this flow; it was set once on mount by `ECHLY_GET_AUTH_STATE`. So the tray can open (visibility from background) while the widget still shows “Sign in” if the initial auth check had returned not authenticated.

---

## SECTION 6 — Login Redirect Flow

### File inspected

- `app/(auth)/login/page.tsx`

### Handling of extension=true

- `const isExtension = searchParams.get("extension") === "true";`
- Used only to decide redirect after successful sign-in: if `isExtension && returnUrl && safeRedirectToReturnUrl(returnUrl)`, the app redirects to `returnUrl` and does **not** call `checkUserWorkspace` or `router.replace("/dashboard" | "/onboarding")`.

### Handling of returnUrl

- `const returnUrl = searchParams.get("returnUrl") ?? null;`
- After successful Google or email sign-in, if `isExtension && returnUrl && safeRedirectToReturnUrl(returnUrl)`:
  - `safeRedirectToReturnUrl(decoded)` decodes the URL, checks protocol is http/https, then sets `window.location.href = decoded` and returns true.
- So the **login tab** is navigated to the return URL (e.g. the page where the user was when they clicked “Sign in” or the extension icon). That URL is typically **not** the dashboard (e.g. another site).

### Redirect after login

- **Extension flow:** Redirect to `returnUrl` (external page). No dashboard open in that tab.
- **Normal flow:** Redirect to `/dashboard` or `/onboarding` based on `checkUserWorkspace(user.uid)`.

### How the extension login flow is completed

- User clicks “Sign in” in widget or extension icon when not authenticated → new tab opens to login page with `?extension=true&returnUrl=<current tab url>`.
- User signs in on that tab → Firebase auth state is set in **that** tab (dashboard origin).
- Login page then redirects the same tab to `returnUrl`. So the tab that was the login page becomes a tab on `returnUrl` (e.g. a third-party site). There is no remaining tab on the dashboard origin unless the user had one open already. The extension does not open the dashboard after login.

---

## SECTION 7 — Session Synchronization

### 1. Does the extension know when dashboard login happens?

- **No.** The extension has no listener for dashboard navigation or Firebase auth state. It only discovers “user is authenticated” when it needs a token and calls `getTokenFromPage()` + GET /api/auth/session. So it does not get a push notification when the user logs in on the dashboard.

### 2. Does the extension re-check auth after login?

- **Icon click:** Yes. Each click runs the cache check and, if cache invalid, `checkBackendSession()`.
- **Widget:** No. The widget asks for auth state once on mount (`ECHLY_GET_AUTH_STATE` in a `useEffect` with `[]`). It never asks again when the user returns from the login tab or when a dashboard tab is opened later.

### 3. Is the token requested again after login?

- **On icon click:** Yes, when cache is invalid (every time after 30s or when cache was not set).
- **On the tab that was the login tab:** After redirect, that tab is no longer the dashboard; the bridge is not injected there, so when the background sends `ECHLY_GET_TOKEN_FROM_PAGE` to that tab, `requestTokenFromPage()` will handshake with a page that has no bridge (or wrong origin), and the token request will time out or get null. So the token is not obtained from the tab that “just logged in” after redirect, because that tab is now `returnUrl`, not the dashboard.
- If the user has another tab open on the dashboard, the token can be obtained from that tab when the background runs `getTokenFromPage()`.

### 4. Is the widget state refreshed?

- **Visibility/session state:** Yes, via `ECHLY_GLOBAL_STATE` and `ECHLY_GET_GLOBAL_STATE` (and tab activation / visibility resync). So tray open/closed and session data can refresh.
- **Auth state (`user`):** No. There is no code that re-sends `ECHLY_GET_AUTH_STATE` after the initial mount or when the tab becomes visible again. So the widget’s “Sign in” vs authenticated view does not refresh.

---

## SECTION 8 — Root Cause Analysis

### Why the extension still shows “Sign in” after login

From the code, the following causes are identified.

1. **Redirect sends user away from dashboard**  
   After extension login, the app redirects to `returnUrl` (the tab URL when the user opened login). That is usually not the dashboard. The tab that contained the login page becomes a tab on `returnUrl`. So after login there is often **no** tab left on the dashboard origin. The token bridge and Firebase auth exist only on dashboard pages, so the extension cannot get a token from the tab that “just logged in.”

2. **Token bridge not available on returnUrl**  
   The bridge is injected only when `DASHBOARD_ORIGINS.includes(window.location.origin)` in the content script. On the post-redirect page (e.g. example.com), the bridge is not injected. So when the background later runs `getTokenFromPage()`, it may only have non-dashboard tabs; for those, the content script’s `requestTokenFromPage()` will not get a token. So even a re-check would see “no token” unless a dashboard tab is open.

3. **Widget auth state is checked only once**  
   The widget sets `user` only from the first response to `ECHLY_GET_AUTH_STATE` (useEffect with `[]`). It never asks again when:
   - The user returns from the login tab,
   - The tab gains focus,
   - Or a dashboard tab is opened elsewhere.  
   So even if the background could get a token later (e.g. user opens dashboard in another tab), the widget on the original page would still show “Sign in” until the page is reloaded or the content script remounts.

4. **No session refresh after redirect**  
   There is no step after redirect (e.g. message from background or visibility change) that triggers the widget to call `ECHLY_GET_AUTH_STATE` again. So the widget never gets an updated “authenticated” state after the user completes login in the other tab.

5. **Background cache does not help the widget**  
   `sessionCache` only affects icon-click behavior (skip full check if cache valid). It does not push “authenticated” to the content script. The widget does not read `sessionCache`; it only ever sees the result of the single `ECHLY_GET_AUTH_STATE` at mount.

### Summary of root cause

- **Architectural:** The extension login flow completes by redirecting to `returnUrl`, which is usually a non-dashboard URL. So the only place with Firebase auth (the login tab) becomes a non-dashboard tab, and the extension has no way to get a token from it. The widget’s auth state is fetched once at mount and never refreshed, so it stays “not authenticated” and keeps showing “Sign in.”

---

## SECTION 9 — Current Architecture Diagrams

### AUTH FLOW

```
Dashboard login (Google or email/password)
  → Firebase Auth (auth.currentUser, getIdToken)
  → Token used by dashboard: authFetch() → Bearer token → API

Extension path:
  Dashboard page (same Firebase) → window.firebase.auth() exposed
  → Token bridge (pageTokenBridge.js) injected only on dashboard origin
  → Content script requestTokenFromPage() ↔ bridge (handshake + token request)
  → Background getTokenFromPage() via ECHLY_GET_TOKEN_FROM_PAGE to dashboard tab
  → checkBackendSession(): GET /api/auth/session with Bearer token
  → sessionCache updated; ECHLY_GET_AUTH_STATE response to content script
  → Widget: user state set once from that response
```

### EXTENSION CLICK FLOW

```
User click extension icon
  → background: chrome.action.onClicked
  → sessionCache valid? → yes → toggle tray, broadcast state → end
  → no → checkBackendSession()
       → getTokenFromPage() → ECHLY_GET_TOKEN_FROM_PAGE to active/dashboard tabs
       → content script in dashboard tab: requestTokenFromPage() → bridge → token
       → GET /api/auth/session with Bearer token
  → not ok or no token → clearAuthState(), open login tab → end
  → ok → sessionCache = { authenticated: true, checkedAt }, toggle tray, persist, broadcast
  → All tabs: ECHLY_GLOBAL_STATE → content script updates visibility, dispatches event
  → Widget (React): globalState.visible drives tray; user state unchanged (set only on mount)
```

---

## SECTION 10 — Final Summary

### How authentication currently works

- **Dashboard:** Firebase Auth in the web app; tokens from `auth.currentUser.getIdToken()` (with in-memory cache in `authFetch`). API calls use `Authorization: Bearer <token>`. Session validity is enforced by the backend (e.g. GET /api/auth/session and other routes using `requireAuth`).
- **Extension:** Stateless: no stored tokens. Token is obtained on demand from a **dashboard** tab via the content script and the page token bridge (postMessage handshake + token request). The bridge runs only on dashboard origins and reads `window.firebase.auth().currentUser.getIdToken()`. The background validates the token with GET /api/auth/session and keeps a short-lived in-memory `sessionCache` for fast icon clicks. The widget’s “authenticated” state comes from a single `ECHLY_GET_AUTH_STATE` at mount, which triggers `checkBackendSession()` (token from page + backend).

### Why the “Sign in” button still appears

- After the user completes the extension login flow, the login page redirects to `returnUrl` (the URL of the tab that triggered login), which is usually not the dashboard. So the tab that had Firebase auth becomes a non-dashboard tab; the token bridge is not present there, and the extension cannot get a token from that tab.
- The widget asks for auth state only once when it mounts. It never re-sends `ECHLY_GET_AUTH_STATE` when the user returns from the login tab or when a dashboard tab is opened. So the widget keeps showing “Sign in” even if the user is logged in elsewhere.

### What state mismatch exists

- **Background vs widget:** Background can later become “authenticated” (e.g. user opens a dashboard tab and clicks the icon again; `sessionCache` and tray open). The widget on another tab still has `user === null` from its initial mount and does not refresh, so it still shows “Sign in.”
- **Login tab after redirect:** That tab’s URL is no longer the dashboard; the bridge is not injected there, so the extension does not treat that tab as a token source. So “just logged in” is not visible to the extension on that tab.

### What architectural issue exists

- **Single auth check in the widget:** Auth state in the content script is one-shot at mount. There is no refresh on visibility change, focus, or “login completed” (e.g. after redirect or when a dashboard tab is available).
- **Redirect breaks token source:** The intended flow sends the user back to `returnUrl` (non-dashboard), so the only tab that had auth (the login tab) no longer has the bridge. The design assumes the extension can get a token from “a dashboard tab,” but after the redirect there may be no dashboard tab, so the extension cannot obtain a token until the user opens the dashboard again and the background runs a new check (which still does not update the widget’s `user` on other tabs).

No fixes or code changes are proposed in this audit; it is explanatory only.
