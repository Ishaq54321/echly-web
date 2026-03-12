"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import {
  LayoutDashboard,
  Folder,
  MessageSquare,
  BarChart3,
  Settings,
  UserPlus,
} from "lucide-react";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/discussion", icon: MessageSquare, label: "Discussion" },
  { href: "/dashboard/sessions", icon: Folder, label: "Sessions" },
  { href: "/dashboard/insights", icon: BarChart3, label: "Insights" },
  { href: "/settings", icon: Settings, label: "Settings" },
] as const;

function isActive(href: string, pathname: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/discussion") return pathname === "/discussion";
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
}

const WORKSPACE_NAME = "My Workspace";

export default function GlobalRail() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthGuard({ router });
  const [workspacePopoverOpen, setWorkspacePopoverOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const sidebarRef = useRef<HTMLDivElement>(null);

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
    <div className="relative flex flex-col h-full min-h-0 shrink-0" ref={sidebarRef}>
      <aside
        className="w-16 border-r border-[#E3E6E5] flex flex-col items-center py-4 bg-[#FFFFFF] h-screen shrink-0 min-h-0"
        aria-label="Global navigation"
      >
        {/* Logo block */}
        <div className="flex items-center justify-center h-16">
          <Link
            href="/dashboard"
            className="relative w-10 h-10 bg-[#9FE870] rounded-xl flex items-center justify-center overflow-hidden"
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
          onClick={() => setWorkspacePopoverOpen((v) => !v)}
          className="flex items-center justify-center w-10 h-10 rounded-xl text-[#111111] hover:bg-[#E9ECEB] hover:text-[#111111] transition-colors"
          aria-label="Invite teammate"
          aria-expanded={workspacePopoverOpen}
        >
          <UserPlus className="w-[22px] h-[22px] stroke-[1.8]" />
        </button>

        <div className="w-8 h-px bg-[#E3E6E5] my-1" aria-hidden />

        <nav className="flex flex-col gap-3 mt-5 flex-1 min-h-0 items-center" aria-label="Main">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = isActive(href, pathname);
            return (
              <div key={label} className="relative group">
                <Link
                  href={href}
                  className={`flex items-center justify-center w-10 h-10 rounded-xl transition-colors ${
                    active
                      ? "bg-[#E9ECEB] text-[#111111] font-semibold"
                      : "text-[#111111] hover:bg-[#E9ECEB] hover:text-[#111111]"
                  }`}
                  aria-label={label}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="w-[22px] h-[22px] stroke-[1.8]" />
                </Link>
                <span
                  className="absolute left-full ml-3 px-2 py-1 text-caption rounded-lg bg-[#FFFFFF] border border-[#E3E6E5] shadow-[0_1px_3px_rgba(0,0,0,0.05)] opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-10"
                  role="tooltip"
                >
                  {label}
                </span>
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Workspace popover (anchored to invite button) */}
      {workspacePopoverOpen && (
        <div
          className="absolute left-16 top-[5.5rem] w-64 rounded-2xl border border-[#E3E6E5] bg-[#FFFFFF] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-4 z-50"
          role="dialog"
          aria-label="Workspace"
        >
          <div className="flex items-center gap-3 mb-3">
            <img
              src={user?.photoURL || "/avatar-placeholder.png"}
              alt=""
              className="w-10 h-10 rounded-full object-cover border border-[#E3E6E5]"
            />
            <div className="min-w-0 flex-1">
              <p className="text-meta font-medium text-[#111111] truncate">
                {WORKSPACE_NAME}
              </p>
              <p className="text-caption text-[#5F6368]">1 member</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setWorkspacePopoverOpen(false);
              setInviteModalOpen(true);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-meta font-medium text-[#111111] bg-[#DDF3C8] hover:bg-[#cceeb8] transition-colors"
          >
            <UserPlus size={18} strokeWidth={1.8} />
            Invite teammates
          </button>
        </div>
      )}

    </div>

      {/* Invite modal */}
      {inviteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 cursor-pointer"
          onClick={() => setInviteModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-modal-title"
        >
          <div
            className="rounded-2xl border border-[#E3E6E5] shadow-[0_2px_8px_rgba(0,0,0,0.06)] bg-[#FFFFFF] p-6 max-w-md w-full cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="invite-modal-title"
              className="text-h3 font-semibold leading-tight text-[#111111]"
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
              className="mt-4 w-full px-4 py-2.5 rounded-full border border-[#E3E6E5] text-[#111111] placeholder:text-[#111111] focus:outline-none focus:border-[#D1D5DB] focus:shadow-[0_0_0_3px_rgba(209,213,219,0.4)]"
            />
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="px-4 py-2.5 text-meta font-medium rounded-full text-[#111111] hover:bg-[#E9ECEB] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setInviteModalOpen(false);
                  setInviteEmail("");
                }}
                className="primary-cta px-4 py-2.5 text-meta rounded-full transition-colors"
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
