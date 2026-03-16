# Echly Full Authentication System Audit

**Date:** 2025-03-16  
**Scope:** Read-only diagnostic audit. No code was modified.  
**Goal:** Confirm that the Echly dashboard and Chrome extension use a single authentication system.

---

## Executive Summary

The Echly dashboard and Chrome extension share **one authentication system**: the server-issued session cookie `echly_session`. The dashboard creates this cookie at login; the extension never handles credentials and instead exchanges the same cookie (via the `/extension-auth` broker page) for a short-lived extension JWT. All extension API calls use that JWT via `Authorization: Bearer <extensionToken>`, and the backend accepts either the session cookie or the extension token (or Firebase ID token) via `requireAuth()`. Logout clears the session cookie; the extension does not receive an explicit logout message but on next use `verifyDashboardSession()` fails and the user is sent to the login flow.

---

## 1. Dashboard Authentication

### 1.1 Inspected Components

| Item | Location | Purpose |
|------|----------|---------|
| Session API | `app/api/auth/session/route.ts` | POST: exchange Firebase ID token for session cookie |
| Session module | `lib/server/session.ts` | Cookie name, signing, verification, `getSessionUser()` |
| Login page | `app/(auth)/login/page.tsx` | Firebase sign-in + `createSessionCookie()` |

### 1.2 Confirmation: Dashboard Login Creates `echly_session` Cookie

- **Login page** (`app/(auth)/login/page.tsx`): After Firebase sign-in (Google or email/password), `createSessionCookie(user)` is called. It gets the Firebase ID token and sends `POST /api/auth/session` with `{ idToken }` and `credentials: "include"`.
- **Session route** (`app/api/auth/session/route.ts`): Verifies the Firebase ID token via `verifyIdToken(idToken)`, builds `sessionPayload = { uid, email, name }`, signs it with `signSessionPayload(sessionPayload)` from `lib/server/session.ts`, and sets the cookie:
  - **Cookie name:** `SESSION_COOKIE_NAME` → **`echly_session`** (exported from `lib/server/session.ts`, constant `COOKIE_NAME`).
  - **Cookie contains user identity:** Payload is `{ uid, email, name }` (JWT claims).
  - **httpOnly:** `response.cookies.set(SESSION_COOKIE_NAME, token, { httpOnly: true, ... })`.
  - **Lifetime:** `maxAge: SESSION_MAX_AGE_SECONDS` → **7 days** (`MAX_AGE_SECONDS = 7 * 24 * 60 * 60` in `lib/server/session.ts`).
  - **Other options:** `secure: isProduction`, `sameSite: "lax"`, `path: "/"`.

**Verdict:** Dashboard login creates the `echly_session` cookie with user identity, httpOnly, and a defined 7-day lifetime.

---

## 2. Extension Auth Broker

### 2.1 Inspected Components

| Item | Location | Purpose |
|------|----------|---------|
| Broker page | `app/extension-auth/page.tsx` | Loads in tab; POSTs for token, postMessages to extension, closes |
| Extension session API | `app/api/extension/session/route.ts` | POST: exchange cookie for extension token |
| Session reading | `lib/server/session.ts` | `getSessionUser(request)` reads `echly_session` |

### 2.2 Confirmation: Extension Uses POST /api/extension/session with credentials: include

- **Broker page** (`app/extension-auth/page.tsx`): On load, `useEffect` runs and calls:
  - `fetch("/api/extension/session", { method: "POST", credentials: "include" })`.
  - So the request **includes credentials** (cookies for the dashboard origin).
- **Backend** (`app/api/extension/session/route.ts`): `POST` handler calls `getSessionUser(request)`. In `lib/server/session.ts`, `getSessionUser()` parses the `Cookie` header for `echly_session`, verifies the JWT, and returns user or null. If no user → 401. If user → backend signs a short-lived JWT with `SignJWT(payload).setExpirationTime("15m")` and returns `{ extensionToken, user: { uid, email } }`.
- **Broker page (continued):** On 200, it reads `data.extensionToken` and `data.user`, then `window.postMessage({ type: "ECHLY_EXTENSION_TOKEN", token: data.extensionToken, user: data.user }, "*")` and `window.close()`.

**Verdict:** Extension auth broker calls `POST /api/extension/session` with `credentials: "include"`; backend reads `echly_session` cookie; extension receives `extensionToken` (and user) via postMessage.

