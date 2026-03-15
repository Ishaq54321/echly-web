# Echly Authentication System — Full Diagnostic Audit

**Goal:** Determine why the extension still believes the user is authenticated after dashboard logout.

**Scope:** Chrome extension auth state, dashboard login/logout, backend session validation. No code changes — diagnostic only.

---

## PART 1 — Extension Auth State Audit

**File:** `echly-extension/src/background.ts`

### 1️⃣ Where `sessionCache` is set

**Declaration (initial state):**

```59:63:echly-extension/src/background.ts
/** In-memory session cache for instant tray open. Not persisted; TTL 30s. */
let sessionCache: { authenticated: boolean; checkedAt: number } = {
  authenticated: false,
  checkedAt: 0,
};
```

**Set to `authenticated: true` (or updated) in four places:**

1. **After successful login and session validation** — `validateSessionAndOpenTray()`:

```326:328:echly-extension/src/background.ts
    sessionCache = { authenticated: true, checkedAt: Date.now() };
    globalUIState.user = data.user ?? null;
    globalUIState.visible = true;
```

2. **On icon click — fast path (cache hit)** — after background `checkBackendSession()` resolves:

```414:415:echly-extension/src/background.ts
      checkBackendSession()
      .then((session) => {
        sessionCache = { authenticated: session.authenticated, checkedAt: Date.now() };
```

3. **On icon click — cache miss path** — after `checkBackendSession()`:

```427:428:echly-extension/src/background.ts
      const session = await checkBackendSession();
      sessionCache = { authenticated: session.authenticated, checkedAt: Date.now() };
```

4. **On startup/install prewarm** — `prewarmSessionFromStorage()`:

```386:392:echly-extension/src/background.ts
    if (res.ok) {
      const data = (await res.json()) as { authenticated?: boolean };
      sessionCache = {
        authenticated: data.authenticated === true,
        checkedAt: Date.now(),
      };
    } else {
      sessionCache = { authenticated: false, checkedAt: Date.now() };
```

---

### 2️⃣ Where `sessionCache` is cleared

**Cleared only via `clearSessionCache()`**, which resets the in-memory object:

```243:247:echly-extension/src/background.ts
/** Clear in-memory session cache (e.g. on 401). */
function clearSessionCache(): void {
  sessionCache = { authenticated: false, checkedAt: 0 };
  globalUIState.user = null;
}
```

**`clearSessionCache()` is only invoked inside `clearAuthState()`:**

```249:256:echly-extension/src/background.ts
/** Clear auth state: tokens, legacy keys, session cache; close tray and broadcast. */
function clearAuthState(): void {
  clearSessionCache();
  globalUIState.visible = false;
  globalUIState.expanded = false;
  chrome.storage.local.remove([...ECHLY_TOKEN_KEYS, ...AUTH_STORAGE_KEYS_LEGACY]);
  persistUIState();
  broadcastUIState();
}
```

So **`sessionCache` is cleared only when `clearAuthState()` runs** — i.e. when the extension sees a 401/403 from the backend (session or other API) or when it has no token/refresh failure. **Dashboard logout never calls `clearAuthState()`** because the extension is not notified of logout.

---

### 3️⃣ When `checkBackendSession()` is called

1. **Icon click — fast path (cache hit within TTL):** Called asynchronously *after* the tray is already toggled (Loom-style background validation):

```413:424:echly-extension/src/background.ts
    // Background session validation (Loom style)
    checkBackendSession()
      .then((session) => {
        sessionCache = { authenticated: session.authenticated, checkedAt: Date.now() };

        if (!session.authenticated) {
          clearAuthState();
          // ... open login tab
        }
      })
```

2. **Icon click — cache miss or expired:** Called synchronously before deciding tray vs login:

```426:429:echly-extension/src/background.ts
  (async () => {
    try {
      const session = await checkBackendSession();
      sessionCache = { authenticated: session.authenticated, checkedAt: Date.now() };
```

