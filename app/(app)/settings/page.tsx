"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState, Fragment } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Monitor,
  Laptop,
  ChevronDown,
  ChevronUp,
  Gem,
  Check,
  Minus,
  UserPlus,
  Trash2,
  X,
  Mail,
  Clock,
  RotateCcw,
  AlertCircle,
  Users,
} from "lucide-react";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { usePlanCatalog } from "@/lib/hooks/usePlanCatalog";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";
import { Modal } from "@/components/ui/Modal";
import { UserAvatar } from "@/components/ui/UserAvatar";
import type { Workspace } from "@/lib/domain/workspace";
import {
  assertIdentityResolved,
  useWorkspace,
} from "@/lib/client/workspaceContext";
import { BillingUsageProvider, useBillingUsageContext } from "@/lib/billing/BillingUsageProvider";
import {
  listenToWorkspace,
  updateWorkspaceAppearance,
  updateWorkspaceName,
  updateWorkspaceNotifications,
  updateWorkspaceSettings,
} from "@/lib/repositories/workspacesRepository";
import { MinimalLoader } from "@/components/ui/MinimalLoader";
import { authFetch } from "@/lib/authFetch";

/* Premium workspace settings: wide layout, strong hierarchy */
const SETTINGS_CARD =
  "rounded-[12px] border border-[var(--border-default)] bg-white p-[28px] transition-[border-color,box-shadow] duration-200 ease-out hover:border-neutral-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]";
