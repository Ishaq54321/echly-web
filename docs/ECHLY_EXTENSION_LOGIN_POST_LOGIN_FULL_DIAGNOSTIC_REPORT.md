# Echly Extension — Full System Audit: Login + Post-Login Behavior (Diagnostic Report)

**Scope:** Extension login flow, redirect and returnUrl handling, extension state after login, widget auto-open, token bridge, dashboard tab dependency, auth cache, race conditions, and Start Session / Previous Session failures.

**No code was modified.** This document is diagnostic only.

---

## PART 1 — Login Success Flow

### Entry point

- **File:** `app/(auth)/login/page.tsx`
- **Flow:** Login button → Firebase auth → login success handler → redirect → dashboard load.

### Exact sequence (extension flow: `?extension=true`)

1. **Login button:** `handleGoogle` or `handleEmail` runs.
2. **Firebase auth:** `signInWithGoogle()` or `signInWithEmailPassword(email, password)`.
3. **Login success (extension branch):**
   - `if (isExtension)`:
     - `window.chrome.runtime.sendMessage({ type: "ECHLY_EXTENSION_LOGIN_COMPLETE" })` (fire-and-forget).
     - Build params: `extension=true`, and `returnUrl` if present from `searchParams.get("returnUrl")`.
     - **Redirect:** `window.location.href = \`/dashboard?${params.toString()}\``.
   - So the **same tab** that was on the login page is **navigated to the dashboard** (no direct redirect to `returnUrl` from the login page).
4. **Dashboard load:** The tab that was login becomes a dashboard tab; dashboard app loads at `/dashboard?extension=true&returnUrl=...` (when `returnUrl` was in the URL).

### Answers

- **What redirect occurs immediately after login?**  
  **Redirect is to `/dashboard`** (with optional `extension=true` and `returnUrl` in the query). There is **no** direct redirect to `returnUrl` from the login page.
- **Does login redirect directly to returnUrl?**  
  **No.** Login always redirects to `/dashboard?...` when `isExtension` is true.
- **Does it first redirect to /dashboard?**  
  **Yes.** The only post-login redirect from the login page is to `/dashboard`.
- **Does the dashboard code open returnUrl using window.open?**  
  **Yes.** `app/(app)/dashboard/page.tsx` has `DashboardReturnUrlHandler`: when `returnUrl` is in `searchParams`, it runs `window.open(decoded)` (new tab). The **current** tab stays on the dashboard.
- **Does the dashboard navigate away using window.location?**  
  **No.** The dashboard does not set `window.location`. It only opens `returnUrl` in a **new** tab.

### Verification: “Dashboard tab stays open and does not navigate away”

- **In code:** The dashboard tab **does not close** and **does not navigate away**. No `window.close`, `chrome.tabs.remove`, or `window.location` away from dashboard was found.
- **Observed behavior:** After login, the user has (1) the original tab now showing the dashboard, and (2) a **new** tab opened to `returnUrl`. So the dashboard tab stays open unless the user closes it or focuses the new tab and perceives the dashboard as “gone.”

---

## PART 2 — Return URL Handling

### Where returnUrl is used

| Location | Role |
|----------|------|
| **Login page** `app/(auth)/login/page.tsx` | Reads `returnUrl` from `searchParams.get("returnUrl")`. Used only to **pass through** to dashboard: redirect is to `/dashboard?extension=true&returnUrl=...`. Never redirects the login tab to `returnUrl`. |
| **Dashboard** `app/(app)/dashboard/page.tsx` | `DashboardReturnUrlHandler`: reads `returnUrl` from `searchParams`, decodes and validates (http/https), then **`window.open(decoded)`**. Opens `returnUrl` in a **new** tab. |
| **Extension background** `echly-extension/src/background.ts` | Builds login URL with `returnUrl` from `tab?.url` when opening login (icon click, ECHLY_OPEN_POPUP, ECHLY_SIGN_IN, etc.): `ECHLY_LOGIN_BASE + "?extension=true" + (returnUrl ? "&returnUrl=" + encodeURIComponent(returnUrl) : "")`. |

### Answers

- **Which file reads returnUrl?**  
  Login page (for redirect URL building) and dashboard (for opening the return tab). Background only **writes** it into the login URL.
- **Does dashboard open returnUrl with window.open?**  
  **Yes.** `window.open(decoded)` in `DashboardReturnUrlHandler`.
- **Does it use window.location instead?**  
  **No.** Dashboard does not use `window.location` for `returnUrl`.
- **Does any code close the dashboard tab?**  
  **No.** No `window.close`, `chrome.tabs.remove`, or other tab-closing logic was found. The dashboard tab remains open; a second tab is opened to `returnUrl`.

---

## PART 3 — Extension State After Login

