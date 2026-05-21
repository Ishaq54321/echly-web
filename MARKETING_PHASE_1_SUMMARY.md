# Marketing Phase 1 — Build Summary

Foundation for the marketing site is in place. Phase 2 can drop landing-page content (hero, sections, demos) into this scaffolding as a pure design / content exercise — no further architectural work is needed.

## 1. Verified component paths (pre-flight)

The audit (`MARKETING_AUDIT.md`) flagged several component locations as needing verification. Glob results:

| Audit name | Verified path |
|---|---|
| FeedbackDetail | [components/session/feedbackDetail/FeedbackDetail.tsx](components/session/feedbackDetail/FeedbackDetail.tsx) |
| FeedbackHeader | [components/session/feedbackDetail/FeedbackHeader.tsx](components/session/feedbackDetail/FeedbackHeader.tsx) |
| FeedbackContent | [components/session/feedbackDetail/FeedbackContent.tsx](components/session/feedbackDetail/FeedbackContent.tsx) |
| TicketItem (session list row) | [components/layout/operating-system/TicketItem.tsx](components/layout/operating-system/TicketItem.tsx) — no `SessionListItem.tsx` exists; `TicketItem` is the row |
| FourZoneLayout | [components/layout/operating-system/FourZoneLayout.tsx](components/layout/operating-system/FourZoneLayout.tsx) |
| TopControlBar | [components/ui/TopControlBar.tsx](components/ui/TopControlBar.tsx) |
| GlobalHeader | [components/layout/GlobalHeader.tsx](components/layout/GlobalHeader.tsx) |
| GlobalRail | [components/layout/GlobalRail.tsx](components/layout/GlobalRail.tsx) |
| RecordingMicOrb | [components/CaptureWidget/RecordingMicOrb.tsx](components/CaptureWidget/RecordingMicOrb.tsx) |
| MicOrb | [components/CaptureWidget/MicOrb.tsx](components/CaptureWidget/MicOrb.tsx) |
| ConfirmationCard (audit was unsure) | [components/CaptureWidget/ConfirmationCard.tsx](components/CaptureWidget/ConfirmationCard.tsx) — confirmed |
| KeepRecordingPill | [components/CaptureWidget/KeepRecordingPill.tsx](components/CaptureWidget/KeepRecordingPill.tsx) |
| UserAvatar | [components/ui/UserAvatar.tsx](components/ui/UserAvatar.tsx) |
| Tag | [components/ui/Tag.tsx](components/ui/Tag.tsx) |
| Badge | [components/ui/Badge.tsx](components/ui/Badge.tsx) |

Additional CaptureWidget files surfaced for Phase 2 reference: [SessionContext.tsx](components/CaptureWidget/SessionContext.tsx), [SessionControlPanel.tsx](components/CaptureWidget/SessionControlPanel.tsx), [SessionOverlay.tsx](components/CaptureWidget/SessionOverlay.tsx), [SessionFeedbackPopup.tsx](components/CaptureWidget/SessionFeedbackPopup.tsx), [FloatingCommandButton.tsx](components/CaptureWidget/FloatingCommandButton.tsx), [CommandPanel.tsx](components/CaptureWidget/CommandPanel.tsx), [MicrophoneSelector.tsx](components/CaptureWidget/MicrophoneSelector.tsx), [ModeTile.tsx](components/CaptureWidget/ModeTile.tsx), [RegionCaptureOverlay.tsx](components/CaptureWidget/RegionCaptureOverlay.tsx), [FeedbackList.tsx](components/CaptureWidget/FeedbackList.tsx).

## 2. `RootProviders` audit and restructure

### What `RootProviders` actually contained

[components/providers/RootProviders.tsx](components/providers/RootProviders.tsx) is two providers stacked:

