"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    initial: "M.",
    flag: "🇮🇳",
    gradient: "from-[#F4C430] to-[#1A1A1A]",
    quote: "Day 30. Skin cleared, sleep is better.",
    subtext: "The daily habits are what changed things — not another number to obsess over.",
  },
  {
    initial: "A.",
    flag: "🇱🇰",
    gradient: "from-[#D9A400] to-[#0A0A0A]",
    quote: "First app that actually coached me.",
    subtext: "Not just a rating — actual guidance.",
  },
  {
    initial: "D.",
    flag: "🇲🇽",
    gradient: "from-[#FFD874] to-[#141414]",
    quote: "Went from obsessing over ratings to real progress.",
    subtext: "Focus on habits, not numbers.",
  },
  {
    initial: "S.",
    flag: "🇸🇦",
    gradient: "from-[#F4C430] to-[#0A0A0A]",
    quote: "Multi-ethnic coaching that actually works.",
    subtext: "Finally an app built for my face — not a Western default.",
  },
] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

// Bento spans: featured (wide) alternates sides across the two rows so the
// section doesn't read as four identical stacked blocks.
const spans = ["lg:col-span-2", "lg:col-span-1", "lg:col-span-1", "lg:col-span-2"];
const featured = [true, false, false, true];

export default function Testimonials() {
  return (
    <section className="bg-[#1A1A1A] py-24 md:py-32">
      <motion.div
        className="max-w-6xl mx-auto px-6 lg:px-8"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={container}
      >
        {/* Header — left-aligned, matches the rest of the page */}
        <motion.div variants={item} className="max-w-2xl mb-12 md:mb-14">
          <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#F4C430]/55 mb-4">
            Real Results
          </p>
          <h2 className="text-3xl md:text-5xl font-manrope leading-[1.1] tracking-[-0.02em]">
            <span className="font-light text-white/80">Built for every face.</span>{" "}
            <span className="font-extrabold text-[#F4C430]">Every glow-up.</span>
          </h2>
        </motion.div>

        {/* Asymmetric bento — one focal quote per row instead of four equal cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {testimonials.map(({ initial, flag, gradient, quote, subtext }, i) => (
            <motion.div
              key={i}
              variants={item}
              className={`group relative overflow-hidden flex flex-col justify-center rounded-3xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.06] transition-all duration-300 ${spans[i]} ${
                featured[i] ? "p-8 md:p-10" : "p-6 md:p-7"
              }`}
            >
              {featured[i] && (
                <span
                  aria-hidden="true"
                  className="absolute -top-4 right-6 font-manrope font-extrabold text-[110px] leading-none text-[#F4C430]/[0.06] select-none pointer-events-none"
                >
                  &rdquo;
                </span>
              )}

              <div className="relative flex items-center gap-3.5 mb-5">
                <div
                  className={`rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 ${
                    featured[i] ? "w-14 h-14" : "w-11 h-11"
                  }`}
                >
                  <span
                    className={`text-white font-manrope font-bold ${
                      featured[i] ? "text-xl" : "text-base"
                    }`}
                  >
                    {initial}
                  </span>
                </div>
                <span className="text-xl" role="img" aria-label="flag">
                  {flag}
                </span>
              </div>

              <p
                className={`relative text-white font-semibold leading-snug mb-2 ${
                  featured[i] ? "text-xl md:text-2xl" : "text-lg"
                }`}
              >
                &ldquo;{quote}&rdquo;
              </p>
              <p className="relative text-white/35 text-sm leading-relaxed">{subtext}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
