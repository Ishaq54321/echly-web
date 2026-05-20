"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState, Fragment } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  Camera,
  Check,
  UserPlus,
  UserMinus,
  X,
  Mail,
  RotateCcw,
  AlertCircle,
  Users,
  Lock,
  Info,
  Eye,
  EyeOff,
  Gem,
  Upload,
  ArrowRight,
} from "lucide-react";
import { ImageCropModal } from "@/components/ui/ImageCropModal";
import { InviteMemberModal } from "@/components/workspace/InviteMemberModal";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { MODAL_LAYER_Z_INDEX } from "@/lib/ui/zIndex";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { usePlanCatalog } from "@/lib/hooks/usePlanCatalog";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { UserAvatar } from "@/components/ui/UserAvatar";
import type { Workspace } from "@/lib/domain/workspace";
import {
  assertIdentityResolved,
  useWorkspace,
} from "@/lib/client/workspaceContext";
import type { WorkspaceMembership } from "@/lib/client/workspaceContext";
import { BillingUsageProvider, useBillingUsageContext } from "@/lib/billing/BillingUsageProvider";
import {
  listenToWorkspace,
  updateWorkspaceName,
} from "@/lib/repositories/workspacesRepository";
import { MinimalLoader } from "@/components/ui/MinimalLoader";
import { authFetch, clearAuthTokenCache } from "@/lib/authFetch";
import { useWorkspaceRealtimeStore } from "@/lib/realtime/workspaceStore";
import { openUpgradeCheckout } from "@/lib/billing/openUpgradeCheckout";
import { PlansAndPricingView } from "@/components/billing/PlansAndPricingView";
import { BillingManagementView } from "@/components/billing/BillingManagementView";
import { ReadOnlyBillingState } from "@/components/billing/ReadOnlyBillingState";
import { BillingLoadingSkeleton } from "@/components/billing/BillingLoadingSkeleton";
import { UpgradeSuccessModal } from "@/components/billing/UpgradeSuccessModal";
import { Tooltip } from "@/components/ui/Tooltip";
import { PLANS, type PlanId } from "@/lib/billing/plans";

/* Premium workspace settings: wide layout, strong hierarchy */
const SETTINGS_CARD =
  "rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-card)] p-[28px] transition-[border-color,box-shadow] duration-200 ease-out hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)]";
