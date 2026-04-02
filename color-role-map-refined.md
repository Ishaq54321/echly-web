# 🎨 Refined Color Role Map

This document consolidates `color-role-map.md` into a **single primary color per role**, and classifies all other observed colors as **variant**, **legacy**, or **conflicting** based strictly on the usage notes and observations recorded in the source map.

---

## 1. Text Roles

| Role | Primary | Variants | Legacy | Notes |
| --- | --- | --- | --- | --- |
| text-primary | `VAR:--text-primary` (`#0F172A`) | `VAR:--text-primary-strong` (`HSL:hsl(var(--text-primary-strong))`); `#111827` | — | **Primary** chosen because it is explicitly called the default app body text. `--text-primary-strong` appears as a consistent stronger heading/label treatment (variant). `#111827` appears as an additional hard-coded near-black; treat as variant unless/until confirmed as old fallback. |
| text-secondary | `VAR:--text-secondary` (`#334155`) | `VAR:--text-secondary-soft` (`HSL:hsl(var(--text-secondary-soft))`) | `#4B5563`; `#6B7280` | **Primary** chosen because it’s the named token used across supporting copy. Hard-coded grays appear alongside token usage and are candidates for cleanup (legacy). |
| text-muted | `VAR:--text-meta` (`#64748B`) | `VAR:--text-muted` (aliases `VAR:--text-meta`); `VAR:--text-tertiary` (`HSL:hsl(var(--text-tertiary))`) | `#9CA3AF`; `#A1A1AA` | `--text-muted` is explicitly an alias of `--text-meta`, so `--text-meta` is selected as the primary **resolved** color. Hard-coded light grays show up as additional muted text options (legacy). |
| text-inverse | `#FFFFFF` | `TW:text-white`; `VAR:--button-primary-text` (`#ffffff`); `rgba(255,255,255,0.9)`; `#F3F4F6` | — | Primary is plain white. Other whites/off-whites are acceptable variants depending on contrast needs (e.g., softened inverse). |
| text-link / brand | `#155DFC` (`VAR:--brand-blue`) | `VAR:--color-brand-accent` (`#2563EB`); `#2563EB`; `#3B82F6`; `#466EFF`; `#1D4ED8`; `#0F4ED1` | — | The source map explicitly notes **heavy usage** of `#155DFC` across app pages, so it is chosen as primary. The remaining blues are treated as variants (not enough evidence in the input to label any single one as “wrong”, only that mixing exists). |

---

## 2. Background Roles

| Role | Primary | Variants | Legacy | Notes |
| --- | --- | --- | --- | --- |
| bg-app | `VAR:--env-base` (`#F6F7F9`) | — | — | Primary page/environment background per usage notes. |
| bg-surface | `VAR:--canvas-base` (`#FFFFFF`) | `VAR:--layer-1-bg` (`#FFFFFF`); `VAR:--layer-2-bg` (`#FAFBFC`); `VAR:--structural-gray` (`#F2F3F5`); `VAR:--structural-gray-rail` (`#EEF0F2`); `VAR:--structural-gray-ticket` (`#F8F9FA`); `TW:bg-white`; `TW:bg-neutral-50`; `TW:bg-neutral-100`; `TW:bg-neutral-200`; `#FAFAFA`; `#F8FAFC` | — | Primary is the canonical named surface base (`--canvas-base`). Other near-whites are used for elevation/context layers (variants). |
| bg-surface-hover | `VAR:--layer-2-hover-bg` (`#F4F5F7`) | `rgba(0,0,0,0.02)`; `rgba(0,0,0,0.04)`; extension `VAR:--bg-surface-hover` (`rgba(0,0,0,0.06)` / `rgba(255,255,255,0.08)`) | — | Primary is the explicit tokenized hover background for app. Inline alpha blacks and extension hover token are treated as variants; the source map notes hover behavior differs between app vs extension (see Interaction Model). |
| bg-selected | `.selection-highlight` (`rgba(70, 110, 255, 0.12)`) | — | — | Only explicit selected highlight recorded in the source map. |
| bg-overlay / scrim | `.echly-modal-overlay` (`rgba(15, 23, 42, 0.48)`) | `VAR:--voice-capture-dim-bg` (`rgba(0,0,0,0.52)` light / `rgba(0,0,0,0.62)` dark) | — | Primary chosen because it is the explicit modal overlay class called out. Voice-capture dim backgrounds are variants for that specific portal context. |
| bg-glass | `VAR:--glass-1-bg` (`rgba(255,255,255,0.7)`) | `VAR:--glass-voice-capture-bg` (`rgba(255,255,255,0.98)` light / `rgba(20,20,20,0.98)` dark); extension `VAR:--bg-surface` (`rgba(0,0,0,0.04)` light / `rgba(30,32,40,0.65)` dark) | — | Primary is the general-purpose “glass-1” background. Voice-capture glass and extension semi-transparent surface are variants by context. |

