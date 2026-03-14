# Echly Extension Click → Tray Visibility — Diagnostic Report

**Objective:** Determine why clicking the Chrome extension icon does NOT open the Echly tray.

**Expected flow:**
1. User clicks extension icon  
2. Background detects click  
3. Background sends `ECHLY_TOGGLE_VISIBILITY`  
4. Content script receives message  
5. Tray becomes visible  

**Finding:** The pipeline breaks at step 4: the content script never acts on `ECHLY_TOGGLE_VISIBILITY`. In addition, the background does not update its own visibility state on icon click, so no broadcast is sent.

---

## 1. Extension Click Pipeline Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  USER CLICKS EXTENSION ICON                                                      │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  MANIFEST: action has default_icon only, NO default_popup                         │
│  → chrome.action.onClicked DOES fire ✓                                            │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  BACKGROUND (background.ts)                                                      │
│  chrome.action.onClicked.addListener(async (tab) => { ... })                      │
│  → getAuthState()                                                                │
│  → if authenticated && tab?.id:                                                   │
│       chrome.tabs.sendMessage(tab.id, { type: "ECHLY_TOGGLE_VISIBILITY" })        │
│       .catch(() => {})  ← errors swallowed                                        │
│  → DOES NOT toggle globalUIState.visible                                          │
│  → DOES NOT call broadcastUIState()                                               │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                    Message: { type: "ECHLY_TOGGLE_VISIBILITY" }
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  CONTENT SCRIPT (content.tsx)                                                     │
│  chrome.runtime.onMessage.addListener((msg) => { ... })                           │
│  Handled types: ECHLY_FEEDBACK_CREATED, ECHLY_GLOBAL_STATE, ECHLY_TOGGLE,         │
│                ECHLY_RESET_WIDGET, ECHLY_SESSION_STATE_SYNC                      │
│  ❌ NO HANDLER for msg.type === "ECHLY_TOGGLE_VISIBILITY"                         │
│  → Message is received but IGNORED                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  TRAY VISIBILITY                                                                  │
│  Driven by ECHLY_GLOBAL_STATE only: setHostVisibility(getShouldShowTray(state))  │
│  No ECHLY_GLOBAL_STATE is sent after icon click → tray never shown                │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Manifest Click Configuration

**File:** `echly-extension/manifest.json`

| Item | Value |
|------|--------|
| **action** | Present; object with `default_icon` only |
| **default_popup** | **Not present** — no popup is defined |
| **default_icon** | `16`, `32`, `48` point to `assets/icon16.png`, `icon32.png`, `icon48.png` |
| **permissions** | `["identity", "storage", "activeTab", "tabs"]` |

**Conclusion:** A popup is **not** defined. `chrome.action.onClicked` is **not** blocked by a popup. The manifest is correctly set up for click-to-toggle behavior.

---

## 3. Background Click Handler Logic

**File:** `echly-extension/src/background.ts`  
**Location:** Lines 344–356

- **Listener exists:** Yes — `chrome.action.onClicked.addListener(async (tab) => { ... })`.
- **Logic on icon click:**
  1. `getAuthState()` is called (async).
  2. If `authState?.authenticated && tab?.id`:
     - Sends to the **tab** only: `chrome.tabs.sendMessage(tab.id, { type: "ECHLY_TOGGLE_VISIBILITY" })`.
     - Errors are swallowed: `.catch(() => {})`.
     - Returns (no other action).
  3. If not authenticated (or no tab.id):
     - Opens login tab with return URL.

- **Authentication:** Click handler only sends the message when the user is authenticated; otherwise it opens the login page.
- **Critical gap:** On icon click the background **does not**:
  - Toggle `globalUIState.visible`,
  - Call `broadcastUIState()`.

So the background’s source of truth never changes on icon click, and no `ECHLY_GLOBAL_STATE` is broadcast. The background **does** have a `chrome.runtime.onMessage` handler that, when it **receives** `ECHLY_TOGGLE_VISIBILITY` (e.g. from another context), toggles `globalUIState.visible` and calls `broadcastUIState()`. That path is **not** used when the user clicks the icon; the icon only sends a message **to** the tab.

