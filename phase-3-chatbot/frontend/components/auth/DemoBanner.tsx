"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DEMO_AUTH_MODE } from "@/lib/config";

export function DemoBanner() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only show in demo mode after mount (to avoid hydration mismatch)
  if (!isMounted || !DEMO_AUTH_MODE) {
    return null;
  }

  return (
    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm text-center">
      <p className="font-medium">Demo mode enabled – auth bypassed</p>
      <Link
        href="/dashboard"
        className="text-amber-900 underline hover:text-amber-700 mt-1 inline-block"
      >
        Go to Dashboard →
      </Link>
    </div>
  );
}
