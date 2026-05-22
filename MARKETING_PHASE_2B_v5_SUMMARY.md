# Marketing Phase 2B v5 — Refinement Pass

**Date:** 2026-05-22
**Scope:** Fix the six issues Aakash flagged side-by-side with the live extension —
tray visual, control-panel visual, washed-out layering, empty tray, missing
speech caption, missing end-state edit modal. The v4 recording-pill forklift and
its siblings are untouched.

---

## Key finding before the work began

v4's `ExtensionTray` reproduced the **legacy** `.echly-sidebar-*` hierarchy
(`CaptureWidget.tsx` L1402-1504). That is *not* what the live extension shows.
The real extension-mode tray in screenshot 3 is the **`.pill.pill-tickets` /
`tl-*` hierarchy** ([CaptureWidget.tsx:1107-1399](lib/capture-engine/core/CaptureWidget.tsx#L1107)) —
avatar (`.pill-mark-logo`), eyebrow (`.tl-eyebrow` + `.live-dot`), title
(`.tl-title`), link/mic/X icon group (`.pill-icon-btn`), and the
"AI · auto-structured" / "Exit session" footer (`.tl-foot`). That mismatch is
why the v4 tray looked wrong. This pass rebuilds the tray against the correct
class family.

The strings "auto-structured", "Exit session", and "Feedback At The Speed…"
were grepped and confirmed to live in `CaptureWidget.tsx` (the extension tray) —
not in `WidgetFooter`/`CaptureHeader`, which is the legacy path v4 used.

---

## The six fixes

### Fix 1 — Lift tray + control panel out from under the faded background

`HeroCaptureDemo.tsx` now renders two explicit sibling layers:

```
.hcd
  ├─ .faux-site-layer.hcd-faux   ← filter: blur(2px) saturate(0.7); opacity: 0.55
  ├─ .hcd-vignette
  └─ .annote-elements-layer.hcd-annote-layer   ← NO filter, NO opacity reduction
        ├─ ElementHighlighter
        ├─ .hcd-pill-anchor → CapturePill + SpeechCaption
        ├─ .hcd-sc-anchor   → SessionControlPanel
        ├─ .hcd-tray-anchor → ExtensionTray
        └─ .hcd-modal-anchor → EditModal
```

The Annote elements are no longer descendants of the blurred subtree, so they
render crisp. Z-index hierarchy inside the element layer: tray/SC default,
pill `z-index: auto`, modal anchor `z-index: 30`.

### Fix 2 — Rebuild ExtensionTray against the real `tl-*` structure

[ExtensionTray.tsx](app/(marketing)/_components/demos/annote/ExtensionTray.tsx)
rewritten to compose `.echly-v2 > .pill.pill-tickets`:
`.tl-head` (`.pill-mark-logo` Annote-mark avatar + `.tl-title-block` with
`.tl-eyebrow`/`.live-dot` + `.tl-title-hover-row`/`.tl-title` + `.tl-icon-group`
link/mic/X `.pill-icon-btn`s) → `.pill-rule` → `.tl-list` (the existing
forklifted `FeedbackItem` `.ticket` rows) → `.tl-foot` ("AI · auto-structured"
+ "Exit session"). Avatar uses `/annote-logo-icon.svg` from `public/`, same as
the source header.

### Fix 3 — SessionControlPanel

No rewrite needed: the v4 forklift is already byte-faithful to
`components/CaptureWidget/SessionControlPanel.tsx` and renders the paused state
(amber `.paused` dot + "Session paused" + brand `Resume` + danger `End`) when
`sessionPaused={true}`. The orchestrator now passes `sessionPaused={true}`,
matching screenshot 2.

### Fix 4 — Pre-populate 5 tickets (+ 6th captured live)

[mockTickets.ts](app/(marketing)/_components/demos/annote/mockTickets.ts) holds
the five baseline tickets, the 6th demo ticket (`DEMO_NEW_TICKET`, `isNew`), the
full session title, the transcript, and the `DEMO_EDIT_MODAL` payload. Type →
icon mapping (Lock / Type / Palette / Link / MessageSquare) lives in
[icons.tsx](app/(marketing)/_components/demos/annote/icons.tsx) using
`lucide-react`. Tray opens with 5 tickets; the 6th lands on top with the
`success-flash` glow during the `landed` frame, then is removed for loop
continuity after the modal exits.

### Fix 5 — SpeechCaption under the recording pill

[SpeechCaption.tsx](app/(marketing)/_components/demos/annote/SpeechCaption.tsx)
(marketing-only, not a forklift). White-glass box anchored beneath the pill via
`margin-top: 8px`. Two states: **listening** ("We're listening · just speak
naturally" + pulsing red dot) and **transcribing** (same indicator on top, the
transcript revealed word-by-word, 200ms/word, each word fading/sliding in with
`cubic-bezier(0.22,0.61,0.36,1)`). Transcript: *"hero copy could be clearer
about the value prop"*. It is a child of `.hcd-pill-anchor`, so it sits cleanly
beneath the pill and moves with it — no overlap with the pill itself.

### Fix 6 — End-state EditModal (forklifted, static description)

[EditModal.tsx](app/(marketing)/_components/demos/annote/EditModal.tsx)
forklifted from the **real edit modal that opens when you click a tray ticket**:
`TicketEditorOverlay` in
[FeedbackItem.tsx:188-547](lib/capture-engine/core/FeedbackItem.tsx#L188).

**Decision (confirmed via the in-chat question before forklifting):** the real
modal has **no severity selector and no visible metadata block** — those fields
in the v5 prompt don't exist in production — and its description field is the
heavy `DescriptionEditor` (TipTap + ProseMirror + `useAiImprove` + firebase
`uploadAttachment`, ~480KB, all forbidden imports). Chosen option: **"Faithful +
static desc"** — forklift everything real, swap only the description editor for a
static read-only paragraph, and don't invent the missing fields.

See the diff section below.

---

## EditModal diff against source (`TicketEditorOverlay`)

**Preserved verbatim (className-for-className):** `.editor-overlay-backdrop`,
`.editor-overlay`, `.editor-overlay-head` / `-head-left` / `.editor-overlay-icon`
/ `.editor-overlay-label` / `.editor-close-btn` (+ its SVG path), the
`.editor-overlay-body`, the `.editor-title-row` / `.editor-title-pencil` /
`.editor-title-input`, the `.editor-screenshot` + `.editor-screenshot-info` +
`Info` icon + multiline tooltip, the `.editor-tags` / `.editor-tag` /
`.editor-tag-remove` / `.editor-tag-add` (+ its SVG), the `.editor-divider`, the
`.editor-steps` / `.editor-steps-label`, and the `.editor-overlay-foot` /
`.editor-save-btn`.

**Removed (imports / hooks not reachable in a read-only demo):**
- `getTicketIconFromTags`, `parseDeviceInfo`, `formatLocalDateTime`,
  `tryBuildScreenshotUrl` (helpers), `StructuredFeedback` type
- the `lazy(() => import(DescriptionEditor))` + `<Suspense>` block
- all `useState`/`useEffect`/`useCallback` business logic (edited title/desc/tags
  state, save guard, Escape listener, screenshot-expand state) — the demo modal
  is static

**Changed (the two documented modifications):**
1. `<DescriptionEditor …/>` (inside `.editor-steps`) → a static
   `<p className="editor-static-desc">{description}</p>`.
2. The `screenshotUrl`-driven `<img>` → a CSS-gradient
   `.editor-screenshot-placeholder` (no firebase storage URL). The screenshot
   `.editor-screenshot-info` tooltip is kept and fed the element/browser/URL
   strings, so the metadata is still surfaced (matching the real modal's
   tooltip-only treatment) without inventing a metadata block.

**Added:** framer-motion entry/exit (opacity 0→1, scale 0.96→1, 250ms
`cubic-bezier(0.22,0.61,0.36,1)`; exit scale→0.98, 200ms) and the backdrop fade.
The source had no entry animation (it mounts instantly inside the extension);
the v5 prompt specifies one for the demo.

**Demo state hardcoded** (from `DEMO_EDIT_MODAL`): title "Hero copy could be
clearer about the value prop"; the description paragraph; tags
`["copy","ux","hero","messaging"]`; tooltip metadata element `h1.hero-headline`,
browser `Chrome 120 on macOS`, url `https://example-site.com/`.

---

## CSS copied from globals.css (with source citations)

All added under `.marketing-root .echly-v2` scope in
[marketing.css](app/(marketing)/_styles/marketing.css):

| Class family | Source in globals.css |
|---|---|
| `.pill` + `.pill::before` | L6553-6591 |
| `.pill-mark` / `.pill-mark.pill-mark-logo` | L6604-6621 |
| `.pill-icon-btn` (+ :hover, svg) / `.pill-rule` | L6646-6660 |
| `.ai-dot` | L6834-6841 |
| `.pill-tickets` | L8458-8462 |
| `.tl-head` / `.tl-head .pill-mark` / `.tl-icon-group` | L8464-8480 |
| `.tl-title-block` / `.tl-eyebrow` / `.tl-eyebrow .live-dot` / `.tl-title` | L8482-8515 |
| `.tl-list` (+ scrollbar pseudos) | L8518-8530 |
| `.tl-title-hover-row` | L10475-10483 |
| `.tl-foot` / `.tl-foot-left` / `.tl-foot-home` (+ :hover) | L8862-8891 |
| `@keyframes v2-pulse-soft` | L7513-7516 |
| `.editor-overlay-backdrop` / `.editor-overlay` | L9453-9483 |
| `.editor-overlay-head` family + `.editor-close-btn` | L9486-9534 |
| `.editor-overlay-body` (+ scrollbar) | L9537-9549 |
| `.editor-title-input` / `.editor-title-row` family | L9551-9606 |
| `.editor-screenshot` + `.editor-screenshot-info` + multiline tooltip | L9609-9713 |
| `.editor-tags` / `.editor-tag` / `.editor-tag-add` family | L9715-9778 |
| `.editor-divider` / `.editor-steps` / `.editor-steps-label` | L9793-9809 |
| `.editor-overlay-foot` / `.editor-save-btn` (+ :hover) | L9898-9924 |

**Adaptations (documented inline):**
- `.editor-overlay-backdrop` / `.editor-overlay`: `position: fixed` → `absolute`
  and z-index `2147483639/40` → `20/21` so the modal sits inside the demo stage,
  not the viewport. Width capped to `min(440px, calc(100% - 48px))` and screenshot
  slot fixed at 200px (source uses `45vh`) for the constrained stage.

**Marketing-only CSS (NOT in globals.css):**
- `.editor-screenshot-placeholder` (+ `::after` faux headline) — gradient
  stand-in for a captured frame.
- `.editor-static-desc` — read-only description paragraph.
- `.demo-caption*` family + `@keyframes demo-caption-pulse` — SpeechCaption.

---

## Updated 11-second storyboard (as implemented)

| Time | Frame | Visible |
|---|---|---|
| 0.0s | idle | Faded faux site. Tray (5 tickets) + paused control panel, sharp. |
| 1.0s | cursor-moving | (transition beat) |
| 2.0s | highlighted | ElementHighlighter on CTA |
| 2.2s | recording | Pill anchored to CTA + caption "We're listening" |
| 3.5s | transcribing | Caption types transcript word-by-word |
| 6.0s | sending | Send button → spinner |
| 6.5s | landed | 6th ticket lands on top with success glow (tray now 6) |
| 7.5s | modal | EditModal opens (backdrop fade + scale-in) |
| 9.5s | hold | Modal held for reading |
| 10.5s | modal-exit | Modal exits (scale→0.98 fade); tray back to 5 |
| 10.9s | crossfade | Tray + SC dim |
| 11.2s | (loop restart) | idle |

IntersectionObserver pauses the loop off-screen; reduced-motion freezes on the
`modal` frame with all dot/word animations disabled.

---

## Verification

| Check | Result |
|---|---|
| `npx tsc --noEmit` | Clean — 0 errors |
| `npx next build` | ✓ Compiled successfully in 5.4s; 53/53 pages; `ƒ /` registered |
| Forbidden-import greps (firebase / workspaceContext / @/lib/server / providers / useWorkspace / useAuthState / onAuthStateChanged) | 0 actual imports |
| Heavy-dep greps (getTicketIconFromTags / DescriptionEditor / @tiptap / uploadAttachment) | 0 actual imports (only JSDoc mentions) |

Grep note: a count-mode grep matched 11 strings across 4 files, but an
`^import …` grep returns **0** — every match is inside a comment/JSDoc
documenting what was removed.

### Bundle size

Same Windows/Turbopack quirk reported in v1/v3/v4: the build output table prints
no `Size` / `First Load JS` column for *any* route. Compilation succeeds and `/`
is registered (`ƒ /`). The v5 delta over v4 is small: `framer-motion` (already a
dependency) is the only library introduced to the demo graph; the rest is a data
file, a mapping helper, two presentational components, and CSS. A precise number
needs a Vercel preview or `@next/bundle-analyzer`.

---

## Files created / changed / untouched

### New
- [annote/mockTickets.ts](app/(marketing)/_components/demos/annote/mockTickets.ts) — 5+1 demo tickets, session title, transcript, edit-modal payload
- [annote/icons.tsx](app/(marketing)/_components/demos/annote/icons.tsx) — ticket-type → Lucide icon map
- [annote/SpeechCaption.tsx](app/(marketing)/_components/demos/annote/SpeechCaption.tsx) — marketing-only caption
- [annote/EditModal.tsx](app/(marketing)/_components/demos/annote/EditModal.tsx) — forklift of `TicketEditorOverlay` (static desc)

### Rewritten
- [annote/ExtensionTray.tsx](app/(marketing)/_components/demos/annote/ExtensionTray.tsx) — real `tl-*`/`.pill-tickets` structure
- [HeroCaptureDemo.tsx](app/(marketing)/_components/demos/HeroCaptureDemo.tsx) — two-layer split, mock tickets, caption, modal, 11s timeline
- [_styles/marketing.css](app/(marketing)/_styles/marketing.css) — added tray + editor-overlay + caption CSS; reworked hcd anchors (tray/SC always visible; modal anchor; reduced-motion additions)

### Untouched (v4 wins kept)
- `annote/CapturePill.tsx`, `VoicePillContent.tsx`, `PillHintText.tsx`,
  `Waveform.tsx`, `SelectedElementOverlay.tsx`, `PillErrorContent.tsx`,
  `ElementHighlighter.tsx`, `FeedbackItem.tsx`, `SessionControlPanel.tsx`
- `Hero.tsx` (already renders `<HeroCaptureDemo />`)
- The faux-site markup (only the layering wrapper class changed)

---

## Flags / fallbacks for Aakash

1. **EditModal field mismatch (resolved via the in-chat question).** The real
   modal (`TicketEditorOverlay`) has no severity selector and no metadata block.
   We forklifted it faithfully and surfaced element/browser/URL through the
   real screenshot-info tooltip rather than inventing a metadata panel. If you
   want a literal severity-selector + metadata block, that would be a
   *non-forklift* divergence from the live extension — say the word.

2. **Screenshot is a CSS-gradient placeholder.** No real frame was available in
   `public/`; the modal shows a soft gradient with a faux "Build better software"
   headline. Drop a real hero screenshot into `public/` and swap
   `.editor-screenshot-placeholder` for an `<img>` if you want a real frame.

3. **Description editor → static text.** Faithful forklift of the editor was
   impossible (TipTap + firebase upload + AI fetch). The static paragraph uses
   the same `.editor-steps` wrapper so it reads as the same component.

4. **Tray/SC are visible from frame 0.** Per the v5 storyboard the session is
   "already in progress," so unlike v4 (where they animated in) they're present
   at idle and only dim on the crossfade tail.

5. **Loop length.** 11.2s as specified. If it feels long, trim the `hold` beat
   (9.5s→10.5s window) — the transcribing beat is left intact as the key visual.
