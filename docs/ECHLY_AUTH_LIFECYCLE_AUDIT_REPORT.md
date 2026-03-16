# Echly Chrome Extension — Complete Authentication Lifecycle Audit

**Date:** 2025-03-16  
**Type:** Diagnostic audit only (no code modifications).  
**Goal:** Determine how login/logout behave across dashboard, extension auth broker, extension token system, and backend; whether logout is handled correctly; and whether the extension should invalidate authentication when the dashboard session ends.

---

## 1. Authentication Lifecycle Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              AUTHENTICATION LIFECYCLE                                     │
└─────────────────────────────────────────────────────────────────────────────────────────┘

  LOGIN (Dashboard)
  ─────────────────
  User → Firebase sign-in (e.g. Google) → Login page calls createSessionCookie()
       → POST /api/auth/session { idToken }
       → Backend: verifyIdToken() → signSessionPayload() → Set-Cookie: echly_session=<JWT>
       → Cookie: echly_session (httpOnly, 7 days, path=/, sameSite=lax)

  EXTENSION AUTH (no credentials in extension)
  ──────────────────────────────────────────
  User clicks extension → Background: getValidToken()
       → If no valid token: chrome.tabs.create(/extension-auth)
       → /extension-auth loads → POST /api/extension/session (credentials: include)
       → Backend: getSessionUser(request) reads echly_session cookie
           • Cookie missing/invalid → 401 → extension-auth redirects to /login?returnUrl=/extension-auth
           • Cookie valid → SignJWT({ uid, email, type: "extension" }, 15m) → 200 { extensionToken, user }
       → extension-auth: postMessage({ type: "ECHLY_EXTENSION_TOKEN", token, user })
       → sessionRelay (content on extension-auth): chrome.runtime.sendMessage → Background
       → Background: extensionToken = token, extensionTokenExpiresAt = now + 14min,
                     setExtensionToken(), sw.extensionToken, sw.currentUser = user
       → Tab closes; widget loads with authenticated state

  API REQUESTS (Extension)
  ───────────────────────
  Background apiFetch(url) → Authorization: Bearer <extensionToken>
       → Backend: requireAuth(request) → Bearer? → verifyExtensionToken(token)
           • Valid & not expired (≤15m) → 200 + handler
           • Invalid/expired → 401 Unauthorized
       → Extension: apiFetch does NOT check res.status; does NOT clear token on 401

  LOGOUT (Dashboard) — CURRENT BEHAVIOUR
  ─────────────────────────────────────
  User clicks "Sign out" in ProfileCommandPanel
       → handleSignOut() → signOut(auth)  [Firebase only]
       → echly_session cookie is NOT cleared, NOT overwritten, NOT expired
       → Extension: no message, no webhook, no token revocation
       → extensionToken and sw.currentUser remain in memory until:
           (a) extensionTokenExpiresAt passes (14 min), or
           (b) service worker restarts (token lost), or
           (c) user triggers new auth flow (opens /extension-auth again)

  RESULT: After dashboard logout, extension continues to appear authenticated for up to ~14 minutes
          and can continue to call APIs successfully until the extension token expires (15m backend).
