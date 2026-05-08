"use client";

import { useRef, useState } from "react";
import { authFetch, getFirebaseBearerToken } from "@/lib/authFetch";
import { useWorkspace } from "@/lib/client/workspaceContext";
import { useToast } from "@/components/dashboard/context/ToastContext";
import { ObIcon } from "./icons";
import { StepShell, StepFooter } from "./StepShell";

const ROLES = [
  { id: "QA",        meta: "Testing & feedback", Ico: ObIcon.QA },
  { id: "Designer",  meta: "Visual & UX",        Ico: ObIcon.Designer },
  { id: "PM",        meta: "Coordination",       Ico: ObIcon.PM },
  { id: "Developer", meta: "Engineering",        Ico: ObIcon.Dev },
  { id: "Other",     meta: "Tell us more",       Ico: ObIcon.Other },
] as const;

type Props = {
  initialFirstName: string;
  initialLastName: string;
  initialAvatarUrl: string | null;
  onContinue: (data: { firstName: string; lastName: string; role: string }) => void;
};

export function ProfileStep({
  initialFirstName,
  initialLastName,
  initialAvatarUrl,
  onContinue,
}: Props) {
  const { updateAvatarUrl } = useWorkspace();
  const { showToast } = useToast();

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [role, setRole] = useState<string>("");
  const [avatarUrl, setLocalAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials =
    ((firstName?.[0] ?? "") + (lastName?.[0] ?? "")).toUpperCase() || "?";
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  const canContinue = !!firstName.trim() && !!lastName.trim() && !submitting;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const token = await getFirebaseBearerToken();
      if (!token) throw new Error("Not authenticated");
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await fetch("/api/users/avatar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const body = await res.json();
      if (!res.ok || !body?.success) {
        throw new Error(body?.error?.message || "Upload failed");
      }
      const url = body.data?.avatarUrl as string | null;
      setLocalAvatarUrl(url);
      updateAvatarUrl(url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setError(msg);
      showToast(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canContinue) return;
    setSubmitting(true);
    setError(null);
    try {
      const fn = firstName.trim().slice(0, 50);
      const ln = lastName.trim().slice(0, 50);
      const payload: Record<string, string> = { firstName: fn, lastName: ln };
      if (role) payload.role = role;
      const res = await authFetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res || !res.ok) {
        const text = res ? await res.text() : "Not authenticated";
        throw new Error(text);
      }
      onContinue({ firstName: fn, lastName: ln, role });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setError(msg);
      showToast(msg);
      setSubmitting(false);
    }
  };

  return (
    <StepShell
      step={1}
      stage={
        <div style={{ position: "relative" }}>
          <div className="ob-float-card ob-preview-card">
            <div className="pc-row">
              <div
                className="ob-pc-av"
                style={
                  avatarUrl
                    ? {}
                    : { background: "linear-gradient(135deg, #EAF2FD, #C8DDF6)", color: "var(--ob-brand)" }
                }
              >
                {avatarUrl ? <img src={avatarUrl} alt="" /> : initials}
              </div>
              <div>
                <div className="ob-pc-name">{fullName || "Your name"}</div>
                <div className="ob-pc-handle">
                  <span className="role-pill">{role || "Member"}</span>
                  <span>@you</span>
                </div>
              </div>
            </div>
            <div className="ob-pc-divider"></div>
            <div className="ob-pc-stats">
              <div className="ob-pc-stat"><div className="v">0</div><div className="l">Sessions</div></div>
              <div className="ob-pc-stat"><div className="v">0</div><div className="l">Tickets</div></div>
              <div className="ob-pc-stat"><div className="v">—</div><div className="l">Joined today</div></div>
            </div>
          </div>
          <div className="ob-preview-meta">This is how teammates will see you.</div>
        </div>
      }
    >
      <span className="ob-eyebrow"><span className="dot"></span>Welcome to Annote</span>
      <h1 className="ob-h">Let&apos;s set up your <br /><span className="accent">profile.</span></h1>
      <p className="ob-sub">A few quick details so teammates know who&apos;s leaving feedback. You can change all of this later in settings.</p>

      <form onSubmit={handleSubmit}>
        <div className="ob-field">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label htmlFor="ob-first-name" className="ob-field-label">First name</label>
              <input
                id="ob-first-name"
                className="ob-input"
                value={firstName}
                maxLength={50}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First"
                required
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="ob-last-name" className="ob-field-label">Last name</label>
              <input
                id="ob-last-name"
                className="ob-input"
                value={lastName}
                maxLength={50}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last"
                required
              />
            </div>
          </div>
        </div>

        <div className="ob-field">
          <label className="ob-field-label">Your role <span className="opt">Optional</span></label>
          <div className="ob-role-grid">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                className={"ob-role-chip " + (role === r.id ? "active" : "")}
                onClick={() => setRole(role === r.id ? "" : r.id)}
              >
                <span className="check"><ObIcon.Check size={9} /></span>
                <span className="role-ico"><r.Ico /></span>
                <div className="role-name">{r.id}</div>
                <div className="role-meta">{r.meta}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="ob-field">
          <label className="ob-field-label">Profile photo <span className="opt">Optional</span></label>
          <div className="ob-avatar-row">
            <div className={"ob-avatar-slot " + (avatarUrl ? "has-photo" : "")}>
              {avatarUrl ? <img src={avatarUrl} alt="" /> : <ObIcon.Camera size={20} />}
            </div>
            <div className="ob-avatar-actions">
              <button
                type="button"
                className="ob-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <ObIcon.Upload size={13} />
                {uploading ? "Uploading…" : avatarUrl ? "Replace photo" : "Upload photo"}
              </button>
              <span className="meta">PNG or JPG, up to 4MB</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>
        </div>

        {error && <div className="ob-error">{error}</div>}

        <StepFooter
          primary={
            <button type="submit" className="ob-btn ob-btn-primary" disabled={!canContinue}>
              {submitting ? "Saving…" : "Continue"}
              <ObIcon.Arrow size={13} />
            </button>
          }
          hint={
            <>
              <kbd>↵</kbd> to continue
            </>
          }
        />
      </form>
    </StepShell>
  );
}
