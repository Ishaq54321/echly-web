# Echly Extension — Session State Bug Diagnostic Report

**Issue:** Feedback list in the extension tray resets to zero after: **Pause session → Minimize tray → Resume session**. Backend still has feedback; tray UI shows 0 then counts from 1 again.

**Scope:** Read-only architecture and lifecycle audit. No code changes; diagnosis only.

---

## 1. Session Lifecycle (Events)

### 1.1 Event Summary

| Event | Origin | Handled | State modified |
|-------|--------|---------|----------------|
| **ECHLY_SESSION_MODE_START** | Content (tray “Start” / session start) | Background | `globalUIState.sessionModeActive=true`, `sessionPaused=false`, `sessionId=activeSessionId`, `expanded=true`; persist; broadcast. **Does not touch `pointers`.** |
| **ECHLY_SESSION_MODE_PAUSE** | Content (tray Pause) | Background | `globalUIState.sessionModeActive=true`, `sessionPaused=true`, `sessionId=activeSessionId`; persist; broadcast. **Does not touch `pointers`.** |
| **ECHLY_SESSION_MODE_RESUME** | Content (tray Resume) | Background | `globalUIState.sessionModeActive=true`, `sessionPaused=false`, `sessionId=activeSessionId`; persist; broadcast. **Does not touch `pointers`.** |
| **ECHLY_SET_ACTIVE_SESSION** | Content (new session or “Previous Session” picker) | Background | Sets `activeSessionId`, `globalUIState.sessionId`, `sessionModeActive=true`, `sessionPaused=false`, `sessionLoading=true`; then **async** fetches `/api/feedback?sessionId=...` and sets `globalUIState.pointers` from response (or `[]` on failure). Broadcasts twice (before and after fetch). |
| **ECHLY_SESSION_UPDATED** | Content (after PATCH session title) | Background | If `sessionId` matches, updates `globalUIState.sessionTitle`; broadcast. |
| **ECHLY_FEEDBACK_CREATED** | Content (after creating ticket via API) | Background | Appends one item to `globalUIState.pointers`; broadcast. |
| **ECHLY_GLOBAL_STATE** | Background (broadcast) | Content | Content applies full state: `setGlobalState(s)` and `setHostVisibility(getShouldShowTray(s))`. **Overwrites content’s `globalState` (including `pointers`) with background’s state.** |

### 1.2 Code Locations

- **Content sends:** `content.tsx` ~787 (SET_ACTIVE_SESSION + SESSION_MODE_START), ~1367–1369 (SESSION_MODE_START/PAUSE/RESUME), ~781 (onActiveSessionChange → SET_ACTIVE_SESSION).
- **Background handles:** `background.ts` 415 (SET_ACTIVE_SESSION), 478 (SESSION_MODE_START), 497 (SESSION_MODE_PAUSE), 509 (SESSION_MODE_RESUME), 386 (SESSION_UPDATED), 359 (FEEDBACK_CREATED).
- **Background broadcasts:** `background.ts` 288–301 `broadcastUIState()` (sends `{ type: "ECHLY_GLOBAL_STATE", state: globalUIState }` to all tabs).
- **Content receives:** `content.tsx` 185–195 (window listener for `ECHLY_GLOBAL_STATE` → `setGlobalState(s)`); `content.tsx` 1513–1527 (chrome.runtime.onMessage → `__ECHLY_APPLY_GLOBAL_STATE__?.(state)` and `dispatchEvent(ECHLY_GLOBAL_STATE)`).

---

## 2. Background Session State

**File:** `echly-extension/src/background.ts`

### 2.1 `globalUIState` structure

```ts
let globalUIState: {
  visible: boolean;
  expanded: boolean;
  isRecording: boolean;
  sessionId: string | null;
  sessionTitle: string | null;
  sessionModeActive: boolean;
  sessionPaused: boolean;
  sessionLoading: boolean;
  pointers: StructuredFeedback[];   // ← feedback list for tray
  captureMode: "voice" | "text";
}
```

