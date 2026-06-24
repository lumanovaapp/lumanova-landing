"use client";

import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Star } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.14,
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

const avatarGradients = [
  "from-[#F4C430] to-[#f97316]",
  "from-[#7FE0D3] to-[#0E3A47]",
  "from-[#8b5cf6] to-[#F4C430]",
  "from-[#F4C430] to-[#7FE0D3]",
  "from-[#0E3A47] to-[#7FE0D3]",
];

export default function Hero() {
  const [imageError, setImageError] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 48, damping: 22 });
  const springY = useSpring(rawY, { stiffness: 48, damping: 22 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    rawX.set(((e.clientX - rect.left) / rect.width - 0.5) * 18);
    rawY.set(((e.clientY - rect.top) / rect.height - 0.5) * 12);
  };

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-[#0A0A0A] flex items-center overflow-hidden"
    >
      {/* Background orbs */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#F4C430] blur-[200px] opacity-[0.11] pointer-events-none" />
      <div className="absolute -left-48 bottom-0 w-[500px] h-[500px] rounded-full bg-[#0E3A47] blur-[140px] opacity-25 pointer-events-none" />
      <div className="absolute right-1/4 bottom-0 w-[450px] h-[280px] rounded-full bg-[#F4C430] blur-[120px] opacity-[0.07] pointer-events-none" />

      {/* Content */}
      <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-8 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-16 items-center">

          {/* LEFT: Text content — first on mobile (top), left column on desktop */}
          <div className="order-1 flex flex-col items-center lg:items-start text-center lg:text-left gap-6">

            {/* Badge */}
            <motion.div
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="inline-flex items-center gap-1.5 border border-[#F4C430]/25 text-[#F4C430]/85 text-[10px] font-semibold tracking-[0.24em] uppercase px-3.5 py-1.5 rounded-full bg-[#F4C430]/[0.05]"
            >
              ✦&nbsp;&nbsp;AI-Powered Coaching
            </motion.div>

            {/* Headline */}
            <motion.h1
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="text-5xl md:text-6xl lg:text-7xl font-manrope font-extrabold text-white leading-[1.04]"
              style={{ letterSpacing: "-0.02em" }}
            >
              Your AI
              <br />
              <span className="bg-gradient-to-br from-[#F4C430] via-[#FFD060] to-[#E8A800] bg-clip-text text-transparent">
                Glow-Up
              </span>
              <br />
              Coach
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="text-base md:text-lg text-[#F8F4E3]/55 max-w-sm leading-[1.6]"
            >
              Multi-ethnic looksmaxxing transformation.{" "}
              <span className="text-[#F8F4E3]/85 font-medium">
                90 days to your peak self.
              </span>
            </motion.p>

            {/* CTAs */}
            <motion.div
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center lg:justify-start"
            >
              {/* Primary */}
              <motion.a
                href="#waitlist"
                animate={{
                  boxShadow: [
                    "0 0 0px rgba(244,196,48,0)",
                    "0 0 28px rgba(244,196,48,0.4)",
                    "0 0 0px rgba(244,196,48,0)",
                  ],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 1,
                }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 48px rgba(244,196,48,0.6)",
                  transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center gap-2.5 bg-[#F4C430] text-[#0A0A0A] font-bold text-base px-8 py-4 rounded-full"
              >
                Join the Waitlist
                <ArrowRight size={17} className="flex-shrink-0" />
              </motion.a>

              {/* Secondary */}
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 border border-[#F4C430]/55 text-[#F8F4E3] font-semibold text-base px-8 py-4 rounded-full hover:bg-[#F4C430]/10 hover:border-[#F4C430] transition-all duration-300"
              >
                See How It Works ↓
              </a>
            </motion.div>

            {/* Social proof */}
            <motion.div
              custom={4}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="flex flex-col items-center lg:items-start gap-2.5"
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {avatarGradients.map((gradient, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} border-2 border-[#0A0A0A] flex-shrink-0`}
                    />
                  ))}
                </div>
                <span className="text-sm text-[#F8F4E3]/55 font-medium">
                  Trusted by{" "}
                  <span className="text-[#F8F4E3]/90 font-semibold">500+</span>{" "}
                  early users
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    className="text-[#F4C430] fill-[#F4C430]"
                  />
                ))}
                <span className="text-xs text-[#F8F4E3]/35 ml-1">
                  4.9/5 from beta testers
                </span>
              </div>
            </motion.div>

          </div>

          {/* RIGHT: Image — below content on mobile, right column on desktop */}
          <div className="order-2 flex items-center justify-center mt-10 lg:mt-0">
            <motion.div
              style={{ x: springX, y: springY }}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[320px] md:max-w-[420px] lg:max-w-[460px] mx-auto"
            >
              {imageError ? (
                <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-to-br from-[#0E3A47]/60 via-[#0A0A0A] to-[#1A1A1A] border border-white/[0.07]">
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 opacity-30">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#F4C430] to-[#7FE0D3] opacity-40 blur-sm" />
                    <span className="font-manrope font-bold text-xs tracking-[0.25em] uppercase text-white/60">
                      Lumanova
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {/* Gold radial glow behind the image */}
                  <div className="absolute -inset-10 bg-[#F4C430] blur-[80px] opacity-[0.15] pointer-events-none" />
                  <Image
                    src="/hero-banner.png"
                    alt="Lumanova transformation"
                    width={460}
                    height={575}
                    className="relative w-full h-auto rounded-3xl"
                    onError={() => setImageError(true)}
                    priority
                  />
                </div>
              )}
            </motion.div>
          </div>

        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none" />

      {/* Scroll indicator — centered below both columns */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-3 pointer-events-none z-10">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-10 bg-[#F4C430]"
        />
        <span className="text-[8px] font-bold tracking-[0.35em] uppercase text-[#F8F4E3]/50">
          Scroll
        </span>
      </div>
    </section>
  );
}
