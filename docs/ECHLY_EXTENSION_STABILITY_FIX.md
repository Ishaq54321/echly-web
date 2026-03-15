# Echly Extension Stability Fix — Summary Report

**Date:** 2025-03-15  
**Scope:** Runtime stability fixes from extension audit. Authentication architecture unchanged.

---

## Fixes Implemented

### FIX 1 — Session cache TTL (5 minutes)

**File:** `echly-extension/src/background.ts`

- **Change:** `SESSION_CACHE_TTL_MS` increased from 30 seconds to 5 minutes.
- **Code:** `const SESSION_CACHE_TTL_MS = 5 * 60 * 1000`
- **Effect:** Fewer backend validations on repeated extension clicks; tray can open from cache for 5 minutes after last validation.

---

### FIX 2 — Clear auth only on 401/403

**File:** `echly-extension/src/background.ts`

- **Change:** `clearAuthState()` is now called only when the API response status is `401` or `403`.
- **Replaced:** All `catch { clearAuthState(); ... }` (and similar) with logging and no auth clear:  
  `console.warn("[ECHLY AUTH] transient error, not clearing auth")` (and appropriate continuation).
- **Locations updated:**
  - `initializeSessionState()` — feedback fetch catch
  - `checkBackendSession()` — getValidToken catch (return `{ authenticated: false }` only); fetch catch
  - `validateSessionAndOpenTray()` — getValidToken catch; fetch catch
  - Auth success message handler catch
  - `ECHLY_SET_ACTIVE_SESSION` catch
  - `ECHLY_UPLOAD_SCREENSHOT` catch
  - `ECHLY_PROCESS_FEEDBACK` catch
  - `ECHLY_GET_TOKEN` catch
- **Effect:** Network errors and other transient failures no longer log the user out; auth is cleared only on explicit 401/403.

---

### FIX 3 — Click responsiveness (instant tray when cache valid)

**File:** `echly-extension/src/background.ts`

- **Behavior (unchanged logic, verified):** When `sessionCache.authenticated === true` and cache is within TTL (`Date.now() - sessionCache.checkedAt < SESSION_CACHE_TTL_MS`), the `chrome.action.onClicked` handler:
  - Sets tray visible/expanded, persists UI state, broadcasts, and **returns immediately**.
  - Does **not** call `checkBackendSession()`.
- **Effect:** With FIX 1’s 5-minute TTL, valid cache path opens the tray instantly without a backend round-trip.

---

### FIX 4 — Dynamic APP_ORIGIN in content

**File:** `echly-extension/src/content.tsx`

- **Change:** Replaced hardcoded `APP_ORIGIN = "http://localhost:3000"` with:
  - Development: `http://localhost:3000`
  - Production: `https://echly-web.vercel.app`
- **Logic:** `process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://echly-web.vercel.app"`
- **Effect:** Dashboard links (e.g. after “End feedback”) open the correct origin in production.

---

### FIX 5 — Content script API base aligned with background

**File:** `echly-extension/src/contentAuthFetch.ts`

- **Change:** `API_BASE` now uses the same environment logic as `background.ts`: development → `http://localhost:3000`, otherwise → `https://echly-web.vercel.app`.
- **Effect:** Content-script API calls target the same backend as the background script in both dev and production.

---

### FIX 6 — Broadcast retry for active tab

**File:** `echly-extension/src/background.ts`

- **Change:** In `broadcastUIState()`, when `sendMessage` to the **active tab** fails (e.g. content script not ready), the code retries **once** after 50 ms.
- **Effect:** Tray state is more likely to appear on the current tab when the content script loads slightly after the broadcast.

---

## Expected Behavior After Fix

### Extension click

1. User clicks extension icon.
2. **If session cache is valid** (authenticated and within 5 minutes): tray opens **instantly**; no backend call.
3. **Else:** backend session is validated; on success tray opens, on failure login tab opens.

### Session end

1. User ends feedback/session.
2. Dashboard opens: `https://echly-web.vercel.app/dashboard/<sessionId>` (production) or localhost (development).
3. User remains logged in; auth is not cleared on transient/network errors.

### Auth state

- Auth is cleared **only** when the backend returns **401** or **403**.
- Network errors, timeouts, and other transient failures no longer trigger logout.

---

## Files Touched

| File | Changes |
|------|--------|
| `echly-extension/src/background.ts` | FIX 1, 2, 3 (verify), 6 |
| `echly-extension/src/content.tsx` | FIX 4 |
| `echly-extension/src/contentAuthFetch.ts` | FIX 5 |
| `docs/ECHLY_EXTENSION_STABILITY_FIX.md` | This report |

No changes were made to authentication flow, token storage, or login UX; only stability and environment behavior were adjusted as above.
