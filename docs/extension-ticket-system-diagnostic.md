# Echly Chrome Extension — Ticket System Diagnostic Report

**Date:** 2025-03-09  
**Scope:** Full diagnostic of the extension widget ticket editing and session UI.  
**Task:** READ-ONLY analysis; no code changes.

---

## SECTION 1 — RELEVANT COMPONENTS

### 1.1 File and component index

| File path | Component / export | Purpose |
|-----------|--------------------|--------|
| `components/CaptureWidget/FeedbackItem.tsx` | `FeedbackItem` | Renders a single feedback card (ticket): title input, expand/collapse, delete, and when expanded: action steps textarea, Save/Cancel. Receives `onUpdate`, `onDelete` from parent. |
| `components/CaptureWidget/CaptureWidget.tsx` | `CaptureWidget` | Main widget container: sidebar panel, floating trigger, capture layer portal. Renders `FeedbackItem` list and `WidgetFooter`. Owns `showCommandScreen` and panel visibility. |
| `components/CaptureWidget/hooks/useCaptureWidget.ts` | `useCaptureWidget` | Hook that owns pointers, capture state, session mode, and **all ticket handlers**: `updatePointer`, `deletePointer`, etc. Uses **`authFetch` from `@/lib/authFetch`** for PATCH/DELETE. |
| `echly-extension/src/content.tsx` | `ContentApp` | Extension content script root. Renders `CaptureWidget` with `extensionMode={true}`, provides `handleComplete`, `handleDelete` (uses `apiFetch`), and session callbacks. **Does not provide `onUpdate`** — widget uses internal `handlers.updatePointer`. |
| `echly-extension/src/contentAuthFetch.ts` | `authFetch`, `apiFetch` | Extension API layer: sends `{ type: "echly-api", url, method, headers, body }` to background; background adds Bearer token and performs fetch. Used by content for pipeline, delete, sessions. |
| `lib/authFetch.ts` | `authFetch` | Web app API layer: uses Firebase `auth.currentUser` and `getIdToken()`; runs `fetch()` from the page. **Fails in content script** when Firebase auth is not available or user is null. |
| `components/CaptureWidget/WidgetFooter.tsx` | `WidgetFooter` | Renders "Start New Feedback Session", "Resume Session", "Previous Sessions" in extension mode when `onStartSession`, `onResumeSession`, `onOpenPreviousSession` are passed. |
| `components/CaptureWidget/CaptureHeader.tsx` | `CaptureHeader` | Widget header with close and summary. |
| `components/CaptureWidget/CaptureLayer.tsx` | `CaptureLayer` | Portal target for overlay (region capture, session overlay). |
| `components/CaptureWidget/ResumeSessionModal.tsx` | `ResumeSessionModal` | Modal to pick a session to resume. |
| `components/CaptureWidget/types.ts` | `StructuredFeedback`, etc. | Types for ticket: `id`, `title`, `description`, `type`, `actionSteps?`. |

**Note:** There is no file named `ContentApp.tsx`; the content script root component is the default export of `echly-extension/src/content.tsx` (referred to here as ContentApp for clarity).

---

## SECTION 2 — SAVE BUTTON FLOW

### 2.1 Where handleSave is defined

- **Component:** `FeedbackItem` (`components/CaptureWidget/FeedbackItem.tsx`).
- **Handler:** `handleSave` (lines 79–95):
  - Sets `isSaving`, clears `error`.
  - Calls `onUpdate(ticket.id, { title: editedTitle.trim() || editedTitle, actionSteps: editedSteps })`.
  - On success: collapses (`setExpanded(false)`, `onExpandChange?.(null)`).
  - On error: sets `setError("Failed to save changes")`.

### 2.2 What payload is sent

- `onUpdate` is `handlers.updatePointer` from `useCaptureWidget`.
- Payload: `{ title: string, actionSteps: string[] }`.
- In the hook, `updatePointer` builds:
  - `description = payload.actionSteps.join("\n")`
  - Body: `{ title, description, actionSteps }` sent to `PATCH /api/tickets/:id`.

### 2.3 Which endpoint is called

- **Endpoint:** `PATCH /api/tickets/:id`
- **Server:** `app/api/tickets/[id]/route.ts` — `PATCH` handler exists and supports `title`, `description`, `actionSteps`, etc.

