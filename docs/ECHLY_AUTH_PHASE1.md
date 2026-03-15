# Echly Auth Phase 1 — Session Cookie Support

This document describes the **Phase 1** authentication changes: adding **session cookie authentication** to the Echly backend while keeping the existing **Bearer token** system fully operational. The phase is **non-destructive**; no existing auth logic was removed.

---

## Summary

- **Cookie authentication** is now supported alongside Bearer tokens.
- **Bearer token auth** is unchanged and still supported.
- The **Echly extension** continues to use Bearer tokens; no changes were made under `echly-extension/`.

---

## What Was Added

### 1. Session login endpoint

**File:** `app/api/auth/sessionLogin/route.ts`

- **Purpose:** Exchange a Firebase ID token for a secure session cookie.
- **Flow:**
  1. Read `Authorization` header.
  2. Extract Firebase ID token (Bearer).
  3. Verify token with Firebase Admin.
  4. Create a Firebase session cookie (5-day expiry).
  5. Return success and set `__session` cookie via `Set-Cookie`.

Clients (e.g. web app) can call `POST /api/auth/sessionLogin` with a Bearer ID token and then rely on the `__session` cookie for subsequent requests.

### 2. Backend auth middleware (cookie + Bearer)

**File:** `lib/server/auth.ts`

- **`requireAuth(request)`** now supports both methods:
  1. **If `Authorization: Bearer <token>` is present** → `verifyIdToken(token)` (unchanged).
  2. **Else if `__session` cookie is present** → `verifySessionCookie(sessionCookie)`.
  3. **Else** → 401 Unauthorized.

- **Unchanged:** `verifyIdToken()` is still used for Bearer tokens and was not removed. Both auth systems work.

### 3. Logout endpoint (cookie clearing)

**File:** `app/api/auth/logout/route.ts`

- **Added:** Response always includes a `Set-Cookie` header that clears the session cookie:
  - `__session=; Max-Age=0; Path=/` (with HttpOnly, Secure, SameSite=None as appropriate).
- **Unchanged:** Existing `revokeRefreshTokens` logic for the authenticated user is kept.

---

## What Was Not Changed

- **Bearer token logic** — All `Authorization: Bearer` handling remains.
- **Refresh token logic** — Still in place (e.g. `getValidToken()`, refresh flows).
- **Echly extension** — No modifications under `echly-extension/`; the extension still uses Bearer tokens.

---

## Cookie details

- **Name:** `__session`
- **Attributes:** HttpOnly, Secure, SameSite=None, Path=/
- **Lifetime:** 5 days (Firebase session cookie expiry).
- **Cleared on:** `POST /api/auth/logout` (and optionally on client-side logout).

---

## Usage (session-based flow)

1. **Login (get cookie):**  
   `POST /api/auth/sessionLogin` with header `Authorization: Bearer <firebase-id-token>`.
2. **Authenticated requests:**  
   Send same-origin or cross-origin requests with credentials (e.g. `credentials: 'include'`) so the `__session` cookie is sent.
3. **Logout:**  
   `POST /api/auth/logout` (with cookie or Bearer token). Server revokes refresh tokens when possible and clears the `__session` cookie.

Bearer-only clients (e.g. the extension) continue to use `Authorization: Bearer <token>` and do not need to call `sessionLogin` or use cookies.
