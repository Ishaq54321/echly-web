# 🧩 UI Architecture Map

This is a **pre-migration, read-only** inventory of UI-related files discovered in the current workspace scan (focused on `app/`, `components/`, `lib/`, `styles/`, `public/`, and `echly-extension/`).

Color density is a **best-effort estimate** based on file type and obvious styling surface area (e.g., `.css` token files = HIGH; “chart/overlay/layout” components typically MEDIUM–HIGH; small UI primitives typically LOW–MEDIUM).

## 1. Layout Files

- `app/layout.tsx`
  - **description**: Root app shell / global layout wrapper (Next.js app router).
  - **color density**: Medium
- `app/(app)/layout.tsx`
  - **description**: Authenticated app-section layout wrapper.
  - **color density**: Medium
- `app/(auth)/layout.tsx`
  - **description**: Auth-section layout wrapper.
  - **color density**: Medium
- `app/admin/layout.tsx`
  - **description**: Admin-section layout wrapper.
  - **color density**: Medium
- `app/onboarding/layout.tsx`
  - **description**: Onboarding-section layout wrapper.
  - **color density**: Medium

- `components/admin/AdminLayout.tsx`
  - **description**: Admin UI shell/layout component.
  - **color density**: Medium
- `components/auth/AuthLayout.tsx`
  - **description**: Auth UI shell/layout component.
  - **color density**: Medium
- `components/layout/AppLayoutClient.tsx`
  - **description**: Client-side app shell layout.
  - **color density**: Medium
- `components/layout/GlobalHeader.tsx`
  - **description**: Global header container.
  - **color density**: Medium
- `components/layout/GlobalNavBar.tsx`
  - **description**: Global navigation bar.
  - **color density**: Medium
- `components/layout/GlobalRail.tsx`
  - **description**: Global navigation rail.
  - **color density**: Medium
- `components/layout/GlobalNotificationButton.tsx`
  - **description**: Global notifications entrypoint/button (layout-level control).
  - **color density**: Low
- `components/layout/GlobalSearchButton.tsx`
  - **description**: Global search entrypoint/button (layout-level control).
  - **color density**: Low
- `components/layout/ProfileDropdown.tsx`
  - **description**: Profile menu dropdown in global layout.
  - **color density**: Medium
- `components/layout/ProfileCommandPanel.tsx`
  - **description**: Profile-related command panel (layout-level surface).
  - **color density**: Medium
- `components/layout/FloatingUtilityActions.tsx`
  - **description**: Floating utility action cluster in layout.
  - **color density**: Medium

- `components/layout/operating-system/FourZoneLayout.tsx`
  - **description**: Multi-panel “operating system” style layout compositor.
  - **color density**: High
- `components/layout/operating-system/SystemNavigationRail.tsx`
  - **description**: System-style navigation rail.
  - **color density**: Medium
- `components/layout/operating-system/ExecutionView.tsx`
  - **description**: OS-style execution view wrapper.
  - **color density**: High
- `components/layout/operating-system/ExecutionCanvas.tsx`
  - **description**: OS-style execution canvas surface.
  - **color density**: High
- `components/layout/operating-system/ContextPanel.tsx`
  - **description**: OS-style context panel.
  - **color density**: High
- `components/layout/operating-system/ContextIntelligenceColumn.tsx`
  - **description**: OS-style intelligence/context column.
  - **color density**: High
- `components/layout/operating-system/ActivitySlideOver.tsx`
  - **description**: Slide-over panel container.
  - **color density**: High
- `components/layout/operating-system/FeedbackListPanel.tsx`
  - **description**: Panel wrapper for feedback list (OS layout area).
  - **color density**: High
- `components/layout/operating-system/FeedbackCommandPanel.tsx`
  - **description**: Command panel wrapper for feedback controls.
  - **color density**: High
- `components/layout/operating-system/CommentPanel.tsx`
  - **description**: Comments panel wrapper.
  - **color density**: Medium