- **Feedback list:** Background stores the list in **`globalUIState.pointers`** only (no separate “feedback list”).
- **Pause/Resume:** `ECHLY_SESSION_MODE_PAUSE` (497) and `ECHLY_SESSION_MODE_RESUME` (509) **do not modify `pointers`**. They only update session flags and call `persistSessionLifecycleState()` and `broadcastUIState()`.
- **When `pointers` is cleared:** Only in `endSessionFromIdle()` (77), `ECHLY_SESSION_MODE_END` (531), `ECHLY_SET_ACTIVE_SESSION` when `sessionId` is null (434–436), or when the SET_ACTIVE_SESSION async fetch fails (460–461). None of these run on Pause, Minimize, or Resume.

So for **Pause → Minimize → Resume**, background should keep the same `pointers` and broadcast that same list after resume.

---

## 3. Content Script State

**File:** `echly-extension/src/content.tsx`

### 3.1 React state used for session / tray

- **`globalState`** (useState, ~100–112): Holds the full UI state from background, including `pointers: []` initially. **Single source for tray:** “derived only from background (ECHLY_GLOBAL_STATE).”
- **`feedbackJobs`** (useState): In-flight feedback jobs (processing queue). Not the persisted feedback list; completed items are reflected via background’s `pointers` (ECHLY_FEEDBACK_CREATED).
- **`widgetResetKey`**: Incremented only on `ECHLY_RESET_WIDGET` (session end / idle). Used as `key={widgetResetKey}` on `CaptureWidget`; when it changes, the widget remounts.
- **`effectiveSessionId`**: `globalState.sessionId`.

### 3.2 How the tray gets the feedback list

- Tray receives **`pointers={globalState.pointers ?? []}`** (content.tsx ~1356).
- So the tray list is **always** driven by content’s `globalState.pointers`, which is overwritten on every **ECHLY_GLOBAL_STATE** (and on ECHLY_GET_GLOBAL_STATE response and visibilitychange resync).

### 3.3 When feedback list is effectively “loaded”

- **Session start:** Background does not refetch pointers on SESSION_MODE_START; pointers are already set from a previous SET_ACTIVE_SESSION or init.
- **Session resume:** Only SESSION_MODE_RESUME is sent; background does not refetch; it keeps existing `pointers` and broadcasts.
- **Tray expand:** ECHLY_EXPAND_WIDGET only sets `expanded=true` and broadcasts current state (including existing pointers).
- **Tray mount:** On mount, content sends ECHLY_GET_GLOBAL_STATE once (~199–208); response is applied with `setGlobalState(response.state)`.

So the list is **not** re-fetched on resume or expand; it is whatever is in the last received `globalState` (from broadcast or GET_GLOBAL_STATE).

---

## 4. Tray Minimize Behavior

**Collapse/expand:** `content.tsx` 271 (onExpandRequest → ECHLY_EXPAND_WIDGET), 274 (onCollapseRequest → ECHLY_COLLAPSE_WIDGET).

**Background:** `background.ts` 340–352:

- **ECHLY_EXPAND_WIDGET:** `globalUIState.expanded = true`; `broadcastUIState()`.
- **ECHLY_COLLAPSE_WIDGET:** `globalUIState.expanded = false`; `broadcastUIState()`.

- Collapsing **does not** unmount the React app: the host div (`echly-shadow-host`) stays in the DOM; visibility is controlled by `getShouldShowTray(state)` and `expanded` only.
- Collapsing **does not** clear `pointers` or call any reset; it only updates `expanded` and broadcasts.
- **ECHLY_RESET_WIDGET** (which increments `widgetResetKey` and can remount the widget) is sent only from background in **endSessionFromIdle** and **ECHLY_SESSION_MODE_END**, not on pause, collapse, or resume.

