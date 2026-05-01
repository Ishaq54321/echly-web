"use client";

import { Bell } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { NotificationPanel } from "@/components/ui/NotificationPanel";
import {
  fetchNotifications,
  useNotificationStore,
} from "@/lib/store/notificationStore";

export type GlobalNotificationButtonProps = {
  /** Controlled open state (optional). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function GlobalNotificationButton({
  open: controlledOpen,
  onOpenChange,
}: GlobalNotificationButtonProps = {}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const { unreadCount } = useNotificationStore();

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  const handleToggle = useCallback(() => {
    const next = !open;
    setOpen(next);
    if (next) {
      // Refresh on open so the list reflects any reads/new arrivals since last view.
      void fetchNotifications();
    }
  }, [open, setOpen]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open, setOpen]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--surface-hover)] transition-colors cursor-pointer border-0 bg-transparent"
        aria-label="Notifications"
        onClick={handleToggle}
      >
        <Bell size={22} strokeWidth={2.2} className="text-[var(--text-heading)]" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[var(--color-danger)] text-white text-[10px] font-semibold flex items-center justify-center leading-none ring-2 ring-[var(--surface-subtle)]"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
      <NotificationPanel open={open} onClose={handleClose} />
    </div>
  );
}
