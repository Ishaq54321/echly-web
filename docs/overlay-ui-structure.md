# Echly Chrome Extension Overlay UI Structure

**Investigation report.** No code was modified. This document describes the DOM architecture of the Echly overlay system to support screenshot capture behavior adjustments (selection rectangle visible, feedback UI hidden).

---

## STEP 1 — Selection Overlay (Blue Rectangle)

### Component
**`RegionCaptureOverlay`** (`components/CaptureWidget/RegionCaptureOverlay.tsx`)

### JSX Element
The blue selection rectangle is a `<div>` with class `echly-region-cutout`:

```tsx
<div
  className="echly-region-cutout"
  style={{
    position: "fixed",
    left: rect.x, top: rect.y,
    width: rect.w, height: rect.h,
    border: `2px solid ${flashBorder ? "#FFFFFF" : "#466EFF"}`,
    boxShadow: "0 0 0 9999px rgba(0,0,0,0.4)",
    borderRadius: 14,
    ...
  }}
/>
```

### Root Element
The overlay root is a `<div>` with:
- `id="echly-overlay"`
- `className="echly-region-overlay"`
- `data-echly-ui="true"`

### CSS Classes (Selection Overlay)
| Class | Purpose |
|-------|---------|
| `echly-region-overlay` | Full-screen overlay root |
| `echly-region-overlay-dim` | Dimmed background (transparent when selection exists) |
| `echly-region-hint` | "Drag to capture area — ESC to cancel" text |
| `echly-region-cutout` | **Blue selection rectangle** (border `#466EFF`) |
| `echly-region-confirm-bar` | "Retake \| Speak feedback" buttons |
| `echly-region-confirm-btn` | Individual confirm bar buttons |

### Location
**Yes** — Lives inside `#echly-capture-root`. `RegionCaptureOverlay` is rendered by `CaptureLayer` via `createPortal(captureContent, captureRoot)` where `captureRoot` is `#echly-capture-root`.

---

## STEP 2 — Feedback Widget UI

### Component
**`CaptureWidget`** (`components/CaptureWidget/CaptureWidget.tsx`)

### JSX Root Elements
- **Floating launcher:** `<div className="echly-floating-trigger-wrapper">` with `<button className="echly-floating-trigger">`
- **Feedback panel:** `<div className="echly-sidebar-container">` containing:
  - `echly-sidebar-surface`
  - `echly-sidebar-header` (via `CaptureHeader`)
  - `echly-sidebar-body`
  - `echly-feedback-list`
  - `echly-mode-container` (mode tiles)
  - `WidgetFooter`

### Voice / Session UI (Portaled into `#echly-capture-root`)
- **`VoiceCapturePanel`** — `echly-capture-card`, `echly-dim-layer`
- **`SessionOverlay`** — `echly-session-controls`, `echly-session-overlay-cursor`, `echly-dim-layer`
- **`SessionControlPanel`** — `echly-session-controls` (Pause / Resume / End)

### CSS Classes (Feedback / Voice / Session)
| Class | Purpose |
|-------|---------|
| `echly-floating-trigger-wrapper` | Wrapper for launcher button |
| `echly-floating-trigger` | Launcher button |
| `echly-sidebar-container` | Feedback panel container |
| `echly-sidebar-surface` | Panel surface |
| `echly-sidebar-header` | Header with close, title |
| `echly-sidebar-body` | Scrollable body |
| `echly-feedback-list` | List of feedback items |
| `echly-feedback-card` | Individual feedback card |
| `echly-feedback-processing` | Processing state card |
| `echly-capture-card` | Voice feedback panel (waveform, Finish button) |
| `echly-dim-layer` | Dim overlay behind capture card |
| `echly-session-controls` | Session Pause / Resume / End bar |
| `echly-session-overlay-cursor` | Full-screen cursor overlay (session mode) |

### Location
- **Sidebar / launcher:** Rendered in the normal React tree under `#echly-root` (sibling of `#echly-capture-root`).
- **Voice / session UI:** Portaled into `#echly-capture-root` via `createPortal` (same container as the selection overlay).

---

## STEP 3 — Portal / Mounting Location

### Extension DOM Hierarchy

```
document
└ echly-shadow-host (div, id="echly-shadow-host")
  └ shadowRoot
    └ echly-root (div, id="echly-root")
      ├ echly-capture-root (div, id="echly-capture-root")
      │  ├ RegionCaptureOverlay (when region_selecting)
      │  │  ├ echly-region-overlay-dim
      │  │  ├ echly-region-hint
      │  │  ├ echly-region-cutout          ← BLUE SELECTION RECTANGLE
      │  │  └ echly-region-confirm-bar
      │  ├ SessionOverlay (when session mode)
      │  │  ├ echly-dim-layer
      │  │  ├ echly-session-overlay-cursor
      │  │  ├ SessionControlPanel (echly-session-controls)
      │  │  ├ VoiceCapturePanel (echly-capture-card)
      │  │  └ TextFeedbackPanel
      │  └ echly-focus-overlay (when focus_mode, non-session)
      │
      ├ echly-floating-trigger-wrapper     ← FEEDBACK LAUNCHER
      │  └ echly-floating-trigger
      │
      └ echly-sidebar-container           ← FEEDBACK PANEL
         └ echly-sidebar-surface
            ├ CaptureHeader
            ├ echly-sidebar-body
            │  ├ echly-feedback-list
            │  └ echly-mode-container
            └ WidgetFooter
```

