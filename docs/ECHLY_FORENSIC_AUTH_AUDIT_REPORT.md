# Echly — Full Forensic Authentication Audit Report

**Date:** 2025-03-14  
**Scope:** Chrome Extension + Next.js Web Dashboard  
**Symptom:** User logs in successfully; `/dashboard` shows authenticated; visiting `/login` again shows login form (no redirect); extension keeps redirecting to login after successful login.  
**Conclusion:** Auth state is not detected consistently across login page, dashboard, and extension.

---

## PART 1 — Firebase Initialization

### Search: `firebase`, `initializeApp`, `getAuth`, `onAuthStateChanged`, `currentUser`

| FILE | FUNCTION | FIREBASE CONFIG USED | AUTH INSTANCE NAME |
|------|----------|----------------------|---------------------|
| `lib/firebase.ts` | Module init | `firebaseConfig` from `./firebase/config` | `auth` (exported); `window.firebase.auth` → same `auth` |
| `lib/firebase/config.ts` | N/A (config only) | `firebaseConfig` (apiKey, authDomain, projectId, etc.) | N/A |
| `echly-extension/src/firebase.ts` | Module init | Same `firebaseConfig` from `../../lib/firebase/config` | `auth` (extension context only) |
| `app/(auth)/login/page.tsx` | `LoginContent` (useEffect) | Uses `auth` from `@/lib/firebase` | Same as lib |
| `lib/auth/authActions.ts` | `signInWithGoogle`, `signInWithEmailPassword` | Uses `auth` from `@/lib/firebase` | Same |
| `lib/hooks/useAuthGuard.ts` | `useAuthGuard` | `auth` from `@/lib/firebase`; uses `onAuthStateChanged(auth, …)` | Same |
| `app/(app)/dashboard/sessions/page.tsx` | Sessions page | `onAuthStateChanged(auth, …)` | Same |
| `app/(app)/dashboard/hooks/useWorkspaceOverview.ts` | `useWorkspaceOverview` | `onAuthStateChanged(auth, …)` | Same |
| `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx` | Session page | `useAuthGuard({ router })` | Same |
| `app/(app)/folders/[folderId]/page.tsx` | Folder page | `onAuthStateChanged(auth, …)` + `auth.currentUser` | Same |
| `app/onboarding/page.tsx` | Onboarding | `onAuthStateChanged(auth, …)` | Same |
| `app/page.tsx` | Home | `onAuthStateChanged(auth, …)` | Same |
| `lib/uploadAttachment.ts` | Server/client | `auth.currentUser` from `@/lib/firebase` | Same |

### Verification

- **Only ONE Firebase app for the web app:** Yes. A single `initializeApp(firebaseConfig)` in `lib/firebase.ts`; no other `initializeApp` in the Next.js app.
- **Dashboard and login use the SAME Firebase config:** Yes. Both use `auth` from `@/lib/firebase`, which uses `lib/firebase/config.ts`.
- **Duplicate Firebase initialization:**  
  - **Web:** One app in `lib/firebase.ts`.  
  - **Extension:** A second, separate app in `echly-extension/src/firebase.ts` (`getAuth` from `firebase/auth/web-extension`). The extension does **not** use this auth for the token bridge; the bridge reads from the **page’s** `window.firebase.auth()` (the web app’s auth). So for “who sees the session on the dashboard/login,” only the web app’s single Firebase app matters.

---

## PART 2 — Login Flow

### Locations

- **Login UI / handlers:** `app/(auth)/login/page.tsx` — `handleGoogle`, `handleEmail`.
- **Firebase sign-in:** `lib/auth/authActions.ts` — `signInWithGoogle()` (popup), `signInWithEmailPassword()`.

### Sequence

1. **Login button click**  
   User clicks “Continue with Google” or submits email form → `handleGoogle()` or `handleEmail()`.

2. **Firebase authentication**  
   - Google: `signInWithPopup(auth, GoogleAuthProvider)` in `authActions.ts`.  
   - Email: `signInWithEmailAndPassword(auth, email, password)` in `authActions.ts`.  
   Both use `auth` from `@/lib/firebase` (web app’s single app).

