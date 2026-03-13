import { getUserByIdRepo } from "@/lib/repositories/usersRepository";

export async function requireAdmin(userId: string) {
  const user = await getUserByIdRepo(userId);

  // Debug logging for admin detection
  // eslint-disable-next-line no-console
  console.log("Checking admin:", userId, user?.isAdmin);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.isAdmin !== true) {
    throw new Error("User is not admin");
  }

  return user;
}

