import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./lib/prisma.js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // Railway uses PostgreSQL
  }),
  basePath: "/api/auth",
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    normalizeEmail: (email: string) => email.toLowerCase().trim(), // Normalize emails to lowercase
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [
    process.env.CORS_ORIGIN || "http://localhost:3000",
    "https://hackathon-2-b866.vercel.app", // Production frontend
    "http://localhost:3001", // fallback port
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://192.168.100.160:3000",
    "http://192.168.100.160:3001",
  ],
  session: {
    expiresIn: 7 * 24 * 60 * 60, // 7 days
    cookieCache: {
      enabled: true,
      maxAge: 7 * 24 * 60 * 60, // Match session expiry
    },
    cookie: {
      // Use secure cookies in production (HTTPS), false for localhost
      secure: process.env.NODE_ENV === "production",
      // Use "none" for cross-domain in production, "lax" for localhost
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      // Don't set domain - let browser handle it automatically
    },
  },
});

export type Session = typeof auth.$Infer.Session;
