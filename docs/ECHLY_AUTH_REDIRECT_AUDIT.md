# Echly Extension Auth Redirect Flow — Diagnostic Audit

**Scope:** Diagnostic audit only. No code changes.  
**Goal:** Identify why login redirect only works once and why the widget does not open automatically after login.

---

## 1. Auth Tab Lifecycle & Guard State

### 1.1 Guard variable: `authTabOpen`

| Location | File | Line(s) |
|----------|------|--------|
| Declaration | `echly-extension/src/background.ts` | 98 |
| Set to `true` | same | 58, 260, 529, 886 |
| Set to `false` | same | 450, 485 |

**Where it is set to `true`:**

1. **Icon-click path** (when session invalid): `if (authTabOpen) return; authTabOpen = true; chrome.tabs.create({ url: EXTENSION_AUTH_URL });` (57–59). No callback → **`authBrokerTabId` is never set.**
2. **`getExtensionToken()`**: `authTabOpen = true` then `chrome.tabs.create(..., callback)` with callback that sets `authBrokerTabId` (260, 265–274).
3. **`ECHLY_OPEN_WIDGET`** (session invalid): `if (!authTabOpen) { authTabOpen = true; chrome.tabs.create({ url: EXTENSION_AUTH_URL }); }` (528–530). No callback → **`authBrokerTabId` is never set.**
4. **`ECHLY_TRIGGER_LOGIN`**: `authTabOpen = true; chrome.tabs.create(..., (tab) => { if (tab?.id) authBrokerTabId = tab.id; });` (886–889). Callback sets `authBrokerTabId`.

**When it is reset to `false`:**

1. **`chrome.tabs.onRemoved`**: Only when `tabId === authBrokerTabId` (447–450). Then `authBrokerTabId = null`, `authTabOpen = false`, and broker promise is rejected.
2. **`ECHLY_EXTENSION_TOKEN` handler**: After storing token (485). Then clears `brokerPromise` and, if `authBrokerTabId != null`, closes that tab.

**Does it reset when the login tab closes?**

- **Only if** the closed tab’s ID was stored in `authBrokerTabId`.
- When the auth tab is opened from the **icon-click path** or from **`ECHLY_OPEN_WIDGET`**, `chrome.tabs.create` is called **without a callback**, so `authBrokerTabId` remains `null`.
- Therefore when that auth tab is closed (user closes it or page calls `window.close()`), `onRemoved` runs with that tab’s ID, but `tabId === authBrokerTabId` is false (because `authBrokerTabId` is still `null`), so **`authTabOpen` is never cleared** in `onRemoved`.
- It is only cleared when the background receives **`ECHLY_EXTENSION_TOKEN`** (successful login). If the user closes the auth tab without logging in, **`authTabOpen` stays `true` indefinitely**.

**Conclusion:** The guard can remain stuck after the first flow when the auth tab was opened from a path that does not set `authBrokerTabId` (icon-click and `ECHLY_OPEN_WIDGET`). Closing that tab without completing login never resets `authTabOpen`.

### 1.2 Related state

- **`authBrokerTabId`** (96, 274, 448–449, 487–490, 888): Set only when `chrome.tabs.create` is invoked with a callback that assigns `tab?.id`. Used in `onRemoved` to clear `authTabOpen` and in `ECHLY_EXTENSION_TOKEN` to close the broker tab.
- **`brokerPromise`** (97, 261, 267, 450, 486): Used only in `getExtensionToken()`; not used by the icon-click or `ECHLY_OPEN_WIDGET` paths.

---

## 2. Auth Tab Creation

### 2.1 Where `/extension-auth` is opened

| Function / handler | Line(s) | Condition | Callback sets `authBrokerTabId`? |
|--------------------|--------|-----------|-----------------------------------|
| `chrome.action.onClicked` | 59 | `!sessionValid` and `!authTabOpen` | **No** |
| `getExtensionToken()` | 265 | Cache miss and either `!authTabOpen` or `brokerPromise == null` | **Yes** (274) |
| `ECHLY_OPEN_WIDGET` | 530 | `!sessionValid` and `!authTabOpen` | **No** |
| `ECHLY_TRIGGER_LOGIN` | 887 | `!authTabOpen` | **Yes** (888) |

### 2.2 Actual user flow (with default popup)

The manifest sets `"action": { "default_popup": "popup.html" }`, so a **click on the extension icon opens the popup**, not `action.onClicked`. The popup immediately sends **`ECHLY_OPEN_WIDGET`** and closes. So the path that normally opens `/extension-auth` when not logged in is **`ECHLY_OPEN_WIDGET`** (516–531), which:

- Verifies session; if invalid, clears token/user and, if `!authTabOpen`, sets `authTabOpen = true` and calls `chrome.tabs.create({ url: EXTENSION_AUTH_URL })` **with no callback**.
- Responds `{ ok: false, redirectToLogin: true }` and returns.

**Guards that prevent reopening:**

- `if (authTabOpen) return` in the icon-click path (56).
- `if (!authTabOpen) { authTabOpen = true; ... }` in `ECHLY_OPEN_WIDGET` (528–530) — so if `authTabOpen` is already true, no new tab is created.

