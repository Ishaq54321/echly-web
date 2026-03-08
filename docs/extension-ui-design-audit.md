# Extension Widget UI Design Audit

**Scope:** Echly browser extension widget UI only (sidebar, floating trigger, capture overlays, session UI). Excludes backend, APIs, and dashboard.

**Sources:** `components/CaptureWidget`, `components/ui`, `app/globals.css`, `echly-extension/popup.css` (built bundle), `tailwind.config.ts`.

---

## 1. Styling System

### Summary

| Approach | Used? | Where |
|----------|--------|--------|
| **Tailwind CSS** | Yes | `app/globals.css` uses `@import "tailwindcss"` and `@theme`; `tailwind.config.ts` extends colors, shadows, radius, transitionDuration. Widget components use **class names** (e.g. `echly-*`), not Tailwind utility classes. |
| **CSS modules** | No (for widget) | One `.module.css` exists in the app (Plus Jakarta font); no CSS modules in CaptureWidget. |
| **Global CSS** | Yes | `app/globals.css` holds all widget styles: tokens, layout, capture/voice/sidebar/feedback classes. Extension loads built CSS as `popup.css` into the shadow root. |
| **Design tokens** | Yes | Two layers: (1) `:root` in globals (motion, spacing, radius, dashboard colors); (2) **Widget-specific** under `#echly-root[data-theme="dark"]` and `#echly-root[data-theme="light"]` (backgrounds, text, borders, buttons, shadows). |

### Strategy

- **Token-driven:** Widget surfaces use CSS custom properties scoped to `#echly-root` and `data-theme` so dark/light is consistent.
- **Class-based widget UI:** Sidebar, trigger, feedback list, recording UI use BEM-like `echly-*` classes defined in `app/globals.css`.
- **Inline styles for overlays:** SessionFeedbackPopup, SessionControlPanel, RegionCaptureOverlay, ResumeSessionModal, SessionOverlay tooltip use inline `style={{}}` for layout and colors (no tokens), so they are **decoupled from the theme token system** and repeat hardcoded values (e.g. `rgba(20,22,28,0.95)`, `#2563eb`).
- **Extension delivery:** Content script creates a shadow root, injects a `<link rel="stylesheet" href="popup.css">` (built from app + Tailwind), then a small inline reset for `#echly-root`. The widget root gets `data-theme="dark"|"light"` and inherits all `#echly-root` rules from that CSS.

---

## 2. Color System

### Token-based (theme-aware, in globals.css)

Defined under `#echly-root[data-theme="dark"]` and `#echly-root[data-theme="light"]`:

| Role | Dark | Light |
|------|------|--------|
| **Primary background** | `--bg-primary`: rgba(20,22,28,0.92) | rgba(255,255,255,0.92) |
| **Surface** | `--bg-surface`: rgba(255,255,255,0.06) | rgba(0,0,0,0.04) |
| **Surface hover** | `--bg-surface-hover`: rgba(255,255,255,0.08) | rgba(0,0,0,0.06) |
| **Text primary** | `--text-primary`: #ffffff | #111111 |
| **Text secondary** | `--text-secondary`: rgba(255,255,255,0.65) | rgba(0,0,0,0.6) |
| **Border** | `--border-subtle`: rgba(255,255,255,0.06) | rgba(0,0,0,0.06) |
| **Primary button bg** | `--button-primary-bg`: #ffffff | #111111 |
| **Primary button text** | `--button-primary-text`: #111111 | #ffffff |
| **Secondary button** | `--button-secondary-bg`, `--button-secondary-text`, hover variants | (same pattern) |
| **Accent** | `--color-accent`: #466EFF (dark), #2563EB (light) | |
| **Accent soft** | `--color-accent-soft` | |
| **Alert** | `--color-alert`: #FF4D4F (dark), #DC2626 (light) | |
| **Warning** | `--color-warning`: #ea580c / #EA580C | |
| **Input** | `--input-bg`, `--input-border`, `--input-border-focus` | |
| **Icons** | `--icon-color`, `--icon-hover` | |
| **Shadows** | `--shadow-depth`, `--shadow-strong`, `--shadow-depth-recording` | |
| **Widget gradient** | `--bg-widget-gradient` | |

### Hardcoded in components (not token-based)

