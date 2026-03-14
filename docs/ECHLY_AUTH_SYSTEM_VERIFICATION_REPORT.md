# Echly Authentication System Verification Report

**Audit type:** READ-ONLY security and architecture verification (post-refactor)  
**Scope:** Dashboard authentication, extension authentication, token bridge, backend session validation, token storage, logout propagation, token exchange security  
**No code was modified.**

---

## SECTION 1 — Dashboard Authentication

### 1.1 Locations Inspected

| Location | Purpose |
|----------|---------|
| `app/(auth)/login/page.tsx` | Login page UI and handlers |
| `lib/firebase.ts` | Firebase app and auth initialization; exposes `window.firebase.auth()` for bridge |
| `lib/authFetch.ts` | Token retrieval, cache, and API requests with Bearer header |
| `lib/auth/authActions.ts` | `signInWithGoogle`, `signInWithEmailPassword`, `signUpWithEmailPassword` |
| `lib/auth/checkUserWorkspace.ts` | Post-login redirect (dashboard vs onboarding) |
| `lib/hooks/useAuthGuard.ts` | Auth state subscription and redirect when unauthenticated |

### 1.2 How Users Authenticate

- **Google:** `signInWithGoogle()` in `lib/auth/authActions.ts` uses `signInWithPopup(auth, new GoogleAuthProvider())`.
- **Email/password:** `signInWithEmailPassword(email, password)` uses Firebase `signInWithEmailAndPassword(auth, email, password)`.

Login page (`app/(auth)/login/page.tsx`) calls these from `handleGoogle` and `handleEmail`. After success it calls `checkUserWorkspace(user.uid)` and redirects to `/dashboard` or `/onboarding`. For extension flow (`?extension=true&returnUrl=...`) it may redirect to `returnUrl` instead.

### 1.3 Firebase Auth Initialization

- **`lib/firebase.ts`:**  
  - `initializeApp(firebaseConfig)` from `lib/firebase/config.ts`.  
  - `getAuth(app)` → single `auth` instance.  
  - In browser only: `window.firebase = { auth: () => auth }` so the injected page bridge can call `window.firebase.auth().currentUser.getIdToken()`.

### 1.4 How Tokens Are Retrieved (Dashboard)

- **`lib/authFetch.ts`:**  
  - `authFetch()` uses `auth.currentUser`. If null, throws `"User not authenticated"`.  
  - Token from `getCachedIdToken(user)`:  
    - In-memory `cachedToken` and `tokenExpiry` (expiry minus 60s).  
    - If cache valid, returns cached token; else `user.getIdToken()` + `user.getIdTokenResult()` to set cache and return token.  
  - No persistence: token exists only in memory and in Firebase Auth state (e.g. IndexedDB used by Firebase SDK).

### 1.5 Where Tokens Are Stored (Dashboard)

- **Not in localStorage/sessionStorage.**  
- **In-memory:** `cachedToken` and `tokenExpiry` in `lib/authFetch.ts` (module scope).  
- **Firebase Auth:** Session state (and optional IndexedDB) managed by the Firebase SDK; tokens are not explicitly stored by app code.

### 1.6 How API Requests Attach Authorization Headers

- **`authFetch(input, init)`** in `lib/authFetch.ts`:  
  - Gets token via `getCachedIdToken(auth.currentUser)`.  
  - `headers.set("Authorization", "Bearer " + token)`.  
  - Uses `resolveInput(input)` so in extension context `window.__ECHLY_API_BASE__` can override base URL; path-only requests are sent to that base.  
  - All dashboard API calls that need auth use `authFetch()` (or equivalent pattern) and thus attach the Bearer token.

### 1.7 Dashboard Login Pipeline (Summary)

1. User opens `/login` (direct or redirect from `useAuthGuard` when `auth.currentUser` is null).  
2. User signs in via Google popup or email/password using `lib/auth/authActions.ts` (Firebase Auth).  
3. Firebase sets `auth.currentUser`; optional `ensureUserWorkspaceLinkRepo(currentUser)` runs from `useAuthGuard`.  
4. Login page redirects to `/dashboard`, `/onboarding`, or (for extension) `returnUrl`.  
5. Protected routes use `useAuthGuard()`: `onAuthStateChanged(auth, ...)`; if user becomes null, `clearAuthTokenCache()` and `router.replace("/login")` or `router.push("/login")`.  
6. API calls use `authFetch()` → `getCachedIdToken(currentUser)` → `Authorization: Bearer <token>`.

