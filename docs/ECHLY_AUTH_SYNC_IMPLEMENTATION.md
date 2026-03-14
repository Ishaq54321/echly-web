# Echly Auth Sync Implementation

This document describes the synchronization improvements implemented so that extension login behaves like Loom: the extension becomes authenticated immediately after login, the widget no longer shows a stale "Sign in" state, and no dashboard tab is required after login.

---

## 1. Login completion signal

**Location:** `app/(auth)/login/page.tsx`

After successful login (Google or email/password) but **before** redirect to `returnUrl`, the login page notifies the extension that login finished:

1. **Direct extension API (when available):**  
   `window.chrome?.runtime?.sendMessage({ type: "ECHLY_EXTENSION_LOGIN_COMPLETE" })`  
   Used in environments where the page has access to the extension runtime.

2. **Page → content script bridge:**  
   `window.postMessage({ type: "ECHLY_EXTENSION_LOGIN_COMPLETE" }, window.location.origin)`  
   The content script (injected on dashboard origins, including the login page) listens for this and forwards it to the background via `chrome.runtime.sendMessage`. This is what allows the signal to work from a normal web page.

The signal is sent only when `isExtension && returnUrl` (extension flow). It is fired before `safeRedirectToReturnUrl(returnUrl)`, so the extension is notified while the tab is still on the dashboard origin and can obtain a token.

---

## 2. Background auth refresh

**Location:** `echly-extension/src/background.ts`

**Message listener:**  
A dedicated `chrome.runtime.onMessage.addListener` handles `ECHLY_EXTENSION_LOGIN_COMPLETE` and calls `refreshExtensionAuth()`.

**`refreshExtensionAuth()`:**

1. Calls `checkBackendSession()` (obtains token from the current login tab via the token bridge, then validates with `GET /api/auth/session`).
2. Updates `sessionCache` with the result and current timestamp.
3. Broadcasts to **all tabs** with `chrome.tabs.sendMessage(tabId, { type: "ECHLY_AUTH_STATE_UPDATED", authenticated, user })`.

So as soon as the login page sends the completion signal (before redirect), the background re-validates the session using the token from that tab, updates its cache, and pushes the new auth state to every tab’s content script.

---

## 3. Widget auth sync

**Location:** `echly-extension/src/content.tsx` (inside `ContentApp`)

A `chrome.runtime.onMessage.addListener` in a `useEffect` (mount-only) listens for `ECHLY_AUTH_STATE_UPDATED`:

- If `msg.authenticated && msg.user?.uid`:  
  `setUser({ uid, name, email, photoURL })` so the widget shows the authenticated UI.
- Otherwise:  
  `setUser(null)`.

The widget’s auth state is therefore updated dynamically whenever the background broadcasts `ECHLY_AUTH_STATE_UPDATED` (e.g. right after login completion), without needing a full reload or a dashboard tab to stay open.

---

## 4. Visibility refresh

**Location:** `echly-extension/src/content.tsx` (inside `ContentApp`)

A `React.useEffect` (mount-only) subscribes to `document.visibilitychange`:

- When `document.visibilityState === "visible"`, the content script sends `ECHLY_GET_AUTH_STATE` to the background.
- The background runs `checkBackendSession()` and responds with `{ authenticated, user }`.
- The content script updates `setUser(...)` or `setUser(null)` from that response.

So when the user switches back to a tab (e.g. after completing login in another tab or after opening the dashboard), the widget re-queries auth and refreshes the displayed state. This avoids stale “Sign in” or stale “logged in” after tab switches.

---

## 5. Final auth flow

**Extension login (Loom-style):**

1. User clicks extension icon (or is on a page with the widget) and is not authenticated → background opens login tab with `?extension=true&returnUrl=<current tab url>`.
2. User signs in on the login page (dashboard origin). Firebase auth and the token bridge are active on that tab.
3. **Before redirect**, the login page sends:
   - `window.chrome.runtime.sendMessage({ type: "ECHLY_EXTENSION_LOGIN_COMPLETE" })` (if available), and/or  
   - `window.postMessage({ type: "ECHLY_EXTENSION_LOGIN_COMPLETE" }, origin)`.
4. Content script on the login page (if present) receives the postMessage and forwards `ECHLY_EXTENSION_LOGIN_COMPLETE` to the background.
5. Background runs `refreshExtensionAuth()`: gets token from the login tab via bridge, validates with `/api/auth/session`, updates `sessionCache`, and sends `ECHLY_AUTH_STATE_UPDATED` to all tabs.
6. All tabs (including the one that will receive the redirect) update their widget `user` state → no more stale “Sign in” after redirect.
7. Login page redirects to `returnUrl`. No dashboard tab is required to remain open; auth state has already been refreshed and broadcast.

**Extension icon click:**

- Every click runs `checkBackendSession()` (no cache shortcut).  
- So the first click after login immediately sees the new session and opens the tray (or shows login if not authenticated).

**Widget behavior:**

- When not authenticated (`!user`), the widget renders nothing (`return null`). Login is only triggered via the extension icon, not via a widget “Sign in” button.
- When authenticated, the widget shows the full capture UI. Auth state is kept in sync by:
  - `ECHLY_AUTH_STATE_UPDATED` (e.g. after login completion),
  - Visibility change (tab becomes visible → re-query `ECHLY_GET_AUTH_STATE`).

---

## Summary

| Piece | Purpose |
|-------|--------|
| **Login completion signal** | Notify extension that login succeeded before redirect, so the background can refresh while the tab is still on the dashboard. |
| **Background auth refresh** | On `ECHLY_EXTENSION_LOGIN_COMPLETE`, re-validate session and broadcast `ECHLY_AUTH_STATE_UPDATED` to all tabs. |
| **Widget auth sync** | React to `ECHLY_AUTH_STATE_UPDATED` and update `user` so the widget shows the correct state without reload. |
| **Visibility refresh** | On tab visible, re-request `ECHLY_GET_AUTH_STATE` and update `user` so returning to a tab always shows current auth. |
| **No widget Sign in button** | When `!user`, render nothing; login only via extension icon. |
| **Icon click always re-check** | Every icon click runs `checkBackendSession()`, so login is detected immediately after the user signs in. |

Together, these changes make the extension login flow behave like Loom: authenticated state is updated right after login, the widget does not show a stale “Sign in” state, and a dashboard tab does not need to stay open after redirect.
