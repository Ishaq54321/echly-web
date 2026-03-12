# Echly — UI System Analysis Report

**Purpose:** Complete map of the application's UI architecture for safe redesign.  
**Phase:** Analysis only — no code changes.

---

## 1. All Pages (Routes)

The app uses **Next.js App Router**. Route groups: `(app)`, `(auth)`, and ungrouped `onboarding`.

| Route | File Path | Main Components Used |
|-------|-----------|------------------------|
| `/` | `app/page.tsx` | None (minimal: `main`, `h1`) |
| `/login` | `app/(auth)/login/page.tsx` | `AuthCard`, inline inputs/buttons, gradient background divs, `Image` (logo), `Link` |
| `/signup` | `app/(auth)/signup/page.tsx` | `AuthLayout`, `AuthCard`, inline inputs/buttons, `Image`, `Link` |
| `/onboarding` | `app/onboarding/page.tsx` | `WorkspaceForm`, `StepIndicator`, `motion` (Framer) |
| `/onboarding/activate` | `app/onboarding/activate/page.tsx` | `ActivationSteps`, `StepIndicator`, `DemoFeedbackDashboard`, `CursorAnnotation`, `DemoHighlight`, `DemoArrow`, `ExtensionPopup`, `ReplayDemoButton`, `SessionControlBar`, demo extension controller types |
| `/dashboard` | `app/(app)/dashboard/page.tsx` | `WorkspaceCard`, `SessionsHeader`, `FolderCard`, `SessionsGridSkeleton`, `FolderSkeleton`, `MoveSessionsModal`, `DragSessionProvider`, `ToastProvider`, `DragGhostChip` |
| `/dashboard/sessions` | `app/(app)/dashboard/sessions/page.tsx` | `SessionsTableSkeleton`, table markup, `Search`, `Folder` (lucide) |
| `/dashboard/[sessionId]` | `app/(app)/dashboard/[sessionId]/page.tsx` | Wraps `SessionPageClient` |
| `/dashboard/[sessionId]` (client) | `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx` | `SessionPremiumLoader`, `FeedbackPremiumLoader`, `TicketList`, `ExecutionView`, `ExecutionModeLayout`, `CommentPanel` (from `@/components/layout/operating-system`) |
| `/dashboard/[sessionId]/overview` | `app/(app)/dashboard/[sessionId]/overview/page.tsx` | Custom `OverviewSessionHeader`, `MetricCard`, overview hooks, `formatOverviewDate`, `formatActivityTime` |
| `/dashboard/insights` | `app/(app)/dashboard/insights/page.tsx` | Custom skeleton cards, metric cards, `useAuthGuard`, `authFetch` |
| `/discussion` | `app/(app)/discussion/page.tsx` | `DiscussionList`, `DiscussionThread`, `DiscussionSkeleton`, `ResizeHandle` |
| `/folders/[folderId]` | `app/(app)/folders/[folderId]/page.tsx` | `WorkspaceCard`, `MoveSessionsModal`, `SessionsGridSkeleton`, `DragSessionProvider` |
| `/settings` | `app/(app)/settings/page.tsx` | `Button`, `Card`, `Switch`, `Modal` (from `@/components/ui`), workspace repos, custom section headers and tab UI |

**Layouts:**

- **Root:** `app/layout.tsx` — Plus Jakarta Sans font, `globals.css`, `.env-canvas` wrapper.
- **App (authenticated):** `app/(app)/layout.tsx` — `GlobalRail`, `FloatingUtilityActions`, `ErrorBoundary`, fixed “All changes saved” footer.
- **Auth:** `app/(auth)/layout.tsx` — Inter font wrapper (inconsistent with root).
- **Onboarding:** `app/onboarding/layout.tsx` — Full-screen gradient background (matches login), centered content area.

---

## 2. All UI Components

Components live under `components/`. Below: **name**, **file path**, **where used**.

### 2.1 Auth

| Component | File Path | Where Used |
|-----------|-----------|------------|
| AuthCard | `components/auth/AuthCard.tsx` | Login, Signup |
| AuthLayout | `components/auth/AuthLayout.tsx` | Signup only |

### 2.2 Layout

