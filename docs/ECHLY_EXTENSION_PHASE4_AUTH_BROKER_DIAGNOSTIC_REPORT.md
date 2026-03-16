# Echly Chrome Extension — Phase 1–4 Architecture Audit & Phase 4 Auth Broker Diagnostic Report

**Date:** 2025-03-16  
**Goal:** Diagnose why the widget UI shows "Sign in from extension" despite the extension token being fetched successfully.  
**Scope:** Full architecture audit (Phases 1–4), message flow, auth state propagation, injection logic, and exact bug location. No code changes — diagnostic only.

---

## 1. Architecture Map

### 1.1 Component Topology

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ECHLY EXTENSION (MV3)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  BACKGROUND (background.js / src/background.ts)                              │
│  • Service worker (single instance)                                           │
│  • extensionToken + extensionTokenExpiresAt (in-memory only)                  │
│  • sw.extensionToken, sw.currentUser, sw.captureMode (globalThis)             │
│  • globalUIState (visible, expanded, sessionId, pointers, …)                  │
│  • API orchestration: all fetch() from here; Bearer token from extensionToken │
│  • Token source: getExtensionToken() → open /extension-auth tab →             │
│    ECHLY_EXTENSION_TOKEN message from sessionRelay                             │
└─────────────────────────────────────────────────────────────────────────────┘
         │ chrome.runtime.sendMessage / chrome.tabs.sendMessage
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  CONTENT SCRIPT (content.js — injected via scripting API, NOT in manifest)    │
│  • Injected on demand when user activates Echly (icon click or popup)         │
│  • Runs in page context; single mount (main()), guard: __ECHLY_WIDGET_LOADED__│
│  • UI only: shadow host, React (ContentApp), CaptureWidget                   │
│  • No fetch(): all API goes content → sendMessage → background → fetch        │
│  • Auth display: "Sign in from extension" when !user; user from ECHLY_GET_   │
│    AUTH_STATE response (authenticated + user.uid required)                    │
└─────────────────────────────────────────────────────────────────────────────┘
         │ postMessage (token from page)
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  SESSION RELAY (sessionRelay.js — content script on extension-auth only)      │
│  • manifest content_scripts: matches localhost:3000/extension-auth*          │
│  • Listens for window postMessage({ type: "ECHLY_EXTENSION_TOKEN", token })   │
│  • Forwards to background via chrome.runtime.sendMessage                     │
│  • Does NOT forward user; only token                                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  DASHBOARD (Next.js app)                                                      │
│  • /extension-auth (app/extension-auth/page.tsx)                             │
│  • On load: POST /api/extension/session (credentials: include)               │
│  • Response: { extensionToken, user: { uid, email } }                         │
│  • Page sends only token: postMessage({ type: "ECHLY_EXTENSION_TOKEN", token })│
│  • Does NOT postMessage user                                                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  BACKEND                                                                     │
│  • POST /api/extension/session (app/api/extension/session/route.ts)          │
│  • getSessionUser(request) from echly_session cookie                         │
│  • Returns { extensionToken, user: { uid, email } }                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Manifest vs Runtime Injection

| Script            | How loaded                    | When / where runs                          |
|-------------------|-------------------------------|--------------------------------------------|
| background.js     | manifest `background.service_worker` | Always (service worker)               |
| sessionRelay.js    | manifest `content_scripts` for `/extension-auth*` | Only on dashboard extension-auth page |
| content.js         | **Not in manifest**           | Injected by background via `chrome.scripting.executeScript` when Echly is activated (icon click or after popup) into the **active tab** |

So the main widget content script is **programmatic injection only** (Loom-style): no `content_scripts` for `<all_urls>`.

---

## 2. Message Flow Diagram

### 2.1 Auth broker flow (token acquisition)

