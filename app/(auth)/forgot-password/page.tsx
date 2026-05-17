"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowIcon,
  AuthFoot,
  BackIcon,
  ClockIcon,
  LockIcon,
  ShieldIcon,
} from "@/components/auth/AuthShell";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = EMAIL_RE.test(email);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.status === 429) {
        setError("Too many requests. Please wait a few minutes and try again.");
        return;
      }
      if (!res.ok) {
        setError("Something went wrong. Please try again.");
        return;
      }
      router.replace(`/check-email?email=${encodeURIComponent(email.trim())}`);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth">
        <div className="auth-left">
          <header className="auth-head">
            <span className="brand">
              <Image
                src="/annote-logo-full.svg"
                alt="Annote"
                width={118}
                height={28}
                priority
                className="brand-logo"
              />
            </span>
            <div className="auth-meta">
              <span>Remembered it?</span>
              <Link href="/login">Log in</Link>
            </div>
          </header>

          <div className="auth-body">
            <Link href="/login" className="back-link">
              <BackIcon size={11} /> Back to log in
            </Link>

            <span className="auth-eyebrow">
              <span className="dot" />
              Reset password
            </span>
            <h1 className="auth-h">
              Let&apos;s get you <span className="accent">back in.</span>
            </h1>
            <p className="auth-sub">
              Enter the email tied to your Annote account. We&apos;ll send a single-use link to
              choose a new password — it expires in 30 minutes.
            </p>

            <form onSubmit={onSubmit}>
              <div className="field">
                <label className="field-label">Email address</label>
                <input
                  className="input"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                  required
                />
                <div className="helper">
                  We&apos;ll only send to addresses with a registered Annote account.
                </div>
              </div>

              {error && (
                <p className="auth-error" style={{ marginTop: 14 }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-block"
                style={{ marginTop: 14 }}
                disabled={!valid || loading}
              >
                {loading ? "Sending…" : "Send reset link"}
                <ArrowIcon size={13} />
              </button>
            </form>

            <div className="auth-switch">
              <span>Don&apos;t have an account?</span>
              <Link href="/signup">Sign up</Link>
            </div>
          </div>

          <AuthFoot />
        </div>

        <div className="auth-right">
          <ForgotStage />
        </div>
      </div>
    </div>
  );
}

function ForgotStage() {
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
              Link expires in 30 min
            </div>
            <div className="lock-icon">
              <LockIcon size={48} />
            </div>
          </div>
        </div>
        <div className="stage-caption">A signed, single-use link — never your old password.</div>
      </div>
    </div>
  );
}
