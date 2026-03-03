"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Folder, Box } from "lucide-react";

/** Dashboard and Sessions only; Capture, Analytics, Settings temporarily removed. */
const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard", icon: Folder, label: "Sessions" },
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
          className="flex items-center justify-center w-10 h-10 rounded-lg text-neutral-500 transition-colors duration-150 hover:bg-white hover:text-neutral-900 cursor-pointer"
          aria-label="Echly home"
        >
          <Box className="h-[18px] w-[18px]" strokeWidth={1.5} />
        </Link>
      </div>

      <nav className="flex flex-col items-center gap-1" aria-label="Main">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = isActive(href, label, pathname);
          return (
            <div key={label} className="relative group">
              <Link
                href={href}
                className={`relative flex items-center justify-center w-10 h-10 rounded-lg text-neutral-500 transition-colors duration-150 hover:bg-white hover:text-neutral-900 cursor-pointer ${
                  active ? "bg-white text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)]" : ""
                }`}
                aria-label={label}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </Link>
                <span
                className="absolute left-full ml-3 px-2 py-1 text-xs rounded-md bg-white border border-neutral-200 shadow-[0_1px_2px_rgba(0,0,0,0.06)] opacity-0 group-hover:opacity-100 transition-opacity duration-150"
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