Used in inline styles in SessionFeedbackPopup, SessionControlPanel, RegionCaptureOverlay, ResumeSessionModal, SessionOverlay:

| Context | Colors |
|--------|--------|
| **Overlay / panel bg** | `rgba(20,22,28,0.95)` / `0.98`, `#111` |
| **Primary actions** | `linear-gradient(135deg, #2563eb, #1d4ed8)` or `#5B8CFF`, `#466EFF` |
| **Secondary / ghost** | `rgba(255,255,255,0.06)`, `rgba(255,255,255,0.08)`, `rgba(255,255,255,0.1)` |
| **Danger / end** | `rgba(239,68,68,0.9)` |
| **Text** | `rgba(255,255,255,0.9)`, `0.7`, `0.5`; `#ef4444` (error) |
| **Borders** | `rgba(255,255,255,0.08)`, `0.1`, `0.15`, `0.2` |
| **Region overlay dim** | `rgba(0,0,0,0.35)` |
| **Focus overlay** | `rgba(0,0,0,0.04)` |
| **Region selection** | `#5B8CFF`, `#FFFFFF` (flash) |
| **WidgetFooter secondary** | Inline `rgba(37, 99, 235, 0.15)` / `#2563eb` and `rgba(255,255,255,0.08)` / `#2563eb` |

### Global :root (dashboard / app, not widget theme)

- `--color-primary`: #1a56db (and hover, soft, ring)
- `--color-success`, `--color-skipped`, `--color-danger` + soft variants
- `--env-base`, `--canvas-base`, `--structural-gray*`, `--layer-*`, shadows

### Summary table (widget-facing)

| Purpose | Token (preferred) | Actually used in widget |
|--------|--------------------|---------------------------|
| Primary color | `--color-accent` | Sidebar CTA, recording done; overlays use hardcoded #2563eb / #5B8CFF |
| Background | `--bg-primary`, `--bg-widget-gradient` | Sidebar, trigger, recording capsule use tokens |
| Sidebar surface | `--bg-primary`, `--border-subtle`, `--shadow-depth` | Yes in globals for `.echly-sidebar-surface` |
| Overlay / modals | — | Inline: rgba(20,22,28,0.95–0.98) |
| Border | `--border-subtle` | Sidebar/trigger use it; overlays use inline rgba |
| Text | `--text-primary`, `--text-secondary` | Sidebar/feedback use tokens; overlays use inline white/gray |

---

## 3. Typography

### Font family