| Component | File Path | Where Used |
|-----------|-----------|------------|
| GlobalRail | `components/layout/GlobalRail.tsx` | App layout |
| FloatingUtilityActions | `components/layout/FloatingUtilityActions.tsx` | App layout |
| DashboardHeader | `components/layout/DashboardHeader.tsx` | Dashboard views |
| DashboardHeaderActions | `components/layout/DashboardHeaderActions.tsx` | Dashboard |
| GlobalNavBar | `components/layout/GlobalNavBar.tsx` | — |
| AppLayoutClient | `components/layout/AppLayoutClient.tsx` | — |

### 2.3 Layout — Operating System (Session/Execution)

| Component | File Path | Where Used |
|-----------|-----------|------------|
| FourZoneLayout | `components/layout/operating-system/FourZoneLayout.tsx` | Session view composition |
| TicketList | `components/layout/operating-system/TicketList.tsx` | Session view |
| ExecutionView | `components/layout/operating-system/ExecutionView.tsx` | Session view |
| ExecutionModeLayout | `components/layout/operating-system/ExecutionModeLayout.tsx` | Session view |
| CommentPanel | `components/layout/operating-system/CommentPanel.tsx` | Session view |
| ExecutionCanvas | `components/layout/operating-system/ExecutionCanvas.tsx` | Session canvas |
| ExecutionModeView | `components/layout/operating-system/ExecutionModeView.tsx` | — |
| FeedbackListPanel | `components/layout/operating-system/FeedbackListPanel.tsx` | — |
| ContextPanel | `components/layout/operating-system/ContextPanel.tsx` | — |
| SystemNavigationRail | `components/layout/operating-system/SystemNavigationRail.tsx` | — |
| SessionNavigator | `components/layout/operating-system/SessionNavigator.tsx` | — |
| TicketMetadata | `components/layout/operating-system/TicketMetadata.tsx` | — |
| TicketItem | `components/layout/operating-system/TicketItem.tsx` | — |
| CommentModeIndicator | `components/layout/operating-system/CommentModeIndicator.tsx` | — |
| ActivitySlideOver | `components/layout/operating-system/ActivitySlideOver.tsx` | — |
| SignalStream | `components/layout/operating-system/SignalStream.tsx` | — |
| FeedbackCommandPanel | `components/layout/operating-system/FeedbackCommandPanel.tsx` | — |
| ContextIntelligenceColumn | `components/layout/operating-system/ContextIntelligenceColumn.tsx` | — |

### 2.4 UI Primitives (`components/ui/`)

| Component | File Path | Where Used |
|-----------|-----------|------------|
| Button | `components/ui/Button.tsx` | Settings |
| EchlyButton | `components/ui/EchlyButton.tsx` | Extension / widget flows |
| Card | `components/ui/Card.tsx` | Settings (uses `.echly-card`) |
| Modal | `components/ui/Modal.tsx` | Settings, DeleteSessionModal pattern |
| Toast | `components/ui/Toast.tsx` | ToastContext (dashboard) |
| EchlyInput | `components/ui/EchlyInput.tsx` | — |
| Tag | `components/ui/Tag.tsx` | FeedbackContent, FeedbackTag |
| FeedbackTag | `components/ui/FeedbackTag.tsx` | — |
| ResolvedToggle | `components/ui/ResolvedToggle.tsx` | FeedbackHeader |
| Avatar | `components/ui/Avatar.tsx` | — |
| Switch | `components/ui/Switch.tsx` | Settings |
| Divider | `components/ui/Divider.tsx` | — |
| Section | `components/ui/Section.tsx` | — |
| Stack | `components/ui/Stack.tsx` | — |
| ProductPreview | `components/ui/ProductPreview.tsx` | — |

### 2.5 Dashboard

