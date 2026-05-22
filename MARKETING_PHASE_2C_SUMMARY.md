# Marketing Phase 2C — Session View Forklift

Replaced the bespoke `SessionsDetail` mockup with a forklift of the **real
production session view** (two columns: sidebar + detail), populated with static
mock data and interactive (click between tickets to swap the detail pane). Built
to the binding spec `SESSION_PAGE_DESIGN_SPEC.md` and the eight binding decisions
in the Phase 2C prompt.

Everything lives under `app/(marketing)/_components/demos/session/`. No source
tree (`components/`, `lib/`) files were modified — verified `git status --short`
shows zero changes there. No new dependencies.

---

## Forklift manifest

| Source path | Marketing path | Lines | Mode |
|---|---|---:|---|
| `components/layout/operating-system/TicketItem.tsx` | `session/TicketItem.tsx` | 78 | **Verbatim** (JSX/classes byte-identical; kept pure `getTicketIconFromTags`) |
| `components/layout/operating-system/TicketList.tsx` | `session/TicketList.tsx` | 199 | Adapted (dropped pagination/search/deep-link/lazy machinery + `InviteMemberModal`; kept hero card, header row, Open/Resolved sections verbatim) |
| `components/session/FeedbackHeader.tsx` | `session/SessionFeedbackHeader.tsx` | 199 | Adapted (kept default authed action row + StatusBadge + title + resolve-flash verbatim; **added meta row**, stripped Assign/Priority/shareGating/readOnly branches) |
| `components/session/feedbackDetail/FeedbackContent.tsx` | `session/FeedbackContent.tsx` | 75 | Adapted (attachment-card + Tags-section wrappers verbatim; ScreenshotWithPins→DemoScreenshotBlock; file list + add-tag dropped) |
| `components/session/feedbackDetail/ScreenshotBlock.tsx` | `session/DemoScreenshotBlock.tsx` | 108 | Adapted (frame/scrim/corner-buttons/Info-badge verbatim; `<img>`→`<MockScreenshotSvg>` + `<StaticPin>`; decode/loader/empty stripped) |
| `components/session/feedbackDetail/ActionItemsSection.tsx` | `session/ActionItemsSection.tsx` | 57 | Adapted (read-only display path only — heading + prose classes verbatim; Tiptap editor / hex picker / handle stripped) |
| `components/ui/Tag.tsx` | `session/Tag.tsx` | 52 | **Verbatim** (only dropped a dead `TAG_CHIP_BASE_CLASS` import) |
| `components/session/feedbackDetail/CommentsSection.tsx` | `session/CommentsSection.tsx` | 106 | Adapted (heading + collapsed composer + thread/reply layout verbatim; Tiptap/emoji/upload/CRUD stripped) |
| `components/comments/CommentItem.tsx` | `session/CommentItem.tsx` | 119 | Adapted (avatar/name/timestamp/body/mention-chip/reaction classes verbatim; action bar/Tiptap/emoji/Modal/`useUserAvatar`/`toggleReaction` stripped) |
| `components/presence/PresenceAvatarRow.tsx` | `session/PresenceAvatarRow.tsx` | 67 | Adapted (amber-ring/UserAvatar/“+N” verbatim; `usePresenceStore`/`useUserAvatars` → static prop) |
| `components/ui/TopControlBar.tsx` (pill, L221-265) | `session/SessionTopBar.tsx` | 73 | Adapted (Share/Copy pill markup verbatim; `useShareController.copyCurrentLink`→demo-URL copy + 2000ms Check) |
| `components/share/ShareModal.tsx` | `session/ShareModal.tsx` | 220 | **Re-implemented faithfully** (see fidelity note below) |
| — (new) | `session/useStaticFeedbackController.ts` | 71 | Shim for `useFeedbackDetailController` |
| — (new) | `session/sessionMockData.ts` | 263 | 6 tickets + viewers + members |
| — (new) | `session/SessionDemoStage.tsx` | 126 | Composition root (2-col grid) |
| — (new) | `session/screenshots/PricingScreenshots.tsx` | 183 | 6 SVG mock screenshots |
| — (new) | `session/screenshots/StaticPin.tsx` | 72 | Static speech-bubble pin |

