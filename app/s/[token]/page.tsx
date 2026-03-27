import type { Metadata } from "next";
import { headers } from "next/headers";
import { PublicShareSessionView } from "@/components/share/PublicShareSessionView";
import type { SanitizedPublicFeedback, SanitizedPublicSession } from "@/lib/server/publicShareSanitize";
import type { ResolvedPublicSharePermissions } from "@/lib/permissions/publicSharePermissions";

export const dynamic = "force-dynamic";

type PublicShareSuccess = {
  session: SanitizedPublicSession;
  feedback: SanitizedPublicFeedback[];
  permissions: ResolvedPublicSharePermissions;
  token: string;
};

type FetchResult =
  | { ok: true; data: PublicShareSuccess }
  | { ok: false; status: number };

async function absoluteOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const forwarded = h.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol =
    forwarded === "https" || forwarded === "http"
      ? forwarded
      : host.startsWith("localhost") || host.startsWith("127.0.0.1")
        ? "http"
        : "https";
  return `${protocol}://${host}`;
}

const fetchPublicShare = async (token: string): Promise<FetchResult> => {
  const origin = await absoluteOrigin();
  const path = `/api/public/share/${encodeURIComponent(token)}`;
  const res = await fetch(`${origin}${path}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    return { ok: false, status: res.status };
  }

  const data = (await res.json()) as PublicShareSuccess;
  return { ok: true, data };
};

type PageProps = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const raw = typeof token === "string" ? token.trim() : "";
  if (!raw) {
    return { title: "Shared session · Echly" };
  }
  const result = await fetchPublicShare(raw);
  if (result.ok && result.data.session?.title) {
    return { title: `${result.data.session.title} · Echly` };
  }
  return { title: "Shared session · Echly" };
}

function ShareErrorState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="max-w-md text-xl font-semibold tracking-tight text-neutral-900">{title}</h1>
      <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-neutral-500">{description}</p>
    </div>
  );
}

export default async function PublicSharePage({ params }: PageProps) {
  const { token } = await params;
  const rawToken = typeof token === "string" ? token.trim() : "";

  if (!rawToken) {
    return (
      <div className="min-h-full bg-[#FAFAFA]">
        <ShareErrorState
          title="Link not found"
          description="This share link is invalid or incomplete. Ask the owner for a new link."
        />
      </div>
    );
  }

  const result = await fetchPublicShare(rawToken);

  if (!result.ok) {
    return (
      <div className="min-h-full bg-[#FAFAFA]">
        {result.status === 404 ? (
          <ShareErrorState
            title="Link not found"
            description="This share link does not exist or the session was removed."
          />
        ) : result.status === 410 ? (
          <ShareErrorState
            title="Link expired"
            description="This share link is no longer active. Request a new link from the session owner."
          />
        ) : result.status === 403 ? (
          <ShareErrorState
            title="Access disabled"
            description="This shared view is no longer available for public access."
          />
        ) : (
          <ShareErrorState
            title="Something went wrong"
            description="We could not load this shared session. Try again in a moment."
          />
        )}
      </div>
    );
  }

  return (
    <PublicShareSessionView initial={{ ...result.data, token: rawToken }} />
  );
}
