import { authFetch } from "@/lib/authFetch";

export async function fetchBillingUsage() {
  const res = await authFetch("/api/billing/usage");
  if (res == null) throw new Error("Failed to fetch billing");
  if (!res.ok) throw new Error("Failed to fetch billing");

  const envelope = await res.json();
  const data = envelope?.data ?? {};

  return {
    plan: data.plan ?? null,
    feedbackTicketsUsed: data.feedbackTicketsUsed ?? 0,
    feedbackTicketsLimit: data.feedbackTicketsLimit ?? null,
    seats: data.seats ?? 1,
  };
}
