"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useWorkspace } from "@/lib/client/workspaceContext";
import { Toast } from "@/components/ui/Toast";
import {
  ChevronLeft,
  Lock,
  AlertCircle,
  Clock,
  LogOut,
  MailCheck,
  Eye,
  EyeOff,
  XCircle,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type InvitePhase =
  | "loading"
  | "invalid"
  | "landing"
  | "checking"
  | "login"
  | "signup"
  | "forgot"
  | "accepting"
  | "success"
  | "mismatch"
  | "error";

type InvitePreview = {
  workspaceName: string;
  invitedByName: string;
  role: "OWNER" | "MEMBER";
  email: string;
  expiresAt: { seconds: number; nanoseconds: number };
};

type InvalidReason = "expired" | "not_found" | "used" | "error";

interface InviteState {
  phase: InvitePhase;
  preview: InvitePreview | null;
  authedUser: { email: string; uid: string } | null;
  formError: string | null;
  countdown: number;
  invalidReason: InvalidReason;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function createSessionCookie(user: { getIdToken: () => Promise<string> }) {
  try {
    const idToken = await user.getIdToken();
    await fetch("/api/auth/session", {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
      credentials: "include",
    });
  } catch (e) {
    console.error("Session creation failed", e);
  }
}

function daysUntilExpiry(expiresAt: { seconds: number }): number {
  return Math.ceil((expiresAt.seconds * 1000 - Date.now()) / (1000 * 60 * 60 * 24));
}

// ── Shared mini-components ────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '48px',
  background: 'var(--surface-subtle)',
  border: '1.5px solid var(--border)',
  borderRadius: '12px',
  padding: '0 14px',
  fontSize: '15px',
  color: 'var(--text-heading)',
  outline: 'none',
  transition: 'border-color 160ms ease, box-shadow 160ms ease',
  fontFamily: 'inherit',
};

function Spinner({ size = 20, color = "var(--brand)" }: { size?: number; color?: string }) {
  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: `2px solid ${color}`,
        borderTopColor: "transparent",
        animation: "invite-spin 700ms linear infinite",
        flexShrink: 0,
      }}
    />
  );
}

function FormError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        background: "var(--color-danger-bg)",
        border: "1px solid var(--color-danger-border)",
        borderRadius: "8px",
        padding: "10px 12px",
        marginTop: 8,
      }}
    >
      <AlertCircle size={14} color="var(--color-danger)" style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ fontSize: 13, color: "var(--color-danger)", lineHeight: 1.4 }}>{message}</span>
    </div>
  );
}

function EmailChip({ email }: { email: string }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "var(--surface-input)",
        border: "1px solid var(--border)",
        borderRadius: "9999px",
        padding: "4px 12px",
        marginBottom: 20,
      }}
    >
      <Lock size={13} color="var(--text-secondary)" />
      <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-body)" }}>{email}</span>
    </div>
  );
}

function PrimaryButton({
  onClick,
  type = "button",
  loading,
  disabled,
  loadingText,
  children,
}: {
  onClick?: () => void;
  type?: "button" | "submit";
  loading: boolean;
  disabled?: boolean;
  loadingText: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      style={{
        width: "100%",
        height: 48,
        background: "var(--brand)",
        color: "#FFFFFF",
        border: "none",
        borderRadius: 14,
        fontSize: 16,
        fontWeight: 600,
        letterSpacing: "-0.2px",
        boxShadow: "0 2px 8px rgba(23,117,224,0.25), 0 1px 3px rgba(23,117,224,0.15)",
        cursor: loading || disabled ? "not-allowed" : "pointer",
        opacity: loading || disabled ? 0.65 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transition: "all 160ms ease",
        fontFamily: "inherit",
      }}
    >
      {loading ? (
        <>
          <Spinner size={16} color="#FFFFFF" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Go back"
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-secondary)",
        marginBottom: 16,
        padding: 0,
      }}
    >
      <ChevronLeft size={20} />
    </button>
  );
}

