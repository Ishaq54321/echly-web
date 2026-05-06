Perfect! Now I have enough context. Let me compile the comprehensive audit report.

---

# Echly Next.js App — Comprehensive UI/UX Inventory Audit

## 1. Dashboard / Homepage
**File:** [app/(app)/dashboard/page.tsx](c:\Users\user\Desktop\echly\app\(app)\dashboard\page.tsx#L54)

### A) Structure — Top-Level Layout
- **Max-width container:** 1280px centered with px-6 padding, py-10
- **Vertical flow:** Header → Tabs + Filter Bar → Content (Sessions list/grid)
- **No sidebar** (dashboard is single-column focused on content)
- **Responsive:** Full width on mobile, constrained on desktop

### B) Element Inventory

**Top Bar:**
- `SessionsHeader` ([#L157](c:\Users\user\Desktop\echly\app\(app)\dashboard\page.tsx#L157)): Greeting emoji + dynamic time-based message (e.g., "Good morning, John"), workspace name above
- **Greeting logic:** Randomized pool of 20+ contextual greetings per day-of-year seed; emoji animates with `wave-hand` keyframes
- Workspace name label (text-[14px], text-secondary)
- Main heading: "Good [time], [Name]" (text-[28px], semibold)

**Tab Bar + Filter Bar:**
- `SessionsListArchiveTabs` ([#L165](c:\Users\user\Desktop\echly\app\(app)\dashboard\page.tsx#L165)): Two tabs: "Sessions" | "Archived"
  - Active tab: bold, brand-colored bottom border (h-[3px], rounded-full)
  - Inactive: lighter text, hover effect
- **Actions row (right side, flex items-center gap-3):**
  - `SessionsTimeRangeFilter`: Dropdown button for time range (default: ALL_TIME)
  - **"New Session" button:** h-[38px], brand bg, white text, px-4, rounded-[var(--radius-btn)], disabled state when loading
  - `SessionsViewModeToggle`: List/Grid toggle button pair

**Sessions List:**
- `SessionsWorkspace` component: Renders sections array with `items: tabFilteredSessions`
- **Search/Filter state:** Debounced 300ms on search query (useSessionsSearch context)
- **Session row fields:**
  - Session title (truncated)
  - Avatar stack (recent viewers)
  - Open/resolved badge counts (inline)
  - Last updated relative time
  - Menu button (3-dot dropdown) for rename/archive/delete actions
  
**Pagination:**
- "Load more sessions" button appears when `hasMoreSessions && !debouncedSearch.trim()`
- Button: rounded-lg, border, px-4 py-2, sm text, hover:bg-surface-hover

**Empty States:**
- Active sessions empty: `EmptySessionsCard` component
- Archived sessions empty: `ArchiveEmptyState` component
- Loading state: Centered `BrandLoader` with aria-busy

**Modals:**
- `DeleteSessionModal`: Dynamically imported (ssr: false) when deleteTarget is set

### C) Interactions & Flows

| Action | Handler | Result |
|--------|---------|--------|
| Click tab (Sessions/Archived) | `setListArchiveTab(tab)` | Filters view, preserves search |
| Click time range dropdown | `setSessionsTimeRange(range)` | Filters by createdAt; recalculates tabFilteredSessions |
| Search input | Debounced 300ms → `setDebouncedSearch()` | Re-filters title matches, clears "load more" |
| Click "New Session" | `triggerCta()` → opens DashboardCaptureHost modal | Extension capture flow or in-browser recording |
| Click view mode toggle | `setSessionViewMode("list" \| "grid")` | SessionsWorkspace re-renders with new layout |
| Click session row | `handleView(sessionId)` → `router.push(/feedback/:sessionId)` | Navigates to SessionPageClient |
| Session renamed (from menu) | `onRenameSuccess()` → `updateSession()` | Updates workspaceStore, optimistic UI |
| Session archived | `onSetArchived()` → Firestore update | Moves to archived tab, counts update |
| Delete session | Opens modal → `deleteSession()` | Removes from list, Firebase deletion |
| "Load more" button | `loadMoreSessions()` → paginates from store | Appends more sessions to list |
| Toast feedback | `useToast().showToast()` | Displays join-workspace success toast |

### D) Data Shape

**Source:** `useWorkspaceStore()` hook
- `sessions: SessionWithCounts[]` → `Array<{ session: Session; counts: FeedbackCounts }>`
- `hasMoreSessions: boolean`
- `loading: boolean` → `sessionsLoading`
- Derived state:
  - `activeSessions` (non-archived, matching time range + search)
  - `archivedSessions` (archived = true)
  - `tabFilteredSessions` (final list for render)

**Computed sorting:** `sessionSortKey()` converts `updatedAt` (Timestamp or ISO string) to UNIX seconds; sessions sorted DESC

**Time range filter logic:** [#L20](c:\Users\user\Desktop\echly\app\(app)\dashboard\page.tsx#L20) `sessionPassesTimeRange(session, range)` checks session.createdAt or updatedAt against DEFAULT_FILTER ranges

### E) Imported Components

| Component | Path | Role |
|-----------|------|------|
| `SessionsWorkspace` | @/components/dashboard/SessionsWorkspace | Main list/grid renderer |
| `SessionsHeader` | @/components/dashboard/SessionsHeader | Greeting + workspace name bar |
| `SessionsListArchiveTabs` | @/components/dashboard/SessionsListArchiveTabs | Tab switcher (Sessions/Archived) |
| `SessionsTimeRangeFilter` | @/components/dashboard/SessionsTimeRangeFilter | Date range dropdown |
| `SessionsViewModeToggle` | @/components/dashboard/SessionsViewModeToggle | List/Grid buttons |
| `EmptySessionsCard` | @/components/dashboard/EmptySessionsCard | Empty state for active sessions |
| `ArchiveEmptyState` | @/components/empty/ArchiveEmptyState | Empty state for archived tab |
| `DashboardUpgradeBanner` | @/components/dashboard/DashboardUpgradeBanner | Premium plan CTA (conditional) |
| `DeleteSessionModal` | @/components/dashboard/DeleteSessionModal | Confirmation modal (dynamic import) |
| `ToastProvider, useToast` | @/components/dashboard/context/ToastContext | Toast notification system |
| `SessionsSearchProvider` | @/components/dashboard/context/SessionsSearchContext | Global search state for page |

### F) Rough Edges & Observations

1. **PERF R-013 note** ([#L136](c:\Users\user\Desktop\echly\app\(app)\dashboard\page.tsx#L136)): Redundant `listArchiveTab` dependency was removed from useMemo to avoid extra recompute on tab switch — good optimization but subtle.

2. **Greeting randomization:** Uses day-of-year % pool.length to seed greeting. Deterministic per calendar day, not per load, which is good for consistency.

3. **Session sort by updatedAt:** Handles three timestamp formats (ISO string, Firestore Timestamp object with `seconds` field, number). Could be fragile if new formats added.

4. **Search debounce:** 300ms is reasonable but not configurable; if instant search is needed, would require refactor.

5. **"New Session" button flow:** Delegates to `useSessionEntryCta()` hook which handles either extension recording or in-app capture; unclear how DashboardCaptureHost is triggered from triggerCta.

### G) Design Considerations: What Works & What Needs Rethinking

**What works well:**
- Clear visual hierarchy: large greeting emoji + message, then tabs and filters, then list
- Responsive filter bar that adapts with actions on desktop (flex wrap with gap-y-3 fallback)
- Empty state messaging is thoughtful (archived vs active)
- Loading skeleton with BrandLoader is smooth
- Debounced search prevents API thrashing

**What could improve:**
- **Session avatar stack:** Row fields unclear from code alone; need to see SessionsWorkspace implementation for avatar maxVisible and +N badge behavior
- **Tab underline animation:** Currently instant; could add transition for polish
- **Filter persistence:** Time range filter not persisted to URL, so refresh resets to DEFAULT_FILTER
- **Bulk actions:** No multi-select or bulk archive/delete from main list
- **Mobile layout:** Hidden elements and responsive gaps suggest mobile experience may feel cramped; filter bar wraps but actions may stack

---

## 2. Session Detail Page
**File:** [app/(app)/dashboard/[sessionId]/SessionPageClient.tsx](c:\Users\user\Desktop\echly\app\(app)\dashboard\[sessionId]\SessionPageClient.tsx#L276)

### A) Structure — 3-Column Layout

**Top Bar:**
- `TopControlBar` ([#L2893](c:\Users\user\Desktop\echly\app\(app)\dashboard\[sessionId]\SessionPageClient.tsx#L2893)): Sticky header with session title, breadcrumbs, search, share button, notifications
- Only rendered if NOT public route (`!isPublicRoute`)

**3-Column Grid** ([#L2921](c:\Users\user\Desktop\echly\app\(app)\dashboard\[sessionId]\SessionPageClient.tsx#L2921)):
```
gridTemplateColumns: isCommentPanelOpen || activeThreadId 
  ? '346px 1fr 360px'  // Left | Center | Right comment panel
  : '346px 1fr'        // Left | Center (no right panel)
gap: '14px'
padding: '14px'
```

- **Left (346px, hidden on mobile <lg):** `TicketList` card with ticket sidebar
- **Center (1fr, main content):** `ExecutionView` screenshot + metadata
- **Right (360px, conditional):** `CommentPanel` for threading, only visible when comment panel is open OR a thread is selected

### B) Element Inventory

**LEFT PANEL — TicketList**
- **Header/Search:**
  - Search input for ticket filtering
  - Filter pills: "Open" | "Resolved" | "Search results"
  - Expandable sections: "Open (N)" | "Resolved (M)"
  
- **Ticket list items** (TicketItem):
  - Ticket title (text-[15px], truncated)
  - Comment count badge (text-meta, rounded-full)
  - Status badge: "Resolved" (green) or open (no badge)
  - Selected state: bg-brand-subtle, blue left border (4px)
  - Hover: bg-surface-hover
  
- **Session metadata row (bottom of left panel):**
  - Session title + workspace name
  - Updated at: relative time
  - View count + avatar stack (recent viewers with maxVisible logic)
  - Can rename session from sidebar (if isWorkspaceMember)
  
- **Pagination:** "Load more" button in list if hasMoreFeedback && !isSearchMode

**CENTER PANEL — ExecutionView (Screenshot Viewer + Metadata)**

*Toolbar above image:*
- Back button (mobile only)
- Ticket title (editable if isWorkspaceMember) ([#L2779](c:\Users\user\Desktop\echly\app\(app)\dashboard\[sessionId]\SessionPageClient.tsx#L2779))
- Status badge (Open | Processing | Resolved) + Resolve button
- Action buttons:
  - Edit mode toggle (pencil icon, only if screenshot exists)
  - Comment mode toggle (speech bubble)
  - Reopen button (if resolved)
  - Delete button (if canDeleteSelectedTicket)
  
*Screenshot viewer:*
- Centered image with aspect-ratio preservation
- Pin mode (on-image comments as red dots)
- Zoom + pan controls (inferred from setIsImageExpanded, onEdit)
- Comment thread inline popovers when activeThreadId is set
- Skeleton loading when feedbackLoading

*Below image — Metadata sections:*
- **Ticket metadata** (h3 + editable fields):
  - Title (input, auto-save on blur)
  - Description/instruction (textarea)
  - Type dropdown (Feedback | Bug | etc.)
  - Assignee badge + assign modal
  - Priority badge (High | Medium | Low)
  - Tags section (suggested tags with add/remove)
  
- **Action Steps section:**
  - List of numbered steps (1, 2, 3, etc.)
  - Each step: input + delete button
  - "Add step" button at bottom
  - Auto-save on change
  - Only editable if isWorkspaceMember

**RIGHT PANEL — CommentPanel**
- **Header:**
  - "Comments" title (text-[16px], semibold)
  - Close button (X icon)
  
- **Comments list:**
  - `CommentItem` components (recursive threading)
  - Each comment: 
    - Avatar + author name
    - Relative timestamp
    - Comment body (markdown-aware)
    - Reply count badge (if threaded)
    - Action buttons: Reply | More (delete/edit)
    
- **Comment draft area:**
  - Avatar + name
  - Textarea (placeholder: "Add a comment…")
  - Buttons: Attach file | Send
  - @mention support (implied from mentions list component)

**Mobile Adaptations:**
- Mobile button to toggle ticket navigator (lg:hidden) ([#L2984](c:\Users\user\Desktop\echly\app\(app)\dashboard\[sessionId]\SessionPageClient.tsx#L2984))
- SessionNavigator overlay (modal-like) for ticket selection on small screens
- Right panel is full-width on mobile when activeThreadId is set

### C) Interactions & Flows

| Action | Handler | Behavior |
|--------|---------|----------|
| Select ticket from left list | `setSelectedId(id)` + remove ?ticket param from URL | Center panel updates, right panel auto-scrolls to top, comment threads cleared |
| Resolve ticket checkbox | `handleResolvedChange()` → PATCH /api/tickets/:id | Optimistic UI update, then listener confirms, resolve toast appears |
| Edit ticket title | Click title → inline edit → blur to save | Auto-save via `saveTitle()` → PATCH /api/tickets/:id |
| Add action step | Click "Add step" | Optimistic insert, then `saveActionSteps()` → batch PATCH |
| Delete action step | Click X on step | Optimistic remove, then saveActionSteps, retry on failure |
| Click pin on screenshot | `onPinClick(commentId)` → `setActiveThreadId(commentId)` | Right panel opens, comment thread highlights with pulse animation |
| Click comment | Opens as activeThreadId | Switches view to thread detail, sets animatingCommentId for enter animation |
| Add comment to thread | `sendReply(parentId, text)` → POST /api/comments | Optimistic insert with LocalComment, merge with listener data when realtime arrives |
| Delete comment | POST /api/comments/:id?delete=true | Optimistic remove, rollback on error |
| Edit comment | PATCH /api/comments/:id | In-place text update |
| Assign ticket | Modal → select user → `handleAssigned(userId)` | PATCH /api/tickets/:id with assigneeId |
| Change priority | Dropdown → select level → `handlePriorityChanged(level)` | PATCH /api/tickets/:id |
| Search tickets | Type in left panel search → filter list | Real-time filtering (no debounce, local) |
| Toggle comment mode | Button → `setIsCommentMode(true)` | Hides metadata, shows cursor over screenshot for pin placement |
| Delete ticket | Click delete button → confirm modal → `handleDeleteFeedback()` | DELETE /api/tickets/:id, selection moves to next item, optimistic removal |
| Mark all resolved | Bulk action button (unclear from JSX) | POST /api/feedback/batch-resolve with feedbackIds array |
| Reopen all tickets | Bulk action button | PATCH /api/feedback/batch-resolve with isResolved: false |

### D) Data Shape & Realtime Subscriptions

**State hierarchy:**
1. **Session store** (useSyncExternalStore): `useSessionStore(sessionId)` → listener-driven, source of truth
2. **Feedback store** (useFeedbackStore): List of feedback items; listener or bundle fallback
3. **Comments store** (useCommentsStore): Realtime comment threads
4. **Presence store** (usePresenceStore): Who's viewing this session
5. **Optimistic overlays:** Local state merged on top, auto-clears after 500ms when listener catches up

**Firestore listeners attached via:**
- `retainSessionListener(sessionId)` → session doc + counts (openCount, resolvedCount, totalCount)
- `retainFeedbackListener(sessionId)` → /feedback collection snapshot for this session
- `retainCommentsListener(sessionId, feedbackId)` → comments for selected ticket
- `retainPresenceListener(sessionId)` → active viewers

**Bundle fallback** (anonymous viewers):
- GET /api/sessions/:id returns session + first page of feedback
- Feedback items serialized via `bundleFeedbackRowToFeedback()` to match domain Feedback type
- Pagination with cursor for anonymous viewers

**Access control:**
- GET /api/sessions/:id returns `sessionAccess: AccessCapabilities` 
  - `canView`, `canComment`, `canResolve`, `canDeleteTicket`
  - Used to gate UI (e.g., resolve button disabled if !canResolve)
  - Request access flow if canView=false

### E) Imported Components — Major Child Components

| Component | Path | Role |
|-----------|------|------|
| `TicketList` | @/components/layout/operating-system | Left sidebar: ticket list + search + metadata |
| `ExecutionView` | @/components/layout/operating-system | Center: screenshot viewer + ticket detail |
| `CommentPanel` | @/components/layout/operating-system | Right panel: comment threads |
| `TopControlBar` | @/components/ui/TopControlBar | Top bar: title + search + share + settings |
| `ImageViewer` | @/components/ImageViewer | Screenshot display with zoom/pan |
| `RequestAccessModal` | @/components/RequestAccessModal | Modal for requesting resolve/view access |
| `RequestSessionAccessPage` | @/components/session/RequestSessionAccessPage | Full-page access denied with request form |
| `PendingAccessBanner` | @/components/session/PendingAccessBanner | Banner: "Waiting for access approval" |
| `ResolveToast` | @/components/ui/ResolveToast | Inline toast for action feedback |
| `GlobalRail` | @/components/layout/GlobalRail | Optional overlay rail (exact role unclear) |
| `DeleteSessionModal` | @/components/dashboard/DeleteSessionModal | Confirmation before delete ticket |

### F) Rough Edges & Observations

1. **Line count is 3179** — Very large component; many concerns mixed:
   - Data fetching (session, feedback, comments)
   - Access control & permission flows
   - Optimistic updates with multiple overlays
   - Image handling (zoom, pan, edit mode)
   - Comment threading with mentions & pins
   - Share/access request modals
   - This is a candidate for further decomposition (extract hooks for each concern)

2. **Optimistic state layers:**
   - `optimisticSession` → overlay on session store data
   - `optimisticFeedback` → Map<id, Partial<Feedback> | null>
   - `insertedFeedback` → new feedback not yet in listener
   - `setResolveOptimisticMap` → dedicated resolve state
   - This creates risk of stale overlays; 500ms auto-clear is a band-aid

3. **URL params driving state:** `?ticket=` and `?comment=` sync selection but can diverge from internal state if navigation is manual

4. **GlobalRail behavior:** Imported but unclear when it's shown; likely overlay for mobile navigation

5. **Screenshot URL resolution:** `useScreenshotUrl()` hook handles signed URLs; caches per screenshotId

6. **Session counts:** Dual tracking:
   - Server counts: `session.openCount`, `session.resolvedCount`, `session.totalCount`
   - Client counts: Derived from feedback list (more accurate during optimistic updates)
   - Falls back to server counts if listener isn't ready
   - Logic: `isCountsSynced` flag controls which source is rendered

7. **Bundle pagination:** Anonymous viewers fetch feedback in pages; pagination state separate from listener model

### G) Design Considerations: What Works & What Needs Rethinking

**What works well:**
- **3-column layout** is clear: source (left) → detail (center) → discussion (right)
- **Inline editing** of title/description feels responsive; auto-save on blur
- **Optimistic updates** keep UI snappy; rollback on error is handled
- **Comment threading** with pins on screenshots is intuitive
- **Access gates** prevent actions UI from showing when user lacks permission
- **Skeleton loading** for image + metadata prevents layout shift

**What feels rough:**
- **Right panel toggle:** Only opens when user manually selects a comment; no auto-open on comment count indicator
- **Bulk actions unclear:** Code references `handleMarkAllResolved()` but UI location not obvious from render JSX
- **No confirmation for resolve:** Single click to resolve; high-risk action with no undo (though comments show history)
- **Search doesn't persist:** Search box is local to left panel; no query param, so reload clears it
- **Mobile "Tickets" button** ([#L2984](c:\Users\user\Desktop\echly\app\(app)\dashboard\[sessionId]\SessionPageClient.tsx#L2984)): Feels like a workaround; might be better as a drawer
- **Comment @mentions:** Code suggests support but UI for mention autocomplete not visible in render
- **Screenshot edit mode:** Code path exists but unclear what "edit" means (crop, annotate, replace?)

---

## 3. Discussion Page
**File:** [app/(app)/discussion/page.tsx](c:\Users\user\Desktop\echly\app\(app)\discussion\page.tsx#L18)

### A) Structure — 3-Pane Layout

```
Flex row, h-full, overflow-hidden
├─ Sidebar (220px, hidden on <lg) ── Filters
├─ Middle (340px fixed on md+, full on mobile) ── Thread list
└─ Right (flex-1, fills remaining) ── Thread detail
```

**Responsive:** 
- On mobile: Toggles between "list" and "detail" views (not visible simultaneously)
- On md+: All three panes visible side-by-side
- Sidebar hidden on <lg screens, replaced by mobile filter pills in list header

### B) Element Inventory

**SIDEBAR (≥ lg only) — DiscussionSidebar**
- Workspace name/logo (if available)
- **Project filter buttons:**
  - "All" (shows all discussions)
  - Per-session project pills (derived from listItems)
  - Each shows comment count
  - Active: bg-brand-subtle, text-brand, medium weight
  - Selected state visually distinct (darker/filled)
  
- **Stats section (below project list):**
  - "X open threads" (derived from current filter)
  - "Y total threads"
  - Skeleton loading state when isEmpty === null

**MIDDLE PANEL — DiscussionList (Thread List)**
- **Top search bar:**
  - Search icon (left)
  - Input (placeholder: "Search discussions…")
  - Real-time filter on title | sessionName | lastCommentPreview
  - No debounce (instant)
  
- **Mobile filters** (lg:hidden, only on <lg):
  - Project filter pills (horizontal scrollable)
  - Same logic as sidebar, but as pill buttons
  - "All" + project names with counts
  
- **Filter pills** (below search):
  - "All" | "Open" | "Resolved"
  - Radio-group style (single select)
  - Active: bg-brand-subtle, text-brand
  
- **Thread list items** (DiscussionList component):
  - Each item:
    - Avatar (deterministic color palette based on item.id hash)
    - Title (text-[15px], truncated, bold if unread)
    - Session context: small grey text "(SessionName)" if different from title
    - Comment count badge: text-meta, right-aligned
    - Last comment preview snippet (grey, truncated)
    - Hover: bg-surface-hover
    - Selected: bg-brand-subtle with left border
    - Status badge: "Resolved" (green) or none for open
  - Sorted by lastCommentAt DESC (most recent first)
  
- **Loading state:** MinimalLoader skeleton
- **Empty state:** "No discussions yet" message

**RIGHT PANEL — DiscussionThread (Thread Detail)**
- **Mobile back button** (<md, when mobileView==="detail"):
  - ChevronLeft icon + "All discussions" text
  - Clicking returns to list view
  
- **Thread detail** (Suspense fallback while loading):
  - Ticket metadata (title, status, created at)
  - Screenshot if available (thumbnail + expand button)
  - **Comments list** (scrollable):
    - CommentItem components (recursive for threaded replies)
    - Each comment: author avatar | name | timestamp | body | reply count
    
  - **Comment draft area:**
    - Textarea (placeholder: "Add a comment…")
    - Send button
    - Attach button (for file/screenshot)
    - Threading: replies are indented/nested
  
  - **Empty state** (when no thread selected):
    - "Select a thread to view comments"
    - Centered, placeholder text

### C) Interactions & Flows

| Action | Handler | Behavior |
|--------|---------|----------|
| Click project filter | `setSelectedProjectId(id)` | Filters list items; updates sidebar stats; mobile pills show selected state |
| Click "All" project | `setSelectedProjectId(null)` | Clears project filter, shows all discussions |
| Type search query | `setSearchQuery(text)` | Real-time filter on title + sessionName + lastCommentPreview; no debounce |
| Click thread item | `handleSelect(id)` → `setSelectedId(id)` → `setMobileView("detail")` | Opens thread detail on right (or full-screen on mobile); increments selectedIndex for "X of Y" counter |
| Click filter pill (All/Open/Resolved) | `setStatusFilter(status)` | Filters list to matching status; updates stats |
| Click back (mobile) | `handleMobileBack()` → `setMobileView("list")` | Returns to thread list, clears selectedId |
| Add comment | `sendComment(text)` → POST /api/comments | Optimistic LocalComment insert, merge with listener |
| Reply to comment | `sendReply(parentId, text)` | Creates nested comment, triggers `handleCommentAdded()` → increments reply count |
| Edit comment | `updateComment(id, text)` | PATCH /api/comments/:id |
| Delete comment | deleteComment(id) | DELETE /api/comments/:id |
| Resolve/reopen thread | Inferred button on ticket metadata | PATCH /api/tickets/:id with isResolved |

### D) Data Shape

**Fetching:**
- GET /api/feedback?conversationsOnly=true&limit=20 returns `DiscussionItem[]`
- Each item has: id, title, sessionId, sessionName, commentCount, lastCommentPreview, status, timestamps
- Projects derived from sessionId dedupe: `sidebarProjects = useMemo<SidebarProject[]>()` maps sessions to name + count

**State:**
- `listItems: DiscussionItem[]` (controlled state if setItems prop provided)
- `selectedId: string | null` (current thread)
- `selectedProjectId: string | null` (current session filter, null = all)
- `searchQuery: string`
- `mobileView: "list" | "detail"` (mobile-only toggle)

**Filtering logic:**
```javascript
sessionFilteredForStats = listItems
  .filter(i => selectedProjectId ? i.sessionId === selectedProjectId : true)
  .filter(i => searchQuery ? i.title.includes(searchQuery) : true)

statsOpenCount = sessionFilteredForStats.filter(i => i.status === "open").length
```

**Thread counter:**
- `selectedIndex`: 1-based position of selectedId in filtered list
- Displayed as "X of Y" in thread detail header

### E) Imported Components

| Component | Path | Role |
|-----------|------|------|
| `DiscussionSidebar` | @/components/discussion/DiscussionSidebar | Sidebar: project filters + stats |
| `DiscussionList` | @/components/discussion/DiscussionList | Middle: thread list + search + filters |
| `DiscussionThread` | @/components/discussion/DiscussionThread | Right: thread detail + comments |
| `CommentItem` | @/components/comments/CommentItem | Recursive comment node (threaded) |
| `MinimalLoader` | @/components/ui/MinimalLoader | Loading spinner |
| `useAuthGuard()` | @/lib/hooks/useAuthGuard | Ensures user is authenticated |

### F) Rough Edges & Observations

1. **Mobile UX:** List/detail toggle is functional but feels clunky; no breadcrumb or context hint when viewing detail on mobile

2. **Search is instant, no debounce:** Could be a performance issue with many discussions, but DiscussionList may handle filtering efficiently

3. **Sidebar hidden on <lg:** Mobile users get filter pills instead, but filtering workflow is different (sidebar has stats above list, mobile has pills inline)

4. **Project filter state not in URL:** Refresh loses the selected project filter

5. **Reply count badge:** Shown on list items but triggering reply doesn't auto-scroll thread panel to that comment

6. **Status filter not visible on mobile sidebar:** Only shown as pills in DiscussionList; unclear if this is intentional (UX decision)

7. **Typing indicator / Presence:** Not visible in code; no "User X is typing…" feedback

### G) Design Considerations

**What works well:**
- **Three-pane balanced:** Easy to navigate between project, thread list, and detail
- **Mobile toggle view:** Clean way to adapt layout without modals
- **Search + project filters combined:** Powerful filtering without overwhelming UI
- **Comment threading:** Recursive component handles nested replies elegantly

**What could improve:**
- **Sidebar visibility toggle:** On mobile, sidebar is hidden but could be a drawer or small slide-in
- **Unread indicators:** Code mentions `isUnread` field but no visual badge in list
- **Pin/star/favorite threads:** No persistent organization beyond open/resolved
- **Bulk actions:** Can't archive/delete multiple threads at once
- **Sort options:** Only "recent" is shown; no "most replied", "oldest", etc.

---

## 4. Activity Page
**File:** [app/(app)/activity/page.tsx](c:\Users\user\Desktop\echly\app\(app)\activity\page.tsx#L330)

### A) Structure — Single-Column Feed

- **Max-width container:** 1280px centered, px-6 py-8
- **Top bar:** Header with title + filters (session, member, event type)
- **Feed:** Grouped by day (Today | Yesterday | This week | Earlier)
  - Each section has horizontal divider + timeline spine (vertical line)
  - Activity items stacked below, aligned to spine
- **Load more:** Infinite scroll with IntersectionObserver + manual "Load more" fallback

### B) Element Inventory

**Page Header:**
- Title: "Activity" (text-xl, bold)
- Subtitle: "All activity across your workspace"

**Filter Toolbar** (flexbox, responsive wrapping):
- **Session filter dropdown:**
  - Pill style (FILTER_PILL_BASE + active/inactive states)
  - Label: "All sessions" or selected session name
  - Dropdown listbox with "All" option + sorted session list
  - Checkmark icon on selected
  - Active state: bg-text-body, text-white, border-text-body

- **Member filter dropdown:**
  - Pill style, similar to session
  - Shows "Members" or selected member name
  - Dropdown with all workspace members + avatars
  - Each member row: avatar | name | checkmark if selected
  - "All" option to clear filter

- **Event type filter pills** (radio group):
  - "Comments" | "Created" | "Resolved" (3 pills, ACTIVITY_FILTER_CATEGORY_IDS)
  - Active: colored background (e.g., brand-color for comments, success-color for resolved)
  - Inactive: border + text only
  - Single-select (clicking active pill toggles off)

**Feed Layout:**
- Day section header:
  - Horizontal line | "Today" label | Horizontal line (centered, symmetric)
  - Font: text-sm, semibold, text-heading/60, whitespace-nowrap

- **Timeline spine:**
  - Vertical line (h-px, bg-border/50) centered at x=26px (left of timeline icons)
  - Acts as visual grouping spine for activities in the day section

- **Activity rows** (within day section):
  - Each row has:
    - **Icon circle** (52px width, centered on spine): h-9 w-9 rounded-full, bg-surface-hover/50, icon inside (from eventIconMap)
    - **Content** (flex-1): action phrase + entity + optional preview
      - Action phrase: e.g., "commented on", "created", "resolved"
      - Entity label: feedback title (bold) or fallback
      - Session context: if different from feedback title, show in smaller text
      - Preview text: for comment.added events, show 1-2 lines of comment body (with left accent bar)
    - **Timestamp** (right-aligned): relative time "Just now", "5 min ago", etc.
  
  - Hover: bg-surface-hover/50, rounded
  - Can expand groups (system events are collapsed by default)

- **Grouped activity:**
  - Activities of same type (e.g., "user X commented 3 times") collapse into a single row
  - Row shows icon + "3 comments by User X"
  - Expand button (chevron) to show preview events
  - Expanded: shows up to 3 preview events in-line

- **System events collapse:**
  - All tier-3 events (settings changes, etc.) group together into "X system events" row
  - Expandable to show individual system events

**Empty State:**
- Icon circle with activity clock icon
- "Nothing here yet"
- Subtitle: "When your team comments, creates feedback, or resolves tickets, it will appear in this timeline."
- Centered, with decorative background blur

**Loading States:**
- Initial load: ActivitySkeletonStack (4 rows)
- Pagination: "Loading…" ActivitySkeletonStack (3 rows) shown when loadingMore

**Error State:**
- Error message in alert box (text-color-danger)
- Appears above feed

### C) Interactions & Flows

| Action | Handler | Behavior |
|--------|---------|----------|
| Click session filter | Opens dropdown → select option → `onSessionFilterChange(id)` | Updates URL ?sessionId= param (or removes if clearing), refetches feed |
| Click member filter | Opens dropdown → select member → sets `selectedMemberId` + `selectedCategory="member"` | Filters feed to activities by that user |
| Click event type pill | `selectCategory(id)` | Toggles filter on/off; if already selected, unselects; if unselected, selects |
| Scroll to bottom + nextCursor exists | IntersectionObserver triggers | `loadMore()` → fetches next page, appends to feed |
| Click "Load more activity" button | Manual load button | `loadMore()` same as above; only visible if autoFillCapped=true |
| Expand group | `toggleGroup(group)` → `loadGroupMembersIfNeeded()` | Fetches full member list for group via GET /api/activity-group-members, merges into expandedGroups map |
| Expand system collapse | `toggleSystemGroup(key)` | Expands inline to show individual system events |
| Click activity link (implied) | Activity item content is interactive | Likely navigates to feedback detail or session |

### D) Data Shape

**API Response (GET /api/activity-feed):**
```typescript
{
  events: ActivityEvent[],
  groupedEvents: GroupedActivity[], // Server-side pre-grouped
  nextCursor: { createdAt: number; id: string } | null
}
```

**ActivityEvent:**
- id, eventType (string), workspaceId, sessionId, feedbackId?, commentId?
- actor: { id, name?, photoURL? }
- metadata: { feedbackTitle?, sessionName?, commentPreview?, etc. }
- createdAt: number (ms since epoch)
- groupKey?: string

**GroupedActivity (union type):**
1. **Single event:**
   ```typescript
   { type: "single", event: ActivityEvent }
   ```

2. **Grouped events:**
   ```typescript
   {
     type: "group",
     groupId: string,
     eventType: string,
     actorId: string,
     actorName?: string,
     sessionId: string,
     primaryEventId: string,
     count: number,
     previewEvents: ActivityEvent[3], // Up to 3 samples
     createdAt: number
   }
   ```

**Feed grouping (client-side):**
1. Group by day (using `groupEventsByDay()` → { today, yesterday, earlier })
2. Partition earlier by week (thisWeek, rest)
3. Within each day: apply `collapseSystemEvents()` to group tier-3 events
4. Result: `collapsedDayBuckets` array of RenderRow[] (activity | system-collapse)

**Caching:**
- sessionStorage key: `echly_activity:workspaceId:sessionId:eventTypes:actorId`
- TTL: 5 min
- Cache hit on filter change → instant display + debounced refetch (if stale)

**Ref tracking (for perf):**
- `expandedGroupsRef` → avoids re-running collapseSystemEvents on expand/collapse toggle
- `loadingGroupsRef` → dedupes in-flight group member fetches
- `autoFillAttemptsRef` → caps auto-fill to 2 attempts per fresh fetch

### E) Imported Components

| Component | Path | Role |
|-----------|------|------|
| `ActivityItem` | @/components/activity/ActivityItem | Single or grouped activity row |
| `ActivitySkeletonStack` | @/components/activity/ActivitySkeletonRow | Loading skeleton (4 or 3 rows) |
| `useAuthGuard()` | @/lib/hooks/useAuthGuard | Auth gate |
| Icons (Clock, Check, ChevronDown, etc.) | lucide-react | UI icons for filter pills + expand buttons |

### F) Rough Edges & Observations

1. **Auto-fill logic is complex:**
   - Code caps to 2 auto-fill attempts per filter change ([#L613](c:\Users\user\Desktop\echly\app\(app)\activity\page.tsx#L613))
   - Uses requestAnimationFrame double-raf to delay viewport check
   - Fallback "Load more" button shown if autoFillCapped=true && nextCursor exists
   - This feels like a workaround; ideally viewport would stay full automatically

2. **Group member fetching:**
   - On group expand, fires GET /api/activity-group-members with groupId + params
   - AbortController prevents race conditions, but logic is intricate
   - Each group can be expanded independently, in-flight fetches deduped by groupKey

3. **Actor avatar:** ActivityItem likely renders actor.photoURL or initials; avatar not visible in page JSX, must be in ActivityItem component

4. **Tier-3 event collapse:**
   - Uses `getTier(eventType)` to classify events
   - Tier 3 = "system" (settings changes, etc.) and auto-collapsed
   - Visible in code but not explicitly defined in audit scope file

5. **Metadata extraction:** Complex metadata object unpacking to derive display strings (feedbackTitle, sessionTitle, commentPreview) with fallback chains

6. **Mobile layout:** Filter pills likely wrap or scroll horizontally on small screens; layout not explicitly responsive in code

7. **Relative time formatting:** `formatRelativeActivityTime()` ([#L154](c:\Users\user\Desktop\echly\app\(app)\activity\page.tsx#L154)) handles ms → "Just now", "5 min ago", "Yesterday", etc.

### G) Design Considerations

**What works well:**
- **Timeline visualization:** Vertical spine + icons is clean and intuitive
- **Layered filtering:** Session + Member + Event type creates powerful query capability
- **Infinite scroll + manual fallback:** Good UX balance (auto-fill when scrolling, manual button if needed)
- **Grouped activities:** Reduces clutter without losing detail (expandable)
- **Real-time responsiveness:** Cache + refetch pattern keeps page snappy
- **Empty state messaging:** Clear, encourages action

**What could improve:**
- **No search bar:** Can't keyword-search activities (only filter by session/member/type)
- **Pagination UI:** "Load more" button appears sporadically; state isn't obvious
- **Auto-fill behavior:** Capping at 2 attempts feels arbitrary; should be based on viewport fill only
- **System event category:** Not listed in ACTIVITY_FILTER_CATEGORY_IDS; can't directly filter to system-only view
- **Grouping customization:** Always grouped by day + type; no "sort by actor", "sort by session", etc.
- **Mark as read:** Code doesn't show a "mark all as read" feature (though individual activity items might support it)

---

## 5. Settings Page
**File:** [app/(app)/settings/page.tsx](c:\Users\user\Desktop\echly\app\(app)\settings\page.tsx#L87)

### A) Structure — Tab-Based Layout

- **Page container:** Max-width 1280px, px-6 py-10, single-column
- **Header:** Title "Settings" + subtitle
- **Tab navigation:** Horizontal tabs with underline indicator (matches dashboard pattern)
- **Tab content:** Swapped based on activeTab state
- **Tabs:** "My account" | "Workspaces" | "Workspace" | "Security" | "Billing" (Workspaces hidden if ≤1 workspace)

### B) Element Inventory by Tab

#### TAB 1: "My Account" (MyAccountTab)
*Not fully read, inferred from imports and usage context*
- Display name
- Email (readonly, or changeable via modal)
- Photo/avatar upload
- Timezone setting
- Notification preferences
- Account deletion button

#### TAB 2: "Workspaces" (WorkspacesTab) — [#L235](c:\Users\user\Desktop\echly\app\(app)\settings\page.tsx#L235)
- **Header:** "Your workspaces" + "Switch between workspaces you belong to"
- **Workspace list card** (white bg, border, rounded-16):
  - Per-workspace row: Flex layout with gap-14
    - **Logo:** 36px circle, workspace logo or initial letter (bg-brand, white text, bold)
    - **Content:** Name + role (Owner | Member)
    - **Status badge:** "Current" (only on active workspace, bg-brand-subtle, text-brand, text-11, font-600, rounded-999)
    - **Switch button:** Only enabled if not current; shows "Switching…" text while in-flight
  - Row separator (1px border-surface-hover)
  - Hover: cursor-pointer (if not current)
  - Disabled: cursor-default, opacity reduced

#### TAB 3: "Workspace" (WorkspaceTab) — [#L309](c:\Users\user\Desktop\echly\app\(app)\settings\page.tsx#L309)
- **Header:** "Workspace Settings" + "Manage your workspace identity and members"
- **Main card** (white bg, border, rounded-16, overflow-hidden):

  **Section 1: Workspace Identity** (padding-28px 32px, flex gap-24)
  - **Logo upload column:**
    - 88px circle, bg-surface-subtle, border: 2px var(--border)
    - Logo image (if exists) or initial letter (grey text, fontSize-28)
    - Hover overlay: semi-transparent black + Camera icon
    - Uploading state: spinner overlay on logo
    - "Remove" link (text-color-danger, underline on hover) if logo exists
    - Hidden file input (accept: JPEG, PNG, WebP, HEIC)
    - Click logo → opens file picker
    - File selection → image crop modal → POST /api/workspace/logo
    
  - **Workspace name column:**
    - Label: "Workspace name" (text-13, font-500, text-secondary)
    - Input: h-42, rounded-9, border-1.5px, bg-surface-input
    - Focus: border-brand, bg-white, box-shadow 3px rgba(brand, 0.10)
    - Value: nameDraft state
    - Disabled if: loading || !isWorkspaceOwner
    
    - **Save button** (only if isWorkspaceOwner):
      - h-38, px-4, rounded-9, text-14 font-medium
      - Normal state: bg-brand, text-white
      - Saving state: bg-brand (with spinner + "Saving…" text)
      - Saved state: bg-success, text with Check icon + "Saved!" (shows 2 sec)
      - Disabled: nameDraft.trim() empty, or loading, or not owner
      - Opacity 0.7 when disabled
      - onClick → handleSave() → updateWorkspaceName() → Firestore update
    
    - Owner-only note: "Only workspace owners can edit the name."
  
  **Divider:** 1px margin-28px 0, bg-surface-hover
  
  **Section 2: Members** (MembersTab component)
  - Detailed in separate section below

- **Loading skeleton** (when loading=true):
  - Shimmer animation
  - Placeholder blocks for logo (88px circle), name input (42px), buttons (38px)
  - Member list skeleton rows (32px avatars, text blocks)

- **Logo crop modal:** ImageCropModal (dynamic import)
  - Opens when file selected
  - Shape: "circle" (crops square for avatar)
  - Title: "Crop workspace logo"
  - Confirm: "Save logo" button

#### TAB 4: "Security" (SecurityTab) — [#L2030+, not fully shown]
*Inferred:*
- Current password change
- Two-factor authentication toggle
- Active sessions / device management
- Password recovery options

#### TAB 5: "Billing" (BillingTab) — [#L2030+, not fully shown]
*Inferred:*
- Current plan display (Free | Pro | Enterprise)
- Billing cycle + next renewal date
- Payment method
- Usage metrics
- Upgrade/downgrade buttons
- Invoice history

### C) MembersTab Sub-Component (within Workspace tab)

*Inferred from code structure and common patterns:*
- **Header:** "Members" + "Add, remove, or manage team members"
- **Member list** (white bg, border, rounded-16, overflow-hidden):
  - Per-member row: Flex gap-12
    - Avatar (32px circle with initials or photo)
    - **Content:**
      - Name (text-15, font-600)
      - Email (text-13, text-secondary)
      - Role badge (Owner | Admin | Member)
    - **Actions (right side):**
      - Make Owner / Remove Owner button (depends on current role + permissions)
      - Remove button (text-color-danger)
      - Disabled if: only one owner, or current user
  - Row separator (1px border-surface-hover)
  - Hover: bg-surface-hover

- **Invite section:**
  - "Invite team member" button (h-38, brand bg, text-white)
  - Opens InviteMemberModal (dynamic import)
  
- **Invite modal:**
  - Input: email address(es) (comma-separated or one per field)
  - Role selector: Owner | Admin | Member (radio group, default Member)
  - Permissions table: what each role can do (read-only display)
  - Send invites button
  - Pending invites list (with resend/cancel options)

### D) Interactions & Flows

| Tab | Action | Handler | Behavior |
|-----|--------|---------|----------|
| All | Click tab | `setActiveTab(id)` | Swaps content, updates searchParams |
| All | Refresh page with ?tab=X | useEffect on searchParams | Auto-selects tab on mount |
| Workspaces | Click workspace row | `switchWorkspace(wid)` | navigates to workspace, clears settings |
| Workspaces | Switching... | Shows "Switching…" text + disables button | After switch completes, page reloads or redirects |
| Workspace | Click logo | File picker → select image → crop modal | Crop → POST /api/workspace/logo → setLogoUrl |
| Workspace | Type workspace name | `setNameDraft(text)` | Updates input value |
| Workspace | Press Enter or click Save | `handleSave()` → `updateWorkspaceName(wid, name)` | PATCH (or Firestore update), show "Saved!" 2 sec toast |
| Workspace | Click "Remove" logo | `handleRemoveLogo()` → DELETE /api/workspace/logo | Removes logo, shows "Logo removed" toast |
| Workspace | Refresh logo URL | useEffect on workspaceId | GET /api/workspace/logo → refreshes signed URL (Phase 7 note) |
| Members | Click "Invite" button | Opens InviteMemberModal | Fills email input, can add multiple |
| Members | Send invites | POST /api/workspace/invite | Sends invitation emails, updates pending list |
| Members | Click member Make Owner | PATCH /api/workspace/members/:uid | Promotes role, updates row display |
| Members | Click Remove member | Confirm modal → PATCH delete | Removes from workspace, updates list |
| Members | Resend invite | POST /api/workspace/invite/resend | Sends fresh invite email |

### E) Data Shape

**Workspace document (Firestore):**
```typescript
{
  id: string,
  name: string,
  logoUrl?: string,
  ownerId: string,
  createdAt: Timestamp,
  members: { [uid]: { role: "owner" | "admin" | "member", joinedAt: Timestamp } }
}
```

**WorkspaceMembership (from allWorkspaces array):**
```typescript
{
  workspaceId: string,
  name: string,
  logoUrl?: string,
  isOwner: boolean
}
```

**WorkspaceMember (members list):**
```typescript
{
  uid: string,
  email: string,
  displayName?: string,
  avatarUrl?: string,
  role: "owner" | "admin" | "member"
}
```

**Subscription:**
- `listenToWorkspace(workspaceId, setWorkspace, isIdentityReady)` → real-time Firestore snapshot
- Updates workspace state whenever doc changes

### F) Imported Components

| Component | Path | Role |
|-----------|------|------|
| `InviteMemberModal` | @/components/workspace/InviteMemberModal | Invite form modal |
| `ImageCropModal` | @/components/ui/ImageCropModal | Logo crop / image editor |
| `ModalPortal` | @/components/ui/ModalPortal | Portal for modals |
| `Button` | @/components/ui/Button | Generic button (used sparingly here, mostly inline styles) |
| `Card` | @/components/ui/Card | Generic card (not used, manual styling instead) |
| `Tooltip` | @/components/ui/Tooltip | Hover tooltip (used for upgrade badge on Billing tab) |
| `MinimalLoader` | @/components/ui/MinimalLoader | Loading spinner |
| `BillingUsageProvider` | @/lib/billing/BillingUsageProvider | Context for billing data (wraps tab content) |
| Icons (Mail, Check, Eye, EyeOff, Lock, AlertCircle, Users, Gem, etc.) | lucide-react | UI icons |

### G) Style Constants (Top of File)

```typescript
const SETTINGS_CARD = "rounded-[var(--radius-md)] ... hover:shadow-[var(--shadow-md)]"
const CARD_GAP = "space-y-8"        // 32px between cards
const ROW_GAP = "space-y-5"         // 20px between rows
const SECTION_TITLE = "text-lg font-semibold ..."
const SECTION_SUBTITLE = "text-[16px] font-semibold ..."
const SECTION_DESC = "text-[14px] text-secondary mt-1"
const BTN_PRIMARY = "h-[38px] bg-text-heading hover:opacity-85 ..."
const BTN_SECONDARY = "h-[38px] border bg-transparent hover:bg-surface-hover ..."
```

These are applied throughout the settings tabs for consistent styling.

### H) Rough Edges & Observations

1. **Inline styles vs Tailwind:** Mix of Tailwind classes and inline `style={}` objects; inconsistent approach makes refactoring harder

2. **Logo upload flow:**
   - Uses FileReader to read file → creates object URL → passes to ImageCropModal
   - Crop modal returns blob → FormData → POST to /api/workspace/logo
   - Signed URL refresh happens separately on component mount
   - Phase 7 note suggests recent work on logo URL signing

3. **Name save behavior:**
   - Auto-clears "Saved!" toast after 2 sec
   - If name hasn't changed, still shows "Saved!" (no-op success)
   - Unclear if user can edit name if not owner (UI disabled but no error message)

4. **Member list loading:**
   - Initially shows skeleton animation (shimmer)
   - Once loaded, renders static list
   - No real-time member list updates (would need onSnapshot listener)

5. **Change email modal** ([#L792](c:\Users\user\Desktop\echly\app\(app)\settings\page.tsx#L792)):
   - Requires current password for verification
   - Sends confirmation email
   - Email doesn't change until user clicks confirmation link
   - Good security, but UX requires user to check email

6. **2FA / Password tab:**
   - Code not shown in audit scope (read up to line 200+ of settings)
   - Likely pattern: password form, 2FA enable/disable toggle, backup codes

7. **Billing tab:**
   - Wrapped in `BillingUsageProvider` context
   - Likely displays plan, usage metrics, upgrade button
   - May have Stripe integration (not visible in code)

### I) Design Considerations

**What works well:**
- **Tab navigation:** Clear, consistent with dashboard pattern
- **Section headers:** Descriptive titles + subtitles set context
- **Logo upload UX:** File picker → crop → save flow is intuitive
- **Workspace switcher:** One-click to switch, clear "Current" badge
- **Form validation:** Save button disables when name empty or loading
- **Toasts for feedback:** Success/error messages confirm actions
- **Skeleton loading:** Prevents layout shift during data load

**What could improve:**
- **No confirmation for member removal:** High-risk action with no undo prompt
- **Member role changes:** Should also require confirmation
- **Logo removal:** Could have undo / recovery period
- **Email change flow:** Requires password + email confirmation; feels tedious but secure
- **Workspace name editing:** Disabled for non-owners with just a note; could show "Contact owner" button instead
- **Billing info:** Not fully visible in audit; likely needs design review for clarity
- **2FA setup:** Common pain point; needs clear step-by-step UX
- **Bulk member actions:** No way to invite multiple people at once or export member list

---

## Shared Patterns (Cross-Cutting)

### Page Header Pattern
- **Max-width container:** 1280px, mx-auto, px-6
- **Title:** text-xl font-bold, text-heading, tracking-[-0.4px]
- **Subtitle:** text-sm font-normal, text-secondary, mt-1
- Example: Dashboard, Activity, Settings pages all follow this

### Tab Navigation Pattern
- **Horizontal tabs** with underline indicator on active
- **Active state:** font-semibold, text-heading, h-[3px] rounded-full bottom border (brand color)
- **Inactive state:** font-medium, text-secondary, hover → text-heading
- **Applied to:** Dashboard (Sessions/Archived), Settings (5 tabs), Discussion (status filter pills as variant)

### Card Pattern (SETTINGS_CARD variant)
```
rounded-[var(--radius-md)]
border: 1px solid var(--border-default)
bg: white
p: 28px
transition: border-color, box-shadow
hover: border-strong, shadow-md
```
- Used for workspace settings, member management, workspace switcher rows
- Spacing between cards: `space-y-8` (32px)
- Spacing between rows within card: `space-y-5` (20px)

### Button Patterns
1. **Primary Button (BTN_PRIMARY):**
   - h-[38px], px-4, rounded-var(--radius-btn)
   - bg-text-heading (dark), text-white
   - hover: opacity-85
   - disabled: opacity-50, pointer-events-none

2. **Secondary Button (BTN_SECONDARY):**
   - h-[38px], px-4, rounded-var(--radius-btn)
   - border: 1px var(--border)
   - bg: transparent, text-text-heading
   - hover: bg-surface-hover, border-border-strong
   - disabled: opacity-50

3. **Icon buttons:** Often use lucide-react icons with hover color changes

### Dropdown/Popover Pattern
- **Trigger button:** Pill or standard button with ChevronDown icon
- **Dropdown menu:** Absolute positioned, z-[200] or z-50 (depends on context)
- **Menu items:** flex items-center gap-2, px-3 py-2, hover:bg-surface-hover
- **Selected state:** font-medium, bg-surface-hover/60
- **Checkmark:** text-brand or text-text-secondary, right-aligned
- Applied to: Session filter, Member filter, Event type filter, Time range filter, Status filter

### Modal Pattern
- **Overlay:** fixed inset-0, z-[MODAL_LAYER_Z_INDEX], bg-black/[0.5], backdrop-filter blur(4px)
- **Modal body:** bg-white, borderRadius-20, max-width-440, shadow-24px-64px, overflow-hidden
- **Header:** flex items-center justify-between, height-56, px-6, py-0, border-b
- **Content:** p-24, text area
- **Footer:** flex gap-8, justify-end
- Applied to: RequestAccessModal, DeleteSessionModal, ImageCropModal, InviteMemberModal, Change Email Modal, etc.

### Loading State Pattern
1. **Skeleton:** Shimmer animation on placeholder blocks (0.45 opacity at 50%)
2. **Spinner:** 20px circle, 2px border, border-top transparent, spin 0.7s animation
3. **Loader:** BrandLoader (custom branded spinner) or MinimalLoader (subtle)
4. **aria attributes:** aria-busy="true", aria-live="polite" on loading containers

### Empty State Pattern
- **Centered container:** py-16, text-center
- **Icon circle:** 16px diameter, rounded-2xl, border, bg-gradient, shadow-sm (can be decorative)
- **Title:** text-[15px] font-medium, text-heading/90, tracking-tight
- **Description:** text-sm, leading-relaxed, text-secondary, max-w-sm
- Applied to: EmptySessionsCard, ArchiveEmptyState, Activity "Nothing here yet", Discussion "No threads"

### Toast/Notification Pattern
- **Position:** fixed bottom-24, left-50%, translate-x-[-50%]
- **Style:** bg-text-heading, text-white, px-5 py-3, rounded-10, fontSize-14, fontWeight-500
- **Auto-dismiss:** 3000ms timeout (settable per toast)
- Applied to: SessionsPage (join workspace), SettingsPage (save confirmation), DiscussionThread (upload success), etc.

### Search Input Pattern
- **Container:** relative, with icon positioned absolutely left
- **Icon:** lucide Search icon, h-3.5 w-3.5, text-meta, pointer-events-none, left-2.5 top-50% -translate-y-1/2
- **Input:**
  - w-full, pl-8 (icon space), pr-3, py-[7px]
  - text-[14px]
  - bg-surface-subtle, border-1px var(--border), rounded-lg
  - placeholder: text-meta
  - focus: border-brand/50, bg-white
  - transition-colors
- Applied to: Dashboard search, Discussion search, Session page ticket search

### List Item Pattern
- **Row:** flex items-center gap-3, p-3, border-b (except last)
- **Active state:** bg-brand-subtle, left-border-4 brand-color
- **Hover state:** bg-surface-hover
- **Selected state:** text-heading, font-medium
- **Inactive state:** text-secondary, lighter text
- Applied to: Session rows, Discussion threads, Ticket list, Activity rows

### Timeline / Spine Pattern
- **Vertical line:** absolute, h-full w-px, bg-border/50
- **Icon circles:** positioned along spine, relative z-10, bg-surface-hover/50, h-9 w-9, rounded-full, icon centered
- **Horizontal connector (implicit):** gap-3 between icon and content
- Applied to: Activity feed (most prominent use)

### Avatar Pattern
- **Size variants:** 32px, 36px, 88px (logo)
- **Style:** rounded-full, object-fit-cover, overflow-hidden
- **Fallback initial:** 1-2 letters, uppercase, centered, bold
- **Colors:** Deterministic palette based on ID hash (for consistency)
- **With badge:** Small circle (top-right corner) for unread/status
- Applied to: Profile dropdowns, Member lists, Comment authors, Activity actors, Workspace logos

### Timestamp / Relative Time Pattern
- **Display:** "Just now", "5 min ago", "Yesterday", "Jan 15" (depends on recency)
- **Tooltip:** ISO 8601 on hover (if available)
- **Font:** text-[14px], text-secondary, font-normal
- Applied to: Activity timestamps, Discussion updated-at, Session last-updated, Comment posted-at

### Badge Pattern
- **Inline badges:** Rounded-full, px-2.5 py-1, text-[12px], font-medium, border-1px
- **Status badges:** Green for resolved, grey for open, yellow for processing
- **Role badges:** Owner, Admin, Member in settings
- **Count badges:** Comment count, open count, etc.
- Applied to: Status displays, Role indicators, Count displays, Pill filters

### Accessibility Patterns
- **ARIA attributes:** aria-busy, aria-live, aria-label, aria-selected, aria-current, role="tablist" etc.
- **Focus rings:** focus-visible:ring-2, focus-visible:ring-offset-2, focus:outline-none (custom ring)
- **Semantic HTML:** button type="button", input type="text|email|password", nav for tab navigation, main for content
- **Color contrast:** var(--text-heading), var(--text-secondary) likely pass WCAG AA
- **Skip links / keyboard nav:** Not obvious in code audit, may need verification

---

## Summary: What to Preserve vs Rethink

### Preserve:
1. **Consistent tab + underline navigation** — Works across pages, clear visual indicator
2. **Debounced search + filtering** — Responsive, prevents API thrashing
3. **Optimistic updates** — Snappy UX; 500ms auto-clear is good balance
4. **3-column layout (session detail)** — Intuitive: source | detail | discussion
5. **Timeline spine (activity)** — Clean visual grouping
6. **Responsive design with mobile toggles** — Adapts well without modals
7. **Skeleton loading** — Smooth perceived performance
8. **Empty states with context** — Guides users toward action
9. **Card + section hierarchy** — Clear visual structure in settings
10. **Relative timestamps** — More natural than absolute times

### Rethink:
1. **Bulk actions visibility** — Hard to discover (marked all resolve/unresolve)
2. **Right panel auto-open behavior** — Only opens on manual click; could auto-open on comment count
3. **Mobile bottom nav** — "Tickets" button on mobile session detail feels clunky; drawer might be better
4. **Session name persistence** — Not in URL; refresh loses context (could use sessionStorage)
5. **Filter persistence** — Time range, event type filters reset on refresh; consider URL params
6. **Member list real-time sync** — No listener; manual API fetch (add onSnapshot for live updates)
7. **Permission error UX** — Some actions disabled silently; consider "request access" affordance
8. **Duplicate patterns:** Settings uses inline styles, dashboard uses Tailwind; standardize approach
9. **No batch invite** — Can only invite one member per modal invocation
10. **Ungrouped activity option** — No way to view flat timeline; grouping always on

---

## Conclusion

Echly has a **solid, functional UI** with clear information hierarchy and responsive design. The 3-column session detail layout and activity timeline are particularly well-designed. The settings page is clear but could use better consistency between Tailwind and inline styles.

**Main areas for design refinement:**
- Visibility of bulk/batch actions
- Better mobile UX (drawers vs buttons)
- URL param persistence for filters
- Real-time data sync for member lists
- Standardize button + card patterns across codebase

The app follows good accessibility practices (ARIA, semantic HTML, focus states) and avoids common pitfalls like layout shift (skeleton loading, fixed widths). A design system component audit would likely reveal opportunities to extract `SETTINGS_CARD`, button variants, and modals into reusable components.