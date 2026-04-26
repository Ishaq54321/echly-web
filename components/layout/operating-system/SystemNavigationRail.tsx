"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Command,
  Inbox,
  LayoutGrid,
  Archive,
  Settings,
} from "lucide-react";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { ProfileCommandPanel } from "@/components/layout/ProfileCommandPanel";
import { useWorkspace } from "@/lib/client/workspaceContext";

const NAV_GROUPS = [
  {
    label: "Primary",
    items: [
      { href: "#", icon: Command, label: "Search", shortcut: "⌘K" },
      { href: "/dashboard", icon: Inbox, label: "Dashboard" },
      { href: "/dashboard", icon: LayoutGrid, label: "Sessions" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/dashboard?view=archived", icon: Archive, label: "Archive" },
      { href: "/dashboard/settings", icon: Settings, label: "Settings" },
    ],
  },
] as const;

function isActive(href: string, label: string, pathname: string): boolean {
  if (href === "/dashboard") {
    if (label === "Sessions")
      return (
        pathname.startsWith("/session/") ||
        (pathname.startsWith("/dashboard/") && pathname !== "/dashboard")
      );
    if (label === "Dashboard") return pathname === "/dashboard";
  }
  if (href.startsWith("/dashboard?")) return pathname === "/dashboard";
  if (href === "/dashboard/settings") return pathname.startsWith("/dashboard/settings");
  return pathname.startsWith(href);
}

export interface SystemNavigationRailProps {
  onOpenCommandPalette?: () => void;
}

export function SystemNavigationRail({ onOpenCommandPalette }: SystemNavigationRailProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthGuard({ router });
  const { avatarUrl } = useWorkspace();
  const [profileOpen, setProfileOpen] = useState(false);
  const avatarRef = React.useRef<HTMLButtonElement>(null);

  return (
    <aside
      className="w-14 h-screen flex flex-col items-center border-r border-border bg-background py-4 shrink-0"
      aria-label="System navigation"
    >
      {/* Section A — Logo */}
      <div className="flex-shrink-0 mb-3">
        <Link
          href="/dashboard"
          className="w-[34px] h-[34px] rounded-full bg-[var(--brand)] flex items-center justify-center overflow-hidden flex-shrink-0"
          aria-label="Echly home"
        >
          <Image
            src="/Echly_logo.svg"
            alt=""
            width={18}
            height={18}
            sizes="18px"
            className="w-[18px] h-[18px]"
          />
        </Link>
      </div>

      {/* Section B — Nav icons */}
      <nav className="flex flex-col items-center gap-1 flex-1" aria-label="Main">
        {NAV_GROUPS.map((group) =>
          group.items.map((item) => {
            const Icon = item.icon;
            const isCommand = item.href === "#";
            const active = !isCommand && isActive(item.href, item.label, pathname);

            const title =
              "shortcut" in item && item.shortcut
                ? `${item.label} (${item.shortcut})`
                : item.label;

            const content = (
              <Icon className="w-[17px] h-[17px]" strokeWidth={1.5} />
            );

            if (isCommand && onOpenCommandPalette) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={onOpenCommandPalette}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  aria-label={title}
                  title={title}
                >
                  {content}
                </button>
              );
            }

            if (item.href === "#") {
              return (
                <span
                  key={item.label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground"
                  title={title}
                >
                  {content}
                </span>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className={
                  active
                    ? "w-9 h-9 rounded-lg flex items-center justify-center bg-muted text-foreground"
                    : "w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                }
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                title={title}
              >
                {content}
              </Link>
            );
          })
        )}
      </nav>

      {/* Section C — Profile */}
      <div className="flex flex-col items-center gap-0 mt-auto pb-1">
        <div className="w-6 h-px bg-border mb-2.5" />
        <button
          ref={avatarRef}
          type="button"
          aria-label="Profile"
          aria-expanded={profileOpen}
          className="w-[30px] h-[30px] rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
          onClick={() => setProfileOpen((v) => !v)}
        >
          <UserAvatar
            avatarUrl={avatarUrl}
            image={(user as { image?: string | null } | null)?.image}
            photoURL={user?.photoURL}
            name={
              user?.displayName?.trim() ||
              user?.email?.split("@")[0] ||
              undefined
            }
            className="h-full w-full"
          />
        </button>
        <ProfileCommandPanel
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          user={user}
          anchorRef={avatarRef}
        />
      </div>
    </aside>
  );
}
