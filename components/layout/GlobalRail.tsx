"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Folder,
  Camera,
  BarChart3,
  Settings,
  Box,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard", icon: Folder, label: "Sessions" },
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
      className="surface-rail w-[72px] min-h-0 flex flex-col items-center py-8 gap-6 border-r border-neutral-200 shrink-0"
      aria-label="Global navigation"
    >
      <div className="relative group">
        <Link
          href="/dashboard"
          className="flex items-center justify-center w-10 h-10 rounded-lg text-neutral-500 transition-all duration-150 ease-out hover:bg-white hover:text-brand-accent"
          aria-label="Echly home"
        >
          <Box className="w-5 h-5" strokeWidth={1.5} />
        </Link>
      </div>

      <nav className="flex flex-col items-center gap-1" aria-label="Main">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = isActive(href, label, pathname);
          return (
            <div key={label} className="relative group">
              <Link
                href={href}
                className={`relative flex items-center justify-center w-10 h-10 rounded-lg text-neutral-500 transition-all duration-150 ease-out hover:bg-white hover:text-brand-accent ${
                  active ? "bg-white text-brand-accent shadow-sm" : ""
                }`}
                aria-label={label}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="w-5 h-5" strokeWidth={1.5} />
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
