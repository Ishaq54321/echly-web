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
  type WorkspaceMembership,
} from "@/lib/client/workspaceContext";
import { BillingUsageProvider } from "@/lib/billing/BillingUsageProvider";
import {
  listenToWorkspace,
  updateWorkspaceName,
} from "@/lib/repositories/workspacesRepository";
import { MinimalLoader } from "@/components/ui/MinimalLoader";
import { authFetch } from "@/lib/authFetch";
import { useBillingStore } from "@/lib/store/billingStore";
import { Tooltip } from "@/components/ui/Tooltip";

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
  { id: "workspaces", label: "Workspaces" },
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
    allWorkspaces,
    activeWorkspaceId,
    switchWorkspace,
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
          {TABS.filter((t) => t.id !== "workspaces" || allWorkspaces.length > 1).map(({ id, label }) => {
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
          {activeTab === "workspaces" && (
            <WorkspacesTab
              allWorkspaces={allWorkspaces}
              activeWorkspaceId={activeWorkspaceId ?? workspaceId}
              switchWorkspace={switchWorkspace}
            />
          )}
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

function WorkspacesTab({
  allWorkspaces,
  activeWorkspaceId,
  switchWorkspace,
}: {
  allWorkspaces: WorkspaceMembership[];
  activeWorkspaceId: string | null;
  switchWorkspace: (wid: string) => Promise<void>;
}) {
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);

  return (
    <div style={{ maxWidth: 900, width: "100%", padding: "32px 0" }}>
      <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid var(--border)" }}>
        <h1 className="text-lg font-semibold text-[var(--text-heading)] mb-1">Your workspaces</h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
          Switch between workspaces you belong to.
        </p>
      </div>
      <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
        {allWorkspaces.map((ws, idx) => {
          const isCurrent = ws.workspaceId === activeWorkspaceId;
          const initial = ws.name.trim().charAt(0).toUpperCase() || "W";
          return (
            <button
              key={ws.workspaceId}
              type="button"
              disabled={isCurrent || switchingTo !== null}
              onClick={async () => {
                setSwitchingTo(ws.workspaceId);
                try { await switchWorkspace(ws.workspaceId); }
                finally { setSwitchingTo(null); }
              }}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "16px 24px", width: "100%",
                background: "transparent", border: "none", textAlign: "left",
                borderTop: idx === 0 ? "none" : "1px solid var(--surface-hover)",
                cursor: isCurrent ? "default" : "pointer",
                fontFamily: "inherit",
              }}
            >
              {ws.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ws.logoUrl} alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <span style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--brand)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
                  {initial}
                </span>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-heading)" }}>
                  {ws.name}
                  {isCurrent && (
                    <span style={{ marginLeft: 10, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "var(--brand-subtle)", color: "var(--brand)" }}>
                      Current
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
                  {ws.isOwner ? "Owner" : "Member"}
                </div>
              </div>
              {switchingTo === ws.workspaceId && (
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Switching…</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
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

const MEMBER_AVATAR_COLORS = [
  { bg: "var(--brand-subtle)", text: "var(--brand-hover)" },
  { bg: "var(--color-success-bg)", text: "var(--color-success)" },
  { bg: "var(--color-danger-bg)", text: "var(--color-danger)" },
  { bg: "var(--color-insight-bg)", text: "var(--color-insight)" },
  { bg: "var(--color-warning-bg)", text: "var(--color-warning-text)" },
  { bg: "var(--color-danger-bg)", text: "var(--color-danger)" },
  { bg: "var(--brand-subtle)", text: "var(--brand-text)" },
  { bg: "var(--color-success-bg)", text: "var(--color-success)" },
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
              <p className="text-[15px] font-medium text-[var(--text-heading)]">Change Password</p>
              <p className={SETTING_DESC}>Update your account password.</p>
            </div>
            <Button variant="secondary" className={`${BTN_SECONDARY} shrink-0`}>
              Change Password
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-[var(--border-default)]">
            <div className="min-w-0">
              <p className="text-[15px] font-medium text-[var(--text-heading)]">Enable Two-Factor Authentication</p>
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
          <Button variant="ghost" className="text-[14px] font-medium text-[var(--brand)] hover:underline shrink-0">
            Log out of all other sessions
          </Button>
        </div>
        <div className="mt-4 pt-4 border-t border-[var(--border-default)] space-y-2">
          {sessions.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                className="flex items-center gap-3 py-3 px-3 rounded-lg border border-transparent hover:bg-[var(--surface-hover)]/80 hover:border-[var(--border-default)] transition-all duration-200"
              >
                <Icon className="w-5 h-5 text-[var(--text-tertiary)] shrink-0" strokeWidth={1.8} />
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-[var(--text-heading)]">{s.device}</p>
                  <p className={SETTING_DESC}>{s.browser} · {s.location}</p>
                </div>
                {s.current && (
                  <span className="text-xs font-semibold text-[var(--brand)] shrink-0">Current</span>
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
              <p className="text-sm text-[var(--text-secondary)] py-2">Only the workspace owner can perform these actions.</p>
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

/* ——— Billing tab: SaaS pricing, backed by /api/plans/catalog ——— */
const BILLING_CONTAINER = "w-full";
const BRAND_BLUE = "var(--brand)";

type CatalogPlan = {
  id: "starter" | "business" | "enterprise";
  name: string;
  pricePerSeat: number | null;
  annualPricePerSeat: number | null;
  maxFeedbackPerMonth: number | null;
  maxMembers: number | null;
  insightsEnabled: boolean;
  customBranding: boolean;
  prioritySupport: boolean;
  displayLimits: { sessions: string; members: string; feedbackTickets: string };
};

type DisplayPlan = {
  id: CatalogPlan["id"];
  title: string;
  pricePerSeat: number | null;
  features: string[];
  cta: string;
  highlight: boolean;
  badge: string | null;
};

const PLAN_DISPLAY_META: Record<CatalogPlan["id"], Omit<DisplayPlan, "id" | "pricePerSeat">> = {
  starter: {
    title: "Starter",
    features: [
      "50 feedback tickets / month",
      "AI action steps",
      "Basic collaboration",
    ],
    cta: "Current Plan",
    highlight: false,
    badge: null,
  },
  business: {
    title: "Business",
    features: [
      "Unlimited feedback tickets",
      "Unlimited sessions",
      "Unlimited members",
      "Custom branding",
      "Advanced AI insights",
      "Full integrations",
    ],
    cta: "Upgrade to Business",
    highlight: true,
    badge: "Most Popular",
  },
  enterprise: {
    title: "Enterprise",
    features: [
      "Everything in Business",
      "Priority support",
      "SSO",
      "Audit logs",
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
    starter: boolean | string;
    business: boolean | string;
    enterprise: boolean | string;
  }[];
}[] = [
  {
    section: "FEEDBACK CAPTURE",
    rows: [
      { feature: "Feedback tickets / month", starter: "50 / month", business: "Unlimited", enterprise: "Unlimited" },
      { feature: "Feedback sessions", starter: "Unlimited", business: "Unlimited", enterprise: "Unlimited" },
      { feature: "Feedback widget", starter: true, business: true, enterprise: true },
    ],
  },
  {
    section: "AI ASSISTANCE",
    rows: [
      { feature: "AI summaries", starter: true, business: true, enterprise: true },
      { feature: "AI action steps", starter: true, business: true, enterprise: true },
      { feature: "Advanced AI insights", starter: false, business: true, enterprise: true },
    ],
  },
  {
    section: "TEAM & WORKSPACE",
    rows: [
      { feature: "Members", starter: "Limited (5)", business: "Unlimited", enterprise: "Unlimited" },
      { feature: "Custom branding", starter: false, business: true, enterprise: true },
      { feature: "Full integrations", starter: false, business: true, enterprise: true },
    ],
  },
  {
    section: "SUPPORT & SECURITY",
    rows: [
      { feature: "Priority support", starter: false, business: false, enterprise: true },
      { feature: "SSO", starter: false, business: false, enterprise: true },
      { feature: "Audit logs", starter: false, business: false, enterprise: true },
    ],
  },
];

const FAQ_ITEMS: { q: string; a: string }[] = [
  { q: "Can I cancel anytime?", a: "Yes. You can upgrade or cancel your plan at any time." },
  { q: "What counts as a feedback ticket?", a: "A feedback ticket is an individual piece of feedback submitted through the widget. Each submission counts as one ticket." },
  { q: "When do my tickets reset?", a: "Ticket counts reset on the 1st of every calendar month." },
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
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);
  const { plans, loading } = usePlanCatalog();
  const { isWorkspaceOwner } = useWorkspace();
  const { plan: currentPlan, seats: currentSeats } = useBillingStore();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("upgraded") === "true") {
      setBillingError(null);
    }
  }, [searchParams]);

  async function handleCheckout(cycle: "monthly" | "annual") {
    if (!isWorkspaceOwner) return;
    setBillingError(null);
    setCheckoutLoading(true);
    try {
      const res = await authFetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billingCycle: cycle }),
      });
      if (!res) { setBillingError("Request failed. Try again."); return; }
      const json = await res.json() as { success: boolean; data?: { checkoutUrl: string }; error?: { message: string } };
      if (!res.ok || !json.success || !json.data?.checkoutUrl) {
        setBillingError(json.error?.message ?? "Failed to start checkout. Try again.");
        return;
      }
      window.location.href = json.data.checkoutUrl;
    } catch {
      setBillingError("Failed to start checkout. Try again.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function handleManageBilling() {
    if (!isWorkspaceOwner) return;
    setBillingError(null);
    setPortalLoading(true);
    try {
      const res = await authFetch("/api/billing/portal", { method: "POST" });
      if (!res) { setBillingError("Request failed. Try again."); return; }
      const json = await res.json() as { success: boolean; data?: { portalUrl: string }; error?: { message: string } };
      if (!res.ok || !json.success || !json.data?.portalUrl) {
        setBillingError(json.error?.message ?? "Failed to open billing portal. Try again.");
        return;
      }
      window.location.href = json.data.portalUrl;
    } catch {
      setBillingError("Failed to open billing portal. Try again.");
    } finally {
      setPortalLoading(false);
    }
  }

  const teamSizeNumber = useMemo(() => {
    const n = Number.parseInt(teamSize, 10);
    if (!Number.isFinite(n) || n <= 0) return 1;
    return n;
  }, [teamSize]);

  const displayPlans = useMemo(() => {
    if (!plans || plans.length === 0) return [];
    const result: (DisplayPlan & {
      priceAmount: string;
      priceSuffix: string;
      priceSubLabel: string | null;
    })[] = [];
    for (const plan of plans) {
      const meta = PLAN_DISPLAY_META[plan.id as CatalogPlan["id"]];
      if (!meta) continue;
      const isAnnual = billingPeriod === "annual";
      const perSeat = isAnnual ? (plan.annualPricePerSeat ?? plan.pricePerSeat) : plan.pricePerSeat;

      if (plan.id === "enterprise" || perSeat === null) {
        result.push({
          id: plan.id as CatalogPlan["id"],
          title: plan.name || meta.title,
          pricePerSeat: null,
          features: meta.features,
          cta: meta.cta,
          highlight: meta.highlight,
          badge: meta.badge,
          priceAmount: "Custom",
          priceSuffix: "",
          priceSubLabel: "Contact us for pricing",
        });
        continue;
      }

      if (perSeat === 0) {
        result.push({
          id: plan.id as CatalogPlan["id"],
          title: plan.name || meta.title,
          pricePerSeat: 0,
          features: meta.features,
          cta: meta.cta,
          highlight: meta.highlight,
          badge: meta.badge,
          priceAmount: "Free",
          priceSuffix: "",
          priceSubLabel: null,
        });
        continue;
      }

      const total = perSeat * teamSizeNumber;
      const suffix = isAnnual ? "/ seat / year" : "/ seat / month";
      const subLabel = isAnnual ? `$${(perSeat * 12).toFixed(0)}/seat/yr billed annually` : null;

      result.push({
        id: plan.id as CatalogPlan["id"],
        title: plan.name || meta.title,
        pricePerSeat: perSeat,
        features: meta.features,
        cta: meta.cta,
        highlight: meta.highlight,
        badge: meta.badge,
        priceAmount: `$${perSeat % 1 === 0 ? perSeat.toFixed(0) : perSeat.toFixed(2)}`,
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
        <p className="text-center text-[var(--text-secondary)]">Unable to load plans. Please try again later.</p>
      </div>
    );
  }

  const isOnPaidPlan = currentPlan === "business" || currentPlan === "enterprise";

  return (
    <div className={`flex flex-col ${BILLING_CONTAINER} pb-20`}>

      {/* Current plan status card — shown for Business/Enterprise */}
      {isOnPaidPlan && (
        <div className="billing-container mb-8">
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-card)] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-[var(--text-heading)]">
                  {currentPlan === "enterprise" ? "Enterprise Plan" : "Business Plan"}
                </span>
                {currentPlan === "business" && (
                  <span className="inline-flex items-center rounded-full bg-[var(--color-success-bg)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-success)]">
                    Active
                  </span>
                )}
              </div>
              {isWorkspaceOwner && currentPlan === "business" && (
                <button
                  type="button"
                  onClick={() => void handleManageBilling()}
                  disabled={portalLoading}
                  className="inline-flex h-[34px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border border-[var(--border)] bg-transparent text-[var(--text-heading)] text-[13px] font-medium hover:bg-[var(--surface-hover)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  {portalLoading ? "Opening…" : "Manage Billing"}
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 text-sm">
              <div>
                <p className="text-[var(--text-secondary)] text-xs mb-0.5">Active seats</p>
                <p className="font-semibold text-[var(--text-heading)]">{currentSeats}</p>
              </div>
              <div>
                <p className="text-[var(--text-secondary)] text-xs mb-0.5">Feedback tickets</p>
                <p className="font-semibold text-[var(--text-heading)]">Unlimited</p>
              </div>
              <div>
                <p className="text-[var(--text-secondary)] text-xs mb-0.5">Members</p>
                <p className="font-semibold text-[var(--text-heading)]">Unlimited</p>
              </div>
            </div>
            {!isWorkspaceOwner && currentPlan === "business" && (
              <p className="mt-4 text-sm text-[var(--text-secondary)]">
                Contact your workspace owner to manage billing.
              </p>
            )}
            {currentPlan === "enterprise" && (
              <p className="mt-4 text-sm text-[var(--text-secondary)]">
                Contact support for billing inquiries.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error / success banners */}
      {billingError && (
        <div className="billing-container mb-4">
          <div className="rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger)]">
            {billingError}
          </div>
        </div>
      )}
      {searchParams.get("upgraded") === "true" && (
        <div className="billing-container mb-4">
          <div className="rounded-lg border border-[var(--color-success-border)] bg-[var(--color-success-bg)] px-4 py-3 text-sm text-[var(--color-success-solid)] font-medium">
            You&apos;re now on the Business plan! Welcome aboard.
          </div>
        </div>
      )}

      {/* Hero */}
      <header className="billing-container text-center" style={{ marginBottom: 32 }}>
        <h2
          className="text-[44px] font-extrabold leading-[1.1] tracking-[-0.02em] text-[var(--text-heading)]"
          style={{ marginBottom: 24 }}
        >
          Choose the plan that fits your feedback workflow
        </h2>
      </header>

      {/* Billing control bar */}
      <div className="billing-container flex flex-wrap items-center justify-center gap-8" style={{ marginBottom: 32 }}>
        <div className="flex items-center gap-2">
          <label htmlFor="team-size" className="text-[15px] font-medium text-[var(--text-body)]">
            Seats:
          </label>
          <input
            id="team-size"
            type="text"
            value={teamSize}
            onChange={(e) => setTeamSize(e.target.value)}
            className="w-[60px] px-2.5 py-1.5 text-center rounded-[var(--radius-sm)] border border-[rgba(0,0,0,0.08)] text-[15px] text-[var(--text-heading)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
          />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[15px] font-medium text-[var(--text-body)]">Billing:</span>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="billing"
                checked={billingPeriod === "monthly"}
                onChange={() => setBillingPeriod("monthly")}
                className="w-4 h-4 text-[var(--brand)] focus:ring-[var(--brand)]"
              />
              <span className="text-[15px] font-medium text-[var(--text-heading)]">Monthly</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="billing"
                checked={billingPeriod === "annual"}
                onChange={() => setBillingPeriod("annual")}
                className="w-4 h-4 text-[var(--brand)] focus:ring-[var(--brand)]"
              />
              <span className="text-[15px] font-medium text-[var(--text-heading)]">
                Annually <span className="text-xs text-[var(--brand)] font-semibold">Save 20%</span>
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Pricing cards */}
      <div className="billing-container">
        <section className="billing-pricing-grid mb-[72px] items-stretch">
          {displayPlans.map((plan) => (
            <div
              key={plan.id}
              className={`billing-card ${plan.highlight ? "billing-card--business" : ""}`}
            >
              <div className="relative">
                {plan.badge && (
                  <span className="absolute -top-1 -right-0 rounded-full bg-[var(--brand-subtle)] px-[10px] py-1 text-xs font-semibold text-[var(--text-heading)]">
                    {plan.badge}
                  </span>
                )}
                <h3 className="plan-title text-[var(--text-heading)]">{plan.title}</h3>
              </div>
              <div className="mt-4">
                <p className="price text-[var(--text-heading)]">
                  {plan.priceAmount}
                  {plan.priceSuffix && <span className="price-suffix">{plan.priceSuffix}</span>}
                </p>
                {plan.priceSubLabel && (
                  <p className="mt-1 text-[14px] font-medium text-[var(--text-secondary)]">{plan.priceSubLabel}</p>
                )}
              </div>
              <ul className="plan-features flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="plan-feature">
                    <span className="feature-icon mt-[2px]" aria-hidden>
                      <CheckMarkIcon />
                    </span>
                    <span className="plan-feature-text text-[var(--text-body)]">{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Button
                  variant={plan.highlight ? "primary" : "secondary"}
                  className={
                    plan.highlight
                      ? "w-full rounded-[var(--radius-btn)] px-4 py-2.5 text-sm font-semibold bg-[var(--brand)] text-white hover:brightness-110 border border-transparent"
                      : "secondary-cta w-full text-sm"
                  }
                  disabled={
                    (plan.id === "business" && checkoutLoading) ||
                    (plan.id === "business" && isOnPaidPlan)
                  }
                  onClick={() => {
                    if (plan.id === "enterprise") {
                      router.push(`/settings?tab=billing&plan=enterprise`);
                      return;
                    }
                    if (plan.id === "starter") return;
                    if (plan.id === "business") {
                      if (isOnPaidPlan) return;
                      if (!isWorkspaceOwner) {
                        setBillingError("Only the workspace owner can upgrade. Contact your owner to upgrade.");
                        return;
                      }
                      void handleCheckout(billingPeriod);
                      return;
                    }
                    router.push(`/settings?tab=billing&plan=${plan.id}&cycle=${billingPeriod}`);
                  }}
                >
                  {plan.id === "business" && checkoutLoading
                    ? "Redirecting…"
                    : plan.id === "business" && isOnPaidPlan
                    ? "Current plan"
                    : plan.cta}
                </Button>
              </div>
            </div>
          ))}
        </section>

        {/* Feature comparison table */}
        <section className="mb-[72px] overflow-x-auto">
          <div className="rounded-[var(--radius-lg)] border overflow-hidden min-w-[560px]" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-[var(--surface-subtle)]/80" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
                  <th className="py-3 px-4 text-[15px] font-semibold text-[var(--text-heading)]">Feature</th>
                  <th className="py-3 px-4 text-[15px] font-semibold text-[var(--text-heading)]">Starter (Free)</th>
                  <th className="py-3 px-4 text-[15px] font-semibold text-[var(--text-heading)]">Business ($39/seat/mo)</th>
                  <th className="py-3 px-4 text-[15px] font-semibold text-[var(--text-heading)]">Enterprise (Custom)</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_SECTIONS.map(({ section, rows }) => (
                  <Fragment key={section}>
                    <tr className="bg-[var(--surface-subtle)]">
                      <td colSpan={4} className="py-2.5 px-4 text-[14px] font-semibold tracking-[0.04em] text-[var(--text-body)]">
                        {section}
                      </td>
                    </tr>
                    {rows.map((row, rowIdx) => (
                      <tr
                        key={row.feature}
                        className={rowIdx % 2 === 1 ? "bg-[var(--surface-subtle)]" : ""}
                        style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}
                      >
                        <td className="py-3 px-4 text-[15px] text-[var(--text-body)]">{row.feature}</td>
                        {(["starter", "business", "enterprise"] as const).map((col) => {
                          const v = row[col];
                          return (
                            <td
                              key={col}
                              className="py-3 px-4 text-[15px] text-[var(--text-secondary)] align-middle"
                            >
                              {v === true ? (
                                <span className="inline-flex items-center"><CheckMarkIcon /></span>
                              ) : v === false ? (
                                <Minus className="w-5 h-5 text-[var(--text-placeholder)] inline" strokeWidth={2} aria-hidden />
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
          <h3 className="text-[44px] font-extrabold text-[var(--text-heading)] text-center mt-20 mb-12">
            Frequently Asked Questions
          </h3>
          <div>
            {FAQ_ITEMS.map(({ q, a }, index) => {
              const isOpen = faqOpenIndex === index;
              return (
                <div key={q} className="bg-[var(--brand-subtle)] rounded-[var(--radius-lg)] p-5 mb-4">
                  <button
                    type="button"
                    onClick={() => setFaqOpenIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between gap-4 text-left text-[18px] font-semibold text-[var(--text-heading)]"
                    aria-expanded={isOpen}
                  >
                    <span>{q}</span>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 text-[var(--text-body)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      aria-hidden
                    />
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-200 ease"
                    style={{ maxHeight: isOpen ? 300 : 0, opacity: isOpen ? 1 : 0, marginTop: isOpen ? 12 : 0 }}
                  >
                    <p className="text-[16px] text-[var(--text-body)]" style={{ lineHeight: 1.6 }}>{a}</p>
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
