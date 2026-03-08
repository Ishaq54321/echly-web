# Echly Chrome Extension — Full UI & Architecture Audit

**Purpose:** Complete technical report of the extension’s infrastructure, UI system, and styling so that another AI or designer can redesign the extension UI from scratch without missing implementation details.

**Audit type:** Read-only. No files were modified.

---

## 1. Extension Architecture

### 1.1 Manifest

| Field | Value |
|-------|--------|
| **File** | `echly-extension/manifest.json` |
| **manifest_version** | 3 |
| **name** | Echly |
| **version** | 1.0 |
| **description** | Capture screenshots and submit feedback |

### 1.2 Permissions

- `identity` — OAuth (Google sign-in via `chrome.identity.launchWebAuthFlow`)
- `storage` — `chrome.storage.local` for auth tokens, session state, active session ID
- `activeTab` — capture visible tab
- `tabs` — query/sendMessage to all tabs for global state broadcast

### 1.3 Host permissions

- `<all_urls>` — content script and API calls
- `http://localhost:3000/*` — web app API
- `https://echly-web.vercel.app/*` — production web app
- `https://*.firebaseapp.com/*`, `https://www.gstatic.com/*`, `https://securetoken.googleapis.com/*`, `https://www.googleapis.com/*`, `https://apis.google.com/*` — Firebase / Google auth

### 1.4 Content scripts

- **Matches:** `<all_urls>`
- **Script:** `content.js` (single file)
- **Run at:** `document_idle`

No CSS is injected via manifest; styles are added at runtime inside the shadow root via a link to `popup.css`.

### 1.5 Background

- **Type:** Service worker (MV3)
- **Script:** `background.js` (single file)

Runs in extension context; holds auth state, token refresh, global UI state (visible, expanded, isRecording, sessionId, sessionModeActive, sessionPaused), and handles all message types.

### 1.6 Popup entry

- **HTML:** `echly-extension/popup.html`
- **Styles:** `<link rel="stylesheet" href="popup.css">` plus inline `<style>` for html/body/#root
- **Script:** `<script src="popup.js"></script>`
- **Mount:** `<div id="root"></div>` — React popup app mounts here

Popup is login-only: if authenticated it toggles widget visibility and closes; if not it shows “Continue with Google”.

### 1.7 Injected scripts

- **None** in manifest. The only script injected on pages is the **content script** `content.js`, which runs in the page context but in an isolated world. It does **not** inject additional script tags into the page; it creates a **shadow host** in the page DOM and mounts React inside it.

### 1.8 Web accessible resources

- `popup.css` — used by both popup and by the content script (loaded into shadow root via `chrome.runtime.getURL("popup.css")`)
- `assets/Echly_logo.svg` — used in popup and in content “Sign in from extension” button

### 1.9 Messaging

- **Content ↔ Background:** `chrome.runtime.sendMessage` / `chrome.runtime.onMessage`
- **Background → All tabs:** `chrome.tabs.query` + `chrome.tabs.sendMessage(tabId, { type: "ECHLY_GLOBAL_STATE", state })` on visibility toggle, expand/collapse, session lifecycle, tab activation, tab creation
- **Popup ↔ Background:** same `sendMessage`; popup never talks to content directly
- **Web app → Extension:** When the user is on the dashboard (origin localhost:3000 or echly-web.vercel.app), the **content script** on that page calls `ECHLY_SET_ACTIVE_SESSION` with the session ID from the URL path (`/dashboard/[sessionId]`). No other web-app-to-extension channel is used for UI.

### 1.10 How the extension boots

1. **Background:** Service worker starts when the extension loads. It reads `chrome.storage.local` for `activeSessionId`, `sessionModeActive`, `sessionPaused`, and auth keys (`auth_idToken`, etc.), then populates in-memory state. No UI.
2. **Popup:** When user clicks the extension icon, `popup.html` loads, `popup.js` runs, React mounts in `#root`. Popup requests `ECHLY_GET_AUTH_STATE`; if authenticated it sends `ECHLY_TOGGLE_VISIBILITY` and closes; otherwise it shows the login screen.
3. **Content:** Injected at `document_idle` on every tab. `content.js` runs once:
   - Ensures a single host element `#echly-shadow-host` (created if missing), `position: fixed`, `bottom: 24px`, `right: 24px`, `z-index: 2147483647`, `display: none`.
   - Creates a shadow root on that host, injects a `<link>` to `popup.css` and a minimal reset style block, then creates `#echly-root` with `data-theme` and mounts the React **ContentApp** (which wraps **CaptureWidget**) via `createRoot`.
   - Registers a single `chrome.runtime.onMessage` listener (guarded by `window.__ECHLY_MESSAGE_LISTENER__`) to handle `ECHLY_GLOBAL_STATE`, `ECHLY_FEEDBACK_CREATED`, `ECHLY_TOGGLE`.
   - Requests `ECHLY_GET_GLOBAL_STATE` from background and applies visibility/state; subscribes to `visibilitychange` to re-sync state when tab becomes visible.
   - ContentApp listens for `ECHLY_GLOBAL_STATE` and `ECHLY_TOGGLE_WIDGET` custom events to update React state and host visibility.

