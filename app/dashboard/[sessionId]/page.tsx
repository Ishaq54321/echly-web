"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
      <div className="h-screen bg-[#f6f8fb] flex flex-col overflow-hidden">

        <SessionHeader
          title={session?.title}
          feedbackCount={feedback.length}
          copied={copied}
          onCopy={handleCopy}
        />

        <div
          className={`grid flex-1 min-h-0 grid-cols-1 overflow-hidden pt-5 pb-2 ${
            isCommentsOpen ? "lg:grid-cols-[280px_1fr_400px]" : "lg:grid-cols-[280px_1fr]"
          }`}
        >
          <div className="min-h-0 overflow-hidden px-4 lg:px-6">
            <FeedbackSidebar
              feedback={feedback}
              selectedId={selectedId}
              onSelect={setSelectedId}
              selectedIndex={selectedIndex}
              total={feedback.length}
            />
          </div>
          <div className="min-h-0 overflow-hidden px-4 lg:px-6">
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
          {isCommentsOpen && (
            <div className="min-h-0 overflow-hidden hidden lg:block border-l border-slate-200 bg-white">
              <ActivityPanel
                comments={comments}
                loading={loadingComments}
                sendComment={sendComment}
              />
            </div>
          )}
        </div>

        <AnimatePresence>
          {isCommentsOpen && (
            <div className="lg:hidden fixed inset-0 z-40 flex justify-end">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-black/50"
                onClick={() => setIsCommentsOpen(false)}
                aria-hidden
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
                className="relative w-full max-w-sm h-full bg-white shadow-xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <ActivityPanel
                  comments={comments}
                  loading={loadingComments}
                  sendComment={sendComment}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {isImageExpanded && selectedItem?.screenshotUrl && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-10"
            onClick={() => setIsImageExpanded(false)}
          >
            <img
              src={selectedItem.screenshotUrl}
              alt="Expanded Screenshot"
              className="max-h-full max-w-full rounded-xl shadow-2xl"
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