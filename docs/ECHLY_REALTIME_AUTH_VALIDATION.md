# Echly Extension: Realtime Auth Validation (Loom-Style)

This document describes the background session validation behavior added to the Echly extension so that the tray can open instantly from cache while the session is revalidated in the background, matching Loom-style UX.

## Goal

- **Instant open**: When the user clicks the extension icon and the in-memory session cache says they are authenticated and within TTL, the tray opens immediately—no waiting on a network request.
- **Background revalidation**: After opening from cache, the extension still calls the backend to verify the session. If the session is invalid (e.g. user logged out on the dashboard), the UI is corrected: tray is closed, auth state is cleared, and the login page is opened.

Login architecture and token storage are unchanged; only the **click path** and **cache update** behavior were modified.

## Where It Happens

**File:** `echly-extension/src/background.ts`  
**Handler:** `chrome.action.onClicked`

When the condition below is true, we no longer only toggle the tray and return; we also run a background validation.

**Condition:**  
`sessionCache.authenticated === true && Date.now() - sessionCache.checkedAt < SESSION_CACHE_TTL_MS`

So: “cache says authenticated and last check was within the cache TTL (e.g. 5 minutes).”

## Behavior

### 1. Instant tray open (unchanged UX)

- Tray visibility is toggled as before (open if closed, close if open).
- `persistUIState()` and `broadcastUIState()` run so the UI state is persisted and sent to content scripts.
- The handler **returns immediately** so the user sees the tray open/close right away.

### 2. Background validation

- **Without blocking:** `checkBackendSession()` is called (GET `/api/auth/session` with the current token). It runs in the background; the handler does not await it.
- **When the promise resolves:**
  - **Cache update (Step 2):**  
    `sessionCache = { authenticated: session.authenticated, checkedAt: Date.now() }`  
    This keeps the in-memory cache in sync with the backend result and refreshes `checkedAt` so future clicks can still use the cache when valid.
  - **If `session.authenticated` is false:**
    - `clearAuthState()` is called (tokens and session cache cleared, tray closed, state persisted and broadcast).
    - Tray is explicitly closed again and state persisted/broadcast (idempotent with `clearAuthState()`).
    - Login page is opened via `openOrFocusLoginTab(ECHLY_LOGIN_BASE + "?extension=true")`.
- **On rejection:**  
  `.catch(() => { console.warn("[ECHLY AUTH] background validation failed"); })`  
  No change to UI or auth state on transient failure; cache is left as-is so the user can retry.

## Expected User Flows

- **User is logged in**  
  - Click extension → tray opens instantly (from cache).  
  - Background check confirms session → cache is updated with new `checkedAt`; no UI change.

- **User has logged out on the dashboard (or session invalidated)**  
  - Click extension → tray still opens instantly (cache was still “authenticated” within TTL).  
  - Background check returns not authenticated → cache updated to `authenticated: false`, `clearAuthState()` runs, tray closes, login page opens.

So the tray always opens immediately when the cache says authenticated; the backend only corrects the UI when the session is actually invalid.

## Summary

- **Instant open:** Tray open/close is driven by cache and happens synchronously on click; no change to that UX.
- **Revalidation:** `checkBackendSession()` runs after opening so the backend remains the source of truth.
- **Cache accuracy:** `sessionCache` is updated from the result of `checkBackendSession()` so the next click uses an up-to-date cache.
- **Correction when invalid:** If the session is invalid, auth is cleared, tray is closed, and the user is sent to the login page—matching Loom-style behavior without changing login or token storage.
