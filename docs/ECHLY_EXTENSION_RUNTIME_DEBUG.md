# Echly Extension Runtime Debug Report (Phase 3–4 Migration)

**Goal:** Identify why the extension redirects to the login page even when the user is logged in on the dashboard.

**Scope:** Diagnostic only. No code was modified.

---

## PART 1 — Extension Click Flow

### Location

**File:** `echly-extension/src/background.ts`  
**Symbol:** `chrome.action.onClicked`

### Full handler code

```typescript
/** Extension icon click: open tray immediately, then API call with extension token; if 401, open login. */
chrome.action.onClicked.addListener((tab) => {
  if (tokenFetchInProgress) return;
  originTabId = tab?.id ?? null;

  // Open tray immediately (toggle if already visible)
  if (globalUIState.visible === true) {
    globalUIState.visible = false;
    globalUIState.expanded = false;
  } else {
    globalUIState.visible = true;
    globalUIState.expanded = true;
  }
  persistUIState();
  broadcastUIState();

  tokenFetchInProgress = true;
  (async () => {
    try {
      await getValidToken();
      broadcastUIState();
    } catch {
      clearAuthState();
      const returnUrl = typeof tab?.url === "string" ? tab.url : "";
      const loginUrl =
        ECHLY_LOGIN_BASE +
        "?extension=true" +
        (returnUrl ? "&returnUrl=" + encodeURIComponent(returnUrl) : "");
      await openOrFocusLoginTab(loginUrl);
    } finally {
      tokenFetchInProgress = false;
    }
  })();
});
```

**Lines:** 358–387 (approximate; see file for exact line numbers).

### Functions called (in order)

| Order | Function | Purpose |
|-------|----------|--------|
| 1 | `persistUIState()` | Writes `trayVisible`, `trayExpanded` to `chrome.storage.local` |
| 2 | `broadcastUIState()` | Sends `ECHLY_GLOBAL_STATE` to all tabs |
| 3 | `getValidToken()` | Returns in-memory token or calls `fetchExtensionToken()` (GET `/api/auth/extensionToken`) |
| 4 | `broadcastUIState()` | Again after successful token |
| On catch | `clearAuthState()` | Clears `extensionAccessToken`, UI state, legacy storage keys |
| On catch | `openOrFocusLoginTab(loginUrl)` | Opens or focuses a tab at `/login?extension=true` (and optional `returnUrl`) |

### Flow diagram

```
User clicks extension icon
         ↓
chrome.action.onClicked(tab)
         ↓
tokenFetchInProgress? → yes → return
         ↓ no
originTabId = tab.id
         ↓
Toggle globalUIState.visible / expanded
         ↓
persistUIState() → broadcastUIState()
         ↓
tokenFetchInProgress = true
         ↓
getValidToken()
    ├─ extensionAccessToken set? → return it → broadcastUIState() → done
    └─ else fetchExtensionToken()
           ↓
       GET /api/auth/extensionToken (credentials: "include")
           ↓
       status 401/403 or !res.ok or invalid JSON/token/uid?
           ↓ yes
       openOrFocusLoginTab(ECHLY_LOGIN_BASE + "?extension=true")  ← LOGIN REDIRECT
       throw NOT_AUTHENTICATED
           ↓ (catch in onClick)
       clearAuthState()
       build loginUrl with returnUrl
       openOrFocusLoginTab(loginUrl)
           ↓
       tokenFetchInProgress = false
```

**Login redirect condition:** Any failure of `getValidToken()` (which implies `fetchExtensionToken()` failed: 401/403, non-OK response, or missing/invalid `token` or `uid` in JSON) causes the catch block to run, which clears auth and opens the login tab.

---

## PART 2 — Extension Token Retrieval

### Search: `/api/auth/extensionToken`

**Occurrences:**

| Location | Usage |
|----------|--------|
| `echly-extension/src/background.ts` | Constant `EXTENSION_TOKEN_URL`, and used inside `fetchExtensionToken()` |

### Constant

**File:** `echly-extension/src/background.ts`

```typescript
const EXTENSION_TOKEN_URL = `${API_BASE}/api/auth/extensionToken`;
```