- `components/layout/operating-system/CommentModeIndicator.tsx`
  - **description**: Comment mode indicator element in OS layout.
  - **color density**: Low
- `components/layout/operating-system/SignalStream.tsx`
  - **description**: System “signal stream” visualization/container.
  - **color density**: High
- `components/layout/operating-system/SessionNavigator.tsx`
  - **description**: Session navigation structure within OS layout.
  - **color density**: Medium
- `components/layout/operating-system/TicketList.tsx`
  - **description**: Ticket list container in OS layout.
  - **color density**: Medium
- `components/layout/operating-system/TicketItem.tsx`
  - **description**: Ticket row/item in OS layout.
  - **color density**: Medium
- `components/layout/operating-system/TicketMetadata.tsx`
  - **description**: Ticket metadata layout/structure block.
  - **color density**: Medium
- `components/layout/operating-system/index.ts`
  - **description**: Barrel export for OS layout components.
  - **color density**: Low

- `components/providers/AppBootGate.tsx`
  - **description**: App boot gating wrapper (often used at app shell boundary).
  - **color density**: Low
- `components/providers/ThemeProvider.tsx`
  - **description**: Theme provider wrapper.
  - **color density**: Low

- `lib/client/workspaceContext.tsx`
  - **description**: React context provider for workspace state (used to structure UI).
  - **color density**: Low
- `lib/client/workspaceOverviewContext.tsx`
  - **description**: React context provider for workspace overview (used to structure UI).
  - **color density**: Low
- `lib/billing/BillingUsageProvider.tsx`
  - **description**: Billing usage provider wrapper (UI-state provider).
  - **color density**: Low

## 2. Primitive Components

- `components/ui/Button.tsx`
  - **description**: Reusable button primitive.
  - **color density**: Medium
- `components/ui/Switch.tsx`
  - **description**: Toggle switch primitive.
  - **color density**: Medium
- `components/ui/EchlyInput.tsx`
  - **description**: Input field primitive.
  - **color density**: Medium
- `components/ui/Card.tsx`
  - **description**: Card/surface primitive.
  - **color density**: Medium
- `components/ui/Divider.tsx`
  - **description**: Divider/separator primitive.
  - **color density**: Low
- `components/ui/Tag.tsx`
  - **description**: Tag/chip primitive.
  - **color density**: Medium
- `components/ui/FeedbackTag.tsx`
  - **description**: Domain-flavored tag primitive for feedback labeling.
  - **color density**: Medium
- `components/ui/Avatar.tsx`
  - **description**: Avatar primitive.
  - **color density**: Medium
- `components/ui/UserAvatar.tsx`
  - **description**: User avatar variant primitive.
  - **color density**: Medium
- `components/ui/Modal.tsx`
  - **description**: Modal/dialog primitive.
  - **color density**: High
- `components/ui/ModalPortal.tsx`
  - **description**: Portal mounting for modal/overlays.
  - **color density**: Low
- `components/ui/Toast.tsx`
  - **description**: Toast notification primitive.
  - **color density**: Medium
- `components/ui/NotificationPanel.tsx`
  - **description**: Notification surface/panel (borderline composite, treated as primitive UI surface here).
  - **color density**: High
- `components/ui/StatusOverlay.tsx`
  - **description**: Status overlay UI primitive.
  - **color density**: High
- `components/ui/OverlayError.tsx`
  - **description**: Error overlay primitive.
  - **color density**: High
- `components/ui/BrandLoader.tsx`
  - **description**: Brand loader/spinner.
  - **color density**: Medium
- `components/ui/MinimalLoader.tsx`
  - **description**: Minimal loader/spinner.
  - **color density**: Low
- `components/ui/ProgressRing.tsx`
  - **description**: Progress ring visualization primitive.
  - **color density**: Medium
- `components/ui/ProgressPie.tsx`
  - **description**: Progress pie visualization primitive.
  - **color density**: Medium