```
User action (e.g. needs token)
       │
       ▼
Background: getValidToken() or hydrateAuthState()
       │
       ├─ Cache hit (extensionToken + not expired) ──► return token
       │
       └─ Cache miss
              │
              ▼
         getExtensionToken()
              │
              ▼
         chrome.tabs.create({ url: EXTENSION_AUTH_URL })
              │
              ▼
Dashboard: /extension-auth loads
              │
              ▼
         POST /api/extension/session (credentials: include)
              │
              ▼
Backend: getSessionUser(cookie) → 401 or { extensionToken, user: { uid, email } }
              │
              ▼
Extension-auth page: reads data.extensionToken only
              │
              ▼
         window.postMessage({ type: "ECHLY_EXTENSION_TOKEN", token })
              │
              ▼
Session relay (content on extension-auth): chrome.runtime.sendMessage({ type: "ECHLY_EXTENSION_TOKEN", token })
              │
              ▼
Background: onMessage ECHLY_EXTENSION_TOKEN
              │
              • extensionToken = token
              • extensionTokenExpiresAt = now + 14min
              • setExtensionToken(token)
              • sw.extensionToken = token
              • tokenBrokerResolve(token) if pending
              • close auth broker tab
              • DOES NOT set sw.currentUser or cachedSessionUser
```

### 2.2 Widget open flow (icon click)

```
User clicks extension icon
       │
       ▼
chrome.action.onClicked → openWidgetInActiveTab()
       │
       ├─ chrome.storage.local.set({ echlyActive: true })
       ├─ globalUIState.visible = true, expanded = true
       ├─ broadcastUIState()  → ECHLY_GLOBAL_STATE to all tabs
       ├─ chrome.tabs.query({ active: true, currentWindow: true })
       ├─ ensureContentScriptInjected(tabId)
       │     ├─ executeScript: window.__ECHLY_WIDGET_LOADED__ === true ? skip
       │     └─ else: executeScript({ files: ["content.js"] })
       │
       └─ chrome.tabs.sendMessage(tabId, { type: "ECHLY_OPEN_WIDGET" })
             │
             ▼
Content: main() already ran (or runs after inject); ensureMessageListener receives OPEN_WIDGET
             │
             ├─ setHostVisibility(true)
             └─ window.dispatchEvent(new CustomEvent("ECHLY_OPEN_WIDGET"))
                   │
                   ▼
ContentApp: OPEN_WIDGET listener → ECHLY_EXPAND_WIDGET to background
```

**Critical:** `openWidgetInActiveTab()` does **not** call `getValidToken()` or `hydrateAuthState()`. Token is **not** ensured on icon click.

### 2.3 Content script auth state (why UI shows "Sign in from extension")

```
ContentApp mount (React useEffect [])
       │
       ▼
chrome.runtime.sendMessage({ type: "ECHLY_GET_AUTH_STATE" }, callback)
       │
       ▼
Background: hydrateAuthState()
       │
       ├─ If sw.currentUser && sw.extensionToken → return true
       └─ Else getValidToken()
             │
             (may open /extension-auth, user completes, token received)
             │
             ▼
       hydrateAuthState() returns true
       sendResponse({ authenticated: true, user: sw.currentUser ?? null })
             │
             ⚠️ When token came from broker: sw.currentUser was never set → user: null
             ▼
Content: callback(response)
       │
       if (response?.authenticated && response.user?.uid)
         setUser({ uid, name, email, photoURL })
       else
         setUser(null)   ← happens when user is null
       setAuthChecked(true)
       │
       ▼
Render: if (!user) → show "Sign in from extension" button
```

So the widget shows "Sign in from extension" because **authenticated is true but user is null**, and the UI requires **both** `authenticated` and `user?.uid` to show as signed in.

---

## 3. Auth State Propagation Chain

### 3.1 Intended (documented) flow

- Extension icon click → background ensures token → background sends **ECHLY_AUTH_STATE** → content updates UI → widget shows authenticated.

### 3.2 Actual implementation

| Step | Expected | Actual |
|------|----------|--------|
| Message type for auth | **ECHLY_AUTH_STATE** | **Does not exist.** No message type `ECHLY_AUTH_STATE` is defined or sent anywhere. |
| Who pushes auth to content | Background broadcasts auth when token/user change | Background never broadcasts auth. Only **ECHLY_GLOBAL_STATE** (UI state: visible, expanded, pointers, session, etc.) is broadcast. |
| How content gets auth | Listener for ECHLY_AUTH_STATE | Single **one-shot** request on mount: `ECHLY_GET_AUTH_STATE` in a useEffect with `[]`. No listener for auth updates. |
| When token is ensured on icon click | Before opening widget | **Not done.** `openWidgetInActiveTab()` does not call `getValidToken()` or `hydrateAuthState()`. |
| What ECHLY_GET_AUTH_STATE returns when token just arrived | authenticated + user | **authenticated: true, user: null** — see below. |

