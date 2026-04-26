"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import {
  type LucideIcon,
  Home,
  MessageSquare,
  SquareChartGantt,
  Settings,
  UserPlus,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  Check,
  Plus,
  Inbox,
  Loader2,
} from "lucide-react";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { useWorkspace } from "@/lib/client/workspaceContext";
import { authFetch } from "@/lib/authFetch";

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
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/discussion", icon: MessageSquare, label: "Discussion" },
  { href: "/activity", icon: SquareChartGantt, label: "Activity", iconStroke: 1.9 },
  { href: "/shared", icon: Inbox, label: "Shared" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

function isActive(href: string, pathname: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/discussion") return pathname === "/discussion";
  if (href === "/activity") return pathname === "/activity";
  if (href === "/shared") return pathname === "/shared";
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
}

const RAIL_ICON_CLASS = "h-[22px] w-[22px] shrink-0 text-current" as const;
const RAIL_ICON_STROKE = 2.2 as const;

function WorkspaceInitialsAvatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "W";
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-white text-sm font-semibold select-none">
      {initial}
    </span>
  );
}

export default function GlobalRail() {
  const pathname = usePathname();
  const router = useRouter();
  useAuthGuard({ router });
  // WORKSPACE-MEMBER: replaced hardcoded string with live data
  const { workspaceName, workspaceLogoUrl, isWorkspaceOwner, allWorkspaces, activeWorkspaceId, switchWorkspace, isLoadingWorkspaces, workspaceId, workspaceDocLoading, hintWorkspaceName, hintWorkspaceLogoUrl } = useWorkspace();
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
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setLogoError(false);
  }, [effectiveLogoUrl]);

  useEffect(() => {
    localStorage.setItem("echly_sidebar_collapsed", String(isCollapsed));
  }, [isCollapsed]);

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
  if (isSessionPage) return null;

  return (
    <>
    <div
      className="relative z-30 group flex flex-col h-full min-h-0 shrink-0"
      ref={sidebarRef}
    >
      <aside
        className={cn(
          "relative flex flex-col bg-white h-screen shrink-0 min-h-0 overflow-visible py-4",
          mounted && "transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          isCollapsed ? "w-[64px] items-center" : "w-[220px] items-stretch"
        )}
        aria-label="Global navigation"
      >
        <div className={cn("absolute -right-3 top-6 z-40", isCollapsed ? "hidden" : "block")}>
          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            aria-label="Toggle sidebar"
            className={cn(
              "h-7 w-7 rounded-md border border-[var(--border)] bg-white shadow-sm",
              "flex items-center justify-center text-neutral-800 hover:text-[var(--text-heading)]",
              "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
              "hover:scale-105",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1775E0] focus-visible:ring-offset-2"
            )}
          >
            <PanelLeftClose
              className={RAIL_ICON_CLASS}
              strokeWidth={RAIL_ICON_STROKE}
              aria-hidden
            />
          </button>
        </div>

        <div className="flex flex-col flex-1 min-h-0 overflow-x-hidden">
        {/* Logo */}
        <div
          className={cn(
            "flex shrink-0 w-full",
            isCollapsed
              ? "flex-col items-center gap-2 px-2 pb-2"
              : "flex-row items-center gap-2 h-16 px-3"
          )}
        >
          {isCollapsed ? (
            <div className="relative group/logo flex items-center justify-center h-10 w-10 shrink-0">
              <div
                className={cn(
                  "transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                  "opacity-100 group-hover/logo:opacity-0"
                )}
              >
                <Link
                  href="/dashboard"
                  className="relative w-10 h-10 bg-[var(--brand)] rounded-md flex items-center justify-center overflow-hidden shrink-0 block"
                  aria-label="Echly home"
                >
                  <Image
                    src="/Echly_logo.svg"
                    alt=""
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </Link>
              </div>
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                className={cn(
                  "absolute inset-0 flex items-center justify-center rounded-md",
                  "transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                  "opacity-0 pointer-events-none group-hover/logo:pointer-events-auto group-hover/logo:opacity-100",
                  "text-neutral-800 hover:text-[var(--text-heading)]",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1775E0] focus-visible:ring-offset-2"
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
            <Link
              href="/dashboard"
              className="relative w-10 h-10 bg-[var(--brand)] rounded-md flex items-center justify-center overflow-hidden shrink-0"
              aria-label="Echly home"
            >
              <Image
                src="/Echly_logo.svg"
                alt=""
                fill
                sizes="40px"
                className="object-cover"
              />
            </Link>
          )}
        </div>

        {/* Collapsed pill — under logo, above nav */}
        {isCollapsed && (
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
                margin: "16px auto 0",
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                title="Invite teammate"
                aria-label="Invite teammate"
                onClick={() => setInviteModalOpen(true)}
                className="group hover:[background:var(--surface-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1775E0]"
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
                  className="h-[22px] w-[22px] shrink-0 transition-colors duration-[160ms] group-hover:text-[var(--text-heading)]"
                  strokeWidth={2.2}
                  style={{ color: "var(--text-body)" }}
                  aria-hidden
                />
              </button>
              <div
                style={{ width: 26, height: 1, background: "var(--border)", margin: "0 auto", flexShrink: 0 }}
                aria-hidden
              />
              <button
                type="button"
                title={displayName}
                aria-label={displayName}
                onClick={() => setWorkspacePopoverOpen((v) => !v)}
                className="hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1775E0]"
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
                  <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                ) : (
                  displayName.trim().charAt(0).toUpperCase() || "W"
                )}
              </button>
            </div>
            <div
              style={{ height: 1, background: "var(--border)", width: "100%", margin: "16px 0 16px" }}
              aria-hidden
            />
          </>
        )}

        {!isCollapsed && (
          <div className="flex w-full px-3">
            <div className="w-full">
              <button
                type="button"
                onClick={() => setWorkspacePopoverOpen((v) => !v)}
                className={cn(
                  "flex items-center rounded-md transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1775E0] focus-visible:ring-offset-2",
                  "text-[var(--text-body)] hover:text-[var(--text-heading)] hover:bg-[var(--surface-hover)]",
                  "justify-start gap-2 px-3 py-2 w-full"
                )}
                aria-label="Workspace menu"
                aria-expanded={workspacePopoverOpen}
              >
                {effectiveLogoUrl && !logoError ? (
                  <span className="inline-flex h-7 w-7 shrink-0 overflow-hidden rounded-full">
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
                  <div className="h-7 w-7 rounded-full bg-muted animate-pulse shrink-0" />
                ) : (
                  <WorkspaceInitialsAvatar name={displayName} />
                )}
                <span
                  className="flex-1 min-w-0 text-sm font-medium text-current truncate opacity-100 translate-x-0 transition-[opacity,transform] duration-200 ease-out"
                  style={{ maxWidth: "120px" }}
                >
                  {displayName}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-neutral-500 transition-transform duration-200",
                    workspacePopoverOpen ? "rotate-180" : ""
                  )}
                  aria-hidden
                />
              </button>
            </div>
          </div>
        )}

        {!isCollapsed && (
          <div
            className="h-px bg-[var(--border)] my-1 shrink-0 mx-3"
            aria-hidden
          />
        )}

        <nav
          className={cn(
            "flex flex-col gap-3 min-h-0",
            isCollapsed
              ? "mt-0 items-stretch overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              : "mt-4 items-stretch px-2 overflow-y-auto flex-1"
          )}
          aria-label="Main"
        >
          {NAV_ITEMS.map(({ href, icon: Icon, label, iconStroke }) => {
            const active = isActive(href, pathname);
            return (
              <div
                key={label}
                className="relative group w-full"
              >
                <Link
                  href={href}
                  className={cn(
                    "w-full flex items-center px-3 py-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1775E0] focus-visible:ring-offset-2",
                    isCollapsed ? "justify-center gap-0" : "gap-3",
                    active
                      ? "bg-[var(--brand-subtle)] text-[var(--brand-text)]"
                      : "text-[var(--text-body)] hover:text-[var(--text-heading)] hover:bg-[var(--surface-hover)]"
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
                      "text-[15px] font-semibold text-current whitespace-nowrap",
                      "transition-[opacity,transform] duration-200 ease-out",
                      isCollapsed
                        ? "opacity-0 translate-x-[-6px] w-0 overflow-hidden pointer-events-none"
                        : "opacity-100 translate-x-0"
                    )}
                  >
                    {label}
                  </span>
                </Link>
                {isCollapsed ? (
                  <span
                    className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-[var(--text-body)] rounded-md bg-white border border-[var(--border)] shadow-[var(--shadow-sm)] opacity-0 pointer-events-none z-10 transition-opacity duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:opacity-100 group-focus-within:opacity-100"
                    role="tooltip"
                  >
                    {label}
                  </span>
                ) : null}
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
            isCollapsed ? "left-[64px]" : "left-[220px]"
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
                        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground ml-auto" aria-hidden />
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
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse shrink-0" />
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
              window.location.href = "/onboarding";
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition text-left"
            style={{ color: "var(--brand-text)" }}
          >
            <Plus className="h-4 w-4 shrink-0" strokeWidth={2} style={{ color: "var(--brand-text)" }} aria-hidden />
            Create workspace
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
              className="mt-4 w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-heading)] placeholder:text-[#C4BFBB] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
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
                className="px-4 py-2.5 text-sm font-medium rounded-xl bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)] transition disabled:opacity-50"
              >
                {inviteSubmitting ? "Sending…" : "Send Invite"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
