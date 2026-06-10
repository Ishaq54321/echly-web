"use client";

import { useState } from "react";
import { PanelRight } from "lucide-react";
import type { Feedback } from "@/lib/domain/feedback";

/**
 * Permissive subset of Feedback that the Dev Tools panel reads. Avoids
 * tight coupling to the full Firestore Feedback shape (which carries
 * Timestamp objects the dashboard's API-serialized rows don't), while
 * still surfacing missing-field bugs at the call site.
 */
export type DevToolsFeedback = Partial<
  Pick<
    Feedback,
    | "id"
    | "url"
    | "pageArea"
    | "userAgent"
    | "viewportWidth"
    | "viewportHeight"
    | "screenWidth"
    | "screenHeight"
    | "devicePixelRatio"
    | "clientTimestamp"
    | "workspaceId"
    | "sessionId"
    | "consoleLogs"
    | "exceptions"
    | "consoleLogCount"
    | "exceptionCount"
    | "errorCount"
    | "warningCount"
    | "networkRequests"
    | "networkRequestCount"
    | "networkErrorCount"
    | "userActions"
    | "userActionCount"
    | "aiSummary"
    | "aiFixSuggestion"
    | "aiCause"
    | "aiFixSteps"
    | "aiConfidence"
    | "aiAnalysisStatus"
  >
>;
import { Tabs, type TabsItem } from "@/components/ui/Tabs";
import { ActionsTabContent } from "@/components/session/feedbackDetail/devtools/ActionsTabContent";
import { ConsoleTabContent } from "@/components/session/feedbackDetail/devtools/ConsoleTabContent";
import { MetadataTabContent } from "@/components/session/feedbackDetail/devtools/MetadataTabContent";
import { NetworkTabContent } from "@/components/session/feedbackDetail/devtools/NetworkTabContent";
import { AiTabContent } from "@/components/session/feedbackDetail/devtools/AiTabContent";

export type DevToolsTabId = "ai" | "actions" | "console" | "network" | "metadata";
export type DevToolsConsoleFilter = "errors" | "warnings" | "all";
export type DevToolsNetworkFilter = "errors";

export interface DevToolsPanelProps {
  feedback: DevToolsFeedback | null | undefined;
  onClose: () => void;
  initialTab?: DevToolsTabId;
  initialFilter?: DevToolsConsoleFilter;
  /** Phase N5D: pre-applies the Errors-only chip on Network tab when set. */
  initialNetworkFilter?: DevToolsNetworkFilter;
  /** Phase 5E: when true, ConsoleTabContent scrolls its Exceptions section into view on mount. */
  scrollToExceptions?: boolean;
  /** AI panel: client-side request error (POST failed without a terminal doc status). */
  aiClientError?: boolean;
  /** AI panel: manual retry — re-fires the analyze POST. */
  onAiRetry?: () => void;
}

/**
 * Per-ticket Dev Tools side panel (Phase 5).
 *
 * Sibling of TicketActivityPanel — reuses the exact same `.ticket-activity-*`
 * chrome classes so the frame (width, header, close button, animation) is
 * pixel-identical. Content swaps in via internal sub-tabs (Console default,
 * Metadata) and a subtle 12px-slide + fade on tab change.
 */
