# Marketing Phase 2A — Landing Page Structure

Status: complete, uncommitted. Build is clean (`pnpm build` compiles successfully, no type errors, no new warnings beyond the pre-existing `middleware` / pnpm-workspaces deprecation notes).

## Section → component mapping

| V7 section                  | Component                                                                   | Notes |
|-----------------------------|------------------------------------------------------------------------------|-------|
| `<svg defs>` (logo gradients) | `_components/AnnoteLogo.tsx`                                                | Self-contained SVG with `useId()`-generated gradient IDs (collision-safe across instances) |
| Announcement bar            | `_components/AnnouncementBar.tsx`                                            | Server component |
| Nav                         | `_components/MarketingHeader.tsx` (rewritten)                                | Server component; mobile collapse at 1100px via CSS |
| `.hero`                     | `_components/sections/Hero.tsx`                                              | Static placeholder for portrait; floating cards rendered as decorative HTML |
| `.trust`                    | `_components/sections/TrustStrip.tsx`                                        | Server component |
| `.suite` (4 tabs)           | `_components/sections/Suite.tsx`                                             | `"use client"` — `useState<TabId>` toggles `.panel.is-on` |
| `.workflow`                 | `_components/sections/Workflow.tsx`                                          | Pure text, server component |
| `.sessions-detail`          | `_components/sections/SessionsDetail.tsx`                                    | `"use client"` — selected ticket index + copy-link state; 6 inline ticket records |
| `.context`                  | `_components/sections/Context.tsx`                                           | Server component |
| `.agencies`                 | `_components/sections/Agencies.tsx`                                          | Server component, 4-step flow with arrows |
| `.personas` (5 tabs)        | `_components/sections/Personas.tsx`                                          | `"use client"` — 5 persona records; 150 ms fade transition via `is-out` class |
| `.integ`                    | `_components/sections/Integrations.tsx`                                      | 10 tool cells (gradient mark placeholders — Phase 2B will swap real SVG logos) |
| `.pricing`                  | `_components/sections/Pricing.tsx`                                           | 3 tiers, Business marked `.is-rec` |
| `.faq`                      | `_components/sections/FAQ.tsx`                                               | `"use client"` — `useState<number \| null>` controls open index |
| `.editorial`                | `_components/sections/Editorial.tsx`                                         | Dark navy-violet split; `.ed-photo-placeholder` for Phase 2B image swap |
| `.closing`                  | `_components/sections/Closing.tsx`                                           | Server component |
| Footer + giant ANNOTE       | `_components/MarketingFooter.tsx` (rewritten)                                | Wordmark uses Helvetica + `-webkit-text-stroke` outline |
| Composition root            | `_components/MarketingHome.tsx` (rewritten)                                  | Imports `marketing.css`, wraps everything in `.marketing-root` |
| Layout                      | `(marketing)/layout.tsx` (rewritten)                                         | Now a pass-through; each page owns its chrome |
| Styles                      | `_styles/marketing.css` (new, ~1830 lines)                                   | All V7 tokens scoped under `.marketing-root`; keyframes prefixed `mk-` to avoid clashes |

Helpers also created:
- `_components/icons/index.tsx` — `ArrowIcon`, `PlayIcon`, `CheckIcon` (inline SVG, currentColor)

## Visual placeholders left for Phase 2B

These elements are static HTML in Phase 2A and should be strategically replaced with real product components in Phase 2B. Each is annotated in code with a `Phase 2B:` comment.

| File                                            | DOM element             | Replace with                                                      | Mock data                               |
|--------------------------------------------------|-------------------------|--------------------------------------------------------------------|-----------------------------------------|
| `sections/Hero.tsx`                              | `.hero-portrait` inner  | Hero product image/video (user-provided asset)                     | n/a                                     |
| `sections/Hero.tsx`                              | `.hero-comment` card    | Real `<FeedbackComment>` demo                                       | mock comment from `mock/feedback.ts`    |
| `sections/Hero.tsx`                              | `.hero-ticket` card     | Real `<FeedbackDetail>` via `next/dynamic`                          | `mockHeroTicket` from `mock/feedback.ts`|
| `sections/Suite.tsx`                             | `.viz-browser`          | Real `<BrowserFrame>` + element-selection demo                      | `mockSession.pageUrl` etc.              |
| `sections/Suite.tsx`                             | `.viz-mic`              | Real `<RecordingMicOrb>` with mock transcript                       | mock voice transcript                   |
| `sections/Suite.tsx`                             | `.viz-session`          | Mini `<FourZoneLayout>` preview                                     | first 4 of `mockTickets`                |
| `sections/Suite.tsx`                             | `.viz-stack`            | Real integration cards                                              | mock integration list                   |
| `sections/SessionsDetail.tsx`                    | entire `.sd-window`     | Real `<FourZoneLayout>` composition (already 6 mock tickets inline) | `mockSession` + `mockTickets`           |
| `sections/Integrations.tsx`                      | `.integ-cell-mark`      | Real SVG logos for each tool (Linear, Jira, etc.)                   | n/a                                     |
| `sections/Editorial.tsx`                         | `.ed-photo-placeholder` | Moody product photo or video still (user-provided asset)            | n/a                                     |

## Deviations from the prompt

