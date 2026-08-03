import Link from "next/link";
import NavList from "./NavList";
import UserFooter from "./UserFooter";

interface SidebarProps {
  fullName: string;
  email?: string | null;
}

export default function Sidebar({ fullName, email }: SidebarProps) {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 lg:border-r lg:border-white/10 lg:bg-pure-black lg:px-4 lg:py-6">
      <Link href="/dashboard" className="flex items-center gap-2 px-2 mb-8">
        <span className="font-manrope font-bold text-lumen-gold text-[28px] leading-none">
          L
        </span>
        <span className="font-manrope font-bold text-cream-ivory text-lg">
          Lumanova
        </span>
      </Link>

      <div className="flex-1 overflow-y-auto">
        <NavList />
      </div>

      <UserFooter fullName={fullName} email={email} />
    </aside>
  );
}
