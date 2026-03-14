# Echly Extension Auth Latency — Diagnostic Audit

**Scope:** Read-only analysis of the extension authentication and login flow.  
**Goal:** Identify why the extension (1) takes 3–4 seconds before redirecting to login, (2) sometimes redirects to login when the user is already logged in, and (3) fails to detect login immediately after successful authentication.  
**No code changes or refactors.** Analysis only.

---

## SECTION 1 — Extension Click Timing

**File:** `echly-extension/src/background.ts`

### Pipeline from `chrome.action.onClicked` to tray or login tab

1. **Icon click** (line 414): `chrome.action.onClicked.addListener(async (tab) => { ... })`
2. **Immediate full session check:** The handler **always** runs `await checkBackendSession()`. It does **not** read `sessionCache` to short-circuit. Comment on line 427: "always re-check session so login is detected immediately after login."
3. **Session cache update:** After `checkBackendSession()` resolves, the result is written to `sessionCache` (lines 430–433). The cache is **never read** on this code path.
4. **Branch:** If `!session.authenticated` → `clearAuthState()`, build `loginUrl` with `returnUrl`, then `chrome.tabs.create({ url: loginUrl })` and return. Otherwise → toggle tray, `persistUIState()`, `broadcastUIState()`.

### What `checkBackendSession()` does (lines 296–325)

- Calls `getValidToken()` (which calls `getTokenFromPage()`). If that throws or returns no token → `clearAuthState()`, return `{ authenticated: false }`.
- Then `fetch(API_BASE + '/api/auth/session', { headers: { Authorization: Bearer <token> } })`. If `!res.ok` or any throw → `clearAuthState()`, return `{ authenticated: false }`.
- Otherwise returns session JSON.

### Where the 3–4 second delay can occur

| Step | Location | Potential delay |
|------|----------|------------------|
| **sessionCache** | Not used on click | N/A — cache is written but never read on icon click, so it does not reduce latency. |
| **getTokenFromPage()** | Lines 248–281 | **Primary source.** See Section 2. Background waits up to **6s per tab** (`TOKEN_REQUEST_TIMEOUT_MS = 6000`). Content script does handshake (up to 3s) + token request (up to 5s). Real-world 2–4s is typical for one tab (handshake + Firebase `getIdToken()` + message round-trip). |
| **chrome.tabs.query** | Line 265–267 | Usually tens of ms. |
| **chrome.tabs.sendMessage** | Line 252 (inside `tryTab`) | No inherent delay; delay is the **content script’s** work (handshake + token) and bridge response. The callback is gated by the content script’s async `requestTokenFromPage()`. |
| **Token bridge handshake** | Content script → `requestTokenFromPage` → `performHandshake` | Up to **3s** (handshake timeout in content). |
| **Backend /api/auth/session** | Lines 313–314 | No explicit timeout in the extension. Depends on network RTT and server (including Firebase JWKS fetch in `requireAuth`). Can add hundreds of ms to a few seconds under load or slow network. |

**Conclusion:** The 3–4 second delay is dominated by **await checkBackendSession()**: first **getTokenFromPage()** (token bridge handshake + token request + up to 6s timeout per tab), then the **session** fetch. The extension does not use `sessionCache` on click, so every click pays the full cost.

---

## SECTION 2 — Token Retrieval Timing

**Files:** `echly-extension/src/requestTokenFromPage.ts`, `echly-extension/src/secureBridgeChannel.ts`, `echly-extension/src/pageTokenBridge.js`

### Timeouts

| Layer | Constant | Value | Role |
|-------|----------|--------|------|
| **Background** (`background.ts`) | `TOKEN_REQUEST_TIMEOUT_MS` | **6000** | Max wait for `sendMessage(ECHLY_GET_TOKEN_FROM_PAGE)` response per tab. |
| **Content** (`requestTokenFromPage.ts`) | `HANDSHAKE_TIMEOUT_MS` | **3000** | Max wait for bridge handshake. |
| **Content** (`requestTokenFromPage.ts`) | `TOKEN_REQUEST_TIMEOUT_MS` | **5000** | Max wait for token response after handshake. |
| **Content** (`secureBridgeChannel.ts`) | `DEFAULT_HANDSHAKE_TIMEOUT_MS` | **3000** | Same handshake timeout when passed to `performHandshake()`. |

