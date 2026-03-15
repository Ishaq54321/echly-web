# Echly — Full Authentication System Architecture Audit

**Audit type:** Read-only. No code was modified.  
**Goal:** Document the complete authentication architecture across Web Dashboard, Chrome Extension, Backend/APIs, and Firebase.

---

## STEP 1 — Authentication Entry Points (Files)

### Dashboard Auth Files

| File | Role |
|------|------|
| `lib/firebase.ts` | Firebase app init; exports `auth`, `db`, `storage` |
| `lib/firebase/config.ts` | Firebase client config (apiKey, projectId, etc.) |
| `lib/auth/authActions.ts` | `signInWithGoogle()`, `signInWithEmailPassword()`, `signUpWithEmailPassword()` |
| `lib/auth/checkUserWorkspace.ts` | Post-login workspace check (used by login page) |
| `lib/authFetch.ts` | `authFetch()` — gets Firebase ID token, sets `Authorization: Bearer`, in-memory cache; `clearAuthTokenCache()` |
| `lib/hooks/useAuthGuard.ts` | `onAuthStateChanged`, redirect to `/login`, `clearAuthTokenCache` on sign-out |
| `lib/uploadAttachment.ts` | Dashboard upload; uses `auth.currentUser.getIdToken()`, `Authorization: Bearer` |
| `app/(auth)/login/page.tsx` | Login UI; calls `signInWithGoogle` / `signInWithEmailPassword`, then `checkUserWorkspace`, then `router.replace` |
| `components/layout/ProfileCommandPanel.tsx` | Sign-out: `signOut(auth)` and `onClose()` only (no API call, no postMessage) |
| `app/(app)/folders/[folderId]/page.tsx` | Uses `onAuthStateChanged`, `auth.currentUser` |
| `lib/hooks/useBillingUsage.ts` | Uses `onAuthStateChanged(auth, ...)` |

### Extension Auth Files

| File | Role |
|------|------|
| `echly-extension/src/background.ts` | Central auth: token state, `chrome.storage.local`, `getValidToken()`, `refreshIdToken()`, `exchangeGoogleIdToken()`, message handlers (`ECHLY_GET_TOKEN`, `ECHLY_GET_AUTH_STATE`, `ECHLY_SIGN_IN` / `ECHLY_START_LOGIN` / `LOGIN`, `echly-api` with Bearer) |
| `echly-extension/src/contentAuthFetch.ts` | Content script API: sends `echly-api` to background (no token in content); `clearAuthTokenCache()` is a no-op |
| `echly-extension/src/api.ts` | Popup/other: `auth.currentUser.getIdToken()`, `Authorization: Bearer` (Firebase in extension context) |
| `echly-extension/src/firebase.ts` | Firebase for extension: `getAuth` from `firebase/auth/web-extension` |
| `echly-extension/src/auth.ts` | Re-exports Firebase `signOut` (not used by main flow; main flow is background OAuth) |
| `echly-extension/src/popup.tsx` | Popup: `ECHLY_GET_AUTH_STATE`, `ECHLY_START_LOGIN`, then `ECHLY_TOGGLE_VISIBILITY` and close |
| `echly-extension/src/content.tsx` | Content: uses `contentAuthFetch` and messages; no Firebase auth; `ECHLY_OPEN_POPUP` for sign-in |

### API / Backend Auth Files

| File | Role |
|------|------|
| `lib/server/auth.ts` | `verifyIdToken(token)` (jose + Firebase JWKS), `requireAuth(request)` (Bearer only) |
| `app/api/sessions/route.ts` | `requireAuth(req)` |
| `app/api/sessions/[id]/route.ts` | `requireAuth(req)` |
| `app/api/feedback/route.ts` | `requireAuth(req)` |
| `app/api/feedback/counts/route.ts` | `requireAuth(req)` |
| `app/api/structure-feedback/route.ts` | `requireAuth(req)` |
| `app/api/upload-screenshot/route.ts` | `requireAuth(req)` |
| `app/api/upload-attachment/route.ts` | `requireAuth(req)` |
| `app/api/tickets/[id]/route.ts` | `requireAuth(req)` |
| `app/api/workspace/status/route.ts` | `requireAuth(req)` |
| `app/api/insights/route.ts` | `requireAuth(req)` |
| `app/api/billing/usage/route.ts` | `requireAuth(req)` |
| `app/api/session-insight/route.ts` | `requireAuth(req)` |
| `app/api/admin/*` (e.g. update-plan, me, plans, workspaces, usage) | `requireAuth(req)` |
| `app/api/cron/cleanup-temp-screenshots/route.ts` | Optional CRON_SECRET (Bearer or x-cron-secret), no user auth |

