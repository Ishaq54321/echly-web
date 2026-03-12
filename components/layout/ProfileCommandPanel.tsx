"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  X,
  CreditCard,
  ArrowUpCircle,
  Puzzle,
  Keyboard,
  HelpCircle,
  User,
  LogOut,
  Pencil,
} from "lucide-react";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const insightCards = [
  { label: "saved reviewing feedback", value: "15h" },
  { label: "issues captured", value: "187" },
  { label: "replies made", value: "30" },
];

const upgradeNudges = [
  "Upgrade to unlock AI insights",
  "Upgrade for team collaboration",
  "Upgrade to remove Echly branding",
];

const menuItems = [
  { label: "Billing", icon: CreditCard, href: "/settings#billing" },
  { label: "Upgrade plan", icon: ArrowUpCircle, href: "/settings" },
  { label: "Install Chrome Extension", icon: Puzzle, href: "/settings" },
  { label: "Keyboard Shortcuts", icon: Keyboard, href: "#" },
  { label: "Help & Support", icon: HelpCircle, href: "#" },
  { label: "View profile", icon: User, href: "/settings" },
] as const;

const iconGray = "#6B7280";

export interface ProfileCommandPanelProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileCommandPanel({ open, onClose }: ProfileCommandPanelProps) {
  const router = useRouter();
  const { user } = useAuthGuard();
  const panelRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    onClose();
    await signOut(auth);
    router.push("/login");
  };

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const displayName =
    user?.displayName?.trim() || user?.email?.split("@")[0] || "User";
  const photoURL = user?.photoURL || "/avatar-placeholder.png";

  if (!open) return null;

  return (
    <>
      {/* Backdrop — click to close */}
      <div
        className="fixed inset-0 z-[1100] bg-black/20"
        aria-hidden
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Profile"
        className="fixed top-0 right-0 z-[1101] h-full w-[360px] flex flex-col bg-[#FFFFFF] border-l border-[#E5E7EB] animate-[slideInRight_0.2s_ease-out]"
        style={{
          boxShadow: "-8px 0 24px rgba(0,0,0,0.08)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0.6; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}</style>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#E9ECEB] transition-colors"
        >
          <X size={20} strokeWidth={1.8} />
        </button>

        <div className="flex flex-col flex-1 overflow-y-auto pt-6 pb-8">
          {/* ——— Section 1: User header ——— */}
          <div className="px-6 pb-6">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-full overflow-hidden bg-[#F1F3F2] border border-[#E3E6E5]">
                <Image
                  src={photoURL}
                  alt=""
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-[15px] font-semibold text-[#111111] leading-tight truncate">
                  {displayName}
                </p>
                <p className="text-[13px] text-[#6B7280] mt-0.5">
                  Admin · Workspace
                </p>
                <Link
                  href="/settings"
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 mt-3 text-[13px] font-medium text-[#111111] hover:text-[#374151] transition-colors"
                >
                  <Pencil size={14} strokeWidth={1.8} style={{ color: iconGray }} />
                  Edit profile
                </Link>
              </div>
            </div>
          </div>

          {/* ——— Section 2: Value insights ——— */}
          <div className="px-6 pb-6">
            <p className="text-[12px] font-medium uppercase tracking-wider text-[#6B7280] mb-3">
              Your impact
            </p>
            <div className="grid grid-cols-1 gap-2">
              {insightCards.map(({ value, label }) => (
                <div
                  key={label}
                  className="rounded-[10px] p-3"
                  style={{ background: "#F9FAFB" }}
                >
                  <p className="text-[15px] font-semibold text-[#111111]">{value}</p>
                  <p className="text-[13px] text-[#6B7280]">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-3">
              {upgradeNudges.map((text) => (
                <div
                  key={text}
                  className="flex items-center justify-between gap-3 rounded-[10px] p-3"
                  style={{ background: "#F9FAFB" }}
                >
                  <span className="text-[13px] text-[#374151]">{text}</span>
                  <Link
                    href="/settings"
                    onClick={onClose}
                    className="shrink-0 px-3 py-1.5 text-[13px] font-medium text-[#111111] bg-[#E9ECEB] hover:bg-[#D1D5DB] rounded-lg transition-colors"
                  >
                    Upgrade
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* ——— Section 3: Account actions ——— */}
          <div className="px-6 flex-1">
            <p className="text-[12px] font-medium uppercase tracking-wider text-[#6B7280] mb-3">
              Account
            </p>
            <nav className="flex flex-col gap-0.5">
              {menuItems.map(({ label, icon: Icon, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={onClose}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-lg text-[14px] text-[#374151] hover:bg-[#E9ECEB] transition-colors"
                >
                  <Icon size={18} strokeWidth={1.8} style={{ color: iconGray }} />
                  {label}
                </Link>
              ))}
            </nav>

            {/* Divider + Sign out */}
            <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full py-2.5 px-3 rounded-lg text-[14px] font-medium text-red-600 hover:bg-[#E9ECEB] transition-colors cursor-pointer text-left"
              >
                <LogOut size={18} strokeWidth={1.8} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
