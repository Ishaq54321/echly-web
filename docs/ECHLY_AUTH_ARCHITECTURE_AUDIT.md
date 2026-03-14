# Echly Authentication Architecture Audit

**Document type:** Read-only architecture audit  
**Scope:** Dashboard, Chrome extension, Firebase, backend API, logout, token storage, session validation  
**No code was modified.**

---

## SECTION 1 — Dashboard Login Flow

### Login page

- **Location:** `app/(auth)/login/page.tsx`
- **Entry:** User visits `/login` (or is redirected by `useAuthGuard` when unauthenticated).

### Login API calls

- The dashboard does **not** call a custom login API. Authentication is performed entirely via **Firebase Auth** in the browser.
- **Functions used:** `signInWithGoogle()` and `signInWithEmailPassword()` from `lib/auth/authActions.ts`, which call Firebase `signInWithPopup(auth, provider)` and `signInWithEmailAndPassword(auth, email, password)`.

### Firebase auth initialization

- **Web app:** `lib/firebase.ts` initializes the Firebase app with `firebaseConfig` from `lib/firebase/config.ts` and exports `auth` via `getAuth(app)` from `firebase/auth`.
- **Config:** `lib/firebase/config.ts` exports a single `firebaseConfig` object (apiKey, authDomain, projectId, etc.) shared by the web app; the extension imports the same config from `lib/firebase/config.ts`.

### Token creation

- Firebase Auth creates and manages tokens. The dashboard does not explicitly “create” tokens; after `signInWithPopup` or `signInWithEmailAndPassword`, Firebase sets `auth.currentUser` and provides `user.getIdToken()` for ID tokens.
- **Token type:** Firebase **ID token** (JWT). No session cookie or custom backend session is created at login.

### What triggers login

1. User opens `/login` (direct or redirect from `useAuthGuard` when `auth.currentUser` is null).
2. User clicks “Continue with Google” → `handleGoogle()` → `signInWithGoogle()`.
3. Or user submits email/password form → `handleEmail()` → `signInWithEmailPassword()`.
4. On success, `checkUserWorkspace(user.uid)` is called (`lib/auth/checkUserWorkspace.ts`) to decide redirect: `dashboard` or `onboarding`.
5. If query param `extension=true` and valid `returnUrl`, the page redirects to `returnUrl` instead of dashboard/onboarding (for extension-initiated login flow).

### Firebase functions used

- `signInWithPopup(auth, GoogleAuthProvider)` (Google).
- `signInWithEmailAndPassword(auth, email, password)` (email/password).
- `createUserWithEmailAndPassword` (sign-up, exported in authActions but sign-up is a separate flow).

### What login returns

- **ID token / session cookie:** Login returns a **Firebase User** object; the actual **ID token** is obtained on demand via `user.getIdToken()` (used by `lib/authFetch.ts` for API calls). There is **no** session cookie set by the app; auth is token-based (Bearer).

### Where tokens are stored (dashboard)

- **Memory only.** The dashboard does not persist the ID token to `localStorage` or cookies. Firebase Auth keeps state in memory (and in IndexedDB for persistence across reloads, as per Firebase SDK behavior). Token is read when needed via `auth.currentUser.getIdToken()` in `lib/authFetch.ts`, with an in-memory cache (`cachedToken`, `tokenExpiry`) and expiry derived from `user.getIdTokenResult().expirationTime` (with ~1 minute buffer).

### Login flow diagram (dashboard)

```
User visits /login (or redirected by useAuthGuard)
        ↓
Click "Continue with Google" or submit email/password
        ↓
signInWithGoogle() / signInWithEmailPassword() [Firebase Auth]
        ↓
Firebase sets auth.currentUser (token available via getIdToken())
        ↓
checkUserWorkspace(uid) → "dashboard" | "onboarding"
        ↓
router.replace("/dashboard" | "/onboarding")
   OR if extension=true & returnUrl → window.location.href = returnUrl
```

---

## SECTION 2 — Dashboard Logout Flow

### Where logout occurs

