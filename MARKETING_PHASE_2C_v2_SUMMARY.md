# Marketing Phase 2C — v2: Session View Polish

Five planned refinements on top of the Phase 2C session-view forklift, plus
three follow-up tweaks the user asked for mid-pass. No new forklifts, no
architecture shifts — all changes are scoped to the marketing demo subtree and
`marketing.css`. `npx tsc --noEmit` clean; `pnpm build` compiles successfully.

---

## Files changed

| File | Change |
|---|---|
| `app/(marketing)/_components/demos/session/SessionDemoStage.tsx` | Logo in top bar (Fix 1); detail panel marked as internal scroll area (Fix 2) |
| `app/(marketing)/_components/demos/session/SessionTopBar.tsx` | Unchanged structurally — now wrapped by the new left/right top-bar layout |
| `app/(marketing)/_components/demos/session/screenshots/PricingScreenshots.tsx` | Enlarged phone + gradient/page-hint backdrop for the mobile shot (Fix 3) |
| `app/(marketing)/_components/demos/session/ShareModal.tsx` | Section hierarchy + borders, bordered dropdowns, Members always-visible (2 members), footer = Copy link + purple **Done** (Fix 4) |
| `app/(marketing)/_components/demos/session/sessionMockData.ts` | `MOCK_WORKSPACE_MEMBERS` reduced 3 → 2 (Sarah Kim stays a viewer, not a member) (Fix 5) |
| `app/(marketing)/_components/demos/session/SessionFeedbackHeader.tsx` | Header **un-stickied** (follow-up); **meta row removed** (follow-up); `pageMetadata` prop now optional/unused |
| `app/(marketing)/_components/demos/session/TicketList.tsx` | "Invite Team" given a stable class for an explicit black fill (follow-up) |
| `app/(marketing)/_styles/marketing.css` | All new/changed CSS (below) |

---

## Fix 1 — Annote logo in the top bar

The top bar was right-anchored only (presence + Share pill). Added the
`AnnoteLogo` mark on the left and switched the container to `space-between`.

- **API note:** `AnnoteLogo` takes `width`/`height`, **not** a `size` prop (the
  prompt's `<AnnoteLogo size={24} />` won't compile). Used `width={22} height={28}`
  (the same proportions MarketingHeader uses), which renders ~28px tall to match
  the 34px-tall right-side controls.
- The component already renders **only the geometric mark** (no wordmark), so no
  variant change was needed.
- New CSS: `.session-demo-topbar` → `justify-content: space-between`; added
  `.session-demo-topbar-left` / `-right`. The left wrapper carries a
  `padding-bottom: 14px` so the logo's vertical center lines up with the
  right-side pill (the top bar reserves a 14px bottom gap).

## Fix 2 — Contained section height + internal scroll

The section grew to fit the full ticket detail + all comments, dominating the
page. Now it's a discrete, bounded component.

- `.session-demo-stage`: `height: 720px` (640px between 901–1099px; `height:auto`
  under 900px), `display:flex; flex-direction:column`.
- `.session-demo-grid`: `flex:1; min-height:0` (was `min-height:620px`) so it
  fills the stage below the 56px top bar.
- `.session-demo-detail`: `display:flex; flex-direction:column; min-height:0`.
- The detail `<main>` got a second class `session-demo-detail-scroll-area`
  (`flex:1; min-height:0; overflow-y:auto; scroll-padding-bottom:24px`) with a
  thin custom webkit scrollbar.
- **Result:** title → actions → screenshot → (partial) description are above the
  fold; scrolling **inside the detail panel** reveals the rest + comments. The
  marketing page itself doesn't scroll while you're inside the section.
- **Mobile (<900px):** the fixed height is dropped; sidebar caps at 320px with
  its own scroll, detail caps at 560px — so neither traps the page scroll.

## Fix 3 — Screenshots fill the placeholder width

The desktop-viewport shots (tablet/toggle/faq/footer/cta) already draw a large
card edge-to-edge; the **mobile** shot was the sparse outlier (a 160px phone in a
640px frame floating on flat `#F4F2F8`). Reworked `PricingMobileScreenshot`:

- Enlarged the phone to ~196px wide / full-height, centered, with a soft drop
  shadow and a notch.
- New `Surface phone` mode: a cool vertical gradient (`#F8FAFC → #EEF1F6`) plus
  very low-opacity hints of the surrounding desktop pricing page behind the
  phone — so the frame reads as a captured viewport, not empty gray.
- The CTA-overlapping-tier-card bug (the pin target) is preserved and larger.
- The other five shots were left as-is (their cards already fill the frame). Flag
  if any still feel sparse and we can apply the same backdrop treatment.

## Fix 4 — ShareModal hierarchy & content

The forklifted modal already had the four sections; this pass fixed the muddled
hierarchy and content:

- **4a — section structure:** introduced `.session-share-section`
  (`padding:20px 0; border-bottom:1px solid var(--border)`) +
  `.session-share-section-title` (14px/600 dark) and `.session-share-section-sub`.
  Each logical block (General access / Invite people / People with access /
  Members) is now visually distinct with hairlines + breathing room; last
  section drops its border.
- **4b/4c — dropdowns:** a single `DROPDOWN_BTN_CLASS` constant gives every
  selector ("Anyone with the link", "Can resolve", per-row "Can view/resolve") a
  real bordered control look (border, surface bg, hover, ChevronDown). The Invite
  row's permission dropdown sits on the **right** of the email input (was
  ambiguous before). Dropped the redundant standalone "Invite" submit button —
  the email input + right-aligned permission dropdown is the row.
- **4d — access rows:** consistent left (avatar + email + "Invite · Active/Pending")
  / right (permission dropdown + 36×36 trash button) layout.
