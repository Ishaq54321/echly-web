"use client";

import { useState, useEffect } from "react";
import { authFetch } from "@/lib/authFetch";
import { requireApiSuccessData } from "@/lib/api/apiEnvelope";
import { useWorkspace } from "@/lib/client/workspaceContext";
import { MinimalLoader } from "@/components/ui/MinimalLoader";

export interface TicketDetailsPanelProps {
  feedbackId: string | null;
}

interface TicketData {
  id: string;
  title: string;
  actionSteps?: string[];
}

export function TicketDetailsPanel({ feedbackId }: TicketDetailsPanelProps) {
  const { authUid } = useWorkspace();
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!feedbackId) {
      setTicket(null);
      setLoading(false);
      return;
    }

    setTicket(null);
    if (!authUid) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    authFetch(`/api/tickets/${feedbackId}`)
      .then((res) => {
        if (cancelled) return;
        if (!res || !res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((raw: unknown) => {
        if (cancelled) return;
        const payload = requireApiSuccessData<{ ticket: TicketData }>(raw);
        setTicket(payload.ticket);
      })
      .catch(() => {
        if (!cancelled) setTicket(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [feedbackId, authUid]);

  if (!feedbackId) {
    return (
      <div className="w-[320px] shrink-0 flex flex-col items-center justify-center p-8 bg-white text-center border-r border-[var(--border)]">
        <p className="text-sm text-secondary">
          Select a discussion to view ticket details
        </p>
      </div>
    );
  }

  if (loading || !ticket) {
    return (
      <div className="flex h-full min-h-[200px] w-[320px] shrink-0 flex-col items-center justify-center border-r border-[var(--border)] bg-white p-8">
        <MinimalLoader label="Loading details…" />
      </div>
    );
  }

  const steps = ticket.actionSteps;
  const hasSteps = steps && Array.isArray(steps) && steps.length > 0;

  return (
    <div className="w-[320px] shrink-0 flex flex-col overflow-hidden border-r border-[var(--border)] bg-white font-sans">
      <div className="flex-1 overflow-y-auto min-h-0 p-6">
        <h2 className="text-[17px] font-semibold text-[var(--text-heading)] mb-4">
          {ticket.title}
        </h2>

        {hasSteps && (
          <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
            <p className="text-[12px] uppercase font-semibold tracking-wide text-secondary mb-2">
              Action steps
            </p>
            <ul className="text-[14px] leading-relaxed text-neutral-700 space-y-1 list-disc list-inside">
              {steps!.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
