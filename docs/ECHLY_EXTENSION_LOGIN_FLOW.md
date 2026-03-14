# Echly Extension Login Flow (Loom-style)

This document describes the extension login flow and why the dashboard remains open as the token source. The design matches Loom: after signing in from the extension, the user is taken to the **dashboard** and that tab stays open to supply Firebase tokens to the extension.

---

## New Login Flow

1. **User clicks extension icon** → Tray opens immediately (no wait for auth). If not authenticated, background may open the login tab with `?extension=true`.
2. **User signs in on the login page** (Google or email/password).
3. **Login page (extension flow):**
   - Sends `ECHLY_EXTENSION_LOGIN_COMPLETE` to the extension background via `chrome.runtime.sendMessage`.
   - Redirects to **`/dashboard`** with `window.location.href = "/dashboard"`.
   - **No redirect to `returnUrl`** — the user always lands on the dashboard after extension login.
4. **Background** receives `ECHLY_EXTENSION_LOGIN_COMPLETE`, runs `refreshExtensionAuth()` (session check + token from dashboard), then broadcasts `ECHLY_AUTH_STATE_UPDATED` to all tabs so widgets show the correct user.
5. **Dashboard tab** stays open; the extension uses it as the **token source** for all API calls.

Result: one consistent post-login destination (dashboard), and the extension always has a tab that can provide a Firebase ID token.

---

## Dashboard as Token Source

The extension does **not** store tokens. It gets a fresh Firebase ID token from a **dashboard tab** via the token bridge:

- **Token bridge** (`pageTokenBridge.js`) is injected only on **dashboard origins** (e.g. `https://echly-web.vercel.app`, `http://localhost:3000`).
- On the dashboard, `window.firebase.auth().currentUser` is available after login; the bridge uses `currentUser.getIdToken()` to respond to token requests from the content script.
- The **content script** runs on all URLs but only the dashboard has the bridge; the **background** asks for the token by sending `ECHLY_GET_TOKEN_FROM_PAGE` to a dashboard tab (active tab first, then any tab with dashboard origin).

So after extension login we **redirect to the dashboard** and **do not redirect to returnUrl**. Keeping the user on the dashboard ensures:

- There is always a tab where the bridge can run.
- `currentUser` is set and tokens can be issued.
- The extension can call `getTokenFromPage()` / `getValidToken()` successfully for API requests.

---

## Extension Authentication Architecture

- **Background:** Does not store tokens. When it needs a token it calls `getTokenFromPage()` → content script → bridge on a dashboard tab → `getIdToken()` → token returned to background.
- **Session cache:** In-memory, short TTL (e.g. 30s), used to avoid redundant session checks when opening the tray.
- **Login complete:** Login page sends `ECHLY_EXTENSION_LOGIN_COMPLETE`. Background runs `refreshExtensionAuth()` (which runs `checkBackendSession()` and then sends `ECHLY_AUTH_STATE_UPDATED` to all tabs). Content script and widgets update user state from that message.
- **No redirect to returnUrl:** After extension login, the user is sent to `/dashboard` only. The dashboard tab remains the single, reliable token source for the extension.

---

## Why the Dashboard Remains Open

- **Loom-style UX:** User expects to land in the product (dashboard) after signing in from the extension, not back on an arbitrary site.
- **Token source:** The extension needs at least one dashboard tab so the bridge can run and provide `getIdToken()`. Redirecting to `returnUrl` would close or replace the login tab before the dashboard had loaded; keeping the user on the dashboard guarantees a tab with the bridge and a logged-in `currentUser`.
- **No login loop:** If the background ever needs a token and no dashboard tab exists, it can open the dashboard in the background (`chrome.tabs.create({ url: ".../dashboard", active: false })`) and retry token retrieval, instead of repeatedly opening login.

By redirecting to the dashboard and not to `returnUrl`, we keep one tab that is both the user’s landing page and the extension’s token source, matching the intended Loom-like behavior.
