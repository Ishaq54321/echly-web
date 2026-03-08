# Extension Session Restore — Architecture Analysis

**Purpose:** Identify why the widget automatically restores the previous session and loads tickets when the extension icon is clicked, and document the full widget lifecycle so the desired UX can be enforced: **always** start with the command screen (Start New Feedback Session, Resume Session, Previous Sessions); no session auto-load; sessions load only when the user explicitly clicks **Resume Session**.

**Scope:** READ-ONLY analysis. No code was modified.

---

## 1. Extension open flow (when the user clicks the extension icon)

### 1.1 Flow diagram

```
User clicks extension icon
        │
        ▼
┌───────────────────┐
│ popup.html loads  │
│ <script src=      │
│  popup.js>        │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ popup.tsx         │
│ PopupApp mounts   │
│ useEffect:        │
│  getAuthState()   │
└────────┬──────────┘
         │
         ├── not authenticated → show "Continue with Google"
         │
         └── authenticated ──────────────────────────────────────┐
                  │                                               │
                  ▼                                               │
         toggleVisibility()  ────────────────────────────────────┤
                  │                                               │
                  ▼                                               │
         window.close()  (popup closes)                            │
                  │                                               │
                  │     ┌────────────────────────────────────────┘
                  │     │
                  ▼     ▼
┌─────────────────────────────────────────────────────────────────┐
│ background.ts                                                    │
│ Message: ECHLY_TOGGLE_VISIBILITY                                  │
│   • globalUIState.visible = !globalUIState.visible               │
│   • if (visible) → chrome.tabs.sendMessage(ECHLY_RESET_WIDGET)   │
│     to ALL tabs                                                  │
│   • broadcastUIState() → sendMessage(ECHLY_GLOBAL_STATE, state)  │
│     to ALL tabs                                                  │
└─────────────────────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ content.tsx (each tab)                                           │
│ 1) chrome.runtime.onMessage:                                     │
│    • ECHLY_RESET_WIDGET → dispatch CustomEvent("ECHLY_RESET_     │
│      WIDGET")                                                    │
│    • ECHLY_GLOBAL_STATE → set host display, dispatch CustomEvent │
│      ("ECHLY_GLOBAL_STATE")                                      │
│ 2) ContentApp (React):                                           │
│    • ECHLY_RESET_WIDGET listener: setLoadSessionWithPointers(null)│
│      setGlobalState(prev=>{...prev, expanded:false}),            │
│      setWidgetResetKey(k=>k+1)                                   │
│    • ECHLY_GLOBAL_STATE listener: setHostVisibility(s.visible),   │
│      setGlobalState(s)                                           │
│ 3) Widget mount: CaptureWidget key={widgetResetKey} → remounts    │
│    when key changes                                              │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Key files and roles

| Step | File | What happens |
|------|------|----------------|
| Open | `echly-extension/popup.html` | Loads popup UI; root div; script loads `popup.js` (built from `popup.tsx`). |
| Auth + toggle | `echly-extension/src/popup.tsx` | On load, `getAuthState()`. If authenticated → `toggleVisibility()` then `window.close()`. No other UI path when authenticated. |
| Toggle message | `echly-extension/src/popup.tsx` | `toggleVisibility()` sends `{ type: "ECHLY_TOGGLE_VISIBILITY" }` via `chrome.runtime.sendMessage`. |
| Visibility + reset | `echly-extension/src/background.ts` | On `ECHLY_TOGGLE_VISIBILITY`: flip `globalUIState.visible`; if now visible, send `ECHLY_RESET_WIDGET` to all tabs; then `broadcastUIState()` (sends `ECHLY_GLOBAL_STATE` to all tabs). |
| Widget visibility | `echly-extension/src/content.tsx` | Host element `#echly-shadow-host` display is set from `globalState.visible` (in CustomEvent handler and in `chrome.runtime.onMessage`). |
| Widget mount | `echly-extension/src/content.tsx` | Single mount in `main()`: create host, `mountReactApp(host)` → `createRoot(container).render(<ContentApp ...>)`. No re-mount except when `key={widgetResetKey}` changes (CaptureWidget remounts). |

### 1.3 Messages when the extension “opens” (authenticated user)

