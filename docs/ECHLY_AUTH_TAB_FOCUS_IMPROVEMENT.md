# Echly Extension — Auth Tab Focus UX Improvement

**Date:** 2025-03-16  
**Scope:** `echly-extension/src/background.ts`  
**Goal:** When the login/auth tab is already open and the user clicks the extension again, focus the existing login tab instead of doing nothing.

---

## 1. Summary

Previously, if `authTabOpen` was true, the extension would simply return and not open a second auth tab—but it also did **not** bring the existing auth tab to the foreground. Users had to find the login tab manually.

This change adds a **focus-existing-tab** flow: when the user triggers auth (icon click, open widget, or trigger-login) and an auth tab is already open, the extension now focuses that tab and its window. If the tab was closed manually, state is cleared and a new auth tab is opened.

---

## 2. Implementation

### 2.1 Helper: `focusExistingAuthTabIfOpen()`

**Location:** `echly-extension/src/background.ts` (after auth state variables)

**Behavior:**

- If `authTabOpen` is false or `authBrokerTabId` is null → return `false` (caller may open a new tab).
- Otherwise:
  - **Try:** `chrome.tabs.get(authBrokerTabId)`.
  - **Success:** `chrome.windows.update(tab.windowId, { focused: true })`, then `chrome.tabs.update(authBrokerTabId, { active: true })`; return `true` (caller must not open a new tab).
  - **Catch (tab missing):** Log warning, set `authTabOpen = false`, `authBrokerTabId = null`, return `false` (caller may open a new tab).

**Fallback safety:** If the tab was closed manually, `chrome.tabs.get` throws; we clear state and return `false` so the next action opens a new auth tab.

### 2.2 Auth Entry Points Updated

| Entry point | File / area | Change |
|-------------|-------------|--------|
| **1. Icon click** | `chrome.action.onClicked` → when `!sessionValid` | Replaced `if (authTabOpen) return` with `if (await focusExistingAuthTabIfOpen()) return` before opening a new auth tab. |
| **2. ECHLY_OPEN_WIDGET** | Message handler `ECHLY_OPEN_WIDGET` → when `!sessionValid` | Replaced “only open if `!authTabOpen`” with: if `await focusExistingAuthTabIfOpen()` then send response and return; else set `authTabOpen = true`, create tab, then send response. |
| **3. ECHLY_TRIGGER_LOGIN** | Message handler `ECHLY_TRIGGER_LOGIN` | Replaced synchronous `if (authTabOpen) { sendResponse; return }` with async IIFE: if `await focusExistingAuthTabIfOpen()` then sendResponse and return; else create tab and sendResponse. Handler returns `true` to keep message channel open for async `sendResponse`. |

Duplicate auth tabs are not opened: we only call `chrome.tabs.create` when `focusExistingAuthTabIfOpen()` returns `false`.

---

## 3. Expected Behavior After Change

| Case | Behavior |
|------|----------|
| **Case 1 — Logged out, click extension** | Login tab opens. |
| **Case 2 — User switches tab, then clicks extension again** | Existing login tab is focused (window + tab). No second tab. |
| **Case 3 — User closes login tab without logging in, then clicks extension** | State cleared (tab missing); new login tab opens. |
| **Case 4 — Login success** | Login page closes; widget opens automatically; extension works normally. |

---

## 4. Files Touched

- **Modified:** `echly-extension/src/background.ts`
  - Added `focusExistingAuthTabIfOpen()`.
  - Icon-click auth path uses it before opening auth tab.
  - `ECHLY_OPEN_WIDGET` auth path uses it and only creates a tab when it returns `false`.
  - `ECHLY_TRIGGER_LOGIN` uses it in an async IIFE and returns `true` for async response.

---

## 5. Testing Suggestions

1. **Focus existing tab:** Open auth (e.g. click icon when logged out), switch to another tab, click icon again → auth tab should come to front in its window.
2. **No duplicate tabs:** Repeat trigger (icon or widget) multiple times with auth tab open → still only one auth tab.
3. **Tab closed:** Open auth tab, close it manually, trigger auth again → new auth tab opens.
4. **ECHLY_TRIGGER_LOGIN:** From content/popup, send `ECHLY_TRIGGER_LOGIN` with auth tab already open → same tab focused; with auth tab closed → new tab created.

---

## 6. Notes

- `getExtensionToken()` still uses `authTabOpen && brokerPromise != null` only to reuse the in-flight broker promise; it does not open a tab, so no focus logic was added there.
- `chrome.tabs.onRemoved` continues to clear `authBrokerTabId` and `authTabOpen` when the broker tab is closed, so state stays in sync when the user closes the tab via the UI.
