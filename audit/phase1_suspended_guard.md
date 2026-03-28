# Phase 1 — `WorkspaceSuspendedGuard` verification

**Target:** `components/workspace/WorkspaceSuspendedGuard.tsx`

## Spinner / loading UI

**None.** There is no `Loader`, spinner component, or loading-specific layout. The only alternate full-screen UI is `StatusErrorScreen` when `authUid && statusError`.

## Early returns vs children

| Path | Renders |
| ---- | ------- |
| Default | `{children}` |
| `authUid && statusError` | `StatusErrorScreen` (error, not a loading spinner) |

`isIdentityResolved` and `authUid` are used inside **`useEffect`** to decide **when** to call `/api/workspace/status`, not to return early before children.

## `!authReady`

**Not used** in this file. No branch blocks on `authReady`.

## Redirect

`useEffect` calls `router.replace("/workspace-suspended")` when `suspended === true`.

---

## Verdict

**✅ NON-BLOCKING** — **Children render immediately**; there is **no** loading UI gated on `!authReady`. **Redirect only when `suspended === true`** (after fetch). Error screen only when signed in (`authUid`) and status fetch failed.
