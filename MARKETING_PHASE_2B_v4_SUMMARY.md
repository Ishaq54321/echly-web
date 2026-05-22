# Marketing Phase 2B v4 — Forklifted Hero Capture Demo

**Date:** 2026-05-22
**Scope:** Replace v3's spec-driven hero stage with a forklift of the real
production capture flow. Pixel-faithful to the live extension, not to the
EXTENSION_DESIGN_SPEC.md (which is significantly out of sync with production).

---

## Key finding before the work began

The v4 prompt was written against EXTENSION_DESIGN_SPEC.md, which describes:

- A dark center-screen `SessionFeedbackPopup` with a screenshot + record/type buttons
- A "Structuring your feedback…" loading screen
- A "I understood" `ConfirmationCard` with Confirm/Edit buttons

**None of these three elements exist in the production extension.**

- `components/CaptureWidget/SessionFeedbackPopup.tsx` — dead code, not imported by `SessionOverlay.tsx`
- `components/CaptureWidget/ConfirmationCard.tsx` — dead code, only imported by the v3 demo
- "Structuring your feedback…" string — exists only in the spec and v3 marketing files; zero matches in production source

The real production popup is a **horizontal pill** (`lib/capture-engine/pill/CapturePill.tsx` + `VoicePillContent.tsx`) anchored near the clicked element — trash + rec dot + 00:03 timer + waveform + reset + send button. The "loading" treatment is just the send button morphing to a spinner (`isFinishing` → `Loader2` icon). After the send, the structured ticket drops straight into the tray.

**Decision (confirmed with Aakash before forklift):** Build the marketing demo
against the **real production flow**, not the spec. Skip the dead components.
This is documented up front so future readers don't go looking for forklifts
of components that intentionally weren't included.

---

## Forklift manifest

| Component | Source | Target | Source lines | Marketing lines | Type |
|---|---|---|---|---|---|
| CapturePill | lib/capture-engine/pill/CapturePill.tsx | annote/CapturePill.tsx | 328 | 263 | TSX forklift |
| VoicePillContent | lib/capture-engine/pill/VoicePillContent.tsx | annote/VoicePillContent.tsx | 165 | 139 | TSX forklift |
| PillHintText | lib/capture-engine/pill/PillHintText.tsx | annote/PillHintText.tsx | 173 | 112 | TSX forklift |
| Waveform | lib/capture-engine/pill/Waveform.tsx | annote/Waveform.tsx | 63 | 73 | TSX forklift |
| SelectedElementOverlay | lib/capture-engine/pill/SelectedElementOverlay.tsx | annote/SelectedElementOverlay.tsx | 77 | 48 | TSX forklift |
| SessionControlPanel | components/CaptureWidget/SessionControlPanel.tsx | annote/SessionControlPanel.tsx | 85 | 99 | TSX forklift |
| FeedbackItem | lib/capture-engine/core/FeedbackItem.tsx (lines 1-166 — collapsed row only) | annote/FeedbackItem.tsx | 166 (of 547) | 178 | TSX forklift |
| PillErrorContent | lib/capture-engine/pill/PillErrorContent.tsx | annote/PillErrorContent.tsx | 293 | 36 | Stub (unreachable in demo) |
| ElementHighlighter | components/CaptureWidget/session/elementHighlighter.ts | annote/ElementHighlighter.tsx | 104 | 56 | Reproduced from imperative source |
| ExtensionTray | lib/capture-engine/core/CaptureWidget.tsx (extracted hierarchy L751-1500) | annote/ExtensionTray.tsx | n/a | 166 | Built fresh (no source component) |
| HeroCaptureDemo (orchestrator) | n/a — built fresh | demos/HeroCaptureDemo.tsx | n/a | 310 | Built fresh |

Total: 1,480 lines of TSX in the marketing tree.

---

## Why each "Built fresh" file is built fresh, not forklifted

### ExtensionTray.tsx

