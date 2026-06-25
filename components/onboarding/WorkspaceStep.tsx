"use client";

import { useEffect, useRef, useState } from "react";
import { ObIcon } from "./icons";
import { StepShell, StepFooter } from "./StepShell";
import { generateSlug, isValidSlug } from "@/lib/utils/slugify";

type Props = {
  initialName: string;
  initialLogoUrl: string | null;
  initialLogoFile: File | null;
  onContinue: (data: {
    workspaceName: string;
    workspaceSlug: string;
    logoFile: File | null;
    logoPreviewUrl: string | null;
  }) => void;
  onBack: () => void;
};

export function WorkspaceStep({ initialName, initialLogoUrl, initialLogoFile, onContinue, onBack }: Props) {
  const [name, setName] = useState(initialName || "");
  const [logoFile, setLogoFile] = useState<File | null>(initialLogoFile);
  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Revoke any object URL we created when the component unmounts or replaces it.
  useEffect(() => {
    return () => {
      if (logoUrl && logoUrl.startsWith("blob:")) {
        URL.revokeObjectURL(logoUrl);
      }
    };
  }, [logoUrl]);

  const initial = (name || "?").trim()[0]?.toUpperCase() || "?";

  const canContinue = !!name.trim() && !submitting;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    // Local preview only — workspace doesn't exist yet during onboarding.
    // The file is uploaded to /api/workspace/logo at the end of onboarding,
    // once POST /api/onboarding has created the workspace doc.
    if (logoUrl && logoUrl.startsWith("blob:")) {
      URL.revokeObjectURL(logoUrl);
    }
    const previewUrl = URL.createObjectURL(file);
    setLogoFile(file);
    setLogoUrl(previewUrl);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canContinue) return;
    setSubmitting(true);
    setError(null);
    const trimmed = name.trim().slice(0, 80);
    // The slug is derived silently from the name purely for addressing. It is no
    // longer shown as a URL preview or checked for uniqueness here: workspaces
    // are resolved by id, not slug, so duplicate/derived slugs are harmless and
    // the onboarding API reserves the slug non-fatally.
    const derived = generateSlug(trimmed);
    const slugOut = derived && isValidSlug(derived) ? derived : "";
    onContinue({
      workspaceName: trimmed,
      workspaceSlug: slugOut,
      logoFile,
      logoPreviewUrl: logoUrl,
    });
  };

  return (
    <StepShell
      step={2}
      stage={
        <div style={{ position: "relative" }}>
          <div className="ob-ws-ghost a"></div>
          <div className="ob-ws-ghost b"></div>
          <div className="ob-ws-stack ob-float-card ob-ws-card">
            <div className="ob-ws-card-head">
              <span
                className="ob-ws-glyph-big"
                style={
                  logoUrl
                    ? {}
                    : !name.trim()
                    ? { background: "#FAFAF7", color: "var(--ob-soft)" }
                    : {}
                }
              >
                {logoUrl ? <img src={logoUrl} alt="" /> : initial}
              </span>
              <div>
                <div className="ob-ws-card-name">{name || "Your workspace"}</div>
                <div className="ob-ws-card-meta">1 member</div>
              </div>
              <div
                style={{
                  marginLeft: "auto",
                  fontSize: 11,
                  fontWeight: 500,
                  color: "var(--ob-brand-ink)",
                  background: "var(--ob-brand-soft)",
                  padding: "3px 8px",
                  borderRadius: 999,
                }}
              >
                Owner
              </div>
            </div>
            <div className="ob-ws-feature-list">
              <div className="ob-ws-feat"><span className="tick"><ObIcon.Check size={9} /></span><span><span className="num">Unlimited</span> sessions</span></div>
              <div className="ob-ws-feat"><span className="tick"><ObIcon.Check size={9} /></span><span>Capture, annotate &amp; comment</span></div>
              <div className="ob-ws-feat"><span className="tick"><ObIcon.Check size={9} /></span><span>Slack &amp; Linear integrations</span></div>
              <div className="ob-ws-feat"><span className="tick"><ObIcon.Check size={9} /></span><span>Free Starter plan — <span className="num">50</span> tickets/mo</span></div>
            </div>
          </div>
          <div className="ob-preview-meta">Live preview · updates as you type</div>
        </div>
      }
    >
      <span className="ob-eyebrow"><span className="dot"></span>Workspace</span>
      <h1 className="ob-h">Name your workspace.</h1>
      <p className="ob-sub">A workspace holds your sessions, tickets, and team. Most people pick their company or product name.</p>

      <form onSubmit={handleSubmit}>
        <div className="ob-field">
          <label htmlFor="ob-ws-name" className="ob-field-label">Workspace name</label>
          <input
            id="ob-ws-name"
            className="ob-input"
            value={name}
            maxLength={80}
            onChange={(e) => setName(e.target.value)}
            placeholder="Acme Inc."
            required
            autoFocus
          />
        </div>

        <div className="ob-field">
          <label className="ob-field-label">Workspace icon <span className="opt">Optional</span></label>
          <div className="ob-avatar-row">
            <div
              className="ob-ws-glyph-big"
              style={
                logoUrl
                  ? {}
                  : { background: "#FAFAF7", color: "var(--ob-soft)", border: "1px dashed var(--ob-hair-strong)" }
              }
            >
              {logoUrl ? <img src={logoUrl} alt="" /> : <ObIcon.Upload size={16} />}
            </div>
            <div className="ob-avatar-actions">
              <button
                type="button"
                className="ob-upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <ObIcon.Upload size={13} />
                {logoUrl ? "Replace icon" : "Upload icon"}
              </button>
              <span className="meta">SVG or PNG, square works best</span>
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
          onBack={onBack}
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