### 2.4 What response is expected

- JSON: `{ success: boolean, ticket?: { id, title, description, actionSteps?, type? } }`.
- Hook expects `res.ok && data.success` and then updates local `pointers` from `data.ticket`.

### 2.5 Why Save fails in the extension

- **Cause:** In the extension, `CaptureWidget` uses `useCaptureWidget`, which imports **`authFetch` from `@/lib/authFetch`**.
- **`lib/authFetch.ts`** uses Firebase `auth.currentUser` and `getCachedIdToken(user)`. In the content script, Firebase is not the auth source; the background script holds the token and proxies requests via `echly-api`.
- **Result:** When the user clicks Save, `updatePointer` runs in the hook and calls `authFetch(...)`. Either:
  - `auth.currentUser` is null → throws "User not authenticated", or
  - The request is sent from the page context without the extension’s token and fails (CORS/auth).
- **Contrast:** Content script’s `handleDelete` uses **`apiFetch`** (contentAuthFetch) and works because it goes through the background and `echly-api`. **There is no equivalent `onUpdate` override** passed from content to the widget; the widget always uses the hook’s `updatePointer` and thus `authFetch`. So **Save does not work in the extension**, while Delete can work because it is wired to content’s `handleDelete` → `apiFetch`.

### 2.6 PATCH in background

- **Yes.** The background script handles `echly-api` generically: it accepts any `method` (including `PATCH` and `DELETE`), adds the Bearer token, and calls `fetch(url, { method, headers, body })`. So **PATCH /api/tickets/:id is supported** by the pipeline; the failure is that the **widget never uses that pipeline for Save** — it uses `authFetch` from the main app.

---

## SECTION 3 — API REQUEST SYSTEM

### 3.1 Pipeline overview

- **Content script:** For extension UI, API calls that go through **`echly-extension/src/contentAuthFetch.ts`** use:
  - `apiFetch(path, options)` → builds full URL with `API_BASE` (e.g. `http://localhost:3000`), then calls `authFetch(url, options)`.
  - `authFetch` sends `chrome.runtime.sendMessage({ type: "echly-api", url, method, headers, body })`.
- **Background** (`echly-extension/src/background.ts`):
  - Listens for `echly-api`, gets token via `getValidToken()` (or optional `token` in request), sets `Authorization: Bearer <token>`, runs `fetch(url, { method, headers, body })`, returns `{ ok, status, headers, body }`.
- **API server:** Next.js routes (e.g. `app/api/tickets/[id]/route.ts`) handle GET/PATCH/DELETE.

### 3.2 PATCH and DELETE support

- **Background:** Supports any method (GET, POST, PATCH, DELETE, etc.) for `echly-api`; it forwards `method` to `fetch`.
- **Server:** `app/api/tickets/[id]/route.ts` implements GET, PATCH, and DELETE.
- **Conclusion:** PATCH and DELETE are supported end-to-end **when the caller uses the extension’s `apiFetch`/`authFetch` (contentAuthFetch)**. The problem is that **ticket update in the widget does not use that path**; it uses `@/lib/authFetch`, which is the web app’s Firebase-based fetch.

---

## SECTION 4 — TICKET DATA STRUCTURE

### 4.1 Where ticket objects are defined

- **Widget type:** `components/CaptureWidget/types.ts` — `StructuredFeedback`: `id`, `title`, `description`, `type`, `actionSteps?: string[]`.
- **Domain:** `lib/domain/feedback.ts` — `Feedback` has `actionSteps?: string[] | null`; `StructuredFeedback` (domain) also has `actionSteps?`.

### 4.2 Properties

- `id`, `title`, `description`, `type`, `actionSteps` (optional).
- Session/backend also use `sessionId`, `screenshotUrl`, etc., but the widget’s list uses the subset above.

### 4.3 actionSteps vs description

- **Backend/API:** Both exist. PATCH accepts `description` and `actionSteps`; repository maps both; Firestore stores both (with backward compat for `actionItems` → `actionSteps`).
- **Widget:** `FeedbackItem` uses `extractSteps(ticket)`: if `ticket.actionSteps?.length` use it, else parse `ticket.description` (split by newlines, trim list markers). So steps can come from **either** `actionSteps` or `description`.
- **Extension loading:** When content fetches session feedback via `apiFetch("/api/feedback?sessionId=...")`, it maps the response to pointers with **only** `id`, `title`, `description`, `type`. It **does not** map `actionSteps` from the API response. So in the extension, loaded tickets often have **no** `actionSteps`; steps are then derived from `description` in `FeedbackItem`.

