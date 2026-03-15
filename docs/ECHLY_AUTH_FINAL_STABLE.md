# Echly extension tray flash fix — final stable flow

## Summary

The **extension tray flash bug** was fixed by separating tray opening from authentication: the tray only opens **after** a successful token check. No auth validation runs after the tray is shown on icon click.

---

## What was the tray flash bug?

**Observed behavior:**

- User clicks the extension icon.
- The tray briefly opens.
- The extension then navigates to dashboard/login.
- The tray disappears after ~1 second.

**Cause:** Authentication validation was effectively running (or the UI was updating) **after** the tray was shown. Concretely:

1. The click handler used a **synchronous** check (`hasValidToken()`) and could open the tray immediately.
2. If the in-memory token was missing (e.g. after service worker restart) or something else triggered auth later, the flow would open the login page and/or clear state, hiding the tray.
3. There was no strict rule that “tray must not open before authentication check completes,” so the tray could appear before the final auth outcome was known.

So the bug was a **ordering/race** issue: tray opening and auth were not clearly separated, and the tray could open before the auth decision was final.

---

## New click flow

```
User clicks extension icon
         ↓
   ECHLY CLICK (log)
         ↓
   originTabId = tab?.id ?? null
         ↓
   await getValidToken()
         ↓
   ┌─────────────────┬─────────────────┐
   │ token valid      │ no token (throw)│
   │ ECHLY TOKEN VALID│ ECHLY LOGIN     │
   │                  │ REQUIRED (log)  │
   │ If tray visible  │ If tray visible │
   │   → close tray   │   → return      │
   │ Else             │ Else            │
   │   → openTray()   │   → openLoginOnce(loginUrl)
   │   (ECHLY TRAY    │   (focus existing login tab
   │    OPEN)         │    or create one)
   └─────────────────┴─────────────────┘
```

**Rules enforced:**

- **Tray never opens before auth completes:** We `await getValidToken()` first. Only after that do we call `openTray()` or open login.
- **Login only when not already showing tray:** If `globalUIState.visible` is true, we do not open the login page (avoid duplicate login tabs and confusing UX).
- **Single login tab:** `openLoginOnce(loginUrl)` uses `chrome.tabs.query({ url: "*://echly-web.vercel.app/login*" })`; if a login tab exists we focus it, otherwise we create one (no second tab).

---

## Files modified

| File | Changes |
|------|--------|
| `echly-extension/src/background.ts` | See below |

### 1. Click handler (`chrome.action.onClicked`)

- **Before:** Synchronous handler; used `hasValidToken()` and could open tray or login immediately, with no strict “auth then tray” ordering.
- **After:** `async` handler that:
  - Logs `ECHLY CLICK`.
  - Sets `originTabId`.
  - **Awaits** `getValidToken()` (throws if no token).
  - On success: logs `ECHLY TOKEN VALID`; if tray already visible, closes it; else calls `openTray()` (which logs `ECHLY TRAY OPEN`).
  - On catch: if tray visible, returns; else logs `ECHLY LOGIN REQUIRED` and `await openLoginOnce(loginUrl)`.

No auth check runs **after** the tray is opened in this path.

### 2. `openLoginOnce(loginUrl)`

- New helper that:
  - Queries tabs with `url: "*://echly-web.vercel.app/login*"`.
  - If one exists → focus it and set `loginTabId`.
  - If none → create one tab with `loginUrl` and set `loginTabId`.
- Prevents opening a second login tab.

### 3. `openTray()`

- Unchanged in responsibility: only sets `globalUIState.visible = true`, `globalUIState.expanded = true`, then `persistUIState()` and `broadcastUIState()`.
- Added unconditional `console.log("ECHLY TRAY OPEN")` for debugging.

### 4. Debug logs added

- `console.log("ECHLY CLICK")` at start of click handler.
- `console.log("ECHLY TOKEN VALID")` when token is valid.
- `console.log("ECHLY LOGIN REQUIRED")` when opening login.
- `console.log("ECHLY TRAY OPEN")` inside `openTray()`.

### 5. No post-tray auth in click path

- There were no `getValidToken().then(...)` or `validateSessionWithBackend()` calls in the click handler after opening the tray; the only async auth in the click flow is the single `await getValidToken()` **before** opening the tray or login.
- Other handlers (e.g. `ECHLY_EXTENSION_LOGIN_SUCCESS`, `ECHLY_EXTENSION_TOKEN`) still call `openTray()` only when the extension has just received a token; they do not run “post-tray” auth validation in the sense of the bug.

---

## Expected result

**Logged in:**

- Click extension → tray opens and stays open (no dashboard flash, no tray flicker).

**Logged out:**

- Click extension → login page opens once (existing tab focused or one new tab).
- User logs in → return to original tab (and optional close of login tab).
- Tray opens after login success.
- No dashboard flash, no tray flicker.

---

## Build and test

After changes:

```bash
npm run build
npm run build:extension
```

Then reload the extension in `chrome://extensions` and verify:

- Logged in: click → tray opens and stays open; console shows ECHLY CLICK → ECHLY TOKEN VALID → ECHLY TRAY OPEN.
- Logged out: click → ECHLY CLICK → ECHLY LOGIN REQUIRED, login tab focused or created once; after login, tray opens without flash.
