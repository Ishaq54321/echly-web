# Echly Widget UX Redesign — 2026 Premium SaaS

## Step 1 — Redesigned Interaction Model

Three clear product states, inspired by Loom’s “disappearing” capture flow:

### IDLE MODE
- **Small floating launcher** (bottom-right by default).
- **Shows:** Echly icon, primary label “Capture feedback”, optional quick “Start session” on hover expansion.
- **Behavior:** Single compact pill; on hover, expands smoothly to show full CTA and optional session start. Click opens sidebar or starts capture depending on action.
- **Feel:** Minimal footprint, one clear entry point. The tool is present but not noisy.

### CAPTURE MODE
- **UI mostly disappears:** Sidebar closes; only the capture layer is active.
- **Overlay:** Soft dim (not heavy), crosshair cursor, single short instruction (“Drag to capture area — Esc to cancel”).
- **Focus:** Selection rectangle is the hero — clear border, subtle glow, no clutter. After release: minimal confirmation bar (Retake | Capture) near the selection.
- **Feel:** User is “in” the page; the tool gets out of the way and only highlights the selection and one next step.

### SESSION MODE
- **Dedicated feedback workflow:** Session toolbar at top (Pause | Resume | End), element hover highlight, comment cursor.
- **On click:** Lightweight feedback popup (screenshot preview + “Speak or type feedback”) with clear primary/secondary actions.
- **Feel:** Guided flow: hover → highlight → click → small popup → speak or type → done. No extra chrome.

---

## Step 2 — Design System

### Colors (tokens under `#echly-root`)
| Token | Dark | Light |
|-------|------|--------|
| Primary | Accent blue | Accent blue |
| Accent | `#466EFF` | `#2563EB` |
| Background | `--bg-primary` | `--bg-primary` |
| Surface | `--bg-surface` | `--bg-surface` |
| Border | `--border-subtle` | `--border-subtle` |
| Text primary | `--text-primary` | `--text-primary` |
| Text secondary | `--text-secondary` | `--text-secondary` |
| Overlay | `--overlay-dim` | `--overlay-dim` |

### Typography
- **Font stack:** `"SF Pro Display", "Segoe UI", system-ui, sans-serif`
- **Heading:** 15px / 600, -0.02em
- **Body:** 14px / 500, line-height 1.4
- **UI label:** 13px / 500

### Spacing scale (px)
- 4, 8, 12, 16, 24, 32

### Radius scale (px)
- 6, 8, 12, 16 (pill: 9999px)

### Shadow system
- **Surface:** subtle inset + soft drop
- **Floating:** 0 4px 12px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.12)
- **Overlay panels:** 0 24px 48px rgba(0,0,0,0.2), backdrop blur

---

## Implementation Notes

- **Preserved:** content script mounting, `#echly-shadow-host`, `#echly-root`, `createCaptureRoot()`, `#echly-capture-root`, CaptureLayer portal, CAPTURE_TAB pipeline, SessionOverlay, elementHighlighter, chrome.runtime message contracts.
- **Changed:** UI layout, styling, class names for visual hierarchy only; launcher interaction (hover expand); region overlay and session popup visuals; animations (launcher, sidebar, capture fade, buttons).
- **Unused components (candidates for removal):** LauncherView, SessionTray, RecordingFloatingUI — not imported; safe to delete if not planned for use.