3. **Message handler `ECHLY_GET_AUTH_STATE`:** When content or popup asks for auth state:

```550:557:echly-extension/src/background.ts
  if (request.type === "ECHLY_GET_AUTH_STATE") {
    (async () => {
      const session = await checkBackendSession();
      sendResponse({
        authenticated: session.authenticated,
        user: session.authenticated && session.user ? session.user : null,
      });
    })();
```

**Not called** on dashboard logout; there is no listener for logout events.

---

### 4️⃣ All places `getValidToken()` is used

| Location | Purpose |
|----------|---------|
| **initializeSessionState()** (line 183) | Load pointers for active session on startup; 401/403 → clearAuthState |
| **checkBackendSession()** (line 347) | Get token for GET /api/auth/session |
| **validateSessionAndOpenTray()** (line 315) | After storing tokens from login; validate then open tray |
| **prewarmSessionFromStorage()** (line 382) | Startup/install: validate stored token and set sessionCache |
| **ECHLY_SET_ACTIVE_SESSION** (line 471) | Fetch feedback + sessions for selected session |
| **ECHLY_GET_TOKEN** (line 546) | Return token to caller |
| **ECHLY_UPLOAD_SCREENSHOT** (line 596) | Bearer token for POST /api/upload-screenshot |
| **ECHLY_PROCESS_FEEDBACK** (line 1024) | Bearer token for structure-feedback and feedback APIs |
| **echly-api** (line 731) | Proxy API calls with Bearer token |

---

### 5️⃣ Every place that calls `/api/auth/session`

| Caller | Code reference |
|--------|-----------------|
| **checkBackendSession()** | `fetch(\`${API_BASE}/api/auth/session\`, { headers: { Authorization: \`Bearer ${token}\` } })` (lines 352–354) |
| **validateSessionWithBackend()** | Same URL and header (lines 375–377) — deprecated wrapper |
| **validateSessionAndOpenTray()** | Same URL and header (lines 433–435) |
| **prewarmSessionFromStorage()** | Same URL and header (lines 384–386) |

All four use the extension’s token from storage (via `getValidToken()`) or the token just stored on login. **None** of these are triggered by dashboard logout.

---

## PART 2 — Extension Token Storage

**Keys:** `echlyIdToken`, `echlyRefreshToken`, `echlyTokenTime` (see `ECHLY_TOKEN_KEYS`, line 232).

### Where written

1. **Login success** — `ECHLY_EXTENSION_AUTH_SUCCESS` handler:

```434:441:echly-extension/src/background.ts
    (async () => {
      try {
        await new Promise<void>((resolve) => {
          chrome.storage.local.set(
            {
              echlyIdToken: idToken,
              echlyRefreshToken: refreshToken,
              echlyTokenTime: Date.now(),
            },
            () => resolve()
          );
        });
```

2. **Token refresh** — `refreshIdToken()` after Firebase securetoken exchange:

```314:323:echly-extension/src/background.ts
  await new Promise<void>((resolve) => {
    chrome.storage.local.set(
      {
        echlyIdToken: newIdToken,
        echlyRefreshToken: newRefreshToken,
        echlyTokenTime: Date.now(),
      },
      () => resolve()
    );
  });
```

### Where read

- **getStoredTokens()** — single read site for all three keys:

```261:281:echly-extension/src/background.ts
function getStoredTokens(): Promise<{ idToken: string; refreshToken: string; tokenTime: number } | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      ["echlyIdToken", "echlyRefreshToken", "echlyTokenTime"],
      (result: { echlyIdToken?: string; echlyRefreshToken?: string; echlyTokenTime?: number }) => {
        const idToken = result.echlyIdToken;
        const refreshToken = result.echlyRefreshToken;
        const tokenTime = result.echlyTokenTime;
        if (
          typeof idToken === "string" &&
          idToken.length > 0 &&
          typeof refreshToken === "string" &&
          refreshToken.length > 0 &&
          typeof tokenTime === "number"
        ) {
          resolve({ idToken, refreshToken, tokenTime });
          return;
        }
        resolve(null);
      }
    );
  });
}
```

