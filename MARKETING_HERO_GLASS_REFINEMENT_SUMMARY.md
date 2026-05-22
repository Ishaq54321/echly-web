# Marketing Hero — Premium Glass Refinement

Purely-CSS visual pass on the **hero demo only** (`HeroCaptureDemo`). No behavioral,
positional, or architectural changes. The session-view demo
(`(marketing)/_components/demos/session/`) was **not** touched.

**File touched:** `app/(marketing)/_styles/marketing.css` (only). No JSX edits were
needed — every element already exposes a stable class and no inline style overrode
what we changed.

**Build:** `npx next build` — clean.

---

## State going in (what was already done)

Two of the prompt's assumptions were already partly true in the v10 CSS, so the work
was reconciliation, not a from-scratch apply:

- **`saturate(140%)` already shipped** on the white-glass token (`--glass-blur:
  blur(28px) saturate(140%)`, used by the tray + capture pill) and on the dark
  SessionControlPanel bar (`blur(24px) saturate(140%)`). Fix 3b / Fix 4 were
  therefore mostly already in place; I extended the dark bar's blur to 28px and
  layered the surfaces below.
- **The faux-site already had an `::after` scrim**, but it was a **cool-ink slate**
  (`rgba(15,23,42,…)`) added in v10 to seat the page behind the crisp UI. That works
  *against* the prompt's "fuse toward the page tone" goal — slate pulls the page
  away from the warm `#FAF9F7` canvas. I **replaced** it with the warm cream wash
  (see Fix 1).

---

## Fix 1 — Atmospheric warm haze (recession via tint)

`.marketing-root .hcd-faux::after` — replaced the cool slate scrim with a warm cream
wash in the page-background tone (`#FAF9F7`), at the three capture states.

**Before**
```css
.hcd-faux::after { background: rgba(15, 23, 42, 0.05); }            /* idle */
.hcd.is-capturing .hcd-faux::after { background: rgba(15, 23, 42, 0.07); }
.hcd.is-modal .hcd-faux::after     { background: rgba(15, 23, 42, 0.09); }
```

**After**
```css
.hcd-faux::after {
  z-index: 1;
  background: linear-gradient(180deg,
    rgba(248, 247, 245, 0.35) 0%,
    rgba(248, 247, 245, 0.50) 50%,
    rgba(248, 247, 245, 0.40) 100%);
}
.hcd.is-capturing .hcd-faux::after { /* 0.42 / 0.58 / 0.48 */ }
.hcd.is-modal .hcd-faux::after     { /* 0.50 / 0.66 / 0.56 */ }
```

The wash still deepens a half-step on capture → modal (preserving v10's intentional
depth-step feel), but now toward the warm page tone instead of cool slate.

**Z-index ordering (verified):** the haze lives on `.hcd-faux::after` with
`z-index:1`. `.hcd-faux` establishes its own stacking context (`opacity:0.78` +
`filter:blur`), so the `z-index:1` is local — it sits **above** the `<FauxSite>`
content but the whole `.hcd-faux` layer still sits **below** `.hcd-annote-layer`
(`z-index:2`). Ordering is therefore faux site → haze → Annote elements, exactly as
required. No change to the layer system was needed.

## Fix 2 — Multi-layer shadows (real elevation)

Applied the ambient → mid → far cast + inner-top white highlight pattern. The
inner-top `inset 0 1px 0 rgba(255,255,255,X)` is the "premium glass not cheap frost"
detail — high opacity on light surfaces, low on dark.

**Tray** — `.hcd-tray-anchor .echly-v2 .pill-tickets`
```css
/* before: 3-layer, no inner highlight */
box-shadow:
  0 24px 48px -16px rgba(15,23,42,0.18),
  0 8px 16px -4px rgba(15,23,42,0.08),
  0 0 0 1px rgba(15,23,42,0.04);
/* after */
box-shadow:
  0 1px 3px rgba(15,23,42,0.04),
  0 8px 16px -4px rgba(15,23,42,0.08),
  0 24px 48px -16px rgba(15,23,42,0.16),
  inset 0 1px 0 rgba(255,255,255,0.6),   /* ← leading-edge light */
  0 0 0 1px rgba(15,23,42,0.04);
```

**SessionControlPanel (dark)** — `.echly-sc-root .sc-bar`
```css
/* after — white inset at low (0.10) opacity for dark glass */
box-shadow:
  inset 0 1px 0 rgba(255,255,255,0.10),
  0 8px 24px rgba(0,0,0,0.32),
  0 24px 48px -16px rgba(0,0,0,0.24);
```

**EditModal card** — `.echly-v2 .editor-overlay`
```css
/* after */
box-shadow:
  0 1px 3px rgba(15,23,42,0.06),
  0 16px 32px -8px rgba(15,23,42,0.12),
  0 32px 64px -24px rgba(15,23,42,0.24),
  inset 0 1px 0 rgba(255,255,255,0.8);
```

