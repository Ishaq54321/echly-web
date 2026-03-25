"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import {
  Home,
  Layers,
  MessageSquare,
  BarChart3,
  Settings,
  UserPlus,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { UserAvatar } from "@/components/ui/UserAvatar";

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

const NAV_ITEMS = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/discussion", icon: MessageSquare, label: "Discussion" },
  { href: "/dashboard/sessions", icon: Layers, label: "Sessions" },
  { href: "/dashboard/insights", icon: BarChart3, label: "Insights" },
  { href: "/settings", icon: Settings, label: "Settings" },
] as const;

function isActive(href: string, pathname: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/discussion") return pathname === "/discussion";
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
}

const WORKSPACE_NAME = "My Workspace";

const RAIL_ICON_CLASS = "h-[22px] w-[22px] shrink-0 text-current" as const;
const RAIL_ICON_STROKE = 2.2 as const;

export default function GlobalRail() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthGuard({ router });
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [workspacePopoverOpen, setWorkspacePopoverOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [workspacePopoverOpen]);

  return (
    <>
    <div
      className="relative z-30 group flex flex-col h-full min-h-0 shrink-0"
      ref={sidebarRef}
    >
      <aside
        className={cn(
          "relative border-r border-gray-200 flex flex-col bg-white h-screen shrink-0 min-h-0 overflow-visible py-4",
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
              "h-7 w-7 rounded-md border border-gray-200 bg-white shadow-sm",
              "flex items-center justify-center text-neutral-800 hover:text-neutral-900",
              "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
              "hover:scale-105",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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
                  className="relative w-10 h-10 bg-[#155DFC] rounded-md flex items-center justify-center overflow-hidden shrink-0 block"
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
                  "text-neutral-800 hover:text-neutral-900",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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
              className="relative w-10 h-10 bg-[#155DFC] rounded-md flex items-center justify-center overflow-hidden shrink-0"
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

        <div className={cn("flex w-full", isCollapsed ? "justify-center" : "px-3")}>
          <div className={cn(isCollapsed ? "relative group shrink-0" : "w-full")}>
            <button
              type="button"
              onClick={() => setWorkspacePopoverOpen((v) => !v)}
              className={cn(
                "flex items-center rounded-md transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                "text-neutral-800 hover:text-neutral-900",
                isCollapsed
                  ? "justify-center w-10 h-10"
                  : "justify-start gap-3 px-3 py-2 w-full"
              )}
              aria-label="Invite teammate"
              aria-expanded={workspacePopoverOpen}
            >
              <UserPlus
                className={RAIL_ICON_CLASS}
                strokeWidth={RAIL_ICON_STROKE}
              />
              <span
                className={cn(
                  "text-[15px] font-semibold text-current whitespace-nowrap",
                  "transition-[opacity,transform] duration-200 ease-out",
                  isCollapsed
                    ? "opacity-0 translate-x-[-6px] w-0 overflow-hidden"
                    : "opacity-100 translate-x-0"
                )}
              >
                Invite
              </span>
            </button>
            {isCollapsed ? (
              <span
                className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-neutral-800 rounded-md bg-white border border-neutral-200 shadow-[0_1px_2px_rgba(0,0,0,0.06)] opacity-0 pointer-events-none z-10 transition-opacity duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:opacity-100 group-focus-within:opacity-100"
                role="tooltip"
              >
                Invite teammate
              </span>
            ) : null}
          </div>
        </div>

        <div
          className={cn("h-px bg-neutral-200 my-1 shrink-0", isCollapsed ? "w-8" : "mx-3")}
          aria-hidden
        />

        <nav
          className={cn(
            "flex flex-col gap-3 flex-1 min-h-0",
            isCollapsed
              ? "mt-5 items-stretch overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              : "mt-4 items-stretch px-2 overflow-y-auto"
          )}
          aria-label="Main"
        >
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = isActive(href, pathname);
            return (
              <div
                key={label}
                className="relative group w-full"
              >
                <Link
                  href={href}
                  className={cn(
                    "w-full flex items-center px-3 py-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                    isCollapsed ? "justify-center gap-0" : "gap-3",
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-neutral-800 hover:text-neutral-900 hover:bg-gray-100"
                  )}
                  aria-label={label}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon
                    className={RAIL_ICON_CLASS}
                    strokeWidth={RAIL_ICON_STROKE}
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
                    className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-neutral-800 rounded-md bg-white border border-neutral-200 shadow-[0_1px_2px_rgba(0,0,0,0.06)] opacity-0 pointer-events-none z-10 transition-opacity duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:opacity-100 group-focus-within:opacity-100"
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
            "absolute top-[5.5rem] w-64 rounded-xl border border-neutral-200 bg-white shadow-lg p-4 z-50",
            isCollapsed ? "left-[64px]" : "left-[220px]"
          )}
          role="dialog"
          aria-label="Workspace"
        >
          <div className="flex items-center gap-3 mb-3">
            <UserAvatar
              image={(user as { image?: string | null } | null)?.image}
              photoURL={user?.photoURL}
              name={
                user?.displayName?.trim() ||
                user?.email?.split("@")[0] ||
                undefined
              }
              className="h-10 w-10 rounded-full border border-neutral-200"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-neutral-900 truncate">
                {WORKSPACE_NAME}
              </p>
              <p className="text-xs text-neutral-800">1 member</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setWorkspacePopoverOpen(false);
              setInviteModalOpen(true);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-neutral-900 bg-neutral-50 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            <UserPlus
              className={RAIL_ICON_CLASS}
              strokeWidth={RAIL_ICON_STROKE}
            />
            Invite teammates
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
              className="text-[20px] font-semibold leading-tight text-neutral-900"
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
              className="mt-4 w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-neutral-900 placeholder:text-meta focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="px-4 py-2.5 text-sm font-medium rounded-xl text-secondary hover:bg-neutral-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  // Placeholder: send invite
                  setInviteModalOpen(false);
                  setInviteEmail("");
                }}
                className="px-4 py-2.5 text-sm font-medium rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Send Invites
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