So the tray UI component is **not** destroyed when minimized; the same React tree and state remain.

---

## 5. Resume Session Logic

**Flow:**

1. User clicks Resume in tray → content sends `ECHLY_SESSION_MODE_RESUME` (~1369).
2. Background handler (509): sets `globalUIState.sessionModeActive=true`, `sessionPaused=false`, `sessionId=activeSessionId`; `persistSessionLifecycleState()`; `broadcastUIState()`; `resetSessionIdleTimer()`.
3. Background does **not** clear or refetch `pointers`; it broadcasts current `globalUIState` (including existing `pointers`).
4. Content receives **ECHLY_GLOBAL_STATE** via:
   - chrome.runtime.onMessage (ensureMessageListener): calls `__ECHLY_APPLY_GLOBAL_STATE__?.(state)` and `window.dispatchEvent(ECHLY_GLOBAL_STATE)`.
   - Window listener (content.tsx 185–195): handler runs `setGlobalState(s)` (and setHostVisibility).

**Intended behavior:** Existing feedback list should be preserved because background never cleared it and sends it in the broadcast.

**Bug hypothesis:** The UI shows 0 when the state that content **applies** has `pointers: []`. So either (a) the broadcast (or GET_GLOBAL_STATE/visibility resync) sometimes delivers state with empty `pointers`, or (b) some other path overwrites content’s `globalState` with empty pointers after a correct state was received.

---

## 6. Feedback List Loading

- **Where loaded:** Background loads feedback only in:
  - **initializeSessionState()** (110–155): on worker startup, if `sessionModeActive && activeSessionId`, fetches `GET /api/feedback?sessionId=...&limit=200` and sets `globalUIState.pointers`; then broadcast is done after init (160).
  - **ECHLY_SET_ACTIVE_SESSION** (433–474): when `sessionId` is set, async fetch same API, then set `globalUIState.pointers` and broadcast.
- **When content “loads” the list:** Content does **not** call the feedback API. It only applies state from:
  - ECHLY_GLOBAL_STATE (broadcast),
  - ECHLY_GET_GLOBAL_STATE response (on mount and on visibilitychange when tab becomes visible).

So if the list is empty in the tray after resume, it is because the **state last applied** in content had `pointers: []`—either from a broadcast with empty pointers or from a GET_GLOBAL_STATE/visibility resync that returned empty pointers.

---

## 7. State Reset Points

### 7.1 Background: where `globalUIState.pointers` becomes `[]`

| Location | When |
|----------|------|
| `endSessionFromIdle()` (77) | Idle timeout. |
| `ECHLY_SESSION_MODE_END` (531) | User ends session. |
| `ECHLY_SET_ACTIVE_SESSION` (434–436) | When `sessionId` is null. |
| `ECHLY_SET_ACTIVE_SESSION` catch (460–461) | Fetch feedback fails. |
| `initializeSessionState()` catch (146–148) | Init fetch fails (worker wake). |

None of these are triggered by Pause, Minimize, or Resume.

### 7.2 Content: where `globalState` (including pointers) is set

- **setGlobalState(s)** is called with whatever object is received from:
  - ECHLY_GLOBAL_STATE (message + event),
  - ECHLY_GET_GLOBAL_STATE response,
  - visibilitychange → ECHLY_GET_GLOBAL_STATE response (with normalizeGlobalState).

So content does not explicitly “reset” the list; it overwrites with the state object from the background. If that object has `pointers: []`, the list will show 0.

### 7.3 useCaptureWidget (CaptureWidget hook): where `pointers` state is set

