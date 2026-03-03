# DASHBOARD BEHAVIORAL INTELLIGENCE REPORT

---

## STEP 1 — USER BEHAVIOR SIMULATION

### 1. First-time login

**What the user sees:**
- Login page: centered "Sign in with Google" button on gray-100 background; no logo, no product name, no explanation.
- After successful sign-in: full reload (`window.location.href = "/dashboard"`). Then root layout (GlobalNavBar at top, 56px) and app layout (GlobalRail left 72px, main content). Dashboard page shows "Workspaces" title, subtitle "Sessions and feedback in one place.", "New Session" button, "Search sessions" input, and either "Loading workspace…" or the main content.
- If no sessions yet: empty grid with single line "No sessions yet. Create one to get started." No illustration or step-by-step guidance.

**Decisions available:**
- Click "Sign in with Google" (only path forward).
- After redirect: click "New Session", type in search (no sessions to search), or use rail (Dashboard, Sessions, Capture, Analytics, Settings). No other on-page choices.

**Friction:**
- No error message on login failure; only `console.error`. Popup can be blocked; no fallback or instruction.
- No indication of what "Workspaces" or "Sessions" mean for a new user.
- Rail items "Capture," "Analytics," "Settings" lead to non-existent routes (dead links).

**Emotional state:**
- Possible uncertainty: "What do I do next?" Empty state is minimal.
- Relief once on dashboard if expectation was "see my workspace"; no celebration or onboarding.

**Clarity missing:**
- What a "session" or "workspace" is. What "feedback" means in this product. How to add feedback (extension/flow not referenced on dashboard). Why Capture/Analytics/Settings are in the nav if they don’t work.

---

### 2. Creating first session

**What the user sees:**
- User clicks "New Session." No confirmation or loading state on the button. `createSession` runs (Firestore), then `router.push(\`/dashboard/${sessionId}\`)`.
- Session page loads: left sidebar "Feedback" with "0 total", search "Search feedback…", options menu (three dots), empty list. Center: session title "Session" (or "Untitled Session" from repo), date · time · user name and optional avatar, no "View session summary" (no feedback yet). Below: either "Loading…" then "No feedback yet" with "Capture feedback to start organizing insights." or, after a moment, FeedbackPremiumLoader then same empty state.
- Footer text "All changes saved • Secure session" at bottom-right of app.

**Decisions available:**
- Click session title to rename (inline edit). Click "View session summary" only when summary exists (not yet). Use sidebar: search (no effect with 0 items), open options (Show all / Show active only / Show resolved only / Mark all as resolved). No way to add feedback from this page; no "Add feedback" or "Import" CTA. Rail still offers Capture (dead), Analytics, Settings.

**Friction:**
- No in-app way to create first feedback from the dashboard; user must use extension or another flow (e.g. transcript). Empty state does not say how to get feedback.
- Session title defaults to "Untitled Session" (from repo); UI may show "Session" from fallback — possible inconsistency.
- New session is created and user is dropped into empty board with no next step.

**Emotional state:**
- Possible confusion: "I created a session; now what?" Empty state is passive.
- Possible satisfaction if they only wanted a placeholder session.

**Clarity missing:**
- How to add the first feedback item. What "Capture" is and that it’s not yet available. That the session is "saved" and where it lives (back to Workspaces to see the card).

---

### 3. Receiving first feedback

**What the user sees:**
- Feedback appears via extension (ECHLY_FEEDBACK_CREATED) or transcript flow (handleTranscript → structure-feedback API → addFeedback). New item is prepended to sidebar; first item is auto-selected. Center shows FeedbackDetail: "1 of 1", title (editable), ResolvedToggle, Delete, Activity, created/updated dates, divider, then Description, optional Attachments (screenshot), optional Suggestion, Action steps, Tags.
- Sidebar subline becomes "1 total · 1 active · 0 resolved." If feedback came from structure-feedback, it may have title, description, action steps, suggested tags, optional screenshot.

