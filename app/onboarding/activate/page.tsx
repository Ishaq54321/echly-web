"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ActivationSteps } from "@/components/onboarding/ActivationSteps";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { motion } from "framer-motion";

export default function ActivatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  if (loading) {
    return (
      <div className="w-8 h-8 border-2 border-gray-200 border-t-[#466EFF] rounded-full animate-spin" />
    );
  }

  return (
    <div className="w-full max-w-[640px] mx-auto flex flex-col items-center">
        <StepIndicator currentStep={2} />
        <motion.h1
          className="text-4xl font-semibold tracking-tight leading-tight text-gray-900 text-center mb-3 md:whitespace-nowrap"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          You&apos;re ready to capture feedback
        </motion.h1>
        <motion.p
          className="text-lg text-gray-500 text-center mb-10"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.06 }}
        >
          Follow these steps to get started.
        </motion.p>
        <ActivationSteps />
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-[10px] text-white font-medium text-base transition-all hover:brightness-105 px-[22px]"
            style={{
              background: "linear-gradient(135deg, #466EFF, #5F7DFF)",
              boxShadow: "0 6px 20px rgba(70,110,255,0.25)",
            }}
          >
            Go to dashboard
          </Link>
        </motion.div>
    </div>
  );
}
