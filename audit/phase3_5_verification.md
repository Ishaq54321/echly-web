# Phase 3.5 — Final system hardening (verification)

## 1. Files modified

| Area | Path |
|------|------|
| Capture hook | `lib/capture-engine/core/hooks/useCaptureWidget.ts` |
| Capture types | `lib/capture-engine/core/types.ts` |
| Extension host | `echly-extension/src/content.tsx` |
| Identity gate | `components/workspace/WorkspaceIdentityGate.tsx` |
| Suspended guard | `components/workspace/WorkspaceSuspendedGuard.tsx` |
| New UI | `components/ui/OverlayError.tsx`, `components/ui/StatusOverlay.tsx` |

## 2. Removed optional guards

- **`assertIdentityBeforeWorkspaceMutations`** is **required** on `CaptureWidgetProps`. Callers must pass an explicit function; there is no optional `?.()` path.
- **`guardWorkspaceMutation()`** in `useCaptureWidget` throws `Error("Identity guard missing in capture widget")` if the callback is ever falsy at runtime (defense in depth).
- All previous `guardWorkspaceMutations` / optional-chaining usage for workspace mutations is replaced by **`guardWorkspaceMutation()`** (singular), which always invokes the required callback.

## 3. Overlay behavior

- **`WorkspaceIdentityGate`**: Always renders `children`. On `workspaceError`, adds **`OverlayError`** (fixed, `z-[200]`, dimmed backdrop, centered card). Underlying shell (rail, main, etc.) stays mounted.
- **`WorkspaceSuspendedGuard`**: Always renders `children`. On signed-in **status fetch failure**, adds **`StatusOverlay`** with the same overlay pattern. Suspended workspaces still **`router.replace("/workspace-suspended")`** as before (unchanged data flow / redirect policy).

## 4. System consistency confirmation

- **No optional safety path** for capture workspace mutations at the type level; extension supplies an explicit no-op after its own auth model.
- **No full-viewport replacement** for workspace identity or workspace status errors in the app shell; errors are overlays.
- **Web app `CaptureWidget`**: The widget is not currently mounted from `app/`; when it is, pass  
  `assertIdentityBeforeWorkspaceMutations={() => assertIdentityResolved(isIdentityResolved)}`  
  using `useWorkspace()` from `@/lib/client/workspaceContext`, matching other dashboard callers.
- **Backend, data flow, and extension messaging** were not modified beyond the required `assertIdentityBeforeWorkspaceMutations` prop on the extension `CaptureWidget` instance.

## 5. Manual test notes (recommended)

1. **Capture / identity**: From a host that omits the prop (should not compile); at runtime, calling share / save / transcribe paths without a guard would throw (guarded by TypeScript in normal builds).
2. **Workspace error**: Force `workspaceError` in context → layout remains visible with overlay.
3. **Status error**: Force failed `/api/workspace/status` while signed in → layout remains visible with `StatusOverlay`.
