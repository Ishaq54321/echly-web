# Extension Runtime Architecture Audit

**Read-only investigation.** No code was modified.  
Purpose: map full data flow and runtime behavior to diagnose **Bug A** (latest feedback not in tray after Pause) and **Bug B** (Resume button does not restore last session on fresh open).

---

## Section 1 — Global State Structure

**Primary file:** `echly-extension/src/background.ts`

### Module-level variable (line 13)

| Variable           | Type              | When it changes |
|--------------------|-------------------|------------------|
| `activeSessionId` | `string \| null`  | Set by `ECHLY_SET_ACTIVE_SESSION` (284); set `null` by `ECHLY_SESSION_MODE_END` (366). Restored from `chrome.storage.local` on background load (62). |

### `globalUIState` (lines 34–49)

Defined as:

```ts
let globalUIState: {
  visible: boolean;
  expanded: boolean;
  isRecording: boolean;
  sessionId: string | null;
  sessionModeActive: boolean;
  sessionPaused: boolean;
  pointers: StructuredFeedback[];
} = {
  visible: false,
  expanded: false,
  isRecording: false,
  sessionId: null,
  sessionModeActive: false,
  sessionPaused: false,
  pointers: [],
};
```

### Property-by-property

| Property            | File:Line   | Type                    | When it changes |
|---------------------|------------|-------------------------|------------------|
| `sessionId`         | background.ts:41, 63, 288, 311, 322, 334, 344, 356, 366, 418 | `string \| null` | Mirrored from `activeSessionId` on restore (63), `ECHLY_SET_ACTIVE_SESSION` (288), session mode handlers (311, 322, 334, 344), `ECHLY_SESSION_MODE_END` (366), `START_RECORDING` (418). |
| `sessionModeActive` | background.ts:42, 66, 239, 290, 311, 322, 334, 346, 356, 364 | `boolean` | `false` on load (66) and `ECHLY_TOGGLE_VISIBILITY` (239); `true` on `ECHLY_SET_ACTIVE_SESSION` (290), `ECHLY_SESSION_MODE_START` (311), `ECHLY_SESSION_MODE_PAUSE` (322), `ECHLY_SESSION_MODE_RESUME` (334); `false` on `ECHLY_SESSION_MODE_END` (346, 356, 364). |
| `sessionPaused`     | background.ts:43, 67, 239, 293, 325, 334, 347, 356, 364 | `boolean` | `false` on load (67), toggle visibility (239), set active (293), start (325), resume (334), end (347, 356, 364); `true` only in `ECHLY_SESSION_MODE_PAUSE` (325). |
| `pointers`          | background.ts:46, 298, 310, 369, 421 | `StructuredFeedback[]` | Cleared in `ECHLY_SET_ACTIVE_SESSION` when `sessionId` null (298), set from API in `ECHLY_SET_ACTIVE_SESSION` (310), cleared in `ECHLY_SESSION_MODE_END` (369); appended in `ECHLY_PROCESS_FEEDBACK` (421). |
| `visible`           | background.ts:40, 236 | `boolean` | Toggled in `ECHLY_TOGGLE_VISIBILITY` (236). |
| `expanded`           | background.ts:41, 239, 258, 266 | `boolean` | `false` in `ECHLY_TOGGLE_VISIBILITY` when visible (239); `true` in `ECHLY_EXPAND_WIDGET` (258); `false` in `ECHLY_COLLAPSE_WIDGET` (266). |
| `isRecording`        | background.ts:44, 341, 347 | `boolean` | `true` in `START_RECORDING` (341); `false` in `STOP_RECORDING` (347). |

### Recording-related state (widget / content)

- **Background:** Only `globalUIState.isRecording` (above).
- **Widget:** `recordingActiveRef` and `pipelineActiveRef` in `useCaptureWidget.ts` (see Section 11). They are not part of `globalUIState` but can block pointer sync.

---

## Section 2 — Session Lifecycle Command Handlers

All in `echly-extension/src/background.ts`, inside `chrome.runtime.onMessage.addListener`.

### ECHLY_SET_ACTIVE_SESSION (lines 286–324)

