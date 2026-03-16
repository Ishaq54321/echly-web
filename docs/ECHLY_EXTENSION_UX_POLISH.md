# Echly Extension UX Polish (Loom-Style)

Improvements to extension usability without changing authentication architecture. Goal: Loom-style interaction (tray toggle, auth guard on actions).

---

## 1. Tray Toggle Flow

### Behavior

- **Extension icon click (user logged in)**  
  - First click: open tray (widget) in the active tab.  
  - Second click: close tray (hide widget).  
  - Toggle is driven by a single global flag in the background script.

### Implementation

- **Background (`echly-extension/src/background.ts`)**
  - `trayOpen` (boolean): `false` initially; set `true` when opening the widget, `false` when closing via icon.
  - `chrome.action.onClicked`:
    - If `trayOpen === true`: send `ECHLY_CLOSE_WIDGET` to the active tab, set `globalUIState.visible`/`expanded` to false, clear `echlyActive` in storage, broadcast state, set `trayOpen = false`, return.
    - Else: verify dashboard session; if invalid → open auth broker and return (do not set `trayOpen`).
    - Else: call `openWidgetInActiveTab()`, then set `trayOpen = true`.
  - When handling `ECHLY_OPEN_WIDGET` (e.g. from popup), set `trayOpen = true` before opening so state stays in sync.

- **Content (`echly-extension/src/content.tsx`)**
  - Message listener handles `ECHLY_CLOSE_WIDGET`: hide widget by setting the shadow host visibility to none (e.g. `setHostVisibility(false)` / `widgetRoot.style.display = "none"`).
  - Message listener handles `ECHLY_OPEN_WIDGET`: show widget (`setHostVisibility(true)` / `widgetRoot.style.display = "block"`) and dispatch open event as before.

### Test (User logged in)

1. Click extension icon → tray opens.  
2. Click extension icon again → tray closes.

---

## 2. Auth Guard Flow

### Helper: `ensureAuthenticated()`

- **Purpose**: Before starting a session or opening Previous Sessions, ensure the user is authenticated; if not, open the auth broker and abort the action.
- **Location**: Content script helper (e.g. in `content.tsx`).
- **Behavior**:
  - Request auth state from background (`ECHLY_GET_AUTH_STATE`).
  - If not authenticated (no user):
    - Send `ECHLY_TRIGGER_LOGIN` to background (opens auth broker).
    - Return `false`.
  - Else: return `true` so the caller can continue.

### Background: `ECHLY_TRIGGER_LOGIN`

- **Handler**: In `background.ts` message listener.
- **Behavior**:
  - If auth broker is already open (`authTabOpen`), respond and return.
  - Else: set `authTabOpen = true`, open auth broker tab (`chrome.tabs.create({ url: EXTENSION_AUTH_URL })`), respond.

This centralizes “open login” so both icon click (when session invalid) and in-tray actions (Start Session, Previous Sessions) use the same broker URL.

---

## 3. Button Authentication Behavior

### Start Session

- **Where**: Session UI (extension mode): “Start Session” triggers the start-session flow (e.g. create session, set active, enter session view).
- **Guard**: Before creating a session or doing any API call, call `ensureAuthenticated()`. If it returns `false`, do not create a session and do not open the session view; the user will see the auth broker tab.
- **Implementation**: `ensureAuthenticated` is passed into the session/CaptureWidget layer. In the Start Session click path (e.g. `startSession` in `useCaptureWidget`), call `await ensureAuthenticated()` first; if `false`, return. Otherwise proceed with `onCreateSession()` and the rest of the flow.

### Previous Sessions

- **Where**: “Previous Sessions” opens the list/modal that fetches sessions (e.g. `fetchSessions`).
- **Guard**: Before opening that UI or fetching sessions, ensure the user is authenticated. If not, trigger login and do not open the modal or fetch.
- **Implementation**:
  - **Option A (content script)**: When the content script receives `ECHLY_OPEN_PREVIOUS_SESSIONS` (from background/popup), first request auth state from background; if not authenticated, send `ECHLY_TRIGGER_LOGIN` and do not dispatch the event that opens the Previous Sessions modal. If authenticated, dispatch the event so the modal opens and can fetch sessions.
  - **Option B (background)**: When background receives a request that would lead to “open Previous Sessions,” check auth (e.g. `hydrateAuthState` / `currentUser`); if not authenticated, send a message that triggers opening the auth broker and do not forward the “open Previous Sessions” message to the tab.  
  The current implementation uses the content-script guard (Option A) so that “before fetching sessions” is enforced at the UI entry point.

### Extension icon (user logged out)

- **Behavior**: Clicking the extension icon when the dashboard session is invalid already opens the auth broker (unchanged). No tray is shown; `trayOpen` remains `false`.

---

## 4. Verification Checklist

| Test | Expected |
|------|----------|
| **1. User logged in** | Click extension → tray opens. Click again → tray closes. |
| **2. User logged out** | Click extension → login (auth broker) page opens, no tray. |
| **3. User logged out, Start Session** | Click Start Session in tray (if visible) or from a context that triggers it → login page opens. |
| **4. User logged out, Previous Sessions** | Click Previous Sessions → login page opens; modal does not open and sessions are not fetched. |

---

## 5. Files Touched

- `echly-extension/src/background.ts`: `trayOpen` state, icon click toggle, `ECHLY_CLOSE_WIDGET` path, `ECHLY_TRIGGER_LOGIN` handler, `ECHLY_OPEN_WIDGET` sets `trayOpen`.
- `echly-extension/src/content.tsx`: `ECHLY_CLOSE_WIDGET` handler (hide widget), `ensureAuthenticated()`, auth guard for `ECHLY_OPEN_PREVIOUS_SESSIONS`, pass `ensureAuthenticated` into session/CaptureWidget.
- Session UI / CaptureWidget: accept `ensureAuthenticated` prop; in Start Session handler, call `ensureAuthenticated()` before creating a session; Previous Sessions guard applied at content script when handling `ECHLY_OPEN_PREVIOUS_SESSIONS`.

This keeps authentication architecture unchanged while aligning extension behavior with Loom-style tray toggle and guarded session actions.
