# Echly Chrome Extension — Multiple Login Tabs Diagnostic Report

**Scope:** Read-only diagnostic audit of the extension authentication system to explain why multiple login (or login-looking) tabs open when the extension icon is clicked. No code was modified.

---

## SECTION 1 — Extension Click Flow

### Location

- **File:** `echly-extension/src/background.ts`
- **Listener:** `chrome.action.onClicked.addListener` at **line 466**

### Exact sequence when the extension icon is clicked

1. **chrome.action.onClicked** fires (line 466).
2. **Tray is opened first (before any auth check):**
   - `globalUIState.visible = true` (line 467)
   - `globalUIState.expanded = true` (line 468)
   - `persistUIState()` (line 469)
   - `broadcastUIState()` (line 470) — sends `ECHLY_GLOBAL_STATE` to **all** tabs
3. **Auth check runs in background (non-blocking):**
   - `checkBackendSession()` is invoked **without** `await` (line 472)
   - `.then(session => { ... })` updates `sessionCache` and broadcasts `ECHLY_AUTH_STATE_UPDATED` to all tabs (lines 473–490)
   - `.catch(() => {})` swallows errors (line 491)
4. **No login tab is opened in this handler.** The click handler does **not** contain `if (!session.authenticated) { chrome.tabs.create(loginUrl) }`. Login/dashboard tab creation happens elsewhere (see Section 2).

### Answers

| Question | Answer |
|----------|--------|
| **Is `checkBackendSession()` called once or multiple times (from the click)?** | From the **icon click** it is called **once** (one fire-and-forget call). It can be called **again from other triggers** when the tray opens (see Section 4). |
| **Is the tray opened before auth check?** | **Yes.** Tray is shown and state is broadcast **before** `checkBackendSession()` runs; the auth check does not block the UI. |
| **Is login tab creation inside a loop or repeated async call (in the click handler)?** | **No.** The click handler does **not** create any login tab. Tab creation for login/dashboard happens in other code paths. |

---

## SECTION 2 — Login Tab Creation Points

### Search: `chrome.tabs.create` in the repository

All `chrome.tabs.create` usages are in **`echly-extension/src/background.ts`**:

| # | Line | Function / context | Condition | Auth-dependent? | Responsible for login tabs? |
|---|------|--------------------|-----------|------------------|-----------------------------|
| 1 | **298** | `getTokenFromPage()` | `!hasDashboardTab()` — no tab with dashboard origin exists | Yes (runs when token is needed; no token ⇒ no dashboard) | **No** — opens **dashboard** URL (`.../dashboard`), not login. May *redirect* to login in the web app. |
| 2 | **646** | `chrome.runtime.onMessage` handler for `ECHLY_OPEN_TAB` | `request.url` is truthy | No (generic “open URL” from content) | No (generic tab open). |
| 3 | **750** | `chrome.runtime.onMessage` handler for `ECHLY_OPEN_POPUP` | Message type is `ECHLY_OPEN_POPUP` | Yes (used when user is not signed in and clicks “Sign in”) | **Yes** — opens **login** URL (`ECHLY_LOGIN_BASE?extension=true&returnUrl=...`). |
| 4 | **761** | `chrome.runtime.onMessage` handler for `ECHLY_SIGN_IN` / `ECHLY_START_LOGIN` / `LOGIN` | Message type is one of these | Yes (legacy / alternate sign-in entry points) | **Yes** — same login URL as above. |

### Summary

- **Explicit login tabs** (URL with `/login?...`) are created only in the **ECHLY_OPEN_POPUP** and **ECHLY_SIGN_IN / ECHLY_START_LOGIN / LOGIN** handlers (lines 750 and 761).
- **Dashboard tabs** (which the web app may redirect to login when unauthenticated) are created in **getTokenFromPage()** (line 298) when there is no existing dashboard tab. That function is used by `getValidToken()` → `checkBackendSession()` and does **not** open the login URL directly.

---

## SECTION 3 — Auth Failure Trigger

### Logic similar to `if (!session.authenticated) { chrome.tabs.create(...) }`

**In the current codebase there is no such block in the extension icon click path.** The click handler does not open a tab when `session.authenticated` is false. Auth failure leads to login tabs only indirectly:

