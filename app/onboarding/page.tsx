"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createWorkspaceRepo } from "@/lib/repositories/workspacesRepository";
import { setUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository";
import { WorkspaceForm, type WorkspaceFormValues } from "@/components/onboarding/WorkspaceForm";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { motion } from "framer-motion";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      setAuthReady(!!user);
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  const handleSubmit = async (values: WorkspaceFormValues) => {
    const user = auth.currentUser;
    if (!user) {
      router.replace("/login");
      return;
    }
    setSubmitting(true);
    try {
      const workspaceId = crypto.randomUUID();
      await createWorkspaceRepo({
        workspaceId,
        ownerId: user.uid,
        name: values.workspaceName || "My Workspace",
      });
      await setUserWorkspaceIdRepo(user, workspaceId, {
        role: values.role || undefined,
        companySize: values.companySize || undefined,
      });
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
    <div className="w-full max-w-[760px] mx-auto mt-20 px-10 py-12">
      {/* Hero Section */}
      <header className="flex flex-col items-center text-center mb-10">
        <StepIndicator currentStep={1} />
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
          Create your workspace in seconds
        </motion.p>
      </header>

      {/* Premium onboarding card */}
      <motion.div
        className="bg-white rounded-2xl border border-gray-200 shadow-[0_25px_70px_rgba(0,0,0,0.08)] px-10 py-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        <WorkspaceForm onSubmit={handleSubmit} loading={submitting} />
      </motion.div>
    </div>
  );
}
