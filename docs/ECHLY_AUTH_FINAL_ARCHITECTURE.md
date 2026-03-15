# Echly Authentication — Final Architecture

This document describes the production authentication system after cleanup of legacy Firebase token storage and session checks. Behavior is unchanged; obsolete code has been removed.

---

## 1. Overview

| Client | Auth mechanism | Backend verification |
|--------|----------------|----------------------|
| **Dashboard** | Session cookie (`__session`) | `requireAuth(req)` — cookie or Bearer |
| **Extension** | Short-lived extension token | `requireAuth(req)` — Bearer (extension or Firebase ID token) |
| **Backend** | Hybrid: cookie first, then Bearer (Firebase or extension JWT) | `lib/server/auth.ts` |
| **Public API** | API key (where applicable) | Per-route |

---

## 2. Dashboard → Cookie Auth

- User signs in on the dashboard (e.g. Firebase Auth).
- Backend sets a **session cookie** (`__session`) via Firebase Admin `createSessionCookie()` (or equivalent).
- All dashboard requests use **credentials: 'include'** so the cookie is sent.
- **`requireAuth(request)`** in `lib/server/auth.ts` reads the cookie via `cookies().get('__session')` and verifies it with `getAdminAuth().verifySessionCookie()`.
- No Bearer token is required for the dashboard when the cookie is present.

---

## 3. Extension → Extension Token

- The extension **does not store** Firebase ID or refresh tokens. No `echlyIdToken`, `echlyRefreshToken`, or `echlyTokenTime`.
- When the extension needs to call the API, it obtains a **short-lived extension token** from the backend:
  - **GET /api/auth/extensionToken** with **credentials: 'include'** (so the browser sends the dashboard session cookie for the API origin).
  - The backend requires a valid session (cookie) and issues a signed JWT with `uid` and `type: "extension"` (e.g. 15-minute expiry).
  - Response: `{ token, uid }`.
- The extension keeps the token **in memory only** (`extensionAccessToken`). No persistence.
- All extension API calls use **Authorization: Bearer &lt;extension token&gt;**.
- **If GET /api/auth/extensionToken returns 401**, the extension clears auth state and opens the login page.

**Extension click flow (simplified):**

1. User clicks extension icon.
2. Tray opens **immediately** (no background auth validation).
3. Extension calls GET /api/auth/extensionToken (or uses cached in-memory token for other API calls).
4. If 401 → clear auth, open login page.

No pre-warm or session cache; no `/api/auth/session` usage.

---

## 4. Backend → Hybrid Verification

**File:** `lib/server/auth.ts`

- **`requireAuth(request)`** (used by protected API routes):
  1. If **Authorization: Bearer &lt;token&gt;** is present:
     - Tries **Firebase ID token** via `verifyIdToken(token)` (Firebase Admin, revocation check).
     - If that fails, tries **extension JWT** via `verifyExtensionToken(token)` (signed with `EXTENSION_TOKEN_SECRET`).
  2. If no Bearer token, reads **session cookie** `__session` and verifies with `verifySessionCookie()`.
  3. If none valid → 401.

- **`verifyIdToken(token)`** — Firebase Admin; remains for integrations and admin tools.
- **`requireAuth(req)`** — used by dashboard (cookie) and extension (Bearer extension token) and any Firebase Bearer callers.

---

## 5. Public API → API Key

Where the product exposes a public or partner API, authentication is via **API key** (or other scheme) as defined per route. Not covered in this doc; no change in this cleanup.

---

## 6. What Was Removed (No Behavior Change)

- **Extension:** References to `echlyIdToken`, `echlyRefreshToken`, `echlyTokenTime`; functions `getStoredTokens()`, `refreshIdToken()`; constants `TOKEN_MAX_AGE_MS`, `FIREBASE_REFRESH_URL`, `FIREBASE_API_KEY` (already absent).
- **Extension:** All use of **GET /api/auth/session** and **checkBackendSession()** / **validateSessionWithBackend()**. Replaced with **GET /api/auth/extensionToken**; 401 → redirect to login.
- **Extension:** Login bridge events **ECHLY_PAGE_LOGIN_SUCCESS**, **ECHLY_EXTENSION_AUTH_SUCCESS** and their handlers; token bridge files (pageTokenBridge, requestTokenFromPage, secureBridgeChannel — already removed).
- **Extension:** Background auth validation and session cache; click flow is now: open tray → API call with extension token → if 401 open login.

---

## 7. What Remains (Unchanged)

- **`verifyIdToken()`** and **`requireAuth()`** in `lib/server/auth.ts` — still used for dashboard cookie, extension token, and Firebase Bearer.
- **GET /api/auth/session** — still exists for any non-extension caller that wants session info with a Bearer token; extension no longer calls it.
- **POST /api/auth/logout** and refresh token revocation — unchanged; extension learns about logout via 401 when using an invalid or revoked token.

---

## 8. Summary

- **Dashboard:** Cookie-based auth; `requireAuth` uses session cookie.
- **Extension:** Short-lived extension token from GET /api/auth/extensionToken (cookie-backed); in-memory only; 401 → login.
- **Backend:** Hybrid verification (cookie, Firebase ID token, extension JWT) in `requireAuth()`.
- **Public API:** API key or per-route scheme.

Legacy token storage and session-check paths have been removed from the extension; the final architecture is as above.