| Component | File Path | Where Used |
|-----------|-----------|------------|
| WorkspaceCard | `components/dashboard/WorkspaceCard.tsx` | Dashboard, Folder page |
| SessionsHeader | `components/dashboard/SessionsHeader.tsx` | Dashboard |
| FolderCard | `components/dashboard/FolderCard.tsx` | Dashboard |
| MoveSessionsModal | `components/dashboard/MoveSessionsModal.tsx` | Dashboard, Folder page |
| DeleteSessionModal | `components/dashboard/DeleteSessionModal.tsx` | Dashboard flows |
| ShareSessionModal | `components/dashboard/ShareSessionModal.tsx` | — |
| RenameFolderModal | `components/dashboard/RenameFolderModal.tsx` | — |
| SessionsTableView | `components/dashboard/SessionsTableView.tsx` | — |
| DragGhostChip | `components/dashboard/DragGhostChip.tsx` | Dashboard (drag) |
| CommandCenterHeader | `components/dashboard/CommandCenterHeader.tsx` | — |
| RecentFeedbackSection | `components/dashboard/RecentFeedbackSection.tsx` | — |
| RecentlyActiveSection | `components/dashboard/RecentlyActiveSection.tsx` | — |
| ActiveSessionsSection | `components/dashboard/ActiveSessionsSection.tsx` | — |
| DashboardAIInsightsCard | `components/dashboard/DashboardAIInsightsCard.tsx` | — |
| DashboardMetricsStrip | `components/dashboard/DashboardMetricsStrip.tsx` | — |
| CriticalIssuesSection | `components/dashboard/CriticalIssuesSection.tsx` | — |
| TrendingProblemsSection | `components/dashboard/TrendingProblemsSection.tsx` | — |
| PriorityStack | `components/dashboard/PriorityStack.tsx` | — |
| ToastProvider / useToast | `components/dashboard/context/ToastContext.tsx` | Dashboard |
| DragSessionProvider / useDragSession | `components/dashboard/context/DragSessionContext.tsx` | Dashboard, Folder page |

### 2.6 Skeleton

| Component | File Path | Where Used |
|-----------|-----------|------------|
| SessionsGridSkeleton | `components/skeleton/SessionsGridSkeleton.tsx` | Dashboard, Folder page |
| SessionsTableSkeleton | `components/skeleton/SessionsTableSkeleton.tsx` | Dashboard/sessions page |
| FolderSkeleton | `components/skeleton/FolderSkeleton.tsx` | Dashboard |
| SessionCardSkeleton | `components/skeleton/SessionCardSkeleton.tsx` | — |
| DiscussionSkeleton | `components/discussion/DiscussionSkeleton.tsx` | Discussion page |

### 2.7 Discussion

| Component | File Path | Where Used |
|-----------|-----------|------------|
| DiscussionList | `components/discussion/DiscussionList.tsx` | Discussion page |
| DiscussionThread | `components/discussion/DiscussionThread.tsx` | Discussion page |
| DiscussionPanel | `components/discussion/DiscussionPanel.tsx` | — |
| DiscussionFeed | `components/discussion/DiscussionFeed.tsx` | — |
| ResizeHandle | `components/discussion/ResizeHandle.tsx` | Discussion page |
| AttachmentUploadModal | `components/discussion/AttachmentUploadModal.tsx` | DiscussionThread |
| CommentAttachmentCard | `components/discussion/CommentAttachmentCard.tsx` | CommentItem |

### 2.8 Comments

| Component | File Path | Where Used |
|-----------|-----------|------------|
| CommentItem | `components/comments/CommentItem.tsx` | DiscussionThread, ActivityThread, CommentPanel |
| CommentThread | `components/comments/CommentThread.tsx` | — |
| CommentInput | `components/comments/CommentInput.tsx` | — |

### 2.9 Session / Feedback Detail

| Component | File Path | Where Used |
|-----------|-----------|------------|
| SessionPremiumLoader | `components/session/SessionPremiumLoader.tsx` | SessionPageClient |
| FeedbackPremiumLoader | `components/session/FeedbackPremiumLoader.tsx` | SessionPageClient |
| SessionHeader | `components/session/SessionHeader.tsx` | — |
| FeedbackDetail | `components/session/feedbackDetail/FeedbackDetail.tsx` | — |
| FeedbackHeader | `components/session/feedbackDetail/FeedbackHeader.tsx` | — |
| FeedbackContent | `components/session/feedbackDetail/FeedbackContent.tsx` | ExecutionView |
| Section | `components/session/feedbackDetail/Section.tsx` | — |
| SuggestionSection | `components/session/feedbackDetail/SuggestionSection.tsx` | — |
| ActionItemsSection | `components/session/feedbackDetail/ActionItemsSection.tsx` | — |
| ActivityPanel | `components/session/feedbackDetail/ActivityPanel.tsx` | — |
| ActivityComposer | `components/session/feedbackDetail/ActivityComposer.tsx` | ActivitySlideOver |
| ActivityThread | `components/session/feedbackDetail/ActivityThread.tsx` | ActivitySlideOver |
| ActivityCollapsibleSection | `components/session/feedbackDetail/ActivityCollapsibleSection.tsx` | — |
| ExecutionModeActionSteps | `components/session/feedbackDetail/ExecutionModeActionSteps.tsx` | ExecutionModeLayout |
| ScreenshotBlock | `components/session/feedbackDetail/ScreenshotBlock.tsx` | — |
| ScreenshotWithPins | `components/session/feedbackDetail/ScreenshotWithPins.tsx` | — |
| DescriptionSection | `components/session/feedbackDetail/DescriptionSection.tsx` | — |
| SelectableText | `components/session/feedbackDetail/SelectableText.tsx` | — |

