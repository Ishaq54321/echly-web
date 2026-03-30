import { authFetch } from "@/lib/authFetch";

export async function fetchBillingUsage() {
  const res = await authFetch("/api/billing/usage");
  if (res == null) throw new Error("Failed to fetch billing");

  if (!res.ok) throw new Error("Failed to fetch billing");

  const data = await res.json();

  return {
    maxSessions: data?.limits?.maxSessions ?? null,
    plan: data?.plan ?? null,
  };
}
