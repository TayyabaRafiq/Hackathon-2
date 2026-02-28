import { createAuthClient } from "better-auth/react";

// For production: Use Vercel API proxy to avoid cross-domain cookie issues
// For development: Use backend directly
const IS_BROWSER = typeof window !== "undefined";

// Get base URL - use full URL for SSR, relative for client
let BASE_URL: string;
if (IS_BROWSER) {
  // In browser: use same-origin (Vercel domain)
  BASE_URL = window.location.origin;
} else {
  // Server-side: need full URL for build
  // Use NEXT_PUBLIC_SITE_URL or fallback to localhost
  BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

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
