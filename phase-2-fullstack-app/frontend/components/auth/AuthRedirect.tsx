"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface AuthRedirectProps {
  mode: "requireAuth" | "requireGuest";
  children: React.ReactNode;
}

export function AuthRedirect({ mode, children }: AuthRedirectProps) {
  const router = useRouter();
  const { session, isPending, isDemo } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  // Track client-side mount to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Skip redirects in demo mode
    if (isDemo) return;
    if (!isMounted || isPending) return;

    if (mode === "requireAuth" && !session) {
      router.replace("/sign-in");
    } else if (mode === "requireGuest" && session) {
      router.replace("/dashboard");
    }
  }, [session, isPending, mode, router, isMounted, isDemo]);

  // In demo mode, skip loading state and render children immediately after mount
  if (isDemo) {
    if (!isMounted) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      );
    }
    return <>{children}</>;
  }

  // Always render loading state on server and initial client render
  // This ensures consistent hydration
  if (!isMounted || isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show nothing if redirecting
  if (mode === "requireAuth" && !session) {
    return null;
  }

  if (mode === "requireGuest" && session) {
    return null;
  }

  return <>{children}</>;
}