```ts
if (request.type === "ECHLY_SET_ACTIVE_SESSION") {
  const sessionId = (request as { sessionId?: string }).sessionId ?? null;
  activeSessionId = sessionId;
  globalUIState.sessionId = sessionId;
  globalUIState.sessionModeActive = true;
  globalUIState.sessionPaused = false;
  chrome.storage.local.set({
    activeSessionId: sessionId,
    sessionModeActive: true,
    sessionPaused: false,
  });
  (async () => {
    if (!sessionId) {
      globalUIState.pointers = [];
      broadcastUIState();
      sendResponse({ success: true });
      return;
    }
    try {
      const token = await getValidToken();
      const res = await fetch(`${API_BASE}/api/feedback?sessionId=...&limit=200`, ...);
      const json = ...;
      globalUIState.pointers = (json.feedback ?? []).map(...);
    } catch {
      globalUIState.pointers = [];
    }
    broadcastUIState();
    sendResponse({ success: true });
  })();
  return true;
}
```

- **Fields changed:** `activeSessionId`, `globalUIState.sessionId`, `sessionModeActive`, `sessionPaused`, `globalUIState.pointers` (after fetch).
- **broadcastUIState():** Yes (sync when `sessionId` null; after async fetch when non-null).

---

### ECHLY_SESSION_MODE_START (lines 336–345)

```ts
if (request.type === "ECHLY_SESSION_MODE_START") {
  globalUIState.sessionModeActive = true;
  globalUIState.sessionPaused = false;
  globalUIState.sessionId = activeSessionId;
  persistSessionLifecycleState();
  broadcastUIState();
  sendResponse({ ok: true });
  return false;
}
```

- **Fields changed:** `sessionModeActive`, `sessionPaused`, `sessionId`.
- **broadcastUIState():** Yes.

---

### ECHLY_SESSION_MODE_PAUSE (lines 347–356)

```ts
if (request.type === "ECHLY_SESSION_MODE_PAUSE") {
  globalUIState.sessionModeActive = true;
  globalUIState.sessionPaused = true;
  globalUIState.sessionId = activeSessionId;
  persistSessionLifecycleState();
  broadcastUIState();
  sendResponse({ ok: true });
  return false;
}
```

- **Fields changed:** `sessionModeActive`, `sessionPaused`, `sessionId` (no change to `pointers`).
- **broadcastUIState():** Yes.

---

### ECHLY_SESSION_MODE_RESUME (lines 358–367)

```ts
if (request.type === "ECHLY_SESSION_MODE_RESUME") {
  globalUIState.sessionModeActive = true;
  globalUIState.sessionPaused = false;
  globalUIState.sessionId = activeSessionId;
  persistSessionLifecycleState();
  broadcastUIState();
  sendResponse({ ok: true });
  return false;
}
```

- **Fields changed:** `sessionModeActive`, `sessionPaused`, `sessionId`.
- **broadcastUIState():** Yes.

---

### ECHLY_SESSION_MODE_END (lines 369–383)

```ts
if (request.type === "ECHLY_SESSION_MODE_END") {
  activeSessionId = null;
  globalUIState.sessionId = null;
  globalUIState.sessionModeActive = false;
  globalUIState.sessionPaused = false;
  globalUIState.pointers = [];
  chrome.storage.local.set({ activeSessionId: null, sessionModeActive: false, sessionPaused: false });
  broadcastUIState();
  setTimeout(broadcastUIState, 150);
  sendResponse({ success: true });
  return true;
}
```

- **Fields changed:** `activeSessionId`, `sessionId`, `sessionModeActive`, `sessionPaused`, `pointers`.
- **broadcastUIState():** Yes, plus delayed once.

---

### ECHLY_PROCESS_FEEDBACK (lines 537–702)

Handler is long; relevant part for pointers (lines 419–434):

```ts
if (typedFeedbackJson.success && typedFeedbackJson.ticket) {
  const tick = typedFeedbackJson.ticket;
  // ... firstCreated assignment ...
}
if (firstCreated) {
  const pointer: StructuredFeedback = { id: firstCreated.id, title: firstCreated.title, actionSteps: [], type: firstCreated.type };
  globalUIState.pointers = [...globalUIState.pointers, pointer];
  broadcastUIState();
  sendResponse({ success: true, ticket: firstCreated });
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { type: "ECHLY_FEEDBACK_CREATED", ticket: firstCreated, sessionId }).catch(() => {});
      }
    });
  });
}
```

- **Fields changed:** `globalUIState.pointers` (append).
- **broadcastUIState():** Yes (once per successful feedback creation).

---

## Section 3 — Pointer Update Flow

### Path: ECHLY_PROCESS_FEEDBACK → pointer in tray

