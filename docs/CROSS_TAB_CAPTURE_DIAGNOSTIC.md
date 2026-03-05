# Cross-Tab Capture System — Diagnostic Report

**Purpose:** Technical explanation of why session capture is only partially working across tabs (cursor pointer everywhere, no toolbar, interaction blocked in other tabs; new tabs do not join the session). **No code changes — diagnostic only.**

---

## PART 1 — Capture lifecycle (tab where session starts)

Trace from **Start New Feedback Session** through **SessionOverlay**.

### Step-by-step

1. **WidgetFooter.tsx**  
   - Button with `aria-label="Start New Feedback Session"` and `onClick={onStartSession}`.  
   - `onStartSession` is `handlers.startSession` from `useCaptureWidget`.

2. **CaptureWidget.tsx**  
   - Renders `WidgetFooter` with `onStartSession={extensionMode ? handlers.startSession : undefined}` (line 264).  
   - All handlers and refs come from `useCaptureWidget(...)`.

3. **useCaptureWidget.ts — startSession** (lines 766–780)  
   - Guard: `if (stateRef.current !== "idle" || sessionModeRef.current) return`.  
   - In extension mode: calls `onCreateSession()` (content’s `createSession` → POST `/api/sessions`), then `onActiveSessionChange(session.id)`, then `onSessionModeStart?.()`.  
   - Then: `setSessionMode(true)`, `setSessionPaused(false)`, `setSessionFeedbackPending(null)`, **`createCaptureRoot()`**.  
   - So capture is initialized in this tab by: **local state** (`sessionMode`/`sessionPaused`) and **creation of the capture root** in the same call stack.

4. **createCaptureRoot** (lines 343–351)  
   - If `captureRootRef.current` already exists, returns.  
   - Creates a `div` with `id="echly-capture-root"`, appends to `document.body`, sets `captureRootRef.current`, `setCaptureRootEl(captureEl)`, `setCaptureRootReady(true)`.  
   - No dimensions or positioning; the div is just a portal target.

5. **CaptureWidget.tsx** (lines 134–165)  
   - Renders `{captureRootEl && <CaptureLayer captureRoot={captureRootEl} ... />}`.  
   - So **CaptureLayer** only mounts when **captureRootEl** is set (after `createCaptureRoot()`).

6. **CaptureLayer.tsx**  
   - Receives `sessionMode`, `sessionPaused`, `extensionMode`, etc.  
   - `showSessionOverlay = sessionMode && extensionMode` (line 65).  
   - When true, renders **SessionOverlay** via `createPortal(content, captureRoot)` (line 115), i.e. into `#echly-capture-root`.

7. **SessionOverlay.tsx**  
   - Renders session UI (SessionControlPanel, tooltip “Click to add feedback”, SessionFeedbackPopup when pending).  
   - On mount: `attachElementHighlighter(captureRoot, { getActive })` and `attachClickCapture(captureRoot, { enabled: getActive, onElementClicked })`.  
   - `captureActive = sessionMode && !sessionPaused && sessionFeedbackPending == null`.  
   - When `captureActive && captureRoot?.isConnected`: sets `document.body.style.cursor = "pointer"` (lines 73–79).

### Summary

- **Start New Feedback Session** → `startSession` → `onCreateSession` / `onActiveSessionChange` / `onSessionModeStart` → **setSessionMode(true), createCaptureRoot()** → React re-render → **CaptureLayer** (portal into `#echly-capture-root`) → **SessionOverlay** (highlighter + click capture + cursor).  
- Capture is fully initialized only in the tab that runs this sequence; other tabs depend on **ECHLY_GLOBAL_STATE** and local sync effects.

---

## PART 2 — Cross-tab propagation (ECHLY_GLOBAL_STATE)

### What happens when the background broadcasts ECHLY_GLOBAL_STATE