**Speech caption** — `.speech-caption` (shadow part)
```css
/* before: box-shadow: 0 8px 24px rgba(0,0,0,0.08); */
/* after */
box-shadow:
  0 4px 12px rgba(15,23,42,0.05),
  0 12px 24px -8px rgba(15,23,42,0.10),
  inset 0 1px 0 rgba(255,255,255,0.7);
```

The capture pill (`.echly-pill-content`) was left on its existing v8 demo shadow — it
was not in the prompt's element list and already reads as elevated.

## Fix 3 — Glass material upgrade (light surfaces)

Gradient surface (opaque-at-top → transparent-at-bottom) + white-tinted border.
Backdrop `saturate(140%)` was already present on both targets via tokens.

**Speech caption** — `.speech-caption`
```css
/* before */
background: rgba(255,255,255,0.95);
backdrop-filter: blur(20px);
border: 1px solid rgba(0,0,0,0.05);   /* dark — read as PNG edge */
/* after */
background: linear-gradient(180deg,
  rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.65) 100%);
backdrop-filter: blur(24px) saturate(140%);
border: 1px solid rgba(255,255,255,0.5);   /* white — light on the edge */
```

**Tray** — demo-scoped `.hcd-tray-anchor .echly-v2 .pill`
```css
/* added (overrides the shared --glass-surface / --glass-border for the demo only) */
background: linear-gradient(180deg,
  rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.65) 100%);
border-color: rgba(255,255,255,0.5);
```
The tray's backdrop saturation is already in `--glass-blur`, and its top-edge light
highlight is already painted by `.pill::before` — so only the gradient + border were
needed. Scoped to `.hcd-tray-anchor` so the forklifted shared tokens stay untouched.

## Fix 4 — Dark glass saturation

`.echly-sc-root .sc-bar` blur 24px → **28px**, `saturate(140%)` kept. Combined with the
Fix 2 shadow above.

---

## Judgment calls / divergences from the prompt (flagged)

1. **Cool scrim → warm wash on the faux site.** The prompt's Fix 1 assumed a flat
   `.faux-site-layer` with no overlay. The real demo already had a *cool slate*
   `::after` scrim. The two can't coexist on one pseudo-element, and the cool scrim
   contradicts the prompt's stated goal of fusing toward the warm page tone — so I
   replaced it. If the v10 cool-ink seating was deliberate and wanted, this is the
   one place to revisit.

2. **EditModal card kept opaque (Fix 3 *not* applied to it).** Fix 3 lists the modal
   among "all light-surface glass," but the modal **card** is an intentionally opaque
   `var(--surface)` panel — the *backdrop* (`.editor-overlay-backdrop`) is the frosted
   glass. Giving the card a translucent gradient + `saturate` would let the page bleed
   through a modal, which reads as a regression, not a refinement. So the modal got
   the Fix 2 multi-layer shadow + inner-top highlight (its glass cue), but kept its
   opaque surface. Easy to change if see-through-modal is actually wanted.

3. **Class names differ from the prompt's placeholders:** tray = `.pill-tickets`
   (within `.echly-v2`), SessionControlPanel = `.sc-bar` (within `.echly-sc-root`),
   modal = `.editor-overlay`, caption = `.speech-caption`. All confirmed by reading the
   component JSX + the CSS.

---

## Browser compatibility (backdrop-filter saturation)

- Every `backdrop-filter` that was touched or added has a matching
  `-webkit-backdrop-filter` line (Safari ≤ 17 / older WebKit). Both glass targets
  already followed that convention; the SC bar already had the webkit pair.
- `backdrop-filter: blur() saturate()` (multi-function) is supported in all current
  Chrome / Edge / Firefox / Safari. Where unsupported, the element falls back to its
  translucent/gradient background with no blur — still legible, just flatter.
- `prefers-reduced-motion` paths are unaffected (these are static material changes,
  no animation added).

---

## What to look for when verifying

The single most important cue: **the inner-top white highlights**. On the tray, the
caption, and the modal you should see a thin bright line catching the top edge — that
line is the `inset 0 1px 0 rgba(255,255,255,X)`. If it's visible, the glass upgrade
landed. On the dark SC bar it's subtler (0.10 opacity) but should still read as a faint
lit lip along the top of the pill.

Background should now feel atmospheric and *warm* — receded and fused with the page
canvas via the cream haze — rather than a separate UI panel sitting behind a cool tint.

---

## Verification status

- `npx next build` — clean ✓
- CSS-only; no JSX touched ✓
- No positions / sizes / behaviors / mock data / interactions changed ✓
- Session-view demo untouched ✓
- Visual screenshot capture: not run in this pass (no live dev server driven here) —
  recommend a quick visual confirm of the inner-top highlights per the note above.
