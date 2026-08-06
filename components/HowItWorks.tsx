"use client";

import { Camera, Sparkles, MessageCircle, TrendingUp, ArrowRight } from "lucide-react";
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
      {/* Background glow — gold only */}
      <div className="absolute top-0 right-0 w-[500px] h-[350px] rounded-full bg-[#F4C430] blur-[160px] opacity-[0.05] pointer-events-none" />

      <motion.div
        className="relative max-w-6xl mx-auto px-6 lg:px-8"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={container}
      >
        {/* Asymmetric split: sticky intro (4/12) + step spec-sheet (8/12) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">

          {/* Left: intro, sticky on desktop */}
          <motion.div variants={item} className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#F4C430]/55 mb-4">
                The Process
              </p>
              <h2 className="text-3xl md:text-4xl font-manrope mb-4 leading-[1.1] tracking-[-0.02em]">
                <span className="font-light text-white/80">From day 1 to</span>{" "}
                <span className="font-extrabold text-[#F4C430]">peak you.</span>
              </h2>
              <p className="text-base text-[#F8F4E3]/55 leading-relaxed mb-8">
                A real 90-day coaching system. Not just a one-time scan.
              </p>
              <a
                href="#waitlist"
                className="inline-flex items-center gap-2 text-[#F4C430] font-semibold text-sm hover:gap-3 transition-all duration-300 focus-gold"
              >
                Join the Waitlist
                <ArrowRight size={15} />
              </a>
            </div>
          </motion.div>

          {/* Right: steps as a vertical spec-sheet, not a card grid */}
          <div className="lg:col-span-8 divide-y divide-white/[0.08] border-t border-b border-white/[0.08]">
            {steps.map(({ number, Icon, title, description, tag }, i) => (
              <motion.div
                key={i}
                variants={item}
                className="group flex flex-col sm:flex-row gap-5 sm:gap-8 py-8 hover:bg-[#F4C430]/[0.02] transition-colors duration-300 -mx-4 px-4"
              >
                {/* Number + icon */}
                <div className="flex items-center gap-4 sm:flex-col sm:items-start sm:w-16 flex-shrink-0">
                  <span className="font-manrope font-extrabold text-3xl text-[#F4C430]/25 group-hover:text-[#F4C430]/40 transition-colors duration-300">
                    {number}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-[#F4C430]/10 border border-[#F4C430]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#F4C430]/15 group-hover:border-[#F4C430]/35 transition-all duration-300">
                    <Icon size={18} className="text-[#F4C430]" />
                  </div>
                </div>

                {/* Copy */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl md:text-2xl font-manrope font-bold text-white">
                      {title}
                    </h3>
                    <span className="bg-[#F4C430]/10 text-[#F4C430]/80 text-xs uppercase tracking-wider px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  </div>
                  <p className="text-[#F8F4E3]/55 text-sm md:text-base leading-relaxed max-w-lg">
                    {description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
