import type { User } from "firebase/auth";
import { ensureUserRepo } from "@/lib/repositories/usersRepository";

export async function saveUserToFirestore(user: User | null) {
  if (!user) return;
  await ensureUserRepo(user);
}