# Echly Full Authentication Architecture Report

**Purpose:** Deep architecture audit to prepare for a safe authentication refactor (hybrid cookie + API token).  
**Scope:** Extension ↔ backend communication, auth flows, dashboard auth, session validation, storage, and migration risk.  
**No code was modified;** this document is diagnostic only.

---

## PART 1 — Extension API Call Path

### Search patterns used

- `fetch(`, `axios(`, `authFetch(`, `apiFetch(`, `chrome.runtime.sendMessage(`, `echly-api`

### Findings

| Location | Context | Function / usage | Auth |
|--------|----------|-------------------|------|
| **echly-extension/src/contentAuthFetch.ts** | Content script | `authFetch()`, `apiFetch()` — build request, send `{ type: "echly-api", url, method, headers, body }` to background; no token in content | Proxy via background |
| **echly-extension/src/background.ts** | Background (service worker) | Direct `fetch()` with `Authorization: Bearer ${token}` for: `/api/auth/session`, `/api/feedback`, `/api/sessions`, `/api/upload-screenshot`, `/api/structure-feedback`, `/api/feedback` (POST); plus **echly-api** handler that performs fetch with `getValidToken()` and returns status/headers/body to caller | Bearer from `getValidToken()` |
| **echly-extension/src/api.ts** | Extension (popup/options page with Firebase) | `apiFetch()` — uses `auth.currentUser.getIdToken()` and `fetch(url, { headers: { Authorization: Bearer ${token} } })` | Bearer from Firebase in page |
| **lib/authFetch.ts** | Dashboard (Next.js app) | `authFetch()` — uses `auth.currentUser` + cached id token, `fetch(resolveInput(input), { headers: { Authorization: Bearer ${token} } })` | Bearer from Firebase |
| **components/layout/ProfileCommandPanel.tsx** | Dashboard | `fetch("/api/auth/logout", …)` with Bearer; also `authFetch("/api/insights")` | Bearer / authFetch |
| **lib/hooks/useBillingUsage.ts** | Dashboard | `authFetch("/api/billing/usage")` | authFetch |
| **lib/hooks/usePlanCatalog.ts** | Dashboard | `fetch(CATALOG_API)` (external catalog, no Echly auth) | N/A |
| **app/api/cron/cleanup-temp-screenshots/route.ts** | Server | Reads `Authorization` for Bearer (cron auth) | Bearer |

**Content script API usage (echly-extension/src/content.tsx):**

- All API calls go through `apiFetch()` from `contentAuthFetch.ts` (e.g. `/api/sessions`, `/api/sessions?limit=1`, `/api/structure-feedback`, `/api/feedback`, `/api/tickets/…`, `/api/sessions/${id}`, POST sessions, DELETE tickets). No direct `fetch()` to Echly API from content script.

**Conclusion — Extension API call architecture:**

- **A) Direct `fetch()` from content scripts:** **No.** Content script never attaches a token or calls the Echly API directly.
- **B) Background service worker proxy (`chrome.runtime.sendMessage` → background → `fetch`):** **Yes.** All content-script-originated API calls use `authFetch`/`apiFetch` → message `echly-api` → background resolves token via `getValidToken()`, sets `Authorization: Bearer ${token}`, and performs `fetch`; response (ok, status, headers, body) is returned to content.
- **Summary:** Extension uses **only pattern B** for content script. Background also performs its own direct `fetch()` for session checks, feedback, sessions, upload-screenshot, and structure-feedback, all with Bearer from `getValidToken()`.

---

## PART 2 — Extension Auth Flow

### Files referencing Authorization / Bearer / echlyIdToken / refreshIdToken / getValidToken / ECHLY_GET_TOKEN / ECHLY_GET_AUTH_STATE

| File | References |
|------|------------|
| **echly-extension/src/background.ts** | `ECHLY_TOKEN_KEYS` (echlyIdToken, echlyRefreshToken, echlyTokenTime), `getStoredTokens()`, `refreshIdToken()`, `getValidToken()`, `checkBackendSession()`, `validateSessionWithBackend()`, `clearAuthState()`, `ECHLY_GET_TOKEN`, `ECHLY_GET_AUTH_STATE`, all Bearer usage |
| **echly-extension/src/contentAuthFetch.ts** | Comment: Bearer added in background via ECHLY_GET_TOKEN / getValidToken() |
| **echly-extension/src/api.ts** | Bearer from Firebase id token (for extension pages with Firebase) |
| **lib/server/auth.ts** | `Authorization` header, Bearer extraction, `verifyIdToken()` |
| **lib/authFetch.ts** | `Authorization: Bearer ${token}` |
| **middleware.ts** | `Access-Control-Allow-Headers`: Authorization |
| **components/layout/ProfileCommandPanel.tsx** | `Authorization: Bearer ${token}` for logout |
| **lib/uploadAttachment.ts** | `Authorization: Bearer ${token}` |