- `components/ui/ResolvedToggle.tsx`
  - **description**: Small toggle primitive (domain variant).
  - **color density**: Medium
- `components/ui/TopControlBar.tsx`
  - **description**: Small control bar surface (borderline composite; treated as primitive reusable surface).
  - **color density**: Medium
- `components/ui/Section.tsx`
  - **description**: Section wrapper primitive (spacing/structure).
  - **color density**: Low
- `components/ui/Stack.tsx`
  - **description**: Layout/stack primitive for spacing.
  - **color density**: Low
- `components/ui/empty/PageEmptyState.tsx`
  - **description**: Empty state primitive for pages.
  - **color density**: Medium

- `components/AudioWaveform.tsx`
  - **description**: Waveform visualization primitive.
  - **color density**: Medium
- `components/ChatGPTWaveform.tsx`
  - **description**: Waveform visualization variant primitive.
  - **color density**: Medium
- `components/ImageViewer.tsx`
  - **description**: Image viewer/lightbox-like primitive.
  - **color density**: High

## 3. Composite Components

### Dashboard

- `components/dashboard/SessionsWorkspace.tsx`
  - **description**: Workspace-level sessions view container.
  - **color density**: High
- `components/dashboard/SessionsHeader.tsx`
  - **description**: Dashboard sessions header block.
  - **color density**: Medium
- `components/dashboard/WorkspaceCard.tsx`
  - **description**: Dashboard workspace card block.
  - **color density**: Medium
- `components/dashboard/RecentlyActiveSection.tsx`
  - **description**: Recently active section block.
  - **color density**: Medium
- `components/dashboard/RecentFeedbackSection.tsx`
  - **description**: Recent feedback section block.
  - **color density**: Medium
- `components/dashboard/ActiveSessionsSection.tsx`
  - **description**: Active sessions section block.
  - **color density**: Medium
- `components/dashboard/TrendingProblemsSection.tsx`
  - **description**: Trending problems section block.
  - **color density**: Medium
- `components/dashboard/CriticalIssuesSection.tsx`
  - **description**: Critical issues section block.
  - **color density**: Medium
- `components/dashboard/DashboardAIInsightsCard.tsx`
  - **description**: AI insights card block.
  - **color density**: High
- `components/dashboard/DashboardMetricsStrip.tsx`
  - **description**: Metrics strip block.
  - **color density**: Medium
- `components/dashboard/EmptySessionsCard.tsx`
  - **description**: Empty state card for sessions.
  - **color density**: Medium
- `components/dashboard/PriorityStack.tsx`
  - **description**: Priority stack UI block.
  - **color density**: Medium
- `components/dashboard/PriorityBadge.tsx`
  - **description**: Priority badge component (small composite).
  - **color density**: Medium
- `components/dashboard/CircularProgress.tsx`
  - **description**: Circular progress (dashboard flavored).
  - **color density**: Medium
- `components/dashboard/SessionsTimeRangeFilter.tsx`
  - **description**: Time range filter UI block.
  - **color density**: Medium
- `components/dashboard/SessionsListArchiveTabs.tsx`
  - **description**: Tabs for sessions list/archive.
  - **color density**: Medium
- `components/dashboard/SessionsViewModeToggle.tsx`
  - **description**: View mode toggle for sessions list.
  - **color density**: Medium
- `components/dashboard/SessionActionsDropdown.tsx`
  - **description**: Actions dropdown for session items.
  - **color density**: Medium
- `components/dashboard/RenameSessionModal.tsx`
  - **description**: Modal flow for renaming a session.
  - **color density**: High
- `components/dashboard/DeleteSessionModal.tsx`
  - **description**: Modal flow for deleting a session.
  - **color density**: High
- `components/dashboard/CommandCenterHeader.tsx`
  - **description**: Header block for command center/dashboard area.
  - **color density**: Medium
- `components/dashboard/SessionWorkspaceStatusBadge.tsx`
  - **description**: Status badge for workspace/session.
  - **color density**: Medium