`API_BASE` is `http://localhost:3000` in development and `https://echly-web.vercel.app` in production.

### Callers of the extension token endpoint

The only code that **calls** `/api/auth/extensionToken` is:

- **`fetchExtensionToken()`** in `echly-extension/src/background.ts` (see below).

No other file in the extension issues a request to this URL.

### Full function that requests the token

**File:** `echly-extension/src/background.ts`

```typescript
/**
 * Fetch short-lived extension token from backend using dashboard session cookie.
 * Uses credentials: 'include' so the browser sends the __session cookie for the API origin.
 * On 401, opens login page and throws NOT_AUTHENTICATED.
 */
async function fetchExtensionToken(): Promise<{ token: string; uid: string }> {
  const res = await fetch(EXTENSION_TOKEN_URL, {
    method: "GET",
    credentials: "include",
  });
  if (res.status === 401 || res.status === 403) {
    openOrFocusLoginTab(`${ECHLY_LOGIN_BASE}?extension=true`);
    throw new Error("NOT_AUTHENTICATED");
  }
  if (!res.ok) {
    throw new Error("NOT_AUTHENTICATED");
  }
  const data = (await res.json()) as { token?: string; uid?: string };
  const token = data.token;
  const uid = data.uid;
  if (typeof token !== "string" || !token || typeof uid !== "string" || !uid) {
    throw new Error("NOT_AUTHENTICATED");
  }
  return { token, uid };
}
```

### Who calls `fetchExtensionToken()`

- **`getValidToken()`** — when `extensionAccessToken` is null, it calls `fetchExtensionToken()`, then sets `extensionAccessToken` and `globalUIState.user`.
- **`checkAuthWithExtensionToken()`** — calls `fetchExtensionToken()` to validate session and set token + user; on catch, calls `clearAuthState()` and returns `{ authenticated: false }`.

### When the extension requests the token

1. **Icon click:** `chrome.action.onClicked` → `getValidToken()` → if no in-memory token, `fetchExtensionToken()`.
2. **Message `ECHLY_GET_AUTH_STATE`:** handler calls `checkAuthWithExtensionToken()` → `fetchExtensionToken()`.
3. **Any other path that needs a token:** `getValidToken()` is used by:
   - `initializeSessionState()` (feedback fetch when session mode was active),
   - `ECHLY_SET_ACTIVE_SESSION` (feedback + sessions fetch),
   - `ECHLY_GET_TOKEN`,
   - `ECHLY_UPLOAD_SCREENSHOT`,
   - `ECHLY_PROCESS_FEEDBACK`,
   - `echly-api` handler (content script API proxy).

So the token is requested whenever the background needs to call the API and does not have a valid in-memory token.

### How the token is stored

- **In memory only:** `extensionAccessToken` (module-level variable in `background.ts`).
- **Not persisted:** No `chrome.storage.local` or other persistence for the extension JWT. Comment in code: "No token storage."

### Where the token is used

- **`getValidToken()`** returns it so callers can set `Authorization: Bearer <token>` on API requests.
- **All background `fetch()` calls** that need auth use `getValidToken()` and then `Authorization: Bearer ${token}`.
- **`echly-api` message handler** uses `token ?? (await getValidToken())` and sets `Authorization: Bearer ${resolvedToken}` on the outgoing request.

---

## PART 3 — Background API Proxy (echly-api)

### Location

**File:** `echly-extension/src/background.ts`  
**Condition:** `request.type === "echly-api"`

### Full handler code

```typescript
  if (request.type === "echly-api") {
    const { url, method, headers, body, token } = request as {
      url: string;
      method?: string;
      headers?: Record<string, string>;
      body?: string | null;
      token?: string;
    };
    (async () => {
      try {
        const resolvedToken = token ?? (await getValidToken());
        const h = { ...headers };
        if (resolvedToken) h["Authorization"] = `Bearer ${resolvedToken}`;
        const res = await fetch(url, {
          method: method || "GET",
          headers: h,
          body: body ?? undefined,
        });
        if (res.status === 401 || res.status === 403) clearAuthState();
        const text = await res.text();
        const out: Record<string, string> = {};
        res.headers.forEach((v, k) => {
          out[k] = v;
        });
        sendResponse({ ok: res.ok, status: res.status, headers: out, body: text });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const isAuth = message === "NOT_AUTHENTICATED" || message.includes("NOT_AUTHENTICATED");
        if (isAuth) clearAuthState();
        sendResponse({
          ok: false,
          status: isAuth ? 401 : 0,
          headers: {},
          body: isAuth ? "Not authenticated" : message,
        });
      }
    })();
    return true;
  }
```

