# Marketing Phase 2B v3 — Hero Capture Demo Rebuild

**Date:** 2026-05-22
**Scope:** Replace the hero-stage of `Hero.tsx` with a pixel-faithful animated
demo of the real Annote Chrome extension capturing feedback on a faux SaaS
product ("Northwind"). 10-second auto-loop. Other sections untouched.

The binding contract is [EXTENSION_DESIGN_SPEC.md](EXTENSION_DESIGN_SPEC.md).
Every pixel value, keyframe, and easing in this rebuild traces back to a
section in that document.

---

## File-by-file changes

### New files

- [app/(marketing)/_components/demos/HeroCaptureDemo.tsx](app/(marketing)/_components/demos/HeroCaptureDemo.tsx) — composition root. 13-beat timeline state machine (`useReducer` + chained `setTimeout`), `IntersectionObserver` play/pause, `prefers-reduced-motion` jump-to-final-frame. Mounts all Annote-side mirrors and the Northwind dashboard inside a single 980×560 stage box.

- [app/(marketing)/_components/demos/northwind/NorthwindDashboard.tsx](app/(marketing)/_components/demos/northwind/NorthwindDashboard.tsx) — the faux SaaS UI being QA-ed. Top bar with "Northwind" wordmark + tabs, narrow left rail, main canvas with crumb + heading, four metric cards, and a 3-tile project grid. The black "+ New project" CTA carries `data-hcd-target="new-project"` for orchestrator reference. Accent color is teal `#4FB6B1` (deliberately NOT Annote purple — so purple-on-screen reads as "Annote's highlight").

- [app/(marketing)/_components/demos/annote/ExtensionTray.tsx](app/(marketing)/_components/demos/annote/ExtensionTray.tsx) — bottom-right glass tray. Collapsed = header only ("Northwind Studio" + count badge + start-session button). Expanded = empty state or `<TicketRowMock />`. Body uses `max-height` transition for the expand animation.

- [app/(marketing)/_components/demos/annote/SessionControlPanel.tsx](app/(marketing)/_components/demos/annote/SessionControlPanel.tsx) — bottom-center frosted pill: live dot (pulsing teal) + "Session started" + divider + Pause (ghost) + End (danger). Slides up on entry.

- [app/(marketing)/_components/demos/annote/SessionFeedbackPopup.tsx](app/(marketing)/_components/demos/annote/SessionFeedbackPopup.tsx) — dark center-screen card containing `<MicOrb />`, `<Waveform />`, transcript area, and a Cancel button.

- [app/(marketing)/_components/demos/annote/ConfirmationCard.tsx](app/(marketing)/_components/demos/annote/ConfirmationCard.tsx) — "I understood" eyebrow + AI-polished title + description + metadata block + Confirm/Edit buttons. Has `is-on`/`is-exiting` modifiers.

- [app/(marketing)/_components/demos/annote/ElementHighlighter.tsx](app/(marketing)/_components/demos/annote/ElementHighlighter.tsx) — single absolutely-positioned div with the spec's `2px solid #5A49BF` outline + `rgba(37,99,235,0.1)` wash.

- [app/(marketing)/_components/demos/annote/MicOrb.tsx](app/(marketing)/_components/demos/annote/MicOrb.tsx) — 56px red gradient orb with breathing animation.

- [app/(marketing)/_components/demos/annote/Waveform.tsx](app/(marketing)/_components/demos/annote/Waveform.tsx) — 6 bars, staggered scaleY animation.

- [app/(marketing)/_components/demos/annote/LoadingState.tsx](app/(marketing)/_components/demos/annote/LoadingState.tsx) — 64×64 icon wrap with floating sparkle SVG, ring pulse via `::before`, "Structuring your feedback…" label, three pulsing dots.

- [app/(marketing)/_components/demos/annote/TicketRowMock.tsx](app/(marketing)/_components/demos/annote/TicketRowMock.tsx) — single ticket row that lands in the tray. Grid `40px 1fr` with green-success icon (animated check) + title + meta (with "High" severity badge).

### Modified files

