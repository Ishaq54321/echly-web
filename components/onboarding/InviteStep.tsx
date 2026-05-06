"use client";

import { useEffect, useRef, useState } from "react";
import { authFetch } from "@/lib/authFetch";
import { useToast } from "@/components/dashboard/context/ToastContext";
import { ObIcon } from "./icons";
import { StepShell, StepFooter } from "./StepShell";

type GoogleContact = { name: string; email: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #5B7CFA, #2E4FCF)",
  "linear-gradient(135deg, #B6648E, #803060)",
  "linear-gradient(135deg, #34C29A, #157A57)",
  "linear-gradient(135deg, #E0915C, #B05E2C)",
];

type InviteStatus =
  | "pending"
  | "sending"
  | "sent"
  | "error"
  | "already_member"
  | "already_invited"
  | "invalid"
  | "limit_reached";

type Props = {
  ownerName: string;
  ownerEmail: string;
  workspaceName: string;
  onContinue: () => void;
  onBack: () => void;
};

function emailInitials(email: string): string {
  return email.split("@")[0].slice(0, 2).toUpperCase();
}

function emailDisplayName(email: string): string {
  return email
    .split("@")[0]
    .replace(/[._]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function InviteStep({
  ownerName,
  ownerEmail,
  workspaceName,
  onContinue,
  onBack,
}: Props) {
  const { showToast } = useToast();
  const [emails, setEmails] = useState<string[]>([]);
  const [status, setStatus] = useState<Record<string, InviteStatus>>({});
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [gmailLoading, setGmailLoading] = useState(false);
  const [gmailContacts, setGmailContacts] = useState<GoogleContact[] | null>(null);
  const [contactSelection, setContactSelection] = useState<Set<string>>(new Set());
  const popupRef = useRef<Window | null>(null);

  // Listen for the popup → opener postMessage from /api/auth/google-contacts/callback.
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as
        | { source?: string; payload?: { ok?: boolean; contacts?: GoogleContact[]; error?: string } }
        | undefined;
      if (!data || data.source !== "echly:google-contacts") return;
      setGmailLoading(false);
      const payload = data.payload;
      if (!payload?.ok) {
        if (payload?.error === "access_denied") {
          showToast("Gmail access denied. You can add emails manually.");
        } else {
          showToast("Couldn't load contacts. Please add emails manually.");
        }
        return;
      }
      const contacts = (payload.contacts ?? []).filter((c) => c.email);
      if (contacts.length === 0) {
        showToast("No contacts found in your Gmail.");
        return;
      }
      // Hide contacts already added.
      const existing = new Set(emails);
      const filtered = contacts.filter((c) => !existing.has(c.email.toLowerCase()));
      if (filtered.length === 0) {
        showToast("All Gmail contacts are already added.");
        return;
      }
      setGmailContacts(filtered);
      setContactSelection(new Set());
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [emails, showToast]);

  const handleImportFromGmail = async () => {
    if (gmailLoading) return;
    setGmailLoading(true);
    try {
      const res = await authFetch("/api/auth/google-contacts/authorize");
      if (!res || !res.ok) {
        setGmailLoading(false);
        showToast("Couldn't start Gmail import.");
        return;
      }
      const body = (await res.json()) as { success?: boolean; data?: { url?: string } };
      const url = body?.data?.url;
      if (!url) {
        setGmailLoading(false);
        showToast("Couldn't start Gmail import.");
        return;
      }
      const popup = window.open(url, "echly-gmail-oauth", "popup,width=520,height=640");
      if (!popup) {
        setGmailLoading(false);
        showToast("Popup blocked — allow popups and try again.");
        return;
      }
      popupRef.current = popup;
      // If the popup is closed without completing, clear the loading state.
      const closeWatcher = setInterval(() => {
        if (popup.closed) {
          clearInterval(closeWatcher);
          setGmailLoading((prev) => (prev ? false : prev));
        }
      }, 500);
    } catch {
      setGmailLoading(false);
      showToast("Couldn't start Gmail import.");
    }
  };

  const toggleContact = (email: string) => {
    setContactSelection((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  };

  const addSelectedContacts = () => {
    if (!gmailContacts || contactSelection.size === 0) {
      setGmailContacts(null);
      return;
    }
    const existing = new Set(emails);
    const additions: string[] = [];
    contactSelection.forEach((e) => {
      const lower = e.toLowerCase();
      if (!existing.has(lower) && EMAIL_RE.test(lower)) {
        additions.push(lower);
      }
    });
    if (additions.length) {
      setEmails((prev) => [...prev, ...additions]);
      setStatus((prev) => {
        const next = { ...prev };
        additions.forEach((e) => { next[e] = "pending"; });
        return next;
      });
      showToast(`${additions.length} contact${additions.length === 1 ? "" : "s"} added`);
    }
    setGmailContacts(null);
    setContactSelection(new Set());
  };

  const ownerInitials =
    ownerName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0])
      .join("")
      .toUpperCase() || emailInitials(ownerEmail || "?@?");

  const addEmail = () => {
    const v = draft.trim().replace(/[,\s]+$/, "").toLowerCase();
    if (!v) return;
    if (!EMAIL_RE.test(v)) {
      showToast("That doesn't look like a valid email");
      return;
    }
    if (emails.includes(v)) {
      setDraft("");
      return;
    }
    setEmails((prev) => [...prev, v]);
    setStatus((prev) => ({ ...prev, [v]: "pending" }));
    setDraft("");
  };

  const removeEmail = (email: string) => {
    setEmails((prev) => prev.filter((e) => e !== email));
    setStatus((prev) => {
      const next = { ...prev };
      delete next[email];
      return next;
    });
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addEmail();
      return;
    }
    if (e.key === "Backspace" && !draft && emails.length) {
      const last = emails[emails.length - 1];
      removeEmail(last);
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/invite/${encodeURIComponent(workspaceName || "join")}`;
      await navigator.clipboard.writeText(url);
      showToast("Invite link copied");
    } catch {
      showToast("Couldn't copy link");
    }
  };

  const sendInvites = async () => {
    if (!emails.length) {
      onContinue();
      return;
    }
    setSending(true);
    const pendingEmails = emails.filter((e) => status[e] !== "sent");
    setStatus((prev) => {
      const next = { ...prev };
      pendingEmails.forEach((e) => { next[e] = "sending"; });
      return next;
    });

    try {
      const res = await authFetch("/api/workspace/members/invite-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: pendingEmails }),
      });
      if (!res || !res.ok) {
        let msg = "Couldn't send invites";
        if (res) {
          try {
            const body = await res.json();
            if (body?.error?.message) msg = body.error.message;
          } catch {}
        }
        setStatus((prev) => {
          const next = { ...prev };
          pendingEmails.forEach((e) => { next[e] = "error"; });
          return next;
        });
        showToast(msg);
        setSending(false);
        return;
      }

      type ApiInviteStatus =
        | "invited"
        | "already_member"
        | "already_invited"
        | "invalid"
        | "error"
        | "limit_reached";
      const body = (await res.json()) as {
        success?: boolean;
        data?: {
          results?: Array<{ email: string; status: ApiInviteStatus; message?: string }>;
        };
      };
      const results = body?.data?.results ?? [];

      setStatus((prev) => {
        const next = { ...prev };
        results.forEach((r) => {
          if (r.status === "invited") next[r.email] = "sent";
          else next[r.email] = r.status;
        });
        return next;
      });

      const sent = results.filter((r) => r.status === "invited").length;
      const failed = results.filter(
        (r) => r.status === "error" || r.status === "limit_reached"
      ).length;
      const skipped = results.filter(
        (r) =>
          r.status === "already_member" ||
          r.status === "already_invited" ||
          r.status === "invalid"
      ).length;

      if (sent > 0) {
        showToast(`${sent} invite${sent === 1 ? "" : "s"} sent`);
      }
      if (skipped > 0 && sent === 0 && failed === 0) {
        showToast(`${skipped} email${skipped === 1 ? "" : "s"} skipped`);
      }
      if (failed > 0) {
        showToast(`${failed} invite${failed === 1 ? "" : "s"} failed`);
      }

      // Advance only when nothing is in a hard-error state. Skipped emails
      // (already_member / already_invited / invalid) don't block the flow.
      if (failed === 0) {
        onContinue();
      }
    } catch {
      setStatus((prev) => {
        const next = { ...prev };
        pendingEmails.forEach((e) => { next[e] = "error"; });
        return next;
      });
      showToast("Couldn't send invites");
    } finally {
      setSending(false);
    }
  };

  const inviteLabel =
    emails.length === 0
      ? "Continue"
      : sending
      ? "Sending…"
      : `Send ${emails.length} ${emails.length === 1 ? "invite" : "invites"}`;

  return (
    <StepShell
      step={3}
      stage={
        <>
          <div className="ob-float-card ob-invite-vis">
            <div className="ob-iv-head">
              <span className="ob-iv-title">{workspaceName || "Workspace"} · Members</span>
              <span className="ob-iv-status"><span className="pulse"></span>Live</span>
            </div>
            <div style={{ marginTop: 6 }}>
              <div className="ob-iv-row">
                <span
                  className="ob-iv-av"
                  style={{ background: "linear-gradient(135deg, #1775E0, #0F5BB5)" }}
                >
                  {ownerInitials}
                </span>
                <div>
                  <div className="ob-iv-name">{ownerName || "You"}</div>
                  <div className="ob-iv-email">{ownerEmail || "you@workspace"}</div>
                </div>
                <span className="ob-iv-action">Owner</span>
              </div>
              {emails.map((e, i) => {
                const s = status[e];
                const actionClass =
                  s === "sent"
                    ? "sent"
                    : s === "error" || s === "limit_reached" || s === "invalid"
                    ? "error"
                    : "invited";
                const actionLabel =
                  s === "sent"
                    ? "Sent"
                    : s === "error"
                    ? "Failed"
                    : s === "sending"
                    ? "Sending…"
                    : s === "already_member"
                    ? "Already a member"
                    : s === "already_invited"
                    ? "Already invited"
                    : s === "invalid"
                    ? "Invalid email"
                    : s === "limit_reached"
                    ? "Plan limit"
                    : "Invite pending";
                return (
                  <div className="ob-iv-row" key={e}>
                    <span
                      className="ob-iv-av"
                      style={{ background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length] }}
                    >
                      {emailInitials(e)}
                    </span>
                    <div>
                      <div className="ob-iv-name">{emailDisplayName(e)}</div>
                      <div className="ob-iv-email">{e}</div>
                    </div>
                    <span className={`ob-iv-action ${actionClass}`}>{actionLabel}</span>
                  </div>
                );
              })}
              {emails.length === 0 && (
                <div
                  className="ob-iv-row"
                  style={{ color: "var(--ob-soft)", fontSize: 12, padding: "16px 0" }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      border: "1px dashed var(--ob-hair-strong)",
                    }}
                  ></div>
                  <span>Add teammates on the left to preview here</span>
                </div>
              )}
            </div>
          </div>
          <div className="ob-preview-meta" style={{ marginTop: 14 }}>
            Invites are sent when you continue · revoke anytime
          </div>
        </>
      }
    >
      <span className="ob-eyebrow"><span className="dot"></span>Invite teammates</span>
      <h1 className="ob-h">Bring the team. <span className="accent">Feedback is better together.</span></h1>
      <p className="ob-sub">Invite designers, devs, or anyone who&apos;ll review sessions. They&apos;ll get an email link and land straight in your workspace.</p>

      <div className="ob-field">
        <label className="ob-field-label">Email addresses <span className="opt">Press Enter to add</span></label>
        <div className="ob-email-chips">
          {emails.map((e) => (
            <span className="ob-email-chip" key={e}>
              <span className="ec-av">{emailInitials(e)}</span>
              <span>{e}</span>
              <button type="button" className="x" onClick={() => removeEmail(e)} aria-label={`Remove ${e}`}>
                <ObIcon.X size={9} />
              </button>
            </span>
          ))}
          <input
            type="email"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            onBlur={() => {
              if (draft.trim()) addEmail();
            }}
            placeholder={emails.length ? "Add another…" : "name@company.com"}
          />
        </div>
        <div className="ob-helper">
          {emails.length} {emails.length === 1 ? "person" : "people"} ready · or paste a list separated by commas
        </div>
      </div>

      <div className="ob-field" style={{ marginTop: 22 }}>
        <label className="ob-field-label" style={{ marginBottom: 8 }}>Quick invite</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            className="ob-btn ob-btn-secondary"
            style={{ height: 36, padding: "0 12px", fontSize: 12.5, fontWeight: 500 }}
            onClick={handleImportFromGmail}
            disabled={gmailLoading}
          >
            <ObIcon.Mail size={13} />
            {gmailLoading ? "Connecting…" : "Import from Gmail"}
          </button>
          <button
            type="button"
            className="ob-btn ob-btn-secondary"
            style={{ height: 36, padding: "0 12px", fontSize: 12.5, fontWeight: 500 }}
            onClick={handleCopyLink}
          >
            <ObIcon.External size={11} /> Copy invite link
          </button>
        </div>
        <div className="ob-helper" style={{ marginTop: 6 }}>
          Gmail import reads your contacts to help you invite teammates. We don&apos;t store your contacts.
        </div>
      </div>

      {gmailContacts !== null && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(20, 20, 20, 0.45)",
            zIndex: 100,
            display: "grid",
            placeItems: "center",
            padding: 16,
          }}
          onClick={() => setGmailContacts(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: 12,
              width: "min(480px, 100%)",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 18px 60px rgba(0,0,0,0.25)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--ob-hair-strong)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>Import contacts</div>
                <div style={{ fontSize: 12, color: "var(--ob-soft)", marginTop: 2 }}>
                  {gmailContacts.length} contact{gmailContacts.length === 1 ? "" : "s"} found
                </div>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setGmailContacts(null)}
                style={{
                  background: "transparent",
                  border: 0,
                  cursor: "pointer",
                  fontSize: 18,
                  color: "var(--ob-soft)",
                }}
              >
                ×
              </button>
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {gmailContacts.map((c) => {
                const checked = contactSelection.has(c.email);
                return (
                  <label
                    key={c.email}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 20px",
                      cursor: "pointer",
                      borderBottom: "1px solid #F4F1EC",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleContact(c.email)}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--ob-soft)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {c.email}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
            <div
              style={{
                padding: "12px 20px",
                borderTop: "1px solid var(--ob-hair-strong)",
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <button
                type="button"
                className="ob-btn ob-btn-ghost"
                style={{ padding: "0 12px" }}
                onClick={() => setGmailContacts(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ob-btn ob-btn-primary"
                style={{ padding: "0 14px" }}
                onClick={addSelectedContacts}
                disabled={contactSelection.size === 0}
              >
                Add {contactSelection.size || ""}
              </button>
            </div>
          </div>
        </div>
      )}

      <StepFooter
        onBack={onBack}
        secondary={
          <button
            type="button"
            className="ob-btn ob-btn-ghost"
            style={{ padding: "0 12px" }}
            onClick={onContinue}
            disabled={sending}
          >
            I&apos;ll do this later
          </button>
        }
        primary={
          <button
            type="button"
            className="ob-btn ob-btn-primary"
            onClick={sendInvites}
            disabled={sending}
          >
            {inviteLabel}
            <ObIcon.Arrow size={13} />
          </button>
        }
      />
    </StepShell>
  );
}
