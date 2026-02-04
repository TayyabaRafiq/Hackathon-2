import "dotenv/config";
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import { errorHandler } from "./middleware/error.js";
import { authRateLimiter, apiRateLimiter } from "./middleware/rateLimit.js";
import taskRouter from "./routes/tasks.js";

const app = express();
const PORT = process.env.PORT || 8000;

// CORS configuration - allow both port 3000 and 3001 for development
const allowedOrigins = [
  process.env.CORS_ORIGIN || "http://localhost:3000",
  "http://localhost:3001",
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
    version: "1.0.0",
    endpoints: {
      health: "/health",
      auth: "/api/auth/*",
      tasks: "/api/tasks"
    }
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Task routes with rate limiting
app.use("/api/tasks", apiRateLimiter, taskRouter);

// Error handler (must be last)
app.use(errorHandler);

// Bind to localhost explicitly for Windows dev environment
const HOST = "127.0.0.1";
app.listen(Number(PORT), HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