---

## SECTION 2 — Backend Session Validation

### 2.1 Endpoint Inspected

**File:** `app/api/auth/session/route.ts`

### 2.2 Implementation

- **Handler:** `GET` only.  
- **Auth:** Uses `requireAuth(req)` from `@/lib/server/auth`.  
- **Success:** Returns `Response.json({ authenticated: true, user: { uid: user.uid } })` with default 200.  
- **Failure:** On any error from `requireAuth`, returns `Response(JSON.stringify({ authenticated: false }), { status: 401, headers: { "Content-Type": "application/json" } })`.

### 2.3 requireAuth() (lib/server/auth.ts)

- Reads `Authorization` header; must start with `"Bearer "`.  
- Extracts token; calls `verifyIdToken(token)` (Firebase JWKS: `securetoken@system.gserviceaccount.com`, issuer `https://securetoken.google.com/{PROJECT_ID}`, audience = project ID).  
- Returns decoded payload with `uid` (from `sub` or `user_id`); on verification failure throws Response with 401.

### 2.4 Response Structure

- **200 OK (valid session):**  
  `{ "authenticated": true, "user": { "uid": "<firebase-uid>" } }`  
- **401 Unauthorized (missing/invalid token):**  
  `{ "authenticated": false }`  
  `Content-Type: application/json`

---

## SECTION 3 — Extension Authentication

### 3.1 Files Inspected

- `echly-extension/src/background.ts`  
- `echly-extension/src/content.tsx`  
- `echly-extension/src/requestTokenFromPage.ts`  
- `echly-extension/src/pageTokenBridge.js`  
- `echly-extension/src/auth.ts` (legacy)

### 3.2 How the Extension Obtains Tokens

- **No in-extension OAuth.**  
- **Flow:** Background needs a token → sends message `ECHLY_GET_TOKEN_FROM_PAGE` to a tab → content script in that tab runs `requestTokenFromPage()` → content script does `window.postMessage({ channel, type: "ECHLY_REQUEST_TOKEN", nonce }, window.location.origin)` → injected `pageTokenBridge.js` in the page handles it → bridge calls `window.firebase.auth().currentUser.getIdToken()` (only set on dashboard) and replies with `postMessage({ channel, type: "ECHLY_TOKEN_RESPONSE", nonce, token }, event.origin)` → content script listener (matching nonce) gets token and responds to background via `sendResponse({ token })`.  
- **Token source:** Only from a dashboard tab’s page context (Firebase Auth). If no dashboard tab or user not signed in, `getTokenFromPage()` returns null and `getValidToken()` throws `NOT_AUTHENTICATED`.

### 3.3 Whether Tokens Are Stored

- **Not stored for auth.**  
- Background does **not** persist the token. It requests it on demand from a dashboard tab via content script.  
- `chrome.storage.local` is used for: session lifecycle (`activeSessionId`, `sessionModeActive`, `sessionPaused`), tray state (`trayVisible`, `trayExpanded`). No auth token keys are written by the current flow.

### 3.4 Refresh Tokens

- **No refresh tokens in use.**  
- `AUTH_STORAGE_KEYS` in `background.ts` lists `auth_idToken`, `auth_refreshToken`, `auth_expiresAtMs`, `auth_user` only for **cleanup**: `clearAuthState()` removes these legacy keys. No code path writes or reads them for obtaining tokens.  
- Extension does not call Firebase refresh token APIs; it only gets a fresh ID token from the page when needed.

### 3.5 OAuth Flows

- **Not used for current auth.**  
- `echly-extension/src/auth.ts` still defines `signInWithGoogle()` using `chrome.identity.launchWebAuthFlow` and Firebase `signInWithCredential`. This file is **not imported** by `background.ts` or `content.tsx`.  
- On `ECHLY_SIGN_IN`, `ECHLY_START_LOGIN`, or `LOGIN`, background opens the dashboard login URL (`ECHLY_LOGIN_BASE?extension=true&returnUrl=...`) and responds `{ success: false, error: "Use dashboard login" }`.  
- So the extension is **not** performing OAuth; it defers to dashboard login.