### Token management (background.ts) — core functions

**Storage keys:** `echlyIdToken`, `echlyRefreshToken`, `echlyTokenTime` (and legacy: `auth_idToken`, `auth_refreshToken`, `auth_expiresAtMs`, `auth_user`; cleared by `clearAuthState()`).

**getStoredTokens()**  
- `chrome.storage.local.get(["echlyIdToken", "echlyRefreshToken", "echlyTokenTime"])`.  
- Returns `{ idToken, refreshToken, tokenTime }` only if all three present and valid (non-empty strings, number for tokenTime); otherwise `null`.

**refreshIdToken()**  
- Uses stored refresh token; POSTs to `https://securetoken.googleapis.com/v1/token` with `grant_type=refresh_token&refresh_token=...`.  
- On success: `chrome.storage.local.set({ echlyIdToken, echlyRefreshToken, echlyTokenTime: Date.now() })`; returns new id token.  
- Throws `NOT_AUTHENTICATED` on failure.

**getValidToken()**  
- Calls `getStoredTokens()`. If none, throws `NOT_AUTHENTICATED`.  
- If `(Date.now() - tokenTime) > TOKEN_MAX_AGE_MS` (50 min), calls `refreshIdToken()`; else returns stored id token.

**checkBackendSession()**  
- Gets token via `getValidToken()`; on failure returns `{ authenticated: false }`.  
- `fetch(API_BASE + "/api/auth/session", { headers: { Authorization: "Bearer " + token } })`.  
- On 401/403: `clearAuthState()`, return `{ authenticated: false }`.  
- On success: return session JSON (`authenticated`, `user`).

**clearAuthState()**  
- Clears session cache, sets `globalUIState.user = null`, `visible = false`, `expanded = false`, `chrome.storage.local.remove([...ECHLY_TOKEN_KEYS, ...AUTH_STORAGE_KEYS_LEGACY])`, persists UI state, broadcasts.

**Message handlers:**  
- `ECHLY_GET_TOKEN`: async `getValidToken()` → `sendResponse({ token })` or `{ error: "NOT_AUTHENTICATED" }`.  
- `ECHLY_GET_AUTH_STATE`: async `checkBackendSession()` → `sendResponse({ authenticated, user })`.

### Step-by-step extension authentication flow

```
User clicks extension icon
         ↓
Background: chrome.action.onClicked
         ↓
Session cache valid (< 5 min)? ──Yes──→ Toggle tray; then async checkBackendSession() (revalidate)
         ↓ No
authCheckInProgress = true
         ↓
checkBackendSession()
         ↓
getValidToken() ── no tokens / refresh fails ──→ clearAuthState(); open login tab
         ↓ tokens ok
fetch(GET /api/auth/session, Authorization: Bearer <token>)
         ↓ 401/403 → clearAuthState(); open login tab
         ↓ 200
sessionCache = { authenticated: true, checkedAt }; globalUIState.user = session.user
         ↓
Tray visible/expanded; persistUIState(); broadcastUIState()

--- Login path (from login page) ---
Login page (dashboard) → postMessage(ECHLY_PAGE_LOGIN_SUCCESS, { idToken, refreshToken })
         ↓
Content script (ensureLoginCompleteForwarder): origin in DASHBOARD_ORIGINS
         ↓
chrome.runtime.sendMessage(ECHLY_EXTENSION_AUTH_SUCCESS, { idToken, refreshToken })
         ↓
Background: store chrome.storage.local(echlyIdToken, echlyRefreshToken, echlyTokenTime)
         ↓
validateSessionAndOpenTray() → getValidToken() → GET /api/auth/session
         ↓ success
sessionCache = authenticated; globalUIState.user/visible/expanded; switch to origin tab; close login tab if on /login
         ↓
broadcastUIState()
```

---

## PART 3 — Backend Authentication

### lib/server/auth.ts (full)