- **Location:** `components/layout/ProfileCommandPanel.tsx`
- **Handler:** `handleSignOut` (e.g. “Sign out” button) calls `signOut(auth)` from `firebase/auth`, then `onClose()`.

### What happens when the user logs out

1. `signOut(auth)` is invoked (Firebase `signOut`).
2. Firebase clears the in-browser auth state: `auth.currentUser` becomes null, and Firebase’s internal persistence (e.g. IndexedDB) is cleared for that app instance.
3. The panel closes. There is no explicit redirect in this component; the app typically relies on `useAuthGuard` (e.g. in app layout) which subscribes to `onAuthStateChanged(auth, ...)`. When the user becomes null, that hook can call `clearAuthTokenCache()` and `router.replace("/login")` or `router.push("/login")`.

### Which tokens are cleared

- **Dashboard:** Firebase signOut clears the Firebase Auth state. The in-memory token cache in `lib/authFetch.ts` (`cachedToken`, `tokenExpiry`) is cleared only when `useAuthGuard` runs its callback for `currentUser == null`, which calls `clearAuthTokenCache()`.

### Whether cookies are removed

- The app does not set auth cookies. No explicit cookie removal is performed on logout; logout is purely Firebase signOut + clearing the dashboard’s token cache when the auth state listener fires.

### Whether backend session is invalidated

- There is **no** server-side session to invalidate. The backend does not issue or store sessions; it validates the **Firebase ID token** on each request via `Authorization: Bearer <token>`. Logout only removes the client’s ability to obtain a valid token; the backend does not maintain a logout/session-revocation list, so a token remains valid until it expires (typically ~1 hour) or is refreshed.

### Logout pipeline (dashboard)

```
User clicks "Sign out" in ProfileCommandPanel
        ↓
signOut(auth) [Firebase]
        ↓
Firebase sets auth.currentUser = null, clears persistence
        ↓
onAuthStateChanged(auth, ...) fires in useAuthGuard
        ↓
clearAuthTokenCache() (lib/authFetch.ts)
        ↓
router.replace("/login") or router.push("/login")
```

---

## SECTION 3 — Firebase Configuration

### Location

- **Config:** `lib/firebase/config.ts` — single export `firebaseConfig` (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId, measurementId).
- **Web app init:** `lib/firebase.ts` — `initializeApp(firebaseConfig)`, `getAuth(app)`, `getFirestore(app)`, `getStorage(app)` from `firebase/auth`, `firebase/firestore`, `firebase/storage`.
- **Extension init:** `echly-extension/src/firebase.ts` — same `firebaseConfig`, but `getAuth` from `firebase/auth/web-extension`; also Firestore and Storage.

### Firebase auth provider

- **Google:** `GoogleAuthProvider` (dashboard: popup; extension: `chrome.identity.launchWebAuthFlow` with `response_type=id_token`).
- **Email/password:** Firebase Email/Password (dashboard only).

### Token type

- **ID token** (JWT) from Firebase. No session cookie is used for API auth.

### Refresh behavior

- **Dashboard:** Token is obtained via `auth.currentUser.getIdToken()`; Firebase SDK handles refresh. `lib/authFetch.ts` caches the token and refreshes when expired (using `getIdTokenResult().expirationTime` with a 60-second buffer).
- **Extension:** Background script stores `idToken` and `refreshToken` in `chrome.storage.local` and refreshes via Google’s `securetoken.googleapis.com/v1/token` (grant_type=refresh_token). See Section 5.

### How tokens are accessed in the frontend

- **Dashboard:** `auth.currentUser` → `getCachedIdToken(user)` in `lib/authFetch.ts` → `user.getIdToken()` and `user.getIdTokenResult()`; result is sent as `Authorization: Bearer <token>` on each `authFetch()` request.

---

## SECTION 4 — Backend Authentication

### API routes and auth

- **Middleware:** `middleware.ts` does **not** verify tokens. It only adds CORS headers for `/api/*` and passes through; admin routes are gated in `app/admin/layout.tsx` via `/api/admin/me`.
- **Per-route auth:** Protected API routes call `requireAuth(request)` from `lib/server/auth.ts`, which reads `Authorization: Bearer <token>`, extracts the token, and verifies it with `verifyIdToken(token)`.

