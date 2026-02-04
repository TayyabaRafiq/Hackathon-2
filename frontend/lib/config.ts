// Feature flags for development and demo purposes
// Set NEXT_PUBLIC_DEMO_MODE=false in .env.local when connecting real backend

export const DEMO_AUTH_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

// Log to verify environment variable is loaded correctly
if (typeof window !== 'undefined') {
  console.log('DEMO_AUTH_MODE:', DEMO_AUTH_MODE);
  console.log('NEXT_PUBLIC_DEMO_MODE:', process.env.NEXT_PUBLIC_DEMO_MODE);
}

// Mock session data for demo mode
export const DEMO_SESSION = {
  user: {
    id: "demo-user",
    email: "demo@todo.app",
    name: "Demo User",
    image: null,
  },
};
