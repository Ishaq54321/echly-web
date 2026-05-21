# Marketing Site Architecture Audit

**Scope.** Read-only architecture audit of the Annote codebase to inform a marketing site build that reuses real product components, lives on the same domain as the app, and follows the Loom/Linear/Slack pattern (logged-out → marketing, logged-in → dashboard). No files were modified.

**Headline finding.** The codebase is well-positioned for this. Auth is a signed JWT cookie verifiable in a server component without any Firebase Admin round-trip, the existing `app/page.tsx` already does exactly this kind of branch (redirect-style, not render-style), there is a working `(public)` route group precedent for unauthenticated pages, and the design tokens / fonts are wired at the root layout so any new route group inherits them for free. The real frictions are: SEO scaffolding is missing entirely, several "obvious" reuse candidates (`GlobalHeader`, `GlobalNavBar`, anything in `(app)/`) sit inside layout guards (`WorkspaceSuspendedGuard`, `WorkspaceIdentityGate`, `WorkspaceStoreProvider`, `BillingUsageCacheInitializer`) that would either crash or fire network calls when mounted on marketing, and the dashboard JS bundle is heavy enough that you do **not** want to ship it to logged-out visitors via a shared root.

---

## Section 1: Current Routing Architecture

### Top-level segments under `app/`

| Path / group | Renders | Layout | Auth required |
|---|---|---|---|
| [`app/page.tsx`](app/page.tsx) | Server component — reads `annote_session` cookie, redirects to `/dashboard` or `/login` | root only | n/a (redirector) |
| [`app/(app)/`](app/(app)/layout.tsx) | Authenticated app shell | `(app)/layout.tsx` with `WorkspaceSuspendedGuard` → `WorkspaceIdentityGate` → `WorkspaceStoreProvider` → mobile shell + rail + content card | Yes (middleware + layout gates) |
| `app/(app)/dashboard/page.tsx` | Sessions list | inherits `(app)` | Yes |
| `app/(app)/dashboard/[sessionId]/page.tsx` (+`overview/`) | Session detail (four-zone view) | inherits `(app)` | Yes |
| `app/(app)/activity/`, `settings/`, `discussion/`, `shared/`, `no-workspace/` | Named app surfaces | inherits `(app)` | Yes |
| [`app/(auth)/`](app/(auth)/layout.tsx) | Login/signup/forgot/reset/check-email/auth-action | `(auth)/layout.tsx` — own `./auth.css`, DM Sans + JetBrains Mono as CSS variables (not `className`) | No (public allowlist) |
| [`app/(public)/`](app/(public)/layout.tsx) | `session/[sessionId]` — public/guest viewer | `(public)/layout.tsx` — `"use client"`, `WorkspaceStoreProvider`, hard-coded white background, 100dvh, `GlobalSearch` | No (in public allowlist) |
| `app/admin/` | Admin console (customers, plans, usage) | `admin/layout.tsx` does its own auth (middleware passes admin through) | Yes (in-layout) |
| `app/onboarding/` | Multi-step new-user flow | `onboarding/layout.tsx` | Session required but onboarding-cookie gate skipped |
| `app/invite/[token]/`, `app/extension-auth/`, `app/unsubscribe/`, `app/workspace-suspended/`, `app/docs/` | Standalone single-purpose pages | root only | No (public allowlist or self-managed) |
| `app/api/**` | ~85 route handlers (sessions, feedback, comments, billing, workspace, auth, cron, admin, ai, internal). Each handler does its own auth via `requireAuth(request)`. | n/a | n/a |

### Root layout — what it sets up

[`app/layout.tsx`](app/layout.tsx) is **minimal but load-bearing**:

```tsx
const dmSans = DM_Sans({ subsets: ["latin"], display: "swap" });
// ...
<body className={`${dmSans.className} font-sans antialiased h-full overflow-y-auto`}>
  <ToastProvider>
    <RootProviders>
      <div className="env-canvas h-full flex flex-col">{children}</div>
    </RootProviders>
  </ToastProvider>
  <Toaster ... />
</body>
```

- DM Sans via `next/font/google` is **applied at the root**, so every route group inherits it.
- Imports `./globals.css` (Tailwind + design tokens).
- Wraps everything in `ToastProvider` and `RootProviders` (which contains `AppBootGate` + `WorkspaceProvider`-style boot logic per the auto-memory note `[[activity_events_realtime]]` and verified by import).
- Sets generic `metadata: { title: "Annote", description: "Structured AI-powered feedback workspace" }`.
- Preconnects to `firebasestorage.googleapis.com`.

