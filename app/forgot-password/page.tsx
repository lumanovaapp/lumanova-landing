"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import AuthLogo from "@/components/auth/AuthLogo";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  "w-full h-14 rounded-xl bg-white/5 border border-white/10 text-cream-ivory text-base placeholder:text-cream-ivory/40 px-4 focus:outline-none focus:border-lumen-gold transition-colors";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!email.trim()) {
      setEmailError("Email is required.");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setEmailError("");

    // NEXT_PUBLIC_APP_URL is inlined at build time — if it's ever missing
    // from the build environment this falls back to the current origin
    // rather than silently sending Supabase a "undefined/update-password"
    // redirectTo (which Supabase can't match against its allow-list and
    // falls back to the bare Site URL for, dropping the reset code on the
    // landing page).
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${appUrl}/update-password`,
    });
    setLoading(false);

    // Supabase never reports "no account with that email" here — and neither
    // do we. Any outcome short of a hard failure (bad request, rate limit,
    // network) shows the same generic confirmation so the form can't be used
    // to enumerate registered emails.
    if (error && error.status !== undefined && error.status >= 500) {
      setFormError("Something went wrong. Please try again in a moment.");
      return;
    }

    setSent(true);
  }

  return (
    <main className="min-h-screen bg-pure-black flex items-center justify-center px-6 py-10 sm:px-10 [padding-top:max(2.5rem,env(safe-area-inset-top))] [padding-bottom:max(2.5rem,env(safe-area-inset-bottom))]">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[400px] sm:max-w-[500px]"
      >
        <AuthLogo />

        {sent ? (
          <>
            <h1 className="font-manrope font-bold text-[32px] sm:text-[40px] text-cream-ivory text-center leading-tight">
              Check your inbox.
            </h1>
            <p className="font-inter text-base text-cream-ivory/70 text-center mt-3 mb-8">
              If an account exists for <span className="text-cream-ivory">{email.trim()}</span>,
              we&apos;ve sent a link to reset your password. It expires shortly, so use it soon.
            </p>

            <p className="text-center text-sm text-cream-ivory/70">
              Didn&apos;t get it?{" "}
              <button
                type="button"
                onClick={() => setSent(false)}
                className="text-lumen-gold font-medium hover:underline"
              >
                Try again
              </button>
            </p>
          </>
        ) : (
          <>
            <h1 className="font-manrope font-bold text-[32px] sm:text-[40px] text-cream-ivory text-center leading-tight">
              Forgot password?
            </h1>
            <p className="font-inter text-base text-cream-ivory/70 text-center mt-3 mb-8">
              Enter your email and we&apos;ll send you a reset link.
            </p>

            {formError && (
              <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <div>
                <input
                  type="email"
                  autoFocus
                  autoComplete="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
                {emailError && <p className="mt-1.5 text-sm text-red-400">{emailError}</p>}
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                className="mt-2 h-14 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-lumen-gold text-pure-black font-manrope font-bold text-base hover:shadow-[0_0_28px_rgba(244,196,48,0.45)] transition-shadow duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {loading ? "Sending…" : "Send reset link"}
              </motion.button>
            </form>
          </>
        )}

        <p className="text-center mt-6 text-sm text-cream-ivory/70">
          Remembered your password?{" "}
          <Link href="/login" className="text-lumen-gold font-medium hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
