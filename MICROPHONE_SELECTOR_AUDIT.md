# Microphone selector — full code audit (Chrome extension / capture UI)

**Scope:** All code paths that implement microphone selection UI, device enumeration, state, positioning, and portals. **No code was modified** for this document.

**Summary:** The extension uses **two distinct UX paths** for choosing a mic: (1) **Extension tray / home screen** — `MicrophonePanel` opened from the Voice mode tile (`micDropdownOpen`). (2) **Session voice failure overlay** — `VoiceCapturePanel` with a **“Select Microphone”** button that opens a **body-portaled** dropdown. A third component, **`MicrophoneSelector`**, exists in the repo but **is not imported or used** anywhere in the workspace search.

---

## 1. Button code

### 1.A — Literal **“Select Microphone”** (session failure UI)

**File:** `components/CaptureWidget/VoiceCapturePanel.tsx`

Rendered only inside `failureBody`, which is shown when `showFailure` is true (`voiceError` is truthy). The button calls `openMicPicker()` on click.

```tsx
<button
  ref={micTriggerRef}
  type="button"
  className="echly-voice-failure-secondary"
  onClick={() => void openMicPicker()}
  aria-expanded={micPickerOpen}
  aria-haspopup="listbox"
>
  Select Microphone
</button>
```

**Parent JSX block:** The button sits under `.echly-voice-failure-actions` → `.echly-voice-failure-secondary-wrap`, inside `.echly-voice-failure-body`, which is only rendered when `showFailure && (...)` (i.e. `Boolean(voiceError)`).

### 1.B — Extension tray: open mic list (no “Select Microphone” label)

**File:** `lib/capture-engine/core/CaptureWidget.tsx`

The **Voice** mode tile toggles `setMicDropdownOpen(true)` when voice is already the selected mode (second click). The visible label on the tile is **“Voice (Recommended)”**, not “Select Microphone”.

```tsx
<div
  className={`echly-mode-tile echly-mode-card voice-mode ${captureMode === "voice" ? "selected" : ""}`}
  onClick={() => {
    if (isStartingSession) return;
    if (captureMode !== "voice") {
      setMode("voice");
    } else {
      setMicDropdownOpen(true);
    }
  }}
  ...
  aria-label={captureMode === "voice" ? "Voice (Recommended). Click to select microphone." : "Voice (Recommended)"}
>
```

`MicrophonePanel` (title text **“Select microphone”** inside the panel, see §3) is rendered when:

`extensionMode && captureMode === "voice" && micDropdownOpen`.

### 1.C — Unused `MicrophoneSelector` component

**File:** `components/CaptureWidget/MicrophoneSelector.tsx`

Exports a **“Mic: {shortName}”** button with `onClick={onToggle}` — **no** “Select Microphone” string. **Grep shows no imports** of `MicrophoneSelector` elsewhere in the repo; treat as **dead code** unless wired by an external bundle not in this workspace.

---

## 2. Click handler

### 2.A — `VoiceCapturePanel`: `openMicPicker`

**File:** `components/CaptureWidget/VoiceCapturePanel.tsx`

```ts
const openMicPicker = useCallback(async () => {
  try {
    const list = await navigator.mediaDevices.enumerateDevices();
    const inputs = list.filter((d) => d.kind === "audioinput");
    setMicDevices(
      inputs.map((d, i) => ({
        deviceId: d.deviceId,
        label: d.label?.trim() || `Microphone ${i + 1}`,
      }))
    );
    setMicPickerOpen(true);
  } catch {
    setMicDevices([]);
  }
}, []);
```

**State updates:**

- `setMicDevices(...)` from filtered `audioinput` devices.
- `setMicPickerOpen(true)` on success path.
- On `catch`: only `setMicDevices([])` — **`setMicPickerOpen` is not set to `true` in the catch path**, so the picker does not open on enumeration failure.

### 2.B — `CaptureWidget`: Voice tile → `setMicDropdownOpen(true)`

**File:** `lib/capture-engine/core/CaptureWidget.tsx` (see §1.B)

**State update:** `setMicDropdownOpen(true)` (local `useState` in `CaptureWidget`).

### 2.C — `MicrophonePanel` item / `MicrophoneSelector` item

