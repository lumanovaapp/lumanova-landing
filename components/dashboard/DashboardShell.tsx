import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import TourProvider from "./onboarding/TourProvider";

interface DashboardShellProps {
  fullName: string;
  email?: string | null;
  userId: string;
  onboarded: boolean;
  hasPlan: boolean;
  children: ReactNode;
}

export default function DashboardShell({
  fullName,
  email,
  userId,
  onboarded,
  hasPlan,
  children,
}: DashboardShellProps) {
  return (
    <TourProvider userId={userId} initialOnboarded={onboarded} hasPlan={hasPlan}>
      <div className="min-h-screen bg-pure-black">
        <Sidebar fullName={fullName} email={email} />
        <MobileNav fullName={fullName} email={email} />

        <div className="lg:pl-64">
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10 [padding-bottom:max(2rem,env(safe-area-inset-bottom))]">
            {children}
          </main>
        </div>
      </div>
    </TourProvider>
  );
}
