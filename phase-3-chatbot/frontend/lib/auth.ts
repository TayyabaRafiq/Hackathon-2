import { createAuthClient } from "better-auth/react";

// For production: Use Vercel API proxy to avoid cross-domain cookie issues
// For development: Use backend directly
const IS_BROWSER = typeof window !== "undefined";
const BASE_URL = IS_BROWSER
  ? window.location.origin  // Use same-origin proxy (e.g., https://hackathon-2-b866.vercel.app)
  : (process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000");

console.log("Auth client BASE_URL:", BASE_URL);

export const authClient = createAuthClient({
  baseURL: BASE_URL,
  fetchOptions: {
    credentials: 'include', // Important: include cookies in requests
  },
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