1. **ECHLY_TOGGLE_VISIBILITY** — Sent by popup when authenticated; background flips `visible` and, if visible, sends reset + broadcast.
2. **ECHLY_RESET_WIDGET** — Sent by background to all tabs when visibility is toggled to `true`; content clears `loadSessionWithPointers`, sets `expanded: false`, increments `widgetResetKey`.
3. **ECHLY_GLOBAL_STATE** — Broadcast by background to all tabs with full `globalUIState`; content sets host visibility and React `globalState`.

---

## 2. Global state system

### 2.1 Where state is defined

**Background (source of truth):** `echly-extension/src/background.ts`

```ts
let globalUIState: {
  visible: boolean;
  expanded: boolean;
  isRecording: boolean;
  sessionId: string | null;
  sessionModeActive: boolean;
  sessionPaused: boolean;
} = {
  visible: false,
  expanded: false,
  isRecording: false,
  sessionId: null,
  sessionModeActive: false,
  sessionPaused: false,
};
```

- **Persisted:** `chrome.storage.local`: `activeSessionId`, `sessionModeActive`, `sessionPaused`. On load, background reads these and sets `globalUIState.sessionId`, `globalUIState.sessionModeActive`, `globalUIState.sessionPaused`, then calls `broadcastUIState()`.

### 2.2 Where state is restored

- **Background:** On startup, `chrome.storage.local.get(["activeSessionId", "sessionModeActive", "sessionPaused"], ...)` restores into `globalUIState` and calls `broadcastUIState()`.
- **Content:** On mount, `ContentApp` sends `ECHLY_GET_GLOBAL_STATE`; response is used to set host visibility and `setGlobalState(response.state)`. Same request is used in `syncInitialGlobalState(host)` and in `ensureVisibilityStateRefresh()` on `visibilitychange` (when tab becomes visible).

### 2.3 Where state is broadcast

- **broadcastUIState()** in background: `chrome.tabs.query({}, tabs => tabs.forEach(tab => chrome.tabs.sendMessage(tab.id, { type: "ECHLY_GLOBAL_STATE", state: globalUIState })))`.
- Also sent on tab activation (`chrome.tabs.onActivated`) and tab creation (`chrome.tabs.onCreated`) so the active tab gets current state.

### 2.4 How ECHLY_GLOBAL_STATE reaches content

1. **Chrome messaging:** Background calls `chrome.tabs.sendMessage(tabId, { type: "ECHLY_GLOBAL_STATE", state: globalUIState })`.
2. **Content script** (`content.tsx`): `chrome.runtime.onMessage.addListener` in `ensureMessageListener(host)` receives the message. When `msg.type === "ECHLY_GLOBAL_STATE"` and `msg.state` is present:
   - Sets host style: `(host).style.display = msg.state.visible ? "block" : "none"`.
   - Dispatches a **CustomEvent** on `window`: `window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE", { detail: { state: msg.state } }))`.
3. **React ContentApp** has a listener for the CustomEvent `ECHLY_GLOBAL_STATE` and calls `setHostVisibility(s.visible)` and `setGlobalState(s)`. So the content script both updates the host directly (for display) and notifies React so `globalState` in ContentApp stays in sync.

---

## 3. Session auto-restore trace

### 3.1 References to sessionId, sessionModeActive, loadSessionWithPointers, /api/feedback

- **content.tsx**
  - `globalState.sessionId`, `globalState.sessionModeActive`: used for `effectiveSessionId`, and passed as `globalSessionModeActive` to CaptureWidget. No effect in **current** source that fetches feedback when `sessionModeActive && sessionId`.
  - `loadSessionWithPointers` / `setLoadSessionWithPointers`: state; set to `null` on `ECHLY_RESET_WIDGET`; set in `onResumeSessionSelect` after fetching `/api/feedback?sessionId=...`.
  - Line 164: comment only — *"Do not automatically restore sessions. Sessions must be resumed manually by the user (Resume Session)."* So the current source does **not** contain an effect that auto-fetches and sets `loadSessionWithPointers` from global state.
- **CaptureWidget.tsx**
  - Receives `loadSessionWithPointers`; effect when `loadSessionWithPointers?.sessionId` runs → `setShowCommandScreen(false)`.
- **useCaptureWidget.ts**
  - Effect when `loadSessionWithPointers?.sessionId`: `setPointers(loadSessionWithPointers.pointers ?? [])`, `onSessionLoaded?.()`.

### 3.2 Documented previous behavior (from extension-ticket-system-diagnostic.md)

The diagnostic states that **at the time of that report**, content had an effect that:

- Ran when `globalState.sessionModeActive && globalState.sessionId`.
- Fetched `/api/feedback?sessionId=...`.
- Set `loadSessionWithPointers({ sessionId, pointers })` (with `pointers = []` when none).

That effect is **not** present in the current `content.tsx`; only the comment at line 164 remains. If the **built** extension (e.g. `content.js`) was produced from an older version of `content.tsx` that still had this effect, that would explain automatic session restore when the icon is clicked.

### 3.3 Component that would perform automatic session loading

If an effect like the following existed in **content.tsx** (or in the code that was bundled into `content.js`), it would be the one performing automatic session loading:

```ts
React.useEffect(() => {
  if (!globalState.sessionModeActive || !globalState.sessionId) return;
  const sessionId = globalState.sessionId;
  (async () => {
    try {
      const res = await apiFetch(`/api/feedback?sessionId=${encodeURIComponent(sessionId)}&limit=50`);
      const json = await res.json();
      const list = json.feedback ?? [];
      const pointers = list.map(...);
      setLoadSessionWithPointers({ sessionId, pointers });
    } catch (e) {
      setLoadSessionWithPointers({ sessionId, pointers: [] });
    }
  })();
}, [globalState.sessionModeActive, globalState.sessionId]);
```

- **content.tsx** would be the only place that can call `setLoadSessionWithPointers` from an effect (other than the explicit `onResumeSessionSelect` path).
- **CaptureWidget.tsx** and **useCaptureWidget.ts** only **react** to `loadSessionWithPointers`; they do not fetch or set it based on global state.

---

## 4. Pointer state (ticket cards)

### 4.1 Where pointers are stored

- **useCaptureWidget.ts:** `const [pointers, setPointers] = useState<StructuredFeedback[]>(initialPointers ?? []);` — this is the single source of truth for the list of ticket cards in the widget.

### 4.2 When pointers are set

- **Initial:** `useState(initialPointers ?? [])`. Content does not pass `initialPointers`, so they start as `[]`.
- **When parent passes loadSessionWithPointers:** Effect in useCaptureWidget: `setPointers(loadSessionWithPointers.pointers ?? [])` and `onSessionLoaded?.()`.
- **When user adds feedback:** Success path in content’s `handleComplete` (or background’s `ECHLY_PROCESS_FEEDBACK` response) calls `callbacks.onSuccess(ticket)`; the widget’s handler adds the new item to the list (via the hook’s internal logic that updates pointers from the completion callback).

### 4.3 When pointers are cleared

- **Session end:** When the user ends the session, the widget’s session-end flow runs; parent can clear session and the widget can reset. Content’s `onSessionEnd` sets `setSessionIdOverride(null)`; pointers are not explicitly cleared in content, but the widget is remounted when `widgetResetKey` changes (on `ECHLY_RESET_WIDGET`), so a new CaptureWidget instance gets fresh `pointers = []`.
- **ECHLY_RESET_WIDGET:** Content sets `setLoadSessionWithPointers(null)` and increments `widgetResetKey`, so CaptureWidget remounts with fresh state (pointers reset in the new instance).

### 4.4 When pointers trigger UI rendering

- **CaptureWidget.tsx:** `hasTickets = Boolean(state.pointers?.length)`; `showSessionButtons = !hasTickets && state.state === "idle"`.
- When `hasTickets` is true, the feedback list is shown and the footer (three command buttons) is **not** shown. When `hasTickets` is false and state is idle, the footer with Start New / Resume / Previous Sessions is shown.

---

## 5. Command screen state (showCommandScreen)

### 5.1 Where it is defined

- **CaptureWidget.tsx:** `const [showCommandScreen, setShowCommandScreen] = useState(true);`

### 5.2 Where it is set to false

- **CaptureWidget.tsx** effect: when `loadSessionWithPointers?.sessionId` is set → `setShowCommandScreen(false)` (transition to “session view”).
- **ResumeSessionModal** path: when user selects a session, `onSelectSession` calls `setShowCommandScreen(false)` then `onResumeSessionSelect(sessionId)`.

### 5.3 Where it is set to true

- **CaptureWidget.tsx:** `onSessionEnd` callback: `handlers.endSession(() => { setShowCommandScreen(true); onSessionEndCallback?.(); })`.
- **CaptureHeader:** `onShowCommandScreen={() => setShowCommandScreen(true)}` (header can expose a control that calls this).