### 4.4 Example ticket object (from code)

```ts
// From types.ts (CaptureWidget)
{
  id: string;
  title: string;
  description: string;
  type: string;
  actionSteps?: string[];
}
```

---

## SECTION 5 — ACTION STEPS EDITOR

### 5.1 Where it renders

- **Component:** `FeedbackItem.tsx`.
- **Condition:** The action steps textarea and Save/Cancel are inside the **expanded** branch: `expanded ? ( ... <div className="echly-ticket-expanded"> ... <textarea className="echly-action-editor" value={editedSteps.join("\n")} ... /> ... ) : ( ... collapsed header ... )`.

### 5.2 editedSteps state

- **Initial:** `useState<string[]>([])` — so initially empty.
- **Sync from ticket:** `useEffect` (lines 53–62) runs when `ticket` changes:
  - If `ticket.actionSteps && ticket.actionSteps.length` → `setEditedSteps(ticket.actionSteps)`.
  - Else if `ticket.description` → `setEditedSteps(ticket.description.split("\n"))`.
  - Else → `setEditedSteps([])`.

### 5.3 Why the textarea sometimes does not appear

- **Expanded branch:** The textarea only exists when `expanded === true`. If expansion state is wrong (e.g. another component or memo prevents `expanded` from being true when the user expanded), the editor block won’t render.
- **Stale/empty editedSteps:** The editor always renders with `editedSteps.join("\n")`. If the sync effect hasn’t run yet (e.g. first paint before effect) or `ticket` has no `description` and no `actionSteps`, `editedSteps` stays `[]` — the textarea is visible but empty. So “does not render” here is more likely “expanded block not shown” than “textarea missing from DOM”.
- **React.memo:** `FeedbackItem` is memoized with a custom comparator: `prev.item === next.item && prev.highlightTicketId === next.highlightTicketId`. If the parent passes a new `item` reference when the ticket is updated elsewhere, the component re-renders and the effect runs again. If references are reused incorrectly, expansion or steps could look stuck.
- **Race:** If the user expands before the effect that sets `editedSteps` from `ticket` has run, they might briefly see an empty editor; in pathological cases (e.g. very fast expand/collapse or multiple updates) the expanded block could be omitted or flicker.

**Summary:** The Action Steps editor can “not render” either because (1) **expansion** is not true when expected, or (2) the **expanded block** is rendered but the textarea is empty or layout/CSS hides it. The logic depends on `expanded` and `editedSteps`; both are initialized and synced from `ticket`, but timing and reference equality can make the behavior inconsistent.

---

## SECTION 6 — EXPANSION STATE

### 6.1 State variables

- **FeedbackItem (local):** `expanded` — `useState(false)`. Toggled by expand button and by `highlightTicketId === ticket.id` in an effect.
- **useCaptureWidget:** `expandedId` — `useState<string | null>(null)`. Set by `handlers.setExpandedId`; passed to `FeedbackItem` as `onExpandChange`.
- **CaptureWidget:** Does not own expansion; it passes `state.highlightTicketId` and `handlers.setExpandedId` to each `FeedbackItem`.

### 6.2 Who owns editing state

- **Expansion:** Each `FeedbackItem` owns its own `expanded`; it also calls `onExpandChange?.(id)` when expanding and `onExpandChange?.(null)` when collapsing or after save. The hook’s `expandedId` is updated by this callback but is **not** used to force expansion of a specific item from the parent — the parent only uses `highlightTicketId` to trigger expansion in the effect `if (highlightTicketId === ticket.id) { setExpanded(true); onExpandChange?.(ticket.id); }`.
- **Editing (title/description in hook):** The hook has `editingId`, `editedTitle`, `editedDescription` and `startEditing`/`saveEdit`, but **FeedbackItem does not use these**. FeedbackItem keeps its own `editedTitle` and `editedSteps` and calls `onUpdate` (updatePointer) on Save. So there are **two editing paths**: (1) FeedbackItem’s inline expand/save (used by the widget list), and (2) the hook’s `editingId`/`saveEdit` (used elsewhere or legacy). They are not shared; no conflict between them for the card UI, but state is duplicated.

