# Launcher Asset Audit Report

**Scope:** Echly Chrome extension launcher icon loading system  
**Asset:** `echly-extension/assets/Echly_logo_launcher.svg`  
**Symptom:** Intermittent rendering (sometimes loads, sometimes broken)  
**Audit type:** Read-only diagnostic — no code changes.

---

## 1. Manifest Configuration

**File:** `echly-extension/manifest.json`

**Finding: The launcher asset is NOT declared in `web_accessible_resources`.**

Current `web_accessible_resources`:

```json
"web_accessible_resources": [
  {
    "resources": [
      "popup.css",
      "assets/Echly_logo.svg",
      "fonts/PlusJakartaSans-Regular.woff2",
      "fonts/PlusJakartaSans-Medium.woff2",
      "fonts/PlusJakartaSans-SemiBold.woff2",
      "fonts/PlusJakartaSans-Bold.woff2"
    ],
    "matches": ["<all_urls>"]
  }
]
```

- **Included:** `assets/Echly_logo.svg` (main logo)
- **Missing:** `assets/Echly_logo_launcher.svg` (launcher icon)

**Impact:** In Chrome MV3, resources loaded from content scripts (or from DOM inside the page context) must be listed in `web_accessible_resources` to be fetchable. If the launcher were loaded via `chrome.runtime.getURL("assets/Echly_logo_launcher.svg")`, the request could still fail or behave inconsistently without this entry. This is a **possible cause** for intermittent loading once the correct URL is used.

---

## 2. Runtime Asset Loading

**Search:** `chrome.runtime.getURL("assets/Echly_logo_launcher.svg")`

**Finding: The launcher SVG is never loaded via `chrome.runtime.getURL` in the current codebase.**

- **No file** uses `chrome.runtime.getURL("assets/Echly_logo_launcher.svg")`.
- The only `getURL` usage for logos in the extension is:
  - **content.tsx (lines 119–121):** `chrome.runtime.getURL("assets/Echly_logo.svg")` — this value is assigned to `logoUrl` and passed to CaptureWidget as **`launcherLogoUrl`**.
- So the **main logo** (`Echly_logo.svg`) is resolved via the extension runtime; the **launcher logo** (`Echly_logo_launcher.svg`) is not.

**Where the launcher image is actually set:**

| Location | What is used |
|----------|----------------|
| `components/CaptureWidget/CaptureWidget.tsx` (lines 254–258) | **Hardcoded** `src="/Echly_logo_launcher.svg"` on a plain `<img>` |
| `echly-extension/src/content.tsx` | Passes `launcherLogoUrl={logoUrl}` where `logoUrl` = `getURL("assets/Echly_logo.svg")` — used only as a **condition** (truthy = show launcher), not as the img `src` |

**Path consistency:**

- **Inconsistent:** Content script passes a **different** asset URL (`Echly_logo.svg`) as `launcherLogoUrl`. CaptureWidget uses that prop only to decide *whether* to show the launcher block (`extensionMode && launcherLogoUrl`). The actual image `src` is always the document-relative path `"/Echly_logo_launcher.svg"`, which is **never** rewritten to an extension URL.
- The extension stub `echly-extension/stubs/next-image.tsx` only rewrites `Echly_logo.svg` (and `src.endsWith("Echly_logo.svg")`). The launcher uses a raw `<img>`, not this stub, and the stub does **not** handle `Echly_logo_launcher.svg`.

**Conclusion:** The launcher icon is **not** loaded via `chrome.runtime.getURL("assets/Echly_logo_launcher.svg")` anywhere. The implementation does not match the intended design (extension URL for the launcher asset).

---

## 3. Widget Lifecycle

**File:** `echly-extension/src/content.tsx`

**Mount flow:**

1. **Entry:** `main()` is invoked at the bottom of the script (line 1491). Content script runs at `document_idle` (manifest).
2. **Single host:** `main()` gets or creates a single `div` with id `echly-shadow-host` (lines 1467–1482), appends it to `document.documentElement`, then calls `mountReactApp(host)` once.
3. **Single React mount:** `mountReactApp(host)` (lines 1327–1346):
   - Calls `injectPageStyles()`
   - Creates shadow root: `host.attachShadow({ mode: "open" })`
   - Injects styles into shadow root via `injectShadowStyles(shadowRoot)` (adds `popup.css` and reset)
   - Creates container `#echly-root`, appends to shadow root
   - `createRoot(container).render(<ContentApp widgetRoot={container} initialTheme={initialTheme} />)`

**Multiple mounts:** No. The host is created once; React is mounted once. No re-mount or duplicate host logic.

