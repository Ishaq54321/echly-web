# Echly Extension & Dashboard — Deep Runtime Failure Audit

**Scope:** Extension icon click behavior, tray reliability, feedback submission flow, and post–“End” navigation.  
**Constraint:** No code was modified; this is a diagnostic report only.

---

## PART 1 — Extension Icon Click Trace

**File:** `echly-extension/src/background.ts`

### Execution path of `chrome.action.onClicked`

1. **Guard**  
   - If `authCheckInProgress === true`, handler returns immediately (no tray, no login tab).  
   - `originTabId = tab?.id ?? null`.

2. **sessionCache check** (lines 528–535)  
   - Condition: `sessionCache.authenticated === true && Date.now() - sessionCache.checkedAt < SESSION_CACHE_TTL_MS` (30s).  
   - If true: set `globalUIState.visible/expanded`, `persistUIState()`, `broadcastUIState()`, **return**.  
   - No token, no network, no tab open.  
   - **Note:** This path does **not** set `globalUIState.user`. If the only prior auth was `prewarmSessionFromStorage()`, `user` stays `null` (prewarm only sets `sessionCache`, not `globalUIState.user`).

3. **Else: full auth path**  
   - `authCheckInProgress = true`.  
   - Async block runs:
     - **checkBackendSession()** (see below).
     - `sessionCache = { authenticated, checkedAt: Date.now() }`.
     - If `session.authenticated === true`: set `globalUIState.user`, tray visible/expanded, persist, broadcast.
     - If false: build `loginUrl` (ECHLY_LOGIN_BASE + `?extension=true` + optional `returnUrl`), **openOrFocusLoginTab(loginUrl)**.
   - On **catch** (any throw in the async block): same as unauthenticated — open login tab.
   - **finally:** `authCheckInProgress = false`.

### Step-by-step detail

| Step | What runs | Possible delay |
|------|-----------|-----------------|
| 1 | sessionCache check | None (in-memory) |
| 2 | checkBackendSession() | See below |
| 3 | Token retrieval | `getStoredTokens()` (chrome.storage.local) + optional `refreshIdToken()` (Firebase) |
| 4 | /api/auth/session | One `fetch(API_BASE + "/api/auth/session", { headers: { Authorization: "Bearer " + token } })` |
| 5 | openOrFocusLoginTab() | Only if not authenticated: `chrome.tabs.query` + optional `chrome.tabs.update` or `chrome.tabs.create` |
| 6 | broadcastUIState() | `chrome.tabs.query({})` then `chrome.tabs.sendMessage` to every tab |

**checkBackendSession()** (lines 348–376):

- `getValidToken()` → can call `refreshIdToken()` if token age &gt; 50 minutes.
- On success: `fetch(API_BASE + "/api/auth/session", Bearer)`.
- On 401/403 or throw: `clearAuthState()`, return `{ authenticated: false }`.
- On success: return `await res.json()` (`authenticated`, `user`).

### Why dashboard tabs are sometimes opened

- The **background never opens or focuses a dashboard URL** directly. It only opens/focuses a tab via **openOrFocusLoginTab(loginUrl)** when `session.authenticated === false` (or on catch).
- So “redirect to dashboard” is almost certainly:
  1. Extension decides “not authenticated” (e.g. cache miss + `checkBackendSession()` false due to 401, network error, or refresh failure).
  2. Extension opens **login tab** (`ECHLY_LOGIN_BASE?extension=true&returnUrl=...`).
  3. Login page loads; if the user is **already logged in** in that origin (e.g. existing Firebase session), the login page may **redirect to dashboard** (or home), so the user sees “dashboard” instead of the tray.
- Contributing causes: **sessionCache** expired (30s TTL) or never set (e.g. after restart prewarm failed); **checkBackendSession()** returning false due to transient 401, network error, or token refresh failure.

### Why tray sometimes fails to open