1. **Sender — background.ts**  
   - `broadcastUIState()` (lines 178–186): `chrome.tabs.query({}, ...)`, then for each tab `chrome.tabs.sendMessage(tab.id, { type: "ECHLY_GLOBAL_STATE", state: globalUIState })`.  
   - `globalUIState` includes: `visible`, `expanded`, `isRecording`, `sessionId`, **`sessionModeActive`**, **`sessionPaused`** (lines 30–44).  
   - This is sent after `ECHLY_SET_ACTIVE_SESSION` and after **ECHLY_SESSION_MODE_START** (and PAUSE/RESUME/END).  
   - So when the user starts a session, the originating tab sends `ECHLY_SESSION_MODE_START` (via `onSessionModeStart`); the background sets `globalUIState.sessionModeActive = true`, `sessionPaused = false`, then calls `broadcastUIState()`.

2. **Receiver — content script**  
   - **ensureMessageListener** (`content.tsx` lines 1267–1276): single `chrome.runtime.onMessage.addListener`.  
   - On `msg.type === "ECHLY_GLOBAL_STATE" && msg.state`:  
     - Sets host display: `(h as HTMLDivElement).style.display = msg.state.visible ? "block" : "none"`.  
     - Dispatches: `window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE", { detail: { state: msg.state } }))`.  
   - So **every tab** that has the content script and the host element receives the same `msg.state` (including `sessionModeActive`, `sessionPaused`).

3. **State update in React**  
   - **ContentApp** (`content.tsx` lines 116–124): `useEffect` subscribes to `"ECHLY_GLOBAL_STATE"` and calls `setGlobalState(e.detail?.state)` when present.  
   - So `globalState` in ContentApp is updated with `sessionModeActive`, `sessionPaused`, `sessionId`, etc.

4. **Passed into CaptureWidget**  
   - **content.tsx** (lines 1166–1172):  
     - `globalSessionModeActive={globalState.sessionModeActive ?? false}`  
     - `globalSessionPaused={globalState.sessionPaused ?? false}`  
   - So the widget’s hook receives the latest global session flags.

5. **useCaptureWidget — sync effect** (lines 813–831)  
   - `useEffect` depends on `[extensionMode, globalSessionModeActive, globalSessionPaused, createCaptureRoot, removeCaptureRoot]`.  
   - When `globalSessionModeActive === true`:  
     - `setSessionMode(true)`, `setSessionPaused(globalSessionPaused ?? false)`, `setSessionFeedbackPending(null)`.  
     - **If `!captureRootRef.current`, calls `createCaptureRoot()`.**  
   - When `globalSessionModeActive === false`: `setSessionMode(false)`, `setSessionPaused(false)`, `removeCaptureRoot()`.

### Summary

| Step | File / location | What happens |
|------|------------------|---------------|
| Broadcast | `echly-extension/src/background.ts` — `broadcastUIState()` | Sends `{ type: "ECHLY_GLOBAL_STATE", state: globalUIState }` to every tab. |
| Receive message | `echly-extension/src/content.tsx` — `ensureMessageListener` | Sets host display, dispatches `CustomEvent("ECHLY_GLOBAL_STATE", { detail: { state: msg.state } })`. |
| Update React state | `content.tsx` — ContentApp `useEffect` (ECHLY_GLOBAL_STATE) | `setGlobalState(e.detail?.state)`. |
| Pass to widget | `content.tsx` — CaptureWidget props | `globalSessionModeActive`, `globalSessionPaused` from `globalState`. |
| Sync + root | `useCaptureWidget.ts` — effect (lines 813–831) | Sets `sessionMode`/`sessionPaused`, and **calls `createCaptureRoot()` if no root**. |

So in other tabs, **createCaptureRoot() is intended to run** when they receive `ECHLY_GLOBAL_STATE` with `sessionModeActive: true`. The partial-capture bug (cursor but no toolbar, interaction blocked) implies that either: (a) this message is not delivered or not processed in time in background/other tabs, or (b) the sync effect runs but the capture root or overlay does not become visible/functional (e.g. timing, z-order, or DOM attachment).

---

## PART 3 — Cursor override

### Where the cursor is set to pointer

- **File:** `components/CaptureWidget/SessionOverlay.tsx`  
- **Lines 72–79:**  
  ```ts
  useEffect(() => {
    if (!captureActive || !captureRoot?.isConnected) return;
    document.body.style.cursor = "pointer";
    return () => {
      document.body.style.cursor = "";
    };
  }, [captureActive, captureRoot]);
  ```  