There is no React component in the codebase that composes the tray as a standalone unit. The real tray is assembled inside `lib/capture-engine/core/CaptureWidget.tsx` (1500+ lines, deeply coupled to the capture engine), spread across multiple `extensionMode`/`showHomeScreen`/`sessionMode` conditional branches.

The wrapper I built reproduces the **non-extension/legacy session view** hierarchy (CaptureWidget.tsx L1402-1504), which is the simplest path that produces the same visual output:

```
.echly-sidebar-container
  ↳ .echly-sidebar-surface
      ↳ .echly-sidebar-header.echly-session-header (replaces CaptureHeader)
      ↳ .echly-sidebar-body
          ↳ .echly-v2 (so .ticket / .ticket-* CSS rules resolve)
              ↳ .echly-feedback-list-scroll
                  ↳ .echly-feedback-list
                      ↳ <FeedbackItem>  (the .ticket row, forklifted)
```

Every className on every div is sourced from `app/globals.css`. The structural composition is hand-typed but the visual treatment is 100% supplied by the CSS forklift.

### ElementHighlighter.tsx

The source (`components/CaptureWidget/session/elementHighlighter.ts`) is **imperative DOM manipulation** — it creates a `<div>` via `document.createElement`, sets `cssText`, and updates `left/top/width/height` on `mousemove`. It's not a React component, so it can't be forklifted with a JSDoc-and-strip pass.

Per the v4 prompt's allowed exception, I extracted the exact visual values (`HIGHLIGHT_STYLE.outline = "2px solid #5A49BF"`, `background: rgba(37,99,235,0.1)`, `border-radius: 4px`) and built a React component with the same visual output. The element's geometry is driven by a static `rect` prop from the orchestrator (the demo's faux site CTA doesn't move, so no mousemove tracking is needed).

### HeroCaptureDemo.tsx (orchestrator)

Pure orchestration code — state machine via `useReducer`, IntersectionObserver, `prefers-reduced-motion`, sine-wave mock audio levels. No source to forklift from. Composes all the forklifted production components and drives their visual state via props.

---

## Diffs against source (the byte-faithful verification)

All forklifted components have a JSDoc header documenting modifications.
Below are the `diff` summaries — the noise from the JSDoc header is large
but the actual *code* changes are small. Each diff fits the pattern:
"removed imports, stripped 1-2 hooks, stubbed handlers."

### CapturePill.tsx

**Lines removed from source:**
- `import { computePillPosition } from "./pillAnchoring";` (1)
- `import { useRecordingTimer } from "./hooks/useRecordingTimer";` (1)
- `import type { VoiceCaptureError } from "../core/types";` (1)
- `import { createPortal } from "react-dom";` (1)
- `safeZone` `useMemo` block (24 lines, L118-136 in source)
- `viewport` state + resize listener (8 lines, L100-110)
- `pillPosition` `useMemo` block (15 lines)
- `pillStyle` `useMemo` block (10 lines)
- Escape-key `useEffect` (10 lines, L182-192)
- `createPortal(content, portalTarget)` → return `content` directly

**Lines changed:**
- `targetElement: HTMLElement | null` → `targetRect: { top, left, width, height } | null`
- `analyser: AnalyserNode | null` → removed (replaced with `waveformLevels` passed through)
- `mode === "text"` branch still uses `<TextPillContent>` → replaced with `<TextPillContentStub />` (the demo loop never enters text mode)

**Lines preserved verbatim:** `shake` state + 500ms setTimeout, `retryAttemptsRef`, `errorType` useMemo (entire 14-line branch), `errorHintMessage` useMemo, `hintState`, `showError` computation, every JSX node from `<SelectedElementOverlay>` through the closing `</div>`, every inline style object.

### VoicePillContent.tsx