1. **authCheckInProgress**  
   - Second click while first is still in `checkBackendSession()` is ignored (handler returns immediately). User sees no tray.

2. **broadcast delivery**  
   - `broadcastUIState()` sends `ECHLY_GLOBAL_STATE` to **all** tabs via `chrome.tabs.sendMessage`. Tabs where the content script isn’t loaded (e.g. chrome://, not yet injected) **fail** silently (`.catch(() => {})`). The **current tab** might be one of those, so that tab never shows the tray even though background state is correct.

3. **Cache miss + slow backend**  
   - If cache missed, tray only appears after `checkBackendSession()` and then broadcast. Any latency (token refresh, network) delays tray open; if the user clicks again before that finishes, they hit the guard and see nothing.

### Why click latency occurs

- **Cache hit (within 30s):** No token, no network — minimal latency (persist + broadcast).
- **Cache miss:**  
  - **Token retrieval:** `chrome.storage.local.get` (typically &lt;10 ms).  
  - **Refresh (if token &gt; 50 min):** `fetch(FIREBASE_REFRESH_URL)` + `chrome.storage.local.set` — hundreds of ms.  
  - **Backend session:** `fetch(API_BASE + "/api/auth/session")` — tens to hundreds of ms.  
  - **broadcastUIState():** `chrome.tabs.query` + N × `sendMessage` — scales with tab count.

**Approximate runtime (no instrumentation in code):**

| Step | Typical range |
|------|-------------------------------|
| Token retrieval (no refresh) | &lt;20 ms |
| refreshIdToken() (when triggered) | 200–800 ms |
| /api/auth/session | 50–300 ms |
| broadcastUIState() | 20–100+ ms (tab count dependent) |

First click after 30s idle or after service worker restart always pays token + backend + broadcast cost.

---

## PART 2 — Login Tab Reuse Bug

**Function:** `openOrFocusLoginTab(loginUrl: string)` (lines 33–56)

### Behavior

- `chrome.tabs.query({}, (tabs) => { ... })` gets all tabs.
- Reuse condition: `tabs.find(t => t.id != null && typeof t.url === "string" && t.url.includes("/login"))`.
- If such a tab exists: `chrome.tabs.update(id, { active: true })`, set `loginTabId = id`, resolve.
- Otherwise: `chrome.tabs.create({ url: loginUrl })`, set `loginTabId`, resolve.

### Whether dashboard tabs are reused when login should open

- **No.** Only tabs whose URL **contains `"/login"`** are reused. Dashboard URLs (e.g. `/dashboard/...`) do not match, so they are never reused by this function.

### Whether loginUrl is ever actually loaded

- **New tab:** `chrome.tabs.create({ url: loginUrl })` loads `loginUrl` (ECHLY_LOGIN_BASE + query params).
- **Reused tab:** The existing tab already has a URL containing `"/login"`. We only **focus** it; we do **not** call `chrome.tabs.update(id, { url: loginUrl })`. So if the user had navigated that tab to something else (e.g. dashboard) after opening it from a previous login flow, we still focus that tab and the **current URL** (e.g. dashboard) is shown; **loginUrl** is not loaded in the reuse case.

### Whether tab reuse causes auth state mismatch

- **Possible.** If we reuse a tab that was once `/login` but is now e.g. `/dashboard/xyz`, the user sees the dashboard in that tab. Extension auth is unchanged (we didn’t clear or set tokens here). So:
  - Extension may still think “not authenticated” and have opened this tab to “go to login.”
  - User sees dashboard (already logged in there) and may be confused.
- Reuse does **not** by itself change extension tokens or session cache; it only affects which tab is focused and what URL is shown.

### Effect on extension auth / dashboard auth / login flow

- **Extension auth:** Unchanged by `openOrFocusLoginTab`; only storage and `checkBackendSession()` drive that.
- **Dashboard auth:** Unchanged; dashboard uses Firebase in-page.
- **Login flow:** If we reuse a tab that’s no longer on `/login`, the user never sees the login page for this click; they see whatever that tab is (e.g. dashboard). Correct behavior would be to either update the tab to `loginUrl` when reusing or only reuse when the tab’s URL is exactly the intended login URL.

---

## PART 3 — Session Cache Performance

**Location:** `echly-extension/src/background.ts` (e.g. lines 59–62, 528–535, 540–541)

### sessionCache shape and TTL

- In-memory only: `{ authenticated: boolean; checkedAt: number }`.
- TTL: **30 seconds** (`SESSION_CACHE_TTL_MS = 30 * 1000`).
- Set on: successful `checkBackendSession()` (icon click), successful `validateSessionAndOpenTray()` (post-login), and `prewarmSessionFromStorage()` (startup/install).
- Cleared / invalidated: in `clearSessionCache()` (and thus `clearAuthState()`) — e.g. on any 401/403 or token failure.

### Is sessionCache invalidated too frequently?

- Not by time alone; 30s is a fixed TTL. It **is** invalidated on every 401/403 (and token errors) via `clearAuthState()` → `clearSessionCache()`. So any single API failure (including from other flows like feedback, SET_ACTIVE_SESSION, upload) clears the cache; the **next** icon click will hit the backend again.

### Does the extension unnecessarily call /api/auth/session?

- On **cache hit** (within 30s): **no** session call.
- On **cache miss**: one call per click. So if the user clicks once per minute, they get one session call per minute. Not excessive by itself, but the 30s TTL means frequent clickers (e.g. every 45s) get a call almost every time.

### Does token refresh trigger backend calls on every click?

- **No.** Refresh is triggered inside `getValidToken()` when token **age** (since `echlyTokenTime`) &gt; 50 minutes. When refresh runs, `checkBackendSession()` still does one `/api/auth/session` with the new token. So refresh does not cause *multiple* backend calls per click; it adds latency on the path that already does one session call.

### Can the extension open the tray instantly without backend calls?

- **Yes, when cache hits:** Lines 528–535 set tray visible/expanded and broadcast; no token or backend. So **if** `sessionCache.authenticated === true` and `checkedAt` is within 30s, the tray can open with no backend.
- **First click after 30s+ (or after any clearAuthState):** Backend is required; no way to open “instantly” without either extending cache TTL or trusting stored tokens more (with higher risk).

### Why the extension can feel slow on first click

1. **Cache empty or expired:** After 30s idle, service worker restart, or any 401/403, cache is invalid. First click runs full `checkBackendSession()` (storage + optional refresh + `/api/auth/session`) then broadcast.
2. **prewarm doesn’t set user:** `prewarmSessionFromStorage()` only sets `sessionCache`; it does **not** set `globalUIState.user`. So after restart, cache hit still leaves `user === null` in the broadcast (possible UI inconsistency).
3. **authCheckInProgress:** Rapid double-click makes the second click a no-op, so the user may think “first click did nothing.”

---

## PART 4 — Token State Diagnostics

**Storage keys:** `echlyIdToken`, `echlyRefreshToken`, `echlyTokenTime` (see `ECHLY_TOKEN_KEYS`, lines 232, 262–264).

### Whether keys exist and are updated

- **Read:** `getStoredTokens()` (lines 259–281) does `chrome.storage.local.get(["echlyIdToken", "echlyRefreshToken", "echlyTokenTime"])`. All three must be present and valid (non-empty strings, number for time); otherwise it returns `null`.
- **Write:**  
  - On login success: `ECHLY_EXTENSION_AUTH_SUCCESS` handler (lines 430–434) sets all three (`echlyTokenTime: Date.now()`).  
  - On refresh: `refreshIdToken()` (lines 318–325) sets `echlyIdToken`, `echlyRefreshToken` (optional from response), `echlyTokenTime: Date.now()`.
- **Removal:** `clearAuthState()` (line 254) removes `ECHLY_TOKEN_KEYS` (and legacy keys).

So: **echlyIdToken** and **echlyRefreshToken** exist after login and are updated on refresh; **echlyTokenTime** is set on login and on every refresh.

### Lifecycle (login → token storage → refresh → session validation)

1. **Login:** User signs in on dashboard/login page → page posts `ECHLY_EXTENSION_AUTH_SUCCESS` with `idToken` and `refreshToken` → background stores all three keys and calls `validateSessionAndOpenTray()` → one `/api/auth/session` → on success, cache set, tray opened.
2. **Token storage:** Tokens live only in `chrome.storage.local`; no in-memory copy besides what `getValidToken()` uses for the current request.
3. **Refresh:** On any use of `getValidToken()`, if `Date.now() - tokenTime > TOKEN_MAX_AGE_MS` (50 min), `refreshIdToken()` runs (Firebase securetoken endpoint), then storage is updated with new id token and time; refresh token updated if returned.
4. **Session validation:** `checkBackendSession()` (and validateSessionAndOpenTray) uses `getValidToken()` then GET `/api/auth/session` with Bearer. No token or refresh failure → `clearAuthState()` and return not authenticated.

### Does token refresh introduce delays?

- **Yes.** When age &gt; 50 min, one click pays: `getStoredTokens()` + `fetch(FIREBASE_REFRESH_URL)` + `chrome.storage.local.set` + `fetch(/api/auth/session)`. Refresh is on the order of hundreds of ms, so that click is noticeably slower.

---

## PART 5 — Feedback Submission Flow

**Relevant files:** `echly-extension/src/content.tsx`, `echly-extension/src/background.ts`, and API routes.

### “End Feedback” vs “End Session”

- **“End” in the session UI** (End session / End Feedback) is wired to **session end**, not to submitting a single feedback item. The flow below is “user clicks End (session end)” and then what happens to the page and auth.

### Flow when user clicks **End** (session end)

1. **Content (CaptureWidget):**  
   - `SessionControlPanel` “End” → `onEnd` → in `CaptureWidget` (lines 253–256) → `handlers.endSession(() => { ... })` → in `useCaptureWidget.ts` **endSession** (lines 1121–1156) → after optional “wait for pipeline,” **finalizeEnd** runs → **onSessionModeEnd?.()** (and optional afterEnd).

2. **Content (content.tsx) onSessionModeEnd** (lines 891–906):  
   - Sends **ECHLY_SESSION_MODE_END** to background (no payload).  
   - Waits for response (or error).  
   - After ~50 ms delay, if `sessionId` is set: builds `url = `${APP_ORIGIN}/dashboard/${sessionId}`` and sends **ECHLY_OPEN_TAB** with that `url`.  
   - So a **new tab** is opened to `APP_ORIGIN/dashboard/<sessionId>`.

3. **Background ECHLY_SESSION_MODE_END** (lines 803–829):  
   - Clears session idle timer, sets `activeSessionId = null`, clears session-related `globalUIState` and storage, **broadcastUIState()**, then sends **ECHLY_RESET_WIDGET** to all tabs.  
   - Does **not** call `clearAuthState()`.  
   - Responds `sendResponse({ success: true })`.

4. **Background ECHLY_OPEN_TAB** (lines 531–537):  
   - Creates tab with `chrome.tabs.create({ url })`.  
   - So the user ends up in a new tab at `APP_ORIGIN/dashboard/<sessionId>`.

### Why the user can see a redirect to `/login`

- **APP_ORIGIN in content.tsx is hardcoded** (line 21):  
  `const APP_ORIGIN = "http://localhost:3000";`
- So after “End,” the extension **always** opens `http://localhost:3000/dashboard/<sessionId>`.
- If the user is on **production** (e.g. logged in at `https://echly-web.vercel.app`):
  - The new tab is **localhost**, not the production dashboard.
  - Firebase auth is per-origin. The user is not logged in on `http://localhost:3000` (or localhost isn’t running).
  - Dashboard pages under `(app)/dashboard` use **useAuthGuard({ router })** (e.g. `SessionPageClient.tsx`, overview, etc.). When `onAuthStateChanged(auth, ...)` sees **null** (no Firebase user on that origin), it calls **router.replace("/login")** or **router.push("/login")** (see `lib/hooks/useAuthGuard.ts` lines 40–45).
- So: **Extension opens localhost → dashboard mounts → auth guard sees no user → redirect to /login.**  
  The extension does **not** redirect to login; the **dashboard app** does, because the opened tab is on the wrong origin (localhost) where the user is not signed in.

### Does the backend return 401 during feedback submission?

- **ECHLY_SESSION_MODE_END** does not call any API; it only clears local session state and opens a tab.
- If the user had submitted feedback **before** clicking End, those requests (e.g. **ECHLY_PROCESS_FEEDBACK** → `/api/structure-feedback`, `/api/feedback`) can return 401/403; the background then calls **clearAuthState()** (lines 994, 1051, 1118). So **before** End, auth could already be cleared; after End we still open the tab (localhost). So: 401 during feedback can clear extension auth; the “redirect to login” in the new tab is still due to opening localhost and the dashboard’s auth guard.

### Are tokens cleared during feedback submission?

- Not by the “End” action itself. They **are** cleared if any of the following return 401/403 (or throw) during feedback flow:  
  - **ECHLY_PROCESS_FEEDBACK**: structure-feedback (line 994), feedback create (line 1051), or catch (line 1118).  
  - **echly-api** (content’s apiFetch): any 401/403 (line 1146).  
- So a 401 during or after feedback submission will clear tokens; the next extension use will show “not authenticated” and open the login tab. The “redirect to login” after End is still the dashboard redirect on the newly opened (localhost) tab.

### Does the extension call clearAuthState() during or after “End”?

- **No.** The **ECHLY_SESSION_MODE_END** handler does not call `clearAuthState()`. So “End” by itself does not clear auth. If the user is redirected to login, it is because the **opened tab** is on an origin (localhost) where the dashboard’s Firebase user is null.

---

## PART 6 — Session End Flow

### ECHLY_SESSION_MODE_END (background, lines 803–829)

- Clears idle timer, sets `activeSessionId = null`, clears session-related fields in `globalUIState` and in storage, **broadcastUIState()**, then sends **ECHLY_RESET_WIDGET** to all tabs.
- No API call; no `clearAuthState()`.

### ECHLY_PROCESS_FEEDBACK (background, lines 596–1122)

- Used when content submits feedback (structure-feedback + feedback create). Not triggered by “End”; it’s for creating tickets. On 401/403 or throw it can call **clearAuthState()**.

### Page navigation after “End”

- **Content** (content.tsx lines 891–906): After sending ECHLY_SESSION_MODE_END and a short delay, sends **ECHLY_OPEN_TAB** with `url = ${APP_ORIGIN}/dashboard/${sessionId}`.
- So: **A new tab is opened** to that URL. The **current** page (where the user was giving feedback) is **not** navigated or reloaded; the user is taken to the new tab.

### Intended vs current behavior

- **Intended (inferred):** After ending the session, open the dashboard for that session so the user can review it. Stay on the same session context (same origin as where they’re logged in).
- **Current:**  
  - New tab is opened to **APP_ORIGIN** which is **hardcoded to `http://localhost:3000`**.  
  - On production, that’s wrong: user should be sent to `https://echly-web.vercel.app/dashboard/<sessionId>`.  
  - On that (localhost) tab, dashboard’s useAuthGuard sees no user → redirect to **/login**.  
  - So the user effectively “lands on login” after End, which looks like a broken flow.

**Conclusion:** Session end logic (ECHLY_SESSION_MODE_END + ECHLY_OPEN_TAB) does not clear auth. The redirect to login is caused by opening the dashboard on the **wrong origin** (localhost), so the dashboard’s Firebase-based auth guard redirects to `/login`.

---

## PART 7 — Extension Message Flow

### Message types (summary)

- **ECHLY_GLOBAL_STATE:** Background → all tabs; carries `state: globalUIState`. Content applies it and shows/hides tray.
- **ECHLY_SESSION_MODE_END:** Content → background; request to end session. Background clears session state and broadcasts; no auth clear.
- **ECHLY_PROCESS_FEEDBACK:** Content → background; payload with transcript, sessionId, context. Background calls structure-feedback and feedback APIs; on 401/403 or error can call clearAuthState().
- **ECHLY_EXTENSION_AUTH_SUCCESS:** Page (via content bridge) → background; carries idToken, refreshToken. Background stores tokens and calls validateSessionAndOpenTray().

### Flow: page → content → background → backend → back to page

- **Auth:** Login page (or dashboard with token bridge) posts message → content forwards ECHLY_EXTENSION_AUTH_SUCCESS → background stores tokens, validates with /api/auth/session, sets cache and tray, broadcasts ECHLY_GLOBAL_STATE to all tabs. Tabs that have content script update UI.
- **Session end:** Content sends ECHLY_SESSION_MODE_END → background clears session, broadcasts ECHLY_GLOBAL_STATE and ECHLY_RESET_WIDGET. Content then asks for ECHLY_OPEN_TAB to dashboard URL.
- **Feedback:** Content uses apiFetch (echly-api) or ECHLY_PROCESS_FEEDBACK → background gets token, calls API; response back to content via sendResponse. 401/403 in background triggers clearAuthState() and possibly error response.

### Can message failures cause the tray not to open?

- **Yes.**  
  1. **broadcastUIState()** sends ECHLY_GLOBAL_STATE to every tab. For tabs where the content script isn’t loaded (e.g. chrome://, or script not yet injected), `sendMessage` fails and is caught silently. If the **current** tab is such a tab, that tab never receives the state and won’t show the tray.  
  2. **authCheckInProgress:** If the first click’s async path is still running, a second click is ignored; user sees no tray.  
  3. **ECHLY_RESET_WIDGET** is sent to all tabs; same delivery issue for tabs without content script.

---

## PART 8 — Auth Reset Events (clearAuthState)

**Definition:** `clearAuthState()` (lines 251–257): clears session cache, sets tray invisible/collapsed, removes ECHLY_TOKEN_KEYS and legacy keys from storage, persistUIState(), broadcastUIState().

### Every call site in `echly-extension/src/background.ts`

| Line(s) | Context |
|--------|---------|
| 194 | initializeSessionState: feedback fetch 401/403 |
| 213 | initializeSessionState: feedback fetch catch |
| 356 | checkBackendSession: getValidToken() throw |
| 364 | checkBackendSession: 401/403 |
| 375 | checkBackendSession: catch |
| 420 | validateSessionAndOpenTray: getValidToken() throw |
| 428 | validateSessionAndOpenTray: 401/403 |
| 463 | validateSessionAndOpenTray: catch |
| 601 | ECHLY_SET_ACTIVE_SESSION: feedback or sessions 401/403 |
| 727 | ECHLY_SET_ACTIVE_SESSION: catch |
| 741 | ECHLY_SET_ACTIVE_SESSION: 401/403 in fetch branch |
| 836 | ECHLY_GET_TOKEN: getValidToken() throw |
| 936 | ECHLY_UPLOAD_SCREENSHOT: 401/403 |
| 947 | ECHLY_UPLOAD_SCREENSHOT: catch |
| 994 | ECHLY_PROCESS_FEEDBACK: structure-feedback 401/403 |
| 1051 | ECHLY_PROCESS_FEEDBACK: feedback create 401/403 |
| 1118 | ECHLY_PROCESS_FEEDBACK: catch |
| 1146 | echly-api: 401/403 |
| 1156 | echly-api: catch (NOT_AUTHENTICATED or message includes it) |
| 428 (auth success handler) | In the ECHLY_EXTENSION_AUTH_SUCCESS async handler catch: clearAuthState() |

### Events that force logout

- Any **401 or 403** from: `/api/auth/session`, `/api/feedback`, `/api/sessions`, `/api/structure-feedback`, `/api/upload-screenshot`, or any request proxied via **echly-api**.
- **getValidToken()** throw (no tokens or refresh failed).
- **Network/parse errors** in the paths that catch and then call clearAuthState().

### Feedback submission / session creation / session end

- **Feedback submission (ECHLY_PROCESS_FEEDBACK):** 401/403 on structure-feedback or feedback create, or any throw in the handler → **clearAuthState()**. So a failed or unauthorized feedback request can log the user out.
- **Session creation / SET_ACTIVE_SESSION:** 401/403 on feedback or sessions fetch, or catch → **clearAuthState()**. So loading session list or pointers can log the user out.
- **Session end (ECHLY_SESSION_MODE_END):** Does **not** call clearAuthState(). Session end itself does not clear auth.

**Conclusion:** None of the “session end” or “End” flows mistakenly clear auth. Auth is cleared only on token/API failure. The mistaken “redirect to login” after End is from opening the dashboard on localhost, not from clearAuthState().

---

## PART 9 — Dashboard Auth State

### How dashboard auth works

- **Client:** `useAuthGuard` (`lib/hooks/useAuthGuard.ts`) subscribes to **Firebase `onAuthStateChanged(auth, ...)`**. If `currentUser == null` and a router is passed, it calls `router.replace("/login")` or `router.push("/login")`.
- **Server APIs:** Use **requireAuth(req)** which reads `Authorization: Bearer <token>`, verifies the Firebase ID token with Firebase JWKS, and returns decoded user or throws 401.
- Dashboard **does not** call `/api/auth/session` for its own UI auth; it relies on **Firebase auth state** in the client. `/api/auth/session` is used by the **extension** (and could be used by dashboard if it wanted a single source of truth).

### Extension vs dashboard auth

- **Extension:** Stores tokens in `chrome.storage.local`, validates with GET `/api/auth/session` (Bearer token). No direct Firebase in the extension; tokens come from the login page (or dashboard token bridge) via postMessage.
- **Dashboard:** Firebase client SDK in the page; auth state is per-origin. No shared storage with the extension.

### Divergence

- If the user logs out on the dashboard (Firebase signOut), the extension is **not** notified. Extension keeps using stored tokens until a request returns 401/403 or getValidToken fails.
- If the user uses the extension on **localhost** while logged in on **production** (or vice versa), the dashboard on the other origin has no Firebase user, so useAuthGuard redirects to /login. The extension’s API_BASE (background) can be production while content’s **contentAuthFetch** uses a **hardcoded** `API_BASE = "http://localhost:3000"` — so content script API calls can go to localhost while background uses production, causing 401s and clearAuthState() in production builds if content is not fixed.

### Effect on extension behavior

- Opening a dashboard tab on the **wrong origin** (e.g. localhost when user is on production) causes the dashboard to show “not logged in” and redirect to /login. That matches the reported “redirect to login after End.”
- Extension and dashboard auth stay in sync only when: same origin, and token validity matches backend. Divergence (logout on dashboard, or wrong origin) leads to confusing UX (e.g. tray still “logged in” but opened tab shows login).

---

## PART 10 — Final Root Causes & Fix Targets

### 1. Why extension sometimes “redirects” to dashboard when already logged in

- Extension does **not** open dashboard on icon click. It opens the **login** tab when it believes the user is not authenticated.
- Likely sequence: cache miss or 401/403 → `checkBackendSession()` returns false → extension opens **login** tab. Login page loads and, because the user is **already** logged in on that origin, **redirects** to dashboard (or home). So the user perceives “click extension → dashboard” even though the extension only opened the login URL.
- **Contributing:** Session cache expired (30s), transient 401 or network error, or token refresh failure causing false “not authenticated.”

**Fix direction:** More resilient session check (retry, or trust cache longer when tokens exist), and/or ensure login page does not redirect to dashboard when opened by extension with `?extension=true` so the user gets a consistent “tray or login” experience.

---

### 2. Why extension click is slow

- **Cache miss:** Full path is token read (+ optional refresh if &gt;50 min) + GET /api/auth/session + broadcast. 30s TTL forces this on every click after 30s idle.
- **Double-click:** Second click is dropped by authCheckInProgress, so user may think the first click was slow or broken.
- **prewarm** does not populate `globalUIState.user`; only sessionCache is set, so first cache-hit click can still show incomplete state.

**Fix direction:** Longer or configurable cache TTL; ensure prewarm (or first cache-hit path) sets user when possible; consider immediate visual feedback (e.g. show tray “loading”) while checkBackendSession runs.

---

### 3. Why tray sometimes fails to open

- **authCheckInProgress:** Second click ignored.
- **broadcastUIState()** fails silently for tabs without content script; if the current tab is such a tab, tray never appears there.
- **Cache miss + slow backend:** Tray appears only after checkBackendSession and broadcast; user may think it didn’t open.

**Fix direction:** Don’t drop second click (e.g. queue or show “loading”); ensure the tab that triggered the click is in the broadcast list and has content script, or use a different channel (e.g. popup) for that tab; add minimal retry or feedback when sendMessage fails for the active tab.

---

### 4. Why feedback “End” redirects to login

- **Root cause:** After End, content opens a new tab to **`APP_ORIGIN/dashboard/<sessionId>`** with **APP_ORIGIN hardcoded to `http://localhost:3000`** in `content.tsx` (line 21).
- In production, the user is logged in at `https://echly-web.vercel.app`. The new tab is **localhost**, where there is no Firebase user. Dashboard’s **useAuthGuard** sees null and redirects to **/login**.
- ECHLY_SESSION_MODE_END does **not** call clearAuthState(); the redirect is entirely from the dashboard on the wrong origin.

**Fix direction:** Use the same base URL as the rest of the extension (e.g. same as API_BASE or a dedicated dashboard base) so that after End we open `https://echly-web.vercel.app/dashboard/<sessionId>` in production and localhost only in development. Align content’s API base (contentAuthFetch) with background (e.g. env or shared constant) so content doesn’t call localhost in production.

---

### 5. Files to change to fix all issues

| Issue | Files / areas |
|-------|-------------------------------|
| Redirect to dashboard when “logged in” | background.ts (session cache / checkBackendSession robustness); optionally login page (no auto-redirect when `?extension=true`). |
| Slow click | background.ts (cache TTL, prewarm setting user, authCheckInProgress behavior). |
| Tray not opening | background.ts (broadcast + handling of current tab / content script presence); manifest/content script injection if needed. |
| End → login redirect | **content.tsx** (APP_ORIGIN: use production base when not in development); ensure alignment with API_BASE. |
| Content script API base in production | **contentAuthFetch.ts** (and any other content-side API_BASE): use same logic as background (e.g. NODE_ENV or build-time env) so production doesn’t call localhost. |

**Summary:** The most direct fix for “redirect to login after End” is **content.tsx** (APP_ORIGIN) and **contentAuthFetch.ts** (API_BASE). The others are **background.ts** (cache, prewarm, broadcast, and auth check behavior) and optionally the login/dashboard redirect behavior when opened by the extension.

---

*End of diagnostic report. No code was modified.*
