# Echly Auth Phase 2 — Dashboard Session Cookie Migration

This document describes the **Phase 2** authentication changes: migrating the **dashboard frontend** from Bearer-token authentication to **session cookie authentication**, using the backend capability added in Phase 1. The **Echly extension** remains unchanged and continues to use Bearer tokens.

---

## Summary

- **Dashboard** now uses **session cookie authentication** for API calls.
- **Extension** still uses **Bearer tokens**; no changes were made under `echly-extension/`.
- **Backend** supports both systems (Phase 1): cookie auth and Bearer auth.

---

## What Changed (Dashboard Only)

### 1. Login flow

**File:** `app/(auth)/login/page.tsx`

- After Firebase login success (Google or email/password), the dashboard now:
  1. Gets the Firebase ID token: `user.getIdToken()`.
  2. Calls `POST /api/auth/sessionLogin` with `Authorization: Bearer <idToken>` and `credentials: "include"`.
  3. The backend sets the `__session` cookie.
  4. Redirects to dashboard or onboarding (unchanged).

- **Extension flow unchanged:** When `?extension=true`, the page still posts `ECHLY_PAGE_LOGIN_SUCCESS` with `idToken` and `refreshToken`, then redirects to `/dashboard`. No session cookie is required for the extension.

### 2. authFetch (cookie-based)

**File:** `lib/authFetch.ts`

- **Before:** Used `getCachedIdToken(user)` and sent `Authorization: Bearer <token>` on every request.
- **After:** Sends requests with `credentials: "include"` only; no Bearer header. The `__session` cookie is sent automatically by the browser.

- Removed from dashboard usage: `getCachedIdToken`, `getIdTokenResult`, token cache (`cachedToken`, `tokenExpiry`), and `clearAuthTokenCache`. The function name `authFetch` is unchanged so all existing call sites continue to work.

- Timeout behavior, `resolveInput` (for `__ECHLY_API_BASE__`), and 403 `WORKSPACE_SUSPENDED` handling are preserved.

### 3. Dashboard API calls

- All dashboard API calls already used `authFetch`; no direct `fetch("/api/...")` needed to be replaced for protected endpoints.
- **Exceptions (remain normal fetch):** `/api/auth/sessionLogin` and `/api/auth/logout` are called with plain `fetch` (sessionLogin with Bearer for the one-time exchange; logout with `credentials: "include"` only).

### 4. Logout flow

**File:** `components/layout/ProfileCommandPanel.tsx`

- **Before:** Logout called `POST /api/auth/logout` with `Authorization: Bearer <token>`.
- **After:** Logout calls `POST /api/auth/logout` with `credentials: "include"` only. No Bearer token required; the server clears the session cookie from the response.

- Firebase `signOut(auth)` is still called after the API request.

### 5. Token utilities removed (dashboard only)

- **Removed from `lib/authFetch.ts`:** `getCachedIdToken`, `getIdTokenResult`, `cachedToken`, `tokenExpiry`, and `clearAuthTokenCache`.
- **Removed from dashboard code:** All usages of `clearAuthTokenCache()` in:
  - `app/(app)/dashboard/hooks/useWorkspaceOverview.ts`
  - `app/(app)/folders/[folderId]/page.tsx`
  - `lib/hooks/useAuthGuard.ts`
  - `app/(app)/dashboard/sessions/page.tsx`

- Firebase login and `auth.currentUser` are still used for **identity and client-side auth state** (e.g. redirect when not logged in). Only the **API authentication** for the dashboard switched to cookies.

---

## What Was Not Changed

- **Echly extension** — No modifications under `echly-extension/`; extension still uses Bearer tokens and its own token storage.
- **Backend** — `requireAuth()` and `verifyIdToken()` are unchanged; both cookie and Bearer auth are supported.
- **Extension token storage** — Not modified.

Phase 2 affects the **dashboard only**.

---

## Current Auth Model

| Client        | API auth method        | Login flow                                                                 |
|---------------|------------------------|----------------------------------------------------------------------------|
| **Dashboard** | Session cookie         | Firebase login → `POST /api/auth/sessionLogin` (Bearer once) → cookie set |
| **Extension** | Bearer token           | Firebase login → tokens via postMessage → Bearer on each API request     |

The backend accepts either the `__session` cookie or `Authorization: Bearer <token>` on protected routes.
