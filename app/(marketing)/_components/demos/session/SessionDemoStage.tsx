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

export function SessionDemoStage() {
  const [selectedTicketId, setSelectedTicketId] = useState(MOCK_TICKETS[0].id);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [openSection, setOpenSection] = useState<"open" | "resolved">("open");
  const [activityOpen, setActivityOpen] = useState(false);
  // Local resolved overrides (resolve/reopen toggles in the demo).
  const [resolvedOverrides, setResolvedOverrides] = useState<Record<string, boolean>>({});
  const [resolveKey, setResolveKey] = useState(0);

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

      {/* Two-column grid */}
      <div className="session-demo-grid">
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
              onToggleActivity={() => setActivityOpen((v) => !v)}
              isActivityPanelOpen={activityOpen}
              onDelete={() => { /* no-op in the marketing demo */ }}
            />
            <FeedbackContent ticket={selectedTicket} controller={controller} />
          </main>
        </section>
      </div>

      {shareModalOpen && <ShareModal onClose={() => setShareModalOpen(false)} />}
    </div>
  );
}