3. **After success (login page)**  
   - **Extension flow** (`?extension=true`):  
     - Sends `ECHLY_EXTENSION_LOGIN_COMPLETE` to background.  
     - Then `window.location.href = '/dashboard?extension=true&...'` (full page navigation).  
   - **Non-extension:**  
     - `checkUserWorkspace(user.uid)` → `"dashboard"` or `"onboarding"`.  
     - `router.replace("/dashboard")` or `router.replace("/onboarding")`.

4. **Redirect**  
   - Extension: hard redirect to `/dashboard?extension=true&...`.  
   - Non-extension: client-side `router.replace` to `/dashboard` or `/onboarding`.

5. **Auth state listener**  
   - Login page: `onAuthStateChanged(auth, (user) => { if (user) redirect to dashboard; else setAuthChecked(true); })`.  
   - No explicit post-login listener elsewhere for “redirect if already logged in” on login; that’s entirely this effect.

### Findings

- **Firebase session persistence:** Not explicitly set. No `setPersistence` in the repo (see Part 5). Default for browser is **local** persistence (IndexedDB).
- **User in localStorage/sessionStorage:** Not stored by app code. Firebase SDK may use IndexedDB/localStorage internally; app does not write auth to localStorage/sessionStorage.
- **Auth state after redirect:** After `window.location.href = '/dashboard'`, the dashboard loads in a new page load. Auth state is expected to be restored from Firebase’s default persistence. If that restoration is delayed or fails on `/login` (or the extension reads the page too early), the symptoms you see are consistent.

---

## PART 3 — Login Page Auth Detection

### File: `app/(auth)/login/page.tsx`

- **Does the page check for an existing Firebase session?**  
  **Yes.** It uses `onAuthStateChanged(auth, (user) => { … })` in a `useEffect`.

- **Behavior when a logged-in user visits `/login`:**
  1. Component mounts, `authChecked` is `false` → “Loading…” is shown.
  2. `useEffect` runs and subscribes to `onAuthStateChanged(auth, callback)`.
  3. **First callback:**
     - If `user != null` → build `dashboardUrl`, `window.location.href = dashboardUrl`, `return` (redirect; form never shown).
     - If `user == null` → `setAuthChecked(true)`.
  4. If `authChecked` became `true`, the next render shows the **login form** (no redirect).

So the login form is shown whenever the **first** emission from `onAuthStateChanged` is `null`. Only a **later** emission with a non-null `user` triggers the redirect.

- **Implication:** If on first load (or when opening `/login` in a new tab) Firebase’s first emission is `null` (e.g. before persistence is restored), the UI shows the form. If Firebase never emits again with the user on this page (e.g. persistence not restored, or different context), the user stays on the login form even though they are logged in elsewhere (e.g. dashboard). So **the login page can “not detect” the session if the initial auth state is null and a subsequent “user” emission never occurs on that page.**

---

## PART 4 — Dashboard Auth Detection

### How the dashboard knows the user is logged in

- **No middleware protection for `/dashboard`.**  
  `middleware.ts` only applies to `/api/*` and `/admin`; it does not redirect `/login` or `/dashboard`.

- **Per-page auth:**
  - **Root dashboard** `app/(app)/dashboard/page.tsx`: Uses `useWorkspaceOverview()`, which inside calls `onAuthStateChanged(auth, (currentUser) => { if (!currentUser) { clearAuthTokenCache(); router.push("/login"); } else { setUser(currentUser); } })`. So the dashboard relies on **Firebase auth** in the client.
  - **Dashboard sessions** `app/(app)/dashboard/sessions/page.tsx`: Same pattern — `onAuthStateChanged(auth, …)`, redirect to `/login` if no user.
  - **Session detail / overview / settings / insights / discussion / admin:** Use `useAuthGuard({ router })` or equivalent, which again uses `onAuthStateChanged(auth, …)` and redirects to `/login` when `currentUser == null`.

- **Backend:**  
  API routes use `requireAuth(req)` from `lib/server/auth.ts`, which reads `Authorization: Bearer <token>` and verifies the Firebase ID token with JWKS. No cookies or server-side session store for auth; **dashboard “knows” the user is logged in only via Firebase auth in the client**, and API calls use the ID token from the client.

**Summary:** Dashboard auth is **entirely Firebase client-side** (`onAuthStateChanged` + optional redirect to `/login`). No cookie/session-based auth; backend only validates the Bearer token.

