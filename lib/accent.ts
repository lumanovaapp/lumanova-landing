import { CategoryPriority } from "@/lib/types";

// Semantic accent palette shared across analysis, plan, and calendar surfaces.
// maintain = teal/mint (on track), refine = gold (in progress), focus = coral (needs attention).
export type Accent = CategoryPriority;

interface AccentTheme {
  text: string;
  border: string;
  bgSoft: string;
  bgSolid: string;
  solidText: string;
  ring: string;
}

export const ACCENT_THEME: Record<Accent, AccentTheme> = {
  maintain: {
    text: "text-aurora-mist",
    border: "border-aurora-mist/30",
    bgSoft: "bg-aurora-mist/10",
    bgSolid: "bg-aurora-mist",
    solidText: "text-pure-black",
    ring: "shadow-[0_0_0_3px_rgba(127,224,211,0.25)]",
  },
  refine: {
    text: "text-lumen-gold",
    border: "border-lumen-gold/30",
    bgSoft: "bg-lumen-gold/10",
    bgSolid: "bg-lumen-gold",
    solidText: "text-pure-black",
    ring: "shadow-[0_0_0_3px_rgba(244,196,48,0.25)]",
  },
  focus: {
    text: "text-warm-coral",
    border: "border-warm-coral/30",
    bgSoft: "bg-warm-coral/10",
    bgSolid: "bg-warm-coral",
    solidText: "text-white",
    ring: "shadow-[0_0_0_3px_rgba(255,111,89,0.25)]",
  },
};

export const ACCENT_LABELS: Record<Accent, string> = {
  maintain: "Maintaining Well",
  refine: "Refine",
  focus: "Focus Area",
};

// Cyclical order used to give each of the 3 fixed plan phases its own accent.
export const ACCENT_ORDER: Accent[] = ["maintain", "refine", "focus"];