1. **Content** sends `ECHLY_PROCESS_FEEDBACK` (e.g. from `onComplete` / session feedback pipeline in `useCaptureWidget.ts`).
2. **Background** (537–702): validates payload, calls structure API, then for each ticket POSTs `/api/feedback`; on first success builds `firstCreated`.
3. **Pointer construction** (419–424):  
   `const pointer: StructuredFeedback = { id: firstCreated.id, title: firstCreated.title, actionSteps: [], type: firstCreated.type };`
4. **Add to global state** (421):  
   `globalUIState.pointers = [...globalUIState.pointers, pointer];`
5. **Broadcast** (422):  
   `broadcastUIState();`
6. **Tabs receive** `ECHLY_GLOBAL_STATE` with `state.pointers` including the new pointer.
7. **Content** applies state (message listener + CustomEvent) → `setGlobalState(state)` → widget gets `pointersProp = globalState.pointers`.
8. **Widget** (`useCaptureWidget.ts`): effect with deps `[extensionMode, pointersProp]` runs; **if `recordingActiveRef.current` is false**, it runs `setPointers(pointersProp)` (1162–1168). If `recordingActiveRef.current` is true, the effect returns early and **does not** call `setPointers`, so the tray does not update.

Exact code path for pointer creation:

- `background.ts` 419–424 (build pointer), 421 (append to `globalUIState.pointers`), 422 (`broadcastUIState()`).
- Content: `ensureMessageListener` → `msg.type === "ECHLY_GLOBAL_STATE"` → `__ECHLY_APPLY_GLOBAL_STATE__?.(state)` and `window.dispatchEvent(ECHLY_GLOBAL_STATE)`.
- ContentApp: listener calls `setGlobalState(s)` (content.tsx 148–156).
- CaptureWidget receives `pointers={globalState.pointers}` (content.tsx 1236).
- useCaptureWidget effect (1162–1168): `if (recordingActiveRef.current) return; setPointers(pointersProp);`

---

## Section 4 — Global State Broadcast System

### broadcastUIState() (background.ts 197–209)

```ts
function broadcastUIState(): void {
  echlyLog("BACKGROUND", "broadcast global state", globalUIState);
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id) {
        chrome.tabs
          .sendMessage(tab.id, { type: "ECHLY_GLOBAL_STATE", state: globalUIState })
          .catch(() => { console.debug("ECHLY broadcast skipped tab", tab.id); });
      }
    });
  });
}
```

### Call sites (all in background.ts)

| Line(s) | Trigger |
|--------|--------|
| 68 | Background startup after `chrome.storage.local.get(["activeSessionId"], ...)` |
| 256 | ECHLY_TOGGLE_VISIBILITY |
| 263 | ECHLY_EXPAND_WIDGET |
| 270 | ECHLY_COLLAPSE_WIDGET |
| 303 | ECHLY_SET_ACTIVE_SESSION (when sessionId null) |
| 321 | ECHLY_SET_ACTIVE_SESSION (after feedback fetch) |
| 342 | ECHLY_SESSION_MODE_START |
| 353 | ECHLY_SESSION_MODE_PAUSE |
| 364 | ECHLY_SESSION_MODE_RESUME |
| 381, 382 | ECHLY_SESSION_MODE_END (immediate + setTimeout 150ms) |
| 466 | START_RECORDING |
| 472 | STOP_RECORDING |
| 680 | ECHLY_PROCESS_FEEDBACK (after appending pointer) |

Additional single-tab pushes (not `broadcastUIState`):

- **onActivated** (212–223): `sendMessage(tabId, { type: "ECHLY_GLOBAL_STATE", state: globalUIState })` and `ECHLY_SESSION_STATE_SYNC`.
- **onCreated** (226–234): `sendMessage(tab.id, { type: "ECHLY_GLOBAL_STATE", state: globalUIState })`.

### Message structure

- **Type:** `"ECHLY_GLOBAL_STATE"`.
- **Payload:** `{ type: "ECHLY_GLOBAL_STATE", state: globalUIState }` where `globalUIState` is the object defined in Section 1 (visible, expanded, isRecording, sessionId, sessionModeActive, sessionPaused, pointers).

### How tabs receive it

- Content script registers a single `chrome.runtime.onMessage` listener in `ensureMessageListener(host)` (content.tsx 1368–1414).
- On `msg.type === "ECHLY_GLOBAL_STATE"` and `msg.state`: sets host visibility, calls `window.__ECHLY_APPLY_GLOBAL_STATE__?.(state)`, and dispatches `window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE", { detail: { state } }))`.
- ContentApp has a `window.addEventListener("ECHLY_GLOBAL_STATE", handler)` (148–158) that calls `setHostVisibility(s.visible)` and `setGlobalState(s)` with no skip logic (no `ignoreNextGlobalState` in current code).

