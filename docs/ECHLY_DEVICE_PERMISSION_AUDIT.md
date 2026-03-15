# Echly Extension — Device Permission Audit Report

**Scope:** Content script (`echly-extension/src/content.tsx`) and all its dependencies, including CaptureWidget and `useCaptureWidget`, for code that may trigger browser device permission dialogs.

**Audit date:** 2025-03-16  
**No code was modified; this is an audit-only report.**

---

## 1. APIs that can request device access or trigger permission prompts

### 1.1 Search results: targeted APIs

Searched the entire repository for:

- `navigator.mediaDevices`
- `navigator.permissions`
- `navigator.credentials`
- `navigator.usb`
- `navigator.hid`
- `navigator.bluetooth`
- `navigator.serial`
- `getUserMedia`
- `enumerateDevices`
- `requestDevice`
- `requestPort`

**Findings:**

| API / method              | Location(s) | Triggers permission? |
|---------------------------|------------|-----------------------|
| `navigator.mediaDevices`  | Yes        | See below             |
| `getUserMedia`            | Yes        | **Yes (microphone)**  |
| `enumerateDevices`        | Yes        | No (see note)         |
| `navigator.permissions`   | **Not used** | —                  |
| `navigator.credentials`   | **Not used** | —                  |
| `navigator.usb`           | **Not used** | —                  |
| `navigator.hid`          | **Not used** | —                  |
| `navigator.bluetooth`     | **Not used** | —                  |
| `navigator.serial`        | **Not used** | —                  |
| `requestDevice`           | **Not used** | —                  |
| `requestPort`             | **Not used** | —                  |

**Note on `enumerateDevices()`:** In Chrome (and typical behavior elsewhere), `navigator.mediaDevices.enumerateDevices()` does **not** by itself show a permission dialog. It returns device lists; before microphone permission is granted, labels may be empty and device IDs may be anonymized. The **microphone permission prompt** is triggered by `getUserMedia({ audio: true })` (or equivalent), not by `enumerateDevices()`.

---

## 2. Exact locations and code snippets

### 2.1 `navigator.mediaDevices.enumerateDevices()`

**File:** `components/CaptureWidget/CaptureWidget.tsx`  
**Lines:** 188–201

**Snippet:**

```tsx
  useEffect(() => {
    if (!extensionMode) return;
    let cancelled = false;
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        if (cancelled) return;
        const inputs = devices.filter((d) => d.kind === "audioinput");
        setMicrophones(inputs.map((d) => ({ deviceId: d.deviceId, label: d.label || `Microphone ${inputs.indexOf(d) + 1}` })));
        if (inputs.length && !selectedMicrophone) setSelectedMicrophone(inputs[0].deviceId || "");
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [extensionMode]);
```

**Behavior:** Runs when `CaptureWidget` is mounted and `extensionMode === true`. Used to populate the microphone dropdown (device list). Does **not** trigger a permission dialog; may return empty or generic labels until permission is granted.

**Recommendation:** Optional improvement: call `enumerateDevices()` only when the user opens the microphone selector (lazy-load device list) to avoid any unnecessary media API use before the user opts into voice.

---

### 2.2 `navigator.mediaDevices.getUserMedia()` (permission-triggering)

**File:** `components/CaptureWidget/hooks/useCaptureWidget.ts`  
**Lines:** 631–668 (inside `startListening`)

**Snippet:**

```ts
  const startListening = useCallback(async () => {
    echlyLog("RECORDING", "start");
    // ...
    try {
      const audioConstraints: boolean | MediaTrackConstraints = selectedMicrophoneId
        ? { deviceId: { exact: selectedMicrophoneId } }
        : true;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
      mediaStreamRef.current = stream;
      // ... AudioContext, analyser, recognition.start(), setState("voice_listening")
    } catch (err) {
      console.error("Microphone permission denied:", err);
      // ... setErrorMessage("Microphone permission denied."), setState("error")
    }
  }, [selectedMicrophoneId]);
```

**Behavior:** This is the only place that can trigger the **browser microphone permission dialog**. It runs only when the user starts voice capture (e.g. “Start voice” or equivalent). It is **not** called on script load or on widget open; it is called from `startListening`, which is invoked by user action (e.g. clicking to start recording).

**Conclusion:** Microphone access is correctly gated on an explicit user gesture (starting voice recording). No change required for permission behavior; optional to add a short comment in code that this is the only getUserMedia call and that it is user-initiated.

---

### 2.3 Reference to “enumerateDevices” in types (no runtime call)

**File:** `components/CaptureWidget/types.ts`  
**Line:** 146 (comment only)