### Authorization header

- **Yes.** The handler sets `h["Authorization"] = \`Bearer ${resolvedToken}\`` when `resolvedToken` is truthy. `resolvedToken` comes from the message payload `token` or from `getValidToken()` (extension token from `/api/auth/extensionToken`).

### credentials: "include"

- **No.** The `fetch(url, { method, headers: h, body })` call does **not** pass `credentials: "include"`. So echly-api proxy requests do **not** send cookies; they rely only on the `Authorization: Bearer` extension token.

### Request format to backend

- **Method:** From message (`method`) or default `"GET"`.
- **URL:** From message (`url`); content script builds full URL (e.g. `API_BASE + path`).
- **Headers:** Copy of message `headers` plus `Authorization: Bearer <extensionToken>` when available.
- **Body:** From message (`body`) or `undefined`.
- **Credentials:** Omitted → browser default (same-origin only); cookies are **not** sent for cross-origin API calls from the extension. This is intentional for echly-api: auth is via Bearer token only.

---

## PART 4 — Token Storage (`extensionAccessToken`)

### Where the token is stored

**File:** `echly-extension/src/background.ts`

- **Declaration:**  
  `let extensionAccessToken: string | null = null;`  
  (in-memory, module scope; not persisted.)

- **Written:**
  - **Set:** In `getValidToken()` after a successful `fetchExtensionToken()`: `extensionAccessToken = token;`
  - **Set:** In `checkAuthWithExtensionToken()` after successful `fetchExtensionToken()`: `extensionAccessToken = token;`
  - **Cleared:** In `clearAuthState()`: `extensionAccessToken = null;`

### Where the token is read

- **`getValidToken()`:** If `extensionAccessToken` is truthy, returns it immediately without calling the API.
- No other code reads `extensionAccessToken` directly; all auth goes through `getValidToken()`.

### Where the token “expires”

- **No explicit expiry in the extension.** The JWT is short-lived (15 minutes) on the backend, but the extension does not decode or check expiry. It uses the in-memory value until:
  - The background script is torn down (e.g. service worker suspended), which clears all in-memory state, or
  - A backend request returns 401/403, which triggers `clearAuthState()` and sets `extensionAccessToken = null`.

So effectively the token is “valid” until the next 401/403 or service worker restart.

### Token lifecycle summary

1. **Start:** `extensionAccessToken === null`.
2. **First need for token:** `getValidToken()` → `fetchExtensionToken()` → GET `/api/auth/extensionToken` with `credentials: "include"`. On success, `extensionAccessToken = token`, `globalUIState.user` set.
3. **Subsequent calls:** `getValidToken()` returns `extensionAccessToken` without refetching.
4. **Clear:** On 401/403 from any API, or on `NOT_AUTHENTICATED` from `fetchExtensionToken()` or `getValidToken()`, `clearAuthState()` sets `extensionAccessToken = null`.
5. **Service worker restart:** In-memory variable resets to `null`; next use triggers `fetchExtensionToken()` again.

---

## PART 5 — Login Redirect Logic

### Search: `/login?extension=true`

**File:** `echly-extension/src/background.ts`

All login redirects go through **`openOrFocusLoginTab(loginUrl)`** with a URL that includes `?extension=true` (and optionally `&returnUrl=...`). The base is **`ECHLY_LOGIN_BASE = "https://echly-web.vercel.app/login"`**.

### Every location where login redirect occurs

