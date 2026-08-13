"use client";

import { motion } from "framer-motion";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label: string;
}

export default function Toggle({ checked, onChange, disabled, label }: ToggleProps) {
  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      whileTap={disabled ? undefined : { scale: 0.92 }}
      animate={{
        backgroundColor: checked ? "#F4C430" : "rgba(255,255,255,0.1)",
        boxShadow: checked ? "0 0 14px rgba(244,196,48,0.35)" : "0 0 0 rgba(244,196,48,0)",
      }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="focus-gold relative h-7 w-12 flex-shrink-0 rounded-full border border-white/10 outline-none disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <motion.span
        animate={{ x: checked ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className="absolute top-1 left-1 h-5 w-5 rounded-full bg-pure-black shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
      />
    </motion.button>
  );
}
