import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

// Rate limiter for auth endpoints (stricter)
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute per IP
  message: {
    code: "TOO_MANY_REQUESTS",
    message: "Too many requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for API endpoints (more lenient)
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  message: {
    code: "TOO_MANY_REQUESTS",
    message: "Too many requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for chat endpoints
 * Limit: 30 requests per minute per user
 */
export const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per window
  standardHeaders: true,
  legacyHeaders: false,

  // Use user ID from route params as key
  keyGenerator: (req: Request) => {
    const userId = req.params.userId;
    return userId || req.ip || "anonymous";
  },

  // Custom handler for rate limit exceeded
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many requests. Please try again in a minute.",
      code: "RATE_LIMIT_EXCEEDED",
      retryAfter: 60,
    });
  },

  // Skip rate limiting in test mode
  skip: (req: Request) => {
    return process.env.NODE_ENV === "test";
  },
});

/**
 * Rate limiter for MCP tool endpoints
 * Limit: 60 requests per minute per user (higher for AI tool calls)
 */
export const mcpRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per window
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req: Request) => {
    const userId = req.body?.user_id;
    return userId || req.ip || "anonymous";
  },

  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: "Too many tool requests. Please slow down.",
      code: "RATE_LIMIT_EXCEEDED",
    });
  },

  skip: (req: Request) => {
    return process.env.NODE_ENV === "test";
  },
});
