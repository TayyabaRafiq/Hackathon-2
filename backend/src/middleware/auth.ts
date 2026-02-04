import { Request, Response, NextFunction } from "express";
import { auth } from "../auth.js";
import { AppError } from "../types/error.js";

/**
 * Middleware that requires authentication.
 * Extracts session from request headers/cookies via Better Auth.
 * Attaches user and session to request object.
 * Returns 401 if not authenticated.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as Record<string, string>,
    });

    if (!session || !session.user) {
      throw new AppError("UNAUTHORIZED", 401, "Authentication required");
    }

    // Attach user and session to request
    req.user = session.user as any;
    req.session = session.session as any;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError("UNAUTHORIZED", 401, "Authentication required"));
    }
  }
}