---

## STEP 2 — DASHBOARD LOGIN FLOW

### Where Firebase is initialized

- **File:** `lib/firebase.ts`  
- **Code:** `initializeApp(firebaseConfig)` from `lib/firebase/config.ts`, then `getAuth(app)`, `getFirestore(app)`, `getStorage(app)`.  
- **Exports:** `auth`, `db`, `storage`.

### How users sign in

- **File:** `app/(auth)/login/page.tsx`  
- **Methods:**  
  1. **Google:** `handleGoogle` → `signInWithGoogle()` from `lib/auth/authActions.ts` → `signInWithPopup(auth, new GoogleAuthProvider())`.  
  2. **Email/password:** `handleEmail` → `signInWithEmailPassword(email, password)` → `signInWithEmailAndPassword(auth, email, password)`.  
- After success: `checkUserWorkspace(user.uid)` → `router.replace(dest === "dashboard" ? "/dashboard" : "/onboarding")`.  
- **No** `getIdToken()` or postMessage to the extension on the login page in the current codebase.

### Where `getIdToken()` is used (dashboard)

- **`lib/authFetch.ts`:**  
  - `getCachedIdToken(user)` calls `user.getIdToken()` and `user.getIdTokenResult()` for caching.  
  - `authFetch()` uses that token and sets `headers.set("Authorization", `Bearer ${token}`)".  
- **`lib/uploadAttachment.ts`:**  
  - `const token = await user.getIdToken()` then `xhr.setRequestHeader("Authorization", `Bearer ${token}`)".  

### How tokens are stored (dashboard)

- **In-memory only:** `lib/authFetch.ts` uses `cachedToken` and `tokenExpiry` (no localStorage, no cookie).  
- **Firebase client:** Auth state is held by Firebase Auth (session persistence is Firebase default, e.g. localStorage in browser).

### Cookies / backend sessions

- **Not used.**  
- No `credentials: "include"` in `lib/authFetch.ts`.  
- No `__session` or other session cookie in the codebase.  
- No `/api/auth/sessionLogin` or `/api/auth/logout` routes in the app.  
- Dashboard auth is **Firebase client + Bearer ID token** only; backend accepts only Bearer (see `lib/server/auth.ts`).

### Step-by-step: DASHBOARD LOGIN FLOW

1. User opens `/login` (e.g. `app/(auth)/login/page.tsx`).
2. Firebase is already initialized in the app via `lib/firebase.ts` (single app, shared `auth`).
3. User clicks “Continue with Google” or submits email/password.
4. `signInWithGoogle()` or `signInWithEmailPassword()` runs → Firebase Auth signs the user in (popup or credential).
5. `checkUserWorkspace(user.uid)` runs; destination is `/dashboard` or `/onboarding`.
6. `router.replace("/dashboard" | "/onboarding")` — no token sent to extension, no postMessage.
7. On subsequent API calls from the dashboard, `authFetch()` (or upload with getIdToken) runs:
   - `auth.currentUser` → `getCachedIdToken(user)` → `user.getIdToken()` (cached with expiry).
   - Request headers: `Authorization: Bearer <id-token>`.
8. No cookie is set for the Echly backend; no backend session is created.

---

## STEP 3 — TOKEN USAGE MAP