**Lines removed from source:**
- `import { useAudioLevels } ...` (indirect via Waveform — removed there)
- Mic enumeration `useEffect` (22 lines, L56-77)
- `micDevices` state + `MicDevice` interface
- `MicSelectorPopover` import + render block (13 lines)
- `PillTooltip` wrapper components (the demo doesn't need hover tooltips; the wrapped buttons render with the same className)

**Lines preserved verbatim:** `sendingRef` double-submit guard, `handleSend`, the `useEffect` that resets the guard when `isFinishing` flips, every JSX element from the mic button to the send button (including the `<Loader2>` morph), every className, every Lucide `<Mic>/<Type>/<Trash2>/<RotateCcw>/<Send>` icon with its `size`/`strokeWidth` values.

### PillHintText.tsx

**Lines removed from source:**
- `sessionStorage` "show once" tracker (3 helpers + 2 `useEffect`s, ~50 lines)
- `AUTO_DISMISS_MS` / `FADE_OUT_BEFORE_MS` constants
- `markSessionShown` / `readSessionShown` helpers

**Lines preserved verbatim:** `VOICE_COPY` / `TEXT_COPY` records (every primary/secondary string), the error-state branch, the text-mode branch, the voice-mode branch (including the `<span className="echly-pill-hint-pulse">`), every className.

### Waveform.tsx

**Lines removed from source:**
- `import { useAudioLevels } from "../core/hooks/useAudioLevels"` (1)
- `useAudioLevels(source, { barCount })` call → replaced with `levels: number[]` prop

**Lines preserved verbatim:** The bar `map` rendering, the `Math.max(3, Math.min(effectiveHeight, level * effectiveHeight))` sizing formula, the className composition (`echly-pill-waveform` + `echly-pill-wave-bar`), the inline style construction.

### SelectedElementOverlay.tsx

**Lines removed from source:**
- The rAF tick loop (~12 lines, L43-47)
- The ResizeObserver (~4 lines, L49-51)
- The `updatePosition` rect-reading function (replaced with static prop reading)

**Lines preserved verbatim:** The className (`echly-selected-overlay`), `data-annote-ui="true"`, `aria-hidden="true"`, the `position: fixed` → `absolute` is the only inline-style adaptation (the demo's stage container is positioned, not the viewport).

### SessionControlPanel.tsx

**Lines preserved verbatim:** Every className, every conditional branch (isSaving/isPaused/live), every SVG path, every `strokeWidth`, the `data-annote-ui="true"` attribute, the entire button-row layout. The only "modification" is making `onPause/onResume/onEnd` optional with no-op defaults.

This file is the closest to a true byte-for-byte forklift in the set — the source had only `React` as an import and no business-logic hooks.

### FeedbackItem.tsx

**Lines removed from source:**
- The lazy `DescriptionEditor` import + `Suspense` block (only used by the omitted `TicketEditorOverlay`)
- `parseDeviceInfo` / `formatLocalDateTime` / `tryBuildScreenshotUrl` helpers (only used by the omitted editor overlay)
- `getTicketIconFromTags` import (pulls in heavy taxonomy constants); replaced with an `IconComponent: LucideIcon` prop
- The entire `TicketEditorOverlay` export (lines 167-547 in source) — the demo loop never opens the editor

**Lines preserved verbatim:** `priorityFromType` (the regex), the `highlighted` 1200ms timeout, `handleDelete`, `handleRowClick`, `handleRowKeyDown`, every JSX node from the `.ticket` wrapper through the action buttons, every SVG path, every className.

### PillErrorContent.tsx

This is a **stub**, not a forklift. The demo loop never enters an error state (voiceError stays null throughout), so this component is never rendered. The stub satisfies the type contract of `CapturePill`'s `showError` branch.

If the demo ever needs to show an error UI, this file should be replaced with a real forklift of the source component (293 lines, includes Lucide icons, browser-detection helpers, and a mic-permission instruction card).

---

## CSS forklift

Added ~1057 lines of CSS to `app/(marketing)/_styles/marketing.css` under the
`.marketing-root` selector scope. Every `.echly-*` and `.ticket-*` class referenced
by a forklifted component is now defined in marketing.css.

**Class families forklifted:**

| Family | Source range in globals.css | Notes |
|---|---|---|
| Design tokens (--glass-*, --text-*, --transition-fast, --shadow-*) | L2096-2165 + styles/tokens.css L396-418 | Added to .marketing-root for the forklifted classes |
| `.echly-spinner` + @keyframes echly-spin | L1875-1885 | |
| `.echly-shake` + @keyframes | L3360-3367 | |
| `.echly-sidebar-container`, `.echly-sidebar-surface` + `::before` | L2214-2265 | |
| `.echly-sidebar-header`, `-left`, `.echly-sidebar-title` | L2266-2289 | |
| `.echly-header-actions`, `.echly-header-mode-toggle`, `.echly-header-icon` | L2291-2321 | |
| `.echly-sidebar-ticket-count`, `.echly-session-header/-title-wrapper/-title-text/-icons` | L2330-2399 | |
| `.echly-sidebar-close` | L2453-2471 | |
| `.echly-sidebar-body` + scrollbar pseudos | L2536-2559 | scrollbar colors adapted from rgba(255,255,255,*) → rgba(0,0,0,*) for the marketing's light background |
| `.echly-feedback-list`, `.echly-feedback-processing` (+ spinner, text) | L2560-2616 | |
| `.echly-empty-session-state`, `.echly-empty-session-text` | L2618-2625 | |
| `.echly-v2` tokens block | L6485-6522 | All --sp-*, --r-*, --brand/--ink/--muted/--soft/--good etc. |
| `.echly-v2 .ticket` + ticket-thumb/--highlighted/-main/-title/-meta/-actions/-action-btn | L8533-8639 | |
| `.echly-v2 .ticket.success-flash` + @keyframes echly-v2-succ-glow | L8694-8702 | |
| `.echly-sc-root` + .sc-bar/-status/-divider/-btn (ghost/brand/danger/disabled)/-stop-sq/-spinner + live/paused dots | L9093-9252 | Position changed from fixed to absolute so the SC pill sits inside the demo stage |
| @keyframes echly-v2-sc-live, echly-v2-sc-spin | L9255-9261 | |
| `.echly-pill-root` + tokens (--pill-brand etc.) + @keyframes echly-pill-enter | L10730-10762 | Position changed from fixed to absolute |
| `.echly-selected-overlay` + @keyframes echly-selected-appear | L10768-10805 | Position changed from fixed to absolute |
| `.echly-pill-hint` family (-dark, -dismissing, -pulse, -secondary, -error-primary) + @keyframes echly-pill-hint-fade-in/out, echly-pill-heartbeat | L10814-10875 | |
| `.echly-pill-content` (+ --voice/--text/--shake hover/focus-within) + @keyframes echly-pill-shake | L10884-10926 | |
| `.echly-pill-icon-btn` (+ :hover/:active/:disabled) | L10929-10949 | |
| `.echly-pill-action` (+ hover-reveal logic) | L10957-11000 | |
| `.echly-pill-divider` (+ hover-reveal logic) | L11006-11030 | |
| `.echly-pill-rec-dot`, `.echly-pill-timer` | L11033-11050 | |
| `.echly-pill-waveform`, `.echly-pill-wave-bar` | L11053-11070 | |
| `.echly-pill-send-btn` (+ :hover/:active/:disabled, .is-loading + spinner) | L11073-11111 | |
| `.hcd*` (orchestrator + faux site + anchors) | n/a — new | |

**Keyframes copied verbatim** (16 total): `echly-spin`, `echly-shake`, `echly-v2-succ-glow`, `echly-v2-sc-live`, `echly-v2-sc-spin`, `echly-pill-enter`, `echly-selected-appear`, `echly-pill-hint-fade-in`, `echly-pill-hint-fade-out`, `echly-pill-heartbeat`, `echly-pill-shake`.

**Adaptations applied** (only where strictly necessary, all documented inline):
- `position: fixed` → `position: absolute` on `.echly-pill-root`, `.echly-selected-overlay`, `.echly-sc-root` so they sit inside the demo stage instead of the viewport
- `z-index: 2147483646/7` → low z-indices (12-14) — the demo is a self-contained stage, doesn't need to beat 9999+ modals
- `.echly-sidebar-body` scrollbar thumb color: `rgba(255,255,255,*)` (dark UI assumption) → `rgba(0,0,0,*)` for marketing's light background

**Skipped from globals.css** (not referenced by forklifted components, so not copied):
- All `.echly-mic-permission-*` rules (293-line PillErrorContent isn't reached in demo)
- All `.echly-v2 .pill-*` rules (upgrade screen, command panel, mode selection — not in demo)
- All `.echly-feedback-list-scroll` rules → none exist beyond inline `style`
- Dashboard / session-page sidebar / dark-mode variants

---

## Faux website description

**What was built:** A generic SaaS landing page mockup with:
- Header bar: abstract gradient logo, three nav items ("Product", "Pricing", "About"), dark "Sign up" CTA
- Hero section: "Build better software" headline, generic body paragraph, dark "Get started free" CTA (this is the ElementHighlighter target)
- Feature grid: four empty placeholder tiles below

**De-emphasis treatment** (applied to `.hcd-faux`):
- `filter: blur(2px) saturate(0.7)` — readable structure, muted colors
- `opacity: 0.55` — heavily faded
- Vignette overlay (`.hcd-vignette`): `radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.20) 100%)` + a flat `rgba(0,0,0,0.10)` tonal layer

**Why it doesn't read as a dashboard:**
- No "Workspace · Brandname" labels
- No fake metrics / data tiles
- No internal app chrome (sidebar, top bar with workspace switcher)
- No Annote-style purple accents (only neutral grays + a dark CTA)
- System UI font (Inter/system-ui) instead of DM Sans, so it reads as a different product

**Selective un-blur:** When the ElementHighlighter is active on the CTA, the
`.hcd.is-highlighted .hcd-faux-cta` selector applies a slightly stronger
`box-shadow` to focus the eye on the target element. (The current
implementation doesn't selectively un-blur because the faux site is one
contiguous filter target; if Aakash wants the highlighted element to fully
un-blur, we'd need to lift the CTA out of `.hcd-faux` into a separate sibling
layer.)

---

## Demo orchestration timeline

| Time (ms) | Frame | What's visible |
|---|---|---|
| 0 | idle | Faded faux website + collapsed tray (off-screen) |
| 600 | session-active | + SessionControlPanel slides up + tray fades in |
| 1400 | cursor-moving | (cursor visual omitted; transitions to highlighter) |
| 2000 | highlighted | + ElementHighlighter appears on the CTA |
| 2400 | recording | + CapturePill anchors near CTA with mic/timer/waveform/send + "We're listening" hint |
| 6400 | sending | Send button morphs to spinner (`isFinishing`) |
| 7400 | landed | Ticket appears in tray with `success-flash` animation |
| 9400 | hold | Final composition holds |
| 9900 | crossfade | Brief fade |
| 10500 | (loop restart) | Back to idle |

**IntersectionObserver:** Pauses the timeline when the demo is scrolled off-screen.
**prefers-reduced-motion:** Jumps to and freezes on the `landed` frame.

---

## Verification

| Check | Result |
|---|---|
| `npx tsc --noEmit` | Clean — 0 errors |
| `pnpm build` | Clean — production build succeeds, 53 routes generated |
| Forbidden-import greps (5 patterns from v4 prompt) | All 0 matches |
| `useWorkspace` / `useAuthState` / `onAuthStateChanged` greps | All 0 matches |

### Grep results

```
$ grep -r "from ['\"]@/lib/firebase" app/(marketing)/                → 0
$ grep -r "from ['\"]@/lib/client/workspaceContext" app/(marketing)/  → 0
$ grep -r "from ['\"]@/lib/server" app/(marketing)/                   → 0
$ grep -r "from ['\"]@/components/providers" app/(marketing)/         → 0
$ grep -r "useWorkspace" app/(marketing)/                             → 0
$ grep -r "useAuthState" app/(marketing)/                             → 0
$ grep -r "onAuthStateChanged" app/(marketing)/                       → 0
```

### Bundle size

The Next 16 / Turbopack production-build output table on this project does
not print the size column (same Windows quirk reported in Phase 2B v1/v3 —
the `Size` and `First Load JS` columns are blank for *all* routes). The
compilation itself completes without errors and `/` is properly registered
(`ƒ /`).

A precise number requires a Vercel deploy preview or a separate
`@next/bundle-analyzer` run. The new code is a single client component
graph (~1,480 lines of TSX with no new dependencies — only `lucide-react`,
which is already in `package.json`), so the delta vs Phase 2A is bounded.

### CSS class resolution check

Every className used in the forklifted components now has a corresponding
CSS rule scoped under `.marketing-root` in marketing.css. Spot-checked
classes: `.echly-pill-root`, `.echly-pill-content--voice`, `.echly-pill-rec-dot`,
`.echly-pill-waveform`, `.echly-pill-wave-bar`, `.echly-pill-hint--dark`,
`.echly-selected-overlay`, `.echly-sc-root`, `.sc-bar`, `.sc-status .live`,
`.echly-sidebar-container`, `.echly-sidebar-surface`, `.echly-feedback-list`,
`.echly-v2 .ticket`, `.echly-v2 .ticket-thumb--highlighted`, `.echly-v2 .ticket.success-flash`.

The two classes that wouldn't resolve to anything specific are
`.echly-feedback-list-scroll` (no dedicated rule exists in globals.css — it's
purely styled by inline `style={{ overflowY: "auto" }}` in the source) and
`.echly-pill-content--shake` (preserved on the source side as a `className`
swap on the inner div; the demo doesn't trigger shake because there are no
retry failures, but the class + keyframe are forklifted in case future demo
state turns it on).

---

## Outstanding judgment calls and open questions

1. **PillErrorContent is a stub, not a forklift.** The 293-line source uses
   browser detection, mic-permission instructions, and Lucide icon stacks.
   The demo loop never reaches `errorType != null`, so a real forklift is
   wasted code. If the demo ever needs to show an error UI, this stub should
   be replaced with the real component.

2. **The faux site CTA doesn't selectively un-blur** when the highlighter
   appears on it. The current implementation only thickens its `box-shadow`.
   To get a true un-blur, the CTA would need to be lifted out of
   `.hcd-faux` (which has the `filter: blur(2px)` on the whole subtree) into
   a separate sibling layer that isn't blurred. Worth doing if the demo
   feels visually flat in the recording beat.

3. **No cursor visual.** The original v3 prompt mentioned a cursor that
   moves toward the CTA before the click. I omitted it because the
   ElementHighlighter appearing on the CTA already telegraphs "this element
   was clicked"; adding an SVG cursor adds visual noise without adding
   information. Easy to add back if Aakash wants the original storyboard.

4. **Recording duration is 4 seconds** in the demo (2400ms → 6400ms = 4s).
   Long enough to read the timer ticking and see the waveform breathing.
   Adjust by changing the TIMELINE constant in HeroCaptureDemo.tsx.

5. **No tray ticket actions in landed frame.** The .ticket-actions edit/delete
   buttons are present in the JSX (forklifted from FeedbackItem) but are
   `opacity: 0` until `.ticket:hover` — and the demo doesn't simulate hover.
   This is faithful to the source: at rest, ticket rows show only icon +
   title + meta.

6. **ExtensionTray uses the non-extension/legacy hierarchy** (CaptureWidget.tsx
   L1402-1504), not the `.echly-v2 .pill` extension home-screen hierarchy
   (L866+). The legacy hierarchy is simpler and produces the same
   visual output for the demo's purposes. The full extension hierarchy
   includes a command panel, mode tiles, and footer that the demo doesn't
   need.

7. **PillTooltip wrappers were stripped** from VoicePillContent. The source
   wraps the mic and type buttons in `<PillTooltip content="Select mic">`
   etc., which renders a hover-tooltip popover. The demo doesn't need
   hover tooltips, and the wrappers don't change the wrapped element's
   className. If a future demo wants tooltips on hover, PillTooltip should
   be forklifted (it's a ~60-line presentational component).

---

## File-by-file changes

### New files

- [app/(marketing)/_components/demos/annote/CapturePill.tsx](app/(marketing)/_components/demos/annote/CapturePill.tsx) — forklifted root pill container
- [app/(marketing)/_components/demos/annote/VoicePillContent.tsx](app/(marketing)/_components/demos/annote/VoicePillContent.tsx) — forklifted recording bar
- [app/(marketing)/_components/demos/annote/PillHintText.tsx](app/(marketing)/_components/demos/annote/PillHintText.tsx) — forklifted "We're listening" hint
- [app/(marketing)/_components/demos/annote/Waveform.tsx](app/(marketing)/_components/demos/annote/Waveform.tsx) — forklifted bar renderer (driven by mock levels)
- [app/(marketing)/_components/demos/annote/SelectedElementOverlay.tsx](app/(marketing)/_components/demos/annote/SelectedElementOverlay.tsx) — forklifted persistent outline
- [app/(marketing)/_components/demos/annote/SessionControlPanel.tsx](app/(marketing)/_components/demos/annote/SessionControlPanel.tsx) — forklifted bottom-center pill
- [app/(marketing)/_components/demos/annote/FeedbackItem.tsx](app/(marketing)/_components/demos/annote/FeedbackItem.tsx) — forklifted .ticket row
- [app/(marketing)/_components/demos/annote/PillErrorContent.tsx](app/(marketing)/_components/demos/annote/PillErrorContent.tsx) — stub (unreachable in demo)
- [app/(marketing)/_components/demos/annote/ElementHighlighter.tsx](app/(marketing)/_components/demos/annote/ElementHighlighter.tsx) — reproduced from imperative source per allowed exception
- [app/(marketing)/_components/demos/annote/ExtensionTray.tsx](app/(marketing)/_components/demos/annote/ExtensionTray.tsx) — built fresh (no source component to forklift)
- [app/(marketing)/_components/demos/HeroCaptureDemo.tsx](app/(marketing)/_components/demos/HeroCaptureDemo.tsx) — orchestrator (state machine + IntersectionObserver + reduced-motion)

### Modified files

- [app/(marketing)/_components/sections/Hero.tsx](app/(marketing)/_components/sections/Hero.tsx) — points to the new HeroCaptureDemo
- [app/(marketing)/_components/demos/index.ts](app/(marketing)/_components/demos/index.ts) — exports HeroCaptureDemo
- [app/(marketing)/_styles/marketing.css](app/(marketing)/_styles/marketing.css) — removed v3's 1032-line `.hcd-*`/`.nw-*` block; appended ~1057-line forklift block under `.marketing-root` scope

### Deleted files / directories

- `app/(marketing)/_components/demos/annote/` — v3's spec-driven recreations (8 files)
- `app/(marketing)/_components/demos/northwind/` — v3's Northwind dashboard mock (1 file)
- v3's `HeroCaptureDemo.tsx` (replaced by the new one with the same name)

---

## What v4 deliberately did NOT do

- Did not forklift `ConfirmationCard.tsx` (dead in production — only imported by v3 demo)
- Did not forklift `SessionFeedbackPopup.tsx` (dead in production — not imported by SessionOverlay)
- Did not invent a "Structuring your feedback…" loading state (string doesn't exist in production source)
- Did not show a dark center-screen popup or a confirmation step (neither is in the real production flow)
- Did not paste the spec's storyboard verbatim into the orchestrator (the spec's storyboard describes UI that doesn't exist)

If a future phase decides the demo should sell the *spec's vision* rather than
the *current production*, the dead components are still in
`components/CaptureWidget/` and `lib/capture-engine/` for a reborn forklift.
