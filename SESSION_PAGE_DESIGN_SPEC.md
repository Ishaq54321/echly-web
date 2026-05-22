# Session Page Design Spec — Read-Only Deep Audit

**Status:** Binding reference for the Phase 2A session-view forklift. Read-only audit; no files were modified to produce this.
**Date:** 2026-05-22
**Companion to:** `EXTENSION_DESIGN_SPEC.md`

This document specifies the **real production session page** — `app/(app)/dashboard/[sessionId]` (and its public mirror `app/(public)/session/[sessionId]`) — at pixel level, so the marketing forklift can replace the bespoke `SessionsDetail` mockup with a faithful, populated copy. Every value here is cited to `file:line`. Where the audit prompt's assumptions diverge from the real UI, the divergence is called out explicitly (see **§11 Open Questions** and the ⚠️ callouts throughout).

---

## ⚠️ Five things that differ from the current mockup (read first)

The current mockup (`app/(marketing)/_components/sections/SessionsDetail.tsx`) is a **100% bespoke approximation** — no real components are forklifted. The real UI differs in five structural ways that the build must respect:

1. **No per-row status pills.** The sidebar groups tickets under two collapsible sections — **Open** and **Resolved** — each with a count. A row carries an *icon tile* (type-derived) on the left, not a status pill. (`SessionsDetail.tsx:78` renders `sd-status` pills; the real `TicketItem` has none.)
2. **No "3 viewing now" text.** Presence is an **amber-ringed avatar row** with *no count label* and *no pulsing dot* — just a static `0 0 0 2px var(--color-warning)` ring per avatar. (`SessionsDetail.tsx:84-91` invents the dot + text.)
3. **No purple highlight rectangle on the screenshot.** The captured element is marked by **speech-bubble pin markers** (24px SVG), draggable, numbered, that open comment threads — not a static rectangle. (`SessionsDetail.tsx:112` `sd-thumb-highlight`.)
4. **No page/browser/OS meta sub-row under the title.** That capture metadata lives **only in a tooltip** behind an `Info` badge on the screenshot. The header has no meta row. (`SessionsDetail.tsx:93-99`.)
5. **Three-column layout, not two.** Sidebar (346px) | center detail (1fr) | optional right Activity timeline (360px). The mockup has only list + detail.

---

## 1. Render Tree (Step 0)

**Production route is `app/(app)/dashboard/[sessionId]`.** The public share route `app/(public)/session/[sessionId]` is a thin wrapper that renders the *same* `SessionPageClient` with `isPublicRoute`. There is no separate "session page" component — both routes share one client.

```
app/(app)/dashboard/[sessionId]/page.tsx                       (server; awaits params)
  → SessionPageClient (client)                                 SessionPageClient.tsx:314
    ├── <ResolveToast>                                         :3912
    └── div.session-page-shell  (flex col, h-full, bg --surface-page)   :3916
        ├── <TopControlBar>      [desktop only, !isPublicRoute]         :3918
        │     ├── nav-panel toggle + logo
        │     ├── center search box ("Search tickets...")
        │     └── right: <PresenceAvatarRow> + Share/Copy pill + SessionActionsDropdown (⋯)
        │
        └── div  [flex col on mobile; CSS grid on md+]                  :3947
            grid-template-columns (desktop wide):
              '346px 1fr'          (default)
              '346px 1fr 360px'    (activity panel / thread open)        :3952-3954
            gap 14px, padding 0 14px 14px, transition 0.35s cubic-bezier(0.4,0,0.2,1)
            │
            ├── <aside> LEFT CARD  (bg --surface, rounded 14px, shadow-panel)  :3961
            │     └── <TicketList>                                     :3971  (operating-system/TicketList.tsx)
            │           ├── header row: workspaceName + "N Views" (Eye icon)
            │           ├── hero card (session title + "N tickets…" + Invite Team)
            │           ├── <section> Open  (collapsible)  → <TicketItem> × N
            │           └── <section> Resolved (collapsible) → <TicketItem> × N
            │
            ├── <section> CENTER CARD  (bg --surface, rounded 14px, shadow-panel)  :4019
            │     ├── <PendingAccessBanner>  [conditional]              :4030
            │     └── <main> (max-w-900px, centered, px-8 pt-11 pb-20)   :4032-4044
            │           └── renderExecutionContent():
            │                 ├── skeleton (loading)
            │                 ├── <CanvasEmptyState NoTicketsIllu> "No tickets yet"  :3810
            │                 └── <ExecutionView>                       :3819  (operating-system/ExecutionView.tsx)
            │                       ├── <SessionFeedbackHeader>          (session/FeedbackHeader.tsx)
            │                       └── div.main-content
            │                             └── <FeedbackContent>          (feedbackDetail/FeedbackContent.tsx)
            │                                   ├── attachment card → <ScreenshotWithPins> | <ScreenshotBlock>
            │                                   ├── <ActionItemsSection>  ("Description")
            │                                   ├── tags section (<Tag> × N)
            │                                   └── <CommentsSection> → <CommentItem> × N
            │
            └── <aside> RIGHT CARD  [conditional: selected + canResolve + panel open]  :4062
                  └── <TicketActivityPanel>  (system-event timeline)    :4072  (feedbackDetail/TicketActivityPanel.tsx)

        Mobile-only: <SessionMobileTabs> (captures / session / activity)  :4088
        Overlays: <ImageViewer> (screenshot fullscreen) :4160, DeleteSessionModal, RequestAccessModal,
                  TicketNavigator drawer (mobile), GlobalRail nav drawer, delete-ticket Modal
```

`FourZoneLayout` is **not** the top-level composition — it is dead code (see **§9**). The real composition is the inline CSS grid in `SessionPageClient.tsx:3947-4086`.

---

## 2. User Journey Narrative (Step 1)

**Page load.** The server component awaits `params` and renders `SessionPageClient` (`page.tsx:1-10`). The client fires a single `GET /api/session-page-bundle` (`USE_BUNDLE = true`, `SessionPageClient.tsx:119`) that returns the session doc + first page of feedback in one round-trip; results are cached module-level for 30s keyed by `sessionId::viewerId` so A→B→A tab navigation repaints instantly (`:132-157`). While the session doc is unresolved, the **sidebar hero card** and the **center execution view** each show shimmer skeletons (`TicketList.tsx:418-425`; `SessionPageClient.tsx:3760-3805`). View count is recorded server-side in the bundle GET (`:1913`) and as a fallback client-side via `recordSessionViewIfNew` (`:2030`).

