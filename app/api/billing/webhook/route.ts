import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { getPaymentProvider } from "@/lib/billing/payments";
import { sendSubscriptionConfirmationEmail } from "@/lib/email/billingEmails";
import { sendSubscriptionCancelledEmail } from "@/lib/email/billingEmails";
import { sendPaymentFailedEmail } from "@/lib/email/billingEmails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getOwnerEmail(workspaceId: string): Promise<string | null> {
  try {
    const wsSnap = await adminDb.doc(`workspaces/${workspaceId}`).get();
    if (!wsSnap.exists) return null;
    const ws = wsSnap.data() as { ownerId?: string } | undefined;
    if (!ws?.ownerId) return null;
    const userSnap = await adminDb.doc(`users/${ws.ownerId}`).get();
    if (!userSnap.exists) return null;
    const u = userSnap.data() as { email?: string } | undefined;
    return u?.email ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  let event: { type: string; data: Record<string, unknown> };
  try {
    const provider = getPaymentProvider();
    event = await provider.parseWebhookEvent(body, signature);
  } catch (err) {
    console.error("[billing/webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const provider = getPaymentProvider();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data as {
          subscription?: string;
          customer?: string;
          metadata?: { workspaceId?: string };
        };
        const subscriptionId = session.subscription;
        if (!subscriptionId) break;

        const resolvedWorkspaceId = session.metadata?.workspaceId;
        if (!resolvedWorkspaceId) {
          console.error("[billing/webhook] checkout.session.completed: cannot resolve workspaceId");
          break;
        }

        const sub = await provider.getSubscriptionData(subscriptionId);
        const wsRef = adminDb.doc(`workspaces/${resolvedWorkspaceId}`);
        const wsSnap = await wsRef.get();
        if (!wsSnap.exists) break;

        const existing = (wsSnap.data() as { billing?: { plan?: string } } | undefined)?.billing?.plan;
        if (existing === "business" || existing === "enterprise") {
          // Idempotent — already upgraded
          break;
        }

        await wsRef.update({
          "billing.plan": "business",
          "billing.stripeCustomerId": sub.customerId,
          "billing.stripeSubscriptionId": sub.subscriptionId,
          "billing.seats": sub.seatCount,
          "billing.billingCycle": sub.billingCycle,
          "billing.suspended": false,
          updatedAt: FieldValue.serverTimestamp(),
        });

        const ownerEmail = await getOwnerEmail(resolvedWorkspaceId);
        const wsData = wsSnap.data() as { name?: string } | undefined;
        if (ownerEmail) {
          await sendSubscriptionConfirmationEmail({
            to: ownerEmail,
            workspaceName: wsData?.name ?? "Your workspace",
            seatCount: sub.seatCount,
            billingCycle: sub.billingCycle,
            nextBillingDate: sub.currentPeriodEnd,
          });
        }

        await adminDb.collection("adminLogs").add({
          adminId: "stripe-webhook",
          action: "subscription_activated",
          workspaceId: resolvedWorkspaceId,
          metadata: { subscriptionId: sub.subscriptionId, seatCount: sub.seatCount },
          timestamp: FieldValue.serverTimestamp(),
        });
        break;
      }

      case "customer.subscription.updated": {
        const subData = event.data as {
          id?: string;
          metadata?: { workspaceId?: string };
          cancel_at_period_end?: boolean;
        };
        const subscriptionId = subData.id;
        if (!subscriptionId) break;

        const sub = await provider.getSubscriptionData(subscriptionId);

        // Find workspace by subscriptionId
        const wsSnap = await adminDb
          .collection("workspaces")
          .where("billing.stripeSubscriptionId", "==", subscriptionId)
          .limit(1)
          .get();

        if (wsSnap.empty) break;
        const wsRef = wsSnap.docs[0].ref;

        await wsRef.update({
          "billing.seats": sub.seatCount,
          "billing.billingCycle": sub.billingCycle,
          "billing.suspended": sub.status === "past_due",
          updatedAt: FieldValue.serverTimestamp(),
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subData = event.data as { id?: string };
        const subscriptionId = subData.id;
        if (!subscriptionId) break;

        const wsSnap = await adminDb
          .collection("workspaces")
          .where("billing.stripeSubscriptionId", "==", subscriptionId)
          .limit(1)
          .get();

        if (wsSnap.empty) break;
        const wsRef = wsSnap.docs[0].ref;
        const wsDocData = wsSnap.docs[0].data() as { name?: string } | undefined;
        const workspaceId = wsSnap.docs[0].id;

        await wsRef.update({
          "billing.plan": "starter",
          "billing.seats": 1,
          "billing.stripeSubscriptionId": null,
          "billing.billingCycle": "monthly",
          updatedAt: FieldValue.serverTimestamp(),
        });

        const ownerEmail = await getOwnerEmail(workspaceId);
        if (ownerEmail) {
          await sendSubscriptionCancelledEmail({
            to: ownerEmail,
            workspaceName: wsDocData?.name ?? "Your workspace",
          });
        }

        await adminDb.collection("adminLogs").add({
          adminId: "stripe-webhook",
          action: "subscription_cancelled",
          workspaceId,
          metadata: { subscriptionId },
          timestamp: FieldValue.serverTimestamp(),
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data as {
          subscription?: string;
          customer?: string;
          customer_email?: string;
          hosted_invoice_url?: string;
        };
        const subscriptionId = invoice.subscription;
        if (!subscriptionId) break;

        const wsSnap = await adminDb
          .collection("workspaces")
          .where("billing.stripeSubscriptionId", "==", subscriptionId)
          .limit(1)
          .get();

        const ownerEmail = invoice.customer_email ?? null;
        const workspaceId = wsSnap.empty ? null : wsSnap.docs[0].id;
        const wsDocData = wsSnap.empty
          ? null
          : (wsSnap.docs[0].data() as { name?: string } | undefined);

        const resolvedEmail = ownerEmail ?? (workspaceId ? await getOwnerEmail(workspaceId) : null);
        if (resolvedEmail) {
          const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://echly.com"}/settings?tab=billing`;
          await sendPaymentFailedEmail({
            to: resolvedEmail,
            workspaceName: wsDocData?.name ?? "Your workspace",
            portalUrl,
          });
        }

        if (workspaceId) {
          await adminDb.doc(`workspaces/${workspaceId}`).update({
            "billing.suspended": true,
          });
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data as { subscription?: string };
        const subscriptionId = invoice.subscription;
        if (!subscriptionId) break;

        const wsSnap = await adminDb
          .collection("workspaces")
          .where("billing.stripeSubscriptionId", "==", subscriptionId)
          .limit(1)
          .get();

        if (!wsSnap.empty) {
          await wsSnap.docs[0].ref.update({
            "billing.suspended": false,
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error(`[billing/webhook] error handling ${event.type}:`, err);
    // Still return 200 so Stripe doesn't retry
  }

  return NextResponse.json({ received: true });
}