- **`MicrophonePanel`:** each row calls `onSelect(device.deviceId)` then `onClose()` — in extension, `onSelect={setSelectedMicrophone}`, `onClose={() => setMicDropdownOpen(false)}`.
- **`VoiceCapturePanel` dropdown:** each option calls `onSelectMicrophone?.(d.deviceId)` and `setMicPickerOpen(false)`.

---

## 3. Dropdown rendering

### 3.A — Session failure: portaled listbox (`document.body`)

**File:** `components/CaptureWidget/VoiceCapturePanel.tsx` — variable `micDropdownMenu`:

**Conditions (all required):**

- `micPickerOpen`
- `micDevices.length > 0`
- `micDropdownRect` is non-null
- `micDropdownPortalTarget` (i.e. `document.body` in browser)

Implementation uses **`createPortal(..., document.body)`** with inline `position: "fixed"` and measured `top` / `left` / `width` / `maxHeight` / `zIndex: 9999`.

Role: `listbox`; options: `role="option"` buttons.

### 3.B — Extension tray: `MicrophonePanel` (not portaled)

**File:** `lib/capture-engine/core/MicrophonePanel.tsx`

```tsx
return (
  <div
    ref={panelRef}
    className="echly-mic-panel"
    role="dialog"
    aria-label="Select microphone"
  >
    <div className="echly-mic-panel-title">Select microphone</div>
    <div className="echly-mic-panel-list">
      {devices.map((device) => (
        <button ... className={`echly-mic-panel-item ...`} onClick={() => { onSelect(device.deviceId); onClose(); }}>
```

**Conditional parent render:** `CaptureWidget.tsx`:

```tsx
{extensionMode && captureMode === "voice" && micDropdownOpen && (
  <MicrophonePanel
    devices={microphones}
    selectedDeviceId={selectedMicrophone}
    onSelect={setSelectedMicrophone}
    onClose={() => setMicDropdownOpen(false)}
  />
)}
```

### 3.C — Unused inline menu (`MicrophoneSelector`)

**File:** `components/CaptureWidget/MicrophoneSelector.tsx`

```tsx
{open && (
  <div className="echly-mic-menu" role="listbox" aria-label="Select microphone">
    {devices.map(...)}
  </div>
)}
```

**Portal:** **No** — menu is a DOM child of `.echly-mic-selector`.

---

## 4. State management

| State | Where defined | Updated | Used for |
| --- | --- | --- | --- |
| `micPickerOpen` | `VoiceCapturePanel.tsx` | `setMicPickerOpen` in `openMicPicker`, option click, Escape, outside mousedown | Controls failure UI dropdown; `aria-expanded` on trigger |
| `micDevices` | `VoiceCapturePanel.tsx` | `setMicDevices` in `openMicPicker` / catch | Maps to dropdown options; gates `useLayoutEffect` when length 0 |
| `micDropdownRect` | `VoiceCapturePanel.tsx` | `setMicDropdownRect` in `updateMicDropdownPosition` / cleared in `useLayoutEffect` | Fixed positioning of portaled menu |
| `microphones` | `CaptureWidget.tsx` | `setMicrophones` via `onDevicesEnumerated` (extension only, in `startListening` path) | `MicrophonePanel` `devices` prop |
| `selectedMicrophone` | `CaptureWidget.tsx` | Initial from first device in `onDevicesEnumerated`; `setSelectedMicrophone` from panel / `onVoiceMicrophoneSelect` | Passed as `selectedMicrophoneId` into hook; panel selection |
| `micDropdownOpen` | `CaptureWidget.tsx` | `setMicDropdownOpen(true)` from Voice tile; `false` on `MicrophonePanel` close | Whether `MicrophonePanel` mounts |
| `micDeviceOverride` | `useCaptureWidget.ts` | `setMicDeviceOverride(deviceId)` in `selectVoiceMicrophone` | Overrides `selectedMicrophoneId` when starting `getUserMedia` |
| `selectedMicrophoneId` | Passed into `useCaptureWidget` from parent | N/A (prop) | Combined with override for effective mic |
| `voiceMicDeviceId` (hook state exposure) | Derived in hook return | — | `micDeviceOverride ?? selectedMicrophoneId ?? ""` — passed to `CaptureLayer` / `VoiceCapturePanel` for highlight |