**Decisions available:**
- In sidebar: select the one item (already selected), use filter (all/active/resolved), search by title, or open menu (Mark all as resolved, etc.). In detail: edit title (click, type, blur/Enter), toggle resolved, delete, open Activity (comments). In content: edit description (click, textarea, cancel/save), expand screenshot if present, edit action steps (add/edit/remove), add/remove tags. Session header: edit session title, optionally "View session summary" once AI summary exists.

**Friction:**
- First feedback is not created from the dashboard; user must have used extension or another entry point. No "Add feedback" on the session page.
- If detail is loading (fetchDetailTicket), center shows "Loading…" with no skeleton for the selected item.
- Many interactive areas at once: header (session + feedback title), sidebar, detail (title, resolved, delete, activity, description, attachment, action steps, tags). No progressive disclosure for first-time.

**Emotional state:**
- Possible "aha" when the first structured item appears and is selected.
- Possible overwhelm from many editable sections and controls.

**Clarity missing:**
- Where this feedback came from (extension vs transcript). That the session now has "1 active" and what "resolved" means in practice. Whether the session summary will appear automatically (it’s fetched in background when feedback count > 0).

---

### 4. Resolving feedback

**What the user sees:**
- User toggles ResolvedToggle to "Done" (or equivalent). Optimistic update: detail and sidebar list update; sidebar subline changes (e.g. "1 total · 0 active · 1 resolved"). PATCH /api/tickets/[id] runs in background. On failure, state rolls back.
- Alternative: sidebar options → "Mark all as resolved." All active items get PATCH; list and counts update; detail panel updates if current item was active.

**Decisions available:**
- Per item: use ResolvedToggle (open ↔ done). Or use sidebar "Mark all as resolved" to resolve every active item at once. No "Mark as open" bulk action; no multi-select then resolve.

**Friction:**
- Resolve is one-by-one except "Mark all as resolved." No middle ground (e.g. select 5, resolve 5).
- No undo for resolve; user can toggle back to open, but no explicit "Undo" affordance.
- No visual celebration or progress cue (e.g. "All caught up") when last item is resolved; only count and filter state change.

**Emotional state:**
- Satisfaction when count goes to 0 active and items show as done.
- Possible mild friction if user expects bulk select-and-resolve.

**Clarity missing:**
- Whether "resolved" is permanent or just a status. That "Mark all as resolved" applies only to currently loaded/visible active items (up to 200 cap) not necessarily all in DB. No explanation of what "Done" means in the product’s workflow.

---

### 5. Returning after 3 days

**What the user sees:**
- User goes to /dashboard or /login. If still logged in (Firebase): dashboard loads. Same layout: Workspaces list, sessions sorted by updatedAt desc. No "Welcome back," "Last active 3 days ago," or "You have N open items" message. No digest or highlights. Sessions show as cards with title, feedback count, open count, views, comments, ID. If they had one session with one resolved item, they see that one card.
- Clicking a session: session page with sidebar and detail. No "Recent" or "Continue where you left off" on dashboard. No notification that something changed (e.g. new comment) unless they open the session and the Activity panel.

**Decisions available:**
- Same as first visit to dashboard: open a session, create new session, search. No time-based or priority-based surfacing. No "sessions with open feedback" vs "all done" grouping.

**Friction:**
- No reminder of context (what was I doing, what’s urgent). User must scan cards and remember.
- If they forgot the product, no re-onboarding or value reminder.

**Emotional state:**
- Neutral: familiar layout, no delight or re-engagement. Possible forgetfulness about which session mattered.

**Clarity missing:**
- What changed in 3 days (if anything). Which sessions need attention. That overview exists at /dashboard/[id]/overview (no link to it). Any notion of "progress" over time.

---

### 6. Managing 10+ sessions

**What the user sees:**
- Dashboard shows up to 50 sessions (SESSION_LIMIT in useWorkspaceOverview). Grid: 1–5 columns by breakpoint, all cards same structure. Each card: title, status dot, feedback count, open count, views, comments, ID, more menu (Copy link, Share, Rename, Archive, Delete). Search filters by title only. Sort is fixed: updatedAt descending. No tabs (e.g. "All" vs "Archived"); archived sessions are excluded from list and there is no UI to view them.
- Scrolling: full list in DOM; no virtual list. All cards render. Loading: one initial "Loading workspace…" then full grid; no per-card skeleton.

