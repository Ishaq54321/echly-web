# Echly Extension — Device Permission Root Cause Report

**Goal:** Identify the exact code path causing Chrome to show the popup:  
**"&lt;site&gt; wants to access other apps and services on this device"**  
when the Echly extension is enabled and visiting normal websites.

**Audit date:** 2025-03-16  
**No code was modified; this is a diagnostic-only report.**

---

## 1. Extension permissions

**Source:** `echly-extension/manifest.json`

### PERMISSION AUDIT

| Permission / field        | Where defined       | What it enables | Could trigger device dialogs? |
|--------------------------|---------------------|------------------|-------------------------------|
| `storage`                | `permissions`       | chrome.storage API | No                            |
| `activeTab`              | `permissions`       | Temporary host access on user gesture | No (no warning) |
| `tabs`                   | `permissions`       | Privileged tab fields (url, title, etc.) | No (warning: "Read your browsing history") |
| `scripting`              | `permissions`       | chrome.scripting API | No                            |
| `<all_urls>`             | `host_permissions`  | **Access to all websites** (fetch, cookies, inject, tab URL/title, etc.) | **Yes — see Section 9** |
| `http://localhost:3000/*`| `host_permissions`  | Access to local dashboard | No (narrow scope)             |

**Not present in manifest (audited):**  
`optional_permissions`, `oauth2`, `identity`, `nativeMessaging`, `serial`, `usb`, `hid`, `bluetooth`, `clipboardRead`, `clipboardWrite`, `webRequest`, `debugger`, `fileSystem`, `gcm`, `externally_connectable`.

**Conclusion:** The only permission that can trigger the **“wants to access other apps and services on this device”**-style dialog for normal browsing is **`host_permissions`** with **`<all_urls>`**. Chrome treats broad host access as high-impact and shows this warning on install/update. No device APIs (USB, HID, serial, etc.) are declared.

---

## 2. Execution world

**Searched for:**  
`chrome.scripting.executeScript`, `world: "MAIN"`, `chrome.tabs.executeScript`, `injectedScript`, “page script injection”.

**Findings:**

- The extension **does not** use `chrome.scripting.executeScript` or `chrome.tabs.executeScript` for content injection.
- Content script is declared **statically** in the manifest:
  - `echly-extension/manifest.json`: `content_scripts` → `js: ["content.js"]`, `run_at: "document_idle"`.
- There is **no** `world: "MAIN"` anywhere; the default (isolated) world is used.

**Execution world summary:**

| Context              | World        | File / location |
|----------------------|-------------|------------------|
| Content script       | **ISOLATED** | `content.js` (from `content.tsx`), injected per manifest on `<all_urls>` |
| Page scripts         | MAIN (page) | Extension does not inject scripts into the page world |

**No code runs in the MAIN page world.** All extension logic runs in the isolated extension world (content script + background). No `world: "MAIN"` or programmatic page-script injection was found.

---

## 3. Page-context bridge

**Searched for:**  
`window.postMessage`, `window.addEventListener("message")`, `CustomEvent`, `dispatchEvent`, `document.createElement("script")`.

### 3.1 CustomEvent / dispatchEvent (extension → page)

**File:** `echly-extension/src/content.tsx`

Content script dispatches **CustomEvents on `window`** so the **same** content script’s React tree (which listens on `window`) can react. The **page** can also listen to these events (same `window`).

| Line(s)   | Code / purpose |
|-----------|-----------------|
| 1542–1543 | `window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE", { detail: { state } }))` |
| 1588     | `window.dispatchEvent(new CustomEvent("ECHLY_FEEDBACK_CREATED", ...))` |
| 1594     | `window.dispatchEvent(new CustomEvent("ECHLY_OPEN_WIDGET"))` |
| 1603     | `window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE", ...))` |
| 1607     | `window.dispatchEvent(new CustomEvent("ECHLY_TOGGLE_WIDGET"))` |
| 1611     | `window.dispatchEvent(new CustomEvent("ECHLY_RESET_WIDGET"))` |
| 1615     | `window.dispatchEvent(new CustomEvent("ECHLY_START_SESSION_REQUEST"))` |
| 1619     | `window.dispatchEvent(new CustomEvent("ECHLY_OPEN_PREVIOUS_SESSIONS"))` |
| 1629     | `window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE", ...))` |
| 1704–1705| `window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE", ...))` |

**Purpose:** Internal extension UI state and commands (open widget, toggle, session, etc.). Events carry only UI state and command names, no device APIs or tokens.

**Could this let the page access device APIs?**  
**No.** The page can only observe these events. It does **not** receive any API handles, no `chrome.*`, no `navigator.usb/hid/serial`, no `getUserMedia`. Device access is only used inside the extension (see Section 4).

