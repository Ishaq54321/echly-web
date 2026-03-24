# Microphone dropdown — full style audit

**Scope:** Styling affecting the portaled microphone list in `VoiceCapturePanel.tsx` (`echly-voice-mic-dropdown`, `echly-mic-item`, etc.).  
**Sources read:** `components/CaptureWidget/VoiceCapturePanel.tsx`, `app/globals.css`, `echly-extension/popup.css`, `public/echly-popup.css` (for selector differences).  
**No code was modified.** This report is based on extracted CSS and markup only.

---

## 1. Component Markup

**File:** `components/CaptureWidget/VoiceCapturePanel.tsx`

### Dropdown portal + container

- Rendered with `createPortal(..., document.body)` when `micPickerOpen && micDevices.length > 0 && micDropdownRect && micDropdownPortalTarget`.
- `micDropdownPortalTarget` is `document.body` in the browser (`typeof document !== "undefined" ? document.body : null`).

### JSX (dropdown only)

```tsx
<div
  ref={micPickerRef}
  className={`echly-voice-mic-dropdown echly-voice-mic-dropdown--${micDropdownRect.placement}`}
  style={{
    position: "fixed",
    top: micDropdownRect.top,
    left: micDropdownRect.left,
    width: micDropdownRect.width,
    maxHeight: micDropdownRect.maxHeight,
    zIndex: 2147483648,
  }}
  role="listbox"
  aria-label="Microphones"
>
  {micDevices.map((d) => {
    const isActive = d.deviceId === voiceMicDeviceId;
    const cleanLabel = formatMicLabel(d.label);
    const micType = getMicType(d.label);
    return (
      <button
        key={d.deviceId}
        type="button"
        role="option"
        aria-selected={isActive}
        aria-label={`${cleanLabel}, ${micType}`}
        className={`echly-mic-item ${isActive ? "is-active" : ""}`}
        onClick={...}
      >
        <div className="echly-mic-text">
          <div className="echly-mic-title">{cleanLabel}</div>
          <div className="echly-mic-sub">{micType}</div>
        </div>
        {isActive && (
          <div className="echly-mic-check" aria-hidden>
            ✓
          </div>
        )}
      </button>
    );
  })}
</div>
```

### Class names (all)

| Element        | Classes |
|----------------|---------|
| Listbox root   | `echly-voice-mic-dropdown`, `echly-voice-mic-dropdown--up` **or** `echly-voice-mic-dropdown--down` (from `micDropdownRect.placement`) |
| Row            | `echly-mic-item`, optional `is-active` |
| Text column    | `echly-mic-text` |
| Primary line   | `echly-mic-title` |
| Secondary line | `echly-mic-sub` |
| Checkmark cell | `echly-mic-check` |

### Inline `style` object (listbox root only)

- `position: "fixed"`
- `top`, `left`, `width`, `maxHeight` — from `micDropdownRect` (viewport measurement)
- `zIndex: 2147483648`

### Other style objects in file (not on dropdown nodes)

- `echly-spinner` in normal body: `style={{ marginRight: 8 }}` — unrelated to dropdown.

---

## 2. Class Styles

### 2.1 Module / co-located CSS

**None.** `VoiceCapturePanel.tsx` imports no `.module.css`; project search found no CSS module tied to this component.

### 2.2 `app/globals.css` — full rules (dropdown-related)

Comments in source preserved.

```css
/* Mic list: portaled to document.body with position:fixed + measured top/left (viewport-safe).
   Equivalent to drop-up: absolute; bottom:100%; margin-bottom:8px on .echly-voice-failure-secondary-wrap,
   without clipping from .echly-capture-card overflow:hidden. */
.echly-voice-mic-dropdown {
  box-sizing: border-box;
  position: fixed;
  pointer-events: auto;
  isolation: isolate;
  padding: 6px;
  border-radius: 16px;
  background: var(--glass-voice-capture-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 240px;
  overflow-y: auto;
  overflow-x: hidden;
  font-family: var(--echly-font);
  text-align: left;
  z-index: 2147483648;
}
.echly-voice-mic-dropdown::-webkit-scrollbar {
  width: 6px;
}
.echly-voice-mic-dropdown::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}
.echly-voice-mic-dropdown::-webkit-scrollbar-track {
  background: transparent;
}
html.dark .echly-voice-mic-dropdown::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.22);
}

.echly-mic-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background 120ms ease;
  font-family: inherit;
  font-size: inherit;
  color: inherit;
  appearance: none;
  -webkit-appearance: none;
}
.echly-mic-item:hover {
  background: rgba(0, 0, 0, 0.04);
}
html.dark .echly-mic-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.echly-mic-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
  text-align: left;
}

.echly-mic-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.echly-mic-sub {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.echly-mic-item.is-active {
  background: rgba(59, 130, 246, 0.1);
}
html.dark .echly-mic-item.is-active {
  background: rgba(59, 130, 246, 0.18);
}

.echly-mic-check {
  margin-left: auto;
  flex-shrink: 0;
  font-size: 12px;
  opacity: 0.6;
  color: var(--text-primary);
}
```