**Wiring from session overlay to handler:**

- `CaptureLayer` passes `onSelectMicrophone={handlers.selectVoiceMicrophone}` and `voiceMicDeviceId={state.voiceMicDeviceId}`.
- `SessionOverlay` passes these into `VoiceCapturePanel`.

---

## 5. Device enumeration

### 5.A — `VoiceCapturePanel.openMicPicker`

**File:** `components/CaptureWidget/VoiceCapturePanel.tsx`

- `navigator.mediaDevices.enumerateDevices()`
- Filter: `d.kind === "audioinput"`
- Map: `deviceId`, `label: d.label?.trim() || \`Microphone ${i + 1}\``

### 5.B — `useCaptureWidget.startListening`

**File:** `lib/capture-engine/core/hooks/useCaptureWidget.ts`

Called when voice recording starts (user gesture). Enumerates devices, builds `deviceList`, then calls `onDevicesEnumerated?.(deviceList)` **before** `getUserMedia`.

```ts
const devices = await navigator.mediaDevices.enumerateDevices();
const inputs = devices.filter((d) => d.kind === "audioinput");
const deviceList = inputs.map((d) => ({
  deviceId: d.deviceId,
  label: d.label || `Microphone ${inputs.indexOf(d) + 1}`,
}));
onDevicesEnumerated?.(deviceList);
const effectiveMicId = micDeviceOverride ?? selectedMicrophoneId ?? undefined;
const audioConstraints: boolean | MediaTrackConstraints = effectiveMicId
  ? { deviceId: { exact: effectiveMicId } }
  : true;
const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
```

**Extension tray list population:** `CaptureWidget` passes `onDevicesEnumerated` only when `extensionMode` is true, to `setMicrophones` and optionally default `selectedMicrophone`.

---

## 6. Styling & positioning

### 6.A — Failure UI dropdown (`.echly-voice-mic-dropdown`)

**Files:** `app/globals.css` (and duplicated in `echly-extension/popup.css`)

- `max-height: 200px`, `overflow-y: auto`, `overflow-x: hidden`
- `border-radius`, `border`, `background`, `backdrop-filter`, `box-shadow`
- `z-index: 9999` in CSS **and** inline style on the portaled `div` (`VoiceCapturePanel`)

**Inline positioning (source of truth for placement):** `VoiceCapturePanel` sets `position: "fixed"`, `top`, `left`, `width`, `maxHeight` from `micDropdownRect`, `zIndex: 9999`.

**Placement logic:** `updateMicDropdownPosition` uses `micTriggerRef.getBoundingClientRect()`, viewport height/width margins, prefers drop-up vs drop-down, clamps `left`/`width`, sets `placement: "up" | "down"` (class `echly-voice-mic-dropdown--${placement}`).

### 6.B — `MicrophonePanel` (extension tray)

**File:** `app/globals.css` (lines ~2129–2141)

- `position: absolute`
- `right: 100%`, `margin-right: 14px`, `top: 0`
- `width: 240px`, `z-index: 30`
- `border-radius`, `background`, `box-shadow`, `padding`

### 6.C — Sidebar container (extension)

**File:** `lib/capture-engine/core/CaptureWidget.tsx` — `echly-sidebar-container` uses inline styles in extension mode: `position: "fixed"`, `zIndex: 2147483647`, and position from `state.position` or `bottom/right`.

**File:** `app/globals.css` — `.echly-sidebar-container` width/max-height flex layout; **no** `overflow: hidden` on the container in the audited block. `.echly-sidebar-surface` has `overflow: hidden` (mic panel is **outside** that surface — see §7).

### 6.D — `MicrophoneSelector` (unused)

No matching rules for `echly-mic-selector` / `echly-mic-menu` / `echly-mic-button` were found in `app/globals.css` or `public/echly-popup.css` via search — **if this component were mounted, styles may be missing** in those entrypoints.

---

## 7. Parent container analysis

### 7.A — Failure UI (`VoiceCapturePanel`)

**Hierarchy:**

1. `SessionOverlay` portals **`content`** into `captureRoot` via `createPortal(content, captureRoot)`.
2. `VoiceCapturePanel` returns:
   - If `captureRoot`: `createPortal(<>{dimLayer}{card}</>, captureRoot)` for the main card.
   - **Sibling:** `{micDropdownMenu}` is **not** inside that portal — it is rendered as a **second child of the `VoiceCapturePanel` fragment**, and the menu itself is portaled to **`document.body`**.

