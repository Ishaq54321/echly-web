# Echly Chrome Extension — Architecture Refactor Report

**Date:** March 16, 2025  
**Scope:** Restore Loom-style auto-injection, fix CORS by moving all API calls to background, prevent duplicate widget injection. No UI logic or component changes.

---

## 1. Files Modified

| File | Changes |
|------|---------|
| `echly-extension/src/content.tsx` | Switched API usage to messaging; added duplicate-injection guard at top of `main()`. |
| `echly-extension/src/background.ts` | Set `echlyActive` on widget open; added `tabs.onActivated` and `tabs.onUpdated` auto-injection. |
| `echly-extension/content.js` | Rebuilt from `content.tsx` (no manual edits). |
| `echly-extension/background.js` | Rebuilt from `background.ts` (no manual edits). |

**Not modified:** `manifest.json`, `popup.*`, React widget components, `contentScreenshot.ts`, `sessionRelay.ts`, `api.ts`, `contentAuthFetch.ts`.

---

## 2. API Calls Moved to Background

### Before (CORS risk)

- **Content script** used `contentAuthFetch.ts`, which called `fetch(url, …)` in the page context after getting a token via message. Those requests were from the page origin and hit CORS on `http://localhost:3000`.

### After

- **Content script** uses `echly-extension/src/api.ts`, which does **no** `fetch`. It sends a single message type:
  - `type: "echly-api"` with `{ url, method, headers, body }`
- **Background** already had a handler for `"echly-api"` that:
  - Ensures a valid extension token
  - Calls `apiFetch(url, …)` in the service worker (same origin as extension, no CORS)
  - Replies with `{ ok, status, headers, body }`
- Content builds a `Response`-like object from that reply, so existing `res.json()`, `res.ok` usage in the widget is unchanged.

All content-originated API usage now goes through this single proxy:

- `GET /api/sessions`, `GET /api/sessions?limit=1`
- `POST /api/sessions`
- `GET /api/sessions/:id`
- `PATCH /api/sessions/:id`
- `POST /api/structure-feedback`
- `POST /api/feedback`
- `PATCH /api/tickets/:id`, `DELETE /api/tickets/:id`

Screenshot upload and AI processing were already in the background:

- `ECHLY_UPLOAD_SCREENSHOT` → background calls `POST /api/upload-screenshot`
- `ECHLY_PROCESS_FEEDBACK` → background calls `/api/structure-feedback` and `/api/feedback`

No new API routes were added; only the source of the request (content → background) changed for the above list.

---

## 3. Messaging Endpoints Used

Existing background message handlers used by the content script (unchanged; listed for reference):

| Message type | Role |
|--------------|------|
| `echly-api` | Content → background: proxy any API request; response `{ ok, status, headers, body }`. |
| `ECHLY_GET_EXTENSION_TOKEN` | Content no longer uses this for direct fetch; `api.ts` uses `echly-api` only. |
| `ECHLY_GET_GLOBAL_STATE` | Sync UI state to content. |
| `ECHLY_OPEN_WIDGET` | Trigger open flow (sets `echlyActive`, injects, opens widget). |
| `ECHLY_SET_ACTIVE_SESSION` | Set active session and load pointers. |
| `ECHLY_UPLOAD_SCREENSHOT` | Upload screenshot from background. |
| `ECHLY_PROCESS_FEEDBACK` | AI structure + feedback in background. |
| `ECHLY_FEEDBACK_CREATED` / `ECHLY_TICKET_UPDATED` / `ECHLY_SESSION_UPDATED` | Notify background of UI-driven updates. |

No new message types were added; content was refactored to use the existing `echly-api` proxy instead of `contentAuthFetch` (which used `fetch` in the content script).

---

## 4. Injection and Activation Behavior

### Activation (Loom-style)

- **Trigger:** User opens the extension (popup). When authenticated, the popup sends `ECHLY_OPEN_WIDGET` and closes.
- **Background on `ECHLY_OPEN_WIDGET`:**  
  - Sets `chrome.storage.local.echlyActive = true`.  
  - Sets `globalUIState.visible` / `expanded`, broadcasts state.  
  - Injects content script into the active tab if needed (`ensureContentScriptInjected`).  
  - Sends `ECHLY_OPEN_WIDGET` to the active tab so the widget opens.

So “activate Echly” = first time the user opens the extension (popup) and the widget is shown; from then on `echlyActive` is true and injection runs on tab switch and load.

### Auto-injection (widget on every tab)

- **`chrome.tabs.onActivated`**  
  - Reads `echlyActive` from `chrome.storage.local`.  
  - If `echlyActive` is true: calls `ensureContentScriptInjected(activeInfo.tabId)`, then sends `ECHLY_GLOBAL_STATE` and `ECHLY_SESSION_STATE_SYNC` to that tab.

- **`chrome.tabs.onUpdated`**  
  - Fires when `changeInfo.status === "complete"`.  
  - Reads `echlyActive`.  
  - If true: calls `ensureContentScriptInjected(tabId)`, then sends `ECHLY_GLOBAL_STATE` to that tab.

So once Echly is active, every tab (and every full page load) gets the content script and state; the widget appears without the user clicking the icon again.

### Duplicate injection guard

- At the **top of `main()`** in `content.tsx`:
  - If `window.__ECHLY_WIDGET_LOADED__` is already true, `main()` returns immediately.
  - Otherwise sets `window.__ECHLY_WIDGET_LOADED__ = true` and continues (single mount).
- Bottom of the script: always calls `main()` (guard inside `main()` prevents double mount when the script is injected more than once on the same page).

---

## 5. Manifest Verification

- **Permissions:** `storage`, `activeTab`, `tabs`, `scripting` — present and sufficient for scripting API and `echlyActive`.
- **host_permissions:** `"<all_urls>"`, `"http://localhost:3000/*"` — present for injection and API.
- **content_scripts:** Not present — no automatic content script injection; avoids the Chrome device permission prompt. Confirmed unchanged.

---

## 6. Verification Checklist (Manual)

After loading the unpacked extension and using the app:

1. **New tab, no prior activation**  
   - Open a new tab.  
   - **Expected:** Widget does **not** appear automatically.

2. **First activation**  
   - Click the Echly extension icon (popup may open and close if already signed in).  
   - **Expected:** Widget loads on the current tab.

3. **Tab switch after activation**  
   - Switch to another tab.  
   - **Expected:** Widget appears automatically on that tab.

4. **Refresh**  
   - Refresh the page.  
   - **Expected:** Widget appears again after load.

5. **Start Session**  
   - Click Start Session in the widget.  
   - **Expected:** API request succeeds (session created); no CORS errors in console.

6. **Previous Sessions**  
   - Click Previous Sessions and load list.  
   - **Expected:** Sessions load; no CORS errors.

7. **Console**  
   - **Expected:** No CORS errors for `localhost:3000` API calls.

8. **Chrome permission popup**  
   - **Expected:** No extra Chrome permission or device permission popup from the extension.

---

## 7. Summary

- **CORS:** All API calls from the content script go through the background via the existing `echly-api` handler; content no longer calls `fetch` for the app API.
- **Loom-style:** After the user activates Echly once (via popup → `ECHLY_OPEN_WIDGET`), `echlyActive` is set and the widget is injected on every tab and on every full page load.
- **Duplicate injection:** Prevented by `window.__ECHLY_WIDGET_LOADED__` at the top of `main()`.
- **Device permission:** Unchanged; manifest still has no `content_scripts`.
- **UI:** No changes to widget UI or component logic; only the content script’s API layer was switched from `contentAuthFetch` to `api.ts` (messaging).