So once `authTabOpen` is stuck `true` (e.g. user closed auth tab without logging in), the next click → popup → `ECHLY_OPEN_WIDGET` will **not** open a new auth tab.

---

## 3. Login Success Flow (extension-auth page)

### 3.1 Extension-auth page

**File:** `app/extension-auth/page.tsx`

- On load: `useEffect` runs, POSTs `/api/extension/session` with `credentials: "include"`.
- If **401**: `router.replace(\`/login?returnUrl=${encodeURIComponent("/extension-auth")}\`)` — redirects to login; after login user returns to `/extension-auth`, which runs the effect again.
- If **200** and body has `extensionToken`:  
  - `window.postMessage({ type: "ECHLY_EXTENSION_TOKEN", token: data.extensionToken, user: data.user }, "*")`  
  - Sets local `closed = true`  
  - `window.close()`

So the page **does** send the token to the extension via **`window.postMessage`**. It does **not** call `chrome.runtime.sendMessage` itself (that is done by the content script).

### 3.2 Session relay (content script)

**Files:** `echly-extension/src/sessionRelay.ts`, built as `sessionRelay.js`  
**Manifest:** Injected only on `http(s)://localhost:3000/extension-auth*`, `run_at: document_start`.

- Listens for `window` `message` events.
- If `event.data?.type === "ECHLY_EXTENSION_TOKEN"` and `event.data.token` is a string, calls  
  `chrome.runtime.sendMessage({ type: "ECHLY_EXTENSION_TOKEN", token, user: event.data.user }).catch(() => {})`.

So the extension receives the token via **`chrome.runtime.sendMessage`** from the content script, not directly from the page.

### 3.3 Does any message instruct the extension to open the widget after login?

**No.** The page and relay only send `ECHLY_EXTENSION_TOKEN` with `token` (and `user`). There is no separate message or payload field that tells the background to open the widget.

---

## 4. Background Token Handler (`ECHLY_EXTENSION_TOKEN`)

**File:** `echly-extension/src/background.ts` (463–493)

**What it does:**

1. Validates `request.token` (string, non-empty).
2. Stores token: `extensionToken`, `extensionTokenExpiresAt`, `setExtensionToken(token)`, `sw.extensionToken = token`.
3. If `request.user?.uid`, sets `sw.currentUser` and `cachedSessionUser`.
4. If `tokenBrokerResolve` exists, resolves the broker promise and clears resolve/reject.
5. Sets **`authTabOpen = false`** and **`brokerPromise = null`**.
6. If **`authBrokerTabId != null`**, calls `chrome.tabs.remove(authBrokerTabId)` and sets `authBrokerTabId = null`.

**What it does not do:**

- Does **not** call `openWidgetInActiveTab()`.
- Does **not** set `trayOpen = true`.
- Does **not** send any message to the original tab to show the widget.

So after a successful login, the background only updates token/user and optionally closes the broker tab; it does **not** open the widget in the tab where the user clicked (e.g. `sw.lastUserTabId`).

---

## 5. Redirect Behavior After Login

- **Does `/extension-auth` close itself?** Yes — after sending the token it calls `window.close()` (page line 49).
- **Does it redirect back to the original tab?** Not explicitly. The browser simply focuses another tab when the auth tab is closed; the “original” tab is whichever was active when the user clicked the icon (and was stored in `sw.lastUserTabId` by the handler that opened the auth flow).
- **Does it notify the background?** Yes — via `postMessage` → session relay → `chrome.runtime.sendMessage(ECHLY_EXTENSION_TOKEN)`.

So the background is notified and clears state and stores the token, but does not trigger the widget to open in the original tab.

---

## 6. Root Cause Analysis

### 6.1 Why login redirect only works once

- The auth tab is opened from **icon → popup → ECHLY_OPEN_WIDGET** (or from **action.onClicked** if the popup were removed) with **`chrome.tabs.create({ url: EXTENSION_AUTH_URL })` and no callback**, so **`authBrokerTabId` is never set** for that tab.
- When that tab is **closed without the user completing login** (user closes tab or navigates away), `chrome.tabs.onRemoved` fires with that tab’s ID, but the handler only clears `authTabOpen` when `tabId === authBrokerTabId`. Since `authBrokerTabId` is still `null`, **`authTabOpen` is never reset** and remains `true`.
- On the next icon click, popup sends `ECHLY_OPEN_WIDGET` again. Session is still invalid, but the code only opens a new auth tab when `!authTabOpen`. Because `authTabOpen` is stuck `true`, **no new tab is created** and the user is not sent to login again until the extension is reloaded (service worker restarts and `authTabOpen` is re-initialized to `false`).

So: **login redirect “only works once” when the user closes the auth tab without completing login**, leaving `authTabOpen` true and no way to clear it except extension reload, because the tab that closed was never recorded in `authBrokerTabId`.

### 6.2 Why the widget does not open automatically after login

