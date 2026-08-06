"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { apiErrorFromJson, fetchWithTimeout, toFriendlyMessage } from "@/lib/api-error";
import SettingsCard from "./SettingsCard";

const CONFIRM_WORD = "DELETE";

interface DeleteAccountCardProps {
  delay?: number;
}

export default function DeleteAccountCard({ delay = 0 }: DeleteAccountCardProps) {
  const router = useRouter();
  const supabase = createClient();

  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  function closeModal() {
    if (deleting) return;
    setOpen(false);
    setConfirmText("");
    setError("");
  }

  async function handleDelete() {
    setDeleting(true);
    setError("");

    try {
      const response = await fetchWithTimeout("/api/account/delete", {
        method: "POST",
      });

      if (!response.ok) {
        throw await apiErrorFromJson(response, "Could not delete your account.");
      }

      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(toFriendlyMessage(err));
      setDeleting(false);
    }
  }

  return (
    <>
      <SettingsCard delay={delay} variant="danger">
        <p className="text-[10px] uppercase tracking-widest text-red-400/70 font-semibold mb-3">
          Danger zone
        </p>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <h3 className="font-manrope font-semibold text-cream-ivory">Delete account</h3>
        </div>
        <p className="text-sm text-cream-ivory/60 ml-12 mb-4">
          Permanently deletes your photos, analysis, plan, streak, and chat history. This
          can&apos;t be undone.
        </p>

        <motion.button
          type="button"
          onClick={() => setOpen(true)}
          whileTap={{ scale: 0.96 }}
          className="ml-12 h-11 px-5 rounded-xl border border-red-500/30 text-red-400 font-manrope font-medium text-sm hover:bg-red-500/10 hover:border-red-500/50 transition-colors"
        >
          Delete my account
        </motion.button>
      </SettingsCard>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-pure-black/80 backdrop-blur-sm"
            onClick={closeModal}
          />

          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-md rounded-3xl border border-red-500/30 bg-charcoal p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
              <AlertTriangle className="w-7 h-7 text-red-400" />
            </div>

            <h2
              id="delete-account-title"
              className="font-manrope font-bold text-xl text-cream-ivory text-center"
            >
              This is permanent
            </h2>
            <p className="font-inter text-sm text-cream-ivory/70 mt-2 mb-6 text-center leading-relaxed">
              Your account, photos, analysis, plan, and streak history will be deleted
              for good. Type{" "}
              <span className="font-mono font-bold text-red-400">{CONFIRM_WORD}</span>{" "}
              below to confirm.
            </p>

            <input
              type="text"
              autoFocus
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={CONFIRM_WORD}
              className="w-full h-12 rounded-xl bg-white/5 border border-white/10 text-cream-ivory text-center text-base tracking-widest placeholder:text-cream-ivory/30 px-4 focus:outline-none focus:border-red-400 transition-colors"
            />

            {error && (
              <p className="mt-3 text-sm text-red-400 text-center">{error}</p>
            )}

            <div className="mt-6 flex flex-col gap-3">
              <motion.button
                type="button"
                disabled={confirmText !== CONFIRM_WORD || deleting}
                onClick={handleDelete}
                whileTap={confirmText === CONFIRM_WORD ? { scale: 0.97 } : undefined}
                className="h-14 rounded-xl bg-red-500 text-white font-manrope font-bold flex items-center justify-center gap-2 hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-500"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {deleting ? "Deleting…" : "Permanently delete my account"}
              </motion.button>
              <motion.button
                type="button"
                onClick={closeModal}
                disabled={deleting}
                whileTap={{ scale: 0.97 }}
                className="h-12 rounded-xl border border-white/15 text-cream-ivory/70 font-manrope font-medium hover:bg-white/5 hover:text-cream-ivory transition-colors disabled:opacity-60"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