---

## 3. Extension Token Flow (background.ts)

### 3.1 Inspected Components

| Item | Location | Purpose |
|------|----------|---------|
| Token storage | `echly-extension/src/background.ts` | `extensionToken`, `extensionTokenExpiresAt`, `sw.extensionToken` |
| Token TTL | Same file | `EXTENSION_TOKEN_TTL_MS = 14 * 60 * 1000` (14 min) |
| apiFetch | `echly-extension/utils/apiFetch.ts` | Adds `Authorization: Bearer ${extensionToken}`; on 401 clears token and sends `ECHLY_AUTH_INVALID` |

### 3.2 Confirmation: In-Memory Token and Expiry

- **Storage:** Token is kept in memory only: module-level `extensionToken` and `extensionTokenExpiresAt` in `background.ts`, and `setExtensionToken(token)` updates the same-named variable in `utils/apiFetch.ts`. `sw.extensionToken` is set for message handlers. No `chrome.storage` or `localStorage` for the token.
- **Expiry:** When the token is received (`ECHLY_EXTENSION_TOKEN` handler), `extensionTokenExpiresAt = Date.now() + EXTENSION_TOKEN_TTL_MS` (14 min). Backend JWT is 15 min; client uses 14 min to avoid edge expiry.
- **Enforcement:** In `getExtensionToken()`, the token is returned only if `extensionToken && extensionTokenExpiresAt != null && now < extensionTokenExpiresAt`. In `getValidToken()`, the same check is used and additionally `verifyDashboardSession()` is called when cache is valid; if the dashboard session is invalid (e.g. user logged out), token is cleared and a new token is obtained via the broker.
- **Refresh:** There is no proactive refresh timer. Token is “refreshed” when it’s expired or invalid: `getExtensionToken()` / `getValidToken()` open the `/extension-auth` tab and wait for `ECHLY_EXTENSION_TOKEN` with a new token.

**Verdict:** Extension stores `extensionToken` in memory, enforces `extensionTokenExpiresAt` (14 min), and refreshes by re-running the auth broker flow when the token is expired or session invalid.

---

## 4. API Authorization (Extension Calls and Backend Verification)

### 4.1 Extension API Calls

- **Background** uses `apiFetch` from `echly-extension/utils/apiFetch.ts`, which sends `Authorization: Bearer ${extensionToken}` and `credentials: "include"`. Used for: feedback, sessions, structure-feedback, upload-screenshot, upload-attachment, etc., via `getValidToken()` then `apiFetch(...)`.
- **Content / popup** do not call the API with a token directly. They send messages to the background (e.g. `echly-api`, `ECHLY_OPEN_WIDGET`, `ECHLY_PROCESS_FEEDBACK`, `ECHLY_UPLOAD_SCREENSHOT`). The background uses `getValidToken()` and `apiFetch()`, so **all API calls from the extension go through the background with `Authorization: Bearer <extensionToken>`**.

### 4.2 Backend Verification

- **requireAuth** (`lib/server/auth.ts`): If `Authorization: Bearer <token>` is present, it first tries `verifyIdToken(token)` (Firebase); on failure it tries `verifyExtensionToken(token)` from `lib/server/extensionAuth.ts`. If both fail, it throws 401. If no Bearer header, it falls back to `getSessionUser(request)` (session cookie).
- **verifyExtensionToken** (`lib/server/extensionAuth.ts`): Uses `jwtVerify(token, secret, { maxTokenAge: "15m" })` and checks `payload.type === "extension"`. Returns payload or null.
- **API routes** that need auth use `requireAuth(req)` (e.g. feedback, sessions, session-insight, tickets, upload-screenshot, upload-attachment, structure-feedback, workspace/status, insights, billing/usage, admin/update-plan). So extension Bearer tokens are verified via `verifyExtensionToken()` inside `requireAuth()`.

**Verdict:** Extension API calls use `Authorization: Bearer <extensionToken>`; backend verifies them via `verifyExtensionToken()` within `requireAuth()`.

---

## 5. Logout Behavior

### 5.1 Dashboard Logout