`getStoredTokens()` is used by `getValidToken()` and `refreshIdToken()`. No other code reads these keys directly.

### Where cleared

- **clearAuthState()** only:

```252:253:echly-extension/src/background.ts
  chrome.storage.local.remove([...ECHLY_TOKEN_KEYS, ...AUTH_STORAGE_KEYS_LEGACY]);
  persistUIState();
```

So tokens are **cleared only when the extension itself calls `clearAuthState()`** (e.g. after 401/403 from backend). **Dashboard logout does not clear extension storage** and does not notify the extension.

---

## PART 3 — Logout Flow Audit

### 1️⃣ Which file logs the user out

**File:** `components/layout/ProfileCommandPanel.tsx`

**Handler:**

```134:137:components/layout/ProfileCommandPanel.tsx
  const handleSignOut = () => {
    signOut(auth);
    onClose();
  };
```

**Button:** "Sign out" calls `handleSignOut` (lines 419–420). `signOut` is from `firebase/auth` (line 9); `auth` from `@/lib/firebase` (line 10).

---

### 2️⃣ Whether it revokes Firebase refresh tokens

**No.** The dashboard only calls `signOut(auth)`. There is no call to Firebase Admin `revokeRefreshTokens(uid)` or any other server-side revocation. Firebase Client SDK `signOut(auth)`:

- Clears the in-browser Firebase Auth state (currentUser, persistence).
- Does **not** invalidate already-issued ID tokens or refresh tokens. Those remain valid until expiry or until explicitly revoked (e.g. via Firebase Admin).

So tokens previously given to the extension remain valid for the backend until they expire or are revoked elsewhere.

---

### 3️⃣ Whether it clears extension storage

**No.** ProfileCommandPanel does not reference the extension, `chrome.storage`, or any messaging to the extension. Logout is purely Firebase client-side sign-out and panel close.

---

### 4️⃣ Whether it notifies the extension

**No.** There is no `chrome.runtime.sendMessage`, no broadcast, and no shared storage cleared on logout. The extension has no listener for "user signed out" and does not subscribe to Firebase auth state. It only discovers invalidity when it uses the token and gets 401/403 (or when it has no token).

---

### Dashboard post-logout behavior

After `signOut(auth)`:

- `onAuthStateChanged(auth, ...)` fires with `currentUser === null` in any component using `useAuthGuard` (e.g. app layout).
- **useAuthGuard** (e.g. `lib/hooks/useAuthGuard.ts`):

```39:46:lib/hooks/useAuthGuard.ts
      if (currentUser == null && router) {
        clearAuthTokenCache();
        if (useReplace) {
          router.replace("/login");
        } else {
          router.push("/login");
        }
      }
```

So the dashboard clears its **in-memory** token cache (`lib/authFetch.ts`: `cachedToken`, `tokenExpiry`) and redirects to `/login`. The extension is never notified and never clears its own storage or session cache.

---

## PART 4 — Backend Session Validation

### app/api/auth/session/route.ts