**Decisions available:**
- Search by session title. Click a card to open. Per card: hover → more → Copy link, Share, Rename, Archive, Delete. No sort control (e.g. by open count, name, date). No filter by "has open feedback" or "all resolved." No pagination; cap is 50 sessions.

**Friction:**
- At 10+ cards, scanning is visual only; no prioritization (e.g. "5 sessions with open feedback"). Rename/Archive/Delete each require opening the card’s menu (hover) then modal or async action. No bulk rename, archive, or delete.
- 50-session cap: if user has more, older sessions never appear; no message that list is truncated.
- Performance: N sessions ⇒ N count fetches on load (getSessionFeedbackCounts per session in parallel). Many cards and modals in DOM.

**Emotional state:**
- Possible overload: "Which session do I open first?" No prioritization.
- Possible annoyance: repeated hover → menu for repeated actions across sessions.

**Clarity missing:**
- That the list is limited to 50 sessions. That "Archive" removes the card from the list and there is no "Archived" view. How to find an old session if they don’t remember the title (search is title-only). That overview exists and could give a quicker summary than opening each session.

---

## STEP 2 — INFORMATION ARCHITECTURE

### 1. Mental model

- **Sessions (workspaces)** are the top-level container. Each session has a **title**, **feedback list** (tickets), and optional **session-level summary** (AI). **Feedback** items have title, description, resolution state, tags, action steps, attachments, and **comments** (activity). The product behaves like: "I have many sessions; inside each session I have a list of feedback items; I select one and work on it in the detail panel; I can open Activity (comments) on the side."
- There is no explicit "project" or "workspace" above session; "Workspaces" in the UI is the label for the session list. So the mental model is **flat sessions → feedback items → detail + activity**. Capture, Analytics, Settings are in the rail but not implemented, so they don’t reinforce a broader model (e.g. "Capture → Sessions → Analytics").

### 2. Hierarchy clarity

- **Global:** Root (navbar) → App (rail + main). Under app: Dashboard (workspace list) vs Session (sidebar + detail + optional activity). Overview is a separate page under the same sessionId with no nav link from dashboard or session. Hierarchy is clear at the top (dashboard vs inside a session) but overview is an alternate view of a session, not clearly placed in the tree.
- **Within session:** Sidebar = list of feedback (with filter/search); center = session header then selected feedback detail; right = optional Activity. So: Session → (Feedback list | Selected feedback detail | Activity). Clear. But "Feedback" in the sidebar and "Activity" in the detail both relate to the same feedback item; "Activity" is comments, which could be confused with "all activity" (e.g. resolves, edits). Label "Activity" without "Comments" may blur the hierarchy.

### 3. Primary object: Session or Feedback?

- **Session** is the primary container for navigation and list views: dashboard lists sessions; URL is /dashboard and /dashboard/[sessionId]. Creating and opening is session-centric.
- **Feedback** is the primary object for work inside a session: selection, editing, resolving, commenting. The session page is built around "which feedback am I looking at?" So: **Session = primary for navigation and scope; Feedback = primary for daily work and state (open/resolved).** The dashboard emphasizes sessions (cards); the session page emphasizes feedback (sidebar + detail). No single "primary" object for the whole product; it’s split by context.

### 4. Shallow vs deep navigation

- **Shallow:** Dashboard (one level). Session page: list + detail + optional panel (one level of "drill" — click session, then you’re in). No nested folders or sub-sessions. Max depth from root: Home/Logo → Dashboard → Session → (Overview only by URL). So effectively **2–3 steps** to any screen. Overview adds depth only if discovered.
- **Deep:** No deep trees. Filter/sort are in-place (sidebar filter, dashboard search). Modals (Share, Rename, Delete, Delete feedback) are overlays, not new "pages." Navigation feels shallow; complexity is in **breadth** (many sessions, many feedback items, many controls on one screen) not depth.

### 5. Bolted-on vs intentional

