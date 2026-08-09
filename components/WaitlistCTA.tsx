"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { ArrowRight, Loader2, Star } from "lucide-react";
import { motion } from "framer-motion";
import SectionGlow from "@/components/SectionGlow";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function WaitlistCTA() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email.");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    console.log("Waitlist email:", email);

    toast.success("✨ You're on the list. We'll be in touch.", {
      duration: 5000,
    });
    setEmail("");
    setLoading(false);
  };

  return (
    <section
      id="waitlist"
      className="relative py-24 md:py-36 overflow-hidden"
    >
      {/* Layered near-black gradient, warm-tinted — gold is the only accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#161108] via-[#100C08] to-[#0A0A0A]" />

      {/* Gold glow center, gentle drift */}
      <SectionGlow
        className="top-1/2 left-1/2"
        color="rgba(244, 196, 48, 0.10)"
        size={600}
        drift={16}
        center
      />

      <motion.div
        className="relative max-w-2xl mx-auto px-6 text-center"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={container}
      >
        <motion.div variants={item} className="inline-flex items-center gap-2 border border-[#F4C430]/30 text-[#F4C430] text-[11px] font-semibold tracking-[0.18em] uppercase px-4 py-2 rounded-full bg-[#F4C430]/[0.06] mb-8">
          ✦ &nbsp;Limited Early Access
        </motion.div>

        <motion.h2 variants={item} className="text-4xl md:text-6xl font-manrope mb-5 leading-[1.05] tracking-[-0.02em]">
          <span className="font-light text-white/85">Be first to</span>{" "}
          <span className="font-extrabold bg-gradient-to-br from-[#F4C430] via-[#FFD874] to-[#D9A400] bg-clip-text text-transparent">glow.</span>
        </motion.h2>

        <motion.p variants={item} className="text-base md:text-lg text-[#F8F4E3]/55 mb-10 max-w-md mx-auto leading-relaxed">
          Join the waitlist. Get early access +{" "}
          <span className="text-[#F4C430] font-medium">a personalized 90-day glow-up plan</span>{" "}
          on launch day.
        </motion.p>

        <motion.form
          variants={item}
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 bg-white/[0.07] border border-white/[0.18] text-white placeholder:text-white/30 text-sm px-5 py-4 rounded-full focus:outline-none focus:border-[#F4C430]/50 focus:bg-white/[0.10] transition-all duration-300 min-w-0 focus-gold"
            disabled={loading}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 bg-[#F4C430] text-[#0A0A0A] font-bold text-sm px-7 py-4 rounded-full hover:bg-[#F4C430]/90 hover:shadow-[0_0_36px_rgba(244,196,48,0.45)] disabled:opacity-60 transition-all duration-300 active:scale-95 flex-shrink-0 whitespace-nowrap focus-gold"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                Join the Waitlist
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </motion.form>

        {/* Trust signal — mirrors the hero's proof strip so the final CTA
            closes the loop the opening moment promised (peak-end rule). */}
        <motion.div variants={item} className="mt-8 flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {["A", "M", "S", "D", "R"].map((initial, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full bg-[#141414] border-2 border-[#F4C430]/40 flex items-center justify-center flex-shrink-0"
                >
                  <span className="text-[9px] font-bold text-[#F4C430]/90">{initial}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={10} className="text-[#F4C430] fill-[#F4C430]" />
              ))}
            </div>
          </div>
          <p className="text-xs text-white/25">
            <span className="text-white/45 font-medium">500+ early users</span> · No spam,
            unsubscribe anytime.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
