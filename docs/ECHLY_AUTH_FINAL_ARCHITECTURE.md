# Echly Authentication — Final Stabilized Architecture (Loom-Style)

This document describes the **stabilized** extension authentication flow implemented to fix the broken behavior (repeated dashboard/login tabs, tray never opening). The flow is **Loom-style**: click extension → if not authenticated, open login page → after login, token is handed off to the extension → return to original tab, close login tab, open tray.

---

## 1. New Flow Diagram

```
User clicks extension icon
         │
         ▼
   ECHLY_CLICK (log)
         │
         ▼
   Check token in memory (extensionAccessToken)
         │
    ┌────┴────┐
    │         │
    ▼         ▼
 Valid     Not valid
    │         │
    │         ▼
    │    ECHLY_LOGIN_REQUIRED (log)
    │         │
    │         ▼
    │    chrome.tabs.query({ url: "*://echly-web.vercel.app/login*" })
    │         │
    │    ┌────┴────┐
    │    │         │
    │    ▼         ▼
    │  Exists   No tab
    │    │         │
    │    ▼         ▼
    │  Focus    Create tab → /login?extension=true
    │  that tab      │
    │    │         │
    │    └────┬────┘
    │         │
    │    loginTabId = tab id
    │    (user signs in on login page)
    │         │
    │         ▼
    │    Login page: Firebase sign-in
    │         │
    │         ▼
    │    window.postMessage({
    │      type: "ECHLY_EXTENSION_LOGIN_SUCCESS",
    │      idToken, refreshToken, uid, name, email
    │    }, origin)
    │         │
    │         ▼
    │    Content script (dashboard origin) receives message
    │         │
    │         ▼
    │    chrome.runtime.sendMessage(ECHLY_EXTENSION_LOGIN_SUCCESS, …)
    │         │
    ▼         ▼
 ECHLY_TOKEN_FOUND    Background receives ECHLY_EXTENSION_LOGIN_SUCCESS
    │         │
    ▼         ▼
 Toggle tray   ECHLY_LOGIN_SUCCESS (log)
 or open tray        │
    │                ▼
    │         extensionAccessToken = idToken
    │         globalUIState.user = { uid, name, email }
    │                │
    │                ▼
    │         chrome.tabs.update(originTabId, { active: true })
    │                │
    │                ▼
    │         If loginTabId and tab.url includes "/login"
    │            → chrome.tabs.remove(loginTabId)
    │         loginTabId = null
    │                │
    │                ▼
    │         ECHLY_TRAY_OPEN (log)
    │         openTray() → persistUIState(), broadcastUIState()
    │
    └────────────────────────────────────────────────────
                              │
                              ▼
                    Tray visible on current tab
```

---

## 2. Token Lifecycle

| Phase | Where | What |
|-------|--------|-----|
| **No auth** | Background | `extensionAccessToken = null`. Click → open login tab. |
| **Login** | Login page (dashboard) | User signs in with Firebase (Google or email). Page gets `user`, `idToken`, `refreshToken`. |
| **Handoff** | Login page → Content → Background | `window.postMessage(ECHLY_EXTENSION_LOGIN_SUCCESS, { idToken, refreshToken, uid, name, email })`. Content script (only on dashboard origin) forwards via `chrome.runtime.sendMessage`. |
| **Storage** | Background | `extensionAccessToken = idToken` (in memory only). `globalUIState.user` set from payload. No persistence to `chrome.storage` for the token. |
| **Usage** | All API calls | Content uses `apiFetch` → background `echly-api` handler → `getValidToken()` returns `extensionAccessToken` → `Authorization: Bearer <idToken>`. Backend `requireAuth()` accepts Firebase ID token via `verifyIdToken()`. |
| **Invalidation** | On 401/403 | Any API response 401/403 → `clearAuthState()` in background: `extensionAccessToken = null`, tray hidden, broadcast. Next click → login required again. |
| **Logout** | Dashboard | Dashboard can post `ECHLY_DASHBOARD_LOGOUT`; content forwards; background runs `clearAuthState()`. |

