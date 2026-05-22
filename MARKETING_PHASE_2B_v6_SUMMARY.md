# Marketing Phase 2B v6 — Interactive Showcase

**Date:** 2026-05-22
**Scope:** Convert the auto-playing 11s HeroCaptureDemo loop into an interactive,
click-driven showcase. Seven fixes: custom cursor + tooltip, click-triggered
capture, slower paced timing, click-anchored pill/highlight, clickable tray
tickets with per-ticket data + mock screenshots, active-session state, and a
richer faux-site mockup with atmospheric blur. The forklifted real components
(MicOrb, CapturePill, SessionControlPanel, FeedbackItem, ElementHighlighter…)
are untouched.

---

## The seven fixes

### Fix 1 — Custom cursor + tooltip over the demo zone

Sourced verbatim from the live extension:

- **Cursor SVG**: `createCommentCursor()` in
  [SessionOverlay.tsx:11-18](components/CaptureWidget/SessionOverlay.tsx#L11) —
  a 32×32 white-fill / black-stroke speech-bubble, hotspot `(6,6)`. Replicated as
  `<CommentCursorSvg>` in
  [DemoCursor.tsx:33-44](app/(marketing)/_components/demos/annote/DemoCursor.tsx#L33)
  (rendered at 28px, hotspot scaled to 7px).
- **Tooltip**: the `.echly-capture-tooltip` block at
  [SessionOverlay.tsx:342-366](components/CaptureWidget/SessionOverlay.tsx#L342) —
  "Click anywhere to capture", `rgba(0,0,0,0.75)`, white 12px/500 DM Sans, 6×12
  padding, radius 8, blur 4px, 20px cursor offset with edge-flip. Replicated in
  [DemoCursor.tsx:74-99](app/(marketing)/_components/demos/annote/DemoCursor.tsx#L74)
  + `.hcd-cursor-tooltip` CSS.

Behavior, implemented in
[HeroCaptureDemo.tsx](app/(marketing)/_components/demos/HeroCaptureDemo.tsx)
`handlePointerMove` / `handlePointerLeave`:

- The stage tracks pointer position relative to its box.
- `inDemoZone` is true only when the pointer is **not** over any
  `[data-annote-ui]` element (`target.closest("[data-annote-ui]")`) **and** the
  demo is idle — exactly mirroring the extension's
  `[data-annote-ui] { cursor: auto }` carve-out
  ([SessionOverlay.tsx:292-294](components/CaptureWidget/SessionOverlay.tsx#L292)).
- When `inDemoZone`, the native cursor is hidden via `.hcd.is-demo-zone { cursor: none }`
  and the bubble + tooltip render (both `pointer-events: none`, so clicks pass
  through to the stage).
- Over the tray / panel / pill / modal, the bubble disappears and the native
  cursor returns; tray-ticket hover states work normally.

**Why the extension uses a body-level `cursor` and the demo uses a follower div:**
the extension owns the whole page, so it injects a global `!important` cursor
rule on `<body>`. The demo is one box in a larger marketing page, so it can't set
a global cursor — instead it hides the cursor only on the stage and renders a
position-tracked bubble. Visual is identical (same SVG, same tooltip).

### Fix 2 — Click-triggered capture sequence (state machine)

[HeroCaptureDemo.tsx:54-62](app/(marketing)/_components/demos/HeroCaptureDemo.tsx#L54):

```ts
type DemoState =
  | { kind: "idle" }
  | { kind: "capturing"; rect: Rect; phase: CapturePhase }
  | { kind: "modal-open"; ticket: MockTicket };
```

Transitions:

```
idle ──click in demo zone──▶ capturing(highlight…modal-opens) ──▶ modal-open(captured ticket)
  ▲                                                                       │
  └──────────── modal dismiss (Save / X / backdrop) ─────────────────────┘
idle ──click a tray ticket──▶ modal-open(that ticket) ──dismiss──▶ idle
```

`handleStageClick` ignores clicks on `[data-annote-ui]`, resolves the element
under the pointer via `document.elementFromPoint` → nearest `[data-faux-target]`,
takes its bounding rect, and starts the sequence. `runCaptureSequence` chains
`setTimeout`s; `clearTimers()` cancels all pending timeouts on dismiss / new
click. The modal **does not auto-dismiss** — it holds until the user clicks
Save / X / backdrop (`handleModalClose` → idle, clearing the highlight).

### Fix 3 — Slower timing (~9s)

Phase durations in `PHASE_DURATION`
([HeroCaptureDemo.tsx:65-73](app/(marketing)/_components/demos/HeroCaptureDemo.tsx#L65)):

| Phase | Duration |
|-------|----------|
| highlight | 600ms |
| pill-in | 500ms |
| listening | 1500ms |
| transcribing | 4000ms |
| sending | 800ms |
| ticket-lands | 1200ms |
| modal-opens | 400ms |
| **total** | **~9.0s** |

The 4s transcribing beat drives the `SpeechCaption` word-by-word reveal (200ms /
word over the 9-word transcript = ~1.8s of words inside the 4s window — slow
enough to read each word as it lands). Then the modal opens and holds.

### Fix 4 — Pill + caption + highlight anchor to the click

`computePillPosition`
([HeroCaptureDemo.tsx:78-94](app/(marketing)/_components/demos/HeroCaptureDemo.tsx#L78))
mirrors the prompt's spec / the real extension: prefer **below** the clicked
element (`rect.bottom + 12`), flip **above** if it would overflow the stage
(accounting for ~120px of caption headroom), and clamp `left` into the stage. The
`.hcd-pill-anchor` is absolutely positioned at the computed `top/left`. The
`SpeechCaption` is a child of the anchor, so it sits beneath the pill and moves
with it. The `ElementHighlighter` is fed the clicked element's rect directly
(2px `#5A49BF` outline + `rgba(37,99,235,0.1)` fill, verbatim from
[elementHighlighter.ts:8-11](components/CaptureWidget/session/elementHighlighter.ts#L8)).

### Fix 5 — Clickable tray tickets + per-ticket data + mock screenshots

- **Data**: [mockTickets.ts](app/(marketing)/_components/demos/annote/mockTickets.ts)
  now gives every ticket a full payload — `description`, `tags`, `screenshot`
  (`{ type, highlight }`), `element` / `browser` / `url`. Five baseline tickets
  (`MOCK_DEMO_TICKETS`) + the live-captured `DEMO_CAPTURE_TICKET`.
- **Clickable**: [ExtensionTray.tsx](app/(marketing)/_components/demos/annote/ExtensionTray.tsx)
  takes an `onTicketClick(ticket)` and wires it into the forklifted
  `FeedbackItem`'s existing `onEditRequest` (the row already had `onClick` →
  `onEditRequest(id)` and `cursor: pointer`). No modification to the forklifted
  row — only the prop is now connected.
- **EditModal** ([EditModal.tsx](app/(marketing)/_components/demos/annote/EditModal.tsx))
  now takes `ticket: MockTicket` (was a separate `EditModalData`), derives its
  header icon via `iconForType(ticket.type)`, builds the screenshot-info tooltip
  from `ticket.element/browser/url`, and renders `<MockScreenshot screenshot={ticket.screenshot}/>`
  in place of the v5 shared gradient.

**Screenshot components** (`annote/screenshots/`, each a self-contained ~30-50
line SVG, `viewBox 0 0 280 180`, light-gray bg, simplified UI shapes, a `#5A49BF`
highlight rectangle marking the captured region):

| File | Ticket | What it mocks |
|---|---|---|
| `MobileLoginScreenshot.tsx` | t1 bug | phone frame + login form, submit button boxed |
| `LandingSectionScreenshot.tsx` | t2 copy | heading + three content blocks boxed |
| `PricingCardScreenshot.tsx` | t3 ui | 3 pricing cards, Pro card elevated + boxed |
| `FooterScreenshot.tsx` | t4 broken-link | dark footer, "Status" link boxed |
| `TestimonialSlotScreenshot.tsx` | t5 content | empty dashed testimonial slot boxed |
| `DemoSiteHeroScreenshot.tsx` | t6 captured | faux-site hero w/ illustration, headline boxed |

`screenshots/index.tsx` is the router (`MockScreenshot`) mapping
`screenshot.type` → component (t5 reuses `landing-section` with the
`testimonial-slot` highlight → routes to `TestimonialSlotScreenshot`).
**Approach: pure inline SVG** — no assets, no external deps, renders crisp at any
DPR, fills the 200px modal slot via `width/height: 100%`.

### Fix 6 — Active session state

The real extension eyebrow string is literally **"Active session"**
([CaptureWidget.tsx:1127](lib/capture-engine/core/CaptureWidget.tsx#L1127):
`globalSessionPaused ? "Paused" : "Active session"`) — `.tl-eyebrow` CSS
uppercases it to read "ACTIVE SESSION". The tray already supported this; the
orchestrator now passes `paused={false}`. The `SessionControlPanel` (forklift,
unchanged) renders its active branch with `sessionPaused={false}`: green live
dot + "Session started" + ghost **Pause** button + danger **End**. No string
invention — both match the live component.

### Fix 7 — Richer faux site + atmospheric blur

**New mockup**: [FauxSite.tsx](app/(marketing)/_components/demos/FauxSite.tsx) —
mostly-visual landing page: abstract logomark (gradient square + teal dot), tight
nav (Product / Pricing / Sign up + "Get a demo" CTA), hero (4-word headline
"Built for serious teams", one sub-line, gradient "Start free" CTA + ghost
"Watch the tour"), an **abstract hero illustration** (overlapping gradient
circles + a floating glass card with bars and a sparkline), a 5-shape logo strip,
and 3 icon feature cards. No lorem ipsum. Clickable elements carry
`data-faux-target` so the click handler frames a real element.

**Design rationale**: v5's text-heavy "Build better software" block read like a
wireframe. A real landing page is anchored by a *visual* — hence the illustration
+ logo strip + feature cards, with copy kept to short natural lines. The CTA is
the most rewarding click target (it gets the highlight + a believable
"hero copy" ticket).

**Blur treatment** (`.hcd-faux`):

| | v5 | v6 (idle) | v6 (capturing) |
|---|---|---|---|
| blur | 2px | **8px** | 5px |
| opacity | 0.55 | **0.4** | 0.55 |
| saturate | 0.7 | **0.6** | 0.72 |

Plus two overlays: `.hcd-faux::after` — an atmospheric depth gradient (lighter
top → heavier bottom, `rgba(248,247,245, 0.2→0.4)`); and `.hcd-vignette` — a
radial vignette (`transparent 40% → rgba(0,0,0,0.08)`) focusing the eye toward
center. Result: the site reads as frosted-glass atmosphere, not a competing UI.

**Local un-blur — flagged.** The prompt's preferred "clip a sharp window around
the highlight rect" was **not** implemented; the accepted simpler fallback is in
place — during the `capturing` state the whole background eases from 8px/0.4 to
5px/0.55 (`.hcd.is-capturing .hcd-faux`), so the captured element is more
visible. See Outstanding Questions.

---

## State machine diagram

```
                 click (faux element)            ~9s chained timeouts
   ┌─────┐  ───────────────────────────▶  ┌───────────┐  ───────────▶  ┌────────────┐
   │idle │                                 │ capturing │                │ modal-open │
   └─────┘  ◀───────────────────────────  └───────────┘                └────────────┘
      │            modal dismiss                                              ▲
      │                                                                       │
      └───────────── click a tray ticket ────────────────────────────────────┘

   capturing.phase:  highlight → pill-in → listening → transcribing
                     → sending → ticket-lands → modal-opens
```

- **idle**: faded site, tray (5 tickets, "ACTIVE SESSION"), active control panel,
  comment cursor over the click zone.
- **capturing**: highlight rect on the clicked element, pill anchored beneath it,
  caption listening→transcribing, send→spinner, 6th ticket lands w/ success glow.
- **modal-open**: EditModal centered, backdrop dims, holds until dismiss.

---

## Verification

| Check | Result |
|---|---|
| `npx tsc --noEmit` | Clean — 0 errors |
| `npx next build` | ✓ Compiled successfully in 5.3s; 53/53 static pages; `/` registered |
| Forbidden-import grep (firebase / workspaceContext / @/lib/server / @/providers / useWorkspace / useAuthState / onAuthStateChanged / @tiptap / DescriptionEditor / uploadAttachment) | 0 matches |
| Real-component diff (`components/CaptureWidget/`, `lib/capture-engine/`) | 0 files changed |

### Interactive behavior (to confirm in the browser)

- Hover demo background → comment cursor + "Click anywhere to capture" tooltip.
- Hover tray / panel → cursor disappears, native cursor returns, ticket hover works.
- Click background → highlight on clicked element → ~9s sequence → modal opens & holds.
- Click Save / X / backdrop → modal closes, returns to idle, highlight cleared, tray back to 5.
- Click any tray ticket → its EditModal opens with that ticket's title / description / tags / screenshot.

### Bundle size

Same Windows/Turbopack quirk as v1–v5: the build table prints no `Size` /
`First Load JS` column for any route. Compilation succeeds and `/` is registered.
v6's delta over v5: **removed** one data constant + the gradient-placeholder CSS;
**added** `FauxSite`, `DemoCursor`, six small SVG screenshot components + a router,
and the expanded ticket data. All are presentational TSX/SVG/CSS — no new
libraries enter the graph (framer-motion was already present). Net change is
small; a precise number needs a Vercel preview or `@next/bundle-analyzer`.

---

## Files

### New
- `annote/DemoCursor.tsx` — comment cursor + tooltip follower
- `annote/screenshots/{MobileLogin,LandingSection,PricingCard,Footer,TestimonialSlot,DemoSiteHero}Screenshot.tsx` — six mock SVGs
- `annote/screenshots/index.tsx` — `MockScreenshot` router
- `demos/FauxSite.tsx` — richer mock landing page

### Rewritten
- `demos/HeroCaptureDemo.tsx` — click-driven state machine (replaces the setTimeout loop)
- `annote/mockTickets.ts` — full per-ticket payloads + `screenshot` field
- `annote/EditModal.tsx` — takes `ticket: MockTicket`, renders `<MockScreenshot>`
- `annote/ExtensionTray.tsx` — `onTicketClick` wired into `FeedbackItem.onEditRequest`
- `_styles/marketing.css` — `.fs-*` mockup, atmospheric blur + overlays, `.hcd-cursor*`, `.editor-screenshot-mock`; removed the v5 gradient-placeholder CSS

### Untouched (forklift wins kept)
- `annote/CapturePill.tsx`, `VoicePillContent.tsx`, `PillHintText.tsx`,
  `Waveform.tsx`, `SelectedElementOverlay.tsx`, `PillErrorContent.tsx`,
  `ElementHighlighter.tsx`, `FeedbackItem.tsx`, `SessionControlPanel.tsx`,
  `SpeechCaption.tsx`, `icons.tsx`
- All real components under `components/CaptureWidget/` and `lib/capture-engine/`
- `Hero.tsx` (still renders `<HeroCaptureDemo />`)

---

## Outstanding questions (for visual side-by-side)

1. **Local un-blur fallback used (Fix 7).** I implemented the accepted simpler
   version — the whole background crisps slightly (8px→5px, 0.4→0.55 opacity)
   during capture — not the clip-path "sharp window around the highlight". A true
   clip-path window tracking an arbitrary clicked element across a blurred,
   separately-rendered layer is fragile (the faux site and highlight live in
   different stacking layers; clip-path on a `filter`ed ancestor interacts badly
   with the depth overlay). Say the word if you want me to attempt the
   clip-path version.

2. **Reduced motion**: with `prefers-reduced-motion`, the comment cursor is
   suppressed (`cursorActive` requires `!reducedMotion`) and the capture sequence
   still runs on click but without the looping orb/word animations (those keyframe
   rules are disabled in the existing reduced-motion block). Clicking a tray
   ticket still opens its modal. Confirm this is the desired reduced-motion
   behavior, or whether you'd prefer the demo to render a fully static
   "already-captured" frame instead.

3. **`elementFromPoint` granularity**: clicks resolve to the nearest
   `data-faux-target` ancestor, so the highlight always frames a sensible element
   (CTA, headline, nav link, feature card…) rather than a stray text node. Clicks
   on empty background fall back to a comfortable box centered on the cursor.
   This worked cleanly with the FauxSite structure — no nesting confusion to flag.

4. **Captured ticket is demo-only**: the 6th ticket appears during the sequence
   and on the modal, then the tray returns to 5 on dismiss (so repeated clicks
   stay clean). If you'd rather it persist in the tray after capture, that's a
   one-line change.
