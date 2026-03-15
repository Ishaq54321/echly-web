# Echly Authentication Audit Report

**Date:** 2025-03-15  
**Scope:** Chrome extension + Web dashboard + Backend API (read-only audit)  
**Goal:** Trace the full auth pipeline and verify login, token storage, token usage, logout, and session validation.

---

## 1. Login Flow

### 1.1 Flow trace

1. **User clicks extension icon**  
   - `background.ts`: `chrome.action.onClicked` fires.  
   - If `extensionAccessToken` is set → `openTray()` and return.  
   - Else → `openLogin(tab)`.

2. **openLogin(tab)**  
   - Builds `LOGIN_URL` = `https://echly-web.vercel.app/login?extension=true` (optional `&returnUrl=...`).  
   - `chrome.tabs.create({ url: loginUrl })` opens the login tab.

3. **Login page (Next.js)**  
   - `app/(auth)/login/page.tsx`:  
     - `isExtension = searchParams.get("extension") === "true"`.  
     - On Firebase sign-in (Google or email/password), if `isExtension`:  
       - `idToken = await user.getIdToken()`, `refreshToken` from user.  
       - `window.postMessage({ type: "ECHLY_EXTENSION_LOGIN_SUCCESS", idToken, refreshToken, uid, name, email }, window.location.origin)`.  
       - Then `window.location.href = "/dashboard"` (redirect).  
     - Non-extension path: calls `/api/auth/sessionLogin` with Bearer token and redirects per workspace.

4. **Content script bridge**  
   - `content.tsx`: `ensureBrokerAndLogoutBridge()` registers a `window.addEventListener("message", ...)`.  
   - **Origin check:** `if (event.origin !== ECHLY_DASHBOARD_ORIGIN) return` — `ECHLY_DASHBOARD_ORIGIN` is hardcoded `"https://echly-web.vercel.app"`.  
   - On `event.data?.type === "ECHLY_EXTENSION_LOGIN_SUCCESS"`:  
     - `chrome.runtime.sendMessage({ type: "ECHLY_EXTENSION_LOGIN_SUCCESS", idToken, refreshToken, uid, name, email }).catch(() => {})`.  
   - Content does **not** send a response back to the page; it only forwards to the background.

5. **Background handler**  
   - `background.ts`: listener for `request.type === "ECHLY_EXTENSION_LOGIN_SUCCESS"`.  
   - Validates `idToken` and `uid` present; else returns.  
   - Sets `extensionAccessToken = idToken`, calls `persistToken(idToken)`, sets `globalUIState.user`, focuses `originTabId` if set, calls `openTray()`, then `broadcastState()`.  
   - Returns `false` (no async `sendResponse`).

### 1.2 Verification checklist

| Check | Status |
|-------|--------|
| Token is received | Yes — from `request.idToken` (and uid, name, email). |
| Token is stored | Yes — `persistToken(idToken)` → `chrome.storage.local.set({ echly_extension_token: token })`. |
| User state updated | Yes — `globalUIState.user = { uid, name, email, photoURL: null }`. |
| Tray opens | Yes — `openTray()` then `broadcastState()`. |

### 1.3 Login flow diagram

```
[User] → Click extension icon
    → background: openLogin(tab) → chrome.tabs.create(LOGIN_URL)
[Login tab] → User signs in (Google / email)
    → login page: user.getIdToken() + postMessage(ECHLY_EXTENSION_LOGIN_SUCCESS, origin)
    → content (same page): event.origin === ECHLY_DASHBOARD_ORIGIN? → chrome.runtime.sendMessage(ECHLY_EXTENSION_LOGIN_SUCCESS, …)
    → background: store token, persistToken(), set user, openTray(), broadcastState()
    → login page: location.href = "/dashboard"
```

### 1.4 Inconsistencies / fragility

