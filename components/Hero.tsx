"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.13,
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

export default function Hero() {
  const [videoError, setVideoError] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const reducedMotion = useReducedMotion();
  const showVideo = !videoError && !reducedMotion;

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0A0A0A]">
      {/* Cinematic background — the AI glow-up footage as the hero itself */}
      <div className="absolute inset-0 z-0">
        {showVideo ? (
          <video
            src="/transformations/transform-01-arjun.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/hero-banner.png"
            onError={() => setVideoError(true)}
            onCanPlay={() => setVideoReady(true)}
            className={`w-full h-full object-cover transition-opacity duration-1000 ${
              videoReady ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : (
          <Image
            src="/hero-banner.png"
            alt="Lumanova transformation"
            fill
            priority
            className="object-cover"
          />
        )}
        {/* Poster/base layer beneath the fading-in video */}
        {showVideo && !videoReady && (
          <Image
            src="/hero-banner.png"
            alt=""
            fill
            priority
            aria-hidden="true"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 hero-scrim" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-20 lg:pt-24 lg:pb-24">
        <div className="max-w-xl">

          {/* Badge */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="inline-flex items-center gap-1.5 border border-[#F4C430]/25 text-[#F4C430]/85 text-[10px] font-semibold tracking-[0.24em] uppercase px-3.5 py-1.5 rounded-full bg-[#0A0A0A]/60 backdrop-blur-sm mb-7"
          >
            AI-Powered Coaching
          </motion.div>

          {/* Headline — mixed weight for editorial contrast */}
          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="font-manrope text-white leading-[0.98]"
            style={{ letterSpacing: "-0.03em" }}
          >
            <span className="block text-4xl md:text-5xl lg:text-6xl font-light text-white/80">
              Your AI
            </span>
            <span className="block text-6xl md:text-7xl lg:text-8xl font-extrabold bg-gradient-to-br from-[#F4C430] via-[#FFD874] to-[#D9A400] bg-clip-text text-transparent py-1">
              Glow-Up
            </span>
            <span className="block text-4xl md:text-5xl lg:text-6xl font-light text-white/80">
              Coach
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-7 text-base md:text-lg text-[#F8F4E3]/60 max-w-sm leading-[1.6]"
          >
            AI-powered self-care coaching built for every face.{" "}
            <span className="text-[#F8F4E3]/90 font-medium">
              90 days to your best self.
            </span>
          </motion.p>

          {/* CTAs — one dominant gold action, one quiet text link */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-9 flex flex-col sm:flex-row sm:items-center gap-5"
          >
            <motion.a
              href="#waitlist"
              whileHover={{
                scale: 1.03,
                boxShadow: "0 0 44px rgba(244,196,48,0.55)",
                transition: { duration: 0.2 },
              }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center justify-center gap-2.5 bg-[#F4C430] text-[#0A0A0A] font-bold text-base px-8 py-4 rounded-full shadow-[0_0_22px_rgba(244,196,48,0.25)] focus-gold"
            >
              Join the Waitlist
              <ArrowRight size={17} className="flex-shrink-0" />
            </motion.a>

            <a
              href="#how-it-works"
              className="inline-flex items-center gap-1.5 text-[#F8F4E3]/70 font-medium text-sm hover:text-[#F4C430] transition-colors duration-200 focus-gold"
            >
              See how it works
              <span aria-hidden="true">↓</span>
            </a>
          </motion.div>

          {/* Risk reducer */}
          <motion.p
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-4 text-xs text-[#F8F4E3]/35"
          >
            No spam. Unsubscribe anytime.
          </motion.p>

          {/* Social proof — single-accent treatment */}
          <motion.div
            custom={5}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-10 flex items-center gap-4"
          >
            <div className="flex -space-x-2.5">
              {["A", "M", "S", "D", "R"].map((initial, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-[#141414] border-2 border-[#F4C430]/40 flex items-center justify-center flex-shrink-0"
                >
                  <span className="text-[10px] font-bold text-[#F4C430]/90">
                    {initial}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-[#F8F4E3]/60 font-medium">
                Trusted by{" "}
                <span className="text-[#F8F4E3]/90 font-semibold">500+</span>{" "}
                early users
              </span>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={11} className="text-[#F4C430] fill-[#F4C430]" />
                ))}
                <span className="text-[11px] text-[#F8F4E3]/35 ml-1">
                  4.9/5 from beta testers
                </span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Scroll indicator */}
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