---

## Section 5 — Content Script State Pipeline

**File:** `echly-extension/src/content.tsx`

### ECHLY_GLOBAL_STATE handling

1. **Message listener** (1377–1382): On `msg.type === "ECHLY_GLOBAL_STATE"` and `msg.state`:
   - `setHostVisibility(state.visible)`
   - `(window as any).__ECHLY_APPLY_GLOBAL_STATE__?.(state)`
   - `window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE", { detail: { state } }))`

2. **__ECHLY_APPLY_GLOBAL_STATE__** is set in ContentApp (136–139):
   - `applyGlobalState = (state) => { setHostVisibility(state.visible); setGlobalState(state); }`
   - Assigned to `window.__ECHLY_APPLY_GLOBAL_STATE__` in a useEffect (no cleanup that would prevent applying).

3. **ContentApp CustomEvent handler** (148–158): On "ECHLY_GLOBAL_STATE":
   - If `e.detail?.state` missing, return.
   - `setHostVisibility(s.visible)` and `setGlobalState(s)`.
   - No guard that skips when `sessionId` is unchanged; state is always overwritten.

So: **ECHLY_APPLY_GLOBAL_STATE** is effectively “apply this full state to host visibility and React globalState.” There is no logic that ignores pointer updates when `sessionId` stays the same.

### ECHLY_GET_GLOBAL_STATE

- Sent from content (e.g. mount 164–172, visibility 176–189, `syncInitialGlobalState` 1337–1344, `ECHLY_SESSION_STATE_SYNC` 1393–1401).
- Background responds with `{ state: { ...globalUIState } }` (274–276).
- Content applies via `normalizeGlobalState` and then `setHostVisibility` + `dispatchGlobalState` (or `__ECHLY_APPLY_GLOBAL_STATE__` + CustomEvent).

---

## Section 6 — Widget Pointer Sync

**File:** `components/CaptureWidget/hooks/useCaptureWidget.ts`

### Effect that updates pointers from props (1161–1168)

```ts
/** Extension: sync global pointers from background so all tabs show the same tray. */
useEffect(() => {
  if (!extensionMode || pointersProp === undefined) return;
  if (recordingActiveRef.current) return;
  setPointers(pointersProp);
  setSessionFeedbackPending(null);
}, [extensionMode, pointersProp]);
```

- **Dependencies:** `extensionMode`, `pointersProp`.
- **Guard:** If `recordingActiveRef.current === true`, the effect returns without calling `setPointers(pointersProp)`. So **recordingActiveRef blocks pointer updates** while the user is in a recording flow (voice_listening, processing, pill exiting, etc.).

### pauseSession (983–1029)

- Calls `onSessionModePause?.()` (which sends `ECHLY_SESSION_MODE_PAUSE`).
- If `pipelineActiveRef.current` is true, sets `pausePending` and polls until pipeline is done, then calls `finalizePause()` → `onSessionModePause?.()`.
- Does not modify `pointers` or `pointersProp`; pause is purely lifecycle + broadcast.

### resumeSession (1031–1038)

- Sets `pausePending`/`endPending` false, calls `onSessionModeResume?.()` (sends `ECHLY_SESSION_MODE_RESUME`).

### endSession (1040–1076)

- Clears pending, calls `setPointers([])` in `finalizeEnd`, then `onSessionModeEnd?.()` (sends `ECHLY_SESSION_MODE_END`).

---

## Section 7 — Pause Recording Flow

### Sequence (SessionControlPanel → widget → content → background → broadcast → widget)

1. **User clicks Pause**  
   SessionControlPanel (e.g. SessionOverlay → SessionControlPanel) calls `onPause` → widget’s `handlers.pauseSession()` (useCaptureWidget 983–1029).

2. **pauseSession() in useCaptureWidget**  
   - If `pipelineActiveRef.current`: set `pausePending`, poll until pipeline finishes, then `finalizePause()`.  
   - `finalizePause()`: `onSessionModePause?.()`.

3. **Content**  
   `onSessionModePause` (content.tsx 1242): `chrome.runtime.sendMessage({ type: "ECHLY_SESSION_MODE_PAUSE" })`.

4. **Background**  
   ECHLY_SESSION_MODE_PAUSE (347–356): set `sessionModeActive`, `sessionPaused`, `sessionId`, persist, **broadcastUIState()**.

5. **Broadcast**  
   All tabs get `ECHLY_GLOBAL_STATE` with `sessionPaused: true` and **current** `globalUIState.pointers` (whatever they are at that moment).