| File | Usage |
|------|--------|
| **Dashboard** | |
| `lib/authFetch.ts` | All authenticated dashboard fetches: `getCachedIdToken(user)` → `Authorization: Bearer ${token}`. No cookie. |
| `lib/uploadAttachment.ts` | `user.getIdToken()` → `xhr.setRequestHeader("Authorization", `Bearer ${token}`)". |
| **Extension** | |
| `echly-extension/src/background.ts` | All backend calls: `getValidToken()` (from memory/refresh) → `Authorization: Bearer ${token}`. Used in: session/feedback fetch, `ECHLY_SET_ACTIVE_SESSION`, `ECHLY_UPLOAD_SCREENSHOT`, `ECHLY_PROCESS_FEEDBACK`, and the generic `echly-api` handler. |
| `echly-extension/src/contentAuthFetch.ts` | Does not attach token; sends `{ type: "echly-api", url, method, headers, body }` to background; background adds Bearer and performs fetch. |
| `echly-extension/src/api.ts` | Used in contexts with Firebase (e.g. popup): `auth.currentUser.getIdToken()` → `headersRecord["Authorization"] = \`Bearer ${token}\``. Main content flow uses contentAuthFetch → background. |
| **Backend** | |
| `lib/server/auth.ts` | `requireAuth(request)`: reads `Authorization` header, expects `Bearer <token>`, extracts token, calls `verifyIdToken(token)` (jose + Firebase JWKS). No cookie check. |

**APIs that require auth (all use `requireAuth(req)`):**

- `/api/sessions`, `/api/sessions/[id]`
- `/api/feedback`, `/api/feedback/counts`
- `/api/structure-feedback`
- `/api/upload-screenshot`, `/api/upload-attachment`
- `/api/tickets/[id]`
- `/api/workspace/status`
- `/api/insights`
- `/api/billing/usage`
- `/api/session-insight`
- `/api/admin/*` (e.g. update-plan, me, plans, workspaces, usage)

**Special:** `/api/cron/cleanup-temp-screenshots` — optional `CRON_SECRET` (Bearer or `x-cron-secret`); no user auth.

---

## STEP 4 — EXTENSION AUTH FLOW

### How the extension knows if the user is logged in

- **Background:** In-memory `tokenState` (`idToken`, `refreshToken`, `expiresAtMs`, `user`) and restore from `chrome.storage.local` on load.  
- **Popup / content:** Ask background via `ECHLY_GET_AUTH_STATE`; background responds `{ authenticated: !!tokenState.refreshToken, user: tokenState.user }`.  
- **Content script:** No direct Firebase; auth state comes from background messages and `ECHLY_GET_AUTH_STATE`.

### Where tokens are stored (extension)

- **Background memory:** `tokenState` object.  
- **Persisted:** `chrome.storage.local` with keys: `auth_idToken`, `auth_refreshToken`, `auth_expiresAtMs`, `auth_user`.  
- Set in `setTokenState()` and on startup via `chrome.storage.local.get(["auth_idToken", "auth_refreshToken", "auth_expiresAtMs", "auth_user"], ...)`.

### Does the extension use Firebase directly?

- **Background:** No Firebase SDK. Uses Google OAuth (`chrome.identity.launchWebAuthFlow`) and Firebase REST:  
  - `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp` (exchange Google ID token for Firebase tokens).  
  - `https://securetoken.googleapis.com/v1/token` (refresh with `refresh_token`).  
- **Popup/content:** `api.ts` and `firebase.ts` exist (Firebase Auth for extension); the main flow is background OAuth + REST. Popup uses messages, not Firebase, for “Continue with Google.”

### Are tokens retrieved from the dashboard?

- **No.** The extension does not receive tokens from the dashboard in the current code.  
- Extension login is independent: popup or “Sign in” in widget → `ECHLY_START_LOGIN` → background → `chrome.identity.launchWebAuthFlow` → Google ID token → Firebase REST exchange → store in background + `chrome.storage.local`.

### How extension communicates with the dashboard

- **No direct messaging from dashboard to extension in code.**  
- There is no `window.postMessage` from the login page and no `addEventListener("message")` in the extension content script for `ECHLY_EXTENSION_LOGIN_SUCCESS` or `ECHLY_DASHBOARD_LOGOUT` in the current codebase.  
- Extension opens dashboard URL (e.g. `ECHLY_OPEN_TAB`) for navigation only; no token or auth state is passed via postMessage.

### Step-by-step: EXTENSION AUTH FLOW (current)

