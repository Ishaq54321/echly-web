# Marketing Phase 2B v8 — Final Polish

**Date:** 2026-05-22
**Scope:** Three refinements on top of v7 — a timer bug fix + new pacing, a
longer transcript, and a background overhaul (lighter blur, premium mockup,
frosted-glass overlays). No new components, no architecture changes. The
forklifted real components are untouched except for *scoped* CSS overrides in
marketing.css (their shared design tokens are left alone).

---

## Fix 1 — Timer bug + transcribing pacing

### Root cause of the 00:00 → 00:01 → 00:00 flicker

The pill is purely presentational — it renders the `elapsedFormatted` string
verbatim with no internal timer (it never had one; the forklift took the timer
out and relies on the orchestrator). The bug was entirely in
`HeroCaptureDemo`'s timer effect
([HeroCaptureDemo.tsx](app/(marketing)/_components/demos/HeroCaptureDemo.tsx)):

```ts
// v7 — buggy
const timerActive = isListening;            // isListening = listening || transcribing
useEffect(() => {
  if (timerActive) {
    setElapsedTick(0);                       // reset…
    const id = setInterval(...);
    return () => clearInterval(id);          // …torn down + reset on phase change
  }
  if (phase === "sending") return;
  setElapsedTick(0);
}, [timerActive, phase]);                     // ← phase in deps
```

Because `phase` was in the dependency array, the effect re-ran whenever the
demo crossed an internal recording boundary (e.g. `listening → transcribing`),
tearing down the interval and calling `setElapsedTick(0)` again — producing the
visible reset right after the first tick.

### The fix (demo-controlled, no internal timer)

Split into two effects so the reset is gated on *entering* `listening` and the
interval survives every mid-recording phase change:

```ts
const timerRunning =
  phase === "listening" || phase === "transcribing" ||
  phase === "transcript-hold" || phase === "sending";

useEffect(() => { if (phase === "listening") setPillElapsedSec(0); }, [phase]);

useEffect(() => {
  if (!timerRunning || reducedMotion) return;
  const id = setInterval(() => setPillElapsedSec(s => s + 1), 1000);
  return () => clearInterval(id);
}, [timerRunning, reducedMotion]);            // ← NOT phase; stays true across the whole recording
```

`timerRunning` stays `true` continuously from `listening` through `sending`, so
the interval effect never re-runs in that window → no teardown → no reset. The
pill needed **no modification** — it already accepts `elapsedFormatted` as a
verbatim string prop. **Behavior now:** `00:00 → 00:01 → 00:02 …` clean, no
flicker.

### New pacing

| Phase | Duration | What happens |
|-------|----------|--------------|
| highlight | 600ms | selection frame appears (lead-in, unchanged) |
| pill-in | 500ms | pill + empty caption slide in (lead-in, unchanged) |
| listening | 1500ms | MicOrb breathes, timer counts `00:00 → 00:01`, caption empty |
| transcribing | **3500ms** (was 4000) | transcript types word-by-word (~2.8s of typing) |
| **transcript-hold** | **1500ms (NEW)** | full transcript visible, caret gone, pill + timer still showing — a deliberate beat of stillness to read it |
| sending | 200ms | send button → spinner |
| ticket-lands | 300ms | modal fades in over frosted glass, ticket slides into tray, all concurrent |

**Click → modal-visible: ~7.8s.** The deliberate-hold intent lands via the new
`transcript-hold` beat. (The transcript was tightened during the pass to ~20
words — see Fix 2 — so `transcribing` was trimmed `5000 → 3500ms` to keep the
stillness in `transcript-hold` rather than as dead air after the typing
finishes.)

---

## Fix 2 — Longer, more natural transcript

[mockTickets.ts:148](app/(marketing)/_components/demos/annote/mockTickets.ts#L148)
`DEMO_TRANSCRIPT`:

**Before** (~48 chars, sounds curated):
> hero copy could be clearer about the value prop

**After** (~120 chars, ~21 words, sounds dictated):
> the hero copy doesn't really say what we do — "build better software" could
> be anything. let's make it more specific

Natural-sounding (the em-dash pause, the quoted phrase) but tightened to "less
to absorb" than the first draft. Wraps to 2 lines in the 380px caption box (no
forced `<br>`).

**Typing speed:** `wordIntervalMs={110}`, `typingDelayMs={500}` → `500 + 21×110
≈ 2810ms`, comfortably inside the 3500ms `transcribing` phase, so the caret is
gone before `transcript-hold` begins. The caption's `state` maps
`transcribing | transcript-hold | sending → "transcribing"` so the revealed
words don't reset during the hold.

The AI-polished short title in the EditModal stays as-is
(`"[Demo Site] Hero copy could be clearer about the value prop"`) — the
transcript is the raw voice, the title is the summarized output. That contrast
is now legible.

---

## Fix 3 — Background overhaul

### 3a — Lighter blur, no dimming

[marketing.css `.hcd-faux`](app/(marketing)/_styles/marketing.css):

| | Before (v7) | After (v8) |
|---|---|---|
| blur | `8px` | **`2.5px`** |
| saturate | `0.6` | **removed** |
| opacity | `0.4` | **`0.75`** |
| `::after` atmospheric overlay | dark bottom gradient | **removed** |
| `.hcd-vignette` (radial dark edges) | present | **removed** (element + CSS) |
| capturing state | `blur(5px) saturate(0.72) / 0.55` | `blur(1.5px) / 0.85` |

