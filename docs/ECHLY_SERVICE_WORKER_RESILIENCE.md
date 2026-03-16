# Echly Service Worker Resilience

This document describes the safe service-worker resilience improvement for the Echly Chrome extension: startup recovery and lifecycle logging. The change is **non-invasive** and does not alter authentication, token flow, widget toggle, session system, or background messaging.

---

## 1. Worker lifecycle explanation

### Chrome service worker behavior

- The extension background script runs as a **service worker** (MV3). Chrome can **suspend** the worker after a period of inactivity (e.g. ~30 seconds with no events).
- When suspended, **in-memory state is lost**: `trayOpen`, `globalUIState`, `extensionToken`, etc. are reset on the next run.
- **Persistent state** lives in `chrome.storage.local` (e.g. `echlyActive`, `activeSessionId`, `sessionModeActive`, `sessionPaused`). This survives worker restarts.

### What happens on restart

1. Chrome starts the service worker again (e.g. on icon click, message, or `onInstalled`/`activate`).
2. The background script runs from the top; all module-level variables are re-initialized to their defaults.
3. Without recovery, the worker would have `trayOpen = false` and `globalUIState.visible = false` even if the user had the widget open, so the UI would appear “closed” until the next explicit user action.

### Resilience approach

- **Startup recovery** runs once when the script loads: it reads persisted UI/tray state from `chrome.storage.local` and restores in-memory variables **only** for tray/visibility, then runs the existing session initialization and broadcast. No auth, token, or message-handling logic is changed.
- **Lifecycle logging** (`onInstalled`, `activate`) helps confirm during development when the worker is installed/updated or activated (e.g. after a restart).

---

## 2. Startup recovery flow

The recovery runs inside the existing async IIFE at the bottom of `echly-extension/src/background.ts`, with a try/catch so a failure does not break the rest of the extension.

1. **Read from storage**  
   `chrome.storage.local.get(["echlyActive", "activeSessionId", "sessionModeActive"])`  
   (Only `echlyActive` is used for UI restore; the other keys are already consumed by `initializeSessionState()` and are read here for consistency with the recovery contract.)

2. **Restore tray/visibility (if widget was active)**  
   If `stored?.echlyActive` is truthy:
   - Set `trayOpen = true`
   - Set `globalUIState.visible = true`  
   No other in-memory state (auth, token, broker, etc.) is restored here.

3. **Session state (unchanged)**  
   Call `await initializeSessionState()` as before. It loads `activeSessionId`, `sessionModeActive`, `sessionPaused` from storage and repopulates `globalUIState` and `activeSessionId`; if a session is active it may reload pointers via API. This logic is **not** modified.

4. **Broadcast**  
   Call `broadcastUIState()` so all tabs receive the current global state (visible, session, pointers, etc.).

5. **Log / handle errors**  
   On success: `console.log("[ECHLY] service worker initialized")`.  
   On failure: `console.warn("[ECHLY] worker startup recovery failed", err)` and no throw (so the rest of the extension keeps working).

---

## 3. Restored state variables

Only the following in-memory variables are set during **startup recovery** (and only when `stored.echlyActive` is true):

| Variable           | Restored value | Purpose                                      |
|--------------------|----------------|----------------------------------------------|
| `trayOpen`         | `true`         | Tray is considered open (icon click will close). |
| `globalUIState.visible` | `true`  | Widget is considered visible; matches `echlyActive`. |

All other state is either:

- **Not restored** (by design): e.g. `extensionToken`, `authTabOpen`, `authBrokerTabId`, `lastUserTabId`. Token and auth flows remain on-demand; popup/widget toggle behavior is unchanged.
- **Restored by existing logic**: `initializeSessionState()` continues to set `activeSessionId`, `globalUIState.sessionId`, `globalUIState.sessionModeActive`, `globalUIState.sessionPaused`, and optionally `globalUIState.pointers` from storage/API. No changes were made to that function.

---

## 4. Expected behavior

| Scenario | Result |
|----------|--------|
| **Normal usage** | Extension behaves exactly as before; no change in auth, token, widget toggle, or messaging. |
| **Chrome suspends worker** | After restart, if the user had the widget open (`echlyActive` in storage), tray and visibility are restored and `broadcastUIState()` runs so the widget continues to respond correctly. |
| **Logged out / widget closed** | `echlyActive` is false or absent; no UI state is restored; behavior unchanged. |

---

## 5. What was not changed

- **Authentication** – No change to auth broker, login flow, or session verification.
- **Extension token flow** – Token is still in-memory only; no token restore on startup.
- **Widget open/close toggle** – Same icon click and message handling; only startup state is restored from storage.
- **Session system** – `initializeSessionState()` and session lifecycle (start/pause/resume/end, idle timeout) are unchanged.
- **Background messaging** – All `chrome.runtime.onMessage` handlers and content-script messaging are unchanged.
- **Popup, content script injection, widget injection** – Unchanged.

---

## 6. Lifecycle logs (development)

- `[ECHLY] extension installed or updated` – from `chrome.runtime.onInstalled`.
- `[ECHLY] service worker activated` – from `self.addEventListener("activate")`.
- `[ECHLY] service worker initialized` – after successful startup recovery (storage read, session init, broadcast).

These logs help confirm when the worker starts or restarts during development and that the startup recovery path ran.