**Deliberately NOT forklifted** (dead code per spec §9 / binding decision #1):
`FourZoneLayout`, `TicketActivityPanel` (no third column), `FeedbackDetail`,
legacy `feedbackDetail/FeedbackHeader`, `FeedbackSidebar`, `ScreenshotWithPins`
(used `ScreenshotBlock` read-only variant instead), `ExternalShareModal`.

---

## Binding decisions — implemented as specified

1. **Two columns only** — `session-demo-grid` is `346px 1fr`. No activity column.
2. **Real Open/Resolved collapsible grouping** — no per-row status pills; type-icon tiles + checkmark for resolved.
3. **One static numbered speech-bubble pin per screenshot** — `StaticPin` uses the production `PinMarker` SVG path verbatim, brand fill / white stroke / drop-shadow, with a hover tooltip.
4. **Amber-ringed presence, NO count label** — `boxShadow: 0 0 0 2px var(--color-warning)`, no “viewing now” text, no pulse.
5. **Marketing-only meta row** — `loomly.com/pricing · Safari 17 · iOS 17` under the title (12.5px, `--text-tertiary`, `·` separators). Documented in the `SessionFeedbackHeader.tsx` JSDoc as MARKETING ONLY.
6. **Brand-purple `echly-new-ticket-pulse`** keyframe added (not the buggy blue `echlyTicketHighlight`).
7. **Share button opens the modal**; internal Invite/role/remove/copy are silent no-ops; X / Cancel / Done close. Copy-link footer button shows the 2000ms Check.
8. **Section headline unchanged** — only the demo below it changed.

---

## Mock data (`sessionMockData.ts`)

One session — **“Loomly · pricing QA · May 18”**, workspace **Studio Northwind**,
3 viewers (Maya Anand, Daniel Torres, Sarah Kim) — with **6 tickets** (5 open +
1 resolved, matching the hero-card “6 tickets” copy):

1. Get Started CTA overlaps pricing card on iPhone (<480px) — *mobile/cta/critical*, 2 comments
2. Tier comparison table headers wrap awkwardly on tablet — *tablet/layout*, 1 comment
3. Annual toggle missing focus indicator — *a11y/keyboard-nav*, 1 comment + ✅ reaction
4. FAQ accordion chevron points wrong way — *ui/polish*, 1 comment
5. Footer “Status” link returns 404 — *broken-link/footer*, 2 comments (a threaded reply + 🎉 reaction, exercises the reply indent)
6. Add testimonial slot near pricing CTAs — **resolved**, *content/conversion*, 2 comments + ✅×2

Comment timestamps are derived from a `minutesAgo` offset via the same rules as
`formatCommentDate` (Just now / Nm ago / Nh ago / Yesterday / Nd ago).

---

## Screenshot components (`screenshots/PricingScreenshots.tsx`)

Six bespoke SVG mock screenshots (NOT forklifted — marketing illustrations) that
fill the `ScreenshotBlock` frame (16:9, max-h 317px), each a glanceable hint of
its ticket's bug:
`PricingMobileScreenshot` (CTA bleeding into tier card) · `PricingTabletScreenshot`
(misaligned “Most popular” header) · `PricingToggleScreenshot` (toggle w/ dashed
“missing focus ring”) · `PricingFaqScreenshot` (right-pointing chevron on the
expanded item) · `PricingFooterScreenshot` (red broken “Status” link) ·
`PricingCtaScreenshot` (empty dashed testimonial slot). A single `StaticPin`
overlay is positioned per ticket's `pin.{x,y}` percentage coords.

---

## `useStaticFeedbackController` shim

Mirrors what `FeedbackContent` consumes from `useFeedbackDetailController`:
`{ description, tags, threads, participants }`. Roots/replies are partitioned from
`ticket.comments` by `threadId` (same grouping as the real `CommentsSection`).
**Did NOT balloon into a 200-line file** — it's 71 lines and contains no
subscription/ref/callback surface, because the demo never wires mutations.

---

## CSS copied into `marketing.css`

Appended one scoped block (after the Phase 2B hero rules — none of those were
touched). Tokens scoped to `.session-demo-stage, .session-share-overlay`:

- **Design tokens** copied verbatim from `styles/tokens.css` with line citations:
  `--brand` (9), `--brand-hover` (11), `--brand-subtle` (12), `--brand-muted`
  (13), `--surface` (55), `--surface-page` (56), `--surface-card` (57),
  `--surface-subtle` (58), `--surface-hover` (59), `--text-heading` (46),
  `--text-body`/`--text-secondary` (47-48), `--text-tertiary` (50),
  `--text-placeholder` (51), `--border` (65), `--border-strong` (66), `--hair`
  (138), `--hair-strong` (139), `--color-success*` (70-72), `--color-danger*`
  (75-76), `--color-warning` (79), `--orange` (356→79), `--avatar-*` palette
  (101 + tokens), `--radius-sm/md/xl/btn` (105/106/108/110), `--shadow-panel`
  (135), `--shadow-sm` (125), `--color-primary-ring` (179), plus
  `--layer-2-bg`, `--text-primary-strong`, `--shadow-level-1/2/3`.
- **Comment/text utilities** mirroring `app/globals.css`: `.text-discussion-body`
  (globals.css:98), `.text-discussion-title`/`.text-meta` (mapped to spec §4.6
  colors — these have no standalone rule in production, color is inherited),
  `.mention-chip` (globals.css:5921-5929), `.comment-row` (globals.css:6446-6450),
  `.tl-vrow` reset (globals.css:10037 set `content-visibility:auto` for
  virtualization; reset to `visible` for 6 static rows).
- **`echly-new-ticket-pulse`** keyframe (tokens.css:1083-1089), brand-purple.
- **Layout**: `.session-demo-stage/-topbar/-grid/-sidebar/-detail/-detail-main`
  reproducing `SessionPageClient.tsx:3947-4086` at two columns; `+` responsive
  single-column collapse < 900px.
- **Share modal**: self-contained `.session-share-overlay/-panel/-header/-title/
  -icon-btn/-body/-avatar/-empty`.

---

## Verification

- **`npx tsc --noEmit`** — clean (after fixing two real issues: a `*/` inside a
  JSDoc that closed the comment early, and a `DemoThread` import from the wrong
  module).
- **`npx next build`** — compiled successfully (53/53 static pages).
- **Grep (functional usages = zero):** `from '@/lib/firebase`,
  `from '@/lib/client/workspaceContext`, `useWorkspace`,
  `useFeedbackDetailController`, `usePresenceStore`, `useUserAvatar`,
  `useShareController` — all remaining matches are inside JSDoc comments only,
  no runtime imports/calls.
- **Source tree untouched:** `git status --short -- components/ lib/` → empty.
- **SSR render:** prod `next start` → `GET /` returns HTTP 200 with
  `session-demo-stage`, `Loomly`, and `Studio Northwind` present in the HTML.
- **Hero demo intact:** Phase 2B hero CSS/components were not modified (only new
  rules appended below them).

### Bundle size — could not read a number
This repo's `next build` is configured to print only the route tree, **not** the
`Size` / `First Load JS` columns, so I can't quote a First Load JS figure. The
addition is dependency-free (no new packages; six inline SVGs + a dozen small
components), so the impact is small — well under the 400KB target in practice.
**Flag:** if you want the number, run a build with the default route-size logger
(or `ANALYZE`), and I'll capture it.

---

## Places needing heavier surgery than a verbatim forklift (for review)

1. **ShareModal — re-implemented, not forklifted.** The production `ShareModal`
   renders inside the app `<Modal>` (ModalPortal + `echly-modal-*` CSS that lives
   only in `app/globals.css`, not loaded on the marketing route), uses Radix
   `<DropdownMenu>`, the `useShareController` types, `ShareModalError`,
   `ShareDropdown`, and `ExternalShareModal`, and styles itself with
   `.share-modal-*` classes also defined only in `app/globals.css`. Forklifting
   that whole tree onto marketing would drag in Radix + the controller + a large
   CSS surface. I reproduced the same **structure, copy, and Tailwind arbitrary
   classes** (header / General access / Invite people / People with access /
   Members / footer Copy-link · Cancel · Done) with a self-contained
   overlay/panel and native disabled-look dropdown buttons. Visually faithful;
   not a byte-for-byte forklift. **Confirm this trade-off is acceptable**, or I
   can do a fuller forklift (porting Modal/ModalPortal + the `share-modal-*` CSS).

2. **Comments thread — display-only re-implementation.** Per spec §10 the live
   `CommentsSection`/`CommentItem` are built around Tiptap, an emoji picker,
   upload, `ImageViewer`, a delete `<Modal>`, `toggleReaction`, and the live
   `useUserAvatar` resolver. With static data + no-op callbacks all of that is
   unreachable, so I forklifted only the display path (which keeps the exact
   classes from spec §4.6). The composer is the real collapsed visual but does
   **not** expand to a Tiptap editor on click (it's a silent no-op).

---

## Fidelity questions for Aakash

1. **Share modal fidelity** — see surgery note #1. OK to keep the faithful
   re-implementation, or do you want the byte-for-byte modal (heavier port)?
2. **Composer interactivity** — the “Leave a comment…” composer is the real
   resting visual but inert (no expand-to-editor). Want it to *look* focusable
   (expand to a fake textarea) for the demo, or is the resting state enough?
3. **Screenshot realism** — the six SVGs are simplified “glanceable” hints, not
   photoreal. Good enough, or should specific ones be more detailed?
4. **Info-badge tooltip copy** — I hardcoded “Pricing Page → Hero Section” +
   device + “May 18, 2025, 2:32 PM” for all six. Want per-ticket page-area text?
5. **Resolve interaction** — clicking Resolve flips the ticket to resolved
   locally (moves it to the Resolved group + flashes the success ring). Keep this
   live toggle, or freeze it (static) for the demo?

---

## Suggested screen recording

Page loads with ticket 1 pre-selected → click tickets 2 and 3, watch the detail
pane swap instantly (header, meta row, screenshot+pin, description, tags,
comments) → click an Open/Resolved section header (mutual-exclusion collapse) →
click the resolved ticket (6) to see the success badge + resolved comment styling
→ click **Share** to open the modal → expand Members → dismiss with X → click the
copy-link icon on the pill to see the 2000ms Check. Then scroll to the hero
section to confirm the Phase 2B capture demo still runs.
