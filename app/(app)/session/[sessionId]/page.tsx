import SessionPageClient from "@/app/(app)/dashboard/[sessionId]/SessionPageClient";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return <SessionPageClient sessionId={sessionId} />;
}
