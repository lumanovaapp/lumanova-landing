"use client";

import { useEffect, useState } from "react";

// Reusable "how to" video library for habit cards. One video per grooming
// technique, matched to habits by keyword — NOT tied to any single plan or
// habit id, so it keeps working on plans generated before this feature
// existed and needs no changes when new plans are generated.
export type TechniqueKey =
  | "cleanse"
  | "moisturize"
  | "spf"
  | "cold-dunk"
  | "ice-facial"
  | "exfoliate"
  | "face-mask"
  | "gua-sha"
  | "beard-line"
  | "beard-oil"
  | "hair-oil"
  | "scalp-massage"
  | "curl-wash"
  | "shaving"
  | "posture"
  | "breathing"
  | "face-massage"
  | "hydration";

// Every technique's path is declared here even before the matching file
// exists in public/videos/techniques/ — useTechniqueVideo() below HEAD-checks
// the path at render time and hides the affordance entirely when the file
// is missing, so videos can be dropped in gradually without a code change.
export const TECHNIQUE_VIDEOS: Record<TechniqueKey, string> = {
  cleanse: "/videos/techniques/cleanse.mp4",
  moisturize: "/videos/techniques/moisturize.mp4",
  spf: "/videos/techniques/spf.mp4",
  "cold-dunk": "/videos/techniques/cold-dunk.mp4",
  "ice-facial": "/videos/techniques/ice-facial.mp4",
  exfoliate: "/videos/techniques/exfoliate.mp4",
  "face-mask": "/videos/techniques/face-mask.mp4",
  "gua-sha": "/videos/techniques/gua-sha.mp4",
  "beard-line": "/videos/techniques/beard-line.mp4",
  "beard-oil": "/videos/techniques/beard-oil.mp4",
  "hair-oil": "/videos/techniques/hair-oil.mp4",
  "scalp-massage": "/videos/techniques/scalp-massage.mp4",
  "curl-wash": "/videos/techniques/curl-wash.mp4",
  shaving: "/videos/techniques/shaving.mp4",
  posture: "/videos/techniques/posture.mp4",
  breathing: "/videos/techniques/breathing.mp4",
  "face-massage": "/videos/techniques/face-massage.mp4",
  hydration: "/videos/techniques/hydration.mp4",
};

export interface TechniqueMatchInput {
  label: string;
  detail?: string;
  category?: string;
  steps?: string[];
  why_it_works?: string;
}

interface TechniqueRule {
  technique: TechniqueKey;
  test: (text: string) => boolean;
}

// Checked in order, most specific first — e.g. "beard oil" must be caught
// before the generic beard-line rule, and "cleanse"/"moisturize" are last
// since those words show up incidentally inside other habits' detail text.
const RULES: TechniqueRule[] = [
  { technique: "beard-oil", test: (t) => /beard[\s-]*oil/.test(t) },
  {
    technique: "beard-line",
    test: (t) =>
      /beard/.test(t) &&
      /(line|neckline|trim|edge|shape|cheek\s*line)/.test(t),
  },
  {
    technique: "curl-wash",
    test: (t) => /scrunch/.test(t) || (/curl/.test(t) && /(wash|shampoo|condition|dry|style)/.test(t)),
  },
  { technique: "scalp-massage", test: (t) => /scalp/.test(t) },
  { technique: "hair-oil", test: (t) => /hair[\s-]*oil|oil.*\bhair\b/.test(t) },
  {
    technique: "cold-dunk",
    test: (t) =>
      /(cold\s*(water|shower|plunge|dunk)|ice\s*bath)/.test(t) && !/\bface\b|facial/.test(t),
  },
  { technique: "ice-facial", test: (t) => /ice/.test(t) && /(face|facial|cube|roll)/.test(t) },
  { technique: "spf", test: (t) => /\bspf\b|sunscreen|sun\s*protection/.test(t) },
  { technique: "exfoliate", test: (t) => /exfoliat/.test(t) },
  { technique: "face-mask", test: (t) => /(face|facial)\s*mask/.test(t) },
  { technique: "gua-sha", test: (t) => /gua[\s-]*sha/.test(t) },
  { technique: "shaving", test: (t) => /\b(shav\w*|razor)\b/.test(t) },
  { technique: "face-massage", test: (t) => /(face|facial)\s*massage/.test(t) },
  { technique: "moisturize", test: (t) => /moistur/.test(t) },
  { technique: "cleanse", test: (t) => /cleans|face\s*wash|wash.*\bface\b/.test(t) },
  { technique: "posture", test: (t) => /posture|shoulders\s*back|stand\s*tall/.test(t) },
  { technique: "breathing", test: (t) => /breath/.test(t) },
  { technique: "hydration", test: (t) => /hydrat|drink.*water|water\s*intake/.test(t) },
];

// Pure keyword matcher — works on any habit shape (title/category/detail),
// old or new plans alike. Returns the technique's video path, or null when
// nothing matches.
export function matchTechniqueVideo(habit: TechniqueMatchInput): string | null {
  const text = [habit.label, habit.detail, habit.why_it_works, ...(habit.steps ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  for (const rule of RULES) {
    if (rule.test(text)) {
      return TECHNIQUE_VIDEOS[rule.technique];
    }
  }
  return null;
}

// One HEAD check per path, shared across every habit card that matches the
// same technique (many habits across a plan map to e.g. "cleanse"), so
// re-rendering the routine never re-issues the same request.
const availabilityCache = new Map<string, Promise<boolean>>();

function checkVideoAvailable(path: string): Promise<boolean> {
  let cached = availabilityCache.get(path);
  if (!cached) {
    cached = fetch(path, { method: "HEAD" })
      .then((res) => res.ok)
      .catch(() => false);
    availabilityCache.set(path, cached);
  }
  return cached;
}

// Resolves a habit to its technique video, confirming the file actually
// exists in public/videos/techniques/ before exposing it — so the "Watch
// how" affordance never appears for a technique whose video hasn't been
// added yet.
export function useTechniqueVideo(habit: TechniqueMatchInput): {
  src: string | null;
  available: boolean;
} {
  const src = matchTechniqueVideo(habit);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    if (!src) {
      setAvailable(false);
      return;
    }
    let cancelled = false;
    checkVideoAvailable(src).then((ok) => {
      if (!cancelled) setAvailable(ok);
    });
    return () => {
      cancelled = true;
    };
  }, [src]);

  return { src: available ? src : null, available };
}
