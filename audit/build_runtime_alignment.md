# Build/Runtime Alignment Audit

Date: 2026-03-24
Scope: Ensure Chrome extension runtime executes latest code from `echly-extension/src/*` and not stale compiled files.

## Step 1 - Build Pipeline Verification

- Verified build script at `esbuild-extension.mjs`.
- Verified entry/output mapping:
  - `echly-extension/src/background.ts` -> `echly-extension/background.js`
  - `echly-extension/src/content.tsx` -> `echly-extension/content.js`
- Verified package scripts:
  - `build:extension:js` runs `node esbuild-extension.mjs`
  - `build:extension` runs CSS then JS build.

Conclusion: Build pipeline is correctly wired to compile from `src/*` into extension root runtime files.

## Step 2 - Manifest Verification

Checked `echly-extension/manifest.json`:

- `background.service_worker` = `background.js`
- `content_scripts[0].js` includes `content.js`

Conclusion: Manifest points to the same output files produced by the build script.

## Step 3 - Forced Clean Build

Deleted old compiled files:

- `echly-extension/background.js`
- `echly-extension/content.js`

Then rebuilt using:

- `npm run build:extension`

Build completed successfully (exit code 0), recreating both files from current sources.

## Step 4 - Output Match Verification

Compared `echly-extension/src/background.ts` behavior markers against rebuilt `echly-extension/background.js`.

Verified in source:

- `rehydrateSession(...)` exists.
- `getOrRefreshToken(...)` exists.
- temporary marker log exists: `HARDENED BACKGROUND RUNNING`.

Verified in rebuilt output:

- marker log `HARDENED BACKGROUND RUNNING` is present in `background.js`.
- hardened rehydration/error marker text is present (`[ECHLY] rehydrateSession failed`), confirming latest rehydration path is compiled in.
- token refresh path is compiled and centralized (`/api/extension/session`, `NOT_AUTHENTICATED`, token retrieved logs).
- no obvious legacy token-storage indicators found (`localStorage`, `idToken`, `refreshToken`, `getIdToken`, `firebase.auth` not found in rebuilt `background.js`).

Conclusion: Rebuilt runtime file reflects current hardened source logic, not stale pre-hardened logic.

## Step 5 - Runtime Validation

Added temporary runtime log to source:

- `console.log("HARDENED BACKGROUND RUNNING");`

Then rebuilt successfully.

Manual runtime check required in Chrome (cannot be executed from CLI):

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click Reload on the Echly extension.
4. Open service worker console ("Inspect views" / "service worker").
5. Confirm log appears: `HARDENED BACKGROUND RUNNING`.

Status: Prepared and build-validated; console confirmation pending manual DevTools verification.

## Success Criteria Status

- Manifest uses freshly built files: PASS
- Runtime logs confirm new code running: PENDING MANUAL CONSOLE CHECK
- No mismatch between `src` and executed build artifacts: PASS (build/output validation)