- [app/(marketing)/_components/sections/Hero.tsx](app/(marketing)/_components/sections/Hero.tsx) — swapped the import and the single component inside `.hero-stage--demo` from `<CaptureDemo />` to `<HeroCaptureDemo />`. Copy block untouched.

- [app/(marketing)/_components/demos/index.ts](app/(marketing)/_components/demos/index.ts) — dropped `AnnoteUIChrome` and `CaptureDemo` exports; added `HeroCaptureDemo`. `TicketCardMock` and `VoiceTicketDemo` exports retained (still used in [Suite.tsx](app/(marketing)/_components/sections/Suite.tsx)).

- [app/(marketing)/_styles/marketing.css](app/(marketing)/_styles/marketing.css) — removed the entire `AnnoteUIChrome` block (~150 lines) and the entire `CaptureDemo` block (~260 lines, including the `capdemo-*` classes and the V1/V2 responsive overrides). Added a fresh `HeroCaptureDemo (v3)` block scoped under `.marketing-root` with all `hcd-*` and `nw-*` selectors plus the spec-verbatim `mk-` keyframes: `mk-mic-orb-breathing`, `mk-v2-wave`, `mk-icon-float`, `mk-icon-ring`, `mk-dot-pulse`, `mk-sc-live`, `mk-v2-succ-glow`, `mk-v2-succ-pop`, `mk-tray-attention`, `mk-click-flash`, `mk-caret-blink`. Updated the `prefers-reduced-motion` block to drop the dead `.capdemo-*` selectors and add the new `.hcd-*` ones. Replaced the V1/V2 responsive overrides at the bottom with a tightened `(max-width: 1100px)` block; the `(max-width: 640px)` mobile-static fallback lives inside the main HeroCaptureDemo block so it stays adjacent to the rules it overrides.

### Deleted files

- `app/(marketing)/_components/demos/CaptureDemo.tsx` — superseded by `HeroCaptureDemo`.
- `app/(marketing)/_components/demos/AnnoteUIChrome.tsx` — was only used by the old `CaptureDemo`; the new demo uses Northwind, not an Annote-shell mock.

---

## JSDoc fidelity blocks (single reference for review)

The header JSDoc of each new file maps the spec section onto the marketing copy. Reproduced here for easy side-by-side review:

