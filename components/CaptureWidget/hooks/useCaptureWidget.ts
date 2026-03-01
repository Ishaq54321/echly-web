"use client";

import { useEffect, useRef, useState } from "react";
import { getSessionFeedback } from "@/lib/feedback";
import type {
  StructuredFeedback,
  Recording,
  CaptureState,
  CaptureWidgetProps,
  Position,
} from "../types";

const SAFE_MARGIN = 24;

function generateRecordingId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `rec-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function useCaptureWidget({
  sessionId,
  initialPointers,
  onComplete,
  onDelete,
}: CaptureWidgetProps) {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [activeRecordingId, setActiveRecordingId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
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

  const dragOffset = useRef({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const activeRecordingIdRef = useRef<string | null>(null);
  const recordingsRef = useRef<Recording[]>(recordings);

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

  const startDrag = (e: React.MouseEvent) => {
    if (e.button !== 0 || !widgetRef.current) return;
    const rect = widgetRef.current.getBoundingClientRect();
    setIsDragging(true);
    document.body.style.userSelect = "none";
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setPosition({ x: rect.left, y: rect.top });
  };

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
      for (let i = 0; i < event.results.length; i++) {
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
    recognitionRef.current = recognition;
  }, []);

  /* ================= TIMER ================= */

  const startTimer = () => {
    setSeconds(0);
    timerRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => clearInterval(timerRef.current);

  const formatTime = () => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  /* ================= LISTEN ================= */

  const startListening = () => {
    try {
      recognitionRef.current?.start();
      setState("listening");
      startTimer();
    } catch (err) {
      console.error(err);
      setErrorMessage("Microphone permission denied.");
      setState("error");
    }
  };

  const finishListening = async () => {
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
    setState("processing");
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
  };

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

  const discardListening = () => {
    recognitionRef.current?.stop();
    stopTimer();
    const activeId = activeRecordingIdRef.current;
    setRecordings((prev) => prev.filter((r) => r.id !== activeId));
    setActiveRecordingId(null);
    setState("idle");
  };

  /* ================= SHARE ================= */

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {}
  };

  /* ================= RESET ================= */

  const resetSession = () => {
    setPointers([]);
    setRecordings([]);
    setActiveRecordingId(null);
    setState("idle");
    setExpandedId(null);
    setEditingId(null);
    setShowMenu(false);
  };

  /* ================= CLICK OUTSIDE ================= */

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= POINTER ACTIONS ================= */

  const deletePointer = async (id: string) => {
    try {
      await onDelete(id);
      setPointers((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const startEditing = (p: StructuredFeedback) => {
    setEditingId(p.id);
    setEditedTitle(p.title);
    setEditedDescription(p.description);
  };

  const saveEdit = (id: string) => {
    setPointers((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, title: editedTitle, description: editedDescription }
          : p
      )
    );
    setEditingId(null);
  };

  /* ================= ADD FEEDBACK (CAPTURE) ================= */

  const handleAddFeedback = async () => {
    if (state !== "idle") return;
    setErrorMessage(null);
    setState("capturing");
    try {
      const { captureScreenshot } = await import("@/lib/capture");
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
  };

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
    },
    handlers: {
      setIsOpen,
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
    },
    derivedValues: {
      formatTime,
    },
    refs: {
      widgetRef,
      menuRef,
    },
  };
}
