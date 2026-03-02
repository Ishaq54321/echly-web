"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useCaptureWidget } from "./hooks/useCaptureWidget";
import { MicOrb } from "./MicOrb";
import CaptureHeader from "./CaptureHeader";
import FeedbackList from "./FeedbackList";
import FeedbackItem from "./FeedbackItem";
import WidgetFooter from "./WidgetFooter";
import ProcessingSkeletonCard from "./ProcessingSkeletonCard";
import { RegionCaptureOverlay } from "./RegionCaptureOverlay";
import { FloatingVoicePill } from "./FloatingVoicePill";
import type { CaptureWidgetProps } from "./types";

export default function CaptureWidget({
  sessionId,
  userId,
  extensionMode = false,
  initialPointers,
  onComplete,
  onDelete,
  widgetToggleRef,
  onRecordingChange,
  expanded,
  onExpandRequest,
  onCollapseRequest,
  liveStructureFetch,
  captureDisabled = false,
}: CaptureWidgetProps) {
  const {
    state,
    handlers,
    derivedValues,
    refs,
  } = useCaptureWidget({
    sessionId,
    userId,
    extensionMode,
    initialPointers,
    onComplete,
    onDelete,
    onRecordingChange,
    liveStructureFetch,
  });

  const isControlled = expanded !== undefined;
  const effectiveIsOpen = isControlled ? expanded : state.isOpen;
  const listScrollRef = useRef<HTMLDivElement>(null);

  /** When transitioning from saving-feedback/anticipation to idle, keep skeleton visible and fade it out (200ms). */
  const [processingExiting, setProcessingExiting] = useState(false);
  /** When transitioning from listening to processing-structure, play orb shrink then hide (200ms). */
  const [listeningExiting, setListeningExiting] = useState(false);
  const prevStateRef = useRef(state.state);

  /** On new ticket highlight (e.g. after floating capture success), scroll list to top. */
  useEffect(() => {
    if (state.highlightTicketId && listScrollRef.current) {
      listScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state.highlightTicketId]);
  useEffect(() => {
    const prev = prevStateRef.current;
    const wasProcessing = prev === "saving-feedback" || prev === "anticipation";
    if (state.state === "idle" && wasProcessing) {
      setProcessingExiting(true);
      const t = setTimeout(() => setProcessingExiting(false), 200);
      prevStateRef.current = state.state;
      return () => clearTimeout(t);
    }
    if (state.state === "processing-structure" && prev === "listening") {
      setListeningExiting(true);
      const t = setTimeout(() => setListeningExiting(false), 200);
      prevStateRef.current = state.state;
      return () => clearTimeout(t);
    }
    prevStateRef.current = state.state;
  }, [state.state]);

  React.useEffect(() => {
    if (!widgetToggleRef) return;
    widgetToggleRef.current = handlers.toggleOpen;
    return () => {
      widgetToggleRef.current = null;
    };
  }, [handlers, widgetToggleRef]);

  const showFloatingButton =
    !effectiveIsOpen && !(extensionMode && state.captureModeMinimized);

  if (showFloatingButton) {
    return (
      <div className="fixed bottom-10 right-10 z-50 capture-floating-wrapper">
        <button
          type="button"
          onClick={() => (onExpandRequest ? onExpandRequest() : handlers.setIsOpen(true))}
          className="capture-floating-trigger
                     flex items-center gap-3
                     bg-white border border-[rgba(0,0,0,0.08)]
                     px-5 py-2.5 rounded-[20px]
                     text-[#111827] font-semibold
                     shadow-[0_10px_30px_rgba(0,0,0,0.12),0_4px_10px_rgba(0,0,0,0.06)]
                     transition-[transform_80ms_ease-in,box-shadow_150ms_ease-out]
                     hover:-translate-y-px hover:shadow-[0_12px_34px_rgba(0,0,0,0.14),0_5px_12px_rgba(0,0,0,0.08)]
                     active:scale-[0.98] cursor-pointer"
        >
          <Image src="/Echly_logo.svg" alt="Echly" width={26} height={26} className="shrink-0" />
          Capture Feedback
        </button>
      </div>
    );
  }

  /* Extension: premium floating capture — overlay + region selection or voice pill only. */
  if (extensionMode && state.captureModeMinimized) {
    const showPill =
      state.state === "listening" ||
      state.state === "processing-structure" ||
      state.state === "saving-feedback";
    const showFocusOverlay =
      state.state === "listening" ||
      state.state === "processing-structure" ||
      state.state === "saving-feedback" ||
      state.pillExiting;
    return (
      <>
        {/* Subtle focus overlay when voice pill is shown (no double overlay during region select) */}
        {showFocusOverlay && (
          <div
            className="echly-capture-focus-overlay"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.08)",
              pointerEvents: "auto",
              zIndex: 2147483646,
            }}
            aria-hidden
          />
        )}
        {state.state === "capturing" && (
          <RegionCaptureOverlay
            getFullTabImage={handlers.getFullTabImage}
            onCapture={handlers.handleRegionCaptured}
            onCancel={handlers.handleCancelCapture}
            getWidgetOrigin={undefined}
          />
        )}
        {showPill && (
          <div className={state.pillExiting ? "echly-voice-pill-wrapper echly-voice-pill--exiting" : "echly-voice-pill-wrapper"}>
            <FloatingVoicePill
              isListening={state.state === "listening"}
              isProcessing={
                state.state === "processing-structure" ||
                state.state === "saving-feedback" ||
                state.pillExiting
              }
              isExiting={state.state === "processing-structure" && listeningExiting}
              audioLevel={state.listeningAudioLevel ?? 0}
              sentiment={state.listeningSentiment ?? "neutral"}
              onDone={handlers.finishListening}
            />
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {!extensionMode && (
        <div
          className="fixed inset-0 z-40 backdrop-blur-[4px] bg-black/8"
          aria-hidden
        />
      )}
      {extensionMode && state.state === "capturing" && (
        <RegionCaptureOverlay
          getFullTabImage={handlers.getFullTabImage}
          onCapture={handlers.handleRegionCaptured}
          onCancel={handlers.handleCancelCapture}
          getWidgetOrigin={() => {
            const el = refs.widgetRef.current;
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + 140 };
          }}
        />
      )}
      <div
        ref={refs.widgetRef}
        className={`fixed w-[480px] transition-all duration-200 ${
          !extensionMode && state.position ? "" : !extensionMode ? "bottom-10 right-10" : ""
        } ${extensionMode ? "" : "z-50"}`}
        style={
          extensionMode
            ? {
                position: "fixed",
                ...(state.position
                  ? { left: state.position.x, top: state.position.y }
                  : { bottom: "24px", right: "24px" }),
                zIndex: 2147483647,
                pointerEvents: "auto",
              }
            : {
                ...(state.position ? { left: state.position.x, top: state.position.y } : {}),
              }
        }
      >
        <div className="bg-white rounded-lg
                        border border-slate-200/80
                        shadow-[0_16px_40px_rgba(0,0,0,0.12),0_6px_16px_rgba(0,0,0,0.08)]
                        overflow-hidden font-sans">
        <CaptureHeader
          onStartDrag={handlers.startDrag}
          onShare={handlers.handleShare}
          onMoreClick={() => handlers.setShowMenu((p) => !p)}
          onClose={() => (onCollapseRequest ? onCollapseRequest() : handlers.setIsOpen(false))}
          showMenu={state.showMenu}
          onResetSession={handlers.resetSession}
          menuRef={refs.menuRef}
          isProcessingStructure={state.state === "processing-structure"}
        />

        <div
          ref={listScrollRef}
          className="px-6 py-6 flex flex-col gap-4 max-h-[60vh] overflow-y-auto"
        >
          <div className="capture-feedback-list flex flex-col space-y-2">
            {/* First slot: skeleton (when publishing) or first ticket (when idle) — no layout shift */}
            {state.state === "saving-feedback" || state.state === "anticipation" || processingExiting ? (
              <ProcessingSkeletonCard exiting={processingExiting} />
            ) : state.pointers[0] ? (
              <FeedbackItem
                item={state.pointers[0]}
                expandedId={state.expandedId}
                editingId={state.editingId}
                editedTitle={state.editedTitle}
                editedDescription={state.editedDescription}
                onExpand={handlers.setExpandedId}
                onStartEdit={handlers.startEditing}
                onSaveEdit={handlers.saveEdit}
                onDelete={handlers.deletePointer}
                onEditedTitleChange={handlers.setEditedTitle}
                onEditedDescriptionChange={handlers.setEditedDescription}
                highlightTicketId={state.highlightTicketId}
              />
            ) : null}
            <FeedbackList
              items={
                state.state === "saving-feedback" || state.state === "anticipation" || processingExiting
                  ? state.pointers
                  : state.pointers.slice(1)
              }
              expandedId={state.expandedId}
              editingId={state.editingId}
              editedTitle={state.editedTitle}
              editedDescription={state.editedDescription}
              onExpand={handlers.setExpandedId}
              onStartEdit={handlers.startEditing}
              onSaveEdit={handlers.saveEdit}
              onDelete={handlers.deletePointer}
              onEditedTitleChange={handlers.setEditedTitle}
              onEditedDescriptionChange={handlers.setEditedDescription}
              highlightTicketId={state.highlightTicketId}
            />
          </div>

          {state.errorMessage && (
            <div className="text-sm text-neutral-600 bg-neutral-100/70 border border-neutral-200 rounded-md px-4 py-3">
              {state.errorMessage}
            </div>
          )}

          {state.state === "capturing" && !extensionMode && (
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 text-sm text-slate-600">
              Capturing screenshot…
            </div>
          )}

          {(state.state === "listening" ||
            listeningExiting ||
            state.state === "processing-structure" ||
            state.state === "saving-feedback") && (
            <div className="capture-listening-enter border border-slate-200 rounded-lg p-4 bg-slate-50">
              {state.state !== "processing-structure" && state.state !== "saving-feedback" && (
                <div className="flex justify-between items-center mb-3">
                  <span className="capture-timer text-sm text-slate-500 tabular-nums">{derivedValues.formatTime()}</span>
                </div>
              )}
              <div className="flex flex-col items-center justify-center mb-4">
                {(state.state === "listening" || listeningExiting) && (
                  <MicOrb
                    isSpeaking={state.listeningAudioLevel != null && state.listeningAudioLevel > 0.12}
                    audioLevel={state.listeningAudioLevel ?? 0}
                    isExiting={listeningExiting}
                    sentiment={state.listeningSentiment ?? "neutral"}
                  />
                )}
                {(state.state === "processing-structure" || state.state === "saving-feedback") && (
                  <MicOrb isProcessing />
                )}
                {state.state === "listening" && (
                  <>
                    <p className="mt-4 text-[15px] text-slate-600 font-normal tracking-tight text-center">
                      Describe the issue…
                    </p>
                    {state.liveStructured?.title && (
                      <p
                        className="mt-2 text-sm font-medium text-slate-700 text-center max-w-full truncate px-2 transition-opacity duration-300 ease-out opacity-0 animate-[echly-title-fade-in_300ms_ease-out_forwards]"
                        style={{ animationDelay: "40ms" }}
                      >
                        {state.liveStructured.title}
                      </p>
                    )}
                  </>
                )}
                {(state.state === "processing-structure" || state.state === "saving-feedback") && (
                  <p className="mt-4 text-[15px] text-slate-500 font-normal tracking-tight text-center">
                    Processing…
                  </p>
                )}
              </div>
              {state.state === "listening" && state.liveStructured && state.liveStructured.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-1.5 justify-center">
                  {state.liveStructured.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/80 text-slate-600 border border-slate-200/80"
                    >
                      {tag}
                    </span>
                  ))}
                  {state.liveStructured.priority && state.liveStructured.priority !== "medium" && (
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/80 text-slate-600 border border-slate-200/80 capitalize"
                    >
                      {state.liveStructured.priority}
                    </span>
                  )}
                </div>
              )}
              {state.state === "listening" && !listeningExiting && (
                <div className="flex justify-between">
                  <button type="button" onClick={handlers.discardListening} className="text-[14px] font-medium text-slate-600 hover:text-slate-900 hover:bg-neutral-100 transition-colors duration-120 cursor-pointer px-3 py-2 rounded-md">Cancel</button>
                  <button type="button" onClick={handlers.finishListening} className="bg-brand-primary text-white hover:opacity-90 active:scale-[0.98] px-5 py-2 rounded-lg text-[14px] font-medium transition-colors duration-150 cursor-pointer">Done</button>
                </div>
              )}
            </div>
          )}

          {state.state === "idle" && (
            <WidgetFooter
              isIdle={state.state === "idle"}
              onAddFeedback={handlers.handleAddFeedback}
              captureDisabled={captureDisabled}
            />
          )}
        </div>
      </div>
    </div>
    </>
  );
}
