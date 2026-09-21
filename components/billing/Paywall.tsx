"use client";

import { motion, useReducedMotion, Variants } from "framer-motion";
import { Lock, Sparkles, MessageCircle, TrendingUp, LucideIcon } from "lucide-react";
import PricingCards from "./PricingCards";

interface PaywallProps {
  title?: string;
  description?: string;
}

const UNLOCKS: { icon: LucideIcon; label: string }[] = [
  { icon: Sparkles, label: "Personalized 90-day plan" },
  { icon: MessageCircle, label: "AI grooming & style coach" },
  { icon: TrendingUp, label: "Progress & milestone comparisons" },
];

// The upgrade moment gets a deliberate entrance rather than a hard pop: the
// card rises and settles (~280ms on the house easing curve), then its
// contents resolve a beat behind it. Anything longer starts to feel like a
// loading state instead of a reveal.
const CARD_DURATION = 0.28;
const EASE = [0.16, 1, 0.3, 1] as const;

// The shared "you've hit the free wall" card. It's the primary surface of
// the plan page for a free user (that's where the flow deliberately lands
// them — see components/AnalysisReveal.tsx's CTA), and it stands in for the
// coach/upload pages once Pro access has lapsed. Client-side only for the
// entrance animation; it holds no state and makes no gating decision of its
// own — every caller has already resolved isPro() on the server.
export default function Paywall({ title, description }: PaywallProps) {
  const reduceMotion = !!useReducedMotion();

  // With reduced motion the card is simply present — no transform, no
  // fade-up, no stagger. Zero-duration variants keep one code path instead
  // of branching the whole tree.
  const card: Variants = {
    hidden: reduceMotion
      ? { opacity: 1 }
      : { opacity: 0, y: 24, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: reduceMotion
        ? { duration: 0 }
        : {
            duration: CARD_DURATION,
            ease: EASE,
            when: "beforeChildren",
            staggerChildren: 0.05,
          },
    },
  };

  const child: Variants = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: reduceMotion ? { duration: 0 } : { duration: 0.26, ease: EASE },
    },
  };

  return (
    <motion.div
      variants={card}
      initial="hidden"
      animate="visible"
      className="mt-10 rounded-3xl border border-lumen-gold/20 bg-gradient-to-br from-lumen-gold/[0.07] to-lumen-gold/[0.02] p-8 sm:p-10 shadow-[0_2px_4px_rgba(0,0,0,.3),0_24px_48px_rgba(0,0,0,.35)]"
    >
      <div className="max-w-xl mx-auto text-center">
        <motion.div
          variants={child}
          className="w-14 h-14 mx-auto rounded-2xl bg-lumen-gold/10 border border-lumen-gold/20 flex items-center justify-center mb-5"
        >
          <Lock className="w-6 h-6 text-lumen-gold" />
        </motion.div>
        <motion.h2
          variants={child}
          className="font-manrope font-bold text-xl sm:text-2xl text-cream-ivory"
        >
          {title ?? "Unlock your personalized 90-day plan"}
        </motion.h2>
        <motion.p
          variants={child}
          className="mt-2.5 text-sm sm:text-base text-cream-ivory/60 leading-relaxed"
        >
          {description ??
            "Your AI coach and progress tracking are waiting — upgrade to Pro to unlock everything beyond your analysis."}
        </motion.p>

        <motion.div variants={child} className="mt-5 flex flex-wrap justify-center gap-2">
          {UNLOCKS.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] text-cream-ivory/70 px-3 py-1.5 rounded-full text-xs font-medium"
            >
              <Icon className="w-3.5 h-3.5 text-lumen-gold" />
              {label}
            </span>
          ))}
        </motion.div>
      </div>

      <motion.div variants={child} className="mt-8">
        <PricingCards compact />
      </motion.div>
    </motion.div>
  );
}