const CARD_GAP = "space-y-8"; /* 32px between section cards */
const ROW_GAP = "space-y-5"; /* 20px between setting rows */
const SECTION_TITLE = "text-[22px] font-semibold text-neutral-900"; /* H2: +2px, 600 */
const SECTION_SUBTITLE = "text-[16px] font-semibold text-neutral-900"; /* H3 setting labels: 600 for hierarchy */
const SECTION_DESC = "text-[14px] text-neutral-600 mt-1"; /* body, darker grey */
const SETTING_DESC = "text-[14px] text-neutral-600 mt-0.5";
const BTN_PRIMARY = "rounded-[8px] px-4 py-2.5 text-sm font-semibold bg-[#155DFC] text-white hover:brightness-110 hover:shadow-[0_2px_8px_rgba(21,93,252,0.35)] transition-all duration-200";
const BTN_SECONDARY = "rounded-[8px] px-4 py-2.5 text-sm font-semibold bg-neutral-100 border border-neutral-300 text-neutral-900 hover:bg-neutral-200 hover:shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-all duration-200";

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
  { id: "members", label: "Members" },
  { id: "security", label: "Security" },
  { id: "integrations", label: "Integrations" },
  { id: "billing", label: "Billing" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function SettingsPageInner() {
  const { user, loading: authLoading } = useAuthGuard();
  const {
    workspaceId,
    workspaceError,
    workspaceLoading,
    isIdentityResolved,
    isIdentityReady,
  } = useWorkspace();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [workspace, setWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && TABS.some((t) => t.id === tab)) {
      setActiveTab(tab as TabId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isIdentityReady || !workspaceId) {
      setWorkspace(null);
      return;
    }
    const unsub = listenToWorkspace(workspaceId, setWorkspace, isIdentityReady);
    return () => unsub();
  }, [workspaceId, isIdentityReady]);

  const loadingWorkspace = Boolean(
    user &&
      (workspaceLoading ||
        !workspaceId ||
        !isIdentityResolved ||
        (workspace === null && Boolean(workspaceId) && isIdentityResolved))
  );
  const sectionLoading = authLoading || loadingWorkspace;

  if (
    user &&
    (workspaceError ||
      (!workspaceLoading &&
        !loadingWorkspace &&
        isIdentityResolved &&
        (!workspaceId || workspaceId.trim() === "")))
  ) {
    return (
      <div className="flex flex-1 min-h-0 bg-white overflow-auto">
        <div className="flex flex-1 flex-col items-center justify-center px-12 py-16 max-w-lg mx-auto text-center">
          <p className="text-lg font-medium text-neutral-900">Workspace unavailable</p>
          <p className="mt-2 text-sm text-neutral-600">
            {workspaceError ||
              "Workspace not found. Try refreshing the page or sign in again."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-0 bg-white overflow-auto">
      <div className="flex-1 min-w-0 max-w-[1280px] mx-auto px-12 py-10 w-full">
        {/* Page header — H1 */}
        <header className="mb-8">
          <h1 className="text-[28px] font-semibold tracking-tight text-neutral-900">
            Settings
          </h1>
          <p className="mt-1.5 text-[15px] text-neutral-600">
            Manage your workspace, notifications, and preferences.
          </p>
        </header>

        {/* Tab navigation */}
        <nav
          className="flex items-center gap-10 border-b border-[var(--border-default)] mb-8"
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
                  relative pb-3 text-sm transition-colors duration-200
                  ${isActive ? "text-[#155DFC] font-bold" : "font-medium text-[var(--text-meta)] hover:text-neutral-700"}
                `}
                aria-current={isActive ? "true" : undefined}
              >
                {label}
                {isActive && (
                  <span
                    className="absolute left-0 right-0 bottom-0 h-[3px] bg-[#155DFC] rounded-full"
                    aria-hidden
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Tab content */}
        {activeTab === "members" && (
          <MembersTab workspaceId={workspaceId} loading={sectionLoading} />
        )}
        <BillingUsageProvider>
          {activeTab === "general" && (
            <GeneralTab
              workspace={workspace}
              workspaceId={workspaceId}
              loading={sectionLoading}
              onNavigateToBilling={() => setActiveTab("billing")}
            />
          )}
          {activeTab === "security" && <SecurityTab />}
          {activeTab === "integrations" && (
            <IntegrationsTab onNavigateToBilling={() => setActiveTab("billing")} />
          )}
          {activeTab === "billing" && <BillingTab />}
        </BillingUsageProvider>
      </div>
    </div>
  );
}

function SettingsSuspenseFallback() {
  return (
    <div className="flex flex-1 min-h-0 bg-white overflow-auto" aria-busy="true" aria-live="polite">
      <div className="flex flex-1 min-h-[520px] min-w-0 max-w-[1280px] mx-auto w-full items-center justify-center px-12 py-10">
        <MinimalLoader label="Loading settings…" />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsSuspenseFallback />}>
      <SettingsPageInner />
    </Suspense>
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
  if (loading) {
    return (
      <div
        className="flex min-h-[920px] items-center justify-center pb-16"
        aria-busy="true"
        aria-live="polite"
      >
        <MinimalLoader label="Loading settings…" />
      </div>
    );
  }

  return (
    <div className={`${CARD_GAP} pb-16 ech-content-enter`}>
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
  const { isIdentityResolved } = useWorkspace();
  const [nameDraft, setNameDraft] = useState("");
  const lastWorkspaceIdRef = useRef<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoToast, setLogoToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLogoUrl(workspace?.logoUrl ?? null);
  }, [workspace?.logoUrl]);

  useEffect(() => {
    if (workspaceId !== lastWorkspaceIdRef.current) {
      lastWorkspaceIdRef.current = workspaceId;
      setNameDraft(workspace?.name ?? "");
    } else if (workspace && nameDraft === "") {
      setNameDraft(workspace.name ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, workspace?.name]);

  function showToast(msg: string) {
    setLogoToast(msg);
    setTimeout(() => setLogoToast(null), 3000);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      showToast("Please use JPEG, PNG, or WebP");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast("Image must be under 2MB");
      return;
    }

    const preview = URL.createObjectURL(file);
    setLogoPreview(preview);
    setUploadingLogo(true);

    try {
      const fd = new FormData();
      fd.append("logo", file);
      const res = await authFetch("/api/workspace/logo", { method: "POST", body: fd });
      if (!res) { showToast("Upload failed. Try again."); return; }
      const json = await res.json() as { success: boolean; data?: { logoUrl: string }; error?: { message: string } };
      if (!res.ok || !json.success) {
        const msg = json.error?.message;
        if (msg === "FILE_TOO_LARGE") showToast("Image must be under 2MB");
        else if (msg === "INVALID_FILE_TYPE") showToast("Please use JPEG, PNG, or WebP");
        else showToast("Upload failed. Try again.");
        return;
      }
      setLogoUrl(json.data?.logoUrl ?? null);
      setLogoPreview(null);
      showToast("Logo updated");
    } catch {
      showToast("Upload failed. Try again.");
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleRemoveLogo() {
    setUploadingLogo(true);
    try {
      const res = await authFetch("/api/workspace/logo", { method: "DELETE" });
      if (!res?.ok) { showToast("Failed to remove logo."); return; }
      setLogoUrl(null);
      setLogoPreview(null);
      showToast("Logo removed");
    } catch {
      showToast("Failed to remove logo.");
    } finally {
      setUploadingLogo(false);
    }
  }

  const displayLogoUrl = logoPreview ?? logoUrl;
  const workspaceInitial = (workspace?.name ?? "W").trim().charAt(0).toUpperCase();

  return (
    <Card className={SETTINGS_CARD} as="article">
      <SectionHeader
        title="Workspace"
        description="Name and logo for this workspace."
      />
      {logoToast && (
        <div className="mt-3 px-3 py-2 rounded-lg bg-neutral-900 text-white text-sm font-medium w-fit">
          {logoToast}
        </div>
      )}
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
              assertIdentityResolved(isIdentityResolved);
              const wid = workspaceId?.trim();
              if (!wid) throw new Error("Workspace id missing");
              const next = nameDraft.trim() || "My Workspace";
              if (workspace?.name === next) return;
              updateWorkspaceName(wid, next).catch((e) =>
                console.error("Failed to update workspace name:", e)
              );
            }}
            className="max-w-[360px] w-full min-w-0 px-3 py-2.5 rounded-lg border border-[var(--border-default)] text-[15px] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20 focus:border-[#155DFC] transition-all duration-200 shrink-0"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-[var(--border-default)]">
          <div className="min-w-0">
            <h3 className={SECTION_SUBTITLE}>Workspace Logo</h3>
            <p className={SETTING_DESC}>Shown in the sidebar and on shared pages.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative w-12 h-12 rounded-lg bg-neutral-100 border border-[var(--border-default)] flex items-center justify-center text-neutral-500 text-xs shrink-0 overflow-hidden">
              {uploadingLogo && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
                  <span className="w-4 h-4 rounded-full border-2 border-[#155DFC] border-t-transparent animate-spin" aria-hidden />
                </div>
              )}
              {displayLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={displayLogoUrl} alt="Workspace logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-neutral-400">{workspaceInitial}</span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
              aria-label="Upload workspace logo"
            />
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className={BTN_SECONDARY}
                disabled={uploadingLogo || loading || !workspaceId}
                onClick={() => fileInputRef.current?.click()}
              >
                {displayLogoUrl ? "Change" : "Upload logo"}
              </Button>
              {displayLogoUrl && (
                <Button
                  variant="secondary"
                  className={`${BTN_SECONDARY} text-red-600 border-red-200 hover:bg-red-50`}
                  disabled={uploadingLogo || loading || !workspaceId}
                  onClick={handleRemoveLogo}
                >
                  Remove
                </Button>
              )}
            </div>
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
  const { isIdentityResolved } = useWorkspace();
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
                assertIdentityResolved(isIdentityResolved);
                const wid = workspaceId?.trim();
                if (!wid) throw new Error("Workspace id missing");
                const next = {
                  ...(workspace?.notifications ?? { email: state }),
                  email: {
                    ...(workspace?.notifications?.email ?? state),
                    [key]: v,
                  },
                } as Workspace["notifications"];
                updateWorkspaceNotifications(wid, next).catch((e) =>
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
  const { isIdentityResolved } = useWorkspace();
  const { data: billingData } = useBillingUsageContext();
  const isPro = billingData != null && billingData.plan !== "free";
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
        className={`flex items-center justify-between gap-4 py-4 px-3 -mx-3 rounded-lg transition-colors duration-200 ${locked ? "cursor-pointer hover:bg-neutral-50" : ""}`}
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
          disabled={locked || loading || !workspaceId}
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
            assertIdentityResolved(isIdentityResolved);
            const wid = workspaceId?.trim();
            if (!wid) throw new Error("Workspace id missing");
            const next = {
              ...(workspace?.appearance ?? {
                logoOnFeedbackScreen: false,
                accentColor: null,
                removeEchlyBranding: false,
              }),
              logoOnFeedbackScreen: v,
            };
            updateWorkspaceAppearance(wid, next).catch((e) =>
              console.error("Failed to update appearance:", e)
            );
          }}
        />
        <AppearanceRow
          title="Custom Accent Color"
          preview="Match the feedback UI to your brand color."
          checked={accentColorEnabled}
          onChange={(v) => {
            assertIdentityResolved(isIdentityResolved);
            const wid = workspaceId?.trim();
            if (!wid) throw new Error("Workspace id missing");
            const next = {
              ...(workspace?.appearance ?? {
                logoOnFeedbackScreen: false,
                accentColor: null,
                removeEchlyBranding: false,
              }),
              accentColor: v ? (appearance?.accentColor ?? "#155DFC") : null,
            };
            updateWorkspaceAppearance(wid, next).catch((e) =>
              console.error("Failed to update appearance:", e)
            );
          }}
        />
        <AppearanceRow
          title="Remove Echly Branding"
          preview="Hide Echly logo and branding on shared feedback pages."
          checked={removeBranding}
          onChange={(v) => {
            assertIdentityResolved(isIdentityResolved);
            const wid = workspaceId?.trim();
            if (!wid) throw new Error("Workspace id missing");
            const next = {
              ...(workspace?.appearance ?? {
                logoOnFeedbackScreen: false,
                accentColor: null,
                removeEchlyBranding: false,
              }),
              removeEchlyBranding: v,
            };
            updateWorkspaceAppearance(wid, next).catch((e) =>
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
  const { isIdentityResolved } = useWorkspace();
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
        className="w-full flex items-center justify-between gap-3 text-left rounded-lg py-2 -my-2 px-2 -mx-2 hover:bg-neutral-50/80 transition-colors duration-200"
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
                  assertIdentityResolved(isIdentityResolved);
                  const wid = workspaceId?.trim();
                  if (!wid) throw new Error("Workspace id missing");
                  if (key === "autoCreateTicket") {
                    updateWorkspaceSettings(wid, {
                      automations: {
                        ...(workspace?.automations ?? { autoCreateTicketOnFeedback: false }),
                        autoCreateTicketOnFeedback: v,
                      },
                    }).catch((e) => console.error("Failed to update automations:", e));
                    return;
                  }
                  if (key === "guestComments") {
                    updateWorkspaceSettings(wid, {
                      permissions: {
                        ...(workspace?.permissions ?? { allowGuestComments: false }),
                        allowGuestComments: v,
                      },
                    }).catch((e) => console.error("Failed to update permissions:", e));
                    return;
                  }
                  if (key === "aiActionSteps") {
                    updateWorkspaceSettings(wid, {
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

/* ——— Members tab ——— */
type SerializedTs = { seconds: number; nanoseconds: number };

type SerializedMember = {
  uid: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: "OWNER" | "MEMBER";
  joinedAt: SerializedTs | null;
  invitedBy: string | null;
};

type SerializedInvitation = {
  id: string;
  workspaceId: string;
  email: string;
  role: "OWNER" | "MEMBER";
  status: "pending" | "accepted" | "revoked" | "expired";
  invitedBy: string;
  invitedByName: string;
  workspaceName: string;
  expiresAt: SerializedTs;
  createdAt: SerializedTs;
};

function formatTs(ts: SerializedTs): string {
  return new Date(ts.seconds * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatJoinedAt(ts: unknown): string {
  try {
    if (!ts) return "Recently";

    if (
      typeof ts === "object" &&
      ts !== null &&
      "seconds" in ts &&
      typeof (ts as { seconds: unknown }).seconds === "number"
    ) {
      const date = new Date((ts as { seconds: number }).seconds * 1000);
      if (isNaN(date.getTime())) return "Recently";
      return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(date);
    }

    if (typeof ts === "string") {
      const date = new Date(ts);
      if (isNaN(date.getTime())) return "Recently";
      return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(date);
    }

    if (typeof ts === "number") {
      const date = new Date(ts);
      if (isNaN(date.getTime())) return "Recently";
      return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(date);
    }

    return "Recently";
  } catch {
    return "Recently";
  }
}

function daysUntil(ts: SerializedTs): number {
  return Math.ceil((ts.seconds * 1000 - Date.now()) / (1000 * 60 * 60 * 24));
}

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
];

function nameToColorClass(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]!;
}

function MemberRow({
  member,
  isOwnerCaller,
  removing,
  onRemove,
}: {
  member: SerializedMember;
  isOwnerCaller: boolean;
  removing: boolean;
  onRemove: () => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const canRemove = isOwnerCaller && member.role !== "OWNER";
  const displayName = member.displayName ?? member.email;
  const colorClass = nameToColorClass(displayName);

  return (
    <>
      <div
        className="flex items-center gap-3 py-4 first:pt-0 last:pb-0 rounded-lg px-2 -mx-2 transition-colors duration-150"
        style={{ backgroundColor: hovered ? "var(--color-bg-subtle, #f9fafb)" : undefined }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {member.avatarUrl ? (
          <UserAvatar
            image={member.avatarUrl}
            name={displayName}
            className="h-9 w-9 shrink-0"
          />
        ) : (
          <span
            className={`h-9 w-9 shrink-0 flex items-center justify-center rounded-full text-white text-sm font-semibold select-none ${colorClass}`}
          >
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-medium text-neutral-900 truncate">{displayName}</p>
          <p className="text-[13px] text-neutral-500 truncate">
            {member.email}
            {member.joinedAt && (
              <span className="text-neutral-400"> · Joined {formatJoinedAt(member.joinedAt)}</span>
            )}
          </p>
        </div>
        <span
          className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
            member.role === "OWNER"
              ? "bg-violet-50 text-violet-700"
              : "bg-neutral-100 text-neutral-600"
          }`}
        >
          {member.role === "OWNER" ? "Owner" : "Member"}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={removing}
            title={`Remove ${displayName}`}
            className={`shrink-0 ml-1 p-1.5 rounded-md text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 ${
              hovered ? "opacity-100" : "opacity-0"
            }`}
            aria-label={`Remove ${displayName}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} role="alertdialog" ariaLabelledBy="remove-member-title">
        <div className="p-6 max-w-sm">
          <h3 id="remove-member-title" className="text-base font-semibold text-neutral-900">
            Remove {displayName}?
          </h3>
          <p className="mt-2 text-sm text-neutral-600">
            They will lose access to this workspace immediately.
          </p>
          <div className="mt-5 flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg text-neutral-700 hover:bg-neutral-100 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={removing}
              onClick={() => { setConfirmOpen(false); onRemove(); }}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60"
            >
              {removing ? "Removing…" : "Remove"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function InvitationRow({
  invitation,
  revoking,
  onRevoke,
  onResend,
  resending,
}: {
  invitation: SerializedInvitation;
  revoking: boolean;
  onRevoke: () => void;
  onResend: () => void;
  resending: boolean;
}) {
  const days = daysUntil(invitation.expiresAt);
  const expiryClass =
    days < 2
      ? "text-red-600"
      : days < 7
      ? "text-amber-600"
      : "text-neutral-400";
  const expiryLabel =
    days <= 0
      ? "Expires today"
      : days === 1
      ? "Expires in 1 day"
      : `Expires in ${days} days`;

  return (
    <div className="flex items-center gap-3 py-4 first:pt-0 last:pb-0">
      <span className="h-9 w-9 shrink-0 flex items-center justify-center rounded-full bg-neutral-100">
        <Mail className="h-4 w-4 text-neutral-500" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-medium text-neutral-900 truncate">{invitation.email}</p>
        <p className="text-[13px] text-neutral-500">
          Invited by {invitation.invitedByName}
          <span className={`ml-2 ${expiryClass}`}>{expiryLabel}</span>
        </p>
      </div>
      <span className="shrink-0 flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
        <Clock className="h-3 w-3" aria-hidden />
        Pending
      </span>
      <button
        type="button"
        onClick={onResend}
        disabled={resending || revoking}
        title="Resend invitation"
        className="shrink-0 p-1.5 rounded-md text-neutral-400 hover:text-blue-500 hover:bg-blue-50 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        aria-label={`Resend invitation for ${invitation.email}`}
      >
        <RotateCcw className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onRevoke}
        disabled={revoking || resending}
        title="Revoke invitation"
        className="shrink-0 p-1.5 rounded-md text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
        aria-label={`Revoke invitation for ${invitation.email}`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function InviteMemberModal({
  onClose,
  onInviteSent,
}: {
  onClose: () => void;
  onInviteSent: (inv: SerializedInvitation) => void;
}) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_RE.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await authFetch("/api/workspace/members/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, role: "MEMBER" }),
      });
      if (!res) { setError("Request failed. Try again."); return; }
      const json = await res.json() as { success: boolean; data?: { invitation: SerializedInvitation }; error?: { message: string } };
      if (!res.ok || !json.success) {
        const msg = json.error?.message;
        if (msg === "ALREADY_MEMBER") setError("This person is already a member.");
        else if (msg === "INVITE_ALREADY_SENT") setError("An invitation has already been sent to this email.");
        else setError("Failed to send invitation. Try again.");
        return;
      }
      if (json.data?.invitation) onInviteSent(json.data.invitation);
    } catch {
      setError("Failed to send invitation. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 cursor-pointer"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-modal-title"
    >
      <div
        className="rounded-2xl shadow-lg bg-white p-6 max-w-md w-full cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="invite-modal-title" className="text-[20px] font-semibold text-neutral-900">
          Invite a team member
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          They'll receive an email with a link to join your workspace.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label htmlFor="invite-email-settings" className="sr-only">Email address</label>
            <input
              id="invite-email-settings"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium rounded-xl text-neutral-700 hover:bg-neutral-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MemberSkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-4 animate-pulse">
      <div className="h-9 w-9 rounded-full bg-neutral-200 shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-3.5 bg-neutral-200 rounded w-32" />
        <div className="h-3 bg-neutral-100 rounded w-48" />
      </div>
      <div className="h-5 bg-neutral-100 rounded-full w-16 shrink-0" />
    </div>
  );
}

function MembersTab({
  workspaceId,
  loading,
}: {
  workspaceId: string | null;
  loading: boolean;
}) {
  const { isWorkspaceOwner } = useWorkspace();
  const [members, setMembers] = useState<SerializedMember[]>([]);
  const [invitations, setInvitations] = useState<SerializedInvitation[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersError, setMembersError] = useState(false);
  const [invitesLoading, setInvitesLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [removingUid, setRemovingUid] = useState<string | null>(null);
  const [revokingToken, setRevokingToken] = useState<string | null>(null);
  const [resendingToken, setResendingToken] = useState<string | null>(null);

  const fetchMembers = useCallback(() => {
    if (!workspaceId) return;
    setMembersLoading(true);
    setMembersError(false);
    authFetch("/api/workspace/members")
      .then(async (res) => {
        if (!res?.ok) { setMembersError(true); return; }
        const json = await res.json() as { success: boolean; data?: { members: SerializedMember[] } };
        if (json.success && json.data) setMembers(json.data.members);
        else setMembersError(true);
      })
      .catch(() => setMembersError(true))
      .finally(() => setMembersLoading(false));
  }, [workspaceId]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  useEffect(() => {
    if (!workspaceId || !isWorkspaceOwner) { setInvitesLoading(false); return; }
    setInvitesLoading(true);
    authFetch("/api/workspace/members/invitations")
      .then(async (res) => {
        if (!res?.ok) return;
        const json = await res.json() as { success: boolean; data?: { invitations: SerializedInvitation[] } };
        if (json.success && json.data) setInvitations(json.data.invitations);
      })
      .catch(console.error)
      .finally(() => setInvitesLoading(false));
  }, [workspaceId, isWorkspaceOwner]);

  async function handleRemoveMember(uid: string) {
    setRemovingUid(uid);
    try {
      const res = await authFetch(`/api/workspace/members/${uid}`, { method: "DELETE" });
      if (res?.ok) setMembers((prev) => prev.filter((m) => m.uid !== uid));
    } catch (err) {
      console.error("Failed to remove member:", err);
    } finally {
      setRemovingUid(null);
    }
  }

  async function handleRevokeInvitation(token: string) {
    setRevokingToken(token);
    try {
      const res = await authFetch(`/api/workspace/members/invitations/${token}`, { method: "DELETE" });
      if (res?.ok) setInvitations((prev) => prev.filter((i) => i.id !== token));
    } catch (err) {
      console.error("Failed to revoke invitation:", err);
    } finally {
      setRevokingToken(null);
    }
  }

  async function handleResendInvitation(token: string) {
    setResendingToken(token);
    try {
      await authFetch(`/api/workspace/members/invitations/${token}/resend`, { method: "POST" });
    } catch (err) {
      console.error("Failed to resend invitation:", err);
    } finally {
      setResendingToken(null);
    }
  }

  function handleInviteSent(inv: SerializedInvitation) {
    setInvitations((prev) => [inv, ...prev]);
    setInviteModalOpen(false);
  }

  if (loading || membersLoading) {
    return (
      <div className={`${CARD_GAP} pb-16`}>
        <Card className={SETTINGS_CARD} as="article">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
            <div className="h-6 bg-neutral-200 rounded w-32 animate-pulse" />
            <div className="h-9 bg-neutral-100 rounded-lg w-28 animate-pulse" />
          </div>
          <div className="pt-4 border-t border-[var(--border-default)] divide-y divide-[var(--border-default)]">
            {[0, 1, 2].map((i) => <MemberSkeletonRow key={i} />)}
          </div>
        </Card>
      </div>
    );
  }

  if (membersError) {
    return (
      <div className={`${CARD_GAP} pb-16`}>
        <Card className={SETTINGS_CARD} as="article">
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <AlertCircle className="h-8 w-8 text-neutral-400" />
            <p className="text-sm font-medium text-neutral-700">Couldn&apos;t load members</p>
            <button
              type="button"
              onClick={fetchMembers}
              className={BTN_SECONDARY}
            >
              Try again
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={`${CARD_GAP} pb-16 ech-content-enter`}>
      <Card className={SETTINGS_CARD} as="article">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <SectionHeader
            title="Team Members"
            description={`${members.length} member${members.length !== 1 ? "s" : ""} in this workspace.`}
          />
          {isWorkspaceOwner && (
            <button
              type="button"
              onClick={() => setInviteModalOpen(true)}
              className={`${BTN_PRIMARY} flex items-center gap-2 shrink-0`}
            >
              <UserPlus className="h-4 w-4" aria-hidden />
              Invite member
            </button>
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-[var(--border-default)] divide-y divide-[var(--border-default)]">
          {members.length === 0 ? (
            <div className="py-10 flex flex-col items-center gap-2 text-neutral-500">
              <Users className="h-8 w-8 text-neutral-300" />
              <p className="text-sm">No members found.</p>
            </div>
          ) : (
            members.map((member) => (
              <MemberRow
                key={member.uid}
                member={member}
                isOwnerCaller={isWorkspaceOwner}
                removing={removingUid === member.uid}
                onRemove={() => handleRemoveMember(member.uid)}
              />
            ))
          )}
        </div>
      </Card>

      {isWorkspaceOwner && invitations.length > 0 && (
        <Card className={SETTINGS_CARD} as="article">
          <SectionHeader
            title="Pending Invitations"
            description="Invitations waiting to be accepted."
          />
          <div className="mt-4 pt-4 border-t border-[var(--border-default)] divide-y divide-[var(--border-default)]">
            {invitesLoading ? (
              <div className="py-8 flex justify-center">
                <MinimalLoader label="Loading invitations…" />
              </div>
            ) : (
              invitations.map((inv) => (
                <InvitationRow
                  key={inv.id}
                  invitation={inv}
                  revoking={revokingToken === inv.id}
                  onRevoke={() => handleRevokeInvitation(inv.id)}
                  onResend={() => handleResendInvitation(inv.id)}
                  resending={resendingToken === inv.id}
                />
              ))
            )}
          </div>
        </Card>
      )}

      {inviteModalOpen && (
        <InviteMemberModal
          onClose={() => setInviteModalOpen(false)}
          onInviteSent={handleInviteSent}
        />
      )}
    </div>
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

function SecurityTab() {
  const router = useRouter();
  const { isWorkspaceOwner, workspaceName } = useWorkspace();
  const sessions = useMemo<SessionRow[]>(
    () => [
      { id: "1", device: "MacBook Pro", browser: "Chrome", location: "San Francisco, US", current: true, icon: Laptop },
      { id: "2", device: "Windows PC", browser: "Chrome", location: "New York, US", current: false, icon: Monitor },
    ],
    []
  );
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Transfer ownership state
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferMembers, setTransferMembers] = useState<SerializedMember[]>([]);
  const [transferMembersLoading, setTransferMembersLoading] = useState(false);
  const [selectedNewOwnerUid, setSelectedNewOwnerUid] = useState("");
  const [transferConfirmName, setTransferConfirmName] = useState("");
  const [transferSubmitting, setTransferSubmitting] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const transferConfirmInputRef = useRef<HTMLInputElement>(null);

  // Delete workspace state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deleteConfirmInputRef = useRef<HTMLInputElement>(null);

  function openTransferModal() {
    setTransferModalOpen(true);
    setSelectedNewOwnerUid("");
    setTransferConfirmName("");
    setTransferError(null);
    setTransferMembersLoading(true);
    authFetch("/api/workspace/members")
      .then(async (res) => {
        if (!res?.ok) return;
        const json = await res.json() as { success: boolean; data?: { members: SerializedMember[] } };
        if (json.success && json.data) {
          setTransferMembers(json.data.members.filter((m) => m.role !== "OWNER"));
        }
      })
      .catch(console.error)
      .finally(() => setTransferMembersLoading(false));
  }

  async function handleTransferSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedNewOwnerUid) { setTransferError("Select a member to transfer ownership to."); return; }
    if (transferConfirmName !== workspaceName) { setTransferError("Workspace name does not match."); return; }
    setTransferError(null);
    setTransferSubmitting(true);
    try {
      const res = await authFetch("/api/workspace/ownership", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newOwnerUid: selectedNewOwnerUid, confirmName: transferConfirmName }),
      });
      if (!res) { setTransferError("Request failed. Try again."); return; }
      const json = await res.json() as { success: boolean; error?: { message: string } };
      if (!res.ok || !json.success) {
        setTransferError(json.error?.message ?? "Transfer failed. Try again.");
        return;
      }
      setTransferModalOpen(false);
      setTransferSuccess(true);
      setTimeout(() => setTransferSuccess(false), 5000);
      router.refresh();
    } catch {
      setTransferError("Transfer failed. Try again.");
    } finally {
      setTransferSubmitting(false);
    }
  }

  async function handleDeleteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (deleteConfirmName !== workspaceName) { setDeleteError("Workspace name does not match."); return; }
    setDeleteError(null);
    setDeleteSubmitting(true);
    try {
      const res = await authFetch("/api/workspace", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmName: deleteConfirmName }),
      });
      if (!res) { setDeleteError("Request failed. Try again."); return; }
      const json = await res.json() as { success: boolean; error?: { message: string } };
      if (!res.ok || !json.success) {
        setDeleteError(json.error?.message ?? "Delete failed. Try again.");
        return;
      }
      // Sign out and redirect
      const { auth } = await import("@/lib/firebase");
      const { signOut } = await import("firebase/auth");
      await signOut(auth).catch(() => void 0);
      router.push("/login?deleted=true");
    } catch {
      setDeleteError("Delete failed. Try again.");
    } finally {
      setDeleteSubmitting(false);
    }
  }

  // Auto-focus confirm inputs when modals open
  useEffect(() => {
    if (transferModalOpen) setTimeout(() => transferConfirmInputRef.current?.focus(), 50);
  }, [transferModalOpen]);

  useEffect(() => {
    if (deleteModalOpen) setTimeout(() => deleteConfirmInputRef.current?.focus(), 50);
  }, [deleteModalOpen]);

  return (
    <div className={CARD_GAP}>
      {transferSuccess && (
        <div className="rounded-xl px-4 py-3 bg-blue-50 border border-blue-200 text-sm font-medium text-blue-800">
          You are now a member of this workspace.
        </div>
      )}
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
          <Button variant="ghost" className="text-sm font-semibold text-[#155DFC] hover:underline shrink-0 rounded-lg px-4 py-2.5">
            Log out of all other sessions
          </Button>
        </div>
        <div className="mt-4 pt-4 border-t border-[var(--border-default)] space-y-2">
          {sessions.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                className="flex items-center gap-3 py-3 px-3 rounded-lg border border-transparent hover:bg-neutral-50/80 hover:border-[var(--border-default)] transition-all duration-200"
              >
                <Icon className="w-5 h-5 text-neutral-400 shrink-0" strokeWidth={1.8} />
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-neutral-900">{s.device}</p>
                  <p className={SETTING_DESC}>{s.browser} · {s.location}</p>
                </div>
                {s.current && (
                  <span className="text-xs font-semibold text-[#155DFC] shrink-0">Current</span>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Collapsible Danger Zone */}
      <Card className={`${SETTINGS_CARD} border-red-100`} as="article" style={{ background: "rgba(254,242,242,0.35)" }}>
        <button
          type="button"
          onClick={() => setAdvancedOpen(!advancedOpen)}
          className="w-full flex items-center justify-between gap-3 text-left rounded-lg py-2 -my-2 px-2 -mx-2 hover:bg-neutral-50/80 transition-colors duration-200"
          aria-expanded={advancedOpen}
        >
          <span className={SECTION_TITLE}>Danger Zone</span>
          <span className="text-neutral-500 shrink-0" aria-hidden>
            {advancedOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </span>
        </button>
        <div
          className="overflow-hidden transition-[max-height] duration-300 ease-out"
          style={{ maxHeight: advancedOpen ? 500 : 0 }}
        >
          <div className="mt-4 pt-4 border-t border-[var(--border-default)] space-y-5">
            {isWorkspaceOwner && (
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-[15px] font-medium text-neutral-900">Transfer Workspace Ownership</p>
                  <p className={SETTING_DESC}>Assign another member as the workspace owner.</p>
                </div>
                <button
                  type="button"
                  onClick={openTransferModal}
                  className="rounded-[8px] px-4 py-2.5 text-sm font-semibold shrink-0 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-all duration-200"
                >
                  Transfer
                </button>
              </div>
            )}
            {isWorkspaceOwner && (
              <div className="flex items-center justify-between gap-4 flex-wrap pt-5 border-t border-[var(--border-default)]">
                <div>
                  <p className="text-[15px] font-semibold text-neutral-900">Delete Workspace</p>
                  <p className={SETTING_DESC}>Permanently delete this workspace and all its data. This cannot be undone.</p>
                </div>
                <button
                  type="button"
                  className="rounded-[8px] px-4 py-2.5 text-sm font-semibold shrink-0 bg-red-600 text-white hover:bg-red-700 hover:shadow-[0_2px_8px_rgba(220,38,38,0.35)] transition-all duration-200"
                  onClick={() => { setDeleteConfirmName(""); setDeleteError(null); setDeleteModalOpen(true); }}
                >
                  Delete Workspace
                </button>
              </div>
            )}
            {!isWorkspaceOwner && (
              <p className="text-sm text-neutral-500 py-2">Only the workspace owner can perform these actions.</p>
            )}
          </div>
        </div>
      </Card>

      {/* Transfer ownership modal */}
      {transferModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 cursor-pointer"
          onClick={() => setTransferModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="transfer-modal-title"
        >
          <div
            className="rounded-2xl shadow-lg bg-white p-6 max-w-md w-full cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="transfer-modal-title" className="text-[20px] font-semibold text-neutral-900">
              Transfer Ownership
            </h3>
            <p className="mt-1 text-sm text-neutral-600">
              You will become a regular member after this action.
            </p>
            <form onSubmit={handleTransferSubmit} className="mt-4 space-y-4">
              <div>
                <label htmlFor="transfer-new-owner" className="block text-sm font-medium text-neutral-700 mb-1">
                  Transfer to
                </label>
                {transferMembersLoading ? (
                  <p className="text-sm text-neutral-500">Loading members…</p>
                ) : transferMembers.length === 0 ? (
                  <p className="text-sm text-neutral-500">No other members to transfer to. Invite a member first.</p>
                ) : (
                  <select
                    id="transfer-new-owner"
                    value={selectedNewOwnerUid}
                    onChange={(e) => setSelectedNewOwnerUid(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a member…</option>
                    {transferMembers.map((m) => (
                      <option key={m.uid} value={m.uid}>
                        {m.displayName ? `${m.displayName} (${m.email})` : m.email}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label htmlFor="transfer-confirm-name" className="block text-sm font-medium text-neutral-700 mb-1">
                  Type <strong>{workspaceName}</strong> to confirm
                </label>
                <input
                  ref={transferConfirmInputRef}
                  id="transfer-confirm-name"
                  type="text"
                  placeholder={workspaceName ?? ""}
                  value={transferConfirmName}
                  onChange={(e) => setTransferConfirmName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {transferError && <p className="mt-1.5 text-sm text-red-600">{transferError}</p>}
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setTransferModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium rounded-xl text-neutral-700 hover:bg-neutral-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transferSubmitting || transferMembers.length === 0}
                  className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60"
                >
                  {transferSubmitting ? "Transferring…" : "Transfer Ownership"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete workspace modal */}
      {deleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 cursor-pointer"
          onClick={() => setDeleteModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-workspace-title"
        >
          <div
            className="rounded-2xl shadow-lg bg-white p-6 max-w-md w-full cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="delete-workspace-title" className="text-[20px] font-semibold text-neutral-900">
              Delete workspace?
            </h3>
            <p className="mt-2 text-sm text-neutral-600">
              This will schedule permanent deletion in 30 days. All sessions, feedback, and members will be removed.
            </p>
            <form onSubmit={handleDeleteSubmit} className="mt-4 space-y-3">
              <div>
                <label htmlFor="delete-confirm-name" className="block text-sm font-medium text-neutral-700 mb-1">
                  Type <strong>{workspaceName}</strong> to confirm
                </label>
                <input
                  ref={deleteConfirmInputRef}
                  id="delete-confirm-name"
                  type="text"
                  placeholder={workspaceName ?? ""}
                  value={deleteConfirmName}
                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                {deleteError && <p className="mt-1.5 text-sm text-red-600">{deleteError}</p>}
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium rounded-xl text-neutral-700 hover:bg-neutral-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteSubmitting || deleteConfirmName !== workspaceName}
                  className={`px-4 py-2.5 text-sm font-semibold rounded-xl transition disabled:cursor-not-allowed ${
                    deleteConfirmName === workspaceName
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-neutral-200 text-neutral-400 disabled:opacity-100"
                  }`}
                >
                  {deleteSubmitting ? "Deleting…" : "Schedule Deletion"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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

/* ——— Billing tab: full SaaS pricing, backed by /api/plans/catalog ——— */
const BILLING_CONTAINER = "w-full";
const BRAND_BLUE = "#155DFC";

type CatalogPlan = {
  id: "free" | "starter" | "business" | "enterprise";
  name: string;
  priceMonthly: number;
  priceYearly: number;
  maxSessions: number | null;
  maxMembers: number | null;
  insightsEnabled: boolean;
};

type DisplayPlan = {
  id: CatalogPlan["id"];
  title: string;
  monthlyPrice: number | null;
  features: string[];
  cta: string;
  highlight: boolean;
  badge: string | null;
};

const PLAN_DISPLAY_META: Record<CatalogPlan["id"], Omit<DisplayPlan, "id" | "monthlyPrice">> = {
  free: {
    title: "Free",
    features: [
      "Basic collaboration",
      "Manual action steps",
      "Limited AI summaries",
    ],
    cta: "Start Free",
    highlight: false,
    badge: null,
  },
  starter: {
    title: "Starter",
    features: [
      "AI action steps",
      "Team collaboration",
      "Basic integrations",
    ],
    cta: "Upgrade",
    highlight: false,
    badge: null,
  },
  business: {
    title: "Business",
    features: [
      "Advanced AI insights",
      "Full integrations",
      "Team workspace",
      "Priority support",
    ],
    cta: "Upgrade to Business",
    highlight: true,
    badge: "Most Popular",
  },
  enterprise: {
    title: "Enterprise",
    features: [
      "SSO",
      "Audit logs",
      "Advanced security",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    highlight: false,
    badge: null,
  },
};

const COMPARISON_SECTIONS: {
  section: string;
  rows: {
    feature: string;
    free: boolean | string;
    starter: boolean | string;
    business: boolean | string;
    enterprise: boolean | string;
  }[];
}[] = [
  {
    section: "FEEDBACK CAPTURE",
    rows: [
      { feature: "Feedback sessions", free: "", starter: "", business: "", enterprise: "" },
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
      style={{ backgroundColor: BRAND_BLUE }}
      aria-hidden
    >
      <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
    </span>
  );
}

function BillingTab() {
  const router = useRouter();
  const [billingPeriod, setBillingPeriod] = useState<"annual" | "monthly">("monthly");
  const [teamSize, setTeamSize] = useState("1");
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);
  const { plans, loading } = usePlanCatalog();

  const teamSizeNumber = useMemo(() => {
    const n = Number.parseInt(teamSize, 10);
    if (!Number.isFinite(n) || n <= 0) return 1;
    return n;
  }, [teamSize]);

  const displayPlans = useMemo(() => {
    if (!plans || plans.length === 0) return [];
    const byId = plans.reduce<Record<CatalogPlan["id"], CatalogPlan>>((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {} as Record<CatalogPlan["id"], CatalogPlan>);
    const result: (DisplayPlan & {
      priceAmount: string;
      priceSuffix: string;
      priceSubLabel: string | null;
    })[] = [];
    for (const plan of plans) {
      const meta = PLAN_DISPLAY_META[plan.id];
      const isEnterprise = plan.id === "enterprise";
      const monthlyPrice = isEnterprise ? null : plan.priceMonthly;
      const yearlyPrice = isEnterprise ? null : plan.priceYearly;

      const limitFeatures: string[] = [];
      const sessionsLabel =
        plan.maxSessions == null
          ? "Unlimited feedback sessions"
          : `${plan.maxSessions} feedback sessions`;
      limitFeatures.push(sessionsLabel);

      const features = [...limitFeatures, ...meta.features];

      if (monthlyPrice == null) {
        result.push({
          id: plan.id,
          title: plan.name || meta.title,
          monthlyPrice: null,
          features,
          cta: meta.cta,
          highlight: meta.highlight,
          badge: meta.badge,
          priceAmount: "Custom",
          priceSuffix: "",
          priceSubLabel: null,
        });
        continue;
      }

      const isAnnual = billingPeriod === "annual";
      // Annual pricing from Firestore only: use plan.priceYearly. No derivation from monthly.
      const amount =
        isAnnual && yearlyPrice != null
          ? plan.priceYearly * teamSizeNumber
          : plan.priceMonthly * teamSizeNumber;
      const suffix = isAnnual && yearlyPrice != null ? "/ year" : "/ month";
      const subLabel = isAnnual && yearlyPrice != null ? "Billed annually" : null;

      result.push({
        id: plan.id,
        title: plan.name || meta.title,
        monthlyPrice: plan.priceMonthly,
        features,
        cta: meta.cta,
        highlight: meta.highlight,
        badge: meta.badge,
        priceAmount: `$${amount.toFixed(0)}`,
        priceSuffix: suffix,
        priceSubLabel: subLabel,
      });
    }
    return result;
  }, [plans, teamSizeNumber, billingPeriod]);

  if (loading) {
    return (
      <div
        className={`flex min-h-[640px] flex-col items-center justify-center ${BILLING_CONTAINER} pb-20`}
        aria-busy="true"
        aria-live="polite"
      >
        <MinimalLoader label="Loading billing…" />
      </div>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <div className={`flex flex-col ${BILLING_CONTAINER} pb-20`}>
        <p className="text-center text-neutral-600">Unable to load plans. Please try again later.</p>
      </div>
    );
  }

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
            className="w-[60px] px-2.5 py-1.5 text-center rounded-[8px] border border-[rgba(0,0,0,0.08)] text-[15px] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20"
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
                className="w-4 h-4 text-[#155DFC] focus:ring-[#155DFC]"
              />
              <span className="text-[15px] font-medium text-neutral-900">Monthly</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="billing"
                checked={billingPeriod === "annual"}
                onChange={() => setBillingPeriod("annual")}
                className="w-4 h-4 text-[#155DFC] focus:ring-[#155DFC]"
              />
              <span className="text-[15px] font-medium text-neutral-900">Annually</span>
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
                      ? "w-full rounded-[10px] px-4 py-2.5 text-sm font-semibold bg-[#155DFC] text-white hover:brightness-110 border border-transparent"
                      : "secondary-cta w-full text-sm"
                  }
                  onClick={() => {
                    const cycle = billingPeriod === "annual" ? "annual" : "monthly";
                    if (plan.id === "enterprise") {
                      router.push(`/settings?tab=billing&plan=enterprise&cycle=${cycle}`);
                      return;
                    }
                    router.push(`/settings?tab=billing&plan=${plan.id}&cycle=${cycle}`);
                  }}
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
                        <td className="py-3 px-4 text-[15px] text-neutral-700">
                          {row.feature}
                        </td>
                        {(["free", "starter", "business", "enterprise"] as const).map(
                          (col) => {
                            let v = row[col];
                            const plan = plans?.find((p) => p.id === col) ?? null;

                            if (row.feature === "Feedback sessions" && plan) {
                              v =
                                plan.maxSessions == null
                                  ? "Unlimited"
                                  : String(plan.maxSessions);
                            }

                            if (row.feature === "Advanced AI insights" && plan) {
                              v = !!plan.insightsEnabled;
                            }

                            return (
                              <td
                                key={col}
                                className="py-3 px-4 text-[15px] text-neutral-600 align-middle"
                              >
                                {v === true ? (
                                  <span className="inline-flex items-center">
                                    <CheckMarkIcon />
                                  </span>
                                ) : v === false ? (
                                  <Minus
                                    className="w-5 h-5 text-neutral-300 inline"
                                    strokeWidth={2}
                                    aria-hidden
                                  />
                                ) : (
                                  <span>{v}</span>
                                )}
                              </td>
                            );
                          }
                        )}
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
