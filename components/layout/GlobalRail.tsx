"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import {
  type LucideIcon,
  CircleUser,
  Inbox as InboxIcon,
  FileText,
  GalleryHorizontalEnd,
  Settings,
  UserPlus,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  Check,
  Plus,
  Loader2,
} from "lucide-react";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { useWorkspace } from "@/lib/client/workspaceContext";
import { authFetch } from "@/lib/authFetch";
import { Tooltip } from "@/components/ui/Tooltip";

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

type MainNavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
  /** Slightly lower stroke for glyphs with more internal detail (keeps rail visually even). */
  iconStroke?: number;
};

const NAV_ITEMS: MainNavItem[] = [
  { href: "/dashboard", icon: CircleUser, label: "Dashboard" },
  { href: "/discussion", icon: InboxIcon, label: "Discussion" },
  { href: "/activity", icon: FileText, label: "Activity", iconStroke: 2.2 },
  { href: "/shared", icon: GalleryHorizontalEnd, label: "Shared" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

function isActive(href: string, pathname: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/discussion") return pathname === "/discussion";
  if (href === "/activity") return pathname === "/activity";
  if (href === "/shared") return pathname === "/shared";
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
}

const RAIL_ICON_CLASS = "h-[18px] w-[18px] shrink-0 text-current" as const;
const RAIL_ICON_STROKE = 2 as const;

function WorkspaceInitialsAvatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "W";
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-white text-sm font-semibold select-none">
      {initial}
    </span>
  );
}

interface GlobalRailProps {
  forceExpanded?: boolean;
  expandedWidthClass?: string;
  onForceClose?: () => void;
}

