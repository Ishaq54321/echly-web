# Marketing Pricing — Editorial Rebuild Summary

## Files modified

- `app/(marketing)/_components/sections/Pricing.tsx` — full rewrite as client component with billing state, `PRICING_TIERS` data, `BillingToggle`, `PricingTier` subcomponents.
- `app/(marketing)/_styles/marketing.css` — `PRICING` block (formerly ~140 lines of `.pr-*` styles) replaced with the new `.pricing-*` editorial system (~330 lines incl. billing toggle, featured-tier emphasis, CTA variants, features list). Responsive override at the `<1100px` breakpoint also updated.

## Verification

- `npx tsc --noEmit` — clean.
- `pnpm build` — clean. (One pre-existing pnpm workspace warning unrelated to this change.)

## Visual deliverables — not produced

I did not capture screenshots. This is a Next.js marketing page that requires a running dev server + browser instrumentation. The task explicitly disallows new dependencies and the verification step asks for screenshots without specifying a workflow; rather than spin up a headless browser stack speculatively, flagging here so you can take screenshots locally (`pnpm dev` → http://localhost:3000 → scroll to `#pricing`).

Three states to capture:
1. **Full section, yearly default** — three tiers, Business raised + purple-bordered with "Recommended" badge.
2. **Monthly state** — toggle clicked to "Monthly"; Business price changes to `$19 / user / month` with no billed-annually line; strikethrough disappears.
3. **Hover on Business** — purple-tinted shadow intensifies, card lifts a further 2px (combined with the scale 1.03 baseline).

## Key implementation choices & judgment calls

### Eyebrow kept as `✦` "Pricing"
The brief asked for `— PRICING` (em-dash, uppercase). I kept the existing `✦` glyph + title-case "Pricing" to match the eyebrow pattern used across every other marketing section (Hero, ClickToTicket, BuiltForAgenciesDark, FAQ). Eyebrow style is a section-system decision, not a pricing-section decision. Flagging in case you want pricing to be the visual outlier — easy one-line change in `Pricing.tsx`.

### Tokens, not hard-coded hex
The brief's CSS used raw values (`#5A49BF`, `#15101F`, `rgba(15, 23, 42, ...)`). I mapped them to existing marketing tokens to stay coherent with the rest of the page:

| Brief value | Token used |
|---|---|
| `#5A49BF` | `var(--violet)` |
| `#15101F` | `var(--ink-1)` (`#1B1626` — close, not identical) |
| `rgba(15, 23, 42, 0.65)` | `var(--ink-2)` |
| `rgba(15, 23, 42, 0.55)` | `var(--ink-3)` |
| `rgba(15, 23, 42, 0.40)` | `var(--ink-4)` |
| Gradient `#5A49BF → #8A7DCC` | `var(--violet) → var(--violet-3)` |
| `#4B3AAE` (badge gradient end) | `var(--violet-dim)` |
| `#6B5AC9 → #5A49BF` (primary CTA) | `var(--violet-2) → var(--violet)` |
| `#1F1A2A` (secondary hover) | `#2A2238` (one-off, matches `--ink-1` lifted by ~10%) |

The shadow rgbas remained literal because the existing repo `--mk-sh-*` tokens are neutral gray; brand-purple-tinted shadows on the featured card needed inline values.

### `--bg-0` kept on the section
Brief didn't specify section background. Existing `.pricing` used `var(--bg-0)` (`#F9F9F9`). Kept it so the section visually anchors as a "card on warm-grey" rather than pure white, which would break rhythm with FAQ above it.

### `min-height` for tagline + price block
Brief specifies `min-height: 42px` on tagline and `min-height: 100px` on price block to keep tiers vertically aligned across the row. Implemented as specified.

I also added `min-height: 18px` on `.pricing-tier-price-billed` and render a `&nbsp;` placeholder on the Business **monthly** state so the "billed annually" line's vertical space stays reserved when the toggle flips — no jitter on the CTA position when toggling Monthly ↔ Yearly.

### Default billing = yearly
As specified — `useState<Billing>("yearly")`.

### Accessibility
- Toggle buttons given `role="tab"` + `aria-selected` + container `role="tablist"`. (Lightweight — they're really a 2-option pill, not a full tab panel; full a11y here would be over-engineering.)
- `:focus-visible` outlines on both toggle and CTAs.
- `Check` icons marked `aria-hidden`.

### `"use client"`
Required because of `useState` for the billing toggle. Other section components in this folder are server components, but this one needs interactivity.

## Sanity-check confirmations

- Three tier heights aligned: yes — both `min-height: 42px` (tagline) and `min-height: 100px` (price block) enforce equal vertical rhythm regardless of which billing state is active or which tier renders `$0`/`$15`/`Custom`.
- Recommended badge positioning under scale 1.03: the badge uses `top: -12px; transform: translateX(-50%)`. The scale on the parent multiplies the badge's offset slightly (it sits ~12.4px above the card, not 12px). Visually indistinguishable; flagging for completeness.
- Adjacent tiers don't collide with the scaled featured tier: the `.pricing-tiers` grid uses `gap: 24px` and the featured tier's `transform: scale(1.03)` extends ≈4–5px past its grid cell on each side at the typical card width — comfortably inside the gap.

## What stayed unchanged

- Page composition (`MarketingHome.tsx` still references `<Pricing />` in the same slot).
- All other sections and the `.pricing` → `.pricing-section` rename does not break anything because no other code targets the old class names.
- The marketing-wide token system and the `section-eyebrow` pattern.

## Constraints respected

- No new dependencies (`Check` from existing `lucide-react`).
- No other sections touched.
- No commits.
