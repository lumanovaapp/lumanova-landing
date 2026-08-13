import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import TourProvider from "./onboarding/TourProvider";
import SectionGlow from "@/components/SectionGlow";

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
      <div className="relative min-h-screen bg-gradient-to-b from-[#0A0A0A] via-[#0D0A06] to-[#0A0A0A] overflow-x-clip">
        <SectionGlow
          className="top-[-120px] left-1/3 hidden lg:block"
          color="rgba(244, 196, 48, 0.05)"
          size={560}
          drift={26}
        />

        <Sidebar fullName={fullName} email={email} />
        <MobileNav fullName={fullName} email={email} />

        <div className="lg:pl-64">
          <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 py-6 lg:py-10 [padding-bottom:max(2rem,env(safe-area-inset-bottom))]">
            {children}
          </main>
        </div>
      </div>
    </TourProvider>
  );
}