So the dropdown is **not** a descendant of `.echly-capture-card` (which has `overflow: hidden` in `globals.css`). CSS comment in `globals.css` explicitly references avoiding clipping from `.echly-capture-card` by portaling to `body` with fixed coordinates.

**Card container:** `.echly-capture-card` is `position: fixed`, centered, `z-index: 2147483646`, `overflow: hidden`.

### 7.B — Extension `MicrophonePanel`

**Hierarchy:**

```tsx
<div className="echly-sidebar-container" style={{ position: "fixed", ... }}>
  {micDropdownOpen && <MicrophonePanel ... />}
  <div className="echly-sidebar-surface" ... overflow: hidden>...</div>
</div>
```

`MicrophonePanel` is a **direct child** of `echly-sidebar-container`, **before** `echly-sidebar-surface`. Panel uses `position: absolute; right: 100%; top: 0` — positions relative to **`echly-sidebar-container`**, which is `position: fixed` in extension mode, so the panel anchors to the tray’s box.

`.echly-sidebar-surface`’s `overflow: hidden` does **not** clip the panel because the panel is **not** inside the surface.

---

## 8. Rendering conditions

### 8.A — “Select Microphone” button (failure)

- Shown when `showFailure` → `Boolean(voiceError)`.
- Hidden during normal recording UI (`normalBody` is `!showFailure && (...)`).

### 8.B — Failure dropdown

Renders only if:

`micPickerOpen && micDevices.length > 0 && micDropdownRect && document.body`

**Guards that prevent render:**

- No audio inputs after filter → `micDevices.length === 0` → no menu (even if `micPickerOpen` became true — note `openMicPicker` sets devices then opens; empty list means condition fails).
- `useLayoutEffect` clears `micDropdownRect` when `!micPickerOpen || micDevices.length === 0` — so rect is null until layout runs with open + non-empty devices.
- `enumerateDevices` throws → `micDevices` becomes `[]`, **`setMicPickerOpen(true)` is never called** — so `micPickerOpen` stays false (unless it was already true from a previous open — unlikely from a single click).
- Success with **zero** `audioinput` devices: `setMicPickerOpen(true)` still runs, but **`micDevices.length > 0`** fails — no dropdown visible while `micPickerOpen` may be true.

### 8.C — `MicrophonePanel`

Renders iff `extensionMode && captureMode === "voice" && micDropdownOpen`.

**Device list content:** `devices={microphones}` — populated when `onDevicesEnumerated` runs (during `startListening`). If the user opens the panel **before** any voice start has run, `microphones` can still be **empty** (panel shows with empty list — no extra guard in `MicrophonePanel`).

---

## 9. Portal usage

| UI | Portal? | Target |
| --- | --- | --- |
| `VoiceCapturePanel` dim + card | **Yes** | `captureRoot` when provided |
| `VoiceCapturePanel` mic dropdown | **Yes** | `document.body` |
| `SessionOverlay` session UI | **Yes** | `captureRoot` |
| `CaptureLayer` capture content | **Yes** | `captureRootParent ?? captureRoot` |
| `MicrophonePanel` | **No** | Inline under `echly-sidebar-container` |
| `MicrophoneSelector` (unused) | **No** | Inline |

---

## 10. Event flow

### Path A — Failure overlay “Select Microphone”

1. User clicks **“Select Microphone”** (`echly-voice-failure-secondary`).
2. **`openMicPicker`** runs (`async`).
3. **`enumerateDevices`** → filter `audioinput` → **`setMicDevices`**, then **`setMicPickerOpen(true)`** (success path).
4. **`useLayoutEffect`** (deps include `micPickerOpen`, `micDevices.length`) runs: **`updateMicDropdownPosition`**, **`setMicDropdownRect`**, registers resize/scroll listeners.
5. **`micDropdownMenu`**: if all conditions pass, **`createPortal`** renders fixed dropdown on **`document.body`**.
6. User picks option → **`onSelectMicrophone(deviceId)`** (hook’s `selectVoiceMicrophone`) + **`setMicPickerOpen(false)`**.
7. Outside click / Escape closes picker (`setMicPickerOpen(false)`).