- **Intentional:** Session list and session page with feedback sidebar + detail. Resolve, edit title/description, action steps, tags. Comments (Activity). Session title edit. "New Session," search sessions. Share/Rename/Archive/Delete session from card. Delete feedback with confirmation. Session summary (AI) and "View session summary" toggle. Paginated feedback load (infinite scroll) and load cap (200).
- **Bolted-on or inconsistent:** (1) **Overview** page: metrics and previews but no link from dashboard or session; feels like a separate feature. (2) **GlobalNavBar:** Share, Copy link, More, Search, Notifications, User — generic; not session-aware; Search and Notifications do nothing. (3) **Rail:** Capture, Analytics, Settings point to missing routes. (4) **Footer:** "All changes saved • Secure session" is generic and always on. (5) **Session summary:** Fetched in background, revealed by toggle; not surfaced as the main "insight" for the session. (6) **CommandPalette** exists in codebase but is never used in the app. (7) **"Workspaces"** vs **"Sessions"** in rail (both go to /dashboard) — duplicate labels. So: core loop (sessions → feedback → resolve/edit) is intentional; nav, overview, and global chrome feel bolted-on or unfinished.

---

## STEP 3 — COGNITIVE LOAD ANALYSIS

### 1. Count of interactive elements

**WorkspaceCard (per card):**
- Card surface: 1 (clickable region, role=button, tabIndex=0).
- More actions button: 1 (opens menu).
- Menu (when open): 5 items — Copy link, Share, Rename, Archive, Delete permanently.
- **Total:** 2 always visible (card, more button). **7** if counting the 5 menu items when menu is open. No other buttons or inputs on the card (view/comment/ID are display only).

**Session page header (session-level strip above feedback detail):**
- Session title: 1 (clickable div or, when editing, 1 input; Enter to save, Escape to cancel).
- "View session summary" / "Hide session summary": 1 (only when aiInsightSummary exists).
- Date · time · user name and avatar: 0 (display only).
- **Total:** 1–2 (title always; summary toggle only when summary exists).

**Feedback detail view (FeedbackHeader + FeedbackContent for one selected item):**
- **FeedbackHeader:** Index "X of Y" (static). Editable title: 1 (click to edit or input when editing). ResolvedToggle: 1. "Delete permanently" button: 1. "Activity" button: 1. **Header total: 4** (title, resolve, delete, activity).
- **FeedbackContent — DescriptionSection:** "Edit" trigger or textarea: 1. When editing: textarea (1), Cancel button (1), Save/Blur (1). **Description: 1–3** visible at once.
- **ScreenshotBlock (if present):** Expand button: 1.
- **ActionItemsSection:** "Add" or "Add step" (1). Per step: edit (click/inline), remove (1 per step). So **1 + 2× (number of steps)**.
- **Tags:** "+ Add tag" button (1). Per tag: remove (1, hover). Tag picker: 1 popover with N tag options (each a button). **1 + (number of tags) remove buttons + 1 dropdown with many options.**
- **Total for feedback detail:** **4 (header) + 1–3 (description) + 0–1 (screenshot) + 1 + 2k (action steps) + 1 + n (tags, remove) + tag picker.** Rough order: **~12–15+** interactives before counting every action-step and tag (e.g. 3 steps + 2 tags ⇒ 4+3+1+1+6+1+2+popover ≈ 18+).

### 2. Too many decisions at once

- **Session page, feedback detail:** When one feedback item is selected, the user sees in one view: session title (editable), optional session summary toggle, feedback index, feedback title (editable), resolved toggle, delete, activity, created/updated, description (editable), attachment (expand), optional suggestion, action steps (add/edit/remove), tags (add/remove/picker). That’s **many decisions in a single scroll**: what to edit first, whether to resolve, whether to open Activity, whether to change description vs action steps vs tags. No staging (e.g. "Basics" vs "Details") or collapse.
- **WorkspaceCard:** Card click (open) vs hover to reveal more (Copy, Share, Rename, Archive, Delete). Two layers of intent: "open" vs "do something else." Acceptable, but the five menu options appear in one list with no grouping (e.g. "Share" vs "Danger").
- **Feedback sidebar:** Header (Feedback + subline), filter menu (4 options), search, then a long list. Filter state (all/active/resolved) is not always visible until menu is opened; subline shows counts but not "Showing: active only." So "what am I looking at?" and "how do I change it?" are separate steps.
- **Session page with Activity open:** Three columns (list | detail | comments). Detail column already has many controls; adding Activity adds composer + thread. **Three focus areas** with multiple actions in each.

