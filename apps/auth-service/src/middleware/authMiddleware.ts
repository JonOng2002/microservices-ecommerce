import { getAuth } from "@clerk/express";
import { Request, Response, NextFunction } from "express";
import { CustomJwtSessionClaims } from "@repo/types";
import clerkClient from "../utils/clerk";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const shouldBeUser = async (  // Change to async
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let auth = getAuth(req);
    let userId = auth.userId;

    // If no userId from session, try Bearer token
    if (!userId && req.headers.authorization?.startsWith('Bearer ')) {
      const token = req.headers.authorization.substring(7);
      try {
        const payload = await clerkClient.verifyToken(token);
        userId = payload.sub;
      } catch (error) {
        console.error("Token verification failed:", error);
      }
    }

    if (!userId) {
      return res.status(401).json({ message: "You are not logged in!" });
    }

    req.userId = userId;
    return next();
  } catch (error) {
    console.error("Auth debug - Error in shouldBeUser middleware:", error);
    return res.status(401).json({ message: "You are not logged in!" });
  }
};


export const shouldBeAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const auth = getAuth(req);
  const userId = auth.userId;

  if (!userId) {
    return res.status(401).json({ message: "You are not logged in!" });
  }

  const claims = auth.sessionClaims as CustomJwtSessionClaims;

  if (claims.metadata?.role !== "admin") {
    return res.status(403).send({ message: "Unauthorized!" });
  }

  req.userId = auth.userId;

  return next();
};
