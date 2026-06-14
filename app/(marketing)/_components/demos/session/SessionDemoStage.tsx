/**
 * SessionDemoStage — composition root for the Phase 2C session-view forklift.
 *
 * Reproduces the production session route's inline CSS-grid composition
 * (SessionPageClient.tsx:3947-4086) at TWO columns: sidebar (346px) + detail
 * (1fr). No third Activity column (binding decision #1). Selection is local
 * useState (no useRouter/?ticket=); Open/Resolved sections are mutually
 * exclusive (opening one collapses the other), matching production
 * (SessionPageClient.tsx:614-632). Resolve toggles local state and bumps a
 * resolveAffirmationKey so the header's success-ring flash plays.
 *
 * All data is static (sessionMockData + useStaticFeedbackController); there are
 * no Firebase/provider imports anywhere in this subtree.
 */
"use client";

import { useMemo, useState } from "react";
import { AnnoteLogo } from "../../AnnoteLogo";
import { MOCK_SESSION, MOCK_TICKETS } from "./sessionMockData";
import { TicketList, type DemoTicket } from "./TicketList";
import { SessionFeedbackHeader } from "./SessionFeedbackHeader";
import { FeedbackContent } from "./FeedbackContent";
import { SessionTopBar } from "./SessionTopBar";
import { ShareModal } from "./ShareModal";
import { useStaticFeedbackController } from "./useStaticFeedbackController";
import type { DemoMember } from "./DemoAssignDropdown";
// DevToolsPanel is 100% props-driven (no Firebase/auth/repos) — imported
// directly so the demo stays in lockstep with the product. The Activity panel,
// by contrast, is reimplemented (DemoActivityPanel) because the real
// TicketActivityPanel depends on Firestore listeners + Firebase avatar hooks.
import { DevToolsPanel } from "@/components/session/feedbackDetail/DevToolsPanel";
import { DemoActivityPanel } from "./DemoActivityPanel";
import { MOCK_DEVTOOLS, MOCK_ACTIVITY } from "./devtoolsMockData";

/**
 * Assignable people for the demo. The four named collaborators on this session
 * (the MOCK_SESSION viewers) — Maya, Daniel, Sarah, Alex. Their uids match the
 * comment authors' userId seeds so avatar colors stay consistent across the
 * thread and the assignee chip.
 */
const DEMO_MEMBERS: DemoMember[] = [
  { uid: "u-maya", displayName: "Maya Anand", email: "maya@studionorthwind.com", avatarUrl: "/marketing/people/maya-anand.jpg" },
  { uid: "u-daniel", displayName: "Daniel Torres", email: "daniel@studionorthwind.com", avatarUrl: "/marketing/people/daniel-torres.jpg" },
  { uid: "u-sarah", displayName: "Sarah Kim", email: "sarah@studionorthwind.com", avatarUrl: "/marketing/people/sarah-kim.jpg" },
  { uid: "u-alex", displayName: "Alex Nguyen", email: "alex@studionorthwind.com", avatarUrl: "/marketing/people/alex-nguyen.jpg" },
];

