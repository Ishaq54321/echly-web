# 🎨 Final Color Role Map (Locked)

This file is the **decision-locked** finalization of `color-role-map-refined.md`.

## Roles (all sections)

| Role | Final Primary | Allowed Variants (minimal) | Notes |
| --- | --- | --- | --- |
| text-primary | `VAR:--text-primary` (`#0F172A`) | `VAR:--text-primary-strong` (`HSL:hsl(var(--text-primary-strong))`) | Use `--text-primary-strong` only for headings/labels that need extra contrast. |
| text-secondary | `VAR:--text-secondary` (`#334155`) | `VAR:--text-secondary-soft` (`HSL:hsl(var(--text-secondary-soft))`) | Secondary supporting copy. |
| text-muted | `VAR:--text-meta` (`#64748B`) | `VAR:--text-muted` (alias of `VAR:--text-meta`) | `--text-tertiary` is **not** part of this role; do not treat it as an interchangeable muted text color. |
| text-inverse | `#FFFFFF` | `rgba(255,255,255,0.9)` | Use the 0.9 alpha only when pure white blooms (e.g. on glass). |
| text-link | `#155DFC` (`VAR:--brand-blue`) | `VAR:--color-brand-accent` (`#2563EB`) | **Collision rule**: link text uses `#155DFC` (or `--color-brand-accent`), and must not equal primary button fill. |
| bg-app | `VAR:--env-base` (`#F6F7F9`) | — | Page/environment background. |
| bg-surface | `VAR:--canvas-base` (`#FFFFFF`) | `VAR:--layer-2-bg` (`#FAFBFC`); `VAR:--structural-gray` (`#F2F3F5`) | Surfaces/cards/panels. Keep variants only for explicit elevation/context. |
| bg-surface-hover | `VAR:--layer-2-hover-bg` (`#F4F5F7`) | extension `VAR:--bg-surface-hover` (`rgba(0,0,0,0.06)` light / `rgba(255,255,255,0.08)` dark) | **Unification rule**: hover uses a dedicated hover token (no inline alpha blacks). |
| bg-selected | `.selection-highlight` (`rgba(70, 110, 255, 0.12)`) | — | Selected state highlight. |
| bg-overlay / scrim | `.echly-modal-overlay` (`rgba(15, 23, 42, 0.48)`) | `VAR:--voice-capture-dim-bg` (`rgba(0,0,0,0.52)` light / `rgba(0,0,0,0.62)` dark) | Voice-capture dim is allowed only for that portal context. |
| bg-glass | `VAR:--glass-1-bg` (`rgba(255,255,255,0.7)`) | `VAR:--glass-voice-capture-bg` (`rgba(255,255,255,0.98)` light / `rgba(20,20,20,0.98)` dark) | Glass surfaces; voice-capture glass is a context-specific variant. |
| border-default | `VAR:--border` (`hsl(var(--border))`) | `VAR:--border-subtle` (`rgba(0,0,0,0.08)` light / `rgba(255,255,255,0.08)` dark) | Use `--border` as the global default; `--border-subtle` only when intentionally reducing contrast (including dark theme). |
| border-strong | `#E5E7EB` | `#D1D5DB` | Strong dividers; keep to these two grays only. |
| border-focus / ring | `VAR:--color-primary-ring` (`rgba(26,86,219,0.35)`) | extension `VAR:--input-border-focus` (`rgba(0,0,0,0.2)` / `rgba(255,255,255,0.2)`) | Focus indication is ring/token-driven. |
| accent-primary | `VAR:--color-primary` (`#1a56db`) | `VAR:--accent` (alias of `VAR:--color-primary`) | **Collision rule**: primary CTA/button fills use `--color-primary`, not `#155DFC`. |
| accent-hover | `VAR:--color-primary-hover` (`#1648b8`) | — | Hover for primary accent (links still use `text-link` rules). |
| accent-active | `VAR:--color-primary-ring` (`rgba(26,86,219,0.35)`) | `VAR:--accent-operational-border` (`rgba(26,86,219,0.25)`) | Active emphasis is ring/border glow, not a separate fill color. |
| success | `VAR:--color-semantic-success` (`#059669`) | — | Single semantic success green. |
| error | `VAR:--color-semantic-danger` (`#DC2626`) | — | Single semantic danger red. |
| warning | `VAR:--color-semantic-attention` (`#D97706`) | extension `VAR:--color-warning` (`#F59E0B`) | Extension warning token allowed only in extension context. |

## Interaction Model (Final)

- **Hover**: use **role-specific hover tokens only**.
  - Surface hover: `bg-surface-hover` (app `VAR:--layer-2-hover-bg`, extension `VAR:--bg-surface-hover`)
  - Accent hover (primary accent elements): `accent-hover` (`VAR:--color-primary-hover`)
- **Active**: use **ring/border glow**, not fill swapping.
  - Primary active emphasis: `accent-active` (primary `VAR:--color-primary-ring`, optional `VAR:--accent-operational-border`)
- **Selected**: use **a dedicated selected background**.
  - Selected highlight: `bg-selected` (`rgba(70, 110, 255, 0.12)`)

## Collision Resolutions (Final)

- **`#155DFC` collision (link/brand vs CTA fill)**:
  - **Locked rule**: `text-link` is `#155DFC` (or `VAR:--color-brand-accent`), and **must not** be reused as primary button/CTA fill.
  - **Locked outcome**: CTA fill uses `accent-primary` (`VAR:--color-primary` = `#1a56db`).
- **`rgba(0,0,0,0.04)` / inline alpha blacks collision (surface vs hover)**:
  - **Locked rule**: inline alpha blacks (`rgba(0,0,0,0.02/0.04)`) are **not valid hover colors**.
  - **Locked outcome**: hover backgrounds must use `bg-surface-hover` tokens only; surface backgrounds must use `bg-surface`/`bg-glass` roles.

## Removed / Deprecated

These values are **not allowed** going forward (replace with the locked roles above).

- **Text legacy grays**: `#4B5563`, `#6B7280`, `#9CA3AF`, `#A1A1AA`, `#111827`, `#F3F4F6`
- **Extra link/brand blues (consolidated into `text-link`)**: `#3B82F6`, `#466EFF`, `#1D4ED8`, `#0F4ED1`
- **Near-white surface sprawl**: `VAR:--layer-1-bg`, `VAR:--structural-gray-rail`, `VAR:--structural-gray-ticket`, `TW:bg-white`, `TW:bg-neutral-50`, `TW:bg-neutral-100`, `TW:bg-neutral-200`, `#FAFAFA`, `#F8FAFC`
- **Inline hover alphas**: `rgba(0,0,0,0.02)`, `rgba(0,0,0,0.04)`
- **Focus/ring alternates (non-tokenized)**: `VAR:--accent-operational` (as a ring), `VAR:--ai-accent-ring`
- **Success variants**: `VAR:--color-success` (`#0d9488`)
- **Error variants**: `VAR:--color-danger` (`#b91c1c`), `VAR:--color-alert` (`#EF4444`), `#FF4D4F`
- **CTA fill using link blue**: `VAR:--button-primary-bg` when it resolves to `#155DFC` (use `accent-primary` instead)
