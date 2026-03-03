# DASHBOARD SYSTEM INTELLIGENCE REPORT

---

## STEP 1 — PROJECT STRUCTURE

### 1. Dashboard-related routes/pages

| Route | File | Type |
|-------|------|------|
| `/` | `app/page.tsx` | Root; minimal "Echly Web Core" landing (not dashboard) |
| `/login` | `app/login/page.tsx` | Login; Google sign-in, redirect to `/dashboard` |
| `/dashboard` | `app/(app)/dashboard/page.tsx` | Workspace list (main dashboard) |
| `/dashboard/[sessionId]` | `app/(app)/dashboard/[sessionId]/page.tsx` → `SessionPageClient.tsx` | Session feedback board |
| `/dashboard/[sessionId]/overview` | `app/(app)/dashboard/[sessionId]/overview/page.tsx` | Session overview (metrics, previews, activity) |

**Note:** GlobalRail links to `/capture`, `/analytics`, `/settings` — no corresponding app routes exist; these are dead links.

---

### 2. Layout components

| Component | Path | Used in | Role |
|-----------|------|---------|------|
| **Root layout** | `app/layout.tsx` | All pages | GlobalNavBar, full-height flex, `pt-[56px]` for content |
| **GlobalNavBar** | `components/layout/GlobalNavBar.tsx` | Root layout | Fixed top header: logo, Share, Copy link, More, Search, Notifications, User avatar (placeholder "U") |
| **App layout** | `app/(app)/layout.tsx` | Routes under `(app)` | GlobalRail (sidebar), main content area, ErrorBoundary, footer text "All changes saved • Secure session" |
| **GlobalRail** | `components/layout/GlobalRailRail.tsx` | App layout | Left rail (72px): home (Box), Dashboard, Sessions, Capture, Analytics, Settings; icon-only with hover tooltips |
| **Session page shell** | Inline in `SessionPageClient.tsx` | Session page | Left sidebar (FeedbackSidebar), center main (header + detail), optional right Activity panel |
| **Overview header** | `OverviewSessionHeader` in overview page | Overview page | Session title, date, Share, "Open Feedback Board", Settings (icon) |

---

### 3. Reusable UI components used inside dashboard

**Dashboard (workspace list):**
- `WorkspaceCard` — session card with title, feedback/open counts, view/comment counts, status dot, more menu (Copy link, Share, Rename, Archive, Delete)
- `ShareSessionModal`, `RenameSessionModal`, `DeleteSessionModal`

**Session page (feedback board):**
- `FeedbackSidebar` — filter (all/active/resolved), search, list with load-more sentinel
- `FeedbackDetail` — wrapper for header + content
- `FeedbackHeader` — index/total, editable title, ResolvedToggle, Delete, Activity toggle, created/updated dates
- `FeedbackContent` — DescriptionSection, ScreenshotBlock (Section "Attachments"), SuggestionSection, ActionItemsSection, Tags (Tag + add-tag popover)
- `ActivityPanel` — ActivityComposer, ActivityThread (comments)
- `ActivityComposer`, `ActivityThread`, `CommentInput`, `CommentItem` (via ActivityPanel)
- `ResolvedToggle`, `Tag`, `Section`, `DescriptionSection`, `ScreenshotBlock`, `SuggestionSection`, `ActionItemsSection`
- `SessionPremiumLoader` (imported but rendered behind `false` — unused)
- `FeedbackPremiumLoader` — skeleton for feedback list loading
- `SessionPageSkeleton` — inline skeleton for auth/session loading

**Overview page:**
- Inline: `OverviewSessionHeader`, `MetricCard`, `FeedbackPreviewRow`, `StatusSection`, `TagDistribution`, `RecentActivity`

**Shared/UI:**
- `Button`, `Avatar`, `FeedbackTag` (tagConfig used in FeedbackContent via Tag)
- `Image` (Next.js) for user photo, expanded screenshot, logo

---

### 4. State management logic (context, hooks, stores)

**No global context or external store.** All state is local + React hooks.

**Hooks used by dashboard:**

