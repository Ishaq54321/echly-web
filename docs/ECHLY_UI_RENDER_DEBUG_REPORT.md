# Echly UI Render Debug Report

**Objective:** Identify the exact reason why the Echly extension recording logic works but the UI tray (shadow DOM widget) does not appear on some tabs.

**Constraint:** Audit only. No code was modified.

---

## STEP 1 — Content script injection

### manifest.json

| Item | Value |
|------|--------|
| **File** | `echly-extension/manifest.json` |
| **Lines** | 12–17 |
| **Method** | `content_scripts` (declarative) |
| **When triggered** | Automatically by the browser when a tab loads a matching URL |

```json
"content_scripts": [
  {
    "matches": ["<all_urls>"],
    "js": ["content.js"],
    "run_at": "document_idle"
  }
]
```

### background.ts / background.js

| Item | Value |
|------|--------|
| **File** | `echly-extension/src/background.ts` (compiled to `background.js`) |
| **Finding** | No `chrome.scripting.executeScript` or any programmatic content script injection. |
| **Method** | N/A — content script is **not** injected manually from the background. |

### Summary

| Question | Answer |
|----------|--------|
| Does the content script load automatically on every page? | **Yes** — via manifest `content_scripts` with `"matches": ["<all_urls>"]`. |
| Is the script injected manually? | **No** — only declarative injection. |
| Can multiple injections occur? | **No** — one entry, one script; the `window.__ECHLY_WIDGET_LOADED__` guard prevents running `main()` twice in the same page. |
| Exact injection timing | **`run_at: "document_idle"`** — after DOM is ready, timing not guaranteed before `document.body` exists and before the user can click the extension icon. |

**Note:** Content scripts do **not** run on restricted URLs (e.g. `chrome://`, `edge://`, Chrome Web Store, `chrome-extension://`). On those tabs, `chrome.tabs.sendMessage` will fail and errors are swallowed (`.catch(() => {})`).

---

## STEP 2 — Duplicate content script guard

### Where `window.__ECHLY_WIDGET_LOADED__` is defined

| Item | Value |
|------|--------|
| **File** | `echly-extension/src/content.tsx` |
| **Lines** | 6–9 (type declaration), 1714–1715 (assignment) |

```tsx
// Declaration (lines 6–9)
declare global {
  interface Window {
    __ECHLY_WIDGET_LOADED__?: boolean;
  }
}

// Assignment (lines 1711–1716)
if (window.__ECHLY_WIDGET_LOADED__) {
  console.debug("[ECHLY] widget already injected");
} else {
  window.__ECHLY_WIDGET_LOADED__ = true;
  main();
}
```

### Where it is checked

| Item | Value |
|------|--------|
| **File** | `echly-extension/src/content.tsx` |
| **Line** | 1711 |

Single check: at script load, before any host creation or UI mounting.

### Does it prevent double injection?

| Question | Answer |
|----------|--------|
| Prevents double injection? | **Yes** — if the script runs again in the same page (e.g. duplicate injection), the guard skips `main()` and only logs. |
| Executes before UI mounting? | **Yes** — the guard runs at top-level; `main()` (which creates the host and mounts React) runs only in the `else` branch. |

**Conclusion:** The guard correctly prevents double mount in a single page. It does **not** address the case where the tray never appears (e.g. message not received or visibility gated by `trayEverOpenedInThisTab`).

---

## STEP 3 — UI host mounting

### Host creation and append

| Item | Value |
|------|--------|
| **File** | `echly-extension/src/content.tsx` |
| **Lines** | 1681–1702 (creation and append) |

**Host creation (lines 1683–1696):**

