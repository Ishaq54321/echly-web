"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { authFetch } from "@/lib/authFetch";

type InvitePreview = {
  workspaceName: string;
  invitedByName: string;
  role: "OWNER" | "MEMBER";
  email: string;
  expiresAt: { seconds: number; nanoseconds: number };
};

type State =
  | { phase: "loading" }
  | { phase: "valid"; preview: InvitePreview; authChecked: boolean; authedEmail: string | null }
  | { phase: "invalid"; reason: "not_found" | "already_used" | "expired" | "error" }
  | { phase: "accepted"; workspaceName: string }
  | { phase: "accepting" }
  | { phase: "mismatch"; expected: string };

export default function InviteAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [state, setState] = useState<State>({ phase: "loading" });
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState(2);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load invite preview
  useEffect(() => {
    if (!token) return;
    fetch(`/api/workspace/invitations/accept/${token}`, { cache: "no-store" })
      .then(async (res) => {
        const json = await res.json() as {
          success: boolean;
          data?: InvitePreview;
          error?: { message: string; code: string };
        };
        if (json.success && json.data) {
          // Also wait for Firebase auth state
          const unsub = onAuthStateChanged(auth, (user) => {
            unsub();
            setState({
              phase: "valid",
              preview: json.data!,
              authChecked: true,
              authedEmail: user?.email?.toLowerCase() ?? null,
            });
          });
        } else {
          const msg = json.error?.message ?? "";
          if (msg === "INVITE_EXPIRED") {
            setState({ phase: "invalid", reason: "expired" });
          } else if (msg === "INVITE_INVALID") {
            setState({ phase: "invalid", reason: "already_used" });
          } else if (res.status === 404) {
            setState({ phase: "invalid", reason: "not_found" });
          } else {
            setState({ phase: "invalid", reason: "error" });
          }
        }
      })
      .catch(() => setState({ phase: "invalid", reason: "error" }));
  }, [token]);

  async function handleAccept() {
    if (state.phase !== "valid") return;
    setAcceptError(null);
    setAccepting(true);
    try {
      const res = await authFetch(`/api/workspace/invitations/accept/${token}`, { method: "POST" });
      if (!res) { setAcceptError("Not signed in. Please sign in first."); return; }
      const json = await res.json() as {
        success: boolean;
        data?: { workspaceName: string };
        error?: { message: string };
      };
      if (!res.ok || !json.success) {
        const msg = json.error?.message ?? "";
        if (msg === "EMAIL_MISMATCH") {
          setState({ phase: "mismatch", expected: state.preview.email });
          return;
        }
        setAcceptError(msg || "Failed to accept invitation. Try again.");
        return;
      }
      setState({ phase: "accepted", workspaceName: json.data?.workspaceName ?? state.preview.workspaceName });
      setRedirectCountdown(2);
      countdownRef.current = setInterval(() => {
        setRedirectCountdown((n) => {
          if (n <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            router.replace("/dashboard");
            return 0;
          }
          return n - 1;
        });
      }, 1000);
    } catch {
      setAcceptError("Failed to accept invitation. Try again.");
    } finally {
      setAccepting(false);
    }
  }

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  function daysUntilExpiry(expiresAt: { seconds: number }): number {
    return Math.ceil((expiresAt.seconds * 1000 - Date.now()) / (1000 * 60 * 60 * 24));
  }

  const returnUrl = `/invite/${token}`;

  return (
    <div className="min-h-screen bg-[#f9fafc] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="relative w-10 h-10 bg-[#155DFC] rounded-md flex items-center justify-center overflow-hidden" aria-label="Echly home">
            <Image src="/Echly_logo.svg" alt="" fill sizes="40px" className="object-cover" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
          {state.phase === "loading" && (
            <div className="text-center py-8">
              <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto mb-4" aria-hidden />
              <p className="text-neutral-600 text-sm">Loading invitation…</p>
            </div>
          )}

          {state.phase === "valid" && (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    {state.preview.workspaceName.trim().charAt(0).toUpperCase()}
                  </span>
                </div>
                <h1 className="text-[22px] font-semibold text-neutral-900">
                  You&apos;re invited to join
                </h1>
                <p className="mt-1 text-[18px] font-bold text-neutral-900">
                  {state.preview.workspaceName}
                </p>
                <p className="mt-2 text-sm text-neutral-500">
                  Invited by <span className="font-medium text-neutral-700">{state.preview.invitedByName}</span>
                </p>
                <span className="inline-block mt-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600">
                  You&apos;ll join as {state.preview.role === "OWNER" ? "Owner" : "Member"}
                </span>
                {(() => {
                  const days = daysUntilExpiry(state.preview.expiresAt);
                  if (days < 7) {
                    return (
                      <p className={`mt-2 text-xs font-medium ${days < 2 ? "text-red-600" : "text-amber-600"}`}>
                        ⚠ Expires in {days <= 0 ? "less than a day" : `${days} day${days === 1 ? "" : "s"}`}
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>

              {!state.authedEmail ? (
                <div className="space-y-2">
                  <Link
                    href={`/signup?returnUrl=${encodeURIComponent(returnUrl)}&invite=${token}&email=${encodeURIComponent(state.preview.email)}`}
                    className="w-full flex items-center justify-center px-4 py-[11px] rounded-xl bg-[#155DFC] text-white text-sm font-semibold hover:brightness-110 transition"
                  >
                    Create account
                  </Link>
                  <Link
                    href={`/login?returnUrl=${encodeURIComponent(returnUrl)}&invite=${token}&email=${encodeURIComponent(state.preview.email)}`}
                    className="w-full flex items-center justify-center px-4 py-[11px] rounded-xl border border-neutral-200 text-neutral-700 text-sm font-semibold hover:bg-neutral-50 transition"
                  >
                    Sign in instead
                  </Link>
                  <p className="text-center text-xs text-neutral-400 pt-1">
                    By accepting you agree to the workspace terms
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-center text-neutral-600">
                    Signed in as <strong>{state.authedEmail}</strong>
                  </p>
                  {acceptError && (
                    <p className="text-sm text-center text-red-600">{acceptError}</p>
                  )}
                  <button
                    type="button"
                    onClick={handleAccept}
                    disabled={accepting}
                    className="w-full flex items-center justify-center px-4 py-[11px] rounded-xl bg-[#155DFC] text-white text-sm font-semibold hover:brightness-110 transition disabled:opacity-60"
                  >
                    {accepting ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2" aria-hidden />
                        Accepting…
                      </>
                    ) : (
                      "Accept Invitation"
                    )}
                  </button>
                  <p className="text-center text-xs text-neutral-400">
                    By accepting you agree to the workspace terms
                  </p>
                </div>
              )}
            </>
          )}

          {state.phase === "accepted" && (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-[20px] font-semibold text-neutral-900">
                You&apos;ve joined {state.workspaceName}!
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                Redirecting in {redirectCountdown}s…
              </p>
            </div>
          )}

          {state.phase === "mismatch" && (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <h2 className="text-[18px] font-semibold text-neutral-900">Wrong account</h2>
              <p className="mt-2 text-sm text-neutral-600">
                This invitation was sent to{" "}
                <strong>
                  {state.expected.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => a + "*".repeat(Math.min(b.length, 4)) + c)}
                </strong>.
                {" "}Sign out and use the correct account.
              </p>
              <button
                type="button"
                onClick={async () => {
                  const { auth: fbAuth } = await import("@/lib/firebase");
                  const { signOut } = await import("firebase/auth");
                  await signOut(fbAuth).catch(() => void 0);
                  window.location.href = `/login?returnUrl=${encodeURIComponent(returnUrl)}`;
                }}
                className="mt-4 inline-block px-4 py-2.5 rounded-xl bg-[#155DFC] text-white text-sm font-semibold hover:brightness-110 transition"
              >
                Sign out and use correct account
              </button>
            </div>
          )}

          {state.phase === "invalid" && (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-[18px] font-semibold text-neutral-900">
                {state.reason === "not_found" && "Invitation not found"}
                {state.reason === "already_used" && "Invitation already used"}
                {state.reason === "expired" && "Invitation expired"}
                {state.reason === "error" && "Something went wrong"}
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                {state.reason === "not_found" && "This invitation link is invalid or has been revoked."}
                {state.reason === "already_used" && "This invitation has already been accepted or revoked."}
                {state.reason === "expired" && "This invitation has expired. Ask the workspace owner to send a new one."}
                {state.reason === "error" && "Unable to load the invitation. Please try again later."}
              </p>
              <Link href="/login" className="mt-4 inline-block text-sm font-medium text-[#155DFC] hover:underline">
                Go to sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
