"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import AuthLogo from "@/components/auth/AuthLogo";
import PasswordInput from "@/components/auth/PasswordInput";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormErrors {
  email?: string;
  password?: string;
}

const inputClass =
  "w-full h-14 rounded-xl bg-white/5 border border-white/10 text-cream-ivory text-base placeholder:text-cream-ivory/40 px-4 focus:outline-none focus:border-lumen-gold transition-colors";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const next: FormErrors = {};
    if (!email.trim()) next.email = "Email is required.";
    else if (!EMAIL_REGEX.test(email)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setFormError(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
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

        <h1 className="font-manrope font-bold text-[32px] sm:text-[40px] text-cream-ivory text-center leading-tight">
          Welcome back.
        </h1>
        <p className="font-inter text-base text-cream-ivory/70 text-center mt-3 mb-8">
          Continue your glow-up.
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
            {errors.email && (
              <p className="mt-1.5 text-sm text-red-400">{errors.email}</p>
            )}
          </div>

          <div>
            <PasswordInput
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} pr-12`}
            />
            {errors.password && (
              <p className="mt-1.5 text-sm text-red-400">{errors.password}</p>
            )}
          </div>

          <div className="flex justify-end -mt-1">
            <Link
              href="#"
              className="text-sm text-cream-ivory/60 hover:text-lumen-gold transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            className="mt-2 h-14 w-full rounded-2xl bg-lumen-gold text-pure-black font-manrope font-bold text-base hover:shadow-[0_0_28px_rgba(244,196,48,0.45)] transition-shadow duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Log In"}
          </motion.button>
        </form>

        <p className="text-center mt-6 text-sm text-cream-ivory/70">
          New here?{" "}
          <Link href="/signup" className="text-lumen-gold font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