const CARD_GAP = "space-y-8"; /* 32px between section cards */
const ROW_GAP = "space-y-5"; /* 20px between setting rows */
const SECTION_TITLE = "text-lg font-semibold text-[var(--text-heading)]"; /* H2: section heading */
const SECTION_SUBTITLE = "text-[16px] font-semibold text-[var(--text-heading)]"; /* H3 setting labels: 600 for hierarchy */
const SECTION_DESC = "text-[14px] text-[var(--text-secondary)] mt-1"; /* body, darker grey */
const SETTING_DESC = "text-[14px] text-[var(--text-secondary)] mt-0.5";
const BTN_PRIMARY = "inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border-none bg-[var(--text-heading)] text-white text-[14px] font-medium hover:opacity-85 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none";
const BTN_SECONDARY = "inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border border-[var(--border)] bg-transparent text-[var(--text-heading)] text-[14px] font-medium hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none";

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
  { id: "profile", label: "My account" },
  { id: "workspace", label: "Workspace" },
  { id: "security", label: "Security" },
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
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [workspace, setWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    // Legacy: the standalone "Workspaces" tab was merged into "Workspace".
    const tab = tabParam === "workspaces" ? "workspace" : tabParam;
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
      <div className="flex flex-1 min-h-0 bg-[var(--surface-card)] overflow-auto">
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 max-w-lg mx-auto text-center">
          <p className="text-lg font-medium text-[var(--text-heading)]">Workspace unavailable</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {workspaceError ||
              "Workspace not found. Try refreshing the page or sign in again."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-0 overflow-auto">
      <div className="flex-1 min-w-0 max-w-[1280px] mx-auto px-6 py-10 w-full">
        {/* Page header */}
        <header className="mb-8">
          <h1 className="text-xl font-bold text-[var(--text-heading)] tracking-[-0.4px] mt-1 mb-0">
            Settings
          </h1>
          <p className="text-sm font-normal text-[var(--text-secondary)] mt-1">
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
                  ${isActive ? "text-[var(--text-heading)] font-semibold" : "font-medium text-[var(--text-secondary)] hover:text-[var(--text-heading)]"}
                `}
                aria-current={isActive ? "true" : undefined}
              >
                {label}
                {isActive && (
                  <span
                    className="absolute left-0 right-0 bottom-0 h-[3px] bg-[var(--brand)] rounded-full"
                    aria-hidden
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Tab content */}
        <BillingUsageProvider>
          {activeTab === "profile" && <MyAccountTab />}
          {activeTab === "workspace" && (
            <WorkspaceTab
              workspace={workspace}
              workspaceId={workspaceId}
              loading={sectionLoading}
            />
          )}
          {activeTab === "security" && <SecurityTab />}
          {activeTab === "billing" && <BillingTab />}
          {/* Post-checkout success bridge. Mounted at the settings shell —
              OUTSIDE the activeTab gate and above BillingTab's loading/error
              early returns — so a checkout completed from any surface keeps
              the modal mounted continuously through the Firestore-sync window.
              Lives inside BillingUsageProvider so it can refresh usage. */}
          <UpgradeCheckoutBridge />
        </BillingUsageProvider>
      </div>
    </div>
  );
}

/**
 * Post-checkout bridge owner. Watches for `?upgraded=true` in the URL after
 * the user returns from Stripe Checkout, opens the success modal, refreshes
 * usage, and consumes the query param so a page refresh doesn't re-trigger.
 *
 * Hoisted out of BillingTab: BillingTab has loading/error early returns that
 * unmount its whole subtree on a Firestore snapshot re-entry, which would
 * tear down the modal mid-bridge. Mounted here, the modal survives ANY
 * BillingTab re-render, remount, loading, or error transition.
 */
function UpgradeCheckoutBridge() {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { refetch: refetchUsage } = useBillingUsageContext();

  // Watch for `?upgraded=true` after returning from Stripe Checkout.
  // Consumed-once semantics: open the modal, refresh usage, then strip the
  // query param so a refresh doesn't re-trigger.
  useEffect(() => {
    if (searchParams.get("upgraded") !== "true") return;
    setShowSuccessModal(true);
    void refetchUsage();
    // Replace the URL to drop ?upgraded=true without adding history entry
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("upgraded");
    const query = newParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <UpgradeSuccessModal
      isOpen={showSuccessModal}
      onClose={() => setShowSuccessModal(false)}
    />
  );
}

function SettingsSuspenseFallback() {
  return (
    <div className="flex flex-1 min-h-0 overflow-auto" aria-busy="true" aria-live="polite">
      <div className="flex flex-1 min-h-[520px] min-w-0 max-w-[1280px] mx-auto w-full items-center justify-center px-6 py-10">
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

/**
 * Workspaces switcher. Formerly a dedicated "Workspaces" settings tab;
 * now rendered as the last section of the Workspace tab. Lists ALL workspaces
 * the user belongs to — the current one (marked, non-interactive) pinned to
 * the top, the rest clickable to switch. Self-gates to null for single-
 * workspace users. Pulls its own data from useWorkspace() so it stays a
 * drop-in section component.
 */
function YourWorkspacesSection() {
  const { allWorkspaces, activeWorkspaceId, workspaceId, switchWorkspace } = useWorkspace();
  const currentId = activeWorkspaceId ?? workspaceId;
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);

  // A single-workspace user already knows where they are — showing one row
  // marked "Current" is pure noise. Keep the multi-workspace gate.
  if (allWorkspaces.length <= 1) return null;

  // Current workspace first, then the rest in their existing order.
  const sorted = [...allWorkspaces].sort((a, b) => {
    if (a.workspaceId === currentId) return -1;
    if (b.workspaceId === currentId) return 1;
    return 0;
  });

  return (
    <div style={{ maxWidth: 900, width: "100%" }}>
      <div style={{ marginBottom: 20 }}>
        <h2 className="text-lg font-semibold text-[var(--text-heading)] mb-1">Your workspaces</h2>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
          Workspaces you&apos;re a member of
        </p>
      </div>
      <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
        {sorted.map((ws, idx) => (
          <WorkspaceRow
            key={ws.workspaceId}
            ws={ws}
            isCurrent={ws.workspaceId === currentId}
            isFirst={idx === 0}
            switching={switchingTo === ws.workspaceId}
            disabled={switchingTo !== null}
            onSwitch={async () => {
              setSwitchingTo(ws.workspaceId);
              try { await switchWorkspace(ws.workspaceId); }
              finally { setSwitchingTo(null); }
            }}
          />
        ))}
      </div>
    </div>
  );
}

function WorkspaceRow({
  ws,
  isCurrent,
  isFirst,
  switching,
  disabled,
  onSwitch,
}: {
  ws: WorkspaceMembership;
  isCurrent: boolean;
  isFirst: boolean;
  switching: boolean;
  disabled: boolean;
  onSwitch: () => void | Promise<void>;
}) {
  const [hovered, setHovered] = useState(false);
  const initial = ws.name.trim().charAt(0).toUpperCase() || "W";
  const roleLabel = ws.isOwner ? "Owner" : "Member";
  const borderTop = isFirst ? "none" : "1px solid var(--surface-hover)";

  const content = (
    <>
      {ws.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={ws.logoUrl} alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
      ) : (
        <span style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--brand)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
          {initial}
        </span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-heading)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {ws.name}
          </span>
          {isCurrent && (
            <span
              style={{
                flexShrink: 0,
                fontSize: 11, fontWeight: 600,
                padding: "2px 8px", borderRadius: 999,
                background: "var(--brand-bg, rgba(90, 73, 191, 0.1))",
                color: "var(--brand)",
              }}
            >
              Current
            </span>
          )}
        </div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
          {roleLabel}
        </div>
      </div>
      {isCurrent ? null : switching ? (
        <span style={{ fontSize: 13, color: "var(--text-secondary)", flexShrink: 0 }}>Switching…</span>
      ) : (
        <ArrowRight
          size={18}
          style={{
            color: "var(--text-tertiary)", flexShrink: 0,
            transition: "transform 150ms ease",
            transform: hovered ? "translateX(4px)" : "translateX(0)",
          }}
        />
      )}
    </>
  );

  const baseStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 14,
    padding: "16px 24px", width: "100%",
    border: "none", textAlign: "left",
    borderTop,
    fontFamily: "inherit",
  };

  // Current workspace: a label, not an action.
  if (isCurrent) {
    return (
      <div aria-current="true" style={{ ...baseStyle, background: "transparent" }}>
        {content}
      </div>
    );
  }

  // Other workspaces: keyboard-accessible button with a hover affordance.
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => { void onSwitch(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      style={{
        ...baseStyle,
        background: hovered ? "var(--surface-subtle, var(--surface-hover))" : "transparent",
        cursor: disabled ? "default" : "pointer",
        transition: "background-color 150ms ease",
      }}
    >
      {content}
    </button>
  );
}

function WorkspaceTab({
  workspace,
  workspaceId,
  loading,
}: {
  workspace: Workspace | null;
  workspaceId: string | null;
  loading: boolean;
}) {
  const { isIdentityResolved, isWorkspaceOwner } = useWorkspace();
  const [nameDraft, setNameDraft] = useState("");
  const lastWorkspaceIdRef = useRef<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [brandLogoUrl, setBrandLogoUrl] = useState<string | null>(null);
  const [uploadingBrandLogo, setUploadingBrandLogo] = useState(false);
  const [brandLogoUpgradeOpen, setBrandLogoUpgradeOpen] = useState(false);
  const brandLogoCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const brandLogoInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [logoHovered, setLogoHovered] = useState(false);
  const [logoCropOpen, setLogoCropOpen] = useState(false);
  const [logoCropSrc, setLogoCropSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLogoUrl(workspace?.logoUrl ?? null);
  }, [workspace?.logoUrl]);

  useEffect(() => {
    setBrandLogoUrl(workspace?.brandLogoUrl ?? null);
  }, [workspace?.brandLogoUrl]);

  // Refresh logo signed URL on mount (Phase 7)
  useEffect(() => {
    if (!workspaceId) return;
    void (async () => {
      try {
        const res = await authFetch("/api/workspace/logo");
        if (res?.ok) {
          const json = await res.json() as { success: boolean; data?: { logoUrl: string | null } };
          if (json.success && json.data?.logoUrl) {
            setLogoUrl(json.data.logoUrl);
          }
        }
      } catch { /* non-fatal */ }
    })();
  }, [workspaceId]);

  useEffect(() => {
    if (workspaceId !== lastWorkspaceIdRef.current) {
      lastWorkspaceIdRef.current = workspaceId;
      setNameDraft(workspace?.name ?? "");
    } else if (workspace && nameDraft === "") {
      setNameDraft(workspace.name ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, workspace?.name]);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(msg: string) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const isHeic =
      file.type === "image/heic" ||
      file.type === "image/heif" ||
      file.name.toLowerCase().endsWith(".heic") ||
      file.name.toLowerCase().endsWith(".heif");
    const isValidType = ["image/jpeg", "image/png", "image/webp"].includes(file.type) || isHeic;
    if (!isValidType) {
      showToast("Please use JPEG, PNG, WebP, or HEIC");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be under 5MB");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setLogoCropSrc(objectUrl);
    setLogoCropOpen(true);
  }

  async function handleLogoCropConfirm(blob: Blob) {
    setLogoCropOpen(false);
    if (logoCropSrc) { URL.revokeObjectURL(logoCropSrc); setLogoCropSrc(null); }
    setUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append("logo", blob, "logo.jpg");
      const res = await authFetch("/api/workspace/logo", { method: "POST", body: fd });
      if (!res) { showToast("Upload failed. Try again."); return; }
      if (res.status === 403) { showToast("Only the workspace owner can update the logo."); return; }
      const json = await res.json() as { success: boolean; data?: { logoUrl: string }; error?: { message: string } };
      if (!res.ok || !json.success) {
        const msg = json.error?.message;
        if (msg === "FILE_TOO_LARGE") showToast("Image must be under 5MB");
        else if (msg === "INVALID_FILE_TYPE") showToast("Please use JPEG, PNG, or WebP");
        else showToast("Upload failed. Try again.");
        return;
      }
      setLogoUrl(json.data?.logoUrl ?? null);
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
      showToast("Logo removed");
    } catch {
      showToast("Failed to remove logo.");
    } finally {
      setUploadingLogo(false);
    }
  }

  const planId = (workspace?.billing?.plan ?? "starter") as PlanId;
  const canUseCustomBranding =
    workspace?.entitlements?.customBranding ?? PLANS[planId]?.customBranding ?? false;

  function handleBrandLogoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const isHeic =
      file.type === "image/heic" ||
      file.type === "image/heif" ||
      file.name.toLowerCase().endsWith(".heic") ||
      file.name.toLowerCase().endsWith(".heif");
    const isValidType = ["image/jpeg", "image/png", "image/webp"].includes(file.type) || isHeic;
    if (!isValidType) {
      showToast("Please use PNG, JPEG, or WebP");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be under 5MB");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      if (img.naturalHeight / img.naturalWidth > 1.2) {
        showToast("Tip: wide logos display best — yours may appear small");
      }
      URL.revokeObjectURL(objectUrl);
      void uploadBrandLogo(file);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      void uploadBrandLogo(file);
    };
    img.src = objectUrl;
  }

  async function uploadBrandLogo(file: File) {
    setUploadingBrandLogo(true);
    try {
      const fd = new FormData();
      fd.append("logo", file, file.name);
      const res = await authFetch("/api/workspace/brand-logo", { method: "POST", body: fd });
      if (!res) { showToast("Upload failed. Try again."); return; }
      if (res.status === 403) {
        const json = await res.json().catch(() => null) as { error?: { message?: string } } | null;
        if (json?.error?.message === "PLAN_REQUIRED") {
          showToast("Brand logo requires a paid plan.");
        } else {
          showToast("Only the workspace owner can update the brand logo.");
        }
        return;
      }
      const json = await res.json() as { success: boolean; data?: { brandLogoUrl: string }; error?: { message: string } };
      if (!res.ok || !json.success) {
        const msg = json.error?.message;
        if (msg === "FILE_TOO_LARGE") showToast("Image must be under 5MB");
        else if (msg === "INVALID_FILE_TYPE") showToast("Please use PNG, JPEG, or WebP");
        else showToast("Upload failed. Try again.");
        return;
      }
      setBrandLogoUrl(json.data?.brandLogoUrl ?? null);
      showToast("Brand logo updated");
    } catch {
      showToast("Upload failed. Try again.");
    } finally {
      setUploadingBrandLogo(false);
    }
  }

  async function handleRemoveBrandLogo() {
    setUploadingBrandLogo(true);
    try {
      const res = await authFetch("/api/workspace/brand-logo", { method: "DELETE" });
      if (!res?.ok) { showToast("Failed to remove brand logo."); return; }
      setBrandLogoUrl(null);
      showToast("Brand logo removed");
    } catch {
      showToast("Failed to remove brand logo.");
    } finally {
      setUploadingBrandLogo(false);
    }
  }

  async function handleSave() {
    assertIdentityResolved(isIdentityResolved);
    const wid = workspaceId?.trim();
    if (!wid) return;
    const trimmed = nameDraft.trim() || "My Workspace";
    if (workspace?.name === trimmed) {
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 2000);
      return;
    }
    setIsSaving(true);
    try {
      await updateWorkspaceName(wid, trimmed);
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 2000);
    } catch {
      showToast("Failed to update workspace name.");
    } finally {
      setIsSaving(false);
    }
  }

  const workspaceInitial = (workspace?.name ?? "W").trim().charAt(0).toUpperCase();

  if (loading) {
    return (
      <div style={{ maxWidth: 900, width: "100%", padding: "32px 0" }} aria-busy="true" aria-live="polite">
        <style>{`@keyframes shimmer { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } } .skeleton { animation: shimmer 1.5s ease infinite; }`}</style>
        <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid var(--surface-hover)" }}>
          <div className="skeleton" style={{ height: 22, width: 180, background: "var(--surface-hover)", borderRadius: 6, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 14, width: 280, background: "var(--surface-hover)", borderRadius: 4 }} />
        </div>
        <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "28px 32px", borderBottom: "1px solid var(--surface-hover)" }}>
            <div className="skeleton" style={{ width: 140, height: 14, background: "var(--surface-hover)", borderRadius: 4, marginBottom: 16 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <div className="skeleton" style={{ width: 88, height: 88, borderRadius: "50%", background: "var(--surface-hover)", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 42, background: "var(--surface-hover)", borderRadius: 9, width: "100%", marginBottom: 10 }} />
                <div className="skeleton" style={{ height: 38, background: "var(--surface-hover)", borderRadius: 9, width: 120 }} />
              </div>
            </div>
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ padding: "16px 32px", borderBottom: "1px solid var(--surface-hover)", display: "flex", alignItems: "center", gap: 12 }}>
              <div className="skeleton" style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--surface-hover)", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 13, background: "var(--surface-hover)", borderRadius: 4, width: "55%", marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 11, background: "var(--surface-hover)", borderRadius: 4, width: "70%" }} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div className="skeleton" style={{ height: 22, width: 52, borderRadius: 999, background: "var(--surface-hover)" }} />
                <div className="skeleton" style={{ height: 22, width: 52, borderRadius: 999, background: "var(--surface-hover)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, width: "100%", padding: "32px 0" }} className="ech-content-enter pb-16">
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
            padding: "10px 18px",
            borderRadius: 10,
            background: "var(--text-heading)",
            color: "white",
            fontSize: 14,
            fontWeight: 500,
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {toast}
        </div>
      )}

      {/* Page heading */}
      <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid var(--border)" }}>
        <h1 className="text-lg font-semibold text-[var(--text-heading)] mb-1">
          Workspace Settings
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
          Manage your workspace identity and members
        </p>
      </div>

      {/* Brand Logo card (whitelabel, paid plans) */}
      <div
        style={{
          background: "white",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "28px 32px",
          marginBottom: 16,
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 24 }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-heading)", margin: 0 }}>Brand Logo</h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0 0" }}>
              Your logo appears on session pages and shared links instead of Annote.
            </p>
            {!canUseCustomBranding && (
              <div style={{ marginTop: 12 }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: "var(--brand-subtle)",
                    color: "var(--brand)",
                    fontSize: 12,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  <Gem size={12} aria-hidden />
                  Business
                </span>
              </div>
            )}
          </div>

          <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              role="button"
              tabIndex={canUseCustomBranding ? 0 : -1}
              aria-label={brandLogoUrl ? "Replace brand logo" : "Upload brand logo"}
              aria-disabled={!canUseCustomBranding}
              onClick={() => {
                if (!canUseCustomBranding) {
                  setBrandLogoUpgradeOpen((v) => !v);
                  return;
                }
                if (uploadingBrandLogo || !isWorkspaceOwner) return;
                brandLogoInputRef.current?.click();
              }}
              onMouseEnter={() => { if (!canUseCustomBranding) setBrandLogoUpgradeOpen(true); }}
              onMouseLeave={() => {
                if (!canUseCustomBranding) {
                  if (brandLogoCloseTimeoutRef.current) clearTimeout(brandLogoCloseTimeoutRef.current);
                  brandLogoCloseTimeoutRef.current = setTimeout(() => setBrandLogoUpgradeOpen(false), 200);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (!canUseCustomBranding) { setBrandLogoUpgradeOpen((v) => !v); return; }
                  if (!uploadingBrandLogo && isWorkspaceOwner) brandLogoInputRef.current?.click();
                }
              }}
              style={{
                borderRadius: 12,
                border: "2px dashed var(--border)",
                background: "var(--surface-subtle)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: canUseCustomBranding && isWorkspaceOwner ? "pointer" : "not-allowed",
                opacity: canUseCustomBranding ? 1 : 0.6,
                position: "relative",
                transition: "border-color 150ms",
                ...(brandLogoUrl
                  ? { padding: 8 }
                  : { width: 160, height: 72 }
                ),
              }}
            >
              {uploadingBrandLogo && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.7)", borderRadius: 12 }}>
                  <span style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid var(--brand)", borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
                </div>
              )}
              {brandLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={brandLogoUrl}
                  alt="Brand logo"
                  style={{ height: 40, width: "auto", display: "block" }}
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "var(--text-tertiary)", gap: 4 }}>
                  <Upload size={20} aria-hidden />
                  <span style={{ fontSize: 12 }}>Click to upload</span>
                </div>
              )}
            </div>
            <p style={{ fontSize: 12, color: "var(--text-tertiary)", margin: "8px 0 0 0", textAlign: "center" }}>
              Upload your logomark or full wordmark.<br />
              PNG with transparent background works best.
            </p>

            {!canUseCustomBranding && brandLogoUpgradeOpen && (
              <div
                role="dialog"
                onMouseEnter={() => {
                  if (brandLogoCloseTimeoutRef.current) {
                    clearTimeout(brandLogoCloseTimeoutRef.current);
                    brandLogoCloseTimeoutRef.current = null;
                  }
                  setBrandLogoUpgradeOpen(true);
                }}
                onMouseLeave={() => {
                  if (brandLogoCloseTimeoutRef.current) clearTimeout(brandLogoCloseTimeoutRef.current);
                  brandLogoCloseTimeoutRef.current = setTimeout(() => setBrandLogoUpgradeOpen(false), 200);
                }}
                style={{
                  position: "absolute",
                  zIndex: 50,
                  right: "calc(100% + 12px)",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 320,
                  background: "white",
                  borderRadius: 14,
                  border: "1px solid var(--border)",
                  boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
                  padding: 20,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <Gem size={16} color="var(--brand)" aria-hidden />
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-heading)" }}>Business Feature</span>
                </div>
                <h4 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-heading)", margin: "0 0 8px 0" }}>Add your brand logo</h4>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 16px 0" }}>
                  Replace Annote branding with your own logo on session pages.
                </p>
                <div style={{ background: "var(--surface-subtle)", borderRadius: 10, padding: 12, marginBottom: 16, border: "1px solid var(--border)" }}>
                  <div style={{ background: "white", borderRadius: 8, border: "1px solid var(--border)", padding: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ width: 60, height: 20, borderRadius: 4, background: "var(--brand-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "var(--brand)", letterSpacing: 0.5 }}>
                      YOUR LOGO
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--surface-hover)" }} />
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--surface-hover)" }} />
                    </div>
                  </div>
                </div>
                <a href="/settings?tab=billing" style={{ textDecoration: "none", display: "block" }}>
                  <button
                    type="button"
                    style={{ width: "100%", height: 36, borderRadius: 8, background: "var(--brand)", color: "white", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}
                  >
                    Upgrade to Business
                  </button>
                </a>
              </div>
            )}

            {brandLogoUrl && canUseCustomBranding && isWorkspaceOwner && (
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => brandLogoInputRef.current?.click()}
                  disabled={uploadingBrandLogo}
                  style={{ height: 32, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border)", background: "white", color: "var(--text-heading)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => void handleRemoveBrandLogo()}
                  disabled={uploadingBrandLogo}
                  style={{ height: 32, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border)", background: "white", color: "var(--color-danger)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
                >
                  Remove
                </button>
              </div>
            )}

            <input
              ref={brandLogoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,.heic,.HEIC"
              className="hidden"
              onChange={handleBrandLogoFileChange}
              aria-label="Upload brand logo"
            />
          </div>
        </div>
      </div>

      {/* Card */}
      <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>

      {/* Workspace identity section */}
      {/* Workspace identity row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 24,
          padding: "28px 32px",
          borderBottom: "1px solid var(--surface-hover)",
        }}
      >
        {/* Logo upload */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div
            style={{ position: "relative", cursor: "pointer", width: 88, height: 88 }}
            onClick={() => !uploadingLogo && !loading && workspaceId && fileInputRef.current?.click()}
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
          >
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: "50%",
                border: "none",
                boxShadow: "0 0 0 2px var(--border)",
                overflow: "hidden",
                background: "var(--surface-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              {uploadingLogo && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255,255,255,0.7)",
                    zIndex: 10,
                  }}
                >
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: "2px solid var(--brand)",
                      borderTopColor: "transparent",
                      animation: "spin 0.7s linear infinite",
                      display: "block",
                    }}
                  />
                </div>
              )}
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Workspace logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: 28, fontWeight: 700, color: "#999" }}>{workspaceInitial}</span>
              )}
            </div>
            {/* Camera overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: "rgba(0,0,0,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: logoHovered && !uploadingLogo ? 1 : 0,
                transition: "opacity 160ms",
              }}
            >
              <Camera size={20} color="white" />
            </div>
          </div>
          {logoUrl && (
            <button
              type="button"
              onClick={handleRemoveLogo}
              disabled={uploadingLogo || loading || !workspaceId}
              style={{ fontSize: 12, color: "var(--color-danger)", cursor: "pointer", background: "none", border: "none", padding: 0 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.textDecoration = "underline"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.textDecoration = "none"; }}
            >
              Remove
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,.heic,.HEIC"
          className="hidden"
          onChange={handleFileChange}
          aria-label="Upload workspace logo"
        />

        {/* Workspace name */}
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
            Workspace name
          </label>
          <input
            type="text"
            value={nameDraft}
            disabled={loading || !workspaceId || !isWorkspaceOwner}
            onChange={(e) => setNameDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void handleSave(); }}
            style={{
              height: 42,
              borderRadius: 9,
              border: "1.5px solid var(--border)",
              background: "var(--surface-input)",
              padding: "0 12px",
              fontSize: 15,
              color: "var(--text-heading)",
              width: "100%",
              outline: "none",
              transition: "border-color 150ms, box-shadow 150ms, background 150ms",
              boxSizing: "border-box",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--brand)";
              e.target.style.background = "white";
              e.target.style.boxShadow = "0 0 0 3px rgba(90,73,191,0.10)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--border)";
              e.target.style.background = "var(--surface-input)";
              e.target.style.boxShadow = "none";
            }}
          />

          {isWorkspaceOwner ? (
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={isSaving || loading || !workspaceId || !nameDraft.trim()}
              style={{
                marginTop: 16,
                height: 38,
                padding: "0 18px",
                borderRadius: 9,
                border: "none",
                background: savedOk ? "var(--color-success)" : "var(--brand)",
                color: "white",
                fontSize: 15,
                fontWeight: 600,
                cursor: isSaving || loading || !workspaceId || !nameDraft.trim() ? "not-allowed" : "pointer",
                opacity: isSaving || loading || !workspaceId || !nameDraft.trim() ? 0.7 : 1,
                transition: "background 200ms",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {isSaving ? (
                <>
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.4)",
                      borderTopColor: "white",
                      animation: "spin 0.7s linear infinite",
                      display: "block",
                    }}
                  />
                  Saving...
                </>
              ) : savedOk ? (
                <>
                  <Check size={16} />
                  Saved!
                </>
              ) : (
                "Save changes"
              )}
            </button>
          ) : (
            <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-tertiary)" }}>
              Only workspace owners can edit the name.
            </div>
          )}
        </div>
      </div>

      {/* Members section inside the card */}
      <div style={{ padding: "0 32px 32px" }}>
        <div style={{ margin: "28px 0 0", height: 1, background: "var(--surface-hover)" }} aria-hidden />
        <MembersTab workspaceId={workspaceId} loading={loading} />
      </div>

      </div>{/* end card */}

      {/* Your workspaces — formerly the standalone "Workspaces" tab.
          Self-gates to null for single-workspace users. */}
      <div style={{ marginTop: 48 }}>
        <YourWorkspacesSection />
      </div>

      {logoCropSrc && (
        <ImageCropModal
          isOpen={logoCropOpen}
          imageSrc={logoCropSrc}
          onConfirm={(blob) => { void handleLogoCropConfirm(blob); }}
          onCancel={() => { setLogoCropOpen(false); if (logoCropSrc) URL.revokeObjectURL(logoCropSrc); setLogoCropSrc(null); }}
          onError={(msg) => showToast(msg)}
          title="Crop workspace logo"
          shape="circle"
          confirmLabel="Save logo"
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes shimmer { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } } .skeleton { animation: shimmer 1.5s ease infinite; }`}</style>
    </div>
  );
}





