"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  authFetch,
  getFirebaseBearerToken,
  clearAuthTokenCache,
} from "@/lib/authFetch";
import { useToast } from "@/components/dashboard/context/ToastContext";
import { ObIcon } from "./icons";
import { StepShell, StepFooter } from "./StepShell";

type Props = {
  firstName: string;
  workspaceName: string;
  workspaceSlug?: string;
  workspaceLogoFile?: File | null;
  pendingInvites?: string[];
  onBack: () => void;
};

export function ReadyStep({
  firstName,
  workspaceName,
  workspaceSlug,
  workspaceLogoFile,
  pendingInvites,
  onBack,
}: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const complete = async (destination: string = "/dashboard") => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const completionPayload: Record<string, string> = {};
      if (workspaceName) completionPayload.workspaceName = workspaceName;
      if (workspaceSlug) completionPayload.workspaceSlug = workspaceSlug;
      const res = await authFetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(completionPayload),
      });
      if (!res || !res.ok) {
        const text = res ? await res.text() : "Not authenticated";
        throw new Error(text);
      }

      // Force-refresh the Firebase ID token so the new workspaceId claim
      // is available for dashboard API calls immediately after redirect.
      try {
        const { getAuth } = await import("firebase/auth");
        const auth = getAuth();
        if (auth.currentUser) {
          await auth.currentUser.getIdToken(true);
          // Phase 28.X — rebuild the authFetch token cache from the
          // freshly-refreshed token so the deferred logo upload and the
          // first dashboard requests carry the new workspaceId claim.
          clearAuthTokenCache();
        }
      } catch {}

      // Onboarding succeeded → workspace now exists. Upload the deferred
      // logo file (best-effort: a failure here does not block the user).
      if (workspaceLogoFile) {
        try {
          const token = await getFirebaseBearerToken();
          if (token) {
            const fd = new FormData();
            fd.append("logo", workspaceLogoFile);
            await fetch("/api/workspace/logo", {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: fd,
            });
          }
        } catch (logoErr) {
          console.warn("[onboarding] logo upload failed:", logoErr);
        }
      }

      // Dispatch invites queued on the invite step. The workspace now exists
      // and the token carries the new workspaceId claim, so invite-batch can
      // resolve the workspace. Best-effort: a failure here does NOT roll back
      // the workspace or block completion — the user can re-invite from
      // Settings → Workspace.
      if (pendingInvites && pendingInvites.length > 0) {
        try {
          const inviteRes = await authFetch("/api/workspace/members/invite-batch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ emails: pendingInvites }),
          });
          if (!inviteRes || !inviteRes.ok) {
            const detail = inviteRes ? await inviteRes.text() : "no response";
            console.error("[onboarding] failed to send queued invites:", detail);
            showToast("Workspace ready — some invites didn't send. Retry from Settings.");
          }
        } catch (inviteErr) {
          console.error("[onboarding] invite batch threw:", inviteErr);
          showToast("Workspace ready — some invites didn't send. Retry from Settings.");
        }
      }

      window.location.href = destination;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to finish";
      showToast(msg);
      setSubmitting(false);
    }
  };

  return (
    <StepShell
      step={5}
      stage={
        <>
          <div className="ob-loop-wrap">
            <div className="ob-loop-step">
              <span className="ob-lp-ico"><ObIcon.Globe size={18} /></span>
              <div>
                <div className="ob-lp-t">Visit any web page</div>
                <div className="ob-lp-s">Your staging build, a live site, a competitor — anywhere.</div>
              </div>
              <span className="ob-lp-num">01</span>
            </div>
            <div className="ob-loop-arrow"></div>
            <div className="ob-loop-step">
              <span className="ob-lp-ico"><ObIcon.Frame size={18} /></span>
              <div>
                <div className="ob-lp-t">Open Annote &amp; capture</div>
                <div className="ob-lp-s">Drag a region, full page, or record a 30-second clip.</div>
              </div>
              <span className="ob-lp-num">02</span>
            </div>
            <div className="ob-loop-arrow"></div>
            <div className="ob-loop-step">
              <span className="ob-lp-ico"><ObIcon.Pen size={18} /></span>
              <div>
                <div className="ob-lp-t">Annotate &amp; describe</div>
                <div className="ob-lp-s">Tag a teammate, set priority, attach to a session.</div>
              </div>
              <span className="ob-lp-num">03</span>
            </div>
            <div className="ob-loop-arrow"></div>
            <div className="ob-loop-step">
              <span className="ob-lp-ico"><ObIcon.Send size={18} /></span>
              <div>
                <div className="ob-lp-t">Share with the team</div>
                <div className="ob-lp-s">Slack, Linear, or just a link — comments sync both ways.</div>
              </div>
              <span className="ob-lp-num">04</span>
            </div>
          </div>
          <div className="ob-preview-meta" style={{ marginTop: 18 }}>
            The whole loop usually takes under a minute.
          </div>
        </>
      }
    >
      <span className="ob-eyebrow"><span className="dot"></span>You&apos;re all set</span>
      <h1 className="ob-h">
        Ready{firstName ? `, ${firstName}` : ""}? <span className="accent">Here&apos;s the loop.</span>
      </h1>
      <p className="ob-sub">
        Annote turns any web page into a feedback canvas. Run a session, capture what&apos;s broken, share with your team — that&apos;s it.
      </p>

      <div className="ob-feat-list">
        <div className="ob-feat-item">
          <span className="ob-feat-icn"><ObIcon.Bolt size={14} /></span>
          <div>
            <div className="ob-feat-t">One session per page or per release</div>
            <div className="ob-feat-s">Group all the tickets, comments, and screenshots from a single review in one place.</div>
          </div>
        </div>
        <div className="ob-feat-item">
          <span className="ob-feat-icn"><ObIcon.Pen size={14} /></span>
          <div>
            <div className="ob-feat-t">Annotate without leaving the page</div>
            <div className="ob-feat-s">Drag to capture, type to describe. Auto-tagged with browser, viewport, and console logs.</div>
          </div>
        </div>
        <div className="ob-feat-item">
          <span className="ob-feat-icn"><ObIcon.Send size={14} /></span>
          <div>
            <div className="ob-feat-t">Share back through Slack, Linear, or a link</div>
            <div className="ob-feat-s">Tickets sync both ways — comments stay attached to the visual context.</div>
          </div>
        </div>
      </div>

      <StepFooter
        onBack={onBack}
        secondary={
          <button
            type="button"
            className="ob-btn ob-btn-ghost"
            style={{ padding: "0 12px" }}
            onClick={() => complete("/docs")}
            disabled={submitting}
          >
            Take a tour first
          </button>
        }
        primary={
          <button
            type="button"
            className="ob-btn ob-btn-primary"
            onClick={() => complete("/dashboard")}
            disabled={submitting}
          >
            <ObIcon.Sparkle size={13} />
            {submitting ? "Finishing…" : "Go to Dashboard"}
          </button>
        }
      />
    </StepShell>
  );
}
