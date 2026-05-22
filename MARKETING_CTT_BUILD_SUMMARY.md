# Marketing — "From Click to Ticket" Build Summary

Replaced the tabbed "Your Annote suite" section with three vertically stacked,
scroll-revealed subsections (Capture → Voice → Sessions) and removed all
integrations content from the homepage.

## Files removed

- `app/(marketing)/_components/sections/Suite.tsx` — the tabbed suite section (capture/voice/sessions/integrations tabs).
- `app/(marketing)/_components/sections/Integrations.tsx` — the standalone integrations grid section.

## Files created

- `app/(marketing)/_components/sections/ClickToTicket.tsx` — new section. Parent
  `<h2>From click to ticket.</h2>` followed by three subsections:
  - **CaptureSection** (copy left / visual right) → `CaptureMockup`: browser
    chrome, faux pricing page with 3 tiers, testimonial card (Maya avatar),
    brand-purple element highlight wrapping the featured tier, recording capture
    pill with pulsing orb, and a polaroid ambient photo overlay.
  - **VoiceSection** (visual left / copy right) → `VoiceMockup`: reuses the
    existing `VoiceTicketDemo` (unchanged except reporter name) plus a polaroid
    ambient photo overlay.
  - **SessionsSection** (copy left / visual right) → `SessionsMockup`: composed
    session view — share pill with 3-avatar stack, 200px sidebar with 4 tickets
    (different reporter avatars), open-ticket detail with teal "Open" status
    pill, phone screenshot mock with purple pin, and a 2-comment thread.
  - Single shared `IntersectionObserver` adds `.ctt-in-view` for the fade + rise
    reveal (unobserves after first trigger). Reduced-motion shows content
    immediately.

## Files modified

- `app/(marketing)/_components/MarketingHome.tsx` — swapped `Suite`/`Integrations`
  imports + JSX for `ClickToTicket`. New order: Hero → TrustStrip →
  **ClickToTicket** → SessionsDetail → Context → Agencies → Personas → Pricing →
  FAQ → Editorial → Closing.
- `app/(marketing)/_components/demos/VoiceTicketDemo.tsx` — reporter `"Maya Chen"`
  → `"Daniel Torres"`. (The `TicketCardMock` meta block renders reporter as text
  only; there is no avatar `<img>` inside the ticket card, so this was a clean
  one-line string swap. The Daniel avatar appears in the Voice mockup's ambient
  overlay and across the Sessions mockup.)
- `app/(marketing)/_styles/marketing.css`:
  - Removed the entire Suite/viz CSS block (`.suite`, `.suite-tabs`, `.st-*`,
    `.panel-*`, `.viz-*`, `.vb-*`, `.vs-*`, `.vi-*`, `.vm-*` ≈ 500 lines) and the
    standalone `.integ-*` block (≈ 85 lines), plus the dead `.viz-voice-host`
    rule and the now-orphaned `.panel-*`/`.suite-tabs`/`.integ-grid` responsive
    overrides.
  - Added ≈ 530 lines of `.ctt-*` / `.capture-mock-*` / `.voice-mock-*` /
    `.sessions-mock-*` styles, the `capture-mock-pulse` keyframe, a responsive
    single-column stack at ≤1100px (copy first, visual second), and a
    reduced-motion fallback.

## Images generated

**No image-generation tool was available in this environment.** Per the spec's
fallback path, I generated **placeholder JPEGs** at the exact spec dimensions
(soft tonal background + name label, so each is visually distinguishable). All 7
files exist and the code references them directly — drop in real photos at the
same paths to replace:

| File | Dimensions | Used in |
| --- | --- | --- |
| `public/marketing/people/maya-anand.jpg` | 400×400 | testimonial avatar, session sidebar/comment/share-pill |
| `public/marketing/people/daniel-torres.jpg` | 400×400 | session sidebar/comment/share-pill (Voice reporter is text) |
| `public/marketing/people/sarah-kim.jpg` | 400×400 | session sidebar, share-pill |
| `public/marketing/people/james-okafor.jpg` | 400×400 | session sidebar |
| `public/marketing/people/alex-nguyen.jpg` | 400×400 | generated per spec; not yet placed in a mockup (reserved) |
| `public/marketing/people/feedback-on-laptop.jpg` | 1200×800 | Capture ambient polaroid |
| `public/marketing/people/voice-feedback-headphones.jpg` | 800×1000 | Voice ambient polaroid |

> The exact AI-generation prompts for each file are in the build brief — use them
> to produce the real photos, then overwrite the placeholders in place. No code
> changes needed; filenames and paths already match.

## Spacing adjustment (post-build, per feedback)

Initial spec used per-section `min-height: 75vh / 90vh / 80vh`, which made each
section reserve most of a viewport and read as enormous gaps. Changed to
content-driven heights:
- Removed `vh` min-heights (mockups now set the scale).
- Between-section gaps `80px` → `56px` desktop / `48px` mobile.
- Root padding `96px 0 64px` → `72px 0 48px`; headline margin `64px` → `40px`.

## Verification

- `npx tsc --noEmit` — clean.
- `pnpm build` — `✓ Compiled successfully`.
- No remaining references to `Suite`, `Integrations` (homepage), or orphaned
  CSS. (Footer "Integrations" link and Pricing feature-list item are separate,
  out of scope, and intentionally retained.)

### Not verified (environment limitation)

- **Screenshots:** neither Playwright nor Puppeteer is installed, and adding a
  dependency was disallowed, so I could not capture the three subsection views.
  Visual verification (alternating layout, real-product styling recognizability,
  scroll-reveal, responsive stack) should be done by loading `/` in the browser.

## Suggested follow-ups

- Supply the 7 real photos (overwrite placeholders in place).
- Optionally place `alex-nguyen.jpg` somewhere, or remove it if unused.
- Confirm the new 56px section rhythm looks right; can reintroduce modest
  per-section `min-height` (e.g. 420/520/460px) if more deliberate variation is
  wanted.
