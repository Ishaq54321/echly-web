# Echly Full Authentication Architecture Audit — Loom-Style Extension Login

**Purpose:** Analyze the repository to answer questions required to implement Loom-style extension login. No code was modified.

**Desired final behavior:**
1. Click extension → If logged in → tray opens immediately; If not → login tab opens.
2. User logs in → Login tab closes → Tray opens automatically on the original page.
3. Extension must **not** depend on a dashboard tab or page token bridge.

---

## PART 1 — Backend Auth Verification

### 1. How does the backend verify user authentication?

The backend verifies authentication by:

1. Reading the `Authorization` request header.
2. Requiring the value to start with `"Bearer "` and extracting the token.
3. Calling `verifyIdToken(token)` (from `lib/server/auth.ts`). If verification fails, it throws a 401 Response.

**File:** `lib/server/auth.ts`

```14:45:lib/server/auth.ts
export async function verifyIdToken(token: string): Promise<DecodedIdToken> {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `https://securetoken.google.com/${PROJECT_ID}`,
    audience: PROJECT_ID,
  });
  return {
    uid: (payload.sub ?? payload.user_id) as string,
    ...payload,
  };
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

Protected API routes import `requireAuth` and call `user = await requireAuth(req)` before handling the request (e.g. `app/api/sessions/route.ts`, `app/api/feedback/route.ts`, `app/api/upload-screenshot/route.ts`, etc.).

### 2. Is Firebase Admin SDK used?

**No.** The backend does **not** use the Firebase Admin SDK. It uses the **jose** library with a **remote JWKS** (Google’s public keys for Firebase Auth).

**File:** `lib/server/auth.ts`

```1:7:lib/server/auth.ts
import { jwtVerify, createRemoteJWKSet } from "jose";

const PROJECT_ID = "echly-b74cc"; // use your real Firebase project id

const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
);
```

### 3. Is JWT verified using JWKS?

**Yes.** `jwtVerify(token, JWKS, { issuer, audience })` from **jose** verifies the JWT using the remote JWKS at `https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com`, with issuer `https://securetoken.google.com/${PROJECT_ID}` and audience `PROJECT_ID`.

### 4. What function verifies tokens?

- **`verifyIdToken(token: string)`** — Verifies the raw token and returns `DecodedIdToken` (includes `uid`).
- **`requireAuth(request: Request)`** — Extracts `Authorization: Bearer <token>` from the request and calls `verifyIdToken(token)`; throws 401 if missing or invalid.

**File paths:** `lib/server/auth.ts` (only place token verification is implemented).

---

## PART 2 — Auth Session Endpoint

### 1. Does an endpoint exist that returns the current authenticated user?

**Yes.** `GET /api/auth/session` exists.

**File:** `app/api/auth/session/route.ts`

### 2. What request headers are required?

**`Authorization: Bearer <token>`** — the Firebase ID token must be sent in the Bearer header.

### 3. Does it expect Authorization: Bearer &lt;token&gt;?

**Yes.** The handler uses `requireAuth(req)`, which expects exactly that format.

### 4. What response does it return?

- **Success (200):** `{ authenticated: true, user: { uid: string } }`
- **Failure (401):** `{ authenticated: false }` with `Content-Type: application/json`

**Handler code:**

```1:23:app/api/auth/session/route.ts
import { requireAuth } from "@/lib/server/auth";

/**
 * GET /api/auth/session
 * Backend session validation: single source of truth for dashboard and extension.
 * Validates Firebase ID token via existing requireAuth(); returns authenticated user info.
 */
export async function GET(req: Request) {
  try {
    const user = await requireAuth(req);
    return Response.json({
      authenticated: true,
      user: {
        uid: user.uid,
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ authenticated: false }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
}
```

---

## PART 3 — Extension API Requests

### 1. Which extension files make API calls?

| File | Role |
|------|------|
| **echly-extension/src/background.ts** | Makes direct `fetch()` to API_BASE for: `/api/auth/session`, `/api/feedback`, `/api/sessions`, `/api/upload-screenshot`, `/api/structure-feedback`, `/api/feedback` (POST). |
| **echly-extension/src/content.tsx** | Uses `apiFetch()` from `contentAuthFetch.ts` (which proxies via background). |
| **echly-extension/src/contentAuthFetch.ts** | Defines `authFetch` / `apiFetch` that send `{ type: "echly-api", url, method, headers, body }` to the background. |
| **echly-extension/src/api.ts** | Used in **dashboard/page context** (e.g. when extension opens dashboard); uses `auth.currentUser.getIdToken()` and adds Bearer. Not used in content script for arbitrary pages. |