| # | Location (file:line) | Trigger | URL built |
|---|----------------------|--------|-----------|
| 1 | `background.ts` (~255) | `fetchExtensionToken()` gets 401 or 403 | `ECHLY_LOGIN_BASE + "?extension=true"` |
| 2 | `background.ts` (~372–386) | `chrome.action.onClicked`: `getValidToken()` throws (any reason) | `ECHLY_LOGIN_BASE + "?extension=true" + (returnUrl ? "&returnUrl=" + encodeURIComponent(returnUrl) : "")` |
| 3 | `background.ts` (~641–645) | Message `ECHLY_OPEN_POPUP` | `ECHLY_LOGIN_BASE + "?extension=true"` or with `&returnUrl=<sender tab url>` |
| 4 | `background.ts` (~651–655) | Message `ECHLY_SIGN_IN` or `ECHLY_START_LOGIN` or `LOGIN` | Same as above |

### Condition that triggers login redirect (icon click path)

For the **extension icon click** (the main user flow):

1. User clicks icon → `getValidToken()` is called.
2. If `extensionAccessToken` is already set, no redirect; tray toggles and stays.
3. If not, `fetchExtensionToken()` runs:
   - If response is **401 or 403** → `openOrFocusLoginTab(ECHLY_LOGIN_BASE + "?extension=true")` and throw → catch runs → `clearAuthState()` and `openOrFocusLoginTab(loginUrl)` with `returnUrl`.
   - If **!res.ok** (e.g. 500, network error) → throw → same catch → redirect to login.
   - If **body is not valid JSON** or **missing/invalid `token` or `uid`** → throw → same catch → redirect to login.

So the extension redirects to login whenever **GET /api/auth/extensionToken** does not return 200 with a JSON body containing both `token` and `uid`. That includes: backend returns 401 (e.g. no valid session cookie or Bearer), 403, other non-OK status, or malformed response.

---

## PART 6 — Backend Extension Token Endpoint

### Full code

**File:** `app/api/auth/extensionToken/route.ts`

```typescript
import { requireAuth } from "@/lib/server/auth";
import { SignJWT } from "jose";

/**
 * GET /api/auth/extensionToken
 * Issues a short-lived access token for the extension.
 * Requires dashboard session cookie (credentials: 'include' from extension).
 * Does not accept Bearer auth — session cookie only.
 */
export async function GET(req: Request) {
  const user = await requireAuth(req);

  const secret = process.env.EXTENSION_TOKEN_SECRET;
  if (!secret) {
    console.error("EXTENSION_TOKEN_SECRET is not set");
    return new Response(
      JSON.stringify({ error: "Server configuration error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const token = await new SignJWT({
    uid: user.uid,
    type: "extension",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(new TextEncoder().encode(secret));

  return Response.json({ token, uid: user.uid });
}
```

### How session cookie is verified

- The route does **not** verify the session itself. It calls **`requireAuth(req)`** (see PART 7). `requireAuth`:
  - First checks **Authorization: Bearer**; if present, tries Firebase ID token then extension JWT.
  - If no Bearer (or both fail), it uses **Next.js `cookies()`** and reads **`__session`**.
  - If `__session` is present, it verifies it with **Firebase Admin `verifySessionCookie(sessionCookie, true)`**.
  - If no valid Bearer and no valid `__session`, it throws a **401** response.

So for the extension token endpoint, the intended path is: **no Bearer**, **cookie `__session`** present and valid → `requireAuth` returns the decoded user → route issues the JWT.

### How the JWT is generated

- **Payload:** `{ uid: user.uid, type: "extension" }`.
- **Algorithm:** HS256.
- **Secret:** `process.env.EXTENSION_TOKEN_SECRET` (must be set).
- **Expiry:** 15 minutes (`setExpirationTime("15m")`).
- **Output:** `Response.json({ token, uid: user.uid })`.

If `EXTENSION_TOKEN_SECRET` is missing, the route returns **500** (not 401). The extension would then get non-OK and redirect to login.

---

## PART 7 — Backend Auth Middleware

### Full code

**File:** `lib/server/auth.ts`