### Message flow: ECHLY_EXTENSION_LOGIN_COMPLETE

1. **Login page** (after Firebase sign-in, extension branch):  
   `window.chrome.runtime.sendMessage({ type: "ECHLY_EXTENSION_LOGIN_COMPLETE" })`.  
   Sent **synchronously** immediately before `window.location.href = "/dashboard?..."`. The tab then starts navigating.
2. **Background** `echly-extension/src/background.ts`:  
   `chrome.runtime.onMessage.addListener` handles `ECHLY_EXTENSION_LOGIN_COMPLETE` and calls `refreshExtensionAuth()` (no `await`; fire-and-forget).
3. **refreshExtensionAuth():**
   - Calls `checkBackendSession()`.
   - `checkBackendSession()` calls `getValidToken()` → `getTokenFromPage()`.
   - If token is obtained and `/api/auth/session` is OK: sets `sessionCache = { authenticated: true, checkedAt }`, `globalUIState.user = session.user ?? null`, then `broadcastUIState()`.
   - If token is missing or request fails: `clearAuthState()` or no update; in the success branch we only set user and broadcast when `session.authenticated`.

### Verification

- **Does refreshExtensionAuth() update globalUIState.user?**  
  **Yes**, but only when `session.authenticated === true` (i.e. when `getTokenFromPage()` and backend session check succeed).
- **Does it broadcast updated state to all tabs?**  
  **Yes**, via `broadcastUIState()` when `session.authenticated` is true. That sends `ECHLY_GLOBAL_STATE` (not `ECHLY_AUTH_STATE_UPDATED`; the comment in background is inaccurate).
- **Does it trigger the widget to open?**  
  **No.** `refreshExtensionAuth()` never sets `globalUIState.visible` or `globalUIState.expanded`. Only the **icon click** handler sets `visible = true` and `expanded = true` when `session.authenticated === true`. So after login, the tray does **not** auto-open.

---

## PART 4 — Extension Widget Auto-Open

### Relevant state and messages

- **globalUIState.visible / expanded:** Set to `true` only in:
  - Icon click handler when `session.authenticated === true`.
  - `ECHLY_TOGGLE_VISIBILITY` handler (visible + expanded).
  - `ECHLY_EXPAND_WIDGET` (expanded only).
- **ECHLY_GLOBAL_STATE:** Carries `visible`, `expanded`, and the rest of global state. Content script shows the tray when `getShouldShowTray(state)` is true (e.g. `state.visible === true` or session-related flags).

### Answers

- **Which message causes the tray to open?**  
  **ECHLY_GLOBAL_STATE** with `state.visible === true` (and content script applying it via `setHostVisibility` / `__ECHLY_APPLY_GLOBAL_STATE__`).
- **Is this message sent after login?**  
  **Only if** `refreshExtensionAuth()` succeeds (token obtained and backend session OK). Then `broadcastUIState()` sends `ECHLY_GLOBAL_STATE` with updated `user`, but **still with `visible: false` and `expanded: false`** because `refreshExtensionAuth()` never sets them to true.
- **If not, why?**  
  **Two reasons:**  
  1. **Widget open is never requested after login:** No code path after `ECHLY_EXTENSION_LOGIN_COMPLETE` sets `globalUIState.visible = true` or `expanded = true`.  
  2. **Auth refresh often fails** due to timing (see Part 8): `getTokenFromPage()` often returns null right after login, so `session.authenticated` stays false and we don’t even broadcast.

---

## PART 5 — Token Bridge State

### File: `echly-extension/src/pageTokenBridge.js`

- **Firebase auth readiness:**  
  The bridge **waits** for auth:
  - `waitForAuthInstance()`: polls for `window.firebase.auth()` every 100 ms, up to **5 seconds** (`AUTH_WAIT_MS = 5000`).
  - `getTokenFromAuth(authInstance)`: if `currentUser` exists, uses `getIdToken()`; otherwise subscribes to `onAuthStateChanged` with a **5 second** timeout; when a user appears, gets the token.
- **When extension asks for a token and Firebase is still restoring session:**  
  The bridge can take up to ~5 s to get an auth instance and then up to another ~5 s for `onAuthStateChanged`. If the content script’s handshake/timeout (e.g. 1.5 s + 2 s in `requestTokenFromPage.ts`) fires first, the bridge may not have called `sendTokenResponse(token)` yet, and the extension gets a timeout/null.
- **Can the bridge return null even when user is logged in?**  
  **Yes.** Scenarios:
  - Firebase not yet available or session not yet restored within the bridge’s wait/timeouts.
  - Page (e.g. login) unloading or navigated away before the bridge responds.
  - Content script handshake or token request timeouts (1.5 s handshake, 2 s token request) expiring before the bridge responds.

---

## PART 6 — Dashboard Tab Dependency

