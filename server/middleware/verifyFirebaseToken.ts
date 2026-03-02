import { Request, Response, NextFunction } from "express";
import { verifyIdToken } from "../../lib/server/auth";
import type { RequestWithUser } from "../../lib/types";
import { log } from "../../lib/utils/logger";

export async function verifyFirebaseToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized - Missing token" });
  }

  const idToken = header.split("Bearer ")[1];

  try {
    const decoded = await verifyIdToken(idToken);

    log("Token verified. UID:", decoded.uid);

    (req as RequestWithUser).user = decoded;
    next();
  } catch (error) {
    log("Token verification failed.", error);
    return res.status(401).json({ error: "Unauthorized - Invalid token" });
  }
}
