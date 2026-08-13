"use client";

import { AlertTriangle, Mail } from "lucide-react";
import { motion } from "framer-motion";
import SettingsCard from "./SettingsCard";

const SUPPORT_EMAIL = "support@lumanova.app";

interface DeleteAccountCardProps {
  email?: string;
  delay?: number;
}

// Account deletion isn't self-serve yet — the /api/account/delete route and
// its admin-privileged Supabase logic exist and are correct, but they depend
// on SUPABASE_SERVICE_ROLE_KEY being configured in the deployment
// environment, which isn't currently confirmed. Rather than show a "type
// DELETE" flow that can silently 500 and delete nothing, this routes to the
// same email flow the Help FAQ describes. Once the service-role key is
// verified in production, this can be swapped back to call that route
// directly (see git history for the previous self-serve implementation).
export default function DeleteAccountCard({ email, delay = 0 }: DeleteAccountCardProps) {
  const mailtoHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    "Delete my Lumanova account"
  )}&body=${encodeURIComponent(
    `Please delete my account and all associated data.${
      email ? `\n\nAccount email: ${email}` : ""
    }`
  )}`;

  return (
    <SettingsCard delay={delay} variant="danger">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-4 h-4 text-red-400" />
        </div>
        <h3 className="font-manrope font-semibold text-cream-ivory">Delete account</h3>
      </div>
      <p className="text-sm text-cream-ivory/60 ml-12 mb-4">
        We don&apos;t have self-serve deletion built yet. Email us and we&apos;ll
        permanently delete your photos, analysis, plan, streak, and chat history —
        this can&apos;t be undone.
      </p>

      <motion.a
        href={mailtoHref}
        whileTap={{ scale: 0.96 }}
        className="focus-gold ml-12 inline-flex items-center gap-2 h-11 px-5 rounded-full border border-red-500/30 text-red-400 font-manrope font-medium text-sm hover:bg-red-500/10 hover:border-red-500/50 transition-colors duration-300"
      >
        <Mail className="w-4 h-4" />
        Email us to delete my account
      </motion.a>
    </SettingsCard>
  );
}
