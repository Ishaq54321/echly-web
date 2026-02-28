"use client";

import AudioWaveform from "@/components/AudioWaveform";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { getSessionFeedback } from "@/lib/feedback";

import {
  Pencil,
  Trash2,
  Expand,
  MoreVertical,
  X,
  Share2,
  Check,
} from "lucide-react";

type StructuredFeedback = {
  id: string;
  title: string;
  description: string;
  type: string;
};

type Props = {
  sessionId: string;
  userId: string;
  initialPointers?: StructuredFeedback[];
  onComplete: (
    transcript: string,
    screenshot: string | null
  ) => Promise<StructuredFeedback>;
  onDelete: (id: string) => Promise<void>;
};

export default function CaptureWidget({
  sessionId,
  userId,
  initialPointers,
  onComplete,
  onDelete,
}: Props) {
  const SAFE_MARGIN = 24;

const [pendingScreenshot, setPendingScreenshot] = useState<string | null>(null);

  const [isOpen, setIsOpen] = useState(false);
type CaptureState =
  | "idle"
  | "capturing"
  | "listening"
  | "processing"
  | "error";

const [state, setState] = useState<CaptureState>("idle");
const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [pointers, setPointers] = useState<StructuredFeedback[]>(
    initialPointers ?? []
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

    setPosition({
      x: rect.left,
      y: rect.top,
    });
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
      setTranscript(text);
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
    setTranscript("");
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

  if (!transcript.trim()) {
    setState("idle");
    return;
  }

  setState("processing");

  try {
    const structured = await onComplete(transcript, pendingScreenshot);

    setPointers((prev) => [
      {
        id: structured.id,
        title: structured.title,
        description: structured.description,
        type: structured.type,
      },
      ...prev,
    ]);

    setPendingScreenshot(null);
    setTranscript("");
    setState("idle");
  } catch (err) {
    console.error(err);
    setErrorMessage("AI processing failed.");
    setState("error");
  }
};

const discardListening = () => {
  recognitionRef.current?.stop();
  stopTimer();
  setTranscript("");
  setPendingScreenshot(null);
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
  setTranscript("");
  setPendingScreenshot(null);
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

  /* ================= FLOATING BUTTON ================= */

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-10 right-10 z-50
                   flex items-center gap-4
                   bg-white border border-slate-200
                   px-8 py-4 rounded-full
                   shadow-[0_12px_40px_rgba(0,0,0,0.12)]
                   text-slate-900 font-medium tracking-tight
                   transition-all duration-200 hover:shadow-lg"
      >
        <Image src="/Echly_logo.svg" alt="Echly" width={26} height={26} />
        Capture Feedback
      </button>
    );
  }

  return (
    <div
  ref={widgetRef}
  className={`fixed z-50 w-[480px] transition-all duration-200 ${
    position ? "" : "bottom-10 right-10"
  }`}
  style={position ? { left: position.x, top: position.y } : undefined}
>
    
      <div className="bg-white rounded-3xl
                      border border-slate-200
                      shadow-[0_25px_60px_rgba(0,0,0,0.14)]
                      overflow-hidden font-sans">
        {/* HEADER (DRAG HANDLE) */}
        <div
          onMouseDown={startDrag}
          className="px-6 py-5 flex justify-between items-center border-b border-slate-100 cursor-move"
        >
          <div className="flex items-center gap-3">
            <Image src="/Echly_logo.svg" alt="Echly" width={28} height={28} />
            <span className="text-lg font-semibold text-slate-900">
              Echly
            </span>
          </div>

          <div className="flex items-center gap-2 relative" ref={menuRef}>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-2 rounded-lg
                         text-sm font-medium text-slate-600
                         hover:bg-slate-100 transition"
            >
              <Share2 size={14} />
              Share
            </button>

            <button
              onClick={() => setShowMenu((p) => !p)}
              className="p-2 rounded-lg hover:bg-slate-100 transition"
            >
              <MoreVertical size={18} className="text-slate-500" />
            </button>

            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-100 transition"
            >
              <X size={18} className="text-slate-500" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-12
                              bg-white border border-slate-200
                              rounded-xl shadow-md w-56 py-2">
                <button
                  onClick={resetSession}
                  className="w-full text-left px-4 py-2 text-sm
                             hover:bg-slate-50 text-rose-600 transition"
                >
                  Reset Feedback Session
                </button>
              </div>
            )}
          </div>
        </div>

        

        {/* BODY */}
        <div className="p-6 flex flex-col gap-5 max-h-[60vh] overflow-y-auto">

          {pointers.map((p) => {
            const isExpanded = expandedId === p.id;
            const isEditing = editingId === p.id;

            return (
              <div
                key={p.id}
                className="border border-slate-200 rounded-2xl bg-white px-5 py-5 transition-all duration-200"
              >
                <div className="flex justify-between gap-4">
                  <div className="flex-1">
                    {isEditing ? (
                      <>
                        <input
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          className="w-full mb-3 px-3 py-2
                                     bg-white text-slate-900
                                     border border-slate-300
                                     rounded-lg text-sm font-medium
                                     focus:ring-2 focus:ring-rose-500
                                     outline-none transition"
                        />
                        <textarea
                          value={editedDescription}
                          onChange={(e) =>
                            setEditedDescription(e.target.value)
                          }
                          rows={3}
                          className="w-full px-3 py-2
                                     bg-white text-slate-800
                                     border border-slate-300
                                     rounded-lg text-sm
                                     focus:ring-2 focus:ring-rose-500
                                     outline-none transition resize-none"
                        />
                      </>
                    ) : (
                      <>
                        <h3 className="text-sm font-semibold text-slate-900">
                          {p.title}
                        </h3>

                        {isExpanded && (
                          <p className="text-xs text-slate-600 mt-2">
                            {p.description}
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex items-start gap-3 text-slate-400">
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : p.id)
                      }
                      className="hover:text-slate-700 transition"
                    >
                      <Expand size={16} />
                    </button>

                    {isEditing ? (
  <button
    onClick={() => saveEdit(p.id)}
    className="hover:text-emerald-600 transition"
  >
    <Check size={16} />
  </button>
) : (
                      <button
                        onClick={() => startEditing(p)}
                        className="hover:text-slate-700 transition"
                      >
                        <Pencil size={16} />
                      </button>
                    )}

                    <button
                      onClick={() => deletePointer(p.id)}
                      className="hover:text-rose-600 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {state === "processing" && (
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
              Structuring your feedback...
            </div>
          )}

          {state === "listening" && (
            <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50">
              <div className="flex justify-between mb-4">
                <span className="text-sm font-medium text-slate-800">
                  Listening...
                </span>
                <span className="text-sm text-slate-500">
                  {formatTime()}
                </span>
              </div>

              <div className="mb-5">
                <AudioWaveform isActive={state === "listening"} />
              </div>

              <div className="flex justify-between">
                <button
                  onClick={discardListening}
                  className="text-sm text-slate-600 hover:text-slate-900 transition"
                >
                  Cancel
                </button>

                <button
                  onClick={finishListening}
                  className="bg-gradient-to-r from-rose-600 to-red-600
                             hover:opacity-95
                             text-white px-5 py-2
                             rounded-lg text-sm font-medium transition"
                >
                  Done
                </button>
              </div>
            </div>
          )}

        {errorMessage && (
  <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-4 py-3">
    {errorMessage}
  </div>
)}

 {state === "idle" && (
            <button
  onClick={async () => {
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

    setPendingScreenshot(image);
    startListening();
  } catch (err) {
    console.error(err);
    setErrorMessage("Screen capture failed.");
    setState("error");
  }
}}
  className={`w-full px-6 py-4 rounded-2xl text-sm font-semibold tracking-tight transition
  ${
    state !== "idle"
      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
      : "bg-gradient-to-r from-rose-600 to-red-600 text-white hover:opacity-95"
  }`}
>

  + Add Feedback
</button>
          )}
        </div>
            </div>

      
    </div>
  );
}