### 2. Do those calls include Authorization headers?

- **background.ts:** Yes. All fetches that need auth use `Authorization: \`Bearer ${token}\``. The token comes from `getValidToken()` → `getTokenFromPage()`.
- **contentAuthFetch.ts:** No. The content script does **not** add an Authorization header. It sends the request to the background via `chrome.runtime.sendMessage({ type: "echly-api", ... })`. The **background** adds the token when handling `echly-api` (see below).
- **background.ts echly-api handler:** Yes. It does `const resolvedToken = token ?? (await getValidToken())` and sets `h["Authorization"] = \`Bearer ${resolvedToken}\``.

### 3. Where does the extension currently obtain the token?

**Only from a dashboard tab via the page token bridge.**

- **background.ts:** `getValidToken()` → `getTokenFromPage()`. `getTokenFromPage()` sends `ECHLY_GET_TOKEN_FROM_PAGE` to the active tab, then to each tab whose URL is a dashboard origin. The content script in that tab runs `requestTokenFromPage()`, which does a postMessage handshake with the injected `pageTokenBridge.js`; the bridge calls `window.firebase.auth().currentUser.getIdToken()` and returns the token. So the token is **always** obtained from a dashboard page context, never from storage or from the extension’s own OAuth.

**Relevant functions:**  
`getTokenFromPage()` (background.ts ~260–306), `getValidToken()` (~308–313), content script handler for `ECHLY_GET_TOKEN_FROM_PAGE` in content.tsx (~1566) calling `requestTokenFromPage()` (requestTokenFromPage.ts), and the injected script `pageTokenBridge.js`.

---

## PART 4 — Login Page Flow

**File:** `app/(auth)/login/page.tsx`

### 1. Firebase login execution

- **Google:** `handleGoogle()` calls `signInWithGoogle()` (from `lib/auth/authActions`).
- **Email/password:** `handleEmail()` calls `signInWithEmailPassword(email, password)`.
- `onAuthStateChanged(auth, (user) => { ... })` runs on mount; if `user` exists, it redirects to `/dashboard` (with optional `extension` and `returnUrl` query params).

### 2. What happens after login succeeds

- **Extension flow (`isExtension` from `?extension=true`):**
  1. `window.chrome.runtime.sendMessage({ type: "ECHLY_EXTENSION_LOGIN_COMPLETE" })` is called (Google and email handlers).
  2. Then `window.location.href = \`/dashboard?extension=true&returnUrl=...\`` (or without returnUrl). So the **same tab** navigates from login to dashboard; the tab is **not** closed.

### 3. chrome.runtime.sendMessage usage

- After successful sign-in (Google or email), when `isExtension` is true, the login page sends `{ type: "ECHLY_EXTENSION_LOGIN_COMPLETE" }` to the extension background once, then redirects.

### 4. Whether the login tab closes

**No.** The login tab does **not** close. It **redirects** to the dashboard in the same tab. There is no `chrome.tabs.remove()` or `window.close()` after login.

### 5. Whether returnUrl logic exists

**Yes.** `returnUrl` is read from search params (`searchParams.get("returnUrl")`). It is passed through to the dashboard URL as `returnUrl` when redirecting. The login page has `safeRedirectToReturnUrl(url)` that validates and redirects to a decoded URL; it is not used in the main extension login path—the extension path redirects to `/dashboard?extension=true&returnUrl=...`. So returnUrl is preserved for the dashboard, but the extension does not currently use it to close the login tab and “return” to the original page; the user stays on the dashboard tab.

### Step-by-step login process (extension)