---

## 4. Message Sent to Content Script

**File:** `echly-extension/src/background.ts`  
**Location:** Line 348

- **Code:**  
  `chrome.tabs.sendMessage(tab.id, { type: "ECHLY_TOGGLE_VISIBILITY" }).catch(() => {});`
- **Conditions:** Sent only when `authState?.authenticated && tab?.id`.
- **tab.id:** Used correctly as the target tab.
- **Error handling:** `.catch(() => {})` — failures are silent. If the content script is not injected (e.g. chrome://, edge://, or page loaded before the extension), `sendMessage` fails and the error is not logged.

**Conclusion:** The message is sent to the active tab when authenticated. Failures (e.g. content script not loaded) are not reported.

---

## 5. Content Script Message Listener Behavior

**File:** `echly-extension/src/content.tsx`  
**Location:** `ensureMessageListener()` — lines 1548–1589; listener at 1553.

The listener handles:

| Message type | Action |
|--------------|--------|
| `ECHLY_FEEDBACK_CREATED` | Dispatches custom event with ticket/sessionId |
| `ECHLY_GLOBAL_STATE` | `setHostVisibility(getShouldShowTray(state))`, applies state, dispatches event |
| `ECHLY_TOGGLE` | Dispatches `ECHLY_TOGGLE_WIDGET` custom event |
| `ECHLY_RESET_WIDGET` | Dispatches `ECHLY_RESET_WIDGET` event |
| `ECHLY_SESSION_STATE_SYNC` | Requests `ECHLY_GET_GLOBAL_STATE` from background and applies response |

**There is no branch for `ECHLY_TOGGLE_VISIBILITY`.**

The background sends `ECHLY_TOGGLE_VISIBILITY`, but the content script only handles `ECHLY_TOGGLE` (and others above). So when the user clicks the icon:

1. Background sends `{ type: "ECHLY_TOGGLE_VISIBILITY" }` to the content script.
2. Content script receives the message.
3. No `if (msg.type === "ECHLY_TOGGLE_VISIBILITY")` exists → no visibility change, no state request, no event.
4. Tray visibility is only updated when `ECHLY_GLOBAL_STATE` is received (with `state.visible` or session flags), which is never sent after the icon click.

**Conclusion:** The flow breaks here: the content script ignores `ECHLY_TOGGLE_VISIBILITY`.

---

## 6. Tray Visibility Logic

**File:** `echly-extension/src/content.tsx`

- **`getShouldShowTray(state)`** (lines 46–48):  
  `return state.visible === true || state.sessionModeActive === true || state.sessionPaused === true;`
- **`setHostVisibility(visible)`** (lines 39–43): Sets the host div’s `style.display` to `"block"` or `"none"`.

Visibility is **only** updated when:

1. A message with `msg.type === "ECHLY_GLOBAL_STATE"` and `msg.state` is received → `setHostVisibility(getShouldShowTray(state))`, or  
2. Same state is applied via `ECHLY_SESSION_STATE_SYNC` → fetch state then apply as above, or  
3. Initial sync or visibility-change refresh requests global state and applies it.

So the tray shows only when the content script receives and applies `ECHLY_GLOBAL_STATE` with `state.visible === true` (or session active/paused). There is no code path that reacts to `ECHLY_TOGGLE_VISIBILITY` to show the tray or request updated state.

**Conclusion:** Tray visibility logic is correct and driven by global state; the missing piece is that icon click never results in an `ECHLY_GLOBAL_STATE` update or any content-side handling of `ECHLY_TOGGLE_VISIBILITY`.

---

## 7. Content Script Injection

**File:** `echly-extension/manifest.json`  
**Section:** `content_scripts` (lines 36–41)

```json
"content_scripts": [
  {
    "matches": ["<all_urls>"],
    "js": ["content.js"],
    "run_at": "document_idle"
  }
]
```

- **matches:** `["<all_urls>"]` — injects into all normal web URLs.
- **run_at:** `document_idle` — script runs after DOM ready.

**Restrictions:** Content scripts do **not** run on:
- Chrome’s own pages (e.g. `chrome://`, `chrome-extension://` for other extensions),
- The Chrome Web Store,
- Some privileged/system pages.

So on normal websites, injection should occur. If the user clicks the icon on a tab where the content script has not yet run (e.g. very early after load) or on a restricted URL, `sendMessage` will fail and the error is swallowed.

---

## 8. Message Delivery Failures

**File:** `echly-extension/src/background.ts` (line 348)

- **Code:**  
  `chrome.tabs.sendMessage(tab.id, { type: "ECHLY_TOGGLE_VISIBILITY" }).catch(() => {});`
- **Behavior:** Any rejection (e.g. “Could not establish connection”, content script not injected) is caught and ignored. No logging, no retry, no fallback.

**Conclusion:** Delivery failures are silent. If the tray does not open, it is impossible to tell from logs whether the cause is “content script didn’t get the message” or “content script got the message but didn’t handle it.”

---

## 9. Possible Failure Points (Summary)

| # | Point | Status / Notes |
|---|--------|-----------------|
| 1 | Popup blocks onClick | **Not applicable** — no default_popup |
| 2 | Background onClick not firing | **Fires** — listener exists and runs when authenticated |
| 3 | Background sends wrong message type | Sends `ECHLY_TOGGLE_VISIBILITY` as designed |
| 4 | **Content script does not handle ECHLY_TOGGLE_VISIBILITY** | **Broken** — no handler; message ignored |
| 5 | **Background does not toggle state or broadcast on icon click** | **Broken** — no `globalUIState.visible` toggle, no `broadcastUIState()` |
| 6 | sendMessage fails (no content script) | Possible on restricted URLs or timing; errors swallowed |
| 7 | Auth check fails | If not authenticated, user is sent to login instead of toggle |

---

## 10. Top 5 Most Likely Causes (Ranked)

1. **Content script does not handle `ECHLY_TOGGLE_VISIBILITY`**  
   The background sends this type; the content script only handles `ECHLY_GLOBAL_STATE`, `ECHLY_TOGGLE`, etc. So the message is received and ignored. **Most likely primary cause.**

2. **Background does not update state or broadcast on icon click**  
   On icon click the background only sends a message to the tab. It does not set `globalUIState.visible` or call `broadcastUIState()`, so the content script never receives an `ECHLY_GLOBAL_STATE` that would make the tray visible. **Design/flow bug.**

3. **Message type mismatch**  
   Content handles `ECHLY_TOGGLE` (dispatches `ECHLY_TOGGLE_WIDGET`); background sends `ECHLY_TOGGLE_VISIBILITY`. Even if the intent was “toggle,” the types do not match, so the content never reacts.

4. **sendMessage fails silently**  
   On restricted pages or before injection, `sendMessage` fails and `.catch(() => {})` hides it. Could explain “no tray” on some tabs; does not explain it on normal pages where content script is loaded.

5. **User not authenticated**  
   If `getAuthState()` returns unauthenticated, the click opens the login tab instead of sending the toggle message. Would explain “tray never opens” only for logged-out users.

---

## 11. Summary

- **Manifest:** No popup; `chrome.action.onClicked` is used correctly.
- **Background:** Icon click sends `ECHLY_TOGGLE_VISIBILITY` to the current tab but does not toggle `globalUIState.visible` or call `broadcastUIState()`. Errors from `sendMessage` are swallowed.
- **Content script:** Does not handle `ECHLY_TOGGLE_VISIBILITY`. It only updates tray visibility on `ECHLY_GLOBAL_STATE` (and related sync paths). So the message sent on icon click has no effect.
- **Result:** Clicking the extension icon does not open the tray because (1) the content script ignores the message type sent by the background, and (2) the background never updates or broadcasts global state on that click.

**No code changes were made; this report is diagnostic only.**
