# Echly Extension — Security Cleanup Report

This document describes the **security cleanup and hardening pass** applied to the Echly Chrome extension. The authentication architecture was **not changed**: Dashboard → Firebase Auth, Extension → stateless, token via pageTokenBridge, backend validates via `/api/auth/session`.

---

## 1. Removed Unused File

- **File removed:** `echly-extension/src/tokenBridgeConstants.ts`
- **Reason:** The bridge now uses dynamic channels via `secureBridgeChannel.ts`. No code imported `tokenBridgeConstants.ts`; constants are defined inline in `pageTokenBridge.js` and in `secureBridgeChannel.ts`.
- **Verification:** No imports reference this file; no runtime dependency exists.

---

## 2. Simplified Legacy Token Cleanup

- **File:** `echly-extension/src/background.ts`
- **Changes:**
  - Kept `AUTH_STORAGE_KEYS_LEGACY` with exactly: `auth_idToken`, `auth_refreshToken`, `auth_expiresAtMs`, `auth_user`.
  - `clearAuthState()` only removes these keys if present (no other keys touched).
  - Added an explicit comment: legacy keys are **cleanup only**; the extension must **never write** these keys again.
- **Result:** Legacy storage handling is clear and minimal; extension remains stateless for auth.

---

## 3. Restricted Bridge Exposure

- **Bridge response structure:** The page token bridge response was hardened so the response object exposes **only**:
  - `channel`
  - `type` (e.g. `"ECHLY_TOKEN_RESPONSE"`)
  - `nonce`
  - `token`
- **Excluded from response:** `user`, `email`, `uid`, `metadata`, `expiration` — only the token is returned to reduce information leakage.
- **Implementation:** Response is built explicitly in `pageTokenBridge.js` with a single helper; no extra fields are ever sent.

---

## 4. Strict Origin Validation

- **File:** `echly-extension/src/pageTokenBridge.js` (and root `pageTokenBridge.js`)
- **Change:** The origin check was moved to the **top** of the message handler.
- **Structure:** After validating that `event.data` is an object, the handler immediately checks: if origin is **not** in the allowed list → **return** (no further processing).
- **Allowed origins:**
  - `https://echly-web.vercel.app`
  - `http://localhost:3000`
- **Benefit:** Malicious or cross-origin messages are rejected before any handshake or token logic runs, reducing attack surface.

---

## 5. Reduced Bridge Response Surface

- The bridge now returns a single, minimal response shape for token replies.
- Only the fields required for the secure handshake and token delivery are exposed (`channel`, `type`, `nonce`, `token`).
- No user or session metadata is included in the bridge response.

---

## 6. Web Accessible Resources and Permissions

- **web_accessible_resources:** `pageTokenBridge.js` is exposed **only** to dashboard origins:
  - `https://echly-web.vercel.app/*`
  - `http://localhost:3000/*`
- It is **not** exposed to `<all_urls>`.
- **Permissions:** The manifest was verified; it does **not** contain `identity` or `oauth2`. No changes were required.

---

## Summary

| Item | Action |
|------|--------|
| Unused constants file | Removed `tokenBridgeConstants.ts` |
| Legacy storage | Simplified cleanup; comment that keys are legacy-only, never written |
| Bridge response | Restricted to `channel`, `type`, `nonce`, `token` only |
| Origin check | Moved to top of handler; reject non-dashboard origins immediately |
| Bridge exposure | Response surface reduced; no user/email/uid/metadata/expiration |
| Manifest | Confirmed `pageTokenBridge.js` only for dashboard origins; no identity/oauth2 |

Authentication logic, dashboard login, and backend auth were **not** modified. This was strictly a cleanup and hardening pass.
