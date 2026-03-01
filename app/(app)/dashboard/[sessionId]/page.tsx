"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addFeedback, deleteFeedback } from "@/lib/feedback";
import CaptureWidget from "@/components/CaptureWidget";
import { uploadScreenshot, generateFeedbackId } from "@/lib/screenshot";
import FeedbackSidebar from "@/components/session/FeedbackSidebar";
import FeedbackDetail from "@/components/session/feedbackDetail/FeedbackDetail";
import { ActivityPanel } from "@/components/session/feedbackDetail/ActivityPanel";
import { Pencil, Check } from "lucide-react";
import { useFeedbackDetailController } from "./hooks/useFeedbackDetailController";
import { useSessionFeedbackPaginated } from "./hooks/useSessionFeedbackPaginated";

/** Ticket shape returned by GET/PATCH /api/tickets/:id (DB source of truth). */
type TicketFromApi = {
  id: string;
  title: string;
  description: string;
  actionItems?: string[] | null;
  [key: string]: unknown;
};

function formatRelativeTime(
  createdAt:
    | { toDate?: () => Date; seconds?: number }
    | string
    | null
    | undefined
): string {
  if (!createdAt) return "";
  try {
    const date =
      typeof createdAt === "string"
        ? new Date(createdAt)
        : typeof (createdAt as { toDate?: () => Date }).toDate === "function"
          ? (createdAt as { toDate: () => Date }).toDate()
          : (createdAt as { seconds?: number }).seconds != null
            ? new Date((createdAt as { seconds: number }).seconds * 1000)
            : null;
    if (!date) return "";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString(undefined, { dateStyle: "medium" });
  } catch {
    return "";
  }
}

