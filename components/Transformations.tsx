"use client";

import { motion } from "framer-motion";
import { Sparkles, Calendar } from "lucide-react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const cards = [
  {
    src: "/transformations/transform-01-arjun.mp4",
    avatarGradient: "from-[#F4C430] to-[#1A1A1A]",
    initial: "A",
    name: "Arjun, 22",
    location: "Mumbai, India 🇮🇳",
    focus: "Skincare + jawline",
    duration: "90 days",
  },
  {
    src: "/transformations/transform-02-mateo.mp4",
    avatarGradient: "from-[#D9A400] to-[#0A0A0A]",
    initial: "M",
    name: "Mateo, 25",
    location: "Mexico City 🇲🇽",
    focus: "Grooming + beard",
    duration: "90 days",
  },
] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function Transformations() {
  const reducedMotion = useReducedMotion();

  const handleScrollToHowItWorks = () => {
    document
      .getElementById("how-it-works")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="transformations" className="bg-[#0A0A0A] py-24 md:py-32">
      <motion.div
        className="max-w-7xl mx-auto px-6 lg:px-8"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={container}
      >
        {/* Header — left-aligned to break the centered rhythm */}
        <motion.div variants={item} className="max-w-2xl mb-16">
          <p className="text-sm font-semibold tracking-widest uppercase text-[#F4C430] mb-4">
            Real Transformations
          </p>
          <h2 className="text-5xl md:text-6xl font-manrope mb-5 leading-[1.05] tracking-[-0.02em]">
            <span className="font-light text-[#F8F4E3]/80">Watch the</span>{" "}
            <span className="font-extrabold text-[#F4C430]">glow-up.</span>
          </h2>
          <p className="text-lg text-[#F8F4E3]/70 leading-relaxed">
            Real results from 90-day coaching. No filters. No fake
            before/afters.
          </p>
        </motion.div>

        {/* Video grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cards.map(
            ({ src, avatarGradient, initial, name, location, focus, duration }, i) => (
              <motion.div
                key={i}
                variants={item}
                className="group rounded-3xl overflow-hidden bg-[#111111] border border-white/[0.08] hover:border-[#F4C430]/40 shadow-[0_2px_4px_rgba(0,0,0,.3),0_16px_32px_rgba(0,0,0,.4)] hover:shadow-[0_0_40px_rgba(244,196,48,0.12)] transition-all duration-500"
              >
                {/* Video */}
                <div className="relative">
                  <video
                    src={src}
                    autoPlay={!reducedMotion}
                    loop
                    muted
                    playsInline
                    controls={reducedMotion}
                    preload="metadata"
                    className="w-full aspect-[4/5] object-cover"
                  />
                  {/* Badge */}
                  <div className="absolute top-4 left-4 backdrop-blur-md bg-black/40 border border-[#F4C430]/30 rounded-full px-3 py-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#F4C430]">
                      Before → After
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-6">
                  {/* Row 1: Avatar + Name */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center flex-shrink-0`}
                    >
                      <span className="text-white font-manrope font-bold text-lg">
                        {initial}
                      </span>
                    </div>
                    <span className="font-manrope font-bold text-xl text-[#F8F4E3]">
                      {name}
                    </span>
                  </div>

                  {/* Row 2: Location */}
                  <p className="text-sm text-[#F8F4E3]/70 mt-2 pl-1">
                    {location}
                  </p>

                  {/* Row 3: Pill badges */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="inline-flex items-center gap-1.5 border border-[#F4C430]/30 text-[#F4C430] text-xs rounded-full px-3 py-1">
                      <Sparkles size={11} />
                      Focus: {focus}
                    </span>
                    <span className="inline-flex items-center gap-1.5 border border-[#F4C430]/30 text-[#F4C430] text-xs rounded-full px-3 py-1">
                      <Calendar size={11} />
                      {duration}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          )}
        </div>

        {/* Bottom CTA */}
        <motion.div variants={item} className="mt-16 text-center">
          <p className="font-manrope font-bold text-2xl md:text-3xl text-[#F8F4E3] mb-6">
            Your transformation is next.
          </p>
          <button
            onClick={handleScrollToHowItWorks}
            className="inline-flex items-center gap-2 border border-[#F4C430]/30 text-[#F8F4E3] rounded-full py-3 px-6 hover:bg-[#F4C430]/10 hover:border-[#F4C430]/60 transition-all duration-300 focus-gold"
          >
            See How Lumanova Works →
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}