- `components/dashboard/context/SessionsSearchContext.tsx`
  - **description**: React context shaping dashboard search UI.
  - **color density**: Low
- `components/dashboard/context/ToastContext.tsx`
  - **description**: React context shaping toast UI.
  - **color density**: Low

### Session / Feedback detail

- `components/session/SessionHeader.tsx`
  - **description**: Session header block.
  - **color density**: Medium
- `components/session/FeedbackHeader.tsx`
  - **description**: Feedback header block (session-level).
  - **color density**: Medium
- `components/session/FeedbackSidebar.tsx`
  - **description**: Feedback sidebar container.
  - **color density**: High

- `components/session/feedbackDetail/FeedbackDetail.tsx`
  - **description**: Feedback detail view container/compositor.
  - **color density**: High
- `components/session/feedbackDetail/FeedbackHeader.tsx`
  - **description**: Feedback detail header.
  - **color density**: Medium
- `components/session/feedbackDetail/FeedbackContent.tsx`
  - **description**: Core feedback content compositor.
  - **color density**: High
- `components/session/feedbackDetail/DescriptionEditor/`
  - **description**: Inline description editor package (Phase 1).
  - **color density**: Medium
- `components/session/feedbackDetail/ActionItemsSection.tsx`
  - **description**: Inline description section wrapper (renders DescriptionMarkdown / DescriptionEditor).
  - **color density**: Medium
- `components/session/feedbackDetail/DescriptionMarkdown.tsx`
  - **description**: Markdown display renderer for descriptions.
  - **color density**: Medium
- `components/session/feedbackDetail/SuggestionSection.tsx`
  - **description**: Suggestions section block.
  - **color density**: Medium
- `components/session/feedbackDetail/ScreenshotBlock.tsx`
  - **description**: Screenshot display block.
  - **color density**: High
- `components/session/feedbackDetail/ScreenshotWithPins.tsx`
  - **description**: Screenshot with pin overlays (interactive).
  - **color density**: High
- `components/session/feedbackDetail/ActivityPanel.tsx`
  - **description**: Activity panel container.
  - **color density**: High
- `components/session/feedbackDetail/ActivityThread.tsx`
  - **description**: Activity thread list UI.
  - **color density**: High
- `components/session/feedbackDetail/ActivityComposer.tsx`
  - **description**: Composer/editor for activity/comments.
  - **color density**: High
- `components/session/feedbackDetail/ActivityCollapsibleSection.tsx`
  - **description**: Collapsible wrapper for activity.
  - **color density**: Medium
- `components/session/feedbackDetail/index.ts`
  - **description**: Barrel export for feedback detail components.
  - **color density**: Low

### Comments

- `components/comments/CommentThread.tsx`
  - **description**: Comment thread UI block.
  - **color density**: High
- `components/comments/CommentItem.tsx`
  - **description**: Comment item UI block.
  - **color density**: Medium
- `components/comments/CommentInput.tsx`
  - **description**: Comment input/composer UI block.
  - **color density**: High

### Command Center

- `components/command-center/FocusNowBlock.tsx`
  - **description**: Focus-now UI block.
  - **color density**: High
- `components/command-center/SystemOverviewBlock.tsx`
  - **description**: System overview UI block.
  - **color density**: High
- `components/command-center/RiskBlock.tsx`
  - **description**: Risk visualization UI block.
  - **color density**: High
- `components/command-center/PriorityRadarBlock.tsx`
  - **description**: Radar visualization UI block.
  - **color density**: High
- `components/command-center/ExecutionMomentumBlock.tsx`
  - **description**: Momentum UI block.
  - **color density**: High
- `components/command-center/AIExecutiveSummaryBlock.tsx`
  - **description**: Executive summary UI block.
  - **color density**: High
- `components/command-center/SignalHeatmapBlock.tsx`
  - **description**: Signal heatmap UI block.
  - **color density**: High
