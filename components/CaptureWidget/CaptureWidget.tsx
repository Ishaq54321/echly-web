"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useCaptureWidget } from "./hooks/useCaptureWidget";
import CaptureHeader from "./CaptureHeader";
import FeedbackList from "./FeedbackList";
import FeedbackItem from "./FeedbackItem";
import WidgetFooter from "./WidgetFooter";
import { CaptureLayer } from "./CaptureLayer";
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
    refs,
    captureRootReady,
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

  /** When transitioning from listening to processing-structure, play orb shrink in bubble (200ms). */
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
    !effectiveIsOpen && !state.captureModeMinimized;

  return (
    <>
      {/* Capture UI: portaled into #echly-capture-root, never inside widget */}
      {captureRootReady && refs.captureRootRef.current &&
        createPortal(
          <CaptureLayer
            captureRoot={refs.captureRootRef.current}
            extensionMode={extensionMode}
            state={
              state.state === "capturing" ||
              state.state === "listening" ||
              state.state === "processing-structure" ||
              state.state === "saving-feedback"
                ? state.state
                : "idle"
            }
            pillExiting={state.pillExiting}
            listeningExiting={listeningExiting}
            listeningAudioLevel={state.listeningAudioLevel ?? 0}
            listeningSentiment={state.listeningSentiment ?? "neutral"}
            getFullTabImage={handlers.getFullTabImage}
            onRegionCaptured={handlers.handleRegionCaptured}
            onCancelCapture={handlers.handleCancelCapture}
            onDone={handlers.finishListening}
          />,
          refs.captureRootRef.current
        )}

      {showFloatingButton ? (
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
      ) : !state.captureModeMinimized ? (
        <>
          {!extensionMode && (
            <div
              className="fixed inset-0 z-40 backdrop-blur-[4px] bg-black/8"
              aria-hidden
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
            {state.pointers[0] ? (
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
              items={state.pointers.slice(1)}
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
      ) : null}
    </>
  );
}
