import "server-only";

export type IdentityType = "USER" | "NONE";

export type SystemContext = {
  userId: string | null;
  workspaceId: string | null;
  identityType: IdentityType;
};

export function buildSystemContext(params: {
  userId?: string | null;
  workspaceId?: string | null;
}): SystemContext {
  const { userId = null, workspaceId = null } = params;

  if (userId) {
    return {
      userId,
      workspaceId,
      identityType: "USER",
    };
  }

  return {
    userId: null,
    workspaceId: null,
    identityType: "NONE",
  };
}
