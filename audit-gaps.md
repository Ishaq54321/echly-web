# Annote Design Audit — Gaps

What the code-grounded `DESIGN_AUDIT.md` could not answer. Use this list to scope a follow-up Claude Design session (with screenshots/Figma) or to answer inline before writing the next prompt.

---

## Sections fully missing from the code-grounded audit

### Section 7 — Full Capture Flow, frame by frame
The single biggest gap. Code reveals component composition (mic orb, confirmation card, region overlay, session control pill) but not the **sequence** users see. To complete Section 7, supply screenshots or screen recordings of:

- **Activation:** clicking the extension toolbar icon — what popup appears? what gets injected into the host page? does the cursor change?
- **Element selection:** hovering over a page element — does the highlight include a label/tag? what does the captured screenshot animation look like (flash, shrink-to-thumbnail, none)?
- **Voice input UI placement:** does the SessionFeedbackPopup appear at fixed-center or near the selected element? does the live transcript stream into view?
- **AI processing phase:** how long is it typically? does the confirmation card stream the title/description in word-by-word, or appear all at once?
- **Multi-capture session indicator:** how does the UI show "you've captured 3 tickets in this session so far"?
- **Ending a session + share-link generation:** how does the user end recording? what does the share modal look like immediately after ending?
- **Recipient (public) view:** what is actually hidden vs an internal view? a side-by-side comparison would resolve this.
- **Voice comments from recipients:** does this exist for unauthenticated viewers, or only signed-in members?

### Section 9 — Idealized Annote (marketing-grade picks)
Code can't answer "which existing screenshot is the strongest." Needs:

- Best dashboard state (empty vs populated vs multi-select)
- Best session detail (richest realistic data: assignee + priority + tags + screenshot pins + comments)
- Strongest single "hero" moment for marketing — the one frame that conveys the value prop instantly
- Any existing pitch-deck / social-post screenshots to use as a reference for "the version we already approved as marketable"

---

## Spot ambiguities within sections I did complete

### Visual identity (Section 1)
- Is the dashboard / extension font split (DM Sans vs Plus Jakarta Sans) intentional or accidental? Decision affects whether marketing standardizes on one.
- Are the `components/demo/*` files used in onboarding or on the marketing site? They contain motion patterns (arrow scale-repeats, highlight pulses) not used elsewhere — they might be the canonical "marketing motion language."

### Color (Section 2)
- Recording orb red palette (`#FF4D4F`, `#D9363E`, `#FF553D`, `#FF6A3D`) — is there an intended token? Status colors (`#34C29A`, `#FBBF24`, `#5B7CFF`) for the session control bar likewise.
- Does the dashboard ever support dark mode (`--text-on-dark` exists but tokens.css notes extension dark mode was removed pre-launch)?

### Components (Section 5)
- **Waveform bar count when actively recording:** the `v2-wave` keyframe drives 5 bars on the mode-tile decoration, but during actual voice recording the orb is the visualizer (audio-reactive ring). Which is shown in the moment the user is speaking? Both? Just the orb?
- **AI "Improve description" streaming visual:** is there a header pill ("AI is writing…") above the streaming text, or does the cursor + dimmed text appear silently?
- **`PageHeader.tsx`** has been deleted (uncommitted `git status` change) and `MobileAppHeader` was added. Feature parity between the two isn't visible from code — a before/after screenshot would clarify.
- **Onboarding** — `onboarding.css` is 1164 lines with browser mockups and a feature carousel. Screenshots would show whether marketing should reference onboarding as the "first impression" surface.

### Motion (Section 6)
- Confirmation card text assembly: does AI-structured ticket title/description type in character-by-character, slide in pre-formed, or fade in?
- Region capture "flash white" timing: 150ms is the code value, but is the flash *during* selection drag or *after* mouse-release?

### Inconsistencies (Section 8)
Open decisions that would let me sharpen the "what's canonical" call:
- Is `Button.tsx` variant=`primary` (dark fill `#15101F`) supposed to be the canonical primary, or should it become a "neutral primary" with a separate "brand primary" variant?
- Is the `--text-body` / `--text-secondary` duplication (both `#54495F`) intentional, or should one of them shift?
- Is the 14px radius (content card, extension cards, confirmation card, voice popup) meant to be added to the radius scale, or migrated to 12px/16px?

---

## What Claude Design specifically needs

To answer the above, attach in a new Claude Design conversation:

1. **Extension screenshots** — popup, in-page floating button (idle and expanded), session control pill (live + paused + ending states), region capture overlay (drag and post-capture), voice recording popover (recording and processing), confirmation card.
2. **Dashboard screenshots** — empty state, populated state (list + grid view), session row with hover/selected/multi-select states, "Shared with me" section.
3. **Session detail screenshots** — sticky header with all action buttons visible, full ticket detail with screenshot pins + comments + assignee, mobile tab layout.
4. **Settings + Activity** — workspace tab with members list, billing tab, activity feed with multiple event types.
5. **Public/shared view** — what a non-member sees when they open a shared link (with PublicViewerBanner visible) and the request-access page.
6. **Onboarding** — full flow, even if just 3–4 representative steps.
7. **Any Figma file with named components / variants** — would resolve the inconsistencies in Section 8 by showing what the team considers canonical vs in-flight.

With those, a Claude Design session can complete Sections 7 and 9 and confirm/refine Sections 1, 5, 8, 10 above.