### 6.3 Can expansion conflict?

- **Possible confusion:** Only one item can be “highlighted” (`highlightTicketId`), and when that changes the effect in FeedbackItem sets `expanded = true` for that item. Multiple items could theoretically have local `expanded === true` if the user expanded several and never collapsed them, because each item’s `expanded` is local. `onExpandChange` only informs the parent of the current “expanded” item; the parent does not force others to collapse. So multiple cards could be expanded at once; layout or UX could look wrong.
- **Layout:** If multiple cards expand, the sidebar scrolls and the “expanded” block (title + textarea + buttons) can push content; combined with fixed/max-height and overflow, this could contribute to “layout breaks” (see Section 7).

---

## SECTION 7 — TICKET CARD LAYOUT

### 7.1 DOM structure

- **Card container:** `div.echly-feedback-item` (with optional `echly-ticket-highlight`).
- **Row:** `div.echly-ticket-row` (flex, align start, gap 10px).
  - **Dot:** `div.echly-ticket-dot.echly-priority-dot`.
  - **Content:** `div.echly-ticket-content` (flex: 1, min-width: 0, flex column, gap 8px).
    - **Collapsed:** `div.echly-ticket-header` (flex, space-between): title input, header actions (expand, delete).
    - **Expanded:** `div.echly-ticket-expanded` (flex column, gap 10px): title input, `textarea.echly-action-editor`, error div, `div.echly-edit-actions` (Save, Cancel).

### 7.2 CSS that can affect layout

- **`.echly-feedback-item`:** `min-width: 0`, `overflow: hidden` — can clip content if the expanded section is wide or tall.
- **`.echly-ticket-content`:** `flex: 1`, `min-width: 0` — allows shrinking; fine for flex.
- **`.echly-ticket-expanded`:** `display: flex`, `flex-direction: column`, `gap: 10px`, `width: 100%`, `margin-top: 10px` — no absolute/fixed; normal flow.
- **`.echly-sidebar-body`:** `max-height: 60vh`, `overflow-y: auto` — list scrolls; if many or long cards, scrolling and flex can make the card feel “broken” when expanded (e.g. card height grows and pushes others, or overflow hidden on the item clips the textarea).

### 7.3 Why expanded content can “break” the card

- **overflow: hidden** on `.echly-feedback-item` can clip the expanded block (textarea + buttons) if the content is taller than the card’s computed height or if flex/height calculation is wrong.
- **No explicit min-height** on the expanded block; the textarea has `min-height: 80px`. If the container or a parent has a constrained height (e.g. from a parent flex), the card can look cut off.
- **Multiple expanded cards** increase total height inside `.echly-feedback-list`; with `max-height: 60vh` on the body, the combination of many items and long text can make layout cramped or cause the “break” feeling.
- **Shadow DOM / extension:** Styles are injected from `popup.css` into the shadow root. If any critical class (e.g. for flex or overflow) is missing or overridden in the extension, layout could differ from the web app.

**Summary:** The main layout risk is **`.echly-feedback-item { overflow: hidden }`** together with variable-height expanded content and scrolling in `.echly-sidebar-body`; secondary is possible style differences in the extension environment.

---

## SECTION 8 — SESSION BUTTON LOGIC

### 8.1 Where session control buttons are

- **Component:** `WidgetFooter` (`components/CaptureWidget/WidgetFooter.tsx`).
- **When:** Rendered in `CaptureWidget` when **`state.state === "idle" && state.pointers.length === 0`** (lines 254–273). So the three session buttons only show when the widget is idle and there are **no** tickets in the list.

### 8.2 Conditions for showing the three buttons

- **Extension mode:** `WidgetFooter` receives `onStartSession`, `onResumeSession`, `onOpenPreviousSession` from `CaptureWidget` only in extension mode.
- **WidgetFooter:** `showSessionActions = Boolean(onResumeSession || onOpenPreviousSession)`. So “Resume Session” and “Previous Sessions” appear if either prop is passed. “Start New Feedback Session” is always shown in extension mode (when footer is shown).
- **CaptureWidget passes:**
  - `onStartSession`: `handlers.startSession`
  - `onResumeSession`: `extensionMode && hasStoredSession ? handleResumeActiveSession : undefined`
  - `onOpenPreviousSession`: `extensionMode && fetchSessions && onResumeSessionSelect ? () => setResumeModalOpen(true) : undefined`
  - `hasActiveSession`: `hasStoredSession` (Boolean(sessionId)).

