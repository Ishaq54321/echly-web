## Phase 2 — Admin SDK Foundation (Safe Introduction)

### Summary
- **Goal**: Add Firebase Admin SDK as a new server-only layer (no migrations, no behavior changes to existing APIs).
- **Status**: Admin infrastructure added (initializer, example repository, isolated internal API route).

### What changed (additive only)
- **Admin initializer**: `lib/server/firebaseAdmin.ts`
  - Initializes Admin app once (safe for Next dev hot-reload).
  - Exports:
    - `adminDb` (Firestore)
    - `adminStorage` (Storage bucket)
- **Server-only repository example**: `lib/server/repositories/adminFeedbackRepository.ts`
  - Minimal read/write using `adminDb`.
  - Uses a dedicated collection: `_admin_feedback_test`
- **Isolated internal route**: `app/api/internal/admin-test/route.ts`
  - `GET` writes/reads Firestore doc `_admin_test/phase2`
  - Uses Admin SDK only.
  - Forces Node runtime (`export const runtime = "nodejs";`).

### Step 1 — Install Admin SDK
- `firebase-admin` is already present in `package.json` (`^13.7.0`).
- Ran `npm install firebase-admin` and it was already up to date.

### Step 2 — Admin initialization details
File: `lib/server/firebaseAdmin.ts`

Credential selection order:
1. **`FIREBASE_SERVICE_ACCOUNT_JSON`** (recommended for local dev if you don’t want to manage a file path)
2. **ADC via `GOOGLE_APPLICATION_CREDENTIALS`** (recommended if you already use the standard Google flow)
3. Otherwise attempts **ADC** (works automatically on some hosted environments like GCP)

Project id:
- Uses `FIREBASE_PROJECT_ID` if provided
- Otherwise defaults to: `echly-b74cc` (not a secret; helps local Admin setup)

Storage bucket:
- Uses `FIREBASE_STORAGE_BUCKET` if provided
- Otherwise defaults to: `echly-b74cc.firebasestorage.app` (not a secret)

### Step 3 — Environment setup (no secrets hardcoded)
No Admin credential configuration was found in the repo (no references to `GOOGLE_APPLICATION_CREDENTIALS` etc.).
`.gitignore` contains `serviceAccountKey.json` which suggests a local key file may be used by developers but it’s not wired up in code yet.

Choose ONE of the following approaches.

#### Option A — Service account JSON in env (string)
Set:
- `FIREBASE_SERVICE_ACCOUNT_JSON` = the full service account JSON (exact JSON string)
- Optional: `FIREBASE_STORAGE_BUCKET` = your bucket name (if different)

Notes:
- This avoids committing a key file or relying on a key path.
- On Windows PowerShell, be careful with quoting/escaping JSON.

#### Option B — Application Default Credentials (ADC) using a JSON key file path
Set:
- `GOOGLE_APPLICATION_CREDENTIALS` = absolute path to a service account JSON file
- Optional: `FIREBASE_STORAGE_BUCKET`

Notes:
- This is the standard Google/Firebase server credential mechanism.
- The JSON key file must stay out of git (your `.gitignore` already protects `serviceAccountKey.json` by name).

### Step 4 — Server-only repository layer
Folder created: `lib/server/repositories/`

Example repo: `adminFeedbackRepository.ts`
- `addAdminFeedbackTestRepo(message)`
- `getAdminFeedbackTestRepo(id)`

This is intentionally **not** referenced by existing code paths yet.

### Step 5 — Test API route (isolated)
Route: `app/api/internal/admin-test/route.ts`

Behavior:
- Writes merge fields to `_admin_test/phase2`
- Reads it back and returns JSON response `{ ok: true, wrote, read }`

### Step 6 — Verification checklist (what to do now)
1. Ensure one of the credential options above is set in your environment.
2. With the dev server running, call:
   - `GET /api/internal/admin-test`
3. Confirm:
   - Firestore write succeeds
   - No permission errors (Admin bypasses Firestore security rules)

Dev note:
- After changing env vars, **restart `npm run dev`** so the server picks up new credentials.

Optional Storage test (not yet implemented in route):
- You can add a small storage list/upload test in a later step if desired, but this phase keeps it minimal and isolated.

### Expected outcomes
- **Admin SDK initialized successfully**: Should initialize on first import of `lib/server/firebaseAdmin.ts`.
- **Firestore access working**: The internal test route should write/read successfully even if rules would deny client SDK.
- **Storage access available**: `adminStorage` is exported; actual bucket access depends on credentials having Storage permissions.

### Issues encountered
- Calling `GET /api/internal/admin-test` currently returns:
  - `{"ok":false,"error":"Unable to detect a Project Id in the current environment..."}`

This indicates **Admin credentials are not configured in the current dev environment** (ADC can’t resolve project/credentials). Fix by setting either:
- `FIREBASE_SERVICE_ACCOUNT_JSON` (service account JSON string), or
- `GOOGLE_APPLICATION_CREDENTIALS` (path to service account JSON file)


