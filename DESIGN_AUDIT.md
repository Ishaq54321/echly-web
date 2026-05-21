# Annote — Code-Grounded Design Audit

**Scope:** Sections 1, 2, 3, 4, 5, 6, 8, 10 of the requested audit. Section 7 (capture flow) and Section 9 (idealized Annote) require visual materials and are deferred to a Claude Design session. See `audit-gaps.md` for what's missing.

**Sources:** [styles/tokens.css](styles/tokens.css), [app/globals.css](app/globals.css) (11,292 lines), [app/onboarding/onboarding.css](app/onboarding/onboarding.css), [annote-extension/extension-globals.css](annote-extension/extension-globals.css), [annote-extension/popup.css](annote-extension/popup.css), [annote-extension/extension-fonts.css](annote-extension/extension-fonts.css), [tailwind.config.ts](tailwind.config.ts), every file in [components/ui/](components/ui/), [components/CaptureWidget/](components/CaptureWidget/), [components/dashboard/](components/dashboard/), [components/session/](components/session/), [components/tickets/](components/tickets/), [components/layout/](components/layout/), [components/share/](components/share/), and the relevant `app/(app)/*` pages.

---

## Section 1 — Visual Identity Snapshot

Annote reads as a **calm, editorial productivity tool with a quiet AI-native streak**. The palette is warm-neutral (page `#FAF9F7`, cards `#FAFAFA`, body text `#54495F`) anchored by a single confident accent — purple-indigo `#5A49BF` — used for primary actions, selection states, and brand moments rather than splattered across the UI. Rounded forms dominate (button radius `20px`, modals `22px`, pills `9999px`) and shadows are deliberately soft (`0 1px 3px rgba(0,0,0,0.06)` for resting cards). The dashboard skews **Linear-meets-Notion**: a thin left rail, large breathing content cards on a warm canvas, a typographic hierarchy that stays inside `15–24px` for most surfaces, and one large display size (`44px`) reserved for marketing/onboarding rather than the app. The session/ticket view sits closer to **Linear** specifically — sticky header, list-of-tickets-plus-detail, status badges that lean monochrome rather than candy-colored.

The extension is a different aesthetic register: **dark frosted-glass overlays** (`rgba(20,22,28,0.92)` + `blur(20px)`) hovering over the page, a red-orange voice orb (`#FF4D4F` → `#D9363E` gradient) that breathes when idle, and a fully-rounded "session control" pill at the bottom of the screen. This is the **Loom / Granola / Arc Boost** lineage — premium glass, generous motion, signature recording state. The intentional split is "calm chrome for the dashboard, cinematic chrome for the in-page moments."