So session buttons depend on: **sessionId** (for Resume and hasActiveSession), **fetchSessions** and **onResumeSessionSelect** (for Previous Sessions), and **state.state === "idle"** and **state.pointers.length === 0**.

### 8.3 List vs footer visibility (extension)

- The **feedback list** is hidden when `extensionMode && showCommandScreen && !showPanelWhenPaused` (lines 230–231). So when `showCommandScreen` is true, the list (and error) are not rendered; the **footer is still rendered** when `state.state === "idle" && state.pointers.length === 0`.
- So the three session buttons can appear even when the list is hidden (e.g. “command screen” with no tickets).

---

## SECTION 9 — DEFAULT SESSION UI STATE (SESSION LOADED, NO TICKETS)

### 9.1 Expected behavior

- When a session is already loaded and there are no tickets, the three session buttons (Start New, Resume, Previous Sessions) should appear automatically.

### 9.2 When session is “loaded” with no tickets

- **From global state:** Content’s effect runs when `globalState.sessionModeActive && globalState.sessionId`; it fetches `/api/feedback?sessionId=...`, then sets `loadSessionWithPointers({ sessionId, pointers })` (pointers = [] when none).
- **useCaptureWidget:** When `loadSessionWithPointers` is set, an effect sets `setPointers(loadSessionWithPointers.pointers ?? [])` and calls `onSessionLoaded()`. So after this, `state.pointers.length === 0`.
- **showCommandScreen:** This is local state in CaptureWidget, initial value `true`. It is set to **false** only when: (1) user selects a session from the Resume modal (`onResumeSessionSelect` callback does `setShowCommandScreen(false)`), or (2) user ends the session (`onSessionEndCallback` in `endSession` does `setShowCommandScreen(true)`). So when the session is loaded **automatically** from global state (e.g. tab already had sessionId), **showCommandScreen is never set to false**.

### 9.3 Why the buttons might not appear automatically

- **Visibility of the panel:** Session buttons are inside the sidebar body, which is visible only when `showPanel` is true. `showPanel = (effectiveIsOpen && showSidebar) || showPanelWhenPaused`. So the user must open the widget (`effectiveIsOpen` from `globalState.expanded`) and not be in capture flow or session overlay (`showSidebar` true). If the widget is not expanded when the session loads, the user won’t see the panel at all until they open it.
- **Timing:** When the tab loads, content gets `ECHLY_GET_GLOBAL_STATE` and then may run the effect that fetches feedback and sets `loadSessionWithPointers`. Until that effect completes, `pointers` in the hook might still be from a previous run or initial `[]`. So briefly `state.pointers.length` might not be 0 (e.g. if initialPointers was passed with data), and the footer would not show until the effect sets pointers to [].
- **showCommandScreen stays true:** When session is loaded via global state (not via “Resume” picker), the list is hidden but the footer with the three buttons should still render when idle and no pointers. So in theory the buttons are there. If they “don’t appear,” possible causes: (1) **Widget not expanded** when the user expects to see them, (2) **pointers not yet []** (e.g. before loadSessionWithPointers effect runs), or (3) **state not idle** (e.g. processing or another state) so the footer condition fails.
- **Explicit transition to “session view”:** The code never sets `showCommandScreen = false` when `loadSessionWithPointers` is applied. So after an auto-load, the UI is still in “command screen” mode (list hidden). The footer is the only content in the body; if the user expects a more prominent “session loaded, no tickets” view, the current design might not match that expectation, or the footer could be missed (e.g. at bottom of a short sidebar).

**Summary:** The main reasons the session buttons might not “appear automatically” when a session is loaded with no tickets: (1) widget not open (`expanded` false), (2) `pointers` not yet updated to [] (timing), (3) `state.state !== "idle"`, or (4) no automatic `setShowCommandScreen(false)` when loading session from global state, so the UI stays in command screen and the footer (with buttons) might be the only visible content and easy to overlook.