- **ECHLY_OPEN_POPUP / ECHLY_SIGN_IN / LOGIN** open the login URL when the **user** (or another part of the UI) requests “open login” — not as an automatic reaction to `!session.authenticated` in the click handler.
- **getTokenFromPage()** opens a **dashboard** tab when there is **no dashboard tab** (and thus no token). That is “no token” → open dashboard; the web app may then redirect to login.

### When `session.authenticated` becomes false

`session.authenticated` is the return value of `checkBackendSession()` (lines 336–364):

- **No token:** `getValidToken()` throws (no dashboard tab or token bridge timeout) → `checkBackendSession()` catches, calls `clearAuthState()`, returns `{ authenticated: false }`.
- **Backend failure:** `GET /api/auth/session` returns `!res.ok` → `clearAuthState()`, returns `{ authenticated: false }`.
- **Network error:** `fetch` throws → same.

So:

| Trigger | Does it set `session.authenticated` to false? | Does it directly open a login tab in background? |
|--------|-------------------------------------------------|---------------------------------------------------|
| Backend 401/403 or non-OK | Yes | No (only via content requesting ECHLY_OPEN_POPUP / sign-in). |
| Token bridge timeout / no token | Yes | No direct login tab; `getTokenFromPage()` may open a **dashboard** tab. |
| Network errors | Yes | No direct login tab. |

Login tabs are opened only when the background handles **ECHLY_OPEN_POPUP** or **ECHLY_SIGN_IN / ECHLY_START_LOGIN / LOGIN**, not by a single “if not authenticated then create login tab” in the click or session-check path.

---

## SECTION 4 — Repeated Auth Checks

### Every call to `checkBackendSession()`

| # | Location (file: area) | Trigger |
|---|------------------------|--------|
| 1 | background.ts ~472 | **chrome.action.onClicked** — one call per icon click (fire-and-forget). |
| 2 | background.ts ~400 | **getAuthState()** (deprecated) — not used by the current click flow. |
| 3 | background.ts ~497 | **refreshExtensionAuth()** — on message **ECHLY_EXTENSION_LOGIN_COMPLETE**. |
| 4 | background.ts ~736 | **ECHLY_GET_AUTH_STATE** message handler — one full `checkBackendSession()` per message. |
| 5 | background.ts ~224 | **prewarmAuthSession()** — uses token + session fetch (same idea as session check); prewarm is triggered by: runtime.onStartup, runtime.onInstalled, and chrome.tabs.onUpdated when a dashboard tab finishes loading. |

**ECHLY_GET_AUTH_STATE** is the one that can be invoked many times when the tray opens:

- Content script **on mount** (useEffect `[]`) sends **ECHLY_GET_AUTH_STATE** once per tab (content.tsx ~316–331).
- When **globalState.visible** becomes true, content sends **ECHLY_GET_AUTH_STATE** again (content.tsx ~334–344).
- On **document visibilitychange** (tab becomes visible), content sends **ECHLY_GET_AUTH_STATE** (content.tsx ~366–384).

So when the user clicks the extension icon:

1. **broadcastUIState()** sends **ECHLY_GLOBAL_STATE** to **every** tab.
2. Each tab’s content script sets `globalState.visible = true`.
3. The effect that depends on **globalState.visible** runs in **each** tab and sends **ECHLY_GET_AUTH_STATE**.
4. So **N open tabs ⇒ up to N concurrent ECHLY_GET_AUTH_STATE messages** (plus any from visibilitychange or mount).

Each **ECHLY_GET_AUTH_STATE** handler runs `checkBackendSession()` in an async IIFE (lines 734–742); there is **no** mutex or “auth check in progress” guard. Therefore:

**These calls can and do run simultaneously** when multiple tabs have the content script and the tray is shown (or when tabs become visible).

---

## SECTION 5 — Login Loop Conditions

### Is this sequence possible?

```
extension click
  → checkBackendSession()
  → no token
  → open login tab
  → login tab loads extension content script
  → content script triggers auth check again
  → open another login tab
```

**Direct form of this loop:** The **icon click** handler does **not** open a login tab when there is no token, so the strict “click → no token → open login tab” step does not exist in the click handler. There is no **direct** “auth check → open login tab” loop from the click.

**Indirect chain that can create multiple tabs (including login-looking ones):**