```

---

## 2. Dashboard Login / Logout Behaviour

### 2.1 Dashboard login

| Item | Finding |
|------|--------|
| **Login route** | `app/(auth)/login/page.tsx` — Google (or email/password) sign-in via Firebase. |
| **Session creation** | On success, `createSessionCookie(user)` is called: `POST /api/auth/session` with `{ idToken }` (Firebase ID token). |
| **Session cookie** | **Name:** `echly_session`. Set in `app/api/auth/session/route.ts`: `response.cookies.set(SESSION_COOKIE_NAME, token, { httpOnly: true, secure (prod), sameSite: "lax", path: "/", maxAge: SESSION_MAX_AGE_SECONDS })`. |
| **Cookie lifetime** | `SESSION_MAX_AGE_SECONDS` = 7 days (`lib/server/session.ts`: `MAX_AGE_SECONDS = 7 * 24 * 60 * 60`). |
| **Cookie content** | JWT signed with `SESSION_SECRET` (or dev fallback), payload: `{ uid, email, name }`, same 7-day exp. |

### 2.2 Dashboard logout

| Item | Finding |
|------|--------|
| **Logout route / handler** | `components/layout/ProfileCommandPanel.tsx`: `handleSignOut()` → `signOut(auth)` (Firebase only). |
| **Cookie on logout** | **The `echly_session` cookie is never deleted or cleared.** No API call to clear the cookie, no `response.cookies.set(..., { maxAge: 0 })`, no logout route that touches the session. |
| **Extension tokens on logout** | **No revocation.** No dashboard webhook, no call to revoke extension tokens, no server-side revocation list. |

**Conclusion:** Dashboard logout only signs the user out of Firebase. The server session cookie remains valid until it expires (7 days) or is overwritten by a new login. Extension tokens are not invalidated.

---

## 3. Extension Auth Broker (/extension-auth)

### 3.1 Implementation

| Check | Status |
|-------|--------|
| Calls `POST /api/extension/session` | Yes. `app/extension-auth/page.tsx`: `fetch("/api/extension/session", { method: "POST", credentials: "include" })`. |
| Sends token + user via postMessage | Yes. `window.postMessage({ type: "ECHLY_EXTENSION_TOKEN", token: data.extensionToken, user: data.user }, "*")`. |
| Only works when dashboard session exists | Yes. Backend uses `getSessionUser(request)` (reads `echly_session`). No cookie → 401. |

### 3.2 If user is logged out of dashboard

- **Does /extension-auth redirect to login?**  
  **Only when the backend returns 401.** If the cookie is still present (current behaviour: logout does not clear it), the backend returns 200 and a new extension token. So after “logout”, if the user still has the cookie, opening /extension-auth would still succeed and issue a new token.
- **Does it still generate extension tokens after logout?**  
  **Yes, as long as `echly_session` is still in the browser.** Because logout does not clear the cookie, the extension-auth page can still exchange it for a new extension token.

So: **logout does not stop the broker from issuing tokens** until the session cookie is gone (e.g. cleared by user, expired, or overwritten by a future “clear on logout” implementation).

---

## 4. Extension Token Generation (Backend)

**Route:** `POST /api/extension/session` (`app/api/extension/session/route.ts`).

| Aspect | Detail |
|--------|--------|
| **Input** | No body. Session from `echly_session` cookie via `getSessionUser(request)`. |
| **If no/invalid session** | Returns 401 `{ error: "Unauthorized - Missing or invalid session" }`. |
| **Payload** | `{ uid, email, type: "extension" }`. |
| **Signing** | `SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("15m").sign(secret)`. Secret: `EXTENSION_TOKEN_SECRET` (env). |
| **Response** | 200 `{ extensionToken, user: { uid, email } }`. |

**Answers:**

- **Is the token short-lived?** Yes — 15 minutes.
- **Does it contain user UID?** Yes — `uid` (and `email`, `type: "extension"`).
- **Does it remain valid after dashboard logout?** **Yes.** Validity is only checked by signature and expiry (see Section 5). There is no revocation or “session invalidated” check. So the token stays valid until it expires (~15m) regardless of dashboard logout.

---

## 5. Backend Token Verification

### 5.1 Where it’s used

Extension API routes use `requireAuth(request)` from `lib/server/auth.ts` (e.g. `/api/feedback`, `/api/sessions`, `/api/structure-feedback`, `/api/upload-screenshot`, etc.).  
`POST /api/extension/session` uses only `getSessionUser(request)` (cookie), not Bearer.

### 5.2 requireAuth logic

1. **Authorization: Bearer &lt;token&gt;**  
   - Tries Firebase ID token verification first; on failure, tries **extension token** via `verifyExtensionToken(token)` (`lib/server/extensionAuth.ts`).
2. **Extension token verification** (`lib/server/extensionAuth.ts`):  
   - `jwtVerify(token, secret, { maxTokenAge: "15m" })`, checks `payload.type === "extension"`.  
   - Returns payload or `null`. No revocation list, no session lookup.

### 5.3 Behaviour for “logged-out” user

| Question | Answer |
|----------|--------|
| What happens if the token belongs to a user who “logged out” on the dashboard? | **Backend still accepts the token.** Logout does not invalidate the JWT. |
| Does the backend still accept the token? | Yes, as long as it is valid (signature + within 15m). |
| Does the backend return 401 when the token becomes invalid? | Only when the token is **expired or malformed**. Not when the user has “logged out” on the dashboard. |

So: **logout does not cause the backend to reject existing extension tokens.**

---

## 6. Extension Background Auth State

### 6.1 Variables (background)

- **extensionToken** — In-memory JWT from broker; not in chrome.storage.
- **extensionTokenExpiresAt** — Client-side expiry: `Date.now() + EXTENSION_TOKEN_TTL_MS` where `EXTENSION_TOKEN_TTL_MS = 14 * 60 * 1000` (14 min).
- **sw.currentUser** — Set when receiving `ECHLY_EXTENSION_TOKEN` (and from ECHLY_SET_EXTENSION_TOKEN). Cleared only when token is cleared (see below).
- **utils/apiFetch.ts** — Module-level `extensionToken`; updated via `setExtensionToken(token)` from background.

### 6.2 Key functions

- **getValidToken()**  
  - If cached token exists and `now < extensionTokenExpiresAt`, returns it.  
  - Otherwise sets `extensionToken = null`, `extensionTokenExpiresAt = null`, then runs token request (broker).  
  - So token is only cleared when **refreshing** (before opening broker), not on 401.

- **getExtensionToken()**  
  - Same cache check; on miss opens `/extension-auth` tab and waits for `ECHLY_EXTENSION_TOKEN`.  
  - No 401 handling here (broker page does the fetch).

- **ECHLY_GET_AUTH_STATE**  
  - Calls `hydrateAuthState()` which uses `getValidToken()` and returns `{ authenticated, user: sw.currentUser }`.  
  - No 401 handling or token clearing.

### 6.3 401 handling

- **apiFetch** (`echly-extension/utils/apiFetch.ts`): Sends `Authorization: Bearer ${extensionToken}`. **Does not inspect response status; does not clear token on 401.**
- **Background callers** (e.g. ECHLY_PROCESS_FEEDBACK, ECHLY_UPLOAD_SCREENSHOT, echly-api): Use `apiFetch` and handle `!res.ok` for business logic, but **none of them clear extensionToken or sw.currentUser on 401**.
- **echly-api** handler: On catch (e.g. NOT_AUTHENTICATED), sends `status: 401` in the response to the content script but does not clear the in-memory token.

**Conclusion:** The extension does **not** revalidate the token with the backend on a schedule. It does **not** clear auth state when the backend returns 401. Token/user are only cleared when the client-side expiry (14 min) is reached and a new token is requested (and then only as part of the refresh path).

---

## 7. Logout Propagation

| Mechanism | Exists? | Notes |
|-----------|--------|--------|
| Dashboard logout webhook to extension | No | No message or API call from dashboard to extension on sign-out. |
| Token revocation (server-side) | No | No revocation list or blacklist; extension JWTs are valid until expiry. |
| Session revocation (invalidate echly_session) | No | Logout does not clear or invalidate the session cookie. |
| Extension logout detection (e.g. polling /api/extension/session) | No | Extension does not check dashboard session validity except when opening /extension-auth to get a new token. |

**How does the extension know the user logged out?**  
It does not. There is no signal from dashboard to extension and no proactive check.

**Does it ever clear extensionToken automatically?**  
Only when:
1. It considers the token expired (client-side: 14 min), and then only as part of starting a new token request (getValidToken clears cache before calling getExtensionToken).
2. Service worker restarts (in-memory state is lost).

---

## 8. Token Expiration Policy

| Question | Answer |
|----------|--------|
| Extension token expiration time | **15 minutes** (backend: `setExpirationTime("15m")` in `app/api/extension/session/route.ts`). |
| Is expiration enforced in the backend? | Yes. `verifyExtensionToken` uses `maxTokenAge: "15m"` in `jwtVerify`. |
| Is expiration checked in the extension? | Yes. Client-side: token treated valid only if `now < extensionTokenExpiresAt` where `extensionTokenExpiresAt = Date.now() + 14 * 60 * 1000` (14 min). So the extension refreshes before the backend would reject. |

Session cookie (dashboard): 7 days. No explicit “extension session” TTL beyond the 15m token.

---

## 9. Security Analysis

### 9.1 Is it acceptable for extension tokens to remain valid after dashboard logout?

**From a strict “session = dashboard session” view: no.**  
Expected behaviour for many products: “Sign out” means the user is signed out everywhere, including the extension. Here, the extension stays authenticated for up to ~15 minutes after dashboard logout, and the dashboard session cookie is still present, so even reopening the broker would issue a new token.

### 9.2 Risks

1. **Session cookie not cleared on logout**  
   - Anyone with access to the same browser can open /extension-auth (or the extension can) and obtain a new extension token as long as the cookie is there (up to 7 days).
2. **No revocation**  
   - Stolen or copied extension tokens cannot be revoked; they work until 15m expiry.
3. **Extension UX**  
   - User believes they signed out, but the widget still shows them as signed in and can perform actions on their behalf until token expiry or SW restart.
4. **Shared devices**  
   - If the user logs out on the dashboard but leaves the browser open, the extension remains usable.

### 9.3 Should tokens be revoked immediately on logout?

**Recommended: yes, for consistency and user expectation.**  
That would require at least one of:

- **Option A — Cookie invalidation:** On dashboard logout, clear (or overwrite) the `echly_session` cookie so that:
  - New extension tokens cannot be issued via /extension-auth.
  - Existing extension tokens are still valid until 15m unless Option B is added.
- **Option B — Token revocation:** Backend maintains a revocation list (or short-lived “session id” in the token checked against a store) and rejects tokens after logout. Then the extension must handle 401 by clearing auth state and prompting re-login.
- **Option C — Extension notified:** On logout, dashboard (or a logout API) notifies the extension (e.g. via a known tab or a dedicated channel) to clear token and currentUser. This improves UX immediately; token still valid on backend until 15m unless combined with Option B.

---

## 10. Recommended Fixes (Summary)

1. **Dashboard logout:** Clear or invalidate the `echly_session` cookie on sign-out (e.g. call a logout API that sets the cookie with `maxAge: 0` or an empty value), so that:
   - /extension-auth and POST /api/extension/session return 401 when the user has logged out.
2. **Extension:** On any API response with status 401, clear in-memory auth state (`extensionToken`, `extensionTokenExpiresAt`, `sw.currentUser`, `setExtensionToken(null)`) and optionally prompt the user to sign in again (e.g. open /extension-auth or show “Sign in” in the widget).
3. **Optional:** Add a small logout API (e.g. POST /api/auth/logout) that clears the session cookie and, if desired, registers extension tokens for revocation so that backend returns 401 for those tokens after logout.
4. **Optional:** Shorten extension token TTL (e.g. 5–10 minutes) to reduce the window where a token is valid after logout if revocation is not implemented.

---

## 11. Is the Phase 4 Authentication System Production-Safe?

**Summary:** The Phase 4 auth broker (dashboard session → extension token via /extension-auth, Bearer token for API calls, 15m token TTL) is **implemented and consistent** for the “happy path”: login → cookie → broker → token → API calls. Backend verification and extension use of the token are aligned.

**Gap:** **Logout is not propagated.** Dashboard logout does not:

- Clear the dashboard session cookie.
- Revoke or invalidate extension tokens.
- Notify the extension to clear auth state.

So from a **security and UX perspective it is not production-safe** for the stated expectation that “when the user logs out of the dashboard, the extension should no longer be authenticated.” For a production launch where logout-everywhere is required, the recommended fixes above (at minimum: clear session cookie on logout + extension 401 handling and clearing auth state) should be implemented.

---

**End of report. No code was modified.**
