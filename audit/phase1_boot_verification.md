# Phase 1 — Boot logic verification

**Target:** `components/providers/AppBootGate.tsx` → `AppBootReadinessBridge`

## 1. `AppBootReadinessBridge` located

Yes — exported from `AppBootGate.tsx` (lines 69–82).

## 2. Readiness input to boot completion

`AppBootReadinessBridge` computes:

- `bootReady = useAppBoot(authReady)` where `authReady` comes from `useWorkspace()` only.

`useAppBoot` (`lib/client/perception/useAppBoot.ts`) treats its boolean argument as the gate: when that argument becomes true, boot session completes and stays complete.

**Naming note:** The hook parameter is named `isAppReady` in `useAppBoot(isAppReady: boolean)`, but the bridge passes **`authReady`** as that argument — not a composite.

## 3. Excluded inputs (must not gate boot)

| Input        | Used in `AppBootReadinessBridge`? |
| ------------ | --------------------------------- |
| `claimsReady` | No                               |
| `workspaceId` | No                               |
| `authUid`     | No                               |

## 4. `AppBootGate` overlay

The full-viewport `LogoLoader` overlay is controlled by `surfaceReady` from `AppBootChromeContext`, which `AppBootReadinessBridge` updates via `reportSurfaceReady(bootReady)`. That chain is driven only by `authReady` → `useAppBoot` as above.

---

## Verdict

**✅ CORRECT** — Boot dismissal logic for the bridge uses **`authReady` only**; it does **not** include `claimsReady`, `workspaceId`, or `authUid`.

*(If Phase 1 is interpreted as “overlay clears when `authReady === true` only,” that matches this implementation. Separate hooks/pages may still use other readiness signals for their own content.)*
