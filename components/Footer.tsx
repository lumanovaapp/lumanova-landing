"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const TikTokIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.93a8.17 8.17 0 004.78 1.53V7.02a4.85 4.85 0 01-1.01-.33z" />
  </svg>
);

const XIcon = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

const YoutubeIcon = () => (
  <svg
    width="19"
    height="19"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
  </svg>
);

const socials = [
  {
    name: "Instagram",
    Icon: InstagramIcon,
    href: "https://instagram.com/lumanovaapp",
  },
  {
    name: "TikTok",
    Icon: TikTokIcon,
    href: "https://tiktok.com/@lumanovaapp",
  },
  {
    name: "YouTube",
    Icon: YoutubeIcon,
    href: "https://youtube.com/@lumanovaapp",
  },
  { name: "X", Icon: XIcon, href: "https://x.com/lumanovaapp" },
];

export default function Footer() {
  return (
    <motion.footer
      className="bg-[#0A0A0A] border-t border-white/[0.06] py-16 md:py-20"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center gap-8 text-center">
        {/* Logo + wordmark */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Image
              src="/logo.png"
              alt="Lumanova"
              width={220}
              height={64}
              className="h-16 w-auto opacity-90 drop-shadow-[0_0_20px_rgba(244,196,48,0.35)]"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <span className="font-manrope font-extrabold text-2xl md:text-3xl tracking-[0.12em] text-white/85">
            LU<span className="text-[#F4C430]">MA</span>NOVA
          </span>
          <p className="text-[#F8F4E3]/30 text-sm tracking-widest italic">
            Your nova of light.
          </p>
        </div>

        {/* Social icons */}
        <div className="flex items-center gap-5">
          {socials.map(({ name, Icon, href }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={name}
              className="w-11 h-11 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-[#F4C430] hover:border-[#F4C430]/35 hover:bg-[#F4C430]/[0.08] hover:shadow-[0_0_16px_rgba(244,196,48,0.2)] transition-all duration-300"
            >
              <Icon />
            </a>
          ))}
        </div>

        {/* Built with */}
        <p className="text-white/25 text-sm">
          Built with ☕ from Negombo, Sri Lanka 🇱🇰
        </p>

        {/* Copyright */}
        <p className="text-white/20 text-xs">
          © 2026 Lumanova. All rights reserved.
        </p>
      </div>
    </motion.footer>
  );
}
