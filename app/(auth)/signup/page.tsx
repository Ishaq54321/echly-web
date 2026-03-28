"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  signInWithGoogle,
  signUpWithEmailPassword,
} from "@/lib/auth/authActions";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";

const inputClass =
  "w-full h-11 rounded-[10px] border border-[#E5E7EB] bg-white text-gray-900 text-base pl-3 placeholder:text-gray-400 focus:outline-none focus:border-[#466EFF] focus:ring-[3px] focus:ring-[rgba(70,110,255,0.15)]";

const primaryButtonClass =
  "w-full h-12 rounded-[10px] text-white font-medium text-lg transition-all disabled:opacity-60 hover:brightness-105 flex items-center justify-center";
const primaryButtonStyle = {
  background: "linear-gradient(135deg, #466EFF, #5F7DFF)",
};

async function createSessionCookie(user: { getIdToken: () => Promise<string> }) {
  try {
    const idToken = await user.getIdToken();
    const res = await fetch("/api/auth/session", {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Session API failed");
  } catch (e) {
    console.error("Session creation failed", e);
  }
}

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      await createSessionCookie(user);
      router.replace("/app");
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string };
      if (
        err?.code === "auth/popup-closed-by-user" ||
        err?.code === "auth/cancelled-popup-request"
      ) {
        return;
      }
      setError(err?.message ?? (e instanceof Error ? e.message : "Sign up failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await signUpWithEmailPassword(email, password);
      await createSessionCookie(user);
      router.replace("/app");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center w-full max-w-[420px]">
        <Link href="/" className="mb-8" aria-label="Echly home">
          <Image src="/Echly_logo.svg" alt="Echly" width={120} height={32} className="h-8 w-auto" />
        </Link>
        <h1 className="text-5xl font-semibold tracking-tight text-gray-900 text-center mb-3">
        Capture Feedback Exactly Where it Happens
        </h1>
        <p className="text-lg text-gray-500 text-center mb-10 max-w-md">
          Turn screenshots into actionable tickets for your team in seconds.
        </p>
        <AuthCard>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Create your Echly account</h2>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full h-12 rounded-[10px] border border-[#E5E7EB] bg-white text-gray-900 font-medium text-base hover:bg-gray-50 transition-colors disabled:opacity-60 flex items-center justify-center gap-3"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E7EB]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500">OR</span>
            </div>
          </div>

          <form onSubmit={handleEmail} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              required
              minLength={6}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className={primaryButtonClass}
              style={primaryButtonStyle}
            >
              Create account
            </button>
          </form>

          <p className="mt-6 text-center text-gray-500 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-[#466EFF] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </AuthCard>
      </div>
    </AuthLayout>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
