/**
 * Extension popup: single-source CaptureWidget from @/components/CaptureWidget.
 * Auth, session fetch, and same Tailwind/globals as web.
 */
import "@/app/globals.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { signInWithGoogle, subscribeToAuthState } from "./auth";
import { apiFetch, API_BASE } from "./api";
import { uploadScreenshot, generateFeedbackId } from "@/lib/screenshot";
import CaptureWidget from "@/components/CaptureWidget";
import "./firebase";

if (typeof window !== "undefined") {
  (window as unknown as { __ECHLY_API_BASE__?: string }).__ECHLY_API_BASE__ = API_BASE;
}

type SessionOption = {
  id: string;
  title: string;
  userId: string;
  createdAt?: string;
  [key: string]: unknown;
};

function normalizePriority(s: string | undefined): "low" | "medium" | "high" | "critical" {
  const v = (s ?? "medium").toLowerCase();
  if (v === "low" || v === "medium" || v === "high" || v === "critical") return v;
  return "medium";
}

function App() {
  const [user, setUser] = React.useState<{ uid: string } | null>(null);
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [sessionMessage, setSessionMessage] = React.useState<string | null>(null);
  const [authChecked, setAuthChecked] = React.useState(false);

  React.useEffect(() => {
    const unsub = subscribeToAuthState((u) => {
      setUser(u ?? null);
      setAuthChecked(true);
    });
    return () => unsub();
  }, []);

  React.useEffect(() => {
    if (!user) {
      setSessionId(null);
      setSessionMessage(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch("/api/sessions");
        const json = (await res.json()) as {
          success?: boolean;
          sessions?: SessionOption[];
          error?: string;
        };
        if (cancelled || !json.success) {
          if (!cancelled) setSessionMessage(json.error || "Failed to load sessions");
          return;
        }
        const sessions = json.sessions ?? [];
        if (sessions.length === 0) {
          setSessionMessage("Create a session in dashboard first.");
          setSessionId(null);
          return;
        }
        const sorted = [...sessions].sort((a, b) => {
          const aT = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bT = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bT - aT;
        });
        setSessionId(sorted[0].id);
        setSessionMessage(null);
      } catch {
        if (!cancelled) setSessionMessage("Failed to load sessions");
        setSessionId(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleComplete = React.useCallback(
    async (transcript: string, screenshot: string | null): Promise<
      { id: string; title: string; description: string; type: string } | undefined
    > => {
      if (!sessionId || !user) return undefined;
      const res = await apiFetch("/api/structure-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        tickets?: Array<{
          title?: string;
          contextSummary?: string;
          suggestedTags?: string[];
          actionItems?: string[];
          impact?: string | null;
          suggestedPriority?: string;
        }>;
        error?: string;
      };
      const tickets = Array.isArray(data.tickets) ? data.tickets : [];
      if (!data.success || tickets.length === 0) return undefined;

      let screenshotUrl: string | null = null;
      if (tickets.length > 0 && screenshot) {
        const firstFeedbackId = generateFeedbackId();
        screenshotUrl = await uploadScreenshot(screenshot, sessionId, firstFeedbackId);
      }

      let firstCreated: { id: string; title: string; description: string; type: string } | undefined;
      for (let i = 0; i < tickets.length; i++) {
        const t = tickets[i];
        const body = {
          sessionId,
          title: t.title ?? "",
          description: t.contextSummary ?? t.title ?? "",
          type: Array.isArray(t.suggestedTags) && t.suggestedTags[0] ? t.suggestedTags[0] : "Feedback",
          contextSummary: t.contextSummary ?? null,
          actionItems: t.actionItems ?? [],
          impact: t.impact ?? null,
          suggestedTags: t.suggestedTags,
          priority: normalizePriority(t.suggestedPriority),
          screenshotUrl: i === 0 ? screenshotUrl : null,
          metadata: { clientTimestamp: Date.now() },
        };
        const feedbackRes = await apiFetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const feedbackJson = (await feedbackRes.json()) as {
          success?: boolean;
          ticket?: { id: string; title: string; description: string; type?: string };
        };
        if (feedbackJson.success && feedbackJson.ticket) {
          const tick = feedbackJson.ticket;
          if (!firstCreated)
            firstCreated = {
              id: tick.id,
              title: tick.title,
              description: tick.description,
              type: tick.type ?? "Feedback",
            };
        }
      }
      return firstCreated;
    },
    [sessionId, user]
  );

  const handleDelete = React.useCallback(async (_id: string) => {
    // No-op in extension when DELETE /api/tickets/:id is not implemented
  }, []);

  if (!authChecked) {
    return (
      <div style={{ padding: 16, fontSize: 14, color: "#666" }}>
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: 16, minWidth: 280 }}>
        <p style={{ marginBottom: 12, fontSize: 14, color: "#333" }}>
          Sign in to capture and submit feedback.
        </p>
        <button
          type="button"
          onClick={() => signInWithGoogle().catch(console.error)}
          style={{
            padding: "10px 16px",
            fontSize: 14,
            fontWeight: 600,
            color: "#fff",
            background: "#111827",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  if (sessionMessage && !sessionId) {
    return (
      <div style={{ padding: 16, minWidth: 280 }}>
        <p style={{ fontSize: 14, color: "#666" }}>{sessionMessage}</p>
        <p style={{ fontSize: 12, color: "#999", marginTop: 8 }}>
          Open the dashboard to create a session.
        </p>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div style={{ padding: 16, fontSize: 14, color: "#666" }}>
        Loading session…
      </div>
    );
  }

  return (
    <CaptureWidget
      sessionId={sessionId}
      userId={user.uid}
      extensionMode={true}
      onComplete={handleComplete}
      onDelete={handleDelete}
    />
  );
}

const rootEl = document.getElementById("root");
if (rootEl) {
  const root = createRoot(rootEl);
  root.render(<App />);
}