**Initial selection.** No empty wait — selection is *derived during render* (`effectiveSelectedId`, `:1414-1434`): URL `?ticket=` wins, then prior `selectedId`, else **the first open ticket** (skipping resolved/processing), else the first ticket overall. So a fresh visitor lands directly on the first open ticket's detail. An empty session shows `<CanvasEmptyState>` "No tickets yet" in the center (`:3810`).

**Ticket navigation.** Clicking a row calls `trySwitchToTicket(id, commit)` (`:1441-1479`), which guards against losing an unsaved/streaming description edit (toasts "Unsaved changes" with a Discard action). On commit it sets `selectedId`, switches the mobile tab to "session", and strips any `?ticket=` param via `history.replaceState` (`:3980-3989`). The detail pane swaps content; the selected row gets `bg-[var(--brand-subtle)] text-[var(--brand)] font-semibold` (`TicketItem.tsx:42`). There is no slide animation on the row itself — the *mockup's* fade tween is bespoke; production swaps content instantly with the description editor's own guard.

**Screenshot interaction.** The screenshot sits in an attachment card. Hovering reveals corner buttons (Add comment / Edit / Expand). Clicking **Expand** opens a fullscreen `<ImageViewer>` (`:4159-4174`). In comment mode, clicking *on the image* drops a draft pin and opens a 420px compose popover (`ScreenshotWithPins.tsx:522-683`). Existing pins are draggable and numbered.

**Comments.** The thread lives in the **center pane** under the description (`CommentsSection`), not a side panel. A collapsed composer reading "Leave a comment..." expands on focus. Each root comment can be replied to (indented thread with a left hairline rule), reacted to (emoji picker), edited, deleted, or resolved.

**Status changes.** Resolve/Reopen is a button in the header action row (`FeedbackHeader.tsx:417-464`). Resolving flashes a success ring on the status badge (420ms) and shows a `ResolveToast`.

**Presence.** `usePresenceHeartbeat` (`:468-472`) writes the viewer's heartbeat; `PresenceAvatarRow` (in `TopControlBar`) renders other live viewers as amber-ringed 28px avatars, max 4 + "+N" chip. No text label, no pulse.

**Share / copy.** A merged brand-purple pill in the header: **Share** (opens ShareModal) + a divider + a **copy-link** icon button that copies `${origin}/session/${id}` and shows a `Check` for 2000ms (`TopControlBar.tsx:227-265`). External/anonymous viewers get `ExternalShareModal` with a monospace read-only URL field + "Copy" → "Copied!" (2000ms).

---

## 3. Sidebar Spec (Step 2) — `operating-system/TicketList.tsx` + `TicketItem.tsx`