```tsx
let host = document.getElementById(SHADOW_HOST_ID) as HTMLDivElement | null;
if (!host) {
  host = document.createElement("div");
  host.id = SHADOW_HOST_ID;                    // id: "echly-shadow-host"
  host.setAttribute("data-echly-ui", "true");
  host.style.position = "fixed";
  host.style.bottom = "24px";
  host.style.right = "24px";
  host.style.width = "auto";
  host.style.height = "auto";
  host.style.zIndex = "2147483647";
  host.style.display = "none";
  host.style.pointerEvents = "none";
  host.style.visibility = "hidden";

  waitForBody(() => {
    document.body.appendChild(host!);
    mountReactApp(host!);
    ensureMessageListener(host!);
    syncInitialGlobalState(host!);
  });
}
```

### HOST MOUNT summary

| Property | Value |
|----------|--------|
| **File** | `echly-extension/src/content.tsx` |
| **Lines** | 1684–1699 (create), 1698 (append) |
| **Host id** | `echly-shadow-host` (`SHADOW_HOST_ID`) |
| **Append target** | `document.body` (inside `waitForBody` callback) |
| **Initial styles** | |
| `display` | `none` |
| `visibility` | `hidden` |
| `pointer-events` | `none` |
| `z-index` | `2147483647` |

The host is created **hidden** and is only shown when `ECHLY_OPEN_WIDGET` is received (or when `setHostVisibility(true)` is called after `trayEverOpenedInThisTab` is true).

---

## STEP 4 — Host removal

### Searches performed

- `removeChild` — not used on the host in the extension code.
- `innerHTML =` — not used to clear `body` or the host in the extension.
- `document.body.innerHTML` — not used.
- React unmount — no explicit `root.unmount()` on the content script root; React tree stays mounted.
- `MutationObserver` — used only in `waitForBody` to wait for `document.body` (observe `document.documentElement`, then disconnect and run callback). It does **not** remove the host.

### Conclusion

**No extension code removes the host.** The host can be lost if:

1. **SPA / framework replaces `document.body`** — e.g. full-document replacement. The host is appended to `body`; if the page replaces `body`, the host node is removed. This is page-dependent, not extension logic.
2. **Navigation** — same-origin or client-side navigation may replace the document and re-run the content script; the guard prevents double mount, but a new document gets a new host (normal behavior).

No explicit host removal was found in the extension.

---

## STEP 5 — Shadow DOM mounting

### Where shadow root is created

| Item | Value |
|------|--------|
| **File** | `echly-extension/src/content.tsx` |
| **Line** | 1504 (inside `mountReactApp`) |

```tsx
const shadowRoot = host.attachShadow({ mode: "open" });
```

### Where React root mounts

| Item | Value |
|------|--------|
| **File** | `echly-extension/src/content.tsx` |
| **Lines** | 1507–1521 |

Container is created, styled, appended to `shadowRoot`, then React mounts:

```tsx
const container = document.createElement("div");
container.id = ROOT_ID;  // "echly-root"
// ... styles and data-theme ...
shadowRoot.appendChild(container);
const reactRoot = createRoot(container);
reactRoot.render(<ContentApp widgetRoot={container} initialTheme={initialTheme} />);
```

### Is `mountReactApp` always executed?

- **When host is created:** Yes — it is called from the `waitForBody` callback after `document.body.appendChild(host!)` (line 1700).
- **When host already exists:** No — the `else` branch (lines 1704–1706) only calls `ensureMessageListener(host)` and `syncInitialGlobalState(host)`. It does **not** call `mountReactApp` again (by design; single mount).

### Order of operations

1. Host created (or reused via `getElementById`).
2. Host appended to `document.body` (only if newly created, inside `waitForBody`).
3. `mountReactApp(host)` → `injectPageStyles()` → `host.attachShadow({ mode: "open" })` → `injectShadowStyles(shadowRoot)` → create container → append to shadow root → `createRoot(container).render(<ContentApp ... />)`.
4. `ensureMessageListener(host)` and `syncInitialGlobalState(host)`.

So: **host created → host appended → shadow root attached → React root created.** Order is correct when the host is first created and `waitForBody` has run.

---

## STEP 6 — Widget visibility logic

