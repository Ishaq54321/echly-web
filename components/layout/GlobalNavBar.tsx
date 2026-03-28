"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Link2,
  Loader2,
  MoreHorizontal,
  Search,
  Bell,
} from "lucide-react";
import { useState, useCallback } from "react";
import {
  assertIdentityResolved,
  useWorkspace,
} from "@/lib/client/workspaceContext";
import { getOrCreateShareLink } from "@/lib/share/getOrCreateShareLink";

function dashboardSessionIdFromPath(pathname: string | null): string | null {
  if (!pathname) return null;
  const m = /^\/dashboard\/([^/]+)/.exec(pathname);
  const id = m?.[1]?.trim() ?? "";
  if (!id || id === "insights") return null;
  return id;
}

export function GlobalNavBar() {
  const pathname = usePathname();
  const { authUid, isIdentityResolved } = useWorkspace();
  const sessionId = dashboardSessionIdFromPath(pathname);
  const [copied, setCopied] = useState(false);
  const [copyBusy, setCopyBusy] = useState(false);

  const handleCopyLink = useCallback(async () => {
    if (typeof window === "undefined" || copyBusy) return;
    if (!sessionId) return;
    assertIdentityResolved(isIdentityResolved);
    const uid = authUid?.trim();
    if (!uid) throw new Error("Auth uid missing");
    setCopyBusy(true);
    try {
      const url = await getOrCreateShareLink({
        sessionId,
        userId: uid,
        origin: window.location.origin,
      });
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    } finally {
      setCopyBusy(false);
    }
  }, [sessionId, copyBusy, authUid, isIdentityResolved]);

  const iconButtonClass =
    "h-10 w-10 flex items-center justify-center rounded-xl text-[hsl(var(--text-tertiary))] hover:bg-[var(--layer-2-hover-bg)] hover:text-[hsl(var(--text-primary-strong))] transition-colors duration-[var(--motion-duration-fast)] cursor-pointer shrink-0";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[56px] w-full bg-[var(--layer-1-bg)] border-b border-[var(--layer-1-border)] shadow-[var(--shadow-level-1)] flex items-center justify-between px-6">
      <Link href="/dashboard" className="flex items-center cursor-pointer hover:underline" aria-label="Echly home">
        <Image
          src="/Echly_logo.svg"
          alt="Echly"
          width={28}
          height={26}
          className="h-[26px] w-auto"
        />
      </Link>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="focus-ring-brand text-[14px] px-4 py-2 rounded-lg bg-brand-primary text-white hover:opacity-90 active:scale-[0.98] font-medium transition-colors duration-150 cursor-pointer"
        >
          Share
        </button>
        <button
          type="button"
          onClick={handleCopyLink}
          disabled={!sessionId || copyBusy}
          className={iconButtonClass}
          title={
            !sessionId
              ? "Open a session to copy a public link"
              : copyBusy
                ? "Generating link…"
                : copied
                  ? "Copied"
                  : "Copy link"
          }
          aria-label={
            !sessionId
              ? "Copy link unavailable outside a session"
              : copyBusy
                ? "Generating link…"
                : copied
                  ? "Copied"
                  : "Copy link"
          }
        >
          {copyBusy ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} aria-hidden />
          ) : (
            <Link2 className="h-4 w-4" strokeWidth={1.5} />
          )}
        </button>
        <button
          type="button"
          className={iconButtonClass}
          aria-label="More options"
        >
          <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          className={iconButtonClass}
          aria-label="Search"
        >
          <Search className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          className={iconButtonClass}
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          className={`${iconButtonClass} rounded-full overflow-hidden`}
          aria-label="User menu"
        >
          <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center text-[14px] font-medium text-secondary">
            U
          </div>
        </button>
      </div>
    </header>
  );
}
