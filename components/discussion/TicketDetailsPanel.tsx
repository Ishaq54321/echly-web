"use client";

import { useState, useEffect } from "react";
import { authFetch } from "@/lib/authFetch";

export interface TicketDetailsPanelProps {
  feedbackId: string | null;
}

interface TicketData {
  id: string;
  title: string;
  actionSteps?: string[];
}

export function TicketDetailsPanel({ feedbackId }: TicketDetailsPanelProps) {
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!feedbackId) {
      setTicket(null);
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
      .then((data: { success?: boolean; ticket?: TicketData }) => {
        if (cancelled) return;
        const t = data.ticket;
        setTicket(t ?? null);
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
  }, [feedbackId]);

  if (!feedbackId) {
    return (
      <div className="w-[320px] shrink-0 flex flex-col items-center justify-center p-8 bg-white text-center border-r border-neutral-200">
        <p className="text-sm text-secondary">
          Select a discussion to view ticket details
        </p>
      </div>
    );
  }

  if (loading || !ticket) {
    return (
      <div className="w-[320px] shrink-0 flex flex-col p-6 border-r border-neutral-200 bg-white">
        <div className="h-5 w-3/4 bg-neutral-200 rounded animate-pulse" />
        <div className="mt-4 h-24 bg-neutral-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  const steps = ticket.actionSteps;
  const hasSteps = steps && Array.isArray(steps) && steps.length > 0;

  return (
    <div className="w-[320px] shrink-0 flex flex-col overflow-hidden border-r border-neutral-200 bg-white font-sans">
      <div className="flex-1 overflow-y-auto min-h-0 p-6">
        <h2 className="text-[17px] font-semibold text-neutral-900 mb-4">
          {ticket.title}
        </h2>

        {hasSteps && (
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
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