**`chrome.runtime` availability:**

- `logoUrl` (and thus `launcherLogoUrl`) is computed at **render time** in the component that renders `ContentApp` (lines 118–121):
  - `typeof chrome !== "undefined" && chrome.runtime?.getURL` then `chrome.runtime.getURL("assets/Echly_logo.svg")`.
- Content scripts always run in an extension context where `chrome.runtime` is defined, so by the time React renders, `chrome.runtime` is available. **No evidence that the launcher renders before extension context is ready.**

**Race note:** The launcher can still **appear** broken not because of timing of `chrome.runtime`, but because the **img src** is the document-relative path `/Echly_logo_launcher.svg`, which resolves to the **host page’s origin**. So lifecycle is not the root cause; asset URL resolution is.

---

## 4. CaptureWidget Launcher Logic

**File:** `components/CaptureWidget/CaptureWidget.tsx`

**Relevant block (lines 245–264):**

```tsx
{showFloatingButton && (
  <div className="echly-floating-trigger-wrapper">
    <button
      type="button"
      id={extensionMode && launcherLogoUrl ? "launcher_container" : undefined}
      onClick={...}
      className={`echly-floating-trigger${extensionMode && launcherLogoUrl ? " echly-launcher" : ""}`}
      aria-label="Open Echly"
    >
      {extensionMode && launcherLogoUrl ? (
        <img
          src="/Echly_logo_launcher.svg"
          className="echly-launcher-logo"
          alt="Echly"
        />
      ) : (
        extensionMode ? "Echly" : "Capture feedback"
      )}
    </button>
  </div>
)}
```

**Render conditions:**

- Launcher **block** (logo vs text): `extensionMode && launcherLogoUrl`.
- `launcherLogoUrl` is passed from content.tsx; in extension it is always truthy (it’s `chrome.runtime.getURL("assets/Echly_logo.svg")`). So in extension mode the launcher branch is always taken.

**State dependencies:**

- `showFloatingButton` = `!effectiveIsOpen && (showSidebar || showSessionSidebar)` (lines 100–101). Depends on open state, sidebar, and session tray. No direct dependency on async asset load.
- The **img** does not use `launcherLogoUrl` for `src`; it uses a fixed string. So there is no “unstable” state for the URL — the problem is that the URL is wrong for the extension context.

**Async behavior:**

- No `onLoad`/`onError` or lazy loading for the launcher image. No async state that would explain intermittency from loading delay.

**Summary:** Launcher visibility is gated by `extensionMode` and `launcherLogoUrl`; the **source of intermittency is not conditional rendering or async state in the widget**, but the **img src** resolving to the wrong origin (host page vs extension).

---

## 5. Shadow DOM Compatibility

**Usage:**

- **content.tsx (lines 1329–1342):** `host.attachShadow({ mode: "open" })`, then styles and `#echly-root` are appended to this shadow root. CaptureWidget (and thus the launcher) renders inside this shadow root.
- **Styles:** `injectShadowStyles(shadowRoot)` injects a `<link rel="stylesheet" href={chrome.runtime.getURL("popup.css")}>` into the shadow root. So CSS is loaded from the extension and is valid in shadow DOM.

**Asset loading inside shadow DOM:**

- Relative URLs in shadow DOM resolve against the **document’s base URL** (the host page), not the extension. So `src="/Echly_logo_launcher.svg"` becomes `{hostPageOrigin}/Echly_logo_launcher.svg`.
- For an extension asset to load inside shadow DOM, the **full extension URL** must be used (e.g. `chrome.runtime.getURL("assets/Echly_logo_launcher.svg")`), and the resource must be in `web_accessible_resources`.
- **Conclusion:** The launcher image **does** load inside shadow DOM, but only when the **src** is the extension URL. With the current document-relative src, it loads from the host page and fails on most sites. Chrome extension assets are accessible from shadow DOM **if** the correct extension URL is used and the resource is web-accessible.

---

## 6. CSS Rendering

**Checked:** `app/globals.css`, `echly-extension/popup.css` (and build output under `.next`).

**`.echly-launcher` and `.echly-launcher-logo`:**

- **globals.css (lines 2034–2052):**  
  `.echly-launcher`: width/height 64px, border-radius 18px, overflow hidden, padding 0, box-shadow.  
  `.echly-launcher:hover`: translateY(-2px).  
  `.echly-launcher-logo`: width/height 100%, object-fit contain, display block.
- **popup.css (lines 5146–5163):** Same rules (extension bundle).

