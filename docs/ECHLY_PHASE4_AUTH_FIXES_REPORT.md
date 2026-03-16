# Echly Extension Phase-4 Authentication Fixes — Confirmation Report

**Date:** 2025-03-16  
**Goal:** Match Loom-style behavior and stop automatic authentication triggers.

---

## 1. Summary of Changes

| Task | File | Change |
|------|------|--------|
| 1–2 | `echly-extension/src/content.tsx` | Removed auth on mount; request auth only when widget becomes visible |
| 3 | `echly-extension/utils/apiFetch.ts` | Global 401 handling: clear token, notify background, throw `NOT_AUTHENTICATED` |
| 4 | `echly-extension/src/background.ts` | Guard in `getExtensionToken()` to prevent multiple `/extension-auth` tabs |

---

## 2. Fix Details

### 2.1 No automatic auth on content script mount

**Before:** A `useEffect` with empty deps ran on mount and sent `ECHLY_GET_AUTH_STATE` to the background, which could trigger `hydrateAuthState()` → `getValidToken()` → opening `/extension-auth` on every page load.

**After:** That mount-time request was removed. The content script no longer sends any auth message when it loads.

**Code:** The previous `useEffect(() => { chrome.runtime.sendMessage({ type: "ECHLY_GET_AUTH_STATE" }, ...) }, [])` was replaced with an effect that runs only when `globalState.visible` is true (see below).

---

### 2.2 Auth only when widget is opened

**Trigger:** `chrome.runtime.sendMessage({ type: "ECHLY_GET_AUTH_STATE" })` is sent only when the widget UI becomes visible.

**Implementation:** A single `useEffect` in `content.tsx` depends on `globalState.visible`:

- When `globalState.visible` is `false`: effect does nothing; no auth request.
- When user clicks the extension icon → background sets `visible: true` and broadcasts → content receives `ECHLY_GLOBAL_STATE` / `ECHLY_OPEN_WIDGET` → host is shown and `globalState.visible` becomes true → effect runs and sends `ECHLY_GET_AUTH_STATE` once.

Auth is therefore requested only when the user has explicitly opened the widget (Loom-style).

---

### 2.3 Global 401 handling in `apiFetch.ts`

**File:** `echly-extension/utils/apiFetch.ts`

**Behavior after `fetch`:**

- If `response.status === 401`:
  1. Clear local `extensionToken`.
  2. Call `setExtensionToken(null)` (so any shared reference is cleared).
  3. Send `chrome.runtime.sendMessage({ type: "ECHLY_AUTH_INVALID" })` so the background clears:
     - `extensionToken` / `extensionTokenExpiresAt`
     - `sw.extensionToken` / `sw.currentUser`
     - and calls `setExtensionToken(null)` again.
  4. `console.log("[ECHLY] Auth expired or user logged out")`.
  5. `throw new Error("NOT_AUTHENTICATED")` so callers get a clear, consistent signal.

The caller no longer receives the 401 `Response`; they get `NOT_AUTHENTICATED` and can handle re-auth or UI accordingly.

---

### 2.4 No repeated `/extension-auth` tabs (background guard)

**File:** `echly-extension/src/background.ts`

**New state:**

- `authTabOpen`: boolean indicating that an auth broker flow is in progress.
- `brokerPromise`: the in-flight `Promise<string>` for the current broker flow.

**Logic in `getExtensionToken()`:**

1. If a valid token already exists (in memory and not expired), return it (unchanged).
2. **Guard:** If `authTabOpen && brokerPromise != null`, return the existing `brokerPromise` (no new tab).
3. Otherwise set `authTabOpen = true`, create and store `brokerPromise`, open a single `/extension-auth` tab, and return `brokerPromise`.

**When broker finishes:**

- **Success (message `ECHLY_EXTENSION_TOKEN`):** resolve, then set `authTabOpen = false` and `brokerPromise = null`, and close the broker tab.
- **Tab closed (e.g. user closes auth tab):** in `chrome.tabs.onRemoved`, set `authTabOpen = false`, `brokerPromise = null`, and reject the pending promise with `NOT_AUTHENTICATED`.

Result: only one `/extension-auth` tab can be open at a time; concurrent callers share the same promise until the broker resolves or the tab is removed.

---

## 3. New Auth Trigger Flow

```
Page load
  → Content script mounts
  → No ECHLY_GET_AUTH_STATE sent
  → No localhost / extension-auth tab

User clicks extension icon
  → background: openWidgetInActiveTab()
  → visible = true, broadcast ECHLY_GLOBAL_STATE / ECHLY_OPEN_WIDGET
  → Content: host shown, globalState.visible === true
  → Content: useEffect runs → ECHLY_GET_AUTH_STATE

Background handles ECHLY_GET_AUTH_STATE
  → hydrateAuthState()
  → If token valid in memory → sendResponse({ authenticated: true, user })
  → If not: getValidToken() → getExtensionToken()
      → If authTabOpen && brokerPromise → return brokerPromise (no new tab)
      → Else open single /extension-auth tab, set authTabOpen, brokerPromise

User logged in (dashboard session valid):
  → /extension-auth page gets token, postMessages to extension
  → Background receives ECHLY_EXTENSION_TOKEN, resolves brokerPromise, clears authTabOpen/brokerPromise, closes tab
  → sendResponse({ authenticated: true, user })
  → Widget opens with full UI

User logged out:
  → /extension-auth opens → redirect to login
  → User signs in → token flow as above
  → Or user closes tab → onRemoved → reject with NOT_AUTHENTICATED → sendResponse({ authenticated: false, user: null })
  → Widget shows “Sign in from extension”
```

---

## 4. Expected Final Behavior

| Scenario | Expected behavior |
|----------|-------------------|
| **User logged in** | Click extension → widget opens immediately (no extra tabs). |
| **User logged out** | Click extension → one `/extension-auth` tab opens → redirect to login; after sign-in, widget can use token. |
| **Page load (any tab)** | No automatic localhost or extension-auth tabs; no auth request until the user opens the widget. |
| **401 from API** | Token and user state cleared globally; caller receives `NOT_AUTHENTICATED`; UI can show sign-in or retry. |
| **Multiple rapid auth requests** | Only one `/extension-auth` tab; all callers share the same broker promise. |

---

## 5. Files Touched

- `echly-extension/src/content.tsx` — auth request only when `globalState.visible` is true.
- `echly-extension/utils/apiFetch.ts` — 401 → clear token, `ECHLY_AUTH_INVALID`, log, throw `NOT_AUTHENTICATED`.
- `echly-extension/src/background.ts` — `authTabOpen` and `brokerPromise` in `getExtensionToken()`, cleared on token received or tab removed.

Phase-4 authentication behavior is aligned with the intended Loom-style flow and the above expectations.
