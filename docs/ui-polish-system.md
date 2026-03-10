# Echly Dashboard — UI Polish System

> **Purpose:** Visual polish layer for the Echly dashboard. Premium SaaS quality (Linear, Vercel, Stripe, Notion). Calm, precise, high-end. No new features; no backend changes.

---

## 1. Typography Scale

Use a **single consistent scale** across all dashboard components.

| Role | Size | Weight | Line height | Usage |
|------|------|--------|-------------|--------|
| **Page title** | 20px | 600 (semibold) | 1.25 | Command Center, Session title, Insights |
| **Section title** | 16px | 600 (semibold) | 1.35 | Section headings (Critical Issues, Needs Attention) |
| **Card title** | 14px | 600 (semibold) | 1.4 | Card headings, ticket titles, list item titles |
| **Body text** | 13–14px | 400 (regular) | 1.5 | Descriptions, list content |
| **Metadata** | 12px | 400 or 500 | 1.4 | Timestamps, counts, labels (muted color) |
| **Micro label** | 12px | 500–600 | 1.35 | Uppercase section labels, badges (tracking 0.06em) |

**Rules:**
- Avoid mixing font sizes outside this scale (e.g. no random 15px or 11px unless matching metadata).
- Section titles: prefer **16px semibold** over 12px uppercase for primary sections; use 12px uppercase only for small labels (e.g. "All Sessions" above grid).
- Body: 13px for dense lists, 14px for paragraphs.

**CSS / Tailwind mapping:**
- Page title: `text-[20px] font-semibold leading-[1.25] tracking-[-0.02em]`
- Section title: `text-[16px] font-semibold leading-[1.35] tracking-[-0.01em]`
- Card title: `text-[14px] font-semibold leading-[1.4]`
- Body: `text-[13px]` or `text-[14px]` with `leading-[1.5]`
- Metadata: `text-[12px] text-[hsl(var(--text-muted))]` or `text-[hsl(var(--text-tertiary))]`
- Micro label: `text-[12px] font-medium uppercase tracking-[0.06em] text-[hsl(var(--text-tertiary))]`

---

## 2. Spacing System

**Scale:** 4px, 8px, 12px, 16px, 24px, 32px

| Token | Value | Usage |
|-------|--------|--------|
| `--space-1` | 4px | Tight inlines, icon gaps |
| `--space-2` | 8px | Small UI spacing (icon + label, list item padding) |
| `--space-3` | 12px | In-card gaps, between label and content |
| `--space-4` | 16px | Standard component padding, card padding |
| `--space-6` | 24px | Section spacing, block margins |
| `--space-8` | 32px | Large section spacing |

**Rules:**
- **Small UI spacing:** 8px (e.g. between icon and text, button padding).
- **Standard component padding:** 16px (cards, panels, list items horizontal).
- **Section spacing:** 24px–32px between sections; 24px between section title and content.
- Avoid cramped layouts: minimum 8px between interactive elements; 12–16px between content blocks inside a card.
- Every panel/card: **consistent internal padding** (e.g. 16px).

**Tailwind:** Prefer `p-4` (16px), `gap-3` (12px), `gap-4` (16px), `mb-6` (24px), `mb-8` (32px).

---

## 3. Card and Panel Design

Panels should feel **lightweight and structured**, not heavy.

- **Background:** Surface color (`--layer-1-bg` or `--layer-2-bg` for inner cards).
- **Border:** Subtle, 1px (`--layer-1-border`). Avoid heavy or double borders.
- **Border radius:** 8px–10px for cards and inputs; 10px–12px for panels (e.g. `rounded-xl` = 12px).
- **Shadow:** Minimal elevation. Use `--shadow-level-1` or `--shadow-level-2`; avoid large drop shadows.
- **Hover:** Slight background change (`--layer-2-hover-bg`), 150–200ms transition. Optional very subtle border darkening.

**Applies to:**
- Command Center section containers and inner cards
- Ticket Inspector container
- Screenshot Inspector container
- Session cards (WorkspaceCard)
- Comment panel

**Do not:** Heavy shadows, thick borders, multiple border colors.

---

## 4. Visual Hierarchy

Establish hierarchy with:
- **Font weight** (semibold for titles, regular for body)
- **Spacing** (more space before/after section titles)
- **Muted text color** (`--text-tertiary` or `--text-muted`) for metadata and secondary info
- **Subtle separators** only when necessary (e.g. 1px border between header and body)