### Token verification

- **File:** `lib/server/auth.ts`
- **Method:** `verifyIdToken(token)` uses `jose`: `jwtVerify(token, JWKS, { issuer, audience })` against Firebase’s JWKS (`https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com`). Project ID `echly-b74cc` is used for issuer and audience.
- **Result:** `DecodedIdToken` with `uid` (from `payload.sub` or `payload.user_id`). On failure, `requireAuth` throws a 401 Response.

### How API requests authenticate

- **Mechanism:** **Authorization header only.** No cookies. Clients send `Authorization: Bearer <firebase-id-token>`.
- **Routes using requireAuth (examples):** `app/api/feedback/route.ts`, `app/api/sessions/route.ts`, `app/api/upload-screenshot/route.ts`, `app/api/upload-attachment/route.ts`, `app/api/structure-feedback/route.ts`, `app/api/tickets/[id]/route.ts`, `app/api/insights/route.ts`, `app/api/billing/usage/route.ts`, `app/api/workspace/status/route.ts`, and others. Each handler calls `const user = await requireAuth(req)` (or similar) and uses `user.uid`.

### API authentication flow

```
Client request with Authorization: Bearer <id-token>
        ↓
Route handler calls requireAuth(request)
        ↓
requireAuth reads header, extracts token, calls verifyIdToken(token)
        ↓
jwtVerify(token, JWKS, { issuer, audience }) [Firebase JWKS]
        ↓
Success → return DecodedIdToken { uid, ... }; handler uses user.uid
Failure → throw 401 Response
```

---

## SECTION 5 — Extension Authentication

### Files

- **background:** `echly-extension/src/background.ts` — central auth and token handling; content scripts do not use Firebase directly.
- **auth:** `echly-extension/src/auth.ts` — Firebase Auth in extension context (signInWithCredential, signOut, onAuthStateChanged) using `firebase/auth/web-extension`; used for in-extension Google sign-in flow.
- **contentAuthFetch:** `echly-extension/src/contentAuthFetch.ts` — content script sends `{ type: "echly-api", url, method, headers, body }` to background; background adds Bearer token and performs fetch.
- **firebase:** `echly-extension/src/firebase.ts` — initializes Firebase with same config; exports `auth`, `db`, `storage` for extension.

### getAuthState

- **Location:** `echly-extension/src/background.ts` (async function).
- **Behavior:** Reads from `chrome.storage.local` (`auth_idToken`, `auth_refreshToken`, `auth_expiresAtMs`, `auth_user`), syncs to in-memory `tokenState`. If no `refreshToken`, returns `{ authenticated: false, user: null }`. Otherwise gets a valid token via `getValidToken()`, then calls `validateSessionWithBackend(token)` (GET `/api/auth/session` with Bearer). On 401/403 (or network error), calls `clearAuthState()` and returns not authenticated; otherwise returns `{ authenticated: true, user: tokenState.user }`.

### getValidToken

- **Location:** `echly-extension/src/background.ts`.
- **Behavior:** If current `idToken` exists and `now < expiresAtMs - 30_000`, returns it. Else if no `refreshToken`, throws `NOT_AUTHENTICATED`. Otherwise calls `refreshIdToken(refreshToken)` (POST to `securetoken.googleapis.com/v1/token`), updates `tokenState` and `chrome.storage.local`, returns new idToken.

### Token refresh

- Implemented in background: `refreshIdToken(refreshToken)` uses Firebase REST (`grant_type=refresh_token`); result (`id_token`, `refresh_token`, `expires_in`) is stored and used for subsequent `getValidToken()`.

### chrome.storage.local usage

- **Keys:** `auth_idToken`, `auth_refreshToken`, `auth_expiresAtMs`, `auth_user` (and session/tray state: `activeSessionId`, `sessionModeActive`, `sessionPaused`, `trayVisible`, `trayExpanded`).
- **Read:** On startup and in `getAuthState()` to populate `tokenState`.
- **Write:** In `setTokenState()` when tokens are set or refreshed; in `clearAuthState()` these keys are removed.