### 2.10 Capture Widget (Extension / In-App Capture)

| Component | File Path | Where Used |
|-----------|-----------|------------|
| CaptureWidget | `components/CaptureWidget/index.tsx` | Extension content |
| CaptureHeader | `components/CaptureWidget/CaptureHeader.tsx` | — |
| CaptureLayer | `components/CaptureWidget/CaptureLayer.tsx` | — |
| FeedbackList | `components/CaptureWidget/FeedbackList.tsx` | — |
| ModeTile | `components/CaptureWidget/ModeTile.tsx` | — |
| VoiceCapturePanel | `components/CaptureWidget/VoiceCapturePanel.tsx` | — |
| TextFeedbackPanel | `components/CaptureWidget/TextFeedbackPanel.tsx` | — |
| CommandPanel | `components/CaptureWidget/CommandPanel.tsx` | — |
| SessionOverlay | `components/CaptureWidget/SessionOverlay.tsx` | — |
| FloatingCommandButton | `components/CaptureWidget/FloatingCommandButton.tsx` | — |
| ResumeSessionModal | `components/CaptureWidget/ResumeSessionModal.tsx` | — |
| ConfirmationCard | `components/CaptureWidget/ConfirmationCard.tsx` | — |
| MicrophoneSelector | `components/CaptureWidget/MicrophoneSelector.tsx` | — |
| RegionCaptureOverlay | `components/CaptureWidget/RegionCaptureOverlay.tsx` | — |
| SessionContext | `components/CaptureWidget/SessionContext.tsx` | — |
| SessionControlPanel | `components/CaptureWidget/SessionControlPanel.tsx` | — |
| SessionFeedbackPopup | `components/CaptureWidget/SessionFeedbackPopup.tsx` | — |
| MicrophonePanel | `components/CaptureWidget/MicrophonePanel.tsx` | — |
| RecordingMicOrb | `components/CaptureWidget/RecordingMicOrb.tsx` | — |

### 2.11 Demo (Onboarding / Activation)

| Component | File Path | Where Used |
|-----------|-----------|------------|
| DemoGuide | `components/demo/DemoGuide.tsx` | Activation page (CursorAnnotation, DemoHighlight) |
| DemoArrow | `components/demo/DemoArrow.tsx` | Activation page |
| DemoFeedbackDashboard | `components/demo/DemoFeedbackDashboard.tsx` | Activation page |
| ExtensionPopup | `components/demo/ExtensionPopup.tsx` | Activation page |
| ReplayDemoButton | `components/demo/ReplayDemoButton.tsx` | Activation page |
| SessionControlBar | `components/demo/SessionControlBar.tsx` | Activation page |
| ModeSelector | `components/demo/ModeSelector.tsx` | — |
| DemoExtensionController | `components/demo/DemoExtensionController.ts` | Activation page (state/types) |

### 2.12 Onboarding

| Component | File Path | Where Used |
|-----------|-----------|------------|
| WorkspaceForm | `components/onboarding/WorkspaceForm.tsx` | Onboarding page |
| StepIndicator | `components/onboarding/StepIndicator.tsx` | Onboarding, Activation |
| ActivationSteps | `components/onboarding/ActivationSteps.tsx` | Activation page |

### 2.13 Command Center / Insights

| Component | File Path | Where Used |
|-----------|-----------|------------|
| MomentumBlock | `components/command-center/MomentumBlock.tsx` | — |
| RiskBlock | `components/command-center/RiskBlock.tsx` | — |
| SignalHeatmapBlock | `components/command-center/SignalHeatmapBlock.tsx` | — |
| PriorityRadarBlock | `components/command-center/PriorityRadarBlock.tsx` | — |
| ExecutionMomentumBlock | `components/command-center/ExecutionMomentumBlock.tsx` | — |
| AIExecutiveSummaryBlock | `components/command-center/AIExecutiveSummaryBlock.tsx` | — |
| SystemOverviewBlock | `components/command-center/SystemOverviewBlock.tsx` | — |

### 2.14 Other