---

## 2. Extension Runtime Flow

### 2.1 Entrypoint map

| Entrypoint | Location | What it loads | UI it renders | Lifecycle |
|------------|----------|----------------|---------------|-----------|
| **Background** | `echly-extension/background.js` (built from `echly-extension/src/background.ts`) | No UI. Uses Firebase config, storage, identity. | None | Service worker: starts on load, stays until idle; handles messages and tab events. |
| **Content** | `echly-extension/content.js` (built from `echly-extension/src/content.tsx`) | Resolves `@/` to repo root (e.g. `@/components/CaptureWidget` → `components/CaptureWidget`). Loads React, CaptureWidget, contentAuthFetch, contentScreenshot, ocr, logger. CSS: `popup.css` + inline reset in shadow root. | Shadow host at bottom-right; inside it: ContentApp (Sign-in CTA or CaptureWidget + optional Clarity Assistant overlay). | Runs once per tab at `document_idle`. Single mount; visibility toggled via host `display` and global state. |
| **Popup** | `echly-extension/popup.html` → `popup.js` (from `echly-extension/src/popup.tsx`) | No path alias to CaptureWidget; popup is self-contained. Loader: `.css` → empty (no CSS bundle in JS). | Root div 400px width; Loading… / Closing… / Sign-in screen (logo, title, “Continue with Google”, footer). | Opens when user clicks extension icon; closes after login or after toggling visibility. |
| **Widget (in content)** | Same as Content; widget is `CaptureWidget` inside ContentApp. | Same as content: CaptureWidget and all its children (CaptureHeader, WidgetFooter, FeedbackItem, CaptureLayer, ResumeSessionModal, etc.). | Floating trigger button “Echly” / “Capture feedback”; sidebar panel (header, feedback list, footer with session actions); capture overlays (region, session, voice pill, confirmation). | Rendered inside shadow root. Shown/hidden by host visibility; expanded/collapsed by global state. |
| **Capture overlay** | Rendered by CaptureLayer (React portal into `#echly-capture-root`). | CaptureLayer, RegionCaptureOverlay, SessionOverlay, SessionControlPanel, SessionFeedbackPopup, ConfirmationCard. | Full-page dim, region selection, confirmation bar “Retake” / “Speak feedback”; session tooltip and control bar; feedback popup (screenshot + voice/text); confirmation “I understood” card. | Portal target `#echly-capture-root` is created by useCaptureWidget when widget mounts and is removed on unmount. |
| **Injected** | N/A | No separate injected script. Element highlighter and click capture for session mode are attached by SessionOverlay to the page DOM (event listeners and overlay elements). | Session mode: hover highlight, comment cursor, tooltip “Click to add feedback”, SessionControlPanel, SessionFeedbackPopup. | Tied to session mode lifecycle; cleaned up when SessionOverlay unmounts. |

### 2.2 Full lifecycle (high level)

1. **Browser loads a page** → Content script runs at `document_idle`.
2. **Content script** creates `#echly-shadow-host` (if missing), attaches shadow root, injects `popup.css` + reset, creates `#echly-root` with `data-theme`, mounts ContentApp.
3. **ContentApp** requests `ECHLY_GET_AUTH_STATE` and `ECHLY_GET_GLOBAL_STATE`; if not authenticated shows “Sign in from extension”; else renders CaptureWidget with session/theme/expand/collapse props.
4. **CaptureWidget** creates `#echly-capture-root` in `document.body` (via useCaptureWidget) and portals CaptureLayer into it; renders floating trigger or sidebar panel depending on expanded state and capture flow.
5. **User clicks extension icon** → Popup opens; if already logged in, sends `ECHLY_TOGGLE_VISIBILITY` and closes; background broadcasts `ECHLY_GLOBAL_STATE` to all tabs; content script sets host `display` and dispatches custom event; ContentApp re-renders with visible=true so widget appears.
6. **User expands widget** → Clicks floating “Echly” → content sends `ECHLY_EXPAND_WIDGET` → background sets expanded=true and broadcasts → content shows sidebar panel.
7. **User starts capture** → “Start New Feedback Session” or “Capture feedback” → focus_mode → region_selecting (RegionCaptureOverlay) or session mode (SessionOverlay). Region: user drags → “Speak feedback” → getFullTabImage (CAPTURE_TAB via background) → crop → voice_listening (voice pill) → processing → structure-feedback + feedback API → success (ConfirmationCard or clarity flow).
8. **Feedback stored** → Ticket created in web app; optionally background sends `ECHLY_FEEDBACK_CREATED` to all tabs; content can highlight the new item in the list.

