"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { signInWithGoogle, signInWithEmailPassword } from "../../../lib/auth/authActions";
import { checkUserWorkspace } from "@/lib/auth/checkUserWorkspace";
import { AuthCard } from "@/components/auth/AuthCard";

const inputClass =
  "w-full h-11 rounded-[10px] border border-[#E5E7EB] bg-white text-gray-900 text-base pl-3 placeholder:text-gray-400 focus:outline-none focus:border-[#466EFF] focus:ring-[3px] focus:ring-[rgba(70,110,255,0.15)]";

const primaryButtonClass =
  "w-full h-11 rounded-[10px] text-white font-medium text-base transition-all disabled:opacity-60 hover:brightness-105 flex items-center justify-center";

const primaryButtonStyle = {
  background: "linear-gradient(135deg,#466EFF,#5F7DFF)",
  boxShadow: "0 10px 28px rgba(70,110,255,0.28)"
};

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isExtension = searchParams.get("extension") === "true";
  const returnUrl = searchParams.get("returnUrl") ?? null;

  const [authChecked, setAuthChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect authenticated users. When extension=true, send tokens via postMessage (content script bridges to extension) then redirect.
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (isExtension) {
          try {
            const idToken = await user.getIdToken();
            const refreshToken = (user as { refreshToken?: string }).refreshToken ?? "";
            window.postMessage(
              { type: "ECHLY_PAGE_LOGIN_SUCCESS", idToken, refreshToken },
              window.location.origin
            );
          } catch {
            /* ignore */
          }
          window.location.href = "/dashboard";
          return;
        }
        const params = new URLSearchParams();
        if (isExtension) params.set("extension", "true");
        if (returnUrl) params.set("returnUrl", returnUrl);
        const qs = params.toString();
        const dashboardUrl = qs ? `/dashboard?${qs}` : "/dashboard";
        window.location.href = dashboardUrl;
        return;
      }
      setAuthChecked(true);
    });
    return () => unsub();
  }, [isExtension, returnUrl]);

  const safeRedirectToReturnUrl = (url: string) => {
    try {
      const decoded = decodeURIComponent(url);
      const u = new URL(decoded);
      if (u.protocol === "http:" || u.protocol === "https:") {
        window.location.href = decoded;
        return true;
      }
    } catch {
      /* ignore invalid URL */
    }
    return false;
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);

    try{
      const user = await signInWithGoogle();
      if (isExtension) {
        const idToken = await user.getIdToken();
        const refreshToken = (user as { refreshToken?: string }).refreshToken ?? "";
        window.postMessage(
          { type: "ECHLY_PAGE_LOGIN_SUCCESS", idToken, refreshToken },
          window.location.origin
        );
        window.location.href = "/dashboard";
        return;
      }
      const idToken = await user.getIdToken();
      await fetch("/api/auth/sessionLogin", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
        credentials: "include",
      });
      const dest = await checkUserWorkspace(user.uid);
      router.replace(dest === "dashboard" ? "/dashboard" : "/onboarding");
    }
    catch (e: unknown) {
      const err = e as { code?: string; message?: string };
      if (
        err?.code === "auth/popup-closed-by-user" ||
        err?.code === "auth/cancelled-popup-request"
      ) {
        return;
      }
      setError(err?.message ?? (e instanceof Error ? e.message : "Sign in failed"));
    }
    finally{
      setLoading(false);
    }
  };

  const handleEmail = async (e:React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try{
      const user = await signInWithEmailPassword(email,password);
      if (isExtension) {
        const idToken = await user.getIdToken();
        const refreshToken = (user as { refreshToken?: string }).refreshToken ?? "";
        window.postMessage(
          { type: "ECHLY_PAGE_LOGIN_SUCCESS", idToken, refreshToken },
          window.location.origin
        );
        window.location.href = "/dashboard";
        return;
      }
      const idToken = await user.getIdToken();
      await fetch("/api/auth/sessionLogin", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
        credentials: "include",
      });
      const dest = await checkUserWorkspace(user.uid);
      router.replace(dest === "dashboard" ? "/dashboard" : "/onboarding");
    }
    catch(e){
      setError(e instanceof Error ? e.message : "Sign in failed");
    }
    finally{
      setLoading(false);
    }
  };

  // Do not show login UI until we've confirmed user is not authenticated
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#f9fafc] flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading…</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#f9fafc] overflow-hidden">

      {/* ===== Premium SaaS Gradient Background ===== */}
     {/* ===== Premium SaaS Gradient Background ===== */}
