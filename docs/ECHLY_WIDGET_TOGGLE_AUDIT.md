# Echly Chrome Extension — Widget Toggle Behavior Audit

**Date:** 2025-03-16  
**Scope:** Diagnostic audit only (no code changes).  
**Goal:** Determine why clicking the extension icon does not toggle the feedback tray closed (Loom-style: first click opens, second click should close).

---

## 1. Current Widget Control Flow

### 1.1 What Happens When the User Clicks the Extension Icon

1. **Manifest configuration** (`echly-extension/manifest.json`):
   - `"action": { "default_popup": "popup.html" }` is set.
   - With `default_popup` set, **Chrome does not fire `chrome.action.onClicked`** when the user clicks the icon. The popup opens instead.

2. **Actual flow on first click:**
   - User clicks extension icon → **popup opens** (not background).
   - Popup script runs; if authenticated it calls `openWidget()` (sends `ECHLY_OPEN_WIDGET` to background) and `window.close()`.
   - Background **message handler** receives `ECHLY_OPEN_WIDGET` (from popup), sets `trayOpen = true`, calls `openWidgetInActiveTab()`, and sends `ECHLY_OPEN_WIDGET` to the active tab.
   - Content script receives `ECHLY_OPEN_WIDGET`, calls `setHostVisibility(true)` and dispatches `ECHLY_OPEN_WIDGET` custom event. Widget appears.

3. **Actual flow on second click:**
   - User clicks extension icon again → **popup opens again** (background `onClicked` still never runs).
   - Popup again sends `ECHLY_OPEN_WIDGET` and closes. No close/toggle logic runs in the popup.
   - Widget remains open; user never gets a “close” path from the icon.

**Conclusion:** The extension icon does not behave as a toggle because the **icon click never reaches the background script**. The background’s toggle logic (if `trayOpen` → send `ECHLY_CLOSE_WIDGET`) exists but is **never executed** while the manifest has a `default_popup`.

---

## 2. Extension Icon Click Handler

**Location:** `echly-extension/src/background.ts` (lines 33–62)

- **Function that runs when the icon is clicked:** In theory, the callback passed to `chrome.action.onClicked.addListener`. In practice, **this listener never runs** because the action has a `default_popup`.
- **Toggle state:** The handler uses a variable `trayOpen` (line 98: `let trayOpen = false`).
  - If `trayOpen` is true: it sets `globalUIState.visible = false`, `trayOpen = false`, `echlyActive: false` in storage, calls `broadcastUIState()`, and sends `ECHLY_CLOSE_WIDGET` to the current tab, then returns.
  - If `trayOpen` is false: it verifies dashboard session; if invalid opens auth tab; else calls `openWidgetInActiveTab()` and sets `trayOpen = true`.
- **Does it always send ECHLY_OPEN_WIDGET?** No. It only sends `ECHLY_OPEN_WIDGET` when `trayOpen` is false (via `openWidgetInActiveTab()`). When `trayOpen` is true it sends `ECHLY_CLOSE_WIDGET`. So **toggle state exists in the background and is implemented correctly for the icon path**—but that path is never used while a popup is attached.

---

## 3. Global Widget State

**Location:** `echly-extension/src/background.ts`

- **Variables representing UI / tray state:**
  - **`trayOpen`** (line 98): `let trayOpen = false`. Boolean: “tray is open” (icon-click toggle state). Used only in `chrome.action.onClicked` (which does not run with popup set).
  - **`globalUIState`** (lines 106–129): Object including `visible`, `expanded`, `isRecording`, `sessionId`, `sessionTitle`, `sessionModeActive`, `sessionPaused`, `sessionLoading`, `pointers`, `captureMode`. `visible` is the canonical “widget visible” flag for broadcasts.

- **Is there a boolean for widget visibility?** Yes: `globalUIState.visible` and, for the icon-toggle path, `trayOpen`.
- **When is it updated?**
  - **Widget open:** `openWidgetInActiveTab()` sets `globalUIState.visible = true`, `globalUIState.expanded = true`, then `broadcastUIState()`. The message handler for `ECHLY_OPEN_WIDGET` sets `trayOpen = true` (line 515).
  - **Widget close:** Only the **icon click** branch (lines 39–46) sets `globalUIState.visible = false` and `trayOpen = false` and broadcasts. That branch is never run with the current manifest. No other path (e.g. popup or content) sends or triggers a “close” that updates this state for a simple icon toggle.

So: state is updated on open; the only code that updates it on “close” for a pure toggle is the unused `onClicked` branch.

---

## 4. Message Types (Widget Control)

**Widget open/close and global state messages:**

