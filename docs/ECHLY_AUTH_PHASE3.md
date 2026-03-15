# Echly Auth Phase 3 — Extension Short-Lived Tokens

This document describes the **Phase 3** authentication changes: replacing the extension’s Firebase refresh-token system with a **short-lived extension access token** issued by the backend. The dashboard cookie session is used to generate the extension token. Dashboard cookie auth was **not** modified.

---

## Summary

- The extension now uses a **short-lived JWT** (15 minutes) issued by `GET /api/auth/extensionToken`.
- **Refresh tokens are removed** from the extension; no Firebase refresh token or ID token is stored.
- Extension auth is **simplified**: token is obtained with `credentials: 'include'` (session cookie) and stored **only in memory**.
- The **token bridge** (pageTokenBridge, requestTokenFromPage, secureBridgeChannel) was **removed**; the extension no longer requests tokens from a dashboard tab.

---

## What Was Added

### 1. Extension token endpoint

**File:** `app/api/auth/extensionToken/route.ts`

- **Purpose:** Issue a short-lived access token for the extension.
- **Flow:**
  1. Verify session using `requireAuth(req)` (session cookie when called from extension with `credentials: 'include'`).
  2. Generate JWT with `uid` and `type: "extension"`, 15-minute expiry (HS256).
  3. Return `{ token }` to the extension.

**Environment variable:** `EXTENSION_TOKEN_SECRET` — required; used to sign and verify extension JWTs. Set this in your deployment (e.g. Vercel) and locally in `.env.local`.

### 2. Backend auth: extension token verification

**File:** `lib/server/auth.ts`

- **New:** `verifyExtensionToken(token)` — verifies the short-lived extension JWT using `EXTENSION_TOKEN_SECRET`.
- **Updated:** `requireAuth(request)` Bearer handling:
  1. If `Authorization: Bearer <token>` is present:
     - Try **Firebase** `verifyIdToken(token)`.
     - If that fails, try **extension token** `verifyExtensionToken(token)`.
  2. Else if `__session` cookie is present → `verifySessionCookie(sessionCookie)` (unchanged).
  3. Else → 401.

Firebase ID token verification is **not** removed; both Firebase and extension tokens are accepted as Bearer.

---

## What Changed in the Extension

### 3. Extension auth flow (background)

**File:** `echly-extension/src/background.ts`

- **Removed:** Firebase refresh-token logic:
  - `TOKEN_MAX_AGE_MS`, `FIREBASE_REFRESH_URL`, `FIREBASE_API_KEY`
  - `getStoredTokens()`, `refreshIdToken()`
  - Storage keys: `echlyIdToken`, `echlyRefreshToken`, `echlyTokenTime`
- **Added:** In-memory `extensionAccessToken` and `fetchExtensionToken()`:
  - `GET /api/auth/extensionToken` with `credentials: 'include'` (browser sends session cookie for API origin).
  - On 401/403 → open `https://echly-web.vercel.app/login?extension=true`.
  - Token stored only in memory; not persisted.
- **Updated:** `getValidToken()` now returns the in-memory extension token or fetches one via `fetchExtensionToken()`.
- **Updated:** `ECHLY_EXTENSION_AUTH_SUCCESS` handler no longer receives or stores idToken/refreshToken; it clears in-memory token and calls `fetchExtensionToken()` then validates session and opens the tray.

### 4. API proxy (echly-api)

The background script’s `echly-api` message handler already used `getValidToken()`. It now supplies the **extension token** (not a Firebase ID token) in `Authorization: Bearer <extensionToken>`.

### 5. Storage and bridge removal

- **Removed from storage:** `echlyRefreshToken`, `echlyTokenTime` (and legacy `echlyIdToken`). `clearAuthState()` still clears legacy keys for old installs.
- **Deleted files:**
  - `echly-extension/src/pageTokenBridge.js`
  - `echly-extension/pageTokenBridge.js`
  - `echly-extension/src/requestTokenFromPage.ts`
  - `echly-extension/src/secureBridgeChannel.ts`
  - `echly-extension/src/requestPageToken.ts`
- **Manifest:** `pageTokenBridge.js` removed from `web_accessible_resources`.
- **Content script:** No longer injects the token bridge; `ECHLY_GET_TOKEN_FROM_PAGE` is handled by forwarding to the background (`ECHLY_GET_TOKEN`). Login success forwarder still sends `ECHLY_EXTENSION_AUTH_SUCCESS` (no token payload); background fetches the extension token after login.

---

## 401 Handling

If the extension calls `GET /api/auth/extensionToken` and receives **401** (or 403), it opens:

```
https://echly-web.vercel.app/login?extension=true
```

The user logs in on the dashboard; after login, the page can post `ECHLY_PAGE_LOGIN_SUCCESS` and the extension will fetch the new extension token and open the tray.

---

## What Was Not Changed

- **Dashboard login** — Unchanged.
- **Cookie session logic** — Unchanged; session cookie is still set and verified as before.
- **Firebase ID token verification** — Still used for Bearer tokens that are Firebase tokens; extension tokens are verified only when Firebase verification fails.

---

## Configuration

| Variable                 | Purpose                                      |
|--------------------------|----------------------------------------------|
| `EXTENSION_TOKEN_SECRET` | Secret for signing/verifying extension JWTs. |

Set `EXTENSION_TOKEN_SECRET` in production and in `.env.local` for local development. Use a long, random value (e.g. 32+ bytes).