### Retry logic

- **None.** `performHandshake()` and the token request in `requestTokenFromPage()` have no retries. One timeout or failure → null.
- **Background:** `getTokenFromPage()` tries the active tab once, then each dashboard-origin tab once (sequential). No retry per tab.

### Worst-case token request latency

- **Content script (single tab):** Handshake up to 3s + token request up to 5s → **8s** in theory. The **background** only waits **6s** for the message response, so the effective cap per tab from the background’s perspective is **6s**.
- **Background (multiple dashboard tabs):** Sequential `tryTab()`: 6s + 6s + … per tab. Two tabs both timing out → **12s** before returning null.

### Does token retrieval block extension click?

**Yes.** The click listener is `async` and does `await checkBackendSession()`, which awaits `getTokenFromPage()`. Until every attempted tab either returns a token or hits the 6s timeout, the handler does not proceed to show the tray or open the login tab. So token retrieval **fully blocks** the response to the extension click.

### Why token retrieval can delay extension behavior

1. **Handshake:** Content script must establish a channel with the page script (`pageTokenBridge.js`). If the bridge is slow to load or the page is busy, handshake can take up to 3s or fail.
2. **Firebase `getIdToken()`:** The bridge calls `user.getIdToken()` (async). First call can involve network (token refresh). Adds variable latency.
3. **Message round-trip:** Background → content → page → content → background. Each step adds latency.
4. **Sequential tab tries:** If the active tab is not a dashboard tab or doesn’t respond, the background then tries every other dashboard tab one by one, each with a 6s ceiling, so total time grows with the number of dashboard tabs.

---

## SECTION 3 — Backend Session Validation

**Relevant logic:** `checkBackendSession()` in `echly-extension/src/background.ts` (lines 296–325) and `app/api/auth/session/route.ts`.

### Timeout behavior

- The extension **does not** set a timeout on `fetch()` for `/api/auth/session`. The request uses the browser’s default (and can hang on slow or stuck networks).
- The backend route does not impose a custom timeout; it calls `requireAuth(req)` then returns JSON.

### Error handling

- **Extension:** Any `fetch` throw (e.g. network error) → `catch` block → `clearAuthState()`, return `{ authenticated: false }`. So **any** network or server error is treated as “not authenticated.”
- **Backend:** `requireAuth` uses `jwtVerify` (jose) with a remote JWKS URL. Failure (invalid token, expired, wrong audience, or JWKS fetch failure) → 401. No retry in the extension.

### Retry logic

- **None** in the extension for the session request. One failure → not authenticated → user is sent to login.

### Network latency assumptions

- No minimum or maximum latency is assumed. A slow backend or a transient network error causes the extension to treat the user as logged out and open the login page.

### How this can cause login loops

1. **Transient failure:** Backend or network has a brief hiccup → 401 or throw → extension clears auth and opens login. User is actually logged in; they may log in again and get the same behavior on the next click.
2. **Slow backend:** JWKS fetch or token verification is slow → long wait, then possibly timeout or failure → again treated as not authenticated.
3. **No distinction between “no token” and “backend error”:** Both result in “open login,” so the extension cannot avoid redirecting to login when the real issue is backend/network.

---

## SECTION 4 — Session Cache Behavior

**Location:** `echly-extension/src/background.ts` (e.g. lines 13–19, 194–195, 207–242, 354–356, 430–433).

### TTL

- `SESSION_CACHE_TTL_MS = 30 * 1000` (30 seconds). The cache object stores `authenticated` and `checkedAt`; there is **no** explicit TTL check in the code that reads the cache. The TTL is only meaningful if some path **consults** the cache before running a full check.

