// Feature flags for development and demo purposes
// Set NEXT_PUBLIC_DEMO_MODE=false in .env.local when connecting real backend

export const DEMO_AUTH_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

// Mock session data for demo mode
export const DEMO_SESSION = {
  user: {
    id: "demo-user",
    email: "demo@todo.app",
    name: "Demo User",
    image: null,
  },
};
