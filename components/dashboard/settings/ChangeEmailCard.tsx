"use client";

import { useState, FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import SettingsCard from "./SettingsCard";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  "w-full h-12 rounded-xl bg-white/5 border border-white/10 text-cream-ivory text-base placeholder:text-cream-ivory/40 px-4 focus:outline-none focus:border-lumen-gold transition-colors";

interface ChangeEmailCardProps {
  currentEmail: string;
  delay?: number;
}

export default function ChangeEmailCard({ currentEmail, delay = 0 }: ChangeEmailCardProps) {
  const supabase = createClient();

  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);

  const canSubmit = newEmail.length > 0 && confirmEmail.length > 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSent(false);

    const normalized = newEmail.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalized)) {
      setError("Enter a valid email address.");
      return;
    }
    if (normalized === currentEmail.trim().toLowerCase()) {
      setError("That's already your current email.");
      return;
    }
    if (normalized !== confirmEmail.trim().toLowerCase()) {
      setError("Emails don't match.");
      return;
    }

    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({
      email: normalized,
    });
    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setNewEmail("");
    setConfirmEmail("");
    setSent(true);
  }

  return (
    <SettingsCard delay={delay}>
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 rounded-xl bg-lumen-gold/10 flex items-center justify-center flex-shrink-0">
          <Mail className="w-4 h-4 text-lumen-gold" />
        </div>
        <h3 className="font-manrope font-semibold text-cream-ivory">Change email</h3>
      </div>
      <p className="text-sm text-cream-ivory/50 ml-12 mb-4">
        Current: {currentEmail}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
        <input
          type="email"
          autoComplete="email"
          placeholder="New email"
          value={newEmail}
          onChange={(e) => {
            setNewEmail(e.target.value);
            setError("");
            setSent(false);
          }}
          className={inputClass}
        />
        <input
          type="email"
          autoComplete="email"
          placeholder="Confirm new email"
          value={confirmEmail}
          onChange={(e) => {
            setConfirmEmail(e.target.value);
            setError("");
            setSent(false);
          }}
          className={inputClass}
        />
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              key="error"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm text-red-400"
            >
              {error}
            </motion.p>
          )}
          {sent && (
            <motion.p
              key="sent"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm text-lumen-gold"
            >
              Check both your old and new inbox to confirm the change.
            </motion.p>
          )}
        </AnimatePresence>
        <motion.button
          type="submit"
          disabled={!canSubmit || saving}
          whileTap={canSubmit ? { scale: 0.96 } : undefined}
          className="h-12 px-6 rounded-xl bg-lumen-gold text-pure-black font-manrope font-bold text-sm self-start hover:shadow-[0_0_28px_rgba(244,196,48,0.45)] transition-shadow duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          {saving ? "Sending…" : "Update email"}
        </motion.button>
      </form>
    </SettingsCard>
  );
}