- **MEDIUM — Local dev login broken:** `ECHLY_DASHBOARD_ORIGIN` is only `https://echly-web.vercel.app`. On `http://localhost:3000/login`, `event.origin` is `http://localhost:3000`, so the content script drops the message and the extension never receives the token. Extension login only works when the login page is on production.
- **LOW — Possible race:** Login page does `postMessage` then immediately `location.href = "/dashboard"`. `chrome.runtime.sendMessage` is asynchronous; in practice the message is queued before unload, but there is no guarantee or retry if the tab closes before the background processes it.
- **LOW — Unused bridge type:** Content forwards `ECHLY_EXTENSION_TOKEN` to the background, but `background.ts` has **no handler** for `ECHLY_EXTENSION_TOKEN`. Only `ECHLY_EXTENSION_LOGIN_SUCCESS` and `ECHLY_DASHBOARD_LOGOUT` are handled. The “broker” token path is dead.

---

## 2. Token Storage Audit

### 2.1 Where the extension stores tokens

| Location | Key | Type |
|----------|-----|------|
| **chrome.storage.local** | `echly_extension_token` | string (Firebase ID token) |
| **Background in-memory** | `extensionAccessToken` (module-level variable) | string \| null |

### 2.2 Persistence and restoration

- **Persist:** `persistToken(token)` in background calls `chrome.storage.local.set({ echly_extension_token: token })`.
- **Restore:** On load, background runs `(async () => { await restoreToken(); })()`. `restoreToken()` does `chrome.storage.local.get("echly_extension_token")` and, if string, sets `extensionAccessToken = data.echly_extension_token`.
- **Clear:** `clearAuthState()` sets `extensionAccessToken = null` and `chrome.storage.local.remove("echly_extension_token")`.

### 2.3 Survival matrix

| Event | Token in storage | In-memory |
|-------|------------------|-----------|
| Browser restart | Yes (storage.local persists) | No — restored on next startup via `restoreToken()` |
| Extension reload | Yes | No — restored by `restoreToken()` at bottom of script |
| Tab reload | Yes | Unchanged (background not reloaded) |

So: tokens **survive** browser restart and extension reload; they are re-read from `chrome.storage.local` when the background script runs.

### 2.4 Gaps

- **No proactive token refresh:** The extension stores a single Firebase ID token. Firebase ID tokens expire (typically ~1 hour). There is no refresh flow (e.g. using `refreshToken` or Firebase REST). When the token expires, the next API call gets 401/403 and `clearAuthState()` runs. So the user is effectively logged out after ~1 hour until they log in again via the dashboard.
- **Refresh token not used:** Login page sends `refreshToken` in the postMessage, and content forwards it to the background, but the background **never stores or uses** `refreshToken`. Only `idToken` is stored and used.

---

## 3. Token Usage Audit

### 3.1 Content script → background proxy

- **contentAuthFetch.ts:**  
  - `authFetch(input, init)` builds `url`, `method`, `headers`, `body` and sends `chrome.runtime.sendMessage({ type: "echly-api", url, method, headers, body })`.  
  - No token in content; all auth is in the background.

- **background.ts "echly-api" handler:**  
  - `const token = await getValidToken()` (throws if not set).  
  - `fetch(url, { method, headers: { ...headers, Authorization: \`Bearer ${token}\` }, body })`.  
  - If `res.status === 401 || res.status === 403` → `clearAuthState()`.  
  - Sends back `{ ok, status, headers, body }` to the content script.

### 3.2 Verification

| Check | Status |
|-------|--------|
| Authorization header present | Yes — `Authorization: \`Bearer ${token}\`` in background fetch. |
| Bearer format | Yes — `Bearer ` + token. |
| Background fetch proxy | Yes — all content API calls go through `echly-api` → background performs fetch with token. |
| 401/403 handling | Yes — clears auth and returns response to caller. |

### 3.3 API calls that use auth

- Content uses `apiFetch` from `contentAuthFetch.ts`, which uses `authFetch` → `echly-api`. So all content-originated API calls (e.g. `/api/sessions`, `/api/structure-feedback`, `/api/feedback`, `/api/tickets/...`) are authenticated via the background proxy.
- **No API call from the extension is sent without authentication** when going through `contentAuthFetch.apiFetch` / `authFetch`, because `getValidToken()` throws and the handler catches and returns `{ ok: false, status: 0, ... }` if not authenticated.

