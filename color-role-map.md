# 🎨 Color Role Map

## 1. Text Roles

| Role | Colors Found | Usage Notes |
| --- | --- | --- |
| text-primary | `VAR:--text-primary` (`#0F172A`); `VAR:--text-primary-strong` (`HSL:hsl(var(--text-primary-strong))`); `#111827` | Default app body text is `color: var(--text-primary)`; headings/strong labels frequently use `text-[hsl(var(--text-primary-strong))]`. |
| text-secondary | `VAR:--text-secondary` (`#334155`); `VAR:--text-secondary-soft` (`HSL:hsl(var(--text-secondary-soft))`); `#4B5563`; `#6B7280` | Used for supporting copy, sublabels, and secondary UI chrome (e.g. toolbar text, “bulk selected” labels). |
| text-muted | `VAR:--text-muted` (aliases `VAR:--text-meta`); `VAR:--text-meta` (`#64748B`); `VAR:--text-tertiary` (`HSL:hsl(var(--text-tertiary))`); `#9CA3AF`; `#A1A1AA` | Used for placeholder text (`placeholder:text-*`), captions, timestamps, empty-state text, and tertiary UI chrome (icons/controls). |
| text-inverse | `#FFFFFF`; `TW:text-white`; `VAR:--button-primary-text` (`#ffffff`); `rgba(255,255,255,0.9)`; `#F3F4F6` | Used on dark/strong backgrounds (primary buttons, tooltips, extension dark surfaces). |
| text-link / brand | `#155DFC` (`VAR:--brand-blue`); `VAR:--color-brand-accent` (`#2563EB`); `#2563EB`; `#3B82F6`; `#466EFF`; `#1D4ED8`; `#0F4ED1` | Used for links/brand accents; audit shows heavy usage of `#155DFC` across app pages. |

---

## 2. Background Roles

| Role | Colors Found | Usage Notes |
| --- | --- | --- |
| bg-app | `VAR:--env-base` (`#F6F7F9`) | Primary page/background environment (`html, body`, `.env-canvas`). |
| bg-surface | `VAR:--canvas-base` (`#FFFFFF`); `VAR:--layer-1-bg` (`#FFFFFF`); `VAR:--layer-2-bg` (`#FAFBFC`); `VAR:--structural-gray` (`#F2F3F5`); `VAR:--structural-gray-rail` (`#EEF0F2`); `VAR:--structural-gray-ticket` (`#F8F9FA`); `TW:bg-white`; `TW:bg-neutral-50`; `TW:bg-neutral-100`; `TW:bg-neutral-200`; `#FAFAFA`; `#F8FAFC` | Used for cards/panels and layered shells (rail/sidebar/main). Multiple near-white neutrals appear for different elevations and contexts (app vs “operating system” vs extension). |
| bg-surface-hover | `VAR:--layer-2-hover-bg` (`#F4F5F7`); `rgba(0,0,0,0.02)`; `rgba(0,0,0,0.04)`; extension `VAR:--bg-surface-hover` (`rgba(0,0,0,0.06)` / `rgba(255,255,255,0.08)`) | Hover affordances on list rows, icon buttons, toggles; app uses both tokenized hover (`--layer-2-hover-bg`) and inline alpha blacks. |
| bg-selected | `.selection-highlight` (`rgba(70, 110, 255, 0.12)`) | Explicit “selected/active” highlight treatment used in onboarding selection highlight. |
| bg-overlay / scrim | `.echly-modal-overlay` (`rgba(15, 23, 42, 0.48)`); `VAR:--voice-capture-dim-bg` (`rgba(0,0,0,0.52)` light / `rgba(0,0,0,0.62)` dark) | Modal / dimming overlays in app UI and voice capture portal. |
| bg-glass | `VAR:--glass-1-bg` (`rgba(255,255,255,0.7)`); `VAR:--glass-voice-capture-bg` (`rgba(255,255,255,0.98)` light / `rgba(20,20,20,0.98)` dark); extension `VAR:--bg-surface` (`rgba(0,0,0,0.04)` light / `rgba(30,32,40,0.65)` dark) | “Frosted/glass” surfaces used for premium panels/modals; extension uses semi-transparent surfaces as a core design pattern. |

---

## 3. Border Roles

