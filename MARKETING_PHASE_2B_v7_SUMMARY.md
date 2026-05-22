# Marketing Phase 2B v7 — Polish Pass

**Date:** 2026-05-22
**Scope:** Six targeted polish fixes on top of v6's interactive showcase. No
architecture changes, no new components. The forklifted real components and the
v4/v5 copied CSS are untouched.

> ⚠️ A note on the prompt's code snippets: v6's actual `HeroCaptureDemo` drives
> the sequence with a single chained-`setTimeout` loop over a `PHASE_ORDER`
> array (not the three discrete `setTimeout`s the prompt sketched), and the real
> `SpeechCaption` takes `state`/`transcript` props (not the `visible`/`position`
> shape the prompt sketched). I implemented the prompt's *intent* against the
> real code rather than pasting the illustrative snippets. Behavior matches the
> spec.

---

## The six fixes

### Fix 1 — Taller demo stage (560px → 720px)

[marketing.css:4416](app/(marketing)/_styles/marketing.css#L4416): `.hcd` height
`560px → 720px`, `min-height 480px → 600px`. This is the single source of truth —
there are no responsive overrides of `.hcd` height.

**No inner element changed size.** They're all absolutely anchored and just sit
in more room:
- ExtensionTray — `.hcd-tray-anchor { bottom: 22px; right: 22px }` unchanged; tray
  sits lower because the stage is taller.
- SessionControlPanel — `.hcd-sc-anchor .echly-sc-root { bottom: 24px }` unchanged.
- FauxSite — `.fs-hero` is `flex: 1; align-items: center`, so the hero content
  stays the same size and centers vertically in the ~160px of extra canvas
  (more whitespace above/below; no stretch/distortion). Logo strip + feature
  cards keep their fixed paddings below the hero.
- EditModal — centered in `.hcd-modal-anchor` (`inset: 0`), same dimensions.
- Pill / caption — same size; pill positioning math's stage-height fallback
  bumped `560 → 720` in three spots in `HeroCaptureDemo.tsx` (lines 309, 422) so
  the flip-above heuristic is correct before the ResizeObserver fires.

**Layout below the demo:** the hero is a *stacked* layout (centered copy on top,
stage below) — not a two-column grid — so the taller stage just adds ~160px to
the hero's total height, pushing Get The Suite / Trust Strip down by that amount.
This reads as more breathing room, not imbalance. **Not flagged for pause** — the
shift is within tolerance.

### Fix 2 — Compress sending → modal to ~500ms (was ~2400ms)

[HeroCaptureDemo.tsx:66-94](app/(marketing)/_components/demos/HeroCaptureDemo.tsx#L66):

| Phase | v6 | v7 | Visual |
|-------|----|----|--------|
| sending | 800ms | **200ms** | quick send-spinner flash (`isFinishing`) |
| ticket-lands | 1200ms | **300ms** | pill exits + modal fades in + ticket slides into tray w/ glow, **all concurrent** |
| modal-opens | 400ms | **removed** | folded into ticket-lands |
| **send → modal total** | **~2400ms** | **~500ms** | |

**How the concurrency works** (the real change, since this is a single-phase
state machine):
- `modal-opens` was dropped from `PHASE_ORDER`; `ticket-lands` is now the final
  phase (300ms), after which the state flips to `modal-open` and holds.
- `isModalVisible` is now true during `ticket-lands` too
  ([HeroCaptureDemo.tsx:289](app/(marketing)/_components/demos/HeroCaptureDemo.tsx#L289)),
  so the modal renders the instant the ticket lands — pill/caption unmount
  (`isPillVisible` excludes `ticket-lands`) exactly as the modal fades in.
- The success glow fires via `highlightTicketId` at the start of `ticket-lands`
  and self-clears after ~1.2s (FeedbackItem's existing one-shot), finishing while
  the modal is open.
- The captured ticket now **persists in the tray behind the held-open modal**
  ([HeroCaptureDemo.tsx:298-307](app/(marketing)/_components/demos/HeroCaptureDemo.tsx#L298)) —
  `showCaptured` extends into `modal-open` when the modal is the freshly-captured
  ticket — so the user sees "the new ticket is there with a fading green tint."
  It's removed only on return to idle, so repeated clicks stay clean.

No visual conflict observed between the glow and the modal: the glow is behind
the backdrop dim and subtle. **Not flagged for pause.**

### Fix 3 — Selection rectangle padding (7px outset)

[ElementHighlighter.tsx:36-58](app/(marketing)/_components/demos/annote/ElementHighlighter.tsx#L36):
`HIGHLIGHT_OUTSET = 7`; top/left shifted `-7`, width/height `+14`. The frame now
sits 7px outside the element's bounding box on each side — a deliberate
"selection frame" rather than a tight trace. The pill still anchors to the
element's true rect (`demo.rect`), so only the highlight grows.

### Fix 4 — Simplified speech caption

[SpeechCaption.tsx](app/(marketing)/_components/demos/annote/SpeechCaption.tsx)
rewritten to a single transcript row:
- Removed the "We're listening · just speak naturally" header + red dot entirely.
- Caption now appears at the **start of `pill-in`** (alongside the pill), not at
  `listening` — `isCaptionVisible` extended to `pill-in/listening/transcribing/sending`
  ([HeroCaptureDemo.tsx:279](app/(marketing)/_components/demos/HeroCaptureDemo.tsx#L279)).
- Transcript begins typing **~800ms after the caption appears**
  (`typingDelayMs = 800`) — a natural transcription-lag beat.
- A blinking caret (`.speech-caption-cursor`) follows the last typed word and
  **disappears once the full transcript lands** (`showCaret = revealed > 0 && !isComplete`).
- Caption persists through `sending` (state maps `sending → "transcribing"` so the
  words don't reset) and unmounts when the modal opens.

CSS [marketing.css:3901-3960](app/(marketing)/_styles/marketing.css#L3901): old
`.demo-caption*` block replaced with `.speech-caption*` — glass container kept,
padding tightened to `14px 18px`, radius `12px`, `pointer-events: none` (Fix 5),
`opacity: 0 → 1` fade-in (`speech-caption-fade-in` 200ms), and the caret blink
keyframe. Word-reveal slide transition retained. Reduced-motion block updated to
reference the new class names.

**Not flagged for pause** — the single transcript line with the typing caret
reads as a proper live caption, not too sparse.

### Fix 5 — Pill no longer reacts to hover

[HeroCaptureDemo.tsx:386](app/(marketing)/_components/demos/HeroCaptureDemo.tsx#L386):
`pillStyle={{ position: "relative", pointerEvents: "none" }}` — the forklifted
hover CSS in marketing.css is left intact; it simply never fires because the pill
root has pointer events disabled. The mic/text/extra-action icons no longer
reveal on hover. The SpeechCaption also gets `pointer-events: none` (in its CSS).
Tray + SessionControlPanel `pointer-events` left alone (still clickable).

### Fix 6 — Verify & tighten

Walked the full checklist against the code; all behaviors hold:
- Hover demo zone → comment cursor + tooltip (unchanged).
- Hover tray → native cursor returns, ticket hover works (`pointer-events`
  untouched).
- Click → padded highlight, pill near click, caption with 800ms-delayed
  transcript.
- Recording sequence at v6 timing (highlight/pill-in/listening/transcribing
  unchanged).
- Send → modal in ~500ms (Fix 2).
- Modal holds until dismissed (no auto-dismiss timer).
- Click tray ticket → modal with that ticket's data (`handleTicketClick`
  unchanged).
- Pill shows no hover icons (Fix 5).

---

## Verification

| Check | Result |
|---|---|
| `npx tsc --noEmit` | Clean — 0 errors |
| `npx next build` | ✓ Compiled successfully in 5.2s; `/` registered; no errors/warnings |
| No leftover `demo-caption` references | grep clean (component + CSS migrated to `speech-caption`) |
| Forklifted components / real `components/CaptureWidget` / `lib/capture-engine` | 0 files changed |

**Bundle:** same Windows/Turbopack quirk as v1–v6 (no Size column printed).
Net change is tiny — one component simplified (caption lost its header markup),
one constant added, a handful of timing/flag tweaks. No new dependencies.

---

## Files touched

- [marketing.css](app/(marketing)/_styles/marketing.css) — Fix 1 stage height;
  Fix 4 `.speech-caption*` block (replacing `.demo-caption*`) + reduced-motion
  refs
- [HeroCaptureDemo.tsx](app/(marketing)/_components/demos/HeroCaptureDemo.tsx) —
  Fix 1 height fallbacks; Fix 2 phase timing + concurrent modal/glow + captured-
  ticket persistence; Fix 4 caption-visibility window + state mapping; Fix 5
  pill `pointer-events`
- [ElementHighlighter.tsx](app/(marketing)/_components/demos/annote/ElementHighlighter.tsx) —
  Fix 3 outset
- [SpeechCaption.tsx](app/(marketing)/_components/demos/annote/SpeechCaption.tsx) —
  Fix 4 simplification + typing delay + caret

**Not touched:** forklifted components (CapturePill, ExtensionTray,
SessionControlPanel, EditModal, FeedbackItem, MicOrb…), the v4/v5 copied CSS,
mockTickets.ts, the screenshot components, FauxSite mockup structure (only the
container height changed), DemoCursor, Hero copy.

---

## Unexpected behavior surfaced

1. **Caption reset during `sending`.** Mapping `sending → "listening"` would have
   reset the transcript to empty for the 200ms send flash. Fixed by mapping
   `sending → "transcribing"` so the words stay put through send
   ([HeroCaptureDemo.tsx:331-339](app/(marketing)/_components/demos/HeroCaptureDemo.tsx#L331)).
2. **Captured ticket vanished behind the modal.** In v6 the 6th ticket only
   existed during `ticket-lands`; with that phase now 300ms it would pop out the
   instant the modal opened, contradicting Fix 2's "the new ticket is there with
   a fading green tint." Extended `showCaptured` to keep it in the tray for the
   whole held-open capture modal.

## Suggested verification

This is a visual-feel pass — **a screen recording is the real verification.**
For Aakash: record (1) hover → cursor/tooltip, (2) click → padded highlight +
pill + caption typing after the small delay, (3) speech end → modal in ~500ms
with the green-tinted ticket landing behind it, (4) dismiss → back to idle, (5)
click a tray ticket → its modal. Confirm the stage feels taller/roomier while
the tray/modal/pill look the same size as v6.