```1:22:app/api/auth/session/route.ts
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

- **How tokens are verified:** Via `requireAuth(req)` → `verifyIdToken(token)` (see below). No session store or cookie; only the Bearer token is used.

### lib/server/auth.ts

```14:46:lib/server/auth.ts
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
  // ...
  const token = authHeader.split("Bearer ")[1];
  try {
    return await verifyIdToken(token);
  } catch (error) {
    // ... 401
  }
}
```

- **How Firebase tokens are verified:** JWKS verification with `jose` against `https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com`; checks `issuer` and `audience`. Standard JWT signature and expiry are validated. **No** check against a revocation list or server-side session store.

### 1️⃣ How Firebase tokens are verified

As above: **signature + issuer + audience + expiry** only. No revocation or session invalidation.

### 2️⃣ Whether revoked tokens are checked

**No.** There is no call to Firebase Admin, no revocation list, and no blacklist. A token is valid if it is a valid Firebase ID JWT for the project and not expired. Dashboard logout does not change that.

### 3️⃣ Whether session invalidation exists

**No.** The backend is stateless: no session store, no logout API, no "invalidate this token" step. "Logout" is entirely client-side (dashboard stops using Firebase and clears its in-memory cache).

### 4️⃣ Whether `/api/auth/session` can still return authenticated after logout

**Yes.** After dashboard logout:

- The extension still has the same ID token (and refresh token) in `chrome.storage.local`.
- That ID token is still a valid Firebase JWT until it expires (~1 hour) or is refreshed (extension refreshes at 50 min).
- The backend only checks JWT validity; it does not know the user "signed out" in the dashboard.
- So **GET /api/auth/session** with that Bearer token still returns **200** and `{ authenticated: true, user: { uid } }`.

So the extension can remain "authenticated" from the backend’s perspective until the token expires or something else triggers 401/403 (e.g. refresh failure after revocation elsewhere).

---

## PART 5 — Extension Click Behavior

**Full flow:** click extension → sessionCache → getValidToken → checkBackendSession → tray vs login.

### Exact code block: `chrome.action.onClicked` (lines 409–454)

```409:454:echly-extension/src/background.ts
/** Extension icon click: store origin tab; use session cache (30s) for instant tray, else validate then open tray or login. Never opens or focuses dashboard. */
chrome.action.onClicked.addListener((tab) => {
  console.log("[ECHLY CLICK] icon clicked");
  console.log("[ECHLY CLICK] session cache", sessionCache);
  if (authCheckInProgress) return;
  originTabId = tab?.id ?? null;

  if (sessionCache.authenticated === true && Date.now() - sessionCache.checkedAt < SESSION_CACHE_TTL_MS) {
    // Open tray instantly
    if (globalUIState.visible === true) {
      globalUIState.visible = false;
      globalUIState.expanded = false;
    } else {
      globalUIState.visible = true;
      globalUIState.expanded = true;
    }

    persistUIState();
    broadcastUIState();

    // Background session validation (Loom style)
    checkBackendSession()
      .then((session) => {
        sessionCache = { authenticated: session.authenticated, checkedAt: Date.now() };

        if (!session.authenticated) {
          clearAuthState();
          // ... open login tab
        }
      })
      .catch(() => { ... });

    return;
  }

  authCheckInProgress = true;
  (async () => {
    try {
      const session = await checkBackendSession();
      sessionCache = { authenticated: session.authenticated, checkedAt: Date.now() };
      // ... if authenticated: toggle tray; else open login tab
    } finally {
      authCheckInProgress = false;
    }
  })();
});
```

**Flow summary:**

1. **Click extension** → set `originTabId`, bail if `authCheckInProgress`.
2. **Cache hit:** `sessionCache.authenticated === true` and `Date.now() - sessionCache.checkedAt < SESSION_CACHE_TTL_MS` (5 min).
   - Tray is toggled **immediately** (visible/expanded updated, persist, broadcast).
   - **Then** `checkBackendSession()` runs in the background (getValidToken → GET /api/auth/session). When it resolves, session cache is updated; if `!session.authenticated`, `clearAuthState()` and open login tab.
   - So the tray can open **before** the backend result is known; and if the backend still returns 200 (see Part 4), `session.authenticated` stays true and no clear happens.
3. **Cache miss:** `authCheckInProgress = true`, await `checkBackendSession()` (which uses getValidToken → GET /api/auth/session), then update cache and either toggle tray or open login.
4. **getValidToken()** (used inside checkBackendSession): read from storage; if token age &gt; 50 min, refresh via Firebase securetoken; return ID token or throw.
5. **checkBackendSession()**: getValidToken() → GET /api/auth/session with Bearer token; on 401/403 call clearAuthState() and return `{ authenticated: false }`; otherwise return response body.

So: **click → sessionCache (optional short-circuit) → getValidToken → checkBackendSession → GET /api/auth/session → tray or login.** After dashboard logout, tokens are still in storage and still valid for the backend, so both the cache path and the full path can keep the user "authenticated" and the tray open.

---

## PART 6 — Token Lifetime

### Firebase ID token lifetime

Firebase ID tokens have a **1-hour (3600s) lifetime** by default. The extension does not set a custom lifetime; it relies on Firebase.

### TOKEN_MAX_AGE_MS

```15:16:echly-extension/src/background.ts
const SESSION_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes — use cache if validated within this window
const TOKEN_MAX_AGE_MS = 50 * 60 * 1000; // 50 minutes — refresh ID token before expiry
```

- **SESSION_CACHE_TTL_MS:** 5 minutes — how long the in-memory session cache is trusted for the "instant tray" path.
- **TOKEN_MAX_AGE_MS:** 50 minutes — after this age (since `echlyTokenTime`), `getValidToken()` calls `refreshIdToken()` instead of returning the stored ID token.

### How token refresh works

- **getValidToken()** (lines 329–336): If `Date.now() - stored.tokenTime > TOKEN_MAX_AGE_MS`, it calls `refreshIdToken()` and returns the new ID token; otherwise returns stored `idToken`. Throws `NOT_AUTHENTICATED` if no tokens or refresh fails.
- **refreshIdToken()** (lines 285–322): POST to Firebase `https://securetoken.googleapis.com/v1/token` with `grant_type=refresh_token` and stored refresh token; on success writes new `echlyIdToken`, `echlyRefreshToken` (or keeps old), and `echlyTokenTime: Date.now()` to `chrome.storage.local`.

