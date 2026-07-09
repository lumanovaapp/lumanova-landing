"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    initial: "M.",
    flag: "🇮🇳",
    gradient: "from-[#F4C430] to-[#f97316]",
    quote: "Day 30. Skin cleared, sleep is better.",
    subtext: "The daily habits are what changed things.",
  },
  {
    initial: "A.",
    flag: "🇱🇰",
    gradient: "from-[#7FE0D3] to-[#0E3A47]",
    quote: "First app that actually coached me.",
    subtext: "Not just a rating — actual guidance.",
  },
  {
    initial: "D.",
    flag: "🇲🇽",
    gradient: "from-[#8b5cf6] to-[#F4C430]",
    quote: "Went from obsessing over ratings to real progress.",
    subtext: "Focus on habits, not numbers.",
  },
  {
    initial: "S.",
    flag: "🇸🇦",
    gradient: "from-[#F4C430] to-[#7FE0D3]",
    quote: "Multi-ethnic coaching that actually works.",
    subtext: "Finally an app built for my face.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function Testimonials() {
  return (
    <section className="bg-[#1A1A1A] py-24 md:py-32">
      <motion.div
        className="max-w-6xl mx-auto px-6"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={container}
      >
        {/* Headline */}
        <motion.div variants={item} className="text-center mb-14 md:mb-16">
          <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#7FE0D3]/50 mb-4">
            Real Results
          </p>
          <h2 className="text-3xl md:text-5xl font-manrope font-bold text-white">
            Built for every face.{" "}
            <span className="text-[#F4C430]">Every glow-up.</span>
          </h2>
        </motion.div>

        {/* Testimonial grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 max-w-3xl mx-auto">
          {testimonials.map(({ initial, flag, gradient, quote, subtext }, i) => (
            <motion.div
              key={i}
              variants={item}
              className="group p-7 rounded-[1.5rem] bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.06] transition-all duration-300"
            >
              <div className="flex items-center gap-3.5 mb-5">
                <div
                  className={`w-11 h-11 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}
                >
                  <span className="text-white font-manrope font-bold text-base">
                    {initial}
                  </span>
                </div>
                <span className="text-xl" role="img" aria-label="flag">
                  {flag}
                </span>
              </div>
              <p className="text-white font-semibold text-lg leading-snug mb-2">
                &ldquo;{quote}&rdquo;
              </p>
              <p className="text-white/35 text-sm leading-relaxed">{subtext}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