### 3.2 window.postMessage / addEventListener("message")

- **Extension:** No `window.postMessage` or `window.addEventListener("message")` in `echly-extension/` (no message bridge from page into extension).
- Docs reference a **dashboard**-side `window.postMessage` for login success; that is app code, not the extension content script.

### 3.3 document.createElement("script")

- **Not used** in the extension to inject scripts into the page. Only mentioned in docs as a pattern to avoid.

**Conclusion:** The only “bridge” to the page is **CustomEvents on `window`** (extension → page). They do **not** expose device APIs or any capability that would trigger the “access other apps and services” dialog.

---

## 4. Device APIs

**Searched for:**  
`navigator.usb`, `navigator.hid`, `navigator.bluetooth`, `navigator.serial`, `navigator.credentials`, `navigator.mediaDevices`, `getUserMedia`, `getDisplayMedia`, `requestDevice`, `requestPort`, `navigator.permissions`.

### 4.1 Inside the extension (content script / widget in shadow DOM)

| File | Line | Code snippet | Execution context | Extension vs page |
|------|------|--------------|-------------------|-------------------|
| `components/CaptureWidget/CaptureWidget.tsx` | 191   | `navigator.mediaDevices.enumerateDevices()` | Content script (React in shadow DOM), in `useEffect` when `extensionMode` is true | **Extension** |
| `components/CaptureWidget/hooks/useCaptureWidget.ts` | 643   | `navigator.mediaDevices.getUserMedia({ audio: audioConstraints })` | Content script, inside `startListening()` (user-initiated) | **Extension** |

- **enumerateDevices():** Runs when the widget is mounted in extension mode; used to populate the microphone list. Does **not** trigger a permission dialog.
- **getUserMedia():** Only run when the user starts voice capture (e.g. “Start voice”). Triggers the **microphone** permission prompt, not the “access other apps and services” prompt.

### 4.2 Not used anywhere in repo

- `navigator.usb`, `navigator.hid`, `navigator.bluetooth`, `navigator.serial`, `navigator.credentials`, `navigator.permissions`, `requestDevice`, `requestPort`, `getDisplayMedia` (only a comment in `lib/capture.ts` that the app does not use it).

**Conclusion:** The only device-related APIs used are `navigator.mediaDevices.enumerateDevices` and `getUserMedia`. Both run in the **extension** (content script) context; neither is the source of the “access other apps and services” dialog, which is tied to **host/permission** scope, not to a single getUserMedia prompt.

---

## 5. DOM injection (outside shadow DOM)

**Searched for:**  
`document.body.appendChild`, `document.documentElement.appendChild`, `insertAdjacentHTML`, `.innerHTML =`.

### 5.1 In the extension

| File | Line | Code | Purpose |
|------|------|------|---------|
| `echly-extension/src/content.tsx` | 1692 | `document.body.appendChild(host!)` | Append the **single** host div (`#echly-shadow-host`) to `document.body`. All UI lives **inside** this host’s shadow root. |
| `echly-extension/src/content.tsx` | 1493 | `document.head.appendChild(scrollRestore)` | Inject a single `<style id="echly-page-scroll-restore">` (overflow restore) into `document.head`. |

### 5.2 In app (not extension)

- `components/CaptureWidget/hooks/useCaptureWidget.ts` (436): `document.body.appendChild(layer)` — marker layer; used in extension mode from content script, so still extension context.
- `components/ImageViewer.tsx` (40): `document.body.appendChild(a)` — app-only.

**Could the page attach listeners to injected elements?**  
- The host div is a plain `div` with an id; the page could add listeners to it, but the host has no device APIs or sensitive data. All UI and logic are inside the **shadow root**.
- The scroll-restore style is a `<style>` node; no script or interactive content.  
So: **No.** These injections do not expose device APIs or cause the “access other apps and services” dialog.

---

## 6. Shadow DOM isolation

**Location:** `echly-extension/src/content.tsx`

| Item | File | Line(s) | Details |
|------|------|---------|---------|
| Host element id | `content.tsx` | 24 | `SHADOW_HOST_ID = "echly-shadow-host"` |
| Host creation | `content.tsx` | 1675–1692 | `document.createElement("div")`, `id = SHADOW_HOST_ID`, then `document.body.appendChild(host!)` |
| Shadow root | `content.tsx` | 1500–1501 | `host.attachShadow({ mode: "open" })`, then `injectShadowStyles(shadowRoot)` |
| Styles | `content.tsx` | 1471–1482 | Styles and `popup.css` link appended to **shadow root** only |
| React mount | `content.tsx` | 1502–1516 | Container div created and appended to **shadow root**; `createRoot(container)` and `reactRoot.render(<ContentApp ... />)` |

