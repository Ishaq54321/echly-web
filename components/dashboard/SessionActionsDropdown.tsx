"use client";

import { authFetch } from "@/lib/authFetch";
import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  Archive,
  Link2,
  Loader2,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Trash2,
  UserPlus,
} from "lucide-react";
import type { Session } from "@/lib/domain/session";
import { ShareModal } from "@/components/share/ShareModal";
import { RenameSessionModal } from "@/components/dashboard/RenameSessionModal";
import { copySessionLink } from "@/utils/copySessionLink";
import {
  assertIdentityResolved,
  useWorkspace,
} from "@/lib/client/workspaceContext";
import { PORTAL_DROPDOWN_Z_INDEX } from "@/lib/ui/zIndex";
import {
  getPortalDropdownFixedPosition,
  PORTAL_DROPDOWN_HEIGHT_ESTIMATE_PX,
} from "@/lib/ui/portalDropdownPosition";

export type SessionActionMenuKey =
  | "copyLink"
  | "share"
  | "rename"
  | "archive"
  | "delete";

const SESSION_ACTION_MENU_ORDER: SessionActionMenuKey[] = [
  "copyLink",
  "share",
  "rename",
  "archive",
  "delete",
];

export interface SessionActionsDropdownProps {
  session: Session;
  onRenameSuccess?: (session: {
    id: string;
    title: string;
    updatedAt?: unknown;
  }) => void;
  onSetArchived?: (sessionId: string, archived: boolean) => Promise<void> | void;
  onRequestDelete?: (session: Session) => void;
  /** When true, menu opens upward if there is not enough space below. */
  flipPlacement?: boolean;
  /**
   * `card` — layer tokens (workspace grid). `list` — neutral (sessions table).
   */
  variant?: "card" | "list";
  disabled?: boolean;
  triggerClassName?: string;
  triggerIconClassName?: string;
  triggerAriaLabel?: string;
  /** Called after clipboard copy succeeds (e.g. grid card “Link copied” tooltip). */
  onCopyLinkSuccess?: () => void;
  /** For parent UI (e.g. hover tooltip) that must hide while the menu is open. */
  onOpenChange?: (open: boolean) => void;
  /** Omit menu rows (e.g. when Copy link / Share exist as separate controls). */
  hideActions?: SessionActionMenuKey[];
}

