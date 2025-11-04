import { getAuth } from "@clerk/express";
import { Request, Response, NextFunction } from "express";
import { CustomJwtSessionClaims } from "@repo/types";
import clerkClient from "../utils/clerk.js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const shouldBeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // ADD THIS - Log everything at the start
    console.log("🔵 ===== Middleware called =====");
    console.log("🔵 URL:", req.url);
    console.log("🔵 Method:", req.method);
    console.log("🔵 Authorization header exists:", !!req.headers.authorization);
    console.log("🔵 Authorization header value:", req.headers.authorization?.substring(0, 50) || "NONE");
    
    let auth = getAuth(req);
    let userId = auth.userId;
    
    console.log("🔵 getAuth returned userId:", userId);
    console.log("🔵 Condition check - !userId:", !userId);
    console.log("🔵 Condition check - auth header starts with Bearer:", req.headers.authorization?.startsWith('Bearer '));

    // If no userId from session, try Bearer token
    if (!userId && req.headers.authorization?.startsWith('Bearer ')) {
      const token = req.headers.authorization.substring(7);
      
      console.log("🔍 DEBUG - Attempting manual token verification");
      console.log("Token (first 20 chars):", token.substring(0, 20));
      console.log("Token length:", token.length);
      
      try {
        // The token from getToken() is a session token (JWT)
        // Use authenticateRequest with a request-like object
        // Clerk's authenticateRequest expects headers as a Headers object or plain object
        const mockRequest = {
          headers: {
            get: (name: string) => {
              if (name.toLowerCase() === 'authorization') {
                return `Bearer ${token}`;
              }
              return null;
            },
          },
          url: req.url,
          method: req.method,
        } as any;
        
        const authResult = await clerkClient.authenticateRequest(mockRequest);
        const auth = authResult.toAuth();
        
        if (auth && auth.userId) {
          userId = auth.userId;
          console.log("✅ Token verified via authenticateRequest, userId:", userId);
        } else {
          console.log("⚠️ authenticateRequest returned not authenticated");
        }
      } catch (error: any) {
        console.error("❌ Token verification failed:", error.message);
        console.error("Error name:", error.name);
        console.error("Error stack:", error.stack?.substring(0, 200));
        
        // Check if it's a token expiration error
        if (error.message?.includes('expired') || error.message?.includes('Expired')) {
          console.error("⚠️ Token has expired - user needs to refresh");
        }
      }
    } else {
      console.log("🔵 Skipped Bearer token check because:");
      console.log("  - userId exists:", !!userId);
      console.log("  - auth header missing:", !req.headers.authorization);
      console.log("  - auth header doesn't start with Bearer:", !req.headers.authorization?.startsWith('Bearer '));
    }

    if (!userId) {
      console.log("❌ Auth debug - No userId found. Auth object:", {
        userId: auth.userId,
        sessionId: auth.sessionId,
      });
      console.log("❌ Auth debug - Request headers authorization:", req.headers.authorization ? "Present" : "Missing");
      return res.status(401).json({ message: "You are not logged in!" });
    }

    req.userId = userId;
    return next();
  } catch (error: any) {
    console.error("❌ Auth debug - Error in shouldBeUser middleware:", error);
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