### Where extension tokens are stored

- **chrome.storage.local** (keys above). In-memory `tokenState` in the background script is the working copy.

### How the extension determines “authenticated”

- Only when **getAuthState()** returns `authenticated: true`, which requires: (1) stored refresh token, (2) successful `getValidToken()`, and (3) successful **validateSessionWithBackend(token)** (GET `/api/auth/session` returns non-401/403). Stored tokens alone are not sufficient; backend validation is required for “authenticated.”

---

## SECTION 6 — Extension Login Flow

### Two distinct flows

1. **Extension icon / “Sign in” from extension** → opens **web** login page; after web login, user is redirected (e.g. returnUrl). The **extension does not receive** the web login token; extension storage is not updated by the web page. So after this flow, the extension remains unauthenticated until the user completes the in-extension flow below.
2. **In-extension Google OAuth** → background uses `chrome.identity.launchWebAuthFlow`; token is exchanged and stored in the extension; extension becomes authenticated.

### In-extension login pipeline (the one that sets extension auth)

1. **Trigger:** Message `ECHLY_SIGN_IN`, `ECHLY_START_LOGIN`, or `LOGIN` to background; or user not authenticated when clicking icon and then choosing in-extension login (if offered). Icon click when not authenticated opens **web** login (see below).
2. **Google OAuth:** Background builds URL: `https://accounts.google.com/o/oauth2/v2/auth?client_id=...&response_type=id_token&redirect_uri=<chrome.identity.getRedirectURL()>&scope=openid%20email%20profile&nonce=...`.
3. **chrome.identity.launchWebAuthFlow:** `{ url: authUrl, interactive: true }` → user signs in with Google; callback receives `responseUrl` with hash fragment.
4. **Extract id_token:** `parseHashParam(responseUrl, "id_token")` from the hash.
5. **Firebase token exchange:** `exchangeGoogleIdToken(googleIdToken)` — POST to `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=<API_KEY>` with body `{ postBody: "id_token=...&providerId=google.com", requestUri: "http://localhost", returnIdpCredential: true, returnSecureToken: true }`. Response contains Firebase `idToken`, `refreshToken`, `expiresIn`, and user fields (`localId`, `displayName`, `email`, `photoUrl`).
6. **Save token:** `setTokenState({ idToken, refreshToken, expiresAtMs, user })` → persisted to `chrome.storage.local` and in-memory `tokenState`.
7. **Response:** `sendResponse({ success: true, user })`.

### Extension icon when not authenticated

- **Background** `chrome.action.onClicked`: calls `getAuthState()`. If not authenticated, opens a new tab to `ECHLY_LOGIN_BASE` (e.g. `https://echly-web.vercel.app/login?extension=true&returnUrl=<current_tab_url>`). No token is passed from that tab back to the extension; the extension stays unauthenticated until the user completes the in-extension OAuth flow (e.g. if the UI offered a “Sign in with Google” that sends `ECHLY_SIGN_IN`).

### Full pipeline (in-extension login)

```
User triggers ECHLY_SIGN_IN / ECHLY_START_LOGIN / LOGIN (or equivalent)
        ↓
Background: build Google OAuth URL (response_type=id_token, redirect_uri=chrome.identity.getRedirectURL())
        ↓
chrome.identity.launchWebAuthFlow({ url, interactive: true })
        ↓
User signs in with Google → redirect to extension with #id_token=...
        ↓
Background: parseHashParam(responseUrl, "id_token")
        ↓
exchangeGoogleIdToken(googleIdToken) → POST identitytoolkit.googleapis.com/.../signInWithIdp
        ↓
Receive Firebase idToken, refreshToken, expiresIn, user
        ↓
setTokenState(...) → chrome.storage.local + in-memory tokenState
        ↓
Extension is authenticated (getAuthState() will pass after validateSessionWithBackend)
```

---

## SECTION 7 — Extension Logout Behavior

### What happens if the user logs out of the dashboard