1. User clicks extension icon → not authenticated → background opens login tab: `ECHLY_LOGIN_BASE?extension=true&returnUrl=<current page URL>`.
2. User signs in (Google or email) on the login page.
3. Login page sends `ECHLY_EXTENSION_LOGIN_COMPLETE` to the background.
4. Login page sets `window.location.href = /dashboard?extension=true&returnUrl=...` → same tab navigates to dashboard.
5. Background receives `ECHLY_EXTENSION_LOGIN_COMPLETE` and runs `refreshExtensionAuth()` → `checkBackendSession()` → `getTokenFromPage()` then `GET /api/auth/session`.
6. **Timing issue:** When `getTokenFromPage()` runs, the tab may still be on the login URL or mid-redirect. The token bridge is injected only on **dashboard** origins, so the login tab does not have the bridge. So `getTokenFromPage()` often gets **null** (or times out), and the extension stays unauthenticated.
7. After redirect, the tab becomes a dashboard tab with the bridge, but by then `refreshExtensionAuth()` has already completed with “not authenticated.” The tray does not open automatically on the original page; the user would need to click the extension again (and then a dashboard tab exists and can supply the token).

---

## PART 5 — Extension Background Auth Logic

**File:** `echly-extension/src/background.ts`

### 1. How does the extension determine whether the user is authenticated?

By calling **`checkBackendSession()`**, which:

1. Gets a token via **`getValidToken()`** (which calls **`getTokenFromPage()`**). If no token, it calls `clearAuthState()` and returns `{ authenticated: false }`.
2. Calls `GET ${API_BASE}/api/auth/session` with `Authorization: Bearer <token>`.
3. If `!res.ok`, calls `clearAuthState()` and returns `{ authenticated: false }`.
4. Otherwise returns the JSON body `{ authenticated: true, user }`.

So “authenticated” = token from page + successful `/api/auth/session`. There is an in-memory **sessionCache** (`sessionCache.authenticated`, `sessionCache.checkedAt`) with a 30s TTL, but the **icon click handler does not use it** to skip the check; every click runs `checkBackendSession()`.

### 2. Does it use pageTokenBridge or getTokenFromPage?

**Yes.** It uses **`getTokenFromPage()`**, which depends on the **page token bridge**. Flow:

- Background sends `ECHLY_GET_TOKEN_FROM_PAGE` to a tab.
- Content script (content.tsx) handles it and calls **`requestTokenFromPage()`**.
- That does a postMessage handshake with the **pageTokenBridge.js** script injected only on dashboard origins; the bridge reads `window.firebase.auth().currentUser.getIdToken()` and posts the token back.

So the extension **does** depend on the dashboard page and the bridge for the token.

### 3. Does it read from chrome.storage?

- **Auth tokens:** **No.** The extension is designed “stateless” for auth: it does **not** store ID or refresh tokens. It only **removes** legacy keys in `clearAuthState()`: `auth_idToken`, `auth_refreshToken`, `auth_expiresAtMs`, `auth_user`.
- **Other state:** Yes. `chrome.storage.local` is used for: `activeSessionId`, `sessionModeActive`, `sessionPaused`, `trayVisible`, `trayExpanded`. Read on startup in `initializeSessionState()`; written in `persistUIState()`, `persistSessionLifecycleState()`, etc.

### 4. What happens when the extension icon is clicked?

**Exact flow:**

1. `chrome.action.onClicked` fires. If `authCheckInProgress` is true, return.
2. Set `authCheckInProgress = true`.
3. **`await checkBackendSession()`:**
   - **`getValidToken()`** → **`getTokenFromPage()`**: try active tab, then each dashboard-origin tab; for each, `chrome.tabs.sendMessage(tabId, { type: "ECHLY_GET_TOKEN_FROM_PAGE" })` with 2s timeout. If no token from any tab, throw `NOT_AUTHENTICATED` → `clearAuthState()`, return `{ authenticated: false }`.
   - `fetch(API_BASE + "/api/auth/session", { headers: { Authorization: "Bearer " + token } })`. If `!res.ok` → `clearAuthState()`, return `{ authenticated: false }`.
   - Return session JSON.
4. Update `sessionCache` from the result.
5. If **authenticated:** set `globalUIState.user`, `globalUIState.visible = true`, `globalUIState.expanded = true`, `persistUIState()`, `broadcastUIState()` (tray opens).
6. If **not authenticated:** build login URL with `returnUrl = tab?.url`, open `chrome.tabs.create({ url: loginUrl })`.
7. In `finally`, set `authCheckInProgress = false`.