- So **only** when **SessionOverlay** is mounted, **captureActive** is true, and **captureRoot** is in the document does the extension set `document.body.style.cursor = "pointer"`. There is no other place in the extension that sets the body cursor to pointer for capture.

### Relative to capture initialization

- The cursor effect runs **after** capture is initialized in that tab: SessionOverlay mounts only when CaptureLayer is rendered, which requires **captureRootEl** (from **createCaptureRoot()**) and **sessionMode** true.  
- So in the **originating tab**, cursor is applied only after the capture root exists and SessionOverlay is mounted.  
- In **other tabs**, the same logic applies: pointer cursor should only appear if the sync effect has run (sessionMode true + createCaptureRoot), CaptureLayer has rendered, and SessionOverlay has mounted. If the user sees “cursor pointer everywhere” in other tabs but no toolbar, that implies either:  
  - SessionOverlay **is** mounting (so cursor runs) but the **toolbar/portal content** is not visible (e.g. z-index, stacking context, or portal target not in the right place), or  
  - Some other code path or leftover state is setting the cursor (no such path found in the codebase).

### Does it block page interaction?

- The cursor style itself does **not** block interaction.  
- Interaction is blocked by **click capture** and/or **overlays** (see Part 4).

---

## PART 4 — Click blocking

### How clicks are intercepted

- **File:** `components/CaptureWidget/session/clickCapture.ts`  
- **attachClickCapture** (lines 27–41): adds a **capture-phase** listener on **document**:  
  `document.addEventListener("click", clickBound, true)`.  
- **handleClick** (lines 12–21):  
  - Only left-click: `if (e.button !== 0) return`.  
  - If `!enabledRef()` (e.g. session not active or paused), returns without doing anything.  
  - If the event target is not a **session capture target** (`isSessionCaptureTarget(target)`), returns without doing anything.  
  - Otherwise: **`e.preventDefault()`**, **`e.stopPropagation()`**, then `callbackRef(target)` (element click handler).  
- So clicks are **only** intercepted when: (1) session capture is “active” (`enabledRef()` true), and (2) the target is a valid capture target (not Echly UI, not body, not inputs/contenteditable, etc.).  
- **enabledRef** is set by SessionOverlay to a function that returns `sessionMode && !sessionPaused && sessionFeedbackPending == null`. So if SessionOverlay has mounted and session is active, **any click on a valid capture target** is prevented and handled as feedback capture; the page does not receive that click.

### Other blocking mechanisms

- **pointer-events:**  
  - **useCaptureWidget.ts** (lines 356–368): the **marker layer** div (`#echly-marker-layer`) appended inside the capture root has `pointer-events:none` so markers don’t block. The capture root div itself has no pointer-events set.  
  - **elementHighlighter.ts** (line 78): overlay has `pointer-events:none`, so it does **not** block.  
  - **CaptureLayer.tsx** (lines 88–100): the **dim overlay** (`echly-focus-overlay`) is only shown when **not** in session overlay mode (`!showSessionOverlay && (state === "focus_mode" || state === "region_selecting")`); in session mode it is not shown, so it does not block.  
- So there is **no full-page overlay** in session mode that blocks by pointer-events. Blocking is from the **global capture-phase click listener** when enabled and the target is a capture target.

### Why interaction can be disabled when capture root does not exist

- **If the capture root does not exist** in a tab, CaptureLayer is not rendered (`{captureRootEl && <CaptureLayer ... />}`), so SessionOverlay never mounts. Then:  
  - **attachClickCapture** is never called in that tab, so the document-level click listener is either not added or was added by a previous mount and then **detachClickCapture** was called (cleanup).  
- **Module-level singleton in clickCapture.ts:**  
  - `clickBound`, `enabledRef`, `callbackRef` are shared across the entire content script. So there is **one** document click listener per tab.  
  - When SessionOverlay **unmounts**, it runs cleanup and calls **detachClickCapture()**, which removes the listener and sets `enabledRef = () => false`. So after unmount, clicks are not intercepted.  