**Prefer:** Section title → space → cards.  
**Avoid:** Section title → thick divider → cards. Use spacing instead of dividers where possible.

---

## 5. Interaction Feedback

- **Hover:** Background change to `surface-hover` (e.g. `--layer-2-hover-bg`). Duration 150–200ms, ease-out.
- **Clickable elements:** Slight background on hover; no dramatic scale unless it’s a primary CTA.
- **Cards (clickable):** Hover = subtle background + optional very light border change.
- **Ticket list items:** Hover highlight; selected = subtle background highlight (e.g. same hover bg).
- **Buttons:** Existing primary/secondary styles; keep transitions 150–200ms.

---

## 6. Micro-Animations

- **Duration:** 150ms–220ms (prefer 150ms for hovers, 200ms for panel open/close).
- **Easing:** `ease-out` or `cubic-bezier(0.16, 1, 0.3, 1)`. Use existing `--motion-ease-out` and `--motion-duration-fast`.
- **Panel open / modal open:** Fade + slight translate (e.g. translateY 4px → 0). No bounce.
- **Comment panel slide:** Slide from right, 200ms ease-out.
- **Hover transitions:** background-color, border-color, box-shadow; 150ms.

Animations should feel **fast and light**. Avoid dramatic motion.

---

## 7. Screenshot Inspector

- **Zoom:** Smooth zoom transitions (150–200ms).
- **Pan:** Cursor change when panning (e.g. grab/grabbing).
- **Expanded overlay:** Subtle darkened background (e.g. rgba(0,0,0,0.4) or similar).
- **Pins:** Slight scale or opacity change on hover (e.g. 150ms); clearly visible but not distracting.

---

## 8. Ticket List

- Each ticket item: **clear title** (14px semibold or 13px medium), **status indicator** (pill or dot), **timestamp** (12px muted).
- **Hover:** Row highlight (background `--layer-2-hover-bg`).
- **Selected:** Subtle background highlight (same or slightly stronger than hover).
- Consistent vertical rhythm (e.g. 8px or 10px padding per row).

---

## 9. Command Center

- **Sections:** Section title (16px semibold preferred, or 12px uppercase for small labels) → 24px spacing → card grid.
- **Card grid:** Consistent alignment; gap 12px or 16px.
- **Limit items:** Critical Issues max 3–5; other sections max 5 items where applicable.
- Avoid clutter: whitespace and alignment over density.

---

## 10. Iconography

- **Size:** 16px–18px for inline icons (e.g. Lucide default 24, use `h-4 w-4` or `h-[18px] w-[18px]`).
- **Style:** Simple, thin stroke (1.5–2px). Consistent across dashboard (Lucide recommended).
- Avoid mixing icon sets or weights.

---

## 11. Empty States

- Short explanation line (13–14px, muted).
- Optional primary or secondary action button.
- Example: "No feedback captured yet. Use the Echly extension to start a session."
- Centered or left-aligned in container; comfortable padding (24px).

---

## 12. Loading States

- **Skeleton loaders** for: session list, ticket list, screenshot area.
- Use existing pulse/shimmer; avoid blank content while loading.
- Skeleton shape and spacing should match final content (e.g. same padding, same number of lines).

---

## 13. Responsive Behavior

- **Ticket list:** Collapses or becomes drawer on small screens.
- **Timeline:** Can become horizontal on narrow viewports.
- **Comment panel:** Overlays main content on mobile; slide-in from right.
- **Command Center:** Sections stack; grid columns reduce (e.g. 1 col on mobile, 2–3 on tablet).

---

## 14. Design Consistency Checklist

- [ ] Consistent spacing (4/8/12/16/24/32px).
- [ ] Consistent typography (page 20px, section 16px, card 14px, body 13–14px, metadata 12px).
- [ ] Consistent card styles (radius 8–10px, subtle border, light shadow).
- [ ] Consistent hover behavior (150–200ms, surface-hover).
- [ ] No component visually out of place (same border radius family, same shadow level).

---

## Implementation Reference

- **Design tokens** (motion, spacing, radius) live in `app/globals.css` (`:root` and `@theme`).
- **Dashboard-specific** utility classes can be added in `globals.css` (e.g. `.dashboard-section`, `.dashboard-card`) or applied via Tailwind using the same tokens.
- **Component-level:** Prefer Tailwind classes that reference CSS variables (`var(--layer-2-hover-bg)`, `var(--motion-duration-fast)`) so one source of truth drives the whole UI.