- After successful login, the extension-auth page sends the token via `postMessage` → relay → **`ECHLY_EXTENSION_TOKEN`**.
- The background handler for **`ECHLY_EXTENSION_TOKEN`** only stores the token/user, clears `authTabOpen`/broker state, and optionally closes the broker tab. It **does not** call `openWidgetInActiveTab()` or set `trayOpen = true` or send a message to open the widget.
- So the user ends up back on the original tab (because the auth tab closed) with a valid token and tray still closed; they must click the icon again to trigger `ECHLY_OPEN_WIDGET` and finally open the widget.

So: **the widget does not open automatically because the success path never triggers the widget open logic.**

---

## 7. Fix Plan (minimal, preserve architecture)

### 7.1 Fix A — Reset `authTabOpen` when the auth tab closes

**Problem:** When the auth tab is opened from the icon path or `ECHLY_OPEN_WIDGET`, `authBrokerTabId` is never set, so closing that tab does not clear `authTabOpen`.

**Change:** Whenever the background opens the `/extension-auth` tab, set `authBrokerTabId` so that `onRemoved` can clear state when that tab is closed.

- **`chrome.action.onClicked`** (lines 58–59): Change to  
  `chrome.tabs.create({ url: EXTENSION_AUTH_URL }, (tab) => { if (tab?.id) authBrokerTabId = tab.id; });`
- **`ECHLY_OPEN_WIDGET`** (lines 529–530): Same — use the two-argument form of `chrome.tabs.create` and in the callback set `authBrokerTabId = tab?.id ?? null`.

Optionally, in `onRemoved`, when clearing state for the broker tab, only reject the broker promise if it exists; the icon/OPEN_WIDGET path does not use `brokerPromise`, so clearing `authTabOpen` and `authBrokerTabId` is enough. Current code already guards with `if (tokenBrokerReject)` before rejecting.

**Result:** Closing the auth tab (with or without logging in) will clear `authTabOpen` and allow the next icon click to open a new auth tab when needed.

### 7.2 Fix B — Open widget automatically after receiving the extension token

**Problem:** The `ECHLY_EXTENSION_TOKEN` handler does not open the widget in the tab where the user initiated the flow.

**Change:** In the `ECHLY_EXTENSION_TOKEN` handler in `background.ts`, after storing the token and closing the broker tab (existing logic), add:

1. Set `trayOpen = true`.
2. Call `openWidgetInActiveTab()` (or equivalent logic that uses `sw.lastUserTabId` to inject and send `ECHLY_OPEN_WIDGET` to that tab).

Ensure `sw.lastUserTabId` is set when the auth flow is started. This is already done in:
- `action.onClicked` (line 37),
- `ECHLY_OPEN_WIDGET` (line 520),

so the tab where the user clicked is already recorded before the auth tab is created. After login, that tab is still the intended target.

**Result:** After successful login and token receipt, the widget opens in the original tab without a second icon click.

### 7.3 Desired flow after fixes

1. User clicks extension icon → popup opens and sends `ECHLY_OPEN_WIDGET`.
2. Background verifies session; if invalid, sets `authBrokerTabId` (new), sets `authTabOpen = true`, opens `/extension-auth`.
3. User is redirected to login, signs in, returns to `/extension-auth`.
4. Extension-auth gets token, `postMessage` → relay → background receives `ECHLY_EXTENSION_TOKEN`.
5. Background stores token, sets `authTabOpen = false`, closes broker tab; **then** sets `trayOpen = true` and calls `openWidgetInActiveTab()` (Fix B).
6. Widget opens in the tab stored in `lastUserTabId` (where the user clicked).

If the user closes the auth tab without logging in, `onRemoved` clears `authBrokerTabId` and `authTabOpen` (Fix A), so the next icon click can open the auth tab again.

---

## Summary Table

| Item | Finding |
|------|--------|
| **Auth guard** | `authTabOpen`; reset in `onRemoved` only when `tabId === authBrokerTabId`; not set when auth tab opened from icon / `ECHLY_OPEN_WIDGET` → can stay true when tab closed without login. |
| **Auth tab creation** | Icon path and `ECHLY_OPEN_WIDGET` use `chrome.tabs.create` without callback → `authBrokerTabId` never set. |
| **Login success** | Page uses `window.postMessage`; relay uses `chrome.runtime.sendMessage(ECHLY_EXTENSION_TOKEN)`. No message to open widget. |
| **Token handler** | Stores token, clears `authTabOpen`, closes broker tab; does **not** open widget or set `trayOpen`. |
| **Redirect only once** | Auth tab closed without login leaves `authTabOpen` true and `authBrokerTabId` null → `onRemoved` never clears → next open blocked. |
| **Widget not auto-open** | `ECHLY_EXTENSION_TOKEN` handler never calls `openWidgetInActiveTab()` or sets `trayOpen`. |
| **Fix A** | Set `authBrokerTabId` in callback whenever opening `/extension-auth` (icon and `ECHLY_OPEN_WIDGET`). |
| **Fix B** | In `ECHLY_EXTENSION_TOKEN`, after storing token and closing tab, set `trayOpen = true` and call `openWidgetInActiveTab()`. |
