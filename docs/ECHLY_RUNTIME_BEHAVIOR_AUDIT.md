# Echly Chrome Extension — Runtime Behavior Audit

**Purpose:** Identify exact behavior that could trigger a browser device permission dialog when the extension loads.  
**Scope:** Extension code only (echly-extension, content script entry points, CaptureWidget in extension mode).  
**Date:** 2025-03-16.

---

## Step 1 — Page-context script injection

Searched the repo for patterns that execute code in the **page context** (as opposed to the extension isolated world):

- `document.createElement("script")`
- `appendChild(script)`
- `script.src =`
- `innerHTML` containing `<script>`

### Findings

| Pattern | Location | Result |
|--------|----------|--------|
| `document.createElement("script")` | Entire repo (TS/TSX/JS/JSX/MJS) | **No matches** in extension or app source. Only mentioned in `docs/ECHLY_EXTENSION_EXTERNAL_SCRIPTS_AUDIT_REPORT.md` as a pattern to avoid. |
| `appendChild(script)` | — | **No matches** in extension/app code. |
| `script.src =` | — | **No matches**. |
| `innerHTML` + `<script>` | — | **No matches** in extension/app code. |

**Conclusion:** The extension does **not** inject `<script>` elements or run script in the page context. All `appendChild` usages in the extension are:

- **echly-extension/src/content.tsx**
  - **1481, 1486:** `shadowRoot.appendChild(link)` and `shadowRoot.appendChild(reset)` — `<link>` and `<style>` in **shadow DOM** (extension context).
  - **1497:** `document.head.appendChild(scrollRestore)` — a single `<style id="echly-page-scroll-restore">` with `html, body { overflow: auto !important; }` (no script).
  - **1517:** `shadowRoot.appendChild(container)` — React root div in shadow DOM.
  - **1680:** `document.documentElement.appendChild(host)` — host div for the widget (see Step 2).

**No page-context script injection exists.** This is not a cause of device permission dialogs.

---

## Step 2 — DOM mounting (content script host)

**File:** `echly-extension/src/content.tsx`

### Where the host is created and appended

- **Creation:** `main()` (lines 1665–1682). Host is `document.createElement("div")` with `id="echly-shadow-host"` and fixed positioning (bottom/right, z-index 2147483647).
- **Append target:** **`document.documentElement`** (i.e. `<html>`), not `document.body`.
  - **Line 1680:** `document.documentElement.appendChild(host);`

### Snippet

```ts
// main(): lines 1665–1682
host = document.createElement("div");
host.id = SHADOW_HOST_ID;
host.setAttribute("data-echly-ui", "true");
host.style.position = "fixed";
host.style.bottom = "24px";
host.style.right = "24px";
// ... zIndex, display, pointerEvents, visibility ...
document.documentElement.appendChild(host);
mountReactApp(host);
```

### Focus and tabIndex

- The **host element** is never given `tabIndex` and is never focused with `.focus()`.
- Initial styles set **`display: none`**, **`pointerEvents: none`**, **`visibility: hidden`**, so the host is non-interactive and hidden at mount.

**Conclusion:**

- Host is appended to **`document.documentElement`**.
- Host does **not** receive focus and has no `tabIndex`.
- Appending to `documentElement` can, on some pages, affect stacking/order and (in theory) how the page’s own scripts interpret “top-level” nodes; it does not by itself request device permissions.

---

## Step 3 — Automatic focus changes

Searched for: `.focus(`, `tabIndex` / `tabindex`, `autoFocus` / `auto-focus` in TS/TSX/JS/JSX.

### In the extension content script (echly-extension/src/content.tsx)

| Location | Code | When it runs |
|----------|------|-------------------------------|
| **1203–1206** | `clarityTextareaRef.current.focus()` inside `useEffect` when `isEditingFeedback` is true | Only when the user has opened the **Clarity Assistant** and clicked **“Edit feedback”**. Not on widget open or page load. |

