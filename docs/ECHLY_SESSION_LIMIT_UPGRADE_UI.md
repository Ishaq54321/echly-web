# Echly Extension — Session Limit Upgrade UI

**Summary:** When a user hits the session limit and tries to start a new session, the extension now shows a branded upgrade screen inside the tray instead of failing silently. No backend or plan-enforcement logic was changed.

---

## 1. Limit detection

**Location:** `echly-extension/src/content.tsx` — `createSession()`.

- After `POST /api/sessions`, the response is parsed as JSON.
- If `res.status === 403` and `data.error === "PLAN_LIMIT_REACHED"`, the function returns a limit object instead of `null`:
  - `limitReached: true`
  - `message`: from backend `data.message` (fallback: `"You've reached your session limit."`)
  - `upgradePlan`: from backend `data.upgradePlan` (passed through for future use).

**Return type:** `Promise<{ id: string } | { limitReached: true; message: string; upgradePlan: unknown } | null>`.

---

## 2. Tray state (SESSION_LIMIT_REACHED)

**Location:** `echly-extension/src/content.tsx` — `ContentApp` state.

- New state: `sessionLimitReached: { message: string; upgradePlan: unknown } | null`.
- Set when the `ECHLY_START_SESSION_REQUEST` handler receives a limit result from `createSession()`; the tray is expanded so the user sees the upgrade view.
- Cleared when the user collapses the tray (`onCollapseRequest` → `setSessionLimitReached(null)`).

---

## 3. UI: SessionLimitReachedView

**Location:** `components/CaptureWidget/SessionLimitReachedView.tsx`.

- **Layout:** Centered; illustration at top, then title, description, primary button.
- **Title:** “You've reached your session limit.”
- **Description:** Renders the backend `message` (dynamic; can include session count).
- **Primary button:** “Upgrade Plan” — sends message `ECHLY_OPEN_BILLING`.
- **Illustration:** Branded orbit/planet SVG (Echly blue `#1775E0`, soft gradients) representing session orbit/workflow.

**Styles:** `echly-extension/popup.css` — `.echly-limit-reached-view`, `.echly-limit-reached-title`, `.echly-limit-reached-description`, `.echly-limit-reached-upgrade-btn`, illustration wrapper.

---

## 4. Upgrade button → billing

**Message:** `ECHLY_OPEN_BILLING`.

**Handler:** `echly-extension/src/background.ts`.

- `chrome.tabs.create({ url: `${WEB_APP_URL}/settings/billing` })`.
- Uses the same app origin as the rest of the extension (e.g. `WEB_APP_URL` from `echly-extension/config.ts`).

---

## 5. Tray behavior when limit view is active

**Location:** `components/CaptureWidget/CaptureWidget.tsx`.

When `sessionLimitReached` is set:

- **Hidden:** Session title, home button, theme toggle, capture mode toggle, session controls, feedback list, mode tiles, footer (Start Session / Previous Sessions / Add Feedback).
- **Shown:** Header with **close only** (`CaptureHeader` with `showOnlyClose={true}`), then `SessionLimitReachedView` (illustration, title, message, Upgrade Plan button).

So the user only sees the upgrade content and the close (minimize) icon.

---

## 6. End-to-end flow

1. User clicks **Start Session** (tray footer or equivalent).
2. Extension sends `ECHLY_START_SESSION` → background forwards to active tab as `ECHLY_START_SESSION_REQUEST`.
3. Content script runs `createSession()` → `POST /api/sessions`.
4. Backend returns **403** with body `{ error: "PLAN_LIMIT_REACHED", message, upgradePlan }`.
5. `createSession()` returns `{ limitReached: true, message, upgradePlan }`.
6. Content handler sets `sessionLimitReached` and calls `onExpandRequest()`.
7. Tray expands and shows **SessionLimitReachedView** (limit message, Upgrade Plan button, close only).
8. User clicks **Upgrade Plan** → `ECHLY_OPEN_BILLING` → new tab opens `WEB_APP_URL/settings/billing`.

---

## 7. Confirmation checklist

| Item | Status |
|------|--------|
| Limit detection on 403 + `PLAN_LIMIT_REACHED` | ✅ Implemented in `createSession()` |
| `message` and `upgradePlan` extracted from response | ✅ Returned and stored in `sessionLimitReached` |
| SessionLimitReachedView renders with dynamic message | ✅ Description shows backend `message` |
| Upgrade button opens billing page | ✅ `ECHLY_OPEN_BILLING` → `chrome.tabs.create(…/settings/billing)` |
| Tray shows only upgrade view + close when limit is active | ✅ `showOnlyClose` + conditional body/footer |
| No backend or plan-enforcement changes | ✅ Extension-only UX change |

---

## 8. Files touched

| File | Change |
|------|--------|
| `echly-extension/src/content.tsx` | `createSession()` limit detection and return type; `sessionLimitReached` state; handler sets limit and expands; clear limit on collapse; pass `sessionLimitReached` to CaptureWidget |
| `echly-extension/src/background.ts` | Handle `ECHLY_OPEN_BILLING` → open billing tab |
| `components/CaptureWidget/SessionLimitReachedView.tsx` | **New** — limit view + orbit illustration |
| `components/CaptureWidget/CaptureWidget.tsx` | Accept `sessionLimitReached`; render SessionLimitReachedView and minimal header when set |
| `components/CaptureWidget/CaptureHeader.tsx` | `showOnlyClose` prop for minimal header |
| `components/CaptureWidget/types.ts` | `sessionLimitReached` prop on CaptureWidgetProps |
| `echly-extension/popup.css` | Styles for limit view and upgrade button |