```ts
  /** Optional preferred microphone deviceId for voice capture (from enumerateDevices). */
```

No permission impact; documentation only.

---

## 3. Event listeners and automatic capture on page load

Searched for `document.addEventListener` and `window.addEventListener` with focus on initialization and capture logic.

### 3.1 Content script: `echly-extension/src/content.tsx`

Listeners registered in `ContentApp` (React effects) or in top-level helpers:

| Line(s) | Event                     | Purpose |
|--------|----------------------------|--------|
| 182    | `window.addEventListener("ECHLY_TOGGLE_WIDGET", ...)` | Toggle widget from extension |
| 194    | `window.addEventListener("ECHLY_RESET_WIDGET", ...)`   | Reset widget state |
| 219    | `window.addEventListener("ECHLY_GLOBAL_STATE", ...)`   | Apply global UI state from background |
| 254    | `document.addEventListener("visibilitychange", ...)`    | Resync state when tab becomes visible |
| 288    | `window.addEventListener("ECHLY_START_SESSION_REQUEST", ...)` | Start session flow |
| 295    | `window.addEventListener("ECHLY_OPEN_PREVIOUS_SESSIONS", ...)` | Open resume modal |
| 305    | `window.addEventListener("ECHLY_OPEN_WIDGET", ...)`   | Expand widget |
| 1556   | `document.addEventListener("visibilitychange", ...)`   | `ensureVisibilityStateRefresh()` — resync state on tab visible |
| 1636   | `window.addEventListener("wheel", ...)`                | Debug (passive) |
| 1641   | `document.addEventListener("scroll", ...)`              | Debug (passive) |

**Conclusion:** None of these listeners run media/device APIs or start capture on page load. They handle UI visibility, session lifecycle, and debug logging only. No permission-related or automatic capture logic on load.

### 3.2 CaptureWidget / useCaptureWidget

In `components/CaptureWidget/hooks/useCaptureWidget.ts`:

| Line(s) | Event                | Purpose |
|--------|----------------------|--------|
| 368–369| `window.addEventListener("mousemove" / "mouseup", ...)` | Region selection drag |
| 853    | `document.addEventListener("keydown", ...)`            | Keyboard (e.g. Escape) |
| 883    | `document.addEventListener("mousedown", ...)`         | Click-outside to close |

**Conclusion:** These are UI interaction handlers. They do not call `getUserMedia`, `enumerateDevices`, or any other device/permission API. Voice capture is started only via `startListening`, which is invoked by explicit user actions (e.g. button click to start recording).

---

## 4. Content script initialization flow

**File:** `echly-extension/src/content.tsx`

Execution order when the script loads (after injection via `chrome.scripting.executeScript`):

1. **Module load**  
   - Imports (React, `apiFetch`, upload/OCR, `CaptureWidget`, types, logger, config, etc.)  
   - Global declaration for `window.__ECHLY_WIDGET_LOADED__`  
   - Top-level constants and helpers: `getPreferredTheme`, `applyThemeToRoot`, `setHostVisibility`, `getShouldShowTray`, `mergeWithPointerProtection`, `createUniqueId`, `requestOpenPopup`, `notifyFeedbackCreated`, etc.

2. **Guard at bottom (lines 1676–1680)**  
   - If `window.__ECHLY_WIDGET_LOADED__` is already true: log and exit.  
   - Else set `window.__ECHLY_WIDGET_LOADED__ = true` and call `main()`.

3. **`main()` (lines 1652–1674)**  
   - **Create or get host:** `document.getElementById(SHADOW_HOST_ID)` or create a `div`, set id/styles, `display: none`, append to `document.documentElement`.  
   - **Mount React:** `mountReactApp(host)` → `injectPageStyles()`, `host.attachShadow()`, `injectShadowStyles()`, create container, `createRoot(container)`, `reactRoot.render(<ContentApp ... />)`.  
   - **Setup messaging/state:**  
     - `ensureMessageListener(host)` — `chrome.runtime.onMessage.addListener(...)`  
     - `syncInitialGlobalState(host)` — `chrome.runtime.sendMessage({ type: "ECHLY_GET_GLOBAL_STATE" }, ...)`  
     - `ensureVisibilityStateRefresh()` — `document.addEventListener("visibilitychange", ...)`  
     - `ensureScrollDebugListeners()` — passive wheel/scroll listeners (debug only).