---

## PART 5 — Firebase Session Persistence

### Search: `setPersistence`, `browserLocalPersistence`, `browserSessionPersistence`, `inMemoryPersistence`

- **Result:** **None of these appear in the app or extension auth flow.** No explicit `setPersistence` anywhere.

- **Default behavior:**  
  For the web app (`firebase/auth`), the default is **local** persistence (typically IndexedDB), so the session survives reloads and new tabs on the same origin.  
  For the extension’s own auth (`firebase/auth/web-extension`), the extension does not use that auth for the token bridge; the bridge uses the **page’s** auth, which uses the web default (local).

- **Conclusion:** Persistence is **not** explicitly set. Default is local persistence. If the login page or the page the extension talks to never “see” the user, it can be due to **timing** (state not restored yet) or **context** (e.g. first emission null and no second emission), not necessarily a different persistence mode.

---

## PART 6 — Cookie / Storage Inspection

### Where the login session is stored

- **App code:** Does **not** store the login session in `localStorage`, `sessionStorage`, or cookies. Auth is left to Firebase.
- **Firebase:** Uses its own storage (typically IndexedDB, keyed by app and origin). Common keys/docs mention patterns like `firebase:authUser`, `firebase:host` in Firebase’s internal storage; the codebase does not reference these directly.
- **Extension:**  
  - Does **not** persist tokens (legacy keys `auth_idToken`, etc. are only **removed** in `clearAuthState()`).  
  - Token is obtained live from the page via the token bridge.

So:

- **Login page and dashboard:** Both use the same origin and same Firebase app → they should read the same Firebase persistence (IndexedDB).
- **Extension token bridge:** Runs in the **page** context and reads `window.firebase.auth().currentUser` (and then `getIdToken()`). So it reads whatever the **page** has in memory after Firebase restores. It does **not** read a separate storage; it relies on the page’s Firebase auth state.

If the page’s Firebase has not restored yet (or has emitted null once and not yet emitted user), the bridge will see `currentUser === null` and the extension will get no token.

---

## PART 7 — Token Bridge

### File: `echly-extension/src/pageTokenBridge.js`

- **How it reads the Firebase user:**  
  On `ECHLY_REQUEST_TOKEN` (after handshake), it does:
  - `user = window.firebase && window.firebase.auth && typeof window.firebase.auth === "function" ? window.firebase.auth().currentUser : null`
  - If `user` is truthy, `token = await user.getIdToken()`, then sends token in `ECHLY_TOKEN_RESPONSE`; otherwise sends `token: null`.

- **When `currentUser` is null:**  
  It sends `sendTokenResponse(null)`. The extension then treats the user as not authenticated and can open the login tab.

- **Does the bridge load before Firebase initializes?**  
  **Yes, it can.**  
  - The bridge is injected by the content script at `document_idle` (see Part 10).  
  - It runs in the **page** context.  
  - `window.firebase` is set only when the Next.js app runs `lib/firebase.ts` (when some component imports `@/lib/firebase`). So when the bridge script first runs, `window.firebase` may still be **undefined**.  
  - When the extension later sends `ECHLY_REQUEST_TOKEN`, the bridge **synchronously** reads `window.firebase.auth().currentUser` at that moment. It does **not** wait for Firebase to be ready or for `onAuthStateChanged` to fire.

- **Does the bridge wait for auth state?**  
  **No.** It does not subscribe to `onAuthStateChanged`; it only reads `currentUser` at request time. So if the request happens before the page has hydrated or before Firebase has restored the user from persistence, the bridge returns null.

---

## PART 8 — Extension Auth Check

### File: `echly-extension/src/background.ts`

**Flow:**

1. **Extension click**  
   `chrome.action.onClicked` → sets `authCheckInProgress`, then calls `checkBackendSession()`.

2. **checkBackendSession()**  
   - Calls `getValidToken()`.  
   - If that throws (no token), calls `clearAuthState()` and returns `{ authenticated: false }`.  
   - If token exists, `GET /api/auth/session` with `Authorization: Bearer <token>`.  
   - If response not ok → clear auth, return not authenticated.  
   - Otherwise returns `{ authenticated: true, user }`.

