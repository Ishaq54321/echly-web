# Marketing Phase 2B — Pixel-Faithful Demos

**Date:** 2026-05-21
**Scope:** Replace Phase 2A's static visual placeholders with auto-looping demos
that mirror the real product down to the px. No imports from `components/`,
`lib/firebase`, or any provider — every visual was rebuilt from a specification
block at the top of each demo file.

---

## What was created

### New demo components
- [app/(marketing)/_components/demos/TicketCardMock.tsx](app/(marketing)/_components/demos/TicketCardMock.tsx) — the shared, pixel-faithful ticket card. Four variants: `floating` (hero), `detail` (sessions panel), `compact` (voice demo), `list` (sessions list row).
- [app/(marketing)/_components/demos/AnnoteUIChrome.tsx](app/(marketing)/_components/demos/AnnoteUIChrome.tsx) — faux app shell: collapsed rail + header + canvas. Used inside `<CaptureDemo />` so the "user clicking inside Annote" moment reads as the real product.
- [app/(marketing)/_components/demos/CaptureDemo.tsx](app/(marketing)/_components/demos/CaptureDemo.tsx) — 8-second auto-loop hero demo. Click-target → orb-in → voice waveform → polish pill → polished ticket slides up → comment bubble. Driven by a `useReducer` state machine with CSS transition swaps.
- [app/(marketing)/_components/demos/VoiceTicketDemo.tsx](app/(marketing)/_components/demos/VoiceTicketDemo.tsx) — 5–6s loop: orb + waveform → typewriter rough transcript → "Polish" button self-presses → structured ticket card revealed.
- [app/(marketing)/_components/demos/sessionsDemoData.ts](app/(marketing)/_components/demos/sessionsDemoData.ts) — extracted the inline `TICKETS` array from Phase 2A's SessionsDetail and rewrote copy to reference the canonical Loomly pricing universe.
- [app/(marketing)/_components/demos/index.ts](app/(marketing)/_components/demos/index.ts) — barrel updated to export the new components, types, and data.

### Refined sections
- [app/(marketing)/_components/sections/Hero.tsx](app/(marketing)/_components/sections/Hero.tsx) — stripped all five static `hero-card` placeholders; the entire stage is now a single `<CaptureDemo />` that auto-plays inside an `<AnnoteUIChrome />` frame.
- [app/(marketing)/_components/sections/Suite.tsx](app/(marketing)/_components/sections/Suite.tsx) — Voice panel's static `.viz-mic` card swapped for `<VoiceTicketDemo />`.
- [app/(marketing)/_components/sections/SessionsDetail.tsx](app/(marketing)/_components/sections/SessionsDetail.tsx) — uses the extracted data; selection now does a 150ms fade-out → swap → 200ms fade-in tween on title/meta/screenshot/comments; presence row gets a pulsing teal `#34C29A` live dot; the Copy link button gets a real hover/active state.

### CSS additions
- [app/(marketing)/_styles/marketing.css](app/(marketing)/_styles/marketing.css) — appended a `PHASE 2B — PIXEL-FAITHFUL DEMOS` block (~620 lines) scoped under `.marketing-root`. Includes the TicketCardMock variants, the chrome shell, CaptureDemo orchestration, VoiceTicketDemo typewriter + reveal, SessionsDetail polish, and a `prefers-reduced-motion: reduce` block that freezes every auto-loop on its final composed frame.

---

## Visual fidelity specifications

Each demo file carries a full JSDoc spec block at the top that maps real-product
details (file, value, class, keyframe) onto its marketing copy. Aakash can
cross-reference each block against the real components. Headlines below; see
the source files for the per-line spec.

