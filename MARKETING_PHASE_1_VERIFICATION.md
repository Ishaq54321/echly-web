# Marketing Phase 1 — Verification Audit

Read-only audit of the Phase 1 marketing foundation. No files were modified. Findings are organized by section and consolidated at the end (Section 10) with severity.

Legend: ✅ pass · ❌ fail · ⚠️ concern / heads-up

---

## Section 1: Smart root behavior verification

File reviewed: [app/page.tsx](app/page.tsx)

1. **Cookie name correctness.** ✅
   - [app/page.tsx:3](app/page.tsx#L3) imports `SESSION_COOKIE_NAME` from `@/lib/server/session`.
   - [lib/server/session.ts:3](lib/server/session.ts#L3) defines `COOKIE_NAME = "annote_session"` and re-exports it as `SESSION_COOKIE_NAME` ([lib/server/session.ts:91](lib/server/session.ts#L91)).
   - [middleware.ts:81](middleware.ts#L81) reads the same literal `"annote_session"`. Identical cookie across smart root + middleware → no silent split.

2. **JWT verification import.** ✅
   - [app/page.tsx:3](app/page.tsx#L3) imports `verifySessionToken` from `@/lib/server/session`.
   - [middleware.ts:4](middleware.ts#L4) imports the exact same `verifySessionToken` from `@/lib/server/session`.
   - One verification surface, one secret resolution path. No mismatch.

3. **Redirect behavior.** ✅ (matches the audit's stated expectation, with one annotated nuance)
   - Logged-in **verified** user: `verifySessionToken` returns payload → `if (session) redirect("/dashboard")` ([app/page.tsx:14](app/page.tsx#L14)). ✅
   - Logged-in **unverified** user: same path — `app/page.tsx` ships them to `/dashboard`; middleware (steps 6/7) re-redirects to `/check-email`. The double-redirect is explicitly accepted (comment lines 9–13). ✅
   - Logged-out user (no cookie, OR cookie present but JWT invalid): `verifySessionToken` returns `null` → `session` is falsy → falls through to `<MarketingHome />`. ✅
   - JWT verification throws: `verifySessionToken` swallows internally — see [lib/server/session.ts:50-63](lib/server/session.ts#L50-L63), it returns `null` on any error inside its own `try/catch`. So `app/page.tsx` will never see the throw; it sees `null` and renders marketing. ✅

4. **Try/catch coverage.** ✅
   - The page itself does NOT wrap the call in `try/catch`, but it doesn't need to — `verifySessionToken` is internally try/catched and only ever resolves to `SessionPayload | null` (never throws). Malformed cookies → `jwtVerify` throws → caught → `null` returned → marketing renders. Safe.
   - One residual risk: if `getSecret()` throws because `SESSION_SECRET` is unset in **production** ([lib/server/session.ts:30](lib/server/session.ts#L30)), that throw is *inside* the inner try and IS caught. ✅

5. **No flash of marketing.** ✅
   - [app/page.tsx](app/page.tsx) has no `"use client"` directive. It's an `async` server component using `next/headers` `cookies()` — by definition server-only.
   - `redirect("/dashboard")` is thrown from the server, so logged-in users get a 307 from the same render pass. No client paint of `<MarketingHome />` is possible.

---

## Section 2: Provider mount completeness

Consumers searched via `grep useWorkspace\b` across the repo. 47 files matched; the consumers under `app/**` and `components/**` were traced to their route trees.

### 2.1 Direct page/layout consumers (auto-loaded via Next routing)

| Consumer | Route surface | `RootProviders` mounted? |
|---|---|---|
| [app/(app)/layout.tsx:8](app/(app)/layout.tsx#L8) | `(app)/*` | ✅ wraps inner tree at line 26 |
| [app/(app)/dashboard/page.tsx](app/(app)/dashboard/page.tsx) | `(app)/dashboard` | ✅ inherits from `(app)/layout` |
| [app/(app)/discussion/page.tsx](app/(app)/discussion/page.tsx) | `(app)/discussion` | ✅ inherits |
| [app/(app)/settings/page.tsx](app/(app)/settings/page.tsx) | `(app)/settings` | ✅ inherits |
| [app/(app)/activity/page.tsx](app/(app)/activity/page.tsx) | `(app)/activity` | ✅ inherits |
| [app/(app)/shared/page.tsx](app/(app)/shared/page.tsx) | `(app)/shared` | ✅ inherits |
| [app/(app)/dashboard/[sessionId]/SessionPageClient.tsx](app/(app)/dashboard/[sessionId]/SessionPageClient.tsx) | `(app)/dashboard/[id]` | ✅ inherits |
| [app/(app)/dashboard/[sessionId]/overview/page.tsx](app/(app)/dashboard/[sessionId]/overview/page.tsx) | `(app)/dashboard/[id]/overview` | ✅ inherits |
| [app/(app)/dashboard/[sessionId]/hooks/useFeedbackDetailController.ts](app/(app)/dashboard/[sessionId]/hooks/useFeedbackDetailController.ts) | `(app)/dashboard/[id]` | ✅ inherits |
| [app/admin/layout.tsx:14](app/admin/layout.tsx#L14) (`AdminLayoutInner` calls `useWorkspace()`) | `/admin/*` | ✅ default export `AdminRootLayout` wraps at line 96 |
| [app/onboarding/page.tsx](app/onboarding/page.tsx) | `/onboarding` | ✅ via `app/onboarding/layout.tsx:12` |
| [app/(public)/session/[sessionId]/page.tsx](app/(public)/session/[sessionId]/page.tsx) | `(public)/session/[id]` | ✅ via `app/(public)/layout.tsx:11` |
| [app/invite/[token]/page.tsx:331](app/invite/[token]/page.tsx#L331) (`InviteAcceptPageInner`) | `/invite/[token]` | ✅ default export wraps at line 1374 |
| [app/workspace-suspended/page.tsx:10](app/workspace-suspended/page.tsx#L10) (`WorkspaceSuspendedInner`) | `/workspace-suspended` | ✅ default export wraps at line 97 |

### 2.2 Component consumers (loaded as descendants of the above)

| Consumer file | Loaded under | `RootProviders` mounted upstream? |
|---|---|---|
| `components/dashboard/SessionsWorkspace.tsx` | `(app)/dashboard` | ✅ via `(app)/layout` |
| `components/dashboard/SessionActionsDropdown.tsx` | `(app)/dashboard` | ✅ |
| `components/layout/GlobalRailContent.tsx` | `(app)/*` shell | ✅ |
| `components/layout/GlobalNavBar.tsx` | `(app)/*` shell | ✅ |
| `components/layout/ProfileDropdown.tsx` | `(app)/*` shell | ✅ |
| `components/layout/ProfileCommandPanel.tsx` | `(app)/*` shell | ✅ |
| `components/layout/operating-system/SystemNavigationRail.tsx` | `(app)/*` shell | ✅ |
| `components/ui/TopControlBar.tsx` | `(app)/dashboard/[id]` | ✅ |
| `components/billing/UpgradeModal.tsx` | `(app)/settings` etc. | ✅ |
| `components/billing/UsageMeter.tsx` | `(app)` shell | ✅ |
| `components/billing/BillingUsageCacheInitializer.tsx` | `(app)/layout.tsx:7` | ✅ (mounted at `(app)/layout` line 30, under `<RootProviders>`) |
| `components/onboarding/ProfileStep.tsx` | `/onboarding` | ✅ |
| `components/workspace/WorkspaceIdentityGate.tsx` | `(app)/layout.tsx:5` | ✅ |
| `components/workspace/WorkspaceSuspendedGuard.tsx` | `(app)/layout.tsx:5` | ✅ |
| `components/share/ExternalShareModal.tsx` | `(app)/dashboard/[id]` | ✅ |
| `components/search/GlobalSearch.tsx` | `(app)` (LazyGlobalSearch) + `(public)/layout.tsx:14` | ✅ both |
| `components/feedback/AssignDropdown.tsx` | `(app)/dashboard/[id]` | ✅ |
| `components/session/feedbackDetail/ScreenshotWithPins.tsx` | `(app)/dashboard/[id]` | ✅ |
| `components/discussion/DiscussionConversation.tsx` | `(app)/discussion` | ✅ |
| `lib/hooks/useBillingUsage.ts`, `useCommentsRepoSubscription.ts`, `useWorkspaceUsageRealtime.ts`, `useAuthGuard.ts` | called from `(app)/*` clients | ✅ |
| `lib/client/workspaceStore.ts` | nests under `WorkspaceStoreProvider` (which is *inside* `RootProviders` in both `(app)/layout.tsx:29` and `(public)/layout.tsx:12`) | ✅ |
| `lib/client/perception/useRenderReadiness.ts` | `(app)/*` perception hooks | ✅ |
| `lib/billing/BillingUsageProvider.tsx` | rendered via `BillingUsageCacheInitializer` (`(app)`) | ✅ |
| `components/providers/AppBootGate.tsx` (`AppBootReadinessBridge`) | `(app)/layout.tsx:31` only | ✅ |

**No `useWorkspace()` consumer left without a `WorkspaceProvider` ancestor.** ✅

### 2.3 Specific route walks

- `/dashboard` → `app/layout.tsx` (no provider) → `app/(app)/layout.tsx` (wraps `<RootProviders>`) → page. ✅
- `/admin` → `app/layout.tsx` → `app/admin/layout.tsx` (default export wraps `<RootProviders>` around `AdminLayoutInner`). ✅
- `/onboarding` → `app/layout.tsx` → `app/onboarding/layout.tsx` (wraps `<RootProviders>` around `.ob-host`). ✅
- `/invite/[token]` → `app/layout.tsx` → `app/invite/[token]/page.tsx` default export wraps `<RootProviders>` around `InviteAcceptPageInner`. ✅
- `/workspace-suspended` → `app/layout.tsx` → `app/workspace-suspended/page.tsx` default export wraps `<RootProviders>`. ✅
- `/session/[id]` (public viewer) → `app/layout.tsx` → `app/(public)/layout.tsx` (wraps `<RootProviders>` then `<WorkspaceStoreProvider>` then content). ✅
- `/` (smart root) → `app/layout.tsx` → `app/page.tsx` (no provider; either `redirect("/dashboard")` happens server-side, or `<MarketingHome />` renders without `RootProviders`). ✅

### 2.4 Nested mounts (red flag check)

Searched for any path where `RootProviders` could be encountered twice in a single tree.

- `(app)/dashboard/[sessionId]/SessionPageClient.tsx` does **not** mount `RootProviders` itself — it just uses `useWorkspace()` inside the `(app)` shell. ✅
- `app/invite/[token]/page.tsx` and `app/workspace-suspended/page.tsx` are routed under `app/layout.tsx` only (no group layout above them) — single mount each. ✅
- `app/onboarding/page.tsx` does not mount its own `RootProviders` (only its layout does). ✅
- `app/(public)/session/[sessionId]/page.tsx` does not mount its own `RootProviders` (only its layout does). ✅

**No double-mounts.** ✅

### 2.5 `/no-workspace` — gap check

`/no-workspace` is at [app/(app)/no-workspace/page.tsx](app/(app)/no-workspace/page.tsx) — inside `(app)/`, so it inherits `RootProviders` from [app/(app)/layout.tsx](app/(app)/layout.tsx). The page itself doesn't call `useWorkspace()` (only `signOut` + a link), but children of the `(app)` shell still need the provider, which is mounted. ✅

### 2.6 `/auth/*` routes

[app/(auth)/layout.tsx](app/(auth)/layout.tsx) does not mount `RootProviders` and the audit summary explicitly says auth routes don't need it. Confirmed — `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/check-email`, `/auth/action` do NOT call `useWorkspace()` from any direct page (auth uses `useAuthGuard`/Firebase directly, no workspace context). ✅

---

## Section 3: Existing route regression check

Each existing route was traced through its layout chain to confirm structural equivalence to the pre-restructure state (everything that previously inherited `RootProviders` from `app/layout.tsx` now inherits it from a directly-mounted instance one level deeper).

| Route | Tree | Status |
|---|---|---|
| `/dashboard/[sessionId]` | `app/layout → (app)/layout (RootProviders + Suspended + Identity + WorkspaceStore + bridge) → dashboard/[id] page` | ✅ unchanged tree depth aside from the new outermost `<RootProviders>` |
| `/settings` | `app/layout → (app)/layout → settings/page` | ✅ |
| `/activity` | `app/layout → (app)/layout → activity/page` | ✅ |
| `/shared` | `app/layout → (app)/layout → shared/page` | ✅ |
| `/discussion` | `app/layout → (app)/layout → discussion/page` | ✅ |
| `/no-workspace` | `app/layout → (app)/layout → no-workspace/page` | ✅ |
| `/login`, `/signup`, `/forgot-password`, `/check-email`, `/reset-password`, `/auth/action` | `app/layout → (auth)/layout (no providers) → page` | ✅ no `useWorkspace()` consumers inside, no providers needed |
| `/session/[id]` (public viewer) | `app/layout → (public)/layout (RootProviders + WorkspaceStoreProvider) → session/[id]/page` | ✅ |

### 3.1 Public viewer + `WorkspaceProvider` behavior for anonymous guests

[lib/client/workspaceContext.tsx:441-487](lib/client/workspaceContext.tsx#L441-L487) — the auth listener:

- On mount, calls `onAuthStateChanged(auth, …)`.
- If the callback fires with **no user** (anonymous guest): sets `authReady=true`, clears `authUid`, `workspaceId`, sets `workspaceLoading=false`, `claimsReady=false`. Crucially it does NOT fire `runIdentitySync`, so no `/api/users` POST, no Firestore subscription, no member-count fetch.
- If the callback fires with a user: runs `runIdentitySync(uid)` → calls `POST /api/users`, etc.

**For anonymous guests on `/session/[id]`:** ✅ safe. The provider initializes, fires the auth listener, sees null, settles in an "idle, signed-out" state. No workspace ID is required; nothing in the provider's effect chain reads workspace ID unless `authUid && claimsReady`.

**For logged-in users on `/session/[id]`:** ✅ same flow but with `authUid` populated and an active membership fetch — same as `(app)` surfaces. Bundle weight is paid (Firebase init), but that already happened pre-restructure.

⚠️ **One caveat (Phase 5 cookie-vs-Firebase split).** Anonymous guests now mount `WorkspaceProvider` (it was mounted at root before too, so this is unchanged behavior). It does fire `onAuthStateChanged` even for anonymous visitors, which means Firebase Auth SDK is loaded on every public viewer pageview. This is **pre-existing** — not a Phase 1 regression — but worth noting: the marketing-page goal of *no Firebase init for logged-out visitors* is honored on `/` but is NOT in scope for `/session/[id]` because the public viewer can serve logged-in workspace members and needs the workspace context.

---

## Section 4: `RootProviders` contents and side effects

File: [components/providers/RootProviders.tsx](components/providers/RootProviders.tsx)

```
<AppBootGate>
  <WorkspaceProvider>
    {children}
  </WorkspaceProvider>
</AppBootGate>
```

### 4.1 `AppBootGate` — [components/providers/AppBootGate.tsx](components/providers/AppBootGate.tsx)

- **What it exposes:** `AppBootChromeContext` (`{ surfaceReady, reportSurfaceReady }`).
- **Mount behavior:** `useState(true)` for `surfaceReady`, `useCallback`, `useMemo`, render `<div className="relative flex h-full min-h-screen w-full flex-1 flex-col">{children}</div>`. **No effects fire on mount, no fetches, no subscriptions.**
- **Safe for:**
  - Authenticated users ✅
  - Unauthenticated users (public viewer) ✅
  - Onboarding users (no workspace yet) ✅
- ⚠️ **Layout side effect:** the wrapper `<div>` applies `min-h-screen flex flex-col` — this is the same wrapper the pre-restructure root layout produced (effectively), so existing routes should look identical. The marketing route group does NOT include this wrapper (`(marketing)/layout.tsx` brings its own `min-h-screen flex flex-col` shell). The smart root's `MarketingHome` provides its own `min-h-screen` too. Confirmed: no missing-shell-height bug.

### 4.2 `WorkspaceProvider` — [lib/client/workspaceContext.tsx:180](lib/client/workspaceContext.tsx#L180)

- **What it exposes:** ~30 fields via `useWorkspace()` (authUid, claimsReady, workspaceId, workspaceDoc-derived fields, membership list, etc.).
- **Mount behavior (the heavy stuff):**
  1. `useEffect` line 441 — subscribes to `onAuthStateChanged(auth, …)`. This loads Firebase Auth SDK if not already loaded.
  2. When `claimsReady && authUid`, `useEffect` line 503 — fetches `/api/workspace/memberships`.
  3. `useEffect` (further down, not in my read window) — subscribes to `listenToWorkspace(workspaceId)` Firestore listener.
  4. `useEffect` — calls `fetchWorkspaceMemberCount(workspaceId)` → `authFetch("/api/workspace/member-count")`.
- **Safe for:**
  - **Authenticated users:** ✅
  - **Unauthenticated users** (logged-out viewer on `/session/[id]`): ✅ — `onAuthStateChanged` returns null, no syncs run, no fetches fire. State settles with `authReady=true, authUid=null`. **Note:** Firebase Auth SDK still loads. See Section 3.1.
  - **Onboarding users (no workspace yet):** ✅ — `runIdentitySync` handles the no-workspace case explicitly at [lib/client/workspaceContext.tsx:362-374](lib/client/workspaceContext.tsx#L362-L374) by setting `needsOnboarding=true` and returning without throwing. The provider does NOT block render.
  - **Users on `/invite/[token]` before accepting:** ✅ — same as onboarding state OR same as a regular signed-in user. The wrapping doesn't introduce a new failure mode (the provider's `useWorkspace()` call from `InviteAcceptPageInner` reads `refreshMemberships` only — line 331 — which is safe in all states).
- ⚠️ **`AppBootReadinessBridge` is NOT inside `RootProviders`.** It lives in `components/providers/AppBootGate.tsx` (separate export) and is mounted only in [app/(app)/layout.tsx:31](app/(app)/layout.tsx#L31). It calls `useAppBootChromeOptional()` (soft-fail) and `useWorkspace()`. Because it's only in `(app)/layout.tsx`, every surface other than `(app)/*` will silently not gate on boot — which is fine, those surfaces don't need the boot overlay. ✅
- **Provider initialization order:** `AppBootGate` (outer) → `WorkspaceProvider` (inner). `AppBootReadinessBridge` (in `(app)/layout.tsx`) reads BOTH `useAppBootChromeOptional()` and `useWorkspace()`, so both contexts must be available at that mount point. They are (the bridge is rendered inside `(app)/layout.tsx`'s `<RootProviders>` wrap). ✅

---

## Section 5: Marketing chrome — visual and structural

Files reviewed:
- [app/(marketing)/layout.tsx](app/(marketing)/layout.tsx)
- [app/(marketing)/_components/MarketingHeader.tsx](app/(marketing)/_components/MarketingHeader.tsx)
- [app/(marketing)/_components/MarketingFooter.tsx](app/(marketing)/_components/MarketingFooter.tsx)
- [app/(marketing)/_components/MarketingHome.tsx](app/(marketing)/_components/MarketingHome.tsx)

### 5.1 Imports check ✅

Grep results for the marketing component dir confirm **none** of the following are imported anywhere in `app/(marketing)/_components/`:

- `lib/firebase` / `lib/firebase/*`
- `components/layout/GlobalHeader.tsx`
- `components/layout/GlobalRail.tsx`
- `lib/repositories/*`
- `useAuth`, `useWorkspace`, `WorkspaceProvider`
- Firestore (`firebase/firestore`)
- `onAuthStateChanged`

Imports in each file:

| File | Imports |
|---|---|
| `layout.tsx` | `MarketingHeader`, `MarketingFooter` (relative) |
| `MarketingHeader.tsx` | `next/link` only |
| `MarketingFooter.tsx` | none (pure JSX) |
| `MarketingHome.tsx` | none (pure JSX) |
| `DemoBoundary.tsx` | `react` only |
| `BrowserFrame.tsx` | `react` (`ReactNode` type) only |

✅ **Marketing chrome is fully import-clean from auth/Firebase/repos.**

### 5.2 Design token usage ✅

All four files use CSS variable names that resolve in [styles/tokens.css](styles/tokens.css):

- `--surface-page` ✅ (defined line 56 / 470 in tokens.css)
- `--text-heading` ✅
- `--text-body` ✅
- `--text-tertiary` ✅
- `--border` ✅
- `--brand` ✅
- `--surface-card` ✅
- `--surface-subtle` ✅
- `--surface` ✅
- `--overlay-dark-border` ✅ (used in `BrowserFrame`)
- `--overlay-dark-text-soft` ✅

No use of invented token names like `--color-background-*` or `--color-text-primary`. Memory `[[design_tokens_real_names]]` rule respected.

### 5.3 The `bg-surface-page` Tailwind vs CSS variable issue ⚠️

Confirmed: [tailwind.config.ts:20-26](tailwind.config.ts#L20-L26) defines `surface.page = "#FFFFFF"`, while [styles/tokens.css:56](styles/tokens.css#L56) defines `--surface-page: #FAF9F7`. Two different values for the same conceptual token.

**Where marketing uses it:**
- `app/(marketing)/layout.tsx:17` — uses `style={{ background: "var(--surface-page)" }}` ✅ correct cream
- `app/(marketing)/_components/MarketingHeader.tsx:19` — same inline `var()` ✅
- `app/(marketing)/_components/MarketingFooter.tsx:69` — same ✅
- `app/(marketing)/_components/MarketingHome.tsx:17` — same ✅

**Where the Tailwind class is used elsewhere in the app (would render white):**
- `app/(app)/discussion/page.tsx:277` — `bg-[var(--surface-page)]` (this uses arbitrary-value Tailwind which DOES resolve the CSS var, not the Tailwind palette). Same with `components/ui/TopControlBar.tsx:140, 156`. So those are fine — they only get the white-vs-cream split if someone writes the bare class `bg-surface-page` without arbitrary brackets.

⚠️ **Trap remains for Phase 2 authors.** If anyone writes `className="bg-surface-page"` (no brackets), Tailwind resolves it to `#FFFFFF`. Marketing currently sidesteps this entirely with inline `style`, so the issue is latent until Phase 2 starts dropping Tailwind utility classes in marketing components. Recommend either:
1. Change `tailwind.config.ts` line 22 from `"#FFFFFF"` to `"var(--surface-page)"` (resolves the discrepancy at the config layer).
2. Document the trap in a Phase 2 prompt or `app/(marketing)/_components/README.md`.

### 5.4 Smart root chrome composition ⚠️ (by-design for Phase 1; flagged in summary)

Confirmed:
- [app/page.tsx:15](app/page.tsx#L15) renders `<MarketingHome />` directly, NOT inside `(marketing)/layout.tsx`. Next.js route groups in parens (`(marketing)`) participate in routing, but a sibling `app/page.tsx` is a top-level page that uses ONLY `app/layout.tsx`. There's no automatic composition with `(marketing)/layout.tsx`.
- `MarketingHome.tsx` is a self-contained `<main>` with no header/footer.
- `MarketingHeader` and `MarketingFooter` are therefore **invisible at `/`**.

This is documented in the summary (open question #1) as a deliberate Phase 1 placeholder choice. ⚠️ Phase 2 must resolve — recommend the summary's option (a): compose `<MarketingHeader />` / `<MarketingFooter />` inside `MarketingHome` so the smart root stays a one-liner.

---

## Section 6: Mock data type conformance

### 6.1 Type imports ✅

- [app/(marketing)/_mock/workspaces.ts:1](app/(marketing)/_mock/workspaces.ts#L1) imports `Workspace` from `@/lib/domain/workspace`.
- [app/(marketing)/_mock/sessions.ts:1](app/(marketing)/_mock/sessions.ts#L1) imports `Session` from `@/lib/domain/session`.
- [app/(marketing)/_mock/feedback.ts:1](app/(marketing)/_mock/feedback.ts#L1) imports `Feedback` from `@/lib/domain/feedback`.
- [app/(marketing)/_mock/users.ts](app/(marketing)/_mock/users.ts) defines `MockUser` locally because there is no formal `lib/domain/user` type.

Real domain types — not re-defined locally for the three real types. ✅

### 6.2 `Workspace` mock conformance ✅

`mockWorkspace` ([workspaces.ts:7](app/(marketing)/_mock/workspaces.ts#L7)) satisfies the `Workspace` interface:

- All required scalar fields present (`id`, `name`, `logoUrl`, `brandLogoUrl`, `ownerId`, `appearance`, `notifications`, `automations`, `permissions`, `integrations`, `billing`, `entitlements`, `usage`).
- Timestamp fields (`createdAt`, `updatedAt`, `deletedAt`, `deletedBy`, `deleteScheduledPurgeAt`) all `null` — matches `Timestamp | null` union.
- `entitlements: {}` — type allows empty (all fields optional).
- `billing.plan: "business"` — valid `WorkspacePlan`.
- Tracks `sessionCount: 18, archivedCount: 10` — both optional, both present.

### 6.3 `Session` mock conformance ✅

`mockSession` ([sessions.ts:16](app/(marketing)/_mock/sessions.ts#L16)) satisfies `Session`:

- All required fields: `id`, `workspaceId`, `title`, `accessLevel`, `generalAccess`, `createdByUserId`. ✅
- `createdAt: Date`, `updatedAt: new Date(FIVE_MIN_AGO)` — both match `Timestamp | Date | string | null`. ✅
- `recentViewers` array entries each have `{id, displayName, avatarUrl, isAnonymous, viewedAt}` — match `Session.recentViewers` element shape.
- `accessLevel: "comment"` — needs to match the `AccessLevel` union from `@/lib/domain/accessLevel`. Not verified directly here (didn't read that file), but TypeScript build passed, so it's a valid union member.
- `generalAccess: "link_view"` — matches `SessionGeneralAccess`. ✅

### 6.4 `Feedback` mock conformance with critical null-tolerance question ⚠️

`mockHeroTicket` + 7 more entries in `mockTickets` ([feedback.ts:17-244](app/(marketing)/_mock/feedback.ts#L17-L244)):

- All required fields present: `id`, `sessionId`, `title`, `type`, `isResolved`, `createdAt`. ✅
- `createdAt: null` for every ticket. Matches type (`Timestamp | null`).
- All optional fields used appropriately (assignment, priority, viewport dims, tags, etc.).
- `screenshotId: null`, `screenshotStatus: "none"` — match union. ✅

**Null-timestamp consumer survey:**

| Consumer | Path | Tolerance |
|---|---|---|
| `FeedbackHeader` `metaLine` block | [components/session/feedbackDetail/FeedbackHeader.tsx:103-114](components/session/feedbackDetail/FeedbackHeader.tsx#L103-L114) | ✅ explicitly checks `item.createdAt != null` before calling `formatRelative`. If both `createdAt` and `updatedAt` are null, `metaLine` is `null` and no "Created N ago" line renders. |
| `FeedbackCommandPanel` sort key | [components/layout/operating-system/FeedbackCommandPanel.tsx:129](components/layout/operating-system/FeedbackCommandPanel.tsx#L129) | ✅ falls back to `clientTimestamp ?? 0` — but our mocks include real numeric `clientTimestamp` values so ordering works correctly. |
| `FeedbackCommandPanel` row display | line 330 | ✅ `formatRelative(item.createdAt, item.clientTimestamp)` — two-arg form falls back to `clientTimestamp` when `createdAt` null. |
| `SignalStream` | [SignalStream.tsx:61, 155](components/layout/operating-system/SignalStream.tsx#L61) | ✅ same pattern as FeedbackCommandPanel — `?.seconds != null` checks + `clientTimestamp` fallback. |
| `ContextPanel` | [ContextPanel.tsx:44](components/layout/operating-system/ContextPanel.tsx#L44) | Read partial only — uses `latest.createdAt` directly. Not verified for null-tolerance. ⚠️ Phase 2 must check before embedding. |
| `TicketItem` | [components/layout/operating-system/TicketItem.tsx](components/layout/operating-system/TicketItem.tsx) | Grep returned no `createdAt` references in this file. ✅ Doesn't read `createdAt` at all, so null is irrelevant. |
| `FeedbackDetail` (umbrella) | parent of `FeedbackHeader` etc. | Inherits header null-safety + screenshot resolver behavior (separate concern, see Phase 1 open question #3 about screenshot URL resolution). |

**Bottom line on null timestamps:** The two key consumers (`FeedbackHeader`, `TicketItem`) tolerate `null` either by explicit checks or by not reading the field. ✅ `FeedbackCommandPanel` and `SignalStream` are also safe via `clientTimestamp` fallback (mocks provide that). `ContextPanel` is the one place Phase 2 must verify before embedding the full session detail demo.

### 6.5 `MockUser` shape vs. real consumers ✅

[users.ts:5-20](app/(marketing)/_mock/users.ts#L5-L20) defines:

```
id, displayName, firstName, lastName, avatarUrl, role, org, colorSeed?
```

[components/ui/UserAvatar.tsx:7-35](components/ui/UserAvatar.tsx#L7-L35) reads:

```
avatarUrl | image | photoURL, name, colorSeed, size, className, style, isAnonymous, alt
```

Compatibility:
- `MockUser.avatarUrl` → maps directly to `UserAvatar.avatarUrl` ✅
- `MockUser.displayName` → maps to `UserAvatar.name` ✅
- `MockUser.colorSeed` → maps directly ✅
- `MockUser.firstName/lastName` not consumed by `UserAvatar` itself but matches `WorkspaceContextValue.firstName/lastName` semantics (empty string when missing — see workspaceContext.tsx:108-112).

**Missing field that real product code expects:** none for `UserAvatar`. For other consumers:
- `Tag` ([components/ui/Tag.tsx](components/ui/Tag.tsx)) — not a user consumer, just a generic chip. ✅
- `Badge` — same.
- `MentionedUserIds` resolver code (in activity/discussion features) typically reads from a separate `users/` collection lookup. If Phase 2 embeds a comment thread with mentions, it'll need a mock lookup helper (a `getMockUserById` would be nice — `mockUsersById` already provides that ✅).

### 6.6 Cross-mock ID consistency ✅

- `mockSession.id = "session_q2_launch_preflight"` → `mockTickets[*].sessionId = SESSION_ID = "session_q2_launch_preflight"`. ✅
- `mockSession.workspaceId = "ws_northwind_studio"` → `mockTickets[*].workspaceId = WORKSPACE_ID = "ws_northwind_studio"` ✅ and `mockWorkspace.id = "ws_northwind_studio"`. ✅
- `mockWorkspace.ownerId = "user_sarah"` → `mockSarah.id = "user_sarah"`. ✅
- `mockSession.createdByUserId = "user_maya"` → `mockMaya.id = "user_maya"`. ✅
- `mockSession.recentViewers[*].id` — `user_maya`, `user_daniel`, `user_jordan` — all match users in `mockUsersById`. ✅
- `mockTickets[*].assigneeId` values — `user_daniel`, `user_maya`, `user_alex`, `null` — `user_daniel/maya/alex` are valid keys in `mockUsersById`. ✅
- `mockTickets[*].mentionedUserIds` — `user_daniel`, `user_maya` — all valid. ✅
- One thing flagged: `mockTickets[0].creatorName = "Maya Chen"` (free text). The mock doesn't expose a `creatorId` field, just the denormalized name. The real `Feedback` type doesn't have `creatorId` either (only `creatorName` + `creatorAvatarUrl`), so this is correct. ✅

---

## Section 7: SEO scaffolding correctness

### 7.1 `app/sitemap.ts` ✅

- Returns `MetadataRoute.Sitemap` ([sitemap.ts:5](app/sitemap.ts#L5)). ✅
- Uses `process.env.NEXT_PUBLIC_BASE_URL ?? "https://annote.ai"`. ✅
- Lists only the homepage URL. ✅
- Doesn't list app/admin/auth URLs. ✅
- ⚠️ Single entry — Phase 2 will add `/pricing`, `/for/webflow-agencies`, etc. (explicitly noted as TODO in the file's comment). Fine for Phase 1.

### 7.2 `app/robots.ts` ✅ (with one small finding)

- Allows `/` ✅
- Disallows the expected list ✅:
  - `/api/`, `/admin/`, `/dashboard/`, `/settings/`, `/activity/`, `/shared/`, `/discussion/`, `/onboarding/`, `/invite/`, `/extension-auth/`, `/check-email/`, `/reset-password/`, `/auth/`, `/no-workspace/`, `/workspace-suspended/`, `/session/`
- ⚠️ **Extra entry:** `/folders/` ([robots.ts:21](app/robots.ts#L21)). No `app/folders/` route exists in the tree (Glob confirms only the routes listed above). Disallowing a non-existent path is harmless — crawlers ignore — but it's noise. Either delete the line OR add a comment that it's reserved for a future route.
- ⚠️ **Missing entries to consider:** `/login`, `/signup`, `/forgot-password`. These are *public* auth pages so they don't pose a security risk if crawled, but they have no SEO value and the audit spec lists them. Currently they'd be crawled because they're under `(auth)` which Next strips from the URL. Whether to disallow is an SEO judgment call — the summary notes "verify with SEO that this is the right call." Phase 2 decision.
- References `sitemap: \`${baseUrl}/sitemap.xml\`` correctly. ✅

### 7.3 `app/opengraph-image.tsx` ✅

- Exports `runtime = "edge"`, `alt`, `size`, `contentType`. ✅
- Default export returns `ImageResponse`. ✅
- Uses brand colors: `#FAF9F7` (cream surface), `#15101F` (heading), `#54495F` (body), `#8A8096` (tertiary), `#5A49BF` (brand). ✅ matches Section 5 design tokens.
- Imports only `next/og` — no Firebase, no auth context. ✅ safe at the edge.
- Renders Annote wordmark + headline + supporting copy + brand dot — reasonable. ✅
- ⚠️ Bare typography only (no logomark icon). Phase 2 could refine. Not a blocker.

### 7.4 Root metadata ✅

[app/layout.tsx:29-50](app/layout.tsx#L29-L50):

- `metadataBase: new URL(baseUrl)` ✅ (line 30)
- `title: { default, template: "%s · Annote" }` ✅
- `description` present, on brand ✅
- `openGraph` + `twitter` cards both populated ✅
- `viewport` exported separately ([layout.tsx:52-56](app/layout.tsx#L52-L56)) ✅

### 7.5 `NEXT_PUBLIC_BASE_URL` env var ✅

- [.env.example:1-3](.env.example#L1-L3) — documented as the public base URL for sitemap, robots, OG, and metadataBase. Default `https://annote.ai`. ✅
- Used consistently in `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`. ✅
- ⚠️ Stays commented out in `.env.example`, which means local dev defaults to `https://annote.ai` for the metadata base. That's actually fine because the metadataBase is only used for absolute URL construction in OG cards — local dev doesn't need a real base URL set. But a developer running on a non-default port who actually wants OG cards to point to localhost would need to uncomment and set this.

---

## Section 8: Demo wrapper readiness

### 8.1 `DemoBoundary` ✅

[app/(marketing)/_components/demos/DemoBoundary.tsx](app/(marketing)/_components/demos/DemoBoundary.tsx):

- Accepts `children`, `tooltip`, `disabled`, `className`. ✅
- Intercepts clicks (`onClick` with `preventDefault` + `stopPropagation`). ✅
- Allows hover states — no `pointer-events: none` in the default branch. ✅
- `disabled: true` strips events entirely with `pointerEvents: "none", userSelect: "none"`. ✅
- Tooltip shows transient "This is a demo — {tooltip}" with 1.8s timeout. ✅
- ⚠️ Tooltip uses `window.setTimeout` directly — fine since the component is `"use client"`, but doesn't clean up if the wrapper unmounts during the 1.8s window. Minor — won't crash, just a possible setState-after-unmount warning in dev. Phase 2 can wrap in `useEffect` cleanup if it becomes noisy.

### 8.2 `BrowserFrame` ✅

[app/(marketing)/_components/demos/BrowserFrame.tsx](app/(marketing)/_components/demos/BrowserFrame.tsx):

- Accepts `children`, `url`, `theme`, `className`. ✅
- Renders traffic-lights + URL bar chrome. ✅
- Default URL `loomly.com/pricing` matches the mock universe (Loomly is the client). ✅
- Uses design tokens for light mode (`--surface-card`, `--border`, `--surface-subtle`, etc.) and hex literals for dark mode (`#1A1A1A`, `#2A2A2A`). The dark-mode hex literals are OK because there's no real "overlay-dark-*" surface token in the design system aside from the text/border tokens it does reference. ✅
- Theme prop (`light` | `dark`) is implemented and tested in both branches. ✅

### 8.3 Phase 2 readiness ⚠️ (one gap)

- Both wrappers are ready for Phase 2 imports.
- **Gap:** Per the original Marketing audit Risk #2 (from the summary), Phase 2 demos that embed real product components should use `next/dynamic({ ssr: false })` + scroll-triggered lazy mounting to keep the homepage bundle small. **Neither `DemoBoundary` nor `BrowserFrame` enforces this** — they happily render their children eagerly. This is a Phase 2 concern; Phase 1 wrappers are intentionally simple. Note in Phase 2 prompt: dynamic-import the product components themselves before passing to `<DemoBoundary>`.

---

## Section 9: Build output and route configuration

I did NOT run `npm run build` (per the read-only constraint), so I can't observe the live route table. Per the summary section 5, the recent build produced:

```
ƒ /
○ /sitemap.xml
○ /robots.txt
ƒ /opengraph-image
```

### 9.1 Expected static-vs-dynamic classification (from code)

- `/` → must be `ƒ` dynamic — calls `cookies()` from `next/headers`, which forces dynamic rendering. ✅ matches summary.
- `/sitemap.xml` → `○` static — `sitemap()` is pure (uses `process.env`, `new Date()` only). ✅ Once the env var is read at build, the sitemap is bakeable. (Note: `lastModified: new Date()` will freeze to build time, but that's fine.)
- `/robots.txt` → `○` static — pure function, same reasoning. ✅
- `/opengraph-image` → `ƒ` dynamic with `export const runtime = "edge"` — Edge runtime opts out of static generation, generating on first request and caching at the edge. ✅ matches summary's "edge runtime disables static generation" warning.

### 9.2 Marketing route group placeholder ✅

There is no `app/(marketing)/page.tsx` — Glob confirms only `app/(marketing)/layout.tsx` exists. Per Next routing, a route-group layout without a sibling `page.tsx` produces no URL of its own (the group is invisible to routing for URL purposes). No conflict with `app/page.tsx`. ✅

### 9.3 No accidental static-bake of auth-gated routes

Routes that exist in `(app)/`, `admin/`, `onboarding/`, `(public)/`, `invite/`, `workspace-suspended/`: all are `"use client"` components with hooks reading runtime state. They render as `ƒ` dynamic. None of them is statically baked. ✅

---

## Section 10: Open questions & risks (consolidated)

| # | Severity | Description | Where | Recommendation |
|---|---|---|---|---|
| 1 | **Cosmetic** | Marketing chrome (Header/Footer) not rendered at `/` — smart root renders `MarketingHome` directly, bypassing `(marketing)/layout.tsx`. | [app/page.tsx:15](app/page.tsx#L15), [app/(marketing)/_components/MarketingHome.tsx](app/(marketing)/_components/MarketingHome.tsx) | Phase 2 fix. Compose `<MarketingHeader />` + `<MarketingFooter />` directly inside `MarketingHome`, OR move the home into `(marketing)/page.tsx` and have the smart root forward. Summary recommends option (a). |
| 2 | **Phase 2 fix** | `bg-surface-page` Tailwind class resolves to `#FFFFFF` while CSS `var(--surface-page)` is `#FAF9F7`. Latent trap when Phase 2 starts using Tailwind utility classes. | [tailwind.config.ts:22](tailwind.config.ts#L22) vs [styles/tokens.css:56](styles/tokens.css#L56) | Either change `tailwind.config.ts:22` from `"#FFFFFF"` to `"var(--surface-page)"` (single source of truth) OR document loudly in a Phase 2 prompt. Recommend the config fix. |
| 3 | **Phase 2 fix** | `Feedback.createdAt: null` consumer survey shows `ContextPanel.tsx:44` reads `latest.createdAt` without an obvious null check (not fully verified). | [components/layout/operating-system/ContextPanel.tsx:44](components/layout/operating-system/ContextPanel.tsx#L44) | When Phase 2 embeds the session detail tree in a demo, read this file in full and confirm null-tolerance. If it crashes, the mock either needs a real `Timestamp`-like shape or the consumer needs hardening. |
| 4 | **Cosmetic** | `robots.ts` disallows `/folders/` which is not a route in the app. | [app/robots.ts:21](app/robots.ts#L21) | Either remove the line or add a comment that it's reserved. Trivial. |
| 5 | **Cosmetic** | `robots.ts` doesn't disallow `/login`, `/signup`, `/forgot-password`. Per audit checklist these were "to verify with SEO." | [app/robots.ts](app/robots.ts) | Defer to SEO judgment. Auth pages have no indexing value but no harm. Phase 2 decide. |
| 6 | **Cosmetic** | `MarketingFooter` has `border-b transparent` on the header and `border-t` on the footer with no real separator color in many states. Visual choice — not a bug, just a flatness note for Phase 2 design. | [MarketingHeader.tsx:18-21](app/(marketing)/_components/MarketingHeader.tsx#L18-L21) | Phase 2 design will rebuild this anyway. |
| 7 | **Phase 2 fix** | Demo wrappers don't enforce `next/dynamic({ ssr: false })` for embedded product components. Per audit Risk #2, this matters for homepage bundle weight. | [app/(marketing)/_components/demos/DemoBoundary.tsx](app/(marketing)/_components/demos/DemoBoundary.tsx) | Phase 2 must dynamic-import the product components themselves before passing as `<DemoBoundary>` children. Wrapper itself doesn't need to enforce — just document the pattern. |
| 8 | **Heads-up** | `DemoBoundary` `setTimeout` for the tooltip doesn't clean up on unmount — possible dev-only setState-after-unmount warning. | [DemoBoundary.tsx:37](app/(marketing)/_components/demos/DemoBoundary.tsx#L37) | Optional Phase 2 polish. Convert tooltip to a `useEffect`-driven timer with cleanup, or accept the dev warning. Not a runtime crash. |
| 9 | **Heads-up** | `WorkspaceProvider` (loaded on `/session/[id]` for both anonymous and signed-in guests) initializes Firebase Auth SDK on every public-viewer pageview. Pre-existing — not a Phase 1 regression — but the marketing-page goal of *no Firebase init for logged-out visitors* doesn't extend to `/session/[id]`. | [app/(public)/layout.tsx](app/(public)/layout.tsx), [lib/client/workspaceContext.tsx:441](lib/client/workspaceContext.tsx#L441) | Accept for now. Long-term: a `WorkspaceProviderForGuests` that skips the auth listener until interaction would shave bundle off cold-start public-viewer loads. Not a Phase 2 concern. |
| 10 | **Heads-up** | `NEXT_PUBLIC_BASE_URL` is documented in `.env.example` but commented out by default. Local dev with a non-default port won't have correct OG card URLs unless set. | [.env.example:1-3](.env.example#L1-L3) | Acceptable — OG card preview is irrelevant in local dev. Set in production env. |

### Categories of issues to flag (per the audit spec)

- **Provider mount gaps:** None found. All 14 direct `useWorkspace()` consumers + all transitively-loaded component consumers are under a `RootProviders` ancestor. ✅
- **Type conformance failures:** None. All three real domain types (`Workspace`, `Session`, `Feedback`) are conformed correctly in mocks. ✅
- **Null timestamp crashes:** `FeedbackHeader` and `TicketItem` are safe. `FeedbackCommandPanel` and `SignalStream` are safe via `clientTimestamp` fallback (mocks include numeric `clientTimestamp`). `ContextPanel.tsx:44` is the one untested-here consumer — Phase 2 fix.
- **Auth/Firebase leaking into marketing:** None. All four marketing component files import only `next/link` or `react` or nothing. ✅
- **Tailwind token mismatches:** `bg-surface-page` Tailwind class is white; CSS var is cream. Latent trap, not a current bug. ⚠️
- **Smart root edge cases:** Cookie name match ✅, JWT verification function match ✅, try/catch coverage ✅ (internal to `verifySessionToken`), no flash of marketing for logged-in users ✅.
- **SEO file issues:** Sitemap lists only `/` (intentional for Phase 1). Robots has one stray `/folders/` entry and an open question about disallowing `/login`/`/signup`. OG image is sound.
- **Build configuration concerns:** None — route table matches expectations per summary.

---

## Top-line verdict: **Safe to commit**

Phase 1 is structurally sound. The restructure of `RootProviders` to six surfaces is complete and consistent — no provider gaps, no double mounts, no leaked Firebase imports into the marketing tree. The smart root is a clean server component with correct cookie + JWT integration. Mocks conform to real domain types. SEO scaffolding is in place and minimal.

The two real Phase 2 issues to track:

1. **Tailwind `bg-surface-page` vs CSS variable mismatch** ([tailwind.config.ts:22](tailwind.config.ts#L22)) — fix this at the config layer when Phase 2 starts so utility classes and CSS variables agree.
2. **`ContextPanel.tsx:44` null-`createdAt` tolerance** — verify before embedding the session detail tree in a demo.

Everything else is cosmetic or deliberate-for-Phase-1. No blockers for committing the current branch.
