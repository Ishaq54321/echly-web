# Marketing Pricing — Refinements Summary

Eight focused refinements to the pricing section, applied as targeted edits (no rebuild).

## Files modified

- `app/(marketing)/_components/sections/Pricing.tsx` — headline, subhead, Starter features (5 items), Business features header + items, Enterprise features header + items, new "Most teams settle here" subline rendered only on the featured tier.
- `app/(marketing)/_styles/marketing.css` — added two scoped CSS custom properties (`--pricing-grad`, `--pricing-grad-hover`) on `.pricing-section`, replaced solid violet border on featured tier with gradient-border technique, updated badge + primary CTA backgrounds to use the brand gradient, headline gradient updated to the same 135° brand gradient, added `.pricing-tier-price-subline` rule, bumped `.pricing-tier-price-block` min-height 100 → 124px.

## Verification

- `npx tsc --noEmit` — clean.
- `pnpm build` — clean (`✓ Compiled successfully in 6.3s`).

## Per-change confirmations

| # | Change | Status |
|---|---|---|
| 1 | Gradient border on Business tier (purple → pink, 135°) | done — `background-clip: padding-box, border-box` technique, replaces solid `var(--violet)` border |
| 1 | Badge uses same gradient | done — replaces previous `linear-gradient(180deg, var(--violet), var(--violet-dim))` |
| 1 | Primary CTA uses same gradient | done — separate hover gradient (`--pricing-grad-hover`) for lift |
| 1 | Shadow palette updated to purple→magenta→pink rgbas | done — three layers reflect the gradient's stops at 90/140/214 RGB |
| 2 | "Most teams settle here" subline on Business | done — rendered conditionally on `featured`, color `var(--violet)` |
| 3 | Headline → "Simple pricing. Pay when it matters." | done — gradient now wraps the punchline |
| 3 | Headline gradient at 135° matching tier border | done — shared `--pricing-grad` token |
| 4 | Subhead → "Try it free. Upgrade when you outgrow it." | done — existing 540px max-width is fine for the shorter copy |
| 5 | Starter features rewritten (5 items) | done — "Up to 3 members" / "50 tickets total" / "Voice-to-ticket AI" / "Browser, OS, viewport metadata" / "Public session links" |
| 6 | Business features header → "What you get" | done |
| 7 | Business features rewritten (no Starter contrast) | done — "Status, priority, assignee" (no "on tickets"), "Unlimited sessions and tickets" combined |
| 8 | Enterprise features header → "What you get" | done |
| 8 | Enterprise list prefixed with "Everything in Business" | done — weighted equally with the other items |

## Visual deliverables — not produced

I did not capture screenshots — same reason as the prior pass (this needs `pnpm dev` + browser, which the task doesn't authorize me to set up). To verify locally: `pnpm dev` → http://localhost:3000 → scroll to `#pricing`.

States to check:
1. **Section header** — "Simple pricing. Pay when it matters." with gradient on the second sentence (purple top-left → pink bottom-right). Subhead reads "Try it free. Upgrade when you outgrow it."
2. **Business tier card** — gradient border visible at 2px, "Recommended" badge in matching gradient above, "Most teams settle here" in brand purple under the strikethrough/billed line, primary CTA in matching gradient.
3. **Starter tier card** — 5-item list as specified.
4. **Enterprise tier card** — "What you get" header, "Everything in Business" as first list item.
5. **Hover on Business** — purple/magenta/pink shadow intensifies; CTA shifts to `--pricing-grad-hover` (slightly lighter stops).

## Judgment calls & flags

### Logo colors vs. brief colors — flagging
The brief said "adjust to match the actual logo if you have exact hex values." The actual logo (`AnnoteLogo.tsx`) uses two stacked gradients:
- Top half: `#974B89 → #5148C7` (magenta → blue-purple)
- Bottom half: `#573372 → #FD0C63` (dark purple → hot pink)

I went with the brief's `#5A49BF → #8B5CB8 → #D63384` rather than tracing the actual logo because:
1. The logo endpoint `#FD0C63` is highly saturated hot pink — fine in a 22×28px SVG but would overpower a 2px border on a 360px-wide card, the recommended badge, the 48px CTA, AND headline text all at once.
2. The brief's stops are a "logo-spirit" gradient (same purple-to-pink arc, softer) — better suited to large surfaces.

If you want the more saturated version, change the two custom properties at the top of the pricing section:
```css
--pricing-grad: linear-gradient(135deg, #5148C7 0%, #974B89 50%, #FD0C63 100%);
--pricing-grad-hover: linear-gradient(135deg, #6258D7 0%, #A85C99 50%, #FF2073 100%);
```
…that single edit propagates to border, badge, CTA, and headline gradient.

### Min-height bump on price block
The new "Most teams settle here" subline adds ~21px to the Business price stack (price + billed + subline). The price block's `min-height: 100px` would have let the block grow on Business only, pushing its CTA + features down ~21px below the other tiers' CTAs.

Bumped min-height to **124px** so all three tiers absorb the new line into the same vertical space. Starter ("$0 / Free forever") and Enterprise ("Custom / Tailored to your team") just center within a slightly taller block. CTAs and features lists stay row-aligned across all three.

### Eyebrow still `✦ Pricing`
Unchanged from the previous pass. Repo-wide eyebrow convention.

### `--pricing-grad` scoped to `.pricing-section`, not global
The gradient is currently only used inside the pricing section. Adding it to `:root` would suggest it's a system-wide brand token; if you start using it in Hero / FinalCTA / etc., promote it to the `:root` block at the top of `marketing.css`.

## What stayed unchanged

- Three-tier structure, billing toggle behavior, yearly default, tier scale 1.03, equal-height min-heights, section position, "who it's for" taglines, Starter/Enterprise CTA treatments, section eyebrow.

## Constraints respected

- No new dependencies.
- No other sections touched.
- Pricing data shape unchanged (only values updated).
- No commits.
