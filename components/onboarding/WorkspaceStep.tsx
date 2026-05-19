"use client";

import { useEffect, useRef, useState } from "react";
import { authFetch } from "@/lib/authFetch";
import { useToast } from "@/components/dashboard/context/ToastContext";
import { ObIcon } from "./icons";
import { StepShell, StepFooter } from "./StepShell";
import { generateSlug, isValidSlug, SLUG_MIN_LEN, SLUG_MAX_LEN } from "@/lib/utils/slugify";

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

type SlugCheck =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "available" }
  | { status: "taken"; suggestion: string }
  | { status: "invalid"; suggestion: string };

export function WorkspaceStep({ initialName, initialLogoUrl, initialLogoFile, onContinue, onBack }: Props) {
  const { showToast } = useToast();
  const [name, setName] = useState(initialName || "");
  const [slug, setSlug] = useState<string>(generateSlug(initialName || ""));
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [slugEditing, setSlugEditing] = useState(false);
  const [slugCheck, setSlugCheck] = useState<SlugCheck>({ status: "idle" });
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

  // Auto-generate slug from name unless user has manually edited it.
  useEffect(() => {
    if (slugManuallyEdited) return;
    setSlug(generateSlug(name));
  }, [name, slugManuallyEdited]);

  // Debounced uniqueness check.
  useEffect(() => {
    const trimmed = slug.trim().toLowerCase();
    if (!trimmed) {
      setSlugCheck({ status: "idle" });
      return;
    }
    if (!isValidSlug(trimmed)) {
      setSlugCheck({ status: "invalid", suggestion: "" });
      return;
    }
    setSlugCheck({ status: "checking" });
    const handle = setTimeout(async () => {
      try {
        const res = await authFetch(
          `/api/workspaces/check-slug?slug=${encodeURIComponent(trimmed)}`
        );
        if (!res || !res.ok) {
          setSlugCheck({ status: "idle" });
          return;
        }
        const body = (await res.json()) as {
          success?: boolean;
          data?: { available?: boolean; valid?: boolean; suggestion?: string };
        };
        if (!body?.success || !body.data) {
          setSlugCheck({ status: "idle" });
          return;
        }
        if (body.data.valid === false) {
          setSlugCheck({
            status: "invalid",
            suggestion: body.data.suggestion ?? "",
          });
          return;
        }
        if (body.data.available) {
          setSlugCheck({ status: "available" });
        } else {
          setSlugCheck({
            status: "taken",
            suggestion: body.data.suggestion ?? "",
          });
        }
      } catch {
        setSlugCheck({ status: "idle" });
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [slug]);

  const canContinue =
    !!name.trim() &&
    !submitting &&
    (slugCheck.status === "available" || slugCheck.status === "idle");

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
    const trimmedSlug = slug.trim().toLowerCase();
    const slugOut = trimmedSlug && isValidSlug(trimmedSlug) ? trimmedSlug : "";
    onContinue({
      workspaceName: trimmed,
      workspaceSlug: slugOut,
      logoFile,
      logoPreviewUrl: logoUrl,
    });
  };

  const handleSlugInput = (value: string) => {
    setSlugManuallyEdited(true);
    // Sanitize as user types — only allow chars that can appear in a slug.
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, SLUG_MAX_LEN);
    setSlug(cleaned);
  };

  const adoptSuggestion = (suggestion: string) => {
    if (!suggestion) return;
    setSlug(suggestion);
    setSlugManuallyEdited(true);
  };

  const slugStatusIndicator = () => {
    if (slugCheck.status === "checking") {
      return <span className="ob-spinner" style={{ width: 12, height: 12 }} />;
    }
    if (slugCheck.status === "available") {
      return <span style={{ color: "#1F9D55" }}>✓</span>;
    }
    if (slugCheck.status === "taken" || slugCheck.status === "invalid") {
      return <span style={{ color: "#C53030" }}>✕</span>;
    }
    return null;
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
                <div className="ob-ws-card-meta">annote.ai/{slug || "workspace"} · 1 member</div>
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
              <div className="ob-ws-feat"><span className="tick"><ObIcon.Check size={9} /></span><span>Free for the first <span className="num">14</span> days</span></div>
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
          <div className="ob-helper" style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span>URL:</span>
            {slugEditing ? (
              <>
                <span>annote.ai/</span>
                <input
                  className="ob-input"
                  style={{ height: 28, padding: "0 8px", fontSize: 12, width: 200 }}
                  value={slug}
                  maxLength={SLUG_MAX_LEN}
                  onChange={(e) => handleSlugInput(e.target.value)}
                  onBlur={() => setSlugEditing(false)}
                  autoFocus
                />
                {slugStatusIndicator()}
              </>
            ) : (
              <>
                <b
                  style={{ cursor: "pointer", textDecoration: "underline dotted" }}
                  onClick={() => setSlugEditing(true)}
                  title="Click to customize"
                >
                  annote.ai/{slug || "workspace"}
                </b>
                {slugStatusIndicator()}
              </>
            )}
          </div>
          {slugCheck.status === "taken" && slugCheck.suggestion && (
            <div className="ob-helper" style={{ color: "#C53030" }}>
              Taken — try{" "}
              <button
                type="button"
                onClick={() => adoptSuggestion(slugCheck.suggestion)}
                style={{
                  background: "none",
                  border: 0,
                  color: "var(--ob-brand)",
                  padding: 0,
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontWeight: 500,
                }}
              >
                {slugCheck.suggestion}
              </button>
            </div>
          )}
          {slugCheck.status === "invalid" && (
            <div className="ob-helper" style={{ color: "#C53030" }}>
              Slug must be {SLUG_MIN_LEN}-{SLUG_MAX_LEN} chars, lowercase a–z, 0–9, hyphens.
            </div>
          )}
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