### getTokenFromPage() (background.ts)

- **Logic:**  
  - Tries **active tab** first via `ECHLY_GET_TOKEN_FROM_PAGE`.  
  - Then iterates **all tabs** and tries each tab whose URL origin is in `DASHBOARD_ORIGINS`.  
  - **Does not** open a dashboard tab. Comment: “Extension must NEVER create dashboard tabs automatically. Dashboard only via login redirect.”  
  - Returns **null** if no tab returns a token.
- **Does it require a dashboard tab to retrieve tokens?**  
  **Yes.** Tokens come only from a tab that (1) is on a dashboard origin and (2) has the token bridge injected and (3) responds with a token within the timeout. So a **dashboard tab** (or a page on dashboard origin with the bridge) is required.
- **What happens if the dashboard tab closes?**  
  `getTokenFromPage()` finds no dashboard tab (or no token), returns null. Then `getValidToken()` throws `NOT_AUTHENTICATED`, `checkBackendSession()` returns `{ authenticated: false }`, and the extension behaves as unauthenticated (e.g. opens login on icon click).
- **Does the extension still function without a dashboard tab?**  
  **No.** Any operation that needs a token (session check, Start Session, Previous Session, API calls) will fail when there is no dashboard tab with a working bridge.

---

## PART 7 — Extension Auth Cache

### sessionCache (background.ts)

- **Shape:** `{ authenticated: boolean; checkedAt: number }`.
- **TTL:** `SESSION_CACHE_TTL_MS = 30 * 1000` is **defined but never used**. No code reads `sessionCache` or `checkedAt` to skip a session check. Every icon click and every `refreshExtensionAuth()` calls `checkBackendSession()` → `getValidToken()` → `getTokenFromPage()`.
- **When cache is updated:**  
  On `refreshExtensionAuth()` and icon click after `checkBackendSession()`, and in `prewarmAuthSession()`; also set to `{ authenticated: false }` in `clearSessionCache()` / `clearAuthState()`.
- **When cache is invalidated:**  
  `clearSessionCache()` (and thus `clearAuthState()`) sets `sessionCache = { authenticated: false, checkedAt: 0 }`. No TTL-based invalidation exists.
- **What happens if “cache” (i.e. last successful state) is from before redirect and then expires?**  
  Since the cache is not used for short-circuiting, “expiry” doesn’t apply. After redirect, the next action (e.g. icon click) always runs a full `checkBackendSession()`. If at that moment there is no dashboard tab or the bridge isn’t ready, the result is unauthenticated and the extension can open login again.

---

## PART 8 — Extension Message Race Conditions

### Relevant ordering

1. **Login page:** Sends `ECHLY_EXTENSION_LOGIN_COMPLETE`, then immediately sets `window.location.href = "/dashboard?..."`. The tab starts unloading/navigating.
2. **Background:** Receives the message and calls `refreshExtensionAuth()` (async, not awaited). So `checkBackendSession()` → `getTokenFromPage()` runs **in parallel** with the navigation.
3. **getTokenFromPage():** Finds tabs by URL; sends `ECHLY_GET_TOKEN_FROM_PAGE` to the active tab (the one that was login, now navigating to dashboard) and/or other dashboard tabs. Timeout 2 s per tab.
4. **Token bridge:** Injected only on dashboard origin. On the **login** page the origin is still the dashboard origin, so the content script and bridge can be present, but:
   - The page may already be unloading, so the bridge or content script may be torn down.
   - If the tab has already switched to the dashboard URL, the new page may still be loading; the bridge is injected when the content script runs and the script loads; Firebase on the new page may not have restored the session yet.

### Scenarios where extension checks auth before dashboard is ready

- **Scenario A:** Message is processed while the tab is still on the login URL but unloading. Content script or bridge may not respond in time → token null.
- **Scenario B:** Tab has already navigated to dashboard; dashboard document is loading. Content script may not be ready, or bridge not yet injected/loaded → token null.
- **Scenario C:** Dashboard document is ready and content script runs, bridge injected, but Firebase `onAuthStateChanged` has not fired yet on the new page. Bridge’s 5 s wait may exceed the content script’s token request timeout → token null.
- **Scenario D:** User has multiple tabs; the “dashboard” tab used for the token might be a different tab that is still on login or loading. Result is non-deterministic.

In all these cases, `refreshExtensionAuth()` can set `sessionCache.authenticated = false` and never set `globalUIState.user`, so the extension remains in an “not logged in” state and the widget does not open, and a subsequent icon click may open the login tab again.

---

## PART 9 — Start Session / Previous Session Failure

### ECHLY_SESSION_MODE_START (background.ts)

