# Echly Extension Auth Stability Fix Report

**Date:** 2025-03-15  
**Scope:** Critical stability fixes to the extension authentication system. Architecture unchanged (extension stores tokens → refresh token lifecycle → validate via `/api/auth/session` → open tray or login page).

---

## 1. Duplicated background listeners removed

**File:** `echly-extension/src/background.ts`

- **Issue:** Two separate `chrome.runtime.onMessage.addListener` registrations existed. The first handled only `ECHLY_EXTENSION_AUTH_SUCCESS` (login token storage + validate session + open tray). The second handled all other message types (toggle visibility, expand/collapse, get state, feedback, session, etc.). Registering the same event twice can cause unpredictable behavior and duplicate handling.
- **Change:** Merged into a **single** `chrome.runtime.onMessage.addListener`. The unified listener first checks for `ECHLY_EXTENSION_AUTH_SUCCESS`, runs the auth-success flow and returns `true`; otherwise it continues with the existing switch on `request.type` for all other messages.
- **Result:** Each of the following is now registered exactly once:
  - `chrome.tabs.onActivated.addListener`
  - `chrome.tabs.onCreated.addListener`
  - `prewarmSessionFromStorage` (function; called from startup/installed only)
  - `chrome.runtime.onStartup.addListener`
  - `chrome.runtime.onInstalled.addListener`
  - `chrome.action.onClicked.addListener`
  - `chrome.runtime.onMessage.addListener`

---

## 2. Single click handler verification

- **Requirement:** Exactly one `chrome.action.onClicked.addListener` in `background.ts`.
- **Verification:** Grep confirms a single occurrence in `echly-extension/src/background.ts`. No duplicate click handlers.

---

## 3. Login postMessage origin fix

**File:** `app/(auth)/login/page.tsx`

- **Issue:** Login success was sent with `window.postMessage(..., "*")`, which can prevent the content script from reliably receiving the message depending on browser/postMessage behavior.
- **Change:** Replaced the target origin `"*"` with `window.location.origin` in all three places:
  - `useEffect` (onAuthStateChanged path when `isExtension` is true)
  - `handleGoogle()` (extension path after Google sign-in)
  - `handleEmail()` (extension path after email/password sign-in)
- **Result:** Content script can listen for `ECHLY_PAGE_LOGIN_SUCCESS` with `window.location.origin` so the login page and content script agree on origin and delivery is reliable.

---

## 4. API_BASE alignment

**File:** `echly-extension/src/api.ts`

- **Issue:** `API_BASE` was hardcoded to `"http://localhost:3000"`, which did not match the conditional base used in `background.ts` for production.
- **Change:** Replaced with:
  ```ts
  const API_BASE =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://echly-web.vercel.app";
  ```
- **Result:** Extension API usage is aligned with `background.ts`: development uses localhost, production uses `https://echly-web.vercel.app`.

---

## 5. Click debug logs (FIX 5)

**File:** `echly-extension/src/background.ts`

- **Change:** Inside `chrome.action.onClicked.addListener`, added at the very start of the handler (before the `authCheckInProgress` check):
  - `console.log("[ECHLY CLICK] icon clicked");`
  - `console.log("[ECHLY CLICK] session cache", sessionCache);`
- **Result:** Easier to diagnose click handling and session cache state in extension background console.

---

## 6. Tray open on authenticated session (FIX 6)

- **Requirement:** When the user is authenticated, the tray must open immediately after successful auth validation in the click handler.
- **Verification:** The `chrome.action.onClicked.addListener` handler already contains the correct logic when `session.authenticated === true`:
  - `globalUIState.user = session.user ?? null;`
  - `globalUIState.visible = true;`
  - `globalUIState.expanded = true;`
  - `persistUIState();`
  - `broadcastUIState();`
- **Result:** No code change needed; behavior confirmed.

---

## Expected extension behavior after fix

1. **Click extension** → If logged in (valid session/cache) → **tray opens instantly**.
2. **Click extension** → If not logged in → **login tab opens**.
3. User logs in on login page → Login tab switches to dashboard → Extension switches back to original tab → **Tray opens automatically** (via `validateSessionAndOpenTray` after token storage from postMessage).

---

## Summary

| Fix | Description |
|-----|-------------|
| 1 | Duplicated `chrome.runtime.onMessage.addListener` removed; single unified listener. |
| 2 | Single `chrome.action.onClicked.addListener` verified. |
| 3 | Login `postMessage` target origin set to `window.location.origin` in `useEffect`, `handleGoogle()`, and `handleEmail()`. |
| 4 | `API_BASE` in `api.ts` aligned with `background.ts` (dev vs production). |
| 5 | Click debug logs added in `onClicked` handler. |
| 6 | Tray-open logic on authenticated session confirmed in place. |