### 3. Hidden actions

- **WorkspaceCard:** Copy link, Share, Rename, Archive, Delete are **hidden until hover** (more button appears on group-hover). Keyboard/screen-reader users can focus the card and the more button, but sighted mouse users must discover hover. No visible "…" or "Actions" until hover.
- **Feedback sidebar:** Filter (Show all / active / resolved) and **Mark all as resolved** are behind the **options (three-dots) menu**. Not visible without opening the menu.
- **Per-feedback-item actions in sidebar:** Each row has a "More actions" (three dots) button that appears on **group-hover**; in the code it’s present but `onClick` is stopPropagation with no handler — so the button is visible on hover but does nothing. Effectively **no row-level actions** in the list; bulk and filter are only in the header menu.
- **Session summary:** "View session summary" appears only when `aiInsightSummary` exists and is non-empty. That depends on background POST /api/session-insight; until then the action is **hidden**. User may not know summaries exist.
- **Overview:** Entire page at `/dashboard/[sessionId]/overview` has **no link** from dashboard or session page. Only way to reach it: URL or external link. Strongly hidden.
- **Description edit:** In DescriptionSection, the edit affordance is "click on the description" (or an edit trigger). Not always obvious that the block is editable.
- **Tag remove:** Per-tag remove is **opacity-0 group-hover:opacity-100** — visible only on hover. "+ Add tag" is always visible; removing a tag is hidden until hover.

---

## STEP 4 — POWER USER LIMITATIONS

### 1. What would break at 50 sessions

- **Hard cap:** `useWorkspaceOverview` uses `SESSION_LIMIT = 50` (getUserSessions(uid, 50)). Sessions beyond the 50 most recently updated **never appear** in the list. No pagination, "Load more," or "You have more sessions" message. So at 51+ sessions, the oldest (by updatedAt) disappear from the UI. **Break:** Invisible sessions; no way to open or manage them from the dashboard.
- **Load:** On dashboard load, **50 × getSessionFeedbackCounts** run in parallel (Promise.all). So 50 read operations (or aggregation) per load. Latency and cost grow with N; no batching API that returns sessions + counts in one call.
- **UI:** 50 cards in the grid; all in DOM. No virtual scrolling. Scrolling and re-renders (e.g. on search) can get heavier. No "collapse to list" or compact view for power users.

### 2. What would break at 1000 feedback items

- **Load cap:** `useSessionFeedbackPaginated` has **FEEDBACK_LOAD_CAP = 200**. Infinite scroll stops after 200 items; message "Reached maximum items" appears. So feedback items 201–1000 are **never loaded** in the sidebar. User cannot select or resolve them from the UI. **Break:** 800 items invisible in the session view.
- **Counts:** Total, activeCount, resolvedCount come from the **first page** (server). So the header/subline counts can still reflect the true total (e.g. 1000), but the list only shows 200. User sees "1000 total · 300 active" but only 200 items in the list; filter "active only" still only shows active among those 200. **Mismatch:** counts vs list length.
- **Mark all as resolved:** `handleMarkAllResolved` runs over **current `feedback` array** (max 200). So "Mark all as resolved" only resolves the loaded items, not the other 800. **Break:** Bulk action is incomplete.
- **Performance:** 200 DOM nodes in the sidebar (list items + sentinel). Re-renders when selection or filter changes. No virtualization. Manageable but not scalable to 1000 if the cap were removed.
- **Search:** Sidebar search filters **loaded items only** (client-side). So with 200 loaded, search cannot find feedback 201–1000. **Break:** Search is incomplete at scale.

### 3. Too many clicks