No other `.focus()` in the extension. No `autoFocus` in content.tsx.

### In shared CaptureWidget (used by extension)

- **CaptureWidget.tsx (416, 430):** `tabIndex={0}` on voice/text mode tiles (inside shadow DOM). These are focusable only when the widget is expanded and visible; no automatic focus on mount.
- **CaptureHeader.tsx (73, 115):** `inputRef.current.focus()` and `tabIndex={0}` — used in app context; extension uses the same component but focus is tied to user interaction (e.g. editing title), not to initial load.

**Conclusion:** There is **no** automatic focus on the host or on a top-level page element during widget **initialization**. The only programmatic `.focus()` in the extension runs when the user explicitly enters “Edit feedback” in the Clarity Assistant. Focus changes are **not** a likely cause of permission dialogs at extension load.

---

## Step 4 — Message listeners that never respond

Searched for `chrome.runtime.onMessage.addListener` and whether listeners **return true** but **never call `sendResponse()`** (which can produce: *“A listener indicated an asynchronous response but the message channel closed.”*).

### Content script — `echly-extension/src/content.tsx` (ensureMessageListener, ~1584)

- **Signature:** `addListener((msg) => { ... })` — only one parameter. The listener **does not** receive or use `sendResponse`.
- **Behavior:** Handles one-way messages from background (e.g. `ECHLY_GLOBAL_STATE`, `ECHLY_OPEN_WIDGET`, `ECHLY_START_SESSION`). It never returns `true` and never calls `sendResponse`.
- **Background usage:** All `chrome.tabs.sendMessage(tabId, msg)` calls from background use `.catch()` only; **no** response callback is passed. So no caller expects a response from this content listener.

**Conclusion:** Content script listener **does not** cause “async response but channel closed” — it is intentionally one-way and no sender waits for a response.

### Background — `echly-extension/src/background.ts` (~314)

- Listener signature: `(request, sender, sendResponse)`.
- For **async** handlers the pattern is: call an async IIFE, **return true** to keep the channel open, and call **`sendResponse(...)`** in all code paths (success and error) inside the async block.
- Checked handlers that **return true**: e.g. `ECHLY_GET_GLOBAL_STATE`, `ECHLY_SET_ACTIVE_SESSION`, `ECHLY_GET_TOKEN`, `ECHLY_GET_EXTENSION_TOKEN`, `ECHLY_GET_AUTH_STATE`, `ECHLY_OPEN_WIDGET` (sync sendResponse then return false), `CAPTURE_TAB`, `ECHLY_UPLOAD_SCREENSHOT`, `ECHLY_PROCESS_FEEDBACK`, `echly-api`. Each path that returns `true` eventually calls `sendResponse(...)` (including in `catch`/`finally` where applicable).

**Conclusion:** No listener in the extension **returns true** and then fails to call `sendResponse()`. No corrective change is required for this error in the current code.

---

## Step 5 — Execution world

**Goal:** Confirm the content script does **not** inject or run code in the **page context** (MAIN world).

- **Manifest:** `echly-extension/manifest.json` does **not** declare `content_scripts`. The content script is **not** loaded on every page load.
- **Injection:** Content is injected only via **`chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] })`** in:
  - **background.ts ~18:** when the user clicks the extension **action** (icon).
  - **background.ts ~344:** when handling **ECHLY_OPEN_WIDGET** (after injecting, it calls `openWidgetInActiveTab()`).
- **Execution world:** `executeScript` with `files: ["content.js"]` uses the **default** execution world, which is the **isolated** extension world (not MAIN). The manifest does not use `world: "MAIN"` anywhere.

**Conclusion:** All content script logic runs in the Chrome extension **isolated** world. There are **no** escapes to the page context (no MAIN world, no script injection into the page).

---

## Step 6 — Widget activation state on page load

**File:** `echly-extension/src/content.tsx`

