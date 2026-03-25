"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Command,
  Inbox,
  Flag,
  LayoutGrid,
  BarChart2,
  Archive,
  Settings,
} from "lucide-react";

const RAIL_WIDTH = 56;

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
      { href: "/dashboard/insights", icon: BarChart2, label: "Insights" },
      { href: "/dashboard?view=archived", icon: Archive, label: "Archive" },
      { href: "/dashboard/settings", icon: Settings, label: "Settings" },
    ],
  },
] as const;

function isActive(href: string, label: string, pathname: string): boolean {
  if (href === "/dashboard") {
    if (label === "Sessions") return pathname.startsWith("/dashboard/") && pathname !== "/dashboard" && !pathname.startsWith("/dashboard/insights");
    if (label === "Dashboard") return pathname === "/dashboard";
  }
  if (href === "/dashboard/insights") return pathname === "/dashboard/insights";
  if (href.startsWith("/dashboard?")) return pathname === "/dashboard";
  if (href === "/dashboard/settings") return pathname.startsWith("/dashboard/settings");
  return pathname.startsWith(href);
}

export interface SystemNavigationRailProps {
  onOpenCommandPalette?: () => void;
}

export function SystemNavigationRail({ onOpenCommandPalette }: SystemNavigationRailProps) {
  const pathname = usePathname();

  return (
    <aside
      className="shrink-0 flex flex-col items-center bg-[var(--structural-gray-rail)] border-r border-[var(--layer-1-border)] min-h-0"
      style={{ width: RAIL_WIDTH }}
      aria-label="System navigation"
    >
      {/* Logo */}
      <div className="pt-4 pb-6 shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center justify-center w-10 h-10 rounded-lg text-[hsl(var(--text-tertiary))] hover:bg-black/[0.04] hover:text-[hsl(var(--text-primary-strong))] transition-colors duration-[120ms] focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-operational)]"
          aria-label="Echly home"
        >
          <Image
            src="/Echly_logo.svg"
            alt=""
            width={24}
            height={22}
            className="h-[22px] w-auto"
          />
        </Link>
      </div>

      <nav className="flex flex-col items-center gap-1 flex-1 min-h-0 overflow-y-auto py-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col items-center w-full">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isCommand = item.href === "#";
              const active =
                !isCommand && isActive(item.href, item.label, pathname);

              const content = (
                <span
                  className={`relative flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-[120ms] ${
                    active
                      ? "text-[var(--accent-operational)] bg-[var(--accent-operational-muted)]"
                      : "text-[hsl(var(--text-tertiary))] hover:bg-black/[0.04] hover:text-[hsl(var(--text-primary-strong))]"
                  }`}
                >
                  {active && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-[var(--accent-operational)]"
                      aria-hidden
                    />
                  )}
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </span>
              );

              const title =
                "shortcut" in item && item.shortcut
                  ? `${item.label} (${item.shortcut})`
                  : item.label;

              if (isCommand && onOpenCommandPalette) {
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={onOpenCommandPalette}
                    className="group relative mt-1 first:mt-0 flex items-center justify-center w-full py-1 focus:outline-none focus-visible:ring-0"
                    aria-label={title}
                    title={title}
                  >
                    {content}
                    <span className="absolute left-full ml-2 px-2 py-1 text-[11px] font-medium rounded-md bg-white border border-[var(--layer-2-border)] shadow-[var(--elevation-1)] opacity-0 pointer-events-none group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 whitespace-nowrap z-10">
                      {item.label}
                      {"shortcut" in item && item.shortcut && (
                        <span className="ml-1.5 text-[10px] text-[hsl(var(--text-tertiary))]">
                          {item.shortcut}
                        </span>
                      )}
                    </span>
                  </button>
                );
              }

              if (item.href === "#") {
                return (
                  <span
                    key={item.label}
                    className="relative mt-1 first:mt-0 flex items-center justify-center w-full py-1"
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
                  className="group relative mt-1 first:mt-0 flex items-center justify-center w-full py-1 focus:outline-none focus-visible:ring-0"
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                  title={title}
                >
                  {content}
                  <span className="absolute left-full ml-2 px-2 py-1 text-[11px] font-medium rounded-md bg-white border border-[var(--layer-2-border)] shadow-[var(--elevation-1)] opacity-0 pointer-events-none group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 whitespace-nowrap z-10">
                    {item.label}
                    {"shortcut" in item && (item as { shortcut?: string }).shortcut && (
                      <span className="ml-1.5 text-[10px] text-[hsl(var(--text-tertiary))]">
                        {(item as { shortcut: string }).shortcut}
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