```typescript
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getAdminAuth } from "@/lib/server/firebaseAdmin";

export interface DecodedIdToken {
  uid: string;
  [key: string]: unknown;
}

export async function verifyIdToken(token: string): Promise<DecodedIdToken> {
  const decoded = await getAdminAuth().verifyIdToken(token, true);
  return { ...decoded, uid: decoded.uid } as DecodedIdToken;
}

/** Verify short-lived extension JWT issued by GET /api/auth/extensionToken. */
export async function verifyExtensionToken(
  token: string
): Promise<DecodedIdToken> {
  const secret = process.env.EXTENSION_TOKEN_SECRET;
  if (!secret) {
    throw new Error("EXTENSION_TOKEN_SECRET is not set");
  }
  const { payload } = await jwtVerify(
    token,
    new TextEncoder().encode(secret)
  );
  const uid = payload.uid;
  if (typeof uid !== "string") {
    throw new Error("Invalid extension token payload");
  }
  return { uid, ...payload } as DecodedIdToken;
}

export async function requireAuth(request: Request): Promise<DecodedIdToken> {
  const authHeader = request.headers.get("Authorization");

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split("Bearer ")[1];
    try {
      return await verifyIdToken(token);
    } catch {
      try {
        return await verifyExtensionToken(token);
      } catch (error) {
        console.error("Token verification failed:", error);
        throw new Response(
          JSON.stringify({ error: "Unauthorized - Invalid token" }),
          { status: 401 }
        );
      }
    }
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session")?.value;

  if (sessionCookie) {
    try {
      const decoded = await getAdminAuth().verifySessionCookie(
        sessionCookie,
        true
      );
      return { ...decoded, uid: decoded.uid } as DecodedIdToken;
    } catch (error) {
      console.error("Session cookie verification failed:", error);
      throw new Response(
        JSON.stringify({ error: "Unauthorized - Invalid session" }),
        { status: 401 }
      );
    }
  }

  throw new Response(
    JSON.stringify({ error: "Unauthorized - Missing token or session" }),
    { status: 401 }
  );
}
```

### How each auth method is verified

1. **Bearer Firebase ID token**  
   - If `Authorization: Bearer <token>` is present, `verifyIdToken(token)` is called.  
   - Uses Firebase Admin `verifyIdToken(token, true)`.  
   - On success returns decoded user; on failure falls through to extension token.

2. **Bearer extension JWT**  
   - If Bearer is present and Firebase verification throws, `verifyExtensionToken(token)` is called.  
   - Uses `jose` `jwtVerify` with `EXTENSION_TOKEN_SECRET`, checks `payload.uid` is a string.  
   - On failure: 401 with "Unauthorized - Invalid token".

3. **Session cookie**  
   - If there is no Bearer (or both Bearer attempts failed), `cookies()` is used to get `__session`.  
   - If `__session` exists, Firebase Admin `verifySessionCookie(sessionCookie, true)` is used.  
   - On success returns decoded user; on failure: 401 "Unauthorized - Invalid session".  
   - If there is no `__session`: 401 "Unauthorized - Missing token or session".

For **GET /api/auth/extensionToken**, the extension does **not** send Bearer; it relies on **session cookie only**. So the backend must receive the `__session` cookie on that request for the user to be considered logged in.

---

## PART 8 — Network Request Behavior

### Extension token request (GET /api/auth/extensionToken)

**File:** `echly-extension/src/background.ts`, `fetchExtensionToken()`:

```typescript
const res = await fetch(EXTENSION_TOKEN_URL, {
  method: "GET",
  credentials: "include",
});
```

- **credentials:** **`"include"`** is set. So the extension **does** request that cookies for the API origin be sent.

Whether the browser actually sends the dashboard’s `__session` cookie when the **initiator** is the extension’s **service worker** (MV3 background) is environment-dependent. In Chrome, fetches from an extension context to a host allowed by `host_permissions` with `credentials: "include"` can send cookies for that host, but the behavior can differ from a request made from a tab on the same origin. This is a critical point to verify in the Network tab (see Root Cause).

### echly-api (and other background fetch calls)

- **echly-api:** `fetch(url, { method, headers: h, body })` — **no `credentials`** option. Default is `"same-origin"`; for extension origin to API origin, no cookies are sent. Auth is by **Bearer only**.
- Other background `fetch()` calls (feedback, sessions, upload-screenshot, structure-feedback, feedback POST) also use only `Authorization: Bearer ${token}` and do not set `credentials: "include"`.