### Initial React state (ContentApp)

- **134–145:** `globalState` is initialized with **`visible: false`**, `expanded: false`, and the rest (sessionId, recording, etc.) false/null/empty.

### Initial host styles (main())

- **1677–1679:** Host is created with:
  - `host.style.display = "none"`
  - `host.style.pointerEvents = "none"`
  - `host.style.visibility = "hidden"`

### When does the tray become visible?

- Tray visibility is driven by **background** (`ECHLY_VISIBILITY` / global state) and only after **ECHLY_OPEN_WIDGET** (user clicks icon or opens widget from popup). Until then, `trayEverOpenedInThisTab` is false and `setHostVisibilityFromState` does not show the host.

**Conclusion:** The widget **mounts passive**: **visible: false** and host **hidden** (display none, visibility hidden, pointer-events none) on load. No UI is shown and no interaction is required from the page until the user opens the widget.

---

## Step 7 — Device permission (getUserMedia) usage

Searched for `getUserMedia`, `getDisplayMedia`, `mediaDevices`, and related permission triggers.

- **components/CaptureWidget/hooks/useCaptureWidget.ts ~643:**  
  `navigator.mediaDevices.getUserMedia({ audio: audioConstraints })` is called **only when starting voice capture** (after the user has already triggered recording in the widget). It is **not** called on content script load or on first paint.
- **lib/capture.ts:** Comment states the web app does **not** use `getDisplayMedia` for screenshot capture; extension uses `chrome.tabs.captureVisibleTab` in the background.

**Conclusion:** **No** microphone (or camera) permission is requested at extension load or at widget mount. Permission is requested only on **user gesture** when starting voice input.

---

## Summary: What could cause site permission dialogs?

From this audit:

1. **No page-context script injection** — No `<script>` injection or MAIN world execution; no extension code runs in the page context.
2. **Host on `document.documentElement`** — The only DOM change in the page is appending a **hidden**, non-focusable div to `<html>`. This is unlikely to trigger device permissions by itself but could theoretically interact with a page’s own logic (e.g. focus or “new top-level node” handlers).
3. **No automatic focus** — No `.focus()` or `autoFocus` on initial load; the only `.focus()` is in the Clarity Assistant after “Edit feedback.”
4. **Message listeners** — All listeners that need to respond do call `sendResponse()`; content listener is one-way by design. No “async response but channel closed” pattern found.
5. **Isolated world only** — Content runs only in the extension isolated world.
6. **Passive mount** — Widget starts with **visible: false** and host hidden; no UI or interaction on load.
7. **No getUserMedia on load** — Microphone is requested only when the user starts voice capture.

**Most plausible (indirect) explanations** if a user sees a permission dialog “when the extension loads”:

- **Timing:** The dialog appears when they **first open the widget** (icon click), which injects the content script and mounts the host. The dialog could be from the **site** (e.g. site requesting mic/camera on focus or “user activity”), not from the extension.
- **Host on documentElement:** A page that reacts to new nodes or to focus/blur on `document.documentElement` might interpret the append as a signal to run its own permission flow. The extension does not request device permission at that moment.

---

## Recommended fixes (non-code; for implementation later)

1. **Host attachment:** Consider appending the host to **`document.body`** instead of **`document.documentElement`** when `document.body` exists, to reduce the chance of affecting document-level or focus-sensitive page logic. Fall back to `document.documentElement` only if body is not yet available.
2. **Observability:** If reports continue, add optional logging (e.g. when host is appended and when visibility changes) to correlate dialog appearance with host mount vs. first user interaction.
3. **Documentation:** In user-facing or internal docs, clarify that “extension load” in this context means “first time the widget is opened in a tab” (content script inject + mount), and that device permission dialogs at that moment may be triggered by the **host page**, not by the extension’s own permission requests.

---

**Report generated from repository search and static analysis. No code was modified.**
