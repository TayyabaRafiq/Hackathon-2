import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./lib/prisma.js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
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
    "http://localhost:3001", // fallback port
  ],
  session: {
    expiresIn: 7 * 24 * 60 * 60, // 7 days
    cookieCache: {
      enabled: true,
      maxAge: 7 * 24 * 60 * 60, // Match session expiry
    },
    cookie: {
      secure: false, // MUST be false for localhost
      sameSite: "lax",
    },
  },
});

export type Session = typeof auth.$Infer.Session;