### 3.4 Dashboard token usage (for completeness)

- **lib/authFetch.ts** (dashboard): Does **not** set an `Authorization` header. It uses `credentials: "include"` so the `__session` cookie (set by `/api/auth/sessionLogin`) is sent. Backend `requireAuth()` accepts either Bearer token or `__session` cookie, so dashboard API calls are authenticated via cookie.

---

## 4. Logout Flow Trace

### 4.1 Dashboard logout

- **ProfileCommandPanel.tsx** `handleSignOut`:  
  1. `fetch("/api/auth/logout", { method: "POST", credentials: "include" })` — clears `__session` cookie and revokes refresh tokens.  
  2. `window.postMessage({ type: "ECHLY_DASHBOARD_LOGOUT" }, "*")`.  
  3. `await signOut(auth)` (Firebase client sign-out).  
  4. `onClose()`.

### 4.2 Extension receipt of logout

- **Content script:** Listener in `ensureBrokerAndLogoutBridge()`: on `event.data?.type === "ECHLY_DASHBOARD_LOGOUT"` and `event.origin === ECHLY_DASHBOARD_ORIGIN`, calls `chrome.runtime.sendMessage({ type: "ECHLY_DASHBOARD_LOGOUT" })`.
- **Background:** On `request.type === "ECHLY_DASHBOARD_LOGOUT"` runs `clearAuthState()` (nulls token, removes from storage, clears `globalUIState.user`, sets `visible`/`expanded` to false, `broadcastState()`).

So: dashboard clears Firebase and session; extension clears stored token and global state when it receives the message **from a tab whose origin is ECHLY_DASHBOARD_ORIGIN** (typically the same tab where the user clicked Sign out).

### 4.3 If extension still has a valid token after dashboard logout

- **Dashboard:** Sign-out clears Firebase and session cookie and revokes refresh tokens via `/api/auth/logout`. The backend will reject that user’s **refresh** tokens for new session cookies; existing Firebase ID tokens remain valid until they expire (~1 hour) unless Firebase Admin revokes them.  
- **Extension:** It is only cleared when it receives `ECHLY_DASHBOARD_LOGOUT` from a page with origin `ECHLY_DASHBOARD_ORIGIN`. If the user signed out in a different browser/device, or the message is not delivered (e.g. no dashboard tab open, or origin mismatch), the extension **does not** clear.  
- **Conclusion:** The extension can stay “authenticated” (tray open, token in storage) until either (1) it receives `ECHLY_DASHBOARD_LOGOUT` from a dashboard tab, or (2) the stored ID token expires or is rejected (401/403 on next API call). There is no periodic validation against the backend (e.g. no GET `/api/auth/session` in the current extension code).

---

## 5. Session Validation

### 5.1 Endpoint existence

- **GET /api/auth/session** exists: `app/api/auth/session/route.ts`.  
  - Uses `requireAuth(req)` (Bearer or `__session` cookie).  
  - Returns `{ authenticated: true, user: { uid } }` or 401 with `{ authenticated: false }`.

### 5.2 Extension use of session validation

- **Finding:** The extension **does not** call GET `/api/auth/session` anywhere in the current codebase.  
  - No `checkBackendSession`, `validateSessionAndOpenTray`, or similar.  
  - Icon click: if token exists, tray opens; if not, login tab opens. No server-side session check before opening the tray.  
  - Token validity is only discovered when an API call returns 401/403, at which point `clearAuthState()` is called.

So: **Session validation endpoint exists and works**, but **the extension does not use it**. Session validity is effectively “use token until 401/403.”

---

## 6. Security Review