### 3.3 Root cause: user never set when token comes from broker

1. **API** (`POST /api/extension/session`) returns `{ extensionToken, user: { uid, email } }`.
2. **Extension-auth page** only uses `data?.extensionToken` and postMessages `{ type: "ECHLY_EXTENSION_TOKEN", token }`. It does **not** send `user` to the extension.
3. **Session relay** only forwards that message (token only).
4. **Background** handler for `ECHLY_EXTENSION_TOKEN`:
   - Sets: `extensionToken`, `extensionTokenExpiresAt`, `setExtensionToken()`, `sw.extensionToken`, resolves broker promise, closes tab.
   - Does **not** set `sw.currentUser` or `cachedSessionUser` (and has no `user` in the message).
5. **ECHLY_GET_AUTH_STATE** uses `hydrateAuthState()` then `sendResponse({ authenticated, user: sw.currentUser ?? null })`. So when the token was just received from the broker, `authenticated` becomes true but `user` stays null.
6. **Content** requires `response?.authenticated && response.user?.uid` to set user. So it sets `setUser(null)` and shows **"Sign in from extension"**.

So the **auth state propagation break** is: **user is never propagated from dashboard/API into the extension when the token is obtained via the auth broker**, and there is **no ECHLY_AUTH_STATE** broadcast to refresh the UI when auth changes.

---

## 4. Duplicate Injection Analysis

### 4.1 Injection guard

- **Background** (`ensureContentScriptInjected`): runs `executeScript` with `func: () => window.__ECHLY_WIDGET_LOADED__ === true`. If true, does not inject `content.js` again.
- **Content** (`main()`): first line `if (window.__ECHLY_WIDGET_LOADED__) return;` then `window.__ECHLY_WIDGET_LOADED__ = true`.
- So the widget is not double-mounted in the same page.

### 4.2 Tab injection triggers

- **chrome.tabs.onActivated**: if `echlyActive`, calls `ensureContentScriptInjected(activeInfo.tabId)` then sends `ECHLY_GLOBAL_STATE` and `ECHLY_SESSION_STATE_SYNC`.
- **chrome.tabs.onUpdated** (status === "complete"): if `echlyActive`, calls `ensureContentScriptInjected(tabId)` then sends `ECHLY_GLOBAL_STATE`.
- **chrome.tabs.onCreated**: sends `ECHLY_GLOBAL_STATE` only (no inject; new tab has no content script until activated or updated).

So injection can happen on **every** tab activation and **every** full page load when Echly is active. The guard ensures only one widget instance per page; multiple tabs each get their own inject when they become active or complete. No duplicate mount on the same document.

### 4.3 Conclusion

- No duplicate widget mount on a single page.
- No `ECHLY_AUTH_STATE` or similar re-check when auth changes, so the only auth snapshot is the initial `ECHLY_GET_AUTH_STATE` on mount, which often returns `user: null` after broker token flow.

---

## 5. Exact Bug Location

### 5.1 Primary bug: user not set when token is received from auth broker

| Location | Issue |
|----------|--------|
| **app/extension-auth/page.tsx** | Reads only `data?.extensionToken`. API returns `user: { uid, email }` but page never includes it in `postMessage`. |
| **echly-extension/src/background.ts** | `ECHLY_EXTENSION_TOKEN` handler (lines ~377–393) only stores token. Does not set `sw.currentUser` or `cachedSessionUser`. No `user` in the message payload to set. |
| **echly-extension/src/content.tsx** | Lines 348–361: treats as "signed in" only when `response?.authenticated && response.user?.uid`. So `authenticated: true` with `user: null` keeps the "Sign in from extension" state. |

So the **exact bug** is: **auth broker path never provides user to the extension, and background never sets currentUser when token is received**, so the widget’s one-time auth check gets `user: null` and keeps showing "Sign in from extension".

### 5.2 Secondary: no auth-state push to content

- **Expected:** Background sends something like `ECHLY_AUTH_STATE` when token/user changes so content can re-render.
- **Actual:** No such message exists. Content only has the single mount-time `ECHLY_GET_AUTH_STATE` request. If that callback runs after token is set but with `user: null`, there is no second update when user is later set (and user is never set in the current broker flow anyway).