| Message                  | Exists | Sent by background | Handled in content |
|--------------------------|--------|---------------------|--------------------|
| `ECHLY_OPEN_WIDGET`      | Yes    | Yes (open path)    | Yes                |
| `ECHLY_CLOSE_WIDGET`     | Yes    | Yes (only in icon click branch) | Yes |
| `ECHLY_GLOBAL_STATE`     | Yes    | Yes (broadcast)     | Yes                |
| `ECHLY_SESSION_STATE_SYNC` | Yes  | Yes (tab activation) | Yes                |
| `ECHLY_RESET_WIDGET`     | Yes    | Yes (session end / idle) | Yes            |

- **Does `ECHLY_CLOSE_WIDGET` exist?** Yes.
- **Does background ever send it?** Yes, but only in the `chrome.action.onClicked` branch (line 44). With `default_popup` set, that branch is never executed, so in practice the background never sends `ECHLY_CLOSE_WIDGET` on icon click.
- **Does content script handle it?** Yes. In `content.tsx` (lines 1619–1622), on `ECHLY_CLOSE_WIDGET` it calls `setHostVisibility(false)` and returns.

---

## 5. Content Script Message Handling

**Location:** `echly-extension/src/content.tsx` — single `chrome.runtime.onMessage.addListener` in `ensureMessageListener()` (lines 1599–1671).

- **`ECHLY_OPEN_WIDGET`:**
  - Sets host visibility: `setHostVisibility(true)`.
  - Dispatches a custom event `ECHLY_OPEN_WIDGET` so the React app can react (e.g. request expand).
- **`ECHLY_CLOSE_WIDGET`:**
  - Calls `setHostVisibility(false)` (hides the shadow host via `display: none`, `visibility: hidden`, `pointer-events: none`). No unmount; widget is hidden only.
- **Is there a function that sets widget visibility to false?** Yes: `setHostVisibility(false)` (lines 44–52), used when handling `ECHLY_CLOSE_WIDGET` and when applying `ECHLY_GLOBAL_STATE` via `setHostVisibilityFromState()` (which uses `getShouldShowTray(state)`).

So the content script is **capable** of closing the widget; it just never receives `ECHLY_CLOSE_WIDGET` from the icon click because that click opens the popup instead of running the background listener.

---

## 6. Widget Root DOM Management

**Location:** `echly-extension/src/content.tsx` — `main()`, `mountReactApp()`, `setHostVisibility()`.

- **Injection model:** Content script is injected once per tab (or on demand via `ensureContentScriptInjected()`). The widget is **injected once and reused**.
- **Mount:** A single host element `#echly-shadow-host` is created (or reused), default `display: none`, `visibility: hidden`, `pointer-events: none`. React mounts once into a shadow root inside this host. No reinjection on each open/close.
- **Visibility:** Controlled by `setHostVisibility(visible)`:
  - `visible === true` → host `display: block`, `pointer-events: auto`, `visibility: visible`.
  - `visible === false` → host `display: none`, `pointer-events: none`, `visibility: hidden`.
- **React state:** `ContentApp` keeps `globalState` (including `visible`) in sync with background via `ECHLY_GLOBAL_STATE` and `ECHLY_GET_GLOBAL_STATE`. Visibility on the host is driven by the message handler and `setHostVisibilityFromState()`, not only by React state. The widget is **hidden/shown**, not destroyed/remounted, when toggling.

---

## 7. State Synchronization

- **`broadcastUIState()`** (background, lines 334–345): Sends `{ type: "ECHLY_GLOBAL_STATE", state: globalUIState }` to every tab. Content applies it via `setHostVisibilityFromState(state)` and merges into local state (with pointer protection).
- **Does `globalUIState` contain widget visibility?** Yes: `globalUIState.visible`.
- **Does clicking the extension update it?** When the **icon click** handler runs (which it currently does not), the close branch would set `globalUIState.visible = false` and call `broadcastUIState()`. When the widget is opened (via popup → `ECHLY_OPEN_WIDGET`), `openWidgetInActiveTab()` sets `globalUIState.visible = true` and broadcasts. So the only missing piece is a path that, on “second click,” sets `visible = false` and broadcasts—and that path exists in the unused `onClicked` close branch.

---

## 8. Reproduce Current Flow (Why the Widget Does Not Close)

1. User clicks extension icon.
2. Chrome opens **popup** (manifest `default_popup`). **Background `onClicked` is not fired.**
3. Popup loads; if authenticated it sends `ECHLY_OPEN_WIDGET` to background and closes.
4. Background message handler runs: sets `trayOpen = true`, calls `openWidgetInActiveTab()`, sends `ECHLY_OPEN_WIDGET` to active tab. Widget opens.
5. User clicks extension icon again.
6. Chrome opens **popup** again. Background `onClicked` still does not run.
7. Popup again sends `ECHLY_OPEN_WIDGET` and closes. No close/toggle logic in popup; background’s close branch (that would send `ECHLY_CLOSE_WIDGET`) is never triggered.
8. Widget stays open.

