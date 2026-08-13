"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-config";

interface NavListProps {
  onNavigate?: () => void;
}

export default function NavList({ onNavigate }: NavListProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1" aria-label="Main navigation">
      {NAV_ITEMS.map(({ key, label, href, icon: Icon, tourTarget }) => {
        if (!href) {
          return (
            <div
              key={key}
              aria-disabled="true"
              className="flex items-center gap-3 h-11 pl-[10px] pr-3 rounded-xl border-l-2 border-transparent text-cream-ivory/30 cursor-not-allowed"
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium flex-1">{label}</span>
              <span className="text-[10px] uppercase tracking-wider bg-white/5 text-cream-ivory/40 px-2 py-0.5 rounded-full">
                Soon
              </span>
            </div>
          );
        }

        const isActive = pathname === href;

        return (
          <Link
            key={key}
            href={href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            data-tour={tourTarget}
            className={`flex items-center gap-3 h-11 pl-[10px] pr-3 rounded-xl border-l-2 text-sm font-medium transition-all duration-200 focus-gold ${
              isActive
                ? "border-lumen-gold bg-gradient-to-r from-lumen-gold/12 to-transparent text-lumen-gold shadow-[0_0_20px_rgba(244,196,48,0.08)]"
                : "border-transparent text-cream-ivory/60 hover:bg-white/[0.05] hover:text-cream-ivory"
            }`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
