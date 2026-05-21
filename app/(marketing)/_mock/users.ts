// Mock users for marketing demos. There is no formal lib/domain User type,
// so MockUser is defined here. Fields match what UserAvatar/Tag/Badge consume
// in product code (id, displayName, avatarUrl, role-ish label).

export interface MockUser {
  id: string;
  displayName: string;
  /** First name only — used in tight UI surfaces. */
  firstName: string;
  /** Empty string when mononymic — mirrors WorkspaceContextValue.lastName semantics. */
  lastName: string;
  /** External profile photo. null = render initials via UserAvatar. */
  avatarUrl: string | null;
  /** Free-text role label, shown in marketing demos to add character. Not from product schema. */
  role: string;
  /** Workspace association — Northwind team or external Loomly client. */
  org: "northwind-studio" | "loomly" | null;
  /** Used by UserAvatar to pick a stable color when avatarUrl is null. */
  colorSeed?: string;
}

export const mockMaya: MockUser = {
  id: "user_maya",
  displayName: "Maya Chen",
  firstName: "Maya",
  lastName: "Chen",
  avatarUrl: null,
  role: "Senior Designer",
  org: "northwind-studio",
  colorSeed: "maya-chen",
};

export const mockDaniel: MockUser = {
  id: "user_daniel",
  displayName: "Daniel Park",
  firstName: "Daniel",
  lastName: "Park",
  avatarUrl: null,
  role: "Frontend Developer",
  org: "northwind-studio",
  colorSeed: "daniel-park",
};

export const mockSarah: MockUser = {
  id: "user_sarah",
  displayName: "Sarah Vance",
  firstName: "Sarah",
  lastName: "Vance",
  avatarUrl: null,
  role: "Founder",
  org: "northwind-studio",
  colorSeed: "sarah-vance",
};

export const mockAlex: MockUser = {
  id: "user_alex",
  displayName: "Alex Rivera",
  firstName: "Alex",
  lastName: "Rivera",
  avatarUrl: null,
  role: "Designer",
  org: "northwind-studio",
  colorSeed: "alex-rivera",
};

export const mockJordan: MockUser = {
  id: "user_jordan",
  displayName: "Jordan Mills",
  firstName: "Jordan",
  lastName: "Mills",
  avatarUrl: null,
  role: "Marketing Director",
  org: "loomly",
  colorSeed: "jordan-mills",
};

export const mockNorthwindTeam: MockUser[] = [
  mockMaya,
  mockDaniel,
  mockSarah,
  mockAlex,
];

export const mockUsersById: Record<string, MockUser> = {
  user_maya: mockMaya,
  user_daniel: mockDaniel,
  user_sarah: mockSarah,
  user_alex: mockAlex,
  user_jordan: mockJordan,
};