### setHostVisibility / setHostVisibilityFromState

| Item | Value |
|------|--------|
| **File** | `echly-extension/src/content.tsx` |
| **setHostVisibility** | Lines 49–56 |
| **setHostVisibilityFromState** | Lines 59–62 |
| **getShouldShowTray** | Lines 65–67 |

```tsx
function setHostVisibility(visible: boolean): void {
  const host = document.getElementById(SHADOW_HOST_ID) as HTMLDivElement | null;
  if (host) {
    host.style.display = visible ? "block" : "none";
    host.style.pointerEvents = visible ? "auto" : "none";
    host.style.visibility = visible ? "visible" : "hidden";
  }
}

function setHostVisibilityFromState(state: GlobalUIState): void {
  if (!trayEverOpenedInThisTab) return;   // ← CRITICAL: early return
  setHostVisibility(getShouldShowTray(state));
}

function getShouldShowTray(state: GlobalUIState): boolean {
  return state.visible === true || state.sessionModeActive === true || state.sessionPaused === true;
}
```

### When `trayEverOpenedInThisTab` is set to true

| Item | Value |
|------|--------|
| **File** | `echly-extension/src/content.tsx` |
| **Line** | 1596 (inside the `chrome.runtime.onMessage` listener when `msg.type === "ECHLY_OPEN_WIDGET"`) |

So **only** receipt of the `ECHLY_OPEN_WIDGET` message sets `trayEverOpenedInThisTab = true` and then shows the host (lines 1596–1600).

### VISIBLE STATE FLOW

| Item | Value |
|------|--------|
| **Default visible** | `false` — host starts with `display: none`, `visibility: hidden`. |
| **State update trigger** | Background sets `globalUIState.visible = true` and calls `broadcastUIState()` on icon click / open widget; then sends `ECHLY_OPEN_WIDGET` to the **active** tab only. |
| **When visible becomes true** | In background: `openWidgetInActiveTab()` (e.g. line 266 in background.ts). In content: when handling `ECHLY_OPEN_WIDGET`, host is shown and `trayEverOpenedInThisTab = true`. |
| **When expanded becomes true** | Same flow; background sets `globalUIState.expanded = true` and broadcasts. |
| **Condition blocking UI** | **`!trayEverOpenedInThisTab`** in `setHostVisibilityFromState` — if this tab never received `ECHLY_OPEN_WIDGET`, all later `ECHLY_GLOBAL_STATE` or visibility refreshes do nothing for the host (early return). |

---

## STEP 7 — Background → content messaging

### Message flow

**Background → content (relevant messages):**

| Message | When sent | Target |
|---------|-----------|--------|
| `ECHLY_OPEN_WIDGET` | Icon click or popup open widget | **Active tab only** (`chrome.tabs.query({ active: true, currentWindow: true })` → `sendMessage(tabs[0].id, ...)`) |
| `ECHLY_GLOBAL_STATE` | After state change (`broadcastUIState()`), on tab activated, on tab created | All tabs (broadcast) or single tab (onActivated / onCreated) |
| `ECHLY_SESSION_STATE_SYNC` | On tab activated | Newly active tab |

**Content → background:**

- `ECHLY_GET_GLOBAL_STATE` — content requests state (e.g. on load, visibilitychange, ECHLY_SESSION_STATE_SYNC).
- `ECHLY_OPEN_WIDGET` — from popup; background then calls `openWidgetInActiveTab()` and sends `ECHLY_OPEN_WIDGET` to active tab.

### Delivery and tab switch

- **`chrome.tabs.sendMessage(tabId, ...).catch(() => {})`** — used everywhere. Failures (e.g. no content script, restricted URL, or listener not yet attached) are **silently ignored**.
- **Tab switch:** On `chrome.tabs.onActivated`, background sends `ECHLY_GLOBAL_STATE` and `ECHLY_SESSION_STATE_SYNC` to the **newly active** tab. That tab’s content script applies state only via `setHostVisibilityFromState`, which **does nothing** if `trayEverOpenedInThisTab` is false.