- **Resolve 10 items one-by-one:** 10 clicks on ResolvedToggle (one per item). No multi-select then "Resolve selected." "Mark all as resolved" is one click but applies to all active in the loaded set; no "select 5, resolve 5."
- **Rename 5 sessions:** Open each card’s more menu (hover) → Rename → type → save. **5 × (hover + click more + click Rename + type + save)** = many clicks. No bulk rename.
- **Delete 5 feedback items:** Open each item, click "Delete permanently," confirm. **5 × (select item + Delete + confirm).** No multi-select delete or "Delete selected."
- **Add tag to 3 feedback items:** Select first → Tags → + Add tag → pick. Select second → repeat. Third → repeat. **3 × (select + open tags + add + pick).** No "apply tag to multiple."
- **Open overview for a session:** No link. User must **manually edit URL** to `/dashboard/[sessionId]/overview` or bookmark. One "click" only if they have a bookmark; otherwise type or copy-paste URL.
- **Switch session then return:** Click card A → work → back (browser back or rail Dashboard) → click card B. No "recent sessions" or "pinned" to reduce clicks.

### 4. Missing bulk actions

- **Sessions (dashboard):** No multi-select. No "Archive selected," "Delete selected," "Rename selected," or "Export selected." No bulk selection checkbox or shift-click.
- **Feedback (session page):** No multi-select in sidebar. No "Select all," "Resolve selected," "Delete selected," "Add tag to selected," or "Move to another session." Only bulk action is "Mark all as resolved" (all active in loaded set).
- **Sessions:** No "Archive all" or "Delete old sessions." No bulk filter then action.
- **Feedback:** No bulk tag, bulk assign, or bulk status change beyond "Mark all as resolved."

---

## STEP 5 — STRATEGIC MISALIGNMENT

### 1. Storage vs control center

- **Implementation:** Dashboard is a **list of sessions** (cards with counts and actions). Session page is a **list of feedback + detail panel**. There is no dashboard-level summary: no "12 open across 5 sessions," no "Sessions needing attention," no charts or KPIs. Overview page has metrics (total feedback, open, done, completion %, tag distribution, recent activity) but is not linked and is per-session, not global. So the **dashboard** behaves as **storage + entry point**: "Here are your sessions; open one to work." It does not behave as a **control center**: no at-a-glance priorities, no alerts, no next-best-action.
- **Conclusion:** The product **leans toward storage**. The place to "control" is inside a session (resolve, edit, comment), not on the dashboard. Overview could function as a lightweight control view for one session but is undiscoverable.

### 2. Encouraging return visits

- **Implementation:** No email or in-app notifications. No "You have N open items" on login or dashboard. No "Last active X ago" or "Sessions you haven’t opened in a while." No digest or recap. Rail has a Notifications icon but no data or list. Returning user sees the same list and same cards; nothing pulls them back or highlights urgency.
- **Conclusion:** The product **does not encourage return visits** beyond the user’s own habit. No re-engagement or FOMO. No "come back to finish" or "someone commented" (unless they open the session and Activity).

### 3. Communicating progress clearly

- **Implementation:** **Per session:** Card shows feedback count and open count; status dot (gray / attention / success). **Inside session:** Sidebar subline "X total · Y active · Z resolved." Optional "View session summary" with AI text. **Overview (if opened):** Total feedback, Open, Done, Completion % with progress bar; Open/Done preview lists; tag distribution; recent activity. So **progress is visible** at card level (counts, dot) and inside session (counts, optional summary). **Not visible:** Trend over time (e.g. "5 resolved this week"). No goal or target (e.g. "Goal: 0 open"). No comparison across sessions (e.g. "3 sessions with open items"). No dashboard-level progress.
- **Conclusion:** Progress is **clear at session and feedback level** (counts, completion % on overview). It is **not** clear at the product level (no dashboard summary, no trends, no goals). Session summary exists but is optional and hidden behind a toggle.

### 4. Generating urgency

- **Implementation:** No deadlines, due dates, or "needs attention" flags on feedback or sessions. No badges (e.g. "3 new comments"). No "open for 7 days" or "stale" indicator. Notifications are not implemented. "Mark all as resolved" and completion % could create a light "finish the list" urge, but there is no explicit urgency (time, assignee, priority). Empty state "No feedback yet" is passive; no "Add your first feedback in 2 minutes."
- **Conclusion:** The product **does not generate urgency**. It supports organizing and resolving feedback but does not create time pressure, FOMO, or "what to do next" prompts. It feels neutral and user-paced.

---

**END OF REPORT**