**Placement modifiers:** The component adds `echly-voice-mic-dropdown--up` or `echly-voice-mic-dropdown--down`. A repository-wide search of `*.css` found **no** rules for `.echly-voice-mic-dropdown--up` or `.echly-voice-mic-dropdown--down`. Those classes have **no** effect on computed styles in the current stylesheet.

### 2.3 `echly-extension/popup.css`

The block for `.echly-voice-mic-dropdown` through `.echly-mic-check` is **the same** as in `app/globals.css` at lines **7698–7791** (verified by file read). Scrollbar, hover, and active rules match the globals excerpt above.

### 2.4 `public/echly-popup.css`

Same core rules; **difference:** dark-mode scrollbar and mic-item hover/active add selectors:

- `#echly-root[data-theme="dark"] .echly-voice-mic-dropdown::-webkit-scrollbar-thumb`
- `#echly-root[data-theme="dark"] .echly-mic-item:hover`
- `#echly-root[data-theme="dark"] .echly-mic-item.is-active`

(`html.dark` variants remain in that file as well.) So shipped popup CSS can respond to `#echly-root[data-theme="dark"]` for the dropdown, while `echly-extension/popup.css` as read relies on `html.dark` for those same states (see §7).

---

## 3. Global Interference

### 3.1 `button` (and interactive elements)

**`app/globals.css`**

```css
button,
a,
[role="button"],
.cursor-pointer {
  cursor: pointer;
}

button:disabled,
button[aria-disabled="true"],
.disabled,
[aria-disabled="true"] {
  cursor: not-allowed;
}
```

**Effect on dropdown:** `.echly-mic-item` buttons get `cursor: pointer` from the global rule; component CSS also sets `cursor: pointer` on `.echly-mic-item` — redundant, not conflicting.

### 3.2 Universal border color

```css
*,
*::before,
*::after {
  border-color: hsl(var(--border));
}
```

**Effect:** Sets `border-color` on all elements. Dropdown rows use `border: none` on `.echly-mic-item`, so no visible border from this rule unless overridden.

### 3.3 Universal transitions

```css
* {
  transition-property: background-color, border-color, color, box-shadow, transform, opacity, filter;
  transition-duration: var(--motion-duration-fast);
  transition-timing-function: var(--motion-ease);
}
```

**Effect:** Applies to all elements. `.echly-mic-item` then sets `transition: background 120ms ease`, which **replaces** the universal `transition-*` shorthand for that element (more specific selector + shorthand wins for the button’s transition).

### 3.4 Global scrollbar (`*`)

```css
*::-webkit-scrollbar {
  width: 8px;
}
*::-webkit-scrollbar-track { ... }
*::-webkit-scrollbar-thumb { ... }
```

**Effect:** The dropdown listbox uses **more specific** selectors `.echly-voice-mic-dropdown::-webkit-scrollbar` with `width: 6px`, so the listbox scrollbar width is **6px**, not 8px.

### 3.5 `html, body` (typography baseline)

**`app/globals.css`**