- `components/command-center/MomentumBlock.tsx`
  - **description**: Momentum block variant.
  - **color density**: High
- `components/command-center/index.ts`
  - **description**: Barrel export for command center blocks.
  - **color density**: Low

### Capture Widget (in-app overlay UI)

- `components/CaptureWidget/index.tsx`
  - **description**: Capture widget entry component.
  - **color density**: High
- `components/CaptureWidget/SessionOverlay.tsx`
  - **description**: Session overlay UI.
  - **color density**: High
- `components/CaptureWidget/RegionCaptureOverlay.tsx`
  - **description**: Region capture overlay (visual overlay).
  - **color density**: High
- `components/CaptureWidget/SessionControlPanel.tsx`
  - **description**: Control panel for capture session.
  - **color density**: High
- `components/CaptureWidget/CommandPanel.tsx`
  - **description**: Command panel for capture widget.
  - **color density**: High
- `components/CaptureWidget/FeedbackList.tsx`
  - **description**: Feedback list inside capture widget.
  - **color density**: High
- `components/CaptureWidget/TextFeedbackPanel.tsx`
  - **description**: Text feedback input panel.
  - **color density**: High
- `components/CaptureWidget/VoiceCapturePanel.tsx`
  - **description**: Voice capture panel.
  - **color density**: High
- `components/CaptureWidget/MicrophoneSelector.tsx`
  - **description**: Microphone selection UI.
  - **color density**: Medium
- `components/CaptureWidget/MicOrb.tsx`
  - **description**: Mic orb UI element.
  - **color density**: Medium
- `components/CaptureWidget/RecordingMicOrb.tsx`
  - **description**: Recording mic orb UI element.
  - **color density**: Medium
- `components/CaptureWidget/ConfirmationCard.tsx`
  - **description**: Confirmation card surface in widget.
  - **color density**: Medium
- `components/CaptureWidget/FloatingCommandButton.tsx`
  - **description**: Floating command button for widget.
  - **color density**: Medium
- `components/CaptureWidget/AISummaryBlock.tsx`
  - **description**: AI summary block inside widget.
  - **color density**: High
- `components/CaptureWidget/SessionFeedbackPopup.tsx`
  - **description**: Popup feedback UI within capture experience.
  - **color density**: High
- `components/CaptureWidget/ModeTile.tsx`
  - **description**: Mode selection tile.
  - **color density**: Medium
- `components/CaptureWidget/SessionContext.tsx`
  - **description**: React context shaping capture widget UI.
  - **color density**: Low

### Auth / Billing / Share / Search / System

- `components/auth/AuthCard.tsx`
  - **description**: Auth UI card block.
  - **color density**: High
- `components/billing/UpgradeModal.tsx`
  - **description**: Upgrade modal flow.
  - **color density**: High
- `components/share/ShareModal.tsx`
  - **description**: Share modal flow.
  - **color density**: High
- `components/share/ShareDropdown.tsx`
  - **description**: Share dropdown control.
  - **color density**: Medium
- `components/share/ShareButton.tsx`
  - **description**: Share button control.
  - **color density**: Low
- `components/search/GlobalSearch.tsx`
  - **description**: Global search UI (panel/dialog + results).
  - **color density**: High
- `components/system/CommandPalette.tsx`
  - **description**: Command palette UI surface.
  - **color density**: High

### Onboarding / Workspace

- `components/onboarding/StepIndicator.tsx`
  - **description**: Step indicator block.
  - **color density**: Medium
- `components/onboarding/WorkspaceForm.tsx`
  - **description**: Workspace onboarding form block.
  - **color density**: High
- `components/workspace/WorkspaceIdentityGate.tsx`
  - **description**: Gate/guard UI around workspace identity.
  - **color density**: Low
- `components/workspace/WorkspaceSuspendedGuard.tsx`
  - **description**: Guard UI for suspended workspaces.
  - **color density**: Medium

### Misc / Controls