### Invalidation

- `clearSessionCache()` sets `sessionCache = { authenticated: false, checkedAt: 0 }`. Called from `clearAuthState()` and when `prewarmAuthSession()` gets a non-ok or thrown response.
- `clearAuthState()` is called on 401/403, on `checkBackendSession()` token failure, and on session fetch failure.

### Refresh triggers

- **prewarmAuthSession()** (lines 210–242): Runs on `chrome.runtime.onStartup`, `chrome.runtime.onInstalled`, and when a tab’s `changeInfo.status === "complete"` and the tab URL is a dashboard origin. It calls `getTokenFromPage()` then `GET /api/auth/session` and updates `sessionCache`.
- **refreshExtensionAuth()** (lines 354–373): Runs when the background receives `ECHLY_EXTENSION_LOGIN_COMPLETE`. It calls `checkBackendSession()` and updates `sessionCache`, then broadcasts `ECHLY_AUTH_STATE_UPDATED`.
- **Icon click** (lines 429–433): After `checkBackendSession()` completes, the result is written to `sessionCache`. The cache is **not** read at the start of the click handler.

### When sessionCache can be stale

- Prewarm can fail (no dashboard tab, bridge not ready, or backend error) and set `sessionCache.authenticated = false` and `checkedAt = Date.now()`. The user might still be logged in on a tab that wasn’t ready in time.
- After login, `refreshExtensionAuth()` can fail (e.g. no token yet because the login tab is already redirecting), so `sessionCache` may stay or be set to unauthenticated even though the user just logged in.

### When the extension can believe the user is logged out when they are logged in

1. **Cache is never used on click:** So “stale cache” does not directly cause wrong behavior on click. However, the **full check** can wrongly conclude “not authenticated” when:
2. **No dashboard tab:** `getTokenFromPage()` returns null (e.g. user only has the login tab, which then redirects to `returnUrl`). Extension treats as logged out and opens login.
3. **Bridge not ready:** Dashboard tab exists but bridge or Firebase isn’t ready yet → handshake or token request times out → null → logged out.
4. **Backend/network failure:** Session request fails → extension clears auth and shows login.
5. **Prewarm set cache to false:** If prewarm ran when no tab was ready or backend failed, `sessionCache.authenticated` is false. The click handler ignores the cache and runs a full check; if that check also fails (same reasons), user is sent to login even if they are logged in elsewhere.

---

## SECTION 5 — Login Redirect Race Condition

**File:** `app/(auth)/login/page.tsx` (e.g. lines 46–61, 86–99).

### Flow: login success → Firebase auth → redirect

1. User completes sign-in (`signInWithGoogle()` or `signInWithEmailPassword()`).
2. If `isExtension && returnUrl`:
   - `window.chrome?.runtime?.sendMessage({ type: "ECHLY_EXTENSION_LOGIN_COMPLETE" })` (if available).
   - `window.postMessage({ type: "ECHLY_EXTENSION_LOGIN_COMPLETE" }, window.location.origin)`.
   - Then `safeRedirectToReturnUrl(returnUrl)` → `window.location.href = decoded` (redirect).
3. If not extension flow, app uses `checkUserWorkspace` and `router.replace(...)`.

So for the extension flow: **messages are sent, then redirect is set in the same synchronous block.** The redirect is not deferred until after the extension has finished validating the session.

### Does the extension check auth before the Firebase token is ready?

- **On the login tab:** After `signInWithGoogle()` resolves, Firebase auth state is already updated and `currentUser` is set. So when the extension is notified, the token **is** available on that page. The race is not “token not ready” but **“tab is redirecting or already gone.”**
- When the background receives `ECHLY_EXTENSION_LOGIN_COMPLETE`, it calls `refreshExtensionAuth()` which runs `checkBackendSession()` → `getTokenFromPage()`. By then the login page may have already set `window.location.href`, so the tab may be unloading or navigated away. The content script and page bridge on that tab can be torn down before they can respond to the token request.

