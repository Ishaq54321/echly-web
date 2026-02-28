"use client";

import { useState, useEffect } from "react";
import {
  addFeedback,
  deleteFeedback,
  type Feedback,
  type StructuredFeedback,
} from "@/lib/feedback";
import { uploadScreenshot } from "@/lib/screenshot";
import type { Session } from "@/lib/sessions";

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
  ): Promise<{ id: string; title: string; description: string; type: string }> => {
    const res = await fetch("/api/structure-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    });

    const structured = (await res.json()) as StructuredFeedback;

    let screenshotUrl: string | null = null;

    if (screenshot) {
      screenshotUrl = await uploadScreenshot(screenshot, sessionId);
    }

    if (!session) {
      throw new Error("Session required for feedback");
    }

    const docRef = await addFeedback(sessionId, session.userId, {
      title: structured.title,
      description: structured.description,
      suggestion: structured.suggestion || "",
      type: structured.type,
      screenshotUrl,
      timestamp: Date.now(),
    });

    const newItem = {
      id: docRef.id,
      sessionId,
      userId: session.userId,
      title: structured.title,
      description: structured.description,
      suggestion: structured.suggestion || "",
      type: structured.type,
      status: "open" as const,
      priority: "medium" as const,
      createdAt: null,
      screenshotUrl,
      clientTimestamp: Date.now(),
      timestamp: Date.now(),
    };

    setFeedback((prev) => [newItem as Feedback, ...prev]);
    setSelectedId(newItem.id);

    return {
      id: newItem.id,
      title: newItem.title,
      description: newItem.description,
      type: newItem.type,
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
