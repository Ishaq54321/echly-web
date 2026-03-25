"use client";

import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { PORTAL_DROPDOWN_Z_INDEX } from "@/lib/ui/zIndex";

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  sessionTitle?: string;
}

type MemberRole = "Viewer" | "Commenter" | "Editor";

type TeamMember = { id: string; name: string; email: string; role: MemberRole };

const LINK_OPTIONS = ["Anyone can view", "Anyone can comment", "Anyone can edit"] as const;
const ROLE_OPTIONS: MemberRole[] = ["Viewer", "Commenter", "Editor"];

function ShareDropdown<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: readonly T[];
  onChange: (next: T) => void;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuRect, setMenuRect] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const syncMenuPosition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setMenuRect({ top: r.bottom + 6, left: r.left, width: r.width });
  };

  useLayoutEffect(() => {
    if (!open) return;
    syncMenuPosition();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
      }
    };
    const onScrollResize = () => syncMenuPosition();
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey, true);
    window.addEventListener("scroll", onScrollResize, true);
    window.addEventListener("resize", onScrollResize);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey, true);
      window.removeEventListener("scroll", onScrollResize, true);
      window.removeEventListener("resize", onScrollResize);
    };
  }, [open]);

  const menu =
    open &&
    mounted &&
    createPortal(
      <div
        ref={menuRef}
        className="share-dropdown-menu share-dropdown-menu--portal dropdown-menu"
        role="listbox"
        style={{
          position: "fixed",
          top: menuRect.top,
          left: menuRect.left,
          width: menuRect.width,
          zIndex: PORTAL_DROPDOWN_Z_INDEX,
        }}
      >
        {options.map((opt) => (
          <div
            key={opt}
            role="option"
            aria-selected={opt === value}
            className="share-dropdown-option"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onChange(opt);
              setOpen(false);
            }}
          >
            {opt}
          </div>
        ))}
      </div>,
      document.body
    );

  return (
    <div className="share-dropdown">
      <button
        ref={triggerRef}
        type="button"
        className="share-dropdown-trigger dropdown-trigger"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="share-dropdown-trigger-label">{value}</span>
        <ChevronDown className="shrink-0" width={18} height={18} strokeWidth={2.5} aria-hidden />
      </button>
      {menu}
    </div>
  );
}

export function ShareModal({ isOpen, onClose, sessionId, sessionTitle }: ShareModalProps) {
  const [invite, setInvite] = useState("");
  const [linkPermission, setLinkPermission] = useState<(typeof LINK_OPTIONS)[number]>("Anyone can view");
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setInvite("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const canInvite = invite.trim().length > 0;
  const dialogLabel = sessionTitle?.trim()
    ? `Share ${sessionTitle}`
    : `Share session ${sessionId}`;

  return (
    <ModalPortal>
      <div
        className="overlay"
        role="presentation"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className="modal share-modal"
          role="dialog"
          aria-modal="true"
          aria-label={dialogLabel}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <h2 className="share-modal-title">Share</h2>
          {sessionTitle?.trim() ? (
            <p className="share-modal-session-subtitle">{sessionTitle}</p>
          ) : null}

          <div className="share-modal-invite">
            <input
              className="share-input"
              placeholder="Add people by email or name"
              value={invite}
              onChange={(e) => setInvite(e.target.value)}
              aria-label="Add people by email or name"
            />
            <button
              type="button"
              className="share-btn share-btn--primary"
              disabled={!canInvite}
              onClick={() => {
                setInvite("");
              }}
            >
              Share
            </button>
          </div>

          {team.length > 0 ? (
            <div className="share-modal-team">
              <div className="share-team-list" role="list">
                {team.map((m) => (
                  <div key={m.id} className="share-member" role="listitem">
                    <div className="share-member-info">
                      <strong>{m.name}</strong>
                      <p>{m.email}</p>
                    </div>
                    <ShareDropdown<MemberRole>
                      value={m.role}
                      options={ROLE_OPTIONS}
                      ariaLabel={`Access for ${m.name}`}
                      onChange={(role) => {
                        setTeam((prev) => prev.map((x) => (x.id === m.id ? { ...x, role } : x)));
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="share-modal-permissions">
            <ShareDropdown<(typeof LINK_OPTIONS)[number]>
              value={linkPermission}
              options={LINK_OPTIONS}
              ariaLabel="Link access"
              onChange={setLinkPermission}
            />

            <div className="share-modal-actions">
              <button type="button" className="share-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="share-btn share-btn--primary" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