So: **icon click → checkBackendSession (getTokenFromPage + /api/auth/session) → open tray or open login tab.** No use of sessionCache to short-circuit the check on click.

---

## PART 6 — Token Bridge Dependency

### 1. How the extension currently retrieves tokens

1. Background needs a token → calls **`getTokenFromPage()`**.
2. **`getTokenFromPage()`** gets all tabs, tries the active tab first, then each tab whose URL origin is in `DASHBOARD_ORIGINS` (localhost:3000, echly-web.vercel.app).
3. For each candidate tab it sends **`ECHLY_GET_TOKEN_FROM_PAGE`** to the content script (2s timeout per tab).
4. Content script (content.tsx) calls **`requestTokenFromPage()`** (requestTokenFromPage.ts), which:
   - Performs a handshake with the page via postMessage (**ECHLY_BRIDGE_HANDSHAKE** → **ECHLY_BRIDGE_READY**).
   - Sends **ECHLY_REQUEST_TOKEN** (channel, nonce, source); listens for **ECHLY_TOKEN_RESPONSE** with the token.
5. The **page** script is **pageTokenBridge.js**, injected by the content script only when `window.location.origin` is in `DASHBOARD_ORIGINS`. The bridge listens for the handshake and token request, then calls `window.firebase.auth().currentUser.getIdToken()` and posts the token back.
6. Content script sends the token back to the background via `sendResponse({ token })`.

So the **only** source of token in the extension is: **dashboard tab → bridge → content script → background.**

### 2. Whether it requires a dashboard tab

**Yes.** A tab with a dashboard origin must exist and have the content script and bridge loaded. The extension **does not** create a dashboard tab automatically (comment in background: “Extension must NEVER create dashboard tabs automatically”). If no dashboard tab exists, `getTokenFromPage()` returns null and the user is treated as not authenticated.

### 3. What happens if the dashboard tab does not exist

- `getTokenFromPage()` returns **null**.
- `getValidToken()` throws **NOT_AUTHENTICATED**.
- `checkBackendSession()` calls `clearAuthState()` and returns **`{ authenticated: false }`**.
- On icon click, the extension opens the login tab. After login, the same tab becomes the dashboard; if `refreshExtensionAuth()` runs before/during redirect, it still gets no token (login page has no bridge), so the extension can remain “not authenticated” until the user clicks again when a dashboard tab is loaded.

---

## PART 7 — Logout Behavior

### 1. What happens when a user logs out of the dashboard?

- **Dashboard:** User triggers sign-out (e.g. ProfileCommandPanel “Sign out”) → **`signOut(auth)`** (Firebase Auth). That clears the Firebase user in the browser (and any persisted Firebase Auth state). The web app may also call **`clearAuthTokenCache()`** (authFetch.ts) to clear in-memory token cache.
- **Backend:** There is **no** explicit “logout” or “invalidate session” API call. The backend is stateless: it only validates the Bearer token on each request. So “logout” is purely client-side: the client stops sending a valid token (or sends an expired one).

### 2. Is any backend session invalidated?

**No.** The backend does not maintain server-side sessions. It only verifies the JWT per request. Revoking the token would require Firebase Admin (e.g. revoke refresh tokens) or short token lifetime; the codebase does not show backend session invalidation on logout.

### 3. Would the extension still consider the user authenticated?

**Not after the next check.** The extension does not store tokens. On the next action that needs auth (e.g. icon click, or any API call):

- **getTokenFromPage()** runs. The dashboard tab (where the user just signed out) now has `firebase.auth().currentUser === null`, so the bridge returns **null**.
- So the extension gets no token → `clearAuthState()` → **authenticated: false**. So the extension will correctly show “not authenticated” on the next use, **because** it always gets the token from the page and the page’s Firebase state is cleared. It does not “still consider” the user authenticated unless there is another dashboard tab still signed in.

---

## PART 8 — Extension Storage

### 1. Whether the extension stores authentication tokens

**No.** The extension intentionally does **not** store ID or refresh tokens. It only **removes** legacy keys in `clearAuthState()`: `auth_idToken`, `auth_refreshToken`, `auth_expiresAtMs`, `auth_user`. Comments state the extension is “stateless” and must never write those again.