So the extension keeps the ID token under 50 minutes by refreshing before the 1-hour expiry. Logout does not change this: the refresh token is not revoked by dashboard signOut, so the extension can keep refreshing and the backend will keep accepting the new ID tokens.

### Whether logout invalidates tokens

**No.** Dashboard `signOut(auth)` does not revoke ID or refresh tokens. The backend does not invalidate them either. So after logout:

- Existing ID token remains valid until expiry (~1 hour).
- Refresh token remains valid until explicitly revoked (e.g. Firebase Admin `revokeRefreshTokens()`), so the extension can keep getting new ID tokens.

### Whether extension will keep working after dashboard logout

**Yes, until token expiry or revocation.** The extension will:

- Still have tokens in storage.
- Still pass GET /api/auth/session (backend returns 200).
- On icon click, either use the 5-min cache and show the tray, or run checkBackendSession() and still get `authenticated: true`.
- Continue to refresh and call APIs until the refresh token is revoked or something else causes 401/403.

So the extension can appear "still logged in" and fully functional after dashboard logout.

---

## PART 7 — API Calls During Feedback Submission

### ECHLY_UPLOAD_SCREENSHOT

**Uses getValidToken(); no explicit backend session check.**

```957:968:echly-extension/src/background.ts
  if (request.type === "ECHLY_UPLOAD_SCREENSHOT") {
    (async () => {
      try {
        const { imageDataUrl, sessionId, screenshotId } = request as { ... };
        const token = await getValidToken();
        const res = await fetch(`${API_BASE}/api/upload-screenshot`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          ...
        });
        if (res.status === 401 || res.status === 403) clearAuthState();
```

- Calls **getValidToken()**.
- Does **not** call checkBackendSession() or GET /api/auth/session first.
- On 401/403 from upload-screenshot, calls **clearAuthState()**.

### ECHLY_PROCESS_FEEDBACK

**Uses getValidToken(); no explicit backend session check.**

```1022:1025:echly-extension/src/background.ts
    (async () => {
      try {
        const token = await getValidToken();
        // ... structure-feedback and feedback API calls with Bearer token
```

- Uses **getValidToken()** for structure-feedback and feedback POSTs.
- Does **not** call checkBackendSession() beforehand.
- On 401/403 from structure-feedback (line 994) or feedback create (line 1051), or in catch (line 1118), can call **clearAuthState()**.

