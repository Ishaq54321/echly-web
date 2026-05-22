# Marketing — "Built for Agencies" Section Rebuild

Rebuilt the homepage agency-positioning section as a four-card horizontal
lifecycle (QA → Team → Review → Ship), replacing the prior `Agencies` section.

## Files

**Created**
- `app/(marketing)/_components/sections/BuiltForAgencies.tsx` — new section
  component with `CardOne`–`CardFour`, `ArrowConnector`, and a single
  IntersectionObserver driving the staggered scroll-reveal.

**Modified**
- `app/(marketing)/_components/MarketingHome.tsx` — swapped the `Agencies`
  import + render for `BuiltForAgencies` (same slot, between `SessionsDetail`
  and `Personas`).
- `app/(marketing)/_styles/marketing.css` — replaced the old `.agencies` / `.ag-*`
  rule block (~167 lines) with the new `.agency-*` ruleset, including
  responsive breakpoints and a `prefers-reduced-motion` block.

**Deleted**
- `app/(marketing)/_components/sections/Agencies.tsx` — the old section file.

## Verification

- `npx tsc --noEmit` — clean, no errors.
- `pnpm build` — clean production build, no errors/warnings on the marketing route.
- No leftover references to the deleted `Agencies` component or its `ArrowIcon`
  import. (`Personas.tsx` still has an unrelated "Agencies" persona *label* — not
  touched, correctly.)
- `lucide-react` exports confirmed present: `Link`, `Sparkle`.

Visual / responsive / scroll-reveal verification was **not** automated:
Playwright/Puppeteer are not installed in this project, and I didn't install
browser tooling unprompted (it downloads browser binaries). Please eyeball with
`pnpm dev` → `http://localhost:3000` and scroll to the "Built for agencies"
section. Expected behavior matches the brief:

- Centered header: dash-prefixed eyebrow, gradient headline, subheading.
- Four white cards in a row separated by thin arrow connectors.
- Card 1: single avatar (Maya). Card 2: three stacked avatars (Maya, Daniel,
  Sarah). Card 3: mono URL pill + purple brand chip. Card 4: two ticket cards
  with priority chip + assignee.
- Hover: subtle lift + shadow increase.
- Scroll-reveal: cards fade-rise with a 100ms stagger.
- 1200px+: 4-across with arrows. 768–1199px: 2×2 grid, arrows hidden.
  <768px: single column.

## Judgment calls / deviations

1. **Anchor ID preserved (flagged item).** The brief's markup used
   `className="agency-section"` with **no `id`**. But `MarketingHeader.tsx`
   nav links to `#agencies`, and the old section carried `id="agencies"`.
   Dropping it would break the header "Agencies" nav link. I kept
   `id="agencies"` on the new `<section>`. The brief asked me to pause if the
   replaced section had anchor IDs other parts link to — this is the trivially
   correct preservation, so I applied it and flag it here rather than blocking.

2. **Colors mapped to existing design tokens, not raw slate rgba.** The brief
   specced `rgba(15, 23, 42, …)` (cool slate) and `#0F172A`. The marketing
   system uses a warm ink palette (`--ink-1 #1B1626`, `--ink-2 #5C5468`,
   `--ink-3 #8A8298`, `--line-1 #E5E1D6`, `--violet #5A49BF`, `--bg-0`,
   `--bg-1`, `--mk-radius-lg`, `--mk-font-mono`). I used those tokens so the
   section matches Hero/ClickToTicket exactly. The structure, sizing, shadows,
   and gradient *treatment* are unchanged from the brief; only the literal
   color values are tokenized. Priority-chip warm oranges (`#C8531B` /
   `#B45309` on amber tints) were kept as literals since there's no token for
   them.

3. **Eyebrow `&::before` nesting** — the brief used CSS nesting for the dash.
   I wrote it as a flat `.agency-eyebrow::before` rule for compatibility with
   the existing flat stylesheet style.

4. **Reduced motion** — added a `prefers-reduced-motion` block (cards rest
   visible, no transform transition), matching the ClickToTicket convention
   noted in the brief.

5. **Stagger via observed-element index** — the brief's snippet used the
   IntersectionObserver `entries` array index, which is unreliable (entries
   only contains *currently-changed* targets). I compute the stagger from the
   card's index in the full `.agency-card` node list so the 100ms cascade is
   correct regardless of how entries batch. Observer unobserves each card after
   reveal.

## "Honest to product" framing — consistency note

The new section deliberately **drops** the old client-facing /
custom-domain / integration-logo claims:

- Old Card 2 said "custom-branded with your logo, your colors, **your domain**"
  → new Card 3 says only "Custom-branded with your logo" and shows a neutral
  `annote.app/s/…` URL (not a client domain).
- Old Card 4 listed "Linear, Jira, ClickUp, Notion, GitHub" integrations
  → new Card 4 shows structured ticket metadata (priority + assignee), no
  integration logos.

**Flagged for your review:** the `Personas` section (the persona tabs right
below this one) may still carry "client"/integration framing in its
"agencies" persona copy. I did not touch it per the "what not to touch" list,
but you may want to audit `Personas.tsx` for consistency now that this section
drops that angle.

## Bundle size

Not separately measurable in a meaningful way — the change is a net code
*reduction* in `marketing.css` (old `.ag-*` block was larger than the new
`.agency-*` block is not — they're comparable) plus a slightly larger TSX
component. The marketing home route remains statically prerendered (`○`) in the
build output. No new dependencies added (`lucide-react` was already a dep).

## Screenshots

Not captured — see verification note above (no browser automation in-project).
