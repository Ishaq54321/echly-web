"use client";

import { useEffect, useMemo, useRef, useState, Fragment } from "react";
import {
  Monitor,
  Laptop,
  ChevronDown,
  ChevronUp,
  Gem,
  Check,
  Minus,
} from "lucide-react";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";
import { Modal } from "@/components/ui/Modal";
import type { Workspace } from "@/lib/domain/workspace";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository";
import {
  listenToWorkspace,
  updateWorkspaceAppearance,
  updateWorkspaceName,
  updateWorkspaceNotifications,
  updateWorkspaceSettings,
} from "@/lib/repositories/workspacesRepository";

/* Fintech design system */
const SETTINGS_CARD =
  "rounded-2xl border border-[#E3E6E5] bg-[#FFFFFF] p-6 transition-[border-color,box-shadow] duration-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]";
const CARD_GAP = "space-y-8";
const ROW_GAP = "space-y-5";
const SECTION_TITLE = "text-h2 font-semibold text-[#111111]";
const SECTION_SUBTITLE = "text-body font-semibold text-[#111111]";
const SECTION_DESC = "text-meta text-[#6B7280] mt-1";
const SETTING_DESC = "text-meta text-[#6B7280] mt-0.5";
const BTN_PRIMARY = "primary-cta rounded-full px-4 py-2.5 text-meta transition-colors";
const BTN_SECONDARY = "rounded-full px-4 py-2.5 text-meta font-semibold bg-[#DDF3C8] text-[#111111] border border-[#E3E6E5] hover:bg-[#cceeb8] transition-colors";

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      <h2 className={SECTION_TITLE}>{title}</h2>
      {description && <p className={`${SECTION_DESC} mt-4`}>{description}</p>}
    </div>
  );
}

