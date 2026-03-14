# Echly Extension Login Flow Fix — Implementation Report

**Date:** 2025-03-15  
**Scope:** `echly-extension/src/background.ts` — authentication flow and login tab handling.

---

## 1. Updated Login Tab Logic

### Change: `openOrFocusLoginTab()`

**Before (incorrect):** Reused any tab whose URL contained `/login` **or** `/dashboard`, which caused the extension to focus an existing dashboard tab instead of opening the login page when the user was not authenticated.

**After (required):** Only reuses **existing login tabs**.

**Implementation:**

1. Query all tabs via `chrome.tabs.query({}, ...)`.
2. If a tab URL contains **`/login`** → focus that tab and set `loginTabId`.
3. Otherwise → create a new tab with `loginUrl` and set `loginTabId`.

Dashboard URLs are no longer considered. Dashboard tabs are **never** reused as login tabs.

**Code location:** `echly-extension/src/background.ts` — `openOrFocusLoginTab()` now uses only `t.url.includes("/login")` in the `tabs.find()` predicate; the `t.url.includes("/dashboard")` branch was removed.

---

## 2. Confirmation: Dashboard Tabs Are No Longer Reused

- **Icon click when unauthenticated:** The flow calls `openOrFocusLoginTab(loginUrl)`. That function now looks only for tabs with `/login` in the URL. Any existing dashboard tab is ignored; a new login tab is created if no login tab exists.
- **Result:** Clicking the extension icon when not authenticated always leads to the login page (either by focusing an existing login tab or opening a new one). The previous bug (focusing a dashboard tab and never opening login) is fixed.

---

## 3. Confirmation: Tray Opens When Authenticated

- **Icon click when authenticated:** Handled in `chrome.action.onClicked`.
  - If session cache is valid (authenticated within TTL): sets `globalUIState.visible = true`, `globalUIState.expanded = true`, `persistUIState()`, `broadcastUIState()` and returns. No tab creation or focus.
  - If cache miss: calls `checkBackendSession()`. If `session.authenticated === true`, same as above — only tray state and broadcast; **no dashboard open/focus**.
- **Post-login:** `ECHLY_EXTENSION_AUTH_SUCCESS` → `validateSessionAndOpenTray()` → GET `/api/auth/session` → on success sets `globalUIState.visible = true`, `broadcastUIState()`, switches to `originTabId`. Tray opens as intended.

---

## 4. Confirmation: Login Page Opens When Unauthenticated

- When `checkBackendSession()` returns `authenticated: false` (or throws), the handler logs `[ECHLY AUTH] opening login tab` and calls `openOrFocusLoginTab(loginUrl)`.
- `openOrFocusLoginTab()` either focuses an existing tab with `/login` in the URL or creates a new tab with the login URL. The login page is always shown when the user is not authenticated; dashboard is never used as a substitute.

---

## 5. Login-Tab Guard (Single Login Tab)

- Before creating a new tab, `openOrFocusLoginTab()` searches existing tabs for a URL containing `/login`.
- If found → that tab is focused and reused (single login tab behavior).
- If not found → a new tab is created. Only one logical “login tab” is used at a time.

---

## 6. Post–Login Tab Closing (Existing Behavior Verified)

- In `validateSessionAndOpenTray()`, after opening the tray and switching to `originTabId`, the code closes the tab referenced by `loginTabId` **only if** `t?.url?.includes("/login")`.
- Dashboard tabs are **not** closed; they remain open. Only the actual login tab is closed after successful auth.

---

## 7. Debug Logging Added (Temporary)

The following temporary debug logs were added in the extension icon click flow:

- `console.log("[ECHLY AUTH] session authenticated:", session.authenticated)`
- `console.log("[ECHLY AUTH] opening login tab")` — when unauthenticated or on error
- `console.log("[ECHLY AUTH] opening tray")` — when authenticated (cache hit or after `checkBackendSession()`)

These can be removed or gated behind a debug flag once the fix is validated.

---

## Summary

| Item | Status |
|------|--------|
| Login tab reuse limited to `/login` only | Done |
| Dashboard tabs never reused as login tabs | Confirmed |
| Tray opens when authenticated (icon click) | Confirmed |
| Login page opens when unauthenticated (icon click) | Confirmed |
| Single login-tab guard (focus existing or create) | Done |
| Login tab closed only if URL contains `/login` | Verified (existing) |
| Debug logging added | Done |

No other architecture or unrelated code was modified.