---

## 3. UI Screen Inventory

| Screen name | Where it lives | What triggers it | Components used |
|-------------|----------------|------------------|------------------|
| **Capture UI (sidebar panel)** | `components/CaptureWidget/CaptureWidget.tsx` (panel branch) | `showPanel` true: expanded and not in capture flow and not session mode; or session paused. | CaptureHeader, feedback list (FeedbackItem per pointer), WidgetFooter, echly-sidebar-* classes. |
| **Floating trigger button** | Same file | `showFloatingButton`: not expanded, sidebar mode, not session paused. | Single button with class `echly-floating-trigger`. |
| **Feedback form (voice/text)** | Voice: voice pill (RecordingMicOrb/voice pill UI in useCaptureWidget). Text: SessionFeedbackPopup. | After region capture “Speak feedback” → voice_listening; or in session mode after element click → SessionFeedbackPopup (voice or type). | RecordingMicOrb / echly-voice-pill*, echly-recording-*; SessionFeedbackPopup (screenshot preview, mode choose, voice/text input). |
| **Widget toolbar** | CaptureHeader | Always in sidebar panel. | echly-sidebar-header, echly-sidebar-title, echly-sidebar-summary, theme toggle, close button (X). |
| **Screenshot preview** | SessionFeedbackPopup, ConfirmationCard (optional) | Session mode: after clicking element, popup shows crop. Region mode: no in-widget preview before voice; confirmation card can show after. | SessionFeedbackPopup: img with screenshot; ConfirmationCard: ticket title/description. |
| **Annotation UI** | SessionOverlay: element highlighter + click capture; feedback markers on page | Session mode active, not paused. | elementHighlighter, clickCapture (session/), SessionControlPanel, SessionFeedbackPopup; feedbackMarkers (session/) for markers. |
| **Popup login** | `echly-extension/src/popup.tsx` | Popup opened and not authenticated. | Inline styles; logo img; “Sign in to Echly”; “Continue with Google” button; footer text. |
| **Popup dashboard** | N/A | No dashboard in popup; popup is login-only. | — |
| **Previous feedback viewer** | Feedback list in CaptureWidget | When panel is open and there are pointers. | FeedbackItem list, echly-feedback-list. |
| **Resume session modal** | `components/CaptureWidget/ResumeSessionModal.tsx` | Extension mode: “Open Previous Session” in WidgetFooter opens modal. | Modal overlay; search; filter (today/7/30/all); session list; Cancel. |
| **Clarity assistant (extension)** | Inline in `echly-extension/src/content.tsx` | When structure-feedback returns clarityScore ≤ 20 or needsClarification with no tickets. | Fixed overlay; card “Quick suggestion”; suggested rewrite; textarea; “Edit feedback” / “Submit anyway” / “Done”. |
| **Sign-in CTA (content)** | Same ContentApp in content.tsx | User not authenticated. | Single button “Sign in from extension” + logo. |
| **Loading states** | Popup: “Loading…” / “Closing…”. ResumeSessionModal: “Loading sessions…”. Widget: processing state (voice pill “Processing…”). | Auth check; modal open; after “Speak feedback” before API. | Inline/minimal. |
| **Success states** | ConfirmationCard “I understood” + Confirm/Edit; ticket highlight in list; orb success animation. | After feedback created. | ConfirmationCard (framer-motion); echly-ticket-highlight; echly-confirm-success-pulse. |
| **Error states** | echly-sidebar-error; popup login error; ResumeSessionModal error; clarity/API errors. | API or validation errors. | Text in sidebar; popup paragraph; modal message. |
| **Region capture overlay** | `components/CaptureWidget/RegionCaptureOverlay.tsx` | focus_mode + region_selecting in extension. | Full-screen dim, hint “Drag to capture area”, selection rect, confirmation bar “Retake” / “Speak feedback”. |
| **Session control bar** | `components/CaptureWidget/SessionControlPanel.tsx` | Session mode and not paused. | Fixed top bar “Recording Session” / “Session paused” + Pause/Resume/End. |
| **Focus dim overlay** | CaptureLayer | focus_mode or region_selecting (non-session). | div.echly-focus-overlay (dim + crosshair). |

---

## 4. Component Tree

Recursive structure; all under the content script’s React tree (shadow root).