4. **ContentApp mount (React)**  
   - State, refs, and effects run.  
   - Effects: ECHLY_TOGGLE_WIDGET, ECHLY_RESET_WIDGET, __ECHLY_APPLY_GLOBAL_STATE__, ECHLY_GLOBAL_STATE, ECHLY_GET_GLOBAL_STATE (hydrate), visibilitychange resync, sessions check when visible, ECHLY_START_SESSION_REQUEST, ECHLY_OPEN_PREVIOUS_SESSIONS, ECHLY_OPEN_WIDGET, auth state (ECHLY_GET_AUTH_STATE).  
   - When user is authenticated, `ContentApp` renders `<CaptureWidget ... />`.

5. **CaptureWidget mount**  
   - `useCaptureWidget` runs.  
   - In `CaptureWidget.tsx`, the `useEffect` with dependency `[extensionMode]` runs (when `extensionMode` is true): calls `navigator.mediaDevices.enumerateDevices()` to populate microphones. No permission dialog.  
   - `getUserMedia` is **not** called here; it is only called later when the user starts voice recording via `startListening`.

**Summary:** No device permission prompt is triggered during content script initialization. The only device-related call during init (when extension mode and widget are mounted) is `enumerateDevices()`, which does not trigger a prompt.

---

## 5. CaptureWidget and useCaptureWidget — voice, media, device, permissions

### 5.1 Voice / media / device initialization

- **Voice capture:**  
  - **Start:** `startListening` in `useCaptureWidget.ts` (lines 631–668).  
  - **Trigger:** Called from UI when the user explicitly starts recording (e.g. “Voice” flow, session feedback voice, etc.).  
  - **Permission:** `getUserMedia({ audio: ... })` runs only inside `startListening`; i.e. only after user gesture. No auto-start of voice on load.

- **Media capture (screenshots/region):**  
  - Implemented via canvas/capture APIs (e.g. for screenshots). No `getUserMedia` for camera; no additional device permission dialogs from this audit.

- **Device enumeration:**  
  - Only `navigator.mediaDevices.enumerateDevices()` in `CaptureWidget.tsx` (lines 191–192), inside a `useEffect` when `extensionMode` is true. Used only to fill the microphone list. Does not trigger a permission dialog.

- **Permissions API:**  
  - No use of `navigator.permissions` or `navigator.permissions.query()` in the content script or CaptureWidget code.

### 5.2 useCaptureWidget — when is `getUserMedia` used?

- **Single call site:** `useCaptureWidget.ts` line 643, inside `startListening`.  
- **When `startListening` runs:** From handlers that are tied to user actions (e.g. “Start voice”, “Record” in session overlay).  
- No other `getUserMedia`, `enumerateDevices`, or permission checks in this hook.

---

## 6. Recommendations

1. **Microphone permission (getUserMedia)**  
   - **Current behavior:** Only called in `startListening`, which is user-initiated. **No change required** for permission behavior.  
   - Optional: Add a one-line comment at the `getUserMedia` call stating that this is the only place that can trigger the microphone prompt and that it is user-initiated.

2. **enumerateDevices (CaptureWidget.tsx)**  
   - **Current behavior:** Does not trigger a permission dialog; runs when widget mounts in extension mode.  
   - **Optional (lazy-loading):** Call `navigator.mediaDevices.enumerateDevices()` only when the user opens the microphone selector (e.g. when `micDropdownOpen` becomes true or when a “Select microphone” control is first used). That defers any media device API use until the user shows intent to use voice, and may slightly reduce surface area for strict environments.

3. **No other APIs**  
   - No `navigator.permissions`, `credentials`, `usb`, `hid`, `bluetooth`, `serial`, `requestDevice`, or `requestPort` are used; no further permission-related changes recommended from this audit.

---

## 7. Summary table

| Item | File | Line(s) | Can trigger permission dialog? | Lazy-load recommendation |
|------|------|--------|---------------------------------|----------------------------|
| `navigator.mediaDevices.getUserMedia` | `components/CaptureWidget/hooks/useCaptureWidget.ts` | 643 | **Yes (microphone)** — only when user starts voice | No; already user-initiated |
| `navigator.mediaDevices.enumerateDevices` | `components/CaptureWidget/CaptureWidget.tsx` | 191–192 | No | Optional: call when opening mic selector |
| All other device/permission APIs | — | — | Not used | — |

**Bottom line:** The only code path that can trigger a browser device permission dialog is `navigator.mediaDevices.getUserMedia({ audio: ... })` in `useCaptureWidget.ts` inside `startListening`, which runs only in response to the user starting voice capture. No change is required to avoid unexpected permission prompts; optional improvements are lazy-loading the device list and a short comment at the `getUserMedia` call.