**Verification:**  
- All widget UI (including CaptureWidget and any `navigator.mediaDevices` usage) runs inside the shadow root.  
- No device APIs are invoked on the **page** DOM; they are only used from React/components running in the content script, which is attached to the shadow root.  
- The only page-level DOM changes are: one host div on `document.body` and one `<style>` in `document.head` (scroll restore).

---

## 7. Browser feature policies

**Searched for:**  
`allow=`, `permissions-policy`, `feature-policy`.

**Result:** No occurrences in the repository. The extension does not set Permissions-Policy or Feature-Policy, and does not inject iframes with `allow=` that would enable device APIs in subframes.

---

## 8. Network requests (content script → localhost / chrome-extension / custom protocols)

**Searched for:**  
API calls from content script to localhost, 127.0.0.1, chrome-extension, custom protocols.

**Findings:**

| Location | Usage | Triggers “access other apps”? |
|----------|--------|--------------------------------|
| `echly-extension/config.ts` | `WEB_APP_URL = "http://localhost:3000"`, `API_BASE = "http://localhost:3000"` | No (config only) |
| `echly-extension/manifest.json` | `host_permissions`: `"http://localhost:3000/*"` | No (narrow, explicit) |
| `echly-extension/sessionRelay.js` (built from `sessionRelay.ts`) | `fetch(\`${API_BASE}/api/extension/session\`, ...)` then `chrome.runtime.sendMessage(...)` | No (session relay runs in dashboard context when loaded from dashboard; not from content script on arbitrary sites) |
| Content script API calls | All API calls go through **background** via `chrome.runtime.sendMessage`; background uses `apiFetch()` to `API_BASE` (localhost). Content script does not fetch localhost directly on normal sites. | No |

**Conclusion:** The “access other apps and services” dialog is **not** caused by content script network access to localhost or chrome-extension. It is caused by the **broad host permission** (Section 9).

---

## 9. Message bridges (chrome.runtime.onMessage / sendMessage)

**Searched for:**  
`chrome.runtime.onMessage`, `chrome.runtime.sendMessage`, and whether any messages **originate from page scripts**.

**Findings:**

- **Content script** (`content.tsx`):  
  - Listens: `chrome.runtime.onMessage.addListener` (e.g. 1580).  
  - Sends: many `chrome.runtime.sendMessage(...)` for UI/session/feedback (e.g. 106, 111, 232, 247, 289, 309, 317, 330, 335, 338, 348, 521, 782, 807, 845, 850, 851, 856, 873, 1007, 1431–1439, 1447, 1549, 1563, 1623, 1696).
- **Background** (`background.ts`):  
  - Listens: `chrome.runtime.onMessage.addListener` (305).  
  - Handles: ECHLY_OPEN_WIDGET, ECHLY_GET_GLOBAL_STATE, ECHLY_UPLOAD_SCREENSHOT, CAPTURE_TAB, ECHLY_PROCESS_FEEDBACK, etc.

**Page → extension:**  
- There is **no** `window.postMessage` in the extension content script and **no** `window.addEventListener("message")` in the extension that would accept messages from the page and then call `chrome.runtime.sendMessage`.  
- So there is **no** message bridge from **page scripts** into the extension. All `sendMessage` calls are from the content script or other extension contexts.

**Conclusion:** Messages are extension-only. The bridge does **not** expose device APIs to the page and does **not** cause the “access other apps and services” dialog.

---

## 10. Runtime injection and initialization

**Content script entry:** Declared in manifest as `content_scripts[0].js` → `content.js` (built from `echly-extension/src/content.tsx`).

**Initialization flow:**

1. **Script load**  
   - Chrome injects `content.js` at `document_idle` on every page matching `<all_urls>` (manifest).

2. **Guard**  
   - Lines 1716–1721: If `window.__ECHLY_WIDGET_LOADED__` is set, log and return; else set it and call `main()`.

3. **main()** (1674–1715)  
   - Resolve or create host: `document.getElementById(SHADOW_HOST_ID)` or create a new `div`, set id and styles.  
   - If new host: `waitForBody(cb)` → when `document.body` exists, run:  
     - `document.body.appendChild(host!)`  
     - `mountReactApp(host!)`  
     - `ensureMessageListener(host!)`  
     - `chrome.runtime.sendMessage({ type: "ECHLY_GET_GLOBAL_STATE" }, ...)`  
   - Else: `ensureMessageListener(host)`, `syncInitialGlobalState(host)`.  
   - Then: `ensureVisibilityStateRefresh()`, `ensureScrollDebugListeners()`.

4. **mountReactApp(host)** (1497–1516)  
   - `injectPageStyles()` (append one `<style>` to `document.head`).  
   - `host.attachShadow({ mode: "open" })`, `injectShadowStyles(shadowRoot)`, create container, append to shadow root, `createRoot(container)`, `reactRoot.render(<ContentApp ... />)`.

