# Echly Extension — Authentication Consistency

This document describes where the extension determines authentication state and how it stays in sync with the Echly dashboard (single source of truth: backend session).

---

## Section 1 — Where the extension decides the user is authenticated

**File:** `echly-extension/src/background.ts`

| Symbol / flow | Location | Role |
|--------------|----------|------|
| **`getAuthState()`** | ~line 256 | **Primary gate.** Reads auth from storage, obtains a valid id token (via `getValidToken()`), then calls **`validateSessionWithBackend(token)`** (GET `/api/auth/session`). If backend returns 401 or 403, clears auth and returns `authenticated: false`. Otherwise returns `authenticated: true` and `user`. |
| **`getValidToken()`** | ~line 356 | Returns a valid Firebase id token (from memory or by refreshing with `auth_refreshToken`). Used by API calls and by `getAuthState()` before validating with backend. Does **not** by itself decide “authenticated”; that is decided only after backend validation in `getAuthState()`. |
| **`tokenState`** | ~line 23 | In-memory cache: `idToken`, `refreshToken`, `expiresAtMs`, `user`. Populated from `chrome.storage.local` at startup and when tokens are refreshed. Cleared by **`clearAuthState()`** on invalid session. |
| **`validateSessionWithBackend(token)`** | ~line 242 | Calls `GET ${API_BASE}/api/auth/session` with `Authorization: Bearer <token>`. Returns `false` on 401/403 (or network error), `true` otherwise. |
| **`clearAuthState()`** | ~line 228 | Sets `tokenState` to null/empty and removes from storage: `auth_idToken`, `auth_refreshToken`, `auth_expiresAtMs`, `auth_user`. |
| **Extension icon click** | `chrome.action.onClicked` ~line 405 | Calls **`getAuthState()`**. If `!authenticated`, opens login page with `returnUrl`; otherwise toggles tray. |
| **`ECHLY_GET_AUTH_STATE` message** | message listener | Calls **`getAuthState()`** and sends back `{ authenticated, user }`. |
| **Storage keys** | — | Auth is persisted in `chrome.storage.local`: `auth_idToken`, `auth_refreshToken`, `auth_expiresAtMs`, `auth_user`. All cleared when session is invalid (401/403). |

**Summary:** The extension treats the user as authenticated only when **`getAuthState()`** returns `authenticated: true`, which happens only after a successful **backend session check** (GET `/api/auth/session`). Stored tokens alone are not enough; invalid sessions (e.g. after dashboard logout) cause auth to be cleared and `authenticated: false` to be returned.

---

## Section 6 — Verification (test flow)

Use this flow to confirm dashboard logout invalidates the extension and that re-login works.

1. **Log in normally**  
   - Sign in via the extension or dashboard.  
   - **Expected:** Extension works (tray, capture, API calls succeed).

2. **Log out from Echly dashboard**  
   - In the dashboard, log out.  
   - Leave the extension open (do not close the browser).

3. **Click extension icon**  
   - **Expected:** Extension treats the user as not authenticated (invalid token detected via backend or cached 401/403), opens the login page (e.g. `https://echly-web.vercel.app/login?extension=true&returnUrl=...`).

4. **Log in again**  
   - Complete login (e.g. on the opened login page).  
   - **Expected:** Redirected back to the original page (if `returnUrl` was set), extension works again (session validated with backend).

---

## When session is validated / cleared

- **Extension icon click** — `getAuthState()` runs and validates with backend; if invalid, auth is cleared and login page opens.
- **Background init** — After loading tokens from storage, if a refresh token exists, a token is obtained and validated with backend; if invalid, auth is cleared.
- **API requests** — Any response with status **401** or **403** triggers **`clearAuthState()`** (e.g. `echly-api` proxy, SET_ACTIVE_SESSION feedback/sessions fetch, upload-screenshot, structure-feedback, create feedback). Subsequent icon click or `getAuthState()` will then return not authenticated and can open the login page.

No backend auth logic or Firebase config was changed; only extension-side checks and clearing behavior were updated.
