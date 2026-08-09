"use client";

import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import SectionGlow from "@/components/SectionGlow";

const rows = [
  {
    other: "Judge your face with a score (5.1/10)",
    ours: "Coach you through a 90-day plan",
  },
  {
    other: "Built on Eurocentric beauty standards",
    ours: "Multi-ethnic AI built for every face",
  },
  {
    other: "Push you toward expensive surgery",
    ours: "Focus on sustainable self-care habits",
  },
  {
    other: "Track 100+ metrics but no daily plan",
    ours: "Simple daily actions you can actually do",
  },
  {
    other: "Feed obsession over millimeters",
    ours: "Build real confidence through progress",
  },
  {
    other: "Leave you anxious about your looks",
    ours: "Track how you feel, not just how you look",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function WhyDifferent() {
  return (
    <section className="relative bg-gradient-to-b from-[#0A0A0A] via-[#0E0A05] to-[#0A0A0A] py-24 md:py-32 overflow-hidden">
      <SectionGlow className="-bottom-32 -left-24" color="rgba(244, 196, 48, 0.05)" size={440} />

      <motion.div
        className="relative max-w-5xl mx-auto px-6 lg:px-8"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={container}
      >
        {/* Header — left-aligned, editorial (matches the site's other sections) */}
        <motion.div variants={item} className="max-w-2xl mb-12 md:mb-14">
          <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#F4C430]/55 mb-4">
            The Difference
          </p>
          <h2 className="text-3xl md:text-5xl font-manrope leading-[1.1] tracking-[-0.02em] mb-5">
            <span className="font-light text-white/80">They give you a number.</span>{" "}
            <span className="font-extrabold text-[#F4C430]">We give you a plan.</span>
          </h2>
          <p className="text-base md:text-lg text-[#F8F4E3]/55 leading-relaxed">
            Six ways Lumanova is built differently — side by side.
          </p>
        </motion.div>

        {/* Spec-sheet comparison table — one framed card, gold column pulls the eye */}
        <motion.div
          variants={item}
          className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,.3),0_16px_32px_rgba(0,0,0,.35)]"
        >
          {/* Header row */}
          <div className="grid grid-cols-2">
            <div className="px-5 sm:px-6 md:px-8 py-4 md:py-5 border-r border-white/[0.06]">
              <span className="text-[10px] md:text-xs font-bold tracking-[0.18em] uppercase text-white/35">
                Other Apps
              </span>
            </div>
            <div className="px-5 sm:px-6 md:px-8 py-4 md:py-5 bg-[#F4C430]/[0.07]">
              <span className="text-[10px] md:text-xs font-bold tracking-[0.18em] uppercase text-[#F4C430]">
                Lumanova
              </span>
            </div>
          </div>

          {/* Data rows */}
          {rows.map(({ other, ours }, i) => (
            <motion.div
              key={i}
              variants={item}
              className="group grid grid-cols-2 border-t border-white/[0.06] hover:bg-white/[0.015] transition-colors duration-200"
            >
              <div className="flex items-start gap-2.5 sm:gap-3 px-5 sm:px-6 md:px-8 py-4 md:py-5 border-r border-white/[0.06]">
                <X size={14} className="text-white/25 flex-shrink-0 mt-0.5" />
                <span className="text-[13px] sm:text-sm md:text-base text-white/45 leading-snug">
                  {other}
                </span>
              </div>
              <div className="flex items-start gap-2.5 sm:gap-3 px-5 sm:px-6 md:px-8 py-4 md:py-5 bg-[#F4C430]/[0.04] group-hover:bg-[#F4C430]/[0.07] transition-colors duration-200">
                <Check size={14} className="text-[#F4C430] flex-shrink-0 mt-0.5" />
                <span className="text-[13px] sm:text-sm md:text-base text-white font-medium leading-snug">
                  {ours}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