- So in a tab where the capture root **was never created**, SessionOverlay never mounts, so the click listener is either never attached or is detached and disabled. In that case, the main risk is not “click blocking” but “no capture at all” (no toolbar, no feedback flow).  
- The **partial** case (cursor pointer + no toolbar + “clicks do nothing”) is consistent with: **SessionOverlay did mount** (so cursor and click capture are active), but the **toolbar/UI** is not visible or not working (e.g. portal into a root that’s not in the right place, or a different stacking context). Then every click on a valid target is captured and default is prevented, so the page does not respond, and the user sees no feedback UI.

---

## PART 5 — Capture root lifecycle

### Where createCaptureRoot() runs

- **useCaptureWidget.ts** only:  
  - **startSession** (line 779): after creating session and notifying background, same tab.  
  - **Sync effect** (lines 819–821): when `globalSessionModeActive === true` and `!captureRootRef.current`.  
  - **visibilitychange effect** (lines 834–851): when tab becomes visible, `globalSessionModeActive === true`, and `!captureRootRef.current`.  
  - **loadSessionWithPointers effect** (lines 854–864): when user picks “Resume” and parent passes `loadSessionWithPointers`.  
  - **handleAddFeedback** (line 977): when starting region/voice capture (not session overlay).  

So **createCaptureRoot()** is called in the **same tab** that runs these code paths. It is **not** called by the background or by another tab directly; other tabs only get a root if they run the **sync effect** or the **visibilitychange** effect (or Resume flow) in their own content script.

### Where removeCaptureRoot() runs

- **useCaptureWidget.ts**:  
  - **endSession** (line 804): when user ends the session in that tab.  
  - **Sync effect** (lines 826–829): when `globalSessionModeActive === false`.  
  - **finishListening** / **discardListening** / **handleCancelCapture** in non-session flows (e.g. region capture).  
- So the root is removed when the session ends (and broadcast sets `sessionModeActive = false`) or when local flow cancels.

### Summary

- **createCaptureRoot()** runs only in the **originating tab** (startSession) and, by design, in **other tabs** only when they receive **ECHLY_GLOBAL_STATE** with `sessionModeActive: true` (sync effect) or when they become visible with global session active but no root (visibilitychange), or when they use Resume.  
- If **ECHLY_GLOBAL_STATE** is not delivered or is delivered only when the tab is active, or if the content script in a background tab does not run the sync effect (e.g. batching, ordering), other tabs may never call **createCaptureRoot()**, so they never get a capture layer and can show “partial” behavior only if some other path sets sessionMode or cursor (e.g. stale state or a single tab that did create a root but with broken UI).

---

## PART 6 — New tab initialization

### Does the content script request global state (ECHLY_GET_GLOBAL_STATE)?

- **Yes.**  
- **content.tsx — main()** (lines 1283–1303): after creating the host and mounting the React app, it calls **ensureMessageListener(host)** and **syncInitialGlobalState(host)**.  
- **syncInitialGlobalState** (lines 1226–1254):  
  - Sends `chrome.runtime.sendMessage({ type: "ECHLY_GET_GLOBAL_STATE" }, callback)`.  
  - In the callback: sets `host.style.display = state.visible ? "block" : "none"` and dispatches  
    `window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE", { detail: { state: { visible, expanded, isRecording, sessionId, sessionModeActive, sessionPaused } } }))`.  
- So when a **new tab** loads, the content script runs **main()** (injected at `document_idle` per manifest), mounts the app, then requests **ECHLY_GET_GLOBAL_STATE**. The background replies with current **globalUIState** (including **sessionId**, **sessionModeActive**, **sessionPaused**). The content script then dispatches **ECHLY_GLOBAL_STATE** with that state, so the React tree (ContentApp) receives it and **setGlobalState** runs.

### How new tabs sync session state