- **Dashboard:** Firebase `signOut(auth)`; dashboard loses token and redirects to login. No call is made to the extension.
- **Extension:** The extension is not notified of dashboard logout. Its `chrome.storage.local` and in-memory `tokenState` are unchanged. The extension continues to consider the user authenticated until: (1) it calls `getAuthState()` and `validateSessionWithBackend(token)` returns false (401/403), or (2) an API request (e.g. `echly-api`, feedback, upload) returns 401/403 and the background calls `clearAuthState()`.

### Whether the extension detects logout

- **Not proactively.** It detects “invalid session” only when it uses the token: (1) on **getAuthState()** (e.g. icon click) via GET `/api/auth/session`, or (2) on any API request that returns 401/403, which triggers `clearAuthState()`. So detection is **on next use**, not at the moment the user signs out on the dashboard.

### Whether tokens remain valid in extension storage

- Yes. Firebase ID tokens remain valid until expiry (~1 hour). Refresh token remains valid until revoked (e.g. password change, account disable). So after dashboard logout, the extension’s stored tokens are still valid for the backend until they expire or a 401/403 occurs for another reason. The backend does not revoke tokens on logout.

### When the extension invalidates tokens

- When **clearAuthState()** is called: (1) after `validateSessionWithBackend(token)` returns false (401/403 from GET `/api/auth/session`), (2) after any API request returns 401/403 (echly-api, SET_ACTIVE_SESSION, upload-screenshot, structure-feedback, feedback create, etc.), or (3) on startup when tokens are loaded and validation with backend fails.

### Shared auth state (dashboard vs extension)

- **Not shared.** Dashboard uses Firebase Auth in the browser (memory/IndexedDB); extension uses its own token store in `chrome.storage.local` and Firebase REST for refresh. Logging out on the dashboard does not clear the extension; the extension only learns about invalidity when it hits the backend with the token and gets 401/403 (or when `/api/auth/session` returns 401/403). Until then, the extension can still use the same user’s valid tokens.

---

## SECTION 8 — Token Storage Map

| Location    | Token type        | Storage                                      |
|------------|-------------------|----------------------------------------------|
| Dashboard  | Firebase ID token | Memory (auth.currentUser + getIdToken()); in-memory cache in authFetch (cachedToken, tokenExpiry). Firebase may persist to IndexedDB. |
| Extension  | Firebase ID token | chrome.storage.local (auth_idToken, auth_refreshToken, auth_expiresAtMs, auth_user); in-memory tokenState in background. |
| Backend    | None stored       | Request context only: requireAuth() decodes JWT and uses DecodedIdToken (e.g. uid) for the request. No server-side session or token store. |

---

## SECTION 9 — Session Validation

### Endpoint referenced by extension: GET /api/auth/session

- The extension’s **validateSessionWithBackend(token)** calls **GET `${API_BASE}/api/auth/session`** with `Authorization: Bearer <token>`.
- **Finding:** There is **no** route handler for **`/api/auth/session`** in the codebase under `app/api/`. No file at `app/api/auth/session/route.ts` or equivalent was found.
- **Implication:** The request likely returns **404**. In `validateSessionWithBackend`, only **401** and **403** are treated as invalid (`return false`). A **404** would therefore be treated as **valid** (`return true`), so session validation would always “succeed” for the extension as long as the token is present and not explicitly 401/403. This is a session-validation gap.

### Other endpoints that validate auth

- **GET /api/workspace/status** — uses `requireAuth(req)`; returns `{ suspended: boolean }`. Validates token and workspace.
- **GET /api/admin/me** — uses `requireAdmin(req)`; returns `{ isAdmin: true }` or `{ isAdmin: false }`. Not a general “session” or “me” endpoint.
- All protected API routes use `requireAuth(request)` and thus validate the Bearer token; there is no dedicated “session” or “me” endpoint that returns current user info in the audited code.

### If /api/auth/session existed (intended behavior)

- Expected: accept `Authorization: Bearer <token>`, call `requireAuth(req)` (or equivalent), return 200 with some body (e.g. `{ ok: true }` or user info). 401/403 when token is missing or invalid. The extension uses this only to decide “valid session” (true/false), not to parse a response shape.

---