| Component | File Path | Where Used |
|-----------|-----------|------------|
| ErrorBoundary | `components/ErrorBoundary.tsx` | App layout |
| CommandPalette | `components/system/CommandPalette.tsx` | AppLayoutClient |
| ThemeProvider | `components/providers/ThemeProvider.tsx` | — |
| ImageViewer | `components/ImageViewer.tsx` | CommentItem |
| ChatGPTWaveform | `components/ChatGPTWaveform.tsx` | VoiceCapturePanel |
| AudioWaveform | `components/AudioWaveform.tsx` | — |
| MoveToFolderModal | `components/modals/MoveToFolderModal.tsx` | — |

---

## 3. Design Primitives (Base Building Blocks)

**Location:** `components/ui/` and shared CSS in `app/globals.css`.

| Primitive | Location | Notes |
|-----------|----------|------|
| **Button** | `components/ui/Button.tsx` | Variants: primary, secondary, ghost, danger. Uses CSS vars (`--color-primary`, `--layer-*`). Base: `rounded-xl font-medium`, motion/ring from globals. |
| **EchlyButton** | `components/ui/EchlyButton.tsx` | Separate primitive (primary/secondary/ghost); used in extension/widget. |
| **Input** | Inline in Login/Signup; `EchlyInput` in `components/ui/EchlyInput.tsx` | No single shared input primitive; login/signup use local `inputClass` (e.g. `rounded-[10px]`, `focus:border-[#466EFF]`). |
| **Card** | `components/ui/Card.tsx` | Renders with class `echly-card`; actual card styling is in Settings (e.g. `SETTINGS_CARD`) and globals (e.g. `.card-depth`). |
| **Modal** | `components/ui/Modal.tsx` | Uses `.echly-modal-overlay` and `.echly-modal-panel` from globals.css. |
| **Toast** | `components/ui/Toast.tsx` | Used via ToastContext on dashboard. |
| **Badge / Tag** | `components/ui/Tag.tsx`, `components/ui/FeedbackTag.tsx` | Tag used in feedback content; FeedbackTag wraps Tag. |
| **Switch** | `components/ui/Switch.tsx` | Settings toggles. |
| **Avatar** | `components/ui/Avatar.tsx` | Available; usage scoped. |
| **Divider** | `components/ui/Divider.tsx` | — |
| **Section** | `components/ui/Section.tsx` | — |
| **Stack** | `components/ui/Stack.tsx` | — |
| **ResolvedToggle** | `components/ui/ResolvedToggle.tsx` | Feedback resolution state. |

**Not present as shared primitives:** Tooltip, Dropdown, Tabs (tabs are inline in Settings). Sidebar/Header are layout components (GlobalRail, DashboardHeader), not generic primitives.

---

## 4. Layout System

### 4.1 Page Containers

- **Root:** `app/layout.tsx` — `html` + `body` (Plus Jakarta Sans, antialiased), `.env-canvas` full height, flex column.
- **App:** `app/(app)/layout.tsx` — Flex row: `GlobalRail` (fixed width) + `main` (flex-1, overflow-auto, white bg). Fixed footer text bottom-right.
- **Auth:** Centered content; Login uses custom gradient divs; Signup uses `AuthLayout` (centered, gradient).
- **Onboarding:** `app/onboarding/layout.tsx` — Full-screen gradient background, centered `min-h-screen` flex column with padding.

### 4.2 Max-Width Containers

- **Login:** `max-w-[980px]` hero, `max-w-[420px]` auth card.
- **Signup:** `max-w-[420px]` for card column.
- **Onboarding:** `max-w-[760px]` for form.
- **Activation:** `max-w-6xl` for demo and content.
- **Discussion:** Content uses `max-w-[720px]` for thread; panel widths via flex + min/max (e.g. MIN_LIST 238, MAX_LIST 420).
- **Settings:** Uses `SETTINGS_CARD` and section spacing; billing uses `.billing-container` (max-width 1180px, padding 24px).
- **Overview:** Inline styles and Tailwind; no single page container constant.

### 4.3 Dashboard Layout

- Dashboard page: custom grid (e.g. folders + workspace cards + sessions grid). Uses `SessionsHeader`, `WorkspaceCard`, `FolderCard`, grid with responsive cols.
- Sessions table page: full-width table layout with search.
- Folder page: Same workspace/session card grid pattern as dashboard.

### 4.4 Session (Feedback Board) Layout

