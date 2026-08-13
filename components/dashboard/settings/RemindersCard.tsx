"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Clock } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import SettingsCard from "./SettingsCard";
import SaveStatus, { SaveState } from "./SaveStatus";
import Toggle from "./Toggle";

interface RemindersCardProps {
  userId: string;
  initialReminderEnabled: boolean;
  initialReminderTime: string;
  delay?: number;
}

const SAVE_DEBOUNCE_MS = 500;

export default function RemindersCard({
  userId,
  initialReminderEnabled,
  initialReminderTime,
  delay = 0,
}: RemindersCardProps) {
  const supabase = createClient();

  const [enabled, setEnabled] = useState(initialReminderEnabled);
  const [time, setTime] = useState(initialReminderTime.slice(0, 5));
  const [status, setStatus] = useState<SaveState>("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => clearTimeout(saveTimer.current);
  }, []);

  function persist(patch: { reminder_enabled?: boolean; reminder_time?: string }) {
    clearTimeout(saveTimer.current);
    setStatus("saving");
    saveTimer.current = setTimeout(async () => {
      const { error } = await supabase
        .from("users")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", userId);
      setStatus(error ? "error" : "saved");
    }, SAVE_DEBOUNCE_MS);
  }

  function handleToggle(next: boolean) {
    setEnabled(next);
    persist({ reminder_enabled: next });
  }

  function handleTimeChange(next: string) {
    if (!next) return;
    setTime(next);
    persist({ reminder_time: next });
  }

  return (
    <SettingsCard delay={delay}>
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 rounded-xl bg-lumen-gold/10 flex items-center justify-center flex-shrink-0">
          <Bell className="w-4 h-4 text-lumen-gold" />
        </div>
        <h3 className="font-manrope font-semibold text-cream-ivory">Daily reminder</h3>
      </div>
      <p className="text-sm text-cream-ivory/50 ml-12 mb-5">
        We&apos;ll remind you to keep your streak alive.
      </p>

      <div className="ml-12 flex flex-col gap-1">
        <div className="flex items-center justify-between gap-4 -mx-2 px-2 h-12 rounded-xl hover:bg-white/[0.04] transition-colors">
          <span className="text-sm text-cream-ivory">Remind me daily</span>
          <Toggle checked={enabled} onChange={handleToggle} label="Daily reminder" />
        </div>

        <div
          className={`flex items-center justify-between gap-4 -mx-2 px-2 h-12 rounded-xl transition-colors ${
            enabled ? "hover:bg-white/[0.04]" : ""
          }`}
        >
          <span className={`text-sm ${enabled ? "text-cream-ivory" : "text-cream-ivory/30"}`}>
            Reminder time
          </span>

          <label
            className={`relative flex items-center gap-2 h-11 pl-3 pr-4 rounded-full border transition-all duration-300 ${
              enabled
                ? "border-white/[0.18] bg-white/[0.07] hover:border-lumen-gold/50 focus-within:border-lumen-gold/50 focus-within:bg-white/[0.10] cursor-pointer"
                : "border-white/5 bg-white/[0.02] cursor-not-allowed"
            }`}
          >
            <Clock
              className={`w-4 h-4 flex-shrink-0 ${
                enabled ? "text-lumen-gold" : "text-cream-ivory/20"
              }`}
            />
            <input
              type="time"
              value={time}
              disabled={!enabled}
              onChange={(e) => handleTimeChange(e.target.value)}
              className={`focus-gold relative bg-transparent text-sm font-medium tabular-nums focus:outline-none disabled:cursor-not-allowed [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 ${
                enabled ? "text-cream-ivory" : "text-cream-ivory/30"
              }`}
            />
          </label>
        </div>

        <SaveStatus state={status} className="mt-2" />
      </div>
    </SettingsCard>
  );
}