### 5.4 Why the command screen can disappear after extension open

- **Important:** In the current **render** of CaptureWidget, `showCommandScreen` is **never read**. The visibility of the three buttons is determined only by `showSessionButtons = !hasTickets && state.state === "idle"`. So when `state.pointers` is populated (e.g. via `loadSessionWithPointers`), `hasTickets` becomes true, `showSessionButtons` becomes false, and the footer (command screen) is hidden. So the “command screen” effectively disappears whenever **pointers** are non-empty.
- If an **auto-restore effect** in content runs after open (when global state has `sessionModeActive` and `sessionId`), it would:
  1. Fetch `/api/feedback?sessionId=...`
  2. Call `setLoadSessionWithPointers({ sessionId, pointers })`
  3. useCaptureWidget effect runs → `setPointers(pointers)` → `hasTickets` becomes true → footer hides and list shows.

So the “switch” away from the command screen after extension open is caused by **something** (the former effect in content) populating `loadSessionWithPointers`, which populates `pointers`, which hides the footer. In the current source, that effect is removed; if the built extension still contains it (old bundle), that would explain the behavior.

---

## 6. Resume Session flow (intended session restore)

### 6.1 Code path

1. **User clicks “Resume Session”** in WidgetFooter.
2. **CaptureWidget.tsx:** `onResumeSession={extensionMode && hasStoredSession ? handleResumeActiveSession : undefined}`. `handleResumeActiveSession` sends `ECHLY_GET_ACTIVE_SESSION` to background, then in the callback gets `response.sessionId` and calls `onResumeSessionSelect?.(storedSessionId, { enterCaptureImmediately: true })`.
3. **content.tsx** `onResumeSessionSelect`:  
   - Sends `ECHLY_SET_ACTIVE_SESSION` with `sessionId`;  
   - `setSessionIdOverride(sessionId)`;  
   - `apiFetch(\`/api/feedback?sessionId=${sessionId}&limit=50\`)`;  
   - Maps response to `pointers`;  
   - `setLoadSessionWithPointers({ sessionId, pointers })`;  
   - If `options?.enterCaptureImmediately`, sends `ECHLY_SESSION_MODE_START`.
4. **useCaptureWidget.ts** effect: sees `loadSessionWithPointers?.sessionId` → `setPointers(loadSessionWithPointers.pointers ?? [])`, `onSessionLoaded?.()`.
5. **CaptureWidget.tsx** effect: sees `loadSessionWithPointers?.sessionId` → `setShowCommandScreen(false)`.
6. **Content** `onSessionLoaded`: `setLoadSessionWithPointers(null)` so the one-shot load is cleared.

### 6.2 Confirmation

This is the **intended** session restore path: explicit user action → fetch feedback → set `loadSessionWithPointers` → widget updates pointers and switches to session view. No automatic fetch based on global state.

---

## 7. Root cause of automatic session restore

### 7.1 What causes automatic fetch of session feedback on extension load

Automatic session restore happens when:

1. **Background** has persisted `sessionId` and `sessionModeActive` (and optionally `sessionPaused`) in `chrome.storage.local` and in `globalUIState`.
2. When the user clicks the icon, **ECHLY_TOGGLE_VISIBILITY** runs, then **ECHLY_RESET_WIDGET** and **ECHLY_GLOBAL_STATE** are sent.
3. Content handles **ECHLY_RESET_WIDGET** (clears `loadSessionWithPointers`, increments `widgetResetKey`).
4. Content then receives **ECHLY_GLOBAL_STATE** and updates `globalState` (including `sessionId` and `sessionModeActive`).
5. **If** an effect in the content script runs when `globalState.sessionModeActive && globalState.sessionId`, and that effect fetches `/api/feedback?sessionId=...` and then calls `setLoadSessionWithPointers({ sessionId, pointers })`, that **undoes** the reset: the widget (or a new instance after remount) receives `loadSessionWithPointers`, populates pointers, and shows the session view instead of the command screen.

### 7.2 Code block responsible

The responsible block would be an effect in **content.tsx** (or in the script that is compiled into **content.js**) with the following logic:

- **Condition:** `globalState.sessionModeActive && globalState.sessionId`
- **Action:** Fetch `GET /api/feedback?sessionId=<id>&limit=50`, map response to pointers, call `setLoadSessionWithPointers({ sessionId, pointers })`.

