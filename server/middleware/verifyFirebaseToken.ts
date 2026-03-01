import { Request, Response, NextFunction } from "express";
import { verifyIdToken } from "../../lib/server/auth";

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

    console.log("✅ Token verified. UID:", decoded.uid);

    (req as any).user = decoded;
    next();
  } catch (error) {
    console.log("❌ Token verification failed.");
    console.log("Error:", error);

    return res.status(401).json({ error: "Unauthorized - Invalid token" });
  }
}