3. **getValidToken()**  
   - Calls `getTokenFromPage()`.  
   - If result is null/empty, **throws** `new Error("NOT_AUTHENTICATED")`.  
   - Otherwise returns the token string.

4. **getTokenFromPage()**  
   - Finds tabs with dashboard origin (`DASHBOARD_ORIGINS`).  
   - For active tab first, then any dashboard tab: sends `ECHLY_GET_TOKEN_FROM_PAGE` to the content script with a 2000 ms timeout.  
   - Content script uses `requestTokenFromPage()` → handshake with bridge, then `ECHLY_REQUEST_TOKEN` → bridge reads `window.firebase.auth().currentUser` and returns token or null.  
   - If no dashboard tab, or no tab returns a token in time, returns `null`.  
   - **Does not** open a new dashboard tab; returns null if no token is available.

5. **Backend verification**  
   Only if a token was obtained: `GET /api/auth/session` with that token; backend uses `requireAuth(req)` (Bearer token verification via Firebase JWKS).

**When `getTokenFromPage()` returns null:**

- No tab with a dashboard origin exists.
- Every dashboard tab’s content script fails to respond within 2000 ms (e.g. script not ready, or page not ready).
- Handshake with the bridge times out (e.g. bridge not loaded or not responding).
- Token request to the bridge times out (e.g. bridge doesn’t reply in time).
- Bridge returns `token: null` because at the moment of the request:
  - `window.firebase` is undefined (app not hydrated), or
  - `window.firebase.auth().currentUser` is null (Firebase not restored or user not signed in on that page).

So the extension can “not detect” authentication either because there is no dashboard tab, or because the **page’s** Firebase auth is not ready or not signed in at the time of the request.

---

## PART 9 — Redirect Loop Detection

### Redirects involving `/login`, `/dashboard`, `returnUrl`

| Location | Trigger | Action |
|----------|--------|--------|
| `app/(auth)/login/page.tsx` | `onAuthStateChanged` with user | `window.location.href = /dashboard?…` (or returnUrl) |
| `app/(auth)/login/page.tsx` | After Google/email sign-in (extension) | `window.location.href = '/dashboard?extension=true&...'` |
| `app/(auth)/login/page.tsx` | After Google/email sign-in (non-extension) | `router.replace('/dashboard' \| '/onboarding')` |
| `lib/hooks/useAuthGuard.ts` | `onAuthStateChanged` with null + router provided | `router.push("/login")` or `router.replace("/login")` |
| `app/(app)/dashboard/sessions/page.tsx` | `onAuthStateChanged` with null | `router.push("/login")` |
| `app/(app)/dashboard/hooks/useWorkspaceOverview.ts` | `onAuthStateChanged` with null | `router.push("/login")` |
| `app/(app)/folders/[folderId]/page.tsx` | `onAuthStateChanged` with null | `router.push("/login")` |
| `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx` | useAuthGuard with null | `router.push("/login")` |
| `echly-extension/src/background.ts` | Icon click, `checkBackendSession()` not authenticated | `chrome.tabs.create({ url: ECHLY_LOGIN_BASE + "?extension=true&returnUrl=..." })` |

**Loop scenario (no code change, just explanation):**

1. User completes login; redirects to `/dashboard`.  
2. Dashboard tab loads; React and Firebase start; persistence may not have restored yet.  
3. User (or automation) clicks the extension icon.  
4. Background runs `checkBackendSession()` → `getTokenFromPage()`.  
5. Bridge on dashboard tab returns null (e.g. `currentUser` still null).  
6. `getTokenFromPage()` returns null → `getValidToken()` throws → `checkBackendSession()` returns not authenticated.  
7. Background opens a new tab: login URL with `?extension=true&returnUrl=...`.  
8. User can land on login again; after another login, redirect to dashboard again; cycle can repeat if the extension again asks for a token before the page’s auth is ready.

So the “redirect loop” is not from the login page redirecting to itself, but from the **extension** repeatedly opening the login tab when the dashboard tab does not yet (or never) report a valid token.

---

## PART 10 — Auth State Race Conditions

**Situations where Firebase auth state is not ready yet:**

