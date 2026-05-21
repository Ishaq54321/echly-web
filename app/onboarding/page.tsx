"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/lib/client/workspaceContext";
import { authFetch } from "@/lib/authFetch";
import { ProfileStep } from "@/components/onboarding/ProfileStep";
import { WorkspaceStep } from "@/components/onboarding/WorkspaceStep";
import { InviteStep } from "@/components/onboarding/InviteStep";
import { ExtensionStep } from "@/components/onboarding/ExtensionStep";
import { ReadyStep } from "@/components/onboarding/ReadyStep";

type StepId = "profile" | "workspace" | "invite" | "extension" | "ready";

/** Fire-and-forget writeback of progress; never blocks UI. */
function persistProgress(stepNumber: number) {
  void authFetch("/api/users", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ onboardingStep: stepNumber }),
  }).catch(() => {});
}

export default function OnboardingPage() {
  const router = useRouter();
  const {
    authUid,
    authReady,
    authEmail,
    isIdentityReady,
    isLoadingWorkspaces,
    allWorkspaces,
    firstName: ctxFirstName,
    lastName: ctxLastName,
    avatarUrl,
    workspaceName: ctxWorkspaceName,
    workspaceLogoUrl: ctxWorkspaceLogoUrl,
  } = useWorkspace();

  // Live profile/workspace state — updated as the user progresses through
  // steps so later steps and the right-side preview render fresh values
  // without waiting for Firestore round-trips.
  const [firstName, setFirstName] = useState(ctxFirstName);
  const [lastName, setLastName] = useState(ctxLastName);
  const [workspaceName, setWorkspaceName] = useState(ctxWorkspaceName ?? "");
  const [workspaceSlug, setWorkspaceSlug] = useState<string>("");
  // Logo upload is deferred — the workspace doesn't exist until POST /api/onboarding
  // succeeds at the final step. We hold the File locally and upload it after.
  const [workspaceLogoFile, setWorkspaceLogoFile] = useState<File | null>(null);
  const [workspaceLogoPreviewUrl, setWorkspaceLogoPreviewUrl] = useState<string | null>(
    ctxWorkspaceLogoUrl ?? null
  );
  // Invites are deferred like the logo: the workspace doesn't exist until
  // POST /api/onboarding succeeds, so we collect emails here and dispatch
  // them from ReadyStep after the workspace is created.
  const [pendingInvites, setPendingInvites] = useState<string[]>([]);

  useEffect(() => { if (ctxFirstName) setFirstName(ctxFirstName); }, [ctxFirstName]);
  useEffect(() => { if (ctxLastName) setLastName(ctxLastName); }, [ctxLastName]);
  useEffect(() => { if (ctxWorkspaceName) setWorkspaceName(ctxWorkspaceName); }, [ctxWorkspaceName]);

  // Bounce signed-out users to login.
  useEffect(() => {
    if (authReady && !authUid) {
      router.replace("/login");
    }
  }, [authReady, authUid, router]);

  const ready = isIdentityReady && !isLoadingWorkspaces;

  // Invited users have at least one membership where isOwner === false.
  // They get a slimmed flow that skips workspace creation and inviting.
  const isInviteUser = useMemo(
    () => ready && allWorkspaces.some((w) => !w.isOwner),
    [ready, allWorkspaces]
  );

  const steps: StepId[] = useMemo(
    () => (isInviteUser ? ["profile", "extension", "ready"] : ["profile", "workspace", "invite", "extension", "ready"]),
    [isInviteUser]
  );

  const [stepIndex, setStepIndex] = useState(0);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const currentStep = steps[stepIndex] ?? "profile";

  // On mount (after identity is ready), fetch the user's stored onboardingStep
  // and jump to that screen so closing the browser mid-flow resumes from where
  // the user left off. We only run this once — subsequent advances are local.
  useEffect(() => {
    if (!isIdentityReady || progressLoaded) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await authFetch("/api/users", { method: "GET" });
        if (cancelled) return;
        if (!res || !res.ok) {
          setProgressLoaded(true);
          return;
        }
        const body = (await res.json()) as {
          success?: boolean;
          data?: { onboardingStep?: number | null };
        };
        if (cancelled) return;
        const saved =
          typeof body?.data?.onboardingStep === "number"
            ? body.data.onboardingStep
            : 0;
        if (saved >= 2) {
          // Saved step is 1-indexed; clamp to the available steps for this user.
          let clamped = Math.min(saved - 1, steps.length - 1);
          // Invariant: the user cannot be past WorkspaceStep without a
          // workspaceName, because ReadyStep's completion POST omits the
          // field when empty and the API correctly rejects. If a prior
          // session persisted onboardingStep past "workspace" but the
          // workspace doc no longer hydrates a name (abandoned flow,
          // expired cookie, etc.), force them back to WorkspaceStep.
          const workspaceStepIndex = steps.indexOf("workspace");
          if (
            workspaceStepIndex >= 0 &&
            !workspaceName.trim() &&
            clamped > workspaceStepIndex
          ) {
            clamped = workspaceStepIndex;
          }
          setStepIndex(Math.max(clamped, 0));
        }
      } catch {
        /* non-fatal */
      } finally {
        if (!cancelled) setProgressLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, [isIdentityReady, progressLoaded, steps.length]);

  // Clamp stepIndex if `steps` shrinks (e.g., late-arriving membership data
  // reveals invited-user status after we've already advanced).
  useEffect(() => {
    if (stepIndex >= steps.length) {
      setStepIndex(steps.length - 1);
    }
  }, [stepIndex, steps.length]);

  const advance = () => {
    setStepIndex((i) => {
      const next = Math.min(i + 1, steps.length - 1);
      // 1-indexed step number for persistence.
      persistProgress(next + 1);
      return next;
    });
  };
  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));

  if (!ready || !authUid) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <div className="ob-spinner" />
      </div>
    );
  }

  switch (currentStep) {
    case "profile":
      return (
        <ProfileStep
          initialFirstName={firstName}
          initialLastName={lastName}
          initialAvatarUrl={avatarUrl}
          onContinue={({ firstName: fn, lastName: ln }) => {
            setFirstName(fn);
            setLastName(ln);
            advance();
          }}
        />
      );
    case "workspace":
      return (
        <WorkspaceStep
          initialName={workspaceName}
          initialLogoUrl={workspaceLogoPreviewUrl}
          initialLogoFile={workspaceLogoFile}
          onContinue={({ workspaceName: ws, workspaceSlug: wsSlug, logoFile, logoPreviewUrl }) => {
            setWorkspaceName(ws);
            setWorkspaceSlug(wsSlug);
            setWorkspaceLogoFile(logoFile);
            setWorkspaceLogoPreviewUrl(logoPreviewUrl);
            advance();
          }}
          onBack={goBack}
        />
      );
    case "invite":
      return (
        <InviteStep
          ownerName={[firstName, lastName].filter(Boolean).join(" ")}
          ownerEmail={authEmail ?? ""}
          workspaceName={workspaceName}
          pendingInvites={pendingInvites}
          onPendingInvitesChange={setPendingInvites}
          onContinue={advance}
          onBack={goBack}
        />
      );
    case "extension":
      return <ExtensionStep onContinue={advance} onBack={goBack} />;
    case "ready":
      return (
        <ReadyStep
          firstName={firstName}
          workspaceName={workspaceName}
          workspaceSlug={workspaceSlug}
          workspaceLogoFile={workspaceLogoFile}
          pendingInvites={pendingInvites}
          onBack={goBack}
        />
      );
    default:
      return null;
  }
}