### 3.6 chrome.identity

- **Still in manifest:** `permissions` includes `"identity"`; `oauth2` is present.  
- **Not used for auth in code paths:** No `launchWebAuthFlow`, `getRedirectURL`, or token exchange is called for the current token flow.  
- **Conclusion:** Identity permission and oauth2 block are legacy; active auth does not use them.

### 3.7 Statelessness

- Extension does **not** store ID or refresh tokens.  
- Each token need is satisfied by asking a dashboard tab (via content script → page bridge → Firebase on page).  
- Backend session check uses `GET /api/auth/session` with the token; 401/403 leads to `clearAuthState()` (legacy key cleanup only) and opening login.  
- **Verdict:** Extension auth is **stateless** (no persisted auth tokens).

---

## SECTION 4 — Token Bridge Implementation

### 4.1 File

**Injected script:** `echly-extension/src/pageTokenBridge.js` (built/copied as `pageTokenBridge.js` in manifest’s `web_accessible_resources`).

### 4.2 window.postMessage Handshake

- **Listen:** `window.addEventListener("message", ...)`.  
- **Request:** `data.channel === "ECHLY_SECURE_AUTH_CHANNEL"` and `data.type === "ECHLY_REQUEST_TOKEN"`.  
- **Response:** `window.postMessage({ channel, type: "ECHLY_TOKEN_RESPONSE", nonce: data.nonce, token }, origin)` where `origin = event.origin`.

### 4.3 Secure Channel Identifier

- Channel string: `"ECHLY_SECURE_AUTH_CHANNEL"` (matches `ECHLY_TOKEN_CHANNEL` in `tokenBridgeConstants.ts`).  
- Content script sends and expects this channel; bridge only reacts to this channel and type.

### 4.4 Nonce Validation

- Request includes `data.nonce`.  
- Bridge echoes the same `nonce` in the response.  
- Content script in `requestTokenFromPage.ts` only resolves when `data.nonce === nonce` (and channel/type match), so only the requester that sent that nonce accepts the response.  
- **Note:** Nonce ties response to requester; it does not prevent other listeners on the same page from reading the response (see Section 8).

### 4.5 event.origin Usage

- Bridge sets `var origin = event.origin` and uses it as the second argument to `postMessage(..., origin)`.  
- Response is sent **only** to `event.origin`, not to `"*"`.

### 4.6 No "*" in Responses

- Confirmed: there is no `postMessage(..., "*")` in the bridge. All responses use `origin`.

### 4.7 Token Leak via Bridge

- Bridge does not send the token to arbitrary origins; it restricts to `event.origin`.  
- Token can still be observed by any same-origin listener (including other extensions’ content scripts on the same page); see Section 8.

---

## SECTION 5 — Extension Token Request Flow (Full Pipeline)

1. **Extension click** (or any flow needing a token):  
   `chrome.action.onClicked` or internal use of `getValidToken()` / `checkBackendSession()`.

2. **Background:**  
   - Calls `getTokenFromPage()`:  
     - Tries active tab first, then any tab whose URL origin is in `DASHBOARD_ORIGINS` (e.g. `http://localhost:3000`, `https://echly-web.vercel.app`).  
   - For each candidate tab: `chrome.tabs.sendMessage(tabId, { type: "ECHLY_GET_TOKEN_FROM_PAGE" }, callback)`.

3. **Content script** (in that tab):  
   - `chrome.runtime.onMessage` handler for `ECHLY_GET_TOKEN_FROM_PAGE` runs `requestTokenFromPage()` and replies with `sendResponse({ token })`.

4. **requestTokenFromPage()** (content script):  
   - Generates `nonce = crypto.randomUUID()`.  
   - Adds one-time `message` listener for same channel, type `ECHLY_TOKEN_RESPONSE`, and matching nonce.  
   - `window.postMessage({ channel: ECHLY_TOKEN_CHANNEL, type: "ECHLY_REQUEST_TOKEN", nonce }, window.location.origin)`.  
   - 5s timeout; if no valid response, resolves to null.

