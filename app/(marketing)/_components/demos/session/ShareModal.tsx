/**
 * ShareModal — marketing adaptation of components/share/ShareModal.tsx
 *
 * The production ShareModal is deeply coupled: it renders inside the app's
 * <Modal> (ModalPortal + echly-modal-* CSS that lives in app/globals.css, not
 * loaded on the marketing route), uses Radix <DropdownMenu>, the
 * useShareController types, ShareModalError, ShareDropdown, and ExternalShareModal,
 * and styles itself with `.share-modal-*` classes also defined only in
 * app/globals.css. Forklifting that whole tree onto the marketing route would
 * drag in Radix + the controller + a large CSS surface.
 *
 * This adaptation reproduces the SAME structure and Tailwind arbitrary classes
 * (header, General access, Invite people, People with access, Members,
 * footer Copy link / Cancel / Done) but:
 *   - self-contained overlay/panel (`session-share-overlay/-panel`, scoped CSS
 *     in marketing.css) instead of the app <Modal>/ModalPortal
 *   - native disabled-look dropdown buttons instead of Radix DropdownMenu
 *   - static mock members; Invite / role / remove / copy are silent no-ops
 *     (binding decision #7); the X / Cancel / Done buttons close the modal
 *
 * Flagged for review in MARKETING_PHASE_2C_SUMMARY (fidelity question): heavier
 * surgery than a verbatim forklift because of the Modal/Radix/CSS coupling.
 */
"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, Link as LinkIcon, Trash2, X } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { MOCK_SESSION, MOCK_WORKSPACE_MEMBERS } from "./sessionMockData";

const DROPDOWN_BTN_CLASS =
  "session-share-dropdown inline-flex items-center gap-1.5 h-[36px] px-3 text-[14px] font-medium border border-[var(--border)] rounded-[var(--radius-sm)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] transition-colors text-[var(--text-heading)] whitespace-nowrap cursor-pointer";

const SHARE_ITEMS = [
  { email: "qa@studioforeground.com", subtitle: "Invite · Active", access: "resolve" as const, avatarUrl: null as string | null },
  { email: "pm@northcap.com", subtitle: "Invite · Pending", access: "view" as const, avatarUrl: null as string | null },
];

export function ShareModal({ onClose }: { onClose: () => void }) {
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const copyLink = () => {
    try {
      void navigator.clipboard?.writeText(`https://${MOCK_SESSION.shareUrl}`);
    } catch {
      /* noop */
    }
    setLinkCopied(true);
    window.setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div
      className="session-share-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Share session"
    >
      <div className="session-share-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="session-share-header">
          <h2 className="session-share-title">Share session</h2>
          <button type="button" className="session-share-icon-btn shrink-0" aria-label="Close" onClick={onClose}>
            <X size={18} strokeWidth={2} aria-hidden />
          </button>
        </div>

        <div className="session-share-body flex min-h-0 min-w-0 flex-1 flex-col">
          {/* General access */}
          <section className="session-share-section">
            <h3 className="session-share-section-title">General access</h3>
            <p className="session-share-section-sub">Default access for anyone opening the link</p>
            <button type="button" className={DROPDOWN_BTN_CLASS}>
              Anyone with the link
              <ChevronDown className="session-share-dropdown-chevron h-4 w-4 text-[var(--text-tertiary)]" />
            </button>
          </section>

          {/* Invite people */}
          <section className="session-share-section">
            <h3 className="session-share-section-title">Invite people</h3>
            <div className="flex items-center gap-3">
              <input
                type="email"
                placeholder="Email address"
                className="flex-1 min-w-0 h-[36px] border border-[var(--border)] rounded-[var(--radius-sm)] px-3 text-sm placeholder:text-[var(--text-placeholder)] focus:outline-none focus:border-[var(--brand)] bg-[var(--surface)]"
                autoComplete="email"
              />
              <button type="button" className={`${DROPDOWN_BTN_CLASS} flex-shrink-0`}>
                Can resolve
                <ChevronDown className="session-share-dropdown-chevron h-4 w-4 text-[var(--text-tertiary)]" />
              </button>
            </div>
          </section>

          {/* People with access */}
          <section className="session-share-section">
            <h3 className="session-share-section-title">People with access</h3>
            <ul className="m-0 list-none p-0">
              {SHARE_ITEMS.map((item) => (
                <li key={item.email} className="flex items-center justify-between gap-3 py-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="session-share-avatar" aria-hidden>
                      {item.email[0]?.toUpperCase() ?? "?"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="block text-[14px] font-medium text-[var(--text-heading)] truncate">{item.email}</span>
                      <p className="text-[12px] text-[var(--text-secondary)] m-0">{item.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button type="button" className={DROPDOWN_BTN_CLASS}>
                      {item.access === "resolve" ? "Can resolve" : "Can view"}
                      <ChevronDown className="session-share-dropdown-chevron h-4 w-4 text-[var(--text-tertiary)]" />
                    </button>
                    <button
                      type="button"
                      className="w-9 h-9 rounded-[var(--radius-sm)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--color-danger-bg)] hover:border-[var(--color-danger)]/30 hover:text-[var(--color-danger)] transition-colors text-[var(--text-secondary)] cursor-pointer"
                      aria-label="Remove access"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Members (always visible, no collapse) */}
          <section className="session-share-section session-share-section--last">
            <h3 className="session-share-section-title">Members</h3>
            <ul className="m-0 list-none p-0">
              {MOCK_WORKSPACE_MEMBERS.map((member) => (
                <li key={member.uid} className="flex items-center gap-3 py-2">
                  <UserAvatar
                    avatarUrl={member.avatarUrl}
                    name={member.displayName}
                    colorSeed={member.uid}
                    size={32}
                    alt={member.displayName}
                  />
                  <div className="min-w-0 flex-1">
                    <span className="block text-[14px] font-medium text-[var(--text-heading)] truncate">{member.displayName}</span>
                    <p className="text-[12px] text-[var(--text-secondary)] m-0">{member.role === "OWNER" ? "Owner" : "Member"}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex h-[36px] items-center gap-2 px-2 -ml-2 rounded-[var(--radius-sm)] border-none bg-transparent text-[var(--brand)] text-[13px] font-medium hover:bg-[var(--brand-subtle)] transition-colors cursor-pointer"
          >
            {linkCopied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <LinkIcon className="h-3.5 w-3.5" aria-hidden />}
            {linkCopied ? "Copied" : "Copy link"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-[38px] items-center gap-2 px-5 rounded-[var(--radius-btn)] border-none bg-[var(--brand)] text-white text-[14px] font-semibold hover:bg-[var(--brand-hover)] transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
