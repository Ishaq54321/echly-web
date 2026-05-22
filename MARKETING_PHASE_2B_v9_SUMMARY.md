# Marketing Phase 2B — v9: Caption & Blur Refinement

Six small refinements on the v8 caption + blur behavior. No new components, no
architecture shifts. Plus one mid-pass user correction (see Fix 5).

Files touched:
- `app/(marketing)/_components/demos/HeroCaptureDemo.tsx` — timing rewrite (Fix 6)
- `app/(marketing)/_components/demos/annote/SpeechCaption.tsx` — cursor position (Fix 2), auto-size rendering (Fix 3)
- `app/(marketing)/_components/demos/annote/mockTickets.ts` — transcript text (Fix 1)
- `app/(marketing)/_styles/marketing.css` — auto-size CSS (Fix 3), blur amount (Fix 4), word fade keyframe

---

## Fix 1 — Shorter transcript

**Before (~205 chars):**
> the hero copy here doesn't really say what we do — like "build better software" could be literally anything. we should specify the workflow, maybe something about teams shipping faster or specific to engineering teams

**After (~120 chars, 21 words):**
> the hero copy doesn't really say what we do — "build better software" could be anything. let's make it more specific

Wraps to 2 lines in the 380px box; types out in ~2.9s at the per-word pace.

## Fix 2 — Cursor at start when empty, not at end

`SpeechCaption.tsx`: the caret now renders **only before the first word lands**,
at the start of the (empty) text area — `showCaret = revealed === 0`. It blinks
there signalling "ready to transcribe", then disappears the instant the first
word arrives. The old trailing caret (that followed the typed text) is gone —
there is no cursor at all while typing or after completion.

## Fix 3 — Caption box auto-sizes to content

Two parts:
- **CSS**: removed `min-height: 1.5em` from `.speech-caption-text`. Padding stays
  `14px 18px` all sides. No `height`/`min-height` — the box is purely
  content-sized (Option A: no height transition, no jank).
- **Render**: words are now rendered with `words.slice(0, revealed)` rather than
  all words mounted at `opacity: 0`. Previously every (invisible) word reserved
  layout up front, so the box was always full-height with empty space. Now only
  revealed words exist in the DOM, so the box is short (just the cursor) when
  empty and grows naturally as words land. Each word fades up via a
  `speech-caption-word-in` keyframe on mount.

Empty box ≈ cursor + padding (~40px). Two full lines ≈ ~80px. Natural growth, no
jumping.

## Fix 4 — Slightly more background blur

`.hcd-faux`: `filter: blur(2.5px)` → `blur(3.5px)`. Opacity unchanged at `0.75`.
Still tight and legible, just a touch more softening.

## Fix 5 — Local un-blur — **REMOVED per user direction**

Originally implemented as spec'd: a second clip-path'd sharp copy of FauxSite
(`.hcd-faux-focused`, `blur(0.5px)`) clipped to the highlight rect + 20px, giving
selective focus on the captured element. Built and verified to compile.

**Mid-pass the user asked to keep the clicked area blurred** ("keep that blur") —
i.e. no selective un-blur. So the focused layer was removed: the whole faux site
stays uniformly blurred at 3.5px through capture, and the purple highlight
rectangle alone marks what's being captured. Also dropped the prior v8
`is-capturing` global-crisp override, so blur is now constant in all states.

Net: clip-path was implemented successfully (no browser issues) but is not
shipped — uniform blur is the final behavior.

## Fix 6 — Snappier timing (transcript starts ~300ms after click)

The long "listening" beat is gone. `PHASE_DURATION` rewritten:

| Phase | v8 | v9 |
|-------|----|----|
| highlight | 600 | 150 |
| pill-in | 500 | 100 |
| listening | 1500 | 50 |
| transcribing | 3500 | 3000 |
| transcript-hold | 1500 | 1500 |
| sending | 200 | 200 |
| ticket-lands | 300 | 300 |

New click-relative timeline:

| Time | Event |
|------|-------|
| 0ms | Click |
| 0–150ms | Highlight settles |
| 150–250ms | Pill animates in; caption appears with blinking cursor |
| ~300ms | Phase → transcribing |
| ~450ms | First word lands (150ms typingDelay → ~300ms total cursor blink) |
| ~450–3300ms | Transcript types word-by-word (`wordIntervalMs: 130`, 21 words ≈ 2.9s) |
| 3300–4800ms | Transcript hold |
| 4800–5000ms | Sending spinner |
| 5000–5300ms | Modal opens (concurrent with ticket-lands) |

**Click → modal ≈ 5.3s** (was ~8.5s).

SpeechCaption props updated: `wordIntervalMs={130}`, `typingDelayMs={150}`.

---

## Verification

- `npx tsc --noEmit` — clean
- `npx next build` — clean
- Transcript ~120 chars, 21 words, ~2.9s typing ✓
- Cursor at start of empty box, gone on first word ✓
- Box auto-sizes (only revealed words in DOM) ✓
- Blur 3.5px, constant through capture ✓
- Background stays uniformly blurred on click (per user) ✓
- Click → first word ≈ 450ms; click → modal ≈ 5.3s ✓

## Screen recording suggestion

Click an element → brief blinking cursor in empty caption → text types in over
~3s → 1.5s hold → modal opens. Background stays uniformly blurred throughout;
only the purple highlight rectangle marks the captured element.