5. **Page bridge** (injected `pageTokenBridge.js`, main world):  
   - Receives message (channel + type match).  
   - Gets `user = window.firebase?.auth?.()?.currentUser`; if no user, responds with `token: null` to `event.origin`.  
   - Else `token = await user.getIdToken()`, then `postMessage({ channel, type: "ECHLY_TOKEN_RESPONSE", nonce, token }, event.origin)`.

6. **Content script:**  
   - Listener receives response, checks channel/type/nonce, resolves with `data.token` (or null).  
   - Sends token back to background via `sendResponse({ token })`.

7. **Background:**  
   - If token received: uses it (e.g. for `checkBackendSession()` or API calls).  
   - If no token (no dashboard tab or not signed in): `getValidToken()` throws `NOT_AUTHENTICATED`; `checkBackendSession()` returns `{ authenticated: false }`.

8. **Backend validation:**  
   - e.g. `checkBackendSession()`: `fetch(API_BASE + "/api/auth/session", { headers: { Authorization: "Bearer " + token } })`.  
   - Backend uses `requireAuth(req)` → `verifyIdToken(token)` (Firebase JWKS).  
   - 200 → authenticated; 401 → not authenticated; extension then clears legacy auth storage and can open login page.

---

## SECTION 6 — Token Storage Audit

### 6.1 Search Results (Repository-Wide)

| Term / Pattern | Where found | Purpose |
|----------------|-------------|---------|
| `auth_idToken` | `echly-extension/src/background.ts` | Only in `AUTH_STORAGE_KEYS`; used only in `clearAuthState()` to **remove** legacy keys. Not read or written for current auth. |
| `refreshToken` | Docs (`ECHLY_AUTH_ARCHITECTURE_AUDIT.md`, `ECHLY_EXTENSION_AUTH_CONSISTENCY.md`, `ECHLY_EXTENSION_ARCHITECTURE_AUDIT.md`) | Documentation of old design. Not in extension code paths for obtaining/refreshing tokens. |
| `auth_refreshToken` | `echly-extension/src/background.ts` | Same as above; only removed in `clearAuthState()`. |
| `chrome.storage.local` | `echly-extension/src/background.ts` | Used for: session state (`activeSessionId`, `sessionModeActive`, `sessionPaused`), tray state (`trayVisible`, `trayExpanded`), and `clearAuthState()` removal of `AUTH_STORAGE_KEYS`. No auth token persistence in current flow. |
| `exchangeGoogleIdToken` | Docs only | Old design; not in current code. |
| `refreshIdToken` | Docs only | Old design; not in current code. |
| `launchWebAuthFlow` | `echly-extension/src/auth.ts` | Present only in unused `auth.ts` (not imported by background or content). Not used in active auth flow. |

### 6.2 Conclusions

- **Refresh tokens:** Removed from use; only legacy key cleanup references `auth_refreshToken`.  
- **Tokens not persisted:** Extension does not write ID or refresh tokens to storage.  
- **Extension does not perform OAuth:** Login is via dashboard; extension only opens login URL and gets token from page bridge.  
- **Remaining token-related storage:** None for current auth. `chrome.storage.local` holds only session/tray state and is where legacy auth keys are **cleared**.

---

## SECTION 7 — Logout Propagation

### 7.1 Dashboard Logout

- **Location:** `components/layout/ProfileCommandPanel.tsx` — `handleSignOut()` calls `signOut(auth)` (Firebase) and `onClose()`.  
- **Effect:** Firebase clears the session; `auth.currentUser` becomes null (and IndexedDB/session state is cleared by Firebase).

### 7.2 Firebase signOut → auth.currentUser null

- `signOut(auth)` is from `firebase/auth`; it clears the in-browser Firebase Auth state.  
- Any subsequent `auth.currentUser` or `user.getIdToken()` in that context will be null / fail.

### 7.3 useAuthGuard and Token Cache

- `useAuthGuard` subscribes with `onAuthStateChanged(auth, (currentUser) => { ... })`.  
- When `currentUser == null` it calls `clearAuthTokenCache()` and redirects to `/login`.  
- So dashboard in-memory token cache is cleared and the user is sent to login.

### 7.4 Extension Token Request After Logout