- **SessionPageClient** composes: `TicketList`, `ExecutionView`, `ExecutionModeLayout`, `CommentPanel` from `layout/operating-system`.
- **FourZoneLayout:** Rail | Command Panel | Canvas | Context Column. Used for execution/session view.

### 4.5 Discussion Layout

- Three-column resizable: sidebar (projects) | list (tickets) | thread (detail). Uses `DiscussionList`, `DiscussionThread`, `ResizeHandle`. Min widths: sidebar 200–360, list 238–420, right 520.

### 4.6 Layout Components Summary

| Component | Role |
|-----------|------|
| GlobalRail | 16px-wide sidebar, logo, nav icons, workspace popover. |
| FloatingUtilityActions | Absolute top-right: Upgrade, Notifications, Profile. |
| FourZoneLayout | Session 4-zone flex layout. |
| AuthLayout | Centered full-screen with gradient (signup). |
| Onboarding layout | Centered full-screen with gradient (matches login). |

---

## 5. Typography System

### 5.1 Font Family

- **Root (app):** Plus Jakarta Sans (`next/font/google`) in `app/layout.tsx`.
- **Auth route:** Inter in `app/(auth)/layout.tsx` — **inconsistent** with root.
- **globals.css:** Base font-size 15px, line-height 1.65, Plus Jakarta Sans on html/body.
- **Extension / #echly-root:** `--echly-font`: Plus Jakarta Sans, SF Pro Display, Inter, system-ui.

### 5.2 Scale (from globals.css comments and usage)

- **Display:** ~24px, medium, leading 1.3, tracking -0.02em.
- **Primary heading:** ~20px, medium, leading 1.4, tracking -0.015em.
- **Card title:** ~16px, medium, leading 1.45, tracking -0.01em.
- **Body:** 15px, leading 1.7.
- **Metadata:** 14px, leading 1.55.
- **Micro label:** 12px, uppercase, tracking 0.06em.

### 5.3 Actual Usage (examples)

- **Headings:** `text-[44px]`, `text-5xl`, `text-3xl`, `text-2xl`, `text-xl`, `text-[22px]`, `text-[20px]`, `text-lg`, `text-[16px]`.
- **Weights:** `font-semibold`, `font-medium`, `font-bold` (no single scale).
- **Body/caption:** `text-base`, `text-sm`, `text-[13px]`, `text-[12px]`, `text-[11px]`.
- **Semantic classes:** `.text-secondary`, `.text-meta` (globals); many components use `text-neutral-900`, `text-gray-700`, `text-secondary`, or CSS vars like `hsl(var(--text-primary-strong))`, `--text-tertiary`, `--text-secondary-soft`.

### 5.4 Inconsistencies

- Auth uses Inter, rest uses Plus Jakarta Sans.
- Mix of Tailwind scale (`text-lg`, `text-xl`) and arbitrary sizes (`text-[22px]`, `text-[44px]`).
- No single “page title” or “section title” component; each page chooses its own size/weight.
- Settings uses named constants (e.g. `SECTION_TITLE`, `SECTION_SUBTITLE`) that don’t match a global scale.

---

## 6. Spacing System

### 6.1 CSS Variables (globals.css)

- `--space-1` … `--space-10`: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px.
- Used in some custom styles; many components use Tailwind instead.

### 6.2 Common Tailwind Patterns

- **Padding:** `p-4`, `p-6`, `p-8`, `px-4`, `px-6`, `py-2`, `py-4`, `py-12`, `pt-6`, `pb-6`.
- **Gap:** `gap-2`, `gap-3`, `gap-4`, `gap-6`, `space-y-2`, `space-y-3`, `space-y-4`, `space-y-6`, `space-y-8`.
- **Margins:** `mt-1`, `mt-2`, `mt-3`, `mt-4`, `mt-6`, `mt-8`, `mb-4`, `mb-6`, `mb-10`.

### 6.3 Component-Specific

- **Settings:** `CARD_GAP = space-y-8`, `ROW_GAP = space-y-5`; card padding `p-[28px]`.
- **Discussion:** Panel padding and list spacing; resize min/max in px.
- **Modals:** Mix of `p-4`, `p-6`, `px-6 pt-6 pb-2`, `max-w-md`, `max-w-[520px]`.

### 6.4 Inconsistencies

- No single “page padding” or “section gap”; 24px vs 28px vs 32px used without a clear rule.
- Space scale in CSS vars underused; Tailwind numbers used ad hoc.

---

## 7. Color System

### 7.1 Tokens (globals.css)

