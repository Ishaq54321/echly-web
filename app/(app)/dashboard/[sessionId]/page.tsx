import { redirect } from "next/navigation";

/** Legacy URL; canonical session board is `/session/:sessionId`. */
export default async function SessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  redirect(`/session/${sessionId}`);
}
