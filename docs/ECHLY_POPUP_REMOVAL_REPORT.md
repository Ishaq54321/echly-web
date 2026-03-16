# Echly extension — legacy popup removal report

**Date:** 2025-03-16  
**Scope:** Remove legacy popup authentication UI; keep current auth architecture unchanged.

---

## Summary

The legacy popup UI has been removed. Extension icon behavior is unchanged: click opens the widget when logged in, or `/extension-auth` when logged out. No popup window and no Google sign-in UI in the extension.

---

## Step 1 — Manifest

| Item | Status |
|------|--------|
| **`default_popup` existed** | Yes — `"action": { "default_popup": "popup.html" }` |
| **Change applied** | Removed `default_popup`; set `"action": { "default_title": "Echly" }` |
| **Icons / other fields** | Unchanged (no icons in action; web_accessible_resources unchanged) |

**Note:** `popup.css` remains in `web_accessible_resources` because the **content script** loads it into the widget’s shadow DOM (`injectShadowStyles()` in `content.tsx`). It is the shared stylesheet for the in-page widget, not for the removed popup.

---

## Step 2 — Popup entry points

| File | Existed | Referenced in manifest? | Action |
|------|---------|--------------------------|--------|
| **popup.html** | Yes | Yes (via `default_popup`) | **Removed** |
| **echly-extension/src/popup.tsx** | Yes | No (only popup.html referenced) | **Removed** |
| **echly-extension/popup.js** | Yes (build output) | By popup.html | **Removed** |
| **popup-overrides.css** | Yes | No | **Removed** (popup-only overrides, unused) |
| **popup.css** | Yes | In web_accessible_resources | **Kept** — used by content script for widget shadow DOM |

Popup scripts and HTML are no longer in the build or runtime. No other extension code depended on the removed files.

---

## Step 3 — Build scripts

| Item | Status |
|------|--------|
| **esbuild-extension.mjs** | Popup build block removed (was `popup.tsx` → `popup.js`) |
| **Extension bundle contents** | **background**, **content**, **sessionRelay**, **utils** (via background/content). No popup entry. |

Popup code is no longer bundled.

---

## Step 4 — Icon click behavior

| Item | Status |
|------|--------|
| **Handler** | Icon click handled **only** by `chrome.action.onClicked` in `background.ts` (lines 34–68) |
| **Logged in** | `verifyDashboardSession()` passes → `openWidgetInActiveTab()`; widget toggles open |
| **Logged out** | Session invalid → `chrome.tabs.create({ url: EXTENSION_AUTH_URL })`; no popup |
| **Popup UI** | None; no `default_popup` in manifest |

Icon click is fully handled in the background script; no popup is involved.

---

## Step 5 — Google sign-in UI

| Search | Result |
|--------|--------|
| **signInWithPopup** | Not found in extension |
| **GoogleAuthProvider** | Not found in extension |
| **firebase/auth** | Not found in extension (stub only) |
| **login / sign-in** | Only in comments, config (`LOGIN_URL`), and auth broker flow |

No Google or Firebase sign-in UI runs inside the extension. Authentication is only via the dashboard `/extension-auth` broker and session/extension token.

---

## Step 6 — Final behavior

| State | Icon click result |
|-------|-------------------|
| **Logged in** | Toggle widget (open/close) in active tab |
| **Logged out** | Open `/extension-auth` in a new tab (auth broker) |
| **Popup window** | None |
| **Google sign-in box** | None (auth on dashboard only) |

---

## Architecture preserved

- Extension icon click → `background.ts` only  
- Auth via `/extension-auth` broker  
- `extensionToken` in memory only  
- Widget opened via `openWidgetInActiveTab()`  
- **ECHLY_OPEN_POPUP** message still supported: now opens `/extension-auth` (or focuses existing auth tab) instead of `popup.html`

---

## Report checklist

- [x] Whether **popup.html** existed — **Yes; removed.**  
- [x] Whether **default_popup** existed — **Yes; removed; replaced with `default_title: "Echly"`.**  
- [x] Whether **popup scripts were removed** — **Yes.** Removed: `popup.html`, `src/popup.tsx`, `popup.js`, `popup-overrides.css`. Kept: `popup.css` (widget styles).  
- [x] **Icon click** handled only by **background.ts** — **Confirmed.** `chrome.action.onClicked` in `background.ts`; no popup.