### 2. Where those tokens are read from

Tokens are **not** read from storage. They are obtained **on demand** from a dashboard tab via **getTokenFromPage()** (content script + pageTokenBridge.js).

### 3. Whether tokens persist across browser restarts

**N/A.** No auth tokens are stored. After a restart, the extension has no token until it successfully runs `getTokenFromPage()` again (i.e. until a dashboard tab is open and the user is signed in there). Session/tray state (e.g. `trayVisible`, `trayExpanded`, `activeSessionId`) does persist in `chrome.storage.local`.

---

## PART 9 — Extension Login Flow (Current Sequence)

1. **User clicks extension icon**  
   → `chrome.action.onClicked` → `checkBackendSession()`.

2. **checkBackendSession()**  
   → `getValidToken()` → `getTokenFromPage()`.  
   → If no dashboard tab (or no token from any tab): `clearAuthState()`, return `{ authenticated: false }`.  
   → If token: `GET /api/auth/session` with Bearer token. If !res.ok → clearAuthState(), return not authenticated.

3. **If not authenticated**  
   → Open login tab: `ECHLY_LOGIN_BASE?extension=true&returnUrl=<current tab URL>`.

4. **User logs in on login page**  
   → Firebase sign-in succeeds → login page sends `ECHLY_EXTENSION_LOGIN_COMPLETE` → redirects same tab to `/dashboard?extension=true&returnUrl=...`.

5. **Extension receives ECHLY_EXTENSION_LOGIN_COMPLETE**  
   → `refreshExtensionAuth()` → `checkBackendSession()` → `getTokenFromPage()` + GET /api/auth/session.  
   → **Problem:** getTokenFromPage() runs while the tab is still on login or mid-redirect. Login page is **not** a dashboard origin for bridge injection, so that tab does not have the bridge → token request fails or times out → often **null** → session stays not authenticated.

6. **After redirect**  
   → The tab is now dashboard and has the bridge, but `refreshExtensionAuth()` has already completed with not authenticated. Tray does not open automatically; `globalUIState.user` remains null until the user clicks the extension again (and then a dashboard tab can supply the token).

So the extension becomes “authenticated” only when:
- A dashboard tab exists,
- That tab’s page has the bridge and a signed-in Firebase user,
- The background successfully gets the token from that tab and validates it with `/api/auth/session`.

The **dashboard (and thus the token bridge) is required** for the extension to be considered authenticated. There is no path where the extension holds or obtains a token without a dashboard tab.

---

## FINAL REPORT

### 1. Does the backend support verifying Firebase tokens?

**Yes.** The backend uses **jose** + Firebase’s public JWKS to verify Firebase ID tokens. It does **not** use Firebase Admin SDK. Any client that can obtain a valid Firebase ID token can authenticate by sending `Authorization: Bearer <token>` to protected routes and to `GET /api/auth/session`.

### 2. Can the extension authenticate using Authorization: Bearer tokens?

**Yes.** The backend already accepts Bearer tokens. The extension **already** uses Bearer tokens for every API call and for `GET /api/auth/session`. The only constraint is **where** the extension gets the token: today it gets it **only** from a dashboard tab via the page token bridge. If the extension could obtain a Firebase ID token in another way (e.g. stored in extension storage after login, or via a different flow), it could continue to use the same `Authorization: Bearer <token>` and the backend would not need to change.

### 3. What changes are required to implement Loom-style extension login?

- **Token source:** The extension must be able to get a valid Firebase ID token **without** requiring an open dashboard tab. That implies either:
  - **Option A:** Extension stores the ID token (and optionally refresh path) after login and uses it for `/api/auth/session` and API calls; token refreshed in background (e.g. via Firebase REST or a small embedded flow), **or**
  - **Option B:** Login completes in a tab, and before the tab is closed or navigated away, the token is sent to the extension (e.g. via `chrome.runtime.sendMessage`) and the extension stores it and uses it until expiry/refresh. The extension must then **stop** relying on `getTokenFromPage()` for normal operation.
