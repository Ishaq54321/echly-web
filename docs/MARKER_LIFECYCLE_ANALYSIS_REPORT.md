# Session Feedback Markers — Lifecycle Analysis Report

**Task:** Trace why numbered markers do not appear on the page after feedback is successfully submitted during Session Feedback Mode. Analysis only; no behavior changes.

---

## STEP 1 — Marker creation call

**Location:** `components/CaptureWidget/hooks/useCaptureWidget.ts`

`createMarker(...)` is called inside the **session feedback success handler** — i.e. inside `onSuccess` passed to `onComplete` when the user submits feedback.

**Relevant code (lines 754–798):**

```ts
const handleSessionFeedbackSubmit = useCallback(
  (transcript: string) => {
    const pending = sessionFeedbackPending;
    if (!pending || !transcript.trim()) return;
    setState("processing");
    onComplete(transcript, pending.screenshot, {
      onSuccess: (ticket) => {
        setPointers(...);
        setHighlightTicketId(ticket.id);
        setTimeout(() => setHighlightTicketId(null), 1200);
        setSessionFeedbackPending(null);
        setState("idle");
        const root = captureRootRef.current;
        if (root) {
          createMarker(root, { id, x: 0, y: 0, element: lastSessionClickedElementRef.current ?? undefined, title }, options);
        }
        lastSessionClickedElementRef.current = null;
      },
      onError: () => { ... },
    }, pending.context ?? undefined);
  },
  [sessionFeedbackPending, onComplete]
);
```

**Findings:**

- The block that calls `createMarker` **only runs when `root` is truthy** (i.e. when `captureRootRef.current` is set).
- So if markers never appear, either:
  1. `createMarker` is never called because `root` is null, or  
  2. `createMarker` is called but the marker is removed or not visible afterward.

The success handler is invoked by the extension’s `handleComplete` when the async flow (upload + structure-feedback + feedback API) succeeds and it calls `callbacks.onSuccess(firstCreated)`. So the **call path to `createMarker` exists and is correct**; execution depends on `captureRootRef.current` and on what happens to the DOM after the marker is appended.

---

## STEP 2 — Capture root at createMarker time

**Ref:** `captureRootRef` (same file, line 145). Set in `createCaptureRoot` (lines 333–340):

```ts
const createCaptureRoot = useCallback(() => {
  if (captureRootRef.current) return;
  const captureEl = document.createElement("div");
  captureEl.id = "echly-capture-root";
  document.body.appendChild(captureEl);
  captureRootRef.current = captureEl;
  setCaptureRootEl(captureEl);
  setCaptureRootReady(true);
}, []);
```

**When it’s created for session mode:** In `handleSessionStart` (lines 698–706), which runs when the user starts Session Feedback Mode:

```ts
setSessionMode(true);
createCaptureRoot();
```

So in the normal flow, the capture root exists before any feedback is submitted.

**When it could be null when `createMarker` runs:**

1. **Session ended before success:** If the user ends the session before the async `onComplete` resolves, `endSession` calls `removeCaptureRoot()`, which sets `captureRootRef.current = null`. Then when `onSuccess` runs later, `root` is null and `createMarker` is never called.
2. **No other code path clears the ref** between session start and `onSuccess`; only `removeCaptureRoot` does.

So: **if the user does not end the session before the request completes, `captureRootRef.current` should still be set when `onSuccess` runs.** If it is null, the most likely reason is session end (or a bug in ref lifecycle). This does not by itself explain “markers never appear” in the “submit and stay in session” case unless there is a race (e.g. very fast “End session” after submit).

---

## STEP 3 — Element reference at marker creation

**Ref:** `lastSessionClickedElementRef` (line 135).

- **Set:** In `handleSessionElementClicked` (line 747), when the user clicks an element:  
  `lastSessionClickedElementRef.current = element instanceof HTMLElement ? element : null`
- **Cleared:** In the same `onSuccess` callback, **after** the `if (root) { createMarker(...); }` block (line 789):  
  `lastSessionClickedElementRef.current = null`

