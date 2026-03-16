# Previous Session Button — Full Audit Report

**Goal:** The "Previous Sessions" button should open the user's latest active session (or the sessions list) immediately on the first click. Currently it sometimes requires multiple clicks before navigation/modal appears.

**Scope:** Execution flow only. No code changes in this document.

---

## 1. File and component containing the button

| Item | Location |
|------|----------|
| **Button label** | "Previous Sessions" (plural) |
| **Button component** | `WidgetFooter` |
| **Button file** | `components/CaptureWidget/WidgetFooter.tsx` |
| **Button usage** | Rendered inside `CaptureWidget` when `extensionMode && showHomeScreen && !sessionLimitReached`. |
| **Parent that wires the handler** | `components/CaptureWidget/CaptureWidget.tsx` |

The button is rendered in `WidgetFooter` (lines 38–46) with:

- `onClick={effectivelyDisabled ? undefined : onOpenPreviousSession}`
- `disabled={effectivelyDisabled}`
- `aria-label="Previous Sessions"`

`onOpenPreviousSession` is passed from `CaptureWidget` only when all of:

- `extensionMode`
- `showPreviousButton` (derived from `hasPreviousSessions`)
- `fetchSessions`
- `onPreviousSessionSelect`

are truthy. In that case it is set to `handlePreviousSessions`.

---

## 2. Click handler

| Item | Detail |
|------|--------|
| **Handler name** | `handlePreviousSessions` |
| **Defined in** | `components/CaptureWidget/CaptureWidget.tsx` (lines 186–193) |
| **Sync/async** | Synchronous (no `async`; no `await`) |

Implementation:

```ts
const handlePreviousSessions = React.useCallback(() => {
  if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
    chrome.runtime.sendMessage({ type: "ECHLY_OPEN_PREVIOUS_SESSIONS" });
  } else {
    setResumeModalOpen(true);
  }
}, []);
```

- **Extension:** Only sends a message to the background script. It does **not** open the modal or update any local state.
- **Non-extension (dashboard):** Opens the resume modal directly via `setResumeModalOpen(true)`.

So in extension mode the entire “open modal” path depends on the message round-trip and content-script handling.

---

## 3. Full execution path (extension mode)

### 3.1 Step-by-step flow

1. **User click**  
   User clicks "Previous Sessions" in `WidgetFooter` (inside the extension sidebar).

2. **Handler**  
   `handlePreviousSessions()` runs in the content script (same tab as the widget). It calls:
   - `chrome.runtime.sendMessage({ type: "ECHLY_OPEN_PREVIOUS_SESSIONS" })`
   - No `await`, no callback; the sender does not wait for a response.

3. **Background**  
   `echly-extension/src/background.ts` (lines 577–585):
   - Receives `ECHLY_OPEN_PREVIOUS_SESSIONS`.
   - Calls `chrome.tabs.query({ active: true, currentWindow: true }, callback)`.
   - In the callback: `chrome.tabs.sendMessage(tabs[0].id, { type: "ECHLY_OPEN_PREVIOUS_SESSIONS" }).catch(() => {})`.
   - Calls `sendResponse({ ok: true })` and returns `false` (does **not** wait for the tab’s `sendMessage` to complete).

4. **Content script — two listeners**  
   The same message is handled in two places in `echly-extension/src/content.tsx`:

   **Listener A (top-level, lines 25–32)**  
   - Runs when any message is received.
   - If `msg.type === "ECHLY_OPEN_PREVIOUS_SESSIONS"` and `echlyEventDispatcher` is set, calls:
     - `echlyEventDispatcher("ECHLY_OPEN_PREVIOUS_SESSIONS")`.
   - `echlyEventDispatcher` is set only inside `ContentApp` in a `useEffect` (lines 211–221), and points to a function that calls `setOpenResumeModalFromMessage(true)`.
   - If `echlyEventDispatcher` is still `null` (e.g. effect not run yet), this path does nothing.

   **Listener B (`ensureMessageListener`, lines 1676–1688)**  
   - Sends `chrome.runtime.sendMessage({ type: "ECHLY_GET_AUTH_STATE" }, callback)`.
   - In the callback: if not authenticated, sends `ECHLY_TRIGGER_LOGIN` and **returns without opening the modal**.
   - If authenticated, runs:
     - `window.dispatchEvent(new CustomEvent("ECHLY_OPEN_PREVIOUS_SESSIONS"))`.

