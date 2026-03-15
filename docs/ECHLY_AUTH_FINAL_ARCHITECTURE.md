# Echly Authentication — Final Production Architecture

This document describes the production-grade authentication stabilization system: Firebase Admin verification, refresh token revocation, and extension–dashboard logout synchronization.

---

## 1. Firebase Admin verification

**Before:** The backend verified Firebase ID tokens using the `jose` library and a remote JWKS (public keys only). Tokens were checked for signature and claims but **not** for revocation. A user who logged out on the dashboard could still use the same ID token from the extension until it expired (e.g. ~1 hour).

**After:** The backend uses the **Firebase Admin SDK** (`firebase-admin`) with a **service account** to verify tokens:

- **File:** `lib/server/firebaseAdmin.ts`  
  - Initializes the Admin app once with `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` from environment.
  - Exports `adminAuth` from `firebase-admin/auth`.

- **File:** `lib/server/auth.ts`  
  - `verifyIdToken(token)` calls `adminAuth.verifyIdToken(token, true)`.
  - The second argument `true` enables **revoked token detection**: if refresh tokens for that user have been revoked, verification fails and the backend returns 401.

**Security improvements:**

- Server-side verification with the project’s private credential (not just public JWKS).
- Revocation is enforced: after logout, no existing or refreshed ID token for that user is accepted.
- Single source of truth for “is this token still valid?” on the server.

---

## 2. Refresh token revocation

**Mechanism:** When the user logs out on the dashboard, the client calls the new **logout API** before signing out of Firebase in the client.

- **Endpoint:** `POST /api/auth/logout`
- **File:** `app/api/auth/logout/route.ts`
- **Behavior:**
  1. Uses `requireAuth(req)` to validate the current ID token (and thus get the user’s `uid`).
  2. Calls `adminAuth.revokeRefreshTokens(user.uid)`.
  3. Returns 200 on success; 401 if the request is unauthenticated.

**Effect of `revokeRefreshTokens(uid)`:**

- Firebase invalidates **all refresh tokens** for that user.
- Any existing ID token for that user is considered revoked once revocation is checked (`verifyIdToken(..., true)`).
- New ID tokens cannot be obtained because refresh no longer works.
- The extension’s stored refresh token becomes useless; the next backend call with any ID token (existing or refreshed) will get 401 after verification.

---

## 3. Dashboard logout flow

**File:** `components/layout/ProfileCommandPanel.tsx`

**Updated `handleSignOut`:**

1. If there is a current Firebase user, get an ID token with `user.getIdToken()`.
2. Call `POST /api/auth/logout` with `Authorization: Bearer <token>` (so the server can identify the user and revoke refresh tokens).
3. Ignore logout API errors in the UI (log to console) so the user can always sign out locally.
4. Call `signOut(auth)` to clear the Firebase client state and close the panel.

Result: **revoke first, then client sign-out**. The server revokes refresh tokens for that user so the extension cannot obtain or use valid tokens after dashboard logout.

---

## 4. Extension logout synchronization

**No change to extension architecture.** The extension already treats 401/403 from the backend as “not authenticated” and clears local auth state.

**Relevant logic in `echly-extension/src/background.ts`:**

- **`checkBackendSession()`**  
  Calls `GET /api/auth/session` with the stored token. If the response is **401 or 403**, it calls `clearAuthState()` and returns `{ authenticated: false }`.

- **`clearAuthState()`**  
  Clears session cache, removes stored tokens (e.g. `echlyIdToken`, `echlyRefreshToken`, `echlyTokenTime`), closes the tray, and broadcasts state so the UI shows unauthenticated.

**Flow after dashboard logout:**

1. User logs out on the dashboard → logout API revokes refresh tokens.
2. Extension still has old tokens in storage and may have a short-lived session cache.
3. On next use (e.g. icon click), the extension calls `checkBackendSession()` → `GET /api/auth/session` with the stored token.
4. Backend runs `verifyIdToken(token, true)` → revocation check fails → 401.
5. Extension receives 401 → `clearAuthState()` → tray closes, login page opens.
6. Extension no longer accesses APIs until the user logs in again (e.g. via login page).

So **extension logout is driven by the backend response**, not by a separate channel. No new extension architecture is required; only the backend had to become revocation-aware.

---

## 5. Security improvements summary

| Area | Before | After |
|------|--------|--------|
| Token verification | JWKS only (signature + claims) | Firebase Admin with revocation check |
| Logout scope | Client-only (dashboard) | Server revokes all refresh tokens for user |
| Extension after dashboard logout | Could still use tokens until expiry | Next API call gets 401 → extension clears auth |
| Credential handling | Public keys only | Service account server-side (env vars) |

---

## 6. Environment variables (Firebase Admin)

Add to `.env.local` (and configure in your deployment environment):

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**How to obtain:**

1. Firebase Console → Project Settings → Service Accounts.
2. Generate new private key (JSON).
3. From the JSON: use `project_id`, `client_email`, and `private_key`.  
   For `FIREBASE_PRIVATE_KEY`, keep the key as a single string with `\n` for newlines (as in the JSON); `lib/server/firebaseAdmin.ts` replaces `\\n` with real newlines for the SDK.

---

## 7. Full logout flow (test checklist)

Expected sequence:

1. Log in on the dashboard.
2. Open the extension (tray opens, authenticated).
3. Log out on the dashboard (Profile → Sign out).
4. Click the extension again.
5. Backend validates token with revocation → returns 401.
6. Extension runs `clearAuthState()` and opens the login page.
7. Extension no longer accesses APIs until the user logs in again.

This gives **instant logout semantics** across dashboard and extension while keeping the existing extension design and a single source of truth (backend + Firebase Admin) for token validity and revocation.
