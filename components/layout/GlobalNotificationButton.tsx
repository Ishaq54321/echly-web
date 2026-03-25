"use client";

import { Bell } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type AppNotification,
  NotificationPanel,
} from "@/components/ui/NotificationPanel";

const initialNotifications: AppNotification[] = [
  { id: "n1", kind: "comment", title: "New comment on UI Update", time: "2h ago", read: false },
  { id: "n2", kind: "share", title: "A new video was shared with your team", time: "5h ago", read: false },
  { id: "n3", kind: "comment", title: "3 threads need your attention", time: "1d ago", read: true },
];

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
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

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
        className="icon-btn notification"
        aria-label="Notifications"
        onClick={() => setOpen(!open)}
      >
        <Bell size={20} strokeWidth={2} />
        {unreadCount > 0 && <span className="badge">{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </button>
      <NotificationPanel
        open={open}
        notifications={notifications}
        onNotificationsChange={setNotifications}
      />
    </div>
  );
}
