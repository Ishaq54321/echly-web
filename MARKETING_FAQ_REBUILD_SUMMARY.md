# Marketing FAQ Rebuild — Notion Calendar Pattern

Rebuilt the marketing-page FAQ to match Notion Calendar's "Questions & answers" section:
single-column full-width accordion, plain background, headline-as-section-title (no
eyebrow, no subhead), hair-line dividers, Plus/Minus expand indicators, restrained
typography. Five questions in casual founder-voice (kept the existing three, added two
new ones — client buy-in and integrations).

## Files modified

- `app/(marketing)/_components/sections/FAQ.tsx` — rewritten from a two-column
  sticky-headline layout to a single-column accordion. Extracted `FAQItem` as an
  internal component (each question owns its own open/close state, so multiple can be
  open simultaneously — Notion's pattern, not exclusive single-open). Plus/Minus icons
  imported from `lucide-react` (already in deps at `^0.575.0`). Five `FAQ_ITEMS` with
  `id`/`question`/`answer`; copy rewritten per the brief.
- `app/(marketing)/_styles/marketing.css` — replaced the entire `/* ============ FAQ ============ */`
  block (the old `.faq`, `.faq-inner`, `.faq-h`, `.faq-q`, `.faq-ic`, `.faq-a-in`,
  `.faq-all`, `.faq-p`, `.faq-left` rules) with the new Notion-pattern selectors:
  `.faq-section`, `.faq-container`, `.faq-headline`, `.faq-list`, `.faq-item`,
  `.faq-question`, `.faq-question-text`, `.faq-question-icon`, `.faq-answer-wrapper`,
  `.faq-answer`. Mobile rules updated for the new selectors (`@media (max-width: 767px)`).

## Files NOT touched

- `app/(marketing)/_components/MarketingHome.tsx` — already imported `<FAQ />` and the
  component name is unchanged.
- `app/(marketing)/_components/sections/Pricing.tsx`, `FinalCTA.tsx` — unchanged. The new
  FAQ section sits between them with no surrounding-section regressions.

## Verification

- `npx tsc --noEmit` — clean (no output).
- `pnpm build` — clean (compiled successfully, full route table printed, no warnings on
  the marketing route).
- All five questions render with hair-line top dividers (`rgba(15, 23, 42, 0.08)`); the
  last item gets a closing bottom divider via the `is-last` class.
- Plus icon shows when closed; Minus when open; smooth `max-height` transition (0.35s,
  Notion's `cubic-bezier(0.16, 1, 0.3, 1)` easing).
- Multiple questions can be open at the same time (each `FAQItem` owns its own
  `useState`).
- `aria-expanded` on the button, `aria-hidden` on the answer wrapper, `aria-hidden="true"`
  on the icon span (decorative).
- Mobile breakpoint at 767px: section padding `64px 20px 56px`, headline `32px`,
  question text `16px`, answer text `15px`, tighter button padding.

## Judgment calls / deviations

1. **No hover color change on the question text.** The brief asked for both text and icon
   to subtly darken on hover; user followed up mid-build with "Don't change the questions
   color upon hover." Removed the `.faq-question:hover .faq-question-text { color … }`
   rule and the `transition: color …` on `.faq-question-text`. The icon still darkens on
   hover (and stays dark while the item is open) so there's still affordance signalling
   the row is interactive — just no color shift on the question copy.
2. **Headline left-aligned, not centered.** The section above (Pricing) and the one below
   (FinalCTA) both use centered headlines, but Notion Calendar's FAQ headline is
   left-aligned and the brief explicitly references that pattern; the contrast against
   the centered neighbours reads as intentional restraint rather than a mistake, so I
   went with left.
3. **Section background.** Did not add an explicit `background` on `.faq-section` — the
   old `.faq` block hard-coded `var(--bg-0)` (`#F9F9F9`). The new section inherits the
   page background, which matches `--bg-0` and keeps Pricing → FAQ → FinalCTA flow
   visually unbroken. The brief specifically said "plain light background — no gradient
   atmosphere, no contained card," so inheriting is correct.
4. **`max-height: 400px` was sufficient.** The longest answer (client-buy-in, ~340 chars)
   fits comfortably; no need to bump to 500/600px.
5. **Lucide icons, not custom SVG.** The brief said use lucide-react; `Plus` and `Minus`
   are both present in the installed `^0.575.0`. No layout shift between states because
   both icons render at the same 18×18 with identical `width: 24px; height: 24px;` slot
   on `.faq-question-icon`.

## What was removed

- "— QUESTIONS" eyebrow.
- "Quick answers." headline.
- "Three things people ask before they sign up." subhead.
- Sticky two-column layout (`.faq-inner` grid, `.faq-left` sticky positioning).
- `.faq-all` "see all" link styles (component never rendered them, dead CSS).
- `.faq-ic` pseudo-element plus/cross — replaced by real lucide SVGs.

## Screenshots

Not captured — this run was code-only. Recommend a manual visual pass at:

- All five questions collapsed (full section, desktop ≥1080px, mobile ≤767px).
- Question 1 expanded showing the 760px-clamped answer paragraph.
- Hover state on a closed question — icon should darken to `#15101F`, question text
  should stay `#15101F` (no change, per user follow-up).
- Two questions expanded simultaneously to confirm multi-open behaviour.
