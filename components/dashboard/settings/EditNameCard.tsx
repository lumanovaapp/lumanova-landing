"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import SettingsCard from "./SettingsCard";
import SaveStatus, { SaveState } from "./SaveStatus";

interface EditNameCardProps {
  userId: string;
  initialFullName: string;
  delay?: number;
}

const inputClass =
  "focus-gold w-full h-12 rounded-xl bg-white/[0.07] border border-white/[0.18] text-cream-ivory text-base placeholder:text-cream-ivory/30 px-4 focus:outline-none focus:border-lumen-gold/50 focus:bg-white/[0.10] transition-all duration-300";

export default function EditNameCard({ userId, initialFullName, delay = 0 }: EditNameCardProps) {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState(initialFullName);
  const [savedName, setSavedName] = useState(initialFullName);
  const [status, setStatus] = useState<SaveState>("idle");

  const trimmed = fullName.trim();
  const dirty = trimmed !== savedName.trim();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!dirty || !trimmed) return;

    setStatus("saving");

    const { error: updateError } = await supabase
      .from("users")
      .update({ full_name: trimmed, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (updateError) {
      setStatus("error");
      return;
    }

    setSavedName(trimmed);
    setStatus("saved");
    router.refresh();
  }

  return (
    <SettingsCard delay={delay}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-lumen-gold/10 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-lumen-gold" />
        </div>
        <h3 className="font-manrope font-semibold text-cream-ivory">Display name</h3>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3" noValidate>
        <input
          type="text"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (status !== "idle") setStatus("idle");
          }}
          placeholder="Your name"
          maxLength={80}
          className={inputClass}
        />
        <motion.button
          type="submit"
          disabled={!dirty || !trimmed || status === "saving"}
          whileTap={dirty ? { scale: 0.96 } : undefined}
          className="focus-gold h-12 px-6 rounded-full bg-lumen-gold text-pure-black font-manrope font-bold text-sm hover:bg-lumen-gold/90 hover:shadow-[0_0_24px_rgba(244,196,48,0.35)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:bg-lumen-gold flex-shrink-0"
        >
          {status === "saving" ? "Saving…" : "Save"}
        </motion.button>
      </form>
      <SaveStatus state={status} className="mt-3" />
    </SettingsCard>
  );
}
