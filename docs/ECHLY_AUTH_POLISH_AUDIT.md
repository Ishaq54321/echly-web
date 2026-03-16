# Echly Phase-4 Auth Polishing — Audit Report

**Date:** 2025-03-16  
**Scope:** Extension authentication flow polish only. No changes to extension token system, `/extension-auth` broker architecture, backend auth verification, or cookie session system.

---

## 1. Session verification flow

- **Purpose:** Ensure the extension does not trust a cached extension token when the dashboard (cookie) session is no longer valid.
- **Implementation:**
  - **`verifyDashboardSession()`** (in `echly-extension/src/background.ts`):
    - Sends `POST ${API_BASE}/api/extension/session` with `credentials: "include"` (cookies only; no Bearer token).
    - Returns `true` if response is not 401; returns `false` on 401 or any error.
    - Used on extension icon click and inside `getValidToken()` before returning a cached token.
- **Backend:** `POST /api/extension/session` uses `getSessionUser(request)` (cookie). If no valid session → 401. No change to this route.

---

## 2. Extension click flow

```
User clicks extension icon
        │
        ▼
chrome.action.onClicked
        │
        ▼
Store lastUserTabId (active tab)
        │
        ▼
verifyDashboardSession()  ──► POST /api/extension/session (credentials: include)
        │
        ├── 401 or error (session invalid)
        │       │
        │       ▼
        │   Clear: extensionToken, extensionTokenExpiresAt, sw.currentUser, setExtensionToken(null)
        │       │
        │       ▼
        │   if (authTabOpen) return
        │       │
        │       ▼
        │   authTabOpen = true
        │       │
        │       ▼
        │   chrome.tabs.create({ url: EXTENSION_AUTH_URL })
        │       │
        │       ▼
        │   return (widget not opened)
        │
        └── 200 (session valid)
                │
                ▼
            openWidgetInActiveTab()  → widget opens instantly
```

- **Result:** If the user is logged in (valid dashboard session), the widget opens immediately without opening any tab. If the user is logged out, they are sent to `/extension-auth` (then login if needed); no widget is shown until auth is valid.

---

## 3. Logout handling flow (global 401)

When any API request (via `apiFetch`) receives **401**:

1. **In `echly-extension/utils/apiFetch.ts`:**
   - Log: `[ECHLY] Auth invalid — clearing extension state`
   - Clear in-module token: `extensionToken = null`, `setExtensionToken(null)`
   - Send message: `chrome.runtime.sendMessage({ type: "ECHLY_AUTH_INVALID" })`
   - Throw `NOT_AUTHENTICATED` so callers can handle failure

2. **In `echly-extension/src/background.ts` (handler for `ECHLY_AUTH_INVALID`):**
   - Clear: `extensionToken`, `extensionTokenExpiresAt`, `sw.extensionToken`, `sw.currentUser`, `cachedSessionUser`
   - Call `setExtensionToken(null)` so `apiFetch` module state stays in sync

- **Result:** User logs out in dashboard → next extension API request gets 401 → extension clears all auth state; subsequent actions require going through `/extension-auth` again.

---

## 4. Token lifecycle diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        EXTENSION TOKEN LIFECYCLE                             │
└─────────────────────────────────────────────────────────────────────────────┘

  [Dashboard session valid]          [Dashboard session invalid]
  (cookie present, POST /api/extension/session → 200)
  (cookie missing/expired → 401)

        │                                      │
        │                                      │
        ▼                                      ▼
  ┌──────────────┐                    ┌──────────────┐
  │ Icon click   │                    │ Icon click   │
  │ verifyDashboardSession() → true   │ verifyDashboardSession() → false       │
  └──────┬───────┘                    └──────┬───────┘
         │                                    │
         ▼                                    ▼
  openWidgetInActiveTab()             Clear token + user state
  (widget opens instantly)            Open /extension-auth tab
         │                                    │
         ▼                                    ▼
  Widget may call getValidToken()     User logs in → /extension-auth
         │                            POST /api/extension/session
         ▼                            → token via postMessage
  ┌──────────────────────┐                    │
  │ getValidToken()      │                    ▼
  │ Has cached token?    │            ECHLY_EXTENSION_TOKEN received
  │   Yes → verifyDashboardSession()  → Store token, authTabOpen = false
  │     Invalid → clear cache,        → Close broker tab
  │               getExtensionToken() │
  │     Valid → return token          │
  │   No → getExtensionToken()        │
  │         (broker if needed)        │
  └──────────┬───────────┘            │
         │                            │
         ▼                            ▼
  apiFetch(url, options)        Next getValidToken() returns token
  Bearer <extensionToken>        Widget/API works
         │
         ▼
  Response 401? ──Yes──► ECHLY_AUTH_INVALID
         │              Clear all token/user state
         No             Next action requires re-auth
         │
         ▼
  Return response to caller
```

---

## 5. Prevent multiple auth tabs

- **State:** `authTabOpen` (boolean) in `background.ts`.
- **When opening broker from icon click (session invalid):**
  - If `authTabOpen === true` → return immediately (do not open another tab).
  - Else set `authTabOpen = true`, then `chrome.tabs.create({ url: EXTENSION_AUTH_URL })`.
- **When opening broker from `getExtensionToken()`:**
  - If `authTabOpen && brokerPromise != null` → return existing `brokerPromise` (no new tab).
  - Else set `authTabOpen = true` and create broker tab.
- **When token is received:** In `ECHLY_EXTENSION_TOKEN` handler, set `authTabOpen = false` (and clear broker tab).
- **When broker tab is closed without token:** In `chrome.tabs.onRemoved`, if removed tab is `authBrokerTabId`, set `authTabOpen = false` and reject pending promise.

Result: Only one `/extension-auth` tab can be opened at a time from the extension.

---

## 6. Expected behavior (verification checklist)

| Test | Expected result |
|------|------------------|
| **TEST 1** User logged in, clicks extension | Widget opens instantly (session verified, no auth tab). |
| **TEST 2** User logged out from dashboard, clicks extension | `/extension-auth` opens; user is redirected to login. |
| **TEST 3** User logs out while extension is open; next API request | Request gets 401 → extension clears auth → next action requires login. |
| **TEST 4** Extension on page load | Extension does **not** open localhost tabs automatically on page load (no new behavior added for page load). |

---

## 7. Files changed (summary)

| File | Changes |
|------|--------|
| `echly-extension/src/background.ts` | Added `verifyDashboardSession()`; icon click runs session check and either opens widget or opens broker (with `authTabOpen` guard); `getValidToken()` validates session before returning cached token; `ECHLY_AUTH_INVALID` also clears `cachedSessionUser`. |
| `echly-extension/utils/apiFetch.ts` | 401 handler logs `[ECHLY] Auth invalid — clearing extension state` and sends `ECHLY_AUTH_INVALID` (unchanged behavior, clarified log). |

No changes to: extension token storage/format, `/extension-auth` broker flow, backend auth or session routes, or cookie session system.