export default function SessionPage() {
  const { sessionId } = useParams();
  const router = useRouter();

  const [session, setSession] = useState<any>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  /** Detail panel: always from DB (GET /api/tickets/:id). Do not use memory state. */
  const [detailTicket, setDetailTicket] = useState<TicketFromApi | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const {
    feedback,
    setFeedback,
    loading: feedbackLoading,
    hasMore: hasMoreFeedback,
    hasReachedLimit: feedbackReachedLimit,
    fetchNextPage: fetchNextFeedbackPage,
    refetchFirstPage: refetchFeedbackFirstPage,
  } = useSessionFeedbackPaginated(sessionId as string | undefined);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [isSavingDescription, setIsSavingDescription] = useState(false);
  const [saveDescriptionSuccess, setSaveDescriptionSuccess] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditingSessionTitle, setIsEditingSessionTitle] = useState(false);
  const [sessionTitleDraft, setSessionTitleDraft] = useState("");
  const [isSavingSessionTitle, setIsSavingSessionTitle] = useState(false);
  const [saveSessionTitleSuccess, setSaveSessionTitleSuccess] = useState(false);

  /* ================= LOAD SESSION ================= */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      const sessionRef = doc(db, "sessions", sessionId as string);
      const sessionSnap = await getDoc(sessionRef);

      if (!sessionSnap.exists()) {
        router.push("/dashboard");
        return;
      }

      const data = sessionSnap.data();

      if (data.userId !== currentUser.uid) {
        router.push("/dashboard");
        return;
      }

      setSession({ id: sessionSnap.id, ...data });
      setSessionLoading(false);
    });

    return () => unsubscribe();
  }, [sessionId, router]);

  // Select first feedback when first page loads and none selected.
  useEffect(() => {
    if (feedback.length > 0 && selectedId === null) {
      setSelectedId(feedback[0].id);
    }
  }, [feedback, selectedId]);

  /* ================= FETCH DETAIL FROM DB (single source of truth) ================= */

  const fetchDetailTicket = useCallback(async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/tickets/${id}`);
      const data = (await res.json()) as { success?: boolean; ticket?: TicketFromApi };
      if (data.success && data.ticket) {
        setDetailTicket(data.ticket);
      } else {
        setDetailTicket(null);
      }
    } catch {
      setDetailTicket(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetailTicket(null);
      return;
    }
    fetchDetailTicket(selectedId);
  }, [selectedId, fetchDetailTicket]);

  /* ================= SELECTED ITEM WITH INDEX (from DB) ================= */

  const selectedIndex = feedback.findIndex(
    (f) => f.id === selectedId
  );

  const selectedItem =
    detailTicket != null
      ? {
          ...detailTicket,
          index: selectedIndex !== -1 ? selectedIndex + 1 : 1,
          total: feedback.length || 1,
        }
      : null;

  const {
    comments,
    loadingComments,
    sendComment,
  } = useFeedbackDetailController({
    sessionId: sessionId as string,
    feedbackId: selectedId,
  });

  /* ================= SYNC DESCRIPTION (from DB-backed detail) ================= */

  useEffect(() => {
    if (detailTicket) {
      setDescriptionDraft(detailTicket.description);
      setIsEditingDescription(false);
    }
  }, [selectedId, detailTicket]);

  /* ================= SAVE TITLE (PATCH → DB, then update UI from response) ================= */

  const saveTitle = async (newTitle: string): Promise<void> => {
    if (!selectedId || newTitle.trim() === "") return;
    try {
      const res = await fetch(`/api/tickets/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      const data = (await res.json()) as { success?: boolean; ticket?: TicketFromApi };
      if (data.success && data.ticket) {
        setDetailTicket(data.ticket);
        setFeedback((prev) =>
          prev.map((item) =>
            item.id === selectedId ? { ...item, title: data.ticket!.title } : item
          )
        );
      }
    } catch {
      // revert detail to current state; could refetch
      if (detailTicket) setDetailTicket((t) => (t ? { ...t } : null));
    }
  };

  /* ================= SAVE DESCRIPTION (PATCH → DB, then update UI from response) ================= */

  const saveDescription = async (): Promise<void> => {
    if (!selectedId || descriptionDraft === detailTicket?.description) {
      setIsEditingDescription(false);
      return;
    }
    setIsSavingDescription(true);
    try {
      const res = await fetch(`/api/tickets/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: descriptionDraft }),
      });
      const data = (await res.json()) as { success?: boolean; ticket?: TicketFromApi };
      if (data.success && data.ticket) {
        setDetailTicket(data.ticket);
        setDescriptionDraft(data.ticket.description);
        setFeedback((prev) =>
          prev.map((item) =>
            item.id === selectedId ? { ...item, description: data.ticket!.description } : item
          )
        );
        setIsEditingDescription(false);
        setSaveDescriptionSuccess(true);
        setTimeout(() => setSaveDescriptionSuccess(false), 1200);
      }
    } catch {
      if (detailTicket) setDescriptionDraft(detailTicket.description);
    } finally {
      setIsSavingDescription(false);
    }
  };

  /* ================= SAVE ACTION ITEMS (PATCH → DB, then update UI from response) ================= */

  const saveActionItems = async (actionItems: string[]) => {
    if (!selectedId) return;
    try {
      const res = await fetch(`/api/tickets/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionItems }),
      });
      const data = (await res.json()) as { success?: boolean; ticket?: TicketFromApi };
      if (data.success && data.ticket) {
        setDetailTicket(data.ticket);
        setFeedback((prev) =>
          prev.map((item) =>
            item.id === selectedId ? { ...item, actionItems: data.ticket!.actionItems ?? null } : item
          )
        );
      }
    } catch {
      if (detailTicket) setDetailTicket((t) => (t ? { ...t } : null));
    }
  };

  /* ================= AI SAVE (Elite Structuring) ================= */

  const normalizePriority = (s: string | undefined): "low" | "medium" | "high" | "critical" => {
    const v = (s ?? "medium").toLowerCase();
    if (v === "low" || v === "medium" || v === "high" || v === "critical") return v;
    return "medium";
  };

  const handleTranscript = async (
    transcript: string,
    screenshot: string | null
  ) => {
    const res = await fetch("/api/structure-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    });

    const data = (await res.json()) as { success?: boolean; tickets?: any[]; error?: string };
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
      screenshotUrl = await uploadScreenshot(screenshot, sessionId as string, firstFeedbackId);
    }

    const created: any[] = [];
    for (let i = 0; i < tickets.length; i++) {
      const t = tickets[i];
      const payload = {
        title: t.title,
        description: t.contextSummary ?? t.title,
        type: Array.isArray(t.suggestedTags) && t.suggestedTags[0] ? t.suggestedTags[0] : "Feedback",
        contextSummary: t.contextSummary ?? null,
        actionItems: t.actionItems ?? [],
        impact: t.impact ?? null,
        suggestedTags: t.suggestedTags,
        priority: normalizePriority(t.suggestedPriority),
        screenshotUrl: i === 0 ? screenshotUrl : null,
        timestamp: Date.now(),
      };

      const docRef = await addFeedback(
        sessionId as string,
        session.userId,
        payload,
        i === 0 && firstFeedbackId ? firstFeedbackId : undefined
      );
      const newItem = {
        id: docRef.id,
        ...payload,
        status: "open",
        clientTimestamp: Date.now(),
      };
      created.push(newItem);
    }

    setFeedback((prev) => [...created, ...prev]);
    setSelectedId(created[0].id);
    await refetchFeedbackFirstPage();

    return created[0];
  };

  const handleDeleteFeedback = async (id: string) => {
    await deleteFeedback(id);
    setFeedback((prev) => prev.filter((item) => item.id !== id));
    setShowDeleteModal(false);
    router.push(`/dashboard/${sessionId}`);
  };

  if (sessionLoading) return null;

  return (
    <>
      <div
        className={`h-full grid grid-cols-1 ${
          isCommentsOpen
            ? "grid-rows-[0_1fr_1fr_1fr] lg:grid-cols-[340px_1fr_380px] lg:grid-rows-none"
            : "grid-rows-[0_1fr_1fr] lg:grid-cols-[340px_1fr] lg:grid-rows-none"
        }`}
      >
        <aside className="flex flex-col h-full min-h-0 border-r border-[hsl(var(--border))] bg-[hsl(var(--surface-2))]">
          <FeedbackSidebar
            feedback={feedback}
            selectedId={selectedId}
            onSelect={setSelectedId}
            selectedIndex={selectedIndex}
            total={feedback.length}
            loadingMore={feedbackLoading}
            hasMore={hasMoreFeedback}
            hasReachedLimit={feedbackReachedLimit}
            onLoadMore={fetchNextFeedbackPage}
          />
        </aside>

        <div className="flex flex-col h-full min-h-0 overflow-hidden bg-neutral-50">
          <div className="max-w-4xl mx-auto w-full px-8 pt-5 pb-3 shrink-0">
            {isEditingSessionTitle ? (
              <>
              <input
                value={sessionTitleDraft}
                onChange={(e) => setSessionTitleDraft(e.target.value)}
                onBlur={async () => {
                  const trimmed = sessionTitleDraft.trim();
                  if (!sessionId || !session) return;
                  if (trimmed === (session.title ?? "")) {
                    setIsEditingSessionTitle(false);
                    return;
                  }
                  setIsSavingSessionTitle(true);
                  try {
                    const safeTitle =
                      trimmed && trimmed.length > 0
                        ? trimmed
                        : session.title || "Untitled Session";
                    const res = await fetch(`/api/sessions/${sessionId}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ title: safeTitle }),
                    });
                    const data = (await res.json()) as { success?: boolean; session?: Record<string, unknown> };
                    if (data.success && data.session) {
                      setSession((prev: any) => (prev ? { ...prev, ...data.session } : prev));
                      setSessionTitleDraft((data.session.title as string) ?? trimmed);
                      setIsSavingSessionTitle(false);
                      setSaveSessionTitleSuccess(true);
                      setTimeout(() => setSaveSessionTitleSuccess(false), 1200);
                      setIsEditingSessionTitle(false);
                    } else {
                      setIsSavingSessionTitle(false);
                      setIsEditingSessionTitle(false);
                    }
                  } catch {
                    setSessionTitleDraft(session.title ?? "Session");
                    setIsSavingSessionTitle(false);
                    setIsEditingSessionTitle(false);
                  }
                }}
                onFocus={(e) => e.currentTarget.select()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.currentTarget.blur();
                  } else if (e.key === "Escape") {
                    setSessionTitleDraft(session?.title ?? "Session");
                    setIsEditingSessionTitle(false);
                    e.currentTarget.blur();
                  }
                }}
                autoFocus
                className="text-2xl font-bold tracking-tight text-[hsl(var(--text-primary))] w-full bg-neutral-50 border border-neutral-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-black/10"
                aria-label="Session title"
              />
            <p className="text-xs text-neutral-500 mt-1 transition-opacity duration-150">
              Enter to save · Esc to cancel
            </p>
            {isSavingSessionTitle && (
              <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1.5 transition-opacity duration-150">
                Saving...
              </p>
            )}
            </>
            ) : (
              <div
                className="group flex items-center gap-2 cursor-pointer min-h-[2rem]"
                onClick={() => {
                  setSessionTitleDraft(session?.title ?? "Session");
                  setIsEditingSessionTitle(true);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSessionTitleDraft(session?.title ?? "Session");
                    setIsEditingSessionTitle(true);
                  }
                }}
                aria-label="Edit session title"
              >
                <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--text-primary))]">
                  {session?.title ?? "Session"}
                </h1>
                {saveSessionTitleSuccess ? (
                  <Check size={14} className="text-green-600 shrink-0" aria-hidden />
                ) : (
                  <Pencil
                    size={14}
                    className="opacity-0 group-hover:opacity-60 transition-[opacity] duration-[120ms] ease text-[hsl(var(--text-secondary))] shrink-0"
                    aria-hidden
                  />
                )}
              </div>
            )}
            {saveSessionTitleSuccess && !isEditingSessionTitle && (
              <p className="text-xs text-green-600 mt-0.5 flex items-center gap-1.5 transition-opacity duration-150">
                <Check size={12} className="shrink-0" aria-hidden />
                Saved
              </p>
            )}
            <div className="text-sm text-[hsl(var(--text-secondary))] mt-1 flex items-center gap-1.5 [&_span]:opacity-[0.92]">
              <span>You</span>
              <span aria-hidden>•</span>
              <span>{formatRelativeTime(session?.createdAt) || "—"}</span>
              <span aria-hidden>•</span>
              <span>
                {feedback.length} feedback item{feedback.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col max-w-4xl mx-auto w-full">
            <div className="flex-1 min-h-0 overflow-y-auto bg-neutral-50">
              <div className="flex flex-col h-full px-8 py-6">
                {detailLoading && selectedId ? (
                  <div className="flex-1 min-h-0 flex items-center justify-center py-16">
                    <p className="text-sm text-[hsl(var(--text-secondary))]">Loading…</p>
                  </div>
                ) : (
                <FeedbackDetail
                  sessionId={sessionId as string}
                  selectedItem={selectedItem}
                  isEditingDescription={isEditingDescription}
                  descriptionDraft={descriptionDraft}
                  setIsEditingDescription={setIsEditingDescription}
                  setDescriptionDraft={setDescriptionDraft}
                  saveDescription={saveDescription}
                  isSavingDescription={isSavingDescription}
                  saveDescriptionSuccess={saveDescriptionSuccess}
                  onSaveTitle={saveTitle}
                  onRequestDelete={() => setShowDeleteModal(true)}
                  onSaveActionItems={saveActionItems}
                  setIsImageExpanded={setIsImageExpanded}
                  isCommentsOpen={isCommentsOpen}
                  onToggleActivity={() => setIsCommentsOpen((prev) => !prev)}
                />
                )}
              </div>
            </div>
          </div>
        </div>

        {isCommentsOpen && (
            <aside className="flex flex-col h-full min-h-0 hidden lg:block bg-[hsl(var(--surface-1))] border-l border-[hsl(var(--border)/0.8)] px-6">
              <ActivityPanel
                comments={comments}
                loading={loadingComments}
                sendComment={sendComment}
              />
            </aside>
          )}
      </div>

      {isCommentsOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex justify-end">
            <div
              className="absolute inset-0 bg-black/50 transition-opacity duration-200"
              onClick={() => setIsCommentsOpen(false)}
              aria-hidden
            />
            <div
              className="relative w-full max-w-sm h-full bg-[hsl(var(--surface-1))] flex flex-col transition-opacity duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <ActivityPanel
                comments={comments}
                loading={loadingComments}
                sendComment={sendComment}
              />
            </div>
          </div>
        )}

        {isImageExpanded && selectedItem?.screenshotUrl && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-10"
            onClick={() => setIsImageExpanded(false)}
          >
            <img
              src={selectedItem.screenshotUrl}
              alt="Expanded Screenshot"
              className="max-h-full max-w-full rounded-xl"
            />
          </div>
        )}

        {showDeleteModal && selectedId && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowDeleteModal(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-ticket-title"
          >
            <div
              className="bg-[hsl(var(--surface-1))] rounded-lg shadow-xl max-w-sm w-full p-6 border border-[hsl(var(--border))]"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="delete-ticket-title" className="text-lg font-semibold text-[hsl(var(--text-primary))]">
                Delete ticket?
              </h2>
              <p className="mt-2 text-sm text-[hsl(var(--text-secondary))]">
                This cannot be undone.
              </p>
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-[hsl(var(--surface-2))] text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-3))] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteFeedback(selectedId)}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

      {session && (
        <CaptureWidget
          sessionId={sessionId as string}
          userId={session.userId}
          onComplete={handleTranscript}
          onDelete={handleDeleteFeedback}
        />
      )}
    </>
  );
}
