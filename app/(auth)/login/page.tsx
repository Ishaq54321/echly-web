"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signInWithGoogle, signInWithEmailPassword } from "../../../lib/auth/authActions";
import { checkUserWorkspace } from "@/lib/auth/checkUserWorkspace";
import { AuthCard } from "@/components/auth/AuthCard";

const inputClass =
  "w-full h-11 rounded-full border border-[#E3E6E5] bg-white text-[#111111] text-body pl-4 pr-4 placeholder:text-[#111111] focus:outline-none focus:border-[#D1D5DB] focus:shadow-[0_0_0_3px_rgba(209,213,219,0.4)]";

const primaryButtonClass =
  "primary-cta w-full h-11 rounded-full text-body transition-colors disabled:opacity-60 flex items-center justify-center";

export default function LoginPage() {
  const router = useRouter();

  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState<string|null>(null);

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);

    try{
      const user = await signInWithGoogle();
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

  const handleEmail = async (e:React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try{
      const user = await signInWithEmailPassword(email,password);
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

  return (
    <div className="relative min-h-screen bg-[#FFFFFF] overflow-hidden">

      {/* Soft green ambient background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute"
          style={{
            top: "-15%",
            right: "-5%",
            width: "900px",
            height: "900px",
            background:
              "radial-gradient(circle, rgba(159,232,112,0.15) 0%, rgba(159,232,112,0.06) 40%, transparent 70%)",
            filter: "blur(40px)"
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: "-20%",
            left: "-10%",
            width: "850px",
            height: "850px",
            background:
              "radial-gradient(circle, rgba(221,243,200,0.25) 0%, transparent 60%)",
            filter: "blur(35px)"
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

          <h1 className="text-display font-semibold tracking-tight text-[#111111] whitespace-nowrap">
            Capture Feedback Exactly Where It Happens
          </h1>

          <p className="text-body text-[#5F6368] mt-3 font-medium">
            Turn screenshots into actionable tickets for your team in seconds.
          </p>

          {/* ===== Auth Card ===== */}
          <div className="max-w-[420px] mx-auto mt-10">

            <AuthCard>

              <h2 className="text-h3 font-semibold text-[#111111] text-center mb-6">
                Sign in to Echly
              </h2>

              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="w-full h-11 rounded-full border border-[#E3E6E5] bg-[#E9ECEB] text-[#111111] font-medium text-body hover:bg-[#E9ECEB] transition-colors disabled:opacity-60 flex items-center justify-center gap-3"
              >
                <GoogleIcon/>
                Continue with Google
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E3E6E5]" />
                </div>
                <div className="relative flex justify-center text-meta">
                  <span className="px-3 bg-[#FFFFFF] text-[#5F6368]">OR</span>
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
                >
                  Sign in
                </button>

              </form>

              <p className="mt-6 text-center text-[#5F6368] text-meta">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="text-[#111111] hover:underline font-medium"
                >
                  Sign up
                </Link>
              </p>

            </AuthCard>

            <p className="text-[#5F6368] text-meta mt-6">
              Trusted by teams who ship faster. Capture feedback in context and keep everyone aligned.
            </p>

          </div>

        </div>

      </main>

    </div>
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