export function SessionActionsDropdown({
  session,
  onRenameSuccess,
  onSetArchived,
  onRequestDelete,
  flipPlacement = true,
  variant = "list",
  disabled = false,
  triggerClassName = "",
  triggerIconClassName = "h-4 w-4",
  triggerAriaLabel = "More actions",
  onCopyLinkSuccess,
  onOpenChange,
  hideActions,
}: SessionActionsDropdownProps) {
  const { authUid, isIdentityResolved } = useWorkspace();
  const [moreOpen, setMoreOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [dropdownPlacement, setDropdownPlacement] = useState<"above" | "below">(
    "below"
  );
  const [shareOpen, setShareOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [copyLinkBusy, setCopyLinkBusy] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const firstMenuItemRef = useRef<HTMLButtonElement>(null);

  const isOptimistic = Boolean(session.isOptimistic);
  const isArchived = (session.isArchived ?? session.archived) === true;

  const hidden = new Set(hideActions ?? []);
  const visibleMenuKeys = SESSION_ACTION_MENU_ORDER.filter((k) => !hidden.has(k));
  const showSeparatorBeforeDelete =
    visibleMenuKeys.includes("delete") && visibleMenuKeys.indexOf("delete") > 0;

  const closeMenu = useCallback(() => {
    setMoreOpen(false);
    setDropdownPosition(null);
    onOpenChange?.(false);
  }, [onOpenChange]);

  const syncDropdownPosition = useCallback(() => {
    const trigger = triggerRef.current;
    const menu = menuRef.current;
    if (!trigger || !moreOpen) return;
    const rect = trigger.getBoundingClientRect();
    const menuW = menu?.offsetWidth;
    const menuH = menu?.offsetHeight ?? 0;
    const gap = 8;
    let placement: "above" | "below" = "below";
    if (flipPlacement) {
      const effectiveH =
        menuH > 0 ? menuH : PORTAL_DROPDOWN_HEIGHT_ESTIMATE_PX;
      const spaceBelow = window.innerHeight - rect.bottom - gap;
      const spaceAbove = rect.top - gap;
      placement =
        spaceBelow < effectiveH && spaceAbove > spaceBelow ? "above" : "below";
      setDropdownPlacement(placement);
    } else {
      setDropdownPlacement("below");
    }

    setDropdownPosition(
      getPortalDropdownFixedPosition(rect, {
        menuWidthPx: menuW,
        menuHeightPx: menuH > 0 ? menuH : undefined,
        placement: flipPlacement ? placement : "below",
      })
    );
  }, [moreOpen, flipPlacement]);

  useLayoutEffect(() => {
    if (!moreOpen || typeof document === "undefined") return;
    syncDropdownPosition();
    const id = requestAnimationFrame(() => syncDropdownPosition());
    return () => cancelAnimationFrame(id);
  }, [moreOpen, syncDropdownPosition]);

  useEffect(() => {
    if (!moreOpen) return;
    window.addEventListener("scroll", syncDropdownPosition, true);
    window.addEventListener("resize", syncDropdownPosition);
    return () => {
      window.removeEventListener("scroll", syncDropdownPosition, true);
      window.removeEventListener("resize", syncDropdownPosition);
    };
  }, [moreOpen, syncDropdownPosition]);

  useEffect(() => {
    if (!moreOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const inTrigger = triggerRef.current?.contains(target);
      const inMenu = menuRef.current?.contains(target);
      if (!inTrigger && !inMenu) closeMenu();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [moreOpen, closeMenu]);

  useEffect(() => {
    if (!moreOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu();
        return;
      }
      const menu = menuRef.current;
      if (!menu) return;
      const items = Array.from(
        menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')
      );
      const currentIndex = items.indexOf(document.activeElement as HTMLButtonElement);
      if (e.key === "ArrowDown" && currentIndex < items.length - 1) {
        e.preventDefault();
        items[currentIndex + 1]?.focus();
      } else if (e.key === "ArrowUp" && currentIndex > 0) {
        e.preventDefault();
        items[currentIndex - 1]?.focus();
      } else if (e.key === "Home") {
        e.preventDefault();
        items[0]?.focus();
      } else if (e.key === "End") {
        e.preventDefault();
        items[items.length - 1]?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [moreOpen, closeMenu]);

  useEffect(() => {
    if (moreOpen) firstMenuItemRef.current?.focus();
  }, [moreOpen]);

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (copyLinkBusy) return;
    assertIdentityResolved(isIdentityResolved);
    const ok = await copySessionLink(session.id, authUid, {
      onBusy: setCopyLinkBusy,
    });
    if (ok) onCopyLinkSuccess?.();
    closeMenu();
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShareOpen(true);
    closeMenu();
  };

  const handleRenameClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOptimistic || disabled) return;
    setRenameOpen(true);
    closeMenu();
  };

  const handleArchiveToggleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOptimistic || disabled) return;
    closeMenu();
    if (archiving || !onSetArchived) return;
    setArchiving(true);
    try {
      await onSetArchived(session.id, !isArchived);
    } finally {
      setArchiving(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOptimistic || disabled) return;
    onRequestDelete?.(session);
    closeMenu();
  };

  const handleRenameSave = async (title: string) => {
    assertIdentityResolved(isIdentityResolved);
    const res = await authFetch(`/api/sessions/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res) throw new Error("Failed to rename");
    if (!res.ok) throw new Error("Failed to rename");
    const data = (await res.json()) as {
      success?: boolean;
      session?: { id: string; title: string; updatedAt?: unknown };
    };
    if (data.success && data.session && onRenameSuccess) {
      onRenameSuccess(data.session);
    }
  };

  const menuItemClass =
    variant === "card"
      ? "dropdown-item transition-colors duration-[var(--motion-duration)] cursor-pointer flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)]"
      : "dropdown-item text-neutral-900 transition-colors cursor-pointer flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]/30";

  const menuShellClass =
    variant === "card"
      ? "workspace-card-dropdown session-actions-dropdown dropdown-menu border border-[var(--layer-1-border)] bg-[var(--layer-1-bg)]"
      : "session-actions-dropdown session-actions-dropdown-portal dropdown-menu border border-neutral-200 bg-white";

  const deleteItemClass =
    variant === "card"
      ? "dropdown-item delete transition-colors duration-[var(--motion-duration)] cursor-pointer flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)]"
      : "dropdown-item delete flex cursor-pointer items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]/30";

  const separatorClass =
    variant === "card"
      ? "my-1 border-t border-[var(--glass-1-border)]"
      : "my-1 border-t border-neutral-200";

  const transformOrigin =
    dropdownPlacement === "above" ? "bottom right" : "top right";

  const triggerEl = (
    <button
      ref={triggerRef}
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isOptimistic || disabled) return;
        setMoreOpen((prev) => {
          const next = !prev;
          onOpenChange?.(next);
          return next;
        });
      }}
      aria-label={triggerAriaLabel}
      aria-expanded={moreOpen}
      aria-haspopup="menu"
      disabled={isOptimistic || disabled}
      className={triggerClassName}
    >
      <MoreHorizontal
        className={triggerIconClassName}
        strokeWidth={1.6}
        aria-hidden
      />
    </button>
  );

  return (
    <>
      {variant === "card" ? (
        <div data-card-actions className="contents">
          {triggerEl}
        </div>
      ) : (
        triggerEl
      )}

      {moreOpen &&
        dropdownPosition &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label="Session actions"
            data-card-actions={variant === "card" ? true : undefined}
            className={menuShellClass}
            style={{
              position: "fixed",
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              zIndex: PORTAL_DROPDOWN_Z_INDEX,
              transformOrigin,
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {visibleMenuKeys.map((key, index) => {
              const itemRef = index === 0 ? firstMenuItemRef : undefined;
              switch (key) {
                case "copyLink":
                  return (
                    <button
                      key={key}
                      ref={itemRef}
                      type="button"
                      onClick={handleCopyLink}
                      disabled={copyLinkBusy}
                      className={menuItemClass}
                      role="menuitem"
                    >
                      {copyLinkBusy ? (
                        <Loader2 className="shrink-0 animate-spin" strokeWidth={1.6} aria-hidden />
                      ) : (
                        <Link2 className="shrink-0" strokeWidth={1.6} aria-hidden />
                      )}
                      {copyLinkBusy ? "Copying…" : "Copy link"}
                    </button>
                  );
                case "share":
                  return (
                    <button
                      key={key}
                      ref={itemRef}
                      type="button"
                      onClick={handleShare}
                      className={menuItemClass}
                      role="menuitem"
                    >
                      <UserPlus className="shrink-0" strokeWidth={1.6} aria-hidden />
                      Share
                    </button>
                  );
                case "rename":
                  return (
                    <button
                      key={key}
                      ref={itemRef}
                      type="button"
                      onClick={handleRenameClick}
                      className={menuItemClass}
                      role="menuitem"
                    >
                      <Pencil className="shrink-0" strokeWidth={1.6} aria-hidden />
                      Rename
                    </button>
                  );
                case "archive":
                  return (
                    <button
                      key={key}
                      ref={itemRef}
                      type="button"
                      onClick={handleArchiveToggleClick}
                      disabled={archiving || !onSetArchived}
                      className={[
                        menuItemClass,
                        "disabled:opacity-60",
                        isArchived
                          ? "group text-gray-900 hover:bg-gray-100 hover:text-gray-900"
                          : "",
                      ].join(" ")}
                      role="menuitem"
                    >
                      {isArchived ? (
                        <RotateCcw
                          className="shrink-0 text-gray-700 group-hover:text-gray-900"
                          strokeWidth={1.6}
                          aria-hidden
                        />
                      ) : (
                        <Archive className="shrink-0" strokeWidth={1.6} aria-hidden />
                      )}
                      {archiving
                        ? isArchived
                          ? "Unarchiving…"
                          : "Archiving…"
                        : isArchived
                          ? "Unarchive"
                          : "Archive"}
                    </button>
                  );
                case "delete":
                  return (
                    <Fragment key={key}>
                      {showSeparatorBeforeDelete ? (
                        <div className={separatorClass} role="separator" aria-hidden />
                      ) : null}
                      <button
                        ref={itemRef}
                        type="button"
                        onClick={handleDeleteClick}
                        disabled={!onRequestDelete}
                        className={deleteItemClass}
                        role="menuitem"
                      >
                        <Trash2 className="shrink-0" strokeWidth={1.6} aria-hidden />
                        Delete
                      </button>
                    </Fragment>
                  );
                default:
                  return null;
              }
            })}
          </div>,
          document.body
        )}

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        sessionId={session.id}
        sessionTitle={session.title}
      />
      <RenameSessionModal
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        sessionId={session.id}
        currentTitle={session.title}
        onSave={handleRenameSave}
      />
    </>
  );
}
