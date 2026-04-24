"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState, Fragment } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Monitor,
  Laptop,
  ChevronDown,
  ChevronUp,
  Camera,
  Check,
  Minus,
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
  CheckCircle,
  Gem,
} from "lucide-react";
import { ImageCropModal } from "@/components/ui/ImageCropModal";
import { InviteMemberModal } from "@/components/workspace/InviteMemberModal";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { MODAL_LAYER_Z_INDEX } from "@/lib/ui/zIndex";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { usePlanCatalog } from "@/lib/hooks/usePlanCatalog";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Workspace } from "@/lib/domain/workspace";
import {
  assertIdentityResolved,
  useWorkspace,
} from "@/lib/client/workspaceContext";
import { BillingUsageProvider } from "@/lib/billing/BillingUsageProvider";
import {
  listenToWorkspace,
  updateWorkspaceName,
} from "@/lib/repositories/workspacesRepository";
import { MinimalLoader } from "@/components/ui/MinimalLoader";
import { authFetch } from "@/lib/authFetch";

/* Premium workspace settings: wide layout, strong hierarchy */
const SETTINGS_CARD =
  "rounded-[12px] border border-[var(--border-default)] bg-white p-[28px] transition-[border-color,box-shadow] duration-200 ease-out hover:border-[#D5D5D5] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]";
