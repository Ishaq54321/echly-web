"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  addFeedback,
  getSessionFeedback,
  deleteFeedback,
} from "@/lib/feedback";
import CaptureWidget from "@/components/CaptureWidget";
import { uploadScreenshot } from "@/lib/screenshot";
import GlobalRail from "@/components/layout/GlobalRail";
import SessionHeader from "@/components/session/SessionHeader";
import FeedbackSidebar from "@/components/session/FeedbackSidebar";
import FeedbackDetail from "@/components/session/feedbackDetail/FeedbackDetail";
import { ActivityPanel } from "@/components/session/feedbackDetail/ActivityPanel";
import { useFeedbackDetailController } from "./hooks/useFeedbackDetailController";

export default function SessionPage() {
  const { sessionId } = useParams();
  const router = useRouter();

  const [session, setSession] = useState<any>(null);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [isImageExpanded, setIsImageExpanded] = useState(false);

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

      const feedbackData = await getSessionFeedback(sessionId as string);
      setFeedback(feedbackData);

      if (feedbackData.length > 0) {
        setSelectedId(feedbackData[0].id);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [sessionId, router]);

  /* ================= SELECTED ITEM WITH INDEX ================= */

  const selectedIndex = feedback.findIndex(
    (f) => f.id === selectedId
  );

  const selectedItem =
    selectedIndex !== -1
      ? {
          ...feedback[selectedIndex],
          index: selectedIndex + 1,
          total: feedback.length,
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

  /* ================= SYNC DESCRIPTION ================= */

  useEffect(() => {
    if (selectedItem) {
      setDescriptionDraft(selectedItem.description);
      setIsEditingDescription(false);
    }
  }, [selectedId]);

  /* ================= COPY LINK ================= */

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ================= SAVE DESCRIPTION ================= */

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

  /* ================= AI SAVE ================= */

  const handleTranscript = async (
    transcript: string,
    screenshot: string | null
  ) => {
    const res = await fetch("/api/structure-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    });

    const structured = await res.json();

    let screenshotUrl: string | null = null;

    if (screenshot) {
      screenshotUrl = await uploadScreenshot(
        screenshot,
        sessionId as string
      );
    }

    const docRef = await addFeedback(
      sessionId as string,
      session.userId,
      {
        title: structured.title,
        description: structured.description,
        suggestion: structured.suggestion || "",
        type: structured.type,
        screenshotUrl,
        timestamp: Date.now(),
      }
    );

    const newItem = {
      id: docRef.id,
      title: structured.title,
      description: structured.description,
      suggestion: structured.suggestion || "",
      type: structured.type,
      screenshotUrl,
      timestamp: Date.now(),
    };

    setFeedback((prev) => [newItem, ...prev]);
    setSelectedId(newItem.id);

    return newItem;
  };

  const handleDeleteFeedback = async (id: string) => {
    await deleteFeedback(id);
    setFeedback((prev) => prev.filter((item) => item.id !== id));
  };

  if (loading) return null;

  return (
    <>
      <div className="min-h-screen flex flex-col overflow-hidden">
        <SessionHeader
          title={session?.title}
          feedbackCount={feedback.length}
          copied={copied}
          onCopy={handleCopy}
        />

        <div
          className={`grid flex-1 min-h-0 grid-cols-1 overflow-hidden ${
            isCommentsOpen ? "lg:grid-cols-[72px_280px_1fr_380px]" : "lg:grid-cols-[72px_280px_1fr]"
          }`}
        >
          <div className="hidden lg:block min-h-0">
            <GlobalRail />
          </div>

          <aside className="min-h-0 overflow-hidden border-r border-[hsl(var(--border))] border-opacity-50 bg-[hsl(var(--surface-1))]">
            <FeedbackSidebar
              feedback={feedback}
              selectedId={selectedId}
              onSelect={setSelectedId}
              selectedIndex={selectedIndex}
              total={feedback.length}
            />
          </aside>

          <div className="min-h-0 overflow-hidden">
            <div className="max-w-4xl mx-auto h-full overflow-auto rounded-3xl border border-[hsl(var(--border))] border-opacity-50 bg-[hsl(var(--surface-1))] px-8 py-10">
              <FeedbackDetail
                sessionId={sessionId as string}
                selectedItem={selectedItem}
                isEditingDescription={isEditingDescription}
                descriptionDraft={descriptionDraft}
                setIsEditingDescription={setIsEditingDescription}
                setDescriptionDraft={setDescriptionDraft}
                saveDescription={saveDescription}
                setIsImageExpanded={setIsImageExpanded}
                isCommentsOpen={isCommentsOpen}
                onToggleActivity={() => setIsCommentsOpen((prev) => !prev)}
              />
            </div>
          </div>

          {isCommentsOpen && (
            <aside className="min-h-0 overflow-hidden hidden lg:block bg-[hsl(var(--surface-1))] border-l border-[hsl(var(--border))] border-opacity-50 px-6">
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
      </div>

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