---

## 3. Border Roles

| Role | Primary | Variants | Legacy | Notes |
| --- | --- | --- | --- | --- |
| border-default | `VAR:--border` (`hsl(var(--border))`) | `VAR:--border-default` (`rgba(0,0,0,0.08)`); `VAR:--border-subtle` (`rgba(0,0,0,0.08)` light / `rgba(255,255,255,0.08)` dark); extension `VAR:--border-subtle` | — | Primary is `--border` because it is established globally via `* { border-color: hsl(var(--border)); }` per the source notes. Other default/subtle tokens are variants for specific themes/contexts. |
| border-strong | `#E5E7EB` | `#D1D5DB`; `VAR:--layer-1-border` (`rgba(0,0,0,0.045)`); `VAR:--layer-2-border` (`rgba(0,0,0,0.045)`) | — | Primary chosen as the most explicit “strong” border gray; other grays and very subtle elevation-outline alphas are variants (input doesn’t provide enough to label them as legacy vs intentional). |
| border-focus / ring | `VAR:--color-primary-ring` (`rgba(26,86,219,0.35)`) | `VAR:--accent-operational` (`#1a56db`); `VAR:--ai-accent-ring` (`rgba(26,86,219,0.28)`); extension `VAR:--input-border-focus` (`rgba(0,0,0,0.2)` / `rgba(255,255,255,0.2)`) | — | Primary is the explicit ring token used in app focus-visible rings per source notes. Other focus border/ring options are variants across app/AI/extension contexts. |

---

## 4. Accent Roles

| Role | Primary | Variants | Legacy | Notes |
| --- | --- | --- | --- | --- |
| accent-primary | `VAR:--color-primary` (`#1a56db`) | `VAR:--accent` (aliases `--color-primary`); `VAR:--accent-operational` (`#1a56db`); `VAR:--button-primary-bg` (`#155dfc` / `#155DFC`); `VAR:--color-semantic-system` (`#2563EB`) | — | Primary chosen as the canonical app token (`--color-primary`) and its direct alias (`--accent`). The source map explicitly calls out a split between app vs extension primary blues; extension-oriented button background is treated as a variant (not marked conflict here because it is still “primary CTA” in that environment). |
| accent-hover | `VAR:--color-primary-hover` (`#1648b8`) | — | — | Only explicit hover color token recorded for primary accent. |
| accent-active | `VAR:--color-primary-ring` (`rgba(26,86,219,0.35)`) | `VAR:--accent-operational-border` (`rgba(26,86,219,0.25)`) | — | Source notes state active emphasis often manifests as ring/border glow rather than a distinct fill; ring token is selected as primary. |

---

## 5. State Roles

| Role | Primary | Variants | Legacy | Notes |
| --- | --- | --- | --- | --- |
| success | `VAR:--color-semantic-success` (`#059669`) | `VAR:--color-success` (`#0d9488`) | — | Primary selected as the explicit “semantic” success token; the additional success green is a variant pending consolidation (source notes these may diverge visually). |
| error | `VAR:--color-semantic-danger` (`#DC2626`) | `VAR:--color-danger` (`#b91c1c`); `VAR:--color-alert` (`#ef4444` / `#EF4444`); `#FF4D4F` | — | Primary selected as the explicit “semantic” danger token. Other reds are treated as variants because the input only indicates overlap/mixing (not which ones are wrong). |
| warning | `VAR:--color-semantic-attention` (`#D97706`) | extension `VAR:--color-warning` (`#F59E0B`) | — | Primary selected from the app semantic attention token; extension warning token is a variant used in extension context. |