const CARD_GAP = "space-y-8"; /* 32px between section cards */
const ROW_GAP = "space-y-5"; /* 20px between setting rows */
const SECTION_TITLE = "text-lg font-semibold text-[var(--text-heading)]"; /* H2: section heading */
const SECTION_SUBTITLE = "text-[16px] font-semibold text-neutral-900"; /* H3 setting labels: 600 for hierarchy */
const SECTION_DESC = "text-[14px] text-neutral-600 mt-1"; /* body, darker grey */
const SETTING_DESC = "text-[14px] text-neutral-600 mt-0.5";
const BTN_PRIMARY = "rounded-[8px] px-4 py-2.5 text-sm font-semibold bg-[#1775E0] text-white hover:bg-[#1462C4] hover:shadow-[0_2px_8px_rgba(23,117,224,0.35)] transition-all duration-200";
const BTN_SECONDARY = "rounded-[8px] px-4 py-2.5 text-sm font-semibold bg-neutral-100 border border-[#EBEBEB] text-neutral-900 hover:bg-neutral-200 hover:shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-all duration-200";

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
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 max-w-lg mx-auto text-center">
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
                  ${isActive ? "text-[#1775E0] font-bold" : "font-medium text-[var(--text-meta)] hover:text-neutral-700"}
                `}
                aria-current={isActive ? "true" : undefined}
              >
                {label}
                {isActive && (
                  <span
                    className="absolute left-0 right-0 bottom-0 h-[3px] bg-[#1775E0] rounded-full"
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
        </BillingUsageProvider>
      </div>
    </div>
  );
}

function SettingsSuspenseFallback() {
  return (
    <div className="flex flex-1 min-h-0 bg-white overflow-auto" aria-busy="true" aria-live="polite">
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

function WorkspaceTab({
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
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
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
        <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid #F0F0F0" }}>
          <div className="skeleton" style={{ height: 22, width: 180, background: "#F0F0F0", borderRadius: 6, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 14, width: 280, background: "#F0F0F0", borderRadius: 4 }} />
        </div>
        <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "28px 32px", borderBottom: "1px solid #F0F0F0" }}>
            <div className="skeleton" style={{ width: 140, height: 14, background: "#F0F0F0", borderRadius: 4, marginBottom: 16 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <div className="skeleton" style={{ width: 88, height: 88, borderRadius: "50%", background: "#F0F0F0", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 42, background: "#F0F0F0", borderRadius: 9, width: "100%", marginBottom: 10 }} />
                <div className="skeleton" style={{ height: 38, background: "#F0F0F0", borderRadius: 9, width: 120 }} />
              </div>
            </div>
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ padding: "16px 32px", borderBottom: "1px solid #F0F0F0", display: "flex", alignItems: "center", gap: 12 }}>
              <div className="skeleton" style={{ width: 32, height: 32, borderRadius: "50%", background: "#F0F0F0", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 13, background: "#F0F0F0", borderRadius: 4, width: "55%", marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 11, background: "#F0F0F0", borderRadius: 4, width: "70%" }} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div className="skeleton" style={{ height: 22, width: 52, borderRadius: 999, background: "#F0F0F0" }} />
                <div className="skeleton" style={{ height: 22, width: 52, borderRadius: 999, background: "#F0F0F0" }} />
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
            background: "#111",
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
          borderBottom: "1px solid #F0F0F0",
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
                boxShadow: "0 0 0 2px #EBEBEB",
                overflow: "hidden",
                background: "#F5F5F5",
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
          <label style={{ fontSize: 13, fontWeight: 500, color: "#555", display: "block", marginBottom: 6 }}>
            Workspace name
          </label>
          <input
            type="text"
            value={nameDraft}
            disabled={loading || !workspaceId}
            onChange={(e) => setNameDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void handleSave(); }}
            style={{
              height: 42,
              borderRadius: 9,
              border: "1.5px solid #E5E5E5",
              background: "#FAFAFA",
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
              e.target.style.boxShadow = "0 0 0 3px rgba(23,117,224,0.10)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#E5E5E5";
              e.target.style.background = "#FAFAFA";
              e.target.style.boxShadow = "none";
            }}
          />

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
        </div>
      </div>

      {/* Members section inside the card */}
      <div style={{ padding: "0 32px 32px" }}>
        <div style={{ margin: "28px 0 0", height: 1, background: "#F0F0F0" }} aria-hidden />
        <MembersTab workspaceId={workspaceId} loading={loading} />
      </div>

      </div>{/* end card */}

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
    "inline-flex items-center gap-1.5 rounded-[999px] py-1 px-2.5 bg-[var(--color-success-bg)]/90 text-neutral-900 text-xs font-semibold transition-all duration-200 hover:bg-[var(--color-success-bg)] hover:shadow-sm [&_svg]:text-neutral-900 [&_svg]:stroke-[2.5]";
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
        <div style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", borderBottom: "1px solid #EBEBEB" }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#111" }}>Change email address</span>
          <button type="button" onClick={onClose} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", borderRadius: 6, cursor: "pointer", color: "#777" }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "24px 28px" }}>
          {success ? (
            <div style={{ textAlign: "center", padding: "12px 0 8px" }}>
              <CheckCircle size={32} color="var(--color-success-solid)" style={{ margin: "0 auto 12px" }} />
              <p style={{ fontSize: 17, fontWeight: 600, color: "#111", margin: "0 0 8px" }}>Confirmation email sent!</p>
              <p style={{ fontSize: 14, color: "#777", margin: 0 }}>Check {newEmail} for a confirmation link.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { void handleSubmit(e); }}>
              {/* Info note */}
              <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10, padding: "12px 14px", display: "flex", gap: 10, marginBottom: 20, alignItems: "flex-start" }}>
                <Mail size={16} color="var(--brand)" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 13, color: "#1462C4", lineHeight: 1.5 }}>
                  We&apos;ll send a confirmation link to your new email address. Your email won&apos;t change until you click the link.
                </span>
              </div>

              <label style={{ fontSize: 13, fontWeight: 500, color: "#555", display: "block", marginBottom: 6 }}>New email address</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                style={{ height: 42, borderRadius: 9, border: "1.5px solid #E5E5E5", background: "#FAFAFA", padding: "0 12px", fontSize: 15, color: "#111", width: "100%", outline: "none", boxSizing: "border-box", marginBottom: 14 }}
                onFocus={(e) => { e.target.style.borderColor = "var(--brand)"; e.target.style.background = "white"; e.target.style.boxShadow = "0 0 0 3px rgba(23,117,224,0.10)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#E5E5E5"; e.target.style.background = "#FAFAFA"; e.target.style.boxShadow = "none"; }}
              />

              <label style={{ fontSize: 13, fontWeight: 500, color: "#555", display: "block", marginBottom: 6 }}>Current password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ height: 42, borderRadius: 9, border: "1.5px solid #E5E5E5", background: "#FAFAFA", padding: "0 40px 0 12px", fontSize: 15, color: "#111", width: "100%", outline: "none", boxSizing: "border-box" }}
                  onFocus={(e) => { e.target.style.borderColor = "var(--brand)"; e.target.style.background = "white"; e.target.style.boxShadow = "0 0 0 3px rgba(23,117,224,0.10)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#E5E5E5"; e.target.style.background = "#FAFAFA"; e.target.style.boxShadow = "none"; }}
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
                <button type="button" onClick={onClose} style={{ height: 38, padding: "0 16px", borderRadius: 9, border: "1px solid #E5E5E5", background: "white", color: "#555", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
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
        <div style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", borderBottom: "1px solid #EBEBEB" }}>
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
            <span style={{ fontSize: 14, color: "#555" }}>I understand this is permanent</span>
          </label>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" onClick={onClose} style={{ height: 38, padding: "0 16px", borderRadius: 9, border: "1px solid #E5E5E5", background: "white", color: "#555", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
              Cancel
            </button>
            <button
              type="button"
              disabled={!confirmed}
              onClick={() => { onClose(); alert("Contact support@echly.com to delete your account."); }}
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
  const { authPhotoUrl, authDisplayName, authEmail, authReady, updateAvatarUrl } = useWorkspace();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(authPhotoUrl);
  const [nameDraft, setNameDraft] = useState(authDisplayName ?? "");
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
  useEffect(() => { setNameDraft(authDisplayName ?? ""); }, [authDisplayName]);

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
    const trimmed = nameDraft.trim();
    if (!trimmed) return;
    if (trimmed === (authDisplayName ?? "")) {
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 2000);
      return;
    }
    setIsSaving(true);
    try {
      const res = await authFetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: trimmed }),
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

  const initial = ((authDisplayName ?? authEmail ?? "?").trim().charAt(0) || "?").toUpperCase();

  const inputStyle: React.CSSProperties = {
    height: 42,
    borderRadius: 9,
    border: "1.5px solid #E5E5E5",
    background: "#FAFAFA",
    padding: "0 12px",
    fontSize: 15,
    color: "#111",
    width: "100%",
    outline: "none",
    transition: "border-color 150ms, box-shadow 150ms, background 150ms",
    boxSizing: "border-box",
  };

  const sectionStyle: React.CSSProperties = {
    padding: "28px 32px",
    borderBottom: "1px solid #F0F0F0",
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 600,
    color: "#111",
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
        <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid #F0F0F0" }}>
          <div className="skeleton" style={{ height: 22, width: 160, background: "#F0F0F0", borderRadius: 6, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 14, width: 280, background: "#F0F0F0", borderRadius: 4 }} />
        </div>
        <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "28px 32px", borderBottom: "1px solid #F0F0F0" }}>
            <div className="skeleton" style={{ width: 110, height: 14, background: "#F0F0F0", borderRadius: 4, marginBottom: 16 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <div className="skeleton" style={{ width: 88, height: 88, borderRadius: "50%", background: "#F0F0F0", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 42, background: "#F0F0F0", borderRadius: 9, width: "100%", marginBottom: 10 }} />
                <div className="skeleton" style={{ height: 38, background: "#F0F0F0", borderRadius: 9, width: 120 }} />
              </div>
            </div>
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ padding: "28px 32px", borderBottom: "1px solid #F0F0F0" }}>
              <div className="skeleton" style={{ height: 56, background: "#F8F8F8", borderRadius: 9 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, width: "100%", padding: "32px 0" }} className="ech-content-enter pb-16">
      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 50, padding: "10px 18px", borderRadius: 10, background: "#111", color: "white", fontSize: 14, fontWeight: 500, pointerEvents: "none", whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}

      {/* Page heading */}
      <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid #F0F0F0" }}>
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
                <div style={{ width: 88, height: 88, borderRadius: "50%", boxShadow: "0 0 0 3px #FFFFFF, 0 0 0 5px #E0E0E0", overflow: "hidden", background: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
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

            {/* Name field */}
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#555", display: "block", marginBottom: 6 }}>Full name</label>
              <input
                type="text"
                value={nameDraft}
                maxLength={60}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") void handleSaveName(); }}
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "var(--brand)"; e.target.style.background = "white"; e.target.style.boxShadow = "0 0 0 3px rgba(23,117,224,0.10)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#E5E5E5"; e.target.style.background = "#FAFAFA"; e.target.style.boxShadow = "none"; }}
              />
              <button
                type="button"
                onClick={() => void handleSaveName()}
                disabled={isSaving || !nameDraft.trim()}
                style={{ marginTop: 10, height: 38, padding: "0 18px", borderRadius: 9, border: "none", background: savedOk ? "var(--color-success)" : "var(--brand)", color: "white", fontSize: 14, fontWeight: 600, cursor: isSaving || !nameDraft.trim() ? "not-allowed" : "pointer", opacity: isSaving || !nameDraft.trim() ? 0.7 : 1, transition: "background 200ms", display: "flex", alignItems: "center", gap: 8 }}
              >
                {isSaving ? (
                  <><span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", animation: "spin 0.7s linear infinite", display: "block" }} />Saving...</>
                ) : savedOk ? (
                  <><Check size={14} />Saved</>
                ) : "Save name"}
              </button>
            </div>
          </div>
        </div>

        {/* Section: Connected account (Google users) */}
        {authProvider === "google" && (
          <div style={sectionStyle}>
            <p style={sectionTitleStyle}>Connected account</p>
            <div style={{ background: "#F8F9FA", border: "1px solid #E8EAED", borderRadius: 12, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#111", margin: 0 }}>Signed in with Google</p>
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
              <p style={{ fontSize: 15, color: "#111", fontWeight: 500, margin: 0 }}>{authEmail ?? "—"}</p>
            </div>
            {authProvider === "google" ? (
              <Lock size={14} color="#BBB" />
            ) : (
              <button
                type="button"
                onClick={() => setChangeEmailOpen(true)}
                style={{ height: 34, padding: "0 14px", borderRadius: 8, border: "1px solid #E5E5E5", background: "white", color: "#555", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "background 150ms" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F5F5F5"; }}
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
                <p style={{ fontSize: 14, color: "#111", fontWeight: 500, margin: 0 }}>Password</p>
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
                  border: "1px solid #E5E5E5",
                  background: passwordResetSent ? "var(--color-success-bg)" : "white",
                  color: passwordResetSent ? "var(--color-success-solid)" : "#555",
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

const MEMBER_AVATAR_COLORS = [
  { bg: "#EBF4FF", text: "#1462C4" },
  { bg: "#D1FAE5", text: "#065F46" },
  { bg: "#FEE2E2", text: "#991B1B" },
  { bg: "#EDE9FE", text: "#5B21B6" },
  { bg: "#FEF3C7", text: "#92400E" },
  { bg: "#FCE7F3", text: "#9D174D" },
  { bg: "#E0F2FE", text: "#0C4A6E" },
  { bg: "#F0FDF4", text: "#14532D" },
];

function getAvatarColor(email: string): { bg: string; text: string } {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  return MEMBER_AVATAR_COLORS[Math.abs(hash) % MEMBER_AVATAR_COLORS.length]!;
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
          className="hidden md:grid items-center border-b border-[#F0F0F0] last:border-b-0 bg-white"
          style={{ gridTemplateColumns: TABLE_COLS, minHeight: 56, padding: "12px 16px" }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse shrink-0" />
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <div className="h-[14px] bg-muted animate-pulse rounded" style={{ width: "75%" }} />
              <div className="h-[12px] bg-muted animate-pulse rounded" style={{ width: "50%" }} />
            </div>
          </div>
          <div className="h-[14px] w-16 bg-muted animate-pulse rounded" />
          <div className="h-[14px] w-24 bg-muted animate-pulse rounded" />
          <div className="h-[14px] w-14 bg-muted animate-pulse rounded" />
          <div />
        </div>
      ))}
      {[0, 1, 2].map((i) => (
        <div
          key={`m${i}`}
          className="md:hidden p-4 border-b border-[#F0F0F0] last:border-b-0 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#F0F0F0] shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-[#F0F0F0] rounded w-32" />
              <div className="h-2.5 bg-[#F0F0F0] rounded w-44" />
            </div>
            <div className="h-5 bg-[#F0F0F0] rounded-full w-14" />
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
  const avatarColor = getAvatarColor(row.email);
  const initial = (row.name ?? row.email).charAt(0).toUpperCase();
  const isOwner = row.role === "OWNER";
  const confirming = confirmingRemoveId === row.id;

  const avatarNode =
    row.status === "active" ? (
      row.avatarUrl ? (
        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full">
          {
            // eslint-disable-next-line @next/next/no-img-element -- remote member avatar
            <img
              src={row.avatarUrl}
              alt={row.name ?? row.email}
              className="h-full w-full object-cover"
            />
          }
        </div>
      ) : (
        <span
          className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm font-semibold select-none"
          style={{ background: avatarColor.bg, color: avatarColor.text }}
        >
          {initial}
        </span>
      )
    ) : (
      <span
        className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center"
        style={{ background: "#F0F0F0", border: "1.5px dashed #D0D0D0" }}
      >
        <Mail size={14} color="#BBBBBB" />
      </span>
    );

  const nameBlock =
    row.status === "active" ? (
      row.name ? (
        <div className="min-w-0">
          <p
            className="text-[14px] font-medium text-[#1C1B1F] truncate"
            style={{ lineHeight: "1.3" }}
          >
            {row.name}
          </p>
          <p className="text-[13px] text-[#78716C] truncate" style={{ marginTop: 1 }}>
            {row.email}
          </p>
        </div>
      ) : (
        <p className="text-[14px] font-medium text-[#1C1B1F] truncate min-w-0">{row.email}</p>
      )
    ) : (
      <div className="min-w-0">
        <p className="text-[14px] text-[#AAAAAA] italic" style={{ lineHeight: "1.3" }}>
          Invited
        </p>
        <p className="text-[13px] text-[#78716C] truncate" style={{ marginTop: 1 }}>
          {row.email}
        </p>
      </div>
    );

  const roleBadge = (
    <span className={row.status === "pending" ? "text-sm font-semibold text-foreground/50" : "text-sm font-semibold text-foreground"}>
      {row.role === "OWNER" ? "Owner" : "Member"}
    </span>
  );

  const statusBadge =
    row.status === "active" ? (
      <span className="text-sm font-semibold text-foreground">Active</span>
    ) : (
      <span className="text-sm font-semibold text-foreground/50">Pending</span>
    );

  const removeConfirm = (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => setConfirmingRemoveId(null)}
        className="text-[13px] text-[#78716C] hover:text-neutral-900 transition-colors px-1"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={() => onRemove(row.id, row.name ?? row.email)}
        className="text-[13px] text-[var(--color-danger)]"
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
          <button
            type="button"
            onClick={() => setConfirmingRemoveId(row.id)}
            title="Remove member"
            className="w-[30px] h-[30px] flex items-center justify-center rounded-[6px] text-[#A8A29E] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-colors"
          >
            <UserMinus size={15} />
          </button>
        )
      )}
      {row.status === "pending" && isWorkspaceOwner && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onResend(row.invitationToken!, row.email)}
            title="Resend invite"
            className="w-[30px] h-[30px] flex items-center justify-center rounded-[6px] text-[#A8A29E] hover:text-[#1775E0] hover:bg-[#EBF4FF] transition-colors"
          >
            <RotateCcw size={14} />
          </button>
          <button
            type="button"
            onClick={() => onRevoke(row.invitationToken!, row.email)}
            title="Revoke invite"
            className="w-[30px] h-[30px] flex items-center justify-center rounded-[6px] text-[#A8A29E] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop row */}
      <div
        className="hidden md:grid items-center border-b border-[#F0F0F0] last:border-b-0 cursor-pointer transition-colors"
        style={{
          gridTemplateColumns: TABLE_COLS,
          minHeight: 56,
          padding: "12px 16px",
          background: row.status === "pending" ? "#FEFEFE" : hovered ? "#FAFAFA" : "white",
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
        <div className={row.status === "pending" ? "text-sm font-semibold text-foreground/50" : "text-sm font-semibold text-foreground"}>{formatDateAdded(row.joinedAt)}</div>
        <div>{statusBadge}</div>
        {actionsDesktop}
      </div>

      {/* Mobile card */}
      <div
        className="md:hidden p-4 border-b border-[#F0F0F0] last:border-b-0"
        style={{ background: row.status === "pending" ? "#FEFEFE" : "white" }}
      >
        <div className="flex items-center gap-3">
          {avatarNode}
          <div className="flex-1 min-w-0">
            {row.status === "active" ? (
              row.name ? (
                <>
                  <p className="text-sm font-medium text-[#1C1B1F] truncate">{row.name}</p>
                  <p className="text-[13px] text-[#78716C] truncate">{row.email}</p>
                </>
              ) : (
                <p className="text-sm font-medium text-[#1C1B1F] truncate">{row.email}</p>
              )
            ) : (
              <>
                <p className="text-[14px] text-[#AAAAAA] italic">Invited</p>
                <p className="text-[13px] text-[#78716C] truncate">{row.email}</p>
              </>
            )}
          </div>
          {statusBadge}
        </div>
        <div className="flex items-center gap-3 mt-2 pl-11">
          {roleBadge}
          <span className="text-[12px] text-[#AAAAAA]">{formatDateAdded(row.joinedAt)}</span>
        </div>
        {row.status === "active" && !isOwner && isWorkspaceOwner && (
          <div className="flex items-center gap-2 mt-2 pl-11">
            {confirming ? (
              removeConfirm
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingRemoveId(row.id)}
                className="flex items-center gap-1.5 text-[13px] text-[#A8A29E] hover:text-[var(--color-danger)] transition-colors"
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
              className="flex items-center gap-1 text-[13px] text-[#78716C] hover:text-[#1775E0] transition-colors"
            >
              <RotateCcw size={12} />
              Resend
            </button>
            <button
              type="button"
              onClick={() => onRevoke(row.invitationToken!, row.email)}
              className="flex items-center gap-1 text-[13px] text-[#78716C] hover:text-[var(--color-danger)] transition-colors"
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-lg bg-neutral-900 text-white text-sm font-medium shadow-lg pointer-events-none whitespace-nowrap">
          {toast}
        </div>
      )}

      {/* Header Row 1: Title + CTA */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-heading)", lineHeight: "1.3" }}>
            Members
          </h2>
          <p className="text-sm font-medium text-foreground/60" style={{ marginTop: 4, fontSize: 15, fontWeight: 500 }}>
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
          <span className="absolute inset-y-0 left-[11px] flex items-center pointer-events-none text-foreground/50">
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
            className="w-full outline-none placeholder:text-foreground/50"
            style={{
              height: 36,
              background: "#F7F8FA",
              border: "1.5px solid #E8E8E8",
              borderRadius: 10,
              padding: "0 12px 0 34px",
              fontSize: 14,
              color: "var(--text-heading)",
              transition: "border-color 150ms, box-shadow 150ms",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--brand)";
              e.target.style.boxShadow = "0 0 0 3px rgba(23,117,224,0.10)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#E8E8E8";
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
            border: "1.5px solid #E8E8E8",
            borderRadius: 10,
            padding: "0 10px",
            fontSize: 14,
            color: "#444444",
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
            border: "1.5px solid #E8E8E8",
            borderRadius: 10,
            padding: "0 10px",
            fontSize: 14,
            color: "#444444",
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
          border: "1px solid #EBEBEB",
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
            background: "#F9FAFB",
            borderBottom: "1px solid #EBEBEB",
            padding: "0 16px",
            alignItems: "center",
          }}
        >
          <span className="text-sm font-semibold text-foreground">NAME</span>
          <span className="text-sm font-semibold text-foreground">ROLE</span>
          <span className="text-sm font-semibold text-foreground">DATE ADDED</span>
          <span className="text-sm font-semibold text-foreground">STATUS</span>
          <span />
        </div>

        {/* Table body */}
        {isLoading ? (
          <MembersTableSkeleton />
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <AlertCircle className="h-7 w-7 text-neutral-400" />
            <p className="text-sm text-neutral-600">{fetchError}</p>
            <button type="button" onClick={fetchAll} className={BTN_SECONDARY}>
              Try again
            </button>
          </div>
        ) : filteredRows.length === 0 ? (
          rows.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <p style={{ fontSize: 14, color: "#999999" }}>No team members found</p>
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center gap-[10px]"
              style={{ padding: "32px 0" }}
            >
              <Users size={32} color="#DDDDDD" />
              <p style={{ fontSize: 14, color: "#999999" }}>No members match your search</p>
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
        <div className="rounded-xl px-4 py-3 bg-[var(--brand-subtle)] border border-[var(--brand-muted)] text-sm font-medium text-[var(--brand-text)]">
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
          <Button variant="ghost" className="text-sm font-semibold text-[#1775E0] hover:underline shrink-0 rounded-lg px-4 py-2.5">
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
                  <span className="text-xs font-semibold text-[#1775E0] shrink-0">Current</span>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Collapsible Danger Zone */}
      <Card className={`${SETTINGS_CARD} border-[var(--color-danger-border)]`} as="article" style={{ background: "rgba(229,72,77,0.05)" }}>
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
                  className="rounded-[8px] px-4 py-2.5 text-sm font-semibold shrink-0 bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border border-[var(--color-warning-border)] hover:bg-[var(--color-warning-bg)] transition-all duration-200"
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
                  className="rounded-[8px] px-4 py-2.5 text-sm font-semibold shrink-0 bg-[var(--color-danger)] text-white hover:opacity-95 hover:shadow-[0_2px_8px_rgba(229,72,77,0.35)] transition-all duration-200"
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
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#1775E0] focus:border-transparent"
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
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1775E0] focus:border-transparent"
                />
                {transferError && <p className="mt-1.5 text-sm text-[var(--color-danger)]">{transferError}</p>}
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
                  className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-[#1775E0] text-white hover:bg-[#1462C4] transition disabled:opacity-60"
                >
                  {transferSubmitting ? "Transferring…" : "Transfer Ownership"}
                </button>
              </div>
            </form>
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
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-danger)] focus:border-transparent"
                />
                {deleteError && <p className="mt-1.5 text-sm text-[var(--color-danger)]">{deleteError}</p>}
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
                      ? "bg-[var(--color-danger)] text-white hover:opacity-95"
                      : "bg-neutral-200 text-neutral-400 disabled:opacity-100"
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
const BRAND_BLUE = "#1775E0";

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
            className="w-[60px] px-2.5 py-1.5 text-center rounded-[8px] border border-[rgba(0,0,0,0.08)] text-[15px] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#1775E0]/20"
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
                className="w-4 h-4 text-[#1775E0] focus:ring-[#1775E0]"
              />
              <span className="text-[15px] font-medium text-neutral-900">Monthly</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="billing"
                checked={billingPeriod === "annual"}
                onChange={() => setBillingPeriod("annual")}
                className="w-4 h-4 text-[#1775E0] focus:ring-[#1775E0]"
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
                      ? "w-full rounded-[10px] px-4 py-2.5 text-sm font-semibold bg-[#1775E0] text-white hover:brightness-110 border border-transparent"
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
