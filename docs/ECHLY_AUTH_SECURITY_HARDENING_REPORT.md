# Echly Extension — Auth Security Hardening Report

**Date:** March 14, 2025  
**Scope:** Chrome extension authentication bridge only. Backend and dashboard auth logic unchanged.

---

## 1. Bridge security improvements

- **Origin verification:** The bridge responds only when `event.origin` is in the allowed list:
  - `https://echly-web.vercel.app`
  - `http://localhost:3000`
  Any other origin is ignored; no response is sent.

- **Source validation:** Every message (handshake and token request) must include `source: "ECHLY_EXTENSION"`. Messages without this field are dropped.

- **Strict message filtering:** The bridge only processes messages that have:
  - Correct handshake channel (`ECHLY_BRIDGE_HANDSHAKE_CHANNEL`) for handshake, or negotiated channel for token requests
  - Correct `type` (`ECHLY_BRIDGE_HANDSHAKE`, `ECHLY_REQUEST_TOKEN`, etc.)
  - Correct `source`: `ECHLY_EXTENSION`
  - For token requests: `nonce` present

- **Token response target:** Token responses are sent with `window.postMessage(..., event.origin)` only. The wildcard `"*"` is never used.

- **No static channel:** The previous fixed channel `ECHLY_SECURE_AUTH_CHANNEL` was replaced by a per-page negotiated channel (e.g. `ECHLY_SECURE_CHANNEL_f83f1a6c`).

---

## 2. Manifest changes

- **Bridge injection limited to dashboard:**
  - `web_accessible_resources`: `pageTokenBridge.js` is exposed only to:
    - `https://echly-web.vercel.app/*`
    - `http://localhost:3000/*`
  - Content script still runs on `<all_urls>`; the bridge script is injected only when the content script runs on a dashboard origin.

- **Permissions removed:**
  - `identity` — removed (no longer using `chrome.identity.launchWebAuthFlow`).
  - `oauth2` block — removed (no extension-side OAuth).

- **Result:** Content script runs on all sites; bridge runs only on the dashboard.

---

## 3. Removal of OAuth flows

- **Deleted:** `echly-extension/src/auth.ts`
  - Contained `signInWithGoogle()` using `chrome.identity.launchWebAuthFlow`, `exchangeGoogleIdToken`-style flow with Firebase `signInWithCredential`, and `subscribeToAuthState` / `signOut` for extension-local auth.

- **No remaining references to:**
  - `launchWebAuthFlow`
  - `exchangeGoogleIdToken`
  - `refreshIdToken`

- **Extension login behavior:** Login is only via the dashboard. The extension opens the dashboard login page (e.g. `https://echly-web.vercel.app/login?extension=true`) when the user needs to sign in; no in-extension OAuth.

---

## 4. Removal of token storage

- **Legacy keys:** The extension no longer reads or writes:
  - `auth_idToken`
  - `auth_refreshToken`
  - `auth_expiresAtMs`

- **Background script:** `AUTH_STORAGE_KEYS` was replaced with `AUTH_STORAGE_KEYS_LEGACY`. `clearAuthState()` still removes these keys (and `auth_user`) for one-time cleanup of old data only; no code path writes tokens to storage.

- **Principle:** The extension is stateless with respect to tokens; it does not persist tokens.

---

## 5. Handshake protocol

- **Module:** `echly-extension/src/secureBridgeChannel.ts`

- **Channel id:** Generated with `crypto.randomUUID()` and formatted as:
  - `ECHLY_SECURE_CHANNEL_` + 8 hex characters (e.g. `ECHLY_SECURE_CHANNEL_f83f1a6c`).

- **Flow:**
  1. Content script generates a channel id and sends a handshake:
     - `channel: "ECHLY_BRIDGE_HANDSHAKE_CHANNEL"`
     - `type: "ECHLY_BRIDGE_HANDSHAKE"`
     - `proposedChannel: "ECHLY_SECURE_CHANNEL_<random>"`
     - `source: "ECHLY_EXTENSION"`
  2. Bridge (on dashboard only) validates origin and source, stores `proposedChannel`, and replies:
     - `channel: <proposedChannel>`
     - `type: "ECHLY_BRIDGE_READY"`
  3. All subsequent token requests use that channel, plus `type: "ECHLY_REQUEST_TOKEN"`, `nonce`, and `source: "ECHLY_EXTENSION"`.

- **Caching:** The content script caches the negotiated channel for the page lifetime so handshake runs once per load.

---

## 6. Final authentication flow

1. **User signs in:** On the dashboard (echly-web.vercel.app or localhost:3000). No sign-in inside the extension.

2. **Token need (e.g. API call):** Background sends `ECHLY_GET_TOKEN_FROM_PAGE` to a dashboard tab’s content script.

3. **Content script (dashboard tab):**
   - Injects the bridge if on a dashboard origin (bridge is only injected there).
   - Runs handshake via `secureBridgeChannel.performHandshake()` (sends `ECHLY_BRIDGE_HANDSHAKE`, receives `ECHLY_BRIDGE_READY`).
   - Sends `ECHLY_REQUEST_TOKEN` with negotiated channel, nonce, and `source: "ECHLY_EXTENSION"`.

4. **Bridge (page context):**
   - Verifies origin is allowed dashboard origin.
   - Verifies `source === "ECHLY_EXTENSION"`, correct channel, type, and nonce.
   - Reads Firebase user from `window.firebase.auth().currentUser`, calls `getIdToken()`.
   - Sends `ECHLY_TOKEN_RESPONSE` with `channel`, `type`, `nonce`, and `token` via `postMessage(..., event.origin)` (never `"*"`).

5. **Content script:** Receives response, matches nonce and channel, returns token to background.

6. **Backend:** Token is sent as `Authorization: Bearer <token>` and validated via `/api/auth/session`. No token storage in the extension.

---

## Summary

| Area                 | Change                                                                 |
|----------------------|------------------------------------------------------------------------|
| Bridge injection     | Dashboard origins only (manifest + content script guard)             |
| Channel              | Random per-page channel via handshake; no static channel              |
| Source               | All messages require `source: "ECHLY_EXTENSION"`                       |
| Filtering             | Strict checks: channel, type, source, nonce                            |
| Origin                | Bridge responds only to allowed dashboard origins; reply uses `event.origin` |
| OAuth                 | Removed; login only via dashboard                                     |
| Permissions           | Removed `identity` and `oauth2`                                       |
| Token storage         | No reads/writes of id/refresh/expires; cleanup only for legacy keys   |

The extension remains **stateless**, with tokens **requested from the dashboard page** and **validated by the backend** via `/api/auth/session`.
