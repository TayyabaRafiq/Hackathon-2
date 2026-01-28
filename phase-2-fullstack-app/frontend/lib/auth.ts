import { createAuthClient } from "better-auth/react";

// Better Auth client expects the base URL without /api/auth path
// It adds the basePath automatically
const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000";

console.log("Auth client BASE_URL:", BASE_URL);

export const authClient = createAuthClient({
  baseURL: BASE_URL,
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