- **Trigger:** `components/layout/ProfileCommandPanel.tsx`: `handleSignOut` calls `fetch("/api/auth/logout", { method: "POST", credentials: "include" })`, then Firebase `signOut(auth)`, then `router.push("/login")`.
- **Logout route** (`app/api/auth/logout/route.ts`): Sets the cookie with `response.cookies.set("echly_session", "", { httpOnly: true, path: "/", maxAge: 0 })`, which **clears** the `echly_session` cookie.

**Verdict:** Dashboard logout clears the `echly_session` cookie.

### 5.2 Extension After Logout

- There is **no** `ECHLY_DASHBOARD_LOGOUT` (or similar) message in the current codebase: the dashboard does not postMessage to the extension on logout, and the background has no handler for dashboard-originated logout.
- **Session check:** When the user next uses the extension (icon click or open widget), the background calls `verifyDashboardSession()`, which does `POST /api/extension/session` with `credentials: "include"`. With the cookie cleared, the request has no valid session → backend returns 401 → `verifyDashboardSession()` returns false.
- **Behavior:** On icon click, when `!sessionValid`, the extension clears token/user state and opens the auth tab (or focuses an existing one). The auth tab loads `/extension-auth`, which POSTs `/api/extension/session` → 401 → redirects to `/login?returnUrl=/extension-auth`. So the **extension session check fails after logout** and the user is **redirected to login** when they try to use the extension.

**Verdict:** After dashboard logout, the extension session check fails on next use and the extension redirects to login (via the auth broker redirect to `/login`).

---

## 6. Extension Session Validation (verifyDashboardSession)

### 6.1 Implementation

- **Location:** `echly-extension/src/background.ts`, `verifyDashboardSession()`.
- **Logic:** `fetch(API_BASE + "/api/extension/session", { method: "POST", credentials: "include" })`. Returns `true` if `res.status !== 401`, else `false`. No extension token is sent; it relies on the browser sending the dashboard cookie (if the user has logged in on the dashboard origin in that browser).

### 6.2 Where It’s Used

- **Icon click:** Before opening the widget, `sessionValid = await verifyDashboardSession()`. If invalid, token/user are cleared and the auth tab is opened (or focused).
- **ECHLY_OPEN_WIDGET:** Same: `sessionValid = await verifyDashboardSession()`. If invalid, state is cleared and auth tab is opened; response is `{ ok: false, redirectToLogin: true }`.
- **getValidToken():** When a cached token exists and is not expired, it calls `verifyDashboardSession()`. If false, it clears the token and falls through to get a new token via the broker (which opens the auth tab).

**Verdict:** The extension validates session with `verifyDashboardSession()` before opening the widget and when reusing a cached token; invalid session leads to clearing state and redirecting to login (auth tab → `/login` when unauthenticated).

---

## 7. Auth Tab Flow (authTabOpen Guard and authBrokerTabId)

### 7.1 Guard and Tab Tracking

- **authTabOpen:** Boolean guard to avoid opening multiple `/extension-auth` tabs.
- **authBrokerTabId:** Tab ID of the current auth broker tab; used to focus it or to clear the guard when that tab is closed.

### 7.2 Where authTabOpen Is Set True

- **Icon click** (when `!sessionValid`): `authTabOpen = true`, then `chrome.tabs.create({ url: EXTENSION_AUTH_URL }, (tab) => { if (tab?.id) authBrokerTabId = tab.id; })`.
- **getExtensionToken():** When opening the broker, `authTabOpen = true` and `chrome.tabs.create(..., (tab) => { authBrokerTabId = tab?.id ?? null; })`.
- **ECHLY_OPEN_WIDGET** (when `!sessionValid`): Same pattern: `authTabOpen = true`, `chrome.tabs.create(..., (tab) => { if (tab?.id) authBrokerTabId = tab.id; })`.
- **ECHLY_TRIGGER_LOGIN:** Same: `authTabOpen = true`, create tab with callback setting `authBrokerTabId`.

**Verdict:** All code paths that open the auth tab set `authTabOpen = true` and use a callback to set `authBrokerTabId`.

### 7.3 Where the Guard Is Reset

- **chrome.tabs.onRemoved:** If `tabId === authBrokerTabId`, then `authBrokerTabId = null`, `authTabOpen = false`, and the pending broker promise is rejected.
- **ECHLY_EXTENSION_TOKEN handler:** After storing the token, `authTabOpen = false`, `brokerPromise = null`, and the auth tab is closed (`chrome.tabs.remove(authBrokerTabId)`), then `authBrokerTabId = null`.