So: **messages are sent on tab switch, but showing the tray on the newly focused tab depends on that tab having previously received `ECHLY_OPEN_WIDGET`** (which is only sent to the active tab at click time).

---

## STEP 8 — Tray rendering condition

### Component

- **Component:** `<CaptureWidget>` inside `<ContentApp>`.
- **File:** `echly-extension/src/content.tsx`, lines 1404–1429 (CaptureWidget usage), 131–1521 (ContentApp).

### Render conditions

- **ContentApp:** Always rendered once the content script has run and `mountReactApp` has been called (no conditional around `<ContentApp>`).
- **CaptureWidget:** Rendered unconditionally inside ContentApp; visibility of the **host** is controlled at the DOM level (`setHostVisibility`), not by conditional React render.
- **Auth:** ContentApp uses `user` and `authChecked`; CaptureWidget receives `userId={user.uid}`. Unauthenticated users still get the widget DOM; auth affects what the widget shows (e.g. “Sign in from extension”), not whether the host exists.
- **Session:** `sessionId={effectiveSessionId ?? ""}`; no requirement that a session exist for the tray to render. Recording can start from the tray when a session is selected; background handles “No active session” for `START_RECORDING`.

### TRAY RENDER CONDITION summary

| Item | Value |
|------|--------|
| **Component** | `ContentApp` → `CaptureWidget` |
| **Render if** | Host exists and React has mounted (single mount in `mountReactApp`). No extra condition for “tray” vs “no tray” in React. |
| **Auth** | Not required for host to be visible; unauthenticated state is shown inside the widget. |
| **Session** | Not required for tray to appear; required for recording (handled in background). |

The **visible/invisible** behavior is entirely from the **host** element’s `display`/`visibility`/`pointer-events`, driven by `setHostVisibility` / `setHostVisibilityFromState`, which in turn are gated by **`trayEverOpenedInThisTab`** and `ECHLY_OPEN_WIDGET`.

---

## STEP 9 — Hidden host (CSS)

### Host styles (content script)

- Set in `content.tsx` when creating the host (lines 1687–1695) and when showing/hiding (lines 49–56, 1597–1599).
- **Initial:** `display: none`, `visibility: hidden`, `pointer-events: none`, `z-index: 2147483647`.
- **When shown (ECHLY_OPEN_WIDGET):** `display: block`, `pointer-events: auto`, `visibility: visible`.

No other extension code overwrites these. Page CSS could theoretically affect the host (e.g. `display: none` on a parent), but the host is a direct child of `body` with very high z-index; the main issue is that **the extension never calls `setHostVisibility(true)` (or equivalent) on some tabs** because of `trayEverOpenedInThisTab`.

---

## STEP 10 — Recording trigger path

### Path: UI click → content → background → recording state

1. **UI click (start recording):** User starts recording from the tray (CaptureWidget).  
   **File:** `echly-extension/src/content.tsx`, `onRecordingChange` (lines 319–336). When `recording === true`, it sends `{ type: "START_RECORDING" }` to the background.

2. **Content script:** `chrome.runtime.sendMessage({ type: "START_RECORDING" }, callback)`.

3. **Background:** Handles `START_RECORDING` (e.g. `echly-extension/src/background.ts`, lines 625–434): checks `activeSessionId`, sets `globalUIState.isRecording = true`, `broadcastUIState()`, `resetSessionIdleTimer()`, `sendResponse({ ok: true })`.

4. **Recording state:** Held in background; broadcast to all tabs via `ECHLY_GLOBAL_STATE`. Recording (e.g. media) is handled separately; feedback submission uses `ECHLY_PROCESS_FEEDBACK` from content to background.

### Why recording can work while the tray is missing

