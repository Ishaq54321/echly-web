import "server-only";

export type IdentityType = "USER" | "SHARE" | "NONE";

export type SystemContext = {
  userId: string | null;
  workspaceId: string | null;
  identityType: IdentityType;
  shareToken: string | null;
};

export function buildSystemContext(params: {
  userId?: string | null;
  workspaceId?: string | null;
  shareToken?: string | null;
}): SystemContext {
  const { userId = null, workspaceId = null, shareToken = null } = params;

  if (userId) {
    return {
      userId,
      workspaceId,
      identityType: "USER",
      shareToken: null,
    };
  }

  if (shareToken) {
    return {
      userId: null,
      workspaceId: null,
      identityType: "SHARE",
      shareToken,
    };
  }

  return {
    userId: null,
    workspaceId: null,
    identityType: "NONE",
    shareToken: null,
  };
}