- **4e — Members:** now **always visible** (removed the collapse toggle that was
  causing the header overlap) and shows **2** members (Maya — Owner, Daniel —
  Member) via the trimmed `MOCK_WORKSPACE_MEMBERS`.
- **4f — footer:** left = subtle text-only **Copy link** (link icon, 2000ms
  Copied check, no-op clipboard); right = single purple primary **Done**. The
  plain-text Cancel was removed (X and Done both close).
- **4g — sizing/backdrop:** panel `max-width:500px`, layered soft shadow
  (`0 24px 48px -16px … , 0 8px 16px -4px …`), `max-height: min(90vh,760px)`.
  Backdrop switched from dark dimming to **light frosted glass**
  (`rgba(250,249,247,0.55)` + `blur(6px)`).

## Fix 5 — Members reduced 3 → 2

`MOCK_WORKSPACE_MEMBERS` dropped Sarah Kim. She remains in
`MOCK_SESSION.viewers`, so she still appears as an amber-ringed presence avatar
in the top bar — just not as a permanent workspace member in the share modal.

---

## Follow-up tweaks (requested mid-pass)

1. **Header no longer sticky.** `SessionFeedbackHeader`'s root was
   `sticky top-0 z-20`; with Fix 2's internal scroll that pinned the
   title/meta/actions while the body scrolled under it. Removed `sticky top-0
   z-20` so the whole detail (header included) scrolls as one unit.
2. **"Invite Team" black fill.** The `bg-[var(--text-heading)]` arbitrary class
   wasn't rendering a fill in this scope. Gave the button a
   `.session-demo-invite-btn` class with an explicit
   `background: var(--text-heading)` (hover `#000`).
3. **Meta row removed (all 6 tickets).** The marketing-only
   `loomly.com/pricing · Safari 17 · iOS 17` sub-row under the title was deleted.
   Capture metadata now lives only in the screenshot Info-badge tooltip — which
   matches production (SESSION_PAGE_DESIGN_SPEC §4.1). `pageMetadata` is now an
   optional, unused prop on the header (still passed by the stage, harmless).
4. **Screenshots full-width.** They previously left a right-side gap: the frame
   grew wider than the 16:9 viewBox, so `slice` couldn't fill it. Reworked
   `DemoScreenshotBlock`'s frame to a full-width box with `height: clamp(220px,
   38vw, 317px)` (dropped the `aspectRatio: 16/9` + `max-h` conflict), and moved
   all six mocks onto a wide `0 0 880 330` (≈2.67:1) canvas laid out edge-to-edge
   — so `slice` crops ~nothing and content fills the full width.
5. **Screenshots muted / simplified.** All mock content is wrapped in a
   `opacity:0.62` group so it reads as a faded capture and the pin stays the
   focal point. The saturated brand-purple (`#5A49BF`) CTA/badge blocks were
   swapped for a quiet desaturated lavender-gray (`#A7A1B4` / `#C9C4D4` with a
   hairline) — no more giant on-the-nose purple buttons. The footer's red broken
   link (the bug signal) is kept but sits inside the faded group.
6. **Ticket order swapped.** In `MOCK_TICKETS`, "Tier comparison table headers
   wrap…" (tablet) is now first (index 1) and "Get Started CTA overlaps…"
   (mobile) is second (index 2). Selection-on-load and the header "N of M" both
   derive from array order, so the demo now opens on the tablet ticket.

---

## CSS additions to marketing.css

```css
/* Top bar: logo left / controls right */
.session-demo-topbar            → justify-content: space-between
.session-demo-topbar-left       → flex + padding-bottom:14px (vertical align)
.session-demo-topbar-right      → flex

/* Contained section + internal scroll */
.session-demo-stage             → height:720px; display:flex; column
.session-demo-grid              → flex:1; min-height:0  (was min-height:620px)
.session-demo-detail            → display:flex; column; min-height:0
.session-demo-detail-scroll-area→ flex:1; overflow-y:auto; thin webkit scrollbar
@media (901–1099px)             → stage height:640px
@media (≤900px)                 → stage height:auto; detail/sidebar capped scroll

/* Invite Team black fill */
.session-demo-invite-btn        → background: var(--text-heading) (hover #000)

/* Share modal */
.session-share-overlay          → light frosted backdrop (was dark)
.session-share-panel            → max-width:500px; layered soft shadow
.session-share-section(-title/-sub/--last) → section hierarchy + hairlines
```

## Bundle size delta

Negligible. Changes are CSS rules + small JSX edits; the one new import
(`AnnoteLogo`) is an inline SVG already bundled elsewhere on the marketing route.
The Turbopack build output for this project doesn't print a per-route byte column
(the size cells render blank), so no exact figure to quote — but nothing here
adds a dependency or a meaningfully sized module.

## Visual judgment calls flagged

- **Logo sizing:** `width={22} height={28}` renders ~28px tall to match the
  right-side controls; tune if it reads large/small next to the pill.
- **Panel width 500px** (prompt said 480; "slightly wider than current 540" is
  contradictory). 500 fits the 4 sections + right-aligned dropdowns without
  cramping; easy to nudge to 480.
- **Only the mobile screenshot got the new backdrop.** The other five fill the
  frame already; flag if they should get the same gradient/hint treatment.
- **`pageMetadata` left as an accepted-but-unused prop** rather than threading a
  removal through the stage — keeps the diff small; can be fully removed later.

## Not touched

Forklifted core components (TicketItem, FeedbackContent, CommentsSection,
CommentItem, Tag, PresenceAvatarRow, useStaticFeedbackController), the Phase 2B
hero demo, and the CSS already copied from globals.css/tokens.css — only new
marketing-specific rules were added.
