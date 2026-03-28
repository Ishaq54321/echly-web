# Phase 1 — `useRenderReadiness` verification

**Target:** `lib/client/perception/useRenderReadiness.ts`

## `identityReady` definition

```ts
const identityReady = authReady && Boolean(authUid);
```

Equivalent to **`authReady && !!authUid`** for practical purposes.

## Excluded dependencies

| Signal        | Present in `identityReady`? |
| ------------- | --------------------------- |
| `claimsReady` | No                          |
| `workspaceId` | No                          |

Comments in-file explicitly warn not to add `claimsReady` or `workspaceId`.

---

## Verdict

**✅ CORRECT** — Matches the requested shape **`authReady && !!authUid`**, with **no** `claimsReady` or `workspaceId`.

**Scope note:** Stricter wording “UI only needs `authReady`” (without `authUid`) is **not** what this hook implements; it requires both `authReady` and `authUid`.