- Handler sets `globalUIState.sessionModeActive = true`, `sessionPaused = false`, `sessionId = activeSessionId`, `expanded = true`, persists and broadcasts, resets idle timer, then `sendResponse({ ok: true })`. It **does not** call `getValidToken()` or `getTokenFromPage()`. So **ECHLY_SESSION_MODE_START** itself does not fail due to token.

### ECHLY_SET_ACTIVE_SESSION (background.ts)

- When `sessionId` is non-null, the handler sets state and then runs an **async** block that:
  - Calls **`getValidToken()`** (i.e. `getTokenFromPage()`; throws if null).
  - Uses the token to fetch `/api/feedback` and `/api/sessions`.
- If **getValidToken()** throws (no dashboard tab or bridge not ready), the async block enters the `catch`, sets `globalUIState.pointers = []`, and still calls `sendResponse({ success: true })`. So the UI can show “success” but with empty pointers and no session title.
- **Start Session** in the widget typically creates a session and then calls `ECHLY_SET_ACTIVE_SESSION` with the new session id and/or `ECHLY_SESSION_MODE_START`. The **failure** is when the background tries to load feedback/sessions for the new session via `getValidToken()` and no token is available.

### Why these actions fail after login redirect

- **Token retrieval fails** during the async part of **ECHLY_SET_ACTIVE_SESSION** (and any other message that uses `getValidToken()`):
  - Right after redirect, the only dashboard tab may still be loading or Firebase may not have restored the session yet.
  - If the user closed the dashboard tab and is only on the `returnUrl` tab, there is no dashboard tab → `getTokenFromPage()` returns null → `getValidToken()` throws.
- So: **Start Session / Previous Session** often fail after login because they depend on a valid token from a dashboard tab, and that token is often unavailable due to timing or missing dashboard tab (see Part 6 and Part 8).

---

## FINAL DIAGNOSTIC SUMMARY

### 1. Why the dashboard tab “closes” after login

- **In code:** The dashboard tab is **not** closed or navigated away. Login redirects the login tab to `/dashboard`; the dashboard then opens `returnUrl` in a **new** tab with `window.open()`. The original tab stays on the dashboard.
- **User perception:** The user may be focused on the **new** tab (returnUrl) and assume the dashboard “closed,” or they may **manually close** the dashboard tab. Once the dashboard tab is closed, the extension has no token source (Part 6), which contributes to “extension not working” and “sent back to login.”

### 2. Why the widget does not open automatically after redirect

- **No auto-open after login:** `refreshExtensionAuth()` only updates `sessionCache` and `globalUIState.user` when the session check succeeds; it **never** sets `globalUIState.visible` or `globalUIState.expanded`. The only place that opens the tray (visible + expanded) is the **icon click** handler when authenticated.
- **Session check often fails:** Because of the race (Part 8), `refreshExtensionAuth()` often gets no token and never updates user or broadcasts a “logged in” state. So even if we later added “set visible = true after login,” the extension often wouldn’t be in an authenticated state right after redirect.

### 3. Why extension actions fail after login

- **Token dependency:** Start Session, Previous Session, and other API-backed actions use `getValidToken()` → `getTokenFromPage()`, which requires a dashboard tab with a working bridge.
- **Timing:** Right after redirect, that tab may still be loading or Firebase may not be ready, so token is null.
- **Missing dashboard tab:** If the user closed the dashboard tab or is only on the returnUrl tab, there is no dashboard tab, so token is always null and those actions fail (or show empty state).

### 4. Why the extension sometimes sends the user back to login

- **Auth check on icon click:** On every icon click, the background runs `checkBackendSession()` (no use of session cache). If `getTokenFromPage()` returns null (no dashboard tab or bridge not ready), `checkBackendSession()` returns not authenticated and the icon handler opens the login tab again.
- So: after redirect, if the dashboard tab is closed or the bridge isn’t ready yet, the next click on the extension icon triggers “open login” again even though the user is logged in on the web app.

### 5. Is token-bridge dependency on the dashboard tab the root cause?

- **Yes, in combination with timing.**  
  - The extension has **no** token without a dashboard tab (or equivalent origin) with the bridge and Firebase.  
  - The bridge is only on dashboard origin; after redirect, the tab that was login becomes the dashboard tab, but it may still be loading or Firebase may not be ready when `refreshExtensionAuth()` runs.  
  - So the main causes of the observed behavior are:  
    1. **Architectural:** Token is only available from a dashboard tab.  
    2. **Timing:** Login-complete message is handled while the tab is transitioning or the new dashboard page/bridge/Firebase are not ready, so the first auth refresh often fails.  
    3. **No widget auto-open:** Even when auth refresh would succeed, the tray is never explicitly opened after login.  
    4. **User closing dashboard:** If the user closes the dashboard tab, the extension loses its only token source and will show “not authenticated” and open login again on next use.

---

**End of diagnostic report. No fixes were proposed or applied.**
