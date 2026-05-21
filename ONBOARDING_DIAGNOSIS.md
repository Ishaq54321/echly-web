# Onboarding Loop Bug — Read-Only Diagnosis

**Date:** 2026-05-21
**Scope:** Why does an existing user, after Phase 1, land on the last screen of `/onboarding` when they hit `/dashboard`, and why does the final completion call return `workspaceName is required`?

**Important factual correction up front:** Phase 1 is **already committed**, not uncommitted. It shipped as part of commit `e087afb` (`78.2 Fixes in mobile`) at HEAD on `main`. The working tree is clean. There is nothing to revert and nothing to "commit cleanly"; we are diagnosing a regression that is already live on the branch.

---

## Section 1 — User's mental model, top down

### 1.1 Middleware decision tree for `/dashboard`

[middleware.ts](middleware.ts) is the entry point. For `/dashboard` it runs:

1. **Line 40-45 — STEP 1:** `/dashboard/[id]` → `/session/[id]`. Doesn't fire for bare `/dashboard`.
2. **Line 48-50 — STEP 2:** `/admin` pass-through. Doesn't fire.
3. **Line 53-73 — STEP 3:** `/api/*` handling. Doesn't fire.
4. **Line 76-78 — STEP 4:** Public allowlist (`/login`, `/signup`, `/onboarding`, `/session/`, `/invite/`, etc.). `/dashboard` is **not** in `PASS_THROUGH_PREFIXES`, so this falls through.
5. **Line 80-87 — STEP 5:** Auth gate. Reads `annote_session` cookie via [`verifySessionToken`](lib/server/session.ts). If missing → redirect to `/login?returnUrl=/dashboard`. For our user the cookie is present (they're signed in), so this passes.
6. **Line 89-99 — STEP 6:** Email-verified gate. Reads `email_verified_*` cookie via [`verifyEmailVerifiedToken`](lib/server/emailVerifiedCookie.ts) and asserts `payload.uid === session.uid`. If missing → redirect to `/check-email`. For our user this passes (they were using the app before).
7. **Line 101-108 — STEP 7:** Onboarded gate. Reads `onboarded` cookie via [`verifyOnboardedToken`](lib/server/onboardingCookie.ts:32) and asserts `payload.uid === session.uid`. **If missing → redirect to `/onboarding`.** This is the redirect the user is seeing.
8. **Line 110:** If all gates pass, `NextResponse.next()` and the dashboard renders.

For the user to be redirected to `/onboarding`, **the `onboarded` cookie must be missing or invalid (uid mismatch / expired / signed with a different secret)**. Steps 5 and 6 passed; only step 7 fired.

### 1.2 What renders at `/dashboard` if middleware passes

[app/(app)/layout.tsx](app/(app)/layout.tsx) wraps the tree as (after Phase 1):

```
<RootProviders>                  ← NEW: was at app/layout.tsx pre-Phase-1
  <WorkspaceSuspendedGuard>
    <WorkspaceIdentityGate>      ← THIS IS THE CULPRIT (see §5)
      <WorkspaceStoreProvider>
        ...
        <ErrorBoundary>{children}</ErrorBoundary>  ← dashboard page mounts here
```

[`WorkspaceIdentityGate`](components/workspace/WorkspaceIdentityGate.tsx:18-22):

```tsx
useEffect(() => {
  if (needsOnboarding) {
    router.replace("/onboarding");
  }
}, [needsOnboarding, router]);
```

**Critical**: this gate fires a client-side `router.replace("/onboarding")` whenever `needsOnboarding` flips to `true`. This is independent of the server-side middleware redirect — it's a parallel redirect path that runs after the page has already loaded into the client.

### 1.3 What renders at `/onboarding`

[app/onboarding/layout.tsx](app/onboarding/layout.tsx) (post-Phase-1):

```tsx
<RootProviders>                  ← NEW: previously inherited from root layout
  <div className="ob-host">{children}</div>
</RootProviders>
```

[app/onboarding/page.tsx](app/onboarding/page.tsx) is a client component. Key reads (line 26-38):

```tsx
const {
  authUid, authReady, authEmail,
  isIdentityReady, isLoadingWorkspaces,
  allWorkspaces,
  firstName: ctxFirstName,
  lastName: ctxLastName,
  avatarUrl,
  workspaceName: ctxWorkspaceName,
  workspaceLogoUrl: ctxWorkspaceLogoUrl,
} = useWorkspace();
```

Step determination ([page.tsx:78-122](app/onboarding/page.tsx#L78-L122)):
- `steps` is computed from `isInviteUser` (uses `allWorkspaces`).
- `stepIndex` starts at 0.
- After identity is ready, GETs `/api/users` and reads `body.data.onboardingStep`. If `saved >= 2`, jumps to `Math.min(saved - 1, steps.length - 1)`.

Render gate ([page.tsx:142-148](app/onboarding/page.tsx#L142-L148)):

```tsx
if (!ready || !authUid) {
  return <div className="ob-spinner" />;
}
```

where `ready = isIdentityReady && !isLoadingWorkspaces`. So the page **does** wait for hydration before rendering steps — the empty-workspaceName-on-mount race that the prompt suspected is real, but it's not what causes the API failure. The page does eventually wait.

---

## Section 2 — The "onboarded" cookie

### 2.1 Cookie definition

[lib/server/onboardingCookie.ts](lib/server/onboardingCookie.ts):

- **Name:** `onboarded` ([line 3](lib/server/onboardingCookie.ts#L3): `const COOKIE_NAME = "onboarded"`)
- **Value:** JWT signed with HS256, payload `{ uid, iat }`, exp 1 year
- **Attributes** ([line 46-56](lib/server/onboardingCookie.ts#L46-L56)): `Path=/`, `HttpOnly`, `SameSite=Lax`, `Max-Age=31536000`, `Secure` in production
- **Verification** ([line 32-44](lib/server/onboardingCookie.ts#L32-L44)): requires payload `uid` to be a non-empty string — uid mismatch with the current session is treated as missing (middleware rejects).

### 2.2 Where the cookie is SET

Three server paths set `onboarded`:

1. **[app/api/auth/session/route.ts:76-82](app/api/auth/session/route.ts#L76-L82)** — at login, after ID-token exchange, if `users/{uid}.onboardingCompleted !== false && users/{uid}.workspaceId` is a non-empty string. The comment at [line 67-69](app/api/auth/session/route.ts#L67-L69) explains: "Re-issue onboarded cookie for returning users who already completed onboarding. Without this, logout clears the cookie and middleware bounces to /onboarding before WorkspaceProvider can re-issue it via POST /api/users."

2. **[app/api/users/route.ts:39-42](app/api/users/route.ts#L39-L42)** — on `POST /api/users` (called by `WorkspaceProvider.runIdentitySync` on every provider mount), same `onboardingCompleted !== false && hasWorkspace` condition. This is the *self-heal* path the comment at session/route.ts:69 alludes to.

3. **[app/api/onboarding/route.ts:107-109 & 315-317](app/api/onboarding/route.ts#L107)** — at successful completion of the onboarding flow.

### 2.3 Where the cookie is CLEARED

- **[app/api/auth/logout/route.ts:12-18](app/api/auth/logout/route.ts#L12-L18)** — logout clears both `annote_session` and `onboarded`.
- **No other clear paths.** Member-removal does NOT clear it ([memory:member_removal_access_persistence](memory) confirms users/{uid}.workspaceId also isn't cleared on removal — the rules trust the JWT, the cookie self-heals on next POST /api/users).

### 2.4 Does the user currently have the cookie?

We can't read it from here — it's `HttpOnly`, set on the user's browser. The user's section 8 check will need to confirm.

**But: if the user is being redirected to `/onboarding` by middleware (step 7), they DO NOT have a valid `onboarded` cookie.** That's the definition of how they got to `/onboarding` in the first place. Either:

- (a) **The cookie was never issued.** Path 1 (session) and path 2 (ensure-user) both gate on `onboardingCompleted !== false && hasWorkspace`. If the user's Firestore doc has `onboardingCompleted === false` or `workspaceId === null` (or empty/missing), neither path issues the cookie.
- (b) **The cookie was cleared by logout** and the user re-signed in via a path that didn't re-issue it. Highly unlikely — `POST /api/auth/session` always runs at login and would re-issue.
- (c) **The cookie expired** (1 year). Possible but unlikely for a recently-active user.
- (d) **`SESSION_SECRET` rotated** since the cookie was issued, so `jwtVerify` fails. Possible if the env-var changed between deploys.

**By far the most likely cause is (a)**: the user's Firestore state has `onboardingCompleted !== true` or `workspaceId !== <non-empty string>`. The user said "they were using `/dashboard` before Phase 1," but a user can sit on `/dashboard` with a valid cookie even if their Firestore state was always broken — once the cookie is issued, middleware just trusts it for a year. The cookie's existence is not proof that the underlying Firestore state is healthy.

**That is the most likely truth here**: the user has a Firestore state where `onboardingCompleted` is not `true`, or where the `workspaceId` field doesn't satisfy `hasWorkspace`, and they were previously coasting on a long-lived cookie that has now lapsed or never existed.

---

## Section 3 — What Phase 1 changed about onboarding

### 3.1 Diff of `app/onboarding/layout.tsx` (commit `e087afb`)

```diff
 import "./onboarding.css";
+import { RootProviders } from "@/components/providers/RootProviders";

 export default function OnboardingLayout(...) {
-  return <div className="ob-host">{children}</div>;
+  return (
+    <RootProviders>
+      <div className="ob-host">{children}</div>
+    </RootProviders>
+  );
 }
```

### 3.2 Diff of `app/layout.tsx` (commit `e087afb`)

```diff
-import { RootProviders } from "@/components/providers/RootProviders";
...
 <ToastProvider>
-  <RootProviders>
-    <div className="env-canvas h-full flex flex-col">{children}</div>
-  </RootProviders>
+  <div className="env-canvas h-full flex flex-col">{children}</div>
 </ToastProvider>
```

### 3.3 Diff of `app/(app)/layout.tsx` (commit `e087afb`)

Same shape: `<RootProviders>` added at the top of the tree.

### 3.4 Diff of `app/page.tsx` (commit `e087afb`)

```diff
-redirect(session ? "/dashboard" : "/login");
+if (session) redirect("/dashboard");
+return <MarketingHome />;
```

**Logged-out visitors to `/` no longer redirect to `/login` — they get the marketing home.** Logged-in visitors still redirect to `/dashboard`.

### 3.5 What `WorkspaceProvider` does on mount

[lib/client/workspaceContext.tsx:441-487](lib/client/workspaceContext.tsx#L441-L487):

1. Mounts an `onAuthStateChanged` listener.
2. On first auth callback, calls `runIdentitySync(uid)`.
3. `runIdentitySync` ([line 241-431](lib/client/workspaceContext.tsx#L241-L431)):
   - Sets `workspaceLoading = true`, `claimsReady = false`, `needsOnboarding = false`.
   - Reads any localStorage workspace hint (line 253-258) to seed `workspaceId` optimistically.
   - **Calls `POST /api/users`** with an 8-second timeout (line 264-273).
   - Parses response. If response gives a `workspaceId` string → `resolved = workspaceIdFromResponse`. If response OK but no workspaceId → `resolved = null`. If response failed/timed out → `resolved = null`.
   - If `normalized = null` (line 362-375): sets `needsOnboarding = true`, `claimsReady = false`, `workspaceLoading = false`. Returns without throwing.
4. Memberships effect ([line 503-569](lib/client/workspaceContext.tsx#L503-L569)) only fires when `claimsReady && authUid`.

**Per memory** [[authfetch_token_in_lock]](memory): tokens are cached for 55 min, so the POST /api/users call usually finishes in <1s for warm sessions. The 8-second timeout is a generous fallback.

---

## Section 4 — The completion API failure

### 4.1 API expectations

[app/api/onboarding/route.ts](app/api/onboarding/route.ts) POST handler:

```
type OnboardingBody = {
  workspaceName?: string;
  workspaceSlug?: string;
};
```

[Line 62-67](app/api/onboarding/route.ts#L62-L67) — both fields are optional in the type but parsed as strings:

```ts
const workspaceName = typeof body.workspaceName === "string" ? body.workspaceName.trim() : "";
const workspaceSlug = typeof body.workspaceSlug === "string" ? body.workspaceSlug.trim().toLowerCase() : "";
```

[Line 98-100](app/api/onboarding/route.ts#L98) reads `userData.workspaceId`. Then:

- **Line 102-116:** If `userData.onboardingCompleted === true && existingWid` AND the workspace doc exists → re-issue the `onboarded` cookie and return success. This is the "already onboarded" idempotency branch.
- **Line 118:** `let wid = existingWid;`
- **Line 121:** `if (!wid) { if (!workspaceName) → 400 INVALID_INPUT "workspaceName is required" }`. This is the branch that fires.
- **Line 244-301:** Else (`wid` exists from `existingWid`), applies updates if `workspaceName` provided and writes `onboardingCompleted: true`.

So the **only** way to hit the "workspaceName is required" rejection is: **the user's Firestore `users/{uid}.workspaceId` is empty/missing AND the client posts an empty body (or omits `workspaceName`).**

### 4.2 Client call site

[components/onboarding/ReadyStep.tsx:35-46](components/onboarding/ReadyStep.tsx#L35-L46):

```tsx
const completionPayload: Record<string, string> = {};
if (workspaceName) completionPayload.workspaceName = workspaceName;
if (workspaceSlug) completionPayload.workspaceSlug = workspaceSlug;
const res = await authFetch("/api/onboarding", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(completionPayload),
});
```

The client **deliberately omits** `workspaceName` when the prop is falsy. So if the page state has `workspaceName === ""` when the user reaches `ReadyStep`, the POST body is `{}`.

### 4.3 Page state

[app/onboarding/page.tsx:43-45](app/onboarding/page.tsx#L43-L45):

```tsx
const [firstName, setFirstName] = useState(ctxFirstName);
const [lastName, setLastName] = useState(ctxLastName);
const [workspaceName, setWorkspaceName] = useState(ctxWorkspaceName ?? "");
```

`ctxWorkspaceName` is `workspaceDoc?.name ?? null` ([workspaceContext.tsx:755](lib/client/workspaceContext.tsx#L755)). For a user with no workspaceId, `workspaceDoc` is `null`, so `ctxWorkspaceName` is `null`, so initial state is `""`.

The `useEffect` at [line 60](app/onboarding/page.tsx#L60) syncs context → state when the context becomes truthy:

```tsx
useEffect(() => { if (ctxWorkspaceName) setWorkspaceName(ctxWorkspaceName); }, [ctxWorkspaceName]);
```

But `ctxWorkspaceName` will **never** become truthy for a user with no workspaceId, because there's no workspace doc to subscribe to. So `workspaceName` stays `""`.

The only path that populates `workspaceName` for a new user is `WorkspaceStep.onContinue` ([app/onboarding/page.tsx:170-176](app/onboarding/page.tsx#L170-L176)). If the user lands on step `"ready"` **without going through `"workspace"` in this session**, `workspaceName` is `""`, and the API call fails with `workspaceName is required`.

### 4.4 How the user can reach `"ready"` without filling out `WorkspaceStep` in this session

Two paths:

1. **`onboardingStep` resume.** [page.tsx:90-122](app/onboarding/page.tsx#L90-L122) reads `body.data.onboardingStep` from `GET /api/users` and jumps to `Math.min(saved - 1, steps.length - 1)`. If `users/{uid}.onboardingStep` was previously persisted as 5, the user resumes at the `"ready"` step.

   **When does `onboardingStep` get persisted?** [`persistProgress`](app/onboarding/page.tsx#L16-L22) is called in `advance` ([line 132-139](app/onboarding/page.tsx#L132-L139)) every time the user clicks "Continue", with the **next** 1-indexed step number. So clicking "Continue" on `WorkspaceStep` (index 1) persists `2`, clicking it on `InviteStep` persists `3`, on `ExtensionStep` persists `5` (last step's 1-indexed number).

   PATCH /api/users [line 498-516](app/api/users/route.ts#L498-L516) only advances `onboardingStep` (never regresses), so once it's saved as 5, it stays 5 until completion. Completion sets `onboardingCompleted: true` (via the onboarding POST batch [line 222-230](app/api/onboarding/route.ts#L222-L230)) but does NOT clear `onboardingStep`.

   **This is the most likely root cause for the "last screen" symptom.** The user must have previously navigated through to ExtensionStep at least once (which writes `onboardingStep: 5`), then abandoned the flow before clicking the final "Start your first session" button. Now whenever they re-enter `/onboarding`, the resume logic jumps straight to the ready step.

2. **`isInviteUser` short-flow.** If the user has a membership where `isOwner === false` ([page.tsx:73-76](app/onboarding/page.tsx#L73-L76)), `steps` becomes `["profile", "extension", "ready"]` — there's no workspace step at all. The user is supposed to be joining an existing workspace, not creating one. For these users, `workspaceName` is correctly never sent; the API should hit the "existing workspaceId" branch and succeed. **But** for this to work, `users/{uid}.workspaceId` must already point to the workspace they're joining (set elsewhere — likely on invite accept). If that linkage failed, an invited user could also hit the "workspaceName is required" path.

   Looking at [app/invite/[token]/page.tsx](app/invite/[token]/page.tsx) would tell us when workspaceId gets set for invited users. We did not need to read it in detail for this diagnosis; the dominant case (path #1) is sufficient to explain the symptom.

---

## Section 5 — Pre/post Phase 1 lifecycle comparison

### 5.1 Pre-Phase 1 (before commit `e087afb`)

`app/layout.tsx` had:

```tsx
<ToastProvider>
  <RootProviders>
    <div className="env-canvas h-full flex flex-col">{children}</div>
  </RootProviders>
</ToastProvider>
```

`WorkspaceProvider` mounted **once at the root**, before any route group. Navigating between `/dashboard`, `/onboarding`, `/admin`, `/settings`, etc. did NOT unmount the provider — only the children below it changed.

For a user with no `onboarded` cookie:
1. Hits `/dashboard`. Middleware step 7 fires → server-side redirect to `/onboarding`.
2. Browser follows the 307. `/onboarding` renders inside the SAME provider tree that already existed (provider state preserved across server-side redirects in a single SPA navigation? — actually no, a 307 from middleware causes a full document load, so a fresh React tree mounts).
3. So actually even pre-Phase 1, `WorkspaceProvider` would re-mount when middleware redirects. The provider hierarchy change in Phase 1 does NOT affect this case.

### 5.2 Post-Phase 1

Same shape — middleware 307 causes a full document load, fresh provider tree.

**Conclusion: the Phase 1 provider restructure does NOT explain the routing failure when middleware itself is doing the redirect.** The reason the user ends up on `/onboarding` is purely that their `onboarded` cookie is missing/invalid, and the middleware redirect logic is identical pre- and post-Phase 1.

### 5.3 Where Phase 1 DOES create a difference: client-side `WorkspaceIdentityGate` redirects

If the user *does* have a valid `onboarded` cookie but their Firestore state is somehow inconsistent (e.g., `workspaceId === null`), middleware would pass them to `/dashboard`, but [`WorkspaceIdentityGate`](components/workspace/WorkspaceIdentityGate.tsx) inside `(app)/layout.tsx` runs `router.replace("/onboarding")` whenever `needsOnboarding` flips to `true` (set by [workspaceContext.tsx:368-374](lib/client/workspaceContext.tsx#L368-L374) when `POST /api/users` returns OK with no workspaceId, OR when the call fails entirely).

- **Pre-Phase 1:** when the gate triggered `router.replace("/onboarding")`, `WorkspaceProvider` was at the root, so it persisted across the navigation. Whatever state it had (including the `runIdentitySync` result that just set `needsOnboarding = true`) carried over. `/onboarding/page.tsx` would mount inside the same provider instance.
- **Post-Phase 1:** when the gate triggers `router.replace("/onboarding")`, `(app)/layout.tsx` unmounts, taking `WorkspaceProvider` with it. `/onboarding/layout.tsx` mounts a fresh `WorkspaceProvider`, which re-runs `runIdentitySync` from scratch.

This re-run is **structurally fine** — it'll re-POST `/api/users`, the server will see `users/{uid}.workspaceId === null`, and `needsOnboarding` will be set again. The onboarding page will render. The user's experience is identical in both eras for this code path.

**The only meaningful behavioral difference**: pre-Phase 1, the provider re-mount didn't happen on every gate redirect. Post-Phase 1, it does. This adds ~1 extra second of "loading spinner" time during the navigation but does not change the eventual state.

### 5.4 What about the loading-guard race?

Looking at [page.tsx:142](app/onboarding/page.tsx#L142):

```tsx
const ready = isIdentityReady && !isLoadingWorkspaces;
if (!ready || !authUid) {
  return <div className="ob-spinner" />;
}
```

This DOES wait for `isIdentityReady` and `!isLoadingWorkspaces`. So the page won't render `WorkspaceStep` (or any step) with stale context — it'll show the spinner.

**However**, the `useEffect` at [line 90-122](app/onboarding/page.tsx#L90-L122) (the resume logic) only depends on `isIdentityReady`, not on the workspace doc fetch. So:

1. `isIdentityReady` becomes `true` once `claimsReady || needsOnboarding` is set.
2. The resume effect fires, GETs `/api/users`, reads `onboardingStep: 5`, calls `setStepIndex(4)`.
3. Steps render. The `"ready"` step gets rendered.
4. The user clicks "Start your first session", which calls the API with no `workspaceName` (because `workspaceName === ""` — the user never went through `WorkspaceStep` in this session).

The workflow has a real flaw: **the resume logic assumes that a saved `onboardingStep >= 2` means the user has already done the workspace step in some prior session AND a workspace doc exists.** Neither assumption is verified.

---

## Section 6 — Why does the user land on the "last screen"?

[page.tsx:90-122](app/onboarding/page.tsx#L90-L122) is the answer:

```tsx
useEffect(() => {
  if (!isIdentityReady || progressLoaded) return;
  ...
  const saved = typeof body?.data?.onboardingStep === "number" ? body.data.onboardingStep : 0;
  if (saved >= 2) {
    const clamped = Math.min(saved - 1, steps.length - 1);
    setStepIndex(Math.max(clamped, 0));
  }
  ...
}, [isIdentityReady, progressLoaded, steps.length]);
```

The user has `users/{uid}.onboardingStep === 5` (or 4) persisted from a prior, unfinished session. The resume logic jumps to `steps.length - 1`, which is the last step. The 1-indexed-to-0-indexed translation is `Math.min(5 - 1, 4) = 4`, which for the five-step flow is `"ready"`. For the three-step invite flow it'd be `"ready"` too (clamped to length-1).

**Confirmation of hypothesis: yes.** The user lands on the last screen because their `onboardingStep` field in Firestore is `5` (or `4`), persisted by a prior `advance()` call that wrote to `/api/users` but was never followed by a successful `POST /api/onboarding`.

This is independent of Phase 1 — the resume logic existed pre-Phase-1.

---

## Section 7 — Fix candidates

### Candidate 7.1 — Server-side: don't require `workspaceName` when the user has resumed near the end (RECOMMENDED)

**Touches:** [components/onboarding/ReadyStep.tsx](components/onboarding/ReadyStep.tsx) (or alternative: the API).

**Approach (client):** When `workspaceName` is empty at completion time, fall back to a sensible default (`firstName`'s workspace, or `"My Workspace"`) so the API gets a value to use. The API's `defaultWorkspaceDoc` already uses `"My Workspace"` as its own fallback if name is missing — but the API rejects before that fallback runs.

**Approach (server):** Loosen the rejection. Make `workspaceName` optional and have the API substitute `"My Workspace"` (or `users/{uid}.email`-derived) when missing. The `defaultWorkspaceDoc` helper at [lib/domain/workspace.ts:168](lib/domain/workspace.ts#L168) already supports this: `name: (params.name ?? "My Workspace").trim() || "My Workspace"`.

**Risk: LOW.** It only affects the error path. No behavioral change for users who go through the full flow.

**Root cause addressed:** Symptom, partially. It lets the user complete onboarding even if they resume at the end. But it doesn't fix the underlying "why does Firestore think they're at step 5 with no workspace" issue (that's the prior abandoned session — there's nothing to "fix" there, it's just legitimate resumed state).

### Candidate 7.2 — Client-side: don't resume past the workspace step if no workspaceName is set

**Touches:** [app/onboarding/page.tsx](app/onboarding/page.tsx).

**Approach:** In the resume effect ([line 110-114](app/onboarding/page.tsx#L110-L114)), clamp the resumed stepIndex to the index of `"workspace"` if `workspaceName` is empty and the user is on the 5-step flow:

```tsx
if (saved >= 2) {
  let clamped = Math.min(saved - 1, steps.length - 1);
  // If the user resumed past WorkspaceStep but workspaceName isn't loaded
  // (no workspace doc exists yet), force them back to WorkspaceStep so the
  // final completion call has a name to send.
  const workspaceIdx = steps.indexOf("workspace");
  if (workspaceIdx >= 0 && !workspaceName && clamped > workspaceIdx) {
    clamped = workspaceIdx;
  }
  setStepIndex(Math.max(clamped, 0));
}
```

**Risk: LOW.** Pure client-side, restores expected invariant (you can't be past WorkspaceStep without a name).

**Root cause addressed:** Yes — this is the actual invariant violation.

### Candidate 7.3 — Onboarded-cookie repair (mitigates the routing half of the bug)

**Touches:** investigation only, not code.

The cookie-issuance paths are sound. **The user landed on `/onboarding` because their Firestore state didn't satisfy `onboardingCompleted !== false && hasWorkspace`**, not because of a cookie bug. If middleware redirected them there, that redirect was correct given their Firestore state. The fix is to let them complete onboarding (7.1 or 7.2), at which point the cookie gets issued.

**Risk: N/A.** No code change.

### Candidate 7.4 — Provider hoisting (NOT RECOMMENDED for this bug)

**Touches:** every layout that wraps `<RootProviders>`.

**Why we shouldn't do this:** Section 5 showed that the provider hierarchy change is NOT the root cause. Reverting it would re-trigger Firebase init for marketing visitors (the whole point of Phase 1), without fixing this bug. Skip.

### Candidate 7.5 — Marketing-side interaction

Reviewed:
- [app/page.tsx](app/page.tsx) smart root: only redirects authed users to `/dashboard`. Has no influence on the onboarding flow once the user is past `/`.
- `(marketing)` layout: provider-free, doesn't touch any auth state.
- The base URL / metadata changes: purely SEO.

**Verdict: no interaction.** Phase 1's marketing-side work is not implicated.

---

## Section 8 — Browser-side checks for the user

Have the user open dev tools on the affected session and verify:

### 8.1 Application → Cookies (for the app domain, e.g., `annote.ai`)

- `annote_session` — should be **present**. If missing, they're not actually signed in.
- `email_verified_<uid>` (cookie name includes the uid; see [emailVerifiedCookie.ts](lib/server/emailVerifiedCookie.ts)) — should be **present**.
- `onboarded` — **expected missing/invalid**. This is what we're diagnosing. If it's present, the bug is elsewhere.

### 8.2 Network tab when hitting `/dashboard`

- Filter by Doc. Look at the `/dashboard` request:
  - If it returns a **307** to `/onboarding`, middleware step 7 fired → cookie is missing/invalid (confirms our hypothesis).
  - If it returns **200**, middleware passed and the redirect is happening client-side via `WorkspaceIdentityGate`. Check the `POST /api/users` response that fires right after page load — if `data.workspaceId` is `null`, `needsOnboarding` will flip and trigger the client-side redirect.

### 8.3 Network tab when `/onboarding` loads

- `GET /api/users` should fire (from the resume effect). Look at its response body: `data.onboardingStep` is the smoking gun. **If it's `5` (or `4`), the resume logic is jumping to the last step.**
- `POST /api/users` (from `WorkspaceProvider.runIdentitySync`). Look at `data.workspaceId` — if it's `null`, the user has no workspace.
- `GET /api/workspace/memberships` should fire if claimsReady becomes true. If it doesn't fire, `needsOnboarding` is set and claimsReady stayed false.

### 8.4 Network tab when clicking "Start your first session"

- `POST /api/onboarding` — look at the **request payload** (body). If it's `{}` or `{ workspaceSlug: "…" }` with no `workspaceName`, that confirms section 4.3. The response will be the 400 the user already saw.

### 8.5 Console tab

- Look for `[WorkspaceContext]` warnings, especially `Claim sync failed/timed out` or `Auto-retrying identity sync` — these mean the `POST /api/users` call has been failing, which would also flip `needsOnboarding` to `true`.
- Look for `IDENTITY READY:` logs (dev only).
- Look for any `useWorkspace must be used within WorkspaceProvider` errors — would indicate a Phase 1 wiring miss, but I don't expect them.

---

## Top-line verdict

The bug has **two independent layers**, and fixing both is straightforward:

**Layer 1 — Routing (why they land on `/onboarding`):** middleware step 7 redirects because the `onboarded` cookie is missing or invalid. The cookie is missing because the user's Firestore state is `users/{uid}.workspaceId === null` (or empty), so neither `POST /api/auth/session` nor `POST /api/users` will issue it. This is not a regression from Phase 1 — it's the system working as designed for a user with no workspace.

**Layer 2 — Why they land on the LAST screen and the completion fails:** the user previously progressed deep into onboarding (likely all the way to `ExtensionStep`, which writes `users/{uid}.onboardingStep = 5`), then abandoned the flow before clicking "Start your first session." Now whenever they re-enter `/onboarding`, the resume logic at [app/onboarding/page.tsx:90-122](app/onboarding/page.tsx#L90-L122) jumps them straight to `"ready"`. They click "Start your first session". `ReadyStep` builds a completion payload **omitting `workspaceName`** because the in-page state is `""` (they never filled out `WorkspaceStep` in *this* session, and there's no workspace doc to pull a name from). The API rejects with `workspaceName is required`.

**Apply Candidate 7.2 first** (clamp resume to `WorkspaceStep` if `workspaceName` is empty). It's a 4-line change in one file, addresses the invariant violation at the source, and doesn't risk weakening API validation. Optionally also apply Candidate 7.1's server-side fallback as defense-in-depth — but 7.2 alone should resolve the user's symptom completely.

**Phase 1 is not at fault for this bug.** The marketing restructure is structurally fine — every consumer of `useWorkspace()` lives inside one of the six surfaces where `<RootProviders>` is mounted, and the middleware redirect path is unchanged. The bug is a pre-existing latent issue in the onboarding resume logic that this user happened to surface by abandoning the flow at the right moment. No part of the diagnosis points at reverting any Phase 1 work.