1. **`AppBootGate`** ([components/providers/AppBootGate.tsx](components/providers/AppBootGate.tsx)) — outermost shell. Renders a wrapping `<div>` and provides `AppBootChromeContext`. The context is only consumed via `useAppBootChromeOptional()` (returns `null` safely if missing) and is only read by `AppBootReadinessBridge`, which is mounted exclusively in [`app/(app)/layout.tsx`](app/(app)/layout.tsx). **Harmless to mount anywhere; only structurally required by `(app)/`.**
2. **`WorkspaceProvider`** ([lib/client/workspaceContext.tsx](lib/client/workspaceContext.tsx)) — calls `onAuthStateChanged` on mount, subscribes to the active workspace doc, fetches `/api/workspace/member-count`, manages claims/identity readiness, and exposes ~30 fields via `useWorkspace()`. **Throws if `useWorkspace()` is called without it.**

### Why splitting was rejected

`AppBootGate` is only structurally needed by `(app)/`, but it's a tiny wrapping div plus an optional-read context. Splitting would mean a separate `WorkspaceOnlyProviders` file or inlining `WorkspaceProvider` at each surface — more surface area for no real win. The user explicitly said "don't over-engineer." Kept `RootProviders` whole and mounted it at every surface that needs `useWorkspace()`.

### Where `RootProviders` now lives

Removed from [`app/layout.tsx`](app/layout.tsx) and added to:

| Surface | Edit |
|---|---|
| [`app/(app)/layout.tsx`](app/(app)/layout.tsx) | Wrapped existing layout in `<RootProviders>` |
| [`app/admin/layout.tsx`](app/admin/layout.tsx) | Wrapped existing layout in `<RootProviders>` (in the default export — `AdminLayoutInner` calls `useWorkspace()`) |
| [`app/onboarding/layout.tsx`](app/onboarding/layout.tsx) | Wrapped `.ob-host` div in `<RootProviders>` |
| [`app/(public)/layout.tsx`](app/(public)/layout.tsx) | Wrapped `WorkspaceStoreProvider` + content in `<RootProviders>` |
| [`app/invite/[token]/page.tsx`](app/invite/[token]/page.tsx) | Renamed default export to `InviteAcceptPageInner`; new `InviteAcceptPage` default export wraps it in `<RootProviders>` |
| [`app/workspace-suspended/page.tsx`](app/workspace-suspended/page.tsx) | Renamed default export to `WorkspaceSuspendedInner`; new `WorkspaceSuspendedPage` default export wraps it in `<RootProviders>` |

`ToastProvider` and the `<div className="env-canvas">` wrapper stayed at the root layout — toasts are used everywhere (auth + marketing CTAs) and `env-canvas` is the atmospheric surface.

### Consumer audit — all `useWorkspace()` callers covered

`grep useWorkspace\\b app/**/*.{ts,tsx}` returned 14 files. All are inside one of the 6 wrapped surfaces above (or are page descendants of `(app)/`). No consumer is left without a provider.

| File | Surface |
|---|---|
| `app/(app)/dashboard/page.tsx` | `(app)` ✓ |
| `app/(app)/discussion/page.tsx` | `(app)` ✓ |
| `app/(app)/settings/page.tsx` | `(app)` ✓ |
| `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx` | `(app)` ✓ |
| `app/(app)/activity/page.tsx` | `(app)` ✓ |
| `app/(app)/layout.tsx` | `(app)` ✓ (self) |
| `app/(app)/dashboard/[sessionId]/overview/page.tsx` | `(app)` ✓ |
| `app/(app)/shared/page.tsx` | `(app)` ✓ |
| `app/(app)/dashboard/[sessionId]/hooks/useFeedbackDetailController.ts` | `(app)` ✓ |
| `app/workspace-suspended/page.tsx` | wrapped via inner/outer split ✓ |
| `app/onboarding/page.tsx` | `onboarding/layout.tsx` ✓ |
| `app/invite/[token]/page.tsx` | wrapped via inner/outer split ✓ |
| `app/admin/layout.tsx` | `admin/layout.tsx` ✓ |
| `app/(public)/session/[sessionId]/page.tsx` | `(public)/layout.tsx` ✓ |

`useAppBootChrome*` / `AppBootReadinessBridge` consumers: only [`app/(app)/layout.tsx`](app/(app)/layout.tsx) (the only place that mounts the bridge). `useAppBootChromeOptional` is a soft-fail (returns `null`), so missing it elsewhere is non-fatal.

## 3. Directory structure created