The page now sits behind glass, still legible (you can read short text and read
the layout), rather than dissolved into fuzz.

### 3b — Premium FauxSite mockup

[FauxSite.tsx](app/(marketing)/_components/demos/FauxSite.tsx) +
[marketing.css `.fs-*`](app/(marketing)/_styles/marketing.css) rebuilt as a
developer-platform landing page in the Linear/Vercel/Stripe register:

- **Nav:** logomark (ink square + sky-blue dot) + "Stratum" wordmark · centered
  links (Product / Solutions / Pricing / Docs) · "Start free trial" CTA.
- **Hero (left):** uppercase eyebrow "DEVELOPER PLATFORM" (sky-blue) → 52px/700
  display headline "Infrastructure that scales" → 18px slate sub → dual CTA
  (filled ink "Start free trial" + outline "View docs").
- **Product visualization (right):** a soft cool-gradient base card
  (`#EFF6FF → #F0F9FF`) hinting at an editor (window dots, content lines, a
  thumbnail, a sky-blue line chart), with **two floating elements** layered on
  top — a notification card (`+2°` tilt) and a `99.9% uptime` stat badge
  (`−2°` tilt) — each with its own drop shadow so the composition reads
  hand-arranged.
- **Palette:** deliberately **cool** — ink `#0F172A`, slate `#475569`,
  sky-blue accent `#0EA5E9`, emerald `#10B981` — never Annote purple, so the
  captured page reads as *someone else's* product.

`data-faux-target` is on the headline (the most rewarding capture target), nav,
CTAs, eyebrow, sub, logo, and feature cards, so the highlight still frames a
real element.

### 3c — Frosted-glass overlays + elevated Annote elements

**Modal backdrop**
[`.editor-overlay-backdrop`](app/(marketing)/_styles/marketing.css):

| Before | After |
|---|---|
| `background: rgba(0,0,0,0.45)` | `background: rgba(255,255,255,0.5)` + `backdrop-filter: blur(6px)` |

Depth now reads through *softness* (background still recognizable behind the
scrim), not darkness.

**Stronger shadows** (all scoped to the demo so the shared forklift tokens
`--glass-shadow-stack` / `--shadow-depth-recording` are untouched):

- **ExtensionTray** (`.hcd-tray-anchor .echly-v2 .pill-tickets`):
  `0 24px 48px -16px rgba(15,23,42,.18), 0 8px 16px -4px rgba(15,23,42,.08), 0 0 0 1px rgba(15,23,42,.04)`
- **EditModal** (`.editor-overlay`): inset highlight +
  `0 16px 32px -8px rgba(15,23,42,.10), 0 32px 64px -24px rgba(15,23,42,.24)`
- **Recording pill** (`.hcd-pill-anchor .echly-pill-content`):
  `0 18px 40px -16px rgba(15,23,42,.22), 0 6px 14px -4px rgba(15,23,42,.10), 0 0 0 1px rgba(15,23,42,.04)`
- **SessionControlPanel:** kept as-is (already strong).

The Annote elements now earn prominence through crisp elevation instead of a
darkened background.

---

## Verification

| Check | Result |
|---|---|
| `npx tsc --noEmit` | Clean — 0 errors |
| `npx next build` | ✓ Compiled successfully in ~5s; `/` registered; no errors/warnings |
| No leftover `hcd-vignette` / removed `fs-art-circle`/`fs-art-bar` refs | grep clean |
| Forklifted components / shared tokens | 0 component files changed; only scoped CSS overrides added |

**This is a visual-feel pass — a screen recording is the real verification.**
Record: (1) idle (lighter background, premium mock legible behind glass), (2)
click → selection frame + pill + timer counting cleanly `00:00→00:01→…` (no
flicker) + the 2-line transcript typing, (3) the deliberate `transcript-hold`
beat with the full caption still, (4) modal opens over the light frosted-glass
scrim (not dark dimming — confirm the page is still recognizable through it),
(5) dismiss → idle.

---

## Files touched

- [HeroCaptureDemo.tsx](app/(marketing)/_components/demos/HeroCaptureDemo.tsx) —
  Fix 1 timer rewrite + `transcript-hold` phase + pacing; removed `<hcd-vignette>`;
  caption state mapping + typing-speed props
- [FauxSite.tsx](app/(marketing)/_components/demos/FauxSite.tsx) — Fix 3b premium
  mockup rebuild
- [mockTickets.ts](app/(marketing)/_components/demos/annote/mockTickets.ts) —
  Fix 2 transcript text
- [marketing.css](app/(marketing)/_styles/marketing.css) — Fix 3a blur/opacity +
  vignette/overlay removal; Fix 3b `.fs-*` rebuild; Fix 3c frosted-glass backdrop +
  scoped Annote shadows

**Not touched:** forklifted components (CapturePill, ExtensionTray,
SessionControlPanel, EditModal, FeedbackItem, MicOrb, VoicePillContent…), their
shared design tokens, the screenshot components, DemoCursor, the EditModal
ticket title, Hero.tsx structure. SpeechCaption.tsx unchanged (it already
accepted the timing props).
```
