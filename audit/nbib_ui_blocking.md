# NBIB audit — UI blocking on `claimsReady` / `workspaceId`

Target under test (from audit brief): **UI may render when `authReady && authUid`** and **must not depend on `claimsReady` / `workspaceId`**. Evidence compares implementation to that ideal.

---

## `components/providers/AppBootGate.tsx`

| Component | Behavior | Blocked on `claimsReady` / `workspaceId`? | Mark |
|-----------|----------|----------------------------------------|------|
| `AppBootGate` | Full-screen `LogoLoader` until `surfaceReady` | Indirect — overlay controlled by child bridge | ⚠️ MIXED |
| `AppBootReadinessBridge` | `isAppReady = authReady && (!signedIn \|\| (claimsReady && Boolean(workspaceId?.trim())))` | **Yes** for signed-in users | 🚨 BLOCKING vs strict NBIB shell rule |

---

## `components/workspace/WorkspaceSuspendedGuard.tsx`

| Check | Effect |
|-------|--------|
| `!authReady` | Spinner (or blank when boot chrome covers) | 🚨 BLOCKING on `authReady` (not `authUid` alone) |
| `authUid && statusError` | Full-page error — after `isIdentityResolved` for fetch | ✅ NON-BLOCKING for claims/workspace beyond own rule |

Status **fetch** waits `isIdentityResolved` — correct for data; **initial spinner** uses `authReady`.

---

## `components/workspace/WorkspaceIdentityGate.tsx`

| Check | Effect |
|-------|--------|
| `!authReady` | Spinner / blank | 🚨 BLOCKING |
| `workspaceError` | Error / onboarding link | ✅ NON-BLOCKING (error path) |
| `!authUid` | Renders `children` | ✅ NON-BLOCKING (signed-out) |
| Signed-in, `!workspaceLoading && !workspaceId` | `FullScreenError` | 🚨 BLOCKING on `workspaceId` after load completes |

During `workspaceLoading === true` with signed-in user, gate **does** render `children` (no early return for loading state before final branch) — shell can appear while workspace still resolving.

---

## `lib/client/perception/useRenderReadiness.ts`

- `identityReady = authReady && !!authUid` — **does not** wait for claims/workspace.
- Used by `app/(app)/dashboard/page.tsx` for loader / `useStableState` timing — aligns with **NBIB-style** dashboard rendering.

---

## Layout composition (`app/(app)/layout.tsx`)

Order: `AppBootGate` → `WorkspaceProvider` → `WorkspaceSuspendedGuard` → `WorkspaceIdentityGate` → … → `AppBootReadinessBridge`.

**Net effect for signed-in users:** boot overlay stays until `claimsReady && workspaceId` (`AppBootReadinessBridge`), while dashboard also uses `useRenderReadiness` for content stabilization — **two different “ready” concepts** coexist.

---

## Summary marks (vs strict audit target)

| Concern | Verdict |
|---------|---------|
| Boot chrome | 🚨 BLOCKING — signed-in dismiss requires `claimsReady` + `workspaceId` |
| `WorkspaceIdentityGate` | ⚠️ MIXED — allows children during `workspaceLoading`; blocks with spinner on `!authReady`; blocks invalid signed-in no-workspace |
| `WorkspaceSuspendedGuard` | 🚨 BLOCKING on `!authReady` (spinner) |
| `useRenderReadiness` / dashboard content | ✅ NON-BLOCKING relative to claims/workspace |

**Conclusion:** The app **does not** uniformly satisfy the strict statement “shell never depends on `claimsReady` / `workspaceId`”; it implements a **hybrid** (perception/`useRenderReadiness` for some content + global boot overlay and gates for chrome).