5. **Opening the modal in React**  
   - `ContentApp` has `window.addEventListener("ECHLY_OPEN_PREVIOUS_SESSIONS", handler)` in a `useEffect` (lines 342–346); the handler calls `setOpenResumeModalFromMessage(true)`.
   - `CaptureWidget` receives `openResumeModal={openResumeModalFromMessage}` and shows `ResumeSessionModal` when that is true.

6. **Modal and session list**  
   - When the modal opens, it uses `checkAuth` (if present) then `fetchSessions()`.
   - `fetchSessions` in content (lines 867–874) calls `apiFetch("/api/sessions")` and returns the sessions array (no client-side sort; API order is used).
   - User selects a session → `onPreviousSessionSelect(sessionId)` → content sends `ECHLY_SET_ACTIVE_SESSION` and `ECHLY_SESSION_MODE_START`, optionally opens session URL in a new tab.

### 3.2 Summary table

| Step | Location | Action |
|------|----------|--------|
| Click | `WidgetFooter` | `onOpenPreviousSession()` → `handlePreviousSessions()` |
| Handler | `CaptureWidget.tsx` | `chrome.runtime.sendMessage({ type: "ECHLY_OPEN_PREVIOUS_SESSIONS" })` |
| Background | `background.ts` | Forwards to active tab via `chrome.tabs.sendMessage(tabs[0].id, …)` |
| Content listener A | `content.tsx` (top-level) | `echlyEventDispatcher("ECHLY_OPEN_PREVIOUS_SESSIONS")` if set |
| Content listener B | `content.tsx` (`ensureMessageListener`) | Auth check → then `window.dispatchEvent(ECHLY_OPEN_PREVIOUS_SESSIONS)` |
| React | `ContentApp` | `window` listener sets `openResumeModalFromMessage(true)` |
| Modal | `ResumeSessionModal` | `checkAuth` → `fetchSessions()` → user picks session |
| Session select | Content | `ECHLY_SET_ACTIVE_SESSION` + `ECHLY_SESSION_MODE_START`; optional open tab |

- **API used to get previous sessions list:** `GET /api/sessions` (no `limit` in modal fetch; `hasPreviousSessions` uses `GET /api/sessions?limit=1`).
- **Navigation method:** No `router.push` or `window.location` for opening the list; modal is in-page. After selection, session URL may be opened via `ECHLY_OPEN_TAB` (new tab).

---

## 4. Race conditions and missing awaits

### 4.1 Round-trip and listener timing

- The **click handler does not open the modal directly** in extension mode. It only sends a message. The modal is opened only when the content script receives the message and either:
  - calls `echlyEventDispatcher("ECHLY_OPEN_PREVIOUS_SESSIONS")`, or
  - dispatches `ECHLY_OPEN_PREVIOUS_SESSIONS` after the auth check.

- **`echlyEventDispatcher` is set in a `useEffect`** in `ContentApp` (lines 211–221). That effect runs **after** the first commit. So:
  - If the message from the background arrives **before** this effect has run, Listener A does nothing (`echlyEventDispatcher` is still `null`).
  - The only way to open the modal on that first message is then Listener B: auth check → dispatch DOM event. The DOM event is handled by another `useEffect` (lines 342–346) that adds `window.addEventListener("ECHLY_OPEN_PREVIOUS_SESSIONS", ...)`. That effect also runs after the first commit.
  - So if the message is processed in the same “early” window where the dispatcher is null, **both** the dispatcher path and the DOM listener might not be ready yet: the event could be dispatched **before** the React DOM listener is attached, so the first click would not open the modal.

- **Listener B adds an async step:** it sends `ECHLY_GET_AUTH_STATE` and only dispatches the event in the callback. So:
  - There is always a delay (auth round-trip) before the event is fired.
  - If the auth callback runs very quickly (e.g. cached response), it is more likely to run before React’s effects have run, so the event can be lost for the first click.

### 4.2 Other async / ordering notes

