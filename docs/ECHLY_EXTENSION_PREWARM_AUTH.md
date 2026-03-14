# Echly Extension — Session Pre-warm (Auth Cache)

This document describes the **session pre-warming** optimization that makes the extension tray open instantly on icon click (Loom-like UX), without changing the authentication model or making the extension stateful.

## Why pre-warming improves UX

**Previous flow (300–500 ms delay):**

1. User clicks extension icon  
2. Background requests token from dashboard page (postMessage)  
3. Background calls `GET /api/auth/session` with Bearer token  
4. Tray opens after response  

Users perceived a noticeable delay before the tray appeared.

**With pre-warming:**

- The background **pre-validates** the session when:
  - The extension starts (`chrome.runtime.onStartup`)
  - The extension is installed/updated (`chrome.runtime.onInstalled`)
  - A dashboard tab finishes loading (`chrome.tabs.onUpdated`, URL origin in `DASHBOARD_ORIGINS`)
- On icon click, if the **in-memory session cache** is valid (see below), the tray opens **immediately** without a token request or API call.
- If the cache is cold or expired, the normal flow runs and the cache is updated.

Result: when the user has the dashboard open (or recently had it), the first click feels instant.

## How the session cache works

- **Storage:** In-memory only. No `chrome.storage` or other persistence. The cache is lost when the service worker is shut down.
- **Shape:**
  - `authenticated: boolean` — whether the last prewarm/validation saw a successful `/api/auth/session` response.
  - `checkedAt: number` — timestamp (ms) of that check.
- **We do not store tokens.** The extension remains stateless: the token is still obtained from the dashboard page when an API call actually needs it.

## TTL logic

- **TTL:** 30 seconds (`SESSION_CACHE_TTL_MS`).
- On **extension icon click:**
  - If `sessionCache.authenticated === true` **and** `(Date.now() - sessionCache.checkedAt) < 30_000` → treat as valid; open tray immediately (skip token request and `/api/auth/session`).
  - Otherwise → run full validation (`getTokenFromPage()` + `/api/auth/session`), then set `sessionCache` from the result and open tray or login as appropriate.

So the cache is a short-lived hint to skip validation for a quick open; it is not a substitute for real auth on the first API call.

## Fallback behavior

- **401/403 on any API call:** The existing handlers (e.g. `ECHLY_SET_ACTIVE_SESSION`, `ECHLY_PROCESS_FEEDBACK`, `echly-api`, etc.) already call `clearAuthState()`. `clearAuthState()` now also **clears the session cache** (`sessionCache = { authenticated: false, checkedAt: 0 }`).
- So when the backend returns 401 (e.g. token expired or revoked):
  - Session cache is cleared.
  - Legacy auth keys (if any) are removed from storage.
  - The next time the user clicks the icon, the cache is invalid, so full validation runs, and the user is sent to the login flow if not authenticated.

No tokens are stored; the extension stays stateless. Pre-warming is a **performance optimization** only.

## Prewarm triggers (summary)

| Trigger | When | Purpose |
|--------|------|--------|
| `chrome.runtime.onStartup` | Browser start | Session ready soon after launch if user had dashboard open before. |
| `chrome.runtime.onInstalled` | Install/update | Session ready when user opens dashboard after install. |
| `chrome.tabs.onUpdated` (status === `"complete"`, URL in `DASHBOARD_ORIGINS`) | Dashboard tab load | Keeps session warm while user has dashboard open. |

## Implementation notes

- **File:** `echly-extension/src/background.ts`
- **Cache:** `sessionCache` (in-memory), `SESSION_CACHE_TTL_MS = 30_000`
- **Prewarm:** `prewarmAuthSession()` — finds a dashboard tab, calls `getTokenFromPage()`, then `GET /api/auth/session`, and updates `sessionCache`
- **Clear:** `clearSessionCache()` is used by `clearAuthState()`, so any 401/403 path clears the cache
