# Echly Extension Auth Redirect — Fix Report

**Scope:** State-handling fixes only. No architecture or auth logic changes.  
**Reference:** [ECHLY_AUTH_REDIRECT_AUDIT.md](./ECHLY_AUTH_REDIRECT_AUDIT.md)

---

## 1. Auth Tab Lifecycle

### 1.1 Guard and tab tracking

| Variable           | Purpose |
|-------------------|--------|
| `authTabOpen`     | Guard: prevents opening multiple `/extension-auth` tabs. |
| `authBrokerTabId` | Tab ID of the current auth tab; used by `chrome.tabs.onRemoved` to reset the guard when that tab closes. |

### 1.2 When the auth tab is opened

Whenever the background opens `/extension-auth`, it now:

1. Sets `authTabOpen = true`.
2. Calls `chrome.tabs.create({ url: EXTENSION_AUTH_URL }, callback)`.
3. In the callback, sets `authBrokerTabId = tab?.id` so the new tab is tracked.

**Locations updated (Fix A):**

- **`chrome.action.onClicked`** — When session is invalid, creates auth tab with callback that sets `authBrokerTabId`.
- **`ECHLY_OPEN_WIDGET`** — When session is invalid and `!authTabOpen`, creates auth tab with same callback.
- **`getExtensionToken()`** — Already used a callback that sets `authBrokerTabId`; unchanged.
- **`ECHLY_TRIGGER_LOGIN`** — Already used a callback that sets `authBrokerTabId`; unchanged.

### 1.3 When the auth tab is closed

**`chrome.tabs.onRemoved`** (unchanged logic, now effective in all flows):

- If `tabId === authBrokerTabId`:
  - `authBrokerTabId = null`
  - `authTabOpen = false`
  - `brokerPromise = null`
  - If `tokenBrokerReject` exists, reject the broker promise.

Because every auth-tab creation now sets `authBrokerTabId`, closing the login tab (with or without logging in) always clears `authTabOpen`. The next extension click can open the login page again.

---

## 2. Redirect Flow

### 2.1 Logged-out user clicks extension icon

1. Popup opens and sends **`ECHLY_OPEN_WIDGET`** (default manifest uses popup).
2. Background handles `ECHLY_OPEN_WIDGET`:
   - Sets `sw.lastUserTabId` from active tab (tab where user clicked).
   - Verifies dashboard session → invalid.
   - Clears token/user.
   - If `!authTabOpen`: sets `authTabOpen = true`, creates auth tab with callback that sets `authBrokerTabId`.
3. Response: `{ ok: false, redirectToLogin: true }`.
4. User sees `/extension-auth` (and may be redirected to login).

### 2.2 User closes login tab without logging in

1. User closes the auth tab.
2. `chrome.tabs.onRemoved` runs with that tab’s ID.
3. Because `authBrokerTabId` was set when the tab was created, `tabId === authBrokerTabId` is true.
4. Background sets `authBrokerTabId = null`, `authTabOpen = false`.
5. Next time the user clicks the extension icon, `authTabOpen` is false, so a new auth tab is created and the login page opens again.

---

## 3. Login Success Flow

### 3.1 From extension-auth to background

1. User completes login; returns to `/extension-auth`.
2. Extension-auth page gets token from backend, then:
   - `window.postMessage({ type: "ECHLY_EXTENSION_TOKEN", token, user }, "*")`
   - `window.close()`
3. Session relay (content script on extension-auth) receives the message and sends **`ECHLY_EXTENSION_TOKEN`** to the background via `chrome.runtime.sendMessage`.

### 3.2 Background `ECHLY_EXTENSION_TOKEN` handler (Fix B)

After validating and storing the token, the handler:

1. **State reset:** `authTabOpen = false`, `brokerPromise = null`.
2. **Close auth tab:** If `authBrokerTabId != null`, `chrome.tabs.remove(authBrokerTabId)`, then `authBrokerTabId = null`.
3. **Widget auto-open (new):**
   - `trayOpen = true`
   - `globalUIState.visible = true`
   - `openWidgetInActiveTab()` (uses `sw.lastUserTabId` so the widget opens in the tab where the user originally clicked)
   - `broadcastUIState()` so content scripts stay in sync.

Result: after successful login, the auth tab closes and the widget opens in the original tab without a second click.

---

## 4. Widget Auto-Open Flow

### 4.1 How the “original” tab is chosen

- **Icon click path:** `chrome.action.onClicked` sets `sw.lastUserTabId` from the active tab before opening the auth tab.
- **Popup path:** When the popup sends `ECHLY_OPEN_WIDGET`, the handler sets `sw.lastUserTabId` from `chrome.tabs.query({ active: true, currentWindow: true })` (the tab that was active when the user clicked the icon and the popup appeared).

So `lastUserTabId` always refers to the tab where the user initiated the flow.

### 4.2 What `openWidgetInActiveTab()` does

- Sets `echlyActive: true` in storage.
- Sets `globalUIState.visible = true`, `globalUIState.expanded = true`.
- Calls `broadcastUIState()`.
- Uses `sw.lastUserTabId` to inject the content script if needed and send **`ECHLY_OPEN_WIDGET`** to that tab.

So after login, the widget opens in the same tab that was used to start the auth flow.

### 4.3 State consistency after login

After the token handler runs (including Fix B):

| State                | Value        |
|----------------------|-------------|
| `authTabOpen`        | `false`     |
| `authBrokerTabId`    | `null`      |
| `trayOpen`           | `true`      |
| `globalUIState.visible` | `true`  |

`broadcastUIState()` is called so all content scripts see the updated UI state.

---

## 5. Expected Final Behavior

### Scenario 1 — Logged out

- User clicks extension icon → `/extension-auth` opens → login page shown.
- User closes login tab without logging in → next click still opens the login page (guard resets via `onRemoved`).

### Scenario 2 — Successful login

- User clicks extension icon → login page.
- User completes login → auth tab closes → widget opens automatically in the original tab (no second click).

### Scenario 3 — Logged in

- User clicks extension icon → widget opens.
- User clicks again → widget closes.

---

## 6. Summary of Code Changes

| Fix | File            | Change |
|-----|-----------------|--------|
| **A** | `background.ts` | `chrome.action.onClicked`: use `chrome.tabs.create(..., callback)` and set `authBrokerTabId` in callback. |
| **A** | `background.ts` | `ECHLY_OPEN_WIDGET`: use `chrome.tabs.create(..., callback)` and set `authBrokerTabId` in callback. |
| **B** | `background.ts` | `ECHLY_EXTENSION_TOKEN` handler: after storing token and closing auth tab, set `trayOpen = true`, `globalUIState.visible = true`, call `openWidgetInActiveTab()`, then `broadcastUIState()`. |

No changes to auth logic, extension-auth page, session relay, or message contracts; only background state handling was updated.