- **START_RECORDING** is sent from the **content script** (from the tray’s `onRecordingChange`). So if the user starts recording, they did so from a tab where the tray **was** visible and the content script was running.
- On **another** tab, the tray may not appear because:
  - That tab never received `ECHLY_OPEN_WIDGET` (it wasn’t active when the user opened the widget), so `trayEverOpenedInThisTab` is false and `setHostVisibilityFromState` never shows the host, or
  - The content script wasn’t loaded yet or `sendMessage` failed (e.g. restricted URL), so the tray never opened there.

So: **recording works on the tab where the user opened the widget and started recording; the “some tabs” where the tray doesn’t appear are those that never received `ECHLY_OPEN_WIDGET` or where the content script/listener wasn’t ready.**

---

## STEP 11 — Race conditions

### 1. Message before listener registered

- **Sequence:** Content script runs → `main()` → host created → `waitForBody(callback)` → (user clicks icon before `document.body` exists) → background sends `ECHLY_OPEN_WIDGET` to active tab → content script’s listener is only registered inside `waitForBody`’s callback → callback hasn’t run yet → **message is lost** (no listener).
- **Result:** Tray never opens on that tab until the user opens the widget again after the page has a body and the listener is attached.

### 2. Content script not loaded yet

- **Sequence:** User opens a new tab or switches to a tab that just loaded → clicks extension icon immediately → `chrome.tabs.sendMessage(activeTabId, { type: "ECHLY_OPEN_WIDGET" })` runs → content script may not have run yet (`document_idle` not fired) → **sendMessage fails** (e.g. “Could not establish connection. Receiving end does not exist”) → error swallowed by `.catch(() => {})`.
- **Result:** That tab never receives `ECHLY_OPEN_WIDGET`; `trayEverOpenedInThisTab` stays false; later `ECHLY_GLOBAL_STATE` does not show the tray.

### 3. Tab that was not active when the user clicked

- **Sequence:** User has Tab A and Tab B. User clicks icon (or popup “open widget”) while Tab A is active → background sends `ECHLY_OPEN_WIDGET` only to Tab A → Tab A sets `trayEverOpenedInThisTab = true` and shows the host. User switches to Tab B → background sends `ECHLY_GLOBAL_STATE` (and optionally `ECHLY_SESSION_STATE_SYNC`) to Tab B → Tab B’s `setHostVisibilityFromState(state)` runs but **returns early** because `trayEverOpenedInThisTab` is false on Tab B.
- **Result:** Tab B never shows the tray even though global state has `visible: true`. This is the **primary design cause** for “tray does not appear on some tabs.”

### 4. Restricted URLs

- On `chrome://`, `edge://`, etc., the content script never runs, so no host and no listener. `sendMessage` fails silently. Tray can never appear there.

---

## STEP 12 — Root cause analysis (summary)

### 1. Content script injection

- Single injection via manifest `content_scripts`, `run_at: "document_idle"`, no programmatic injection. No injection on restricted URLs. Timing can be after the user has already clicked the icon.

### 2. Host mounting

- Host is created once, appended to `document.body` inside `waitForBody`. If `body` isn’t present yet, append and listener registration are delayed, so `ECHLY_OPEN_WIDGET` can be sent before the listener exists.

### 3. Shadow DOM mount

- Order is correct: host → append → `attachShadow` → React root. `mountReactApp` runs only when the host is first created (in the `waitForBody` callback).

### 4. React render

- ContentApp/CaptureWidget render once after mount; no condition that would prevent the tray from rendering. Visibility is controlled by the host’s styles, not by React conditional render.

### 5. Visibility state

- **Critical:** Tray visibility on a tab is gated by **`trayEverOpenedInThisTab`**. That flag is set to `true` **only** when that tab’s content script handles **`ECHLY_OPEN_WIDGET`**. `ECHLY_OPEN_WIDGET` is sent **only to the active tab** at the time of the icon/popup “open widget” action. So any tab that was not active at that moment never gets the tray shown, even when it later receives `ECHLY_GLOBAL_STATE` with `visible: true`.

