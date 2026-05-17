"use client";

import {
  initializePaddle,
  type Paddle,
  type PaddleEventData,
} from "@paddle/paddle-js";
import { useEffect, useRef, useState } from "react";

// Module-level singleton — avoids double-init across concurrent mounts.
let paddlePromise: Promise<Paddle | undefined> | null = null;

// Active event listeners (registered by hook instances). Paddle.js exposes a
// single global eventCallback, so we fan it out to every surface that mounted
// usePaddle with an onEvent handler.
const eventListeners = new Set<(event: PaddleEventData) => void>();

function dispatchEvent(event: PaddleEventData) {
  eventListeners.forEach((listener) => {
    try {
      listener(event);
    } catch (err) {
      console.error("[paddle event listener error]", err);
    }
  });
}

function getPaddleSingleton(): Promise<Paddle | undefined> {
  if (paddlePromise) return paddlePromise;

  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  const environment =
    process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "production"
      ? "production"
      : "sandbox";

  if (!token) {
    console.error("[paddle] NEXT_PUBLIC_PADDLE_CLIENT_TOKEN not set");
    paddlePromise = Promise.resolve(undefined);
    return paddlePromise;
  }

  paddlePromise = initializePaddle({
    environment,
    token,
    eventCallback: dispatchEvent,
  });

  return paddlePromise;
}

export interface UsePaddleOptions {
  onEvent?: (event: PaddleEventData) => void;
}

export function usePaddle(options?: UsePaddleOptions): {
  paddle: Paddle | undefined;
  ready: boolean;
} {
  const [paddle, setPaddle] = useState<Paddle | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const optionsRef = useRef(options);

  // Keep the latest options without re-subscribing the event listener.
  // Mutating refs during render is disallowed — do it in an effect.
  useEffect(() => {
    optionsRef.current = options;
  });

  useEffect(() => {
    let cancelled = false;
    getPaddleSingleton().then((instance) => {
      if (cancelled) return;
      setPaddle(instance);
      setReady(!!instance);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Subscribe to Paddle events via the shared dispatcher. The ref indirection
  // keeps the listener identity stable so we register exactly once.
  useEffect(() => {
    const listener = (event: PaddleEventData) => {
      optionsRef.current?.onEvent?.(event);
    };
    eventListeners.add(listener);
    return () => {
      eventListeners.delete(listener);
    };
  }, []);

  return { paddle, ready };
}