```ts
import { getAdminAuth } from "@/lib/server/firebaseAdmin";

export interface DecodedIdToken {
  uid: string;
  [key: string]: unknown;
}

export async function verifyIdToken(token: string): Promise<DecodedIdToken> {
  const decoded = await getAdminAuth().verifyIdToken(token, true);
  return { ...decoded, uid: decoded.uid } as DecodedIdToken;
}

export async function requireAuth(request: Request): Promise<DecodedIdToken> {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Response(
      JSON.stringify({ error: "Unauthorized - Missing token" }),
      { status: 401 }
    );
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    return await verifyIdToken(token);
  } catch (error) {
    console.error("Token verification failed:", error);
    throw new Response(
      JSON.stringify({ error: "Unauthorized - Invalid token" }),
      { status: 401 }
    );
  }
}
```

### lib/server/firebaseAdmin.ts (full)

```ts
import { initializeApp, cert, getApps, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let app: App | null = null;

function getApp(): App {
  if (app) return app;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env.local"
    );
  }
  if (!getApps().length) {
    app = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  } else {
    app = getApps()[0] as App;
  }
  return app;
}

export function getAdminAuth() {
  return getAuth(getApp());
}
```

### API routes that call requireAuth or verifyIdToken

| File | Usage |
|------|--------|
| app/api/auth/session/route.ts | GET: requireAuth(req) |
| app/api/auth/logout/route.ts | requireAuth(req) |
| app/api/feedback/route.ts | requireAuth(req) (GET, POST) |
| app/api/feedback/counts/route.ts | requireAuth(req) |
| app/api/insights/route.ts | requireAuth(req) |
| app/api/upload-attachment/route.ts | requireAuth(req) |
| app/api/sessions/route.ts | requireAuth(req) (GET, POST) |
| app/api/sessions/[id]/route.ts | requireAuth(req) (GET, PATCH, DELETE) |
| app/api/workspace/status/route.ts | requireAuth(req) |
| app/api/session-insight/route.ts | requireAuth(req) |
| app/api/tickets/[id]/route.ts | requireAuth(req) (GET, PATCH, DELETE) |
| app/api/structure-feedback/route.ts | requireAuth(req) |
| app/api/billing/usage/route.ts | requireAuth(req) |
| app/api/upload-screenshot/route.ts | requireAuth(req) |
| app/api/admin/update-plan/route.ts | requireAuth(req) |
| lib/server/adminAuth.ts | requireAdmin() calls requireAuth(request) |

**How APIs authenticate:**  
- All protected routes use `requireAuth(request)`, which reads `Authorization` and expects `Bearer <firebase-id-token>`, then calls `verifyIdToken(token)` via Firebase Admin.  
- **Bearer-only:** No cookie or other auth method is implemented; authentication is exclusively via Bearer token in the Authorization header.

---

## PART 4 — Dashboard Auth

### app/(auth)/login/page.tsx (relevant excerpts)

- **Firebase login:** Uses `signInWithGoogle()` and `signInWithEmailPassword()` from `lib/auth/authActions.ts` (Firebase `signInWithPopup` / `signInWithEmailPassword`).  
- **Tokens:** After login, for extension flow (`isExtension === true`): `user.getIdToken()` and `(user as { refreshToken?: string }).refreshToken`; then `window.postMessage({ type: "ECHLY_PAGE_LOGIN_SUCCESS", idToken, refreshToken }, window.location.origin)`. Then redirect to `/dashboard`.  
- **Cookies:** No `Set-Cookie` or cookie-based auth in the login page; auth state is Firebase in-browser (and for extension, postMessage to content script).

### lib/auth/authActions.ts (full)

```ts
import type { User } from "firebase/auth";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export { auth };

export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signInWithEmailPassword(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signUpWithEmailPassword(email: string, password: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
}
```

- **Tokens generated:** By Firebase Auth (id token via `user.getIdToken()`, refresh token on User). Dashboard does not issue its own tokens; it uses Firebase ID tokens for API calls.

### lib/authFetch.ts (full)

- **getCachedIdToken(user):** In-memory cache with expiry from `user.getIdTokenResult().expirationTime` (minus 1 min).  
- **authFetch(input, init):** Requires `auth.currentUser`; gets token via `getCachedIdToken(user)`; sets `headers.set("Authorization", "Bearer " + token)`; then `fetch(resolveInput(input), { headers, ... })`. Optional timeout and 403 handling for WORKSPACE_SUSPENDED.  
- **Cookies:** Not used; all auth to API is Bearer.