---

## 6. Role Collisions

These are cases explicitly supported by the source map where **the same exact color (or effectively the same value) is used across roles**, risking meaning confusion.

- ⚠️ **ROLE COLLISION**: `#155DFC`
  - **Text role**: `text-link / brand` primary is `#155DFC` (`VAR:--brand-blue`)
  - **Accent role**: also appears as `VAR:--button-primary-bg` (`#155dfc` / `#155DFC`) under `accent-primary`
  - **Risk**: link/brand accent vs primary CTA background become visually conflated (explicitly called out in observations).

- ⚠️ **ROLE COLLISION**: `rgba(0,0,0,0.04)` (and nearby alpha blacks)
  - **Background role**: appears as a surface treatment in extension `VAR:--bg-surface` (`rgba(0,0,0,0.04)` light)
  - **Interaction role**: also appears as `bg-surface-hover` (`rgba(0,0,0,0.04)`)
  - **Risk**: “surface” vs “hover affordance” can collapse into the same visual cue (explicitly called out as overloaded alpha blacks).

---

## 7. Interaction Model

This section extracts hover/active/selected behavior **as evidenced** in the source map and flags inconsistencies.

- **Hover**
  - **App (tokenized)**: `bg-surface-hover` → `VAR:--layer-2-hover-bg` (`#F4F5F7`); `accent-hover` → `VAR:--color-primary-hover` (`#1648b8`)
  - **App (inline alphas)**: hover also implemented via `rgba(0,0,0,0.02)` / `rgba(0,0,0,0.04)` in places
  - **Extension**: hover described as “primarily expressed via shadows/opacity changes” and also has `VAR:--bg-surface-hover` (`rgba(0,0,0,0.06)` / `rgba(255,255,255,0.08)`)
  - **Inconsistency**: hover is sometimes a dedicated token (`--layer-2-hover-bg`) and sometimes inline alpha; extension relies more on shadows/opacity than a single shared hover token.

- **Active**
  - **App**: active emphasis “often shows as ring/border glow” using `VAR:--color-primary-ring` (`rgba(26,86,219,0.35)`) and `VAR:--accent-operational-border` (`rgba(26,86,219,0.25)`)
  - **Extension**: active/glow can be based on `--button-primary-bg` per notes (glow shadows)
  - **Inconsistency**: app active is ring/border token-driven; extension active is partially shadow/glow-driven and may be based on a different primary blue source.

- **Selected**
  - **Explicit**: `bg-selected` uses `.selection-highlight` (`rgba(70, 110, 255, 0.12)`)
  - **Inconsistency**: source notes broader “selected row” semantics are mixed (sometimes hover color, sometimes dedicated selected styling); the only concrete selected value recorded is the onboarding selection highlight.

---

## 8. Cleanup Priority

Priorities are derived only from conflicts and overloads explicitly called out in the source map.

- **High priority**
  - **`#155DFC` collision (link/brand vs primary CTA background)**: split link color vs button fill semantics to avoid conflating link and CTA.
  - **Error red fragmentation**: `#DC2626` vs `#b91c1c` vs `#EF4444` vs `#FF4D4F` are overlapping (source calls out split).

- **Medium priority**
  - **Hover implementation split**: consolidate hover affordance away from inline alpha blacks (`rgba(0,0,0,0.02/0.04)`) toward a single token model where possible.
  - **Success divergence**: reconcile `#059669` vs `#0d9488` to a single semantic success.

- **Low priority**
  - **Near-white surface variants**: multiple background whites/grays exist for elevation/context; these are likely intentional variants but could be simplified once elevation model is finalized.

