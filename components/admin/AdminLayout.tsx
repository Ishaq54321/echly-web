"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CreditCard, Users, BarChart3 } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/plans", icon: CreditCard, label: "Plans" },
  { href: "/admin/customers", icon: Users, label: "Customers" },
  { href: "/admin/usage", icon: BarChart3, label: "Usage" },
] as const;

function isActive(href: string, pathname: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <aside
        className="w-56 border-r border-neutral-200 flex flex-col bg-white shrink-0"
        aria-label="Admin navigation"
      >
        <div className="flex items-center gap-2 h-14 px-4 border-b border-neutral-200">
          <Link
            href="/admin"
            className="flex items-center gap-2 rounded-md py-1 pr-2"
            aria-label="Echly Admin"
          >
            <span className="relative block w-8 h-8 bg-[#155DFC] rounded-md overflow-hidden">
              <Image
                src="/Echly_logo.svg"
                alt=""
                fill
                sizes="32px"
                className="object-cover"
              />
            </span>
            <span className="text-sm font-semibold text-neutral-900">
              Echly Admin
            </span>
          </Link>
        </div>
        <nav className="flex flex-col gap-0.5 p-3" aria-label="Admin">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = isActive(href, pathname);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  active
                    ? "bg-[#EAF1FF] text-[#155DFC]"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="w-[18px] h-[18px] stroke-[1.8]" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto p-3 border-t border-neutral-200">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition"
          >
            ← Back to app
          </Link>
        </div>
      </aside>
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
