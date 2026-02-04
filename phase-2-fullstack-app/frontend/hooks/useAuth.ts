"use client";

import { useCallback } from "react";
import { DEMO_AUTH_MODE, DEMO_SESSION } from "@/lib/config";
import { useSession } from "@/lib/auth";

interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

interface Session {
  user: User;
}

interface UseAuthReturn {
  session: Session | null;
  isPending: boolean;
  isDemo: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  // Use Better Auth's useSession hook for real auth mode
  const { data: betterAuthSession, isPending: betterAuthPending } = useSession();

  const signOut = useCallback(async () => {
    if (DEMO_AUTH_MODE) {
      console.log("Demo mode: signOut called (no-op)");
      return;
    }
    // Real auth: dynamically import and call signOut
    const { signOut: betterAuthSignOut } = await import("@/lib/auth");
    await betterAuthSignOut();
    // Redirect to sign-in after sign out
    window.location.href = "/sign-in";
  }, []);

  // Demo mode: return demo session
  if (DEMO_AUTH_MODE) {
    return {
      session: DEMO_SESSION as Session,
      isPending: false,
      isDemo: true,
      signOut,
    };
  }

  // Real auth mode: use Better Auth session
  return {
    session: betterAuthSession ? { user: betterAuthSession.user as User } : null,
    isPending: betterAuthPending,
    isDemo: false,
    signOut,
  };
}
