# CaptureWidget Architectural Parity Audit

**Scope:** Web dashboard vs Chrome extension (content script) CaptureWidget flow.  
**Goal:** Extension behavior 100% identical to web in state transitions, UI phases, recording/structuring/edit lifecycles, and visibility.

---

## PHASE 1 — WEB FLOW MAP

### Where CaptureWidget is used (web)

- **Component:** `components/CaptureWidget/CaptureWidget.tsx` (shared).
- **Hook:** `components/CaptureWidget/hooks/useCaptureWidget.ts`.
- **Web usage:** Dashboard session page would pass `sessionId`, `initialPointers`, `onComplete` (e.g. `handleTranscript`), `onDelete`. The session page in the repo defines `handleTranscript` and `handleDeleteFeedback` but does not currently render `<CaptureWidget>` in the inspected source; the widget is designed for that usage and is shared with the extension.

### CaptureWidget props (web usage)

| Prop | Web | Extension (content) |
|------|-----|----------------------|
| `sessionId` | from route | from GET /api/sessions (first session) |
| `userId` | auth | user.uid |
| `extensionMode` | `false` (default) | `true` |
| `initialPointers` | optional (e.g. from session feedback) | not passed |
| `onComplete` | handleTranscript → structure + addFeedback + refetch | handleComplete → structure + POST /api/feedback |
| `onDelete` | deleteFeedback | no-op |

### useCaptureWidget state variables

| State | Type | Purpose |
|-------|------|---------|
| `isOpen` | boolean | Tray open vs floating button only |
| `state` | CaptureState | `idle` \| `capturing` \| `listening` \| `processing` \| `anticipation` \| `error` |
| `errorMessage` | string \| null | User-visible error |
| `pointers` | StructuredFeedback[] | List of feedback items in tray |
| `expandedId` | string \| null | Which item is expanded |
| `editingId` | string \| null | Which item is being edited |
| `editedTitle` / `editedDescription` | string | Edit form values |
| `showMenu` | boolean | Header "more" dropdown |
| `position` | { x, y } \| null | Dragged position |
| `recordings` | Recording[] | In-memory recordings (screenshot + transcript) |
| `activeRecordingId` | string \| null | Current recording id |
| `seconds` | number | Timer during listening |
| `isDragging` | boolean | Header drag in progress |
| `pendingStructured` | StructuredFeedback \| null | Result awaiting 160ms anticipation display |

### Web lifecycle (step-by-step)

1. **Idle**  
   - `isOpen === false` → floating button only.  
   - `isOpen === true` → tray open, state `idle`, footer "Add Feedback" visible.

2. **Click "Add Feedback"**  
   - `handleAddFeedback()`:  
     - `state !== "idle"` → return.  
     - `setErrorMessage(null)`, `recognitionRef.current?.stop()`, `setState("capturing")`.  
   - No `setIsOpen(false)` or collapse (comment in code: "do NOT call setIsOpen(false), setCollapsed(true), or setVisible(false)").

3. **Screenshot capture**  
   - Web: `lib/capture` (e.g. canvas). Extension: `chrome.runtime.sendMessage({ type: "CAPTURE_TAB" })`.  
   - On success: `generateRecordingId()`, push to `recordings`, `setActiveRecordingId(id)`, `startListening()`.  
   - On failure: `setState("error")` or `setState("idle")` + error message.

4. **Listening**  
   - `startListening()`: getUserMedia(audio), recognition.start(), `setState("listening")`, `startTimer()`.  
   - Speech results update `recordings[].transcript` via ref.  
   - UI: "Listening...", timer, waveform, Cancel / Done.

5. **Click "Done"**  
   - `finishListening()`: recognition.stop(), stopTimer(), read active recording.  
   - If no transcript: `setState("idle")`.  
   - Else: `setState("processing")`, `onComplete(transcript, screenshot)` (async).

6. **Structuring**  
   - `state === "processing"` then `state === "anticipation"`.  
   - UI: "Structuring your feedback" + progress.  
   - When `onComplete` resolves with structured: `setPendingStructured(structured)`, `setState("anticipation")`.

7. **Feedback appears in list**  
   - Effect when `state === "anticipation"` and `pendingStructured`: after 160ms, `setPointers([new, ...prev])`, `setPendingStructured(null)`, `setActiveRecordingId(null)`, `setState("idle")`.

8. **Close / collapse**  
   - Only via header X: `onClose` → `setIsOpen(false)`.  
   - **Guarded:** `setIsOpen(false)` is no-op when:  
     - `extensionMode === true`, or  
     - `state` is `capturing` \| `listening` \| `processing` \| `anticipation`, or  
     - `editingId` is set.  
   - Click-outside only closes the **menu** (`setShowMenu(false)`), and only when `!extensionMode`.

### Exact state transitions (web)

```
Idle → Click Add Feedback     → state = "capturing"
Capturing → screenshot success → state = "listening" (startListening)
Capturing → screenshot fail    → state = "idle" or "error"
Listening → Click Done         → state = "processing", onComplete()
Processing → onComplete ok     → state = "anticipation", setPendingStructured
Anticipation → 160ms           → pointers updated, state = "idle"
Listening → Click Cancel        → discardListening → state = "idle"
```

---

## PHASE 2 — EXTENSION FLOW MAP

### Content script entry

- **File:** `echly-extension/src/content.tsx`.  
- **Mount:** Once per page load; `main()` creates shadow host + root, sets `__ECHLY_INJECTED__`, never unmounts.  
- **CaptureWidget props:** `sessionId`, `userId`, `extensionMode={true}`, `onComplete={handleComplete}`, `onDelete={handleDelete}`.

