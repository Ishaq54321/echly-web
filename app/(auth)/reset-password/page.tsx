"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { mapAuthError } from "@/lib/auth/errorMessages";
import {
  ArrowIcon,
  AuthFoot,
  CheckIcon,
  ClockIcon,
  LockIcon,
  ShieldIcon,
} from "@/components/auth/AuthShell";

type Phase = "verifying" | "ready" | "submitting" | "success" | "invalid";

function strengthScore(pw: string): number {
  return Math.min(
    4,
    (pw.length >= 8 ? 1 : 0) +
      (/[A-Z]/.test(pw) ? 1 : 0) +
      (/[0-9]/.test(pw) ? 1 : 0) +
      (/[^A-Za-z0-9]/.test(pw) ? 1 : 0)
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode") ?? "";
  const mode = searchParams.get("mode") ?? "";

  const [phase, setPhase] = useState<Phase>("verifying");
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [pw, setPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!oobCode || mode !== "resetPassword") {
      setPhase("invalid");
      setError("This reset link is invalid or incomplete. Please request a new one.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const email = await verifyPasswordResetCode(auth, oobCode);
        if (cancelled) return;
        setAccountEmail(email);
        setPhase("ready");
      } catch {
        if (cancelled) return;
        setPhase("invalid");
        setError(
          "This reset link has expired or already been used. Please request a new one."
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [oobCode, mode]);

  const score = strengthScore(pw);
  const labels = ["", "Weak", "Fair", "Strong", "Excellent"];
  const passwordsMatch = pw.length > 0 && pw === confirmPw;
  const canSubmit = pw.length >= 8 && passwordsMatch && phase === "ready";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setPhase("submitting");
    try {
      await confirmPasswordReset(auth, oobCode, pw);
      setPhase("success");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/weak-password") {
        setError("Password is too weak. Please choose a stronger one.");
      } else if (code === "auth/expired-action-code" || code === "auth/invalid-action-code") {
        setError("This reset link has expired or already been used. Please request a new one.");
        setPhase("invalid");
        return;
      } else {
        setError(mapAuthError(err, "Couldn't reset password. Try again."));
      }
      setPhase("ready");
    }
  };

  return (
    <div className="auth-root">
      <div className="auth">
        <div className="auth-left">
          <header className="auth-head">
            <span className="brand">
              <span className="brand-mark">A</span>
              <span>Annote</span>
            </span>
            <div className="auth-meta">
              <span>Back to</span>
              <Link href="/login">Log in</Link>
            </div>
          </header>

          <div className="auth-body">
            <span className="auth-eyebrow">
              <span className="dot" />
              Reset password
            </span>

            {phase === "success" ? (
              <>
                <h1 className="auth-h">
                  Password updated. <span className="accent">All set.</span>
                </h1>
                <p className="auth-sub">
                  You can now log in with your new password
                  {accountEmail ? (
                    <>
                      {" "}
                      using <b style={{ color: "var(--ink)", fontWeight: 600 }}>{accountEmail}</b>
                    </>
                  ) : null}
                  .
                </p>
                <div className="reset-success">
                  <span className="rs-icn">
                    <CheckIcon size={12} />
                  </span>
                  <div>
                    <div className="rs-title">Your password was changed</div>
                    <div className="rs-body">
                      For security, sessions on other devices may need to sign in again.
                    </div>
                  </div>
                </div>
                <Link href="/login" className="btn btn-primary btn-block" style={{ marginTop: 4 }}>
                  Log in
                  <ArrowIcon size={13} />
                </Link>
              </>
            ) : phase === "invalid" ? (
              <>
                <h1 className="auth-h">
                  Link no longer <span className="accent">valid.</span>
                </h1>
                <p className="auth-sub">
                  {error ??
                    "This reset link has expired or already been used. Please request a new one."}
                </p>
                <Link
                  href="/forgot-password"
                  className="btn btn-primary btn-block"
                  style={{ marginTop: 4 }}
                >
                  Request a new link
                  <ArrowIcon size={13} />
                </Link>
                <div className="auth-switch">
                  <span>Remembered your password?</span>
                  <Link href="/login">Log in</Link>
                </div>
              </>
            ) : (
              <>
                <h1 className="auth-h">
                  Choose a <span className="accent">new password.</span>
                </h1>
                <p className="auth-sub">
                  {phase === "verifying"
                    ? "Verifying your reset link…"
                    : accountEmail
                    ? `Setting a new password for ${accountEmail}.`
                    : "Pick something at least 8 characters long."}
                </p>

                <form onSubmit={onSubmit}>
                  <div className="field">
                    <label className="field-label">
                      New password
                    </label>
                    <div className="input-wrap">
                      <input
                        type={showPw ? "text" : "password"}
                        placeholder="Enter a new password"
                        value={pw}
                        onChange={(e) => setPw(e.target.value)}
                        autoComplete="new-password"
                        disabled={phase !== "ready" && phase !== "submitting"}
                        required
                      />
                      <button
                        type="button"
                        className="toggle-vis"
                        onClick={() => setShowPw(!showPw)}
                      >
                        {showPw ? "Hide" : "Show"}
                      </button>
                    </div>
                    <div className="pw-meter" style={{ visibility: pw ? "visible" : "hidden" }}>
                      <div className="pw-bars">
                        {[1, 2, 3, 4].map((i) => (
                          <span
                            key={i}
                            className={"bar " + (i <= score ? `on-${score}` : "")}
                          />
                        ))}
                      </div>
                      <span className="pw-label">
                        Strength: <b>{labels[score] || "—"}</b>
                      </span>
                    </div>
                  </div>

                  <div className="field">
                    <label className="field-label">Confirm password</label>
                    <div className="input-wrap">
                      <input
                        type={showPw ? "text" : "password"}
                        placeholder="Re-enter your new password"
                        value={confirmPw}
                        onChange={(e) => setConfirmPw(e.target.value)}
                        autoComplete="new-password"
                        disabled={phase !== "ready" && phase !== "submitting"}
                        required
                      />
                    </div>
                    {confirmPw.length > 0 && !passwordsMatch && (
                      <div className="helper" style={{ color: "#b91c1c" }}>
                        Passwords don&apos;t match.
                      </div>
                    )}
                  </div>

                  {error && (
                    <p className="auth-error" style={{ marginTop: 14 }}>
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    style={{ marginTop: 6 }}
                    disabled={!canSubmit}
                  >
                    {(phase as Phase) === "submitting" ? "Resetting…" : "Reset password"}
                    <ArrowIcon size={13} />
                  </button>
                </form>

                <div className="auth-switch">
                  <span>Remembered your password?</span>
                  <Link href="/login">Log in</Link>
                </div>
              </>
            )}
          </div>

          <AuthFoot />
        </div>

        <div className="auth-right">
          <ResetStage />
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetStage() {
  return (
    <div className="stage">
      <div className="stage-inner">
        <div className="lock-stage">
          <div className="lock-vis">
            <div className="lock-orbit-card a">
              <span className="icn">
                <ShieldIcon size={10} />
              </span>
              Encrypted in transit
            </div>
            <div className="lock-orbit-card b">
              <span className="icn good">
                <ClockIcon size={10} />
              </span>
              Single-use link
            </div>
            <div className="lock-icon">
              <LockIcon size={48} />
            </div>
          </div>
        </div>
        <div className="stage-caption">Your new password is hashed and stored securely.</div>
      </div>
    </div>
  );
}
