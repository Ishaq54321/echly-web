# Echly Extension: Instant Launch (Loom-Style)

This document describes the extension’s instant-launch behavior: the tray opens immediately on icon click, while authentication runs in the background and does not block the UI.

## Behavior

### Extension opens instantly

- When the user clicks the extension icon, the **tray opens immediately**.
- No network or auth work is done before showing the UI.
- Visibility and expanded state are set, persisted, and broadcast in the same tick so the content script can show the tray without delay.

### Authentication happens asynchronously

- After opening the tray, the background script starts a **non-blocking** auth check (`checkBackendSession()`).
- The click handler does **not** `await` the session check.
- When the session check finishes, the background:
  - Updates the in-memory session cache.
  - Broadcasts `ECHLY_AUTH_STATE_UPDATED` to all tabs with `authenticated` and `user` (or `null`).

### Widget updates when auth result arrives

- The content script listens for `ECHLY_AUTH_STATE_UPDATED`.
- On receipt:
  - If `authenticated` and `user` are present, it sets the current user and the full widget (sessions, capture, etc.) is shown.
  - If not authenticated, it clears the user; the tray remains open and shows the **login UI** (Sign in button) inside the tray.
- The tray is **never** gated on auth: it renders as soon as the user opens it, and the login state is updated when the auth result arrives.

### Architecture modeled after Loom

- **Loom**: Icon click opens the recording UI immediately; sign-in or account state is handled inside the UI or in the background.
- **Echly**: Same idea — icon click opens the tray immediately; auth runs in the background and the widget updates when the session result is ready. If the user is not signed in, they see the tray with a “Sign in” CTA instead of a blank or loading state.

## Implementation summary

| Layer | Responsibility |
|-------|----------------|
| **Background (`chrome.action.onClicked`)** | Set `globalUIState.visible` and `globalUIState.expanded`, call `persistUIState()` and `broadcastUIState()`, then start `checkBackendSession().then(...).catch(() => {})` without awaiting. On completion, broadcast `ECHLY_AUTH_STATE_UPDATED` to all tabs. |
| **Content script** | Listen for `ECHLY_GLOBAL_STATE` (tray visibility) and `ECHLY_AUTH_STATE_UPDATED` (auth result). Render the tray as soon as visibility is true; when `user === null`, render the login UI inside the tray; when `user` is set, render the full CaptureWidget. |
| **Login flow** | Unchanged: `getTokenFromPage()`, secure bridge, dashboard token source, and `refreshExtensionAuth()` after login completion remain as before. |

## What does not change

- **Token flow**: Token is still obtained from the dashboard page via the content script (postMessage), not stored in the extension.
- **Login completion**: After the user signs in on the dashboard, `ECHLY_EXTENSION_LOGIN_COMPLETE` still triggers `refreshExtensionAuth()`, which runs `checkBackendSession()` and broadcasts `ECHLY_AUTH_STATE_UPDATED`.
- **Session cache**: In-memory session cache and TTL in the background are unchanged; only the **timing** of when we run the check relative to the icon click has changed (after opening the tray, not before).

## Result

- **Before**: Icon click could wait 2–4 seconds for `checkBackendSession()` before opening the tray.
- **After**: Tray opens on click with no wait; auth runs in the background and the widget updates when the result is ready, with login UI shown in-tray when the user is not authenticated.
