"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import type { Comment } from "@/lib/comments";
import { ActivityComposer } from "@/components/session/feedbackDetail/ActivityComposer";
import { ActivityThread } from "@/components/session/feedbackDetail/ActivityThread";

export interface ActivitySlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  comments: Comment[];
  loading: boolean;
  sendComment: (message: string) => void;
  /** Optional: show resolve history when resolved */
  isResolved?: boolean;
  updatedAt?: string | { seconds: number } | null;
  /** When "sidebar", render inline (no overlay/backdrop). Use inside a push-layout column. */
  variant?: "overlay" | "sidebar";
}

const PANEL_WIDTH = 400;

function formatResolvedDate(
  value: string | { seconds: number } | null | undefined
): string {
  if (value == null) return "Resolved";
  if (typeof value === "string") {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      return `Resolved on ${d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    }
  }
  if (typeof value === "object" && typeof value.seconds === "number") {
    const d = new Date(value.seconds * 1000);
    return `Resolved on ${d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  }
  return "Resolved";
}

function ActivityPanelContent({
  onClose,
  comments,
  loading,
  newMessage,
  setNewMessage,
  handleSend,
  isResolved,
  updatedAt,
}: {
  onClose: () => void;
  comments: Comment[];
  loading: boolean;
  newMessage: string;
  setNewMessage: (v: string) => void;
  handleSend: (message: string) => void;
  isResolved?: boolean;
  updatedAt?: string | { seconds: number } | null;
}) {
  return (
    <>
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-[var(--layer-2-border)]">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.08em] text-[hsl(var(--text-tertiary))]">
          Activity
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-md text-[hsl(var(--text-tertiary))] hover:bg-[var(--layer-2-hover-bg)] hover:text-[hsl(var(--text-primary-strong))] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-operational)]"
          aria-label="Close activity panel"
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>

      <div className="shrink-0 px-4 py-3 border-b border-[var(--layer-2-border)]">
        <ActivityComposer
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSend={handleSend}
          placeholder="Add a note or update…"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="px-4 py-4">
          <ActivityThread comments={comments} loading={loading} />
          {isResolved && (
            <div className="mt-4 pt-4 border-t border-[var(--layer-2-border)]">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[hsl(var(--text-tertiary))]">
                Resolve history
              </p>
              <p className="mt-1 text-[12px] text-[hsl(var(--text-secondary-soft))]">
                {formatResolvedDate(updatedAt)}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export function ActivitySlideOver({
  isOpen,
  onClose,
  comments,
  loading,
  sendComment,
  isResolved,
  updatedAt,
  variant = "overlay",
}: ActivitySlideOverProps) {
  const [newMessage, setNewMessage] = useState("");

  const handleSend = useCallback(
    (message: string) => {
      const trimmed = message.trim();
      if (!trimmed) return;
      sendComment(trimmed);
      setNewMessage("");
    },
    [sendComment]
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const panelContent = (
    <ActivityPanelContent
      onClose={onClose}
      comments={comments}
      loading={loading}
      newMessage={newMessage}
      setNewMessage={setNewMessage}
      handleSend={handleSend}
      isResolved={isResolved}
      updatedAt={updatedAt}
    />
  );

  if (variant === "sidebar") {
    return (
      <aside
        role="complementary"
        aria-label="Activity"
        className="h-full min-w-0 flex flex-col bg-[var(--canvas-base)] border-l border-[var(--layer-2-border)]"
      >
        {panelContent}
      </aside>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-150"
        onClick={onClose}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-label="Activity"
        style={{ width: PANEL_WIDTH }}
        className="fixed top-0 right-0 bottom-0 z-50 flex flex-col bg-[var(--canvas-base)] border-l border-[var(--layer-2-border)] shadow-[var(--elevation-2)]"
      >
        {panelContent}
      </aside>
    </>
  );
}