### Path B — Extension tray Voice tile

1. User clicks **Voice** tile while `captureMode === "voice"` (and not `isStartingSession`).
2. **`setMicDropdownOpen(true)`**.
3. **`MicrophonePanel`** mounts if `extensionMode && captureMode === "voice"`.
4. User selects device → **`setSelectedMicrophone`**, **`setMicDropdownOpen(false)`**. Parent **`onVoiceMicrophoneSelect`** (extension) also updates `selectedMicrophone`.
5. On next **`startListening`**, **`micDeviceOverride`** (from `VoiceCapturePanel` path) or **`selectedMicrophoneId`** (from tray) is used in **`getUserMedia`** constraints.

### Path C — Enumeration feeding tray list

1. User starts voice (session flow) → **`startListening`** → **`enumerateDevices`** → **`onDevicesEnumerated(deviceList)`** → **`setMicrophones`** in `CaptureWidget` (extension).

---

## 11. Possible failure points (analysis only)

**Rendering**

- **`MicrophoneSelector` unused** — any future use needs imports + CSS verification.
- **Failure dropdown** requires **`micDropdownRect`**; first paint depends on `useLayoutEffect` after `micPickerOpen` + non-empty `micDevices`.
- **`openMicPicker` catch** leaves picker closed and clears devices — user gets **no** dropdown on enumeration error.
- **`MicrophonePanel` with empty `microphones`** — still renders dialog shell with **no** items if opened before enumeration.

**State**

- **Tray `selectedMicrophone`** vs **hook `micDeviceOverride`** — two mechanisms; tray uses `onVoiceMicrophoneSelect` to sync `setSelectedMicrophone`; failure UI uses `selectVoiceMicrophone` which sets **`micDeviceOverride`** + callback. Engineers should trace **both** when debugging wrong device.
- **`onDevicesEnumerated`** only when **`extensionMode`** in `CaptureWidget` — non-extension hosts may not populate tray list the same way.

**CSS / positioning**

- **Failure menu:** fixed to viewport — generally avoids **`overflow: hidden`** on capture card; still subject to **viewport** edges (logic clamps position).
- **`MicrophonePanel`:** **`z-index: 30`** inside a container with **very large** `z-index` — usually fine within the same stacking context; if another UI creates a higher stacking context overlapping the tray, panel could be obscured (depends on page/extension layering).
- **Unused `MicrophoneSelector`** classes may have **no styles** in `globals.css` / `echly-popup.css`.

**Permissions / devices**

- **`enumerateDevices`** before permission can yield **empty labels** (browser-dependent); device count may still be non-zero.
- **Filter `audioinput`** — non-audio devices never appear.

**Integration**

- **`VoiceCapturePanel`** only mounts when **`sessionFeedbackPending && captureMode === "voice"`** in `SessionOverlay` — failure UI (and “Select Microphone”) exists only in that configuration.

---

## File index

| File | Role |
| --- | --- |
| `components/CaptureWidget/VoiceCapturePanel.tsx` | “Select Microphone” button, `openMicPicker`, body portaled dropdown, positioning |
| `lib/capture-engine/core/CaptureWidget.tsx` | `microphones`, `selectedMicrophone`, `micDropdownOpen`, `MicrophonePanel`, Voice tile |
| `lib/capture-engine/core/MicrophonePanel.tsx` | Tray “Select microphone” dialog + list |
| `components/CaptureWidget/MicrophoneSelector.tsx` | Unused dropdown component |
| `lib/capture-engine/core/hooks/useCaptureWidget.ts` | `enumerateDevices` in `startListening`, `selectVoiceMicrophone`, `micDeviceOverride` |
| `lib/capture-engine/core/CaptureLayer.tsx` | Passes mic props into `SessionOverlay` |
| `components/CaptureWidget/SessionOverlay.tsx` | Renders `VoiceCapturePanel`, portals to `captureRoot` |
| `app/globals.css` | `.echly-mic-panel`, `.echly-voice-mic-dropdown`, `.echly-capture-card`, `.echly-sidebar-*` |
| `echly-extension/popup.css` | Mirrored rules for extension build |

---

*End of audit.*