<div className="absolute inset-0 -z-10 overflow-hidden">

{/* Top-right brand glow */}
<div
  className="absolute"
  style={{
    top: "-15%",
    right: "-5%",
    width: "900px",
    height: "900px",
    background:
      "radial-gradient(circle, rgba(70,110,255,0.45) 0%, rgba(70,110,255,0.22) 35%, rgba(70,110,255,0.08) 55%, transparent 70%)",
    filter: "blur(35px)"
  }}
/>

{/* Bottom-left supporting glow */}
<div
  className="absolute"
  style={{
    bottom: "-20%",
    left: "-10%",
    width: "850px",
    height: "850px",
    background:
      "radial-gradient(circle, rgba(70,110,255,0.32) 0%, rgba(70,110,255,0.15) 40%, transparent 70%)",
    filter: "blur(30px)"
  }}
/>

{/* Center subtle glow behind hero */}
<div
  className="absolute"
  style={{
    top: "45%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "700px",
    height: "700px",
    background:
      "radial-gradient(circle, rgba(70,110,255,0.18) 0%, transparent 65%)",
    filter: "blur(20px)"
  }}
/>

{/* Grain texture for SaaS polish */}
<div
  className="absolute inset-0 opacity-[0.04]"
  style={{
    backgroundImage:
      "url('https://grainy-gradients.vercel.app/noise.svg')"
  }}
/>

</div>

      {/* ===== Header ===== */}
      <header className="absolute top-6 left-6 z-20">
        <Link href="/">
          <Image
            src="/Echly_logo.svg"
            alt="Echly"
            width={130}
            height={40}
            className="h-12 w-auto"
          />
        </Link>
      </header>

      {/* ===== Hero Section ===== */}
      <main className="flex flex-col items-center text-center pt-[16vh] px-6">

        <div className="max-w-[980px] w-full">

          <h1 className="text-[44px] font-semibold tracking-tight text-gray-900 whitespace-nowrap">
            Capture Feedback Exactly Where It Happens
          </h1>

          <p className="text-lg text-gray-700 mt-3 font-medium">
            Turn screenshots into actionable tickets for your team in seconds.
          </p>

          {/* ===== Auth Card ===== */}
          <div className="max-w-[420px] mx-auto mt-10">

            <AuthCard>

              <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">
                Sign in to Echly
              </h2>

              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="w-full h-11 rounded-[10px] border border-[#E5E7EB] bg-[#F8F9FA] text-gray-900 font-medium text-base hover:bg-[#F1F3F5] transition-colors disabled:opacity-60 flex items-center justify-center gap-3"
              >
                <GoogleIcon/>
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
                  onChange={(e)=>setEmail(e.target.value)}
                  className={inputClass}
                  required
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  className={inputClass}
                  required
                />

                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={primaryButtonClass}
                  style={primaryButtonStyle}
                >
                  Sign in
                </button>

              </form>

              <p className="mt-6 text-center text-gray-500 text-sm">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="text-[#466EFF] hover:underline font-medium"
                >
                  Sign up
                </Link>
              </p>

            </AuthCard>

            <p className="text-gray-500 text-sm mt-6">
              Trusted by teams who ship faster. Capture feedback in context and keep everyone aligned.
            </p>

          </div>

        </div>

      </main>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f9fafc] flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading…</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

function GoogleIcon(){
  return(
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}