**Nothing in CSS hides the image:** No `display: none`, `visibility: hidden`, or `opacity: 0` on these classes. No `overflow` that would clip the image in a way that would explain “broken” vs “working.” CSS is not the cause of intermittency.

---

## 7. Caching

**Expected extension URL format:**  
`chrome-extension://<extension-id>/assets/Echly_logo_launcher.svg`

**Current implementation:** The launcher **never** receives this URL. The img uses `src="/Echly_logo_launcher.svg"`, which resolves to the **host page** (e.g. `https://example.com/Echly_logo_launcher.svg`). So:

- No extension URL is used for the launcher; caching of the extension asset is irrelevant for the current bug.
- Browser/page caching of the host-page URL could cause **intermittent** behavior: e.g. a previously visited page that had that path (or a CDN/cache) might serve something, while most sites 404.

**Multiple asset copies:**

- **echly-extension/assets/Echly_logo_launcher.svg** — extension asset (not in `web_accessible_resources`).
- **public/Echly_logo_launcher.svg** — Next.js public asset (served at `/Echly_logo_launcher.svg` on the web app).

So when the app runs on the **Echly web app** (e.g. localhost:3000), `/Echly_logo_launcher.svg` is valid and the launcher can work. When the same widget runs in the **extension** on an arbitrary site, the same path points to that site’s origin and usually fails. That matches “sometimes works, sometimes broken” (works on Echly origin, broken elsewhere).

---

## 8. Potential Root Causes

| # | Cause | Severity | Notes |
|---|--------|----------|--------|
| 1 | **Launcher img src is document-relative, not extension URL** | **Primary** | CaptureWidget uses `src="/Echly_logo_launcher.svg"`. In the extension (shadow DOM on any host page), this resolves to the **host page origin**. So the image loads only when the host page serves that path (e.g. Echly web app). On other sites it 404s → broken icon. Explains intermittency (works on Echly, fails elsewhere). |
| 2 | **`launcherLogoUrl` is not used as img src** | **Primary** | Content passes `launcherLogoUrl={logoUrl}` (Echly_logo.svg URL). The widget uses it only to decide *whether* to show the launcher. The img src is hardcoded and never set to `launcherLogoUrl` or to a dedicated launcher extension URL. |
| 3 | **Launcher asset missing from `web_accessible_resources`** | **Secondary** | `assets/Echly_logo_launcher.svg` is not listed. Once the img src is fixed to use `chrome.runtime.getURL("assets/Echly_logo_launcher.svg")`, this could still cause failures until the manifest is updated. |
| 4 | **Wrong asset URL passed as `launcherLogoUrl`** | **Secondary** | content.tsx passes `getURL("assets/Echly_logo.svg")` (main logo), not the launcher asset. Design intent was likely a dedicated launcher URL; even if the widget used `launcherLogoUrl` for src, it would show the wrong image until content passes the launcher URL. |
| 5 | **No stub rewrite for launcher SVG** | **Secondary** | `next-image.tsx` only rewrites `Echly_logo.svg`. The launcher uses a raw `<img>` with `Echly_logo_launcher.svg`, so no stub could fix it without code changes. |

---

## Summary

- **Manifest:** `assets/Echly_logo_launcher.svg` is **not** in `web_accessible_resources`; only `assets/Echly_logo.svg` is.
- **Runtime loading:** The launcher is **never** loaded via `chrome.runtime.getURL("assets/Echly_logo_launcher.svg")`. The only getURL for logos is for `Echly_logo.svg`, passed as `launcherLogoUrl` but not used as img src.
- **Widget:** Single mount, no evidence of render-before-extension-ready; launcher visibility depends on `extensionMode` and `launcherLogoUrl`; the **img src is hardcoded** to `"/Echly_logo_launcher.svg"`.
- **Shadow DOM:** Extension styles and assets are compatible with shadow DOM; the launcher fails because the **src** is document-relative and resolves to the host page.
- **CSS:** No rules hide or break the launcher image.
- **Caching:** Intermittency is explained by **which origin** the relative URL resolves to (Echly app vs other sites), not by extension-asset caching.

**Most likely root cause:** The launcher image uses a document-relative `src` that only works when the document is the Echly web app. In the extension, the document is the host page, so the image often 404s. Fix will require using the extension URL for the launcher (e.g. `chrome.runtime.getURL("assets/Echly_logo_launcher.svg")`) — either by passing a dedicated launcher URL from content and using it as img `src`, or by resolving the launcher path in the widget when in extension mode — and adding `assets/Echly_logo_launcher.svg` to `web_accessible_resources`.