### `<TicketCardMock />`
- **Mirrors:** `components/session/feedbackDetail/{FeedbackDetail,FeedbackHeader,FeedbackContent}.tsx`, `components/layout/operating-system/TicketItem.tsx`, `components/ui/Tag.tsx`.
- **Container:** 14px radius (matches `--content-card-radius`), `--mk-sh-lg` for floating / `--mk-sh-md` for detail / `--mk-sh-sm` for compact. 1px border `--line-1`.
- **Eyebrow ("ANNOTE AI · POLISHED"):** 9px / `letter-spacing: 0.12em` / uppercase / weight 600, `--ink-3` color. 11×11 conic-gradient spark, 3px radius, 4s linear spin via `mk-spin`.
- **Severity badge:** high = `rgba(197,26,104,.12)` bg, `#C51A68` text, `rgba(197,26,104,.25)` border. Medium / low palettes documented in the spec block.
- **Title:** DM Sans 600, 13.5px (floating/list/compact), 16px (detail). Color `#15101F`, `letter-spacing: -0.012em`, `line-height: 1.32`.
- **Meta rows:** monospace 10.5px, label column 56px wide (`--ink-3`), value `--ink-1` weight 500. Wrapper: bg `--bg-0`, border 1px `--line-1`, radius 8px, padding 10px 12px.
- **Tag pills:** 9.5px, 3px 7px padding, 999px radius, `--bg-0` fill, 1px `--line-1` border.
- **Send button:** `--violet` #5A49BF bg, white text, 11px weight 500, 6px 12px padding, 999px radius, `0 3px 10px -2px rgba(90,73,191,.30)` shadow.
- **Marketing adjustments:** no hover/active, scaled shadow for hero, `compact` suppresses tag row, `list` collapses to a one-line row mirroring TicketItem.