- **@theme (Tailwind v4):** `--color-primary`, `--color-active`, `--color-brand-primary`, `--color-brand-accent`, `--color-brand-soft`, semantic (system, insight, success, attention, danger).
- **:root:** Primary `#1a56db`, primary-hover, primary-soft, success, skipped, danger, brand (e.g. `--brand-blue: #155DFC`), text (primary/secondary/meta), surfaces (background, surface-1/2/3), borders, layer-1/2, shadows, radius.

### 7.2 Primary / Brand Colors in Use

- **#466EFF** — Login/signup gradient, onboarding focus (inputs, step indicator, selection).
- **#155DFC** — Dashboard, discussion, modals, rail icon bg, FloatingUtilityActions “Upgrade”, links, buttons (often with hover `#0F4ED1` / `#0F4EDC`).
- **#2563EB** — Tailwind theme, demo arrow; extension `--color-accent` / `--ai-accent` variants.
- **#1a56db** — Primary in :root, Button primary, some shadows.

### 7.3 Backgrounds

- **Page:** `bg-[#f9fafc]`, `bg-gray-50`, `bg-white`, `var(--env-base)`, `var(--layer-1-bg)`, `var(--layer-2-bg)`.
- **Cards:** White, `var(--layer-2-bg)`, `.card-depth` (globals), Settings cards with border and shadow.
- **Auth/Onboarding:** Gradient blurs (rgba(70,110,255,…)) + grain texture.

### 7.4 Borders

- **Neutral:** `border-[#E5E7EB]`, `border-neutral-200`, `border-neutral-300`, `var(--layer-1-border)`, `var(--layer-2-border)`, `var(--border-default)`.
- **Focus:** `focus:border-[#466EFF]`, `focus:ring-[#155DFC]/20`, `var(--accent-operational)`.

### 7.5 Text

- **Primary:** `text-gray-900`, `text-neutral-900`, `var(--text-primary)`, `hsl(var(--text-primary-strong))`.
- **Secondary:** `text-gray-700`, `text-neutral-700`, `text-secondary` (class), `var(--text-secondary)`.
- **Meta / tertiary:** `text-gray-500`, `text-meta`, `var(--text-meta)`, `hsl(var(--text-tertiary))`.

### 7.6 Inconsistencies