```css
html,
body {
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: var(--env-base);
  color: var(--text-primary);
  font-size: 15px;
  line-height: 1.65;
  font-family: "Plus Jakarta Sans", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

**`echly-extension/popup.css`** (same block at **5546–5558**)

**Effect on portaled nodes:** The dropdown is attached to `body`. It inherits `font-size: 15px` and `line-height: 1.65` unless a closer ancestor sets them. `.echly-voice-mic-dropdown` does **not** set `font-size` or `line-height`. `.echly-mic-title` / `.echly-mic-sub` set `font-size` only on those lines; line-height for those lines is **not** set in the mic rules → inherits **1.65** from `html, body`.

### 3.6 No bare `div {` or `span {` global blocks

Searched `app/globals.css` for top-level `^div\s*\{` / `^span\s*\{` — **none** affecting generic divs/spans globally in the same way as `button` (only class-based rules).

---

## 4. Font System

### 4.1 Definitions found

**`app/globals.css` — first `:root` block (excerpt)**

- `--echly-font` appears in the **second** `:root` block:

```css
:root {
  --echly-font: "Plus Jakarta Sans", "SF Pro Display", Inter, system-ui,
    -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;
  /* ... */
}
```

**`html, body`** use:

- `font-family: "Plus Jakarta Sans", sans-serif;` (narrower stack than `--echly-font`).

**`.echly-voice-mic-dropdown`** uses:

- `font-family: var(--echly-font);` — **full** stack.

**`.echly-capture-card`** (main card, for comparison):

```css
.echly-capture-card {
  /* ... */
  font-family: var(--echly-font);
  /* ... */
}
```

**`#echly-root` (extension `popup.css` 6592–6616)** forces Plus Jakarta stack on the root and `*` **inside** `#echly-root` only — the portaled dropdown is **outside** `#echly-root`, so it does **not** receive those rules.

### 4.2 Same font as rest of extension?

- **Dropdown:** `font-family: var(--echly-font)` on `.echly-voice-mic-dropdown`.
- **Card content** inside `#echly-root`: inherits `#echly-root` font rules (same family stack as `--echly-font` in practice).
- **Body** in popup/app: `"Plus Jakarta Sans", sans-serif` only.

So the dropdown uses the **tokenized** `--echly-font` stack; the page `body` uses a **shorter** stack. Both are Plus Jakarta–first — **not** a random font, but **not** identical string-level declarations between `body` and dropdown.

---

## 5. Color Tokens

### 5.1 Where tokens are defined (excerpt)

**`app/globals.css` — `:root` (light-oriented defaults, lines 97–98, 158–168)**

```css
--text-primary: #0F172A;
--text-secondary: #334155;
/* ... */
--glass-voice-capture-bg: rgba(255, 255, 255, 0.65);
--border-subtle: rgba(0, 0, 0, 0.08);
```

**`html.dark` (lines 175–190)** overrides **some** tokens (including `--glass-voice-capture-bg`, `--border-subtle`) but **does not** list `--text-primary` or `--text-secondary` in that block.

**`#echly-root[data-theme="dark"]` / `[data-theme="light"]` / `:not([data-theme])` (lines 1229–1378)** define `--text-primary`, `--text-secondary`, `--glass-voice-capture-bg`, `--border-subtle` for **descendants of `#echly-root`**.

**`html.dark .echly-capture-card` (lines 2266–2269)** sets:

```css
html.dark .echly-capture-card {
  --text-primary: #f3f4f6;
  --text-secondary: #a1a1aa;
}
```

### 5.2 Use in dropdown rules (verified)

| Token | Used in dropdown-related CSS |
|--------|------------------------------|
| `--glass-voice-capture-bg` | `.echly-voice-mic-dropdown` → `background` |
| `--border-subtle` | `.echly-voice-mic-dropdown` → `border` |
| `--text-primary` | `.echly-mic-title`, `.echly-mic-check` → `color` |
| `--text-secondary` | `.echly-mic-sub` → `color` |
| `--shadow-lg` | `.echly-voice-mic-dropdown` → `box-shadow` |

### 5.3 Portaling vs token scope (critical)

The listbox is a **direct child of `document.body`**, not inside `.echly-capture-card` or `#echly-root`.

- **Variable resolution** for `var(--text-primary)` / `var(--text-secondary)` on the dropdown follows the **inheritance chain** from the element up: `body` → … → `:root`.
- **`#echly-root[data-theme="…"]` variables do not apply** to the portaled listbox, because it is **not** a descendant of `#echly-root`.
- **`html.dark .echly-capture-card { --text-primary: … }` does not apply** to the listbox, because the listbox is **not** inside `.echly-capture-card`.

So for dark UIs that rely on `#echly-root` or on the capture card to supply light text tokens, the dropdown still resolves `--text-primary` / `--text-secondary` from **` :root`** (e.g. in `echly-extension/popup.css` `:root` has `--text-primary: #0F172A` at line **5460**) unless some **ancestor of the dropdown** (e.g. `html.dark` or `body`) redefines those variables. In the extracted `html.dark` blocks in both `globals.css` and `popup.css`, **glass** and **border** tokens are updated for dark mode, but **`--text-primary` / `--text-secondary` are not set on `html.dark`** in those blocks.

**Concrete consequence:** Background/border of the dropdown can track `html.dark` (e.g. `--glass-voice-capture-bg` on `html.dark`), while **text colors** can still use **`:root` light-theme** `--text-primary` / `--text-secondary` — a **documented mismatch risk** between the card (scoped tokens) and the portaled menu (root-level tokens).

---

## 6. Layout System

### 6.1 Dropdown container

From `.echly-voice-mic-dropdown`:

- `padding: 6px`
- `display: flex; flex-direction: column; gap: 2px`
- `text-align: left`
- Inline styles add **fixed** positioning and measured `top` / `left` / `width` / `maxHeight`.

### 6.2 Row (`.echly-mic-item`)

- `display: flex; align-items: center`
- `padding: 10px 12px`
- `width: 100%`

### 6.3 Text column (`.echly-mic-text`)

- `flex: 1; min-width: 0` (enables ellipsis)
- `flex-direction: column`

### 6.4 Main card (comparison) — `app/globals.css`

```css
.echly-capture-card {
  /* ... */
  padding: 24px;
  border-radius: 18px;
  /* ... */
}
.echly-capture-card-content,
.panel-content {
  /* ... */
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 16px;
}
.echly-capture-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}
.echly-capture-instruction {
  font-size: 12px;
  margin: 0;
  color: var(--text-secondary);
}
```

**Comparison**

| Aspect | Main card content | Mic dropdown |
|--------|-------------------|--------------|
| Outer padding | 24px on card | 6px on listbox |
| Section gap | 16px (`panel-content`) | 2px between rows |
| Title size/weight | 14px / 600 | 13px / 500 (`.echly-mic-title`) |
| Secondary text | 12px (instruction) | 11px (`.echly-mic-sub`) |

These differences are **encoded in CSS** — the dropdown is **denser** and uses **lighter** title weight than `.echly-capture-title`.

---

## 7. Style Conflicts

1. **Placement classes are no-ops:** `echly-voice-mic-dropdown--up` / `--down` have **no** CSS rules — only JS positioning matters.
2. **Theme selector split:** `public/echly-popup.css` includes `#echly-root[data-theme="dark"]` for mic scrollbar/hover/active; `echly-extension/popup.css` (mic section) uses **`html.dark` only** for those — behavior differs if theme is on `#echly-root` but `html` lacks `dark` (or the reverse).
3. **Portaled subtree vs widget subtree:** Token scope for `--text-primary` / `--text-secondary` differs between **card** (`.echly-capture-card` / `#echly-root`) and **dropdown** (`body` child) — not a duplicate class issue, but a **cascade / inheritance boundary** issue.
4. **Scrollbar specificity:** Global `*::-webkit-scrollbar { width: 8px }` vs `.echly-voice-mic-dropdown::-webkit-scrollbar { width: 6px }` — dropdown wins for the listbox element.
5. **Transition:** Universal `*` transition vs `.echly-mic-item { transition: background 120ms ease }` — item buttons use the narrower transition.

---

## 8. Computed Styles (simulated cascade)

Simulation assumes **app/extension CSS as authored** — not a browser DevTools dump. “Final” = after matching rules for **light** vs **dark** contexts as declared in stylesheets.

### 8.1 `.echly-voice-mic-dropdown` (container)

| Property | Resolved source (typical) |
|----------|---------------------------|
| `font-family` | `var(--echly-font)` from rule |
| `font-size` | Inherits from `body` → **15px** (no override on container) |
| `line-height` | Inherits from `body` → **1.65** |
| `padding` | **6px** (all sides) |
| `background` | `var(--glass-voice-capture-bg)` — from `html.dark` when dark class on `html`, else `:root` value in each file |
| `color` | Not set on container; children set their own `color` |
| `text-align` | **left** |

### 8.2 `.echly-mic-item` (button row)

| Property | Resolved source |
|----------|-----------------|
| `font-family` | `inherit` → from `.echly-voice-mic-dropdown` → `--echly-font` |
| `font-size` | `inherit` → **15px** from `body` (inherited chain) |
| `line-height` | `normal` for button in UA terms unless inherited — **inherited 1.65** from body applies to the button’s line box context |
| `padding` | **10px 12px** |
| `background` | **transparent** (or active/hover rules when applicable) |
| `color` | `inherit` — inherits `body`’s `color: var(--text-primary)` from **root-level** `--text-primary` unless an ancestor sets `color` |
| `text-align` | **left** |

### 8.3 `.echly-mic-title`

| Property | Resolved source |
|----------|-----------------|
| `font-size` | **13px** |
| `line-height` | Not set → inherits **1.65** from `html, body` |
| `font-weight` | **500** |
| `color` | `var(--text-primary)` (resolved per §5.3) |
| `padding` | **0** (no rule; div default) |

### 8.4 `.echly-mic-sub`

| Property | Resolved source |
|----------|-----------------|
| `font-size` | **11px** |
| `margin-top` | **2px** |
| `color` | `var(--text-secondary)` |

### 8.5 `.echly-mic-check`

| Property | Resolved source |
|----------|-----------------|
| `font-size` | **12px** |
| `opacity` | **0.6** |
| `color` | `var(--text-primary)` |

---

## 9. Visual Issues (why it can look inconsistent)

1. **Token boundary (portaled `body`):** The menu uses the same **variable names** as the card, but **resolve** from `:root` / `html` / `body` — not from `#echly-root` or `.echly-capture-card`. Where those scopes differ (especially **dark** UI), **background** (often tied to `html.dark`) and **text** (still tied to `:root` `--text-primary` / `--text-secondary` in the extracted files) can **diverge** from the card — a **system-level** inconsistency, not a one-off typo.

2. **Typography scale vs card:** `.echly-capture-title` is **14px / 600**; `.echly-mic-title` is **13px / 500** — the dropdown reads **smaller and lighter** than the main failure/voice titles by design in CSS.

3. **Line-height:** Mic lines inherit **1.65** from `html, body`; card titles/instructions use explicit sizes but the global line-height still affects vertical rhythm — rows can feel **taller** than a tight custom menu.

4. **Density:** Listbox `padding: 6px` and `gap: 2px` vs card `padding: 24px` and column `gap: 16px` — the menu is **much tighter** than the card.

5. **Dead modifier classes:** `--up` / `--down` add no styling — any expectation of visual “direction” styling is unmet (not a visual bug by itself, but **noise in the class list**).

6. **Theme hooks:** Relying on `html.dark` for hover/active scrollbar while the widget theme may live on `#echly-root` can produce **wrong hover/active** states in some builds (`public/echly-popup.css` partially mitigates with `#echly-root[data-theme="dark"]`).

---

## 10. Root Causes (code-level, evidenced)

1. **Portal target is `document.body`** (`VoiceCapturePanel.tsx`), so the dropdown **is not** inside `.echly-capture-card` or `#echly-root` — theme variables defined only on those ancestors **do not apply** to the listbox’s variable inheritance for `--text-primary` / `--text-secondary` as used in `.echly-mic-title`, `.echly-mic-sub`, `.echly-mic-check`.

2. **`html.dark` blocks** in `app/globals.css` and `echly-extension/popup.css` **update** `--glass-voice-capture-bg` and `--border-subtle` (among others) but **do not** redefine `--text-primary` / `--text-secondary` on `html` in the extracted snippets — while **` :root`** still defines `--text-primary: #0F172A` and `--text-secondary: #334155` in `popup.css` (**5460–5461**). That combination yields **dark glass variables** and **light-root text tokens** on the same subtree when only `html` is dark-scoped for surface tokens.

3. **`html.dark .echly-capture-card { --text-primary; --text-secondary }`** (**globals.css 2266–2269**) **scopes** light text colors to the card only — the portaled dropdown **cannot** inherit that scope.

4. **Explicit typography mismatch** between `.echly-capture-title` (14px / 600) and `.echly-mic-title` (13px / 500) is **entirely defined in CSS** — the dropdown will not match the card’s title emphasis.

5. **`.echly-voice-mic-dropdown` has no `font-size` or `line-height`**, and **`body` sets `font-size: 15px` and `line-height: 1.65`** — inherited metrics affect the menu’s base rhythm.

6. **`echly-voice-mic-dropdown--up` / `--down` have zero stylesheet rules** — the component applies classes that **do not exist** in CSS.

7. **Duplicate theme selectors** between `echly-extension/popup.css` and `public/echly-popup.css` for mic dark states (`html.dark` vs `#echly-root[data-theme="dark"]`) — **real** behavioral differences depending on which file is loaded and how theme is applied.

---

*End of audit.*