### `<AnnoteUIChrome />`
- **Mirrors:** `components/layout/{GlobalRail,GlobalHeader}.tsx`, `components/layout/operating-system/FourZoneLayout.tsx`.
- **Rail:** 64px wide (matches the collapsed `w-[64px]` shell), `var(--surface)` #FFFFFF bg, 1px right border. Logo target 38×38, gradient glyph 22×26 (CSS gradient, not the real SVG asset — keeps the marketing tree asset-free).
- **Rail pill:** 44px wide, 1.5px `--border` border, 12px radius, invite icon + 1px divider + workspace avatar (32px circle, `--brand` #5A49BF, 14px weight 700 white initial). Mirrors the collapsed pill in `GlobalRailContent.tsx:259-352`.
- **Nav items:** 44×36, 18px icons, stroke 2, 9px radius. Active state: `--brand-subtle` #F0ECFB bg, `--brand` icon color.
- **Header:** 56px tall, `--surface-card` #FAFAFA bg, 1px bottom border, padding 0 20px. Bell + 30px brand-purple avatar.
- **Canvas:** `var(--surface-page)` #FAF9F7 bg — intentionally different from the marketing page `#F2F0EB` to read as "this is the real app inside the marketing page."

### `<CaptureDemo />`
- **Mirrors:** `components/CaptureWidget/{RecordingMicOrb,MicOrb,ConfirmationCard,KeepRecordingPill}.tsx`, the `echly-recording-orb-inner` rules in `app/globals.css`.
- **Recording orb:** 72×72, `radial-gradient(circle at 30% 30%, #FF6B6B, #E10600)`, halo `0 0 0 8px rgba(255,0,0,0.08), 0 0 20px rgba(255,0,0,0.18)` (matches the listening halo in globals.css:3778). 2.2s breathing animation.
- **Click highlight:** 2px solid `--violet` outline on the target with `0 0 0 4px rgba(90,73,191,.12), 0 0 14px rgba(90,73,191,.25)` halo, pulsing on the existing `mk-pulse-soft` keyframe (already in marketing.css from Phase 2A).
- **Voice waveform pill:** dark capsule `rgba(20,22,28,0.92)`, 1px `rgba(255,255,255,0.08)` border, 999px radius. Bars are linear-gradients on `mk-aiwv` keyframe — every 3rd bar is the pink-tone gradient (mirrors the existing voice pill rhythm).
- **Polish pill:** white (`rgba(255,255,255,0.95)`), 14px radius, `--mk-sh-lg` shadow. 10×10 conic-gradient spark + 12px ink-2 label.
- **Polished ticket:** `<TicketCardMock variant="floating" />` — slides up from bottom-right with `cubic-bezier(0.16, 1, 0.3, 1)` over 420ms.
- **Comment bubble:** 280px wide, white (`rgba 0.96`), 14px radius, `--mk-sh-lg` shadow. 13px ink-1 body, 11px reply pill.
- **Orchestration:** 8-step state machine (`idle → highlight → orbIn → recording → polish → ticket → comment → hold`) with phase-keyed timeout chain. IntersectionObserver pauses the loop when scrolled out of view. `prefers-reduced-motion: reduce` freezes on the "comment" frame — the final composed view that tells the whole story.

### `<VoiceTicketDemo />`
- **Mirrors:** `components/CaptureWidget/RecordingMicOrb.tsx` (waveform pattern), `components/CaptureWidget/ConfirmationCard.tsx` (polished output reveal).
- **Frame:** white card, 14px radius, `--mk-sh-lg` shadow (the existing `.viz-card` baseline), padding 22px 22px 18px.
- **Eyebrow:** "VOICE NOTE", 11px uppercase, `letter-spacing: 0.14em`, weight 600, `--ink-3`.
- **Waveform:** 64px tall, 4px bars, 4px gap; same `mk-aiwv` keyframe as marketing.css; every 3rd bar uses the pink gradient.
- **Rough transcript:** 13.5px italic, `--ink-2`, line-height 1.5. Typed at 20ms / char during the `typing` phase. Caret is a 1px tall blinking line.
- **Polish button:** `--violet` bg, white text, 11px weight 500, 6px 12px padding, 999px radius, `0 3px 8px rgba(90,73,191,.30)` shadow (mirrors ConfirmationCard primary). Self-press: scale 1 → 0.96 → 1 over 200ms.
- **Polished ticket:** `<TicketCardMock variant="compact" />` cross-fades into the same stage box (no layout shift).
- **Orchestration:** 6-phase machine (`listening → typing → ready → pressing → polished → hold`). IntersectionObserver gates play. `prefers-reduced-motion: reduce` jumps directly to the polished ticket.

### `<SessionsDetail />` polish
- Extracted ticket data into a separate file; copy now references the Loomly pricing universe.
- Selected-state transition: tween-out class fires on click, 150ms fade, content swap, 200ms fade-in. All durations use `cubic-bezier(0.16, 1, 0.3, 1)`.
- Presence row "3 viewing now" gets a 6px teal `#34C29A` dot with a 1.6s pulse (`sd-live-pulse` keyframe) and a 6px shadow.
- Copy link button: real hover (`#2A2240` bg + soft shadow lift) and active (no transform, no shadow) states. The "copied" green stays as-is from Phase 2A.

---

## Constraints check

Grep results from the marketing tree:

```
$ grep -r "from ['\"]@/lib/firebase"          app/(marketing)/ → 0 matches
$ grep -r "from ['\"]@/lib/client/workspaceContext" app/(marketing)/ → 0 matches
$ grep -r "from ['\"]@/components/"           app/(marketing)/ → 0 matches
$ grep -r "useWorkspace"                      app/(marketing)/ → 0 matches
$ grep -r "useAuthState"                      app/(marketing)/ → 0 matches
```

All five forbidden-import patterns return zero matches.

Other constraints honored:
- ✅ No new dependencies (no Framer Motion, no Lottie, no Spring). All orchestration is `useReducer` + CSS.
- ✅ No modifications to `(app)/`, `(auth)/`, `(public)/`, `admin/`, `api/`, `onboarding/`, `invite/`, `workspace-suspended/`, `middleware.ts`, `lib/server/`, `lib/domain/`, `styles/tokens.css`, `tailwind.config.ts`.
- ✅ No modifications to Phase 1 mock data files (`_mock/`).
- ✅ Demos respect `prefers-reduced-motion: reduce`.
- ✅ IntersectionObserver gates play, freeing CPU when off-screen.
- ✅ Each demo file carries its specification block at the top of the file.

---

## Verification

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | Clean — 0 errors |
| `pnpm build` | Clean — production build succeeds, no compilation errors |
| `npx eslint "app/(marketing)/**/*.{ts,tsx}"` | Clean — 0 errors, 0 warnings (after refactoring `useInViewport` to use lazy initializer and moving SessionsDetail tween into a timer callback so no synchronous setState fires in effect bodies) |
| Forbidden-import greps | Zero matches across all five patterns |
| Reduced-motion behavior | CaptureDemo freezes at the "comment" frame; VoiceTicketDemo jumps to polished ticket; SessionsDetail tween + live-dot animation disabled |
| Files under `app/(marketing)/_components/demos/` | 8 total: AnnoteUIChrome, BrowserFrame (kept), CaptureDemo, DemoBoundary (kept), TicketCardMock, VoiceTicketDemo, index.ts, sessionsDemoData.ts |

**Bundle size note:** The Next.js production-build output table on this project does not currently print the size column for `/` (Turbopack/Next 16 quirk on Windows — the column is empty in the build output for *all* routes, not just `/`). Build itself completes without errors and route is properly registered. Aakash should confirm bundle-size numerically via Vercel deploy output or a separate `analyze` build if a hard < 250KB number is needed.

---

## Fidelity questions for Aakash

These are places where the real component spec didn't translate one-to-one into the demo context. None block shipping — they're judgment calls worth confirming.

1. **`<CaptureDemo />` orb pulse rate.** The real `RecordingMicOrb` scales 1.0 → 1.1 in proportion to live `audioLevel`. In the demo I substituted a 2.2s steady breathing animation (`scale 1 → 1.04 → 1`) because there's no audio source. Confirm: is the steady breathe acceptable, or do you want a more varied "fake audio" wave (e.g., randomized scale every 200ms)?
2. **`<AnnoteUIChrome />` brand glyph.** The real rail loads `/annote-logo-icon.svg`. I substituted a 22×26 CSS gradient block to keep the marketing bundle asset-free. If you'd prefer the real icon (it's already in `/public`), I can swap it in — `<Image>` from next/image would add the regular image-pipeline cost but no JS.
3. **`<VoiceTicketDemo />` waveform during `polished` phase.** The waveform keeps animating even after the ticket is revealed. This matches what the real CaptureWidget does (the orb stays visible while the confirmation card animates in). If you'd rather the wave fade/freeze while the polished ticket is shown, that's a one-line CSS change.
4. **`<SessionsDetail />` tween direction.** I picked a simple opacity/translateY(2px) fade for the title/meta/screenshot/comments group, because the real product's session-detail switch doesn't have an established cross-fade convention I could mirror. If you'd prefer staggered fade (title first, then meta, then thumbnail), I can split the transitions.
5. **`<CaptureDemo />` "comment" frame as the held-loop frame.** The real product's comment bubble appears after the ticket lands in a session, not synchronously with the polish. I held it as the final frame here because it gives the loop a "story complete" pose. If you'd rather hold on the ticket card (with comment delayed to the very last beat), that's a SEQUENCE adjustment.