**Verdict:** The guard resets when the auth tab is closed (by user or after successful token receipt).

### 7.4 focusExistingAuthTabIfOpen

- Before opening a new auth tab, the code uses `focusExistingAuthTabIfOpen()`. It returns true only if `authTabOpen && authBrokerTabId != null`. It then tries `chrome.tabs.get(authBrokerTabId)`; if the tab is missing (e.g. closed manually), it sets `authTabOpen = false` and `authBrokerTabId = null` and returns false so a new tab can be opened.
- So **clicking the extension repeatedly when logged out** still leads to login: either an existing auth tab is focused, or (if it was closed) a new auth tab is created and the user is sent to `/extension-auth` → 401 → redirect to `/login`.

**Verdict:** authTabOpen guard works; authBrokerTabId is set when opening the auth tab; the guard resets when the auth tab closes; repeated clicks when logged out still result in redirect to login (focus existing or open new tab).

---

## 8. Login Success Flow (ECHLY_EXTENSION_TOKEN)

### 8.1 Flow

1. User completes login on `/login` (or `/extension-auth` → redirect to `/login` → login).
2. User is redirected to `/extension-auth` (or lands there after login with `returnUrl=/extension-auth`).
3. Extension-auth page loads; session cookie is now set; it POSTs `/api/extension/session` with `credentials: "include"` → 200 with `{ extensionToken, user }`.
4. Page does `window.postMessage({ type: "ECHLY_EXTENSION_TOKEN", token: data.extensionToken, user: data.user }, "*")`.
5. **Session relay** (`echly-extension/src/sessionRelay.ts`), injected only on `*://localhost:3000/extension-auth*`, listens for that message and sends `chrome.runtime.sendMessage({ type: "ECHLY_EXTENSION_TOKEN", token, user })` to the background.
6. **Background** (`ECHLY_EXTENSION_TOKEN` handler): Stores token (`extensionToken`, `extensionTokenExpiresAt = Date.now() + 14min`, `setExtensionToken(token)`, `sw.extensionToken`), stores user in `sw.currentUser` and `cachedSessionUser`, resolves broker promise if any, sets `authTabOpen = false`, `brokerPromise = null`, closes auth tab via `chrome.tabs.remove(authBrokerTabId)`, sets `authBrokerTabId = null`, then sets `trayOpen = true`, `globalUIState.visible = true`, and calls `openWidgetInActiveTab()` then `broadcastUIState()`.

### 8.2 Confirmation

- **Token stored:** In background: `extensionToken`, `extensionTokenExpiresAt`, `setExtensionToken(token)`, `sw.extensionToken`, and user in `sw.currentUser` / `cachedSessionUser`.
- **Auth tab closes:** `chrome.tabs.remove(authBrokerTabId)` (and state cleared).
- **Widget opens:** `openWidgetInActiveTab()` is called so the widget opens automatically after login success.

**Verdict:** On ECHLY_EXTENSION_TOKEN, the token and user are stored correctly, the auth tab is closed, and the widget opens automatically.

---

## 9. Architecture Summaries

### 9.1 Dashboard Authentication Architecture

- **Identity:** Firebase (Google / email-password).
- **Session:** After login, dashboard calls `POST /api/auth/session` with Firebase ID token; backend verifies it and sets **echly_session** cookie (JWT, 7 days, httpOnly, secure in prod, sameSite lax, path /).
- **Subsequent requests:** Dashboard sends `credentials: "include"`; backend uses `getSessionUser(request)` for cookie-based routes or `requireAuth()` which accepts session cookie or Bearer (Firebase or extension).
- **Logout:** `POST /api/auth/logout` clears `echly_session` (maxAge: 0); then Firebase signOut and redirect to `/login`.

### 9.2 Extension Authentication Architecture

- **No credentials:** Extension never sees passwords or Firebase tokens.
- **Broker:** User opens `/extension-auth` (via icon click or OPEN_WIDGET when not validated). That page runs in the dashboard origin, so it sends the `echly_session` cookie with `POST /api/extension/session`. Backend returns `extensionToken` (15 min JWT) and user; page postMessages to session relay; relay sends `ECHLY_EXTENSION_TOKEN` to background.
- **Storage:** Token and expiry only in memory (background + apiFetch module). User in `sw.currentUser` / `cachedSessionUser`.
- **API calls:** All from background via `getValidToken()` + `apiFetch()` → `Authorization: Bearer <extensionToken>`.
- **Validation:** Before using cached token or opening widget, `verifyDashboardSession()` (POST /api/extension/session with credentials) ensures the dashboard session is still valid; if not, token is cleared and auth tab is opened.

