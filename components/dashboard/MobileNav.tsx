"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import NavList from "./NavList";
import UserFooter from "./UserFooter";

interface MobileNavProps {
  fullName: string;
  email?: string | null;
}

export default function MobileNav({ fullName, email }: MobileNavProps) {
  const [open, setOpen] = useState(false);

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
      <header className="sticky top-0 z-30 flex lg:hidden items-center justify-between bg-pure-black/80 backdrop-blur border-b border-white/10 px-4 py-3 [padding-top:max(0.75rem,env(safe-area-inset-top))]">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="font-manrope font-bold text-lumen-gold text-[26px] leading-none">
            L
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="mobile-nav-drawer"
          className="w-11 h-11 flex items-center justify-center rounded-xl text-cream-ivory hover:bg-white/5 transition-colors"
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
              className="fixed inset-0 z-40 bg-pure-black/70 lg:hidden"
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
              className="fixed inset-y-0 left-0 z-50 w-[82%] max-w-xs bg-pure-black border-r border-white/10 flex flex-col px-4 py-6 lg:hidden [padding-top:max(1.5rem,env(safe-area-inset-top))] [padding-bottom:max(1.5rem,env(safe-area-inset-bottom))]"
            >
              <div className="flex items-center justify-between mb-8 px-2">
                <span className="font-manrope font-bold text-cream-ivory text-lg">
                  Lumanova
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-cream-ivory/70 hover:bg-white/5 hover:text-cream-ivory transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <NavList onNavigate={() => setOpen(false)} />
              </div>

              <UserFooter fullName={fullName} email={email} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