What feels considered: the token layer is thorough (~200 variables, deliberate legacy alias block for migration), motion durations cluster tightly around `120ms / 200ms / 220ms` with one signature curve `cubic-bezier(0.16, 1, 0.3, 1)`, the four-tier text palette (#15101F / #54495F / #8A8096 / #B5AEBE) is enforced via tokens. What feels rough: the extension uses a different font (Plus Jakarta Sans) than the dashboard (DM Sans), the recording orb's red palette is hard-coded outside the token system, three or four "primary button" patterns coexist, and the radius scale is mixed across surfaces (extension uses `14px`/`16px` cards, dashboard uses `22px` modals + `20px` buttons + `14px` content card). The system reads as ~85% canonical and ~15% in-flight.

---

## Section 2 — Color System

### Brand

| Token | Hex | Where it appears |
|---|---|---|
| `--brand` | `#5A49BF` | Primary CTAs, active nav, focus rings, recording mode brand button, AI accent |
| `--brand-hover` | `#4A3BA0` | Hover for brand-filled buttons |
| `--brand-secondary` | `#7B6ACC` | Brand-light moments, mid-tier emphasis |
| `--brand-subtle` | `#F0ECFB` | Active row background, info badge bg, AI subtle pill |
| `--brand-muted` | `#DCD5F0` | Borders for brand-subtle surfaces, "+N more" pills |
| `--brand-text` | `#3D2F73` | Text/icon on brand-subtle surfaces |

Extended brand scale (legacy aliases, ramped 50→700): `#F7F5FD`, `#F0ECFB`, `#DCD5F0`, `#9B8FD6`, `#7B6ACC`, `#5A49BF`, `#4A3BA0`, `#2C1F52`.

Brand RGB triplet is exported as `--brand-rgb: 90, 73, 191;` so `rgba(var(--brand-rgb), 0.18)` overlays stay synchronized.

### Text (four-tier neutrals — canonical)

| Token | Hex | Role |
|---|---|---|
| `--text-heading` | `#15101F` | Primary text, headings, ticket titles, button labels on light bg |
| `--text-body` / `--text-secondary` | `#54495F` | Body copy, secondary labels, nav labels |
| `--text-tertiary` | `#8A8096` | Meta, timestamps, icon default color |
| `--text-placeholder` | `#B5AEBE` | Input placeholders, disabled-ish text |
| `--text-on-dark` | `#F3F4F6` | Text on dark overlays (extension) |

### Surfaces

| Token | Hex | Role |
|---|---|---|
| `--surface` | `#FFFFFF` | Pure white (rare — modals, inputs after focus) |
| `--surface-page` | `#FAF9F7` | Warm app/canvas background |
| `--surface-card` | `#FAFAFA` | Card backgrounds, modal panels, rail bg |
| `--surface-subtle` | `#F5F5F5` | Subtle inset surfaces, default badge bg |
| `--surface-hover` | `#FAFAF7` | Universal hover wash |
| `--surface-active` | `#F0ECFB` | Selected row background (= `--brand-subtle`) |
| `--surface-input` | `#FAFAFA` | Input field bg (= `--surface-card`) |
| `--surface-overlay` | `rgba(15,15,20,0.45)` | Modal scrim |

There is a notable distinction between `--surface-page` (`#FAF9F7`, warm) and `--surface-card` (`#FAFAFA`, neutral). The 1-point hue shift gives cards a slightly cooler feel against the warm canvas — intentional and tasteful, but unusual enough to call out.

### Borders

`--border: #E5E7EB`, `--border-strong: #D5D5D5`, `--border-focus: #5A49BF` (= brand). Two "warm border" tokens — `--hair: #E7E5E4` and `--hair-strong: #D6D3D1` — are scoped to the session page specifically. The hair tokens are a hue-warm shift of the standard borders; they appear in `Tag` (default variant) and `HexCode`.

### Semantic

| Family | Solid | Bg | Border | Text |
|---|---|---|---|---|
| Success | `#18794E` | `#E9F9EE` | `#A7F3D0` | `#18794E` |
| Danger | `#E5484D` | `#FEF2F2` | `#FECACA` | `#E5484D` |
| Warning | `#F77E2C` | `#FFEDD5` | `#FED7AA` | `#9B573E` (text), dot `#FFC53D` |
| Info | `#3D2F73` | `#F0ECFB` | `#DCD5F0` | (uses brand-text) |
| Insight | `#6049E7` | `#F0F1FF` | `#C4B5FD` | `#6049E7` |

"Insight" (`#6049E7`) is a separate purple from brand — slightly brighter, used for AI/discovery moments. This is a deliberate split: brand purple for actions, insight purple for AI-derived data.

### Avatar fallback palette (deterministic per user)

`#E8835D` warm-orange, `#5B7BD3` blue, `#6049E7` purple, `#4A8B6F` green, `#B47BC7` pink, `#D4A843` gold, `#5EA3C8` teal, `#E5E5E5` neutral-grey (anonymous-only).

### Dark overlay tokens (extension popovers / voice UI)

Centralized in tokens.css so dashboard and extension stay in sync:

- `--overlay-dark-bg: rgba(26, 26, 26, 0.92)`
- `--overlay-dark-bg-strong: rgba(26, 26, 26, 0.95)`
- `--overlay-dark-border: rgba(255, 255, 255, 0.08)`
- `--overlay-dark-text: #FFFFFF`, `--overlay-dark-text-muted: rgba(255, 255, 255, 0.60)`
- `--overlay-dark-shadow: 0 20px 40px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3)`

### Glass tokens (extension surfaces only — light-only, dark mode was removed pre-launch)

- `--glass-surface: rgba(252, 251, 249, 0.86)`
- `--glass-surface-elevated: rgba(254, 253, 251, 0.92)`
- `--glass-blur: blur(28px) saturate(140%)` / `--glass-blur-strong: blur(24px) saturate(140%)`
- `--glass-border: rgba(28, 25, 23, 0.08)` / `--glass-border-strong: rgba(28, 25, 23, 0.12)`
- `--glass-edge-highlight: rgba(255, 255, 255, 0.4)`
- `--glass-shadow-stack: 0 5px 15px rgba(28,25,23,0.05), 0 1px 4px rgba(28,25,23,0.035)`

### AI streaming tokens

`--ai-dim-text: rgba(26,26,26,0.30)`, `--ai-dim-code-bg: rgba(0,0,0,0.03)`, `--ai-cursor-bg: #1A1A1A`, `--ai-cursor-text: #FFFFFF`. Used by the description editor's "Improve with AI" streaming state.

### Hard-coded colors that bypass tokens (debt)

- **Recording orb gradient:** `linear-gradient(135deg, #FF4D4F, #D9363E)` (mic orb, recording capsule, voice button)
- **Voice recording button:** `linear-gradient(135deg, #FF553D, #FF6A3D)`
- **Status indicators (session control bar):** `#34C29A` live dot, `#FBBF24` paused dot, `#5B7CFF` saving spinner
- **Negative/positive sentiment rings (voice orb):** `rgba(220, 38, 38, 0.15)` / `rgba(37, 99, 235, 0.15)`
- **Upgrade modal accent:** `linear-gradient(135deg, #F59E0B 0%, #D97706 100%)`
- **Selection background (page selection):** `rgba(51, 144, 255, 0.3)` — a third blue not in the palette
- **MinimalLoader spinner top color:** `#5A49BF` hex literal (should be `var(--brand)`)
- **ProgressPie:** stroke hard-codes `#5A49BF`

### Gradients

Gradients are rare and mostly extension-only: the red recording orb, the orange upgrade banner, and one in the public viewer banner (`linear-gradient(135deg, var(--brand-subtle) 0%, var(--brand-muted) 100%)` for the lock icon background — this one *is* token-based). The dashboard itself is almost entirely flat fills.

### Opacity / backdrop-blur

Glassmorphism is concentrated in the extension. Standard pattern: `background: rgba(252, 251, 249, 0.86); backdrop-filter: blur(28px) saturate(140%);`. The extension launcher uses the strongest blur (`30px saturate(1.4)`). The dashboard uses backdrop-blur in exactly one place: the modal overlay (`backdrop-filter: blur(4px)` on `.echly-modal-overlay`).

---

## Section 3 — Typography System

### Font families

- **Dashboard (web app):** `--font-sans: 'DM Sans', sans-serif`
- **Extension popup + in-page UI:** `Plus Jakarta Sans` (loaded via [annote-extension/extension-fonts.css](annote-extension/extension-fonts.css), weights 400/500/600/700)

The two surfaces use different fonts. This is a real inconsistency — flagged again in Section 8.

### Size scale (canonical, from tokens.css)

| Token | Value | Typical use |
|---|---|---|
| `--text-xs` | `12px` | Eyebrow labels, badges, tertiary meta, status pills |
| `--text-sm` | `14px` | Button labels, body in dense UI, nav labels, inputs |
| `--text-base` | `15px` | Default body (html font-size also `15px`), nav items, session row title |
| `--text-md` | `16px` | Subheadings, modal body |
| `--text-lg` | `20px` | Section headings |
| `--text-xl` | `24px` | Session title (`text-2xl` in Tailwind = 24px) |
| `--text-2xl` | `28px` | Dashboard greeting `md:` size |
| `--text-3xl` | `32px` | Large page headings |
| `--text-display` | `44px` | Marketing/onboarding hero |

The base `html { font-size: 15px; }` is unusual (most apps default to `16px`). It signals an editorial leaning — text feels slightly tighter and more "writing-tool" than "enterprise dashboard."

### Weight scale

| Token | Value | Use |
|---|---|---|
| `--weight-normal` | `400` | Body |
| `--weight-medium` | `500` | Nav labels, secondary CTAs, badges |
| `--weight-semibold` | `600` | Primary button labels, dashboard greeting, modal titles |
| `--weight-bold` | `700` | Page titles, brand wordmark, eyebrow emphasis |

### Per-size pairings observed in code

| Size | Weight | Line-height | Where |
|---|---|---|---|
| 11.5px | 500 (medium) | tight | "1 of 12" position badge, status badge in `FeedbackHeader` (custom outside scale) |
| 12px (`xs`) | 500 | 1.4 | Badges (`.echly-badge`), workspace label pill |
| 13px | 500–600 | 1.5 | Activity row meta, tooltip text, top-bar share button (`13px 600`), nav item meta |
| 14px (`sm`) | 500–600 | normal | Button labels (`14px 600`), most inputs, dropdown items, secondary CTAs |
| 15px (`base`) | 400–500 | 1.5–1.6 | Session row title, body copy, nav items |
| 16px | 500 | normal | Section subheads, modal body |
| 18px | 500 | normal | Status overlay title |
| 20px (`lg`) | 500–600 | tight | Section heads, in-card titles |
| 22px | 700 | tight | Wordmark ("Annote" logo) |
| 24px (`xl`, Tailwind `text-2xl`) | 600 (semibold) | `leading-snug` | Session page H1 |
| 28px (`2xl`) | 700 | -0.02em tracking | Dashboard greeting at `md:` |
| 32px (`3xl`) | 700 | tight | Large page heads (rare in-app) |
| 44px (`display`) | 700 | tight | Onboarding hero only |

### Letter-spacing

Used sparingly and consistently for tightening larger text:
- Dashboard greeting H1: `tracking-[-0.02em]`
- Session header H1 / activity title: `-0.02em`
- Button labels (top bar share): `-0.005em`
- Badge text in feedback header: `-0.005em`

No widened letter-spacing for uppercase labels — Annote does **not** use uppercase eyebrows. Labels are mixed-case medium-weight at 12–13px instead. This is a deliberate aesthetic choice; combined with the lack of icon-heavy navigation, it gives the app its editorial feel.

### Line-heights

`--line-height-tight: 1.25`, `--line-height-normal: 1.5`, `--line-height-relaxed: 1.625`. Body uses `1.6`. Activity feed rows use `1.55`.

### Hierarchy assessment

Restraint is good — the actual *in-app* hierarchy is roughly 5 sizes: 12 / 14 / 15 / 20 / 24. Outliers (11.5, 13, 18, 22, 28, 32, 44) exist but each has a clearly bounded use case. No 10+ size typographic chaos. The dashboard greeting being `text-xl md:text-2xl` (22→28px, bold) makes it the largest in-app text by a comfortable margin and gives the dashboard a strong opening note.

### Custom treatments

- **AI streaming cursor:** dimmed text (`rgba(26,26,26,0.30)`) with a 1-char inverted block cursor (`bg: #1A1A1A`, `color: #FFFFFF`) at the streaming position. Used in the description editor.
- **Hex code inline tags:** monospace 13px, gray bg, colored swatch on the left — see [HexCode.tsx](components/ui/HexCode.tsx).
- **Tabular numerals on counts:** the session row open/resolved counts and the "N of M" badges use `tabular-nums` (CSS `font-variant-numeric: tabular-nums`).

---

## Section 4 — Spacing & Layout System

### Base unit

Mixed — the spacing scale uses **a 4px base with non-standard jumps**:

```
--sp-1: 4px  --sp-2: 8px  --sp-3: 12px  --sp-4: 18px
--sp-5: 24px --sp-6: 28px --sp-8: 36px  --sp-10: 48px
--sp-12: 56px --sp-16: 72px
```

Note `--sp-4: 18px` and `--sp-6: 28px` — these are **not** multiples of 8. The scale is `4 / 8 / 12 / 18 / 24 / 28 / 36 / 48 / 56 / 72`. This is closer to an "irregular Linear-ish" rhythm than a pure 8pt grid. Tailwind defaults (`p-1` = 4px through `p-12` = 48px) coexist alongside these — most components use Tailwind classes, while the token scale is used in the extension and onboarding CSS.

### Common spacing observed

- Page horizontal padding: `--page-px: 24px` (also `px-4 md:px-6 md:pt-10` on the dashboard page)
- Card padding: `var(--sp-5)` = 24px for `.echly-card`; `p-4 md:p-5` (16/20px) for grid workspace cards
- Section gaps: `space-y-3` (12px) between session rows, `gap-3 md:gap-10` for tab navs
- Modal panel padding: typically `24px` interior
- Button horizontal padding: `px-4` (16px) standard, `px-3.5` (14px) for small variants
- Input horizontal padding: `0 12px` (`.echly-input`), `0 18px` for large variant
- Badge padding: `1px 7px` (md), `1px 5px` (sm) — pixel-precise, not on the scale

### Corner radius scale

```
--radius-xs:  6px
--radius-sm:  9px       ← inputs, default surfaces
--radius-md:  12px      ← popovers, dropdowns
--radius-lg:  16px      ← cards, modals (smaller), dropdown menus
--radius-xl:  22px      ← modal panels (large)
--radius-pill: 9999px   ← avatars, badges, status pills
--radius-btn: 20px      ← all primary/secondary buttons
--content-card-radius: 14px  ← main app content card
```

Several radii appear that aren't in the scale:
- `14px` (`--content-card-radius`, also extension confirmation card, voice popup)
- `10px` (extension public viewer banner sign-in button, lock icon background)
- `7px` (`FeedbackHeader` action buttons — `rounded-[7px]`)
- `2px` (HexCode swatch)
- `4px` (element selection highlight overlay)

The dashboard content card uses 14px, the extension cards use 14px, the modals use 16–22px, the buttons use 20px. The system has a *canonical scale* but also a *lived scale* that drifts a few px in places.

### Container widths

| Constant | Value | Use |
|---|---|---|
| `--page-max-w` / `--content-max-width` | `1280px` | Dashboard, activity, settings centered max-width |
| `--rail-width` / `--rail-expanded` | `220px` | Global rail (expanded) |
| `--rail-collapsed` | `64px` | Global rail (collapsed) |
| `--topbar-height` | `60px` | Top bar (declared but session pages use 72px) |
| Modal max-w | `calc(100vw - 2rem)` | Universal modal |
| Bulk-actions bar | `min(100vw-2rem, 600px)`, min `420px` (desktop) | Dashboard multi-select |
| Share modal preview | varies | per-modal |

### Layout patterns

- **App shell:** sticky 220/64px rail + content card with `border-radius: 14px` and `box-shadow: var(--shadow-panel)` sitting on a warm canvas. A 14px gap between rail and content card.
- **Dashboard:** centered max-1280 column, header → tabs+controls → list/grid → optional "Shared with me" section.
- **Activity:** centered max-1280 column, header → filter tabs + scope dropdowns → day-bucketed event rows.
- **Settings:** centered max-1280 column (min 900px) with a top tab nav (My account / Workspace / Security / Billing) underlined with a 3px brand bar.
- **Session detail:** sticky top header → multi-zone layout (`FourZoneLayout`) — ticket list (left), feedback detail (center), comments/activity (right). Mobile collapses via `SessionMobileTabs`.
- **Extension in-page UI:** floating elements positioned at fixed coordinates (`bottom: 32px` for the session control pill, `bottom-right` for the floating button, center for confirmation card), each with extreme z-indices (`2147483646–7`).

### Z-index strategy

Tokenized at the dashboard layer:
```
--z-base: 1; --z-sticky: 20; --z-dropdown: 100;
--z-tooltip: 200; --z-modal: 300; --z-toast: 400;
```

The extension overrides this entirely — it has to live above arbitrary host-page content, so it uses `2147483645–7` (the max signed-32-bit int range). Dashboard portals also use ad-hoc values for some popovers (e.g., `MODAL_LAYER_Z_INDEX + 100` for tooltips).

---

## Section 5 — Component Inventory

### Buttons

The codebase contains **at least four "primary button" patterns** that should converge but currently don't:

1. **`Button.tsx` variant=`primary`** (canonical) — `h-11 md:h-[38px]`, `px-4`, `rounded-[var(--radius-btn)]` (20px), `background: var(--text-heading)` (`#15101F`), `color: #FFFFFF`, `14px 600 weight`, hover `opacity: 0.85`. **Note:** uses near-black, NOT brand purple, as the fill.

2. **`.primary-btn` CSS utility class** (globals.css line 1144) — same recipe as above, lives as a class. Used by some inline buttons.

3. **`.echly-input` + brand-filled buttons** like the dashboard "New Session" — `h-11 md:h-[38px]`, `px-4`, `bg-[var(--brand)]`, `rounded-[var(--radius-btn)]`. **Uses brand purple as fill.**

4. **Inline-styled "Save" button** (settings workspace, share modal) — `bg-[var(--brand)] text-white`, varying heights `38–42px`, `border-radius 10–20px`.

So the "primary button" in `Button.tsx` is `#15101F` filled, but the actual highest-emphasis CTAs in the app (New Session, Sign in, Invite, Resolve) are brand-purple. The dark-fill button is used more for secondary contexts (Save & Close in modal footers, etc.).

**Secondary** (`Button.tsx`): transparent bg, `1px var(--border)`, `var(--text-heading)` text, hover `bg-var(--surface-hover)`. **Ghost**: transparent, `var(--text-secondary)` text, hover bg `var(--surface-hover)`. **Danger**: same chassis as secondary but hover flips text+border+bg to danger colors (`#E5484D`/`#FEF2F2`).

**Icon-only buttons** — `.icon-btn` is 42×42, `border-radius: var(--radius-btn)` (20px), transparent bg, icon 18×18. Used in toolbars. Smaller variant (top bar): 36×36, `rounded-lg` (16px). Hit area is generous.

**Focus ring:** `focus-visible:ring-2 focus-visible:ring-[var(--brand)]/20`. One canonical pattern.

### Cards & surfaces

`.echly-card`: `background: var(--surface-card)`, `1px solid var(--border)`, `border-radius: var(--radius-lg)` (16px), `box-shadow: var(--shadow-sm)`, `padding: 24px`. Hoverable variant `.echly-card--hover` adds `translateY(-1px) + shadow-md + border-strong` over 200ms.

Other surface treatments:
- **Workspace card** (grid view): `rounded-xl border bg-white p-4 md:p-5 flex flex-col h-full` — uses `bg-white` not `--surface-card`.
- **Settings cards:** white, `1px solid var(--border)`, `border-radius: 16px`.
- **Glass cards** (extension only): `background: rgba(252,251,249,0.86) + blur(28px) saturate(140%)`.
- **Dark glass cards** (extension dark overlays): `rgba(20,22,28,0.92) + blur(20px)`.
- **`.content-card`** (the main app shell card): `background: var(--surface-card)`, `border-radius: 14px`, `box-shadow: var(--shadow-panel)`.

### Form elements

- **Inputs** — `.echly-input`: 38px height, `1.5px var(--border)` border, `var(--radius-sm)` (9px) radius, `--surface-input` bg (`#FAFAFA`). On focus: bg → white, border → brand, `box-shadow: 0 0 0 3px rgba(90,73,191,0.12)`. Error: border → danger, focus shadow → `rgba(185,28,28,0.12)`. Mobile: font bumped to 16px to prevent iOS auto-zoom.
- **Sizes:** sm 30px / md 38px / lg 42px.
- **Dropdowns:** custom `dropdown-menu.tsx` (context-based) with `DropdownMenu` / `Trigger` / `Content` / `Item`. Portal-positioned, viewport-clamped, `1px var(--border)` + `bg: var(--surface-page)` + `shadow-md`, items `px-3 py-1.5` 14px text. Also a `ShareDropdown` variant used in the share modal.
- **Switch:** 40×22 pill, thumb 18×18, brand bg when checked. 150ms ease-in-out transitions.
- **Checkboxes / radios:** no dedicated primitives — the `ResolvedToggle` reuses a button + faux-checkbox pattern (16×16 box, brand when checked).
- **Search input** (top bar): `34px` height, `bg: rgba(255,255,255,0.7)`, `1px var(--hair)` border, `rounded-[9px]`. Hover → solid white.

### Navigation

- **Global rail** (`GlobalRail.tsx`): 220px expanded / 64px collapsed, `bg-var(--surface-card)`, no border, 300ms `cubic-bezier(0.4,0,0.2,1)` transition. Items use `.echly-nav-item` class: 38px height, 11px gap (icon + label), `border-radius: var(--radius-md)` (12px), `15px font-normal var(--text-secondary)` text. Hover: bg `--surface-hover`, text `--text-heading`. Active: bg `--brand-subtle`, text `--brand-text`, font-weight medium, icon color brand. Items: Dashboard, Discussion, Activity, Shared, Settings + workspace switcher popover.
- **Top bar / TopControlBar** (session page): 72px tall, grid `1fr auto 1fr`, `bg: var(--surface-page)`, sticky.
- **Tab nav:** inline-flex with `gap-3 md:gap-10`, active tab gets a `h-[3px] bg-[var(--brand)]` underline. Used on dashboard tabs, settings tabs, activity filter tabs.
- **Mobile:** `MobileAppHeader` + `MobileNavDrawer`, swapped in via `AppMobileShell` based on `useIsMobile()`.

### Data display

- **Lists:** session rows are `flex items-center justify-between gap-3 rounded-lg px-3 md:px-4 py-3 md:py-4`. Hover wash `bg-var(--surface-hover)`, selected `bg-var(--brand-subtle)`. Right-side actions appear at `opacity-0 group-hover:opacity-100`.
- **Tables:** no real table primitives — session rows are flex rows, settings members list is button rows.
- **Badges (`Badge.tsx`):** 7 variants (default/success/warning/danger/info/brand/purple), `radius-pill`, `1px 7px` padding, `12px medium`, optional 6×6 colored dot.
- **Tag (`Tag.tsx`):** two variants — default (`12px H × 6px V` padding, `radius-sm` 9px, `1px hair` border, body text) and sidebar (`8px × 2px` padding, `radius-pill`, `--surface-subtle` bg, 12px text). Removable via hover-revealed red X bubble (20×20, `bg: --color-danger`).
- **Avatars (`UserAvatar.tsx`):** rounded-pill, image-first with deterministic colored fallback (palette of 7 colors keyed off uid). Anonymous viewers get neutral grey `#E5E5E5` + "A" initial in `--text-secondary`. Typical sizes 20–32px (lists), 88px (settings).
- **Progress:** `ProgressRing` (40px SVG, 3.5px stroke, semantic color based on percent: <30% danger / 30–70% warning / ≥70% success, 300ms transition). `ProgressPie` (default 36px, 3px stroke, brand `#5A49BF` hard-coded, animated check on 100%).
- **Status indicators:** dots (6×6 or 8×8), pills (badge variants), and the extension's session-control-bar status (`8px` live dot teal `#34C29A` with pulsing shadow, `9px` amber paused with pseudo-element pause bars, `14px` blue spinner saving).

### Layout primitives

- **`Section.tsx`** — `<section>` with optional `<h3 class="echly-section-title">`.
- **`Stack.tsx`** — `.echly-stack` flex column with gap options 8/12/16/20/24.
- **`Divider.tsx`** — `<hr class="echly-divider">`, 1px solid `--border`.
- **`FadeInContent.tsx`** — empty/placeholder file.

### Signature Annote components

#### Voice waveform UI

Multiple waveform patterns coexist:

1. **`v2-wave` mode-tile decoration** (extension, on ModeTile cards): **5 bars**, each `2.5px × 10px` (W × max H), `2.5px gap`, color `var(--brand)` @ 0.85 opacity, `border-radius: 1.5px`. Keyframe `v2-wave` scales each bar Y from 0.4→1→0.4 over a cycle, staggered `+0.2s` per bar (bars start at 0s/0.2s/0.4s/0.6s/0.8s). Sits at `bottom-right` of the mode tile.
2. **Recording capsule** uses a red-orange transcript underline gradient (`linear-gradient(90deg, #FF4D4F, #D9363E, #FF4D4F)`) animated via `echly-gradient-shift` 1.2s instead of bar visualization.
3. **Mic orb itself reacts to audio** rather than rendering bars: ring scale = `1 + min(0.22, audioLevel * 0.28)` and box-shadow intensity scales with audio level.

#### Element selection / highlight overlay

`2px solid #5A49BF` outline, `rgba(37, 99, 235, 0.1)` fill, `4px border-radius`. z-index `2147483646`. Single div that updates position on mousemove (no React re-render flicker). Bloom animation `echly-selected-appear` plays for 400ms ease-out on selection (opacity + box-shadow pulse).

#### Mic orb

- Idle: 48px diameter circle, `linear-gradient(135deg, #FF4D4F, #D9363E)`, glow `0 0 24px rgba(255, 77, 79, 0.2)`. Breathing `echly-mic-orb-breathing` 2.2s ease-in-out (scale 1 → 1.04 → 1).
- Speaking: ring brightens (`rgba(255,255,255,0.4)`), glow intensifies (`box-shadow: 0 0 28px rgba(255, 77, 79, 0.35)`), ring scales with audio level.
- Processing: gradient desaturates to grey + conic-gradient ring spinning `echly-mic-orb-gradient-spin` 2.5s linear.
- Success: `echly-orb-success-pulse` 200ms ease-out — gradient flips to green (`#22c55e`) then back to red.
- Exiting: `transform: scale(0.96)` over 200ms.

Sizes: 44px (compact, inside KeepRecording pill), 48px (standard), 72px (large/center recording).

#### KeepRecordingPill

44px tall, `border-radius: 9999px`, dark glass (`rgba(28, 30, 36, 0.98)` + `blur(12px)`), heavy shadow (`0 20px 50px rgba(0, 0, 0, 0.45)`). Expansion animates from 44px wide (orb-only) to 240px wide (orb + transcript + done button) over `180ms cubic-bezier(0.2, 0.8, 0.2, 1)`.

#### Confirmation card (post-recording, "I understood…")

`max-width: min(360px, 92vw)`, `padding: 24px`, `border-radius: 14px`, `background: rgba(20, 22, 28, 0.92)`, `backdrop-filter: blur(20px)`, `1px solid rgba(255,255,255,0.08)` border, `shadow: 0 10px 30px rgba(0, 0, 0, 0.35)`. Heading "I understood" 16px 600 white, ticket title 14px 600 white, description 13px 500 `#A1A1AA`. Entry: framer-motion `{ opacity: 0, y: 8 } → { opacity: 1, y: 0 }` over `0.2s` with `[0.22, 0.61, 0.36, 1]` ease. Confirm button uses brand `#5A49BF` with `0 4px 12px rgba(21, 93, 252, 0.25)` shadow; Edit button uses `rgba(255,255,255,0.08)` glass.

#### Region capture overlay

Full-screen `rgba(0,0,0,0.4)` dim with the selection as a 9999px-shadow cutout. Selection border `2px solid #5A49BF` (brand), flashes white `#FFFFFF` for 150ms when captured. `border-radius: 14px`. Top-center hint "Drag to capture area — ESC to cancel" (13px 500 white@85%). Confirmation bar slides up `echly-confirm-bar-in 220ms` with Retake (white@8%) and "Speak feedback" (brand) buttons.

#### Session control panel (the "you're recording a session" pill)

Fixed `bottom: 32px`, centered horizontally, z `2147483646`. `background: rgba(20, 22, 28, 0.82)`, `backdrop-filter: blur(24px) saturate(140%)`, `border-radius: 9999px`, `padding: 8px 8px 8px 24px`, gap `16px`. Status indicator (live = 8px teal `#34C29A` dot, pulsing shadow 2s; paused = 9px amber bars; saving = 14px blue `#5B7CFF` spinner 0.8s). Buttons: Ghost (Pause), Brand (Resume), Danger `#E5484D` (End). Stop icon `9×9` white `2px radius`.

#### AI processing indicator

Three patterns:
1. **Dot pulse** in ticket list rows — 3 dots `3.5×3.5px` at `var(--brand)`, staggered `0.15s/0.30s` delays, keyframe `echly-v2-dot` 1.2s (opacity 0.25→1→0.25, translateY 0→-2.5px→0).
2. **Skeleton shimmer** — `echly-v2-shimmer` 1.6s loop, gradient `#DCE7F5 → #ECF2FB → #DCE7F5` swept across skeleton lines.
3. **Conic-gradient processing ring** on the mic orb — 2.5s linear rotation.

#### Floating command button

Bottom-right `24px` from edges, `padding: 12px 20px`, `border-radius: 14px`, glass bg + glass-blur backdrop, 14px 500 text. Hover scale 1.03 + translateY -1px, active scale 0.98. Framer-motion `duration: 0.16, ease: [0.22, 0.61, 0.36, 1]`. **Launcher variant** (mini icon button before session starts): 64×64, white `rgba(255,255,255,0.92)` with inset highlight, `border-radius: 16px`, `backdrop-filter: blur(30px) saturate(1.4)`, hover scale 1.05.

#### Session list item (dashboard)

Layout: `[progress pie 32px OR checkbox] [title + meta] | [viewer avatars stack] [open count] [resolved count] [date] | (hover) [copy link 38×38] [⋮]`. Title `15px medium #15101F`, meta `13px #54495F` (creator, comment count, workspace label pill). Viewer avatars `-space-x-1.5`, max 4 visible + "+N more" pill, each `ring-2 ring-white`. Counts use 16×16 icons (CircleDashed brand for open, Check success for resolved) + 14px medium tabular-nums. Hover row: bg → `--surface-hover` over 150ms; selected: bg → `--brand-subtle`.

#### Ticket card / FeedbackHeader (session detail)

Sticky header with three rows:
1. **Meta row:** `[N of M] [StatusBadge] [Impact N]` — position badge `11.5px medium`, `bg: --surface-hover`, `px-2.5 py-[3px]`, `rounded-full`, tabular-nums. StatusBadge: Resolved (`bg: --color-success-bg`, text success, success dot); Open (`bg: --brand-subtle`, text brand, brand dot); In Progress/Blocked (grey / red). All `11.5px bold tracking-[-0.005em]` with 1.5 gap.
2. **Title row:** editable inline.
3. **Action row:** Resolve / Assign / Priority / Delete / Activity toggle. Template: `h-[34px] px-3.5 rounded-[7px] 13px medium`. Primary (resolve): brand fill. Resolve-unresolved CTA: `bg: --brand-subtle text: --brand`. Delete: icon-only 34×34, grey→red on hover. Resolve flash on action: `scale-105 ring-2 ring---color-success-border ring-offset-2` 420ms ease-out.

#### Shared session view (public)

Internal view + a fixed bottom `PublicViewerBanner`. Banner: `bg-white`, `border-top: 1px var(--border)`, `box-shadow: 0 -8px 32px rgba(0,0,0,0.08)`, `padding: 21px 40px`. Left side: 38×38 brand-gradient lock-icon background + "Sign in to resolve & manage feedback" 15px 600. Right side: Sign in button 42px height `bg-var(--brand) rounded-[10px]` + 32×32 close button. Dismissal persists in sessionStorage. Public viewers also get a `PendingAccessBanner` if they've requested access, and the share/resolve actions are gated.

---

## Section 6 — Motion & Interaction Language

### Token defaults (canonical)

```
--duration-fast:  120ms
--duration-base:  200ms
--ease:           cubic-bezier(0.16, 1, 0.3, 1)   /* the "premium spring" */
--ease-in:        cubic-bezier(0.4, 0, 1, 1)
--ease-out:       cubic-bezier(0, 0, 0.2, 1)
--t-slow:         220ms
```

The signature easing curve `cubic-bezier(0.16, 1, 0.3, 1)` is an aggressive "decelerate" — fast-out, very smooth settle. It's the same curve used by Vercel, Linear, and Arc; it gives the app its "premium spring" feel without overshoot.

### Tailwind config additions

```
transitionDuration: { motion: "200ms", "motion-fast": "120ms" }
```

No custom keyframes/animations declared in Tailwind config — every animation lives in `globals.css`.

### Keyframe catalog (representative — 60+ keyframes exist in globals.css)

| Keyframe | Duration | Easing | Purpose |
|---|---|---|---|
| `echly-mic-orb-breathing` | 2.2s | ease-in-out | Idle voice orb pulse, scale 1→1.04 |
| `echly-mic-orb-gradient-spin` | 2.5s | linear | Conic-gradient processing ring |
| `echly-orb-success-pulse` | 200ms | ease-out | Red→green flash on capture complete |
| `echly-recording-pulse` | 1.4s | ease-out | Red dot broadcast |
| `pulseOrb` | 1.8s | ease-in-out | Extension voice card breathe |
| `v2-pulse` | 2.4s | ease-in-out | Start-button glyph dot |
| `v2-pulse-soft` | 2.4s | ease-in-out | AI status dot shadow pulse |
| `v2-wave` | ~1.4s | ease-in-out | Waveform bar Y-scale, staggered |
| `captureListeningEnter` | 160ms | `cubic-bezier(0.2, 0.8, 0.2, 1)` | Capture panel slide-up entry |
| `captureProcessingEnter` | 150ms | `cubic-bezier(0.2, 0.8, 0.2, 1)` | Processing crossfade |
| `captureHeaderPulse` | 2.2s | ease-in-out | "Echly" halo while processing |
| `captureCompletionTint` | 100ms | ease-out | Subtle dark wash on completion |
| `dropdownEnter` | 140ms | `cubic-bezier(0.4, 0, 0.2, 1)` | All dropdown menus |
| `tooltipEnter` | 120ms | ease-out | Hover tooltips |
| `echly-pill-enter` | 240ms | `cubic-bezier(0.2, 0, 0, 1)` | Recording pill fade-in |
| `echly-pill-hint-fade-in` | 200ms | ease-out | Hint strip above pill |
| `echly-selected-appear` | 400ms | ease-out | Element-selection bloom |
| `echly-confirm-bar-in` | 220ms | `cubic-bezier(0.22, 0.61, 0.36, 1)` | Region-capture confirm bar |
| `echly-capture-card-enter` | 220ms | `cubic-bezier(0.22, 1, 0.36, 1)` | Voice capture card scale-in |
| `echly-recording-capsule` | 220ms | `cubic-bezier(0.22, 0.61, 0.36, 1)` | Pill width/padding/gap expand |
| `echly-shimmer` (skeleton) | 1.6s | ease-in-out | Skeleton placeholder shimmer |
| `shimmer` (AI) | 1.8s | ease-in-out | AI skeleton row sweep |
| `echly-v2-skel-pulse` | 1.6s | (gradient sweep) | Ticket skeleton |
| `echly-v2-dot` | 1.2s | ease-in-out | AI "thinking" dots (3, staggered 0.15s/0.30s) |
| `echly-v2-succ-pop` | 0.42s | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy success check (back-out ease) |
| `echly-v2-succ-glow` | 2.4s | ease-out | Tinted green glow fade-out |
| `echly-v2-sc-live` | 2s | ease-in-out | Session control live-dot shadow pulse |
| `echly-v2-sc-spin` | 0.8s | linear | Session control saving spinner |
| `echly-spin` | 0.7s | linear | Generic inline spinner |
| `echly-new-ticket-pulse` | 600ms | ease-out | New ticket highlight flash |
| `echly-page-in` | 200ms | premium ease | Top-level page enter |
| `echly-shake` | 0.5s | ease-in-out | Generic error shake (±5px) |
| `echly-upgrade-shake` | 0.5s | ease-out | Upgrade modal error shake (±6px) |
| `echly-pill-shake` | 0.5s | ease-in-out | Pill error shake (±4px) |
| `resolveToastIn` | 180ms | ease-out | Resolve toast entry |
| `activity-feed-row-enter` | 160ms | premium ease | Activity row slide-up |
| `activity-skeleton-pulse` | 1.8s | ease-in-out | Activity loader rows |
| `workspace-card-in` | 220ms | premium ease | Dashboard card entrance |
| `extension-tray-in` | 250ms | `cubic-bezier(0.2, 0.8, 0.2, 1)` | Dashboard extension CTA tray |
| `progressPieCheckFade` | 200ms | ease-out | ProgressPie completion check |
| `modal-enter` | 200ms | premium ease | Modal scale 0.96 + translateY 8px → 1/0 |
| `echly-icon-float` | 2.4s | ease-in-out | Floating icon (loading) |
| `echly-icon-ring` | 2s | ease-out | Ring expansion (loading) |
| `loader-rotate` / `loader-dash` | 2.4s | `cubic-bezier(0.4, 0, 0.2, 1)` | Brand SVG loader |

### Framer-motion usage (13 files only)

The vast majority of motion is CSS-keyframe-driven. Framer-motion is reserved for **state-driven UI** where JS lifecycle matters:
- `CaptureWidget/ConfirmationCard.tsx` — entry `0.2s [0.22,0.61,0.36,1]`
- `CaptureWidget/FloatingCommandButton.tsx` — interaction `0.16s [0.22,0.61,0.36,1]`
- `session/feedbackDetail/DescriptionEditor/VoiceRecordingPopover.tsx` — `0.2s [0.16,1,0.3,1]` (premium ease)
- `session/feedbackDetail/DescriptionEditor/ImproveDescriptionPill.tsx` — `0.15s [0.16,1,0.3,1]`
- `session/feedbackDetail/ActivityThread.tsx` — `0.18s easeOut`
- `billing/UpgradeModal.tsx` — backdrop `0.15s`, panel `0.2s [0.25,0.46,0.45,0.94]`
- `billing/UpgradeSuccessModal.tsx` — same pattern
- `RequestAccessModal.tsx` — `0.2s [0.2,0.8,0.2,1]`
- demo components (`SessionControlBar`, `ExtensionPopup`, `DemoFeedbackDashboard`, `DemoGuide`, `DemoArrow`) — varied (`0.2–0.35s`, `easeOut`, plus indefinite scale repeats for arrows/highlights at 1.4–2s)

**Observed framer easing variety:** `[0.22, 0.61, 0.36, 1]` (extension components), `[0.16, 1, 0.3, 1]` (description editor — matches the CSS premium ease), `[0.25, 0.46, 0.45, 0.94]` (billing modals — Material standard ease), `[0.2, 0.8, 0.2, 1]` (RequestAccessModal — soft spring), plus string easings `easeOut`/`easeInOut`. Four+ different easing curves across framer-motion alone.

### Hover / interaction state treatment

- **Hover wash:** `bg-var(--surface-hover)` over 120–150ms — universal pattern for rows, ghost buttons, sidebar items.
- **Lift on hover:** cards translateY(-1px) + shadow lift — `.echly-card--hover`, dashboard grid cards.
- **Scale on press:** extension launcher uses `scale(1.05)` hover / `scale(0.98)` active. CSS files have several `scale(1.03)` hover patterns. Dashboard buttons do **not** scale — they use opacity/bg/border shifts only.
- **Brand wash on selection:** `bg-var(--brand-subtle) + text-var(--brand-text) + weight: medium` — universal for selected rows, active nav.
- **Focus rings:** `ring-2 ring-[var(--brand)]/20` (Button), `ring-2 ring-[#5A49BF]/30 ring-offset-2` (Switch), `:focus-visible { outline: 2px solid var(--border-focus); outline-offset: 2px }` (global default). Three close-but-not-identical patterns.

### Loading states

- **Skeleton screens** are the dominant loading pattern. `.echly-skeleton` uses a 1200px-wide linear-gradient swept by 1.6s `echly-shimmer`. Variants: `line` (12px), `circle` (pill radius), `rect`.
- **Spinners** appear in three flavors: `BrandLoader` (48px SVG arc with gradient-offset animation 2.4s), `MinimalLoader` (20×20 border-spin 0.7s linear), and inline Lucide `Loader2 animate-spin` (in Toast, action buttons).
- **AI loading** is the most distinct: shimmer + dot-pulse + processing ring all coexist, used contextually.

### Mobile motion

iOS auto-zoom on inputs is suppressed by bumping font-size to 16px under 767px. Modals go full-screen ≤639px with `border-radius: 0`. No specific motion changes for mobile — same durations apply.

### Motion personality (synthesis)

The motion language is **fast, springy, and decelerating**. Standard transitions are 120–220ms with a single dominant curve. Long-running ambient animations (orb breathe, AI dots, status pulses) sit in the 1.2–2.5s band and use `ease-in-out` for organic breathing rhythm. There's a strong "ceremony for important moments" pattern: orb success pulse (200ms color flip), resolve flash (420ms ring), bouncy success pop (0.42s with `back-out` overshoot easing), region-capture flash (150ms white border). The app rewards completion with deliberate motion.

---

## Section 8 — Inconsistencies & Polish Notes

This is the part you specifically asked me to be precise about. Findings, grouped by severity.

### Likely-canonical-vs-drift inconsistencies

1. **Two fonts across surfaces** — Dashboard: `DM Sans` (set in tokens.css `--font-sans`). Extension popup: `Plus Jakarta Sans` (loaded in [extension-fonts.css](annote-extension/extension-fonts.css)). Both are humanist geometric sans-serifs with similar metrics, but they are not the same family. **Likely canonical:** DM Sans (it's the system token). The extension probably needs to be migrated, or DM Sans needs to be loaded into the extension shadow DOM.

2. **Four "primary button" patterns** — `Button.tsx` variant=`primary` fills with **`#15101F`** (near-black). The actual highest-emphasis dashboard CTAs (`New Session`, `Sign in`, `Invite`, `Resolve`) use **`var(--brand)`** (purple). Inline-styled saves/CTAs in settings, share modal, and PublicViewerBanner re-implement brand-filled buttons with **varying heights (38/42px)** and **varying radii (10/16/20px)**. **Likely canonical:** brand-purple fill at 38px height, 20px radius (`--radius-btn`). The dark-fill `Button.tsx` primary is used more like a "neutral primary" and should probably be renamed or split into a separate variant.

3. **Font-size base** — `html { font-size: 15px }` is the global root, but Tailwind's `text-base` resolves to its own 16px default. Code mixes Tailwind classes and `var(--text-base)` (which is 15px). Result: `text-base` and `var(--text-base)` differ by 1px depending on which is used. **Likely canonical:** the 15px token (declared in both `:root` and on `html`).

4. **Radius scale drift** — Canonical scale is `6 / 9 / 12 / 16 / 22 / 9999`. Lived values include `7px` (FeedbackHeader action buttons), `10px` (PublicViewerBanner buttons + lock icon), `14px` (content-card, extension cards, voice popup, confirmation card), `4px` (selection overlay), `2px` (HexCode swatch). The 14px value is used so much (content-card-radius is a named token) it probably *should* be on the scale.

5. **Two purples** — `--brand: #5A49BF` and `--color-insight: #6049E7`. They differ by ~3% in lightness and are easy to confuse. Brand is the action color; insight is the AI/discovery color. The semantic separation is meaningful but the visual distinction is subtle.

6. **Two near-identical text colors** — `--text-body` and `--text-secondary` are both `#54495F`. The naming implies a distinction that doesn't exist in the values. Either consolidate or actually differentiate.

7. **Avatar background convention** — `UserAvatar.tsx` says "never set background directly; use colorSeed." Some external callers still pass `style={{ background: ... }}`. Not enforced.

### Hard-coded values that bypass the token system

8. **Hex literals in code** (a non-exhaustive list):
   - `MinimalLoader.tsx` — spinner top color `#5A49BF` (should be `var(--brand)`)
   - `ProgressPie.tsx` — stroke `#5A49BF` and `brandBlue` literal (should be `var(--brand)`)
   - `EditorToolbar.tsx` — toolbar bg `#15101F`, popover bg `#54495F` (matches text tokens but should use tokens)
   - Several inline styles in `PublicViewerBanner.tsx`, `SessionHeader.tsx`, settings page use raw `'#FFFFFF'` instead of `var(--surface)`
   - The recording orb's red palette (`#FF4D4F`, `#D9363E`, `#FF553D`, `#FF6A3D`) has no token equivalent — should be at minimum `--recording-bg-start` / `--recording-bg-end`
   - Session control bar status colors (`#34C29A`, `#FBBF24`, `#5B7CFF`) — no tokens
   - Selection bg `rgba(51, 144, 255, 0.3)` is a third blue not in the palette
   - `Tag` remove button background `var(--color-danger)` is fine, but the `20×20` hard-coded size and `-2px / -2px` offset isn't on the scale

9. **Glass tokens defined twice** — `tokens.css` has glass tokens; the extension defines its own inline (`rgba(20,22,28,0.92)`, `blur(20px)`). The dark-overlay glass and the warm-light glass have separate origin systems even though both surfaces are part of the extension.

10. **Backdrop-blur values vary** — `4px` (modal), `12px` (KeepRecording), `20px` (confirmation/voice popup), `24px` (mic dropdown, session control), `28px` (sidebar surface, standard glass), `30px` (launcher). No `--blur-{level}` tokens.

### Component-level inconsistencies

11. **Tag border** uses `--hair: #E7E5E4` (warm), but most other components use `--border: #E5E7EB` (cooler). Probably intentional (Tag lives in the session page, which uses warm borders), but worth confirming.

12. **Button heights drift** — `h-11` (44px mobile) → `h-[38px]` (38px desktop) is the canonical Button.tsx pattern. But: top bar share button uses 34px, FeedbackHeader action buttons use 34px (with custom `rounded-[7px]`), settings save buttons use 42px, copy-link button is 38×38. The 34/38/42 trio is genuinely common; the canonical scale should be three sizes, but currently `Button.tsx` only ships one.

13. **Focus rings differ by 10% opacity** — `Button` uses `/20`, `Switch` uses `/30`, `.echly-input` uses `/12` (`box-shadow: 0 0 0 3px rgba(90,73,191,0.12)`), `ColorPickerPopover` uses `--color-primary-ring` which is `/18`. Pick one.

14. **Modal radius** — `Modal.tsx`'s `.echly-modal-panel` uses `var(--radius-xl)` (22px). `StatusOverlay` uses `rounded-xl` (Tailwind, which maps to 22px in the extended theme — same value, different source). `OverlayError` hard-codes `rounded-[14px]`. **Likely canonical:** 22px for the modal panel, 14px is wrong.

15. **z-index conventions** — Dashboard tokens cap at 400 (toast). Implementations frequently exceed: tooltips use `MODAL_LAYER_Z_INDEX + 100`, Toast uses `9999`, dropdowns use `PORTAL_DROPDOWN_Z_INDEX`. The extension is in its own range (`2147483645–7`). Multiple conventions coexist.

16. **`FeedbackTag.tsx`** is deprecated in favor of `<Tag name={type} variant="sidebar" />`. Confirm no live callers and delete.

17. **`FadeInContent.tsx`** is empty (single-line stub). Either implement or remove.

18. **PageHeader.tsx is deleted** (per `git status`) but mobile chrome (`MobileAppHeader`, `MobileNavDrawer`, `AppMobileShell`, `useIsMobile`) was added in the same uncommitted change. The component tree is in an in-progress restructure. Be careful basing marketing visuals off the *current* git state — this branch is mid-refactor.

### CSS architecture concerns

19. **globals.css is 11,292 lines** with 60+ keyframes. Many keyframe pairs do nearly the same thing (`shimmer` vs `echly-shimmer` vs `echly-v2-shimmer` vs `notif-shimmer`; `echly-spin` defined twice at lines 1804 and 2527; `echly-icon-breathe` / `echly-mic-orb-breathing` / `pulseOrb` / `echly-breathe` all pulse-scale). Real consolidation opportunity.

20. **Duplicate `:root` and `:host` blocks** in tokens.css — necessary for shadow-DOM token inheritance in the extension, but the two blocks must stay in sync manually. No automation enforces this; drift is a real risk.

21. **Legacy alias block** in tokens.css is large (~150 aliases). Comment says "remove after all files are migrated" — incomplete migration. Examples still in use: `--ink-1`, `--bg-app`, `--space-*`, `--gray-*`. New code is being written against the legacy names alongside canonical names.

22. **Tag class confusion** — there's `Tag.tsx` (component), `.echly-tag` (CSS class), and `FeedbackTag.tsx` (deprecated wrapper). The "Tag" name overlaps with the `tagline`/`tags` concept in ticket data. Could be renamed `Chip`.

### Marketing-relevant flags (the "show the best version" angle)

- For marketing screenshots, use the **brand-purple primary button** (not the dark `Button.tsx` primary). It's the more identifiable, more frequently shown CTA.
- The **dashboard radius is `14px` (content card) + `20px` (buttons) + `22px` (modals)**. That's the visual signature — use those values in mockups.
- The **session control pill** (bottom-of-page during recording) is probably the strongest visual moment in the entire product. It's a fully-rounded dark glass pill with a teal pulsing live dot — read-at-a-glance, premium, instantly recognizable.
- The **mic orb breathing + element selection highlight** combo is the second-strongest moment. Red orb breathing, brand-purple element outline, dark glass confirmation card sliding in.
- Use **DM Sans** in marketing (the dashboard font, the canonical token), not Plus Jakarta Sans.

---

## Section 10 — Open Questions (gaps where screenshots/design files would resolve ambiguity)

I'm noting these granularly so the next prompt can either supply answers or ask Claude Design to fill them in.

### Capture flow visuals (Section 7 — entire section)

1. What does the **extension popup** look like? I see `popup.css` exists and uses Plus Jakarta Sans, but the actual structure of the popup (panel that opens from the toolbar icon) is not represented in the component files I read. Is it a session picker? A start-recording CTA? A list of past sessions?
2. **Activation moment** — when the user clicks the Annote toolbar icon, what visually changes on the host page? Is there a fade-in of the floating command button? A toast? A persistent banner?
3. **Element hover state** — the code defines `2px solid #5A49BF + rgba(37,99,235,0.1)` highlight, but does it show a label/tag with the element name or selector? Demo screenshots would confirm.
4. **Screenshot capture animation** — what visually communicates "screenshot taken"? Is there a flash, a shrink-to-thumbnail transition, a sound cue?
5. **Voice popover positioning** — where does the SessionFeedbackPopup actually appear relative to the cursor or the selected element? The code says "Fixed center (50% / 50%)" but I'd want a screenshot to confirm it's not following the cursor.
6. **AI processing duration** — the orb has a 2.5s gradient-spin keyframe. Is the actual processing typically 2–4 seconds? 5–15? This determines how dominant the animation is in the moment.
7. **Confirmation card ticket assembly** — does the title/description appear all at once or stream in word-by-word (the AI streaming tokens suggest streaming)?
8. **Multi-capture session indicator** — when the user is mid-session and captures a second ticket, how does the UI show "you're still in the Q2 launch session, this is ticket #3"? Code references SessionControlPanel but the visual count UI isn't obvious.
9. **End-of-session share-link generation** — what does the share modal *for a freshly-ended capture session* look like, vs. the share modal for an existing session opened later? Same UI? Different?
10. **Recipient/public view** — code has `PublicViewerBanner` and `RequestSessionAccessPage`, but I can't tell from code alone what gets *hidden* in the public view vs the internal view. (E.g., are integrations hidden? Assignee? Internal comments?)
11. **Voice comments on shared sessions** — Section 7 step 22 asks about voice comments from recipients. Code has `CommentAttachmentCard` (suggests media attachments on comments) and `VoiceRecordingPopover` is in `DescriptionEditor`, but I can't confirm voice-comment capability for non-authenticated viewers.

### Idealized Annote (Section 9)

12. Which dashboard screenshot represents the **most-mockable** state — empty? 3 sessions? 12 sessions? Active multi-select?
13. Which session detail screenshot has the **richest realistic data** (full ticket with assignee + priority + tags + screenshot pins + 2-3 comments)?
14. Is there a "hero moment" screenshot anyone has already used in pitch decks or social? That's the strongest candidate for the marketing page.

### Spot ambiguities the code couldn't resolve

15. **Waveform bar count in the recording state** — code shows 5 bars in the v2 mode tile decoration. Is the *actively-recording* voice UI also 5 bars, or does it use the audio-level-reactive orb instead (no bars at all)?
16. **AI "Improve description" streaming visual** — code has the dim-text + inverted-block-cursor tokens, but does the AI also show a header pill "AI is writing" or just stream silently with a cursor?
17. **Demo components** — `components/demo/*` has `SessionControlBar`, `ExtensionPopup`, `DemoFeedbackDashboard`, `DemoGuide`, `DemoArrow`. Are these used in onboarding to show users how Annote works, or are they external marketing-site components? They contain motion patterns (arrow scale repeats, highlight pulses) that don't appear elsewhere in the app — these might be canonical marketing motion.
18. **Plans for the Plus Jakarta / DM Sans split** — intentional (extension chrome wants a different feel than the dashboard) or accidental (extension was built first with Plus Jakarta and the dashboard switched to DM Sans without porting back)?
19. **Dark mode** — tokens.css comment says "extension dark mode was removed pre-launch." Does the dashboard ever support dark mode (now or planned)? `--text-on-dark` token suggests partial planning.
20. **Mobile capture flow** — the extension is Chrome-only on desktop, but the dashboard has fresh mobile shell components ([components/layout/AppMobileShell.tsx](components/layout/AppMobileShell.tsx), [components/layout/MobileNavDrawer.tsx](components/layout/MobileNavDrawer.tsx)). Does the *capture* flow have a mobile equivalent, or is mobile dashboard-only (view tickets that were captured on desktop)?
21. **The deleted PageHeader** — what replaced it in mobile? `MobileAppHeader` is the obvious answer but their feature parity is unclear from code.
22. **Onboarding** — there's a full onboarding.css (1164 lines) with browser mockups, role-chip selection, and a feature carousel. The onboarding feels like a separate sub-app. Screenshots of onboarding would help understand if it's the *first* visual a marketing visitor would associate with Annote, vs. the dashboard.

---

End of code-grounded audit. The complementary `audit-gaps.md` enumerates exactly which sections still need Claude-Design or screenshot input to be complete.