### lib/firebase.ts (full)

- Initializes Firebase app with `firebaseConfig`, exports `auth`, `db`, `storage`.  
- On browser: `window.firebase = { auth: () => auth }` for extension page token bridge (e.g. pageTokenBridge.js / EchlyExtensionTokenProvider).

**Summary:**  
- **Firebase login:** signInWithGoogle / signInWithEmailPassword (popup / email-password).  
- **Tokens:** Firebase ID token from `user.getIdToken()`; dashboard uses it in `authFetch` as Bearer; no server-issued tokens.  
- **Cookies:** Not used for authentication; session is effectively Firebase client state + Bearer on each request.

---

## PART 5 — Extension ↔ Dashboard Communication

### postMessage / ECHLY_PAGE_LOGIN_SUCCESS / ECHLY_EXTENSION_AUTH_SUCCESS

**Senders (login success → extension):**

| File | Code |
|------|------|
| app/(auth)/login/page.tsx | When `isExtension` and user exists (onAuthStateChanged or after handleGoogle/handleEmail): `window.postMessage({ type: "ECHLY_PAGE_LOGIN_SUCCESS", idToken, refreshToken }, window.location.origin)` |

**Handlers (page → content → background):**

| File | Role |
|------|------|
| echly-extension/src/content.tsx | `ensureLoginCompleteForwarder()`: `window.addEventListener("message")`; if `event.data.type === "ECHLY_PAGE_LOGIN_SUCCESS"` and `event.origin` in DASHBOARD_ORIGINS, sends `chrome.runtime.sendMessage({ type: "ECHLY_EXTENSION_AUTH_SUCCESS", idToken: event.data.idToken, refreshToken: event.data.refreshToken })`. Also handles `ECHLY_EXTENSION_LOGIN_COMPLETE` (forwards to background). |
| echly-extension/src/background.ts | On `request.type === "ECHLY_EXTENSION_AUTH_SUCCESS"`: validates idToken/refreshToken; stores in chrome.storage.local; calls `validateSessionAndOpenTray()`; responds `{ success: true/false }`. |

**Token request bridge (dashboard → extension):**

| File | Role |
|------|------|
| components/EchlyExtensionTokenProvider.tsx | Listens for `ECHLY_REQUEST_TOKEN`; responds with `window.postMessage({ type: ECHLY_TOKEN_RESPONSE, token }, "*")` from `auth.currentUser.getIdToken()` or null. |
| echly-extension/src/pageTokenBridge.js | Injected on dashboard origins; handshake (ECHLY_BRIDGE_HANDSHAKE / ECHLY_BRIDGE_READY); on ECHLY_REQUEST_TOKEN returns ECHLY_TOKEN_RESPONSE with token from `window.firebase.auth().currentUser.getIdToken()`. |
| echly-extension/src/requestTokenFromPage.ts | Content script: performHandshake then postMessage ECHLY_REQUEST_TOKEN with channel/nonce/source; listens for ECHLY_TOKEN_RESPONSE. |

**Login bridge summary:**  
- **Primary path:** User logs in on dashboard login page with `?extension=true`. Page posts `ECHLY_PAGE_LOGIN_SUCCESS` with idToken and refreshToken. Content script (on same origin) forwards to background via `ECHLY_EXTENSION_AUTH_SUCCESS`. Background stores tokens and validates with GET `/api/auth/session`, then opens tray and switches back to origin tab.  
- **Optional path:** Extension can request a token from a dashboard tab via pageTokenBridge / EchlyExtensionTokenProvider (ECHLY_REQUEST_TOKEN → ECHLY_TOKEN_RESPONSE). Current icon-click flow uses **stored tokens** and does not depend on this for the first auth check; the bridge is available for token-from-page flows.

---

## PART 6 — Session Validation

### Callers of /api/auth/session

| Caller | File | Code / purpose |
|--------|------|----------------|
| Background | echly-extension/src/background.ts | `checkBackendSession()`: GET `/api/auth/session` with Bearer to decide if user is authenticated; used on icon click and for ECHLY_GET_AUTH_STATE. |
| Background | echly-extension/src/background.ts | `validateSessionWithBackend(token)`: GET `/api/auth/session` (deprecated path, same idea). |
| Background | echly-extension/src/background.ts | `validateSessionAndOpenTray()`: after storing tokens from ECHLY_EXTENSION_AUTH_SUCCESS, GET `/api/auth/session` to confirm and open tray. |
| Background | echly-extension/src/background.ts | `prewarmSessionFromStorage()`: on startup/install, GET `/api/auth/session` to prefill session cache. |