```
app/
  page.tsx                         # MODIFIED — smart root
  layout.tsx                       # MODIFIED — removed RootProviders, expanded metadata
  sitemap.ts                       # NEW
  robots.ts                        # NEW
  opengraph-image.tsx              # NEW
  (app)/
    layout.tsx                     # MODIFIED — wraps in <RootProviders>
  admin/
    layout.tsx                     # MODIFIED — wraps in <RootProviders>
  onboarding/
    layout.tsx                     # MODIFIED — wraps in <RootProviders>
  (public)/
    layout.tsx                     # MODIFIED — wraps in <RootProviders>
  invite/[token]/
    page.tsx                       # MODIFIED — split inner/outer, wraps in <RootProviders>
  workspace-suspended/
    page.tsx                       # MODIFIED — split inner/outer, wraps in <RootProviders>
  (marketing)/                     # NEW
    layout.tsx
    _components/
      MarketingHeader.tsx
      MarketingFooter.tsx
      MarketingHome.tsx
      demos/
        DemoBoundary.tsx
        BrowserFrame.tsx
        index.ts
    _mock/
      users.ts
      workspaces.ts
      sessions.ts
      feedback.ts
      index.ts
.env.example                       # MODIFIED — added NEXT_PUBLIC_BASE_URL comment
```

`(marketing)` is a route group (Next.js ignores names in parens for URL paths). `_components` and `_mock` are underscored so Next.js doesn't treat them as routes.

No `MarketingShell.tsx` was created — `(marketing)/layout.tsx` already composes `MarketingHeader` + `{children}` + `MarketingFooter`, and a separate inner wrapper would be premature abstraction.

## 4. Deviations from the Phase 1 prompt

1. **`RootProviders` placement.** The prompt's stated end state was "remove from root; add to `(app)/`." I added it to six surfaces (per the user's amended instructions in the second turn): `(app)`, `admin`, `onboarding`, `(public)` layouts plus `invite/[token]` and `workspace-suspended` pages. The success criterion the user defined ("mounted on every route that needs it, NOT on marketing") is met.
2. **`invite/[token]` and `workspace-suspended`: page-level wrap, not new layout files.** Per the user's amended instructions, the default export is split into an inner component (`InviteAcceptPageInner`, `WorkspaceSuspendedInner`) and a new outer default export that wraps in `<RootProviders>`. This is required because `useWorkspace()` is called inside the page component, so the provider must be above it in the tree — placing `<RootProviders>` in the same function would not work.
3. **`MarketingShell.tsx` not created.** Not load-bearing; the marketing layout composes the chrome directly. Phase 2 can add it if a third use case appears.
4. **Domain types — no formal `User` type exists.** I defined a `MockUser` interface inline in `app/(marketing)/_mock/users.ts`. The fields (`displayName`, `firstName`, `lastName`, `avatarUrl`, `colorSeed`) match what `UserAvatar.tsx` reads. Phase 2 should verify when wiring real components into demos.
5. **`Feedback.createdAt` mock value.** The domain type is `Timestamp | null` (Firestore Timestamp only). Mocks use `null` because constructing a real `Timestamp` would require importing `firebase/firestore`, which marketing must avoid. Display layers that show "created N days ago" need to tolerate `null` — Phase 2 should test this when embedding `FeedbackHeader` in a demo. Mocks include a `clientTimestamp: number | null` field for rough ordering.
6. **Tailwind token note.** `bg-surface-page` in [tailwind.config.ts](tailwind.config.ts) resolves to `#FFFFFF`, while the CSS token `--surface-page` in [styles/tokens.css](styles/tokens.css) resolves to the warm cream `#FAF9F7`. The marketing layout and components use `style={{ background: "var(--surface-page)" }}` to get the cream value. If a future Phase 2 author uses the Tailwind class instead, they'll get plain white. Worth a heads-up in the Phase 2 prompt.

## 5. Manual verification

Build: `npm run build` → ✓ Compiled successfully, no type errors, no eslint errors. The pre-existing Next 16 `middleware → proxy` deprecation warning is unrelated to Phase 1. The "edge runtime disables static generation" warning is expected for `/opengraph-image` and intended.