1. User clicks extension icon.
2. Tray opens; **broadcastUIState()** sends **ECHLY_GLOBAL_STATE** to all tabs.
3. **Every tab** with the content script gets `globalState.visible = true` and runs the effect that sends **ECHLY_GET_AUTH_STATE**.
4. Background receives **one ECHLY_GET_AUTH_STATE per tab** and runs **checkBackendSession()** for each (concurrently).
5. Each **checkBackendSession()** calls **getTokenFromPage()**. If there is no dashboard tab (or no token yet), **getTokenFromPage()** calls **chrome.tabs.create({ url: dashboardUrl, active: false })** (line 298).
6. So **multiple concurrent getTokenFromPage()** invocations can each create a **dashboard** tab before any new tab appears in the next query ⇒ **multiple new tabs**.
7. If the web app redirects unauthenticated users from `/dashboard` to `/login`, those tabs will **look like “login tabs.”**
8. **Newly created tabs** get **ECHLY_GLOBAL_STATE** from **chrome.tabs.onCreated** (lines 436–443). When the content script loads in those new tabs, they can set `globalState.visible = true` and send **ECHLY_GET_AUTH_STATE** again. By then, `hasDashboardTab()` is typically true (new tabs have dashboard URL), so **getTokenFromPage()** usually does **not** create more tabs; it just times out waiting for token and returns null. So the main “explosion” is from the **initial** N concurrent auth checks, not from an unbounded loop from the new tabs.

**Conclusion:** A full “login tab → content script → auth check → another login tab” loop is not present in the code. The observable “multiple login tabs” are best explained by **multiple concurrent ECHLY_GET_AUTH_STATE** (one per tab) each triggering **checkBackendSession() → getTokenFromPage()**, and **getTokenFromPage()** creating a **dashboard** tab when none exists. If the app redirects dashboard to login, those appear as multiple login tabs.

---

## SECTION 6 — Widget Login UI

### File: `echly-extension/src/content.tsx`

**When is `ECHLY_OPEN_POPUP` sent?**

- **Function:** `requestOpenLoginPage()` (lines 89–92) sends `chrome.runtime.sendMessage({ type: "ECHLY_OPEN_POPUP" })`.
- **Used in UI:** Only as the **onClick** handler of the **“Sign in”** button (line 1286), when the tray is open and the user is not authenticated (the “Sign in to capture feedback…” view).

So **ECHLY_OPEN_POPUP** is sent only when the user **clicks** the “Sign in” button in the widget. The widget does **not** send it automatically when it detects unauthenticated state (e.g. on load or when `ECHLY_AUTH_STATE_UPDATED` says not authenticated). One click ⇒ one login tab from this path; multiple login tabs from this path would require multiple “Sign in” clicks (e.g. in different tabs).

---

## SECTION 7 — Extension Tray Behavior

### Where `globalUIState.visible = true` is set

| Location (background.ts) | Trigger |
|---------------------------|--------|
| **Line 467** | **chrome.action.onClicked** — extension icon click. |
| **Line 504** | **ECHLY_TOGGLE_VISIBILITY** message — e.g. when the user toggles the widget to show. |

### Behavior

- **Tray opening is tied to extension click:** Yes. The main path is icon click → line 467 → tray shown and state broadcast.
- **Tray opening is independent of auth state:** Yes. The click handler does **not** check auth before setting `globalUIState.visible = true`. The tray is shown first; auth is checked in the background and only used to update cache and broadcast **ECHLY_AUTH_STATE_UPDATED**. So tray visibility is correct and intentional: show first, then refresh auth state.

---

## SECTION 8 — Tab Explosion Root Cause

### Why many login (or login-looking) tabs appear

**Primary cause: concurrent auth checks from multiple tabs, each potentially creating a dashboard tab.**

1. **Tray opens on click** and **broadcastUIState()** notifies **all** tabs.
2. **Every tab** with the content script runs the effect that sends **ECHLY_GET_AUTH_STATE** when `globalState.visible` becomes true.
3. There is **no deduplication**: each **ECHLY_GET_AUTH_STATE** runs **checkBackendSession()** independently and in parallel.
4. Each **checkBackendSession()** uses **getTokenFromPage()**. When there is **no dashboard tab** (or no token), **getTokenFromPage()** creates one dashboard tab (line 298). With N concurrent calls, **up to N dashboard tabs** can be created before the next `chrome.tabs.query` sees them.
5. If the web app redirects unauthenticated users from `/dashboard` to `/login`, those tabs appear as **multiple login tabs**.

Contributing factors:

- **No single “auth check in progress” guard** — many tabs can trigger a full session check at once.
- **Session cache is not used for ECHLY_GET_AUTH_STATE** — each request runs a full **checkBackendSession()** and thus **getTokenFromPage()**.
- **getTokenFromPage()** has **no “tab creation in progress” guard** — multiple callers can pass `!hasDashboardTab()` and each call **chrome.tabs.create**.
- **Token bridge timeout** (2s) can cause **getTokenFromPage()** to return null even when a dashboard tab exists (e.g. still loading), but in that case `hasDashboardTab()` is true so no extra tab is created; the main explosion is from the **first wave** of concurrent checks when there were no dashboard tabs.

**Most likely root cause:** **Repeated, concurrent auth checks** from **ECHLY_GET_AUTH_STATE** sent by **every tab** when the tray becomes visible, each leading to **getTokenFromPage()** and, when no dashboard tab exists, to **chrome.tabs.create(dashboard)**. The web app then redirecting dashboard → login yields the appearance of “multiple login tabs.”

---

## SECTION 9 — Timeline Diagram

```
User clicks extension icon
  ↓
chrome.action.onClicked (background.ts:466)
  ↓
globalUIState.visible = true, broadcastUIState()
  ↓
ECHLY_GLOBAL_STATE sent to Tab1, Tab2, … TabN
  ↓
Each tab: setGlobalState(visible: true) → effect [globalState.visible] runs
  ↓
Tab1 → ECHLY_GET_AUTH_STATE  ─┐
Tab2 → ECHLY_GET_AUTH_STATE   ├─→ N × checkBackendSession() (concurrent)
…                             │
TabN → ECHLY_GET_AUTH_STATE  ─┘
  ↓
Each checkBackendSession() → getValidToken() → getTokenFromPage()
  ↓
getTokenFromPage(): chrome.tabs.query → no dashboard tab (or no token)
  ↓
!hasDashboardTab() → chrome.tabs.create({ url: ".../dashboard", active: false })
  ↓
Multiple such creates (one per concurrent getTokenFromPage() that sees no dashboard tab)
  ↓
User sees multiple new tabs; if app redirects /dashboard → /login, they appear as “login tabs”
  ↓
(Optional) New tabs receive ECHLY_GLOBAL_STATE (onCreated); content script loads and may send
  ECHLY_GET_AUTH_STATE again; by then hasDashboardTab() is true so no further tab creation.
```

**Where the “loop” / explosion begins:** At **“ECHLY_GLOBAL_STATE sent to Tab1…TabN”** and **“Each tab sends ECHLY_GET_AUTH_STATE.”** That step turns one user click into N parallel auth checks, each of which can create a dashboard (and thus possibly login) tab when no dashboard tab exists.

---

## SECTION 10 — Final Diagnosis

### Summary

- **Why multiple login tabs open:** They are created indirectly. The extension creates **multiple dashboard tabs** when many **ECHLY_GET_AUTH_STATE** messages run at once (one per open tab when the tray is shown). Each handler runs **checkBackendSession() → getTokenFromPage()**. When there is no dashboard tab, **getTokenFromPage()** opens a dashboard tab. With N tabs, up to N such tabs can be opened. If the web app redirects unauthenticated users from dashboard to login, those tabs appear as multiple login tabs. The extension does **not** open the login URL in a loop; it opens the dashboard URL from multiple concurrent calls.
- **Which file causes it:** **echly-extension/src/background.ts** (concurrent handling of **ECHLY_GET_AUTH_STATE** and **getTokenFromPage()** creating a tab when `!hasDashboardTab()`), and **echly-extension/src/content.tsx** (sending **ECHLY_GET_AUTH_STATE** from every tab when `globalState.visible` becomes true).
- **Which condition triggers it:** (1) User clicks extension icon. (2) Tray opens and **ECHLY_GLOBAL_STATE** is broadcast to all tabs. (3) Each tab’s content script sends **ECHLY_GET_AUTH_STATE**. (4) For each message, background runs **checkBackendSession()** and thus **getTokenFromPage()**. (5) When **getTokenFromPage()** sees no dashboard tab, it runs **chrome.tabs.create(dashboard)**. Many such calls in parallel ⇒ many new tabs ⇒ multiple “login” tabs if the app redirects.
- **Tray behavior:** Correct. The tray is shown on icon click regardless of auth; auth is then refreshed in the background. The issue is not the tray opening but the **multi-tab auth requests** and **uncoordinated tab creation** in **getTokenFromPage()**.

---

*End of diagnostic report. No code was modified.*