- **No `/api/auth/session`** — The extension does not call GET `/api/auth/session`. Validity is “we have a token in memory”; real validity is confirmed when an API returns 401/403 and we clear auth.
- **Single login tab** — Before opening login, we `chrome.tabs.query({ url: "*://echly-web.vercel.app/login*" })`. If a tab exists, we focus it; otherwise we create one. Only one login tab is used.
- **Return to origin tab** — After login success we activate `originTabId` (the tab where the user clicked the icon), close the login tab if it’s still on `/login`, then open the tray so the user lands back where they started with the tray open.

---

## 3. Changed Files

| File | Changes |
|------|--------|
| **echly-extension/src/background.ts** | (1) Click: if no token → open login tab via `openOrFocusLoginTab(loginUrl)` (no broker tab). (2) Store `originTabId` and `loginTabId`. (3) New message handler `ECHLY_EXTENSION_LOGIN_SUCCESS`: set `extensionAccessToken = idToken`, set `globalUIState.user`, switch to `originTabId`, close login tab if still on `/login`, call `openTray()`, `persistUIState()`, `broadcastUIState()`. (4) Debug logs: `ECHLY_CLICK`, `ECHLY_TOKEN_FOUND`, `ECHLY_LOGIN_REQUIRED`, `ECHLY_LOGIN_SUCCESS`, `ECHLY_TRAY_OPEN`. (5) `chrome.tabs.onRemoved`: clear `loginTabId` when that tab is removed. |
| **app/(auth)/login/page.tsx** | All postMessage after Firebase sign-in now use `type: "ECHLY_EXTENSION_LOGIN_SUCCESS"` with `idToken`, `refreshToken`, `uid`, `name`, `email` (origin: `window.location.origin`). Applied in `onAuthStateChanged`, `handleGoogle`, and `handleEmail`. |
| **echly-extension/src/content.tsx** | In `ensureBrokerAndLogoutBridge()`: added listener for `event.data?.type === "ECHLY_EXTENSION_LOGIN_SUCCESS"` (origin check: dashboard). Forwards to background via `chrome.runtime.sendMessage({ type: "ECHLY_EXTENSION_LOGIN_SUCCESS", idToken, refreshToken, uid, name, email })`. |

---

## 4. Unchanged / Still Used

- **Backend** — `lib/server/auth.ts` `requireAuth()`: accepts Bearer Firebase ID token via `verifyIdToken()`. No change; extension sends `idToken` as Bearer.
- **Extension token path** — `ECHLY_EXTENSION_TOKEN` (from extension-auth broker page) still supported: if a dashboard tab with cookie already exists, broker can send extension token; we keep that path for optional reuse. Primary path for “not logged in” is now login page → `ECHLY_EXTENSION_LOGIN_SUCCESS`.
- **Tray visibility** — `openTray()` sets `globalUIState.visible = true`, `expanded = true`, then `persistUIState()` and `broadcastUIState()` so all tabs get the tray state.
- **Legacy storage cleanup** — `clearAuthState()` still removes legacy keys (`auth_idToken`, etc.) from `chrome.storage.local`; token itself remains in-memory only.

---

## 5. Debug Logs (Labels)

| Label | When |
|-------|------|
| `ECHLY_CLICK` | User clicked the extension icon. |
| `ECHLY_TOKEN_FOUND` | In-memory token present; tray toggled or opened. |
| `ECHLY_LOGIN_REQUIRED` | No token; opening or focusing login tab. |
| `ECHLY_LOGIN_SUCCESS` | Background received `ECHLY_EXTENSION_LOGIN_SUCCESS` and stored token. |
| `ECHLY_TRAY_OPEN` | `openTray()` called (persist + broadcast). |

---

## 6. Summary

- **Click** → Check token in memory → **Valid**: open/toggle tray. **Invalid**: open or focus single login tab.
- **Login page** → After Firebase sign-in, post `ECHLY_EXTENSION_LOGIN_SUCCESS` with `idToken`, `refreshToken`, `uid`, `name`, `email`.
- **Content script** → On dashboard origin, forward that message to the background.
- **Background** → Store token in memory, switch to origin tab, close login tab, open tray, persist and broadcast UI state.
- **No `/api/auth/session`**; validity is “token in memory” and 401/403 on API calls clear auth.
- **Single login tab** enforced by querying for existing login URL and focusing before creating.
