"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import NavList from "./NavList";
import UserFooter from "./UserFooter";
import { useTour } from "./onboarding/TourProvider";

interface MobileNavProps {
  fullName: string;
  email?: string | null;
}

// Tour steps whose target lives inside the sidebar/mobile-nav link list —
// on mobile that only exists once this drawer is open.
const NAV_DRAWER_TOUR_TARGETS = new Set([
  "tour-nav-coach",
  "tour-nav-upload",
  "tour-nav-plan",
  "tour-nav-achievements",
]);

export default function MobileNav({ fullName, email }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const { activeTarget } = useTour();

  // Opens the drawer for a nav-based tour step and closes it again once the
  // tour moves past it — including when the tour ends (activeTarget becomes
  // null). Without the null case, finishing or skipping the tour on a
  // drawer-targeted step (e.g. the last step, Achievements) left `open`
  // stuck true, which keeps this component's body-scroll lock applied
  // forever, even on desktop where the drawer itself is invisible.
  useEffect(() => {
    setOpen(!!activeTarget && NAV_DRAWER_TOUR_TARGETS.has(activeTarget));
  }, [activeTarget]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-30 flex lg:hidden items-center justify-between bg-[#0A0A0A]/85 backdrop-blur-md border-b border-white/[0.08] px-4 py-3 [padding-top:max(0.75rem,env(safe-area-inset-top))]">
        <Link href="/dashboard" className="flex items-center gap-2 focus-gold">
          <Image
            src="/logo.png"
            alt="Lumanova"
            width={26}
            height={26}
            className="w-[26px] h-[26px] drop-shadow-[0_0_8px_rgba(244,196,48,0.25)]"
          />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="mobile-nav-drawer"
          className="w-11 h-11 flex items-center justify-center rounded-xl text-cream-ivory hover:bg-white/[0.06] transition-colors focus-gold"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              key="drawer"
              id="mobile-nav-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeInOut" }}
              className="fixed inset-y-0 left-0 z-50 w-[82%] max-w-xs bg-gradient-to-b from-[#0B0906] to-[#0A0A0A] border-r border-white/[0.08] flex flex-col px-4 py-6 lg:hidden [padding-top:max(1.5rem,env(safe-area-inset-top))] [padding-bottom:max(1.5rem,env(safe-area-inset-bottom))]"
            >
              <div className="flex items-center justify-between mb-6 px-2">
                <span className="font-manrope font-bold text-cream-ivory text-lg">
                  Lumanova
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-cream-ivory/70 hover:bg-white/[0.06] hover:text-cream-ivory transition-colors focus-gold"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <UserFooter fullName={fullName} email={email} />

              <div className="flex-1 overflow-y-auto mt-6 pt-4 border-t border-white/[0.08]">
                <NavList onNavigate={() => setOpen(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