| Role | Colors Found | Usage Notes |
| --- | --- | --- |
| border-default | `hsl(var(--border))` (`VAR:--border`); `VAR:--border-default` (`rgba(0,0,0,0.08)`); `VAR:--border-subtle` (`rgba(0,0,0,0.08)` light / `rgba(255,255,255,0.08)` dark); extension `VAR:--border-subtle` | General separators and input borders; globally `* { border-color: hsl(var(--border)); }` establishes a baseline. |
| border-strong | `VAR:--layer-1-border` (`rgba(0,0,0,0.045)`); `VAR:--layer-2-border` (`rgba(0,0,0,0.045)`); `#E5E7EB`; `#D1D5DB` | Subtle elevation outlines plus some explicit gray borders (e.g. loader track, scrollbars, utility borders). |
| border-focus / ring | `VAR:--color-primary-ring` (`rgba(26,86,219,0.35)`); `VAR:--accent-operational` (`#1a56db`); `VAR:--ai-accent-ring` (`rgba(26,86,219,0.28)`); extension `VAR:--input-border-focus` (`rgba(0,0,0,0.2)` / `rgba(255,255,255,0.2)`) | Focus-visible rings and focused input borders; app commonly uses Tailwind `focus-visible:ring-*` with `--color-primary-ring` or `--accent-operational`. |

---

## 4. Accent / Interaction Roles

| Role | Colors Found | Usage Notes |
| --- | --- | --- |
| accent-primary | `VAR:--color-primary` (`#1a56db`); `VAR:--accent` (aliases `--color-primary`); `VAR:--accent-operational` (`#1a56db`); `VAR:--button-primary-bg` (`#155dfc` / `#155DFC`); `VAR:--color-semantic-system` (`#2563EB`) | Primary interactive emphasis (primary buttons, operational accents, extension primary CTAs). App and extension use different “primary blue” sources (`--color-primary` vs `--button-primary-bg` / `--brand-blue`). |
| accent-hover | `VAR:--color-primary-hover` (`#1648b8`) | Primary hover state in app button variant; extension hover is primarily expressed via shadows/opacity changes rather than a distinct hover color token. |
| accent-active | `VAR:--color-primary-ring` (`rgba(26,86,219,0.35)`); `VAR:--accent-operational-border` (`rgba(26,86,219,0.25)`) | Active emphasis often shows as ring/border glow rather than a different fill; extension also uses “glow” shadows based on `--button-primary-bg`. |

---

## 5. State Roles

| Role | Colors Found | Usage Notes |
| --- | --- | --- |
| success | `VAR:--color-semantic-success` (`#059669`); `VAR:--color-success` (`#0d9488`) | Semantic success (badges/indicators). Both a “semantic” green and an additional “success” green exist. |
| error | `VAR:--color-semantic-danger` (`#DC2626`); `VAR:--color-danger` (`#b91c1c`); `VAR:--color-alert` (`#ef4444` / `#EF4444`); `#FF4D4F` | Used for destructive actions, alerts, and error emphasis. Multiple reds are present with overlapping intent. |
| warning | `VAR:--color-semantic-attention` (`#D97706`); extension `VAR:--color-warning` (`#F59E0B`) | Used for warning/attention; extension defines an explicit warning token. |

---

## 6. Unknown / Unclear Usage

Colors/variables seen in the audit that are not reliably “UI color roles” (or are too implementation-specific to map confidently):

- `VAR:--spacing` (high usage, but not a color role)
- Tailwind internal shadow/ring plumbing: `VAR:--tw-shadow`, `VAR:--tw-ring-shadow`, `VAR:--tw-ring-offset-shadow`, `VAR:--tw-inset-shadow`, `VAR:--tw-inset-ring-shadow`
- Gradient plumbing: `VAR:--tw-gradient-from`, `VAR:--tw-gradient-to`, `VAR:--tw-gradient-position`, `VAR:--tw-gradient-*-position`
- Transparency shorthand: `#0000`
- Parsing artifacts: `RGB_UNPARSED:rgb(0 0 0 / 0.1)`
- Misc animation/motion vars frequently co-occurring in CSS (`--transition-*`, `--motion-*`) that aren’t color roles

---

## 7. Observations

- **Conflicts (same role, different colors)**:
  - Link/brand accent appears as `#155DFC` (brand-blue / button-primary-bg), but also as `#2563EB`, `#3B82F6`, `#466EFF`, `#1D4ED8`, `#0F4ED1` in various places (likely mixing Tailwind defaults + custom brand).
  - Error/danger is split across `#DC2626`, `#b91c1c`, `#EF4444`, and `#FF4D4F`.
  - Success exists as both `#059669` (semantic) and `#0d9488` (success), which may diverge visually.

- **Overloaded colors (same color, multiple roles)**:
  - `#155DFC` is used both as “brand blue link/accent” and as “primary button background” (app/extension), conflating link vs CTA roles.
  - Semi-transparent black backgrounds like `rgba(0,0,0,0.04)` show up as both subtle surfaces and hover affordances.

- **Missing roles / inconsistencies**:
  - The app has explicit primary hover (`--color-primary-hover`), but the extension’s hover behavior is largely encoded via alpha backgrounds/shadows rather than a dedicated “accent-hover” token.
  - Selected state has at least one explicit highlight (`rgba(70,110,255,0.12)`), but broader “selected row” semantics appear mixed (sometimes hover color, sometimes dedicated selected styling).

