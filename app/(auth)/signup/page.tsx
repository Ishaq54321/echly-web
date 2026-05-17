"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  signInWithGoogle,
  signUpWithEmailPassword,
} from "@/lib/auth/authActions";
import { mapAuthError } from "@/lib/auth/errorMessages";
import {
  ArrowIcon,
  AuthFoot,
  GoogleIcon,
  ShareIcon,
} from "@/components/auth/AuthShell";

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

function SignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const score = useMemo(() => {
    return Math.min(
      4,
      (pw.length >= 8 ? 1 : 0) +
        (/[A-Z]/.test(pw) ? 1 : 0) +
        (/[0-9]/.test(pw) ? 1 : 0) +
        (/[^A-Za-z0-9]/.test(pw) ? 1 : 0)
    );
  }, [pw]);
  const labels = ["", "Weak", "Fair", "Strong", "Excellent"];

  async function handlePostSignup(
    user: { getIdToken: () => Promise<string>; email: string | null },
    isGoogle: boolean
  ) {
    await createSessionCookie(user);
    if (isGoogle) {
      if (returnUrl && returnUrl.startsWith("/")) {
        router.replace(returnUrl);
        return;
      }
      router.replace("/onboarding");
      return;
    }
    try {
      await fetch("/api/auth/send-verification", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
    } catch {
      // non-fatal — user can resend from check-email
    }
    const emailParam = encodeURIComponent(user.email ?? email);
    router.replace(`/check-email?email=${emailParam}&type=verification`);
  }

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      await handlePostSignup(user, true);
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string };
      if (
        err?.code === "auth/popup-closed-by-user" ||
        err?.code === "auth/cancelled-popup-request"
      ) {
        return;
      }
      setError(mapAuthError(e, "Sign up failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await signUpWithEmailPassword(email, pw);
      await handlePostSignup(user, false);
    } catch (e) {
      setError(mapAuthError(e, "Sign up failed"));
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
              <span>Already have an account?</span>
              <Link href="/login">Log in</Link>
            </div>
            <h1 className="auth-h">
              Start finding bugs <span className="accent">faster.</span>
            </h1>
            <p className="auth-sub">
              Join the teams using Annote to turn web feedback into shipped fixes. Free for 14 days, no card required.
            </p>

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
                <label className="field-label">Work email</label>
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
                </label>
                <div className="input-wrap">
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Create a password"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    autoComplete="new-password"
                    minLength={8}
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
                <div
                  className="pw-meter"
                  style={{ visibility: pw ? "visible" : "hidden" }}
                >
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

              {error && <p className="auth-error">{error}</p>}

              <button
                type="submit"
                className="btn btn-primary btn-block"
                style={{ marginTop: 6 }}
                disabled={loading}
              >
                Create account
                <ArrowIcon size={13} />
              </button>
            </form>

            <p className="auth-terms">
              By creating an account you agree to Annote&apos;s{" "}
              <a href="#" className="ilink">Terms of Service</a> and{" "}
              <a href="#" className="ilink">Privacy Policy</a>. We&apos;ll send you product updates — you can opt out anytime.
            </p>
          </div>

          <AuthFoot />
        </div>

        <div className="auth-right">
          <SignUpStage />
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="auth-root" />}>
      <SignupPageContent />
    </Suspense>
  );
}

function SignUpStage() {
  return (
    <div className="stage">
      <div className="stage-inner">
        <div style={{ position: "relative" }}>
          <div className="float-card stage-comment">
            <span className="sc-av">AR</span>
            <div>
              <div className="sc-meta">
                <b>Amelia Reyes</b> · just now
              </div>
              <div className="sc-text">
                &quot;This is exactly the broken state I was seeing in staging.&quot;
              </div>
            </div>
          </div>

          <div className="float-card ticket-card">
            <div className="tc-head">
              <span className="tc-pill session">Sprint 14 review</span>
              <span className="tc-id">ECH-2418</span>
              <span className="tc-grow" />
              <span className="tc-prio">
                <span className="pdot" />
                High
              </span>
            </div>
            <div className="tc-body">
              <div className="tc-title">CTA misaligned on hover</div>
              <div className="tc-desc">
                Pricing page · Chrome 132 · 1440×900 · The &quot;Start free&quot; button shifts 4px right on hover, causing the row to reflow.
              </div>
              <div className="tc-shot">
                <span className="shot-line l1" />
                <span className="shot-line l2" />
                <span className="shot-line l3" />
                <div className="cap">
                  <span className="cap-label">CAPTURED · 130×50</span>
                </div>
                <div className="annot-bubble">+4px on hover</div>
              </div>
              <div className="tc-foot">
                <div className="tc-stack">
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
                <span className="tc-meta">
                  <b>3 reviewers</b> · 7 comments
                </span>
                <span className="tc-time">2m ago</span>
              </div>
            </div>
          </div>

          <div className="float-card stage-resolved">
            <span className="check">
              <ShareIcon size={11} />
            </span>
            <span>
              <b style={{ color: "var(--ink)", fontWeight: 600 }}>Share session</b> with your team
            </span>
          </div>
        </div>

        <div className="stage-caption">A real session ticket from a real Annote team.</div>
      </div>
    </div>
  );
}