- **Initial state:** `useState(initialPointers ?? [])` (~165–167). Content does not pass `initialPointers`; so initial is `[]`.
- **Sync from props:** `useEffect(..., [extensionMode, pointersProp])` (~1224–1235): `pointersPropRef.current = pointersProp`; `setPointers(pointersProp)`. So the tray list is overwritten whenever `pointersProp` (i.e. `globalState.pointers`) changes.
- **loadSessionWithPointers:** Effect ~1237–1247: `setPointers(loadSessionWithPointers.pointers ?? [])`. Content does **not** pass `loadSessionWithPointers`, so this does not run in the extension flow.
- **Other setPointers([]):** `resetSession` (857), `startSession` (1053), `finalizeEnd` (1134). These run on reset / start new session / end session, not on pause/resume/collapse.

So the only way the widget shows 0 after resume is that **pointersProp** (content’s `globalState.pointers`) is `[]` when the widget renders or when the sync effect runs.

---

## 8. Message Passing (ECHLY_GLOBAL_STATE)

- **Content → Background:** Content sends SESSION_MODE_RESUME (and others); no ECHLY_GLOBAL_STATE.
- **Background → Content:** Background calls `broadcastUIState()` which does `chrome.tabs.sendMessage(tab.id, { type: "ECHLY_GLOBAL_STATE", state: globalUIState })` for each tab. It passes the **same** `globalUIState` object reference.

**Content handling:**

1. **ensureMessageListener** (content.tsx 1509–1548): On `ECHLY_GLOBAL_STATE`, calls `__ECHLY_APPLY_GLOBAL_STATE__?.(state)` (which is ContentApp’s `setGlobalState`) and `window.dispatchEvent(ECHLY_GLOBAL_STATE, { detail: { state } })`.
2. **ContentApp effect** (185–195): Listens for `ECHLY_GLOBAL_STATE` and calls `setGlobalState(e.detail.state)`.

So **every ECHLY_GLOBAL_STATE delivery overwrites content’s entire `globalState`**, including `pointers`. If any delivery has `state.pointers === []`, the tray will show 0. The broadcast **can** cause the content script to overwrite its feedback state; that is by design. The bug would be that the **payload** sometimes has empty pointers when it should not.

---

## 9. Session Lifecycle Diagram (High Level)

```
[User] Pause
   → Content: sendMessage(ECHLY_SESSION_MODE_PAUSE)
   → Background: sessionPaused=true, broadcastUIState()
   → Content: onMessage(ECHLY_GLOBAL_STATE) → setGlobalState(state)  [pointers unchanged]

[User] Minimize tray
   → Content: sendMessage(ECHLY_COLLAPSE_WIDGET)
   → Background: expanded=false, broadcastUIState()
   → Content: setGlobalState(state)  [pointers unchanged]

[User] Resume
   → Content: sendMessage(ECHLY_SESSION_MODE_RESUME)
   → Background: sessionPaused=false, broadcastUIState()  [pointers still not modified]
   → Content: onMessage(ECHLY_GLOBAL_STATE) → setGlobalState(state)
   → Expected: state.pointers = same as before pause
   → Bug: UI shows 0 → state applied had pointers=[]
```

---

## 10. Message Flow (Pause / Resume)

- **Pause:** Content → `ECHLY_SESSION_MODE_PAUSE` → Background updates flags, `broadcastUIState()` → All tabs receive `ECHLY_GLOBAL_STATE` with same `pointers`.
- **Resume:** Content → `ECHLY_SESSION_MODE_RESUME` → Background updates flags, `broadcastUIState()` → All tabs receive `ECHLY_GLOBAL_STATE` with same `pointers` (background did not clear or refetch).

So by code path, resume should not clear pointers. The inconsistency (backend has data, UI shows 0) implies the content script is applying a state snapshot where `pointers` is empty at the moment the tray renders or the sync effect runs.

---

## 11. Exact Code Locations That Can Reset the List

