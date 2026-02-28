"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Camera,
  BarChart3,
  Settings,
  Box,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard", icon: FolderOpen, label: "Sessions" },
  { href: "/capture", icon: Camera, label: "Capture" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/settings", icon: Settings, label: "Settings" },
] as const;

function isActive(href: string, label: string, pathname: string): boolean {
  if (href === "/dashboard") {
    if (label === "Dashboard") return pathname === "/dashboard";
    if (label === "Sessions") return pathname.startsWith("/dashboard/");
  }
  return pathname.startsWith(href);
}

export default function GlobalRail() {
  const pathname = usePathname();

  return (
    <aside
      className="w-[72px] flex flex-col items-center py-8 gap-6 border-r bg-[hsl(var(--surface-2))] shrink-0"
      aria-label="Global navigation"
    >
      <div className="relative group">
        <Link
          href="/dashboard"
          className="flex items-center justify-center w-10 h-10 rounded-xl text-[hsl(var(--text-primary))] transition-all duration-150 ease-out hover:bg-[hsl(var(--surface-1))]"
          aria-label="Echly home"
        >
          <Box className="w-5 h-5" strokeWidth={2} />
        </Link>
      </div>

      <nav className="flex flex-col items-center gap-1" aria-label="Main">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = isActive(href, label, pathname);
          return (
            <div key={label} className="relative group">
              <Link
                href={href}
                className={`relative flex items-center justify-center w-10 h-10 rounded-xl text-[hsl(var(--text-secondary))] transition-all duration-150 ease-out hover:bg-[hsl(var(--surface-1))] ${
                  active ? "bg-[hsl(var(--surface-1))] text-[hsl(var(--text-primary))]" : ""
                }`}
                aria-label={label}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="w-5 h-5" strokeWidth={1.75} />
                {active && (
                  <span
                    className="absolute right-1 w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent))]"
                    aria-hidden
                  />
                )}
              </Link>
              <span
                className="absolute left-full ml-3 px-2 py-1 text-xs rounded-md bg-[hsl(var(--surface-1))] border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                role="tooltip"
              >
                {label}
              </span>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