5. **ensureMessageListener(host)** (1575–1634)  
   - Registers a single `chrome.runtime.onMessage.addListener`; on ECHLY_* messages updates visibility and dispatches CustomEvents on `window`. No device API calls.

**Device APIs on load:**  
- **None.** No `getUserMedia`, no `enumerateDevices` at top-level.  
- `enumerateDevices()` runs later inside CaptureWidget’s `useEffect` when the widget is mounted and `extensionMode` is true (no permission dialog).  
- `getUserMedia()` runs only when the user starts voice capture (microphone prompt only).

**Conclusion:** No device APIs run automatically at content script load or at first paint. The “access other apps and services” dialog is **not** triggered by runtime initialization or injection logic.

---

## 11. Browser permission triggers (Chrome documentation)

From Chrome’s permission and host-permission behavior:

- **Host permissions** (e.g. in `host_permissions` and `content_scripts.matches`) **trigger a warning** when added or changed. Broad patterns like **`<all_urls>`** are described to users in terms of reading/changing data on (all) websites; in practice this is often shown as a high-impact warning such as **“wants to access other apps and services on this device”** (or similar wording, depending on locale and Chrome version).
- The following are **not** used by the extension and therefore **do not** apply:  
  `nativeMessaging`, `debugger`, `webRequest` (blocking), WebUSB, WebHID, WebSerial, credential manager, or any optional device permission that would show a separate device-specific dialog.

**Match for this extension:**  
- **Yes:** The extension requests **`host_permissions`: `["<all_urls>", "http://localhost:3000/*"]`** and **`content_scripts.matches`: `["<all_urls>"]`**.  
- That broad host access is what triggers the “access other apps and services”–style permission dialog when the extension is installed or updated, and when visiting normal websites (because the content script is allowed to run on all URLs).

---

## 12. Exact root cause and recommended fix

### 12.1 Root cause

**The popup is caused by the extension’s declared host and content script scope, not by any single line of code that runs at runtime.**

- **Manifest:**  
  - `echly-extension/manifest.json`  
  - **Lines 7–9:** `host_permissions`: `["<all_urls>", "http://localhost:3000/*"]`  
  - **Lines 12–16:** `content_scripts[0].matches`: `["<all_urls>"]`, `js`: `["content.js"]`

Chrome shows the “&lt;site&gt; wants to access other apps and services on this device” (or equivalent) warning because:

1. **`<all_urls>` in `host_permissions`** grants the extension access to all websites (fetch, cookies, tab URL/title, etc.), which Chrome surfaces as a high-impact permission.
2. **`content_scripts.matches`: `["<all_urls>"]`** means the content script is injected on every page, so the extension is “active” on every site the user visits, which is consistent with the dialog appearing when “visiting normal websites.”

No other permission or API in the manifest (storage, activeTab, tabs, scripting) or in the code (CustomEvents, message bridge, device APIs, DOM injection, or network usage) has been identified as the trigger for this specific dialog. Device-related code (e.g. `getUserMedia`) only triggers the **microphone** permission prompt when the user starts voice capture.

### 12.2 Summary table

| Item | Location | Role in dialog |
|------|----------|----------------|
| **host_permissions** `"<all_urls>"` | `manifest.json` 7–9 | **Primary cause** of “access other apps and services” warning |
| **content_scripts.matches** `"<all_urls>"` | `manifest.json` 12–16 | Ensures extension runs on all sites (dialog appears “when visiting normal websites”) |
| All other code paths (device APIs, bridges, DOM, network) | Various | Do **not** cause this dialog |

### 12.3 Recommended fix (no code changes in this report)

To reduce or avoid this permission warning while keeping needed behavior:

1. **Narrow host and content script scope**  
   - Replace `"<all_urls>"` with the minimum set of URL patterns required (e.g. only schemes/hosts where the widget must work).  
   - If the widget must work on arbitrary sites, consider **optional_host_permissions** and request `<all_urls>` at runtime with user context (e.g. “Allow on this site” / “Allow on all sites”), so the warning is shown in a clearer context.

2. **Use `activeTab` where possible**  
   - The extension already has `activeTab`. For features that only need the current tab, rely on `activeTab` and avoid requesting broad host permission by default.

3. **Keep device usage as-is**  
   - No change needed for `getUserMedia` / `enumerateDevices` for the purpose of this dialog; they are not the cause and are already user-initiated (voice) or non-prompting (enumerate).

**File to change for the fix:**  
`echly-extension/manifest.json` (lines 7–9 and 12–16: `host_permissions` and `content_scripts[0].matches`).

---

**End of report.**