So:

- **GET /api/auth/extensionToken:** Uses `credentials: "include"`. Whether the cookie is sent is a runtime/browser behavior.
- **All other API calls from the extension:** Do **not** use `credentials: "include"`; cookies are not sent; auth is via extension JWT in the Authorization header.

### Content script (contentAuthFetch)

**File:** `echly-extension/src/contentAuthFetch.ts`

- Content script does not call the API directly. It sends a message `{ type: "echly-api", url, method, headers, body }` to the background. The background performs `fetch()` with Bearer and no credentials. So content-script-originated API calls also do **not** send cookies.

### Summary

| Request | credentials | Cookies sent? | Auth |
|--------|-------------|----------------|------|
| GET /api/auth/extensionToken (background) | `"include"` | Intended yes; must be confirmed in Network tab | Session cookie only |
| echly-api and other background API calls | not set (same-origin default) | No | Bearer extension token only |

---

## PART 9 — Extension Runtime Storage (Debug Instructions)

**No code was modified.** To capture runtime storage for diagnosis, add the following **temporarily** in the background service worker (e.g. at the top of the message listener or at the start of `chrome.action.onClicked`), then trigger the extension and inspect the console:

```javascript
chrome.storage.local.get(null, (data) => {
  console.log("ECHLY STORAGE", data);
});
```

### What to report

After adding the above and clicking the extension (or loading the extension and opening the service worker console):

1. **Where to look:** DevTools → Application (or Storage) → Service Workers → select the Echly background script → Console, or right‑click extension → “Inspect service worker” and use the Console tab.
2. **Log:** Note the full object printed as `ECHLY STORAGE`. The extension’s Phase 3–4 design does **not** store the extension token in storage; it only uses in-memory `extensionAccessToken`. So you may see keys such as:
   - `trayVisible`, `trayExpanded`
   - `activeSessionId`, `sessionModeActive`, `sessionPaused`
   - Legacy keys (if any): `auth_idToken`, `auth_refreshToken`, `auth_expiresAtMs`, `auth_user` (these are cleared by `clearAuthState()` and should not be used for auth).

3. **Interpretation:** If `extensionAccessToken` or any JWT appears in `chrome.storage.local`, that would be unexpected and could indicate leftover or alternate code paths. The intended design is: no token in storage; token only in memory and lost on service worker restart.

---

## PART 10 — API Response Capture (GET /api/auth/extensionToken)

**No code was modified.** To capture the exact response from the backend when the extension requests a token:

1. **Option A – Network tab:**  
   - Open DevTools → Network.  
   - Filter by “extensionToken” or “auth”.  
   - Click the extension icon (or trigger any flow that calls `getValidToken()` when no token is in memory).  
   - Select the request to `/api/auth/extensionToken` and record:
     - **Status code**
     - **Response body** (and Content-Type)
     - **Response headers** (especially any `Set-Cookie` or error headers)  
   - In the **Request** section, check **Request Headers** and confirm whether a **Cookie** header (with `__session`) is present. If it is missing, the backend will return 401 and the extension will redirect to login.

2. **Option B – Temporary logging in background:**  
   In `fetchExtensionToken()`, immediately after `const res = await fetch(...)` add:
   - `console.log("ECHLY extensionToken response", res.status, res.statusText);`
   - After `const data = await res.json()` (or in a catch for non-JSON): log a snippet of the body or error.  
   Then reproduce and read the service worker console.

### What to capture

- **Status code:** 200 vs 401 vs 403 vs 500, etc.
- **Response body:** e.g. `{ token, uid }` vs `{ error: "..." }`.
- **Request Cookie header:** Present and containing `__session=...` or absent. This is the most important for “logged in on dashboard but extension redirects to login.”

---

## PART 11 — Root Cause Analysis

### 1. Why the extension always redirects to login

The redirect happens because **`getValidToken()`** throws, which triggers the catch in `chrome.action.onClicked` and calls `openOrFocusLoginTab(loginUrl)`.

