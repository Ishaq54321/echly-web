import type { PaymentProvider } from "./types";
import { StripeProvider } from "./stripe";

let _provider: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (_provider) return _provider;
  _provider = new StripeProvider();
  return _provider;
}

// Test/dev helper — allows injecting a mock provider for tests.
export function _setPaymentProvider(provider: PaymentProvider | null): void {
  _provider = provider;
}

export * from "./types";
