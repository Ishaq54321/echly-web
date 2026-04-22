"use client";

import { useState } from "react";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { MODAL_LAYER_Z_INDEX } from "@/lib/ui/zIndex";
import { authFetch } from "@/lib/authFetch";

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

  if (!isOpen) return null;

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
        error?: { message: string };
      };
      if (!res.ok || !json.success) {
        const msg = json.error?.message;
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
          <h2 id="invite-modal-title" className="text-[20px] font-semibold text-neutral-900">
            Invite a team member
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
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
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1775E0] focus:border-transparent"
                autoFocus
              />
              {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium rounded-xl text-neutral-700 hover:bg-neutral-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-[#1775E0] text-white hover:bg-[#1462C4] transition disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Send Invite"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
}