- `components/ErrorBoundary.tsx`
  - **description**: Error boundary wrapper (may render fallback UI).
  - **color density**: Low
- `components/RequestAccessModal.tsx`
  - **description**: Request-access modal flow.
  - **color density**: High

### Demo

- `components/demo/DemoGuide.tsx`
  - **description**: Demo guide UI.
  - **color density**: High
- `components/demo/SessionControlBar.tsx`
  - **description**: Demo session control bar.
  - **color density**: Medium
- `components/demo/ReplayDemoButton.tsx`
  - **description**: Demo replay control.
  - **color density**: Medium
- `components/demo/ExtensionPopup.tsx`
  - **description**: Demo of extension popup UI (in-app).
  - **color density**: High
- `components/demo/ModeSelector.tsx`
  - **description**: Demo mode selector UI.
  - **color density**: Medium
- `components/demo/DemoFeedbackDashboard.tsx`
  - **description**: Demo feedback dashboard UI.
  - **color density**: High
- `components/demo/DemoArrow.tsx`
  - **description**: Demo arrow/annotation UI.
  - **color density**: Low

### App-level composites in `lib/` (capture engine)

- `lib/capture-engine/core/CaptureWidget.tsx`
  - **description**: Capture widget core UI (library-level implementation).
  - **color density**: High
- `lib/capture-engine/core/CaptureLayer.tsx`
  - **description**: Capture layer UI overlay container.
  - **color density**: High
- `lib/capture-engine/core/CaptureHeader.tsx`
  - **description**: Capture UI header.
  - **color density**: High
- `lib/capture-engine/core/WidgetFooter.tsx`
  - **description**: Capture widget footer UI.
  - **color density**: Medium
- `lib/capture-engine/core/MicrophonePanel.tsx`
  - **description**: Microphone panel UI.
  - **color density**: High
- `lib/capture-engine/core/FeedbackItem.tsx`
  - **description**: Feedback item UI within capture engine.
  - **color density**: Medium
- `lib/capture-engine/core/ResumeSessionModal.tsx`
  - **description**: Resume session modal UI.
  - **color density**: High
- `lib/capture-engine/core/SessionLimitUpgradeView.tsx`
  - **description**: Upgrade view for session limits.
  - **color density**: High
- `lib/capture-engine/core/internal/overlayHelpers.tsx`
  - **description**: UI helper utilities for overlays (renders/contains UI helpers).
  - **color density**: Medium

## 4. Pages

- `app/page.tsx`
  - **description**: Root landing/home page.
  - **color density**: High
- `app/(auth)/login/page.tsx`
  - **description**: Login page.
  - **color density**: High
- `app/(auth)/signup/page.tsx`
  - **description**: Signup page.
  - **color density**: High
- `app/(app)/dashboard/page.tsx`
  - **description**: Main dashboard page.
  - **color density**: High
- `app/(app)/dashboard/[sessionId]/page.tsx`
  - **description**: Session dashboard page (dynamic).
  - **color density**: High
- `app/(app)/dashboard/[sessionId]/overview/page.tsx`
  - **description**: Session overview page (dynamic).
  - **color density**: High
- `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx`
  - **description**: Client-side page component for session page.
  - **color density**: High
- `app/(app)/session/[sessionId]/page.tsx`
  - **description**: Session page (dynamic).
  - **color density**: High
- `app/(app)/discussion/page.tsx`
  - **description**: Discussion page.
  - **color density**: High
- `app/(app)/settings/page.tsx`
  - **description**: Settings page.
  - **color density**: High
- `app/onboarding/page.tsx`
  - **description**: Onboarding entry page.
  - **color density**: High
- `app/onboarding/activate/page.tsx`
  - **description**: Onboarding activation page.
  - **color density**: High
- `app/workspace-suspended/page.tsx`
  - **description**: Workspace suspended screen.
  - **color density**: Medium