```
HeroCaptureDemo.tsx
───────────────────
Spec ref: EXTENSION_DESIGN_SPEC.md (binding) and the Phase 2B v3 prompt's
"10-second loop, beat by beat" storyboard.
Beat timing (ms from t=0):
  0      idle               Northwind visible, tray collapsed
  500    tray-expanding     attention pulse on tray to draw the eye
  1000   session-starting   start button auto-press, control panel slides up
  1500   cursor-moving      cursor visual transits, highlighter appears
  2200   click + popup      popup fades in centered, click flash
  2500   recording          mic + waveform animating
  3000   transcript-typing  characters fill in over ~2.5s
  5500   loading            "Structuring your feedback…"
  6500   confirming         ConfirmationCard slides in
  8000   ticket-lands       confirm-press, card exits, ticket animates in tray
  9500   hold               final composition for 500ms
  10000  crossfade          fade everything except Northwind back to idle (400ms)
Marketing adjustments: absolute positioning within the demo container (not
fixed-to-viewport); z-index ≤14 instead of the extension's 2147483646;
no real audio, no Firestore. IntersectionObserver pauses the loop when
scrolled off; reduced-motion freezes on the final composition.

MicOrb.tsx
──────────
Spec ref: EXTENSION_DESIGN_SPEC.md Section 1.6 / 3.1
Values copied verbatim:
- 56px diameter
- background: linear-gradient(135deg, #ff3b3b, #ff5c5c)
- box-shadow: 0 4px 20px rgba(0,0,0,0.25), 0 0 24px rgba(255,59,59,0.35)
- breathing animation: mk-mic-orb-breathing 2.2s infinite ease-in-out (±4%)
- inner ring overlay: 1.5px rgba(255,255,255,0.18)
Marketing adjustments: no audio-level coupling.

Waveform.tsx
────────────
Spec ref: EXTENSION_DESIGN_SPEC.md Section 3.3 / 5.4
Values copied verbatim:
- 6 bars, 3px wide, 2px gap
- background: rgba(90,73,191,0.85)
- border-radius: 2px
- animation: mk-v2-wave 0.4s infinite, scaleY 0.4 → 1.0
- per-bar delays: 0s, 0.08s, 0.16s, 0.24s, 0.32s, 0.40s
- container height: 32px

ElementHighlighter.tsx
──────────────────────
Spec ref: EXTENSION_DESIGN_SPEC.md Section 1.4
Values copied verbatim:
- outline: 2px solid #5A49BF
- background: rgba(37,99,235,0.1)
- border-radius: 4px
Marketing adjustments: position is set once per mount by parent (percent
geometry over the Northwind CTA box). No mousemove tracking; visibility
animated via opacity by the orchestrator.

SessionFeedbackPopup.tsx
────────────────────────
Spec ref: EXTENSION_DESIGN_SPEC.md Section 1.5
Values copied verbatim:
- max-width: min(380px, 92vw) → marketing uses min(360px, 86%) inside the
  stage box (smaller to keep proportional inside the 980px container)
- background: rgba(20,22,28,0.92), backdrop-filter: blur(20px)
- border: 1px solid rgba(255,255,255,0.08)
- border-radius: 14px
- box-shadow: 0 10px 30px rgba(0,0,0,0.35)
- entry: opacity 0→1, scale 0.98→1, 200ms cubic-bezier(0.22,0.61,0.36,1)

LoadingState.tsx
────────────────
Spec ref: EXTENSION_DESIGN_SPEC.md Section 2.5
Values copied verbatim:
- Icon wrapper 64×64, border-radius 18px, brand-soft background, grid place-items center
- Inner SVG 30×30 color #5A49BF, mk-icon-float 2.4s ease-in-out infinite
- Ring (::before): inset -7px, 2px solid #5A49BF, border-radius 23px,
  mk-icon-ring 2s ease-out infinite
- "Structuring your feedback…" 15px 600wt #15101F, max-width 322px, -0.01em
  (marketing uses 14.5px and 240px to fit a smaller card; the design tokens
  and colors are unchanged)
- Three 6px dots, gap 6px, mk-dot-pulse 1.4s, delays 0s/0.15s/0.3s

ConfirmationCard.tsx
────────────────────
Spec ref: EXTENSION_DESIGN_SPEC.md Section 1.7 / Section 4
Values copied verbatim:
- max-width: min(360px, 92vw) → marketing uses min(360px, 86%)
- padding 22-24px, background rgba(20,22,28,0.92), blur(20px),
  border 1px solid rgba(255,255,255,0.08), border-radius 14px
- "I understood" eyebrow 15-16px 600wt #F3F4F6, line-height 1.4
- Title 14-14.5px 600wt #F3F4F6, line-height 1.45
- Description 12.5-13px 500wt rgba(243,244,246,0.7), line-height 1.4-1.45
- Confirm button: #5A49BF bg, white text, padding 9-10px 16-18px,
  border-radius 10px, font 13.5-14px 600wt, box-shadow 0 4px 12px rgba(90,73,191,0.25)
- Edit button: rgba(255,255,255,0.08) bg, white text,
  1px solid rgba(255,255,255,0.08) border
- Entry: opacity 0→1, y 8→0, 200ms cubic-bezier(0.22,0.61,0.36,1)
- Exit: opacity 1→0, scale 1→0.98, 200ms
- Confirm press: scale 1→0.96 over 200ms (the auto-press at t=8.0s)

TicketRowMock.tsx
─────────────────
Spec ref: EXTENSION_DESIGN_SPEC.md Section 2.2
Values copied verbatim:
- Grid: 51px 1fr auto → marketing uses 40px 1fr (no actions column in demo)
- Padding: 12px vertical, 12px horizontal → marketing uses 10px
  (tighter to keep the tray height reasonable in the demo stage)
- Icon area: 34×34 border-radius 8px (unchanged), green success bg
- Title: 15px 600wt #15101F, letter-spacing -0.008em → marketing uses 14px
  to fit the constrained tray width
- Meta line: 13px #54495F → marketing uses 12px, gap 7px (unchanged)
- Severity "High" badge: bg rgba(229,72,77,0.10), text #E5484D (verbatim)
- Entry: mk-v2-succ-glow 2.4s ease-out (verbatim)
- Checkmark pop: mk-v2-succ-pop 0.42s cubic-bezier(0.34,1.56,0.64,1) (verbatim)

ExtensionTray.tsx
─────────────────
Spec ref: EXTENSION_DESIGN_SPEC.md Section 1.9 / 2.1
Values copied verbatim:
- Position: absolute bottom 18-24px, right 18-24px (within demo stage)
- Width: min(330px, 90%) (spec: min(360px, 90vw) — slightly narrower in demo)
- Background: rgba(255,255,255,0.78) (spec: 0.7 — marginally more opaque to
  read over the white Northwind dashboard; backdrop blur is identical)
- Backdrop-filter: blur(20px)
- Border: 1px solid rgba(0,0,0,0.05)
- Border-radius: 20px
- Box-shadow: dual layer (inset highlight + depth + brand glow on pulse)
- Header height: 52px (verbatim)
- Workspace text "Northwind Studio": DM Sans 14.5px 600wt #15101F,
  letter-spacing -0.008em (verbatim)
- Empty state: 41×41 brand-soft icon wrap (verbatim), 15px 600wt title
  (spec: 15.5px — rounded to 15 to fit), 13px subtitle, max-width 240px
- Expand: max-height 0 → 220px over 250ms cubic-bezier(0.22,0.61,0.36,1)
- Attention pulse: mk-tray-attention 600ms cubic-bezier(0.34,1.56,0.64,1)
  bouncy scale + brand-glow shadow swap (marketing-only, not in the real ext)

SessionControlPanel.tsx
───────────────────────
Spec ref: EXTENSION_DESIGN_SPEC.md Section 2.6
Values copied verbatim:
- Position: absolute bottom 22-32px, left 50% (translateX -50%)
- Background: rgba(20,22,28,0.82)
- Backdrop-filter: blur(24px) saturate(140%)
- Border-radius: 999px (full pill)
- Padding: 8px 8px 8px 22-24px (verbatim)
- Display: inline-flex, align-items center, gap 14-16px
- Box-shadow: triple layer (verbatim three rules)
- Live dot: 8px #34C29A, 0 0 0 3px rgba(52,194,154,0.20) ring,
  mk-sc-live 2s ease-in-out infinite (verbatim ring-pulse keyframe)
- Status text: "Session started", 14-15px 500wt rgba(255,255,255,0.95)
- Divider: 1px × 18px rgba(255,255,255,0.12) (verbatim)
- Pause: 34-36px height, padding 0 14-16px, 1px white-20 border, 13-14px 600wt
- End: same dimensions, rgba(229,72,77,0.12) bg, #E5484D text/border
- Entry: translateY(20px) opacity 0 → 0 opacity 1 over 250ms cubic-bezier(0.22,0.61,0.36,1)
```