### Race between login completion, token bridge, and extension auth check

- **Yes, a race exists:**
  - **T1:** Login page sets Firebase user, sends `ECHLY_EXTENSION_LOGIN_COMPLETE`, then `window.location.href = returnUrl`.
  - **T2:** Background receives the message and starts `refreshExtensionAuth()` → `checkBackendSession()` → `getTokenFromPage()`.
  - **T3:** `getTokenFromPage()` does `chrome.tabs.query` and `sendMessage` to the login tab. That tab may already be navigating or destroyed, so the content script may not respond or the bridge may be gone. Result: null or timeout.
  - **T4:** Redirect completes; the tab is now at `returnUrl` (often non-dashboard). No token bridge there, so the extension has no token source on that tab.

So the token bridge on the login tab is **not reliably available** when the extension tries to use it, because the redirect is triggered in the same turn as the login-complete signal and is not coordinated with the extension’s async validation.

---

## SECTION 6 — Token Source Availability

**Logic:** `getTokenFromPage()` in `echly-extension/src/background.ts` (lines 248–281).

### How dashboard tabs are chosen

1. `chrome.tabs.query({})` → all tabs.
2. **Active tab first:** If there is an active tab, `tryTab(activeTab.id)` is called. No check that the active tab is a dashboard tab; if it isn’t, the message is still sent. The content script on non-dashboard tabs does not inject the bridge; `requestTokenFromPage()` will handshake with a page that has no bridge → handshake times out (3s) and content returns null. Background waits up to 6s for the callback.
3. **Then dashboard tabs:** Iterate all tabs; for each tab whose URL origin is in `DASHBOARD_ORIGINS`, call `tryTab(tab.id)`. Stops at the first tab that returns a token.

### If no dashboard tab exists

- Active tab is tried first (possibly 6s if it’s non-dashboard and content times out).
- Then only tabs with dashboard origin are tried. If there are no dashboard tabs, no further `sendMessage` is sent; the function returns null after the active-tab attempt.
- So “no dashboard tab” yields null after at most one 6s attempt (the active tab).

### How many tabs are scanned

- **Query:** All tabs (one `chrome.tabs.query({})`).
- **Message sent to:** One attempt to the active tab (if any), then one attempt per dashboard-origin tab, **in sequence**, until one returns a token or all are tried.

### Timeout per tab

- **6 seconds** per tab (`TOKEN_REQUEST_TIMEOUT_MS`). Each tab is tried sequentially, so with two dashboard tabs and both failing, total wait is up to 12s.

### Why login detection may fail right after redirect

1. **Redirect removes the only auth tab:** After login, the app redirects the same tab to `returnUrl`. That tab is no longer on a dashboard origin, so it is no longer considered a token source. The bridge is not injected on `returnUrl`.
2. **No other dashboard tab:** Often the user had no other tab open on the dashboard. So after redirect there are **zero** dashboard tabs. `getTokenFromPage()` returns null.
3. **Timing:** Even if the extension runs `refreshExtensionAuth()` before the redirect completes, the login tab may already be unloading when `sendMessage` is delivered, so the content script may not respond in time. So login detection fails both because the token source disappears and because of the race described in Section 5.

---

## SECTION 7 — Extension Auth Loop Analysis

**Scenario:** User clicks extension → login tab opens → user logs in → login page redirects to returnUrl → user clicks extension again.

### Step-by-step

