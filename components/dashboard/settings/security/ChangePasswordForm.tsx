"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Check } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import PasswordInput from "@/components/auth/PasswordInput";
import PasswordStrengthMeter from "@/components/auth/PasswordStrengthMeter";
import { passwordMeetsRequirements } from "@/lib/password-strength";
import SettingsCard from "../SettingsCard";

interface ChangePasswordFormProps {
  userId: string;
  userEmail: string;
}

const inputClass =
  "focus-gold w-full h-12 rounded-xl bg-white/[0.07] border border-white/[0.18] text-cream-ivory text-base placeholder:text-cream-ivory/30 px-4 pr-12 focus:outline-none focus:border-lumen-gold/50 focus:bg-white/[0.10] transition-all duration-300";

const labelClass = "block text-sm font-medium text-cream-ivory/70 mb-2";

type FormStatus = "idle" | "verifying" | "updating" | "success" | "error";

const REDIRECT_DELAY_MS = 1500;

export default function ChangePasswordForm({ userId, userEmail }: ChangePasswordFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const requirementsMet = passwordMeetsRequirements(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const busy = status === "verifying" || status === "updating";
  const canSubmit =
    currentPassword.length > 0 && requirementsMet && passwordsMatch && !busy && status !== "success";

  function clearErrorOnEdit() {
    if (status === "error") setStatus("idle");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setErrorMessage("");
    setStatus("verifying");

    // Supabase has no standalone "check this password without touching the
    // session" call — re-authenticating with signInWithPassword against the
    // user's own email IS the verification. This never logs the user out
    // either way: a wrong password errors before any session is touched,
    // and a correct one just re-establishes a session for the same account.
    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: currentPassword,
    });

    if (reauthError) {
      setErrorMessage("Current password is incorrect.");
      setStatus("error");
      return;
    }

    setStatus("updating");
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setErrorMessage(updateError.message);
      setStatus("error");
      return;
    }

    // Best-effort from here — the password itself already changed
    // successfully, so a failure in either of these two shouldn't be shown
    // to the user as if the whole operation failed.
    const changedAt = new Date().toISOString();
    try {
      await supabase
        .from("users")
        .update({ password_changed_at: changedAt, updated_at: changedAt })
        .eq("id", userId);
    } catch (err) {
      console.error("CHANGE PASSWORD: failed to record password_changed_at", err);
    }

    try {
      await fetch("/api/account/notify-password-changed", { method: "POST" });
    } catch (err) {
      console.error("CHANGE PASSWORD: failed to send notification email", err);
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setStatus("success");
    setTimeout(() => {
      router.push("/dashboard/settings/security");
      router.refresh();
    }, REDIRECT_DELAY_MS);
  }

  return (
    <SettingsCard>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-md" noValidate>
        <div>
          <label className={labelClass}>Current password</label>
          <PasswordInput
            autoComplete="current-password"
            placeholder="Current password"
            value={currentPassword}
            disabled={busy || status === "success"}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              clearErrorOnEdit();
            }}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>New password</label>
          <PasswordInput
            autoComplete="new-password"
            placeholder="New password"
            value={newPassword}
            disabled={busy || status === "success"}
            onChange={(e) => {
              setNewPassword(e.target.value);
              clearErrorOnEdit();
            }}
            className={inputClass}
          />
        </div>

        <PasswordStrengthMeter password={newPassword} />

        <div>
          <label className={labelClass}>Confirm new password</label>
          <PasswordInput
            autoComplete="new-password"
            placeholder="Confirm new password"
            value={confirmPassword}
            disabled={busy || status === "success"}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              clearErrorOnEdit();
            }}
            className={inputClass}
          />
          {confirmPassword.length > 0 && !passwordsMatch && (
            <p className="mt-1.5 text-xs text-red-400">Passwords don&apos;t match.</p>
          )}
        </div>

        {status === "error" && errorMessage && (
          <p className="text-sm text-red-400">{errorMessage}</p>
        )}

        {status === "success" && (
          <p className="flex items-center gap-1.5 text-sm font-medium text-lumen-gold">
            <Check className="w-4 h-4" />
            Password updated. Redirecting…
          </p>
        )}

        <motion.button
          type="submit"
          disabled={!canSubmit}
          whileTap={canSubmit ? { scale: 0.98 } : undefined}
          className="focus-gold h-12 px-6 rounded-full bg-lumen-gold text-pure-black font-manrope font-bold text-sm w-fit flex items-center gap-2 hover:bg-lumen-gold/90 hover:shadow-[0_0_24px_rgba(244,196,48,0.35)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:bg-lumen-gold"
        >
          {busy && <Loader2 className="w-4 h-4 animate-spin" />}
          {status === "verifying"
            ? "Verifying…"
            : status === "updating"
            ? "Updating…"
            : "Update Password"}
        </motion.button>
      </form>
    </SettingsCard>
  );
}
