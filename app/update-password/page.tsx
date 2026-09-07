"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import AuthLogo from "@/components/auth/AuthLogo";
import PasswordInput from "@/components/auth/PasswordInput";

const MIN_PASSWORD_LENGTH = 8;

const inputClass =
  "w-full h-14 rounded-xl bg-white/5 border border-white/10 text-cream-ivory text-base placeholder:text-cream-ivory/40 px-4 focus:outline-none focus:border-lumen-gold transition-colors";

type SessionState = "checking" | "ready" | "invalid";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [sessionState, setSessionState] = useState<SessionState>("checking");
  const [invalidMessage, setInvalidMessage] = useState(
    "This password reset link is invalid or has already been used. Request a new one to continue."
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // The reset email points straight at this page with either a PKCE `?code=`
  // or (rarely) an implicit `#access_token=` fragment. The Supabase browser
  // client (created above via createClient/createBrowserClient) has
  // `detectSessionInUrl: true` by default and *automatically* detects and
  // exchanges whichever one is present as soon as it's constructed — before
  // any of our own code runs. `getUser()` internally awaits that exact
  // process, so calling it is enough to know, definitively, whether a
  // session was established; no manual exchangeCodeForSession() needed here.
  //
  // The one thing the SDK's auto-exchange does NOT surface clearly is a
  // failed verification on Supabase's side (e.g. an already-used or expired
  // link) — Supabase appends `error`/`error_code`/`error_description` to the
  // redirect instead of a code, and after a failed exchange getUser() would
  // just report "no session" with a generic reason. We check for those
  // params ourselves first so an expired link shows Supabase's real reason
  // (e.g. "Email link is invalid or has expired") rather than a vague one.
  useEffect(() => {
    let cancelled = false;

    function readUrlParams(): URLSearchParams {
      const hash = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash;
      const merged = new URLSearchParams(window.location.search);
      new URLSearchParams(hash).forEach((value, key) => merged.set(key, value));
      return merged;
    }

    const params = readUrlParams();
    const urlError = params.get("error") || params.get("error_code");

    if (urlError) {
      const description = params.get("error_description");
      setInvalidMessage(
        description
          ? decodeURIComponent(description.replace(/\+/g, " "))
          : "This password reset link is invalid or has expired."
      );
      setSessionState("invalid");
      return;
    }

    supabase.auth.getUser().then(({ data, error }) => {
      if (cancelled) return;
      setSessionState(error || !data.user ? "invalid" : "ready");
    });

    // Belt-and-suspenders: also pick up the PASSWORD_RECOVERY event in case
    // the session finishes establishing just after the initial check above.
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setSessionState("ready");
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");

    if (password.length < MIN_PASSWORD_LENGTH) {
      setFieldError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setFieldError("Passwords don't match.");
      return;
    }
    setFieldError("");

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setLoading(false);
      setFormError(error.message);
      return;
    }

    // Sign the recovery session out — the reset link may have been opened
    // from a shared inbox/device, so we don't leave it signed in. The user
    // logs back in fresh with the new password.
    await supabase.auth.signOut();
    setDone(true);
    setTimeout(() => router.push("/login?reset=success"), 1500);
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

        {sessionState === "checking" && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-cream-ivory/50 animate-spin" />
          </div>
        )}

        {sessionState === "invalid" && (
          <>
            <h1 className="font-manrope font-bold text-[32px] sm:text-[40px] text-cream-ivory text-center leading-tight">
              Link expired.
            </h1>
            <p className="font-inter text-base text-cream-ivory/70 text-center mt-3 mb-8">
              {invalidMessage}
            </p>
            <Link
              href="/forgot-password"
              className="block mt-2 h-14 w-full text-center leading-[3.5rem] rounded-2xl bg-lumen-gold text-pure-black font-manrope font-bold text-base hover:shadow-[0_0_28px_rgba(244,196,48,0.45)] transition-shadow duration-300"
            >
              Request a new link
            </Link>
          </>
        )}

        {sessionState === "ready" && done && (
          <>
            <h1 className="font-manrope font-bold text-[32px] sm:text-[40px] text-cream-ivory text-center leading-tight">
              Password updated.
            </h1>
            <p className="font-inter text-base text-cream-ivory/70 text-center mt-3">
              Taking you to log in…
            </p>
          </>
        )}

        {sessionState === "ready" && !done && (
          <>
            <h1 className="font-manrope font-bold text-[32px] sm:text-[40px] text-cream-ivory text-center leading-tight">
              Set a new password.
            </h1>
            <p className="font-inter text-base text-cream-ivory/70 text-center mt-3 mb-8">
              Choose something you haven&apos;t used before.
            </p>

            {formError && (
              <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <div>
                <PasswordInput
                  autoFocus
                  autoComplete="new-password"
                  placeholder="New password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldError) setFieldError("");
                  }}
                  className={`${inputClass} pr-12`}
                />
              </div>

              <div>
                <PasswordInput
                  autoComplete="new-password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldError) setFieldError("");
                  }}
                  className={`${inputClass} pr-12`}
                />
                {fieldError && <p className="mt-1.5 text-sm text-red-400">{fieldError}</p>}
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                className="mt-2 h-14 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-lumen-gold text-pure-black font-manrope font-bold text-base hover:shadow-[0_0_28px_rgba(244,196,48,0.45)] transition-shadow duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {loading ? "Updating…" : "Update password"}
              </motion.button>
            </form>
          </>
        )}
      </motion.div>
    </main>
  );
}