- **Background does not wait for the tab:** It calls `sendResponse({ ok: true })` and returns without awaiting `chrome.tabs.sendMessage(...)`. The content script might not have run yet when the background thinks it’s done (e.g. injection or listener not ready). This does not by itself explain “multiple clicks,” but it means the first response does not guarantee the modal opened.
- **No awaiting in the click handler:** The widget does not wait for the message to be handled or for the modal to open; it just fires the message. So there is no “loading until modal is open” on the button side.
- **Multiple rapid clicks:** Each click sends another `ECHLY_OPEN_PREVIOUS_SESSIONS`. There is no debounce or loading lock, so multiple requests and multiple auth checks can run.

### 4.3 Summary of races

| Issue | Description |
|------|-------------|
| Dispatcher/listener not ready | Message can arrive before `echlyEventDispatcher` or the DOM listener is set (both set in `useEffect` after first commit). First click can be ignored. |
| Auth-before-effects | Listener B dispatches the event only after `ECHLY_GET_AUTH_STATE` callback. If that callback runs before React’s effects attach the DOM listener, the event is lost. |
| No direct open from widget | Click never sets modal state directly; everything goes through message → background → content → dispatcher or DOM event. |
| Duplicate clicks | No loading or disabled state on the button; multiple clicks send multiple messages and can trigger multiple auth checks. |

---

## 5. Loading and disabled state

- **Loading state:** The "Previous Sessions" button has **no** loading state (no spinner, no “Opening…”).
- **Disabled while opening:** The button is only disabled when `effectivelyDisabled` is true (`!isIdle \|\| captureDisabled`). It is **not** disabled while the message is in flight or while the modal is about to open.
- So the user gets no feedback that the first click was processed, and can click again.

---

## 6. Duplicate clicks

- Each click calls `handlePreviousSessions()` and sends a new `ECHLY_OPEN_PREVIOUS_SESSIONS` message.
- There is **no** lock, debounce, or “loading” guard. Multiple rapid clicks trigger multiple messages and multiple auth checks.
- The button should be locked (or at least visually loading) from the first click until the modal is open (or an error path) to avoid duplicate requests and confusion.

---

## 7. Session lookup (previous sessions list and “latest”)

### 7.1 How “previous sessions” are determined

- **Button visibility:** `hasPreviousSessions` is set in content when the widget is visible, by calling `GET /api/sessions?limit=1` (lines 304–321). If the response has at least one session, the "Previous Sessions" button is shown.
- **Modal list:** When the modal opens, it calls `fetchSessions()`, which in content (lines 867–874) calls `apiFetch("/api/sessions")` (no limit in the URL). The API returns up to 100 sessions (see below).
- **API:** `GET /api/sessions` in `app/api/sessions/route.ts` uses `getWorkspaceSessionsRepo(workspaceId, 100)` (or `getUserSessionsRepo(user.uid, 100)` as fallback). So the same backend list is used for “has any session” and for the full list.

### 7.2 Backend session order and filtering

- **Repository:** `lib/repositories/sessionsRepository.ts`:
  - `getWorkspaceSessionsRepo` / `getUserSessionsRepo` use `orderBy("updatedAt", "desc")` and `limit(max)`.
- **Archived:** By default, archived sessions are **excluded** (only active sessions). So “previous sessions” here means “recent active sessions,” sorted by `updatedAt` descending.
- **“Latest” session:** The first item in the API response is the most recently updated active session. The UI does **not** automatically open that session on one click; the user must open the modal and select a session. So “open the user’s latest active session immediately on the first click” would require a new behavior (e.g. a separate “Open latest” action or changing this button to “Open latest” and optionally still offering the list).

---

## 8. Error handling

- **No session / empty list:** If `GET /api/sessions` returns an empty list, the modal shows an empty list; it does not show a specific “no previous sessions” error. The button is hidden when `hasPreviousSessions` is false (so the user doesn’t see it when there are no sessions).
- **API failure:** `fetchSessions` returns `[]` on non-ok or `!json.success`; the modal can show an empty list. `ResumeSessionModal` has an `error` state and sets it when `fetchSessions()` rejects (e.g. “Failed to load sessions”).
- **Not authenticated (extension):** Listener B calls `ECHLY_TRIGGER_LOGIN` and **does not** dispatch the open event, so the modal never opens. The user sees no explicit “Sign in to open previous sessions” in the widget; they may think the button did nothing.
- **Message / network:** If `chrome.tabs.sendMessage` from the background fails (e.g. tab closed, content script not ready), the failure is swallowed (`.catch(() => {})`). The user gets no feedback.
- **Click handler:** `handlePreviousSessions` does not catch or report any errors and does not fall back to opening the modal locally in the extension case.

