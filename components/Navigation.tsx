"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || menuOpen
          ? "bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#F4C430]/15"
          : "bg-transparent"
      }`}
    >
      {/* Mobile: flex justify-between | Desktop: 3-col grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-5 flex items-center justify-between lg:grid lg:grid-cols-3">

        {/* Left: Logo */}
        <a href="#" className="flex items-center">
          {logoError ? (
            <span className="font-manrope font-bold text-xl lg:text-2xl tracking-[0.1em] text-white">
              LU<span className="text-[#F4C430]">MA</span>NOVA
            </span>
          ) : (
            <Image
              src="/logo.png"
              alt="Lumanova"
              width={210}
              height={56}
              className="h-10 lg:h-14 w-auto drop-shadow-[0_0_14px_rgba(244,196,48,0.35)]"
              onError={() => setLogoError(true)}
              priority
            />
          )}
        </a>

        {/* Center: Wordmark — hidden on mobile, visible on lg+ */}
        <div className="hidden lg:flex justify-center">
          <span className="font-manrope font-extrabold text-sm tracking-widest text-[#F4C430]">
            LUMANOVA
          </span>
        </div>

        {/* Right: desktop nav links + mobile hamburger */}
        <div className="flex items-center justify-end gap-6">
          <a
            href="/login"
            className="hidden lg:block text-[#F8F4E3]/65 text-sm font-medium hover:text-[#F4C430] transition-colors duration-200"
          >
            Sign in
          </a>
          <a
            href="#waitlist"
            className="hidden lg:inline-flex items-center gap-1.5 bg-[#F4C430] text-[#0A0A0A] font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-[#F4C430]/90 hover:shadow-[0_0_24px_rgba(244,196,48,0.45)] transition-all duration-300 active:scale-95"
          >
            Join Waitlist →
          </a>
          <button
            className="lg:hidden text-[#F8F4E3] p-2 -mr-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu — animated slide-down */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden overflow-hidden bg-[#0A0A0A]/98 backdrop-blur-md border-t border-white/[0.08]"
          >
            <div className="px-4 sm:px-6 py-4 flex flex-col gap-2">
              <a
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center min-h-[48px] text-[#F8F4E3]/65 text-sm font-medium hover:text-[#F4C430] transition-colors duration-200 rounded-xl hover:bg-white/[0.04]"
              >
                Sign in
              </a>
              <a
                href="#waitlist"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center min-h-[48px] bg-[#F4C430] text-[#0A0A0A] font-semibold text-sm px-6 rounded-full hover:bg-[#F4C430]/90 transition-colors duration-200 active:scale-95"
              >
                Join Waitlist →
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
