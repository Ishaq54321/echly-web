"use client";

import { useState } from "react";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { MODAL_LAYER_Z_INDEX } from "@/lib/ui/zIndex";
import { authFetch } from "@/lib/authFetch";
import { UpgradeModal } from "@/components/billing/UpgradeModal";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteSent?: (inv: unknown) => void;
}

export function InviteMemberModal({
  isOpen,
  onClose,
  onInviteSent,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  if (!isOpen && !showUpgrade) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_RE.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await authFetch("/api/workspace/members/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, role: "MEMBER" }),
      });
      if (!res) { setError("Request failed. Try again."); return; }
      const json = await res.json() as {
        success: boolean;
        data?: { invitation: unknown };
        error?: { message: string; code?: string };
      };
      if (!res.ok || !json.success) {
        const code = json.error?.code;
        const msg = json.error?.message;
        if (code === "PLAN_LIMIT_REACHED" || msg === "PLAN_LIMIT_REACHED") {
          onClose();
          setShowUpgrade(true);
          return;
        }
        if (msg === "ALREADY_MEMBER") setError("This person is already a member.");
        else if (msg === "INVITE_ALREADY_SENT") setError("An invitation has already been sent to this email.");
        else setError("Failed to send invitation. Try again.");
        return;
      }
      if (json.data?.invitation) onInviteSent?.(json.data.invitation);
    } catch {
      setError("Failed to send invitation. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {isOpen && (
        <ModalPortal>
          <div
            className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 cursor-pointer"
            style={{ zIndex: MODAL_LAYER_Z_INDEX }}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-modal-title"
          >
            <div
              className="rounded-2xl shadow-lg bg-white p-6 max-w-md w-full cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="invite-modal-title" className="text-[20px] font-semibold text-[var(--text-heading)]">
                Invite a team member
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                They&apos;ll receive an email with a link to join your workspace.
              </p>
              <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                <div>
                  <label htmlFor="invite-email-settings" className="sr-only">Email address</label>
                  <input
                    id="invite-email-settings"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-heading)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
                    autoFocus
                  />
                  {error && <p className="mt-1.5 text-sm text-[var(--color-danger)]">{error}</p>}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border border-[var(--border)] bg-transparent text-[var(--text-heading)] text-[14px] font-medium hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border-none bg-[var(--brand)] text-white text-[14px] font-medium hover:bg-[var(--brand-hover)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {submitting ? "Sending…" : "Send Invite"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        upgradePlan="business"
        message="You've reached the member limit on your current plan."
      />
    </>
  );
}
