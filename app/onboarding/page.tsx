"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/firebase";
import { authFetch } from "@/lib/authFetch";
import { WorkspaceForm, type WorkspaceFormValues } from "@/components/onboarding/WorkspaceForm";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { motion } from "framer-motion";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await auth.authStateReady();
      if (cancelled) return;
      if (!auth.currentUser) {
        router.replace("/login");
        return;
      }
      setAuthReady(true);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleSubmit = async (values: WorkspaceFormValues) => {
    const user = auth.currentUser;
    if (!user) {
      router.replace("/login");
      return;
    }
    setSubmitting(true);
    try {
      const createRes = await authFetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.workspaceName || "My Account",
          role: values.role || undefined,
          companySize: values.companySize || undefined,
        }),
      });

      if (!createRes || !createRes.ok) {
        const msg = createRes ? await createRes.text() : "Not authenticated";
        throw new Error(`Failed to create profile: ${msg}`);
      }

      router.replace("/onboarding/activate");
    } catch (e) {
      console.error("Onboarding error:", e);
      setSubmitting(false);
    }
  };

  if (loading || !authReady) {
    return (
      <div className="w-8 h-8 border-2 border-gray-200 border-t-[#466EFF] rounded-full animate-spin" />
    );
  }

  return (
    <>
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

      <div className="w-full max-w-[760px] mx-auto px-6">
        {/* Step indicator */}
        <StepIndicator currentStep={1} />

      {/* Hero header */}
      <header className="flex flex-col items-center text-center">
        <motion.h1
          className="text-[44px] font-semibold tracking-tight text-gray-900"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Welcome to Echly
        </motion.h1>
        <motion.p
          className="text-[18px] text-gray-600 mt-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.06 }}
        >
          Set up your account in seconds.
        </motion.p>
        <p className="text-sm text-gray-500 mt-1">You can change everything later.</p>
      </header>

      {/* Card wrapper — narrower premium layout */}
      <div className="relative mt-8 max-w-[560px] mx-auto">
        {/* Onboarding card — frosted glass */}
        <motion.div
          className="relative rounded-[28px] bg-white/55 backdrop-blur-xl border border-white/40 shadow-[0_18px_40px_rgba(0,0,0,0.10)] p-7 transition-all duration-150 ease-out overflow-hidden"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          {/* Inner glass highlight layer */}
          <div
            className="absolute inset-0 rounded-[28px] pointer-events-none"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.25) 40%, rgba(255,255,255,0.05) 100%)",
              opacity: 0.55,
            }}
            aria-hidden
          />
          <div className="relative">
            <WorkspaceForm onSubmit={handleSubmit} loading={submitting} />
          </div>
        </motion.div>
      </div>
      </div>
    </>
  );
}