**Dashboard:** No callers of `/api/auth/session` in the app; dashboard relies on Firebase `onAuthStateChanged` and `auth.currentUser` for “am I logged in?” and uses other APIs (with requireAuth) for data.

**When session checks occur:**  
- Extension icon click (and when answering ECHLY_GET_AUTH_STATE).  
- After login handoff (ECHLY_EXTENSION_AUTH_SUCCESS) before opening tray.  
- On extension startup/install (prewarm).  

**Who relies on them:**  
- Extension background only. Content script and UI get “authenticated” only via global state broadcast from background (which is updated after these session checks). No component in the dashboard or extension directly calls `/api/auth/session`.

---

## PART 7 — Extension Storage

### chrome.storage.local — all usages

**Auth tokens (read/write/clear):**

| Location | Operation | Keys |
|----------|-----------|------|
| background.ts getStoredTokens | get | echlyIdToken, echlyRefreshToken, echlyTokenTime |
| background.ts clearAuthState | remove | ECHLY_TOKEN_KEYS + AUTH_STORAGE_KEYS_LEGACY |
| background.ts refreshIdToken | set | echlyIdToken, echlyRefreshToken, echlyTokenTime |
| background.ts ECHLY_EXTENSION_AUTH_SUCCESS handler | set | echlyIdToken, echlyRefreshToken, echlyTokenTime |

**Other state:**

| Location | Keys | Purpose |
|----------|------|---------|
| background.ts initializeSessionState | get | activeSessionId, sessionModeActive, sessionPaused, trayVisible, trayExpanded |
| background.ts persistUIState | set | trayVisible, trayExpanded |
| background.ts persistSessionLifecycleState / ECHLY_SET_ACTIVE_SESSION / ECHLY_SESSION_MODE_* / endSessionFromIdle | set | activeSessionId, sessionModeActive, sessionPaused |

**Token lifecycle in the extension:**  
1. **Write:** On `ECHLY_EXTENSION_AUTH_SUCCESS` (idToken, refreshToken from login page) and in `refreshIdToken()` after a successful Firebase securetoken refresh.  
2. **Read:** In `getStoredTokens()` used by `getValidToken()` and thus by every API call and session check.  
3. **Refresh:** When token age &gt; 50 min, `getValidToken()` calls `refreshIdToken()` which POSTs to Firebase and writes new tokens to storage.  
4. **Clear:** On 401/403 from any API (including GET `/api/auth/session`) or on `NOT_AUTHENTICATED` in echly-api handler, `clearAuthState()` removes token keys and legacy auth keys.

---

## PART 8 — Cookie Usage

**Search:** `Set-Cookie`, `cookies(`, `__session` across the repo (ts/tsx/js) → **no matches**.

**Conclusion:**  
- **Cookies are not used for authentication** in the current codebase.  
- **Backend does not support session cookies;** all auth is via `Authorization: Bearer <token>` and `requireAuth` / `verifyIdToken`.

---

## PART 9 — API Security Model Summary

| Layer | Current method |
|-------|----------------|
| **Backend API authentication** | `requireAuth(req)` → read `Authorization: Bearer <firebase-id-token>` → `verifyIdToken(token)` (Firebase Admin). No cookie, no alternate header. |
| **Extension authentication** | Tokens in `chrome.storage.local` (echlyIdToken, echlyRefreshToken, echlyTokenTime). Background: `getValidToken()` (storage + refresh when &gt; 50 min) → Bearer on every request. Content script: no token; all API via `echly-api` → background adds Bearer. Session validity: GET `/api/auth/session` with Bearer. |
| **Dashboard authentication** | Firebase Auth in browser; `auth.currentUser`; id token from `user.getIdToken()` (cached in authFetch); every API call via `authFetch` with `Authorization: Bearer ${token}`. |

**Interaction:**  
- Dashboard and extension both use the same backend and same contract: Bearer Firebase ID token.  
- Backend does not distinguish “dashboard” vs “extension”; it only validates the token.  
- Extension gets tokens either from the login page (postMessage) or from its own refresh; dashboard always gets token from Firebase in the page.  
- No cookies, no session cookie, no CSRF layer for API.

