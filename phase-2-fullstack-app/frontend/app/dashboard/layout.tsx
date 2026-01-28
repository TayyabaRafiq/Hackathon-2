import type { ReactNode } from "react";
import { AuthRedirect } from "@/components/auth/AuthRedirect";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthRedirect mode="requireAuth">
      <div className="min-h-screen bg-neutral-50">
        <Header />
        <main>{children}</main>
      </div>
    </AuthRedirect>
  );
}