### ECHLY_SET_ACTIVE_SESSION

**Uses getValidToken(); no explicit backend session check.**

```469:476:echly-extension/src/background.ts
      try {
        const token = await getValidToken();
        const [feedbackRes, sessionsRes] = await Promise.all([
          fetch(`${API_BASE}/api/feedback?sessionId=...`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/sessions`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (feedbackRes.status === 401 || sessionsRes.status === 401 || ...) {
          clearAuthState();
        }
```

- Calls **getValidToken()**.
- Does **not** call checkBackendSession() first.
- On 401/403 from feedback or sessions, calls **clearAuthState()**.

**Summary:** All three handlers use **getValidToken()** and clear auth on 401/403. None call **checkBackendSession()** before the operation. They rely on the backend rejecting invalid/expired tokens; after dashboard logout the tokens are still valid, so these calls do not trigger clearAuthState().

---

## PART 8 — Session Revocation Possibility

### Firebase Admin `revokeRefreshTokens()`

**Not implemented.** Grep for `revokeRefreshTokens` in the repo returns no matches. The backend does not use Firebase Admin SDK to revoke refresh tokens on logout.

### Consequences

- Dashboard logout only clears the **client** Firebase state. It does not revoke the refresh token.
- The extension’s refresh token remains valid; it can keep refreshing and getting new ID tokens.
- The backend only validates JWTs; it cannot tell that the user "signed out" in the dashboard.
- So the extension remains authenticated until:
  - The refresh token is revoked elsewhere (e.g. password change, account disable, or a future implementation of `revokeRefreshTokens(uid)` on logout), or
  - The extension is uninstalled/reinstalled or storage is cleared, or
  - Some other 401/403 path triggers clearAuthState().

---

## PART 9 — Runtime Trace

### Trace 1: User logs in

1. User completes login on login page (e.g. Firebase).
2. Login page (or bridge) sends message **ECHLY_EXTENSION_AUTH_SUCCESS** with `idToken` and `refreshToken`.
3. Extension background stores them: `chrome.storage.local.set({ echlyIdToken, echlyRefreshToken, echlyTokenTime: Date.now() })`.
4. Background calls **validateSessionAndOpenTray()**: getValidToken() → GET /api/auth/session with Bearer token.
5. Backend returns 200 → `sessionCache = { authenticated: true, checkedAt: Date.now() }`, tray visible/expanded, persist, broadcast, switch to origin tab, close login tab if on /login.
6. **Result:** Tokens in extension storage; sessionCache authenticated; tray open.

### Trace 2: User logs out from dashboard

1. User clicks "Sign out" in ProfileCommandPanel.
2. **handleSignOut()** runs: **signOut(auth)** (Firebase), **onClose()**. No message to extension, no clearing of chrome.storage.
3. Firebase clears in-browser auth; `onAuthStateChanged` fires with null; useAuthGuard calls **clearAuthTokenCache()** and redirects to /login.
4. **Extension state unchanged:** chrome.storage.local still has echlyIdToken, echlyRefreshToken, echlyTokenTime; sessionCache still has authenticated: true and checkedAt from last successful check (if within last 5 min or from prewarm); globalUIState still has user and visible/expanded.

### Trace 3: User clicks extension after dashboard logout

**Case A — Cache hit (within 5 min of last check)**

1. User clicks extension icon.
2. Condition: `sessionCache.authenticated === true && Date.now() - sessionCache.checkedAt < SESSION_CACHE_TTL_MS` → **true**.
3. Tray is toggled **immediately** (visible/expanded, persist, broadcast). **Tray opens.**
4. **checkBackendSession()** runs in background: getValidToken() (reads from storage, token still valid) → GET /api/auth/session with Bearer token.
5. Backend **verifyIdToken()** succeeds (token not revoked, not expired) → 200, `{ authenticated: true, user: { uid } }`.
6. **sessionCache** updated: `sessionCache = { authenticated: true, checkedAt: Date.now() }`. **clearAuthState() is not called.**
7. **Result:** Tray stays open; extension still "authenticated."

**Case B — Cache miss (e.g. first click after 5+ min)**

1. User clicks extension icon.
2. Cache condition false → await **checkBackendSession()**.
3. getValidToken() returns stored ID token (or refreshes with stored refresh token).
4. GET /api/auth/session → backend accepts token → 200, `{ authenticated: true }`.
5. **sessionCache = { authenticated: true, checkedAt: Date.now() }**; tray opened/expanded; no login tab.
6. **Result:** Same as Case A — tray opens, extension still authenticated.

### Why the tray still opens

1. **Dashboard logout does not touch the extension:** No clearing of chrome.storage, no message, no revocation.
2. **Tokens remain valid:** signOut(auth) does not revoke ID or refresh tokens; backend does not maintain revocation.
3. **Backend still accepts the token:** GET /api/auth/session returns 200 with the same Bearer token.
4. **Session cache:** If the last check was within 5 minutes, the tray opens immediately from cache; then checkBackendSession() runs and again gets 200, so cache stays true. If cache expired, the full path still gets 200 and opens the tray.
5. **No revocation:** Without Firebase Admin revokeRefreshTokens (or equivalent), the extension has no way to become "logged out" just because the user signed out on the dashboard.

So the extension "still believes the user is authenticated" because: (a) it was never told about logout, (b) its tokens are still valid, and (c) the backend does not distinguish "signed out" from "signed in" for the same valid JWT.

---

## Root Cause Hypothesis

1. **Dual source of truth:** Dashboard auth (Firebase in-browser) and extension auth (chrome.storage.local + backend session check) are independent. Logout is only applied on the dashboard side.
2. **No logout propagation:** Dashboard does not notify the extension or clear extension storage. Extension has no listener for Firebase auth state or logout.
3. **No server-side revocation:** Backend only validates JWT signature/expiry/issuer/audience. Firebase signOut does not revoke tokens; backend does not call revokeRefreshTokens or maintain a revocation list. So tokens in the extension remain valid after dashboard logout.
4. **Cache and backend agree:** sessionCache is set from a successful GET /api/auth/session. After logout, that endpoint still returns 200 for the extension’s token, so both the 5-min cache and the full click path keep the user "authenticated" and the tray open.

---

## Recommended Architecture Fixes (for later implementation)

1. **Propagate logout to the extension**
   - On dashboard logout: send a message to the extension (e.g. via a dedicated logout page the extension can inject into, or a small helper on the dashboard that posts to the extension) to clear storage and session cache and close the tray. Optionally: call an API that records "user logged out" so the extension can poll or be notified.

2. **Revoke refresh tokens on logout**
   - On dashboard logout (or from a backend logout API): use Firebase Admin `revokeRefreshTokens(uid)`. Then the next extension refresh will fail; getValidToken() will throw; checkBackendSession() or API calls will lead to clearAuthState(). Requires a backend endpoint or trusted server that has Admin SDK and is called on logout.

3. **Short-lived session cache when not recently validated**
   - Reduce SESSION_CACHE_TTL_MS or tie the "instant tray" path to a recent explicit session check (e.g. within 1 min). This does not fix the underlying validity of the token but reduces the window where the tray opens purely from cache before any backend check.

4. **Single source of truth**
   - Prefer one place that defines "user is logged out" (e.g. backend session store or Firebase revocation). Have both dashboard and extension depend on that (e.g. extension periodically calls GET /api/auth/session and clears state on 401; backend returns 401 when refresh tokens are revoked or when a server-side "session" is invalidated on logout).

5. **Document and test**
   - Document that dashboard logout does not currently revoke extension tokens and that the extension will stay authenticated until token expiry or revocation. Add an E2E test: login in extension → logout on dashboard → click extension → assert tray eventually closes or login is shown after revocation/expiry.

---

**End of diagnostic report.** No code was modified.