- **Login tab close:** To match “login tab closes,” after successful login the extension (or login page with extension messaging) should close the login tab, e.g. `chrome.tabs.getCurrent()` in a script or the background closing the tab that opened the login URL.
- **Tray on original page:** After receiving the token (and optionally validating with `GET /api/auth/session`), the background should set authenticated state, then either:
  - Focus/select the tab that was the “original page” (e.g. from `returnUrl` or a stored tab id) and broadcast tray state so the tray opens on that page, or
  - Ensure the content script on the tab matching `returnUrl` receives the updated state so the tray shows there.
- **Post-login timing:** Avoid depending on the login tab still being the page context for the bridge. Either get the token from the page **before** redirect (e.g. login page gets token and sends to extension, then redirects), or have the extension obtain/store the token in a flow that doesn’t depend on the bridge on the login tab (e.g. storage-based after a one-time token handoff).

### 4. Which files must be modified

- **echly-extension/src/background.ts**  
  - Auth source: add logic to use a stored token (and refresh) when available; call `getTokenFromPage()` only as fallback or remove it for the main auth path.  
  - After login complete: optionally close the login tab; ensure tray opens (e.g. by focusing the tab that has `returnUrl` and broadcasting state).  
  - Possibly use sessionCache on icon click (e.g. if sessionCache.authenticated and within TTL, skip full check and open tray immediately) for “tray opens immediately” when already logged in.

- **app/(auth)/login/page.tsx**  
  - If token is to be sent to extension before redirect: after sign-in, get ID token (e.g. `user.getIdToken()`), send it to the extension (e.g. via `chrome.runtime.sendMessage` with the token), then redirect. Optionally let the extension close the tab or close it via extension message.

- **echly-extension/src/content.tsx**  
  - If the extension closes the login tab from background, no change strictly required here for “close.” Bridge injection can remain for dashboard-only; if the extension no longer depends on the bridge for post-login auth, the post-login flow no longer relies on the bridge timing.

- **Token storage (new or existing):**  
  - If storing tokens in the extension: use `chrome.storage.local` (or session) for the token and optionally refresh token/expiry. Only if product accepts storing tokens in the extension; must follow secure practices (e.g. no logging, clear on logout).

- **Optional:**  
  - **lib/server/auth.ts** — No change needed for Loom-style; backend already supports Bearer tokens.  
  - **app/api/auth/session/route.ts** — No change needed.

### 5. What architecture should replace the dashboard token bridge

- **Single source of truth:** Backend remains the authority: `GET /api/auth/session` with `Authorization: Bearer <token>` determines if the session is valid.
- **Token in extension:**  
  - **Obtain:** On successful login in the extension flow, the login page (or a dedicated extension page) obtains the Firebase ID token once (e.g. `user.getIdToken()`) and sends it to the background (e.g. `ECHLY_EXTENSION_LOGIN_COMPLETE` with token, or a new message type).  
  - **Store:** Background stores the token (and optional expiry) in `chrome.storage.local`. Optionally implement refresh (e.g. Firebase REST refresh token API or re-open login when token is expired and refresh fails).  
  - **Use:** For icon click and all API calls, background uses the stored token (refreshing if needed). It calls `GET /api/auth/session` with that token to validate; on 401/403 it clears stored auth and shows login again.  
  - **No dashboard tab required:** Normal operation (open tray, API calls) does not call `getTokenFromPage()`. The bridge can remain for dashboard pages that want to sync or for backward compatibility but is not required for the extension to be “logged in.”
- **Logout:** When the user signs out on the dashboard, the dashboard can send a message to the extension (e.g. `ECHLY_EXTENSION_LOGOUT`) so the extension clears stored token and state. Alternatively, the extension clears auth only when the backend returns 401/403 (current pattern), which will happen once the stored token expires or is revoked.
- **Loom-style flow:**  
  1. Click extension → If stored token exists and valid (or `/api/auth/session` ok) → open tray immediately (optionally using sessionCache for instant open).  
  2. If not → open login tab with returnUrl.  
  3. User logs in → login page sends token to extension (and optionally “close this tab”) → extension stores token, validates with `/api/auth/session`, closes login tab if desired, then focuses or notifies the tab for returnUrl and opens the tray there.

This replaces “token only from dashboard tab via bridge” with “token stored in extension after login, validated by backend,” so the extension no longer depends on a dashboard tab or the page token bridge for authentication.

---

*End of audit. No code was modified.*
