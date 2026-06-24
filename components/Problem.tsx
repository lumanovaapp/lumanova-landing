"use client";

import { X, Check } from "lucide-react";
import { motion } from "framer-motion";

const others = [
  "They scan. You leave.",
  "Eurocentric beauty standards.",
  "One score. No path forward.",
];

const lumanova = [
  "We coach you for 90 days.",
  "Multi-ethnic AI scoring.",
  "Real plan. Weekly progress.",
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function Problem() {
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
        <motion.div variants={item} className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl md:text-5xl font-manrope font-bold text-white leading-[1.15] text-balance">
            Most looksmaxxing apps{" "}
            <span className="text-white/40">judge you.</span>
            <br />
            <span className="text-[#F4C430]">We coach you.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10 max-w-4xl mx-auto">
          {/* Others column */}
          <div className="space-y-3">
            <motion.p variants={item} className="text-[10px] font-bold tracking-[0.22em] uppercase text-white/50 mb-6 pl-1">
              The rest
            </motion.p>
            {others.map((it, i) => (
              <motion.div
                key={i}
                variants={item}
                className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
              >
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mt-0.5">
                  <X size={13} className="text-red-400/70" />
                </div>
                <p className="text-white/40 font-medium text-sm md:text-base leading-relaxed">
                  {it}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Lumanova column */}
          <div className="space-y-3">
            <motion.p variants={item} className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#F4C430] mb-6 pl-1">
              Lumanova
            </motion.p>
            {lumanova.map((it, i) => (
              <motion.div
                key={i}
                variants={item}
                className="flex items-start gap-4 p-5 rounded-2xl bg-[#F4C430]/[0.05] border border-[#F4C430]/20 shadow-[0_0_24px_rgba(244,196,48,0.07)] hover:border-[#F4C430]/40 hover:bg-[#F4C430]/[0.08] hover:shadow-[0_0_36px_rgba(244,196,48,0.14)] transition-all duration-300"
              >
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#F4C430]/15 border border-[#F4C430]/30 flex items-center justify-center mt-0.5">
                  <Check size={13} className="text-[#F4C430]" />
                </div>
                <p className="text-white font-semibold text-sm md:text-base leading-relaxed">
                  {it}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