---

## Deviations from the prompt

- **Bundle size:** The build harness doesn't print size column on this project; I noted that above. I did not hit any "approaching 300KB" trigger to flag.
- **CSS class name collision:** I renamed the AnnoteUIChrome internal classes from `annc-*` to `uichrome-*` to avoid a collision with the existing `.annc-` announcement-bar styles (which set `.annc-text { display: none }` at mobile breakpoint). No visible behavior change.
- **No "kept" demo CSS rule overlap:** The Phase 2A `.viz-mic` styles still exist in marketing.css but are no longer referenced (the voice panel now hosts `<VoiceTicketDemo />`). I left them in place — they're cheap, harmless, and pulling them now would muddy the diff. Easy follow-up for a cleanup pass.
- **No live audio in the orb:** The Phase 2B prompt's "fidelity questions" section asks me to flag this; see question 1 above.

---

## What's next (Phase 2C+ candidates)

1. **`<CaptureDemo />` widget mode toggle.** Right now the demo plays inside an `<AnnoteUIChrome />`. A future variation could swap to a "no chrome" mode — the orb + ticket pop up on a customer's own website, illustrating the extension experience. The internal state machine is reusable; only the framing component differs.
2. **`<TicketCardMock />` interactive variant.** Aakash could hover the floating card in the hero and see the assignee/tag editing UI appear, mirroring the real `FeedbackDetail` interactions — useful if we want a "scrubbable" version of the hero card later.
3. **Cleanup pass on stale Phase 2A viz CSS.** `.viz-mic`, `.vm-*`, and a few other voice-related Phase 2A classes are no longer referenced. Safe to remove in a future pass.
4. **`<IntegrationsDemo />`.** The Integrations panel is still using the static `.viz-stack` cards. Could become a small animated loop showing a polished ticket pushing into Linear → GitHub → Slack with each line lighting up.
5. **Real Annote SVG glyph in `<AnnoteUIChrome />`.** Pending the answer to fidelity question 2.