function PasswordInput({
  value,
  onChange,
  show,
  onToggle,
  autoFocus,
  label,
  placeholder,
  minLength,
  fieldKey,
}: {
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  autoFocus?: boolean;
  label: string;
  placeholder?: string;
  minLength?: number;
  fieldKey: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
        marginBottom: '16px',
      }}
    >
      <label
        style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: '500',
          color: 'var(--text-secondary)',
          marginBottom: '6px',
        }}
      >
        {label}
      </label>
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus={autoFocus}
          required
          minLength={minLength}
          className="invite-input"
          placeholder={placeholder}
          style={{
            ...inputStyle,
            paddingRight: '44px',
            border: focused ? '1.5px solid var(--brand)' : '1.5px solid var(--border)',
            boxShadow: focused ? '0 0 0 3px rgba(23,117,224,0.12)' : 'none',
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? "Hide password" : "Show password"}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--text-tertiary)',
            outline: 'none',
          }}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function InviteAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { refreshMemberships } = useWorkspace();

  const [state, setState] = useState<InviteState>({
    phase: "loading",
    preview: null,
    authedUser: null,
    formError: null,
    countdown: 3,
    invalidReason: "error",
  });

  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPw, setShowLoginPw] = useState(false);

  const [signupPassword, setSignupPassword] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [showSignupPw, setShowSignupPw] = useState(false);

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  });

  function showToast(msg: string) {
    setToast({ message: msg, visible: true });
  }

  function dismissToast() {
    setToast((prev) => ({ ...prev, visible: false }));
  }

  // ── Load invite + resolve auth state ──────────────────────────────────────

  useEffect(() => {
    if (!token) return;

    fetch(`/api/workspace/invitations/accept/${token}`, { cache: "no-store" })
      .then(async (res) => {
        const json = (await res.json()) as {
          success: boolean;
          data?: InvitePreview;
          error?: { message: string; code: string };
        };

        if (!json.success || !json.data) {
          const msg = json.error?.message ?? "";
          let invalidReason: InvalidReason = "error";
          if (msg === "INVITE_EXPIRED") invalidReason = "expired";
          else if (msg === "INVITE_INVALID") invalidReason = "used";
          else if (res.status === 404) invalidReason = "not_found";
          setState((s) => ({ ...s, phase: "invalid", invalidReason }));
          return;
        }

        const preview = json.data;
        const unsub = onAuthStateChanged(auth, (user) => {
          unsub();
          setState((s) => ({
            ...s,
            phase: "landing",
            preview,
            authedUser: user ? { email: user.email ?? "", uid: user.uid } : null,
          }));
        });
      })
      .catch(() => {
        setState((s) => ({ ...s, phase: "invalid", invalidReason: "error" }));
      });
  }, [token]);

  // ── Success countdown ──────────────────────────────────────────────────────

  useEffect(() => {
    if (state.phase !== "success") return;

    countdownRef.current = setInterval(() => {
      setState((s) => {
        if (s.countdown <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return s;
        }
        return { ...s, countdown: s.countdown - 1 };
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [state.phase]);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // ── Core helpers ───────────────────────────────────────────────────────────

  async function postAccept(
    idToken: string
  ): Promise<{ ok: boolean; workspaceId?: string; switchedToWorkspaceId?: string; workspaceName?: string; errorCode?: string }> {
    try {
      const res = await fetch(`/api/workspace/invitations/accept/${token}`, {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });
      const json = (await res.json()) as {
        success: boolean;
        data?: { workspaceId: string; switchedToWorkspaceId?: string; workspaceName?: string };
        error?: { message: string };
      };
      if (!res.ok || !json.success) {
        return { ok: false, errorCode: json.error?.message };
      }
      return {
        ok: true,
        workspaceId: json.data?.workspaceId,
        switchedToWorkspaceId: json.data?.switchedToWorkspaceId,
        workspaceName: json.data?.workspaceName,
      };
    } catch {
      return { ok: false };
    }
  }

  async function enterSuccess(workspaceId: string, uid: string) {
    const workspaceName = state.preview?.workspaceName ?? "";
    sessionStorage.setItem(
      "joined_workspace",
      JSON.stringify({ workspaceName, workspaceId })
    );
    if (workspaceId && uid) {
      localStorage.setItem(`echly_active_workspace_${uid}`, workspaceId);
    }

    // Clear session cache
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith("echly_sessions:")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => sessionStorage.removeItem(k));

    // Force token refresh
    if (auth.currentUser) {
      await auth.currentUser.getIdToken(true);
    }

    refreshMemberships();

    showToast(`You've joined ${workspaceName} — switching now`);

    setState((s) => ({
      ...s,
      phase: "success",
      countdown: 3,
      formError: null,
    }));

    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1500);
  }

  function handleAcceptResult(
    result: { ok: boolean; errorCode?: string },
    fallbackPhase: InvitePhase
  ) {
    if (result.ok) {
      // workspaceId will be set before calling this via enterSuccess
      return;
    }
    if (result.errorCode === "EMAIL_MISMATCH") {
      setState((s) => ({ ...s, phase: "mismatch" }));
    } else if (result.errorCode === "INVITE_EXPIRED") {
      setState((s) => ({
        ...s,
        phase: fallbackPhase,
        formError:
          "This invitation has expired. Ask your workspace admin to send a new one.",
      }));
    } else {
      router.replace("/dashboard");
    }
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function handleAcceptClick() {
    const { preview, authedUser } = state;
    if (!preview) return;

    setState((s) => ({ ...s, phase: "checking", formError: null }));

    if (authedUser) {
      if (authedUser.email.toLowerCase() === preview.email.toLowerCase()) {
        setState((s) => ({ ...s, phase: "accepting" }));
        const user = auth.currentUser;
        if (!user) {
          setState((s) => ({ ...s, phase: "error" }));
          return;
        }
        const idToken = await user.getIdToken();
        const result = await postAccept(idToken);
        if (result.ok) {
          await enterSuccess(result.workspaceId ?? "", authedUser.uid);
        } else {
          setState((s) => ({ ...s, phase: "landing" }));
          handleAcceptResult(result, "landing");
        }
      } else {
        setState((s) => ({ ...s, phase: "mismatch" }));
      }
      return;
    }

    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: preview.email }),
      });
      const json = (await res.json()) as {
        success: boolean;
        data?: { exists: boolean };
      };
      if (!res.ok || !json.success) {
        setState((s) => ({ ...s, phase: "error" }));
        return;
      }
      setState((s) => ({
        ...s,
        phase: json.data?.exists ? "login" : "signup",
        formError: null,
      }));
    } catch {
      setState((s) => ({ ...s, phase: "error" }));
    }
  }

  async function handleLogin() {
    const { preview } = state;
    if (!preview) return;
    setLoginLoading(true);
    setState((s) => ({ ...s, formError: null }));

    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        preview.email,
        loginPassword
      );
      await createSessionCookie(cred.user);
      setState((s) => ({
        ...s,
        phase: "accepting",
        authedUser: { email: cred.user.email ?? preview.email, uid: cred.user.uid },
      }));
      const idToken = await cred.user.getIdToken();
      const result = await postAccept(idToken);
      if (result.ok) {
        await enterSuccess(result.workspaceId ?? "", cred.user.uid);
      } else {
        setState((s) => ({ ...s, phase: "login" }));
        handleAcceptResult(result, "login");
      }
    } catch (e: unknown) {
      const code = (e as { code?: string }).code;
      let msg = "Sign in failed. Please try again.";
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        msg = "Incorrect password. Please try again.";
      } else if (code === "auth/too-many-requests") {
        msg = "Too many attempts. Please wait and try again.";
      }
      setState((s) => ({ ...s, phase: "login", formError: msg }));
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleSignup() {
    const { preview } = state;
    if (!preview) return;
    setSignupLoading(true);
    setState((s) => ({ ...s, formError: null }));

    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        preview.email,
        signupPassword
      );
      await createSessionCookie(cred.user);
      const idToken = await cred.user.getIdToken();

      setState((s) => ({
        ...s,
        phase: "accepting",
        authedUser: { email: cred.user.email ?? preview.email, uid: cred.user.uid },
      }));
      const result = await postAccept(idToken);
      if (result.ok) {
        await enterSuccess(result.workspaceId ?? "", cred.user.uid);
      } else {
        setState((s) => ({ ...s, phase: "signup" }));
        handleAcceptResult(result, "signup");
      }
    } catch (e: unknown) {
      const code = (e as { code?: string }).code;
      if (code === "auth/email-already-in-use") {
        setState((s) => ({
          ...s,
          phase: "login",
          formError: "An account with this email already exists.",
        }));
        setSignupLoading(false);
        return;
      }
      const msg =
        code === "auth/weak-password"
          ? "Password must be at least 8 characters."
          : "Sign up failed. Please try again.";
      setState((s) => ({ ...s, phase: "signup", formError: msg }));
    } finally {
      setSignupLoading(false);
    }
  }

  async function handleForgotPassword() {
    const { preview } = state;
    if (!preview) return;
    try {
      await sendPasswordResetEmail(auth, preview.email);
    } catch {
      /* show success regardless */
    }
    setState((s) => ({ ...s, phase: "forgot" }));
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const { phase, preview, authedUser, formError, countdown } = state;

  return (
    <>
      <style>{`
        @keyframes invite-spin { to { transform: rotate(360deg); } }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes invite-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes drawCheck {
          from { stroke-dashoffset: 60; }
          to   { stroke-dashoffset: 0; }
        }
        .invite-enter { animation: invite-fade-in 200ms ease forwards; }
        .invite-input {
          outline: none !important;
          -webkit-appearance: none;
          appearance: none;
        }
        .invite-input:focus {
          outline: none !important;
          box-shadow: none;
        }
      `}</style>

      {/* FIX 6 — page background */}
      <div
        style={{
          minHeight: "100dvh",
          background: "var(--surface-subtle)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            position: "absolute",
            top: 28,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          <div style={{ position: "relative", width: 36, height: 36, flexShrink: 0 }}>
            <Image src="/Echly_logo.svg" alt="" fill sizes="36px" style={{ objectFit: "contain" }} />
          </div>
          <span style={{ fontSize: 22, fontWeight: 600, color: "var(--text-heading)", whiteSpace: "nowrap" }}>
            Echly
          </span>
        </Link>

        {/* FIX 3 — card with visible shadow and border */}
        <div
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--border)",
            borderRadius: "24px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
            width: "100%",
            maxWidth: "420px",
            overflow: "hidden",
            padding: "0",
          }}
        >
          <div key={phase} className="invite-enter">

            {/* ── LOADING ── */}
            {(phase === "loading") && (
              <div
                style={{
                  padding: "48px 32px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <Spinner size={24} />
                <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>Loading invitation…</span>
              </div>
            )}

            {/* ── CHECKING ── */}
            {phase === "checking" && (
              <div
                style={{
                  padding: "48px 32px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <Spinner size={24} />
                <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>Just a moment…</span>
              </div>
            )}

            {/* ── ACCEPTING ── */}
            {phase === "accepting" && (
              <div
                style={{
                  padding: "40px 32px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <Spinner size={28} />
                <span style={{ fontSize: 15, color: "var(--text-secondary)" }}>Joining workspace…</span>
              </div>
            )}

            {/* ── INVALID / ERROR ── */}
            {(phase === "invalid" || phase === "error") && (
              <div style={{ padding: "32px 32px 28px", textAlign: "center" }}>
                <XCircle
                  size={32}
                  color="var(--text-secondary)"
                  style={{ margin: "0 auto 16px", display: "block" }}
                />
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-heading)", marginBottom: 8 }}>
                  {state.invalidReason === "expired" ? "Invite expired" : "Invite not valid"}
                </h2>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {state.invalidReason === "expired"
                    ? "This invitation has expired. Ask your workspace admin to send a new one."
                    : "This invitation link is no longer valid."}
                </p>
              </div>
            )}

            {/* ── LANDING ── */}
            {phase === "landing" && preview && (
              /* FIX 4 — landing content padding */
              <div
                style={{
                  padding: "36px 32px 32px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                {/* FIX 1 — workspace avatar: solid blue circle */}
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: "var(--brand)",
                    color: "#FFFFFF",
                    fontSize: "26px",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    flexShrink: 0,
                  }}
                >
                  {preview.workspaceName?.[0]?.toUpperCase() ?? "W"}
                </div>

                {/* FIX 5 — heading typography */}
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--text-secondary)",
                    marginBottom: "4px",
                    fontWeight: "400",
                  }}
                >
                  You&apos;ve been invited to join
                </p>

                {/* FIX 5 — workspace name typography */}
                <h1
                  style={{
                    fontSize: "22px",
                    fontWeight: "700",
                    color: "var(--text-heading)",
                    letterSpacing: "-0.3px",
                    marginBottom: "20px",
                    lineHeight: "1.2",
                  }}
                >
                  {preview.workspaceName}
                </h1>

                {/* Full-bleed divider */}
                <div
                  style={{
                    height: 1,
                    background: "var(--surface-hover)",
                    margin: "0 -32px 20px",
                    alignSelf: "stretch",
                  }}
                />

                {/* FIX 5 — role row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    marginBottom: "24px",
                    fontSize: "14px",
                    color: "var(--text-secondary)",
                  }}
                >
                  <span>You&apos;ll join as</span>
                  {/* FIX 5 — member badge */}
                  <span
                    style={{
                      background: "var(--surface-input)",
                      border: "1px solid var(--border)",
                      borderRadius: "9999px",
                      padding: "3px 10px",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "var(--text-body)",
                    }}
                  >
                    {preview.role === "OWNER" ? "Owner" : "Member"}
                  </span>
                </div>

                {/* Expiry warning */}
                {(() => {
                  const days = daysUntilExpiry(preview.expiresAt);
                  if (days < 7) {
                    return (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          background: "var(--color-warning-bg)",
                          border: "1px solid var(--color-warning-border)",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          marginBottom: 16,
                          alignSelf: "stretch",
                        }}
                      >
                        <Clock size={14} color="var(--color-warning-text)" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: "var(--color-warning-text)" }}>
                          Expires in{" "}
                          {days <= 0
                            ? "less than a day"
                            : `${days} day${days === 1 ? "" : "s"}`}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}

                {formError && <FormError message={formError} />}

                {/* FIX 2 — Accept Invite button with hardcoded styles */}
                <div style={{ marginTop: formError ? 12 : 0, width: "100%" }}>
                  <button
                    onClick={handleAcceptClick}
                    style={{
                      width: "100%",
                      height: "52px",
                      background: "var(--brand)",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: "14px",
                      fontSize: "16px",
                      fontWeight: "600",
                      letterSpacing: "-0.2px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      boxShadow: "0 2px 8px rgba(23,117,224,0.25)",
                      transition: "all 160ms ease",
                      outline: "none",
                      fontFamily: "inherit",
                    }}
                  >
                    Accept Invite
                  </button>
                </div>
              </div>
            )}

            {/* ── LOGIN ── */}
            {phase === "login" && preview && (
              <div style={{ padding: "28px 28px 24px" }}>
                <BackButton
                  onClick={() =>
                    setState((s) => ({ ...s, phase: "landing", formError: null }))
                  }
                />

                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "var(--text-heading)",
                    letterSpacing: "-0.3px",
                    marginBottom: 4,
                  }}
                >
                  Login to Accept
                </h2>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 12 }}>
                  Signing in as
                </p>
                <EmailChip email={preview.email} />

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleLogin();
                  }}
                >
                  <PasswordInput
                    label="Password"
                    value={loginPassword}
                    onChange={setLoginPassword}
                    show={showLoginPw}
                    onToggle={() => setShowLoginPw((p) => !p)}
                    autoFocus
                    placeholder="Enter your password"
                    fieldKey="loginPassword"
                  />

                  <button
                    type="button"
                    onClick={() => void handleForgotPassword()}
                    style={{
                      fontSize: 13,
                      color: "var(--brand-hover)",
                      textAlign: "right",
                      display: "block",
                      marginLeft: "auto",
                      marginTop: 6,
                      marginBottom: formError ? 0 : 16,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      fontFamily: "inherit",
                    }}
                  >
                    Forgot password?
                  </button>

                  {formError && <FormError message={formError} />}

                  <div style={{ marginTop: 16 }}>
                    <PrimaryButton
                      type="submit"
                      loading={loginLoading}
                      loadingText="Signing in…"
                    >
                      Login to Accept
                    </PrimaryButton>
                  </div>
                </form>
              </div>
            )}

            {/* ── SIGNUP ── */}
            {phase === "signup" && preview && (
              <div style={{ padding: "28px 28px 24px" }}>
                <BackButton
                  onClick={() =>
                    setState((s) => ({ ...s, phase: "landing", formError: null }))
                  }
                />

                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "var(--text-heading)",
                    letterSpacing: "-0.3px",
                    marginBottom: 20,
                  }}
                >
                  Sign up to Accept
                </h2>
                <EmailChip email={preview.email} />

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleSignup();
                  }}
                >
                  <div style={{ marginBottom: 4 }}>
                    <PasswordInput
                      label="Password"
                      value={signupPassword}
                      onChange={setSignupPassword}
                      show={showSignupPw}
                      onToggle={() => setShowSignupPw((p) => !p)}
                      autoFocus
                      placeholder="Minimum 8 characters"
                      minLength={8}
                      fieldKey="password"
                    />
                  </div>

                  {formError && <FormError message={formError} />}

                  <div style={{ marginTop: 16 }}>
                    <PrimaryButton
                      type="submit"
                      loading={signupLoading}
                      loadingText="Creating account…"
                    >
                      Sign up to Accept
                    </PrimaryButton>
                  </div>
                </form>
              </div>
            )}

            {/* ── FORGOT ── */}
            {phase === "forgot" && preview && (
              <div style={{ padding: "32px 32px 28px", textAlign: "center" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "var(--color-success-bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <MailCheck size={24} color="var(--color-success-solid)" />
                </div>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "var(--text-heading)",
                    marginBottom: 8,
                  }}
                >
                  Check your email
                </h2>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  We sent a password reset link to
                </p>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--text-body)",
                    marginTop: 4,
                  }}
                >
                  {preview.email}
                </p>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--text-secondary)",
                    marginTop: 8,
                    lineHeight: 1.5,
                  }}
                >
                  Come back to this link after resetting your password.
                </p>
                <button
                  type="button"
                  onClick={() => setState((s) => ({ ...s, phase: "login", formError: null }))}
                  style={{
                    marginTop: 20,
                    width: "100%",
                    height: 44,
                    background: "var(--surface-input)",
                    border: "1px solid var(--border)",
                    borderRadius: 14,
                    fontSize: 15,
                    fontWeight: 600,
                    color: "var(--text-body)",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Back to login
                </button>
              </div>
            )}

            {/* ── SUCCESS ── */}
            {phase === "success" && preview && (
              <div style={{ padding: "36px 32px", textAlign: "center" }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "var(--color-success-bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                  }}
                >
                  <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
                    <path
                      d="M16 32 L28 44 L48 24"
                      stroke="var(--color-success-solid)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        strokeDasharray: 60,
                        animation: "drawCheck 400ms ease 100ms both",
                      }}
                    />
                  </svg>
                </div>
                <h2
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "var(--text-heading)",
                    letterSpacing: "-0.4px",
                    marginBottom: 6,
                  }}
                >
                  You&apos;re in!
                </h2>
                <p style={{ fontSize: 15, color: "var(--text-secondary)" }}>
                  Taking you to {preview.workspaceName}…
                </p>
                {/* Countdown dots: n fills when n + countdown <= 4 */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    marginTop: 20,
                  }}
                >
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: n + countdown <= 4 ? "var(--brand)" : "var(--surface-hover)",
                        transition: "background 300ms ease",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── MISMATCH ── */}
            {phase === "mismatch" && preview && authedUser && (
              <div style={{ padding: "28px 32px" }}>
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <AlertCircle
                    size={32}
                    color="var(--color-warning-text)"
                    style={{ margin: "0 auto 16px", display: "block" }}
                  />
                  <h2
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "var(--text-heading)",
                      marginBottom: 8,
                    }}
                  >
                    Wrong account
                  </h2>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                    This invite was sent to
                  </p>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--text-heading)",
                      display: "block",
                    }}
                  >
                    {preview.email}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      marginTop: 4,
                      display: "block",
                    }}
                  >
                    You&apos;re signed in as {authedUser.email}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await signOut(auth).catch(() => {});
                    setState((s) => ({
                      ...s,
                      phase: "landing",
                      authedUser: null,
                      formError: null,
                    }));
                  }}
                  style={{
                    width: "100%",
                    height: 44,
                    background: "var(--surface-input)",
                    border: "1px solid var(--border)",
                    borderRadius: 14,
                    fontSize: 15,
                    fontWeight: 600,
                    color: "var(--text-body)",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <LogOut size={15} color="var(--text-secondary)" />
                  Sign out and try again
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
      <Toast message={toast.message} visible={toast.visible} onDismiss={dismissToast} />
    </>
  );
}