export function SessionDemoStage() {
  const [selectedTicketId, setSelectedTicketId] = useState(MOCK_TICKETS[0].id);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [openSection, setOpenSection] = useState<"open" | "resolved">("open");
  // Right-aside slot: Activity and Dev Tools share ONE column and are mutually
  // exclusive (opening one closes the other), matching the real session route
  // (SessionPageClient handleToggleActivity / handleToggleDevTools).
  const [activityOpen, setActivityOpen] = useState(false);
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  // Sidebar auto-collapse, mirroring the production session route
  // (SessionPageClient handleToggleDevTools / closeDevTools): opening Dev Tools
  // collapses the ticket list to a 64px icon rail; closing it — or opening
  // Activity — restores the full-width sidebar. In this demo the rail's expand
  // toggle is wired to close Dev Tools entirely (which restores the sidebar), so
  // the rail tracks Dev Tools 1:1.
  const [railCollapsed, setRailCollapsed] = useState(false);
  // Local resolved overrides (resolve/reopen toggles in the demo).
  const [resolvedOverrides, setResolvedOverrides] = useState<Record<string, boolean>>({});
  const [resolveKey, setResolveKey] = useState(0);

  // Single Dev Tools close path so every way of closing it (header toggle, panel
  // ×, rail toggle) restores the sidebar identically — mirrors
  // SessionPageClient.closeDevTools.
  const closeDevTools = () => {
    setDevToolsOpen(false);
    setRailCollapsed(false);
  };
  const handleToggleActivity = () => {
    setActivityOpen((prev) => {
      const next = !prev;
      // Opening Activity closes Dev Tools and restores the sidebar — same
      // symmetric rule as any other Dev Tools close path.
      if (next) {
        setDevToolsOpen(false);
        setRailCollapsed(false);
      }
      return next;
    });
  };
  const handleToggleDevTools = () => {
    setDevToolsOpen((prev) => {
      const next = !prev;
      if (next) {
        setActivityOpen(false);
        setRailCollapsed(true);
      } else {
        // Symmetric restore on close (any close path expands the sidebar).
        setRailCollapsed(false);
      }
      return next;
    });
  };
  const railIsCollapsed = railCollapsed;
  const rightPanelOpen = activityOpen || devToolsOpen;

  const tickets = useMemo(
    () =>
      MOCK_TICKETS.map((t) => ({
        ...t,
        status: (resolvedOverrides[t.id] ?? (t.status === "resolved"))
          ? ("resolved" as const)
          : ("open" as const),
      })),
    [resolvedOverrides]
  );

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) ?? tickets[0];
  const controller = useStaticFeedbackController(selectedTicket);

  // Combine the selected ticket's base identity with its static Dev Tools mock
  // streams into the permissive DevToolsFeedback shape the panel reads. Built
  // fresh per selection so each ticket shows its own console/network/actions/AI.
  const devToolsFeedback = useMemo(() => {
    const dt = MOCK_DEVTOOLS[selectedTicket.id];
    if (!dt) return { id: selectedTicket.id };
    return {
      id: selectedTicket.id,
      consoleLogs: dt.consoleLogs,
      exceptions: dt.exceptions,
      consoleLogCount: dt.consoleLogs.length,
      exceptionCount: dt.exceptions.length,
      errorCount: dt.consoleLogs.filter((l) => l.level === "error").length,
      warningCount: dt.consoleLogs.filter((l) => l.level === "warn").length,
      networkRequests: dt.networkRequests,
      networkRequestCount: dt.networkRequests.length,
      networkErrorCount: dt.networkRequests.filter(
        (r) => r.errored || (r.status != null && r.status >= 400)
      ).length,
      userActions: dt.userActions,
      userActionCount: dt.userActions.length,
      aiSummary: dt.aiSummary,
      aiCause: dt.aiCause,
      aiFixSteps: dt.aiFixSteps,
      aiSignalRelation: dt.aiSignalRelation,
      aiConfidence: dt.aiConfidence,
      aiAnalysisStatus: dt.aiAnalysisStatus,
      url: dt.url,
      userAgent: dt.userAgent,
      viewportWidth: dt.viewportWidth,
      viewportHeight: dt.viewportHeight,
      screenWidth: dt.screenWidth,
      screenHeight: dt.screenHeight,
      devicePixelRatio: dt.devicePixelRatio,
      clientTimestamp: dt.clientTimestamp,
    };
  }, [selectedTicket.id]);

  const activityEvents = MOCK_ACTIVITY[selectedTicket.id] ?? [];

  const counts = useMemo(() => {
    const resolved = tickets.filter((t) => t.status === "resolved").length;
    return { total: tickets.length, open: tickets.length - resolved, resolved };
  }, [tickets]);

  const listItems: DemoTicket[] = tickets.map((t) => ({
    id: t.id,
    title: t.title,
    isResolved: t.status === "resolved",
    tags: t.tags,
  }));

  const orderedForIndex = useMemo(
    () => [...tickets.filter((t) => t.status === "open"), ...tickets.filter((t) => t.status === "resolved")],
    [tickets]
  );
  const headerIndex = Math.max(orderedForIndex.findIndex((t) => t.id === selectedTicket.id) + 1, 1);

  const handleResolveChange = (isResolved: boolean) => {
    setResolvedOverrides((prev) => ({ ...prev, [selectedTicket.id]: isResolved }));
    if (isResolved) setResolveKey((k) => k + 1);
  };

  const viewTooltip = MOCK_SESSION.viewers.map((v) => v.name).join("\n");

  return (
    <div className="session-demo-stage">
      {/* Top control bar: Annote logo mark (left) balances presence + share pill (right) */}
      <div className="session-demo-topbar">
        <div className="session-demo-topbar-left">
          <AnnoteLogo width={22} height={28} />
        </div>
        <div className="session-demo-topbar-right">
          <SessionTopBar onShareClick={() => setShareModalOpen(true)} />
        </div>
      </div>

      {/* Two-column grid; gains a third (right-aside) column when Activity or
          Dev Tools is open. The third track animates open via grid-template-
          columns transition in marketing.css (.session-demo-grid--with-panel). */}
      <div
        className={`session-demo-grid${rightPanelOpen ? " session-demo-grid--with-panel" : ""}${devToolsOpen ? " session-demo-grid--devtools" : ""}${railIsCollapsed ? " session-demo-grid--rail" : ""}`}
      >
        <aside className="session-demo-sidebar">
          <TicketList
            counts={counts}
            items={listItems}
            selectedId={selectedTicket.id}
            onSelect={setSelectedTicketId}
            workspaceName={MOCK_SESSION.workspaceName}
            sessionTitle={MOCK_SESSION.title}
            viewCount={MOCK_SESSION.viewers.length}
            viewTooltip={viewTooltip}
            isWorkspaceMember
            openExpanded={openSection === "open"}
            onOpenExpandedChange={() => setOpenSection("open")}
            resolvedExpanded={openSection === "resolved"}
            onResolvedExpandedChange={() => setOpenSection("resolved")}
            collapsed={railIsCollapsed}
            // The rail's expand toggle closes Dev Tools entirely (which restores
            // the full-width sidebar), per the requested behavior.
            onExpandRail={closeDevTools}
          />
        </aside>

        <section className="session-demo-detail">
          <main className="session-demo-detail-main session-demo-detail-scroll-area">
            <SessionFeedbackHeader
              item={{
                id: selectedTicket.id,
                title: selectedTicket.title,
                isResolved: selectedTicket.status === "resolved",
                index: headerIndex,
                total: tickets.length,
              }}
              pageMetadata={selectedTicket.pageMetadata}
              resolveAffirmationKey={resolveKey}
              onResolvedChange={handleResolveChange}
              onToggleActivity={handleToggleActivity}
              isActivityPanelOpen={activityOpen}
              onToggleDevTools={handleToggleDevTools}
              isDevToolsPanelOpen={devToolsOpen}
              onDelete={() => { /* no-op in the marketing demo */ }}
              members={DEMO_MEMBERS}
              assignment={controller.assignment}
              onAssigned={(id, name, avatarUrl) =>
                controller.assignTo(id && name ? { id, name, avatarUrl: avatarUrl ?? "" } : null)
              }
              onPriorityChanged={controller.setPriority}
            />
            <FeedbackContent ticket={selectedTicket} controller={controller} />
          </main>
        </section>

        {/* Right-aside slot — Dev Tools and Activity are mutually exclusive and
            share this single column (matches SessionPageClient's reused aside).
            Rendered only when open so the collapsed track carries no DOM weight. */}
        {rightPanelOpen && (
          <aside className="session-demo-rightpanel">
            {devToolsOpen ? (
              <DevToolsPanel
                // Re-key on the selected ticket so switching tickets remounts
                // the panel with that ticket's streams (and resets to AI tab).
                key={`devtools-${selectedTicket.id}`}
                feedback={devToolsFeedback}
                onClose={closeDevTools}
              />
            ) : (
              <DemoActivityPanel
                events={activityEvents}
                onClose={() => setActivityOpen(false)}
              />
            )}
          </aside>
        )}
      </div>

      {shareModalOpen && <ShareModal onClose={() => setShareModalOpen(false)} />}
    </div>
  );
}
