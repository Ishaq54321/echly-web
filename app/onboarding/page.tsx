"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { db } from "@/lib/firebase";
import { authFetch } from "@/lib/authFetch";
import { WorkspaceForm, type WorkspaceFormValues } from "@/components/onboarding/WorkspaceForm";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { motion } from "framer-motion";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [isInviteUser, setIsInviteUser] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await auth.authStateReady();
      if (cancelled) return;
      if (!auth.currentUser) {
        router.replace("/login");
        return;
      }
      // Check if user already has a workspaceId set (invite user path)
      try {
        const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
        const data = (snap.exists() ? snap.data() : {}) as Record<string, unknown>;
        const wid = typeof data.workspaceId === "string" ? data.workspaceId.trim() : "";
        const memberships = Array.isArray(data.workspaceMemberships) ? data.workspaceMemberships : [];
        if (wid && memberships.length > 0) {
          setIsInviteUser(true);
        }
      } catch {/* non-fatal — fall through to normal onboarding */}
      setAuthReady(true);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  // Minimal onboarding for invite users: just collect displayName
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = displayName.trim();
    if (!name) {
      setDisplayNameError("Please enter your name.");
      return;
    }
    setDisplayNameError(null);
    setSubmitting(true);
    try {
      await authFetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: name }),
      });
      router.replace("/dashboard");
    } catch (e) {
      console.error("Invite onboarding error:", e);
      setSubmitting(false);
    }
  };

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
      <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[#466EFF] rounded-full animate-spin" />
    );
  }

  // Minimal onboarding for invite users
  if (isInviteUser) {
    return (
      <>
        <header className="absolute top-6 left-6 z-20">
          <Link href="/">
            <Image src="/Echly_logo.svg" alt="Echly" width={130} height={40} sizes="130px" className="h-12 w-auto" />
          </Link>
        </header>
        <div className="w-full max-w-[480px] mx-auto px-6 flex flex-col items-center justify-center min-h-screen">
          <motion.div
            className="w-full rounded-[var(--radius-xl)] bg-white/55 backdrop-blur-xl border border-white/40 shadow-[var(--shadow-xl)] p-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <h1 className="text-2xl font-semibold text-[var(--text-heading)] tracking-tight mb-1">Welcome to Echly</h1>
            <p className="text-[var(--text-secondary)] text-sm mb-6">Just one thing before you get started.</p>
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label htmlFor="display-name" className="block text-sm font-medium text-[var(--text-body)] mb-1">Your name</label>
                <input
                  id="display-name"
                  type="text"
                  placeholder="e.g. Alex Kim"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full h-11 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white text-[var(--text-heading)] text-base pl-3 placeholder:text-gray-400 focus:outline-none focus:border-[#466EFF] focus:ring-[3px] focus:ring-[rgba(70,110,255,0.15)]"
                  required
                />
                {displayNameError && <p className="mt-1 text-sm text-[var(--color-danger)]">{displayNameError}</p>}
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-[var(--radius-sm)] text-white font-medium text-lg disabled:opacity-50 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #466EFF, #5F7DFF)" }}
              >
                {submitting ? "Saving…" : "Get started"}
              </button>
            </form>
          </motion.div>
        </div>
      </>
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
            sizes="130px"
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
          className="text-[44px] font-semibold tracking-tight text-[var(--text-heading)]"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Welcome to Echly
        </motion.h1>
        <motion.p
          className="text-[18px] text-[var(--text-secondary)] mt-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.06 }}
        >
          Set up your account in seconds.
        </motion.p>
        <p className="text-sm text-[var(--text-secondary)] mt-1">You can change everything later.</p>
      </header>

      {/* Card wrapper — narrower premium layout */}
      <div className="relative mt-8 max-w-[560px] mx-auto">
        {/* Onboarding card — frosted glass */}
        <motion.div
          className="relative rounded-[var(--radius-xl)] bg-white/55 backdrop-blur-xl border border-white/40 shadow-[var(--shadow-xl)] p-7 transition-all duration-150 ease-out overflow-hidden"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          {/* Inner glass highlight layer */}
          <div
            className="absolute inset-0 rounded-[var(--radius-xl)] pointer-events-none"
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