6. **Content**  
   Message listener applies state, dispatches CustomEvent; ContentApp runs `setGlobalState(s)` → widget receives new `globalSessionPaused` and `pointers` (content 1236, 1240–1241).

7. **Widget**  
   - Session sync effect (1089–1116, 1134–1144): sets `sessionPaused(true)`, `pausePending(false)`.  
   - Pointer sync effect (1162–1168): runs when `pointersProp` changes; **if `recordingActiveRef.current` is true, it returns without `setPointers(pointersProp)`**, so tray does not update.

### Order of events and Bug A

- **If ECHLY_PROCESS_FEEDBACK finishes before Pause broadcast:**  
  Background already has the new pointer; pause broadcast includes it. Content updates `globalState.pointers`. Widget effect runs; if `recordingActiveRef.current` is still true (user still in processing/pill state), pointer update is skipped → **latest feedback can still be missing in tray**.

- **If user presses Pause before ECHLY_PROCESS_FEEDBACK completes:**  
  Pause broadcast carries old pointers. Later, ECHLY_PROCESS_FEEDBACK completes and broadcasts again with new pointer. When that second broadcast is applied, `recordingActiveRef` may still be true (e.g. pipeline just finished, UI not yet idle), so again the pointer sync effect can skip the update.

So the critical point is: **whether the pointer broadcast happens before or after Pause, the tray can fail to show the latest feedback because the pointer sync effect refuses to run while `recordingActiveRef.current` is true.**

### Timeline (conceptual)

| T | Event |
|---|--------|
| T0 | User submits feedback (e.g. voice) → pipeline starts, `recordingActiveRef = true`, `pipelineActiveRef = true`. |
| T1 | Background may still be running ECHLY_PROCESS_FEEDBACK (async). |
| T2 | User clicks Pause. pauseSession() runs; if pipeline active, waits. |
| T3 | Pipeline finishes (content onSuccess / background success). `pipelineActiveRef = false`; background may append pointer and broadcast. |
| T4 | finalizePause() runs → ECHLY_SESSION_MODE_PAUSE → broadcast. |
| T5 | Tab receives one or two ECHLY_GLOBAL_STATE messages (with or without new pointer). Content sets `globalState` (including pointers). |
| T6 | Widget pointer sync effect runs. If `recordingActiveRef.current` is still true (e.g. state not yet "idle"), **setPointers is skipped** → tray does not show latest feedback. |

---

## Section 8 — Resume Button Logic

### Where the Resume button is shown and enabled

**CaptureWidget.tsx (92, 161–165, 305–306):**

- `showResumeButton = Boolean(lastKnownSessionId) || hasStoredSession`  
  where `hasStoredSession = Boolean(sessionId)` (82) and `sessionId` is the prop from content (globalState.sessionId).
- `onResumeSession` is passed as `handleResumeActiveSession` when `extensionMode && showResumeButton`.
- `handleResumeActiveSession`: uses `lastKnownSessionId ?? sessionId` and calls `onResumeSessionSelect?.(sessionToResume, { enterCaptureImmediately: true })`.

**WidgetFooter.tsx (28, 47–48):**

- `resumeDisabled = effectivelyDisabled || !onResumeSession`
- `effectivelyDisabled = !isIdle || captureDisabled`
- So Resume is disabled if not idle, or capture disabled, or **onResumeSession is not passed**. It is passed only when `showResumeButton` is true.

So the effective condition for the Resume button to be **enabled** is:

- `showResumeButton === true` → `Boolean(lastKnownSessionId) || Boolean(sessionId)`.
- And `onResumeSession` is only passed when `showResumeButton` is true, so the button is hidden/disabled when both `lastKnownSessionId` and `sessionId` are falsy.

**Variables that control it:**

- **lastKnownSessionId** (content.tsx): Set by effect when `globalState.visible` is true; sends `ECHLY_GET_ACTIVE_SESSION` and sets `lastKnownSessionId(response.sessionId)` (216–221).
- **sessionId** (prop): From content `globalState.sessionId`, which comes from the last `ECHLY_GLOBAL_STATE` (or `ECHLY_GET_GLOBAL_STATE`) applied.

So Resume is disabled when both:

- `lastKnownSessionId` is null (e.g. ECHLY_GET_ACTIVE_SESSION not yet returned or returned null), and  
- `sessionId` is null (e.g. last applied global state had no session).

---

## Section 9 — Last Session Persistence

