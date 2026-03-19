export async function fetchBillingUsage() {
  const res = await fetch("/api/billing/usage", {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch billing");

  const data = await res.json();

  return {
    maxSessions: data?.limits?.maxSessions ?? null,
    plan: data?.plan ?? null,
  };
}