---

## SECTION 10 — DELETE FUNCTION

### 10.1 Delete flow

- **FeedbackItem:** Delete button calls `handleDelete` → `onDelete(ticket.id)`.
- **CaptureWidget:** Passes `onDelete={handlers.deletePointer}`. So in the **web app**, delete goes through the hook’s `deletePointer`, which uses **authFetch** and would have the same extension issue if used in content.
- **Extension:** Content does **not** pass a custom `onUpdate`, but it **does** pass **`onDelete={handleDelete}`** (content’s own handler). So in the extension, **Delete uses content’s `handleDelete`**, which calls **`apiFetch(\`/api/tickets/${id}\`, { method: "DELETE" })`** (contentAuthFetch → echly-api).

### 10.2 Background and server

- **Background:** `echly-api` supports any method; it forwards `method: "DELETE"` to `fetch`.
- **Server:** `app/api/tickets/[id]/route.ts` implements `DELETE` and returns success.
- **Conclusion:** Delete works in the extension because the widget receives content’s `handleDelete` and thus uses the extension’s API pipeline. Save fails because the widget does not receive an `onUpdate` override and always uses the hook’s `updatePointer` with `authFetch`.

---

## SECTION 11 — FINAL REPORT

### 11.1 Architecture of the ticket editing system

- **FeedbackItem:** Per-ticket UI (title, expand, delete; when expanded: title, action steps textarea, Save/Cancel). Calls `onUpdate(id, { title, actionSteps })` and `onDelete(id)`.
- **CaptureWidget:** Renders list of FeedbackItems and WidgetFooter; passes `handlers.updatePointer` and (in extension) content’s `handleDelete` as `onDelete`. Does not accept or use an `onUpdate` prop from the parent.
- **useCaptureWidget:** Holds `pointers`, `expandedId`, and handlers. **updatePointer** uses **`authFetch` from `@/lib/authFetch`** (Firebase, page context). **deletePointer** calls `onDelete(id)` (provided by parent); in extension that is content’s `handleDelete` (apiFetch).
- **Content script:** Provides `handleDelete` (apiFetch) and `handleComplete`; does **not** provide an update handler. So ticket **updates** always go through the hook and thus through `authFetch`, which is wrong in the extension.

### 11.2 Root cause: Save button failure

- **Cause:** In the extension, Save uses the hook’s `updatePointer`, which calls **`authFetch` from `@/lib/authFetch`**. That uses Firebase `auth.currentUser` and does not use the extension’s token or background proxy. So the request either throws (“User not authenticated”) or fails due to missing/wrong auth.
- **Fix (recommended, not implemented):** Either (1) add an optional **`onUpdate`** prop to CaptureWidget and pass from content an update handler that uses **`apiFetch`** (contentAuthFetch), and use it in the hook when provided; or (2) make the hook use a dependency-injected or context-based fetch so that in the extension it uses contentAuthFetch instead of lib/authFetch.

### 11.3 Root cause: Action Steps editor sometimes not rendering

- **Causes:** (1) The editor is only in the **expanded** branch; if `expanded` is false when the user expects it true (e.g. memo, race, or highlight/expand logic), the block won’t show. (2) `editedSteps` is synced from `ticket` in an effect; on first paint it can be `[]` and the textarea can appear empty. (3) Extension loads tickets without `actionSteps` (only id, title, description, type); steps are derived from `description`, so if `description` is empty the textarea is empty but still rendered when expanded.
- **Fix (recommended):** Ensure expansion state is reliable (e.g. consider controlling expansion from parent via a single `expandedId` and deriving `expanded = (expandedId === ticket.id)` in FeedbackItem). Optionally initialize `editedSteps` from `extractSteps(ticket)` in a function initializer for useState to avoid one frame of empty state.

### 11.4 Root cause: Expanded ticket layout breaking the card

- **Cause:** `.echly-feedback-item` has **`overflow: hidden`**, which can clip the expanded block (textarea + buttons). Combined with `.echly-sidebar-body`’s `max-height: 60vh` and `overflow-y: auto`, multiple or long expanded cards can make the card feel broken or cut off.
- **Fix (recommended):** Consider `overflow: visible` on the feedback item when expanded, or a dedicated class for expanded state that allows overflow; ensure the expanded block has enough min-height and that the sidebar scrolls correctly.