### chrome.storage.local usage (background.ts)

| Keys written | When | Location |
|-------------|------|----------|
| `activeSessionId`, `sessionModeActive`, `sessionPaused` | persistSessionLifecycleState() | 51–57 |
| Same | ECHLY_SET_ACTIVE_SESSION | 292–296 |
| Same | ECHLY_SESSION_MODE_END | 374–378 |
| `activeSessionId` only (read) | Background startup | 60–69 |
| `activeSessionId` (read) | ECHLY_GET_ACTIVE_SESSION handler | 278–285 |

**No** `lastSessionIdWithTickets` or similar; only `activeSessionId` (+ lifecycle flags) is persisted for session.

### When it is saved

- **activeSessionId:** On ECHLY_SET_ACTIVE_SESSION (with request’s sessionId), and via `persistSessionLifecycleState()` in ECHLY_SESSION_MODE_START, PAUSE, RESUME, and ECHLY_TOGGLE_VISIBILITY (when visible becomes true). Not cleared until ECHLY_SESSION_MODE_END.

### When it is restored

- **Background startup** (60–69): `chrome.storage.local.get(["activeSessionId"], (result) => { activeSessionId = stored; globalUIState.sessionId = activeSessionId; globalUIState.sessionModeActive = false; globalUIState.sessionPaused = false; broadcastUIState(); })`.  
  So only **activeSessionId** is read from storage; sessionModeActive and sessionPaused are always reset to false on load. If the get callback has not run yet (e.g. right after service worker starts), `globalUIState.sessionId` is still the initial `null` when the first broadcast runs.

- **ECHLY_GET_ACTIVE_SESSION:** Does its own `chrome.storage.local.get(["activeSessionId"], ...)` and returns `sessionId: result.activeSessionId || null`. It does not rely on in-memory `activeSessionId`.

### Extension startup (background)

- On load, the script runs top-down; the only session-related init is the async `chrome.storage.local.get(["activeSessionId"], ...)` (60–69). No other startup logic restores session. So the first `broadcastUIState()` (e.g. triggered by ECHLY_TOGGLE_VISIBILITY right after open) can run **before** this callback, and then the broadcast carries `sessionId: null`.

---

## Section 10 — Tab Initialization

### Content script load

- Injected per manifest. No explicit “tab load” handler in this audit; `main()` (1410–1434) runs when the script runs: ensures host element, mounts React, `ensureMessageListener(host)`, `syncInitialGlobalState(host)`, `ensureVisibilityStateRefresh()`.

### syncInitialGlobalState(host) (1336–1346)

- Sends `ECHLY_GET_GLOBAL_STATE` to background.
- On response, normalizes state, sets host visibility, and `dispatchGlobalState(normalized)` (CustomEvent), which ContentApp’s listener uses to call `setGlobalState(s)`.

So when a tab loads the extension (content script runs), it immediately requests current global state and applies it. If the background has not yet run its storage callback, the response can still have `sessionId` from in-memory `globalUIState` (which may be null).

### How state reaches the widget

- ContentApp state `globalState` is updated by ECHLY_GLOBAL_STATE (message + CustomEvent) and ECHLY_GET_GLOBAL_STATE (syncInitialGlobalState, visibility, ECHLY_SESSION_STATE_SYNC).
- CaptureWidget is rendered with `pointers={globalState.pointers}`, `globalSessionModeActive={globalState.sessionModeActive}`, `globalSessionPaused={globalState.sessionPaused}`, `sessionId` from effective session, etc. (content.tsx 1235–1241).
- So the widget receives state purely via React props driven by content’s `globalState`.

---

## Section 11 — Recording State Variables

Variables that can block pointer or UI updates:

| Variable | File:location | When set true | When set false |
|----------|----------------|----------------|-----------------|
| recordingActiveRef | useCaptureWidget.ts:211, 524, 531, 569, 574, 583, 744 | startListening (569) | recognition onend (524, 531), finishListening (583), discardListening (744), error paths (574) |
| pipelineActiveRef | useCaptureWidget.ts:189, 632, 635, 652, 659, 669, 672, 697, 1248, 1251, 1270, 1277 | Before onComplete / session feedback pipeline | In onSuccess/onError and catch (635, 652, 659, 672, 697, 1251, 1270, 1277) |
| pausePending | useCaptureWidget.ts | When pause requested while pipeline active (1003) | finalizePause, or when globalSessionPaused sync (1102) |
| endPending | useCaptureWidget.ts | When end requested while pipeline active (1057) | finalizeEnd (1055) |

