"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { buildSttVocabularyPrompt } from "@/lib/sttVocabulary";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export interface UseVoiceRecordingOptions {
  onTranscribed: (transcript: string) => void;
  onError?: (error: string) => void;
  fetchClient?: (url: string, init?: RequestInit) => Promise<Response>;
}

export interface UseVoiceRecordingResult {
  isRecording: boolean;
  isTranscribing: boolean;
  error: string | null;
  duration: number;
  analyserNode: AnalyserNode | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  cancelRecording: () => void;
  reset: () => void;
}

function pickMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "audio/webm";
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  for (const t of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(t)) return t;
    } catch {
      // ignore
    }
  }
  return "audio/webm";
}

export function useVoiceRecording({
  onTranscribed,
  onError,
  fetchClient,
}: UseVoiceRecordingOptions): UseVoiceRecordingResult {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timerRef = useRef<number | null>(null);
  const cancelledRef = useRef(false);
  const mimeTypeRef = useRef<string>("audio/webm");
  // Bumped on every start/cleanup so an in-flight startRecording can detect it
  // has been superseded (e.g. StrictMode double-mount cleanup before
  // getUserMedia resolves) and abort assigning stale refs.
  const sessionRef = useRef(0);

  const callbacksRef = useRef({ onTranscribed, onError });
  useEffect(() => {
    callbacksRef.current = { onTranscribed, onError };
  }, [onTranscribed, onError]);

  const cleanupStream = useCallback(() => {
    // Invalidate any in-flight startRecording awaiting getUserMedia.
    sessionRef.current++;
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const stream = mediaStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch {
          // ignore
        }
      });
    }
    mediaStreamRef.current = null;
    const ctx = audioContextRef.current;
    if (ctx && ctx.state !== "closed") {
      ctx.close().catch(() => {
        // ignore
      });
    }
    audioContextRef.current = null;
    analyserRef.current = null;
    setAnalyserNode(null);
  }, []);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    cancelledRef.current = false;
    audioChunksRef.current = [];
    setDuration(0);

    const session = ++sessionRef.current;

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      const msg = "Microphone not supported in this browser.";
      setError(msg);
      callbacksRef.current.onError?.(msg);
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      const name = (err as { name?: string })?.name;
      const msg =
        name === "NotAllowedError" || name === "SecurityError"
          ? "Microphone permission denied."
          : "Could not access microphone.";
      setError(msg);
      callbacksRef.current.onError?.(msg);
      return;
    }

    // If a newer start (or cleanup) happened while awaiting getUserMedia,
    // drop this stream and bail without stomping the active recorder.
    if (session !== sessionRef.current) {
      stream.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch {
          // ignore
        }
      });
      return;
    }

    mediaStreamRef.current = stream;

    try {
      const AudioCtxCtor =
        (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
          .AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxCtor) throw new Error("AudioContext unavailable");

      const ctx = new AudioCtxCtor();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.85;
      const src = ctx.createMediaStreamSource(stream);
      src.connect(analyser);
      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      setAnalyserNode(analyser);
    } catch (err) {
      console.warn("AudioContext setup failed:", err);
      // Recording can still proceed without waveform — non-fatal.
    }

    const mimeType = pickMimeType();
    mimeTypeRef.current = mimeType;

    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, { mimeType });
    } catch {
      try {
        recorder = new MediaRecorder(stream);
        mimeTypeRef.current = recorder.mimeType || "audio/webm";
      } catch {
        const msg = "Recording not supported in this browser.";
        setError(msg);
        callbacksRef.current.onError?.(msg);
        cleanupStream();
        return;
      }
    }

    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
    };
    recorder.onerror = (e) => {
      console.warn("MediaRecorder error:", e);
    };

    try {
      recorder.start();
    } catch {
      const msg = "Failed to start recording.";
      setError(msg);
      callbacksRef.current.onError?.(msg);
      cleanupStream();
      return;
    }

    setIsRecording(true);

    const startedAt = Date.now();
    timerRef.current = window.setInterval(() => {
      setDuration(Math.floor((Date.now() - startedAt) / 1000));
    }, 250);
  }, [cleanupStream]);

  const stopRecording = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      cleanupStream();
      setIsRecording(false);
      return;
    }

    const stopped = new Promise<void>((resolve) => {
      recorder.onstop = () => {
        resolve();
      };
    });

    try {
      recorder.stop();
    } catch (err) {
      console.warn("Recorder stop failed:", err);
    }

    await stopped;

    setIsRecording(false);
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (cancelledRef.current) {
      cleanupStream();
      audioChunksRef.current = [];
      mediaRecorderRef.current = null;
      return;
    }

    const chunks = audioChunksRef.current;
    audioChunksRef.current = [];
    mediaRecorderRef.current = null;

    // Release mic/audio context as soon as we have the blob.
    cleanupStream();

    if (chunks.length === 0) {
      const msg = "No audio captured. Try again.";
      setError(msg);
      callbacksRef.current.onError?.(msg);
      return;
    }

    const mimeType = mimeTypeRef.current || "audio/webm";
    // Server only accepts audio/webm / audio/mp3 / audio/wav. Force webm
    // since browsers produce webm/opus by default; if MediaRecorder used a
    // different container (rare fallback), the upload may be rejected and
    // surface a clear error.
    const file = new File(chunks, "recording.webm", {
      type: mimeType.startsWith("audio/webm") ? "audio/webm" : mimeType,
    });

    if (file.size <= 0) {
      const msg = "No audio captured. Try again.";
      setError(msg);
      callbacksRef.current.onError?.(msg);
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      const msg = "Recording too long. Keep it under 10MB.";
      setError(msg);
      callbacksRef.current.onError?.(msg);
      return;
    }

    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      // No element context in the description editor — base UI vocabulary only.
      formData.append("prompt", buildSttVocabularyPrompt(null));
      const client = fetchClient ?? fetch;
      const res = await client("/api/transcribe-audio", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });

      let body: {
        data?: { transcript?: string };
        error?: { code?: string; message?: string };
      } = {};
      try {
        body = (await res.json()) as typeof body;
      } catch {
        body = {};
      }

      if (!res.ok) {
        const noSpeech =
          res.status === 400 && body?.error?.message === "NO_SPEECH_DETECTED";
        const msg = noSpeech
          ? "No speech detected. Try again."
          : "Transcription failed. Try again.";
        setError(msg);
        callbacksRef.current.onError?.(msg);
        return;
      }

      const transcript = body?.data?.transcript?.trim() ?? "";
      if (!transcript) {
        const msg = "No speech detected. Try again.";
        setError(msg);
        callbacksRef.current.onError?.(msg);
        return;
      }

      callbacksRef.current.onTranscribed(transcript);
    } catch (err) {
      console.error("Voice transcription failed:", err);
      const msg = "Transcription failed. Try again.";
      setError(msg);
      callbacksRef.current.onError?.(msg);
    } finally {
      setIsTranscribing(false);
    }
  }, [cleanupStream, fetchClient]);

  const cancelRecording = useCallback(() => {
    cancelledRef.current = true;
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      try {
        recorder.onstop = null;
        recorder.stop();
      } catch {
        // ignore
      }
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    cleanupStream();
    setIsRecording(false);
    setIsTranscribing(false);
    setDuration(0);
  }, [cleanupStream]);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        try {
          recorder.onstop = null;
          recorder.stop();
        } catch {
          // ignore
        }
      }
      mediaRecorderRef.current = null;
      audioChunksRef.current = [];
      if (timerRef.current != null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      cleanupStream();
    };
  }, [cleanupStream]);

  return {
    isRecording,
    isTranscribing,
    error,
    duration,
    analyserNode,
    startRecording,
    stopRecording,
    cancelRecording,
    reset,
  };
}
