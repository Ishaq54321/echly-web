# Marketing — "Who It's For" ClickUp-Pattern Section Rebuild

Replaced the old **"Different teams. Same friction."** persona section with a
five-tab vertical positioning section following the ClickUp "AI solutions for
every team" pattern: centered header → pill-tab nav → contained card with a
two-column layout (copy + checkmark bullets on the left, 4 avatar feature cards
on the right).

## Files

**Deleted**
- `app/(marketing)/_components/sections/Personas.tsx` — the old
  "Different teams. Same friction." section (component `Personas`, `id="personas"`).

**Created**
- `app/(marketing)/_components/sections/WhoItsFor.tsx` — new section, 5 tabs
  (Agencies → Design → Product → Engineering → QA), each with copy + 4 feature
  cards. Keeps `id="personas"` on the section so any future anchors still resolve.

**Modified**
- `app/(marketing)/_components/MarketingHome.tsx` — swapped the `Personas`
  import + `<Personas />` JSX for `WhoItsFor` / `<WhoItsFor />`, in the same slot.
- `app/(marketing)/_styles/marketing.css` —
  - Removed the entire `/* PERSONAS */` block (`.personas`, `.pers-*`, `.pv-*`)
    and its three orphaned responsive rules (`.pers-grid`, `.pers-tabs`,
    `.pers-copy`).
  - Added the `/* WHO IT'S FOR */` block (`.who-its-for-*`) plus its own
    `@media (max-width: 1099px)` and `@media (max-width: 767px)` rules.

## Anchor check

`#personas` was referenced only by the old section itself, its CSS, and its
import — **no nav or footer links** point to it. Deleting it broke no anchors.
The new section reuses `id="personas"` anyway, so nothing dangles.

## Verification

- `npx tsc --noEmit` — clean.
- `pnpm build` — `✓ Compiled successfully`, all 53 static pages generated.
- Visual: captured all 5 tabs via headless Chrome (CDP, 2× DPR). Header centered
  (eyebrow / headline / subheading), pill-tab nav with the active tab dark-filled
  + white text, contained card, gradient tab-title second clause, 3 checkmark
  bullets, 4 avatar+text+sparkle feature cards per tab. All 5 tabs render the
  correct copy and the correct 20 avatars (Maya / Daniel / Sarah / Alex rotated).
  Tab switching swaps content with the fade-in animation (re-triggered via a
  React `key` keyed on the active tab).

## Deviations & judgment calls

- **Component name vs. file the brief named.** The brief's Step-1 candidates
  (`DifferentTeams.tsx`, `WhoItsFor.tsx`, …) didn't exist; the live section was
  `Personas.tsx`. Deleted that one and created `WhoItsFor.tsx` as specified.
- **Fade-in re-trigger.** Added `key={`copy-${activeTab}`}` /
  `key={`features-${activeTab}`}` so React remounts the columns on tab change and
  the `who-its-for-fade-in` animation actually replays each switch.
- **Section `id`.** Kept `id="personas"` on the new `<section>` as a
  belt-and-suspenders measure for any external anchor.

## Post-rebuild revisions (per follow-up feedback)

1. **Headline matches `.agency-headline` (BuiltForAgencies).** Removed the
   gradient-text span on the main headline ("Built for the teams who own the
   work.") and matched the BuiltForAgencies headline exactly:
   `font-size: clamp(28px, 3.2vw, 42px)`, `font-weight: 500`, `color: var(--ink-1)`.
   Eyebrow → `var(--ink-3)`, subheading → BuiltForAgencies values.
2. **White, no atmosphere bleed.** The section had no background, so the page's
   fixed cream/blue radial-gradient atmosphere showed through the gutters. Made
   `.who-its-for-section` full-bleed `background: #FFFFFF` (mirrors
   `.agency-section`) and constrained `.who-its-for-content-card` to
   `max-width: 1180px; margin: 0 auto`. Card background also `#FFFFFF` with a
   `--line-1` border + `--mk-sh-lg` shadow so it floats on the white section.
3. **Lighter tab titles.** `.who-its-for-tab-title` weight `700 → 500` so each
   tab's headline ("Ship client work…", etc.) matches the main headline's weight.
   The gradient on the second clause is preserved.

## Bundle size

Not separately measurable from the build summary (route-level only). Net change
is small: one client component (5 tab variants, static JSX) plus a CSS block that
roughly replaces the removed PERSONAS block; the `Sparkles` icon comes from the
already-bundled `lucide-react`. No new dependencies.

## Constraints honored

No new dependencies · avatar files untouched · no other sections touched ·
no commits.
