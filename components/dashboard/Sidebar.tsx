import Link from "next/link";
import Image from "next/image";
import NavList from "./NavList";
import UserFooter from "./UserFooter";

interface SidebarProps {
  fullName: string;
  email?: string | null;
  isPro?: boolean;
}

export default function Sidebar({ fullName, email, isPro = false }: SidebarProps) {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 lg:border-r lg:border-white/[0.08] lg:bg-gradient-to-b lg:from-[#0B0906] lg:to-[#0A0A0A] lg:px-4 lg:py-6">
      <Link href="/dashboard" className="flex items-center gap-2 px-2 mb-8 focus-gold">
        <Image
          src="/logo.png"
          alt="Lumanova"
          width={36}
          height={36}
          className="w-9 h-9 drop-shadow-[0_0_10px_rgba(244,196,48,0.3)]"
        />
        <span className="font-manrope font-bold text-cream-ivory text-lg">
          Lumanova
        </span>
      </Link>

      <div className="flex-1 overflow-y-auto">
        <NavList />
      </div>

      <UserFooter fullName={fullName} email={email} isPro={isPro} />
    </aside>
  );
}