export function DevToolsPanel({
  feedback,
  onClose,
  initialTab = "ai",
  initialFilter,
  initialNetworkFilter,
  scrollToExceptions = false,
  aiClientError = false,
  onAiRetry,
}: DevToolsPanelProps) {
  // `initialTab` is the entry-time default. The caller (SessionPageClient)
  // forces a re-mount via `key` when it wants to override the active tab
  // mid-session (header badge click), which makes useState honor the new
  // initial value without a setState-in-effect.
  const [activeTab, setActiveTab] = useState<DevToolsTabId>(initialTab);

  // AI is placed first in the strip as the landing tab for triage, and is also
  // the default SELECTED tab (`initialTab`, set by the caller). Header-badge
  // deep-links still pass their own explicit tab (console/network), so that
  // entry behavior is unchanged.
  const tabs: TabsItem[] = [
    { id: "ai", label: "AI" },
    { id: "actions", label: "Actions" },
    { id: "console", label: "Console" },
    { id: "network", label: "Network" },
    { id: "metadata", label: "Metadata" },
  ];

  return (
    <div className="ticket-activity-panel" style={{ width: "100%" }}>
      <div className="ticket-activity-header">
        <h3 className="ticket-activity-title">Dev Tools</h3>
        <button
          type="button"
          className="ticket-activity-close"
          onClick={onClose}
          aria-label="Close dev tools panel"
        >
          <PanelRight size={18} strokeWidth={1.75} />
        </button>
      </div>

      <div className="px-4 pt-3 border-b border-[var(--border-subtle)] flex-shrink-0">
        <Tabs
          tabs={tabs}
          activeTabId={activeTab}
          onChange={(id) => setActiveTab(id as DevToolsTabId)}
          variant="underline"
          size="md"
          ariaLabel="Dev Tools sections"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <DevToolsTabPanel id="ai" activeId={activeTab}>
          <AiTabContent
            ticketId={feedback?.id}
            aiSummary={feedback?.aiSummary}
            aiFixSuggestion={feedback?.aiFixSuggestion}
            aiCause={feedback?.aiCause}
            aiFixSteps={feedback?.aiFixSteps}
            aiConfidence={feedback?.aiConfidence}
            aiAnalysisStatus={feedback?.aiAnalysisStatus}
            clientError={aiClientError}
            onRetry={onAiRetry}
          />
        </DevToolsTabPanel>

        <DevToolsTabPanel id="actions" activeId={activeTab}>
          <ActionsTabContent
            userActions={feedback?.userActions}
            userActionCount={feedback?.userActionCount}
          />
        </DevToolsTabPanel>

        <DevToolsTabPanel id="console" activeId={activeTab}>
          <ConsoleTabContent
            consoleLogs={feedback?.consoleLogs}
            exceptions={feedback?.exceptions}
            consoleLogCount={feedback?.consoleLogCount}
            exceptionCount={feedback?.exceptionCount}
            initialFilter={initialFilter}
            scrollToExceptions={scrollToExceptions}
          />
        </DevToolsTabPanel>

        <DevToolsTabPanel id="network" activeId={activeTab}>
          <NetworkTabContent
            networkRequests={feedback?.networkRequests}
            networkRequestCount={feedback?.networkRequestCount}
            networkErrorCount={feedback?.networkErrorCount}
            initialFilter={initialNetworkFilter}
          />
        </DevToolsTabPanel>

        <DevToolsTabPanel id="metadata" activeId={activeTab}>
          <MetadataTabContent feedback={feedback ?? null} />
        </DevToolsTabPanel>
      </div>
    </div>
  );
}

/**
 * Sub-tab wrapper. Mounts only the active panel (no DOM weight for inactive
 * tabs), with a subtle 12px upward slide + fade on entry (~220ms ease-out).
 * The wrapper re-keys on `activeId` so the entry animation replays each
 * switch.
 */
function DevToolsTabPanel({
  id,
  activeId,
  children,
}: {
  id: DevToolsTabId;
  activeId: DevToolsTabId;
  children: React.ReactNode;
}) {
  if (id !== activeId) return null;
  return (
    <div
      key={id}
      role="tabpanel"
      aria-labelledby={`devtools-tab-${id}`}
      className="devtools-tabpanel-enter"
    >
      {children}
      <style>{`
        .devtools-tabpanel-enter {
          animation: devtools-tabpanel-in 220ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes devtools-tabpanel-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .devtools-tabpanel-enter { animation: none; }
        }
      `}</style>
    </div>
  );
}

export default DevToolsPanel;