So: failures in the message path or auth path often result in **silent** no-op (button seems to do nothing until a later click works).

---

## 9. Why the button may require multiple clicks

1. **Message arrives before React is ready**  
   The content script has two ways to open the modal: `echlyEventDispatcher` and the DOM event. Both are wired in `useEffect` after the first render. If the background’s `sendMessage` is handled before those effects run, the first message does nothing (dispatcher null, or event dispatched before listener attached). A second click later will usually work because by then effects have run.

2. **Auth delay and ordering**  
   Listener B only dispatches the event after the async `ECHLY_GET_AUTH_STATE` callback. If that callback runs very quickly, it can fire the DOM event before the React listener is attached, so the first click is lost. Again, a later click tends to work.

3. **No feedback on first click**  
   There is no loading or disabled state, so the user cannot tell that the first click was “in progress.” They naturally click again, and the second time the app is usually ready.

4. **Reliance on round-trip**  
   Because the widget never opens the modal directly in extension mode, every open depends on the message being received and processed at the right time. Any timing or listener-order issue shows up as “first click does nothing.”

---

## 10. Recommended fixes (summary)

1. **Open modal directly when the click is in the same context**  
   When the user clicks "Previous Sessions" inside the widget (content script), call a parent-provided callback (e.g. `onOpenPreviousSessionRequested`) that sets `openResumeModalFromMessage(true)` (or equivalent) **immediately**, in addition to sending `ECHLY_OPEN_PREVIOUS_SESSIONS` for popup/other entry points. That way the first click always opens the modal in the current tab, regardless of message and effect timing.

2. **Keep message path for popup / other triggers**  
   Keep the background → content message flow for when "Previous Sessions" is triggered from the popup or elsewhere, but treat it as a secondary path; the content script should still open the modal when it receives the message (for those cases).

3. **Ensure DOM listener is ready or queue the intent**  
   If keeping the message-only approach, either:
   - Register the “open modal” handler in a way that is ready before or as soon as the first message can arrive (e.g. set a global or ref during initial render, or register from a non-React listener that calls into React when ready), or
   - When the message is received and the React app is not ready yet, set a flag or queue an “open modal” intent and apply it when ContentApp mounts/effects run.

4. **Add loading / lock on the button**  
   From the first click until the modal is open (or an error is shown), set a “loading” or “opening” state and disable the button (or ignore further clicks). That prevents duplicate messages and gives clear feedback.

5. **Optional: one-click “open latest”**  
   If the product goal is “open latest session on first click,” add a dedicated path (e.g. call `GET /api/sessions?limit=1`, take the first session, then call `onPreviousSessionSelect(firstSession.id)` and optionally open its URL) so one click opens the latest session without showing the list. The current implementation always shows the list first.

6. **Error handling**  
   - If the message is sent from the widget, consider a short timeout: if the modal has not opened after N ms, open it via the direct callback or show a “Please try again” state.
   - When auth fails in Listener B, consider sending a message back to the widget to show an “Sign in to view previous sessions” state instead of failing silently.

---

## References (file:line)

- Button: `components/CaptureWidget/WidgetFooter.tsx` (38–46)
- Handler and wiring: `components/CaptureWidget/CaptureWidget.tsx` (186–193, 417–421, 479–483)
- Content listeners: `echly-extension/src/content.tsx` (25–32, 211–221, 342–346, 1676–1688)
- Background: `echly-extension/src/background.ts` (577–585)
- Session fetch (content): `echly-extension/src/content.tsx` (304–321, 867–874)
- Sessions API: `app/api/sessions/route.ts` (GET), `lib/repositories/sessionsRepository.ts` (getWorkspaceSessionsRepo, getUserSessionsRepo)
- Modal: `components/CaptureWidget/ResumeSessionModal.tsx` (open, fetchSessions, checkAuth, error state)