So at the moment `createMarker` runs, the ref has not yet been cleared. **The clicked element reference is still available when marker creation runs.**

Caveat: if the user clicked a non-`HTMLElement` (e.g. SVG, text node), the ref is set to `null`, so `data.element` is `undefined`. In that case `createMarker` still runs but uses `data.x` and `data.y` (both 0), so the marker is placed at **(0, 0)**. It would still be “created and rendered,” just at the top‑left of the viewport (and possibly off-screen or hard to see), not “not appearing” in the sense of never being in the DOM.

---

## STEP 4 — createMarker implementation

**File:** `components/CaptureWidget/session/feedbackMarkers.ts`

**Behavior:**

1. **Creates a DOM node:** `document.createElement("div")` (line 87), class `echly-feedback-marker`, numbered text, title, inline styles.
2. **Appends to container:** `container.appendChild(domEl)` (line 132), where `container` is the passed `captureLayerContainer` (the capture root).
3. **Positioning:** `applyPosition(domEl, x, y)` (line 114) sets `left`, `top` and `transform: translate(-50%, -50%)`. Coordinates come from either `data.element` (center via `getCenterFromElement` → `getBoundingClientRect()`) or `data.x` / `data.y` (0, 0 if no element).
4. **Visibility:** Inline styles include `position: fixed`, `z-index: 2147483646`, `width: 22px`, `height: 22px`, `background: #2563eb`, `display: flex`, etc. (lines 94–111).

So **createMarker does create a DOM node, append it to the given container, position it with fixed coordinates, and apply visible styles.** The implementation is consistent with “markers should be visible” assuming the node stays in the DOM and the container is in the document and not hidden.

---

## STEP 5 — Marker container and visibility

**Container:** Markers are appended to the **same** element used as the portal target for the capture layer: the div created in `createCaptureRoot` (`#echly-capture-root`), appended to `document.body` (useCaptureWidget.ts line 337). That same div is passed to `CaptureLayer` as `captureRoot={captureRootEl}` and is the target of `createPortal(captureContent, captureRoot)` in both `CaptureLayer` and `SessionOverlay`.

So the marker container is the **capture layer container** used by CaptureLayer, SessionOverlay, and ElementHighlighter. The container itself is in the DOM (on `document.body`) and has no inline styles that would hide it. **So the container is visible and in the document.**

Important detail: **two separate `createPortal(..., captureRoot)` calls render into this same container:**

1. **CaptureLayer** (CaptureLayer.tsx line 112): `createPortal(captureContent, captureRoot)` — where `captureContent` includes `SessionOverlay` and optionally dim/region overlays.
2. **SessionOverlay** (SessionOverlay.tsx line 85): `createPortal(content, captureRoot)` — session UI (control panel, feedback popup).

So the same DOM node is the portal target for two different React trees. React’s reconciliation for this container only knows about the nodes it created for these portals. Any imperatively appended node (the marker div) is **not** part of React’s tree. On the next commit after `onSuccess`, React will reconcile the portal target; depending on how React handles multiple portals to the same container and whether it replaces or reorders children, **the imperatively appended marker node can be removed or overwritten.** This is the **strongest candidate root cause** for “markers not appearing”: they are created and appended, then removed or lost when React re-renders the portals.

---

## STEP 6 — CSS visibility

In `feedbackMarkers.ts` the marker’s inline style includes:

- `position: fixed`
- `z-index: 2147483646` (only 2147483647 is higher in the codebase, used for the extension host)
- `width: 22px`, `height: 22px`
- `background: #2563eb`
- `display: flex`, alignment, etc.

So **CSS visibility and stacking are correct** for a visible marker. No issue here unless the node is not in the DOM or is inside a hidden/zero-size parent (we already established the capture root is on `document.body` and not hidden).

---

## STEP 7 — Scroll / viewport coordinates

- **Position source:** When `data.element` is set, position comes from `getCenterFromElement(data.element)`, which uses `el.getBoundingClientRect()` — viewport coordinates.
- **Marker style:** `position: fixed` with `left`/`top` in pixels and `transform: translate(-50%, -50%)`.

