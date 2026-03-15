# Echly Chrome Extension — External Scripts & SDK Audit Report

**Audit date:** 2025-03-16  
**Scope:** Full repository scan for unnecessary external scripts, SDKs, injected libraries, and permissions.  
**Requirement:** Extension must NOT load third-party browser SDKs at runtime; only communicate with localhost:3000 (dev), Echly API server, and Chrome extension APIs. No dynamic injection of scripts from external CDNs.

---

## 1️⃣ External scripts detected

### Popup — external resources (not scripts)

| FILE | LINE NUMBER | CODE SNIPPET | WHY IT IS LOADED |
|------|-------------|--------------|------------------|
| `echly-extension/popup.html` | 6 | `<link rel="preconnect" href="https://fonts.googleapis.com">` | Preconnect to Google Fonts for Plus Jakarta Sans. |
| `echly-extension/popup.html` | 7 | `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` | Preconnect to font file origin. |
| `echly-extension/popup.html` | 8 | `<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet">` | Stylesheet loaded from Google Fonts CDN for popup typography. |

**Note:** No `<script src="https://...">` was found in the extension. The only script tag is `<script src="popup.js"></script>` (local bundle). The above are **stylesheet/font** requests to Google, not script loads.

### Built content script — Firebase URLs inside bundled code

The built file `echly-extension/content.js` contains bundled Firebase SDK code that includes **hardcoded external URLs** (in error messages / docs links, not necessarily fetched at runtime):

| FILE | LINE NUMBER | CODE SNIPPET | WHY IT IS LOADED |
|------|-------------|--------------|------------------|
| `echly-extension/content.js` | 36428 | `learnMoreLink.href = "https://firebase.google.com/docs/studio/preview-apps#preview-backend"` | Part of Firebase SDK UI (preview banner); link target only. |
| `echly-extension/content.js` | 65402 | `"Quota for bucket '" + bucket + "' exceeded, please view quota on https://firebase.google.com/pricing/."` | Firebase Storage error message string. |
| `echly-extension/content.js` | 65439 | `See https://firebase.google.com/docs/web/environments-js-sdk#polyfills` | Firebase Storage error message string. |

These are string literals inside the **bundled Firebase SDK** that was included in the content script bundle (see Section 4). They are not `script.src` assignments; the concern is the presence of the full Firebase SDK in the content script, not these URLs per se.

### Rest of repository (non-extension)

- **Web app / API:** Uses `googleapis.com` in `lib/server/auth.ts` (line 8) for **server-side** Firebase JWKS verification (`createRemoteJWKSet`). This is backend-only; the extension does not load this.
- **next.config.ts:** Allows `firebasestorage.googleapis.com`, `storage.googleapis.com`, etc. for Next.js image domains (web app, not extension).
- **Docs / markdown:** References to Firebase, Firebase Auth, and architecture (documentation only).

---

## 2️⃣ Dynamic script injections

Searches performed:

- `document.createElement("script")` / `createElement('script')`
- `script.src` assignments
- `appendChild(script)`
- `innerHTML` containing `<script>`

**Results:**

- **No** instances of dynamic script injection were found in the extension codebase.
- In `echly-extension/src/content.tsx`, `document.createElement` is used only for:
  - `"link"` (line 1461)
  - `"style"` (lines 1467, 1477)
  - `"div"` (lines 1491, 1649)  
  No `createElement("script")` or script append/innerHTML.

| FILE | LINE | PURPOSE |
|------|------|--------|
| *(none)* | — | No dynamic script injection detected. |

---

## 3️⃣ Suspicious permissions

**File audited:** `echly-extension/manifest.json`

**Current permissions:**

```json
"permissions": ["storage", "activeTab", "tabs"],
"host_permissions": ["<all_urls>", "http://localhost:3000/*"]
```

**Checked for:**

| Permission / key | Present? | Verdict |
|------------------|----------|--------|
| `identity` | No | Not used. |
| `identity.email` | No | Not used. |
| `oauth2` | No | Not used. |
| `externally_connectable` | No | Not used. |
| `nativeMessaging` | No | Not used. |
| `clipboardRead` | No | Not used. |
| `clipboardWrite` | No | Not used. |
| `debugger` | No | Not used. |
| `management` | No | Not used. |
| `webRequestBlocking` | No | Not used. |

