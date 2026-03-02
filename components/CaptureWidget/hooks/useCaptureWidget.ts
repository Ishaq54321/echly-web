"use client";

import { authFetch } from "@/lib/authFetch";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSessionFeedback } from "@/lib/feedback";
import type {
  StructuredFeedback,
  Recording,
  CaptureState,
  CaptureWidgetProps,
  Position,
  CaptureContext,
} from "../types";

const SAFE_MARGIN = 24;

/** Web Speech API recognition instance (not in DOM lib types). */
type SpeechRecognitionInstance = { start(): void; stop(): void };

function generateRecordingId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `rec-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

const RECORDING_STATES: CaptureState[] = [
  "capturing",
  "listening",
  "processing",
  "processing-structure",
  "saving-feedback",
  "anticipation",
];

const LIVE_STRUCTURE_DEBOUNCE_MS = 1800;
/** Minimum time to show "Structuring" before transitioning to "Saving" (avoids flicker). */
const MIN_PROCESSING_PHASE_MS = 1200;
const LIVE_STRUCTURE_MIN_LENGTH = 12;

export function useCaptureWidget({
  sessionId,
  extensionMode = false,
  initialPointers,
  onComplete,
  onDelete,
  onRecordingChange,
  liveStructureFetch,
}: CaptureWidgetProps) {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [activeRecordingId, setActiveRecordingId] = useState<string | null>(null);
  const [isOpen, setIsOpenState] = useState(false);
  const [state, setState] = useState<CaptureState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pointers, setPointers] = useState<StructuredFeedback[]>(
    initialPointers ?? []
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingStructured, setPendingStructured] = useState<StructuredFeedback | null>(null);
  const [liveStructured, setLiveStructured] = useState<{ title: string; tags: string[]; priority: string } | null>(null);

  const dragOffset = useRef({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const timerRef = useRef<any>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const activeRecordingIdRef = useRef<string | null>(null);
  const recordingsRef = useRef<Recording[]>(recordings);
  const stateRef = useRef<CaptureState>(state);
  const editingIdRef = useRef<string | null>(null);
  const trayLockedRef = useRef(false);
  const liveStructureTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  /** After MIN_PROCESSING_PHASE_MS in processing-structure, transition to saving-feedback (avoids flicker). */
  useEffect(() => {
    if (state !== "processing-structure") return;
    const t = setTimeout(() => {
      if (stateRef.current === "processing-structure") setState("saving-feedback");
    }, MIN_PROCESSING_PHASE_MS);
    return () => clearTimeout(t);
  }, [state]);

  useEffect(() => {
    editingIdRef.current = editingId;
  }, [editingId]);

  /** Keep tray locked during capture → listen → process so it never collapses. */
  useEffect(() => {
    if (RECORDING_STATES.includes(state)) {
      trayLockedRef.current = true;
    } else {
      trayLockedRef.current = false;
    }
  }, [state]);

  /** Notify extension when recording starts or stops (global sticky state). Only on actual transition, not on mount. */
  const wasRecordingRef = useRef(false);
  useEffect(() => {
    if (!onRecordingChange) return;
    const recording = RECORDING_STATES.includes(state);
    if (recording) {
      wasRecordingRef.current = true;
      onRecordingChange(true);
    } else if (wasRecordingRef.current) {
      wasRecordingRef.current = false;
      onRecordingChange(false);
    }
  }, [state, onRecordingChange]);

  /** Instant structured insight: debounced live title/tags/priority while user is speaking. */
  useEffect(() => {
    if (state !== "listening" || !liveStructureFetch || !activeRecordingId) {
      setLiveStructured(null);
      if (liveStructureTimeoutRef.current) {
        clearTimeout(liveStructureTimeoutRef.current);
        liveStructureTimeoutRef.current = null;
      }
      return;
    }
    const active = recordings.find((r) => r.id === activeRecordingId);
    const transcript = (active?.transcript ?? "").trim();
    if (transcript.length < LIVE_STRUCTURE_MIN_LENGTH) {
      if (liveStructureTimeoutRef.current) {
        clearTimeout(liveStructureTimeoutRef.current);
        liveStructureTimeoutRef.current = null;
      }
      return;
    }
    if (liveStructureTimeoutRef.current) clearTimeout(liveStructureTimeoutRef.current);
    liveStructureTimeoutRef.current = setTimeout(() => {
      liveStructureTimeoutRef.current = null;
      liveStructureFetch(transcript)
        .then((result) => {
          if (result && stateRef.current === "listening") setLiveStructured(result);
        })
        .catch(() => {});
    }, LIVE_STRUCTURE_DEBOUNCE_MS);
    return () => {
      if (liveStructureTimeoutRef.current) {
        clearTimeout(liveStructureTimeoutRef.current);
        liveStructureTimeoutRef.current = null;
      }
    };
  }, [state, activeRecordingId, recordings, liveStructureFetch]);

  /** Guarded setter: in extension mode or during capturing/listening/structuring/edit, do not close. */
  const setIsOpen = useCallback((next: boolean) => {
    if (next === false) {
      if (trayLockedRef.current) return;
      if (extensionMode) return;
      const s = stateRef.current;
      if (RECORDING_STATES.includes(s)) return;
      if (editingIdRef.current) return;
    }
    setIsOpenState(next);
  }, [extensionMode]);

  /** For extension message toggle: flip open state without going through close guard. */
  const toggleOpen = useCallback(() => {
    setIsOpenState((prev) => !prev);
  }, []);

  useEffect(() => {
    activeRecordingIdRef.current = activeRecordingId;
  }, [activeRecordingId]);

  useEffect(() => {
    recordingsRef.current = recordings;
  }, [recordings]);

  /* ================= DRAG ================= */

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !widgetRef.current) return;
      e.preventDefault();
      const widgetWidth = widgetRef.current.offsetWidth;
      const widgetHeight = widgetRef.current.offsetHeight;
      let newX = e.clientX - dragOffset.current.x;
      let newY = e.clientY - dragOffset.current.y;
      const maxX = window.innerWidth - widgetWidth - SAFE_MARGIN;
      const maxY = window.innerHeight - widgetHeight - SAFE_MARGIN;
      newX = Math.max(SAFE_MARGIN, Math.min(newX, maxX));
      newY = Math.max(SAFE_MARGIN, Math.min(newY, maxY));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        document.body.style.userSelect = "";
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const startDrag = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0 || !widgetRef.current) return;
    const rect = widgetRef.current.getBoundingClientRect();
    setIsDragging(true);
    document.body.style.userSelect = "none";
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setPosition({ x: rect.left, y: rect.top });
  }, []);

  /* ================= SYNC / LOAD SESSION FEEDBACK ================= */

  useEffect(() => {
    if (initialPointers != null) {
      setPointers(initialPointers);
      return;
    }
    if (!sessionId) return;
    const loadFeedback = async () => {
      const existing = await getSessionFeedback(sessionId);
      setPointers(
        existing.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          type: item.type,
        }))
      );
    };
    loadFeedback();
  }, [sessionId, initialPointers]);

  /* ================= SPEECH ================= */

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event: any) => {
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        text += event.results[i][0].transcript;
      }
      const activeId = activeRecordingIdRef.current;
      if (activeId) {
        setRecordings((prev) =>
          prev.map((r) =>
            r.id === activeId ? { ...r, transcript: text } : r
          )
        );
      }
    };
    recognition.onend = () => {
      const s = stateRef.current;
      if (s === "processing-structure" || s === "saving-feedback") return;
      setState("idle");
    };
    recognitionRef.current = recognition;
    return () => {
      try {
        recognition.stop();
      } catch (_) {}
    };
  }, []);

  /* ================= TIMER ================= */

  const startTimer = useCallback(() => {
    setSeconds(0);
    timerRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = () => clearInterval(timerRef.current);

  const formatTime = useCallback(() => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }, [seconds]);

  /* ================= LISTEN ================= */

  const startListening = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      recognitionRef.current?.start();
      setState("listening");
      startTimer();
    } catch (err) {
      console.error("Microphone permission denied:", err);
      setErrorMessage("Microphone permission denied.");
      setState("error");
    }
  }, [startTimer]);

  const finishListening = useCallback(async () => {
    recognitionRef.current?.stop();
    stopTimer();
    const activeId = activeRecordingIdRef.current;
    if (!activeId) {
      setState("idle");
      return;
    }
    const currentRecordings = recordingsRef.current;
    const active = currentRecordings.find((r) => r.id === activeId);
    if (!active || !active.transcript.trim()) {
      setState("idle");
      return;
    }
    setState("processing-structure");
    if (extensionMode) {
      onComplete(active.transcript, active.screenshot, {
        onSuccess: (ticket) => {
          setPointers((prev) => [
            { id: ticket.id, title: ticket.title, description: ticket.description, type: ticket.type },
            ...prev,
          ]);
          setRecordings((prev) => prev.filter((r) => r.id !== activeId));
          setActiveRecordingId(null);
          setState("idle");
        },
        onError: () => {
          setErrorMessage("AI processing failed.");
          setState("error");
        },
      }, active.context ?? undefined);
      return;
    }
    try {
      const structured = await onComplete(active.transcript, active.screenshot);
      if (!structured) {
        setState("idle");
        return;
      }
      setRecordings((prev) =>
        prev.map((r) =>
          r.id === activeId ? { ...r, structuredOutput: structured } : r
        )
      );
      setPendingStructured(structured);
      setState("anticipation");
    } catch (err) {
      console.error(err);
      setErrorMessage("AI processing failed.");
      setState("error");
    }
  }, [onComplete, extensionMode]);

  /* Anticipation: 160ms pause then show result */
  useEffect(() => {
    if (state !== "anticipation" || !pendingStructured) return;
    const t = setTimeout(() => {
      setPointers((prev) => [
        {
          id: pendingStructured.id,
          title: pendingStructured.title,
          description: pendingStructured.description,
          type: pendingStructured.type,
        },
        ...prev,
      ]);
      setPendingStructured(null);
      setActiveRecordingId(null);
      setState("idle");
    }, 160);
    return () => clearTimeout(t);
  }, [state, pendingStructured]);

  const discardListening = useCallback(() => {
    recognitionRef.current?.stop();
    stopTimer();
    const activeId = activeRecordingIdRef.current;
    setRecordings((prev) => prev.filter((r) => r.id !== activeId));
    setActiveRecordingId(null);
    setState("idle");
  }, []);

  /* ================= SHARE ================= */

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {}
  }, []);

  /* ================= RESET ================= */

  const resetSession = useCallback(() => {
    setPointers([]);
    setRecordings([]);
    setActiveRecordingId(null);
    setState("idle");
    setExpandedId(null);
    setEditingId(null);
    setShowMenu(false);
  }, []);

  /* ================= CLICK OUTSIDE (menu only; no widget collapse in extension mode) ================= */

  useEffect(() => {
    if (extensionMode) return;
    const handleClickOutside = (event: any) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [extensionMode]);

  /* ================= POINTER ACTIONS ================= */

  const deletePointer = useCallback(async (id: string) => {
    try {
      await onDelete(id);
      setPointers((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }, [onDelete]);

  const startEditing = useCallback((p: StructuredFeedback) => {
    setEditingId(p.id);
    setEditedTitle(p.title);
    setEditedDescription(p.description);
  }, []);

  const saveEdit = useCallback(async (id: string) => {
    try {
      const res = await authFetch(`/api/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editedTitle,
          description: editedDescription,
        }),
      });
      const data = (await res.json()) as { success?: boolean; ticket?: { id: string; title: string; description: string; type?: string } };
      if (!res.ok || !data.success || !data.ticket) {
        console.error("PATCH ticket failed", data);
        return;
      }
      const t = data.ticket;
      setPointers((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, title: t.title, description: t.description, type: t.type ?? p.type }
            : p
        )
      );
      setEditingId(null);
    } catch (err) {
      console.error("Save edit failed:", err);
    }
  }, [editedTitle, editedDescription]);

  /* ================= ADD FEEDBACK (CAPTURE) ================= */

  /** Extension: full tab image via background chrome.tabs.captureVisibleTab. Used by region overlay to crop. */
  const getFullTabImage = useCallback((): Promise<string | null> => {
    if (typeof chrome !== "undefined" && chrome.runtime?.id) {
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type: "CAPTURE_TAB" }, (response: { success?: boolean; image?: string } | undefined) => {
          if (!response || !response.success) {
            reject(new Error("Capture failed"));
          } else {
            resolve(response.image ?? null);
          }
        });
      });
    }
    return Promise.resolve(null);
  }, []);

  /** Web (non-extension): full-page capture. Extension uses region overlay + getFullTabImage instead. */
  const captureScreenshot = useCallback(async (): Promise<string | null> => {
    if (typeof chrome !== "undefined" && chrome.runtime?.id) {
      return getFullTabImage();
    }
    const { captureScreenshot: webCapture } = await import("@/lib/capture");
    return webCapture();
  }, [getFullTabImage]);

  /** Extension only: called by RegionCaptureOverlay with cropped data URL and optional context. */
  const handleRegionCaptured = useCallback(
    (croppedDataUrl: string, context?: CaptureContext | null) => {
      const id = generateRecordingId();
      const newRecording: Recording = {
        id,
        screenshot: croppedDataUrl,
        transcript: "",
        structuredOutput: null,
        context: context ?? null,
        createdAt: Date.now(),
      };
      setRecordings((prev) => [...prev, newRecording]);
      setActiveRecordingId(id);
      startListening();
    },
    [startListening]
  );

  /** Extension only: cancel region capture mode (Escape or invalid selection). */
  const handleCancelCapture = useCallback(() => {
    setState("idle");
  }, []);

  const handleAddFeedback = useCallback(async () => {
    if (stateRef.current !== "idle") return;
    setIsOpen(true);
    setErrorMessage(null);
    recognitionRef.current?.stop();
    if (extensionMode) {
      setState("capturing");
      return;
    }
    setState("capturing");
    try {
      const image = await captureScreenshot();
      if (!image) {
        setState("idle");
        setErrorMessage("Capture cancelled.");
        return;
      }
      const id = generateRecordingId();
      const newRecording: Recording = {
        id,
        screenshot: image,
        transcript: "",
        structuredOutput: null,
        createdAt: Date.now(),
      };
      setRecordings((prev) => [...prev, newRecording]);
      setActiveRecordingId(id);
      startListening();
    } catch (err) {
      console.error(err);
      setErrorMessage("Screen capture failed.");
      setState("error");
    }
  }, [extensionMode, setIsOpen, captureScreenshot, startListening]);

  const handlers = useMemo(
    () => ({
      setIsOpen,
      toggleOpen,
      startDrag,
      handleShare,
      setShowMenu,
      resetSession,
      startListening,
      finishListening,
      discardListening,
      deletePointer,
      startEditing,
      saveEdit,
      setExpandedId,
      setEditedTitle,
      setEditedDescription,
      handleAddFeedback,
      handleRegionCaptured,
      handleCancelCapture,
      getFullTabImage,
    }),
    [
      setIsOpen,
      toggleOpen,
      startDrag,
      handleShare,
      resetSession,
      startListening,
      finishListening,
      discardListening,
      deletePointer,
      startEditing,
      saveEdit,
      handleAddFeedback,
      handleRegionCaptured,
      handleCancelCapture,
      getFullTabImage,
    ]
  );

  const derivedValues = useMemo(
    () => ({
      formatTime,
    }),
    [formatTime]
  );

  return {
    state: {
      isOpen,
      state,
      errorMessage,
      pointers,
      expandedId,
      editingId,
      editedTitle,
      editedDescription,
      showMenu,
      position,
      liveStructured,
    },
    handlers,
    derivedValues,
    refs: {
      widgetRef,
      menuRef,
    },
  };
}