1. **First click:** `checkBackendSession()` runs. If no token (e.g. no dashboard tab or not logged in), `session.authenticated === false` → extension opens login tab with `returnUrl`.
2. **User logs in:** Firebase auth is set on the login page; `ECHLY_EXTENSION_LOGIN_COMPLETE` is sent; then `window.location.href = returnUrl`. Tab navigates to `returnUrl`.
3. **Background:** Receives `ECHLY_EXTENSION_LOGIN_COMPLETE`, runs `refreshExtensionAuth()` → `checkBackendSession()` → `getTokenFromPage()`. The former login tab is now at `returnUrl` (non-dashboard). No other dashboard tab. `getTokenFromPage()` finds no dashboard tab (or the only candidate is unloading) → null → `checkBackendSession()` returns `{ authenticated: false }`. `sessionCache` is set to unauthenticated; broadcast may send “not authenticated” to tabs.
4. **Second click:** Again `checkBackendSession()` runs. Again no dashboard tab (user is on `returnUrl` or another non-dashboard page). `getTokenFromPage()` returns null → not authenticated → extension opens the login page again.

### Why the extension still thinks the user is logged out

- **Token source:** After redirect there is **no** tab on a dashboard origin with an active token bridge. The extension’s only way to get a token is from a dashboard tab. So it correctly gets no token, but it interprets that as “user not logged in” and opens login again.
- **Token bridge:** On the tab that was the login page, the bridge is gone once the page navigates to `returnUrl`. So the bridge is not available when the extension asks for a token (either during `refreshExtensionAuth()` or on the second click).
- **Backend session check:** It never gets a token, so it never calls the backend. The loop is driven by **getTokenFromPage()** returning null, not by the backend returning 401.

### Summary

The loop is **architectural:** the extension requires a **dashboard tab** to get a token, but the post-login flow **removes** that tab by redirecting it to `returnUrl`. So after the first login there is no token source, and every subsequent click triggers the same “no token → open login” path.

---

## SECTION 8 — Latency Hotspots

Ranked by impact on “time until tray or login tab” and on correctness.

| # | Hotspot | Estimated contribution | Notes |
|---|---------|-------------------------|--------|
| 1 | **Token retrieval (getTokenFromPage + bridge)** | **~2–6s** | Handshake (up to 3s) + token (up to 5s); background waits up to 6s per tab. Dominant cost. No use of session cache on click. |
| 2 | **Sequential tab tries** | **+6s per extra tab** | Each dashboard tab is tried one after another. Two tabs both timing out → 12s. |
| 3 | **Backend /api/auth/session** | **~100ms–2s+** | No timeout in extension. Network + server (including JWKS fetch in `requireAuth`). |
| 4 | **chrome.tabs.query** | **~10–50ms** | Small compared to token and backend. |
| 5 | **Message passing (sendMessage round-trip)** | **~10–100ms** | Per tab; secondary to the work done in content script and bridge. |

**Worst-case total (one dashboard tab, timeouts):** ~6s (token) + backend time → often in the 3–6s range. Typical “3–4 seconds” matches one tab taking 2–3s for handshake + token + backend.

---

## SECTION 9 — Architecture Diagrams

### Extension click timing pipeline

```
User click
    │
    ▼
chrome.action.onClicked
    │
    ▼
background: checkBackendSession()  ← no sessionCache read
    │
    ├─► getTokenFromPage()
    │       │
    │       ├─► chrome.tabs.query({})
    │       ├─► tryTab(activeTab)     [up to 6s]
    │       │       │
    │       │       └─► content: ECHLY_GET_TOKEN_FROM_PAGE
    │       │                 │
    │       │                 └─► requestTokenFromPage()
    │       │                           │
    │       │                           ├─► performHandshake()  [up to 3s]
    │       │                           │       └─► pageTokenBridge.js → ECHLY_BRIDGE_READY
    │       │                           └─► postMessage(ECHLY_REQUEST_TOKEN)  [up to 5s]
    │       │                                     └─► bridge → user.getIdToken() → ECHLY_TOKEN_RESPONSE
    │       │
    │       └─► (if no token) tryTab(dashboard tab 2), ...  [each up to 6s]
    │
    ├─► fetch(/api/auth/session)  [no timeout]
    │
    ▼
sessionCache = result
    │
    ├─ if !authenticated → clearAuthState() → chrome.tabs.create(loginUrl)
    └─ if authenticated  → toggle tray → persistUIState() → broadcastUIState()
```

### Login detection pipeline