- **Widget (globals):** `#echly-root { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, system-ui, sans-serif; }`
- **App html/body:** `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
- **Voice pill (globals):** `font-family: system-ui, -apple-system, sans-serif`
- **Capsule / recording:** Same as widget in globals (`.echly-capsule`, `.echly-recording-row`)

### Font sizes (from globals + inline)

| Use | Size | Where |
|-----|------|--------|
| Sidebar title | 15px, font-weight 600 | `.echly-sidebar-title` |
| Sidebar summary | 12px | `.echly-sidebar-summary` |
| Feedback item title | 14px, font-weight 500 | `.echly-widget-item-title` |
| Feedback item description | 13px | `.echly-widget-item-desc` |
| Add insight button | 15px, font-weight 600 | `.echly-add-insight-btn` |
| Floating trigger | 15px, font-weight 500 | `.echly-floating-trigger` |
| Recording status | 15px, font-weight 600 | `.echly-recording-status` |
| Recording esc hint | 12px | `.echly-recording-esc-hint` |
| Recording cancel/done | 13px / 14px | `.echly-recording-cancel-pill`, `.echly-recording-done` |
| Voice pill text | 15px, font-weight 500 | `.echly-voice-pill-text` |
| Inline (SessionControlPanel, SessionFeedbackPopup, etc.) | 12, 13, 14, 18 | Inline styles (e.g. 13 for labels, 14 for buttons, 18 for modal title) |

### Headings / labels

- **Headings:** No dedicated heading scale in widget; modal titles use inline 18px/600; sidebar uses 15px/600 as “title.”
- **Labels:** 12px (sidebar summary, esc hint, tooltip, filter chips), 13px (feedback desc, recording, errors), 14px (item title, buttons).
- **Button copy:** 13–15px; primary actions often 14–15px/600.

---

## 4. Spacing System

### Design tokens (globals :root)

- `--space-1`: 4px  
- `--space-2`: 8px  
- `--space-3`: 12px  
- `--space-4`: 16px  
- `--space-5`: 20px  
- `--space-6`: 24px  
- `--space-8`: 32px  
- `--space-10`: 40px  

Widget CSS uses these only indirectly (e.g. some padding values align with 8, 12, 16, 18, 20, 24). Many widget styles use raw numbers instead of tokens.

### Values used in widget (globals + components)

| Value | Usage |
|-------|--------|
| 4px | gap (recording center), margin-top (sidebar summary, priority dot), radius 6–8 (tooltip, buttons) |
| 6px | border-radius (tooltip, region cutout), priority dot size |
| 8px | gap (footer buttons, region confirm bar, filter chips), padding (various), marginTop (footer row) |
| 10px | padding (SessionControlPanel), gap (SessionFeedbackPopup), marginTop (ResumeSessionModal filters) |
| 12px | padding (sidebar body gap, feedback list gap), border-radius (feedback item, confirm bar, control panel), font 12px |
| 14px | floating trigger padding 10px 20px; orb 56px/48px |
| 16px | padding (sidebar header 24/20/0/18, body 20px; modals 16px), gap 18px (sidebar body, feedback list) |
| 18px | sidebar surface radius, header padding-bottom, body gap |
| 20px | sidebar padding horizontal, header padding |
| 24px | sidebar header padding-top, extension position bottom/right 24px, modal padding |
| 32px | voice pill bottom 32px, floating trigger bottom 40px (inconsistent with 24px sidebar) |

**Observation:** Spacing is a mix of token-aligned values (4, 8, 12, 16, 20, 24) and ad-hoc (6, 10, 14, 18, 30, 40). No consistent use of `--space-*` in widget class definitions.

---

## 5. Button Styles

### Token / class-based (globals)

| Variant | Class | Usage |
|---------|--------|--------|
| **Primary** | `.echly-add-insight-btn` | Full-width CTA: “Start New Feedback Session”, “Capture feedback”. Uses `--color-accent`, `--button-primary-text`; disabled uses `--bg-surface-hover`, `--text-secondary`. |
| **Secondary (widget)** | `.echly-add-insight-btn.echly-add-insight-btn--secondary` | “Resume Session” and “Open Previous Session” in WidgetFooter. **Not defined in globals** — WidgetFooter overrides with inline styles (blue tint vs gray). |
| **Ghost / secondary pill** | `.echly-recording-cancel-pill` | Cancel in recording capsule. Uses `--button-secondary-bg`, `--button-secondary-text`, hover variants. |
| **Primary (recording)** | `.echly-recording-done` | Done in recording capsule. Uses `--button-primary-bg`, `--button-primary-text`, elevation. |
| **Icon** | `.echly-widget-action-icon` | Expand, edit, delete, confirm in FeedbackItem. Transparent, 28×28, radius 8px; confirm has hover/active and success state (`.echly-widget-action-icon--confirm`, `--confirm-success`). |
| **Close / theme** | `.echly-sidebar-close`, `.echly-theme-toggle` | Icon-only, transparent, 28×28, radius 8px. |

### Inline-only (no shared class)

| Context | Style |
|--------|--------|
| SessionFeedbackPopup | Primary: gradient #2563eb → #1d4ed8, 12px 16px, radius 10. Secondary: rgba(255,255,255,0.06), border 0.2. Ghost “Discard”: transparent, 8px 12px. |
| SessionControlPanel | Resume: gradient blue; Pause: rgba(255,255,255,0.1); End: rgba(239,68,68,0.9); all 6px 12px, radius 8. |
| RegionCaptureOverlay | Retake: rgba(255,255,255,0.08); Speak: gradient #5B8CFF → #466EFF; 8px 14px, pill. |
| ResumeSessionModal | Filter chips 6px 10px radius 6; list item 12px 14px radius 10; Cancel 8px 14px. |

### Summary

- **Primary:** Token-based in sidebar/footer and recording capsule; overlays use inline gradients.
- **Secondary:** Token-based for recording cancel; WidgetFooter “Resume” / “Open Previous” use inline styles and a class that has no corresponding rule in globals (`.echly-add-insight-btn--secondary`).
- **Ghost:** Token-based for cancel pill; “Discard” and similar are inline.
- **Icon:** All in globals (action icons, close, theme).
- **Danger:** Inline in SessionControlPanel (“End”) and FeedbackItem delete hover (token `--color-alert`).

---

## 6. Component Style Map

### CaptureHeader

- **Container:** `.echly-sidebar-header` — padding 24px 20px 0, bottom 18px; flex, space-between.
- **Title:** `.echly-sidebar-title` — 15px, weight 600, letter-spacing -0.2px, `--text-primary`.
- **Summary:** `.echly-sidebar-summary` — 12px, `--text-secondary`, margin-top 4px.
- **Close:** `.echly-sidebar-close` — absolute 18/16, 28×28, transparent, `--icon-color`, radius 8.
- **Theme toggle:** `.echly-theme-toggle` — same size/positioning (right 48px when with close), opacity 0.7 → 1, rotate 12° on hover.

### WidgetFooter

- **Wrap:** `.echly-add-insight-wrap` — sticky bottom 16px, margin-top 18px.
- **Primary:** `.echly-add-insight-btn` — full width, 48px, pill, `--color-accent`, 15px/600, shadow; disabled uses `--bg-surface-hover`, `--text-secondary`. Secondary row uses inline `display: flex; gap: 8; marginTop: 8`.
- **Secondary buttons:** “Resume Session” and “Open Previous Session” use `.echly-add-insight-btn.echly-add-insight-btn--secondary` plus **inline** background/border/color (no globals rule for `--secondary`).

### FeedbackItem

- **Row:** `.echly-feedback-item` — padding 16px 18px, radius 12px, transparent bg, hover `--bg-surface`; highlight `.echly-ticket-highlight` (accent soft + border).
- **Priority:** `.echly-priority-dot` — 6×6, circle, `--text-secondary`; critical/high/medium/low use `--color-alert`, `--color-warning`, `--priority-medium`, `--priority-low`.
- **Content:** `.echly-widget-item-title` (14px, 500), `.echly-widget-item-desc` (13px, `--text-secondary`, margin-top 6px).
- **Inputs:** `.echly-widget-input.echly-feedback-item-input` / `.echly-feedback-item-textarea` — use globals `.echly-feedback-item-input` / `.echly-feedback-item-textarea` (padding 8/12, radius 8, `--input-bg`, `--input-border`).
- **Actions:** `.echly-feedback-item-actions` — gap 8; icons `.echly-widget-action-icon` (28×28, radius 8), opacity 0 until hover/focus; confirm variant and success state in globals.

### SessionFeedbackPopup

- **Fully inline.** Container: fixed center, min(380px, 92vw), radius 16, `rgba(20,22,28,0.98)`, blur 16px, shadow 24px 48px.
- **Sections:** padding 16; border-bottom 1px rgba(255,255,255,0.08).
- **Buttons:** Primary gradient #2563eb/#1d4ed8; secondary rgba(255,255,255,0.06); ghost Discard transparent.
- **Text:** 13px “Speak or type…”, 14px buttons; textarea 12px 14px, radius 10.

### SessionControlPanel

- **Fully inline.** Bar: fixed top 24, left 50%, transform translateX(-50%); padding 10px 16px; gap 12; radius 12; `rgba(20,22,28,0.95)`, blur 12px, shadow 8px 32px, border rgba(255,255,255,0.08).
- **Label:** 13px, 600, rgba(255,255,255,0.9).
- **Buttons:** 6px 12px, radius 8; Resume gradient blue; Pause/disabled rgba(255,255,255,0.1); End rgba(239,68,68,0.9). Inline spinner with keyframes `echly-inline-spin`.

### RegionCaptureOverlay

- **Root:** `.echly-region-overlay` + inline position fixed inset 0, z-index, user-select none.
- **Dim:** `.echly-region-overlay-dim` — inline background rgba(0,0,0,0.35) or transparent when selection exists; crosshair; transition 180ms.
- **Hint:** `.echly-region-hint` — fixed top 24, center, 13px, rgba(255,255,255,0.8).
- **Cutout:** `.echly-region-cutout` — inline border 2px #5B8CFF or #FFFFFF (flash), box-shadow 0 0 0 9999px rgba(0,0,0,0.35).
- **Confirm bar:** `.echly-region-confirm-bar` — inline flex, gap 8, padding 8 12, radius 12, `rgba(20,22,28,0.95)`, blur 12, shadow; animation `echly-confirm-bar-in` from globals.
- **Buttons:** `.echly-region-confirm-btn` — Retake ghost, Speak gradient #5B8CFF/#466EFF; 8px 14px, pill.

### Floating trigger

- **Wrapper:** `.echly-floating-trigger-wrapper` — fixed bottom 40px, right 40px, z-index 50 (globals).
- **Button:** `.echly-floating-trigger` — padding 10px 20px, radius 14px, `--bg-widget-gradient` + `--bg-primary`, blur 14px, `--border-subtle`, `--shadow-depth`, `--text-primary`, 15px/500; hover 3D tilt + translateY(-1px); active scale 0.98.

### Sidebar container

- **Container:** `.echly-sidebar-container` — width 480px; transition opacity/transform 140ms; extension adds position fixed (bottom/right or draggable) and z-index.
- **Surface:** `.echly-sidebar-surface` — radius 18px, `--bg-widget-gradient` + `--bg-primary`, blur 14px, `--border-subtle`, `--shadow-depth`; hover 3D tilt; `::before` radial gradient overlay.
- **Body:** `.echly-sidebar-body` — padding 0 20px 20px, flex column, gap 18, max-height 60vh, overflow-y auto.
- **List:** `.echly-feedback-list` — flex column, gap 18.

### Recording UI (extension)

- **Row:** `.echly-recording-row` — fixed bottom 40px, center, z-index 999999.
- **Capsule:** `.echly-recording-capsule` — 72×72 default; expanded 420px, padding 30, gap 18; `--bg-widget-gradient`, `--bg-primary`, blur 14, `--border-subtle`, `--shadow-depth` / `--shadow-depth-recording`; radius `--radius-lg` (20px in widget root).
- **Orb:** `.echly-recording-orb-inner` — 72×72, radial gradient red; listening/processing modifiers.
- **Center:** `.echly-recording-status`, `.echly-recording-esc-hint`, `.echly-recording-action-row` — token text colors; cancel/done use button tokens.

### ConfirmationCard

- **Uses:** `.echly-confirmation-card`, `.echly-confirmation-card-heading`, `.echly-confirmation-card-list`, `.echly-confirmation-card-title`, `.echly-confirmation-card-desc`, `.echly-confirmation-card-actions`, `.echly-confirmation-btn`, `.echly-confirmation-btn--confirm`, `.echly-confirmation-btn--edit`.
- **Note:** These classes are **not defined in app/globals.css**; styling would come from Tailwind or another bundle if used. Component uses Framer Motion for enter/exit.

### CaptureLayer (focus overlay)

- **Focus dim:** `.echly-focus-overlay` — inline position fixed inset 0, `rgba(0,0,0,0.04)`, crosshair, z-index 2147483645.

---

## 7. UI Problems

### Inconsistent spacing

- **Token scale exists but is underused:** `--space-1`…`--space-10` are defined; widget classes and inline use 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 30, 32, 40 without consistently mapping to tokens.
- **Gaps vary:** 6, 8, 10, 12, 18 used in different components; same intent (e.g. “small gap”) uses different values.
- **Positioning:** Floating trigger at bottom 40px / right 40px vs sidebar default bottom/right 24px; voice pill at bottom 32px — three different bottom offsets.

### Inconsistent button styles

- **Secondary CTA:** `.echly-add-insight-btn--secondary` is used in WidgetFooter but has **no definition** in globals; styles are fully inline (blue tint vs gray), so theme and future changes are brittle.
- **Overlay primary buttons:** SessionFeedbackPopup and SessionControlPanel use inline `linear-gradient(135deg, #2563eb, #1d4ed8)`; RegionCaptureOverlay uses `#5B8CFF` / `#466EFF` — different blues and no use of `--color-accent`.
- **Danger:** SessionControlPanel uses `rgba(239,68,68,0.9)`; theme has `--color-alert` (#FF4D4F dark, #DC2626 light) — not used in panel.
- **Sizes:** Add insight 48px height; recording done/cancel 36px; overlay buttons 12px 16px or 6px 12px — no shared height scale.

### Weak visual hierarchy

- **Sidebar:** Title “Echly” and summary are clear, but body has no section headings; “Add insight” is sticky at bottom and competes with list.
- **Modals:** SessionFeedbackPopup and ResumeSessionModal use similar dark panels; no clear hierarchy for “primary vs secondary” actions beyond button fill (e.g. “Discard” and “Cancel” are both low emphasis but styled differently).

### Crowded layout

- **Sidebar body:** 0 20px 20px padding, gap 18, max-height 60vh — with many feedback items and the sticky footer, the list can feel tight.
- **WidgetFooter extension row:** “Resume” and “Open Previous” in a row with flex and marginTop 8; with long labels could wrap or feel cramped on narrow widths.
- **Session control panel:** Label + 2–3 buttons in one bar; at small viewports the bar could overflow.

### Accessibility

- **Focus:** Globals define `button:focus-visible` and `.focus-ring-brand` with outline/box-shadow; widget lives in shadow DOM — focus styles must be included in the injected CSS (they are in globals, so popup.css should carry them).
- **Contrast:** Token text uses `--text-primary` / `--text-secondary`; inline overlays use rgba(255,255,255,0.7) or 0.5 — should be checked against WCAG for the dark overlay background.
- **Touch targets:** Icon buttons 28×28; some overlay buttons 6px 12px padding — may be below 44×44 recommended minimum on touch devices.
- **Labels:** Several icon-only buttons rely on `aria-label` (close, theme, expand, edit, delete, save); good. SessionFeedbackPopup textarea has `aria-label="Feedback text"`.

### Token vs inline split

- **Sidebar, trigger, feedback list, recording capsule** use theme tokens and feel consistent with dark/light.
- **SessionFeedbackPopup, SessionControlPanel, RegionCaptureOverlay, ResumeSessionModal, SessionOverlay tooltip** are 100% inline; they don’t respect `#echly-root[data-theme]` and don’t benefit from a single source of truth for colors/spacing. Any theme or brand change requires hunting inline values.

### Missing or duplicate definitions

- **ConfirmationCard:** Uses `.echly-confirmation-card*` and `.echly-confirmation-btn*` that are **not** in app/globals.css — likely unstyled or coming from another build path.
- **echly-widget-input:** FeedbackItem adds class `echly-widget-input` alongside `echly-feedback-item-input`; globals only define the latter — redundant and could cause confusion.
- **Region overlay classes:** `.echly-region-overlay`, `.echly-region-overlay-dim`, `.echly-region-hint`, `.echly-region-cutout`, `.echly-region-confirm-bar` / `.echly-region-confirm-btn` are used but **not** defined in globals (only inline styles apply).

---

## 8. Recommendations (concise)

1. **Use design tokens everywhere:** Replace inline colors in SessionFeedbackPopup, SessionControlPanel, RegionCaptureOverlay, ResumeSessionModal, and SessionOverlay with `#echly-root` theme variables (e.g. `--bg-primary`, `--color-accent`, `--button-primary-bg`, `--color-alert`).
2. **Define secondary button in globals:** Add `.echly-add-insight-btn--secondary` (and optionally a shared “outline/ghost” variant) using tokens; remove inline overrides from WidgetFooter.
3. **Align spacing with tokens:** Use `--space-*` in new or refactored widget CSS; standardize one spacing scale (e.g. 4/8/12/16/20/24) and replace ad-hoc 6/10/14/18 where possible.
4. **Unify primary action color:** Use `--color-accent` (or a single primary token) for all “primary” CTAs (sidebar, recording done, overlay “Speak feedback” / “Save feedback” / “Resume”) and document it in the design system.
5. **Add or link ConfirmationCard styles:** Either define `.echly-confirmation-card*` and `.echly-confirmation-btn*` in globals or ensure the component is included in a build that provides those styles.
6. **Document and optionally centralize overlay styles:** If keeping inline for portability, document the “overlay design language” (blur, radius, padding, shadow) and consider a small shared style object or constants file for numbers and colors used in overlays.
7. **Review touch targets and contrast:** Ensure icon buttons and small overlay buttons meet minimum touch size; run contrast checks on overlay text/background pairs and adjust tokens if needed.

---

*Audit complete. Scope: extension widget UI only; styling sources: CaptureWidget, globals.css, popup.css (build), tailwind.config.ts.*
