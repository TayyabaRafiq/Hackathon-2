import type { ReactNode } from "react";
import { AuthRedirect } from "@/components/auth/AuthRedirect";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <AuthRedirect mode="requireGuest">
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="w-full max-w-md px-4">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-neutral-200">
            {children}
          </div>
        </div>
      </div>
    </AuthRedirect>
  );
}
