import "server-only";

import "@/lib/server/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";

export const adminAuth = getAuth();
