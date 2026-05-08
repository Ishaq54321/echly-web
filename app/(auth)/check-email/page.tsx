"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AuthFoot,
  BackIcon,
  CheckIcon,
  MailIcon,
  RefreshIcon,
} from "@/components/auth/AuthShell";

const COOLDOWN_SECONDS = 30;

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";
  const email = emailParam.trim();
  const type = searchParams.get("type") === "verification" ? "verification" : "reset";
  const isVerification = type === "verification";

  const resendEndpoint = isVerification
    ? "/api/auth/send-verification"
    : "/api/auth/forgot-password";
  const resendBody = isVerification ? undefined : JSON.stringify({ email });
  const subjectLine = isVerification
    ? "Verify your email — Annote"
    : "Reset your password — single-use link";
  const expiryLabel = isVerification ? "1 hour" : "30 min";
  const stageSub = isVerification
    ? "Verify your email — link valid for 1 hour"
    : "Reset your password — link valid for 30 minutes";
  const eyebrowText = isVerification ? "Check your email" : "Check your email";
  const headlineLead = isVerification ? "Verify your email" : "Reset link sent";
  const headlineAccent = isVerification ? "to continue." : "to your inbox.";
  const bodyCopy = isVerification
    ? "We sent a verification link to"
    : "We sent a single-use password reset link to";
  const bodyTrail = isVerification
    ? ". Click it within the next hour to activate your account."
    : ". Click it within the next 30 minutes to choose a new password.";
  const wrongEmailHref = isVerification ? "/signup" : "/forgot-password";
  const tipSecondary = isVerification
    ? "The link only works once — request a new one if it expires."
    : "The link only works once — request a new one if it expires.";

  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startCooldown = () => {
    setCooldown(COOLDOWN_SECONDS);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const onResend = async () => {
    if (cooldown > 0) return;
    if (!isVerification && !email) return;
    setError(null);
    try {
      const res = await fetch(resendEndpoint, {
        method: "POST",
        cache: "no-store",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: resendBody,
      });
      const payload = (await res.json().catch(() => null)) as
        | { success?: boolean; error?: { code?: string; message?: string } }
        | null;
      const serverMessage = payload?.error?.message;

      if (res.status === 429) {
        setError(serverMessage ?? "Too many requests. Please wait a few minutes and try again.");
        startCooldown();
        return;
      }
      if (!res.ok) {
        setError(serverMessage ?? "Couldn't resend. Please try again in a moment.");
        return;
      }
      setResent(true);
      startCooldown();
    } catch {
      setError("Network error. Please try again.");
    }
  };

  const buttonLabel =
    cooldown > 0 ? `Resend in ${cooldown}s` : resent ? "Resend again" : "Didn't get it? Resend";

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
              <span>Wrong email?</span>
              <Link href={wrongEmailHref}>Try another</Link>
            </div>
          </header>

          <div className="auth-body">
            <Link href="/login" className="back-link">
              <BackIcon size={11} /> Back to log in
            </Link>

            <span className="auth-eyebrow">
              <span className="dot" />
              {eyebrowText}
            </span>
            <h1 className="auth-h">
              {headlineLead} <span className="accent">{headlineAccent}</span>
            </h1>
            <p className="auth-sub">
              {bodyCopy}{" "}
              <b style={{ color: "var(--ink)", fontWeight: 600 }}>{email || "your email"}</b>{bodyTrail}
            </p>

            <div className="email-card">
              <span className="ec-icn">
                <MailIcon size={18} />
              </span>
              <div className="ec-body">
                <div className="ec-addr">{email || "—"}</div>
                <div className="ec-subj">
                  Subject:{" "}
                  <span className="mono">{subjectLine}</span>
                </div>
              </div>
              <span className="ec-pill">{expiryLabel}</span>
            </div>

            <div className="tip-list">
              <div className="tip-row">
                <span className="tip-check">
                  <CheckIcon size={9} />
                </span>
                <span>
                  Make sure to check your <b>spam or promotions</b> folder.
                </span>
              </div>
              <div className="tip-row">
                <span className="tip-check">
                  <CheckIcon size={9} />
                </span>
                <span>{tipSecondary}</span>
              </div>
            </div>

            {error && (
              <p className="auth-error" style={{ marginTop: 0, marginBottom: 14 }}>
                {error}
              </p>
            )}

            <div className="resend-row">
              <button
                type="button"
                className="btn btn-google"
                style={{ height: 44, padding: "0 16px", fontSize: 13.5 }}
                onClick={onResend}
                disabled={cooldown > 0 || (!isVerification && !email)}
              >
                <RefreshIcon size={13} />
                {buttonLabel}
              </button>
              {resent && cooldown > 0 && (
                <span className="sent-flag">
                  <span className="dot" />
                  Just sent
                </span>
              )}
            </div>

            <div className="auth-switch">
              <span>Still no email?</span>
              <a href="mailto:support@echly.com">Contact support</a>
            </div>
          </div>

          <AuthFoot />
        </div>

        <div className="auth-right">
          <CheckEmailStage email={email} stageSub={stageSub} subjectLine={subjectLine} />
        </div>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<div />}>
      <CheckEmailContent />
    </Suspense>
  );
}

function CheckEmailStage({
  email,
  stageSub,
  subjectLine,
}: {
  email: string;
  stageSub: string;
  subjectLine: string;
}) {
  const inboxLabel = email || "your inbox";
  return (
    <div className="stage">
      <div className="stage-inner">
        <div className="mail-orig">
          <span className="icn">
            <MailIcon size={16} />
          </span>
          <div className="label">
            <b>Annote &lt;no-reply@echly.app&gt;</b>
            <div className="sub">{stageSub}</div>
          </div>
        </div>

        <div className="mail-arrow" />

        <div className="float-card mailbox">
          <div className="mb-head">
            <span className="dots">
              <span />
              <span />
              <span />
            </span>
            <span className="title">
              <b>Inbox</b> — {inboxLabel}
            </span>
            <span className="right">3 unread</span>
          </div>
          <div className="mb-body">
            <div className="mb-row fresh">
              <span
                className="av"
                style={{ background: "linear-gradient(135deg, #FF6A3D, #D81E5B)" }}
              >
                A
              </span>
              <div>
                <div className="from">Annote</div>
                <div className="subj">{subjectLine}</div>
              </div>
              <span className="time">now</span>
            </div>
            <div className="mb-row">
              <span
                className="av"
                style={{ background: "linear-gradient(135deg, #B6648E, #803060)" }}
              >
                AR
              </span>
              <div>
                <div className="from">Amelia Reyes</div>
                <div className="subj">Re: pricing page round 2 — see ECH-2418</div>
              </div>
              <span className="time">2:14p</span>
            </div>
            <div className="mb-row">
              <span
                className="av"
                style={{ background: "linear-gradient(135deg, #5B7CFA, #2E4FCF)" }}
              >
                L
              </span>
              <div>
                <div className="from">Linear</div>
                <div className="subj">3 issues moved to &quot;In review&quot;</div>
              </div>
              <span className="time">1:48p</span>
            </div>
            <div className="mb-row">
              <span
                className="av"
                style={{ background: "linear-gradient(135deg, #34C29A, #157A57)" }}
              >
                JK
              </span>
              <div>
                <div className="from">Jordan Kessler</div>
                <div className="subj">Standup notes + this morning&apos;s QA pass</div>
              </div>
              <span className="time">9:02a</span>
            </div>
          </div>
        </div>

        <div className="stage-caption">It usually arrives within 30 seconds.</div>
      </div>
    </div>
  );
}
