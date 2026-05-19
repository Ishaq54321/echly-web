// DEV-ONLY email preview route. Renders V2 email components with placeholder
// data so the new visual infrastructure can be eyeballed in a browser without
// sending real email. Hard-gated: returns 404 when NODE_ENV === "production".
//
// Path is the literal /dev/... segment (NOT a route group) so the URL matches
// the documented path. Visit e.g. http://localhost:3000/dev/email-preview/welcome
// Templates: test (= welcome), welcome, payment-receipt, payment-failed.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  emailShellV2,
  emailCardV2,
  emailButtonV2,
  emailInfoRowV2,
  emailDividerV2,
  emailSpacerV2,
  EMAIL_COLORS,
  EMAIL_SIZES,
} from "@/lib/email/components";

export const dynamic = "force-dynamic";

const H1 = (text: string) =>
  `<tr><td style="font-size:20px;font-weight:600;color:${EMAIL_COLORS.textPrimary};line-height:1.3;padding:0 0 12px 0;">${text}</td></tr>`;

const P = (html: string) =>
  `<tr><td style="font-size:${EMAIL_SIZES.bodyFontSize}px;color:${EMAIL_COLORS.textPrimary};line-height:${EMAIL_SIZES.bodyLineHeight};padding:0 0 16px 0;">${html}</td></tr>`;

function welcome(): string {
  return emailShellV2({
    preheader: "Welcome to Annote — capture feedback in a click.",
    content: emailCardV2({
      content: `
        ${H1("Welcome to Annote")}
        ${P("Hey Test, thanks for signing up. Annote lets you capture visual feedback on any site in a single click — no back-and-forth, no screenshots pasted into docs.")}
        ${P("Install the extension and leave your first piece of feedback to see how it works.")}
        ${emailSpacerV2({ height: 8 })}
        <tr><td>${emailButtonV2({ label: "Get started", href: "https://annote.ai" })}</td></tr>
      `,
    }),
  });
}

function paymentReceipt(): string {
  return emailShellV2({
    preheader: "Your Annote receipt — $120.00",
    content:
      emailCardV2({
        content: `
          ${H1("Payment receipt")}
          ${P("Thanks for your payment. Here are the details for your records.")}
          ${emailInfoRowV2({ label: "Receipt number", value: "ANN-2026-00481", mono: true })}
          ${emailInfoRowV2({ label: "Invoice number", value: "INV-9F2A1C", mono: true })}
          ${emailInfoRowV2({ label: "Payment method", value: "Visa ending 4242" })}
          ${emailDividerV2()}
          ${emailInfoRowV2({ label: "Amount paid", value: "$120.00", mono: true })}
        `,
      }) +
      emailSpacerV2({ height: 16 }) +
      emailCardV2({
        content: `
          ${P("Manage your subscription or download past invoices any time from billing settings.")}
          <tr><td>${emailButtonV2({ label: "Open billing settings", href: "https://annote.ai", align: "full" })}</td></tr>
        `,
      }),
  });
}

function paymentFailed(): string {
  return emailShellV2({
    preheader: "We couldn't charge your card",
    content: emailCardV2({
      content: `
        ${H1("We couldn't charge your card")}
        ${P("Your latest payment for <strong>Acme Workspace</strong> didn't go through. This usually means the card has expired or hit its limit.")}
        ${P("Update your payment method to keep your workspace on Business.")}
        ${emailSpacerV2({ height: 8 })}
        <tr><td>${emailButtonV2({ label: "Update payment method", href: "https://annote.ai", align: "full" })}</td></tr>
      `,
    }),
  });
}

const TEMPLATES: Record<string, () => string> = {
  test: welcome,
  welcome,
  "payment-receipt": paymentReceipt,
  "payment-failed": paymentFailed,
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ template: string }> }
) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not available in production", { status: 404 });
  }

  const { template } = await params;
  const render = TEMPLATES[template];

  if (!render) {
    const available = Object.keys(TEMPLATES).join(", ");
    return new NextResponse(
      `Unknown template "${template}". Available: ${available}`,
      { status: 404 }
    );
  }

  return new NextResponse(render(), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
