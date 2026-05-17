"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { applyActionCode } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AuthFoot } from "@/components/auth/AuthShell";

type Phase = "working" | "success" | "error" | "redirecting";

function AuthActionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") ?? "";
  const oobCode = searchParams.get("oobCode") ?? "";

  const [phase, setPhase] = useState<Phase>("working");
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (!mode || !oobCode) {
      setPhase("error");
      setError("This link is invalid or incomplete. Please request a new one.");
      return;
    }

    if (mode === "resetPassword") {
      setPhase("redirecting");
      router.replace(
        `/reset-password?oobCode=${encodeURIComponent(oobCode)}&mode=resetPassword`
      );
      return;
    }

    if (mode !== "verifyEmail") {
      setPhase("error");
      setError("Unsupported action. Please request a fresh link.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        await applyActionCode(auth, oobCode);
        if (cancelled) return;
        const res = await fetch("/api/auth/mark-verified", {
          method: "POST",
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) {
          // Still verified server-side; cookie is missing. Surface as error so
          // user can re-trigger by signing in again.
          setPhase("error");
          setError(
            "Email verified, but we couldn't refresh your session. Please log in again."
          );
          return;
        }
        if (cancelled) return;
        setPhase("success");
        setTimeout(() => router.replace("/onboarding"), 800);
      } catch (e) {
        if (cancelled) return;
        const code = (e as { code?: string })?.code ?? "";
        const msg =
          code === "auth/expired-action-code"
            ? "This verification link has expired. Request a new one below."
            : code === "auth/invalid-action-code"
            ? "This verification link is invalid or has already been used."
            : "We couldn't verify your email. Please request a new link.";
        setPhase("error");
        setError(msg);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mode, oobCode, router]);

  const onResend = async () => {
    setResending(true);
    try {
      const res = await fetch("/api/auth/send-verification", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
      if (res.ok) setResent(true);
    } finally {
      setResending(false);
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
            {phase === "working" && (
              <>
                <span className="auth-eyebrow">
                  <span className="dot" />
                  One moment
                </span>
                <h1 className="auth-h">Verifying your email…</h1>
                <p className="auth-sub">Hang tight — this usually takes a second.</p>
              </>
            )}

            {phase === "redirecting" && (
              <>
                <h1 className="auth-h">Taking you to reset password…</h1>
              </>
            )}

            {phase === "success" && (
              <>
                <span className="auth-eyebrow">
                  <span className="dot" />
                  Verified
                </span>
                <h1 className="auth-h">
                  Email verified <span className="accent">— let&apos;s get you set up.</span>
                </h1>
                <p className="auth-sub">Redirecting you to onboarding…</p>
              </>
            )}

            {phase === "error" && (
              <>
                <h1 className="auth-h">Link issue</h1>
                <p className="auth-sub">{error}</p>
                {resent ? (
                  <p className="auth-sub">
                    A new verification link has been sent. Check your inbox.
                  </p>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    style={{ marginTop: 18 }}
                    onClick={onResend}
                    disabled={resending}
                  >
                    {resending ? "Sending…" : "Resend verification email"}
                  </button>
                )}
                <div className="auth-switch" style={{ marginTop: 18 }}>
                  <span>Need to sign in?</span>
                  <Link href="/login">Log in</Link>
                </div>
              </>
            )}
          </div>

          <AuthFoot />
        </div>
      </div>
    </div>
  );
}

export default function AuthActionPage() {
  return (
    <Suspense fallback={<div className="auth-root" />}>
      <AuthActionContent />
    </Suspense>
  );
}
