import type { PaymentProvider } from "./types";
import { PaddleProvider } from "./paddle";

let _provider: PaymentProvider | null = null;

const PROVIDER_NAME = process.env.PAYMENT_PROVIDER ?? "paddle";

export function getPaymentProvider(): PaymentProvider {
  if (_provider) return _provider;

  // Paddle provider is the only supported provider going forward.
  // Construction is cheap — the SDK is lazily initialized in getPaddle().
  if (PROVIDER_NAME === "paddle") {
    _provider = new PaddleProvider();
    return _provider;
  }

  throw new Error(`[billing] Unknown payment provider: ${PROVIDER_NAME}`);
}

// Test/dev helper — Phase C2 will register the real PaddleProvider here.
export function _setPaymentProvider(provider: PaymentProvider | null): void {
  _provider = provider;
}

export * from "./types";