So the marker uses the same coordinate system as the rect (viewport). The container is just a div on `document.body` with no transform; it doesn’t change the meaning of fixed positioning. **No coordinate system mismatch.** If the marker were still in the DOM, it would be in the right place (or at (0,0) when there is no element).

---

## STEP 8 — Debug logs (recommended)

The module already logs when a marker is created (feedbackMarkers.ts line 134):

```ts
console.log(`${LOG_PREFIX} marker created`, entry.id, index);
```

(`LOG_PREFIX` is `"[SESSION]"`.)

**Suggested temporary logs to confirm the lifecycle:**

1. **In useCaptureWidget.ts, inside the onSuccess callback, before and around createMarker:**
   - `console.log("[MARKER] createMarker called", { ticketId: ticket.id, hasRoot: !!root, hasElement: !!lastSessionClickedElementRef.current });`
   - If you see this with `hasRoot: false`, the ref is null and createMarker is skipped.
   - If you see `hasRoot: true` but never see `[SESSION] marker created`, then either createMarker isn’t called or it returns early (e.g. `!captureLayerContainer`).

2. **In feedbackMarkers.ts, inside createMarker:**
   - `console.log("[MARKER] createMarker entry", { container: !!captureLayerContainer, element: !!data.element, rect/position: data.element ? getCenterFromElement(data.element) : { x: data.x, y: data.y } });`
   - And after `container.appendChild(domEl)`:
   - `console.log("[MARKER] marker appended, parentNode:", domEl.parentNode?.id ?? domEl.parentNode);`

**How to interpret:**

- **"[MARKER] createMarker called" with hasRoot: false** → Root cause: capture root is null when onSuccess runs (e.g. session ended first, or ref not set).
- **"[MARKER] createMarker called" with hasRoot: true, and "[SESSION] marker created" and "[MARKER] marker appended"** → Marker is created and appended. If it still doesn’t appear on screen, check in DevTools whether the marker node exists in `#echly-capture-root` immediately after append and then disappears after the next React update — that would confirm the “React reconciliation removes it” theory.
- **No "[MARKER] createMarker called" at all** → onSuccess is never run (e.g. extension calls onError, or clarity flow doesn’t call onSuccess).

---

## Root cause summary

**Why markers are not appearing (best explanation from this trace):**

1. **Most likely: React portal reconciliation removes the marker.**  
   The same container (`#echly-capture-root`) is used as the target for **two** `createPortal` calls (CaptureLayer and SessionOverlay). Markers are added imperatively to that container. When `onSuccess` runs, it:
   - Updates state (`setSessionFeedbackPending(null)`, `setState("idle")`),
   - Appends the marker to the capture root,
   - Then returns.

   React then flushes the state update and re-renders. Both CaptureLayer and SessionOverlay run `createPortal(..., captureRoot)` again. React reconciles the portal target’s children. The marker node is not part of React’s tree, so it can be removed or overwritten when React updates the container’s children. So **markers are likely created and appended, then removed on the next React commit.**

2. **Possible contributing factor: capture root is null.**  
   If the user ends the session before the async feedback request completes, `removeCaptureRoot()` runs and `captureRootRef.current` becomes null. When `onSuccess` later runs, `createMarker` is never called. This would explain “no marker” only when the session is ended quickly after submit.

3. **Unlikely to be the main issue:**  
   - `lastSessionClickedElementRef` is still set when createMarker runs (cleared only after).  
   - createMarker implementation (DOM creation, append, position, styles) is correct.  
   - Container is on `document.body` and visible.  
   - CSS and viewport coordinates are correct.

**Recommended next step (still analysis):** Add the temporary logs above and run one “submit feedback and stay in session” flow. Check:

- Whether `[MARKER] createMarker called` and `[SESSION] marker created` and `[MARKER] marker appended` appear.
- In Elements panel, whether a `.echly-feedback-marker` node appears under `#echly-capture-root` and then disappears after a short time.

If the node appears and then disappears, that confirms that **React’s reconciliation of the dual portal target is removing the imperatively added marker nodes.**