| Issue | Severity | Description |
|-------|----------|-------------|
| **Token in chrome.storage.local** | LOW | Token is in extension local storage. Not accessible to web pages; accessible to other extension components. Acceptable for MV3. |
| **postMessage targetOrigin on login** | LOW | Login page uses `window.location.origin` for postMessage, so only same-origin receives the token. Content then checks `event.origin === ECHLY_DASHBOARD_ORIGIN`. No token leakage to arbitrary origins. |
| **Logout postMessage to "*"** | LOW | Dashboard sends `postMessage(..., "*")`. Any frame could receive the message; content only forwards when `event.origin === ECHLY_DASHBOARD_ORIGIN`. Logout is not sensitive data. |
| **No token refresh** | MEDIUM | Stored Firebase ID token expires ~1 hour. No refresh; user must re-login via dashboard. No use of `refreshToken`. |
| **Missing logout sync** | MEDIUM | If user logs out on another device or in a tab without extension content (e.g. different origin), extension is not notified and keeps using the token until it expires or gets 401/403. |
| **No proactive session check** | LOW | Extension does not call GET `/api/auth/session` to re-validate. Stale or revoked tokens are only detected on next API call. |
| **Hardcoded dashboard origin** | MEDIUM | `ECHLY_DASHBOARD_ORIGIN` is fixed to production. Local/dev login to extension is broken; also prevents supporting multiple dashboard origins. |
| **Firebase config in repo** | LOW | `lib/firebase/config.ts` and extension use the same config (apiKey, etc.). Standard for client Firebase; ensure no sensitive server keys. |
| **Race: login redirect vs sendMessage** | LOW | Redirect right after postMessage could theoretically close the tab before background processes the message; no retry. |

No evidence of: token leakage to pages, unsafe storage beyond the above, or auth bypass. Backend `requireAuth` consistently used on API routes checked.

---

## 7. Final Auth Health Report

### 7.1 Login flow

- End-to-end path: icon → open login → Firebase sign-in → postMessage → content (origin check) → background store + persist + tray is implemented and consistent.
- **Issues:** Local/dev login fails due to hardcoded production origin; possible redirect/sendMessage race; unused `ECHLY_EXTENSION_TOKEN` bridge.

### 7.2 Token storage

- Single key `echly_extension_token` in `chrome.storage.local`; in-memory copy in background; restore on startup. Survives browser/extension reload.
- **Issues:** No refresh; `refreshToken` never stored or used.

### 7.3 Token usage

- All extension API calls go through background `echly-api` with `Authorization: Bearer <token>`. 401/403 trigger `clearAuthState()`. No unauthenticated API path found.

### 7.4 Logout behavior

- Dashboard: POST `/api/auth/logout`, postMessage `ECHLY_DASHBOARD_LOGOUT`, then Firebase signOut. Extension: on message (with origin check) clears token and state. Works when logout happens on a dashboard tab with the same origin. Extension can remain “logged in” until token expiry or 401 if logout happens elsewhere.

### 7.5 Session validation

- GET `/api/auth/session` exists and is implemented. Extension does **not** call it; no “extension session validation” in the extension code.

### 7.6 Security issues

- No critical token leakage or storage abuse. Medium: no refresh, logout only synced when dashboard tab (same origin) sends message; hardcoded origin breaks dev and limits multi-origin.

### 7.7 Architecture weaknesses

- Two sources of truth: dashboard (Firebase + cookie) vs extension (stored ID token). No shared session store; extension does not re-validate with backend.
- Token lifetime: ~1 hour then implicit logout on next API call.
- Logout sync depends on a dashboard tab with correct origin; no push or polling for “user signed out elsewhere.”

---

## AUTH SYSTEM STATUS: STABLE WITH GAPS

The core pipeline (login → store → use Bearer on API → logout clear) is implemented and consistent. The following gaps should be fixed for robustness and better UX:

1. **Extension never calls GET /api/auth/session** — session validation endpoint exists but is unused; consider validating on icon click or periodically.
2. **No token refresh** — stored ID token expires; add refresh (e.g. using `refreshToken`) or document 1-hour re-login expectation.
3. **Logout sync** — extension only clears when it receives `ECHLY_DASHBOARD_LOGOUT` from the allowed origin; consider periodic session check or explicit “logout everywhere” that revokes tokens.
4. **Local/dev login** — allow dashboard origin for extension login (e.g. configurable or include `http://localhost:3000`) so extension login works in development.
5. **Dead bridge** — remove or implement `ECHLY_EXTENSION_TOKEN` in the background for consistency.

---

*End of audit. No files were modified.*
