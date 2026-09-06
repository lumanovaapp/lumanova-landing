"use client";

import { motion, useReducedMotion } from "framer-motion";

export interface WeekHeatmapDay {
  /** Short weekday label, e.g. "M". */
  label: string;
  /** True once every active habit was checked done that date. */
  done: boolean;
  /** False for dates before the plan existed, or later than today. */
  inRange: boolean;
  isToday: boolean;
}

interface WeekHeatmapProps {
  days: WeekHeatmapDay[];
  className?: string;
}

// Mini 7-day consistency strip — one bar per calendar day, tallest/gold when
// that day's habits were fully checked in. Deliberately just seven bars, not
// a full analytics chart, so it reads at a glance from the dashboard.
export default function WeekHeatmap({ days, className = "" }: WeekHeatmapProps) {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className={`flex items-end justify-between gap-2 ${className}`}>
      {days.map((day, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
          <div className="w-full h-10 rounded-md bg-white/[0.05] overflow-hidden flex items-end">
            <motion.div
              className={`w-full rounded-md ${
                day.done
                  ? "bg-gradient-to-t from-lumen-gold/70 to-lumen-gold"
                  : day.inRange
                  ? "bg-white/[0.10]"
                  : "bg-transparent"
              }`}
              initial={reduceMotion ? false : { height: 0 }}
              animate={{ height: day.inRange ? (day.done ? "100%" : "22%") : "0%" }}
              transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : i * 0.04, ease: "easeOut" }}
            />
          </div>
          <span
            className={`text-[10px] font-medium ${
              day.isToday ? "text-lumen-gold" : "text-cream-ivory/40"
            }`}
          >
            {day.label}
          </span>
        </div>
      ))}
    </div>
  );
}