Route generation showed all expected entries: `ƒ /`, `○ /sitemap.xml`, `○ /robots.txt`, `ƒ /opengraph-image`, plus all the existing app routes (`/dashboard`, `/login`, `/onboarding`, `/admin/*`, `/invite/[token]`, `/workspace-suspended`, `/session/[sessionId]`).

I did NOT spin up `next dev` and click through manually. Pre-existing behavior is preserved by structural equivalence: every route that previously inherited `RootProviders` from the root now mounts it explicitly. Anything that breaks would have surfaced as a `useWorkspace must be used within a WorkspaceProvider` error during static generation of pages like `/admin`, `/onboarding`, `/check-email`, `/workspace-suspended` — and all of those generated cleanly.

### Updated success criteria (per user's amendment)

| Criterion | Status |
|---|---|
| Logged-out visitor at `/` → sees `MarketingHome` placeholder | Wired (smart root returns `<MarketingHome />` when no session) |
| Logged-in visitor at `/` → redirects to `/dashboard` | Wired (`redirect("/dashboard")` when `verifySessionToken` resolves) |
| `RootProviders` mounted on every route that needs it | ✓ — 6 surfaces, verified by `useWorkspace` grep |
| `RootProviders` NOT mounted on marketing routes | ✓ — `(marketing)/layout.tsx` is provider-free; smart root renders `<MarketingHome />` directly without any provider wrap |
| Existing app routes still work (no regressions) | Build clean; structural equivalence — see note above |
| Directory structure under `app/(marketing)/` exists | ✓ |
| Mock data conforms to real domain types | ✓ — `Workspace`, `Session`, `Feedback` typed imports compile |
| SEO files in place and serving | ✓ — `/sitemap.xml`, `/robots.txt`, `/opengraph-image` in route table |
| Build passes | ✓ |
| Summary documented | This file |

## 6. Open questions for Phase 2

1. **MarketingHome chrome composition.** The Phase 1 placeholder is rendered from `app/page.tsx` (the smart root), which means it does NOT inherit `(marketing)/layout.tsx` — no `MarketingHeader` or `MarketingFooter` around it. Phase 2 needs to decide: (a) compose `<MarketingHeader />` + `<MarketingFooter />` inside the home component itself, or (b) move the home to `(marketing)/page.tsx` and have the smart root render that. Recommend (a) — keeps the smart root a one-liner and lets the home stay self-contained.
2. **Tailwind `surface-page` vs. CSS `--surface-page` mismatch.** `bg-surface-page` (Tailwind) is white; `var(--surface-page)` (CSS) is warm cream `#FAF9F7`. Marketing currently uses the CSS variable. Phase 2 should either fix the Tailwind config or note this in code review.
3. **Mock screenshots.** `FeedbackDetail` resolves screenshots via `useScreenshotUrl()` (Firebase Storage). Per audit Risk #3, marketing demos need either (a) static assets in `public/marketing/screenshots/` with a way to bypass the hook, or (b) a way to feed a pre-resolved URL through the props path. Phase 2 must dig into [components/session/feedbackDetail/ScreenshotBlock.tsx](components/session/feedbackDetail/ScreenshotBlock.tsx) to find the bypass before embedding `FeedbackDetail` in a demo.
4. **`Feedback.createdAt` null-tolerance.** Mocks use `null` for `createdAt`. Phase 2 demos that embed `FeedbackHeader` / `TicketItem` must verify these components don't crash on null timestamps.
5. **Cookie / subdomain split.** Currently the marketing and app sites share `annote.ai`. Per audit Risk #6, if you ever split to `app.annote.ai` / `www.annote.ai`, `/api/auth/session` must set `Domain=.annote.ai` so the smart root on the marketing host can see the cookie. Not a Phase 2 concern unless the split happens — flagging because it's easy to forget.
6. **`/check-email` and `/forgot-password` listed disallowed in robots.** Verify with SEO that this is the right call (probably fine — they're transactional, not indexable surfaces).
7. **Phase 2 demo bundle weight.** Per audit Risk #2, real product components reused in demos should be dynamic-imported (`next/dynamic({ ssr: false })`) and lazy-mounted on scroll, to keep the homepage payload tight. The `DemoBoundary` wrapper doesn't enforce this; Phase 2 needs to.