1. **`vb-select` / `vb-tag` placement.** The prompt didn't address this, but the V7 HTML places them as children of `.vb-grid` while their absolute positioning is anchored to a higher parent. Initially copied that, then moved them to be siblings of `.vb-grid` inside `.viz-browser` so the absolute coordinates resolve to the browser-card frame as V7 visually intends. Same final pixel layout, cleaner DOM contract.
2. **`marketing.css` keyframe prefixes.** V7's animation names (`spin`, `pulse`, `aiwv`, `pulse-soft`, `comm-in`) are generic and could collide with app-level animations. Prefixed all keyframes with `mk-` (e.g., `mk-spin`) and updated every `animation:` reference to match. Pure rename, no behavior change.
3. **Skipped V7's `@font-face` block.** Verified `next/font/google` `DM_Sans({ subsets: ['latin'] })` in `app/layout.tsx` loads all weights by default. No weight list needed adding.
4. **`(marketing)/layout.tsx` is now a pure pass-through.** The smart-root composition (Option A in the prompt) means `MarketingHome` owns its own chrome and `.marketing-root` wrapper. The route-group layout returns `children` directly so future `(marketing)/` routes can own their own chrome too.
5. **Persona viz cards.** V7's design only specifies 2 viz-body slots per persona but the layout is `grid-template-columns: 1fr 1fr`. Provided 4 entries per persona (2 stat cards + 2 list cards) so the grid is balanced across rows. Pure visual fill, doesn't affect the interactivity contract Phase 2B may need.
6. **Integration grid.** V7's reference markup had no per-tool logos populated. Used 10 named cells with a gradient-mark placeholder rather than real SVG logos — Phase 2B will swap in real brand marks.
7. **`vb-grid` `position: relative`.** Briefly added then removed after relocating `vb-select`/`vb-tag` to siblings of `vb-grid` inside `viz-browser`. `viz-card` already has `position: absolute`, which provides the containing block.

## Build output

```
✓ Compiled successfully in 5.0s
Running TypeScript ... (clean)
Generating static pages (53/53)
```

Routes table includes `ƒ /` (Dynamic — server-rendered on demand) — expected because `app/page.tsx` calls `cookies()` for the smart-root redirect check.

Next 16.1 Turbopack does not print per-route First Load JS sizes in this project's output. **No `/` bundle-size baseline was captured.** Recommend revisiting in Phase 2B once `next/dynamic`-imported product components land — at that point the size comparison becomes meaningful and the gap can be inspected with `next build --debug` or `@next/bundle-analyzer`.

## Manual verification checklist

I cannot run a browser to walk through the live page, so the items below were verified statically by reading the code/build output:

- [x] **Build passes** — `pnpm build` clean, `npx tsc --noEmit` returns no errors.
- [x] **Smart-root composition correct** — `app/page.tsx` still calls `redirect("/dashboard")` for authed users; logged-out users render `<MarketingHome />`.
- [x] **No marketing → app/firebase imports** — grep for `lib/firebase`, `components/layout/GlobalHeader`, `useWorkspace`, `firebase/app|auth|firestore` against `app/(marketing)/` returns 0 import matches (only comment references in `_mock/`).
- [x] **CSS scoping intact** — every selector in `marketing.css` is prefixed with `.marketing-root`; tokens never leak to the app tree.
- [x] **Interactive sections marked `"use client"`** — Suite, SessionsDetail, Personas, FAQ. All four use `useState` only; no library dependencies added.
- [x] **Responsive breakpoints preserved** — V7's `@media (max-width: 1100px)` and `(max-width: 640px)` carried over verbatim, scoped under `.marketing-root`.
- [ ] **Live-browser walkthrough** — NOT performed in this pass. Recommend the reviewer load `/` in dev (`pnpm dev`), scroll the whole page, test each interactive element (Suite tabs, Sessions list select, Personas tab swap, FAQ accordion, copy-link button), and resize across breakpoints.
- [ ] **Bundle size baseline** — NOT captured; see note above.

## Phase 2B prep — strategic swaps

In order of impact:

1. **`sections/Hero.tsx` → `.hero-ticket` card**: highest-fidelity demo opportunity. Render `<FeedbackDetail>` (dynamic-imported) fed `mockHeroTicket`. Container needs to stay within the V7 card dimensions (`width: 290px`) — either constrain the real component or wrap it in a styled shell.
2. **`sections/SessionsDetail.tsx` → entire `.sd-window`**: highest payoff for "this is the real product" feel. Replace the inline `TICKETS` array with the imports from `_mock/feedback.ts` and `_mock/sessions.ts`, mount `<FourZoneLayout>` via `next/dynamic`. Will require type-checking that `FourZoneLayout`'s required props can be satisfied without `WorkspaceProvider`.
3. **`sections/Suite.tsx` → `.viz-session` (Sessions tab)**: a smaller `<FourZoneLayout>` preview using the first 4 mock tickets. Same dynamic-import treatment.
4. **`sections/Suite.tsx` → `.viz-mic` (Voice tab)**: real `<RecordingMicOrb>` (pulse animation already matches visually) — but only if the orb component runs without media/Firebase deps. Audit first.
5. **`sections/Integrations.tsx` → `.integ-cell-mark`**: swap each gradient block for the actual brand SVG. Static, no dynamic-import needed.
6. **`sections/Editorial.tsx` + `sections/Hero.tsx`**: portrait/photo slots wait on user-provided images.

For every dynamic-imported swap, gate behind `<DemoBoundary>` (from Phase 1) so missing mock data or runtime errors don't blow up the marketing page.
