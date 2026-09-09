"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Clock, Globe } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { detectTimezone, formatTimezoneLabel, listTimezones } from "@/lib/timezones";
import SettingsCard from "./SettingsCard";
import SaveStatus, { SaveState } from "./SaveStatus";
import Toggle from "./Toggle";

interface RemindersCardProps {
  userId: string;
  initialReminderEnabled: boolean;
  initialReminderTime: string;
  initialTimezone: string;
  delay?: number;
}

const SAVE_DEBOUNCE_MS = 500;

// Computed once per module load, not per render — Intl.supportedValuesOf +
// sort is unnecessary work to repeat on every keystroke elsewhere on the page.
const TIMEZONES = listTimezones();

export default function RemindersCard({
  userId,
  initialReminderEnabled,
  initialReminderTime,
  initialTimezone,
  delay = 0,
}: RemindersCardProps) {
  const supabase = createClient();

  const [enabled, setEnabled] = useState(initialReminderEnabled);
  const [time, setTime] = useState(initialReminderTime.slice(0, 5));
  const [timezone, setTimezone] = useState(initialTimezone);
  const [status, setStatus] = useState<SaveState>("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  // If the browser's current timezone differs from what's stored (the user
  // traveled, moved, or signed up before this existed), offer to update
  // rather than silently keeping reminders on the old clock.
  const [detected, setDetected] = useState<string | null>(null);
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);

  useEffect(() => {
    const browserTz = detectTimezone();
    if (browserTz && browserTz !== initialTimezone) setDetected(browserTz);
    // Only check once on mount against the value loaded from the database —
    // re-running this after a save would immediately re-suggest the zone
    // the user just moved away from.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => clearTimeout(saveTimer.current);
  }, []);

  function persist(patch: {
    reminder_enabled?: boolean;
    reminder_time?: string;
    timezone?: string;
  }) {
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

  function handleTimezoneChange(next: string) {
    if (!next) return;
    setTimezone(next);
    persist({ timezone: next });
  }

  function acceptDetectedTimezone() {
    if (!detected) return;
    handleTimezoneChange(detected);
    setSuggestionDismissed(true);
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
        We&apos;ll remind you to keep your streak alive, at your local time.
      </p>

      {detected && !suggestionDismissed && (
        <div className="ml-12 mb-4 flex items-start gap-3 rounded-xl border border-lumen-gold/25 bg-lumen-gold/[0.06] px-3 py-2.5">
          <Globe className="w-4 h-4 text-lumen-gold flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-cream-ivory/80 leading-snug">
              Looks like you&apos;re now in <span className="font-medium">{detected}</span>.
              Update your reminder timezone?
            </p>
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={acceptDetectedTimezone}
                className="text-xs font-semibold text-lumen-gold hover:underline"
              >
                Update
              </button>
              <button
                type="button"
                onClick={() => setSuggestionDismissed(true)}
                className="text-xs font-medium text-cream-ivory/50 hover:text-cream-ivory/80"
              >
                Keep {timezone}
              </button>
            </div>
          </div>
        </div>
      )}

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

        <div
          className={`flex items-center justify-between gap-4 -mx-2 px-2 h-12 rounded-xl transition-colors ${
            enabled ? "hover:bg-white/[0.04]" : ""
          }`}
        >
          <span className={`text-sm ${enabled ? "text-cream-ivory" : "text-cream-ivory/30"}`}>
            Timezone
          </span>

          <label
            className={`relative flex items-center gap-2 h-11 pl-3 pr-4 rounded-full border transition-all duration-300 max-w-[220px] ${
              enabled
                ? "border-white/[0.18] bg-white/[0.07] hover:border-lumen-gold/50 focus-within:border-lumen-gold/50 focus-within:bg-white/[0.10] cursor-pointer"
                : "border-white/5 bg-white/[0.02] cursor-not-allowed"
            }`}
          >
            <Globe
              className={`w-4 h-4 flex-shrink-0 ${
                enabled ? "text-lumen-gold" : "text-cream-ivory/20"
              }`}
            />
            <select
              value={timezone}
              disabled={!enabled}
              onChange={(e) => handleTimezoneChange(e.target.value)}
              className={`focus-gold w-full bg-transparent text-sm font-medium focus:outline-none disabled:cursor-not-allowed truncate ${
                enabled ? "text-cream-ivory" : "text-cream-ivory/30"
              }`}
            >
              {!TIMEZONES.includes(timezone) && (
                <option value={timezone}>{formatTimezoneLabel(timezone)}</option>
              )}
              {TIMEZONES.map((zone) => (
                <option key={zone} value={zone}>
                  {formatTimezoneLabel(zone)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <SaveStatus state={status} className="mt-2" />
      </div>
    </SettingsCard>
  );
}