### 3.1 Container
- Desktop width: **fixed `346px`** grid column (`SessionPageClient.tsx:3952-3954`).
- `<aside>`: `bg-[var(--surface)]` (#FFFFFF), `rounded-[14px]`, `boxShadow: var(--shadow-panel)` = `0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)` (`:3968-3969`).
- Inner: `flex flex-col h-full p-4` (16px padding) (`TicketList.tsx:352`).

### 3.2 Header row (workspace + views)
`flex items-center justify-between px-3 py-2` (`TicketList.tsx:354`):
- Left: workspace name — `text-[14px] font-semibold text-[var(--text-heading)] truncate` (`:355`).
- Right: views button — `inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-heading)]`, `<Eye size={14} strokeWidth={2}>` + "N Views" (`:357-363`). Tooltip lists named/anonymous viewers.

### 3.3 Hero card (session title block)
`mb-4 p-4 pb-3.5 rounded-[12px] relative overflow-hidden shrink-0` (`TicketList.tsx:368`), with inline:
```
background: radial-gradient(120% 110% at 100% 0%, rgba(90,73,191,0.10) 0%, rgba(90,73,191,0) 55%),
            linear-gradient(180deg, var(--brand-subtle) 0%, var(--surface-card) 100%);
border: 1px solid rgba(90,73,191,0.10);
```
- Title `<h3>`: `text-[18px] font-semibold text-[var(--text-heading)] tracking-[-0.012em] leading-[1.35] mb-1` (`:392`); editable inline (pencil on hover, `group-hover/title:text-[var(--brand)]`).
- Subtitle `<p>`: `text-[14px] text-[var(--text-secondary)] leading-[1.5] mb-3 max-w-[80%]` — copy: `"{N} ticket{s} in this session. Walk through, leave notes, resolve as you go."` (`:404-406`).
- Invite button (members only): `inline-flex items-center gap-1.5 h-8 px-4 rounded-[7px] bg-[var(--text-heading)] text-white text-[13px] font-semibold hover:bg-black`, `<UsersRound size={14}>` + "Invite Team" (`:408-415`).

### 3.4 Status sections (collapsible — this replaces per-row pills)
Scroll container: `h-full overflow-y-auto flex-1 min-h-0 pb-2 -mx-4 px-4` (`TicketList.tsx:440`).

Two `<section className="mb-4">` blocks — **Open** then **Resolved** (`:457`, `:524`). Each header is a button:
`w-full flex items-center gap-2 text-[14px] font-medium text-[var(--text-heading)] px-3 py-2 tracking-[-0.01em] hover:bg-[var(--surface-hover)] rounded-[var(--radius-sm)]` (`:465`):
- `<ChevronRight size={14}>` `text-[var(--text-tertiary)] transition-transform duration-200`, `rotate-90` when expanded (`:470-473`).
- Label "Open" / "Resolved" + a count `text-[var(--text-heading)] text-[14px] font-medium` (`:478`).
- Open/Resolved are **mutually exclusive** by parent state — opening one collapses the other (`SessionPageClient.tsx:614-632`).
- Row gap: `mt-1 space-y-0.5` (`:482`).

### 3.5 Ticket row — `TicketItem.tsx`
A single `<button>` (`TicketItem.tsx:36-64`):
```
tl-vrow group relative flex w-full items-center gap-2.5 text-left cursor-pointer
px-3 py-2.5 rounded-[7px] text-[14px] tracking-[-0.005em] transition-colors
focus-visible:ring-2 focus-visible:ring-[var(--brand)]/40
```
State classes (`:41-46`):
| State | Classes |
|---|---|
| **Selected** | `bg-[var(--brand-subtle)] text-[var(--brand)] font-semibold` |
| **Resolved (unselected)** | `text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]` |
| **Open (unselected)** | `text-[var(--text-heading)] hover:bg-[var(--surface-hover)]` |
| **New ticket** | adds `echly-new-ticket-highlight` (highlight animation) |

- **Icon tile** (left): `w-[30px] h-[30px] rounded-[var(--radius-sm)] grid place-items-center shrink-0` (`:49`):
  - Selected: `bg-[var(--brand)] text-white`
  - Resolved: `bg-[var(--color-success-bg)] text-[var(--color-success)]` + a checkmark SVG (13×13)
  - Open: `bg-[var(--surface-hover)] text-[var(--text-secondary)]` + a type-derived icon (`getTicketIconFromTags(tags, title)`, `:29`), `size={14} strokeWidth={2}`
- **Title**: `relative min-w-0 flex-1 truncate text-[14px] leading-[1.4]` (`:56`).
- There is **no index number, no status pill, no timestamp** on the row. (Index is derived only for the detail header's "N of M".)

### 3.6 Empty states
- Empty session → handled in the *center* pane, not the list (`TicketList.tsx:453-454`).
- All resolved → `<CanvasEmptyState NoOpenTicketsIllu>` "All tickets resolved" (`:504-509`).
- Search no-match → `<CanvasEmptyState TicketSearchEmptyIllu>` "No tickets match your search" (`:443-449`).
- Loading rows → `TicketListSectionLoading` skeleton: 8 rows, `tl-skel-row`, first row blue-tinted (`:85-99`).

---

## 4. Main Pane Spec (Step 3)

> ⚠️ The live header is **`components/session/FeedbackHeader.tsx`** (export `SessionFeedbackHeader`), imported by `ExecutionView.tsx:7`. The similarly-named `components/session/feedbackDetail/FeedbackHeader.tsx` is **dead** (different values; see §9). All header values below are from the live one.

### 4.0 ExecutionView wrapper
Root `div.flex-1 min-h-0 flex flex-col min-w-0` (`ExecutionView.tsx:180`) → `SessionFeedbackHeader` + `div.main-content.flex-1.min-h-0.overflow-y-auto.pr-4` (`:216`) → `FeedbackContent` (`:231`). Center column is constrained to `max-w-[900px] mx-auto` with `px-8 pt-11 pb-20` on desktop (`SessionPageClient.tsx:4044`).

### 4.1 Header zone — `session/FeedbackHeader.tsx`
Header container: `sticky top-0 z-20 shrink-0 bg-[var(--surface)] pt-0 px-0 pb-0` → inner `div.mb-6` (`:176`).

**Action button class constants** (`:24-37`) — all **34px tall, `rounded-[7px]`, `text-[13px] font-medium`, `gap-2 px-3.5`**:
- `actionBtn` (neutral outline): `border border-[var(--border)] bg-transparent text-[var(--text-heading)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)]`
- `actionBtnBlack`: `bg-[var(--brand)] text-white border border-[var(--brand)] hover:bg-[var(--brand-hover)]`
- `actionBtnResolve`: `bg-[var(--brand-subtle)] text-[var(--brand)] border border-[var(--brand-subtle)] hover:bg-[var(--brand-muted)]`
- `actionBtnActive`: `border border-[var(--border)] bg-[var(--surface-hover)] text-[var(--text-heading)]`
- `actionBtnDelete`: `h-[34px] w-[34px] border border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:text-[var(--color-danger)] hover:border-[var(--color-danger)]/30 hover:bg-[var(--color-danger-bg)]`

**Row 1 — eyebrow** `flex items-center gap-2.5 mb-3` (`:179`):
- Position pill: `text-[11.5px] font-medium text-[var(--text-secondary)] bg-[var(--surface-hover)] px-2.5 py-[3px] rounded-full tabular-nums` — copy `"{index} of {total}"` (`:180-184`).
- **StatusBadge** (`:39-63`): `inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[11.5px] font-semibold tracking-[-0.005em]`:
  - Resolved: `bg-[var(--color-success-bg)] text-[var(--color-success)]` + 1.5px success dot + "Resolved"
  - Open: `bg-[var(--brand-subtle)] text-[var(--brand)]` + brand dot + "Open"
  - In Progress: `bg-[var(--surface-subtle)] text-[var(--text-secondary)]`
  - Blocked: `bg-[var(--color-danger-bg)] text-[var(--color-danger)]`
  - Resolve-flash: when freshly resolved, wraps in `scale-105 ring-2 ring-[var(--color-success-border)] ring-offset-2` for 420ms (`:140-145, 188-189`).
- Impact label (if `impactScore`): `text-[11.5px] tabular-nums text-[var(--text-secondary)] font-medium` — "Impact {n}".

**Row 2 — title** (`:204-266`): `<h1>` and edit `<input>` both `text-[21px] font-semibold tracking-[-0.018em] leading-[1.25] text-[var(--text-heading)] m-0`. Display mode reveals a `<PencilLine size={16}>` that animates `w-0 → w-4`, `opacity-0 → 60%` on group hover (`:251-255`); `group-hover:text-[var(--brand)]`. Edit input is transparent/borderless with `focus:ring-2 focus:ring-[var(--brand)]` (`:206`). Enter commits, Escape cancels.

**Row 3 — actions** `flex flex-wrap items-center gap-2` (`:269`), default authed bar (`:417-556`), left→right: **Resolve/Reopen** (Reopen = neutral `RotateCcw`; Resolve = `actionBtnResolve` + `Check`), **Assign** dropdown (icon-only), **Priority** dropdown (icon-only — this is the priority indicator; no inline chip), **Activity** toggle (`CalendarCheck2`; `actionBtnActive` when open, icon turns `text-[var(--orange)]`), `flex-1` spacer, **Delete** (`actionBtnDelete`, 34×34, hidden < md, tooltip "Delete").

> ⚠️ **No meta sub-row** (page URL / browser / OS / captured-at) and **no created/updated line** exist in this header. That data is tooltip-only on the screenshot Info badge (§4.3).

### 4.2 Body — `feedbackDetail/FeedbackContent.tsx`
Root `div.content-wrapper.flex.flex-col.min-w-0` (`:142`). Vertical order: attachment card → Description → Tags → Comments.

**Attachment card** (only if screenshot or files, `:143-217`): `div.attachments.rounded-[14px].overflow-hidden.border.border-[var(--hair)]` with `shadow-[0_10px_30px_-16px_rgba(28,25,23,0.18)]` (`:145`). Renders `ScreenshotWithPins` when commenting enabled (`sendPinComment != null`), else `ScreenshotBlock` (`:147`). File links: `text-[14px] font-medium text-[var(--brand)] hover:underline`.

### 4.3 Screenshot viewer
**Shared dims:** **max-height `317px`, 16:9 aspect, background `var(--layer-2-bg)`** (`ScreenshotBlock.tsx:71`; `ScreenshotWithPins.tsx:416-433`). Image: `object-contain`, decode blur-up (`opacity-[0.88] blur-md` → `opacity-100 blur-0`, 300ms). Whole frame `hover:scale-[1.005]`.

**`ScreenshotBlock.tsx` (read-only variant):**
- Frame embedded: `rounded-lg overflow-hidden hover:scale-[1.005] group` (`:65`); standalone adds `border border-[var(--border)] shadow-[var(--shadow-sm)]`.
- Top gradient scrim `bg-gradient-to-t from-black/8` (`:104`).
- Corner buttons (white pills `bg-white/95 shadow-[var(--shadow-level-2)] p-3 rounded-xl`): **Edit** at `top-3 right-[3.75rem]` (`Pencil`), **Expand** at `top-3 right-3` (`ZoomIn`, `aria-label="Expand screenshot"`).
- **Info badge** at `top-3 left-3`: `h-7 w-7 rounded-full bg-black/55 text-white backdrop-blur-sm`, `<Info h-3.5 w-3.5>`, tooltip = page-area + device line + date line (`:128-139`). **This is the only place capture metadata appears.**

**`ScreenshotWithPins.tsx` (interactive variant):**
- Canvas `group relative overflow-visible rounded-lg max-h-[317px] bg-white` + `comment-mode-cursor` in comment mode (`:413-426`).
- **Pin markers** (`PinMarker`, `:95-209`): `PIN_SIZE_PX = 24`; speech-bubble SVG, `fill = isResolved ? var(--color-success) : var(--text-heading)`, `stroke="white" strokeWidth="1.5"`, `drop-shadow(0 2px 4px rgba(0,0,0,0.25))`. Positioned `left:{x}% top:{y}%` translate(-50%,-50%). Draggable; click opens thread; `animate-pin-pop` on creation; numbered `idx+1`. Hover tooltip `bg-[var(--text-heading)] text-white text-[12px] rounded`.
- **Hover action chips** (`HOVER_ACTION_CLASS`, `:37-38`): `h-9 w-9 rounded-md bg-black/60 text-white/90 ring-1 ring-white/10 backdrop-blur-sm hover:scale-105`. Normal mode: Add-comment `right-[100px]` (`MessageSquare`), Edit `right-[56px]` (`Pencil`), Expand `right-3` (`Expand`); all `opacity-0 group-hover:opacity-100 duration-200`.
- **Draft compose popover** (portaled, `:522-683`): `position:fixed`, `w-[420px]`, `rounded-2xl bg-white shadow-[var(--shadow-lg)]`, z `10050`. Avatar 28px + Tiptap editor "Add a comment...", toolbar (Emoji/Mention/Attach 18px icons), Cancel + brand **Comment** submit.

> ⚠️ **No purple rectangle.** Captured-element marking = pins only.

### 4.4 Description — `feedbackDetail/ActionItemsSection.tsx`
Heading `h2 text-[17px] font-semibold text-[var(--text-heading)] mb-3` = **"Description"** (`:55-59`); card `mt-12 mb-2` (48px gap above). Display mode wrapper (editable): `group relative ... cursor-pointer -mx-3 px-3 -my-2 py-2 hover:bg-[var(--surface-hover)] hover:translate-x-[3px] transition-all duration-[120ms]` (`:208-213`), pencil at `top-2 right-2` `opacity-0 group-hover:opacity-80`. Empty + read-only: `<p text-[15px] leading-[1.7] text-[var(--text-tertiary)]>` "No description". Renders `DescriptionMarkdown` (supports inline hex swatches).

> ⚠️ **No AI "auto-structured" badge** exists. The only AI-attributed value is `pageArea` (AI-detected page/section), tooltip-only on the Info badge.

### 4.5 Tags — `FeedbackContent.tsx:225-281` + `components/.../Tag.tsx`
Section `mt-12`, heading `text-[17px] font-semibold ...` = "Tags". Tags wrap with `gap-3` — **no "+N" overflow; all tags render**. Tag pill (`Tag.tsx:23-24`): `inline-flex items-center px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--hair)] text-[14px] font-medium text-[var(--text-body)]`. Remove = red floating `×` at `-top-2 -right-2` on hover. Add-tag button: dashed border, "+ Add tag".

### 4.6 Comments thread — `feedbackDetail/CommentsSection.tsx` + `components/comments/CommentItem.tsx`
Section `mt-12`, heading `text-[17px] font-semibold ...` = "Comments" (`CommentsSection.tsx:821-824`).

- **Row** (`CommentItem`): `flex gap-2.5 group/item`, root container `comment-row rounded-xl px-3 py-2`; no resting bg/border. Highlighted → `comment-row--highlighted` (pulse, §6).
- **Avatar** (`UserAvatar`): root `w-[30px] h-[30px]` (compact replies `w-[28px] h-[28px]`), always `rounded-full`. Photo or hashed-color initials (`getAvatarColor`), `text-white font-semibold text-xs`. Anonymous → grey `#E5E5E5`, letter "A".
- **Name**: `font-semibold text-discussion-title text-[14px] truncate` (color `var(--text-heading)`). No role label.
- **Timestamp**: `text-meta text-[12px]` (color `var(--text-tertiary)`). Format (`formatCommentDate`): `<1m`→"Just now", `<60m`→"{m}m ago", `<24h`→"{h}h ago", "Yesterday", "Today", else "MMM d".
- **Body**: `mt-1.5 leading-relaxed text-discussion-body font-normal text-[14px]`.
- **Mentions**: `.mention-chip` → `background: var(--brand-subtle); color: var(--brand); font-weight: 600; padding: 1px 6px; border-radius: 6px; font-size: 13px`.
- **Reactions**: pills `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] border`; mine = brand-subtle, others = surface-subtle.
- **Reply**: `<div className="ml-10 mt-1">` button `text-[13px] font-semibold ... hover:underline` "Reply". Reply thread indent: `ml-[19px] pl-[21px] border-l border-[var(--text-tertiary)]/20`. Replies render `size="compact"`.
- **Composer** (collapsed): `flex items-center gap-3 border border-[var(--hair-strong)] rounded-[var(--radius-md)] px-4 bg-white`, `minHeight: 56`, 26px avatar, placeholder "Leave a comment..." `text-[13.5px] text-[var(--text-tertiary)]`, three muted icons (AtSign/Smile/Paperclip). Expanded: Tiptap + submit `h-[34px] bg-[var(--brand)] text-white text-[13px] rounded-[var(--radius-btn)]` "Comment".
- **Empty**: if no comments and a composer is shown → just heading + composer (no "no comments yet" text); if no composer either → section returns `null` (`:816-818`).

---

## 5. Footer Spec (Step 4)

There is **no persistent footer bar** in the dashboard route. The mockup's `sd-share` bar maps to **the header Share/Copy pill** (dashboard) and **`ExternalShareModal`** (public viewers). Public route also has a fixed bottom **`PublicViewerBanner`**.

### 5.1 Header Share/Copy pill — `TopControlBar.tsx:227-265`
Pill: `flex items-center bg-[var(--brand)] rounded-[var(--radius-btn)] overflow-hidden hover:bg-[var(--brand-hover)]`, shadow `0 1px 0 rgba(255,255,255,0.2) inset, 0 1px 2px rgba(90,73,191,0.3)`.
- **Share** button: `flex items-center gap-1.5 h-[34px] px-3.5 text-white text-[13px] font-semibold`, `<UserPlus size={14}>` + "Share".
- Divider `w-[1.5px] self-stretch bg-white/50`.
- **Copy** button: `h-[34px] w-[36px] text-white hover:bg-white/10`, toggles `<Check>` / `<LinkIcon>` (size 14). Copies `${origin}/session/${id}`; **Copied state 2000ms** (`:129`).

### 5.2 ExternalShareModal — `components/share/ExternalShareModal.tsx` (the monospace URL one)
Card: `background:white; borderRadius:20; maxWidth:440; boxShadow:0 16px 48px rgba(0,0,0,0.14), …`.
- **URL field** (`:139-161`): `readOnly`, `flex:1; height:40; background:var(--surface-subtle); border:1px solid var(--border); borderRadius:10; padding:0 12px; fontSize:13; color:var(--text-secondary); fontFamily:"monospace"; userSelect:all`. Value = `window.location.href`.
- **Copy button** (`:162-191`): `height:40; padding:0 16px; borderRadius:10; fontSize:14; fontWeight:600; color:white`; bg toggles `copied ? var(--color-success) : var(--brand)`; icon `<Check>`/`<Copy>` 14px; label `copied ? "Copied!" : "Copy"`; **2000ms** (`:36`); `transition: background 0.15s`.

### 5.3 PublicViewerBanner — `components/session/PublicViewerBanner.tsx`
Fixed bottom strip: `position:fixed; bottom/left/right:0; z:40; background:#FFFFFF; borderTop:1px solid var(--border); boxShadow:0 -8px 32px rgba(0,0,0,0.08); padding:21px 40px`. Left: gradient `Lock` tile (38px) + `<p fontSize:15 fontWeight:600>` "Sign in to resolve & manage feedback". Right: brand "Sign in" button (`height:42`) + 32px dismiss `×`.

### 5.4 PendingAccessBanner — `components/session/PendingAccessBanner.tsx`
Inline top strip: `width:100%; height:48px; background:var(--surface-subtle); borderBottom:1px solid var(--border); padding:0 24px`. Left: `Clock` + "Your request is pending review". Right: `Mail` + "You'll be notified by email". All `font-medium 14px var(--text-secondary)`.

---

## 6. Animations Spec (Step 5) — verbatim from `app/globals.css`

**Ticket-selection / pane swap:** no keyframe — instant content swap guarded by the description editor (`SessionPageClient.tsx:1441`). The grid columns themselves animate when the activity panel opens: `transition: grid-template-columns 0.35s cubic-bezier(0.4,0,0.2,1)` (`:3957`). The right Activity panel enters with Tailwind `animate-in fade-in slide-in-from-right-4 duration-300` (`:4065`).

**Sidebar hover:** `transition-colors` only (`TicketItem.tsx:40`); section chevron `transition-transform duration-200` (`TicketList.tsx:472`).

**New-ticket highlight** (⚠️ duplicated; the globals.css blue version wins by cascade):
```css
/* app/globals.css:4101-4114 — WINS */
@keyframes echlyTicketHighlight {
  0%   { background-color: rgba(59, 130, 246, 0.18); }
  50%  { background-color: rgba(59, 130, 246, 0.12); }
  100% { background-color: transparent; }
}
.echly-new-ticket-highlight { animation: echlyTicketHighlight 1.2s ease-out; }
```
```css
/* styles/tokens.css:1083-1089 — overridden */
@keyframes echly-new-ticket-pulse {
  0%, 100% { background: var(--brand-subtle); }
  50%      { background: var(--brand-muted); }
}
.echly-new-ticket-highlight { animation: echly-new-ticket-pulse 600ms ease-out; }
```
> The blue `rgba(59,130,246,…)` is a palette leftover and does **not** match brand `#5A49BF`. For the forklift, prefer the brand-purple `echly-new-ticket-pulse` recipe.

**Pin pop** (on placement):
```css
/* app/globals.css:6421-6429 */
@keyframes pin-pop {
  0%   { transform: translate(-50%, -50%) scale(1); }
  40%  { transform: translate(-50%, -50%) scale(1.3); }
  100% { transform: translate(-50%, -50%) scale(1); }
}
.animate-pin-pop { animation: pin-pop 0.5s ease-out; }
```

**Pin radar ping:**
```css
/* app/globals.css:5883-5892 */
@keyframes echly-pin-pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1);   opacity: 0.6; }
  50%      { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
}
```

**Deep-link ticket flash:**
```css
/* app/globals.css:6431-6440 */
@keyframes ticket-border-glow {
  0%   { outline: 2px solid transparent; outline-offset: -2px; box-shadow: none; }
  30%  { outline: 2px solid var(--brand); outline-offset: -2px; box-shadow: 0 0 8px rgba(90, 73, 191, 0.25); }
  70%  { outline: 2px solid var(--brand); outline-offset: -2px; box-shadow: 0 0 8px rgba(90, 73, 191, 0.25); }
  100% { outline: 2px solid transparent; outline-offset: -2px; box-shadow: none; }
}
.ticket-border-animate { animation: ticket-border-glow 1s ease-in-out forwards; }
```

**Comment highlight pulse** (mention deep-link):
```css
/* app/globals.css:6456-6463 */
@keyframes comment-highlight-pulse {
  0%   { background: color-mix(in srgb, var(--brand) 14%, transparent); }
  100% { background: transparent; }
}
/* .comment-row--highlighted { animation: comment-highlight-pulse 2s ease-out; }  :6452 */
```

**Activity row enter:**
```css
/* app/globals.css:354-363 */
@keyframes activity-feed-row-enter {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* .activity-feed-row-enter { animation: activity-feed-row-enter 160ms ease-out forwards; opacity: 0; }  :365 */
```

**Resolve toast:**
```css
/* app/globals.css:327-330 */
@keyframes resolveToastIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

**Skeleton shimmer** (sidebar/center loading):
```css
/* app/globals.css:9941-9944 */
@keyframes echly-skeleton-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```
`.skel-block` (#F5F3F0-ish base → white highlight), `.skel-blue` (brand 6%→10%→6%), `.skel-blue-strong` (10%→18%→10%), all `background-size:200% 100%; animation: echly-skeleton-shimmer 1.8s ease-in-out infinite; border-radius:6px`. Logo skeletons use `brand-logo-shimmer 1.5s ease-in-out infinite`.

**Copy-link "Copied" timing:** 2000ms everywhere (`TopControlBar.tsx:129`, `ExternalShareModal.tsx:36`, `useShareController.ts:386`). The mockup already matches (`SessionsDetail.tsx:36`).

---

## 7. Color + Typography Tables (Step 6)

### 7.1 Colors (resolved from `styles/tokens.css`)

| Element | Token | Resolved value | Source |
|---|---|---|---|
| Page background | `--surface-page` | `#FAF9F7` | tokens.css:56 |
| Panel/card surface | `--surface` | `#FFFFFF` | tokens.css:55 |
| Card subtle | `--surface-card` | `#FAFAFA` | tokens.css:57 |
| Row hover | `--surface-hover` | `#FAFAF7` | tokens.css:59 |
| Subtle fill | `--surface-subtle` | `#F5F5F5` | tokens.css:58 |
| Brand | `--brand` | `#5A49BF` | tokens.css:9 |
| Brand hover | `--brand-hover` | `#4A3BA0` | tokens.css:11 |
| Brand subtle (selected row bg) | `--brand-subtle` | `#F0ECFB` | tokens.css:12 |
| Brand muted | `--brand-muted` | `#DCD5F0` | tokens.css:13 |
| Heading / ticket title | `--text-heading` | `#15101F` | tokens.css:46 |
| Body / secondary text | `--text-body` / `--text-secondary` | `#54495F` | tokens.css:47-48 |
| Tertiary / meta | `--text-tertiary` | `#8A8096` | tokens.css:50 |
| Placeholder | `--text-placeholder` | `#B5AEBE` | tokens.css:51 |
| Border | `--border` | `#E5E7EB` | tokens.css:65 |
| Border strong | `--border-strong` | `#D5D5D5` | tokens.css:66 |
| Hairline | `--hair` | `#E7E5E4` | tokens.css:138 |
| Hairline strong | `--hair-strong` | `#D6D3D1` | tokens.css:139 |
| Status: Resolved text | `--color-success` | `#18794E` | tokens.css:70 |
| Status: Resolved bg | `--color-success-bg` | `#E9F9EE` | tokens.css:71 |
| Status: Resolved ring | `--color-success-border` | `#A7F3D0` | tokens.css:72 |
| Status: Open text/bg | `--brand` / `--brand-subtle` | `#5A49BF` / `#F0ECFB` | tokens.css:9,12 |
| Status: In Progress | `--surface-subtle` / `--text-secondary` | `#F5F5F5` / `#54495F` | tokens.css:58,48 |
| Status: Blocked | `--color-danger-bg` / `--color-danger` | `#FEF2F2` / `#E5484D` | tokens.css:76,75 |
| Danger | `--color-danger` | `#E5484D` | tokens.css:75 |
| Presence ring | `--color-warning` | `#F77E2C` | tokens.css:79 |
| Activity icon accent | `--orange` (→ warning) | `#F77E2C` | tokens.css:356→79 |
| Anonymous avatar | `--avatar-neutral-grey` | `#E5E5E5` | tokens.css:101 |
| Mention chip | `--brand-subtle` / `--brand` | `#F0ECFB` / `#5A49BF` | tokens.css:12,9 |

> ⚠️ **No `--canvas` token** — page bg is `--surface-page`. `--text-primary-strong` (`220 17% 10%`) and `--text-secondary-soft` (`220 10% 33%`) are HSL channel triplets for `hsl()`, **not** bare colors.

### 7.2 Radii / shadows / motion

| Token | Value | Source |
|---|---|---|
| `--radius-sm` | `9px` | tokens.css:105 |
| `--radius-md` | `12px` | tokens.css:106 |
| `--radius-xl` | `22px` | tokens.css:108 |
| `--radius-btn` | `20px` | tokens.css:110 |
| `--shadow-panel` | `0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)` | tokens.css:135 |
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` | tokens.css:125 |
| `--motion-duration` | `200ms` | tokens.css:269→151 |
| `--font-sans` | `'DM Sans', sans-serif` | tokens.css:122 |
| `--color-primary-ring` | `rgba(90,73,191,0.18)` | tokens.css:179 |

> Note: card corners use **literal `14px`** (`SessionPageClient.tsx:3968`) and buttons use **literal `7px`**, not `--radius-btn` (20px). Don't substitute the token.

### 7.3 Typography

| Element | Font | Size | Weight | Line-height | Tracking | Source |
|---|---|---|---|---|---|---|
| Sidebar workspace label | DM Sans | 14px | 600 | — | — | TicketList.tsx:355 |
| Sidebar views | DM Sans | 13px | 500 | — | — | TicketList.tsx:359 |
| Hero title | DM Sans | 18px | 600 | 1.35 | -0.012em | TicketList.tsx:392 |
| Hero subtitle | DM Sans | 14px | 400 | 1.5 | — | TicketList.tsx:404 |
| Section header (Open/Resolved) | DM Sans | 14px | 500 | — | -0.01em | TicketList.tsx:465 |
| Ticket row title | DM Sans | 14px | 400 (600 if selected) | 1.4 | -0.005em | TicketItem.tsx:40,56 |
| Detail title (h1) | DM Sans | 21px | 600 | 1.25 | -0.018em | FeedbackHeader.tsx:257 |
| Status badge | DM Sans | 11.5px | 600 | — | -0.005em | FeedbackHeader.tsx:40 |
| Position pill | DM Sans | 11.5px | 500 | — | — | FeedbackHeader.tsx:181 |
| Action buttons | DM Sans | 13px | 500 | — | — | FeedbackHeader.tsx:24 |
| Section headings (Description/Tags/Comments) | DM Sans | 17px | 600 | — | — | ActionItemsSection.tsx:56 |
| Comment name | DM Sans | 14px | 600 | — | — | CommentItem.tsx:231 |
| Comment body | DM Sans | 14px | 400 | relaxed | — | CommentItem.tsx:342 |
| Comment timestamp | DM Sans | 12px | 400 | — | — | CommentItem.tsx:236 |
| Mention chip | DM Sans | 13px | 600 | — | — | globals.css:5921 |
| Tag pill | DM Sans | 14px | 500 | — | — | Tag.tsx:24 |
| Share URL (external modal) | **monospace** | 13px | 400 | — | — | ExternalShareModal.tsx:152 |
| Copy/Share pill button | DM Sans | 13px | 600 | — | -0.005em | TopControlBar.tsx:230 |

---

## 8. Story Narrative (Step 7)

A Webflow agency founder gets a Slack message: *"Did a QA pass on the pricing redesign — here's everything."* They click the link. A clean three-pane workspace loads under a soft off-white canvas (`#FAF9F7`). The left card greets them by workspace name and a friendly hero: *"6 tickets in this session. Walk through, leave notes, resolve as you go."* Below it, two tidy groups — **Open (5)** and **Resolved (1)** — each ticket a single calm row with a little type-icon, no noisy badges. The eye lands first on the **center pane**, already showing the first open ticket: a large 21px title, a small purple **Open** dot-badge, and a crisp browser screenshot in a softly-shadowed card. On the screenshot sits a single purple **speech-bubble pin** — they hover it and a tooltip shows the exact note. *That's* the Annote moment: the feedback is pinned to the literal pixel, not described in a paragraph. Up in the top-right, three amber-ringed avatars tell them teammates are looking right now — no gimmicky "viewing" banner, just presence.

They click the second ticket. The detail swaps instantly; the row they left turns a quiet lavender. Each ticket reads like a tiny issue page: title, description, tags, and a threaded comment conversation underneath with real avatars, @-mentions in purple chips, and emoji reactions. They reply to a teammate's comment inline — the composer was right there, no modal. It feels lighter than Linear, more structured than a Loom, more precise than a Slack thread. When they're done they hit the brand-purple **Share / copy-link** pill in the corner and paste the link back into Slack. The "wow" isn't a feature list — it's that one link replaced the email, the screenshot annotations, the screen recording, and the ticket tracker, and everyone's looking at the same pinned pixel. The natural next action: reply, resolve, or capture their own observation with the extension.

---

## 9. Dead Code List (Step 8)

Components present in the repo but **NOT rendered by the production session route** — skip these in the forklift:

| Component | Status | Evidence |
|---|---|---|
| `operating-system/FourZoneLayout.tsx` | **Dead** — not the layout | Only referenced in its own file, `index.ts`, and a marketing comment (`Suite.tsx:48`). Real layout is the inline grid `SessionPageClient.tsx:3947`. |
| `operating-system/SignalStream.tsx` | **Dead** | Self-reference only. |
| `operating-system/SessionNavigator.tsx` | **Dead** | Self-reference only. |
| `operating-system/FeedbackListPanel.tsx` | **Dead** | Self-reference only. |
| `operating-system/FeedbackCommandPanel.tsx` | **Dead** | Self-reference only. |
| `operating-system/ExecutionCanvas.tsx` | **Dead** (alternate 70/30 canvas) | Self-reference only; 22px title, uppercase bordered StatusPill — NOT the live header. |
| `operating-system/ContextPanel.tsx` + `ContextIntelligenceColumn.tsx` + `TicketMetadata.tsx` | **Dead** | Only used by each other, never by SessionPageClient. |
| `operating-system/ActivitySlideOver.tsx` | **Dead** | Self-reference only. |
| `operating-system/CommentModeIndicator.tsx` | **Dead** | Self-reference only. |
| `operating-system/SystemNavigationRail.tsx` | **Live elsewhere** (in `AppLayoutClient.tsx:5`) — app shell rail, not the session view. | Not part of the forklift. |
| `feedbackDetail/FeedbackDetail.tsx` | **Dead** (legacy detail) | Exported via `feedbackDetail/index.ts` but the live detail is `ExecutionView` → `FeedbackContent`. |
| `feedbackDetail/FeedbackHeader.tsx` | **Dead** (legacy header; 20px title, different meta line) | Live header is `session/FeedbackHeader.tsx` (`ExecutionView.tsx:7`). |
| `session/FeedbackSidebar.tsx` | **Dead/legacy sidebar** | Not imported by SessionPageClient; live sidebar is `operating-system/TicketList.tsx`. |
| `session/SessionHeader.tsx` | **Dead** for this route | Only `dashboard/[sessionId]/overview/page.tsx` has its own local `OverviewSessionHeader`. |
| `feedbackDetail/ActivityThread.tsx` + `ActivityComposer.tsx` + `ActivityCollapsibleSection.tsx` | **Alternate/secondary** thread system | Not in the ExecutionView → FeedbackContent path; live comments are `CommentsSection` → `CommentItem`. |

**Components to forklift (the real render path):**
`TicketList` + `TicketItem` (sidebar), `SessionFeedbackHeader` (`session/FeedbackHeader.tsx`), `FeedbackContent`, `ScreenshotBlock` / `ScreenshotWithPins`, `ActionItemsSection`, `Tag`, `CommentsSection` + `CommentItem`, `PresenceAvatarRow`, and the share pill from `TopControlBar`. `TicketActivityPanel` is the optional right column (system events).

---

## 10. Hooks / Providers Inventory (Step 9)

`SessionPageClient` is dense with realtime/auth state. For the forklift, each must be stripped and replaced with static mock data.

| Component | Hook / provider | What it does | Forklift action |
|---|---|---|---|
| SessionPageClient | `useWorkspace()` (`:442`) | auth uid, displayName, avatar, workspaceId/Name | Replace with static literals |
| SessionPageClient | `useSessionStore(sessionId)` (`:345`) | Firestore session doc listener | Replace with static session object |
| SessionPageClient | `useFeedbackStore(sessionId)` (`:813`) | Firestore feedback list listener | Replace with static ticket array |
| SessionPageClient | `useSessionCommentsAggregate` (`:349`), `usePresenceStore` (`:350`) | comments + presence listeners | Replace with static data |
| SessionPageClient | `usePresenceHeartbeat` (`:468`) | writes viewer heartbeat | **Drop entirely** |
| SessionPageClient | `useFeedbackDetailController` (`:2471`) | comment CRUD + `useCommentsRepoSubscription` Firestore listener (`controller:21`) | **Heaviest dependency** — replace with static `comments`/`participants`; stub all `send*`/`delete*`/`update*` as no-ops |
| SessionPageClient | `useRouter`/`useSearchParams` (`:328-329`) | URL + `?ticket=` deep link | Replace selection with local `useState` |
| SessionPageClient | `useToast` (`:517`), `sonner` toast | toasts | Drop / no-op |
| SessionPageClient | `useScreenshotUrl` / `getScreenshotUrl` | resolves screenshot blob URLs | Replace with static image src |
| SessionPageClient | `useIsMobile` / `useMediaQuery` (`:1484-1485`) | responsive | **Keep** (pure, no backend) |
| TicketList | none (pure props) | — | **Forklifts cleanly** |
| TicketItem | `getTicketIconFromTags` (pure) | type icon | **Keep** |
| ExecutionView / FeedbackContent | all data via props | — | **Forklifts cleanly** once parent supplies static props |
| ScreenshotWithPins | upload/auth side-effects in callbacks | pin CRUD | Strip callbacks; render pins from static `pinComments` |
| CommentsSection / CommentItem | `UserAvatar` → `useUserAvatars` (avatar URL resolution) | live avatar fetch | Pass static `avatarUrl`/initials; avoid the resolver |
| PresenceAvatarRow | `usePresenceStore`, `useUserAvatars` | live viewers | Replace with static viewer array |
| TicketActivityPanel | `activityEvents` Firestore subcollection listener | system events | **Feasibility flag** — heavy realtime; build a static-data version or omit the right column for the marketing demo |
| TopControlBar share pill | `useShareController`, clipboard | copy link | Keep clipboard copy; stub share modal |

**Feasibility flags (no clean static render path without surgery):**
- `useFeedbackDetailController` + `useCommentsRepoSubscription` — the comments thread is built around a Firestore subscription. For marketing, render `CommentsSection` with a static `comments` array and no-op mutation callbacks (the component already accepts comments as props from the controller, so the seam is clean).
- `TicketActivityPanel` — subscribes to an `activityEvents` subcollection with its own listener. Recommend **omitting the right column** in the marketing demo (or feeding static rows) rather than forklifting the listener.
- `UserAvatar`'s `useUserAvatars` — resolves avatar URLs asynchronously; pass explicit static URLs/initials to avoid the network hook.

---

## 11. Open Questions

1. **Status grouping vs. mockup pills.** The real sidebar uses collapsible **Open/Resolved sections** with counts and *no per-row status pills*. The mockup uses per-row `sd-status` pills ("open"/"in-review"/"resolved"). **Confirm**: forklift the real collapsible grouping (recommended for fidelity), or keep the mockup's flat pill list for the marketing narrative? Note the real UI only has *two* buckets (open/resolved) — "in-review"/"in-progress"/"blocked" appear only as the detail-header StatusBadge, never as sidebar groups.
2. **Right Activity column.** Include the `TicketActivityPanel` (system-event timeline) third column, or present the simpler two-column (sidebar + detail) for the demo? The third column requires either static event data or omission.
3. **Pins vs. rectangle.** The mockup draws a static purple highlight rectangle (`sd-thumb-highlight`). The real product uses **draggable speech-bubble pins** that open threads. For the demo, do we want a single static pin (faithful, simpler) or an animated/interactive pin? Recommend one static numbered pin per screenshot.
4. **Presence treatment.** Real presence = amber-ringed avatars, no count text. Mockup = "3 viewing now" + green pulse dot. Keep the real (subtle, no label) or the mockup's louder version for marketing punch? The amber ring (`--color-warning` #F77E2C) reads as live without a label.
5. **Meta sub-row.** The mockup shows page/browser/OS under the title; the real header has none (it's tooltip-only). For marketing legibility we may *want* the visible meta row even though it's not in production — flag as an intentional embellishment if so.
6. **New-ticket highlight color bug.** The live `echlyTicketHighlight` is leftover **blue** (`rgba(59,130,246)`), not brand purple, due to a cascade collision (§6). For the forklift use the brand-purple `echly-new-ticket-pulse` recipe.

---

*End of spec. Next step: write the forklift build prompt with this as the binding reference, resolving the §11 open questions first.*