`getValidToken()` throws when:

- **`fetchExtensionToken()`** returns a non-200 response (e.g. **401**), or  
- Response is not OK, or  
- Response body does not contain valid `token` and `uid` strings.

So the backend’s **GET /api/auth/extensionToken** is effectively returning 401 (or another non-200) when the user is already logged in on the dashboard. The most plausible reason is that **the request from the extension does not include the dashboard’s session cookie**, so `requireAuth(req)` finds no Bearer and no valid `__session`, and returns 401.

### 2. Whether the cookie reaches the backend

- The extension uses **`credentials: "include"`** for GET `/api/auth/extensionToken`, so it *asks* the browser to send cookies.
- In Chrome MV3, the **initiator** of this request is the **extension service worker** (origin `chrome-extension://<id>`), not a page on `https://echly-web.vercel.app`. Whether the browser attaches the `__session` cookie (set when the user logged in on the dashboard) to this cross-origin request from the extension is not guaranteed and is known to be inconsistent in some environments (e.g. different cookie policies, SameSite, or extension vs page context).
- The dashboard sets **`__session`** with **`SameSite=None; Secure`** (`app/api/auth/sessionLogin/route.ts`), so from a “normal” cross-site request the cookie could be sent; however, requests initiated by an extension are a special case and may not carry the same cookie jar as the tab.

**Conclusion:** The cookie may **not** be reaching the backend on the extension’s GET `/api/auth/extensionToken` request. This must be confirmed by checking the **Request Headers** for that request in the Network tab: if **Cookie** is missing or does not contain `__session`, that is the root cause.

### 3. Whether the extension token is generated

- If the backend receives a valid `__session` cookie, `requireAuth(req)` succeeds and the route returns **200** with `{ token, uid }`. So the JWT **is** generated only when the cookie is present and valid.
- If the backend returns **401** (no cookie or invalid session), the extension never receives a token and redirects to login. So in the “always redirect” scenario, the extension token is **not** being generated for that request because the prior step (cookie) fails.

### 4. Whether the extension token is stored correctly

- When the backend **does** return 200 with `{ token, uid }`, the extension stores the token only in **memory** (`extensionAccessToken`) in `getValidToken()` / `checkAuthWithExtensionToken()`. There is no persistence. So:
  - **Storage is correct** for the current design (in-memory only).
  - If the service worker is suspended and restarted (common in MV3), `extensionAccessToken` is reset to `null`, and the next icon click will call `fetchExtensionToken()` again. If that request again does not send the cookie, the user will see the redirect to login again even though they are still logged in on the dashboard.

### Root cause summary

| Question | Finding |
|----------|--------|
| Why does the extension always redirect to login? | Because GET `/api/auth/extensionToken` returns 401 (or non-200), so `getValidToken()` throws and the click handler opens the login tab. |
| Does the cookie reach the backend? | **Likely no** for the request initiated by the extension service worker. Must be confirmed by inspecting the Cookie header on that request in the Network tab. |
| Is the extension token generated? | Only when the backend receives a valid session cookie. If the cookie is missing, the backend returns 401 and no token is issued. |
| Is the token stored correctly? | Yes, in memory only, as designed. No bug in storage; the failure is earlier (cookie not sent → 401 → no token). |

**Recommended next step:** In Chrome DevTools, trigger the extension so that it calls GET `/api/auth/extensionToken`, then inspect that request: **Request Headers → Cookie**. If `__session` is missing, the fix is to ensure the extension’s token request is made in a context that sends the dashboard cookie (e.g. optional: obtain the token from a page on the dashboard origin, or use another mechanism that has access to the same cookie jar), or to change the architecture so the extension can authenticate without relying on the dashboard cookie in a service-worker-initiated request.

---

## Document info

- **Generated:** Diagnostic report only; no code changes.
- **Extension:** `echly-extension/src/background.ts`, `contentAuthFetch.ts`.
- **Backend:** `app/api/auth/extensionToken/route.ts`, `lib/server/auth.ts`, `app/api/auth/sessionLogin/route.ts`.
- **Purpose:** Support repair of the extension authentication system after Phase 3–4 migration.