**Conclusion:** None of the listed high-risk permissions appear in the manifest.  

- **storage** — Required for extension token and session state.  
- **activeTab** — Required for capture/screenshot and injecting UI.  
- **tabs** — Required for messaging all tabs (e.g. widget state, session reset).  
- **&lt;all_urls&gt;** — Required so the content script can run on any page and the extension can call the Echly API from the background (API base is configurable; dev uses localhost).  
- **http://localhost:3000/\*** — Required for dev dashboard and extension session endpoint.

No unnecessary or suspicious permissions identified; no extra device prompts implied by this set.

---

## 4️⃣ Unnecessary SDKs

### 4.1 Firebase SDK in content script bundle

**Finding:** The built content script **`echly-extension/content.js`** includes a large amount of **Firebase** code (e.g. `@firebase/util`, `@firebase/app`, `@firebase/auth`, `@firebase/analytics`, `@firebase/firestore`, `@firebase/storage`, etc.), as shown by comments and symbols in the bundle (e.g. around lines 35896–35920, 36215–36242, 36316–36451, 36550–38692, 37903–37931).

**Why it is there:**

- Content script entry is `echly-extension/src/content.tsx`.
- It imports `CaptureWidget` from `@/components/CaptureWidget`.
- `CaptureWidget` uses `useCaptureWidget` from `components/CaptureWidget/hooks/useCaptureWidget.ts`.
- `useCaptureWidget` imports `getSessionFeedback` from `@/lib/feedback`.
- `lib/feedback.ts` imports from `@/lib/repositories/feedbackRepository`.
- **`lib/repositories/feedbackRepository.ts`** imports from **`"firebase/firestore"`** and **`"@/lib/firebase"`** (lines 1–23).

The extension build (esbuild) only aliases **`@/lib/firebase`** to `echly-extension/stubs/firebase.ts`. It does **not** alias the bare package **`"firebase/firestore"`**, so the full Firestore SDK (and its dependency tree) is bundled into `content.js`. The content script is intended to use only the **extension token** and the Echly API (via `contentAuthFetch` → background); it should not use the Firebase client SDK.

**Evidence (source):**

| FILE | LINE | CODE / PURPOSE |
|------|------|----------------|
| `components/CaptureWidget/hooks/useCaptureWidget.ts` | 7 | `import { getSessionFeedback } from "@/lib/feedback";` |
| `lib/feedback.ts` | 1 | `import type { DocumentReference } from "firebase/firestore";` and repo imports |
| `lib/repositories/feedbackRepository.ts` | 1–23 | `import { ... } from "firebase/firestore";` and `import { db } from "@/lib/firebase";` |

**Conclusion:** The extension **should NOT** import or run the Firebase client SDK in the content script. Auth is via site cookie + extension token; content script should only talk to the background and the Echly API. The presence of the full Firebase SDK in `content.js` is **unnecessary** and increases size and attack surface.

### 4.2 Content script files checked for Firebase / Google / analytics

**Files audited:**

- **echly-extension/content.js** (built) — Contains bundled Firebase (see above). No direct `import` of `firebase/app`, `firebase/auth`, or Google APIs in source; Firebase enters via `lib/feedback` → `feedbackRepository`.
- **echly-extension/content-script-utils.js** — **Does not exist** in the repo.
- **echly-extension/sidePanelUtil.js** — **Does not exist** in the repo.

**Source files:**

- **echly-extension/src/content.tsx** — Uses `contentAuthFetch` (extension token via background). No Firebase or analytics imports.
- **echly-extension/src/contentAuthFetch.ts** — No Firebase; only Chrome messaging and `API_BASE`.
- **echly-extension/src/contentScreenshot.ts** — No Firebase (comment states upload goes through background).

**Conclusion:** The extension source does not intentionally import the Firebase client SDK in content scripts; Firebase appears in the bundle only because shared app code (`lib/feedback`, `feedbackRepository`) is pulled in and those modules import `firebase/firestore` (and the stub only replaces `@/lib/firebase`).

---