In the **current** `echly-extension/src/content.tsx`, this effect is **not** present; only the comment at line 164 remains. So either:

- The **built** `echly-extension/content.js` was generated from an older version that still had this effect, or  
- Another code path (e.g. another listener or dependency) is setting `loadSessionWithPointers` when the widget opens.

### 7.3 Why it overrides the command screen

- **ECHLY_RESET_WIDGET** clears `loadSessionWithPointers` and remounts the widget, so the UI would start in a “clean” state with empty pointers and the footer visible.
- **ECHLY_GLOBAL_STATE** is received afterward and updates `globalState`. If an effect depends on `globalState.sessionModeActive` and `globalState.sessionId`, it runs **after** the reset and sets `loadSessionWithPointers` again.
- The widget (or the new instance) then receives `loadSessionWithPointers`, the hook sets `pointers`, so `hasTickets` becomes true and the footer (command screen) is hidden. So the automatic effect overrides the reset and shows the previous session instead of the command screen.

---

## 8. Summary and recommended minimal fix

### 8.1 Extension lifecycle (high level)

1. User clicks extension icon → popup opens.  
2. If authenticated, popup calls `toggleVisibility()` and closes.  
3. Background toggles `visible`, sends **ECHLY_RESET_WIDGET** to all tabs, then **ECHLY_GLOBAL_STATE**.  
4. Content: on **ECHLY_RESET_WIDGET**, clears `loadSessionWithPointers`, sets `expanded: false`, increments `widgetResetKey` (CaptureWidget remounts).  
5. Content: on **ECHLY_GLOBAL_STATE**, sets host visibility and `globalState`.  
6. If an effect in content runs when `sessionModeActive && sessionId` and sets `loadSessionWithPointers`, the widget shows the previous session and tickets instead of the command screen.

### 8.2 Global state architecture

- **Source of truth:** Background’s `globalUIState`, persisted in `chrome.storage.local` for `activeSessionId`, `sessionModeActive`, `sessionPaused`.  
- **Propagation:** `broadcastUIState()` and tab activation/creation send `ECHLY_GLOBAL_STATE` via `chrome.tabs.sendMessage`; content’s `onMessage` sets host visibility and dispatches a CustomEvent; ContentApp’s listener updates React `globalState`.

### 8.3 Session restore mechanism

- **Intended:** User clicks “Resume Session” → `onResumeSessionSelect` → fetch `/api/feedback?sessionId=...` → `setLoadSessionWithPointers` → hook and CaptureWidget update pointers and session view.  
- **Unwanted:** An effect in content that reacts to `globalState.sessionModeActive && globalState.sessionId` by fetching feedback and calling `setLoadSessionWithPointers`, so the session restores without user action.

### 8.4 Why sessions auto-load

Sessions auto-load when the content script contains an effect that, after receiving `globalState` with `sessionModeActive` and `sessionId`, fetches `/api/feedback?sessionId=...` and sets `loadSessionWithPointers`. That runs after **ECHLY_RESET_WIDGET** and **ECHLY_GLOBAL_STATE**, so it overrides the reset and repopulates the widget with the previous session’s tickets.

### 8.5 File that causes the issue

- **echly-extension/src/content.tsx** (or the source that is bundled into **echly-extension/content.js**) is the only place that can add such an effect. The current **source** file has the effect removed (comment at line 164). If the **built** content script still contains the old effect, that is the cause.

### 8.6 Recommended minimal fix

1. **Ensure no auto-restore effect in content:** Do **not** have an effect in the content script that fetches `/api/feedback` and sets `setLoadSessionWithPointers` when `globalState.sessionModeActive && globalState.sessionId`. The current `content.tsx` already follows this (effect removed; comment only). Rebuild the extension from this source so **content.js** does not contain the old effect.
2. **Optional hardening when opening widget:** When handling **ECHLY_TOGGLE_VISIBILITY** and setting `visible = true`, the background could clear session restore state for the “just opened” case so that even an old or accidental effect would not see an active session:
   - e.g. set `globalUIState.sessionModeActive = false` and `globalUIState.sessionId = null` (and persist) before calling `broadcastUIState()`.  
   This would guarantee that after opening the widget, no effect that depends on `sessionModeActive` and `sessionId` would run. Sessions would then only load when the user explicitly clicks **Resume Session**, which fetches feedback and sets `loadSessionWithPointers` as intended.

---

*End of extension session restore analysis. No code was modified.*
