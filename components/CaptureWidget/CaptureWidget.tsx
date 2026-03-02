"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useCaptureWidget } from "./hooks/useCaptureWidget";
import CaptureHeader from "./CaptureHeader";
import FeedbackItem from "./FeedbackItem";
import WidgetFooter from "./WidgetFooter";
import { CaptureLayer } from "./CaptureLayer";
import type { CaptureWidgetProps } from "./types";

const CAPTURE_FLOW_STATES = ["focus_mode", "region_selecting", "voice_listening", "processing"] as const;

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

  const isInCaptureFlow = CAPTURE_FLOW_STATES.includes(state.state as any) || state.pillExiting;
  const showSidebar = !isInCaptureFlow;
  const showFloatingButton = !effectiveIsOpen && showSidebar;
  const showPanel = effectiveIsOpen && showSidebar;

  const insightCount = state.pointers.length;
  const highPriorityCount = state.pointers.filter((p) =>
    /critical|bug|high|urgent/i.test(p.type || "")
  ).length;
  const summary =
    insightCount > 0
      ? highPriorityCount > 0
        ? `${insightCount} insights • ${highPriorityCount} need attention`
        : `${insightCount} insights`
      : null;

  useEffect(() => {
    if (state.highlightTicketId && listScrollRef.current) {
      listScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state.highlightTicketId]);

  React.useEffect(() => {
    if (!widgetToggleRef) return;
    widgetToggleRef.current = handlers.toggleOpen;
    return () => {
      widgetToggleRef.current = null;
    };
  }, [handlers, widgetToggleRef]);

  return (
    <>
      {/* Capture layer: portaled into #echly-capture-root. Never inside sidebar. */}
      {captureRootReady &&
        refs.captureRootRef.current &&
        refs.aiRootRef.current &&
        createPortal(
          <CaptureLayer
            captureRoot={refs.captureRootRef.current}
            aiRoot={refs.aiRootRef.current}
            extensionMode={extensionMode}
            state={state.state}
            pillExiting={state.pillExiting}
            listeningAudioLevel={state.listeningAudioLevel ?? 0}
            listeningSentiment={state.listeningSentiment ?? "neutral"}
            liveTranscript={state.liveTranscript ?? ""}
            aiPreviewTitle={state.liveStructured?.title ?? null}
            orbSuccess={state.orbSuccess ?? false}
            getFullTabImage={handlers.getFullTabImage}
            onRegionCaptured={handlers.handleRegionCaptured}
            onRegionSelectStart={handlers.handleRegionSelectStart}
            onCancelCapture={handlers.handleCancelCapture}
            onDone={handlers.finishListening}
          />,
          refs.captureRootRef.current
        )}

      {showFloatingButton && (
        <div className="echly-floating-trigger-wrapper">
          <button
            type="button"
            onClick={() => (onExpandRequest ? onExpandRequest() : handlers.setIsOpen(true))}
            className="echly-floating-trigger"
          >
            Add insight
          </button>
        </div>
      )}

      {showPanel && (
        <>
          {!extensionMode && (
            <div
              className="echly-backdrop"
              style={{ position: "fixed", inset: 0, zIndex: 2147483646, background: "rgba(0,0,0,0.06)", pointerEvents: "auto" }}
              aria-hidden
            />
          )}
          <div
            ref={refs.widgetRef}
            className="echly-sidebar-container"
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
                : undefined
            }
          >
            <div className="echly-sidebar-surface">
              <CaptureHeader
                onClose={() => (onCollapseRequest ? onCollapseRequest() : handlers.setIsOpen(false))}
                summary={summary}
              />

              <div
                ref={listScrollRef}
                className="echly-sidebar-body"
              >
                <div className="echly-feedback-list">
                  {state.pointers.map((p) => (
                    <FeedbackItem
                      key={p.id}
                      item={p}
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
                  ))}
                </div>

                {state.errorMessage && (
                  <div className="echly-sidebar-error">
                    {state.errorMessage}
                  </div>
                )}

                {state.state === "idle" && (
                  <WidgetFooter
                    isIdle={true}
                    onAddFeedback={handlers.handleAddFeedback}
                    captureDisabled={captureDisabled}
                  />
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