| Layer | File | Location | Condition |
|-------|------|----------|-----------|
| Background | background.ts | 77, 531, 434–436, 460–461, 146–148 | Session end, idle, SET_ACTIVE_SESSION null/fail, init fail |
| Content | content.tsx | 185–195, 199–208, 211–228 | Every ECHLY_GLOBAL_STATE and GET_GLOBAL_STATE (overwrites with received state) |
| useCaptureWidget | useCaptureWidget.ts | 1226–1228, 1239–1240 | pointersProp sync; loadSessionWithPointers (not used by extension) |
| useCaptureWidget | useCaptureWidget.ts | 857, 1053, 1134 | resetSession, startSession (new session), finalizeEnd (end session) |

None of these are triggered **by** Pause, Minimize, or Resume. The only way to see 0 after resume is to receive a **state object** with `pointers: []` from the background (broadcast or GET_GLOBAL_STATE) or to have that state applied in a race or ordering issue.

---

## 12. Top 5 Most Likely Causes (Ranked)

1. **Broadcast or GET_GLOBAL_STATE delivers empty pointers in an edge case**  
   Background is the only place that can authoritatively set `pointers`. If the tab ever receives `ECHLY_GLOBAL_STATE` or an ECHLY_GET_GLOBAL_STATE response with `pointers: []` after resume (e.g. service worker restarted and init ran with failed or empty fetch, or another tab triggered SET_ACTIVE_SESSION with null/failure), content would overwrite and show 0. **Recommendation:** Add logging for every broadcast and GET_GLOBAL_STATE response (e.g. `pointers.length`) and for the state applied in content.

2. **Tab visibility / resync overwriting with stale or empty state**  
   When the user switches tabs (e.g. after minimizing the tray), `visibilitychange` triggers ECHLY_GET_GLOBAL_STATE. If the background at that moment had empty pointers (e.g. worker just woke and init not yet completed, or a race), the response could have `pointers: []` and overwrite a previously correct state. **Recommendation:** Log GET_GLOBAL_STATE response and visibilitychange timing vs. broadcast timing.

3. **React effect order / batching: pointersProp applied as []**  
   useCaptureWidget syncs from `pointersProp` in an effect. If there is a render where `pointersProp` is still the initial `[]` (e.g. before the first ECHLY_GLOBAL_STATE is processed) and a later update with full pointers is dropped or batched in an unexpected way, the widget could show 0. Less likely given that “then starts counting from 1 again” suggests new feedback is being appended. **Recommendation:** Log when the pointers sync effect runs and with what length.

4. **Service worker restart and init race**  
   On worker restart, `initializeSessionState()` runs and may fetch feedback; broadcast happens after init (160). If a tab receives an older broadcast (from before restart) with empty pointers, or if init fails and broadcasts empty pointers, that could explain 0. **Recommendation:** Log worker lifecycle and init completion before any broadcast.

5. **Duplicate or out-of-order ECHLY_GLOBAL_STATE**  
   Multiple sources can push state: broadcast after resume, tab activation (onActivated), ECHLY_SESSION_STATE_SYNC, visibilitychange GET. If two updates are in flight and the one with empty pointers is applied last (e.g. from a previous session end or from another tab), the list would reset. **Recommendation:** Log every state application in content with `pointers.length` and a short reason (broadcast / GET_GLOBAL_STATE / visibility / tab sync).

---

## 13. Summary

- **Session lifecycle:** Pause/Resume do not touch `pointers` in the background; they only update flags and broadcast.
- **Tray list source:** Content’s `globalState.pointers` → passed as `pointers` to CaptureWidget → useCaptureWidget keeps local `pointers` in sync with this prop.
- **Reset mechanism:** The list appears empty whenever content applies a state object (from ECHLY_GLOBAL_STATE or ECHLY_GET_GLOBAL_STATE) that has `pointers: []`.
- **Most likely cause:** The content script is at some point receiving and applying a global state with `pointers: []` (e.g. from broadcast, GET_GLOBAL_STATE, or visibility resync), even though the backend and background in the “happy path” still hold the list. Next step is to add targeted logging around broadcasts, GET_GLOBAL_STATE responses, and content’s `setGlobalState` to capture when and why an empty `pointers` state is applied.