- Multiple “primary” blues: #466EFF (auth/onboarding), #155DFC (app/dashboard/discussion), #2563EB (theme/demo), #1a56db (Button/root).
- Neutral palette mixes Tailwind names (gray-*, neutral-*) and hex.
- Extension (#echly-root) has its own light/dark tokens; app and extension not fully aligned.

---

## 8. UI Inconsistencies (Summary)

### 8.1 Buttons

- **Login/Signup:** Inline styles (gradient, boxShadow) + local classes (`primaryButtonClass`, `primaryButtonStyle`); h-11 vs h-12.
- **Settings:** `Button` (ui) with CSS vars; also custom `BTN_PRIMARY` / `BTN_SECONDARY` strings (e.g. `#155DFC`, 8px radius).
- **Dashboard/Discussion/Modals:** Raw buttons with `bg-[#155DFC]`, `rounded-full` or `rounded-xl`, various padding.
- **Session/Execution:** Buttons use layer/border vars and `rounded-xl`.
- **Extension:** EchlyButton + CSS classes (e.g. `.echly-primary-button`).

Result: Several “primary” styles (gradient vs flat, radius 8 vs 10 vs 12 vs pill, different blues).

### 8.2 Cards

- **Auth:** AuthCard (motion, 16px radius, custom shadow).
- **Dashboard:** WorkspaceCard, FolderCard — custom borders/hover (e.g. `#155DFC80` ring).
- **Settings:** `echly-card` + `SETTINGS_CARD` (12px radius, 28px padding, hover shadow).
- **Session/Execution:** `.card-depth` (globals), radius and shadow from vars.
- **Discussion:** `rounded-2xl border border-neutral-200`, custom shadows.
- **Insights:** Custom metric cards; some use `rounded-xl border border-neutral-200`.

Result: Multiple card “looks” (radius, shadow, border, hover).

### 8.3 Inputs

- **Login/Signup:** Shared `inputClass` (rounded-[10px], border #E5E7EB, focus #466EFF).
- **Discussion/Settings/Modals:** Mix of `rounded-xl`, `rounded-lg`, `rounded-full`; focus ring `#155DFC` or `#155DFC/20`.
- **Session/Execution:** Inputs use CSS vars (layer borders, accent).

Result: No single input primitive; radius and focus color vary.

### 8.4 Spacing

- Section gaps: 24px, 28px, 32px used without a single rule.
- Modal padding: p-4 vs p-6 vs px-6 pt-6.
- Page top/bottom padding varies by route.

### 8.5 Layout Widths

- Max widths: 420, 520, 720, 760, 980, 1180px, and max-w-6xl used in different places.
- No single “content width” or “form width” token.

### 8.6 Fonts

- Inter on auth routes vs Plus Jakarta Sans everywhere else.

---

## 9. Component Hierarchy

High-level composition (simplified):

```
RootLayout (Plus Jakarta Sans, .env-canvas)
  └─ (auth) AuthLayout (Inter) → Login/Signup (AuthCard, inline form)
  └─ onboarding layout (gradient) → Onboarding (WorkspaceForm, StepIndicator)
                                  → Activate (ActivationSteps, StepIndicator, Demo*, ExtensionPopup, …)
  └─ (app) layout
       ├─ GlobalRail (logo, nav, workspace popover)
       ├─ main
       │    ├─ FloatingUtilityActions
       │    └─ ErrorBoundary
       │         ├─ Dashboard page → WorkspaceCard, FolderCard, SessionsHeader, MoveSessionsModal, …
       │         ├─ Dashboard/sessions → table + SessionsTableSkeleton
       │         ├─ Dashboard/[sessionId] → SessionPageClient
       │         │    └─ TicketList, ExecutionView (ExecutionModeLayout), CommentPanel (FourZoneLayout pattern)
       │         ├─ Dashboard/[sessionId]/overview → custom header + MetricCard
       │         ├─ Dashboard/insights → custom metric/skeleton cards
       │         ├─ Discussion → DiscussionList | ResizeHandle | DiscussionThread
       │         ├─ Folders/[folderId] → WorkspaceCard, sessions grid, MoveSessionsModal
       │         └─ Settings → Button, Card, Switch, Modal + tab/section UI
       └─ footer text
```

**Primitives used by feature:**

- **Settings:** Button, Card, Switch, Modal.
- **Dashboard:** No ui/Button/Card; custom cards and inline buttons.
- **Discussion:** Custom layout + inline buttons/inputs.
- **Session view:** Operating-system layout + CSS vars; no shared Button/Card from ui.
- **Auth:** AuthCard + inline inputs/buttons.
- **Capture/extension:** EchlyButton, EchlyInput, and large globals.css surface.

---

## 10. Recommendations for Redesign

1. **Unify fonts:** Use one font stack app-wide (e.g. Plus Jakarta Sans); remove Inter from auth layout or document a clear reason for divergence.
2. **Single design tokens file:** Define one set of primary/brand colors (e.g. one blue for app, one for extension if needed) and map #466EFF, #155DFC, #2563EB, #1a56db to semantic tokens (e.g. `brand.primary`, `brand.focus`).
3. **Primitive usage:** Prefer `components/ui/Button` (or one consolidated button API) for all app pages; replace inline primary/secondary button classes and local constants (e.g. Settings `BTN_PRIMARY`) with variants.
4. **Input primitive:** Introduce one shared Input (or align EchlyInput) and use it on Login, Signup, Discussion, Settings, and modals; standardize radius and focus ring from tokens.
5. **Card primitive:** Standardize on one card style (or a small set: default, elevated, interactive) and use it for AuthCard, Settings sections, dashboard cards, and discussion panels; align radius (e.g. 12px vs 16px) and shadow.
6. **Spacing scale:** Commit to the existing space scale (e.g. 4–40px) and use it in Tailwind (e.g. spacing config) or t-shirt sizes; use one “page padding” and “section gap” for all main content.
7. **Typography scale:** Define a small set of text styles (e.g. display, h1–h3, body, caption, label) and use them via classes or components; reduce arbitrary sizes like `text-[22px]` in favor of scale steps.
8. **Layout widths:** Document and tokenize content widths (narrow form, standard content, wide) and use them for max-width and modals.
9. **Extension vs app:** Align #echly-root tokens with app tokens where possible (e.g. same primary blue, same radius scale) to avoid two separate “design systems.”
10. **Audit after changes:** Re-run this analysis after redesign to ensure no new inconsistencies (buttons, cards, inputs, spacing, colors, fonts).

---

**Document version:** 1.0 (analysis only, no code changes).  
**Generated for:** Echly UI redesign planning.