### 5.3 Tertiary: token not ensured on icon click

- **Expected (from task):** "Extension icon click → background ensures token".
- **Actual:** `openWidgetInActiveTab()` does not call `getValidToken()` or `hydrateAuthState()`. Token is only fetched when something else triggers it (e.g. `ECHLY_GET_AUTH_STATE` from content, or session/API use). So the "ensure token before opening widget" step is missing.

---

## 6. Fix Recommendations

1. **Propagate user from dashboard to extension**
   - In **app/extension-auth/page.tsx**: read `data.user` from the session API response and include it in postMessage, e.g. `postMessage({ type: "ECHLY_EXTENSION_TOKEN", token, user: data.user })`.
   - In **sessionRelay**: forward `user` as well (already forwards the whole message if you extend the payload).
   - In **background** `ECHLY_EXTENSION_TOKEN` handler: if `request.user` (e.g. `uid`, `email`), set `cachedSessionUser` and `sw.currentUser` (same shape as `ECHLY_SET_EXTENSION_TOKEN`: uid, name, email, photoURL).

2. **Optional: decode user from JWT in background**
   - If you prefer not to send user in postMessage, the background could decode the extension JWT (payload has `uid`, `email`) and set `sw.currentUser` from that when storing the token. Then the dashboard does not need to send user.

3. **Re-check auth in content when widget opens**
   - When content receives **ECHLY_OPEN_WIDGET**, after applying visibility, send `ECHLY_GET_AUTH_STATE` again and update `user` state from the response. That way, if the token (and user) were just set by the broker, the widget updates without a full remount.

4. **Optional: add ECHLY_AUTH_STATE broadcast**
   - When background sets token/user (e.g. in `ECHLY_EXTENSION_TOKEN` or after setting `sw.currentUser`), broadcast to all tabs: `chrome.tabs.sendMessage(tabId, { type: "ECHLY_AUTH_STATE", authenticated, user })`.
   - In content, add a listener for `ECHLY_AUTH_STATE` and call `setUser(...)` / re-request `ECHLY_GET_AUTH_STATE` so the widget stays in sync when auth changes in another tab or after broker closes.

5. **Optional: ensure token on icon click**
   - At the start of `openWidgetInActiveTab()`, call `await getValidToken()` (or `hydrateAuthState()`) so that when the user has a valid dashboard session, the broker tab is opened and token (and user) are set before the widget is shown. This aligns with the documented "Extension icon click → background ensures token" flow.

---

## 7. Readiness Assessment for Phase 5

- **Phase 1 (Messaging):** Implemented. Content ↔ background via `sendMessage`; background broadcasts `ECHLY_GLOBAL_STATE`; no fetch in content.
- **Phase 2 (Extension token endpoint):** Implemented. `POST /api/extension/session` returns `extensionToken` and `user`; dashboard calls it and sends token (but not user) to the extension.
- **Phase 3 (Backend verification):** Implemented. Extension uses Bearer token from background; backend can verify the JWT.
- **Phase 4 (Auth broker):** **Partially complete.** Token is fetched and stored; broker tab closes; but **user is never set**, so the widget still shows "Sign in from extension". No auth-state push to content; token not ensured on icon click.

**Phase 5 readiness:** Unblock after fixing Phase 4:

- Ensure **user** is set in the extension when the token is received (dashboard + background, or JWT decode in background).
- Optionally re-request auth when opening the widget and/or add **ECHLY_AUTH_STATE** so the UI stays in sync.

Once the widget shows authenticated state correctly after broker sign-in, Phase 5 can proceed without auth blocking it.

---

## 8. Summary Table

| Item | Status |
|------|--------|
| Architecture map | Documented above |
| Message flow | Token flow and widget open flow documented; ECHLY_AUTH_STATE missing |
| Auth state propagation | Broken: user not sent from dashboard, not set in background, content gets user: null |
| Duplicate injection | Guard present; no duplicate mount per page |
| Exact bug | Broker sends token only; background doesn’t set user; content requires user.uid → "Sign in from extension" |
| Fixes | Send/set user in broker path; optional re-check on OPEN_WIDGET and ECHLY_AUTH_STATE; optional ensure token on icon click |
| Phase 5 readiness | Blocked on Phase 4 auth display fix |