## 5️⃣ Popup HTML

**File:** `echly-extension/popup.html`

- **Scripts:** Only `<script src="popup.js"></script>` (line 29) — local bundle, no external script.
- **External resources:** Google Fonts (preconnect + stylesheet) as in Section 1. No `<script src="https://...">`.

**Verdict:** Popup does **not** load external scripts. It does load external **styles/fonts** from Google.

---

## 6️⃣ Background script

**Files:** `echly-extension/background.js` (built), `echly-extension/src/background.ts` (source).

**Findings:**

- No external script loading (no `createElement("script")`, no `script.src`, no dynamic script injection).
- No third-party SDK usage (no Firebase, analytics, or other SDK imports in source).
- Logic is limited to: Chrome APIs (`chrome.action`, `chrome.tabs`, `chrome.runtime`, `chrome.storage`), `fetch` to `API_BASE` (localhost:3000 in dev) for extension session and Echly API, and internal helpers (`apiFetch`, `setExtensionToken` from `utils/apiFetch` and `config`).

**Verdict:** Background script contains only extension logic and communication with the Echly backend (and localhost in dev). No external scripts or third-party SDKs.

---

## 7️⃣ Safe removals (recommended cleanup)

### A. Remove Firebase from content script bundle (high impact)

| Item | File path | Line / area | Exact code / behavior | Recommended fix |
|------|-----------|-------------|------------------------|-----------------|
| Firebase in content bundle | `echly-extension/content.js` (built) | Entire Firebase subtree (e.g. 35896+, 37903+) | Bundled `@firebase/*` and `firebase/*` due to `lib/feedback` → `feedbackRepository` importing `firebase/firestore`. | (1) Do not use `getSessionFeedback` (or any Firestore-backed API) from the content script. Use only the extension token and Echly HTTP API (e.g. `GET /api/feedback?sessionId=...` via `contentAuthFetch` / background). (2) Introduce an extension-only path for “session feedback” that does not import `lib/feedback` or `feedbackRepository` (e.g. a thin module that only calls the HTTP API). (3) Ensure no content-script dependency chain imports `firebase/firestore` or `firebase/auth`. Optionally add an esbuild alias or external for `firebase/*` in the content-script build so any stray import does not bundle the SDK. |

### B. Popup external resources (optional)

| Item | File path | Line | Exact code | Recommended fix |
|------|-----------|------|------------|-----------------|
| Google Fonts (preconnect + stylesheet) | `echly-extension/popup.html` | 6–8 | `preconnect` to `fonts.googleapis.com` and `fonts.gstatic.com`; `<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans...">` | To avoid any external CDN: ship Plus Jakarta Sans via `web_accessible_resources` (e.g. under `fonts/`) and reference local font files from `popup.css`. Popup already lists font files in manifest `web_accessible_resources`; switch the popup to use those local fonts instead of the Google Fonts stylesheet. |

### C. Firebase URL strings in bundled content.js

| Item | File path | Line | Exact code | Recommended fix |
|------|-----------|------|------------|-----------------|
| Firebase doc links in bundle | `echly-extension/content.js` | 36428, 65402, 65439 | String literals pointing to firebase.google.com | These disappear automatically once Firebase is no longer bundled into the content script (see A). No separate change needed. |

---

## Summary

| Category | Status |
|----------|--------|
| **External script URLs** | No `<script src="https://...">` in extension. Popup loads Google Fonts (stylesheet/fonts only). |
| **Dynamic script injection** | None found. |
| **Suspicious permissions** | None; manifest permissions are appropriate. |
| **Unnecessary SDKs** | Firebase SDK is bundled into `content.js` via shared `lib/feedback` → `feedbackRepository`; should be removed from content script. |
| **Popup HTML** | Only local `popup.js`; no external scripts. |
| **Background script** | Extension logic and Echly API only; no external scripts or SDKs. |

**Primary recommendation:** Remove the Firebase dependency from the content script by breaking the dependency chain (content script must not import `lib/feedback` or any module that imports `firebase/firestore`). Use only the extension token and Echly HTTP API in the content script. Optionally stop loading Google Fonts from the CDN in the popup and use the already-declared local font resources.