### 6. Messaging sync

- Background broadcasts state and sends `ECHLY_OPEN_WIDGET` only to the current active tab. Failures are swallowed. Tab activation only sends state; it does **not** send `ECHLY_OPEN_WIDGET` to the newly active tab, so `trayEverOpenedInThisTab` stays false on that tab.

### 7. Race conditions

- Message before listener (waitForBody delay).
- sendMessage before content script load (document_idle).
- Tab not active when opening widget (main product behavior, not only a race).

### 8. Exact reason the tray does not appear on some tabs

**Primary cause:**  
The tray is shown only after a tab receives **`ECHLY_OPEN_WIDGET`**. That message is sent **only to the tab that is active when the user clicks the extension icon or opens the widget from the popup.** Any other tab (e.g. already open, or focused later) only receives **`ECHLY_GLOBAL_STATE`**. In those tabs, **`setHostVisibilityFromState`** is used to show/hide the tray, but it **returns immediately** when **`trayEverOpenedInThisTab`** is false (see `echly-extension/src/content.tsx`, lines 59–62). So the host stays hidden (`display: none`, `visibility: hidden`) on every tab that never received `ECHLY_OPEN_WIDGET`.

**Contributing causes:**

- **Message delivery failure:** On tabs where the content script hasn’t run yet (timing) or can’t run (restricted URL), `chrome.tabs.sendMessage(..., ECHLY_OPEN_WIDGET)` fails and the error is ignored. That tab never gets a chance to set `trayEverOpenedInThisTab` or show the tray.
- **Listener not registered yet:** If `document.body` doesn’t exist when the script runs, `waitForBody` defers append and `ensureMessageListener`. If the user clicks the icon before the callback runs, `ECHLY_OPEN_WIDGET` is delivered to a tab that doesn’t have a listener yet, so the message is effectively lost and the tray never opens on that tab.

**Why recording still works:**  
Recording is started from the tray (content script sends `START_RECORDING` to the background). So recording works on the tab where the tray **did** appear (the tab that received `ECHLY_OPEN_WIDGET`). On tabs where the tray doesn’t appear, the user typically isn’t starting recording there; the observed behavior (“recording works but tray doesn’t appear on some tabs”) matches: tray visible and recording on one tab, tray hidden on others due to `trayEverOpenedInThisTab` and the single-tab `ECHLY_OPEN_WIDGET` design.

---

## File and line reference

| Topic | File | Lines |
|-------|------|--------|
| Content scripts declaration | echly-extension/manifest.json | 12–17 |
| __ECHLY_WIDGET_LOADED__ guard | echly-extension/src/content.tsx | 6–9, 1711–1716 |
| setHostVisibility / setHostVisibilityFromState | echly-extension/src/content.tsx | 49–56, 59–67 |
| trayEverOpenedInThisTab | echly-extension/src/content.tsx | 30, 1596 |
| Host creation and initial styles | echly-extension/src/content.tsx | 1681–1702 |
| waitForBody (MutationObserver) | echly-extension/src/content.tsx | 1660–1674 |
| mountReactApp / attachShadow | echly-extension/src/content.tsx | 1502–1521, 1504 |
| ensureMessageListener, ECHLY_OPEN_WIDGET handling | echly-extension/src/content.tsx | 1579–1641, 1595–1601 |
| openWidgetInActiveTab, sendMessage ECHLY_OPEN_WIDGET | echly-extension/src/background.ts | 264–276, 269–275, 329–333 |
| broadcastUIState | echly-extension/src/background.ts | 248–261 |
| Tab activated / created listeners | echly-extension/src/background.ts | 278–301 |
| START_RECORDING handler | echly-extension/src/background.ts | 625–434 |
| Popup openWidget | echly-extension/src/popup.tsx | 41–43, 65–66 |

---

*End of report. No code was modified.*