### 9.3 Token Lifecycle

1. **Creation:** Dashboard login → `echly_session` cookie. Extension broker → `extensionToken` (15 min) from that cookie.
2. **Use:** Extension uses `extensionToken` in memory; 14 min client-side expiry; all API calls use Bearer token; backend verifies with `verifyExtensionToken()`.
3. **Refresh:** When expired or invalid, extension opens `/extension-auth` again and gets a new token via same cookie.
4. **End:** Logout clears cookie → next `verifyDashboardSession()` or API call fails → extension clears token and sends user to login. Also: any API 401 in `apiFetch` clears token and sends `ECHLY_AUTH_INVALID` (background clears all auth state).

### 9.4 Logout Propagation

- **Dashboard:** Logout clears `echly_session` cookie. No postMessage to extension.
- **Extension:** No explicit “dashboard logout” message. On next icon click or OPEN_WIDGET, `verifyDashboardSession()` gets 401 → session invalid → token cleared, auth tab opened → broker gets 401 → redirect to `/login`. So logout is effectively propagated by **cookie invalidation** and the next extension use triggering session check and login redirect.

### 9.5 Single Authentication System

- **Single source of truth:** The **echly_session** cookie created at dashboard login.
- **Dashboard:** Authenticates via that cookie (and optionally Bearer for some flows).
- **Extension:** Never has the cookie in its own context; gets a **derived** short-lived token by having the user open a page on the dashboard origin that sends the cookie to `POST /api/extension/session`. So the extension always depends on the same session as the dashboard.
- **Backend:** One `requireAuth()` that accepts session cookie, Firebase Bearer, or extension Bearer; extension tokens are issued only when `getSessionUser(request)` (cookie) succeeds.

**Conclusion:** The dashboard and extension correctly use a **single authentication system** rooted in the `echly_session` cookie; the extension only ever gets a derived, short-lived token from that session and does not implement a separate login system.

---

## 10. Audit Checklist Summary

| # | Item | Status |
|---|------|--------|
| 1 | Dashboard login creates echly_session cookie | Yes |
| 2 | Cookie contains user identity (uid, email, name) | Yes |
| 3 | Cookie is httpOnly | Yes |
| 4 | Cookie lifetime defined (7 days) | Yes |
| 5 | Extension calls POST /api/extension/session | Yes |
| 6 | Request uses credentials: include | Yes |
| 7 | Backend reads echly_session cookie | Yes (getSessionUser) |
| 8 | Extension receives extensionToken | Yes (via postMessage → sessionRelay → background) |
| 9 | Extension stores extensionToken in memory | Yes |
| 10 | extensionTokenExpiresAt enforced (14 min) | Yes |
| 11 | Tokens refreshed when expired (broker flow) | Yes |
| 12 | Extension API calls use Authorization: Bearer &lt;extensionToken&gt; | Yes (via background apiFetch) |
| 13 | Backend verifies via verifyExtensionToken() | Yes (inside requireAuth) |
| 14 | Dashboard logout clears echly_session | Yes |
| 15 | Extension session check fails after logout | Yes (401 on POST /api/extension/session) |
| 16 | Extension redirects to login when session invalid | Yes (auth tab → 401 → redirect to /login) |
| 17 | verifyDashboardSession() used before opening widget | Yes |
| 18 | Invalid session redirects to login | Yes |
| 19 | authTabOpen guard works | Yes |
| 20 | authBrokerTabId set when opening auth tab | Yes (all paths use callback) |
| 21 | Guard resets when auth tab closes | Yes (onRemoved + ECHLY_EXTENSION_TOKEN) |
| 22 | Repeated clicks when logged out still redirect to login | Yes (focus or new tab) |
| 23 | ECHLY_EXTENSION_TOKEN: token stored correctly | Yes |
| 24 | ECHLY_EXTENSION_TOKEN: auth tab closes | Yes |
| 25 | ECHLY_EXTENSION_TOKEN: widget opens automatically | Yes |

---

*End of audit report. No code changes were made.*
