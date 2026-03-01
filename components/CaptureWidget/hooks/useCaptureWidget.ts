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

export function useCaptureWidget({
  sessionId,
  extensionMode = false,
  initialPointers,
  onComplete,
  onDelete,
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

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    editingIdRef.current = editingId;
  }, [editingId]);

  /** Keep tray locked during capture → listen → process so it never collapses. */
  useEffect(() => {
    if (state === "capturing" || state === "listening" || state === "processing" || state === "anticipation") {
      trayLockedRef.current = true;
    } else {
      trayLockedRef.current = false;
    }
  }, [state]);

  /** Guarded setter: in extension mode or during capturing/listening/structuring/edit, do not close. */
  const setIsOpen = useCallback((next: boolean) => {
    if (next === false) {
      if (trayLockedRef.current) return;
      if (extensionMode) return;
      const s = stateRef.current;
      if (
        s === "capturing" ||
        s === "listening" ||
        s === "processing" ||
        s === "anticipation"
      )
        return;
      if (editingIdRef.current) return;
    }
    setIsOpenState(next);
  }, [extensionMode]);

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
  }, [onComplete]);

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

  /** Extension: capture via background chrome.tabs.captureVisibleTab. Web: lib/capture (no getDisplayMedia). */
  const captureScreenshot = async (): Promise<string | null> => {
    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
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
    const { captureScreenshot: webCapture } = await import("@/lib/capture");
    return webCapture();
  };

  const handleAddFeedback = useCallback(async () => {
    if (stateRef.current !== "idle") return;
    setIsOpen(true);
    setErrorMessage(null);
    // Stop recognition before screenshot; do NOT call setIsOpen(false), setCollapsed(true), or setVisible(false).
    recognitionRef.current?.stop();
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
  }, [setIsOpen, startListening]);

  const handlers = useMemo(
    () => ({
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
    }),
    [
      setIsOpen,
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
    },
    handlers,
    derivedValues,
    refs: {
      widgetRef,
      menuRef,
    },
  };
}