**Exact reason the widget does not close:** The close path lives in `chrome.action.onClicked`, which **never runs** when the action has a `default_popup`. The only trigger that currently runs on icon click is the popup, which only sends “open,” never “close” or “toggle.”

---

## 9. Root Cause Summary

| Item | Finding |
|------|--------|
| **Why toggle is missing** | Icon click opens the popup instead of firing `chrome.action.onClicked`. The popup always sends `ECHLY_OPEN_WIDGET` when authenticated and has no toggle/close behavior. |
| **File responsible** | **Manifest:** `echly-extension/manifest.json` (`default_popup` prevents `onClicked`). **Popup:** `echly-extension/src/popup.tsx` (only opens widget, never closes). **Background:** `echly-extension/src/background.ts` (toggle logic exists but is never used). |
| **Logic that must change** | Either (A) make the icon a true toggle without popup (remove or bypass popup so `onClicked` runs and existing toggle works), or (B) keep the popup and implement toggle in the popup (e.g. when opening, if widget is already open, send close; otherwise send open). |

---

## 10. Recommended Implementation Plan (No Code Yet)

### Option A — Icon as toggle (Loom-style), popup only when needed

- **Manifest:** Remove `default_popup` so that clicking the icon triggers `chrome.action.onClicked`.
- **Background (existing behavior):** Keep current `onClicked` logic:
  - If `trayOpen` → set `globalUIState.visible = false`, `trayOpen = false`, `echlyActive: false`, `broadcastUIState()`, send `ECHLY_CLOSE_WIDGET` to current tab.
  - Else → verify session; if invalid open auth tab (e.g. `chrome.tabs.create` to extension-auth); else `openWidgetInActiveTab()`, set `trayOpen = true`.
- **Popup access:** Provide another way to open the popup (e.g. context menu “Open Echly popup” or a button inside the widget that opens the popup in a tab). Optionally persist `trayOpen` (e.g. via `echlyActive` or a dedicated key in `chrome.storage.local`) and restore it on service worker startup so toggle state survives SW restarts.
- **Content script:** No change; already handles `ECHLY_OPEN_WIDGET` (show) and `ECHLY_CLOSE_WIDGET` (hide).

### Option B — Keep popup; add toggle in popup

- **Manifest:** Leave `default_popup` as is.
- **Background:** Expose current “widget open” state to popup (e.g. use existing `globalUIState.visible` or `trayOpen` via a new message like `ECHLY_GET_TRAY_OPEN` or reuse `ECHLY_GET_GLOBAL_STATE`).
- **Popup:** On open (e.g. in the same effect that currently calls `openWidget()` when authenticated):
  - First ask background for current tray state.
  - If widget is open → send a new message (e.g. `ECHLY_CLOSE_WIDGET` or `ECHLY_TOGGLE_WIDGET`) so background sets `trayOpen = false`, `globalUIState.visible = false`, broadcasts, and sends `ECHLY_CLOSE_WIDGET` to the active tab; then close popup.
  - If widget is closed → send `ECHLY_OPEN_WIDGET` as today; then close popup.
- **Background:** Handle the new close/toggle message (set state, broadcast, send `ECHLY_CLOSE_WIDGET` to current tab). Content already handles `ECHLY_CLOSE_WIDGET`.

### Suggested approach

- **Option A** matches the desired “click icon → open, click again → close” behavior with minimal surface area: one manifest change and optional persistence of `trayOpen`/`echlyActive` for SW restarts. Content script and background close path are already correct.
- If the product must keep “click icon → open popup” for login/settings, **Option B** keeps the popup and adds explicit toggle logic in the popup and one new (or reused) message path in the background.

---

## Appendix: File Reference

| File | Relevant areas |
|------|----------------|
| `echly-extension/manifest.json` | `action.default_popup` (line 21) |
| `echly-extension/src/background.ts` | `chrome.action.onClicked` (33–62), `trayOpen` (98), `globalUIState` (106–129), `openWidgetInActiveTab()` (373–388), `broadcastUIState()` (334–345), message handlers for `ECHLY_OPEN_WIDGET` (514–520) and close path in onClicked (39–46) |
| `echly-extension/src/content.tsx` | `ensureMessageListener()` (1599–1671), `ECHLY_OPEN_WIDGET` / `ECHLY_CLOSE_WIDGET` handling (1613–1622), `setHostVisibility()` (44–52), `getShouldShowTray()` (60–62), `main()` / host creation (1715–1752) |
| `echly-extension/src/popup.tsx` | `openWidget()` (41–43), effect that calls `openWidget()` when authenticated (62–70) |