---

## Verification

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | Clean — 0 errors |
| `pnpm build` | Clean — production build succeeds, 53 routes generated |
| `npx eslint "app/(marketing)/**/*.{ts,tsx}"` | Clean — 0 errors, 0 warnings |
| Forbidden-import greps (all 5) | Zero matches across `app/(marketing)/` |
| Reduced-motion behavior | All `.hcd-*` keyframe animations + transitions disabled; orchestrator jumps to the `hold` frame and stays |
| Files under `app/(marketing)/_components/demos/` | 9 files: BrowserFrame (kept), DemoBoundary (kept), HeroCaptureDemo (new), TicketCardMock (kept, used by VoiceTicketDemo), VoiceTicketDemo (kept), index.ts, sessionsDemoData.ts, plus the `northwind/` and `annote/` subdirectories |

### Grep results

```
$ grep -r "from ['\"]@/lib/firebase"          app/(marketing)/ → 0 matches
$ grep -r "from ['\"]@/lib/client/workspaceContext" app/(marketing)/ → 0 matches
$ grep -r "from ['\"]@/components/"           app/(marketing)/ → 0 matches
$ grep -r "useWorkspace"                      app/(marketing)/ → 0 matches
$ grep -r "useAuthState"                      app/(marketing)/ → 0 matches
```

### Bundle size