- Next time the extension needs a token it calls `getTokenFromPage()`.  
- The content script on a dashboard tab runs `requestTokenFromPage()` → bridge runs `window.firebase.auth().currentUser`.  
- After logout, that page’s Firebase Auth has no user, so bridge gets `user = null` and responds with `token: null`.  
- Content script returns null → background gets null → `getValidToken()` throws `NOT_AUTHENTICATED`.

### 7.5 Extension Opens Login Page

- On icon click, background runs `checkBackendSession()`. If not authenticated (no token or 401 from `/api/auth/session`), it calls `clearAuthState()` and opens a new tab to `ECHLY_LOGIN_BASE?extension=true&returnUrl=...`.  
- Same pattern for any flow that relies on `getValidToken()` or `checkBackendSession()` and gets no token or 401.

### 7.6 Verification

- **Dashboard logout** → Firebase session cleared → **token bridge returns null** (no currentUser on page) → **extension gets null** → **backend session check fails or token is never obtained** → **extension treats user as not authenticated and can open login page**.  
- Logout propagation is **correct**: the extension has no stored token, so the next token request reflects the logged-out state and the extension reacts by opening login when needed.

---

## SECTION 8 — Security Analysis

### 8.1 Token Interception Risk

- **Same-origin listeners:** The bridge sends the token with `postMessage(..., event.origin)`. Any script in the same origin (including other extensions’ content scripts on that page) can add a `window.addEventListener("message", ...)` and read the same event. The token is in `event.data.token`. So a malicious extension on the same page could capture the token.  
- **Mitigation in place:** Nonce ensures only the Echly content script that sent the request accepts the response for its own Promise; it does not prevent other listeners from reading the payload.  
- **Recommendation (observation only):** Consider that the token is visible to same-document listeners; avoid sending tokens over postMessage if the page is untrusted or if other extensions are a concern, or accept this as a known limitation.

### 8.2 Message Channel Isolation

- Content script runs in an isolated world; the bridge runs in the main world. They share the same document for `postMessage`. So the channel is “same document,” not an isolated channel; isolation is by origin and by the fact that only the dashboard origin has `window.firebase` set.

### 8.3 Nonce Validation

- Nonce is validated by the content script (response must have same nonce). This prevents the content script from accepting a response intended for another request and ties the response to the correct request. It does not restrict who can **read** the message.

### 8.4 Cross-Origin Restrictions

- Bridge sends only to `event.origin`. So the token is not sent to a different origin.  
- Dashboard origins are allowlisted in the extension (`DASHBOARD_ORIGINS`); token is only requested from tabs with those origins.

### 8.5 Extension Attack Surface

- **Background:** Receives token via `sendMessage` from content script; token is not persisted.  
- **Content script:** Receives token via postMessage from page; could be observed by other content scripts on same page.  
- **Bridge:** Runs in page context; if the page is compromised, `window.firebase` and thus the token could be abused; this is inherent to “token from page.”  
- **Legacy auth.ts:** Contains `launchWebAuthFlow` and credential exchange but is unused; removing or guarding it could reduce confusion and attack surface.

### 8.6 Potential Vulnerabilities (Summary)

1. **Same-page token visibility:** Any same-origin listener (including other extensions) can read the token from the postMessage payload.  
2. **Bridge on all pages:** Bridge is injected on all URLs; only dashboard has `window.firebase`; on other pages it harmlessly returns null.  
3. **Legacy identity/oauth2:** Manifest still has `identity` and `oauth2`; unused in current flow but present.  
4. **Legacy auth.ts:** In-extension OAuth code exists but is unused; could be removed to avoid misuse.

---

## SECTION 9 — Architecture Diagrams

### 9.1 AUTHENTICATION FLOW

```
User login (dashboard)
        ↓
Firebase Auth (signInWithPopup / signInWithEmailPassword)
        ↓
Dashboard: auth.currentUser set, useAuthGuard subscribes
        ↓
Token bridge: window.firebase.auth() exposed; pageTokenBridge.js injected on every page
        ↓
Extension (icon click or API need): getTokenFromPage() → content script
        ↓
Content script: postMessage(ECHLY_REQUEST_TOKEN, nonce) → bridge
        ↓
Bridge: user = window.firebase.auth().currentUser; token = await user.getIdToken()
        ↓
Bridge: postMessage(ECHLY_TOKEN_RESPONSE, nonce, token, event.origin)
        ↓
Content script: matches nonce → sendResponse({ token }) to background
        ↓
Background: checkBackendSession() → GET /api/auth/session with Bearer token
        ↓
Backend: requireAuth() → verifyIdToken() (Firebase JWKS) → 200 { authenticated: true, user: { uid } }
        ↓
Extension: session.authenticated === true → proceed (e.g. show tray)
```