const TABS = [
  { id: "general", label: "General" },
  { id: "security", label: "Security" },
  { id: "integrations", label: "Integrations" },
  { id: "billing", label: "Billing" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SettingsPage() {
  const { user } = useAuthGuard();
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loadingWorkspace, setLoadingWorkspace] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!user) {
        if (!cancelled) {
          setWorkspaceId(null);
          setWorkspace(null);
          setLoadingWorkspace(false);
        }
        return;
      }
      setLoadingWorkspace(true);
      const wid = await getUserWorkspaceIdRepo(user.uid);
      if (cancelled) return;
      setWorkspaceId(wid);
      setLoadingWorkspace(false);
    }
    run().catch((e) => {
      console.error("Failed to load workspaceId:", e);
      setLoadingWorkspace(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  useEffect(() => {
    if (!workspaceId) {
      setWorkspace(null);
      return;
    }
    const unsub = listenToWorkspace(workspaceId, setWorkspace);
    return () => unsub();
  }, [workspaceId]);

  return (
    <div className="flex flex-1 min-h-0 bg-[#FFFFFF] overflow-auto">
      <div className="flex-1 min-w-0 max-w-[1200px] mx-auto px-6 py-10 w-full">
        <header className="mb-8">
          <h1 className="text-h1 font-semibold tracking-tight text-[#111111]">
            Settings
          </h1>
          <p className="mt-1.5 text-meta text-[#6B7280]">
            Manage your workspace, notifications, and preferences.
          </p>
        </header>

        <nav
          className="flex items-center gap-10 border-b border-[#E3E6E5] mb-8"
          aria-label="Settings sections"
        >
          {TABS.map(({ id, label }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`
                  relative pb-3 text-meta transition-colors duration-200
                  ${isActive ? "text-[#111111] font-semibold" : "text-[#6B7280] font-medium hover:text-[#4B5563]"}
                `}
                aria-current={isActive ? "true" : undefined}
              >
                {label}
                {isActive && (
                  <span
                    className="absolute left-0 right-0 bottom-0 h-[3px] bg-[#D1D5DB] rounded-full"
                    aria-hidden
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Tab content */}
        {activeTab === "general" && (
          <GeneralTab
            workspace={workspace}
            workspaceId={workspaceId}
            loading={loadingWorkspace}
            onNavigateToBilling={() => setActiveTab("billing")}
          />
        )}
        {activeTab === "security" && <SecurityTab user={user} />}
        {activeTab === "integrations" && (
          <IntegrationsTab onNavigateToBilling={() => setActiveTab("billing")} />
        )}
        {activeTab === "billing" && <BillingTab />}
      </div>
    </div>
  );
}

/* ——— General tab: Workspace, Appearance, Notifications only ——— */
function GeneralTab({
  workspace,
  workspaceId,
  loading,
  onNavigateToBilling,
}: {
  workspace: Workspace | null;
  workspaceId: string | null;
  loading: boolean;
  onNavigateToBilling: () => void;
}) {
  return (
    <div className={`${CARD_GAP} pb-16`}>
      <WorkspaceCard workspace={workspace} workspaceId={workspaceId} loading={loading} />
      <AppearanceCard
        workspace={workspace}
        workspaceId={workspaceId}
        loading={loading}
        onNavigateToBilling={onNavigateToBilling}
      />
      <NotificationsCard workspace={workspace} workspaceId={workspaceId} loading={loading} />
      <AdvancedSettingsCard workspace={workspace} workspaceId={workspaceId} loading={loading} />
    </div>
  );
}

function WorkspaceCard({
  workspace,
  workspaceId,
  loading,
}: {
  workspace: Workspace | null;
  workspaceId: string | null;
  loading: boolean;
}) {
  const [nameDraft, setNameDraft] = useState("");
  const lastWorkspaceIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (workspaceId !== lastWorkspaceIdRef.current) {
      lastWorkspaceIdRef.current = workspaceId;
      setNameDraft(workspace?.name ?? "");
    } else if (workspace && nameDraft === "") {
      setNameDraft(workspace.name ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, workspace?.name]);

  return (
    <Card className={SETTINGS_CARD} as="article">
      <SectionHeader
        title="Workspace"
        description="Name and logo for this workspace."
      />
      <div className={`mt-4 pt-4 border-t border-[var(--border-default)] ${ROW_GAP}`}>
        <div className="flex flex-wrap items-start justify-between gap-4 py-1">
          <div className="min-w-0">
            <h3 className={SECTION_SUBTITLE}>Workspace Name</h3>
            <p className={SETTING_DESC}>Displayed in the app and in shared links.</p>
          </div>
          <input
            type="text"
            value={nameDraft}
            disabled={loading || !workspaceId}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={() => {
              if (!workspaceId) return;
              const next = nameDraft.trim() || "My Workspace";
              if (workspace?.name === next) return;
              updateWorkspaceName(workspaceId, next).catch((e) =>
                console.error("Failed to update workspace name:", e)
              );
            }}
            className="max-w-[360px] w-full min-w-0 px-3 py-2.5 rounded-lg border border-[var(--border-default)] text-[15px] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-[#D1D5DB] transition-all duration-200 shrink-0"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-[var(--border-default)]">
          <div className="min-w-0">
            <h3 className={SECTION_SUBTITLE}>Workspace Logo</h3>
            <p className={SETTING_DESC}>Shown in the sidebar and on shared pages.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-12 h-12 rounded-full bg-neutral-100 border border-[var(--border-default)] flex items-center justify-center text-neutral-500 text-xs shrink-0 overflow-hidden">
              Logo
            </div>
            <Button variant="secondary" className={BTN_SECONDARY}>
              Upload
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

const NOTIFICATION_OPTIONS = [
  { key: "feedbackSubmitted", title: "Email Notifications for Feedback", desc: "Get notified when someone submits new feedback on your tickets." },
  { key: "replyPosted", title: "Email Notifications for Replies", desc: "Get notified when someone responds to feedback on your tickets." },
  { key: "dailyDigest", title: "Daily Activity Digest", desc: "Receive a daily summary of activity in your workspace." },
  { key: "commentMentions", title: "Comment Mentions", desc: "Receive alerts when teammates mention you in comments." },
];

function NotificationsCard({
  workspace,
  workspaceId,
  loading,
}: {
  workspace: Workspace | null;
  workspaceId: string | null;
  loading: boolean;
}) {
  const email = workspace?.notifications?.email;
  const state = {
    feedbackSubmitted: email?.feedbackSubmitted ?? true,
    replyPosted: email?.replyPosted ?? true,
    dailyDigest: email?.dailyDigest ?? false,
    commentMentions: email?.commentMentions ?? true,
  };

  return (
    <Card className={SETTINGS_CARD} as="article">
      <SectionHeader
        title="Notifications"
        description="Choose when you want to receive email notifications."
      />
      <div className={`mt-4 pt-4 border-t border-[var(--border-default)] divide-y divide-[var(--border-default)] [&>div]:py-5`}>
        {NOTIFICATION_OPTIONS.map(({ key, title, desc }) => (
          <div
            key={key}
            className="flex items-center justify-between gap-4 first:pt-0 last:pb-0"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-medium text-neutral-900">{title}</p>
              <p className={SETTING_DESC}>{desc}</p>
            </div>
            <Switch
              checked={state[key as keyof typeof state]}
              disabled={loading || !workspaceId}
              onChange={(v) => {
                if (!workspaceId) return;
                const next = {
                  ...(workspace?.notifications ?? { email: state }),
                  email: {
                    ...(workspace?.notifications?.email ?? state),
                    [key]: v,
                  },
                } as Workspace["notifications"];
                updateWorkspaceNotifications(workspaceId, next).catch((e) =>
                  console.error("Failed to update notifications:", e)
                );
              }}
              className="shrink-0 transition-all duration-200 ease-out"
            />
          </div>
        ))}
      </div>
    </Card>
  );
}

const UPGRADE_TOOLTIP = "Upgrade your plan to unlock branding features.";

function UpgradePlanBadge({ onClick, title }: { onClick?: () => void; title?: string }) {
  const tooltip = title ?? UPGRADE_TOOLTIP;
  const base =
    "inline-flex items-center gap-1.5 rounded-[999px] py-1 px-2.5 bg-emerald-100/90 text-neutral-900 text-xs font-semibold transition-all duration-200 hover:bg-emerald-200/90 hover:shadow-sm [&_svg]:text-neutral-900 [&_svg]:stroke-[2.5]";
  if (onClick)
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        title={tooltip}
        className={`${base} shrink-0`}
      >
        <Gem className="w-3.5 h-3.5" aria-hidden />
        Upgrade Plan
      </button>
    );
  return (
    <span className={base} title={tooltip}>
      <Gem className="w-3.5 h-3.5" aria-hidden />
      Upgrade Plan
    </span>
  );
}

function AppearanceCard({
  workspace,
  workspaceId,
  loading,
  onNavigateToBilling,
}: {
  workspace: Workspace | null;
  workspaceId: string | null;
  loading: boolean;
  onNavigateToBilling: () => void;
}) {
  const isPro = false; // TODO: from plan/subscription
  const appearance = workspace?.appearance;
  const logoOnScreen = appearance?.logoOnFeedbackScreen ?? false;
  const accentColorEnabled = (appearance?.accentColor ?? null) != null;
  const removeBranding = appearance?.removeEchlyBranding ?? false;

  function AppearanceRow({
    title,
    preview,
    checked,
    onChange,
  }: {
    title: string;
    preview: string;
    checked: boolean;
    onChange: (v: boolean) => void;
  }) {
    const locked = !isPro;
    return (
      <div
        role={locked ? "button" : undefined}
        tabIndex={locked ? 0 : undefined}
        onClick={() => locked && onNavigateToBilling()}
        onKeyDown={(e) => e.key === "Enter" && locked && onNavigateToBilling()}
        title={locked ? UPGRADE_TOOLTIP : undefined}
        className={`flex items-center justify-between gap-4 py-4 px-3 -mx-3 rounded-lg transition-colors duration-200 ${locked ? "cursor-pointer hover:bg-[#E9ECEB]" : ""}`}
      >
        <div className="min-w-0 flex-1 flex items-center gap-3 flex-wrap">
          <div>
            <p className="text-[15px] font-semibold text-neutral-900">{title}</p>
            <p className={SETTING_DESC}>{preview}</p>
          </div>
          {locked && (
            <UpgradePlanBadge onClick={onNavigateToBilling} title={UPGRADE_TOOLTIP} />
          )}
        </div>
        <Switch
          checked={checked}
          onChange={onChange}
          disabled={locked}
          className="shrink-0 transition-all duration-200 ease-out"
        />
      </div>
    );
  }

  return (
    <Card className={SETTINGS_CARD} as="article">
      <SectionHeader
        title="Appearance"
        description="Customize how Echly appears in your feedback experience."
      />
      <div className={`mt-4 pt-4 border-t border-[var(--border-default)] ${ROW_GAP}`}>
        <AppearanceRow
          title="Logo on Feedback Screen"
          preview="Add your company logo to feedback sessions."
          checked={logoOnScreen}
          onChange={(v) => {
            if (!workspaceId) return;
            const next = {
              ...(workspace?.appearance ?? {
                logoOnFeedbackScreen: false,
                accentColor: null,
                removeEchlyBranding: false,
              }),
              logoOnFeedbackScreen: v,
            };
            updateWorkspaceAppearance(workspaceId, next).catch((e) =>
              console.error("Failed to update appearance:", e)
            );
          }}
        />
        <AppearanceRow
          title="Custom Accent Color"
          preview="Match the feedback UI to your brand color."
          checked={accentColorEnabled}
          onChange={(v) => {
            if (!workspaceId) return;
            const next = {
              ...(workspace?.appearance ?? {
                logoOnFeedbackScreen: false,
                accentColor: null,
                removeEchlyBranding: false,
              }),
              accentColor: v ? (appearance?.accentColor ?? "#9FE870") : null,
            };
            updateWorkspaceAppearance(workspaceId, next).catch((e) =>
              console.error("Failed to update appearance:", e)
            );
          }}
        />
        <AppearanceRow
          title="Remove Echly Branding"
          preview="Hide Echly logo and branding on shared feedback pages."
          checked={removeBranding}
          onChange={(v) => {
            if (!workspaceId) return;
            const next = {
              ...(workspace?.appearance ?? {
                logoOnFeedbackScreen: false,
                accentColor: null,
                removeEchlyBranding: false,
              }),
              removeEchlyBranding: v,
            };
            updateWorkspaceAppearance(workspaceId, next).catch((e) =>
              console.error("Failed to update appearance:", e)
            );
          }}
        />
      </div>
    </Card>
  );
}

const ADVANCED_OPTIONS = [
  { key: "autoCreateTicket", title: "Auto-Create Ticket When Feedback Added", desc: "Create a ticket automatically when new feedback is submitted." },
  { key: "guestComments", title: "Allow Guest Comments", desc: "Let people without an account comment on feedback." },
  { key: "aiActionSteps", title: "AI Action Steps", desc: "Use AI to suggest action steps from feedback content." },
];

function AdvancedSettingsCard({
  workspace,
  workspaceId,
  loading,
}: {
  workspace: Workspace | null;
  workspaceId: string | null;
  loading: boolean;
}) {
  const [open, setOpen] = useState(false); /* collapsed by default */
  const state = {
    autoCreateTicket: workspace?.automations?.autoCreateTicketOnFeedback ?? false,
    guestComments: workspace?.permissions?.allowGuestComments ?? false,
    aiActionSteps: workspace?.ai?.actionStepsEnabled ?? true,
  };

  return (
    <Card className={SETTINGS_CARD} as="article">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 text-left rounded-lg py-2 -my-2 px-2 -mx-2 hover:bg-[#E9ECEB]/80 transition-colors duration-200"
        aria-expanded={open}
      >
        <span className={SECTION_TITLE}>Advanced Settings</span>
        <span className="text-neutral-500 shrink-0" aria-hidden>
          {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </span>
      </button>
      <div
        className="overflow-hidden transition-[max-height] duration-300 ease-out"
        style={{ maxHeight: open ? 400 : 0 }}
      >
        <div className={`mt-4 pt-4 border-t border-[var(--border-default)] divide-y divide-[var(--border-default)] [&>div]:py-5`}>
          {ADVANCED_OPTIONS.map(({ key, title, desc }) => (
            <div
              key={key}
              className="flex items-center justify-between gap-4 first:pt-0 last:pb-0"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-medium text-neutral-900">{title}</p>
                <p className={SETTING_DESC}>{desc}</p>
              </div>
              <Switch
                checked={state[key as keyof typeof state]}
                disabled={loading || !workspaceId}
                onChange={(v) => {
                  if (!workspaceId) return;
                  if (key === "autoCreateTicket") {
                    updateWorkspaceSettings(workspaceId, {
                      automations: {
                        ...(workspace?.automations ?? { autoCreateTicketOnFeedback: false }),
                        autoCreateTicketOnFeedback: v,
                      },
                    }).catch((e) => console.error("Failed to update automations:", e));
                    return;
                  }
                  if (key === "guestComments") {
                    updateWorkspaceSettings(workspaceId, {
                      permissions: {
                        ...(workspace?.permissions ?? { allowGuestComments: false }),
                        allowGuestComments: v,
                      },
                    }).catch((e) => console.error("Failed to update permissions:", e));
                    return;
                  }
                  if (key === "aiActionSteps") {
                    updateWorkspaceSettings(workspaceId, {
                      ai: {
                        ...(workspace?.ai ?? { actionStepsEnabled: true }),
                        actionStepsEnabled: v,
                      },
                    }).catch((e) => console.error("Failed to update ai:", e));
                  }
                }}
                className="shrink-0 transition-all duration-200 ease-out"
              />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

/* ——— Security tab ——— */
type SessionRow = {
  id: string;
  device: string;
  browser: string;
  location: string;
  current: boolean;
  icon: typeof Laptop;
};

function SecurityTab({ user }: { user: { email: string | null } | null }) {
  const sessions = useMemo<SessionRow[]>(
    () => [
      { id: "1", device: "MacBook Pro", browser: "Chrome", location: "San Francisco, US", current: true, icon: Laptop },
      { id: "2", device: "Windows PC", browser: "Chrome", location: "New York, US", current: false, icon: Monitor },
    ],
    []
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <div className={CARD_GAP}>
      <Card className={SETTINGS_CARD} as="article">
        <SectionHeader
          title="Password & Authentication"
          description="Manage your password and two-factor authentication."
        />
        <div className={`mt-4 pt-4 border-t border-[var(--border-default)] ${ROW_GAP}`}>
          <div className="flex flex-wrap items-center justify-between gap-4 py-1">
            <div className="min-w-0">
              <p className="text-[15px] font-medium text-neutral-900">Change Password</p>
              <p className={SETTING_DESC}>Update your account password.</p>
            </div>
            <Button variant="secondary" className={`${BTN_SECONDARY} shrink-0`}>
              Change Password
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-[var(--border-default)]">
            <div className="min-w-0">
              <p className="text-[15px] font-medium text-neutral-900">Enable Two-Factor Authentication</p>
              <p className={SETTING_DESC}>Add an extra layer of security.</p>
            </div>
            <Button variant="secondary" className={`${BTN_SECONDARY} shrink-0`}>
              Enable
            </Button>
          </div>
        </div>
      </Card>

      <Card className={SETTINGS_CARD} as="article">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-0">
          <SectionHeader
            title="Active Sessions"
            description="Devices where you're currently signed in."
          />
          <Button variant="ghost" className="text-sm font-semibold text-[#111111] hover:underline shrink-0 rounded-lg px-4 py-2.5">
            Log out of all other sessions
          </Button>
        </div>
        <div className="mt-4 pt-4 border-t border-[var(--border-default)] space-y-2">
          {sessions.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                className="flex items-center gap-3 py-3 px-3 rounded-lg border border-transparent hover:bg-[#E9ECEB]/80 hover:border-[var(--border-default)] transition-all duration-200"
              >
                <Icon className="w-5 h-5 text-neutral-400 shrink-0" strokeWidth={1.8} />
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-neutral-900">{s.device}</p>
                  <p className={SETTING_DESC}>{s.browser} · {s.location}</p>
                </div>
                {s.current && (
                  <span className="text-xs font-semibold text-[#111111] shrink-0">Current</span>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Collapsible Advanced Security Settings */}
      <Card className={SETTINGS_CARD} as="article">
        <button
          type="button"
          onClick={() => setAdvancedOpen(!advancedOpen)}
          className="w-full flex items-center justify-between gap-3 text-left rounded-lg py-2 -my-2 px-2 -mx-2 hover:bg-[#E9ECEB]/80 transition-colors duration-200"
          aria-expanded={advancedOpen}
        >
          <span className={SECTION_TITLE}>Advanced Security Settings</span>
          <span className="text-neutral-500 shrink-0" aria-hidden>
            {advancedOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </span>
        </button>
        <div
          className="overflow-hidden transition-[max-height] duration-300 ease-out"
          style={{ maxHeight: advancedOpen ? 400 : 0 }}
        >
          <div className="mt-4 pt-4 border-t border-[var(--border-default)] space-y-6">
            <div>
              <h2 className="text-[18px] font-semibold text-[#111111]">Irreversible Or High Impact Actions</h2>
              <p className="mt-1 text-[14px] text-[#6B7280]">Proceed With Caution</p>
            </div>
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-[15px] font-medium text-neutral-900">Transfer Workspace Ownership</p>
                  <p className={SETTING_DESC}>Assign another member as the workspace owner.</p>
                </div>
                <Button variant="secondary" className={`${BTN_SECONDARY} shrink-0`}>
                  Transfer
                </Button>
              </div>
              <div className="flex items-center justify-between gap-4 flex-wrap pt-5 border-t border-[var(--border-default)]">
                <div>
                  <p className="text-[15px] font-semibold text-neutral-900">Delete Workspace</p>
                  <p className={SETTING_DESC}>Permanently delete this workspace and all its data. This cannot be undone.</p>
                </div>
                <Button
                  variant="danger"
                  className="rounded-[8px] px-4 py-2.5 text-sm font-semibold shrink-0 bg-red-600 text-white hover:bg-red-700 hover:shadow-[0_2px_8px_rgba(220,38,38,0.35)] transition-all duration-200"
                  onClick={() => setDeleteModalOpen(true)}
                >
                  Delete Workspace
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} role="alertdialog" ariaLabelledBy="delete-workspace-title">
        <div className="p-6 max-w-md">
          <h3 id="delete-workspace-title" className="text-lg font-semibold text-neutral-900">Delete workspace?</h3>
          <p className="mt-2 text-sm text-[#6B7280]">
            This will permanently delete the workspace and all associated data. This action cannot be undone.
          </p>
          <div className="mt-6 flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => setDeleteModalOpen(false)}>Delete workspace</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

const INTEGRATIONS: { id: string; name: string; logoSrc: string; description: string; pro: boolean }[] = [
  { id: "slack", name: "Slack", logoSrc: "/assets/integrations/slack.svg", description: "Receive feedback notifications in Slack.", pro: true },
  { id: "linear", name: "Linear", logoSrc: "/assets/integrations/linear.svg", description: "Sync feedback and tickets with Linear.", pro: true },
  { id: "jira", name: "Jira", logoSrc: "/assets/integrations/jira.svg", description: "Link Echly feedback to Jira issues.", pro: true },
  { id: "zapier", name: "Zapier", logoSrc: "/assets/integrations/zapier.svg", description: "Connect Echly to thousands of apps with Zapier.", pro: true },
];

function IntegrationsTab({ onNavigateToBilling }: { onNavigateToBilling: () => void }) {
  return (
    <div className={CARD_GAP}>
      <SectionHeader
        title="Integrations"
        description="Connect Echly with your existing tools."
      />
      <div className="grid gap-8 sm:grid-cols-2">
        {INTEGRATIONS.map(({ id, name, logoSrc, description, pro }) => (
          <Card
            key={id}
            className={`${SETTINGS_CARD} flex flex-col transition-all duration-200 ease-out`}
            as="article"
          >
            <div className="integration-header">
              <img
                className="integration-logo"
                src={logoSrc}
                alt={`${name} logo`}
                width={28}
                height={28}
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-[18px] font-semibold text-neutral-900">{name}</h3>
                  {pro && <UpgradePlanBadge onClick={onNavigateToBilling} title={UPGRADE_TOOLTIP} />}
                </div>
                <p className={`mt-1 ${SETTING_DESC}`}>{description}</p>
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="primary"
                    className={BTN_PRIMARY}
                    onClick={pro ? onNavigateToBilling : undefined}
                  >
                    Connect
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ——— Billing tab: full SaaS pricing ——— */
const BILLING_CONTAINER = "w-full";
const BRAND_ACCENT = "#9FE870";

const PLANS = [
  {
    id: "free",
    title: "Free",
    monthlyPrice: 0,
    features: [
      "3 feedback sessions",
      "Basic collaboration",
      "Manual action steps",
      "Limited AI summaries",
    ],
    cta: "Start Free",
    highlight: false,
    badge: null,
  },
  {
    id: "starter",
    title: "Starter",
    monthlyPrice: 12,
    features: [
      "20 feedback sessions",
      "AI action steps",
      "Team collaboration",
      "Basic integrations",
    ],
    cta: "Upgrade",
    highlight: false,
    badge: null,
  },
  {
    id: "business",
    title: "Business",
    monthlyPrice: 29,
    features: [
      "Unlimited feedback sessions",
      "Advanced AI insights",
      "Full integrations",
      "Team workspace",
      "Priority support",
    ],
    cta: "Upgrade to Business",
    highlight: true,
    badge: "Most Popular",
  },
  {
    id: "enterprise",
    title: "Enterprise",
    monthlyPrice: null,
    features: [
      "Unlimited everything",
      "SSO",
      "Audit logs",
      "Advanced security",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    highlight: false,
    badge: null,
  },
] as const;

const COMPARISON_SECTIONS: { section: string; rows: { feature: string; free: boolean | string; starter: boolean | string; business: boolean | string; enterprise: boolean | string }[] }[] = [
  {
    section: "FEEDBACK CAPTURE",
    rows: [
      { feature: "Feedback sessions", free: "3", starter: "20", business: "Unlimited", enterprise: "Unlimited" },
      { feature: "Feedback widget", free: true, starter: true, business: true, enterprise: true },
      { feature: "Session management", free: true, starter: true, business: true, enterprise: true },
    ],
  },
  {
    section: "AI ASSISTANCE",
    rows: [
      { feature: "AI summaries", free: "Limited", starter: true, business: true, enterprise: true },
      { feature: "AI action steps", free: false, starter: true, business: true, enterprise: true },
      { feature: "Advanced AI insights", free: false, starter: false, business: true, enterprise: true },
    ],
  },
  {
    section: "COLLABORATION",
    rows: [
      { feature: "Basic collaboration", free: true, starter: true, business: true, enterprise: true },
      { feature: "Team collaboration", free: false, starter: true, business: true, enterprise: true },
      { feature: "Team workspace", free: false, starter: false, business: true, enterprise: true },
    ],
  },
  {
    section: "INTEGRATIONS",
    rows: [
      { feature: "Basic integrations", free: false, starter: true, business: true, enterprise: true },
      { feature: "Full integrations", free: false, starter: false, business: true, enterprise: true },
      { feature: "Custom integrations", free: false, starter: false, business: false, enterprise: true },
    ],
  },
  {
    section: "SECURITY",
    rows: [
      { feature: "SSO", free: false, starter: false, business: false, enterprise: true },
      { feature: "Audit logs", free: false, starter: false, business: false, enterprise: true },
      { feature: "Advanced security", free: false, starter: false, business: false, enterprise: true },
    ],
  },
];

const FAQ_ITEMS: { q: string; a: string }[] = [
  { q: "Can I cancel anytime?", a: "Yes. You can upgrade or cancel your plan at any time." },
  { q: "What counts as a feedback session?", a: "A feedback session is created whenever someone submits feedback using the widget." },
  { q: "Do you offer agency discounts?", a: "Yes. Contact sales for agency pricing." },
];

function CheckMarkIcon() {
  return (
    <span
      className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full"
      style={{ backgroundColor: BRAND_ACCENT }}
      aria-hidden
    >
      <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
    </span>
  );
}

function BillingTab() {
  const [billingPeriod, setBillingPeriod] = useState<"annual" | "monthly">("monthly");
  const [teamSize, setTeamSize] = useState("1");
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);

  const teamSizeNumber = useMemo(() => {
    const n = Number.parseInt(teamSize, 10);
    if (!Number.isFinite(n) || n <= 0) return 1;
    return n;
  }, [teamSize]);

  const annualDiscount = 0.2;

  const displayPlans = useMemo(() => {
    return PLANS.map((plan) => {
      if (plan.monthlyPrice === null) {
        return {
          ...plan,
          priceAmount: "Custom",
          priceSuffix: "",
          priceSubLabel: null as string | null,
        };
      }

      const baseMonthly = plan.monthlyPrice * teamSizeNumber;

      if (billingPeriod === "monthly") {
        return {
          ...plan,
          priceAmount: `$${baseMonthly.toFixed(0)}`,
          priceSuffix: "/ month",
          priceSubLabel: null as string | null,
        };
      }

      // Annual: show discounted effective monthly, billed annually.
      const effectiveMonthly = baseMonthly * (1 - annualDiscount);
      const monthlyDisplay =
        Math.round(effectiveMonthly * 100) % 100 === 0
          ? effectiveMonthly.toFixed(0)
          : effectiveMonthly.toFixed(2);

      return {
        ...plan,
        priceAmount: `$${monthlyDisplay}`,
        priceSuffix: "/ month",
        priceSubLabel: "billed annually",
      };
    });
  }, [billingPeriod, teamSizeNumber]);

  return (
    <div className={`flex flex-col ${BILLING_CONTAINER} pb-20`}>
      {/* Hero */}
      <header className="billing-container text-center" style={{ marginBottom: 32 }}>
        <h2
          className="text-[44px] font-extrabold leading-[1.1] tracking-[-0.02em] text-neutral-900"
          style={{ marginBottom: 24 }}
        >
          Choose the plan that fits your feedback workflow
        </h2>
      </header>

      {/* Billing control bar */}
      <div className="billing-container flex flex-wrap items-center justify-center gap-8" style={{ marginBottom: 32 }}>
        <div className="flex items-center gap-2">
          <label htmlFor="team-size" className="text-[15px] font-medium text-neutral-700">
            Team size:
          </label>
          <input
            id="team-size"
            type="text"
            value={teamSize}
            onChange={(e) => setTeamSize(e.target.value)}
            className="w-[60px] px-2.5 py-1.5 text-center rounded-[8px] border border-[rgba(0,0,0,0.08)] text-[15px] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[15px] font-medium text-neutral-700">Bill me:</span>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="billing"
                checked={billingPeriod === "monthly"}
                onChange={() => setBillingPeriod("monthly")}
                className="w-4 h-4 text-[#111111] focus:ring-gray-300"
              />
              <span className="text-[15px] font-medium text-neutral-900">Monthly</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="billing"
                checked={billingPeriod === "annual"}
                onChange={() => setBillingPeriod("annual")}
                className="w-4 h-4 text-[#111111] focus:ring-gray-300"
              />
              <span className="text-[15px] font-medium text-neutral-900">Annually</span>
              <span
                className="rounded-full px-2.5 py-1 text-xs font-medium text-[#111111]"
                style={{ backgroundColor: "#E0E7FF" }}
              >
                Save up to 20%
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Pricing cards — equal width, 24px gap */}
      <div className="billing-container">
        <section className="billing-pricing-grid mb-[72px] items-stretch">
          {displayPlans.map((plan) => (
            <div
              key={plan.id}
              className={`billing-card ${plan.highlight ? "billing-card--business" : ""}`}
            >
              <div className="relative">
                {plan.badge && (
                  <span className="absolute -top-1 -right-0 rounded-full bg-[#E8F0FF] px-[10px] py-1 text-xs font-semibold text-neutral-900">
                    {plan.badge}
                  </span>
                )}
                <h3 className="plan-title text-neutral-900">{plan.title}</h3>
              </div>
              <div className="mt-4">
                <p className="price text-neutral-900">
                  {plan.priceAmount}
                  {plan.priceSuffix && <span className="price-suffix">{plan.priceSuffix}</span>}
                </p>
                {plan.priceSubLabel && (
                  <p className="mt-1 text-[14px] font-medium text-neutral-600">{plan.priceSubLabel}</p>
                )}
              </div>
              <ul className="plan-features flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="plan-feature">
                    <span className="feature-icon mt-[2px]" aria-hidden>
                      <CheckMarkIcon />
                    </span>
                    <span className="plan-feature-text text-neutral-700">{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Button
                  variant={plan.highlight ? "primary" : "secondary"}
                  className={
                    plan.highlight
                      ? "primary-cta w-full rounded-[10px] px-4 py-2.5 text-sm border border-transparent"
                      : "secondary-cta w-full text-sm"
                  }
                >
                  {plan.cta}
                </Button>
              </div>
            </div>
          ))}
        </section>

        {/* Feature comparison table */}
        <section className="mb-[72px] overflow-x-auto">
          <div className="rounded-[18px] border overflow-hidden min-w-[640px]" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-neutral-50/80" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
                  <th className="py-3 px-4 text-[15px] font-semibold text-neutral-900">Feature</th>
                  <th className="py-3 px-4 text-[15px] font-semibold text-neutral-900">Free</th>
                  <th className="py-3 px-4 text-[15px] font-semibold text-neutral-900">Starter</th>
                  <th className="py-3 px-4 text-[15px] font-semibold text-neutral-900">Business</th>
                  <th className="py-3 px-4 text-[15px] font-semibold text-neutral-900">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_SECTIONS.map(({ section, rows }) => (
                  <Fragment key={section}>
                    <tr className="bg-[#F8FAFC]">
                      <td colSpan={5} className="py-2.5 px-4 text-[13px] font-semibold tracking-[0.04em] text-neutral-700">
                        {section}
                      </td>
                    </tr>
                    {rows.map((row, rowIdx) => (
                      <tr
                        key={row.feature}
                        className={rowIdx % 2 === 1 ? "bg-[#FBFBFB]" : ""}
                        style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}
                      >
                        <td className="py-3 px-4 text-[15px] text-neutral-700">{row.feature}</td>
                        {(["free", "starter", "business", "enterprise"] as const).map((col) => {
                          const v = row[col];
                          return (
                            <td key={col} className="py-3 px-4 text-[15px] text-neutral-600 align-middle">
                              {v === true ? (
                                <span className="inline-flex items-center">
                                  <CheckMarkIcon />
                                </span>
                              ) : v === false ? (
                                <Minus className="w-5 h-5 text-neutral-300 inline" strokeWidth={2} aria-hidden />
                              ) : (
                                <span>{v}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ accordion */}
        <section>
          <h3 className="text-[44px] font-extrabold text-neutral-900 text-center mt-20 mb-12">
            Frequently Asked Questions
          </h3>
          <div>
            {FAQ_ITEMS.map(({ q, a }, index) => {
              const isOpen = faqOpenIndex === index;
              return (
                <div
                  key={q}
                  className="bg-[#F5F9FF] rounded-[16px] p-5 mb-4"
                >
                  <button
                    type="button"
                    onClick={() => setFaqOpenIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between gap-4 text-left text-[18px] font-semibold text-neutral-900"
                    aria-expanded={isOpen}
                  >
                    <span>{q}</span>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 text-neutral-700 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      aria-hidden
                    />
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-200 ease"
                    style={{
                      maxHeight: isOpen ? 300 : 0,
                      opacity: isOpen ? 1 : 0,
                      marginTop: isOpen ? 12 : 0,
                    }}
                  >
                    <p className="text-[16px] text-[#4B5563]" style={{ lineHeight: 1.6 }}>
                      {a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
