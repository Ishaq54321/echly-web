# Annote Chrome Extension — Capture Flow Design Specification

**Version:** 1.0 | **Status:** Final Audit | **Date:** 2026-05-21

---

## Section 1: Capture Flow Narrative

### 1.1 Extension Loading & Initialization

When a user visits any website, the Annote extension injects via Manifest V3 content script:

- **Manifest injection** ([manifest.json:24-30](annote-extension/manifest.json#L24)): Bootstrap script runs at `document_start` on all URLs, ensuring injection before page DOM. No widget code loads yet—only a 2KB listener.
- **Bootstrap script** ([bootstrap.ts:1-50](annote-extension/src/bootstrap.ts#L1)): Registers `chrome.runtime.onMessage` immediately. Lazy-loads widget.js (360KB) only when user clicks extension icon or session is active from previous page load.
- **Shadow DOM** ([bootstrap.ts:58](annote-extension/src/bootstrap.ts#L58)): Host mounted as `#echly-shadow-host` with `display: none` until needed. When state changes, bootstrap sets `style.display = "block"`, `pointer-events = "auto"` ([bootstrap.ts:120-128](annote-extension/src/bootstrap.ts#L120)).

### 1.2 User Opens Extension (Icon Click)

1. Click Annote icon (top-right toolbar)
2. Extension background handler fires `chrome.action.onClicked` ([background.ts:102-124](annote-extension/src/background.ts#L102))
3. If tray not open, ECHLY_EXPAND_WIDGET sent to content script
4. Bootstrap loads widget.js if not already loaded
5. React mounts into shadow root
6. Tray appears bottom-right, initially collapsed showing header only
7. User sees workspace name, page title, session status, ticket count badge

### 1.3 User Starts Capture Session

From collapsed tray, user clicks "Start Session" button.

**Session initializes** ([content.tsx:451-480](annote-extension/src/content.tsx#L451)):
- Background sends ECHLY_START_SESSION request
- Content widget shows SessionOverlay ([SessionOverlay.tsx:60-88](components/CaptureWidget/SessionOverlay.tsx#L60))
- Element highlighter attaches ([session/elementHighlighter.ts:66-92](components/CaptureWidget/session/elementHighlighter.ts#L66))
- Click capture attaches in capture phase ([session/clickCapture.ts:27-41](components/CaptureWidget/session/clickCapture.ts#L27))
- Tray expands to show ticket list
- User sees "Session started" status bar with green live dot

### 1.4 User Hovers & Clicks Element

**Hover treatment** ([elementHighlighter.ts:8-11](components/CaptureWidget/session/elementHighlighter.ts#L8)):
- Single overlay div positioned fixed, z-index `2147483646` ([elementHighlighter.ts:79](components/CaptureWidget/session/elementHighlighter.ts#L79))
- Outline: `2px solid #5A49BF`, background: `rgba(37,99,235,0.1)`, border-radius: `4px`
- Updates on mousemove without React re-render

**Click**:
- Capture-phase listener fires, prevents default
- SessionFeedbackPopup appears ([SessionFeedbackPopup.tsx:40-59](components/CaptureWidget/SessionFeedbackPopup.tsx#L40))

### 1.5 Feedback Capture Popup

**Popup container**:
- Fixed center-screen: `left: 50%, top: 50%, transform: translate(-50%, -50%)`
- Max width: `min(380px, 92vw)`
- Background: `rgba(20,22,28,0.92)` (dark), blur 20px, border `1px solid rgba(255,255,255,0.08)`, radius 14px
- Box-shadow: `0 10px 30px rgba(0,0,0,0.35)`
- Z-index: `2147483647` (top of stack)

### 1.6 Recording State — Voice Capture

**Mic orb** ([MicOrb.tsx:22-44](components/CaptureWidget/MicOrb.tsx#L22)):
- 56px diameter, `linear-gradient(135deg, #ff3b3b, #ff5c5c)` (red)
- Shadow: `0 4px 20px rgba(0,0,0,0.25), 0 0 24px rgba(255,59,59,0.35)`
- Animation: `echly-mic-orb-breathing` 2.2s, breathes ±4% scale
- Ring overlay: scales 1.0–1.22× with audio level

**Keep recording pill** ([KeepRecordingPill.tsx:11-40](components/CaptureWidget/KeepRecordingPill.tsx#L11)):
- Appears when user pauses
- Enter animation: `echly-keep-pill-enter` 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) — bouncy
- Background: #FFFFFF, border `1px solid rgba(245,158,11,0.25)`, shimmer animation 3.5s

### 1.7 AI Structuring — Confirmation Card

After AI polishing completes:

**Confirmation card** ([ConfirmationCard.tsx:13-89](components/CaptureWidget/ConfirmationCard.tsx#L13)):
- Max-width: `min(360px, 92vw)`, padding 24px
- Background: `rgba(20,22,28,0.92)`, blur 20px, border `1px solid rgba(255,255,255,0.08)`
- Heading "I understood", title, description fields
- Buttons: "Confirm" (purple #5A49BF) | "Edit" (ghost border)
- Enter animation: opacity 0→1, y 8→0, 200ms [0.22, 0.61, 0.36, 1]

### 1.8 Ticket Added to Tray

**Feedback list** ([FeedbackList.tsx:14-35](components/CaptureWidget/FeedbackList.tsx#L14)):
- Vertical stack, gap 12px
- Each ticket: title (bold), description, timestamp, severity badge, tags
- Success animation: `echly-v2-succ-glow` 2.4s ease-out with green pulse

### 1.9 Session Tray — Expanded State

**Tray container**:
- Fixed bottom-right (`24px` edges)
- Width: `360px` responsive, max-height: 480px scrollable
- Background glass: `rgba(255,255,255,0.7)`, blur 20px, border 1px, shadow dual, radius 20px

**Footer** — SessionControlPanel:
- Status: live dot (green pulsing) + "Session started"
- Buttons: Pause (ghost) | End (danger red)

### 1.10 User Starts Another Capture

1. Click element → screenshot popup
2. Record/type → second AI ticket
3. Ticket added to tray
4. Session continues until "End Session" clicked

---

## Section 2: Tray & Feedback List — Pixel Spec

### 2.1 Header Chrome

The tray header frames the session and provides quick access to controls.

**Container**: Position fixed bottom-right 24px from both edges; z-index 50 (relative to other page elements); width responsive `min(360px, 90vw)`.

**Layout** (three columns):
- **Left column (workspace)**: 25px icon area | workspace name 14.5px 600wt #15101F, -0.008em letter-spacing, truncated with ellipsis; total left section width 100px
- **Middle column (page/title)**: Session or page title centered, 14.5px 500wt #54495F, max-width 150px with text-overflow ellipsis, -0.005em letter-spacing
- **Right column (actions)**: Ticket count badge, minimize button, close button, settings (when applicable); each button 32px × 32px

**Background & chrome**: `rgba(255,255,255,0.7)` with `backdrop-filter: blur(20px)`; border `1px solid rgba(0,0,0,0.04)`; border-radius 20px; box-shadow dual-layer (inset highlight + depth).

**Header height**: 52px (padding 16px vertical, 20px horizontal).

### 2.2 Ticket Row — Collapsed

Individual feedback card shown in the tray list.

**Layout**: Grid `51px 1fr auto` (icon | content | actions)

**Row structure**:
- **Height range**: 60–72px (padding 12px vertical, 12px horizontal = var(--sp-md))
- **Icon/thumb**: 34px × 34px square, border-radius 8px (var(--r-sm)), background `var(--surface-subtle)` (light gray), color `var(--muted)` (mid-gray), centered icon 14px × 14px, flex-shrink 0
- **Content (title + meta)**: Minimum width 0 (shrink-to-fit)
  - **Title**: 15px 600wt #15101F (var(--ink)), -0.008em letter-spacing, line-height 1.3, single line with text-overflow ellipsis, white-space nowrap
  - **Meta line** (appears below title, margin-top 1.5px): 13px color `var(--muted)` (#54495F), inline-flex with gap 7px, contains "X tag(s)" text + optional severity badge
- **Action buttons** (hidden by default, revealed on hover): Edit (14px icon) + Delete (14px icon), each 32px × 32px with 7px border-radius, opacity 0 → 1 on .ticket:hover

**Background**: Transparent by default, hover triggers `background: rgba(28, 25, 23, 0.04)`; transition 0.12s

**Gap between rows**: var(--sp-xs) = 6px; no border between rows

**Hover state**: Background rgba(28,25,23,0.04), action buttons fade in (opacity 0→1 over 150ms)

**Selected/active state**: Not yet implemented in collapsed view; reserved for future edit mode

### 2.3 Ticket Row — Expanded (Edit Mode)

When user clicks a ticket to edit, an overlay appears with full editing capabilities. The row data is displayed in a modal dialog, not inline expansion.

**Layout**: Modal overlay at z-index 2147483648, centered, semi-transparent dark backdrop `rgba(0,0,0,0.88)` (when viewing full-screen screenshot expansion)

**Field layout** (inside .editor-overlay):
- **Title field** (input): Font 15px 600wt, border-bottom 1px solid rgba(0,0,0,0.1) on focus, padding 12px 0, cursor text, no background color change
- **Screenshot** (if captured): Max-width 100%, max-height 240px, border-radius 8px, clickable to expand
- **Tags row**: Pills with X remove affordance; "+ Add tag" button shown when not editing

**Action buttons** (sticky bottom):
- **Save** (primary): Height 40px, padding 0 16px, border-radius var(--btn-r), background var(--ink) (#15101F), color white, 15px 600wt, box-shadow `0 3.5px 9px -2px rgba(28,25,23,0.25)`, hover darkens
- **Cancel** (secondary): Height 40px, padding 0 16px, background `var(--surface-subtle)` (light gray), color var(--ink), 15px 500wt, border 0, hover background `var(--surface-hover)`

**Animation**: No transition on field borders; focus state changes immediately

### 2.4 Empty State

Shown when session has no tickets yet or after clearing all feedback.

**Icon**: 41px × 41px square, border-radius 8px (var(--r-md)), background `var(--brand-soft)` (light purple), color `var(--brand)` (#5A49BF), centered 18px × 18px SVG icon (stack of papers graphic)

**Copy**:
- **Title** (exact string): "No feedback yet" — 15.5px 600wt #15101F (var(--ink)), -0.008em letter-spacing
- **Subtitle**: "Capture your first issue by clicking an element" — 13.2px color `var(--muted)` (#54495F), max-width 276px, line-height 1.4, text-wrap pretty

**Layout**: Flex column, centered, gap 12px, padding 48px 16px 32px (var(--sp-3xl) var(--sp-xl) var(--sp-2xl))

### 2.5 Loading/Processing States

Shown while AI is structuring feedback or fetching previous sessions.

**Visual treatment**: Centered loading animation overlay

**Icon wrapper**: 64px × 64px square, border-radius 18px, background `var(--brand-soft)` (light purple), grid place-items center, relative positioning

**Inner icon** (30px × 30px): Color `var(--brand)` (#5A49BF), animates with `echly-icon-float 2.4s ease-in-out infinite` (floats up/down ±3.5px over 2.4s with rotation)

**Ring pulse** (pseudo-element ::before): Positioned inset -7px from wrapper, border 2px solid `var(--brand)`, border-radius 23px, animates `echly-icon-ring 2s ease-out infinite` (scales 0.9→1.15, fades opacity 0.4→0)

**Loading text** (below icon):
- **Main copy** (exact): "Structuring your feedback…" — 15px 600wt #15101F, text-align center, max-width 322px, -0.01em letter-spacing
- **Animated dots** (below text): Three dots 6px diameter, background `var(--brand)`, gap 6px, each animates `echly-dot-pulse 1.4s ease-in-out infinite` with staggered delays (0s, 0.15s, 0.3s); opacity pulses 0.3 → 1 → 0.3

**Layout**: Flex column, centered, gap 18px, padding 41px 28px 51px, min-height 120px

**Duration**: Varies; timeout after 30s if network fails (fallback to error state, see Section 9)

### 2.6 Session Footer (SessionControlPanel)

Fixed position, bottom-center of screen, above the tray or on its own.

**Container**: Position fixed bottom 32px (28 × 1.15 scale factor), left 50% transform translateX(-50%), z-index 2147483646, pointer-events none

**Bar chrome**:
- Pointer-events auto (re-enabled for buttons)
- Background `rgba(20,22,28,0.82)` (very dark with slight transparency)
- Backdrop-filter `blur(24px) saturate(140%)` dual for strong frosted-glass effect
- Border-radius 999px (fully rounded pill shape)
- Padding 8px 8px 8px 24px (8px all sides except left 24px for breathing room)
- Inline-flex, align-items center, gap 16px
- Box-shadow: `inset 0 1px 0 rgba(255,255,255,0.08)` + `0 0 0 1px rgba(255,255,255,0.06)` + `0 18px 41px -12px rgba(0,0,0,0.5)` (three-layer depth)
- Color #fff (white text)
- White-space nowrap

**Status indicator** (left section):
- Inline-flex, align-items center, gap 12px
- **Live dot** (active state): 8px diameter circle, background #34C29A (bright teal), border-radius 50%, box-shadow `0 0 0 3px rgba(52,194,154,0.20)` (soft glow), animates `echly-v2-sc-live 2s ease-in-out infinite` (pulse effect), flex-shrink 0
- **Pause icon** (paused state): 9px × 9px circle with 1.5px border #FBBF24 (amber), two inner bars (1.5px × 5px each, amber), positioned inside at 1px from edges
- **Spinner** (saving state): 14px circular spinner, border 2px rgba(255,255,255,0.25), border-top #5b7cff, animates `echly-spin 0.7s linear infinite`
- **Status text**: 15px 500wt rgba(255,255,255,0.95), -0.005em letter-spacing (exact copy: "Session started" | "Session paused" | "Saving session…")

**Divider**: 1px × 18px vertical line, background rgba(255,255,255,0.12), flex-shrink 0

**Buttons** (right section):
- **Pause** (active state, ghost style): Height 36px, padding 0 16px, border-radius 999px, background transparent, color #fff, border 1px solid rgba(255,255,255,0.2), font-size 14px 600wt, -0.005em letter-spacing, inline-flex gap 8px, icon 11px × 11px (play triangle or pause bars)
- **Resume** (paused state, brand style): Same dimensions, background `var(--brand)` (#5A49BF), color white, no border
- **End** (danger style): Same dimensions, background rgba(229,72,77,0.1), color `var(--danger)` (#E5484D), border 1px solid var(--danger), hover background rgba(229,72,77,0.2)
- **Disabled state** (during save): Opacity 0.5, cursor not-allowed

**Animation of status dot**:
```css
@keyframes echly-v2-sc-live {
  0%, 100% { box-shadow: 0 0 0 3px rgba(52,194,154,0.20); }
  50% { box-shadow: 0 0 0 6px rgba(52,194,154,0.10); }
}
```

### 2.7 Scrolling Behavior

**Body scrolling**: The feedback list (max-height 380px inside tray) scrolls independently of page; flex: 1 min-height: 0 allows flex layout to compute scroll area.

**Scrollbar treatment**:
- Width 7px (webkit) thin (firefox)
- Scrollbar-thumb: background `var(--hair)` (subtle border gray), border-radius 999px
- Scrollbar-track: transparent (no background)
- Appears only when needed (overflow-y auto)

**Scroll fade**: No CSS fade gradients implemented; user sees full list with native scrollbar
---

## Section 3: Recording UI

### 3.1 Mic Orb (56px)

| Property | Value |
|----------|-------|
| Size | 56px diameter |
| Background | linear-gradient(135deg, #ff3b3b, #ff5c5c) |
| Box-shadow | 0 4px 20px rgba(0,0,0,0.25), 0 0 24px rgba(255,59,59,0.35) |
| Animation | echly-mic-orb-breathing 2.2s infinite ±4% scale |
| Ring | 1.5px rgba(255,255,255,0.18), scales with audio |

### 3.2 Recording Orb (72px)

| Property | Value |
|----------|-------|
| Size | 72px |
| Background | radial-gradient(circle at 30% 30%, #FF6B6B, #E10600) |
| Box-shadow | 0 0 0 6px rgba(255,0,0,0.08) |
| Listening | Scale 1.0–1.1× with audio, glow intensifies |
| Processing | Gray desaturated: radial-gradient(#6b6b6b, #4a4a4a) |

### 3.3 Waveform

- 4–6 bars, 3px wide, 2px gap
- Color: rgba(90,73,191,0.85) brand purple
- Animation: v2-wave 0.3–0.5s staggered scaleY 0.4–1.0

### 3.4 Timer

- 15px 600wt, color text-primary or overlay-dark-text
- Format: MM:SS, update 100ms

---

## Section 4: Confirmation Card

### 4.1 AI Eyebrow

**Text** (exact string from code): "I understood" — appears as heading above title and description list

**Typography**: 16px 600wt, color `var(--text-on-dark)` (white/light on dark bg), margin 0 0 16px, line-height 1.4

**Icon**: None in current implementation; eyebrow is text-only

**Spacing**: 0 bottom margin into list below

### 4.2 Title Field

**Default state rendering**:
- Font: 14px 600wt
- Color: `var(--text-on-dark)` (white/light)
- Line-height: 1.45
- Max-lines: Single line (no wrap in confirmation card)

**Edit-mode treatment**: When editing, border-bottom 1px appears; no background change; cursor text-color visible

**Placeholder text**: None in confirmation; field always populated after AI structuring

**Value**: Pulled from `ticket.title`, truncated if extremely long (max ~60 chars displayed)

### 4.3 Description Field

**Default state**:
- Font: 13px 500wt
- Color: `var(--text-tertiary)` (softer gray on dark)
- Margin-top: 6px
- Line-height: 1.4
- Max-lines: 2–3 lines (text-wrap pretty)

**Multi-line behavior**: Wraps naturally; no truncation in confirmation

**Auto-grow vs fixed**: Fixed height in confirmation; full scroll in edit mode

**Value**: Pulled from `ticket.description`, optional (not shown if empty/null)

### 4.4 Severity Selector

**Badge styling** (shown in row with title/meta):
- Shape: Pill (border-radius 4px)
- Height: ~18px
- Padding: 2px 8px
- Font: 12px 500wt

**Color mapping per level** (not shown in confirmation card; reserved for ticket row):
- **Critical**: Background rgba(220,38,38,0.1), text #DC2626
- **High**: Background rgba(229,72,77,0.1), text #E5484D  
- **Medium**: Background rgba(251,146,60,0.1), text #FB923C
- **Low**: Background rgba(107,114,128,0.1), text #6B7280

**Click behavior** (edit mode): No selector in confirmation; inherited from ticket type

### 4.5 Tags

**Pill styling**: Inline-flex, height ~20px, padding 2px 6px, background rgba(255,255,255,0.08), border-radius 4px, font 12px, color white, gap 4px between tag text and remove button

**Add affordance**: "+ Add tag" button (hidden by default; appears on edit or explicit focus)

**Remove affordance**: X icon (10px × 10px) on each tag, click removes immediately

**Differentiation**: No visual difference between AI-suggested and user-added; all tags editable

### 4.6 Metadata Block

**Layout**: Flex column, gap 8px (below description); font 11px monospace JetBrains Mono for technical info

**Label/value pairs** (if available):
- **URL**: "Page URL: https://example.com/path (truncated to 50 chars)"
- **Element selector**: "Element: div.button#submit (CSS selector)"
- **Browser/OS**: "Device: Chrome 120 • macOS Sonoma 14.1 • 2560×1440@2x"
- **Timestamp**: "Captured: 2025-05-21 14:32:15 UTC"

**Typography**:
- Labels: Color rgba(255,255,255,0.5), 10px 500wt
- Values: Color white, 11px 400wt, monospace

### 4.7 Action Buttons

**Container**: Flex row, gap 12px, flex-wrap wrap (buttons stack on small screens)

**Send/Confirm button**:
- **Background**: #5A49BF (brand purple)
- **Text color**: White
- **Padding**: 10px 18px
- **Border-radius**: 10px
- **Font**: 14px 600wt
- **Box-shadow**: `0 4px 12px rgba(21, 93, 252, 0.25)`
- **Hover**: scale(1.02) + shadow brightens
- **Tap/active**: scale(0.98)
- **Label**: "Confirm"
- **Icon**: None

**Discard/Edit button**:
- **Background**: rgba(255,255,255,0.08) (transparent light)
- **Text color**: `var(--text-on-dark)` (white)
- **Border**: 1px solid rgba(255,255,255,0.08)
- **Padding**: 10px 18px
- **Border-radius**: 10px
- **Font**: 14px 600wt
- **Hover**: scale(1.02)
- **Tap/active**: scale(0.98)
- **Label**: "Edit"
- **Icon**: Pencil (optional)

**Layout**: Flex gap 12px; buttons flow left-to-right, wrapping if needed

---

## Section 5: Animation CSS Verbatim

### 5.1 Breathing Orb

```css
@keyframes echly-mic-orb-breathing {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}
```

Applied to `.echly-mic-orb` with `animation: echly-mic-orb-breathing 2.2s infinite ease-in-out`.

### 5.2 Keep Pill Entry

```css
@keyframes echly-keep-pill-enter {
  0%   { transform: translateY(8px); opacity: 0; }
  100% { transform: translateY(0);   opacity: 1; }
}
```

Applied to `.echly-v2-keep-pill-anchor` with `animation: echly-keep-pill-enter 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both`.

The easing cubic-bezier(0.34, 1.56, 0.64, 1) produces a bouncy overshoot effect, with peak velocity at ~34% elapsed time.

### 5.3 Success Glow

```css
@keyframes echly-v2-succ-glow {
  0%   { background: rgba(24,121,78,0.16); box-shadow: inset 0 0 0 1.7px rgba(24,121,78,0.32); }
  70%  { background: rgba(24,121,78,0.06); box-shadow: inset 0 0 0 1.15px rgba(24,121,78,0.14); }
  100% { background: transparent; box-shadow: none; }
}
```

Applied to `.echly-v2 .ticket.success-flash` with `animation: echly-v2-succ-glow 2.4s ease-out forwards`. Ticket thumb also shows animated checkmark via:

```css
@keyframes echly-v2-succ-pop {
  0%   { transform: scale(0.6); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
```

Applied to `.echly-v2 .ticket-check` with `animation: echly-v2-succ-pop 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) both`.

### 5.4 Waveform

```css
@keyframes v2-wave {
  0%, 100% { transform: scaleY(0.4); }
  50% { transform: scaleY(1); }
}
```

Applied to each waveform bar with `animation: v2-wave 0.3–0.5s infinite`. Each bar receives a staggered `animation-delay`:
- Bar 1: 0s
- Bar 2: 0.08s
- Bar 3: 0.16s
- Bar 4: 0.24s
- Bar 5: 0.32s
- Bar 6: 0.40s

(Delay pattern repeats or varies per component implementation.)

### 5.5 Tray Expand/Collapse

The tray transitions from collapsed (showing only header) to expanded (showing full list).

**Expand**: max-height animates `0 → 480px` over 200–300ms with cubic-bezier(0.22, 0.61, 0.36, 1) (decelerate curve). Applied to `.pill-md` or tray container.

**Collapse**: max-height animates `480px → 0` over 200ms ease-out. Overflow hidden during transition.

Implementation uses CSS transitions, not framer-motion on extension side (app/globals.css only).

### 5.6 Confirmation Card Entry

Implemented in ConfirmationCard.tsx using framer-motion:

```javascript
initial={{ opacity: 0, y: 8 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.98 }}
transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
```

Opacity fades 0→1, position slides up 8px→0px, all over 200ms. Exit scales down 1→0.98 for subtle shrink.

### 5.7 Element Highlighter

When user hovers over a capturable element, the outline animates in:

**Hover highlight styles** (no animation keyframes; instant on hover):
- Outline: 2px solid #5A49BF
- Background: rgba(37,99,235,0.1)
- Border-radius: 4px

Updates on mousemove without transition; z-index 2147483646 ensures visibility over page content.

**Fade effect**: None; outline appears and disappears instantly as mousemove updates or session pauses.

### 5.8 Keep Pill Animations

Multiple supporting animations for keep-pill icon:

```css
@keyframes echly-keep-shimmer {
  0% { left: -60%; }
  35% { left: 120%; }
  100% { left: 120%; }
}
```

Applied to `.echly-keep-pill::after` (shimmer gradient), 3.5s ease-in-out infinite.

```css
@keyframes echly-keep-icon-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}
```

Applied to icon inside keep-pill, 3s ease-in-out infinite.

```css
@keyframes echly-keep-ring-pulse {
  0% { transform: scale(0.9); opacity: 0.5; }
  100% { transform: scale(1.15); opacity: 0; }
}
```

Applied to ring pseudo-element, 2.5s ease-out infinite.

```css
@keyframes echly-keep-sparkle-pop {
  0%, 100% { transform: scale(0); opacity: 0; }
  20% { transform: scale(1.3); opacity: 0.9; }
  40% { transform: scale(0.7); opacity: 0.5; }
  60% { transform: scale(0); opacity: 0; }
}
```

Applied to `.keep-sparkle` elements with staggered delays (0s, 0.5s, 1s).

### 5.9 Loading Animations

**Icon breathe**:
```css
@keyframes echly-icon-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}
```

Applied to `.echly-v2 .loading-icon-wrap`, 2s ease-in-out infinite.

**Icon float**:
```css
@keyframes echly-icon-float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-2px) rotate(1.5deg); }
  50% { transform: translateY(-3.5px) rotate(0deg); }
  75% { transform: translateY(-1.5px) rotate(-1.5deg); }
}
```

Applied to `.echly-v2 .loading-icon-wrap svg`, 2.4s ease-in-out infinite.

**Icon ring**:
```css
@keyframes echly-icon-ring {
  0% { transform: scale(0.9); opacity: 0.4; }
  100% { transform: scale(1.15); opacity: 0; }
}
```

Applied to `.echly-v2 .loading-icon-wrap::before`, 2s ease-out infinite.

**Dot pulse**:
```css
@keyframes echly-dot-pulse {
  0%, 60%, 100% { opacity: 0.2; transform: scale(0.85); }
  30% { opacity: 1; transform: scale(1); }
}
```

Applied to `.echly-v2 .loading-dots span`, 1.4s ease-in-out infinite, with staggered delays 0s / 0.15s / 0.3s.
---

## Section 6: Color Palette

| Component | Color | Hex | Use |
|-----------|-------|-----|-----|
| Brand Primary | Brand Purple | #5A49BF | CTA, active |
| Brand Hover | Darker | #4A3BA0 | Pressed |
| Text Heading | Ink | #15101F | Main text |
| Text Body | Gray | #54495F | Secondary |
| Text Tertiary | Soft | #8A8096 | Disabled |
| Text on Dark | Light | #F3F4F6 | Dark overlay |
| Surface | White | #FFFFFF | Glass |
| Surface Hover | Hover | #FAFAF7 | Button hover |
| Border | Border | #E5E7EB | Dividers |
| Border Subtle | Subtle | rgba(255,255,255,0.08) | Dark |
| Success | Green | #18794E | Positive |
| Danger | Red | #E5484D | Delete |
| Dark Overlay | Charcoal | rgba(26,26,26,0.92) | Modal |
| Recording Orb | Red Grad | #FF6B6B → #E10600 | Mic |
| Waveform | Brand Purple | rgba(90,73,191,0.85) | Bars |
| Amber (Keep) | Amber | #F59E0B | Pill icon |

---

## Section 7: Typography

| Element | Font | Size | Weight | Line-height | Letter-spacing |
|---------|------|------|--------|-------------|-----------------|
| Workspace | DM Sans | 14.5px | 600 | 1.4 | -0.008em |
| Page | DM Sans | 14.5px | 500 | 1.4 | -0.005em |
| Title | DM Sans | 15px | 600 | 1.45 | -0.01em |
| Description | DM Sans | 13px | 500 | 1.4 | 0em |
| Status | DM Sans | 15px | 600 | 1.2 | 0em |
| Button | DM Sans | 14px | 600 | 1.4 | -0.01em |
| Heading | DM Sans | 16px | 600 | 1.4 | 0em |
| Monospace | JetBrains Mono | 15px | 600 | 1.2 | 0em |

**Stack**: "DM Sans", "SF Pro Display", Inter, system-ui, sans-serif
**Smoothing**: `-webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility;`

---

## Section 8: The "Wow" Moment

A UX researcher testing a design tool's color accessibility feature notices a button doesn't meet WCAG AA contrast ratios. Rather than open a browser tab to document the issue or switch to Figma to create a screenshot, she uses Annote. Here's the storyboard:

**Setup**: The researcher is 45 minutes into a session with the tool open on the right monitor. She spots the button—a 14px light gray label on a slightly lighter background. The issue is critical for her accessibility audit, but switching tools would break flow. She reaches for the Annote icon in the top-right.

**First capture** (the visual beat):
1. **0s** — Click Annote icon → bottom-right tray slides in from off-screen (200ms expand animation, max-height 0→480px)
2. **0.2s** — Tray now visible; shows "Start Session" button, workspace name "Design Team", ticket count "0"
3. **0.3s** — User clicks "Start Session" → SessionControlPanel appears bottom-center with green live dot and "Session started" status
4. **0.5s** — Element highlighter attaches; hovering the button shows a 2px purple outline and light blue wash
5. **1.2s** — Click the button → SessionFeedbackPopup appears center-screen with comment cursor animation; user speaks: "This button label has insufficient contrast. It's 2 point 1 to 1 ratio, needs to be at least 4.5 to 1. Color should be shifted to carbon gray or darker."
6. **5.0s** — AI processes transcription (brief loading state with breathing icon)
7. **6.5s** — ConfirmationCard appears: title "Button contrast insufficient", AI-suggested severity "High", description auto-populated from transcript, with "Confirm" and "Edit" buttons
8. **7.0s** — Click "Confirm" → Card exits (scale 0.98, fade), tray shows new ticket with green success glow (2.4s animation), checkmark animates in (0.42s bouncy pop), then fades
9. **9.5s** — Ticket now visible in tray as collapsed row: icon + "Button contrast insufficient" title + "1 tag" meta

**Second capture** (accelerated rhythm):
1. Next issue: Design is missing focus indicators for keyboard navigation
2. Hover over input field → purple outline, click → recording popup with mic orb breathing
3. "Add focus rings to input fields" (3s dictation)
4. Keep Pill appears: "Keep going! We're handling this in the background" with floating lightning icon and shimmer (all visible while user continues testing)
5. Click next element → second feedback + ConfirmationCard
6. Confirm → second ticket added to tray with success animation

**Magic reveal** (end-of-session state):
- User clicks "End Session" button → both tickets now live in tray, each with page area metadata, timestamp, AI-suggested severity
- Session title shows "Design Tool Audit — 2 issues found"
- User hovers "Share Session" button → copy link to clipboard (copied state lasts 2s)
- Send link to dev lead over Slack

**Recipient experience**:
- Dev lead opens link in browser → dashboard loads with session details
- Sees both tickets with full context: exact page areas (crop boxes), device info (Chrome 120 macOS), timestamps, researcher's voice transcript (converted to summary), AI severity tags
- No "login required"—link is shareable; if not authenticated, can preview the session anonymously or request edit access
- Dev lead clicks first ticket → full-screen screenshot with red outline showing the button
- Can edit/resolve tickets inline or export to Linear/Jira

By the time the researcher finishes her audit (total 12 minutes), the dev lead has already triaged the issues—no email thread, no back-and-forth on what "the button" means, no screenshot attachments. The context is baked in.

---

## Section 9: Open Questions

1. Z-index 50 sufficient for 9999+ modals? (Consider escalation policy if customer modal is higher)
2. Dark mode auto-detect via prefers-color-scheme?
3. Region select visual feedback (border, handles)? Currently step 0 is manual element click; region capture would need different UX.
4. Sentiment source (transcript tone analysis)? Currently severity is inferred from keywords; ML tone classification not yet wired.
5. Waveform bar count (4, 6, 12)? Current implementation uses 4–6; no consumer-facing setting.
6. Recording max duration? Currently no limit enforced; server-side 30-minute session timeout applies.
7. CJK font fallback? DM Sans + system stack assumed; no explicit CJK font declared.
8. aria-live for "Saving session"? Currently uses text update in status label; no aria-live announcement on state change.
9. Network timeout >10s handling? Failed transcript → error state, user can retry or discard. Timeouts > 30s fallback to generic error. See Section 2.5 for details.
10. Screenshot resolution cap for high-DPI? Currently captured at device pixel ratio; no explicit downsampling. Firebase upload limit 10MB per screenshot.
11. Session persistence (all tabs or origin tab only)? Currently scoped to origin; navigating away from site loses active session state.
12. "Annote" label customization per workspace? Currently hardcoded; no per-workspace branding implemented.
13. **Keyframe name references without blocks**: Keep pill exit animation (`echly-keep-pill-exit`) — see Section 5.2 for full block. Tray expand CSS property (max-height transition) is in app/globals.css, not a named keyframe.
14. **Animation timing consistency**: Confirm card entry (200ms) vs keep pill entry (450ms) — different intentional speeds for different affordances. No unified timing framework.

---

**Specification complete.**