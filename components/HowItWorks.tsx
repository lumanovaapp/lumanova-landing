"use client";

import { Camera, Sparkles, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

const steps: { number: string; Icon: LucideIcon; title: string; description: string }[] = [
  {
    number: "01",
    Icon: Camera,
    title: "Scan",
    description:
      "Upload a selfie. Our AI analyzes 30+ facial proportions, calibrated to your ethnicity.",
  },
  {
    number: "02",
    Icon: Sparkles,
    title: "Plan",
    description:
      "Get a personalized 90-day transformation plan covering skincare, jawline, hair, posture, and style.",
  },
  {
    number: "03",
    Icon: TrendingUp,
    title: "Transform",
    description:
      "Weekly check-ins. Real before/after photos. Watch yourself become Lumanova.",
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

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-[#0A0A0A] py-24 md:py-32 overflow-hidden scroll-mt-24">
      {/* Teal gradient top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full bg-[#0E3A47] blur-[130px] opacity-[0.18] pointer-events-none" />
      {/* Gold gradient bottom */}
      <div className="absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full bg-[#F4C430] blur-[150px] opacity-[0.06] pointer-events-none" />

      <motion.div
        className="relative max-w-6xl mx-auto px-6"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={container}
      >
        {/* Headline */}
        <motion.div variants={item} className="text-center mb-16 md:mb-20">
          <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#F4C430]/55 mb-4">
            The Process
          </p>
          <h2 className="text-3xl md:text-5xl font-manrope font-bold text-white">
            From day 1 to{" "}
            <span className="text-[#F4C430]">peak you.</span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {steps.map(({ number, Icon, title, description }, i) => (
            <motion.div
              key={i}
              variants={item}
              className="group relative p-8 rounded-[1.75rem] bg-white/[0.03] border border-white/[0.08] hover:border-[#F4C430]/30 hover:bg-[#F4C430]/[0.03] transition-all duration-500"
            >
              <div className="text-[#F4C430]/15 font-manrope font-extrabold text-7xl leading-none mb-6 select-none group-hover:text-[#F4C430]/25 transition-colors duration-500">
                {number}
              </div>
              <div className="w-11 h-11 rounded-xl bg-[#F4C430]/10 border border-[#F4C430]/20 flex items-center justify-center mb-5 group-hover:bg-[#F4C430]/15 group-hover:border-[#F4C430]/35 transition-all duration-300">
                <Icon size={20} className="text-[#F4C430]" />
              </div>
              <h3 className="text-lg font-manrope font-bold text-white mb-2.5">
                {title}
              </h3>
              <p className="text-white/45 text-sm leading-relaxed">{description}</p>
              {i < steps.length - 1 && (
                <div className="hidden md:flex absolute top-10 -right-3 w-6 items-center justify-center z-10">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F4C430]/25" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