**Where they block updates:**

- **recordingActiveRef:** Pointer sync effect (1165): `if (recordingActiveRef.current) return;` → no `setPointers(pointersProp)`. Also removeCaptureRoot (393) and global sync effects (1106, 1122) can bail when `recordingActiveRef.current` is true.
- **pipelineActiveRef:** Pause and end handlers wait for it before sending ECHLY_SESSION_MODE_PAUSE / ECHLY_SESSION_MODE_END; it does not directly guard the pointer effect, but the pipeline keeps the UI in a non-idle state so `recordingActiveRef` may still be true when the broadcast is applied.

---

## Section 12 — Event Timelines

### Timeline A — Pause flow (with feedback)

| Step | Actor | Event |
|------|--------|--------|
| 1 | User | Submits feedback (e.g. voice) |
| 2 | Widget | Enters processing, sets recordingActiveRef/pipelineActiveRef true |
| 3 | Content | Sends ECHLY_PROCESS_FEEDBACK (or local pipeline runs) |
| 4 | Background | Processes feedback (async); on success appends to globalUIState.pointers, broadcastUIState() |
| 5 | User | Presses Pause |
| 6 | Widget | pauseSession(); if pipeline active, sets pausePending, waits |
| 7 | Widget/Background | Pipeline completes; background may have already broadcast with new pointer |
| 8 | Widget | finalizePause() → onSessionModePause → content sends ECHLY_SESSION_MODE_PAUSE |
| 9 | Background | ECHLY_SESSION_MODE_PAUSE handler: sessionPaused = true, broadcastUIState() |
| 10 | Content | Receives ECHLY_GLOBAL_STATE, setGlobalState (pointers may or may not include latest) |
| 11 | Widget | Session sync effect: setSessionPaused(true). Pointer sync effect runs; if recordingActiveRef still true → **setPointers skipped** → tray does not show latest feedback |

### Timeline B — Resume flow (extension opens fresh)

| Step | Actor | Event |
|------|--------|--------|
| 1 | User | Opens extension (e.g. clicks icon) |
| 2 | Background | May start or already running; chrome.storage.local.get(["activeSessionId"], ...) is async |
| 3 | Popup | Sends ECHLY_TOGGLE_VISIBILITY |
| 4 | Background | visible = true; sessionModeActive/sessionPaused = false; ECHLY_RESET_WIDGET to tabs; broadcastUIState() |
| 5 | Background | If storage get has not run yet, globalUIState.sessionId is still null → broadcast carries sessionId: null |
| 6 | Content | Receives ECHLY_GLOBAL_STATE (and RESET); setGlobalState(state) → sessionId can be null |
| 7 | Content | Effect (visible true) runs: sends ECHLY_GET_ACTIVE_SESSION |
| 8 | Background | ECHLY_GET_ACTIVE_SESSION: chrome.storage.local.get(["activeSessionId"], ...) → sendResponse({ sessionId }) |
| 9 | Content | Callback: if response.sessionId, setLastKnownSessionId(response.sessionId) |
| 10 | Widget | showResumeButton = Boolean(lastKnownSessionId) \|\| hasStoredSession. If step 9 is delayed or fails, lastKnownSessionId stays null and sessionId from state is null → **Resume button disabled or not shown** |

---

## Section 13 — Root Cause Analysis

### Bug A — Latest feedback does not appear in tray when user presses Pause

**Cause:** The widget’s pointer sync in `useCaptureWidget.ts` does not apply incoming `pointersProp` (from ECHLY_GLOBAL_STATE) while `recordingActiveRef.current` is true.

- **File:** `components/CaptureWidget/hooks/useCaptureWidget.ts`
- **Function:** Effect at lines 1162–1168 (Extension: sync global pointers from background).
- **Exact line:** 1165: `if (recordingActiveRef.current) return;`

When the user presses Pause, the broadcast (with or without the new pointer) is applied in content and `pointersProp` updates. The effect runs but exits early when the user is still in a recording-related state (voice_listening, processing, or pill exiting), so `setPointers(pointersProp)` is never called and the tray keeps the old list. So the **exact state transition that fails** is: “apply latest global pointers to the widget’s local `pointers` state when the last broadcast includes the new feedback but the widget is still in a recording flow.”

---

### Bug B — Resume button does not restore last active session when extension is opened fresh

**Contributing causes:**

