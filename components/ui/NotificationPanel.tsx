"use client";

import { MessageSquare, Share2 } from "lucide-react";
import { useMemo, useState } from "react";

export type NotificationKind = "comment" | "share";

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  time: string;
  read: boolean;
};

type NotificationTab = "overview" | "comments" | "shared";

export function NotificationPanel({
  open,
  notifications,
  onNotificationsChange,
}: {
  open: boolean;
  notifications: AppNotification[];
  onNotificationsChange: (next: AppNotification[]) => void;
}) {
  const [activeTab, setActiveTab] = useState<NotificationTab>("overview");

  const filtered = useMemo(() => {
    if (activeTab === "overview") {
      return notifications;
    }
    if (activeTab === "comments") {
      return notifications.filter((n) => n.kind === "comment");
    }
    return notifications.filter((n) => n.kind === "share");
  }, [activeTab, notifications]);

  const markRead = (id: string) => {
    onNotificationsChange(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  if (!open) return null;

  return (
    <div className="notification-panel" role="dialog" aria-modal="false" aria-label="Notifications">
      <div className="notification-panel-inner">
        <div className="notification-panel-header">
          <div className="notification-panel-title">Notifications</div>
        </div>

        <div className="notification-panel-tabs" role="tablist" aria-label="Notification sections">
          <button
            type="button"
            className={`notification-panel-tab ${activeTab === "overview" ? "notification-panel-tab--active" : ""}`}
            onClick={() => setActiveTab("overview")}
            role="tab"
            aria-selected={activeTab === "overview"}
          >
            Overview
          </button>
          <button
            type="button"
            className={`notification-panel-tab ${activeTab === "comments" ? "notification-panel-tab--active" : ""}`}
            onClick={() => setActiveTab("comments")}
            role="tab"
            aria-selected={activeTab === "comments"}
          >
            Comments
          </button>
          <button
            type="button"
            className={`notification-panel-tab ${activeTab === "shared" ? "notification-panel-tab--active" : ""}`}
            onClick={() => setActiveTab("shared")}
            role="tab"
            aria-selected={activeTab === "shared"}
          >
            Shared
          </button>
        </div>

        <div className="notification-panel-list">
          {filtered.map((n) => (
            <button
              key={n.id}
              type="button"
              className={`notification-item ${n.read ? "read" : "unread"}`}
              onClick={() => markRead(n.id)}
            >
              {n.kind === "comment" ? (
                <MessageSquare className="notification-icon" strokeWidth={2} aria-hidden />
              ) : (
                <Share2 className="notification-icon" strokeWidth={2} aria-hidden />
              )}
              <div className="notification-item-body">
                <p className="notification-item-title title">{n.title}</p>
                <span className="notification-item-time time">{n.time}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
