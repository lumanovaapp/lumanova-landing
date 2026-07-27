"use client";

import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

const ratingItems = [
  "Judge your face with a score (5.1/10)",
  "Built on Eurocentric beauty standards",
  "Push you toward expensive surgery",
  "Track 100+ metrics but no daily plan",
  "Feed obsession over millimeters",
  "Leave you anxious about your looks",
];

const lumanovaItems = [
  "Coach you through a 90-day plan",
  "Multi-ethnic AI built for every face",
  "Focus on sustainable self-care habits",
  "Simple daily actions you can actually do",
  "Build real confidence through progress",
  "Track how you feel, not just how you look",
];

export default function WhyDifferent() {
  return (
    <motion.section
      className="bg-[#0A0A0A] py-24 md:py-32"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Section header */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-sm uppercase text-lumen-gold tracking-widest mb-4">
            The Difference
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-manrope font-bold text-white mb-4">
            Not another rating app.
          </h2>
          <p className="text-lg md:text-xl text-cream-ivory/70">
            Face-rating apps give you a number. Lumanova gives you a plan.
          </p>
        </div>

        {/* Comparison grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* LEFT: Rating Apps */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-6 md:p-10 rounded-2xl bg-black/40 border border-white/10"
          >
            <div className="flex items-center gap-2.5 mb-6 md:mb-8">
              <div className="bg-red-500/10 rounded-full p-1 flex-shrink-0">
                <X className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-lg md:text-xl uppercase font-bold tracking-wider text-white/40">
                Rating Apps
              </p>
            </div>
            <ul className="space-y-4">
              {ratingItems.map((text, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div className="bg-red-500/10 rounded-full p-1 mt-0.5 flex-shrink-0">
                    <X className="w-5 h-5 text-red-500" />
                  </div>
                  <span className="text-base md:text-lg text-white/60 leading-relaxed">
                    {text}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* RIGHT: Lumanova */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative p-6 md:p-10 rounded-2xl bg-black/40 border border-lumen-gold/30"
          >
            {/* Pulsing gold glow */}
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              animate={{
                boxShadow: [
                  "0 0 20px rgba(244,196,48,0.1)",
                  "0 0 40px rgba(244,196,48,0.2)",
                  "0 0 20px rgba(244,196,48,0.1)",
                ],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="flex items-center gap-2.5 mb-6 md:mb-8">
              <div className="bg-lumen-gold/10 rounded-full p-1 flex-shrink-0">
                <Check className="w-5 h-5 text-lumen-gold" />
              </div>
              <p className="text-lg md:text-xl uppercase font-bold tracking-wider text-lumen-gold">
                Lumanova
              </p>
            </div>
            <ul className="space-y-4">
              {lumanovaItems.map((text, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div className="bg-lumen-gold/10 rounded-full p-1 mt-0.5 flex-shrink-0">
                    <Check className="w-5 h-5 text-lumen-gold" />
                  </div>
                  <span className="text-base md:text-lg text-white leading-relaxed">
                    {text}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