---

## PART 10 — Migration Risk Assessment

**1. Would cookie authentication work with the current extension API architecture?**  
- **Not without changes.** Today all requests from the extension go through the background script (either direct fetch or echly-api). The background runs in a service worker context and does not share the browser’s cookie jar with a specific origin in the same way a page does. So “cookie authentication” in the sense of the dashboard sending cookies with same-origin requests would not automatically apply to extension-originated requests. To use cookies for the extension you would need either: (a) the extension to send requests in a context that sends cookies (e.g. a content script on the dashboard origin using `fetch(..., { credentials: 'include' })` and the backend setting and accepting a session cookie), or (b) the backend to accept both cookie and Bearer so the extension keeps using Bearer while the dashboard uses cookies.

**2. Would extension requests support `credentials: "include"`?**  
- **Content script:** A content script running on the dashboard origin could use `fetch(url, { credentials: "include" })` for same-origin API calls and would send cookies for that origin. Today the extension does not do that; it proxies through the background with Bearer.  
- **Background:** In a service worker, `fetch()` from the extension origin does not send cookies of the Echly web origin. So background-originated requests would not send dashboard session cookies.  
- **Summary:** Only if API calls were made from a dashboard page (or content script on dashboard) with `credentials: "include"` would cookies be sent. Current extension flow does not use credentials include.

**3. Would any APIs break if Authorization headers were removed?**  
- **Yes.** Every protected route uses `requireAuth(request)`, which only looks at `Authorization: Bearer ...`. If the backend continued to accept only Bearer and clients stopped sending it, all those requests would get 401. To support cookie-only or hybrid auth, the backend would need to be changed to accept session cookies (e.g. read a cookie and validate session) in addition to or instead of Bearer, and clients would need to be updated accordingly (dashboard send cookies; extension either send cookies from a context that has them or keep sending Bearer).

**4. What parts of the extension depend on token refresh logic?**  
- **getValidToken()** — used by: checkBackendSession, validateSessionAndOpenTray, prewarmSessionFromStorage, ECHLY_GET_TOKEN, ECHLY_SET_ACTIVE_SESSION (feedback + sessions fetch), ECHLY_UPLOAD_SCREENSHOT, ECHLY_PROCESS_FEEDBACK (structure-feedback + feedback POST), echly-api handler, and initializeSessionState (feedback fetch).  
- **refreshIdToken()** — called only from getValidToken() when token age &gt; 50 min.  
- **getStoredTokens()** — used by getValidToken() and refreshIdToken().  
- So: **all** extension API and session checks depend on the stored tokens and refresh path. Removing or changing token storage/refresh would require a replacement way for the background to get a valid credential (e.g. cookie-based request from a dashboard context, or a new token endpoint that sets a cookie and returns a short-lived token for the extension).

---

## OUTPUT — Consolidated Summary

- **Extension API call architecture:** Content script uses only the background proxy (`echly-api`); no direct fetch to Echly API from content. Background performs all fetches with Bearer from `getValidToken()`.  
- **Extension auth lifecycle:** Tokens stored in chrome.storage.local (echlyIdToken, echlyRefreshToken, echlyTokenTime); refresh at 50 min via Firebase securetoken; session validity via GET `/api/auth/session`; 401/403 anywhere trigger clearAuthState. Login: dashboard postMessage → content → ECHLY_EXTENSION_AUTH_SUCCESS → background store + validateSessionAndOpenTray.  
- **Backend auth model:** Bearer-only; requireAuth + verifyIdToken (Firebase Admin); no cookies.  
- **Dashboard auth model:** Firebase Auth; id token via getCachedIdToken in authFetch; Bearer on every API call; no cookies.  
- **Extension storage:** Token keys and session/tray state in chrome.storage.local; token lifecycle as above.  
- **Login bridge:** Dashboard login page posts ECHLY_PAGE_LOGIN_SUCCESS; content script forwards ECHLY_EXTENSION_AUTH_SUCCESS to background; optional token-from-page via ECHLY_REQUEST_TOKEN / pageTokenBridge / EchlyExtensionTokenProvider.  
- **Migration risk:** Cookie auth would require backend and client changes; extension does not currently use credentials include; removing Authorization would break all protected APIs; entire extension auth depends on token storage and refresh.

---

*End of report. No code was modified.*
