"use client";

import { authFetch } from "@/lib/authFetch";
import { useState, useEffect } from "react";
import {
  addFeedback,
  deleteFeedback,
  type Feedback,
  type StructuredFeedback,
} from "@/lib/feedback";
import { uploadScreenshot, generateFeedbackId } from "@/lib/screenshot";
import type { Session } from "@/lib/sessions";

/** Structure Engine V2 API response. */
interface StructuredTicket {
  title: string;
  description?: string;
  actionSteps?: string[];
  suggestedTags?: string[];
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
    if (idx === -1) return;
    const desc = feedback[idx].description;
    const t = requestAnimationFrame(() => {
      setDescriptionDraft(desc);
      setIsEditingDescription(false);
    });
    return () => cancelAnimationFrame(t);
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
  ): Promise<{
    id: string;
    title: string;
    description: string;
    type: string;
  } | undefined> => {
    const res = await authFetch("/api/structure-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    });

    const data = (await res.json()) as {
      success?: boolean;
      tickets?: StructuredTicket[];
      error?: string;
    };

    const tickets = Array.isArray(data.tickets) ? data.tickets : [];
    if (!data.success || tickets.length === 0) return;

    if (!session) {
      throw new Error("Session required for feedback");
    }
    const workspaceId = session.workspaceId ?? session.userId;
    const createdByUserId = session.userId;
    if (!workspaceId || !createdByUserId) {
      throw new Error("Session missing workspaceId/userId");
    }

    // Generate a stable id for the first ticket so screenshot upload can
    // target the same Firestore document without blocking ticket creation.
    const firstFeedbackId =
      tickets.length > 0 && screenshot ? generateFeedbackId() : null;

    const created: Feedback[] = [];
    for (let index = 0; index < tickets.length; index++) {
      const t = tickets[index]!;
      const payload: StructuredFeedback = {
        title: t.title,
        description:
          typeof t.description === "string" ? t.description : t.title,
        type:
          Array.isArray(t.suggestedTags) && t.suggestedTags[0]
            ? t.suggestedTags[0]
            : "Feedback",
        contextSummary:
          typeof t.description === "string" ? t.description : undefined,
        actionSteps: t.actionSteps ?? [],
        suggestedTags: t.suggestedTags,
        // Ticket is created immediately without waiting for screenshot upload.
        screenshotUrl: null,
        timestamp: Date.now(),
      };

      const docRef = await addFeedback(
        workspaceId,
        sessionId,
        createdByUserId,
        payload,
        index === 0 && firstFeedbackId ? firstFeedbackId : undefined
      );

      const newItem: Feedback = {
        id: docRef.id,
        workspaceId: session.workspaceId ?? undefined,
        sessionId,
        userId: session.userId ?? undefined,
        title: payload.title,
        description: payload.description,
        suggestion: "",
        type: payload.type,
        isResolved: false,
        createdAt: null,
        contextSummary: payload.contextSummary ?? null,
        actionSteps: payload.actionSteps ?? null,
        suggestedTags: payload.suggestedTags ?? null,
        screenshotUrl: null,
        clientTimestamp: Date.now(),
      };
      created.push(newItem);
    }

    setFeedback((prev) => [...created, ...prev]);
    setSelectedId(created[0].id);

    // Kick off screenshot upload and ticket patch asynchronously so UI is not blocked.
    if (screenshot && firstFeedbackId && created[0]) {
      const ticketId = created[0].id;
      void (async () => {
        try {
          const screenshotUrl = await uploadScreenshot(
            screenshot,
            sessionId,
            firstFeedbackId
          );

          const patchRes = await authFetch(`/api/tickets/${ticketId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ screenshotUrl }),
          });

          const patchData = (await patchRes.json()) as {
            success?: boolean;
            ticket?: Partial<Feedback> & { id: string };
          };

          // Update local UI so screenshot appears once available.
          if (patchData.success && patchData.ticket) {
            setFeedback((prev) =>
              prev.map((item) =>
                item.id === ticketId
                  ? { ...item, ...patchData.ticket }
                  : item
              )
            );
          } else {
            // Fallback: at least set screenshotUrl locally on success.
            setFeedback((prev) =>
              prev.map((item) =>
                item.id === ticketId ? { ...item, screenshotUrl } : item
              )
            );
          }
        } catch {
          // Swallow upload/patch errors so they never block ticket creation UX.
        }
      })();
    }

    return {
      id: created[0].id,
      title: created[0].title,
      description: created[0].description,
      type: created[0].type,
    };
  };

  const handleDeleteFeedback = async (id: string) => {
    await deleteFeedback(id, sessionId);
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