```
ContentApp (content.tsx)
├── [Unauth] Sign-in button (inline)
├── [Clarity] Clarity assistant overlay (inline JSX)
└── CaptureWidget (components/CaptureWidget/CaptureWidget.tsx)
    ├── ResumeSessionModal (ResumeSessionModal.tsx) [conditional]
    ├── CaptureLayer (CaptureLayer.tsx) [portaled to #echly-capture-root]
    │   ├── SessionOverlay (SessionOverlay.tsx) [when sessionMode]
    │   │   ├── SessionControlPanel (SessionControlPanel.tsx)
    │   │   ├── SessionFeedbackPopup (SessionFeedbackPopup.tsx)
    │   │   └── elementHighlighter / clickCapture (session/elementHighlighter, session/clickCapture)
    │   ├── echly-focus-overlay div [focus_mode or region_selecting]
    │   └── RegionCaptureOverlay (RegionCaptureOverlay.tsx) [extension + region state]
    ├── Floating trigger (echly-floating-trigger-wrapper + button) [showFloatingButton]
    └── Sidebar panel (echly-sidebar-container > echly-sidebar-surface) [showPanel]
        ├── CaptureHeader (CaptureHeader.tsx)
        ├── echly-sidebar-body
        │   ├── echly-feedback-list
        │   │   └── FeedbackItem (FeedbackItem.tsx) × N
        │   ├── echly-sidebar-error [conditional]
        │   └── WidgetFooter (WidgetFooter.tsx) [when idle]
        └── (no other children)
```

**Notes:**

- **CaptureLayer** is rendered via `createPortal(captureContent, captureRoot)` where `captureRoot` is `#echly-capture-root` (created in useCaptureWidget and appended to `document.body`). So overlay UI lives in the **page** document, not in the shadow root; it still uses the same `popup.css` when that CSS is loaded in the shadow root (themes are on `#echly-root`). The capture root is in the light DOM, so its styles depend on the page and on any global styles; in practice the extension loads `popup.css` only into the shadow root, so portaled content may inherit from the page’s styles or from duplicated/imported styles depending on build.
- **Voice pill / recording capsule** UI is rendered inside the **CaptureWidget** tree (from useCaptureWidget), not inside CaptureLayer; the hook returns state and the widget (or a child) renders the pill. Exact component: logic and classes live in the hook and in globals.css (echly-voice-pill, echly-recording-capsule, etc.); the pill can be rendered as part of the sidebar/capture flow in the same React tree.
- **ConfirmationCard** is used after voice submission (in the flow that shows “I understood”); it is a child of whatever renders the post-voice UI (likely in useCaptureWidget’s render path or a component that consumes its state).

**File paths (key):**

- ContentApp: `echly-extension/src/content.tsx`
- CaptureWidget: `components/CaptureWidget/CaptureWidget.tsx`
- CaptureHeader: `components/CaptureWidget/CaptureHeader.tsx`
- WidgetFooter: `components/CaptureWidget/WidgetFooter.tsx`
- FeedbackItem: `components/CaptureWidget/FeedbackItem.tsx`
- CaptureLayer: `components/CaptureWidget/CaptureLayer.tsx`
- RegionCaptureOverlay: `components/CaptureWidget/RegionCaptureOverlay.tsx`
- SessionOverlay: `components/CaptureWidget/SessionOverlay.tsx`
- SessionControlPanel: `components/CaptureWidget/SessionControlPanel.tsx`
- SessionFeedbackPopup: `components/CaptureWidget/SessionFeedbackPopup.tsx`
- ResumeSessionModal: `components/CaptureWidget/ResumeSessionModal.tsx`
- ConfirmationCard: `components/CaptureWidget/ConfirmationCard.tsx`

---

## 5. Global Style System

### 5.1 Sources

- **Main CSS:** `app/globals.css` — Tailwind + design system + all echly-* widget styles. This file is compiled by PostCSS (Tailwind) and **output to `echly-extension/popup.css`** via `npm run build:extension:css` (`npx postcss app/globals.css -o echly-extension/popup.css`). So the extension’s single CSS file is a **processed copy** of globals.css.
- **Popup overrides:** `echly-extension/popup-overrides.css` — exists but **not** referenced in `popup.html`; popup uses only `popup.css` and inline styles in the HTML. So popup-overrides.css is currently unused in the built flow.
- **Extension input (Tailwind):** `echly-extension/input.css` — contains `@import "tailwindcss"` and `@theme` with a few variables; not used by the build script above (build uses `app/globals.css`).
- **Tailwind:** `tailwind.config.ts` (content includes `echly-extension/src/**`), `postcss.config.mjs` (only `@tailwindcss/postcss`). Theme extend: colors (primary, brand, semantic), boxShadow levels, borderRadius card, transitionDuration.

### 5.2 Global font