**Implication for marketing.** A new `(marketing)` route group would inherit DM Sans, tokens, `env-canvas`, and `RootProviders` for free. The `env-canvas` wrapper is fine (it sets up the atmospheric gradient surface). `RootProviders` boot logic running on a logged-out marketing visit is the first thing to validate — see Risks (§9).

### Route groups (parens)

Three exist today: `(app)`, `(auth)`, `(public)`. No `(marketing)` group yet. The pattern is established and consistent: each group has its own `layout.tsx`, and the root layout supplies the global shell.

---

## Section 2: Authentication & Redirect Logic

### Auth library

**Hybrid.** Firebase Auth on the client (`onAuthStateChanged`, `signInWithEmailAndPassword`, `signInWithPopup`), **plus a custom JOSE-signed JWT session cookie** for server-side gating. On successful Firebase sign-in, the client POSTs the Firebase ID token to `/api/auth/session`, which mints an HS256 JWT (`SessionPayload = { uid, email, name }`) and sets it as `annote_session` cookie (7-day max-age). All subsequent server-side auth decisions read **this cookie**, not Firebase.

This is the critical detail for the marketing site: **server-side auth detection does NOT require Firebase Admin** — it's a local JWT verify against `process.env.SESSION_SECRET`, which is fast and works in middleware.

### Where the "logged in?" check happens

Three places:

1. **`middleware.ts`** — gates protected routes ([`middleware.ts:81-87`](middleware.ts#L81-L87)).
2. **`app/page.tsx`** ([source](app/page.tsx)) — uses `cookies()` + `verifySessionToken()` in a server component to redirect.
3. **API route handlers** — each calls `requireAuth(request)` (handles both `annote_session` cookie and `Authorization: Bearer <firebase-id-token>` for the extension).

There is **no client-only auth hook** as the source of truth; client code consumes the Firebase listener and the `WorkspaceProvider` context, but the gates are server-side.

### `middleware.ts` in detail

Read [`middleware.ts`](middleware.ts) — it's clean and explicit. Order matters:

1. `/dashboard/[id]` → `/session/[id]` legacy redirect.
2. `/admin/**` passes through (admin layout enforces).
3. `/api/**` gets CORS headers, three streaming endpoints skip CORS entirely, handlers auth themselves.
4. Public allowlist (`isPublicPath`): `/`, `/login`, `/signup`, `/forgot-password`, `/check-email`, `/reset-password`, `/auth/action`, `/onboarding`, `/invite/`, `/extension-auth`, `/session/`, `/_next/`, `/favicon`, `/manifest`, `/robots`.
5. Session JWT verification.
6. **Email-verified cookie** with `uid` match (defends against cookie leak across users).
7. **Onboarded cookie** with `uid` match → otherwise to `/onboarding`.

The `config.matcher` is **explicit-positive**: only `/api/*`, `/admin*`, `/dashboard*`, `/settings*`, `/activity*`, `/shared*`, `/discussion*`, `/folders*`, `/no-workspace`. **Critically, `/` is not in the matcher** — middleware does not run on the root URL today. The redirect on `/` happens entirely inside `app/page.tsx`.

### What happens for the cases you asked about

- **Unauthenticated user hits `/session/xyz`** → middleware allows (public allowlist), `(public)/session/[sessionId]/page.tsx` handles guest vs. authed rendering itself based on the session's `generalAccess` config. So you have a **working precedent for a public surface that reuses real product UI**.
- **Authenticated user hits `/`** → server component reads cookie, JWT verifies, `redirect("/dashboard")` runs before any UI streams. No flash.
- **Unauthenticated user hits a gated route like `/settings`** → middleware step 5 redirects to `/login?returnUrl=/settings`. Sign-in preserves `returnUrl`.
- **Sign-in landing** → login page uses `returnUrl` if present, otherwise `/dashboard`.

### Can `app/page.tsx` decide marketing vs. dashboard?

Yes — and that is the question the answer in §7 hinges on. The JWT verify is local and fast; doing it on every cold visit to `/` is fine.

---

## Section 3: Component Reusability Survey

Verdicts: **CLEAN** (drop in with mock props), **LIGHT SURGERY** (add a `demoData` / `demoBilling` prop or wrap in a provider), **HEAVY** (rebuild for marketing).

### 1. Ticket card / FeedbackHeader, TicketDetailView / FeedbackDetail

- **Path:** `components/session/feedbackDetail/FeedbackDetail.tsx` (+ `FeedbackHeader.tsx`, `FeedbackContent.tsx`).
- **Props:** `{ sessionId, selectedItem, onSaveTitle?, onRequestDelete?, onSaveDescription?, onSaveTags?, onResolvedChange?, setIsImageExpanded, onEdit?, canEdit?, isCommentsOpen, onToggleActivity }`.
- **Data:** Props-driven. Screenshot URL resolved lazily via a `useScreenshotUrl()` hook that hits Firebase Storage — **this is the one wrinkle for marketing**: pass `selectedItem.screenshotId = null` and supply a regular `<img>` background, OR stub the hook by passing a fully resolved URL through an alternate prop path.
- **Context:** None required.
- **Verdict:** **CLEAN.** All mutation callbacks are optional / can be no-ops.

### 2. Session list item (one row in dashboard)

- **Path:** `components/layout/operating-system/TicketList.tsx` and `TicketItem.tsx` (per Explore agent — verify exact filename when building; the dashboard list may also be named `SessionListItem` under `components/dashboard/`).
- **Props:** `{ ticket | session, isSelected, onSelect }`.
- **Data:** Props-driven.
- **Verdict:** **CLEAN.**

### 3. Session detail layout (multi-zone)

- **Path:** `components/layout/operating-system/FourZoneLayout.tsx` (+ `ExecutionCanvas.tsx`).
- **Props:** `{ navigationRail?, commandPanel?, children, contextColumn?, showCommandPanel?, showContextColumn? }`.
- **Data / context:** None — pure layout primitive.
- **Verdict:** **CLEAN.** Ideal scaffold for a "see the product" hero demo.

### 4. Voice recording capsule (image 3 — light pill: trash, dot, timer, waveform, send)

- **Path:** likely under `components/CaptureWidget/` — confirm with grep before wiring. Candidates: `RecordingMicOrb.tsx`, `KeepRecordingPill.tsx`. The "capsule" with waveform+send is probably a separate component such as `VoiceCaptureCard` or `RecordingPill`.
- **Props:** typically `{ isRecording, audioLevel | levels[], duration, onCancel, onSend }`.
- **Data:** Pure indicator components have no internal data; the parent owns recording state.
- **Verdict:** **CLEAN** for the visual pill; **LIGHT SURGERY** if the waveform reads from a `MediaStream` — in marketing you'd feed it a precomputed `levels[]` array.

### 5. Session control bar pill (image 8 — dark glass: live dot, status, Pause, End)

- **Path:** likely `components/ui/TopControlBar.tsx` or similar in `components/CaptureWidget/`. Confirm at build time.
- **Verdict:** **CLEAN** if it's prop-driven (status string + onPause/onEnd handlers); **LIGHT SURGERY** if it subscribes to a recording session store.

### 6. Tag / Badge / UserAvatar primitives

- **Paths:** `components/ui/Badge.tsx`, `components/ui/Tag.tsx`, `components/ui/UserAvatar.tsx`, `components/ui/Card.tsx`.
- **Props:** standard display primitives. `UserAvatar` accepts `{ avatarUrl?, image?, photoURL?, name?, size?, colorSeed?, ... }` — generates initials when no URL.
- **Verdict:** **CLEAN.** Drop in anywhere.

### 7. Top bar (dashboard nav: logo, search, share, notifications, avatar)

- **Path:** `components/layout/GlobalHeader.tsx`.
- **Data dependencies:** **fires `authFetch("/api/workspace/member-count")` on mount**, reads from a `billingStore` (Zustand-style — see auto-memory `[[billing_client_data_sources]]`), subscribes to a notifications listener.
- **Context:** `useBillingStore()`, notification subscription utilities.
- **Verdict:** **HEAVY.** Do not reuse on marketing. Either build a stripped marketing variant (logo + sign-in / get-started CTA) or refactor to accept a `demoData={{...}}` prop that short-circuits the fetches. Recommendation: build a separate `MarketingHeader` — the visual styling is easy to copy, and the data dependencies aren't worth detangling.

### 8. Global rail (left sidebar)

- **Path:** rendered via `components/layout/AppMobileShell.tsx` (slot="rail") → `GlobalRailContent`.
- **Data dependencies:** workspace context, pathname routing, share-link generation, member listings.
- **Verdict:** **HEAVY.** Same advice as #7 — copy the visual, don't reuse the component on marketing.

### 9. Element selection overlay (brand-purple selection rectangle)

- **Path:** under `annote-extension/` (the browser extension), not `components/`. The marketing site will need a **visual mock** of this — there's no clean React component to import. Build it fresh as a styled `<div>` overlaid on a screenshot.
- **Verdict:** **HEAVY** (effectively: build new).

### 10. Mic orb (red-orange recording orb with breathing animation)

- **Path:** `components/CaptureWidget/RecordingMicOrb.tsx`.
- **Props:** `{ isRecording, isProcessing, audioLevel }`.
- **Verdict:** **CLEAN.** Feed it static-ish prop values (or a small `setInterval` to animate `audioLevel`).

### 11. Confirmation card (dark glass "I understood..." card after recording)

- **Path:** to confirm — likely `components/CaptureWidget/` or `components/voice/`. Grep `"I understood"` or look for `KeepRecordingPill` siblings.
- **Verdict:** likely **CLEAN** (display-only) — confirm props at build time.

### 12. Extension popup states (images 4, 5, 6: capture mode, idle, previous sessions)

- **Path:** these live in [`annote-extension/`](annote-extension/), which is a separate build target (esbuild, not Next.js) per auto-memory `[[extension_build_outputs]]` and `[[extension_esbuild_jsx_automatic]]`.
- **Verdict:** **HEAVY.** Source components could in principle be imported into Next, but build/bundle setup is different. Recommendation: rebuild the popup as a marketing-only `<ExtensionPopupMock>` component using the same design tokens. It's straightforward visual work.

### 13. Activity feed / comments

- **Path:** `components/activity/`, `components/comments/`.
- **Data:** Per auto-memory `[[activity_events_realtime]]`, these use Firestore Timestamp storage with `useSyncExternalStore` and realtime subcollection listeners. They WILL try to subscribe on mount.
- **Verdict:** **HEAVY** for the live components. For marketing, build static visual mocks — comments and activity rows are simple list items.

---

## Section 4: Data Fetching & Mocking Strategy

### Pattern

- **Heavy client-side architecture.** ~196 `"use client"` components under `components/`; only the root page, auth routes, and a couple of utility pages are server components.
- **No React Query, no tRPC.** Data is fetched via a custom `authFetch()` wrapper ([`lib/authFetch.ts`](lib/authFetch.ts)) that injects the Firebase ID token / session cookie. Components either fetch in `useEffect` or consume from Zustand-style stores (`workspaceStore`, `billingStore`).
- **Realtime via Firestore listeners** in `lib/realtime/` and `lib/repositories/*.client.ts` — used through context providers for live updates (sessions, activity feed, etc.).
- **REST API envelope:** `{ success: boolean, data: T, error?: { code, message } }`.

### Representative session fetch

The session detail page mounts, calls `GET /api/sessions/[sessionId]`, hydrates into `workspaceStore`, then subscribes to a Firestore listener for live updates. So even "prop-driven" components like `FeedbackDetail` typically receive data from a store that was filled by an `authFetch` call.

### Mocking on marketing

Three options, in increasing order of invasiveness:

1. **Wrap reusable components in a marketing-only parent that supplies mock props directly** (no store touch). Best for `FeedbackDetail`, `FourZoneLayout`, primitives. The agent's verdict above marks these CLEAN precisely because they're prop-driven.
2. **Mount a `<WorkspaceStoreProvider>` with prefilled mock state** for components that read from `useWorkspaceStore()`. Workable but couples marketing to internal store shape.
3. **Add a `demoMode` prop** to fetch-y components (`GlobalHeader`, comment threads) that short-circuits network calls. **Avoid** — it pollutes production components with marketing-specific branches. Build marketing variants instead.

Recommended: option 1 only. For anything in option 3 territory, build a fresh marketing component using the same design tokens.

### Type shapes for mock data

The Explore agent surfaced these (paraphrased — read [`lib/domain/session.ts`](lib/domain/), [`lib/domain/feedback.ts`](lib/domain/), [`lib/domain/workspace.ts`](lib/domain/) for exact fields):

- **`Session`**: `{ id, workspaceId, title, archived, createdAt, viewCount, recentViewers[], commentCount, openCount, resolvedCount, totalCount, accessLevel, generalAccess, createdByUserId, creatorName, ... }`
- **`Feedback` (= "ticket")**: `{ id, sessionId, title, type, isResolved, createdAt, commentCount, description, tags[], pageArea, url, viewport*, screenshotId, screenshotStatus, status, assignee*, priority, creator*, mentionedUserIds[] }`
- **`Workspace`**: `{ id, name, slug, logoUrl, ownerId, appearance, notifications, billing: { plan, ... }, entitlements, usage, ... }`

**`createdAt` etc. are Firestore `Timestamp | Date | string | null`** unions — marketing mocks should use plain `Date` and the existing date utilities should handle them.

---

## Section 5: Layout & Style Architecture

### Globals load at the root

[`app/layout.tsx:3`](app/layout.tsx#L3) imports `./globals.css`, which in turn pulls in Tailwind plus the design tokens. **Every route group inherits the design system** — marketing pages don't need to re-import.

### Token / font notes

- DM Sans is loaded via `next/font/google` at the root layout and applied as `className` on `<body>`. A new `(marketing)/layout.tsx` does **not** need to re-declare it.
- `(auth)/layout.tsx` re-loads DM Sans + JetBrains Mono as **CSS variables** (`--font-dm-sans`, `--font-jetbrains-mono`) — this is for the auth-specific stylesheet, not a pattern to copy.
- Design tokens live in [`styles/tokens.css`](styles/) (per agent + auto-memory `[[design_tokens_real_names]]`): `--text-body`, `--text-heading`, `--text-tertiary`, `--surface-page`, `--surface-card`, `--surface-subtle`, `--brand`, `--brand-hover`, `--brand-subtle`, `--border`, `--border-strong`, semantic colors, glass vars, env gradient vars. **Use these names — do not invent `--color-background-*` or `--color-text-primary`; they don't exist** (this is exactly the trap auto-memory warns about).
- Tailwind config ([`tailwind.config.ts`](tailwind.config.ts)) exposes these as `bg-surface-card`, `text-text-heading`, `border-border`, etc., plus a custom `display` font size and `pill` / `card` border-radius tokens.

### Layout assumptions that would bite

- The `env-canvas` wrapper from the root layout sets up an atmospheric gradient background. Marketing pages will inherit it — fine, or override per-page.
- Anything reused from `(app)/` assumes it's mounted **inside** `WorkspaceSuspendedGuard` → `WorkspaceIdentityGate` → `WorkspaceStoreProvider`. Mounting those on marketing pages will run real workspace boot logic (Firestore listener attaching) for a logged-out visitor. **Do not put marketing under `(app)`.**
- `(public)/layout.tsx` is `"use client"` and hard-codes `background: "#FFFFFF"` with `100dvh` and `overflow: hidden` — a useful reference for a "no chrome" surface, but **not** a marketing layout. Build your own.

---

## Section 6: SEO, Metadata, and Marketing-Specific Needs

**State:** essentially nothing in place.

- ❌ No `app/sitemap.ts`.
- ❌ No `app/robots.ts`.
- ❌ No `app/opengraph-image.tsx`.
- ✅ Root `metadata` exists but is generic (`"Annote"` / `"Structured AI-powered feedback workspace"`).
- ✅ `viewport` is set.
- `next/font` is set up for DM Sans at root and DM Sans + JetBrains Mono in `(auth)`.

**Build implications for marketing.** All SEO scaffolding is greenfield — that's actually good (no legacy to fight). You'll need:

- `app/sitemap.ts` enumerating marketing routes (homepage, pricing, per-vertical landing pages, blog index, doc index).
- `app/robots.ts` allowing marketing surfaces, disallowing `/api/`, `/admin/`, `/(app)/`, `/onboarding`, `/invite/`, `/extension-auth`, `/session/` (or selectively allow guest sessions — they have unique URLs and are not really crawl targets).
- Per-page `export const metadata` in each marketing route with proper OG / Twitter cards.
- `app/opengraph-image.tsx` for the default share image.

---

## Section 7: The "Smart Root" Pattern — Recommendation

Three options for the homepage decision, evaluated against this codebase:

### Option A — `app/page.tsx` conditionally renders `<MarketingHome>` or redirects to `/dashboard`

Replace the current 9-line redirect with:

```ts
const session = token ? await verifySessionToken(token) : null;
if (session) redirect("/dashboard");
return <MarketingHome />;
```

**Pros:** zero churn for existing app routes. Server-side decision means no logged-in-user flash. JWT verify is local — no perf cost. Matches what's already there.

**Cons:** marketing components live under `app/(marketing)/_components/` or similar and are imported by `app/page.tsx`. Slightly awkward — the homepage isn't inside the `(marketing)` group, so other marketing routes (`/pricing`, `/for/webflow-agencies`) live in `(marketing)/` but the home lives outside it. You can solve this by making the marketing layout's chrome (`<MarketingHeader>`, `<MarketingFooter>`) self-contained components that `app/page.tsx` composes directly.

### Option B — Move dashboard to `/dashboard`, make `/` always marketing

Already done — dashboard already lives at `/dashboard`. This option is really: "delete the auth check in `app/page.tsx` and just render marketing at `/`."

**Pros:** simplest structure. `(marketing)` group owns `/` cleanly via `(marketing)/page.tsx`.

**Cons:** **logged-in users land on marketing.** Loom/Linear/Slack explicitly avoid this — it's a worse UX for retention. Either accept the regression or add the redirect back, in which case you're back to Option A.

### Option C — Middleware redirects logged-in users from `/` to `/dashboard`

**Pros:** keeps `app/page.tsx` (or `app/(marketing)/page.tsx`) purely about rendering marketing.

**Cons:** `/` is not in the current matcher, and adding it means middleware runs on every marketing visit — minor cost. More importantly, this duplicates auth-decision logic across middleware and server pages, and the marketing renderer still has to handle the case where it's mounted under a logged-in cookie (it won't, because middleware redirected, but the component shouldn't have to assume anything). Equivalent outcome to A with more moving parts.

### Recommendation: **Option A**

Keep `app/page.tsx` as the decision point. It already does this exact pattern; we're just replacing one branch's `redirect("/login")` with `return <MarketingHome />`. No middleware change. No matcher change. The `(marketing)` group still gets to own `/pricing`, `/for/*`, `/blog`, etc.

If you want the cleanest mental model: put marketing components under `app/(marketing)/_components/` (the underscore makes Next.js ignore it as a route) so `app/page.tsx` can import them.

---

## Section 8: What Would Need to Change

### Create

| File | Why |
|---|---|
| `app/(marketing)/layout.tsx` | Marketing chrome (header, footer) — separate from app and auth. |
| `app/(marketing)/page.tsx` | If using a route-group home; otherwise skip and let `app/page.tsx` render directly. (Recommendation: skip — see §7.) |
| `app/(marketing)/pricing/page.tsx` | Pricing. |
| `app/(marketing)/for/[vertical]/page.tsx` | Per-vertical landing pages (`/for/webflow-agencies`, `/for/framer-agencies`, …). |
| `app/(marketing)/_components/MarketingHeader.tsx` | Marketing-specific top nav (logo + Sign in + Get started). Visual styling cribbed from `GlobalHeader` but no data deps. |
| `app/(marketing)/_components/MarketingFooter.tsx` | Footer. |
| `app/(marketing)/_components/demos/` | Demo containers that wrap real components (`FeedbackDetail`, `FourZoneLayout`, `RecordingMicOrb`, primitives) with mock props. |
| `app/(marketing)/_mock/` | Mock `Session`, `Feedback`, `Workspace`, `User` fixtures conforming to `lib/domain/*` types. |
| `app/sitemap.ts` | Enumerate marketing URLs. |
| `app/robots.ts` | Allow marketing, disallow `/api`, `/admin`, `/onboarding`, `/(app)` segments. |
| `app/opengraph-image.tsx` | Default OG image. |
| Per-page `metadata` exports in every marketing route | OG, Twitter, descriptions. |

### Modify

| File | Change | Why |
|---|---|---|
| [`app/page.tsx`](app/page.tsx) | Replace `redirect(session ? "/dashboard" : "/login")` with `if (session) redirect("/dashboard"); return <MarketingHome />;` | Smart root per §7. |
| [`app/layout.tsx`](app/layout.tsx) | Update `metadata` if you want a better default `title.template`; otherwise leave alone. | Better marketing defaults. |
| [`middleware.ts`](middleware.ts) | Add `/pricing`, `/for/`, any new marketing prefixes to `PASS_THROUGH_PREFIXES` **only if** they're inside `config.matcher`. Currently they wouldn't be — but if you ever broaden the matcher, you need to remember to allowlist marketing. | Defensive. |

### Do not touch

- Anything under `app/(app)/` — these are gated app surfaces.
- Anything under `app/(auth)/` — own layout, own CSS.
- Anything under `app/(public)/` — guest session viewer, working precedent for unauthenticated surfaces. Leave it alone but study `(public)/session/[sessionId]/page.tsx` for the "reuse `SessionPageClient` with auth-aware rendering" pattern — that's a viable template for marketing demos that need to reuse real session UI.
- `app/api/**` — handlers self-auth.
- `components/layout/GlobalHeader.tsx`, `components/layout/GlobalNavBar.tsx`, `components/layout/AppMobileShell.tsx` — too entangled, build marketing variants.
- `components/CaptureWidget/` runtime components — these are mostly clean for reuse, but don't add `demoMode` props. Wrap them.
- `lib/server/session.ts`, `lib/server/auth.ts` — auth core, untouched.

---

## Section 9: Risks & Open Questions

The things I'd want explicit instruction on before writing the build prompt:

### 1. `RootProviders` on logged-out visits

`app/layout.tsx` wraps **all** children in `RootProviders`, which (per the imports) includes `AppBootGate` and a `WorkspaceProvider`-like context. **What happens when this mounts for a logged-out marketing visitor?** Best case: it no-ops cleanly because there's no Firebase auth user. Worst case: it tries to subscribe to a Firestore document or hits an API and throws / logs noisily. **Action required:** before merging marketing, verify `RootProviders` is safe to mount with no auth user, OR move the marketing route group above it (use a route-group-specific layout that bypasses providers, which means restructuring `app/layout.tsx` to be even more minimal and pushing providers down into `(app)/layout.tsx`). The latter is the cleaner long-term fix.

### 2. JS bundle weight on the homepage

If `app/page.tsx` imports any real product component (even with mock data), Next.js will ship the transitive client-component graph for that import to logged-out homepage visitors. The session detail / dashboard subtree is **large**. Recommendations:

- For marketing demo embeds, **dynamic-import** the product components with `next/dynamic({ ssr: false })` and lazy-load them when the demo section scrolls into view (`IntersectionObserver`). This keeps the initial homepage payload tight.
- Audit the demo section bundle with `next build` once a prototype exists. Set a budget (e.g. ≤200KB compressed for the homepage above-the-fold) and enforce it.

### 3. Screenshot URLs in `FeedbackDetail`

The `useScreenshotUrl()` hook hits Firebase Storage. On marketing, **firebase-storage URLs require auth tokens for non-public objects**. Two paths:

- Host marketing demo screenshots as static assets in `public/marketing/screenshots/` and feed `FeedbackDetail` a pre-resolved URL via whatever escape hatch the hook supports (`item.screenshotUrl` direct field, or by setting `screenshotStatus = "none"` and rendering the image yourself in a wrapper).
- Make a small public Storage bucket for marketing screenshots. More work, less clean.

Recommend the static-asset path. **Need to verify whether `FeedbackDetail` exposes a way to bypass the hook** — read the source before writing the build prompt.

### 4. `(public)/session/[sessionId]` as a precedent vs. a trap

It's tempting to mount marketing demos via the public session route with a "demo" session ID. **Don't.** That route does real Firestore reads to resolve the session; it's a guest viewer for real sessions, not a mock harness. Marketing demos should mount components directly with mock props.

### 5. Firebase env vars on marketing-only routes

Firebase client SDK initializes at module load. If marketing pages import anything that pulls in `lib/firebase`, the Firebase SDK initializes on the marketing visitor's browser even though they never authenticate. **Action:** keep marketing components free of any `lib/firebase` import. Audit the import graph before shipping.

### 6. Cookie behavior across subdomains

You mentioned `annote.ai` for both marketing and app. The session cookie is currently scoped to whatever domain `/api/auth/session` sets it on. If you ever split to `app.annote.ai` vs. `www.annote.ai`, the cookie needs `Domain=.annote.ai` for the smart-root redirect on the marketing host to see it. **Today:** unified host, no issue. **Tomorrow:** if you split, this needs a config change in the cookie set logic in `/api/auth/session`.

### 7. Email verification & onboarding gates

Middleware steps 6 and 7 redirect authenticated-but-unverified or authenticated-but-not-onboarded users into `/check-email` / `/onboarding`. These gates run **before** any app route renders, but **not** on `/`. So if you put `redirect("/dashboard")` in `app/page.tsx` for any authenticated user, an unverified user will:

1. Hit `/`.
2. Get redirected to `/dashboard` by your page component.
3. Hit middleware, fail step 6, get redirected to `/check-email`.

That's two redirects when one would do. Mild — not a blocker — but if you want it cleaner, mirror the gate logic in `app/page.tsx`:

```ts
if (session && /* verified */ && /* onboarded */) redirect("/dashboard");
if (session) redirect("/check-email"); // or /onboarding
return <MarketingHome />;
```

Either replicate the verify+onboard cookie checks in the root page, or accept the double-redirect. **Need a decision before writing the build prompt.**

### 8. The "Three similar lines" rule vs. demo wrappers

CLAUDE.md style preference is "three similar lines is better than a premature abstraction." If you build five marketing demos that all wrap `FeedbackDetail` slightly differently, **don't immediately extract a `<DemoFrame>` component.** Let the duplication sit until the third or fourth demo proves the shape.

### 9. Component path verification

The Explore agent reported several paths I couldn't fully verify in this audit (`TicketList.tsx` in `components/layout/operating-system/`, `TopControlBar.tsx`, the exact "confirmation card" location). **Before writing the build prompt, do a quick Glob pass on each of:**

- `components/**/Ticket*.tsx`
- `components/**/SessionList*.tsx`
- `components/**/TopControlBar*.tsx`
- `components/CaptureWidget/**/*.tsx`

…and lock in real paths. The agent's verdicts on data-shape vs. data-fetch are reliable; the path strings are less so.

### 10. Tailwind class names for design tokens

Auto-memory `[[design_tokens_real_names]]` is firm: actual token names do NOT include `--color-background-*` or `--color-text-primary`. Marketing pages must use the real token names (`text-text-heading`, `bg-surface-card`, `border-border`, `bg-brand`, etc.). The build prompt should either inline the token reference or explicitly point the implementer at `styles/tokens.css` and `tailwind.config.ts`.

---

## Summary for the build prompt

**Easy wins:**

- Auth pattern is ideal — JWT cookie verifiable in a server component, no Firebase Admin needed.
- Design system, fonts, and `env-canvas` inherited from root layout for free.
- `(public)` group is a working precedent for unauthenticated routes.
- Most "leaf" components (`FeedbackDetail`, `FourZoneLayout`, `Badge`, `UserAvatar`, `RecordingMicOrb`) are prop-driven and clean to reuse with mock data.

**Things to handle deliberately:**

- Build marketing variants of `GlobalHeader`, `GlobalNavBar`, extension popup — don't reuse.
- Dynamic-import any reused product components into marketing pages to keep the homepage bundle lean.
- Confirm `RootProviders` is safe to mount for logged-out visitors (or restructure layouts to push providers down).
- Build out SEO scaffolding from scratch (`sitemap.ts`, `robots.ts`, OG images, per-page metadata).
- Decide whether the smart-root replicates the verify/onboarded gate logic or accepts a double-redirect for those users.
- Keep marketing components free of any `lib/firebase` import.
- Host demo screenshots in `public/` and feed pre-resolved URLs to bypass `useScreenshotUrl()`.

**Recommended structure:**

```
app/
  page.tsx                     # smart root — redirects authed, renders MarketingHome
  layout.tsx                   # unchanged (or restructured to defer providers)
  sitemap.ts                   # new
  robots.ts                    # new
  opengraph-image.tsx          # new
  (marketing)/
    layout.tsx                 # marketing chrome
    pricing/page.tsx
    for/[vertical]/page.tsx
    _components/
      MarketingHeader.tsx
      MarketingFooter.tsx
      demos/
        FeedbackDetailDemo.tsx
        CaptureFlowDemo.tsx
        SessionListDemo.tsx
    _mock/
      sessions.ts
      feedback.ts
      workspaces.ts
      users.ts
  (app)/ (auth)/ (public)/     # unchanged
```

That's the audit. The codebase will absorb this build cleanly if the items in §9 are decided up front.
