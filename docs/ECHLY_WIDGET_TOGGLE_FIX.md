# Echly Widget Toggle Fix — Final Report

**Goal:** Make the extension icon behave like Loom: click → widget opens; click again → widget closes. The popup is kept and acts as a **toggle controller**.

---

## 1. Popup toggle logic

**File:** `echly-extension/src/popup.tsx`

- On load, the popup does **not** always send `ECHLY_OPEN_WIDGET`. It first asks the background for tray state.
- **Flow:**
  1. **Request tray state:** `chrome.runtime.sendMessage({ type: "ECHLY_GET_TRAY_STATE" })`.
  2. **If tray is open** (`state?.trayOpen`): send `ECHLY_CLOSE_WIDGET`, then `window.close()` and return.
  3. **If tray is closed:** send `ECHLY_OPEN_WIDGET` (background may redirect to login if not authenticated), then `window.close()`.
- Helpers added:
  - `getTrayState()` — returns `{ trayOpen, visible }` from the background.
  - `closeWidget()` — sends `ECHLY_CLOSE_WIDGET` and resolves when done.
  - `openWidget()` — sends `ECHLY_OPEN_WIDGET` and returns `{ ok, redirectToLogin }`.
- The popup UI is minimal: a single “Loading…” state while the toggle runs, then the window closes. No login UI on icon click when not authenticated; the background opens the auth tab and the popup closes.

---

## 2. Background state changes

**File:** `echly-extension/src/background.ts`

### New message handlers

- **`ECHLY_GET_TRAY_STATE`**  
  Responds with:
  - `trayOpen`: in-memory tray-open flag.
  - `visible`: `globalUIState.visible`.

- **`ECHLY_CLOSE_WIDGET`**  
  - Sets `trayOpen = false`, `globalUIState.visible = false`.
  - Persists `echlyActive: false` in `chrome.storage.local`.
  - Calls `broadcastUIState()`.
  - Sends `{ type: "ECHLY_CLOSE_WIDGET" }` to the active tab in the current window (so the content script can hide the widget).
  - Uses async handler and `sendResponse({ ok: true })` when done.

### Updated `ECHLY_OPEN_WIDGET` handler

- Resolves **current tab** with `chrome.tabs.query({ active: true, currentWindow: true })` and sets `sw.lastUserTabId` so the widget opens in the tab where the user clicked the icon (popup or otherwise).
- **Session check:** calls `verifyDashboardSession()`. If invalid:
  - Clears token/user state.
  - Opens the extension auth tab (`EXTENSION_AUTH_URL`) if not already open.
  - Responds with `{ ok: false, redirectToLogin: true }` and does not open the widget.
- If session is valid: sets `trayOpen = true`, calls `openWidgetInActiveTab()` (which sets `globalUIState.visible` and `expanded`, persists `echlyActive: true`, injects content script if needed, and sends `ECHLY_OPEN_WIDGET` to the tab), then responds `{ ok: true }`.

### State variables kept in sync

- **Opening:** `openWidgetInActiveTab()` sets `globalUIState.visible = true`, `globalUIState.expanded = true`, and `echlyActive: true` in storage; the `ECHLY_OPEN_WIDGET` handler sets `trayOpen = true`.
- **Closing:** `ECHLY_CLOSE_WIDGET` sets `trayOpen = false`, `globalUIState.visible = false`, and `echlyActive: false` in storage.

---

## 3. Widget visibility flow

1. **User clicks extension icon**  
   Chrome opens the popup (manifest uses `action.default_popup`).

2. **Popup runs**  
   Sends `ECHLY_GET_TRAY_STATE` → background returns `{ trayOpen, visible }`.

3. **If tray is open**  
   Popup sends `ECHLY_CLOSE_WIDGET`:
   - Background: `trayOpen = false`, `globalUIState.visible = false`, `echlyActive: false`, `broadcastUIState()`, and sends `ECHLY_CLOSE_WIDGET` to the active tab.
   - Content script: receives `ECHLY_CLOSE_WIDGET` and calls `setHostVisibility(false)` → widget hides.
   - Popup closes.

4. **If tray is closed**  
   Popup sends `ECHLY_OPEN_WIDGET`:
   - Background: sets `lastUserTabId` from active tab; verifies session. If invalid → opens auth tab and responds `redirectToLogin` (popup closes). If valid → `trayOpen = true`, `openWidgetInActiveTab()`:
     - Sets `echlyActive: true`, `globalUIState.visible/expanded = true`, `broadcastUIState()`.
     - Ensures content script is injected in `lastUserTabId`, then sends `ECHLY_OPEN_WIDGET` to that tab.
   - Content script: receives `ECHLY_OPEN_WIDGET`, calls `setHostVisibility(true)`, widget shows.
   - Popup closes.

5. **Content script**  
   Already handles:
   - `ECHLY_OPEN_WIDGET` → `setHostVisibility(true)`.
   - `ECHLY_CLOSE_WIDGET` → `setHostVisibility(false)`.
   - No code changes were required in the content script.

---

## 4. Tests to run

| Test | Expected |
|------|----------|
| 1. Click extension icon | Widget opens. |
| 2. Click extension icon again | Widget closes. |
| 3. Click extension icon again | Widget opens again. |
| 4. Logged-out user clicks extension | Redirect to login (auth tab opens, popup closes). |

---

## 5. Files touched

- `echly-extension/src/background.ts` — `ECHLY_GET_TRAY_STATE`, `ECHLY_CLOSE_WIDGET`, and updated `ECHLY_OPEN_WIDGET` (lastUserTabId + session check).
- `echly-extension/src/popup.tsx` — Toggle flow: get state → close or open → close window; added `getTrayState`, `closeWidget`, `openWidget`.
- Content script — No changes (already supports `ECHLY_OPEN_WIDGET` / `ECHLY_CLOSE_WIDGET` and `setHostVisibility`).
