"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  signInWithEmailPassword,
  signInWithGoogle,
} from "@/lib/auth/authActions";
import { mapAuthError } from "@/lib/auth/errorMessages";
import {
  ArrowIcon,
  AuthFoot,
  GoogleIcon,
} from "@/components/auth/AuthShell";

function getReturnPath(searchParams: ReturnType<typeof useSearchParams>): string | null {
  const returnUrl = searchParams.get("returnUrl");
  if (typeof returnUrl !== "string" || !returnUrl.startsWith("/")) return null;
  return returnUrl;
}

async function createSessionCookie(user: { getIdToken: () => Promise<string> }) {
  const idToken = await user.getIdToken();
  const res = await fetch("/api/auth/session", {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Session API failed");
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reason = searchParams.get("reason");
  const reasonMessage =
    reason === "workspace_access_revoked"
      ? "You've been removed from your workspace. Please sign in again."
      : reason === "no_workspaces"
      ? "You're not currently a member of any workspace. Please sign in to continue."
      : null;

  async function handlePostLogin(user: { getIdToken: () => Promise<string> }) {
    await createSessionCookie(user);
    const returnPath = getReturnPath(searchParams);
    if (returnPath) {
      router.replace(returnPath);
      return;
    }
    router.replace("/dashboard");
  }

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      await handlePostLogin(user);
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string };
      if (
        err?.code === "auth/popup-closed-by-user" ||
        err?.code === "auth/cancelled-popup-request"
      ) {
        return;
      }
      setError(mapAuthError(e, "Sign in failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await signInWithEmailPassword(email, pw);
      await handlePostLogin(user);
    } catch (e) {
      setError(mapAuthError(e, "Sign in failed"));
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
          </header>

          <div className="auth-body">
            <div className="auth-meta" style={{ marginBottom: 14 }}>
              <span>New to Annote?</span>
              <Link href="/signup">Sign up</Link>
            </div>
            <h1 className="auth-h">
              Log in to <span className="accent">Annote.</span>
            </h1>
            <p className="auth-sub">
              Pick up your sessions, tickets, and reviews — exactly where the team left off.
            </p>

            {reasonMessage && (
              <p
                className="auth-error"
                role="status"
                style={{ marginTop: 8, marginBottom: 14 }}
              >
                {reasonMessage}
              </p>
            )}

            <button
              className="btn btn-google btn-block"
              type="button"
              onClick={handleGoogle}
              disabled={loading}
            >
              <span className="gwrap">
                <GoogleIcon />
              </span>
              Continue with Google
            </button>

            <div className="auth-divider">or with email</div>

            <form onSubmit={handleEmail}>
              <div className="field">
                <label className="field-label">Email</label>
                <input
                  className="input"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="field">
                <label className="field-label">
                  Password
                  <Link href="/forgot-password" className="forgot">
                    Forgot password?
                  </Link>
                </label>
                <div className="input-wrap">
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Enter your password"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    autoComplete="current-password"
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
              </div>

              {error && (
                <p className="auth-error" style={{ marginTop: 14 }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-block"
                style={{ marginTop: 18 }}
                disabled={loading}
              >
                Log in
                <ArrowIcon size={13} />
              </button>
            </form>
          </div>

          <AuthFoot />
        </div>

        <div className="auth-right">
          <LogInStage />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-root" />}>
      <LoginPageContent />
    </Suspense>
  );
}

function LogInStage() {
  return (
    <div className="stage">
      <div className="stage-inner">
        <div style={{ position: "relative" }}>
          <div className="notif-chip">
            <span className="nc-dot" />
            <span className="nc-text">
              <b>Jordan</b> resolved <b>3 tickets</b> in Sprint 14
            </span>
            <span className="nc-time">14:02</span>
          </div>

          <div className="float-card session-card">
            <div className="sess-head">
              <span className="ws-glyph">N</span>
              <div>
                <div className="ws-name">North Needle</div>
                <div className="ws-meta">12 members · 4 active sessions</div>
              </div>
              <span className="live-pill">
                Session Started
              </span>
            </div>

            <div className="sess-row">
              <span className="sr-status review" />
              <span className="sr-title">Pricing page redesign — round 2</span>
              <div className="sr-stack">
                <span
                  className="av"
                  style={{ background: "linear-gradient(135deg, #5A49BF, #3D2F73)" }}
                >
                  IM
                </span>
                <span
                  className="av"
                  style={{ background: "linear-gradient(135deg, #B6648E, #803060)" }}
                >
                  AR
                </span>
                <span
                  className="av"
                  style={{ background: "linear-gradient(135deg, #34C29A, #157A57)" }}
                >
                  JK
                </span>
              </div>
            </div>

            <div className="sess-row">
              <span className="sr-status open" />
              <span className="sr-title">Onboarding flow — week 4</span>
              <div className="sr-stack">
                <span
                  className="av"
                  style={{ background: "linear-gradient(135deg, #5B7CFA, #2E4FCF)" }}
                >
                  SK
                </span>
                <span
                  className="av"
                  style={{ background: "linear-gradient(135deg, #E0915C, #B05E2C)" }}
                >
                  MT
                </span>
              </div>
            </div>

            <div className="sess-row">
              <span className="sr-status open" />
              <span className="sr-title">Mobile nav — staging QA</span>
              <div className="sr-stack">
                <span
                  className="av"
                  style={{ background: "linear-gradient(135deg, #5B7CFA, #2E4FCF)" }}
                >
                  SK
                </span>
                <span
                  className="av"
                  style={{ background: "linear-gradient(135deg, #E0915C, #B05E2C)" }}
                >
                  MT
                </span>
              </div>
            </div>

            <div className="sess-row">
              <span className="sr-status open" />
              <span className="sr-title">Settings — Billing copy review</span>
              <div className="sr-stack">
                <span
                  className="av"
                  style={{ background: "linear-gradient(135deg, #34C29A, #157A57)" }}
                >
                  JK
                </span>
                <span
                  className="av"
                  style={{ background: "linear-gradient(135deg, #5A49BF, #3D2F73)" }}
                >
                  IM
                </span>
              </div>
            </div>

            <div className="sess-foot">
              <span>
                <b>18</b> open · <b>42</b> resolved this week
              </span>
              <span className="right">
                View all <ArrowIcon size={11} />
              </span>
            </div>
          </div>
        </div>

        <div className="stage-caption">Pick up exactly where your team left off.</div>
      </div>
    </div>
  );
}
