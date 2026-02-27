// Load .env only in development (Railway provides env vars directly)
if (process.env.NODE_ENV !== "production") {
  await import("dotenv/config");
}

import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import { errorHandler } from "./middleware/error.js";
import { authRateLimiter, apiRateLimiter } from "./middleware/rateLimit.js";
import taskRouter from "./routes/tasks.js";
import chatRouter from "./routes/chat.js";
import mcpRouter from "./routes/mcp.js";

const app = express();
const PORT = process.env.PORT || 8000;

// CORS configuration - allow both port 3000 and 3001 for development
// Support localhost, 127.0.0.1, network IP, production frontend, and Railway backend
const allowedOrigins = [
  process.env.CORS_ORIGIN || "http://localhost:3000",
  "https://hackathon-2-b866.vercel.app", // Production Vercel frontend
  "https://fabulous-delight-production-c710.up.railway.app", // Railway backend
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://192.168.100.160:3000",
  "http://192.168.100.160:3001",
];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like curl) or from allowed origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"],
  })
);

// Better Auth handler - must be before JSON body parser for /api/auth routes
// Apply stricter rate limiting to auth endpoints
app.use("/api/auth", authRateLimiter);
app.use("/api/auth", toNodeHandler(auth));

// JSON body parser
app.use(express.json());

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "TodoFlow API",
    version: "2.0.0", // Phase-3: AI Chatbot
    endpoints: {
      health: "/health",
      auth: "/api/auth/*",
      tasks: "/api/tasks",
      chat: "/api/chat/:userId",
      conversations: "/api/conversations/:userId"
    }
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Task routes with rate limiting
app.use("/api/tasks", apiRateLimiter, taskRouter);

// Chat routes (Phase-3) with rate limiting
app.use(apiRateLimiter, chatRouter);

// MCP tool routes (Phase-3) - called by AI service
app.use("/mcp", mcpRouter);

// Error handler (must be last)
app.use(errorHandler);

// Global error handlers for Railway
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Bind to 0.0.0.0 for production (Railway), 127.0.0.1 for local dev
const HOST = process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1";
const server = app.listen(Number(PORT), HOST, () => {
  console.log(`✅ Server running on http://${HOST}:${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`✅ Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

export default app;
