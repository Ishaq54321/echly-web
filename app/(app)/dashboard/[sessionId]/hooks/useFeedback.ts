"use client";

import { useState, useEffect } from "react";
import {
  addFeedback,
  deleteFeedback,
  type Feedback,
  type StructuredFeedback,
  type FeedbackPriority,
} from "@/lib/feedback";
import { uploadScreenshot, generateFeedbackId } from "@/lib/screenshot";
import type { Session } from "@/lib/sessions";

/** Elite structuring API response. */
interface EliteTicket {
  title: string;
  contextSummary: string;
  actionItems?: string[];
  impact?: string;
  suggestedPriority?: string;
  suggestedTags?: string[];
}

function normalizePriority(s: string | undefined): FeedbackPriority {
  const v = (s ?? "medium").toLowerCase();
  if (v === "low" || v === "medium" || v === "high" || v === "critical")
    return v;
  return "medium";
}

export type SelectedFeedbackItem = Feedback & {
  index: number;
  total: number;
  timestamp?: number;
};

interface UseFeedbackArgs {
  sessionId: string;
  session: Session | null;
  feedback: Feedback[];
  setFeedback: React.Dispatch<React.SetStateAction<Feedback[]>>;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}

export function useFeedback({
  sessionId,
  session,
  feedback,
  setFeedback,
  selectedId,
  setSelectedId,
}: UseFeedbackArgs) {
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState("");

  const selectedIndex = feedback.findIndex((f) => f.id === selectedId);
  const selectedItem: SelectedFeedbackItem | null =
    selectedIndex !== -1
      ? {
          ...feedback[selectedIndex],
          index: selectedIndex + 1,
          total: feedback.length,
          timestamp:
            (feedback[selectedIndex] as Feedback & { timestamp?: number })
              .timestamp ??
            (feedback[selectedIndex] as Feedback & { clientTimestamp?: number })
              .clientTimestamp ??
            undefined,
        }
      : null;

  useEffect(() => {
    const idx = feedback.findIndex((f) => f.id === selectedId);
    if (idx !== -1) {
      setDescriptionDraft(feedback[idx].description);
      setIsEditingDescription(false);
    }
  }, [selectedId, feedback]);

  const saveDescription = () => {
    setFeedback((prev) =>
      prev.map((item) =>
        item.id === selectedId
          ? { ...item, description: descriptionDraft }
          : item
      )
    );
    setIsEditingDescription(false);
  };

  const handleTranscript = async (
    transcript: string,
    screenshot: string | null
  ): Promise<{ id: string; title: string; description: string; type: string } | undefined> => {
    const res = await fetch("/api/structure-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    });

    const data = (await res.json()) as { success?: boolean; tickets?: EliteTicket[]; error?: string };
    console.log("STRUCTURING RESPONSE:", data);

    const tickets = Array.isArray(data.tickets) ? data.tickets : [];
    if (!data.success || tickets.length === 0) {
      console.warn("No structured tickets returned", data);
      return;
    }

    let screenshotUrl: string | null = null;
    let firstFeedbackId: string | null = null;
    if (tickets.length > 0 && screenshot) {
      firstFeedbackId = generateFeedbackId();
      screenshotUrl = await uploadScreenshot(screenshot, sessionId, firstFeedbackId);
    }

    if (!session) {
      throw new Error("Session required for feedback");
    }

    const created: Feedback[] = [];
    let ticketIndex = 0;
    for (const t of tickets) {
      const payload: StructuredFeedback = {
        title: t.title,
        description: t.contextSummary ?? t.title,
        type: Array.isArray(t.suggestedTags) && t.suggestedTags[0] ? t.suggestedTags[0] : "Feedback",
        contextSummary: t.contextSummary ?? null,
        actionItems: t.actionItems ?? [],
        impact: t.impact ?? undefined,
        suggestedTags: t.suggestedTags,
        priority: normalizePriority(t.suggestedPriority),
        screenshotUrl: ticketIndex === 0 ? screenshotUrl : null,
        timestamp: Date.now(),
      };

      const docRef = await addFeedback(
        sessionId,
        session.userId,
        payload,
        ticketIndex === 0 && firstFeedbackId ? firstFeedbackId : undefined
      );
      ticketIndex++;
      const newItem: Feedback = {
        id: docRef.id,
        sessionId,
        userId: session.userId,
        title: payload.title,
        description: payload.description,
        suggestion: "",
        type: payload.type,
        status: "open",
        priority: payload.priority ?? "medium",
        createdAt: null,
        contextSummary: payload.contextSummary ?? null,
        actionItems: payload.actionItems ?? null,
        impact: payload.impact ?? null,
        suggestedTags: payload.suggestedTags ?? null,
        screenshotUrl: payload.screenshotUrl ?? null,
        clientTimestamp: Date.now(),
      };
      created.push(newItem);
    }

    setFeedback((prev) => [...created, ...prev]);
    setSelectedId(created[0].id);

    return {
      id: created[0].id,
      title: created[0].title,
      description: created[0].description,
      type: created[0].type,
    };
  };

  const handleDeleteFeedback = async (id: string) => {
    await deleteFeedback(id);
    setFeedback((prev) => prev.filter((item) => item.id !== id));
  };

  return {
    selectedIndex,
    selectedItem,
    isEditingDescription,
    setIsEditingDescription,
    descriptionDraft,
    setDescriptionDraft,
    saveDescription,
    handleTranscript,
    handleDeleteFeedback,
  };
}