The Next 16 / Turbopack production-build output table on this project still does not print the size column (same Windows quirk reported in Phase 2B v1's summary — the `Size` and `First Load JS` columns are blank for *all* routes). The compilation itself completes without errors and `/` is properly registered (`ƒ /`). The new code is a single client component with no new dependencies (just React `useReducer`/`useEffect`/`useRef`/`useState`), so the bundle delta is small: pure JSX trees and CSS class swaps. Aakash can confirm an absolute number via a Vercel deploy preview or a separate `analyze` build if a hard <250KB check is required.

### Mobile fallback decision

**Option B (static final composition under 640px) — chosen.**

Reasoning: the full storyboard requires the popup, control panel, and tray to all be visible simultaneously without overlapping. At 640px the popup + tray collide regardless of how the timing is scaled, and shrinking text to fit breaks the spec's pixel commitments. Showing the end-state composition (Northwind dashboard + control panel + tray with one ticket) communicates the "magic moment" — the same one the desktop loop holds at t=9.5s — without trying to animate inside a too-small viewport.

The fallback is implemented in CSS only (no React branches), inside the `@media (max-width: 640px)` block in `marketing.css`. It hides the centered popup/loading/confirm slot, the cursor, the highlighter, and the click-flash, while forcing the tray to its expanded state with the ticket visible and the control panel to its `is-on` state. The orchestrator timeline still runs in JS but is visually invisible at mobile sizes, so no special branching code is needed.

---

## Deviations from the storyboard and spec

1. **Popup/confirmation card widths.** Spec says `min(380px, 92vw)` for popup and `min(360px, 92vw)` for confirmation. In the demo I use `min(360px, 86%)` for both so the cards stay proportional inside the 980×560 stage box and don't crowd the Northwind dashboard at the edges. Same backgrounds, blur, border, shadow, and radius.

2. **Tray width.** Spec says `min(360px, 90vw)`. I use `min(330px, 90%)` so the tray sits comfortably in the bottom-right without overlapping the SessionControlPanel pill at the bottom-center. Cosmetic; all internal proportions are spec-faithful.

3. **Tray attention pulse.** The 0.5s "tray-expanding" beat plays a bouncy `mk-tray-attention` keyframe to draw the viewer's eye to the "Start session" button before the session begins. This is a marketing-only flourish — the real extension does not pulse the tray. Without it, viewers miss the "click here" cue inside a 10-second loop.

4. **Loading-state width and text size.** Spec puts the loading composition inside the full extension chrome (15px text, max-width 322px). The demo nests it inside a smaller centered card (14.5px text, max-width 240px) to fit alongside the popup/confirmation in the same anchored slot. Colors, ring keyframe, float keyframe, dot keyframe — all verbatim.

5. **TicketRowMock simplifications.** Spec calls for a 51px icon column with an actions column (edit/delete buttons appearing on hover). The demo uses 40px icon and no actions column because the loop has no hover interaction — the entire row's job is to land cleanly with the success glow and stay visible until the loop restarts.

6. **Cursor movement.** The cursor visual transitions between three positions (`tray → start → target`) using a single CSS `transform` transition rather than a smooth path animation. It's a hint, not a focus — over-engineering this would steal attention from the highlighter and popup.

7. **Click flash.** Added a small `mk-click-flash` ripple at the click moment (purple-tinted, expands and fades over 350ms). Not in the spec but the moment-of-click otherwise has no visible feedback besides the popup appearing, which felt too abrupt.

8. **Northwind palette.** Teal `#4FB6B1` accent specifically chosen to be visually distinct from Annote purple. Spec doesn't dictate Northwind's branding (the spec is for the Annote side); this is a marketing-side judgment call that keeps the purple highlight unambiguous.

9. **Bundle isolation.** All Annote-mirror components live in `app/(marketing)/_components/demos/annote/` and Northwind in `.../demos/northwind/`. This keeps the imports namespaced and makes it obvious at a glance that nothing here touches the real `components/CaptureWidget/`.

---

## Places where the spec was ambiguous (judgment calls)

1. **Popup transcript styling.** Spec doesn't describe how the transcript should be rendered inside the popup during recording. I used italic 13px white-85 with a `rgba(255,255,255,0.04)` background tile and a blinking caret. The italic conveys "raw, unstructured" so the viewer reads it as live transcription, not the polished output.

2. **Popup recording-status indicator.** Spec mentions the popup as a container for the mic orb but doesn't specify a "Recording…" label. I added a small label below the orb (red pulsing dot + 12px "Recording…" text) so the viewer knows what beat they're watching when the orb appears.

3. **Confirmation card metadata block placement.** Spec Section 4.6 describes a metadata block (URL / element / browser / timestamp) "if available", but doesn't specify whether it appears in every confirmation. I included a compact two-row metadata block (Page + Element) because it sells the "AI captured the context" story; the timestamp and browser were omitted to keep the card under 360px tall.

4. **Reduced-motion held frame.** Spec doesn't specify which frame to hold for reduced-motion users. I chose `hold` — the moment after the ticket has fully landed in the tray with the control panel still visible. It's the "story complete" frame, matching the V1/V2 reduced-motion decision pattern.

5. **Highlighter geometry over the CTA.** Spec describes the highlighter as a single fixed-position div updated on mousemove. The demo has no mouse, so I used percent-based positioning (`top:11.5% left:62% width:30% height:9%`) calibrated against the Northwind layout. If the dashboard layout changes those percents need updating — alternative would be to measure the target element via a ref in `useLayoutEffect`, but that adds a render pass and a ResizeObserver dependency for marginal benefit at this resolution.

---

## Fidelity questions for Aakash

1. **Northwind accent color.** I chose teal `#4FB6B1` to keep the purple highlight unambiguous. If the marketing universe has a preferred "neutral SaaS" accent (e.g., the Loomly blue from Phase 1's sessionsDemoData), I can swap it. The Phase 1 mock data references "Loomly" with no concrete brand color, so I picked something that reads as a serious-but-not-Annote product.

2. **Auto-loop pacing.** The spec storyboard's timing (recording at 2.2s → typing starts at 3.0s → loading at 5.5s) compresses the recording-orb-only window to ~800ms before typing begins. At that pace the orb feels rushed; a viewer barely sees it breathe before the transcript starts. I followed the spec exactly. Worth confirming whether to extend the recording-only beat to ~1.2s and shorten typing to ~2s.

3. **Cursor visual.** I used a small SVG arrow cursor with a subtle drop-shadow. The spec calls this "a small SVG cursor (or just a dot with a subtle glow)" — happy to swap to a dot if the arrow feels too literal.

4. **Click flash.** Marketing-only. If too noisy, remove the 4-line `.hcd-click-flash` CSS block + the conditional render in `HeroCaptureDemo.tsx`.

5. **ConfirmationCard metadata block.** Included Page + Element. If you prefer no metadata (just title + description for a cleaner card), drop the `.hcd-conf-meta*` rules and the JSX block.

6. **Tray attention pulse on the "Start session" beat.** Bouncy scale + brand glow over 600ms. If this feels too "look-at-me", I can replace it with a quieter ease-in-out shadow-only highlight. The cursor moves to the start button at the same time, so the pulse may be redundant.

7. **The "Recording…" label inside the popup.** Added for narrative clarity (so the viewer knows what they're watching). Spec doesn't show this. If you prefer to hide it and let the mic orb + waveform speak for themselves, removing the `.hcd-popup-status` block is a single edit.

---

## Notes for future phases

- The old `BrowserFrame.tsx` and `DemoBoundary.tsx` components in `_components/demos/` are still exported but unused by any current section. Safe to delete in a follow-up cleanup pass; I left them to keep this PR's diff focused on the hero rebuild.
- `TicketCardMock` is still used by `VoiceTicketDemo` in the Suite panel. The Suite panels themselves are slated for refinement in a later phase — the data-tile placeholders in `Suite.tsx` (capture, sessions, integrations panels) all still use the static Phase 2A markup.
- `marketing.css` is now ~3,610 lines. The Phase 2A `.viz-mic` / `.vb-*` / `.vs-*` / `.vi-*` static placeholder rules (still alive in the file) become dead code as the corresponding panels move to real demos. Worth a sweep when the Suite refinements land.