1. **Broadcast before restore (background)**  
   On startup, only `chrome.storage.local.get(["activeSessionId"], ...)` restores session id; the callback is async. If ECHLY_TOGGLE_VISIBILITY runs and calls `broadcastUIState()` before that callback, `globalUIState.sessionId` is still null, so the first ECHLY_GLOBAL_STATE sent to tabs has `sessionId: null`. Then `hasStoredSession = Boolean(sessionId)` is false.

2. **Resume depends on async ECHLY_GET_ACTIVE_SESSION**  
   `lastKnownSessionId` is set only when the effect (content.tsx 216–221) runs (visible true) and the ECHLY_GET_ACTIVE_SESSION response returns a sessionId. So on first paint, `lastKnownSessionId` can still be null and `sessionId` (from global state) can be null → `showResumeButton` is false and the Resume button is disabled or not passed.

3. **Exact failure point**  
   - **File:** `echly-extension/src/background.ts` (startup 60–69): first broadcast can happen before storage callback populates `globalUIState.sessionId`.  
   - **File:** `echly-extension/src/content.tsx` (216–221): `lastKnownSessionId` is set asynchronously; until the ECHLY_GET_ACTIVE_SESSION callback runs, Resume is disabled if `sessionId` is also null.  
   - **File:** `components/CaptureWidget/CaptureWidget.tsx` (92): `showResumeButton = Boolean(lastKnownSessionId) || hasStoredSession` — both can be false on first render after fresh open.

So the **exact state transition that fails** is: “show Resume as enabled and bind it to the last session as soon as the extension is opened,” because either the first broadcast has no sessionId or the UI renders before ECHLY_GET_ACTIVE_SESSION has set lastKnownSessionId.

---

## Section 14 — Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│ BACKGROUND (echly-extension/src/background.ts)                            │
│   activeSessionId (module)  ←→  globalUIState.sessionId                   │
│   globalUIState: visible, expanded, isRecording, sessionId,               │
│                  sessionModeActive, sessionPaused, pointers[]             │
│   Persist: chrome.storage.local [activeSessionId, sessionModeActive,       │
│            sessionPaused]  (on load: get activeSessionId only)             │
└─────────────────────────────────────────────────────────────────────────┘
         │
         │ broadcastUIState() → chrome.tabs.sendMessage(tabId,
         │   { type: "ECHLY_GLOBAL_STATE", state: globalUIState })
         │ Also: onActivated / onCreated → same message to one tab
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ CONTENT SCRIPT (echly-extension/src/content.tsx)                         │
│   chrome.runtime.onMessage → ECHLY_GLOBAL_STATE:                         │
│     setHostVisibility(state.visible)                                      │
│     __ECHLY_APPLY_GLOBAL_STATE__?.(state)  → setGlobalState(state)       │
│     dispatchEvent(ECHLY_GLOBAL_STATE)                                     │
│   ContentApp: globalState (React state) ← from ECHLY_GLOBAL_STATE /      │
│               ECHLY_GET_GLOBAL_STATE                                     │
│   lastKnownSessionId ← ECHLY_GET_ACTIVE_SESSION (when visible)            │
└─────────────────────────────────────────────────────────────────────────┘
         │
         │ props: sessionId, pointers (= globalState.pointers),              │
         │        globalSessionModeActive, globalSessionPaused,              │
         │        lastKnownSessionId, onSessionModePause, ...               │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ WIDGET (CaptureWidget.tsx + useCaptureWidget.ts)                         │
│   pointersProp (from content globalState.pointers)                        │
│   Effect: if !recordingActiveRef.current → setPointers(pointersProp)     │
│           else → SKIP (Bug A: tray does not update)                      │
│   Session: globalSessionModeActive / globalSessionPaused → sessionMode,  │
│            sessionPaused, pauseSession/resumeSession/endSession          │
│   Resume: showResumeButton = lastKnownSessionId || sessionId (Bug B:    │
│           both null on fresh open until ECHLY_GET_ACTIVE_SESSION returns)  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Pointer update flow (detail)

```
ECHLY_PROCESS_FEEDBACK (content → background)
  → background: POST structure + feedback APIs
  → firstCreated → pointer = { id, title, actionSteps, type }
  → globalUIState.pointers = [...globalUIState.pointers, pointer]
  → broadcastUIState()
  → each tab: ECHLY_GLOBAL_STATE { state: globalUIState }
  → content: setGlobalState(state)  →  pointersProp = state.pointers
  → widget effect [extensionMode, pointersProp]:
       if (recordingActiveRef.current) return;   // ← BLOCKS HERE (Bug A)
       setPointers(pointersProp);
```

---

**End of audit.** No code was modified; this is an investigation report only.
