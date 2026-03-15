# Extension Auth: Cookie Bridge (Page-Context Token Request)

## Why This Architecture

The extension’s **service worker (background)** cannot reliably send cookies to the app origin. Requests from the background to `GET /api/auth/extensionToken` do not include the dashboard’s `__session` cookie, which leads to 401s even when the user is logged in on the dashboard.

The fix is to perform the token request in the **dashboard page context**, where the browser automatically sends the `__session` cookie, then pass the token back to the extension. This mirrors Loom’s approach: token is obtained in the page, not in the service worker.

## Flow (Step by Step)

1. **User clicks extension icon** (or any flow that needs a token).
2. **Background** needs a token. It does **not** call `fetch(extensionToken)` itself. Instead it sends a message to the **content script** in the current (or a dashboard) tab: `ECHLY_REQUEST_EXTENSION_TOKEN`.
3. **Content script** (injected in the tab) receives the message. It calls `requestExtensionTokenFromPage()`, which:
   - Posts to the **page** via `window.postMessage({ type: "ECHLY_EXTENSION_TOKEN_REQUEST", id })`.
   - Listens for `ECHLY_EXTENSION_TOKEN_RESPONSE` with the same `id`.
4. **Dashboard page** (only when the tab is the Echly dashboard) has `EchlyExtensionTokenProvider` mounted. It listens for `ECHLY_EXTENSION_TOKEN_REQUEST`, then:
   - Runs `fetch("/api/auth/extensionToken", { method: "GET", credentials: "include" })` in the **page** context.
   - The browser sends the `__session` cookie with this request.
   - On success, it posts `ECHLY_EXTENSION_TOKEN_RESPONSE` with `id`, `token`, and optionally `uid`.
5. **Content script** receives the response via `window` message, resolves the promise, and sends the token (and uid) back to the **background** via `sendResponse({ token, uid })`.
6. **Background** stores the token in memory and uses it for API calls. No cookie is ever sent from the service worker; the token is obtained only via this bridge.

## Components

| Piece | Role |
|-------|------|
| **Background** | Never fetches extension token by itself. Asks content script via `chrome.tabs.sendMessage(tabId, { type: "ECHLY_REQUEST_EXTENSION_TOKEN" })`. Uses `getDashboardTabId()` when no specific tab is available (e.g. init). |
| **Content script** | Listens for `ECHLY_REQUEST_EXTENSION_TOKEN`, calls `requestExtensionTokenFromPage()` (postMessage to page, wait for response), then `sendResponse({ token, uid })`. |
| **requestExtensionTokenFromPage.ts** | Posts `ECHLY_EXTENSION_TOKEN_REQUEST` with unique `id`, listens for `ECHLY_EXTENSION_TOKEN_RESPONSE` with same `id`, resolves with `{ token, uid }` or rejects. |
| **EchlyExtensionTokenProvider (dashboard)** | Listens for `ECHLY_EXTENSION_TOKEN_REQUEST`, fetches `GET /api/auth/extensionToken` with `credentials: "include"`, posts `ECHLY_EXTENSION_TOKEN_RESPONSE` with `id`, `token`, `uid`. |

## Message Types

- **ECHLY_EXTENSION_TOKEN_REQUEST** (page, from content script): `{ type, id }`. Page should answer with `ECHLY_EXTENSION_TOKEN_RESPONSE`.
- **ECHLY_EXTENSION_TOKEN_RESPONSE** (page → content script): `{ type, id, token, uid? }`. Only the dashboard page responds; other origins do not have the listener.
- **ECHLY_REQUEST_EXTENSION_TOKEN** (background → content script): no payload. Content script responds with `{ token, uid? }`.

## When the Tab Is Not the Dashboard

If the user clicks the extension on a non-dashboard tab (e.g. google.com), the content script still posts `ECHLY_EXTENSION_TOKEN_REQUEST`, but no page script responds. The content script’s promise from `requestExtensionTokenFromPage()` can hang or be left without a response. The background can treat missing response as unauthenticated and open the login tab. Optional: add a timeout in `requestExtensionTokenFromPage()` to reject after a few seconds so the UI doesn’t hang.

## Backend

No backend changes. `GET /api/auth/extensionToken` still reads the `__session` cookie and returns `{ token, uid }`. The only change is **who** performs the request: the dashboard page (with cookies) instead of the extension background (without cookies).