1. User clicks extension icon (popup) or “Sign in” in widget → popup opens or `ECHLY_OPEN_POPUP`.
2. Popup runs: `getAuthState()` → `ECHLY_GET_AUTH_STATE` → background returns `{ authenticated, user }`.
3. If not authenticated, user clicks “Continue with Google” → `ECHLY_START_LOGIN` (or `ECHLY_SIGN_IN` / `LOGIN`).
4. Background: `chrome.identity.launchWebAuthFlow` with Google OAuth URL (id_token, openid email profile), user signs in in Google tab.
5. Callback URL contains `id_token` in hash; background parses it, calls `exchangeGoogleIdToken(googleIdToken)` → POST to `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp` with Firebase API key.
6. Response: Firebase `idToken`, `refreshToken`, `expiresIn`, user fields; background calls `setTokenState({ idToken, refreshToken, expiresAtMs, user })` → in-memory + `chrome.storage.local.set({ auth_idToken, auth_refreshToken, auth_expiresAtMs, auth_user })`.
7. Background sends success to popup; popup calls `ECHLY_TOGGLE_VISIBILITY` and closes.
8. Content script never holds a token; it uses `contentAuthFetch` → `echly-api` → background adds `Authorization: Bearer <token>` via `getValidToken()` and performs fetch.
9. Token refresh: when `getValidToken()` sees token near/over expiry, it uses `refreshIdToken(tokenState.refreshToken)` (securetoken.googleapis.com) and updates `tokenState` and storage.

**Relevant paths:**  
- Background: `echly-extension/src/background.ts` (message listener, `exchangeGoogleIdToken`, `refreshIdToken`, `getValidToken`, `setTokenState`, storage get/set).  
- Popup: `echly-extension/src/popup.tsx`.  
- Content: `echly-extension/src/content.tsx` (ECHLY_OPEN_POPUP, ECHLY_GET_AUTH_STATE), `echly-extension/src/contentAuthFetch.ts` (echly-api proxy).

---

## STEP 5 — DASHBOARD → EXTENSION LOGIN BRIDGE

**In the current codebase there is no dashboard → extension login bridge.**

- The login page (`app/(auth)/login/page.tsx`) does not call `getIdToken()` for the extension, does not call `window.postMessage`, and does not set any extension-specific storage.
- The extension content script does not register `addEventListener("message")` for `ECHLY_EXTENSION_LOGIN_SUCCESS` or `ECHLY_DASHBOARD_ORIGIN`.
- The background script does not handle `ECHLY_EXTENSION_LOGIN_SUCCESS` or receive tokens from the dashboard.

So: **no message format from dashboard to extension exists in the current implementation.** The existing document `docs/ECHLY_AUTHENTICATION_AUDIT_REPORT.md` describes a design that includes a bridge (e.g. `ECHLY_EXTENSION_LOGIN_SUCCESS` with `idToken`, `refreshToken`, `uid`, etc.); that flow is not present in the current source.

---

## STEP 6 — LOGOUT FLOW

### Dashboard logout

- **File:** `components/layout/ProfileCommandPanel.tsx`  
- **Code:** `handleSignOut` → `signOut(auth)` (Firebase `signOut`), then `onClose()`.  
- **No** `fetch("/api/auth/logout")`, no `window.postMessage`, no notification to the extension.

### Extension notification on logout

- **None.** There is no `ECHLY_DASHBOARD_LOGOUT` handler in the extension; no `clearAuthState()` or equivalent that runs when the user signs out on the dashboard.  
- Extension token state is cleared only when: (1) user has not logged in via extension, or (2) token is invalid/expired and refresh fails (e.g. `getValidToken()` throws `NOT_AUTHENTICATED`). The extension does not clear stored tokens when the backend returns 401/403 on an API call.

### Token and UI state on logout

- **Dashboard:** Firebase `signOut(auth)` clears the client auth state and any in-memory token cache used by `authFetch`.  
- **Extension:** Tokens in `chrome.storage.local` and in-memory `tokenState` are left unchanged by dashboard logout.  
- **Backend:** No session or cookie to clear; backend is stateless Bearer-only.

**Conclusion:** Dashboard logout and extension auth are **not** synchronized. The extension can still hold valid tokens after the user has signed out on the dashboard.

---

## STEP 7 — COOKIE SESSION STATUS