### 11.5 Root cause: Ticket updates not persisting to backend

- **Same as Save button:** Updates go through **authFetch** in the hook, which fails in the extension. So changes do not reach the backend when using the extension.

### 11.6 Root cause: Session buttons conflicting with ticket layout

- **Observation:** Session buttons live in **WidgetFooter**, which is rendered **only when `state.pointers.length === 0`**. So when there are tickets, the footer (and the three session buttons) are **not** shown. So “conflict” may mean: (1) when there are no tickets, the footer appears and might push or share space with other content (e.g. empty list area), or (2) when there are tickets, the user loses quick access to session actions. The layout uses flex and gap in `.echly-sidebar-body`; the footer is a sibling to the list, so when both are present (list empty, footer shown) they stack. No direct overlap; “conflict” might refer to UX (wanting session actions visible even when there are tickets) or to the command-screen vs list visibility logic.

### 11.7 Root cause: Session buttons not appearing on load when session has no tickets

- **Causes:** (1) **Widget not expanded** when the session is loaded (user must open the widget). (2) **Timing:** `loadSessionWithPointers` is set asynchronously after fetching feedback; until that effect runs, `pointers` might not be [] so the footer condition fails. (3) **showCommandScreen** is never set to false when session is auto-loaded from global state, so the list is hidden and the footer is the only body content — it should still render when idle and pointers.length === 0; if it doesn’t, check that `state.state === "idle"` and that pointers have been set to [] after load.
- **Fix (recommended):** When applying `loadSessionWithPointers` (e.g. from global state with sessionId), consider calling **setShowCommandScreen(false)** so the UI clearly transitions to “session view.” Optionally ensure the footer is visible and prominent when `sessionId` is set and `pointers.length === 0` (e.g. scroll into view or a dedicated empty-session state).

### 11.8 Files responsible

| Issue | Primary files |
|-------|----------------|
| Save not working | `components/CaptureWidget/hooks/useCaptureWidget.ts` (updatePointer uses authFetch), `lib/authFetch.ts`, `echly-extension/src/content.tsx` (no onUpdate passed) |
| Action Steps editor | `components/CaptureWidget/FeedbackItem.tsx` (expansion + editedSteps sync) |
| Layout break | `app/globals.css` (.echly-feedback-item overflow, .echly-sidebar-body), `components/CaptureWidget/FeedbackItem.tsx` (structure) |
| Updates not persisting | Same as Save (useCaptureWidget + authFetch) |
| Session buttons conflict | `components/CaptureWidget/CaptureWidget.tsx` (showCommandScreen, footer condition), `components/CaptureWidget/WidgetFooter.tsx` |
| Session buttons on load | `components/CaptureWidget/CaptureWidget.tsx` (showCommandScreen never set false on loadSessionWithPointers), `components/CaptureWidget/hooks/useCaptureWidget.ts` (loadSessionWithPointers effect), `echly-extension/src/content.tsx` (when loadSessionWithPointers is set) |
| Delete | Works in extension via `content.tsx` `handleDelete` → apiFetch; background and `app/api/tickets/[id]/route.ts` |

### 11.9 Recommended fixes (summary, no implementation)

1. **Save / persistence:** Add an optional **onUpdate** (and use it in the hook when provided) so the extension can pass an update handler that uses **apiFetch**; or inject the fetch implementation (e.g. context or prop) so the hook uses contentAuthFetch in the extension.
2. **Action Steps:** Make expansion more robust (e.g. parent-controlled expandedId); consider initializing editedSteps from `extractSteps(ticket)` to avoid empty first frame; ensure extension feedback load includes **actionSteps** in the mapped pointers when the API returns them.
3. **Layout:** Relax **overflow: hidden** on the feedback item when expanded (e.g. overflow: visible or a dedicated class).
4. **Session buttons on load:** Set **showCommandScreen = false** when applying loadSessionWithPointers (e.g. in CaptureWidget or via callback from content); ensure footer is visible when sessionId exists and pointers.length === 0 after load.
5. **Session vs ticket layout:** If desired, consider showing session actions (e.g. compact bar or link) even when there are tickets, so they don’t disappear entirely when the list is non-empty.

---

*End of diagnostic report. No code was modified.*