const UPGRADE_TOOLTIP = "Upgrade your plan to unlock branding features.";

function UpgradePlanBadge({ onClick, title }: { onClick?: () => void; title?: string }) {
  const tooltip = title ?? UPGRADE_TOOLTIP;
  const base =
    "inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] py-1 px-2.5 bg-[var(--color-success-bg)]/90 text-[var(--text-heading)] text-xs font-semibold transition-all duration-200 hover:bg-[var(--color-success-bg)] hover:shadow-sm [&_svg]:text-[var(--text-heading)] [&_svg]:stroke-[2.5]";
  if (onClick)
    return (
      <Tooltip content={tooltip}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className={`${base} shrink-0`}
        >
          <Gem className="w-3.5 h-3.5" aria-hidden />
          Upgrade Plan
        </button>
      </Tooltip>
    );
  return (
    <Tooltip content={tooltip}>
      <span className={base}>
        <Gem className="w-3.5 h-3.5" aria-hidden />
        Upgrade Plan
      </span>
    </Tooltip>
  );
}

/* ——— Change Email Modal ——— */
function ChangeEmailModal({ onClose }: { onClose: () => void }) {
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await authFetch("/api/users/change-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail: newEmail.trim(), password }),
      });
      const json = await res?.json() as { success: boolean; error?: { message: string } } | undefined;
      if (!res?.ok) {
        const msg = json?.error?.message ?? "";
        if (res?.status === 403 || msg.toLowerCase().includes("password")) setError("Incorrect password");
        else if (res?.status === 409) setError("This email is already in use");
        else setError(msg || "Failed to send confirmation email");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalPortal>
    <div
      style={{ position: "fixed", inset: 0, zIndex: MODAL_LAYER_Z_INDEX, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        style={{ background: "white", borderRadius: 20, maxWidth: 440, width: "100%", margin: 16, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", overflow: "hidden" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "var(--text-heading)" }}>Change email address</span>
          <button type="button" onClick={onClose} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", borderRadius: 6, cursor: "pointer", color: "#777" }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "24px 28px" }}>
          {success ? (
            <div style={{ textAlign: "center", padding: "12px 0 8px" }}>
              <Check size={32} color="var(--color-success-solid)" style={{ margin: "0 auto 12px" }} />
              <p style={{ fontSize: 17, fontWeight: 600, color: "var(--text-heading)", margin: "0 0 8px" }}>Confirmation email sent!</p>
              <p style={{ fontSize: 14, color: "#777", margin: 0 }}>Check {newEmail} for a confirmation link.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { void handleSubmit(e); }}>
              {/* Info note */}
              <div style={{ background: "var(--brand-subtle)", border: "1px solid var(--brand-muted)", borderRadius: 10, padding: "12px 14px", display: "flex", gap: 10, marginBottom: 20, alignItems: "flex-start" }}>
                <Mail size={16} color="var(--brand)" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 13, color: "var(--brand-hover)", lineHeight: 1.5 }}>
                  We&apos;ll send a confirmation link to your new email address. Your email won&apos;t change until you click the link.
                </span>
              </div>

              <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>New email address</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                style={{ height: 42, borderRadius: 9, border: "1.5px solid var(--border)", background: "var(--surface-input)", padding: "0 12px", fontSize: 15, color: "var(--text-heading)", width: "100%", outline: "none", boxSizing: "border-box", marginBottom: 14 }}
                onFocus={(e) => { e.target.style.borderColor = "var(--brand)"; e.target.style.background = "white"; e.target.style.boxShadow = "0 0 0 3px rgba(90,73,191,0.10)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.background = "var(--surface-input)"; e.target.style.boxShadow = "none"; }}
              />

              <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Current password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ height: 42, borderRadius: 9, border: "1.5px solid var(--border)", background: "var(--surface-input)", padding: "0 40px 0 12px", fontSize: 15, color: "var(--text-heading)", width: "100%", outline: "none", boxSizing: "border-box" }}
                  onFocus={(e) => { e.target.style.borderColor = "var(--brand)"; e.target.style.background = "white"; e.target.style.boxShadow = "0 0 0 3px rgba(90,73,191,0.10)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.background = "var(--surface-input)"; e.target.style.boxShadow = "none"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#999", display: "flex", alignItems: "center" }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {error && (
                <div style={{ marginTop: 10, background: "var(--color-danger-bg)", border: "1px solid var(--color-danger-border)", borderRadius: 8, padding: "10px 12px", display: "flex", gap: 8, alignItems: "center" }}>
                  <AlertCircle size={14} color="var(--color-danger)" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "var(--color-danger)" }}>{error}</span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
                <button type="button" onClick={onClose} style={{ height: 38, padding: "0 16px", borderRadius: 9, border: "1px solid var(--border)", background: "white", color: "var(--text-secondary)", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !newEmail.trim() || !password}
                  style={{ height: 38, padding: "0 18px", borderRadius: 9, border: "none", background: "var(--brand)", color: "white", fontSize: 14, fontWeight: 600, cursor: loading || !newEmail.trim() || !password ? "not-allowed" : "pointer", opacity: loading || !newEmail.trim() || !password ? 0.7 : 1, display: "flex", alignItems: "center", gap: 8 }}
                >
                  {loading ? <><span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", animation: "spin 0.7s linear infinite", display: "block" }} />Sending…</> : "Send confirmation"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}

/* ——— Delete Account Modal ——— */
function DeleteAccountModal({ onClose }: { onClose: () => void }) {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <ModalPortal>
    <div
      style={{ position: "fixed", inset: 0, zIndex: MODAL_LAYER_Z_INDEX, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        style={{ background: "white", borderRadius: 20, maxWidth: 420, width: "100%", margin: 16, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", overflow: "hidden" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "var(--color-danger)" }}>Delete account</span>
          <button type="button" onClick={onClose} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", borderRadius: 6, cursor: "pointer", color: "#777" }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: "24px 28px" }}>
          <p style={{ fontSize: 14, color: "#444", lineHeight: 1.6, marginBottom: 20 }}>
            Are you sure? This action <strong>cannot be undone</strong>. All your data will be permanently deleted.
          </p>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 20 }}>
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} style={{ width: 16, height: 16 }} />
            <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>I understand this is permanent</span>
          </label>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" onClick={onClose} style={{ height: 38, padding: "0 16px", borderRadius: 9, border: "1px solid var(--border)", background: "white", color: "var(--text-secondary)", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
              Cancel
            </button>
            <button
              type="button"
              disabled={!confirmed}
              onClick={() => { onClose(); alert("Contact ishaq@annote.ai to delete your account."); }}
              style={{ height: 38, padding: "0 16px", borderRadius: 9, border: "none", background: confirmed ? "var(--color-danger)" : "var(--color-danger-border)", color: "white", fontSize: 14, fontWeight: 600, cursor: confirmed ? "pointer" : "not-allowed", transition: "background 200ms" }}
            >
              Delete account
            </button>
          </div>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}

/* ——— My Account Tab ——— */
function MyAccountTab() {
  const { authPhotoUrl, firstName, lastName, authEmail, authReady, updateAvatarUrl } = useWorkspace();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(authPhotoUrl);
  const [firstNameDraft, setFirstNameDraft] = useState(firstName);
  const [lastNameDraft, setLastNameDraft] = useState(lastName);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [avatarHovered, setAvatarHovered] = useState(false);
  const [authProvider, setAuthProvider] = useState<"google" | "password" | "unknown">("unknown");
  const [changeEmailOpen, setChangeEmailOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Refresh avatar URL + fetch authProvider on mount
  useEffect(() => {
    void (async () => {
      try {
        const res = await authFetch("/api/users/avatar");
        if (res?.ok) {
          const json = await res.json() as { success: boolean; data?: { avatarUrl: string | null } };
          if (json.success && json.data?.avatarUrl) {
            setLocalAvatarUrl(json.data.avatarUrl);
            updateAvatarUrl(json.data.avatarUrl);
          }
        }
      } catch { /* non-fatal */ }
      setIsInitialLoad(false);
    })();
    void (async () => {
      try {
        const res = await authFetch("/api/users");
        if (res?.ok) {
          const json = await res.json() as { success: boolean; data?: { authProvider: "google" | "password" | "unknown" } };
          if (json.success && json.data?.authProvider) {
            setAuthProvider(json.data.authProvider);
          }
        }
      } catch { /* non-fatal */ }
    })();
  }, []);

  useEffect(() => {
    if (authPhotoUrl && !localAvatarUrl) setLocalAvatarUrl(authPhotoUrl);
  }, [authPhotoUrl, localAvatarUrl]);
  useEffect(() => { setFirstNameDraft(firstName); }, [firstName]);
  useEffect(() => { setLastNameDraft(lastName); }, [lastName]);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(msg: string) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const isHeic =
      file.type === "image/heic" ||
      file.type === "image/heif" ||
      file.name.toLowerCase().endsWith(".heic") ||
      file.name.toLowerCase().endsWith(".heif");
    const isValidType = ["image/jpeg", "image/png", "image/webp"].includes(file.type) || isHeic;
    if (!isValidType) {
      showToast("Please use JPEG, PNG, WebP, or HEIC"); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be under 5MB"); return;
    }
    const objectUrl = URL.createObjectURL(file);
    setCropImageSrc(objectUrl);
    setCropModalOpen(true);
  }

  async function handleCropConfirm(blob: Blob) {
    setCropModalOpen(false);
    if (cropImageSrc) { URL.revokeObjectURL(cropImageSrc); setCropImageSrc(null); }
    setIsUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append("avatar", blob, "avatar.jpg");
      const res = await authFetch("/api/users/avatar", { method: "POST", body: fd });
      if (!res?.ok) { showToast("Upload failed. Try again."); return; }
      const json = await res.json() as { success: boolean; data?: { avatarUrl: string }; error?: { message: string } };
      if (!json.success) {
        const msg = json.error?.message;
        if (msg === "FILE_TOO_LARGE") showToast("Image must be under 5MB");
        else if (msg === "INVALID_FILE_TYPE") showToast("Please use JPEG, PNG, or WebP");
        else showToast("Upload failed. Try again.");
        return;
      }
      setLocalAvatarUrl(json.data?.avatarUrl ?? null);
      updateAvatarUrl(json.data?.avatarUrl ?? null);
      showToast("Profile photo updated");
    } catch {
      showToast("Upload failed. Try again.");
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  async function handleRemoveAvatar() {
    setIsUploadingAvatar(true);
    try {
      const res = await authFetch("/api/users/avatar", { method: "DELETE" });
      if (!res?.ok) { showToast("Failed to remove photo."); return; }
      setLocalAvatarUrl(null);
      updateAvatarUrl(null);
      showToast("Photo removed");
    } catch {
      showToast("Failed to remove photo.");
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  async function handleSaveName() {
    const fn = firstNameDraft.trim().slice(0, 50);
    const ln = lastNameDraft.trim().slice(0, 50);
    if (!fn) return;
    // Short-circuit only when BOTH drafts match context exactly.
    if (fn === firstName && ln === lastName) {
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 2000);
      return;
    }
    setIsSaving(true);
    try {
      const res = await authFetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: fn, lastName: ln }),
      });
      if (!res?.ok) { showToast("Failed to update name."); return; }
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 2000);
    } catch {
      showToast("Failed to update name.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSendPasswordReset() {
    if (!authEmail) return;
    setPasswordResetLoading(true);
    try {
      const res = await authFetch("/api/users/send-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail }),
      });
      if (!res?.ok) { showToast("Failed to send reset email."); return; }
      setPasswordResetSent(true);
      setTimeout(() => setPasswordResetSent(false), 3000);
    } catch {
      showToast("Failed to send reset email.");
    } finally {
      setPasswordResetLoading(false);
    }
  }

  const initial = ((firstName || authEmail || "?").trim().charAt(0) || "?").toUpperCase();

  const inputStyle: React.CSSProperties = {
    height: 42,
    borderRadius: 9,
    border: "1.5px solid var(--border)",
    background: "var(--surface-input)",
    padding: "0 12px",
    fontSize: 15,
    color: "var(--text-heading)",
    width: "100%",
    outline: "none",
    transition: "border-color 150ms, box-shadow 150ms, background 150ms",
    boxSizing: "border-box",
  };

  const sectionStyle: React.CSSProperties = {
    padding: "28px 32px",
    borderBottom: "1px solid var(--surface-hover)",
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 600,
    color: "var(--text-heading)",
    margin: "0 0 4px",
  };

  const sectionSubtitleStyle: React.CSSProperties = {
    fontSize: 14,
    color: "#777",
    margin: "0 0 20px",
  };

  const isLoading = !authReady || isInitialLoad;

  if (isLoading) {
    return (
      <div style={{ maxWidth: 900, width: "100%", padding: "32px 0" }}>
        <style>{`@keyframes shimmer { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } } .skeleton { animation: shimmer 1.5s ease infinite; }`}</style>
        <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid var(--surface-hover)" }}>
          <div className="skeleton" style={{ height: 22, width: 160, background: "var(--surface-hover)", borderRadius: 6, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 14, width: 280, background: "var(--surface-hover)", borderRadius: 4 }} />
        </div>
        <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "28px 32px", borderBottom: "1px solid var(--surface-hover)" }}>
            <div className="skeleton" style={{ width: 110, height: 14, background: "var(--surface-hover)", borderRadius: 4, marginBottom: 16 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <div className="skeleton" style={{ width: 88, height: 88, borderRadius: "50%", background: "var(--surface-hover)", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 42, background: "var(--surface-hover)", borderRadius: 9, width: "100%", marginBottom: 10 }} />
                <div className="skeleton" style={{ height: 38, background: "var(--surface-hover)", borderRadius: 9, width: 120 }} />
              </div>
            </div>
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ padding: "28px 32px", borderBottom: "1px solid var(--surface-hover)" }}>
              <div className="skeleton" style={{ height: 56, background: "var(--surface-subtle)", borderRadius: 9 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, width: "100%", padding: "32px 0" }} className="ech-content-enter pb-16">
      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 50, padding: "10px 18px", borderRadius: 10, background: "var(--text-heading)", color: "white", fontSize: 14, fontWeight: 500, pointerEvents: "none", whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}

      {/* Page heading */}
      <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid var(--surface-hover)" }}>
        <h1 className="text-lg font-semibold text-[var(--text-heading)] mb-1">
          Profile Settings
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
          Manage your personal account and preferences
        </p>
      </div>

      {/* Card */}
      <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>

        {/* Section: Name and photo */}
        <div style={{ ...sectionStyle }}>
          <p style={sectionTitleStyle}>Name and photo</p>
          <p style={sectionSubtitleStyle}>Update your display name and profile photo</p>

          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {/* Avatar */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div
                style={{ position: "relative", cursor: "pointer", width: 88, height: 88, flexShrink: 0 }}
                onClick={() => !isUploadingAvatar && fileInputRef.current?.click()}
                onMouseEnter={() => setAvatarHovered(true)}
                onMouseLeave={() => setAvatarHovered(false)}
              >
                <div style={{ width: 88, height: 88, borderRadius: "50%", boxShadow: "0 0 0 3px #FFFFFF, 0 0 0 5px var(--border)", overflow: "hidden", background: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {localAvatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={localAvatarUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: 34, fontWeight: 700, color: "white" }}>{initial}</span>
                  )}
                </div>
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", opacity: avatarHovered && !isUploadingAvatar ? 1 : 0, transition: "opacity 160ms" }}>
                  {isUploadingAvatar ? (
                    <span style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid white", borderTopColor: "transparent", animation: "spin 0.7s linear infinite", display: "block" }} />
                  ) : (
                    <Camera size={18} color="white" />
                  )}
                </div>
              </div>
              {localAvatarUrl && (
                <button
                  type="button"
                  onClick={() => void handleRemoveAvatar()}
                  disabled={isUploadingAvatar}
                  style={{ fontSize: 12, color: "var(--color-danger)", cursor: "pointer", background: "none", border: "none", padding: 0 }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.textDecoration = "underline"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.textDecoration = "none"; }}
                >
                  Remove
                </button>
              )}
            </div>

            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,.heic,.HEIC" className="hidden" onChange={handleFileChange} aria-label="Upload profile photo" />

            {/* Name fields */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>First name</label>
                  <input
                    type="text"
                    value={firstNameDraft}
                    maxLength={50}
                    onChange={(e) => setFirstNameDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") void handleSaveName(); }}
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = "var(--brand)"; e.target.style.background = "white"; e.target.style.boxShadow = "0 0 0 3px rgba(90,73,191,0.10)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.background = "var(--surface-input)"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Last name</label>
                  <input
                    type="text"
                    value={lastNameDraft}
                    maxLength={50}
                    onChange={(e) => setLastNameDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") void handleSaveName(); }}
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = "var(--brand)"; e.target.style.background = "white"; e.target.style.boxShadow = "0 0 0 3px rgba(90,73,191,0.10)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.background = "var(--surface-input)"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => void handleSaveName()}
                disabled={isSaving || !firstNameDraft.trim()}
                style={{ marginTop: 10, height: 38, padding: "0 18px", borderRadius: 9, border: "none", background: savedOk ? "var(--color-success)" : "var(--brand)", color: "white", fontSize: 14, fontWeight: 600, cursor: isSaving || !firstNameDraft.trim() ? "not-allowed" : "pointer", opacity: isSaving || !firstNameDraft.trim() ? 0.7 : 1, transition: "background 200ms", display: "flex", alignItems: "center", gap: 8 }}
              >
                {isSaving ? (
                  <><span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", animation: "spin 0.7s linear infinite", display: "block" }} />Saving...</>
                ) : savedOk ? (
                  <><Check size={14} />Saved</>
                ) : "Save"}
              </button>
            </div>
          </div>
        </div>

        {/* Section: Connected account (Google users) */}
        {authProvider === "google" && (
          <div style={sectionStyle}>
            <p style={sectionTitleStyle}>Connected account</p>
            <div style={{ background: "var(--surface-subtle)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-heading)", margin: 0 }}>Signed in with Google</p>
                <p style={{ fontSize: 13, color: "#777", margin: "2px 0 0" }}>{authEmail ?? ""}</p>
              </div>
              <a href="https://myaccount.google.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "var(--brand)", fontWeight: 500, textDecoration: "none", flexShrink: 0 }}>
                Manage Google account ↗
              </a>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "flex-start" }}>
              <Info size={14} color="#999" style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 13, color: "#777" }}>Your email and password are managed by Google. To change them, visit your Google account settings.</span>
            </div>
          </div>
        )}

        {/* Section: Contact info */}
        <div style={sectionStyle}>
          <p style={{ ...sectionTitleStyle, marginBottom: 16 }}>Contact info</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", minHeight: 60 }}>
            <div>
              <p style={{ fontSize: 13, color: "#777", margin: "0 0 2px" }}>Email address</p>
              <p style={{ fontSize: 15, color: "var(--text-heading)", fontWeight: 500, margin: 0 }}>{authEmail ?? "—"}</p>
            </div>
            {authProvider === "google" ? (
              <Lock size={14} color="#BBB" />
            ) : (
              <button
                type="button"
                onClick={() => setChangeEmailOpen(true)}
                style={{ height: 34, padding: "0 14px", borderRadius: 8, border: "1px solid var(--border)", background: "white", color: "var(--text-secondary)", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "background 150ms" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-subtle)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "white"; }}
              >
                Change email
              </button>
            )}
          </div>
        </div>

        {/* Section: Password */}
        <div style={sectionStyle}>
          <p style={{ ...sectionTitleStyle, marginBottom: 16 }}>Password</p>
          {authProvider === "google" ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Lock size={15} color="#BBB" />
              <span style={{ fontSize: 14, color: "#777" }}>Password is managed by your Google account</span>
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 60 }}>
              <div>
                <p style={{ fontSize: 14, color: "var(--text-heading)", fontWeight: 500, margin: 0 }}>Password</p>
                <p style={{ fontSize: 13, color: "#777", margin: "2px 0 0" }}>Last changed: unknown</p>
              </div>
              <button
                type="button"
                onClick={() => void handleSendPasswordReset()}
                disabled={passwordResetLoading || passwordResetSent}
                style={{
                  height: 34,
                  padding: "0 14px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: passwordResetSent ? "var(--color-success-bg)" : "white",
                  color: passwordResetSent ? "var(--color-success-solid)" : "var(--text-secondary)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: passwordResetLoading || passwordResetSent ? "default" : "pointer",
                  transition: "all 200ms",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {passwordResetSent ? <><Check size={13} />Reset email sent</> : passwordResetLoading ? "Sending…" : "Send reset email"}
              </button>
            </div>
          )}
        </div>

        {/* Section: Delete account */}
        <div style={{ padding: "28px 32px" }}>
          <p style={sectionTitleStyle}>Delete account</p>
          <p style={{ ...sectionSubtitleStyle, marginBottom: 16 }}>Permanently delete your account and all associated data</p>
          <button
            type="button"
            onClick={() => setDeleteAccountOpen(true)}
            style={{
              background: "white",
              border: "1.5px solid var(--color-danger-border)",
              color: "var(--color-danger)",
              borderRadius: 9,
              height: 38,
              padding: "0 16px",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 150ms",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--color-danger-bg)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-danger-border)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "white"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-danger-border)"; }}
          >
            Delete account
          </button>
        </div>
      </div>

      {cropImageSrc && (
        <ImageCropModal
          isOpen={cropModalOpen}
          imageSrc={cropImageSrc}
          onConfirm={(blob) => { void handleCropConfirm(blob); }}
          onCancel={() => { setCropModalOpen(false); if (cropImageSrc) URL.revokeObjectURL(cropImageSrc); setCropImageSrc(null); }}
          onError={(msg) => showToast(msg)}
          title="Crop profile photo"
          shape="circle"
          confirmLabel="Save photo"
        />
      )}

      {changeEmailOpen && <ChangeEmailModal onClose={() => setChangeEmailOpen(false)} />}
      {deleteAccountOpen && <DeleteAccountModal onClose={() => setDeleteAccountOpen(false)} />}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes shimmer { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } } .skeleton { animation: shimmer 1.5s ease infinite; }`}</style>
    </div>
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

type UnifiedMemberRow = {
  id: string;
  type: "member" | "invitation";
  name: string | null;
  email: string;
  role: "OWNER" | "MEMBER";
  status: "active" | "pending";
  joinedAt: { seconds: number; nanoseconds: number } | null;
  avatarUrl: string | null;
  invitationToken: string | null;
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


function formatDateAdded(ts: unknown): string {
  try {
    if (!ts) return "—";
    let date: Date;
    if (
      typeof ts === "object" &&
      ts !== null &&
      "seconds" in ts &&
      typeof (ts as { seconds: unknown }).seconds === "number"
    ) {
      date = new Date((ts as { seconds: number }).seconds * 1000);
    } else if (typeof ts === "string") {
      date = new Date(ts);
    } else if (typeof ts === "number") {
      date = new Date(ts);
    } else {
      return "—";
    }
    if (isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return "—";
  }
}


const TABLE_COLS = "2fr 1fr 1fr 1fr 80px";

function MembersTableSkeleton() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="hidden md:grid items-center border-b border-[var(--surface-hover)] last:border-b-0 bg-[var(--surface-card)]"
          style={{ gridTemplateColumns: TABLE_COLS, minHeight: 56, padding: "12px 16px" }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-full bg-[var(--surface-hover)] animate-pulse shrink-0" />
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <div className="h-[14px] bg-[var(--surface-hover)] animate-pulse rounded" style={{ width: "75%" }} />
              <div className="h-[12px] bg-[var(--surface-hover)] animate-pulse rounded" style={{ width: "50%" }} />
            </div>
          </div>
          <div className="h-[14px] w-16 bg-[var(--surface-hover)] animate-pulse rounded" />
          <div className="h-[14px] w-24 bg-[var(--surface-hover)] animate-pulse rounded" />
          <div className="h-[14px] w-14 bg-[var(--surface-hover)] animate-pulse rounded" />
          <div />
        </div>
      ))}
      {[0, 1, 2].map((i) => (
        <div
          key={`m${i}`}
          className="md:hidden p-4 border-b border-[var(--surface-hover)] last:border-b-0 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--surface-hover)] shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-[var(--surface-hover)] rounded w-32" />
              <div className="h-2.5 bg-[var(--surface-hover)] rounded w-44" />
            </div>
            <div className="h-5 bg-[var(--surface-hover)] rounded-full w-14" />
          </div>
        </div>
      ))}
    </>
  );
}

function MembersTableRow({
  row,
  isWorkspaceOwner,
  onRemove,
  onRevoke,
  onResend,
  confirmingRemoveId,
  setConfirmingRemoveId,
}: {
  row: UnifiedMemberRow;
  isWorkspaceOwner: boolean;
  onRemove: (id: string, label: string) => void;
  onRevoke: (token: string, email: string) => void;
  onResend: (token: string, email: string) => void;
  confirmingRemoveId: string | null;
  setConfirmingRemoveId: (id: string | null) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isOwner = row.role === "OWNER";
  const confirming = confirmingRemoveId === row.id;

  const avatarNode =
    row.status === "active" ? (
      <UserAvatar
        avatarUrl={row.avatarUrl}
        name={row.name ?? row.email}
        size={32}
        colorSeed={row.id}
      />
    ) : (
      <span
        className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center"
        style={{ background: "var(--surface-hover)", border: "1.5px dashed var(--border-strong)" }}
      >
        <Mail size={14} color="var(--text-placeholder)" />
      </span>
    );

  const nameBlock =
    row.status === "active" ? (
      row.name ? (
        <div className="min-w-0">
          <p
            className="text-[14px] font-medium text-[var(--text-heading)] truncate"
            style={{ lineHeight: "1.3" }}
          >
            {row.name}
          </p>
          <p className="text-[14px] text-[var(--text-secondary)] truncate" style={{ marginTop: 1 }}>
            {row.email}
          </p>
        </div>
      ) : (
        <p className="text-[14px] font-medium text-[var(--text-heading)] truncate min-w-0">{row.email}</p>
      )
    ) : (
      <div className="min-w-0">
        <p className="text-[14px] text-[var(--text-tertiary)] italic" style={{ lineHeight: "1.3" }}>
          Invited
        </p>
        <p className="text-[14px] text-[var(--text-secondary)] truncate" style={{ marginTop: 1 }}>
          {row.email}
        </p>
      </div>
    );

  const roleBadge = (
    <span className={row.status === "pending" ? "text-sm font-semibold text-[var(--text-heading)]/50" : "text-sm font-semibold text-[var(--text-heading)]"}>
      {row.role === "OWNER" ? "Owner" : "Member"}
    </span>
  );

  const statusBadge =
    row.status === "active" ? (
      <span className="text-sm font-semibold text-[var(--text-heading)]">Active</span>
    ) : (
      <span className="text-sm font-semibold text-[var(--text-heading)]/50">Pending</span>
    );

  const removeConfirm = (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => setConfirmingRemoveId(null)}
        className="text-[14px] text-[var(--text-secondary)] hover:text-[var(--text-heading)] transition-colors px-1"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={() => onRemove(row.id, row.name ?? row.email)}
        className="text-[14px] text-[var(--color-danger)]"
        style={{
          background: "var(--color-danger-bg)",
          border: "1px solid var(--color-danger-border)",
          borderRadius: 6,
          padding: "4px 10px",
        }}
      >
        Remove
      </button>
    </div>
  );

  const actionsDesktop = (
    <div
      className="flex items-center justify-end gap-1"
      style={{ opacity: hovered ? 1 : 0, transition: "opacity 120ms" }}
    >
      {row.status === "active" && !isOwner && isWorkspaceOwner && (
        confirming ? removeConfirm : (
          <Tooltip content="Remove member">
            <button
              type="button"
              onClick={() => setConfirmingRemoveId(row.id)}
              className="w-[30px] h-[30px] flex items-center justify-center rounded-[var(--radius-xs)] text-[var(--text-tertiary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-colors"
            >
              <UserMinus size={15} />
            </button>
          </Tooltip>
        )
      )}
      {row.status === "pending" && isWorkspaceOwner && (
        <div className="flex items-center gap-1">
          <Tooltip content="Resend invite">
            <button
              type="button"
              onClick={() => onResend(row.invitationToken!, row.email)}
              className="w-[30px] h-[30px] flex items-center justify-center rounded-[var(--radius-xs)] text-[var(--text-tertiary)] hover:text-[var(--brand)] hover:bg-[var(--brand-subtle)] transition-colors"
            >
              <RotateCcw size={14} />
            </button>
          </Tooltip>
          <Tooltip content="Revoke invite">
            <button
              type="button"
              onClick={() => onRevoke(row.invitationToken!, row.email)}
              className="w-[30px] h-[30px] flex items-center justify-center rounded-[var(--radius-xs)] text-[var(--text-tertiary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-colors"
            >
              <X size={14} />
            </button>
          </Tooltip>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop row */}
      <div
        className="hidden md:grid items-center border-b border-[var(--surface-hover)] last:border-b-0 cursor-pointer transition-colors"
        style={{
          gridTemplateColumns: TABLE_COLS,
          minHeight: 56,
          padding: "12px 16px",
          background: row.status === "pending" ? "var(--surface-card)" : hovered ? "var(--surface-input)" : "white",
          transition: "background 120ms ease",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {avatarNode}
          {nameBlock}
        </div>
        <div>{roleBadge}</div>
        <div className={row.status === "pending" ? "text-sm font-semibold text-[var(--text-heading)]/50" : "text-sm font-semibold text-[var(--text-heading)]"}>{formatDateAdded(row.joinedAt)}</div>
        <div>{statusBadge}</div>
        {actionsDesktop}
      </div>

      {/* Mobile card */}
      <div
        className="md:hidden p-4 border-b border-[var(--surface-hover)] last:border-b-0"
        style={{ background: row.status === "pending" ? "var(--surface-card)" : "white" }}
      >
        <div className="flex items-center gap-3">
          {avatarNode}
          <div className="flex-1 min-w-0">
            {row.status === "active" ? (
              row.name ? (
                <>
                  <p className="text-sm font-medium text-[var(--text-heading)] truncate">{row.name}</p>
                  <p className="text-[14px] text-[var(--text-secondary)] truncate">{row.email}</p>
                </>
              ) : (
                <p className="text-sm font-medium text-[var(--text-heading)] truncate">{row.email}</p>
              )
            ) : (
              <>
                <p className="text-[14px] text-[var(--text-tertiary)] italic">Invited</p>
                <p className="text-[14px] text-[var(--text-secondary)] truncate">{row.email}</p>
              </>
            )}
          </div>
          {statusBadge}
        </div>
        <div className="flex items-center gap-3 mt-2 pl-11">
          {roleBadge}
          <span className="text-[12px] text-[var(--text-tertiary)]">{formatDateAdded(row.joinedAt)}</span>
        </div>
        {row.status === "active" && !isOwner && isWorkspaceOwner && (
          <div className="flex items-center gap-2 mt-2 pl-11">
            {confirming ? (
              removeConfirm
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingRemoveId(row.id)}
                className="flex items-center gap-1.5 text-[14px] text-[var(--text-tertiary)] hover:text-[var(--color-danger)] transition-colors"
              >
                <UserMinus size={13} />
                Remove
              </button>
            )}
          </div>
        )}
        {row.status === "pending" && isWorkspaceOwner && (
          <div className="flex items-center gap-3 mt-2 pl-11">
            <button
              type="button"
              onClick={() => onResend(row.invitationToken!, row.email)}
              className="flex items-center gap-1 text-[14px] text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors"
            >
              <RotateCcw size={12} />
              Resend
            </button>
            <button
              type="button"
              onClick={() => onRevoke(row.invitationToken!, row.email)}
              className="flex items-center gap-1 text-[14px] text-[var(--text-secondary)] hover:text-[var(--color-danger)] transition-colors"
            >
              <X size={12} />
              Revoke
            </button>
          </div>
        )}
      </div>
    </>
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

  const [rows, setRows] = useState<UnifiedMemberRow[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "OWNER" | "MEMBER">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending">("all");
  const [totalMembers, setTotalMembers] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [confirmingRemoveId, setConfirmingRemoveId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(msg: string) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  }

  const fetchAll = useCallback(() => {
    if (!workspaceId) return;
    setDataLoading(true);
    setFetchError(null);
    authFetch("/api/workspace/members/all")
      .then(async (res) => {
        if (!res?.ok) { setFetchError("Failed to load members."); return; }
        const json = await res.json() as {
          success: boolean;
          data?: { rows: UnifiedMemberRow[]; totalMembers: number; totalPending: number };
        };
        if (json.success && json.data) {
          setRows(json.data.rows);
          setTotalMembers(json.data.totalMembers);
          setTotalPending(json.data.totalPending);
        } else {
          setFetchError("Failed to load members.");
        }
      })
      .catch(() => setFetchError("Failed to load members."))
      .finally(() => setDataLoading(false));
  }, [workspaceId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    return () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); };
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = row.name?.toLowerCase().includes(q) ?? false;
        const matchEmail = row.email.toLowerCase().includes(q);
        if (!matchName && !matchEmail) return false;
      }
      if (roleFilter !== "all" && row.role !== roleFilter) return false;
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      return true;
    });
  }, [rows, search, roleFilter, statusFilter]);

  async function handleRemove(uid: string, label: string) {
    setConfirmingRemoveId(null);
    const res = await authFetch(`/api/workspace/members/${uid}`, { method: "DELETE" });
    if (res?.ok) {
      showToast(`${label} removed from workspace`);
      fetchAll();
    }
  }

  async function handleRevoke(token: string, _email?: string) {
    const res = await authFetch(`/api/workspace/members/invitations/${token}`, { method: "DELETE" });
    if (res?.ok) {
      showToast("Invitation revoked");
      fetchAll();
    }
  }

  async function handleResend(token: string, email: string) {
    const res = await authFetch(`/api/workspace/members/invitations/${token}/resend`, { method: "POST" });
    if (res?.ok) showToast(`Invitation resent to ${email}`);
  }

  function handleInviteSent(inv: SerializedInvitation) {
    setInviteModalOpen(false);
    showToast(`Invitation sent to ${inv.email}`);
    fetchAll();
  }

  const isLoading = loading || dataLoading;

  return (
    <div className="pb-16 ech-content-enter">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-lg bg-[var(--text-heading)] text-white text-sm font-medium shadow-lg pointer-events-none whitespace-nowrap">
          {toast}
        </div>
      )}

      {/* Header Row 1: Title + CTA */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-heading)", lineHeight: "1.3" }}>
            Members
          </h2>
          <p className="text-sm font-medium text-[var(--text-heading)]/60" style={{ marginTop: 4, fontSize: 15, fontWeight: 500 }}>
            {totalMembers} member{totalMembers !== 1 ? "s" : ""}
            {totalPending > 0 && ` · ${totalPending} pending`}
          </p>
        </div>
        {isWorkspaceOwner && (
          <button
            type="button"
            onClick={() => setInviteModalOpen(true)}
            className={`${BTN_PRIMARY} flex items-center gap-1.5 shrink-0`}
            style={{ height: 36 }}
          >
            <UserPlus size={15} aria-hidden />
            Invite member
          </button>
        )}
      </div>

      {/* Header Row 2: Search + Filters */}
      <div className="flex items-center flex-wrap gap-[10px]" style={{ marginTop: 16 }}>
        <div className="relative" style={{ flex: 1, minWidth: 180 }}>
          <span className="absolute inset-y-0 left-[11px] flex items-center pointer-events-none text-[var(--text-heading)]/50">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            className="w-full outline-none placeholder:text-[var(--text-heading)]/50"
            style={{
              height: 36,
              background: "var(--surface-subtle)",
              border: "1.5px solid var(--border)",
              borderRadius: 10,
              padding: "0 12px 0 34px",
              fontSize: 14,
              color: "var(--text-heading)",
              transition: "border-color 150ms, box-shadow 150ms",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--brand)";
              e.target.style.boxShadow = "0 0 0 3px rgba(90,73,191,0.10)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--border)";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as "all" | "OWNER" | "MEMBER")}
          className="outline-none cursor-pointer"
          style={{
            height: 36,
            width: 130,
            background: "white",
            border: "1.5px solid var(--border)",
            borderRadius: 10,
            padding: "0 10px",
            fontSize: 14,
            color: "var(--text-body)",
          }}
        >
          <option value="all">All roles</option>
          <option value="OWNER">Owner</option>
          <option value="MEMBER">Member</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "pending")}
          className="outline-none cursor-pointer"
          style={{
            height: 36,
            width: 150,
            background: "white",
            border: "1.5px solid var(--border)",
            borderRadius: 10,
            padding: "0 10px",
            fontSize: 14,
            color: "var(--text-body)",
          }}
        >
          <option value="all">All members</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Table */}
      <div
        style={{
          marginTop: 16,
          border: "1px solid var(--border)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {/* Table header — desktop only */}
        <div
          className="hidden md:grid"
          style={{
            gridTemplateColumns: TABLE_COLS,
            height: 38,
            background: "var(--surface-subtle)",
            borderBottom: "1px solid var(--border)",
            padding: "0 16px",
            alignItems: "center",
          }}
        >
          <span className="text-sm font-semibold text-[var(--text-heading)]">NAME</span>
          <span className="text-sm font-semibold text-[var(--text-heading)]">ROLE</span>
          <span className="text-sm font-semibold text-[var(--text-heading)]">DATE ADDED</span>
          <span className="text-sm font-semibold text-[var(--text-heading)]">STATUS</span>
          <span />
        </div>

        {/* Table body */}
        {isLoading ? (
          <MembersTableSkeleton />
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <AlertCircle className="h-7 w-7 text-[var(--text-tertiary)]" />
            <p className="text-sm text-[var(--text-secondary)]">{fetchError}</p>
            <button type="button" onClick={fetchAll} className={BTN_SECONDARY}>
              Try again
            </button>
          </div>
        ) : !search.trim() && roleFilter === "all" && statusFilter === "all" && totalMembers === 1 && totalPending === 0 ? (
          <div className="flex flex-col items-center justify-center text-center" style={{ padding: "40px 24px" }}>
            <div style={{ width: 160, height: 140, marginBottom: 20 }}>
              <svg viewBox="0 0 200 160" width="100%" height="100%" style={{ overflow: "visible" }}>
                <g transform="translate(100 80) rotate(-6) translate(-46 -30)">
                  <rect width="92" height="60" rx="12" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
                  <circle cx="20" cy="20" r="7" fill="#D1D5DB" />
                  <rect x="32" y="14" width="44" height="5" rx="2.5" fill="#E5E7EB" />
                  <rect x="32" y="24" width="32" height="4" rx="2" fill="#F3F4F6" />
                  <rect x="14" y="40" width="64" height="4" rx="2" fill="#F3F4F6" />
                </g>
                <g transform="translate(100 80) rotate(8) translate(-46 -16)">
                  <rect width="92" height="32" rx="10" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1.5" />
                  <circle cx="20" cy="16" r="5" fill="#E5E7EB" />
                  <rect x="30" y="14" width="40" height="4" rx="2" fill="#E5E7EB" opacity="0.7" />
                </g>
                <g transform="translate(146 112)">
                  <circle cx="17" cy="17" r="14" fill="#6B7280" />
                  <circle cx="14" cy="15" r="2.5" fill="#fff" />
                  <circle cx="21" cy="16" r="2" fill="#fff" />
                  <path d="M9 23 Q9 18 14 18 Q19 18 19 23" fill="#fff" />
                  <path d="M19 23 Q19 20 22 20 Q26 20 26 23" fill="#fff" />
                </g>
              </svg>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-heading)", letterSpacing: "-0.005em", margin: "0 0 6px 0" }}>
              You&apos;re the only member
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, maxWidth: 260, margin: "0 0 16px 0" }}>
              Invite teammates to collaborate on sessions and feedback.
            </p>
            {isWorkspaceOwner && (
              <button
                type="button"
                onClick={() => setInviteModalOpen(true)}
                className={BTN_PRIMARY}
                style={{ height: 34 }}
              >
                Invite teammates
              </button>
            )}
          </div>
        ) : !search.trim() && roleFilter === "all" && statusFilter === "pending" && totalPending === 0 ? (
          <div className="flex flex-col items-center justify-center text-center" style={{ padding: "40px 24px" }}>
            <div style={{ width: 160, height: 140, marginBottom: 20 }}>
              <svg viewBox="0 0 200 160" width="100%" height="100%" style={{ overflow: "visible" }}>
                <g transform="translate(100 80) rotate(-3) translate(-44 -28)">
                  <rect width="88" height="56" rx="6" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
                  <path d="M0 0 L44 32 L88 0" fill="none" stroke="#D1D5DB" strokeWidth="1.5" />
                </g>
                <g transform="translate(146 112)">
                  <circle cx="17" cy="17" r="14" fill="#6B7280" />
                  <path d="M11 17 L15.5 22 L24 12" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              </svg>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-heading)", letterSpacing: "-0.005em", margin: "0 0 6px 0" }}>
              No pending invitations
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, maxWidth: 260, margin: 0 }}>
              All invitations have been accepted or expired.
            </p>
          </div>
        ) : filteredRows.length === 0 ? (
          rows.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <p style={{ fontSize: 14, color: "var(--text-tertiary)" }}>No team members found</p>
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center gap-[10px]"
              style={{ padding: "32px 0" }}
            >
              <Users size={32} color="var(--border-strong)" />
              <p style={{ fontSize: 14, color: "var(--text-tertiary)" }}>No members match your search</p>
              <button
                type="button"
                onClick={() => { setSearch(""); setRoleFilter("all"); setStatusFilter("all"); }}
                style={{ color: "var(--brand)", cursor: "pointer", fontSize: 14 }}
              >
                Clear filters
              </button>
            </div>
          )
        ) : (
          filteredRows.map((row) => (
            <MembersTableRow
              key={row.id}
              row={row}
              isWorkspaceOwner={isWorkspaceOwner}
              onRemove={handleRemove}
              onRevoke={handleRevoke}
              onResend={handleResend}
              confirmingRemoveId={confirmingRemoveId}
              setConfirmingRemoveId={setConfirmingRemoveId}
            />
          ))
        )}
      </div>

      <InviteMemberModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onInviteSent={(inv) => handleInviteSent(inv as SerializedInvitation)}
      />
    </div>
  );
}

/* ——— Security tab ——— */
function SecurityTab() {
  const router = useRouter();
  const { isWorkspaceOwner, workspaceName, authEmail } = useWorkspace();
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Auth provider — gates the Password card (Google users have no password to reset)
  const [authProvider, setAuthProvider] = useState<"google" | "password" | "unknown">("unknown");
  useEffect(() => {
    void (async () => {
      try {
        const res = await authFetch("/api/users");
        if (res?.ok) {
          const json = await res.json() as { success: boolean; data?: { authProvider: "google" | "password" | "unknown" } };
          if (json.success && json.data?.authProvider) {
            setAuthProvider(json.data.authProvider);
          }
        }
      } catch { /* non-fatal */ }
    })();
  }, []);

  // Reset password state
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [resetPasswordSending, setResetPasswordSending] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null);
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false);

  async function handleResetPasswordSubmit() {
    if (!authEmail) { setResetPasswordError("No email on file. Try again later."); return; }
    setResetPasswordError(null);
    setResetPasswordSending(true);
    try {
      const res = await authFetch("/api/users/send-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail }),
      });
      if (!res?.ok) {
        const json = await res?.json().catch(() => null) as { error?: { message: string } } | null;
        setResetPasswordError(json?.error?.message ?? "Failed to send reset email. Try again.");
        return;
      }
      setResetPasswordModalOpen(false);
      setResetPasswordSuccess(true);
      setTimeout(() => setResetPasswordSuccess(false), 5000);
    } catch {
      setResetPasswordError("Failed to send reset email. Try again.");
    } finally {
      setResetPasswordSending(false);
    }
  }

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

  // Leave workspace state (non-owner self-leave)
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveConfirmName, setLeaveConfirmName] = useState("");
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const leaveConfirmInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (leaveModalOpen) setTimeout(() => leaveConfirmInputRef.current?.focus(), 50);
  }, [leaveModalOpen]);

  async function handleLeaveSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (leaveConfirmName !== workspaceName) { setLeaveError("Workspace name does not match."); return; }
    setLeaveError(null);
    setLeaveSubmitting(true);
    try {
      const res = await authFetch("/api/workspace/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res) { setLeaveError("Request failed. Try again."); return; }
      const json = await res.json() as { success: boolean; data?: { newActiveWorkspaceId: string | null }; error?: { message: string } };
      if (!res.ok || !json.success) {
        setLeaveError(json.error?.message ?? "Failed to leave workspace. Try again.");
        return;
      }
      // Custom claims changed server-side; refresh the Firebase ID token and
      // drop the authFetch cache so subsequent requests carry the new claims.
      try {
        const { auth } = await import("@/lib/firebase");
        if (auth.currentUser) {
          await auth.currentUser.getIdToken(true);
        }
      } catch { /* non-fatal */ }
      clearAuthTokenCache();
      setLeaveModalOpen(false);
      // Hard navigate so the workspace context fully resets — same pattern as
      // workspace switch flows. If no remaining workspaces, land on onboarding.
      const nextWs = json.data?.newActiveWorkspaceId ?? null;
      window.location.href = nextWs ? "/" : "/onboarding";
    } catch {
      setLeaveError("Failed to leave workspace. Try again.");
    } finally {
      setLeaveSubmitting(false);
    }
  }

  return (
    <div className={CARD_GAP}>
      {transferSuccess && (
        <div className="rounded-xl px-4 py-3 bg-[var(--brand-subtle)] border border-[var(--brand-muted)] text-sm font-medium text-[var(--brand-text)]">
          You are now a member of this workspace.
        </div>
      )}
      {resetPasswordSuccess && (
        <div className="rounded-xl px-4 py-3 bg-[var(--color-success-bg)] border border-[var(--color-success)]/30 text-sm font-medium text-[var(--color-success)]">
          Password reset email sent. Check your inbox.
        </div>
      )}
      {authProvider === "password" ? (
        <Card className={SETTINGS_CARD} as="article">
          <SectionHeader
            title="Password"
            description="Manage your password."
          />
          <div className="mt-4 pt-4 border-t border-[var(--border-default)]">
            <div className="flex flex-wrap items-center justify-between gap-4 py-1">
              <div className="min-w-0">
                <p className="text-[15px] font-medium text-[var(--text-heading)]">Reset Password</p>
                <p className={SETTING_DESC}>Send a password reset link to your email.</p>
              </div>
              <Button
                variant="secondary"
                className={`${BTN_SECONDARY} shrink-0`}
                onClick={() => { setResetPasswordError(null); setResetPasswordModalOpen(true); }}
              >
                Reset Password
              </Button>
            </div>
          </div>
        </Card>
      ) : authProvider === "google" ? (
        <Card className={SETTINGS_CARD} as="article">
          <SectionHeader
            title="Password"
            description="Manage your password."
          />
          <div className="mt-4 pt-4 border-t border-[var(--border-default)]">
            <div className="flex flex-wrap items-center justify-between gap-4 py-1">
              <div className="flex items-center gap-3 min-w-0">
                <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden className="shrink-0">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <div className="min-w-0">
                  <p className="text-[15px] font-medium text-[var(--text-heading)]">
                    Signed in with Google
                  </p>
                  <p className={SETTING_DESC}>
                    Your password is managed by your Google account.
                  </p>
                </div>
              </div>
              <a
                href="https://myaccount.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`${BTN_SECONDARY} shrink-0`}
              >
                Manage Google account ↗
              </a>
            </div>
          </div>
        </Card>
      ) : null}

      {/* Collapsible Danger Zone */}
      <Card className={SETTINGS_CARD} as="article">
        <button
          type="button"
          onClick={() => setAdvancedOpen(!advancedOpen)}
          className="w-full flex items-center justify-between gap-3 text-left rounded-lg py-2 -my-2 px-2 -mx-2 hover:bg-[var(--surface-hover)]/80 transition-colors duration-200"
          aria-expanded={advancedOpen}
        >
          <span className={SECTION_TITLE}>Danger Zone</span>
          <span className="text-[var(--text-secondary)] shrink-0" aria-hidden>
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
                  <p className="text-[15px] font-medium text-[var(--text-heading)]">Transfer Workspace Ownership</p>
                  <p className={SETTING_DESC}>Assign another member as the workspace owner.</p>
                </div>
                <button
                  type="button"
                  onClick={openTransferModal}
                  className="rounded-[var(--radius-btn)] px-4 py-2.5 text-sm font-semibold shrink-0 bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border border-[var(--color-warning-border)] hover:bg-[var(--color-warning-bg)] transition-all duration-200"
                >
                  Transfer
                </button>
              </div>
            )}
            {isWorkspaceOwner && (
              <div className="flex items-center justify-between gap-4 flex-wrap pt-5 border-t border-[var(--border-default)]">
                <div>
                  <p className="text-[15px] font-semibold text-[var(--text-heading)]">Delete Workspace</p>
                  <p className={SETTING_DESC}>Permanently delete this workspace and all its data. This cannot be undone.</p>
                </div>
                <button
                  type="button"
                  className="rounded-[var(--radius-btn)] px-4 py-2.5 text-sm font-semibold shrink-0 bg-[var(--color-danger)] text-white hover:opacity-95 hover:shadow-[0_2px_8px_rgba(229,72,77,0.35)] transition-all duration-200"
                  onClick={() => { setDeleteConfirmName(""); setDeleteError(null); setDeleteModalOpen(true); }}
                >
                  Delete Workspace
                </button>
              </div>
            )}
            {!isWorkspaceOwner && (
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-[15px] font-semibold text-[var(--text-heading)]">Leave Workspace</p>
                  <p className={SETTING_DESC}>Remove yourself from this workspace. You&apos;ll lose access to all of its sessions and feedback.</p>
                </div>
                <button
                  type="button"
                  className="rounded-[var(--radius-btn)] px-4 py-2.5 text-sm font-semibold shrink-0 bg-[var(--color-danger)] text-white hover:opacity-95 hover:shadow-[0_2px_8px_rgba(229,72,77,0.35)] transition-all duration-200"
                  onClick={() => { setLeaveConfirmName(""); setLeaveError(null); setLeaveModalOpen(true); }}
                >
                  Leave Workspace
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Transfer ownership modal */}
      {transferModalOpen && (
        <ModalPortal>
        <div
          className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 cursor-pointer"
          style={{ zIndex: MODAL_LAYER_Z_INDEX }}
          onClick={() => setTransferModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="transfer-modal-title"
        >
          <div
            className="rounded-2xl shadow-lg bg-white p-6 max-w-md w-full cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="transfer-modal-title" className="text-[20px] font-semibold text-[var(--text-heading)]">
              Transfer Ownership
            </h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              You will become a regular member after this action.
            </p>
            <form onSubmit={handleTransferSubmit} className="mt-4 space-y-4">
              <div>
                <label htmlFor="transfer-new-owner" className="block text-sm font-medium text-[var(--text-body)] mb-1">
                  Transfer to
                </label>
                {transferMembersLoading ? (
                  <p className="text-sm text-[var(--text-secondary)]">Loading members…</p>
                ) : transferMembers.length === 0 ? (
                  <p className="text-sm text-[var(--text-secondary)]">No other members to transfer to. Invite a member first.</p>
                ) : (
                  <select
                    id="transfer-new-owner"
                    value={selectedNewOwnerUid}
                    onChange={(e) => setSelectedNewOwnerUid(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-heading)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
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
                <label htmlFor="transfer-confirm-name" className="block text-sm font-medium text-[var(--text-body)] mb-1">
                  Type <strong>{workspaceName}</strong> to confirm
                </label>
                <input
                  ref={transferConfirmInputRef}
                  id="transfer-confirm-name"
                  type="text"
                  placeholder={workspaceName ?? ""}
                  value={transferConfirmName}
                  onChange={(e) => setTransferConfirmName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-heading)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
                />
                {transferError && <p className="mt-1.5 text-sm text-[var(--color-danger)]">{transferError}</p>}
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setTransferModalOpen(false)}
                  className={BTN_SECONDARY}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transferSubmitting || transferMembers.length === 0}
                  className={BTN_PRIMARY}
                >
                  {transferSubmitting ? "Transferring…" : "Transfer Ownership"}
                </button>
              </div>
            </form>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* Reset password modal */}
      {resetPasswordModalOpen && (
        <ModalPortal>
        <div
          className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 cursor-pointer"
          style={{ zIndex: MODAL_LAYER_Z_INDEX }}
          onClick={() => !resetPasswordSending && setResetPasswordModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-password-title"
        >
          <div
            className="rounded-2xl shadow-lg bg-white p-6 max-w-md w-full cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="reset-password-title" className="text-[20px] font-semibold text-[var(--text-heading)]">
              Reset Password
            </h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              We&apos;ll send a password reset link to{" "}
              <strong className="text-[var(--text-heading)]">{authEmail ?? "your email"}</strong>.
              {" "}Click the link in the email to set a new password.
            </p>
            {resetPasswordError && (
              <p className="mt-3 text-sm text-[var(--color-danger)]">{resetPasswordError}</p>
            )}
            <div className="flex justify-end gap-2 pt-5">
              <button
                type="button"
                onClick={() => setResetPasswordModalOpen(false)}
                disabled={resetPasswordSending}
                className={BTN_SECONDARY}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleResetPasswordSubmit()}
                disabled={resetPasswordSending}
                className={BTN_PRIMARY}
              >
                {resetPasswordSending ? "Sending…" : "Send Reset Email"}
              </button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* Delete workspace modal */}
      {deleteModalOpen && (
        <ModalPortal>
        <div
          className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 cursor-pointer"
          style={{ zIndex: MODAL_LAYER_Z_INDEX }}
          onClick={() => setDeleteModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-workspace-title"
        >
          <div
            className="rounded-2xl shadow-lg bg-white p-6 max-w-md w-full cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="delete-workspace-title" className="text-[20px] font-semibold text-[var(--text-heading)]">
              Delete workspace?
            </h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              This will schedule permanent deletion in 30 days. All sessions, feedback, and members will be removed.
            </p>
            <form onSubmit={handleDeleteSubmit} className="mt-4 space-y-3">
              <div>
                <label htmlFor="delete-confirm-name" className="block text-sm font-medium text-[var(--text-body)] mb-1">
                  Type <strong>{workspaceName}</strong> to confirm
                </label>
                <input
                  ref={deleteConfirmInputRef}
                  id="delete-confirm-name"
                  type="text"
                  placeholder={workspaceName ?? ""}
                  value={deleteConfirmName}
                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-heading)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-danger)] focus:border-transparent"
                />
                {deleteError && <p className="mt-1.5 text-sm text-[var(--color-danger)]">{deleteError}</p>}
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  className={BTN_SECONDARY}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteSubmitting || deleteConfirmName !== workspaceName}
                  className={`inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border-none text-[14px] font-medium transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${
                    deleteConfirmName === workspaceName
                      ? "bg-[var(--color-danger)] text-white hover:opacity-95"
                      : "bg-[var(--surface-hover)] text-[var(--text-tertiary)] disabled:opacity-100"
                  }`}
                >
                  {deleteSubmitting ? "Deleting…" : "Schedule Deletion"}
                </button>
              </div>
            </form>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* Leave workspace modal (non-owner) */}
      {leaveModalOpen && (
        <ModalPortal>
        <div
          className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 cursor-pointer"
          style={{ zIndex: MODAL_LAYER_Z_INDEX }}
          onClick={() => !leaveSubmitting && setLeaveModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="leave-workspace-title"
        >
          <div
            className="rounded-2xl shadow-lg bg-white p-6 max-w-md w-full cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="leave-workspace-title" className="text-[20px] font-semibold text-[var(--text-heading)]">
              Leave workspace?
            </h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              You&apos;ll lose access to all sessions and feedback in <strong className="text-[var(--text-heading)]">{workspaceName}</strong>. The workspace owner can re-invite you later.
            </p>
            <form onSubmit={handleLeaveSubmit} className="mt-4 space-y-3">
              <div>
                <label htmlFor="leave-confirm-name" className="block text-sm font-medium text-[var(--text-body)] mb-1">
                  Type <strong>{workspaceName}</strong> to confirm
                </label>
                <input
                  ref={leaveConfirmInputRef}
                  id="leave-confirm-name"
                  type="text"
                  placeholder={workspaceName ?? ""}
                  value={leaveConfirmName}
                  onChange={(e) => setLeaveConfirmName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-heading)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-danger)] focus:border-transparent"
                />
                {leaveError && <p className="mt-1.5 text-sm text-[var(--color-danger)]">{leaveError}</p>}
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setLeaveModalOpen(false)}
                  disabled={leaveSubmitting}
                  className={BTN_SECONDARY}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={leaveSubmitting || leaveConfirmName !== workspaceName}
                  className={`inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border-none text-[14px] font-medium transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${
                    leaveConfirmName === workspaceName
                      ? "bg-[var(--color-danger)] text-white hover:opacity-95"
                      : "bg-[var(--surface-hover)] text-[var(--text-tertiary)] disabled:opacity-100"
                  }`}
                >
                  {leaveSubmitting ? "Leaving…" : "Leave Workspace"}
                </button>
              </div>
            </form>
          </div>
        </div>
        </ModalPortal>
      )}
    </div>
  );
}

const INTEGRATIONS: { id: string; name: string; logoSrc: string; description: string; pro: boolean }[] = [
  { id: "slack", name: "Slack", logoSrc: "/assets/integrations/slack.svg", description: "Receive feedback notifications in Slack.", pro: true },
  { id: "linear", name: "Linear", logoSrc: "/assets/integrations/linear.svg", description: "Sync feedback and tickets with Linear.", pro: true },
  { id: "jira", name: "Jira", logoSrc: "/assets/integrations/jira.svg", description: "Link Annote feedback to Jira issues.", pro: true },
  { id: "zapier", name: "Zapier", logoSrc: "/assets/integrations/zapier.svg", description: "Connect Annote to thousands of apps with Zapier.", pro: true },
];

function IntegrationsTab({ onNavigateToBilling }: { onNavigateToBilling: () => void }) {
  return (
    <div className={CARD_GAP}>
      <SectionHeader
        title="Integrations"
        description="Connect Annote with your existing tools."
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
                  <h3 className="text-[18px] font-semibold text-[var(--text-heading)]">{name}</h3>
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

/* ════════════════════════════════════════════════════════════════════
   PHASE E · SURFACE 1 — Settings → Billing (two-view)
   Owner sees View A (Plans & Pricing) on Starter or View B (Billing
   management) on Business/comp'd; non-owners get a read-only card. The
   D2 suspended inline card stays at the top of either owner view.
   Token-based, lucide-react, skeleton loading.
   ════════════════════════════════════════════════════════════════════ */

const BILLING_CONTAINER = "w-full";

function BillingTab() {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);
  const { plans, loading: catalogLoading, error: catalogError } =
    usePlanCatalog();
  const { isWorkspaceOwner } = useWorkspace();
  // The Firestore workspace doc is the source of truth for plan, seats,
  // cycle, suspension, comp, and the card on file. Always loaded on this page.
  const { workspace: realtimeWorkspace } = useWorkspaceRealtimeStore();
  const billing = realtimeWorkspace?.billing;
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("upgraded") === "true") setBillingError(null);
  }, [searchParams]);

  async function handleCheckout(cycle: "monthly" | "annual", seatCount?: number) {
    if (!isWorkspaceOwner) return;
    setBillingError(null);
    setCheckoutLoading(true);
    try {
      await openUpgradeCheckout({ billingCycle: cycle, seatCount });
      // Redirecting to Stripe — no further state change needed.
    } catch (err) {
      console.error("[billing tab] failed to start checkout:", err);
      setBillingError(
        err instanceof Error ? err.message : "Failed to start checkout. Try again."
      );
      setCheckoutLoading(false);
    }
  }

  async function handleManageBilling() {
    if (!isWorkspaceOwner) return;
    setBillingError(null);
    setPortalLoading(true);
    try {
      const res = await authFetch("/api/billing/portal", { method: "POST" });
      if (!res) {
        setBillingError("Request failed. Try again.");
        return;
      }
      const json = (await res.json()) as {
        success: boolean;
        data?: { portalUrl: string };
        error?: { message: string };
      };
      if (!res.ok || !json.success || !json.data?.portalUrl) {
        setBillingError(
          json.error?.message ??
            "Couldn't open the billing portal. Try again."
        );
        return;
      }
      window.location.href = json.data.portalUrl;
    } catch {
      setBillingError("Couldn't open the billing portal. Try again.");
    } finally {
      setPortalLoading(false);
    }
  }

  // ── Catalog lookups (shared by both views) ──────────────────────────
  const starterCatalog = useMemo(
    () => plans?.find((p) => p.id === "starter") ?? null,
    [plans]
  );
  const businessCatalog = useMemo(
    () => plans?.find((p) => p.id === "business") ?? null,
    [plans]
  );
  const enterpriseCatalog = useMemo(
    () => plans?.find((p) => p.id === "enterprise") ?? null,
    [plans]
  );

  // Effective per-seat price for View B's current-plan card.
  const billingCycle = billing?.billingCycle === "annual" ? "annual" : "monthly";
  const perSeatPrice = useMemo(() => {
    if (!businessCatalog) return null;
    if (billingCycle === "annual") {
      return (
        businessCatalog.annualPricePerSeat ?? businessCatalog.pricePerSeat
      );
    }
    return businessCatalog.pricePerSeat;
  }, [businessCatalog, billingCycle]);

  // ── Loading / error gates ───────────────────────────────────────────
  const hasError =
    Boolean(catalogError) || (!catalogLoading && (!plans || plans.length === 0));

  if (hasError) {
    return (
      <div className={`flex flex-col ${BILLING_CONTAINER} pb-20`}>
        <div
          className="mx-auto mt-12 flex max-w-md flex-col items-center rounded-[var(--radius-lg)] border p-8 text-center"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <AlertCircle
            size={28}
            aria-hidden
            style={{ color: "var(--color-danger)" }}
          />
          <h3
            className="mt-3 text-lg font-semibold"
            style={{ color: "var(--text-heading)" }}
          >
            Couldn&apos;t load billing info
          </h3>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Something went wrong on our end. Try again in a moment.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 inline-flex h-[38px] items-center rounded-[var(--radius-btn)] px-5 text-sm font-semibold text-white"
            style={{ background: "var(--brand)" }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Skeleton ONLY on a genuine first load — when we have no data at all yet.
  // Scoped to BillingTab (the workspace store is untouched):
  //   • realtimeWorkspace: module-level store persists across this tab's
  //     unmount/remount, so `!realtimeWorkspace` is true only on the very
  //     first workspace fetch — re-subscription keeps the cached workspace.
  //   • !plans: the plan catalog is module-cached and hydrated synchronously
  //     on remount, so `!plans` is true only on the first-ever catalog fetch.
  // We deliberately do NOT gate on `catalogLoading` here: it briefly flips
  // true on every remount even with a warm cache, which is exactly the
  // re-entry skeleton flicker we're killing. If we have data, render the UI.
  if (!realtimeWorkspace || !plans) {
    return (
      <div className={`flex flex-col ${BILLING_CONTAINER} pb-20`}>
        <div className="mx-auto w-full">
          <BillingLoadingSkeleton />
        </div>
      </div>
    );
  }

  const isSuspended = billing?.suspended === true;
  const plan = billing?.plan ?? "starter";
  // Defense in depth: only show suspended UI when the workspace is actually on
  // a paid plan. A canceled/starter workspace with a lingering suspended: true
  // (e.g. mid-cascade, before the subscription_canceled write lands) should
  // NOT stack a suspended card on top of the Plans view.
  const isMeaningfullySuspended =
    isSuspended && (plan === "business" || plan === "enterprise");

  return (
    <div className={`flex flex-col ${BILLING_CONTAINER} pb-20`}>
      <div className="mx-auto w-full">
        {/* ── Transient action errors ─────────────────────────────────── */}
        {billingError && (
          <div
            className="mb-4 rounded-[var(--radius-btn)] px-4 py-3 text-sm"
            style={{
              background: "var(--color-danger-bg)",
              border: "1px solid var(--color-danger-border)",
              color: "var(--color-danger)",
            }}
          >
            {billingError}
          </div>
        )}
        {searchParams.get("upgraded") === "true" && (
          <div
            className="mb-4 rounded-[var(--radius-btn)] px-4 py-3 text-sm font-medium"
            style={{
              background: "var(--color-success-bg)",
              border: "1px solid var(--color-success-border)",
              color: "var(--color-success)",
            }}
          >
            You&apos;re on the Business plan now. Welcome aboard.
          </div>
        )}

        {/* Non-owner: read-only, any state. */}
        {!isWorkspaceOwner ? (
          <ReadOnlyBillingState workspace={realtimeWorkspace} />
        ) : (
          <div>
            {/* D2 suspended inline card — top of either owner view. */}
            {isMeaningfullySuspended && (
              <div
                className="mb-6 flex items-start gap-4 rounded-xl p-6"
                style={{
                  background: "var(--color-danger-bg)",
                  border: "1px solid var(--color-danger-border)",
                }}
              >
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
                  style={{ background: "var(--color-danger)" }}
                >
                  <AlertCircle
                    className="h-5 w-5"
                    style={{ color: "white" }}
                    aria-hidden
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h3
                    className="mb-1 text-base font-semibold"
                    style={{ color: "var(--text-heading)" }}
                  >
                    Your subscription is suspended
                  </h3>
                  <p
                    className="mb-4 text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {isWorkspaceOwner
                      ? "We couldn't process your latest payment. Update your payment method below to restore access."
                      : "This workspace's billing needs attention. Ask your workspace owner to update the payment method."}
                  </p>

                  {isWorkspaceOwner && (
                    <button
                      type="button"
                      onClick={() => void handleManageBilling()}
                      disabled={portalLoading}
                      className="inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-60"
                      style={{ color: "var(--color-danger)" }}
                    >
                      {portalLoading ? "Opening…" : "Update payment method"}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </button>
                  )}
                </div>
              </div>
            )}

            {plan === "starter" ? (
              <PlansAndPricingView
                starter={starterCatalog}
                business={businessCatalog}
                enterprise={enterpriseCatalog}
                memberFloor={realtimeWorkspace.usage?.members ?? 1}
                checkoutLoading={checkoutLoading}
                onUpgrade={(cycle, seatCount) =>
                  void handleCheckout(cycle, seatCount)
                }
              />
            ) : (
              <BillingManagementView
                workspace={realtimeWorkspace}
                perSeatPrice={perSeatPrice}
                portalLoading={portalLoading}
                onManageBilling={() => void handleManageBilling()}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