### Lifecycle (content script)

- **Floating button:** N/A — content script renders the widget open in a fixed overlay (no separate “floating button” step; widget is the overlay).  
- **Add Feedback:** Same as web: `handleAddFeedback` → capturing → listening → Done → processing → anticipation → feedback in list.  
- **Screenshot:** `chrome.runtime.sendMessage({ type: "CAPTURE_TAB" })` (background captures tab).  
- **Microphone:** Same `getUserMedia({ audio: true })` in `startListening()`.  
- **Structuring:** `handleComplete` uses `apiFetch` (contentAuthFetch) to POST /api/structure-feedback and POST /api/feedback; returns first created ticket as `StructuredFeedback`.  
- **Feedback update:** Same hook logic: `setPendingStructured` → anticipation → 160ms → `setPointers`, `setState("idle")`.

### Search results (extension)

- **setIsOpen(false):** Not called in extension code; only inside shared `CaptureWidget` via header X, and **blocked** when `extensionMode === true` in `setIsOpen` guard.  
- **setCollapsed(true):** Not present in codebase.  
- **Widget visibility during recording:** No extension-specific visibility toggles; same component.  
- **useEffect affecting visibility:** None in content.tsx; only shared hook effects.  
- **pointer-events:**  
  - Shadow host: `pointerEvents: "none"` (content.tsx host style).  
  - Widget container: `pointerEvents: "auto"` (content.tsx container style).  
  - CaptureWidget overlay/backdrop: `extensionMode ? { pointerEvents: "none" }`; widget panel: `extensionMode ? { pointerEvents: "auto" }`.  
- **Focus/blur:** No `window.blur`, `document.blur`, `visibilitychange`, `focusout` in extension.  
- **Mousedown outside:** Only in hook; `handleClickOutside` runs only when `!extensionMode`, so extension does not close menu (or widget) on outside click.

**Conclusion:** Extension does not add any collapse or visibility logic. Parity issues were limited to:  
1) Web not guarding close during **capturing** or **editing** (so web could close in those states);  
2) No ref for **editingId** in the guard (so the guard could not block close during edit). Both are fixed in the hook.

---

## PHASE 3 — LIFECYCLE DIFF REPORT

| Aspect | Web | Extension (content) |
|--------|-----|---------------------|
| **Where state changes** | Same hook: handleAddFeedback, startListening, finishListening, effect for anticipation | Same |
| **When collapse can happen** | Only via X button; guarded by state + editingId | X button does nothing (extensionMode → guard returns) |
| **When isOpen stays true** | Always during capturing/listening/processing/anticipation (after fix: and when editingId set) | Always (extensionMode blocks all close) |
| **Unexpected collapse** | None in extension; no focus/blur/visibility handlers | N/A |
| **Focus events** | None that close widget | None |
| **Divergence** | — | Only difference: extension never closes tray (by design); web can close with X when idle and not editing |

---

## PHASE 4 — ALIGNMENT CHANGES MADE

1. **useCaptureWidget.ts**  
   - **Guards for closing:**  
     - Block `setIsOpen(false)` when `state === "capturing"` (screenshot in progress).  
     - Block `setIsOpen(false)` when `editingIdRef.current` is set (edit mode).  
   - **Ref for editingId:** Added `editingIdRef` and synced in `useEffect` so the guard sees current edit state.  
   - **Comment:** Updated to "during capturing/listening/structuring/edit".

2. **Extension**  
   - No focus/blur/visibility logic present; no changes.  
   - Shadow host and container pointer-events already correct.  
   - Popup already passes `extensionMode={true}`; content script same.

3. **Widget root**  
   - Mounted once in content script; no unmount or visibility toggles.

---

## PHASE 5 — EDIT FLOW VERIFICATION

- **Handler:** Same `saveEdit(id)` in `useCaptureWidget`: `authFetch(\`/api/tickets/${id}\`, { method: "PATCH", body: { title, description } })`, then `setPointers(prev => ...)`, `setEditingId(null)`.  
- **API:** `PATCH /api/tickets/:id` implemented in `app/api/tickets/[id]/route.ts`; returns `{ success, ticket }`.  
- **Extension:** `@/lib/authFetch` is aliased to `contentAuthFetch` in `esbuild-extension.mjs` for the content script build, so PATCH runs through background; same handler, same local state update.  
- **State after save:** No reset; only `setPointers` update and `setEditingId(null)`.

**Conclusion:** Edit/save flow is identical; PATCH fires, local state updates correctly, no state reset after save.

---

## EXPECTED FINAL BEHAVIOR

- **Idle → Add → Listening:** Widget stays visible.  
- **Listening → Done → Structuring:** Visible with loading.  
- **Structuring → Feedback in list:** Visible.  
- **Edit → Save:** PATCH fired, list updates instantly.  
- **No collapse during:** capturing, listening, processing, anticipation, or editing (web and extension).  
- **Extension:** Tray never closes (X no-op when `extensionMode`); no focus/blur collapse.

---

## FILES AND LINES CHANGED

1. **components/CaptureWidget/hooks/useCaptureWidget.ts**  
   - Added `editingIdRef` and `useEffect` to sync `editingId`.  
   - Extended `setIsOpen(false)` guard to include `state === "capturing"` and `editingIdRef.current`.  
   - Updated comment for the guard.

No other files modified. Extension (content.tsx, contentAuthFetch, popup) already matched requirements; only the shared hook needed alignment so web never closes during capturing or editing.