```
Login success (e.g. signInWithGoogle)
    │
    ▼
Firebase auth state set (currentUser)
    │
    ▼
Login page: sendMessage(ECHLY_EXTENSION_LOGIN_COMPLETE)
            postMessage(ECHLY_EXTENSION_LOGIN_COMPLETE)
    │
    ▼
Login page: safeRedirectToReturnUrl(returnUrl)  →  window.location.href = returnUrl  (same tick)
    │
    ▼
Background: refreshExtensionAuth()
    │
    └─► checkBackendSession()
            │
            └─► getTokenFromPage()
                    │
                    ├─ Login tab may already be unloading (redirect in progress)
                    ├─ Or tab is already at returnUrl (non-dashboard) → no bridge
                    └─► Result: null (no token)
            │
            ▼
    sessionCache = { authenticated: false }  (or unchanged)
    broadcast ECHLY_AUTH_STATE_UPDATED (authenticated: false) to tabs
    │
    ▼
Widget / extension: auth state remains “not authenticated”
    │
    ▼
User clicks extension again → getTokenFromPage() again → no dashboard tab → open login again (loop)
```

---

## SECTION 10 — Root Cause Summary

### Why extension login is slow (3–4 seconds)

1. **Every click does a full check:** The icon click handler always runs `checkBackendSession()` and **never** uses `sessionCache` to skip it. So every click pays the full cost of token retrieval + backend call.
2. **Token retrieval is the bottleneck:** Getting a token requires handshake (up to 3s) and token request (up to 5s) in the content script, with the background waiting up to 6s per tab. In practice this often takes 2–4s for one tab.
3. **Sequential tab tries:** If the first tab doesn’t have a token or is slow, the background tries other dashboard tabs one by one, each with a 6s cap, so total time can grow with the number of tabs.
4. **No timeout on session fetch:** Backend call can add more delay on slow networks.

### Why login detection fails after successful auth

1. **Redirect removes the token source:** The login page redirects to `returnUrl` in the same synchronous flow as sending the login-complete message. The tab that had Firebase auth and the token bridge becomes a non-dashboard tab, so the extension can no longer get a token from it.
2. **Race:** When the extension runs `refreshExtensionAuth()`, the login tab may already be navigating or gone, so the token request to that tab fails or times out.
3. **No dashboard tab after redirect:** Often there is no other dashboard tab. So after redirect there is no tab from which `getTokenFromPage()` can get a token, and the extension correctly concludes “no token” but interprets it as “user not logged in.”

### Why login loops occur

1. **No token source after redirect:** After login, the only tab that had auth is at `returnUrl`. The extension requires a dashboard tab to get a token. So every subsequent click sees “no token” and opens the login page again.
2. **Transient backend/network errors:** Any session fetch failure or getTokenFromPage failure is treated as “not authenticated,” so the extension opens login even when the user is logged in.
3. **No retries:** One failure per tab and one failure for the session request; no retry, so a single timeout or error leads to login redirect and can repeat.

### Architectural weaknesses

1. **Session cache unused on click:** Cache is maintained and has a 30s TTL but is never read in the click handler, so it cannot reduce latency or smooth over brief failures.
2. **Token only from dashboard tabs:** Auth is tied to the presence of a dashboard tab with the bridge. Redirecting the login tab to `returnUrl` removes that source and there is no fallback (e.g. no token from the login tab before redirect, or no short-lived in-memory token for the extension).
3. **Redirect not coordinated with extension:** Login-complete signal and redirect happen in the same turn; the extension is not given a chance to get a token from the login tab before the tab navigates away.
4. **All-or-nothing error handling:** Any token or session failure clears auth and sends the user to login; there is no distinction between “no token available” and “backend error” or “temporary network issue,” and no retry or backoff.
5. **No fetch timeout:** Session request can hang; failure mode is “slow then possibly fail,” which again is treated as not authenticated.

---

**End of diagnostic report.** No fixes were implemented; this document only describes current system behavior and root causes.