### 9.2 LOGOUT FLOW

```
Dashboard logout (ProfileCommandPanel or similar)
        ↓
Firebase signOut(auth)
        ↓
Firebase session cleared → auth.currentUser becomes null
        ↓
useAuthGuard: onAuthStateChanged(currentUser === null) → clearAuthTokenCache(); router.replace("/login")
        ↓
Token bridge: next request → window.firebase.auth().currentUser === null → responds token: null
        ↓
Extension: getTokenFromPage() returns null → getValidToken() throws NOT_AUTHENTICATED
        ↓
Extension: checkBackendSession() returns { authenticated: false }; clearAuthState(); open login tab (e.g. on icon click)
```

---

## SECTION 10 — Final Verification

### 1. Is there exactly one authentication source of truth?

**Yes.**  
- **Session validity** is determined by the backend: `GET /api/auth/session` with Bearer token, validated via Firebase JWKS in `requireAuth()` / `verifyIdToken()`.  
- **Token origin** is single: Firebase Auth in the dashboard tab (page context). The extension does not maintain its own OAuth or token store; it only requests a token from that page and then validates it with the backend.

### 2. Does the extension remain stateless?

**Yes.**  
- The extension does not persist ID or refresh tokens.  
- It obtains a token on demand from a dashboard tab via the content script and bridge, and uses it for the current request (e.g. `/api/auth/session` or API calls).  
- No in-memory or storage cache of auth tokens in the extension for the current design.

### 3. Are refresh tokens completely removed?

**Yes from use.**  
- No code path reads or writes refresh tokens for auth.  
- `auth_refreshToken` (and related keys) appear only in `AUTH_STORAGE_KEYS` used by `clearAuthState()` to remove legacy keys.  
- There is no `refreshIdToken` or similar call in the codebase.

### 4. Does the extension rely only on backend validation?

**Yes.**  
- Before treating the user as authenticated (e.g. on icon click), the extension calls `checkBackendSession()` which uses `GET /api/auth/session` with the token.  
- 401/403 or missing token → `authenticated: false` and login page opened.  
- Other API calls (feedback, upload, etc.) also send the token; 401/403 triggers `clearAuthState()`. So authorization is always backed by the backend (and Firebase token verification).

### 5. Can logout propagate correctly to the extension?

**Yes.**  
- Dashboard logout clears Firebase Auth in the browser.  
- The extension has no stored token; the next token request goes to the page bridge, which then sees `currentUser === null` and returns null.  
- Extension gets null (or 401 from backend) and treats the user as not authenticated and can open the login page.  
- No propagation “signal” is required; stateless token request naturally reflects the logged-out state.

### 6. Is the token bridge secure against other extensions?

**Partially.**  
- The bridge does not send the token to `"*"`; it uses `event.origin` only.  
- However, any content script (including from other extensions) on the **same page** can listen for `message` and read `event.data` when the bridge posts the token. The nonce protects which requester’s Promise is resolved, not who can see the message.  
- So: **same-origin and same-document** listeners (including other extensions on that page) can observe the token. The bridge is not secure against a malicious extension on the same dashboard tab.

---

## Summary

The refactored Echly auth system has a **single source of truth**: Firebase Auth on the dashboard for token issuance, and the backend (`/api/auth/session` + `requireAuth`) for session validation. The extension is **stateless**, uses **no refresh tokens**, and **does not perform OAuth**; it gets tokens from the dashboard page via a **token bridge** and validates them with the backend. **Logout** propagates because the extension does not store tokens and the next token request sees the cleared Firebase state. The main **security caveat** is that the token is visible to any same-document listener (including other extensions) when the bridge posts it via `postMessage`.

This report documents the system as implemented; no changes or fixes were applied.
