import type { PaymentProvider } from "./types";
import { StripeProvider } from "./stripe";

let _provider: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (!_provider) {
    _provider = new StripeProvider();
  }
  return _provider;
}

export * from "./types";