| Hook | Path | Purpose |
|------|------|---------|
| `useWorkspaceOverview` | `app/(app)/dashboard/hooks/useWorkspaceOverview.ts` | Auth (onAuthStateChanged), sessions + counts from Firestore/repos, createSession, updateSession, removeSession, stats (totalSessions, activeSessions, totalFeedbackItems, openIssues) |
| `useSessionFeedbackPaginated` | `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts` | GET /api/feedback pagination (cursor, limit 20), infinite scroll (IntersectionObserver, 150ms debounce), load cap 200; total/activeCount/resolvedCount from first page |
| `useFeedbackDetailController` | `app/(app)/dashboard/[sessionId]/hooks/useFeedbackDetailController.ts` | Realtime comments (listenToCommentsRepo), sendComment, resolve (resolveFeedback) |
| `useSessionOverview` | `app/(app)/dashboard/[sessionId]/overview/hooks/useSessionOverview.ts` | One-shot load: session, countsByStatus, totalCount, recent feedback, open/resolved preview (3 each), recent comments → activity items, tagCounts |
| `useAuthGuard` | `lib/hooks/useAuthGuard.ts` | Redirect to /login if unauthenticated; used on session and overview pages |

**SessionPageClient local state (representative):** session, userName, userPhotoURL, selectedId, sessionLoading, detailTicket, detailLoading, isCommentsOpen, isEditingDescription, descriptionDraft, isSavingDescription, saveDescriptionSuccess, isImageExpanded, showDeleteModal, isEditingSessionTitle, sessionTitleDraft, isSavingSessionTitle, saveSessionTitleSuccess, insightRevealed.

**Dashboard page:** search (string), filteredSessions (derived via filterAndSortSessions).

**WorkspaceCard:** copyTooltip, showTooltip, moreOpen, shareOpen, renameOpen, deleteOpen, archiving.

---

### 5. API calls used inside dashboard

| API | Method | Used in | Purpose |
|-----|--------|---------|---------|
| `/api/feedback` | GET | useSessionFeedbackPaginated | Paginated feedback for session (sessionId, cursor, limit); returns feedback, nextCursor, hasMore, total, activeCount, resolvedCount |
| `/api/feedback` | POST | (extension/create flow; addFeedback in lib used for structure-feedback flow) | Create feedback (used from SessionPageClient handleTranscript → addFeedback after structure-feedback) |
| `/api/sessions` | GET | (indirect: useWorkspaceOverview uses getUserSessions from lib, not this route) | — |
| `/api/sessions` | POST | (createSession in lib used by useWorkspaceOverview; no direct dashboard API call to POST /api/sessions) | — |
| `/api/sessions/[id]` | PATCH | SessionPageClient (session title), WorkspaceCard (title, archived) | Update session title or archived |
| `/api/sessions/[id]` | DELETE | WorkspaceCard (DeleteSessionModal) | Delete session |
| `/api/tickets/[id]` | GET | SessionPageClient fetchDetailTicket | Load single ticket (detail panel) |
| `/api/tickets/[id]` | PATCH | SessionPageClient (saveTitle, saveDescription, saveActionSteps, saveTags, saveResolved, handleMarkAllResolved) | Update ticket fields |
| `/api/structure-feedback` | POST | SessionPageClient handleTranscript | Turn transcript into structured tickets (AI) |
| `/api/session-insight` | POST | SessionPageClient (useEffect) | Generate session AI summary (aiInsightSummary) |

**Client-side only (no dashboard API route):** Firebase auth (onAuthStateChanged, signInWithPopup), Firestore getDoc(doc(db, "sessions", sessionId)) for session doc in SessionPageClient, recordSessionViewIfNew, addFeedback/deleteFeedback (lib/feedback), uploadScreenshot, listenToCommentsRepo (realtime comments). useWorkspaceOverview uses lib/sessions (getUserSessions, createSession) and lib/feedback (getSessionFeedbackCounts) — direct Firestore/repos, not Next API. Overview page uses useSessionOverview which calls lib/sessions (getSessionById), lib/feedback (getSessionFeedbackCounts, getSessionFeedbackTotalCount, getSessionFeedback, getSessionFeedbackByResolved, getFeedbackByIds), lib/comments (getSessionRecentComments) — all client-side repo calls, no dashboard API routes.