- `app/extension-auth/page.tsx`
  - **description**: Extension authentication page/screen.
  - **color density**: High

- `app/admin/page.tsx`
  - **description**: Admin landing page.
  - **color density**: High
- `app/admin/customers/page.tsx`
  - **description**: Admin customers page.
  - **color density**: High
- `app/admin/plans/page.tsx`
  - **description**: Admin plans page.
  - **color density**: High
- `app/admin/usage/page.tsx`
  - **description**: Admin usage page.
  - **color density**: High

## 5. Extension UI

### Extension-rendered UI (content script / injected UI)

- `echly-extension/src/content.tsx`
  - **description**: Extension content script React UI (injected overlay).
  - **color density**: High

### Extension styles / popup styling

- `echly-extension/popup.css`
  - **description**: Extension popup stylesheet.
  - **color density**: High
- `echly-extension/input.css`
  - **description**: Extension CSS input (likely Tailwind/base styles).
  - **color density**: High
- `echly-extension/extension-fonts.css`
  - **description**: Extension font-face/style declarations.
  - **color density**: Medium
- `public/echly-popup.css`
  - **description**: Public CSS for extension popup (packaged/served).
  - **color density**: High

### Extension support scripts (UI-adjacent, not rendering JSX)

- `echly-extension/manifest.json`
  - **description**: Extension manifest (declares popup/content UI).
  - **color density**: Low
- `echly-extension/src/contentAuthFetch.ts`
  - **description**: Content-script auth fetch support for UI.
  - **color density**: Low
- `echly-extension/src/contentScreenshot.ts`
  - **description**: Screenshot capture support for UI overlay.
  - **color density**: Low
- `echly-extension/src/background.ts`
  - **description**: Extension background process (UI support).
  - **color density**: Low
- `echly-extension/src/api.ts`
  - **description**: Extension API client support.
  - **color density**: Low
- `echly-extension/src/auth.ts`
  - **description**: Extension auth support.
  - **color density**: Low
- `echly-extension/src/sessionRelay.ts`
  - **description**: Session relay support for extension UI.
  - **color density**: Low
- `echly-extension/src/cachedSessions.ts`
  - **description**: Caching support for extension UI.
  - **color density**: Low
- `echly-extension/src/ocr.ts`
  - **description**: OCR support for extension flows.
  - **color density**: Low
- `echly-extension/src/utils/buildFeedbackPayload.ts`
  - **description**: Payload builder used by UI flows.
  - **color density**: Low

## 6. Observations

- **Most complex areas**:
  - **OS-style multi-panel layout**: `components/layout/operating-system/*` (many panels, high surface area).
  - **Capture/overlay UI**: `components/CaptureWidget/*` + `lib/capture-engine/core/*` (overlay, interactive, modals, panels).
  - **Command Center blocks**: `components/command-center/*` (color-heavy visualizations).
  - **Feedback detail**: `components/session/feedbackDetail/*` (interactive composition + screenshots/pins).

- **Highest migration risk**:
  - **Overlay + portal systems** (modals/toasts/status overlays) where z-index/portal positioning is fragile: `components/ui/Modal.tsx`, `components/ui/ModalPortal.tsx`, `components/ui/Toast.tsx`, `components/ui/StatusOverlay.tsx`, plus capture overlays.
  - **Extension injected UI** (`echly-extension/src/content.tsx`) due to CSS isolation, host-page collisions, and constrained environment.
  - **Token-driven theming** depends on global CSS variables: `styles/tokens.css` + `app/globals.css` (a migration must preserve variable names/roles).

- **Global styling sources**:
  - `styles/tokens.css` (semantic token source of truth) — **HIGH** color density.
  - `app/globals.css` — global styles for the app — **HIGH** color density.

## Appendix — UI style files (non-component)

- `styles/tokens.css`
  - **category**: PRIMITIVE (design token primitives)
  - **color density**: High
- `app/globals.css`
  - **category**: LAYOUT (global styles)
  - **color density**: High