- **No cookie-based auth in the Echly app or API.**  
- `lib/authFetch.ts` does not use `credentials: "include"`.  
- `lib/server/auth.ts` does not read cookies; it only checks `Authorization: Bearer <token>`.  
- No `__session` or other session cookie is set or read.  
- No `/api/auth/sessionLogin` or session cookie creation in the codebase.

**Conclusion:** Authentication is Bearer-only (Firebase ID token). Cookie sessions are not implemented.

---

## STEP 8 — EXTENSION STORAGE STRUCTURE

**`chrome.storage.local` keys (from `echly-extension/src/background.ts`):**

| Key | Type | Purpose |
|-----|------|---------|
| `auth_idToken` | string | Firebase ID token (short-lived). |
| `auth_refreshToken` | string | Firebase refresh token (used by `refreshIdToken()`). |
| `auth_expiresAtMs` | number | Epoch ms when current idToken is considered expired. |
| `auth_user` | object | `{ uid, name, email, photoURL }` for display. |
| `activeSessionId` | string \| null | Current session id for the widget. |
| `sessionModeActive` | boolean | Session mode on/off. |
| `sessionPaused` | boolean | Session paused state. |

**In-memory in background:**  
- `tokenState`: same fields as above.  
- `globalUIState`: visible, expanded, isRecording, sessionId, sessionTitle, sessionModeActive, sessionPaused, sessionLoading, pointers, captureMode (not persisted in storage in the same shape; session-related bits are synced via `activeSessionId`, `sessionModeActive`, `sessionPaused`).

**Note:** The older audit doc referenced `echly_extension_token`; the current code uses `auth_idToken`, `auth_refreshToken`, `auth_expiresAtMs`, `auth_user` only.

---

## STEP 9 — BACKEND AUTH SYSTEM

### Token verification

- **File:** `lib/server/auth.ts`  
- **Function:** `verifyIdToken(token: string)`: uses `jose` with `createRemoteJWKSet` for Firebase JWKS URL (`https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com`), `jwtVerify` with `issuer: https://securetoken.google.com/<PROJECT_ID>`, `audience: PROJECT_ID` (`echly-b74cc`).  
- **No Firebase Admin SDK** in this file; verification is JWT + JWKS only.

### Auth middleware

- **`requireAuth(request: Request)`** in `lib/server/auth.ts`:  
  - Reads `Authorization` header; if missing or not `Bearer <token>`, returns 401.  
  - Extracts token, calls `verifyIdToken(token)`; on success returns decoded payload (with `uid`); on failure returns 401.  
- No separate middleware file; each route calls `requireAuth(req)` and uses the returned user (e.g. `uid`).

### Routes that require auth

All of the following use `requireAuth(req)` and thus require a valid Firebase ID token in `Authorization: Bearer <token>`:

- `app/api/sessions/route.ts`, `app/api/sessions/[id]/route.ts`
- `app/api/feedback/route.ts`, `app/api/feedback/counts/route.ts`
- `app/api/structure-feedback/route.ts`
- `app/api/upload-screenshot/route.ts`, `app/api/upload-attachment/route.ts`
- `app/api/tickets/[id]/route.ts`
- `app/api/workspace/status/route.ts`
- `app/api/insights/route.ts`
- `app/api/billing/usage/route.ts`
- `app/api/session-insight/route.ts`
- `app/api/admin/update-plan/route.ts`, `app/api/admin/me/route.ts`, `app/api/admin/plans/route.ts`, `app/api/admin/workspaces/route.ts`, `app/api/admin/workspaces/actions/route.ts`, `app/api/admin/usage/route.ts`

**Cron:** `app/api/cron/cleanup-temp-screenshots/route.ts` — optional `CRON_SECRET` (Bearer or `x-cron-secret`); no user `requireAuth`.

---

## STEP 10 — FINAL AUTH ARCHITECTURE REPORT

### 1. Dashboard Login Architecture

