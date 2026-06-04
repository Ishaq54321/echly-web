# Annote Extension — Read-Only Architecture Audit

Scope: map how the extension *currently* injects code, holds session state, behaves across tabs, captures and flushes data, and where each layer lives — as preparation for designing a session-driven programmatic-injection migration.

Methodology: source files were read; line numbers reference `annote-extension/` unless noted. Where evidence was ambiguous, that is flagged with **UNCLEAR**. No speculation about how things "should" work.

---

## SECTION 1 — Injection model

### 1.1 manifest.json (full quote)

[annote-extension/manifest.json:1-58](annote-extension/manifest.json#L1-L58):

```json
{
  "manifest_version": 3,
  "name": "Annote",
  "version": "1.0",
  "description": "Capture feedback in a click.",
  "icons": { "16": "...", "32": "...", "48": "...", "128": "..." },
  "permissions": ["activeTab", "storage", "scripting", "alarms"],
  "host_permissions": ["<all_urls>"],
  "action": { "default_title": "Annote", "default_icon": {...} },
  "background": { "service_worker": "background.js" },
  "content_scripts": [
    { "matches": ["<all_urls>"], "js": ["bootstrap.js"],         "run_at": "document_start", "all_frames": false },
    { "matches": ["<all_urls>"], "js": ["mainWorld.js"],         "run_at": "document_start", "all_frames": false, "world": "MAIN" },
    { "matches": ["<all_urls>"], "js": ["mainWorldNetwork.js"],  "run_at": "document_start", "all_frames": false, "world": "MAIN" }
  ],
  "web_accessible_resources": [
    { "resources": ["popup.css", "widget/widget.js", "widget/chunks/*", "assets/*", "fonts/*"], "matches": ["<all_urls>"] }
  ]
}
```

### 1.2 manifest.local.json

Byte-identical to `manifest.json` for purposes of this audit: same permissions, same `content_scripts` (`bootstrap.js` ISOLATED + `mainWorld.js` MAIN + `mainWorldNetwork.js` MAIN), same `<all_urls>` matches, same `all_frames: false`, same `run_at: "document_start"`. Differences are cosmetic — `name`, `version_name`, `default_title` carry a `(Local Dev)` label. [annote-extension/manifest.local.json:1-59](annote-extension/manifest.local.json#L1-L59).

### 1.3 content_scripts array

Three entries, all `matches: ["<all_urls>"]`, `run_at: "document_start"`, `all_frames: false`:

| Entry | js | world | purpose |
|---|---|---|---|
| 1 | `bootstrap.js` | ISOLATED (default) | tiny content-script: message router, lazy loads widget, owns keepalive + host visibility, installs console-flush listener |
| 2 | `mainWorld.js` | **MAIN** | wraps `window.console.*`, listens for `error`/`unhandledrejection`, owns the console ring buffer |
| 3 | `mainWorldNetwork.js` | **MAIN** | wraps `fetch` + `XMLHttpRequest`, owns the network ring buffer |

There is no `exclude_matches`, no `matches_origin_as_fallback`, no per-domain narrowing. `<all_urls>` means every http/https tab that Chrome permits.

### 1.4 Programmatic injection in use

Grep results for `chrome.scripting.*`, `chrome.tabs.executeScript`, `registerContentScripts`:

- **Bootstrap re-injection probe.** [annote-extension/src/background.ts:1002-1028](annote-extension/src/background.ts#L1002-L1028) `ensureContentScriptInjected(tabId)`: first runs an `executeScript` that just reads `window.__ECHLY_BOOTSTRAP_LOADED__`; if false, calls `chrome.scripting.executeScript({ target, files: ["bootstrap.js"] })` to recover when the declarative registration didn't fire (e.g. extension just installed, or page that loaded before the extension was enabled). The comment at L996-L1000 acknowledges this is a *fallback* — bootstrap is "registered statically via manifest content_scripts (runs at document_start on every page)".
- **Widget module loader.** [annote-extension/src/background.ts:1251-1284](annote-extension/src/background.ts#L1251-L1284) handles `ECHLY_LOAD_WIDGET`: `chrome.scripting.executeScript` injects a small `func` into ISOLATED world that calls `import(chrome.runtime.getURL("widget/widget.js"))`. Widget is an ES module, so it cannot be injected as a classic `files: [...]` and is loaded via dynamic import wrapped in `executeScript`. This is widget-UI code, not capture code.

No `chrome.tabs.executeScript` (MV2 API) and no `chrome.scripting.registerContentScripts` anywhere in the codebase.

### 1.5 Declarative vs programmatic — verdict

**Hybrid, but heavily declarative for capture.** Three declarative entries cover the capture surface; `chrome.scripting.executeScript` is used only as (a) a fallback when bootstrap didn't fire and (b) the loader for the widget UI module. The two MAIN-world capture scripts (`mainWorld.js`, `mainWorldNetwork.js`) are **declarative-only** — there is no `executeScript` call anywhere that references them. Evidence: a grep over the whole repo for `mainWorld.js"|mainWorldNetwork.js"` finds them quoted only in `manifest.json` / `manifest.local.json` and their source files.

### 1.6 Files that get into a page today

| File | Layer / world | Arrives via |
|---|---|---|
| `bootstrap.js` (built from `src/bootstrap.ts`) | content-script ISOLATED | declarative content_scripts entry 1 + `ensureContentScriptInjected` fallback at [src/background.ts:1018](annote-extension/src/background.ts#L1018) |
| `mainWorld.js` (built from `src/console/mainWorld.ts`) | MAIN world | declarative content_scripts entry 2 only |
| `mainWorldNetwork.js` (built from `src/network/mainWorldNetwork.ts`) | MAIN world | declarative content_scripts entry 3 only |
| `widget/widget.js` (built from `src/content.tsx`) | content-script ISOLATED (ES module) | lazy via `chrome.scripting.executeScript` triggered by `ECHLY_LOAD_WIDGET` ([src/background.ts:1264](annote-extension/src/background.ts#L1264)) |
| `widget/chunks/*` | content-script ISOLATED | dynamically import()ed by widget.js (web_accessible_resources) |
| `popup.css`, fonts, assets | shadow DOM `<link>` | injected via `chrome.runtime.getURL` from inside the widget ([src/content.tsx:1638-1640](annote-extension/src/content.tsx#L1638-L1640)) |

`background.js` (compiled from `src/background.ts`) runs as the MV3 service worker per `manifest.background.service_worker`. The `src/sessionRelay.ts` module is imported by `bootstrap.ts` at the top ([src/bootstrap.ts:11](annote-extension/src/bootstrap.ts#L11)) — it ships *inside* `bootstrap.js`, not as a separate file.

---

## SECTION 2 — Session model

### 2.1 Where a session is STARTED

There are three start paths, all funneling through messages to the service worker:

1. **Widget UI button** → `onSessionModeStart` prop → posts `ECHLY_SESSION_MODE_START` to background ([src/content.tsx:1527-1532](annote-extension/src/content.tsx#L1527-L1532)). The session row itself was POSTed earlier via `apiFetch("/api/sessions", { method: "POST", body: { title } })` in `createSession()` at [src/content.tsx:1212-1261](annote-extension/src/content.tsx#L1212-L1261). The returned `session.id` is sent to background through `ECHLY_SET_ACTIVE_SESSION` ([src/content.tsx:1269-1273](annote-extension/src/content.tsx#L1269-L1273)).
2. **Background-initiated start** in active tab: `startSessionInActiveTab()` at [src/background.ts:91-100](annote-extension/src/background.ts#L91-L100) → injects bootstrap if needed → `chrome.tabs.sendMessage(tabId, { type: "ECHLY_START_SESSION" })` → bootstrap forwards to widget via `CustomEvent("ECHLY_START_SESSION_REQUEST")` ([src/bootstrap.ts:351-358](annote-extension/src/bootstrap.ts#L351-L358)) → widget's React effect at [src/content.tsx:542-567](annote-extension/src/content.tsx#L542-L567) calls `createSession()` and `onActiveSessionChange()` + posts `ECHLY_SESSION_MODE_START`.
3. **Previous-session resume** path: `onPreviousSessionSelect` → `ECHLY_SET_ACTIVE_SESSION` + `ECHLY_SESSION_MODE_START` ([src/content.tsx:1275-1300](annote-extension/src/content.tsx#L1275-L1300)).

The actual session record is created on the server (`POST /api/sessions`); the extension's "session is now active" state is driven by `ECHLY_SET_ACTIVE_SESSION` followed by `ECHLY_SESSION_MODE_START`.

### 2.2 Where "is a session currently active?" state lives

| Location | What it holds | Evidence |
|---|---|---|
| **background.ts module-level** | `activeSessionId: string \| null` ([src/background.ts:179](annote-extension/src/background.ts#L179)); `activeOwnerTabId: number \| null` (L180); `globalUIState.sessionId`, `globalUIState.sessionModeActive`, `globalUIState.sessionPaused`, `globalUIState.sessionLoading`, `globalUIState.sessionTitle` ([src/background.ts:236-288](annote-extension/src/background.ts#L236-L288)); `cachedEchlyActive: boolean` (tray-open mirror, L46) | These are the authoritative working copies. |
| **chrome.storage.local** | keys: `activeSessionId`, `sessionModeActive`, `sessionPaused`, `echlyActive` | Written at multiple sites: [src/background.ts:627-632](annote-extension/src/background.ts#L627-L632), [1461-1463](annote-extension/src/background.ts#L1461-L1463), [1628-1632](annote-extension/src/background.ts#L1628-L1632), [1778-1783](annote-extension/src/background.ts#L1778-L1783), [1821-1826](annote-extension/src/background.ts#L1821-L1826). Read at startup: [src/background.ts:661-694](annote-extension/src/background.ts#L661-L694) `initializeSessionState()` and [src/background.ts:725-729](annote-extension/src/background.ts#L725-L729). |
| **chrome.storage.session** | per-feedback-id idempotency flags ([src/background.ts:158-163](annote-extension/src/background.ts#L158-L163)) | NOT used for session-active state. |
| **bootstrap.ts (content script, ISOLATED)** | `latestGlobalState: GlobalUIState \| null` ([src/bootstrap.ts:74](annote-extension/src/bootstrap.ts#L74)) — last state pushed from background; drives host visibility and keepalive | Mirror only — derived from background's state, not authoritative. |
| **widget React (content.tsx)** | `const [globalState, setGlobalState] = React.useState<GlobalUIState \| null>(null);` ([src/content.tsx:290](annote-extension/src/content.tsx#L290)); `effectiveSessionId = globalState?.session.id ?? null` ([src/content.tsx:301](annote-extension/src/content.tsx#L301)) | UI mirror, set from `ECHLY_GLOBAL_STATE` events ([src/content.tsx:485-504](annote-extension/src/content.tsx#L485-L504)) and `__ECHLY_APPLY_GLOBAL_STATE__` direct-call ([src/content.tsx:472-482](annote-extension/src/content.tsx#L472-L482)). |
| **MAIN-world capture scripts** | **No session state.** They check no session flag — capture is always-on. | Grep over `src/console/mainWorld.ts` and `src/network/mainWorldNetwork.ts` finds no references to `session`, `sessionId`, `sessionMode`, `sessionActive`. The integrity check, the circuit breaker, and the install code run unconditionally. |

### 2.3 Source of truth

**Background.ts (`globalUIState` in module memory + `chrome.storage.local`).** The widget and bootstrap are pure mirrors; both ask background via `ECHLY_GET_GLOBAL_STATE` ([src/bootstrap.ts:265](annote-extension/src/bootstrap.ts#L265), [src/background.ts:1433-1444](annote-extension/src/background.ts#L1433-L1444)) and accept pushes via `ECHLY_GLOBAL_STATE` (broadcast at [src/background.ts:916-944](annote-extension/src/background.ts#L916-L944)). The widget sends mutations (start/pause/resume/end) back to background as messages, and background updates `globalUIState` and rebroadcasts. The patch shape and debounce live at [src/background.ts:859-953](annote-extension/src/background.ts#L859-L953).

`chrome.storage.local` is the durability layer — written every time `activeSessionId` / `sessionModeActive` / `sessionPaused` change, read once at SW startup by `initializeSessionState()`. The in-memory copy diverges from storage between writes (storage writes are not awaited at most call sites).

### 2.4 Per-tab vs global

**Global across the browser, single-tab "owner".** Evidence:

- `activeSessionId` is module-global, not keyed by tabId ([src/background.ts:179](annote-extension/src/background.ts#L179)).
- `chrome.storage.local.activeSessionId` is a single value, not a map.
- A single `activeOwnerTabId: number | null` ([src/background.ts:180](annote-extension/src/background.ts#L180)) tracks the most-recently-activated tab, updated in `chrome.tabs.onActivated` ([src/background.ts:1084](annote-extension/src/background.ts#L1084)). It is used only to pick a broadcast target ([src/background.ts:911](annote-extension/src/background.ts#L911)) — it does not gate or restrict the session.

If a user opens tab B during an active session, that tab B *can* read the same session — when bootstrap there asks `ECHLY_GET_GLOBAL_STATE` it receives the active session; the widget auto-loads if `getShouldShowTray()` returns true ([src/bootstrap.ts:264-281](annote-extension/src/bootstrap.ts#L264-L281), [src/bootstrap.ts:137-143](annote-extension/src/bootstrap.ts#L137-L143)). So the session is effectively browser-global.

---

## SECTION 3 — Cross-tab behavior

### 3.1 Tab switching listeners

`chrome.tabs.onActivated` at [src/background.ts:1083-1102](annote-extension/src/background.ts#L1083-L1102):

```ts
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  activeOwnerTabId = activeInfo.tabId;
  if (!cachedEchlyActive) return;                              // tray off → no-op
  const sessionIdForRehydrate = activeSessionId ?? globalUIState.sessionId;
  if (sessionIdForRehydrate && shouldForceRehydrate(...)) { ... rehydrate ... }
  await ensureContentScriptInjected(activeInfo.tabId);          // re-inject bootstrap
  await sendMessageWithRetry(activeInfo.tabId, {
    type: "ECHLY_GLOBAL_STATE",
    state: getCanonicalGlobalState(),
  });
});
```

`chrome.tabs.onUpdated` at [src/background.ts:1112-1135](annote-extension/src/background.ts#L1112-L1135): on `status === "loading"` clears `injectedTabs.delete(tabId)`; on `status === "complete"` + tab is active + `cachedEchlyActive` is true → `ensureContentScriptInjected` + push `ECHLY_GLOBAL_STATE`. Inactive tabs are *not* synced on update.

`chrome.tabs.onCreated` at [src/background.ts:1138-1156](annote-extension/src/background.ts#L1138-L1156): only acts when `tab.active === true`; injects bootstrap and pushes state to the new tab.

`chrome.tabs.onRemoved` at [src/background.ts:1104-1109](annote-extension/src/background.ts#L1104-L1109): clears `activeOwnerTabId` if it matched and drops the tab from `injectedTabs`.

No `chrome.webNavigation` listeners exist. Grep confirms.

### 3.2 MAIN-world capture on tab B

The MAIN-world content_scripts entries (`mainWorld.js`, `mainWorldNetwork.js`) are registered with `matches: ["<all_urls>"]` and `run_at: "document_start"` — Chrome injects them into every http/https tab regardless of session state. There is no gating inside the scripts:

- `src/console/mainWorld.ts` runs `initConsoleCapture()` unconditionally, installs the console wrappers, the 1-second circuit-breaker interval, the 2-second integrity interval, and the `window.addEventListener("error" / "unhandledrejection" / "message" / "visibilitychange")` handlers. There is *no* "is session active" check before installing or before pushing to the buffer.
- `src/network/mainWorldNetwork.ts` is symmetric: `initNetworkCapture()` wraps `fetch` and `XMLHttpRequest.prototype.{open,send,setRequestHeader}` and sets up the same intervals. Always-on.

So the answer to "is MAIN-world capture running on tab B" is: **yes, on tab B and on every other tab the user has ever opened**, regardless of whether they started a session, regardless of whether the widget is visible, regardless of whether the user has even authenticated.

### 3.3 At ticket-creation time, what gets captured

The capture is **single-tab — only the tab where the user filed the ticket.** Trace:

1. Ticket creation runs inside the widget on the tab the user is on. `processFeedbackPipeline` in [src/content.tsx:680-956](annote-extension/src/content.tsx#L680-L956) reads `consoleSnapshot` and `networkSnapshot` straight off the `CaptureContext` parameter (L706-L707).
2. The `CaptureContext` is assembled in `CaptureWidget` (lives in `lib/capture-engine/core/CaptureWidget`, outside the extension folder) and is populated by calling the two snapshot functions passed down at [src/content.tsx:1487-1488](annote-extension/src/content.tsx#L1487-L1488):
   ```tsx
   requestConsoleSnapshot={() => requestConsoleSnapshot(500)}
   requestNetworkSnapshot={() => requestNetworkSnapshot(500)}
   ```
3. `requestConsoleSnapshot` / `requestNetworkSnapshot` post a `window.postMessage` with `source: *_BRIDGE_SOURCE_ISOLATED` to the **same window** ([src/console/bridge.ts:121-130](annote-extension/src/console/bridge.ts#L121-L130), [src/network/bridge.ts:84-92](annote-extension/src/network/bridge.ts#L84-L92)). The MAIN-world script in *this* tab listens for that message and replies with `buffer.snapshot()` from the MAIN-world ring buffer of the *same tab* ([src/console/mainWorld.ts:501-533](annote-extension/src/console/mainWorld.ts#L501-L533), [src/network/mainWorldNetwork.ts:1134-1161](annote-extension/src/network/mainWorldNetwork.ts#L1134-L1161)).

The buffers themselves are MAIN-world JavaScript objects, scoped to the page realm:

- Console buffer: `const buffer = new ConsoleBuffer()` at [src/console/mainWorld.ts:57](annote-extension/src/console/mainWorld.ts#L57).
- Network buffer: `const buffer = new NetworkBuffer()` at [src/network/mainWorldNetwork.ts:43](annote-extension/src/network/mainWorldNetwork.ts#L43).

Each page has its own MAIN-world realm, so each tab has its own pair of buffers. There is no shared store. When tab A files a ticket, only tab A's buffers are read. Tab B's data is unreachable.

### 3.4 Is there a session buffer in the service worker?

**Not present.** Grep over `src/background.ts` for `buffer`, `consoleLog`, `networkRequest`, `aggregate` shows no SW-side aggregation. The background's only contact with capture data is the forwarding step in `createFeedbackInternal` at [src/background.ts:1158-1214](annote-extension/src/background.ts#L1158-L1214) — it accepts the already-snapshotted `consoleLogs` / `networkRequests` on the message payload and forwards them to `POST /api/feedback`. No retention, no merging.

There is a network-flush *receiver* in the isolated bridge — `installNetworkBridgeListener()` at [src/network/bridge.ts:106-145](annote-extension/src/network/bridge.ts#L106-L145) — that would forward `ECHLY_NETWORK_FLUSH_PUSH` events to `chrome.runtime.sendMessage({ type: "ECHLY_NETWORK_FLUSH" })`. **But `installNetworkBridgeListener` is never called anywhere in the codebase** (grep confirms it's defined in `bridge.ts` and only referenced by `bridge.ts`). The console flush listener *is* installed ([src/bootstrap.ts:70](annote-extension/src/bootstrap.ts#L70) calls `installBridgeListener()`), but only caches in the isolated world — [src/console/bridge.ts:36](annote-extension/src/console/bridge.ts#L36) `cachedFlushSnapshot` — and is read by the same-tab `requestSnapshot` fallback path ([src/console/bridge.ts:117-119](annote-extension/src/console/bridge.ts#L117-L119)). It does not reach the service worker.

---

## SECTION 4 — Buffer and flush architecture

### 4.1 Where the MAIN-world buffers live

`src/console/buffer.ts` and `src/network/buffer.ts` define ring-buffer classes (`ConsoleBuffer`, `NetworkBuffer`). They are instantiated *once per MAIN-world script instance*, which means **once per page realm = once per tab** (technically once per top frame, since `all_frames: false`).

Console buffer config: maxAge 300 s, maxEntries 50, maxTotalBytes 50 KB ([src/console/buffer.ts:21-26](annote-extension/src/console/buffer.ts#L21-L26)). Eviction by age and size on every add.

### 4.2 How buffered data exits the MAIN world

Two channels, both `window.postMessage`:

1. **Request/response** (used at ticket-click time):
   - Isolated world posts `{ source: *_BRIDGE_SOURCE_ISOLATED, type: *_SNAPSHOT_REQUEST, requestId }` ([src/console/bridge.ts:122-130](annote-extension/src/console/bridge.ts#L122-L130) / [src/network/bridge.ts:85-92](annote-extension/src/network/bridge.ts#L85-L92)).
   - MAIN world listens, replies with `{ source: *_BRIDGE_SOURCE_MAIN, type: *_SNAPSHOT_RESPONSE, requestId, snapshot: buffer.snapshot() }` ([src/console/mainWorld.ts:519-528](annote-extension/src/console/mainWorld.ts#L519-L528), [src/network/mainWorldNetwork.ts:1147-1156](annote-extension/src/network/mainWorldNetwork.ts#L1147-L1156)).
   - Timeout: 500 ms in practice ([src/content.tsx:1487-1488](annote-extension/src/content.tsx#L1487-L1488)), 1000 ms default in console bridge ([src/console/bridge.ts:76](annote-extension/src/console/bridge.ts#L76)). On timeout, console falls back to `cachedFlushSnapshot` if present; network falls back to `null`.

2. **Flush push** (fired by MAIN on `visibilitychange` to hidden and on `beforeunload`):
   - Console: [src/console/mainWorld.ts:535-553](annote-extension/src/console/mainWorld.ts#L535-L553) — posts `CONSOLE_FLUSH_PUSH` to same window. Isolated cache catches it in `bridge.ts`. **Does not reach background.**
   - Network: [src/network/mainWorldNetwork.ts:1163-1181](annote-extension/src/network/mainWorldNetwork.ts#L1163-L1181) — posts `NETWORK_FLUSH_PUSH`. **No listener is installed in the live build**, since `installNetworkBridgeListener` is never invoked. The event is dispatched, nobody receives it, GC.

### 4.3 Full hop trace: console log → ticket

| Step | Realm | File:line |
|---|---|---|
| `console.log(...)` fires | page (MAIN) | wrapper installed at [src/console/mainWorld.ts:329-403](annote-extension/src/console/mainWorld.ts#L329-L403) |
| `captureLevel()` enqueues microtask, stringifies + redacts + writes to ring buffer | MAIN | [src/console/mainWorld.ts:283-326](annote-extension/src/console/mainWorld.ts#L283-L326) |
| User clicks Capture in widget → CaptureWidget calls `requestConsoleSnapshot(500)` prop | ISOLATED (widget) | wired at [src/content.tsx:1487](annote-extension/src/content.tsx#L1487) |
| Isolated posts `ECHLY_CONSOLE_SNAPSHOT_REQUEST` → MAIN responds with `snapshot()` | postMessage round-trip | [src/console/bridge.ts:76-135](annote-extension/src/console/bridge.ts#L76-L135) ↔ [src/console/mainWorld.ts:501-533](annote-extension/src/console/mainWorld.ts#L501-L533) |
| CaptureWidget bundles snapshot into `CaptureContext` and calls `onComplete(transcript, screenshot, ...)` | ISOLATED | [src/content.tsx:958-...](annote-extension/src/content.tsx#L958) `handleComplete` → `processFeedbackPipeline` |
| `processFeedbackPipeline` reads `context.consoleSnapshot` and `context.networkSnapshot`, strips them from the AI body, and ships them via `chrome.runtime.sendMessage({ type: "ECHLY_CREATE_FEEDBACK", payload: { ticket: { consoleLogs, exceptions, networkRequests, ... } } })` | ISOLATED → SW | [src/content.tsx:706-868](annote-extension/src/content.tsx#L706-L868) |
| Background's `ECHLY_CREATE_FEEDBACK` handler calls `createFeedbackInternal({ sessionId, feedbackId, ticket, screenshotId })` which calls `buildFeedbackPayload` and `fetch(API_BASE + "/api/feedback", { method: "POST", headers: { x-extension-token } })` | SW | [src/background.ts:1158-1214](annote-extension/src/background.ts#L1158-L1214); payload shape at [src/utils/buildFeedbackPayload.ts:63-95](annote-extension/src/utils/buildFeedbackPayload.ts#L63-L95) |

### 4.4 Is capture continuous or click-time-only?

**Click-time-only for the ticket payload.** The only path that reads the buffer for ticket creation is `requestSnapshot` at click time. The flush-push mechanism is *defensive* (so a navigation between two clicks doesn't lose data — console-only, since network flush listener is uninstalled). There is **no periodic timer** that drains the buffer back to the service worker, no `setInterval` that calls a "ship buffer" function.

Concretely: cross-tab continuous capture would require either (a) the MAIN buffer to ship to the SW on every entry / on a timer, or (b) the SW to own a buffer that aggregates from many tabs. Neither exists.

---

## SECTION 5 — Session end and lifecycle

### 5.1 End paths

Grep for the `SESSION_MODE_END` / `endSession` family yields three end paths in the SW:

1. **Hard end** — `ECHLY_SESSION_MODE_END` message handler at [src/background.ts:1758-1799](annote-extension/src/background.ts#L1758-L1799). Clears `activeSessionId`, `globalUIState.sessionModeActive=false`, `globalUIState.sessionPaused=false`, all counts/pointers, `lastSyncedAt`, `feedbackJobs`. Sets `cachedEchlyActive = false`, writes storage with all four flags off, sets `trayOpen = false`, hides widget, broadcasts new state, then `setTimeout(150)` and `chrome.tabs.sendMessage(everyTab, ECHLY_RESET_WIDGET)`.
2. **Soft end** — `ECHLY_SESSION_MODE_END_SOFT` at [src/background.ts:1801-1839](annote-extension/src/background.ts#L1801-L1839). Same as hard end *except* keeps `cachedEchlyActive = true` and `echlyActive: true` in storage so the tray remains visible.
3. **Idle timeout** — `endSessionFromIdle()` at [src/background.ts:608-643](annote-extension/src/background.ts#L608-L643), scheduled by `resetSessionIdleTimer()` at L645-651 with `SESSION_IDLE_TIMEOUT = 30 * 60 * 1000` (30 minutes) at L598. Resets are triggered every time the widget sends `ECHLY_SESSION_ACTIVITY` ([src/background.ts:1715-1719](annote-extension/src/background.ts#L1715-L1719)) or any of the session mode transitions fire.

The widget initiates these from `onSessionModeEnd` / `onSessionModeEndSoft` props at [src/content.tsx:1548-1581](annote-extension/src/content.tsx#L1548-L1581).

### 5.2 What triggers an end

- **Explicit user action in widget** ➜ paths 1 & 2 (`ECHLY_SESSION_MODE_END[_SOFT]`).
- **30-minute idle** ➜ `endSessionFromIdle` ([src/background.ts:608-643](annote-extension/src/background.ts#L608-L643)).
- **Filing a ticket** ➜ does NOT end the session. Ticket creation writes to the feedback collection; session remains active until idle or explicit end. Confirmed: `createFeedbackInternal` ([src/background.ts:1158-1214](annote-extension/src/background.ts#L1158-L1214)) touches no session-end state.
- **Closing a tab** ➜ does NOT end the session. `chrome.tabs.onRemoved` ([src/background.ts:1104-1109](annote-extension/src/background.ts#L1104-L1109)) only clears `activeOwnerTabId` and the per-tab injection cache — it does not touch `activeSessionId`.
- **Workspace switch** ➜ does NOT end the session (only drops the cached extension token and prompts widgets to refresh) ([src/background.ts:1221-1240](annote-extension/src/background.ts#L1221-L1240)).
- **Auth expiry** ➜ does NOT end the session directly; will manifest as 401s on subsequent API calls.

### 5.3 Teardown when a session ends

From hard-end at [src/background.ts:1758-1799](annote-extension/src/background.ts#L1758-L1799):

- `clearSessionIdleTimer()` cancels the idle alarm.
- `chrome.alarms.clear("echly-keepalive")` — the SW keepalive alarm is dropped.
- `activeSessionId`, `globalUIState.sessionId/Title`, pointers, counts, pagination, sync timestamps → all nulled/zeroed.
- `cachedEchlyActive = false` (or `true` for soft).
- `chrome.storage.local.set({ activeSessionId: null, sessionModeActive: false, sessionPaused: false, echlyActive: false })`.
- Broadcasts `ECHLY_RESET_WIDGET` to every tab so widgets unmount.

What is **not** torn down:
- MAIN-world wrappers — they remain installed on every tab. There is no message that would trigger their removal even if one were defined.
- MAIN-world ring buffers — keep accumulating entries (and evicting by age/size) regardless.
- The page-side keepalive port from bootstrap ([src/bootstrap.ts:121-125](annote-extension/src/bootstrap.ts#L121-L125)) — the widget signals `__ECHLY_DISCONNECT_KEEPALIVE__` from its `onSessionModeEnd` / `onSessionModeEndSoft` props ([src/content.tsx:1550, 1568](annote-extension/src/content.tsx#L1550)).

### 5.4 Per-scenario survival

| Scenario | Survives? | Evidence |
|---|---|---|
| Tab reload | **Yes.** The session lives in background SW + `chrome.storage.local`. When the page reloads, bootstrap re-runs, fetches `ECHLY_GET_GLOBAL_STATE`, gets back the active session, and auto-loads widget if `getShouldShowTray` says so ([src/bootstrap.ts:264-281, 421-422](annote-extension/src/bootstrap.ts#L264-L281)). MAIN-world buffers are *not* preserved across reload — new realm. |
| Close & reopen browser | **Partially.** `chrome.storage.local.activeSessionId` survives; `(async () => { ... initializeSessionState() })()` at [src/background.ts:723-746](annote-extension/src/background.ts#L723-L746) reads it. **But** L683 sets `globalUIState.sessionModeActive = false` on the "not a cold-start restart" branch, and the cold-start path only restores `sessionModeActive` when `activeSessionId != null && lastSyncedAt == null` (L675). **UNCLEAR:** the test `lastSyncedAt == null` is always true on SW boot (`lastSyncedAt` lives in module memory), so `isColdStartRestart` will be true whenever `activeSessionId` was stored — in which case `rehydrateSession` runs and re-sets `sessionModeActive = true` via `setRehydratingLoadingState` at L356. Net behavior is "restore session if it was persisted, then rehydrate." |
| SW killed by Chrome (MV3 idle) | **Same as cold start.** Module-level vars (`activeSessionId`, `globalUIState`, `extensionToken`, `cachedEchlyActive`, `injectedTabs`, `keepalivePorts`, `cachedFlushSnapshot` in isolated world) are lost. The startup IIFE runs again, calls `initializeSessionState()`, restores from `chrome.storage.local`. Keepalive ports from active content scripts will reconnect ([src/bootstrap.ts:102-110](annote-extension/src/bootstrap.ts#L102-L110)). The `chrome.alarms` keepalive may have fired and woken the SW already ([src/background.ts:717-721](annote-extension/src/background.ts#L717-L721) is a no-op alarm handler that just keeps the SW alive). The extension token is in memory only ([src/background.ts:182-185](annote-extension/src/background.ts#L182-L185)) — first API call after wake will refresh it via `getOrRefreshToken` ([src/background.ts:754-806](annote-extension/src/background.ts#L754-L806)). |

---

## SECTION 6 — Service worker state persistence

### 6.1 In-memory vs persisted

**In-memory only (lost on SW restart):**
- `extensionToken`, `extensionTokenExpiresAt`, `cachedSessionUser` ([src/background.ts:183-187](annote-extension/src/background.ts#L183-L187)).
- `sw.extensionToken`, `sw.currentUser`, `sw.captureMode`, `sw.lastUserTabId` ([src/background.ts:167-177](annote-extension/src/background.ts#L167-L177)).
- `cachedEchlyActive` ([src/background.ts:46](annote-extension/src/background.ts#L46)) — mirror of storage; resynced at startup [L731](annote-extension/src/background.ts#L731).
- `injectedTabs: Set<number>` ([src/background.ts:50](annote-extension/src/background.ts#L50)).
- `activeSessionId`, `activeOwnerTabId` ([src/background.ts:179-180](annote-extension/src/background.ts#L179-L180)).
- The entire `globalUIState` object ([src/background.ts:236-288](annote-extension/src/background.ts#L236-L288)) — pointers, counts, sessionTitle, feedbackJobs, etc.
- `cachedBillingUsage`, `billingUsageCachedAt` ([src/background.ts:189-195](annote-extension/src/background.ts#L189-L195)).
- `trayOpen`, `rehydrationPromise`, `loadMoreRecoveryPromise`, `idleTimer`, `pendingBroadcastState`, `lastBroadcastState`, `processingFeedbackIds`, `feedbackJobOwners`, `keepalivePorts`.

**Persisted in `chrome.storage.local`:**
- `echlyActive` (boolean tray toggle).
- `activeSessionId` (string | null).
- `sessionModeActive` (boolean).
- `sessionPaused` (boolean).

That's the entire SW-persisted state. No pointer/feedback list, no sessionTitle, no token, no counts.

**Persisted in `chrome.storage.session`:** per-feedback-id idempotency flags only ([src/background.ts:157-164](annote-extension/src/background.ts#L157-L164)). Cleared on browser restart by definition.

**Persisted in `chrome.storage.sync`:** none — no usage in `src/`.

### 6.2 Recovery on SW restart

`initializeSessionState()` ([src/background.ts:661-695](annote-extension/src/background.ts#L661-L695)) reads `activeSessionId`, `sessionModeActive`, `sessionPaused` and:
- If `activeSessionId != null && lastSyncedAt == null` (cold-start case), calls `rehydrateSession(activeSessionId)` which refetches feedback + counts from the API ([src/background.ts:372-456](annote-extension/src/background.ts#L372-L456)) and sets `sessionModeActive = true` via `setRehydratingLoadingState` ([src/background.ts:351-370](annote-extension/src/background.ts#L351-L370)).
- Else (cached state path): sets `sessionModeActive = false` and zeros counts.

Tab-side buffers are *not* recovered — they are gone.

### 6.3 Storage usage call sites (full)

- Reads: [src/background.ts:158](annote-extension/src/background.ts#L158), [663](annote-extension/src/background.ts#L663), [725](annote-extension/src/background.ts#L725), [1436](annote-extension/src/background.ts#L1436).
- Writes: [112](annote-extension/src/background.ts#L112), [163](annote-extension/src/background.ts#L163), [627](annote-extension/src/background.ts#L627), [654](annote-extension/src/background.ts#L654), [1032](annote-extension/src/background.ts#L1032), [1072](annote-extension/src/background.ts#L1072), [1461](annote-extension/src/background.ts#L1461), [1628](annote-extension/src/background.ts#L1628), [1778](annote-extension/src/background.ts#L1778), [1821](annote-extension/src/background.ts#L1821).

---

## SECTION 7 — Widget UI vs capture

### 7.1 Widget injection model

The widget (`widget/widget.js`, compiled from `src/content.tsx`) is **NOT** in `manifest.content_scripts`. It is injected lazily via `chrome.scripting.executeScript` in response to the `ECHLY_LOAD_WIDGET` message from bootstrap ([src/background.ts:1251-1284](annote-extension/src/background.ts#L1251-L1284)).

Bootstrap calls `loadWidget()` ([src/bootstrap.ts:192-253](annote-extension/src/bootstrap.ts#L192-L253)) in three cases:
1. On initial state fetch if `getShouldShowTray(state)` returns true ([src/bootstrap.ts:264-281](annote-extension/src/bootstrap.ts#L264-L281), [421-422](annote-extension/src/bootstrap.ts#L421-L422)) — which is true if `state.visible || state.session.status !== "idle"`.
2. On `ECHLY_OPEN_WIDGET` runtime message ([src/bootstrap.ts:305-313](annote-extension/src/bootstrap.ts#L305-L313)).
3. On `ECHLY_GLOBAL_STATE` push if `getShouldShowTray(normalized)` is true ([src/bootstrap.ts:288-302](annote-extension/src/bootstrap.ts#L288-L302)).

So the widget is mounted on tabs where (a) the user opened the tray or (b) a session is active (any session-active tab auto-mounts the widget on next state sync).

### 7.2 Is the widget required for capture?

**No.** The MAIN-world wrappers install on `document_start` from the manifest content_scripts before any of the widget loader code runs. The buffers fill regardless of widget presence. The widget is needed only to *consume* the buffers (at ticket click time) and to drive session state transitions.

Practical implication: on a tab where the widget is never mounted (e.g. user hasn't opened the tray and there's no active session yet), the MAIN-world scripts still wrap console + fetch + XHR and still fill the ring buffer. The buffer just gets evicted by age (5-minute window) without ever being read.

### 7.3 Coupling diagram

- `manifest.content_scripts` → `mainWorld.js`, `mainWorldNetwork.js`, `bootstrap.js` are independent of any user action.
- Widget mount ← bootstrap's `loadWidget()` ← (a) session became active, (b) user clicked icon, (c) state push says `visible || !idle`.
- Capture buffer ← MAIN-world wrappers, independent of widget.
- Buffer → ticket: requires widget (CaptureWidget UI) to be mounted, but the data is the buffer the wrappers fill regardless.

---

## SECTION 8 — Current breakage surface

### 8.1 Where MAIN-world capture runs today

`manifest.content_scripts.matches: ["<all_urls>"]` — Chrome injects on every `http://*/*` and `https://*/*` URL the user permits (which is everything because `host_permissions: ["<all_urls>"]`). `all_frames: false` means only the top frame, not iframes.

So: every top frame of every http(s) page the user opens runs the console wrapper, the XHR/fetch wrappers, the integrity-check setIntervals, the circuit-breaker setIntervals, the iframe-native-extraction stub, and the postMessage listeners — **always, regardless of session state, regardless of authentication, regardless of widget visibility**.

Confirmed.

### 8.2 The heavy-SPA implication

The recently-mitigated issues — SSE/ndjson tee-buffer growth on streaming responses ([src/network/mainWorldNetwork.ts:64-82](annote-extension/src/network/mainWorldNetwork.ts#L64-L82)), the wrapper war with other extensions ([src/console/mainWorld.ts:83-145, 484-500](annote-extension/src/console/mainWorld.ts#L83-L145), [src/network/mainWorldNetwork.ts:131-203](annote-extension/src/network/mainWorldNetwork.ts#L131-L203)), the integrity-check leapfrog ([src/console/mainWorld.ts:407-429](annote-extension/src/console/mainWorld.ts#L407-L429)) — were and are happening on every tab, including tabs where the user has no Annote session open and may not even know the extension is doing anything. The defensive code in the recent commit (`87.4 console + network capture features`) made these scenarios non-fatal, but the capture work itself still runs.

### 8.3 Denylist / opt-out today

There are two denylists, both *capture-time content* filters, not *page-level injection* filters:

- `src/console/denylist.ts` ([CONSOLE_DENYLIST](annote-extension/src/console/denylist.ts#L9)) — regex patterns matched against captured *log message strings* (DevTools install prompts, HMR chatter, analytics SDK debug output). Implemented at [src/console/mainWorld.ts:302](annote-extension/src/console/mainWorld.ts#L302) via `isDenylisted(joined)`.
- `src/network/denylist.ts` ([NETWORK_DENYLIST](annote-extension/src/network/denylist.ts#L18)) — patterns matched against *URLs* of captured requests (Google Analytics, Segment, Sentry, etc.). Applied at [src/network/mainWorldNetwork.ts:492](annote-extension/src/network/mainWorldNetwork.ts#L492), [928](annote-extension/src/network/mainWorldNetwork.ts#L928).

Both filter what *ends up in the buffer* but do not prevent the wrappers from running. There is no domain-level "don't even install the wrapper" mechanism, no user opt-out for specific domains, and no internal-page detection (e.g. `chrome://`, `about:` pages are filtered by Chrome itself because the extension can't run there at all).

---

## SECTION 9 — Synthesis

### 9.1 What runs where (current architecture)

```
┌──────────────────── Chrome browser ─────────────────────┐
│                                                          │
│  ┌── Service Worker (background.js, MV3) ─────────────┐ │
│  │  • activeSessionId, globalUIState (in-memory)      │ │
│  │  • chrome.storage.local: { activeSessionId,        │ │
│  │       sessionModeActive, sessionPaused,            │ │
│  │       echlyActive }                                │ │
│  │  • extensionToken (in-memory, 14 min TTL)          │ │
│  │  • chrome.alarms("echly-keepalive") + keepalive    │ │
│  │       ports from each active content script        │ │
│  │  • chrome.tabs.{onActivated, onUpdated, onCreated, │ │
│  │       onRemoved} listeners                         │ │
│  │  • chrome.scripting.executeScript:                 │ │
│  │       - bootstrap.js fallback                      │ │
│  │       - widget.js dynamic import wrapper           │ │
│  │  • POST /api/sessions, POST /api/feedback,         │ │
│  │       GET /api/feedback?sessionId=...              │ │
│  └────────────────────────────────────────────────────┘ │
│              ▲                          ▲                │
│              │ chrome.runtime           │ chrome.tabs.   │
│              │  .sendMessage            │  sendMessage   │
│              ▼                          ▼                │
│  ┌── Tab A (top frame) ──────────────────────────────┐ │
│  │  ISOLATED world (content_script bootstrap.js):     │ │
│  │    • sessionRelay.ts (postMessage handshake)       │ │
│  │    • bootstrap.ts (message router, host visibility,│ │
│  │       keepalive port, lazy widget loader)          │ │
│  │    • console/bridge.ts installBridgeListener()     │ │
│  │       (caches CONSOLE_FLUSH_PUSH)                  │ │
│  │    • [widget.js lazy-loaded via executeScript]:    │ │
│  │       - React app inside shadow DOM (CaptureWidget)│ │
│  │       - sessions cache, sessionTitle generator     │ │
│  │  MAIN world (content_script mainWorld.js):         │ │
│  │    • Console wrapper (log/info/warn/error/debug)   │ │
│  │    • window error + unhandledrejection listeners   │ │
│  │    • ConsoleBuffer (ring, 50 entries / 50 KB)      │ │
│  │    • postMessage bridge for SNAPSHOT_REQUEST/RESP, │ │
│  │       FLUSH_PUSH on visibilitychange/beforeunload  │ │
│  │  MAIN world (content_script mainWorldNetwork.js):  │ │
│  │    • fetch + XHR wrappers                          │ │
│  │    • NetworkBuffer (ring)                          │ │
│  │    • Same bridge protocol with NETWORK_ prefix     │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌── Tab B (independent realm) ──────────────────────┐  │
│  │  Same as Tab A — INDEPENDENT buffers, INDEPENDENT │  │
│  │  wrapper instances. No sharing. Bootstrap reads    │  │
│  │  the same global state from background and shows  │  │
│  │  / hides its widget accordingly.                  │  │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### 9.2 Session state flow

```
[Widget UI] --ECHLY_SESSION_MODE_START--> [SW: globalUIState.sessionModeActive = true,
                                            activeSessionId = X, persists to storage]
                                              │
                                              ▼
                              [SW broadcasts ECHLY_GLOBAL_STATE to active tab]
                                              │
                                              ▼
                  [Bootstrap normalizes → setHostVisibility(true) → loadWidget if not loaded]
                                              │
                                              ▼
                       [Widget React state.session.status = "active"]

[Tab switch] --chrome.tabs.onActivated--> [SW: re-injects bootstrap, pushes ECHLY_GLOBAL_STATE
                                            to newly-activated tab]
                                              │
                                              ▼
                              [Same widget UI rebuilds on new tab from broadcast]

[30 min idle] --setTimeout--> [endSessionFromIdle: activeSessionId=null, broadcast to all tabs,
                                each tab receives ECHLY_RESET_WIDGET]
```

### 9.3 Capture data flow (current)

```
console.log() in page                              fetch() in page
  ↓ MAIN-world wrapper                               ↓ MAIN-world wrapper
ConsoleBuffer.addLog                                NetworkBuffer.addRequest
  (per-tab, max 50 entries, 5-min age)               (per-tab ring)
  ↓                                                  ↓
  └──────────── Click "Capture" in widget ──────────┘
                          ↓
        ISOLATED-world bridge posts SNAPSHOT_REQUEST to same window
                          ↓
        MAIN-world replies with buffer.snapshot()
                          ↓
        CaptureWidget bundles into CaptureContext
                          ↓
        processFeedbackPipeline → ECHLY_CREATE_FEEDBACK to SW
                          ↓
        SW createFeedbackInternal → POST /api/feedback (with consoleLogs, networkRequests)
```

### 9.4 Does the current model support continuous cross-tab sessions?

**No.** Three blocking facts:

1. **Session state is global** across the browser (one `activeSessionId`), so multiple tabs *can* share a session conceptually. But —
2. **Buffers are per-tab.** Each tab has its own MAIN-world realm and its own `ConsoleBuffer` / `NetworkBuffer` instance. When a ticket is filed on tab A, only tab A's buffers are read.
3. **No aggregation point.** There is no service-worker-side buffer that receives flush-pushes from each tab; the only flush listener that exists (network's) is not even wired up.

Consequence: a Loom-style session where the user files a ticket after visiting tabs A → B → C will capture only what happened on tab C between when tab C last refreshed and the click. Anything that happened on tabs A and B is unreachable — even if the session was "active" the whole time.

### 9.5 Gaps between current and target

| Target characteristic | Current state | Gap |
|---|---|---|
| Capture only when a session is active | Capture runs on every tab, always | Need to gate install of MAIN-world wrappers on session-active signal, or to gate `addLog` / `addRequest` calls on a session flag |
| Capture follows the user across tabs (continuous) | Each tab has its own buffer; cross-tab data not aggregated | Need an SW-side buffer (or a per-session buffer keyed by `activeSessionId`) plus periodic flush from each tab |
| MAIN-world capture only on session start | Always installed via declarative content_scripts at `document_start` | Need to remove declarative entries, switch to `chrome.scripting.executeScript`/`registerContentScripts` keyed on session start |
| No capture on internal/sensitive domains | No domain-level skip (only content denylist) | Need a domain denylist that prevents injection |
| Wrapper churn on heavy SPAs | Defensive code mitigates but wrappers still always run | If session-gated, the average SPA tab would never see Annote at all |

---

## SECTION 10 — Migration readiness assessment

### 10.1 Concrete changes needed

1. **Remove MAIN-world entries from `manifest.json` / `manifest.local.json`** (the `mainWorld.js` and `mainWorldNetwork.js` entries at [manifest.json:31-44](annote-extension/manifest.json#L31-L44)). Keep `bootstrap.js` declarative so the message router is available on every tab from `document_start` — this is needed to dispatch `ECHLY_OPEN_WIDGET` immediately when the user clicks the action.
2. **Add programmatic injection of MAIN-world scripts at session-start time** in `src/background.ts`. Likely site: `ECHLY_SESSION_MODE_START` handler around [src/background.ts:1701-1713](annote-extension/src/background.ts#L1701-L1713) — call `chrome.scripting.executeScript({ target, world: "MAIN", files: [...] })` for the current tab.
3. **Add per-tab injection on tab activation and tab update** during an active session — extend the existing `chrome.tabs.onActivated` ([src/background.ts:1083](annote-extension/src/background.ts#L1083)) and `chrome.tabs.onUpdated` ([src/background.ts:1112](annote-extension/src/background.ts#L1112)) handlers to also inject MAIN-world scripts when `cachedEchlyActive && activeSessionId != null` and the tab hasn't already been injected. Need a parallel `mainWorldInjectedTabs: Set<number>` next to the existing `injectedTabs` ([src/background.ts:50](annote-extension/src/background.ts#L50)).
4. **Build a session-buffer in the service worker** that aggregates console + network entries from all tabs participating in the session. The MAIN-world scripts need a periodic flush (e.g. every 10–30 s, or every N entries) — extend `flushPush()` in [src/console/mainWorld.ts:535](annote-extension/src/console/mainWorld.ts#L535) and [src/network/mainWorldNetwork.ts:1163](annote-extension/src/network/mainWorldNetwork.ts#L1163) to fire on a timer, and wire the isolated-world receiver to forward to SW. **This requires actually installing `installNetworkBridgeListener` somewhere** — currently dead code at [src/network/bridge.ts:106](annote-extension/src/network/bridge.ts#L106).
5. **Persist the session buffer** to `chrome.storage.local` (or `chrome.storage.session`) so SW restarts don't lose mid-session capture. Storage quota is 5 MB for `local` and 10 MB for `session` (with `unlimitedStorage` permission, higher) — bounded by buffer caps already in place.
6. **Change the ticket-creation path** to draw from the SW session buffer (not the tab's same-instant snapshot). The hop in `processFeedbackPipeline` at [src/content.tsx:806-868](annote-extension/src/content.tsx#L806-L868) would change shape: the widget no longer needs to pass `consoleLogs` / `networkRequests` — it tells the SW the feedback ID and the SW attaches whatever is in the session buffer.
7. **Teardown logic on session end.** In each `ECHLY_SESSION_MODE_END[_SOFT]` handler ([src/background.ts:1758-1839](annote-extension/src/background.ts#L1758-L1839)) and `endSessionFromIdle` ([src/background.ts:608-643](annote-extension/src/background.ts#L608-L643)), iterate tabs that had MAIN-world scripts injected and either (a) inject a script that calls a teardown function the wrappers expose, or (b) accept that wrappers persist until next page navigation and just stop draining (acceptable given the per-page realm dies on navigation anyway).
8. **Define a "capture-eligible" tab predicate.** Today's `<all_urls>` host_permissions allows everything — we may want to skip chrome-internal-style domains, the user's own auth broker / login pages, or user-configured opt-outs. Add this check before injection.

### 10.2 What's already reusable

- **Solid SW message router** at [src/background.ts:1242-onward](annote-extension/src/background.ts#L1242) — adding more `request.type` branches is the established pattern.
- **`ensureContentScriptInjected` + `injectedTabs` cache** ([src/background.ts:1002-1028](annote-extension/src/background.ts#L1002-L1028)) — the exact shape we need for MAIN-world scripts, just needs duplication keyed on the `world` parameter.
- **Cross-tab broadcast machinery** (`broadcastUIState`, `flushBroadcastUIState`, `getActiveTabIdForBroadcast`) — works today for state, can be reused to push session-bound capture messages.
- **Keepalive infrastructure** — `chrome.alarms("echly-keepalive")` ([src/background.ts:705-721](annote-extension/src/background.ts#L705-L721)) plus the per-tab keepalive port from bootstrap ([src/bootstrap.ts:95-119](annote-extension/src/bootstrap.ts#L95-L119)) already keep SW alive during a session — this is exactly the lifetime we want the SW-side buffer to span.
- **Ring buffers + redaction + circuit breaker + denylist code** in `src/console/` and `src/network/` are pure and reusable; the MAIN-world *install* code is the part that needs to be relocated.
- **Existing tab listeners** (`onActivated`, `onUpdated`, `onCreated`, `onRemoved`) already wired with the correct conditions (`cachedEchlyActive`) — only need additional injection calls.
- **Bootstrap-as-router pattern** — bootstrap is small and already idempotent (`__ECHLY_BOOTSTRAP_LOADED__`). Keeping it declarative means we always have a message endpoint for the SW even on tabs the user hasn't entered the session on yet.
- **`installNetworkBridgeListener` exists** but unused — the IPC shape is already designed; we just need to call it and route the SW handler.

### 10.3 Riskiest parts

1. **Wrappers installed mid-page-life.** Today the MAIN-world scripts run at `document_start` — before any page code, before any other extension's wrappers, before SDKs like Sentry. If we inject after session start, the page may already have wrapped console / fetch / XHR. The "wrapper war" defenses ([src/console/mainWorld.ts:329-403](annote-extension/src/console/mainWorld.ts#L329-L403), [src/network/mainWorldNetwork.ts:642-731](annote-extension/src/network/mainWorldNetwork.ts#L642-L731)) and the native-escape-hatch iframe trick are *more* needed in this model — but they may not be sufficient when SDKs install integrity checks of their own. The recent Jam-extension cycle commentary at [src/console/mainWorld.ts:485-500](annote-extension/src/console/mainWorld.ts#L485-L500) is a live example.
2. **Inflight-during-injection requests.** A user starts a session on Claude.ai while an SSE chat is in flight. We inject the network wrapper *after* `fetch()` was called, so this request goes uncaptured. Not catastrophic but a UX expectation gap.
3. **`run_at` timing.** `chrome.scripting.executeScript` runs as soon as scheduled and cannot retroactively run at `document_start`. New tabs entered mid-session will have a small window before the wrappers install. We can use `chrome.tabs.onUpdated` with `status === "loading"` to inject as early as possible, but it's not as early as the declarative path.
4. **MV3 SW lifecycle pinning.** SW-side buffer that lives across SW restarts requires `chrome.storage.local`/`session` writes per flush. Storage writes are expensive; need to batch carefully. The existing 5-min eviction policy in `ConsoleBuffer` is the natural cap.
5. **Tab → SW message floods.** If every wrapper flushes every 10 s × 10 active tabs in a session × console + network, that's significant message traffic. The existing `STATE_BROADCAST_DEBOUNCE_MS = 120` debounce ([src/background.ts:859](annote-extension/src/background.ts#L859)) is one-directional (SW→tabs); the reverse direction has no such throttle today.
6. **Snapshot semantics during the migration.** Existing widget code at [src/content.tsx:706-868](annote-extension/src/content.tsx#L706-L868) hard-codes "pull snapshot from same tab via bridge". Behaviour during the transition (some tabs on old MAIN-world, some on new) needs careful versioning.

### 10.4 Hidden coupling / inherited assumptions

1. **Widget is single-tab — assumed everywhere.** `processFeedbackPipeline` writes `currentUrl = window.location.href`, `userAgent = navigator.userAgent`, `viewportWidth / viewportHeight = window.innerWidth / Height` ([src/content.tsx:703, 818-845](annote-extension/src/content.tsx#L703)) — all taken from the tab the click occurred on. In a multi-tab session, "which page is this ticket about" is ambiguous; the current code answers "the current tab", and the network/console snapshot is also from the current tab. Migration may want to keep "where was the user when they clicked" as the canonical answer but also include cross-tab buffered data — making the payload shape grow.
2. **Snapshot pull happens at click time, not flush time.** [src/content.tsx:1487-1488](annote-extension/src/content.tsx#L1487-L1488). If we switch to "SW owns the buffer", the widget hands snapshot responsibility off to the SW and the click-time bridge call becomes a no-op (or a "flush now" trigger so we don't miss the last 0-10 s of the buffer).
3. **`ECHLY_RESET_WIDGET` broadcast on session end** ([src/background.ts:1788-1796](annote-extension/src/background.ts#L1788-L1796), [1828-1836](annote-extension/src/background.ts#L1828-L1836)) talks to every tab. If we expect bootstrap to also tear down MAIN-world capture, this message needs to *also* unhook the wrappers — but wrappers run in MAIN, bootstrap is ISOLATED, so we need a postMessage-based teardown protocol (mirror of the snapshot bridge) or accept that wrappers only die on page reload.
4. **Bootstrap auto-loads widget when session is active** ([src/bootstrap.ts:264-281, 421-422](annote-extension/src/bootstrap.ts#L264-L281)). This is correct behaviour even after migration, but it means every tab the user touches mid-session will mount the widget — which is fine for UI but means widget React state cleanup needs to be solid.
5. **`activeOwnerTabId` is the broadcast target heuristic** ([src/background.ts:911, 1084](annote-extension/src/background.ts#L911)). Cross-tab session model means the "active session tab" is ambiguous; tab-switch broadcasts already exist but the rehydrate-on-tab-switch logic at [src/background.ts:1086-1092](annote-extension/src/background.ts#L1086-L1092) may need refinement.
6. **`SESSION_IDLE_TIMEOUT = 30 min`** ([src/background.ts:598](annote-extension/src/background.ts#L598)) is reset only by explicit `ECHLY_SESSION_ACTIVITY` messages from the widget ([src/content.tsx:1543-1547](annote-extension/src/content.tsx#L1543-L1547)). If we want "user activity in any tab" to count, we need to broaden activity signal (e.g. wrapper records *any* fetch/log seen in last N seconds → ping SW). Otherwise a user who is browsing cross-tab but not interacting with the widget will idle out.

### 10.5 Verdict

**Mostly a clean migration on top of a solid foundation, with one substantial new component to build.**

The foundation is good:
- Service worker is already the source of truth for session state.
- Cross-tab broadcast / inject / state-sync wiring is already correctly factored.
- Programmatic injection is already in use for the widget — the same pattern extends to MAIN-world scripts.
- The wrapper code itself is battle-tested and reusable as-is.
- The session lifecycle (start / pause / resume / end / idle-end / soft-end) is well-defined and persisted.

The new part — an **SW-side session buffer that aggregates flushes from all tabs participating in the session** — is the one piece that does not exist today and that will dictate how the migration succeeds or fails. It also unlocks the broader "continuous capture follows the user" experience, so it's the right place to invest.

The riskiest piece is **wrapper installation after page load** — the MAIN-world scripts were carefully designed to run at `document_start`. Programmatic injection cannot replicate that, and the defensive wrapper-war code becomes load-bearing rather than belt-and-braces. Worth prototyping against Claude.ai, ChatGPT, and a Jam-coinstalled tab early.

---

## Key findings for migration planning

1. **MAIN-world capture is declarative and always-on.** `manifest.content_scripts` registers `mainWorld.js` + `mainWorldNetwork.js` at `document_start` on `<all_urls>`. There is no session-active gating in either script. Stopping capture when no session is active *requires* removing those entries.
2. **MAIN-world buffers are strictly per-tab.** Each top frame has its own `ConsoleBuffer` and `NetworkBuffer`. There is no cross-tab aggregation in either world.
3. **Service worker holds session state, but not capture data.** `activeSessionId`, `sessionModeActive`, `sessionPaused`, and the broader `globalUIState` live in `background.ts` (memory) + `chrome.storage.local` (durability). No console / network entries ever reach the SW today.
4. **Session is browser-global, not tab-scoped.** Any tab can read the same session via `ECHLY_GET_GLOBAL_STATE`; the widget auto-mounts on tab switch when a session is active.
5. **Tickets capture only the click-tab's buffer.** `processFeedbackPipeline` at [src/content.tsx:706](annote-extension/src/content.tsx#L706) pulls the snapshot from the *current* tab's MAIN bridge. Data from any tab the user previously visited in the session is unreachable.
6. **The flush-push channel is half-built.** Console flush is received and cached in the isolated world but does not reach the SW. Network flush listener is defined (`installNetworkBridgeListener`) but never installed — dead code at [src/network/bridge.ts:106](annote-extension/src/network/bridge.ts#L106).
7. **Session ends in 3 ways:** explicit (hard or soft), 30-minute idle, or service-worker-restart-without-storage. Closing a tab does NOT end the session. Filing a ticket does NOT end the session.
8. **Service worker recovery is partial.** `activeSessionId` survives via `chrome.storage.local`, but `extensionToken`, `globalUIState.pointers`, `globalUIState.counts` are reread/rehydrated on every cold start. **UNCLEAR:** the `sessionModeActive` restore branch in `initializeSessionState` ([src/background.ts:683](annote-extension/src/background.ts#L683)) sets the flag to `false` on a non-cold-start path that is unreachable in practice — needs a careful read in the migration.
9. **Widget injection is already programmatic.** `widget/widget.js` is injected via `chrome.scripting.executeScript` triggered by `ECHLY_LOAD_WIDGET` — same pattern can be extended to MAIN-world capture scripts.
10. **`ensureContentScriptInjected` + `injectedTabs` cache** is the working template for "lazily inject into a tab and remember we did". Will need to be duplicated per-world.
11. **Capture and widget are independent today.** MAIN-world buffers fill even when the widget is never mounted. After the migration, capture should be coupled to *session-active*, not to widget-mount.
12. **`<all_urls>` host_permissions + `<all_urls>` matches + `all_frames: false`** is the current scope. There is no domain denylist that prevents installation (the denylists in `src/{console,network}/denylist.ts` are *content* filters, not install gates). A session-driven model is the right time to add a domain opt-out.
13. **Wrapper integrity-check + escape-hatch code at [src/console/mainWorld.ts:407-429](annote-extension/src/console/mainWorld.ts#L407-L429) and [src/network/mainWorldNetwork.ts:1102-1127](annote-extension/src/network/mainWorldNetwork.ts#L1102-L1127)** assumes the wrapper installs at `document_start`. Post-load injection makes the wrapper-war defenses load-bearing — they need to be verified against real SPA scenarios (Claude.ai, ChatGPT, pages with Sentry/LogRocket/Jam installed).
14. **No `chrome.webNavigation` permission or listeners** today. If we need earlier signal than `chrome.tabs.onUpdated`, we'd add this permission (it triggers a re-prompt for users).
15. **`SESSION_IDLE_TIMEOUT` is reset only by widget-initiated `ECHLY_SESSION_ACTIVITY` messages.** In a cross-tab session, page activity in tabs without an open widget will not count — a continuous-capture model probably wants the wrappers themselves to ping activity, otherwise long passive sessions auto-end.