- **globals.css (base):** `font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;`
- **Widget (#echly-root):** `font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, system-ui, sans-serif;`
- **popup.html inline:** `font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;`

### 5.3 Color variables

- **:root (globals):** `--color-primary`, `--brand-primary`, `--brand-primary-rgb`, surface/background/canvas, semantic (success, skipped, danger), shadow levels, etc.
- **#echly-root[data-theme="dark"] / "light"]:** Full widget token set: `--bg-primary`, `--bg-surface`, `--text-primary`, `--text-secondary`, `--border-subtle`, `--button-primary-bg`, `--shadow-depth`, `--color-accent`, `--color-accent-soft`, `--input-bg`, `--icon-color`, `--icon-hover`, etc. Fallback when no data-theme: same as dark.

### 5.4 Spacing system

- **:root:** `--space-1` (4px) through `--space-10` (40px). Widget uses fixed paddings (e.g. 24px 20px, 18px gap) in classes.

### 5.5 Border radius

- **:root:** `--radius`, `--radius-md` (14px), `--radius-lg` (18px), `--radius-card` (22px), `--radius-xl` (24px), `--radius-pill` (9999px). Widget: sidebar 18px, buttons 999px, cards 12px.

### 5.6 Shadow system

- **:root:** `--shadow-level-1` … `--shadow-level-5`, `--elevation-1`, `--elevation-2`.
- **#echly-root themes:** `--shadow-depth`, `--shadow-strong`, `--shadow-depth-recording` (dark/light variants).

### 5.7 Transitions

- **:root:** `--motion-duration` (200ms), `--motion-ease` (cubic-bezier(0.22, 0.61, 0.36, 1)), `--transition-fast` (160ms).
- **Widget:** `--transition-fast: 160ms cubic-bezier(0.22, 0.61, 0.36, 1)`; many classes use 140ms cubic-bezier(0.2, 0.8, 0.2, 1).

### 5.8 Z-index system

- **Widget host:** `2147483647`. Overlays and capture UI: `2147483647`, `2147483646`, `2147483645`; voice pill: `2147483647`; recording row: `999999`. No single scale; high constants used to sit above page content.

---

## 6. CSS Source Map

| File | What it controls | Who uses it |
|------|-------------------|-------------|
| **app/globals.css** | Full app + widget: Tailwind, design tokens, base styles, env-canvas, surfaces, all `.echly-*` classes (sidebar, feedback list, voice pill, mic orb, confirmation, region overlay, recording capsule, etc.). | Next.js app; and **extension** via compiled copy (see below). |
| **echly-extension/popup.css** | **Compiled output** of `app/globals.css` (PostCSS/Tailwind). One file for both popup and content shadow root. | popup.html (link); content script (link injected into shadow root). |
| **echly-extension/popup-overrides.css** | Popup-specific overrides (#echly-root.echly-popup-root, .echly-popup-*). | **Not linked** in popup.html; effectively unused. |
| **echly-extension/input.css** | Tailwind @theme and :root overrides for extension. | Not used by current build (build uses app/globals.css). |
| **Inline in popup.html** | html/body width 400px, min-height 200px, overflow-x hidden, font, background #F7F7F8, color #1F2937; #root full size. | Popup only. |
| **Inline in content.tsx (SHADOW_RESET)** | :host all initial; #echly-root all initial, box-sizing, font-family; #echly-root * box-sizing. | Shadow root only (injected as `<style id="echly-reset">`). |
| **Inline in SessionControlPanel** | @keyframes echly-inline-spin; spinner span. | SessionControlPanel only. |
| **Inline in components** | Many components use `style={{ ... }}` for layout and colors (e.g. RegionCaptureOverlay, SessionOverlay, SessionControlPanel, SessionFeedbackPopup, ResumeSessionModal, content Clarity card). | Respective components. |

---

## 7. Design Tokens (Structured)

| Category | Token / value | Notes |
|----------|----------------|--------|
| **Colors (brand)** | `--brand-primary: #111827` | Text/buttons |
| | `--color-primary: #1a56db` (globals) | AI blue |
| | `--color-accent: #466EFF` (dark), `#2563EB` (light) | Widget accent |
| | `--color-accent-soft` | Soft highlight |
| **Colors (semantic)** | success `#0d9488` / `#059669`, danger `#b91c1c` / `#DC2626`, warning `#ea580c` / `#EA580C` | Varies by theme |
| **Colors (widget surfaces)** | `--bg-primary`, `--bg-surface`, `--bg-surface-hover` | Theme-dependent |
| **Colors (text)** | `--text-primary`, `--text-secondary` | Theme-dependent |
| **Font families** | ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, Segoe UI, Roboto | Base and widget |
| **Font sizes** | 12px, 13px, 14px, 15px, 18px, 20px | Used in widget/popup |
| **Font weights** | 400, 500, 600 | Body, buttons, titles |
| **Spacing** | 4–40px (--space-1 … --space-10); 8px, 12px, 16px, 18px, 20px, 24px | Gaps and padding |
| **Border radius** | 6px, 8px, 12px, 14px, 18px, 20px, 22px, 999px, 9999px | Buttons, cards, sidebar |
| **Shadows** | level-1 … level-5; --shadow-depth, --shadow-strong | Elevation |
| **Motion** | 120ms, 140ms, 160ms, 200ms, 220ms | Transitions |
| **Easing** | cubic-bezier(0.22, 0.61, 0.36, 1), cubic-bezier(0.2, 0.8, 0.2, 1) | Standard and widget |

---

## 8. UI Width & Layout System

- **Popup:** Inline in popup.html: `width: 400px`, `min-height: 200px`, `overflow-x: hidden`. Inner content in popup.tsx also uses `width: "400px"`, `padding: "24px"`. So the popup is **fixed 400px** wide.
- **Widget sidebar:** `.echly-sidebar-container { width: 480px }`. So the **sidebar panel is 480px** wide. This can feel “too wide” on small windows or when compared to the 400px popup.
- **Floating trigger:** No fixed width; `padding: 10px 20px`, `border-radius: 14px`; “Echly” or “Capture feedback” text.
- **Extension host:** `width: auto`, `height: auto`; position `bottom: 24px`, `right: 24px`.
- **ResumeSessionModal:** `width: min(420px, 100%)`, `maxHeight: 85vh`.
- **SessionFeedbackPopup:** `width: min(380px, 92vw)`.
- **Clarity card (content):** `maxWidth: 420`, `width: "90%"`.
- **Layout:** Flex used for header (space-between), footer buttons (gap 8), feedback list (column gap 18), sidebar body (column, gap 18, max-height 60vh, overflow-y auto). No grid for main widget structure.

**Why the extension might appear “too wide”:**

- Sidebar is 480px with no max-width or responsive clamp, so on narrow viewports it dominates.
- Popup is 400px; consistency with 480px sidebar is partial.
- No shared “max-width” token for extension UI.

---

## 9. State Management

- **No Redux/Zustand.** All UI state is React `useState` / `useRef` in ContentApp and in useCaptureWidget.
- **Global UI state (visibility, expanded, session):** Owned by **background**; persisted in `chrome.storage.local` for activeSessionId, sessionModeActive, sessionPaused. Broadcast to all tabs via `ECHLY_GLOBAL_STATE`. Content script stores it in React state and sets host visibility from it.
- **Auth state:** Background holds tokens and user; content and popup request via `ECHLY_GET_AUTH_STATE` and store in local state.
- **Capture flow state:** In useCaptureWidget: `state` one of idle | focus_mode | region_selecting | voice_listening | processing | success | cancelled | error; plus pillExiting, sessionMode, sessionPaused, sessionFeedbackPending, etc. State transitions driven by handlers (handleAddFeedback → focus_mode → region_selecting → … → voice_listening → processing → success).
- **Session list / pointers:** Stored in widget state (pointers array); loaded from API when session is active or resumed; updated when feedback is created (and optionally on ECHLY_FEEDBACK_CREATED).
- **Theme:** ContentApp holds theme; applied to `#echly-root` via `data-theme` and persisted in `localStorage` key `widget-theme`.

**Example flow:** idle → (Add feedback) → focus_mode → region_selecting → (Speak feedback) → voice_listening → processing → success (ConfirmationCard or clarity) → idle.

---

## 10. Shadow DOM & Injection

- **Shadow host:** One div per page, id `echly-shadow-host`, created by content script if not present. Styles: `position: fixed`, `bottom: 24px`, `right: 24px`, `z-index: 2147483647`, `pointer-events: auto`, `display: none` (toggled by global state).
- **Shadow root:** `host.attachShadow({ mode: "open" })`. Then:
  - `<link id="echly-styles" rel="stylesheet" href="chrome.runtime.getURL('popup.css')">`
  - `<style id="echly-reset">` with SHADOW_RESET (all: initial, box-sizing, font-family)
  - `<div id="echly-root" data-echly-ui="true" data-theme="…">` with inline all/initial, box-sizing, pointer-events, width/height auto. React mounts ContentApp here.
- **No iframe.** All extension UI on the page is either inside this shadow root or in the **light DOM** under `#echly-capture-root` (portal target). So the **capture overlays (region, session bar, feedback popup)** are in the page document, not in the shadow root; they still use class names from the same design system (and would get styles from the page’s stylesheet if the page had one that matches; in practice the extension does not inject popup.css into the page, so portaled content may rely on inline styles and any classes that are duplicated or present in a global scope).
- **Session mode “injection”:** SessionOverlay uses **elementHighlighter** and **clickCapture** from `session/elementHighlighter.ts` and `session/clickCapture.ts`: they attach listeners and create overlay elements in the **page document** (e.g. highlight outline, tooltip). These are not in the shadow root.

---

## 11. Screenshot / Capture System

- **Tab capture:** Content script asks background via `CAPTURE_TAB`; background calls `chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" })` and returns data URL. Used when user confirms region in RegionCaptureOverlay.
- **Hiding overlay for capture:** useCaptureWidget’s `captureTabWithoutOverlay` (or equivalent) temporarily sets `#echly-capture-root` to `display: none` and requests animation frame before calling the capture callback so the overlay is not in the screenshot.
- **Region crop:** RegionCaptureOverlay gets full tab image, then `cropImageToRegion(fullImageDataUrl, region, dpr)` (canvas drawImage of the region, then toDataURL("image/png")).
- **DOM overlays:** Focus/region: echly-focus-overlay (dim); RegionCaptureOverlay (dim, selection rect, box-shadow cutout, confirmation bar). Session: SessionOverlay attaches element highlighter and click capture; SessionControlPanel fixed top; SessionFeedbackPopup fixed center.
- **Annotation canvas:** No dedicated canvas for drawing annotations; “annotation” here is session-mode **element selection** (click to add feedback on that element) and optional **feedback markers** (session/feedbackMarkers) on the page.
- **Highlight tools:** elementHighlighter draws a highlight around hovered element; clickCapture fires on click and passes element to handler (crop around element, then show SessionFeedbackPopup).
- **Comment placement:** Session mode: click on element → crop around that element (session/cropAroundElement.ts) → show feedback popup with that screenshot; feedback is stored with context (domPath, etc.). No free-form “comment pin” on coordinates; it’s element-based.

**Pipeline (region capture):** User drags → releasedRect set → “Speak feedback” → getFullTabImage (CAPTURE_TAB) → cropImageToRegion → buildCaptureContext (center point, elementsFromPoint, domPath, etc.) → onAddVoice(cropped, context) → voice_listening (voice pill) → transcript → structure-feedback + feedback API → upload screenshot (ECHLY_UPLOAD_SCREENSHOT) → PATCH ticket with screenshotUrl.

---

## 12. Message Passing

| Sender | Message type | Payload / response | Receiver |
|--------|--------------|--------------------|----------|
| Popup | ECHLY_GET_AUTH_STATE | — | Background → { authenticated, user } |
| Popup | ECHLY_START_LOGIN (or ECHLY_SIGN_IN, LOGIN) | — | Background → Google OAuth → { success, user } or { success: false, error } |
| Popup | ECHLY_TOGGLE_VISIBILITY | — | Background → toggles visible, broadcasts ECHLY_GLOBAL_STATE |
| Content | ECHLY_GET_GLOBAL_STATE | — | Background → { state } |
| Content | ECHLY_GET_AUTH_STATE | — | Background → { authenticated, user } |
| Content | ECHLY_SET_ACTIVE_SESSION | sessionId | Background → sets activeSessionId, persists, broadcasts |
| Content | ECHLY_GET_ACTIVE_SESSION | — | Background → { sessionId } |
| Content | ECHLY_EXPAND_WIDGET | — | Background → expanded=true, broadcast |
| Content | ECHLY_COLLAPSE_WIDGET | — | Background → expanded=false, broadcast |
| Content | ECHLY_OPEN_POPUP | — | Background → chrome.tabs.create(popup) |
| Content | START_RECORDING | — | Background → isRecording=true, broadcast (requires activeSessionId) |
| Content | STOP_RECORDING | — | Background → isRecording=false, broadcast |
| Content | CAPTURE_TAB | — | Background → captureVisibleTab → { success, screenshot } |
| Content | ECHLY_UPLOAD_SCREENSHOT | imageDataUrl, sessionId, screenshotId | Background → POST /api/upload-screenshot → { url } or { error } |
| Content | ECHLY_PROCESS_FEEDBACK | payload: transcript, screenshotUrl, screenshotId, sessionId, context | Background → structure-feedback + feedback API → { success, ticket } or { success: false, error }; on success can broadcast ECHLY_FEEDBACK_CREATED |
| Content | ECHLY_SESSION_MODE_START / PAUSE / RESUME / END | — | Background → updates session state, persists, broadcasts |
| Background | ECHLY_GLOBAL_STATE | state | All tabs (content) |
| Background | ECHLY_FEEDBACK_CREATED | ticket, sessionId | All tabs (content) |
| (Internal) | ECHLY_TOGGLE | — | Content converts to custom event ECHLY_TOGGLE_WIDGET |

**Web app:** Content script on dashboard origin reads pathname and sends `ECHLY_SET_ACTIVE_SESSION` with sessionId. No other message types from web app.

---

## 13. Performance Observations

- **Large bundles:** content.js and popup.js are single bundles (esbuild, minified). content.js includes React, CaptureWidget tree, contentAuthFetch, contentScreenshot, ocr (Tesseract), logger, etc., so it is relatively large; popup.js is small (React + popup UI only).
- **Duplicate CSS:** One globals.css is compiled to popup.css; the same file is loaded in popup and in the shadow root. No duplication of CSS file, but the shadow root and the portal target (#echly-capture-root) are in different trees—portaled content is in the page document and does not inherit shadow styles; if no separate injection of the same CSS into the page, portaled nodes may lack some styles or depend on inline styles.
- **Multiple renders:** useCaptureWidget has many state variables; any of them changing can re-render the widget. No memoization strategy called out; list rendering (FeedbackItem × N) is straightforward.
- **Heavy DOM overlays:** Full-page dim and overlay divs, fixed panels, and session highlighter/click capture add many nodes and listeners; visibility change and capture flow add/remove overlay DOM.
- **Tesseract (OCR):** getVisibleTextFromScreenshot used for context; loaded in content bundle; can be heavy on first use.
- **No code-splitting** in the extension build; content and popup are each one bundle.

---

## 14. File Structure Map

```
echly/
├── app/                    # Next.js app (pages, layout, globals.css)
│   └── globals.css         # Source for extension popup.css
├── components/
│   └── CaptureWidget/      # Shared widget (app + extension)
│       ├── index.tsx
│       ├── CaptureWidget.tsx
│       ├── CaptureHeader.tsx
│       ├── CaptureLayer.tsx
│       ├── RegionCaptureOverlay.tsx
│       ├── SessionOverlay.tsx
│       ├── SessionControlPanel.tsx
│       ├── SessionFeedbackPopup.tsx
│       ├── ResumeSessionModal.tsx
│       ├── ConfirmationCard.tsx
│       ├── WidgetFooter.tsx
│       ├── FeedbackItem.tsx
│       ├── types.ts
│       ├── hooks/
│       │   └── useCaptureWidget.ts
│       └── session/
│           ├── cropAroundElement.ts
│           ├── elementHighlighter.ts
│           ├── clickCapture.ts
│           ├── feedbackMarkers.ts
│           └── sessionMode.ts
├── echly-extension/
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js             # Built from src/popup.tsx
│   ├── popup.css            # Built from app/globals.css
│   ├── popup-overrides.css  # Unused in current flow
│   ├── background.js        # Built from src/background.ts
│   ├── content.js           # Built from src/content.tsx
│   ├── input.css            # Not used by build
│   ├── assets/
│   │   └── Echly_logo.svg
│   └── src/
│       ├── popup.tsx
│       ├── content.tsx
│       ├── background.ts
│       ├── auth.ts
│       ├── api.ts
│       ├── firebase.ts
│       ├── contentAuthFetch.ts
│       ├── contentScreenshot.ts
│       ├── screenshotUpload.ts
│       ├── ocr.ts
│       └── stubs/
│           └── next-image.tsx
├── esbuild-extension.mjs   # Builds popup.js, content.js, background.js
├── tailwind.config.ts
├── postcss.config.mjs
└── docs/
    └── extension-ui-full-audit.md (this file)
```

**What each folder controls:**

- **app/** — Next.js app and **single source of global + widget CSS** (globals.css → extension popup.css).
- **components/CaptureWidget/** — All capture/session/feedback UI used by both the web app and the extension content script.
- **echly-extension/** — Extension-only: manifest, built JS/CSS, assets, and source (popup, content, background, auth, API, screenshot, OCR). No separate “widget” copy; widget is shared from components/.
- **Build:** `npm run build:extension` runs build:extension:css (PostCSS globals.css → popup.css) and build:extension:js (esbuild-extension.mjs → popup.js, content.js, background.js).

---

## 15. UI Problems Observed

- **Inconsistent widths:** Popup 400px, sidebar 480px, modals 420px/380px with no shared token; sidebar can feel too wide on small screens.
- **Inconsistent fonts:** Slight differences between popup (ui-sans-serif, system-ui…), widget (#echly-root: … Inter, system-ui), and base (SF Pro Text, SF Pro Display). All are system stacks but not identical.
- **Layout:** Sidebar has fixed width 480px and no max-width or responsive behavior; floating trigger position (bottom/right 24px) is fixed. ResumeSessionModal and SessionFeedbackPopup use min(…, 100%) or vw; sidebar does not.
- **Overly wide containers:** .echly-sidebar-container at 480px is the main culprit for “extension too wide” on narrow viewports.
- **Duplicated styling:** Many inline `style={{}}` in RegionCaptureOverlay, SessionOverlay, SessionControlPanel, SessionFeedbackPopup, ResumeSessionModal, and content.tsx Clarity card instead of shared classes or tokens; colors and spacing repeated (e.g. rgba(20,22,28,0.95), 12px/16px radius).
- **Unused CSS:** popup-overrides.css is not linked; input.css in extension is not used by the build.
- **Portal vs shadow root:** Capture overlays render in #echly-capture-root (light DOM); they may not get the same theme/CSS as the shadow root unless the page or a separate injection provides the same styles.
- **Clarity assistant:** Implemented as a large inline JSX block in content.tsx with its own styles; could be a separate component and use design tokens.
- **Messy component structure:** ContentApp mixes auth, clarity state, and full CaptureWidget in one file; some modals (ResumeSessionModal) use inline styles only, others (e.g. ConfirmationCard) use echly-* classes. Mix of class-based and inline styling across the widget and extension.

---

**End of audit.** This document is intended to give a designer or AI system everything needed to redesign the extension UI without reading the entire codebase.