- ContentApp’s **ECHLY_GLOBAL_STATE** listener updates **globalState** (including **sessionModeActive**, **sessionPaused**, **sessionId**).  
- CaptureWidget receives **globalSessionModeActive** and **globalSessionPaused** from **globalState**.  
- useCaptureWidget’s **sync effect** runs when **globalSessionModeActive** becomes true and calls **setSessionMode(true)**, **setSessionPaused(...)**, and **createCaptureRoot()** if there is no root.  
- So **in theory**, new tabs that load **after** a session has started should: get initial state via **ECHLY_GET_GLOBAL_STATE**, dispatch it, update **globalState**, and then sync into session mode and create the capture root.  
- **Why new tabs might not activate session capture:**  
  - **Timing:** `syncInitialGlobalState` is asynchronous. The React tree first renders with **initial** globalState (e.g. `sessionModeActive: false`). The **ECHLY_GET_GLOBAL_STATE** response and the dispatched event can arrive after the first paint. If the effect that subscribes to **ECHLY_GLOBAL_STATE** runs after that, new tabs do get the correct state; if there is a race or the effect dependency is wrong, they might not.  
  - **Initial state:** ContentApp’s **useState** for globalState (lines 60–67) initializes **sessionModeActive: false**, **sessionPaused: false**. So until the first **ECHLY_GLOBAL_STATE** (from **syncInitialGlobalState** or a later broadcast) is processed, the widget believes there is no active session.  
  - If the **callback** of **ECHLY_GET_GLOBAL_STATE** never runs (e.g. background not ready, or tab context invalid), the new tab never gets the active session state and never enters session mode or creates a root.

---

## PART 7 — Tab activation handling

### Does the extension listen for visibilitychange / focus / tab activation?

- **Yes, for recovery only.**  
- **useCaptureWidget.ts** (lines 830–852):  
  - Effect depends on `extensionMode`, `globalSessionModeActive`, `globalSessionPaused`, `createCaptureRoot`.  
  - Adds `document.addEventListener("visibilitychange", onVisibilityChange)`.  
  - **onVisibilityChange:** if `document.hidden` is true, does nothing. When the tab becomes **visible** (`!document.hidden`): if `globalSessionModeActive` is true and **captureRootRef.current** is falsy, it calls **setSessionMode(true)**, **setSessionPaused(globalSessionPaused ?? false)**, **createCaptureRoot()**.  
- So the extension **does** reinitialize the capture root when the tab becomes visible **and** global session is active **and** the root is missing. It does **not** listen to Chrome’s tab activation (e.g. `chrome.tabs.onActivated`) to request state or re-broadcast; it only reacts to **document.visibilitychange** and existing **globalSessionModeActive** state in React.

### Does capture reinitialize when a tab becomes active?

- Only in the **recovery** case above: when the tab becomes visible, **globalSessionModeActive** is already true in that tab’s React state, and the capture root is missing, then **createCaptureRoot()** runs.  
- If the tab **never** received **ECHLY_GLOBAL_STATE** with `sessionModeActive: true` (e.g. it was in background when the broadcast was sent and the message was not processed or not delivered), then when the user switches to that tab, **globalSessionModeActive** is still false, so the visibilitychange handler does nothing. So capture does **not** reinitialize on tab activation unless the tab already had the correct global state and only lacked the root.

---

## PART 8 — Final explanation

### Why previously opened tabs enter a partial capture state

1. **Session mode and cursor**  
   - The background **does** broadcast **sessionModeActive** and **sessionPaused** via **ECHLY_GLOBAL_STATE** after **ECHLY_SESSION_MODE_START**.  
   - Other tabs are **designed** to sync: ContentApp updates **globalState**, CaptureWidget gets **globalSessionModeActive** / **globalSessionPaused**, and useCaptureWidget’s sync effect should set **sessionMode**/sessionPaused and call **createCaptureRoot()**.  
   - The **cursor** is set only inside **SessionOverlay** when **captureActive** and **captureRoot?.isConnected**. So if the user sees “cursor pointer everywhere” in another tab, SessionOverlay must have mounted there, which requires a capture root and **sessionMode** true.