---

### 6. Database models connected to dashboard

**Firestore collections (via lib/repositories and lib/*.ts):**

| Collection | Domain type | Repository | Dashboard usage |
|------------|-------------|------------|-----------------|
| `sessions` | Session | sessionsRepository | List (getUserSessionsRepo), get by id, create, update title/archived, delete; viewCount, commentCount, aiInsightSummary |
| `feedback` | Feedback (ticket) | feedbackRepository | Paginated list, get by id, add, update (title, description, actionSteps, suggestedTags, isResolved), delete; counts (open/resolved) |
| `comments` | Comment | commentsRepository | Realtime listener per feedback, add comment; recent comments for overview activity |

**Domain types:** Session (id, userId, title, archived, createdAt, updatedAt, createdBy, viewCount, commentCount, aiInsightSummary, aiInsightSummaryFeedbackCount, aiInsightSummaryUpdatedAt), Feedback (id, sessionId, userId, title, description, type, isResolved, createdAt, contextSummary, actionSteps, suggestedTags, screenshotUrl, etc.), Comment (id, sessionId, feedbackId, userId, userName, userAvatar, message, createdAt).

**No users collection** used by dashboard; auth is Firebase Auth (uid, displayName, photoURL, email).

---

## STEP 2 — DASHBOARD UI BREAKDOWN

**Main dashboard page:** `app/(app)/dashboard/page.tsx` (Workspaces list).

### 1. Visible UI sections

- **Header:** Title "Workspaces", subtitle "Sessions and feedback in one place.", primary button "New Session", search input "Search sessions".
- **Main:** Responsive grid of WorkspaceCards (1–5 columns by breakpoint).
- **Empty list message:** Single line when no sessions (or no search match).

### 2. Widgets/cards and data displayed

- **WorkspaceCard (per session):**
  - Session title (line-clamp 2).
  - Status dot: gray (no feedback), attention (open), success (all done).
  - Metrics: feedback count, open count.
  - Activity: view count (Eye), comment count (MessageCircle).
  - Audit: "ID: FB-{last 6 of session.id}".
  - Actions (hover): More menu → Copy link, Share, Rename, Archive, Delete permanently.
- **Modals:** ShareSessionModal, RenameSessionModal, DeleteSessionModal (triggered from card).

### 3. Filters / search / sorting

- **Search:** Single input "Search sessions"; filters cards by session title (case-insensitive).
- **Sort:** Sessions sorted by `updatedAt` descending (most recent first). No user-controlled sort.
- **Filter:** No status/archived filter on main dashboard (archived excluded in repo; no "Archived" view). Comment in code: "TODO: Future: Archived view to list archived sessions."

### 4. Empty states

- **No sessions:** "No sessions yet. Create one to get started."
- **Search no match:** "No sessions match your search."
- **No placeholder or illustration;** text only.

### 5. Loading states

- **Initial load:** Full-width block with centered text "Loading workspace…" (no skeleton).

### 6. Error states

- **None.** No error boundary message specific to dashboard page; no API error UI. useWorkspaceOverview does not expose error state to the page.

### 7. Unused components imported

- **Main dashboard page:** None; only useWorkspaceOverview, WorkspaceCard, router, useState, useMemo.
- **SessionPageClient:** `SessionPremiumLoader` is imported and rendered as `{false && <SessionPremiumLoader />}` — never shown (unused).

### 8. Placeholder sections

- **Dashboard:** Comment "TODO: Future: Archived view to list archived sessions." — no archived UI.
- **GlobalNavBar:** Share, More, Search, Notifications, User avatar are present but generic (e.g. avatar shows "U"); no session-specific or app-specific behavior beyond copy link.
- **Overview:** Settings button has no handler (aria-label only).

---

## STEP 3 — USER FLOW ANALYSIS

### 1. Primary user action on the dashboard

- **Workspace list:** Open a session (click card or "View" behavior) → navigate to `/dashboard/[sessionId]`.
- **Session page:** Select feedback in sidebar → read/edit detail in main area; resolve, edit title/description/action steps/tags, delete, open Activity (comments).

### 2. Secondary actions

- Create session: "New Session" → new session in Firestore, redirect to that session.
- Search sessions by title.
- Per card: Copy link, Share (modal), Rename (modal), Archive, Delete (modal).
- Session page: Edit session title (header), view session summary (if aiInsightSummary), mark all resolved (sidebar menu), add/remove tags, toggle resolved, delete feedback, expand screenshot, open/close Activity panel, send comments.
- Overview page: Share (copy URL), "Open Feedback Board" (to session), Copy link; no Settings implementation.

### 3. "Aha moment" in current dashboard

- **Workspace list:** Seeing all sessions and open/feedback counts at a glance; creating a session and landing in the feedback board.
- **Session page:** First structured feedback item appearing in the sidebar and detail (especially after extension or transcript flow); resolving items and seeing counts update; optional session summary (View session summary).

### 4. Clear CTA

- **Workspace list:** "New Session" is the only primary CTA.
- **Session page:** No single dominant CTA; "Activity" and "Mark all as resolved" are secondary. Primary interaction is selecting and editing feedback.
- **Overview:** "Open Feedback Board" is the main CTA to the session.

### 5. Where the user goes next after landing

- **After login:** Redirect to `/dashboard` (workspace list).
- **From workspace list:** Click card → `/dashboard/[sessionId]` (feedback board).
- **From session:** Back via browser or rail "Dashboard"/"Sessions" → `/dashboard`. No in-page "Back to workspaces" link.
- **From overview:** "Open Feedback Board" → `/dashboard/[sessionId]`. Overview is only reachable by direct URL or unknown entry; no link from dashboard or session page to overview.

### 6. Dead ends

- **GlobalRail:** Links to `/capture`, `/analytics`, `/settings` — no routes; 404 or blank.
- **Overview:** No navigation from main dashboard or session page to overview; discovery only by URL.
- **Last feedback deleted:** Router pushes to `/dashboard/${sessionId}` (session URL with no feedback); empty state "No feedback yet" with no explicit "Back to workspaces" (user can use rail).
- **Session not found / wrong user:** SessionPageClient and overview redirect to `/dashboard` (good).

### 7. High cognitive load areas

- **Session page:** Many concurrent concerns: sidebar list, filters, search, detail header (title edit, resolved, delete, activity), description edit, attachments, action steps, tags, activity panel. Single page holds list + detail + optional third column.
- **WorkspaceCard:** Dense: title, two counts, view/comment, ID, hover menu with five actions.
- **Feedback detail:** Multiple editable sections (title, description, action steps, tags) and multiple CTAs (Resolved, Delete, Activity) in one view.

---

## STEP 4 — DATA STRUCTURE SUMMARY

### 1. Entities

- **Session:** id, userId, title, archived, createdAt, updatedAt, createdBy, viewCount, commentCount, aiInsightSummary, aiInsightSummaryFeedbackCount, aiInsightSummaryUpdatedAt.
- **Feedback (ticket):** id, sessionId, userId, title, description, type, isResolved, createdAt, contextSummary, actionSteps, suggestedTags, screenshotUrl, clientTimestamp, url, viewportWidth, viewportHeight, userAgent.
- **Comment:** id, sessionId, feedbackId, userId, userName, userAvatar, message, createdAt.
- **User (auth only):** Firebase Auth (uid, displayName, photoURL, email); no separate users table.

### 2. Relationships

- Session 1:N Feedback (sessionId).
- Session 1:N Comment (sessionId); Comment N:1 Feedback (feedbackId).
- Session N:1 User (userId = Firebase uid); Feedback N:1 User (userId).

### 3. Metrics calculated

- **Workspace list:** Per session: open count, resolved count (from getSessionFeedbackCounts); derived: feedback count = open + resolved, "all completed" = feedbackCount > 0 && resolved === feedbackCount. Aggregated stats in useWorkspaceOverview: totalSessions, activeSessions (sessions with at least one feedback), totalFeedbackItems, openIssues.
- **Session page:** total, activeCount, resolvedCount from first page of GET /api/feedback; sidebar shows "X total · Y active · Z resolved".
- **Overview:** totalCount, countsByStatus (open, resolved), completion % = resolved / totalCount; tagCounts (from recent + open + resolved preview); recentActivity from recent comments (actorName, action "Commented", targetTitle, timestamp).
- **Session-level:** viewCount (Loom-style per viewer), commentCount (incremented on new comment).

### 4. Metrics that could exist but are not implemented

- Time to first feedback, time to resolve, trend over time.
- Per-session or global charts (e.g. open vs resolved over time).
- Feedback volume by tag over time.
- List or filter by "last activity" / "last updated".
- Export or report (CSV/PDF).
- Search across all sessions or across feedback content (only session title search on workspace list, feedback title search in sidebar).
- Dashboard-level "open issues" or "due" or priority.
- User/contributor stats (who commented or created feedback).

---

## STEP 5 — VISUAL SYSTEM

### 1. Spacing

- **Tailwind + ad hoc:** px-10, py-8, gap-6, gap-4, gap-3, mt-1, mt-2, etc. No single scale (e.g. 4/8/16/24) enforced; mix of 1–2 (0.25rem–0.5rem), 3–6, 8–10.
- **Layout:** max-w-[1800px] dashboard, max-w-4xl session main, max-w-6xl overview; consistent horizontal padding in content areas.

### 2. Typography scale

- **Documented in globals.css:** Display 22px medium; Primary heading 20px medium 1.35; Card title 16px medium 1.4 -0.01em; Body 15px 1.65; Metadata 14px 1.55; Micro 12px uppercase 0.08em.
- **In use:** Mix of text-[11px]–text-[28px], font-medium/semibold; not every component follows the scale (e.g. 13px, 18px appear). Font: Plus Jakarta Sans (root layout).

### 3. Color system

- **CSS variables (globals.css):** --background, --surface-1/2/3, --border, --text-primary/active/secondary/muted, --brand, --brand-ring. Tailwind @theme: primary, active, brand-primary, brand-accent, brand-soft, semantic-system/insight/success/attention/danger.
- **Surfaces:** surface-rail (#F2F2F3), surface-sidebar (#F7F7F8), surface-main (#FFFFFF). Body #F7F7F8, text #1F2937.
- **Semantic:** Resolved/success (green), open/attention (amber), danger (red), system/insight (blue/purple). Tag colors from tagConfig (Product, UX, Performance, Bug, etc.).

### 4. Visual hierarchy

- **Headings:** Page title (e.g. 28px semibold) vs section (e.g. 18px medium) vs card title (16px medium). Index "X of Y" and micro labels (12px uppercase) for secondary info.
- **Buttons:** Primary (dark bg) vs secondary (border/ghost). Card hover: shadow, slight translate.
- **Sidebar:** Active item has left border and bolder text; list order and numbering support scanning.

### 5. Inconsistencies

- **Root layout:** GlobalNavBar is fixed; (app) layout uses GlobalRail, no navbar in content — two different chrome models (navbar everywhere vs rail only in app).
- **Overview vs session:** Overview uses its own header (no GlobalRail in flow), different padding and section layout; overview uses "Owner • —" (placeholder).
- **Loading:** Dashboard uses "Loading workspace…" text; session uses SessionPageSkeleton then FeedbackPremiumLoader or "Loading…"; overview uses "Loading…" then "Failed to load overview." — different patterns.
- **Font sizes:** 11px, 12px, 13px, 14px, 15px, 16px, 18px, 20px, 28px all used; not strictly limited to the documented scale.
- **Border/radius:** Mix of rounded-lg, rounded-xl, rounded-md; --radius: 14px in CSS but not consistently applied.

### 6. Optimized for

- **Speed of scanning:** Card grid and sidebar list support quick scan; status dot and counts on cards help. Dense text and multiple actions per card can slow scan.
- **Decision-making:** Open vs resolved counts and completion % on overview support prioritization; session page lacks summary metrics in the main view (summary is behind "View session summary").
- **Action-taking:** Primary actions (New Session, Open Feedback Board, resolve, edit) are present; many secondary actions live in menus (card more menu, sidebar filter menu), which can hide actions.

---

## STEP 6 — PERFORMANCE

### 1. Initial load

- **Workspace list:** Auth state → load sessions + counts (getUserSessions + getSessionFeedbackCounts per session in parallel). No route-level lazy; entire dashboard page and WorkspaceCard tree render.
- **Session page:** Auth guard, Firestore getDoc(session), GET /api/feedback (first page), then GET /api/tickets/[id] when selectedId set. ActivityPanel is dynamic (ssr: false) with "Loading activity…" placeholder.
- **Overview:** Auth + useSessionOverview: parallel getSessionById, getSessionFeedbackCounts, getSessionFeedbackTotalCount, getSessionFeedback, getSessionFeedbackByResolved (x2), getSessionRecentComments then getFeedbackByIds for activity titles.

### 2. Unnecessary re-renders

- **SessionPageClient:** Large component with many useState; any state change (e.g. descriptionDraft, isCommentsOpen) re-renders the whole tree. FeedbackSidebar and FeedbackDetail are React.memo’d; list items keyed by id.
- **Dashboard:** filterAndSortSessions in useMemo; WorkspaceCard receives stable callbacks (onView, onRenameSuccess, etc.) from useCallback in parent. Cards could re-render when search or sessions change.
- **useSessionFeedbackPaginated:** IntersectionObserver and debounced loadMore in useMemo/useCallback; dependency arrays may trigger observer re-creation when loadMore identity changes.

### 3. Lazy loading

- **ActivityPanel:** dynamic(import(…), { ssr: false, loading: () => … }).
- **No route-level code-splitting** for dashboard vs session vs overview (all in app tree).
- **Images:** Next/Image used for logo, user photo, expanded screenshot (sizing/optimization).

### 4. Suspense

- **Not used.** No <Suspense> boundaries; loading handled by conditional UI (loading flags, skeletons).

### 5. API batching

- **Workspace list:** Counts fetched per session in Promise.all (N+1 pattern: one list + N count calls).
- **Session page:** Feedback first page and ticket detail are separate; ticket fetched on selectedId change (no batch with list).
- **Overview:** Multiple repo calls combined in a single Promise.all (session, counts, totalCount, recent feedback, open/resolved preview, recent comments); then getFeedbackByIds for activity titles — good local batching, no single backend batch API.
- **Mark all resolved:** SessionPageClient does Promise.all over PATCH /api/tickets/[id] for each active item (batched on client, N requests).

---

## STEP 7 — STRATEGIC GAPS

### 1. Missing product features

- **Archived sessions:** Repo filters archived out; no UI to view or restore archived sessions (TODO in code).
- **Capture/Analytics/Settings:** Rail links exist; no pages or flows.
- **Session overview entry:** No link from dashboard or session to overview; overview is undiscoverable.
- **Search:** No global search (sessions or feedback content across sessions).
- **Sharing/collaboration:** Share modals and copy link exist; no explicit invite, roles, or permissions model in dashboard.
- **Export/reports:** No CSV, PDF, or report generation.
- **Keyboard/shortcuts:** No documented command palette in app (CommandPalette component exists, unused).
- **Notifications:** Bell icon in nav; no notifications data or list.

### 2. Missing analytics

- No funnels (e.g. session created → first feedback → first resolve).
- No time-based charts (open/resolved over time, volume by tag).
- No retention or re-engagement metrics (e.g. return visits to session).
- Session viewCount and commentCount are stored but not shown in a dedicated analytics view.
- No product events or client-side analytics hooks visible in dashboard code.

### 3. Missing onboarding elements

- No first-time empty state with guided "Create first session" or "Install extension."
- No tooltips or tours on dashboard or session page.
- No checklist or progress (e.g. "Add first feedback").
- Login redirects straight to dashboard with no onboarding step.

### 4. Missing engagement hooks

- No in-app prompts to use Capture or add feedback.
- No "Recent" or "Continue where you left off" on dashboard.
- No email or in-app reminders (notifications not implemented).
- Session summary (aiInsightSummary) is optional and hidden behind "View session summary"; not used as a hook.

### 5. Missing retention mechanics

- No digest or recap (e.g. "You have N open items").
- No re-engagement when session is stale (e.g. "Last activity 7 days ago").
- No goals or streaks.
- Archive is one-way (no "Restore" in UI); delete is permanent with modal but no soft delete or undo window.

---

**END OF REPORT**
