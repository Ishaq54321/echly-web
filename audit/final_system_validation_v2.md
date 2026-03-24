# Final System Validation v2 (Post Hardening)

Date: 2026-03-24  
Scope: Extension runtime only (`echly-extension/`)

## Validation Method

- Assumed previous failures were real.
- Re-verified hardened logic in source runtime implementation (`src/background.ts`, `src/content.tsx`).
- Attempted to break lifecycle by tracing cold start, tab activation, and state sync paths.
- Verified loaded runtime artifacts via manifest entrypoints.

---

## Critical Runtime Reality

`manifest.json` loads:

- `background.service_worker = "background.js"`
- `content_scripts[].js = ["content.js"]`

So the final reliability verdict must be based on those built artifacts actually executed by Chrome, not just TypeScript source.

The current `background.js` is an older/minified runtime variant (shows legacy token header flow and does not match hardened `src/background.ts` behavior signatures), which means the hardened guarantees are not proven in the executing runtime.

---

## Check 1 - Stale State Window

### What was verified in hardened source

- `ECHLY_GET_GLOBAL_STATE` forces rehydrate when state is empty/stale (`isStateEmptyForSession()` or stale timeout).
- Tab activation triggers sync and possible rehydrate.
- Cold start initialization calls `initializeSessionState()` and rehydrate for active sessions.
- Rehydrate uses replacement semantics (clear stale pointers before fetch).

### Break attempt result

- Source implementation looks deterministic.
- Runtime entrypoint mismatch means this guarantee is not validated for the actually loaded worker.

### Status

**FAIL (runtime confidence broken by stale built entrypoint risk)**

---

## Check 2 - Token Flow

### What was verified in hardened source

- Central token path exists: `getOrRefreshToken()`.
- `getExtensionToken()` and `getValidToken()` both route to it.
- Background API operations use `apiFetch(...)` after token resolution.
- Pagination (`loadMore`) calls `getValidToken()` before page fetch, so token expiry should not silently break cursor paging in source.

### Break attempt result

- Source path appears consistent.
- Executed `background.js` still presents legacy token behavior (`x-extension-token` pattern visible), indicating runtime may not be using hardened token pipeline.

### Status

**FAIL (cannot certify all runtime API calls use hardened token path)**

---

## Check 3 - Failure Handling

### What was verified in hardened source

- Background has explicit error handling for rehydrate and pagination (`console.error` + deterministic state reset).
- Pagination failure disables further stale retries (`nextCursor = null`, `hasMore = false`).

### Remaining risks found

- Content runtime still contains many fire-and-forget `.catch(() => {})` message sends. Some are acceptable for delivery noise, but this pattern still exists and can hide operational symptoms.
- There are silent catches in non-critical optional paths (for example optional structuring/session URL fetch) that suppress diagnostics.

### Status

**FAIL (silent-failure pattern still present in runtime surface)**

---

## Check 4 - Rehydration Guarantee (worker restart / idle resume / token refresh)

### What was verified in hardened source

- Single-flight rehydrate lock (`rehydrationPromise`).
- Rehydrate invoked on cold start recovery, on GET_GLOBAL_STATE when stale/empty, and on tab activation when stale.
- Token-set events can trigger rehydrate.
- Failure path uses replacement state (no stale merge).

### Break attempt result

- Source logic is close to required behavior.
- Because loaded runtime artifact is not confirmed equivalent, "always rebuild correctly" is not guaranteed in production extension execution.

### Status

**FAIL (guarantee not provable in executing bundle)**

---

## Final Verdict

❌ **STILL NOT RELIABLE**

Reason: hardening appears present in `src/*`, but runtime entry artifacts (`background.js`/`content.js`) are not reliably aligned with that logic, so deterministic/lifecycle-safe/failure-safe guarantees are not currently certifiable for the extension as executed.

## Minimum Fix Required Before Re-Validation

1. Rebuild extension bundles so `background.js` and `content.js` exactly reflect current hardened `src/*`.
2. Re-run this same validation against built artifacts (not source files).
3. Remove or instrument silent catches where failures should be observable, especially around lifecycle-critical sync paths.