2. **Likely causes of “partial” state**  
   - **Message delivery to background tabs:** When the user starts the session in tab A, the background calls **broadcastUIState()** and sends **ECHLY_GLOBAL_STATE** to all tabs. Content scripts in **background** tabs may not receive or process this message immediately (e.g. Chrome throttling or suspension). When the user later switches to tab B, that tab may still have **globalSessionModeActive: false** if it never got the broadcast, so the sync effect never runs and **createCaptureRoot()** is never called — so no toolbar.  
   - **Opposite case (cursor + no toolbar, clicks blocked):** If tab B **did** receive **ECHLY_GLOBAL_STATE** and the sync effect ran, then **createCaptureRoot()** and SessionOverlay would run, so we’d get cursor and click capture. If the **toolbar** (SessionControlPanel) is not visible (e.g. portal root in a bad stacking context, or host/iframe isolation), the user would see pointer cursor and blocked clicks with no visible control panel.  
   - **Ordering:** In the originating tab, **onActiveSessionChange(session.id)** is called before **onSessionModeStart()**. So the first broadcast is **ECHLY_SET_ACTIVE_SESSION** (sessionId only); the second is after **ECHLY_SESSION_MODE_START** (sessionModeActive: true). Other tabs might receive only the first message if the second is dropped or delayed, leaving them with **sessionId** but **sessionModeActive: false**, so they never enter session mode or create a root.

3. **Click blocking**  
   - Clicks are blocked only when the **document-level capture-phase listener** is attached (by SessionOverlay) and **enabledRef()** is true and the target is a **session capture target**. So “page interaction blocked” is consistent with SessionOverlay being active and intercepting valid targets; “clicking does nothing” can mean the feedback flow runs but no UI appears (e.g. no visible toolbar/popup), or the callback fails without clear feedback.

### Why new tabs do not activate session capture

- New tabs **do** call **syncInitialGlobalState(host)**, which sends **ECHLY_GET_GLOBAL_STATE** and, in the callback, dispatches **ECHLY_GLOBAL_STATE** with the current **globalUIState** (including **sessionModeActive**, **sessionPaused**, **sessionId**). So they **should** receive the active session state and the sync effect **should** run and call **createCaptureRoot()**.  
- If new tabs do **not** activate session capture, likely causes are:  
  - **Async timing:** The initial render uses default **globalState** (sessionModeActive: false). The **ECHLY_GET_GLOBAL_STATE** response arrives later; if the CustomEvent is not dispatched or the React listener does not run (e.g. strict mode, or effect cleanup), the tab never updates to session mode.  
  - **Background not ready:** New tab loads before the background has applied **ECHLY_SESSION_MODE_START** or the callback fails, so the returned state has **sessionModeActive: false**.  
  - **No re-request on focus:** When the user opens a new tab and then focuses it, the content script does **not** send **ECHLY_GET_GLOBAL_STATE** again; it only got it once at load. So if the first response was wrong or missing, there is no second chance until another broadcast (e.g. pause/resume) is sent.

### What architectural change is required to behave like Loom

- **Single source of truth for “session recording on”:** The background already stores **sessionModeActive** and **sessionPaused** and broadcasts them. The gap is **reliability**: every tab (including background and newly opened) must **reliably** get this state and **reliably** create the capture root and overlay.  
- **Ensure all tabs receive session mode:**  
  - Option A: When a tab’s content script loads or when the tab becomes active, **request** current global state (**ECHLY_GET_GLOBAL_STATE**) and apply it (already done on load; could add on visibilitychange or on Chrome tab activation).  
  - Option B: Have the background re-broadcast **ECHLY_GLOBAL_STATE** when a tab is activated (e.g. **chrome.tabs.onActivated** → **broadcastUIState()** or **sendMessage** to that tab only), so tabs that missed the first broadcast or loaded later get the latest state.  
- **Ensure capture root is created whenever session is active:** The sync and visibilitychange effects already call **createCaptureRoot()** when **globalSessionModeActive** is true and the root is missing. The fix is to ensure **globalSessionModeActive** is true in every tab that should be in session mode (reliable delivery + optional re-request on load/activation).  
- **No partial state:** Ensure the sequence is atomic in every tab: set **sessionMode**/sessionPaused from global state **and** create the root in the same turn (or strict order), so the cursor is never applied without the full overlay (toolbar + highlighter + click capture). The current design already intends this; the failure is in state propagation or timing, not in the order of **createCaptureRoot** vs cursor.

---

**End of diagnostic. No code changes were made.**
