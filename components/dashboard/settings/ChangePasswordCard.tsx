"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { KeyRound } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import PasswordInput from "@/components/auth/PasswordInput";
import SettingsCard from "./SettingsCard";
import SaveStatus, { SaveState } from "./SaveStatus";

const MIN_PASSWORD_LENGTH = 8;

const inputClass =
  "focus-gold w-full h-12 rounded-xl bg-white/[0.07] border border-white/[0.18] text-cream-ivory text-base placeholder:text-cream-ivory/30 px-4 pr-12 focus:outline-none focus:border-lumen-gold/50 focus:bg-white/[0.10] transition-all duration-300";

interface ChangePasswordCardProps {
  delay?: number;
}

export default function ChangePasswordCard({ delay = 0 }: ChangePasswordCardProps) {
  const supabase = createClient();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const canSubmit = newPassword.length > 0 && confirmPassword.length > 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      setStatus("error");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords don't match.");
      setStatus("error");
      return;
    }

    setStatus("saving");
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setErrorMessage(updateError.message);
      setStatus("error");
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    setStatus("saved");
  }

  return (
    <SettingsCard delay={delay}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-lumen-gold/10 flex items-center justify-center flex-shrink-0">
          <KeyRound className="w-4 h-4 text-lumen-gold" />
        </div>
        <h3 className="font-manrope font-semibold text-cream-ivory">Change password</h3>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
        <PasswordInput
          autoComplete="new-password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            if (status !== "idle") setStatus("idle");
          }}
          className={inputClass}
        />
        <PasswordInput
          autoComplete="new-password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (status !== "idle") setStatus("idle");
          }}
          className={inputClass}
        />
        <div className="flex items-center gap-4">
          <motion.button
            type="submit"
            disabled={!canSubmit || status === "saving"}
            whileTap={canSubmit ? { scale: 0.96 } : undefined}
            className="focus-gold h-12 px-6 rounded-full bg-lumen-gold text-pure-black font-manrope font-bold text-sm flex-shrink-0 hover:bg-lumen-gold/90 hover:shadow-[0_0_24px_rgba(244,196,48,0.35)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:bg-lumen-gold"
          >
            {status === "saving" ? "Updating…" : "Update password"}
          </motion.button>
          <SaveStatus state={status} errorMessage={errorMessage} />
        </div>
      </form>
    </SettingsCard>
  );
}
