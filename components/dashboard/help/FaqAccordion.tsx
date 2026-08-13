"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export interface FaqEntry {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqEntry[];
}

// Fast, subtle scroll-in for the list — a few key elements, once, never the
// whole page (see visual-craft.md motion guidance).
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const row = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function FaqAccordion({ items }: FaqAccordionProps) {
  const reduceMotion = !!useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={container}
      className="divide-y divide-white/[0.08] rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.02] shadow-[0_2px_4px_rgba(0,0,0,.3),0_16px_32px_rgba(0,0,0,.35)] overflow-hidden"
    >
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <motion.div key={item.question} variants={row}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 text-left px-5 sm:px-6 py-5 hover:bg-white/[0.03] transition-colors duration-200 focus-gold"
            >
              <span className="text-sm sm:text-[15px] font-medium text-cream-ivory">
                {item.question}
              </span>
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-lumen-gold/10 flex items-center justify-center">
                <ChevronDown
                  className={`w-4 h-4 text-lumen-gold transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0.1 : 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className="px-5 sm:px-6 pb-5 text-sm text-cream-ivory/60 leading-relaxed">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