1. **Page load**  
   - HTML loads, then scripts.  
   - Content script runs at `document_idle` and injects the bridge.  
   - Next.js app hydrates later; `lib/firebase.ts` runs when something imports it.  
   - Firebase Auth then restores from persistence (async).  
   - So for a period: `auth.currentUser` can be **null** even though the user is logged in.

2. **Login page**  
   - If `onAuthStateChanged`’s **first** emission is null (before restore), the login page sets `authChecked = true` and shows the form.  
   - If the **second** emission (with user) is delayed, never fires, or is lost, the user remains on the login form.  
   - So the login page can “read auth too early” in the sense that it commits to “show form” on the first null and only redirects on a later non-null emission.

3. **Token bridge**  
   - The bridge does **not** wait for auth. It reads `currentUser` at request time.  
   - If the extension requests a token right after the dashboard loads (e.g. `tabs.onUpdated` “complete” or user clicking the icon), the bridge may run when:
     - `window.firebase` is still undefined, or  
     - `currentUser` is still null.  
   - So the bridge is effectively “reading auth state too early” whenever the request happens before Firebase has restored the session.

4. **Extension timing**  
   - `TOKEN_REQUEST_TIMEOUT_MS = 2000` and handshake timeouts (e.g. 1500 ms in `requestTokenFromPage.ts`) are fixed. If the page or Firebase need longer to be ready, the extension will still get null and treat the user as unauthenticated.

---

## FINAL DIAGNOSTIC REPORT

### 1) Why the login page does not detect the logged-in session

- The login page **does** check for a session via `onAuthStateChanged(auth, …)`.
- It only redirects when the callback receives a non-null `user`. It shows the login form when it has received a null user (by setting `authChecked = true`).
- If the **first** emission is null (typical before Firebase restores from persistence), the form is shown. If a **second** emission with the user never happens on that page (e.g. persistence not restored in that tab, or timing/context issue), the user stays on the login form.
- So the login page can “not detect” the session if the initial state is null and the restored state is never delivered to this page’s listener.

### 2) Why the extension cannot detect authentication

- The extension does **not** store auth; it gets the token from a **dashboard tab** via the content script and the page token bridge.
- The bridge returns a token only when `window.firebase.auth().currentUser` is set at the moment of the request.
- That moment can be **before** the page has hydrated or before Firebase has restored the user from persistence, so the bridge often returns null.
- When `getTokenFromPage()` returns null, the extension treats the user as not authenticated and opens the login tab, which matches the “extension keeps redirecting to login” symptom.

### 3) Whether Firebase session persistence is broken

- Persistence is **not** explicitly set; default (local/IndexedDB) is used. There is no evidence of a different or “broken” persistence mode in code.
- The issue is more likely **when** and **where** the restored state is observed: first emission null on login page, and bridge reading `currentUser` before it’s set on the dashboard page.

### 4) Whether multiple Firebase instances exist

- **Web:** One Firebase app in `lib/firebase.ts`; login and dashboard share it.
- **Extension:** A second app in `echly-extension/src/firebase.ts` (web-extension auth). It is **not** used for the token bridge; the bridge uses the **page’s** `window.firebase` (the web app’s single instance). So multiple instances do not explain the login/dashboard/extension disagreement; the relevant instance is the single web app one.

### 5) Whether the token bridge is reading auth state too early

- **Yes.** The bridge does not wait for Firebase to be ready or for `onAuthStateChanged`. It synchronously reads `window.firebase.auth().currentUser` when it receives `ECHLY_REQUEST_TOKEN`. If that happens before the app has set `window.firebase` or before Firebase has restored the user, it returns null. Combined with the extension’s short timeouts, this leads to “not authenticated” right after loading the dashboard.

### 6) Whether the login redirect flow is incorrect

- The login **redirect** logic itself (redirect to dashboard or returnUrl when user is present, use of `returnUrl`, extension param) is consistent and not obviously wrong.
- The problem is **not** that the redirect is wrong, but that:
  - On `/login`, the **detection** of “already logged in” depends on a non-null emission from `onAuthStateChanged`, which may come only after persistence restore; if the first emission is null and the second never comes, no redirect.
  - The extension’s **source** of truth is the dashboard page’s `currentUser` at request time; if that is read too early, the extension keeps sending the user to login.

---

**End of report. No code changes were made; this is diagnostic only.**