## SECTION 10 — Login Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER LOGIN                                        │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         ├─── DASHBOARD
         │         │
         │         ▼
         │    Firebase Auth (signInWithPopup / signInWithEmailAndPassword)
         │         │
         │         ▼
         │    auth.currentUser set; ID token via getIdToken()
         │         │
         │         ▼
         │    Token in memory (authFetch cache); no cookie
         │         │
         │         ▼
         │    API requests: authFetch() → Authorization: Bearer <idToken>
         │         │
         │         ▼
         │    Backend: requireAuth(req) → verifyIdToken() → request context (uid)
         │
         └─── EXTENSION (in-extension login only; web login does not set extension token)
                   │
                   ▼
              chrome.identity.launchWebAuthFlow (Google id_token)
                   │
                   ▼
              exchangeGoogleIdToken → Firebase idToken + refreshToken
                   │
                   ▼
              chrome.storage.local (auth_*) + in-memory tokenState
                   │
                   ▼
              getValidToken() → refresh if needed (securetoken.googleapis.com)
                   │
                   ▼
              Content: echly-api → background adds Bearer token → fetch API
                   │
                   ▼
              Backend: requireAuth(req) → verifyIdToken() → request context (uid)
```

---

## SECTION 11 — Logout Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DASHBOARD LOGOUT                                       │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
    signOut(auth) [Firebase]
         │
         ▼
    auth.currentUser = null; Firebase clears persistence
         │
         ▼
    onAuthStateChanged fires → useAuthGuard: clearAuthTokenCache(); redirect to /login
         │
         ▼
    No server-side session invalidated (backend is stateless; no revocation)
         │
         │
         │   EFFECT ON EXTENSION
         │   ─────────────────
         │   • Extension is not notified.
         │   • chrome.storage.local tokens unchanged.
         │   • Extension still has valid ID/refresh token until expiry or 401/403.
         │   • Extension “detects” logout only when:
         │     - getAuthState() runs and validateSessionWithBackend() gets 401/403, or
         │     - Any API call returns 401/403 → clearAuthState().
         │
         │   EFFECT ON BACKEND
         │   ─────────────────
         │   • None. Backend does not track sessions or logout.
         │   • Any existing token remains valid until it expires or is rejected by Firebase.
```

---

## SECTION 12 — Security Observations

The following are observations only; no fixes are recommended in this audit.

1. **Token duplication:** The same user can have two active “sessions”: one in the dashboard (Firebase in-browser) and one in the extension (chrome.storage.local). Logging out on the dashboard does not revoke or clear the extension’s tokens.
2. **Extension may trust stale tokens:** Until the extension hits an endpoint that returns 401/403 (or until getAuthState() runs and `/api/auth/session` returns 401/403), it continues to use stored tokens. If `/api/auth/session` is missing and returns 404, the extension treats the session as valid, so it may trust a token that the dashboard has “logged out” for longer than intended.
3. **Auth drift between dashboard and extension:** Dashboard and extension do not share auth state. Logout in one place does not immediately invalidate the other. Extension auth is only invalidated on 401/403 from the backend or when getAuthState() gets 401/403 from the session endpoint.
4. **Session validation gap:** The extension calls GET `/api/auth/session` for validation, but this route was not found in the codebase. If the route is missing, 404 is treated as success, so the extension’s “session check” does not actually validate against the backend for that request.
5. **No server-side revocation:** Backend does not maintain a blocklist or session store. A stolen or copied token is valid until it expires (or Firebase revokes it), regardless of user logout.
6. **Web login with extension=true does not authenticate extension:** When the user is sent to the web login with `?extension=true&returnUrl=...`, completing login only authenticates the web app and redirects. The extension never receives the token and remains unauthenticated; users may expect the extension to be logged in after that flow.
7. **CORS and middleware:** Middleware allows `Authorization` and adds CORS for `/api/*` but does not perform auth; auth is per-route. This is consistent but means there is no single choke point for token validation.
8. **Token in extension storage:** Tokens in chrome.storage.local are accessible to the extension only; they are not encrypted beyond the browser’s storage. Compromise of the machine could expose tokens until they expire or are cleared.

---

**End of audit.**
