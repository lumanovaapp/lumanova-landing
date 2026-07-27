"use client";

import { Camera, Sparkles, MessageCircle, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

const steps: {
  number: string;
  Icon: LucideIcon;
  title: string;
  description: string;
  tag: string;
}[] = [
  {
    number: "01",
    Icon: Camera,
    title: "Scan",
    description:
      "Upload a selfie. Our AI analyzes 30+ facial features — calibrated to your ethnicity, not Western defaults.",
    tag: "Day 1",
  },
  {
    number: "02",
    Icon: Sparkles,
    title: "Personalize",
    description:
      "Get a 90-day plan tailored to YOUR features, lifestyle, and goals. Skincare, grooming, fitness, and daily habits — all mapped out.",
    tag: "Day 1",
  },
  {
    number: "03",
    Icon: MessageCircle,
    title: "Coach",
    description:
      "Daily check-ins, habit tracking, and AI coaching that adapts as you progress. Not just a plan — an actual coach in your pocket.",
    tag: "Days 2–90",
  },
  {
    number: "04",
    Icon: TrendingUp,
    title: "Transform",
    description:
      "Track visible progress with side-by-side comparisons. See real changes in skin, grooming, posture, and confidence — not just a number.",
    tag: "Day 90",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative bg-[#0A0A0A] py-24 md:py-32 overflow-hidden scroll-mt-24"
    >
      {/* Background orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full bg-[#0E3A47] blur-[130px] opacity-[0.18] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full bg-[#F4C430] blur-[150px] opacity-[0.06] pointer-events-none" />

      <motion.div
        className="relative max-w-6xl mx-auto px-4 md:px-8"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={container}
      >
        {/* Section header */}
        <motion.div variants={item} className="text-center mb-16 md:mb-20">
          <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#F4C430]/55 mb-4">
            The Process
          </p>
          <h2 className="text-3xl md:text-5xl font-manrope font-bold text-white mb-4">
            From day 1 to{" "}
            <span className="text-[#F4C430]">peak you.</span>
          </h2>
          <p className="text-base md:text-lg text-[#F8F4E3]/55 max-w-md mx-auto">
            A real 90-day coaching system. Not just a one-time scan.
          </p>
        </motion.div>

        {/* Cards + connecting line */}
        <div className="relative">
          {/* Horizontal progress line — lg screens only, sits behind cards */}
          <div className="hidden lg:block absolute top-[68px] left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] h-px bg-gradient-to-r from-transparent via-[#F4C430]/20 to-transparent pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map(({ number, Icon, title, description, tag }, i) => (
              <motion.div
                key={i}
                variants={item}
                className="group relative flex flex-col p-6 md:p-8 rounded-[1.75rem] bg-white/[0.03] border border-white/[0.08] hover:border-[#F4C430]/30 hover:bg-[#F4C430]/[0.03] transition-all duration-500"
              >
                {/* Watermark number */}
                <div className="text-[#F4C430]/15 font-manrope font-extrabold text-7xl leading-none mb-6 select-none group-hover:text-[#F4C430]/25 transition-colors duration-500">
                  {number}
                </div>

                {/* Icon */}
                <div className="w-11 h-11 rounded-xl bg-[#F4C430]/10 border border-[#F4C430]/20 flex items-center justify-center mb-5 group-hover:bg-[#F4C430]/15 group-hover:border-[#F4C430]/35 transition-all duration-300">
                  <Icon size={20} className="text-[#F4C430]" />
                </div>

                {/* Title */}
                <h3 className="text-xl md:text-2xl font-manrope font-bold text-white mb-3">
                  {title}
                </h3>

                {/* Description */}
                <p className="text-[#F8F4E3]/55 text-sm md:text-base leading-relaxed mb-6 flex-1">
                  {description}
                </p>

                {/* Day tag */}
                <div className="inline-flex">
                  <span className="bg-[#F4C430]/10 text-[#F4C430]/80 text-xs uppercase tracking-wider px-3 py-1 rounded-full">
                    {tag}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
