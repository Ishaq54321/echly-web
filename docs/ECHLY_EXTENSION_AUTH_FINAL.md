# Echly Extension Auth — Dashboard Tab Broker (Final Architecture)

This document describes the **dashboard tab broker** architecture used for extension authentication. Token requests are routed through a **persistent dashboard tab** that holds the session cookie, mirroring patterns used by products like Loom.

---

## Why a Dashboard Tab?

- The extension **background (service worker)** cannot read HTTP-only session cookies.
- Only a page on the **dashboard origin** (`https://echly-web.vercel.app`) has access to the session cookie.
- So we use a **dashboard tab** as a broker: the background asks that tab for a token; the tab’s content script runs in page context and can call the app’s token endpoint (with the cookie) and return the token to the background.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│  User clicks extension icon on any page (e.g. google.com)               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Background (service worker)                                             │
│  • Opens tray immediately (no redirect)                                  │
│  • Needs token for API calls                                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  ensureDashboardTab()                                                    │
│  • If dashboardTabId cached and tab still exists → use it                │
│  • Else find existing tab with url starting with echly-web.vercel.app    │
│  • Else create new tab: echly-web.vercel.app/dashboard (active: false)  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  fetchExtensionTokenFromDashboard()                                     │
│  • chrome.tabs.sendMessage(dashboardTabId, { type: "ECHLY_REQUEST_..." })│
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │  Dashboard tab only           │  Other tabs
                    │  Content script handles       │  Content script
                    │  ECHLY_REQUEST_EXTENSION_     │  responds
                    │  TOKEN → requestExtension     │  { token: null }
                    │  TokenFromPage() → cookie     │  → NOT_AUTHENTICATED
                    │  → returns { token, uid }    │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  getValidToken()                                                         │
│  • If in-memory extensionAccessToken → return it                         │
│  • Else token from dashboard tab → cache and return                      │
│  • If no token → throw NOT_AUTHENTICATED                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
          ▼                         ▼                         ▼
   API calls (sessions,     Tray shows user state      If NOT_AUTHENTICATED
   feedback, upload, etc.)  from token/uid             → open login tab (only then)
```

---

## Components

### Background (`echly-extension/src/background.ts`)

| Item | Role |
|------|------|
| `dashboardTabId` | Cached tab ID of the dashboard broker tab. Cleared when the tab is closed (`chrome.tabs.onRemoved`). |
| `findDashboardTab()` | Queries all tabs; finds one whose URL starts with `https://echly-web.vercel.app`; sets `dashboardTabId` and returns it, or `null`. |
| `ensureDashboardTab()` | Uses cached `dashboardTabId` if the tab still exists; else finds or creates a dashboard tab. Creates with `active: false` so the user is not redirected. Prevents multiple dashboard tabs. |
| `fetchExtensionTokenFromDashboard()` | Calls `ensureDashboardTab()`, then `chrome.tabs.sendMessage(tab.id, { type: "ECHLY_REQUEST_EXTENSION_TOKEN" })`. If `response.token` is missing, throws `NOT_AUTHENTICATED` (no redirect here). |
| `getValidToken()` | Returns cached `extensionAccessToken` or fetches via `fetchExtensionTokenFromDashboard()`, caches, and returns. Throws `NOT_AUTHENTICATED` if unauthenticated. |

### Content script (`echly-extension/src/content.tsx`)

- Listens for `ECHLY_REQUEST_EXTENSION_TOKEN`.
- **Only on dashboard origin** (`location.origin.includes("echly-web.vercel.app")`): calls `requestExtensionTokenFromPage()` (page context → token endpoint with cookie) and responds with `{ token, uid }`.
- On any other origin: responds with `{ token: null }` so the background receives no token and treats the user as not authenticated.

This ensures only the dashboard tab can supply a token; other tabs cannot.

---

## Tray flow (Step 8)

1. User **clicks extension** → tray opens immediately (no redirect).
2. Background **gets token via dashboard tab** (`getValidToken()` → `fetchExtensionTokenFromDashboard()`).
3. If token is returned → **API calls work** (sessions, feedback, etc.).
4. If token request fails (e.g. no dashboard session) → **then** open login tab (e.g. `openOrFocusLoginTab` in the icon click handler when `getValidToken()` throws).

So we **do not** redirect to the dashboard unless the token request indicates the user is not authenticated (e.g. 401 / NOT_AUTHENTICATED).

---

## Preventing multiple dashboard tabs

- Before creating a new tab, `ensureDashboardTab()`:
  1. If `dashboardTabId` is set, tries `chrome.tabs.get(dashboardTabId)`; if the tab exists, returns it.
  2. Otherwise calls `findDashboardTab()` to reuse any existing dashboard tab.
  3. Only if none exists creates a new tab and sets `dashboardTabId`.
- When a tab is removed, `chrome.tabs.onRemoved` clears `dashboardTabId` if the closed tab was the dashboard tab.

---

## Summary

- **Token source**: Always the **dashboard tab** (persistent broker with session cookie).
- **User flow**: Click extension → tray opens → background gets token from dashboard tab → API works; redirect to login only when token request returns not authenticated.
- **Single dashboard tab**: Cached by ID, reused when possible; new tab only when necessary, opened in the background (`active: false`).

This matches the intended Loom-style behavior: one broker tab, no redirect until auth is required.