- **Firebase:** Single app in `lib/firebase.ts`, config in `lib/firebase/config.ts`.  
- **Login:** `/login` uses Google (signInWithPopup) or email/password (signInWithEmailAndPassword). No extension postMessage or token handoff.  
- **Post-login:** `checkUserWorkspace(uid)` then redirect to `/dashboard` or `/onboarding`.  
- **API auth:** All authenticated requests use `authFetch()` (or direct getIdToken in upload), which sets `Authorization: Bearer <firebase-id-token>`. Token is cached in memory with expiry; no cookie, no backend session.

### 2. Token Creation & Storage

- **Dashboard:** Token from `auth.currentUser.getIdToken()`; cached in `lib/authFetch.ts` (in-memory). Firebase persists auth state (e.g. localStorage) independently.  
- **Extension:** Token from Firebase REST (exchange + refresh); stored in background memory and `chrome.storage.local` (`auth_idToken`, `auth_refreshToken`, `auth_expiresAtMs`, `auth_user`). Content script does not store tokens; it proxies through background via `echly-api`.  
- **Backend:** Does not create or store tokens; only verifies Bearer token with JWKS and returns 401 when invalid/missing.

### 3. Extension Login Flow

- Extension has its **own** login path: popup or widget “Sign in” → `ECHLY_START_LOGIN` → background → `chrome.identity.launchWebAuthFlow` (Google) → Google ID token → Firebase REST exchange → `setTokenState` + persist to `chrome.storage.local`.  
- No dashboard → extension token handoff.  
- Content script never sees the token; all API calls go through background (`echly-api` or direct fetch in background) with `getValidToken()`.

### 4. Dashboard → Extension Messaging

- **None** in the current codebase.  
- No postMessage from login page; no content script listener for `ECHLY_EXTENSION_LOGIN_SUCCESS` or `ECHLY_DASHBOARD_LOGOUT`; no background handlers for dashboard-originated login/logout messages.

### 5. API Authentication

- **Single mechanism:** `Authorization: Bearer <firebase-id-token>`.  
- **Verification:** `lib/server/auth.ts` → `requireAuth(request)` → extract Bearer token → `verifyIdToken(token)` (jose + Firebase JWKS).  
- All main API routes use `requireAuth(req)`. Cron route uses optional `CRON_SECRET` only.

### 6. Logout Flow

- **Dashboard:** `signOut(auth)` in ProfileCommandPanel only; no API call, no postMessage.  
- **Extension:** No reaction to dashboard logout; tokens remain until refresh fails or user never logged in via extension.  
- **Backend:** Nothing to clear (stateless Bearer).

### 7. Storage Locations

- **Dashboard:** In-memory token cache in `lib/authFetch.ts`; Firebase Auth persistence (browser default).  
- **Extension:** `chrome.storage.local`: `auth_idToken`, `auth_refreshToken`, `auth_expiresAtMs`, `auth_user`, `activeSessionId`, `sessionModeActive`, `sessionPaused`.  
- **Backend:** No auth storage (no session store, no cookie).

### 8. Security Risks (Summary)

- **Dashboard and extension auth are independent:** User can be logged out on dashboard but extension can still call APIs until token expires or refresh fails.  
- **No 401/403 cleanup in extension:** When backend returns 401/403, the extension does not clear stored tokens; it only passes the response to the caller.  
- **Hardcoded API_BASE in extension:** e.g. `http://localhost:3000` in background and contentAuthFetch; production would need a different base.  
- **Firebase config in repo:** `lib/firebase/config.ts` and extension use the same client config; ensure no server/secret keys are exposed.

### 9. Current Limitations

- No single “logout everywhere” or dashboard ↔ extension logout sync.  
- No dashboard → extension login bridge; extension must sign in via its own Google OAuth flow.  
- No cookie/session option; everything is Bearer-only.  
- Extension token lifetime depends on Firebase ID token + refresh; no proactive “session check” endpoint (e.g. GET `/api/auth/session`) used by the extension.  
- Local/dev: extension uses fixed `API_BASE`; dashboard and extension origins are not coordinated for any future postMessage-based bridge.

---

**End of report.** This document reflects the state of the codebase at the time of the audit; any design described in `docs/ECHLY_AUTHENTICATION_AUDIT_REPORT.md` that is not found in the current source (e.g. dashboard postMessage bridge, `clearAuthState` on 401, `/api/auth/logout`) is not implemented in the current architecture.
