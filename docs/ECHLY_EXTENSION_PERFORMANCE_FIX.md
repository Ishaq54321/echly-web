# Echly Extension Performance & UX Fix

This document describes the controlled architecture fix applied to the Echly Chrome extension to improve speed, eliminate login loops and race conditions, and standardize tray and home behavior. **No backend authentication logic was changed;** only extension behavior and login-page redirect timing were modified.

---

## 1. Instant Launch Architecture

**Goal:** The tray appears immediately when the user clicks the extension icon, instead of waiting for authentication.

**Changes (background):**

- **`chrome.action.onClicked`** no longer waits for `checkBackendSession()` before showing the UI.
- **New flow:**
  1. Set `globalUIState.visible = true` and `globalUIState.expanded = true`.
  2. Persist and broadcast UI state so the tray opens right away.
  3. Call `validateSessionInBackground(tab)` **after** the tray is visible (non-blocking).
- **`validateSessionInBackground(tab)`:** Runs after the tray is shown. If the session is not authenticated (and not served from cache), it opens the login tab with `returnUrl`. The tray remains visible while this runs.

**Result:** Clicking the icon opens the tray instantly; session validation and optional login tab happen in the background.

---

## 2. Session Cache Usage

**Goal:** Avoid unnecessary token/session checks so the tray stays responsive.

**Changes (background):**

- Before running a full `checkBackendSession()` in `validateSessionInBackground`, the code checks the in-memory **session cache**:
  - If `sessionCache.authenticated` is true and `Date.now() - sessionCache.checkedAt < SESSION_CACHE_TTL_MS` (30s), the function returns immediately and does not hit the backend or request a token from the page.
- The cache is updated when:
  - `validateSessionInBackground` actually runs a session check.
  - `refreshExtensionAuth()` runs (e.g. after login complete message).
  - Any path that calls `checkBackendSession()` and then sets `sessionCache`.

**Result:** Repeated icon clicks or rapid open/close within the TTL do not trigger redundant token or session checks.

---

## 3. Login Race Condition Prevention

**Goal:** Ensure the extension has time to retrieve the token after login before the login page redirects away.

**Changes (login page):**

- For extension flow (`isExtension && returnUrl`):
  1. Send `ECHLY_EXTENSION_LOGIN_COMPLETE` to the extension (e.g. via `chrome.runtime.sendMessage`) so the background can refresh auth and pull the token from the page.
  2. **Delay redirect:** `setTimeout(() => safeRedirectToReturnUrl(returnUrl), 1500)` so the redirect happens **1.5 seconds** after login, giving the extension time to receive the message and get the token from the dashboard context before the tab navigates.

**Result:** The extension can complete token retrieval and session validation before the user is sent back to the return URL, avoiding “not authenticated” right after login.

---

## 4. Token Retrieval When No Dashboard Tab Exists (Stop Login Loop)

**Goal:** When the background needs a token but no dashboard tab is open, open the dashboard in the background instead of leaving the user in a state that could cause a login loop.

**Changes (background – `getTokenFromPage`):**

- After trying the active tab and all existing tabs for a dashboard origin and still getting no token:
  - If there is **no** dashboard tab: open the dashboard in a **background** tab:  
    `chrome.tabs.create({ url: "<base>/dashboard", active: false })`.
  - Wait briefly (e.g. 800ms), then **retry** token retrieval from all tabs (including the newly opened one once it has loaded and the content script can respond).

**Result:** The extension can recover when the user has no dashboard tab open, and avoids getting stuck in a loop where it keeps opening login because it never finds a token source.

---

## 5. Tray Always Opens Expanded (Homepage)

**Goal:** Extension click and toggle should always show the tray in the same, predictable state: expanded (home).

**Changes (background):**

- **`chrome.action.onClicked`:** Always sets `globalUIState.visible = true` and `globalUIState.expanded = true` (no toggle, no “restore previous state”).
- **`ECHLY_TOGGLE_VISIBILITY` handler:** When the tray is toggled (e.g. from content), it now always sets `visible = true` and `expanded = true` instead of toggling visibility or setting `expanded = false` when opening.

**Result:** Every time the user opens the tray (icon click or equivalent), they see the tray homepage expanded, not a collapsed or previously saved state.

---

## 6. Home Button Navigation

**Goal:** The home icon in the tray should open the Echly dashboard in a new tab in a reliable way.

**Changes (CaptureHeader / content):**

- The home icon click handler was replaced with:  
  `window.open("https://echly-web.vercel.app/dashboard", "_blank")`  
  so the dashboard always opens in a new tab from the content script context.

**Result:** Consistent “open dashboard” behavior from the extension UI.

---

## 7. Reduced Token and Handshake Timeouts

**Goal:** Avoid long (e.g. 6s) stalls when the token or handshake cannot be obtained.

**Changes:**

- **Background:** `TOKEN_REQUEST_TIMEOUT_MS` reduced from 6000 to **2000** ms.
- **Content (requestTokenFromPage):**  
  - `HANDSHAKE_TIMEOUT_MS` set to **1500** ms.  
  - `TOKEN_REQUEST_TIMEOUT_MS` set to **2000** ms.

**Result:** Failed token or handshake attempts fail fast (2s or 1.5s) instead of blocking for 6 seconds.

---

## 8. Auth Refresh When Tray Opens

**Goal:** When the tray becomes visible, ensure the content script’s auth state is up to date (e.g. after login or after opening the tray on a tab that hadn’t received the latest auth broadcast).

**Changes (content.tsx):**

- A `useEffect` depends on `globalState.visible`.
- When `globalState.visible` is true, the content script sends `ECHLY_GET_AUTH_STATE` to the background.
- On response, if `response?.authenticated && response.user?.uid`, it calls `setUser({ uid: response.user.uid, ... })` so the tray UI shows the correct user.

**Result:** Opening the tray triggers a one-off auth state refresh so the user and login state are correct without requiring a full page reload.

---

## Summary Table

| Area                 | Change                                                                 |
|----------------------|------------------------------------------------------------------------|
| **Instant launch**   | Icon click shows tray first; session validation runs in background.   |
| **Session cache**     | 30s TTL used in `validateSessionInBackground` to skip redundant checks.|
| **Login race**       | 1.5s delay before redirect after extension login.                     |
| **Login loop**       | No dashboard tab → open dashboard in background, wait, retry token.   |
| **Tray behavior**    | Always open tray expanded (home).                                    |
| **Home button**      | `window.open(…/dashboard, "_blank")`.                                |
| **Timeouts**         | Token 2s, handshake 1.5s in content; token 2s in background.        |
| **Auth on open**     | Tray visible → request `ECHLY_GET_AUTH_STATE` and update user.        |

All of the above are limited to **extension behavior** and **login page redirect timing**; backend authentication and API contract are unchanged.