### Mounting Flow
1. **`echly-extension/src/content.tsx`** — Creates `echly-shadow-host`, attaches shadow root, creates `echly-root`, renders `ContentApp` with `widgetRoot={echly-root}`.
2. **`useCaptureWidget`** — Creates `#echly-capture-root` and appends it to `captureRootParent` (i.e. `echly-root`).
3. **`CaptureLayer`** — Uses `createPortal(captureContent, captureRoot)` to render overlays into `#echly-capture-root`.
4. **`CaptureWidget`** — Renders sidebar and launcher as normal children of `echly-root`.

---

## STEP 4 — Separation

### Same Parent, Different Containers

| Element | Container | Sibling of |
|---------|-----------|------------|
| Blue selection rectangle | `#echly-capture-root` | Feedback sidebar, launcher |
| Feedback widget (sidebar) | `#echly-root` (direct child) | `#echly-capture-root` |
| Voice / session UI | `#echly-capture-root` | Selection overlay (same container) |

### Answers

1. **Does `RegionCaptureOverlay` render the blue rectangle inside `echly-capture-root`?**  
   **Yes.** The blue rectangle (`echly-region-cutout`) is inside `RegionCaptureOverlay`, which is portaled into `#echly-capture-root`.

2. **Does the feedback widget live in the same container?**  
   **Partially:**
   - **Sidebar / launcher:** No — they are siblings of `#echly-capture-root` under `#echly-root`.
   - **Voice panel / session controls:** Yes — they are portaled into `#echly-capture-root` alongside the selection overlay.

### Can They Be Hidden Independently?

**Yes.** The selection rectangle and feedback UI are in different subtrees:

- **Selection rectangle:** `#echly-capture-root` → `echly-region-overlay` → `echly-region-cutout`
- **Sidebar / launcher:** `#echly-root` → `echly-sidebar-container`, `echly-floating-trigger-wrapper`
- **Voice / session UI:** `#echly-capture-root` → `echly-capture-card`, `echly-session-controls`, etc.

To keep the selection rectangle visible and hide feedback UI:

- Hide: `echly-sidebar-container`, `echly-floating-trigger-wrapper`, `echly-capture-card`, `echly-session-controls`, `echly-session-overlay-cursor`, `echly-dim-layer`
- Do **not** hide: `#echly-capture-root`, `echly-region-overlay`, `echly-region-cutout`

**Important:** `hideEchlyUI` currently includes `#echly-root` in its selectors. Hiding `#echly-root` hides everything, including the selection overlay. To keep the selection visible during capture, `#echly-root` should not be hidden; instead, hide only the specific feedback elements listed above.

---

## STEP 5 — CSS Classes Summary

### Selection Rectangle
- `echly-region-overlay` — Overlay root
- `echly-region-cutout` — Blue selection border
- `echly-region-confirm-bar` — Retake / Speak feedback
- `echly-region-confirm-btn`
- `echly-region-overlay-dim`
- `echly-region-hint`

### Feedback Widget
- `echly-sidebar-container`
- `echly-sidebar-surface`
- `echly-sidebar-header`
- `echly-sidebar-body`
- `echly-feedback-list`
- `echly-feedback-card`
- `echly-feedback-item`
- `echly-floating-trigger-wrapper`
- `echly-floating-trigger`

### Voice UI
- `echly-capture-card`
- `echly-capture-title`
- `echly-capture-instruction`
- `echly-capture-visualizer`
- `echly-capture-status`
- `echly-capture-screenshot-preview`
- `echly-finish-btn`
- `echly-capture-cancel-hint`
- `echly-dim-layer`

### Toolbar / Session
- `echly-session-controls`
- `echly-session-overlay-cursor`
- `echly-mode-container`
- `echly-mode-tile`
- `echly-mode-card`

### Root Containers
- `#echly-root` — Main widget root (shadow DOM)
- `#echly-capture-root` — Overlay / capture layer root

---

## Component Tree (React)

```
ContentApp
└ CaptureWidget
   ├ CaptureLayer (createPortal → #echly-capture-root)
   │  ├ RegionCaptureOverlay
   │  │  └ echly-region-cutout (blue rectangle)
   │  ├ SessionOverlay (createPortal → #echly-capture-root)
   │  │  ├ SessionControlPanel
   │  │  ├ VoiceCapturePanel (createPortal → #echly-capture-root)
   │  │  └ TextFeedbackPanel
   │  └ echly-focus-overlay
   │
   ├ echly-floating-trigger-wrapper
   └ echly-sidebar-container
      └ CaptureHeader, echly-sidebar-body, WidgetFooter
```

---

## Recommendations for Screenshot Capture

To keep the **blue selection rectangle** visible and **feedback UI** hidden during screenshots:

1. **Do not hide** `#echly-root` or `#echly-capture-root`.
2. **Hide** these selectors (as in `hideEchlyUI.ts`):
   - `.echly-sidebar-container`
   - `.echly-floating-trigger-wrapper`
   - `.echly-capture-card` (voice panel)
   - `.echly-session-controls`
   - `.echly-session-overlay-cursor`
   - `.echly-dim-layer`
   - `.echly-region-confirm-bar` (if the confirm bar should not appear in screenshots)
3. **Exclude** from hiding:
   - `#echly-capture-root`
   - `.echly-region-overlay`
   - `.echly-region-cutout`