export default function GlobalRail({ forceExpanded = false, expandedWidthClass = "w-[248px]", onForceClose }: GlobalRailProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  useAuthGuard({ router });
  // WORKSPACE-MEMBER: replaced hardcoded string with live data
  const { workspaceName, workspaceLogoUrl, isWorkspaceOwner, allWorkspaces, activeWorkspaceId, switchWorkspace, isLoadingWorkspaces, refreshMemberships, workspaceId, workspaceDocLoading, hintWorkspaceName, hintWorkspaceLogoUrl, memberCount } = useWorkspace();
  const effectiveLogoUrl = workspaceDocLoading ? hintWorkspaceLogoUrl : workspaceLogoUrl;
  const effectiveName = workspaceDocLoading ? (hintWorkspaceName ?? workspaceName) : workspaceName;
  const displayName = effectiveName ?? "Workspace";
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [workspacePopoverOpen, setWorkspacePopoverOpen] = useState(false);
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSent, setInviteSent] = useState(false);
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
  const [createWorkspaceName, setCreateWorkspaceName] = useState("");
  const [createWorkspaceSubmitting, setCreateWorkspaceSubmitting] = useState(false);
  const [createWorkspaceError, setCreateWorkspaceError] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setLogoError(false);
  }, [effectiveLogoUrl]);

  useEffect(() => {
    if (!workspacePopoverOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setWorkspacePopoverOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setWorkspacePopoverOpen(false);
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [workspacePopoverOpen]);

  // ALL hooks are now called above. Safe to bail out.
  const isSessionPage = pathname?.match(/^\/dashboard\/[^/]+/) !== null || pathname?.match(/^\/session\/[^/]+/) !== null;
  if (isSessionPage && !forceExpanded) return null;

  const effectiveCollapsed = forceExpanded ? false : isCollapsed;

  return (
    <>
    <div
      className="relative z-30 group flex flex-col h-full min-h-0 shrink-0"
      ref={sidebarRef}
    >
      <aside
        className={cn(
          "relative flex flex-col bg-[var(--surface)] h-full shrink-0 min-h-0 overflow-visible py-4 rounded-[var(--content-card-radius)]",
          mounted && "transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          effectiveCollapsed ? "w-[64px] items-stretch group/rail" : cn(expandedWidthClass, "items-stretch")
        )}
        aria-label="Global navigation"
      >

        <div className="flex flex-col flex-1 w-full min-h-0 overflow-x-hidden">
        {/* Logo */}
        <div
          className={cn(
            "flex shrink-0 w-full",
            effectiveCollapsed
              ? "flex-col items-center gap-2 px-2 pb-2"
              : "flex-row items-center gap-2 h-16 px-3"
          )}
        >
          {effectiveCollapsed ? (
            <div className="relative group/logo flex items-center justify-center h-[38px] w-[38px] shrink-0">
              <div
                className={cn(
                  "transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                  "opacity-100 group-hover/rail:opacity-0"
                )}
              >
                <Link
                  href="/dashboard"
                  className="relative w-[38px] h-[38px] flex items-center justify-center shrink-0 block"
                  aria-label="Annote home"
                >
                  <Image
                    src="/annote-logo-icon.svg"
                    alt="Annote"
                    fill
                    sizes="38px"
                    className="object-contain"
                  />
                </Link>
              </div>
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                className={cn(
                  "absolute inset-0 flex items-center justify-center rounded-md",
                  "transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                  "opacity-0 pointer-events-none group-hover/rail:pointer-events-auto group-hover/rail:opacity-100",
                  "text-[var(--text-heading)]",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5A49BF] focus-visible:ring-offset-2"
                )}
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen
                  className={RAIL_ICON_CLASS}
                  strokeWidth={RAIL_ICON_STROKE}
                  aria-hidden
                />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full py-2">
              <Link href="/dashboard" className="flex items-center pl-1.5" aria-label="Annote home">
                <Image
                  src="/annote-logo-full.svg"
                  alt="Annote"
                  width={110}
                  height={26}
                  sizes="110px"
                  className="h-[26px] w-auto object-contain"
                />
              </Link>
              {forceExpanded ? (
                onForceClose ? (
                  <button
                    type="button"
                    onClick={onForceClose}
                    aria-label="Close navigation"
                    className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-heading)] hover:bg-[var(--surface-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5A49BF] focus-visible:ring-offset-2"
                  >
                    <PanelLeftClose size={18} strokeWidth={2} />
                  </button>
                ) : null
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCollapsed(true)}
                  aria-label="Collapse sidebar"
                  className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-heading)] hover:bg-[var(--surface-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5A49BF] focus-visible:ring-offset-2"
                >
                  <PanelLeftClose size={18} strokeWidth={2} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Collapsed pill — under logo, above nav */}
        {effectiveCollapsed && (
          <>
            <div
              style={{
                width: 44,
                background: "transparent",
                border: "1.5px solid var(--border)",
                borderRadius: 12,
                padding: "8px 0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                margin: "20px auto 0",
                flexShrink: 0,
              }}
            >
              <Tooltip content="Invite teammate" position="right">
                <button
                  type="button"
                  aria-label="Invite teammate"
                  onClick={() => setInviteModalOpen(true)}
                  className="group hover:[background:var(--surface-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5A49BF]"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    border: "none",
                    background: "transparent",
                    transition: "all 160ms",
                    flexShrink: 0,
                  }}
                >
                  <UserPlus
                    className="h-[22px] w-[22px] shrink-0"
                    strokeWidth={2.2}
                    style={{ color: "var(--text-primary)" }}
                    aria-hidden
                  />
                </button>
              </Tooltip>
              <div
                style={{ width: 26, height: 1, background: "var(--border)", margin: "0 auto", flexShrink: 0 }}
                aria-hidden
              />
              <Tooltip content={displayName} position="right">
              <button
                type="button"
                aria-label={displayName}
                onClick={() => setWorkspacePopoverOpen((v) => !v)}
                className="hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5A49BF]"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: (effectiveLogoUrl && !logoError) ? "transparent" : (workspaceDocLoading && !effectiveName) ? "transparent" : "var(--brand)",
                  color: "#FFFFFF",
                  fontSize: 14,
                  fontWeight: 'bold',
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  border: "none",
                  transition: "opacity 160ms",
                  flexShrink: 0,
                  userSelect: "none",
                  overflow: "hidden",
                  padding: 0,
                }}
              >
                {effectiveLogoUrl && !logoError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={effectiveLogoUrl}
                    alt={displayName}
                    style={{ width: 32, height: 32, objectFit: "cover" }}
                    onError={() => setLogoError(true)}
                  />
                ) : workspaceDocLoading && !effectiveName ? (
                  <div className="w-8 h-8 rounded-full bg-[var(--surface-hover)] animate-pulse" />
                ) : (
                  displayName.trim().charAt(0).toUpperCase() || "W"
                )}
              </button>
              </Tooltip>
            </div>
            <div
              style={{ height: 1, background: "var(--border)", width: "100%", margin: "20px 0 20px" }}
              aria-hidden
            />
          </>
        )}

        {!effectiveCollapsed && (
          <div className="mx-3 mt-4 rounded-[var(--radius-md)] border border-[var(--border)] overflow-hidden shadow-[0_1px_0_rgba(28,25,23,0.02)]">
            <div
              className="px-3 py-2.5 flex items-center gap-2.5 cursor-pointer hover:bg-[var(--surface-hover)] hover:rounded-t-[var(--radius-md)] transition-colors"
              onClick={() => setWorkspacePopoverOpen((v) => !v)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setWorkspacePopoverOpen((v) => !v); }}
            >
              <div className="flex flex-col flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-[var(--text-heading)] truncate">
                  {displayName}
                </div>
                <div className="text-[13px] text-[var(--text-heading)] mt-0.5">
                  {memberCount} {memberCount === 1 ? "member" : "members"}
                </div>
              </div>
              <ChevronDown size={14} strokeWidth={2} className="text-[var(--text-heading)] shrink-0 ml-auto" />
            </div>
            <div className="h-px bg-[var(--border)]" />
            <button
              type="button"
              onClick={() => setInviteModalOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[15px] font-medium text-[var(--text-heading)] hover:bg-[var(--surface-hover)] transition-all duration-200 group/invite cursor-pointer border-0 bg-transparent"
            >
              <UserPlus size={18} strokeWidth={2} className="text-[var(--text-heading)]" />
              Invite teammates
            </button>
          </div>
        )}


        <nav
          className={cn(
            "flex flex-col gap-3 min-h-0",
            effectiveCollapsed
              ? "mt-0 items-stretch overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              : "mt-4 items-stretch px-2 overflow-y-auto flex-1"
          )}
          aria-label="Main"
        >
          {NAV_ITEMS.map(({ href, icon: Icon, label, iconStroke }) => {
            const active = isActive(href, pathname);
            const linkEl = (
              <Link
                href={href}
                className={cn(
                  "flex items-center transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5A49BF] focus-visible:ring-offset-2",
                  effectiveCollapsed
                    ? "mx-auto w-11 h-10 justify-center rounded-[var(--radius-sm)]"
                    : "w-full gap-3 px-3 py-3 rounded-[var(--radius-sm)]",
                  active
                    ? "bg-[var(--brand-subtle)] text-[var(--brand)] font-semibold"
                    : "text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                )}
                aria-label={label}
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  className={RAIL_ICON_CLASS}
                  strokeWidth={iconStroke ?? RAIL_ICON_STROKE}
                />
                <span
                  className={cn(
                    "text-[13px] font-medium text-current whitespace-nowrap",
                    "transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                    effectiveCollapsed
                      ? "opacity-0 translate-x-[-6px] w-0 overflow-hidden pointer-events-none delay-0"
                      : "opacity-100 translate-x-0 delay-150"
                  )}
                >
                  {label}
                </span>
              </Link>
            );
            return (
              <div
                key={label}
                className={`relative w-full ${effectiveCollapsed ? "flex justify-center" : ""}`}
              >
                {effectiveCollapsed ? (
                  <Tooltip content={label} position="right">
                    {linkEl}
                  </Tooltip>
                ) : linkEl}
              </div>
            );
          })}
        </nav>

        </div>
      </aside>

      {/* Workspace popover (anchored to invite button) */}
      {workspacePopoverOpen && (
        <div
          className={cn(
            "absolute top-[5.5rem] w-64 rounded-xl border bg-white shadow-lg p-4 z-50",
            effectiveCollapsed ? "left-[64px]" : "left-[248px]"
          )}
          role="dialog"
          aria-label="Workspace"
        >
          {/* Workspace switcher section */}
          {(allWorkspaces.length > 1 || isLoadingWorkspaces) && (
            <>
              <p
                className="px-1 pb-1"
                style={{ fontSize: 12, letterSpacing: "0.5px", textTransform: "uppercase", color: "var(--text-tertiary)", paddingTop: 2, paddingBottom: 4 }}
              >
                Your workspaces
              </p>
              {isLoadingWorkspaces ? (
                <>
                  <div className="h-[38px] rounded-lg bg-[var(--surface-hover)] animate-pulse mb-1" />
                  <div className="h-[38px] rounded-lg bg-[var(--surface-hover)] animate-pulse mb-1" />
                </>
              ) : (
                allWorkspaces.map((ws) => {
                  const isActive = (activeWorkspaceId ?? workspaceId) === ws.workspaceId;
                  const initial = ws.name.trim().charAt(0).toUpperCase() || "W";
                  return (
                    <button
                      key={ws.workspaceId}
                      type="button"
                      onClick={async () => {
                        setWorkspacePopoverOpen(false);
                        if (!isActive) {
                          setSwitchingTo(ws.workspaceId);
                          await switchWorkspace(ws.workspaceId);
                          setSwitchingTo(null);
                        }
                      }}
                      className="w-full flex items-center gap-2 px-2.5 rounded-lg text-sm font-medium text-[var(--text-body)] hover:bg-[var(--surface-hover)] transition text-left"
                      style={{ height: 38 }}
                    >
                      {ws.logoUrl ? (
                        <span className="inline-flex h-[22px] w-[22px] shrink-0 overflow-hidden rounded-full">
                          {
                            // eslint-disable-next-line @next/next/no-img-element -- workspace list logo
                            <img
                              src={ws.logoUrl}
                              alt={ws.name}
                              className="h-full w-full object-cover"
                            />
                          }
                        </span>
                      ) : (
                        <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center bg-[var(--brand)] text-white text-xs font-semibold select-none" style={{ borderRadius: "50%" }}>
                          {initial}
                        </span>
                      )}
                      <span className="flex-1 min-w-0 truncate">{ws.name}</span>
                      {switchingTo === ws.workspaceId ? (
                        <Loader2 className="h-3 w-3 animate-spin text-[var(--text-secondary)] ml-auto" aria-hidden />
                      ) : isActive ? (
                        <Check className="h-4 w-4 shrink-0 text-[var(--brand)]" strokeWidth={2.5} aria-hidden />
                      ) : null}
                    </button>
                  );
                })
              )}
              <div className="h-px bg-[var(--border)] my-2" aria-hidden />
            </>
          )}

          <div className="flex items-center gap-3 mb-3">
            {effectiveLogoUrl && !logoError ? (
              <span className="inline-flex h-8 w-8 shrink-0 overflow-hidden rounded-full">
                {
                  // eslint-disable-next-line @next/next/no-img-element -- remote workspace logo
                  <img
                    src={effectiveLogoUrl}
                    alt={displayName}
                    className="h-full w-full object-cover"
                    onError={() => setLogoError(true)}
                  />
                }
              </span>
            ) : workspaceDocLoading && !effectiveName ? (
              <div className="h-8 w-8 rounded-full bg-[var(--surface-hover)] animate-pulse shrink-0" />
            ) : (
              <WorkspaceInitialsAvatar name={displayName} />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[var(--text-heading)] truncate">
                {displayName}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <a
              href="/settings?tab=general"
              onClick={() => setWorkspacePopoverOpen(false)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-body)] hover:bg-[var(--surface-hover)] transition"
            >
              Workspace settings
            </a>
            <a
              href="/settings?tab=members"
              onClick={() => setWorkspacePopoverOpen(false)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-body)] hover:bg-[var(--surface-hover)] transition"
            >
              Members
            </a>
            {isWorkspaceOwner && (
              <button
                type="button"
                onClick={() => {
                  setWorkspacePopoverOpen(false);
                  setInviteModalOpen(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-body)] hover:bg-[var(--brand-subtle)] hover:text-[var(--brand)] transition text-left"
              >
                <UserPlus className="h-4 w-4 shrink-0" strokeWidth={2} />
                Invite teammate
              </button>
            )}
          </div>

          {/* Create new workspace */}
          <div className="h-px bg-[var(--border)] mt-2 mb-1" aria-hidden />
          <button
            type="button"
            onClick={() => {
              setWorkspacePopoverOpen(false);
              setCreateWorkspaceOpen(true);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition text-left"
            style={{ color: "var(--brand-text)" }}
          >
            <Plus className="h-4 w-4 shrink-0" strokeWidth={2} style={{ color: "var(--brand-text)" }} aria-hidden />
            Create New Workspace
          </button>
        </div>
      )}

    </div>

      {/* Invite modal */}
      {inviteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 cursor-pointer"
          onClick={() => setInviteModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-modal-title"
        >
          <div
            className="rounded-2xl shadow-lg bg-white p-6 max-w-md w-full cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="invite-modal-title"
              className="text-[20px] font-semibold leading-tight text-[var(--text-heading)]"
            >
              Invite your coworkers
            </h2>
            <label htmlFor="invite-email" className="sr-only">
              Email address
            </label>
            <input
              id="invite-email"
              type="email"
              placeholder="email@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="mt-4 w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-heading)] placeholder:text-[#B5AEBE] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
            />
            {inviteError && (
              <p className="mt-2 text-sm text-[var(--color-danger)]">{inviteError}</p>
            )}
            {inviteSent && (
              <p className="mt-2 text-sm text-[var(--color-success)]">Invitation sent!</p>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setInviteModalOpen(false); setInviteEmail(""); setInviteError(null); setInviteSent(false); }}
                className="px-4 py-2.5 text-sm font-medium rounded-xl text-[var(--text-body)] hover:bg-[var(--surface-hover)] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={inviteSubmitting || !inviteEmail.trim()}
                onClick={async () => {
                  const email = inviteEmail.trim().toLowerCase();
                  if (!email) return;
                  setInviteError(null);
                  setInviteSent(false);
                  setInviteSubmitting(true);
                  try {
                    const res = await authFetch("/api/workspace/members/invite", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email, role: "MEMBER" }),
                    });
                    if (!res?.ok) {
                      const json = await res?.json() as { error?: { message: string } } | undefined;
                      setInviteError(json?.error?.message ?? "Failed to send invite.");
                    } else {
                      setInviteSent(true);
                      setInviteEmail("");
                      setTimeout(() => { setInviteModalOpen(false); setInviteSent(false); }, 1500);
                    }
                  } catch {
                    setInviteError("Failed to send invite.");
                  } finally {
                    setInviteSubmitting(false);
                  }
                }}
                className="inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border-none bg-[var(--brand)] text-white text-[14px] font-medium hover:bg-[var(--brand-hover)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {inviteSubmitting ? "Sending…" : "Send Invite"}
              </button>
            </div>
          </div>
        </div>
      )}

      {createWorkspaceOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 cursor-pointer"
          onClick={() => setCreateWorkspaceOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-workspace-title"
        >
          <div
            className="rounded-2xl shadow-lg bg-white p-6 max-w-md w-full cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="create-workspace-title" className="text-[20px] font-semibold leading-tight text-[var(--text-heading)]">
              Create New Workspace
            </h2>
            <label htmlFor="create-workspace-name" className="sr-only">Workspace name</label>
            <input
              id="create-workspace-name"
              type="text"
              placeholder="Workspace name"
              value={createWorkspaceName}
              maxLength={80}
              onChange={(e) => setCreateWorkspaceName(e.target.value)}
              className="mt-4 w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-heading)] placeholder:text-[#B5AEBE] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
              autoFocus
            />
            {createWorkspaceError && (
              <p className="mt-2 text-sm text-[var(--color-danger)]">{createWorkspaceError}</p>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setCreateWorkspaceOpen(false);
                  setCreateWorkspaceName("");
                  setCreateWorkspaceError(null);
                }}
                className="px-4 py-2.5 text-sm font-medium rounded-xl text-[var(--text-body)] hover:bg-[var(--surface-hover)] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={createWorkspaceSubmitting || !createWorkspaceName.trim()}
                onClick={async () => {
                  const trimmed = createWorkspaceName.trim();
                  if (!trimmed) return;
                  setCreateWorkspaceError(null);
                  setCreateWorkspaceSubmitting(true);
                  try {
                    const res = await authFetch("/api/workspaces", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name: trimmed }),
                    });
                    if (!res?.ok) {
                      const json = await res?.json() as { error?: { message: string } } | undefined;
                      setCreateWorkspaceError(json?.error?.message ?? "Failed to create workspace.");
                      return;
                    }
                    refreshMemberships();
                    setCreateWorkspaceOpen(false);
                    setCreateWorkspaceName("");
                    try {
                      const { getAuth } = await import("firebase/auth");
                      await getAuth().currentUser?.getIdToken(true);
                    } catch {
                      /* non-fatal */
                    }
                    window.location.href = "/dashboard";
                  } catch {
                    setCreateWorkspaceError("Failed to create workspace.");
                  } finally {
                    setCreateWorkspaceSubmitting(false);
                  }
                }}
                className="inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border-none bg-[var(--brand)] text-white text-[14px] font-medium hover:bg-[var(--brand-hover)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {createWorkspaceSubmitting ? "Creating…" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
