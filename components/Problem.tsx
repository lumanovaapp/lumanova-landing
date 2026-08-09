"use client";

import { X, Check } from "lucide-react";
import { motion } from "framer-motion";
import SectionGlow from "@/components/SectionGlow";

const others = [
  "They scan. They rate. They leave.",
  "One number defines you.",
  "Built for Western features only.",
  "No plan. No path forward.",
];

const lumanova = [
  "We coach you for 90 days.",
  "Built for every ethnicity.",
  "Focus on daily habits.",
  "Real transformation, not a rating.",
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function Problem() {
  return (
    <section className="relative bg-gradient-to-b from-[#181310] via-[#151110] to-[#120F0D] py-24 md:py-32 overflow-hidden">
      <SectionGlow className="top-1/3 -right-40" color="rgba(244, 196, 48, 0.05)" size={420} />

      <motion.div
        className="relative max-w-5xl mx-auto px-6"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={container}
      >
        {/* Headline — left-aligned, editorial */}
        <motion.div variants={item} className="max-w-2xl mb-12 md:mb-14">
          <h2 className="text-3xl md:text-5xl font-manrope leading-[1.15] tracking-[-0.02em] text-balance">
            <span className="font-light text-white/40">Most face-rating apps judge you.</span>
            <br />
            <span className="font-extrabold text-[#F4C430]">Lumanova coaches you.</span>
          </h2>
        </motion.div>

        {/* "The rest" — quiet, de-emphasized wrapped row, not a boxed column */}
        <motion.div variants={item} className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-14 md:mb-16 pl-1">
          {others.map((it, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 text-white/35 text-sm md:text-base line-through decoration-white/20"
            >
              <X size={12} className="text-white/25 flex-shrink-0" />
              {it}
              {i < others.length - 1 && <span className="text-white/15 ml-1.5">·</span>}
            </span>
          ))}
        </motion.div>

        {/* Lumanova — dominant, single-column focal list */}
        <div className="max-w-2xl space-y-3">
          {lumanova.map((it, i) => (
            <motion.div
              key={i}
              variants={item}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-start gap-4 p-5 md:p-6 rounded-3xl bg-gradient-to-br from-[#F4C430]/[0.07] to-[#F4C430]/[0.02] border border-[#F4C430]/20 shadow-[0_0_24px_rgba(244,196,48,0.07)] hover:border-[#F4C430]/40 hover:shadow-[0_0_36px_rgba(244,196,48,0.14)] transition-[border-color,box-shadow] duration-300"
            >
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#F4C430]/15 border border-[#F4C430]/30 flex items-center justify-center mt-0.5">
                <Check size={13} className="text-[#F4C430]" />
              </div>
              <p className="text-white font-semibold text-base md:text-lg leading-relaxed">
                {it}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
