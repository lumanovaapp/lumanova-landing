"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Mail, ScrollText } from "lucide-react";
import SettingsCard from "./SettingsCard";

const SUPPORT_EMAIL = "support@lumanova.app";

interface AboutCardProps {
  appVersion: string;
  delay?: number;
}

const linkClass =
  "group flex items-center gap-3 h-11 -mx-2 px-2 rounded-xl text-sm text-cream-ivory/70 hover:bg-white/5 hover:text-cream-ivory transition-colors";

export default function AboutCard({ appVersion, delay = 0 }: AboutCardProps) {
  return (
    <SettingsCard delay={delay}>
      <div className="flex flex-col gap-1">
        <motion.div whileHover={{ x: 2 }}>
          <Link href="/privacy" className={linkClass}>
            <ScrollText className="w-4 h-4 text-cream-ivory/40 group-hover:text-lumen-gold transition-colors" />
            Privacy Policy
          </Link>
        </motion.div>
        <motion.div whileHover={{ x: 2 }}>
          <Link href="/terms" className={linkClass}>
            <FileText className="w-4 h-4 text-cream-ivory/40 group-hover:text-lumen-gold transition-colors" />
            Terms of Service
          </Link>
        </motion.div>
        <motion.div whileHover={{ x: 2 }}>
          <a href={`mailto:${SUPPORT_EMAIL}`} className={linkClass}>
            <Mail className="w-4 h-4 text-cream-ivory/40 group-hover:text-lumen-gold transition-colors" />
            {SUPPORT_EMAIL}
          </a>
        </motion.div>
        <p className="text-cream-ivory/30 text-xs mt-2 px-2">Version {appVersion}</p>
      </div>
    </SettingsCard>
  );
}
